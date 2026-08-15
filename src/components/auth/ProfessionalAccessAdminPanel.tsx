// src/components/auth/ProfessionalAccessAdminPanel.tsx
import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function ProfessionalAccessAdminPanel() {
  const [generating, setGenerating] = useState(false);
  const [lastCode, setLastCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
    try {
      // Busca a sessão fresca na hora em vez de confiar no valor do contexto
      // React, que pode estar desatualizado (token já renovado por baixo dos
      // panos, mas o closure ainda aponta pro antigo) e causar "Sessão
      // inválida" mesmo com is_admin correto no banco.
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) {
        setError('Sessão não encontrada, saia e entre de novo.');
        return;
      }
      const res = await fetch(`${supabaseUrl}/functions/v1/admin-generate-professional-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      const json = await res.json();
      if (!json.code) {
        setError(json.error ? `${json.error} (status ${res.status})` : `Não foi possível gerar o código (status ${res.status}).`);
        return;
      }
      setLastCode(json.code);
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-[#2C221E] border border-rose-100/40 dark:border-rosegold/10 rounded-3xl p-6 sm:p-8 shadow-rosegold space-y-5">
      <div className="space-y-1">
        <h3 className="text-base font-serif font-medium text-slate-900 dark:text-white">
          Destrave (Área da Profissional)
        </h3>
        <p className="text-xs text-slate-500 dark:text-ink-muted">
          Gere um código de acesso, uso único, pra quem comprou esse produto separado.
        </p>
      </div>

      <button
        onClick={handleGenerate}
        disabled={generating}
        className="px-5 py-3 bg-rosegold hover:bg-[#A35D68] text-white rounded-2xl text-xs font-sans font-bold tracking-[0.15em] uppercase transition-all duration-300 cursor-pointer disabled:opacity-60"
      >
        {generating ? 'Gerando...' : 'Gerar código'}
      </button>

      {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}

      {lastCode && (
        <div className="pt-2 border-t border-rose-100/30 dark:border-rosegold/10">
          <p className="text-xs text-slate-500 dark:text-ink-muted mb-1">Código</p>
          <div className="flex items-center gap-2">
            <code className="text-sm text-slate-800 dark:text-ink-text">{lastCode}</code>
            <button
              onClick={() => copyToClipboard(lastCode)}
              className="text-xs text-rosegold/80 hover:text-rosegold underline-offset-4 hover:underline"
            >
              {copied ? 'Copiado!' : 'Copiar código'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
