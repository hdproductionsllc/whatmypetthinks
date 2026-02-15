-- Constrain format_type and voice_style to valid values
alter table translations
  add constraint format_type_check check (format_type in ('caption', 'convo'));

alter table translations
  add constraint voice_style_check check (voice_style in ('funny', 'dramatic', 'genz', 'passive'));

-- Limit pet_name length
alter table translations
  add constraint pet_name_length check (char_length(pet_name) <= 50);

-- Limit image_url length
alter table translations
  add constraint image_url_length check (char_length(image_url) <= 500);

-- Explicitly deny UPDATE and DELETE for anon
create policy "no_update" on translations for update to anon using (false);
create policy "no_delete" on translations for delete to anon using (false);
