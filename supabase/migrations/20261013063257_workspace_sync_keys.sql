-- KODA · Identificadores estables para sincronizar el espacio de estudio.
-- Los client_key permiten que la app móvil conserve sus identificadores locales
-- mientras realiza upserts seguros sobre la cuenta autenticada.

alter table public.student_courses
  add column if not exists client_key text,
  add column if not exists tone text not null default 'plum';

alter table public.student_exams
  add column if not exists client_key text;

alter table public.student_topics
  add column if not exists client_key text;

alter table public.student_availability_blocks
  add column if not exists client_key text;

alter table public.student_study_sessions
  add column if not exists client_key text;

update public.student_courses
set client_key = gen_random_uuid()::text
where client_key is null;

update public.student_exams
set client_key = gen_random_uuid()::text
where client_key is null;

update public.student_topics
set client_key = gen_random_uuid()::text
where client_key is null;

update public.student_availability_blocks
set client_key = gen_random_uuid()::text
where client_key is null;

update public.student_study_sessions
set client_key = gen_random_uuid()::text
where client_key is null;

alter table public.student_courses
  alter column client_key set default (gen_random_uuid()::text),
  alter column client_key set not null;

alter table public.student_exams
  alter column client_key set default (gen_random_uuid()::text),
  alter column client_key set not null;

alter table public.student_topics
  alter column client_key set default (gen_random_uuid()::text),
  alter column client_key set not null;

alter table public.student_availability_blocks
  alter column client_key set default (gen_random_uuid()::text),
  alter column client_key set not null;

alter table public.student_study_sessions
  alter column client_key set default (gen_random_uuid()::text),
  alter column client_key set not null;

create unique index if not exists student_courses_profile_client_key_idx
  on public.student_courses (profile_id, client_key);
create unique index if not exists student_exams_course_client_key_idx
  on public.student_exams (course_id, client_key);
create unique index if not exists student_topics_course_client_key_idx
  on public.student_topics (course_id, client_key);
create unique index if not exists student_availability_profile_client_key_idx
  on public.student_availability_blocks (profile_id, client_key);
create unique index if not exists student_study_sessions_course_client_key_idx
  on public.student_study_sessions (course_id, client_key);
