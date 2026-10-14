import type { ImagePickerAsset } from 'expo-image-picker';

import { supabase } from '@/lib/supabase';

const AVATAR_BUCKET = 'koda-profile-avatars';
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

const imageTypesByExtension: Record<string, { extension: string; mimeType: string }> = {
  jpeg: { extension: 'jpg', mimeType: 'image/jpeg' },
  jpg: { extension: 'jpg', mimeType: 'image/jpeg' },
  png: { extension: 'png', mimeType: 'image/png' },
  webp: { extension: 'webp', mimeType: 'image/webp' },
};

const imageTypesByMime: Record<string, { extension: string; mimeType: string }> = {
  'image/jpeg': { extension: 'jpg', mimeType: 'image/jpeg' },
  'image/jpg': { extension: 'jpg', mimeType: 'image/jpeg' },
  'image/png': { extension: 'png', mimeType: 'image/png' },
  'image/webp': { extension: 'webp', mimeType: 'image/webp' },
};

function clientOrThrow() {
  if (!supabase) throw new Error('Supabase no está configurado en esta instalación.');
  return supabase;
}

function getDescriptor(asset: ImagePickerAsset) {
  const extension = asset.fileName?.split('.').pop()?.toLocaleLowerCase()
    ?? asset.uri.split('?')[0].split('.').pop()?.toLocaleLowerCase()
    ?? '';
  const descriptor = asset.mimeType ? imageTypesByMime[asset.mimeType.toLocaleLowerCase()] : undefined;
  const fallback = imageTypesByExtension[extension];
  const result = descriptor ?? fallback;
  if (!result) {
    throw new Error('Elige una foto JPG, PNG o WEBP de hasta 5 MB.');
  }
  return result;
}

async function readAvatar(asset: ImagePickerAsset) {
  if (!asset.uri) throw new Error('No pudimos leer la foto seleccionada. Inténtalo nuevamente.');
  const response = await fetch(asset.uri);
  if (!response.ok) throw new Error('No pudimos abrir la foto seleccionada. Inténtalo nuevamente.');
  const body = await response.arrayBuffer();
  if (!body.byteLength) throw new Error('La foto está vacía o no pudo leerse.');
  return { body, size: body.byteLength };
}

export async function getProfileAvatarUrl(path: string | null | undefined) {
  if (!path) return null;
  const { data, error } = await clientOrThrow().storage
    .from(AVATAR_BUCKET)
    .createSignedUrl(path, 60 * 60);
  if (error) throw new Error(error.message);
  return data.signedUrl;
}

export async function uploadProfileAvatar(asset: ImagePickerAsset) {
  const client = clientOrThrow();
  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError || !userData.user) throw new Error('Inicia sesión para cambiar tu foto de perfil.');

  const descriptor = getDescriptor(asset);
  if (asset.fileSize && asset.fileSize > MAX_AVATAR_BYTES) {
    throw new Error('La foto debe pesar como máximo 5 MB.');
  }
  const { body, size } = await readAvatar(asset);
  if (size > MAX_AVATAR_BYTES) throw new Error('La foto debe pesar como máximo 5 MB.');
  const avatarPath = `${userData.user.id}/avatar-${Date.now()}.${descriptor.extension}`;
  const { data: previousProfile, error: previousError } = await client
    .from('student_profiles')
    .select('avatar_path')
    .eq('id', userData.user.id)
    .maybeSingle();
  if (previousError) throw new Error(previousError.message);

  const { error: uploadError } = await client.storage
    .from(AVATAR_BUCKET)
    .upload(avatarPath, body, {
      cacheControl: '3600',
      contentType: descriptor.mimeType,
      upsert: false,
    });
  if (uploadError) throw new Error(uploadError.message);

  const { error: profileError } = await client
    .from('student_profiles')
    .update({ avatar_path: avatarPath, updated_at: new Date().toISOString() })
    .eq('id', userData.user.id);
  if (profileError) {
    await client.storage.from(AVATAR_BUCKET).remove([avatarPath]);
    throw new Error(profileError.message);
  }

  const previousPath = typeof previousProfile?.avatar_path === 'string' ? previousProfile.avatar_path : '';
  if (previousPath && previousPath !== avatarPath) {
    await client.storage.from(AVATAR_BUCKET).remove([previousPath]);
  }
  return { path: avatarPath, url: await getProfileAvatarUrl(avatarPath) };
}

export async function removeProfileAvatar(path: string | null | undefined) {
  if (!path) return;
  const client = clientOrThrow();
  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError || !userData.user) throw new Error('Inicia sesión para eliminar tu foto de perfil.');
  if (!path.startsWith(`${userData.user.id}/`)) throw new Error('No tienes acceso a esta foto de perfil.');

  const { error: profileError } = await client
    .from('student_profiles')
    .update({ avatar_path: null, updated_at: new Date().toISOString() })
    .eq('id', userData.user.id);
  if (profileError) throw new Error(profileError.message);
  const { error: storageError } = await client.storage.from(AVATAR_BUCKET).remove([path]);
  if (storageError) throw new Error(storageError.message);
}
