/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, TrendingUp, MessageCircle, Calendar, Award } from 'lucide-react';
import { Language, UserProgress, ProfessionalCheckIn } from '../types';
import { getLocalDateISO } from '../utils/date';

interface ProfessionalAreaViewProps {
  progress: UserProgress;
  lang: Language;
  onUpdateProgress: (progress: UserProgress) => void;
}

const FORMATOS = ['Reels', 'Stories', 'Carrossel', 'Vídeo longo'];

const MESSAGE_LIBRARY: { title: string; body: string }[] = [
  {
    title: 'Abertura de conversa',
    body: 'Oi [nome]! Vi que você comentou/curtiu [conteúdo]. Fiquei curiosa: o que mais te chamou atenção nele?'
  },
  {
    title: 'Entender o momento atual',
    body: 'Me conta rapidinho como você tá hoje em relação a [tema do seu conteúdo]? Assim eu entendo melhor como posso te ajudar.'
  },
  {
    title: 'Filtro de objetivo',
    body: 'E o que você já tentou até hoje pra resolver isso? Só pra eu não te sugerir algo que você já tentou e não funcionou.'
  },
  {
    title: 'Apresentar a oferta sem preço',
    body: 'Baseado no que você me contou, eu tenho um jeito de te ajudar com isso, quer que eu te explique como funciona?'
  },
  {
    title: 'Contorno de objeção de preço',
    body: 'Entendo. Antes de pensar em valor, me diz: faz sentido pra você resolver isso agora, ou é mais uma questão de timing?'
  },
  {
    title: 'Fechamento objetivo',
    body: 'Então bora começar. Prefere fechar via Pix ou cartão?'
  }
];

export default function ProfessionalAreaView({ progress, lang, onUpdateProgress }: ProfessionalAreaViewProps) {
  const today = getLocalDateISO();
  const checkIns = progress.professionalCheckIns || {};
  const todayCheckIn = checkIns[today];

  const [postou, setPostou] = useState(todayCheckIn?.postou ?? false);
  const [formatosPostados, setFormatosPostados] = useState<string[]>(todayCheckIn?.formatosPostados ?? []);
  const [mensagensRecebidas, setMensagensRecebidas] = useState(String(todayCheckIn?.mensagensRecebidas ?? ''));
  const [reunioesAgendadas, setReunioesAgendadas] = useState(String(todayCheckIn?.reunioesAgendadas ?? ''));
  const [vendasFechadas, setVendasFechadas] = useState(String(todayCheckIn?.vendasFechadas ?? ''));
  const [nota, setNota] = useState(todayCheckIn?.nota ?? '');
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState<'checkin' | 'dashboard' | 'mensagens'>('checkin');

  const toggleFormato = (f: string) => {
    setFormatosPostados((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));
  };

  const handleSaveCheckIn = () => {
    const checkIn: ProfessionalCheckIn = {
      postou,
      formatosPostados,
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

  // Dashboard: sempre calculado a partir dos check-ins salvos, nunca digitado.
  const stats = useMemo(() => {
    const entries = Object.entries(checkIns);
    const last30 = entries.filter(([date]) => {
      const d = new Date(date);
      const diffDays = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays <= 30;
    });
    const totals = last30.reduce(
      (acc, [, c]) => {
        acc.posts += c.postou ? 1 : 0;
        acc.mensagens += c.mensagensRecebidas || 0;
        acc.reunioes += c.reunioesAgendadas || 0;
        acc.vendas += c.vendasFechadas || 0;
        return acc;
      },
      { posts: 0, mensagens: 0, reunioes: 0, vendas: 0 }
    );
    const pct = (num: number, den: number) => (den > 0 ? Math.round((num / den) * 100) : 0);
    return {
      ...totals,
      taxaConteudoMensagem: pct(totals.mensagens, totals.posts),
      taxaMensagemReuniao: pct(totals.reunioes, totals.mensagens),
      taxaReuniaoVenda: pct(totals.vendas, totals.reunioes),
      diasComCheckin: last30.length
    };
  }, [checkIns]);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center space-y-2">
        <p className="text-[11px] font-sans tracking-[0.2em] text-rosegold uppercase font-bold">
          Área da Profissional
        </p>
        <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-slate-800 dark:text-ink-text">
          Destrave
        </h1>
        <p className="text-sm text-slate-500 dark:text-ink-muted max-w-md mx-auto">
          Conteúdo estratégico que converte quem já te segue em cliente. Sem enrolação, sem aula, direto ao ponto.
        </p>
      </div>

      <div className="flex items-center justify-center gap-2">
        {([
          { id: 'checkin', label: 'Check-in do Dia', icon: CheckCircle2 },
          { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
          { id: 'mensagens', label: 'Mensagens', icon: MessageCircle }
        ] as const).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition cursor-pointer ${
              activeSection === id
                ? 'bg-rosegold text-white shadow-sm shadow-rosegold/25 dark:bg-transparent dark:border dark:border-rosegold-light dark:text-rosegold-light'
                : 'text-slate-500 dark:text-ink-muted hover:bg-rose-50/50 dark:hover:bg-rosegold-light/10'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {activeSection === 'checkin' && (
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
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-sans text-slate-500 dark:text-ink-muted block mb-1">Mensagens</label>
              <input
                type="number"
                min="0"
                value={mensagensRecebidas}
                onChange={(e) => setMensagensRecebidas(e.target.value)}
                className="w-full text-center text-lg font-sans font-bold bg-rose-50/40 dark:bg-ink border border-rose-100/20 dark:border-ink-hairline rounded-xl py-2 text-slate-700 dark:text-ink-text focus:outline-none focus:border-rosegold"
              />
            </div>
            <div>
              <label className="text-[11px] font-sans text-slate-500 dark:text-ink-muted block mb-1">Reuniões</label>
              <input
                type="number"
                min="0"
                value={reunioesAgendadas}
                onChange={(e) => setReunioesAgendadas(e.target.value)}
                className="w-full text-center text-lg font-sans font-bold bg-rose-50/40 dark:bg-ink border border-rose-100/20 dark:border-ink-hairline rounded-xl py-2 text-slate-700 dark:text-ink-text focus:outline-none focus:border-rosegold"
              />
            </div>
            <div>
              <label className="text-[11px] font-sans text-slate-500 dark:text-ink-muted block mb-1">Vendas</label>
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
      )}

      {activeSection === 'dashboard' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <p className="text-center text-xs font-sans text-slate-400 dark:text-ink-muted">
            Últimos 30 dias · {stats.diasComCheckin} dia(s) com check-in
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white dark:bg-ink-raised border border-rose-100/20 dark:border-ink-hairline p-4 text-center">
              <p className="text-2xl font-serif font-bold text-slate-800 dark:text-ink-text">{stats.posts}</p>
              <p className="text-[11px] font-sans text-slate-500 dark:text-ink-muted uppercase tracking-wider">Posts</p>
            </div>
            <div className="rounded-2xl bg-white dark:bg-ink-raised border border-rose-100/20 dark:border-ink-hairline p-4 text-center">
              <p className="text-2xl font-serif font-bold text-slate-800 dark:text-ink-text">{stats.mensagens}</p>
              <p className="text-[11px] font-sans text-slate-500 dark:text-ink-muted uppercase tracking-wider">Mensagens</p>
            </div>
            <div className="rounded-2xl bg-white dark:bg-ink-raised border border-rose-100/20 dark:border-ink-hairline p-4 text-center">
              <p className="text-2xl font-serif font-bold text-slate-800 dark:text-ink-text">{stats.reunioes}</p>
              <p className="text-[11px] font-sans text-slate-500 dark:text-ink-muted uppercase tracking-wider">Reuniões</p>
            </div>
            <div className="rounded-2xl bg-white dark:bg-ink-raised border border-rose-100/20 dark:border-ink-hairline p-4 text-center">
              <p className="text-2xl font-serif font-bold text-rosegold">{stats.vendas}</p>
              <p className="text-[11px] font-sans text-slate-500 dark:text-ink-muted uppercase tracking-wider">Vendas</p>
            </div>
          </div>

          <div className="rounded-2xl bg-white dark:bg-ink-raised border border-rose-100/20 dark:border-ink-hairline p-5 space-y-3">
            <p className="text-xs font-sans font-bold text-slate-700 dark:text-ink-text uppercase tracking-wider mb-1">Taxas de conversão</p>
            {[
              { label: 'Conteúdo → Mensagem', value: stats.taxaConteudoMensagem },
              { label: 'Mensagem → Reunião', value: stats.taxaMensagemReuniao },
              { label: 'Reunião → Venda', value: stats.taxaReuniaoVenda }
            ].map((row) => (
              <div key={row.label}>
                <div className="flex justify-between text-xs font-sans text-slate-600 dark:text-ink-muted mb-1">
                  <span>{row.label}</span>
                  <span className="font-bold">{row.value}%</span>
                </div>
                <div className="h-1.5 bg-rose-50 dark:bg-ink rounded-full overflow-hidden">
                  <div className="h-full bg-rosegold rounded-full" style={{ width: `${Math.min(row.value, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {activeSection === 'mensagens' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <p className="text-center text-xs font-sans text-slate-400 dark:text-ink-muted mb-2">
            Copia, cola, adapta pro teu tom. Não é roteiro fixo.
          </p>
          {MESSAGE_LIBRARY.map((msg) => (
            <div
              key={msg.title}
              className="rounded-2xl bg-white dark:bg-ink-raised border border-rose-100/20 dark:border-ink-hairline p-4 space-y-1.5"
            >
              <p className="text-[11px] font-sans font-bold text-rosegold uppercase tracking-wider">{msg.title}</p>
              <p className="text-sm text-slate-700 dark:text-ink-text leading-relaxed">{msg.body}</p>
            </div>
          ))}
          <div className="flex items-center gap-2 justify-center pt-2 text-xs text-slate-400 dark:text-ink-muted">
            <Award className="h-3.5 w-3.5" />
            Baseado no fechamento por mensagem, método validado
          </div>
        </motion.div>
      )}
    </div>
  );
}
