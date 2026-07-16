/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play, Pause, Copy, Check, Star, ArrowRight, ArrowLeft, Heart, Sparkles, ThumbsUp, ThumbsDown,
  Info, Compass, HelpCircle, X, BookOpen, Smile, Wind, Award,
  RotateCcw, Lock
} from 'lucide-react';
import { MissionDay, Language, DayType, UserProgress } from '../types';
import { getDayTypeLabel, getHookOptionsForDay, getActionHookOptions, getHookCategoryLabel } from '../data/templateData';
import { adaptMessage, resolveGrammarPreference } from '../utils/grammar';

// Joins the 3 required promise-proof links into the single stored video-link string
const LINK_SEPARATOR = '|||';

interface DailyMissionViewProps {
  currentDay: MissionDay;
  progress: UserProgress;
  lang: Language;
  onCompleteDay: (reflectionText: string, videoLink: string, mood?: string) => void;
  onToggleFavorite: (dayNum: number) => void;
  onCopyHook: (dayNum: number) => void;
  onTriggerSos: () => void;
  onBackToHome: () => void;
  onUpdateMood: (dayNum: number, mood: string) => void;
}

// 4 Phases structure metadata for display
const phasesInfo = {
  1: {
    pt: { title: 'Fase 1: Despertar', obj: 'Reduzir medo e perfeccionismo. Construir segurança e celebrar pequenas vitórias.' },
    en: { title: 'Phase 1: Awakening', obj: 'Reduce fear & perfectionism. Build safety and celebrate small victories.' },
    es: { title: 'Fase 1: Despertar', obj: 'Reducir miedo y perfeccionismo. Construir seguridad y celebrar pequeñas victorias.' }
  },
  2: {
    pt: { title: 'Fase 2: Coragem', obj: 'Aumentar confiança, incentivar consistência e diminuir o excesso de pensamentos.' },
    en: { title: 'Phase 2: Courage', obj: 'Increase confidence, encourage consistency, and reduce overthinking.' },
    es: { title: 'Fase 2: Coraje', obj: 'Aumentar confianza, incentivar consistencia y disminuir el exceso de pensamiento.' }
  },
  3: {
    pt: { title: 'Fase 3: Expressão', obj: 'Desenvolver autenticidade, contar histórias pessoais e aumentar honestidade emocional.' },
    en: { title: 'Phase 3: Expression', obj: 'Develop authenticity, share personal stories, and increase emotional honesty.' },
    es: { title: 'Fase 3: Expresión', obj: 'Desarrollar autenticidad, contar historias personales y aumentar honestidad emocional.' }
  },
  4: {
    pt: { title: 'Fase 4: Expansão', obj: 'Consolidação de Identidade. Deixar de "tentar" e sentir "esse sou eu". Celebrar autoconfiança.' },
    en: { title: 'Phase 4: Expansion', obj: 'Identity consolidation. Shift from "trying" to "this is who I am". Celebrate self-trust.' },
    es: { title: 'Fase 4: Expansión', obj: 'Consolidación de identidad. Dejar de "intentar" y sentir "este soy yo". Celebrar autoconfianza.' }
  }
};

function getPhaseId(dayNum: number): number {
  if (dayNum <= 7) return 1;
  if (dayNum <= 14) return 2;
  if (dayNum <= 21) return 3;
  return 4;
}

// Identity Loop Phrases Lookup (Days 1 to 30)
const identityPhrases: Record<number, Record<Language, string>> = {
  1: {
    pt: "Você apareceu hoje. Você manteve sua promessa consigo mesma.",
    en: "You showed up today. You kept your promise to yourself.",
    es: "Apareciste hoy. Mantuviste tu promesa contigo misma."
  },
  2: {
    pt: "Você está criando evidências reais de consistência prática.",
    en: "You are building real evidence of practical consistency.",
    es: "Estás creando pruebas reales de consistencia práctica."
  },
  3: {
    pt: "Você provou que aparecer é seguro. Cada ação cura o perfeccionismo.",
    en: "You proved that showing up is safe. Each action heals perfectionism.",
    es: "Demostraste que aparecer es seguro. Cada acción cura el perfeccionismo."
  },
  4: {
    pt: "Mais uma prova de que seu medo está encolhendo.",
    en: "One more proof that your fear is shrinking.",
    es: "Una prueba más de que tu miedo se está reduciendo."
  },
  5: {
    pt: "Você está ensinando seu cérebro de que se expressar é saudável.",
    en: "You are teaching your nervous system that expressing yourself is healthy.",
    es: "Estás enseñando a tu cerebro que expresarte es saludable."
  },
  6: {
    pt: "Você confiou em [si mesma/si mesmo/si mesme] hoje. O compromisso de ontem foi honrado hoje.",
    en: "You trusted yourself today. Yesterday's promise was honored today.",
    es: "Confiaste en [ti misma/ti mismo/ti misme] hoy. El compromiso de ayer fue honrado hoy."
  },
  7: {
    pt: "Fase 1 concluída! Você venceu a barreira inicial da inércia.",
    en: "Phase 1 complete! You conquered the initial barrier of inertia.",
    es: "¡Fase 1 completada! Superaste la barrera inicial de la inercia."
  },
  8: {
    pt: "A consistência é um voto sobre quem você escolhe ser.",
    en: "Consistency is a vote for who you choose to become.",
    es: "La consistencia es un voto sobre quién eliges ser."
  },
  9: {
    pt: "Sua história tem força quando você para de tentar parecer perfeito.",
    en: "Your story holds weight when you stop trying to appear perfect.",
    es: "Tu historia tiene fuerza cuando dejas de intentar parecer perfecto."
  },
  10: {
    pt: "Você está abandonando o peso da máscara invisível.",
    en: "You are shedding the weight of the invisible mask.",
    es: "Estás dejando de lado el peso de la máscara invisible."
  },
  11: {
    pt: "A confiança nasce quando o agir se torna mais forte que a dúvida.",
    en: "Confidence is born when action becomes stronger than doubt.",
    es: "La confianza nace cuando el actuar se vuelve más fuerte que la duda."
  },
  12: {
    pt: "Mais uma vitória contra os sussurros de desculpas diárias.",
    en: "Another victory against the quiet whisper of excuses.",
    es: "Otra victoria contra los susurros de excusas diarias."
  },
  13: {
    pt: "Você escolheu a coragem à frente do conformismo hoje.",
    en: "You chose courage over comfort today.",
    es: "Elegiste el coraje frente al conformismo hoy."
  },
  14: {
    pt: "Metade do caminho! A coragem está se tornando sua resposta natural.",
    en: "Halfway there! Courage is becoming your natural default response.",
    es: "¡Mitad de camino! El coraje se está convirtiendo en tu respuesta natural."
  },
  15: {
    pt: "Sua autenticidade é a sua única vantagem competitiva real.",
    en: "Your authenticity is your only real competitive advantage.",
    es: "Tu autenticidad es tu única ventaja competitiva real."
  },
  16: {
    pt: "Você é livre para narrar a sua própria verdade no mundo.",
    en: "You are free to narrate your own truth in this world.",
    es: "Eres libre de narrar tu propia verdad en el mundo."
  },
  17: {
    pt: "A criatividade floresce quando você para de cobrar resultados.",
    en: "Creativity flourishes when you stop demanding immediate outcomes.",
    es: "La creatividad florece cuando dejas de exigir resultados inmediatos."
  },
  18: {
    pt: "Você está encontrando satisfação em se expressar com alma.",
    en: "You are finding creative satisfaction in expressing yourself from the soul.",
    es: "Estás encontrando satisfacción en expresarte con el alma."
  },
  19: {
    pt: "O medo não sumiu, mas sua voz se tornou imensamente maior.",
    en: "Fear is not completely gone, but your voice has grown immensely louder.",
    es: "El miedo no ha desaparecido, pero tu voz se ha vuelto inmensamente mayor."
  },
  20: {
    pt: "Sua presença magnética se estabelece no seu olhar honesto.",
    en: "Your magnetic presence is anchored in your honest look.",
    es: "Tu presencia magnética se establece en tu mirada sincera."
  },
  21: {
    pt: "Fase de Expressão integrada! Você fala com soberania profunda.",
    en: "Expression Phase integrated! You speak with deep sovereignty.",
    es: "¡Fase de Expresión integrada! Hablas con soberanía profunda."
  },
  22: {
    pt: "A transformação está consolidada. Isso não é esforço, é identidade.",
    en: "Transformation is complete. This is no longer effort; it is identity.",
    es: "La transformación está consolidada. Esto no es esfuerzo, es identidad."
  },
  23: {
    pt: "Você é alguém que naturalmente aparece e compartilha.",
    en: "You are someone who naturally shows up and shares.",
    es: "Eres alguien que naturalmente aparece y comparte."
  },
  24: {
    pt: "A sua promessa para [si mesma/si mesmo/si mesme] é inegociável.",
    en: "Your promise to yourself is non-negotiable.",
    es: "Tu promesa [contigo misma/contigo mismo/contigo misme] es innegociable."
  },
  25: {
    pt: "Sua presença é grounded: madura, serena e inabalável.",
    en: "Your presence is grounded: mature, serene, and unshakeable.",
    es: "Tu presencia es madura, serena e inquebrantable."
  },
  26: {
    pt: "Você governa sua própria voz de forma livre e leve.",
    en: "You govern your own voice with freedom and lightness.",
    es: "Gobiernas tu propia voz de forma libre y ligera."
  },
  27: {
    pt: "Sua resiliência profunda é o seu alicerce maduro.",
    en: "Your deep resilience is your mature foundation.",
    es: "Tu resiliencia profunda es tu base madura."
  },
  28: {
    pt: "Você honrou seu pacto silencioso de autoconfiança.",
    en: "You honored your quiet pact of self-trust.",
    es: "Honraste tu pacto silencioso de autoconfianza."
  },
  29: {
    pt: "Sua voz é livre de amarras externas. Você confia em si.",
    en: "Your voice is free of external bindings. You fully trust yourself.",
    es: "Tu voz está libre de ataduras externas. Confías plenamente en ti."
  },
  30: {
    pt: "Você se lembrou de quem você verdadeiramente é. A jornada agora é sua.",
    en: "You remembered who you truly are. The journey is now yours.",
    es: "Te recordaste quién eres verdaderamente. El camino ahora es tuyo."
  }
};

// Surprise letters data
const surpriseLetters: Record<number, Record<Language, { note: string; p: string }>> = {
  3: {
    pt: {
      note: "Uma mensagem silenciosa de segurança...",
      p: "Querida alma, você está no terceiro dia. Talvez a ansiedade ainda sussurre que você não está pronta de verdade. Mas adivinhe? Ninguém está. A perfeição é apenas uma armadilha que criamos para evitar sermos vistos. Hoje, sua única promessa é dar o play e falar olhando para a lente por 10 segundos. Sinta o medo, e fale assim mesmo. É seguro."
    },
    en: {
      note: "A quiet message of safety...",
      p: "Dear soul, you are on day three. Perhaps anxiety is still whispering that you are not truly ready. But guess what? No one is. Perfection is just a trap we build to avoid being seen. Today, your only promise is to press record and look into the lens for 10 seconds. Feel the fear, and speak anyway. It is safe."
    },
    es: {
      note: "Un mensaje silencioso de seguridad...",
      p: "Querida alma, estás en el tercer día. Quizás la ansiedad todavía te susurre que no estás lista de verdad. ¿Pero adivina qué? Nadie lo está. La perfección es solo una trampa que creamos para evitar ser vistos. Hoy, tu única promesa es presionar grabar y mirar a la lente por 10 segundos. Siente el miedo y habla de todos modos. Es seguro."
    }
  },
  11: {
    pt: {
      note: "Um lembrete de soberania diária...",
      p: "Você percebeu como o seu crítico interno tenta sabotar sua consistência nos detalhes mais simples? Ele diz que seu vídeo ficou sem graça, ou que hoje você está [cansada/cansado/cansade]. Não negocie com a dúvida. O que você está erguendo aqui não é um feed visual perfeito, é a sua própria soberania e autoconfiança. Grave hoje puramente por você."
    },
    en: {
      note: "A reminder of daily sovereignty...",
      p: "Have you noticed how your inner critic tries to sabotage your consistency in the smallest details? It says your video was plain, or that you are too tired today. Do not negotiate with doubt. What you are building here is not a perfect aesthetic feed; it is your own sovereignty and self-trust. Record today purely for yourself."
    },
    es: {
      note: "Un recordatorio de soberanía diaria...",
      p: "¿Has notado cómo tu crítico interno intenta sabotear tu consistencia en los detalles más simples? Te dice que tu video quedó aburrido, o que hoy estás demasiado [cansada/cansado/cansade]. No negocies con la duda. Lo que estás construyendo aquí no es un feed estético perfecto; es tu propia soberanía y autoconfianza. Graba hoy puramente por ti."
    }
  },
  18: {
    pt: {
      note: "A verdade sobre a autenticidade...",
      p: "A autenticidade não é uma técnica que você simula com ensaios. É algo que você permite acontecer. Quando você desiste de tentar parecer inteligente, séria ou impecavelmente profissional, e simplesmente compartilha o que de verdade pulsa em seu coração, a câmera desaparece. As pessoas não se conectam com conceitos frios; elas se conectam com humanos reais."
    },
    en: {
      note: "The truth about authenticity...",
      p: "Authenticity is not a technique you simulate with rehearsals. It is something you allow to happen. When you give up trying to look smart, serious, or flawlessly professional, and simply share what truly pulses in your heart, the camera disappears. People don't connect with cold concepts; they connect with real, vulnerable humans."
    },
    es: {
      note: "La verdad sobre la autenticidad...",
      p: "La autenticidad no es una técnica que simulas con ensayos. Es algo que dejas suceder. Cuando renuncias a intentar parecer inteligente, seria o impecablemente profesional, y simplemente compartes lo que de verdad pulsa en tu corazón, la cámara desaparece. La gente no se conecta con conceptos fríos; se conecta con humanos reales."
    }
  },
  25: {
    pt: {
      note: "Olhe para a sua própria história...",
      p: "Olhe para trás neste instante. Veja quem você era no Dia 1 e quem você se tornou agora. A pessoa que achava impossível encarar a lente por 15 segundos agora expressa pensamentos firmes com maturidade e serenidade natural. Você não precisa mais de roteiros detalhados para ter segurança. Você é [dona/dono/done] da sua presença. Respire fundo, você venceu."
    },
    en: {
      note: "Look at your own story...",
      p: "Look back right at this moment. See who you were on Day 1 and who you have become now. The person who thought it was impossible to face the lens for 15 seconds now expresses firm thoughts with maturity and natural serenity. You don't need detailed scripts anymore to feel secure. You own your presence. Breathe deep; you have won."
    },
    es: {
      note: "Mira tu propia historia...",
      p: "Mira hacia atrás en este instante. Mira quién eras en el Día 1 y en quién te has convertido ahora. La persona que pensaba que era imposible mirar a la lente por 15 segundos ahora expresa pensamientos firmes con madurez y serenidad natural. Ya no necesitas guiones detallados para tener seguridad. Eres [dueña/dueño/dueñe] de tu presencia. Respira hondo, ganaste."
    }
  }
};

// Stable organic-looking waveform bar heights (percentage), generated once at module load
const WAVEFORM_BARS = Array.from({ length: 48 }, (_, i) => {
  const wave = Math.sin(i * 0.5) * 0.3 + Math.sin(i * 0.23) * 0.5 + Math.sin(i * 0.9) * 0.2;
  return 22 + Math.abs(wave) * 65;
});

export default function DailyMissionView({
  currentDay,
  progress,
  lang,
  onCompleteDay,
  onToggleFavorite,
  onCopyHook,
  onTriggerSos,
  onBackToHome,
  onUpdateMood,
}: DailyMissionViewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [maxReachedProgress, setMaxReachedProgress] = useState(0);
  const [audioSpeed, setAudioSpeed] = useState(1);
  const [audioCompleted, setAudioCompleted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeHookTab, setActiveHookTab] = useState<number>(0);
  const [customHookIdea, setCustomHookIdea] = useState('');
  const [reflectionInput, setReflectionInput] = useState('');
  const [promiseLinks, setPromiseLinks] = useState({ inertia: '', confidence: '', evidence: '' });
  const [copiedHookOptionIndex, setCopiedHookOptionIndex] = useState<number | null>(null);
  const [copiedActionHookIndex, setCopiedActionHookIndex] = useState<number | null>(null);
  const [copiedHook, setCopiedHook] = useState(false);
  const [selectedMood, setSelectedMood] = useState<'calm' | 'hopeful' | 'neutral' | 'heavy' | 'emotional' | null>(null);
  const [activeStep, setActiveStep] = useState<number>(0);

  // Friday Breathing Cycle state
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [breathState, setBreathState] = useState<'inhale' | 'hold' | 'exhale' | 'rest'>('inhale');

  // Three Daily Promises checkboxes
  const [promisesChecked, setPromisesChecked] = useState({
    inertia: false,
    confidence: false,
    evidence: false
  });

  // Letter popup state
  const [showSurpriseLetter, setShowSurpriseLetter] = useState(false);

  // Audio player card local UI state
  const [audioRating, setAudioRating] = useState<'loved' | 'liked' | 'disliked' | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isCompleted = progress.completionHistory.includes(currentDay.dayNumber);
  const isRestDay = currentDay.type === DayType.Rest;
  const isFavorite = progress.favoriteHooks.includes(currentDay.dayNumber);

  const currentPhaseId = getPhaseId(currentDay.dayNumber);
  const localizedPhase = phasesInfo[currentPhaseId as keyof typeof phasesInfo][lang];

  // Check if reflection is a seventh-day moment
  const isSeventhDayReflection = currentDay.dayNumber % 7 === 0;

  // Friday Sanctuary Breathing Loop
  useEffect(() => {
    if (!isRestDay) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setBreathState((curr) => {
            if (curr === 'inhale') return 'hold';
            if (curr === 'hold') return 'exhale';
            if (curr === 'exhale') return 'rest';
            return 'inhale';
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRestDay, breathState]);

  // Sync state when day changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load();
    }
    setIsPlaying(false);
    setAudioProgress(0);
    setCurrentTime(0);
    setDuration(0);
    setAudioCompleted(false);
    setActiveHookTab(0);
    setCustomHookIdea('');
    setReflectionInput(progress.reflections[currentDay.dayNumber] || '');
    const [savedInertia = '', savedConfidence = '', savedEvidence = ''] = (progress.videoLinks[currentDay.dayNumber] || '').split(LINK_SEPARATOR);
    setPromiseLinks({ inertia: savedInertia, confidence: savedConfidence, evidence: savedEvidence });

    // Reset daily promises checkboxes
    setPromisesChecked({
      inertia: isCompleted,
      confidence: isCompleted,
      evidence: isCompleted
    });

    // Check for surprise letter on Days 3, 11, 18, 25
    if ([3, 11, 18, 25].includes(currentDay.dayNumber) && !isCompleted) {
      const timer = setTimeout(() => {
        setShowSurpriseLetter(true);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setShowSurpriseLetter(false);
    }
  }, [currentDay.dayNumber, progress, isCompleted]);

  // Synchronize audio speed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = audioSpeed;
    }
  }, [audioSpeed]);

  const handlePlayToggle = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((e) => {
          console.log('Audio playback simulation fallback activated.', e);
          setIsPlaying(true);
        });
    }
  };

  // Simulation fallback if offline
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && (!audioRef.current || audioRef.current.paused)) {
      interval = setInterval(() => {
        setAudioProgress((prev) => {
          const next = prev + (2.5 * audioSpeed);
          const clamped = Math.min(100, next);
          setMaxReachedProgress((max) => Math.max(max, clamped));
          if (next >= 100) {
            setIsPlaying(false);
            setAudioCompleted(true);
            return 100;
          }
          return next;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, audioSpeed]);

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration || 0;
      setCurrentTime(current);
      if (total > 0) {
        setDuration(total);
        const pct = (current / total) * 100;
        setAudioProgress(pct);
        setMaxReachedProgress((prev) => Math.max(prev, pct));
      }
    }
  };

  const handleAudioLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
      audioRef.current.playbackRate = audioSpeed;
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setAudioCompleted(true);
    setAudioProgress(100);
  };

  // Seeking is only allowed up to the furthest point actually listened to —
  // rewinding to re-listen is free, but jumping ahead to "finish" without
  // listening is blocked. The only way to complete the audio is to hear it.
  const handleSeekChange = (e: ChangeEvent<HTMLInputElement>) => {
    const requested = parseFloat(e.target.value);
    const val = Math.min(requested, maxReachedProgress);
    setAudioProgress(val);
    if (audioRef.current && duration > 0) {
      audioRef.current.currentTime = (val / 100) * duration;
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleSkipBack15 = () => {
    if (audioRef.current && duration > 0) {
      const newTime = Math.max(0, audioRef.current.currentTime - 15);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      setAudioProgress((newTime / duration) * 100);
    } else {
      setAudioProgress((prev) => Math.max(0, prev - 10));
    }
  };

  const cycleAudioSpeed = () => {
    setAudioSpeed((prev) => (prev === 1 ? 1.25 : prev === 1.25 ? 1.5 : 1));
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds === 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHook(true);
    onCopyHook(currentDay.dayNumber);
    setTimeout(() => setCopiedHook(false), 2000);
  };

  const copyHookOption = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedHookOptionIndex(index);
    setTimeout(() => setCopiedHookOptionIndex(null), 2000);
  };

  const copyActionHookOption = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedActionHookIndex(index);
    setTimeout(() => setCopiedActionHookIndex(null), 2000);
  };

  // Validation checking for Three Promises + Audio + Reflection Text
  const allPromiseLinksFilled = promiseLinks.inertia.trim().length > 0 && promiseLinks.confidence.trim().length > 0 && promiseLinks.evidence.trim().length > 0;
  const allPromisesKept = promisesChecked.inertia && promisesChecked.confidence && promisesChecked.evidence && allPromiseLinksFilled;
  const canComplete = isRestDay || (audioCompleted && reflectionInput.trim().length > 3 && allPromisesKept);
  const combinedPromiseLinks = [promiseLinks.inertia, promiseLinks.confidence, promiseLinks.evidence].join(LINK_SEPARATOR);

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
    exposureAction: adaptMessage(rawContent.exposureAction, prefGrammar, lang),
    reflectionQuestion: adaptMessage(rawContent.reflectionQuestion, prefGrammar, lang)
  };

  const hookOptions = getHookOptionsForDay(currentDay.dayNumber, lang, progress.journeyStartDate);
  const hookCategoryLabel = getHookCategoryLabel(currentDay.dayNumber, lang, progress.journeyStartDate);
  const actionHookOptions = getActionHookOptions(lang);

  // Translation Dictionary
  const textDict = {
    pt: {
      dailyMission: 'Missão Diária',
      lockedTitle: 'Dia Bloqueado',
      lockedDesc: 'Este passo libera amanhã. Aproveite hoje pra descansar — você já cumpriu sua promessa.',
      backToHome: 'Voltar pro Início',
      audioTitle: 'Mensagem da Renata',
      ratingLoved: 'Amei',
      ratingLiked: 'Gostei',
      ratingDisliked: 'Não gostei',
      audioSub: 'Sintonize seu estado emocional antes de agir',
      audioFinished: '✓ Sintonização Concluída',
      audioListen: 'Ouvir Renata',
      audioPause: 'Pausar',
      speed: 'Velocidade',
      hookTitle: 'Mensagem do Dia',
      hookShowcaseTitle: 'Vitrine de Hooks da Semana',
      exposureTitle: 'Ação de Exposição Externa',
      copyHook: 'Copiar hook',
      copiedHookLabel: 'Copiado!',
      tabOpenLabel: 'Abertura',
      tabDailyLabel: 'Hook do Dia',
      tabIdeaLabel: 'Minha Ideia',
      openHookHeading: 'Use uma dessas variedades de ação pra começar o seu vídeo',
      dailyHookHeadingPrefix: 'Hoje usaremos ganchos de',
      noDailyHookFallback: 'Hoje não tem hook temático — use o hook de abertura ou escreva o seu na aba "Minha Ideia".',
      ideaHeading: 'Qual a sua ideia?',
      ideaSubtitle: 'Se você decidiu por um gancho autoral, escreva abaixo:',
      ideaPlaceholder: 'Escreva aqui a sua frase de gancho...',
      reflectionTitle: 'E aí, como você tá se sentindo agora? Escreve pra descarregar e acompanhar seu progresso mais pra frente.',
      reflectionPlaceholder: 'Como você se sentiu hoje? Escreva com verdade sobre o medo, julgamento ou vitória ao realizar esta missão...',
      reflectionWarning: 'Escreva pelo menos uma frase curta para validar seu progresso.',
      completeBtn: 'Concluir Missão do Dia',
      completeBtnRest: '✓ Eu Descansei e Integrei Hoje',
      completedBadge: 'Missão Integrada',
      restDayQuote: 'O repouso não é desistência; é a integração silenciosa da sua coragem.',
      restDayDescription: 'Hoje é dia de descanso. Seu único objetivo é relaxar e integrar as lições da semana. Sem vídeos, sem câmeras, sem pressão. Sinta orgulho de ter sustentado suas promessas.',
      sosHeading: 'Sentindo ansiedade ou trava física?',
      sosTrigger: 'Acione o SOS Emocional',
      promisesTitle: 'As Três Promessas de Hoje',
      promisesSubtitle: 'Três pequenos passos físicos para quebrar a inércia e consolidar seu novo eu:',
      promise1: 'Gravei um vídeo de até 60 segundos pra postar no reels',
      promise2: 'Gravei um vídeo de pelo menos 30 segundos sobre meu aprendizado de hoje (ou postei uma foto com legenda honesta)',
      promise3: 'Gravei um vídeo de até 90 segundos usando um dos hooks disponíveis hoje',
      reflection7Title: 'Sua Reflexão Semanal de Crescimento',
      reflection7Q1: '1. O que mais te surpreendeu na sua capacidade de agir esta semana?',
      reflection7Q2: '2. O que se tornou visivelmente mais fácil em relação ao primeiro dia?',
      reflection7Q3: '3. Do que exatamente você sente mais orgulho em si mesma hoje?',
      sanctuaryTitle: 'Santuário de Descanso Estratégico',
      inhale: 'Inspire...',
      hold: 'Prenda o ar...',
      exhale: 'Expire devagar...',
      rest: 'Vazio e calma...',
      closeLetter: 'Integrar Conselho',
      identityHeader: 'Quem você provou ser hoje:',
      step01: 'Passo 01',
      step02: 'Passo 02',
      step03: 'Passo 03',
      step04: 'Passo 04',
      copy: 'Copiar',
      copied: 'Copiado!',
      promise1Label: 'Promessa 1: Vídeo pro Reels',
      promise2Label: 'Promessa 2: Vídeo ou Foto de Aprendizado',
      promise3Label: 'Promessa 3: Vídeo com Hook',
      progressLockTitle: 'Requisitos de Conclusão',
      statusTitle: 'Status do Dia',
      listenItem: '1. Ouvir a Mensagem da Renata',
      promisesItem: '2. Gravações de Hoje',
      recordingsLinkInstruction: 'Cole aqui o link dos 3 posts de hoje',
      completedStatus: 'Concluído',
      pendingStatus: 'Pendente',
      reflectionMoment: 'Momento de Reflexão:',
      readLetterTooltip: 'Ler Carta da Renata',
      favoriteTooltip: 'Favoritar Gancho',
      linkRequiredTitle: 'Link de comprovação (obrigatório)',
      linkRequiredPlaceholder: 'Cole o link aqui...',
      linkRequiredWarning: 'Adicione o link para validar esta promessa.',
      audioSpeedTooltip: 'Velocidade de reprodução',
      skipBack: 'Voltar 15s',
    },
    en: {
      dailyMission: 'Daily Mission',
      lockedTitle: 'Day Locked',
      lockedDesc: 'This step unlocks tomorrow. Take today to rest — you already kept your promise.',
      backToHome: 'Back to Home',
      audioTitle: "Renata's Message",
      ratingLoved: 'Loved it',
      ratingLiked: 'Liked it',
      ratingDisliked: "Didn't like it",
      audioSub: 'Tune into your emotional state before taking action',
      audioFinished: '✓ Calibration Complete',
      audioListen: 'Listen to Renata',
      audioPause: 'Pause',
      speed: 'Speed',
      hookTitle: "Today's Message",
      hookShowcaseTitle: 'Weekly Hook Showcase',
      copyHook: 'Copy hook',
      copiedHookLabel: 'Copied!',
      tabOpenLabel: 'Opening',
      tabDailyLabel: "Today's Hook",
      tabIdeaLabel: 'My Idea',
      openHookHeading: "Today we'll use action hooks",
      dailyHookHeadingPrefix: "Today's hook theme:",
      noDailyHookFallback: 'No themed hook today — use the opening hook, or write your own in the "My Idea" tab.',
      ideaHeading: 'What is your idea?',
      ideaSubtitle: "If you've decided on your own original hook, write it below:",
      ideaPlaceholder: 'Write your hook line here...',
      exposureTitle: 'External Exposure Action',
      reflectionTitle: 'So, how are you feeling right now? Write it out to let go, and track your progress later on.',
      reflectionPlaceholder: 'How did you feel today? Write honestly about the fear, judgment, or victory during this mission...',
      reflectionWarning: 'Write at least a short sentence to validate your progress.',
      completeBtn: 'Complete Today\'s Mission',
      completeBtnRest: '✓ I Rested & Integrated Today',
      completedBadge: 'Mission Completed',
      restDayQuote: 'Rest is not quitting; it is the silent integration of your courage.',
      restDayDescription: 'Today is a rest day. Your only task is to rest and integrate everything you learned this week. No videos, no cameras, no pressure. Just feel proud of keeping your promises.',
      sosHeading: 'Feeling anxiety or stage fright?',
      sosTrigger: 'Activate Emotional SOS',
      promisesTitle: "Today's Three Promises",
      promisesSubtitle: 'Three small physical actions to break inertia and consolidate your new identity:',
      promise1: 'Recorded a video up to 60 seconds long to post on reels',
      promise2: "Recorded a video at least 30 seconds long about today's biggest takeaway (or posted a photo with an honest caption)",
      promise3: "Recorded a video up to 90 seconds long using one of today's available hooks",
      reflection7Title: 'Your Weekly Growth Reflection',
      reflection7Q1: '1. What surprised you the most about your capacity to act this week?',
      reflection7Q2: '2. What has become visibly easier compared to the first day?',
      reflection7Q3: '3. What exactly are you most proud of about yourself today?',
      sanctuaryTitle: 'Strategic Rest Sanctuary',
      inhale: 'Inhale...',
      hold: 'Hold...',
      exhale: 'Exhale slowly...',
      rest: 'Stay empty & calm...',
      closeLetter: 'Integrate Council',
      identityHeader: 'Who you proved to be today:',
      step01: 'Step 01',
      step02: 'Step 02',
      step03: 'Step 03',
      step04: 'Step 04',
      copy: 'Copy',
      copied: 'Copied!',
      promise1Label: 'Promise 1: Reels Video',
      promise2Label: 'Promise 2: Learning Video or Photo',
      promise3Label: 'Promise 3: Hook Video',
      progressLockTitle: 'Completion Requirements',
      statusTitle: 'Day Status',
      listenItem: "1. Listen to Renata's Message",
      promisesItem: "2. Today's Recordings",
      recordingsLinkInstruction: "Paste the link to today's 3 posts here",
      completedStatus: 'Completed',
      pendingStatus: 'Pending',
      reflectionMoment: 'Reflection Moment:',
      readLetterTooltip: "Read Renata's Letter",
      favoriteTooltip: 'Favorite Hook',
      linkRequiredTitle: 'Proof link (required)',
      linkRequiredPlaceholder: 'Paste the link here...',
      linkRequiredWarning: 'Add the link to validate this promise.',
      audioSpeedTooltip: 'Playback speed',
      skipBack: 'Back 15s',
    },
    es: {
      dailyMission: 'Misión Diaria',
      lockedTitle: 'Día Bloqueado',
      lockedDesc: 'Este paso se libera mañana. Aprovecha hoy para descansar — ya cumpliste tu promesa.',
      backToHome: 'Volver al Inicio',
      audioTitle: 'Mensaje de Renata',
      ratingLoved: 'Me encantó',
      ratingLiked: 'Me gustó',
      ratingDisliked: 'No me gustó',
      audioSub: 'Sintoniza tu estado emocional antes de actuar',
      audioFinished: '✓ Sintonización Completada',
      audioListen: 'Escuchar a Renata',
      audioPause: 'Pausar',
      speed: 'Velocidad',
      hookTitle: 'Mensagem do Dia',
      hookShowcaseTitle: 'Vitrina de Hooks de la Semana',
      copyHook: 'Copiar hook',
      copiedHookLabel: '¡Copiado!',
      tabOpenLabel: 'Apertura',
      tabDailyLabel: 'Hook del Día',
      tabIdeaLabel: 'Mi Idea',
      openHookHeading: 'Hoy usaremos ganchos de acción',
      dailyHookHeadingPrefix: 'Hoy usaremos ganchos de',
      noDailyHookFallback: 'Hoy no hay hook temático — usa el hook de apertura o escribe el tuyo en la pestaña "Mi Idea".',
      ideaHeading: '¿Cuál es tu idea?',
      ideaSubtitle: 'Si decidiste usar un hook propio, escríbelo abajo:',
      ideaPlaceholder: 'Escribe aquí tu frase de hook...',
      exposureTitle: 'Acción de Exposición Externa',
      reflectionTitle: '¿Y bueno, cómo te sientes ahora? Escribe para desahogarte y seguir tu progreso más adelante.',
      reflectionPlaceholder: '¿Cómo te sentiste hoy? Escribe con honestidad sobre el miedo, juicio o victoria al realizar esta misión...',
      reflectionWarning: 'Escribe al menos una frase corta para validar tu progreso.',
      completeBtn: 'Completar Misión del Día',
      completeBtnRest: '✓ Yo Descansé e Integré Hoy',
      completedBadge: 'Misión Integrada',
      restDayQuote: 'El descanso no es rendición; es la integración silenciosa de tu valentía.',
      restDayDescription: 'Hoy es día de descanso. Tu única tarea es relajarte e integrar las lecciones de la semana. Sin publicaciones, sin cámaras, sin presión. Siéntete orgulloso de haber sostenido tus promesas.',
      sosHeading: '¿Sientes ansiedad o miedo en la voz?',
      sosTrigger: 'Activar SOS Emocional',
      promisesTitle: 'Las Tres Promesas de Hoy',
      promisesSubtitle: 'Tres pequeños pasos físicos para romper la inercia y consolidar tu nueva identidad:',
      promise1: 'Grabé un video de hasta 60 segundos para publicar en reels',
      promise2: 'Grabé un video de al menos 30 segundos sobre mi aprendizaje de hoy (o publiqué una foto con una descripción honesta)',
      promise3: 'Grabé un video de hasta 90 segundos usando uno de los hooks disponibles hoy',
      reflection7Title: 'Tu Reflexión Semanal de Crecimiento',
      reflection7Q1: '1. ¿Qué es lo que más te sorprendió de tu capacidad para actuar esta semana?',
      reflection7Q2: '2. ¿Qué se ha vuelto visiblemente más fácil en relación con el primer día?',
      reflection7Q3: '3. ¿De qué te sientes exactamente más orgulloso de ti mismo hoy?',
      sanctuaryTitle: 'Santuario de Descanso Estratégico',
      inhale: 'Inhala...',
      hold: 'Retén el aire...',
      exhale: 'Exhala despacio...',
      rest: 'Vacío y calma...',
      closeLetter: 'Integrar Consejo',
      identityHeader: 'Quién demostraste ser hoy:',
      step01: 'Paso 01',
      step02: 'Paso 02',
      step03: 'Paso 03',
      step04: 'Paso 04',
      copy: 'Copiar',
      copied: '¡Copiado!',
      promise1Label: 'Promesa 1: Video para Reels',
      promise2Label: 'Promesa 2: Video o Foto de Aprendizaje',
      promise3Label: 'Promesa 3: Video con Hook',
      progressLockTitle: 'Requisitos de Finalización',
      statusTitle: 'Estado del Día',
      listenItem: '1. Escuchar el Mensaje de Renata',
      promisesItem: '2. Grabaciones de Hoy',
      recordingsLinkInstruction: 'Pega aquí el enlace de tus 3 publicaciones de hoy',
      completedStatus: 'Completado',
      pendingStatus: 'Pendiente',
      reflectionMoment: 'Momento de Reflexión:',
      readLetterTooltip: 'Leer Carta de Renata',
      favoriteTooltip: 'Marcar Gancho como Favorito',
      linkRequiredTitle: 'Enlace de prueba (obligatorio)',
      linkRequiredPlaceholder: 'Pega el enlace aquí...',
      linkRequiredWarning: 'Agrega el enlace para validar esta promesa.',
      audioSpeedTooltip: 'Velocidad de reproducción',
      skipBack: 'Retroceder 15s',
    }
  }[lang];

  // A newly-unlocked day still waits for the real calendar to turn over —
  // finishing Day 1 today doesn't let you jump into Day 2 later the same day.
  const todayISO = new Date().toISOString().split('T')[0];
  const isWaitingForNewCalendarDay = currentDay.dayNumber === progress.currentDay
    && currentDay.dayNumber > 1
    && !isCompleted
    && progress.lastActiveDate === todayISO;

  if (isWaitingForNewCalendarDay) {
    return (
      <div className="max-w-md mx-auto text-center py-24 space-y-5">
        <div className="h-14 w-14 rounded-2xl bg-rose-50 dark:bg-rosegold/10 text-rosegold flex items-center justify-center mx-auto">
          <Lock className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-serif font-bold text-slate-800 dark:text-white">
          {textDict.lockedTitle}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          {textDict.lockedDesc}
        </p>
        <button
          onClick={onBackToHome}
          className="px-8 py-3 rounded-xl bg-rosegold hover:bg-[#A35D68] text-white text-xs font-sans font-bold uppercase tracking-wider transition cursor-pointer"
        >
          {textDict.backToHome}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none relative">
      
      {/* 1. Interactive Animated Butterfly Overlay (Days 3, 11, 18, 25) */}
      {[3, 11, 18, 25].includes(currentDay.dayNumber) && !isCompleted && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
          <motion.div
            initial={{ x: -100, y: 500, rotate: 45, scale: 0.8 }}
            animate={{ 
              x: [null, 150, 400, 650, 950],
              y: [null, 350, 180, 260, -100],
              rotate: [45, 15, 60, 30, 45],
              scale: [0.8, 1.1, 0.9, 1.2, 0.8]
            }}
            transition={{ 
              duration: 10, 
              ease: "easeInOut",
              times: [0, 0.25, 0.5, 0.75, 1]
            }}
            className="absolute left-0 bottom-0"
          >
            {/* Flapping Wings SVG Butterfly */}
            <div className="flex gap-0.5">
              <motion.svg 
                animate={{ rotateY: [0, 65, 0] }}
                transition={{ duration: 0.3, repeat: Infinity, ease: "easeInOut" }}
                className="h-6 w-6 text-rosegold fill-current origin-right"
                viewBox="0 0 24 24"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </motion.svg>
              <motion.svg 
                animate={{ rotateY: [0, -65, 0] }}
                transition={{ duration: 0.3, repeat: Infinity, ease: "easeInOut" }}
                className="h-6 w-6 text-rosegold fill-current origin-left scale-x-[-1]"
                viewBox="0 0 24 24"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </motion.svg>
            </div>
            <span className="text-[9px] text-[#D4AF37] opacity-60 block font-serif tracking-widest mt-1">✨</span>
          </motion.div>
        </div>
      )}

      {/* 2. Surprise Mentor's Private Letter Modal */}
      <AnimatePresence>
        {showSurpriseLetter && [3, 11, 18, 25].includes(currentDay.dayNumber) && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6 sm:p-8">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="bg-[#FAF8F5] dark:bg-[#1E1715] max-w-lg w-full rounded-[2rem] p-8 sm:p-10 border border-rosegold/35 shadow-rosegold text-left relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 h-32 w-32 bg-gradient-to-bl from-rosegold/15 to-transparent blur-2xl rounded-full" />
              <button 
                onClick={() => setShowSurpriseLetter(false)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-rosegold transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2.5">
                <Smile className="h-5 w-5 text-rosegold animate-bounce" />
                <span className="text-[10px] tracking-[0.2em] font-sans font-bold text-rosegold uppercase">
                  {adaptMessage(surpriseLetters[currentDay.dayNumber as keyof typeof surpriseLetters][lang].note, prefGrammar, lang)}
                </span>
              </div>

              {/* Serif handwritten aesthetic body */}
              <div className="font-display italic text-slate-700 dark:text-slate-200 text-base sm:text-lg leading-relaxed pt-3 border-l-2 border-rosegold/30 pl-5 space-y-4">
                <p>
                  {adaptMessage(surpriseLetters[currentDay.dayNumber as keyof typeof surpriseLetters][lang].p, prefGrammar, lang)}
                </p>
              </div>

              <div className="flex justify-end pt-6">
                <button
                  onClick={() => setShowSurpriseLetter(false)}
                  className="px-6 py-3 bg-rosegold hover:bg-[#A35D68] text-white text-xs font-sans font-bold uppercase tracking-[0.15em] rounded-xl shadow-rosegold transition-all cursor-pointer hover:scale-[1.02]"
                >
                  {textDict.closeLetter}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Day Header — directly on the page background, no card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6"
      >
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-gradient-to-r from-rosegold to-rosegold-light text-[9px] uppercase font-sans tracking-[0.2em] rounded-full font-bold text-white shadow-rosegold">
              {textDict.dailyMission} • {currentDay.dayNumber}/30
            </span>
            <span className="px-2.5 py-1 bg-rosegold/10 text-[9px] uppercase font-mono tracking-[0.25em] rounded-full border border-rosegold/15 font-semibold text-rosegold">
              {localizedPhase.title}
            </span>
            {isCompleted && (
              <span className="px-3 py-1 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[9px] uppercase font-sans tracking-[0.2em] rounded-full border border-emerald-500/20 font-bold">
                {textDict.completedBadge}
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-display font-light tracking-tight text-slate-900 dark:text-white leading-tight">
            {adaptMessage(currentDay.title[lang] || currentDay.title['pt'], prefGrammar, lang)}
          </h1>
          <p className="text-xs text-rosegold font-sans tracking-[0.1em] uppercase font-medium">
            {getDayTypeLabel(currentDay.type, lang)}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {[3, 11, 18, 25].includes(currentDay.dayNumber) && (
            <button
              onClick={() => setShowSurpriseLetter(true)}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-accentgold/15 to-rosegold/15 border border-accentgold/35 text-accentgold animate-pulse hover:scale-105 transition-all cursor-pointer"
              title={textDict.readLetterTooltip}
            >
              <BookOpen className="h-5 w-5" />
            </button>
          )}

          <button
            onClick={() => onToggleFavorite(currentDay.dayNumber)}
            className={`p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer ${
              isFavorite
                ? 'bg-accentgold/15 border-accentgold/40 text-accentgold shadow-rosegold'
                : 'bg-rose-50 dark:bg-white/5 border-rose-100/20 dark:border-white/10 text-slate-400 hover:text-rosegold hover:bg-rose-100/40'
            }`}
            title={textDict.favoriteTooltip}
          >
            <Star className="h-5 w-5 fill-current" />
          </button>
        </div>
      </motion.div>

      {/* Main Column Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Main Steps */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* FRIDAY EXPERIENCE (Dia de Descanso) Sanctuary */}
          {isRestDay ? (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[2rem] border border-rose-150/30 dark:border-rosegold/15 bg-white/45 dark:bg-[#1C1513]/40 backdrop-blur-md p-8 sm:p-10 text-center space-y-8 shadow-rosegold overflow-hidden relative"
            >
              {/* Sacred Friday background elements */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-44 w-44 bg-emerald-500/5 blur-3xl rounded-full" />
              
              <div className="mx-auto max-w-md space-y-6 relative z-10">
                <span className="text-[9px] uppercase font-sans tracking-[0.25em] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-full">
                  {textDict.sanctuaryTitle}
                </span>

                <div className="p-5 bg-emerald-50/40 dark:bg-[#202924]/30 rounded-2xl border border-emerald-500/10 max-w-sm mx-auto">
                  <p className="text-emerald-800 dark:text-emerald-400 italic font-medium font-display text-sm leading-relaxed">
                    "{textDict.restDayQuote}"
                  </p>
                </div>

                <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed font-sans">
                  {textDict.restDayDescription}
                </p>

                {/* Interactive Calming Breathing Circle for Rest Sanctuary */}
                <div className="py-6 flex flex-col items-center justify-center space-y-5">
                  <motion.div
                    animate={{
                      scale: 
                        breathState === 'inhale' ? 1.45 : 
                        breathState === 'hold' ? 1.45 : 
                        breathState === 'exhale' ? 1.0 : 1.0,
                    }}
                    transition={{ duration: 4, ease: "easeInOut" }}
                    className={`h-32 w-32 rounded-full flex flex-col items-center justify-center text-white relative shadow-inner transition-colors duration-1000 ${
                      breathState === 'inhale' ? 'bg-emerald-600/30 ring-8 ring-emerald-500/5' :
                      breathState === 'hold' ? 'bg-amber-500/20 ring-8 ring-amber-500/5' :
                      breathState === 'exhale' ? 'bg-emerald-700/20 ring-8 ring-emerald-700/5' :
                      'bg-slate-700/20'
                    }`}
                  >
                    <Wind className="h-6 w-6 opacity-20 absolute" />
                    <span className="text-xs font-bold relative z-10 font-sans tracking-wide">
                      {secondsLeft}s
                    </span>
                  </motion.div>
                  
                  <span className="text-[10px] font-sans tracking-[0.2em] text-emerald-600 dark:text-emerald-400 uppercase font-bold">
                    {breathState === 'inhale' && textDict.inhale}
                    {breathState === 'hold' && textDict.hold}
                    {breathState === 'exhale' && textDict.exhale}
                    {breathState === 'rest' && textDict.rest}
                  </span>
                </div>
              </div>
            </motion.div>
          ) : (
            <>
              {/* Today's Message (not numbered — it's a message, not a step) */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-[2rem] bg-white dark:bg-[#1E1715] border border-rose-100/20 dark:border-rosegold/10 p-6 sm:p-8 shadow-rosegold space-y-5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-sans tracking-[0.2em] text-rosegold uppercase font-bold">
                    {textDict.hookTitle}
                  </span>

                  <button
                    onClick={() => copyToClipboard(localizedContent.hook)}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rosegold transition-colors duration-250 cursor-pointer hover:scale-105"
                  >
                    {copiedHook ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-emerald-500 font-bold">{textDict.copied}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>{textDict.copy}</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-6 rounded-2xl bg-gradient-to-br from-rose-50/10 via-[#FAF8F5] to-rose-50/5 dark:from-[#2C221E]/10 dark:via-[#241C1A] dark:to-rosegold/5 border border-rose-100/15 dark:border-rosegold/10 shadow-sm">
                  <p className="text-slate-800 dark:text-slate-100 font-display text-lg sm:text-xl italic leading-relaxed">
                    "{localizedContent.hook}"
                  </p>
                </div>
              </motion.div>

              {/* STEP 1: Calming Audio Session */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-[2rem] bg-[#FAF3EF] dark:bg-[#1E1715] border border-rose-100/20 dark:border-rosegold/10 p-6 sm:p-8 shadow-rosegold relative overflow-hidden"
              >
                <audio
                  ref={audioRef}
                  src={localizedContent.audioUrl}
                  onTimeUpdate={handleAudioTimeUpdate}
                  onLoadedMetadata={handleAudioLoadedMetadata}
                  onEnded={handleAudioEnded}
                  className="hidden"
                />

                {/* Top row: label + favorite */}
                <div className="flex items-start justify-between relative z-10">
                  <span className="text-[9px] font-sans tracking-[0.2em] text-rosegold uppercase font-extrabold block">
                    {textDict.step01} • {textDict.audioTitle}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setAudioRating((v) => (v === 'loved' ? null : 'loved'))}
                      title={textDict.ratingLoved}
                      className="h-9 w-9 rounded-full bg-white/70 dark:bg-white/5 border border-rose-100/40 dark:border-rosegold/10 flex items-center justify-center transition-all duration-300 cursor-pointer hover:scale-105"
                    >
                      <Heart className={`h-4 w-4 transition-colors ${audioRating === 'loved' ? 'text-rosegold fill-current' : 'text-slate-400'}`} />
                    </button>
                    <button
                      onClick={() => setAudioRating((v) => (v === 'liked' ? null : 'liked'))}
                      title={textDict.ratingLiked}
                      className="h-9 w-9 rounded-full bg-white/70 dark:bg-white/5 border border-rose-100/40 dark:border-rosegold/10 flex items-center justify-center transition-all duration-300 cursor-pointer hover:scale-105"
                    >
                      <ThumbsUp className={`h-4 w-4 transition-colors ${audioRating === 'liked' ? 'text-emerald-500 fill-current' : 'text-slate-400'}`} />
                    </button>
                    <button
                      onClick={() => setAudioRating((v) => (v === 'disliked' ? null : 'disliked'))}
                      title={textDict.ratingDisliked}
                      className="h-9 w-9 rounded-full bg-white/70 dark:bg-white/5 border border-rose-100/40 dark:border-rosegold/10 flex items-center justify-center transition-all duration-300 cursor-pointer hover:scale-105"
                    >
                      <ThumbsDown className={`h-4 w-4 transition-colors ${audioRating === 'disliked' ? 'text-slate-600 dark:text-slate-300 fill-current' : 'text-slate-400'}`} />
                    </button>
                  </div>
                </div>

                {/* Title + duration */}
                <div className="mt-3 space-y-1 relative z-10">
                  <h3 className="text-xl sm:text-2xl font-serif font-semibold text-slate-800 dark:text-slate-100">
                    {audioCompleted ? textDict.audioFinished : adaptMessage(currentDay.title[lang] || currentDay.title['pt'], prefGrammar, lang)}
                  </h3>
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-sans block">
                    {formatTime(duration)}
                  </span>
                </div>

                {/* Waveform + centered play button */}
                <div className="relative mt-6 h-20 flex items-center justify-center gap-[3px] px-2">
                  {WAVEFORM_BARS.map((h, i) => {
                    const played = (i / WAVEFORM_BARS.length) * 100 < audioProgress;
                    return (
                      <div
                        key={i}
                        className={`flex-1 rounded-full transition-colors duration-300 ${played ? 'bg-rosegold' : 'bg-rosegold/25 dark:bg-rosegold/15'}`}
                        style={{ height: `${h}%` }}
                      />
                    );
                  })}

                  <button
                    onClick={handlePlayToggle}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-16 w-16 rounded-full bg-gradient-to-br from-rosegold to-[#A35D68] shadow-rosegold flex items-center justify-center text-white transition-transform duration-300 cursor-pointer hover:scale-105 ring-4 ring-[#FAF3EF] dark:ring-[#1E1715]"
                  >
                    {isPlaying ? (
                      <Pause className="h-6 w-6 fill-current" />
                    ) : (
                      <Play className="h-6 w-6 fill-current ml-0.5" />
                    )}
                  </button>
                </div>

                {/* Seekable progress bar */}
                <div className="mt-4 relative z-10">
                  <input
                    type="range"
                    min="0"
                    max={Math.max(maxReachedProgress, audioProgress)}
                    step="0.1"
                    value={audioProgress}
                    onChange={handleSeekChange}
                    className="w-full h-1 bg-rose-200/50 dark:bg-[#2C221E] rounded-full appearance-none cursor-pointer accent-rosegold transition-all focus:outline-none"
                  />
                  <div className="flex items-center justify-between text-[11px] font-sans text-slate-400 dark:text-slate-500 mt-2">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Bottom control row */}
                <div className="mt-4 flex items-center justify-between relative z-10">
                  <button
                    onClick={cycleAudioSpeed}
                    title={textDict.audioSpeedTooltip}
                    className="h-10 w-10 rounded-full bg-white/70 dark:bg-white/5 border border-rose-100/40 dark:border-rosegold/10 flex items-center justify-center text-xs font-sans font-bold text-rosegold transition-all duration-300 cursor-pointer hover:scale-105"
                  >
                    {audioSpeed}x
                  </button>

                  <button
                    onClick={handleSkipBack15}
                    title={textDict.skipBack}
                    className="h-10 w-10 rounded-full bg-white/70 dark:bg-white/5 border border-rose-100/40 dark:border-rosegold/10 flex flex-col items-center justify-center text-rosegold transition-all duration-300 cursor-pointer hover:scale-105"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>

              {/* STEP 2: Weekly Hook Showcase (opening hook / daily hook / own idea) */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-[2rem] bg-white dark:bg-[#1E1715] border border-rose-100/20 dark:border-rosegold/10 p-6 sm:p-8 shadow-rosegold space-y-5"
              >
                <div className="flex items-center justify-between pb-2 border-b border-rose-100/15 dark:border-rosegold/5">
                  <span className="text-[9px] font-sans tracking-[0.2em] text-rosegold uppercase font-bold">
                    {textDict.step02} • {textDict.hookShowcaseTitle}
                  </span>
                </div>

                <div className="flex gap-1.5 bg-rose-50/30 dark:bg-rosegold/5 p-1.5 rounded-xl">
                  {[textDict.tabOpenLabel, textDict.tabDailyLabel, textDict.tabIdeaLabel].map((label, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveHookTab(idx)}
                      className={`flex-1 py-2 rounded-lg text-xs font-sans font-semibold transition-all duration-300 cursor-pointer ${
                        activeHookTab === idx
                          ? 'bg-rosegold text-white shadow-sm'
                          : 'text-slate-500 hover:text-rosegold hover:bg-rose-50/50'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {activeHookTab === 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 font-sans">
                      {textDict.openHookHeading}
                    </h4>
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {actionHookOptions.map((option, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50/30 dark:bg-rosegold/5 border border-rose-100/10 dark:border-rosegold/10"
                        >
                          <span className="flex-1 text-sm text-slate-700 dark:text-slate-300 font-sans leading-relaxed">
                            {option}
                          </span>
                          <button
                            onClick={() => copyActionHookOption(option, idx)}
                            className="shrink-0 flex items-center gap-1.5 text-xs font-sans text-slate-500 hover:text-rosegold transition-colors duration-250 cursor-pointer font-bold"
                          >
                            {copiedActionHookIndex === idx ? (
                              <>
                                <Check className="h-3.5 w-3.5 text-emerald-500" />
                                <span className="text-emerald-500">{textDict.copiedHookLabel}</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5" />
                                <span>{textDict.copyHook}</span>
                              </>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeHookTab === 1 && (
                  <div className="space-y-3">
                    {hookCategoryLabel && (
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 font-sans">
                        {textDict.dailyHookHeadingPrefix} {hookCategoryLabel}
                      </h4>
                    )}
                    {hookOptions.length > 0 ? (
                      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                        {hookOptions.map((option, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50/30 dark:bg-rosegold/5 border border-rose-100/10 dark:border-rosegold/10"
                          >
                            <span className="flex-1 text-sm text-slate-700 dark:text-slate-300 font-sans leading-relaxed">
                              {option}
                            </span>
                            <button
                              onClick={() => copyHookOption(option, idx)}
                              className="shrink-0 flex items-center gap-1.5 text-xs font-sans text-slate-500 hover:text-rosegold transition-colors duration-250 cursor-pointer font-bold"
                            >
                              {copiedHookOptionIndex === idx ? (
                                <>
                                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                                  <span className="text-emerald-500">{textDict.copiedHookLabel}</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3.5 w-3.5" />
                                  <span>{textDict.copyHook}</span>
                                </>
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 dark:text-slate-400 italic font-sans p-3.5 rounded-xl bg-rose-50/30 dark:bg-rosegold/5 border border-rose-100/10 dark:border-rosegold/10">
                        {textDict.noDailyHookFallback}
                      </p>
                    )}
                  </div>
                )}

                {activeHookTab === 2 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 font-sans">
                      {textDict.ideaHeading}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                      {textDict.ideaSubtitle}
                    </p>
                    <textarea
                      value={customHookIdea}
                      onChange={(e) => setCustomHookIdea(e.target.value)}
                      placeholder={textDict.ideaPlaceholder}
                      rows={3}
                      className="w-full text-sm bg-[#FAF8F5] dark:bg-[#130E0D] border border-rose-100/10 focus:border-rosegold focus:outline-none focus:ring-1 focus:ring-rosegold rounded-xl p-3.5 text-slate-700 dark:text-slate-200 transition-all duration-300 shadow-xs resize-none"
                    />
                  </div>
                )}
              </motion.div>

              {/* STEP 4: Exposure Action */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-[2rem] bg-white dark:bg-[#1E1715] border border-rose-100/20 dark:border-rosegold/10 p-6 sm:p-8 shadow-rosegold space-y-4"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-sans tracking-[0.2em] text-rosegold bg-rose-50/50 dark:bg-rosegold/10 px-3 py-1 rounded-full uppercase font-extrabold">
                    {textDict.step03} • {textDict.exposureTitle}
                  </span>
                </div>
                
                <div className="p-6 rounded-2xl bg-gradient-to-br from-rose-50/15 to-rose-50/5 dark:from-[#2C221E]/10 dark:to-rosegold/5 border border-rose-100/15 dark:border-rosegold/10 shadow-sm space-y-3">
                  {(() => {
                    const [title, ...bullets] = localizedContent.exposureAction.split('\n').filter(Boolean);
                    return (
                      <>
                        <p className="text-slate-800 dark:text-slate-200 text-sm font-sans font-semibold leading-relaxed">
                          {title}
                        </p>
                        <ul className="space-y-2">
                          {bullets.map((bullet, idx) => (
                            <li key={idx} className="flex gap-2 text-slate-700 dark:text-slate-300 text-sm font-sans leading-relaxed">
                              <span className="text-rosegold shrink-0">•</span>
                              <span>{bullet.replace(/^•\s*/, '')}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    );
                  })()}
                </div>
              </motion.div>


              {/* THE THREE VIDEO / PROMISES EXPERIENCE - Mandatory Checklist */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-[2rem] border border-amber-200/40 dark:border-amber-500/10 bg-[#FFFDF9] dark:bg-[#251E1C]/30 p-6 sm:p-8 shadow-rosegold space-y-5"
              >
                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-amber-100 flex items-center gap-2 font-sans tracking-wide">
                    <Sparkles className="h-4.5 w-4.5 text-accentgold animate-pulse" />
                    {textDict.promisesTitle}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                    {textDict.promisesSubtitle}
                  </p>
                </div>

                <div className="space-y-3.5 pt-1">
                  {([
                    { key: 'inertia' as const, label: textDict.promise1Label, desc: textDict.promise1 },
                    { key: 'confidence' as const, label: textDict.promise2Label, desc: textDict.promise2 },
                    { key: 'evidence' as const, label: textDict.promise3Label, desc: textDict.promise3 }
                  ]).map((item) => (
                    <label
                      key={item.key}
                      className="flex items-start gap-3.5 p-4 bg-white dark:bg-[#1E1715] rounded-2xl border border-rose-100/10 cursor-pointer hover:bg-amber-50/30 dark:hover:bg-rosegold/5 transition-all duration-300 select-none shadow-xs"
                    >
                      <input
                        type="checkbox"
                        checked={promisesChecked[item.key]}
                        disabled={isCompleted}
                        onChange={(e) => setPromisesChecked(p => ({ ...p, [item.key]: e.target.checked }))}
                        className="mt-0.5 h-4.5 w-4.5 rounded-md text-rosegold border-slate-300 focus:ring-rosegold transition-all duration-300"
                      />
                      <div className="text-xs font-sans">
                        <span className="font-semibold text-slate-700 dark:text-slate-200 block">{item.label}</span>
                        <span className="text-slate-500 dark:text-slate-400 block mt-1 leading-relaxed">{item.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </motion.div>
            </>
          )}

        </div>

        {/* RIGHT COLUMN: Reflection Input & Validation Submission */}
        <div className="space-y-6">
          
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-3xl bg-white dark:bg-[#2C221E] border border-rose-100/30 dark:border-rosegold/10 p-6 shadow-sm space-y-6"
          >
            <div>
              <h3 className="text-xs font-sans text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-3.5 font-extrabold">
                {isRestDay ? textDict.statusTitle : textDict.progressLockTitle}
              </h3>

              {!isRestDay && (
                <div className="space-y-3">
                  {/* Validation checkmark widgets */}
                  <div className="flex items-center justify-between text-xs bg-[#FAF8F5] dark:bg-[#130E0D] border border-rose-100/10 p-4 rounded-xl shadow-xs">
                    <span className="text-slate-600 dark:text-slate-300 font-semibold font-sans">{textDict.listenItem}</span>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-sans font-bold uppercase tracking-wider ${
                      audioCompleted
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        : 'bg-rose-50 dark:bg-rosegold/15 text-rosegold'
                    }`}>
                      {audioCompleted ? textDict.completedStatus : textDict.pendingStatus}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs bg-[#FAF8F5] dark:bg-[#130E0D] border border-rose-100/10 p-4 rounded-xl shadow-xs">
                    <span className="text-slate-600 dark:text-slate-300 font-semibold font-sans">{textDict.promisesItem}</span>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-sans font-bold uppercase tracking-wider ${
                      allPromisesKept
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        : 'bg-amber-500/15 text-accentgold'
                    }`}>
                      {allPromisesKept ? textDict.completedStatus : textDict.pendingStatus}
                    </span>
                  </div>

                  {/* 3 mandatory recording links */}
                  <div className="space-y-2 pt-1">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                      {textDict.recordingsLinkInstruction}
                    </p>
                    {([
                      { key: 'inertia' as const },
                      { key: 'confidence' as const },
                      { key: 'evidence' as const }
                    ]).map((item, idx) => (
                      <input
                        key={item.key}
                        type="url"
                        value={promiseLinks[item.key]}
                        disabled={isCompleted}
                        onChange={(e) => setPromiseLinks(p => ({ ...p, [item.key]: e.target.value }))}
                        placeholder={`${textDict.linkRequiredPlaceholder} (${idx + 1}/3)`}
                        className="w-full text-xs bg-[#FAF8F5] dark:bg-[#130E0D] border border-rose-100/10 focus:border-rosegold focus:outline-none focus:ring-1 focus:ring-rosegold rounded-xl p-3.5 text-slate-700 dark:text-slate-200 transition-all duration-300 shadow-xs"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Reflection Text Area */}
            {!isRestDay && (
              <div className="space-y-4">
                <label className="block text-xs font-sans text-rosegold uppercase font-extrabold tracking-wider">
                  {isSeventhDayReflection ? textDict.reflection7Title : textDict.reflectionTitle}
                </label>
                
                {isSeventhDayReflection ? (
                  <div className="text-xs text-slate-500 dark:text-slate-400 space-y-2 p-4 rounded-2xl bg-amber-500/5 border border-accentgold/20 font-sans italic">
                    <p className="font-bold text-accentgold not-italic uppercase tracking-widest text-[9px]">{localizedPhase.title} {textDict.reflectionMoment}</p>
                    <p>{textDict.reflection7Q1}</p>
                    <p>{textDict.reflection7Q2}</p>
                    <p>{textDict.reflection7Q3}</p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic leading-relaxed">
                    "{localizedContent.reflectionQuestion}"
                  </p>
                )}

                <textarea
                  value={reflectionInput}
                  onChange={(e) => setReflectionInput(e.target.value)}
                  disabled={isCompleted}
                  placeholder={textDict.reflectionPlaceholder}
                  rows={4}
                  className="w-full text-sm bg-[#FAF8F5] dark:bg-[#130E0D] border border-rose-100/20 dark:border-rosegold/10 focus:border-rosegold focus:outline-none focus:ring-1 focus:ring-rosegold rounded-2xl p-4 placeholder-slate-400 text-slate-700 dark:text-slate-200 transition-all duration-300 shadow-inner"
                />
                
                {reflectionInput.trim().length <= 3 && !isCompleted && (
                  <p className="text-[11px] text-[#D4AF37] flex items-center gap-1.5 font-sans font-medium">
                    <Info className="h-4 w-4 shrink-0" />
                    {textDict.reflectionWarning}
                  </p>
                )}

                {/* Daily Mood Integration */}
                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-sans text-rosegold uppercase font-extrabold tracking-widest">
                    {lang === 'pt' ? 'Como você se sente agora?' : lang === 'es' ? '¿Cómo te sientes ahora?' : 'How do you feel now?'}
                  </label>
                  <div className="flex justify-between gap-1.5 p-1.5 bg-[#FAF8F5] dark:bg-[#130E0D] rounded-2xl border border-rose-100/10 dark:border-rosegold/5 shadow-inner">
                    {(['calm', 'hopeful', 'neutral', 'heavy', 'emotional'] as const).map((moodKey) => {
                      const info = {
                        calm: { emoji: '😊', label: lang === 'pt' ? 'Calma' : lang === 'es' ? 'Calma' : 'Calm', color: 'hover:bg-emerald-500/10 text-emerald-600', active: 'bg-emerald-500/10 border-emerald-500/35 text-emerald-600 shadow-xs' },
                        hopeful: { emoji: '🙂', label: lang === 'pt' ? 'Esperança' : lang === 'es' ? 'Esperanza' : 'Hope', color: 'hover:bg-rose-500/10 text-rosegold', active: 'bg-rose-500/15 border-rose-500/35 text-rosegold shadow-xs' },
                        neutral: { emoji: '😐', label: lang === 'pt' ? 'Neutro' : lang === 'es' ? 'Neutro' : 'Neutral', color: 'hover:bg-slate-500/10 text-slate-600', active: 'bg-slate-500/10 border-slate-500/35 text-slate-600 shadow-xs' },
                        heavy: { emoji: '😔', label: lang === 'pt' ? 'Pesado' : lang === 'es' ? 'Pesado' : 'Heavy', color: 'hover:bg-indigo-500/10 text-indigo-600', active: 'bg-indigo-500/10 border-indigo-500/35 text-indigo-600 shadow-xs' },
                        emotional: { emoji: '😭', label: lang === 'pt' ? 'Sensível' : lang === 'es' ? 'Sensible' : 'Sensitive', color: 'hover:bg-amber-500/10 text-amber-600', active: 'bg-amber-500/10 border-amber-500/35 text-amber-600 shadow-xs' }
                      }[moodKey];

                      const isSelected = selectedMood === moodKey || (isCompleted && progress.journalMoods?.[currentDay.dayNumber] === moodKey);

                      return (
                        <button
                          key={moodKey}
                          type="button"
                          onClick={() => {
                            if (isCompleted) {
                              onUpdateMood(currentDay.dayNumber, moodKey);
                            } else {
                              setSelectedMood(moodKey);
                            }
                          }}
                          className={`flex-1 flex flex-col items-center gap-1.5 py-3 px-1 rounded-xl text-center border border-transparent transition-all duration-300 cursor-pointer select-none ${
                            isSelected ? info.active : `${info.color} text-slate-500`
                          } hover:scale-105`}
                        >
                          <span className="text-2xl">{info.emoji}</span>
                          <span className="text-[9px] font-sans font-extrabold tracking-tight uppercase">{info.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Submit Lock / Completion CTA */}
            {isCompleted ? (
              <div className="bg-[#FAF8F5] dark:bg-[#1C1513] border border-emerald-500/20 rounded-3xl p-6 space-y-5 shadow-sm">
                <div className="text-center space-y-1">
                  <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px] block uppercase tracking-[0.2em] bg-emerald-500/10 px-3 py-1 rounded-full w-max mx-auto">
                    🎉 {textDict.completedBadge}!
                  </span>
                </div>
                
                {/* 3. The Identity Loop Statement */}
                <div className="border-t border-b border-rose-100/10 py-4 text-left space-y-1.5">
                  <span className="text-[9px] font-extrabold uppercase text-slate-400 tracking-[0.15em] block">
                    {textDict.identityHeader}
                  </span>
                  <p className="text-sm text-slate-700 dark:text-slate-200 font-medium italic font-display leading-relaxed">
                    "{adaptMessage(identityPhrases[currentDay.dayNumber as keyof typeof identityPhrases]?.[lang] || 'You showed up today.', prefGrammar, lang)}"
                  </p>
                </div>

                {/* Progress Feedback Dashboard */}
                <div className="space-y-4">
                  <span className="text-[9px] font-sans font-extrabold uppercase tracking-[0.2em] text-slate-400 block">
                    {lang === 'pt' ? 'Métricas de Evolução' : lang === 'es' ? 'Métricas de Evolución' : 'Evolution Metrics'}
                  </span>
                  
                  <div className="grid grid-cols-2 gap-3.5 text-[11px] leading-tight">
                    {/* Current Chapter */}
                    <div className="bg-white dark:bg-[#1E1715] p-3 rounded-2xl border border-rose-100/10 shadow-xs">
                      <span className="block text-[8px] text-slate-400 uppercase font-sans font-extrabold tracking-wider mb-1">
                        {lang === 'pt' ? 'Capítulo' : lang === 'es' ? 'Capítulo' : 'Chapter'}
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 font-sans">
                        {getPhaseId(currentDay.dayNumber)} • {
                          getPhaseId(currentDay.dayNumber) === 1 ? (lang === 'pt' ? 'DESPERTAR' : lang === 'es' ? 'DESPERTAR' : 'AWAKENING') :
                          getPhaseId(currentDay.dayNumber) === 2 ? (lang === 'pt' ? 'CORAGEM' : lang === 'es' ? 'CORAJE' : 'COURAGE') :
                          getPhaseId(currentDay.dayNumber) === 3 ? (lang === 'pt' ? 'EXPRESSÃO' : lang === 'es' ? 'EXPRESIÓN' : 'EXPRESSION') :
                          (lang === 'pt' ? 'EXPANSÃO' : lang === 'es' ? 'EXPANSIÓN' : 'EXPANSION')
                        }
                      </span>
                    </div>

                    {/* Current Day */}
                    <div className="bg-white dark:bg-[#1E1715] p-3 rounded-2xl border border-rose-100/10 shadow-xs">
                      <span className="block text-[8px] text-slate-400 uppercase font-sans font-extrabold tracking-wider mb-1">
                        {lang === 'pt' ? 'Dia / Racha' : lang === 'es' ? 'Día / Racha' : 'Day / Streak'}
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 font-sans">
                        {currentDay.dayNumber}/30 ({progress.currentStreak}d)
                      </span>
                    </div>

                    {/* Journey Percentage */}
                    <div className="bg-white dark:bg-[#1E1715] p-3 rounded-2xl border border-rose-100/10 shadow-xs">
                      <span className="block text-[8px] text-slate-400 uppercase font-sans font-extrabold tracking-wider mb-1">
                        {lang === 'pt' ? 'Conclusão' : lang === 'es' ? 'Completado' : 'Completion'}
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 font-sans">
                        {Math.round((progress.completionHistory.length / 30) * 100)}%
                      </span>
                    </div>

                    {/* Chapter Percentage */}
                    <div className="bg-white dark:bg-[#1E1715] p-3 rounded-2xl border border-rose-100/10 shadow-xs">
                      <span className="block text-[8px] text-slate-400 uppercase font-sans font-extrabold tracking-wider mb-1">
                        {lang === 'pt' ? 'Fase Atual' : lang === 'es' ? 'Fase Actual' : 'Current Phase'}
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 font-sans">
                        {(() => {
                          const cid = getPhaseId(currentDay.dayNumber);
                          const range = cid === 1 ? [1, 7] : cid === 2 ? [8, 14] : cid === 3 ? [15, 21] : [22, 30];
                          const totalDays = range[1] - range[0] + 1;
                          const completed = progress.completionHistory.filter(d => d >= range[0] && d <= range[1]).length;
                          return Math.round((completed / totalDays) * 100);
                        })()}%
                      </span>
                    </div>
                  </div>

                  {/* Checklist of proof points */}
                  <div className="space-y-2 pt-3 border-t border-rose-100/5">
                    <span className="block text-[9px] text-slate-400 uppercase font-sans font-extrabold tracking-wider">
                      {lang === 'pt' ? 'Evidências de Identidade' : lang === 'es' ? 'Evidencias de Identidad' : 'Identity Evidence'}
                    </span>
                    
                    <div className="space-y-1.5 text-[11px] font-sans">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span>{lang === 'pt' ? 'Mensagem da Renata Concluída' : lang === 'es' ? 'Mensaje de Renata Completado' : "Renata's Message Completed"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span>{lang === 'pt' ? 'Três Compromissos Selados' : lang === 'es' ? 'Tres Compromisos Sellados' : 'Three Promises Sealed'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span>{lang === 'pt' ? 'Reflexão Pessoal Salva' : lang === 'es' ? 'Reflexión Personal Guardada' : 'Personal Reflection Saved'}</span>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            ) : (
              <button
                onClick={() => onCompleteDay(reflectionInput, combinedPromiseLinks, selectedMood || 'neutral')}
                disabled={!canComplete}
                className={`w-full py-4.5 px-6 rounded-2xl text-xs font-sans font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2.5 transition-all duration-300 cursor-pointer ${
                  canComplete 
                    ? 'bg-rosegold text-white hover:bg-[#A35D68] shadow-rosegold hover:scale-[1.01]' 
                    : 'bg-rose-50/40 dark:bg-rosegold/5 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-rose-100/10'
                }`}
              >
                <span>{isRestDay ? textDict.completeBtnRest : textDict.completeBtn}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}

          </motion.div>

          {/* Quick Trigger Emotional SOS Banner */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-[1.5rem] border border-rose-150/40 dark:border-rosegold/15 bg-[#251E1C]/5 dark:bg-[#1C1513]/30 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 rounded-xl bg-rosegold/10 text-rosegold shrink-0">
                <Heart className="h-4.5 w-4.5 fill-current text-rosegold animate-pulse" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 font-sans tracking-wide leading-relaxed">
                  {textDict.sosHeading}
                </h4>
              </div>
            </div>
            <button
              onClick={onTriggerSos}
              className="w-full sm:w-auto shrink-0 px-4 py-2 rounded-xl bg-rosegold hover:bg-[#A35D68] text-[10px] font-sans font-bold uppercase tracking-wider text-white transition-all duration-300 cursor-pointer shadow-rosegold animate-pulse"
            >
              {textDict.sosTrigger}
            </button>
          </motion.div>

        </div>

      </div>
    </div>
  );
}
