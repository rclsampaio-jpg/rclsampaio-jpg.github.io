// src/components/professional/ReferenciaTab.tsx
import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { REFERENCE_CONTENT, VSL_REFERENCIA, RENATA_OS_PROMPTS } from '../../data/professionalAreaData';

interface ReferenciaTabProps {
  nichoAtual: string;
  tomAtual: string;
  gargalosAtuais: string[];
  onGoToLibrary: () => void;
}

export default function ReferenciaTab({ nichoAtual, tomAtual, gargalosAtuais, onGoToLibrary }: ReferenciaTabProps) {
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);
  const copyPrompt = (title: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(title);
    setTimeout(() => setCopiedPrompt(null), 2000);
  };

  // Mesma lógica das Mensagens: o gargalo declarado destaca qual prompt de
  // Referência resolve ele de verdade, não só qual conceito ler.
  const orderedReferencePrompts = useMemo(() => {
    const withText = RENATA_OS_PROMPTS.map((p) => ({
      ...p,
      text: p.prompt(nichoAtual, tomAtual, gargalosAtuais.join(', ') || '[seu gargalo]'),
      recomendado: p.resolveGargalo.some((g) => gargalosAtuais.includes(g))
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
        Conceitos direto ao ponto, sem enrolação.
      </p>
      {gargalosAtuais.includes('Em criar conteúdo com constância') && (
        <p className="text-center text-xs font-sans text-rosegold/80 dark:text-rosegold-light/80 mb-2">
          Seu diagnóstico aponta esse como seu gargalo, Big Idea e Autoridade Percebida ajudam mais direto aqui.
        </p>
      )}
      {REFERENCE_CONTENT.map((ref) => (
        <div
          key={ref.title}
          className="rounded-2xl bg-white dark:bg-ink-raised border border-rose-100/20 dark:border-ink-hairline p-5 space-y-2"
        >
          <p className="text-sm font-serif font-semibold text-slate-800 dark:text-ink-text">{ref.title}</p>
          <ul className="space-y-1.5">
            {ref.points.map((point, i) => (
              <li key={i} className="text-sm text-slate-600 dark:text-ink-muted leading-relaxed flex gap-2">
                <span className="text-rosegold mt-1">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div className="rounded-2xl bg-white dark:bg-ink-raised border border-rose-100/20 dark:border-ink-hairline p-5 space-y-3 mt-4">
        <div>
          <p className="text-sm font-serif font-semibold text-slate-800 dark:text-ink-text">O que é VSL, e como a Renata estruturou a dela</p>
          <p className="text-xs text-slate-500 dark:text-ink-muted mt-1 leading-relaxed">
            VSL é "Video Sales Letter", um vídeo estruturado pra apresentar um problema, mostrar por que ele acontece, e convidar pra próxima conversa, tudo numa sequência lógica. Você não precisa ter um produto pronto nem página de vendas ativa pra usar essa lógica: ela serve pra QUALQUER conteúdo onde você quer que a pessoa entenda seu problema e sinta que você é quem resolve, mesmo um Reels de 60 segundos ou uma sequência de Stories. É por isso que esse mapa importa mesmo antes de você vender qualquer coisa: ele te dá clareza do que você oferece, hoje, com o que você já tem.
          </p>
          <p className="text-xs text-slate-500 dark:text-ink-muted mt-2">
            Esse é o mapa real usado pra estruturar a VSL do Destrave. Não é pra copiar frase por frase, é pra usar como esqueleto e preencher com a sua história.
          </p>
        </div>
        <ul className="space-y-2">
          {VSL_REFERENCIA.map((v) => (
            <li key={v.bloco}>
              <p className="text-xs font-sans font-bold text-slate-700 dark:text-ink-text">{v.bloco}</p>
              <p className="text-xs text-slate-500 dark:text-ink-muted leading-relaxed">{v.ideia}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-3 mt-4">
        <p className="text-center text-xs font-sans text-slate-400 dark:text-ink-muted">
          Perguntas exatas pra mandar pro Renata OS e preencher isso com as suas informações.
        </p>
        {orderedReferencePrompts.map((p) => (
          <div
            key={p.title}
            className={`rounded-2xl bg-white dark:bg-ink-raised border p-4 space-y-2 ${
              p.recomendado ? 'border-rosegold/50' : 'border-rose-100/20 dark:border-ink-hairline'
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-sans font-bold text-rosegold uppercase tracking-wider">{p.title}</p>
              {p.recomendado && (
                <span className="text-[10px] font-sans font-bold text-white bg-rosegold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                  Recomendado pra você
                </span>
              )}
            </div>
            <p className="text-sm text-slate-700 dark:text-ink-text leading-relaxed bg-rose-50/40 dark:bg-ink rounded-xl p-3">{p.text}</p>
            <button
              onClick={() => copyPrompt(p.title, p.text)}
              className="text-xs font-sans font-semibold text-rosegold dark:text-rosegold-light hover:underline cursor-pointer"
            >
              {copiedPrompt === p.title ? 'Copiado ✓' : 'Copiar prompt'}
            </button>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-rosegold/5 dark:bg-rosegold-light/5 border border-rosegold/20 p-5 space-y-2 mt-4">
        <p className="text-sm font-serif font-semibold text-slate-800 dark:text-ink-text">Pra praticar e achar sua voz</p>
        <p className="text-xs text-slate-500 dark:text-ink-muted leading-relaxed">
          Você encontra a instrução pra execução exata de tudo que você precisa pra gerar conteúdo autêntico e que vende. Confere a biblioteca de prompts, e a referência de pra que cada um serve.
        </p>
        <button
          onClick={onGoToLibrary}
          className="text-xs font-sans font-bold text-rosegold dark:text-rosegold-light hover:underline cursor-pointer"
        >
          Ver na Biblioteca (Prompts) →
        </button>
      </div>
    </motion.div>
  );
}
