-- Fix storage policies to match actual bucket name (capital T)
drop policy if exists "anon_upload" on storage.objects;
drop policy if exists "public_download" on storage.objects;

create policy "anon_upload" on storage.objects for insert to anon with check (bucket_id = 'Translations');
create policy "public_download" on storage.objects for select to anon using (bucket_id = 'Translations');
