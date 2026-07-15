/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommunityConfig, FreeCommunityConfig, SupportConfig, MentoringConfig, LibraryAsset, Language } from '../types';

export const DEFAULT_COMMUNITY_CONFIG: CommunityConfig = {
  name: {
    pt: 'Ecosistema de Membros VIP RenaSer',
    en: 'RenaSer VIP Members Ecosystem',
    es: 'Ecosistema de Miembros VIP RenaSer'
  },
  description: {
    pt: 'Nossa comunidade exclusiva de alunos e criadores de conteúdo. O lugar perfeito para publicar seus ganchos de vídeo diários, receber feedbacks construtivos da mentora Renata, criar parcerias de alto nível e acelerar seu destrave de visibilidade.',
    en: 'Our exclusive community of students and content creators. The perfect spot to share your daily hooks, receive constructive feedback from your mentor Renata, make high-level connections, and accelerate your visibility journey.',
    es: 'Nuestra comunidad exclusiva de estudiantes y creadores de contenido. El lugar perfecto para publicar tus ganchos diarios de video, recibir comentarios constructivos de tu mentora Renata, generar conexiones de alto nivel y acelerar tu destrabe.'
  },
  buttonTitle: {
    pt: 'Acessar Área de Membros VIP',
    en: 'Access VIP Members Area',
    es: 'Acceder al Área de Miembros VIP'
  },
  joinLink: 'https://pay.kiwify.com.br/7ViiKiH',
  buttonColor: '#A35D68',
  image: '',
  platform: 'Kiwify'
};

export const DEFAULT_FREE_COMMUNITY_CONFIG: FreeCommunityConfig = {
  title: {
    pt: 'Comunidade Gratuita',
    en: 'Free Community',
    es: 'Comunidad Gratuita'
  },
  description: {
    pt: 'Aqui você compartilha seus avanços e troca suas ideias com outros membros no mesmo processo que você.',
    en: 'Here you share your progress and exchange ideas with other members going through the same process as you.',
    es: 'Aquí compartes tus avances e intercambias ideas con otros miembros en el mismo proceso que tú.'
  },
  joinLink: 'https://chat.whatsapp.com/JSfHx6KKY8sIFUozyQCkLr'
};

export const DEFAULT_SUPPORT_CONFIG: SupportConfig = {
  email: 'manifestandomagicasuporte@gmail.com',
  whatsapp: '+34634449155',
  formUrl: 'https://forms.gle/renaser_suporte',
  websiteUrl: 'https://suporte.renaser.co',
  helpCenterUrl: 'https://ajuda.renaser.co',
  weeklyVideoUrl: 'https://www.youtube.com/watch?v=pFTyrgrGycA&t=5s',
  upliftMessage: {
    pt: 'O que você alcançou hoje? Já compartilhou na comunidade? Vem celebrar seus pequenos avanços com a gente!',
    en: 'What did you achieve today? Have you shared it with the community yet? Come celebrate your small wins with us!',
    es: '¿Qué lograste hoy? ¿Ya lo compartiste en la comunidad? ¡Ven a celebrar tus pequeños avances con nosotros!'
  },
  faqs: [
    {
      id: 'faq_1',
      question: {
        pt: 'Como gravo e envio as minhas tarefas de vídeo?',
        en: 'How do I record and submit my video tasks?',
        es: '¿Cómo grabo y envío mis tareas de video?'
      },
      answer: {
        pt: 'Você pode gravar diretamente pelo seu celular. No final de cada missão diária, cole o link do seu Story do Instagram, vídeo do TikTok, link do Google Drive ou do YouTube. Se preferir manter privado, você pode apenas escrever a sua reflexão.',
        en: 'You can record directly on your phone. At the end of each daily mission, paste the link of your Instagram Story, TikTok video, Google Drive, or YouTube link. If you prefer to keep it private, simply write down your reflection.',
        es: 'Puedes grabar directamente con tu teléfono. Al final de cada misión diaria, pega el enlace de tu Story de Instagram, video de TikTok, Google Drive o YouTube. Si prefieres mantenerlo privado, simplemente escribe tu reflexión.'
      }
    },
    {
      id: 'faq_2',
      question: {
        pt: 'O que acontece depois de completar os 30 dias?',
        en: 'What happens after completing the 30 days?',
        es: '¿Qué pasa después de completar los 30 días?'
      },
      answer: {
        pt: 'Você não é deixado sozinho! A jornada de 30 dias é apenas o começo. Você continuará tendo acesso à nossa comunidade vibrante para trocar ganchos, além de acesso vitalício à nossa Biblioteca com masterclasses, meditações guiadas de calibração e mentoria ao vivo.',
        en: 'You are never left alone! The 30-day journey is just the start. You will maintain access to our vibrant community to trade hooks, plus lifetime access to our Library featuring masterclasses, guided meditations, and live mentorship.',
        es: '¡No te quedarás solo! El viaje de 30 días es solo el comienzo. Continuarás teniendo acceso a nuestra comunidad vibrante para compartir ganchos, además de acceso de por vida a nuestra Biblioteca con clases maestras, meditaciones y mentoría.'
      }
    },
    {
      id: 'faq_3',
      question: {
        pt: 'Posso refazer as missões diárias do RenaSer?',
        en: 'Can I redo the RenaSer daily missions?',
        es: '¿Puedo rehacer las misiones diarias de RenaSer?'
      },
      answer: {
        pt: 'Sim! Seus diários, ganchos prediletos e o scrapbook emocional ficam gravados no seu dispositivo. Você pode resetar seu progresso pelas configurações ou clicar em qualquer dia anterior no calendário para rever as diretrizes e áudios.',
        en: 'Yes! Your journals, favorite hooks, and emotional scrapbook are recorded on your device. You can reset your progress via settings or click any previous day in the calendar to review guidelines and audios.',
        es: '¡Sí! Tus diarios, ganchos favoritos y el álbum de recortes se guardan en tu dispositivo. Puedes reiniciar tu progreso en los ajustes o hacer clic en cualquier día anterior en el calendario para repasar guías y audios.'
      }
    }
  ]
};

export const DEFAULT_MENTORING_CONFIG: MentoringConfig = {
  bookingUrl: 'https://wa.me/34634449155?text=Ol%C3%A1!%20Quero%20agendar%20minha%20sess%C3%A3o%20de%20mentoria%20RenaSer.',
  title: {
    pt: 'Agende uma Sessão Particular de Mentoria 1-a-1',
    en: 'Book a Private 1-on-1 Mentoring Session',
    es: 'Reserva una Sesión Privada de Mentoría 1 a 1'
  },
  description: {
    pt: 'Agende um encontro exclusivo de 45 minutos com o criador do RenaSer para realizar uma calibração postural na lente, auditar seus ganchos de vídeo, estruturar sua linha editorial única e vencer travas psicológicas profundas.',
    en: 'Schedule an exclusive 45-minute private session with the creator of RenaSer to calibrate your on-camera posture, audit your hook structures, align your unique content pillars, and dismantle deep-seated blocks.',
    es: 'Agenda un encuentro exclusivo de 45 minutos con el creador de RenaSer para calibrar tu postura frente a la lente, auditar tus ganchos de video, estructurar tu línea editorial única y vencer bloqueos psicológicos profundos.'
  },
  ctaText: {
    pt: 'Agendar Sessão VIP de Mentoria',
    en: 'Book VIP Session',
    es: 'Reservar Sesión VIP de Mentoría'
  },
  provider: 'WhatsApp'
};

export const INITIAL_LIBRARY_ASSETS: LibraryAsset[] = [
  {
    id: 'lib_1',
    title: {
      pt: 'Masterclass: A Ciência dos Ganchos Magnéticos',
      en: 'Masterclass: The Science of Magnetic Hooks',
      es: 'Clase Maestra: La Ciencia de los Ganchos Magnéticos'
    },
    description: {
      pt: 'Aprenda as fórmulas neuro-cognitivas secretas usadas por grandes marcas e criadores para travar a atenção do usuário nos primeiros 3 segundos do vídeo.',
      en: 'Learn the secret neuro-cognitive formulas used by big brands and creators to lock user attention within the first 3 seconds of a video.',
      es: 'Aprende las fórmulas neuro-cognitivas secretas utilizadas por grandes marcas y creadores para capturar la atención del usuario en los primeros 3 segundos.'
    },
    category: 'masterclasses',
    mediaUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    durationOrSize: '42 mins',
    coverImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'lib_2',
    title: {
      pt: 'Apostila Completa de Roteirização em Stories',
      en: 'Stories Scripting Ultimate Workbook',
      es: 'Cuaderno Completo de Guiones para Stories'
    },
    description: {
      pt: 'Um guia prático em formato PDF com mais de 50 estruturas prontas de narrativas persuasivas diárias que transformam visualizações frias em clientes quentes.',
      en: 'A practical PDF workbook with over 50 ready-to-use persuasive narrative models that convert cold views into warm, paying clients.',
      es: 'Una guía práctica en PDF con más de 50 estructuras de narrativas persuasivas que transforman visualizaciones en clientes de inmediato.'
    },
    category: 'workbooks',
    mediaUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    durationOrSize: '4.2 MB',
    coverImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'lib_3',
    title: {
      pt: 'Áudio de Calibração: Respiração da Clareza',
      en: 'Calibration Audio: Breath of Clarity',
      es: 'Audio de Calibración: Respiración de Claridad'
    },
    description: {
      pt: 'Uma meditação guiada curta de 5 minutos projetada especificamente para liberar tensões nas cordas vocais, estabilizar a voz e desinflamar a ansiedade.',
      en: 'A short 5-minute guided meditation designed specifically to release throat tension, stabilize vocal projection, and deflate nervous anxiety.',
      es: 'Una meditación guiada corta de 5 minutos diseñada para liberar tensiones en las cuerdas vocales, estabilizar la voz y calmar la ansiedad.'
    },
    category: 'meditations',
    mediaUrl: 'https://actions.google.com/sounds/v1/ambiences/morning_birds.ogg',
    durationOrSize: '5 mins',
    coverImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'lib_4',
    title: {
      pt: 'Desafio Extra: 7 Dias de Stories Autênticos',
      en: 'Bonus Challenge: 7 Days of Authentic Stories',
      es: 'Desafío Extra: 7 Días de Stories Auténticos'
    },
    description: {
      pt: 'Uma mini-jornada rápida e divertida focada em criar narrativas em tempo real sem qualquer edição, treinando o improviso e a leveza ao falar.',
      en: 'A fast, fun mini-journey focused on real-time stories without edits, training improvisation skills and natural conversation on screen.',
      es: 'Un mini-viaje rápido enfocado en crear narraciones en tiempo real sin edición, entrenando el libre fluir y la soltura al hablar.'
    },
    category: 'challenges',
    mediaUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    durationOrSize: '7 Days',
    coverImage: 'https://images.unsplash.com/photo-1552581230-c01591d3c99a?auto=format&fit=crop&w=800&q=80'
  }
];

// Bump whenever a DEFAULT_*_CONFIG constant above changes, so browsers with an
// already-cached config regenerate instead of showing stale copy (same
// mechanism as DAYS_CONTENT_VERSION in templateData.ts). This does discard any
// CMS hand-edits to these configs — acceptable while still being tuned from code.
const ECOSYSTEM_CONFIG_VERSION = '5';

export function loadCommunityConfig(): CommunityConfig {
  const stored = localStorage.getItem('renaser_community_config');
  const storedVersion = localStorage.getItem('renaser_community_config_version');
  if (stored && storedVersion === ECOSYSTEM_CONFIG_VERSION) {
    try { return JSON.parse(stored); } catch (e) { console.error(e); }
  }
  saveCommunityConfig(DEFAULT_COMMUNITY_CONFIG);
  return DEFAULT_COMMUNITY_CONFIG;
}

export function saveCommunityConfig(config: CommunityConfig): void {
  localStorage.setItem('renaser_community_config', JSON.stringify(config));
  localStorage.setItem('renaser_community_config_version', ECOSYSTEM_CONFIG_VERSION);
}

export function loadFreeCommunityConfig(): FreeCommunityConfig {
  const stored = localStorage.getItem('renaser_free_community_config');
  const storedVersion = localStorage.getItem('renaser_free_community_config_version');
  if (stored && storedVersion === ECOSYSTEM_CONFIG_VERSION) {
    try { return JSON.parse(stored); } catch (e) { console.error(e); }
  }
  saveFreeCommunityConfig(DEFAULT_FREE_COMMUNITY_CONFIG);
  return DEFAULT_FREE_COMMUNITY_CONFIG;
}

export function saveFreeCommunityConfig(config: FreeCommunityConfig): void {
  localStorage.setItem('renaser_free_community_config', JSON.stringify(config));
  localStorage.setItem('renaser_free_community_config_version', ECOSYSTEM_CONFIG_VERSION);
}

export function loadSupportConfig(): SupportConfig {
  const stored = localStorage.getItem('renaser_support_config');
  const storedVersion = localStorage.getItem('renaser_support_config_version');
  if (stored && storedVersion === ECOSYSTEM_CONFIG_VERSION) {
    try { return JSON.parse(stored); } catch (e) { console.error(e); }
  }
  saveSupportConfig(DEFAULT_SUPPORT_CONFIG);
  return DEFAULT_SUPPORT_CONFIG;
}

export function saveSupportConfig(config: SupportConfig): void {
  localStorage.setItem('renaser_support_config', JSON.stringify(config));
  localStorage.setItem('renaser_support_config_version', ECOSYSTEM_CONFIG_VERSION);
}

export function loadMentoringConfig(): MentoringConfig {
  const stored = localStorage.getItem('renaser_mentoring_config');
  const storedVersion = localStorage.getItem('renaser_mentoring_config_version');
  if (stored && storedVersion === ECOSYSTEM_CONFIG_VERSION) {
    try { return JSON.parse(stored); } catch (e) { console.error(e); }
  }
  saveMentoringConfig(DEFAULT_MENTORING_CONFIG);
  return DEFAULT_MENTORING_CONFIG;
}

export function saveMentoringConfig(config: MentoringConfig): void {
  localStorage.setItem('renaser_mentoring_config', JSON.stringify(config));
  localStorage.setItem('renaser_mentoring_config_version', ECOSYSTEM_CONFIG_VERSION);
}

export function loadLibraryAssets(): LibraryAsset[] {
  const stored = localStorage.getItem('renaser_library_assets');
  if (stored) {
    try { return JSON.parse(stored); } catch (e) { console.error(e); }
  }
  return INITIAL_LIBRARY_ASSETS;
}

export function saveLibraryAssets(assets: LibraryAsset[]): void {
  localStorage.setItem('renaser_library_assets', JSON.stringify(assets));
}
