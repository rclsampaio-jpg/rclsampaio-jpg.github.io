// src/components/professional/DashboardTab.tsx
import { useMemo } from 'react';
import { motion } from 'motion/react';
import { Check, Minus, X } from 'lucide-react';
import { UserProgress, PilarKey, PilarStatus } from '../../types';
import { GARGALO_RESOLUCAO } from '../../data/professionalAreaData';
import { PILARES } from '../../data/professionalDiagnosticData';

interface DashboardTabProps {
  progress: UserProgress;
  gargalosAtuais: string[];
  pilaresAtuais: Partial<Record<PilarKey, PilarStatus>>;
  onNavigate: (section: 'checkin' | 'dashboard' | 'mensagens' | 'diagnostico' | 'referencia') => void;
}

const PILAR_ICON: Record<PilarStatus, typeof Check> = { sim: Check, parcial: Minus, nao: X };
const PILAR_STYLE: Record<PilarStatus, string> = {
  sim: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  parcial: 'bg-amber-500/15 text-accentgold',
  nao: 'bg-rose-50 dark:bg-rosegold/15 text-rosegold'
};

export default function DashboardTab({ progress, gargalosAtuais, pilaresAtuais, onNavigate }: DashboardTabProps) {
  const diagnostic = progress.professionalDiagnostic;
  const checkIns = progress.professionalCheckIns || {};

  // Sempre calculado a partir dos check-ins salvos, nunca digitado.
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {diagnostic?.completedAt && (
        <div className="rounded-2xl bg-rosegold/5 dark:bg-rosegold-light/5 border border-rosegold/20 p-4 space-y-2">
          <p className="text-[10px] font-sans font-bold text-rosegold uppercase tracking-wider">Seu posicionamento</p>
          <p className="text-xs text-slate-600 dark:text-ink-muted leading-relaxed">
            {diagnostic.nicho && <>Nicho: <span className="font-semibold text-slate-800 dark:text-ink-text">{diagnostic.nicho}</span>. </>}
            {(diagnostic.vozRespostas?.tom?.length ?? 0) > 0 && <>Voz: <span className="font-semibold text-slate-800 dark:text-ink-text">{diagnostic.vozRespostas!.tom.join(', ')}</span>. </>}
            {gargalosAtuais.length > 0 && <>Gargalos atuais: <span className="font-semibold text-slate-800 dark:text-ink-text">{gargalosAtuais.join(', ')}</span>.</>}
          </p>
          {gargalosAtuais.length > 0 && (
            <div className="pt-2 border-t border-rosegold/15 space-y-3">
              {gargalosAtuais.filter((g) => GARGALO_RESOLUCAO[g]).map((g) => (
                <div key={g} className="space-y-1">
                  <p className="text-xs text-slate-600 dark:text-ink-muted leading-relaxed">
                    <span className="font-semibold text-slate-800 dark:text-ink-text">{g}: </span>
                    {GARGALO_RESOLUCAO[g].oQueFazer}
                  </p>
                  <button
                    onClick={() => onNavigate(GARGALO_RESOLUCAO[g].aba)}
                    className="text-xs font-sans font-bold text-rosegold dark:text-rosegold-light hover:underline cursor-pointer"
                  >
                    {GARGALO_RESOLUCAO[g].abaLabel} →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {diagnostic?.completedAt && (
        <div className="rounded-2xl bg-white dark:bg-ink-raised border border-rose-100/20 dark:border-ink-hairline p-5 space-y-3">
          <div className="flex items-baseline justify-between">
            <p className="text-xs font-sans font-bold text-slate-700 dark:text-ink-text uppercase tracking-wider">Raio-X dos 5 Pilares</p>
            <span className="text-xs font-sans font-bold text-rosegold">
              {PILARES.filter((p) => pilaresAtuais[p.key] === 'sim').length}/{PILARES.length} prontos
            </span>
          </div>
          <div className="space-y-2">
            {PILARES.map((p) => {
              const status = pilaresAtuais[p.key] ?? 'nao';
              const Icon = PILAR_ICON[status];
              return (
                <div key={p.key} className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-slate-600 dark:text-ink-muted">{p.label}</span>
                  <span className={`shrink-0 h-5 w-5 flex items-center justify-center rounded-full ${PILAR_STYLE[status]}`}>
                    <Icon className="h-3 w-3" strokeWidth={3} />
                  </span>
                </div>
              );
            })}
          </div>
          {PILARES.some((p) => pilaresAtuais[p.key] !== 'sim') && (
            <button
              onClick={() => onNavigate('referencia')}
              className="text-xs font-sans font-bold text-rosegold dark:text-rosegold-light hover:underline cursor-pointer pt-1"
            >
              Ir pra Fundamentos, resolver o que falta →
            </button>
          )}
        </div>
      )}

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
          <p className="text-[11px] font-sans text-slate-500 dark:text-ink-muted uppercase tracking-wider">Mensagens Recebidas</p>
        </div>
        <div className="rounded-2xl bg-white dark:bg-ink-raised border border-rose-100/20 dark:border-ink-hairline p-4 text-center">
          <p className="text-2xl font-serif font-bold text-slate-800 dark:text-ink-text">{stats.reunioes}</p>
          <p className="text-[11px] font-sans text-slate-500 dark:text-ink-muted uppercase tracking-wider">Reuniões Agendadas</p>
        </div>
        <div className="rounded-2xl bg-white dark:bg-ink-raised border border-rose-100/20 dark:border-ink-hairline p-4 text-center">
          <p className="text-2xl font-serif font-bold text-rosegold">{stats.vendas}</p>
          <p className="text-[11px] font-sans text-slate-500 dark:text-ink-muted uppercase tracking-wider">Vendas Geradas</p>
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
  );
}
