import { friendlyFunctionError } from '@/features/ai/study-documents';
import { supabase } from '@/lib/supabase';

export type StudyCoachReply = {
  answer: string;
  remainingMessages: number;
};

function clientOrThrow() {
  if (!supabase) throw new Error('Supabase no está configurado en esta instalación.');
  return supabase;
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

  const result = data as { answer?: unknown; remainingMessages?: unknown } | null;
  if (!result || typeof result.answer !== 'string' || !result.answer.trim()) {
    throw new Error('KODA no devolvió una respuesta utilizable.');
  }
  return {
    answer: result.answer.trim().slice(0, 2400),
    remainingMessages: typeof result.remainingMessages === 'number' ? Math.max(0, result.remainingMessages) : 0,
  } satisfies StudyCoachReply;
}
