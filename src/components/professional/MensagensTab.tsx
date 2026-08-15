// src/components/professional/MensagensTab.tsx
import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Award } from 'lucide-react';
import { PROMPT_LIBRARY } from '../../data/professionalAreaData';

interface MensagensTabProps {
  nichoAtual: string;
  tomAtual: string;
  gargalosAtuais: string[];
}

export default function MensagensTab({ nichoAtual, tomAtual, gargalosAtuais }: MensagensTabProps) {
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);
  const copyPrompt = (title: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(title);
    setTimeout(() => setCopiedPrompt(null), 2000);
  };

  // Prompts que resolvem QUALQUER gargalo declarado no diagnóstico vêm
  // primeiro, marcados como recomendados — o resto continua embaixo.
  const orderedPrompts = useMemo(() => {
    const withText = PROMPT_LIBRARY.map((m) => ({
      ...m,
      text: m.prompt(nichoAtual, tomAtual),
      recomendado: m.resolveGargalo.some((g) => gargalosAtuais.includes(g))
    }));
    return withText.sort((a, b) => Number(b.recomendado) - Number(a.recomendado));
  }, [gargalosAtuais, nichoAtual, tomAtual]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <p className="text-center text-xs font-sans text-slate-400 dark:text-ink-muted mb-2">
        Copia o prompt, cola no Renata OS, e ele te ajuda a escrever a resposta na tua voz, pro teu momento real.
      </p>
      {gargalosAtuais.length === 0 && (
        <p className="text-center text-xs font-sans text-rosegold/80 dark:text-rosegold-light/80 mb-2">
          Preenche o Diagnóstico pra eu te mostrar qual prompt resolve o seu gargalo primeiro.
        </p>
      )}
      {orderedPrompts.map((item) => (
        <div
          key={item.title}
          className={`rounded-2xl bg-white dark:bg-ink-raised border p-4 space-y-2 ${
            item.recomendado ? 'border-rosegold/50' : 'border-rose-100/20 dark:border-ink-hairline'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-sans font-bold text-rosegold uppercase tracking-wider">{item.title}</p>
              <p className="text-[11px] font-sans text-slate-400 dark:text-ink-muted">{item.momento}</p>
            </div>
            {item.recomendado && (
              <span className="text-[10px] font-sans font-bold text-white bg-rosegold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                Recomendado pra você
              </span>
            )}
          </div>
          <p className="text-sm text-slate-700 dark:text-ink-text leading-relaxed bg-rose-50/40 dark:bg-ink rounded-xl p-3">{item.text}</p>
          <button
            onClick={() => copyPrompt(item.title, item.text)}
            className="text-xs font-sans font-semibold text-rosegold dark:text-rosegold-light hover:underline cursor-pointer"
          >
            {copiedPrompt === item.title ? 'Copiado ✓' : 'Copiar prompt'}
          </button>
        </div>
      ))}
      <div className="flex items-center gap-2 justify-center pt-2 text-xs text-slate-400 dark:text-ink-muted">
        <Award className="h-3.5 w-3.5" />
        Baseado no fechamento por mensagem, método validado
      </div>
    </motion.div>
  );
}
