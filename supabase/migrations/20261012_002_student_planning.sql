-- KODA · Sprint 2 y 3
-- Datos privados de la cuenta, organización académica y planificación.

create table public.student_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 80),
  timezone text not null default 'America/Lima',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index student_curriculum_profiles_one_per_user_idx
  on public.student_curriculum_profiles (user_id);

create table public.student_exams (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.student_courses(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 140),
  scheduled_at timestamptz not null,
  difficulty smallint not null default 2 check (difficulty between 1 and 3),
  weight smallint check (weight between 1 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.student_topics (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.student_courses(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 180),
  priority smallint not null default 2 check (priority between 1 and 3),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.student_availability_blocks (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.student_curriculum_profiles(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  starts_at time not null,
  duration_minutes smallint not null check (duration_minutes between 15 and 240),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.student_study_sessions (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.student_courses(id) on delete cascade,
  exam_id uuid references public.student_exams(id) on delete set null,
  topic_id uuid references public.student_topics(id) on delete set null,
  starts_at timestamptz not null,
  duration_minutes smallint not null check (duration_minutes between 15 and 240),
  status text not null default 'planned'
    check (status in ('planned', 'completed', 'skipped', 'rescheduled')),
  rationale text not null check (char_length(rationale) between 1 and 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index student_exams_course_schedule_idx on public.student_exams (course_id, scheduled_at);
create index student_topics_course_idx on public.student_topics (course_id);
create index student_availability_profile_idx on public.student_availability_blocks (profile_id, weekday);
create index student_study_sessions_course_schedule_idx on public.student_study_sessions (course_id, starts_at);

alter table public.student_profiles enable row level security;
alter table public.student_exams enable row level security;
alter table public.student_topics enable row level security;
alter table public.student_availability_blocks enable row level security;
alter table public.student_study_sessions enable row level security;

create policy "Students manage their account profile"
  on public.student_profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Students manage their exams"
  on public.student_exams for all
  using (
    exists (
      select 1
      from public.student_courses course
      join public.student_curriculum_profiles profile on profile.id = course.profile_id
      where course.id = student_exams.course_id and profile.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.student_courses course
      join public.student_curriculum_profiles profile on profile.id = course.profile_id
      where course.id = student_exams.course_id and profile.user_id = auth.uid()
    )
  );

create policy "Students manage their topics"
  on public.student_topics for all
  using (
    exists (
      select 1
      from public.student_courses course
      join public.student_curriculum_profiles profile on profile.id = course.profile_id
      where course.id = student_topics.course_id and profile.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.student_courses course
      join public.student_curriculum_profiles profile on profile.id = course.profile_id
      where course.id = student_topics.course_id and profile.user_id = auth.uid()
    )
  );

create policy "Students manage their availability"
  on public.student_availability_blocks for all
  using (
    exists (
      select 1
      from public.student_curriculum_profiles profile
      where profile.id = student_availability_blocks.profile_id and profile.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.student_curriculum_profiles profile
      where profile.id = student_availability_blocks.profile_id and profile.user_id = auth.uid()
    )
  );

create policy "Students manage their study sessions"
  on public.student_study_sessions for all
  using (
    exists (
      select 1
      from public.student_courses course
      join public.student_curriculum_profiles profile on profile.id = course.profile_id
      where course.id = student_study_sessions.course_id and profile.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.student_courses course
      join public.student_curriculum_profiles profile on profile.id = course.profile_id
      where course.id = student_study_sessions.course_id and profile.user_id = auth.uid()
    )
  );
