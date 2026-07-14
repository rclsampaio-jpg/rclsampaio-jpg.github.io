/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Star, Copy, Check, Filter, Compass, Bookmark, Hash } from 'lucide-react';
import { MissionDay, Language, DayType, UserProgress } from '../types';
import { getDayTypeLabel } from '../data/templateData';

interface HookBankViewProps {
  days: MissionDay[];
  progress: UserProgress;
  lang: Language;
  onToggleFavorite: (dayNum: number) => void;
  onCopyHook: (dayNum: number) => void;
}

export default function HookBankView({
  days,
  progress,
  lang,
  onToggleFavorite,
  onCopyHook,
}: HookBankViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'favorites' | 'byType'>('all');
  const [selectedType, setSelectedType] = useState<DayType | 'all'>('all');
  const [justCopiedId, setJustCopiedId] = useState<number | null>(null);

  const handleCopy = (dayNum: number, text: string) => {
    navigator.clipboard.writeText(text);
    onCopyHook(dayNum);
    setJustCopiedId(dayNum);
    setTimeout(() => setJustCopiedId(null), 2000);
  };

  // Determine which days have unlocked hooks (only days completed or unlocked)
  const isUnlocked = (dayNum: number) => {
    if (dayNum === 1) return true;
    return progress.completionHistory.includes(dayNum - 1) || progress.completionHistory.includes(dayNum);
  };

  const availableDays = days.filter(day => isUnlocked(day.dayNumber) && day.type !== DayType.Rest);

  const filteredDays = availableDays.filter((day) => {
    const isFav = progress.favoriteHooks.includes(day.dayNumber);
    const content = day.content[lang];
    const matchesSearch = 
      day.title[lang].toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.hook.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (activeFilter === 'favorites' && !isFav) return false;
    if (selectedType !== 'all' && day.type !== selectedType) return false;

    return true;
  });

  const textDict = {
    pt: {
      searchPlaceholder: 'Buscar ganchos ou temas...',
      filterAll: 'Todos os Ganchos',
      filterFavorites: 'Favoritos',
      noHooks: 'Nenhum gancho encontrado. Conclua mais missões diárias para liberar novos ganchos impactantes!',
      copyLabel: 'Copiar Gancho',
      favorited: 'Favoritado',
      unlockedHooksCount: 'Ganchos Desbloqueados',
      filterTypeLabel: 'Filtrar por Categoria',
    },
    en: {
      searchPlaceholder: 'Search hooks or topics...',
      filterAll: 'All Hooks',
      filterFavorites: 'Favorites Only',
      noHooks: 'No hooks found. Complete more daily missions to unlock powerful marketing hooks!',
      copyLabel: 'Copy Hook',
      favorited: 'Favorited',
      unlockedHooksCount: 'Unlocked Hooks',
      filterTypeLabel: 'Filter by Category',
    },
    es: {
      searchPlaceholder: 'Buscar ganchos o temas...',
      filterAll: 'Todos los Ganchos',
      filterFavorites: 'Mis Favoritos',
      noHooks: 'No se encontraron ganchos. ¡Completa más misiones diarias para desbloquear ganchos de alto impacto!',
      copyLabel: 'Copiar Gancho',
      favorited: 'Favorito',
      unlockedHooksCount: 'Ganchos Desbloqueados',
      filterTypeLabel: 'Filtrar por Categoría',
    }
  }[lang];

  const categoriesList = [
    { type: DayType.RestartIntention, label: { pt: 'Intenção', en: 'Intention', es: 'Intención' } },
    { type: DayType.Truth, label: { pt: 'Verdade', en: 'Truth', es: 'Verdad' } },
    { type: DayType.Storytelling, label: { pt: 'Storytelling', en: 'Storytelling', es: 'Storytelling' } },
    { type: DayType.ContrarianThinking, label: { pt: 'Pensamento Contrário', en: 'Contrarian', es: 'Contrario' } },
    { type: DayType.Presence, label: { pt: 'Presença', en: 'Presence', es: 'Presencia' } },
    { type: DayType.Reflection, label: { pt: 'Reflexão', en: 'Reflection', es: 'Reflexión' } }
  ];

  return (
    <div className="space-y-6 select-none">
      
      {/* Header and Counters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-semibold text-slate-900 dark:text-white">
            Hook Bank
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {textDict.unlockedHooksCount}: <strong className="text-rosegold">{availableDays.length}</strong> / 25
          </p>
        </div>

        {/* Core Filter Tabs */}
        <div className="flex gap-2 bg-[#FAF8F5] dark:bg-[#1E1715] p-1 rounded-xl self-start sm:self-auto border border-rose-100/25 dark:border-rosegold/10">
          <button
            onClick={() => { setActiveFilter('all'); setSelectedType('all'); }}
            className={`px-4 py-2 text-xs font-sans rounded-lg transition-all cursor-pointer ${
              activeFilter === 'all' && selectedType === 'all'
                ? 'bg-rosegold text-white font-semibold shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            {textDict.filterAll}
          </button>
          <button
            onClick={() => { setActiveFilter('favorites'); setSelectedType('all'); }}
            className={`px-4 py-2 text-xs font-sans rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              activeFilter === 'favorites'
                ? 'bg-white dark:bg-[#2C221E] text-rosegold font-semibold shadow-xs border border-rose-100/40'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <Star className="h-3 w-3 fill-current text-[#D4AF37]" />
            <span>{textDict.filterFavorites} ({progress.favoriteHooks.length})</span>
          </button>
        </div>
      </div>

      {/* Search Input and Category Tags */}
      <div className="space-y-4 bg-white dark:bg-[#2C221E] p-4 rounded-2xl border border-rose-100/30 dark:border-rosegold/10 shadow-xs transition-colors">
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-rosegold/70" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={textDict.searchPlaceholder}
            className="w-full pl-10 pr-4 py-3 bg-[#FAF8F5] dark:bg-[#1E1715] border border-rose-100/30 dark:border-rosegold/10 focus:border-rosegold focus:outline-none rounded-xl text-sm text-slate-700 dark:text-slate-200 transition"
          />
        </div>

        {/* Categorization tag list */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] font-sans font-semibold text-slate-400 uppercase tracking-wider mr-1">{textDict.filterTypeLabel}:</span>
          <button
            onClick={() => { setActiveFilter('all'); setSelectedType('all'); }}
            className={`px-2.5 py-1 text-[10px] font-sans rounded-md border transition cursor-pointer ${
              selectedType === 'all'
                ? 'bg-rosegold border-rosegold text-white font-bold shadow-xs'
                : 'border-rose-100/40 dark:border-rosegold/10 text-slate-600 dark:text-slate-400 hover:bg-rose-50/20'
            }`}
          >
            All
          </button>
          {categoriesList.map((cat) => (
            <button
              key={cat.type}
              onClick={() => { setActiveFilter('all'); setSelectedType(cat.type); }}
              className={`px-2.5 py-1 text-[10px] font-sans rounded-md border transition cursor-pointer ${
                selectedType === cat.type
                  ? 'bg-rosegold border-rosegold text-white font-bold shadow-xs'
                  : 'border-rose-100/40 dark:border-rosegold/10 text-slate-600 dark:text-slate-400 hover:bg-rose-50/20'
              }`}
            >
              {cat.label[lang]}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Unlocked Hooks */}
      <AnimatePresence mode="popLayout">
        {filteredDays.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center py-12 px-6 bg-[#FAF8F5]/30 dark:bg-[#1E1715]/20 rounded-3xl border border-dashed border-rose-100/50 dark:border-rosegold/10"
          >
            <Bookmark className="h-8 w-8 mx-auto text-rosegold/40 mb-2 animate-pulse" />
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed font-sans">
              {textDict.noHooks}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDays.map((day) => {
              const isFav = progress.favoriteHooks.includes(day.dayNumber);
              const isJustCopied = justCopiedId === day.dayNumber;
              const hasBeenCopiedBefore = progress.copiedHooks.includes(day.dayNumber);

              return (
                <motion.div
                  key={day.dayNumber}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white dark:bg-[#2C221E] border border-rose-100/30 dark:border-rosegold/10 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between gap-4 relative overflow-hidden"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-sans font-bold text-rosegold uppercase tracking-wider">
                        Day {day.dayNumber} • {getDayTypeLabel(day.type, lang).split(' (')[0]}
                      </span>
                      
                      <div className="flex items-center gap-1">
                        {hasBeenCopiedBefore && (
                          <span className="text-[9px] font-sans bg-rose-50/50 dark:bg-warmbrown text-rosegold dark:text-rosegold-light px-1.5 py-0.5 rounded">
                            Copied
                          </span>
                        )}
                        <button
                          onClick={() => onToggleFavorite(day.dayNumber)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isFav ? 'text-[#D4AF37] hover:text-[#D4AF37]/80' : 'text-rose-100 dark:text-rosegold/15 hover:text-rosegold'
                          }`}
                        >
                          <Star className="h-4 w-4 fill-current" />
                        </button>
                      </div>
                    </div>

                    <p className="text-slate-800 dark:text-slate-200 text-sm font-serif italic leading-relaxed">
                      "{day.content[lang].hook}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-rose-100/10 dark:border-rosegold/5 pt-3">
                    <span className="text-[10px] font-sans text-slate-400 dark:text-slate-500 leading-tight">
                      Topic: {day.title[lang].split(' (Day')[0].split(' (Dia')[0].split(' (Día')[0]}
                    </span>

                    <button
                      onClick={() => handleCopy(day.dayNumber, day.content[lang].hook)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-sans font-semibold flex items-center gap-1 transition cursor-pointer ${
                        isJustCopied 
                          ? 'bg-rose-50 dark:bg-rosegold/10 text-rosegold font-bold' 
                          : 'bg-[#FAF8F5] dark:bg-[#1E1715] hover:bg-rose-50 dark:hover:bg-rosegold/10 text-slate-600 dark:text-slate-300 border border-rose-100/15'
                      }`}
                    >
                      {isJustCopied ? (
                        <>
                          <Check className="h-3 w-3 text-rosegold" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>{textDict.copyLabel}</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
