/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Award, Heart, Sparkles, Compass, CheckCircle2, Star, Share2, ExternalLink } from 'lucide-react';
import { Language, UserProgress } from '../types';

interface NextLevelViewProps {
  progress: UserProgress;
  lang: Language;
}

export default function NextLevelView({ progress, lang }: NextLevelViewProps) {
  
  const textDict = {
    pt: {
      congratsHeading: 'Você Rendeu. Você Renasceu.',
      congratsSub: 'Você provou que sua voz tem valor de ser mostrada.',
      certificateTitle: 'Certificado de Autenticidade Digital',
      certificateDesc: 'Este documento celebra a transição emocional de esconder-se à visibilidade intencional, construindo 30 dias de presença inabalável.',
      statMissions: 'Missões Cumpridas',
      statStreaks: 'Melhor Sequência',
      statHooks: 'Ganchos Salvos',
      blueprintTitle: 'Sua Nova Identidade de Marca',
      blueprintIntro: 'Daqui para frente, lembre-se destas 3 verdades:',
      truth1: 'A câmera não julga; ela serve de ponte para quem precisa ouvir você.',
      truth2: 'A imperfeição gera conexão. A perfeição gera distanciamento.',
      truth3: 'Seja consistente com sua verdade, e sua marca atrairá os aliados certos.',
      ctaHeading: 'O Próximo Passo: RenaSer Mastermind',
      ctaDesc: 'Agora que você quebrou o medo de gravar, faça parte do nosso ecossistema exclusivo de criadores de alto impacto pessoal.',
      ctaBtn: 'Agendar Mentoria de Posicionamento'
    },
    en: {
      congratsHeading: 'You Showed Up. You Reborn.',
      congratsSub: 'You proved that your voice has immense value to be shared.',
      certificateTitle: 'Digital Authenticity Certification',
      certificateDesc: 'This milestone celebrates your emotional transition from hiding to intentional visibility, establishing 30 days of unshakeable presence.',
      statMissions: 'Missions Completed',
      statStreaks: 'Peak Consistency',
      statHooks: 'Saved Hooks',
      blueprintTitle: 'Your New Brand Identity Blueprint',
      blueprintIntro: 'From this day forward, stand firm in these 3 truths:',
      truth1: 'The camera does not judge; it is a portal to those who need to learn from you.',
      truth2: 'Perfection repels. Vulnerability attracts and establishes real devotion.',
      truth3: 'Be consistent with your message, and your community will naturally rally.',
      ctaHeading: 'The Next Level: RenaSer Mastermind',
      ctaDesc: 'Now that you have conquered camera hesitation, secure your place in our private circle of personal branding pioneers.',
      ctaBtn: 'Book Positioning Call'
    },
    es: {
      congratsHeading: 'Te Mostraste. Renaciste.',
      congratsSub: 'Has demostrado que tu voz tiene un gran valor para ser compartida.',
      certificateTitle: 'Certificado de Autenticidad Digital',
      certificateDesc: 'Este logro celebra tu transición emocional de ocultarte a la visibilidad intencional, construyendo 30 días de presencia inquebrantable.',
      statMissions: 'Misiones Cumplidas',
      statStreaks: 'Mejor Consistencia',
      statHooks: 'Ganchos Guardados',
      blueprintTitle: 'El Plan de tu Nueva Identidad',
      blueprintIntro: 'A partir de hoy, recuerda estas 3 verdades esenciales:',
      truth1: 'La cámara no juzga; es un puente para quienes necesitan escucharte.',
      truth2: 'La imperfección conecta de verdad. La perfección crea distancia.',
      truth3: 'Sé fiel a tu propia verdad, y tu marca atraerá a las personas correctas.',
      ctaHeading: 'Siguiente Nivel: Mastermind RenaSer',
      ctaDesc: 'Ahora que has vencido el miedo a las cámaras, únete a nuestra exclusiva red de creadores de marcas de alto impacto.',
      ctaBtn: 'Agendar Mentoría Estratégica'
    }
  }[lang];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto space-y-12 select-none"
    >
      
      {/* 1. Next Level Premium Hero Banner */}
      <div className="text-center space-y-4 py-8">
        <motion.div
          animate={{ rotate: [0, 360], scale: [0.9, 1.1, 1] }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="inline-flex p-4 bg-gradient-to-tr from-accentgold to-rosegold text-white rounded-full shadow-lg shadow-rosegold/20"
        >
          <Award className="h-10 w-10 text-white" />
        </motion.div>

        <h1 className="text-4xl sm:text-5xl font-display font-light tracking-tight text-slate-900 dark:text-white leading-tight">
          {textDict.congratsHeading}
        </h1>
        <p className="text-sm sm:text-md text-slate-500 dark:text-slate-400 max-w-lg mx-auto font-sans">
          {textDict.congratsSub}
        </p>

        <div className="h-0.5 w-24 bg-gradient-to-r from-accentgold via-rosegold-light to-accentgold mx-auto mt-6" />
      </div>

      {/* 2. Celebration Certificate Framed Grid */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative overflow-hidden bg-gradient-to-br from-[#2C221E] via-[#1E1715] to-[#2C221E] text-white rounded-3xl p-8 sm:p-12 border border-accentgold/30 shadow-xl text-center space-y-6"
      >
        <div className="absolute top-0 left-0 h-40 w-40 bg-accentgold/10 blur-3xl rounded-full" />
        <div className="absolute -bottom-10 -right-10 h-40 w-40 bg-rosegold/10 blur-3xl rounded-full" />

        <div className="border border-accentgold/20 p-6 sm:p-8 rounded-2xl relative z-10 space-y-6">
          <div className="flex justify-center gap-1 text-accentgold">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-current" />
            ))}
          </div>

          <div className="space-y-2">
            <h3 className="text-lg sm:text-xl font-display tracking-widest text-accentgold font-bold uppercase">
              {textDict.certificateTitle}
            </h3>
            <p className="text-rose-100/70 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed font-sans">
              {textDict.certificateDesc}
            </p>
          </div>

          {/* User Achievement Stats inside Certificate */}
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto pt-4 border-t border-rose-100/10">
            <div className="text-center">
              <span className="block text-xl sm:text-2xl font-bold text-white font-mono">
                {progress.completionHistory.length}/30
              </span>
              <span className="text-[10px] text-rose-200/50 font-sans uppercase font-bold tracking-wider">
                {textDict.statMissions}
              </span>
            </div>
            
            <div className="text-center border-x border-rose-100/10">
              <span className="block text-xl sm:text-2xl font-bold text-accentgold font-mono">
                {progress.longestStreak}
              </span>
              <span className="text-[10px] text-rose-200/50 font-sans uppercase font-bold tracking-wider">
                {textDict.statStreaks}
              </span>
            </div>

            <div className="text-center">
              <span className="block text-xl sm:text-2xl font-bold text-white font-mono">
                {progress.favoriteHooks.length}
              </span>
              <span className="text-[10px] text-rose-200/50 font-sans uppercase font-bold tracking-wider">
                {textDict.statHooks}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 3. Blueprint & Core Truths */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        
        <div className="space-y-4">
          <span className="text-[10px] uppercase font-sans tracking-widest text-rosegold font-bold block">
            RenaSer Core Integration
          </span>
          <h3 className="text-xl font-display text-slate-800 dark:text-white">
            {textDict.blueprintTitle}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
            {textDict.blueprintIntro}
          </p>

          <div className="space-y-3 pt-2">
            {[textDict.truth1, textDict.truth2, textDict.truth3].map((truth, idx) => (
              <div key={idx} className="flex items-start gap-3 bg-white dark:bg-[#2C221E] p-4 rounded-xl border border-rose-100/20 dark:border-rosegold/10">
                <CheckCircle2 className="h-5 w-5 text-rosegold shrink-0 mt-0.5" />
                <p className="text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-sans font-medium">
                  {truth}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Elite Mastermind Invitation / CTA */}
        <div className="bg-gradient-to-br from-rose-50/20 to-[#FAF8F5]/30 dark:from-[#2C221E] dark:to-rosegold/5 border border-rose-100/30 dark:border-rosegold/10 rounded-3xl p-8 space-y-6">
          <div className="flex items-center gap-2 text-rosegold">
            <Sparkles className="h-6 w-6 animate-pulse" />
            <h4 className="text-xs font-sans uppercase tracking-widest font-bold">
              Elite Invitation
            </h4>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg sm:text-xl font-display font-bold text-slate-900 dark:text-white leading-snug">
              {textDict.ctaHeading}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed font-sans">
              {textDict.ctaDesc}
            </p>
          </div>

          <a
            href="https://wa.me/5500000000000?text=Completed%20RenaSer%20Mastermind"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 bg-rosegold hover:bg-[#A35D68] text-white rounded-xl text-xs font-sans font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-rosegold/20"
          >
            <span>{textDict.ctaBtn}</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

      </div>

    </motion.div>
  );
}
