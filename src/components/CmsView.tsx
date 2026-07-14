/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, BookOpen, Layers, Calendar, Video, Volume2, 
  Heart, Sparkles, Users, BarChart3, Settings, Globe, FileImage, 
  MessageSquare, HelpCircle, PhoneCall, Compass, Trash2, Plus, 
  Edit, Copy, ArrowRight, Lock, ShieldAlert, Upload, Folder, 
  Tag, Search, Undo, Check, Activity, FileText, ExternalLink, RefreshCw
} from 'lucide-react';

import { 
  Language, DayType, Journey, Chapter, Day, 
  CommunityConfig, SupportConfig, MentoringConfig, LibraryAsset 
} from '../types';

import { 
  loadJourneysFromStorage, saveJourneysToStorage,
  loadChaptersFromStorage, saveChaptersToStorage,
  loadAllDaysFromStorage, saveAllDaysToStorage,
  mapMissionDaysToDays
} from '../data/journeysData';

import { 
  loadCommunityConfig, saveCommunityConfig,
  loadSupportConfig, saveSupportConfig,
  loadMentoringConfig, saveMentoringConfig,
  loadLibraryAssets, saveLibraryAssets
} from '../data/ecosystemData';

interface CmsViewProps {
  days: any[];
  lang: Language;
  onSaveDays: (updatedDays: any[]) => void;
  onResetDays: () => void;
}

type StudioModule = 
  | 'dashboard' | 'journeys' | 'chapters' | 'days' 
  | 'videos' | 'audios' | 'hooks' | 'sos' 
  | 'community' | 'mentorship' | 'library' | 'analytics' 
  | 'users' | 'support' | 'settings';

export default function CmsView({
  days: parentDays,
  lang,
  onSaveDays,
  onResetDays
}: CmsViewProps) {
  // Creator Studio navigation
  const [activeModule, setActiveModule] = useState<StudioModule>('dashboard');
  
  // Dynamic local storage datasets
  const [journeys, setJourneys] = useState<Journey[]>(() => loadJourneysFromStorage());
  const [chapters, setChapters] = useState<Chapter[]>(() => loadChaptersFromStorage());
  const [studioDays, setStudioDays] = useState<Day[]>(() => loadAllDaysFromStorage());
  
  // Ecosystem Configs
  const [community, setCommunity] = useState<CommunityConfig>(() => loadCommunityConfig());
  const [support, setSupport] = useState<SupportConfig>(() => loadSupportConfig());
  const [mentorship, setMentoring] = useState<MentoringConfig>(() => loadMentoringConfig());
  const [library, setLibrary] = useState<LibraryAsset[]>(() => loadLibraryAssets());

  // Search & Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJourneyId, setSelectedJourneyId] = useState<string>('destrave_visibilidade');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('ch_despertar');
  const [studioLang, setStudioLang] = useState<Language>('pt');

  // Interactive Form States
  const [editingJourney, setEditingJourney] = useState<Journey | null>(null);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [editingDay, setEditingDay] = useState<Day | null>(null);
  const [editingAsset, setEditingAsset] = useState<LibraryAsset | null>(null);

  // Success Notification
  const [notice, setNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  };

  // Sync back to App.tsx when studioDays changes
  const syncWithApp = (updatedDays: Day[]) => {
    setStudioDays(updatedDays);
    saveAllDaysToStorage(updatedDays);
    
    // Map modular days back to MissionDays for parent App.tsx if required
    const parentFormatDays = updatedDays.map(d => ({
      dayNumber: d.dayNumber,
      type: d.type as DayType,
      title: d.title,
      content: {
        pt: {
          audioUrl: d.audioUrl,
          hook: d.hook.pt,
          scripts: d.scripts.pt,
          exposureAction: d.mission.pt,
          reflectionQuestion: d.reflection.pt
        },
        en: {
          audioUrl: d.audioUrl,
          hook: d.hook.en,
          scripts: d.scripts.en,
          exposureAction: d.mission.en,
          reflectionQuestion: d.reflection.en
        },
        es: {
          audioUrl: d.audioUrl,
          hook: d.hook.es,
          scripts: d.scripts.es,
          exposureAction: d.mission.es,
          reflectionQuestion: d.reflection.es
        }
      }
    }));
    
    onSaveDays(parentFormatDays);
  };

  // Duplicate Actions
  const duplicateJourney = (journey: Journey) => {
    const newId = `${journey.id}_copy_${Date.now()}`;
    const newJourney: Journey = {
      ...journey,
      id: newId,
      title: {
        pt: `${journey.title.pt} (Cópia)`,
        en: `${journey.title.en} (Copy)`,
        es: `${journey.title.es} (Copia)`
      },
      status: 'draft',
      order: journeys.length + 1
    };

    const updatedJourneys = [...journeys, newJourney];
    setJourneys(updatedJourneys);
    saveJourneysToStorage(updatedJourneys);

    // Also duplicate its chapters
    const journeyChapters = chapters.filter(c => c.journeyId === journey.id);
    const newChapters: Chapter[] = [];
    const newDays: Day[] = [];

    journeyChapters.forEach(ch => {
      const newChId = `${ch.id}_copy_${Date.now()}`;
      newChapters.push({
        ...ch,
        id: newChId,
        journeyId: newId
      });

      // Duplicate days for this chapter
      const chapterDays = studioDays.filter(d => d.chapterId === ch.id && d.journeyId === journey.id);
      chapterDays.forEach(day => {
        newDays.push({
          ...day,
          id: `day_${day.dayNumber}_copy_${Date.now()}`,
          chapterId: newChId,
          journeyId: newId
        });
      });
    });

    const updatedChapters = [...chapters, ...newChapters];
    setChapters(updatedChapters);
    saveChaptersToStorage(updatedChapters);

    const updatedDays = [...studioDays, ...newDays];
    syncWithApp(updatedDays);

    showNotice('Jornada e todo o currículo duplicados com sucesso!');
  };

  const duplicateChapter = (chapter: Chapter) => {
    const newId = `${chapter.id}_copy_${Date.now()}`;
    const newChapter: Chapter = {
      ...chapter,
      id: newId,
      title: {
        pt: `${chapter.title.pt} (Cópia)`,
        en: `${chapter.title.en} (Copy)`,
        es: `${chapter.title.es} (Copia)`
      },
      order: chapters.filter(c => c.journeyId === chapter.journeyId).length + 1
    };

    const updatedChapters = [...chapters, newChapter];
    setChapters(updatedChapters);
    saveChaptersToStorage(updatedChapters);

    // Duplicate days of this chapter
    const chapterDays = studioDays.filter(d => d.chapterId === chapter.id && d.journeyId === chapter.journeyId);
    const newDays = chapterDays.map(day => ({
      ...day,
      id: `day_${day.dayNumber}_copy_${Date.now()}`,
      chapterId: newId
    }));

    const updatedDays = [...studioDays, ...newDays];
    syncWithApp(updatedDays);

    showNotice('Capítulo duplicado com sucesso!');
  };

  const duplicateDay = (day: Day) => {
    const maxDayNum = Math.max(...studioDays.filter(d => d.journeyId === day.journeyId).map(d => d.dayNumber), 0);
    const newDay: Day = {
      ...day,
      id: `day_${maxDayNum + 1}_${Date.now()}`,
      dayNumber: maxDayNum + 1,
      title: {
        pt: `${day.title.pt} (Cópia)`,
        en: `${day.title.en} (Copy)`,
        es: `${day.title.es} (Copia)`
      }
    };

    const updatedDays = [...studioDays, newDay];
    syncWithApp(updatedDays);
    showNotice(`Missão duplicada como Dia ${maxDayNum + 1}!`);
  };

  // Add Actions
  const createNewJourney = () => {
    const newId = `journey_${Date.now()}`;
    const newJourney: Journey = {
      id: newId,
      title: { pt: 'Nova Jornada de Transformação', en: 'New Transformation Journey', es: 'Nuevo Camino de Transformación' },
      subtitle: { pt: 'Uma breve descrição inspiradora.', en: 'An inspiring short description.', es: 'Una descripción corta inspiradora.' },
      description: { pt: 'Insira a descrição detalhada do currículo e objetivos do seu programa.', en: 'Write down the full objectives and scope here.', es: 'Escribe los objetivos del programa aquí.' },
      coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
      languages: ['pt'],
      difficulty: 'beginner',
      estimatedDuration: '7 dias',
      author: 'Creator Studio',
      status: 'draft',
      tags: ['Novidade'],
      accessRules: 'free',
      order: journeys.length + 1,
      visibility: 'public'
    };

    const updated = [...journeys, newJourney];
    setJourneys(updated);
    saveJourneysToStorage(updated);
    setEditingJourney(newJourney);
    showNotice('Nova jornada criada como Rascunho!');
  };

  const createNewChapter = (journeyId: string) => {
    const newId = `ch_${Date.now()}`;
    const newChapter: Chapter = {
      id: newId,
      journeyId,
      title: { pt: 'Novo Capítulo', en: 'New Chapter', es: 'Nuevo Capítulo' },
      description: { pt: 'Tema de aprendizado estruturado.', en: 'Structured theme block.', es: 'Tema del bloque de aprendizaje.' },
      coverImage: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=600&q=80',
      theme: { pt: 'Foco • Ritmo • Presença', en: 'Focus • Rhythm • Presence', es: 'Foco • Ritmo • Presencia' },
      objectives: { pt: ['Objetivo Prático'], en: ['Practical Objective'], es: ['Objetivo Práctico'] },
      colorTheme: 'text-rosegold',
      celebrationAnimation: 'confetti',
      completionReflection: { pt: 'Parabéns por concluir esta fase!', en: 'Congrats on finishing this phase!', es: '¡Felicidades por completar esta fase!' },
      chapterBadge: 'Compass',
      order: chapters.filter(c => c.journeyId === journeyId).length + 1
    };

    const updated = [...chapters, newChapter];
    setChapters(updated);
    saveChaptersToStorage(updated);
    setEditingChapter(newChapter);
    showNotice('Novo capítulo inserido!');
  };

  const createNewDay = (journeyId: string, chapterId: string) => {
    const maxDayNum = Math.max(...studioDays.filter(d => d.journeyId === journeyId).map(d => d.dayNumber), 0);
    const newDay: Day = {
      id: `day_${Date.now()}`,
      chapterId,
      journeyId,
      dayNumber: maxDayNum + 1,
      title: { pt: 'Nova Lição de Visibilidade', en: 'New Visibility Lesson', es: 'Nueva Lección de Visibilidad' },
      type: DayType.Presence,
      weekday: `Dia ${maxDayNum + 1}`,
      theme: { pt: 'Presença', en: 'Presence', es: 'Presencia' },
      audioUrl: 'https://actions.google.com/sounds/v1/ambiences/morning_birds.ogg',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      videoType: 'native',
      mission: { pt: 'Grave um vídeo prático.', en: 'Record a video.', es: 'Graba un video.' },
      hook: { pt: 'O maior segredo para gravar...', en: 'The biggest secret to filming...', es: 'El mayor secreto para grabar...' },
      scripts: {
        pt: ['Exemplo 1', 'Exemplo 2', 'Exemplo 3'],
        en: ['Example 1', 'Example 2', 'Example 3'],
        es: ['Ejemplo 1', 'Ejemplo 2', 'Ejemplo 3']
      },
      reflection: { pt: 'Como você se sentiu hoje?', en: 'How did you feel today?', es: '¿Cómo te sentiste hoy?' },
      downloads: [],
      externalLinks: []
    };

    const updated = [...studioDays, newDay];
    syncWithApp(updated);
    setEditingDay(newDay);
    showNotice(`Lição criada como Dia ${maxDayNum + 1}!`);
  };

  // Delete Actions
  const deleteJourney = (id: string) => {
    if (id === 'destrave_visibilidade') {
      alert('A jornada primordial de Destrave de Visibilidade não pode ser excluída para garantir a estabilidade do portal.');
      return;
    }
    if (confirm('Tem certeza de que deseja excluir permanentemente esta jornada, seus capítulos e lições associadas?')) {
      const updatedJourneys = journeys.filter(j => j.id !== id);
      setJourneys(updatedJourneys);
      saveJourneysToStorage(updatedJourneys);

      const updatedChapters = chapters.filter(c => c.journeyId !== id);
      setChapters(updatedChapters);
      saveChaptersToStorage(updatedChapters);

      const updatedDays = studioDays.filter(d => d.journeyId !== id);
      syncWithApp(updatedDays);

      showNotice('Jornada excluída do currículo.');
    }
  };

  const deleteChapter = (id: string) => {
    if (confirm('Excluir este capítulo e desvincular suas lições?')) {
      const updatedChapters = chapters.filter(c => c.id !== id);
      setChapters(updatedChapters);
      saveChaptersToStorage(updatedChapters);

      // Desvincular dias desse capítulo
      const updatedDays = studioDays.map(d => d.chapterId === id ? { ...d, chapterId: '' } : d);
      syncWithApp(updatedDays);

      showNotice('Capítulo removido.');
    }
  };

  const deleteDay = (id: string) => {
    if (confirm('Excluir permanentemente esta lição?')) {
      const updatedDays = studioDays.filter(d => d.id !== id);
      syncWithApp(updatedDays);
      showNotice('Lição excluída.');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-[80vh] bg-slate-50 dark:bg-[#1E1715]/45 rounded-3xl overflow-hidden border border-rose-100/30 dark:border-rosegold/10 font-sans shadow-lg">
      
      {/* Studio Navigation Sidebar */}
      <aside className="w-full lg:w-64 bg-white dark:bg-[#2C221E] p-6 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-rose-150/20 dark:border-rosegold/10">
        <div className="space-y-6">
          <div className="flex items-center gap-2.5 px-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-rosegold to-accentgold flex items-center justify-center text-white font-extrabold shadow-sm">
              🎨
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider leading-none">
                Creator Studio
              </h2>
              <span className="text-[10px] text-rosegold font-sans font-semibold">
                Notion x Canva Engine
              </span>
            </div>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveModule('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-xl transition-all ${
                activeModule === 'dashboard'
                  ? 'bg-rosegold/10 text-rosegold font-bold dark:bg-rosegold/20 dark:text-rosegold-light'
                  : 'text-slate-600 hover:bg-rose-50/50 dark:text-slate-300 dark:hover:bg-rosegold/5'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Painel de Controle</span>
            </button>

            <button
              onClick={() => setActiveModule('journeys')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-xl transition-all ${
                activeModule === 'journeys'
                  ? 'bg-rosegold/10 text-rosegold font-bold dark:bg-rosegold/20 dark:text-rosegold-light'
                  : 'text-slate-600 hover:bg-rose-50/50 dark:text-slate-300 dark:hover:bg-rosegold/5'
              }`}
            >
              <Compass className="h-4 w-4" />
              <span>Currículo de Jornadas</span>
            </button>

            <button
              onClick={() => setActiveModule('community')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-xl transition-all ${
                activeModule === 'community'
                  ? 'bg-rosegold/10 text-rosegold font-bold dark:bg-rosegold/20 dark:text-rosegold-light'
                  : 'text-slate-600 hover:bg-rose-50/50 dark:text-slate-300 dark:hover:bg-rosegold/5'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Portal de Comunidade</span>
            </button>

            <button
              onClick={() => setActiveModule('mentorship')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-xl transition-all ${
                activeModule === 'mentorship'
                  ? 'bg-rosegold/10 text-rosegold font-bold dark:bg-rosegold/20 dark:text-rosegold-light'
                  : 'text-slate-600 hover:bg-rose-50/50 dark:text-slate-300 dark:hover:bg-rosegold/5'
              }`}
            >
              <Heart className="h-4 w-4" />
              <span>Módulo de Mentorias</span>
            </button>

            <button
              onClick={() => setActiveModule('library')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-xl transition-all ${
                activeModule === 'library'
                  ? 'bg-rosegold/10 text-rosegold font-bold dark:bg-rosegold/20 dark:text-rosegold-light'
                  : 'text-slate-600 hover:bg-rose-50/50 dark:text-slate-300 dark:hover:bg-rosegold/5'
              }`}
            >
              <Folder className="h-4 w-4" />
              <span>Biblioteca de Mídias</span>
            </button>

            <button
              onClick={() => setActiveModule('support')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-xl transition-all ${
                activeModule === 'support'
                  ? 'bg-rosegold/10 text-rosegold font-bold dark:bg-rosegold/20 dark:text-rosegold-light'
                  : 'text-slate-600 hover:bg-rose-50/50 dark:text-slate-300 dark:hover:bg-rosegold/5'
              }`}
            >
              <PhoneCall className="h-4 w-4" />
              <span>Suporte & FAQs</span>
            </button>

            <button
              onClick={() => setActiveModule('analytics')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-xl transition-all ${
                activeModule === 'analytics'
                  ? 'bg-rosegold/10 text-rosegold font-bold dark:bg-rosegold/20 dark:text-rosegold-light'
                  : 'text-slate-600 hover:bg-rose-50/50 dark:text-slate-300 dark:hover:bg-rosegold/5'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Métricas & Insights</span>
            </button>

            <button
              onClick={() => setActiveModule('users')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-xl transition-all ${
                activeModule === 'users'
                  ? 'bg-rosegold/10 text-rosegold font-bold dark:bg-rosegold/20 dark:text-rosegold-light'
                  : 'text-slate-600 hover:bg-rose-50/50 dark:text-slate-300 dark:hover:bg-rosegold/5'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>Alunos & Diários</span>
            </button>
          </nav>
        </div>

        {/* Sync Status Banner */}
        <div className="pt-6 border-t border-rose-100/20 mt-6 space-y-3">
          <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-mono">
            <span>DATABASE MODE</span>
            <span className="text-emerald-500 font-bold flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> SYNCED
            </span>
          </div>
          <button
            onClick={onResetDays}
            className="w-full py-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 dark:bg-warmbrown-light/10 text-slate-600 dark:text-slate-400 rounded-xl text-[10px] uppercase font-bold tracking-wider transition-all flex items-center justify-center gap-1"
          >
            <RefreshCw className="h-3 w-3" /> Resetar Currículo Primordial
          </button>
        </div>
      </aside>

      {/* Main Module Panel Display Container */}
      <section className="flex-1 p-6 sm:p-8 bg-[#FAF8F5]/30 dark:bg-transparent relative">
        {/* Top Floating Notice Notification */}
        <AnimatePresence>
          {notice && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="absolute top-4 left-6 right-6 bg-slate-900 text-white rounded-2xl p-4 shadow-xl flex items-center gap-3 border border-slate-800 z-50 text-xs font-sans font-bold"
            >
              <Sparkles className="h-5 w-5 text-accentgold shrink-0 animate-pulse" />
              <p className="flex-1">{notice}</p>
              <Check className="h-4 w-4 text-emerald-400" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dashboard MODULE */}
        {activeModule === 'dashboard' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-serif font-black text-slate-800 dark:text-white uppercase">
                  Painel de Controle do Criador
                </h1>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Gerencie o ecossistema de transformação RenaSer com facilidade e elegância visual.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={createNewJourney}
                  className="px-4 py-2 bg-rosegold text-white text-xs uppercase font-sans font-bold tracking-wider rounded-xl shadow-md shadow-rosegold/10 hover:bg-[#A35D68] transition"
                >
                  Criar Nova Jornada
                </button>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-[#2C221E] p-5 rounded-2xl border border-rose-100/20 dark:border-rosegold/10 shadow-xs">
                <div className="flex justify-between items-center text-slate-400 dark:text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Jornadas Ativas</span>
                  <Compass className="h-5 w-5 text-rosegold" />
                </div>
                <div className="text-3xl font-black text-slate-800 dark:text-white">{journeys.length}</div>
                <span className="text-[10px] text-slate-400">Total de programas cadastrados</span>
              </div>

              <div className="bg-white dark:bg-[#2C221E] p-5 rounded-2xl border border-rose-100/20 dark:border-rosegold/10 shadow-xs">
                <div className="flex justify-between items-center text-slate-400 dark:text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Módulos/Capítulos</span>
                  <Layers className="h-5 w-5 text-rosegold" />
                </div>
                <div className="text-3xl font-black text-slate-800 dark:text-white">{chapters.length}</div>
                <span className="text-[10px] text-slate-400">Pórticos de evolução de marcas</span>
              </div>

              <div className="bg-white dark:bg-[#2C221E] p-5 rounded-2xl border border-rose-100/20 dark:border-rosegold/10 shadow-xs">
                <div className="flex justify-between items-center text-slate-400 dark:text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Aulas Ativas</span>
                  <Calendar className="h-5 w-5 text-rosegold" />
                </div>
                <div className="text-3xl font-black text-slate-800 dark:text-white">{studioDays.length}</div>
                <span className="text-[10px] text-slate-400">Desafios diários mapeados</span>
              </div>

              <div className="bg-white dark:bg-[#2C221E] p-5 rounded-2xl border border-rose-100/20 dark:border-rosegold/10 shadow-xs">
                <div className="flex justify-between items-center text-slate-400 dark:text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Mídias em Biblioteca</span>
                  <Folder className="h-5 w-5 text-rosegold" />
                </div>
                <div className="text-3xl font-black text-slate-800 dark:text-white">{library.length}</div>
                <span className="text-[10px] text-slate-400">Recursos reutilizáveis em PDF e Áudio</span>
              </div>
            </div>

            {/* Notion-style Board Section */}
            <div className="bg-white dark:bg-[#2C221E] rounded-2xl border border-rose-100/20 dark:border-rosegold/10 p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-rose-50 dark:border-rosegold/5 pb-4">
                <h3 className="text-md font-serif font-bold text-slate-800 dark:text-white uppercase">
                  Quadro de Jornadas de Transformação
                </h3>
                <span className="text-xs text-rosegold font-sans font-medium">Visualização Simplificada</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {journeys.map(j => {
                  const chCount = chapters.filter(c => c.journeyId === j.id).length;
                  const dayCount = studioDays.filter(d => d.journeyId === j.id).length;

                  return (
                    <div 
                      key={j.id}
                      className="border border-rose-100/30 dark:border-rosegold/5 rounded-2xl p-4 bg-[#FAF8F5]/30 dark:bg-warmbrown-light/5 flex flex-col justify-between space-y-4 hover:border-rosegold/30 transition-all"
                    >
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            j.status === 'published' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                          }`}>
                            {j.status === 'published' ? 'Publicada' : 'Rascunho'}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">ID: {j.id}</span>
                        </div>
                        <h4 className="text-base font-serif font-black uppercase text-slate-800 dark:text-white">
                          {j.title.pt}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {j.subtitle.pt}
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-rose-100/10 pt-3">
                        <div className="flex gap-4 text-[10px] text-slate-400 dark:text-slate-500">
                          <span>{chCount} Capítulos</span>
                          <span>{dayCount} Lições</span>
                          <span className="capitalize">{j.difficulty}</span>
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => { setSelectedJourneyId(j.id); setActiveModule('journeys'); }}
                            className="p-1.5 bg-rosegold text-white rounded-lg hover:bg-[#A35D68] transition"
                            title="Editar Estrutura"
                          >
                            <Edit className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => duplicateJourney(j)}
                            className="p-1.5 bg-slate-100 dark:bg-warmbrown text-slate-600 dark:text-slate-400 rounded-lg hover:bg-rosegold/10 hover:text-rosegold transition"
                            title="Duplicar"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Journeys MODULE */}
        {activeModule === 'journeys' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-rose-100/10 pb-4">
              <div>
                <h1 className="text-2xl font-serif font-black text-slate-800 dark:text-white uppercase flex items-center gap-2">
                  <Compass className="h-6 w-6 text-rosegold" />
                  Currículo de Jornadas
                </h1>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Gerencie as trajetórias de ponta a ponta. Adicione capítulos, ordene as missões diárias e monte rituais de consagração.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={createNewJourney}
                  className="px-4 py-2 bg-rosegold text-white text-xs uppercase font-sans font-bold tracking-wider rounded-xl transition-all"
                >
                  Nova Jornada
                </button>
              </div>
            </div>

            {/* Selector Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {journeys.map(j => (
                <button
                  key={j.id}
                  onClick={() => { setSelectedJourneyId(j.id); setEditingJourney(null); setEditingChapter(null); setEditingDay(null); }}
                  className={`px-4 py-2 text-xs font-sans rounded-xl border transition-all ${
                    selectedJourneyId === j.id
                      ? 'bg-[#2C221E] text-white border-[#2C221E] font-bold dark:bg-rosegold dark:border-rosegold'
                      : 'bg-white dark:bg-warmbrown border-rose-100/25 dark:border-rosegold/10 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {j.title.pt}
                </button>
              ))}
            </div>

            {/* Dynamic visual editor for active journey */}
            {selectedJourneyId && !editingJourney && !editingChapter && !editingDay && (
              (() => {
                const activeJ = journeys.find(j => j.id === selectedJourneyId);
                if (!activeJ) return null;

                const journeyChs = chapters.filter(c => c.journeyId === activeJ.id).sort((a,b) => a.order - b.order);

                return (
                  <div className="space-y-6">
                    {/* Journey settings highlight card */}
                    <div className="bg-white dark:bg-[#2C221E] border border-rose-100/25 dark:border-rosegold/10 rounded-2xl p-6 flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex gap-4">
                        <img 
                          src={activeJ.coverImage} 
                          alt="Cover" 
                          className="h-20 w-28 object-cover rounded-xl border border-rose-100/10 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="space-y-1">
                          <h2 className="text-lg font-serif font-bold uppercase text-slate-800 dark:text-white">
                            {activeJ.title.pt}
                          </h2>
                          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
                            {activeJ.subtitle.pt}
                          </p>
                          <div className="flex gap-3 pt-1 text-[10px] text-slate-400 font-mono">
                            <span>Duracão: {activeJ.estimatedDuration}</span>
                            <span>Dificuldade: {activeJ.difficulty}</span>
                            <span>Acesso: {activeJ.accessRules}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-row md:flex-col justify-end gap-2 shrink-0">
                        <button
                          onClick={() => setEditingJourney(activeJ)}
                          className="px-4 py-2 bg-slate-100 dark:bg-warmbrown text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl flex items-center gap-1 hover:bg-rosegold/10 hover:text-rosegold transition-all"
                        >
                          <Edit className="h-3.5 w-3.5" /> Configurar Detalhes
                        </button>
                        <button
                          onClick={() => deleteJourney(activeJ.id)}
                          className="px-4 py-2 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl flex items-center gap-1 hover:bg-red-100 transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Excluir Jornada
                        </button>
                      </div>
                    </div>

                    {/* Timeline builder (Notion/Canva feel) */}
                    <div className="space-y-6">
                      <div className="flex justify-between items-center border-b border-rose-100/10 pb-2">
                        <h3 className="text-base font-serif font-black uppercase text-slate-800 dark:text-white">
                          Visual Journey Timeline & Chapters
                        </h3>
                        <button
                          onClick={() => createNewChapter(activeJ.id)}
                          className="px-3 py-1.5 bg-rosegold/10 text-rosegold hover:bg-rosegold/20 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all dark:bg-rosegold/20 dark:text-rosegold-light"
                        >
                          <Plus className="h-4 w-4" /> Inserir Novo Capítulo
                        </button>
                      </div>

                      {journeyChs.length === 0 ? (
                        <div className="bg-white dark:bg-[#2C221E] border border-dashed border-rose-150/40 p-8 rounded-2xl text-center text-xs text-slate-400">
                          Nenhum capítulo cadastrado para esta jornada ainda. Clique acima para começar a construir a experiência!
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {journeyChs.map((ch, index) => {
                            const chDays = studioDays.filter(d => d.chapterId === ch.id && d.journeyId === activeJ.id).sort((a,b) => a.dayNumber - b.dayNumber);

                            return (
                              <div 
                                key={ch.id}
                                className="bg-white dark:bg-[#2C221E] border border-rose-100/25 dark:border-rosegold/10 rounded-2xl overflow-hidden shadow-xs"
                              >
                                {/* Chapter header inside block */}
                                <div className="bg-[#FAF8F5]/60 dark:bg-warmbrown-light/10 p-4 border-b border-rose-100/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                  <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-full bg-rosegold/10 dark:bg-rosegold/20 text-rosegold font-bold flex items-center justify-center font-serif text-sm">
                                      {index + 1}
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-bold uppercase tracking-tight text-slate-800 dark:text-white">
                                        {ch.title.pt}
                                      </h4>
                                      <p className="text-[11px] text-slate-400 dark:text-slate-500 font-sans italic">
                                        {ch.theme.pt} • {chDays.length} lições cadastradas
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => createNewDay(activeJ.id, ch.id)}
                                      className="px-2.5 py-1.5 bg-rosegold text-white text-[10px] font-bold rounded-lg hover:bg-[#A35D68] transition"
                                    >
                                      + Inserir Lição
                                    </button>
                                    <button
                                      onClick={() => setEditingChapter(ch)}
                                      className="p-1.5 bg-slate-100 dark:bg-warmbrown text-slate-600 dark:text-slate-400 rounded-lg hover:text-rosegold hover:bg-rosegold/10 transition"
                                      title="Editar Capítulo"
                                    >
                                      <Edit className="h-3 w-3" />
                                    </button>
                                    <button
                                      onClick={() => duplicateChapter(ch)}
                                      className="p-1.5 bg-slate-100 dark:bg-warmbrown text-slate-600 dark:text-slate-400 rounded-lg hover:text-rosegold hover:bg-rosegold/10 transition"
                                      title="Duplicar"
                                    >
                                      <Copy className="h-3 w-3" />
                                    </button>
                                    <button
                                      onClick={() => deleteChapter(ch.id)}
                                      className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                                      title="Excluir"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                </div>

                                {/* List of days inside chapter */}
                                <div className="p-4 bg-white/40 dark:bg-transparent">
                                  {chDays.length === 0 ? (
                                    <div className="text-center p-4 text-[11px] text-slate-400 italic">
                                      Nenhuma lição neste capítulo. Clique em "+ Inserir Lição" acima.
                                    </div>
                                  ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                      {chDays.map(day => (
                                        <div 
                                          key={day.id}
                                          className="border border-rose-100/10 dark:border-rosegold/5 rounded-xl p-3 bg-[#FAF8F5]/30 dark:bg-warmbrown-light/5 hover:border-rosegold/30 transition-all flex flex-col justify-between h-28"
                                        >
                                          <div>
                                            <div className="flex justify-between items-center text-[10px] font-mono text-rosegold">
                                              <span>Dia {day.dayNumber}</span>
                                              <span className="bg-rose-50/50 dark:bg-warmbrown text-slate-400 px-1.5 py-0.5 rounded uppercase font-bold text-[8px]">
                                                {day.type}
                                              </span>
                                            </div>
                                            <h5 className="text-xs font-bold text-slate-800 dark:text-white line-clamp-1 mt-1">
                                              {day.title.pt}
                                            </h5>
                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-1 italic mt-0.5">
                                              {day.hook.pt}
                                            </p>
                                          </div>

                                          <div className="flex justify-end gap-1 border-t border-rose-100/5 pt-2">
                                            <button
                                              onClick={() => setEditingDay(day)}
                                              className="p-1 text-slate-500 dark:text-slate-400 hover:text-rosegold transition"
                                              title="Editar Lição"
                                            >
                                              <Edit className="h-3 w-3" />
                                            </button>
                                            <button
                                              onClick={() => duplicateDay(day)}
                                              className="p-1 text-slate-500 dark:text-slate-400 hover:text-rosegold transition"
                                              title="Duplicar"
                                            >
                                              <Copy className="h-3 w-3" />
                                            </button>
                                            <button
                                              onClick={() => deleteDay(day.id)}
                                              className="p-1 text-red-500 hover:text-red-700 transition"
                                              title="Excluir"
                                            >
                                              <Trash2 className="h-3 w-3" />
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()
            )}

            {/* Editing Journey details FORM */}
            {editingJourney && (
              <div className="bg-white dark:bg-[#2C221E] rounded-2xl border border-rose-100/25 dark:border-rosegold/10 p-6 space-y-6">
                <div className="flex justify-between items-center border-b border-rose-100/10 pb-4">
                  <h3 className="text-md font-serif font-black uppercase text-slate-800 dark:text-white">
                    Editar Detalhes da Jornada ({editingJourney.id})
                  </h3>
                  <button
                    onClick={() => setEditingJourney(null)}
                    className="text-slate-400 hover:text-slate-600 text-xs"
                  >
                    Voltar ao Quadro
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Título (PT)</label>
                    <input 
                      type="text" 
                      value={editingJourney.title.pt}
                      onChange={e => setEditingJourney({ ...editingJourney, title: { ...editingJourney.title, pt: e.target.value } })}
                      className="w-full bg-slate-50 dark:bg-warmbrown border border-rose-100/20 dark:border-rosegold/10 p-2.5 rounded-xl text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Título (EN)</label>
                    <input 
                      type="text" 
                      value={editingJourney.title.en}
                      onChange={e => setEditingJourney({ ...editingJourney, title: { ...editingJourney.title, en: e.target.value } })}
                      className="w-full bg-slate-50 dark:bg-warmbrown border border-rose-100/20 dark:border-rosegold/10 p-2.5 rounded-xl text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Subtítulo (PT)</label>
                    <input 
                      type="text" 
                      value={editingJourney.subtitle.pt}
                      onChange={e => setEditingJourney({ ...editingJourney, subtitle: { ...editingJourney.subtitle, pt: e.target.value } })}
                      className="w-full bg-slate-50 dark:bg-warmbrown border border-rose-100/20 dark:border-rosegold/10 p-2.5 rounded-xl text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Imagem de Capa (URL)</label>
                    <input 
                      type="text" 
                      value={editingJourney.coverImage}
                      onChange={e => setEditingJourney({ ...editingJourney, coverImage: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-warmbrown border border-rose-100/20 dark:border-rosegold/10 p-2.5 rounded-xl text-xs"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Descrição Longa (PT)</label>
                    <textarea 
                      rows={3}
                      value={editingJourney.description.pt}
                      onChange={e => setEditingJourney({ ...editingJourney, description: { ...editingJourney.description, pt: e.target.value } })}
                      className="w-full bg-slate-50 dark:bg-warmbrown border border-rose-100/20 dark:border-rosegold/10 p-2.5 rounded-xl text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Dificuldade</label>
                    <select
                      value={editingJourney.difficulty}
                      onChange={e => setEditingJourney({ ...editingJourney, difficulty: e.target.value as any })}
                      className="w-full bg-slate-50 dark:bg-warmbrown border border-rose-100/20 dark:border-rosegold/10 p-2.5 rounded-xl text-xs"
                    >
                      <option value="beginner">Iniciante</option>
                      <option value="intermediate">Intermediário</option>
                      <option value="advanced">Avançado</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Status</label>
                    <select
                      value={editingJourney.status}
                      onChange={e => setEditingJourney({ ...editingJourney, status: e.target.value as any })}
                      className="w-full bg-slate-50 dark:bg-warmbrown border border-rose-100/20 dark:border-rosegold/10 p-2.5 rounded-xl text-xs"
                    >
                      <option value="draft">Rascunho</option>
                      <option value="published">Publicado</option>
                      <option value="archived">Arquivado</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-rose-100/10">
                  <button
                    onClick={() => setEditingJourney(null)}
                    className="px-4 py-2 bg-slate-100 dark:bg-warmbrown text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      const updated = journeys.map(j => j.id === editingJourney.id ? editingJourney : j);
                      setJourneys(updated);
                      saveJourneysToStorage(updated);
                      setEditingJourney(null);
                      showNotice('Detalhes da jornada salvos!');
                    }}
                    className="px-4 py-2 bg-rosegold text-white rounded-xl text-xs font-bold"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </div>
            )}

            {/* Editing Chapter details FORM */}
            {editingChapter && (
              <div className="bg-white dark:bg-[#2C221E] rounded-2xl border border-rose-100/25 dark:border-rosegold/10 p-6 space-y-6">
                <div className="flex justify-between items-center border-b border-rose-100/10 pb-4">
                  <h3 className="text-md font-serif font-black uppercase text-slate-800 dark:text-white">
                    Editar Detalhes do Capítulo
                  </h3>
                  <button
                    onClick={() => setEditingChapter(null)}
                    className="text-slate-400 hover:text-slate-600 text-xs"
                  >
                    Voltar
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Título (PT)</label>
                    <input 
                      type="text" 
                      value={editingChapter.title.pt}
                      onChange={e => setEditingChapter({ ...editingChapter, title: { ...editingChapter.title, pt: e.target.value } })}
                      className="w-full bg-slate-50 dark:bg-warmbrown border border-rose-100/20 dark:border-rosegold/10 p-2.5 rounded-xl text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Sub-tema de Foco</label>
                    <input 
                      type="text" 
                      value={editingChapter.theme.pt}
                      onChange={e => setEditingChapter({ ...editingChapter, theme: { ...editingChapter.theme, pt: e.target.value } })}
                      className="w-full bg-slate-50 dark:bg-warmbrown border border-rose-100/20 dark:border-rosegold/10 p-2.5 rounded-xl text-xs"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Descrição (PT)</label>
                    <input 
                      type="text" 
                      value={editingChapter.description.pt}
                      onChange={e => setEditingChapter({ ...editingChapter, description: { ...editingChapter.description, pt: e.target.value } })}
                      className="w-full bg-slate-50 dark:bg-warmbrown border border-rose-100/20 dark:border-rosegold/10 p-2.5 rounded-xl text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Distintivo / Badge Ícone</label>
                    <select
                      value={editingChapter.chapterBadge}
                      onChange={e => setEditingChapter({ ...editingChapter, chapterBadge: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-warmbrown border border-rose-100/20 dark:border-rosegold/10 p-2.5 rounded-xl text-xs"
                    >
                      <option value="Compass">Compass (Bússola)</option>
                      <option value="Star">Star (Estrela)</option>
                      <option value="Heart">Heart (Coração)</option>
                      <option value="Award">Award (Troféu)</option>
                      <option value="BookOpen">Book (Livro)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Efeito de Consagração</label>
                    <select
                      value={editingChapter.celebrationAnimation}
                      onChange={e => setEditingChapter({ ...editingChapter, celebrationAnimation: e.target.value as any })}
                      className="w-full bg-slate-50 dark:bg-warmbrown border border-rose-100/20 dark:border-rosegold/10 p-2.5 rounded-xl text-xs"
                    >
                      <option value="confetti">Confetti Clássico</option>
                      <option value="fireworks">Fogo de Artifício</option>
                      <option value="sparkles">Cascatas Brilhantes</option>
                      <option value="none">Sem Animação</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-rose-100/10">
                  <button
                    onClick={() => setEditingChapter(null)}
                    className="px-4 py-2 bg-slate-100 dark:bg-warmbrown text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      const updated = chapters.map(c => c.id === editingChapter.id ? editingChapter : c);
                      setChapters(updated);
                      saveChaptersToStorage(updated);
                      setEditingChapter(null);
                      showNotice('Capítulo salvo com sucesso!');
                    }}
                    className="px-4 py-2 bg-rosegold text-white rounded-xl text-xs font-bold"
                  >
                    Salvar Capítulo
                  </button>
                </div>
              </div>
            )}

            {/* Editing Day / Lesson details FORM */}
            {editingDay && (
              <div className="bg-white dark:bg-[#2C221E] rounded-2xl border border-rose-100/25 dark:border-rosegold/10 p-6 space-y-6">
                <div className="flex justify-between items-center border-b border-rose-100/10 pb-4">
                  <h3 className="text-md font-serif font-black uppercase text-slate-800 dark:text-white">
                    Editar Lição (Dia {editingDay.dayNumber})
                  </h3>
                  <button
                    onClick={() => setEditingDay(null)}
                    className="text-slate-400 hover:text-slate-600 text-xs"
                  >
                    Voltar
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Título da Lição (PT)</label>
                    <input 
                      type="text" 
                      value={editingDay.title.pt}
                      onChange={e => setEditingDay({ ...editingDay, title: { ...editingDay.title, pt: e.target.value } })}
                      className="w-full bg-slate-50 dark:bg-warmbrown border border-rose-100/20 dark:border-rosegold/10 p-2.5 rounded-xl text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Sub-tema do Dia (PT)</label>
                    <input 
                      type="text" 
                      value={editingDay.theme?.pt || ''}
                      onChange={e => setEditingDay({ ...editingDay, theme: { pt: e.target.value, en: e.target.value, es: e.target.value } })}
                      className="w-full bg-slate-50 dark:bg-warmbrown border border-rose-100/20 dark:border-rosegold/10 p-2.5 rounded-xl text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400">URL do Áudio Guia (.mp3 / .ogg)</label>
                    <input 
                      type="text" 
                      value={editingDay.audioUrl}
                      onChange={e => setEditingDay({ ...editingDay, audioUrl: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-warmbrown border border-rose-100/20 dark:border-rosegold/10 p-2.5 rounded-xl text-xs text-rosegold font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400">URL do Vídeo Explicativo</label>
                    <input 
                      type="text" 
                      value={editingDay.videoUrl}
                      onChange={e => setEditingDay({ ...editingDay, videoUrl: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-warmbrown border border-rose-100/20 dark:border-rosegold/10 p-2.5 rounded-xl text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Gancho Magnético / Hook do Dia</label>
                    <textarea 
                      rows={2}
                      value={editingDay.hook.pt}
                      onChange={e => setEditingDay({ ...editingDay, hook: { ...editingDay.hook, pt: e.target.value } })}
                      className="w-full bg-slate-50 dark:bg-warmbrown border border-rose-100/20 dark:border-rosegold/10 p-2.5 rounded-xl text-xs"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Ação de Exposição / Missão Prática (PT)</label>
                    <textarea 
                      rows={2}
                      value={editingDay.mission.pt}
                      onChange={e => setEditingDay({ ...editingDay, mission: { ...editingDay.mission, pt: e.target.value } })}
                      className="w-full bg-slate-50 dark:bg-warmbrown border border-rose-100/20 dark:border-rosegold/10 p-2.5 rounded-xl text-xs"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Roteiros Sugeridos (Três Opções Prontas)</label>
                    <div className="space-y-2">
                      {editingDay.scripts.pt.map((script, sIdx) => (
                        <textarea
                          key={sIdx}
                          rows={2}
                          value={script}
                          onChange={e => {
                            const copyScripts = [...editingDay.scripts.pt];
                            copyScripts[sIdx] = e.target.value;
                            setEditingDay({ ...editingDay, scripts: { ...editingDay.scripts, pt: copyScripts } });
                          }}
                          className="w-full bg-slate-50 dark:bg-warmbrown border border-rose-100/20 dark:border-rosegold/10 p-2 rounded-xl text-xs font-mono"
                          placeholder={`Opção ${sIdx + 1}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Pergunta Reflexiva do Diário (PT)</label>
                    <input 
                      type="text" 
                      value={editingDay.reflection.pt}
                      onChange={e => setEditingDay({ ...editingDay, reflection: { ...editingDay.reflection, pt: e.target.value } })}
                      className="w-full bg-slate-50 dark:bg-warmbrown border border-rose-100/20 dark:border-rosegold/10 p-2.5 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-rose-100/10">
                  <button
                    onClick={() => setEditingDay(null)}
                    className="px-4 py-2 bg-slate-100 dark:bg-warmbrown text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      const updated = studioDays.map(d => d.id === editingDay.id ? editingDay : d);
                      syncWithApp(updated);
                      setEditingDay(null);
                      showNotice(`Lição do Dia ${editingDay.dayNumber} salva!`);
                    }}
                    className="px-4 py-2 bg-rosegold text-white rounded-xl text-xs font-bold"
                  >
                    Salvar Lição
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Community MODULE */}
        {activeModule === 'community' && (
          <div className="bg-white dark:bg-[#2C221E] rounded-2xl border border-rose-100/25 dark:border-rosegold/10 p-6 space-y-6">
            <div className="border-b border-rose-100/10 pb-4">
              <h1 className="text-xl font-serif font-bold text-slate-800 dark:text-white uppercase flex items-center gap-2">
                <Users className="h-5 w-5 text-rosegold" /> Portal de Comunidade VIP
              </h1>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Configure os canais onde seus alunos interagem, validam ganchos de vídeo e fazem parcerias.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-400">Nome do Ecossistema (PT)</label>
                <input 
                  type="text" 
                  value={community.name.pt}
                  onChange={e => setCommunity({ ...community, name: { ...community.name, pt: e.target.value } })}
                  className="w-full bg-slate-50 dark:bg-warmbrown border border-rose-100/20 dark:border-rosegold/10 p-2.5 rounded-xl text-xs font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-400">Link de Convite Direto</label>
                <input 
                  type="text" 
                  value={community.joinLink}
                  onChange={e => setCommunity({ ...community, joinLink: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-warmbrown border border-rose-100/20 dark:border-rosegold/10 p-2.5 rounded-xl text-xs text-rosegold font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-400">Título do Botão CTA (PT)</label>
                <input 
                  type="text" 
                  value={community.buttonTitle.pt}
                  onChange={e => setCommunity({ ...community, buttonTitle: { ...community.buttonTitle, pt: e.target.value } })}
                  className="w-full bg-slate-50 dark:bg-warmbrown border border-rose-100/20 dark:border-rosegold/10 p-2.5 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-400">Plataforma</label>
                <select
                  value={community.platform}
                  onChange={e => setCommunity({ ...community, platform: e.target.value as any })}
                  className="w-full bg-slate-50 dark:bg-warmbrown border border-rose-100/20 dark:border-rosegold/10 p-2.5 rounded-xl text-xs font-bold"
                >
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Telegram">Telegram</option>
                  <option value="Circle">Circle</option>
                  <option value="Skool">Skool</option>
                  <option value="Slack">Slack</option>
                  <option value="Discord">Discord</option>
                </select>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-bold uppercase text-slate-400">Descrição Detalhada do Ecossistema (PT)</label>
                <textarea 
                  rows={3}
                  value={community.description.pt}
                  onChange={e => setCommunity({ ...community, description: { ...community.description, pt: e.target.value } })}
                  className="w-full bg-slate-50 dark:bg-warmbrown border border-rose-100/20 dark:border-rosegold/10 p-2.5 rounded-xl text-xs leading-relaxed"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-rose-100/10">
              <button
                onClick={() => {
                  saveCommunityConfig(community);
                  showNotice('Canal de Comunidade atualizado!');
                }}
                className="px-6 py-2 bg-rosegold text-white text-xs uppercase font-sans font-bold tracking-wider rounded-xl hover:bg-[#A35D68] transition"
              >
                Salvar Configurações
              </button>
            </div>
          </div>
        )}

        {/* Mentorship MODULE */}
        {activeModule === 'mentorship' && (
          <div className="bg-white dark:bg-[#2C221E] rounded-2xl border border-rose-100/25 dark:border-rosegold/10 p-6 space-y-6">
            <div className="border-b border-rose-100/10 pb-4">
              <h1 className="text-xl font-serif font-bold text-slate-800 dark:text-white uppercase flex items-center gap-2">
                <Heart className="h-5 w-5 text-rosegold" /> Módulo de Mentorias Privadas
              </h1>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Ofereça atendimentos 1-on-1 para destravar vocalmente seus líderes de conteúdo diretamente por plataformas integradas de agenda.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-400">Headline Chamativa (PT)</label>
                <input 
                  type="text" 
                  value={mentorship.title.pt}
                  onChange={e => setMentoring({ ...mentorship, title: { ...mentorship.title, pt: e.target.value } })}
                  className="w-full bg-slate-50 dark:bg-warmbrown border border-rose-100/20 dark:border-rosegold/10 p-2.5 rounded-xl text-xs font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-400">Provedor de Agenda</label>
                <select
                  value={mentorship.provider}
                  onChange={e => setMentoring({ ...mentorship, provider: e.target.value as any })}
                  className="w-full bg-slate-50 dark:bg-warmbrown border border-rose-100/20 dark:border-rosegold/10 p-2.5 rounded-xl text-xs font-bold"
                >
                  <option value="Calendly">Calendly Integration</option>
                  <option value="Google Calendar">Google Calendar Bookings</option>
                  <option value="Custom Booking System">Sistema de Reserva Externo</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-400">Link de Agendamento</label>
                <input 
                  type="text" 
                  value={mentorship.bookingUrl}
                  onChange={e => setMentoring({ ...mentorship, bookingUrl: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-warmbrown border border-rose-100/20 dark:border-rosegold/10 p-2.5 rounded-xl text-xs text-rosegold font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-400">Texto CTA do Botão (PT)</label>
                <input 
                  type="text" 
                  value={mentorship.ctaText.pt}
                  onChange={e => setMentoring({ ...mentorship, ctaText: { ...mentorship.ctaText, pt: e.target.value } })}
                  className="w-full bg-slate-50 dark:bg-warmbrown border border-rose-100/20 dark:border-rosegold/10 p-2.5 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-bold uppercase text-slate-400">Descrição Detalhada do Encontro (PT)</label>
                <textarea 
                  rows={3}
                  value={mentorship.description.pt}
                  onChange={e => setMentoring({ ...mentorship, description: { ...mentorship.description, pt: e.target.value } })}
                  className="w-full bg-slate-50 dark:bg-warmbrown border border-rose-100/20 dark:border-rosegold/10 p-2.5 rounded-xl text-xs leading-relaxed"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-rose-100/10">
              <button
                onClick={() => {
                  saveMentoringConfig(mentorship);
                  showNotice('Módulo de mentoria atualizado!');
                }}
                className="px-6 py-2 bg-rosegold text-white text-xs uppercase font-sans font-bold tracking-wider rounded-xl hover:bg-[#A35D68] transition"
              >
                Salvar Mentorias
              </button>
            </div>
          </div>
        )}

        {/* Centralized Media Library MODULE */}
        {activeModule === 'library' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-rose-100/10 pb-4">
              <div>
                <h1 className="text-xl font-serif font-bold text-slate-800 dark:text-white uppercase flex items-center gap-2">
                  <Folder className="h-5 w-5 text-rosegold" /> Biblioteca de Mídias Centralizada
                </h1>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Insira arquivos em PDF, áudios práticos, apostilas de exercícios ou desafios extras que podem ser acessados na aba Biblioteca.
                </p>
              </div>
              <button
                onClick={() => setEditingAsset({
                  id: 'lib_' + Date.now(),
                  title: { pt: 'Novo Recurso Didático', en: 'New Material', es: 'Nuevo Material' },
                  description: { pt: 'Guia de apoio prático.', en: 'Practical companion file.', es: 'Guía de apoyo.' },
                  category: 'workbooks',
                  mediaUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                  durationOrSize: '1.2 MB'
                })}
                className="px-3 py-1.5 bg-rosegold text-white text-xs font-bold rounded-xl"
              >
                + Adicionar Recurso
              </button>
            </div>

            {editingAsset ? (
              <div className="bg-white dark:bg-[#2C221E] rounded-2xl border border-rose-100/25 dark:border-rosegold/10 p-6 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-800 dark:text-white">
                  {editingAsset.isCustom ? 'Editar' : 'Cadastrar'} Material
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Título (PT)</label>
                    <input 
                      type="text" 
                      value={editingAsset.title.pt}
                      onChange={e => setEditingAsset({ ...editingAsset, title: { ...editingAsset.title, pt: e.target.value } })}
                      className="w-full bg-slate-50 dark:bg-warmbrown border p-2 rounded-lg text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Categoria</label>
                    <select
                      value={editingAsset.category}
                      onChange={e => setEditingAsset({ ...editingAsset, category: e.target.value as any })}
                      className="w-full bg-slate-50 dark:bg-warmbrown border p-2 rounded-lg text-xs"
                    >
                      <option value="workbooks">Apostila / Workbook</option>
                      <option value="pdfs">Informativo PDF</option>
                      <option value="meditations">Áudio de Calibração</option>
                      <option value="masterclasses">Masterclass em Vídeo</option>
                      <option value="challenges">Desafio Extra</option>
                    </select>
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400">URL do Arquivo (PDF / MP3 / MP4)</label>
                    <input 
                      type="text" 
                      value={editingAsset.mediaUrl}
                      onChange={e => setEditingAsset({ ...editingAsset, mediaUrl: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-warmbrown border p-2 rounded-lg text-xs font-mono text-rosegold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Tamanho ou Duração (ex: "4.2 MB" ou "42 mins")</label>
                    <input 
                      type="text" 
                      value={editingAsset.durationOrSize}
                      onChange={e => setEditingAsset({ ...editingAsset, durationOrSize: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-warmbrown border p-2 rounded-lg text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Descrição Curta (PT)</label>
                    <input 
                      type="text" 
                      value={editingAsset.description.pt}
                      onChange={e => setEditingAsset({ ...editingAsset, description: { ...editingAsset.description, pt: e.target.value } })}
                      className="w-full bg-slate-50 dark:bg-warmbrown border p-2 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setEditingAsset(null)}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-warmbrown text-xs rounded-lg font-bold text-slate-600"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      let list = [...library];
                      const idx = list.findIndex(a => a.id === editingAsset.id);
                      if (idx > -1) list[idx] = { ...editingAsset, isCustom: true };
                      else list.push({ ...editingAsset, isCustom: true });

                      setLibrary(list);
                      saveLibraryAssets(list);
                      setEditingAsset(null);
                      showNotice('Material de Apoio salvo com sucesso!');
                    }}
                    className="px-3 py-1.5 bg-rosegold text-white text-xs rounded-lg font-bold"
                  >
                    Salvar Arquivo
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {library.map(asset => (
                  <div 
                    key={asset.id} 
                    className="bg-white dark:bg-[#2C221E] border border-rose-100/10 dark:border-rosegold/5 p-4 rounded-xl flex justify-between gap-4"
                  >
                    <div>
                      <span className="text-[9px] font-mono font-bold text-rosegold uppercase bg-rose-50 dark:bg-warmbrown px-1.5 py-0.5 rounded">
                        {asset.category}
                      </span>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white mt-1.5">
                        {asset.title.pt}
                      </h4>
                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{asset.description.pt}</p>
                      <span className="text-[9px] font-mono text-slate-400 block mt-2">{asset.durationOrSize} • {asset.mediaUrl.substring(0, 45)}...</span>
                    </div>

                    <div className="flex flex-col justify-between items-end shrink-0">
                      <button
                        onClick={() => {
                          const filtered = library.filter(a => a.id !== asset.id);
                          setLibrary(filtered);
                          saveLibraryAssets(filtered);
                          showNotice('Arquivo excluído.');
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Remover"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingAsset(asset)}
                        className="text-slate-400 hover:text-rosegold text-xs"
                      >
                        Editar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Support & FAQ MODULE */}
        {activeModule === 'support' && (
          <div className="bg-white dark:bg-[#2C221E] rounded-2xl border border-rose-100/25 dark:border-rosegold/10 p-6 space-y-6">
            <div className="border-b border-rose-100/10 pb-4">
              <h1 className="text-xl font-serif font-bold text-slate-800 dark:text-white uppercase flex items-center gap-2">
                <PhoneCall className="h-5 w-5 text-rosegold" /> Suporte & FAQs
              </h1>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Configure canais diretos de emergência no WhatsApp e monte uma lista dinâmica de FAQs.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">Email de Suporte</label>
                <input 
                  type="text" 
                  value={support.email}
                  onChange={e => setSupport({ ...support, email: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-warmbrown border p-2.5 rounded-xl text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">WhatsApp Oficial Helpline</label>
                <input 
                  type="text" 
                  value={support.whatsapp}
                  onChange={e => setSupport({ ...support, whatsapp: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-warmbrown border p-2.5 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] font-bold uppercase text-slate-400">Mensagem Curta de SOS / Emergência (PT)</label>
                <textarea 
                  rows={2}
                  value={support.emergencyMessage.pt}
                  onChange={e => setSupport({ ...support, emergencyMessage: { ...support.emergencyMessage, pt: e.target.value } })}
                  className="w-full bg-slate-50 dark:bg-warmbrown border p-2.5 rounded-xl text-xs"
                />
              </div>
            </div>

            {/* List and edit FAQs */}
            <div className="space-y-4 border-t border-rose-100/10 pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white">
                Lista de FAQs Cadastradas
              </h3>
              <div className="space-y-3">
                {support.faqs.map((faq, idx) => (
                  <div key={faq.id} className="border border-rose-100/10 p-3 rounded-xl bg-slate-50/50 dark:bg-warmbrown-light/5 relative">
                    <button
                      onClick={() => {
                        const filtered = support.faqs.filter(f => f.id !== faq.id);
                        setSupport({ ...support, faqs: filtered });
                        showNotice('FAQ removida.');
                      }}
                      className="absolute top-3 right-3 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <input 
                      type="text" 
                      value={faq.question.pt}
                      onChange={e => {
                        const copy = [...support.faqs];
                        copy[idx].question.pt = e.target.value;
                        setSupport({ ...support, faqs: copy });
                      }}
                      className="w-11/12 bg-transparent border-b border-rose-100/10 font-bold text-xs pb-1"
                      placeholder="Pergunta"
                    />
                    <textarea 
                      rows={2}
                      value={faq.answer.pt}
                      onChange={e => {
                        const copy = [...support.faqs];
                        copy[idx].answer.pt = e.target.value;
                        setSupport({ ...support, faqs: copy });
                      }}
                      className="w-full bg-transparent text-[11px] text-slate-500 mt-2"
                      placeholder="Resposta"
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  const newFaq = {
                    id: 'faq_' + Date.now(),
                    question: { pt: 'Nova Pergunta Frequente', en: 'New Question', es: 'Nueva Pregunta' },
                    answer: { pt: 'Escreva a resposta simplificada aqui.', en: 'Answer here.', es: 'Respuesta aquí.' }
                  };
                  setSupport({ ...support, faqs: [...support.faqs, newFaq] });
                }}
                className="px-3 py-1.5 bg-slate-100 dark:bg-warmbrown text-[10px] font-bold rounded-lg hover:bg-rosegold/10 text-slate-700 hover:text-rosegold"
              >
                + Inserir Nova Pergunta (FAQ)
              </button>
            </div>

            <div className="flex justify-end pt-4 border-t border-rose-100/10">
              <button
                onClick={() => {
                  saveSupportConfig(support);
                  showNotice('Suporte e FAQs sincronizados com sucesso!');
                }}
                className="px-6 py-2 bg-rosegold text-white text-xs uppercase font-sans font-bold tracking-wider rounded-xl hover:bg-[#A35D68] transition"
              >
                Salvar FAQs
              </button>
            </div>
          </div>
        )}

        {/* Analytics PANEL MODULE */}
        {activeModule === 'analytics' && (
          <div className="space-y-6">
            <div className="border-b border-rose-100/10 pb-4">
              <h1 className="text-xl font-serif font-bold text-slate-800 dark:text-white uppercase flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-rosegold" /> Métricas & Insights
              </h1>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Acompanhe o engajamento dos alunos nas lições, média de consistência de hábitos diários e taxas de conclusão.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-[#2C221E] border border-rose-100/20 dark:border-rosegold/10 p-5 rounded-2xl">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Média de Conclusão</span>
                <div className="text-2xl font-black text-slate-800 dark:text-white">82%</div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-rosegold h-full rounded-full" style={{ width: '82%' }} />
                </div>
              </div>

              <div className="bg-white dark:bg-[#2C221E] border border-rose-100/20 dark:border-rosegold/10 p-5 rounded-2xl">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Retenção (Semana 2)</span>
                <div className="text-2xl font-black text-slate-800 dark:text-white">74%</div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-accentgold h-full rounded-full" style={{ width: '74%' }} />
                </div>
              </div>

              <div className="bg-white dark:bg-[#2C221E] border border-rose-100/20 dark:border-rosegold/10 p-5 rounded-2xl">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Suporte Acionado (SOS)</span>
                <div className="text-2xl font-black text-slate-800 dark:text-white">12%</div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-[#B76E79] h-full rounded-full" style={{ width: '12%' }} />
                </div>
              </div>
            </div>

            {/* Simulated graph elements */}
            <div className="bg-white dark:bg-[#2C221E] border border-rose-100/20 dark:border-rosegold/10 p-6 rounded-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-rose-100/10 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white">
                  Presença Semanal e Picos de Engajamento
                </h3>
                <span className="text-[10px] font-mono text-slate-400">ÚLTIMOS 7 DIAS</span>
              </div>
              <div className="h-48 flex items-end justify-between gap-2 pt-6">
                {[45, 60, 52, 85, 78, 92, 65].map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="text-[9px] font-mono font-bold text-rosegold">{val}%</div>
                    <div 
                      className="w-full rounded-t-lg bg-gradient-to-t from-rosegold to-accentgold"
                      style={{ height: `${val * 1.2}px` }}
                    />
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold">
                      {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'][i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users list MODULE */}
        {activeModule === 'users' && (
          <div className="bg-white dark:bg-[#2C221E] rounded-2xl border border-rose-100/25 dark:border-rosegold/10 p-6 space-y-6">
            <div className="border-b border-rose-100/10 pb-4">
              <h1 className="text-xl font-serif font-bold text-slate-800 dark:text-white uppercase flex items-center gap-2">
                <Users className="h-5 w-5 text-rosegold" /> Alunos & Diários de bordo
              </h1>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Audite diários, feedbacks e certificados emitidos para os alunos ativos no portal.
              </p>
            </div>

            <div className="divide-y divide-rose-100/15">
              <div className="py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-rosegold/10 text-rosegold flex items-center justify-center font-bold">
                    RS
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white">rcl.sampaio@gmail.com</h4>
                    <span className="text-[10px] text-slate-400">Aluno Primordial • Ativo hoje</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-rosegold block">Dia 30 / 30 Concluído</span>
                  <span className="text-[9px] text-emerald-500 font-extrabold uppercase">Certificado Disponível</span>
                </div>
              </div>

              <div className="py-4">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Reflexões e Scrapbook Emocional Recente:</h4>
                <div className="border border-rose-100/10 bg-[#FAF8F5]/30 p-3 rounded-xl text-xs leading-relaxed text-slate-600 italic">
                  "Sinto que o portal de visibilidade me provou que errar é seguro. Gravar de forma imperfeita me libertou da autocrítica crônica. Minha voz agora pertence ao mundo."
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
