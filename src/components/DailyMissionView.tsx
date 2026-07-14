/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Pause, Copy, Check, Star, ArrowRight, ArrowLeft, Heart, Sparkles, 
  Volume2, Info, Compass, HelpCircle, X, BookOpen, Smile, Wind, Award
} from 'lucide-react';
import { MissionDay, Language, DayType, UserProgress } from '../types';
import { getDayTypeLabel } from '../data/templateData';
import { adaptMessage } from '../utils/grammar';

interface DailyMissionViewProps {
  currentDay: MissionDay;
  progress: UserProgress;
  lang: Language;
  onCompleteDay: (reflectionText: string, videoLink: string, mood?: string) => void;
  onToggleFavorite: (dayNum: number) => void;
  onCopyHook: (dayNum: number) => void;
  onTriggerSos: () => void;
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

export default function DailyMissionView({
  currentDay,
  progress,
  lang,
  onCompleteDay,
  onToggleFavorite,
  onCopyHook,
  onTriggerSos,
}: DailyMissionViewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioSpeed, setAudioSpeed] = useState(1);
  const [audioCompleted, setAudioCompleted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeScriptTab, setActiveScriptTab] = useState<number>(0);
  const [reflectionInput, setReflectionInput] = useState('');
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [copiedScriptIndex, setCopiedScriptIndex] = useState<number | null>(null);
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

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isCompleted = progress.completionHistory.includes(currentDay.dayNumber);
  const isRestDay = currentDay.type === DayType.Rest;
  const isFavorite = progress.favoriteHooks.includes(currentDay.dayNumber);

  const currentPhaseId = getPhaseId(currentDay.dayNumber);
  const localizedPhase = phasesInfo[currentPhaseId as keyof typeof phasesInfo][lang];

  // Progressive guidance description based on day count
  const getProgressiveGuidance = () => {
    if (currentDay.dayNumber <= 7) {
      return {
        pt: "Apoio Completo: Use esta fase para desarmar a tensão. A preparação de hoje é guiada de forma simples e segura. Leia cada palavra com calma. Não há pressa.",
        en: "Full Support: Use this phase to defuse all tension. Today's preparation is guided simply and safely. Read every word with calm. There is no rush.",
        es: "Soporte Completo: Usa esta fase para desarmar la tensión. La preparación de hoy está guiada de forma simple y segura. Lee cada palabra con calma. No hay prisa."
      }[lang];
    } else if (currentDay.dayNumber <= 14) {
      return {
        pt: "Estabilidade e Hábito: Suas bases físicas já foram formadas. Hoje, foque no ritmo respiratório inicial e na consistência das palavras. Siga o roteiro de apoio de forma objetiva.",
        en: "Habit & Consistency: Your foundations are already set. Today, focus on the initial breathing rhythm and words consistency. Use the support scripts objectively.",
        es: "Estabilidad y Hábito: Tus bases físicas ya están formadas. Hoy, enfócate en el ritmo respiratorio inicial y en la consistencia de las palabras. Sigue el guión de apoyo de manera objetiva."
      }[lang];
    } else if (currentDay.dayNumber <= 21) {
      return {
        pt: "Liberdade Autêntica: Menos explicações teóricas. O mentor confia no seu instinto expressivo. Use o gancho para brincar com sua criatividade.",
        en: "Authentic Liberty: Less theoretical explanations. The mentor trusts your expressive instinct. Use the hook to play with your personal creativity.",
        es: "Libertad Auténtica: Menos explicaciones teóricas. El mentor confía en tu instinto expresivo. Usa el gancho para jugar con tu creatividad."
      }[lang];
    } else {
      return {
        pt: "Plena Autonomia: Roteiro ultra-minimalista. Você já conquistou a sua segurança física. Vá direto para a lente. Você não precisa mais de suporte extenso.",
        en: "Full Autonomy: Ultra-minimalistic guidance. You have conquered physical safety. Go straight to the lens. You no longer need extensive explanation.",
        es: "Plena Autonomía: Guía ultra-minimalista. Ya has conquistado tu seguridad física. Ve directo a la lente. Ya no necesitas soporte extenso."
      }[lang];
    }
  };

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
    setActiveScriptTab(0);
    setReflectionInput(progress.reflections[currentDay.dayNumber] || '');
    setVideoUrlInput(progress.videoLinks[currentDay.dayNumber] || '');

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
        setAudioProgress((current / total) * 100);
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

  const handleSeekChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setAudioProgress(val);
    if (audioRef.current && duration > 0) {
      audioRef.current.currentTime = (val / 100) * duration;
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleFastForwardAudio = () => {
    if (audioRef.current && duration > 0) {
      audioRef.current.currentTime = duration;
    }
    setAudioProgress(100);
    setIsPlaying(false);
    setAudioCompleted(true);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds === 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const copyToClipboard = (text: string, isHook: boolean, index?: number) => {
    navigator.clipboard.writeText(text);
    if (isHook) {
      setCopiedHook(true);
      onCopyHook(currentDay.dayNumber);
      setTimeout(() => setCopiedHook(false), 2000);
    } else if (index !== undefined) {
      setCopiedScriptIndex(index);
      setTimeout(() => setCopiedScriptIndex(null), 2000);
    }
  };

  // Validation checking for Three Promises + Audio + Reflection Text
  const allPromisesKept = promisesChecked.inertia && promisesChecked.confidence && promisesChecked.evidence;
  const canComplete = isRestDay || (audioCompleted && reflectionInput.trim().length > 3 && allPromisesKept);

  const prefGrammar = progress.grammarPreference || 'neutral';
  const guideStyle = progress.guideStyle || 'gentle';

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

  // Translation Dictionary
  const textDict = {
    pt: {
      dailyMission: 'Missão Diária',
      audioTitle: 'Áudio do Mentor',
      audioSub: 'Sintonize seu estado emocional antes de agir',
      audioFinished: '✓ Sintonização Concluída',
      audioListen: 'Ouvir Mentor',
      audioPause: 'Pausar',
      audioSkip: 'Marcar como ouvido',
      speed: 'Velocidade',
      hookTitle: 'Gancho de Alto Impacto',
      scriptsTitle: '3 Exemplos de Roteiro Prático',
      exposureTitle: 'Ação de Exposição Externa',
      reflectionTitle: 'Sua Reflexão Honesta',
      reflectionPlaceholder: 'Como você se sentiu hoje? Escreva com verdade sobre o medo, julgamento ou vitória ao realizar esta missão...',
      reflectionWarning: 'Escreva pelo menos uma frase curta para validar seu progresso.',
      videoLinkTitle: 'Link do seu Vídeo/Story (Opcional)',
      videoLinkPlaceholder: 'Ex: https://instagram.com/stories/...',
      completeBtn: 'Concluir Missão do Dia',
      completeBtnRest: '✓ Eu Descansei e Integrei Hoje',
      completedBadge: 'Missão Integrada',
      restDayQuote: 'O repouso não é desistência; é a integração silenciosa da sua coragem.',
      restDayDescription: 'Hoje é dia de descanso. Seu único objetivo é relaxar e integrar as lições da semana. Sem vídeos, sem câmeras, sem pressão. Sinta orgulho de ter sustentado suas promessas.',
      sosHeading: 'Sentindo ansiedade ou trava física?',
      sosTrigger: 'Acione o SOS Emocional',
      promisesTitle: 'As Três Promessas de Hoje',
      promisesSubtitle: 'Três pequenos passos físicos para quebrar a inércia e consolidar seu novo eu:',
      promise1: 'Romper a Inércia (Gravei o primeiro rascunho de teste de 10 segundos)',
      promise2: 'Construir Confiança (Falei olhando diretamente para a lente com presença)',
      promise3: 'Criar Evidência (Publiquei o vídeo final ou salvei-o como prova de consistência)',
      reflection7Title: 'Sua Reflexão Semanal de Crescimento',
      reflection7Q1: '1. O que mais te surpreendeu na sua capacidade de agir esta semana?',
      reflection7Q2: '2. O que se tornou visivelmente mais fácil em relação ao primeiro dia?',
      reflection7Q3: '3. Do que exatamente você sente mais orgulho em si mesma hoje?',
      autonomyTitle: 'Seu nível de autonomia',
      sanctuaryTitle: 'Santuário de Descanso Estratégico',
      inhale: 'Inspire...',
      hold: 'Prenda o ar...',
      exhale: 'Expire devagar...',
      rest: 'Vazio e calma...',
      closeLetter: 'Integrar Conselho',
      identityHeader: 'Quem você provou ser hoje:'
    },
    en: {
      dailyMission: 'Daily Mission',
      audioTitle: 'Mentor Session',
      audioSub: 'Tune into your emotional state before taking action',
      audioFinished: '✓ Calibration Complete',
      audioListen: 'Listen to Mentor',
      audioPause: 'Pause',
      audioSkip: 'Mark as listened',
      speed: 'Speed',
      hookTitle: 'High-Impact Hook',
      scriptsTitle: '3 Practical Script Examples',
      exposureTitle: 'External Exposure Action',
      reflectionTitle: 'Your Honest Reflection',
      reflectionPlaceholder: 'How did you feel today? Write honestly about the fear, judgment, or victory during this mission...',
      reflectionWarning: 'Write at least a short sentence to validate your progress.',
      videoLinkTitle: 'Your Video/Story Link (Optional)',
      videoLinkPlaceholder: 'E.g., https://instagram.com/stories/...',
      completeBtn: 'Complete Today\'s Mission',
      completeBtnRest: '✓ I Rested & Integrated Today',
      completedBadge: 'Mission Completed',
      restDayQuote: 'Rest is not quitting; it is the silent integration of your courage.',
      restDayDescription: 'Today is a rest day. Your only task is to rest and integrate everything you learned this week. No videos, no cameras, no pressure. Just feel proud of keeping your promises.',
      sosHeading: 'Feeling anxiety or stage fright?',
      sosTrigger: 'Activate Emotional SOS',
      promisesTitle: "Today's Three Promises",
      promisesSubtitle: 'Three small physical actions to break inertia and consolidate your new identity:',
      promise1: 'Break Inertia (Recorded my first 10-second test draft)',
      promise2: 'Build Confidence (Spoke clearly, looking directly into the lens)',
      promise3: 'Create Evidence (Published final video or saved it as proof of action)',
      reflection7Title: 'Your Weekly Growth Reflection',
      reflection7Q1: '1. What surprised you the most about your capacity to act this week?',
      reflection7Q2: '2. What has become visibly easier compared to the first day?',
      reflection7Q3: '3. What exactly are you most proud of about yourself today?',
      autonomyTitle: 'Your Autonomy Level',
      sanctuaryTitle: 'Strategic Rest Sanctuary',
      inhale: 'Inhale...',
      hold: 'Hold...',
      exhale: 'Exhale slowly...',
      rest: 'Stay empty & calm...',
      closeLetter: 'Integrate Council',
      identityHeader: 'Who you proved to be today:'
    },
    es: {
      dailyMission: 'Misión Diaria',
      audioTitle: 'Audio del Mentor',
      audioSub: 'Sintoniza tu estado emocional antes de actuar',
      audioFinished: '✓ Sintonización Completada',
      audioListen: 'Escuchar Mentor',
      audioPause: 'Pausar',
      audioSkip: 'Marcar como escuchado',
      speed: 'Velocidad',
      hookTitle: 'Gancho de Alto Impacto',
      scriptsTitle: '3 Ejemplos de Guiones Prácticos',
      exposureTitle: 'Acción de Exposición Externa',
      reflectionTitle: 'Tu Reflexión Sincera',
      reflectionPlaceholder: '¿Cómo te sentiste hoy? Escribe con honestidad sobre el miedo, juicio o victoria al realizar esta misión...',
      reflectionWarning: 'Escribe al menos una frase corta para validar tu progreso.',
      videoLinkTitle: 'Enlace de tu Video/Story (Opcional)',
      videoLinkPlaceholder: 'Ej: https://instagram.com/stories/...',
      completeBtn: 'Completar Misión del Día',
      completeBtnRest: '✓ Yo Descansé e Integré Hoy',
      completedBadge: 'Misión Integrada',
      restDayQuote: 'El descanso no es rendición; es la integración silenciosa de tu valentía.',
      restDayDescription: 'Hoy es día de descanso. Tu única tarea es relajarte e integrar las lecciones de la semana. Sin publicaciones, sin cámaras, sin presión. Siéntete orgulloso de haber sostenido tus promesas.',
      sosHeading: '¿Sientes ansiedad o miedo en la voz?',
      sosTrigger: 'Activar SOS Emocional',
      promisesTitle: 'Las Tres Promesas de Hoy',
      promisesSubtitle: 'Tres pequeños pasos físicos para romper la inercia y consolidar tu nueva identidad:',
      promise1: 'Romper la Inercia (Grabé mi primer borrador de prueba de 10 segundos)',
      promise2: 'Construir Confianza (Hablé mirando directamente a la lente con presencia)',
      promise3: 'Crear Evidencia (Publiqué mi video final o lo guardé como prueba de consistencia)',
      reflection7Title: 'Tu Reflexión Semanal de Crecimiento',
      reflection7Q1: '1. ¿Qué es lo que más te sorprendió de tu capacidad para actuar esta semana?',
      reflection7Q2: '2. ¿Qué se ha vuelto visiblemente más fácil en relación con el primer día?',
      reflection7Q3: '3. ¿De qué te sientes exactamente más orgulloso de ti mismo hoy?',
      autonomyTitle: 'Tu nivel de autonomía',
      sanctuaryTitle: 'Santuario de Descanso Estratégico',
      inhale: 'Inhala...',
      hold: 'Retén el aire...',
      exhale: 'Exhala despacio...',
      rest: 'Vacío y calma...',
      closeLetter: 'Integrar Consejo',
      identityHeader: 'Quién demostraste ser hoy:'
    }
  }[lang];

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

      {/* Active Day Header Card */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-[2rem] bg-gradient-to-b from-[#251E1C] to-[#1E1715] dark:from-[#1E1715] dark:to-[#17110F] border border-rosegold/15 p-8 sm:p-10 text-white shadow-rosegold"
      >
        <div className="absolute top-0 right-0 h-48 w-48 bg-rosegold/10 blur-3xl rounded-full" />
        <div className="absolute -bottom-10 -left-10 h-48 w-48 bg-rosegold-light/5 blur-3xl rounded-full" />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-gradient-to-r from-rosegold to-rosegold-light text-[9px] uppercase font-sans tracking-[0.2em] rounded-full font-bold shadow-rosegold">
                {textDict.dailyMission} • {currentDay.dayNumber}/30
              </span>
              <span className="px-2.5 py-1 bg-white/10 text-[9px] uppercase font-mono tracking-[0.25em] rounded-full border border-white/5 font-semibold text-accentgold">
                {localizedPhase.title}
              </span>
              {isCompleted && (
                <span className="px-3 py-1 bg-emerald-500/15 text-emerald-400 text-[9px] uppercase font-sans tracking-[0.2em] rounded-full border border-emerald-500/20 font-bold">
                  {textDict.completedBadge}
                </span>
              )}
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-display font-light tracking-tight text-white leading-tight">
              {adaptMessage(currentDay.title[lang] || currentDay.title['pt'], prefGrammar, lang)}
            </h1>
            <p className="text-xs text-rosegold-light font-sans tracking-[0.1em] uppercase font-medium">
              {getDayTypeLabel(currentDay.type, lang)}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {[3, 11, 18, 25].includes(currentDay.dayNumber) && (
              <button
                onClick={() => setShowSurpriseLetter(true)}
                className="p-3.5 rounded-2xl bg-gradient-to-r from-accentgold/20 to-rosegold/20 border border-accentgold/35 text-accentgold animate-pulse hover:scale-105 transition-all cursor-pointer"
                title="Read Mentor's Letter"
              >
                <BookOpen className="h-5 w-5" />
              </button>
            )}

            <button
              onClick={() => onToggleFavorite(currentDay.dayNumber)}
              className={`p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer ${
                isFavorite 
                  ? 'bg-accentgold/15 border-accentgold/40 text-accentgold shadow-rosegold' 
                  : 'bg-white/5 border-white/10 text-rose-200/60 hover:text-white hover:bg-white/10'
              }`}
              title="Favorite Hook"
            >
              <Star className="h-5 w-5 fill-current" />
            </button>
          </div>
        </div>

        {/* Dynamic Progressive Guidance Banner */}
        <div className="mt-6 pt-5 border-t border-white/5 text-xs text-slate-400 font-sans flex items-center gap-3">
          <span className="font-bold text-[9px] uppercase tracking-[0.2em] text-rosegold bg-rosegold/10 px-2 py-0.5 rounded-md shrink-0">
            {textDict.autonomyTitle}:
          </span>
          <span className="italic leading-relaxed text-slate-300">{getProgressiveGuidance()}</span>
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
              {/* STEP 1: Calming Audio Session */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-[2rem] bg-white dark:bg-[#1E1715] border border-rose-100/20 dark:border-rosegold/10 p-6 sm:p-8 shadow-rosegold"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3.5 rounded-2xl transition-all duration-500 ${audioCompleted ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rosegold/15 text-rosegold'}`}>
                    <Volume2 className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-sans tracking-[0.2em] text-rosegold uppercase font-extrabold block mb-1">
                      Step 01 • {textDict.audioTitle}
                    </span>
                    <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 font-sans">
                      {audioCompleted ? textDict.audioFinished : textDict.audioSub}
                    </h3>

                    {/* HTML5 Streaming & Seekable Player */}
                    <div className="mt-5 bg-[#FAF8F5] dark:bg-[#130E0D] border border-rose-100/15 dark:border-rosegold/5 rounded-2xl p-5 shadow-inner">
                      <audio
                        ref={audioRef}
                        src={localizedContent.audioUrl}
                        onTimeUpdate={handleAudioTimeUpdate}
                        onLoadedMetadata={handleAudioLoadedMetadata}
                        onEnded={handleAudioEnded}
                        className="hidden"
                      />
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <button
                          onClick={handlePlayToggle}
                          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                            isPlaying 
                              ? 'bg-slate-800 dark:bg-[#2C221E] text-white shadow-md' 
                              : 'bg-rosegold text-white hover:bg-[#A35D68] shadow-rosegold'
                          }`}
                        >
                          {isPlaying ? (
                            <>
                              <Pause className="h-4 w-4 fill-current" />
                              <span>{textDict.audioPause}</span>
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 fill-current" />
                              <span>{textDict.audioListen}</span>
                            </>
                          )}
                        </button>

                        <div className="flex items-center justify-between sm:justify-end gap-4">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-sans font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{textDict.speed}:</span>
                            {[1, 1.25, 1.5].map((speed) => (
                              <button
                                key={speed}
                                onClick={() => setAudioSpeed(speed)}
                                className={`px-2.5 py-1 text-xs font-sans font-bold rounded-lg transition-all duration-250 cursor-pointer ${
                                  audioSpeed === speed 
                                    ? 'bg-rose-50 dark:bg-rosegold/15 text-rosegold shadow-sm' 
                                    : 'text-slate-500 hover:bg-rose-50/20 dark:hover:bg-rosegold/5'
                                }`}
                              >
                                {speed}x
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Seekable range slider */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-sans text-slate-400 dark:text-slate-500">
                          <span>{formatTime(currentTime)}</span>
                          <span>{formatTime(duration)}</span>
                        </div>

                        <div className="relative group">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="0.1"
                            value={audioProgress}
                            onChange={handleSeekChange}
                            className="w-full h-1.5 bg-rose-100 dark:bg-[#2C221E] rounded-lg appearance-none cursor-pointer accent-rosegold transition-all focus:outline-none"
                          />
                        </div>

                        {/* Force fully listened helper */}
                        {!audioCompleted && (
                          <div className="flex justify-end pt-1">
                            <button
                              onClick={handleFastForwardAudio}
                              className="text-[10px] font-sans text-slate-400 dark:text-slate-500 hover:text-rosegold transition-all cursor-pointer hover:underline"
                            >
                              {textDict.audioSkip}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Custom Adaptive Coach Tip card */}
              <div className="bg-rose-50/15 dark:bg-[#1E1715]/30 border border-rose-100/20 dark:border-rosegold/10 p-6 rounded-[1.5rem] flex gap-4 items-start relative overflow-hidden shadow-sm">
                <div className="text-2xl shrink-0">
                  {guideStyle === 'gentle' ? '🌿' : guideStyle === 'challenger' ? '🔥' : guideStyle === 'strategic' ? '💪' : '✨'}
                </div>
                <div className="space-y-1.5">
                  <span className="text-[9px] font-sans font-bold uppercase tracking-[0.15em] text-rosegold dark:text-rosegold-light">
                    {lang === 'pt' ? 'O Toque de Orientação Personalizado' : lang === 'es' ? 'El Toque de Guía Personalizado' : 'Your Adaptive Mentor Advice'}
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 italic font-medium leading-relaxed font-sans">
                    "{adaptMessage({
                      gentle: {
                        pt: "🌿 Respire fundo. Não se preocupe com a perfeição hoje. Seu maior poder está em dar pequenos passos carinhosos consigo mesma. Você já está segura aqui.",
                        en: "🌿 Breathe deeply. Do not worry about perfection today. Your greatest power lies in taking kind, gentle steps with yourself. You are already safe.",
                        es: "🌿 Respira hondo. No te preocupe por la perfección hoy. Tu mayor poder está em dar pequeños pasos cariñosos contigo misma. Ya estás segura aquí."
                      },
                      challenger: {
                        pt: "🔥 Sem desculpas hoje. Dê o play agora e faça seu teste inicial sem pensar duas vezes. O crítico só morre na ação rápida. Vá lá e mostre seu poder!",
                        en: "🔥 No excuses today. Press play right now and record your test draft without overthinking. The critic only dies in swift action. Go out there and make it happen!",
                        es: "🔥 Sin excusas hoy. Presiona grabar ahora mismo y haz tu primer borrador sin pensarlo dos veces. El crítico solo muere en la acción rápida. ¡Ve y demuestra tu poder!"
                      },
                      strategic: {
                        pt: "💪 Foco no objetivo: gravar por 15 segundos mantendo contato visual com a lente. Execute a tarefa ignorando julgamentos externos secundários. Consistência gera métricas.",
                        en: "💪 Focus on the target: record for 15 seconds maintaining eye-contact with the lens. Complete the task ignoring secondary external judgments. Consistency drives metrics.",
                        es: "💪 Foco en el objetivo: grabar por 15 segundos manteniendo contacto visual con la lente. Ejecuta la tarea ignorando juicios externos secundarios. La consistencia genera métricas."
                      },
                      inspirational: {
                        pt: "✨ Hoje, sintonize com sua alma. Sua voz carrega um propósito único que as pessoas estão esperando para ouvir. Deixe que a verdade flua livremente.",
                        en: "✨ Today, tune in with your soul. Your voice carries a unique purpose that people are waiting to receive. Let your deep truth flow freely through you.",
                        es: "✨ Hoy, sintoniza con tu alma. Tu voz lleva un propósito único que la gente está esperando escuchar. Deja que tu verdad fluya libremente de adentro hacia afuera."
                      }
                    }[guideStyle as 'gentle' | 'challenger' | 'strategic' | 'inspirational']?.[lang] || "Your guide is here.", prefGrammar, lang)}"
                  </p>
                </div>
              </div>

              {/* STEP 2: High-Impact Hook */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-[2rem] bg-white dark:bg-[#1E1715] border border-rose-100/20 dark:border-rosegold/10 p-6 sm:p-8 shadow-rosegold space-y-5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-sans tracking-[0.2em] text-rosegold uppercase font-bold">
                    Step 02 • {textDict.hookTitle}
                  </span>
                  
                  <button
                    onClick={() => copyToClipboard(localizedContent.hook, true)}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rosegold transition-colors duration-250 cursor-pointer hover:scale-105"
                  >
                    {copiedHook ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-emerald-500 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-6 rounded-2xl bg-gradient-to-br from-rose-50/10 via-[#FAF8F5] to-rose-50/5 dark:from-[#2C221E]/10 dark:to-rosegold/5 border border-rose-100/15 dark:border-rosegold/10 shadow-sm">
                  <p className="text-slate-800 dark:text-slate-100 font-display text-lg sm:text-xl italic leading-relaxed">
                    "{localizedContent.hook}"
                  </p>
                </div>
              </motion.div>

              {/* STEP 3: 3 Practical Script Examples */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-[2rem] bg-white dark:bg-[#1E1715] border border-rose-100/20 dark:border-rosegold/10 p-6 sm:p-8 shadow-rosegold space-y-5"
              >
                <div className="flex items-center justify-between pb-2 border-b border-rose-100/15 dark:border-rosegold/5">
                  <span className="text-[9px] font-sans tracking-[0.2em] text-rosegold uppercase font-bold">
                    Step 03 • {textDict.scriptsTitle}
                  </span>
                </div>

                {/* Custom layout scripts tabs */}
                <div className="flex gap-1.5 bg-rose-50/30 dark:bg-rosegold/5 p-1.5 rounded-xl">
                  {localizedContent.scripts.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveScriptTab(idx)}
                      className={`flex-1 py-2 rounded-lg text-xs font-sans font-semibold transition-all duration-300 cursor-pointer ${
                        activeScriptTab === idx 
                          ? 'bg-rosegold text-white shadow-sm' 
                          : 'text-slate-500 hover:text-rosegold hover:bg-rose-50/50'
                      }`}
                    >
                      Option {idx + 1}
                    </button>
                  ))}
                </div>

                <div className="p-5 rounded-2xl bg-slate-50/50 dark:bg-[#130E0D] border border-rose-100/10 shadow-inner">
                  <pre className="text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                    {localizedContent.scripts[activeScriptTab]}
                  </pre>
                  
                  <div className="flex justify-end mt-4 pt-3 border-t border-rose-100/5">
                    <button
                      onClick={() => copyToClipboard(localizedContent.scripts[activeScriptTab], false, activeScriptTab)}
                      className="flex items-center gap-1.5 text-xs font-sans text-slate-500 hover:text-rosegold transition-colors duration-250 cursor-pointer font-bold"
                    >
                      {copiedScriptIndex === activeScriptTab ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                          <span className="text-emerald-500">Copied Option</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy Script</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
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
                    Step 04 • {textDict.exposureTitle}
                  </span>
                </div>
                
                <div className="p-6 rounded-2xl bg-gradient-to-br from-rose-50/15 to-rose-50/5 dark:from-[#2C221E]/10 dark:to-rosegold/5 border border-rose-100/15 dark:border-rosegold/10 shadow-sm">
                  <p className="text-slate-800 dark:text-slate-200 text-sm font-sans leading-relaxed">
                    {localizedContent.exposureAction}
                  </p>
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
                  <label className="flex items-start gap-3.5 p-4 bg-white dark:bg-[#1E1715] rounded-2xl border border-rose-100/10 cursor-pointer hover:bg-amber-50/30 dark:hover:bg-rosegold/5 transition-all duration-300 select-none shadow-xs">
                    <input
                      type="checkbox"
                      checked={promisesChecked.inertia}
                      disabled={isCompleted}
                      onChange={(e) => setPromisesChecked(p => ({ ...p, inertia: e.target.checked }))}
                      className="mt-0.5 h-4.5 w-4.5 rounded-md text-rosegold border-slate-300 focus:ring-rosegold transition-all duration-300"
                    />
                    <div className="text-xs font-sans">
                      <span className="font-semibold text-slate-700 dark:text-slate-200 block">Promise 1: Break Inertia</span>
                      <span className="text-slate-500 dark:text-slate-400 block mt-1 leading-relaxed">{textDict.promise1}</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3.5 p-4 bg-white dark:bg-[#1E1715] rounded-2xl border border-rose-100/10 cursor-pointer hover:bg-amber-50/30 dark:hover:bg-rosegold/5 transition-all duration-300 select-none shadow-xs">
                    <input
                      type="checkbox"
                      checked={promisesChecked.confidence}
                      disabled={isCompleted}
                      onChange={(e) => setPromisesChecked(p => ({ ...p, confidence: e.target.checked }))}
                      className="mt-0.5 h-4.5 w-4.5 rounded-md text-rosegold border-slate-300 focus:ring-rosegold transition-all duration-300"
                    />
                    <div className="text-xs font-sans">
                      <span className="font-semibold text-slate-700 dark:text-slate-200 block">Promise 2: Build Confidence</span>
                      <span className="text-slate-500 dark:text-slate-400 block mt-1 leading-relaxed">{textDict.promise2}</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3.5 p-4 bg-white dark:bg-[#1E1715] rounded-2xl border border-rose-100/10 cursor-pointer hover:bg-amber-50/30 dark:hover:bg-rosegold/5 transition-all duration-300 select-none shadow-xs">
                    <input
                      type="checkbox"
                      checked={promisesChecked.evidence}
                      disabled={isCompleted}
                      onChange={(e) => setPromisesChecked(p => ({ ...p, evidence: e.target.checked }))}
                      className="mt-0.5 h-4.5 w-4.5 rounded-md text-rosegold border-slate-300 focus:ring-rosegold transition-all duration-300"
                    />
                    <div className="text-xs font-sans">
                      <span className="font-semibold text-slate-700 dark:text-slate-200 block">Promise 3: Create Evidence</span>
                      <span className="text-slate-500 dark:text-slate-400 block mt-1 leading-relaxed">{textDict.promise3}</span>
                    </div>
                  </label>
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
                {isRestDay ? 'Status' : 'Progress Lock'}
              </h3>
              
              {!isRestDay && (
                <div className="space-y-3">
                  {/* Validation checkmark widgets */}
                  <div className="flex items-center justify-between text-xs bg-[#FAF8F5] dark:bg-[#130E0D] border border-rose-100/10 p-4 rounded-xl shadow-xs">
                    <span className="text-slate-600 dark:text-slate-300 font-semibold font-sans">1. Listen to Mentor Session</span>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-sans font-bold uppercase tracking-wider ${
                      audioCompleted 
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-rose-50 dark:bg-rosegold/15 text-rosegold'
                    }`}>
                      {audioCompleted ? 'Completed' : 'Pending'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs bg-[#FAF8F5] dark:bg-[#130E0D] border border-rose-100/10 p-4 rounded-xl shadow-xs">
                    <span className="text-slate-600 dark:text-slate-300 font-semibold font-sans">2. Today's 3 Promises</span>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-sans font-bold uppercase tracking-wider ${
                      allPromisesKept 
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-amber-500/15 text-accentgold'
                    }`}>
                      {allPromisesKept ? 'Completed' : 'Pending'}
                    </span>
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
                    <p className="font-bold text-accentgold not-italic uppercase tracking-widest text-[9px]">{localizedPhase.title} Reflection Moment:</p>
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

                {/* Optional Social Link */}
                <div className="space-y-2 pt-1">
                  <label className="block text-xs font-sans text-slate-500 font-bold uppercase tracking-wider">
                    {textDict.videoLinkTitle}
                  </label>
                  <input
                    type="url"
                    value={videoUrlInput}
                    onChange={(e) => setVideoUrlInput(e.target.value)}
                    placeholder={textDict.videoLinkPlaceholder}
                    disabled={isCompleted}
                    className="w-full text-xs bg-[#FAF8F5] dark:bg-[#130E0D] border border-rose-100/20 dark:border-rosegold/10 focus:border-rosegold focus:outline-none focus:ring-1 focus:ring-rosegold rounded-xl p-3.5 text-slate-700 dark:text-slate-200 transition-all duration-300"
                  />
                </div>

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
                      const isDisabled = isCompleted;

                      return (
                        <button
                          key={moodKey}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => setSelectedMood(moodKey)}
                          className={`flex-1 flex flex-col items-center gap-1.5 py-3 px-1 rounded-xl text-center border border-transparent transition-all duration-300 cursor-pointer select-none ${
                            isSelected ? info.active : `${info.color} text-slate-500`
                          } ${isDisabled ? 'cursor-not-allowed opacity-80' : ''} hover:scale-105`}
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
                        <span>{lang === 'pt' ? 'Sessão de Mentoria Concluída' : lang === 'es' ? 'Sesión de Mentoría Completada' : 'Mentoring Session Completed'}</span>
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
                onClick={() => onCompleteDay(reflectionInput, videoUrlInput, selectedMood || 'neutral')}
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
            className="rounded-[1.5rem] border border-rose-150/40 dark:border-rosegold/15 bg-[#251E1C]/5 dark:bg-[#1C1513]/30 p-5 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 rounded-xl bg-rosegold/10 text-rosegold shrink-0">
                <Heart className="h-4.5 w-4.5 fill-current text-rosegold animate-pulse" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate font-sans tracking-wide">
                  {textDict.sosHeading}
                </h4>
              </div>
            </div>
            <button
              onClick={onTriggerSos}
              className="shrink-0 px-4 py-2 rounded-xl bg-rosegold hover:bg-[#A35D68] text-[10px] font-sans font-bold uppercase tracking-wider text-white transition-all duration-300 cursor-pointer shadow-rosegold animate-pulse"
            >
              {textDict.sosTrigger}
            </button>
          </motion.div>

        </div>

      </div>
    </div>
  );
}
