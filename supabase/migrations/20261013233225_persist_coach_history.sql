-- KODA · Conversaciones privadas del asistente por cuenta.
-- Las respuestas se escriben únicamente desde la Edge Function después de
-- validar la sesión, el consentimiento y la cuota diaria.

create table public.student_coach_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  document_id uuid references public.student_study_documents(id) on delete set null,
  role text not null check (role in ('student', 'assistant')),
  content text not null check (char_length(content) between 1 and 2400),
  created_at timestamptz not null default now()
);

create index student_coach_messages_user_created_idx
  on public.student_coach_messages (user_id, created_at desc);

alter table public.student_coach_messages enable row level security;

revoke all on public.student_coach_messages from anon, authenticated;
grant select, delete on public.student_coach_messages to authenticated;

create policy "Students read their own coach messages"
  on public.student_coach_messages for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Students delete their own coach messages"
  on public.student_coach_messages for delete to authenticated
  using ((select auth.uid()) = user_id);
