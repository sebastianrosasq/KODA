import { type Session } from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';
import { AppState, Platform } from 'react-native';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { isSupabaseConfigured, supabase, supabasePublicConfig } from '@/lib/supabase';

WebBrowser.maybeCompleteAuthSession();

type AuthStatus = 'checking' | 'signed_out' | 'signed_in' | 'unavailable';

type KodaAuthContextValue = {
  status: AuthStatus;
  session: Session | null;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string) => Promise<string | null>;
  signInWithGoogle: () => Promise<string | null>;
  signOut: () => Promise<void>;
};

const KodaAuthContext = createContext<KodaAuthContextValue | null>(null);

export function KodaAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<AuthStatus>(isSupabaseConfigured ? 'checking' : 'unavailable');

  useEffect(() => {
    if (!supabase) return;
    const client = supabase;
    let active = true;

    void client.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) {
        setStatus('signed_out');
        return;
      }
      setSession(data.session);
      setStatus(data.session ? 'signed_in' : 'signed_out');
    });

    const { data: authListener } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setStatus(nextSession ? 'signed_in' : 'signed_out');
    });

    const appStateListener = Platform.OS === 'web'
      ? undefined
      : AppState.addEventListener('change', (state) => {
          if (state === 'active') client.auth.startAutoRefresh();
          else client.auth.stopAutoRefresh();
        });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
      appStateListener?.remove();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) return 'Conecta el proyecto Supabase para habilitar el acceso.';
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    return error?.message ?? null;
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    if (!supabase) return 'Conecta el proyecto Supabase para habilitar el registro.';
    const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
    if (error) return error.message;
    return data.session ? null : 'Revisa tu correo para confirmar la cuenta antes de iniciar sesión.';
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) return 'Conecta el proyecto Supabase para habilitar el acceso.';

    // Evita navegar a la respuesta JSON de Supabase cuando el administrador aún
    // no habilitó Google. La clave publishable es segura para consultar ajustes públicos.
    if (supabasePublicConfig) {
      try {
        const response = await fetch(`${supabasePublicConfig.url}/auth/v1/settings`, {
          headers: { apikey: supabasePublicConfig.publishableKey },
        });
        const settings = await response.json() as { external?: { google?: boolean } };
        if (response.ok && settings.external?.google !== true) {
          return 'Google aún no está habilitado en KODA. Mientras lo configuramos, crea tu cuenta con correo y contraseña.';
        }
      } catch {
        // Si no se puede consultar este ajuste público, Supabase informará el error real al iniciar OAuth.
      }
    }

    if (Platform.OS === 'web') {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
      return error?.message ?? null;
    }

    const redirectTo = 'koda://google-auth';
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: { prompt: 'consent' },
        skipBrowserRedirect: true,
      },
    });
    if (error) return error.message;
    if (!data.url) return 'No se pudo iniciar el acceso con Google.';

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo, { showInRecents: true });
    if (result.type !== 'success') {
      return result.type === 'cancel' ? 'El acceso con Google fue cancelado.' : 'No se pudo completar el acceso con Google.';
    }

    const params = new URLSearchParams(new URL(result.url).hash.slice(1));
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    if (!accessToken || !refreshToken) return 'Google no devolvió una sesión válida.';

    const { error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    return sessionError?.message ?? null;
  }, []);

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
  }, []);

  const value = useMemo(
    () => ({ status, session, isConfigured: isSupabaseConfigured, signIn, signUp, signInWithGoogle, signOut }),
    [session, signIn, signInWithGoogle, signOut, signUp, status],
  );

  return <KodaAuthContext.Provider value={value}>{children}</KodaAuthContext.Provider>;
}

export function useKodaAuth() {
  const context = useContext(KodaAuthContext);
  if (!context) throw new Error('useKodaAuth debe usarse dentro de KodaAuthProvider.');
  return context;
}
