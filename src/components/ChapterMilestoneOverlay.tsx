/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Play, Pause, Volume2, ArrowRight, Award, Flame, CheckCircle, RefreshCw } from 'lucide-react';
import { Language, UserProgress } from '../types';
import { Chapter, chapters } from '../data/chaptersData';
import { adaptMessage, pickTone, resolveGuideStyle, ToneVariants } from '../utils/grammar';

interface ChapterMilestoneOverlayProps {
  type: 'intro' | 'completion';
  chapter: Chapter;
  lang: Language;
  userReflection?: string;
  grammarPreference?: 'feminine' | 'masculine' | 'neutral';
  guideStyle?: UserProgress['guideStyle'];
  onClose: () => void;
  onSaveReflection?: (selectedFeeling: string, futureSelfNote: string, selectedSurprises?: string[]) => void;
}

// Milestone copy shown after completing a chapter — varied by guideStyle
const MILESTONE_COPY: Record<Language, { enteredNewVersion: ToneVariants; anotherPromiseKept: ToneVariants }> = {
  pt: {
    enteredNewVersion: {
      gentle: 'Você chegou em um novo lugar dentro de [si mesma/si mesmo/si mesme], com carinho.',
      challenger: 'Você não é mais quem começou. Aja como a nova versão que você já provou ser.',
      strategic: 'Checkpoint alcançado: você validou uma nova versão de [si mesma/si mesmo/si mesme].',
      inspirational: 'Você entrou em uma nova versão de [si mesma/si mesmo/si mesme].'
    },
    anotherPromiseKept: {
      gentle: 'Mais uma promessa gentil cumprida com você mesma.',
      challenger: 'Mais uma promessa cumprida. Prova que você não precisa de motivação pra agir — só de decisão.',
      strategic: 'Registro: mais uma promessa cumprida. O padrão está se consolidando.',
      inspirational: 'Mais uma promessa cumprida.'
    }
  },
  en: {
    enteredNewVersion: {
      gentle: "You've gently arrived at a new place within yourself.",
      challenger: "You're not who you started as anymore. Act like the new version you've already proven to be.",
      strategic: "Checkpoint reached: you've validated a new version of yourself.",
      inspirational: "You've entered a new version of yourself."
    },
    anotherPromiseKept: {
      gentle: 'One more gentle promise kept with yourself.',
      challenger: "Another promise kept. Proof you don't need motivation to act — just a decision.",
      strategic: 'Logged: another promise kept. The pattern is consolidating.',
      inspirational: 'Another promise kept.'
    }
  },
  es: {
    enteredNewVersion: {
      gentle: 'Llegaste con cariño a un nuevo lugar dentro de [ti misma/ti mismo/ti misme].',
      challenger: 'Ya no eres quien empezó. Actúa como la nueva versión que ya demostraste ser.',
      strategic: 'Checkpoint alcanzado: validaste una nueva versión de [ti misma/ti mismo/ti misme].',
      inspirational: 'Has entrado en una nueva versión de [ti misma/ti mismo/ti misme].'
    },
    anotherPromiseKept: {
      gentle: 'Una promesa más cumplida contigo misma, con cariño.',
      challenger: 'Otra promesa cumplida. Prueba de que no necesitas motivación para actuar — solo una decisión.',
      strategic: 'Registro: otra promesa cumplida. El patrón se está consolidando.',
      inspirational: 'Otra promesa cumplida.'
    }
  }
};

export default function ChapterMilestoneOverlay({
  type,
  chapter,
  lang,
  userReflection = '',
  grammarPreference = 'feminine',
  guideStyle,
  onClose,
  onSaveReflection
}: ChapterMilestoneOverlayProps) {
  const resolvedGuideStyle = resolveGuideStyle(guideStyle);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioIntervalRef = useRef<any>(null);

  // Milestone Celebration States
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);
  const [futureSelfNote, setFutureSelfNote] = useState('');
  const [selectedSurprises, setSelectedSurprises] = useState<string[]>([]);

  // Stop speech on unmount
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  const startAudio = () => {
    stopAudio();
    
    // Simulate interactive visualizer progress bar
    setIsPlayingAudio(true);
    let currentProgress = 0;
    audioIntervalRef.current = setInterval(() => {
      currentProgress += 1;
      if (currentProgress >= 100) {
        stopAudio();
      } else {
        setAudioProgress(currentProgress);
      }
    }, 150); // ~15 seconds total

    // Optional Speech Synthesis for true offline audio narrative!
    if ('speechSynthesis' in window) {
      const textToSpeak = adaptMessage(pickTone(chapter.audioNarrative, lang, resolvedGuideStyle), grammarPreference, lang);
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es-ES' : 'en-US';
      utterance.rate = 0.95; // slightly slower, calming voice
      utterance.onend = () => {
        stopAudio();
      };
      speechUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopAudio = () => {
    setIsPlayingAudio(false);
    setAudioProgress(0);
    if (audioIntervalRef.current) {
      clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const toggleAudio = () => {
    if (isPlayingAudio) {
      stopAudio();
    } else {
      startAudio();
    }
  };

  // Accent styles depending on chapter color
  const getChapterAccents = (cid: number) => {
    switch (cid) {
      case 1:
        return {
          glow: 'shadow-[#C9A097]/30 border-[#C9A097]/40',
          text: 'text-[#C9A097]',
          bg: 'bg-[#C9A097]/15 text-[#C9A097]',
          button: 'bg-[#C9A097] hover:bg-[#B58980] text-white',
          accentGradient: 'from-[#FAF8F5] via-[#FCFBF9] to-[#FAF8F5]',
          badgeText: 'text-[#C9A097]'
        };
      case 2:
        return {
          glow: 'shadow-[#B76E79]/30 border-[#B76E79]/40',
          text: 'text-[#B76E79]',
          bg: 'bg-[#B76E79]/15 text-[#B76E79]',
          button: 'bg-[#B76E79] hover:bg-[#A35D68] text-white',
          accentGradient: 'from-[#FAF8F5] via-[#FFFBFB] to-[#FAF8F5]',
          badgeText: 'text-[#B76E79]'
        };
      case 3:
        return {
          glow: 'shadow-[#E8B4A0]/30 border-[#E8B4A0]/40',
          text: 'text-[#E8B4A0]',
          bg: 'bg-[#E8B4A0]/20 text-[#D4AF37]',
          button: 'bg-gradient-to-r from-[#B76E79] to-[#D4AF37] text-white hover:opacity-95',
          accentGradient: 'from-[#FAF8F5] via-[#FFFDF9] to-[#FAF8F5]',
          badgeText: 'text-[#D4AF37]'
        };
      case 4:
      default:
        return {
          glow: 'shadow-[#D4AF37]/40 border-[#D4AF37]/50',
          text: 'text-[#D4AF37]',
          bg: 'bg-[#D4AF37]/15 text-[#D4AF37]',
          button: 'bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#2C221E] font-bold shadow-md hover:brightness-105',
          accentGradient: 'from-[#FAF8F5] via-[#FFFDF5] to-[#FAF8F5]',
          badgeText: 'text-[#D4AF37]'
        };
    }
  };

  const styles = getChapterAccents(chapter.id);
  const isFinalChapter = chapter.id === 4;
  const nextChapter = chapters.find(c => c.id === chapter.id + 1);

  // Translations
  const trans = {
    pt: {
      chapter: 'Capítulo',
      continue: 'Entrar na nova fase',
      completeAndClose: 'Selar Aprendizado',
      expectationTitle: 'Expectativa para esta fase',
      reflectionTitle: 'Reflexão de Sintonização',
      audioTitle: 'Sintonia em Áudio (Calmante)',
      audioSubtitle: 'Ouça o áudio de ativação e ancoragem',
      listenNarrative: 'Ouvir Ativação',
      stopNarrative: 'Parar Ativação',
      congratulations: 'Parabéns!',
      phaseClosed: 'Fase Concluída com Sucesso',
      yourReflection: 'Sua auto-observação registrada:',
      nextPhaseTitle: 'Próxima Fase',
      enterRebirth: 'Iniciar Renascimento Definitivo',
      rebirthSub: 'Sua real história começa agora.',
      qSurprised: 'O que mais te surpreendeu nesta semana de aprendizado?',
      qFeeling: 'Como você se sente exatamente agora?',
      qFutureNote: 'Quer deixar uma nota sincera para o seu eu do futuro? (Opcional, máx 300 caracteres)',
      notePlaceholder: 'Escreva algo gentil que você queira ler mais para a frente...'
    },
    en: {
      chapter: 'Chapter',
      continue: 'Enter new phase',
      completeAndClose: 'Seal Learning',
      expectationTitle: 'Expectations for this phase',
      reflectionTitle: 'Tuning Reflection',
      audioTitle: 'Audio Connection (Calming)',
      audioSubtitle: 'Listen to the activation and anchoring audio',
      listenNarrative: 'Listen Activation',
      stopNarrative: 'Stop Activation',
      congratulations: 'Congratulations!',
      phaseClosed: 'Phase Successfully Closed',
      yourReflection: 'Your recorded self-reflection:',
      nextPhaseTitle: 'Next Phase',
      enterRebirth: 'Begin Definitive Rebirth',
      rebirthSub: 'Your real story begins here.',
      qSurprised: 'What surprised you the most during this week of learning?',
      qFeeling: 'How do you feel exactly right now?',
      qFutureNote: 'Would you like to leave an honest note for your future self? (Optional, max 300 chars)',
      notePlaceholder: 'Write something gentle you would want to read in the future...'
    },
    es: {
      chapter: 'Capítulo',
      continue: 'Entrar a la nueva fase',
      completeAndClose: 'Sellar Aprendizaje',
      expectationTitle: 'Expectativa para esta fase',
      reflectionTitle: 'Reflexión de Sintonización',
      audioTitle: 'Sintonía en Audio (Relajante)',
      audioSubtitle: 'Escucha el audio de activación y anclaje',
      listenNarrative: 'Escuchar Activación',
      stopNarrative: 'Detener Activación',
      congratulations: '¡Felicidades!',
      phaseClosed: 'Fase Completada con Éxito',
      yourReflection: 'Tu auto-observación registrada:',
      nextPhaseTitle: 'Próxima Fase',
      enterRebirth: 'Iniciar Renacimiento Definitivo',
      rebirthSub: 'Tu verdadera historia comienza ahora.',
      qSurprised: '¿Qué fue lo que más te sorprendió durante esta semana de aprendizaje?',
      qFeeling: '¿Cómo te sientes exactamente en este momento?',
      qFutureNote: '¿Quieres dejar una nota sincera para tu yo del futuro? (Opcional, máx 300 caracteres)',
      notePlaceholder: 'Escribe algo tierno que quieras leer más adelante...'
    }
  }[lang];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 select-none"
    >
      <motion.div
        initial={{ scale: 0.95, y: 15 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: -15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 180 }}
        className="relative bg-white dark:bg-[#1E1715] max-w-2xl w-full rounded-3xl overflow-hidden shadow-2xl border border-rose-100/10 dark:border-rosegold/10 text-slate-900 dark:text-[#FAF8F5] flex flex-col h-full max-h-[90vh] md:max-h-[85vh]"
      >
        {/* Subtle decorative elements matching Gold evolution */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-40" />
        
        {/* Animated decorative custom abstract butterfly backdrop */}
        <div className="absolute top-10 right-10 pointer-events-none opacity-5 animate-pulse">
          <svg width="200" height="200" viewBox="0 0 100 100" fill="currentColor" className="text-[#D4AF37]">
            <path d="M50,50 C30,30 10,40 10,60 C10,80 30,80 50,70 C70,80 90,80 90,60 C90,40 70,30 50,50 Z" />
          </svg>
        </div>

        {/* Content View Container */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          
          {/* Header section */}
          <div className="text-center space-y-2">
            <span className={`text-[11px] font-sans tracking-widest font-extrabold uppercase px-3 py-1 rounded-full ${styles.bg}`}>
              {trans.chapter} {chapter.id}
            </span>
            <h1 className={`text-4xl font-serif tracking-tight font-black uppercase mt-1 ${styles.text}`}>
              {chapter.title[lang]}
            </h1>
            <p className="text-xs font-sans text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold">
              {chapter.theme[lang]}
            </p>
          </div>

          <div className="h-px bg-rose-100/20 dark:bg-rosegold/10 w-full" />

          {type === 'intro' ? (
            /* ================= INTRODUCTION MODE ================= */
            <div className="space-y-6">
              
              {/* Elegant Message Quote */}
              <div className="text-center py-4 bg-gradient-to-r from-rose-50/20 to-rose-100/5 dark:from-[#261D1A] dark:to-[#1E1715]/40 rounded-2xl border border-rose-100/10 dark:border-rosegold/5 px-6">
                <span className="text-3xl text-rosegold/30 font-serif block select-none">“</span>
                <p className="text-lg font-serif italic text-slate-800 dark:text-[#E2C2BA] tracking-wide leading-relaxed -mt-3">
                  {adaptMessage(pickTone(chapter.message, lang, resolvedGuideStyle), grammarPreference, lang)}
                </p>
              </div>

              {/* Reflection Statement */}
              <div className="space-y-2">
                <h3 className="text-xs font-sans uppercase font-bold text-rosegold tracking-wider">
                  {trans.reflectionTitle}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic font-serif">
                  {adaptMessage(pickTone(chapter.reflection, lang, resolvedGuideStyle), grammarPreference, lang)}
                </p>
              </div>

              {/* Short Audio Ativation Player */}
              <div className="p-4 bg-[#FAF8F5] dark:bg-[#251D1A] border border-rose-100/35 dark:border-rosegold/10 rounded-2xl space-y-3 shadow-xs">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-[#FAF8F5] uppercase tracking-wider flex items-center gap-1.5 font-sans">
                      <Volume2 className="h-4 w-4 text-rosegold" />
                      {trans.audioTitle}
                    </h4>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                      {trans.audioSubtitle}
                    </p>
                  </div>

                  <button
                    onClick={toggleAudio}
                    className={`p-3 rounded-full transition-all ${styles.button} flex items-center justify-center shrink-0 shadow-md`}
                  >
                    {isPlayingAudio ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
                  </button>
                </div>

                {/* Simulated Audio Visualizer Waves */}
                <div className="flex items-center gap-1.5 h-6 w-full px-2">
                  {isPlayingAudio ? (
                    <div className="flex items-end justify-center gap-1 h-full w-full">
                      {Array.from({ length: 28 }).map((_, i) => {
                        const randomHeight = [20, 45, 95, 30, 70, 40, 85, 55, 90, 35, 60, 25, 80][i % 13];
                        return (
                          <motion.div
                            key={i}
                            animate={{ height: [`${randomHeight * 0.4}%`, `${randomHeight}%`, `${randomHeight * 0.4}%`] }}
                            transition={{
                              duration: 0.8 + (i % 5) * 0.15,
                              repeat: Infinity,
                              ease: 'easeInOut'
                            }}
                            className={`w-1 rounded-full ${chapter.id === 4 ? 'bg-accentgold' : 'bg-[#B76E79]'}`}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <div className="w-full bg-rose-100/30 dark:bg-rosegold/10 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-rosegold h-full" style={{ width: `${audioProgress}%` }} />
                    </div>
                  )}
                </div>
              </div>

              {/* Expectations section */}
              <div className="space-y-2">
                <h3 className="text-xs font-sans uppercase font-bold text-rosegold tracking-wider">
                  {trans.expectationTitle}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                  {adaptMessage(pickTone(chapter.expectation, lang, resolvedGuideStyle), grammarPreference, lang)}
                </p>
              </div>

            </div>
          ) : (
            /* ================= COMPLETION MODE ================= */
            <div className="space-y-6">
              
              {/* Animation or Trophy banner */}
              <div className="text-center py-6 bg-gradient-to-br from-amber-50/15 via-[#FAF8F5] to-amber-100/5 dark:from-[#2A201C] dark:via-[#1E1715] dark:to-[#221B19] rounded-2xl border border-accentgold/15 dark:border-[#D4AF37]/10 flex flex-col items-center space-y-3">
                <div className="w-16 h-16 bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] rounded-full flex items-center justify-center animate-bounce shadow-inner">
                  <Award className="h-8 w-8 text-[#D4AF37]" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-serif text-slate-800 dark:text-white">
                    {trans.congratulations}
                  </h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-sans uppercase tracking-widest font-bold">
                    {trans.phaseClosed}
                  </p>
                </div>
              </div>

              {/* Identity Reinforcement Block */}
              <div className="text-center py-3 bg-[#FAF8F5] dark:bg-[#251D1A] rounded-xl border border-rose-100/10 dark:border-rosegold/5 space-y-0.5">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">
                  Identity Shift
                </span>
                <p className="text-sm font-sans font-bold text-[#D4AF37] animate-pulse">
                  {adaptMessage(
                    (chapter.id === 4 ? MILESTONE_COPY[lang].enteredNewVersion : MILESTONE_COPY[lang].anotherPromiseKept)[resolvedGuideStyle],
                    grammarPreference,
                    lang
                  )}
                </p>
              </div>

              {/* User Reflection Review */}
              {userReflection && (
                <div className="space-y-2 bg-[#FAF8F5]/50 dark:bg-[#201917]/50 p-4 rounded-xl border border-rose-150/10">
                  <span className="text-[10px] font-sans text-slate-400 uppercase tracking-widest block font-bold">
                    {trans.yourReflection}
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-serif italic leading-relaxed">
                    "{userReflection}"
                  </p>
                </div>
              )}

              {/* INTERACTIVE CELEBRATIONS & CONVERSATION */}
              <div className="space-y-4 p-5 bg-[#FAF8F5] dark:bg-[#221B19] rounded-2xl border border-rose-100/10">
                
                {/* Checkboxes: What surprised you this week? */}
                <div className="space-y-2">
                  <h4 className="text-xs font-sans font-extrabold uppercase tracking-wider text-[#D4AF37]">
                    {trans.qSurprised}
                  </h4>
                  <div className="space-y-1.5">
                    {([
                      lang === 'pt' ? "Minha própria voz" : lang === 'es' ? "Mi propia voz" : "My own voice",
                      lang === 'pt' ? "Falar sem gaguejar" : lang === 'es' ? "Hablar sin tartamudear" : "Speaking without stuttering",
                      lang === 'pt' ? "Não me importar com julgamento" : lang === 'es' ? "No importarme el juicio" : "Not caring about judgment",
                      lang === 'pt' ? "A calma após respirar" : lang === 'es' ? "La calma tras respirar" : "The calm after breathing",
                      lang === 'pt' ? "A velocidade que o medo diminuiu" : lang === 'es' ? "La velocidad con la que disminuyó el miedo" : "How fast the fear decreased"
                    ] as string[]).map((surpriseOpt) => {
                      const isChecked = selectedSurprises.includes(surpriseOpt);
                      return (
                        <label 
                          key={surpriseOpt}
                          className={`flex items-center gap-2.5 p-2 rounded-xl border text-xs cursor-pointer select-none transition ${
                            isChecked 
                              ? 'bg-[#FAF8F5] dark:bg-[#1C1513] border-accentgold/30 text-slate-800 dark:text-slate-100' 
                              : 'bg-transparent border-transparent text-slate-500 dark:text-slate-400 hover:bg-rose-50/20'
                          }`}
                        >
                          <input 
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setSelectedSurprises(selectedSurprises.filter(s => s !== surpriseOpt));
                              } else {
                                setSelectedSurprises([...selectedSurprises, surpriseOpt]);
                              }
                            }}
                            className="rounded border-rose-200 text-rosegold focus:ring-rosegold h-3.5 w-3.5"
                          />
                          <span className="font-sans font-medium">{surpriseOpt}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Tappable buttons: How do you feel right now? */}
                <div className="space-y-2 pt-2 border-t border-rose-100/10">
                  <h4 className="text-xs font-sans font-extrabold uppercase tracking-wider text-[#D4AF37]">
                    {trans.qFeeling}
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { key: 'beginning', label: lang === 'pt' ? '🌱 Estou apenas começando' : lang === 'es' ? '🌱 Estoy solo comenzando' : '🌱 I\'m just beginning' },
                      { key: 'proud', label: lang === 'pt' ? '😊 [Orgulhosa/Orgulhoso/Orgulhose] de [mim mesma/mim mesmo/mim mesme]' : lang === 'es' ? '😊 [Orgullosa/Orgulloso/Orgullose] de [mí misma/mí mismo/mí misme]' : '😊 I\'m proud of myself' },
                      { key: 'emotional', label: lang === 'pt' ? '🥹 [Emocionada/Emocionado/Emocionade]' : lang === 'es' ? '🥹 [Emocionada/Emocionado/Emocionade]' : '🥹 I\'m emotional' },
                      { key: 'stronger', label: lang === 'pt' ? '💪 Mais forte' : lang === 'es' ? '💪 Más fuerte' : '💪 I\'m stronger' },
                      { key: 'continue', label: lang === 'pt' ? '✨ Quero continuar' : lang === 'es' ? '✨ Quiero continuar' : '✨ I want to continue' },
                      { key: 'trusted', label: lang === 'pt' ? '❤️ Confiei em mim hoje' : lang === 'es' ? '❤️ Confié en mí hoy' : '❤️ I trusted myself today' }
                    ]).map((feelOpt) => {
                      const isSelected = selectedFeeling === feelOpt.key;
                      return (
                        <button
                          key={feelOpt.key}
                          type="button"
                          onClick={() => setSelectedFeeling(feelOpt.key)}
                          className={`py-2.5 px-3 rounded-xl border text-[11px] font-sans font-semibold text-left transition select-none cursor-pointer ${
                            isSelected 
                              ? 'bg-rosegold/10 border-rosegold/40 text-rosegold font-bold shadow-xs' 
                              : 'bg-transparent border-rose-100/10 hover:border-rose-100/30 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {adaptMessage(feelOpt.label, grammarPreference, lang)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Optional Future self note */}
                {selectedFeeling && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-2 pt-2 border-t border-rose-100/10 overflow-hidden"
                  >
                    <h4 className="text-xs font-sans font-extrabold uppercase tracking-wider text-[#D4AF37]">
                      {trans.qFutureNote}
                    </h4>
                    <textarea
                      maxLength={300}
                      rows={3}
                      value={futureSelfNote}
                      onChange={(e) => setFutureSelfNote(e.target.value)}
                      placeholder={trans.notePlaceholder}
                      className="w-full text-xs bg-white dark:bg-[#1E1715] border border-rose-100/30 dark:border-rosegold/10 focus:border-rosegold focus:outline-none rounded-xl p-2.5 text-slate-700 dark:text-slate-200 transition font-sans leading-relaxed"
                    />
                    <div className="text-right text-[9px] text-slate-400 font-mono">
                      {futureSelfNote.length}/300
                    </div>
                  </motion.div>
                )}

              </div>

              {/* Preview of the next chapter or final transition */}
              {!isFinalChapter && nextChapter ? (
                <div className="p-4 rounded-2xl border border-dashed border-rose-200/30 dark:border-rosegold/20 bg-rose-50/5 dark:bg-rosegold/5 space-y-2">
                  <span className="text-[10px] font-sans text-slate-400 dark:text-slate-500 uppercase tracking-widest block font-bold">
                    {trans.nextPhaseTitle} • {trans.chapter} {nextChapter.id}
                  </span>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-serif font-bold text-rosegold dark:text-[#E2C2BA] uppercase">
                        {nextChapter.title[lang]}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {nextChapter.theme[lang]}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-accentgold shrink-0" />
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/5 to-accentgold/10 border border-[#D4AF37]/30 text-center space-y-1">
                  <h4 className="text-sm font-serif font-extrabold text-accentgold uppercase tracking-wider">
                    {trans.enterRebirth}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {trans.rebirthSub}
                  </p>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Action Bottom Bar */}
        <div className="p-6 bg-[#FAF8F5] dark:bg-[#231A18] border-t border-rose-100/20 dark:border-rosegold/10 flex items-center justify-end font-sans">
          <button
            onClick={() => {
              stopAudio();
              if (type === 'completion' && onSaveReflection && selectedFeeling) {
                onSaveReflection(selectedFeeling, futureSelfNote, selectedSurprises);
              }
              onClose();
            }}
            disabled={type === 'completion' && !selectedFeeling}
            className={`px-6 py-3.5 rounded-xl text-xs font-sans font-bold uppercase tracking-wider flex items-center gap-2 transition cursor-not-allowed shadow-sm ${styles.button} ${
              (type === 'completion' && !selectedFeeling) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            <span>{type === 'intro' ? trans.continue : trans.completeAndClose}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

      </motion.div>
    </motion.div>
  );
}
