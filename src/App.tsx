/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, BookOpen, Star, Settings, ShieldAlert,
  Sparkles, Award, Lock, Menu, X, ArrowUpRight, Home, Users, User
} from 'lucide-react';

import { MissionDay, Language, UserProgress } from './types';
import { 
  loadDaysFromStorage, 
  saveDaysToStorage, 
  loadUserProgressFromStorage, 
  saveUserProgressToStorage,
  generateInitialDays
} from './data/templateData';

// Chapter and Overlay Imports
import { getChapterForDay, chapters } from './data/chaptersData';
import ChapterMilestoneOverlay from './components/ChapterMilestoneOverlay';

// Subcomponents
import HomeView from './components/HomeView';
import DailyMissionView from './components/DailyMissionView';
import JourneyView from './components/JourneyView';
import HookBankView from './components/HookBankView';
import EmotionalSosView from './components/EmotionalSosView';
import CmsView from './components/CmsView';
import SettingsView from './components/SettingsView';
import NextLevelView from './components/NextLevelView';
import MyTransformationView from './components/MyTransformationView';
import CommunityView from './components/CommunityView';
import LibraryView from './components/LibraryView';
import ProfileView from './components/ProfileView';
import BrandIdentityView from './components/BrandIdentityView';
import RenaSerLogo from './components/RenaSerLogo';
import RenataOSChat from './components/RenataOSChat';

import { adaptMessage } from './utils/grammar';
import { useSystem } from './engines/SystemEngine';

type TabId = 'home' | 'mission' | 'journey' | 'hooks' | 'sos' | 'nextlevel' | 'cms' | 'settings' | 'transformation' | 'community' | 'library' | 'profile' | 'brand';

export default function App() {
  const system = useSystem();

  const [days, setDays] = useState<MissionDay[]>(() => loadDaysFromStorage());
  const [progress, setProgress] = useState<UserProgress>(() => loadUserProgressFromStorage());
  const [lang, setLang] = useState<Language>('pt'); // Default language
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Admin-only gate for Brand Identity & Creator Studio (CMS).
  // NOTE: this is a client-side deterrent, not real security — anyone who reads
  // the deployed JS bundle can find ADMIN_PASSPHRASE. Change it below if needed.
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(() => localStorage.getItem('renaser_admin_unlocked') === 'true');
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);
  const [adminPassInput, setAdminPassInput] = useState('');
  const [adminPassError, setAdminPassError] = useState(false);
  const ADMIN_PASSPHRASE = 'renaser-admin-2026';

  const handleAdminUnlock = () => {
    if (adminPassInput === ADMIN_PASSPHRASE) {
      setIsAdminUnlocked(true);
      localStorage.setItem('renaser_admin_unlocked', 'true');
      setShowAdminPrompt(false);
      setAdminPassInput('');
      setAdminPassError(false);
      setActiveTab('brand');
    } else {
      setAdminPassError(true);
    }
  };

  const handleAdminLock = () => {
    setIsAdminUnlocked(false);
    localStorage.removeItem('renaser_admin_unlocked');
    if (activeTab === 'brand' || activeTab === 'cms') {
      setActiveTab('home');
    }
  };
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const defaultProgress = loadUserProgressFromStorage();
    return defaultProgress.theme || 'light';
  });

  // Chapter Milestone Overlay State
  const [chapterMilestone, setChapterMilestone] = useState<{
    type: 'intro' | 'completion';
    chapterId: number;
    userReflection?: string;
  } | null>(null);

  // Session Opening Splash Screen State
  const [showOpeningSplash, setShowOpeningSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowOpeningSplash(false);
    }, 6500);
    return () => clearTimeout(timer);
  }, []);

  // Daily Gate Splash Screen State
  const [hasDismissedDailyGate, setHasDismissedDailyGate] = useState(() => {
    const isOnboarded = localStorage.getItem('renaser_onboarded') === 'true';
    return !isOnboarded; // If not onboarded yet, show onboarding first. Else, show daily gate (hasDismissed = false).
  });

  // Sync theme with document class list
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Read saved language preference
  useEffect(() => {
    const savedLang = localStorage.getItem('renaser_language') as Language;
    if (savedLang === 'pt' || savedLang === 'en' || savedLang === 'es') {
      setLang(savedLang);
    }
  }, []);

  // Update localStorage when progress state changes
  const updateProgress = (newProgress: UserProgress) => {
    setProgress(newProgress);
    saveUserProgressToStorage(newProgress);
  };

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('renaser_language', newLang);
    system.contentSystem.setLang(newLang);
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    updateProgress({ ...progress, theme: newTheme });
    system.personalizationSystem.setTheme(newTheme);
  };

  // Select day to focus in Home view
  const [focusedDayNumber, setFocusedDayNumber] = useState<number>(() => {
    const defaultProgress = loadUserProgressFromStorage();
    return defaultProgress.currentDay <= 30 ? defaultProgress.currentDay : 30;
  });

  const activeMissionDay = days.find(d => d.dayNumber === focusedDayNumber) || days[0];

  // Auto-trigger Chapter Introduction overlay for new chapters
  useEffect(() => {
    if (chapterMilestone) return; // Prevent double overlays
    if (focusedDayNumber === 1 || focusedDayNumber === 8 || focusedDayNumber === 15 || focusedDayNumber === 22) {
      const chapterId = focusedDayNumber === 1 ? 1 : focusedDayNumber === 8 ? 2 : focusedDayNumber === 15 ? 3 : 4;
      const seenKey = `renaser_intro_chapter_${chapterId}`;
      const hasSeen = localStorage.getItem(seenKey) === 'true';
      if (!hasSeen) {
        setChapterMilestone({ type: 'intro', chapterId });
        localStorage.setItem(seenKey, 'true');
      }
    }
  }, [focusedDayNumber]);

  const handleShowIntro = (chapterId: number) => {
    setChapterMilestone({ type: 'intro', chapterId });
  };

  const handleCloseMilestone = () => {
    if (!chapterMilestone) return;
    const closedType = chapterMilestone.type;
    const closedChapterId = chapterMilestone.chapterId;
    
    setChapterMilestone(null);

    if (closedType === 'completion') {
      if (closedChapterId === 4) {
        setActiveTab('nextlevel');
      } else {
        // Automatically queue the introduction to the next chapter!
        const nextChId = closedChapterId + 1;
        const seenKey = `renaser_intro_chapter_${nextChId}`;
        const hasSeen = localStorage.getItem(seenKey) === 'true';
        if (!hasSeen) {
          setTimeout(() => {
            setChapterMilestone({ type: 'intro', chapterId: nextChId });
            localStorage.setItem(seenKey, 'true');
          }, 350); // smooth cinematic transition delay
        }
      }
    }
  };

  const handleSelectDay = (day: MissionDay) => {
    setFocusedDayNumber(day.dayNumber);
    setActiveTab('home');
  };

  // Action for completing a day's mission
  const handleCompleteDay = (reflectionText: string, videoLink: string) => {
    const dayNum = focusedDayNumber;
    if (progress.completionHistory.includes(dayNum)) return; // Already completed

    const history = [...progress.completionHistory, dayNum];
    
    // Streaks logic
    const todayStr = new Date().toISOString().split('T')[0];
    let currentStreak = progress.currentStreak;
    let longestStreak = progress.longestStreak;

    if (progress.lastActiveDate === null) {
      currentStreak = 1;
    } else {
      const lastActive = new Date(progress.lastActiveDate);
      const today = new Date(todayStr);
      const diffTime = Math.abs(today.getTime() - lastActive.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 1) {
        // Active consecutive or same-day action
        if (progress.lastActiveDate !== todayStr) {
          currentStreak += 1;
        }
      } else {
        // Streak broken
        currentStreak = 1;
      }
    }

    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }

    // Advance to next day automatically
    let nextDay = progress.currentDay;
    if (dayNum === progress.currentDay && progress.currentDay < 30) {
      nextDay = progress.currentDay + 1;
      setFocusedDayNumber(nextDay);
      setActiveTab('home'); // Go to Home Screen showing today's fresh day overview!
    }

    const updatedProgress: UserProgress = {
      ...progress,
      currentDay: nextDay,
      completionHistory: history,
      currentStreak,
      longestStreak,
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

    updateProgress(updatedProgress);
    system.progressSystem.completeDay(dayNum, reflectionText, videoLink);
    system.analyticsSystem.trackEvent('day_completed', { dayNum });

    // If milestone day completed (7, 14, 21, 30), show Celebration overlay screen
    if (dayNum === 7 || dayNum === 14 || dayNum === 21 || dayNum === 30) {
      const chapterId = dayNum === 7 ? 1 : dayNum === 14 ? 2 : dayNum === 21 ? 3 : 4;
      setChapterMilestone({
        type: 'completion',
        chapterId,
        userReflection: reflectionText
      });
    } else if (dayNum === 30) {
      // Fallback redirect if overlay not active
      setActiveTab('nextlevel');
    }
  };

  // Toggle Favorite Status
  const handleToggleFavorite = (dayNum: number) => {
    const favorites = [...progress.favoriteHooks];
    const idx = favorites.indexOf(dayNum);
    if (idx > -1) {
      favorites.splice(idx, 1);
    } else {
      favorites.push(dayNum);
    }
    updateProgress({ ...progress, favoriteHooks: favorites });
    system.memorySystem.toggleFavorite(dayNum);
  };

  // Register Copied Hook
  const handleCopyHook = (dayNum: number) => {
    if (progress.copiedHooks.includes(dayNum)) return;
    const copies = [...progress.copiedHooks, dayNum];
    updateProgress({ ...progress, copiedHooks: copies });
    system.memorySystem.registerCopy(dayNum);
  };

  // CMS: Saving curriculum edits
  const handleSaveDays = (updatedDays: MissionDay[]) => {
    setDays(updatedDays);
    saveDaysToStorage(updatedDays);
    system.creatorSystem.saveDays(updatedDays);
  };

  const handleResetDays = () => {
    const initial = generateInitialDays();
    setDays(initial);
    saveDaysToStorage(initial);
    system.creatorSystem.resetDays();
  };

  // Settings: Reset User Data
  const handleResetProgress = () => {
    localStorage.removeItem('renaser_onboarded');
    setHasDismissedDailyGate(true); // make sure onboarding isn't blocked by daily gate!
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
    updateProgress(defaultProgress);
    setFocusedDayNumber(1);
    setActiveTab('home');
    system.progressSystem.resetProgress();
  };

  // Settings: Diagnostic Quick Jumps
  const handleQuickSimulateUnlockDay30 = () => {
    // Fill history for days 1 to 29
    const simulatedHistory = Array.from({ length: 29 }, (_, i) => i + 1);
    const updated: UserProgress = {
      ...progress,
      currentDay: 30,
      completionHistory: simulatedHistory,
      currentStreak: 29,
      longestStreak: 29,
      lastActiveDate: new Date().toISOString().split('T')[0]
    };
    updateProgress(updated);
    setFocusedDayNumber(30);
    setActiveTab('home');
  };

  const handleQuickSimulateCompletion = () => {
    // Fill history for all 30 days
    const simulatedHistory = Array.from({ length: 30 }, (_, i) => i + 1);
    const updated: UserProgress = {
      ...progress,
      currentDay: 30,
      completionHistory: simulatedHistory,
      currentStreak: 30,
      longestStreak: 30,
      lastActiveDate: new Date().toISOString().split('T')[0]
    };
    updateProgress(updated);
    setFocusedDayNumber(30);
    setActiveTab('nextlevel');
  };

  // Localized Taglines/Labels
  const taglines = {
    pt: 'se lembre de quem você é',
    en: 'remember who you are',
    es: 'recuerda quién eres'
  };

  const labels = {
    pt: {
      home: 'Início',
      mission: 'Missão Diária',
      journey: 'Jornada 30 Dias',
      hooks: 'Banco de Ganchos',
      sos: 'SOS Emocional',
      nextlevel: 'Próximo Nível',
      cms: 'Creator Studio',
      settings: 'Ajustes',
      locked: 'Bloqueado',
      community: 'Comunidade',
      library: 'Biblioteca',
      profile: 'Meu Ser',
      brand: 'Identidade de Marca',
    },
    en: {
      home: 'Home',
      mission: 'Daily Mission',
      journey: '30-Day Journey',
      hooks: 'Hook Bank',
      sos: 'Emotional SOS',
      nextlevel: 'Next Level',
      cms: 'Creator Studio',
      settings: 'Settings',
      locked: 'Locked',
      community: 'Community',
      library: 'Library',
      profile: 'My Portal',
      brand: 'Brand Identity',
    },
    es: {
      home: 'Inicio',
      mission: 'Misión Diaria',
      journey: 'Viaje 30 Días',
      hooks: 'Banco de Ganchos',
      sos: 'SOS Emocional',
      nextlevel: 'Siguiente Nivel',
      cms: 'Creator Studio',
      settings: 'Ajustes',
      locked: 'Bloqueado',
      community: 'Comunidad',
      library: 'Biblioteca',
      profile: 'Mi Portal',
      brand: 'Portal de Marca',
    }
  }[lang];

  const isNextLevelUnlocked = progress.completionHistory.includes(30);

  if (showOpeningSplash) {
    return (
      <div className="fixed inset-0 z-50 bg-[#FAF8F5] dark:bg-[#1E1715] flex flex-col justify-center items-center p-6 text-center select-none overflow-hidden transition-colors duration-500">
        {/* Soft Ambient Gold Blurs */}
        <div className="absolute top-1/3 left-1/3 h-96 w-96 bg-rosegold/5 dark:bg-rosegold/10 blur-3xl rounded-full" />
        <div className="absolute bottom-1/3 right-1/3 h-96 w-96 bg-accentgold/5 dark:bg-accentgold/10 blur-3xl rounded-full" />

        {/* Elegant Natural Butterfly Crossing slowly */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
          <motion.div
            initial={{ x: '-15vw', y: '65vh', rotate: 15, opacity: 0 }}
            animate={{
              x: '115vw',
              y: ['65vh', '48vh', '55vh', '32vh', '40vh', '15vh'],
              rotate: [15, 18, 20, 19, 22, 25],
              opacity: [0, 1, 1, 1, 1, 0]
            }}
            transition={{
              duration: 6.5,
              ease: "easeInOut"
            }}
            className="absolute"
          >
            <motion.img
              src="/assets/images/butterfly.png"
              alt=""
              animate={{ scaleY: [1, 0.78, 1], skewX: [0, 3, 0] }}
              transition={{ duration: 0.4, repeat: Infinity, ease: "easeInOut" }}
              className="h-8 w-auto"
              style={{ transformOrigin: 'center 70%' }}
            />
          </motion.div>
        </div>

        {/* Quietly Fading In Content */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-md w-full relative z-20"
        >
          <RenaSerLogo variant="vertical" size={92} lang={lang} />
        </motion.div>
      </div>
    );
  }

  if (!hasDismissedDailyGate) {
    const chapter = getChapterForDay(focusedDayNumber);
    const gateText = {
      pt: {
        promise: "Hoje, você só precisa cumprir uma promessa para [si mesma/si mesmo/si mesme].",
        button: "Começar Jornada de Hoje",
        dayOf: "Dia {day} de 30",
        chapterName: "Capítulo"
      },
      en: {
        promise: "Today you only need to keep one promise to yourself.",
        button: "Begin Today's Journey",
        dayOf: "Day {day} of 30",
        chapterName: "Chapter"
      },
      es: {
        promise: "Hoy solo necesitas cumplir una promesa [contigo misma/contigo mismo/contigo misme].",
        button: "Comenzar el Viaje de Hoy",
        dayOf: "Día {day} de 30",
        chapterName: "Capítulo"
      }
    }[lang];

    return (
      <div className="fixed inset-0 z-50 bg-[#FAF8F5] dark:bg-[#1E1715] text-slate-900 dark:text-[#FAF8F5] flex flex-col justify-center items-center p-6 text-center select-none overflow-hidden transition-colors duration-500">
        
        {/* Soft Background Blur Spots */}
        <div className="absolute top-1/4 left-1/4 h-80 w-80 bg-rosegold/5 dark:bg-rosegold/10 blur-3xl rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 h-80 w-80 bg-accentgold/5 dark:bg-accentgold/10 blur-3xl rounded-full" />

        {/* Gentle Fluttering Butterfly crossing the screen */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
          <motion.div
            initial={{ x: '-15vw', y: '70vh', rotate: 20 }}
            animate={{ 
              x: '115vw', 
              y: ['70vh', '50vh', '60vh', '35vh', '45vh', '20vh'],
              rotate: [20, 0, 15, -10, 5, -20]
            }}
            transition={{ 
              duration: 14, 
              ease: "easeInOut",
              repeat: Infinity,
              repeatDelay: 2
            }}
            className="absolute"
          >
            <div className="flex gap-0.5">
              <motion.svg 
                animate={{ rotateY: [0, 75, 0] }}
                transition={{ duration: 0.22, repeat: Infinity, ease: "easeInOut" }}
                className="h-7 w-7 text-rosegold fill-current origin-right"
                viewBox="0 0 24 24"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </motion.svg>
              <motion.svg 
                animate={{ rotateY: [0, -75, 0] }}
                transition={{ duration: 0.22, repeat: Infinity, ease: "easeInOut" }}
                className="h-7 w-7 text-rosegold fill-current origin-left scale-x-[-1]"
                viewBox="0 0 24 24"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </motion.svg>
            </div>
          </motion.div>
        </div>

        {/* Content Box */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-md w-full relative z-20 space-y-10"
        >
          {/* Logo with Glowing S */}
          <div className="space-y-2 flex flex-col items-center justify-center">
            <RenaSerLogo variant="vertical" size={72} lang={lang} />
          </div>

          {/* Chapter Display */}
          <div className="space-y-4 py-6 border-t border-b border-rose-100/30 dark:border-rosegold/10">
            <span className="text-xs font-sans text-slate-400 dark:text-slate-500 uppercase tracking-widest block font-medium">
              {gateText.chapterName} {chapter.id}
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif tracking-widest text-slate-900 dark:text-white font-light uppercase">
              {chapter.title[lang]}
            </h2>
            <span className="text-sm font-mono tracking-wider text-rosegold dark:text-rosegold-light block font-bold">
              {gateText.dayOf.replace('{day}', focusedDayNumber.toString())}
            </span>
          </div>

          {/* Core Daily Intention Message */}
          <div className="space-y-8">
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-serif italic max-w-sm mx-auto leading-relaxed">
              "{adaptMessage(gateText.promise, progress.grammarPreference || 'neutral', lang)}"
            </p>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setHasDismissedDailyGate(true)}
              className="w-full sm:w-auto px-8 py-4 bg-rosegold hover:bg-[#A35D68] text-white text-xs uppercase font-sans tracking-widest font-bold rounded-2xl shadow-lg shadow-rosegold/20 transition-all cursor-pointer"
            >
              {gateText.button}
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#1E1715] text-slate-900 dark:text-[#FAF8F5] font-sans flex flex-col selection:bg-rosegold/10 selection:text-rosegold transition-colors duration-350 butterfly-bg">
      
      {/* Brand Elegant Top Header bar */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#2C221E]/90 backdrop-blur-md border-b border-rose-100/30 dark:border-rosegold/10 shadow-rosegold">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Logo Brand Frame */}
          <div className="flex items-center">
            <RenaSerLogo variant="horizontal" size={32} lang={lang} />
          </div>

          {/* Desktop Nav Actions */}
          <nav className="hidden lg:flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-4 py-2 text-xs font-sans font-medium rounded-xl transition ${
                activeTab === 'home' 
                  ? 'bg-rosegold text-white shadow-sm shadow-rosegold/25' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-rose-50/50 dark:hover:bg-rosegold/10'
              }`}
            >
              {labels.home}
            </button>

            <button
              onClick={() => setActiveTab('mission')}
              className={`px-4 py-2 text-xs font-sans font-medium rounded-xl transition ${
                activeTab === 'mission' 
                  ? 'bg-rosegold text-white shadow-sm shadow-rosegold/25' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-rose-50/50 dark:hover:bg-rosegold/10'
              }`}
            >
              {labels.mission}
            </button>
            
            <button
              onClick={() => setActiveTab('journey')}
              className={`px-4 py-2 text-xs font-sans font-medium rounded-xl transition ${
                activeTab === 'journey' 
                  ? 'bg-rosegold text-white shadow-sm shadow-rosegold/25' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-rose-50/50 dark:hover:bg-rosegold/10'
              }`}
            >
              {labels.journey}
            </button>

            <button
              onClick={() => setActiveTab('hooks')}
              className={`px-4 py-2 text-xs font-sans font-medium rounded-xl transition ${
                activeTab === 'hooks' 
                  ? 'bg-rosegold text-white shadow-sm shadow-rosegold/25' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-rose-50/50 dark:hover:bg-rosegold/10'
              }`}
            >
              {labels.hooks}
            </button>

            <button
              onClick={() => setActiveTab('community')}
              className={`px-4 py-2 text-xs font-sans font-medium rounded-xl transition ${
                activeTab === 'community' 
                  ? 'bg-rosegold text-white shadow-sm shadow-rosegold/25' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-rose-50/50 dark:hover:bg-rosegold/10'
              }`}
            >
              {labels.community}
            </button>

            <button
              onClick={() => setActiveTab('library')}
              className={`px-4 py-2 text-xs font-sans font-medium rounded-xl transition ${
                activeTab === 'library' 
                  ? 'bg-rosegold text-white shadow-sm shadow-rosegold/25' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-rose-50/50 dark:hover:bg-rosegold/10'
              }`}
            >
              {labels.library}
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 text-xs font-sans font-medium rounded-xl transition ${
                activeTab === 'profile' 
                  ? 'bg-rosegold text-white shadow-sm shadow-rosegold/25' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-rose-50/50 dark:hover:bg-rosegold/10'
              }`}
            >
              {labels.profile}
            </button>

            {/* Next Level Locking logic */}
            <button
              onClick={() => isNextLevelUnlocked && setActiveTab('nextlevel')}
              disabled={!isNextLevelUnlocked}
              className={`px-4 py-2 text-xs font-sans font-semibold rounded-xl transition flex items-center gap-1.5 ${
                activeTab === 'nextlevel'
                  ? 'bg-gradient-to-r from-accentgold to-amber-500 text-warmbrown font-bold shadow-md shadow-accentgold/20'
                  : isNextLevelUnlocked
                  ? 'text-accentgold bg-accentgold/10 hover:bg-accentgold/20'
                  : 'text-slate-300 dark:text-slate-600 bg-slate-50 dark:bg-warmbrown-light/25 cursor-not-allowed'
              }`}
            >
              {isNextLevelUnlocked ? <Sparkles className="h-3.5 w-3.5 animate-pulse text-accentgold" /> : <Lock className="h-3 w-3" />}
              <span>{labels.nextlevel}</span>
            </button>

            {isAdminUnlocked && (
              <>
                <span className="h-5 w-px bg-rose-100 dark:bg-rosegold/20 mx-2" />
                <button
                  onClick={() => setActiveTab('brand')}
                  className={`px-4 py-2 text-xs font-sans font-medium rounded-xl transition ${
                    activeTab === 'brand'
                      ? 'bg-[#B76E79] text-white shadow-sm shadow-rosegold/25 ring-1 ring-[#B76E79]/20'
                      : 'text-[#B76E79] dark:text-[#E8B4A0] hover:bg-rose-50/50 dark:hover:bg-rosegold/10 font-bold'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 text-[#D4AF37] animate-pulse" />
                    {labels.brand}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('cms')}
                  className={`px-4 py-2 text-xs font-sans font-medium rounded-xl transition ${
                    activeTab === 'cms'
                      ? 'bg-[#2C221E] dark:bg-rosegold text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-rose-50/50 dark:hover:bg-rosegold/10'
                  }`}
                >
                  {labels.cms}
                </button>
                <button
                  onClick={handleAdminLock}
                  className="p-2 rounded-xl text-slate-400 hover:text-rosegold hover:bg-rose-50/30 dark:hover:bg-rosegold/10 transition"
                  title={lang === 'pt' ? 'Sair do modo admin' : lang === 'es' ? 'Salir del modo admin' : 'Exit admin mode'}
                >
                  <Lock className="h-4 w-4" />
                </button>
              </>
            )}

            <button
              onClick={() => setActiveTab('settings')}
              className={`p-2 rounded-xl transition ${
                activeTab === 'settings'
                  ? 'bg-rosegold/15 text-rosegold dark:bg-rosegold/20 dark:text-rosegold-light'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-rose-50/30 dark:hover:bg-rosegold/10 hover:text-slate-800'
              }`}
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </button>

            {/* Inconspicuous admin entry point — not styled like a normal nav item */}
            {!isAdminUnlocked && (
              <button
                onClick={() => setShowAdminPrompt(true)}
                className="p-2 rounded-xl text-slate-300 dark:text-slate-700 hover:text-slate-400 transition opacity-50 hover:opacity-100"
                title=" "
              >
                <Lock className="h-3 w-3" />
              </button>
            )}
          </nav>

          {/* Mobile responsive toggle */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl border border-rose-150/40 dark:border-rosegold/10 text-slate-700 dark:text-slate-300 bg-white dark:bg-warmbrown shadow-sm"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

        </div>
      </header>

      {/* Mobile drop menu list */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white dark:bg-[#2C221E] border-b border-rose-100/40 dark:border-rosegold/10 overflow-hidden shadow-lg"
          >
            <div className="px-4 py-4 space-y-2 flex flex-col font-sans text-sm">
              <button
                onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
                className={`w-full py-2.5 px-4 text-left rounded-xl transition ${activeTab === 'home' ? 'bg-rosegold text-white font-bold' : 'text-slate-700 dark:text-slate-300'}`}
              >
                {labels.home}
              </button>

              <button
                onClick={() => { setActiveTab('mission'); setMobileMenuOpen(false); }}
                className={`w-full py-2.5 px-4 text-left rounded-xl transition ${activeTab === 'mission' ? 'bg-rosegold text-white font-bold' : 'text-slate-700 dark:text-slate-300'}`}
              >
                {labels.mission}
              </button>
              
              <button
                onClick={() => { setActiveTab('journey'); setMobileMenuOpen(false); }}
                className={`w-full py-2.5 px-4 text-left rounded-xl transition ${activeTab === 'journey' ? 'bg-rosegold text-white font-bold' : 'text-slate-700 dark:text-slate-300'}`}
              >
                {labels.journey}
              </button>

              <button
                onClick={() => { setActiveTab('hooks'); setMobileMenuOpen(false); }}
                className={`w-full py-2.5 px-4 text-left rounded-xl transition ${activeTab === 'hooks' ? 'bg-rosegold text-white font-bold' : 'text-slate-700 dark:text-slate-300'}`}
              >
                {labels.hooks}
              </button>

              <button
                onClick={() => { setActiveTab('community'); setMobileMenuOpen(false); }}
                className={`w-full py-2.5 px-4 text-left rounded-xl transition ${activeTab === 'community' ? 'bg-rosegold text-white font-bold' : 'text-slate-700 dark:text-slate-300'}`}
              >
                {labels.community}
              </button>

              <button
                onClick={() => { setActiveTab('library'); setMobileMenuOpen(false); }}
                className={`w-full py-2.5 px-4 text-left rounded-xl transition ${activeTab === 'library' ? 'bg-rosegold text-white font-bold' : 'text-slate-700 dark:text-slate-300'}`}
              >
                {labels.library}
              </button>

              <button
                onClick={() => { setActiveTab('profile'); setMobileMenuOpen(false); }}
                className={`w-full py-2.5 px-4 text-left rounded-xl transition ${activeTab === 'profile' ? 'bg-rosegold text-white font-bold' : 'text-slate-700 dark:text-slate-300'}`}
              >
                {labels.profile}
              </button>

              <button
                onClick={() => { if (isNextLevelUnlocked) { setActiveTab('nextlevel'); setMobileMenuOpen(false); } }}
                disabled={!isNextLevelUnlocked}
                className={`w-full py-2.5 px-4 text-left rounded-xl flex items-center justify-between transition ${
                  isNextLevelUnlocked
                    ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-bold'
                    : 'text-slate-300 dark:text-slate-600 bg-slate-50 dark:bg-warmbrown-light/10 cursor-not-allowed'
                }`}
              >
                <span>{labels.nextlevel}</span>
                {!isNextLevelUnlocked && <Lock className="h-3 w-3" />}
              </button>

              <button
                onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false); }}
                className={`w-full py-2.5 px-4 text-left rounded-xl ${activeTab === 'settings' ? 'bg-slate-900 text-white font-bold' : 'text-slate-700'}`}
              >
                {labels.settings}
              </button>

              {isAdminUnlocked && (
                <>
                  <button
                    onClick={() => { setActiveTab('brand'); setMobileMenuOpen(false); }}
                    className={`w-full py-2.5 px-4 text-left rounded-xl transition ${activeTab === 'brand' ? 'bg-[#B76E79] text-white font-bold shadow-sm' : 'text-[#B76E79] dark:text-[#E8B4A0] font-bold bg-rose-50/20 dark:bg-rosegold/5'}`}
                  >
                    ✦ {labels.brand}
                  </button>
                  <button
                    onClick={() => { setActiveTab('cms'); setMobileMenuOpen(false); }}
                    className={`w-full py-2.5 px-4 text-left rounded-xl ${activeTab === 'cms' ? 'bg-slate-900 text-white font-bold' : 'text-slate-700'}`}
                  >
                    {labels.cms}
                  </button>
                  <button
                    onClick={() => { handleAdminLock(); setMobileMenuOpen(false); }}
                    className="w-full py-2.5 px-4 text-left rounded-xl text-slate-400 text-xs"
                  >
                    {lang === 'pt' ? 'Sair do modo admin' : lang === 'es' ? 'Salir del modo admin' : 'Exit admin mode'}
                  </button>
                </>
              )}

              {!isAdminUnlocked && (
                <button
                  onClick={() => setShowAdminPrompt(true)}
                  className="w-full py-2 px-4 text-left text-[10px] text-slate-300 dark:text-slate-700"
                >
                  ·
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin unlock prompt — gates Brand Identity & Creator Studio */}
      <AnimatePresence>
        {showAdminPrompt && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-[#FAF8F5] dark:bg-[#1E1715] max-w-sm w-full rounded-3xl p-8 border border-rosegold/20 shadow-rosegold space-y-4"
            >
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-rosegold" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 font-sans">
                  {lang === 'pt' ? 'Acesso Admin' : lang === 'es' ? 'Acceso Admin' : 'Admin Access'}
                </h3>
              </div>
              <input
                type="password"
                autoFocus
                value={adminPassInput}
                onChange={(e) => { setAdminPassInput(e.target.value); setAdminPassError(false); }}
                onKeyDown={(e) => e.key === 'Enter' && handleAdminUnlock()}
                placeholder={lang === 'pt' ? 'Senha' : lang === 'es' ? 'Contraseña' : 'Passphrase'}
                className="w-full text-sm bg-white dark:bg-[#130E0D] border border-rose-100/20 dark:border-rosegold/10 focus:border-rosegold focus:outline-none focus:ring-1 focus:ring-rosegold rounded-xl p-3 text-slate-700 dark:text-slate-200"
              />
              {adminPassError && (
                <p className="text-[11px] text-red-500 font-sans">
                  {lang === 'pt' ? 'Senha incorreta.' : lang === 'es' ? 'Contraseña incorrecta.' : 'Incorrect passphrase.'}
                </p>
              )}
              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => { setShowAdminPrompt(false); setAdminPassInput(''); setAdminPassError(false); }}
                  className="px-4 py-2 text-xs font-sans font-semibold text-slate-500 hover:text-slate-700 transition cursor-pointer"
                >
                  {lang === 'pt' ? 'Cancelar' : lang === 'es' ? 'Cancelar' : 'Cancel'}
                </button>
                <button
                  onClick={handleAdminUnlock}
                  className="px-5 py-2 bg-rosegold hover:bg-[#A35D68] text-white text-xs font-sans font-bold uppercase tracking-wider rounded-xl transition cursor-pointer"
                >
                  {lang === 'pt' ? 'Entrar' : lang === 'es' ? 'Entrar' : 'Enter'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main app viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-32 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'home' && (
              <HomeView
                currentDay={activeMissionDay}
                progress={progress}
                lang={lang}
                onSelectTab={(tabId) => setActiveTab(tabId as any)}
                onLanguageChange={handleLanguageChange}
                onShowIntro={handleShowIntro}
                onUpdateProgress={updateProgress}
              />
            )}

            {activeTab === 'transformation' && (
              <MyTransformationView
                progress={progress}
                days={days}
                lang={lang}
                onBackToHome={() => setActiveTab('home')}
              />
            )}

            {activeTab === 'mission' && (
              <DailyMissionView
                currentDay={activeMissionDay}
                progress={progress}
                lang={lang}
                onCompleteDay={handleCompleteDay}
                onToggleFavorite={handleToggleFavorite}
                onCopyHook={handleCopyHook}
                onTriggerSos={() => setActiveTab('sos')}
              />
            )}

            {activeTab === 'journey' && (
              <JourneyView
                days={days}
                progress={progress}
                lang={lang}
                onSelectDay={handleSelectDay}
                onShowIntro={handleShowIntro}
                activeJourneyId={progress.activeJourneyId || 'destrave_visibilidade'}
                onSwitchJourney={(journeyId) => {
                  updateProgress({
                    ...progress,
                    activeJourneyId: journeyId
                  });
                }}
              />
            )}

            {activeTab === 'hooks' && (
              <HookBankView
                days={days}
                progress={progress}
                lang={lang}
                onToggleFavorite={handleToggleFavorite}
                onCopyHook={handleCopyHook}
              />
            )}

            {activeTab === 'sos' && (
              <EmotionalSosView
                lang={lang}
                onBackToMission={() => setActiveTab('home')}
                progress={progress}
                onUpdateProgress={updateProgress}
              />
            )}

            {activeTab === 'nextlevel' && (
              <NextLevelView
                progress={progress}
                lang={lang}
              />
            )}

            {activeTab === 'cms' && isAdminUnlocked && (
              <CmsView
                days={days}
                lang={lang}
                onSaveDays={handleSaveDays}
                onResetDays={handleResetDays}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                progress={progress}
                lang={lang}
                onLanguageChange={handleLanguageChange}
                onResetProgress={handleResetProgress}
                onQuickSimulateUnlockDay30={handleQuickSimulateUnlockDay30}
                onQuickSimulateCompletion={handleQuickSimulateCompletion}
                theme={theme}
                onThemeChange={handleThemeChange}
                onUpdateProgress={updateProgress}
              />
            )}

            {activeTab === 'community' && (
              <CommunityView lang={lang} />
            )}

            {activeTab === 'library' && (
              <LibraryView
                lang={lang}
                progress={progress}
                onUpdateProgress={updateProgress}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileView
                lang={lang}
                progress={progress}
                days={days}
                onUpdateProgress={updateProgress}
              />
            )}

            {activeTab === 'brand' && isAdminUnlocked && (
              <BrandIdentityView
                lang={lang}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Dynamic Chapter Milestone & Celebration Overlays */}
        <AnimatePresence>
          {chapterMilestone && (
            <ChapterMilestoneOverlay
              type={chapterMilestone.type}
              chapter={chapters.find(c => c.id === chapterMilestone.chapterId) || chapters[0]}
              lang={lang}
              userReflection={chapterMilestone.userReflection}
              grammarPreference={progress.grammarPreference || 'neutral'}
              onClose={handleCloseMilestone}
            />
          )}
        </AnimatePresence>

        {/* Floating Renata OS Action Button (replaces the old floating SOS button) */}
        <RenataOSChat
          lang={lang}
          progress={progress}
          currentDayNumber={focusedDayNumber}
          onOpenSos={() => setActiveTab('sos')}
        />

        {/* Ecosystem Bottom Navigation Bar */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-md bg-white/95 dark:bg-[#2C221E]/95 backdrop-blur-md border border-rose-100/40 dark:border-rosegold/15 py-2.5 px-4 rounded-full shadow-2xl flex items-center justify-around">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 transition-all relative py-1 px-2.5 rounded-full ${
              activeTab === 'home'
                ? 'text-rosegold dark:text-rosegold-light scale-105 font-bold'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <Home className="h-4.5 w-4.5" />
            <span className="text-[9px] tracking-wider font-sans uppercase font-medium">{labels.home}</span>
            {activeTab === 'home' && (
              <motion.div layoutId="activeDot" className="absolute -bottom-1 w-1 h-1 bg-rosegold dark:bg-rosegold-light rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('journey')}
            className={`flex flex-col items-center gap-1 transition-all relative py-1 px-2.5 rounded-full ${
              activeTab === 'journey'
                ? 'text-rosegold dark:text-rosegold-light scale-105 font-bold'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <Compass className="h-4.5 w-4.5" />
            <span className="text-[9px] tracking-wider font-sans uppercase font-medium">{labels.journey}</span>
            {activeTab === 'journey' && (
              <motion.div layoutId="activeDot" className="absolute -bottom-1 w-1 h-1 bg-rosegold dark:bg-rosegold-light rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('community')}
            className={`flex flex-col items-center gap-1 transition-all relative py-1 px-2.5 rounded-full ${
              activeTab === 'community'
                ? 'text-rosegold dark:text-rosegold-light scale-105 font-bold'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <Users className="h-4.5 w-4.5" />
            <span className="text-[9px] tracking-wider font-sans uppercase font-medium">{labels.community}</span>
            {activeTab === 'community' && (
              <motion.div layoutId="activeDot" className="absolute -bottom-1 w-1 h-1 bg-rosegold dark:bg-rosegold-light rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('library')}
            className={`flex flex-col items-center gap-1 transition-all relative py-1 px-2.5 rounded-full ${
              activeTab === 'library'
                ? 'text-rosegold dark:text-rosegold-light scale-105 font-bold'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <BookOpen className="h-4.5 w-4.5" />
            <span className="text-[9px] tracking-wider font-sans uppercase font-medium">{labels.library}</span>
            {activeTab === 'library' && (
              <motion.div layoutId="activeDot" className="absolute -bottom-1 w-1 h-1 bg-rosegold dark:bg-rosegold-light rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-1 transition-all relative py-1 px-2.5 rounded-full ${
              activeTab === 'profile'
                ? 'text-rosegold dark:text-rosegold-light scale-105 font-bold'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <User className="h-4.5 w-4.5" />
            <span className="text-[9px] tracking-wider font-sans uppercase font-medium">{labels.profile}</span>
            {activeTab === 'profile' && (
              <motion.div layoutId="activeDot" className="absolute -bottom-1 w-1 h-1 bg-rosegold dark:bg-rosegold-light rounded-full" />
            )}
          </button>
        </div>

      </main>

      {/* Minimalistic Craft Footer */}
      <footer className="py-8 border-t border-rose-100/10 dark:border-rosegold/5 bg-[#FAF6F2] dark:bg-[#3A2A24] text-center text-xs text-slate-400 dark:text-slate-500 font-sans select-none">
        <p className="tracking-wide">© 2026 RenaSer • {taglines[lang]} • Craftsmanship &amp; Editorial Intent</p>
      </footer>

    </div>
  );
}
