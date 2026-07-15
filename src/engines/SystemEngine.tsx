/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { MissionDay, Language, UserProgress, DayType } from '../types';
import { 
  loadDaysFromStorage, 
  saveDaysToStorage, 
  loadUserProgressFromStorage, 
  saveUserProgressToStorage,
  generateInitialDays,
  getDayTypeLabel
} from '../data/templateData';
import { getChapterForDay } from '../data/chaptersData';
import { adaptMessage } from '../utils/grammar';

// ==========================================
// 14 Core Systems Engine Definitions
// ==========================================

export interface JourneyEngine {
  focusedDayNumber: number;
  setFocusedDayNumber: (day: number) => void;
  activeJourneyId: string;
  setActiveJourneyId: (id: string) => void;
  days: MissionDay[];
  setDays: (days: MissionDay[]) => void;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  hasDismissedDailyGate: boolean;
  setHasDismissedDailyGate: (val: boolean) => void;
  getChapterForDayNum: (day: number) => any;
}

export interface IdentityEngine {
  profileName: string;
  setProfileName: (name: string) => void;
  getTreeStage: (completedCount: number) => number;
  getTreeTitle: (completedCount: number, lang: Language) => string;
  getTreeDesc: (completedCount: number, lang: Language) => string;
}

export interface ContentEngine {
  lang: Language;
  setLang: (lang: Language) => void;
  grammarPreference: 'feminine' | 'masculine' | 'neutral';
  setGrammarPreference: (pref: 'feminine' | 'masculine' | 'neutral') => void;
  adaptText: (text: string) => string;
}

export interface AudioEngine {
  isPlaying: boolean;
  setIsPlaying: (val: boolean) => void;
  currentTime: number;
  setCurrentTime: (val: number) => void;
  duration: number;
  setDuration: (val: number) => void;
  volume: number;
  setVolume: (val: number) => void;
  pauseCount: number;
  setPauseCount: (val: number) => void;
}

export interface CreatorEngine {
  saveDays: (updatedDays: MissionDay[]) => void;
  resetDays: () => void;
  isSaving: boolean;
}

export interface CommunityEngine {
  communityMembership: string[];
  joinCommunity: (platform: string) => void;
  isMemberOf: (platform: string) => boolean;
}

export interface MentorshipEngine {
  bookingUrl: string;
  mentorshipHistory: Array<{ id: string; date: string; time: string; topic: string; provider: string; status: string }>;
  bookSession: (session: { date: string; time: string; topic: string; provider: string }) => void;
}

export interface NotificationEngine {
  notificationsEnabled: boolean;
  setNotificationsEnabled: (val: boolean) => void;
  dailyReminderTime: string;
  setDailyReminderTime: (val: string) => void;
  notifications: Array<{ id: string; title: Record<Language, string>; body: Record<Language, string>; createdAt: string; read: boolean }>;
  markAsRead: (id: string) => void;
  addNotification: (title: Record<Language, string>, body: Record<Language, string>) => void;
}

export interface SosEngine {
  sosOpenedCount: number;
  incrementSosCount: () => void;
  emergencyCheckins: Array<{ date: string; emotion: string; breathingHelpful: string }>;
  logCheckin: (emotion: string, breathingHelpful: string) => void;
}

export interface MemoryEngine {
  favoriteHooks: number[];
  toggleFavorite: (dayNum: number) => void;
  copiedHooks: number[];
  registerCopy: (dayNum: number) => void;
  submittedReflections: Record<number, string>;
  submittedVideoLinks: Record<number, string>;
}

export interface AnalyticsEngine {
  behaviorStats: {
    listeningSeconds: number;
    videosCompletedCount: number;
    skippedReflectionsCount: number;
    sosOpenedCount: number;
    completionCount: number;
    pausesCount: number;
    replayCount: number;
    skippedIntroCount: number;
    totalSessions: number;
    lastActiveTimestamp: number;
  };
  trackEvent: (eventName: string, meta?: any) => void;
}

export interface PersonalizationEngine {
  guideStyle: 'gentle' | 'challenger' | 'strategic' | 'inspirational';
  setGuideStyle: (style: 'gentle' | 'challenger' | 'strategic' | 'inspirational') => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export interface CelebrationEngine {
  confettiActive: boolean;
  setConfettiActive: (val: boolean) => void;
  sparklesBadgeActive: boolean;
  setSparklesBadgeActive: (val: boolean) => void;
  milestoneOverlay: { type: 'intro' | 'completion'; chapterId: number; userReflection?: string } | null;
  setMilestoneOverlay: (val: { type: 'intro' | 'completion'; chapterId: number; userReflection?: string } | null) => void;
}

export interface ProgressEngine {
  progress: UserProgress;
  completionHistory: number[];
  currentStreak: number;
  longestStreak: number;
  completeDay: (dayNum: number, reflectionText: string, videoLink: string) => void;
  resetProgress: () => void;
  isDayCompleted: (dayNum: number) => boolean;
  isDayLocked: (dayNum: number) => boolean;
  completionPercentage: number;
}

// Global Orchestrator State for the 14 Systems
export interface SystemEngineState {
  journeySystem: JourneyEngine;
  identitySystem: IdentityEngine;
  contentSystem: ContentEngine;
  audioSystem: AudioEngine;
  creatorSystem: CreatorEngine;
  communitySystem: CommunityEngine;
  mentorshipSystem: MentorshipEngine;
  notificationSystem: NotificationEngine;
  sosSystem: SosEngine;
  memorySystem: MemoryEngine;
  analyticsSystem: AnalyticsEngine;
  personalizationSystem: PersonalizationEngine;
  celebrationSystem: CelebrationEngine;
  progressSystem: ProgressEngine;
}

const SystemContext = createContext<SystemEngineState | undefined>(undefined);

export const SystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load State from persistence adapters
  const [progress, setProgressState] = useState<UserProgress>(() => loadUserProgressFromStorage());
  const [days, setDaysState] = useState<MissionDay[]>(() => loadDaysFromStorage(progress.journeyStartDate));
  const [activeTab, setActiveTabState] = useState<string>('home');
  const [focusedDayNumber, setFocusedDayNumberState] = useState<number>(() => {
    const defaultProgress = loadUserProgressFromStorage();
    return defaultProgress.currentDay <= 30 ? defaultProgress.currentDay : 30;
  });

  const [hasDismissedDailyGate, setHasDismissedDailyGateState] = useState(() => {
    const isOnboarded = localStorage.getItem('renaser_onboarded') === 'true';
    return !isOnboarded;
  });

  // Theme support
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    const defaultProgress = loadUserProgressFromStorage();
    return defaultProgress.theme || 'light';
  });

  // Language & custom settings support
  const [lang, setLangState] = useState<Language>('pt');
  const [grammarPref, setGrammarPrefState] = useState<'feminine' | 'masculine' | 'neutral'>('neutral');

  useEffect(() => {
    const savedLang = localStorage.getItem('renaser_language') as Language;
    if (savedLang === 'pt' || savedLang === 'en' || savedLang === 'es') {
      setLangState(savedLang);
    }
  }, []);

  // Update localStorage helper
  const updateProgressState = (newProgress: UserProgress) => {
    setProgressState(newProgress);
    saveUserProgressToStorage(newProgress);
  };

  // 1. JOURNEY SYSTEM
  const [activeJourneyId, setActiveJourneyIdState] = useState<string>('rena-ser-30');
  const journeySystem: JourneyEngine = {
    focusedDayNumber,
    setFocusedDayNumber: setFocusedDayNumberState,
    activeJourneyId,
    setActiveJourneyId: setActiveJourneyIdState,
    days,
    setDays: (newDays) => {
      setDaysState(newDays);
      saveDaysToStorage(newDays);
    },
    activeTab,
    setActiveTab: setActiveTabState,
    hasDismissedDailyGate,
    setHasDismissedDailyGate: setHasDismissedDailyGateState,
    getChapterForDayNum: (dayNum) => getChapterForDay(dayNum)
  };

  // 2. IDENTITY SYSTEM
  const [profileName, setProfileNameState] = useState<string>('Explorer');
  const identitySystem: IdentityEngine = {
    profileName,
    setProfileName: setProfileNameState,
    getTreeStage: (count: number) => {
      if (count <= 2) return 1;
      if (count <= 5) return 2;
      if (count <= 8) return 3;
      if (count <= 11) return 4;
      if (count <= 14) return 5;
      if (count <= 17) return 6;
      if (count <= 20) return 7;
      if (count <= 24) return 8;
      if (count <= 28) return 9;
      return 10;
    },
    getTreeTitle: (count: number, currentLang: Language) => {
      const titles: Record<number, Record<Language, string>> = {
        1: { pt: 'Semente Sagrada', en: 'Sacred Seed', es: 'Semilla Sagrada' },
        2: { pt: 'Broto de Coragem', en: 'Sprout of Courage', es: 'Brote de Coraje' },
        3: { pt: 'Planta Jovem', en: 'Young Plant', es: 'Planta Joven' },
        4: { pt: 'Surgimento das Folhas', en: 'Emerging Leaves', es: 'Surgimiento de Hojas' },
        5: { pt: 'Pequenos Ramos', en: 'Small Branches', es: 'Pequeñas Ramas' },
        6: { pt: 'Primeira Flor', en: 'First Blossom', es: 'Primera Flor' },
        7: { pt: 'Santuário Florescendo', en: 'Blooming Sanctuary', es: 'Santuario Floreciente' },
        8: { pt: 'Árvore Jovem', en: 'Young Tree', es: 'Árbol Joven' },
        9: { pt: 'Árvore de Renascimento', en: 'Tree of Rebirth', es: 'Árbol de Renacimiento' },
        10: { pt: 'A Árvore de Ouro Eterno', en: 'The Tree of Eternal Gold', es: 'El Árbol de Oro Eterno' }
      };
      const stageNum = identitySystem.getTreeStage(count);
      return titles[stageNum]?.[currentLang] || titles[1][currentLang];
    },
    getTreeDesc: (count: number, currentLang: Language) => {
      const descs: Record<number, Record<Language, string>> = {
        1: { pt: 'Seu potencial de voz começa no silêncio e no acolhimento.', en: "Your voice's potential begins in silence.", es: 'Tu potencial de voz comienza en el silencio.' },
        2: { pt: 'A primeira fenda no solo. Você está ousando aparecer.', en: 'First breakthrough. You are appearing.', es: 'Primera grieta. Te atreves a aparecer.' },
        3: { pt: 'A estrutura se fortalece. A constância nutre sua base.', en: 'Consistency nurtures your base.', es: 'La constancia nutre tu base.' },
        4: { pt: 'Os ganchos ganham corpo. Sua voz começa a ser ouvida.', en: 'Your hooks take shape. Your voice is heard.', es: 'Tus ganchos toman forma. Tu voz se escucha.' },
        5: { pt: 'Os canais se multiplicam. Novas direções.', en: 'Channels multiply.', es: 'Los canales se multiplican.' },
        6: { pt: 'Sua vulnerabilidade atrai. O perfume da autenticidade.', en: 'Vulnerability blooms.', es: 'Tu vulnerabilidad florece.' },
        7: { pt: 'Os frutos aparecem. Você guia outras pessoas.', en: 'Fruit appears.', es: 'Los frutos aparecen.' },
        8: { pt: 'Solidez e resistência às intempéries.', en: 'Solid and wind-resistant.', es: 'Sólida y resistente.' },
        9: { pt: 'O ciclo está completo. O amanhã é próspero.', en: 'The cycle is complete.', es: 'El ciclo está completo.' },
        10: { pt: 'Sua voz transcendeu o medo. Você é eterna luz e ouro.', en: 'Your voice transcended fear.', es: 'Tu voz trascendió el miedo.' }
      };
      const stageNum = identitySystem.getTreeStage(count);
      return descs[stageNum]?.[currentLang] || descs[1][currentLang];
    }
  };

  // 3. CONTENT SYSTEM
  const contentSystem: ContentEngine = {
    lang,
    setLang: (newLang) => {
      setLangState(newLang);
      localStorage.setItem('renaser_language', newLang);
    },
    grammarPreference: grammarPref,
    setGrammarPreference: setGrammarPrefState,
    adaptText: (text: string) => adaptMessage(text, grammarPref, lang)
  };

  // 4. AUDIO SYSTEM
  const [audioPlaying, setAudioPlaying] = useState<boolean>(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState<number>(0);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [audioVolume, setAudioVolume] = useState<number>(1.0);
  const [audioPauseCount, setAudioPauseCount] = useState<number>(0);
  const audioSystem: AudioEngine = {
    isPlaying: audioPlaying,
    setIsPlaying: setAudioPlaying,
    currentTime: audioCurrentTime,
    setCurrentTime: setAudioCurrentTime,
    duration: audioDuration,
    setDuration: setAudioDuration,
    volume: audioVolume,
    setVolume: setAudioVolume,
    pauseCount: audioPauseCount,
    setPauseCount: setAudioPauseCount
  };

  // 5. CREATOR STUDIO SYSTEM
  const [isSaving, setIsSaving] = useState(false);
  const creatorSystem: CreatorEngine = {
    saveDays: (updatedDays) => {
      setIsSaving(true);
      setDaysState(updatedDays);
      saveDaysToStorage(updatedDays);
      setTimeout(() => setIsSaving(false), 800);
    },
    resetDays: () => {
      const initial = generateInitialDays(progress.journeyStartDate);
      setDaysState(initial);
      saveDaysToStorage(initial);
    },
    isSaving
  };

  // 6. COMMUNITY SYSTEM
  const communitySystem: CommunityEngine = {
    communityMembership: progress.communityMembership || [],
    joinCommunity: (platform) => {
      const list = [...(progress.communityMembership || [])];
      if (!list.includes(platform)) {
        list.push(platform);
        updateProgressState({ ...progress, communityMembership: list });
      }
    },
    isMemberOf: (platform) => {
      return (progress.communityMembership || []).includes(platform);
    }
  };

  // 7. MENTORSHIP SYSTEM
  const mentorshipSystem: MentorshipEngine = {
    bookingUrl: 'https://calendly.com/renaser/mentorship',
    mentorshipHistory: progress.mentorshipHistory || [],
    bookSession: (session) => {
      const sessionItem = {
        id: Math.random().toString(36).substr(2, 9),
        date: session.date,
        time: session.time,
        topic: session.topic,
        provider: session.provider,
        status: 'Scheduled'
      };
      const updatedHistory = [...(progress.mentorshipHistory || []), sessionItem];
      updateProgressState({ ...progress, mentorshipHistory: updatedHistory });
    }
  };

  // 8. NOTIFICATION SYSTEM
  const [notifEnabled, setNotifEnabled] = useState(progress.settings?.notificationsEnabled ?? true);
  const [reminderTime, setReminderTime] = useState(progress.settings?.dailyReminder ?? '09:00');
  const [notifList, setNotifList] = useState<any[]>(() => {
    return [
      {
        id: 'welcome',
        title: { pt: 'Bem-vindo ao RenaSer', en: 'Welcome to RenaSer', es: 'Bienvenido a RenaSer' },
        body: { 
          pt: 'Sua jornada de expressão autêntica e liberdade começa agora. Estamos com você.', 
          en: 'Your journey of authentic expression begins now. We are with you.', 
          es: 'Tu viaje de expresión auténtica comienza ahora. Estamos contigo.' 
        },
        createdAt: new Date().toISOString(),
        read: false
      }
    ];
  });
  const notificationSystem: NotificationEngine = {
    notificationsEnabled: notifEnabled,
    setNotificationsEnabled: (val) => {
      setNotifEnabled(val);
      const settings = { ...(progress.settings || { theme, dailyReminder: reminderTime, notificationsEnabled: true }), notificationsEnabled: val };
      updateProgressState({ ...progress, settings });
    },
    dailyReminderTime: reminderTime,
    setDailyReminderTime: (val) => {
      setReminderTime(val);
      const settings = { ...(progress.settings || { theme, dailyReminder: '09:00', notificationsEnabled: notifEnabled }), dailyReminder: val };
      updateProgressState({ ...progress, settings });
    },
    notifications: notifList,
    markAsRead: (id) => {
      setNotifList(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    },
    addNotification: (title, body) => {
      const newNotif = {
        id: Math.random().toString(36).substr(2, 9),
        title,
        body,
        createdAt: new Date().toISOString(),
        read: false
      };
      setNotifList(prev => [newNotif, ...prev]);
    }
  };

  // 9. SOS EMOTIONAL SUPPORT SYSTEM
  const sosSystem: SosEngine = {
    sosOpenedCount: progress.behaviorStats?.sosOpenedCount || 0,
    incrementSosCount: () => {
      const stats = progress.behaviorStats || {
        listeningSeconds: 0,
        videosCompletedCount: 0,
        skippedReflectionsCount: 0,
        sosOpenedCount: 0,
        completionCount: 0,
        pausesCount: 0,
        replayCount: 0,
        skippedIntroCount: 0,
        totalSessions: 0,
        lastActiveTimestamp: Date.now()
      };
      const updatedStats = { ...stats, sosOpenedCount: stats.sosOpenedCount + 1 };
      updateProgressState({ ...progress, behaviorStats: updatedStats });
    },
    emergencyCheckins: progress.sosCheckins || [],
    logCheckin: (emotion, breathingHelpful) => {
      const logItem = {
        date: new Date().toISOString().split('T')[0],
        emotion,
        breathingHelpful
      };
      const updatedList = [...(progress.sosCheckins || []), logItem];
      updateProgressState({ ...progress, sosCheckins: updatedList });
    }
  };

  // 10. MEMORY SYSTEM
  const memorySystem: MemoryEngine = {
    favoriteHooks: progress.favoriteHooks || [],
    toggleFavorite: (dayNum) => {
      const favorites = [...(progress.favoriteHooks || [])];
      const idx = favorites.indexOf(dayNum);
      if (idx > -1) {
        favorites.splice(idx, 1);
      } else {
        favorites.push(dayNum);
      }
      updateProgressState({ ...progress, favoriteHooks: favorites });
    },
    copiedHooks: progress.copiedHooks || [],
    registerCopy: (dayNum) => {
      if (progress.copiedHooks.includes(dayNum)) return;
      const copies = [...progress.copiedHooks, dayNum];
      updateProgressState({ ...progress, copiedHooks: copies });
    },
    submittedReflections: progress.reflections || {},
    submittedVideoLinks: progress.videoLinks || {}
  };

  // 11. ANALYTICS SYSTEM
  const [behaviorStats, setBehaviorStats] = useState(() => {
    return progress.behaviorStats || {
      listeningSeconds: 0,
      videosCompletedCount: 0,
      skippedReflectionsCount: 0,
      sosOpenedCount: 0,
      completionCount: 0,
      pausesCount: 0,
      replayCount: 0,
      skippedIntroCount: 0,
      totalSessions: 0,
      lastActiveTimestamp: Date.now()
    };
  });
  const analyticsSystem: AnalyticsEngine = {
    behaviorStats,
    trackEvent: (eventName, meta) => {
      console.log(`[System Engine Analytics] event: ${eventName}`, meta || {});
      // In the future this plugs directly into live cloud storage / firebase adapters
    }
  };

  // 12. PERSONALIZATION SYSTEM
  const [guideStyle, setGuideStyleState] = useState<'gentle' | 'challenger' | 'strategic' | 'inspirational'>('strategic');
  const personalizationSystem: PersonalizationEngine = {
    guideStyle,
    setGuideStyle: (style) => {
      setGuideStyleState(style);
      updateProgressState({ ...progress, guideStyle: style });
    },
    theme,
    setTheme: (newTheme) => {
      setThemeState(newTheme);
      updateProgressState({ ...progress, theme: newTheme });
    }
  };

  // Sync theme with document element
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // 13. CELEBRATION SYSTEM
  const [confettiActive, setConfettiActive] = useState(false);
  const [sparklesBadgeActive, setSparklesBadgeActive] = useState(false);
  const [milestoneOverlay, setMilestoneOverlay] = useState<{ type: 'intro' | 'completion'; chapterId: number; userReflection?: string } | null>(null);

  const celebrationSystem: CelebrationEngine = {
    confettiActive,
    setConfettiActive,
    sparklesBadgeActive,
    setSparklesBadgeActive,
    milestoneOverlay,
    setMilestoneOverlay
  };

  // 14. PROGRESS SYSTEM
  const progressSystem: ProgressEngine = {
    progress,
    completionHistory: progress.completionHistory || [],
    currentStreak: progress.currentStreak || 0,
    longestStreak: progress.longestStreak || 0,
    completionPercentage: Math.round(((progress.completionHistory || []).length / 30) * 100),
    isDayCompleted: (dayNum) => (progress.completionHistory || []).includes(dayNum),
    isDayLocked: (dayNum) => {
      // Locking logic: day numbers greater than currentDay are locked
      return dayNum > progress.currentDay;
    },
    completeDay: (dayNum, reflectionText, videoLink) => {
      if ((progress.completionHistory || []).includes(dayNum)) return;

      const history = [...(progress.completionHistory || []), dayNum];
      const todayStr = new Date().toISOString().split('T')[0];
      
      let streak = progress.currentStreak || 0;
      let longest = progress.longestStreak || 0;

      if (progress.lastActiveDate === null) {
        streak = 1;
      } else {
        const lastActive = new Date(progress.lastActiveDate);
        const today = new Date(todayStr);
        const diffTime = Math.abs(today.getTime() - lastActive.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 1) {
          if (progress.lastActiveDate !== todayStr) {
            streak += 1;
          }
        } else {
          streak = 1;
        }
      }

      if (streak > longest) {
        longest = streak;
      }

      // Advance focusedDayNumber & currentDay if appropriate
      let nextDay = progress.currentDay;
      if (dayNum === progress.currentDay && progress.currentDay < 30) {
        nextDay = progress.currentDay + 1;
        setFocusedDayNumberState(nextDay);
        setActiveTabState('home');
      }

      const updatedProgress: UserProgress = {
        ...progress,
        currentDay: nextDay,
        completionHistory: history,
        currentStreak: streak,
        longestStreak: longest,
        lastActiveDate: todayStr,
        reflections: {
          ...progress.reflections,
          [dayNum]: reflectionText
        },
        videoLinks: {
          ...progress.videoLinks,
          [dayNum]: videoLink
        }
      };

      updateProgressState(updatedProgress);

      // Trigger Celebration milestones
      if (dayNum === 7 || dayNum === 14 || dayNum === 21 || dayNum === 30) {
        const chapterId = dayNum === 7 ? 1 : dayNum === 14 ? 2 : dayNum === 21 ? 3 : 4;
        setMilestoneOverlay({
          type: 'completion',
          chapterId,
          userReflection: reflectionText
        });
      } else if (dayNum === 30) {
        setActiveTabState('nextlevel');
      }
    },
    resetProgress: () => {
      localStorage.removeItem('renaser_onboarded');
      setHasDismissedDailyGateState(true);
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
        journeyStartDate: new Date().toISOString().slice(0, 10)
      };
      updateProgressState(defaultProgress);
      setFocusedDayNumberState(1);
      setActiveTabState('home');
    }
  };

  const engineState: SystemEngineState = {
    journeySystem,
    identitySystem,
    contentSystem,
    audioSystem,
    creatorSystem,
    communitySystem,
    mentorshipSystem,
    notificationSystem,
    sosSystem,
    memorySystem,
    analyticsSystem,
    personalizationSystem,
    celebrationSystem,
    progressSystem
  };

  return (
    <SystemContext.Provider value={engineState}>
      {children}
    </SystemContext.Provider>
  );
};

export const useSystem = () => {
  const context = useContext(SystemContext);
  if (!context) {
    throw new Error('useSystem must be used within a SystemProvider');
  }
  return context;
};
