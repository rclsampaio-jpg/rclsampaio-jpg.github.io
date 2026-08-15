/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Compass, Star, Settings, ShieldAlert,
  Sparkles, Award, Lock, Menu, X, ArrowUpRight, Home, Users, User, BookOpen
} from 'lucide-react';

import { MissionDay, Language, UserProgress } from './types';
import {
  loadDaysFromStorage,
  saveDaysToStorage,
  loadUserProgressFromStorage,
  generateInitialDays
} from './data/templateData';

// Chapter and Overlay Imports
import { getChapterForDay, chapters } from './data/chaptersData';
import ChapterMilestoneOverlay from './components/ChapterMilestoneOverlay';

// Subcomponents — the core daily-use screens stay eager (loaded in the main
// bundle); everything opened less often (CMS, brand style guide, community,
// library, transformation recap, next-level unlock) is code-split via
// React.lazy so first paint doesn't have to download all of it up front.
import HomeView from './components/HomeView';
import DailyMissionView from './components/DailyMissionView';
import JourneyView from './components/JourneyView';
import EmotionalSosView from './components/EmotionalSosView';
import SettingsView from './components/SettingsView';
import ProfileView from './components/ProfileView';
import RenaSerLogo from './components/RenaSerLogo';
import RenataOSChat from './components/RenataOSChat';
import DayCompletionOverlay from './components/DayCompletionOverlay';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SiteContentProvider, useSiteContent } from './lib/siteContent';
import EditModeToggle from './components/editable/EditModeToggle';
import LoginView from './components/auth/LoginView';
import SignupView from './components/auth/SignupView';
import ResetPasswordView from './components/auth/ResetPasswordView';
import InviteGateView from './components/auth/InviteGateView';
import { supabase } from './lib/supabase';
import { useProgressSync, clearLocalProgressCache } from './hooks/useProgressSync';

const CmsView = lazy(() => import('./components/CmsView'));
const NextLevelView = lazy(() => import('./components/NextLevelView'));
const MyTransformationView = lazy(() => import('./components/MyTransformationView'));
const CommunityView = lazy(() => import('./components/CommunityView'));
const LibraryView = lazy(() => import('./components/LibraryView'));
const ProfessionalAreaView = lazy(() => import('./components/ProfessionalAreaView'));

import { adaptMessage, resolveGrammarPreference } from './utils/grammar';
import { getLocalDateISO, getUnlockAnchorDateISO } from './utils/date';
import { useSystem } from './engines/SystemEngine';

type TabId = 'home' | 'mission' | 'journey' | 'sos' | 'nextlevel' | 'cms' | 'settings' | 'transformation' | 'community' | 'library' | 'profile' | 'professional';

export default function App() {
  return (
    <AuthProvider>
      <SiteContentProvider>
        <AppContent />
      </SiteContentProvider>
    </AuthProvider>
  );
}

function AppContent() {
  const system = useSystem();

  const { user, session, loading: authLoading, signOut, passwordRecovery } = useAuth();
  const inviteCodeFromUrl = new URLSearchParams(window.location.search).get('codigo');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>(inviteCodeFromUrl ? 'signup' : 'login');

  // Google sign-in creates the auth.users row with no invite check at all
  // (unlike email/password signup, which validates the code first) — so a
  // Google-authenticated user with no `profiles` row yet hasn't actually
  // redeemed an invite. Gate them behind InviteGateView until they do.
  // Only checked for the google provider: email/password accounts are
  // trusted here since validate-invite-and-signup already gated them.
  const [needsInviteRedeem, setNeedsInviteRedeem] = useState(false);
  const [inviteCheckDone, setInviteCheckDone] = useState(false);
  useEffect(() => {
    if (!user) {
      setInviteCheckDone(false);
      return;
    }
    const provider = user.app_metadata?.provider;
    if (provider !== 'google') {
      setNeedsInviteRedeem(false);
      setInviteCheckDone(true);
      return;
    }
    (async () => {
      const { data } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle();
      setNeedsInviteRedeem(!data);
      setInviteCheckDone(true);
    })();
  }, [user?.id]);

  const { progress, updateProgress, syncStatus } = useProgressSync(loadUserProgressFromStorage());
  const [days, setDays] = useState<MissionDay[]>(() => loadDaysFromStorage(progress.journeyStartDate));
  const loadedJourneyStartDate = useRef(progress.journeyStartDate);

  // Cross-device sync: if the cloud replaces `progress` with a different
  // journeyStartDate (e.g. first login on a new device), recompute the
  // journey calendar instead of keeping the stale local one (I3).
  useEffect(() => {
    if (progress.journeyStartDate === loadedJourneyStartDate.current) return;
    loadedJourneyStartDate.current = progress.journeyStartDate;
    setDays(loadDaysFromStorage(progress.journeyStartDate));
  }, [progress.journeyStartDate]);

  const handleSignOut = async () => {
    await signOut();
    clearLocalProgressCache();
  };
  const [lang, setLang] = useState<Language>('pt'); // Default language
  // Excludes 'cms' deliberately — that's admin-gated and re-entering it
  // without re-unlocking would be confusing; it always falls back to Home.
  const VALID_TAB_IDS: TabId[] = ['home', 'mission', 'journey', 'sos', 'nextlevel', 'transformation', 'community', 'library', 'profile', 'settings', 'professional'];
  const [activeTab, setActiveTabState] = useState<TabId>(() => {
    // sessionStorage (not localStorage) on purpose: a reload/refresh within
    // the same open session resumes on the same tab, but fully closing and
    // reopening the app (a new session) always lands back on Home.
    const stored = sessionStorage.getItem('renaser_active_tab') as TabId | null;
    return stored && VALID_TAB_IDS.includes(stored) ? stored : 'home';
  });
  // Refreshing the page used to always drop the user back on Home even if
  // they were mid-Journey/Library/etc — persist the tab so a reload resumes
  // where they left off instead of feeling like lost progress.
  const setActiveTab = (tab: TabId) => {
    setActiveTabState(tab);
    sessionStorage.setItem('renaser_active_tab', tab);
  };
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Switching tabs otherwise keeps whatever scroll position the previous
  // tab was left at, so the new screen can render already scrolled past
  // its own top content — jarring on mobile, where every tab switch felt
  // like it "started scrolled down."
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  // Admin-only gate for Brand Identity & Creator Studio (CMS).
  // NOTE: this is a client-side deterrent, not real security — anyone who reads
  // the deployed JS bundle can find ADMIN_PASSPHRASE. Change it below if needed.
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(() => localStorage.getItem('renaser_admin_unlocked') === 'true');
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);
  const [adminPassInput, setAdminPassInput] = useState('');
  const [adminPassError, setAdminPassError] = useState(false);
  const ADMIN_PASSPHRASE = 'Tofly3254$$';

  const handleAdminUnlock = () => {
    if (adminPassInput === ADMIN_PASSPHRASE) {
      setIsAdminUnlocked(true);
      localStorage.setItem('renaser_admin_unlocked', 'true');
      setShowAdminPrompt(false);
      setAdminPassInput('');
      setAdminPassError(false);
      setActiveTab('cms');
    } else {
      setAdminPassError(true);
    }
  };

  const { setEditMode } = useSiteContent();

  const handleAdminLock = () => {
    setIsAdminUnlocked(false);
    localStorage.removeItem('renaser_admin_unlocked');
    setEditMode(false);
    if (activeTab === 'cms') {
      setActiveTab('home');
    }
  };

  // Gate for the Destrave (Área da Profissional) tab — produto separado da
  // jornada de 30 dias, vendido à parte. Código de uso único, validado no
  // servidor via redeem-professional-code (mesmo padrão de admin-generate-
  // invite/redeem-invite). O flag real fica em profiles.professional_unlocked
  // (checado abaixo), o localStorage é só um fallback instantâneo no mesmo
  // dispositivo que resgatou o código.
  const [isProfessionalUnlocked, setIsProfessionalUnlocked] = useState(
    () => localStorage.getItem('renaser_professional_unlocked') === 'true'
  );
  const [showProfessionalPrompt, setShowProfessionalPrompt] = useState(false);
  const [professionalPassInput, setProfessionalPassInput] = useState('');
  const [professionalPassError, setProfessionalPassError] = useState(false);
  const [professionalUnlocking, setProfessionalUnlocking] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!user) return;
    supabase
      .from('profiles')
      .select('professional_unlocked')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled || error) return;
        if (data?.professional_unlocked) {
          setIsProfessionalUnlocked(true);
          localStorage.setItem('renaser_professional_unlocked', 'true');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleProfessionalUnlock = async () => {
    const code = professionalPassInput.trim();
    if (!code) return;
    setProfessionalUnlocking(true);
    setProfessionalPassError(false);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
      const res = await fetch(`${supabaseUrl}/functions/v1/redeem-professional-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${session?.access_token ?? ''}`,
        },
        body: JSON.stringify({ code }),
      });
      const json = await res.json();
      if (json.success) {
        setIsProfessionalUnlocked(true);
        localStorage.setItem('renaser_professional_unlocked', 'true');
        setShowProfessionalPrompt(false);
        setProfessionalPassInput('');
        setProfessionalPassError(false);
        setActiveTab('professional');
      } else {
        setProfessionalPassError(true);
      }
    } catch {
      setProfessionalPassError(true);
    } finally {
      setProfessionalUnlocking(false);
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

  // Plain per-day completion celebration (non-milestone days)
  const [dayCelebration, setDayCelebration] = useState<number | null>(null);

  // Session Opening Splash Screen State — skipped entirely for first-time
  // setup (not onboarded yet), since HomeView's own "Começar Jornada" step
  // already opens the flow with its own logo + flying butterfly. Showing
  // this screen too just added ~6.5s of waiting before setup could start.
  // Returning users (already onboarded) still see it on every fresh login.
  const [showOpeningSplash, setShowOpeningSplash] = useState(() => {
    return localStorage.getItem('renaser_onboarded') === 'true';
  });

  useEffect(() => {
    if (!showOpeningSplash) return;
    // 2.5s, not 6.5s — returning users hit this screen on every login before
    // even reaching the "Começar Jornada de Hoje" gate, so a long wait here
    // is pure friction, not a first-impression moment.
    const timer = setTimeout(() => {
      setShowOpeningSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Daily Gate Splash Screen State — was resetting on every page refresh
  // (not just once per day as intended), which for an already-onboarded
  // user reads as "the whole app restarting" every time they reload.
  // Persist the dismissal per calendar day so refreshing later the same
  // day doesn't show it again.
  const dailyGateDismissKey = `renaser_daily_gate_dismissed_${getLocalDateISO()}`;
  const [hasDismissedDailyGate, setHasDismissedDailyGate] = useState(() => {
    const isOnboarded = localStorage.getItem('renaser_onboarded') === 'true';
    if (!isOnboarded) return true; // If not onboarded yet, show onboarding first, not this gate.
    return localStorage.getItem(dailyGateDismissKey) === 'true';
  });
  const dismissDailyGate = () => {
    setHasDismissedDailyGate(true);
    localStorage.setItem(dailyGateDismissKey, 'true');
  };

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
  // Categoria da Biblioteca a abrir direto, usada quando outra tela (ex:
  // Destrave/Referência) leva a pessoa pra lá já filtrado, em vez de cair
  // em "Todos" e ela ter que procurar. Nav normal da Biblioteca reseta isso.
  const [libraryInitialCategory, setLibraryInitialCategory] = useState<string | undefined>(undefined);

  const [focusedDayNumber, setFocusedDayNumber] = useState<number>(() => {
    const defaultProgress = loadUserProgressFromStorage();
    return defaultProgress.currentDay <= 30 ? defaultProgress.currentDay : 30;
  });

  const activeMissionDay = days.find(d => d.dayNumber === focusedDayNumber) || days[0];

  // Início e Missão Diária deixaram de ser abas separadas: Início mostra a
  // missão do dia até ela ser concluída, e só então vira o painel de
  // progresso (árvore, etc). Isso só se aplica ao dia real atual — navegar
  // pra um dia passado (Jornada) ou usar as setas de admin continua
  // mostrando o conteúdo daquele dia específico, não o painel.
  // HomeView também é dono do wizard de onboarding inteiro, então quem
  // ainda não passou por ele sempre vê o HomeView primeiro, nunca a
  // Missão direto, senão o wizard nunca apareceria pra usuária nova.
  // Precisa ser state (não leitura direta do localStorage) pra reagir na
  // hora em que o onboarding termina — senão a tela final do HomeView
  // (hero + "Ir pra Missão Diária") continua aparecendo até o próximo
  // re-render do App, mesmo já devendo mostrar a Missão direto.
  const [hasOnboarded, setHasOnboarded] = useState(
    () => localStorage.getItem('renaser_onboarded') === 'true'
  );
  const isTodayDoneOnHome = !hasOnboarded
    || (activeMissionDay.dayNumber === progress.currentDay
      && progress.completionHistory.includes(progress.currentDay));

  // Chapter Introduction overlay used to auto-trigger for new chapters
  // (e.g. showing "DESPERTAR" the moment someone opened the link for the
  // first time), which interrupted people before they reached the actual
  // app. Removed the auto-trigger — it's still available on demand via the
  // "Reouvir Alinhamento do Capítulo" button (handleShowIntro below).

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
  const handleCompleteDay = (reflectionText: string, videoLink: string, mood?: string) => {
    const dayNum = focusedDayNumber;
    if (progress.completionHistory.includes(dayNum)) return; // Already completed

    const history = [...progress.completionHistory, dayNum];
    
    // Streaks logic
    const todayStr = getLocalDateISO();
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
      dayUnlockAnchorDate: getUnlockAnchorDateISO(),
      reflections: {
        ...progress.reflections,
        [dayNum]: reflectionText
      },
      videoLinks: {
        ...progress.videoLinks,
        [dayNum]: videoLink
      },
      journalMoods: {
        ...progress.journalMoods,
        [dayNum]: mood || 'neutral'
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
    } else {
      // Regular day: a lighter congratulations screen
      setDayCelebration(dayNum);
    }
  };

  // Correct the mood recorded for an already-completed day
  const handleUpdateMood = (dayNum: number, mood: string) => {
    updateProgress({
      ...progress,
      journalMoods: {
        ...progress.journalMoods,
        [dayNum]: mood
      }
    });
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
    const initial = generateInitialDays(progress.journeyStartDate);
    setDays(initial);
    saveDaysToStorage(initial);
    system.creatorSystem.resetDays();
  };

  // Settings: Reset User Data
  const handleResetProgress = () => {
    localStorage.removeItem('renaser_onboarded');
    setHasDismissedDailyGate(true); // make sure onboarding isn't blocked by daily gate!
    const todayISO = getLocalDateISO();
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
      journeyStartDate: todayISO,
      displayName: progress.displayName
    };
    updateProgress(defaultProgress);
    const restartedDays = generateInitialDays(todayISO);
    setDays(restartedDays);
    saveDaysToStorage(restartedDays);
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
      lastActiveDate: getLocalDateISO(),
      dayUnlockAnchorDate: getUnlockAnchorDateISO()
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
      lastActiveDate: getLocalDateISO(),
      dayUnlockAnchorDate: getUnlockAnchorDateISO()
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
      sos: 'SOS Emocional',
      nextlevel: 'Próximo Nível',
      cms: 'Creator Studio',
      settings: 'Ajustes',
      locked: 'Bloqueado',
      community: 'Comunidade',
      library: 'Biblioteca',
      profile: 'Meu Ser',
      professional: 'Destrave',
    },
    en: {
      home: 'Home',
      mission: 'Daily Mission',
      journey: '30-Day Journey',
      sos: 'Emotional SOS',
      nextlevel: 'Next Level',
      cms: 'Creator Studio',
      settings: 'Settings',
      locked: 'Locked',
      community: 'Community',
      library: 'Library',
      profile: 'My Portal',
      professional: 'Destrave',
    },
    es: {
      home: 'Inicio',
      mission: 'Misión Diaria',
      journey: 'Viaje 30 Días',
      sos: 'SOS Emocional',
      nextlevel: 'Siguiente Nivel',
      cms: 'Creator Studio',
      settings: 'Ajustes',
      locked: 'Bloqueado',
      community: 'Comunidad',
      library: 'Biblioteca',
      profile: 'Mi Portal',
      professional: 'Destrave',
    }
  }[lang];

  const isNextLevelUnlocked = progress.completionHistory.includes(30);

  if (authLoading) return null;

  // The user IS authenticated at this point (Supabase logs them in via the
  // recovery link's token), but they came from a "forgot password" email —
  // show the "set new password" screen instead of the normal app until
  // they actually pick one, regardless of the !user check below.
  if (passwordRecovery) {
    return <ResetPasswordView />;
  }

  if (!user) {
    return authMode === 'login' ? (
      <LoginView onSwitchToSignup={() => setAuthMode('signup')} />
    ) : (
      <SignupView
        inviteCodeFromUrl={inviteCodeFromUrl}
        onSwitchToLogin={() => setAuthMode('login')}
        onSignupSuccess={() => setAuthMode('login')}
      />
    );
  }

  if (user && !inviteCheckDone) return null;

  if (needsInviteRedeem) {
    return (
      <InviteGateView
        onUnlocked={() => setNeedsInviteRedeem(false)}
      />
    );
  }

  if (showOpeningSplash) {
    return (
      <div className="fixed inset-0 z-50 bg-[#FAF8F5] dark:bg-ink flex flex-col justify-center items-center p-6 text-center select-none overflow-hidden transition-colors duration-500">
        {/* Soft Ambient Gold Blurs — dark mode drops them, Luxo Contido stays flat */}
        <div className="absolute top-1/3 left-1/3 h-96 w-96 bg-rosegold/5 dark:hidden blur-3xl rounded-full" />
        <div className="absolute bottom-1/3 right-1/3 h-96 w-96 bg-accentgold/5 dark:hidden blur-3xl rounded-full" />

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
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
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
      <div className="fixed inset-0 z-50 bg-[#FAF8F5] dark:bg-ink text-slate-900 dark:text-ink-text flex flex-col justify-center items-center p-6 text-center select-none overflow-hidden transition-colors duration-500">

        {/* Soft Background Blur Spots — dropped in dark mode, Luxo Contido stays flat */}
        <div className="absolute top-1/4 left-1/4 h-80 w-80 bg-rosegold/5 dark:hidden blur-3xl rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 h-80 w-80 bg-accentgold/5 dark:hidden blur-3xl rounded-full" />

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
            <span className="text-xs font-sans text-slate-400 dark:text-ink-muted uppercase tracking-widest block font-medium">
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
            <p className="text-base sm:text-lg text-slate-600 dark:text-ink-muted font-serif italic max-w-sm mx-auto leading-relaxed">
              "{adaptMessage(gateText.promise, resolveGrammarPreference(progress.grammarPreference), lang)}"
            </p>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={dismissDailyGate}
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
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-ink text-slate-900 dark:text-ink-text font-sans flex flex-col selection:bg-rosegold/10 selection:text-rosegold transition-colors duration-350 butterfly-bg">
      <EditModeToggle isAdminUnlocked={isAdminUnlocked} />

      {/* Brand Elegant Top Header bar. Dark mode: flat ink surface, no
          blur/glass (Opção B — Luxo Contido, see BrandIdentityView →
          Paleta & Materiais). */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-ink-raised backdrop-blur-md dark:backdrop-blur-none border-b border-rose-100/30 dark:border-ink-hairline shadow-rosegold dark:shadow-none">
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
                  ? 'bg-rosegold text-white shadow-sm shadow-rosegold/25 dark:bg-transparent dark:border dark:border-rosegold-light dark:text-rosegold-light dark:shadow-none' 
                  : 'text-slate-600 dark:text-ink-muted hover:bg-rose-50/50 dark:hover:bg-rosegold-light/10'
              }`}
            >
              {labels.home}
            </button>

            <button
              onClick={() => setActiveTab('journey')}
              className={`px-4 py-2 text-xs font-sans font-medium rounded-xl transition ${
                activeTab === 'journey' 
                  ? 'bg-rosegold text-white shadow-sm shadow-rosegold/25 dark:bg-transparent dark:border dark:border-rosegold-light dark:text-rosegold-light dark:shadow-none'
                  : 'text-slate-600 dark:text-ink-muted hover:bg-rose-50/50 dark:hover:bg-rosegold-light/10'
              }`}
            >
              {labels.journey}
            </button>

            <button
              onClick={() => setActiveTab('community')}
              className={`px-4 py-2 text-xs font-sans font-medium rounded-xl transition ${
                activeTab === 'community' 
                  ? 'bg-rosegold text-white shadow-sm shadow-rosegold/25 dark:bg-transparent dark:border dark:border-rosegold-light dark:text-rosegold-light dark:shadow-none'
                  : 'text-slate-600 dark:text-ink-muted hover:bg-rose-50/50 dark:hover:bg-rosegold-light/10'
              }`}
            >
              {labels.community}
            </button>

            <button
              onClick={() => { setLibraryInitialCategory(undefined); setActiveTab('library'); }}
              className={`px-4 py-2 text-xs font-sans font-medium rounded-xl transition ${
                activeTab === 'library'
                  ? 'bg-rosegold text-white shadow-sm shadow-rosegold/25'
                  : 'text-slate-600 dark:text-ink-muted hover:bg-rose-50/50 dark:hover:bg-rosegold/10'
              }`}
            >
              {labels.library}
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 text-xs font-sans font-medium rounded-xl transition ${
                activeTab === 'profile'
                  ? 'bg-rosegold text-white shadow-sm shadow-rosegold/25'
                  : 'text-slate-600 dark:text-ink-muted hover:bg-rose-50/50 dark:hover:bg-rosegold/10'
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
                  : 'text-slate-300 dark:text-ink-muted bg-slate-50 dark:bg-warmbrown-light/25 cursor-not-allowed'
              }`}
            >
              {isNextLevelUnlocked ? <Sparkles className="h-3.5 w-3.5 animate-pulse text-accentgold" /> : <Lock className="h-3 w-3" />}
              <span>{labels.nextlevel}</span>
            </button>

            {/* Destrave (Área da Profissional) — produto separado, gate por código */}
            <button
              onClick={() => isProfessionalUnlocked ? setActiveTab('professional') : setShowProfessionalPrompt(true)}
              className={`px-4 py-2 text-xs font-sans font-semibold rounded-xl transition flex items-center gap-1.5 ${
                activeTab === 'professional'
                  ? 'bg-rosegold text-white shadow-sm shadow-rosegold/25 dark:bg-transparent dark:border dark:border-rosegold-light dark:text-rosegold-light dark:shadow-none'
                  : isProfessionalUnlocked
                  ? 'text-rosegold dark:text-rosegold-light bg-rosegold/10 hover:bg-rosegold/20'
                  : 'text-slate-500 dark:text-ink-muted hover:bg-rose-50/50 dark:hover:bg-rosegold-light/10'
              }`}
            >
              {!isProfessionalUnlocked && <Lock className="h-3 w-3" />}
              <span>{labels.professional}</span>
            </button>

            {isAdminUnlocked && (
              <>
                <span className="h-5 w-px bg-rose-100 dark:bg-ink-hairline mx-2" />
                <button
                  onClick={() => setActiveTab('cms')}
                  className={`px-4 py-2 text-xs font-sans font-medium rounded-xl transition ${
                    activeTab === 'cms'
                      ? 'bg-[#2C221E] text-white shadow-sm dark:bg-transparent dark:border dark:border-rosegold-light dark:text-rosegold-light dark:shadow-none'
                      : 'text-slate-600 dark:text-ink-muted hover:bg-rose-50/50 dark:hover:bg-rosegold-light/10'
                  }`}
                >
                  {labels.cms}
                </button>
                <button
                  onClick={handleAdminLock}
                  className="p-2 rounded-xl text-slate-400 dark:text-ink-muted hover:text-rosegold dark:hover:text-rosegold-light hover:bg-rose-50/30 dark:hover:bg-rosegold-light/10 transition"
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
                  ? 'bg-rosegold/15 text-rosegold dark:bg-transparent dark:border dark:border-rosegold-light dark:text-rosegold-light'
                  : 'text-slate-500 dark:text-ink-muted hover:bg-rose-50/30 dark:hover:bg-rosegold-light/10 hover:text-slate-800 dark:hover:text-ink-text'
              }`}
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </button>

            {/* Inconspicuous admin entry point — not styled like a normal nav item */}
            {!isAdminUnlocked && (
              <button
                onClick={() => setShowAdminPrompt(true)}
                className="p-2 rounded-xl text-slate-300 dark:text-ink-hairline hover:text-slate-400 dark:hover:text-ink-muted transition opacity-50 hover:opacity-100"
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
              className="p-2.5 rounded-xl border border-rose-150/40 dark:border-ink-hairline text-slate-700 dark:text-ink-text bg-white dark:bg-ink-raised shadow-sm dark:shadow-none"
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
            className="lg:hidden bg-white dark:bg-ink-raised border-b border-rose-100/40 dark:border-ink-hairline overflow-hidden shadow-lg dark:shadow-none"
          >
            <div className="px-4 py-4 space-y-2 flex flex-col font-sans text-sm">
              <button
                onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
                className={`w-full py-2.5 px-4 text-left rounded-xl transition ${activeTab === 'home' ? 'bg-rosegold text-white font-bold dark:bg-transparent dark:border dark:border-rosegold-light dark:text-rosegold-light' : 'text-slate-700 dark:text-ink-muted'}`}
              >
                {labels.home}
              </button>

              <button
                onClick={() => { setActiveTab('journey'); setMobileMenuOpen(false); }}
                className={`w-full py-2.5 px-4 text-left rounded-xl transition ${activeTab === 'journey' ? 'bg-rosegold text-white font-bold dark:bg-transparent dark:border dark:border-rosegold-light dark:text-rosegold-light' : 'text-slate-700 dark:text-ink-muted'}`}
              >
                {labels.journey}
              </button>

              <button
                onClick={() => { setActiveTab('community'); setMobileMenuOpen(false); }}
                className={`w-full py-2.5 px-4 text-left rounded-xl transition ${activeTab === 'community' ? 'bg-rosegold text-white font-bold dark:bg-transparent dark:border dark:border-rosegold-light dark:text-rosegold-light' : 'text-slate-700 dark:text-ink-muted'}`}
              >
                {labels.community}
              </button>

              <button
                onClick={() => { setLibraryInitialCategory(undefined); setActiveTab('library'); setMobileMenuOpen(false); }}
                className={`w-full py-2.5 px-4 text-left rounded-xl transition ${activeTab === 'library' ? 'bg-rosegold text-white font-bold dark:bg-transparent dark:border dark:border-rosegold-light dark:text-rosegold-light' : 'text-slate-700 dark:text-ink-muted'}`}
              >
                {labels.library}
              </button>

              <button
                onClick={() => { setActiveTab('profile'); setMobileMenuOpen(false); }}
                className={`w-full py-2.5 px-4 text-left rounded-xl transition ${activeTab === 'profile' ? 'bg-rosegold text-white font-bold dark:bg-transparent dark:border dark:border-rosegold-light dark:text-rosegold-light' : 'text-slate-700 dark:text-ink-muted'}`}
              >
                {labels.profile}
              </button>

              <button
                onClick={() => { if (isNextLevelUnlocked) { setActiveTab('nextlevel'); setMobileMenuOpen(false); } }}
                disabled={!isNextLevelUnlocked}
                className={`w-full py-2.5 px-4 text-left rounded-xl flex items-center justify-between transition ${
                  isNextLevelUnlocked
                    ? 'bg-amber-100 dark:bg-transparent dark:border dark:border-amber-400/60 text-amber-800 dark:text-amber-300 font-bold'
                    : 'text-slate-300 dark:text-ink-hairline bg-slate-50 dark:bg-transparent cursor-not-allowed'
                }`}
              >
                <span>{labels.nextlevel}</span>
                {!isNextLevelUnlocked && <Lock className="h-3 w-3" />}
              </button>

              <button
                onClick={() => {
                  if (isProfessionalUnlocked) { setActiveTab('professional'); setMobileMenuOpen(false); }
                  else { setShowProfessionalPrompt(true); setMobileMenuOpen(false); }
                }}
                className="w-full py-2.5 px-4 text-left rounded-xl flex items-center justify-between transition bg-rosegold/10 text-rosegold dark:text-rosegold-light font-bold"
              >
                <span>{labels.professional}</span>
                {!isProfessionalUnlocked && <Lock className="h-3 w-3" />}
              </button>

              <button
                onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false); }}
                className={`w-full py-2.5 px-4 text-left rounded-xl ${activeTab === 'settings' ? 'bg-slate-900 dark:bg-transparent dark:border dark:border-rosegold-light dark:text-rosegold-light text-white font-bold' : 'text-slate-700 dark:text-ink-muted'}`}
              >
                {labels.settings}
              </button>

              {isAdminUnlocked && (
                <>
                  <button
                    onClick={() => { setActiveTab('cms'); setMobileMenuOpen(false); }}
                    className={`w-full py-2.5 px-4 text-left rounded-xl ${activeTab === 'cms' ? 'bg-slate-900 dark:bg-transparent dark:border dark:border-rosegold-light dark:text-rosegold-light text-white font-bold' : 'text-slate-700 dark:text-ink-muted'}`}
                  >
                    {labels.cms}
                  </button>
                  <button
                    onClick={() => { handleAdminLock(); setMobileMenuOpen(false); }}
                    className="w-full py-2.5 px-4 text-left rounded-xl text-slate-400 dark:text-ink-muted text-xs"
                  >
                    {lang === 'pt' ? 'Sair do modo admin' : lang === 'es' ? 'Salir del modo admin' : 'Exit admin mode'}
                  </button>
                </>
              )}

              {!isAdminUnlocked && (
                <button
                  onClick={() => setShowAdminPrompt(true)}
                  className="w-full py-2 px-4 text-left text-[10px] text-slate-300 dark:text-ink-hairline"
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
              className="bg-[#FAF8F5] dark:bg-ink-raised max-w-sm w-full rounded-3xl p-8 border border-rosegold/20 dark:border-ink-hairline shadow-rosegold dark:shadow-none space-y-4"
            >
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-rosegold dark:text-rosegold-light" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-ink-text font-sans">
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
                className="w-full text-sm bg-white dark:bg-transparent dark:border-0 dark:border-b dark:rounded-none border border-rose-100/20 dark:border-ink-hairline focus:border-rosegold dark:focus:border-rosegold-light focus:outline-none focus:ring-1 dark:focus:ring-0 focus:ring-rosegold rounded-xl p-3 text-slate-700 dark:text-ink-text"
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
                  className="px-5 py-2 bg-rosegold hover:bg-[#A35D68] text-white dark:bg-transparent dark:border dark:border-rosegold-light dark:text-rosegold-light dark:hover:bg-rosegold-light/10 text-xs font-sans font-bold uppercase tracking-wider rounded-xl transition cursor-pointer"
                >
                  {lang === 'pt' ? 'Entrar' : lang === 'es' ? 'Entrar' : 'Enter'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Professional unlock prompt — gates the Destrave (Área da Profissional) tab */}
      <AnimatePresence>
        {showProfessionalPrompt && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-[#FAF8F5] dark:bg-ink-raised max-w-sm w-full rounded-3xl p-8 border border-rosegold/20 dark:border-ink-hairline shadow-rosegold dark:shadow-none space-y-4"
            >
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-rosegold dark:text-rosegold-light" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-ink-text font-sans">
                  {lang === 'pt' ? 'Acesso Destrave' : lang === 'es' ? 'Acceso Destrave' : 'Destrave Access'}
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-ink-muted font-sans leading-relaxed">
                {lang === 'pt'
                  ? 'Essa área é um produto separado da jornada de 30 dias. Se você comprou o acesso, digite o código que recebeu.'
                  : lang === 'es'
                  ? 'Esta área es un producto separado del viaje de 30 días. Si compraste el acceso, escribe el código que recibiste.'
                  : "This area is a separate product from the 30-day journey. If you bought access, enter the code you received."}
              </p>
              <input
                type="text"
                autoFocus
                value={professionalPassInput}
                onChange={(e) => { setProfessionalPassInput(e.target.value); setProfessionalPassError(false); }}
                onKeyDown={(e) => e.key === 'Enter' && handleProfessionalUnlock()}
                placeholder={lang === 'pt' ? 'Código de acesso' : lang === 'es' ? 'Código de acceso' : 'Access code'}
                className="w-full text-sm bg-white dark:bg-transparent dark:border-0 dark:border-b dark:rounded-none border border-rose-100/20 dark:border-ink-hairline focus:border-rosegold dark:focus:border-rosegold-light focus:outline-none focus:ring-1 dark:focus:ring-0 focus:ring-rosegold rounded-xl p-3 text-slate-700 dark:text-ink-text"
              />
              {professionalPassError && (
                <p className="text-[11px] text-red-500 font-sans">
                  {lang === 'pt' ? 'Código inválido ou já utilizado.' : lang === 'es' ? 'Código inválido o ya utilizado.' : 'Invalid or already used code.'}
                </p>
              )}
              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => { setShowProfessionalPrompt(false); setProfessionalPassInput(''); setProfessionalPassError(false); }}
                  className="px-4 py-2 text-xs font-sans font-semibold text-slate-500 hover:text-slate-700 transition cursor-pointer"
                >
                  {lang === 'pt' ? 'Cancelar' : lang === 'es' ? 'Cancelar' : 'Cancel'}
                </button>
                <button
                  onClick={handleProfessionalUnlock}
                  disabled={professionalUnlocking}
                  className="px-5 py-2 bg-rosegold hover:bg-[#A35D68] text-white dark:bg-transparent dark:border dark:border-rosegold-light dark:text-rosegold-light dark:hover:bg-rosegold-light/10 text-xs font-sans font-bold uppercase tracking-wider rounded-xl transition cursor-pointer disabled:opacity-60"
                >
                  {professionalUnlocking
                    ? (lang === 'pt' ? 'Verificando...' : lang === 'es' ? 'Verificando...' : 'Checking...')
                    : (lang === 'pt' ? 'Entrar' : lang === 'es' ? 'Entrar' : 'Enter')}
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
          <Suspense fallback={<div className="flex justify-center py-24"><div className="h-8 w-8 border-2 border-rosegold border-t-transparent rounded-full animate-spin" /></div>}>
            {activeTab === 'home' && (
              isTodayDoneOnHome ? (
                <HomeView
                  currentDay={activeMissionDay}
                  progress={progress}
                  lang={lang}
                  onSelectTab={(tabId) => setActiveTab(tabId as any)}
                  onLanguageChange={handleLanguageChange}
                  onShowIntro={handleShowIntro}
                  onUpdateProgress={updateProgress}
                  onTriggerSos={() => setActiveTab('sos')}
                  isAdminUnlocked={isAdminUnlocked}
                  onJumpToDay={setFocusedDayNumber}
                  onOnboardingComplete={() => setHasOnboarded(true)}
                />
              ) : (
                <DailyMissionView
                  currentDay={activeMissionDay}
                  progress={progress}
                  lang={lang}
                  onCompleteDay={handleCompleteDay}
                  onToggleFavorite={handleToggleFavorite}
                  onCopyHook={handleCopyHook}
                  onTriggerSos={() => setActiveTab('sos')}
                  onBackToHome={() => setActiveTab('home')}
                  onUpdateMood={handleUpdateMood}
                  isAdminUnlocked={isAdminUnlocked}
                  onJumpToDay={setFocusedDayNumber}
                />
              )
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
                onBackToHome={() => setActiveTab('home')}
                onUpdateMood={handleUpdateMood}
                isAdminUnlocked={isAdminUnlocked}
                onJumpToDay={setFocusedDayNumber}
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

            {activeTab === 'sos' && (
              <EmotionalSosView
                lang={lang}
                onBackToMission={() => setActiveTab('home')}
                onGoToLibrary={() => setActiveTab('library')}
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

            {activeTab === 'professional' && isProfessionalUnlocked && (
              <ProfessionalAreaView
                progress={progress}
                lang={lang}
                onUpdateProgress={updateProgress}
                onGoToLibrary={() => { setLibraryInitialCategory('prompts'); setActiveTab('library'); }}
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
                isAdminUnlocked={isAdminUnlocked}
                onSignOut={handleSignOut}
                syncStatus={syncStatus}
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
                onTriggerSos={() => setActiveTab('sos')}
                initialCategory={libraryInitialCategory}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileView
                lang={lang}
                progress={progress}
                days={days}
                onUpdateProgress={updateProgress}
                userId={user?.id}
              />
            )}

          </Suspense>
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
              grammarPreference={resolveGrammarPreference(progress.grammarPreference)}
              guideStyle={progress.guideStyle}
              onClose={handleCloseMilestone}
            />
          )}
        </AnimatePresence>

        {dayCelebration !== null && (
          <DayCompletionOverlay
            dayNumber={dayCelebration}
            lang={lang}
            onClose={() => setDayCelebration(null)}
          />
        )}

        {/* Floating Renata OS Action Button (replaces the old floating SOS button) */}
        <RenataOSChat
          lang={lang}
          progress={progress}
          currentDayNumber={focusedDayNumber}
          compact={activeTab !== 'home'}
        />

        {/* Ecosystem Bottom Navigation Bar */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-md bg-white/95 dark:bg-ink-raised backdrop-blur-md dark:backdrop-blur-none border border-rose-100/40 dark:border-ink-hairline py-2.5 px-4 rounded-full shadow-2xl dark:shadow-none flex items-center justify-around">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 transition-all relative py-1 px-2.5 rounded-full ${
              activeTab === 'home'
                ? 'text-rosegold dark:text-rosegold-light scale-105 font-bold'
                : 'text-slate-400 dark:text-ink-muted hover:text-slate-600 dark:hover:text-slate-300'
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
                : 'text-slate-400 dark:text-ink-muted hover:text-slate-600 dark:hover:text-slate-300'
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
                : 'text-slate-400 dark:text-ink-muted hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <Users className="h-4.5 w-4.5" />
            <span className="text-[9px] tracking-wider font-sans uppercase font-medium">{labels.community}</span>
            {activeTab === 'community' && (
              <motion.div layoutId="activeDot" className="absolute -bottom-1 w-1 h-1 bg-rosegold dark:bg-rosegold-light rounded-full" />
            )}
          </button>

          <button
            onClick={() => { setLibraryInitialCategory(undefined); setActiveTab('library'); }}
            className={`flex flex-col items-center gap-1 transition-all relative py-1 px-2.5 rounded-full ${
              activeTab === 'library'
                ? 'text-rosegold dark:text-rosegold-light scale-105 font-bold'
                : 'text-slate-400 dark:text-ink-muted hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <BookOpen className="h-4.5 w-4.5" />
            <span className="text-[9px] tracking-wider font-sans uppercase font-medium">{labels.library}</span>
            {activeTab === 'library' && (
              <motion.div layoutId="activeDot" className="absolute -bottom-1 w-1 h-1 bg-rosegold dark:bg-rosegold-light rounded-full" />
            )}
          </button>

          <button
            onClick={() => isProfessionalUnlocked ? setActiveTab('professional') : setShowProfessionalPrompt(true)}
            className={`flex flex-col items-center gap-1 transition-all relative py-1 px-2.5 rounded-full ${
              activeTab === 'professional'
                ? 'text-rosegold dark:text-rosegold-light scale-105 font-bold'
                : 'text-slate-400 dark:text-ink-muted hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            {isProfessionalUnlocked ? <Sparkles className="h-4.5 w-4.5" /> : <Lock className="h-4.5 w-4.5" />}
            <span className="text-[9px] tracking-wider font-sans uppercase font-medium">{labels.professional}</span>
            {activeTab === 'professional' && (
              <motion.div layoutId="activeDot" className="absolute -bottom-1 w-1 h-1 bg-rosegold dark:bg-rosegold-light rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-1 transition-all relative py-1 px-2.5 rounded-full ${
              activeTab === 'profile'
                ? 'text-rosegold dark:text-rosegold-light scale-105 font-bold'
                : 'text-slate-400 dark:text-ink-muted hover:text-slate-600 dark:hover:text-slate-300'
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
      <footer className="py-8 border-t border-rose-100/10 dark:border-ink-hairline bg-[#FAF6F2] dark:bg-ink text-center text-xs text-slate-400 dark:text-ink-muted font-sans select-none">
        <p className="tracking-wide">© 2026 RenaSer • {taglines[lang]} • Craftsmanship &amp; Editorial Intent</p>
      </footer>

    </div>
  );
}
