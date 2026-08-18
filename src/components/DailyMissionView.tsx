/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play, Pause, Copy, Check, Star, ArrowRight, ArrowLeft, Heart, Sparkles, ThumbsUp, ThumbsDown,
  Info, Compass, HelpCircle, X, BookOpen, Smile, Wind, Award,
  RotateCcw, Lock, ChevronLeft, ChevronRight
} from 'lucide-react';
import { MissionDay, Language, DayType, UserProgress } from '../types';
import { getDayTypeLabel, getHookOptionsForDay, getActionHookOptions, getHookCategoryLabel } from '../data/templateData';
import { adaptMessage, resolveGrammarPreference, pickTone, resolveGuideStyle, GuideStyle } from '../utils/grammar';
import { getLocalDateISO } from '../utils/date';
import { logEngagementEvent } from '../utils/engagement';
import EditableText from './editable/EditableText';
import LinkListInput from './LinkListInput';

// Joins however many recording links she adds into the single stored video-link string
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
  onGoToLibrary: () => void;
  isAdminUnlocked?: boolean;
  onJumpToDay?: (dayNumber: number) => void;
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
// The original day-completion phrases, unchanged — used as the
// 'inspirational' tone (the default guideStyle) and as the EN/ES fallback
// for the other three tones until those get their own translations.
const identityPhrasesBase: Record<number, Record<Language, string>> = {
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

// PT-only day-completion phrases in the 'strategic' (professional/Destrave
// audience), 'gentle' and 'challenger' voices, indexed 1-30 same as above.
// Written in Renata's own voice/vocabulary (padrão, programação, camadas,
// versão anterior), not translated to EN/ES yet — those languages fall back
// to identityPhrasesBase (see buildIdentityPhrases below).
const identityPhrasesPtByStyle: Record<Exclude<GuideStyle, 'inspirational'>, string[]> = {
  strategic: [
    'Você apareceu hoje, mesmo com a vozinha pedindo pra esperar mais um pouco.',
    'Você tá criando prova real de que esse padrão pode ser diferente. Continue.',
    'Você mexeu numa camada hoje. Não precisa ter sido grande pra ter sido real.',
    'Mais uma repetição, mais um tijolinho tirado do que antes parecia automático.',
    'Você ensinou seu corpo hoje que se expressar não é perigo, só desconfortável às vezes.',
    'Isso não foi sobre motivação. Foi sobre repetição criando uma identidade nova, de verdade.',
    'Você assumiu o que entrega hoje, sem esperar se sentir pronta antes. Isso é raro.',
    'Cada ação dessas reescreve uma linha do que você aprendeu a acreditar sobre você.',
    'Você quebrou um padrão hoje. Amanhã tem mais uma camada, e tá tudo bem.',
    'O que você fez hoje é exatamente o tipo de repetição que muda identidade de verdade, não só disciplina.',
    'Você mostrou pro seu sistema que ser vista não custa o que ele imaginava. Guarda isso.',
    'Você tá mais perto de acreditar, na prática, que o que você entrega já é bom o suficiente.',
    'Hoje você trocou uma identidade antiga por uma ação real. Conta, mesmo pequena.',
    'Metade do caminho. A ação já tá mais fácil que no dia 1, repara nisso.',
    'Você entregou hoje sem esperar o resultado confirmar primeiro. É assim que se constrói confiança de verdade.',
    'Sua verdade apareceu hoje, sem precisar de permissão de ninguém. Guarda esse dado.',
    'Você fez de novo, mesmo sem cobrar perfeição. A camada de hoje já saiu do caminho.',
    'Aparecer com alma hoje foi um recado novo pro seu sistema. Ele já entendeu, continue.',
    'O medo não sumiu, mas sua voz venceu ele hoje. Repete amanhã.',
    'Sua presença de hoje foi construída, não nascida pronta. Lembra disso quando duvidar.',
    'Você provou de novo, com uma ação concreta, que esse padrão não manda mais em você sozinho.',
    'Cada dia desses tira o peso de uma identidade que nunca foi tua de verdade.',
    'Você mostrou hoje que merece receber pelo que entrega. Isso muda como você se posiciona amanhã.',
    'Continuar aparecendo enquanto os outros esperam ficar prontos, isso já é diferencial.',
    'Você assumiu o que entrega, sem se esconder atrás de "ainda não tá bom o suficiente". Camada removida.',
    'Esse padrão que te mantinha quieta perdeu um pouco de força hoje.',
    'Você confiou no processo hoje, não no resultado. É assim que fica sustentável.',
    'Sua voz tremeu e você gravou assim mesmo. Seu corpo guarda isso como prova.',
    'Você pediu, entregou ou apareceu hoje sem se diminuir. Repara no que isso muda.',
    'Mais uma repetição pra reconstruir o que você acredita que é possível pra tua vida.'
  ],
  gentle: [
    'Você apareceu hoje, e isso já basta.',
    'Você tá indo no seu tempo, e seu tempo é válido.',
    'Cada tentativa sua, mesmo pequena, importa mais do que parece.',
    'Você se permitiu um pouco mais hoje. Isso é cuidado, não fraqueza.',
    'Aparecer com medo e continuar mesmo assim, isso é coragem silenciosa.',
    'Você não precisou ser perfeita pra valer a pena. Só precisou ser você.',
    'Fase 1 concluída, com carinho. Você chegou até aqui do seu jeito.',
    'Cada escolha de hoje é um voto gentil em quem você quer se tornar.',
    'Sua história vale, mesmo sem estar polida.',
    'Você tirou um pouco do peso de fingir ser outra pessoa hoje.',
    'A confiança vai crescendo devagar, e hoje ela cresceu um pouquinho mais.',
    'Mais um dia em que você não deixou a desculpa vencer. Se orgulhe disso, com leveza.',
    'Você escolheu se mostrar, mesmo com vontade de recuar. Isso conta.',
    'Metade do caminho, com você inteira nele.',
    'Sua forma de ser é sua vantagem, não precisa ser igual a mais ninguém.',
    'Você é livre pra contar sua história do seu jeito, sem pedir licença.',
    'Você se permitiu criar sem cobrar um resultado perfeito. Isso é liberdade.',
    'Você se expressou com alma hoje, e isso já é motivo de orgulho.',
    'O medo ainda existe, mas sua voz ficou um pouco mais forte hoje.',
    'Sua presença hoje veio de um olhar mais honesto com você mesma.',
    'Você confiou em você hoje, e essa confiança se constrói assim, aos poucos.',
    'Você foi gentil consigo mesma e ainda assim apareceu. As duas coisas são possíveis juntas.',
    'Cada vídeo seu é um convite pra alguém também se permitir aparecer.',
    'Você não desistiu, mesmo nos dias mais difíceis. Reconhece isso.',
    'Aparecer imperfeita hoje também é um jeito de cuidar de você.',
    'Você tá construindo, com paciência, uma relação mais gentil com sua imagem.',
    'Confiar no processo, sem pressa pelo resultado, também é uma forma de força.',
    'Sua voz tremeu, e mesmo assim você seguiu. Se acolhe por isso.',
    'Você apareceu do seu jeito hoje, sem precisar se encaixar em nenhum molde.',
    'Hoje não foi sobre ser perfeita. Foi sobre estar presente, e você esteve.'
  ],
  challenger: [
    'Você apareceu hoje. Sem desculpa, sem enrolação.',
    'Menos uma desculpa no seu repertório. Continua assim.',
    'Você provou hoje que dava pra fazer, mesmo com medo. Não esquece disso amanhã.',
    'Mais uma prova de que o medo não decide por você.',
    'Você fez, sem esperar se sentir confortável primeiro. É assim que muda.',
    'Você cumpriu com você mesma hoje. Ontem prometeu, hoje entregou.',
    'Fase 1 concluída. Você passou da fase de só falar que ia fazer.',
    'Consistência é a prova, não a intenção. Hoje você deu a prova.',
    'Sua história pesa mais quando você para de tentar parecer perfeita. Hoje você parou.',
    'Você tirou a máscara um pouco mais hoje. Continua tirando.',
    'Ação venceu a dúvida hoje. De novo.',
    'Mais uma desculpa que não colou hoje.',
    'Você escolheu agir em vez de esperar ficar confortável. Repete isso amanhã.',
    'Metade do caminho. Não é hora de dar desculpa nova.',
    'Ninguém mais tem sua voz. Hoje você usou ela em vez de esconder.',
    'Você contou sua verdade hoje, sem pedir permissão pra ninguém.',
    'Você parou de cobrar resultado perfeito e fez mesmo assim. Nota isso.',
    'Você se expressou de verdade hoje, sem editar demais.',
    'O medo não foi embora, mas você não deixou ele decidir hoje.',
    'Sua presença hoje veio de encarar, não de fugir.',
    'Você confiou em você hoje. Continua confiando amanhã, na prática.',
    'Você não esperou se sentir pronta. Fez, e ficou pronta depois.',
    'Cada vídeo seu tira a desculpa de quem ainda tá se escondendo.',
    'Você não parou nos dias difíceis. Isso separa quem faz de quem só planeja.',
    'Você apareceu imperfeita hoje em vez de não aparecer. Escolha certa.',
    'Você tá deixando de ser mais uma que só fala que vai fazer.',
    'Confiar no processo em vez do resultado imediato, hoje você fez isso na prática.',
    'Voz tremendo e você gravou assim mesmo. Prova que a trava é mental, não real.',
    'Você apareceu do seu jeito, sem se encaixar em molde de ninguém. Continua assim.',
    'Hoje não foi sobre ser perfeita, foi sobre não se esconder. E você não se escondeu.'
  ]
};

const identityPhrases: Record<number, Record<Language, Record<GuideStyle, string>>> = Object.fromEntries(
  Object.entries(identityPhrasesBase).map(([dayStr, byLang]) => {
    const day = Number(dayStr);
    const byLangByStyle = Object.fromEntries(
      (['pt', 'en', 'es'] as Language[]).map((lang) => [
        lang,
        {
          inspirational: byLang[lang],
          strategic: lang === 'pt' ? identityPhrasesPtByStyle.strategic[day - 1] : byLang[lang],
          gentle: lang === 'pt' ? identityPhrasesPtByStyle.gentle[day - 1] : byLang[lang],
          challenger: lang === 'pt' ? identityPhrasesPtByStyle.challenger[day - 1] : byLang[lang]
        }
      ])
    ) as Record<Language, Record<GuideStyle, string>>;
    return [day, byLangByStyle];
  })
);

// Surprise letters data, each letter is written in 4 tones (gentle/challenger/
// strategic/inspirational) matched to the user's guideStyle preference.
// "inspirational" preserves the original wording this content shipped with.
const surpriseLetters: Record<number, Record<Language, Record<GuideStyle, { note: string; p: string }>>> = {
  3: {
    pt: {
      gentle: {
        note: "Um lembrete gentil de que está tudo bem...",
        p: "Querida alma, você está no terceiro dia, e está tudo bem se o medo ainda estiver aqui com você. Ele não significa que algo está errado, só significa que isso importa de verdade. Você não precisa estar [pronta/pronto/pronte] pra ser real. Hoje, a única coisa que peço é 10 segundos de coragem: aperte o play, olhe pra lente, e deixe sua voz tremer se precisar. Está segura, eu prometo."
      },
      challenger: {
        note: "Um empurrão que você precisava ouvir...",
        p: "Terceiro dia. E a desculpa de sempre já deve estar rondando sua cabeça: 'ainda não estou [pronta/pronto/pronte]'. Deixa eu te contar uma verdade incômoda: ninguém está. A perfeição é só um esconderijo confortável pra quem tem medo de ser vista. Hoje você não tem escolha de ficar boa, só tem a escolha de aparecer. Aperte o play, encare a lente por 10 segundos, e fale mesmo tremendo. O medo não te dá veto."
      },
      strategic: {
        note: "Uma leitura rápida e direta ao ponto...",
        p: "Dia 3: aqui está o cálculo simples. 10 segundos de vídeo imperfeito valem infinitamente mais do que zero segundos de vídeo perfeito que nunca sai do rascunho. Sua ansiedade não é o problema a resolver hoje, é só um dado a considerar. Aperte o play, olhe pra lente, fale por 10 segundos. Consistência bate perfeição, sempre. É seguro seguir esse plano."
      },
      inspirational: {
        note: "Uma mensagem silenciosa de segurança...",
        p: "Querida alma, você está no terceiro dia. Talvez a ansiedade ainda sussurre que você não está pronta de verdade. Mas adivinhe? Ninguém está. A perfeição é apenas uma armadilha que criamos para evitar sermos vistos. Hoje, sua única promessa é dar o play e falar olhando para a lente por 10 segundos. Sinta o medo, e fale assim mesmo. É seguro."
      }
    },
    en: {
      gentle: {
        note: "A gentle reminder that it's okay...",
        p: "Dear soul, you're on day three, and it's okay if fear is still here with you. It doesn't mean something is wrong, it just means this matters. You don't need to feel ready to be real. Today, the only thing I'm asking for is 10 seconds of courage: press play, look at the lens, and let your voice shake if it needs to. You are safe, I promise."
      },
      challenger: {
        note: "A push you needed to hear...",
        p: "Day three. And the usual excuse is probably already circling your head: 'I'm not ready yet.' Let me tell you an uncomfortable truth: no one is. Perfection is just a comfortable hiding place for people afraid to be seen. Today you don't get to choose to be good, you only get to choose to show up. Press play, face the lens for 10 seconds, and speak even while shaking. Fear doesn't get a veto."
      },
      strategic: {
        note: "A quick, straight-to-the-point read...",
        p: "Day 3: here's the simple math. 10 seconds of imperfect video are worth infinitely more than zero seconds of a perfect video that never leaves the draft folder. Your anxiety isn't the problem to solve today, it's just a data point to note. Press play, look at the lens, speak for 10 seconds. Consistency beats perfection, always. It's safe to follow this plan."
      },
      inspirational: {
        note: "A quiet message of safety...",
        p: "Dear soul, you are on day three. Perhaps anxiety is still whispering that you are not truly ready. But guess what? No one is. Perfection is just a trap we build to avoid being seen. Today, your only promise is to press record and look into the lens for 10 seconds. Feel the fear, and speak anyway. It is safe."
      }
    },
    es: {
      gentle: {
        note: "Un recordatorio suave de que está bien...",
        p: "Querida alma, estás en el tercer día, y está bien si el miedo todavía está aquí contigo. No significa que algo esté mal, solo significa que esto importa de verdad. No necesitas estar [lista/listo/liste] para ser real. Hoy, lo único que te pido son 10 segundos de coraje: presiona grabar, mira a la lente, y deja que tu voz tiemble si hace falta. Estás [segura/seguro/segure], te lo prometo."
      },
      challenger: {
        note: "Un empujón que necesitabas escuchar...",
        p: "Tercer día. Y la excusa de siempre probablemente ya está rondando tu cabeza: 'todavía no estoy [lista/listo/liste]'. Déjame decirte una verdad incómoda: nadie lo está. La perfección es solo un escondite cómodo para quien tiene miedo de ser visto. Hoy no tienes la opción de estar bien, solo tienes la opción de aparecer. Presiona grabar, mira a la lente por 10 segundos, y habla aunque tiembles. El miedo no tiene voto."
      },
      strategic: {
        note: "Una lectura rápida y directa...",
        p: "Día 3: aquí está el cálculo simple. 10 segundos de video imperfecto valen infinitamente más que cero segundos de un video perfecto que nunca sale del borrador. Tu ansiedad no es el problema a resolver hoy, es solo un dato a considerar. Presiona grabar, mira a la lente, habla por 10 segundos. La consistencia le gana a la perfección, siempre. Es seguro seguir este plan."
      },
      inspirational: {
        note: "Un mensaje silencioso de seguridad...",
        p: "Querida alma, estás en el tercer día. Quizás la ansiedad todavía te susurre que no estás lista de verdad. ¿Pero adivina qué? Nadie lo está. La perfección es solo una trampa que creamos para evitar ser vistos. Hoy, tu única promesa es presionar grabar y mirar a la lente por 10 segundos. Siente el miedo y habla de todos modos. Es seguro."
      }
    }
  },
  11: {
    pt: {
      gentle: {
        note: "Um cuidado com o seu crítico interno...",
        p: "Você percebeu como seu crítico interno aparece nos detalhes mais bobos? Ele diz que o vídeo ficou sem graça, que você está [cansada/cansado/cansade] demais hoje. Não precisa vencer essa voz, só precisa não deixar ela decidir por você. O que você constrói aqui é sua própria confiança, no seu tempo. Grave hoje só por você, sem cobrança."
      },
      challenger: {
        note: "Não negocie com essa voz...",
        p: "Presta atenção no que seu crítico interno está fazendo: sabotando sua consistência nos detalhes mais bobos, disfarçado de 'só sendo realista'. Ele diz que o vídeo ficou sem graça, que você está [cansada/cansado/cansade] demais. Você vai negociar com essa voz de novo hoje? O que está em jogo aqui não é um feed bonito, é se você vai deixar o medo escolher por você. Grave. Agora."
      },
      strategic: {
        note: "Um dado a ignorar hoje...",
        p: "Dado observado: seu crítico interno tenta sabotar sua consistência exatamente nos detalhes mais simples, apontando que o vídeo 'ficou sem graça' ou que você está [cansada/cansado/cansade] demais hoje. Ignore esse dado, ele não é relevante pra decisão. A métrica que importa aqui é uma só: você gravou hoje ou não? Grave, e siga pro próximo passo."
      },
      inspirational: {
        note: "Um lembrete de soberania diária...",
        p: "Você percebeu como o seu crítico interno tenta sabotar sua consistência nos detalhes mais simples? Ele diz que seu vídeo ficou sem graça, ou que hoje você está [cansada/cansado/cansade]. Não negocie com a dúvida. O que você está erguendo aqui não é um feed visual perfeito, é a sua própria soberania e autoconfiança. Grave hoje puramente por você."
      }
    },
    en: {
      gentle: {
        note: "A little care for your inner critic...",
        p: "Have you noticed how your inner critic shows up in the silliest details? It says your video was boring, that you're too tired today. You don't need to defeat that voice, just don't let it decide for you. What you're building here is your own confidence, at your own pace. Record today just for you, no pressure."
      },
      challenger: {
        note: "Don't negotiate with that voice...",
        p: "Pay attention to what your inner critic is doing: sabotaging your consistency in the smallest details, disguised as 'just being realistic.' It says the video was boring, that you're too tired. Are you going to negotiate with that voice again today? What's at stake here isn't a pretty feed, it's whether you let fear choose for you. Record. Now."
      },
      strategic: {
        note: "A data point to ignore today...",
        p: "Observed data point: your inner critic tries to sabotage your consistency in the simplest details, claiming the video 'was boring' or that you're too tired today. Ignore that data point, it's not relevant to the decision. There's only one metric that matters here: did you record today or not? Record, and move to the next step."
      },
      inspirational: {
        note: "A reminder of daily sovereignty...",
        p: "Have you noticed how your inner critic tries to sabotage your consistency in the smallest details? It says your video was plain, or that you are too tired today. Do not negotiate with doubt. What you are building here is not a perfect aesthetic feed; it is your own sovereignty and self-trust. Record today purely for yourself."
      }
    },
    es: {
      gentle: {
        note: "Un cuidado con tu crítico interno...",
        p: "¿Has notado cómo tu crítico interno aparece en los detalles más tontos? Dice que el video quedó aburrido, que hoy estás demasiado [cansada/cansado/cansade]. No necesitas vencer esa voz, solo no dejar que decida por ti. Lo que construyes aquí es tu propia confianza, a tu ritmo. Graba hoy solo por ti, sin presión."
      },
      challenger: {
        note: "No negocies con esa voz...",
        p: "Presta atención a lo que tu crítico interno está haciendo: saboteando tu consistencia en los detalles más tontos, disfrazado de 'solo siendo realista'. Dice que el video quedó aburrido, que estás demasiado [cansada/cansado/cansade]. ¿Vas a negociar con esa voz otra vez hoy? Lo que está en juego aquí no es un feed bonito, es si dejas que el miedo decida por ti. Graba. Ahora."
      },
      strategic: {
        note: "Un dato a ignorar hoy...",
        p: "Dato observado: tu crítico interno intenta sabotear tu consistencia justo en los detalles más simples, diciendo que el video 'quedó aburrido' o que estás demasiado [cansada/cansado/cansade] hoy. Ignora ese dato, no es relevante para la decisión. Aquí solo importa una métrica: ¿grabaste hoy o no? Graba, y sigue al siguiente paso."
      },
      inspirational: {
        note: "Un recordatorio de soberanía diaria...",
        p: "¿Has notado cómo tu crítico interno intenta sabotear tu consistencia en los detalles más simples? Te dice que tu video quedó aburrido, o que hoy estás demasiado [cansada/cansado/cansade]. No negocies con la duda. Lo que estás construyendo aquí no es un feed estético perfecto; es tu propia soberanía y autoconfianza. Graba hoy puramente por ti."
      }
    }
  },
  18: {
    pt: {
      gentle: {
        note: "Um convite pra descansar da performance...",
        p: "Autenticidade não é uma técnica pra dominar, é um convite pra descansar. Você não precisa parecer inteligente, séria ou impecável. Pode simplesmente ser quem você é, do jeito que está hoje. Quando você para de tentar controlar a impressão que passa, algo relaxa, e é exatamente aí que as pessoas se conectam de verdade com você."
      },
      challenger: {
        note: "Chega de ensaio...",
        p: "Chega de ensaiar pra parecer inteligente, séria ou 'profissional o suficiente'. Isso é performance, não autenticidade. Enquanto você estiver mais preocupada com a imagem do que com a verdade, a câmera vai continuar te vendo como atriz, não como pessoa. Larga o roteiro mental. Fala o que pulsa de verdade, mesmo que saia torto."
      },
      strategic: {
        note: "Uma observação prática sobre conexão...",
        p: "Observação prática: vídeos ensaiados demais geram menos conexão que vídeos genuínos, mesmo tecnicamente mais 'imperfeitos'. Autenticidade, aqui, não é filosofia, é a estratégia que realmente funciona. Pare de otimizar pra parecer inteligente ou séria, e otimize pra ser real. É isso que faz a câmera desaparecer."
      },
      inspirational: {
        note: "A verdade sobre a autenticidade...",
        p: "A autenticidade não é uma técnica que você simula com ensaios. É algo que você permite acontecer. Quando você desiste de tentar parecer inteligente, séria ou impecavelmente profissional, e simplesmente compartilha o que de verdade pulsa em seu coração, a câmera desaparece. As pessoas não se conectam com conceitos frios; elas se conectam com humanos reais."
      }
    },
    en: {
      gentle: {
        note: "An invitation to rest from performing...",
        p: "Authenticity isn't a technique to master, it's an invitation to rest. You don't need to look smart, serious, or flawless. You can simply be who you are, exactly as you are today. When you stop trying to control the impression you give, something relaxes, and that's exactly where people truly connect with you."
      },
      challenger: {
        note: "Enough with the rehearsal...",
        p: "Enough rehearsing to look smart, serious, or 'professional enough.' That's performance, not authenticity. As long as you're more worried about the image than the truth, the camera will keep seeing an actress, not a person. Drop the mental script. Say what truly pulses in you, even if it comes out messy."
      },
      strategic: {
        note: "A practical note on connection...",
        p: "Practical observation: overly rehearsed videos generate less connection than genuine ones, even when technically more 'imperfect.' Authenticity, here, isn't philosophy, it's the strategy that actually works. Stop optimizing to look smart or serious, and optimize to be real. That's what makes the camera disappear."
      },
      inspirational: {
        note: "The truth about authenticity...",
        p: "Authenticity is not a technique you simulate with rehearsals. It is something you allow to happen. When you give up trying to look smart, serious, or flawlessly professional, and simply share what truly pulses in your heart, the camera disappears. People don't connect with cold concepts; they connect with real, vulnerable humans."
      }
    },
    es: {
      gentle: {
        note: "Una invitación a descansar de la actuación...",
        p: "La autenticidad no es una técnica para dominar, es una invitación a descansar. No necesitas parecer inteligente, seria o impecable. Puedes simplemente ser quien eres, tal como estás hoy. Cuando dejas de intentar controlar la impresión que das, algo se relaja, y ahí es exactamente donde la gente se conecta de verdad contigo."
      },
      challenger: {
        note: "Basta de ensayo...",
        p: "Basta de ensayar para parecer inteligente, seria o 'suficientemente profesional'. Eso es actuación, no autenticidad. Mientras te preocupes más por la imagen que por la verdad, la cámara seguirá viendo a una actriz, no a una persona. Suelta el guion mental. Di lo que de verdad late en ti, aunque salga torpe."
      },
      strategic: {
        note: "Una observación práctica sobre la conexión...",
        p: "Observación práctica: los videos demasiado ensayados generan menos conexión que los genuinos, incluso siendo técnicamente más 'imperfectos'. La autenticidad, aquí, no es filosofía, es la estrategia que realmente funciona. Deja de optimizar para parecer inteligente o seria, y optimiza para ser real. Eso es lo que hace que la cámara desaparezca."
      },
      inspirational: {
        note: "La verdad sobre la autenticidad...",
        p: "La autenticidad no es una técnica que simulas con ensayos. Es algo que dejas suceder. Cuando renuncias a intentar parecer inteligente, seria o impecablemente profesional, y simplemente compartes lo que de verdad pulsa en tu corazón, la cámara desaparece. La gente no se conecta con conceptos fríos; se conecta con humanos reales."
      }
    }
  },
  25: {
    pt: {
      gentle: {
        note: "Olhe com carinho pra sua própria jornada...",
        p: "Olhe com carinho pra quem você era no Dia 1. Ela tinha medo, e mesmo assim apareceu. Repare como hoje suas palavras saem com mais calma, mais leveza. Você não precisa de roteiro pra se sentir segura, sua presença já é suficiente. Respire fundo. Você chegou até aqui, e isso já é enorme."
      },
      challenger: {
        note: "Compare e pare de duvidar...",
        p: "Compara: quem tinha medo de encarar a lente por 15 segundos no Dia 1, e quem fala com firmeza hoje. Não foi sorte, foi repetição e coragem. Então para de duvidar de si mesma agora, bem no momento em que já provou que consegue. Você é [dona/dono/done] da sua presença, age como se soubesse disso."
      },
      strategic: {
        note: "Um balanço rápido do seu progresso...",
        p: "Balanço do progresso: Dia 1 vs hoje. Você foi de 'incapaz de encarar a lente por 15 segundos' pra 'expressa pensamentos firmes sem roteiro'. Esse é um resultado mensurável, não sorte. Não precisa mais do apoio de scripts detalhados, seu próximo passo é confiar no que já foi comprovado que funciona."
      },
      inspirational: {
        note: "Olhe para a sua própria história...",
        p: "Olhe para trás neste instante. Veja quem você era no Dia 1 e quem você se tornou agora. A pessoa que achava impossível encarar a lente por 15 segundos agora expressa pensamentos firmes com maturidade e serenidade natural. Você não precisa mais de roteiros detalhados para ter segurança. Você é [dona/dono/done] da sua presença. Respire fundo, você venceu."
      }
    },
    en: {
      gentle: {
        note: "Look tenderly at your own journey...",
        p: "Look with tenderness at who you were on Day 1. She was scared, and still showed up. Notice how your words come out calmer, lighter today. You don't need a script to feel secure, your presence is already enough. Take a deep breath. You made it this far, and that's already huge."
      },
      challenger: {
        note: "Compare, and stop doubting...",
        p: "Compare: the person afraid to face the lens for 15 seconds on Day 1, and the person speaking firmly today. That wasn't luck, it was repetition and courage. So stop doubting yourself now, right when you've already proven you can. You own your presence, act like you know it."
      },
      strategic: {
        note: "A quick progress checkpoint...",
        p: "Progress checkpoint: Day 1 vs today. You went from 'unable to face the lens for 15 seconds' to 'expressing firm thoughts with no script'. That's a measurable result, not luck. You no longer need the crutch of detailed scripts, your next step is trusting what's already proven to work."
      },
      inspirational: {
        note: "Look at your own story...",
        p: "Look back right at this moment. See who you were on Day 1 and who you have become now. The person who thought it was impossible to face the lens for 15 seconds now expresses firm thoughts with maturity and natural serenity. You don't need detailed scripts anymore to feel secure. You own your presence. Breathe deep; you have won."
      }
    },
    es: {
      gentle: {
        note: "Mira con ternura tu propio camino...",
        p: "Mira con ternura a quien eras en el Día 1. Tenía miedo, y aun así apareció. Nota cómo tus palabras salen hoy más calmadas, más ligeras. No necesitas un guion para sentirte segura, tu presencia ya es suficiente. Respira hondo. Llegaste hasta aquí, y eso ya es enorme."
      },
      challenger: {
        note: "Compara, y deja de dudar...",
        p: "Compara: quien tenía miedo de mirar a la lente por 15 segundos en el Día 1, y quien habla con firmeza hoy. No fue suerte, fue repetición y coraje. Así que deja de dudar de ti misma justo ahora, cuando ya demostraste que puedes. Eres [dueña/dueño/dueñe] de tu presencia, actúa como si lo supieras."
      },
      strategic: {
        note: "Un balance rápido de tu progreso...",
        p: "Balance de progreso: Día 1 vs hoy. Pasaste de 'incapaz de mirar a la lente por 15 segundos' a 'expresar pensamientos firmes sin guion'. Es un resultado medible, no suerte. Ya no necesitas el apoyo de guiones detallados, tu próximo paso es confiar en lo que ya demostró que funciona."
      },
      inspirational: {
        note: "Mira tu propia historia...",
        p: "Mira hacia atrás en este instante. Mira quién eras en el Día 1 y en quién te has convertido ahora. La persona que pensaba que era imposible mirar a la lente por 15 segundos ahora expresa pensamientos firmes con madurez y serenidad natural. Ya no necesitas guiones detallados para tener seguridad. Eres [dueña/dueño/dueñe] de tu presencia. Respira hondo, ganaste."
      }
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
  onGoToLibrary,
  isAdminUnlocked,
  onJumpToDay,
}: DailyMissionViewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [maxReachedProgress, setMaxReachedProgress] = useState(0);
  const [audioSpeed, setAudioSpeed] = useState(1);
  const [audioCompleted, setAudioCompleted] = useState(false);
  // Dias 1-7 mostram vídeo em vez de áudio (showDailyVideo), então
  // audioCompleted nunca fica true nesses dias (não existe elemento
  // <audio> pra disparar onEnded). Rastreado à parte, via postMessage do
  // player do YouTube quando o vídeo termina de tocar.
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeHookTab, setActiveHookTab] = useState<number>(0);
  const [customHookIdea, setCustomHookIdea] = useState('');
  const [reflectionInput, setReflectionInput] = useState('');
  const [promiseLinks, setPromiseLinks] = useState({ inertia: '', confidence: '', evidence: '' });
  const [recordingLinks, setRecordingLinks] = useState<string[]>(['']);
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
  // Wednesday no longer is a passive "rest day" (removed per the weekly combo
  // redesign, every day now has a real exposure plan, see getDailyPlan in
  // templateData.ts). isRestDay is kept only as a rendering hook the
  // surrounding JSX still references, always false now.
  const isRestDay = false;
  // Tuesday, from Day 8 onward, is the batch-production day (no recording
  // obligation): the 3 link boxes swap for a single free-text field, still
  // stored in promiseLinks.inertia so it counts toward progress the same way.
  const isBatchProductionDay = currentDay.dayNumber > 7 && currentDay.type === DayType.Truth;
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
    setVideoCompleted(false);
    setActiveHookTab(0);
    setCustomHookIdea('');
    setIsDailyVideoPlaying(false);
    setReflectionInput(progress.reflections[currentDay.dayNumber] || '');
    const savedLinkData = progress.videoLinks[currentDay.dayNumber] || '';
    if (isBatchProductionDay) {
      setPromiseLinks({ inertia: savedLinkData, confidence: '', evidence: '' });
      setRecordingLinks(['']);
    } else {
      setPromiseLinks({ inertia: '', confidence: '', evidence: '' });
      setRecordingLinks(savedLinkData ? savedLinkData.split(LINK_SEPARATOR) : ['']);
    }

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
      logEngagementEvent('daily_audio', String(currentDay.dayNumber), currentDay.dayNumber);
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

  const handleSkipBack10 = () => {
    if (audioRef.current && duration > 0) {
      const newTime = Math.max(0, audioRef.current.currentTime - 10);
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
  // Posting the 3 proof links is optional, completion only depends on the
  // promise checkboxes, not on whether a link was pasted in for each.
  const allPromisesKept = promisesChecked.inertia && promisesChecked.confidence && promisesChecked.evidence;
  // Dias 1-7 (vídeo) validam pelo fim do vídeo, não pelo áudio, que nem
  // existe nesses dias.
  const listenStepDone = currentDay.dayNumber <= 7 ? videoCompleted : audioCompleted;
  const canComplete = isRestDay || (listenStepDone && reflectionInput.trim().length > 3 && allPromisesKept);
  const combinedPromiseLinks = isBatchProductionDay
    ? promiseLinks.inertia
    : recordingLinks.filter(l => l.trim()).join(LINK_SEPARATOR);

  const prefGrammar = resolveGrammarPreference(progress.grammarPreference);
  const guideStyle = resolveGuideStyle(progress.guideStyle);

  const fallbackPromise = { label: '', desc: '' };
  const rawContent = currentDay.content[lang] || currentDay.content['pt'] || {
    audioUrl: '',
    videoUrl: '',
    hook: '',
    scripts: ['', '', ''],
    exposureAction: '',
    reflectionQuestion: '',
    promises: [fallbackPromise, fallbackPromise, fallbackPromise] as [typeof fallbackPromise, typeof fallbackPromise, typeof fallbackPromise]
  };

  const localizedContent = {
    audioUrl: rawContent.audioUrl,
    videoUrl: rawContent.videoUrl,
    hook: adaptMessage(rawContent.hook, prefGrammar, lang),
    exposureAction: adaptMessage(rawContent.exposureAction, prefGrammar, lang),
    reflectionQuestion: adaptMessage(rawContent.reflectionQuestion, prefGrammar, lang),
    promises: rawContent.promises.map(p => ({
      label: adaptMessage(p.label, prefGrammar, lang),
      desc: adaptMessage(p.desc, prefGrammar, lang)
    })) as [{ label: string; desc: string }, { label: string; desc: string }, { label: string; desc: string }]
  };

  // Welcome-week support video preview (Days 1-7 only), same thumbnail
  // pattern as the Library's "Vídeo da Semana". Plays embedded in-app
  // (iframe) instead of linking out to YouTube: abrindo em outra aba
  // obrigava a pessoa a voltar manualmente pro app depois de assistir.
  const getYouTubeId = (url?: string): string | null => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/);
    return match ? match[1] : null;
  };
  const showDailyVideo = currentDay.dayNumber <= 7 && !!localizedContent.videoUrl;
  // Days 1-7 skip the daily audio (the support video replaces it), so the
  // Passo 01/02/03 numbering shifts down by one for that first week.
  const showDailyAudio = currentDay.dayNumber > 7;
  const dailyVideoId = getYouTubeId(localizedContent.videoUrl);
  const dailyVideoThumbnail = dailyVideoId ? `https://img.youtube.com/vi/${dailyVideoId}/hqdefault.jpg` : null;
  const [isDailyVideoPlaying, setIsDailyVideoPlaying] = useState(false);
  const [showManualVideoFallback, setShowManualVideoFallback] = useState(false);
  useEffect(() => {
    if (!isDailyVideoPlaying) {
      setShowManualVideoFallback(false);
      return;
    }
    const timer = setTimeout(() => setShowManualVideoFallback(true), 20000);
    return () => clearTimeout(timer);
  }, [isDailyVideoPlaying]);
  const dailyVideoPlayerRef = useRef<any>(null);
  const dailyVideoPlayerElId = `daily-video-player-${currentDay.dayNumber}`;

  // Usa a API real do player do YouTube (carrega o script oficial uma
  // única vez) em vez de um iframe cru com postMessage manual: o iframe
  // cru às vezes não iniciava no primeiro clique (precisava clicar 2x) e a
  // detecção de "vídeo terminou" via postMessage não era confiável. Com
  // YT.Player de verdade, onStateChange dispara certo em ENDED (estado 0).
  useEffect(() => {
    if (!isDailyVideoPlaying || !dailyVideoId) return;
    let cancelled = false;

    const createPlayer = () => {
      if (cancelled) return;
      dailyVideoPlayerRef.current = new (window as any).YT.Player(dailyVideoPlayerElId, {
        videoId: dailyVideoId,
        playerVars: { autoplay: 1, playsinline: 1 },
        events: {
          onStateChange: (e: any) => {
            if (e.data === (window as any).YT.PlayerState.ENDED) {
              setVideoCompleted(true);
            }
          }
        }
      });
    };

    if ((window as any).YT && (window as any).YT.Player) {
      createPlayer();
    } else {
      const existingScript = document.getElementById('youtube-iframe-api-script');
      if (!existingScript) {
        const script = document.createElement('script');
        script.id = 'youtube-iframe-api-script';
        script.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(script);
      }
      const previousReady = (window as any).onYouTubeIframeAPIReady;
      (window as any).onYouTubeIframeAPIReady = () => {
        previousReady?.();
        createPlayer();
      };
    }

    return () => {
      cancelled = true;
      dailyVideoPlayerRef.current?.destroy?.();
      dailyVideoPlayerRef.current = null;
    };
  }, [isDailyVideoPlaying, dailyVideoId, dailyVideoPlayerElId]);

  const hookOptions = getHookOptionsForDay(currentDay.dayNumber, lang, progress.journeyStartDate);
  const hookCategoryLabel = getHookCategoryLabel(currentDay.dayNumber, lang, progress.journeyStartDate);
  const actionHookOptions = getActionHookOptions(lang);

  // Translation Dictionary
  const textDict = {
    pt: {
      dailyMission: 'Missão Diária',
      lockedTitle: 'Dia Bloqueado',
      lockedDesc: 'Este passo libera amanhã. Aproveite hoje pra descansar, você já cumpriu sua promessa.',
      backToHome: 'Voltar pro Início',
      audioTitle: 'Mensagem da Renata',
      videoTitle: 'Vídeo de Apoio da Semana 1',
      videoDesc: 'Um vídeo curto da Renata só pros primeiros 7 dias, pra te acompanhar de perto nessa fase.',
      markVideoWatched: 'Já assisti até o fim, marcar como ouvido',
      videoWatch: 'Assistir no YouTube',
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
      importantNoticeTitle: 'Aviso Importante',
      importantNoticeBody: 'Já pensou poder postar reels e stories todos os dias, sem ter que pensar no que fazer? Se pensou, realizou! haha\n\nOs prompts prontos pra isso estão na Biblioteca, use-os TODOS OS DIAS na hora de postar, junto ao passo 2 "Vitrine de Hooks" até você ficar craque [sozinha/sozinho/sozinhe]!',
      importantNoticeDownload: 'Ver na Biblioteca',
      openHookHeading: 'Use uma dessas variedades de ação pra começar o seu vídeo',
      dailyHookHeadingPrefix: 'Hoje usaremos ganchos de',
      noDailyHookFallback: 'Hoje não tem hook temático, use o hook de abertura ou escreva o seu na aba "Minha Ideia".',
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
      promise2: 'Gravei um vídeo de pelo menos 30 segundos nos stories sobre meu aprendizado de hoje (ou postei uma foto com legenda honesta)',
      promise3: 'Gravei um vídeo de até 90 segundos usando um dos hooks disponíveis hoje',
      promise3StorySequence: 'Gravei uma sequência de pelo menos 3 vídeos nos stories contando minha dor, a ponte que me tirou dela, e o resultado que alcancei',
      reflection7Title: 'Sua Reflexão Semanal de Crescimento',
      reflection7Questions: {
        1: [
          '1. O que te deu mais medo nessa primeira semana, e o que aconteceu de verdade quando você fez mesmo com medo?',
          '2. Qual pequena vitória dessa semana você quase não comemorou, mas devia?',
          '3. O que você entendeu sobre perfeccionismo que não sabia sete dias atrás?'
        ],
        2: [
          '1. O que mais te surpreendeu na sua capacidade de agir esta semana?',
          '2. O que se tornou visivelmente mais fácil em relação ao primeiro dia?',
          '3. Do que exatamente você sente mais orgulho em si mesma?'
        ],
        3: [
          '1. Qual foi o momento mais autêntico que você compartilhou essa semana, e como foi soltar isso pro mundo?',
          '2. Que parte da sua história você teve coragem de contar, que antes guardava só pra você?',
          '3. Onde você sentiu mais honestidade emocional essa semana, mesmo sem ser confortável?'
        ],
        4: [
          '1. Em que momento essa semana você parou de "tentar" e sentiu que aquilo já é quem você é?',
          '2. O que mudou na forma como você se apresenta, comparado a quem você era no dia 1?',
          '3. Qual prova concreta você tem hoje de que essa nova identidade já é real, não só um objetivo?'
        ]
      } as Record<number, [string, string, string]>,
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
      promise2Label: 'Promessa 2: Vídeo ou Foto de Aprendizado nos Stories',
      promise3Label: 'Promessa 3: Vídeo com Hook',
      promise3LabelStorySequence: 'Promessa 3: Sequência de Stories',
      progressLockTitle: 'Requisitos de Conclusão',
      statusTitle: 'Status do Dia',
      listenItem: '1. Ouvir a Mensagem da Renata',
      promisesItem: '2. Gravações de Hoje',
      recordingsLinkInstruction: 'Cole aqui o link do que você postou hoje',
      batchProductionInstruction: 'Registre aqui o que você organizou ou produziu (ideias, roteiros, conteúdo gravado pra usar). Hoje é dia de organizar teu conteúdo, mas se você postar, registre também o link da postagem nessa mesma caixinha.',
      batchProductionPlaceholder: 'Ex: gerei 5 roteiros de Reels na Renata OS, deixei 3 vídeos de 7s já gravados pra quarta...',
      completedStatus: 'Concluído',
      pendingStatus: 'Pendente',
      reflectionMoment: 'Momento de Reflexão:',
      readLetterTooltip: 'Ler Carta da Renata',
      favoriteTooltip: 'Favoritar Gancho',
      linkRequiredTitle: 'Link de comprovação (obrigatório)',
      linkRequiredPlaceholder: 'Cole o link aqui...',
      linkRequiredWarning: 'Adicione o link para validar esta promessa.',
      audioSpeedTooltip: 'Velocidade de reprodução',
      skipBack: 'Voltar 10s',
    },
    en: {
      dailyMission: 'Daily Mission',
      lockedTitle: 'Day Locked',
      lockedDesc: 'This step unlocks tomorrow. Take today to rest, you already kept your promise.',
      backToHome: 'Back to Home',
      audioTitle: "Renata's Message",
      videoTitle: 'Week 1 Support Video',
      videoDesc: "A short video from Renata just for the first 7 days, to walk with you closely through this phase.",
      markVideoWatched: 'I watched it all, mark as done',
      videoWatch: 'Watch on YouTube',
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
      importantNoticeTitle: 'Important Notice',
      importantNoticeBody: "Ever wished you could post reels and stories every day without having to think about what to post? Well, wish granted! haha\n\nThe ready-made prompts for that are in the Library, use them EVERY DAY when posting, alongside Step 2 \"Hook Showcase\", until you become a pro on your own!",
      importantNoticeDownload: 'View in Library',
      openHookHeading: "Today we'll use action hooks",
      dailyHookHeadingPrefix: "Today's hook theme:",
      noDailyHookFallback: 'No themed hook today, use the opening hook, or write your own in the "My Idea" tab.',
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
      promise2: "Recorded a video at least 30 seconds long on my Stories about today's biggest takeaway (or posted a photo with an honest caption)",
      promise3: "Recorded a video up to 90 seconds long using one of today's available hooks",
      promise3StorySequence: 'Recorded a sequence of at least 3 Stories telling my pain, the bridge that got me past it, and the result I reached',
      reflection7Title: 'Your Weekly Growth Reflection',
      reflection7Questions: {
        1: [
          '1. What scared you the most this first week, and what actually happened when you did it scared anyway?',
          '2. What small win this week did you almost not celebrate, but should have?',
          '3. What did you understand about perfectionism that you didn\'t know seven days ago?'
        ],
        2: [
          '1. What surprised you the most about your capacity to act this week?',
          '2. What has become visibly easier compared to the first day?',
          '3. What exactly are you most proud of about yourself?'
        ],
        3: [
          '1. What was the most authentic moment you shared this week, and what was it like letting it go out into the world?',
          '2. What part of your story did you have the courage to tell, that you used to keep only to yourself?',
          '3. Where did you feel the most emotional honesty this week, even when it wasn\'t comfortable?'
        ],
        4: [
          '1. What moment this week did you stop "trying" and feel that this is already who you are?',
          '2. What changed in how you show up, compared to who you were on day 1?',
          '3. What concrete proof do you have today that this new identity is already real, not just a goal?'
        ]
      } as Record<number, [string, string, string]>,
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
      promise2Label: 'Promise 2: Learning Video or Photo on Stories',
      promise3Label: 'Promise 3: Hook Video',
      promise3LabelStorySequence: 'Promise 3: Stories Sequence',
      progressLockTitle: 'Completion Requirements',
      statusTitle: 'Day Status',
      listenItem: "1. Listen to Renata's Message",
      promisesItem: "2. Today's Recordings",
      recordingsLinkInstruction: "Paste the link to what you posted today",
      batchProductionInstruction: "Log here what you organized or produced (ideas, scripts, content recorded for later use). Today is for organizing your content, but if you do post, log that link in this same box too.",
      batchProductionPlaceholder: 'E.g.: generated 5 Reels scripts on Renata OS, pre-recorded 3 seven-second videos for Wednesday...',
      completedStatus: 'Completed',
      pendingStatus: 'Pending',
      reflectionMoment: 'Reflection Moment:',
      readLetterTooltip: "Read Renata's Letter",
      favoriteTooltip: 'Favorite Hook',
      linkRequiredTitle: 'Proof link (required)',
      linkRequiredPlaceholder: 'Paste the link here...',
      linkRequiredWarning: 'Add the link to validate this promise.',
      audioSpeedTooltip: 'Playback speed',
      skipBack: 'Back 10s',
    },
    es: {
      dailyMission: 'Misión Diaria',
      lockedTitle: 'Día Bloqueado',
      lockedDesc: 'Este paso se libera mañana. Aprovecha hoy para descansar, ya cumpliste tu promesa.',
      backToHome: 'Volver al Inicio',
      audioTitle: 'Mensaje de Renata',
      videoTitle: 'Video de Apoyo de la Semana 1',
      videoDesc: 'Un video corto de Renata solo para los primeros 7 días, para acompañarte de cerca en esta fase.',
      markVideoWatched: 'Ya lo vi hasta el final, marcar como escuchado',
      videoWatch: 'Ver en YouTube',
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
      importantNoticeTitle: 'Aviso Importante',
      importantNoticeBody: '¿Ya pensaste en poder publicar reels y stories todos los días sin tener que pensar en qué hacer? ¡Si lo pensaste, se hizo realidad! jaja\n\nLos prompts listos para eso están en la Biblioteca, úsalos TODOS LOS DÍAS a la hora de publicar, junto al paso 2 "Vitrina de Hooks", hasta que te vuelvas una experta [sola/solo/sole]!',
      importantNoticeDownload: 'Ver en la Biblioteca',
      openHookHeading: 'Hoy usaremos ganchos de acción',
      dailyHookHeadingPrefix: 'Hoy usaremos ganchos de',
      noDailyHookFallback: 'Hoy no hay hook temático, usa el hook de apertura o escribe el tuyo en la pestaña "Mi Idea".',
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
      promise2: 'Grabé un video de al menos 30 segundos en mis stories sobre mi aprendizaje de hoy (o publiqué una foto con una descripción honesta)',
      promise3: 'Grabé un video de hasta 90 segundos usando uno de los hooks disponibles hoy',
      promise3StorySequence: 'Grabé una secuencia de al menos 3 stories contando mi dolor, el puente que me sacó de ahí, y el resultado que logré',
      reflection7Title: 'Tu Reflexión Semanal de Crecimiento',
      reflection7Questions: {
        1: [
          '1. ¿Qué fue lo que más miedo te dio en esta primera semana, y qué pasó de verdad cuando lo hiciste con miedo igual?',
          '2. ¿Qué pequeña victoria de esta semana casi no celebraste, pero merecía?',
          '3. ¿Qué entendiste sobre el perfeccionismo que no sabías hace siete días?'
        ],
        2: [
          '1. ¿Qué es lo que más te sorprendió de tu capacidad para actuar esta semana?',
          '2. ¿Qué se ha vuelto visiblemente más fácil en relación con el primer día?',
          '3. ¿De qué te sientes exactamente más orgulloso de ti mismo?'
        ],
        3: [
          '1. ¿Cuál fue el momento más auténtico que compartiste esta semana, y cómo fue soltarlo al mundo?',
          '2. ¿Qué parte de tu historia tuviste el coraje de contar, que antes guardabas solo para ti?',
          '3. ¿Dónde sentiste más honestidad emocional esta semana, aunque no fuera cómodo?'
        ],
        4: [
          '1. ¿En qué momento de esta semana dejaste de "intentar" y sentiste que eso ya es quien eres?',
          '2. ¿Qué cambió en la forma en que te muestras, comparado con quién eras el día 1?',
          '3. ¿Qué prueba concreta tienes hoy de que esta nueva identidad ya es real, no solo un objetivo?'
        ]
      } as Record<number, [string, string, string]>,
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
      promise2Label: 'Promesa 2: Video o Foto de Aprendizaje en Stories',
      promise3Label: 'Promesa 3: Video con Hook',
      promise3LabelStorySequence: 'Promesa 3: Secuencia de Stories',
      progressLockTitle: 'Requisitos de Finalización',
      statusTitle: 'Estado del Día',
      listenItem: '1. Escuchar el Mensaje de Renata',
      promisesItem: '2. Grabaciones de Hoy',
      recordingsLinkInstruction: 'Pega aquí el enlace de lo que publicaste hoy',
      batchProductionInstruction: 'Registra aquí lo que organizaste o produjiste (ideas, guiones, contenido grabado para usar). Hoy es día de organizar tu contenido, pero si publicas, registra también el enlace de la publicación en esta misma caja.',
      batchProductionPlaceholder: 'Ej: generé 5 guiones de Reels en la Renata OS, dejé 3 videos de 7s ya grabados para el miércoles...',
      completedStatus: 'Completado',
      pendingStatus: 'Pendiente',
      reflectionMoment: 'Momento de Reflexión:',
      readLetterTooltip: 'Leer Carta de Renata',
      favoriteTooltip: 'Marcar Gancho como Favorito',
      linkRequiredTitle: 'Enlace de prueba (obligatorio)',
      linkRequiredPlaceholder: 'Pega el enlace aquí...',
      linkRequiredWarning: 'Agrega el enlace para validar esta promesa.',
      audioSpeedTooltip: 'Velocidad de reproducción',
      skipBack: 'Retroceder 10s',
    }
  }[lang];

  const stepLabelExposure = showDailyAudio ? textDict.step02 : textDict.step01;
  const stepLabelHook = showDailyAudio ? textDict.step03 : textDict.step02;

  // A newly-unlocked day waits for the real next calendar day, except a
  // completion late at night (before LATE_NIGHT_UNLOCK_CUTOFF_HOUR) is
  // backdated to "yesterday" via dayUnlockAnchorDate, so finishing right
  // after midnight opens the next day immediately instead of trapping the
  // person into waiting for a second midnight.
  const isWaitingForNewCalendarDay = currentDay.dayNumber === progress.currentDay
    && currentDay.dayNumber > 1
    && !isCompleted
    && progress.dayUnlockAnchorDate === getLocalDateISO();

  if (isWaitingForNewCalendarDay) {
    return (
      <div className="max-w-md mx-auto space-y-10 py-16">
        {isAdminUnlocked && onJumpToDay && (
          <div className="flex items-center justify-center gap-3 rounded-xl border border-dashed border-rosegold/40 bg-rosegold/5 px-4 py-2.5">
            <button
              onClick={() => onJumpToDay(Math.max(1, currentDay.dayNumber - 1))}
              disabled={currentDay.dayNumber <= 1}
              className="h-8 w-8 flex items-center justify-center rounded-lg border border-rosegold/40 text-rosegold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-rosegold/10 transition cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-[11px] font-mono uppercase tracking-wider text-rosegold">
              Admin · Dia {currentDay.dayNumber} / 30
            </span>
            <button
              onClick={() => onJumpToDay(Math.min(30, currentDay.dayNumber + 1))}
              disabled={currentDay.dayNumber >= 30}
              className="h-8 w-8 flex items-center justify-center rounded-lg border border-rosegold/40 text-rosegold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-rosegold/10 transition cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
        <div className="text-center space-y-5">
          <div className="h-14 w-14 rounded-2xl bg-rose-50 dark:bg-rosegold/10 text-rosegold flex items-center justify-center mx-auto">
            <Lock className="h-6 w-6" />
          </div>
          <EditableText
            contentKey="dailyMission.lockedTitle"
            fallback={textDict.lockedTitle}
            as="h2"
            className="text-lg font-serif font-bold text-slate-800 dark:text-white"
          />
          <EditableText
            contentKey="dailyMission.lockedDesc"
            fallback={textDict.lockedDesc}
            as="p"
            className="text-sm text-slate-500 dark:text-ink-muted leading-relaxed"
          />
          <button
            onClick={onBackToHome}
            className="px-8 py-3 rounded-xl bg-rosegold hover:bg-[#A35D68] text-white dark:bg-transparent dark:border dark:border-rosegold-light dark:text-rosegold-light dark:hover:bg-rosegold-light/10 text-xs font-sans font-bold uppercase tracking-wider transition cursor-pointer"
          >
            <EditableText contentKey="dailyMission.backToHome" fallback={textDict.backToHome} as="span" />
          </button>
        </div>

        {/* The SOS trigger must stay reachable even on a locked day —
            emotional support shouldn't depend on the next day being open. */}
        <div className="rounded-[1.5rem] border border-rose-150/40 dark:border-ink-hairline bg-[#251E1C]/5 dark:bg-ink/30 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-rosegold/10 text-rosegold shrink-0">
              <Heart className="h-4.5 w-4.5 fill-current text-rosegold animate-pulse" />
            </div>
            <div className="min-w-0 flex-1">
              <EditableText
                contentKey="dailyMission.sosHeading"
                fallback={textDict.sosHeading}
                as="h4"
                className="text-xs font-bold text-slate-800 dark:text-ink-text font-sans tracking-wide leading-relaxed"
              />
            </div>
          </div>
          <button
            onClick={onTriggerSos}
            className="w-full sm:w-auto shrink-0 px-4 py-2 rounded-xl bg-rosegold hover:bg-[#A35D68] text-[10px] font-sans font-bold uppercase tracking-wider text-white transition-all duration-300 cursor-pointer shadow-rosegold animate-pulse"
          >
            <EditableText contentKey="dailyMission.sosTrigger" fallback={textDict.sosTrigger} as="span" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none relative">

      {/* Admin-only day jumper: browse any day's content without touching
          real progress or requiring completion. Not shown to real users. */}
      {isAdminUnlocked && onJumpToDay && (
        <div className="flex items-center justify-center gap-3 rounded-xl border border-dashed border-rosegold/40 bg-rosegold/5 px-4 py-2.5">
          <button
            onClick={() => onJumpToDay(Math.max(1, currentDay.dayNumber - 1))}
            disabled={currentDay.dayNumber <= 1}
            className="h-8 w-8 flex items-center justify-center rounded-lg border border-rosegold/40 text-rosegold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-rosegold/10 transition cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-[11px] font-mono uppercase tracking-wider text-rosegold">
            Admin · Dia {currentDay.dayNumber} / 30
          </span>
          <button
            onClick={() => onJumpToDay(Math.min(30, currentDay.dayNumber + 1))}
            disabled={currentDay.dayNumber >= 30}
            className="h-8 w-8 flex items-center justify-center rounded-lg border border-rosegold/40 text-rosegold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-rosegold/10 transition cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

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
            <motion.img
              src="/assets/images/butterfly.png"
              alt=""
              animate={{ scaleY: [1, 0.78, 1], skewX: [0, 3, 0] }}
              transition={{ duration: 0.4, repeat: Infinity, ease: "easeInOut" }}
              className="h-7 w-auto"
              style={{ transformOrigin: 'center 70%' }}
            />
            <span className="text-[11px] text-[#D4AF37] opacity-60 block font-serif tracking-widest mt-1">✨</span>
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
              className="bg-[#FAF8F5] dark:bg-ink-raised max-w-lg w-full rounded-[2rem] p-8 sm:p-10 border border-rosegold/35 shadow-rosegold text-left relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 h-32 w-32 bg-gradient-to-bl from-rosegold/15 to-transparent blur-2xl rounded-full dark:hidden" />
              <button 
                onClick={() => setShowSurpriseLetter(false)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-rosegold transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2.5">
                <Smile className="h-5 w-5 text-rosegold animate-bounce" />
                <span className="text-[10px] tracking-[0.2em] font-sans font-bold text-rosegold uppercase">
                  {adaptMessage(surpriseLetters[currentDay.dayNumber as keyof typeof surpriseLetters][lang][guideStyle].note, prefGrammar, lang)}
                </span>
              </div>

              {/* Serif handwritten aesthetic body */}
              <div className="font-display italic text-slate-700 dark:text-ink-text text-base sm:text-lg leading-relaxed pt-3 border-l-2 border-rosegold/30 pl-5 space-y-4">
                <p>
                  {adaptMessage(surpriseLetters[currentDay.dayNumber as keyof typeof surpriseLetters][lang][guideStyle].p, prefGrammar, lang)}
                </p>
              </div>

              <div className="flex justify-end pt-6">
                <button
                  onClick={() => setShowSurpriseLetter(false)}
                  className="px-6 py-3 bg-rosegold hover:bg-[#A35D68] text-white dark:bg-transparent dark:border dark:border-rosegold-light dark:text-rosegold-light dark:hover:bg-rosegold-light/10 text-xs font-sans font-bold uppercase tracking-[0.15em] rounded-xl shadow-rosegold dark:shadow-none transition-all cursor-pointer hover:scale-[1.02]"
                >
                  <EditableText contentKey="dailyMission.closeLetter" fallback={textDict.closeLetter} as="span" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Day Header, directly on the page background, no card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6"
      >
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-gradient-to-r from-rosegold to-rosegold-light text-[11px] uppercase font-sans tracking-[0.2em] rounded-full font-bold text-white shadow-rosegold">
              <EditableText contentKey="dailyMission.dailyMission" fallback={textDict.dailyMission} as="span" /> • {currentDay.dayNumber}/30
            </span>
            <span className="px-2.5 py-1 bg-rosegold/10 text-[11px] uppercase font-mono tracking-[0.25em] rounded-full border border-rosegold/15 font-semibold text-rosegold">
              {localizedPhase.title}
            </span>
            {isCompleted && (
              <span className="px-3 py-1 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[11px] uppercase font-sans tracking-[0.2em] rounded-full border border-emerald-500/20 font-bold">
                <EditableText contentKey="dailyMission.completedBadge" fallback={textDict.completedBadge} as="span" />
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
              className="rounded-[2rem] border border-rose-150/30 dark:border-ink-hairline bg-white/45 dark:bg-ink-raised backdrop-blur-md dark:backdrop-blur-none p-8 sm:p-10 text-center space-y-8 shadow-rosegold overflow-hidden relative"
            >
              {/* Sacred Friday background elements */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-44 w-44 bg-emerald-500/5 blur-3xl rounded-full dark:hidden" />
              
              <div className="mx-auto max-w-md space-y-6 relative z-10">
                <span className="text-[11px] uppercase font-sans tracking-[0.25em] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-full">
                  <EditableText contentKey="dailyMission.sanctuaryTitle" fallback={textDict.sanctuaryTitle} as="span" />
                </span>

                <div className="p-5 bg-emerald-50/40 dark:bg-ink-raised/30 rounded-2xl border border-emerald-500/10 max-w-sm mx-auto">
                  <p className="text-emerald-800 dark:text-emerald-400 italic font-medium font-display text-sm leading-relaxed">
                    "<EditableText contentKey="dailyMission.restDayQuote" fallback={textDict.restDayQuote} as="span" />"
                  </p>
                </div>

                <EditableText
                  contentKey="dailyMission.restDayDescription"
                  fallback={textDict.restDayDescription}
                  as="p"
                  className="text-slate-600 dark:text-ink-muted text-xs sm:text-sm leading-relaxed font-sans"
                />

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
                    {breathState === 'inhale' && <EditableText contentKey="dailyMission.inhale" fallback={textDict.inhale} as="span" />}
                    {breathState === 'hold' && <EditableText contentKey="dailyMission.hold" fallback={textDict.hold} as="span" />}
                    {breathState === 'exhale' && <EditableText contentKey="dailyMission.exhale" fallback={textDict.exhale} as="span" />}
                    {breathState === 'rest' && <EditableText contentKey="dailyMission.rest" fallback={textDict.rest} as="span" />}
                  </span>
                </div>
              </div>
            </motion.div>
          ) : (
            <>
              {/* Today's Message (not numbered, it's a message, not a step) */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-[2rem] bg-white dark:bg-ink-raised border border-rose-100/20 dark:border-ink-hairline p-6 sm:p-8 shadow-rosegold space-y-5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-sans tracking-[0.2em] text-rosegold uppercase font-bold">
                    <EditableText contentKey="dailyMission.hookTitle" fallback={textDict.hookTitle} as="span" />
                  </span>

                  <button
                    onClick={() => copyToClipboard(localizedContent.hook)}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rosegold transition-colors duration-250 cursor-pointer hover:scale-105"
                  >
                    {copiedHook ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-emerald-500 font-bold"><EditableText contentKey="dailyMission.copied" fallback={textDict.copied} as="span" /></span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span><EditableText contentKey="dailyMission.copy" fallback={textDict.copy} as="span" /></span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-6 rounded-2xl bg-gradient-to-br from-rose-50/10 via-[#FAF8F5] to-rose-50/5 dark:bg-none! dark:bg-transparent! border border-rose-100/15 dark:border-ink-hairline shadow-sm dark:shadow-none">
                  <p className="text-slate-800 dark:text-ink-text font-display text-lg sm:text-xl italic leading-relaxed">
                    "{localizedContent.hook}"
                  </p>
                </div>
              </motion.div>

              {/* Week 1 support video preview (Days 1-7 only) */}
              {showDailyVideo && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className="rounded-[2rem] bg-white dark:bg-ink-raised border border-rose-100/20 dark:border-ink-hairline p-6 sm:p-8 shadow-rosegold space-y-4"
                >
                  <span className="text-[11px] font-sans tracking-[0.2em] text-rosegold uppercase font-bold">
                    <EditableText contentKey="dailyMission.videoTitle" fallback={textDict.videoTitle} as="span" />
                  </span>
                  {isDailyVideoPlaying && dailyVideoId ? (
                    <div className="rounded-2xl overflow-hidden aspect-video bg-slate-900">
                      <div id={dailyVideoPlayerElId} className="w-full h-full" />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        logEngagementEvent('daily_support_video', String(currentDay.dayNumber));
                        setIsDailyVideoPlaying(true);
                      }}
                      className="block group w-full cursor-pointer"
                    >
                      <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-900">
                        {dailyVideoThumbnail && (
                          <img
                            src={dailyVideoThumbnail}
                            alt={textDict.videoTitle}
                            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-250"
                          />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors duration-250">
                          <div className="h-14 w-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-250">
                            <Play className="h-6 w-6 text-slate-900 ml-0.5" fill="currentColor" />
                          </div>
                        </div>
                      </div>
                    </button>
                  )}
                  <p className="text-xs text-slate-500 dark:text-ink-muted leading-relaxed">{textDict.videoDesc}</p>
                  {/* Fallback manual escondido por padrão agora que a
                      detecção automática (YT.Player onStateChange) está
                      funcionando. Só aparece depois de um tempo assistindo
                      sem detectar o fim, pra nunca travar a conclusão do
                      dia se algo falhar (rede, bloqueio de terceiros). */}
                  {isDailyVideoPlaying && !videoCompleted && showManualVideoFallback && (
                    <button
                      type="button"
                      onClick={() => setVideoCompleted(true)}
                      className="text-xs font-sans font-semibold text-rosegold dark:text-rosegold-light hover:underline cursor-pointer"
                    >
                      {textDict.markVideoWatched}
                    </button>
                  )}
                </motion.div>
              )}

              {/* STEP 1: Calming Audio Session (days 8+ only, see showDailyAudio) */}
              {showDailyAudio && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-[2rem] bg-[#FAF3EF] dark:bg-ink-raised border border-rose-100/20 dark:border-ink-hairline p-6 sm:p-8 shadow-rosegold relative overflow-hidden"
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
                  <span className="text-[11px] font-sans tracking-[0.2em] text-rosegold uppercase font-extrabold block">
                    <EditableText contentKey="dailyMission.step01" fallback={textDict.step01} as="span" /> •{' '}
                    <EditableText contentKey="dailyMission.audioTitle" fallback={textDict.audioTitle} as="span" />
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setAudioRating((v) => (v === 'loved' ? null : 'loved'))}
                      title={textDict.ratingLoved}
                      className="h-9 w-9 rounded-full bg-white/70 dark:bg-white/5 border border-rose-100/40 dark:border-ink-hairline flex items-center justify-center transition-all duration-300 cursor-pointer hover:scale-105"
                    >
                      <Heart className={`h-4 w-4 transition-colors ${audioRating === 'loved' ? 'text-rosegold fill-current' : 'text-slate-400'}`} />
                    </button>
                    <button
                      onClick={() => setAudioRating((v) => (v === 'liked' ? null : 'liked'))}
                      title={textDict.ratingLiked}
                      className="h-9 w-9 rounded-full bg-white/70 dark:bg-white/5 border border-rose-100/40 dark:border-ink-hairline flex items-center justify-center transition-all duration-300 cursor-pointer hover:scale-105"
                    >
                      <ThumbsUp className={`h-4 w-4 transition-colors ${audioRating === 'liked' ? 'text-emerald-500 fill-current' : 'text-slate-400'}`} />
                    </button>
                    <button
                      onClick={() => setAudioRating((v) => (v === 'disliked' ? null : 'disliked'))}
                      title={textDict.ratingDisliked}
                      className="h-9 w-9 rounded-full bg-white/70 dark:bg-white/5 border border-rose-100/40 dark:border-ink-hairline flex items-center justify-center transition-all duration-300 cursor-pointer hover:scale-105"
                    >
                      <ThumbsDown className={`h-4 w-4 transition-colors ${audioRating === 'disliked' ? 'text-slate-600 dark:text-ink-muted fill-current' : 'text-slate-400'}`} />
                    </button>
                  </div>
                </div>

                {/* Title + duration */}
                <div className="mt-3 space-y-1 relative z-10">
                  <h3 className="text-xl sm:text-2xl font-serif font-semibold text-slate-800 dark:text-ink-text">
                    {audioCompleted
                      ? <EditableText contentKey="dailyMission.audioFinished" fallback={textDict.audioFinished} as="span" />
                      : adaptMessage(currentDay.title[lang] || currentDay.title['pt'], prefGrammar, lang)}
                  </h3>
                  <span className="text-xs text-slate-400 dark:text-ink-muted font-sans block">
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
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-16 w-16 rounded-full bg-gradient-to-br from-rosegold to-[#A35D68] shadow-rosegold flex items-center justify-center text-white transition-transform duration-300 cursor-pointer hover:scale-105 ring-4 ring-[#FAF3EF] dark:ring-ink-raised"
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
                    max="100"
                    step="0.1"
                    value={audioProgress}
                    onChange={handleSeekChange}
                    className="w-full h-1 bg-rose-200/50 dark:bg-ink-raised rounded-full appearance-none cursor-pointer accent-rosegold transition-all focus:outline-none"
                  />
                  <div className="flex items-center justify-between text-[11px] font-sans text-slate-400 dark:text-ink-muted mt-2">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Bottom control row */}
                <div className="mt-4 flex items-center justify-between relative z-10">
                  <button
                    onClick={cycleAudioSpeed}
                    title={textDict.audioSpeedTooltip}
                    className="h-10 w-10 rounded-full bg-white/70 dark:bg-white/5 border border-rose-100/40 dark:border-ink-hairline flex items-center justify-center text-xs font-sans font-bold text-rosegold transition-all duration-300 cursor-pointer hover:scale-105"
                  >
                    {audioSpeed}x
                  </button>

                  <button
                    onClick={handleSkipBack10}
                    title={textDict.skipBack}
                    className="h-10 px-3 rounded-full bg-white/70 dark:bg-white/5 border border-rose-100/40 dark:border-ink-hairline flex items-center justify-center gap-1 text-rosegold transition-all duration-300 cursor-pointer hover:scale-105"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span className="text-[10px] font-sans font-bold">10s</span>
                  </button>
                </div>
              </motion.div>
              )}

              {/* Day 1 only: important-notice callout for the hook/anti-hook
                  reference document, positioned right before Step 2 since
                  it's meant to be used alongside the Hook Showcase. */}
              {currentDay.dayNumber === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className="rounded-[2rem] bg-amber-50/60 dark:bg-accentgold/5 border border-accentgold/30 dark:border-accentgold/20 p-6 sm:p-8 shadow-xs space-y-4"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-accentgold/15 text-accentgold flex items-center justify-center shrink-0">
                      <Info className="h-4.5 w-4.5" />
                    </div>
                    <span className="text-xs font-sans font-extrabold uppercase tracking-wider text-accentgold">
                      <EditableText contentKey="dailyMission.importantNoticeTitle" fallback={textDict.importantNoticeTitle} as="span" />
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-ink-text leading-relaxed font-sans whitespace-pre-line">
                    {adaptMessage(textDict.importantNoticeBody, prefGrammar, lang)}
                  </p>
                  <button
                    onClick={onGoToLibrary}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-accentgold hover:brightness-105 text-slate-950 rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition cursor-pointer shadow-gold-accent"
                  >
                    <BookOpen className="h-4 w-4" />
                    <EditableText contentKey="dailyMission.importantNoticeDownload" fallback={textDict.importantNoticeDownload} as="span" />
                  </button>
                </motion.div>
              )}

              {/* STEP 2: Exposure Action */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-[2rem] bg-white dark:bg-ink-raised border border-rose-100/20 dark:border-ink-hairline p-6 sm:p-8 shadow-rosegold space-y-4"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-sans tracking-[0.2em] text-rosegold bg-rose-50/50 dark:bg-rosegold/10 px-3 py-1 rounded-full uppercase font-extrabold">
                    {stepLabelExposure} •{' '}
                    <EditableText contentKey="dailyMission.exposureTitle" fallback={textDict.exposureTitle} as="span" />
                  </span>
                </div>
                
                <div className="p-6 rounded-2xl bg-gradient-to-br from-rose-50/15 to-rose-50/5 dark:bg-none! dark:bg-transparent! border border-rose-100/15 dark:border-ink-hairline shadow-sm dark:shadow-none space-y-3">
                  {(() => {
                    const [title, ...bullets] = localizedContent.exposureAction.split('\n').filter(Boolean);
                    return (
                      <>
                        <p className="text-slate-800 dark:text-ink-text text-sm font-sans font-semibold leading-relaxed">
                          {title}
                        </p>
                        <ul className="space-y-2">
                          {bullets.map((bullet, idx) => (
                            <li key={idx} className="flex gap-2 text-slate-700 dark:text-ink-muted text-sm font-sans leading-relaxed">
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


              {/* STEP 3: Weekly Hook Showcase (opening hook / daily hook / own idea) */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-[2rem] bg-white dark:bg-ink-raised border border-rose-100/20 dark:border-ink-hairline p-6 sm:p-8 shadow-rosegold space-y-5"
              >
                <div className="flex items-center justify-between pb-2 border-b border-rose-100/15 dark:border-ink-hairline">
                  <span className="text-[11px] font-sans tracking-[0.2em] text-rosegold uppercase font-bold">
                    {stepLabelHook} •{' '}
                    <EditableText contentKey="dailyMission.hookShowcaseTitle" fallback={textDict.hookShowcaseTitle} as="span" />
                  </span>
                </div>

                <div className="flex gap-1.5 bg-rose-50/30 dark:bg-rosegold/5 p-1.5 rounded-xl">
                  {[
                    { key: 'dailyMission.tabOpenLabel', label: textDict.tabOpenLabel },
                    { key: 'dailyMission.tabDailyLabel', label: textDict.tabDailyLabel },
                    { key: 'dailyMission.tabIdeaLabel', label: textDict.tabIdeaLabel }
                  ].map(({ key, label }, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveHookTab(idx)}
                      className={`flex-1 py-2 rounded-lg text-xs font-sans font-semibold transition-all duration-300 cursor-pointer ${
                        activeHookTab === idx
                          ? 'bg-rosegold text-white shadow-sm'
                          : 'text-slate-500 hover:text-rosegold hover:bg-rose-50/50'
                      }`}
                    >
                      <EditableText contentKey={key} fallback={label} as="span" />
                    </button>
                  ))}
                </div>

                {activeHookTab === 0 && (
                  <div className="space-y-3">
                    <EditableText
                      contentKey="dailyMission.openHookHeading"
                      fallback={textDict.openHookHeading}
                      as="h4"
                      className="text-sm font-bold text-slate-800 dark:text-ink-text font-sans"
                    />
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {actionHookOptions.map((option, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50/30 dark:bg-rosegold/5 border border-rose-100/10 dark:border-ink-hairline"
                        >
                          <span className="flex-1 text-sm text-slate-700 dark:text-ink-muted font-sans leading-relaxed">
                            {option}
                          </span>
                          <button
                            onClick={() => copyActionHookOption(option, idx)}
                            className="shrink-0 flex items-center gap-1.5 text-xs font-sans text-slate-500 hover:text-rosegold transition-colors duration-250 cursor-pointer font-bold"
                          >
                            {copiedActionHookIndex === idx ? (
                              <>
                                <Check className="h-3.5 w-3.5 text-emerald-500" />
                                <span className="text-emerald-500"><EditableText contentKey="dailyMission.copiedHookLabel" fallback={textDict.copiedHookLabel} as="span" /></span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5" />
                                <span><EditableText contentKey="dailyMission.copyHook" fallback={textDict.copyHook} as="span" /></span>
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
                      <h4 className="text-sm font-bold text-slate-800 dark:text-ink-text font-sans">
                        <EditableText contentKey="dailyMission.dailyHookHeadingPrefix" fallback={textDict.dailyHookHeadingPrefix} as="span" /> {hookCategoryLabel}
                      </h4>
                    )}
                    {hookOptions.length > 0 ? (
                      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                        {hookOptions.map((option, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50/30 dark:bg-rosegold/5 border border-rose-100/10 dark:border-ink-hairline"
                          >
                            <span className="flex-1 text-sm text-slate-700 dark:text-ink-muted font-sans leading-relaxed">
                              {option}
                            </span>
                            <button
                              onClick={() => copyHookOption(option, idx)}
                              className="shrink-0 flex items-center gap-1.5 text-xs font-sans text-slate-500 hover:text-rosegold transition-colors duration-250 cursor-pointer font-bold"
                            >
                              {copiedHookOptionIndex === idx ? (
                                <>
                                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                                  <span className="text-emerald-500"><EditableText contentKey="dailyMission.copiedHookLabel" fallback={textDict.copiedHookLabel} as="span" /></span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3.5 w-3.5" />
                                  <span><EditableText contentKey="dailyMission.copyHook" fallback={textDict.copyHook} as="span" /></span>
                                </>
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EditableText
                        contentKey="dailyMission.noDailyHookFallback"
                        fallback={textDict.noDailyHookFallback}
                        as="p"
                        className="text-xs text-slate-500 dark:text-ink-muted italic font-sans p-3.5 rounded-xl bg-rose-50/30 dark:bg-rosegold/5 border border-rose-100/10 dark:border-ink-hairline"
                      />
                    )}
                  </div>
                )}

                {activeHookTab === 2 && (
                  <div className="space-y-3">
                    <EditableText
                      contentKey="dailyMission.ideaHeading"
                      fallback={textDict.ideaHeading}
                      as="h4"
                      className="text-sm font-bold text-slate-800 dark:text-ink-text font-sans"
                    />
                    <EditableText
                      contentKey="dailyMission.ideaSubtitle"
                      fallback={textDict.ideaSubtitle}
                      as="p"
                      className="text-xs text-slate-500 dark:text-ink-muted font-sans"
                    />
                    <textarea
                      value={customHookIdea}
                      onChange={(e) => setCustomHookIdea(e.target.value)}
                      placeholder={textDict.ideaPlaceholder}
                      rows={3}
                      className="w-full text-sm bg-[#FAF8F5] dark:bg-ink border border-rose-100/10 focus:border-rosegold focus:outline-none focus:ring-1 focus:ring-rosegold rounded-xl p-3.5 text-slate-700 dark:text-ink-text transition-all duration-300 shadow-xs resize-none"
                    />
                  </div>
                )}
              </motion.div>
              {/* THE THREE VIDEO / PROMISES EXPERIENCE - Mandatory Checklist */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-[2rem] border border-amber-200/40 dark:border-amber-500/10 bg-[#FFFDF9] dark:bg-ink-raised/30 p-6 sm:p-8 shadow-rosegold space-y-5"
              >
                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-amber-100 flex items-center gap-2 font-sans tracking-wide">
                    <Sparkles className="h-4.5 w-4.5 text-accentgold animate-pulse" />
                    <EditableText contentKey="dailyMission.promisesTitle" fallback={textDict.promisesTitle} as="span" />
                  </h3>
                  <EditableText
                    contentKey="dailyMission.promisesSubtitle"
                    fallback={textDict.promisesSubtitle}
                    as="p"
                    className="text-xs text-slate-500 dark:text-ink-muted leading-relaxed font-sans"
                  />
                </div>

                <div className="space-y-3.5 pt-1">
                  {([
                    { key: 'inertia' as const, ...localizedContent.promises[0] },
                    { key: 'confidence' as const, ...localizedContent.promises[1] },
                    { key: 'evidence' as const, ...localizedContent.promises[2] }
                  ]).map((item) => (
                    <label
                      key={item.key}
                      className="flex items-start gap-3.5 p-4 bg-white dark:bg-ink-raised rounded-2xl border border-rose-100/10 cursor-pointer hover:bg-amber-50/30 dark:hover:bg-rosegold/5 transition-all duration-300 select-none shadow-xs"
                    >
                      <input
                        type="checkbox"
                        checked={promisesChecked[item.key]}
                        disabled={isCompleted}
                        onChange={(e) => setPromisesChecked(p => ({ ...p, [item.key]: e.target.checked }))}
                        className="mt-0.5 h-4.5 w-4.5 rounded-md text-rosegold border-slate-300 focus:ring-rosegold transition-all duration-300"
                      />
                      <div className="text-xs font-sans">
                        <span className="font-semibold text-slate-700 dark:text-ink-text block">{item.label}</span>
                        <span className="text-slate-500 dark:text-ink-muted block mt-1 leading-relaxed">{item.desc}</span>
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
            className="rounded-3xl bg-white dark:bg-ink-raised border border-rose-100/30 dark:border-ink-hairline p-6 shadow-sm space-y-6"
          >
            <div>
              <h3 className="text-xs font-sans text-slate-400 dark:text-ink-muted uppercase tracking-[0.15em] mb-3.5 font-extrabold">
                {isRestDay
                  ? <EditableText contentKey="dailyMission.statusTitle" fallback={textDict.statusTitle} as="span" />
                  : <EditableText contentKey="dailyMission.progressLockTitle" fallback={textDict.progressLockTitle} as="span" />}
              </h3>

              {!isRestDay && (
                <div className="space-y-3">
                  {/* Validation checkmark widgets */}
                  <div className="flex items-center justify-between text-xs bg-[#FAF8F5] dark:bg-ink border border-rose-100/10 p-4 rounded-xl shadow-xs">
                    <EditableText contentKey="dailyMission.listenItem" fallback={textDict.listenItem} as="span" className="text-slate-600 dark:text-ink-muted font-semibold font-sans" />
                    <span className={`px-3 py-1 rounded-full text-[11px] font-sans font-bold uppercase tracking-wider ${
                      listenStepDone
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        : 'bg-rose-50 dark:bg-rosegold/15 text-rosegold'
                    }`}>
                      {listenStepDone
                        ? <EditableText contentKey="dailyMission.completedStatus" fallback={textDict.completedStatus} as="span" />
                        : <EditableText contentKey="dailyMission.pendingStatus" fallback={textDict.pendingStatus} as="span" />}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs bg-[#FAF8F5] dark:bg-ink border border-rose-100/10 p-4 rounded-xl shadow-xs">
                    <EditableText contentKey="dailyMission.promisesItem" fallback={textDict.promisesItem} as="span" className="text-slate-600 dark:text-ink-muted font-semibold font-sans" />
                    <span className={`px-3 py-1 rounded-full text-[11px] font-sans font-bold uppercase tracking-wider ${
                      allPromisesKept
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        : 'bg-amber-500/15 text-accentgold'
                    }`}>
                      {allPromisesKept
                        ? <EditableText contentKey="dailyMission.completedStatus" fallback={textDict.completedStatus} as="span" />
                        : <EditableText contentKey="dailyMission.pendingStatus" fallback={textDict.pendingStatus} as="span" />}
                    </span>
                  </div>

                  {/* Batch-production day: single free-text log instead of 3 links */}
                  {isBatchProductionDay ? (
                    <div className="space-y-2 pt-1">
                      <EditableText
                        contentKey="dailyMission.batchProductionInstruction"
                        fallback={textDict.batchProductionInstruction}
                        as="p"
                        className="text-xs text-slate-500 dark:text-ink-muted font-sans"
                      />
                      <textarea
                        value={promiseLinks.inertia}
                        disabled={isCompleted}
                        onChange={(e) => setPromiseLinks(p => ({ ...p, inertia: e.target.value }))}
                        placeholder={textDict.batchProductionPlaceholder}
                        rows={3}
                        className="w-full text-xs bg-[#FAF8F5] dark:bg-ink border border-rose-100/10 focus:border-rosegold focus:outline-none focus:ring-1 focus:ring-rosegold rounded-xl p-3.5 text-slate-700 dark:text-ink-text transition-all duration-300 shadow-xs resize-none"
                      />
                    </div>
                  ) : (
                    /* Expandable recording links, however many she wants to add */
                    <div className="space-y-2 pt-1">
                      <EditableText
                        contentKey="dailyMission.recordingsLinkInstruction"
                        fallback={textDict.recordingsLinkInstruction}
                        as="p"
                        className="text-xs text-slate-500 dark:text-ink-muted font-sans"
                      />
                      <LinkListInput
                        links={recordingLinks}
                        onChange={setRecordingLinks}
                        disabled={isCompleted}
                        placeholder={textDict.linkRequiredPlaceholder}
                        inputClassName="flex-1 text-xs bg-[#FAF8F5] dark:bg-ink border border-rose-100/10 focus:border-rosegold focus:outline-none focus:ring-1 focus:ring-rosegold rounded-xl p-3.5 text-slate-700 dark:text-ink-text transition-all duration-300 shadow-xs"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Reflection Text Area */}
            {!isRestDay && (
              <div className="space-y-4">
                <label className="block text-xs font-sans text-rosegold uppercase font-extrabold tracking-wider">
                  {isSeventhDayReflection
                    ? <EditableText contentKey="dailyMission.reflection7Title" fallback={textDict.reflection7Title} as="span" />
                    : <EditableText contentKey="dailyMission.reflectionTitle" fallback={textDict.reflectionTitle} as="span" />}
                </label>

                {isSeventhDayReflection ? (
                  <div className="text-xs text-slate-500 dark:text-ink-muted space-y-2 p-4 rounded-2xl bg-amber-500/5 border border-accentgold/20 font-sans italic">
                    <p className="font-bold text-accentgold not-italic uppercase tracking-widest text-[11px]">
                      {localizedPhase.title} <EditableText contentKey="dailyMission.reflectionMoment" fallback={textDict.reflectionMoment} as="span" />
                    </p>
                    {textDict.reflection7Questions[currentPhaseId]?.map((q, idx) => (
                      <p key={idx}>{q}</p>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-ink-muted italic leading-relaxed">
                    "{localizedContent.reflectionQuestion}"
                  </p>
                )}

                <textarea
                  value={reflectionInput}
                  onChange={(e) => setReflectionInput(e.target.value)}
                  disabled={isCompleted}
                  placeholder={textDict.reflectionPlaceholder}
                  rows={4}
                  className="w-full text-sm bg-[#FAF8F5] dark:bg-ink border border-rose-100/20 dark:border-ink-hairline focus:border-rosegold focus:outline-none focus:ring-1 focus:ring-rosegold rounded-2xl p-4 placeholder-slate-400 text-slate-700 dark:text-ink-text transition-all duration-300 shadow-inner"
                />
                
                {reflectionInput.trim().length <= 3 && !isCompleted && (
                  <p className="text-[11px] text-[#D4AF37] flex items-center gap-1.5 font-sans font-medium">
                    <Info className="h-4 w-4 shrink-0" />
                    <EditableText contentKey="dailyMission.reflectionWarning" fallback={textDict.reflectionWarning} as="span" />
                  </p>
                )}

                {/* Daily Mood Integration */}
                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-sans text-rosegold uppercase font-extrabold tracking-widest">
                    {lang === 'pt' ? 'Como você se sente agora?' : lang === 'es' ? '¿Cómo te sientes ahora?' : 'How do you feel now?'}
                  </label>
                  <div className="grid grid-cols-5 gap-1 p-1.5 bg-[#FAF8F5] dark:bg-ink rounded-2xl border border-rose-100/10 dark:border-ink-hairline shadow-inner">
                    {(['calm', 'hopeful', 'neutral', 'heavy', 'emotional'] as const).map((moodKey) => {
                      const info = {
                        calm: { emoji: '😎', label: lang === 'pt' ? 'Plena' : lang === 'es' ? 'Plena' : 'Fulfilled', color: 'hover:bg-emerald-500/10 text-emerald-600', active: 'bg-emerald-500/10 border-emerald-500/35 text-emerald-600 shadow-xs' },
                        hopeful: { emoji: '🤗', label: lang === 'pt' ? 'Esperançosa' : lang === 'es' ? 'Esperanzada' : 'Hopeful', color: 'hover:bg-rose-500/10 text-rosegold', active: 'bg-rose-500/15 border-rose-500/35 text-rosegold shadow-xs' },
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
                          className={`min-w-0 flex flex-col items-center justify-center gap-1 py-2.5 px-0.5 rounded-xl text-center border border-transparent transition-all duration-300 cursor-pointer select-none ${
                            isSelected ? info.active : `${info.color} text-slate-500`
                          } hover:scale-105`}
                        >
                          <span className="text-xl leading-none">{info.emoji}</span>
                          <span className="text-[8px] sm:text-[9px] font-sans font-extrabold tracking-tight uppercase leading-tight break-words w-full">{info.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Submit Lock / Completion CTA */}
            {isCompleted ? (
              <div className="bg-[#FAF8F5] dark:bg-ink border border-emerald-500/20 rounded-3xl p-6 space-y-5 shadow-sm">
                <div className="text-center space-y-1">
                  <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px] block uppercase tracking-[0.2em] bg-emerald-500/10 px-3 py-1 rounded-full w-max mx-auto">
                    🎉 <EditableText contentKey="dailyMission.completedBadge" fallback={textDict.completedBadge} as="span" />!
                  </span>
                </div>

                {/* 3. The Identity Loop Statement */}
                <div className="border-t border-b border-rose-100/10 py-4 text-left space-y-1.5">
                  <EditableText
                    contentKey="dailyMission.identityHeader"
                    fallback={textDict.identityHeader}
                    as="span"
                    className="text-[11px] font-extrabold uppercase text-slate-400 tracking-[0.15em] block"
                  />
                  <p className="text-sm text-slate-700 dark:text-ink-text font-medium italic font-display leading-relaxed">
                    "{adaptMessage(identityPhrases[currentDay.dayNumber as keyof typeof identityPhrases]?.[lang]?.[guideStyle] || 'You showed up today.', prefGrammar, lang)}"
                  </p>
                </div>

                {/* Progress Feedback Dashboard */}
                <div className="space-y-4">
                  <span className="text-[11px] font-sans font-extrabold uppercase tracking-[0.2em] text-slate-400 block">
                    {lang === 'pt' ? 'Métricas de Evolução' : lang === 'es' ? 'Métricas de Evolución' : 'Evolution Metrics'}
                  </span>
                  
                  <div className="grid grid-cols-2 gap-3.5 text-[11px] leading-tight">
                    {/* Current Chapter */}
                    <div className="bg-white dark:bg-ink-raised p-3 rounded-2xl border border-rose-100/10 shadow-xs">
                      <span className="block text-[10px] text-slate-400 uppercase font-sans font-extrabold tracking-wider mb-1">
                        {lang === 'pt' ? 'Capítulo' : lang === 'es' ? 'Capítulo' : 'Chapter'}
                      </span>
                      <span className="font-bold text-slate-800 dark:text-ink-text font-sans">
                        {getPhaseId(currentDay.dayNumber)} • {
                          getPhaseId(currentDay.dayNumber) === 1 ? (lang === 'pt' ? 'DESPERTAR' : lang === 'es' ? 'DESPERTAR' : 'AWAKENING') :
                          getPhaseId(currentDay.dayNumber) === 2 ? (lang === 'pt' ? 'CORAGEM' : lang === 'es' ? 'CORAJE' : 'COURAGE') :
                          getPhaseId(currentDay.dayNumber) === 3 ? (lang === 'pt' ? 'EXPRESSÃO' : lang === 'es' ? 'EXPRESIÓN' : 'EXPRESSION') :
                          (lang === 'pt' ? 'EXPANSÃO' : lang === 'es' ? 'EXPANSIÓN' : 'EXPANSION')
                        }
                      </span>
                    </div>

                    {/* Current Day */}
                    <div className="bg-white dark:bg-ink-raised p-3 rounded-2xl border border-rose-100/10 shadow-xs">
                      <span className="block text-[10px] text-slate-400 uppercase font-sans font-extrabold tracking-wider mb-1">
                        {lang === 'pt' ? 'Dia / Racha' : lang === 'es' ? 'Día / Racha' : 'Day / Streak'}
                      </span>
                      <span className="font-bold text-slate-800 dark:text-ink-text font-sans">
                        {currentDay.dayNumber}/30 ({progress.currentStreak}d)
                      </span>
                    </div>

                    {/* Journey Percentage */}
                    <div className="bg-white dark:bg-ink-raised p-3 rounded-2xl border border-rose-100/10 shadow-xs">
                      <span className="block text-[10px] text-slate-400 uppercase font-sans font-extrabold tracking-wider mb-1">
                        {lang === 'pt' ? 'Conclusão' : lang === 'es' ? 'Completado' : 'Completion'}
                      </span>
                      <span className="font-bold text-slate-800 dark:text-ink-text font-sans">
                        {Math.round((progress.completionHistory.length / 30) * 100)}%
                      </span>
                    </div>

                    {/* Chapter Percentage */}
                    <div className="bg-white dark:bg-ink-raised p-3 rounded-2xl border border-rose-100/10 shadow-xs">
                      <span className="block text-[10px] text-slate-400 uppercase font-sans font-extrabold tracking-wider mb-1">
                        {lang === 'pt' ? 'Fase Atual' : lang === 'es' ? 'Fase Actual' : 'Current Phase'}
                      </span>
                      <span className="font-bold text-slate-800 dark:text-ink-text font-sans">
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
                    <span className="block text-[11px] text-slate-400 uppercase font-sans font-extrabold tracking-wider">
                      {lang === 'pt' ? 'Evidências de Identidade' : lang === 'es' ? 'Evidencias de Identidad' : 'Identity Evidence'}
                    </span>
                    
                    <div className="space-y-1.5 text-[11px] font-sans">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-ink-muted">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span>{lang === 'pt' ? 'Mensagem da Renata Concluída' : lang === 'es' ? 'Mensaje de Renata Completado' : "Renata's Message Completed"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-ink-muted">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span>{lang === 'pt' ? 'Três Compromissos Selados' : lang === 'es' ? 'Tres Compromisos Sellados' : 'Three Promises Sealed'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-ink-muted">
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
                    : 'bg-rose-50/40 dark:bg-rosegold/5 text-slate-400 dark:text-ink-muted cursor-not-allowed border border-rose-100/10'
                }`}
              >
                <span>
                  {isRestDay
                    ? <EditableText contentKey="dailyMission.completeBtnRest" fallback={textDict.completeBtnRest} as="span" />
                    : <EditableText contentKey="dailyMission.completeBtn" fallback={textDict.completeBtn} as="span" />}
                </span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}

          </motion.div>

          {/* Quick Trigger Emotional SOS Banner */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-[1.5rem] border border-rose-150/40 dark:border-ink-hairline bg-[#251E1C]/5 dark:bg-ink/30 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 rounded-xl bg-rosegold/10 text-rosegold shrink-0">
                <Heart className="h-4.5 w-4.5 fill-current text-rosegold animate-pulse" />
              </div>
              <div className="min-w-0 flex-1">
                <EditableText
                  contentKey="dailyMission.sosHeading"
                  fallback={textDict.sosHeading}
                  as="h4"
                  className="text-xs font-bold text-slate-800 dark:text-ink-text font-sans tracking-wide leading-relaxed"
                />
              </div>
            </div>
            <button
              onClick={onTriggerSos}
              className="w-full sm:w-auto shrink-0 px-4 py-2 rounded-xl bg-rosegold hover:bg-[#A35D68] text-[10px] font-sans font-bold uppercase tracking-wider text-white transition-all duration-300 cursor-pointer shadow-rosegold animate-pulse"
            >
              <EditableText contentKey="dailyMission.sosTrigger" fallback={textDict.sosTrigger} as="span" />
            </button>
          </motion.div>

        </div>

      </div>
    </div>
  );
}
