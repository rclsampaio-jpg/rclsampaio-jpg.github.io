// src/components/auth/InviteGateView.tsx
import { useState, type FormEvent } from 'react';
import RenaSerLogo from '../RenaSerLogo';
import { useAuth } from '../../contexts/AuthContext';

interface InviteGateViewProps {
  onUnlocked: () => void;
}

// Shown after a Google sign-in creates a brand-new account with no invite
// check at all (unlike email/password signup, which validates the code
// before the account even exists) — this closes that gap by requiring a
// real, unused invite code before the person gets into the app.
export default function InviteGateView({ onUnlocked }: InviteGateViewProps) {
  const { session, signOut } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/redeem-invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${session?.access_token ?? ''}`,
        },
        body: JSON.stringify({ code }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error ?? 'Não foi possível validar o código.');
        setSubmitting(false);
        return;
      }
      onUnlocked();
    } catch {
      setError('Erro de conexão. Tente novamente.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#FAF8F5] dark:bg-[#1E1715] flex flex-col justify-center items-center p-6 text-center select-none overflow-hidden">
      <form onSubmit={handleSubmit} className="relative z-20 max-w-sm w-full space-y-6 p-8 rounded-3xl border border-rosegold/20 bg-white dark:bg-[#251E1C] shadow-rosegold">
        <RenaSerLogo variant="vertical" size={64} className="mx-auto mb-2" />
        <div className="space-y-1.5">
          <h2 className="text-lg font-serif font-medium text-slate-900 dark:text-white">
            Falta um passo
          </h2>
          <p className="text-xs text-slate-500 dark:text-ink-muted">
            Digite o código de convite que você recebeu para liberar seu acesso
          </p>
        </div>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Código de convite"
          required
          className="w-full bg-[#FAF8F5] dark:bg-[#1E1715] border border-rose-100/30 dark:border-rosegold/10 focus:border-rosegold focus:outline-none rounded-2xl p-3.5 text-sm text-slate-800 dark:text-ink-text text-center tracking-widest uppercase"
        />
        {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 bg-rosegold hover:bg-[#A35D68] text-white rounded-2xl text-xs font-sans font-bold tracking-[0.15em] uppercase transition-all duration-300 cursor-pointer disabled:opacity-60"
        >
          {submitting ? 'Validando...' : 'Liberar acesso'}
        </button>
        <button
          type="button"
          onClick={() => signOut()}
          className="text-xs text-rosegold/80 hover:text-rosegold underline-offset-4 hover:underline"
        >
          Sair
        </button>
      </form>
    </div>
  );
}
