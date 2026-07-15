/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Users, HelpCircle, Mail, Phone, ExternalLink, Calendar, Sparkles,
  ArrowUpRight, CheckCircle2, MessageSquare, Play
} from 'lucide-react';
import { Language, CommunityConfig, FreeCommunityConfig, SupportConfig, MentoringConfig } from '../types';
import { loadCommunityConfig, loadFreeCommunityConfig, loadSupportConfig, loadMentoringConfig } from '../data/ecosystemData';
import { RENATA_OS_ENDPOINT } from '../config';

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

  const [supportMessage, setSupportMessage] = useState('');
  const [supportSent, setSupportSent] = useState(false);
  const [supportSending, setSupportSending] = useState(false);
  const [supportError, setSupportError] = useState(false);

  const handleSendForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim() || supportSending) return;

    if (!RENATA_OS_ENDPOINT) {
      setSupportError(true);
      return;
    }

    setSupportSending(true);
    setSupportError(false);
    try {
      const response = await fetch(`${RENATA_OS_ENDPOINT}/support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: supportMessage })
      });
      if (!response.ok) throw new Error('Support message failed');
      setSupportSent(true);
      setSupportMessage('');
      setTimeout(() => setSupportSent(false), 5000);
    } catch {
      setSupportError(true);
    } finally {
      setSupportSending(false);
    }
  };

  // Derives a YouTube thumbnail straight from the share URL, so the weekly
  // video cover updates automatically whenever the link changes — no manual
  // cover upload needed.
  const getYouTubeThumbnail = (url: string): string | null => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/);
    return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
  };
  const weeklyVideoThumbnail = getYouTubeThumbnail(support.weeklyVideoUrl);

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
      supportTab: 'Dicas & Direcionamentos',
      communityTitle: 'Seu Ecossistema de Pertencimento',
      communityDesc: 'No RenaSer, você não caminha [sozinha/sozinho/sozinhe]. Conecte-se com alunos do mundo inteiro para postar seus desafios diários, trocar críticas construtivas e criar laços eternos.',
      joinBtn: 'Entrar na Comunidade Agora',
      platformLabel: 'Plataforma Hospedeira',
      mentoringTitle: 'Acelere sua Destrava Frente às Lentes',
      mentoringBullet1: '45 minutos de Zoom particular com a criadora',
      mentoringBullet2: 'Calibração profunda de postura na câmera',
      mentoringBullet3: 'Auditoria da arquitetura dos seus ganchos',
      bookingCtaTitle: 'Agendar Sessão Particular',
      bookingCtaSub: 'Quer ir mais rápido? Agende um encontro VIP particular para refinar sua postura, auditar seus ganchos de vídeo e destravar medos invisíveis.',
      supportTitle: 'Dicas e Direcionamentos',
      supportDesc: 'Se você estiver com alguma dúvida técnica, problema de acesso ou precisar de orientação extra, nosso time está pronto para te apoiar.',
      upliftMessageHeader: 'VEM CELEBRAR',
      weeklyVideoTitle: 'Vídeo da Semana',
      weeklyVideoDesc: 'Um vídeo novo toda semana com dicas práticas para sua jornada de visibilidade.',
      weeklyVideoWatch: 'Assistir no YouTube',
      contactTitle: 'Fale Conosco Diretamente',
      emailLabel: 'Suporte por E-mail',
      whatsappLabel: 'WhatsApp Suporte',
      formLabel: 'Enviar Mensagem Rápida',
      formPlaceholder: 'Escreva sua dúvida ou feedback...',
      formSubmit: 'Enviar Mensagem',
      formSending: 'Enviando...',
      formSuccess: 'Sua mensagem foi enviada! Responderemos em breve.',
      formError: 'Não foi possível enviar agora. Tente novamente ou fale por WhatsApp.'
    },
    en: {
      communityTab: 'Main Community',
      mentoringTab: 'Mentoring & Masterclass',
      supportTab: 'Tips & Guidance',
      communityTitle: 'Your Ecosystem of Belonging',
      communityDesc: 'In RenaSer, you never walk alone. Connect with other students around the globe to share your daily challenges, trade constructive critiques, and build eternal bonds.',
      joinBtn: 'Join the Community Now',
      platformLabel: 'Hosted Platform',
      mentoringTitle: 'Accelerate Your On-Camera Posture',
      mentoringBullet1: '45 minutes Private Zoom with Creator',
      mentoringBullet2: 'In-depth on-camera posture calibration',
      mentoringBullet3: 'Hook-line content architecture audit',
      bookingCtaTitle: 'Book a Private Session',
      bookingCtaSub: 'Want to go faster? Book a private VIP consultation to audit your content hooks, calibrate your camera posture, and dismantle invisible bottlenecks.',
      supportTitle: 'Tips & Guidance',
      supportDesc: 'If you have any technical questions, access issues, or require custom guidance, our dedicated support crew is ready to assist you.',
      upliftMessageHeader: 'COME CELEBRATE',
      weeklyVideoTitle: 'Video of the Week',
      weeklyVideoDesc: 'A new video every week with practical tips for your visibility journey.',
      weeklyVideoWatch: 'Watch on YouTube',
      contactTitle: 'Contact Our Team Directly',
      emailLabel: 'Email Support',
      whatsappLabel: 'WhatsApp Hotline',
      formLabel: 'Send Quick Message',
      formPlaceholder: 'Type your question or feedback here...',
      formSubmit: 'Submit Request',
      formSending: 'Sending...',
      formSuccess: 'Your message has been sent! We will reply shortly.',
      formError: "Couldn't send it right now. Please try again or reach us on WhatsApp."
    },
    es: {
      communityTab: 'Comunidad Principal',
      mentoringTab: 'Mentoría y Masterclass',
      supportTab: 'Consejos y Guías',
      communityTitle: 'Tu Ecosistema de Pertenencia',
      communityDesc: 'En RenaSer, nunca caminas [sola/solo/sole]. Conéctate con alumnos de todo el mundo para publicar tus desafíos diarios, intercambiar comentarios constructivos y crear lazos eternos.',
      joinBtn: 'Unirse a la Comunidad Ahora',
      platformLabel: 'Plataforma Hospedera',
      mentoringTitle: 'Acelera Tu Postura Frente a la Cámara',
      mentoringBullet1: '45 minutos de Zoom privado con la creadora',
      mentoringBullet2: 'Calibración profunda de postura en cámara',
      mentoringBullet3: 'Auditoría de la arquitectura de tus ganchos',
      bookingCtaTitle: 'Reservar Sesión Privada',
      bookingCtaSub: '¿Quieres ir más rápido? Agenda un encuentro VIP privado para refinar tu postura, auditar tus ganchos de video y destrabar miedos invisibles.',
      supportTitle: 'Consejos y Guías',
      supportDesc: 'Si tienes alguna duda técnica, problema de acceso o necesitas orientación adicional, nuestro equipo está listo para apoyarte.',
      upliftMessageHeader: 'VEN A CELEBRAR',
      weeklyVideoTitle: 'Video de la Semana',
      weeklyVideoDesc: 'Un video nuevo cada semana con consejos prácticos para tu camino de visibilidad.',
      weeklyVideoWatch: 'Ver en YouTube',
      contactTitle: 'Contáctanos Directamente',
      emailLabel: 'Soporte por E-mail',
      whatsappLabel: 'WhatsApp de Soporte',
      formLabel: 'Enviar Mensaje Rápido',
      formPlaceholder: 'Escribe tu duda o comentarios aquí...',
      formSubmit: 'Enviar Mensaje',
      formSending: 'Enviando...',
      formSuccess: '¡Tu mensaje fue enviado! Te responderemos pronto.',
      formError: 'No se pudo enviar ahora. Intenta de nuevo o escríbenos por WhatsApp.'
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
              <span className="text-[9px] bg-[#D4AF37]/10 text-[#D4AF37] px-2 py-0.5 rounded font-mono font-bold uppercase tracking-widest border border-[#D4AF37]/15">
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
              <div className="flex gap-2 items-center">
                <div className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
                <span>{trans.mentoringBullet3}</span>
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
        <div className="lg:col-span-7 bg-white dark:bg-[#2C221E] border border-rose-100/40 dark:border-rosegold/10 rounded-3xl p-6 sm:p-8 shadow-rosegold flex flex-col sm:flex-row sm:items-center gap-5 justify-between">
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

      </div>

      {/* Support FAQ & Help Center Section */}
      <div className="bg-white dark:bg-[#2C221E] border border-rose-100/40 dark:border-rosegold/10 rounded-3xl p-6 sm:p-8 space-y-8 shadow-rosegold">
        
        {/* Support Header */}
        <div className="space-y-2">
          <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#D4AF37] flex items-center gap-1.5">
            <HelpCircle className="h-4 w-4" />
            {trans.supportTab}
          </span>
          <h3 className="text-xl sm:text-2xl font-serif font-light text-slate-900 dark:text-white">
            {trans.supportTitle}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
            {trans.supportDesc}
          </p>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
          
          {/* Support Columns Left: Video of the Week */}
          <div className="space-y-4">
            <h4 className="text-xs font-sans font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {trans.weeklyVideoTitle}
            </h4>

            <a
              href={support.weeklyVideoUrl}
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
                <span className="text-xs font-sans font-bold text-rosegold flex items-center gap-1.5">
                  {trans.weeklyVideoWatch}
                  <ExternalLink className="h-3 w-3" />
                </span>
              </div>
            </a>
          </div>

          {/* Support Columns Right: Direct Quick Actions and Email/WhatsApp links */}
          <div className="space-y-6">
            <h4 className="text-xs font-sans font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {trans.contactTitle}
            </h4>

            {/* Support Form or Contact Links Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              <a
                href={`mailto:${support.email}`}
                className="p-4 border border-rose-100/30 dark:border-rosegold/5 hover:border-rosegold/30 rounded-2xl flex flex-col gap-2 bg-[#FAF8F5]/20 dark:bg-warmbrown/10 transition group"
              >
                <div className="p-2 bg-rosegold/10 text-rosegold rounded-xl w-fit group-hover:scale-110 transition duration-300">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs font-sans font-semibold text-slate-800 dark:text-slate-200 block">{trans.emailLabel}</span>
                  <span className="text-[10px] text-slate-400 block font-mono truncate">{support.email}</span>
                </div>
              </a>

              <a
                href={`https://wa.me/${support.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="p-4 border border-rose-100/30 dark:border-rosegold/5 hover:border-rosegold/30 rounded-2xl flex flex-col gap-2 bg-[#FAF8F5]/20 dark:bg-warmbrown/10 transition group"
              >
                <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl w-fit group-hover:scale-110 transition duration-300">
                  <Phone className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs font-sans font-semibold text-slate-800 dark:text-slate-200 block">{trans.whatsappLabel}</span>
                  <span className="text-[10px] text-slate-400 block font-mono truncate">{support.whatsapp}</span>
                </div>
              </a>

            </div>

            {/* Direct quick support message form */}
            <form onSubmit={handleSendForm} className="space-y-3.5 pt-2">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {trans.formLabel}
              </label>
              
              <div className="space-y-3">
                <textarea
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  placeholder={trans.formPlaceholder}
                  rows={3}
                  className="w-full bg-[#FAF8F5] dark:bg-warmbrown border border-rose-100/30 dark:border-rosegold/10 rounded-2xl p-3.5 text-xs sm:text-sm focus:outline-none focus:border-rosegold text-slate-800 dark:text-slate-100"
                />
                
                <button
                  type="submit"
                  disabled={!supportMessage.trim() || supportSending}
                  className={`w-full py-3.5 px-4 rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition ${
                    supportMessage.trim() && !supportSending
                      ? 'bg-rosegold hover:bg-[#A35D68] text-white cursor-pointer'
                      : 'bg-slate-100 dark:bg-warmbrown text-slate-400 border border-rose-100/5 cursor-not-allowed'
                  }`}
                >
                  {supportSending ? trans.formSending : trans.formSubmit}
                </button>
              </div>

              {supportSent && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-medium text-emerald-700 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{trans.formSuccess}</span>
                </div>
              )}

              {supportError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-700 flex items-center gap-2">
                  <span>{trans.formError}</span>
                </div>
              )}
            </form>

          </div>

        </div>

      </div>

    </div>
  );
}
