/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MissionDay, DayType, Language, UserProgress } from '../types';

// Helper to determine DayType based on day of 30-day cycle
export function getDayType(dayNumber: number): DayType {
  const position = (dayNumber - 1) % 7;
  switch (position) {
    case 0: return DayType.RestartIntention; // Monday
    case 1: return DayType.Truth;            // Tuesday
    case 2: return DayType.Storytelling;     // Wednesday
    case 3: return DayType.ContrarianThinking; // Thursday
    case 4: return DayType.Rest;               // Friday (Rest Day)
    case 5: return DayType.Presence;           // Saturday
    case 6: return DayType.Reflection;         // Sunday
    default: return DayType.RestartIntention;
  }
}

export function getDayTypeLabel(type: DayType, lang: Language): string {
  const labels: Record<DayType, Record<Language, string>> = {
    [DayType.RestartIntention]: {
      pt: 'Recomeço + Intenção (Segunda-feira)',
      en: 'Restart + Intention (Monday)',
      es: 'Reinicio + Intención (Lunes)'
    },
    [DayType.Truth]: {
      pt: 'Verdade (Terça-feira)',
      en: 'Truth (Tuesday)',
      es: 'Verdad (Martes)'
    },
    [DayType.Storytelling]: {
      pt: 'Storytelling (Quarta-feira)',
      en: 'Storytelling (Wednesday)',
      es: 'Storytelling (Miércoles)'
    },
    [DayType.ContrarianThinking]: {
      pt: 'Pensamento Contrário (Quinta-feira)',
      en: 'Contrarian Thinking (Thursday)',
      es: 'Pensamiento Contrario (Jueves)'
    },
    [DayType.Rest]: {
      pt: 'Dia de Descanso (Sexta-feira)',
      en: 'Rest Day (Friday)',
      es: 'Día de Descanso (Viernes)'
    },
    [DayType.Presence]: {
      pt: 'Treino de Presença (Sábado)',
      en: 'Presence Training (Saturday)',
      es: 'Entrenamiento de Presencia (Sábado)'
    },
    [DayType.Reflection]: {
      pt: 'Reflexão e Sustentabilidade (Domingo)',
      en: 'Reflection & Sustainability (Sunday)',
      es: 'Reflexión y Sostenibilidad (Domingo)'
    }
  };
  return labels[type][lang];
}

const titlesByWeekDay: Record<DayType, Record<Language, string>> = {
  [DayType.RestartIntention]: {
    pt: 'Definindo sua Intenção de Visibilidade',
    en: 'Defining your Visibility Intention',
    es: 'Definiendo tu Intención de Visibilidad'
  },
  [DayType.Truth]: {
    pt: 'Abandonando a Máscara da Perfeição',
    en: 'Shedding the Mask of Perfection',
    es: 'Abandonando la Máscara de la Perfección'
  },
  [DayType.Storytelling]: {
    pt: 'Sua Primeira Jornada do Herói',
    en: 'Your First Hero Journey',
    es: 'Tu Primer Viaje del Héroe'
  },
  [DayType.ContrarianThinking]: {
    pt: 'Compartilhando uma Opinião Impopular',
    en: 'Sharing an Unpopular Opinion',
    es: 'Compartiendo una Opinión Impopular'
  },
  [DayType.Rest]: {
    pt: 'Pausa Estratégica e Integração',
    en: 'Strategic Pause and Integration',
    es: 'Pausa Estratégica e Integración'
  },
  [DayType.Presence]: {
    pt: 'Falando para Uma Única Pessoa',
    en: 'Speaking to a Single Person',
    es: 'Hablando a una Sola Persona'
  },
  [DayType.Reflection]: {
    pt: 'Celebrando o Turno Semanal',
    en: 'Celebrating the Weekly Shift',
    es: 'Celebrando el Giro Semanal'
  }
};

// Real recorded daily audio, one file per day, added incrementally.
// Days not listed here fall back to the placeholder ambience sound below.
const DAILY_AUDIO_FILES: Record<number, string> = {
  1: '/assets/audio/dia-01.mp3'
};
const FALLBACK_AUDIO_URL = 'https://actions.google.com/sounds/v1/ambiences/morning_birds.ogg';

function getAudioUrlForDay(dayNumber: number): string {
  return DAILY_AUDIO_FILES[dayNumber] || FALLBACK_AUDIO_URL;
}

// Generate initial 30 days structure based on the rhythm
export function generateInitialDays(): MissionDay[] {
  const days: MissionDay[] = [];

  for (let i = 1; i <= 30; i++) {
    const type = getDayType(i);
    const titlePt = `${titlesByWeekDay[type].pt} (Dia ${i})`;
    const titleEn = `${titlesByWeekDay[type].en} (Day ${i})`;
    const titleEs = `${titlesByWeekDay[type].es} (Día ${i})`;
    const audioUrl = getAudioUrlForDay(i);

    days.push({
      dayNumber: i,
      type,
      title: { pt: titlePt, en: titleEn, es: titleEs },
      content: {
        pt: {
          audioUrl, // Real recording if available for this day, otherwise placeholder
          hook: `O maior erro que você comete ao tentar gravar vídeos hoje é achar que precisa ser [perfeita/perfeito/perfeite]. No Dia ${i}, vamos quebrar isso.`,
          scripts: [
            `Roteiro Opção 1 (Conexão Rápida):\n"Se você tem vergonha de gravar vídeos, deixa eu te contar um segredo... eu também tinha. Mas hoje eu decidi..."`,
            `Roteiro Opção 2 (Provocação):\n"Pare de tentar agradar a todo mundo nas redes sociais. A verdade é que quem te julga não paga seus boletos..."`,
            `Roteiro Opção 3 (Educativo):\n"3 coisas simples que me ajudaram a vencer a vergonha da câmera: 1. Falar com a lente como se fosse um amigo; 2..."`
          ],
          exposureAction: `Hoje você vai fazer 3 práticas de gravação\n• Grave um vídeo de até 60 segundos para postar no reels\n• Grave um vídeo de pelo menos 30 segundos sobre o seu maior aprendizado do Dia ${i} ou poste uma foto com uma legenda honesta\n• Grave um vídeo de até 90 segundos, com um dos hooks disponíveis pro dia de hoje`,
          reflectionQuestion: 'Como você se sentiu hoje ao encarar a possibilidade de ser [vista/visto/viste] de verdade pelas pessoas?'
        },
        en: {
          audioUrl,
          hook: `The biggest mistake you make when trying to record videos today is thinking you need to be perfect. On Day ${i}, we break this.`,
          scripts: [
            `Script Option 1 (Quick Connection):\n"If you are afraid of recording videos, let me tell you a secret... I was too. But today I decided to..."`,
            `Script Option 2 (Provocation):\n"Stop trying to please everyone on social media. The truth is, those who judge you don't pay your bills..."`,
            `Script Option 3 (Educational):\n"3 simple things that helped me overcome camera shyness: 1. Talk to the lens as if it were a close friend; 2..."`
          ],
          exposureAction: `Today you'll do 3 recording practices\n• Record a video up to 60 seconds long to post on reels\n• Record a video at least 30 seconds long about your biggest takeaway from Day ${i}, or post a photo with an honest caption\n• Record a video up to 90 seconds long, using one of today's available hooks`,
          reflectionQuestion: 'How did you feel today confronting the possibility of being truly seen by people?'
        },
        es: {
          audioUrl,
          hook: `El mayor error que cometes al intentar grabar videos hoy es pensar que necesitas ser [perfecta/perfecto/perfecte]. En el Día ${i}, romperemos esto.`,
          scripts: [
            `Guión Opción 1 (Conexión Rápida):\n"Si tienes vergüenza de grabar videos, déjame contarte un secreto... yo también la tenía. Pero hoy decidí..."`,
            `Guión Opción 2 (Provocación):\n"Deja de intentar agradar a todos en las redes sociales. La verdad es que quien te juzga no paga tus cuentas..."`,
            `Guión Opción 3 (Educativo):\n"3 cosas simples que me ayudaron a vencer la vergüenza de la cámara: 1. Hablarle a la lente como si fuera un amigo; 2..."`
          ],
          exposureAction: `Hoy vas a hacer 3 prácticas de grabación\n• Graba un video de hasta 60 segundos para publicar en reels\n• Graba un video de al menos 30 segundos sobre tu mayor aprendizaje del Día ${i} o publica una foto con una descripción honesta\n• Graba un video de hasta 90 segundos, con uno de los hooks disponibles para hoy`,
          reflectionQuestion: '¿Cómo te sentiste hoy al enfrentar la posibilidad de ser [vista/visto/viste] realmente por la gente?'
        }
      }
    });
  }
  
  return days;
}

// Bump this whenever generateInitialDays()'s template content changes, so
// browsers with an already-cached renaser_days regenerate instead of showing
// stale copy. NOTE: this also discards any day content hand-edited via
// Creator Studio (CMS) — acceptable while content is still being tuned from
// code, but worth knowing once the CMS is used for real day-by-day editing.
const DAYS_CONTENT_VERSION = '3';

export function loadDaysFromStorage(): MissionDay[] {
  const stored = localStorage.getItem('renaser_days');
  const storedVersion = localStorage.getItem('renaser_days_version');
  if (stored && storedVersion === DAYS_CONTENT_VERSION) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing stored days, loading default', e);
    }
  }

  const initial = generateInitialDays();
  localStorage.setItem('renaser_days', JSON.stringify(initial));
  localStorage.setItem('renaser_days_version', DAYS_CONTENT_VERSION);
  return initial;
}

export function saveDaysToStorage(days: MissionDay[]): void {
  localStorage.setItem('renaser_days', JSON.stringify(days));
  localStorage.setItem('renaser_days_version', DAYS_CONTENT_VERSION);
}

export function loadUserProgressFromStorage(): UserProgress {
  const stored = localStorage.getItem('renaser_user_progress');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing user progress, loading default', e);
    }
  }
  
  const defaultProgress: UserProgress = {
    currentDay: 1,
    completionHistory: [],
    currentStreak: 0,
    longestStreak: 0,
    favoriteHooks: [],
    copiedHooks: [],
    videoLinks: {},
    reflections: {},
    lastActiveDate: null
  };
  
  localStorage.setItem('renaser_user_progress', JSON.stringify(defaultProgress));
  return defaultProgress;
}

export function saveUserProgressToStorage(progress: UserProgress): void {
  localStorage.setItem('renaser_user_progress', JSON.stringify(progress));
}
