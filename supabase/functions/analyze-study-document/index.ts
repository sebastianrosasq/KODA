import '@supabase/functions-js/edge-runtime.d.ts';
import { withSupabase } from '@supabase/server';

const DOCUMENT_BUCKET = 'koda-study-documents';
const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;

const studySchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    title: { type: 'string' },
    summary: { type: 'string' },
    key_points: { type: 'array', items: { type: 'string' } },
    flashcards: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          question: { type: 'string' },
          answer: { type: 'string' },
        },
        required: ['question', 'answer'],
      },
    },
  },
  required: ['title', 'summary', 'key_points', 'flashcards'],
};

function response(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

function toBase64(bytes: Uint8Array) {
  let binary = '';
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }
  return btoa(binary);
}

function readOutputText(payload: { output?: Array<{ type?: string; content?: Array<{ type?: string; text?: string }> }> }) {
  const message = payload.output?.find((item) => item.type === 'message');
  return message?.content?.find((item) => item.type === 'output_text')?.text ?? null;
}

export default {
  fetch: withSupabase({ auth: 'user' }, async (request, context) => {
    if (request.method !== 'POST') return response('Método no permitido.', 405);

    const payload = await request.json().catch(() => null) as { storagePath?: unknown } | null;
    const storagePath = typeof payload?.storagePath === 'string' ? payload.storagePath : '';
    const userId = context.userClaims?.sub;
    if (!userId || !storagePath || storagePath.includes('..') || !storagePath.startsWith(`${userId}/`)) {
      return response('Documento no autorizado.', 403);
    }

    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) return response('El análisis con IA aún no está configurado.', 503);

    const { data: document, error: downloadError } = await context.supabase.storage
      .from(DOCUMENT_BUCKET)
      .download(storagePath);
    if (downloadError || !document) return response('No se pudo acceder al documento solicitado.', 404);
    if (document.type !== 'application/pdf' || document.size > MAX_DOCUMENT_BYTES) {
      return response('Solo se aceptan PDF de hasta 10 MB.', 400);
    }

    const bytes = new Uint8Array(await document.arrayBuffer());
    const openAiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: Deno.env.get('OPENAI_MODEL') ?? 'gpt-6-astra',
        input: [{
          role: 'user',
          content: [
            {
              type: 'input_file',
              filename: storagePath.split('/').pop() ?? 'documento.pdf',
              file_data: `data:application/pdf;base64,${toBase64(bytes)}`,
              detail: 'low',
            },
            {
              type: 'input_text',
              text: 'Resume este material para estudiar en semana de exámenes. Devuelve ideas verificables del documento, sin inventar datos. Crea entre 3 y 8 flashcards breves cuando el contenido lo permita.',
            },
          ],
        }],
        max_output_tokens: 1400,
        text: {
          format: {
            type: 'json_schema',
            name: 'study_document_analysis',
            strict: true,
            schema: studySchema,
          },
        },
      }),
    });

    if (!openAiResponse.ok) {
      console.error('OpenAI request failed', openAiResponse.status);
      return response('No fue posible analizar el documento en este momento.', 502);
    }

    const outputText = readOutputText(await openAiResponse.json());
    if (!outputText) return response('La IA no devolvió un análisis utilizable.', 502);

    try {
      return Response.json({ analysis: JSON.parse(outputText) });
    } catch {
      return response('La IA devolvió un formato inesperado.', 502);
    }
  }),
};
