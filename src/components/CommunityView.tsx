/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import {
  Users, ExternalLink, Calendar, Sparkles,
  ArrowUpRight, MessageSquare
} from 'lucide-react';
import { Language, CommunityConfig, FreeCommunityConfig, SupportConfig, MentoringConfig } from '../types';
import { loadCommunityConfig, loadFreeCommunityConfig, loadSupportConfig, loadMentoringConfig } from '../data/ecosystemData';

interface CommunityViewProps {
  lang: Language;
}

export default function CommunityView({ lang }: CommunityViewProps) {
  const [community, setCommunity] = useState<CommunityConfig>(() => loadCommunityConfig());
  const [freeCommunity, setFreeCommunity] = useState<FreeCommunityConfig>(() => loadFreeCommunityConfig());
  const [support, setSupport] = useState<SupportConfig>(() => loadSupportConfig());
  const [mentoring, setMentoring] = useState<MentoringConfig>(() => loadMentoringConfig());

  // Reload in case settings updated in CMS
  useEffect(() => {
    const handleStorageChange = () => {
      setCommunity(loadCommunityConfig());
      setFreeCommunity(loadFreeCommunityConfig());
      setSupport(loadSupportConfig());
      setMentoring(loadMentoringConfig());
    };
    window.addEventListener('storage', handleStorageChange);
    // Also poll occasionally to ensure instant update when switching tabs
    const interval = setInterval(handleStorageChange, 1000);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Platform icon chooser
  const renderPlatformBadge = (platform: string) => {
    const badgeColors: Record<string, string> = {
      WhatsApp: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      Telegram: 'bg-sky-500/10 text-sky-500 border-sky-500/20',
      Circle: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
      Skool: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      Discord: 'bg-blurple-500/10 text-violet-500 border-violet-500/20',
      Slack: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
      'Facebook Groups': 'bg-blue-600/10 text-blue-500 border-blue-500/20'
    };
    const color = badgeColors[platform] || 'bg-rosegold/10 text-rosegold border-rosegold/20';
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${color}`}>
        {platform}
      </span>
    );
  };

  // Translations dictionary
  const trans = {
    pt: {
      communityTab: 'Comunidade Principal',
      mentoringTab: 'Mentoria & Masterclass',
      communityTitle: 'Seu Ecossistema de Pertencimento',
      communityDesc: 'No RenaSer, você não caminha [sozinha/sozinho/sozinhe]. Conecte-se com alunos do mundo inteiro para postar seus desafios diários, trocar críticas construtivas e criar laços eternos.',
      joinBtn: 'Entrar na Comunidade Agora',
      platformLabel: 'Plataforma Hospedeira',
      mentoringTitle: 'Acelere sua Destrava Frente às Lentes',
      mentoringBullet1: '1h20 Vídeo chamada Online - 1:1 Estratégica & Exclusiva',
      mentoringBullet2: 'Investimento especial para quem faz parte do EcoSistema RenaSer',
      bookingCtaTitle: 'Agendar Sessão Particular',
      bookingCtaSub: 'Quer ir mais rápido? Agende um encontro VIP particular para refinar sua postura, auditar seus ganchos de vídeo e destravar medos invisíveis.',
      upliftMessageHeader: 'VEM CELEBRAR',
    },
    en: {
      communityTab: 'Main Community',
      mentoringTab: 'Mentoring & Masterclass',
      communityTitle: 'Your Ecosystem of Belonging',
      communityDesc: 'In RenaSer, you never walk alone. Connect with other students around the globe to share your daily challenges, trade constructive critiques, and build eternal bonds.',
      joinBtn: 'Join the Community Now',
      platformLabel: 'Hosted Platform',
      mentoringTitle: 'Accelerate Your On-Camera Posture',
      mentoringBullet1: '1h20 Online Video Call - Strategic & Exclusive 1:1',
      mentoringBullet2: 'Special investment for members of the RenaSer Ecosystem',
      bookingCtaTitle: 'Book a Private Session',
      bookingCtaSub: 'Want to go faster? Book a private VIP consultation to audit your content hooks, calibrate your camera posture, and dismantle invisible bottlenecks.',
      upliftMessageHeader: 'COME CELEBRATE',
    },
    es: {
      communityTab: 'Comunidad Principal',
      mentoringTab: 'Mentoría y Masterclass',
      communityTitle: 'Tu Ecosistema de Pertenencia',
      communityDesc: 'En RenaSer, nunca caminas [sola/solo/sole]. Conéctate con alumnos de todo el mundo para publicar tus desafíos diarios, intercambiar comentarios constructivos y crear lazos eternos.',
      joinBtn: 'Unirse a la Comunidad Ahora',
      platformLabel: 'Plataforma Hospedera',
      mentoringTitle: 'Acelera Tu Postura Frente a la Cámara',
      mentoringBullet1: '1h20 Videollamada Online - Estratégica y Exclusiva 1:1',
      mentoringBullet2: 'Inversión especial para quienes forman parte del EcoSistema RenaSer',
      bookingCtaTitle: 'Reservar Sesión Privada',
      bookingCtaSub: '¿Quieres ir más rápido? Agenda un encuentro VIP privado para refinar tu postura, auditar tus ganchos de video y destrabar miedos invisibles.',
      upliftMessageHeader: 'VEN A CELEBRAR',
    }
  }[lang];

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      
      {/* Upper Grid Layout: 2 Columns (Community Highlight & Mentoring VIP Card) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Community Core Portal Card */}
        <div className="lg:col-span-7 bg-white dark:bg-[#2C221E] border border-rose-100/40 dark:border-rosegold/10 rounded-3xl overflow-hidden shadow-rosegold flex flex-col justify-between">
          
          <div className="p-6 sm:p-8 space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#D4AF37] flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  {trans.communityTab}
                </span>
                {renderPlatformBadge(community.platform)}
              </div>
              <h2 className="text-2xl font-serif font-light text-slate-900 dark:text-white leading-tight">
                {community.name[lang] || community.name['pt']}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                {community.description[lang] || community.description['pt']}
              </p>
            </div>

            <div className="pt-6">
              <a 
                href={community.joinLink} 
                target="_blank" 
                rel="noreferrer"
                style={{ backgroundColor: community.buttonColor }}
                className="w-full py-4 px-6 rounded-2xl text-white font-sans font-bold tracking-wider text-xs uppercase flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] shadow-lg shadow-rosegold/15"
              >
                <MessageSquare className="h-4 w-4" />
                <span>{community.buttonTitle[lang] || community.buttonTitle['pt']}</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

        </div>

        {/* Right: Premium Mentoring Card */}
        <div className="lg:col-span-5 bg-gradient-to-br from-warmbrown-light/40 to-[#2C221E] dark:from-[#2C221E] dark:to-[#1E1715] border border-rosegold/15 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-rosegold relative overflow-hidden group">
          
          {/* Subtle Golden Glow */}
          <div className="absolute -top-12 -right-12 h-36 w-36 bg-[#D4AF37]/5 blur-3xl rounded-full" />
          
          <div className="space-y-5 relative z-10">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#D4AF37] flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                {trans.mentoringTab}
              </span>
              <span className="text-[11px] bg-[#D4AF37]/10 text-[#D4AF37] px-2 py-0.5 rounded font-mono font-bold uppercase tracking-widest border border-[#D4AF37]/15">
                {mentoring.provider}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-serif font-light text-white leading-tight tracking-tight">
              {mentoring.title[lang] || mentoring.title['pt']}
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              {mentoring.description[lang] || mentoring.description['pt']}
            </p>

            {/* Checklist items to showcase luxury */}
            <div className="space-y-2 pt-2 text-xs font-sans text-slate-300">
              <div className="flex gap-2 items-center">
                <div className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
                <span>{trans.mentoringBullet1}</span>
              </div>
              <div className="flex gap-2 items-center">
                <div className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
                <span>{trans.mentoringBullet2}</span>
              </div>
            </div>
          </div>

          <div className="pt-8 relative z-10">
            <a
              href={mentoring.bookingUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full py-4 px-6 bg-[#D4AF37] hover:bg-amber-500 text-slate-950 rounded-2xl text-xs font-sans font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-xl shadow-amber-500/10"
            >
              <Calendar className="h-4 w-4" />
              <span>{mentoring.ctaText[lang] || mentoring.ctaText['pt']}</span>
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>

        </div>

        {/* Below VIP: Free Community Card */}
        <div className="lg:col-span-7 bg-white dark:bg-[#2C221E] border border-rose-100/40 dark:border-rosegold/10 rounded-3xl p-6 sm:p-8 shadow-rosegold space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                {freeCommunity.title[lang] || freeCommunity.title['pt']}
              </span>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans max-w-md">
                {freeCommunity.description[lang] || freeCommunity.description['pt']}
              </p>
            </div>

            <a
              href={freeCommunity.joinLink}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-bold tracking-wider text-xs uppercase flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] shadow-lg shadow-emerald-600/15"
            >
              <MessageSquare className="h-4 w-4" />
              <span>{trans.joinBtn}</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          {/* Uplifting Celebration Board */}
          {support.upliftMessage && (
            <div className="bg-amber-50/50 dark:bg-[#1E1715]/40 border border-accentgold/25 dark:border-rosegold/10 p-5 rounded-2xl flex gap-3.5 items-start relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-accentgold" />
              <Sparkles className="h-5 w-5 text-accentgold shrink-0 mt-0.5 animate-pulse" />
              <div className="space-y-1 text-xs">
                <span className="font-sans font-bold uppercase tracking-widest text-amber-700 dark:text-accentgold">
                  {trans.upliftMessageHeader}
                </span>
                <p className="text-slate-600 dark:text-slate-300 italic font-medium leading-relaxed">
                  "{support.upliftMessage[lang] || support.upliftMessage['pt']}"
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
