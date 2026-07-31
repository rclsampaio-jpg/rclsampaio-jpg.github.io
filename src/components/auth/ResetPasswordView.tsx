// src/components/auth/ResetPasswordView.tsx
import { useState, type FormEvent } from 'react';
import RenaSerLogo from '../RenaSerLogo';
import { useAuth } from '../../contexts/AuthContext';

export default function ResetPasswordView() {
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    setSubmitting(true);
    setError(null);
    const { error } = await updatePassword(password);
    setSubmitting(false);
    if (error) {
      setError(error);
      return;
    }
    setDone(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#FAF8F5] dark:bg-[#1E1715] flex flex-col justify-center items-center p-6 text-center select-none overflow-hidden">
      <form onSubmit={handleSubmit} className="relative z-20 max-w-sm w-full space-y-6 p-8 rounded-3xl border border-rosegold/20 bg-white dark:bg-[#251E1C] shadow-rosegold">
        <RenaSerLogo variant="vertical" size={64} className="mx-auto mb-2" />
        <div className="space-y-1.5">
          <h2 className="text-lg font-serif font-medium text-slate-900 dark:text-white">
            Nova senha
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {done ? 'Senha atualizada com sucesso.' : 'Escolha uma nova senha para sua conta'}
          </p>
        </div>

        {!done && (
          <>
            <div className="space-y-3 text-left">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nova senha"
                required
                minLength={6}
                className="w-full bg-[#FAF8F5] dark:bg-[#1E1715] border border-rose-100/30 dark:border-rosegold/10 focus:border-rosegold focus:outline-none rounded-2xl p-3.5 text-sm text-slate-800 dark:text-slate-100"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme a nova senha"
                required
                minLength={6}
                className="w-full bg-[#FAF8F5] dark:bg-[#1E1715] border border-rose-100/30 dark:border-rosegold/10 focus:border-rosegold focus:outline-none rounded-2xl p-3.5 text-sm text-slate-800 dark:text-slate-100"
              />
            </div>
            {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-rosegold hover:bg-[#A35D68] text-white rounded-2xl text-xs font-sans font-bold tracking-[0.15em] uppercase transition-all duration-300 cursor-pointer disabled:opacity-60"
            >
              {submitting ? 'Salvando...' : 'Salvar nova senha'}
            </button>
          </>
        )}

        {done && (
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full py-3.5 bg-rosegold hover:bg-[#A35D68] text-white rounded-2xl text-xs font-sans font-bold tracking-[0.15em] uppercase transition-all duration-300 cursor-pointer"
          >
            Continuar
          </button>
        )}
      </form>
    </div>
  );
}
