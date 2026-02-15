-- Create translations table for the live feed
create table if not exists translations (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  image_url text not null,
  format_type text not null default 'convo',
  voice_style text not null default 'funny',
  pet_name text,
  is_public boolean default true
);

create index if not exists idx_translations_recent on translations(created_at desc) where is_public = true;

-- Enable RLS
alter table translations enable row level security;

-- Allow anon inserts
create policy "anon_insert" on translations for insert to anon with check (true);

-- Allow public reads where is_public = true
create policy "public_read" on translations for select to anon using (is_public = true);

-- Storage: allow anon to upload to the translations bucket
create policy "anon_upload" on storage.objects for insert to anon with check (bucket_id = 'translations');

-- Storage: allow public reads from the translations bucket
create policy "public_download" on storage.objects for select to anon using (bucket_id = 'translations');
