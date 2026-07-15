/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { PartyPopper } from 'lucide-react';
import { Language } from '../types';

interface DayCompletionOverlayProps {
  dayNumber: number;
  lang: Language;
  onClose: () => void;
}

export default function DayCompletionOverlay({ dayNumber, lang, onClose }: DayCompletionOverlayProps) {
  const trans = {
    pt: {
      heading: 'PARABÉNS!!',
      message: `Você concluiu o Dia ${dayNumber}. Que super passo! Estou orgulhosa, e você também deveria estar!`,
      cta: 'Continuar'
    },
    en: {
      heading: 'CONGRATULATIONS!!',
      message: `You completed Day ${dayNumber}. What a huge step! I'm proud of you, and you should be too!`,
      cta: 'Continue'
    },
    es: {
      heading: '¡¡FELICIDADES!!',
      message: `Completaste el Día ${dayNumber}. ¡Qué gran paso! Estoy orgullosa de ti, y tú también deberías estarlo!`,
      cta: 'Continuar'
    }
  }[lang];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="max-w-sm w-full bg-white dark:bg-[#2C221E] rounded-[2rem] p-8 text-center space-y-5 shadow-2xl border border-rosegold/15"
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -6, 0], scale: [1, 1.08, 1] }}
            transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 1 }}
            className="h-16 w-16 rounded-2xl bg-gradient-to-br from-accentgold/20 to-rosegold/10 text-accentgold flex items-center justify-center mx-auto"
          >
            <PartyPopper className="h-8 w-8" />
          </motion.div>

          <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
            {trans.heading}
          </h2>

          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {trans.message}
          </p>

          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-rosegold hover:bg-[#A35D68] text-white text-xs font-sans font-bold uppercase tracking-wider transition cursor-pointer"
          >
            {trans.cta}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
