// src/components/auth/SignupView.tsx
import { useState, type FormEvent } from 'react';
import RenaSerLogo from '../RenaSerLogo';
import ButterflyIcon from '../ButterflyIcon';

interface SignupViewProps {
  inviteCodeFromUrl: string | null;
  onSwitchToLogin: () => void;
  onSignupSuccess: () => void;
}

export default function SignupView({ inviteCodeFromUrl, onSwitchToLogin, onSignupSuccess }: SignupViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState(inviteCodeFromUrl ?? '');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/validate-invite-and-signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, code }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error ?? 'Não foi possível criar a conta.');
        setSubmitting(false);
        return;
      }
      onSignupSuccess();
    } catch {
      setError('Erro de conexão. Tente novamente.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#FAF8F5] dark:bg-[#1E1715] flex flex-col justify-center items-center p-6 text-center select-none">
      <ButterflyIcon size={36} speedMultiplier={0.7} className="text-rosegold/30 absolute top-10 right-8 pointer-events-none" />
      <form onSubmit={handleSubmit} className="max-w-sm w-full space-y-6 p-8 rounded-3xl border border-rosegold/20 bg-white dark:bg-[#251E1C] shadow-rosegold">
        <RenaSerLogo variant="vertical" size={64} className="mx-auto mb-2" />
        <div className="space-y-1.5">
          <h2 className="text-lg font-serif font-medium text-slate-900 dark:text-white">
            Comece sua jornada
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Crie sua conta com o código de convite que você recebeu
          </p>
        </div>
        <div className="space-y-3 text-left">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full bg-[#FAF8F5] dark:bg-[#1E1715] border border-rose-100/30 dark:border-rosegold/10 focus:border-rosegold focus:outline-none rounded-2xl p-3.5 text-sm text-slate-800 dark:text-slate-100"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Crie uma senha"
            required
            minLength={6}
            className="w-full bg-[#FAF8F5] dark:bg-[#1E1715] border border-rose-100/30 dark:border-rosegold/10 focus:border-rosegold focus:outline-none rounded-2xl p-3.5 text-sm text-slate-800 dark:text-slate-100"
          />
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Código de convite"
            required
            className="w-full bg-[#FAF8F5] dark:bg-[#1E1715] border border-rose-100/30 dark:border-rosegold/10 focus:border-rosegold focus:outline-none rounded-2xl p-3.5 text-sm text-slate-800 dark:text-slate-100"
          />
        </div>
        {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 bg-rosegold hover:bg-[#A35D68] text-white rounded-2xl text-xs font-sans font-bold tracking-[0.15em] uppercase transition-all duration-300 cursor-pointer disabled:opacity-60"
        >
          {submitting ? 'Criando conta...' : 'Criar conta'}
        </button>
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-xs text-rosegold/80 hover:text-rosegold underline-offset-4 hover:underline"
        >
          Já tenho conta
        </button>
      </form>
    </div>
  );
}
