// src/components/auth/SignupView.tsx
import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import RenaSerLogo from '../RenaSerLogo';
import { useAuth } from '../../contexts/AuthContext';

interface SignupViewProps {
  inviteCodeFromUrl: string | null;
  onSwitchToLogin: () => void;
  onSignupSuccess: () => void;
}

export default function SignupView({ inviteCodeFromUrl, onSwitchToLogin, onSignupSuccess }: SignupViewProps) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState(inviteCodeFromUrl ?? '');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/validate-invite-and-signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({ email, password, code }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error ?? 'Não foi possível criar a conta.');
        setSubmitting(false);
        return;
      }

      // Account created with email_confirm: true, so credentials are valid
      // immediately, sign in directly instead of dead-ending on a blank
      // login screen with no feedback (I4).
      const { error: signInError } = await signIn(email, password);
      if (signInError) {
        setSuccessMessage('Conta criada com sucesso! Faça login para continuar.');
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
    <div className="fixed inset-0 z-50 bg-[#FAF8F5] dark:bg-[#1E1715] flex flex-col justify-center items-center p-6 text-center select-none overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
        <motion.div
          initial={{ x: '-15vw', y: '70vh', rotate: 20 }}
          animate={{
            x: '115vw',
            y: ['70vh', '50vh', '60vh', '35vh', '45vh', '20vh'],
            rotate: [20, 0, 15, -10, 5, -20]
          }}
          transition={{
            duration: 14,
            ease: 'easeInOut',
            repeat: Infinity,
            repeatDelay: 2
          }}
          className="absolute"
        >
          <motion.img
            src="/assets/images/butterfly.png"
            alt=""
            animate={{ scaleY: [1, 0.78, 1], skewX: [0, 3, 0] }}
            transition={{ duration: 0.4, repeat: Infinity, ease: 'easeInOut' }}
            className="h-9 w-auto opacity-30"
            style={{ transformOrigin: 'center 70%' }}
          />
        </motion.div>
      </div>
      <form onSubmit={handleSubmit} className="relative z-20 max-w-sm w-full space-y-6 p-8 rounded-3xl border border-rosegold/20 bg-white dark:bg-[#251E1C] shadow-rosegold">
        <RenaSerLogo variant="vertical" size={64} className="mx-auto mb-2" />
        <div className="space-y-1.5">
          <h2 className="text-lg font-serif font-medium text-slate-900 dark:text-white">
            Comece sua jornada
          </h2>
          <p className="text-xs text-slate-500 dark:text-ink-muted">
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
            className="w-full bg-[#FAF8F5] dark:bg-[#1E1715] border border-rose-100/30 dark:border-rosegold/10 focus:border-rosegold focus:outline-none rounded-2xl p-3.5 text-sm text-slate-800 dark:text-ink-text"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Crie uma senha"
            required
            minLength={6}
            className="w-full bg-[#FAF8F5] dark:bg-[#1E1715] border border-rose-100/30 dark:border-rosegold/10 focus:border-rosegold focus:outline-none rounded-2xl p-3.5 text-sm text-slate-800 dark:text-ink-text"
          />
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Código de convite"
            required
            className="w-full bg-[#FAF8F5] dark:bg-[#1E1715] border border-rose-100/30 dark:border-rosegold/10 focus:border-rosegold focus:outline-none rounded-2xl p-3.5 text-sm text-slate-800 dark:text-ink-text"
          />
        </div>
        {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
        {successMessage && <p className="text-xs text-emerald-600 font-medium">{successMessage}</p>}
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
