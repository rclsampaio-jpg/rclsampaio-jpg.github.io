/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Language } from '../types';
import { ToneVariants } from '../utils/grammar';

export interface Chapter {
  id: number;
  title: Record<Language, string>;
  range: [number, number];
  colorAccent: string;
  gradient: string;
  darkGradient: string;
  theme: Record<Language, string>;
  message: Record<Language, ToneVariants>;
  expectation: Record<Language, ToneVariants>;
  reflection: Record<Language, ToneVariants>;
  audioNarrative: Record<Language, ToneVariants>;
  atmosphere: Record<Language, string>;
}

export const chapters: Chapter[] = [
  {
    id: 1,
    title: {
      pt: 'DESPERTAR',
      en: 'AWAKENING',
      es: 'DESPERTAR'
    },
    range: [1, 7],
    colorAccent: 'text-[#C9A097] dark:text-[#E2C2BA]', // Soft Rose Gold
    gradient: 'from-[#FAF8F5] via-[#FCFBF9] to-[#FAF8F5]',
    darkGradient: 'dark:from-[#1E1715] dark:via-[#231A18] dark:to-[#1E1715]',
    theme: {
      pt: 'Segurança • Início • Permissão',
      en: 'Safety • Beginning • Permission',
      es: 'Seguridad • Inicio • Permisión'
    },
    message: {
      pt: {
        gentle: 'Você já está segura, do jeito que está agora.',
        challenger: 'Chega de se esconder. É hora de aparecer.',
        strategic: 'Aparecer é o primeiro passo do plano — e você já deu esse passo.',
        inspirational: 'É seguro ser [vista/visto/viste].'
      },
      en: {
        gentle: 'You are already safe, exactly as you are now.',
        challenger: "Enough hiding. It's time to show up.",
        strategic: "Showing up is step one of the plan — and you've already taken it.",
        inspirational: 'It is safe to be seen.'
      },
      es: {
        gentle: 'Ya estás segura, tal como estás ahora.',
        challenger: 'Basta de esconderte. Es hora de aparecer.',
        strategic: 'Aparecer es el primer paso del plan — y ya lo diste.',
        inspirational: 'Es seguro ser [vista/visto/viste].'
      }
    },
    expectation: {
      pt: {
        gentle: 'Nesta primeira fase, vamos com calma: o objetivo é só criar segurança no seu corpo e na sua mente pra você conseguir aparecer, sem pressão de fazer perfeito.',
        challenger: 'Nesta primeira fase, vamos direto ao ponto: seu perfeccionismo será desmontado, porque ele é a principal desculpa que te impede de aparecer. Sem mais rodeios.',
        strategic: 'Nesta primeira fase, o objetivo é claro: reduzir a resistência inicial à visibilidade, construindo repetição de baixo risco até que aparecer vire automático.',
        inspirational: 'Nesta primeira fase, vamos focar em desarmar o perfeccionismo e construir um espaço seguro no seu sistema nervoso para a visibilidade diária.'
      },
      en: {
        gentle: "In this first phase, we'll go slowly: the goal is simply to build safety in your body and mind so you can show up, with no pressure to be perfect.",
        challenger: "In this first phase, we go straight to the point: your perfectionism gets dismantled, because it's the main excuse keeping you from showing up. No more detours.",
        strategic: 'In this first phase, the goal is clear: reduce your initial resistance to visibility by building low-risk repetition until showing up becomes automatic.',
        inspirational: 'In this first phase, we will focus on disarming perfectionism and building a safe space in your nervous system for daily visibility.'
      },
      es: {
        gentle: 'En esta primera fase, iremos con calma: el objetivo es solo construir seguridad en tu cuerpo y tu mente para que puedas aparecer, sin presión de hacerlo perfecto.',
        challenger: 'En esta primera fase, vamos directo al grano: tu perfeccionismo será desmontado, porque es la principal excusa que te impide aparecer. Sin más rodeos.',
        strategic: 'En esta primera fase, el objetivo es claro: reducir la resistencia inicial a la visibilidad, construyendo repetición de bajo riesgo hasta que aparecer se vuelva automático.',
        inspirational: 'En esta primera fase, nos enfocaremos en desarmar el perfeccionismo y construir un espacio seguro en tu sistema nervioso para la visibilidad diaria.'
      }
    },
    reflection: {
      pt: {
        gentle: 'Você não precisa merecer descanso pra se dar permissão de começar devagar. Comece exatamente de onde você está, sem se cobrar mais do que isso.',
        challenger: "Parar de esperar 'o momento certo' é a permissão que você precisa se dar agora. Grandeza nenhuma nasce da espera — nasce de quem decide começar mesmo com medo.",
        strategic: 'A permissão pra começar não é sentimental, é estratégica: quanto antes você agir, mais cedo os dados de progresso aparecem. Comece pequeno, mas comece hoje.',
        inspirational: 'Antes de ser grande, você precisa se dar a permissão de simplesmente começar. A visibilidade começa no silêncio do autoacolhimento.'
      },
      en: {
        gentle: "You don't have to earn rest to give yourself permission to start slowly. Start exactly from where you are, without demanding more of yourself than that.",
        challenger: "Stop waiting for 'the right moment' — that's the permission you need to give yourself right now. No greatness is born from waiting; it's born from deciding to start even while afraid.",
        strategic: "Permission to start isn't sentimental, it's strategic: the sooner you act, the sooner progress data shows up. Start small, but start today.",
        inspirational: 'Before being great, you must give yourself permission to simply start. Visibility begins in the silence of self-acceptance.'
      },
      es: {
        gentle: 'No necesitas merecer descanso para darte permiso de empezar despacio. Empieza exactamente desde donde estás, sin exigirte más que eso.',
        challenger: "Dejar de esperar 'el momento correcto' es el permiso que necesitas darte ahora. Ninguna grandeza nace de la espera — nace de quien decide empezar aunque tenga miedo.",
        strategic: 'El permiso para empezar no es sentimental, es estratégico: cuanto antes actúes, antes aparecen los datos de progreso. Empieza pequeño, pero empieza hoy.',
        inspirational: 'Antes de ser grande, debes darte el permiso de simplemente comenzar. La visibilidad comienza en el silencio de la autoaceptación.'
      }
    },
    audioNarrative: {
      pt: {
        gentle: 'Bem-vinda ao Despertar. Sinta seus pés tocando o chão, sem pressa nenhuma. Respire fundo, devagar, e permita-se simplesmente estar aqui, exatamente como está.',
        challenger: 'Bem-vinda ao Despertar. Sinta o chão firme sob seus pés e pare de esperar se sentir [pronta/pronto/pronte]. Respire fundo e repita: eu apareço mesmo com medo. É aqui que começa.',
        strategic: 'Bem-vinda ao Despertar. Sinta o chão sob seus pés — esse é o seu ponto de partida. Respire fundo e grave mentalmente: hoje eu construo a base, um passo de cada vez.',
        inspirational: '[Bem-vinda/Bem-vindo/Bem-vinde] ao Despertar. Sinta a terra firme sob seus pés. Respire fundo e repita mentalmente: eu me dou permissão para ser [imperfeita/imperfeito/imperfeite]. É aqui que começamos.'
      },
      en: {
        gentle: 'Welcome to Awakening. Feel your feet touching the ground, no rush at all. Breathe deeply, slowly, and allow yourself to simply be here, exactly as you are.',
        challenger: 'Welcome to Awakening. Feel the firm ground beneath your feet and stop waiting to feel ready. Breathe deeply and repeat: I show up even while afraid. This is where it begins.',
        strategic: 'Welcome to Awakening. Feel the ground under your feet — that is your starting point. Breathe deeply and lock this in: today I build the foundation, one step at a time.',
        inspirational: 'Welcome to Awakening. Feel the firm ground beneath your feet. Breathe deeply and repeat mentally: I give myself permission to be imperfect. This is where we begin.'
      },
      es: {
        gentle: 'Bienvenida al Despertar. Siente tus pies tocando el suelo, sin ninguna prisa. Respira hondo, despacio, y permítete simplemente estar aquí, tal como estás.',
        challenger: 'Bienvenida al Despertar. Siente el suelo firme bajo tus pies y deja de esperar sentirte [lista/listo/liste]. Respira hondo y repite: aparezco aunque tenga miedo. Aquí es donde comienza.',
        strategic: 'Bienvenida al Despertar. Siente el suelo bajo tus pies — ese es tu punto de partida. Respira hondo y graba mentalmente: hoy construyo la base, un paso a la vez.',
        inspirational: '[Bienvenida/Bienvenido/Bienvenide] al Despertar. Siente la tierra firme bajo tus pies. Respira hondo y repite mentalmente: me doy permiso para ser [imperfecta/imperfecto/imperfecte]. Aquí es donde comenzamos.'
      }
    },
    atmosphere: {
      pt: 'Suave, segura e acolhedora',
      en: 'Soft, safe, and welcoming',
      es: 'Suave, segura y acogedora'
    }
  },
  {
    id: 2,
    title: {
      pt: 'CORAGEM',
      en: 'COURAGE',
      es: 'CORAJE'
    },
    range: [8, 14],
    colorAccent: 'text-[#B76E79] dark:text-[#C98A94]', // Rose Gold
    gradient: 'from-[#FAF8F5] via-[#FFFBFB] to-[#FAF8F5]',
    darkGradient: 'dark:from-[#1E1715] dark:via-[#261B1C] dark:to-[#1E1715]',
    theme: {
      pt: 'Ação • Consistência • Confiança',
      en: 'Action • Consistency • Confidence',
      es: 'Acción • Consistencia • Confianza'
    },
    message: {
      pt: {
        gentle: 'Cada aparição, por menor que seja, já conta.',
        challenger: 'Coragem não é sentir medo zero — é aparecer mesmo com ele.',
        strategic: 'Consistência é a única métrica que importa nessa fase.',
        inspirational: 'Você se torna [corajosa/corajoso/corajose] aparecendo.'
      },
      en: {
        gentle: 'Every appearance, no matter how small, already counts.',
        challenger: "Courage isn't feeling zero fear — it's showing up anyway.",
        strategic: 'Consistency is the only metric that matters in this phase.',
        inspirational: 'You become courageous by showing up.'
      },
      es: {
        gentle: 'Cada aparición, por pequeña que sea, ya cuenta.',
        challenger: 'El coraje no es sentir cero miedo — es aparecer de todos modos.',
        strategic: 'La consistencia es la única métrica que importa en esta fase.',
        inspirational: 'Te vuelves valiente apareciendo.'
      }
    },
    expectation: {
      pt: {
        gentle: 'Hora de agir, mas no seu ritmo. Vamos deixar as desculpas de lado com gentileza, focando em pequenas consistências que respeitam seus limites.',
        challenger: "Hora de agir. Sem desculpa, sem 'depois eu faço'. Essa fase é sobre consistência bruta — aparecer mesmo quando você não quer.",
        strategic: 'Hora de agir com método: menos desculpas, mais repetição estruturada. A coragem, aqui, é tratada como uma habilidade que se treina, não um sentimento que se espera.',
        inspirational: 'Hora de agir. Deixamos as desculpas de lado e focamos na consistência. A coragem é uma habilidade prática desenvolvida no movimento.'
      },
      en: {
        gentle: "Time for action, but at your own pace. We'll gently set excuses aside, focusing on small consistencies that respect your limits.",
        challenger: "Time for action. No excuses, no 'I'll do it later.' This phase is about raw consistency — showing up even when you don't want to.",
        strategic: 'Time for action with method: fewer excuses, more structured repetition. Courage here is treated as a trainable skill, not a feeling you wait for.',
        inspirational: 'Time for action. We put excuses aside and focus on consistency. Courage is a practical skill developed in movement.'
      },
      es: {
        gentle: 'Hora de actuar, pero a tu ritmo. Dejaremos las excusas de lado con delicadeza, enfocándonos en pequeñas consistencias que respetan tus límites.',
        challenger: "Hora de actuar. Sin excusas, sin 'después lo hago'. Esta fase es sobre consistencia pura — aparecer aunque no quieras.",
        strategic: 'Hora de actuar con método: menos excusas, más repetición estructurada. El coraje, aquí, se trata como una habilidad que se entrena, no un sentimiento que se espera.',
        inspirational: 'Hora de actuar. Dejamos las excusas de lado y nos enfocamos en la consistencia. El coraje es una habilidad práctica desarrollada en el movimiento.'
      }
    },
    reflection: {
      pt: {
        gentle: 'Cada vez que você aparece, mesmo tremendo, você está cuidando de [si mesma/si mesmo/si mesme] com mais confiança do que imagina.',
        challenger: 'Coragem não é ausência de medo — é decidir que sua meta importa mais que o desconforto. Toda vez que você aparece, você prova isso de novo.',
        strategic: 'O padrão é simples: mais repetições geram mais confiança. Cada aparição registrada é um dado a favor da sua nova identidade.',
        inspirational: 'A coragem não é a ausência de medo, mas sim a decisão de que algo mais é importante. Cada vez que você aparece, você fortalece esse novo hábito.'
      },
      en: {
        gentle: "Every time you show up, even shaking, you're taking care of yourself with more confidence than you realize.",
        challenger: "Courage isn't the absence of fear — it's deciding your goal matters more than the discomfort. Every time you show up, you prove it again.",
        strategic: 'The pattern is simple: more repetitions generate more confidence. Every logged appearance is a data point in favor of your new identity.',
        inspirational: 'Courage is not the absence of fear, but rather the decision that something else is more important. Each time you show up, you reinforce this new habit.'
      },
      es: {
        gentle: 'Cada vez que apareces, aunque temblando, estás cuidando de [ti misma/ti mismo/ti misme] con más confianza de la que imaginas.',
        challenger: 'El coraje no es la ausencia de miedo — es decidir que tu meta importa más que la incomodidad. Cada vez que apareces, lo demuestras de nuevo.',
        strategic: 'El patrón es simple: más repeticiones generan más confianza. Cada aparición registrada es un dato a favor de tu nueva identidad.',
        inspirational: 'El coraje no es la ausencia de miedo, sino la decisión de que algo más es importante. Cada vez que apareces, fortaleces este nuevo hábito.'
      }
    },
    audioNarrative: {
      pt: {
        gentle: 'Fase de Coragem. Vá com calma. Sinta o medo, reconheça-o, e deixe-o junto de você enquanto você segue em frente de qualquer forma.',
        challenger: 'Fase de Coragem. O medo pode falar, mas ele não decide. Sinta a ação percorrendo seu corpo e continue, mesmo que a voz do medo grite mais alto.',
        strategic: 'Fase de Coragem. Cada repetição fortalece o próximo passo. Sinta a ação como treino, não como teste. Você está construindo um padrão, não buscando perfeição.',
        inspirational: 'Fase de Coragem. O medo ainda sussurra, mas sua ação fala mais alto. Sinta o calor da ação percorrer seu corpo. Você está se provando capaz.'
      },
      en: {
        gentle: 'Courage Phase. Take it slow. Feel the fear, acknowledge it, and let it sit beside you while you move forward anyway.',
        challenger: "Courage Phase. Fear can speak, but it doesn't decide. Feel the action moving through your body and keep going, even if fear's voice shouts louder.",
        strategic: "Courage Phase. Every repetition strengthens the next step. Feel the action as training, not a test. You're building a pattern, not chasing perfection.",
        inspirational: 'Courage Phase. Fear still whispers, but your action speaks louder. Feel the warmth of action flowing through your body. You are proving yourself capable.'
      },
      es: {
        gentle: 'Fase de Coraje. Ve con calma. Siente el miedo, reconócelo, y déjalo a tu lado mientras sigues adelante de todos modos.',
        challenger: 'Fase de Coraje. El miedo puede hablar, pero no decide. Siente la acción recorriendo tu cuerpo y continúa, aunque la voz del miedo grite más fuerte.',
        strategic: 'Fase de Coraje. Cada repetición fortalece el siguiente paso. Siente la acción como entrenamiento, no como prueba. Estás construyendo un patrón, no buscando la perfección.',
        inspirational: 'Fase de Coraje. El miedo aún susurra, pero tu acción habla más fuerte. Siente el calor de la acción recorrer tu cuerpo. Te estás demostrando capaz.'
      }
    },
    atmosphere: {
      pt: 'Confiante, focada e encorajadora',
      en: 'Confident, focused, and encouraging',
      es: 'Confiante, enfocada y alentadora'
    }
  },
  {
    id: 3,
    title: {
      pt: 'EXPRESSÃO',
      en: 'EXPRESSION',
      es: 'EXPRESIÓN'
    },
    range: [15, 21],
    colorAccent: 'text-[#D4AF37] dark:text-[#E8C85C]', // Rose Gold + Gold
    gradient: 'from-[#FAF8F5] via-[#FFFDF9] to-[#FAF8F5]',
    darkGradient: 'dark:from-[#1E1715] dark:via-[#262019] dark:to-[#1E1715]',
    theme: {
      pt: 'Autenticidade • Storytelling • Liberdade',
      en: 'Authenticity • Storytelling • Freedom',
      es: 'Autenticidad • Storytelling • Libertad'
    },
    message: {
      pt: {
        gentle: 'Sua voz pode ser suave e ainda assim ocupar espaço.',
        challenger: 'Pare de editar sua voz pra caber no molde de outra pessoa.',
        strategic: 'Histórias autênticas geram mais conexão que roteiros perfeitos. Use isso.',
        inspirational: 'Sua voz merece espaço.'
      },
      en: {
        gentle: 'Your voice can be soft and still take up space.',
        challenger: "Stop editing your voice to fit someone else's mold.",
        strategic: 'Authentic stories generate more connection than perfect scripts. Use that.',
        inspirational: 'Your voice deserves space.'
      },
      es: {
        gentle: 'Tu voz puede ser suave y aun así ocupar espacio.',
        challenger: 'Deja de editar tu voz para encajar en el molde de otra persona.',
        strategic: 'Las historias auténticas generan más conexión que los guiones perfectos. Úsalo.',
        inspirational: 'Tu voz merece espacio.'
      }
    },
    expectation: {
      pt: {
        gentle: 'Essa fase é sobre se permitir ser vista de verdade, no seu tempo. Vamos explorar suas histórias com cuidado, sem pressa de expor mais do que você quer.',
        challenger: 'Essa fase não tem espaço pra máscara. Você vai contar suas histórias de verdade, sem editar pra parecer mais interessante do que é. A vulnerabilidade é o ponto, não o risco.',
        strategic: 'Essa fase foca em um resultado: histórias autênticas convertem mais que discursos polidos. Vamos treinar você a usar sua própria vida como matéria-prima de conteúdo.',
        inspirational: 'Esta fase é sobre profundidade e verdade. Você vai aprender a contar suas histórias de maneira autêntica e assumir sua vulnerabilidade com orgulho.'
      },
      en: {
        gentle: "This phase is about allowing yourself to be truly seen, at your own pace. We'll explore your stories with care, with no rush to expose more than you want.",
        challenger: 'This phase has no room for masks. You will tell your real stories, without editing to sound more interesting than you are. Vulnerability is the point, not the risk.',
        strategic: 'This phase focuses on one outcome: authentic stories convert more than polished speeches. We will train you to use your own life as raw content material.',
        inspirational: 'This phase is about depth and truth. You will learn to tell your stories authentically and wear your vulnerability with pride.'
      },
      es: {
        gentle: 'Esta fase es sobre permitirte ser vista de verdad, a tu ritmo. Vamos a explorar tus historias con cuidado, sin prisa por exponer más de lo que quieres.',
        challenger: 'Esta fase no tiene espacio para máscaras. Vas a contar tus historias de verdad, sin editarlas para parecer más interesante de lo que eres. La vulnerabilidad es el punto, no el riesgo.',
        strategic: 'Esta fase se enfoca en un resultado: las historias auténticas convierten más que los discursos pulidos. Vamos a entrenarte para usar tu propia vida como materia prima de contenido.',
        inspirational: 'Esta fase es sobre profundidad y verdad. Aprenderás a contar tus historias de manera auténtica y a asumir tu vulnerabilidad con orgullo.'
      }
    },
    reflection: {
      pt: {
        gentle: 'Você não precisa agradar todo mundo pra ser [amada/amado/amade]. Só precisa ser [verdadeira/verdadeiro/verdadeire] com quem já está do seu lado.',
        challenger: 'Parar de tentar agradar todo mundo não é frieza, é liberdade. O mundo não precisa de mais uma cópia polida — precisa da sua perspectiva, sem filtro.',
        strategic: 'Dado real: conteúdo genuíno performa melhor que conteúdo genérico. Parar de tentar agradar todo mundo não é filosofia — é a decisão mais eficiente que você pode tomar.',
        inspirational: 'Há uma liberdade imensa em parar de tentar agradar a todos. O mundo não precisa de cópias polidas, ele precisa da sua perspectiva genuína.'
      },
      en: {
        gentle: 'You do not need to please everyone to be loved. You just need to be true with the people already on your side.',
        challenger: 'Stopping trying to please everyone is not coldness, it is freedom. The world does not need another polished copy — it needs your unfiltered perspective.',
        strategic: 'Real data point: genuine content outperforms generic content. Stopping trying to please everyone is not philosophy — it is the most efficient decision you can make.',
        inspirational: 'There is immense freedom in stopping trying to please everyone. The world does not need polished copies; it needs your genuine perspective.'
      },
      es: {
        gentle: 'No necesitas agradar a todos para ser amada. Solo necesitas ser sincera con quienes ya están de tu lado.',
        challenger: 'Dejar de intentar complacer a todos no es frialdad, es libertad. El mundo no necesita otra copia pulida — necesita tu perspectiva sin filtro.',
        strategic: 'Dato real: el contenido genuino rinde mejor que el contenido genérico. Dejar de intentar complacer a todos no es filosofía — es la decisión más eficiente que puedes tomar.',
        inspirational: 'Hay una libertad inmensa en dejar de intentar complacer a todos. El mundo no necesita copias pulidas, necesita tu perspectiva genuina.'
      }
    },
    audioNarrative: {
      pt: {
        gentle: 'Sua voz é única, e não precisa ter pressa pra ser ouvida. Solte a tensão da garganta, aos poucos, e deixe as palavras saírem no seu próprio tempo.',
        challenger: 'Sua voz é única — pare de tentar imitar a de outra pessoa. Solte a tensão da garganta e deixe sair o que é real, mesmo que incomode.',
        strategic: 'Sua voz é o seu ativo mais diferenciado. Solte a tensão da garganta e trate cada palavra como um dado de conexão, não como performance.',
        inspirational: 'Sua voz é única. Libere a tensão da garganta. Deixe as palavras fluírem do coração. Sua voz não precisa ser perfeita, ela só precisa ser sua.'
      },
      en: {
        gentle: 'Your voice is unique, and it does not need to rush to be heard. Release the tension in your throat, gradually, and let the words come out in your own time.',
        challenger: "Your voice is unique — stop trying to imitate someone else's. Release the tension in your throat and let out what's real, even if it's uncomfortable.",
        strategic: 'Your voice is your most differentiated asset. Release the tension in your throat and treat every word as a connection data point, not a performance.',
        inspirational: 'Your voice is unique. Release the tension in your throat. Let the words flow from the heart. Your voice does not need to be perfect; it only needs to be yours.'
      },
      es: {
        gentle: 'Tu voz es única, y no necesita apurarse para ser escuchada. Suelta la tensión de la garganta, poco a poco, y deja que las palabras salgan a tu propio ritmo.',
        challenger: 'Tu voz es única — deja de intentar imitar la de otra persona. Suelta la tensión de la garganta y deja salir lo que es real, aunque incomode.',
        strategic: 'Tu voz es tu activo más diferenciado. Suelta la tensión de la garganta y trata cada palabra como un dato de conexión, no como una actuación.',
        inspirational: 'Tu voz es única. Libera la tensión de la garganta. Deja que las palabras fluyan del corazón. Tu voz no necesita ser perfecta, solo necesita ser tuya.'
      }
    },
    atmosphere: {
      pt: 'Criativa, autêntica e expansiva',
      en: 'Creative, authentic, and expansive',
      es: 'Creativa, auténtica y expansiva'
    }
  },
  {
    id: 4,
    title: {
      pt: 'EXPANSÃO',
      en: 'EXPANSION',
      es: 'EXPANSIÓN'
    },
    range: [22, 30],
    colorAccent: 'text-[#D4AF37] dark:text-[#E8C85C]', // Gold
    gradient: 'from-[#FAF8F5] via-[#FFFDF5] to-[#FAF8F5]',
    darkGradient: 'dark:from-[#1E1715] dark:via-[#262215] dark:to-[#1E1715]',
    theme: {
      pt: 'Liderança • Identidade • Contribuição',
      en: 'Leadership • Identity • Contribution',
      es: 'Liderazgo • Identidad • Contribución'
    },
    message: {
      pt: {
        gentle: 'Quem você se tornou já é suficiente pra fazer diferença.',
        challenger: 'O mundo não vai esperar você se sentir [pronta/pronto/pronte] pra receber o que você tem a oferecer.',
        strategic: 'Sua consistência virou ativo. Agora é hora de escalar o impacto.',
        inspirational: 'O mundo precisa de quem você se tornou.'
      },
      en: {
        gentle: "Who you've become is already enough to make a difference.",
        challenger: 'The world will not wait for you to feel ready to receive what you have to offer.',
        strategic: 'Your consistency has become an asset. Now it is time to scale the impact.',
        inspirational: "The world needs who you've become."
      },
      es: {
        gentle: 'Quien te has convertido ya es suficiente para marcar la diferencia.',
        challenger: 'El mundo no va a esperar a que te sientas [lista/listo/liste] para recibir lo que tienes para ofrecer.',
        strategic: 'Tu consistencia se convirtió en un activo. Ahora es hora de escalar el impacto.',
        inspirational: 'El mundo necesita en quien te has convertido.'
      }
    },
    expectation: {
      pt: {
        gentle: 'Você já chegou até aqui com muito cuidado consigo [mesma/mesmo/mesme]. Nessa fase, vamos simplesmente consolidar quem você já é, sem pressa de virar mais nada.',
        challenger: 'Chega de só tentar. Você já se tornou visível — agora o trabalho é parar de agir como [iniciante/iniciante/iniciante] e começar a ocupar o espaço de quem já provou que consegue.',
        strategic: 'Você não está mais testando o método — você validou ele. Essa fase é sobre otimizar seu alcance e consolidar sua identidade como algo replicável, não sortudo.',
        inspirational: 'Você não está mais apenas tentando. Você se tornou visível. Esta fase consolida sua nova identidade de autoconfiança e liderança consciente.'
      },
      en: {
        gentle: "You've already come this far by taking real care of yourself. In this phase, we'll simply consolidate who you already are, with no rush to become anything more.",
        challenger: "Enough just trying. You've already become visible — now the work is to stop acting like a beginner and start occupying the space of someone who's already proven they can.",
        strategic: "You're no longer testing the method — you've validated it. This phase is about optimizing your reach and consolidating your identity as something repeatable, not lucky.",
        inspirational: 'You are no longer just trying. You have become visible. This phase consolidates your new identity of self-trust and conscious leadership.'
      },
      es: {
        gentle: 'Ya llegaste hasta aquí cuidando mucho de [ti misma/ti mismo/ti misme]. En esta fase, vamos simplemente a consolidar quien ya eres, sin prisa por convertirte en algo más.',
        challenger: 'Basta de solo intentar. Ya te has vuelto visible — ahora el trabajo es dejar de actuar como principiante y empezar a ocupar el espacio de quien ya demostró que puede.',
        strategic: 'Ya no estás probando el método — lo validaste. Esta fase es sobre optimizar tu alcance y consolidar tu identidad como algo replicable, no suerte.',
        inspirational: 'Ya no estás solo intentando. Te has vuelto visible. Esta fase consolida tu nueva identidad de autoconfianza y liderazgo consciente.'
      }
    },
    reflection: {
      pt: {
        gentle: 'Sua presença já inspira mais gente do que você imagina, só por continuar aparecendo com verdade.',
        challenger: 'Liderança de verdade não pede permissão pra existir. Sua presença já inspira — pare de minimizar isso e ocupe o espaço que já é seu.',
        strategic: 'Sua presença agora funciona como prova social: cada vez que você compartilha quem é, você abre espaço pra outras pessoas fazerem o mesmo. É um efeito replicável, não coincidência.',
        inspirational: 'A verdadeira liderança nasce da generosidade de compartilhar quem você é. Sua presença agora inspira outras pessoas a também ocuparem seus espaços.'
      },
      en: {
        gentle: 'Your presence already inspires more people than you realize, just by continuing to show up with truth.',
        challenger: 'Real leadership does not ask permission to exist. Your presence already inspires — stop minimizing it and occupy the space that is already yours.',
        strategic: 'Your presence now works as social proof: every time you share who you are, you open space for others to do the same. It is a repeatable effect, not a coincidence.',
        inspirational: 'True leadership is born from the generosity of sharing who you are. Your presence now inspires others to also occupy their spaces.'
      },
      es: {
        gentle: 'Tu presencia ya inspira a más personas de las que imaginas, solo por seguir apareciendo con verdad.',
        challenger: 'El liderazgo real no pide permiso para existir. Tu presencia ya inspira — deja de minimizarlo y ocupa el espacio que ya es tuyo.',
        strategic: 'Tu presencia ahora funciona como prueba social: cada vez que compartes quién eres, abres espacio para que otras personas hagan lo mismo. Es un efecto replicable, no coincidencia.',
        inspirational: 'El verdadero liderazgo nace de la generosidad de compartir quién eres. Tu presencia ahora inspira a otras personas a ocupar también sus espacios.'
      }
    },
    audioNarrative: {
      pt: {
        gentle: 'Sinta o quanto você já cresceu, com carinho por cada passo. Olhe pra trás com gratidão, e permita-se simplesmente descansar nessa versão integrada de você.',
        challenger: 'Sinta sua própria grandeza — e pare de duvidar dela. Você cruzou a ponte, então aja como quem sabe disso. O mundo está pronto, e você também está.',
        strategic: 'Sinta sua própria grandeza como um dado consolidado, não uma esperança. Você cruzou a ponte, validou o método, e agora está pronto pra escalar. O mundo está pronto.',
        inspirational: 'Sinta sua própria grandeza. Você cruzou a ponte. Olhe para trás com gratidão e dê as boas-vindas à sua versão integrada. O mundo está pronto.'
      },
      en: {
        gentle: "Feel how much you've already grown, with tenderness for every step. Look back with gratitude, and allow yourself to simply rest in this integrated version of you.",
        challenger: "Feel your own greatness — and stop doubting it. You've crossed the bridge, so act like someone who knows it. The world is ready, and so are you.",
        strategic: "Feel your own greatness as a consolidated data point, not a hope. You've crossed the bridge, validated the method, and now you're ready to scale. The world is ready.",
        inspirational: 'Feel your own greatness. You have crossed the bridge. Look back with gratitude and welcome your integrated self. The world is ready.'
      },
      es: {
        gentle: 'Siente cuánto ya has crecido, con ternura por cada paso. Mira atrás con gratitud, y permítete simplemente descansar en esta versión integrada de ti.',
        challenger: 'Siente tu propia grandeza — y deja de dudar de ella. Cruzaste el puente, así que actúa como quien lo sabe. El mundo está listo, y tú también.',
        strategic: 'Siente tu propia grandeza como un dato consolidado, no una esperanza. Cruzaste el puente, validaste el método, y ahora estás lista para escalar. El mundo está listo.',
        inspirational: 'Siente tu propia grandeza. Has cruzado el puente. Mira atrás con gratitud y dale la bienvenida a tu versión integrada. El mundo está listo.'
      }
    },
    atmosphere: {
      pt: 'Elevada, poderosa e integrada',
      en: 'Grounded, powerful, and reflective',
      es: 'Elevada, poderosa e integrada'
    }
  }
];

export function getChapterForDay(dayNumber: number): Chapter {
  const chapter = chapters.find(c => dayNumber >= c.range[0] && dayNumber <= c.range[1]);
  return chapter || chapters[0];
}

export function getButterflyConfig(dayNumber: number) {
  if (dayNumber <= 7) {
    return { size: 18, opacity: 0.4, speedMultiplier: 0.65 };
  }
  if (dayNumber <= 14) {
    return { size: 24, opacity: 0.6, speedMultiplier: 1.0 };
  }
  if (dayNumber <= 21) {
    return { size: 30, opacity: 0.8, speedMultiplier: 1.3 };
  }
  return { size: 38, opacity: 1.0, speedMultiplier: 1.7 };
}
