/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import {
  Trash2, Globe, Flame, RefreshCcw, User, ShieldAlert,
  Sparkles, Play, Sun, Moon
} from 'lucide-react';
import { Language, UserProgress } from '../types';

interface SettingsViewProps {
  progress: UserProgress;
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  onResetProgress: () => void;
  onQuickSimulateCompletion: () => void;
  onQuickSimulateUnlockDay30: () => void;
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
  onUpdateProgress: (updated: UserProgress) => void;
  isAdminUnlocked: boolean;
}

export default function SettingsView({
  progress,
  lang,
  onLanguageChange,
  onResetProgress,
  onQuickSimulateCompletion,
  onQuickSimulateUnlockDay30,
  theme,
  onThemeChange,
  onUpdateProgress,
  isAdminUnlocked,
}: SettingsViewProps) {

  const totalCompleted = progress.completionHistory.length;
  const isEligibleForNextLevel = progress.completionHistory.includes(30);

  const textDict = {
    pt: {
      accountProfile: 'Seu Perfil de Visibilidade',
      languagesTitle: 'Idioma do Aplicativo',
      themeTitle: 'Tema Visual',
      themeLight: 'Branco Quente (Elegante)',
      themeDark: 'Marrom Escuro Cósmico (Premium)',
      diagnosticTitle: 'Atalhos de Simulação (Desenvolvedor)',
      diagnosticDesc: 'Para facilitar a homologação do produto, simule as condições de progresso do aluno sem precisar esperar 30 dias.',
      simulateUnlock30: 'Desbloquear o Dia 30',
      simulateComplete30: 'Marcar Dia 30 como Concluído (Ativar Next Level)',
      resetProgressTitle: 'Resetar seu Progresso',
      resetProgressBtn: 'Apagar Histórico e Zerar Streaks',
      resetProgressWarning: 'Atenção: Isso excluirá todas as suas reflexões e redefinirá seu progresso para o Dia 1 de forma irreversível.',
      successText: 'Ação executada com sucesso!',
      days: 'dias',
      currentDayLabel: 'Dia Atual da Jornada',
      unlockedStatus: 'Status do Next Level',
      unlockedEligible: 'Elegível - Clique no botão "Next Level" na barra de navegação',
      unlockedLocked: 'Bloqueado (Requer completar todos os 30 dias)',
    },
    en: {
      accountProfile: 'Your Visibility Profile',
      languagesTitle: 'App Interface Language',
      themeTitle: 'Visual Theme',
      themeLight: 'Warm White (Elegant)',
      themeDark: 'Cosmic Dark Brown (Premium)',
      diagnosticTitle: 'Diagnostic Simulator Shortcuts',
      diagnosticDesc: 'For convenient validation, simulate student progress conditions without waiting 30 full days.',
      simulateUnlock30: 'Instant Unlock Day 30',
      simulateComplete30: 'Mark Day 30 Completed (Unlock Next Level)',
      resetProgressTitle: 'Reset Your Progress',
      resetProgressBtn: 'Erase History and Reset Streaks',
      resetProgressWarning: 'Warning: This will permanently delete all your reflection logs and return you to Day 1.',
      successText: 'Action executed successfully!',
      days: 'days',
      currentDayLabel: 'Current Journey Day',
      unlockedStatus: 'Next Level Status',
      unlockedEligible: 'Eligible - Click "Next Level" in the navigation bar',
      unlockedLocked: 'Locked (Requires Day 30 completion)',
    },
    es: {
      accountProfile: 'Tu Perfil de Visibilidad',
      languagesTitle: 'Idioma del Aplicativo',
      themeTitle: 'Tema Visual',
      themeLight: 'Blanco Cálido (Elegante)',
      themeDark: 'Marrón Oscuro Cósmico (Premium)',
      diagnosticTitle: 'Atajos de Simulación (Desarrollador)',
      diagnosticDesc: 'Para facilitar la homologación, simula las condiciones de progreso del alumno sin esperar 30 dias.',
      simulateUnlock30: 'Desbloquear el Día 30',
      simulateComplete30: 'Marcar Día 30 Completado (Activar Next Level)',
      resetProgressTitle: 'Restablecer Progresso',
      resetProgressBtn: 'Borrar Historial y Reiniciar Rachas',
      resetProgressWarning: 'Atención: Esto borrará de forma irreversible todas tus reflexiones y regresará tu progreso al Día 1.',
      successText: '¡Acción realizada con éxito!',
      days: 'días',
      currentDayLabel: 'Día Actual del Viaje',
      unlockedStatus: 'Estado de Next Level',
      unlockedEligible: 'Elegible - Haz clic en "Next Level" en la barra de navegación',
      unlockedLocked: 'Bloqueado (Requiere completar el Día 30)',
    }
  }[lang];

  const languagesList: { code: Language; label: string }[] = [
    { code: 'pt', label: 'Português (Brasil)' },
    { code: 'en', label: 'English (US)' },
    { code: 'es', label: 'Español' }
  ];

  const handleResetConfirm = () => {
    if (confirm(
      lang === 'pt' ? 'Tem certeza que deseja apagar todo o seu progresso? Esta ação não pode ser desfeita.' :
      lang === 'en' ? 'Are you sure you want to delete all your progress? This action is permanent.' :
      '¿Estás seguro de que deseas borrar todo tu progreso? Esta acción es permanente.'
    )) {
      onResetProgress();
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      
      {/* 1. Language Toggle */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-warmbrown-light border border-rose-100/40 dark:border-rosegold/10 rounded-3xl p-6 shadow-rosegold space-y-4"
      >
        <div className="flex items-center gap-2.5">
          <Globe className="h-5 w-5 text-rosegold" />
          <h3 className="text-sm font-sans font-medium text-slate-800 dark:text-warmwhite uppercase tracking-wider">
            {textDict.languagesTitle}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {languagesList.map((langObj) => {
            const isActive = lang === langObj.code;
            return (
              <button
                key={langObj.code}
                onClick={() => onLanguageChange(langObj.code)}
                className={`py-3.5 px-4 rounded-2xl border text-xs font-sans font-medium transition flex items-center justify-center gap-2 cursor-pointer ${
                  isActive 
                    ? 'bg-rosegold border-rosegold text-white shadow-md' 
                    : 'bg-warmwhite dark:bg-warmbrown border-slate-200/60 dark:border-rosegold/10 hover:bg-slate-100 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>{langObj.label}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Adaptive Personalization Engine Settings */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white dark:bg-warmbrown-light border border-rose-100/40 dark:border-rosegold/10 rounded-3xl p-6 shadow-rosegold space-y-6"
      >
        <div className="flex items-center gap-2.5 pb-2 border-b border-rose-100/20 dark:border-rosegold/5">
          <Sparkles className="h-5 w-5 text-accentgold" />
          <h3 className="text-sm font-sans font-medium text-slate-800 dark:text-warmwhite uppercase tracking-wider">
            {lang === 'pt' ? 'Sua Sintonização & Personalização' : lang === 'es' ? 'Tu Sintonización y Personalización' : 'Sintonization & Personalization'}
          </h3>
        </div>

        {/* Part A: Mentor Guidance Style */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {lang === 'pt' ? 'Estilo de Orientação do Mentor' : lang === 'es' ? 'Estilo de Orientación de Mentor' : 'Mentor Guidance Style'}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { code: 'gentle', title: lang === 'pt' ? '🌿 Gentil' : '🌿 Gentle', desc: lang === 'pt' ? 'Calmo, reflexivo, pausas longas' : 'Calm, reflective, slow pacing' },
              { code: 'challenger', title: lang === 'pt' ? '🔥 Desafiador' : '🔥 Challenger', desc: lang === 'pt' ? 'Foco em ação imediata, direto' : 'Action focused, direct' },
              { code: 'strategic', title: lang === 'pt' ? '💪 Estratégico' : '💪 Strategic', desc: lang === 'pt' ? 'Metas objetivas, menor emoção' : 'Goal oriented, objective' },
              { code: 'inspirational', title: lang === 'pt' ? '✨ Inspirador' : '✨ Inspirational', desc: lang === 'pt' ? 'Transformação interna, alma' : 'Soul transformation, deep' }
            ].map((styleObj) => {
              const isSelected = (progress.guideStyle || 'gentle') === styleObj.code;
              return (
                <button
                  key={styleObj.code}
                  onClick={() => onUpdateProgress({ ...progress, guideStyle: styleObj.code as any })}
                  className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex flex-col gap-0.5 ${
                    isSelected 
                      ? 'bg-rosegold border-rosegold text-white shadow-md shadow-rosegold/10' 
                      : 'bg-warmwhite dark:bg-warmbrown border-slate-200/60 dark:border-rosegold/10 hover:bg-slate-100 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="text-xs font-sans font-semibold tracking-wide">{styleObj.title}</span>
                  <span className={`text-[10px] ${isSelected ? 'text-rose-100' : 'text-slate-400 dark:text-slate-500'}`}>{styleObj.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Part B: Address Pronouns */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {lang === 'pt' ? 'Gênero Gramatical (Forma de Tratamento)' : lang === 'es' ? 'Preferencia de Tratamiento' : 'Grammar & Address'}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { code: 'feminine', label: lang === 'pt' ? '🌸 Feminino (pronta)' : lang === 'es' ? '🌸 Femenino (lista)' : '🌸 Feminine' },
              { code: 'masculine', label: lang === 'pt' ? '☀️ Masculino (pronto)' : lang === 'es' ? '☀️ Masculino (listo)' : '☀️ Masculine' },
              { code: 'neutral', label: lang === 'pt' ? '🌱 Neutro (preparade)' : lang === 'es' ? '🌱 Neutro (preparade)' : '🌱 Neutral' }
            ].map((grammarObj) => {
              const isSelected = (progress.grammarPreference || 'neutral') === grammarObj.code;
              return (
                <button
                  key={grammarObj.code}
                  onClick={() => onUpdateProgress({ ...progress, grammarPreference: grammarObj.code as any })}
                  className={`py-3 px-4 rounded-2xl border text-xs font-sans font-semibold transition flex items-center justify-center gap-2 cursor-pointer ${
                    isSelected 
                      ? 'bg-[#D4AF37] border-[#D4AF37] text-slate-950 font-bold shadow-md shadow-amber-500/10' 
                      : 'bg-warmwhite dark:bg-warmbrown border-slate-200/60 dark:border-rosegold/10 hover:bg-slate-100 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>{grammarObj.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Theme Toggle Section */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white dark:bg-warmbrown-light border border-rose-100/40 dark:border-rosegold/10 rounded-3xl p-6 shadow-rosegold space-y-4"
      >
        <div className="flex items-center gap-2.5">
          {theme === 'dark' ? <Moon className="h-5 w-5 text-accentgold" /> : <Sun className="h-5 w-5 text-rosegold" />}
          <h3 className="text-sm font-sans font-medium text-slate-800 dark:text-warmwhite uppercase tracking-wider">
            {textDict.themeTitle}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => onThemeChange('light')}
            className={`py-3.5 px-4 rounded-2xl border text-xs font-sans font-medium transition flex items-center justify-center gap-2 cursor-pointer ${
              theme === 'light'
                ? 'bg-rosegold border-rosegold text-white shadow-md'
                : 'bg-warmwhite dark:bg-warmbrown border-slate-250/60 dark:border-rosegold/10 hover:bg-slate-100 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Sun className="h-4 w-4" />
            <span>{textDict.themeLight}</span>
          </button>

          <button
            onClick={() => onThemeChange('dark')}
            className={`py-3.5 px-4 rounded-2xl border text-xs font-sans font-medium transition flex items-center justify-center gap-2 cursor-pointer ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-rosegold to-rosegold-light border-rosegold text-white shadow-md shadow-rosegold/20'
                : 'bg-warmwhite dark:bg-warmbrown border-slate-200/60 dark:border-rosegold/10 hover:bg-slate-100 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Moon className="h-4 w-4 text-accentgold" />
            <span>{textDict.themeDark}</span>
          </button>
        </div>
      </motion.div>

      {/* 2. Diagnostic Simulation panel - developer only */}
      {isAdminUnlocked && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/20 rounded-3xl p-6 space-y-4 shadow-sm"
        >
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
            <Sparkles className="h-5 w-5" />
            <h3 className="text-sm font-mono uppercase tracking-wider font-bold">
              {textDict.diagnosticTitle}
            </h3>
          </div>

          <p className="text-xs text-amber-900/80 dark:text-amber-100/80 leading-relaxed max-w-xl">
            {textDict.diagnosticDesc}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={onQuickSimulateUnlockDay30}
              className="flex-1 py-3 px-4 bg-white dark:bg-warmbrown text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-xl text-xs font-sans font-semibold transition cursor-pointer"
            >
              {textDict.simulateUnlock30}
            </button>

            <button
              onClick={onQuickSimulateCompletion}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-rosegold to-rosegold-light text-white rounded-xl text-xs font-sans font-bold transition shadow-md shadow-rosegold/20 cursor-pointer"
            >
              {textDict.simulateComplete30}
            </button>
          </div>

          <div className="border-t border-amber-200/60 dark:border-amber-800/20 pt-4 text-[11px] text-amber-900/80 dark:text-amber-100/80 font-mono grid grid-cols-2 gap-4">
            <div>
              <span className="text-slate-400 block mb-0.5">{textDict.currentDayLabel}:</span>
              <strong>Day {progress.currentDay} / 30</strong>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">{textDict.unlockedStatus}:</span>
              <span className={isEligibleForNextLevel ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500'}>
                {isEligibleForNextLevel ? textDict.unlockedEligible : textDict.unlockedLocked}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* 3. Dangerous reset zone */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-warmbrown-light border border-rose-100 dark:border-rosegold/10 rounded-3xl p-6 shadow-sm space-y-4"
      >
        <div className="flex items-center gap-2 text-rose-600">
          <Trash2 className="h-5 w-5" />
          <h3 className="text-sm font-sans font-medium text-slate-800 dark:text-warmwhite uppercase tracking-wider font-bold">
            {textDict.resetProgressTitle}
          </h3>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-lg">
          {textDict.resetProgressWarning}
        </p>

        <button
          onClick={handleResetConfirm}
          className="px-5 py-3 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 rounded-xl text-xs font-mono font-bold transition cursor-pointer"
        >
          {textDict.resetProgressBtn}
        </button>
      </motion.div>

    </div>
  );
}
