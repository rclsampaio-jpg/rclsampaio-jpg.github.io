// src/components/auth/GoogleSignInButton.tsx
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface GoogleSignInButtonProps {
  label: string;
  onError: (message: string) => void;
}

export default function GoogleSignInButton({ label, onError }: GoogleSignInButtonProps) {
  const { signInWithGoogle } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const handleClick = async () => {
    setSubmitting(true);
    const { error } = await signInWithGoogle();
    // On success the browser navigates away to Google immediately, so
    // there's nothing to reset here — only failure to even start the
    // redirect leaves us on this screen.
    if (error) {
      setSubmitting(false);
      onError(error);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={submitting}
      className="w-full py-3.5 flex items-center justify-center gap-2.5 bg-white dark:bg-[#2A2119] border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-ink-text rounded-2xl text-xs font-sans font-bold tracking-[0.1em] uppercase transition-all duration-300 cursor-pointer disabled:opacity-60"
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82z"/>
        <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.11A12 12 0 0 0 12 24z"/>
        <path fill="#FBBC05" d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28V6.61H1.27A12 12 0 0 0 0 12c0 1.94.46 3.77 1.27 5.39z"/>
        <path fill="#EA4335" d="M12 4.75c1.76 0 3.34.61 4.58 1.8l3.43-3.43C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.61l4 3.11C6.22 6.86 8.87 4.75 12 4.75z"/>
      </svg>
      {submitting ? '...' : label}
    </button>
  );
}
