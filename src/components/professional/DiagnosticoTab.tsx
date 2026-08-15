// src/components/professional/DiagnosticoTab.tsx
import { useState, Dispatch, SetStateAction } from 'react';
import { motion } from 'motion/react';
import { UserProgress, ProfessionalDiagnostic } from '../../types';
import { getLocalDateISO } from '../../utils/date';
import { VOZ_PERGUNTAS, ESTRUTURA_PERGUNTAS } from '../../data/professionalDiagnosticData';

interface DiagnosticoTabProps {
  progress: UserProgress;
  onUpdateProgress: (progress: UserProgress) => void;
}

export default function DiagnosticoTab({ progress, onUpdateProgress }: DiagnosticoTabProps) {
  const today = getLocalDateISO();
  const diagnostic = progress.professionalDiagnostic;
  const [nicho, setNicho] = useState(diagnostic?.nicho ?? '');
  const [vozRespostas, setVozRespostas] = useState<Record<string, string[]>>(diagnostic?.vozRespostas ?? {});
  const [estruturaRespostas, setEstruturaRespostas] = useState<Record<string, string[]>>(diagnostic?.estruturaRespostas ?? {});
  const [diagnosticSaved, setDiagnosticSaved] = useState(false);

  const toggleDiagnosticOption = (
    setter: Dispatch<SetStateAction<Record<string, string[]>>>,
    key: string,
    opt: string
  ) => {
    setter((prev) => {
      const current = prev[key] ?? [];
      const next = current.includes(opt) ? current.filter((o) => o !== opt) : [...current, opt];
      return { ...prev, [key]: next };
    });
  };

  const handleSaveDiagnostic = () => {
    const newDiagnostic: ProfessionalDiagnostic = {
      nicho: nicho.trim() || undefined,
      vozRespostas,
      estruturaRespostas,
      completedAt: today
    };
    onUpdateProgress({
      ...progress,
      professionalDiagnostic: newDiagnostic
    });
    setDiagnosticSaved(true);
    setTimeout(() => setDiagnosticSaved(false), 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[2rem] bg-white dark:bg-ink-raised border border-rose-100/20 dark:border-ink-hairline p-6 sm:p-8 shadow-rosegold dark:shadow-none space-y-5"
    >
      <div className="rounded-2xl bg-rose-50/30 dark:bg-ink border border-rose-100/30 dark:border-ink-hairline p-4">
        <p className="text-[10px] font-sans font-bold text-rosegold uppercase tracking-[0.15em] mb-3">Nicho</p>
        <label className="text-sm font-sans font-semibold text-slate-700 dark:text-ink-text block mb-2">Pra quem é o seu conteúdo hoje?</label>
        <input
          type="text"
          value={nicho}
          onChange={(e) => setNicho(e.target.value)}
          placeholder="Ex: terapeutas iniciantes, coaches de carreira..."
          className="w-full text-sm bg-white dark:bg-black/10 border border-rose-100/40 dark:border-ink-hairline rounded-xl p-3 text-slate-700 dark:text-ink-text focus:outline-none focus:border-rosegold"
        />
      </div>

      <div className="rounded-2xl bg-rose-50/30 dark:bg-ink border border-rose-100/30 dark:border-ink-hairline p-4 space-y-4">
        <div className="flex items-baseline justify-between">
          <p className="text-[10px] font-sans font-bold text-rosegold uppercase tracking-[0.15em]">Voz</p>
          <p className="text-[10px] text-slate-400 dark:text-ink-muted">pode marcar mais de uma</p>
        </div>
        {VOZ_PERGUNTAS.map((p) => (
          <div key={p.key}>
            <label className="text-sm font-sans font-semibold text-slate-700 dark:text-ink-text block mb-2">{p.label}</label>
            <div className="flex flex-wrap gap-2">
              {p.options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleDiagnosticOption(setVozRespostas, p.key, opt)}
                  className={`px-3 py-1.5 rounded-full text-xs font-sans font-semibold transition cursor-pointer border ${
                    (vozRespostas[p.key] ?? []).includes(opt)
                      ? 'bg-rosegold text-white border-rosegold'
                      : 'bg-white dark:bg-black/10 text-slate-500 dark:text-ink-muted border-rose-100/40 dark:border-ink-hairline'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-rose-50/30 dark:bg-ink border border-rose-100/30 dark:border-ink-hairline p-4 space-y-4">
        <div className="flex items-baseline justify-between">
          <p className="text-[10px] font-sans font-bold text-rosegold uppercase tracking-[0.15em]">Estrutura</p>
          <p className="text-[10px] text-slate-400 dark:text-ink-muted">pode marcar mais de uma</p>
        </div>
        {ESTRUTURA_PERGUNTAS.map((p) => (
          <div key={p.key}>
            <label className="text-sm font-sans font-semibold text-slate-700 dark:text-ink-text block mb-2">{p.label}</label>
            <div className="flex flex-wrap gap-2">
              {p.options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleDiagnosticOption(setEstruturaRespostas, p.key, opt)}
                  className={`px-3 py-1.5 rounded-full text-xs font-sans font-semibold transition cursor-pointer border ${
                    (estruturaRespostas[p.key] ?? []).includes(opt)
                      ? 'bg-rosegold text-white border-rosegold'
                      : 'bg-white dark:bg-black/10 text-slate-500 dark:text-ink-muted border-rose-100/40 dark:border-ink-hairline'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSaveDiagnostic}
        className="w-full py-3 rounded-xl bg-rosegold hover:bg-[#A35D68] text-white text-sm font-sans font-bold uppercase tracking-wider transition cursor-pointer"
      >
        {diagnosticSaved ? 'Salvo ✓' : diagnostic?.completedAt ? 'Atualizar diagnóstico' : 'Salvar diagnóstico'}
      </button>
    </motion.div>
  );
}
