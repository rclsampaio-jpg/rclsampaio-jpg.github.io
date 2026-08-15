// src/components/auth/LoginView.tsx
import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import RenaSerLogo from '../RenaSerLogo';
import GoogleSignInButton from './GoogleSignInButton';

interface LoginViewProps {
  onSwitchToSignup: () => void;
}

// No PWA instalado como ícone na tela do iPhone, a sessão do Supabase às
// vezes não sobrevive entre aberturas (WebKit limpa o storage do app
// instalado de um jeito diferente da aba normal do Safari), e sem
// autoComplete nos campos o Safari também não oferece preencher pelo
// Keychain. Isso obrigava a digitar o email inteiro de novo toda vez.
// Guardar só o email (nunca a senha) já resolve a maior parte do
// incômodo, mesmo quando a sessão de verdade precisa ser refeita.
const REMEMBERED_EMAIL_KEY = 'renaser_last_login_email';

export default function LoginView({ onSwitchToSignup }: LoginViewProps) {
  const { signIn, requestPasswordReset } = useAuth();
  const [email, setEmail] = useState(() => localStorage.getItem(REMEMBERED_EMAIL_KEY) || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) setError(error);
  };

  const handleForgotSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Digite seu email para receber o link de recuperação.');
      return;
    }
    setSubmitting(true);
    setError(null);
    const { error } = await requestPasswordReset(email);
    setSubmitting(false);
    if (error) {
      setError(error);
      return;
    }
    setResetSent(true);
  };

  if (forgotMode) {
    return (
      <div className="fixed inset-0 z-50 bg-[#FAF8F5] dark:bg-[#1E1715] flex flex-col justify-center items-center p-6 text-center select-none overflow-hidden">
        <form onSubmit={handleForgotSubmit} className="relative z-20 max-w-sm w-full space-y-6 p-8 rounded-3xl border border-rosegold/20 bg-white dark:bg-[#251E1C] shadow-rosegold">
          <RenaSerLogo variant="vertical" size={64} className="mx-auto mb-2" />
          <div className="space-y-1.5">
            <h2 className="text-lg font-serif font-medium text-slate-900 dark:text-white">
              Esqueceu sua senha?
            </h2>
            <p className="text-xs text-slate-500 dark:text-ink-muted">
              {resetSent ? 'Enviamos um link para o seu email. Confira também a caixa de spam.' : 'Digite seu email e enviaremos um link para redefinir sua senha'}
            </p>
          </div>
          {!resetSent && (
            <>
              <input
                type="email"
                name="email"
                id="forgot-email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="w-full bg-[#FAF8F5] dark:bg-[#1E1715] border border-rose-100/30 dark:border-rosegold/10 focus:border-rosegold focus:outline-none rounded-2xl p-3.5 text-sm text-slate-800 dark:text-ink-text"
              />
              {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-rosegold hover:bg-[#A35D68] text-white rounded-2xl text-xs font-sans font-bold tracking-[0.15em] uppercase transition-all duration-300 cursor-pointer disabled:opacity-60"
              >
                {submitting ? 'Enviando...' : 'Enviar link'}
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => { setForgotMode(false); setResetSent(false); setError(null); }}
            className="text-xs text-rosegold/80 hover:text-rosegold underline-offset-4 hover:underline"
          >
            Voltar para o login
          </button>
        </form>
      </div>
    );
  }

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
            Bem-vinda de volta
          </h2>
          <p className="text-xs text-slate-500 dark:text-ink-muted">
            Continue sua jornada de 30 dias
          </p>
        </div>
        <div className="space-y-3 text-left">
          <input
            type="email"
            name="email"
            id="login-email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full bg-[#FAF8F5] dark:bg-[#1E1715] border border-rose-100/30 dark:border-rosegold/10 focus:border-rosegold focus:outline-none rounded-2xl p-3.5 text-sm text-slate-800 dark:text-ink-text"
          />
          <input
            type="password"
            name="password"
            id="login-password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            required
            className="w-full bg-[#FAF8F5] dark:bg-[#1E1715] border border-rose-100/30 dark:border-rosegold/10 focus:border-rosegold focus:outline-none rounded-2xl p-3.5 text-sm text-slate-800 dark:text-ink-text"
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
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-rose-100/30 dark:bg-rosegold/10" />
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">ou</span>
          <div className="flex-1 h-px bg-rose-100/30 dark:bg-rosegold/10" />
        </div>
        <GoogleSignInButton label="Entrar com Google" onError={setError} />
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => { setForgotMode(true); setError(null); }}
            className="text-xs text-rosegold/80 hover:text-rosegold underline-offset-4 hover:underline"
          >
            Esqueci minha senha
          </button>
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="text-xs text-rosegold/80 hover:text-rosegold underline-offset-4 hover:underline"
          >
            Não tenho conta ainda
          </button>
        </div>
      </form>
    </div>
  );
}
