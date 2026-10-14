import { friendlyFunctionError } from '@/features/ai/study-documents';
import { supabase } from '@/lib/supabase';

export type StudyCoachReply = {
  answer: string;
  historySaved: boolean;
};

export type StudyCoachMessage = {
  id: string;
  role: 'assistant' | 'student';
  text: string;
  createdAt: string;
};

export type GeneratedCourseFlashcard = {
  question: string;
  answer: string;
};

type StudyCoachMessageRow = {
  id: string;
  role: StudyCoachMessage['role'];
  content: string;
  created_at: string;
};

function clientOrThrow() {
  if (!supabase) throw new Error('Supabase no está configurado en esta instalación.');
  return supabase;
}

export async function listStudyCoachMessages() {
  const { data, error } = await clientOrThrow()
    .from('student_coach_messages')
    .select('id, role, content, created_at')
    .order('created_at', { ascending: false })
    .limit(80);
  if (error) throw new Error(error.message);

  return ((data ?? []) as StudyCoachMessageRow[])
    .reverse()
    .map((message) => ({
      id: message.id,
      role: message.role,
      text: message.content,
      createdAt: message.created_at,
    })) satisfies StudyCoachMessage[];
}

export async function clearStudyCoachMessages() {
  const client = clientOrThrow();
  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError || !userData.user) throw new Error('Inicia sesión para borrar el historial.');

  const { error } = await client
    .from('student_coach_messages')
    .delete()
    .eq('user_id', userData.user.id);
  if (error) throw new Error(error.message);
}

export async function askStudyCoach(input: { message: string; documentId?: string }) {
  const message = input.message.trim();
  if (!message) throw new Error('Escribe una pregunta para KODA.');
  if (message.length > 1200) throw new Error('Tu pregunta debe tener como máximo 1200 caracteres.');

  const { data, error } = await clientOrThrow().functions.invoke('study-coach', {
    body: { message, documentId: input.documentId || undefined },
  });
  if (error) {
    const friendlyMessage = await friendlyFunctionError(error, 'No se pudo recibir una respuesta de KODA.');
    throw new Error(friendlyMessage || 'No se pudo recibir una respuesta de KODA.');
  }

  const result = data as { answer?: unknown; historySaved?: unknown } | null;
  if (!result || typeof result.answer !== 'string' || !result.answer.trim()) {
    throw new Error('KODA no devolvió una respuesta utilizable.');
  }
  return {
    answer: result.answer.trim().slice(0, 2400),
    historySaved: result.historySaved !== false,
  } satisfies StudyCoachReply;
}

export async function generateCourseFlashcards(courseId: string) {
  if (!courseId.trim()) throw new Error('Selecciona un curso para generar tarjetas.');

  const { data, error } = await clientOrThrow().functions.invoke('study-coach', {
    body: { action: 'flashcards', courseId },
  });
  if (error) {
    const friendlyMessage = await friendlyFunctionError(error, 'No se pudieron generar las tarjetas.');
    throw new Error(friendlyMessage || 'No se pudieron generar las tarjetas.');
  }

  const rawCards = (data as { flashcards?: unknown } | null)?.flashcards;
  const flashcards = Array.isArray(rawCards)
    ? rawCards.flatMap((card) => {
      if (!card || typeof card !== 'object') return [];
      const value = card as Record<string, unknown>;
      const question = typeof value.question === 'string' ? value.question.trim().slice(0, 800) : '';
      const answer = typeof value.answer === 'string' ? value.answer.trim().slice(0, 1200) : '';
      return question && answer ? [{ question, answer }] : [];
    })
    : [];
  if (flashcards.length < 3) throw new Error('KODA no devolvió suficientes tarjetas útiles. Intenta nuevamente.');
  return flashcards satisfies GeneratedCourseFlashcard[];
}
