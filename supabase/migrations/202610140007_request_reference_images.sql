alter table public.custom_sourcing_requests
  add column if not exists image_path text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'custom_sourcing_requests_image_path_format'
      and conrelid = 'public.custom_sourcing_requests'::regclass
  ) then
    alter table public.custom_sourcing_requests
      add constraint custom_sourcing_requests_image_path_format
      check (
        image_path is null or image_path ~
        '^requests/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}[.](jpg|png|webp)$'
      );
  end if;
end
$$;

revoke all on table public.custom_sourcing_requests from anon;
grant insert (customer_name, item_request, phone, notes, image_path)
  on table public.custom_sourcing_requests to anon;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'nicho-xpress-request-images',
  'nicho-xpress-request-images',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set name = excluded.name,
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Visitors can upload sourcing reference photos" on storage.objects;
create policy "Visitors can upload sourcing reference photos"
  on storage.objects
  for insert
  to anon, authenticated
  with check (
    bucket_id = 'nicho-xpress-request-images'
    and name ~ '^requests/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}[.](jpg|png|webp)$'
  );

drop policy if exists "Nicho-Xpress staff can read sourcing reference photos" on storage.objects;
create policy "Nicho-Xpress staff can read sourcing reference photos"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'nicho-xpress-request-images'
    and (select public.is_nicho_xpress_staff())
  );
