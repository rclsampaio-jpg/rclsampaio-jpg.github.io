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
import EditableText from './editable/EditableText';

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

// Milestone copy shown after completing a chapter, varied by guideStyle
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
      challenger: 'Mais uma promessa cumprida. Prova que você não precisa de motivação pra agir, só de decisão.',
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
      challenger: "Another promise kept. Proof you don't need motivation to act, just a decision.",
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
      challenger: 'Otra promesa cumplida. Prueba de que no necesitas motivación para actuar, solo una decisión.',
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

  // Trajeto da borboleta: cada passagem usa um caminho diferente (ponto de
  // entrada/saída e curva variam), avançando pra um novo trajeto só quando
  // o anterior termina. Com "repeat: Infinity" reaproveitando o mesmo
  // trajeto, ela sempre saía e entrava exatamente no mesmo lugar, o que
  // parecia um robô resetando em vez de voar de verdade pela tela.
  const [butterflyPathIndex, setButterflyPathIndex] = useState(0);
  const BUTTERFLY_PATHS = [
    { from: { x: '-15vw', y: '70vh', rotate: 20 }, to: { x: '115vw', y: ['70vh', '50vh', '60vh', '35vh', '45vh', '20vh'], rotate: [20, 0, 15, -10, 5, -20] } },
    { from: { x: '115vw', y: '20vh', rotate: -160 }, to: { x: '-15vw', y: ['20vh', '38vh', '28vh', '55vh', '42vh', '65vh'], rotate: [-160, -180, -165, -195, -175, -200] } },
    { from: { x: '20vw', y: '110vh', rotate: -70 }, to: { x: '75vw', y: ['110vh', '75vh', '40vh', '30vh', '15vh', '-10vh'], rotate: [-70, -50, -60, -30, -45, -20] } },
    { from: { x: '85vw', y: '-10vh', rotate: 110 }, to: { x: '25vw', y: ['-10vh', '20vh', '45vh', '35vh', '60vh', '80vh'], rotate: [110, 130, 115, 145, 125, 150] } }
  ];

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

  // Accent styles depending on chapter, sempre a partir dos 3 tokens reais
  // de marca (rosegold, rosegold-light, accentgold — ver src/index.css),
  // nunca hex inventado fora da paleta.
  const getChapterAccents = (cid: number) => {
    switch (cid) {
      case 1:
        return {
          glow: 'shadow-rosegold-light/30 border-rosegold-light/40',
          text: 'text-rosegold dark:text-rosegold-light',
          bg: 'bg-rosegold-light/20 text-rosegold dark:text-rosegold-light',
          button: 'bg-rosegold-light hover:brightness-95 text-warmbrown',
          badgeText: 'text-rosegold dark:text-rosegold-light'
        };
      case 2:
        return {
          glow: 'shadow-rosegold/30 border-rosegold/40',
          text: 'text-rosegold dark:text-rosegold-light',
          bg: 'bg-rosegold/15 text-rosegold dark:text-rosegold-light',
          button: 'bg-rosegold hover:bg-[#A35D68] text-white',
          badgeText: 'text-rosegold dark:text-rosegold-light'
        };
      case 3:
        return {
          glow: 'shadow-accentgold/30 border-accentgold/40',
          text: 'text-rosegold dark:text-rosegold-light',
          bg: 'bg-accentgold/15 text-accentgold',
          button: 'bg-gradient-to-r from-rosegold to-accentgold text-white hover:opacity-95',
          badgeText: 'text-accentgold'
        };
      case 4:
      default:
        return {
          glow: 'shadow-accentgold/40 border-accentgold/50',
          text: 'text-accentgold',
          bg: 'bg-accentgold/15 text-accentgold',
          button: 'bg-accentgold hover:brightness-105 text-warmbrown font-bold shadow-md',
          badgeText: 'text-accentgold'
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
      qFutureNote: 'Você realizou um marco e ele precisa ser celebrado! Parabéns!! Agora deixa uma mensagem pro seu eu do futuro. Pode não fazer sentido hoje, mas vai por mim, você vai me agradecer depois!! 🦋',
      notePlaceholder: 'Escreva algo gentil que você queira ler mais para a frente...',
      identityShiftLabel: 'Quem você está se tornando'
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
      qFutureNote: "You just hit a milestone and it needs celebrating! Congrats!! Now leave a message for your future self. It might not make sense today, but trust me, you'll thank me later!! 🦋",
      notePlaceholder: 'Write something gentle you would want to read in the future...',
      identityShiftLabel: 'Who you are becoming'
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
      qFutureNote: '¡Alcanzaste un marco y eso merece celebrarse! ¡¡Felicidades!! Ahora deja un mensaje para tu yo del futuro. Puede que hoy no tenga sentido, pero confía en mí, ¡¡me lo vas a agradecer después!! 🦋',
      notePlaceholder: 'Escribe algo tierno que quieras leer más adelante...',
      identityShiftLabel: 'Quién te estás convirtiendo'
    }
  }[lang];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 select-none"
    >
      {/* Borboleta voando por cima do card (z-[60], acima do modal). Troca
          de trajeto a cada passagem (ver BUTTERFLY_PATHS) em vez de repetir
          sempre o mesmo caminho, senão parecia um robô saindo e entrando
          no mesmo lugar. */}
      <div className="absolute inset-0 z-[60] pointer-events-none overflow-hidden">
        <motion.div
          key={butterflyPathIndex}
          initial={BUTTERFLY_PATHS[butterflyPathIndex].from}
          animate={BUTTERFLY_PATHS[butterflyPathIndex].to}
          transition={{
            duration: 7,
            ease: 'easeInOut'
          }}
          onAnimationComplete={() => {
            setTimeout(() => {
              setButterflyPathIndex((i) => (i + 1) % BUTTERFLY_PATHS.length);
            }, 800);
          }}
          className="absolute"
        >
          <motion.img
            src="/assets/images/butterfly.png"
            alt=""
            animate={{ scaleY: [1, 0.78, 1], skewX: [0, 3, 0] }}
            transition={{ duration: 0.4, repeat: Infinity, ease: 'easeInOut' }}
            className="h-9 w-auto opacity-40"
            style={{ transformOrigin: 'center 70%' }}
          />
        </motion.div>
      </div>

      <motion.div
        initial={{ scale: 0.95, y: 15 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: -15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 180 }}
        className="relative bg-white dark:bg-ink-raised max-w-2xl w-full rounded-3xl overflow-hidden shadow-2xl border border-rose-100/10 dark:border-rosegold/10 text-slate-900 dark:text-ink-text flex flex-col h-full max-h-[90vh] md:max-h-[85vh]"
      >
        {/* Subtle decorative elements matching Gold evolution */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-40" />

        {/* Content View Container */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          
          {/* Header section */}
          <div className="text-center space-y-2">
            <span className={`text-[11px] font-sans tracking-widest font-bold uppercase px-3 py-1 rounded-full ${styles.bg}`}>
              {trans.chapter} {chapter.id}
            </span>
            <EditableText
              contentKey={`journey.chapter.${chapter.id}.title`}
              fallback={chapter.title[lang]}
              as="h1"
              className={`text-3xl sm:text-4xl font-display font-light tracking-tight mt-1 ${styles.text}`}
            />
            <EditableText
              contentKey={`journey.chapter.${chapter.id}.theme`}
              fallback={chapter.theme[lang]}
              as="p"
              className="text-xs font-sans text-slate-400 dark:text-ink-muted uppercase tracking-widest font-semibold"
            />
          </div>

          <div className="h-px bg-rose-100/20 dark:bg-rosegold/10 w-full" />

          {type === 'intro' ? (
            /* ================= INTRODUCTION MODE ================= */
            <div className="space-y-6">
              
              {/* Elegant Message Quote */}
              <div className="text-center py-4 bg-gradient-to-r from-rose-50/20 to-rose-100/5 dark:bg-ink-raised dark:from-ink-raised dark:to-ink-raised rounded-2xl border border-rose-100/10 dark:border-ink-hairline px-6">
                <span className="text-3xl text-rosegold/30 font-serif block select-none">“</span>
                <p className="text-lg font-serif italic text-slate-800 dark:text-rosegold-light tracking-wide leading-relaxed -mt-3">
                  {adaptMessage(pickTone(chapter.message, lang, resolvedGuideStyle), grammarPreference, lang)}
                </p>
              </div>

              {/* Reflection Statement */}
              <div className="space-y-2">
                <EditableText
                  contentKey="journey.milestone.reflectionTitle"
                  fallback={trans.reflectionTitle}
                  as="h3"
                  className="text-xs font-sans uppercase font-bold text-rosegold tracking-wider"
                />
                <p className="text-sm text-slate-600 dark:text-ink-muted leading-relaxed italic font-serif">
                  {adaptMessage(pickTone(chapter.reflection, lang, resolvedGuideStyle), grammarPreference, lang)}
                </p>
              </div>

              {/* Short Audio Ativation Player */}
              <div className="p-4 bg-[#FAF8F5] dark:bg-ink-raised border border-rose-100/35 dark:border-rosegold/10 rounded-2xl space-y-3 shadow-xs">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-ink-text uppercase tracking-wider flex items-center gap-1.5 font-sans">
                      <Volume2 className="h-4 w-4 text-rosegold" />
                      <EditableText contentKey="journey.milestone.audioTitle" fallback={trans.audioTitle} as="span" />
                    </h4>
                    <EditableText
                      contentKey="journey.milestone.audioSubtitle"
                      fallback={trans.audioSubtitle}
                      as="p"
                      className="text-[11px] text-slate-400 dark:text-ink-muted"
                    />
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
                <EditableText
                  contentKey="journey.milestone.expectationTitle"
                  fallback={trans.expectationTitle}
                  as="h3"
                  className="text-xs font-sans uppercase font-bold text-rosegold tracking-wider"
                />
                <p className="text-xs text-slate-600 dark:text-ink-muted leading-relaxed font-sans">
                  {adaptMessage(pickTone(chapter.expectation, lang, resolvedGuideStyle), grammarPreference, lang)}
                </p>
              </div>

            </div>
          ) : (
            /* ================= COMPLETION MODE ================= */
            <div className="space-y-6">
              
              {/* Animation or Trophy banner */}
              <div className="text-center py-7 bg-gradient-to-br from-emerald-50 via-amber-50/40 to-[#FAF8F5] dark:from-emerald-500/10 dark:via-ink-raised dark:to-ink-raised rounded-2xl border border-emerald-300/40 dark:border-emerald-400/20 flex flex-col items-center space-y-3 shadow-[0_0_40px_-10px] shadow-emerald-300/40 dark:shadow-emerald-500/10">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-500 text-white rounded-full flex items-center justify-center animate-bounce shadow-lg shadow-emerald-400/40">
                  <Award className="h-9 w-9" />
                </div>
                <div className="space-y-1">
                  <EditableText
                    contentKey="journey.milestone.congratulations"
                    fallback={trans.congratulations}
                    as="h2"
                    className="text-2xl font-display font-semibold text-emerald-700 dark:text-emerald-300"
                  />
                  <EditableText
                    contentKey="journey.milestone.phaseClosed"
                    fallback={trans.phaseClosed}
                    as="p"
                    className="text-xs text-emerald-600/80 dark:text-emerald-400/80 font-sans uppercase tracking-widest font-bold"
                  />
                </div>
              </div>

              {/* Identity Reinforcement Block */}
              <div className="text-center py-4 bg-gradient-to-r from-accentgold/10 via-warmwhite to-accentgold/10 dark:from-accentgold/10 dark:via-ink-raised dark:to-accentgold/5 rounded-xl border border-accentgold/25 space-y-1">
                <span className="text-[10px] text-accentgold uppercase tracking-widest font-bold">
                  {trans.identityShiftLabel}
                </span>
                <p className="text-base font-serif font-bold text-slate-800 dark:text-white">
                  {adaptMessage(
                    (chapter.id === 4 ? MILESTONE_COPY[lang].enteredNewVersion : MILESTONE_COPY[lang].anotherPromiseKept)[resolvedGuideStyle],
                    grammarPreference,
                    lang
                  )}
                </p>
              </div>

              {/* User Reflection Review */}
              {userReflection && (
                <div className="space-y-2 bg-[#FAF8F5]/50 dark:bg-ink-raised/50 p-4 rounded-xl border border-rose-150/10">
                  <EditableText
                    contentKey="journey.milestone.yourReflection"
                    fallback={trans.yourReflection}
                    as="span"
                    className="text-[10px] font-sans text-slate-400 uppercase tracking-widest block font-bold"
                  />
                  <p className="text-xs text-slate-700 dark:text-ink-muted font-serif italic leading-relaxed">
                    "{userReflection}"
                  </p>
                </div>
              )}

              {/* INTERACTIVE CELEBRATIONS & CONVERSATION */}
              <div className="space-y-4 p-5 bg-[#FAF8F5] dark:bg-ink-raised rounded-2xl border border-rose-100/10">
                
                {/* Checkboxes: What surprised you this week? */}
                <div className="space-y-2">
                  <EditableText
                    contentKey="journey.milestone.qSurprised"
                    fallback={trans.qSurprised}
                    as="h4"
                    className="text-xs font-sans font-extrabold uppercase tracking-wider text-[#D4AF37]"
                  />
                  <div className="space-y-1.5">
                    {([
                      lang === 'pt' ? "Não travei no meio da frase" : lang === 'es' ? "No me trabé a mitad de la frase" : "I didn't freeze mid-sentence",
                      lang === 'pt' ? "Gravei sem decorar o que ia falar" : lang === 'es' ? "Grabé sin memorizar lo que iba a decir" : "I recorded without memorizing my lines",
                      lang === 'pt' ? "Recebi uma mensagem boa que eu não esperava" : lang === 'es' ? "Recibí un mensaje lindo que no esperaba" : "I got a kind message I didn't expect",
                      lang === 'pt' ? "Minha respiração voltou ao normal mais rápido" : lang === 'es' ? "Mi respiración volvió a la normalidad más rápido" : "My breathing went back to normal faster",
                      lang === 'pt' ? "Na última vez o medo demorou mais pra passar" : lang === 'es' ? "La última vez el miedo tardó más en pasar" : "Last time the fear took longer to fade"
                    ] as string[]).map((surpriseOpt) => {
                      const isChecked = selectedSurprises.includes(surpriseOpt);
                      return (
                        <label 
                          key={surpriseOpt}
                          className={`flex items-center gap-2.5 p-2 rounded-xl border text-xs cursor-pointer select-none transition ${
                            isChecked 
                              ? 'bg-[#FAF8F5] dark:bg-ink-raised border-accentgold/30 text-slate-800 dark:text-ink-text' 
                              : 'bg-transparent border-transparent text-slate-500 dark:text-ink-muted hover:bg-rose-50/20'
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
                  <EditableText
                    contentKey="journey.milestone.qFeeling"
                    fallback={trans.qFeeling}
                    as="h4"
                    className="text-xs font-sans font-extrabold uppercase tracking-wider text-[#D4AF37]"
                  />
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
                              : 'bg-transparent border-rose-100/10 hover:border-rose-100/30 text-slate-600 dark:text-ink-muted'
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
                    <EditableText
                      contentKey="journey.milestone.qFutureNote"
                      fallback={trans.qFutureNote}
                      as="h4"
                      className="text-xs font-sans font-extrabold uppercase tracking-wider text-[#D4AF37]"
                    />
                    <textarea
                      maxLength={300}
                      rows={3}
                      value={futureSelfNote}
                      onChange={(e) => setFutureSelfNote(e.target.value)}
                      placeholder={trans.notePlaceholder}
                      className="w-full text-xs bg-white dark:bg-ink-raised border border-rose-100/30 dark:border-rosegold/10 focus:border-rosegold focus:outline-none rounded-xl p-2.5 text-slate-700 dark:text-ink-text transition font-sans leading-relaxed"
                    />
                    <div className="text-right text-[11px] text-slate-400 font-mono">
                      {futureSelfNote.length}/300
                    </div>
                  </motion.div>
                )}

              </div>

              {/* Preview of the next chapter or final transition */}
              {!isFinalChapter && nextChapter ? (
                <div className="p-4 rounded-2xl border border-dashed border-rose-200/30 dark:border-rosegold/20 bg-rose-50/5 dark:bg-rosegold/5 space-y-2">
                  <span className="text-[10px] font-sans text-slate-400 dark:text-ink-muted uppercase tracking-widest block font-bold">
                    {trans.nextPhaseTitle} • {trans.chapter} {nextChapter.id}
                  </span>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <EditableText
                        contentKey={`journey.chapter.${nextChapter.id}.title`}
                        fallback={nextChapter.title[lang]}
                        as="h4"
                        className="text-sm font-serif font-bold text-rosegold dark:text-rosegold-light uppercase"
                      />
                      <EditableText
                        contentKey={`journey.chapter.${nextChapter.id}.theme`}
                        fallback={nextChapter.theme[lang]}
                        as="p"
                        className="text-xs text-slate-500 dark:text-ink-muted"
                      />
                    </div>
                    <ArrowRight className="h-4 w-4 text-accentgold shrink-0" />
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/5 to-accentgold/10 border border-[#D4AF37]/30 text-center space-y-1">
                  <EditableText
                    contentKey="journey.milestone.enterRebirth"
                    fallback={trans.enterRebirth}
                    as="h4"
                    className="text-sm font-serif font-extrabold text-accentgold uppercase tracking-wider"
                  />
                  <EditableText
                    contentKey="journey.milestone.rebirthSub"
                    fallback={trans.rebirthSub}
                    as="p"
                    className="text-xs text-slate-500 dark:text-ink-muted"
                  />
                </div>
              )}

            </div>
          )}

        </div>

        {/* Action Bottom Bar */}
        <div className="p-6 bg-[#FAF8F5] dark:bg-ink-raised border-t border-rose-100/20 dark:border-rosegold/10 flex items-center justify-end font-sans">
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
            <EditableText
              contentKey={type === 'intro' ? 'journey.milestone.continueButton' : 'journey.milestone.completeAndCloseButton'}
              fallback={type === 'intro' ? trans.continue : trans.completeAndClose}
              as="span"
            />
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

      </motion.div>
    </motion.div>
  );
}
