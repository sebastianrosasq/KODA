-- KODA · Sprints 6 y 7
-- Documentos privados, análisis con IA, cuota diaria y resultados de simulacros.

alter table public.student_profiles
  add column if not exists ai_document_consent_at timestamptz;

create table public.student_study_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid references public.student_courses(id) on delete set null,
  storage_path text not null unique check (char_length(storage_path) between 4 and 300),
  original_filename text not null check (char_length(original_filename) between 1 and 180),
  mime_type text not null default 'application/pdf' check (mime_type = 'application/pdf'),
  byte_size integer not null check (byte_size > 0 and byte_size <= 10485760),
  analysis_status text not null default 'ready'
    check (analysis_status in ('ready', 'processing', 'completed', 'failed')),
  analysis jsonb,
  flashcards_imported_at timestamptz,
  analysis_completed_at timestamptz,
  last_error text check (last_error is null or char_length(last_error) <= 280),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (analysis is null or jsonb_typeof(analysis) = 'object')
);

create index student_study_documents_user_created_idx
  on public.student_study_documents (user_id, created_at desc);
create index student_study_documents_course_idx
  on public.student_study_documents (course_id)
  where course_id is not null;

alter table public.student_study_documents enable row level security;
grant select, insert, update, delete on public.student_study_documents to authenticated;

create policy "Students manage their study documents"
  on public.student_study_documents for all to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and (
      course_id is null
      or exists (
        select 1
        from public.student_courses course
        join public.student_curriculum_profiles profile on profile.id = course.profile_id
        where course.id = student_study_documents.course_id
          and profile.user_id = (select auth.uid())
      )
    )
  );

-- La cuota se reserva dentro de Postgres para impedir que varias solicitudes
-- simultáneas superen el límite de Gemini Free.
create table public.student_ai_daily_quotas (
  user_id uuid not null references auth.users(id) on delete cascade,
  quota_day date not null,
  document_analyses_used smallint not null default 0
    check (document_analyses_used between 0 and 2),
  coach_messages_used smallint not null default 0
    check (coach_messages_used between 0 and 8),
  updated_at timestamptz not null default now(),
  primary key (user_id, quota_day)
);

alter table public.student_ai_daily_quotas enable row level security;
grant select on public.student_ai_daily_quotas to authenticated;

create policy "Students read their own AI quota"
  on public.student_ai_daily_quotas for select to authenticated
  using ((select auth.uid()) = user_id);

create function public.consume_koda_ai_quota(requested_operation text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_id uuid := auth.uid();
  local_day date := (timezone('America/Lima', now()))::date;
  next_document_count smallint;
  next_coach_count smallint;
begin
  if caller_id is null then
    raise exception 'No autorizado';
  end if;

  if requested_operation = 'document_analysis' then
    insert into public.student_ai_daily_quotas (user_id, quota_day, document_analyses_used)
    values (caller_id, local_day, 1)
    on conflict (user_id, quota_day) do update
      set document_analyses_used = student_ai_daily_quotas.document_analyses_used + 1,
          updated_at = now()
      where student_ai_daily_quotas.document_analyses_used < 2
    returning document_analyses_used, coach_messages_used
    into next_document_count, next_coach_count;

    return jsonb_build_object(
      'allowed', next_document_count is not null,
      'remaining', greatest(0, 2 - coalesce(next_document_count, 2))
    );
  end if;

  if requested_operation = 'study_coach' then
    insert into public.student_ai_daily_quotas (user_id, quota_day, coach_messages_used)
    values (caller_id, local_day, 1)
    on conflict (user_id, quota_day) do update
      set coach_messages_used = student_ai_daily_quotas.coach_messages_used + 1,
          updated_at = now()
      where student_ai_daily_quotas.coach_messages_used < 8
    returning document_analyses_used, coach_messages_used
    into next_document_count, next_coach_count;

    return jsonb_build_object(
      'allowed', next_coach_count is not null,
      'remaining', greatest(0, 8 - coalesce(next_coach_count, 8))
    );
  end if;

  raise exception 'Operación de IA no permitida';
end;
$$;

revoke all on function public.consume_koda_ai_quota(text) from public;
grant execute on function public.consume_koda_ai_quota(text) to authenticated;

create table public.student_quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid references public.student_courses(id) on delete set null,
  document_id uuid references public.student_study_documents(id) on delete set null,
  source text not null check (source in ('document', 'flashcards')),
  question_count smallint not null check (question_count between 1 and 20),
  correct_count smallint not null check (correct_count between 0 and 20),
  incorrect_question_indexes jsonb not null default '[]'::jsonb,
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  check (correct_count <= question_count),
  check (jsonb_typeof(incorrect_question_indexes) = 'array')
);

create index student_quiz_attempts_user_completed_idx
  on public.student_quiz_attempts (user_id, completed_at desc);
create index student_quiz_attempts_course_completed_idx
  on public.student_quiz_attempts (course_id, completed_at desc)
  where course_id is not null;

alter table public.student_quiz_attempts enable row level security;
grant select, insert, update, delete on public.student_quiz_attempts to authenticated;

create policy "Students manage their quiz attempts"
  on public.student_quiz_attempts for all to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and (
      course_id is null
      or exists (
        select 1
        from public.student_courses course
        join public.student_curriculum_profiles profile on profile.id = course.profile_id
        where course.id = student_quiz_attempts.course_id
          and profile.user_id = (select auth.uid())
      )
    )
    and (
      document_id is null
      or exists (
        select 1
        from public.student_study_documents document
        where document.id = student_quiz_attempts.document_id
          and document.user_id = (select auth.uid())
      )
    )
  );
