/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Flame, CheckCircle2, ArrowRight, BookOpen, Volume2,
  Settings, Award, Lock, HelpCircle, Check, Play, Compass, User
} from 'lucide-react';
import { MissionDay, Language, UserProgress, DayType } from '../types';
import { getDayTypeLabel } from '../data/templateData';
import { adaptMessage, resolveGrammarPreference } from '../utils/grammar';

// Chapter and Butterfly Imports
import { getChapterForDay, getButterflyConfig } from '../data/chaptersData';
import ButterflyIcon from './ButterflyIcon';
import TreeOfRebirth from './TreeOfRebirth';
import RenaSerLogo from './RenaSerLogo';

interface HomeViewProps {
  currentDay: MissionDay;
  progress: UserProgress;
  lang: Language;
  onSelectTab: (tabId: 'home' | 'journey' | 'hooks' | 'settings' | 'cms' | 'mission' | 'transformation') => void;
  onLanguageChange: (lang: Language) => void;
  onShowIntro?: (chapterId: number) => void;
  onUpdateProgress?: (updated: UserProgress) => void;
}

export default function HomeView({
  currentDay,
  progress,
  lang,
  onSelectTab,
  onLanguageChange,
  onShowIntro,
  onUpdateProgress
}: HomeViewProps) {
  const [onboardState, setOnboardState] = useState<'splash' | 'lang' | 'name' | 'guidestyle' | 'grammar' | 'welcome' | 'intro' | 'complete'>('complete');
  const [selectedStyle, setSelectedStyle] = useState<'gentle' | 'challenger' | 'strategic' | 'inspirational'>('gentle');
  const [selectedGrammar, setSelectedGrammar] = useState<'feminine' | 'masculine'>('feminine');
  const [nameInput, setNameInput] = useState('');
  
  // Onboarding initialization check
  useEffect(() => {
    const isCompleted = localStorage.getItem('renaser_onboarded') === 'true';
    if (!isCompleted) {
      setOnboardState('splash');
    }
  }, []);

  const handleNextOnboard = () => {
    if (onboardState === 'splash') setOnboardState('lang');
    else if (onboardState === 'lang') setOnboardState('name');
    else if (onboardState === 'name') {
      if (onUpdateProgress) {
        onUpdateProgress({ ...progress, displayName: nameInput.trim() || null });
      }
      setOnboardState('guidestyle');
    }
    else if (onboardState === 'guidestyle') setOnboardState('grammar');
    else if (onboardState === 'grammar') {
      // Save style and grammar preference on transition
      if (onUpdateProgress) {
        onUpdateProgress({
          ...progress,
          guideStyle: selectedStyle,
          grammarPreference: selectedGrammar,
          behaviorStats: progress.behaviorStats || {
            listeningSeconds: 0,
            videosCompletedCount: 0,
            skippedReflectionsCount: 0,
            sosOpenedCount: 0,
            completionCount: 0,
            pausesCount: 0,
            replayCount: 0,
            skippedIntroCount: 0,
            totalSessions: 1,
            lastActiveTimestamp: Date.now()
          }
        });
      }
      setOnboardState('welcome');
    }
    else if (onboardState === 'welcome') setOnboardState('intro');
    else if (onboardState === 'intro') {
      localStorage.setItem('renaser_onboarded', 'true');
      setOnboardState('complete');
    }
  };

  // Translations
  const trans = {
    pt: {
      onboardingWelcome: "Seja [Bem-vinda/Bem-vindo/Bem-vinde] ao RenaSer",
      onboardingSub: "Uma experiência de visibilidade e coragem",
      languageTitle: "Configurações de Idioma",
      nameStepTitle: "Como devemos te chamar?",
      nameStepSubtitle: "Escolha o nome de preferência. É assim que vamos te chamar por aqui.",
      namePlaceholder: "Seu nome de preferência...",
      selectLanguage: "Escolha seu idioma / Choose your language:",
      getStarted: "Começar Jornada",
      continue: "Continuar",
      introTitle: "Você está [pronta/pronto/pronte]?",
      introText: "Pelos próximos 30 dias, você receberá um gancho (hook) diário e um áudio prático de 10 minutos. Este é um espaço seguro para você lembrar quem você realmente é.",
      todayTheme: "Tema do Dia",
      progressTitle: "Sua Evolução",
      completedDays: "{completed} de {total} dias concluídos",
      currentStreak: "Racha Atual",
      longestStreak: "Melhor Racha",
      streakDays: "{count} dias",
      longestDays: "Recorde: {count} dias",
      yesterdayReminder: "✨ A jornada estava à sua espera. Continue exatamente de onde parou — seu ritmo de crescimento é único e livre de julgamentos.",
      viewIntro: "Reouvir Alinhamento do Capítulo",
      chapter: "Capítulo",
      chapterOf: "de",
      todayHookTitle: "Gancho de Hoje",
      hookInstructions: "Copie e utilize este gancho nas suas redes sociais para atrair sua audiência.",
      todayAudioTitle: "Áudio de Hoje",
      audioReady: "O áudio prático de hoje está disponível",
      audioDone: "Áudio concluído com sucesso!",
      goMission: "Ir para a Missão Diária",
      missionCompleted: "Missão Concluída!",
      reviewMission: "Ver Detalhes da Missão",
      restDay: "Dia de Descanso",
      restDesc: "Hoje é dia de respirar, integrar e descansar. Nenhuma ação de exposição é requerida.",
      lockedTitle: "Dia Bloqueado",
      lockedDesc: "Complete o dia anterior para liberar este conteúdo.",
      waitingForTomorrow: "Este passo libera amanhã. Aproveite hoje pra descansar — você já cumpriu sua promessa.",
      copyHook: "Copiar Gancho",
      copied: "Copiado!"
    },
    en: {
      onboardingWelcome: "Welcome to RenaSer",
      onboardingSub: "An experience of visibility and courage",
      languageTitle: "Language Settings",
      nameStepTitle: "What should we call you?",
      nameStepSubtitle: "Choose your preferred name. That's how we'll address you around here.",
      namePlaceholder: "Your preferred name...",
      selectLanguage: "Choose your language / Escolha seu idioma:",
      getStarted: "Start Journey",
      continue: "Continue",
      introTitle: "Are you ready?",
      introText: "For the next 30 days, you will receive a daily hook and a practical 10-minute audio. This is a safe environment designed for you to remember who you truly are.",
      todayTheme: "Today's Theme",
      progressTitle: "Your Progress",
      completedDays: "{completed} of {total} days completed",
      currentStreak: "Current Streak",
      longestStreak: "Best Streak",
      streakDays: "{count} days",
      longestDays: "Record: {count} days",
      yesterdayReminder: "✨ The journey has been waiting for you. Continue exactly from where you stopped — your pace of growth is unique and free from guilt.",
      viewIntro: "Replay Chapter Alignment",
      chapter: "Chapter",
      chapterOf: "of",
      todayHookTitle: "Today's Hook",
      hookInstructions: "Copy and use this hook on your social channels to spark engagement.",
      todayAudioTitle: "Today's Audio Guide",
      audioReady: "Today's guided audio session is ready",
      audioDone: "Audio completed successfully!",
      goMission: "Go to Daily Mission",
      missionCompleted: "Mission Completed!",
      reviewMission: "Review Mission details",
      restDay: "Day of Rest",
      restDesc: "Today is for breathing, integration, and resting. No exposure action required.",
      lockedTitle: "Day Locked",
      lockedDesc: "Complete the previous day to unlock this content.",
      waitingForTomorrow: "This step unlocks tomorrow. Take today to rest — you already kept your promise.",
      copyHook: "Copy Hook",
      copied: "Copied!"
    },
    es: {
      onboardingWelcome: "[Bienvenida/Bienvenido/Bienvenide] a RenaSer",
      onboardingSub: "Una experiencia de visibilidad y coraje",
      languageTitle: "Configuración de Idioma",
      nameStepTitle: "¿Cómo debemos llamarte?",
      nameStepSubtitle: "Elige tu nombre de preferencia. Así te llamaremos por aquí.",
      namePlaceholder: "Tu nombre de preferencia...",
      selectLanguage: "Selecciona tu idioma / Choose your language:",
      getStarted: "Iniciar Viaje",
      continue: "Continuar",
      introTitle: "¿Estás [lista/listo/liste]?",
      introText: "Durante los próximos 30 días, recibirás un gancho diario y un audio práctico de 10 minutos. Este es un espacio seguro diseñado para recordar quién eres realmente.",
      todayTheme: "Tema de Hoy",
      progressTitle: "Tu Progreso",
      completedDays: "{completed} de {total} días completados",
      currentStreak: "Racha Actual",
      longestStreak: "Mejor Racha",
      streakDays: "{count} días",
      longestDays: "Récord: {count} días",
      yesterdayReminder: "✨ El viaje te ha estado esperando. Continúa exactamente desde donde lo dejaste — tu ritmo de crecimiento es único y libre de culpas.",
      viewIntro: "Reescutar Alineación del Capítulo",
      chapter: "Capítulo",
      chapterOf: "de",
      todayHookTitle: "Gancho de Hoy",
      hookInstructions: "Copia y usa este gancho en tus redes sociales para captar la atención.",
      todayAudioTitle: "Audio de Hoy",
      audioReady: "El audio práctico de hoy está disponible",
      audioDone: "¡Audio completado con éxito!",
      goMission: "Ir a la Misión Diaria",
      missionCompleted: "¡Misión Completada!",
      reviewMission: "Ver detalles de la misión",
      restDay: "Día de Descanso",
      restDesc: "Hoy es un día para respirar, integrar y descansar. No se requiere acción de exposición.",
      lockedTitle: "Día Bloqueado",
      lockedDesc: "Completa el día anterior para desbloquear este contenido.",
      waitingForTomorrow: "Este paso se libera mañana. Aprovecha hoy para descansar — ya cumpliste tu promesa.",
      copyHook: "Copiar Gancho",
      copied: "¡Copiado!"
    }
  }[lang];

  // Helper to check if yesterday is incomplete
  const yesterdayIncomplete = (() => {
    if (progress.currentDay <= 1) return false;
    const yesterday = progress.currentDay - 1;
    return !progress.completionHistory.includes(yesterday);
  })();

  const prefGrammar = resolveGrammarPreference(progress.grammarPreference);

  const rawContent = currentDay.content[lang] || currentDay.content['pt'] || {
    audioUrl: '',
    hook: '',
    scripts: ['', '', ''],
    exposureAction: '',
    reflectionQuestion: ''
  };

  const localizedContent = {
    audioUrl: rawContent.audioUrl,
    hook: adaptMessage(rawContent.hook, prefGrammar, lang),
    scripts: rawContent.scripts.map(s => adaptMessage(s, prefGrammar, lang)),
    exposureAction: adaptMessage(rawContent.exposureAction, prefGrammar, lang),
    reflectionQuestion: adaptMessage(rawContent.reflectionQuestion, prefGrammar, lang)
  };

  const isCompleted = progress.completionHistory.includes(currentDay.dayNumber);
  const isRestDay = currentDay.type === DayType.Rest;

  // A newly-unlocked day still waits for the real calendar to turn over —
  // finishing Day 1 today doesn't let you jump into Day 2 later the same day.
  const todayISO = new Date().toISOString().split('T')[0];
  const isWaitingForNewCalendarDay = currentDay.dayNumber === progress.currentDay
    && currentDay.dayNumber > 1
    && !isCompleted
    && progress.lastActiveDate === todayISO;
  const isLocked = currentDay.dayNumber > progress.currentDay || isWaitingForNewCalendarDay;

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (localizedContent.hook) {
      navigator.clipboard.writeText(localizedContent.hook);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Calculations
  const completedCount = progress.completionHistory.length;
  const totalJourneyDays = 30;
  const completionPercentage = Math.round((completedCount / totalJourneyDays) * 100);

  // Splash Screen & Onboarding Layout
  if (onboardState !== 'complete') {
    return (
      <div className="fixed inset-0 z-50 bg-[#FAF8F5] dark:bg-[#1E1715] text-slate-900 dark:text-[#FAF8F5] flex flex-col justify-center items-center p-8 sm:p-12 text-center select-none transition-colors duration-500 paper-ivory">
        {/* Ambient atmospheric backdrop light */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-rosegold/10 dark:bg-rosegold/5 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />
        
        <AnimatePresence mode="wait">
          
          {onboardState === 'splash' && (
            <motion.div
              key="splash"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-10 max-w-md flex flex-col items-center relative z-10"
            >
              <RenaSerLogo variant="vertical" size={96} lang={lang} />
              
              <button
                onClick={handleNextOnboard}
                className="mt-4 px-8 py-4 bg-rosegold hover:bg-[#A35D68] text-white rounded-2xl text-xs font-sans font-bold tracking-[0.15em] uppercase transition-all duration-300 shadow-rosegold hover:shadow-rosegold/40 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                {trans.getStarted}
              </button>
            </motion.div>
          )}

          {onboardState === 'lang' && (
            <motion.div
              key="lang"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-8 max-w-md w-full relative z-10 p-8 glass-premium rounded-[2.5rem] shadow-rosegold"
            >
              <div className="p-3 bg-rosegold/10 text-rosegold rounded-2xl w-12 h-12 mx-auto flex items-center justify-center border border-rosegold/15">
                <Settings className="h-5 w-5" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-display font-medium text-slate-900 dark:text-white tracking-tight">
                  {trans.languageTitle}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans tracking-wide">
                  {trans.selectLanguage}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 pt-2">
                {[
                  { code: 'pt', label: 'Português (Brasil)', flag: '🇧🇷' },
                  { code: 'en', label: 'English (US)', flag: '🇺🇸' },
                  { code: 'es', label: 'Español (ES)', flag: '🇪🇸' }
                ].map((item) => (
                  <button
                    key={item.code}
                    onClick={() => onLanguageChange(item.code as Language)}
                    className={`flex items-center justify-between p-4.5 rounded-2xl border text-sm font-semibold transition-all duration-300 cursor-pointer ${
                      lang === item.code
                        ? 'bg-rosegold border-rosegold text-white shadow-rosegold'
                        : 'bg-white/40 dark:bg-warmbrown-light/40 border-rose-100/30 dark:border-rosegold/10 text-slate-700 dark:text-slate-300 hover:bg-rose-50/50 dark:hover:bg-rosegold/5'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-xl">{item.flag}</span>
                      <span className="font-sans tracking-wide">{item.label}</span>
                    </span>
                    {lang === item.code && <Check className="h-4 w-4 text-white" />}
                  </button>
                ))}
              </div>

              <button
                onClick={handleNextOnboard}
                className="w-full mt-8 py-4 bg-rosegold hover:bg-[#A35D68] text-white rounded-2xl text-xs font-sans font-bold tracking-[0.15em] uppercase transition-all duration-300 shadow-rosegold flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>{trans.continue}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>
          )}

          {onboardState === 'name' && (
            <motion.div
              key="name"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-8 max-w-md w-full relative z-10 p-8 glass-premium rounded-[2.5rem] shadow-rosegold"
            >
              <div className="p-3 bg-rosegold/10 text-rosegold rounded-2xl w-12 h-12 mx-auto flex items-center justify-center border border-rosegold/15">
                <User className="h-5 w-5" />
              </div>

              <div className="space-y-2 text-center">
                <h2 className="text-2xl font-display font-medium text-slate-900 dark:text-white tracking-tight">
                  {trans.nameStepTitle}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans tracking-wide">
                  {trans.nameStepSubtitle}
                </p>
              </div>

              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleNextOnboard()}
                placeholder={trans.namePlaceholder}
                autoFocus
                className="w-full text-center bg-white/60 dark:bg-warmbrown-light/40 border border-rose-100/30 dark:border-rosegold/10 focus:border-rosegold focus:outline-none focus:ring-1 focus:ring-rosegold rounded-2xl p-4 text-sm font-sans text-slate-800 dark:text-slate-100 transition-all duration-300"
              />

              <button
                onClick={handleNextOnboard}
                className="w-full mt-2 py-4 bg-rosegold hover:bg-[#A35D68] text-white rounded-2xl text-xs font-sans font-bold tracking-[0.15em] uppercase transition-all duration-300 shadow-rosegold flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>{trans.continue}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>
          )}

          {onboardState === 'guidestyle' && (
            <motion.div
              key="guidestyle"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-8 max-w-lg w-full relative z-10 p-8 sm:p-10 glass-premium rounded-[2.5rem] shadow-rosegold"
            >
              <div className="p-3 bg-rosegold/10 text-rosegold rounded-2xl w-12 h-12 mx-auto flex items-center justify-center border border-rosegold/15">
                <Sparkles className="h-5 w-5" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-display font-medium text-slate-900 dark:text-white tracking-tight">
                  {lang === 'pt' ? 'Estilo de Orientação' : lang === 'es' ? 'Estilo de Orientación' : 'Guidance Style'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans tracking-wide">
                  {lang === 'pt' ? 'Como você gostaria que o RenaSer guiasse sua jornada?' : lang === 'es' ? '¿Cómo te gustaría que RenaSer guíe tu camino?' : 'How would you like RenaSer to guide your journey?'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-left">
                {[
                  { 
                    code: 'gentle', 
                    title: lang === 'pt' ? '🌿 Gentil' : '🌿 Gentle', 
                    desc: lang === 'pt' ? 'Calmo. Reflexivo. Encorajamento suave, pausas generosas.' : 'Calm. Reflective. Soft encouragement, generous pauses.' 
                  },
                  { 
                    code: 'challenger', 
                    title: lang === 'pt' ? '🔥 Desafiador' : '🔥 Challenger', 
                    desc: lang === 'pt' ? 'Direto. Focado em ação rápida e alta energia.' : 'Direct. Focused on rapid action and high energy.' 
                  },
                  { 
                    code: 'strategic', 
                    title: lang === 'pt' ? '💪 Estratégico' : '💪 Strategic', 
                    desc: lang === 'pt' ? 'Disciplinado. Objetivos claros e linguagem emocional mínima.' : 'Disciplined. Clear goals, minimal emotional language.' 
                  },
                  { 
                    code: 'inspirational', 
                    title: lang === 'pt' ? '✨ Inspirador' : '✨ Inspirational', 
                    desc: lang === 'pt' ? 'Espiritual. Foco em propósito e transformação interior profunda.' : 'Spiritual. Focus on purpose and deep inner transformation.' 
                  }
                ].map((item) => (
                  <button
                    key={item.code}
                    onClick={() => setSelectedStyle(item.code as any)}
                    className={`p-5 rounded-2xl border text-sm transition-all duration-300 text-left cursor-pointer flex flex-col gap-1.5 hover:scale-[1.02] active:scale-[0.98] h-full ${
                      selectedStyle === item.code
                        ? 'bg-rosegold border-rosegold text-white shadow-rosegold'
                        : 'bg-white/40 dark:bg-warmbrown-light/40 border-rose-100/30 dark:border-rosegold/10 text-slate-700 dark:text-slate-300 hover:bg-rose-50/50 dark:hover:bg-rosegold/5'
                    }`}
                  >
                    <span className="font-bold font-sans tracking-wide text-xs uppercase">{item.title}</span>
                    <span className={`text-[10px] leading-relaxed font-sans ${selectedStyle === item.code ? 'text-rose-100' : 'text-slate-500 dark:text-slate-400'}`}>
                      {item.desc}
                    </span>
                  </button>
                ))}
              </div>

              <button
                onClick={handleNextOnboard}
                className="w-full mt-6 py-4 bg-rosegold hover:bg-[#A35D68] text-white rounded-2xl text-xs font-sans font-bold tracking-[0.15em] uppercase transition-all duration-300 shadow-rosegold flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>{trans.continue}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>
          )}

          {onboardState === 'grammar' && (
            <motion.div
              key="grammar"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-8 max-w-md w-full relative z-10 p-8 glass-premium rounded-[2.5rem] shadow-rosegold"
            >
              <div className="p-3 bg-rosegold/10 text-rosegold rounded-2xl w-12 h-12 mx-auto flex items-center justify-center border border-rosegold/15">
                <Compass className="h-5 w-5" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-display font-medium text-slate-900 dark:text-white tracking-tight">
                  {lang === 'pt' ? 'Como devemos falar?' : lang === 'es' ? '¿Cómo debemos hablarte?' : 'Pronoun Preference'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans tracking-wide">
                  {lang === 'pt' ? 'Escolha sua preferência gramatical para as mensagens personalizadas.' : lang === 'es' ? 'Elige tu preferencia gramatical para los mensajes personalizados.' : 'Choose your grammar address preference for personalized prompts.'}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 pt-2">
                {[
                  { 
                    code: 'feminine', 
                    label: lang === 'pt' ? '🌸 Feminino (pronta, bem-vinda)' : lang === 'es' ? '🌸 Femenino (bienvenida, lista)' : '🌸 Feminine (ready, welcome)' 
                  },
                  {
                    code: 'masculine',
                    label: lang === 'pt' ? '☀️ Masculino (pronto, bem-vindo)' : lang === 'es' ? '☀️ Masculino (bienvenido, listo)' : '☀️ Masculine (ready, welcome)'
                  }
                ].map((item) => (
                  <button
                    key={item.code}
                    onClick={() => setSelectedGrammar(item.code as 'feminine' | 'masculine')}
                    className={`flex items-center justify-between p-4.5 rounded-2xl border text-sm font-semibold transition-all duration-300 cursor-pointer hover:scale-[1.01] ${
                      selectedGrammar === item.code
                        ? 'bg-rosegold border-rosegold text-white shadow-rosegold'
                        : 'bg-white/40 dark:bg-warmbrown-light/40 border-rose-100/30 dark:border-rosegold/10 text-slate-700 dark:text-slate-300 hover:bg-rose-50/50 dark:hover:bg-rosegold/5'
                    }`}
                  >
                    <span className="font-sans tracking-wide">{item.label}</span>
                    {selectedGrammar === item.code && <Check className="h-4 w-4 text-white" />}
                  </button>
                ))}
              </div>

              <button
                onClick={handleNextOnboard}
                className="w-full mt-6 py-4 bg-rosegold hover:bg-[#A35D68] text-white rounded-2xl text-xs font-sans font-bold tracking-[0.15em] uppercase transition-all duration-300 shadow-rosegold flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>{lang === 'pt' ? 'Confirmar Configurações' : lang === 'es' ? 'Confirmar Ajustes' : 'Confirm Preferences'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>
          )}

          {onboardState === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-8 max-w-md flex flex-col items-center relative z-10 p-8 glass-premium rounded-[2.5rem] shadow-rosegold"
            >
              <div className="w-16 h-16 bg-rosegold/10 border border-rosegold/15 text-rosegold rounded-[1.5rem] flex items-center justify-center">
                <Award className="h-7 w-7" />
              </div>
              <div className="space-y-3">
                <h1 className="text-3xl font-display font-light text-slate-900 dark:text-white leading-tight">
                  {adaptMessage(trans.onboardingWelcome, prefGrammar, lang)}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans leading-relaxed max-w-xs mx-auto">
                  {trans.onboardingSub}
                </p>
              </div>
              <button
                onClick={handleNextOnboard}
                className="px-8 py-4 bg-rosegold hover:bg-[#A35D68] text-white rounded-2xl text-xs font-sans font-bold tracking-[0.15em] uppercase transition-all duration-300 shadow-rosegold cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                {trans.continue}
              </button>
            </motion.div>
          )}

          {onboardState === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-8 max-w-md flex flex-col items-center relative z-10 p-8 glass-premium rounded-[2.5rem] shadow-rosegold"
            >
              <div className="w-16 h-16 bg-rosegold/10 border border-rosegold/15 text-rosegold rounded-[1.5rem] flex items-center justify-center">
                <BookOpen className="h-7 w-7" />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-display font-light text-slate-900 dark:text-white leading-tight">
                  {adaptMessage(trans.introTitle, prefGrammar, lang)}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans leading-relaxed max-w-sm mx-auto">
                  {trans.introText}
                </p>
              </div>
              <button
                onClick={handleNextOnboard}
                className="px-8 py-4 bg-rosegold hover:bg-[#A35D68] text-white rounded-2xl text-xs font-sans font-bold tracking-[0.15em] uppercase transition-all duration-300 shadow-rosegold cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                {lang === 'pt' ? 'Entrar no Dashboard' : lang === 'es' ? 'Entrar al Panel' : 'Enter Dashboard'}
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    );
  }

  // Loaded Sanctuary Screen View
  const hour = new Date().getHours();
  const lighting = (() => {
    if (hour >= 6 && hour < 12) {
      return {
        id: 'morning',
        bg: 'bg-radial from-[#FAF3E7] via-[#FAF8F5] to-[#FAF8F5] dark:from-[#2A1E1A] dark:via-[#1E1715] dark:to-[#1E1715]',
        glow1: 'bg-gradient-to-tr from-[#E6C594]/20 to-[#E8B4A0]/20',
        glow2: 'bg-gradient-to-br from-[#D4AF37]/10 to-transparent',
        greeting: {
          pt: 'Um amanhecer de esperança,',
          en: 'A hopeful morning,',
          es: 'Un amanecer de esperanza,'
        }[lang]
      };
    } else if (hour >= 12 && hour < 18) {
      return {
        id: 'afternoon',
        bg: 'bg-radial from-[#FAF8F5] via-[#FAF8F5] to-[#FAF8F5] dark:from-[#221C1A] dark:via-[#1E1715] dark:to-[#1E1715]',
        glow1: 'bg-gradient-to-tr from-rose-500/5 to-slate-500/5',
        glow2: 'bg-gradient-to-br from-[#E6C594]/5 to-transparent',
        greeting: {
          pt: 'Uma tarde serena,',
          en: 'A serene afternoon,',
          es: 'Una tarde serena,'
        }[lang]
      };
    } else {
      return {
        id: 'evening',
        bg: 'bg-radial from-[#FAF5F2] via-[#FAF8F5] to-[#FAF8F5] dark:from-[#251916] dark:via-[#1E1715] dark:to-[#1E1715]',
        glow1: 'bg-gradient-to-tr from-[#DE8E7B]/15 to-[#FAF5F2]/0',
        glow2: 'bg-gradient-to-br from-[#D4AF37]/15 to-transparent',
        greeting: {
          pt: 'Uma noite de paz,',
          en: 'A peaceful night,',
          es: 'Una noche de paz,'
        }[lang]
      };
    }
  })();

  const chapter = getChapterForDay(currentDay.dayNumber);
  const bConfig = getButterflyConfig(currentDay.dayNumber);

  return (
    <div className={`relative min-h-[82vh] flex flex-col justify-between p-8 sm:p-14 rounded-[2.5rem] overflow-hidden transition-all duration-1000 select-none ${lighting.bg} border border-rose-100/20 dark:border-rosegold/10 shadow-rosegold`}>
      {/* 1. Emotional Ambient Lighting Blurs - Warm and atmospheric */}
      <div className={`absolute top-10 left-10 h-[400px] w-[400px] blur-[100px] rounded-full animate-pulse pointer-events-none ${lighting.glow1}`} style={{ animationDuration: '9s' }} />
      <div className={`absolute bottom-10 right-10 h-[400px] w-[400px] blur-[100px] rounded-full animate-pulse pointer-events-none ${lighting.glow2}`} style={{ animationDuration: '11s' }} />

      {/* Floating butterflies if meaningful stage */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
        <motion.div
          animate={{
            x: ['-10vw', '110vw'],
            y: ['75vh', '8vh'],
            rotate: [15, -15, 15]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute"
          style={{ opacity: bConfig.opacity * 0.7 }}
        >
          <ButterflyIcon size={bConfig.size * 1.1} speedMultiplier={bConfig.speedMultiplier * 0.7} className={chapter.id === 4 ? 'text-accentgold/35' : 'text-rosegold/30'} />
        </motion.div>
      </div>

      {/* Top Section: Where am I? (Chapter & Stage Anchor) */}
      <motion.div 
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="text-center space-y-4 relative z-20"
      >
        <div className="space-y-1">
          <span className="text-xs font-serif italic text-rosegold dark:text-[#E8B4A0]">
            {lighting.greeting}
          </span>
          <h3 className="text-sm font-sans font-medium tracking-wide text-slate-800 dark:text-slate-200">
            {prefGrammar === 'feminine' 
              ? (lang === 'pt' ? 'Bem-vinda de volta' : lang === 'es' ? 'Bienvenida de vuelta' : 'Welcome back')
              : prefGrammar === 'masculine'
              ? (lang === 'pt' ? 'Bem-vindo de volta' : lang === 'es' ? 'Bienvenido de vuelta' : 'Welcome back')
              : (lang === 'pt' ? 'Bem-vinde de volta' : lang === 'es' ? 'Bienvenide de vuelta' : 'Welcome back')
            }, <span className="font-mono text-xs font-normal opacity-85 text-rosegold dark:text-[#E8B4A0]">
              {progress.displayName || (
                prefGrammar === 'masculine'
                  ? (lang === 'pt' ? 'querido' : lang === 'es' ? 'querido' : 'friend')
                  : (lang === 'pt' ? 'querida' : lang === 'es' ? 'querida' : 'friend')
              )}
            </span>
          </h3>
        </div>

        <div className="space-y-1 pt-1">
          <h2 className="text-sm font-sans tracking-[0.2em] font-semibold text-rosegold dark:text-rosegold-light uppercase">
            {trans.chapter} {chapter.id} • {adaptMessage(chapter.title[lang], prefGrammar, lang)}
          </h2>
          <p className="text-sm font-display italic text-slate-500/80 max-w-lg mx-auto leading-relaxed">
            "{chapter.theme[lang]}"
          </p>
        </div>
      </motion.div>

      {/* Central Section: The Sacred Tree of Identity */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="my-8 flex flex-col items-center justify-center relative z-20 w-full"
      >
        <div className="w-full max-w-[460px]">
          <TreeOfRebirth completedCount={completedCount} lang={lang} />
        </div>
      </motion.div>

      {/* Bottom Section: Today's Promise & The Single Next Action */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-2xl mx-auto w-full text-center space-y-8 relative z-20 pt-6 border-t border-rose-100/15 dark:border-rosegold/5"
      >
        {/* Today's Intention Quote */}
        <div className="space-y-3">
          <span className="text-[10px] uppercase tracking-[0.25em] font-sans font-bold text-accentgold dark:text-rosegold-light block">
            {lang === 'pt' ? 'Promessa de Hoje' : lang === 'es' ? 'La Promesa de Hoy' : "Today's Promise"}
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-light text-slate-900 dark:text-white leading-relaxed tracking-tight max-w-xl mx-auto">
            "{adaptMessage(currentDay.title[lang] || currentDay.title['pt'], prefGrammar, lang)}"
          </h1>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            {isRestDay ? (
              <span className="italic text-emerald-600 dark:text-emerald-400 font-sans tracking-wide">
                🌿 {trans.restDesc}
              </span>
            ) : (
              <span className="font-sans tracking-wide">
                {currentDay.theme?.[lang] || currentDay.theme?.['pt'] || getDayTypeLabel(currentDay.type, lang)}
              </span>
            )}
          </p>
        </div>

        {/* Primary Single CTA Button (ONE ACTION PRINCIPLE) */}
        <div className="flex flex-col items-center justify-center gap-4">
          <motion.button
            whileHover={isLocked ? undefined : { scale: 1.03, y: -1 }}
            whileTap={isLocked ? undefined : { scale: 0.97 }}
            onClick={() => !isLocked && onSelectTab('mission')}
            disabled={isLocked}
            className={`px-12 py-4.5 rounded-2xl text-xs font-sans font-bold uppercase tracking-[0.2em] shadow-lg transition-all duration-300 ${
              isLocked
                ? 'bg-slate-100 dark:bg-warmbrown text-slate-400 dark:text-slate-500 border border-rose-100/10 dark:border-rosegold/5 cursor-not-allowed shadow-none'
                : isCompleted
                ? 'bg-rose-50/60 dark:bg-rosegold/10 text-rosegold dark:text-rosegold-light hover:bg-rose-100/80 shadow-sm border border-rose-100/30 dark:border-rosegold/10 cursor-pointer'
                : 'bg-rosegold hover:bg-[#A35D68] text-white shadow-rosegold hover:shadow-rosegold/40 cursor-pointer'
            }`}
          >
            {isLocked ? trans.lockedTitle : isCompleted ? trans.reviewMission : trans.goMission}
          </motion.button>

          {/* Quick, reassuring, pressure-free micro-copy */}
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-sans tracking-wide leading-relaxed max-w-xs sm:max-w-md">
            {isLocked
              ? trans.waitingForTomorrow
              : yesterdayIncomplete
              ? (lang === 'pt' ? 'Sua vaga ficou guardada. Retome com tranquilidade.' : lang === 'es' ? 'Tu lugar te estaba esperando. Retoma con tranquilidad.' : 'We kept your place ready. Resume at your own pace.')
              : (lang === 'pt' ? 'Um passo simples por dia, sem cobranças ou julgamento.' : lang === 'es' ? 'Un paso simple por día, sin culpas ni juicios.' : 'One simple daily step, free of judgment or guilt.')
            }
          </span>
        </div>
      </motion.div>
    </div>
  );
}
