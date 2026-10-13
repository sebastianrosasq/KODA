import { generateStudyPlan } from '@/features/planner/generate-study-plan';
import { supabase } from '@/lib/supabase';
import type {
  CourseTone,
  DayLabel,
  KodaWorkspace,
  StudentAcademicProfile,
} from '@/types/koda-domain';

type RemoteCurriculumProfile = {
  id: string;
  institution_id: string | null;
  program_id: string | null;
  current_term_number: number | null;
};

type RemoteStudentProfile = {
  display_name: string;
  academic_profile_completed: boolean;
};

type RemoteCourse = {
  id: string;
  client_key: string;
  name: string;
  term_number: number | null;
  is_active: boolean;
  was_preloaded: boolean;
  tone: string;
};

type RemoteExam = {
  id: string;
  client_key: string;
  course_id: string;
  title: string;
  scheduled_at: string;
  difficulty: number;
};

type RemoteTopic = {
  id: string;
  client_key: string;
  course_id: string;
  name: string;
  priority: number;
  completed_at: string | null;
};

type RemoteFlashcard = {
  id: string;
  client_key: string;
  course_id: string;
  prompt: string;
  answer: string;
  mastery: number;
  last_reviewed_at: string | null;
};

type RemoteAvailability = {
  id: string;
  client_key: string;
  weekday: number;
  starts_at: string;
  duration_minutes: number;
};

type RemoteStudySession = {
  client_key: string;
  status: string;
};

const toneValues: CourseTone[] = ['plum', 'mint', 'amber', 'sky'];
const weekdayByDay: Record<Exclude<DayLabel, 'Hoy'>, number> = {
  Dom: 0,
  Lun: 1,
  Mar: 2,
  Mié: 3,
  Jue: 4,
  Vie: 5,
  Sáb: 6,
};
const dayByWeekday: Record<number, Exclude<DayLabel, 'Hoy'>> = {
  0: 'Dom',
  1: 'Lun',
  2: 'Mar',
  3: 'Mié',
  4: 'Jue',
  5: 'Vie',
  6: 'Sáb',
};

function getClient() {
  if (!supabase) throw new Error('Supabase no está configurado en esta instalación.');
  return supabase;
}

function throwIfError(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

function isCourseTone(value: string): value is CourseTone {
  return toneValues.includes(value as CourseTone);
}

function asDifficulty(value: number): 1 | 2 | 3 {
  return value === 1 || value === 3 ? value : 2;
}

function asPriority(value: number): 1 | 2 | 3 {
  return value === 1 || value === 3 ? value : 2;
}

function weekdayFor(day: DayLabel) {
  return day === 'Hoy' ? new Date().getDay() : weekdayByDay[day];
}

function dayFor(weekday: number): DayLabel {
  return weekday === new Date().getDay() ? 'Hoy' : dayByWeekday[weekday] ?? 'Hoy';
}

function nextTimestamp(day: DayLabel, startsAt: string) {
  const [hours, minutes] = startsAt.split(':').map(Number);
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours || 0, minutes || 0, 0, 0);
  const difference = (weekdayFor(day) - date.getDay() + 7) % 7;
  date.setDate(date.getDate() + difference);
  return date.toISOString();
}

function apiDateToIso(value: string) {
  return value.slice(0, 10);
}

async function getCurriculumIds(profile: StudentAcademicProfile) {
  const client = getClient();
  const { data: institution, error: institutionError } = await client
    .from('curriculum_institutions')
    .select('id')
    .eq('slug', profile.institutionSlug)
    .maybeSingle();
  throwIfError(institutionError);

  if (!institution) return { institutionId: null, programId: null, planId: null };

  const { data: program, error: programError } = await client
    .from('curriculum_programs')
    .select('id')
    .eq('institution_id', institution.id)
    .eq('slug', profile.programSlug)
    .maybeSingle();
  throwIfError(programError);

  if (!program) return { institutionId: institution.id, programId: null, planId: null };

  const { data: plan, error: planError } = await client
    .from('curriculum_plans')
    .select('id')
    .eq('program_id', program.id)
    .eq('is_active', true)
    .order('reviewed_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  throwIfError(planError);

  return { institutionId: institution.id, programId: program.id, planId: plan?.id ?? null };
}

async function removeRows(table: 'student_courses' | 'student_exams' | 'student_topics' | 'student_flashcards' | 'student_availability_blocks' | 'student_study_sessions', ids: string[]) {
  if (!ids.length) return;
  const { error } = await getClient().from(table).delete().in('id', ids);
  throwIfError(error);
}

export async function syncWorkspaceToSupabase(userId: string, workspace: KodaWorkspace) {
  const client = getClient();
  const selection = await getCurriculumIds(workspace.profile);

  const { error: accountError } = await client.from('student_profiles').upsert({
    id: userId,
    display_name: workspace.profile.displayName.trim() || 'Estudiante',
    timezone: 'America/Lima',
    academic_profile_completed: workspace.academicProfileCompleted,
  });
  throwIfError(accountError);

  const { data: curriculumProfile, error: curriculumError } = await client
    .from('student_curriculum_profiles')
    .upsert(
      {
        user_id: userId,
        institution_id: selection.institutionId,
        program_id: selection.programId,
        plan_id: selection.planId,
        current_term_number: workspace.profile.currentTerm,
      },
      { onConflict: 'user_id' },
    )
    .select('id')
    .single();
  throwIfError(curriculumError);
  if (!curriculumProfile) throw new Error('No se pudo preparar el perfil académico para sincronizarlo.');

  const profileId = curriculumProfile.id;
  const { data: existingCourses, error: existingCoursesError } = await client
    .from('student_courses')
    .select('id, client_key')
    .eq('profile_id', profileId);
  throwIfError(existingCoursesError);

  const { data: syncedCourses, error: courseError } = await client
    .from('student_courses')
    .upsert(
      workspace.courses.map((course) => ({
        profile_id: profileId,
        client_key: course.id,
        name: course.name,
        term_number: course.termNumber,
        is_active: course.isActive,
        was_preloaded: course.wasPreloaded,
        tone: course.tone,
      })),
      { onConflict: 'profile_id,client_key' },
    )
    .select('id, client_key');
  throwIfError(courseError);

  const desiredCourseKeys = new Set(workspace.courses.map((course) => course.id));
  await removeRows('student_courses', (existingCourses ?? [])
    .filter((course) => !desiredCourseKeys.has(course.client_key))
    .map((course) => course.id));

  const { data: existingAvailability, error: existingAvailabilityError } = await client
    .from('student_availability_blocks')
    .select('id, client_key')
    .eq('profile_id', profileId);
  throwIfError(existingAvailabilityError);
  const { error: availabilityError } = await client
    .from('student_availability_blocks')
    .upsert(
      workspace.availability.map((block) => ({
        profile_id: profileId,
        client_key: block.id,
        weekday: weekdayFor(block.day),
        starts_at: block.startsAt,
        duration_minutes: block.durationMinutes,
      })),
      { onConflict: 'profile_id,client_key' },
    );
  throwIfError(availabilityError);
  const desiredAvailabilityKeys = new Set(workspace.availability.map((block) => block.id));
  await removeRows('student_availability_blocks', (existingAvailability ?? [])
    .filter((block) => !desiredAvailabilityKeys.has(block.client_key))
    .map((block) => block.id));

  const courseIdByKey = new Map((syncedCourses ?? []).map((course) => [course.client_key, course.id]));
  if (!courseIdByKey.size) return;

  const courseIds = [...courseIdByKey.values()];
  const { data: existingExams, error: existingExamsError } = await client
    .from('student_exams')
    .select('id, client_key')
    .in('course_id', courseIds);
  throwIfError(existingExamsError);
  const { data: syncedExams, error: examError } = await client
    .from('student_exams')
    .upsert(
      workspace.exams.flatMap((exam) => {
        const courseId = courseIdByKey.get(exam.courseId);
        return courseId ? [{
          course_id: courseId,
          client_key: exam.id,
          title: exam.title,
          scheduled_at: `${exam.dateIso}T12:00:00.000Z`,
          difficulty: exam.difficulty,
        }] : [];
      }),
      { onConflict: 'course_id,client_key' },
    )
    .select('id, client_key, course_id');
  throwIfError(examError);
  const desiredExamKeys = new Set(workspace.exams.map((exam) => exam.id));
  await removeRows('student_exams', (existingExams ?? [])
    .filter((exam) => !desiredExamKeys.has(exam.client_key))
    .map((exam) => exam.id));

  const { data: existingTopics, error: existingTopicsError } = await client
    .from('student_topics')
    .select('id, client_key')
    .in('course_id', courseIds);
  throwIfError(existingTopicsError);
  const { data: syncedTopics, error: topicError } = await client
    .from('student_topics')
    .upsert(
      workspace.topics.flatMap((topic) => {
        const courseId = courseIdByKey.get(topic.courseId);
        return courseId ? [{
          course_id: courseId,
          client_key: topic.id,
          name: topic.name,
          priority: topic.priority,
          completed_at: topic.completed ? new Date().toISOString() : null,
        }] : [];
      }),
      { onConflict: 'course_id,client_key' },
    )
    .select('id, client_key');
  throwIfError(topicError);
  const desiredTopicKeys = new Set(workspace.topics.map((topic) => topic.id));
  await removeRows('student_topics', (existingTopics ?? [])
    .filter((topic) => !desiredTopicKeys.has(topic.client_key))
    .map((topic) => topic.id));

  const { data: existingFlashcards, error: existingFlashcardsError } = await client
    .from('student_flashcards')
    .select('id, client_key')
    .in('course_id', courseIds);
  throwIfError(existingFlashcardsError);
  const { error: flashcardError } = await client
    .from('student_flashcards')
    .upsert(
      workspace.flashcards.flatMap((flashcard) => {
        const courseId = courseIdByKey.get(flashcard.courseId);
        return courseId ? [{
          course_id: courseId,
          client_key: flashcard.id,
          prompt: flashcard.prompt,
          answer: flashcard.answer,
          mastery: flashcard.mastery,
          last_reviewed_at: flashcard.lastReviewedAt ?? null,
        }] : [];
      }),
      { onConflict: 'course_id,client_key' },
    );
  throwIfError(flashcardError);
  const desiredFlashcardKeys = new Set(workspace.flashcards.map((flashcard) => flashcard.id));
  await removeRows('student_flashcards', (existingFlashcards ?? [])
    .filter((flashcard) => !desiredFlashcardKeys.has(flashcard.client_key))
    .map((flashcard) => flashcard.id));

  const { data: existingSessions, error: existingSessionsError } = await client
    .from('student_study_sessions')
    .select('id, client_key')
    .in('course_id', courseIds);
  throwIfError(existingSessionsError);
  const examIdByCourseId = new Map((syncedExams ?? []).map((exam) => [exam.course_id, exam.id]));
  const topicIdByKey = new Map((syncedTopics ?? []).map((topic) => [topic.client_key, topic.id]));
  const plan = generateStudyPlan(workspace);
  const { error: sessionError } = await client
    .from('student_study_sessions')
    .upsert(
      plan.flatMap((session) => {
        const courseId = courseIdByKey.get(session.courseId);
        return courseId ? [{
          client_key: session.id,
          course_id: courseId,
          exam_id: examIdByCourseId.get(courseId) ?? null,
          topic_id: session.topicId ? topicIdByKey.get(session.topicId) ?? null : null,
          starts_at: nextTimestamp(session.day, session.startsAt),
          duration_minutes: session.durationMinutes,
          status: session.completed ? 'completed' : 'planned',
          rationale: session.rationale,
        }] : [];
      }),
      { onConflict: 'course_id,client_key' },
    );
  throwIfError(sessionError);
  const desiredSessionKeys = new Set(plan.map((session) => session.id));
  await removeRows('student_study_sessions', (existingSessions ?? [])
    .filter((session) => !desiredSessionKeys.has(session.client_key))
    .map((session) => session.id));
}

export async function loadWorkspaceFromSupabase(userId: string, fallback: KodaWorkspace): Promise<KodaWorkspace | null> {
  const client = getClient();
  const { data: curriculumProfile, error: curriculumError } = await client
    .from('student_curriculum_profiles')
    .select('id, institution_id, program_id, current_term_number')
    .eq('user_id', userId)
    .maybeSingle();
  throwIfError(curriculumError);
  if (!curriculumProfile) return null;

  const profile = curriculumProfile as RemoteCurriculumProfile;
  const [{ data: account, error: accountError }, { data: institution, error: institutionError }, { data: program, error: programError }] = await Promise.all([
    client.from('student_profiles').select('display_name, academic_profile_completed').eq('id', userId).maybeSingle(),
    profile.institution_id
      ? client.from('curriculum_institutions').select('slug, name').eq('id', profile.institution_id).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    profile.program_id
      ? client.from('curriculum_programs').select('slug, name').eq('id', profile.program_id).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);
  throwIfError(accountError);
  throwIfError(institutionError);
  throwIfError(programError);

  const remoteProfile: StudentAcademicProfile = {
    displayName: account?.display_name ?? fallback.profile.displayName,
    institutionSlug: institution?.slug ?? fallback.profile.institutionSlug,
    institutionName: institution?.name ?? fallback.profile.institutionName,
    programSlug: program?.slug ?? fallback.profile.programSlug,
    programName: program?.name ?? fallback.profile.programName,
    currentTerm: profile.current_term_number ?? fallback.profile.currentTerm,
  };

  const { data: courseRows, error: courseError } = await client
    .from('student_courses')
    .select('id, client_key, name, term_number, is_active, was_preloaded, tone')
    .eq('profile_id', profile.id)
    .order('created_at');
  throwIfError(courseError);
  const courses = (courseRows ?? []) as RemoteCourse[];
  const courseIdToKey = new Map(courses.map((course) => [course.id, course.client_key]));
  const courseIds = courses.map((course) => course.id);
  if (!courseIds.length) return { ...fallback, profile: remoteProfile, courses: [], exams: [], topics: [], flashcards: [], availability: [], completedSessionIds: [] };

  const [{ data: examRows, error: examError }, { data: topicRows, error: topicError }, { data: flashcardRows, error: flashcardError }, { data: availabilityRows, error: availabilityError }, { data: sessionRows, error: sessionError }] = await Promise.all([
    client.from('student_exams').select('id, client_key, course_id, title, scheduled_at, difficulty').in('course_id', courseIds),
    client.from('student_topics').select('id, client_key, course_id, name, priority, completed_at').in('course_id', courseIds),
    client.from('student_flashcards').select('id, client_key, course_id, prompt, answer, mastery, last_reviewed_at').in('course_id', courseIds),
    client.from('student_availability_blocks').select('id, client_key, weekday, starts_at, duration_minutes').eq('profile_id', profile.id),
    client.from('student_study_sessions').select('client_key, status').in('course_id', courseIds),
  ]);
  throwIfError(examError);
  throwIfError(topicError);
  throwIfError(flashcardError);
  throwIfError(availabilityError);
  throwIfError(sessionError);

  return {
    academicProfileCompleted: (account as RemoteStudentProfile | null)?.academic_profile_completed ?? Boolean(institution && program),
    profile: remoteProfile,
    courses: courses.map((course, index) => ({
      id: course.client_key,
      name: course.name,
      termNumber: course.term_number ?? remoteProfile.currentTerm,
      isActive: course.is_active,
      wasPreloaded: course.was_preloaded,
      tone: isCourseTone(course.tone) ? course.tone : toneValues[index % toneValues.length],
    })),
    exams: ((examRows ?? []) as RemoteExam[]).flatMap((exam) => {
      const courseId = courseIdToKey.get(exam.course_id);
      return courseId ? [{
        id: exam.client_key,
        courseId,
        title: exam.title,
        dateIso: apiDateToIso(exam.scheduled_at),
        difficulty: asDifficulty(exam.difficulty),
      }] : [];
    }),
    topics: ((topicRows ?? []) as RemoteTopic[]).flatMap((topic) => {
      const courseId = courseIdToKey.get(topic.course_id);
      return courseId ? [{
        id: topic.client_key,
        courseId,
        name: topic.name,
        priority: asPriority(topic.priority),
        completed: Boolean(topic.completed_at),
      }] : [];
    }),
    flashcards: ((flashcardRows ?? []) as RemoteFlashcard[]).flatMap((flashcard) => {
      const courseId = courseIdToKey.get(flashcard.course_id);
      return courseId ? [{
        id: flashcard.client_key,
        courseId,
        prompt: flashcard.prompt,
        answer: flashcard.answer,
        mastery: Math.min(3, Math.max(0, flashcard.mastery)) as 0 | 1 | 2 | 3,
        lastReviewedAt: flashcard.last_reviewed_at ?? undefined,
      }] : [];
    }),
    availability: ((availabilityRows ?? []) as RemoteAvailability[]).map((block) => ({
      id: block.client_key,
      day: dayFor(block.weekday),
      startsAt: block.starts_at.slice(0, 5),
      durationMinutes: block.duration_minutes,
    })),
    completedSessionIds: ((sessionRows ?? []) as RemoteStudySession[])
      .filter((session) => session.status === 'completed')
      .map((session) => session.client_key),
  };
}
