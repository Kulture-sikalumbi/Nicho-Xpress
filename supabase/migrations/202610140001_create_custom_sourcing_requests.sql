create table if not exists public.custom_sourcing_requests (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null
    check (char_length(btrim(customer_name)) between 2 and 80),
  item_request text not null
    check (char_length(btrim(item_request)) between 3 and 2000),
  phone text not null
    check (char_length(btrim(phone)) between 7 and 32),
  notes text
    check (notes is null or char_length(notes) <= 1200),
  status text not null default 'received'
    check (status in ('received', 'reviewing', 'quoted', 'approved', 'purchased', 'in_transit', 'ready', 'delivered', 'declined', 'cancelled')),
  created_at timestamptz not null default now()
);

alter table public.custom_sourcing_requests enable row level security;

-- Public visitors can submit a request, but cannot read, change, or delete any requests.
revoke all on table public.custom_sourcing_requests from anon, authenticated;
grant insert (customer_name, item_request, phone, notes)
  on table public.custom_sourcing_requests to anon;

drop policy if exists "Public can submit sourcing requests" on public.custom_sourcing_requests;
create policy "Public can submit sourcing requests"
  on public.custom_sourcing_requests
  for insert
  to anon
  with check (status = 'received');
