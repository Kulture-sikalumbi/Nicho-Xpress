-- array_to_string(anyarray, text) is STABLE because it can invoke the
-- element type's output function. Generated columns require IMMUTABLE calls,
-- so convert the text[] terms one entry at a time using the fixed simple config.
create or replace function public.catalog_search_terms_tsvector(terms text[])
returns tsvector
language plpgsql
immutable
parallel safe
set search_path = pg_catalog
as $$
declare
  term text;
  result tsvector := ''::tsvector;
begin
  foreach term in array coalesce(terms, array[]::text[]) loop
    if term is not null and term <> '' then
      result := result || to_tsvector('pg_catalog.simple'::regconfig, term);
    end if;
  end loop;

  return result;
end;
$$;

create table if not exists public.catalog_products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique
    check (char_length(btrim(slug)) between 2 and 120),
  name text not null
    check (char_length(btrim(name)) between 2 and 160),
  description text not null default ''
    check (char_length(description) <= 1200),
  category text not null
    check (char_length(btrim(category)) between 2 and 80),
  search_terms text[] not null default '{}',
  image_url text
    check (image_url is null or image_url ~ '^https://'),
  availability text not null default 'source_to_order'
    check (availability in ('in_zambia', 'source_to_order')),
  price_zmw numeric(12, 2)
    check (price_zmw is null or price_zmw >= 0),
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  search_document tsvector generated always as (
    setweight(to_tsvector('pg_catalog.simple'::regconfig, name), 'A') ||
    setweight(to_tsvector('pg_catalog.simple'::regconfig, category), 'B') ||
    setweight(public.catalog_search_terms_tsvector(search_terms), 'B') ||
    setweight(to_tsvector('pg_catalog.simple'::regconfig, description), 'C')
  ) stored
);

create index if not exists catalog_products_search_idx
  on public.catalog_products using gin (search_document);

alter table public.catalog_products enable row level security;
revoke all on table public.catalog_products from anon, authenticated;
grant select on table public.catalog_products to anon, authenticated;

drop policy if exists "Visitors can read published products" on public.catalog_products;
create policy "Visitors can read published products"
  on public.catalog_products
  for select
  to anon, authenticated
  using (is_published);

create or replace function public.search_catalog_products(search_query text, result_limit integer default 8)
returns table (
  id uuid,
  name text,
  slug text,
  description text,
  category text,
  image_url text,
  availability text,
  price_zmw numeric
)
language sql
stable
set search_path = public
as $$
  with requested_terms as (
    select coalesce(
      string_agg(plainto_tsquery('simple', term)::text, ' | '),
      ''
    )::tsquery as search_vector
    from unnest(regexp_split_to_array(search_query, '\s+')) as query_terms(term)
    where term <> ''
  )
  select
    product.id,
    product.name,
    product.slug,
    product.description,
    product.category,
    product.image_url,
    product.availability,
    product.price_zmw
  from public.catalog_products as product
  cross join requested_terms
  where product.is_published
    and requested_terms.search_vector <> ''::tsquery
    and product.search_document @@ requested_terms.search_vector
  order by
    ts_rank(product.search_document, requested_terms.search_vector) desc,
    product.sort_order asc,
    product.name asc
  limit least(greatest(coalesce(result_limit, 8), 1), 12);
$$;

revoke all on function public.search_catalog_products(text, integer) from public, anon, authenticated;
grant execute on function public.search_catalog_products(text, integer) to anon, authenticated;
