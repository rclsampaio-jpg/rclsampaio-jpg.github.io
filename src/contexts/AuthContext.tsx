import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  passwordRecovery: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  // Set when Supabase redirects the user back here from a "reset password"
  // email link (event PASSWORD_RECOVERY) — the user IS authenticated at
  // this point (via the recovery token), but the app must show a "choose a
  // new password" screen instead of the normal logged-in experience until
  // they actually set one.
  const [passwordRecovery, setPasswordRecovery] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      if (event === 'PASSWORD_RECOVERY') setPasswordRecovery(true);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? traduzErroLogin(error.message) : null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setPasswordRecovery(false);
  };

  const requestPasswordReset = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + window.location.pathname,
    });
    return { error: error ? 'Não foi possível enviar o email. Verifique o endereço e tente novamente.' : null };
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (!error) setPasswordRecovery(false);
    return { error: error ? 'Não foi possível atualizar a senha. Tente novamente.' : null };
  };

  return (
    <AuthContext.Provider
      value={{ user: session?.user ?? null, session, loading, passwordRecovery, signIn, signOut, requestPasswordReset, updatePassword }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function traduzErroLogin(message: string): string {
  if (message.includes('Invalid login credentials')) return 'Email ou senha incorretos.';
  return 'Não foi possível entrar. Tente novamente.';
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
