/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, Check, Calendar, Play, Star, TrendingUp, Sparkles, 
  Compass, ChevronDown, Award, Volume2, Video, FileText 
} from 'lucide-react';

import { Language, DayType, UserProgress, Journey, Chapter, Day } from '../types';
import { getButterflyConfig } from '../data/chaptersData';
import { PRACTICE_BLOCKS, PRACTICE_WEEKS } from '../data/practiceWeeksData';
import ButterflyIcon from './ButterflyIcon';
import { getLocalDateISO } from '../utils/date';
import EditableText from './editable/EditableText';

import { 
  loadJourneysFromStorage, 
  loadChaptersFromStorage, 
  loadAllDaysFromStorage 
} from '../data/journeysData';

interface JourneyViewProps {
  days: any[]; // Supports both Day[] and legacy MissionDay[]
  progress: UserProgress;
  lang: Language;
  onSelectDay: (day: any) => void;
  onShowIntro?: (chapterId: any) => void;
  activeJourneyId?: string;
  onSwitchJourney?: (journeyId: string) => void;
}

export default function JourneyView({
  days: parentDays,
  progress,
  lang,
  onSelectDay,
  onShowIntro,
  activeJourneyId: parentActiveJourneyId,
  onSwitchJourney
}: JourneyViewProps) {
  // Load full modular datasets
  const [journeys, setJourneys] = useState<Journey[]>(() => loadJourneysFromStorage());
  const [allChapters, setAllChapters] = useState<Chapter[]>(() => loadChaptersFromStorage());
  const [allDays, setAllDays] = useState<Day[]>(() => loadAllDaysFromStorage());

  // Determine active journey
  const [localActiveJourneyId, setLocalActiveJourneyId] = useState<string>(() => {
    return parentActiveJourneyId || progress.activeJourneyId || 'destrave_visibilidade';
  });

  const activeJourneyId = parentActiveJourneyId || localActiveJourneyId;
  const activeJourney = journeys.find(j => j.id === activeJourneyId) || journeys[0] || {
    id: 'destrave_visibilidade',
    title: { pt: 'Destrave de Visibilidade', en: 'Visibility Unlocked', es: 'Destrabe de Visibilidad' },
    subtitle: { pt: 'O portal primordial de coragem', en: 'The primordial portal of courage', es: 'El portal primordial de coraje' },
    coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    difficulty: 'beginner'
  };

  // Switch Journey trigger
  const handleSwitch = (id: string) => {
    setLocalActiveJourneyId(id);
    if (onSwitchJourney) {
      onSwitchJourney(id);
    }
  };

  // Filter Chapters and Days of active Journey
  const activeChapters = allChapters.filter(c => c.journeyId === activeJourneyId).sort((a, b) => a.order - b.order);
  const activeJourneyDays = allDays.filter(d => d.journeyId === activeJourneyId).sort((a, b) => a.dayNumber - b.dayNumber);

  // Fallback: If no days found (e.g. for some newly created custom journey), let's fallback to parentDays
  const daysToRender = activeJourneyDays.length > 0 ? activeJourneyDays : parentDays;

  // Track completions
  // Completed days inside this journey
  const journeyCompletedDays = daysToRender.filter(d => progress.completionHistory.includes(d.dayNumber));
  const totalDaysCount = daysToRender.length;
  const totalCompletedCount = journeyCompletedDays.length;
  const completionPercentage = totalDaysCount > 0 ? Math.round((totalCompletedCount / totalDaysCount) * 100) : 0;

  // Check if a day is unlocked in this active journey
  const isDayUnlocked = (day: Day) => {
    if (day.dayNumber === 1) return true;

    // Unlocked if previous day of the same journey is completed
    const prevDayNumber = day.dayNumber - 1;
    if (!progress.completionHistory.includes(prevDayNumber)) return false;

    // Late-night completions (before LATE_NIGHT_UNLOCK_CUTOFF_HOUR) are
    // backdated to "yesterday" via dayUnlockAnchorDate, so the next day
    // opens immediately instead of waiting for a second midnight.
    if (day.dayNumber === progress.currentDay && progress.dayUnlockAnchorDate === getLocalDateISO()) {
      return false;
    }
    return true;
  };

  const textDict = {
    pt: {
      statsTitle: 'Métricas da Jornada',
      completed: 'Completado',
      daysLeft: 'dias restantes',
      streakTitle: 'Frequência de Hábitos',
      currentStreak: 'Sequência Atual',
      longestStreak: 'Melhor Sequência',
      lockedWarning: 'Esta lição está bloqueada até a missão anterior ser concluída.',
      clickToOpen: 'Clique para abrir lição',
      days: 'dias',
      switchTitle: 'Escolha sua Jornada Ativa',
      curriculum: 'Grade de Aulas e Portal de Metamorfose',
      viewIntro: 'Ouvir Alinhamento',
      beginner: 'Iniciante',
      intermediate: 'Intermediário',
      advanced: 'Avançado'
    },
    en: {
      statsTitle: 'Journey Metrics',
      completed: 'Completed',
      daysLeft: 'days left',
      streakTitle: 'Habit Consistency',
      currentStreak: 'Current Streak',
      longestStreak: 'Longest Streak',
      lockedWarning: 'This lesson is locked until the previous mission is completed.',
      clickToOpen: 'Click to open lesson',
      days: 'days',
      switchTitle: 'Choose Your Active Journey',
      curriculum: 'Curriculum & Metamorphosis Portal',
      viewIntro: 'Listen Alignment',
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced'
    },
    es: {
      statsTitle: 'Métricas del Viaje',
      completed: 'Completado',
      daysLeft: 'días restantes',
      streakTitle: 'Frecuencia de Hábitos',
      currentStreak: 'Racha Actual',
      longestStreak: 'Mejor Racha',
      lockedWarning: 'Esta lección está bloqueada hasta que se complete la misión anterior.',
      clickToOpen: 'Haz clic para abrir lección',
      days: 'días',
      switchTitle: 'Elige tu Viaje Activo',
      curriculum: 'Plan de Estudios y Portal de Metamorfosis',
      viewIntro: 'Escuchar Alineación',
      beginner: 'Principiante',
      intermediate: 'Intermedio',
      advanced: 'Avanzado'
    }
  }[lang];

  return (
    <div className="space-y-10 select-none">
      
      {/* Journey Switcher Bar */}
      <div className="bg-white dark:bg-ink-raised border border-rose-100/30 dark:border-ink-hairline rounded-3xl p-6 shadow-xs dark:shadow-none">
        <EditableText
          contentKey="journey.switcher.title"
          fallback={textDict.switchTitle}
          as="h4"
          className="text-xs font-sans text-slate-400 dark:text-ink-muted uppercase tracking-widest font-black mb-3 text-center sm:text-left"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {journeys.map(j => {
            const isSelected = j.id === activeJourneyId;
            const jDays = allDays.filter(d => d.journeyId === j.id);
            const jCompletedCount = jDays.filter(d => progress.completionHistory.includes(d.dayNumber)).length;
            const jPct = jDays.length > 0 ? Math.round((jCompletedCount / jDays.length) * 100) : 0;

            return (
              <button
                key={j.id}
                onClick={() => handleSwitch(j.id)}
                className={`text-left p-4 rounded-2xl border transition-all relative flex flex-col justify-between h-36 ${
                  isSelected
                    ? 'border-rosegold bg-rose-50/20 dark:bg-rosegold-light/5 dark:border-rosegold-light shadow-md dark:shadow-none'
                    : 'border-rose-100/15 bg-[#FAF8F5]/30 dark:bg-transparent dark:border-ink-hairline hover:border-rosegold/40 dark:hover:border-rosegold-light/40'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[11px] font-mono font-bold text-slate-400 uppercase">
                      {j.estimatedDuration}
                    </span>
                    {isSelected && (
                      <span className="h-2 w-2 rounded-full bg-rosegold animate-pulse" />
                    )}
                  </div>
                  <EditableText
                    contentKey={`journey.journey.${j.id}.title`}
                    fallback={j.title[lang] || j.title.pt}
                    as="p"
                    className="text-sm font-bold text-slate-800 dark:text-white mt-1 line-clamp-1"
                  />
                  <EditableText
                    contentKey={`journey.journey.${j.id}.subtitle`}
                    fallback={j.subtitle[lang] || j.subtitle.pt}
                    as="p"
                    className="text-[10px] text-slate-400 dark:text-ink-muted line-clamp-2 mt-0.5 leading-relaxed"
                  />
                </div>

                <div className="w-full mt-3">
                  <div className="flex justify-between items-center text-[11px] text-slate-400 mb-1 font-mono">
                    <span>{jPct}% concluído</span>
                    <span>{jCompletedCount}/{jDays.length} dias</span>
                  </div>
                  <div className="w-full bg-rose-50/50 dark:bg-ink-hairline h-1 rounded-full overflow-hidden">
                    <div 
                      className="bg-rosegold h-full rounded-full transition-all" 
                      style={{ width: `${jPct}%` }} 
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Program Statistics Metrics Summary */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white dark:bg-ink-raised border border-rose-100/30 dark:border-ink-hairline rounded-3xl p-6 shadow-sm dark:shadow-none"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-rose-50 dark:bg-rosegold/10 text-rosegold rounded-2xl">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <EditableText
              contentKey="journey.stats.completedTitle"
              fallback={textDict.statsTitle}
              as="h4"
              className="text-xs font-sans text-slate-400 dark:text-ink-muted uppercase tracking-wider font-semibold"
            />
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-bold text-slate-800 dark:text-white">{totalCompletedCount}</span>
              <span className="text-slate-400 dark:text-ink-muted text-sm">/ {totalDaysCount} {textDict.days}</span>
            </div>
            <div className="w-32 bg-rose-50 dark:bg-ink-hairline h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div className="bg-rosegold h-full rounded-full" style={{ width: `${completionPercentage}%` }} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 border-t md:border-t-0 md:border-x border-rose-100/30 dark:border-ink-hairline pt-4 md:pt-0 md:px-6">
          <div className="p-3 bg-rose-50 dark:bg-rosegold/10 text-rosegold rounded-2xl">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <EditableText
              contentKey="journey.stats.streakTitle"
              fallback={textDict.streakTitle}
              as="h4"
              className="text-xs font-sans text-slate-400 dark:text-ink-muted uppercase tracking-wider font-semibold"
            />
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-bold text-slate-800 dark:text-white">{progress.currentStreak}</span>
              <span className="text-slate-400 dark:text-ink-muted text-sm">
                {progress.currentStreak === 1 ? 'dia' : 'dias'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 border-t md:border-t-0 pt-4 md:pt-0">
          <div className="p-3 bg-rose-50 dark:bg-rosegold/10 text-rosegold rounded-2xl">
            <Star className="h-6 w-6 text-rosegold" />
          </div>
          <div>
            <EditableText
              contentKey="journey.stats.longestStreakTitle"
              fallback={textDict.longestStreak}
              as="h4"
              className="text-xs font-sans text-slate-400 dark:text-ink-muted uppercase tracking-wider font-semibold"
            />
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-bold text-slate-800 dark:text-white">{progress.longestStreak}</span>
              <span className="text-slate-400 dark:text-ink-muted text-sm">
                {progress.longestStreak === 1 ? 'dia' : 'dias'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Chapter Illustrated Path Map */}
      <div className="bg-gradient-to-b from-[#FAF8F5] to-white dark:bg-none! dark:bg-ink-raised! border border-rose-100/30 dark:border-ink-hairline rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs dark:shadow-none relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 bg-gradient-to-bl from-rosegold/5 to-transparent blur-2xl rounded-full" />
        
        <div className="text-center max-w-md mx-auto space-y-1 relative z-10">
          <EditableText
            contentKey="journey.curriculum.label"
            fallback={textDict.curriculum}
            as="span"
            className="text-[10px] font-sans font-bold uppercase tracking-widest text-rosegold"
          />
          <EditableText
            contentKey={`journey.journey.${activeJourney.id}.headerTitle`}
            fallback={activeJourney.title[lang] || activeJourney.title.pt}
            as="h3"
            className="text-xl font-serif text-slate-800 dark:text-white font-black uppercase"
          />
          <EditableText
            contentKey={`journey.journey.${activeJourney.id}.headerSubtitle`}
            fallback={activeJourney.subtitle[lang] || activeJourney.subtitle.pt}
            as="p"
            className="text-xs text-slate-400 dark:text-ink-muted font-sans"
          />
        </div>

        <div className="flex flex-col items-center gap-2 py-4 relative z-10">
          {activeChapters.map((chapter, index) => {
            const chDays = daysToRender.filter(d => d.chapterId === chapter.id);
            const completedCount = chDays.filter(d => progress.completionHistory.includes(d.dayNumber)).length;
            const isCompleted = chDays.length > 0 && completedCount === chDays.length;

            return (
              <div key={chapter.id} className="w-full max-w-lg flex flex-col items-center">
                {index > 0 && (
                  <div className="my-2 text-rosegold dark:text-rosegold/30 animate-pulse text-lg font-black font-sans leading-none">
                    ↓
                  </div>
                )}

                <div 
                  className={`w-full p-5 sm:p-6 rounded-3xl border transition-all ${
                    isCompleted
                      ? 'bg-rose-50/15 dark:bg-rosegold-light/5 border-rosegold/20 dark:border-rosegold-light/30'
                      : 'bg-white dark:bg-ink-raised border-rose-100/20 dark:border-ink-hairline'
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="text-[11px] font-mono font-black uppercase text-rosegold tracking-wider">
                        Capítulo {index + 1} •{' '}
                        <EditableText
                          contentKey={`journey.chapter.${chapter.id}.theme`}
                          fallback={chapter.theme[lang] || chapter.theme.pt}
                          as="span"
                        />
                      </span>
                      <EditableText
                        contentKey={`journey.chapter.${chapter.id}.title`}
                        fallback={chapter.title[lang] || chapter.title.pt}
                        as="h4"
                        className="text-base font-serif font-black uppercase text-slate-800 dark:text-white mt-0.5"
                      />
                      <EditableText
                        contentKey={`journey.chapter.${chapter.id}.description`}
                        fallback={chapter.description[lang] || chapter.description.pt}
                        as="p"
                        className="text-xs text-slate-400 dark:text-ink-muted font-sans leading-relaxed mt-1"
                      />
                    </div>

                    {/* Butterfly visual metamorphose badge */}
                    <div className="shrink-0 flex flex-col items-center gap-1">
                      <ButterflyIcon 
                        size={getButterflyConfig(index + 1).size} 
                        speedMultiplier={getButterflyConfig(index + 1).speedMultiplier} 
                        className="h-10 w-10 text-rosegold" 
                      />
                      <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                        {completedCount}/{chDays.length} dias
                      </span>
                    </div>
                  </div>

                  {/* List of lessons / days within this chapter */}
                  <div className="mt-4 pt-4 border-t border-rose-100/10 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {chDays.map((day: any) => {
                      const isCompleted = progress.completionHistory.includes(day.dayNumber);
                      const isUnlocked = isDayUnlocked(day);

                      return (
                        <button
                          key={day.id || day.dayNumber}
                          onClick={() => {
                            if (isUnlocked) {
                              onSelectDay(day);
                            }
                          }}
                          disabled={!isUnlocked}
                          className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all relative overflow-hidden ${
                            isCompleted
                              ? 'border-rosegold/30 dark:border-rosegold-light/30 bg-rose-50/10 dark:bg-rosegold-light/5 text-slate-800 dark:text-ink-text'
                              : isUnlocked
                              ? 'border-rose-100/15 dark:border-ink-hairline bg-white dark:bg-ink-raised hover:border-rosegold/50 dark:hover:border-rosegold-light/50'
                              : 'border-rose-100/5 dark:border-ink-hairline bg-[#FAF8F5]/40 dark:bg-transparent opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <div className={`h-8 w-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            isCompleted
                              ? 'bg-rosegold text-white dark:bg-transparent dark:border dark:border-rosegold-light dark:text-rosegold-light'
                              : isUnlocked
                              ? 'bg-rose-50 dark:bg-rosegold-light/10 text-rosegold dark:text-rosegold-light'
                              : 'bg-slate-100 dark:bg-transparent dark:border dark:border-ink-hairline text-slate-400 dark:text-ink-muted'
                          }`}>
                            {isCompleted ? <Check className="h-4 w-4 stroke-[3px]" /> : day.dayNumber}
                          </div>

                          <div className="flex-1 min-w-0">
                            <EditableText
                              contentKey={`journey.day.${day.id || day.dayNumber}.theme`}
                              fallback={day.theme?.[lang] || day.theme?.pt || 'LIÇÃO'}
                              as="span"
                              className="text-[10px] uppercase tracking-wider font-bold block text-rosegold mb-0.5"
                            />
                            <EditableText
                              contentKey={`journey.day.${day.id || day.dayNumber}.title`}
                              fallback={day.title?.[lang] || day.title?.pt || day.title}
                              as="p"
                              className="text-xs font-bold text-slate-800 dark:text-white truncate"
                            />
                          </div>

                          {!isUnlocked && (
                            <Lock className="h-3 w-3 text-slate-300 dark:text-ink-muted shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fase de Prática (dias 31-90) — vive fora do loop de capítulos
          acima de propósito: aquele loop vem do modelo Journey/Chapter/Day
          editável via CMS (journeysData.ts), pensado pra lições únicas
          travadas uma a uma. A prática é tema semanal reciclado dentro de
          uma progressão linear (não uma lição por dia), então é mais simples
          e mais seguro renderizar como seção própria em vez de fingir que
          cada semana é um "dia" naquele sistema. Só aparece na jornada
          principal, as outras jornadas (storytelling etc.) não têm fase de
          prática. */}
      {activeJourneyId === 'destrave_visibilidade' && (
        <div className="bg-gradient-to-b from-[#FAF8F5] to-white dark:bg-none! dark:bg-ink-raised! border border-rose-100/30 dark:border-ink-hairline rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs dark:shadow-none">
          <div className="text-center max-w-md mx-auto space-y-1">
            <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-rosegold block">
              Fase de Prática · dias 31-90
            </span>
            <h3 className="text-xl font-serif text-slate-800 dark:text-white font-black uppercase">
              Depois dos 30 dias
            </h3>
            <p className="text-xs text-slate-400 dark:text-ink-muted font-sans">
              3 blocos, 9 semanas, sem repetir o mesmo tema duas vezes
            </p>
          </div>

          <div className="flex flex-col items-center gap-2 py-4">
            {PRACTICE_BLOCKS.map((block, index) => {
              const blockWeeks = PRACTICE_WEEKS.filter(w => w.blockId === block.id);
              const [rangeStart, rangeEnd] = block.range;
              const totalBlockDays = rangeEnd - rangeStart + 1;
              const completedBlockDays = progress.completionHistory.filter(
                d => d >= rangeStart && d <= rangeEnd
              ).length;
              const isBlockCompleted = completedBlockDays >= totalBlockDays;

              return (
                <div key={block.id} className="w-full max-w-lg flex flex-col items-center">
                  {index > 0 && (
                    <div className="my-2 text-rosegold dark:text-rosegold/30 animate-pulse text-lg font-black font-sans leading-none">
                      ↓
                    </div>
                  )}

                  <div
                    className={`w-full p-5 sm:p-6 rounded-3xl border transition-all ${
                      isBlockCompleted
                        ? 'bg-rose-50/15 dark:bg-rosegold-light/5 border-rosegold/20 dark:border-rosegold-light/30'
                        : 'bg-white dark:bg-ink-raised border-rose-100/20 dark:border-ink-hairline'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-[11px] font-mono font-black uppercase text-rosegold tracking-wider">
                          Bloco {block.id} · Dias {rangeStart}-{rangeEnd}
                        </span>
                        <h4 className="text-base font-serif font-black uppercase text-slate-800 dark:text-white mt-0.5">
                          {block.title}
                        </h4>
                        <p className="text-xs text-slate-400 dark:text-ink-muted font-sans leading-relaxed mt-1">
                          {block.subtitle}
                        </p>
                      </div>
                      <span className="shrink-0 text-[10px] font-mono font-bold uppercase text-slate-400 whitespace-nowrap">
                        {completedBlockDays}/{totalBlockDays} dias
                      </span>
                    </div>

                    <div className="mt-4 pt-4 border-t border-rose-100/10 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {blockWeeks.map(week => {
                        const [wStart, wEnd] = week.range;
                        const wTotal = wEnd - wStart + 1;
                        const wCompleted = progress.completionHistory.filter(
                          d => d >= wStart && d <= wEnd
                        ).length;
                        const wDone = wCompleted >= wTotal;

                        return (
                          <div
                            key={week.id}
                            className={`flex items-center gap-2.5 p-3 rounded-2xl border ${
                              wDone
                                ? 'border-rosegold/30 dark:border-rosegold-light/30 bg-rose-50/10 dark:bg-rosegold-light/5'
                                : 'border-rose-100/15 dark:border-ink-hairline bg-white dark:bg-ink-raised'
                            }`}
                          >
                            <div className={`h-7 w-7 rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0 ${
                              wDone
                                ? 'bg-rosegold text-white dark:bg-transparent dark:border dark:border-rosegold-light dark:text-rosegold-light'
                                : 'bg-rose-50 dark:bg-rosegold-light/10 text-rosegold dark:text-rosegold-light'
                            }`}>
                              {wDone ? <Check className="h-3.5 w-3.5 stroke-[3px]" /> : week.id}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] font-bold text-slate-800 dark:text-white truncate">{week.title}</p>
                              <p className="text-[9px] text-slate-400 dark:text-ink-muted leading-snug">{week.expectativa}</p>
                              <p className="text-[9px] text-slate-400 dark:text-ink-muted font-mono mt-0.5">{wCompleted}/{wTotal}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
