-- KODA · Catálogo curricular peruano
-- Base para precargar cursos por institución, carrera, plan y ciclo.
-- Ejecutar en un proyecto Supabase PostgreSQL.

create extension if not exists pgcrypto;

create table public.curriculum_institutions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  institution_type text not null check (institution_type in ('university', 'institute')),
  country_code char(2) not null default 'PE' check (country_code = 'PE'),
  official_url text not null,
  licensing_reference_url text,
  catalog_status text not null default 'source_identified'
    check (catalog_status in ('source_identified', 'verified', 'retired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.curriculum_sources (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.curriculum_institutions(id) on delete cascade,
  title text not null,
  source_url text not null,
  source_type text not null check (source_type in ('official_page', 'official_pdf', 'official_registry')),
  is_official boolean not null default true,
  published_at date,
  reviewed_at date not null,
  notes text,
  unique (institution_id, source_url)
);

create table public.curriculum_programs (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.curriculum_institutions(id) on delete cascade,
  slug text not null,
  name text not null,
  discipline_family text not null,
  term_label text not null default 'Ciclo',
  default_term_count smallint check (default_term_count > 0),
  modality text not null default 'unspecified'
    check (modality in ('presential', 'semi_presential', 'virtual', 'flexible', 'unspecified')),
  catalog_status text not null default 'source_identified'
    check (catalog_status in ('source_identified', 'verified', 'retired')),
  source_id uuid references public.curriculum_sources(id) on delete set null,
  unique (institution_id, slug)
);

create table public.curriculum_plans (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.curriculum_programs(id) on delete cascade,
  source_id uuid not null references public.curriculum_sources(id) on delete restrict,
  label text not null,
  version_label text,
  modality text not null
    check (modality in ('presential', 'semi_presential', 'virtual', 'flexible', 'unspecified')),
  term_count smallint not null check (term_count > 0),
  total_credits numeric(6, 2),
  total_hours integer,
  source_status text not null default 'official_published'
    check (source_status in ('official_published', 'needs_review', 'retired')),
  reviewed_at date not null,
  is_active boolean not null default true,
  unique (program_id, label, modality)
);

create table public.curriculum_terms (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.curriculum_plans(id) on delete cascade,
  term_number smallint not null check (term_number > 0),
  label text not null,
  unique (plan_id, term_number)
);

create table public.curriculum_courses (
  id uuid primary key default gen_random_uuid(),
  term_id uuid not null references public.curriculum_terms(id) on delete cascade,
  position smallint not null check (position > 0),
  course_code text,
  name text not null,
  credits numeric(5, 2),
  hours integer,
  course_type text not null default 'required'
    check (course_type in ('required', 'elective', 'project', 'internship')),
  study_tags text[] not null default '{}',
  unique (term_id, position)
);

-- A student's selection is a snapshot. A later plan update never removes
-- courses the student already confirmed or added manually.
create table public.student_curriculum_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  institution_id uuid references public.curriculum_institutions(id) on delete set null,
  program_id uuid references public.curriculum_programs(id) on delete set null,
  plan_id uuid references public.curriculum_plans(id) on delete set null,
  current_term_number smallint check (current_term_number > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.student_courses (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.student_curriculum_profiles(id) on delete cascade,
  curriculum_course_id uuid references public.curriculum_courses(id) on delete set null,
  name text not null,
  term_number smallint check (term_number > 0),
  is_active boolean not null default true,
  was_preloaded boolean not null default false,
  created_at timestamptz not null default now()
);

create index curriculum_programs_institution_idx
  on public.curriculum_programs (institution_id);
create index curriculum_programs_source_idx
  on public.curriculum_programs (source_id);
create index curriculum_plans_program_idx
  on public.curriculum_plans (program_id);
create index curriculum_plans_source_idx
  on public.curriculum_plans (source_id);
create index curriculum_terms_plan_idx
  on public.curriculum_terms (plan_id, term_number);
create index curriculum_courses_term_idx
  on public.curriculum_courses (term_id, position);
create index student_curriculum_profiles_user_idx
  on public.student_curriculum_profiles (user_id);
create index student_curriculum_profiles_institution_idx
  on public.student_curriculum_profiles (institution_id);
create index student_curriculum_profiles_program_idx
  on public.student_curriculum_profiles (program_id);
create index student_curriculum_profiles_plan_idx
  on public.student_curriculum_profiles (plan_id);
create index student_courses_profile_idx
  on public.student_courses (profile_id);
create index student_courses_curriculum_course_idx
  on public.student_courses (curriculum_course_id);

alter table public.curriculum_institutions enable row level security;
alter table public.curriculum_sources enable row level security;
alter table public.curriculum_programs enable row level security;
alter table public.curriculum_plans enable row level security;
alter table public.curriculum_terms enable row level security;
alter table public.curriculum_courses enable row level security;
alter table public.student_curriculum_profiles enable row level security;
alter table public.student_courses enable row level security;

create policy "Public catalog is readable"
  on public.curriculum_institutions for select using (true);
create policy "Public catalog sources are readable"
  on public.curriculum_sources for select using (true);
create policy "Public catalog programs are readable"
  on public.curriculum_programs for select using (true);
create policy "Public catalog plans are readable"
  on public.curriculum_plans for select using (true);
create policy "Public catalog terms are readable"
  on public.curriculum_terms for select using (true);
create policy "Public catalog courses are readable"
  on public.curriculum_courses for select using (true);

create policy "Students read their curriculum profile"
  on public.student_curriculum_profiles for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Students create their curriculum profile"
  on public.student_curriculum_profiles for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Students update their curriculum profile"
  on public.student_curriculum_profiles for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Students delete their curriculum profile"
  on public.student_curriculum_profiles for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "Students read their courses"
  on public.student_courses for select to authenticated using (
    exists (
      select 1
      from public.student_curriculum_profiles profile
      where profile.id = student_courses.profile_id
        and profile.user_id = (select auth.uid())
    )
  );
create policy "Students create their courses"
  on public.student_courses for insert to authenticated with check (
    exists (
      select 1
      from public.student_curriculum_profiles profile
      where profile.id = student_courses.profile_id
        and profile.user_id = (select auth.uid())
    )
  );
create policy "Students update their courses"
  on public.student_courses for update to authenticated using (
    exists (
      select 1
      from public.student_curriculum_profiles profile
      where profile.id = student_courses.profile_id
        and profile.user_id = (select auth.uid())
    )
  ) with check (
    exists (
      select 1
      from public.student_curriculum_profiles profile
      where profile.id = student_courses.profile_id
        and profile.user_id = (select auth.uid())
    )
  );
create policy "Students delete their courses"
  on public.student_courses for delete to authenticated using (
    exists (
      select 1
      from public.student_curriculum_profiles profile
      where profile.id = student_courses.profile_id
        and profile.user_id = (select auth.uid())
    )
  );
