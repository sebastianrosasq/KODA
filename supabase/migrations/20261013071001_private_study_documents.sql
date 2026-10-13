-- KODA · Sprint 6: documentos de estudio privados.
-- El primer segmento de cada ruta es el UUID del estudiante autenticado.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'koda-study-documents',
  'koda-study-documents',
  false,
  10485760,
  array['application/pdf']
)
on conflict (id) do update
set public = false,
    file_size_limit = 10485760,
    allowed_mime_types = array['application/pdf'];

create policy "Students list their study documents"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'koda-study-documents'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "Students upload their study documents"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'koda-study-documents'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "Students update their study documents"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'koda-study-documents'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  )
  with check (
    bucket_id = 'koda-study-documents'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "Students delete their study documents"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'koda-study-documents'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );
