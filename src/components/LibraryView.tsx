/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Play, Heart, Download, BookOpen, Volume2, FileText,
  Sparkles, CheckCircle2, RotateCcw, Maximize, Clock, ListFilter,
  Check, Pause, RefreshCw, Eye, Settings, HelpCircle, AlertCircle, Headphones
} from 'lucide-react';
import { Language, LibraryAsset, SupportConfig, UserProgress } from '../types';
import { loadLibraryAssets, saveLibraryAssets, loadSupportConfig } from '../data/ecosystemData';
import { adaptMessage, resolveGrammarPreference } from '../utils/grammar';

interface LibraryViewProps {
  lang: Language;
  progress: UserProgress;
  onUpdateProgress: (newProgress: UserProgress) => void;
}

export default function LibraryView({ lang, progress, onUpdateProgress }: LibraryViewProps) {
  const prefGrammar = resolveGrammarPreference(progress.grammarPreference);
  const [assets, setAssets] = useState<LibraryAsset[]>(() => loadLibraryAssets());
  const [support, setSupport] = useState<SupportConfig>(() => loadSupportConfig());

  // Derives a YouTube thumbnail straight from the share URL, so the weekly
  // video cover updates automatically whenever the link changes.
  const getYouTubeThumbnail = (url: string): string | null => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/);
    return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
  };
  const currentWeeklyVideo = support.weeklyVideos[support.weeklyVideos.length - 1] || '';
  const weeklyVideoThumbnail = getYouTubeThumbnail(currentWeeklyVideo);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Media Player states
  const [activeAsset, setActiveAsset] = useState<LibraryAsset | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showCaptions, setShowCaptions] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Favorites tracking
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    const stored = localStorage.getItem('renaser_favorite_library_ids');
    return stored ? JSON.parse(stored) : [];
  });

  // Watch position tracking
  const [watchedPositions, setWatchedPositions] = useState<Record<string, number>>(() => {
    const stored = localStorage.getItem('renaser_library_positions');
    return stored ? JSON.parse(stored) : {};
  });

  // Completed items tracking
  const [completedIds, setCompletedIds] = useState<string[]>(() => {
    const stored = localStorage.getItem('renaser_completed_library_ids');
    return stored ? JSON.parse(stored) : [];
  });

  // Reload assets from localStorage occasionally or when updated
  useEffect(() => {
    const handleStorageChange = () => {
      setAssets(loadLibraryAssets());
      setSupport(loadSupportConfig());
    };
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(handleStorageChange, 1200);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Save favorites & watched status changes
  useEffect(() => {
    localStorage.setItem('renaser_favorite_library_ids', JSON.stringify(favoriteIds));
  }, [favoriteIds]);

  useEffect(() => {
    localStorage.setItem('renaser_library_positions', JSON.stringify(watchedPositions));
  }, [watchedPositions]);

  useEffect(() => {
    localStorage.setItem('renaser_completed_library_ids', JSON.stringify(completedIds));
  }, [completedIds]);

  // Handle active asset play trigger
  const handlePlayAsset = (asset: LibraryAsset) => {
    // YouTube links (e.g. the weekly video) can't play in the native
    // <video>/<audio> tags the inline player uses — open them externally instead.
    if (/youtu\.?be/.test(asset.mediaUrl)) {
      window.open(asset.mediaUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    setActiveAsset(asset);
    setIsPlaying(true);
    setCurrentTime(0);
    setDuration(0);

    // Continue Watching restoration
    const savedPos = watchedPositions[asset.id] || 0;
    setTimeout(() => {
      if (asset.category === 'audios' || asset.category === 'meditations') {
        if (audioRef.current) {
          audioRef.current.currentTime = savedPos;
          audioRef.current.playbackRate = playbackSpeed;
          audioRef.current.play().catch(e => console.log('Audio autoplay blocked', e));
        }
      } else {
        if (videoRef.current) {
          videoRef.current.currentTime = savedPos;
          videoRef.current.playbackRate = playbackSpeed;
          videoRef.current.play().catch(e => console.log('Video autoplay blocked', e));
        }
      }
    }, 150);
  };

  // Close player
  const handleClosePlayer = () => {
    if (activeAsset) {
      // Save current watched location
      const finalPos = activeAsset.category === 'audios' || activeAsset.category === 'meditations'
        ? audioRef.current?.currentTime || 0
        : videoRef.current?.currentTime || 0;
      setWatchedPositions(prev => ({ ...prev, [activeAsset.id]: finalPos }));
    }
    setActiveAsset(null);
    setIsPlaying(false);
  };

  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavoriteIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleMarkCompleted = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCompletedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Update speed
  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) videoRef.current.playbackRate = speed;
    if (audioRef.current) audioRef.current.playbackRate = speed;
  };

  // Picture in Picture helper
  const handlePip = async () => {
    if (videoRef.current && document.pictureInPictureEnabled) {
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await videoRef.current.requestPictureInPicture();
        }
      } catch (e) {
        console.error('Picture in Picture failed', e);
      }
    }
  };

  // Time progress callback
  const handleTimeUpdate = () => {
    let current = 0;
    let dur = 0;

    if (activeAsset?.category === 'audios' || activeAsset?.category === 'meditations') {
      if (audioRef.current) {
        current = audioRef.current.currentTime;
        dur = audioRef.current.duration || 0;
      }
    } else {
      if (videoRef.current) {
        current = videoRef.current.currentTime;
        dur = videoRef.current.duration || 0;
      }
    }

    setCurrentTime(current);
    if (dur > 0) {
      setDuration(dur);
      
      // Auto save watch progress every 5 seconds
      if (Math.floor(current) % 5 === 0) {
        setWatchedPositions(prev => ({ ...prev, [activeAsset!.id]: current }));
      }

      // Mark completed automatically if >90% watched
      if (current / dur > 0.90 && !completedIds.includes(activeAsset!.id)) {
        setCompletedIds(prev => [...prev, activeAsset!.id]);
      }
    }
  };

  // Skip back 10 seconds
  const handleSkipBack10 = () => {
    const target = activeAsset?.category === 'audios' || activeAsset?.category === 'meditations'
      ? audioRef.current
      : videoRef.current;
    if (target) {
      target.currentTime = Math.max(0, target.currentTime - 10);
    }
  };

  // Format times (e.g. 05:22)
  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Categories translation/icon maps
  const categories = [
    { key: 'all', icon: null },
    { key: 'videos', icon: Play },
    { key: 'audios', icon: Volume2 },
    { key: 'articles', icon: BookOpen },
    { key: 'pdfs', icon: FileText },
    { key: 'meditations', icon: Heart },
    { key: 'challenges', icon: Sparkles },
    { key: 'masterclasses', icon: Sparkles }
  ];

  // Mock captions track for mock/real videos
  const getSubtitles = () => {
    if (currentTime < 10) {
      return {
        pt: "✨ Bem-vindo ao RenaSer. Hoje, respire fundo e sinta sua voz se conectando com seu coração.",
        en: "✨ Welcome to RenaSer. Today, take a deep breath and feel your voice connect with your heart.",
        es: "✨ Bienvenido a RenaSer. Hoy, respira profundo y siente tu voz conectarse con tu corazón."
      }[lang];
    }
    if (currentTime < 25) {
      return {
        pt: "A gravação de vídeo não é sobre performance técnica; é sobre a transparência da sua intenção.",
        en: "Video recording is not about technical performance; it is about the clarity of your intention.",
        es: "Grabar video no se trata de desempeño técnico; se trata de la claridad de tu intención."
      }[lang];
    }
    if (currentTime < 40) {
      return {
        pt: "Permita-se errar e gaguejar. Suas imperfeições são as pontes pelas quais as pessoas se conectam com você.",
        en: "Allow yourself to stutter or make mistakes. Your imperfections are the bridges people connect through.",
        es: "Permítete errar y tartamudear. Tus imperfecciones son los puentes por los cuales la gente se conecta."
      }[lang];
    }
    return {
      pt: "Continue praticando, no seu tempo, com respeito ao seu processo de florescimento.",
      en: "Keep practicing, in your own time, respecting your personal blooming process.",
      es: "Sigue practicando, a tu propio ritmo, respetando tu proceso personal de florecimiento."
    }[lang];
  };

  // Translations
  const trans = {
    pt: {
      title: 'Biblioteca de Expansão RenaSer',
      subtitle: 'Seu acervo vitalício de evolução. Masterclasses, meditações de calibração, desafios rápidos e materiais didáticos adicionais.',
      weeklyVideoTitle: 'Vídeo da Semana',
      weeklyVideoDesc: 'Um vídeo novo toda semana com dicas práticas para sua jornada de visibilidade.',
      searchPlaceholder: 'Buscar vídeos, meditações, PDFs...',
      all: 'Todos',
      videos: 'Vídeos',
      audios: 'Áudios',
      articles: 'Artigos',
      downloads: 'Downloads',
      pdfs: 'PDFs',
      workbooks: 'Apostilas',
      meditations: 'Meditações',
      challenges: 'Desafios',
      masterclasses: 'Masterclasses',
      empty: 'Nenhum material encontrado com os termos de busca.',
      nowPlaying: 'Reproduzindo Agora',
      continueWatching: 'Continuar assistindo de onde parou',
      completed: 'Concluído',
      markCompleted: 'Marcar como Concluído',
      downloadBtn: 'Download de Recurso',
      speed: 'Velocidade',
      captions: 'Legendas',
      pip: 'Mini Player',
      close: 'Fechar Player',
      offlineReady: 'Pronto para download (Suporte Offline)',
      statsHeader: 'Seu Progresso na Biblioteca',
      statsDesc: 'Quantos materiais adicionais você integrou ao seu repertório:',
      minutesLabel: 'assistido',
      favTab: 'Favoritos',
      customTag: 'Material Criado',
      headphonesRequired: 'Importante! É obrigatório o uso de fones de ouvido para essa experiência.'
    },
    en: {
      title: 'RenaSer Expansion Library',
      subtitle: 'Your lifetime repository of growth. Masterclasses, calibration meditations, fast challenges, and worksheets.',
      weeklyVideoTitle: 'Video of the Week',
      weeklyVideoDesc: 'A new video every week with practical tips for your visibility journey.',
      searchPlaceholder: 'Search videos, audios, PDFs...',
      all: 'All',
      videos: 'Videos',
      audios: 'Audios',
      articles: 'Articles',
      downloads: 'Downloads',
      pdfs: 'PDFs',
      workbooks: 'Workbooks',
      meditations: 'Meditations',
      challenges: 'Challenges',
      masterclasses: 'Masterclasses',
      empty: 'No items found matching your search term.',
      nowPlaying: 'Now Streaming',
      continueWatching: 'Continue watching where you left off',
      completed: 'Completed',
      markCompleted: 'Mark as Completed',
      downloadBtn: 'Download Resource',
      speed: 'Playback Speed',
      captions: 'Captions',
      pip: 'Picture in Picture',
      close: 'Close Player',
      offlineReady: 'Offline Download Ready',
      statsHeader: 'Your Library Progress',
      statsDesc: 'How many extra resources you have integrated so far:',
      minutesLabel: 'watched',
      favTab: 'Favorites',
      customTag: 'Custom Resource',
      headphonesRequired: 'Important! Wearing headphones is required for this experience.'
    },
    es: {
      title: 'Biblioteca de Expansión RenaSer',
      subtitle: 'Tu archivo vitalicio de evolución. Clases maestras, meditaciones, desafíos prácticos y folletos didácticos.',
      weeklyVideoTitle: 'Video de la Semana',
      weeklyVideoDesc: 'Un video nuevo cada semana con consejos prácticos para tu camino de visibilidad.',
      searchPlaceholder: 'Buscar videos, audios, PDFs...',
      all: 'Todos',
      videos: 'Videos',
      audios: 'Audios',
      articles: 'Artículos',
      downloads: 'Descargas',
      pdfs: 'PDFs',
      workbooks: 'Cuadernos',
      meditations: 'Meditaciones',
      challenges: 'Desafíos',
      masterclasses: 'Clases Maestras',
      empty: 'No se encontraron recursos que coincidan con la búsqueda.',
      nowPlaying: 'Reproduciendo Ahora',
      continueWatching: 'Continuar viendo donde te quedaste',
      completed: 'Completado',
      markCompleted: 'Marcar como Completado',
      downloadBtn: 'Descargar Recurso',
      speed: 'Velocidad',
      captions: 'Subtítulos',
      pip: 'Mini Reproductor',
      close: 'Cerrar Reproductor',
      offlineReady: 'Descarga Offline Lista',
      statsHeader: 'Tu Progreso en la Biblioteca',
      statsDesc: 'Cuántos materiales adicionales has integrado en tu repertorio:',
      minutesLabel: 'visto',
      favTab: 'Favoritos',
      customTag: 'Material Creado',
      headphonesRequired: '¡Importante! Es obligatorio el uso de audífonos para esta experiencia.'
    }
  }[lang];

  // Config/behavior note for future weekly-video updates: only the CURRENT
  // week's video (last entry of support.weeklyVideos) gets the full featured
  // standalone card. Once a newer one replaces it, it drops out of the card
  // grid entirely and shows up only as a plain title in the archive list
  // below — it's never duplicated as a second thumbnail card.
  const pastWeeklyVideos = support.weeklyVideos.slice(0, -1);

  // Filtering list
  const filteredAssets = assets.filter(asset => {
    const matchesSearch =
      (asset.title[lang]?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (asset.description[lang]?.toLowerCase() || '').includes(searchQuery.toLowerCase());

    if (selectedCategory === 'all') return matchesSearch;
    return asset.category === selectedCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Title Header */}
      <div className="text-center md:text-left space-y-2">
        <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#D4AF37] flex items-center justify-center md:justify-start gap-1.5">
          <BookOpen className="h-4 w-4" />
          MULTIVERSE LIBRARY
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif font-light text-slate-900 dark:text-white">
          {trans.title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed mx-auto md:mx-0">
          {trans.subtitle}
        </p>
      </div>

      {/* Video of the Week — featured standalone card. Also archived as a
          normal browsable asset under the "Vídeos" tab below. */}
      {currentWeeklyVideo && (
        <div className="max-w-xl">
          <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
            {trans.weeklyVideoTitle}
          </h3>
          <a
            href={currentWeeklyVideo}
            target="_blank"
            rel="noreferrer"
            className="block rounded-2xl overflow-hidden border border-rose-100/30 dark:border-rosegold/5 group"
          >
            <div className="relative aspect-video bg-warmbrown">
              {weeklyVideoThumbnail && (
                <img
                  src={weeklyVideoThumbnail}
                  alt={trans.weeklyVideoTitle}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  referrerPolicy="no-referrer"
                />
              )}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition flex items-center justify-center">
                <div className="h-14 w-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                  <Play className="h-6 w-6 text-rosegold ml-0.5" fill="currentColor" />
                </div>
              </div>
            </div>
            <div className="p-4 bg-[#FAF8F5]/40 dark:bg-warmbrown/10 space-y-1.5">
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{trans.weeklyVideoDesc}</p>
            </div>
          </a>

          {/* Once a video stops being "the" video of the week, it's no longer
              shown as a full card — just a plain title link, kept for later access. */}
          {pastWeeklyVideos.length > 0 && (
            <div className="mt-3 space-y-1">
              {pastWeeklyVideos.map((url, idx) => (
                <a
                  key={idx}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 hover:text-rosegold transition-colors py-1"
                >
                  <Play className="h-3 w-3 shrink-0" />
                  <span>{trans.weeklyVideoTitle} {idx + 1}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Inline Active Player Panel */}
      <AnimatePresence>
        {activeAsset && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-[#2C221E] dark:bg-[#1E1715] border border-rosegold/25 rounded-3xl overflow-hidden shadow-2xl p-4 sm:p-6 text-white space-y-4"
          >
            <div className="flex justify-between items-center pb-2 border-b border-rose-100/10">
              <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#D4AF37] flex items-center gap-1.5">
                <Play className="h-3.5 w-3.5 fill-current animate-pulse text-[#D4AF37]" />
                {trans.nowPlaying} • {trans[activeAsset.category as keyof typeof trans] || activeAsset.category}
              </span>
              
              <button 
                onClick={handleClosePlayer}
                className="text-slate-400 hover:text-white bg-white/5 hover:bg-white/15 px-3 py-1.5 rounded-lg text-xs font-mono tracking-wider transition cursor-pointer"
              >
                {trans.close}
              </button>
            </div>

            {/* Headphones-required notice */}
            {activeAsset.requiresHeadphones && (
              <div className="flex items-center gap-3 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-2xl px-4 py-3 mb-6">
                <Headphones className="h-5 w-5 text-[#D4AF37] shrink-0" />
                <p className="text-xs sm:text-sm text-amber-100 font-sans font-medium leading-snug">
                  {trans.headphonesRequired}
                </p>
              </div>
            )}

            {/* Media Player Player */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              {/* Media Core (Video or Audio tag) */}
              <div className="md:col-span-7 bg-black/40 rounded-2xl aspect-video w-full flex items-center justify-center overflow-hidden relative border border-white/5">
                
                {activeAsset.category === 'audios' || activeAsset.category === 'meditations' ? (
                  <div className="p-6 text-center space-y-4">
                    <div className="relative h-20 w-20 mx-auto rounded-full bg-rosegold/15 border border-rosegold/30 flex items-center justify-center">
                      <Volume2 className="h-8 w-8 text-rosegold animate-bounce" />
                    </div>
                    <audio
                      ref={audioRef}
                      src={activeAsset.mediaUrl}
                      onTimeUpdate={handleTimeUpdate}
                      onEnded={() => {
                        setIsPlaying(false);
                        if (!completedIds.includes(activeAsset.id)) {
                          setCompletedIds(prev => [...prev, activeAsset.id]);
                        }
                      }}
                    />
                    <p className="text-xs font-mono text-slate-400">Audio Stream Active</p>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      src={activeAsset.mediaUrl}
                      className="w-full h-full object-contain"
                      onTimeUpdate={handleTimeUpdate}
                      onClick={() => {
                        if (videoRef.current) {
                          if (isPlaying) {
                            videoRef.current.pause();
                            setIsPlaying(false);
                          } else {
                            videoRef.current.play();
                            setIsPlaying(true);
                          }
                        }
                      }}
                      onEnded={() => {
                        setIsPlaying(false);
                        if (!completedIds.includes(activeAsset.id)) {
                          setCompletedIds(prev => [...prev, activeAsset.id]);
                        }
                      }}
                    />

                    {/* Subtitles Overlay */}
                    {showCaptions && (
                      <div className="absolute bottom-6 left-4 right-4 text-center pointer-events-none z-10">
                        <span className="bg-black/85 text-xs sm:text-sm font-sans tracking-wide leading-relaxed px-3.5 py-2 rounded-xl border border-white/10 shadow-lg inline-block text-amber-100">
                          {adaptMessage(getSubtitles(), prefGrammar, lang)}
                        </span>
                      </div>
                    )}
                  </>
                )}

              </div>

              {/* Media Controls Sidebar */}
              <div className="md:col-span-5 space-y-4 font-sans">
                <h3 className="text-lg sm:text-xl font-serif font-light text-amber-50">
                  {activeAsset.title[lang] || activeAsset.title['pt']}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {activeAsset.description[lang] || activeAsset.description['pt']}
                </p>

                {/* Continue Watching Position indicator */}
                {watchedPositions[activeAsset.id] > 0 && (
                  <p className="text-[10px] text-rosegold-light flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{trans.continueWatching} ({formatTime(watchedPositions[activeAsset.id])})</span>
                  </p>
                )}

                {/* Progress bar controller */}
                <div className="space-y-1.5 pt-2">
                  <div
                    className="h-2 w-full bg-white/10 rounded-full overflow-hidden relative"
                  >
                    <div 
                      className="h-full bg-rosegold" 
                      style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Dynamic buttons toolbar */}
                <div className="flex flex-wrap gap-2 pt-2">
                  
                  {/* Play/Pause Button */}
                  <button
                    onClick={() => {
                      if (activeAsset.category === 'audios' || activeAsset.category === 'meditations') {
                        if (audioRef.current) {
                          if (isPlaying) {
                            audioRef.current.pause();
                            setIsPlaying(false);
                          } else {
                            audioRef.current.play();
                            setIsPlaying(true);
                          }
                        }
                      } else {
                        if (videoRef.current) {
                          if (isPlaying) {
                            videoRef.current.pause();
                            setIsPlaying(false);
                          } else {
                            videoRef.current.play();
                            setIsPlaying(true);
                          }
                        }
                      }
                    }}
                    className="px-4 py-2.5 bg-rosegold hover:bg-[#A35D68] text-white text-xs rounded-xl font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 fill-current" />}
                    <span>{isPlaying ? 'Pause' : 'Play'}</span>
                  </button>

                  {/* Skip back 10 seconds */}
                  <button
                    onClick={handleSkipBack10}
                    title="-10s"
                    className="px-3 py-2.5 bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 hover:text-white text-xs rounded-xl font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>10s</span>
                  </button>

                  {/* Playback speed controller dropdown */}
                  <div className="flex items-center gap-1 border border-white/15 bg-white/5 px-2 py-1 rounded-xl">
                    <span className="text-[9px] text-slate-400 font-mono uppercase tracking-wider pr-1 border-r border-white/10">Speed</span>
                    {[1, 1.25, 1.5, 2].map((sp) => (
                      <button
                        key={sp}
                        onClick={() => handleSpeedChange(sp)}
                        className={`px-1.5 py-1 text-[10px] rounded font-mono font-bold transition ${
                          playbackSpeed === sp 
                            ? 'bg-[#D4AF37] text-slate-950 shadow-md' 
                            : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        {sp}x
                      </button>
                    ))}
                  </div>

                  {/* Toggle Captions button */}
                  {activeAsset.category !== 'audios' && activeAsset.category !== 'meditations' && (
                    <button
                      onClick={() => setShowCaptions(!showCaptions)}
                      className={`px-3 py-2 text-xs rounded-xl font-bold uppercase transition flex items-center gap-1 ${
                        showCaptions 
                          ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/25' 
                          : 'text-slate-400 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <span>CC</span>
                      <span className="text-[9px] font-mono">({showCaptions ? 'ON' : 'OFF'})</span>
                    </button>
                  )}

                  {/* PiP button */}
                  {activeAsset.category !== 'audios' && activeAsset.category !== 'meditations' && (
                    <button
                      onClick={handlePip}
                      className="px-3 py-2 text-xs rounded-xl font-bold uppercase bg-white/5 hover:bg-white/10 text-slate-300 flex items-center gap-1 transition"
                      title={trans.pip}
                    >
                      <Maximize className="h-3.5 w-3.5" />
                    </button>
                  )}

                  {/* Force complete */}
                  <button
                    onClick={(e) => handleMarkCompleted(activeAsset.id, e)}
                    className={`px-3 py-2 text-xs rounded-xl font-bold uppercase transition flex items-center gap-1.5 ${
                      completedIds.includes(activeAsset.id)
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300'
                    }`}
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>{completedIds.includes(activeAsset.id) ? trans.completed : trans.markCompleted}</span>
                  </button>

                  {/* Download button */}
                  <a
                    href={activeAsset.mediaUrl}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 text-xs rounded-xl font-bold uppercase bg-white/5 hover:bg-white/10 text-slate-300 flex items-center gap-1.5 transition"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{trans.downloadBtn}</span>
                  </a>

                </div>

              </div>

            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Library Filter Panel (Search & Categorized Pills) */}
      <div className="bg-white dark:bg-[#2C221E] border border-rose-100/40 dark:border-rosegold/10 rounded-3xl p-5 sm:p-6 space-y-6 shadow-rosegold">
        
        {/* Search bar row */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={trans.searchPlaceholder}
              className="w-full bg-[#FAF8F5] dark:bg-warmbrown border border-rose-100/30 dark:border-rosegold/10 rounded-2xl pl-10 pr-4 py-3.5 text-xs sm:text-sm focus:outline-none focus:border-rosegold text-slate-800 dark:text-slate-100 placeholder-slate-400"
            />
          </div>

          {/* Mini Stats box in filter row */}
          <div className="flex gap-4 items-center self-end sm:self-auto shrink-0 bg-rose-50/20 dark:bg-warmbrown/20 border border-rose-100/20 dark:border-rosegold/5 p-3.5 rounded-2xl">
            <div className="p-2 bg-rosegold/10 text-rosegold rounded-xl">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#D4AF37] block">
                {trans.statsHeader}
              </span>
              <span className="text-xs text-slate-600 dark:text-slate-300 block font-sans">
                <strong>{completedIds.length}</strong> / {assets.length} integrated
              </span>
            </div>
          </div>

        </div>

        {/* Categories selector horizontal track */}
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((cat) => {
            const CatIcon = cat.icon;
            const isSelected = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-4 py-2.5 rounded-xl text-xs font-sans font-medium transition-all flex items-center gap-1.5 shrink-0 cursor-pointer border ${
                  isSelected
                    ? 'bg-rosegold text-white border-rosegold shadow-md shadow-rosegold/15'
                    : 'bg-[#FAF8F5]/40 dark:bg-warmbrown/10 border-rose-100/10 dark:border-rosegold/5 text-slate-600 dark:text-slate-300 hover:bg-[#FAF8F5]/80'
                }`}
              >
                {CatIcon && <CatIcon className="h-3.5 w-3.5" />}
                <span>{trans[cat.key as keyof typeof trans] || cat.key}</span>
              </button>
            );
          })}
        </div>

      </div>

      {/* Library Grid list of resources */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredAssets.length > 0 ? (
            filteredAssets.map((asset) => {
              const isFavorited = favoriteIds.includes(asset.id);
              const isCompleted = completedIds.includes(asset.id);
              return (
                <motion.div
                  key={asset.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => handlePlayAsset(asset)}
                  className="bg-white dark:bg-[#2C221E] border border-rose-100/40 dark:border-rosegold/10 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
                >
                  
                  {/* Thumbnail Cover Area */}
                  <div className="relative aspect-video w-full overflow-hidden bg-warmbrown">
                    <img
                      src={asset.coverImage || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80'}
                      alt={asset.title[lang] || asset.title['pt']}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      referrerPolicy="no-referrer"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Tags block top */}
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <span className="bg-black/60 text-white text-[9px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-white/10 backdrop-blur-sm">
                        {trans[asset.category as keyof typeof trans] || asset.category}
                      </span>
                      {asset.isCustom && (
                        <span className="bg-[#D4AF37]/80 text-slate-950 text-[9px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-[#D4AF37]/35 backdrop-blur-sm">
                          {trans.customTag}
                        </span>
                      )}
                    </div>

                    {/* Favorite and status button top right */}
                    <button
                      onClick={(e) => handleToggleFavorite(asset.id, e)}
                      className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black/80 rounded-full border border-white/10 backdrop-blur-sm text-white transition hover:scale-110 cursor-pointer"
                    >
                      <Heart className={`h-3.5 w-3.5 ${isFavorited ? 'fill-rose-500 text-rose-500' : 'text-slate-300'}`} />
                    </button>

                    {/* Media Duration overlay bottom right */}
                    <span className="absolute bottom-3 right-3 bg-black/85 text-white text-[10px] font-mono px-2 py-0.5 rounded border border-white/5 flex items-center gap-1">
                      <Clock className="h-3 w-3 text-rosegold-light" />
                      {asset.durationOrSize}
                    </span>

                    {/* Huge Play overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                      <div className="h-12 w-12 rounded-full bg-rosegold text-white flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition duration-300">
                        <Play className="h-5 w-5 fill-current ml-0.5" />
                      </div>
                    </div>

                  </div>

                  {/* Body Info */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <h4 className="text-sm font-sans font-semibold text-slate-900 dark:text-white leading-snug group-hover:text-rosegold transition">
                        {asset.title[lang] || asset.title['pt']}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                        {asset.description[lang] || asset.description['pt']}
                      </p>
                    </div>

                    {/* Bottom Status Row */}
                    <div className="flex justify-between items-center pt-2 border-t border-rose-100/15">
                      
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-slate-400">
                          {trans.offlineReady}
                        </span>
                      </div>

                      <button
                        onClick={(e) => handleMarkCompleted(asset.id, e)}
                        className={`p-1.5 rounded-full border transition hover:scale-110 cursor-pointer ${
                          isCompleted
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                            : 'bg-slate-50 dark:bg-warmbrown text-slate-300 border-rose-100/10'
                        }`}
                        title={trans.markCompleted}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>

                    </div>

                  </div>

                </motion.div>
              );
            })
          ) : (
            <div className="col-span-full py-16 bg-white dark:bg-[#2C221E] border border-rose-100/25 dark:border-rosegold/5 rounded-3xl text-center space-y-2">
              <AlertCircle className="h-8 w-8 text-slate-300 mx-auto" />
              <p className="text-xs sm:text-sm font-sans text-slate-500 dark:text-slate-400">
                {trans.empty}
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
