/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Language } from '../types';

export interface Chapter {
  id: number;
  title: Record<Language, string>;
  range: [number, number];
  colorAccent: string;
  gradient: string;
  darkGradient: string;
  theme: Record<Language, string>;
  message: Record<Language, string>;
  expectation: Record<Language, string>;
  reflection: Record<Language, string>;
  audioNarrative: Record<Language, string>;
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
      pt: 'É seguro ser [vista/visto/viste].',
      en: 'It is safe to be seen.',
      es: 'Es seguro ser [vista/visto/viste].'
    },
    expectation: {
      pt: 'Nesta primeira fase, vamos focar em desarmar o perfeccionismo e construir um espaço seguro no seu sistema nervoso para a visibilidade diária.',
      en: 'In this first phase, we will focus on disarming perfectionism and building a safe space in your nervous system for daily visibility.',
      es: 'En esta primera fase, nos enfocaremos en desarmar el perfeccionismo y construir un espacio seguro en tu sistema nervioso para la visibilidad diaria.'
    },
    reflection: {
      pt: 'Antes de ser grande, você precisa se dar a permissão de simplesmente começar. A visibilidade começa no silêncio do autoacolhimento.',
      en: 'Before being great, you must give yourself permission to simply start. Visibility begins in the silence of self-acceptance.',
      es: 'Antes de ser grande, debes darte el permiso de simplemente comenzar. La visibilidad comienza en el silencio de la autoaceptación.'
    },
    audioNarrative: {
      pt: '[Bem-vinda/Bem-vindo/Bem-vinde] ao Despertar. Sinta a terra firme sob seus pés. Respire fundo e repita mentalmente: eu me dou permissão para ser [imperfeita/imperfeito/imperfeite]. É aqui que começamos.',
      en: 'Welcome to Awakening. Feel the firm ground beneath your feet. Breathe deeply and repeat mentally: I give myself permission to be imperfect. This is where we begin.',
      es: '[Bienvenida/Bienvenido/Bienvenide] al Despertar. Siente la tierra firme bajo tus pies. Respira hondo y repite mentalmente: me doy permiso para ser [imperfecta/imperfecto/imperfecte]. Aquí es donde comenzamos.'
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
      pt: 'Você se torna [corajosa/corajoso/corajose] aparecendo.',
      en: 'You become courageous by showing up.',
      es: 'Te vuelves valiente apareciendo.'
    },
    expectation: {
      pt: 'Hora de agir. Deixamos as desculpas de lado e focamos na consistência. A coragem é uma habilidade prática desenvolvida no movimento.',
      en: 'Time for action. We put excuses aside and focus on consistency. Courage is a practical skill developed in movement.',
      es: 'Hora de actuar. Dejamos las excusas de lado y nos enfocamos en la consistencia. El coraje es una habilidad práctica desarrollada en el movimiento.'
    },
    reflection: {
      pt: 'A coragem não é a ausência de medo, mas sim a decisão de que algo mais é importante. Cada vez que você aparece, você fortalece esse novo hábito.',
      en: 'Courage is not the absence of fear, but rather the decision that something else is more important. Each time you show up, you reinforce this new habit.',
      es: 'El coraje no es la ausencia de miedo, sino la decisión de que algo más es importante. Cada vez que apareces, fortaleces este nuevo hábito.'
    },
    audioNarrative: {
      pt: 'Fase de Coragem. O medo ainda sussurra, mas sua ação fala mais alto. Sinta o calor da ação percorrer seu corpo. Você está se provando capaz.',
      en: 'Courage Phase. Fear still whispers, but your action speaks louder. Feel the warmth of action flowing through your body. You are proving yourself capable.',
      es: 'Fase de Coraje. El miedo aún susurra, pero tu acción habla más fuerte. Siente el calor de la acción recorrer tu cuerpo. Te estás demostrando capaz.'
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
      pt: 'Sua voz merece espaço.',
      en: 'Your voice deserves space.',
      es: 'Tu voz merece espacio.'
    },
    expectation: {
      pt: 'Esta fase é sobre profundidade e verdade. Você vai aprender a contar suas histórias de maneira autêntica e assumir sua vulnerabilidade com orgulho.',
      en: 'This phase is about depth and truth. You will learn to tell your stories authentically and wear your vulnerability with pride.',
      es: 'Esta fase es sobre profundidad y verdad. Aprenderás a contar tus historias de manera auténtica y a asumir tu vulnerabilidad con orgullo.'
    },
    reflection: {
      pt: 'Há uma liberdade imensa em parar de tentar agradar a todos. O mundo não precisa de cópias polidas, ele precisa da sua perspectiva genuína.',
      en: 'There is immense freedom in stopping trying to please everyone. The world does not need polished copies; it needs your genuine perspective.',
      es: 'Hay una libertad inmensa en dejar de intentar complacer a todos. El mundo no necesita copias pulidas, necesita tu perspectiva genuina.'
    },
    audioNarrative: {
      pt: 'Sua voz é única. Libere a tensão da garganta. Deixe as palavras fluírem do coração. Sua voz não precisa ser perfeita, ela só precisa ser sua.',
      en: 'Your voice is unique. Release the tension in your throat. Let the words flow from the heart. Your voice does not need to be perfect; it only needs to be yours.',
      es: 'Tu voz es única. Libera la tensión de la garganta. Deja que las palabras fluyan del corazón. Tu voz no necesita ser perfecta, solo necesita ser tuya.'
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
      pt: 'O mundo precisa de quem você se tornou.',
      en: "The world needs who you've become.",
      es: 'El mundo necesita en quien te has convertido.'
    },
    expectation: {
      pt: 'Você não está mais apenas tentando. Você se tornou visível. Esta fase consolida sua nova identidade de autoconfiança e liderança consciente.',
      en: 'You are no longer just trying. You have become visible. This phase consolidates your new identity of self-trust and conscious leadership.',
      es: 'Ya no estás solo intentando. Te has vuelto visible. Esta fase consolida tu nueva identidad de autoconfianza y liderazgo consciente.'
    },
    reflection: {
      pt: 'A verdadeira liderança nasce da generosidade de compartilhar quem você é. Sua presença agora inspira outras pessoas a também ocuparem seus espaços.',
      en: 'True leadership is born from the generosity of sharing who you are. Your presence now inspires others to also occupy their spaces.',
      es: 'El verdadero liderazgo nace de la generosidad de compartir quién eres. Tu presencia ahora inspira a otras personas a ocupar también sus espacios.'
    },
    audioNarrative: {
      pt: 'Sinta sua própria grandeza. Você cruzou a ponte. Olhe para trás com gratidão e dê as boas-vindas à sua versão integrada. O mundo está pronto.',
      en: 'Feel your own greatness. You have crossed the bridge. Look back with gratitude and welcome your integrated self. The world is ready.',
      es: 'Siente tu propia grandeza. Has cruzado el puente. Mira atrás con gratitud y dale la bienvenida a tu versión integrada. El mundo está listo.'
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
