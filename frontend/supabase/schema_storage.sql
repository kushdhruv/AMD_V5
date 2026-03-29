-- Create a public bucket for app assets (icons, splash screens, etc.)
insert into storage.buckets (id, name, public)
values ('app_assets', 'app_assets', true)
on conflict (id) do nothing;

-- Allow public read access to app_assets
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'app_assets' );

-- Allow authenticated users to upload to app_assets
create policy "Authenticated users can upload"
  on storage.objects for insert
  with check (
    bucket_id = 'app_assets'
    and auth.role() = 'authenticated'
  );

-- Allow users to update/delete their own uploads
create policy "Users can update their own uploads"
  on storage.objects for update
  using (
    bucket_id = 'app_assets'
    and auth.uid() = owner
  );

create policy "Users can delete their own uploads"
  on storage.objects for delete
  using (
    bucket_id = 'app_assets'
    and auth.uid() = owner
  );
