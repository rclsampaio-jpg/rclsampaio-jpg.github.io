/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Flame, Link2, ExternalLink, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Language, UserProgress } from '../types';
import { PRACTICE_WEEKS, getPracticeWeekIndexForDay } from '../data/practiceWeeksData';
import LinkListInput from './LinkListInput';

const LINK_SEPARATOR = '|||';
const MOODS: { key: 'calm' | 'hopeful' | 'neutral' | 'heavy' | 'emotional'; emoji: string; label: string }[] = [
  { key: 'hopeful', emoji: '✨', label: 'Esperançosa' },
  { key: 'calm', emoji: '🙂', label: 'Tranquila' },
  { key: 'neutral', emoji: '😐', label: 'Neutra' },
  { key: 'heavy', emoji: '😮‍💨', label: 'Pesada' },
  { key: 'emotional', emoji: '🥹', label: 'Emotiva' }
];

interface PracticeMissionViewProps {
  progress: UserProgress;
  lang: Language;
  onCompleteDay: (reflectionText: string, videoLink: string, mood?: string) => void;
  onUpdateMood: (dayNum: number, mood: string) => void;
  onTriggerSos: () => void;
  onGoToLibrary: () => void;
  isAdminUnlocked?: boolean;
  onJumpToDay?: (dayNumber: number) => void;
  // Admin-only: browse any day 31-90's interface without touching real
  // progress. Undefined for real users, who always see progress.currentDay.
  previewDayNumber?: number;
}

// Missão Diária pra quem já terminou os 30 dias de "Compartilhando sua
// História": a jornada continua sendo trackeada dia a dia (streak,
// completionHistory), mas o conteúdo passa a vir da Fase de Prática
// (cadência semanal, 4 temas reciclados) em vez de gerar 60+ dias novos de
// roteiro. O tema muda a cada semana; completar em qualquer dia daquela
// semana ainda conta como "hoje" pra manter o hábito e a sequência.
export default function PracticeMissionView({ progress, lang, onCompleteDay, onUpdateMood, onTriggerSos, onGoToLibrary, isAdminUnlocked, onJumpToDay, previewDayNumber }: PracticeMissionViewProps) {
  const displayDay = previewDayNumber ?? progress.currentDay;
  // True only when admin navigated away from the real current day — the
  // interface is shown for reference, but nothing here can be saved for a
  // day that hasn't actually happened yet.
  const isPreviewingOtherDay = displayDay !== progress.currentDay;

  const [reflectionInput, setReflectionInput] = useState(progress.reflections[displayDay] || '');
  const [links, setLinks] = useState<string[]>(() => {
    const savedLinks = progress.videoLinks[displayDay];
    return savedLinks ? savedLinks.split(LINK_SEPARATOR) : [''];
  });
  const [selectedMood, setSelectedMood] = useState<string | null>(progress.journalMoods?.[displayDay] || null);

  // Re-sync the draft fields whenever admin jumps to a different day.
  useEffect(() => {
    setReflectionInput(progress.reflections[displayDay] || '');
    const savedLinks = progress.videoLinks[displayDay];
    setLinks(savedLinks ? savedLinks.split(LINK_SEPARATOR) : ['']);
    setSelectedMood(progress.journalMoods?.[displayDay] || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayDay]);

  const weekIndex = getPracticeWeekIndexForDay(displayDay);
  const week = PRACTICE_WEEKS[weekIndex];

  const textDict = {
    pt: {
      badge: 'Fase de Prática',
      dayLabel: `Dia ${displayDay} da sua jornada`,
      challengeLabel: 'O desafio desta semana',
      whereLabel: 'Onde te apoiar',
      reflectionLabel: 'O que você percebeu ao gravar isso?',
      reflectionPlaceholder: 'Escreva aqui...',
      linkLabel: 'Link do que você gravou',
      linkPlaceholder: 'Cole aqui o link do vídeo/post',
      moodLabel: 'Como você se sentiu hoje?',
      complete: 'Concluir hoje',
      streak: 'sequência',
      sosHeading: 'Sentindo ansiedade ou trava física?',
      sos: 'Acione o SOS Emocional'
    },
    en: {
      badge: 'Practice Phase',
      dayLabel: `Day ${displayDay} of your journey`,
      challengeLabel: "This week's challenge",
      whereLabel: 'Where to get support',
      reflectionLabel: 'What did you notice while recording this?',
      reflectionPlaceholder: 'Write here...',
      linkLabel: 'Link to what you recorded',
      linkPlaceholder: 'Paste the video/post link here',
      moodLabel: 'How did you feel today?',
      complete: 'Complete today',
      streak: 'streak',
      sosHeading: 'Feeling anxiety or stage fright?',
      sos: 'Activate Emotional SOS'
    },
    es: {
      badge: 'Fase de Práctica',
      dayLabel: `Día ${displayDay} de tu jornada`,
      challengeLabel: 'El desafío de esta semana',
      whereLabel: 'Dónde apoyarte',
      reflectionLabel: '¿Qué notaste al grabar esto?',
      reflectionPlaceholder: 'Escribe aquí...',
      linkLabel: 'Enlace de lo que grabaste',
      linkPlaceholder: 'Pega aquí el enlace del video/post',
      moodLabel: '¿Cómo te sentiste hoy?',
      complete: 'Completar hoy',
      streak: 'racha',
      sosHeading: '¿Sientes ansiedad o miedo en la voz?',
      sos: 'Activar SOS Emocional'
    }
  };
  const textVal = textDict[lang] || textDict.pt;

  const handleSelectMood = (mood: string) => {
    if (isPreviewingOtherDay) return;
    setSelectedMood(mood);
    onUpdateMood(progress.currentDay, mood);
  };

  const handleComplete = () => {
    if (isPreviewingOtherDay) return;
    const combinedLinks = links.filter(l => l.trim()).join(LINK_SEPARATOR);
    onCompleteDay(reflectionInput, combinedLinks, selectedMood || undefined);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-6 select-none relative"
    >
      {/* Admin-only day jumper: browse any day 31-90's interface without
          touching real progress. Mirrors the same jumper on DailyMissionView
          (days 1-30), so the whole 90-day trajectory can be reviewed in
          one continuous back-and-forth. */}
      {isAdminUnlocked && onJumpToDay && (
        <div className="flex items-center justify-center gap-3 rounded-xl border border-dashed border-rosegold/40 bg-rosegold/5 px-4 py-2.5">
          <button
            onClick={() => onJumpToDay(Math.max(31, displayDay - 1))}
            disabled={displayDay <= 31}
            className="h-8 w-8 flex items-center justify-center rounded-lg border border-rosegold/40 text-rosegold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-rosegold/10 transition cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-[11px] font-mono uppercase tracking-wider text-rosegold">
            Admin · Dia {displayDay} / 90
          </span>
          <button
            onClick={() => onJumpToDay(Math.min(90, displayDay + 1))}
            disabled={displayDay >= 90}
            className="h-8 w-8 flex items-center justify-center rounded-lg border border-rosegold/40 text-rosegold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-rosegold/10 transition cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {isPreviewingOtherDay && (
        <div className="rounded-xl border border-dashed border-amber-400/50 bg-amber-50 dark:bg-amber-500/10 px-4 py-2.5 text-center">
          <p className="text-[11px] text-amber-700 dark:text-amber-300 font-sans">
            Prévia — esse ainda não é o dia real. Nada aqui é salvo até você chegar nele de verdade.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rosegold/10 text-rosegold-dark dark:text-rosegold-light text-xs font-bold uppercase tracking-wide">
          {textVal.badge}
        </span>
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 dark:text-ink-muted">
          <Flame size={16} className="text-orange-500" />
          {progress.currentStreak} {textVal.streak}
        </span>
      </div>

      <div>
        <p className="text-sm text-slate-500 dark:text-ink-muted mb-1">{textVal.dayLabel}</p>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-white">
          {week.title}
        </h1>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 space-y-2">
        <p className="text-xs font-bold uppercase tracking-wide text-rosegold-dark dark:text-rosegold-light">
          {textVal.challengeLabel}
        </p>
        <p className="text-base text-slate-800 dark:text-ink-base leading-relaxed">{week.challenge}</p>
      </div>

      <button
        type="button"
        onClick={onGoToLibrary}
        className="w-full flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4 text-left hover:border-rosegold transition"
      >
        <ExternalLink size={18} className="text-rosegold-dark dark:text-rosegold-light shrink-0" />
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-ink-muted mb-0.5">{textVal.whereLabel}</p>
          <p className="text-sm text-slate-700 dark:text-ink-base">{week.where}</p>
        </div>
      </button>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700 dark:text-ink-base">{textVal.reflectionLabel}</label>
        <textarea
          value={reflectionInput}
          onChange={(e) => setReflectionInput(e.target.value)}
          placeholder={textVal.reflectionPlaceholder}
          rows={4}
          className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-3 text-sm text-slate-800 dark:text-ink-base focus:outline-none focus:ring-2 focus:ring-rosegold/40"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700 dark:text-ink-base flex items-center gap-1.5">
          <Link2 size={14} /> {textVal.linkLabel}
        </label>
        <LinkListInput
          links={links}
          onChange={setLinks}
          placeholder={textVal.linkPlaceholder}
          inputClassName="flex-1 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-3 text-sm text-slate-800 dark:text-ink-base focus:outline-none focus:ring-2 focus:ring-rosegold/40"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700 dark:text-ink-base">{textVal.moodLabel}</label>
        <div className="flex gap-2">
          {MOODS.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => handleSelectMood(m.key)}
              disabled={isPreviewingOtherDay}
              title={m.label}
              className={`flex-1 py-3 rounded-xl border text-xl transition disabled:opacity-50 disabled:cursor-not-allowed ${
                selectedMood === m.key
                  ? 'border-rosegold bg-rosegold/10'
                  : 'border-slate-200 dark:border-white/10 hover:border-rosegold/40'
              }`}
            >
              {m.emoji}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={handleComplete}
        disabled={isPreviewingOtherDay}
        className="w-full py-3.5 rounded-xl bg-rosegold text-white font-bold hover:bg-rosegold-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {textVal.complete}
      </button>

      <div className="rounded-[1.5rem] border border-rose-150/40 dark:border-ink-hairline bg-[#251E1C]/5 dark:bg-ink/30 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-rosegold/10 text-rosegold shrink-0">
            <Heart className="h-4.5 w-4.5 fill-current text-rosegold animate-pulse" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-slate-800 dark:text-ink-text font-sans tracking-wide leading-relaxed">
              {textVal.sosHeading}
            </h4>
          </div>
        </div>
        <button
          type="button"
          onClick={onTriggerSos}
          className="w-full sm:w-auto shrink-0 px-4 py-2 rounded-xl bg-rosegold hover:bg-[#A35D68] text-[10px] font-sans font-bold uppercase tracking-wider text-white transition-all duration-300 cursor-pointer shadow-rosegold animate-pulse"
        >
          {textVal.sos}
        </button>
      </div>
    </motion.div>
  );
}
