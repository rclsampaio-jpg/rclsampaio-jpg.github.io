// src/components/professional/CheckinTab.tsx
import { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar } from 'lucide-react';
import { UserProgress, ProfessionalCheckIn } from '../../types';
import { getLocalDateISO } from '../../utils/date';
import { FORMATOS } from '../../data/professionalAreaData';

interface CheckinTabProps {
  progress: UserProgress;
  onUpdateProgress: (progress: UserProgress) => void;
}

export default function CheckinTab({ progress, onUpdateProgress }: CheckinTabProps) {
  const today = getLocalDateISO();
  const checkIns = progress.professionalCheckIns || {};
  const todayCheckIn = checkIns[today];

  const [postou, setPostou] = useState(todayCheckIn?.postou ?? false);
  const [formatosPostados, setFormatosPostados] = useState<string[]>(todayCheckIn?.formatosPostados ?? []);
  const [linksConteudo, setLinksConteudo] = useState<string[]>(
    todayCheckIn?.linksConteudo?.length ? todayCheckIn.linksConteudo : ['']
  );
  const [mensagensRecebidas, setMensagensRecebidas] = useState(String(todayCheckIn?.mensagensRecebidas ?? ''));
  const [reunioesAgendadas, setReunioesAgendadas] = useState(String(todayCheckIn?.reunioesAgendadas ?? ''));
  const [vendasFechadas, setVendasFechadas] = useState(String(todayCheckIn?.vendasFechadas ?? ''));
  const [nota, setNota] = useState(todayCheckIn?.nota ?? '');
  const [saved, setSaved] = useState(false);

  const toggleFormato = (f: string) => {
    setFormatosPostados((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));
  };

  const updateLinkConteudo = (index: number, value: string) => {
    setLinksConteudo((prev) => prev.map((l, i) => (i === index ? value : l)));
  };

  const addLinkConteudo = () => {
    setLinksConteudo((prev) => [...prev, '']);
  };

  const handleSaveCheckIn = () => {
    const checkIn: ProfessionalCheckIn = {
      postou,
      formatosPostados,
      linksConteudo: postou ? linksConteudo.map((l) => l.trim()).filter(Boolean) : undefined,
      mensagensRecebidas: Number(mensagensRecebidas) || 0,
      reunioesAgendadas: Number(reunioesAgendadas) || 0,
      vendasFechadas: Number(vendasFechadas) || 0,
      nota: nota.trim() || undefined
    };
    onUpdateProgress({
      ...progress,
      professionalCheckIns: { ...checkIns, [today]: checkIn }
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[2rem] bg-white dark:bg-ink-raised border border-rose-100/20 dark:border-ink-hairline p-6 sm:p-8 shadow-rosegold dark:shadow-none space-y-5"
    >
      <div className="flex items-center gap-2 text-xs font-sans text-slate-400 dark:text-ink-muted">
        <Calendar className="h-3.5 w-3.5" />
        {new Date(today + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
      </div>

      <div>
        <p className="text-sm font-sans font-semibold text-slate-700 dark:text-ink-text mb-2">Postou conteúdo hoje?</p>
        <div className="flex gap-2">
          <button
            onClick={() => setPostou(true)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-sans font-bold transition cursor-pointer ${
              postou ? 'bg-rosegold text-white' : 'bg-rose-50/50 dark:bg-ink text-slate-500 dark:text-ink-muted'
            }`}
          >
            Sim
          </button>
          <button
            onClick={() => setPostou(false)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-sans font-bold transition cursor-pointer ${
              !postou ? 'bg-slate-700 text-white' : 'bg-rose-50/50 dark:bg-ink text-slate-500 dark:text-ink-muted'
            }`}
          >
            Não
          </button>
        </div>
      </div>

      {postou && (
        <div>
          <p className="text-xs font-sans text-slate-500 dark:text-ink-muted mb-2">Em quais formatos?</p>
          <div className="flex flex-wrap gap-2">
            {FORMATOS.map((f) => (
              <button
                key={f}
                onClick={() => toggleFormato(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-sans font-semibold transition cursor-pointer ${
                  formatosPostados.includes(f)
                    ? 'bg-rosegold/15 text-rosegold dark:text-rosegold-light border border-rosegold/40'
                    : 'bg-rose-50/40 dark:bg-ink text-slate-500 dark:text-ink-muted border border-transparent'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="mt-3">
            <label className="text-[11px] font-sans text-slate-500 dark:text-ink-muted block mb-1">Link do conteúdo</label>
            <div className="space-y-2">
              {linksConteudo.map((link, i) => (
                <input
                  key={i}
                  type="url"
                  value={link}
                  onChange={(e) => updateLinkConteudo(i, e.target.value)}
                  placeholder="Cole aqui o link do que você postou hoje"
                  className="w-full text-sm bg-rose-50/40 dark:bg-ink border border-rose-100/20 dark:border-ink-hairline rounded-xl p-3 text-slate-700 dark:text-ink-text focus:outline-none focus:border-rosegold"
                />
              ))}
            </div>
            <button
              type="button"
              onClick={addLinkConteudo}
              className="mt-2 text-xs font-sans font-semibold text-rosegold dark:text-rosegold-light hover:underline cursor-pointer"
            >
              + adicionar outro link
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-[11px] font-sans text-slate-500 dark:text-ink-muted block mb-1">Mensagens Recebidas</label>
          <input
            type="number"
            min="0"
            value={mensagensRecebidas}
            onChange={(e) => setMensagensRecebidas(e.target.value)}
            className="w-full text-center text-lg font-sans font-bold bg-rose-50/40 dark:bg-ink border border-rose-100/20 dark:border-ink-hairline rounded-xl py-2 text-slate-700 dark:text-ink-text focus:outline-none focus:border-rosegold"
          />
        </div>
        <div>
          <label className="text-[11px] font-sans text-slate-500 dark:text-ink-muted block mb-1">Reuniões Agendadas</label>
          <input
            type="number"
            min="0"
            value={reunioesAgendadas}
            onChange={(e) => setReunioesAgendadas(e.target.value)}
            className="w-full text-center text-lg font-sans font-bold bg-rose-50/40 dark:bg-ink border border-rose-100/20 dark:border-ink-hairline rounded-xl py-2 text-slate-700 dark:text-ink-text focus:outline-none focus:border-rosegold"
          />
        </div>
        <div>
          <label className="text-[11px] font-sans text-slate-500 dark:text-ink-muted block mb-1">Vendas Geradas</label>
          <input
            type="number"
            min="0"
            value={vendasFechadas}
            onChange={(e) => setVendasFechadas(e.target.value)}
            className="w-full text-center text-lg font-sans font-bold bg-rose-50/40 dark:bg-ink border border-rose-100/20 dark:border-ink-hairline rounded-xl py-2 text-slate-700 dark:text-ink-text focus:outline-none focus:border-rosegold"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-sans text-slate-500 dark:text-ink-muted block mb-1.5">O que funcionou ou travou hoje?</label>
        <textarea
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          rows={2}
          placeholder="Opcional, uma frase já ajuda..."
          className="w-full text-sm bg-rose-50/40 dark:bg-ink border border-rose-100/20 dark:border-ink-hairline rounded-xl p-3 text-slate-700 dark:text-ink-text focus:outline-none focus:border-rosegold resize-none"
        />
      </div>

      <button
        onClick={handleSaveCheckIn}
        className="w-full py-3 rounded-xl bg-rosegold hover:bg-[#A35D68] text-white text-sm font-sans font-bold uppercase tracking-wider transition cursor-pointer"
      >
        {saved ? 'Salvo ✓' : 'Salvar check-in de hoje'}
      </button>
    </motion.div>
  );
}
