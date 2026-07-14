/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Language } from '../types';
import { Sparkles } from 'lucide-react';
import ButterflyIcon from './ButterflyIcon';

interface TreeOfRebirthProps {
  completedCount: number;
  lang: Language;
}

export default function TreeOfRebirth({ completedCount, lang }: TreeOfRebirthProps) {
  // Determine stage (1 to 10) based on completed count of 30 days
  const getStageInfo = (count: number) => {
    if (count <= 2) {
      return {
        stage: 1,
        title: {
          pt: 'Semente Sagrada',
          en: 'Sacred Seed',
          es: 'Semilla Sagrada'
        },
        desc: {
          pt: 'Seu potencial de voz começa no silêncio e no acolhimento.',
          en: "Your voice's potential begins in silence and self-care.",
          es: 'Tu potencial de voz comienza en el silencio y el cuidado.'
        }
      };
    }
    if (count <= 5) {
      return {
        stage: 2,
        title: {
          pt: 'Broto de Coragem',
          en: 'Sprout of Courage',
          es: 'Brote de Coraje'
        },
        desc: {
          pt: 'A primeira fenda no solo. Você está ousando aparecer.',
          en: 'The first breakthrough. You are daring to appear.',
          es: 'La primera grieta en el suelo. Te atreves a aparecer.'
        }
      };
    }
    if (count <= 8) {
      return {
        stage: 3,
        title: {
          pt: 'Planta Jovem',
          en: 'Young Plant',
          es: 'Planta Joven'
        },
        desc: {
          pt: 'A estrutura se fortalece. A constância nutre sua base.',
          en: 'The structure strengthens. Consistency nurtures your base.',
          es: 'La estructura se fortalece. La constancia nutre tu base.'
        }
      };
    }
    if (count <= 11) {
      return {
        stage: 4,
        title: {
          pt: 'Surgimento das Folhas',
          en: 'Emerging Leaves',
          es: 'Surgimiento de Hojas'
        },
        desc: {
          pt: 'Os ganchos ganham corpo. Sua voz começa a ser ouvida.',
          en: 'Your hooks take shape. Your voice begins to be heard.',
          es: 'Tus ganchos toman forma. Tu voz comienza a ser escuchada.'
        }
      };
    }
    if (count <= 14) {
      return {
        stage: 5,
        title: {
          pt: 'Pequenos Ramos',
          en: 'Small Branches',
          es: 'Pequeñas Ramas'
        },
        desc: {
          pt: 'Os canais se multiplicam. Promessas cumpridas geram novas direções.',
          en: 'Channels multiply. Promises kept point in new directions.',
          es: 'Los canales se multiplican. Promesas cumplidas abren rumbos.'
        }
      };
    }
    if (count <= 17) {
      return {
        stage: 6,
        title: {
          pt: 'Primeira Flor',
          en: 'First Blossom',
          es: 'Primera Flor'
        },
        desc: {
          pt: 'Beleza e vulnerabilidade. Sua expressão autêntica desabrocha.',
          en: 'Beauty and vulnerability. Your authentic expression blooms.',
          es: 'Belleza y vulnerabilidad. Tu expresión auténtica florece.'
        }
      };
    }
    if (count <= 20) {
      return {
        stage: 7,
        title: {
          pt: 'Pouso da Borboleta',
          en: 'Butterfly Landing',
          es: 'Aterrizaje de Mariposa'
        },
        desc: {
          pt: 'Atração e sintonização. Sua presença atrai quem precisa de você.',
          en: 'Attraction and tuning. Your presence attracts those who need you.',
          es: 'Atracción y sintonía. Tu presencia atrae a quienes te necesitan.'
        }
      };
    }
    if (count <= 24) {
      return {
        stage: 8,
        title: {
          pt: 'Folhas Douradas',
          en: 'Golden Leaves',
          es: 'Hojas Doradas'
        },
        desc: {
          pt: 'Sabedoria da consistência. Cada compromisso selou sua nova identidade.',
          en: 'Wisdom of consistency. Each promise has sealed your new identity.',
          es: 'Sabiduría de la constancia. Cada promesa selló tu nueva identidad.'
        }
      };
    }
    if (count <= 28) {
      return {
        stage: 9,
        title: {
          pt: 'Árvore Inabalável',
          en: 'Unshakeable Tree',
          es: 'Árbol Inquebrantable'
        },
        desc: {
          pt: 'Raízes profundas no autoacolhimento, galhos fortes na verdade.',
          en: 'Deep roots in self-care, strong branches in truth.',
          es: 'Raíces profundas en auto-cuidado, ramas fuertes en la verdad.'
        }
      };
    }
    return {
      stage: 10,
      title: {
        pt: 'Renascimento em Plenitude',
        en: 'Full Rebirth',
        es: 'Renacimiento Pleno'
      },
      desc: {
        pt: 'Pleno florescimento. Borboletas douradas voam livremente. Você renasceu.',
        en: 'In full bloom. Golden butterflies fly freely. You have reborn.',
        es: 'Pleno florecimiento. Mariposas doradas vuelan libres. Has renacido.'
      }
    };
  };

  const info = getStageInfo(completedCount);
  const stage = info.stage;

  // Map the 10 growth stages onto the 4 tree illustrations (1: sapling -> 4: completed tree)
  const getTreeImage = (s: number) => {
    if (s <= 2) return '/assets/images/trees/tree-1.png';
    if (s <= 5) return '/assets/images/trees/tree-2.png';
    if (s <= 8) return '/assets/images/trees/tree-3.png';
    return '/assets/images/trees/tree-4.png';
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-5 transition relative select-none">

      {/* The Visual Tree Area */}
      <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
        <motion.img
          key={stage}
          src={getTreeImage(stage)}
          alt={info.title[lang]}
          className="w-full h-full object-contain"
          style={stage >= 9 ? { scaleY: 1.18, transformOrigin: 'bottom center' } : undefined}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{
            opacity: 1,
            scale: [1, 1.03, 1],
            y: [0, -0.6, 0]
          }}
          transition={{
            opacity: { duration: 0.4 },
            scale: { duration: 7, repeat: Infinity, ease: "easeInOut" },
            y: { duration: 7, repeat: Infinity, ease: "easeInOut" }
          }}
        />

        {/* Butterflies fluttering around the fully-bloomed tree's canopy */}
        {stage >= 9 && (
          <>
            <motion.div
              className="absolute pointer-events-none"
              style={{ top: '14%', left: '18%' }}
              animate={{
                x: [0, 8, 2, 10, 0],
                y: [0, -6, 3, -5, 0],
                rotate: [0, 8, -6, 6, 0]
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <motion.img
                src="/assets/images/butterfly.png"
                alt=""
                className="h-4 w-auto"
                animate={{ scaleY: [1, 0.78, 1], skewX: [0, 3, 0] }}
                transition={{ duration: 0.4, repeat: Infinity, ease: "easeInOut" }}
                style={{ transformOrigin: 'center 70%' }}
              />
            </motion.div>
            <motion.div
              className="absolute pointer-events-none"
              style={{ top: '8%', right: '12%' }}
              animate={{
                x: [0, -7, -1, -9, 0],
                y: [0, 5, -3, 6, 0],
                rotate: [0, -8, 6, -6, 0]
              }}
              transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
            >
              <motion.img
                src="/assets/images/butterfly.png"
                alt=""
                className="h-3 w-auto"
                animate={{ scaleY: [1, 0.78, 1], skewX: [0, 3, 0] }}
                transition={{ duration: 0.4, repeat: Infinity, ease: "easeInOut", delay: 0.15 }}
                style={{ transformOrigin: 'center 70%' }}
              />
            </motion.div>
            {/* Third butterfly, looping in a wider orbit around the canopy */}
            <motion.div
              className="absolute pointer-events-none"
              style={{ top: '18%', left: '42%' }}
              animate={{
                x: [0, 16, 0, -16, 0],
                y: [0, -10, -16, -10, 0],
                rotate: [0, 10, 0, -10, 0]
              }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            >
              <motion.img
                src="/assets/images/butterfly.png"
                alt=""
                className="h-3.5 w-auto"
                animate={{ scaleY: [1, 0.78, 1], skewX: [0, 3, 0] }}
                transition={{ duration: 0.4, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                style={{ transformOrigin: 'center 70%' }}
              />
            </motion.div>
          </>
        )}

        {/* Small floating Sparkles badge */}
        <div className="absolute bottom-1 right-1 p-1 bg-[#D4AF37]/15 rounded-full border border-[#D4AF37]/35 text-[#D4AF37]">
          <Sparkles className="h-3 w-3 animate-spin" style={{ animationDuration: '6s' }} />
        </div>
      </div>

      {/* Description column */}
      <div className="flex-1 space-y-1.5 text-left">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-sans font-extrabold uppercase tracking-widest text-rosegold px-2.5 py-0.5 rounded-full bg-rosegold/10 border border-rosegold/10">
            {lang === 'pt' ? 'Árvore do Renascimento' : lang === 'es' ? 'Árbol del Renacimiento' : 'Tree of Rebirth'}
          </span>
          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 font-bold">
            {lang === 'pt' ? 'Nível' : lang === 'es' ? 'Nivel' : 'Level'} {stage}/10
          </span>
        </div>

        <h4 className="text-lg font-serif font-black uppercase text-slate-800 dark:text-white leading-tight">
          {info.title[lang]}
        </h4>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
          {info.desc[lang]}
        </p>

        {/* Small interactive indicator */}
        <div className="pt-1 flex items-center gap-2">
          <div className="flex-1 bg-rose-100/30 dark:bg-rosegold/10 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-rosegold to-accentgold h-full rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(100, Math.max(5, (completedCount / 30) * 100))}%` }}
            />
          </div>
          <span className="text-[9px] font-mono font-bold text-slate-400 shrink-0">
            {completedCount}/30 {lang === 'pt' ? 'Selas' : lang === 'es' ? 'Sellos' : 'Promises'}
          </span>
        </div>
      </div>

    </div>
  );
}
