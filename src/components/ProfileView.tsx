/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User, Award, Star, Flame, Settings, Sparkles, Sliders,
  HelpCircle, Check, ArrowRight, BookOpen, Compass, Shield, Heart, Camera, Pencil
} from 'lucide-react';
import { Language, UserProgress, MissionDay } from '../types';
import MyTransformationView from './MyTransformationView';
import { adaptMessage, resolveGrammarPreference } from '../utils/grammar';
import { supabase } from '../lib/supabase';

interface ProfileViewProps {
  lang: Language;
  progress: UserProgress;
  days: MissionDay[];
  onUpdateProgress: (newProgress: UserProgress) => void;
  userId?: string;
}

export default function ProfileView({ lang, progress, days, onUpdateProgress, userId }: ProfileViewProps) {
  const [activeProfileSection, setActiveProfileSection] = useState<'scrapbook' | 'personalization'>('scrapbook');
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(progress.displayName || '');

  const handleSaveName = () => {
    const trimmed = nameDraft.trim();
    onUpdateProgress({ ...progress, displayName: trimmed || null });
    setIsEditingName(false);
  };

  // Load personalization presets or defaults
  const guideStyle = progress.guideStyle || 'gentle';
  const grammarPreference = resolveGrammarPreference(progress.grammarPreference);

  const handleAvatarUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const rawDataUrl = reader.result as string;
      // Downscale to a small square avatar before uploading — phone camera
      // photos can be several MB, no reason to ship that much to Storage.
      const img = new Image();
      img.onload = async () => {
        const size = 256;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const scale = Math.max(size / img.width, size / img.height);
        const drawWidth = img.width * scale;
        const drawHeight = img.height * scale;
        ctx.drawImage(img, (size - drawWidth) / 2, (size - drawHeight) / 2, drawWidth, drawHeight);

        canvas.toBlob(async (blob) => {
          if (!blob) return;
          // No signed-in userId (shouldn't happen behind the app's auth
          // gate) — fall back to storing the image inline rather than
          // silently dropping the upload.
          if (!userId) {
            onUpdateProgress({ ...progress, avatarUrl: canvas.toDataURL('image/jpeg', 0.85) });
            return;
          }
          setIsUploadingAvatar(true);
          // Path is prefixed with the user's own id, matching the Storage
          // RLS policies in supabase/migrations/0009_avatars_storage.sql —
          // each user can only write under their own folder.
          const path = `${userId}/avatar.jpg`;
          const { error } = await supabase.storage
            .from('avatars')
            .upload(path, blob, { contentType: 'image/jpeg', upsert: true });
          setIsUploadingAvatar(false);
          if (error) {
            console.error('Avatar upload failed:', error);
            onUpdateProgress({ ...progress, avatarUrl: canvas.toDataURL('image/jpeg', 0.85) });
            return;
          }
          const { data } = supabase.storage.from('avatars').getPublicUrl(path);
          // Cache-bust so the new photo shows immediately instead of the
          // previous one still cached under the same public URL.
          onUpdateProgress({ ...progress, avatarUrl: `${data.publicUrl}?v=${Date.now()}` });
        }, 'image/jpeg', 0.85);
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateGuideStyle = (style: 'gentle' | 'challenger' | 'strategic' | 'inspirational') => {
    onUpdateProgress({ ...progress, guideStyle: style });
  };

  const handleUpdateGrammar = (pref: 'feminine' | 'masculine') => {
    onUpdateProgress({ ...progress, grammarPreference: pref });
  };

  // Quick stats calculations
  const completedCount = progress.completionHistory.length;
  const streak = progress.currentStreak || 0;
  const longestStreak = progress.longestStreak || 0;
  const completionPercentage = Math.round((completedCount / 30) * 100);

  // Badge title
  const getBadgeTitle = () => {
    if (completedCount >= 30) return { pt: 'Borboleta Desperta', en: 'Awakened Butterfly', es: 'Mariposa Despierta' }[lang];
    if (completedCount >= 21) return adaptMessage({ pt: '[Velejadora/Velejador/Velejadore] da Alma', en: 'Soul Sailor', es: 'Navegante del Alma' }[lang], grammarPreference, lang);
    if (completedCount >= 7) return adaptMessage({ pt: 'Destravante [Corajosa/Corajoso/Corajose]', en: 'Courageous Bloomer', es: 'Destrabante Valiente' }[lang], grammarPreference, lang);
    return { pt: 'Casulo Inicial', en: 'Initial Cocoon', es: 'Capullo Inicial' }[lang];
  };

  // Translations
  const trans = {
    pt: {
      profileTitle: 'Seu Portal do Ser',
      pioneiro: 'Membro Fundador RenaSer',
      tabScrapbook: 'Meu Scrapbook & Transformação',
      tabTuning: 'Sintonização e Voz do Guia',
      statsTitle: 'Métricas de Expansão',
      statsDays: 'Dias Praticados',
      statsStreak: 'Streak Atual',
      statsLongest: 'Maior Streak',
      tuningTitle: 'Sintonização de Personalidade',
      tuningDesc: 'Personalize como o ecossistema RenaSer e seu Guia de Voz se comunicam com você. As mensagens adaptativas mudarão em tempo real.',
      voiceStyle: 'Voz e Arquetipo do Guia',
      grammarTitle: 'Forma de Tratamento',
      saveConfirm: 'Preferências de Sintonização gravadas com sucesso no seu perfil!',
      gentleTitle: '🌸 Guia Gentil (Acolhedor)',
      gentleDesc: 'Foco em autoacolhimento, respiração, compaixão e ritmo natural.',
      challengerTitle: '⚡ Guia Desafiador (Guerreiro)',
      challengerDesc: 'Provocações intensas, empurrões amorosos e quebra de desculpas.',
      strategicTitle: '🎯 Guia Estratégico (Arquiteto)',
      strategicDesc: 'Foco na estrutura técnica dos roteiros de vídeo e ganho de autoridade rápida.',
      inspirationalTitle: '✨ Guia Inspiracional (Sábio)',
      inspirationalDesc: 'Provocações existenciais, metáforas profundas e conexão espiritual com o público.',
      grammarFem: 'Feminino (Amada, Destravada)',
      grammarMasc: 'Masculino (Amado, Destravado)',
      memberBadge: 'Nível de Evolução:'
    },
    en: {
      profileTitle: 'Your Portal of Being',
      pioneiro: 'RenaSer Founding Member',
      tabScrapbook: 'My Scrapbook & Transformation',
      tabTuning: 'Sintonização & Guide Voice',
      statsTitle: 'Expansion Metrics',
      statsDays: 'Days Practiced',
      statsStreak: 'Current Streak',
      statsLongest: 'Longest Streak',
      tuningTitle: 'Adaptive Sintonização Settings',
      tuningDesc: 'Customize how the RenaSer ecosystem and your Voice Guide address you. Text suggestions will update adaptively in real time.',
      voiceStyle: 'Guide Voice & Archetype',
      grammarTitle: 'Grammar Alignment',
      saveConfirm: 'Personalization settings updated successfully in your profile!',
      gentleTitle: '🌸 Gentle Guide (Compassionate)',
      gentleDesc: 'Focuses on breathing, self-care, slow pacing, and emotional integration.',
      challengerTitle: '⚡ Challenger Guide (Warrior)',
      challengerDesc: 'High-energy pushes, lovingly firm boundaries, and excuse-breaking triggers.',
      strategicTitle: '🎯 Strategic Guide (Architect)',
      strategicDesc: 'Focuses heavily on structure, narrative formulas, and rapid authority building.',
      inspirationalTitle: '✨ Inspirational Guide (Sage)',
      inspirationalDesc: 'Existential metaphors, deeper wisdom, and spiritual projection on camera.',
      grammarFem: 'Feminine Alignment',
      grammarMasc: 'Masculine Alignment',
      memberBadge: 'Evolution Stage:'
    },
    es: {
      profileTitle: 'Tu Portal del Ser',
      pioneiro: 'Miembro Fundador RenaSer',
      tabScrapbook: 'Mi Álbum y Transformación',
      tabTuning: 'Sintonización y Voz del Guía',
      statsTitle: 'Métricas de Expansión',
      statsDays: 'Días Practicados',
      statsStreak: 'Streak Activo',
      statsLongest: 'Mayor Streak',
      tuningTitle: 'Sintonización Adaptativa de Personalidad',
      tuningDesc: 'Personaliza cómo el ecosistema de RenaSer y tu Guía de Voz se comunican contigo. Los textos adaptativos cambiarán de inmediato.',
      voiceStyle: 'Voz y Arquetipo del Guía',
      grammarTitle: 'Forma de Tratamiento',
      saveConfirm: '¡Preferencias de sintonización guardadas con éxito en tu perfil!',
      gentleTitle: '🌸 Guía Gentil (Acogedor)',
      gentleDesc: 'Enfoque en autocompasión, respiración profunda y ritmo orgánico.',
      challengerTitle: '⚡ Guía Desafiador (Guerrero)',
      challengerDesc: 'Impulsos de alta energía, empujones amorosos y eliminación de excusas.',
      strategicTitle: '🎯 Guía Estratégico (Arquitecto)',
      strategicDesc: 'Enfoque en estructuras técnicas, guiones magnéticos y autoridad rápida.',
      inspirationalTitle: '✨ Guía Inspiracional (Sabio)',
      inspirationalDesc: 'Metáforas profundas, sabiduría existencial y conexión espiritual.',
      grammarFem: 'Femenino Alignment',
      grammarMasc: 'Masculino Alignment',
      memberBadge: 'Fase de Evolución:'
    }
  }[lang];

  return (
    <div className="space-y-8 max-w-5xl mx-auto font-sans">
      
      {/* Profile Luxury Upper Header Card */}
      <div className="bg-gradient-to-r from-warmbrown-light/40 to-[#2C221E] dark:bg-none! dark:bg-ink-raised! border border-rosegold/15 dark:border-ink-hairline rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-center justify-between shadow-rosegold dark:shadow-none text-white relative overflow-hidden">
        
        {/* Abstract golden flare */}
        <div className="absolute -left-12 -bottom-12 h-40 w-40 bg-accentgold/10 blur-3xl rounded-full" />

        <div className="flex flex-col sm:flex-row gap-5 items-center relative z-10 text-center sm:text-left">
          
          {/* Avatar Ring, click to upload a profile photo */}
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
          />
          <button
            onClick={() => avatarInputRef.current?.click()}
            className="relative h-20 w-20 rounded-full bg-rosegold/20 border-2 border-[#D4AF37] flex items-center justify-center shadow-lg group cursor-pointer overflow-hidden shrink-0"
          >
            {progress.avatarUrl ? (
              <img src={progress.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <User className="h-10 w-10 text-rosegold-light" />
            )}
            <div className={`absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center ${isUploadingAvatar ? 'bg-black/50' : ''}`}>
              {isUploadingAvatar ? (
                <div className="h-5 w-5 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-[#D4AF37] text-slate-950 p-1 rounded-full text-[11px] font-bold">
              VIP
            </div>
          </button>

          <div className="space-y-1">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveName();
                    if (e.key === 'Escape') { setNameDraft(progress.displayName || ''); setIsEditingName(false); }
                  }}
                  maxLength={40}
                  placeholder={lang === 'pt' ? 'Seu nome' : lang === 'es' ? 'Tu nombre' : 'Your name'}
                  className="text-xl sm:text-2xl font-serif font-light text-amber-50 bg-white/10 border border-[#D4AF37]/50 rounded-lg px-2 py-0.5 outline-none focus:border-[#D4AF37] w-40 sm:w-52"
                />
                <button onClick={handleSaveName} className="p-1.5 rounded-full bg-[#D4AF37] text-slate-950 hover:brightness-110 transition">
                  <Check className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setNameDraft(progress.displayName || ''); setIsEditingName(true); }}
                className="group flex items-center gap-2 text-xl sm:text-2xl font-serif font-light text-amber-50 hover:text-white transition"
              >
                {progress.displayName || (lang === 'pt' ? 'Estrela RenaSer' : lang === 'es' ? 'Estrella RenaSer' : 'RenaSer Star')}
                <Pencil className="h-3.5 w-3.5 text-[#D4AF37] opacity-60 group-hover:opacity-100 transition-opacity" />
              </button>
            )}
            <p className="text-[10px] uppercase font-mono tracking-widest text-[#D4AF37] font-bold">
              {trans.pioneiro}
            </p>
          </div>

        </div>

        {/* Right Info: Stage Badge and Completion Percentage */}
        <div className="flex flex-col items-center md:items-end gap-2 shrink-0 relative z-10">
          <div className="text-center md:text-right">
            <span className="text-[10px] text-slate-400 block uppercase tracking-widest">{trans.memberBadge}</span>
            <span className="text-sm font-sans font-semibold text-accentgold flex items-center gap-1.5 justify-center md:justify-end mt-0.5">
              <Award className="h-4 w-4 animate-pulse" />
              {getBadgeTitle()}
            </span>
          </div>

          {/* Mini progress tracker */}
          <div className="w-40 sm:w-48 space-y-1">
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>{trans.statsDays}</span>
              <span>{completionPercentage}%</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-rosegold"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

      </div>

      {/* Profile Sections Inner Tabs (Scrapbook vs Tuning/Personalization) */}
      <div className="flex border-b border-rose-100/30 dark:border-ink-hairline">
        <button
          onClick={() => setActiveProfileSection('scrapbook')}
          className={`pb-4 px-6 text-xs sm:text-sm font-sans font-bold tracking-wider uppercase border-b-2 transition ${
            activeProfileSection === 'scrapbook'
              ? 'border-rosegold text-rosegold dark:text-rosegold-light'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          {trans.tabScrapbook}
        </button>
        <button
          onClick={() => setActiveProfileSection('personalization')}
          className={`pb-4 px-6 text-xs sm:text-sm font-sans font-bold tracking-wider uppercase border-b-2 transition ${
            activeProfileSection === 'personalization'
              ? 'border-rosegold text-rosegold dark:text-rosegold-light'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          {trans.tabTuning}
        </button>
      </div>

      {/* Render sub views */}
      <div>
        <AnimatePresence mode="wait">
          {activeProfileSection === 'scrapbook' ? (
            <motion.div
              key="scrapbook"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              <MyTransformationView
                progress={progress}
                days={days}
                lang={lang}
              />
            </motion.div>
          ) : (
            <motion.div
              key="tuning"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-8 bg-white dark:bg-ink-raised border border-rose-100/40 dark:border-ink-hairline rounded-3xl p-6 sm:p-8 shadow-rosegold dark:shadow-none"
            >
              
              {/* Personalization Intro */}
              <div className="space-y-2">
                <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#D4AF37] flex items-center gap-1.5">
                  <Sliders className="h-4 w-4" />
                  ADAPTIVE COGNITIVE ENGINE
                </span>
                <h3 className="text-xl sm:text-2xl font-serif font-light text-slate-900 dark:text-white">
                  {trans.tuningTitle}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
                  {trans.tuningDesc}
                </p>
              </div>

              {/* Preferences Forms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                
                {/* 1. Guide Style */}
                <div className="space-y-4">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    {trans.voiceStyle}
                  </label>

                  <div className="space-y-2.5">
                    
                    <button
                      onClick={() => handleUpdateGuideStyle('gentle')}
                      className={`w-full p-4 text-left border rounded-2xl flex gap-3.5 items-start transition cursor-pointer ${
                        guideStyle === 'gentle'
                          ? 'border-rosegold dark:border-rosegold-light bg-rose-50/10 dark:bg-rosegold-light/10'
                          : 'border-rose-100/20 dark:border-ink-hairline hover:border-rose-150 dark:hover:border-rosegold-light/40'
                      }`}
                    >
                      <div className={`p-2 rounded-xl mt-0.5 ${guideStyle === 'gentle' ? 'bg-rosegold text-white' : 'bg-slate-50 dark:bg-transparent dark:border dark:border-ink-hairline text-slate-400 dark:text-ink-text-muted'}`}>
                        <Heart className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {trans.gentleTitle}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          {trans.gentleDesc}
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={() => handleUpdateGuideStyle('challenger')}
                      className={`w-full p-4 text-left border rounded-2xl flex gap-3.5 items-start transition cursor-pointer ${
                        guideStyle === 'challenger'
                          ? 'border-rosegold dark:border-rosegold-light bg-rose-50/10 dark:bg-rosegold-light/10'
                          : 'border-rose-100/20 dark:border-ink-hairline hover:border-rose-150 dark:hover:border-rosegold-light/40'
                      }`}
                    >
                      <div className={`p-2 rounded-xl mt-0.5 ${guideStyle === 'challenger' ? 'bg-rosegold text-white' : 'bg-slate-50 dark:bg-transparent dark:border dark:border-ink-hairline text-slate-400 dark:text-ink-text-muted'}`}>
                        <Flame className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {trans.challengerTitle}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          {trans.challengerDesc}
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={() => handleUpdateGuideStyle('strategic')}
                      className={`w-full p-4 text-left border rounded-2xl flex gap-3.5 items-start transition cursor-pointer ${
                        guideStyle === 'strategic'
                          ? 'border-rosegold dark:border-rosegold-light bg-rose-50/10 dark:bg-rosegold-light/10'
                          : 'border-rose-100/20 dark:border-ink-hairline hover:border-rose-150 dark:hover:border-rosegold-light/40'
                      }`}
                    >
                      <div className={`p-2 rounded-xl mt-0.5 ${guideStyle === 'strategic' ? 'bg-rosegold text-white' : 'bg-slate-50 dark:bg-transparent dark:border dark:border-ink-hairline text-slate-400 dark:text-ink-text-muted'}`}>
                        <Compass className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {trans.strategicTitle}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          {trans.strategicDesc}
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={() => handleUpdateGuideStyle('inspirational')}
                      className={`w-full p-4 text-left border rounded-2xl flex gap-3.5 items-start transition cursor-pointer ${
                        guideStyle === 'inspirational'
                          ? 'border-rosegold dark:border-rosegold-light bg-rose-50/10 dark:bg-rosegold-light/10'
                          : 'border-rose-100/20 dark:border-ink-hairline hover:border-rose-150 dark:hover:border-rosegold-light/40'
                      }`}
                    >
                      <div className={`p-2 rounded-xl mt-0.5 ${guideStyle === 'inspirational' ? 'bg-rosegold text-white' : 'bg-slate-50 dark:bg-transparent dark:border dark:border-ink-hairline text-slate-400 dark:text-ink-text-muted'}`}>
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {trans.inspirationalTitle}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          {trans.inspirationalDesc}
                        </p>
                      </div>
                    </button>

                  </div>

                </div>

                {/* 2. Grammar Alignment */}
                <div className="space-y-4">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    {trans.grammarTitle}
                  </label>

                  <div className="space-y-2.5">
                    
                    <button
                      onClick={() => handleUpdateGrammar('feminine')}
                      className={`w-full p-4 text-left border rounded-2xl flex justify-between items-center transition cursor-pointer ${
                        grammarPreference === 'feminine'
                          ? 'border-rosegold dark:border-rosegold-light bg-rose-50/10 dark:bg-rosegold-light/10'
                          : 'border-rose-100/20 dark:border-ink-hairline hover:border-rose-150 dark:hover:border-rosegold-light/40'
                      }`}
                    >
                      <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">
                        {trans.grammarFem}
                      </span>
                      {grammarPreference === 'feminine' && (
                        <div className="p-1 bg-rosegold text-white rounded-full">
                          <Check className="h-3.5 w-3.5" />
                        </div>
                      )}
                    </button>

                    <button
                      onClick={() => handleUpdateGrammar('masculine')}
                      className={`w-full p-4 text-left border rounded-2xl flex justify-between items-center transition cursor-pointer ${
                        grammarPreference === 'masculine'
                          ? 'border-rosegold dark:border-rosegold-light bg-rose-50/10 dark:bg-rosegold-light/10'
                          : 'border-rose-100/20 dark:border-ink-hairline hover:border-rose-150 dark:hover:border-rosegold-light/40'
                      }`}
                    >
                      <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">
                        {trans.grammarMasc}
                      </span>
                      {grammarPreference === 'masculine' && (
                        <div className="p-1 bg-rosegold text-white rounded-full">
                          <Check className="h-3.5 w-3.5" />
                        </div>
                      )}
                    </button>


                  </div>

                  <div className="pt-6">
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl flex gap-2.5 items-start">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-300 leading-relaxed font-sans">
                        {trans.saveConfirm}
                      </p>
                    </div>
                  </div>

                </div>

              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
