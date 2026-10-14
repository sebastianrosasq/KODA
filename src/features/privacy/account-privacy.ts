import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import { supabase } from '@/lib/supabase';

type QueryResult = {
  data: unknown;
  error: { message: string } | null;
};

type AccountExport = {
  format: 'koda-personal-data-export/v1';
  exportedAt: string;
  note: string;
  account: {
    id: string;
    email: string | null;
    createdAt: string;
    lastSignInAt: string | null;
    metadata: Record<string, unknown>;
  };
  profile: unknown;
  academicProfile: unknown;
  courses: unknown[];
  exams: unknown[];
  topics: unknown[];
  flashcards: unknown[];
  availabilityBlocks: unknown[];
  studySessions: unknown[];
  studyMaterials: unknown[];
  quizAttempts: unknown[];
  coachMessages: unknown[];
  aiUsageByDay: unknown[];
};

function clientOrThrow() {
  if (!supabase) throw new Error('Supabase no está configurado en esta instalación.');
  return supabase;
}

async function readQuery(query: PromiseLike<QueryResult>, label: string) {
  const { data, error } = await query;
  if (error) throw new Error(`No se pudo incluir ${label} en tu exportación.`);
  return data;
}

function fileSafeDate(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

async function saveExportFile(fileName: string, contents: string) {
  if (Platform.OS === 'web') {
    if (typeof document === 'undefined') throw new Error('No se pudo preparar la descarga en este navegador.');
    const blob = new Blob([contents], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
    return 'La descarga de tus datos comenzó.';
  }

  const file = new File(Paths.cache, fileName);
  file.create({ intermediates: true, overwrite: true });
  file.write(contents);

  if (!await Sharing.isAvailableAsync()) {
    throw new Error('Este dispositivo no puede abrir el selector para guardar tu exportación.');
  }

  await Sharing.shareAsync(file.uri, {
    dialogTitle: 'Guardar mis datos de KODA',
    mimeType: 'application/json',
  });
  return 'Elige dónde guardar tu archivo de datos.';
}

export async function exportKodaPersonalData() {
  const client = clientOrThrow();
  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError || !userData.user) throw new Error('Inicia sesión para exportar tus datos.');
  const user = userData.user;

  const [profile, academicProfile] = await Promise.all([
    readQuery(
      client
        .from('student_profiles')
        .select('id, display_name, timezone, ai_document_consent_at, created_at, updated_at')
        .eq('id', user.id)
        .maybeSingle(),
      'tu perfil',
    ),
    readQuery(
      client
        .from('student_curriculum_profiles')
        .select('id, institution_id, program_id, plan_id, current_term_number, created_at, updated_at')
        .eq('user_id', user.id)
        .maybeSingle(),
      'tu perfil académico',
    ),
  ]);

  const academicProfileId = academicProfile && typeof academicProfile === 'object' && 'id' in academicProfile
    ? String(academicProfile.id)
    : null;
  const courses = academicProfileId
    ? await readQuery(
      client
        .from('student_courses')
        .select('id, client_key, name, term_number, is_active, was_preloaded, tone, created_at')
        .eq('profile_id', academicProfileId),
      'tus cursos',
    )
    : [];
  const courseIds = Array.isArray(courses)
    ? courses.flatMap((course) => course && typeof course === 'object' && 'id' in course ? [String(course.id)] : [])
    : [];

  const [exams, topics, flashcards, availabilityBlocks, studySessions, studyMaterials, quizAttempts, coachMessages, aiUsageByDay] = await Promise.all([
    courseIds.length
      ? readQuery(client.from('student_exams').select('*').in('course_id', courseIds), 'tus evaluaciones')
      : Promise.resolve([]),
    courseIds.length
      ? readQuery(client.from('student_topics').select('*').in('course_id', courseIds), 'tus temas')
      : Promise.resolve([]),
    courseIds.length
      ? readQuery(client.from('student_flashcards').select('*').in('course_id', courseIds), 'tus flashcards')
      : Promise.resolve([]),
    academicProfileId
      ? readQuery(client.from('student_availability_blocks').select('*').eq('profile_id', academicProfileId), 'tu disponibilidad')
      : Promise.resolve([]),
    courseIds.length
      ? readQuery(client.from('student_study_sessions').select('*').in('course_id', courseIds), 'tus sesiones')
      : Promise.resolve([]),
    readQuery(
      client
        .from('student_study_documents')
        .select('id, course_id, original_filename, content_kind, mime_type, byte_size, analysis_status, analysis, flashcards_imported_at, analysis_completed_at, last_error, created_at, updated_at')
        .eq('user_id', user.id),
      'los datos de tus materiales',
    ),
    readQuery(client.from('student_quiz_attempts').select('*').eq('user_id', user.id), 'tus simulacros'),
    readQuery(
      client
        .from('student_coach_messages')
        .select('id, document_id, role, content, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true }),
      'tu historial de IA',
    ),
    readQuery(
      client
        .from('student_ai_daily_quotas')
        .select('quota_day, document_analyses_used, coach_messages_used, updated_at')
        .eq('user_id', user.id)
        .order('quota_day', { ascending: true }),
      'tu uso de IA',
    ),
  ]);

  const exportData: AccountExport = {
    format: 'koda-personal-data-export/v1',
    exportedAt: new Date().toISOString(),
    note: 'Incluye los registros de KODA y los resultados generados. Los archivos PDF y audio originales no se adjuntan a este JSON; conserva una copia antes de eliminar tu cuenta.',
    account: {
      id: user.id,
      email: user.email ?? null,
      createdAt: user.created_at,
      lastSignInAt: user.last_sign_in_at ?? null,
      metadata: user.user_metadata ?? {},
    },
    profile,
    academicProfile,
    courses: Array.isArray(courses) ? courses : [],
    exams: Array.isArray(exams) ? exams : [],
    topics: Array.isArray(topics) ? topics : [],
    flashcards: Array.isArray(flashcards) ? flashcards : [],
    availabilityBlocks: Array.isArray(availabilityBlocks) ? availabilityBlocks : [],
    studySessions: Array.isArray(studySessions) ? studySessions : [],
    studyMaterials: Array.isArray(studyMaterials) ? studyMaterials : [],
    quizAttempts: Array.isArray(quizAttempts) ? quizAttempts : [],
    coachMessages: Array.isArray(coachMessages) ? coachMessages : [],
    aiUsageByDay: Array.isArray(aiUsageByDay) ? aiUsageByDay : [],
  };

  return saveExportFile(`koda-mis-datos-${fileSafeDate()}.json`, JSON.stringify(exportData, null, 2));
}

export async function deleteKodaAccount() {
  const client = clientOrThrow();
  const { data, error } = await client.functions.invoke('delete-koda-account', {
    body: { confirmation: 'DELETE_MY_ACCOUNT' },
  });

  if (error) {
    const detail = await error.context?.json()
      .then((body: unknown) => body && typeof body === 'object' && 'error' in body && typeof body.error === 'string' ? body.error : '')
      .catch(() => '');
    throw new Error(detail || 'No se pudo eliminar tu cuenta. Inténtalo nuevamente.');
  }
  if (!data || typeof data !== 'object' || !('deleted' in data) || data.deleted !== true) {
    throw new Error('KODA no pudo confirmar la eliminación de tu cuenta.');
  }
}
