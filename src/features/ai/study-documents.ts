import type { DocumentPickerAsset } from 'expo-document-picker';

import { supabase } from '@/lib/supabase';

const DOCUMENT_BUCKET = 'koda-study-documents';
export const MAX_STUDY_MATERIAL_BYTES = 12 * 1024 * 1024;

export type StudyMaterialKind = 'pdf' | 'audio';

const mimeTypesByExtension: Record<string, { kind: StudyMaterialKind; mimeType: string }> = {
  pdf: { kind: 'pdf', mimeType: 'application/pdf' },
  mp3: { kind: 'audio', mimeType: 'audio/mpeg' },
  wav: { kind: 'audio', mimeType: 'audio/wav' },
  aac: { kind: 'audio', mimeType: 'audio/aac' },
  ogg: { kind: 'audio', mimeType: 'audio/ogg' },
  flac: { kind: 'audio', mimeType: 'audio/flac' },
  webm: { kind: 'audio', mimeType: 'audio/webm' },
  m4a: { kind: 'audio', mimeType: 'audio/m4a' },
};

const normalizedMimeTypes: Record<string, { kind: StudyMaterialKind; mimeType: string }> = {
  'application/pdf': { kind: 'pdf', mimeType: 'application/pdf' },
  'audio/mpeg': { kind: 'audio', mimeType: 'audio/mpeg' },
  'audio/mp3': { kind: 'audio', mimeType: 'audio/mpeg' },
  'audio/wav': { kind: 'audio', mimeType: 'audio/wav' },
  'audio/x-wav': { kind: 'audio', mimeType: 'audio/wav' },
  'audio/aac': { kind: 'audio', mimeType: 'audio/aac' },
  'audio/ogg': { kind: 'audio', mimeType: 'audio/ogg' },
  'audio/flac': { kind: 'audio', mimeType: 'audio/flac' },
  'audio/webm': { kind: 'audio', mimeType: 'audio/webm' },
  'audio/m4a': { kind: 'audio', mimeType: 'audio/m4a' },
  'audio/mp4': { kind: 'audio', mimeType: 'audio/m4a' },
  'audio/x-m4a': { kind: 'audio', mimeType: 'audio/m4a' },
};

export type GeneratedFlashcard = {
  question: string;
  answer: string;
};

export type GeneratedQuizQuestion = {
  question: string;
  options: string[];
  correctOption: number;
  explanation: string;
};

export type StudyDocumentAnalysis = {
  title: string;
  summary: string;
  keyPoints: string[];
  flashcards: GeneratedFlashcard[];
  quizQuestions: GeneratedQuizQuestion[];
};

export type StudyDocument = {
  id: string;
  courseId: string | null;
  originalFilename: string;
  contentKind: StudyMaterialKind;
  analysisStatus: 'ready' | 'processing' | 'completed' | 'failed';
  analysis: StudyDocumentAnalysis | null;
  flashcardsImportedAt: string | null;
  lastError: string | null;
  createdAt: string;
};

export type QuizAttempt = {
  id: string;
  courseId: string | null;
  documentId: string | null;
  source: 'document' | 'flashcards';
  questionCount: number;
  correctCount: number;
  completedAt: string;
};

type StudyDocumentRow = {
  id: string;
  course_id: string | null;
  original_filename: string;
  content_kind: StudyMaterialKind;
  analysis_status: StudyDocument['analysisStatus'];
  analysis: unknown;
  flashcards_imported_at: string | null;
  last_error: string | null;
  created_at: string;
};

type QuizAttemptRow = {
  id: string;
  course_id: string | null;
  document_id: string | null;
  source: QuizAttempt['source'];
  question_count: number;
  correct_count: number;
  completed_at: string;
};

function clientOrThrow() {
  if (!supabase) throw new Error('Supabase no está configurado en esta instalación.');
  return supabase;
}

function asText(value: unknown, maximumLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maximumLength) : '';
}

function asTextList(value: unknown, count: number, maximumLength: number) {
  return Array.isArray(value)
    ? value.map((item) => asText(item, maximumLength)).filter(Boolean).slice(0, count)
    : [];
}

export function asStudyDocumentAnalysis(value: unknown): StudyDocumentAnalysis | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Record<string, unknown>;
  const title = asText(candidate.title, 160);
  const summary = asText(candidate.summary, 1800);
  if (!title || !summary) return null;

  const flashcards = Array.isArray(candidate.flashcards)
    ? candidate.flashcards.flatMap((card) => {
      if (!card || typeof card !== 'object') return [];
      const candidateCard = card as Record<string, unknown>;
      const question = asText(candidateCard.question, 800);
      const answer = asText(candidateCard.answer, 1200);
      return question && answer ? [{ question, answer }] : [];
    }).slice(0, 8)
    : [];
  const quizQuestions = Array.isArray(candidate.quizQuestions)
    ? candidate.quizQuestions.flatMap((quiz) => {
      if (!quiz || typeof quiz !== 'object') return [];
      const candidateQuestion = quiz as Record<string, unknown>;
      const question = asText(candidateQuestion.question, 800);
      const options = Array.isArray(candidateQuestion.options)
        ? candidateQuestion.options.map((option) => asText(option, 360))
        : [];
      const correctOption = typeof candidateQuestion.correctOption === 'number' ? candidateQuestion.correctOption : -1;
      const explanation = asText(candidateQuestion.explanation, 700);
      return question && options.length === 4 && options.every(Boolean) && new Set(options).size === 4 && correctOption >= 0 && correctOption < 4 && explanation
        ? [{ question, options, correctOption, explanation }]
        : [];
    }).slice(0, 5)
    : [];

  return {
    title,
    summary,
    keyPoints: asTextList(candidate.keyPoints, 8, 320),
    flashcards,
    quizQuestions,
  };
}

function mapDocument(row: StudyDocumentRow, courseKeyById: Map<string, string>): StudyDocument {
  return {
    id: row.id,
    // La aplicación conserva una clave local estable por curso para trabajar
    // sin conexión. Las tablas relacionadas usan el UUID de la base de datos,
    // que se convierte aquí para que las pantallas no dependan de ese detalle.
    courseId: row.course_id ? courseKeyById.get(row.course_id) ?? null : null,
    originalFilename: row.original_filename,
    contentKind: row.content_kind,
    analysisStatus: row.analysis_status,
    analysis: asStudyDocumentAnalysis(row.analysis),
    flashcardsImportedAt: row.flashcards_imported_at,
    lastError: row.last_error,
    createdAt: row.created_at,
  };
}

type RemoteCourseReference = {
  id: string;
  client_key: string;
};

async function getCourseReferences() {
  const { data, error } = await clientOrThrow()
    .from('student_courses')
    .select('id, client_key');
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as RemoteCourseReference[];
  return {
    databaseIdByClientKey: new Map(rows.map((course) => [course.client_key, course.id])),
    clientKeyByDatabaseId: new Map(rows.map((course) => [course.id, course.client_key])),
  };
}

async function getDatabaseCourseId(clientCourseId: string) {
  const { databaseIdByClientKey } = await getCourseReferences();
  const databaseCourseId = databaseIdByClientKey.get(clientCourseId);
  if (!databaseCourseId) {
    throw new Error('Tus cursos todavía se están sincronizando. Espera unos segundos e inténtalo nuevamente.');
  }
  return databaseCourseId;
}

async function readAsset(asset: DocumentPickerAsset, mimeType: string) {
  if (asset.file) {
    return new Blob([await asset.file.arrayBuffer()], { type: mimeType });
  }
  const response = await fetch(asset.uri);
  if (!response.ok) throw new Error('No se pudo abrir el material elegido.');
  // Algunos selectores Android etiquetan archivos válidos como text/plain.
  // Se conserva el contenido, pero se corrige el tipo con la extensión validada
  // antes de enviarlo a Storage y a Gemini.
  return new Blob([await response.arrayBuffer()], { type: mimeType });
}

function getAssetDescriptor(asset: DocumentPickerAsset) {
  const extension = asset.name.split('.').pop()?.toLowerCase() ?? '';
  const fromMime = asset.mimeType ? normalizedMimeTypes[asset.mimeType.toLowerCase()] : undefined;
  const fromExtension = mimeTypesByExtension[extension];
  const descriptor = fromMime ?? fromExtension;
  if (!descriptor || (fromMime && fromExtension && fromMime.kind !== fromExtension.kind)) {
    throw new Error('Elige un PDF o un audio MP3, WAV, M4A, AAC, OGG, FLAC o WEBM.');
  }
  return { ...descriptor, extension: extension || (descriptor.kind === 'pdf' ? 'pdf' : 'audio') };
}

function createStoragePath(userId: string, extension: string) {
  return `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`;
}

export function friendlyFunctionError(error: unknown, fallback = 'No se pudo completar la solicitud de IA.') {
  if (!error || typeof error !== 'object') return fallback;
  const candidate = error as {
    message?: unknown;
    context?: { json?: () => Promise<unknown>; text?: () => Promise<string> };
  };

  const userMessage = (value: unknown) => {
    if (typeof value !== 'string' || !value.trim()) return '';
    if (value.includes('La IA aún no está configurada')) {
      return 'La asistencia con IA se está preparando. Intenta nuevamente cuando esté disponible.';
    }
    if (/mime type|mime_type|not supported/i.test(value)) {
      return 'No pudimos reconocer el formato del archivo. Elige un PDF o un audio compatible (MP3, WAV, M4A, AAC, OGG, FLAC o WEBM).';
    }
    return value.trim();
  };

  if (candidate.context?.json) {
    return candidate.context.json()
      .then((body) => typeof body === 'object' && body && 'error' in body ? userMessage(body.error) : '')
      .catch(async () => {
        if (!candidate.context?.text) return '';
        return userMessage(await candidate.context.text().catch(() => ''));
      });
  }
  return Promise.resolve(userMessage(candidate.message) || fallback);
}

export async function listStudyDocuments() {
  const client = clientOrThrow();
  const [{ data, error }, { clientKeyByDatabaseId }] = await Promise.all([
    client
      .from('student_study_documents')
      .select('id, course_id, original_filename, content_kind, analysis_status, analysis, flashcards_imported_at, last_error, created_at')
      .order('created_at', { ascending: false }),
    getCourseReferences(),
  ]);
  if (error) throw new Error(error.message);
  return ((data ?? []) as StudyDocumentRow[]).map((document) => mapDocument(document, clientKeyByDatabaseId));
}

export async function getAiDocumentConsent() {
  const client = clientOrThrow();
  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError || !userData.user) return false;
  const { data, error } = await client
    .from('student_profiles')
    .select('ai_document_consent_at')
    .eq('id', userData.user.id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return Boolean(data?.ai_document_consent_at);
}

export async function recordAiDocumentConsent() {
  const client = clientOrThrow();
  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError || !userData.user) throw new Error('Inicia sesión para aceptar el uso de IA.');
  const { error } = await client
    .from('student_profiles')
    .update({ ai_document_consent_at: new Date().toISOString() })
    .eq('id', userData.user.id);
  if (error) throw new Error(error.message);
}

export async function uploadStudyDocument({ asset, courseId }: { asset: DocumentPickerAsset; courseId: string }) {
  const client = clientOrThrow();
  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError || !userData.user) throw new Error('Inicia sesión para guardar un material.');
  const descriptor = getAssetDescriptor(asset);
  const databaseCourseId = await getDatabaseCourseId(courseId);

  const file = await readAsset(asset, descriptor.mimeType);
  if (!file.size || file.size > MAX_STUDY_MATERIAL_BYTES) throw new Error('El PDF o audio debe pesar como máximo 12 MB.');

  const storagePath = createStoragePath(userData.user.id, descriptor.extension);
  const { data: document, error: documentError } = await client
    .from('student_study_documents')
    .insert({
      user_id: userData.user.id,
      course_id: databaseCourseId,
      storage_path: storagePath,
      original_filename: asset.name.slice(0, 180),
      mime_type: descriptor.mimeType,
      content_kind: descriptor.kind,
      byte_size: file.size,
    })
    .select('id')
    .single();
  if (documentError || !document) throw new Error(documentError?.message ?? 'No se pudo preparar el documento.');

  const { error: uploadError } = await client.storage.from(DOCUMENT_BUCKET).upload(storagePath, file, {
    contentType: descriptor.mimeType,
    upsert: false,
  });
  if (uploadError) {
    await client.from('student_study_documents').delete().eq('id', document.id);
    if (/mime type|mime_type|not supported/i.test(uploadError.message)) {
      throw new Error('No pudimos reconocer el formato del archivo. Elige un PDF o un audio compatible (MP3, WAV, M4A, AAC, OGG, FLAC o WEBM).');
    }
    throw new Error(uploadError.message);
  }

  return { documentId: document.id };
}

export async function analyzeStudyDocument(documentId: string) {
  const { data, error } = await clientOrThrow().functions.invoke('analyze-study-document', {
    body: { documentId },
  });
  if (error) {
    const message = await friendlyFunctionError(error, 'No se pudo analizar el material.');
    throw new Error(message || 'No se pudo analizar el material.');
  }
  const analysis = asStudyDocumentAnalysis((data as { analysis?: unknown } | null)?.analysis);
  if (!analysis) throw new Error('La IA no devolvió un análisis utilizable.');
  return analysis;
}

export async function markDocumentFlashcardsImported(documentId: string) {
  const { error } = await clientOrThrow()
    .from('student_study_documents')
    .update({ flashcards_imported_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', documentId);
  if (error) throw new Error(error.message);
}

export async function deleteStudyDocument(document: StudyDocument) {
  const client = clientOrThrow();
  const { data: record, error: readError } = await client
    .from('student_study_documents')
    .select('storage_path')
    .eq('id', document.id)
    .single();
  if (readError || !record) throw new Error('No se pudo encontrar el documento.');

  const { error: storageError } = await client.storage.from(DOCUMENT_BUCKET).remove([record.storage_path]);
  if (storageError) throw new Error(storageError.message);
  const { error: deleteError } = await client.from('student_study_documents').delete().eq('id', document.id);
  if (deleteError) throw new Error(deleteError.message);
}

export async function recordQuizAttempt(input: {
  courseId: string | null;
  documentId: string | null;
  source: QuizAttempt['source'];
  questionCount: number;
  correctCount: number;
  incorrectQuestionIndexes: number[];
}) {
  const client = clientOrThrow();
  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError || !userData.user) return;
  const databaseCourseId = input.courseId ? await getDatabaseCourseId(input.courseId) : null;
  const { error } = await client.from('student_quiz_attempts').insert({
    user_id: userData.user.id,
    course_id: databaseCourseId,
    document_id: input.documentId,
    source: input.source,
    question_count: input.questionCount,
    correct_count: input.correctCount,
    incorrect_question_indexes: input.incorrectQuestionIndexes,
  });
  if (error) throw new Error(error.message);
}

export async function listQuizAttempts() {
  const [{ data, error }, { clientKeyByDatabaseId }] = await Promise.all([
    clientOrThrow()
      .from('student_quiz_attempts')
      .select('id, course_id, document_id, source, question_count, correct_count, completed_at')
      .order('completed_at', { ascending: false })
      .limit(30),
    getCourseReferences(),
  ]);
  if (error) throw new Error(error.message);
  return ((data ?? []) as QuizAttemptRow[]).map((attempt) => ({
    id: attempt.id,
    courseId: attempt.course_id ? clientKeyByDatabaseId.get(attempt.course_id) ?? null : null,
    documentId: attempt.document_id,
    source: attempt.source,
    questionCount: attempt.question_count,
    correctCount: attempt.correct_count,
    completedAt: attempt.completed_at,
  }));
}
