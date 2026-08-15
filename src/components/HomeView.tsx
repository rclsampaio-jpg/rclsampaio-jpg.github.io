/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles, Flame, CheckCircle2, ArrowRight, BookOpen, Volume2,
  Settings, Award, Lock, HelpCircle, Check, Play, Compass, User, Heart,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { MissionDay, Language, UserProgress } from '../types';
import { getDayTypeLabel } from '../data/templateData';
import { getLocalDateISO } from '../utils/date';
import { adaptMessage, resolveGrammarPreference, ToneVariants } from '../utils/grammar';
import EditableText from './editable/EditableText';
import EditableImage from './editable/EditableImage';

// Onboarding/return-visit copy that varies by guideStyle. "inspirational"
// preserves the original wording this content shipped with.
const HOME_TONE: Record<Language, {
  onboardingWelcome: ToneVariants;
  onboardingSub: ToneVariants;
  introTitle: ToneVariants;
  introText: ToneVariants;
  yesterdayReminder: ToneVariants;
}> = {
  pt: {
    onboardingWelcome: {
      gentle: 'Seja [bem-vinda/bem-vindo/bem-vinde], com carinho, ao RenaSer',
      challenger: 'Chegou a hora. Seja [bem-vinda/bem-vindo/bem-vinde] ao RenaSer',
      strategic: 'Seja [bem-vinda/bem-vindo/bem-vinde] ao RenaSer, seu novo método começa agora',
      inspirational: 'Seja [Bem-vinda/Bem-vindo/Bem-vinde] ao RenaSer'
    },
    onboardingSub: {
      gentle: 'Uma experiência gentil de visibilidade, no seu tempo',
      challenger: 'Chega de se esconder. Aqui é onde você aparece',
      strategic: 'Um método estruturado de 30 dias pra construir visibilidade consistente',
      inspirational: 'Uma experiência de visibilidade e coragem'
    },
    introTitle: {
      gentle: 'Você está [pronta/pronto/pronte]? 😃',
      challenger: 'Você está [pronta/pronto/pronte]? 😃',
      strategic: 'Você está [pronta/pronto/pronte]? 😃',
      inspirational: 'Você está [pronta/pronto/pronte]? 😃'
    },
    introText: {
      gentle: 'Este é um espaço seguro para você confiar que a vida está a favor de quem você está se tornando, e lembrar de quem você é.',
      challenger: 'Este é um espaço seguro para você confiar que a vida está a favor de quem você está se tornando, e lembrar de quem você é.',
      strategic: 'Este é um espaço seguro para você confiar que a vida está a favor de quem você está se tornando, e lembrar de quem você é.',
      inspirational: 'Este é um espaço seguro para você confiar que a vida está a favor de quem você está se tornando, e lembrar de quem você é.'
    },
    yesterdayReminder: {
      gentle: '✨ Sem pressa nenhuma. Volte exatamente de onde parou, no seu tempo, não existe atraso aqui, só o seu próprio ritmo. Soltar o controle também faz parte.',
      challenger: '✨ A jornada não parou por sua causa. Volte agora e retome de onde parou, sem desculpa pra adiar mais um dia, e sem se culpar pela pausa.',
      strategic: '✨ Checkpoint: retome exatamente de onde parou. Consistência acumulada importa mais que qualquer pausa isolada, inclusive as que não saíram do plano.',
      inspirational: '✨ A jornada estava à sua espera. Continue exatamente de onde parou, seu ritmo de crescimento é único, livre de julgamentos, e a vida continua a favor de você.'
    }
  },
  en: {
    onboardingWelcome: {
      gentle: 'Welcome, gently, to RenaSer',
      challenger: "It's time. Welcome to RenaSer",
      strategic: 'Welcome to RenaSer, your new method starts now',
      inspirational: 'Welcome to RenaSer'
    },
    onboardingSub: {
      gentle: 'A gentle experience of visibility, at your own pace',
      challenger: 'Enough hiding. This is where you show up',
      strategic: 'A structured 30-day method to build consistent visibility',
      inspirational: 'An experience of visibility and courage'
    },
    introTitle: {
      gentle: 'Shall we start slowly?',
      challenger: 'Ready to actually get started?',
      strategic: 'Ready to follow the plan?',
      inspirational: 'Are you ready?'
    },
    introText: {
      gentle: "For the next 30 days, at your own pace, you'll receive a daily hook and an audio up to 10 minutes. It doesn't need to come out perfect, and you don't need to control every detail, let a little go and trust the process. This space exists for you to gently remember who you truly are.",
      challenger: "For the next 30 days, no excuses: a daily hook, an audio up to 10 minutes, and the decision to show up every single day, even scared. Facing the discomfort head-on is the way through, there's no shortcut around it. That's the deal.",
      strategic: "For the next 30 days, you'll receive a daily hook and a practical audio up to 10 minutes, a simple, repeatable system designed to generate measurable consistency, even when things don't go exactly as planned.",
      inspirational: 'For the next 30 days, you will receive a daily hook and a practical audio up to 10 minutes long. This is a safe environment for you to trust that life is on the side of who you are becoming, and to remember who you truly are.'
    },
    yesterdayReminder: {
      gentle: "✨ No rush at all. Come back exactly where you left off, at your own pace, there's no such thing as being late here, just your own rhythm. Letting go of control is part of it too.",
      challenger: "✨ The journey didn't stop because of you. Come back now and pick up where you left off, no excuse to delay another day, and no blaming yourself for the pause.",
      strategic: '✨ Checkpoint: resume exactly where you left off. Accumulated consistency matters more than any single pause, including the ones that went off plan.',
      inspirational: '✨ The journey has been waiting for you. Continue exactly from where you stopped, your pace of growth is unique, free from guilt, and life is still on your side.'
    }
  },
  es: {
    onboardingWelcome: {
      gentle: '[Bienvenida/Bienvenido/Bienvenide], con cariño, a RenaSer',
      challenger: 'Llegó la hora. [Bienvenida/Bienvenido/Bienvenide] a RenaSer',
      strategic: '[Bienvenida/Bienvenido/Bienvenide] a RenaSer, tu nuevo método empieza ahora',
      inspirational: '[Bienvenida/Bienvenido/Bienvenide] a RenaSer'
    },
    onboardingSub: {
      gentle: 'Una experiencia suave de visibilidad, a tu ritmo',
      challenger: 'Basta de esconderte. Aquí es donde apareces',
      strategic: 'Un método estructurado de 30 días para construir visibilidad consistente',
      inspirational: 'Una experiencia de visibilidad y coraje'
    },
    introTitle: {
      gentle: '¿Empezamos despacio?',
      challenger: '¿[Lista/Listo/Liste] para empezar de verdad?',
      strategic: '¿[Lista/Listo/Liste] para seguir el plan?',
      inspirational: '¿Estás [lista/listo/liste]?'
    },
    introText: {
      gentle: 'Durante los próximos 30 días, a tu ritmo, recibirás un gancho diario y un audio de hasta 10 minutos. No necesita salir perfecto ni controlar cada detalle, suelta un poco y confía en el proceso. Este espacio existe para que recuerdes, con calma, quién eres realmente.',
      challenger: 'Durante los próximos 30 días, sin excusas: un gancho diario, un audio de hasta 10 minutos, y la decisión de aparecer todos los días, incluso con miedo. Enfrentar la incomodidad de frente es el camino, no hay atajo por fuera de ella. Ese es el trato.',
      strategic: 'Durante los próximos 30 días, recibirás un gancho diario y un audio práctico de hasta 10 minutos, un sistema simple y repetible, diseñado para generar consistencia medible incluso cuando no todo sale según el plan.',
      inspirational: 'Durante los próximos 30 días, recibirás un gancho diario y un audio práctico de hasta 10 minutos. Este es un espacio seguro para confiar en que la vida está a favor de quien te estás convirtiendo, y recordar quién eres realmente.'
    },
    yesterdayReminder: {
      gentle: '✨ Sin ninguna prisa. Vuelve exactamente donde lo dejaste, a tu ritmo, aquí no existe el atraso, solo tu propio ritmo. Soltar el control también es parte de esto.',
      challenger: '✨ El viaje no se detuvo por tu culpa. Vuelve ahora y retoma donde lo dejaste, sin excusa para posponer otro día, y sin culparte por la pausa.',
      strategic: '✨ Checkpoint: retoma exactamente donde lo dejaste. La consistencia acumulada importa más que cualquier pausa aislada, incluso las que se salieron del plan.',
      inspirational: '✨ El viaje te ha estado esperando. Continúa exactamente desde donde lo dejaste, tu ritmo de crecimiento es único, libre de culpas, y la vida sigue a tu favor.'
    }
  }
};

// Chapter and Butterfly Imports
import { getChapterForDay, getButterflyConfig } from '../data/chaptersData';
import ButterflyIcon from './ButterflyIcon';
import TreeOfRebirth from './TreeOfRebirth';
import RenaSerLogo from './RenaSerLogo';

interface HomeViewProps {
  currentDay: MissionDay;
  progress: UserProgress;
  lang: Language;
  onSelectTab: (tabId: 'home' | 'journey' | 'hooks' | 'settings' | 'cms' | 'mission') => void;
  onLanguageChange: (lang: Language) => void;
  onShowIntro?: (chapterId: number) => void;
  onUpdateProgress?: (updated: UserProgress) => void;
  onTriggerSos?: () => void;
  isAdminUnlocked?: boolean;
  onJumpToDay?: (dayNumber: number) => void;
  onOnboardingComplete?: () => void;
  onIntroButterflyStart?: () => void;
}

export default function HomeView({
  currentDay,
  progress,
  lang,
  onSelectTab,
  onLanguageChange,
  onShowIntro,
  onUpdateProgress,
  onTriggerSos,
  isAdminUnlocked,
  onJumpToDay,
  onOnboardingComplete,
  onIntroButterflyStart
}: HomeViewProps) {
  // Admin-only: preview any of the 10 Árvore do Renascimento stages without
  // touching real progress data (completionHistory drives streaks too).
  // null = show the real progress as usual.
  const [treeStagePreview, setTreeStagePreview] = useState<number | null>(null);
  // Computed lazily (not via useEffect) so the very first render already
  // knows whether onboarding is needed, otherwise this defaulted to
  // 'complete' for one frame, briefly flashing the normal Home screen
  // (header + bottom nav) underneath before switching to the onboarding
  // overlay on the next render.
  type OnboardState = 'splash' | 'lang' | 'name' | 'guidestyle' | 'grammar' | 'welcome' | 'intro' | 'complete';
  const [onboardState, setOnboardState] = useState<OnboardState>(() => {
    const isCompleted = localStorage.getItem('renaser_onboarded') === 'true';
    return isCompleted ? 'complete' : 'splash';
  });
  // Histórico de navegação do onboarding, pra permitir "Voltar".
  const [onboardHistory, setOnboardHistory] = useState<OnboardState[]>([]);
  // Borboleta de abertura: dispara uma única vez, quando a splash aparece
  // pela primeira vez, mas quem realmente renderiza ela é o App.tsx (ver
  // onIntroButterflyStart), não este componente — HomeView é desmontado
  // assim que o onboarding termina e a tela troca pra Missão Diária, o que
  // cortava o voo no meio quando a borboleta vivia só aqui dentro.
  const hasStartedIntroButterfly = useRef(false);
  useEffect(() => {
    if (onboardState === 'splash' && !hasStartedIntroButterfly.current) {
      hasStartedIntroButterfly.current = true;
      onIntroButterflyStart?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onboardState]);
  const goToOnboardState = (next: OnboardState) => {
    setOnboardHistory((h) => [...h, onboardState]);
    setOnboardState(next);
  };
  const handleBackOnboard = () => {
    setOnboardHistory((h) => {
      if (h.length === 0) return h;
      setOnboardState(h[h.length - 1]);
      return h.slice(0, -1);
    });
  };
  const [selectedStyle, setSelectedStyle] = useState<'gentle' | 'challenger' | 'strategic' | 'inspirational'>('gentle');
  const [selectedGrammar, setSelectedGrammar] = useState<'feminine' | 'masculine'>('feminine');
  const [nameInput, setNameInput] = useState('');

  const handleNextOnboard = () => {
    if (onboardState === 'splash') goToOnboardState('lang');
    else if (onboardState === 'lang') goToOnboardState('name');
    else if (onboardState === 'name') {
      if (onUpdateProgress) {
        onUpdateProgress({ ...progress, displayName: nameInput.trim() || null });
      }
      goToOnboardState('guidestyle');
    }
    else if (onboardState === 'guidestyle') goToOnboardState('grammar');
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
      goToOnboardState('welcome');
    }
    else if (onboardState === 'welcome') goToOnboardState('intro');
    else if (onboardState === 'intro') {
      localStorage.setItem('renaser_onboarded', 'true');
      setOnboardState('complete');
      // Avisa o App imediatamente, senão ele só saberia que o onboarding
      // terminou no próximo re-render por outro motivo, e essa mesma tela
      // (hero + "Ir pra Missão Diária") continuaria aparecendo por engano.
      onOnboardingComplete?.();
    }
  };

  // Translations
  const trans = {
    pt: {
      languageTitle: "Configurações de Idioma",
      nameStepTitle: "Como devemos te chamar?",
      nameStepSubtitle: "Escolha o nome de preferência. É assim que vamos te chamar por aqui.",
      namePlaceholder: "Seu nome de preferência...",
      selectLanguage: "Escolha seu idioma / Choose your language:",
      getStarted: "Começar Jornada",
      continue: "Continuar",
      todayTheme: "Tema do Dia",
      progressTitle: "Sua Evolução",
      completedDays: "{completed} de {total} dias concluídos",
      currentStreak: "Racha Atual",
      longestStreak: "Melhor Racha",
      streakDays: "{count} dias",
      longestDays: "Recorde: {count} dias",
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
      restDesc: "Hoje vai CURTIR! É dia de descanso 🎉 E não esquece de se divertir no processo! Nenhuma ação é requerida hoje. Pra acompanhar seu progresso, visite a aba Meu Ser.",
      lockedTitle: "Dia Bloqueado",
      lockedDesc: "Complete o dia anterior para liberar este conteúdo.",
      waitingForTomorrow: "Este passo libera amanhã. Aproveite hoje pra descansar, você já cumpriu sua promessa.",
      copyHook: "Copiar Gancho",
      copied: "Copiado!",
      sosHeading: "Precisando de apoio agora? O SOS Emocional está sempre disponível, mesmo com o dia bloqueado.",
      sosTrigger: "Acione o SOS Emocional"
    },
    en: {
      languageTitle: "Language Settings",
      nameStepTitle: "What should we call you?",
      nameStepSubtitle: "Choose your preferred name. That's how we'll address you around here.",
      namePlaceholder: "Your preferred name...",
      selectLanguage: "Choose your language / Escolha seu idioma:",
      getStarted: "Start Journey",
      continue: "Continue",
      todayTheme: "Today's Theme",
      progressTitle: "Your Progress",
      completedDays: "{completed} of {total} days completed",
      currentStreak: "Current Streak",
      longestStreak: "Best Streak",
      streakDays: "{count} days",
      longestDays: "Record: {count} days",
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
      restDesc: "Today you get to ENJOY! It's rest day 🎉 And don't forget to have fun along the way! No action required today. To check your progress, visit the My Portal tab.",
      lockedTitle: "Day Locked",
      lockedDesc: "Complete the previous day to unlock this content.",
      waitingForTomorrow: "This step unlocks tomorrow. Take today to rest, you already kept your promise.",
      copyHook: "Copy Hook",
      copied: "Copied!",
      sosHeading: "Need support right now? The Emotional SOS is always available, even with the day locked.",
      sosTrigger: "Activate Emotional SOS"
    },
    es: {
      languageTitle: "Configuración de Idioma",
      nameStepTitle: "¿Cómo debemos llamarte?",
      nameStepSubtitle: "Elige tu nombre de preferencia. Así te llamaremos por aquí.",
      namePlaceholder: "Tu nombre de preferencia...",
      selectLanguage: "Selecciona tu idioma / Choose your language:",
      getStarted: "Iniciar Viaje",
      continue: "Continuar",
      todayTheme: "Tema de Hoy",
      progressTitle: "Tu Progreso",
      completedDays: "{completed} de {total} días completados",
      currentStreak: "Racha Actual",
      longestStreak: "Mejor Racha",
      streakDays: "{count} días",
      longestDays: "Récord: {count} días",
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
      restDesc: "¡Hoy toca DISFRUTAR! Es día de descanso 🎉 ¡Y no te olvides de divertirte en el proceso! Hoy no se requiere ninguna acción. Para ver tu progreso, visita la pestaña Mi Portal.",
      lockedTitle: "Día Bloqueado",
      lockedDesc: "Completa el día anterior para desbloquear este contenido.",
      waitingForTomorrow: "Este paso se libera mañana. Aprovecha hoy para descansar, ya cumpliste tu promesa.",
      copyHook: "Copiar Gancho",
      copied: "¡Copiado!",
      sosHeading: "¿Necesitas apoyo ahora? El SOS Emocional siempre está disponible, incluso con el día bloqueado.",
      sosTrigger: "Activar SOS Emocional"
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
  // Quarta-feira deixou de ser um dia de descanso passivo desde a redesenha
  // semanal (ver getDailyPlan em templateData.ts, todo dia tem plano de
  // exposição real agora). DailyMissionView.tsx já trata isso (isRestDay
  // sempre false lá), mas esse arquivo tinha ficado pra trás ainda checando
  // o DayType.Rest de verdade, por isso a mensagem "dia de descanso"
  // continuava aparecendo no Início.
  const isRestDay = false;

  // A newly-unlocked day waits for the real next calendar day, except a
  // completion late at night (before LATE_NIGHT_UNLOCK_CUTOFF_HOUR) is
  // backdated to "yesterday" via dayUnlockAnchorDate, so finishing right
  // after midnight opens the next day immediately instead of trapping the
  // person into waiting for a second midnight.
  const isWaitingForNewCalendarDay = currentDay.dayNumber === progress.currentDay
    && currentDay.dayNumber > 1
    && !isCompleted
    && progress.dayUnlockAnchorDate === getLocalDateISO();
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

  // Admin day-jumper (arrows above): the tree should grow along with the
  // previewed day automatically, not stay frozen at the real progress count.
  // Manual milestone buttons below still take priority when explicitly set.
  const adminDayPreviewCount = isAdminUnlocked && currentDay.dayNumber !== progress.currentDay
    ? currentDay.dayNumber - 1
    : null;
  const treeDisplayCount = treeStagePreview ?? adminDayPreviewCount ?? completedCount;

  // Splash Screen & Onboarding Layout
  if (onboardState !== 'complete') {
    // Rendered via a portal straight to <body>, this component is mounted
    // inside App.tsx's tab-content `motion.div` (which animates `y`), and a
    // `transform` on any ancestor turns `position: fixed` into "fixed
    // relative to that ancestor" instead of the real viewport. That broke
    // this overlay so it only covered the <main> content area, leaving the
    // header and bottom nav visibly showing around it. A portal escapes
    // that ancestor entirely, so `fixed inset-0` covers the true viewport.
    return createPortal(
      <div className="fixed inset-0 z-50 bg-[#FAF8F5] dark:bg-ink text-slate-900 dark:text-ink-text flex flex-col justify-center items-center p-8 sm:p-12 text-center select-none transition-colors duration-500 paper-ivory overflow-y-auto">
        {/* Voltar — some steps (Destrave sim/não, etc) davam decisão sem
            volta, sem nenhum jeito de corrigir um clique errado. */}
        {onboardHistory.length > 0 && (
          <button
            onClick={handleBackOnboard}
            className="fixed top-6 left-6 z-[60] flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/70 dark:bg-ink-raised/70 border border-rose-100/40 dark:border-ink-hairline text-slate-500 dark:text-ink-muted text-xs font-sans font-semibold cursor-pointer hover:bg-white dark:hover:bg-ink-raised transition"
          >
            ← Voltar
          </button>
        )}

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

              {/* Delayed so the butterfly actually gets seen crossing the
                  screen before the button steals attention and gets tapped
                  right away. */}
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 2, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNextOnboard}
                className="mt-4 px-8 py-4 bg-rosegold hover:bg-[#A35D68] text-white dark:bg-transparent dark:border dark:border-rosegold-light dark:text-rosegold-light dark:hover:bg-rosegold-light/10 rounded-2xl text-xs font-sans font-bold tracking-[0.15em] uppercase transition-[background-color,box-shadow] duration-300 shadow-rosegold hover:shadow-rosegold/40 cursor-pointer"
              >
                <EditableText contentKey="home.onboarding.getStarted" fallback={trans.getStarted} as="span" />
              </motion.button>
            </motion.div>
          )}

          {onboardState === 'lang' && (
            <motion.div
              key="lang"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-8 max-w-md w-full relative z-10 p-8 glass-premium dark:bg-ink-raised! dark:backdrop-blur-none! dark:border! dark:border-ink-hairline! rounded-[2.5rem] shadow-rosegold dark:shadow-none!"
            >
              <div className="p-3 bg-rosegold/10 text-rosegold rounded-2xl w-12 h-12 mx-auto flex items-center justify-center border border-rosegold/15">
                <Settings className="h-5 w-5" />
              </div>
              
              <div className="space-y-2">
                <EditableText
                  contentKey="home.onboarding.languageTitle"
                  fallback={trans.languageTitle}
                  as="h2"
                  className="text-2xl font-display font-medium text-slate-900 dark:text-white tracking-tight"
                />
                <EditableText
                  contentKey="home.onboarding.selectLanguage"
                  fallback={trans.selectLanguage}
                  as="p"
                  className="text-xs text-slate-500 dark:text-ink-muted font-sans tracking-wide"
                />
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
                        ? 'bg-rosegold border-rosegold text-white shadow-rosegold dark:bg-transparent dark:border-rosegold-light dark:text-rosegold-light dark:shadow-none'
                        : 'bg-white/40 dark:bg-transparent border-rose-100/30 dark:border-ink-hairline text-slate-700 dark:text-ink-muted hover:bg-rose-50/50 dark:hover:bg-rosegold-light/5'
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
                className="w-full mt-8 py-4 bg-rosegold hover:bg-[#A35D68] text-white dark:bg-transparent dark:border dark:border-rosegold-light dark:text-rosegold-light dark:hover:bg-rosegold-light/10 rounded-2xl text-xs font-sans font-bold tracking-[0.15em] uppercase transition-all duration-300 shadow-rosegold flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <EditableText contentKey="home.onboarding.continue" fallback={trans.continue} as="span" />
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
              className="space-y-8 max-w-md w-full relative z-10 p-8 glass-premium dark:bg-ink-raised! dark:backdrop-blur-none! dark:border! dark:border-ink-hairline! rounded-[2.5rem] shadow-rosegold dark:shadow-none!"
            >
              <div className="p-3 bg-rosegold/10 text-rosegold rounded-2xl w-12 h-12 mx-auto flex items-center justify-center border border-rosegold/15">
                <User className="h-5 w-5" />
              </div>

              <div className="space-y-2 text-center">
                <EditableText
                  contentKey="home.onboarding.nameStepTitle"
                  fallback={trans.nameStepTitle}
                  as="h2"
                  className="text-2xl font-display font-medium text-slate-900 dark:text-white tracking-tight"
                />
                <EditableText
                  contentKey="home.onboarding.nameStepSubtitle"
                  fallback={trans.nameStepSubtitle}
                  as="p"
                  className="text-xs text-slate-500 dark:text-ink-muted font-sans tracking-wide"
                />
              </div>

              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleNextOnboard()}
                placeholder={trans.namePlaceholder}
                autoFocus
                className="w-full text-center bg-white/60 dark:bg-transparent border border-rose-100/30 dark:border-0 dark:border-b dark:rounded-none dark:border-ink-hairline focus:border-rosegold dark:focus:border-rosegold-light focus:outline-none focus:ring-1 dark:focus:ring-0 focus:ring-rosegold rounded-2xl p-4 text-sm font-sans text-slate-800 dark:text-ink-text transition-all duration-300"
              />

              <button
                onClick={handleNextOnboard}
                className="w-full mt-2 py-4 bg-rosegold hover:bg-[#A35D68] text-white dark:bg-transparent dark:border dark:border-rosegold-light dark:text-rosegold-light dark:hover:bg-rosegold-light/10 rounded-2xl text-xs font-sans font-bold tracking-[0.15em] uppercase transition-all duration-300 shadow-rosegold flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <EditableText contentKey="home.onboarding.continue" fallback={trans.continue} as="span" />
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
              className="space-y-8 max-w-lg w-full relative z-10 p-8 sm:p-10 glass-premium dark:bg-ink-raised! dark:backdrop-blur-none! dark:border! dark:border-ink-hairline! rounded-[2.5rem] shadow-rosegold dark:shadow-none!"
            >
              <div className="p-3 bg-rosegold/10 text-rosegold rounded-2xl w-12 h-12 mx-auto flex items-center justify-center border border-rosegold/15">
                <Sparkles className="h-5 w-5" />
              </div>
              
              <div className="space-y-2">
                <EditableText
                  contentKey="home.onboarding.guideStyleTitle"
                  fallback={lang === 'pt' ? 'Estilo de Orientação' : lang === 'es' ? 'Estilo de Orientación' : 'Guidance Style'}
                  as="h2"
                  className="text-2xl font-display font-medium text-slate-900 dark:text-white tracking-tight"
                />
                <EditableText
                  contentKey="home.onboarding.guideStyleSubtitle"
                  fallback={lang === 'pt' ? 'Como você gostaria que o RenaSer guiasse sua jornada?' : lang === 'es' ? '¿Cómo te gustaría que RenaSer guíe tu camino?' : 'How would you like RenaSer to guide your journey?'}
                  as="p"
                  className="text-xs text-slate-500 dark:text-ink-muted font-sans tracking-wide"
                />
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
                        ? 'bg-rosegold border-rosegold text-white shadow-rosegold dark:bg-transparent dark:border-rosegold-light dark:text-rosegold-light dark:shadow-none'
                        : 'bg-white/40 dark:bg-transparent border-rose-100/30 dark:border-ink-hairline text-slate-700 dark:text-ink-muted hover:bg-rose-50/50 dark:hover:bg-rosegold-light/5'
                    }`}
                  >
                    <EditableText
                      contentKey={`home.onboarding.guideStyle.${item.code}.title`}
                      fallback={item.title}
                      as="span"
                      className="font-bold font-sans tracking-wide text-xs uppercase"
                    />
                    <EditableText
                      contentKey={`home.onboarding.guideStyle.${item.code}.desc`}
                      fallback={item.desc}
                      as="span"
                      className={`text-[10px] leading-relaxed font-sans ${selectedStyle === item.code ? 'text-rose-100' : 'text-slate-500 dark:text-ink-muted'}`}
                    />
                  </button>
                ))}
              </div>

              <button
                onClick={handleNextOnboard}
                className="w-full mt-6 py-4 bg-rosegold hover:bg-[#A35D68] text-white dark:bg-transparent dark:border dark:border-rosegold-light dark:text-rosegold-light dark:hover:bg-rosegold-light/10 rounded-2xl text-xs font-sans font-bold tracking-[0.15em] uppercase transition-all duration-300 shadow-rosegold flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <EditableText contentKey="home.onboarding.continue" fallback={trans.continue} as="span" />
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
              className="space-y-8 max-w-md w-full relative z-10 p-8 glass-premium dark:bg-ink-raised! dark:backdrop-blur-none! dark:border! dark:border-ink-hairline! rounded-[2.5rem] shadow-rosegold dark:shadow-none!"
            >
              <div className="p-3 bg-rosegold/10 text-rosegold rounded-2xl w-12 h-12 mx-auto flex items-center justify-center border border-rosegold/15">
                <Compass className="h-5 w-5" />
              </div>
              
              <div className="space-y-2">
                <EditableText
                  contentKey="home.onboarding.grammarTitle"
                  fallback={lang === 'pt' ? 'Como devemos falar?' : lang === 'es' ? '¿Cómo debemos hablarte?' : 'Pronoun Preference'}
                  as="h2"
                  className="text-2xl font-display font-medium text-slate-900 dark:text-white tracking-tight"
                />
                <EditableText
                  contentKey="home.onboarding.grammarSubtitle"
                  fallback={lang === 'pt' ? 'Escolha sua preferência gramatical para as mensagens personalizadas.' : lang === 'es' ? 'Elige tu preferencia gramatical para los mensajes personalizados.' : 'Choose your grammar address preference for personalized prompts.'}
                  as="p"
                  className="text-xs text-slate-500 dark:text-ink-muted font-sans tracking-wide"
                />
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
                        ? 'bg-rosegold border-rosegold text-white shadow-rosegold dark:bg-transparent dark:border-rosegold-light dark:text-rosegold-light dark:shadow-none'
                        : 'bg-white/40 dark:bg-transparent border-rose-100/30 dark:border-ink-hairline text-slate-700 dark:text-ink-muted hover:bg-rose-50/50 dark:hover:bg-rosegold-light/5'
                    }`}
                  >
                    <span className="font-sans tracking-wide">{item.label}</span>
                    {selectedGrammar === item.code && <Check className="h-4 w-4 text-white" />}
                  </button>
                ))}
              </div>

              <button
                onClick={handleNextOnboard}
                className="w-full mt-6 py-4 bg-rosegold hover:bg-[#A35D68] text-white dark:bg-transparent dark:border dark:border-rosegold-light dark:text-rosegold-light dark:hover:bg-rosegold-light/10 rounded-2xl text-xs font-sans font-bold tracking-[0.15em] uppercase transition-all duration-300 shadow-rosegold flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <EditableText
                  contentKey="home.onboarding.confirmPreferences"
                  fallback={lang === 'pt' ? 'Confirmar Configurações' : lang === 'es' ? 'Confirmar Ajustes' : 'Confirm Preferences'}
                  as="span"
                />
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
              className="space-y-8 max-w-md flex flex-col items-center relative z-10 p-8 glass-premium dark:bg-ink-raised! dark:backdrop-blur-none! dark:border! dark:border-ink-hairline! rounded-[2.5rem] shadow-rosegold dark:shadow-none!"
            >
              <div className="w-16 h-16 bg-rosegold/10 border border-rosegold/15 text-rosegold rounded-[1.5rem] flex items-center justify-center">
                <Award className="h-7 w-7" />
              </div>
              <div className="space-y-3">
                <EditableText
                  contentKey="home.onboarding.welcomeTitle"
                  fallback={adaptMessage(HOME_TONE[lang].onboardingWelcome[selectedStyle], selectedGrammar, lang)}
                  as="h1"
                  className="text-3xl font-display font-light text-slate-900 dark:text-white leading-tight"
                />
                <EditableText
                  contentKey="home.onboarding.welcomeSub"
                  fallback={HOME_TONE[lang].onboardingSub[selectedStyle]}
                  as="p"
                  className="text-xs text-slate-500 dark:text-ink-muted font-sans leading-relaxed max-w-xs mx-auto"
                />
              </div>
              <button
                onClick={handleNextOnboard}
                className="px-8 py-4 bg-rosegold hover:bg-[#A35D68] text-white dark:bg-transparent dark:border dark:border-rosegold-light dark:text-rosegold-light dark:hover:bg-rosegold-light/10 rounded-2xl text-xs font-sans font-bold tracking-[0.15em] uppercase transition-all duration-300 shadow-rosegold cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <EditableText contentKey="home.onboarding.continue" fallback={trans.continue} as="span" />
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
              className="space-y-8 max-w-md flex flex-col items-center relative z-10 p-8 glass-premium dark:bg-ink-raised! dark:backdrop-blur-none! dark:border! dark:border-ink-hairline! rounded-[2.5rem] shadow-rosegold dark:shadow-none!"
            >
              <div className="w-16 h-16 bg-rosegold/10 border border-rosegold/15 text-rosegold rounded-[1.5rem] flex items-center justify-center">
                <BookOpen className="h-7 w-7" />
              </div>
              <div className="space-y-3">
                <EditableText
                  contentKey="home.onboarding.introTitle"
                  fallback={adaptMessage(HOME_TONE[lang].introTitle[selectedStyle], selectedGrammar, lang)}
                  as="h2"
                  className="text-2xl font-display font-light text-slate-900 dark:text-white leading-tight"
                />
                <EditableText
                  contentKey="home.onboarding.introText"
                  fallback={HOME_TONE[lang].introText[selectedStyle]}
                  as="p"
                  className="text-xs text-slate-500 dark:text-ink-muted font-sans leading-relaxed max-w-sm mx-auto"
                />
              </div>
              <button
                onClick={handleNextOnboard}
                className="px-8 py-4 bg-rosegold hover:bg-[#A35D68] text-white dark:bg-transparent dark:border dark:border-rosegold-light dark:text-rosegold-light dark:hover:bg-rosegold-light/10 rounded-2xl text-xs font-sans font-bold tracking-[0.15em] uppercase transition-all duration-300 shadow-rosegold cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <EditableText
                  contentKey="home.onboarding.enterDashboard"
                  fallback={lang === 'pt' ? 'Entrar no Dashboard' : lang === 'es' ? 'Entrar al Panel' : 'Enter Dashboard'}
                  as="span"
                />
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>,
      document.body
    );
  }

  // Loaded Sanctuary Screen View
  const hour = new Date().getHours();
  const lighting = (() => {
    if (hour >= 6 && hour < 12) {
      return {
        id: 'morning',
        bg: 'bg-radial from-[#FAF3E7] via-[#FAF8F5] to-[#FAF8F5] dark:bg-ink! dark:bg-none!',
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
        bg: 'bg-radial from-[#FAF8F5] via-[#FAF8F5] to-[#FAF8F5] dark:bg-ink! dark:bg-none!',
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
        bg: 'bg-radial from-[#FAF5F2] via-[#FAF8F5] to-[#FAF8F5] dark:bg-ink! dark:bg-none!',
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
    <div className={`relative min-h-[82vh] flex flex-col justify-between p-8 sm:p-14 rounded-[2.5rem] overflow-hidden transition-all duration-1000 select-none ${lighting.bg} border border-rose-100/20 dark:border-ink-hairline shadow-rosegold dark:shadow-none`}>
      {/* 1. Emotional Ambient Lighting Blurs - Warm and atmospheric */}
      {/* Dark mode drops the atmospheric blur glows — Opção B — Luxo
          Contido is deliberately flat, no glass/gradient (see
          BrandIdentityView → Paleta & Materiais). */}
      <div className={`absolute top-10 left-10 h-[400px] w-[400px] blur-[100px] rounded-full animate-pulse pointer-events-none dark:hidden ${lighting.glow1}`} style={{ animationDuration: '9s' }} />
      <div className={`absolute bottom-10 right-10 h-[400px] w-[400px] blur-[100px] rounded-full animate-pulse pointer-events-none dark:hidden ${lighting.glow2}`} style={{ animationDuration: '11s' }} />

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

      {/* Admin-only day jumper: browse any day's Início preview without
          touching real progress or requiring completion, same pattern as
          DailyMissionView's admin day jumper. */}
      {isAdminUnlocked && onJumpToDay && (
        <div className="flex items-center justify-center gap-3 rounded-xl border border-dashed border-rosegold/40 bg-rosegold/5 px-4 py-2.5 relative z-20 mb-2">
          <button
            onClick={() => { setTreeStagePreview(null); onJumpToDay(Math.max(1, currentDay.dayNumber - 1)); }}
            disabled={currentDay.dayNumber <= 1}
            className="h-8 w-8 flex items-center justify-center rounded-lg border border-rosegold/40 text-rosegold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-rosegold/10 transition cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-[11px] font-mono uppercase tracking-wider text-rosegold">
            Admin · Dia {currentDay.dayNumber} / 30
          </span>
          <button
            onClick={() => { setTreeStagePreview(null); onJumpToDay(Math.min(30, currentDay.dayNumber + 1)); }}
            disabled={currentDay.dayNumber >= 30}
            className="h-8 w-8 flex items-center justify-center rounded-lg border border-rosegold/40 text-rosegold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-rosegold/10 transition cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Top Section: Where am I? (Chapter & Stage Anchor) */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="text-center space-y-4 relative z-20"
      >
        <div className="space-y-1">
          <EditableText
            contentKey={`home.dashboard.greeting.${lighting.id}`}
            fallback={lighting.greeting}
            as="span"
            className="text-xs font-serif italic text-rosegold dark:text-rosegold-light"
          />
          <h3 className="text-sm font-sans font-medium tracking-wide text-slate-800 dark:text-ink-text">
            <EditableText
              contentKey={`home.dashboard.welcomeBack.${prefGrammar}`}
              fallback={prefGrammar === 'feminine'
                ? (lang === 'pt' ? 'Bem-vinda de volta' : lang === 'es' ? 'Bienvenida de vuelta' : 'Welcome back')
                : prefGrammar === 'masculine'
                ? (lang === 'pt' ? 'Bem-vindo de volta' : lang === 'es' ? 'Bienvenido de vuelta' : 'Welcome back')
                : (lang === 'pt' ? 'Bem-vinde de volta' : lang === 'es' ? 'Bienvenide de vuelta' : 'Welcome back')
              }
              as="span"
            />, <span className="font-mono text-xs font-normal opacity-85 text-rosegold dark:text-rosegold-light">
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
            <EditableText contentKey="home.dashboard.chapterLabel" fallback={trans.chapter} as="span" /> {chapter.id} • {adaptMessage(chapter.title[lang], prefGrammar, lang)}
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
          <TreeOfRebirth completedCount={treeDisplayCount} lang={lang} />
        </div>

        {isAdminUnlocked && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 max-w-[460px]">
            <EditableText
              contentKey="home.dashboard.admin.testPhaseLabel"
              fallback="Testar fase:"
              as="span"
              className="text-[9px] font-mono uppercase tracking-wider text-slate-400 dark:text-ink-muted mr-1"
            />
            {[
              { label: '1', count: 1 },
              { label: '2', count: 3 },
              { label: '3', count: 8 },
              { label: '4', count: 11 },
              { label: '5', count: 14 },
              { label: '6', count: 17 },
              { label: '7', count: 20 },
              { label: '8', count: 24 },
              { label: '9', count: 28 },
              { label: '10', count: 30 },
            ].map(item => (
              <button
                key={item.count}
                onClick={() => setTreeStagePreview(item.count)}
                className={`px-2 py-1 rounded-lg text-[9px] font-mono border transition ${
                  treeStagePreview === item.count
                    ? 'bg-rosegold text-white border-rosegold dark:bg-transparent dark:border-rosegold-light dark:text-rosegold-light'
                    : 'border-rose-100/30 dark:border-ink-hairline text-slate-500 dark:text-ink-muted hover:border-rosegold/50'
                }`}
              >
                {item.label}
              </button>
            ))}
            {treeStagePreview !== null && (
              <button
                onClick={() => setTreeStagePreview(null)}
                className="px-2 py-1 rounded-lg text-[9px] font-mono uppercase text-rose-500 hover:text-rose-600"
              >
                Real
              </button>
            )}
          </div>
        )}
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
          <EditableText
            contentKey="home.dashboard.todaysPromiseLabel"
            fallback={lang === 'pt' ? 'Promessa de Hoje' : lang === 'es' ? 'La Promesa de Hoy' : "Today's Promise"}
            as="span"
            className="text-[10px] uppercase tracking-[0.25em] font-sans font-bold text-accentgold dark:text-rosegold-light block"
          />
          <h1 className="text-2xl sm:text-3xl font-display font-light text-slate-900 dark:text-white leading-relaxed tracking-tight max-w-xl mx-auto">
            "{adaptMessage(currentDay.title[lang] || currentDay.title['pt'], prefGrammar, lang)}"
          </h1>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            {isRestDay ? (
              <span className="italic text-emerald-600 dark:text-emerald-400 font-sans tracking-wide">
                🌿 <EditableText contentKey="home.dashboard.restDesc" fallback={trans.restDesc} as="span" />
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
                ? 'bg-slate-100 dark:bg-transparent text-slate-400 dark:text-ink-muted border border-rose-100/10 dark:border-ink-hairline cursor-not-allowed shadow-none'
                : isCompleted
                ? 'bg-rose-50/60 dark:bg-transparent text-rosegold dark:text-rosegold-light hover:bg-rose-100/80 dark:hover:bg-rosegold-light/10 shadow-sm dark:shadow-none border border-rose-100/30 dark:border-rosegold-light cursor-pointer'
                : 'bg-rosegold hover:bg-[#A35D68] text-white dark:bg-transparent dark:border dark:border-rosegold-light dark:text-rosegold-light dark:hover:bg-rosegold-light/10 shadow-rosegold hover:shadow-rosegold/40 dark:shadow-none cursor-pointer'
            }`}
          >
            <EditableText
              contentKey={`home.dashboard.missionCta.${isLocked ? 'locked' : isCompleted ? 'review' : 'go'}`}
              fallback={isLocked ? trans.lockedTitle : isCompleted ? trans.reviewMission : trans.goMission}
              as="span"
            />
          </motion.button>

          {/* Quick, reassuring, pressure-free micro-copy */}
          <span className="text-[10px] text-slate-400 dark:text-ink-muted font-sans tracking-wide leading-relaxed max-w-xs sm:max-w-md">
            {isLocked ? (
              <EditableText contentKey="home.dashboard.waitingForTomorrow" fallback={trans.waitingForTomorrow} as="span" />
            ) : yesterdayIncomplete ? (
              <EditableText
                contentKey="home.dashboard.resumeAtYourPace"
                fallback={lang === 'pt' ? 'Sua vaga ficou guardada. Retome com tranquilidade.' : lang === 'es' ? 'Tu lugar te estaba esperando. Retoma con tranquilidad.' : 'We kept your place ready. Resume at your own pace.'}
                as="span"
              />
            ) : (
              <EditableText
                contentKey="home.dashboard.dailyStepNoPressure"
                fallback={lang === 'pt' ? 'Um passo simples por dia, sem cobranças ou julgamento.' : lang === 'es' ? 'Un paso simple por día, sin culpas ni juicios.' : 'One simple daily step, free of judgment or guilt.'}
                as="span"
              />
            )}
          </span>
        </div>

        {/* SOS must stay reachable even when the day is locked, the "Go to
            Daily Mission" button above is disabled in that state, so this is
            the only way to reach emotional support without it. No extra
            explanatory copy here, that instructional context lives only in
            the Library's Bem-Estar tab. */}
        {isLocked && onTriggerSos && (
          <button
            onClick={onTriggerSos}
            className="mx-auto flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rosegold hover:bg-[#A35D68] text-[10px] font-sans font-bold uppercase tracking-wider text-white transition-all duration-300 cursor-pointer shadow-rosegold animate-pulse"
          >
            <Heart className="h-3.5 w-3.5 fill-current" />
            <EditableText contentKey="home.dashboard.sosTrigger" fallback={trans.sosTrigger} as="span" />
          </button>
        )}
      </motion.div>
    </div>
  );
}
