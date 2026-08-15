// src/components/professional/DiagnosticoTab.tsx
import { useState, Dispatch, SetStateAction } from 'react';
import { motion } from 'motion/react';
import { UserProgress, ProfessionalDiagnostic, PilarKey, PilarStatus } from '../../types';
import { getLocalDateISO } from '../../utils/date';
import { VOZ_PERGUNTAS, ESTRUTURA_PERGUNTAS, PILARES } from '../../data/professionalDiagnosticData';

interface DiagnosticoTabProps {
  progress: UserProgress;
  onUpdateProgress: (progress: UserProgress) => void;
}

const PILAR_OPCOES: { value: PilarStatus; label: string }[] = [
  { value: 'nao', label: 'Ainda não' },
  { value: 'parcial', label: 'Mais ou menos' },
  { value: 'sim', label: 'Já tenho' }
];

export default function DiagnosticoTab({ progress, onUpdateProgress }: DiagnosticoTabProps) {
  const today = getLocalDateISO();
  const diagnostic = progress.professionalDiagnostic;
  const [nicho, setNicho] = useState(diagnostic?.nicho ?? '');
  const [dorReal, setDorReal] = useState(diagnostic?.dorReal ?? '');
  const [pontoB, setPontoB] = useState(diagnostic?.pontoB ?? '');
  const [pilares, setPilares] = useState<Partial<Record<PilarKey, PilarStatus>>>(diagnostic?.pilares ?? {});
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

  const setPilarStatus = (key: PilarKey, status: PilarStatus) => {
    setPilares((prev) => ({ ...prev, [key]: status }));
  };

  const handleSaveDiagnostic = () => {
    const newDiagnostic: ProfessionalDiagnostic = {
      nicho: nicho.trim() || undefined,
      dorReal: dorReal.trim() || undefined,
      pontoB: pontoB.trim() || undefined,
      pilares,
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
      {/* Bloco 1: O Gap — a dor real e o ponto B, o que sustenta toda a metodologia */}
      <div className="rounded-2xl bg-rose-50/30 dark:bg-ink border border-rose-100/30 dark:border-ink-hairline p-4 space-y-4">
        <div>
          <p className="text-[10px] font-sans font-bold text-rosegold uppercase tracking-[0.15em] mb-3">O Gap</p>
          <label className="text-sm font-sans font-semibold text-slate-700 dark:text-ink-text block mb-2">Quem é a sua cliente ideal, a pessoa que você quer atrair e converter?</label>
          <input
            type="text"
            value={nicho}
            onChange={(e) => setNicho(e.target.value)}
            placeholder="Ex: terapeutas iniciantes, coaches de carreira..."
            className="w-full text-sm bg-white dark:bg-black/10 border border-rose-100/40 dark:border-ink-hairline rounded-xl p-3 text-slate-700 dark:text-ink-text focus:outline-none focus:border-rosegold"
          />
        </div>
        <div>
          <label className="text-sm font-sans font-semibold text-slate-700 dark:text-ink-text block mb-1">Qual é a dor real da sua cliente ideal? Não a superficial, a de baixo.</label>
          <p className="text-[11px] text-slate-400 dark:text-ink-muted mb-2">Ex: não é "ela quer postar mais", é "ela vê as concorrentes crescendo e começa a duvidar se o que ela sabe fazer ainda vale alguma coisa".</p>
          <textarea
            value={dorReal}
            onChange={(e) => setDorReal(e.target.value)}
            placeholder="Descreve a dor de verdade, com cena se der..."
            rows={3}
            className="w-full text-sm bg-white dark:bg-black/10 border border-rose-100/40 dark:border-ink-hairline rounded-xl p-3 text-slate-700 dark:text-ink-text focus:outline-none focus:border-rosegold resize-none"
          />
        </div>
        <div>
          <label className="text-sm font-sans font-semibold text-slate-700 dark:text-ink-text block mb-1">Onde essa cliente ideal quer chegar, em cena concreta?</label>
          <p className="text-[11px] text-slate-400 dark:text-ink-muted mb-2">Não "crescer no Instagram" — algo que ela reconheceria se você descrevesse pra ela.</p>
          <textarea
            value={pontoB}
            onChange={(e) => setPontoB(e.target.value)}
            placeholder="Ex: abrir a câmera e gravar sem editar sete vezes antes..."
            rows={2}
            className="w-full text-sm bg-white dark:bg-black/10 border border-rose-100/40 dark:border-ink-hairline rounded-xl p-3 text-slate-700 dark:text-ink-text focus:outline-none focus:border-rosegold resize-none"
          />
        </div>
      </div>

      {/* Bloco 2: Raio-X dos 5 pilares da metodologia */}
      <div className="rounded-2xl bg-rose-50/30 dark:bg-ink border border-rose-100/30 dark:border-ink-hairline p-4 space-y-4">
        <div>
          <p className="text-[10px] font-sans font-bold text-rosegold uppercase tracking-[0.15em]">Raio-X dos 5 Pilares</p>
          <p className="text-[11px] text-slate-400 dark:text-ink-muted mt-1">Onde você já está na metodologia — isso vira seu mapa de progresso no Dashboard.</p>
        </div>
        {PILARES.map((p) => (
          <div key={p.key}>
            <label className="text-sm font-sans font-semibold text-slate-700 dark:text-ink-text block mb-0.5">{p.label}</label>
            <p className="text-[11px] text-slate-400 dark:text-ink-muted mb-2">{p.ajuda}</p>
            <div className="flex gap-2">
              {PILAR_OPCOES.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPilarStatus(p.key, opt.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-sans font-semibold transition cursor-pointer border ${
                    pilares[p.key] === opt.value
                      ? 'bg-rosegold text-white border-rosegold'
                      : 'bg-white dark:bg-black/10 text-slate-500 dark:text-ink-muted border-rose-100/40 dark:border-ink-hairline'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-rose-50/30 dark:bg-ink border border-rose-100/30 dark:border-ink-hairline p-4 space-y-4">
        <p className="text-[10px] font-sans font-bold text-rosegold uppercase tracking-[0.15em]">Voz</p>
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
        <p className="text-[10px] font-sans font-bold text-rosegold uppercase tracking-[0.15em]">Onde trava no funil</p>
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
