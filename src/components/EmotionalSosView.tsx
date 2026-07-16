/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Wind, ArrowLeft, ShieldCheck, Sparkles, UserCheck, HelpCircle, AlertCircle, PhoneCall, RefreshCw, BookOpen } from 'lucide-react';
import { Language, UserProgress } from '../types';
import { adaptMessage, resolveGrammarPreference, pickTone, resolveGuideStyle, ToneVariants } from '../utils/grammar';

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
  const guideStyle = resolveGuideStyle(progress?.guideStyle);
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

  // Renata-voice comfort copy that varies by guideStyle (gentle/challenger/
  // strategic/inspirational). "inspirational" preserves the original wording.
  const toneText: Record<Language, {
    breathingDesc: ToneVariants;
    feedbackSuccess: ToneVariants;
    altTitle: ToneVariants;
    altDesc: ToneVariants;
  }> = {
    pt: {
      breathingDesc: {
        gentle: 'Sua respiração pode ser o seu porto seguro agora. Não precisa fazer nada além de acompanhá-la, devagar, no seu próprio tempo.',
        challenger: 'Sua respiração é a ferramenta mais rápida que você tem pra sair da reação e voltar ao controle. Use-a agora, sem enrolar.',
        strategic: 'A respiração regula seu sistema nervoso em minutos — é o passo mais eficiente antes de qualquer decisão. Faça pelo menos um ciclo completo antes de continuar.',
        inspirational: 'Sua respiração é a sua única âncora física agora. Antes de ler qualquer conselho, traga sua presença para o momento presente.'
      },
      feedbackSuccess: {
        gentle: 'Que bom que ajudou. Vá no seu tempo, e volte sempre que precisar de acolhimento.',
        challenger: 'Bom. Agora volte pra ação — o desconforto passou, não deixe ele voltar por procrastinação.',
        strategic: 'Registrado: a ferramenta funcionou. Volte pra sua tarefa do dia enquanto o efeito ainda está ativo.',
        inspirational: 'Que bom. Estamos juntos nessa jornada. Volte sempre que precisar de um porto seguro.'
      },
      altTitle: {
        gentle: 'Seu lugar está guardado, com todo carinho.',
        challenger: 'Seu lugar está guardado. Agora escolha uma ferramenta e volte à ação.',
        strategic: 'Seu lugar está guardado. Escolha o próximo recurso e mantenha o momentum.',
        inspirational: 'Nós salvamos o seu lugar.'
      },
      altDesc: {
        gentle: 'Tudo bem não estar [pronta/pronto/pronte] ainda. Seu ritmo é único e válido. Escolha o que fizer sentido agora:',
        challenger: 'Não estar [pronta/pronto/pronte] não é desculpa pra sumir. Escolha uma ferramenta abaixo e continue se movendo:',
        strategic: 'Existem 3 recursos pra retomar o controle agora. Escolha o que se encaixa no seu momento e siga:',
        inspirational: 'Tudo bem não se sentir 100% [pronta/pronto/pronte] ainda. Sua evolução é única. Escolha outra ferramenta de acolhimento:'
      }
    },
    en: {
      breathingDesc: {
        gentle: "Your breath can be your safe harbor right now. You don't need to do anything except follow it, slowly, at your own pace.",
        challenger: 'Your breath is the fastest tool you have to move from reaction back to control. Use it now, no stalling.',
        strategic: "Breathing regulates your nervous system within minutes — it's the most efficient step before any decision. Complete at least one full cycle before continuing.",
        inspirational: 'Your breath is your only physical anchor right now. Before reading any guidance, bring your full presence to the moment.'
      },
      feedbackSuccess: {
        gentle: 'So glad it helped. Go at your own pace, and come back whenever you need comfort.',
        challenger: "Good. Now get back to action — the discomfort passed, don't let it return through procrastination.",
        strategic: 'Logged: the tool worked. Return to your task for the day while the effect is still active.',
        inspirational: 'Excellent. We are together in this. Return here whenever you need a safe harbor.'
      },
      altTitle: {
        gentle: 'Your place is being kept, with all the care in the world.',
        challenger: 'Your place is saved. Now pick a tool and get back to action.',
        strategic: 'Your place is saved. Choose the next resource and keep the momentum.',
        inspirational: 'We saved your place.'
      },
      altDesc: {
        gentle: "It's okay not to feel ready yet. Your pace is unique and valid. Choose whatever makes sense right now:",
        challenger: "Not feeling ready isn't an excuse to disappear. Choose one of the tools below and keep moving:",
        strategic: 'There are 3 resources to regain control right now. Choose the one that fits your moment and proceed:',
        inspirational: 'It is okay not to feel 100% ready yet. Your pace is unique. Choose another calming resource:'
      }
    },
    es: {
      breathingDesc: {
        gentle: 'Tu respiración puede ser tu puerto seguro ahora. No necesitas hacer nada más que seguirla, despacio, a tu propio ritmo.',
        challenger: 'Tu respiración es la herramienta más rápida que tienes para salir de la reacción y volver al control. Úsala ahora, sin dar más vueltas.',
        strategic: 'La respiración regula tu sistema nervioso en minutos — es el paso más eficiente antes de cualquier decisión. Completa al menos un ciclo completo antes de continuar.',
        inspirational: 'Tu respiración es tu única ancla física ahora. Antes de leer cualquier consejo, trae tu presencia al momento presente.'
      },
      feedbackSuccess: {
        gentle: 'Qué bueno que ayudó. Ve a tu ritmo, y vuelve siempre que necesites contención.',
        challenger: 'Bien. Ahora vuelve a la acción — la incomodidad pasó, no dejes que vuelva por procrastinación.',
        strategic: 'Registrado: la herramienta funcionó. Vuelve a tu tarea del día mientras el efecto sigue activo.',
        inspirational: 'Qué bueno. Estamos juntos en este camino. Vuelve siempre que necesites un puerto seguro.'
      },
      altTitle: {
        gentle: 'Tu lugar está guardado, con todo cariño.',
        challenger: 'Tu lugar está guardado. Ahora elige una herramienta y vuelve a la acción.',
        strategic: 'Tu lugar está guardado. Elige el siguiente recurso y mantén el impulso.',
        inspirational: 'Nosotros guardamos tu lugar.'
      },
      altDesc: {
        gentle: 'Está bien no sentirte [lista/listo/liste] todavía. Tu ritmo es único y válido. Elige lo que tenga sentido ahora:',
        challenger: 'No sentirte [lista/listo/liste] no es excusa para desaparecer. Elige una herramienta abajo y sigue moviéndote:',
        strategic: 'Hay 3 recursos para retomar el control ahora. Elige el que se ajuste a tu momento y sigue:',
        inspirational: 'Está bien no sentirse 100% [lista/listo/liste] todavía. Tu evolución es única. Elige otra herramienta de apoyo:'
      }
    }
  };

  // Specific Deep Copywriting Guidance Messages — each category's text is
  // varied by guideStyle; the title stays a single short label.
  const sosGuidance = {
    pt: {
      fear: {
        title: 'Medo de aparecer / Gravar',
        text: {
          gentle: 'Está tudo bem sentir medo agora. Você não precisa ser [perfeita/perfeito/perfeite] pra continuar — só precisa se permitir ser [humana/humano/humane], com toda a ternura que isso pede. Respire, e saiba que sua voz, do jeito que ela é hoje, já é suficiente.',
          challenger: 'O medo de aparecer não vai embora esperando. Ele só perde força quando você aparece mesmo com ele. Pare de esperar se sentir [perfeita/perfeito/perfeite] — ninguém nunca esteve. Sua história vale porque é real, não porque é polida.',
          strategic: 'Dado prático: perfeição não gera conexão, honestidade gera. O medo de gravar geralmente é medo de rejeição, mas ele não muda o resultado — só atrasa. Aceite que vai gaguejar, aceite que vai errar, e grave assim mesmo.',
          inspirational: 'Você não precisa ser [perfeita/perfeito/perfeite] para ser [ouvida/ouvido/ouvide]. A perfeição é apenas uma máscara invisível que usamos para tentar evitar rejeição. Mas as pessoas reais não se conectam com robôs polidos. Elas se conectam com a sua honestidade emocional. Dê a [si mesma/si mesmo/si mesme] permissão para gaguejar, para errar, para ser [humana/humano/humane]. Sua história tem valor exatamente como ela é hoje.'
        }
      },
      impostor: {
        title: 'Síndrome do Impostor',
        text: {
          gentle: 'Sentir-se [uma impostora/um impostor/uma impostore] às vezes é só um sinal de que você está crescendo mais rápido do que sua autoimagem alcançou ainda. Seja gentil consigo — essa sensação passa, e não define seu valor real.',
          challenger: 'Charlatões não sentem síndrome do impostor — só quem realmente se importa sente. Então para de usar esse medo como desculpa pra recuar. Você não está fingindo nada; está só ficando maior do que a versão antiga de você achava possível.',
          strategic: 'Fato observado: a síndrome do impostor é comum justamente entre quem entrega valor real — é um efeito colateral do crescimento, não um sinal de incompetência. Reconheça o padrão, e siga executando mesmo com o desconforto.',
          inspirational: 'O fato de você sentir que é [uma impostora/um impostor/uma impostore] prova que você se importa profundamente com o valor que entrega aos outros. Charlatões nunca têm a síndrome do impostor. Você não está fingindo; você está simplesmente cruzando a fronteira de uma nova fase da sua identidade. É natural sentir medo ao crescer. Se posicione no seu lugar de direito.'
        }
      },
      panic: {
        title: 'Pânico Pré-Gravação',
        text: {
          gentle: 'Se sua garganta travar, tudo bem. É só o seu corpo tentando te proteger. Dê um tempo pra si, respire de novo, devagar, e quando estiver [pronta/pronto/pronte], comece com calma, sem pressa de acertar de primeira.',
          challenger: 'Sua garganta trava porque seu cérebro confunde a câmera com perigo real — mas não é. Respire fundo uma vez, encare o pontinho, e fale mesmo com o nó na garganta. O desconforto passa assim que você começa.',
          strategic: 'O travamento na garganta é uma resposta automática de ameaça social, previsível e temporária. Uma respiração lenta reduz o pico de cortisol o suficiente pra você falar. Faça o ciclo, e comece a gravar em seguida.',
          inspirational: 'Sua garganta travando é apenas o seu sistema nervoso interpretando a lente da câmera como uma ameaça de exclusão social. Seu cérebro está tentando te proteger do julgamento alheio. Agradeça a ele por te proteger, mas diga suavemente: "Está tudo seguro. Eu domino essa presença." Faça mais um ciclo respiratório lento e fale olhando apenas para o pontinho da câmera.'
        }
      },
      judgment: {
        title: 'Medo de Julgamentos Externos',
        text: {
          gentle: 'As opiniões de outras pessoas não têm o poder de definir quem você é. Você pode ouvir, sentir o desconforto, e ainda assim continuar sendo gentil consigo mesma enquanto segue seu caminho.',
          challenger: 'Quem julga de fora geralmente está projetando as próprias limitações. Isso não é sobre você — é sobre eles. Pare de dar espaço de aluguel na sua cabeça pra opinião de quem nem está tentando o que você está tentando.',
          strategic: 'Julgamento externo é ruído, não dado relevante pra sua decisão. A única métrica que importa é se as pessoas que você quer alcançar estão sendo alcançadas. Ignore o resto e siga executando.',
          inspirational: 'O julgamento das outras pessoas fala inteiramente sobre a realidade e os limites delas, não sobre a sua competência ou o seu coração. Quem critica, geralmente critica para projetar suas próprias inibições ou frustrações. As pessoas que você deseja verdadeiramente ajudar estão esperando ansiosamente que você apareça para falar com elas.'
        }
      },
      overwhelm: {
        title: 'Sensação de Sobrecarga',
        text: {
          gentle: 'Está tudo bem desacelerar. Descanso não é atraso, é parte do processo. Cuide de si mesma hoje, sem culpa, e volte quando o corpo e a mente estiverem prontos de novo.',
          challenger: 'Sobrecarga não é sinal pra desistir, é sinal pra ajustar o ritmo. Reduza a meta de hoje, mas não some. Um passo pequeno ainda é melhor que nenhum.',
          strategic: 'Sobrecarga reduz performance e consistência — a resposta correta não é forçar, é recalibrar a meta do dia pra algo menor e sustentável. Cumpra a versão mínima da promessa de hoje, e retome amanhã com o plano normal.',
          inspirational: 'Nós guardamos o seu lugar. Vá no seu ritmo. O descanso também é parte da jornada de crescimento, não um sinal de falha. Se hoje você não consegue gravar, está tudo bem. Apenas cumpra a promessa de se acolher e escutar a mensagem da Renata. Respire fundo, reduza as expectativas para hoje e continue amanhã.'
        }
      }
    },
    en: {
      fear: {
        title: 'Fear of showing up / Recording',
        text: {
          gentle: "It's okay to feel afraid right now. You don't need to be perfect to keep going — you just need to allow yourself to be human, with all the tenderness that requires. Breathe, and know your voice, exactly as it is today, is already enough.",
          challenger: "The fear of showing up doesn't go away by waiting. It only loses power when you show up anyway. Stop waiting to feel perfect — no one ever has been. Your story is valuable because it's real, not because it's polished.",
          strategic: "Practical fact: perfection doesn't generate connection, honesty does. Fear of recording is usually fear of rejection, but it doesn't change the outcome — it only delays it. Accept you'll stutter, accept you'll make mistakes, and record anyway.",
          inspirational: 'You do not need to be perfect to be heard. Perfection is simply an invisible mask we wear to avoid rejection. But real people don\'t connect with polished robots. They connect with your emotional honesty. Give yourself permission to stutter, to make mistakes, to be human. Your story has value exactly as it is today.'
        }
      },
      impostor: {
        title: 'Imposter Syndrome',
        text: {
          gentle: "Feeling like an impostor is sometimes just a sign you're growing faster than your self-image has caught up to yet. Be gentle with yourself — this feeling passes, and it doesn't define your real value.",
          challenger: "Con artists don't feel imposter syndrome — only people who genuinely care do. So stop using this fear as an excuse to retreat. You're not faking anything; you're simply becoming bigger than your old version thought possible.",
          strategic: 'Observed fact: imposter syndrome is common precisely among people who deliver real value — it is a side effect of growth, not a sign of incompetence. Recognize the pattern, and keep executing even through the discomfort.',
          inspirational: 'The fact that you feel like an imposter proves that you care deeply about the value you deliver to others. Con artists never experience imposter syndrome. You are not pretending; you are simply crossing the boundary into a new phase of your identity. It is natural to feel fear when growing. Claim your rightful place.'
        }
      },
      panic: {
        title: 'Pre-recording Panic',
        text: {
          gentle: "If your throat tightens, that's okay. It's just your body trying to protect you. Give yourself a moment, breathe again, slowly, and when you're ready, start calmly, with no rush to get it right on the first try.",
          challenger: 'Your throat tightens because your brain confuses the camera with real danger — but it isn\'t. Take one deep breath, look at the dot, and speak even with the knot in your throat. The discomfort passes once you start.',
          strategic: 'The throat tightening is a predictable, temporary social-threat response. One slow breath lowers the cortisol spike enough for you to speak. Complete the cycle, then start recording right after.',
          inspirational: 'Your tight throat is just your nervous system interpreting the camera lens as a social exclusion threat. Your brain is trying to protect you from judgment. Thank it for protecting you, but say gently: "Everything is safe. I own this presence." Take another slow breath and speak looking only at the camera dot.'
        }
      },
      judgment: {
        title: 'Anxiety About External Judgment',
        text: {
          gentle: "Other people's opinions don't have the power to define who you are. You can hear them, feel the discomfort, and still keep being gentle with yourself as you continue on your path.",
          challenger: "Those who judge from the outside are usually projecting their own limitations. This isn't about you — it's about them. Stop renting out space in your head to the opinion of someone who isn't even attempting what you're attempting.",
          strategic: 'External judgment is noise, not relevant data for your decision. The only metric that matters is whether the people you want to reach are being reached. Ignore the rest and keep executing.',
          inspirational: 'Other people\'s judgment speaks entirely about their own reality and limitations, not your competence or your heart. Those who criticize are usually projecting their own inhibitions or frustrations. The people you are truly meant to serve are waiting eagerly for you to show up and speak up.'
        }
      },
      overwhelm: {
        title: 'Feeling Overwhelmed',
        text: {
          gentle: "It's okay to slow down. Rest isn't falling behind, it's part of the process. Take care of yourself today, without guilt, and come back when your body and mind are ready again.",
          challenger: "Overwhelm isn't a sign to quit, it's a sign to adjust the pace. Lower today's target, but don't disappear. One small step still beats none.",
          strategic: "Overwhelm reduces performance and consistency — the correct response isn't to push harder, it's to recalibrate today's target to something smaller and sustainable. Complete the minimum version of today's promise, and resume the normal plan tomorrow.",
          inspirational: "We saved your place. Go at your own pace. Rest is also a part of the growth journey, not a sign of failure. If you cannot record today, that is completely fine. Just keep the promise to cuddle yourself and listen to Renata's message. Breathe deeply, lower your expectations for today, and resume tomorrow."
        }
      }
    },
    es: {
      fear: {
        title: 'Miedo de mostrarse / Grabar',
        text: {
          gentle: 'Está bien sentir miedo ahora. No necesitas ser [perfecta/perfecto/perfecte] para seguir adelante — solo necesitas permitirte ser [humana/humano/humane], con toda la ternura que eso requiere. Respira, y sabe que tu voz, tal como es hoy, ya es suficiente.',
          challenger: 'El miedo a aparecer no se va esperando. Solo pierde fuerza cuando apareces de todos modos. Deja de esperar sentirte [perfecta/perfecto/perfecte] — nadie lo ha estado nunca. Tu historia vale porque es real, no porque es pulida.',
          strategic: 'Dato práctico: la perfección no genera conexión, la honestidad sí. El miedo a grabar suele ser miedo al rechazo, pero no cambia el resultado — solo lo retrasa. Acepta que vas a tartamudear, acepta que te vas a equivocar, y graba de todos modos.',
          inspirational: 'No necesitas ser [perfecta/perfecto/perfecte] para ser [escuchada/escuchado/escuchade]. La perfección es solo una máscara invisible que usamos para tratar de evitar el rechazo. Pero la gente real no se conecta con robots pulidos. Se conecta con tu honestidad emocional. Date permiso para tartamudear, equivocarte, ser [humana/humano/humane]. Tu historia tiene valor exactamente como es hoy.'
        }
      },
      impostor: {
        title: 'Síndrome del Impostor',
        text: {
          gentle: 'Sentirte como [una impostora/un impostor/une impostore] a veces es solo una señal de que estás creciendo más rápido de lo que tu autoimagen ha alcanzado todavía. Sé gentil contigo misma — esta sensación pasa, y no define tu valor real.',
          challenger: 'Los charlatanes no sienten síndrome del impostor — solo lo siente quien realmente se importa. Así que deja de usar ese miedo como excusa para retroceder. No estás fingiendo nada; simplemente te estás volviendo más grande de lo que tu versión antigua creía posible.',
          strategic: 'Hecho observado: el síndrome del impostor es común precisamente entre quienes entregan valor real — es un efecto secundario del crecimiento, no una señal de incompetencia. Reconoce el patrón, y sigue ejecutando aunque incomode.',
          inspirational: 'El hecho de que te sientas como [una impostora/un impostor/une impostore] demuestra que te importa profundamente el valor que entregas a los demás. Los charlatanes nunca tienen el síndrome del impostor. No estás fingiendo; simplemente estás cruzando la frontera de una nueva fase de tu identidad. Es natural sentir miedo al crecer. Reclama tu lugar.'
        }
      },
      panic: {
        title: 'Pánico Pre-Grabación',
        text: {
          gentle: 'Si tu garganta se traba, está bien. Es solo tu cuerpo tratando de protegerte. Date un momento, respira de nuevo, despacio, y cuando estés [lista/listo/liste], empieza con calma, sin prisa por acertar a la primera.',
          challenger: 'Tu garganta se traba porque tu cerebro confunde la cámara con peligro real — pero no lo es. Respira hondo una vez, mira al punto, y habla aunque tengas el nudo en la garganta. La incomodidad pasa en cuanto empiezas.',
          strategic: 'El bloqueo en la garganta es una respuesta automática de amenaza social, predecible y temporal. Una respiración lenta reduce el pico de cortisol lo suficiente para que puedas hablar. Completa el ciclo, y empieza a grabar enseguida.',
          inspirational: 'Tu garganta tensa es solo tu sistema nervioso interpretando la lente de la cámara como una amenaza de exclusión social. Tu cerebro intenta protegerte del juicio. Agradécele por protegerte, pero dile suavemente: "Todo está a salvo. Yo domino esta presencia." Haz otra respiración lenta y habla mirando solo al punto de la cámara.'
        }
      },
      judgment: {
        title: 'Miedo al Juicio Externo',
        text: {
          gentle: 'Las opiniones de otras personas no tienen el poder de definir quién eres. Puedes escucharlas, sentir la incomodidad, y aun así seguir siendo gentil contigo misma mientras continúas tu camino.',
          challenger: 'Quien juzga desde afuera generalmente está proyectando sus propias limitaciones. Esto no es sobre ti — es sobre ellos. Deja de rentarle espacio en tu cabeza a la opinión de alguien que ni siquiera intenta lo que tú estás intentando.',
          strategic: 'El juicio externo es ruido, no un dato relevante para tu decisión. La única métrica que importa es si las personas que quieres alcanzar están siendo alcanzadas. Ignora el resto y sigue ejecutando.',
          inspirational: 'El juicio de otras personas habla enteramente sobre su propia realidad y límites, no sobre tu competencia o tu corazón. Quienes critican suelen proyectar sus propias inhibiciones o frustraciones. Las personas que realmente quieres ayudar están esperando ansiosamente que te muestres para hablarles.'
        }
      },
      overwhelm: {
        title: 'Sensación de Sobrecarga',
        text: {
          gentle: 'Está bien desacelerar. Descansar no es atrasarse, es parte del proceso. Cuida de ti misma hoy, sin culpa, y vuelve cuando tu cuerpo y tu mente estén listos de nuevo.',
          challenger: 'La sobrecarga no es señal para rendirte, es señal para ajustar el ritmo. Baja la meta de hoy, pero no desaparezcas. Un paso pequeño sigue siendo mejor que ninguno.',
          strategic: 'La sobrecarga reduce el rendimiento y la consistencia — la respuesta correcta no es forzar, es recalibrar la meta del día a algo más pequeño y sostenible. Cumple la versión mínima de la promesa de hoy, y retoma el plan normal mañana.',
          inspirational: 'Nosotros guardamos tu lugar. Ve a tu propio ritmo. El descanso también es parte del viaje de crecimiento, no una señal de fracaso. Si hoy no puedes grabar, está bien. Cumple la promesa de abrazarte y escuchar el mensaje de Renata. Respira hondo, reduce las expectativas para hoy y continúa mañana.'
        }
      }
    }
  }[lang];

  // Specific Letter of Comfort from Creator — varied by guideStyle
  const comfortLetter = {
    pt: {
      gentle: `Querida alma,\n\nRespire fundo. Só isso já é suficiente por agora.\n\nVocê não fez nada de errado. Se hoje o corpo pede pausa, tudo bem — descansar também é cuidar de si. Não existe prazo pra ser gentil com você mesma.\n\nQuando quiser voltar, o espaço vai estar aqui, exatamente como você deixou, esperando por você sem pressa nenhuma.\n\nCom todo o carinho,\nSua mentora, Renata`,
      challenger: `Querida alma,\n\nVamos direto ao ponto: você não fracassou, só precisou de uma pausa — e pausa não é desculpa pra sumir de vez.\n\nSeu lugar está guardado, mas ele não vai te esperar sozinho pra sempre; em algum momento você precisa voltar e retomar. Beba água, respire, e quando o corpo estiver pronto, volte com tudo.\n\nO mundo não precisa de você [perfeita/perfeito/perfeite]. Precisa de você presente, de novo.\n\nCom carinho e um empurrão,\nSua mentora, Renata`,
      strategic: `Querida alma,\n\nAqui está a leitura direta da situação: você bateu num limite, e isso é informação, não fracasso. Ignorar sinais do corpo custa mais caro no longo prazo do que pausar agora.\n\nSeu lugar está guardado. Beba água, ajuste as expectativas de hoje pra algo mínimo e sustentável, e retome o plano assim que estiver [pronta/pronto/pronte] — mesmo que seja amanhã.\n\nConsistência de longo prazo importa mais que qualquer dia isolado.\n\nCom carinho,\nSua mentora, Renata`,
      inspirational: `Querida alma,\n\nSe você está lendo isso, por favor, coloque as mãos sobre o coração por um segundo. Sinta o bater do seu peito. Esse ritmo é real, é o seu corpo apoiando você.\n\nVocê não está [atrasada/atrasado/atrasade]. Você não falhou. Nós guardamos o seu lugar com todo o respeito. Não existe fracasso em precisar de uma pausa; o verdadeiro erro é fingir força quando seu corpo e alma gritam por descanso.\n\nA jornada RenaSer não é sobre virar um gerador automático de vídeos perfeitos. É sobre visibilidade real. E a primeira pessoa que precisa ver você, respeitar seus limites e abraçar seu ritmo é [você mesma/você mesmo/você mesme].\n\nBeba um copo d'água. Sinta a terra sob seus pés. Quando estiver [pronta/pronto/pronte], o portal estará aqui, exatamente do jeito que você o deixou.\n\nCom carinho,\nSua mentora, Renata`
    },
    en: {
      gentle: `Dear soul,\n\nTake a deep breath. That alone is enough for now.\n\nYou haven't done anything wrong. If your body is asking for a pause today, that's okay — resting is also a form of self-care. There's no deadline on being gentle with yourself.\n\nWhenever you're ready to return, this space will be here, exactly as you left it, waiting for you with no rush at all.\n\nWith all my care,\nYour mentor, Renata`,
      challenger: `Dear soul,\n\nLet's get straight to it: you haven't failed, you just needed a pause — and a pause isn't an excuse to disappear for good.\n\nYour place is saved, but it won't wait for you alone forever; at some point you need to come back and pick it up. Drink some water, breathe, and when your body is ready, come back in full.\n\nThe world doesn't need you perfect. It needs you present, again.\n\nWith love and a push,\nYour mentor, Renata`,
      strategic: `Dear soul,\n\nHere's the straightforward read: you hit a limit, and that's information, not failure. Ignoring your body's signals costs more in the long run than pausing now.\n\nYour place is saved. Drink some water, scale today's expectations down to something minimal and sustainable, and resume the plan once you're ready — even if that's tomorrow.\n\nLong-term consistency matters more than any single day.\n\nWith love,\nYour mentor, Renata`,
      inspirational: `Dear soul,\n\nIf you are reading this, please place your hands on your heart for a second. Feel your chest rise and fall. This rhythm is real; it is your body supporting you.\n\nYou are not late. You haven't failed. We saved your place with deep respect. There is no failure in needing a pause; the real mistake is pretending to be strong when your body and soul cry for rest.\n\nThe RenaSer journey is not about becoming an automatic producer of perfect videos. It is about true visibility. And the first person who needs to see you, respect your boundaries, and embrace your pace is yourself.\n\nDrink a glass of water. Feel the ground beneath your feet. When you are ready, the portal will be here, exactly as you left it.\n\nWith love,\nYour mentor, Renata`
    },
    es: {
      gentle: `Querida alma,\n\nRespira hondo. Eso ya es suficiente por ahora.\n\nNo has hecho nada mal. Si hoy tu cuerpo pide una pausa, está bien — descansar también es cuidar de ti. No hay plazo para ser gentil contigo misma.\n\nCuando quieras volver, este espacio estará aquí, exactamente como lo dejaste, esperándote sin ninguna prisa.\n\nCon todo cariño,\nTu mentora, Renata`,
      challenger: `Querida alma,\n\nVamos directo al punto: no fracasaste, solo necesitabas una pausa — y una pausa no es excusa para desaparecer para siempre.\n\nTu lugar está guardado, pero no te va a esperar sola para siempre; en algún momento necesitas volver y retomarlo. Bebe agua, respira, y cuando tu cuerpo esté listo, vuelve con todo.\n\nEl mundo no necesita que seas [perfecta/perfecto/perfecte]. Necesita que estés presente, de nuevo.\n\nCon cariño y un empujón,\nTu mentora, Renata`,
      strategic: `Querida alma,\n\nAquí está la lectura directa: llegaste a un límite, y eso es información, no fracaso. Ignorar las señales del cuerpo cuesta más caro a largo plazo que pausar ahora.\n\nTu lugar está guardado. Bebe agua, ajusta las expectativas de hoy a algo mínimo y sostenible, y retoma el plan en cuanto estés [lista/listo/liste] — aunque sea mañana.\n\nLa consistencia a largo plazo importa más que cualquier día aislado.\n\nCon cariño,\nTu mentora, Renata`,
      inspirational: `Querida alma,\n\nSi estás leyendo esto, por favor coloca tus manos sobre tu corazón por un segundo. Siente el latido de tu pecho. Este ritmo es real, es tu cuerpo apoyándote.\n\nNo vas tarde. No has fallado. Guardamos tu lugar con absoluto respeto. No hay fracaso en necesitar una pausa; el verdadero error es fingir fuerza cuando tu cuerpo y alma gritan por descanso.\n\nEl viaje RenaSer no se trata de convertirte en un generador automático de videos perfectos. Se trata de visibilidad real. Y la primera persona que necesita verte, respetar tus límites y abrazar tu ritmo eres [tú misma/tú mismo/tú misme].\n\nBebe un vaso de agua. Siente la tierra bajo tus pies. Cuando estés [lista/listo/liste], el portal estará aquí, exactamente como lo dejaste.\n\nCon cariño,\nTu mentora, Renata`
    }
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
      className="fixed inset-0 z-[45] bg-[#16110F] text-[#FAF6F0] flex flex-col justify-between p-4 sm:p-6 pb-24 lg:pb-6 overflow-y-auto select-none font-sans"
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
      <div className="max-w-xl w-full mx-auto flex-1 flex flex-col justify-center py-3 sm:py-6 relative z-10">
        
        <AnimatePresence mode="wait">
          
          {/* STAGE 1: BREATHING PORTAL FIRST (Mandatory or highly prioritized) */}
          {stage === 'breathing' && (
            <motion.div
              key="breathing"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4 sm:space-y-8 text-center"
            >
              <div className="space-y-1.5 sm:space-y-2">
                <span className="text-[10px] uppercase font-mono tracking-widest text-rosegold font-bold block">
                  Sintonização Respiratória
                </span>
                <h2 className="text-xl sm:text-3xl font-serif font-light text-white leading-tight lowercase">
                  {localText.breathingTitle}
                </h2>
                <p className="text-xs sm:text-sm text-stone-400 max-w-sm mx-auto leading-relaxed">
                  {adaptMessage(toneText[lang].breathingDesc[guideStyle], prefGrammar, lang)}
                </p>
              </div>

              {/* Glowing Slow Breathing Circle */}
              <div className="flex flex-col items-center justify-center space-y-3 sm:space-y-6 py-1 sm:py-4">
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
                    className={`h-24 w-24 sm:h-32 sm:w-32 rounded-full flex flex-col items-center justify-center relative transition-colors duration-700 ${
                      breathState === 'inhale' ? 'bg-rosegold/20 ring-4 ring-rosegold/10' :
                      breathState === 'hold1' ? 'bg-[#D4AF37]/15 ring-4 ring-[#D4AF37]/10' :
                      breathState === 'exhale' ? 'bg-amber-600/15 ring-4 ring-amber-600/10' :
                      breathState === 'hold2' ? 'bg-slate-800/25 ring-4 ring-slate-800/10' :
                      'bg-rosegold/10 border border-rosegold/20'
                    }`}
                  >
                    {breathState !== 'idle' ? (
                      <>
                        <span className="text-2xl sm:text-3xl font-serif font-bold text-white mb-0.5">
                          {secondsLeft}s
                        </span>
                        <span className="text-[9px] font-mono tracking-widest text-[#D4AF37] uppercase font-bold">
                          {localText[breathState]}
                        </span>
                      </>
                    ) : (
                      <Wind className="h-6 w-6 sm:h-7 sm:w-7 text-stone-400 animate-pulse" />
                    )}
                  </motion.div>

                  {/* Gentle Ripple Bounds */}
                  <div className="absolute h-32 w-32 sm:h-44 sm:w-44 border border-white/5 rounded-full pointer-events-none" />
                </div>

                {breathState !== 'idle' && (
                  <span className="text-xs font-mono text-stone-400">
                    {localText.breathingCycles.replace('{count}', cyclesCompleted.toString())}
                  </span>
                )}
              </div>

              {/* Action Trigger Buttons */}
              <div className="space-y-2.5 sm:space-y-4 max-w-xs mx-auto">
                {breathState === 'idle' ? (
                  <button
                    onClick={handleStartBreathing}
                    className="w-full py-2.5 sm:py-3 bg-rosegold hover:bg-rosegold/90 text-white rounded-2xl text-xs font-sans font-bold tracking-widest uppercase transition-all duration-300 shadow-lg shadow-rosegold/10 cursor-pointer"
                  >
                    {localText.breathingCta}
                  </button>
                ) : (
                  <button
                    onClick={handleStopBreathing}
                    className="w-full py-2.5 sm:py-3 bg-stone-900 border border-stone-800 text-stone-300 rounded-2xl text-xs font-sans font-bold tracking-widest uppercase transition-all cursor-pointer"
                  >
                    {localText.breathingStop}
                  </button>
                )}

                {/* Transition Proceed button */}
                <div className="pt-1 sm:pt-2">
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
                  "{adaptMessage(sosGuidance[selectedCategory as keyof typeof sosGuidance]?.text[guideStyle] || '', prefGrammar, lang)}"
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
                  {adaptMessage(toneText[lang].feedbackSuccess[guideStyle], prefGrammar, lang)}
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
                      {adaptMessage(toneText[lang].altTitle[guideStyle], prefGrammar, lang)}
                    </h2>
                    <p className="text-xs text-stone-400 leading-relaxed max-w-xs mx-auto">
                      {adaptMessage(toneText[lang].altDesc[guideStyle], prefGrammar, lang)}
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
                    {adaptMessage(comfortLetter[guideStyle], prefGrammar, lang)}
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
