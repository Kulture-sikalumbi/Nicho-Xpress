create table if not exists public.nicho_xpress_staff (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.nicho_xpress_staff enable row level security;
revoke all on table public.nicho_xpress_staff from anon, authenticated;

create or replace function public.is_nicho_xpress_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.nicho_xpress_staff
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_nicho_xpress_staff() from public, anon, authenticated;
grant execute on function public.is_nicho_xpress_staff() to authenticated;

grant select on table public.custom_sourcing_requests to authenticated;
grant update (status) on table public.custom_sourcing_requests to authenticated;

drop policy if exists "Nicho-Xpress staff can read requests" on public.custom_sourcing_requests;
create policy "Nicho-Xpress staff can read requests"
  on public.custom_sourcing_requests
  for select
  to authenticated
  using ((select public.is_nicho_xpress_staff()));

drop policy if exists "Nicho-Xpress staff can update request status" on public.custom_sourcing_requests;
create policy "Nicho-Xpress staff can update request status"
  on public.custom_sourcing_requests
  for update
  to authenticated
  using ((select public.is_nicho_xpress_staff()))
  with check ((select public.is_nicho_xpress_staff()));
