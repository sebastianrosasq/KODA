-- Las sesiones pertenecen a un curso personal. Un mismo identificador local
-- puede existir en cuentas diferentes sin cruzar datos entre estudiantes.

drop index if exists public.student_study_sessions_client_key_idx;

create unique index if not exists student_study_sessions_course_client_key_idx
  on public.student_study_sessions (course_id, client_key);
