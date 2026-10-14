import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const DOCUMENT_BUCKET = 'koda-study-documents';
const AVATAR_BUCKET = 'koda-profile-avatars';
const corsHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Origin': '*',
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
      // Mantiene compatibilidad con proyectos que aún usan la variable heredada.
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
      // Mantiene compatibilidad con proyectos que aún usan la variable heredada.
    }
  }
  return Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
}

async function removeStudentFiles(
  client: ReturnType<typeof createClient>,
  userId: string,
  bucket: string,
  failureMessage: string,
) {
  // Se consulta desde el inicio en cada vuelta: luego de borrar una página,
  // la siguiente ocupa el mismo lugar. Así no se dejan materiales atrás si
  // una cuenta acumuló más de mil archivos.
  while (true) {
    const { data, error } = await client.storage.from(bucket).list(userId, { limit: 1000 });
    if (error) throw new Error(failureMessage);

    const paths = (data ?? [])
      .filter((item) => item.id !== null)
      .map((item) => `${userId}/${item.name}`);
    if (!paths.length) return;

    const { error: removeError } = await client.storage.from(bucket).remove(paths);
    if (removeError) throw new Error(failureMessage);
  }
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Método no permitido.' }, 405);

  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) return json({ error: 'Inicia sesión para eliminar tu cuenta.' }, 401);

  const url = Deno.env.get('SUPABASE_URL') ?? '';
  const publishableKey = getPublishableKey();
  const secretKey = getSecretKey();
  if (!url || !publishableKey || !secretKey) return json({ error: 'La función no tiene configuración de Supabase.' }, 500);

  const body = await request.json().catch(() => null) as { confirmation?: unknown } | null;
  if (body?.confirmation !== 'DELETE_MY_ACCOUNT') {
    return json({ error: 'Confirma la eliminación de tu cuenta antes de continuar.' }, 400);
  }

  const token = authorization.replace('Bearer ', '');
  const userClient = createClient(url, publishableKey, {
    global: { headers: { Authorization: authorization } },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser(token);
  if (userError || !userData.user) return json({ error: 'Tu sesión ya no es válida.' }, 401);

  const adminClient = createClient(url, secretKey);
  try {
    // Supabase no borra un usuario Auth dueño de objetos Storage. Primero se
    // eliminan únicamente los objetos bajo su UUID y luego las filas hacen
    // cascade mediante sus claves foráneas hacia auth.users.
    await removeStudentFiles(adminClient, userData.user.id, DOCUMENT_BUCKET, 'No se pudieron borrar tus materiales privados.');
    await removeStudentFiles(adminClient, userData.user.id, AVATAR_BUCKET, 'No se pudo borrar tu foto de perfil privada.');
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userData.user.id, false);
    if (deleteError) {
      console.error('No se pudo eliminar la cuenta de KODA', deleteError.message);
      return json({ error: 'No se pudo eliminar tu cuenta. Inténtalo nuevamente.' }, 500);
    }
  } catch (error) {
    console.error('No se pudo completar la eliminación de cuenta', error);
    return json({ error: error instanceof Error ? error.message : 'No se pudo eliminar tu cuenta.' }, 500);
  }

  return json({ deleted: true });
});
