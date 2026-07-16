/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Wind, ArrowLeft, ShieldCheck, Sparkles, UserCheck, HelpCircle, AlertCircle, PhoneCall, RefreshCw, BookOpen } from 'lucide-react';
import { Language, UserProgress } from '../types';
import { adaptMessage, resolveGrammarPreference } from '../utils/grammar';

interface EmotionalSosViewProps {
  lang: Language;
  onBackToMission: () => void;
  progress?: UserProgress;
  onUpdateProgress?: (updated: UserProgress) => void;
}

type BreathingState = 'idle' | 'inhale' | 'hold1' | 'exhale' | 'hold2';
type SosStage = 'breathing' | 'categorySelect' | 'messageReveal' | 'feedback' | 'alternative';

export default function EmotionalSosView({ 
  lang, 
  onBackToMission,
  progress,
  onUpdateProgress
}: EmotionalSosViewProps) {
  const prefGrammar = resolveGrammarPreference(progress?.grammarPreference);
  const [stage, setStage] = useState<SosStage>('breathing');
  const [breathState, setBreathState] = useState<BreathingState>('idle');
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [feedbackResult, setFeedbackResult] = useState<'yes' | 'not_yet' | null>(null);
  const [chosenAltResource, setChosenAltResource] = useState<'letter' | 'breathing' | 'support' | null>(null);

  // Box Breathing cycle: 4 seconds each phase (extremely slow, calming pacing)
  useEffect(() => {
    if (breathState === 'idle') return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // Switch states
          let nextState: BreathingState = 'idle';
          setBreathState((currentState) => {
            switch (currentState) {
              case 'inhale': 
                nextState = 'hold1';
                return 'hold1';
              case 'hold1': 
                nextState = 'exhale';
                return 'exhale';
              case 'exhale': 
                nextState = 'hold2';
                return 'hold2';
              case 'hold2': 
                nextState = 'inhale';
                setCyclesCompleted(c => c + 1);
                return 'inhale';
              default: return 'idle';
            }
          });
          return 4; // Reset phase duration
        }
        return prev - 1;
      });
    }, 1200); // 1.2s intervals to feel slower and calmer

    return () => clearInterval(timer);
  }, [breathState]);

  const handleStartBreathing = () => {
    setBreathState('inhale');
    setSecondsLeft(4);
  };

  const handleStopBreathing = () => {
    setBreathState('idle');
  };

  // Translations and dynamic responses
  const localText = {
    pt: {
      breathingTitle: 'Santuário de Respiração Consciente',
      breathingDesc: 'Sua respiração é a sua única âncora física agora. Antes de ler qualquer conselho, traga sua presença para o momento presente.',
      breathingCta: 'Iniciar Ciclo de Respiração',
      breathingStop: 'Pausar Respiração',
      breathingCycles: 'Ciclos concluídos: {count}',
      breathingProceed: 'Respirei. Ver Mensagens de Sintonização',
      breathingProceedHint: 'Recomendamos completar pelo menos 1 ciclo completo antes de prosseguir.',
      back: 'Sair do SOS',
      categoryTitle: 'O que está travando você agora?',
      categoryDesc: 'Escolha o ponto de fricção que mais ressoa com o seu sentimento neste momento.',
      revealTitle: 'Sintonização de Alinhamento',
      feedbackQ: 'Esta mensagem te ajudou?',
      feedbackYes: 'Sim, ajudou',
      feedbackNo: 'Ainda não',
      feedbackSuccess: 'Que bom. Estamos juntos nessa jornada. Volte sempre que precisar de um porto seguro.',
      altTitle: 'Nós salvamos o seu lugar.',
      altDesc: 'Tudo bem não se sentir 100% [pronta/pronto/pronte] ainda. Sua evolução é única. Escolha outra ferramenta de acolhimento:',
      altOptionBreathing: 'Realizar mais uma rodada de respiração',
      altOptionLetter: 'Ler Carta de Acolhimento da Renata',
      altOptionSupport: 'Contatar Suporte de Coragem',
      letterTitle: 'Uma Carta para Você',
      letterClose: 'Concluir Sintonização',
      supportTitle: 'Suporte de Coragem',
      supportDesc: 'Se precisar de um toque extra, sinta-se à vontade para nos enviar um e-mail ou agendar uma mentoria rápida. Estamos aqui com você.',
      supportEmail: 'E-mail de Apoio: renaser@apoio.com',
      inhale: 'Inspire...',
      hold1: 'Prenda o Ar...',
      exhale: 'Expire devagar...',
      hold2: 'Mantenha Vazio...',
      idle: 'Respire fundo...'
    },
    en: {
      breathingTitle: 'Conscious Breathing Sanctuary',
      breathingDesc: 'Your breath is your only physical anchor right now. Before reading any guidance, bring your full presence to the moment.',
      breathingCta: 'Start Breathing Cycle',
      breathingStop: 'Pause Breathing',
      breathingCycles: 'Cycles completed: {count}',
      breathingProceed: 'I Breathed. See Tuning Messages',
      breathingProceedHint: 'We recommend completing at least 1 full cycle before proceeding.',
      back: 'Exit SOS',
      categoryTitle: 'What is blocking you right now?',
      categoryDesc: 'Select the friction point that most matches your current state of mind.',
      revealTitle: 'Alignment Tuning',
      feedbackQ: 'Did this message help you?',
      feedbackYes: 'Yes, it helped',
      feedbackNo: 'Not yet',
      feedbackSuccess: 'Excellent. We are together in this. Return here whenever you need a safe harbor.',
      altTitle: 'We saved your place.',
      altDesc: 'It is okay not to feel 100% ready yet. Your pace is unique. Choose another calming resource:',
      altOptionBreathing: 'Do another round of breathing',
      altOptionLetter: "Read Renata's Letter of Comfort",
      altOptionSupport: 'Access Courage Support',
      letterTitle: 'A Letter for You',
      letterClose: 'Complete Tuning',
      supportTitle: 'Courage Support',
      supportDesc: 'If you need extra care, feel free to write to us or schedule a quick 1-on-1. We are with you.',
      supportEmail: 'Support Email: support@renaser.com',
      inhale: 'Inhale...',
      hold1: 'Hold Breath...',
      exhale: 'Exhale slowly...',
      hold2: 'Stay Empty...',
      idle: 'Breathe deep...'
    },
    es: {
      breathingTitle: 'Santuario de Respiración Consciente',
      breathingDesc: 'Tu respiración es tu única ancla física ahora. Antes de leer cualquier consejo, trae tu presencia al momento presente.',
      breathingCta: 'Iniciar Ciclo Respiratorio',
      breathingStop: 'Pausar Respiración',
      breathingCycles: 'Ciclos completados: {count}',
      breathingProceed: 'Ya respiré. Ver Mensajes de Apoyo',
      breathingProceedHint: 'Recomendamos completar al menos 1 ciclo antes de continuar.',
      back: 'Salir del SOS',
      categoryTitle: '¿Qué te está deteniendo ahora?',
      categoryDesc: 'Elige el punto de fricción que más resuena con tu sentimiento en este momento.',
      revealTitle: 'Sintonización de Alineación',
      feedbackQ: '¿Te ayudó este mensaje?',
      feedbackYes: 'Sí, me ayudó',
      feedbackNo: 'Aún no',
      feedbackSuccess: 'Qué bueno. Estamos juntos en este camino. Vuelve siempre que necesites un puerto seguro.',
      altTitle: 'Nosotros guardamos tu lugar.',
      altDesc: 'Está bien no sentirse 100% [lista/listo/liste] todavía. Tu evolución es única. Elige otra herramienta de apoyo:',
      altOptionBreathing: 'Hacer otra ronda de respiración',
      altOptionLetter: 'Leer Carta de Apoyo de Renata',
      altOptionSupport: 'Contactar Soporte de Coraje',
      letterTitle: 'Una Carta para Ti',
      letterClose: 'Concluir Sintonización',
      supportTitle: 'Soporte de Coraje',
      supportDesc: 'Si necesitas un toque extra, no dudes en escribirnos un correo electrónico. Estamos aquí contigo.',
      supportEmail: 'E-mail de Apoyo: soporte@renaser.com',
      inhale: 'Inhala...',
      hold1: 'Retén el Aire...',
      exhale: 'Exhala despacio...',
      hold2: 'Mantente Vacío...',
      idle: 'Respira hondo...'
    }
  }[lang];

  // Specific Deep Copywriting Guidance Messages
  const sosGuidance = {
    pt: {
      fear: {
        title: 'Medo de aparecer / Gravar',
        text: 'Você não precisa ser [perfeita/perfeito/perfeite] para ser [ouvida/ouvido/ouvide]. A perfeição é apenas uma máscara invisível que usamos para tentar evitar rejeição. Mas as pessoas reais não se conectam com robôs polidos. Elas se conectam com a sua honestidade emocional. Dê a [si mesma/si mesmo/si mesme] permissão para gaguejar, para errar, para ser [humana/humano/humane]. Sua história tem valor exatamente como ela é hoje.'
      },
      impostor: {
        title: 'Síndrome do Impostor',
        text: 'O fato de você sentir que é [uma impostora/um impostor/uma impostore] prova que você se importa profundamente com o valor que entrega aos outros. Charlatões nunca têm a síndrome do impostor. Você não está fingindo; você está simplesmente cruzando a fronteira de uma nova fase da sua identidade. É natural sentir medo ao crescer. Se posicione no seu lugar de direito.'
      },
      panic: {
        title: 'Pânico Pré-Gravação',
        text: 'Sua garganta travando é apenas o seu sistema nervoso interpretando a lente da câmera como uma ameaça de exclusão social. Seu cérebro está tentando te proteger do julgamento alheio. Agradeça a ele por te proteger, mas diga suavemente: "Está tudo seguro. Eu domino essa presença." Faça mais um ciclo respiratório lento e fale olhando apenas para o pontinho da câmera.'
      },
      judgment: {
        title: 'Medo de Julgamentos Externos',
        text: 'O julgamento das outras pessoas fala inteiramente sobre a realidade e os limites delas, não sobre a sua competência ou o seu coração. Quem critica, geralmente critica para projetar suas próprias inibições ou frustrações. As pessoas que você deseja verdadeiramente ajudar estão esperando ansiosamente que você apareça para falar com elas.'
      },
      overwhelm: {
        title: 'Sensação de Sobrecarga',
        text: 'Nós guardamos o seu lugar. Vá no seu ritmo. O descanso também é parte da jornada de crescimento, não um sinal de falha. Se hoje você não consegue gravar, está tudo bem. Apenas cumpra a promessa de se acolher e escutar a mensagem da Renata. Respire fundo, reduza as expectativas para hoje e continue amanhã.'
      }
    },
    en: {
      fear: {
        title: 'Fear of showing up / Recording',
        text: 'You do not need to be perfect to be heard. Perfection is simply an invisible mask we wear to avoid rejection. But real people don\'t connect with polished robots. They connect with your emotional honesty. Give yourself permission to stutter, to make mistakes, to be human. Your story has value exactly as it is today.'
      },
      impostor: {
        title: 'Imposter Syndrome',
        text: 'The fact that you feel like an imposter proves that you care deeply about the value you deliver to others. Con artists never experience imposter syndrome. You are not pretending; you are simply crossing the boundary into a new phase of your identity. It is natural to feel fear when growing. Claim your rightful place.'
      },
      panic: {
        title: 'Pre-recording Panic',
        text: 'Your tight throat is just your nervous system interpreting the camera lens as a social exclusion threat. Your brain is trying to protect you from judgment. Thank it for protecting you, but say gently: "Everything is safe. I own this presence." Take another slow breath and speak looking only at the camera dot.'
      },
      judgment: {
        title: 'Anxiety About External Judgment',
        text: 'Other people\'s judgment speaks entirely about their own reality and limitations, not your competence or your heart. Those who criticize are usually projecting their own inhibitions or frustrations. The people you are truly meant to serve are waiting eagerly for you to show up and speak up.'
      },
      overwhelm: {
        title: 'Feeling Overwhelmed',
        text: "We saved your place. Go at your own pace. Rest is also a part of the growth journey, not a sign of failure. If you cannot record today, that is completely fine. Just keep the promise to cuddle yourself and listen to Renata's message. Breathe deeply, lower your expectations for today, and resume tomorrow."
      }
    },
    es: {
      fear: {
        title: 'Miedo de mostrarse / Grabar',
        text: 'No necesitas ser [perfecta/perfecto/perfecte] para ser [escuchada/escuchado/escuchade]. La perfección es solo una máscara invisible que usamos para tratar de evitar el rechazo. Pero la gente real no se conecta con robots pulidos. Se conecta con tu honestidad emocional. Date permiso para tartamudear, equivocarte, ser [humana/humano/humane]. Tu historia tiene valor exactamente como es hoy.'
      },
      impostor: {
        title: 'Síndrome del Impostor',
        text: 'El hecho de que te sientas como [una impostora/un impostor/une impostore] demuestra que te importa profundamente el valor que entregas a los demás. Los charlatanes nunca tienen el síndrome del impostor. No estás fingiendo; simplemente estás cruzando la frontera de una nueva fase de tu identidad. Es natural sentir miedo al crecer. Reclama tu lugar.'
      },
      panic: {
        title: 'Pánico Pre-Grabación',
        text: 'Tu garganta tensa es solo tu sistema nervioso interpretando la lente de la cámara como una amenaza de exclusión social. Tu cerebro intenta protegerte del juicio. Agradécele por protegerte, pero dile suavemente: "Todo está a salvo. Yo domino esta presencia." Haz otra respiración lenta y habla mirando solo al punto de la cámara.'
      },
      judgment: {
        title: 'Miedo al Juicio Externo',
        text: 'El juicio de otras personas habla enteramente sobre su propia realidad y límites, no sobre tu competencia o tu corazón. Quienes critican suelen proyectar sus propias inhibiciones o frustraciones. Las personas que realmente quieres ayudar están esperando ansiosamente que te muestres para hablarles.'
      },
      overwhelm: {
        title: 'Sensación de Sobrecarga',
        text: 'Nosotros guardamos tu lugar. Ve a tu propio ritmo. El descanso también es parte del viaje de crecimiento, no una señal de fracaso. Si hoy no puedes grabar, está bien. Cumple la promesa de abrazarte y escuchar el mensaje de Renata. Respira hondo, reduce las expectativas para hoy y continúa mañana.'
      }
    }
  }[lang];

  // Specific Letter of Comfort from Creator
  const comfortLetter = {
    pt: `Querida alma,\n\nSe você está lendo isso, por favor, coloque as mãos sobre o coração por um segundo. Sinta o bater do seu peito. Esse ritmo é real, é o seu corpo apoiando você.\n\nVocê não está [atrasada/atrasado/atrasade]. Você não falhou. Nós guardamos o seu lugar com todo o respeito. Não existe fracasso em precisar de uma pausa; o verdadeiro erro é fingir força quando seu corpo e alma gritam por descanso.\n\nA jornada RenaSer não é sobre virar um gerador automático de vídeos perfeitos. É sobre visibilidade real. E a primeira pessoa que precisa ver você, respeitar seus limites e abraçar seu ritmo é [você mesma/você mesmo/você mesme].\n\nBeba um copo d'água. Sinta a terra sob seus pés. Quando estiver [pronta/pronto/pronte], o portal estará aqui, exatamente do jeito que você o deixou.\n\nCom carinho,\nSua mentora, Renata`,
    en: `Dear soul,\n\nIf you are reading this, please place your hands on your heart for a second. Feel your chest rise and fall. This rhythm is real; it is your body supporting you.\n\nYou are not late. You haven't failed. We saved your place with deep respect. There is no failure in needing a pause; the real mistake is pretending to be strong when your body and soul cry for rest.\n\nThe RenaSer journey is not about becoming an automatic producer of perfect videos. It is about true visibility. And the first person who needs to see you, respect your boundaries, and embrace your pace is yourself.\n\nDrink a glass of water. Feel the ground beneath your feet. When you are ready, the portal will be here, exactly as you left it.\n\nWith love,\nYour mentor, Renata`,
    es: `Querida alma,\n\nSi estás leyendo esto, por favor coloca tus manos sobre tu corazón por un segundo. Siente el latido de tu pecho. Este ritmo es real, es tu cuerpo apoyándote.\n\nNo vas tarde. No has fallado. Guardamos tu lugar con absoluto respeto. No hay fracaso en necesitar una pausa; el verdadero error es fingir fuerza cuando tu cuerpo y alma gritan por descanso.\n\nEl viaje RenaSer no se trata de convertirte en un generador automático de videos perfectos. Se trata de visibilidad real. Y la primera persona que necesita verte, respetar tus límites y abrazar tu ritmo eres [tú misma/tú mismo/tú misme].\n\nBebe un vaso de agua. Siente la tierra bajo tus pies. Cuando estés [lista/listo/liste], el portal estará aquí, exactamente como lo dejaste.\n\nCon cariño,\nTu mentora, Renata`
  }[lang];

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    setStage('messageReveal');
  };

  const handleFeedback = (helped: boolean) => {
    setFeedbackResult(helped ? 'yes' : 'not_yet');
    
    // Save to userProgress if available
    if (progress && onUpdateProgress) {
      const sosCount = (progress.behaviorStats?.sosOpenedCount || 0) + 1;
      const updatedCheckins = [...(progress.sosCheckins || [])];
      updatedCheckins.push({
        date: new Date().toISOString(),
        emotion: selectedCategory || 'general',
        breathingHelpful: helped ? 'yes' : 'no'
      });

      onUpdateProgress({
        ...progress,
        sosCheckins: updatedCheckins,
        behaviorStats: {
          ...(progress.behaviorStats || {
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
          }),
          sosOpenedCount: sosCount,
          alternativeResourcesTriggered: !helped
        }
      });
    }

    if (helped) {
      setStage('feedback');
    } else {
      setStage('alternative');
    }
  };

  const handleAlternative = (alt: 'breathing' | 'letter' | 'support') => {
    setChosenAltResource(alt);
    if (alt === 'breathing') {
      // restart breathing stage
      setCyclesCompleted(0);
      setBreathState('idle');
      setStage('breathing');
      setFeedbackResult(null);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[45] bg-[#16110F] text-[#FAF6F0] flex flex-col justify-between p-6 pb-28 lg:pb-6 overflow-y-auto select-none font-sans"
    >
      {/* Background Soft Serene Ambient Glow */}
      <div className="absolute top-1/4 left-1/4 h-80 w-80 bg-rosegold/5 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-80 w-80 bg-[#D4AF37]/5 blur-3xl rounded-full pointer-events-none" />

      {/* Top Bar with Silent Back link */}
      <div className="max-w-3xl w-full mx-auto flex items-center justify-between pb-4 relative z-10">
        <button
          onClick={onBackToMission}
          className="flex items-center gap-2 text-xs font-sans text-stone-400 hover:text-white transition duration-300 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{localText.back}</span>
        </button>

        <span className="text-[10px] font-mono tracking-widest text-[#D4AF37] uppercase font-bold">
          Santuário de Apoio RenaSer
        </span>
      </div>

      {/* MAIN CONTAINER BODY */}
      <div className="max-w-xl w-full mx-auto flex-1 flex flex-col justify-center py-6 relative z-10">
        
        <AnimatePresence mode="wait">
          
          {/* STAGE 1: BREATHING PORTAL FIRST (Mandatory or highly prioritized) */}
          {stage === 'breathing' && (
            <motion.div
              key="breathing"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-8 text-center"
            >
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-mono tracking-widest text-rosegold font-bold block">
                  Sintonização Respiratória
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-light text-white leading-tight lowercase">
                  {localText.breathingTitle}
                </h2>
                <p className="text-xs sm:text-sm text-stone-400 max-w-sm mx-auto leading-relaxed">
                  {localText.breathingDesc}
                </p>
              </div>

              {/* Glowing Slow Breathing Circle */}
              <div className="flex flex-col items-center justify-center space-y-6 py-4">
                <div className="relative flex items-center justify-center">
                  <motion.div
                    animate={{
                      scale: 
                        breathState === 'inhale' ? 1.45 : 
                        breathState === 'hold1' ? 1.45 : 
                        breathState === 'exhale' ? 1.0 : 
                        breathState === 'hold2' ? 1.0 : 1.0,
                      opacity: breathState === 'idle' ? 0.35 : 1
                    }}
                    transition={{
                      duration: breathState === 'idle' ? 2 : 4.8,
                      ease: "easeInOut",
                      repeat: breathState === 'idle' ? Infinity : 0
                    }}
                    className={`h-32 w-32 rounded-full flex flex-col items-center justify-center relative transition-colors duration-700 ${
                      breathState === 'inhale' ? 'bg-rosegold/20 ring-4 ring-rosegold/10' :
                      breathState === 'hold1' ? 'bg-[#D4AF37]/15 ring-4 ring-[#D4AF37]/10' :
                      breathState === 'exhale' ? 'bg-amber-600/15 ring-4 ring-amber-600/10' :
                      breathState === 'hold2' ? 'bg-slate-800/25 ring-4 ring-slate-800/10' :
                      'bg-rosegold/10 border border-rosegold/20'
                    }`}
                  >
                    {breathState !== 'idle' ? (
                      <>
                        <span className="text-3xl font-serif font-bold text-white mb-0.5">
                          {secondsLeft}s
                        </span>
                        <span className="text-[9px] font-mono tracking-widest text-[#D4AF37] uppercase font-bold">
                          {localText[breathState]}
                        </span>
                      </>
                    ) : (
                      <Wind className="h-7 w-7 text-stone-400 animate-pulse" />
                    )}
                  </motion.div>

                  {/* Gentle Ripple Bounds */}
                  <div className="absolute h-44 w-44 border border-white/5 rounded-full pointer-events-none" />
                </div>

                {breathState !== 'idle' && (
                  <span className="text-xs font-mono text-stone-400">
                    {localText.breathingCycles.replace('{count}', cyclesCompleted.toString())}
                  </span>
                )}
              </div>

              {/* Action Trigger Buttons */}
              <div className="space-y-4 max-w-xs mx-auto">
                {breathState === 'idle' ? (
                  <button
                    onClick={handleStartBreathing}
                    className="w-full py-3 bg-rosegold hover:bg-rosegold/90 text-white rounded-2xl text-xs font-sans font-bold tracking-widest uppercase transition-all duration-300 shadow-lg shadow-rosegold/10 cursor-pointer"
                  >
                    {localText.breathingCta}
                  </button>
                ) : (
                  <button
                    onClick={handleStopBreathing}
                    className="w-full py-3 bg-stone-900 border border-stone-800 text-stone-300 rounded-2xl text-xs font-sans font-bold tracking-widest uppercase transition-all cursor-pointer"
                  >
                    {localText.breathingStop}
                  </button>
                )}

                {/* Transition Proceed button */}
                <div className="pt-2">
                  <button
                    onClick={() => setStage('categorySelect')}
                    className={`w-full py-3 rounded-2xl text-xs font-sans font-bold tracking-widest uppercase transition-all duration-500 cursor-pointer ${
                      cyclesCompleted >= 1 
                        ? 'bg-[#D4AF37] text-stone-950 shadow-lg shadow-[#D4AF37]/20 font-extrabold'
                        : 'bg-white/5 border border-white/10 text-stone-300 hover:bg-white/10'
                    }`}
                  >
                    {localText.breathingProceed}
                  </button>
                  {cyclesCompleted < 1 && (
                    <p className="text-[9px] text-stone-500 mt-2 italic">
                      {localText.breathingProceedHint}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* STAGE 2: CATEGORY SELECT POINT */}
          {stage === 'categorySelect' && (
            <motion.div
              key="category"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.6 }}
              className="space-y-6 text-left"
            >
              <div className="space-y-2 text-center pb-2">
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#D4AF37] font-bold block">
                  Identificação do Sentimento
                </span>
                <h2 className="text-xl sm:text-2xl font-serif text-white leading-snug">
                  {localText.categoryTitle}
                </h2>
                <p className="text-xs text-stone-400">
                  {localText.categoryDesc}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 max-w-md mx-auto">
                {Object.entries(sosGuidance).map(([key, item]) => (
                  <button
                    key={key}
                    onClick={() => handleSelectCategory(key)}
                    className="w-full text-left p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-[#D4AF37]/5 hover:border-[#D4AF37]/25 text-stone-200 transition-all duration-300 flex items-center justify-between group cursor-pointer"
                  >
                    <div className="space-y-0.5">
                      <span className="text-xs font-sans font-bold tracking-wide group-hover:text-white transition duration-200">
                        {item.title}
                      </span>
                    </div>
                    <span className="text-[#D4AF37] opacity-0 group-hover:opacity-100 transition duration-300 text-sm">→</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STAGE 3: MESSAGE REVEAL */}
          {stage === 'messageReveal' && selectedCategory && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.6 }}
              className="space-y-8 text-center"
            >
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-widest text-rosegold font-bold block">
                  {localText.revealTitle}
                </span>
                <h2 className="text-xl sm:text-2xl font-serif text-[#FAF6F0] font-light uppercase">
                  {sosGuidance[selectedCategory as keyof typeof sosGuidance]?.title}
                </h2>
              </div>

              {/* Richly designed copywriting box */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.02] border border-white/5 font-serif italic text-stone-200 text-base sm:text-lg leading-relaxed text-left border-l-4 border-l-[#D4AF37] max-w-lg mx-auto shadow-inner relative overflow-hidden">
                <div className="absolute top-0 right-0 h-16 w-16 bg-rosegold/5 blur-xl rounded-full" />
                <p className="relative z-10 whitespace-pre-wrap">
                  "{adaptMessage(sosGuidance[selectedCategory as keyof typeof sosGuidance]?.text || '', prefGrammar, lang)}"
                </p>
              </div>

              {/* EVALUATION QUESTION */}
              <div className="space-y-4 pt-4 border-t border-white/5 max-w-sm mx-auto">
                <p className="text-xs font-sans text-stone-400 font-bold uppercase tracking-wider">
                  {localText.feedbackQ}
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleFeedback(true)}
                    className="py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-stone-950 text-xs font-sans font-extrabold tracking-wider uppercase rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>{localText.feedbackYes}</span>
                  </button>

                  <button
                    onClick={() => handleFeedback(false)}
                    className="py-3 px-4 bg-white/5 border border-white/10 hover:bg-white/10 text-stone-200 text-xs font-sans font-bold tracking-wider uppercase rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <HelpCircle className="h-4 w-4" />
                    <span>{localText.feedbackNo}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STAGE 4: FEEDBACK SUCCESS */}
          {stage === 'feedback' && (
            <motion.div
              key="feedback-success"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-6 max-w-md mx-auto"
            >
              <div className="w-14 h-14 bg-[#D4AF37]/10 text-[#D4AF37] rounded-full mx-auto flex items-center justify-center border border-[#D4AF37]/20">
                <Sparkles className="h-6 w-6 animate-pulse" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-serif text-[#FAF6F0] lowercase">
                  Sintonização realizada
                </h3>
                <p className="text-sm text-stone-300 leading-relaxed font-sans">
                  {localText.feedbackSuccess}
                </p>
              </div>

              <div className="pt-4">
                <button
                  onClick={onBackToMission}
                  className="px-6 py-3 bg-rosegold hover:bg-rosegold/90 text-white rounded-xl text-xs font-sans font-bold tracking-widest uppercase transition cursor-pointer"
                >
                  Voltar para o Portal
                </button>
              </div>
            </motion.div>
          )}

          {/* STAGE 5: ALTERNATIVE CALMING CHANNELS */}
          {stage === 'alternative' && (
            <motion.div
              key="alternative"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6 text-left max-w-md mx-auto"
            >
              {!chosenAltResource ? (
                <>
                  <div className="text-center space-y-2">
                    <div className="p-3 bg-rose-50/10 text-rosegold rounded-2xl w-12 h-12 mx-auto flex items-center justify-center">
                      <Heart className="h-5 w-5 fill-current" />
                    </div>
                    <h2 className="text-xl font-serif text-[#FAF6F0] leading-snug">
                      {localText.altTitle}
                    </h2>
                    <p className="text-xs text-stone-400 leading-relaxed max-w-xs mx-auto">
                      {adaptMessage(localText.altDesc, prefGrammar, lang)}
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <button
                      onClick={() => handleAlternative('breathing')}
                      className="w-full p-4 bg-white/[0.02] border border-white/5 hover:bg-[#D4AF37]/5 hover:border-[#D4AF37]/20 rounded-2xl text-left text-xs font-sans font-bold tracking-wide text-stone-200 transition cursor-pointer flex items-center justify-between group"
                    >
                      <span className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 text-[#D4AF37] group-hover:rotate-180 transition duration-500" />
                        <span>{localText.altOptionBreathing}</span>
                      </span>
                      <span>→</span>
                    </button>

                    <button
                      onClick={() => handleAlternative('letter')}
                      className="w-full p-4 bg-white/[0.02] border border-white/5 hover:bg-[#D4AF37]/5 hover:border-[#D4AF37]/20 rounded-2xl text-left text-xs font-sans font-bold tracking-wide text-stone-200 transition cursor-pointer flex items-center justify-between group"
                    >
                      <span className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-[#D4AF37]" />
                        <span>{localText.altOptionLetter}</span>
                      </span>
                      <span>→</span>
                    </button>

                    <button
                      onClick={() => handleAlternative('support')}
                      className="w-full p-4 bg-white/[0.02] border border-white/5 hover:bg-[#D4AF37]/5 hover:border-[#D4AF37]/20 rounded-2xl text-left text-xs font-sans font-bold tracking-wide text-stone-200 transition cursor-pointer flex items-center justify-between group"
                    >
                      <span className="flex items-center gap-2">
                        <PhoneCall className="h-4 w-4 text-[#D4AF37]" />
                        <span>{localText.altOptionSupport}</span>
                      </span>
                      <span>→</span>
                    </button>
                  </div>
                </>
              ) : chosenAltResource === 'letter' ? (
                /* LETTER OPTION VIEW */
                <motion.div
                  key="alt-letter"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  <div className="space-y-1 text-center">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-rosegold font-bold block">
                      Refúgio Secreto
                    </span>
                    <h2 className="text-xl sm:text-2xl font-serif text-[#FAF6F0] lowercase font-light">
                      {localText.letterTitle}
                    </h2>
                  </div>

                  {/* Deeply cozy letter typeset */}
                  <div className="p-6 rounded-3xl bg-amber-50/[0.02] border border-amber-100/5 text-stone-200 font-serif italic text-sm leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto pl-4 border-l-2 border-l-[#D4AF37] max-w-md mx-auto">
                    {adaptMessage(comfortLetter, prefGrammar, lang)}
                  </div>

                  <div className="flex justify-center pt-2">
                    <button
                      onClick={onBackToMission}
                      className="px-6 py-2.5 bg-rosegold hover:bg-rosegold/90 text-white rounded-xl text-xs font-sans font-bold tracking-widest uppercase transition cursor-pointer shadow-md"
                    >
                      {localText.letterClose}
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* COURAGE SUPPORT OPTION VIEW */
                <motion.div
                  key="alt-support"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6 text-center"
                >
                  <div className="w-12 h-12 bg-[#D4AF37]/10 text-[#D4AF37] rounded-2xl mx-auto flex items-center justify-center border border-[#D4AF37]/10">
                    <PhoneCall className="h-5 w-5" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-serif text-[#FAF6F0] uppercase font-light tracking-wide">
                      {localText.supportTitle}
                    </h3>
                    <p className="text-xs text-stone-300 max-w-xs mx-auto leading-relaxed">
                      {localText.supportDesc}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 max-w-xs mx-auto font-mono text-[11px] text-[#D4AF37]">
                    {localText.supportEmail}
                  </div>

                  <div className="pt-4 flex justify-center gap-3">
                    <button
                      onClick={() => {
                        setChosenAltResource(null);
                      }}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 text-stone-300 text-xs font-sans font-bold uppercase rounded-xl transition cursor-pointer"
                    >
                      Voltar Opções
                    </button>
                    <button
                      onClick={onBackToMission}
                      className="px-5 py-2 bg-rosegold hover:bg-rosegold/90 text-white text-xs font-sans font-bold uppercase rounded-xl transition cursor-pointer shadow-md"
                    >
                      Entendido
                    </button>
                  </div>
                </motion.div>
              )}

            </motion.div>
          )}

        </AnimatePresence>

      </div>

      {/* Warm bottom bar credit */}
      <div className="max-w-md w-full mx-auto text-center text-[9px] font-mono text-stone-600 uppercase tracking-widest py-2 border-t border-white/5 relative z-10">
        {adaptMessage('você é [dona/dono/done] do seu ritmo • renaser os', prefGrammar, 'pt')}
      </div>

    </motion.div>
  );
}
