-- Add optional retailer references to listings. Prices stay empty for these
-- examples because overseas prices and delivery costs can change.
alter table public.catalog_products
  add column if not exists source_name text,
  add column if not exists product_url text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'catalog_products_product_url_https'
      and conrelid = 'public.catalog_products'::regclass
  ) then
    alter table public.catalog_products
      add constraint catalog_products_product_url_https
      check (product_url is null or product_url ~ '^https://');
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'catalog_products_source_name_length'
      and conrelid = 'public.catalog_products'::regclass
  ) then
    alter table public.catalog_products
      add constraint catalog_products_source_name_length
      check (source_name is null or char_length(source_name) <= 80);
  end if;
end
$$;

-- PostgreSQL cannot change a function's table return shape with CREATE OR
-- REPLACE, so recreate the RPC with retailer reference fields included.
drop function if exists public.search_catalog_products(text, integer);

create function public.search_catalog_products(search_query text, result_limit integer default 8)
returns table (
  id uuid,
  name text,
  slug text,
  description text,
  category text,
  image_url text,
  availability text,
  price_zmw numeric,
  source_name text,
  product_url text
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
    product.price_zmw,
    product.source_name,
    product.product_url
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

insert into public.catalog_products (
  slug, name, description, category, search_terms, image_url,
  availability, price_zmw, is_published, sort_order, source_name, product_url
)
values
  (
    'apple-airpods-pro-3',
    'Apple AirPods Pro 3',
    'Apple wireless earbuds with noise cancellation. Confirm the exact version and full delivered price with us.',
    'Phones & tech',
    array['Apple', 'AirPods', 'earbuds', 'wireless', 'Bluetooth', 'noise cancelling'],
    'https://www.apple.com/newsroom/images/2025/09/introducing-airpods-pro-3-the-ultimate-audio-experience/article/Apple-AirPods-Pro-3-hero-250909_inline.jpg.large.jpg',
    'source_to_order', null, true, 10, 'Apple',
    'https://www.apple.com/shop/buy-airpods/airpods-pro-3'
  ),
  (
    'nintendo-switch-2',
    'Nintendo Switch 2',
    'Nintendo Switch 2 gaming console. Ask us to confirm the package and full delivered price.',
    'Gaming',
    array['Nintendo', 'Switch', 'Switch 2', 'console', 'gaming', 'portable'],
    'https://assets.nintendo.com/image/upload/ar_16%3A9%2Cb_auto%3Aborder%2Cc_lpad/b_white/f_auto/q_auto/dpr_1.5/ncom/My%20Nintendo%20Store/EN-US/Nintendo%20Switch%202/Hardware/123669-nintendo-switch-2-package-front-2000x2000',
    'source_to_order', null, true, 20, 'Nintendo',
    'https://www.nintendo.com/us/store/products/nintendo-switch-2-system-123669/'
  ),
  (
    'nike-air-force-1-07-white-black',
    'Nike Air Force 1 07 - White/Black',
    'Classic white and black Nike sneakers. Tell us your shoe size and we will confirm the listing and full quote.',
    'Fashion & footwear',
    array['Nike', 'Air Force', 'AF1', 'shoes', 'sneakers', 'trainers', 'white', 'black'],
    'https://static.nike.com/a/images/t_PDP_144_v1/f_auto%2Cq_auto%3Aeco%2Cu_9ddf04c7-2a9a-4d76-add1-d15af8f0263d%2Cc_scale%2Cfl_relative%2Cw_1.0%2Ch_1.0%2Cfl_layer_apply/deec30c7-92b4-46c9-8a7f-39a73eccdffa/AIR%2BFORCE%2B1%2B%2707.png',
    'source_to_order', null, true, 30, 'Nike',
    'https://www.nike.com/t/air-force-1-07-mens-shoes-DZejrQoC/CT2302-100'
  ),
  (
    'soundcore-q20i-headphones',
    'soundcore Q20i Headphones',
    'Wireless over-ear headphones with noise cancelling. Tell us your preferred colour and we will confirm the full quote.',
    'Phones & tech',
    array['soundcore', 'Anker', 'Q20i', 'headphones', 'wireless', 'noise cancelling', 'Bluetooth'],
    'https://soundcoreusa.myshopify.com/cdn/shop/files/black.png',
    'source_to_order', null, true, 40, 'soundcore',
    'https://www.soundcore.com/eu/products/q20i-a3004g11?variant=42705710514352'
  )
on conflict (slug) do nothing;
