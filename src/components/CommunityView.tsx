/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, MessageCircle, HelpCircle, Mail, Phone, ExternalLink, 
  ChevronDown, ChevronUp, AlertCircle, Heart, Calendar, Sparkles,
  ArrowUpRight, ShieldAlert, CheckCircle2, MessageSquare
} from 'lucide-react';
import { Language, CommunityConfig, SupportConfig, MentoringConfig } from '../types';
import { loadCommunityConfig, loadSupportConfig, loadMentoringConfig } from '../data/ecosystemData';

interface CommunityViewProps {
  lang: Language;
}

export default function CommunityView({ lang }: CommunityViewProps) {
  const [community, setCommunity] = useState<CommunityConfig>(() => loadCommunityConfig());
  const [support, setSupport] = useState<SupportConfig>(() => loadSupportConfig());
  const [mentoring, setMentoring] = useState<MentoringConfig>(() => loadMentoringConfig());
  
  // Reload in case settings updated in CMS
  useEffect(() => {
    const handleStorageChange = () => {
      setCommunity(loadCommunityConfig());
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

  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSent, setSupportSent] = useState(false);

  const toggleFaq = (id: string) => {
    setExpandedFaqId(expandedFaqId === id ? null : id);
  };

  const handleSendForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;
    setSupportSent(true);
    setSupportMessage('');
    setTimeout(() => setSupportSent(false), 5000);
  };

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
      supportTab: 'Suporte & Ajuda',
      communityTitle: 'Seu Ecossistema de Pertencimento',
      communityDesc: 'No RenaSer, você não caminha [sozinha/sozinho/sozinhe]. Conecte-se com alunos do mundo inteiro para postar seus desafios diários, trocar críticas construtivas e criar laços eternos.',
      joinBtn: 'Entrar na Comunidade Agora',
      platformLabel: 'Plataforma Hospedeira',
      mentoringTitle: 'Acelere sua Destrava Frente às Lentes',
      bookingCtaTitle: 'Book a Private Session',
      bookingCtaSub: 'Quer ir mais rápido? Agende um encontro VIP particular para refinar sua postura, auditar seus ganchos de vídeo e destravar medos invisíveis.',
      supportTitle: 'Suporte ao Aluno & FAQ',
      supportDesc: 'Se você estiver com alguma dúvida técnica, problema de acesso ou precisar de orientação extra, nosso time está pronto para te apoiar.',
      emergencyMessageHeader: 'MENSAGEM DE EMERGÊNCIA',
      faqTitle: 'Perguntas Frequentes',
      contactTitle: 'Fale Conosco Diretamente',
      emailLabel: 'Suporte por E-mail',
      whatsappLabel: 'WhatsApp Suporte',
      websiteLabel: 'Portal de Ajuda',
      helpCenterLabel: 'Central de Ajuda',
      formLabel: 'Enviar Mensagem Rápida',
      formPlaceholder: 'Escreva sua dúvida ou feedback...',
      formSubmit: 'Enviar Mensagem',
      formSuccess: 'Sua mensagem de suporte foi enviada com sucesso! Responderemos em breve.'
    },
    en: {
      communityTab: 'Main Community',
      mentoringTab: 'Mentoring & Masterclass',
      supportTab: 'Support & Help',
      communityTitle: 'Your Ecosystem of Belonging',
      communityDesc: 'In RenaSer, you never walk alone. Connect with other students around the globe to share your daily challenges, trade constructive critiques, and build eternal bonds.',
      joinBtn: 'Join the Community Now',
      platformLabel: 'Hosted Platform',
      mentoringTitle: 'Accelerate Your On-Camera Posture',
      bookingCtaTitle: 'Book a Private Session',
      bookingCtaSub: 'Want to go faster? Book a private VIP consultation to audit your content hooks, calibrate your camera posture, and dismantle invisible bottlenecks.',
      supportTitle: 'Student Support & FAQ',
      supportDesc: 'If you have any technical questions, access issues, or require custom guidance, our dedicated support crew is ready to assist you.',
      emergencyMessageHeader: 'EMERGENCY STATEMENT',
      faqTitle: 'Frequently Asked Questions',
      contactTitle: 'Contact Our Team Directly',
      emailLabel: 'Email Support',
      whatsappLabel: 'WhatsApp Hotline',
      websiteLabel: 'Support Portal',
      helpCenterLabel: 'Help Center',
      formLabel: 'Send Quick Message',
      formPlaceholder: 'Type your question or feedback here...',
      formSubmit: 'Submit Request',
      formSuccess: 'Your support request has been submitted! Our crew will reach out shortly.'
    },
    es: {
      communityTab: 'Comunidad Principal',
      mentoringTab: 'Mentoría y Masterclass',
      supportTab: 'Soporte y Ayuda',
      communityTitle: 'Tu Ecosistema de Pertenencia',
      communityDesc: 'En RenaSer, nunca caminas [sola/solo/sole]. Conéctate con alumnos de todo el mundo para publicar tus desafíos diarios, intercambiar comentarios constructivos y crear lazos eternos.',
      joinBtn: 'Unirse a la Comunidad Ahora',
      platformLabel: 'Plataforma Hospedera',
      mentoringTitle: 'Acelera Tu Postura Frente a la Cámara',
      bookingCtaTitle: 'Reservar Sesión Privada',
      bookingCtaSub: '¿Quieres ir más rápido? Agenda un encuentro VIP privado para refinar tu postura, auditar tus ganchos de video y destrabar miedos invisibles.',
      supportTitle: 'Soporte al Alumno y FAQ',
      supportDesc: 'Si tienes alguna duda técnica, problema de acceso o necesitas orientación adicional, nuestro equipo está listo para apoyarte.',
      emergencyMessageHeader: 'MENSAJE DE EMERGENCIA',
      faqTitle: 'Preguntas Frecuentes',
      contactTitle: 'Contáctanos Directamente',
      emailLabel: 'Soporte por E-mail',
      whatsappLabel: 'WhatsApp de Soporte',
      websiteLabel: 'Portal de Soporte',
      helpCenterLabel: 'Centro de Ayuda',
      formLabel: 'Enviar Mensaje Rápido',
      formPlaceholder: 'Escribe tu duda o comentarios aquí...',
      formSubmit: 'Enviar Mensaje',
      formSuccess: '¡Tu mensaje de soporte ha sido enviado con éxito! Responderemos muy pronto.'
    }
  }[lang];

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      
      {/* Upper Grid Layout: 2 Columns (Community Highlight & Mentoring VIP Card) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Community Core Portal Card */}
        <div className="lg:col-span-7 bg-white dark:bg-[#2C221E] border border-rose-100/40 dark:border-rosegold/10 rounded-3xl overflow-hidden shadow-rosegold flex flex-col justify-between">
          
          <div className="relative h-48 w-full overflow-hidden bg-warmbrown">
            <img 
              src={community.image || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80'} 
              alt={community.name[lang] || community.name['pt']}
              className="w-full h-full object-cover opacity-85 hover:scale-105 transition duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#2C221E] via-transparent to-transparent" />
            <div className="absolute top-4 left-4">
              {renderPlatformBadge(community.platform)}
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#D4AF37] flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                {trans.communityTab}
              </span>
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
                <span>45 minutes Private Zoom with Creator</span>
              </div>
              <div className="flex gap-2 items-center">
                <div className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
                <span>In-depth on-camera posture calibration</span>
              </div>
              <div className="flex gap-2 items-center">
                <div className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
                <span>Hook-line content architecture audit</span>
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

        {/* Support Emergency Board if active */}
        {support.emergencyMessage && (
          <div className="bg-rose-50/40 dark:bg-[#1E1715]/40 border border-rose-100/35 dark:border-rosegold/10 p-5 rounded-2xl flex gap-3.5 items-start relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500" />
            <ShieldAlert className="h-5 w-5 text-rose-500 shrink-0 mt-0.5 animate-pulse" />
            <div className="space-y-1 text-xs">
              <span className="font-sans font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400">
                {trans.emergencyMessageHeader}
              </span>
              <p className="text-slate-600 dark:text-slate-300 italic font-medium leading-relaxed">
                "{support.emergencyMessage[lang] || support.emergencyMessage['pt']}"
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
          
          {/* Support Columns Left: Accordion FAQ list */}
          <div className="space-y-4">
            <h4 className="text-xs font-sans font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {trans.faqTitle}
            </h4>
            
            <div className="space-y-2.5">
              {support.faqs.map((faq) => {
                const isExpanded = expandedFaqId === faq.id;
                return (
                  <div 
                    key={faq.id} 
                    className="border border-rose-100/30 dark:border-rosegold/5 rounded-xl overflow-hidden transition-colors"
                  >
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full p-4 text-left flex justify-between items-center gap-2 bg-[#FAF8F5]/40 dark:bg-warmbrown/10 hover:bg-[#FAF8F5]/80 dark:hover:bg-warmbrown/20 transition-colors cursor-pointer"
                    >
                      <span className="text-xs sm:text-sm font-sans font-medium text-slate-800 dark:text-slate-200">
                        {faq.question[lang] || faq.question['pt']}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      )}
                    </button>
                    
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="bg-white dark:bg-warmbrown-light"
                        >
                          <p className="p-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400 border-t border-rose-100/10">
                            {faq.answer[lang] || faq.answer['pt']}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
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

              <a
                href={support.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="p-4 border border-rose-100/30 dark:border-rosegold/5 hover:border-rosegold/30 rounded-2xl flex flex-col gap-2 bg-[#FAF8F5]/20 dark:bg-warmbrown/10 transition group"
              >
                <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl w-fit group-hover:scale-110 transition duration-300">
                  <ExternalLink className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs font-sans font-semibold text-slate-800 dark:text-slate-200 block">{trans.websiteLabel}</span>
                  <span className="text-[10px] text-slate-400 block font-mono truncate">suporte.renaser.co</span>
                </div>
              </a>

              <a
                href={support.helpCenterUrl}
                target="_blank"
                rel="noreferrer"
                className="p-4 border border-rose-100/30 dark:border-rosegold/5 hover:border-rosegold/30 rounded-2xl flex flex-col gap-2 bg-[#FAF8F5]/20 dark:bg-warmbrown/10 transition group"
              >
                <div className="p-2 bg-[#D4AF37]/10 text-[#D4AF37] rounded-xl w-fit group-hover:scale-110 transition duration-300">
                  <HelpCircle className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs font-sans font-semibold text-slate-800 dark:text-slate-200 block">{trans.helpCenterLabel}</span>
                  <span className="text-[10px] text-slate-400 block font-mono truncate">ajuda.renaser.co</span>
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
                  disabled={!supportMessage.trim()}
                  className={`w-full py-3.5 px-4 rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition ${
                    supportMessage.trim() 
                      ? 'bg-rosegold hover:bg-[#A35D68] text-white cursor-pointer' 
                      : 'bg-slate-100 dark:bg-warmbrown text-slate-400 border border-rose-100/5 cursor-not-allowed'
                  }`}
                >
                  {trans.formSubmit}
                </button>
              </div>

              {supportSent && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-medium text-emerald-700 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{trans.formSuccess}</span>
                </div>
              )}
            </form>

          </div>

        </div>

      </div>

    </div>
  );
}
