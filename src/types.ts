/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Language = 'pt' | 'en' | 'es';

export enum DayType {
  RestartIntention = 'RestartIntention',
  Truth = 'Truth',
  Storytelling = 'Storytelling',
  ContrarianThinking = 'ContrarianThinking',
  Rest = 'Rest',
  Presence = 'Presence',
  Reflection = 'Reflection',
}

export interface DayContent {
  audioUrl: string;
  hook: string;
  scripts: string[]; // Exactly 3 script examples
  exposureAction: string;
  reflectionQuestion: string;
}

export type MultiLangContent = Record<Language, DayContent>;

export interface MissionDay {
  dayNumber: number;
  type: DayType;
  title: Record<Language, string>;
  content: MultiLangContent;
  weekday?: string; // e.g., 'Monday' to match the Day Model spec
  theme?: Record<Language, string>; // e.g., 'Visibility Basics'
}

// Hook Model Specification
export interface HookModel {
  id: string;
  category: string; // e.g., 'Provocação', 'Educativo', 'Conexão'
  language: Language;
  title: string;
  body: string;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
}

// SOS Model Specification
export interface SosModel {
  id: string;
  title: string;
  language: Language;
  audio?: string; // Optional audio guidance URL
  text: string;
  category: 'anxiety' | 'impostor' | 'fear' | 'general';
}

// User Settings Model
export interface UserSettings {
  theme: 'light' | 'dark';
  dailyReminder: string; // e.g., '09:00'
  notificationsEnabled: boolean;
  language: Language;
}

// Notifications Model
export interface NotificationModel {
  id: string;
  title: Record<Language, string>;
  body: Record<Language, string>;
  createdAt: string;
  read: boolean;
}

// Journey Model Metadata
export interface JourneyModel {
  id: string;
  titles: Record<Language, string>;
  ctaText: Record<Language, string>;
  nextLevelText: Record<Language, string>;
  totalDays: number;
}

export interface UserProgress {
  currentDay: number;
  completionHistory: number[]; // Array of completed day numbers
  currentStreak: number;
  longestStreak: number;
  favoriteHooks: number[]; // Array of day numbers where the hook is favorited
  copiedHooks: number[]; // Array of day numbers where the hook was copied
  videoLinks: Record<number, string>; // Completed day -> optional submitted video link
  reflections: Record<number, string>; // Completed day -> submitted reflection text
  lastActiveDate: string | null; // Date string (YYYY-MM-DD) to calculate streaks
  theme?: 'light' | 'dark';
  settings?: UserSettings;
  
  // Multi-Journey Engine Fields
  activeJourneyId?: string;
  completedDaysByJourney?: Record<string, number[]>;
  currentDayByJourney?: Record<string, number>;
  reflectionsByJourney?: Record<string, Record<number, string>>;
  videoLinksByJourney?: Record<string, Record<number, string>>;
  moodsByJourney?: Record<string, Record<number, string>>;
  certificates?: Array<{ journeyId: string; title: string; date: string; code: string }>;
  communityMembership?: string[];
  mentorshipHistory?: Array<{ id: string; date: string; time: string; topic: string; provider: string; status: string }>;

  // Emotional history & Memory scrapbook tracking
  journalMoods?: Record<number, string>; // Completed day -> mood chosen
  chapterReflections?: Record<number, { selectedFeeling: string; futureSelfNote?: string; selectedSurprises?: string[] }>;
  sosCheckins?: Array<{ date: string; emotion: string; breathingHelpful: string }>;

  // Personalization & Adaptive Engine
  guideStyle?: 'gentle' | 'challenger' | 'strategic' | 'inspirational';
  grammarPreference?: 'feminine' | 'masculine' | 'neutral';
  behaviorStats?: {
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
    notificationCountAdjusted?: number;
    alternativeResourcesTriggered?: boolean;
    homeClickHistory?: string[];
  };
}

// Ecosystem, Community, Support, Mentorship & Library Engine types
export interface CommunityConfig {
  name: Record<Language, string>;
  description: Record<Language, string>;
  buttonTitle: Record<Language, string>;
  joinLink: string;
  buttonColor: string;
  image: string;
  platform: 'WhatsApp' | 'Telegram' | 'Circle' | 'Skool' | 'Discord' | 'Facebook Groups' | 'Slack' | 'Custom URL';
}

export interface SupportConfig {
  email: string;
  whatsapp: string;
  formUrl: string;
  websiteUrl: string;
  helpCenterUrl: string;
  emergencyMessage: Record<Language, string>;
  faqs: Array<{
    id: string;
    question: Record<Language, string>;
    answer: Record<Language, string>;
  }>;
}

export interface MentoringConfig {
  bookingUrl: string;
  title: Record<Language, string>;
  description: Record<Language, string>;
  ctaText: Record<Language, string>;
  provider: 'Calendly' | 'Google Calendar' | 'Custom Booking System';
}

export interface LibraryAsset {
  id: string;
  title: Record<Language, string>;
  description: Record<Language, string>;
  category: 'videos' | 'audios' | 'articles' | 'downloads' | 'pdfs' | 'workbooks' | 'meditations' | 'challenges' | 'masterclasses';
  mediaUrl: string;
  durationOrSize: string;
  coverImage?: string;
  isCustom?: boolean;
  playbackProgress?: number; // Last watched percentage (0 to 100)
}

// Reusable Journey Engine Core Entities
export interface Journey {
  id: string;
  title: Record<Language, string>;
  subtitle: Record<Language, string>;
  description: Record<Language, string>;
  coverImage: string;
  languages: Language[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: string;
  author: string;
  status: 'draft' | 'published' | 'archived';
  tags: string[];
  accessRules: string; // e.g., 'free', 'premium', 'invite-only'
  order: number;
  visibility: 'public' | 'hidden';
  progressRules?: string;
  completionRules?: string;
  celebrationRules?: string;
  unlockRules?: string;
  certificateRules?: string;
  communityRules?: string;
  mentorshipRules?: string;
}

export interface Chapter {
  id: string;
  journeyId: string;
  title: Record<Language, string>;
  description: Record<Language, string>;
  coverImage: string;
  theme: Record<Language, string>;
  objectives: Record<Language, string[]>;
  colorTheme: string; // hex or Tailwind class
  celebrationAnimation: 'confetti' | 'fireworks' | 'sparkles' | 'none';
  completionReflection: Record<Language, string>;
  chapterBadge: string;
  order: number;
}

export interface Day {
  id: string;
  chapterId: string;
  journeyId: string;
  dayNumber: number;
  title: Record<Language, string>;
  type: DayType | string;
  weekday?: string;
  theme?: Record<Language, string>;
  audioUrl: string;
  videoUrl: string; // YouTube / Vimeo / MP4
  videoType?: 'youtube' | 'vimeo' | 'mp4' | 'native';
  mission: Record<Language, string>;
  hook: Record<Language, string>;
  scripts: Record<Language, string[]>; // Exactly 3 script examples per language
  reflection: Record<Language, string>;
  journalPrompt?: Record<Language, string>;
  downloads: Array<{ title: Record<Language, string>; url: string; type: string }>;
  externalLinks: Array<{ title: Record<Language, string>; url: string }>;
  videoUploadEnabled?: boolean;
  audioUploadEnabled?: boolean;
  pdfUploadEnabled?: boolean;
  imageUploadEnabled?: boolean;
  completionRules?: string;
  languageVariations?: string;
}


