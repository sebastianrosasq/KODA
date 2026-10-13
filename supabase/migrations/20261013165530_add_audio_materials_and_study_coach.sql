-- KODA · PDF y audios privados de estudio.
-- Los objetos siguen bajo la misma ruta protegida por usuario; solo se amplía
-- el tipo permitido y se conserva el tamaño apto para envío en memoria a Gemini.

alter table public.student_study_documents
  add column if not exists content_kind text not null default 'pdf';

alter table public.student_study_documents
  drop constraint if exists student_study_documents_mime_type_check,
  drop constraint if exists student_study_documents_byte_size_check;

alter table public.student_study_documents
  add constraint student_study_documents_content_kind_check
    check (content_kind in ('pdf', 'audio')),
  add constraint student_study_documents_mime_type_check
    check (mime_type in (
      'application/pdf',
      'audio/mpeg',
      'audio/wav',
      'audio/aac',
      'audio/ogg',
      'audio/flac',
      'audio/webm',
      'audio/m4a'
    )),
  add constraint student_study_documents_kind_matches_mime_check
    check (
      (content_kind = 'pdf' and mime_type = 'application/pdf')
      or (content_kind = 'audio' and mime_type <> 'application/pdf')
    ),
  add constraint student_study_documents_byte_size_check
    check (byte_size > 0 and byte_size <= 12582912);

update storage.buckets
set
  file_size_limit = 12582912,
  allowed_mime_types = array[
    'application/pdf',
    'audio/mpeg',
    'audio/wav',
    'audio/aac',
    'audio/ogg',
    'audio/flac',
    'audio/webm',
    'audio/m4a'
  ]
where id = 'koda-study-documents';
