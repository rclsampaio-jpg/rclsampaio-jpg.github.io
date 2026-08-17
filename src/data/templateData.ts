/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MissionDay, DayType, Language, UserProgress } from '../types';
import { getLocalDateISO } from '../utils/date';

// Maps a day number to its real-calendar weekday position (0=Monday..6=Sunday),
// anchored to journeyStartDate (the real date Day 1 was first opened). Falls
// back to the plain (dayNumber-1)%7 cycle when no start date is known yet.
function getWeekdayPosition(dayNumber: number, startDate?: string | null): number {
  if (startDate) {
    const start = new Date(`${startDate}T00:00:00`);
    if (!isNaN(start.getTime())) {
      const target = new Date(start);
      target.setDate(start.getDate() + (dayNumber - 1));
      const jsDay = target.getDay(); // 0=Sunday..6=Saturday
      return (jsDay + 6) % 7; // convert to 0=Monday..6=Sunday
    }
  }
  return (dayNumber - 1) % 7;
}

// Helper to determine DayType based on the real calendar weekday of a given
// journey day (anchored to startDate), so hooks/labels match the actual day
// of the week rather than an arbitrary Day-1-is-always-Monday cycle.
export function getDayType(dayNumber: number, startDate?: string | null): DayType {
  const position = getWeekdayPosition(dayNumber, startDate);
  switch (position) {
    case 0: return DayType.RestartIntention; // Monday
    case 1: return DayType.Truth;            // Tuesday
    case 2: return DayType.Rest;               // Wednesday (Rest Day)
    case 3: return DayType.ContrarianThinking; // Thursday
    case 4: return DayType.Storytelling;     // Friday
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
      pt: 'Storytelling (Sexta-feira)',
      en: 'Storytelling (Friday)',
      es: 'Storytelling (Viernes)'
    },
    [DayType.ContrarianThinking]: {
      pt: 'Pensamento Contrário (Quinta-feira)',
      en: 'Contrarian Thinking (Thursday)',
      es: 'Pensamiento Contrario (Jueves)'
    },
    [DayType.Rest]: {
      pt: 'Multiplicação de Presença',
      en: 'Presence Multiplication',
      es: 'Multiplicación de Presencia'
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
    pt: 'Multiplicando sua Presença',
    en: 'Multiplying Your Presence',
    es: 'Multiplicando tu Presencia'
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

// Action/transition hooks (how to open the camera and grab attention in the
// first second of a recording), these are a technique guide, not tied to any
// single day's theme, so they're always shown regardless of day-of-week.
const ACTION_HOOK_OPTIONS: Record<Language, string[]> = {
  pt: [
    'Colocar o capuz na cabeça bem no início do vídeo',
    '"Estragar" a maquiagem ou o delineado de propósito',
    'Deixar o óculos escuro escorregar enquanto você fala',
    'Pegar a bolsa como se fosse sair, mas parar pra falar',
    'Prender o cabelo enquanto começa a falar',
    'Enrolar uma mecha do cabelo enquanto fala com a câmera',
    'Começar o vídeo dentro do carro',
    'Segurar uma comida que você "tá quase" comendo, sem comer de fato',
    'Um tremidinho de câmera bem no início, como se tivesse acabado de apoiar o celular',
    'Passar um gloss enquanto fala',
    'Mexer num café gelado enquanto fala',
    'Usar green screen com um mood board estético atrás',
    'Maquiagem pela metade, com a esponjinha ainda na mão',
    'Passar perfume bem quando começa a falar',
    'Tirar a maquiagem e se olhar no espelho enquanto fala'
  ],
  en: [
    'Pulling a hoodie over your head as the video starts',
    'Ruining your makeup / eyeliner on purpose',
    'Dropping your sunglasses as you speak',
    "Grabbing your bag like you're about to leave, then pausing to talk",
    'Tying your hair up as you start talking',
    'Curling one side of your hair while talking to the camera',
    'Starting the video off in your car',
    "Holding something you're *about* to eat while talking, but not actually eating it",
    'Slight camera shake right when the video starts, as if you JUST set your phone down to film',
    'Applying lipgloss while talking',
    'Stirring an iced coffee while talking',
    'Using a green screen with an aesthetic visual collage',
    'Half-done makeup look with a beauty blender still in hand',
    'Applying perfume right as you start talking',
    'Wiping off your makeup and looking into a mirror as you talk'
  ],
  es: [
    'Ponerte la capucha justo cuando empieza el video',
    'Arruinar tu maquillaje / delineado a propósito',
    'Dejar caer tus lentes de sol mientras hablas',
    'Agarrar tu bolso como si fueras a salir, y pausar para hablar',
    'Recogerte el pelo mientras empiezas a hablar',
    'Enrular un mechón de pelo mientras le hablas a la cámara',
    'Empezar el video dentro del auto',
    'Sostener algo que estás "por" comer mientras hablas, sin comerlo realmente',
    'Un pequeño temblor de cámara justo al inicio, como si acabaras de apoyar el celular',
    'Aplicarte gloss mientras hablas',
    'Revolver un café helado mientras hablas',
    'Usar pantalla verde con un collage estético de fondo',
    'Maquillaje a medio hacer, con la esponjita todavía en la mano',
    'Ponerte perfume justo cuando empiezas a hablar',
    'Sacarte el maquillaje y mirarte al espejo mientras hablas'
  ]
};

export function getActionHookOptions(lang: Language): string[] {
  return ACTION_HOOK_OPTIONS[lang] || ACTION_HOOK_OPTIONS.pt;
}

// Weekly showcase of themed verbal hooks, grouped by day-of-week theme (DayType).
// Adapted for the Brazilian creator market (not a literal translation) —
// tone, references and slang adjusted to what performs on IG/TikTok BR today.
const HOOK_OPTIONS_BY_TYPE: Record<DayType, Record<Language, string[]>> = {
  [DayType.RestartIntention]: {
    pt: [
      'Queria que alguém tivesse me contado isso antes: ___',
      'Se eu tivesse que começar do zero hoje, eu ia ___',
      'Isso mudou tudo pra mim quando eu ___',
      'Quase não postei isso, mas ___',
      'Eu tava fazendo ___ errado esse tempo todo',
      'Eu achava que ___, até ___',
      'Era assim que eu tava há um tempo atrás',
      'Esse é o sinal que você tava esperando pra ___',
      'Para de rolar se você quer ___',
      'Antes de ___, vê isso',
      'Se você tá travada, vê isso',
      'A resposta pode te surpreender: ___',
      'E se eu te dissesse que ___?'
    ],
    en: [
      'I wish someone had told me this sooner: ___',
      "If I had to start from zero today, I'd ___",
      'This changed everything for me when I ___',
      "I almost didn't post this, but ___",
      "I've been doing ___ all wrong this whole time",
      'I used to think ___, until ___',
      'This was me a while ago',
      "This is the sign you've been waiting for to ___",
      'Stop scrolling if you want ___',
      'Before you ___, watch this',
      "If you're feeling stuck, watch this",
      'The answer might surprise you: ___',
      'What if I told you ___?'
    ],
    es: [
      'Ojalá alguien me hubiera dicho esto antes: ___',
      'Si tuviera que empezar de cero hoy, yo ___',
      'Esto cambió todo para mí cuando ___',
      'Casi no publico esto, pero ___',
      'Estuve haciendo ___ mal todo este tiempo',
      'Yo pensaba que ___, hasta que ___',
      'Así era yo hace un tiempo',
      'Esta es la señal que estabas esperando para ___',
      'Deja de scrollear si quieres ___',
      'Antes de ___, mira esto',
      'Si te sientes estancada, mira esto',
      'La respuesta puede sorprenderte: ___',
      '¿Y si te dijera que ___?'
    ]
  },
  [DayType.Truth]: {
    pt: [
      'Aqui ninguém é pessoa da manhã!!! Chega de só reclamar, bora fazer alguma coisa sobre isso',
      'Se você já é expert em maquiagem, pode rolar o vídeo, esse não é pra você',
      'Não repara na pilha de roupa jogada na cadeira, é esse o look que a gente vai usar',
      'Quem que fica bem de roxo mesmo? kkkk',
      'Talvez você não queira assistir esse vídeo se ___',
      'Isso só vai fazer sentido se você andou se sentindo travada ultimamente',
      'Faça o que fizer, não salva esse vídeo a não ser que você queira ___',
      'Se você não quer que sua vida fique mais fácil, pode pular esse',
      'Esse vídeo NÃO é pra você se ___',
      'Passa reto se você for ___ (tipo, uma garota nos seus 20 e poucos, viciada em reality show)',
      'Se você quer continuar ___ (travada, sem grana, etc), continua rolando',
      'NÃO VAI pra ___ a não ser que você realmente queira ser seguida de volta 24 horas',
      'Não julga meu ___, mas eu precisava contar'
    ],
    en: [
      "We are not morning people around here!!! Let's not even talk about it, let's just do something about it",
      "If you're already a makeup guru, scroll away this is not for you",
      "Do not look at the pile of clothes on my chair - this is the outfit we're going with",
      'Who even looks good in the color purple???',
      "You might not want to watch this if ___",
      "This will only make sense if you've been feeling stuck",
      "Whatever you do, don't save this unless you want ___",
      "If you don't want your life to get easier, skip this",
      "This is NOT for you if ___",
      "Scroll past this video unless you're ___ (a girl in her 20s, obsessed with reality TV)",
      'If you want to stay ___ (broke, stuck, etc) keep scrolling',
      "DON'T GO to ___ unless you literally want to be followed back 24/7",
      "Don't judge my ___ but I just had to tell you"
    ],
    es: [
      '¡¡¡Acá nadie es persona de la mañana!!! Dejemos de hablar y hagamos algo al respecto',
      'Si ya sos experta en maquillaje, seguí de largo, este no es para vos',
      'No mires la pila de ropa en mi silla, ese es el outfit que vamos a usar',
      '¿A quién le queda bien el color violeta? jaja',
      'Tal vez no quieras ver este video si ___',
      'Esto solo va a tener sentido si te has sentido estancada últimamente',
      'Hagas lo que hagas, no guardes esto a menos que quieras ___',
      'Si no querés que tu vida se te haga más fácil, saltá este video',
      'Este video NO es para vos si ___',
      'Pasá de largo si sos ___ (una chica en sus 20, obsesionada con los realities)',
      'Si querés seguir ___ (estancada, sin plata, etc) seguí scrolleando',
      'NO VAYAS a ___ a menos que realmente quieras que te sigan de vuelta 24/7',
      'No juzgues mi ___, pero tenía que contarlo'
    ]
  },
  [DayType.Storytelling]: {
    pt: [
      'Se eu pudesse sentar com uma versão mais nova de mim, eu diria ___',
      'Hoje eu tinha [idade] anos quando percebi...',
      'A parte de crescer que ninguém fala é ___',
      'Isso não é fácil de dizer, mas ___',
      'Deixa eu ser aquela vozinha na sua cabeça por um segundo e te contar ___',
      'Isso é uma coisa que eu só diria pra alguém que eu realmente me importo',
      'Se a gente fosse melhores amigas, eu diria bem na sua cara que ___',
      'Se a gente tivesse num grupo só nosso, eu mandaria ___',
      'Eu quase nunca compartilho coisas assim, mas ___',
      'Eu não sou de mostrar só a parte boa da minha vida aqui, então, sendo bem real com vocês, ___',
      'Eu queria compartilhar isso há um tempo porque eu tô tentando me abrir mais, mas ___',
      'Isso provavelmente vai fazer eu parecer fraca, mas ___',
      'Essa é uma parte da minha história que eu não costumo compartilhar, mas ___'
    ],
    en: [
      "If I could sit down with a younger version of you, I'd say ___",
      'I was today years old when I realized...',
      'The part of growing up that no one talks about is ___',
      "This isn't an easy thing to say but ___",
      'Let me be the little voice in your head for a second and tell you ___',
      "This is something I'd only say to someone I'd care about",
      "If we were best friends I'd tell you right to your face that ___",
      "If we were in a group chat together I'd send you ___",
      'I almost never share things like this but ___',
      "I'm not someone who wants to only show the good parts of my life on here so to be so real with you guys, ___",
      "I've been wanting to share this because I'm trying to get better at opening up but ___",
      'This is probably going to make me sound weak but ___',
      "This is a part of my story I don't usually share but ___"
    ],
    es: [
      'Si pudiera sentarme con una versión más joven de vos, te diría ___',
      'Hoy tuve [edad] años cuando me di cuenta de...',
      'La parte de crecer de la que nadie habla es ___',
      'Esto no es fácil de decir, pero ___',
      'Dejame ser esa vocecita en tu cabeza por un segundo y contarte ___',
      'Esto es algo que solo le diría a alguien que realmente me importa',
      'Si fuéramos mejores amigas, te diría en la cara que ___',
      'Si estuviéramos en un grupo juntas, te mandaría ___',
      'Casi nunca comparto cosas así, pero ___',
      'No soy de las que solo muestran la parte linda de mi vida acá, así que siendo bien real con ustedes, ___',
      'Hace tiempo quería compartir esto porque estoy tratando de abrirme más, pero ___',
      'Esto probablemente me haga sonar débil, pero ___',
      'Esta es una parte de mi historia que no suelo compartir, pero ___'
    ]
  },
  [DayType.ContrarianThinking]: {
    pt: [
      'A gente tá aposentando a ideia de que ___',
      'Quem foi que disse que ___ claramente não ___',
      'Pouca gente tá questionando ___',
      'A gente comprou a ideia de que ___, mas não é bem assim, então vamos ___',
      'A maior mentira que a gente normalizou é ___',
      'Podemos concordar em rejeitar a ideia de que ___?',
      'Tem uma coisa sobre ___ que não me cai bem',
      'O jeito que a gente pensa sobre ___ tá muito errado',
      'Levanta a mão se você tá começando a repensar ___',
      'Isso pode estragar ___ pra você, mas ___',
      'Acorda! A gente tá reescrevendo a regra que diz ___',
      'Você não tá cansada de ___?',
      'A gente não assina mais em baixo dessa ideia de que ___'
    ],
    en: [
      "We're retiring the idea that ___",
      "Whoever said ___ clearly wasn't ___",
      'Not enough people are questioning ___',
      "We've been sold the idea that ___ but it's not so, let's ___",
      "The biggest lie we've normalized is ___",
      'Can we agree to reject the idea that ___',
      "Something about ___ doesn't sit right with me",
      'The way we think about ___ is so off',
      "Raise your hand if you're starting to rethink ___",
      "This might ruin ___ for you but ___",
      "Wake up!! We're rewriting the rule that says ___",
      "Aren't you tired of ___",
      "We're no longer subscribing to the idea that ___"
    ],
    es: [
      'Estamos jubilando la idea de que ___',
      'Quien haya dicho que ___ claramente no ___',
      'Muy poca gente está cuestionando ___',
      'Nos vendieron la idea de que ___ pero no es así, así que ___',
      'La mentira más grande que normalizamos es ___',
      '¿Podemos ponernos de acuerdo en rechazar la idea de que ___?',
      'Hay algo sobre ___ que no me cierra',
      'La forma en que pensamos sobre ___ está muy mal',
      'Levantá la mano si estás empezando a repensar ___',
      'Esto puede arruinarte ___ pero ___',
      '¡Despertá! Estamos reescribiendo la regla que dice ___',
      '¿No estás cansada de ___?',
      'Ya no suscribimos a la idea de que ___'
    ]
  },
  [DayType.Rest]: {
    pt: [
      'Você tá deixando ___ mais difícil do que precisa',
      '3 coisas que você precisa saber antes de ___',
      'O passo a passo pra ___',
      'Faz isso em vez de ___',
      'O jeito mais fácil de ___ é ___',
      'O método que eu uso toda vez que ___',
      'O atalho que ninguém fala é ___',
      'O processo exato que eu sigo pra ___',
      'Rouba essa estratégia pra ___',
      'Salva esse post porque ___',
      'Se você tá travando em ___, tenta isso',
      'Esse um erro tá te custando ___',
      'O motivo de você não ver ___ é ___',
      'Deixa eu te mostrar o que realmente funciona pra ___'
    ],
    en: [
      "You're making ___ harder than it needs to be",
      '3 things you need to know before ___',
      "Here's a step-by-step way to ___",
      'Do this instead of ___',
      'The easiest way to ___ is ___',
      "Here's the framework I use every time I ___",
      "The shortcut nobody is talking about is ___",
      'The exact process I follow to ___',
      'Steal this strategy for ___',
      'Save this for later because ___',
      "If you're struggling with ___, try this",
      'This one mistake is costing you ___',
      "The reason you're not seeing ___ is ___",
      "Let me show you what's actually working for ___"
    ],
    es: [
      'Estás haciendo ___ más difícil de lo que necesita ser',
      '3 cosas que necesitas saber antes de ___',
      'El paso a paso para ___',
      'Haz esto en vez de ___',
      'La forma más fácil de ___ es ___',
      'El método que uso cada vez que ___',
      'El atajo del que nadie habla es ___',
      'El proceso exacto que sigo para ___',
      'Róbate esta estrategia para ___',
      'Guarda esto porque ___',
      'Si estás batallando con ___, prueba esto',
      'Este error te está costando ___',
      'La razón por la que no ves ___ es ___',
      'Déjame mostrarte lo que realmente funciona para ___'
    ]
  },
  [DayType.Presence]: {
    pt: [
      'Ninguém fala sobre ___, mas ___',
      'Isso que todo mundo erra sobre ___',
      'O maior mito sobre ___ é que ___',
      'Você não vai acreditar o que aconteceu quando eu ___',
      'Essa é a parte que ninguém te conta sobre ___',
      'Essa mudança simples em ___ fez toda diferença',
      'É por isso que seu ___ não tá ___',
      'Se isso soa com você: ___',
      'Levanta a mão se você já ___',
      'Eu sei exatamente como é quando ___',
      'Você não tá sozinha se ___',
      'A gente pode concordar que ___?',
      'Aqui vai o seu lembrete de que ___'
    ],
    en: [
      'Nobody talks about ___, but ___',
      "Here's what everyone gets wrong about ___",
      'The biggest myth about ___ is ___',
      "You won't believe what happened when I ___",
      "Here's the part nobody tells you about ___",
      'This simple shift in ___ made all the difference',
      "This is why your ___ isn't ___",
      'If this sounds like you: ___',
      "Raise your hand if you've ever ___",
      'I know exactly how this feels when ___',
      "You're not alone if ___",
      'Can we all agree that ___?',
      "Here's your reminder that ___"
    ],
    es: [
      'Nadie habla de ___, pero ___',
      'Esto es lo que todos entienden mal sobre ___',
      'El mito más grande sobre ___ es que ___',
      'No vas a creer lo que pasó cuando yo ___',
      'Esta es la parte que nadie te cuenta sobre ___',
      'Este pequeño cambio en ___ hizo toda la diferencia',
      'Por eso tu ___ no está ___',
      'Si esto te suena: ___',
      'Levanta la mano si alguna vez ___',
      'Sé exactamente cómo se siente cuando ___',
      'No estás sola si ___',
      '¿Podemos estar de acuerdo en que ___?',
      'Aquí tienes tu recordatorio de que ___'
    ]
  },
  [DayType.Reflection]: {
    pt: [
      'Se eu pudesse sentar com uma versão mais nova de mim, eu diria ___',
      'Hoje eu tinha [idade] anos quando percebi...',
      'A parte de crescer que ninguém fala é ___',
      'Deixa eu ser aquela vozinha na sua cabeça por um segundo e te contar ___',
      'Se a gente fosse melhores amigas, eu diria bem na sua cara que ___',
      'Eu quase nunca compartilho coisas assim, mas ___',
      'Eu não sou de mostrar só a parte boa da minha vida aqui, então, sendo bem real com vocês, ___',
      'Isso provavelmente vai fazer eu parecer fraca, mas ___',
      'Essa é uma parte da minha história que eu não costumo compartilhar, mas ___'
    ],
    en: [
      "If I could sit down with a younger version of you, I'd say ___",
      'I was today years old when I realized...',
      'The part of growing up that no one talks about is ___',
      'Let me be the little voice in your head for a second and tell you ___',
      "If we were best friends I'd tell you right to your face that ___",
      'I almost never share things like this but ___',
      "I'm not someone who wants to only show the good parts of my life on here so to be so real with you guys, ___",
      'This is probably going to make me sound weak but ___',
      "This is a part of my story I don't usually share but ___"
    ],
    es: [
      'Si pudiera sentarme con una versión más joven de vos, te diría ___',
      'Hoy tuve [edad] años cuando me di cuenta de...',
      'La parte de crecer de la que nadie habla es ___',
      'Dejame ser esa vocecita en tu cabeza por un segundo y contarte ___',
      'Si fuéramos mejores amigas, te diría en la cara que ___',
      'Casi nunca comparto cosas así, pero ___',
      'No soy de las que solo muestran la parte linda de mi vida acá, así que siendo bien real con ustedes, ___',
      'Esto probablemente me haga sonar débil, pero ___',
      'Esta es una parte de mi historia que no suelo compartir, pero ___'
    ]
  }
};

export function getHookOptionsForDay(dayNumber: number, lang: Language, startDate?: string | null): string[] {
  const type = getDayType(dayNumber, startDate);
  const set = HOOK_OPTIONS_BY_TYPE[type];
  return set[lang] && set[lang].length > 0 ? set[lang] : set.pt;
}

// Category name for the themed hook set of the day (matches HOOK_OPTIONS_BY_TYPE
// above), used to tell the user which kind of hook they're looking at today.
const HOOK_CATEGORY_LABEL: Record<DayType, Record<Language, string> | null> = {
  [DayType.RestartIntention]: { pt: 'Recomeço', en: 'Restart', es: 'Reinicio' },
  [DayType.Truth]: { pt: 'Verdade', en: 'Truth', es: 'Verdad' },
  [DayType.Storytelling]: { pt: 'Storytelling', en: 'Storytelling', es: 'Storytelling' },
  [DayType.ContrarianThinking]: { pt: 'Pensamento Contrário', en: 'Contrarian Thinking', es: 'Pensamiento Contrario' },
  [DayType.Rest]: { pt: 'Estratégia', en: 'Strategy', es: 'Estrategia' },
  [DayType.Presence]: { pt: 'Conexão', en: 'Connection', es: 'Conexión' },
  [DayType.Reflection]: { pt: 'Reflexão', en: 'Reflection', es: 'Reflexión' }
};

export function getHookCategoryLabel(dayNumber: number, lang: Language, startDate?: string | null): string | null {
  const type = getDayType(dayNumber, startDate);
  const labels = HOOK_CATEGORY_LABEL[type];
  if (!labels) return null;
  return labels[lang] || labels.pt;
}

// Real recorded daily audio, one file per day, added incrementally.
// Days not listed here fall back to the placeholder ambience sound below.
// Days 1-7 no longer play a daily audio (replaced by the support video,
// see DAILY_VIDEO_FILES below) — the 11 already-recorded audios were
// pushed forward 7 days so none of the recordings were discarded.
const DAILY_AUDIO_FILES: Record<number, string> = {
  8: '/assets/audio/dia-01.mp3',
  9: '/assets/audio/dia-02.mp3',
  10: '/assets/audio/dia-03.mp3',
  11: '/assets/audio/dia-04.mp3',
  12: '/assets/audio/dia-05.mp3',
  13: '/assets/audio/dia-06.mp3',
  14: '/assets/audio/dia-07.mp3',
  15: '/assets/audio/dia-08.mp3',
  16: '/assets/audio/dia-09.mp3',
  17: '/assets/audio/dia-10.mp3',
  18: '/assets/audio/dia-11.mp3'
};
const FALLBACK_AUDIO_URL = 'https://actions.google.com/sounds/v1/ambiences/morning_birds.ogg';

function getAudioUrlForDay(dayNumber: number): string {
  return DAILY_AUDIO_FILES[dayNumber] || FALLBACK_AUDIO_URL;
}

// Welcome-week support videos (Days 1-7 only). Renata records and posts
// these as unlisted YouTube videos, same pattern as the Library's
// "Encontros" videos. Placeholder links below until she records the real
// ones — swap the URL per day and the preview thumbnail updates itself.
const DAILY_VIDEO_FILES: Record<number, string> = {
  1: 'https://youtu.be/Tekm-ET1ezU',
  2: 'https://youtu.be/sZAzyeICwnM',
  3: 'https://youtu.be/L3UH4DKYh6Q',
  4: 'https://youtu.be/mr3Pgg1k0j0',
  5: 'https://youtu.be/Bxk-WYWt1xM',
  6: 'https://youtu.be/uKfIqr1QAuI',
  7: 'https://youtu.be/Fss9fy5p6P4'
};

function getVideoUrlForDay(dayNumber: number): string | undefined {
  return DAILY_VIDEO_FILES[dayNumber] || undefined;
}

// 30 distinct "Mensagem do Dia" motivational messages (one per day, no more
// repeating the same templated line with just the day number swapped in).
// Order below (index 0 = message #1, etc.) matches DAILY_MESSAGE_ORDER, which
// front-loads the "getting started" messages into the first 10 days.
const DAILY_MESSAGES: Record<Language, string[]> = {
  pt: [
    'O maior erro que você comete ao tentar gravar vídeos hoje é achar que precisa ser [perfeita/perfeito/perfeite]. Hoje, vamos quebrar isso.',
    'Ninguém se conecta com quem é perfeito. As pessoas se conectam com quem é real. Grava assim mesmo.',
    'Você não precisa estar [pronta/pronto/pronte] pra começar. Você só precisa começar pra ficar [pronta/pronto/pronte].',
    'A vergonha da câmera não vai embora esperando. Ela vai embora gravando.',
    'Quem te julga não paga suas contas. Grava o vídeo.',
    'O algoritmo não lembra dos vídeos "perfeitos" que você nunca postou.',
    'Sua voz trêmula no primeiro vídeo é só o preço de aparecer. Ninguém começa segura.',
    'Você não está atrasada. Você só ainda não começou a se mostrar de verdade.',
    'Ser vista dá medo porque importa. Isso é bom sinal, não motivo pra recuar.',
    'O vídeo que você não posta hoje não vai existir amanhã do jeito que era hoje.',
    'Parar de se esconder é o primeiro passo pra ser lembrada.',
    'Você não precisa ser a melhor. Você só precisa ser a que apareceu.',
    'Quem espera o momento perfeito pra gravar nunca grava.',
    'A confiança não vem antes da ação. Ela vem depois, como consequência.',
    'Cada vídeo que você grava com medo é uma prova de que você é mais forte que o medo.',
    'As pessoas não estão prestando tanta atenção em você quanto você imagina. Solta.',
    'Se você esperar se sentir [confiante/confiante/confiante] pra gravar, você nunca vai gravar.',
    'Sua imperfeição na câmera é o que faz as pessoas confiarem em você.',
    'O seu "eu não sei o que falar" também é conteúdo. Grava mesmo assim.',
    'Toda pessoa visível hoje também gravou um vídeo horrível ontem.',
    'Você não vai se sentir [pronta/pronto/pronte]. Você vai se sentir [pronta/pronto/pronte] depois de fazer.',
    'O seu maior obstáculo não é a câmera. É a voz na sua cabeça dizendo que você precisa ser perfeita.',
    'Publicar vale mais que polir. Poste.',
    'Você já disse "depois eu grava" ontem. Hoje é o depois.',
    'Ninguém vai te ver de verdade se você continuar se escondendo atrás da edição perfeita.',
    'Sua história maltrapilha vale mais que a história editada de outra pessoa.',
    'O medo de errar na frente da câmera é menor que o arrependimento de nunca ter tentado.',
    'Você não precisa de mais um curso. Você precisa apertar o botão de gravar.',
    'Toda vez que você aparece do jeito que é, você dá permissão pra outra pessoa fazer o mesmo.',
    'Hoje não é sobre ser vista perfeitamente. É sobre ser vista de verdade.'
  ],
  en: [
    "The biggest mistake you make trying to record videos today is thinking you need to be perfect. Today, we break that.",
    "Nobody connects with perfect. People connect with real. Record it anyway.",
    "You don't need to feel ready to start. You just need to start to feel ready.",
    "Camera shyness doesn't go away by waiting. It goes away by recording.",
    "The people who judge you don't pay your bills. Record the video.",
    'The algorithm doesn\'t remember the "perfect" videos you never posted.',
    "Your shaky voice in the first video is just the price of showing up. Nobody starts confident.",
    "You're not behind. You just haven't started truly showing up yet.",
    "Being seen feels scary because it matters. That's a good sign, not a reason to back off.",
    "The video you don't post today won't exist tomorrow the way it does right now.",
    "Stopping the hiding is the first step to being remembered.",
    "You don't need to be the best. You just need to be the one who showed up.",
    "Whoever waits for the perfect moment to record never records.",
    "Confidence doesn't come before action. It comes after, as a result.",
    "Every video you record afraid is proof you're stronger than the fear.",
    "People aren't paying nearly as much attention to you as you think. Let go.",
    "If you wait to feel confident to record, you'll never record.",
    "Your imperfection on camera is exactly what makes people trust you.",
    'Your "I don\'t know what to say" is content too. Record it anyway.',
    "Every visible person today also recorded a terrible video yesterday.",
    "You won't feel ready. You'll feel ready after doing it.",
    "Your biggest obstacle isn't the camera. It's the voice in your head telling you to be perfect.",
    "Posting beats polishing. Post it.",
    'You already said "I\'ll record it later" yesterday. Today is later.',
    "No one will truly see you if you keep hiding behind perfect editing.",
    "Your messy story is worth more than someone else's edited one.",
    "The fear of messing up on camera is smaller than the regret of never trying.",
    "You don't need another course. You need to press record.",
    "Every time you show up as you are, you give someone else permission to do the same.",
    "Today isn't about being seen perfectly. It's about being truly seen."
  ],
  es: [
    'El mayor error que cometes al intentar grabar videos hoy es pensar que necesitas ser [perfecta/perfecto/perfecte]. Hoy, vamos a romper eso.',
    'Nadie se conecta con la perfección. La gente se conecta con lo real. Grábalo de todos modos.',
    'No necesitas sentirte [lista/listo/liste] para empezar. Solo necesitas empezar para sentirte [lista/listo/liste].',
    'La vergüenza de la cámara no se va esperando. Se va grabando.',
    'Quien te juzga no paga tus cuentas. Graba el video.',
    'El algoritmo no recuerda los videos "perfectos" que nunca publicaste.',
    'Tu voz temblorosa en el primer video es solo el precio de aparecer. Nadie empieza segura.',
    'No estás atrasada. Solo todavía no empezaste a mostrarte de verdad.',
    'Que te vean da miedo porque importa. Es buena señal, no motivo para retroceder.',
    'El video que no publicas hoy no existirá mañana tal como es hoy.',
    'Dejar de esconderte es el primer paso para ser recordada.',
    'No necesitas ser la mejor. Solo necesitas ser la que apareció.',
    'Quien espera el momento perfecto para grabar nunca graba.',
    'La confianza no llega antes de la acción. Llega después, como consecuencia.',
    'Cada video que grabas con miedo es prueba de que eres más fuerte que el miedo.',
    'La gente no te presta tanta atención como imaginas. Suéltalo.',
    'Si esperas sentirte [segura/seguro/segure] para grabar, nunca vas a grabar.',
    'Tu imperfección frente a la cámara es lo que hace que la gente confíe en ti.',
    'Tu "no sé qué decir" también es contenido. Grábalo igual.',
    'Toda persona visible hoy también grabó un video horrible ayer.',
    'No te vas a sentir [lista/listo/liste]. Te vas a sentir [lista/listo/liste] después de hacerlo.',
    'Tu mayor obstáculo no es la cámara. Es la voz en tu cabeza que dice que debes ser perfecta.',
    'Publicar vale más que pulir. Publica.',
    'Ayer ya dijiste "luego lo grabo". Hoy es ese luego.',
    'Nadie te va a ver de verdad si sigues escondiéndote detrás de la edición perfecta.',
    'Tu historia imperfecta vale más que la historia editada de otra persona.',
    'El miedo a equivocarte frente a la cámara es menor que el arrepentimiento de nunca haberlo intentado.',
    'No necesitas otro curso. Necesitas apretar el botón de grabar.',
    'Cada vez que apareces tal como eres, le das permiso a otra persona para hacer lo mismo.',
    'Hoy no se trata de que te vean perfecta. Se trata de que te vean de verdad.'
  ]
};

// Provocative "remember who you are" messages, mixed into the pool below —
// more Purple-Cow / contrarian in tone than the getting-started set above.
const PROVOCATIVE_MESSAGES: Record<Language, string[]> = {
  pt: [
    'O Efeito Vaca Roxa: o mundo não lembra do que é comum. Ele lembra do que fez as pessoas pararem, olharem e pensarem.',
    'Às vezes, a maior oportunidade está escondida dentro da ideia que todo mundo tem medo de tentar.',
    'Os maiores avanços raramente vêm de seguir a manada. Vêm da coragem de construir algo que a manada ainda não entende.',
    'Ninguém lembra do vídeo igual a todos os outros. Lembre-se de quem você é e grave o que só você diria.',
    'O comum passa despercebido. O verdadeiro para o feed.',
    'Se todo mundo concorda com o que você postou, você provavelmente não disse nada de novo.',
    'A ideia que te dá mais medo de postar é, quase sempre, a que mais precisa ser vista.',
    'Parar de ser esquecível começa no momento em que você para de se esconder atrás do que todo mundo já fez.'
  ],
  en: [
    "The Purple Cow Effect: the world doesn't remember what's ordinary. It remembers what made people stop, look, and think.",
    'Sometimes, the greatest opportunity is hiding inside the idea everyone else is afraid to try.',
    "The biggest breakthroughs rarely come from following the crowd. They come from the courage to build something the crowd doesn't understand yet.",
    "No one remembers the video that looked like everyone else's. Remember who you are and record what only you would say.",
    'The ordinary goes unnoticed. The real one makes the feed.',
    "If everyone agrees with what you posted, you probably didn't say anything new.",
    'The idea that scares you most to post is almost always the one that most needs to be seen.',
    'You stop being forgettable the moment you stop hiding behind what everyone else already did.'
  ],
  es: [
    'El Efecto Vaca Púrpura: el mundo no recuerda lo ordinario. Recuerda lo que hizo que la gente se detuviera, mirara y pensara.',
    'A veces, la mayor oportunidad está escondida dentro de la idea que todos los demás temen intentar.',
    'Los mayores avances rara vez vienen de seguir a la multitud. Vienen del coraje de construir algo que la multitud todavía no entiende.',
    'Nadie recuerda el video igual a todos los demás. Recuerda quién eres y graba lo que solo tú dirías.',
    'Lo ordinario pasa desapercibido. Lo real llega al feed.',
    'Si todos están de acuerdo con lo que publicaste, probablemente no dijiste nada nuevo.',
    'La idea que más miedo te da publicar es, casi siempre, la que más necesita ser vista.',
    'Dejas de ser olvidable en el momento en que dejas de esconderte detrás de lo que todos los demás ya hicieron.'
  ]
};

// Assigns each message (1-indexed into DAILY_MESSAGES + PROVOCATIVE_MESSAGES
// concatenated, so 1-30 = getting-started/general pool, 31-38 = provocative
// pool) to a journey day, in a shuffled (non-sequential) order, with the
// "getting started" messages (1, 3, 4, 7, 8, 13, 17, 21, 24, 28) front-loaded
// into the first 10 days, and the provocative set woven into days 11-30.
const DAILY_MESSAGE_ORDER: number[] = [
  1, 13, 4, 21, 8, 17, 3, 24, 28, 7,
  9, 31, 2, 27, 32, 19, 5, 33, 14, 6,
  34, 12, 16, 35, 10, 36, 18, 37, 26, 38
];

function getDailyMessage(dayNumber: number, lang: Language): string {
  const messageNumber = DAILY_MESSAGE_ORDER[(dayNumber - 1) % DAILY_MESSAGE_ORDER.length];
  const messages = [...(DAILY_MESSAGES[lang] || DAILY_MESSAGES.pt), ...(PROVOCATIVE_MESSAGES[lang] || PROVOCATIVE_MESSAGES.pt)];
  return messages[messageNumber - 1];
}

// Step 3 "daily exposure action" plan. Same weekly combo grid runs all 30
// days, no special-cased Week 1, rotating through a fixed set of formats
// (never a single repeated format), keyed by the real calendar weekday
// (DayType), with Wednesday alternating
// between two combos depending on which week of the journey it falls in.
interface DailyPlan {
  title: string;
  bullets: string[];
  promises: [{ label: string; desc: string }, { label: string; desc: string }, { label: string; desc: string }];
}

const DAILY_PLAN_COPY: Record<Language, {
  monday: DailyPlan;
  tuesday: DailyPlan;
  wednesdayOdd: DailyPlan;
  wednesdayEven: DailyPlan;
  thursday: DailyPlan;
  friday: DailyPlan;
  saturday: DailyPlan;
  sunday: DailyPlan;
}> = {
  pt: {
    monday: {
      title: 'Segunda: 2 Reels + 1 vídeo de 7 segundos (mínimo 3 posts hoje)',
      bullets: [
        'Grave e poste um Reels de até 30 segundos (prompt 4 a 7 da Renata OS se precisar de roteiro)',
        'Grave e poste um Reels de até 90 segundos (prompt 4 a 7 da Renata OS se precisar de roteiro)',
        'Grave e poste 1 vídeo de 7 segundos, com b-roll e gancho forte na legenda (prompt 1 a 3 da Renata OS se precisar de ideia)'
      ],
      promises: [
        { label: 'Postei o Reels de até 30 segundos', desc: 'Prompt 4 a 7 se precisar de roteiro, um dos hooks disponíveis pra hoje' },
        { label: 'Postei o Reels de até 90 segundos', desc: 'Prompt 4 a 7 se precisar de roteiro. Pode usar Trial Reels se já tiver 200+ seguidores' },
        { label: 'Postei o vídeo de 7 segundos', desc: 'Prompt 1 a 3 se precisar de ideia. B-roll + legenda com gancho forte' }
      ]
    },
    tuesday: {
      title: 'Terça: dia de produção em lote na Renata OS',
      bullets: [
        'Separe um tempo pra usar a Renata OS em bulk e gerar ideias/roteiros pros próximos dias',
        'Se já tiver algo gravado e pronto, pode postar também, sem obrigação'
      ],
      promises: [
        { label: 'Usei a Renata OS pra gerar conteúdo em lote', desc: 'Pelo menos alguns roteiros/ideias pros próximos dias' },
        { label: 'Organizei o que vou gravar essa semana', desc: 'Anotei os temas, ganchos ou ideias que vieram' },
        { label: 'Se já tinha algo pronto, postei', desc: 'Sem cobrança, só se já tiver' }
      ]
    },
    wednesdayOdd: {
      title: 'Quarta: 3 vídeos de 7 segundos + sequência de Stories',
      bullets: [
        'Grave e poste 3 vídeos de 7 segundos (prompt 1 a 3 da Renata OS se precisar de ideia)',
        'Grave e poste uma sequência de Stories sobre o seu dia ou seu aprendizado recente (fórmula de Stories da Renata OS se precisar de roteiro)'
      ],
      promises: [
        { label: 'Postei os 3 vídeos de 7 segundos', desc: 'Prompt 1 a 3 se precisar de ideia, aproveitando o que já produziu em lote na terça' },
        { label: 'Postei a sequência de Stories', desc: 'Contando um pedaço real do seu processo' },
        { label: 'Escolhi o melhor gancho pros 3 vídeos', desc: 'Da vitrine de hooks da semana' }
      ]
    },
    wednesdayEven: {
      title: 'Quarta: Reels de até 60 segundos (rodízio dessa semana)',
      bullets: [
        'Use o prompt 4 a 7 da Renata OS pra roteirizar o Reels',
        'Grave e poste um Reels de até 60 segundos'
      ],
      promises: [
        { label: 'Roteirizei o Reels na Renata OS', desc: 'Prompt 4 a 7 (história ou educativo)' },
        { label: 'Escolhi o gancho antes de gravar', desc: 'Da vitrine de hooks da semana' },
        { label: 'Postei o Reels de até 60 segundos', desc: 'Usando o roteiro gerado' }
      ]
    },
    thursday: {
      title: 'Quinta: Carrossel + vídeo B-roll de 7 segundos',
      bullets: [
        'Monte e poste um Carrossel de venda ou educativo (prompt 8 da Renata OS se precisar de roteiro)',
        'Grave e poste 1 vídeo B-roll de 7 segundos, com gancho forte na legenda (prompt 1 a 3 da Renata OS se precisar de ideia)'
      ],
      promises: [
        { label: 'Postei o Carrossel', desc: 'Prompt 8 se precisar de roteiro. Capa com resultado real, um diferencial por slide' },
        { label: 'Postei o vídeo B-roll de 7 segundos', desc: 'Prompt 1 a 3 se precisar de ideia. Gancho forte direto na legenda' },
        { label: 'Escolhi o gancho de hoje', desc: 'Da vitrine de hooks da semana' }
      ]
    },
    friday: {
      title: 'Sexta: sequência de Stories que vende ou conecta (mínimo 5 slides)',
      bullets: [
        'Peça pra Renata OS montar os 5+ slides com a fórmula de Stories, já incluindo o convite final dentro da sequência, e use o prompt 10 pra ajustar o tom depois de escrito',
        'Grave os 5+ Stories',
        'Poste a sequência completa'
      ],
      promises: [
        { label: 'Roteirizei os 5+ Stories na Renata OS', desc: 'Fórmula de Stories + prompt 10 pra tirar cara de IA, convite já dentro da sequência' },
        { label: 'Gravei os 5+ Stories', desc: 'Sequência completa, sem parar no meio' },
        { label: 'Postei a sequência pra quem já te segue', desc: 'Mínimo 5 slides' }
      ]
    },
    saturday: {
      title: 'Sábado: sequência de Stories + vídeo B-roll de 7 segundos',
      bullets: [
        'Peça pra Renata OS montar a sequência com a fórmula de Stories, e use o prompt 10 pra ajustar o tom depois de escrito',
        'Poste a sequência de Stories (mínimo 5 slides)',
        'Grave e poste 1 vídeo B-roll de 7 segundos'
      ],
      promises: [
        { label: 'Roteirizei a sequência na Renata OS', desc: 'Fórmula de Stories + prompt 10, antes de gravar' },
        { label: 'Postei a sequência de Stories', desc: 'Mínimo 5 slides, vendendo ou conectando' },
        { label: 'Postei o vídeo B-roll de 7 segundos', desc: 'Gancho forte na legenda, prompt 1 a 3 se precisar de ideia' }
      ]
    },
    sunday: {
      title: 'Domingo: Carrossel + Reels de 30 segundos',
      bullets: [
        'Monte e poste um Carrossel de venda ou educativo (prompt 8 da Renata OS se precisar de roteiro)',
        'Grave e poste um Reels de até 30 segundos (prompt 4 a 7 da Renata OS se precisar de roteiro)'
      ],
      promises: [
        { label: 'Postei o Carrossel', desc: 'Prompt 8 se precisar de roteiro. Capa com resultado real, um diferencial por slide' },
        { label: 'Postei o Reels de 30 segundos', desc: 'Prompt 4 a 7 se precisar de roteiro. Pode usar Trial Reels se já tiver 200+ seguidores' },
        { label: 'Escolhi o gancho de hoje', desc: 'Da vitrine de hooks da semana' }
      ]
    }
  },
  en: {
    monday: {
      title: 'Monday: 2 Reels + 1 seven-second video (minimum 3 posts today)',
      bullets: [
        'Record and post a Reels up to 30 seconds long (Renata OS prompt 4-7 if you need a script)',
        'Record and post a Reels up to 90 seconds long (Renata OS prompt 4-7 if you need a script)',
        'Record and post 1 seven-second video, with b-roll and a strong caption hook (Renata OS prompt 1-3 if you need an idea)'
      ],
      promises: [
        { label: 'Posted the up-to-30-second Reels', desc: "Prompt 4-7 if you need a script, one of today's available hooks" },
        { label: 'Posted the up-to-90-second Reels', desc: 'Prompt 4-7 if you need a script. Can use Trial Reels if you already have 200+ followers' },
        { label: 'Posted the seven-second video', desc: 'Prompt 1-3 if you need an idea. B-roll + strong caption hook' }
      ]
    },
    tuesday: {
      title: 'Tuesday: bulk production day with Renata OS',
      bullets: [
        'Set aside time to use Renata OS in bulk and generate ideas/scripts for the coming days',
        "If you already have something recorded and ready, you can post it too, no obligation"
      ],
      promises: [
        { label: 'Used Renata OS to generate content in bulk', desc: 'At least a few scripts/ideas for the coming days' },
        { label: "Organized what I'll record this week", desc: 'Noted the themes, hooks or ideas that came up' },
        { label: 'Posted if I already had something ready', desc: 'No pressure, only if ready' }
      ]
    },
    wednesdayOdd: {
      title: 'Wednesday: 3 seven-second videos + a Stories sequence',
      bullets: [
        'Record and post 3 seven-second videos (Renata OS prompt 1-3 if you need an idea)',
        'Record and post a Stories sequence about your day or a recent takeaway (Renata OS Stories formula if you need a script)'
      ],
      promises: [
        { label: 'Posted the 3 seven-second videos', desc: "Prompt 1-3 if you need an idea, building on what you batch-produced on Tuesday" },
        { label: 'Posted the Stories sequence', desc: 'Telling a real piece of your process' },
        { label: 'Picked the best hook for the 3 videos', desc: "From this week's hook showcase" }
      ]
    },
    wednesdayEven: {
      title: "Wednesday: up-to-60-second Reels (this week's rotation)",
      bullets: [
        'Use Renata OS prompt 4-7 to script the Reels',
        'Record and post a Reels up to 60 seconds long'
      ],
      promises: [
        { label: 'Scripted the Reels on Renata OS', desc: 'Prompt 4-7 (story or educational)' },
        { label: 'Picked the hook before recording', desc: "From this week's hook showcase" },
        { label: 'Posted the up-to-60-second Reels', desc: 'Using the generated script' }
      ]
    },
    thursday: {
      title: 'Thursday: Carousel + seven-second b-roll video',
      bullets: [
        'Build and post a sales or educational Carousel (Renata OS prompt 8 if you need a script)',
        'Record and post 1 seven-second b-roll video, with a strong caption hook (Renata OS prompt 1-3 if you need an idea)'
      ],
      promises: [
        { label: 'Posted the Carousel', desc: 'Prompt 8 if you need a script. Cover with a real result, one differentiator per slide' },
        { label: 'Posted the seven-second b-roll video', desc: 'Prompt 1-3 if you need an idea. Strong hook straight in the caption' },
        { label: "Picked today's hook", desc: "From this week's hook showcase" }
      ]
    },
    friday: {
      title: 'Friday: a selling or connecting Stories sequence (minimum 5 slides)',
      bullets: [
        'Ask Renata OS to build the 5+ slides using the Stories formula, with the closing invite already built into the sequence, then use prompt 10 to adjust the tone once it is written',
        'Record the 5+ Stories',
        'Post the full sequence'
      ],
      promises: [
        { label: 'Scripted the 5+ Stories on Renata OS', desc: 'Stories formula + prompt 10 to strip the AI voice, invite already inside the sequence' },
        { label: 'Recorded the 5+ Stories', desc: 'Full sequence, without stopping halfway' },
        { label: 'Posted the sequence for whoever already follows you', desc: 'Minimum 5 slides' }
      ]
    },
    saturday: {
      title: 'Saturday: Stories sequence + seven-second b-roll video',
      bullets: [
        'Ask Renata OS to build the sequence using the Stories formula, then use prompt 10 to adjust the tone once it is written',
        'Post the Stories sequence (minimum 5 slides)',
        'Record and post 1 seven-second b-roll video'
      ],
      promises: [
        { label: 'Scripted the sequence on Renata OS', desc: 'Stories formula + prompt 10, before recording' },
        { label: 'Posted the Stories sequence', desc: 'Minimum 5 slides, selling or connecting' },
        { label: 'Posted the seven-second b-roll video', desc: 'Strong hook in the caption, prompt 1-3 if you need an idea' }
      ]
    },
    sunday: {
      title: 'Sunday: Carousel + 30-second Reels',
      bullets: [
        'Build and post a sales or educational Carousel (Renata OS prompt 8 if you need a script)',
        'Record and post a Reels up to 30 seconds long (Renata OS prompt 4-7 if you need a script)'
      ],
      promises: [
        { label: 'Posted the Carousel', desc: 'Prompt 8 if you need a script. Cover with a real result, one differentiator per slide' },
        { label: 'Posted the 30-second Reels', desc: 'Prompt 4-7 if you need a script. Can use Trial Reels if you already have 200+ followers' },
        { label: "Picked today's hook", desc: "From this week's hook showcase" }
      ]
    }
  },
  es: {
    monday: {
      title: 'Lunes: 2 Reels + 1 video de 7 segundos (mínimo 3 publicaciones hoy)',
      bullets: [
        'Graba y publica un Reels de hasta 30 segundos (prompt 4 a 7 de la Renata OS si necesitas guión)',
        'Graba y publica un Reels de hasta 90 segundos (prompt 4 a 7 de la Renata OS si necesitas guión)',
        'Graba y publica 1 video de 7 segundos, con b-roll y un gancho fuerte en la descripción (prompt 1 a 3 de la Renata OS si necesitas una idea)'
      ],
      promises: [
        { label: 'Publiqué el Reels de hasta 30 segundos', desc: 'Prompt 4 a 7 si necesitas guión, uno de los ganchos disponibles para hoy' },
        { label: 'Publiqué el Reels de hasta 90 segundos', desc: 'Prompt 4 a 7 si necesitas guión. Puedes usar Trial Reels si ya tienes 200+ seguidores' },
        { label: 'Publiqué el video de 7 segundos', desc: 'Prompt 1 a 3 si necesitas una idea. B-roll + gancho fuerte en la descripción' }
      ]
    },
    tuesday: {
      title: 'Martes: día de producción en lote con la Renata OS',
      bullets: [
        'Dedica un tiempo a usar la Renata OS en bulk y generar ideas/guiones para los próximos días',
        'Si ya tienes algo grabado y listo, también puedes publicarlo, sin obligación'
      ],
      promises: [
        { label: 'Usé la Renata OS para generar contenido en lote', desc: 'Al menos algunos guiones/ideas para los próximos días' },
        { label: 'Organicé lo que voy a grabar esta semana', desc: 'Anoté los temas, ganchos o ideas que surgieron' },
        { label: 'Si ya tenía algo listo, lo publiqué', desc: 'Sin presión, solo si ya está listo' }
      ]
    },
    wednesdayOdd: {
      title: 'Miércoles: 3 videos de 7 segundos + secuencia de Stories',
      bullets: [
        'Graba y publica 3 videos de 7 segundos (prompt 1 a 3 de la Renata OS si necesitas una idea)',
        'Graba y publica una secuencia de Stories sobre tu día o tu aprendizaje reciente (fórmula de Stories de la Renata OS si necesitas guión)'
      ],
      promises: [
        { label: 'Publiqué los 3 videos de 7 segundos', desc: 'Prompt 1 a 3 si necesitas una idea, aprovechando lo que ya produjiste en lote el martes' },
        { label: 'Publiqué la secuencia de Stories', desc: 'Contando un fragmento real de tu proceso' },
        { label: 'Elegí el mejor gancho para los 3 videos', desc: 'De la vitrina de ganchos de la semana' }
      ]
    },
    wednesdayEven: {
      title: 'Miércoles: Reels de hasta 60 segundos (rotación de esta semana)',
      bullets: [
        'Usa el prompt 4 a 7 de la Renata OS para escribir el guión del Reels',
        'Graba y publica un Reels de hasta 60 segundos'
      ],
      promises: [
        { label: 'Escribí el guión del Reels en la Renata OS', desc: 'Prompt 4 a 7 (historia o educativo)' },
        { label: 'Elegí el gancho antes de grabar', desc: 'De la vitrina de ganchos de la semana' },
        { label: 'Publiqué el Reels de hasta 60 segundos', desc: 'Usando el guión generado' }
      ]
    },
    thursday: {
      title: 'Jueves: Carrusel + video B-roll de 7 segundos',
      bullets: [
        'Arma y publica un Carrusel de venta o educativo (prompt 8 de la Renata OS si necesitas guión)',
        'Graba y publica 1 video B-roll de 7 segundos, con gancho fuerte en la descripción (prompt 1 a 3 de la Renata OS si necesitas una idea)'
      ],
      promises: [
        { label: 'Publiqué el Carrusel', desc: 'Prompt 8 si necesitas guión. Portada con resultado real, un diferencial por diapositiva' },
        { label: 'Publiqué el video B-roll de 7 segundos', desc: 'Prompt 1 a 3 si necesitas una idea. Gancho fuerte directo en la descripción' },
        { label: 'Elegí el gancho de hoy', desc: 'De la vitrina de ganchos de la semana' }
      ]
    },
    friday: {
      title: 'Viernes: secuencia de Stories que vende o conecta (mínimo 5 diapositivas)',
      bullets: [
        'Pídele a la Renata OS que arme las 5+ diapositivas con la fórmula de Stories, con la invitación final ya dentro de la secuencia, y usa el prompt 10 para ajustar el tono después de escrito',
        'Graba las 5+ Stories',
        'Publica la secuencia completa'
      ],
      promises: [
        { label: 'Escribí el guión de las 5+ Stories en la Renata OS', desc: 'Fórmula de Stories + prompt 10 para quitar cara de IA, invitación ya dentro de la secuencia' },
        { label: 'Grabé las 5+ Stories', desc: 'Secuencia completa, sin parar a la mitad' },
        { label: 'Publiqué la secuencia para quien ya te sigue', desc: 'Mínimo 5 diapositivas' }
      ]
    },
    saturday: {
      title: 'Sábado: secuencia de Stories + video B-roll de 7 segundos',
      bullets: [
        'Pídele a la Renata OS que arme la secuencia con la fórmula de Stories, y usa el prompt 10 para ajustar el tono después de escrito',
        'Publica la secuencia de Stories (mínimo 5 diapositivas)',
        'Graba y publica 1 video B-roll de 7 segundos'
      ],
      promises: [
        { label: 'Escribí el guión en la Renata OS', desc: 'Fórmula de Stories + prompt 10, antes de grabar' },
        { label: 'Publiqué la secuencia de Stories', desc: 'Mínimo 5 diapositivas, vendiendo o conectando' },
        { label: 'Publiqué el video B-roll de 7 segundos', desc: 'Gancho fuerte en la descripción, prompt 1 a 3 si necesitas una idea' }
      ]
    },
    sunday: {
      title: 'Domingo: Carrusel + Reels de 30 segundos',
      bullets: [
        'Arma y publica un Carrusel de venta o educativo (prompt 8 de la Renata OS si necesitas guión)',
        'Graba y publica un Reels de hasta 30 segundos (prompt 4 a 7 de la Renata OS si necesitas guión)'
      ],
      promises: [
        { label: 'Publiqué el Carrusel', desc: 'Prompt 8 si necesitas guión. Portada con resultado real, un diferencial por diapositiva' },
        { label: 'Publiqué el Reels de 30 segundos', desc: 'Prompt 4 a 7 si necesitas guión. Puedes usar Trial Reels si ya tienes 200+ seguidores' },
        { label: 'Elegí el gancho de hoy', desc: 'De la vitrina de ganchos de la semana' }
      ]
    }
  }
};

function getDailyPlan(dayNumber: number, lang: Language, startDate?: string | null): DailyPlan {
  const copy = DAILY_PLAN_COPY[lang] || DAILY_PLAN_COPY.pt;
  const type = getDayType(dayNumber, startDate);
  const weekNumber = Math.ceil(dayNumber / 7);
  const isEvenWeek = weekNumber % 2 === 0;

  switch (type) {
    case DayType.RestartIntention: return copy.monday;
    case DayType.Truth: return copy.tuesday;
    case DayType.Rest: return isEvenWeek ? copy.wednesdayEven : copy.wednesdayOdd;
    case DayType.ContrarianThinking: return copy.thursday;
    case DayType.Storytelling: return copy.friday;
    case DayType.Presence: return copy.saturday;
    case DayType.Reflection: return copy.sunday;
    default: return copy.monday;
  }
}

function formatExposureAction(plan: DailyPlan): string {
  return [plan.title, ...plan.bullets.map(b => `• ${b}`)].join('\n');
}

// Generate initial 30 days structure based on the rhythm, anchored to the
// real calendar date Day 1 was first opened (startDate) so the weekday theme
// (and its hooks) match the actual day of the week.
export function generateInitialDays(startDate?: string | null): MissionDay[] {
  const days: MissionDay[] = [];

  for (let i = 1; i <= 30; i++) {
    const type = getDayType(i, startDate);
    const titlePt = `${titlesByWeekDay[type].pt} (Dia ${i})`;
    const titleEn = `${titlesByWeekDay[type].en} (Day ${i})`;
    const titleEs = `${titlesByWeekDay[type].es} (Día ${i})`;
    const audioUrl = getAudioUrlForDay(i);
    const videoUrl = getVideoUrlForDay(i);

    const planPt = getDailyPlan(i, 'pt', startDate);
    const planEn = getDailyPlan(i, 'en', startDate);
    const planEs = getDailyPlan(i, 'es', startDate);

    days.push({
      dayNumber: i,
      type,
      title: { pt: titlePt, en: titleEn, es: titleEs },
      content: {
        pt: {
          audioUrl, // Real recording if available for this day, otherwise placeholder
          videoUrl,
          hook: getDailyMessage(i, 'pt'),
          scripts: [
            `Roteiro Opção 1 (Conexão Rápida):\n"Se você tem vergonha de gravar vídeos, deixa eu te contar um segredo... eu também tinha. Mas hoje eu decidi..."`,
            `Roteiro Opção 2 (Provocação):\n"Pare de tentar agradar a todo mundo nas redes sociais. A verdade é que quem te julga não paga seus boletos..."`,
            `Roteiro Opção 3 (Educativo):\n"3 coisas simples que me ajudaram a vencer a vergonha da câmera: 1. Falar com a lente como se fosse um amigo; 2..."`
          ],
          exposureAction: formatExposureAction(planPt),
          reflectionQuestion: 'Como você se sentiu hoje ao encarar a possibilidade de ser [vista/visto/viste] de verdade pelas pessoas?',
          promises: planPt.promises
        },
        en: {
          audioUrl,
          hook: getDailyMessage(i, 'en'),
          scripts: [
            `Script Option 1 (Quick Connection):\n"If you are afraid of recording videos, let me tell you a secret... I was too. But today I decided to..."`,
            `Script Option 2 (Provocation):\n"Stop trying to please everyone on social media. The truth is, those who judge you don't pay your bills..."`,
            `Script Option 3 (Educational):\n"3 simple things that helped me overcome camera shyness: 1. Talk to the lens as if it were a close friend; 2..."`
          ],
          exposureAction: formatExposureAction(planEn),
          reflectionQuestion: 'How did you feel today confronting the possibility of being truly seen by people?',
          promises: planEn.promises
        },
        es: {
          audioUrl,
          hook: getDailyMessage(i, 'es'),
          scripts: [
            `Guión Opción 1 (Conexión Rápida):\n"Si tienes vergüenza de grabar videos, déjame contarte un secreto... yo también la tenía. Pero hoy decidí..."`,
            `Guión Opción 2 (Provocación):\n"Deja de intentar agradar a todos en las redes sociales. La verdad es que quien te juzga no paga tus cuentas..."`,
            `Guión Opción 3 (Educativo):\n"3 cosas simples que me ayudaron a vencer la vergüenza de la cámara: 1. Hablarle a la lente como si fuera un amigo; 2..."`
          ],
          exposureAction: formatExposureAction(planEs),
          reflectionQuestion: '¿Cómo te sentiste hoy al enfrentar la posibilidad de ser [vista/visto/viste] realmente por la gente?',
          promises: planEs.promises
        }
      }
    });
  }
  
  return days;
}

// Bump this whenever generateInitialDays()'s template content changes, so
// browsers with an already-cached renaser_days regenerate instead of showing
// stale copy. NOTE: this also discards any day content hand-edited via
// Creator Studio (CMS), acceptable while content is still being tuned from
// code, but worth knowing once the CMS is used for real day-by-day editing.
const DAYS_CONTENT_VERSION = '24';

export function loadDaysFromStorage(startDate?: string | null): MissionDay[] {
  const stored = localStorage.getItem('renaser_days');
  const storedVersion = localStorage.getItem('renaser_days_version');
  if (stored && storedVersion === DAYS_CONTENT_VERSION) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing stored days, loading default', e);
    }
  }

  const initial = generateInitialDays(startDate);
  localStorage.setItem('renaser_days', JSON.stringify(initial));
  localStorage.setItem('renaser_days_version', DAYS_CONTENT_VERSION);
  return initial;
}

export function saveDaysToStorage(days: MissionDay[]): void {
  localStorage.setItem('renaser_days', JSON.stringify(days));
  localStorage.setItem('renaser_days_version', DAYS_CONTENT_VERSION);
}

function getTodayISO(): string {
  return getLocalDateISO();
}

export function loadUserProgressFromStorage(): UserProgress {
  const stored = localStorage.getItem('renaser_user_progress');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Backfill journeyStartDate for progress saved before this field existed,
      // so weekday theming has a real anchor date instead of falling back to
      // the old Day-1-is-always-Monday cycle.
      if (!parsed.journeyStartDate) {
        parsed.journeyStartDate = getTodayISO();
        localStorage.setItem('renaser_user_progress', JSON.stringify(parsed));
      }
      // Re-anchor journeyStartDate to today as long as nothing has actually
      // been completed yet. Without this, a stale start date captured days
      // ago (e.g. from before the UTC/local date fix, or from someone who
      // opened the link once and came back later without finishing Day 1)
      // permanently freezes the weekday theme shown for Day 1 to whatever
      // it was on that first visit, instead of matching the real day the
      // person is actually starting. Once a day is completed, this stops —
      // the weekly rhythm then proceeds normally from that real anchor.
      if ((parsed.completionHistory || []).length === 0 && parsed.journeyStartDate !== getTodayISO()) {
        parsed.journeyStartDate = getTodayISO();
        localStorage.setItem('renaser_user_progress', JSON.stringify(parsed));
        // The 30-day array is pre-generated once and cached, it won't
        // regenerate just because journeyStartDate changed, so it would
        // keep showing the stale weekday themes. Clear it so it rebuilds
        // from the corrected anchor on this same load.
        localStorage.removeItem('renaser_days');
        localStorage.removeItem('renaser_days_version');
      }
      if (parsed.displayName === undefined) {
        parsed.displayName = null;
        localStorage.setItem('renaser_user_progress', JSON.stringify(parsed));
      }
      return parsed;
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
    lastActiveDate: null,
    journeyStartDate: getTodayISO(),
    displayName: null
  };

  localStorage.setItem('renaser_user_progress', JSON.stringify(defaultProgress));
  return defaultProgress;
}

export function saveUserProgressToStorage(progress: UserProgress): void {
  try {
    localStorage.setItem('renaser_user_progress', JSON.stringify(progress));
  } catch (e) {
    console.error('Error saving user progress (storage quota likely exceeded)', e);
  }
}
