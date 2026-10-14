import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const DOCUMENT_BUCKET = 'koda-study-documents';
const MAX_STUDY_MATERIAL_BYTES = 12 * 1024 * 1024;
const supportedMimeTypes = new Set([
  'application/pdf',
  'audio/mpeg',
  'audio/wav',
  'audio/aac',
  'audio/ogg',
  'audio/flac',
  'audio/webm',
  'audio/m4a',
]);
const corsHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Origin': '*',
};

function studySchema(flashcardCount: number) {
  return {
  type: 'object',
  properties: {
    title: { type: 'string' },
    summary: { type: 'string' },
    keyPoints: { type: 'array', items: { type: 'string' } },
    flashcards: {
      type: 'array',
      minItems: flashcardCount,
      maxItems: flashcardCount,
      items: {
        type: 'object',
        properties: {
          question: { type: 'string' },
          answer: { type: 'string' },
        },
        required: ['question', 'answer'],
      },
    },
    quizQuestions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          question: { type: 'string' },
          options: { type: 'array', items: { type: 'string' } },
          correctOption: { type: 'integer' },
          explanation: { type: 'string' },
        },
        required: ['question', 'options', 'correctOption', 'explanation'],
      },
    },
  },
  required: ['title', 'summary', 'keyPoints', 'flashcards', 'quizQuestions'],
  };
}

const syllabusSchema = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    summary: { type: 'string' },
    keyPoints: { type: 'array', items: { type: 'string' } },
    flashcards: { type: 'array', items: { type: 'object', properties: { question: { type: 'string' }, answer: { type: 'string' } }, required: ['question', 'answer'] } },
    quizQuestions: { type: 'array', items: { type: 'object', properties: { question: { type: 'string' }, options: { type: 'array', items: { type: 'string' } }, correctOption: { type: 'integer' }, explanation: { type: 'string' } }, required: ['question', 'options', 'correctOption', 'explanation'] } },
    syllabus: {
      type: 'object',
      properties: {
        units: { type: 'array', items: { type: 'object', properties: { title: { type: 'string' }, topics: { type: 'array', items: { type: 'string' } } }, required: ['title', 'topics'] } },
        calendarEvents: { type: 'array', items: { type: 'object', properties: { title: { type: 'string' }, dateIso: { type: 'string' }, type: { type: 'string', enum: ['evaluation', 'activity'] } }, required: ['title', 'dateIso', 'type'] } },
      },
      required: ['units', 'calendarEvents'],
    },
  },
  required: ['title', 'summary', 'keyPoints', 'flashcards', 'quizQuestions', 'syllabus'],
};

type StudyDocument = {
  id: string;
  storage_path: string;
  mime_type: string;
  content_kind: 'pdf' | 'audio';
  document_role?: 'study_material' | 'syllabus';
  flashcard_target?: number;
  analysis_status: string;
  analysis: unknown;
};

type GeminiPayload = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function getPublishableKey() {
  const serializedKeys = Deno.env.get('SUPABASE_PUBLISHABLE_KEYS');
  if (serializedKeys) {
    try {
      const keys = JSON.parse(serializedKeys) as Record<string, string>;
      return keys.default ?? Object.values(keys)[0] ?? '';
    } catch {
      // El proyecto puede usar las variables heredadas durante la transición de claves.
    }
  }
  return Deno.env.get('SUPABASE_ANON_KEY') ?? '';
}

function getSecretKey() {
  const serializedKeys = Deno.env.get('SUPABASE_SECRET_KEYS');
  if (serializedKeys) {
    try {
      const keys = JSON.parse(serializedKeys) as Record<string, string>;
      return keys.default ?? Object.values(keys)[0] ?? '';
    } catch {
      // Los proyectos que no migraron aún pueden usar la variable heredada.
    }
  }
  return Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
}

function toBase64(bytes: Uint8Array) {
  let result = '';
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    result += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }
  return btoa(result);
}

function asText(value: unknown, maximumLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maximumLength) : '';
}

function asTextList(value: unknown, maxItems: number, maximumLength: number) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => asText(item, maximumLength))
    .filter(Boolean)
    .slice(0, maxItems);
}

function normalizeSyllabus(value: unknown) {
  if (!value || typeof value !== 'object') return undefined;
  const candidate = value as Record<string, unknown>;
  const units = Array.isArray(candidate.units)
    ? candidate.units.flatMap((item) => {
      if (!item || typeof item !== 'object') return [];
      const unit = item as Record<string, unknown>;
      const title = asText(unit.title, 180);
      const topics = asTextList(unit.topics, 12, 220);
      return title && topics.length ? [{ title, topics }] : [];
    }).slice(0, 12)
    : [];
  const calendarEvents = Array.isArray(candidate.calendarEvents)
    ? candidate.calendarEvents.flatMap((item) => {
      if (!item || typeof item !== 'object') return [];
      const event = item as Record<string, unknown>;
      const title = asText(event.title, 180);
      const dateIso = asText(event.dateIso, 10);
      const type = event.type === 'activity' ? 'activity' : event.type === 'evaluation' ? 'evaluation' : null;
      return title && /^\d{4}-\d{2}-\d{2}$/.test(dateIso) && type ? [{ title, dateIso, type }] : [];
    }).slice(0, 20)
    : [];
  return units.length || calendarEvents.length ? { units, calendarEvents } : undefined;
}

function normalizeAnalysis(value: unknown, role: StudyDocument['document_role'], flashcardTarget: number) {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Record<string, unknown>;
  const title = asText(candidate.title, 160);
  const summary = asText(candidate.summary, 1800);
  const keyPoints = asTextList(candidate.keyPoints, 8, 320);
  const flashcards = Array.isArray(candidate.flashcards)
    ? candidate.flashcards.flatMap((item) => {
      if (!item || typeof item !== 'object') return [];
      const card = item as Record<string, unknown>;
      const question = asText(card.question, 800);
      const answer = asText(card.answer, 1200);
      return question && answer ? [{ question, answer }] : [];
    }).slice(0, flashcardTarget)
    : [];
  const quizQuestions = Array.isArray(candidate.quizQuestions)
    ? candidate.quizQuestions.flatMap((item) => {
      if (!item || typeof item !== 'object') return [];
      const question = item as Record<string, unknown>;
      const prompt = asText(question.question, 800);
      const options = Array.isArray(question.options)
        ? question.options.map((option) => asText(option, 360))
        : [];
      const correctOption = typeof question.correctOption === 'number' ? question.correctOption : -1;
      const explanation = asText(question.explanation, 700);
      return prompt && options.length === 4 && options.every(Boolean) && new Set(options).size === 4 && correctOption >= 0 && correctOption < options.length && explanation
        ? [{ question: prompt, options, correctOption, explanation }]
        : [];
    }).slice(0, 5)
    : [];

  if (!title || !summary) return null;
  const syllabus = role === 'syllabus' ? normalizeSyllabus(candidate.syllabus) : undefined;
  if (role === 'syllabus' && !syllabus) return null;
  return { title, summary, keyPoints, flashcards, quizQuestions, ...(syllabus ? { syllabus } : {}) };
}

function readGeminiText(payload: GeminiPayload) {
  return payload.candidates
    ?.flatMap((candidate) => candidate.content?.parts ?? [])
    .map((part) => part.text ?? '')
    .join('')
    .trim() ?? '';
}

async function markDocument(
  client: ReturnType<typeof createClient>,
  documentId: string,
  values: Record<string, unknown>,
) {
  const { error } = await client
    .from('student_study_documents')
    .update({ ...values, updated_at: new Date().toISOString() })
    .eq('id', documentId);
  if (error) console.error('No se pudo actualizar el estado del documento', error.message);
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Método no permitido.' }, 405);

  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) return json({ error: 'Inicia sesión para analizar un documento.' }, 401);

  const url = Deno.env.get('SUPABASE_URL') ?? '';
  const publishableKey = getPublishableKey();
  const secretKey = getSecretKey();
  if (!url || !publishableKey || !secretKey) return json({ error: 'La función no tiene configuración de Supabase.' }, 500);

  const client = createClient(url, publishableKey, {
    global: { headers: { Authorization: authorization } },
  });
  const adminClient = createClient(url, secretKey);
  const token = authorization.replace('Bearer ', '');
  const { data: userData, error: userError } = await client.auth.getUser(token);
  if (userError || !userData.user) return json({ error: 'Tu sesión ya no es válida.' }, 401);

  const body = await request.json().catch(() => null) as { documentId?: unknown } | null;
  const documentId = typeof body?.documentId === 'string' ? body.documentId : '';
  if (!documentId) return json({ error: 'Selecciona un documento válido.' }, 400);

  const { data, error: documentError } = await client
    .from('student_study_documents')
    .select('id, storage_path, mime_type, content_kind, document_role, flashcard_target, analysis_status, analysis')
    .eq('id', documentId)
    .maybeSingle();
  const document = data as StudyDocument | null;
  if (documentError || !document) return json({ error: 'No tienes acceso a este documento.' }, 404);
  if (document.analysis_status === 'completed' && document.analysis) return json({ analysis: document.analysis });
  if (document.analysis_status === 'processing') return json({ error: 'Este documento ya se está analizando.' }, 409);
  if (!document.storage_path.startsWith(`${userData.user.id}/`)) return json({ error: 'Documento no autorizado.' }, 403);
  const flashcardTarget = Math.max(1, Math.min(8, Number.isInteger(document.flashcard_target) ? document.flashcard_target! : 3));

  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) {
    await markDocument(adminClient, document.id, {
      analysis_status: 'failed',
      last_error: 'La asistencia con IA todavía se está preparando. Tu material sigue guardado y podrás reintentarlo.',
    });
    return json({ error: 'La IA aún no está configurada para este entorno.' }, 503);
  }

  const { data: material, error: downloadError } = await client.storage.from(DOCUMENT_BUCKET).download(document.storage_path);
  if (downloadError || !material || !supportedMimeTypes.has(document.mime_type) || material.size > MAX_STUDY_MATERIAL_BYTES) {
    await markDocument(adminClient, document.id, {
      analysis_status: 'failed',
      last_error: 'El material no pudo leerse, tiene un formato no permitido o supera los 12 MB.',
    });
    return json({ error: 'Solo se aceptan PDF o audios compatibles de hasta 12 MB.' }, 400);
  }

  const quotaOperation = document.content_kind === 'audio' ? 'document_audio' : 'document_pdf';
  const quotaLimit = document.content_kind === 'audio' ? 5 : 3;
  const { data: quotaData, error: quotaError } = await adminClient.rpc('consume_koda_ai_quota', {
    requested_user_id: userData.user.id,
    requested_operation: quotaOperation,
  });
  const quota = quotaData as { allowed?: boolean; remaining?: number } | null;
  if (quotaError) {
    console.error('No se pudo consumir la cuota de IA', quotaError.message);
    return json({ error: 'No se pudo validar tu cuota de IA.' }, 500);
  }
  if (!quota?.allowed) return json({ error: `Alcanzaste el límite diario de ${quotaLimit} ${document.content_kind === 'audio' ? 'audios' : 'PDFs'} analizados.` }, 429);

  await markDocument(adminClient, document.id, { analysis_status: 'processing', last_error: null });

  const model = Deno.env.get('GEMINI_MODEL') ?? 'gemini-3.5-flash-lite';
  const geminiResponse = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [
            { inlineData: { mimeType: document.mime_type, data: toBase64(new Uint8Array(await material.arrayBuffer())) } },
            {
              text: [
                document.document_role === 'syllabus'
                  ? 'Analiza exclusivamente este sílabo PDF. Extrae solo las unidades y temas que estén escritos. Incluye en calendarEvents únicamente evaluaciones o actividades con una fecha completa y explícita; normaliza DD/MM/AAAA o una fecha textual completa a YYYY-MM-DD, pero nunca adivines año, fecha ni contenidos. La agenda es una propuesta que el estudiante revisará.'
                  : document.content_kind === 'audio'
                  ? 'Analiza exclusivamente este audio de estudio para una semana de exámenes. Identifica con cautela las ideas expresadas; si una parte no es audible, no la inventes.'
                  : 'Analiza exclusivamente este PDF para una semana de exámenes.',
                'No inventes información ni uses fuentes externas.',
                `Escribe en español claro. Resume las ideas verificables, crea exactamente ${flashcardTarget} flashcards útiles y 3 a 5 preguntas de opción múltiple.`,
                'Cada pregunta debe tener exactamente cuatro opciones, un índice correctOption de 0 a 3 y una explicación breve.',
              ].join(' '),
            },
          ],
        }],
        generationConfig: {
          maxOutputTokens: 2200,
          responseMimeType: 'application/json',
          responseJsonSchema: document.document_role === 'syllabus' ? syllabusSchema : studySchema(flashcardTarget),
        },
      }),
    },
  );

  if (!geminiResponse.ok) {
    console.error('Gemini no pudo analizar el documento', geminiResponse.status);
    await markDocument(adminClient, document.id, {
      analysis_status: 'failed',
      last_error: geminiResponse.status === 429
        ? 'Gemini está ocupado. Intenta nuevamente más tarde.'
        : 'Gemini no pudo analizar el documento en este momento.',
    });
    return json({ error: geminiResponse.status === 429 ? 'Gemini está temporalmente ocupado. Intenta luego.' : 'No fue posible analizar el documento.' }, geminiResponse.status === 429 ? 429 : 502);
  }

  const outputText = readGeminiText(await geminiResponse.json() as GeminiPayload);
  let analysis = null;
  try {
    analysis = normalizeAnalysis(JSON.parse(outputText), document.document_role, flashcardTarget);
  } catch {
    analysis = null;
  }
  if (!analysis) {
    await markDocument(adminClient, document.id, {
      analysis_status: 'failed',
      last_error: 'Gemini devolvió un formato que KODA no puede usar.',
    });
    return json({ error: 'La IA devolvió un análisis no utilizable. Intenta con otro material.' }, 502);
  }

  await markDocument(adminClient, document.id, {
    analysis_status: 'completed',
    analysis,
    analysis_completed_at: new Date().toISOString(),
    last_error: null,
  });
  return json({ analysis, remainingAnalyses: quota.remaining ?? 0 });
});
