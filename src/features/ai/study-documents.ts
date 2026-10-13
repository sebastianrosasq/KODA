import type { DocumentPickerAsset } from 'expo-document-picker';

import { supabase } from '@/lib/supabase';

const DOCUMENT_BUCKET = 'koda-study-documents';
const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;

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

function mapDocument(row: StudyDocumentRow): StudyDocument {
  return {
    id: row.id,
    courseId: row.course_id,
    originalFilename: row.original_filename,
    analysisStatus: row.analysis_status,
    analysis: asStudyDocumentAnalysis(row.analysis),
    flashcardsImportedAt: row.flashcards_imported_at,
    lastError: row.last_error,
    createdAt: row.created_at,
  };
}

async function readAsset(asset: DocumentPickerAsset) {
  if (asset.file) return asset.file;
  const response = await fetch(asset.uri);
  if (!response.ok) throw new Error('No se pudo abrir el PDF elegido.');
  return response.blob();
}

function createStoragePath(userId: string) {
  return `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.pdf`;
}

function friendlyFunctionError(error: unknown) {
  if (!error || typeof error !== 'object') return 'No se pudo analizar el documento.';
  const candidate = error as { message?: unknown; context?: { json?: () => Promise<unknown> } };
  if (candidate.context?.json) {
    return candidate.context.json()
      .then((body) => typeof body === 'object' && body && 'error' in body && typeof body.error === 'string' ? body.error : '')
      .catch(() => '');
  }
  return Promise.resolve(typeof candidate.message === 'string' ? candidate.message : 'No se pudo analizar el documento.');
}

export async function listStudyDocuments() {
  const client = clientOrThrow();
  const { data, error } = await client
    .from('student_study_documents')
    .select('id, course_id, original_filename, analysis_status, analysis, flashcards_imported_at, last_error, created_at')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as StudyDocumentRow[]).map(mapDocument);
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

export async function uploadAndAnalyzeStudyDocument({ asset, courseId }: { asset: DocumentPickerAsset; courseId: string }) {
  const client = clientOrThrow();
  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError || !userData.user) throw new Error('Inicia sesión para analizar un PDF.');
  if (!asset.name.toLowerCase().endsWith('.pdf') || (asset.mimeType && asset.mimeType !== 'application/pdf')) {
    throw new Error('Elige un archivo PDF.');
  }

  const file = await readAsset(asset);
  if (!file.size || file.size > MAX_DOCUMENT_BYTES) throw new Error('El PDF debe pesar como máximo 10 MB.');

  const storagePath = createStoragePath(userData.user.id);
  const { data: document, error: documentError } = await client
    .from('student_study_documents')
    .insert({
      user_id: userData.user.id,
      course_id: courseId,
      storage_path: storagePath,
      original_filename: asset.name.slice(0, 180),
      mime_type: 'application/pdf',
      byte_size: file.size,
    })
    .select('id')
    .single();
  if (documentError || !document) throw new Error(documentError?.message ?? 'No se pudo preparar el documento.');

  const { error: uploadError } = await client.storage.from(DOCUMENT_BUCKET).upload(storagePath, file, {
    contentType: 'application/pdf',
    upsert: false,
  });
  if (uploadError) {
    await client.from('student_study_documents').delete().eq('id', document.id);
    throw new Error(uploadError.message);
  }

  const analysis = await analyzeStudyDocument(document.id);
  return { documentId: document.id, analysis };
}

export async function analyzeStudyDocument(documentId: string) {
  const { data, error } = await clientOrThrow().functions.invoke('analyze-study-document', {
    body: { documentId },
  });
  if (error) {
    const message = await friendlyFunctionError(error);
    throw new Error(message || 'No se pudo analizar el documento.');
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
  const { error } = await client.from('student_quiz_attempts').insert({
    user_id: userData.user.id,
    course_id: input.courseId,
    document_id: input.documentId,
    source: input.source,
    question_count: input.questionCount,
    correct_count: input.correctCount,
    incorrect_question_indexes: input.incorrectQuestionIndexes,
  });
  if (error) throw new Error(error.message);
}

export async function listQuizAttempts() {
  const { data, error } = await clientOrThrow()
    .from('student_quiz_attempts')
    .select('id, course_id, document_id, source, question_count, correct_count, completed_at')
    .order('completed_at', { ascending: false })
    .limit(30);
  if (error) throw new Error(error.message);
  return ((data ?? []) as QuizAttemptRow[]).map((attempt) => ({
    id: attempt.id,
    courseId: attempt.course_id,
    documentId: attempt.document_id,
    source: attempt.source,
    questionCount: attempt.question_count,
    correctCount: attempt.correct_count,
    completedAt: attempt.completed_at,
  }));
}
