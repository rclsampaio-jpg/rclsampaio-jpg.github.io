/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { Flame, Link2, ExternalLink, LifeBuoy } from 'lucide-react';
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
}

// Missão Diária pra quem já terminou os 30 dias de "Compartilhando sua
// História": a jornada continua sendo trackeada dia a dia (streak,
// completionHistory), mas o conteúdo passa a vir da Fase de Prática
// (cadência semanal, 4 temas reciclados) em vez de gerar 60+ dias novos de
// roteiro. O tema muda a cada semana; completar em qualquer dia daquela
// semana ainda conta como "hoje" pra manter o hábito e a sequência.
export default function PracticeMissionView({ progress, lang, onCompleteDay, onUpdateMood, onTriggerSos, onGoToLibrary }: PracticeMissionViewProps) {
  const [reflectionInput, setReflectionInput] = useState(progress.reflections[progress.currentDay] || '');
  const savedLinks = progress.videoLinks[progress.currentDay];
  const [links, setLinks] = useState<string[]>(savedLinks ? savedLinks.split(LINK_SEPARATOR) : ['']);
  const [selectedMood, setSelectedMood] = useState<string | null>(progress.journalMoods?.[progress.currentDay] || null);
  const weekIndex = getPracticeWeekIndexForDay(progress.currentDay);
  const week = PRACTICE_WEEKS[weekIndex];

  const textDict = {
    pt: {
      badge: 'Fase de Prática',
      dayLabel: `Dia ${progress.currentDay} da sua jornada`,
      challengeLabel: 'O desafio desta semana',
      whereLabel: 'Onde te apoiar',
      reflectionLabel: 'O que você percebeu ao gravar isso?',
      reflectionPlaceholder: 'Escreva aqui...',
      linkLabel: 'Link do que você gravou',
      linkPlaceholder: 'Cole aqui o link do vídeo/post',
      moodLabel: 'Como você se sentiu hoje?',
      complete: 'Concluir hoje',
      streak: 'sequência',
      sos: 'Acione o SOS Emocional'
    },
    en: {
      badge: 'Practice Phase',
      dayLabel: `Day ${progress.currentDay} of your journey`,
      challengeLabel: "This week's challenge",
      whereLabel: 'Where to get support',
      reflectionLabel: 'What did you notice while recording this?',
      reflectionPlaceholder: 'Write here...',
      linkLabel: 'Link to what you recorded',
      linkPlaceholder: 'Paste the video/post link here',
      moodLabel: 'How did you feel today?',
      complete: 'Complete today',
      streak: 'streak',
      sos: 'Activate Emotional SOS'
    },
    es: {
      badge: 'Fase de Práctica',
      dayLabel: `Día ${progress.currentDay} de tu jornada`,
      challengeLabel: 'El desafío de esta semana',
      whereLabel: 'Dónde apoyarte',
      reflectionLabel: '¿Qué notaste al grabar esto?',
      reflectionPlaceholder: 'Escribe aquí...',
      linkLabel: 'Enlace de lo que grabaste',
      linkPlaceholder: 'Pega aquí el enlace del video/post',
      moodLabel: '¿Cómo te sentiste hoy?',
      complete: 'Completar hoy',
      streak: 'racha',
      sos: 'Activar SOS Emocional'
    }
  };
  const textVal = textDict[lang] || textDict.pt;

  const handleSelectMood = (mood: string) => {
    setSelectedMood(mood);
    onUpdateMood(progress.currentDay, mood);
  };

  const handleComplete = () => {
    const combinedLinks = links.filter(l => l.trim()).join(LINK_SEPARATOR);
    onCompleteDay(reflectionInput, combinedLinks, selectedMood || undefined);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-6"
    >
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
              title={m.label}
              className={`flex-1 py-3 rounded-xl border text-xl transition ${
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
        className="w-full py-3.5 rounded-xl bg-rosegold text-white font-bold hover:bg-rosegold-dark transition"
      >
        {textVal.complete}
      </button>

      <button
        type="button"
        onClick={onTriggerSos}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-rosegold hover:bg-[#A35D68] text-xs font-sans font-bold uppercase tracking-wider text-white transition-all duration-300 shadow-rosegold"
      >
        <LifeBuoy size={16} /> {textVal.sos}
      </button>
    </motion.div>
  );
}
