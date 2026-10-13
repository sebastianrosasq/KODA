import { type Session } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { isSupabaseConfigured, supabase } from '@/lib/supabase';

type AuthStatus = 'checking' | 'signed_out' | 'signed_in' | 'unavailable';

type KodaAuthContextValue = {
  status: AuthStatus;
  session: Session | null;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string) => Promise<string | null>;
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

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
  }, []);

  const value = useMemo(
    () => ({ status, session, isConfigured: isSupabaseConfigured, signIn, signUp, signOut }),
    [session, signIn, signOut, signUp, status],
  );

  return <KodaAuthContext.Provider value={value}>{children}</KodaAuthContext.Provider>;
}

export function useKodaAuth() {
  const context = useContext(KodaAuthContext);
  if (!context) throw new Error('useKodaAuth debe usarse dentro de KodaAuthProvider.');
  return context;
}
