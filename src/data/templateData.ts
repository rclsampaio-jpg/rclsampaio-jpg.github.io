/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MissionDay, DayType, Language, UserProgress } from '../types';

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

// Action/transition hooks (how to open the camera and grab attention in the
// first second of a recording) — these are a technique guide, not tied to any
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
  [DayType.RestartIntention]: { pt: [], en: [], es: [] },
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
  [DayType.Rest]: { pt: [], en: [], es: [] },
  [DayType.Presence]: { pt: [], en: [], es: [] },
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
// Null for day types with no themed set (RestartIntention, Rest, Presence).
const HOOK_CATEGORY_LABEL: Record<DayType, Record<Language, string> | null> = {
  [DayType.RestartIntention]: null,
  [DayType.Truth]: { pt: 'Verdade', en: 'Truth', es: 'Verdad' },
  [DayType.Storytelling]: { pt: 'Storytelling', en: 'Storytelling', es: 'Storytelling' },
  [DayType.ContrarianThinking]: { pt: 'Pensamento Contrário', en: 'Contrarian Thinking', es: 'Pensamiento Contrario' },
  [DayType.Rest]: null,
  [DayType.Presence]: null,
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
const DAILY_AUDIO_FILES: Record<number, string> = {
  1: '/assets/audio/dia-01.mp3'
};
const FALLBACK_AUDIO_URL = 'https://actions.google.com/sounds/v1/ambiences/morning_birds.ogg';

function getAudioUrlForDay(dayNumber: number): string {
  return DAILY_AUDIO_FILES[dayNumber] || FALLBACK_AUDIO_URL;
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

// Assigns each of the 30 messages above (1-indexed) to a journey day, in a
// shuffled (non-sequential) order — with the "getting started" messages
// (1, 3, 4, 7, 8, 13, 17, 21, 24, 28) front-loaded into the first 10 days.
const DAILY_MESSAGE_ORDER: number[] = [
  1, 13, 4, 21, 8, 17, 3, 24, 28, 7,
  9, 22, 2, 27, 11, 19, 5, 29, 14, 6,
  25, 12, 16, 30, 10, 20, 18, 15, 26, 23
];

function getDailyMessage(dayNumber: number, lang: Language): string {
  const messageNumber = DAILY_MESSAGE_ORDER[(dayNumber - 1) % DAILY_MESSAGE_ORDER.length];
  const messages = DAILY_MESSAGES[lang] || DAILY_MESSAGES.pt;
  return messages[messageNumber - 1];
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

    days.push({
      dayNumber: i,
      type,
      title: { pt: titlePt, en: titleEn, es: titleEs },
      content: {
        pt: {
          audioUrl, // Real recording if available for this day, otherwise placeholder
          hook: getDailyMessage(i, 'pt'),
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
          hook: getDailyMessage(i, 'en'),
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
          hook: getDailyMessage(i, 'es'),
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
const DAYS_CONTENT_VERSION = '5';

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
  return new Date().toISOString().slice(0, 10);
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
  localStorage.setItem('renaser_user_progress', JSON.stringify(progress));
}
