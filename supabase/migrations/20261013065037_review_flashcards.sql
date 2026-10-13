-- KODA · Sprint 4: repaso activo con tarjetas propias.

create table public.student_flashcards (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.student_courses(id) on delete cascade,
  client_key text not null default (gen_random_uuid()::text),
  prompt text not null check (char_length(prompt) between 1 and 800),
  answer text not null check (char_length(answer) between 1 and 1200),
  mastery smallint not null default 0 check (mastery between 0 and 3),
  last_reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, client_key)
);

create index student_flashcards_course_mastery_idx
  on public.student_flashcards (course_id, mastery, last_reviewed_at);

alter table public.student_flashcards enable row level security;

create policy "Students manage their flashcards"
  on public.student_flashcards for all to authenticated
  using (
    exists (
      select 1
      from public.student_courses course
      join public.student_curriculum_profiles profile on profile.id = course.profile_id
      where course.id = student_flashcards.course_id
        and profile.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.student_courses course
      join public.student_curriculum_profiles profile on profile.id = course.profile_id
      where course.id = student_flashcards.course_id
        and profile.user_id = (select auth.uid())
    )
  );
