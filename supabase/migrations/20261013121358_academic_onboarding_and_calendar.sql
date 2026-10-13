-- KODA · Perfil académico inicial y calendario institucional
--
-- El perfil conserva la institución elegida al crear la cuenta. Las mallas y
-- los calendarios son datos públicos, versionados por fuente oficial.

alter table public.student_profiles
  add column if not exists academic_profile_completed boolean not null default false;

update public.student_profiles account
set academic_profile_completed = true
where exists (
  select 1
  from public.student_curriculum_profiles curriculum
  where curriculum.user_id = account.id
    and curriculum.institution_id is not null
    and curriculum.program_id is not null
);

create table public.institution_academic_periods (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.curriculum_institutions(id) on delete cascade,
  period_code text not null check (period_code ~ '^20[0-9]{2}-[0-9A-Za-z]+$'),
  label text not null,
  modality text not null default 'unspecified'
    check (modality in ('presential', 'semi_presential', 'virtual', 'flexible', 'unspecified')),
  source_url text not null,
  source_title text not null,
  source_status text not null default 'official_published'
    check (source_status in ('official_published', 'estimated', 'superseded')),
  reviewed_at date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (institution_id, period_code, modality)
);

create table public.institution_academic_calendar_events (
  id uuid primary key default gen_random_uuid(),
  period_id uuid not null references public.institution_academic_periods(id) on delete cascade,
  event_type text not null check (event_type in (
    'enrollment_regular',
    'enrollment_late',
    'classes_start',
    'classes_end',
    'midterm_exam_window',
    'final_exam_window',
    'makeup_exam_window',
    'academic_break'
  )),
  label text not null,
  starts_on date not null,
  ends_on date not null,
  is_estimated boolean not null default false,
  source_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_on >= starts_on),
  unique (period_id, event_type, starts_on, ends_on)
);

create index if not exists institution_academic_periods_lookup_idx
  on public.institution_academic_periods (institution_id, period_code, source_status);
create index if not exists institution_academic_calendar_events_lookup_idx
  on public.institution_academic_calendar_events (period_id, starts_on);

alter table public.institution_academic_periods enable row level security;
alter table public.institution_academic_calendar_events enable row level security;

grant select on public.institution_academic_periods to anon, authenticated;
grant select on public.institution_academic_calendar_events to anon, authenticated;

create policy "Public academic periods are readable"
  on public.institution_academic_periods for select
  to anon, authenticated
  using (true);

create policy "Public academic calendar events are readable"
  on public.institution_academic_calendar_events for select
  to anon, authenticated
  using (true);
