// src/components/auth/InviteAdminPanel.tsx
import { useState } from 'react';

const SITE_URL = 'https://rclsampaio-jpg.github.io';

export default function InviteAdminPanel() {
  const [generating, setGenerating] = useState(false);
  const [lastCode, setLastCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/admin-generate-invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
      });
      const json = await res.json();
      if (!json.code) {
        setError('Não foi possível gerar o código.');
        return;
      }
      setLastCode(json.code);
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setGenerating(false);
    }
  };

  const inviteLink = lastCode ? `${SITE_URL}/?codigo=${lastCode}` : null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLabel(label);
    setTimeout(() => setCopiedLabel(null), 2000);
  };

  return (
    <div className="bg-white dark:bg-[#2C221E] border border-rose-100/40 dark:border-rosegold/10 rounded-3xl p-6 sm:p-8 shadow-rosegold space-y-5">
      <div className="space-y-1">
        <h3 className="text-base font-serif font-medium text-slate-900 dark:text-white">
          Convites
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Gere um código de convite para uma nova assinante.
        </p>
      </div>

      <button
        onClick={handleGenerate}
        disabled={generating}
        className="px-5 py-3 bg-rosegold hover:bg-[#A35D68] text-white rounded-2xl text-xs font-sans font-bold tracking-[0.15em] uppercase transition-all duration-300 cursor-pointer disabled:opacity-60"
      >
        {generating ? 'Gerando...' : 'Gerar convite'}
      </button>

      {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}

      {lastCode && (
        <div className="space-y-3 pt-2 border-t border-rose-100/30 dark:border-rosegold/10">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Código</p>
            <div className="flex items-center gap-2">
              <code className="text-sm text-slate-800 dark:text-slate-100">{lastCode}</code>
              <button
                onClick={() => copyToClipboard(lastCode, 'code')}
                className="text-xs text-rosegold/80 hover:text-rosegold underline-offset-4 hover:underline"
              >
                {copiedLabel === 'code' ? 'Copiado!' : 'Copiar código'}
              </button>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Link pronto</p>
            <div className="flex items-center gap-2">
              <code className="text-sm text-slate-800 dark:text-slate-100 truncate">{inviteLink}</code>
              <button
                onClick={() => copyToClipboard(inviteLink!, 'link')}
                className="text-xs text-rosegold/80 hover:text-rosegold underline-offset-4 hover:underline shrink-0"
              >
                {copiedLabel === 'link' ? 'Copiado!' : 'Copiar link'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
