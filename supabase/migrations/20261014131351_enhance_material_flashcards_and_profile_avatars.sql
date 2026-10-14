-- KODA · Materiales configurables y foto de perfil privada.
-- Los archivos conservan el aislamiento por carpeta de usuario mediante RLS.

alter table public.student_study_documents
  add column if not exists flashcard_target smallint not null default 3
  check (flashcard_target between 1 and 8);

alter table public.student_profiles
  add column if not exists avatar_path text
  check (avatar_path is null or char_length(avatar_path) between 1 and 320);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'koda-profile-avatars',
  'koda-profile-avatars',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Students manage their own profile avatars" on storage.objects;

create policy "Students manage their own profile avatars"
  on storage.objects for all to authenticated
  using (
    bucket_id = 'koda-profile-avatars'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  )
  with check (
    bucket_id = 'koda-profile-avatars'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );
