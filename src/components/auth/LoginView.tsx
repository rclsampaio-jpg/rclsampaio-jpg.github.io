// src/components/auth/LoginView.tsx
import { useState, type FormEvent } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import RenaSerLogo from '../RenaSerLogo';

interface LoginViewProps {
  onSwitchToSignup: () => void;
}

export default function LoginView({ onSwitchToSignup }: LoginViewProps) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) setError(error);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#FAF8F5] dark:bg-[#1E1715] flex flex-col justify-center items-center p-6 text-center select-none">
      <img
        src="/assets/images/butterfly.png"
        alt=""
        className="h-9 w-auto absolute top-10 right-8 pointer-events-none opacity-30"
      />
      <form onSubmit={handleSubmit} className="max-w-sm w-full space-y-6 p-8 rounded-3xl border border-rosegold/20 bg-white dark:bg-[#251E1C] shadow-rosegold">
        <RenaSerLogo variant="vertical" size={64} className="mx-auto mb-2" />
        <div className="space-y-1.5">
          <h2 className="text-lg font-serif font-medium text-slate-900 dark:text-white">
            Bem-vinda de volta
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Continue sua jornada de 30 dias
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
            placeholder="Senha"
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
          {submitting ? 'Entrando...' : 'Entrar'}
        </button>
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="text-xs text-rosegold/80 hover:text-rosegold underline-offset-4 hover:underline"
        >
          Não tenho conta ainda
        </button>
      </form>
    </div>
  );
}
