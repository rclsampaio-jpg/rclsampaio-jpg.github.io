/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Journey, Chapter, Day, DayType, Language } from '../types';
import { generateInitialDays } from './templateData';

export const INITIAL_JOURNEYS: Journey[] = [
  {
    id: 'destrave_visibilidade',
    title: {
      pt: 'Destrave de Visibilidade',
      en: 'Visibility Breakthrough',
      es: 'Desbloqueo de Visibilidad'
    },
    subtitle: {
      pt: 'Sua jornada transformadora de 30 dias para libertar sua voz e dominar a câmera.',
      en: 'Your transformative 30-day journey to release your voice and master the camera.',
      es: 'Tu viaje transformador de 30 días para liberar tu voz y dominar la cámara.'
    },
    description: {
      pt: 'O RenaSer não é apenas um desafio. É um portal de transição emocional e destrave de visibilidade. Com base em regulação nervosa, ganchos magnéticos e consistência, você construirá uma presença inabalável.',
      en: 'RenaSer is not just a challenge. It is an emotional transition portal and visibility breakthrough system. Grounded in nervous regulation, magnetic hooks, and consistency, you will build an unshakeable presence.',
      es: 'RenaSer no es solo un desafío. Es un portal de transición emocional y desbloqueo de visibilidad. Basado en la regulación nerviosa, ganchos magnéticos y consistencia, construirás una presencia inquebrantable.'
    },
    coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    languages: ['pt', 'en', 'es'],
    difficulty: 'beginner',
    estimatedDuration: '30 dias',
    author: 'Equipe Editorial RenaSer',
    status: 'published',
    tags: ['Visibilidade', 'Câmera', 'Autenticidade'],
    accessRules: 'free',
    order: 1,
    visibility: 'public',
    progressRules: 'sequential',
    completionRules: 'all_days_completed',
    celebrationRules: 'butterfly_bloom',
    unlockRules: 'automatic',
    certificateRules: 'generate_certificate',
    communityRules: 'link_vip_telegram',
    mentorshipRules: 'allow_calendly'
  },
  {
    id: 'storytelling_impacto',
    title: {
      pt: 'Storytelling de Alto Impacto',
      en: 'High-Impact Storytelling',
      es: 'Storytelling de Alto Impacto'
    },
    subtitle: {
      pt: 'Conecte profundamente através de narrativas vulneráveis e persuasivas.',
      en: 'Connect deeply through vulnerable and persuasive narratives.',
      es: 'Conecta profundamente a través de narrativas vulnerables y persuasivas.'
    },
    description: {
      pt: 'Aprenda a mapear sua própria Jornada do Herói, criar contrastes emocionais marcantes e prender a audiência nos primeiros segundos usando estruturas testadas de roteirização narrativa.',
      en: 'Learn to map your own Hero\'s Journey, create striking emotional contrasts, and lock the audience in the first seconds using tested narrative scripting models.',
      es: 'Aprende a mapear tu propio Viaje del Héroe, crear contrastes emocionales impactantes y capturar a la audiencia en los primeros segundos usando estructuras de guión probadas.'
    },
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80',
    languages: ['pt', 'en', 'es'],
    difficulty: 'intermediate',
    estimatedDuration: '5 dias',
    author: 'Gabriel RenaSer',
    status: 'published',
    tags: ['Storytelling', 'Conexão', 'Persuasão'],
    accessRules: 'premium',
    order: 2,
    visibility: 'public',
    progressRules: 'sequential',
    completionRules: 'all_days_completed',
    celebrationRules: 'gold_confetti',
    unlockRules: 'requires_unlocked_next_level',
    certificateRules: 'generate_storytelling_certificate',
    communityRules: 'link_vip_telegram',
    mentorshipRules: 'allow_calendly'
  },
  {
    id: 'gravacao_postura_voz',
    title: {
      pt: 'Gravação Sem Medo: Postura e Voz',
      en: 'Fearless Recording: Body & Voice',
      es: 'Grabación Sin Miedo: Postura y Voz'
    },
    subtitle: {
      pt: 'Domine a projeção vocal, linguagem corporal e controle de estresse na câmera.',
      en: 'Master vocal projection, body language, and on-camera stress management.',
      es: 'Domina la proyección vocal, el lenguaje corporal y el control del estrés en cámara.'
    },
    description: {
      pt: 'Calibre suas cordas vocais, destrave a mandíbula e estabilize seu batimento cardíaco antes de apertar o botão de gravar. Exercícios práticos de oratória somática para se posicionar com autoridade.',
      en: 'Calibrate your vocal cords, release jaw tension, and stabilize your heart rate before pressing record. Practical somatic speaking exercises to project authority.',
      es: 'Calibra tus cuerdas vocales, libera la tensión de la mandíbula y estabiliza tu ritmo cardíaco antes de grabar. Ejercicios prácticos de oratoria somática.'
    },
    coverImage: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=800&q=80',
    languages: ['pt', 'en', 'es'],
    difficulty: 'advanced',
    estimatedDuration: '3 dias',
    author: 'Clara Vocal Coach',
    status: 'published',
    tags: ['Oratória', 'Voz', 'Presença'],
    accessRules: 'premium',
    order: 3,
    visibility: 'public',
    progressRules: 'sequential',
    completionRules: 'all_days_completed',
    celebrationRules: 'sparkles_cascade',
    unlockRules: 'requires_unlocked_next_level',
    certificateRules: 'generate_vocal_certificate',
    communityRules: 'link_vip_telegram',
    mentorshipRules: 'allow_calendly'
  }
];

export const INITIAL_CHAPTERS: Chapter[] = [
  // Chapters for Journey 1
  {
    id: 'ch_despertar',
    journeyId: 'destrave_visibilidade',
    title: {
      pt: 'DESPERTAR',
      en: 'AWAKENING',
      es: 'DESPERTAR'
    },
    description: {
      pt: 'Nesta primeira fase, vamos focar em desarmar o perfeccionismo e construir segurança.',
      en: 'In this first phase, we focus on disarming perfectionism and building somatic safety.',
      es: 'En esta primera fase, nos enfocaremos en desarmar el perfeccionismo y construir seguridad.'
    },
    coverImage: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=600&q=80',
    theme: {
      pt: 'Segurança • Início • Permissão',
      en: 'Safety • Beginning • Permission',
      es: 'Seguridad • Inicio • Permisión'
    },
    objectives: {
      pt: ['Acalmar o sistema nervoso', 'Permitir-se cometer erros', 'Gravar as primeiras tomadas curtas'],
      en: ['Soothe the nervous system', 'Allow yourself to make mistakes', 'Record your first short clips'],
      es: ['Calmar el sistema nervioso', 'Permitirse cometer errores', 'Grabar tus primeros clips cortos']
    },
    colorTheme: 'text-[#C9A097] dark:text-[#E2C2BA]',
    celebrationAnimation: 'confetti',
    completionReflection: {
      pt: 'Parabéns por despertar! O primeiro passo é o mais denso. Você provou que é seguro aparecer.',
      en: 'Congratulations on Awakening! The first step is the heaviest. You proved it is safe to show up.',
      es: '¡Felicitaciones por despertar! El primer paso es el más denso. Has demostrado que es seguro aparecer.'
    },
    chapterBadge: 'Compass',
    order: 1
  },
  {
    id: 'ch_coragem',
    journeyId: 'destrave_visibilidade',
    title: {
      pt: 'CORAGEM',
      en: 'COURAGE',
      es: 'CORAJE'
    },
    description: {
      pt: 'Consistência prática e ação focada para calar o crítico interno.',
      en: 'Practical consistency and focused action to quiet the inner critic.',
      es: 'Consistencia práctica y acción enfocada para acallar al crítico interno.'
    },
    coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    theme: {
      pt: 'Ação • Consistência • Confiança',
      en: 'Action • Consistency • Confidence',
      es: 'Acción • Consistencia • Confianza'
    },
    objectives: {
      pt: ['Vencer a barreira da consistência', 'Ignorar julgamentos alheios', 'Desenvolver ritmo de fala natural'],
      en: ['Overcome the consistency wall', 'Ignore external judgments', 'Develop natural speaking cadence'],
      es: ['Vencer la barrera de la consistencia', 'Ignorar juicios externos', 'Desarrollar ritmo de habla natural']
    },
    colorTheme: 'text-[#B76E79] dark:text-[#C98A94]',
    celebrationAnimation: 'sparkles',
    completionReflection: {
      pt: 'A coragem não é a ausência de medo, mas sim agir apesar dele. Você está construindo uma casca inquebrável.',
      en: 'Courage is not the absence of fear, but taking action despite it. You are building an unshakeable core.',
      es: 'El coraje no es la ausencia de miedo, sino actuar a pesar de él. Estás construyendo un núcleo inquebrantable.'
    },
    chapterBadge: 'Star',
    order: 2
  },
  {
    id: 'ch_expressao',
    journeyId: 'destrave_visibilidade',
    title: {
      pt: 'EXPRESSÃO',
      en: 'EXPRESSION',
      es: 'EXPRESIÓN'
    },
    description: {
      pt: 'Storytelling autêntico, conexão profunda e liberdade criativa.',
      en: 'Authentic storytelling, deep emotional connection, and creative freedom.',
      es: 'Storytelling auténtico, conexión profunda y libertad creativa.'
    },
    coverImage: 'https://images.unsplash.com/photo-1516280440614-37939bbacd6a?auto=format&fit=crop&w=600&q=80',
    theme: {
      pt: 'Autenticidade • Storytelling • Liberdade',
      en: 'Authenticity • Storytelling • Freedom',
      es: 'Autenticidad • Storytelling • Libertad'
    },
    objectives: {
      pt: ['Contar histórias com impacto', 'Expor vulnerabilidade com altivez', 'Conectar no nível subconsciente'],
      en: ['Tell stories with impact', 'Wear vulnerability with dignity', 'Connect on a subconscious level'],
      es: ['Contar historias con impacto', 'Mostrar vulnerabilidad con orgullo', 'Conectar a nivel subconsciente']
    },
    colorTheme: 'text-[#D4AF37] dark:text-[#E8C85C]',
    celebrationAnimation: 'fireworks',
    completionReflection: {
      pt: 'Sua voz tomou corpo! Você aprendeu a pintar imagens com palavras e engajar de verdade.',
      en: 'Your voice has taken flight! You learned to paint pictures with words and truly engage.',
      es: '¡Tu voz ha tomado forma! Aprendiste a pintar imágenes con palabras y a conectar de verdad.'
    },
    chapterBadge: 'Heart',
    order: 3
  },
  {
    id: 'ch_expansao',
    journeyId: 'destrave_visibilidade',
    title: {
      pt: 'EXPANSÃO',
      en: 'EXPANSION',
      es: 'EXPANSIÓN'
    },
    description: {
      pt: 'Liderança, autoridade e consolidação da nova identidade.',
      en: 'Leadership, authority, and solidifying your brand new identity.',
      es: 'Liderazgo, autoridad y consolidación de tu nueva identidad.'
    },
    coverImage: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&w=600&q=80',
    theme: {
      pt: 'Liderança • Identidade • Contribuição',
      en: 'Leadership • Identity • Contribution',
      es: 'Liderazgo • Identidad • Contribución'
    },
    objectives: {
      pt: ['Consolidar a nova identidade confiante', 'Disparar ofertas e parcerias com autoridade', 'Inspirar sua comunidade com presença'],
      en: ['Lock in your confident new identity', 'Pitch offers and partners with absolute authority', 'Inspire your circle with powerful presence'],
      es: ['Consolidar tu nueva identidad confiable', 'Lanzar ofertas y alianzas con autoridad', 'Inspirar a tu comunidad con presencia']
    },
    colorTheme: 'text-[#D4AF37] dark:text-[#E8C85C]',
    celebrationAnimation: 'sparkles',
    completionReflection: {
      pt: 'Você não está mais tentando; você se tornou visível. A ponte foi atravessada. O mundo precisa do seu ser.',
      en: 'You are no longer trying; you have become visible. The bridge is crossed. The world needs your presence.',
      es: 'Ya no estás intentando; te has vuelto visible. Has cruzado el puente. El mundo necesita de tu ser.'
    },
    chapterBadge: 'Award',
    order: 4
  },

  // Chapters for Journey 2
  {
    id: 'ch_story_bases',
    journeyId: 'storytelling_impacto',
    title: {
      pt: 'Bases Narrativas',
      en: 'Narrative Foundations',
      es: 'Bases Narrativas'
    },
    description: {
      pt: 'A estrutura clássica de 3 atos e a conexão pelo sofrimento comum.',
      en: 'The classic 3-act structure and connecting through common struggles.',
      es: 'La estructura clásica de 3 actos y la conexión a través de la lucha compartida.'
    },
    coverImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=600&q=80',
    theme: {
      pt: 'Fórmula • Conexão • Vulnerabilidade',
      en: 'Formula • Connection • Vulnerability',
      es: 'Fórmula • Conexión • Vulnerabilidad'
    },
    objectives: {
      pt: ['Mapear os 3 atos da narrativa', 'Definir o incidente incitador', 'Escrever um roteiro vulnerável'],
      en: ['Map the 3-act narrative structure', 'Pinpoint the inciting incident', 'Write a highly vulnerable script'],
      es: ['Mapear los 3 actos de la narrativa', 'Definir el incidente incitador', 'Escribir un guión vulnerable']
    },
    colorTheme: 'text-rose-400 dark:text-rose-300',
    celebrationAnimation: 'confetti',
    completionReflection: {
      pt: 'Excelente! Você domina a base teórica e escreveu sua primeira curva dramática.',
      en: 'Excellent! You have mastered the core structure and written your first emotional curve.',
      es: '¡Excelente! Dominas la base teórica y escribiste tu primera curva dramática.'
    },
    chapterBadge: 'BookOpen',
    order: 1
  },
  {
    id: 'ch_story_maestria',
    journeyId: 'storytelling_impacto',
    title: {
      pt: 'Maestria Prática',
      en: 'Practical Mastery',
      es: 'Maestría Práctica'
    },
    description: {
      pt: 'Pacing, ganchos magnéticos avançados e gatilho de oferta.',
      en: 'Pacing, advanced hook architectures, and the transition to a call to action.',
      es: 'Pacing, ganchos magnéticos avanzados y transición a la acción.'
    },
    coverImage: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=600&q=80',
    theme: {
      pt: 'Gancho • Ritmo • Chamada',
      en: 'Hook • Pacing • Offer',
      es: 'Gancho • Ritmo • Llamado'
    },
    objectives: {
      pt: ['Criar 5 ganchos magnéticos para o mesmo roteiro', 'Dominar silêncios e acelerações de voz', 'Anexar uma chamada para ação irresistível'],
      en: ['Draft 5 magnetic hooks for one video', 'Master pause structures and verbal acceleration', 'Attach a seamless, powerful call-to-action'],
      es: ['Crear 5 ganchos magnéticos para el mismo video', 'Dominar silencios y aceleraciones de voz', 'Anexar una llamada a la acción irresistible']
    },
    colorTheme: 'text-[#D4AF37] dark:text-[#E8C85C]',
    celebrationAnimation: 'fireworks',
    completionReflection: {
      pt: 'Magnífico! Suas histórias agora são verdadeiras ferramentas de transformação e vendas.',
      en: 'Magnificent! Your stories are now genuine tools for transformation and sales authority.',
      es: '¡Magnífico! Tus historias son ahora verdaderas herramientas de transformación y ventas.'
    },
    chapterBadge: 'Sparkles',
    order: 2
  },

  // Chapters for Journey 3
  {
    id: 'ch_calibracao_vocal',
    journeyId: 'gravacao_postura_voz',
    title: {
      pt: 'Calibração e Projeção',
      en: 'Calibration and Projection',
      es: 'Calibración y Proyección'
    },
    description: {
      pt: 'Postura corporal correta, regulação vagal e posicionamento magnético.',
      en: 'Correct skeletal posture, vagus nerve regulation, and magnetic vocal resonance.',
      es: 'Postura corporal correcta, regulación vagal y posicionamiento magnético.'
    },
    coverImage: 'https://images.unsplash.com/photo-1516280440614-37939bbacd6a?auto=format&fit=crop&w=600&q=80',
    theme: {
      pt: 'Soma • Ressonância • Poder',
      en: 'Soma • Resonance • Power',
      es: 'Soma • Resonancia • Poder'
    },
    objectives: {
      pt: ['Estabilizar a respiração diafragmática', 'Projetar a voz a partir do peito', 'Eliminar tiques nervosos corporais'],
      en: ['Stabilize deep diaphragmatic breath', 'Project your voice from the chest, not throat', 'Eliminate physical nervous twitches on camera'],
      es: ['Estabilizar la respiración diafragmática', 'Proyectar la voz desde el pecho', 'Eliminar tics nerviosos corporales']
    },
    colorTheme: 'text-amber-500 dark:text-amber-400',
    celebrationAnimation: 'sparkles',
    completionReflection: {
      pt: 'Incrível! Sua voz soa mais quente, confiante e conectada ao seu centro nervoso.',
      en: 'Incredible! Your voice sounds warmer, deeply confident, and safely grounded in your center.',
      es: '¡Increíble! Tu voz suena más cálida, confiada y conectada a tu centro nervioso.'
    },
    chapterBadge: 'Award',
    order: 1
  }
];

// Helper to map 30 days challenge (MissionDay[]) into the modular Day[]
export function mapMissionDaysToDays(missionDays: any[]): Day[] {
  return missionDays.map(md => {
    // Determine chapterId based on dayNumber range
    let chapterId = 'ch_despertar';
    if (md.dayNumber >= 8 && md.dayNumber <= 14) chapterId = 'ch_coragem';
    else if (md.dayNumber >= 15 && md.dayNumber <= 21) chapterId = 'ch_expressao';
    else if (md.dayNumber >= 22) chapterId = 'ch_expansao';

    const dayId = `day_${md.dayNumber}`;

    // Standard mappings
    return {
      id: dayId,
      chapterId,
      journeyId: 'destrave_visibilidade',
      dayNumber: md.dayNumber,
      title: md.title,
      type: md.type,
      weekday: md.weekday || `Day ${md.dayNumber}`,
      theme: md.theme || { pt: 'Visibilidade', en: 'Visibility', es: 'Visibilidad' },
      audioUrl: md.content.pt.audioUrl || 'https://actions.google.com/sounds/v1/ambiences/morning_birds.ogg',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', // Premium video placeholder
      videoType: 'native',
      mission: {
        pt: md.content.pt.exposureAction,
        en: md.content.en.exposureAction,
        es: md.content.es.exposureAction
      },
      hook: {
        pt: md.content.pt.hook,
        en: md.content.en.hook,
        es: md.content.es.hook
      },
      scripts: {
        pt: md.content.pt.scripts,
        en: md.content.en.scripts,
        es: md.content.es.scripts
      },
      reflection: {
        pt: md.content.pt.reflectionQuestion,
        en: md.content.en.reflectionQuestion,
        es: md.content.es.reflectionQuestion
      },
      journalPrompt: {
        pt: 'Escreva suas percepções mais honestas do exercício de hoje.',
        en: 'Write down your most honest reflections from today\'s practice.',
        es: 'Escribe tus percepciones más honestas del ejercicio de hoy.'
      },
      downloads: [
        {
          title: { pt: 'Apostila Auxiliar PDF', en: 'Auxiliary Worksheet PDF', es: 'Guía Auxiliar PDF' },
          url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          type: 'PDF'
        }
      ],
      externalLinks: [
        {
          title: { pt: 'Grupo de Telegram VIP', en: 'Telegram VIP Group', es: 'Grupo de Telegram VIP' },
          url: 'https://telegram.org'
        }
      ],
      videoUploadEnabled: true,
      audioUploadEnabled: true,
      pdfUploadEnabled: true,
      imageUploadEnabled: true,
      completionRules: 'reflection_submitted',
      languageVariations: 'pt,en,es'
    };
  });
}

// Generate secondary journeys static days
export const STORYTELLING_DAYS: Day[] = [
  {
    id: 'story_day_1',
    chapterId: 'ch_story_bases',
    journeyId: 'storytelling_impacto',
    dayNumber: 1,
    title: {
      pt: 'A Jornada do Herói em 60 Segundos',
      en: 'The Hero\'s Journey in 60 Seconds',
      es: 'El Viaje del Héroe en 60 Segundos'
    },
    type: DayType.Storytelling,
    weekday: 'Day 1',
    theme: { pt: 'Fundamentos', en: 'Foundations', es: 'Fundamentos' },
    audioUrl: 'https://actions.google.com/sounds/v1/ambiences/morning_birds.ogg',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    videoType: 'native',
    mission: {
      pt: 'Escreva sua história resumida em três etapas: Sua dor antiga, o ponto de virada, seu estado atual.',
      en: 'Write your summary story in three steps: Your past struggle, the turning point, your current state.',
      es: 'Escribe tu historia resumida en tres etapas: Tu dolor antiguo, el punto de quiebre, tu estado actual.'
    },
    hook: {
      pt: 'O que as pessoas não sabem sobre mim é que eu quase desisti de tudo há 3 anos...',
      en: 'What people don\'t know about me is that I almost gave up on everything 3 years ago...',
      es: 'Lo que la gente no sabe sobre mí es que casi me rindo de todo hace 3 años...'
    },
    scripts: {
      pt: [
        'Opção 1:\n"Se você me vê hoje gravando vídeos com facilidade, não imagina que há 3 anos eu passava mal de ansiedade só de ver uma câmera..."',
        'Opção 2:\n"Nós adoramos ver conquistas nas redes sociais, mas a verdade é que o crescimento real acontece no silêncio da queda. Deixa eu te contar..."',
        'Opção 3:\n"O dia em que um único feedback ruim mudou tudo na minha carreira..."'
      ],
      en: [
        'Option 1:\n"If you see me today recording videos easily, you can\'t imagine that 3 years ago I got sick with anxiety just looking at a lens..."',
        'Option 2:\n"We love seeing wins on social media, but real growth happens in the quietness of failure. Let me share..."',
        'Option 3:\n"The day a single bad feedback changed my entire professional path..."'
      ],
      es: [
        'Opción 1:\n"Si me ves hoy grabando videos con facilidad, no te imaginas que hace 3 años me enfermaba de ansiedad solo con ver una lente..."',
        'Opción 2:\n"Nos encanta ver éxitos en redes, pero el crecimiento real ocurre en el silencio del fracaso. Déjame contarte..."',
        'Opción 3:\n"El día en que un solo mal comentario cambió todo en mi carrera profesional..."'
      ]
    },
    reflection: {
      pt: 'Qual foi o momento mais desafiador da sua vida profissional e o que ele te ensinou?',
      en: 'What was the single hardest moment of your career, and what did it teach you?',
      es: '¿Cuál fue el momento más desafiante de tu carrera y qué te enseñó?'
    },
    downloads: [],
    externalLinks: []
  },
  {
    id: 'story_day_2',
    chapterId: 'ch_story_bases',
    journeyId: 'storytelling_impacto',
    dayNumber: 2,
    title: {
      pt: 'Criando Contraste Emocional',
      en: 'Creating Emotional Contrast',
      es: 'Creando Contraste Emocional'
    },
    type: DayType.Truth,
    weekday: 'Day 2',
    theme: { pt: 'Técnica', en: 'Technique', es: 'Técnica' },
    audioUrl: 'https://actions.google.com/sounds/v1/ambiences/morning_birds.ogg',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    videoType: 'native',
    mission: {
      pt: 'Grave um vídeo mostrando duas perspectivas opostas: a ilusão polida contra o bastidor real do seu trabalho.',
      en: 'Record a video showing two opposing sides: the polished social media illusion vs. the messy back-alley reality of your job.',
      es: 'Graba un video mostrando dos perspectivas opuestas: la ilusión pulida contra el detrás de escena real de tu trabajo.'
    },
    hook: {
      pt: 'Aqui está o que as fotos do Instagram não te mostram sobre trabalhar de casa...',
      en: 'Here is what Instagram pictures don\'t show you about working from home...',
      es: 'Aquí está lo que las fotos de Instagram no te muestran sobre trabajar desde casa...'
    },
    scripts: {
      pt: [
        'Opção 1:\n"A postagem polida: faturamento recorde. Os bastidores: 3 xícaras de café frio, olheiras e uma dúvida gigantesca sobre a próxima semana..."',
        'Opção 2:\n"Gente, parem de comparar seus bastidores com o palco dos outros. A verdade é que todo mundo se enrola..."',
        'Opção 3:\n"Três coisas que parecem super profissionais, mas são pura improvisação por aqui..."'
      ],
      en: [
        'Option 1:\n"The shiny post: record sales. The backstage: 3 cups of cold coffee, deep dark eye circles, and complete uncertainty about next week..."',
        'Option 2:\n"Stop comparing your messy behind-the-scenes with everyone else\'s highlight reel. The truth is, we are all figuring it out..."',
        'Option 3:\n"Three things that look highly professional on my videos, but are pure improvisation..."'
      ],
      es: [
        'Opción 1:\n"La publicación brillante: ventas récord. El detrás de escena: 3 tazas de café frío, ojeras y una incertidumbre total sobre la próxima semana..."',
        'Opción 2:\n"Dejen de comparar sus detrás de escena con los momentos destacados de los demás. La verdad es que todos batallamos..."',
        'Opción 3:\n"Tres cosas que parecen súper profesionales en mis videos, pero que son pura improvisación por aquí..."'
      ]
    },
    reflection: {
      pt: 'O que te impede de ser mais vulnerável com o seu público?',
      en: 'What scares you the most about being completely vulnerable with your audience?',
      es: '¿Qué es lo que más te asusta de ser completamente vulnerable con tu público?'
    },
    downloads: [],
    externalLinks: []
  },
  {
    id: 'story_day_3',
    chapterId: 'ch_story_bases',
    journeyId: 'storytelling_impacto',
    dayNumber: 3,
    title: {
      pt: 'O Incidente Incitador',
      en: 'The Inciting Incident',
      es: 'El Incidente Incitador'
    },
    type: DayType.ContrarianThinking,
    weekday: 'Day 3',
    theme: { pt: 'Narrativa', en: 'Narrative', es: 'Narrativa' },
    audioUrl: 'https://actions.google.com/sounds/v1/ambiences/morning_birds.ogg',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    videoType: 'native',
    mission: {
      pt: 'Identifique o exato telefonema, e-mail, demissão ou frase que fez você mudar de rumo e transforme-o em um gancho narrativo.',
      en: 'Identify the exact phone call, email, firing, or sentence that forced you to change directions, and turn it into a hook.',
      es: 'Identifica la llamada exacta, correo electrónico, despido o frase que te obligó a cambiar de rumbo y conviértelo en un gancho.'
    },
    hook: {
      pt: 'Tudo mudou para mim quando eu recebi aquele e-mail às duas da manhã...',
      en: 'Everything shifted for me when I received that single email at two in the morning...',
      es: 'Todo cambió para mí cuando recibí aquel correo electrónico a las dos de la mañana...'
    },
    scripts: {
      pt: [
        'Opção 1:\n"Era terça-feira, o relógio marcava duas da manhã. O e-mail dizia apenas duas palavras: "Infelizmente, não". Ali eu percebi que..."',
        'Opção 2:\n"O melhor conselho que eu já recebi foi na verdade uma crítica destruidora do meu chefe anterior..."',
        'Opção 3:\n"Eu fui demitido e isso foi a melhor coisa que já aconteceu com a minha carreira..."'
      ],
      en: [
        'Option 1:\n"It was Tuesday, 2 AM. The email read just two words: "Unfortunately, no." That was the moment I realized that..."',
        'Option 2:\n"The best advice I ever received was actually a devastating piece of criticism from my former manager..."',
        'Option 3:\n"I got fired and it was honestly the absolute best thing that ever happened to my career..."'
      ],
      es: [
        'Opción 1:\n"Era martes, las dos de la mañana. El correo decía solo dos palabras: "Lamentablemente, no". En ese momento me di cuenta de que..."',
        'Opción 2:\n"El mejor consejo que recibí fue en realidad una crítica destructiva de mi jefe anterior..."',
        'Opción 3:\n"Me despidieron y eso fue honestamente lo mejor que le ha pasado a mi carrera profesional..."'
      ]
    },
    reflection: {
      pt: 'Qual foi a demissão ou crítica que na verdade te libertou?',
      en: 'What was the single rejection or criticism that ultimately set you free?',
      es: '¿Cuál fue el rechazo o crítica que en última instancia te liberó?'
    },
    downloads: [],
    externalLinks: []
  },
  {
    id: 'story_day_4',
    chapterId: 'ch_story_maestria',
    journeyId: 'storytelling_impacto',
    dayNumber: 4,
    title: {
      pt: 'Estruturas de Ganchos de Tensão',
      en: 'Tension Hook Formulas',
      es: 'Fórmulas de Ganchos de Tensión'
    },
    type: DayType.Presence,
    weekday: 'Day 4',
    theme: { pt: 'Maestria', en: 'Mastery', es: 'Maestría' },
    audioUrl: 'https://actions.google.com/sounds/v1/ambiences/morning_birds.ogg',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    videoType: 'native',
    mission: {
      pt: 'Grave um vídeo abrindo um loop de curiosidade no início e só feche o loop nos últimos 10 segundos do vídeo.',
      en: 'Record a video opening a curiosity loop at the very start and do not close it until the last 10 seconds of the clip.',
      es: 'Graba un video abriendo un bucle de curiosidad al principio y no lo cierres hasta los últimos 10 segundos.'
    },
    hook: {
      pt: 'Eu cometi um erro absurdo na semana passada e ele me custou exatamente R$ 4.200...',
      en: 'I made a massive mistake last week and it cost me exactly $4,200...',
      es: 'Cometí un error masivo la semana pasada y me costó exactamente $4,200...'
    },
    scripts: {
      pt: [
        'Opção 1:\n"Vou te contar como eu queimei R$ 4.200 em anúncios errados, mas antes de te dizer o que eu mudei para recuperar isso, você precisa entender..."',
        'Opção 2:\n"A mentira que te contam sobre produzir conteúdo na internet. Na verdade, a grande engrenagem secreta é..."',
        'Opção 3:\n"Eu parei de seguir todos os meus concorrentes por um único motivo..."'
      ],
      en: [
        'Option 1:\n"I am going to share how I burned $4,200 on bad ads, but before I tell you the single tweak that fixed it, you must understand..."',
        'Option 2:\n"The biggest lie they feed you about making content online. In reality, the hidden secret engine is..."',
        'Option 3:\n"I unfollowed all of my competitors last month for one specific reason..."'
      ],
      es: [
        'Opción 1:\n"Te voy a contar cómo quemé $4,200 en anuncios malos, pero antes de decirte el único cambio que lo solucionó, debes entender..."',
        'Opción 2:\n"La mentira más grande que te venden sobre crear contenido en internet. En realidad, el motor secreto es..."',
        'Opción 3:\n"Dejé de seguir a todos mis competidores el mes pasado por una razón específica..."'
      ]
    },
    reflection: {
      pt: 'Quais narrativas prendem a sua atenção quando você navega pelas redes?',
      en: 'What specific stories capture your attention immediately when you scroll?',
      es: '¿Qué historias específicas capturan tu atención de inmediato cuando navegas?'
    },
    downloads: [],
    externalLinks: []
  },
  {
    id: 'story_day_5',
    chapterId: 'ch_story_maestria',
    journeyId: 'storytelling_impacto',
    dayNumber: 5,
    title: {
      pt: 'Transição Perfeita para Oferta',
      en: 'Seamless Transition to Offer',
      es: 'Transición Perfecta a la Oferta'
    },
    type: DayType.Reflection,
    weekday: 'Day 5',
    theme: { pt: 'Lançamento', en: 'Launch', es: 'Lanzamiento' },
    audioUrl: 'https://actions.google.com/sounds/v1/ambiences/morning_birds.ogg',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    videoType: 'native',
    mission: {
      pt: 'Crie uma ponte lógica perfeita entre uma lição aprendida em sua jornada e o convite para um produto ou mentoria.',
      en: 'Build a perfect logical bridge between a lesson from your journey and an invitation to buy a product or book a session.',
      es: 'Construye un puente lógico perfecto entre una lección de tu viaje y una invitación a comprar un producto o reservar.'
    },
    hook: {
      pt: 'Depois de errar muito, eu criei o método exato que eu gostaria de ter comprado...',
      en: 'After making every mistake in the book, I crafted the exact blueprint I wish I had bought...',
      es: 'Después de cometer todos los errores posibles, creé el método exacto que desearía haber comprado...'
    },
    scripts: {
      pt: [
        'Opção 1:\n"Eu bati a cabeça por 4 anos. Hoje, o meu método resolve essa dor em 30 dias. E se você quiser dar esse passo comigo com suporte pessoal, as vagas para..."',
        'Opção 2:\n"Você tem duas escolhas: continuar errando sozinho pelos próximos meses, ou comprar meu atalho estruturado..."',
        'Opção 3:\n"Aqui está como garantir um acesso exclusivo ao meu ecossistema VIP..."'
      ],
      en: [
        'Option 1:\n"I struggled alone for 4 years. Today, my method solves this pain in 30 days. If you want to take this step with my personal guidance, spots for..."',
        'Option 2:\n"You have two paths: keep failing on your own for the next 12 months, or buy my tested, structured shortcut today..."',
        'Option 3:\n"Here is exactly how to secure an exclusive invite to my VIP ecosystem..."'
      ],
      es: [
        'Opción 1:\n"Batallé sola por 4 años. Hoy, mi método resuelve este dolor en 30 días. Si quieres dar este paso con mi guía personal, los cupos para..."',
        'Opción 2:\n"Tienes dos caminos: seguir fallando por tu cuenta los próximos 12 meses, o comprar mi atajo estructurado hoy mismo..."',
        'Opción 3:\n"Aquí está exactamente cómo asegurar una invitación exclusiva a mi ecosistema VIP..."'
      ]
    },
    reflection: {
      pt: 'Qual é o valor real da transformação que você oferece?',
      en: 'What is the true life value of the transformation you deliver?',
      es: '¿Cuál es el valor real de la transformación que ofreces?'
    },
    downloads: [],
    externalLinks: []
  }
];

export const VOCAL_DAYS: Day[] = [
  {
    id: 'vocal_day_1',
    chapterId: 'ch_calibracao_vocal',
    journeyId: 'gravacao_postura_voz',
    dayNumber: 1,
    title: {
      pt: 'Regulação do Nervo Vago e Presença',
      en: 'Vagus Nerve Regulation & Presence',
      es: 'Regulación del Nervio Vago y Presencia'
    },
    type: DayType.Presence,
    weekday: 'Day 1',
    theme: { pt: 'Soma', en: 'Somatic', es: 'Soma' },
    audioUrl: 'https://actions.google.com/sounds/v1/ambiences/morning_birds.ogg',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    videoType: 'native',
    mission: {
      pt: 'Pratique a respiração em caixa por 2 minutos (inspira 4s, segura 4s, expira 4s, segura 4s) antes de gravar.',
      en: 'Practice box breathing for 2 full minutes (inhale 4s, hold 4s, exhale 4s, hold 4s) right before you hit record.',
      es: 'Practica la respiración en caja por 2 minutos (inhala 4s, retén 4s, exhala 4s, retén 4s) antes de grabar.'
    },
    hook: {
      pt: 'O seu nervosismo na câmera não é falta de talento, é apenas falta de oxigênio...',
      en: 'Your camera anxiety is not a lack of talent, it is simply a lack of oxygen...',
      es: 'Tu nerviosismo en cámara no es falta de talento, es simplemente falta de oxígeno...'
    },
    scripts: {
      pt: [
        'Opção 1:\n"Quando seu batimento acelera e você trava, seu cérebro acha que você está em perigo físico. Para reverter isso em 10 segundos, faça..."',
        'Opção 2:\n"Uma técnica simples usada por forças especiais para manter a calma absoluta sob pressão extrema..."',
        'Opção 3:\n"Seu corpo fala antes de você dizer a primeira palavra. Veja como regular sua postura..."'
      ],
      en: [
        'Option 1:\n"When your heart races and you freeze, your brain thinks you are in physical danger. To reverse this in 10 seconds, do this..."',
        'Option 2:\n"A simple technique used by special forces to maintain absolute calm under extreme pressure..."',
        'Option 3:\n"Your body speaks way before you say your first word. Here is how to regulate your posture..."'
      ],
      es: [
        'Opción 1:\n"Cuando tu corazón se acelera y te congelas, tu cerebro piensa que estás en peligro físico. Para revertir esto en 10 segundos, haz esto..."',
        'Opción 2:\n"Una técnica simple utilizada por fuerzas especiales para mantener la calma absoluta bajo presión extrema..."',
        'Opción 3:\n"Tu cuerpo habla mucho antes de que digas tu primera palabra. Aquí está cómo regular tu postura..."'
      ]
    },
    reflection: {
      pt: 'Como seu corpo responde fisicamente ao medo de falar?',
      en: 'How does your body physically respond to the fear of speaking?',
      es: '¿Cómo responde tu cuerpo físicamente al miedo a hablar?'
    },
    downloads: [],
    externalLinks: []
  },
  {
    id: 'vocal_day_2',
    chapterId: 'ch_calibracao_vocal',
    journeyId: 'gravacao_postura_voz',
    dayNumber: 2,
    title: {
      pt: 'O Aquecimento Vocal de 3 Minutos',
      en: 'The 3-Minute Vocal Warmup',
      es: 'El Calentamiento Vocal de 3 Minutos'
    },
    type: DayType.Truth,
    weekday: 'Day 2',
    theme: { pt: 'Voz', en: 'Voice', es: 'Voz' },
    audioUrl: 'https://actions.google.com/sounds/v1/ambiences/morning_birds.ogg',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    videoType: 'native',
    mission: {
      pt: 'Pratique vibração labial e de língua (hummm, brrr, trrr) subindo e descendo notas por 3 minutos completos.',
      en: 'Practice lip and tongue flutters (hummm, brrr, trrr) sliding up and down notes for 3 full minutes.',
      es: 'Practica la vibración de labios y lengua (hummm, brrr, trrr) subiendo y bajando notas por 3 minutos completos.'
    },
    hook: {
      pt: 'Se você acha que sua voz soa monótona e sem brilho nos vídeos, faça esse aquecimento de 3 minutos...',
      en: 'If you think your voice sounds flat and boring in videos, do this 3-minute warmup...',
      es: 'Si crees que tu voz suena plana y aburrida en los videos, haz este calentamiento de 3 minutos...'
    },
    scripts: {
      pt: [
        'Opção 1:\n"Uma voz monótona desliga o cérebro de quem assiste. Para trazer calor e autoridade para sua fala, nós precisamos aquecer..."',
        'Opção 2:\n"3 exercícios simples e rápidos que radialistas profissionais usam antes de entrar no ar..."',
        'Opção 3:\n"Como falar sem forçar a garganta, usando a projeção do tórax..."'
      ],
      en: [
        'Option 1:\n"A flat, monotone voice literally shuts off the listener\'s brain. To inject warmth and authority, we must wake up our muscles..."',
        'Option 2:\n"3 simple, quick exercises that professional radio hosts use right before going on air..."',
        'Option 3:\n"How to speak without straining your throat, utilizing chest resonance..."'
      ],
      es: [
        'Opción 1:\n"Una voz monótona literalmente apaga el cerebro del oyente. Para inyectar calidez y autoridad, debemos calentar nuestros músculos..."',
        'Opción 2:\n"3 ejercicios simples y rápidos que los locutores de radio profesionales usan antes de salir al aire..."',
        'Opción 3:\n"Cómo hablar sin forzar la garganta, utilizando la proyección del pecho..."'
      ]
    },
    reflection: {
      pt: 'Você gosta de ouvir a sua própria voz gravada? O que mudaria?',
      en: 'Do you enjoy listening to your own recorded voice? What would you tweak?',
      es: '¿Te gusta escuchar tu propia voz grabada? ¿Qué cambiarías?'
    },
    downloads: [],
    externalLinks: []
  },
  {
    id: 'vocal_day_3',
    chapterId: 'ch_calibracao_vocal',
    journeyId: 'gravacao_postura_voz',
    dayNumber: 3,
    title: {
      pt: 'O Olhar de Âncora e Linguagem Corporal',
      en: 'The Anchor Gaze & Body Language',
      es: 'La Mirada de Anclaje y Lenguaje Corporal'
    },
    type: DayType.Reflection,
    weekday: 'Day 3',
    theme: { pt: 'Presença', en: 'Presence', es: 'Presencia' },
    audioUrl: 'https://actions.google.com/sounds/v1/ambiences/morning_birds.ogg',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    videoType: 'native',
    mission: {
      pt: 'Grave um vídeo de 30 segundos sem piscar obsessivamente ou desviar o olhar da lente da câmera. Use as mãos para enfatizar.',
      en: 'Record a 30-second video keeping clean eye contact with the camera lens. Use hand gestures to emphasize points.',
      es: 'Graba un video de 30 segundos manteniendo un contacto visual limpio con la cámara. Usa gestos para enfatizar.'
    },
    hook: {
      pt: 'O pior erro de linguagem corporal na câmera é desviar o olhar toda vez que pensa...',
      en: 'The worst body language mistake on camera is looking away every time you pause to think...',
      es: 'El peor error de lenguaje corporal en cámara es desviar la mirada cada vez que te detienes a pensar...'
    },
    scripts: {
      pt: [
        'Opção 1:\n"Quando você desvia o olhar para cima ou para os lados ao formular uma frase, você passa insegurança subconsciente. O truque é..."',
        'Opção 2:\n"Como usar suas mãos para prender a atenção sem parecer um boneco inflável de posto..."',
        'Opção 3:\n"O olhar âncora: o segredo dos maiores oradores para dominar a tela..."'
      ],
      en: [
        'Option 1:\n"When you look up or sideways while thinking on screen, you broadcast subconscious insecurity. The hack is to..."',
        'Option 2:\n"How to use hand gestures to sustain attention without looking like an inflatable wind-dancer..."',
        'Option 3:\n"The anchor gaze: how elite communicators command attention through a simple lens focus..."'
      ],
      es: [
        'Opción 1:\n"Cuando miras hacia arriba o hacia los lados mientras piensas en pantalla, transmites inseguridad inconsciente. El truco es..."',
        'Opción 2:\n"Cómo usar gestos con las manos para mantener la atención sin parecer un muñeco de viento..."',
        'Opción 3:\n"La mirada de anclaje: cómo los comunicadores de élite dominan la pantalla enfocando la lente..."'
      ]
    },
    reflection: {
      pt: 'O que a sua linguagem corporal comunica quando você está desconfortável?',
      en: 'What does your body language express when you feel nervous or out of place?',
      es: '¿Qué expresa tu lenguaje corporal cuando te sientes nervioso o fuera de lugar?'
    },
    downloads: [],
    externalLinks: []
  }
];

// Combine all static days
export function loadAllDaysFromStorage(): Day[] {
  const stored = localStorage.getItem('renaser_modular_days');
  if (stored) {
    try { return JSON.parse(stored); } catch (e) { console.error(e); }
  }

  // If empty, generate seed days
  const originalMissionDays = generateInitialDays();
  const journey1Days = mapMissionDaysToDays(originalMissionDays);
  
  const allInitialDays = [...journey1Days, ...STORYTELLING_DAYS, ...VOCAL_DAYS];
  localStorage.setItem('renaser_modular_days', JSON.stringify(allInitialDays));
  return allInitialDays;
}

export function saveAllDaysToStorage(days: Day[]): void {
  localStorage.setItem('renaser_modular_days', JSON.stringify(days));
}

// Journeys LocalStorage Helpers
export function loadJourneysFromStorage(): Journey[] {
  const stored = localStorage.getItem('renaser_modular_journeys');
  if (stored) {
    try { return JSON.parse(stored); } catch (e) { console.error(e); }
  }
  localStorage.setItem('renaser_modular_journeys', JSON.stringify(INITIAL_JOURNEYS));
  return INITIAL_JOURNEYS;
}

export function saveJourneysToStorage(journeys: Journey[]): void {
  localStorage.setItem('renaser_modular_journeys', JSON.stringify(journeys));
}

// Chapters LocalStorage Helpers
export function loadChaptersFromStorage(): Chapter[] {
  const stored = localStorage.getItem('renaser_modular_chapters');
  if (stored) {
    try { return JSON.parse(stored); } catch (e) { console.error(e); }
  }
  localStorage.setItem('renaser_modular_chapters', JSON.stringify(INITIAL_CHAPTERS));
  return INITIAL_CHAPTERS;
}

export function saveChaptersToStorage(chapters: Chapter[]): void {
  localStorage.setItem('renaser_modular_chapters', JSON.stringify(chapters));
}
