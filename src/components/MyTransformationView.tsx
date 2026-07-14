/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, Heart, Calendar, Bookmark, BookOpen, Star, Sparkles, 
  Smile, Frown, Check, ArrowRight, Eye, Play, Flame, Leaf, Compass, Trash2, ShieldAlert
} from 'lucide-react';
import { Language, UserProgress, MissionDay } from '../types';
import { getChapterForDay, chapters } from '../data/chaptersData';

interface MyTransformationViewProps {
  progress: UserProgress;
  days: MissionDay[];
  lang: Language;
  onBackToHome?: () => void;
}

type TabKey = 'timeline' | 'moodmap' | 'chapters' | 'sos' | 'tree';

export default function MyTransformationView({ progress, days, lang, onBackToHome }: MyTransformationViewProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('timeline');
  const [selectedDayMood, setSelectedDayMood] = useState<number | null>(null);

  // Translations
  const trans = {
    pt: {
      title: 'Minha Transformação',
      subtitle: 'Seu scrapbook particular de autoconfiança, vulnerabilidade e memórias seladas.',
      empty: 'Sua jornada está apenas começando. Cumpra suas primeiras promessas diárias para florescer este diário.',
      tabTimeline: 'Linha do Tempo',
      tabMood: 'Diário de Emoções',
      tabChapters: 'Reflexões de Capítulos',
      tabSos: 'Recuperações SOS',
      tabTree: 'Evolução da Árvore',
      milestonesHeader: 'Marcos de Coragem Alcançados',
      moodMapHeader: 'Mapa Emocional dos 30 Dias',
      moodMapDesc: 'Cada círculo representa um dia integrado. Toque em um círculo para reler sua reflexão e rever sua história.',
      polaroidTitle: 'Evidência de Identidade - Dia {day}',
      polaroidReflection: 'Sua reflexão daquele dia:',
      polaroidVideo: 'Vídeo gravado:',
      polaroidNoVideo: 'Nenhum vídeo salvo neste dia.',
      chapterReflectionsTitle: 'Cartas para o Meu Futuro Eu',
      chapterCardSurprised: 'O que me surpreendeu:',
      chapterCardFeeling: 'Sentimento da Fase:',
      chapterCardNote: 'Nota particular para meu futuro eu:',
      noChapterReflections: 'Nenhuma reflexão de capítulo salva ainda. Complete o Dia 7, 14, 21 ou 30 para preencher esta seção.',
      sosRecoveriesTitle: 'Histórico de Presença e Autoacolhimento (SOS)',
      sosDate: 'Data do Chamado:',
      sosAnxiety: 'Sentimento Inicial:',
      sosBreathing: 'Respiração ajudou?',
      sosHelpful: 'Sim, encontrei meu centro',
      sosNotYet: 'Não totalmente, precisei de um passo mais gentil',
      noSos: 'Você ainda não precisou ativar o SOS Emocional. Lembre-se de que ele está sempre ativo para te apoiar.',
      treeEvolutionTitle: 'O Crescimento Permanente da Sua Árvore',
      treeDesc: 'Sua Árvore do Renascimento não cresce apenas com o passar dos dias. Ela se nutre de coragem física, honestidade e consistência espiritual.',
      backHome: 'Voltar ao Início',
      moodCalm: 'Calma',
      moodHopeful: 'Esperançosa',
      moodNeutral: 'Neutro',
      moodHeavy: 'Coração Pesado',
      moodEmotional: 'Emocionada / Sensível',
      day: 'Dia',
      noReflection: 'Nenhuma reflexão registrada.',
      videoLink: 'Ver Prova Gravada',
      unlocked: 'Revelado',
      locked: 'Ainda por viver',
      vehicleWalking: 'Caminhando — "Dei meus primeiros passos."',
      vehicleBicycle: 'Bicicleta — "Estou encontrando meu ritmo."',
      vehicleSailing: 'Veleiro — "Estou aprendendo a confiar em mim mesma."',
      vehicleButterfly: 'Borboleta — "Eu me transformei."',
      vehicleStage: 'Veículo de Evolução:'
    },
    en: {
      title: 'My Transformation',
      subtitle: 'Your private scrapbook of self-trust, vulnerability, and sealed memories.',
      empty: 'Your journey is just beginning. Keep your first daily promises to grow this journal.',
      tabTimeline: 'Timeline',
      tabMood: 'Emotion Log',
      tabChapters: 'Chapter Reflections',
      tabSos: 'SOS Recoveries',
      tabTree: 'Tree Evolution',
      milestonesHeader: 'Courage Milestones Reached',
      moodMapHeader: '30-Day Emotional Map',
      moodMapDesc: 'Each circle represents an integrated day. Tap a circle to reread your reflection and review your story.',
      polaroidTitle: 'Identity Evidence - Day {day}',
      polaroidReflection: 'Your reflection that day:',
      polaroidVideo: 'Recorded Video:',
      polaroidNoVideo: 'No video saved on this day.',
      chapterReflectionsTitle: 'Letters to My Future Self',
      chapterCardSurprised: 'What surprised me:',
      chapterCardFeeling: 'Phase Feeling:',
      chapterCardNote: 'Private note for my future self:',
      noChapterReflections: 'No chapter reflections saved yet. Complete Day 7, 14, 21, or 30 to fill this section.',
      sosRecoveriesTitle: 'Presence & Self-Care Log (SOS)',
      sosDate: 'Date of call:',
      sosAnxiety: 'Initial Emotion:',
      sosBreathing: 'Did breathing help?',
      sosHelpful: 'Yes, found my center',
      sosNotYet: 'Not fully, needed a gentler step',
      noSos: 'You haven\'t needed to activate the Emotional SOS yet. Remember it is always there to support you.',
      treeEvolutionTitle: 'The Permanent Growth of Your Tree',
      treeDesc: 'Your Tree of Rebirth doesn\'t grow simply by completing days. It feeds on active courage, physical honesty, and spiritual consistency.',
      backHome: 'Back to Home',
      moodCalm: 'Calm',
      moodHopeful: 'Hopeful',
      moodNeutral: 'Neutral',
      moodHeavy: 'Heavy Heart',
      moodEmotional: 'Emotional / Sensitive',
      day: 'Day',
      noReflection: 'No reflection recorded.',
      videoLink: 'View Proof Video',
      unlocked: 'Revealed',
      locked: 'Yet to live',
      vehicleWalking: 'Walking — "Taken my first steps."',
      vehicleBicycle: 'Bicycle — "Finding my rhythm."',
      vehicleSailing: 'Sailing — "Learning to trust myself."',
      vehicleButterfly: 'Butterfly — "I have transformed."',
      vehicleStage: 'Evolution Vehicle:'
    },
    es: {
      title: 'Mi Transformación',
      subtitle: 'Tu álbum de recortes privado de autoconfianza, vulnerabilidad y memorias selladas.',
      empty: 'Tu viaje acaba de comenzar. Cumple tus primeras promesas diarias para florecer este diario.',
      tabTimeline: 'Línea de Tiempo',
      tabMood: 'Diario de Emociones',
      tabChapters: 'Reflexiones de Capítulos',
      tabSos: 'Recuperaciones SOS',
      tabTree: 'Evolución del Árbol',
      milestonesHeader: 'Hitos de Coraje Alcanzados',
      moodMapHeader: 'Mapa Emocional de 30 Días',
      moodMapDesc: 'Cada círculo representa un día integrado. Toca un círculo para releer tu reflexión y repasar tu historia.',
      polaroidTitle: 'Evidencia de Identidad - Día {day}',
      polaroidReflection: 'Tu reflexión de aquel día:',
      polaroidVideo: 'Video grabado:',
      polaroidNoVideo: 'Ningún video guardado en este día.',
      chapterReflectionsTitle: 'Cartas para Mi Futuro Yo',
      chapterCardSurprised: 'Lo que me sorprendió:',
      chapterCardFeeling: 'Sentimiento de la Fase:',
      chapterCardNote: 'Nota privada para mi futuro yo:',
      noChapterReflections: 'Ninguna reflexión de capítulo guardada aún. Completa el Día 7, 14, 21 o 30 para llenar esta sección.',
      sosRecoveriesTitle: 'Historial de Presencia y Auto-cuidado (SOS)',
      sosDate: 'Fecha del llamado:',
      sosAnxiety: 'Sentimiento Inicial:',
      sosBreathing: '¿La respiración ayudó?',
      sosHelpful: 'Sí, encontré mi centro',
      sosNotYet: 'No totalmente, necesité un paso más suave',
      noSos: 'Aún no has necesitado activar el SOS Emocional. Recuerda que siempre está activo para apoyarte.',
      treeEvolutionTitle: 'El Crecimiento Permanente de Tu Árbol',
      treeDesc: 'Tu Árbol del Renacimiento no crece solo con el paso de los días. Se nutre de coraje físico, honestidad y consistencia espiritual.',
      backHome: 'Volver al Inicio',
      moodCalm: 'Calma',
      moodHopeful: 'Esperanzada',
      moodNeutral: 'Neutro',
      moodHeavy: 'Corazón Pesado',
      moodEmotional: 'Emocionada / Sensible',
      day: 'Día',
      noReflection: 'Ninguna reflexión registrada.',
      videoLink: 'Ver Prueba Grabada',
      unlocked: 'Revelado',
      locked: 'Aún por vivir',
      vehicleWalking: 'Caminando — "He dado mis primeros pasos."',
      vehicleBicycle: 'Bicicleta — "Estoy encontrando mi ritmo."',
      vehicleSailing: 'Velero — "Estoy aprendiendo a confiar en mí misma."',
      vehicleButterfly: 'Mariposa — "Me he transformado."',
      vehicleStage: 'Vehículo de Evolución:'
    }
  }[lang];

  const getMoodEmojiAndLabel = (moodKey: string) => {
    switch (moodKey) {
      case 'calm':
        return { emoji: '😊', label: trans.moodCalm, color: 'from-emerald-400 to-teal-500 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' };
      case 'hopeful':
        return { emoji: '🙂', label: trans.moodHopeful, color: 'from-pink-400 to-rose-500 bg-rose-500/20 text-rosegold dark:text-rosegold-light border-rose-500/20' };
      case 'neutral':
        return { emoji: '😐', label: trans.moodNeutral, color: 'from-slate-400 to-slate-500 bg-slate-500/20 text-slate-600 dark:text-slate-400 border-slate-500/20' };
      case 'heavy':
        return { emoji: '😔', label: trans.moodHeavy, color: 'from-blue-400 to-indigo-500 bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' };
      case 'emotional':
        return { emoji: '😭', label: trans.moodEmotional, color: 'from-amber-400 to-yellow-500 bg-yellow-500/20 text-amber-600 dark:text-amber-400 border-amber-500/20' };
      default:
        return { emoji: '✨', label: trans.moodHopeful, color: 'from-rose-300 to-rosegold bg-rose-500/10 text-rosegold border-rose-500/15' };
    }
  };

  // Build list of Milestones/Achievements completed physically
  const milestonesList = [];
  const completedCount = progress.completionHistory.length;

  if (completedCount >= 1) {
    milestonesList.push({
      id: 'day1',
      day: 1,
      title: lang === 'pt' ? 'Primeiro Compromisso Selado' : lang === 'es' ? 'Primer Compromiso Sellado' : 'First Promise Kept',
      desc: lang === 'pt' ? 'Você venceu a inércia e provou que é seguro aparecer.' : lang === 'es' ? 'Venciste la inercia y demostraste que es seguro aparecer.' : 'You overcame inertia and proved that showing up is safe.',
      emoji: '🌱',
      dateStr: progress.lastActiveDate || 'Just now'
    });
  }

  // First video recorded evidence
  const hasRecordedVideo = Object.values(progress.videoLinks || {}).some(link => link && link.trim().length > 3);
  if (hasRecordedVideo) {
    const firstVideoDay = Object.keys(progress.videoLinks || {}).find(dayNum => progress.videoLinks[Number(dayNum)]);
    milestonesList.push({
      id: 'first_video',
      day: Number(firstVideoDay) || 1,
      title: lang === 'pt' ? 'Primeira Evidência em Câmera' : lang === 'es' ? 'Primera Evidencia en Cámara' : 'First Camera Evidence',
      desc: lang === 'pt' ? 'Sua voz foi capturada de forma pura. A lente agora é sua aliada de identidade.' : lang === 'es' ? 'Tu voz fue capturada de forma pura. La lente ahora es tu aliada de identidad.' : 'Your voice was captured purely. The lens is now your identity ally.',
      emoji: '🌿',
      dateStr: 'Captured'
    });
  }

  // Returning after a broken streak (simulated or verified)
  const isReturningUser = progress.completionHistory.length > 3;
  if (isReturningUser) {
    milestonesList.push({
      id: 'returning',
      day: progress.currentDay,
      title: lang === 'pt' ? 'O Retorno da Consistência' : lang === 'es' ? 'El Retorno de la Consistencia' : 'The Return of Consistency',
      desc: lang === 'pt' ? 'Você voltou após momentos de resistência. Você escolheu continuar sua história.' : lang === 'es' ? 'Regresaste después de momentos de resistencia. Elegiste continuar tu historia.' : 'You returned after moments of resistance. You chose to continue your story.',
      emoji: '🌸',
      dateStr: 'Returned'
    });
  }

  // Chapter 1 milestone
  if (progress.completionHistory.includes(7)) {
    milestonesList.push({
      id: 'chap1',
      day: 7,
      title: lang === 'pt' ? 'Capítulo I Integrado' : lang === 'es' ? 'Capítulo I Integrado' : 'Chapter I Integrated',
      desc: lang === 'pt' ? 'Fase de Despertar concluída. Você provou que falar honestamente é seguro.' : lang === 'es' ? 'Fase de Despertar completada. Demostraste que hablar con honestidad es seguro.' : 'Awakening Phase completed. You proved that speaking honestly is safe.',
      emoji: '🦋',
      dateStr: 'Completed'
    });
  }

  // Chapter 2 milestone
  if (progress.completionHistory.includes(14)) {
    milestonesList.push({
      id: 'chap2',
      day: 14,
      title: lang === 'pt' ? 'Capítulo II Integrado' : lang === 'es' ? 'Capítulo II Integrado' : 'Chapter II Integrated',
      desc: lang === 'pt' ? 'Fase de Coragem vencida. Seu crítico interno está cedendo à verdade.' : lang === 'es' ? 'Fase de Coraje superada. Tu crítico interno está cediendo ante la verdad.' : 'Courage Phase conquered. Your inner critic is yielding to truth.',
      emoji: '🍃',
      dateStr: 'Completed'
    });
  }

  // Chapter 3 milestone
  if (progress.completionHistory.includes(21)) {
    milestonesList.push({
      id: 'chap3',
      day: 21,
      title: lang === 'pt' ? 'Capítulo III Integrado' : lang === 'es' ? 'Capítulo III Integrado' : 'Chapter III Integrated',
      desc: lang === 'pt' ? 'Fase de Expressão selada. Seus ganchos e histórias carregam alma real.' : lang === 'es' ? 'Fase de Expresión sellada. Tus ganchos e historias tienen alma real.' : 'Expression Phase sealed. Your hooks and stories carry true soul.',
      emoji: '⛵',
      dateStr: 'Completed'
    });
  }

  // Day 30 complete
  if (progress.completionHistory.includes(30)) {
    milestonesList.push({
      id: 'chap4',
      day: 30,
      title: lang === 'pt' ? 'Renascimento Pleno' : lang === 'es' ? 'Renacimiento Pleno' : 'Full Rebirth Completed',
      desc: lang === 'pt' ? 'Não se trata de se tornar outra pessoa. É sobre lembrar exatamente quem você é.' : lang === 'es' ? 'No se trata de convertirte en otra persona. Se trata de recordar exactamente quién eres.' : 'It is not about becoming someone else. It is about remembering exactly who you are.',
      emoji: '🌳',
      dateStr: 'Full Bloom'
    });
  }

  // Current evolution vehicle based on current chapter
  const currentChapterId = getChapterForDay(progress.currentDay).id;
  const getVehicleDescription = (cid: number) => {
    switch (cid) {
      case 1: return trans.vehicleWalking;
      case 2: return trans.vehicleBicycle;
      case 3: return trans.vehicleSailing;
      case 4:
      default: return trans.vehicleButterfly;
    }
  };

  const getVehicleEmoji = (cid: number) => {
    switch (cid) {
      case 1: return '🚶';
      case 2: return '🚲';
      case 3: return '⛵';
      case 4:
      default: return '🦋';
    }
  };

  return (
    <div className="space-y-8 select-none">
      
      {/* Title Header with beautiful Rose Gold scrapbook binding feel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#2C221E] border border-rose-100/30 dark:border-rosegold/10 p-6 rounded-3xl shadow-sm transition-all duration-300">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-extrabold uppercase tracking-widest text-[#D4AF37] px-2 py-0.5 rounded-md bg-[#D4AF37]/10">
              Scrapbook Private Archive
            </span>
            <Sparkles className="h-4 w-4 text-[#D4AF37] animate-pulse" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif text-slate-950 dark:text-white uppercase font-black tracking-tight">
            {trans.title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl font-sans">
            {trans.subtitle}
          </p>
        </div>

        {onBackToHome && (
          <button
            onClick={onBackToHome}
            className="px-5 py-2.5 bg-rosegold hover:bg-[#A35D68] text-white text-xs uppercase tracking-widest font-bold rounded-xl transition cursor-pointer self-start md:self-center font-sans shadow-md"
          >
            {trans.backHome}
          </button>
        )}
      </div>

      {/* Book Binder Navigation Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-rose-100/35 dark:border-rosegold/10 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-4 py-2.5 text-xs font-sans font-extrabold uppercase tracking-wider rounded-t-xl border-t border-l border-r transition cursor-pointer shrink-0 ${
            activeTab === 'timeline'
              ? 'bg-white dark:bg-[#2C221E] text-rosegold border-rose-100/30 dark:border-rosegold/10 font-black'
              : 'bg-rose-50/20 dark:bg-warmbrown-light/5 text-slate-500 border-transparent hover:bg-rose-50/50'
          }`}
        >
          {trans.tabTimeline}
        </button>

        <button
          onClick={() => setActiveTab('moodmap')}
          className={`px-4 py-2.5 text-xs font-sans font-extrabold uppercase tracking-wider rounded-t-xl border-t border-l border-r transition cursor-pointer shrink-0 ${
            activeTab === 'moodmap'
              ? 'bg-white dark:bg-[#2C221E] text-rosegold border-rose-100/30 dark:border-rosegold/10 font-black'
              : 'bg-rose-50/20 dark:bg-warmbrown-light/5 text-slate-500 border-transparent hover:bg-rose-50/50'
          }`}
        >
          {trans.tabMood}
        </button>

        <button
          onClick={() => setActiveTab('chapters')}
          className={`px-4 py-2.5 text-xs font-sans font-extrabold uppercase tracking-wider rounded-t-xl border-t border-l border-r transition cursor-pointer shrink-0 ${
            activeTab === 'chapters'
              ? 'bg-white dark:bg-[#2C221E] text-rosegold border-rose-100/30 dark:border-rosegold/10 font-black'
              : 'bg-rose-50/20 dark:bg-warmbrown-light/5 text-slate-500 border-transparent hover:bg-rose-50/50'
          }`}
        >
          {trans.tabChapters}
        </button>

        <button
          onClick={() => setActiveTab('sos')}
          className={`px-4 py-2.5 text-xs font-sans font-extrabold uppercase tracking-wider rounded-t-xl border-t border-l border-r transition cursor-pointer shrink-0 ${
            activeTab === 'sos'
              ? 'bg-white dark:bg-[#2C221E] text-rosegold border-rose-100/30 dark:border-rosegold/10 font-black'
              : 'bg-rose-50/20 dark:bg-warmbrown-light/5 text-slate-500 border-transparent hover:bg-rose-50/50'
          }`}
        >
          {trans.tabSos}
        </button>

        <button
          onClick={() => setActiveTab('tree')}
          className={`px-4 py-2.5 text-xs font-sans font-extrabold uppercase tracking-wider rounded-t-xl border-t border-l border-r transition cursor-pointer shrink-0 ${
            activeTab === 'tree'
              ? 'bg-white dark:bg-[#2C221E] text-rosegold border-rose-100/30 dark:border-rosegold/10 font-black'
              : 'bg-rose-50/20 dark:bg-warmbrown-light/5 text-slate-500 border-transparent hover:bg-rose-50/50'
          }`}
        >
          {trans.tabTree}
        </button>
      </div>

      {/* Main Page Area */}
      <div className="bg-white dark:bg-[#2C221E] border border-rose-100/20 dark:border-rosegold/10 rounded-3xl p-6 sm:p-8 shadow-sm">
        <AnimatePresence mode="wait">
          
          {/* 1. TIMELINE OF MEMORIES */}
          {activeTab === 'timeline' && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-2 pb-2 border-b border-rose-100/20 dark:border-rosegold/10">
                <Bookmark className="h-5 w-5 text-rosegold" />
                <h2 className="text-lg font-serif text-slate-900 dark:text-white uppercase font-black">
                  {trans.milestonesHeader}
                </h2>
              </div>

              {milestonesList.length === 0 ? (
                <div className="text-center py-12 text-slate-400 dark:text-slate-500 italic text-sm max-w-sm mx-auto space-y-3">
                  <BookOpen className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto" />
                  <p>{trans.empty}</p>
                </div>
              ) : (
                <div className="relative border-l-2 border-rose-100/50 dark:border-rosegold/15 pl-6 ml-4 space-y-8 py-2 text-left">
                  {milestonesList.map((m, idx) => (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="relative space-y-1 group"
                    >
                      {/* Left timeline dot */}
                      <div className="absolute -left-10 top-0 w-8 h-8 rounded-full bg-[#FAF8F5] dark:bg-[#1E1715] border-2 border-rosegold flex items-center justify-center text-sm shadow-sm">
                        {m.emoji}
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-rosegold">
                          {trans.day} {m.day}
                        </span>
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rosegold/10 text-slate-500 font-bold border border-rose-100/10 uppercase">
                          {m.dateStr}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 font-sans uppercase">
                        {m.title}
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans max-w-xl italic">
                        "{m.desc}"
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* 2. DAILY JOURNAL MOOD MAP */}
          {activeTab === 'moodmap' && (
            <motion.div
              key="moodmap"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="space-y-1.5 text-left border-b border-rose-100/20 dark:border-rosegold/10 pb-4">
                <div className="flex items-center gap-2">
                  <Smile className="h-5 w-5 text-rosegold" />
                  <h2 className="text-lg font-serif text-slate-900 dark:text-white uppercase font-black">
                    {trans.moodMapHeader}
                  </h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {trans.moodMapDesc}
                </p>
              </div>

              {/* Mood Color Legend */}
              <div className="flex flex-wrap gap-4 text-[10px] uppercase font-sans font-extrabold text-slate-400 tracking-wide pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-sm" />
                  <span>{trans.moodCalm}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 shadow-sm" />
                  <span>{trans.moodHopeful}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 shadow-sm" />
                  <span>{trans.moodNeutral}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 shadow-sm" />
                  <span>{trans.moodHeavy}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 shadow-sm" />
                  <span>{trans.moodEmotional}</span>
                </div>
              </div>

              {/* Grid of 30 days */}
              <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-3 pt-4">
                {Array.from({ length: 30 }, (_, i) => {
                  const dNum = i + 1;
                  const isCompleted = progress.completionHistory.includes(dNum);
                  
                  // Retrieve recorded mood if any, fallback to neutral/default
                  const mood = progress.journalMoods?.[dNum] || 'neutral';
                  const moodData = getMoodEmojiAndLabel(mood);

                  return (
                    <motion.button
                      key={dNum}
                      whileHover={{ scale: isCompleted ? 1.08 : 1 }}
                      whileTap={{ scale: isCompleted ? 0.95 : 1 }}
                      onClick={() => isCompleted && setSelectedDayMood(dNum)}
                      disabled={!isCompleted}
                      className={`relative aspect-square flex flex-col items-center justify-center rounded-2xl border transition cursor-pointer select-none ${
                        isCompleted 
                          ? `bg-gradient-to-br ${moodData.color} shadow-sm cursor-pointer`
                          : 'bg-[#FAF8F5]/30 dark:bg-[#1E1715]/20 border-dashed border-rose-100/30 dark:border-rosegold/10 text-slate-300 dark:text-slate-700 cursor-not-allowed'
                      }`}
                    >
                      <span className="text-[10px] font-mono font-bold absolute top-1.5 left-1.5 opacity-60">
                        {dNum}
                      </span>
                      
                      {isCompleted ? (
                        <span className="text-xl mt-1.5">{moodData.emoji}</span>
                      ) : (
                        <span className="text-xs font-serif mt-1 font-black opacity-30">LOCKED</span>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Interactive Detail Modal / Overlay for selected Day reflection */}
              <AnimatePresence>
                {selectedDayMood !== null && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4"
                  >
                    <motion.div
                      initial={{ scale: 0.93, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.93, y: 20 }}
                      className="bg-white dark:bg-[#1E1715] border border-rose-100/30 dark:border-rosegold/15 p-6 rounded-3xl shadow-2xl max-w-md w-full relative space-y-6 text-left"
                    >
                      {/* Polaroid Aesthetic Frame */}
                      <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-bl from-rosegold/10 to-transparent blur-xl rounded-full" />
                      
                      <div className="flex items-center justify-between pb-2 border-b border-rose-100/10">
                        <span className="text-xs font-mono font-extrabold uppercase tracking-widest text-rosegold">
                          {trans.polaroidTitle.replace('{day}', selectedDayMood.toString())}
                        </span>
                        
                        {/* Selected Mood Badge */}
                        {progress.journalMoods?.[selectedDayMood] && (
                          <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-sans font-bold border ${getMoodEmojiAndLabel(progress.journalMoods[selectedDayMood]).color}`}>
                            {getMoodEmojiAndLabel(progress.journalMoods[selectedDayMood]).emoji} {getMoodEmojiAndLabel(progress.journalMoods[selectedDayMood]).label}
                          </span>
                        )}
                      </div>

                      <div className="space-y-4">
                        {/* Day Mission Title */}
                        <div className="space-y-0.5">
                          <h4 className="text-sm font-sans uppercase font-bold text-slate-800 dark:text-[#FAF8F5]">
                            {days.find(d => d.dayNumber === selectedDayMood)?.title[lang] || `Mission Day ${selectedDayMood}`}
                          </h4>
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                            Chapter {getChapterForDay(selectedDayMood).id} • {getChapterForDay(selectedDayMood).title[lang]}
                          </span>
                        </div>

                        {/* Reflection Quote */}
                        <div className="space-y-1 bg-[#FAF8F5]/80 dark:bg-[#1C1513] p-4 rounded-xl border border-rose-100/10">
                          <span className="text-[9px] font-sans text-slate-400 uppercase font-extrabold tracking-widest block">
                            {trans.polaroidReflection}
                          </span>
                          <p className="text-xs font-serif text-slate-700 dark:text-slate-300 italic leading-relaxed">
                            "{progress.reflections[selectedDayMood] || trans.noReflection}"
                          </p>
                        </div>

                        {/* Video link */}
                        <div className="space-y-1">
                          <span className="text-[9px] font-sans text-slate-400 uppercase font-extrabold tracking-widest block">
                            {trans.polaroidVideo}
                          </span>
                          {progress.videoLinks[selectedDayMood] ? (
                            <a
                              href={progress.videoLinks[selectedDayMood]}
                              target="_blank"
                              referrerPolicy="no-referrer"
                              className="text-xs text-rosegold hover:underline font-mono font-bold flex items-center gap-1 mt-1 break-all"
                            >
                              <Play className="h-3 w-3 fill-current shrink-0 text-rosegold" />
                              <span>{progress.videoLinks[selectedDayMood]}</span>
                            </a>
                          ) : (
                            <p className="text-[11px] text-slate-400 italic">
                              {trans.polaroidNoVideo}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          onClick={() => setSelectedDayMood(null)}
                          className="px-5 py-2 bg-rosegold text-white text-xs font-sans uppercase tracking-widest font-bold rounded-xl cursor-pointer hover:bg-[#A35D68] transition"
                        >
                          Close memory
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* 3. CHAPTER REFLECTIONS (Letters to Future Self) */}
          {activeTab === 'chapters' && (
            <motion.div
              key="chapters"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-2 pb-2 border-b border-rose-100/20 dark:border-rosegold/10">
                <BookOpen className="h-5 w-5 text-rosegold" />
                <h2 className="text-lg font-serif text-slate-900 dark:text-white uppercase font-black">
                  {trans.chapterReflectionsTitle}
                </h2>
              </div>

              {(!progress.chapterReflections || Object.keys(progress.chapterReflections).length === 0) ? (
                <div className="text-center py-12 text-slate-400 dark:text-slate-500 italic text-sm max-w-sm mx-auto space-y-3">
                  <Bookmark className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto" />
                  <p>{trans.noChapterReflections}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                  {Object.entries(progress.chapterReflections).map(([cId, r]) => {
                    const chapterId = Number(cId);
                    const chapterObj = chapters.find(ch => ch.id === chapterId);

                    return (
                      <motion.div
                        key={chapterId}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#FAF8F5]/80 dark:bg-[#1E1715] border border-rose-100/25 dark:border-rosegold/10 rounded-2xl p-5 space-y-4 relative shadow-xs overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-bl from-accentgold/10 to-transparent blur-lg rounded-full" />
                        
                        {/* Chapter ID and Title */}
                        <div className="border-b border-rose-100/10 pb-2">
                          <span className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-[#D4AF37]">
                            Chapter {chapterId} • Completed
                          </span>
                          <h3 className="text-base font-serif font-black uppercase text-slate-800 dark:text-white">
                            {chapterObj?.title[lang] || `Chapter ${chapterId}`}
                          </h3>
                        </div>

                        <div className="space-y-3 text-xs">
                          {/* Surprises list */}
                          {r.selectedSurprises && r.selectedSurprises.length > 0 && (
                            <div className="space-y-1">
                              <span className="font-bold text-slate-400 uppercase text-[9px] block">
                                {trans.chapterCardSurprised}
                              </span>
                              <div className="flex flex-wrap gap-1.5 pt-0.5">
                                {r.selectedSurprises.map((s, idx) => (
                                  <span key={idx} className="px-2 py-0.5 bg-rose-50 dark:bg-rosegold/10 text-rosegold border border-rose-100/5 rounded-md font-sans text-[10px]">
                                    ✓ {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Feeling */}
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-400 uppercase text-[9px] block">
                              {trans.chapterCardFeeling}
                            </span>
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                              🌸 {r.selectedFeeling}
                            </span>
                          </div>

                          {/* Private Note Card */}
                          {r.futureSelfNote && (
                            <div className="space-y-1 bg-white dark:bg-[#1C1513] border border-rose-100/10 rounded-xl p-3 font-serif italic text-slate-600 dark:text-slate-300 leading-relaxed">
                              <span className="font-sans not-italic font-bold text-slate-400 uppercase text-[9px] block mb-1">
                                {trans.chapterCardNote}
                              </span>
                              "{r.futureSelfNote}"
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* 4. SOS CHECKINS HISTORY */}
          {activeTab === 'sos' && (
            <motion.div
              key="sos"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-2 pb-2 border-b border-rose-100/20 dark:border-rosegold/10">
                <Heart className="h-5 w-5 text-rose-500 fill-current" />
                <h2 className="text-lg font-serif text-slate-900 dark:text-white uppercase font-black">
                  {trans.sosRecoveriesTitle}
                </h2>
              </div>

              {(!progress.sosCheckins || progress.sosCheckins.length === 0) ? (
                <div className="text-center py-12 text-slate-400 dark:text-slate-500 italic text-sm max-w-sm mx-auto space-y-3">
                  <Compass className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto" />
                  <p>{trans.noSos}</p>
                </div>
              ) : (
                <div className="space-y-4 text-left">
                  {progress.sosCheckins.map((s, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-2xl bg-rose-50/15 dark:bg-[#1E1715] border border-rose-100/10 flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs font-sans"
                    >
                      <div className="space-y-1 max-w-lg">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-rosegold dark:text-rosegold-light uppercase">
                            {trans.sosDate} {s.date}
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 font-serif italic text-sm">
                          "{trans.sosAnxiety} {s.emotion}"
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-slate-400 text-[10px] uppercase font-bold">
                          {trans.sosBreathing}
                        </span>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-extrabold border ${
                          s.breathingHelpful === 'Yes' || s.breathingHelpful === '✨ Yes'
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                            : 'bg-amber-500/10 border-amber-500/20 text-[#D4AF37]'
                        }`}>
                          {s.breathingHelpful === 'Yes' || s.breathingHelpful === '✨ Yes' ? trans.sosHelpful : trans.sosNotYet}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* 5. TREE EVOLUTION */}
          {activeTab === 'tree' && (
            <motion.div
              key="tree"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 text-left"
            >
              <div className="flex items-center gap-2 pb-2 border-b border-rose-100/20 dark:border-rosegold/10">
                <Leaf className="h-5 w-5 text-emerald-500" />
                <h2 className="text-lg font-serif text-slate-900 dark:text-white uppercase font-black">
                  {trans.treeEvolutionTitle}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                
                {/* Visual description column */}
                <div className="md:col-span-2 space-y-4">
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                    {trans.treeDesc}
                  </p>

                  <div className="p-4 rounded-2xl bg-[#FAF8F5]/80 dark:bg-[#1E1715] border border-rose-100/10 flex items-center gap-3">
                    <div className="text-2xl shrink-0">
                      {getVehicleEmoji(currentChapterId)}
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-extrabold">
                        {trans.vehicleStage}
                      </span>
                      <span className="text-xs font-bold text-slate-800 dark:text-[#FAF8F5]">
                        {getVehicleDescription(currentChapterId)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">
                      Tree Progression Rule
                    </span>
                    <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5 list-disc pl-4 font-sans">
                      <li>Levels 1-2: Seed and Sprout (Days 1-5 completed)</li>
                      <li>Levels 3-4: Emerging leaves and stems (Days 6-11 completed)</li>
                      <li>Levels 5-6: Branches and First flower (Days 12-17 completed)</li>
                      <li>Levels 7-8: Landing butterfly and Golden leaves (Days 18-24 completed)</li>
                      <li>Levels 9-10: Complete unshakeable bloom with golden butterflies (Days 25-30 completed)</li>
                    </ul>
                  </div>
                </div>

                {/* current stage card */}
                <div className="p-5 rounded-3xl bg-radial from-rosegold/5 to-transparent border border-rosegold/10 text-center space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 h-12 w-12 bg-accentgold/10 blur-xl rounded-full" />
                  
                  <div className="text-5xl animate-bounce" style={{ animationDuration: '3s' }}>
                    🌳
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                      Active Tree Level
                    </span>
                    <span className="text-2xl font-serif font-black text-rosegold">
                      {Math.min(10, Math.floor(progress.completionHistory.length / 3) + 1)} / 10
                    </span>
                  </div>

                  <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/15 rounded-xl inline-block">
                    <span className="text-[10px] font-mono font-bold text-accentgold uppercase tracking-wider">
                      {completedCount} Promises Kept
                    </span>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}
