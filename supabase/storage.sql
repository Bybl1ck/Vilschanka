-- Виконайте в Supabase SQL Editor один раз.
-- Upload виконується тільки server-side через SUPABASE_SERVICE_ROLE_KEY.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'house-images',
  'house-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
