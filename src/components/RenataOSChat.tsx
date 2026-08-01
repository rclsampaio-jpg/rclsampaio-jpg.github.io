/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, HeartHandshake } from 'lucide-react';
import { Language, UserProgress } from '../types';
import { RenaSerIcon } from './RenaSerLogo';
import { RENATA_OS_ENDPOINT } from '../config';
import { supabase } from '../lib/supabase';
import { adaptMessage, resolveGrammarPreference, pickTone, resolveGuideStyle, ToneVariants } from '../utils/grammar';

interface RenataOSChatProps {
  lang: Language;
  progress: UserProgress;
  currentDayNumber: number;
  onOpenSos: () => void;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

const trans = {
  pt: {
    title: 'Renata OS',
    subtitle: 'Sua IA de apoio na jornada',
    placeholder: 'Pergunte alguma coisa para a Renata OS...',
    send: 'Enviar',
    sosPrompt: 'Precisa de apoio emocional agora?',
    sosButton: 'Abrir SOS Emocional',
    notConfigured: 'A Renata OS ainda não está conectada a nenhum modelo de IA. Peça para configurarem o endpoint em src/config.ts assim que o backend estiver no ar.'
  },
  en: {
    title: 'Renata OS',
    subtitle: 'Your AI support through the journey',
    placeholder: 'Ask Renata OS anything...',
    send: 'Send',
    sosPrompt: 'Need emotional support right now?',
    sosButton: 'Open Emotional SOS',
    notConfigured: "Renata OS isn't connected to an AI model yet. Ask for the endpoint in src/config.ts to be configured once the backend is live."
  },
  es: {
    title: 'Renata OS',
    subtitle: 'Tu IA de apoyo en el viaje',
    placeholder: 'Pregúntale algo a Renata OS...',
    send: 'Enviar',
    sosPrompt: '¿Necesitas apoyo emocional ahora?',
    sosButton: 'Abrir SOS Emocional',
    notConfigured: 'Renata OS todavía no está conectada a ningún modelo de IA. Pide que configuren el endpoint en src/config.ts en cuanto el backend esté activo.'
  }
};

// Shown when a reply genuinely fails to come back (network/CORS/backend
// hiccup), varied by guideStyle like the greeting below — the point is to
// never let a technical failure read as cold or apologetic-corporate, in
// line with tom-de-voz.md: own the glitch as ours, not make her feel like
// she did something wrong by asking.
const ERROR_BY_TONE: Record<Language, ToneVariants> = {
  pt: {
    gentle: 'Ih, acho que travei aqui do meu lado agora, não foi você não. Respira, tenta de novo em instantes que eu [continuo/continuo/continue] aqui ♥️',
    challenger: 'Deu ruim foi na minha conexão, não na sua coragem de perguntar. Tenta de novo, eu já [volto/volto/volte].',
    strategic: 'Falha técnica momentânea aqui do meu lado, nada relacionado à sua pergunta. Tenta de novo em instantes e a gente continua de onde [parou/parou/parou].',
    inspirational: 'Opa, travei por um segundo aqui (isso sim é normal, viu?). Tenta de novo, porque o que vem depois dessa pergunta vai valer a pena 🚀'
  },
  en: {
    gentle: "Hey, I think I glitched on my end just now, not you. Take a breath, try again in a moment, I'm still right here ♥️",
    challenger: "That failure was my connection, not your courage for asking. Try again, I'll be right back.",
    strategic: "Momentary technical hiccup on my end, unrelated to your question. Try again in a moment and we'll pick up right where we left off.",
    inspirational: "Whoops, I froze for a second there (that happens, no big deal). Try again, because what comes after this question is going to be worth it 🚀"
  },
  es: {
    gentle: 'Ey, creo que me trabé yo aquí, no fuiste tú. Respira, intenta de nuevo en un momento, sigo aquí ♥️',
    challenger: 'La falla fue mi conexión, no tu valentía por preguntar. Intenta de nuevo, ya vuelvo.',
    strategic: 'Falla técnica momentánea de mi lado, no tiene nada que ver con tu pregunta. Intenta de nuevo en un momento y seguimos donde quedamos.',
    inspirational: '¡Ups, me trabé un segundo! (eso es normal, tranquila). Intenta de nuevo, porque lo que viene después de esta pregunta va a valer la pena 🚀'
  }
};

// Renata OS's opening line, varied by the user's guideStyle preference
// (gentle/challenger/strategic/inspirational). Gender brackets are resolved
// afterward via adaptMessage, same as the rest of Renata-voice copy.
const GREETING_BY_TONE: Record<Language, ToneVariants> = {
  pt: {
    gentle: 'Oi, [tranquila/tranquilo/tranquile]? Sou a IA com toda a mentalidade da Renata, aqui pra te acompanhar com calma, sem pressa, no seu ritmo. Pode perguntar de verdade, travei em algum post, não sei o que falar hoje, qualquer coisa. Estou [aqui/aqui/aqui] com você ♥️',
    challenger: 'Presta atenção: sou a IA com toda a mentalidade da Renata, e não vim aqui pra te agradar, vim pra te direcionar. Pode perguntar de verdade agora, sem enrolação, e eu te devolvo direção, não carinho vazio. Bora.',
    strategic: 'Sou a IA com a mentalidade estratégica da Renata, meu papel é te ajudar a tomar decisão rápida e sem drama nos momentos-chave da sua jornada. Pode trazer a dúvida real, travei em qual formato postar, o que fazer com esse resultado, qualquer coisa, e eu já entro no ponto.',
    inspirational: 'Olá, sou a IA com toda a mentalidade da Renata, pronta pra te direcionar de verdade agora. Pode perguntar o que travou, o que você não sabe por onde começar, o que quiser, imagina o que vai sair dessa conversa 🚀'
  },
  en: {
    gentle: "Hey, take a breath, I'm the AI built with Renata's full mindset, here to walk with you gently, at your own pace. Ask me anything for real, stuck on a post, don't know what to say today, whatever it is. I'm right here with you ♥️",
    challenger: "Listen up: I'm the AI built with Renata's full mindset, and I'm not here to make you comfortable, I'm here to push you forward. Ask me for real right now, no stalling, I'll hand you direction, not empty comfort. Let's go.",
    strategic: "I'm the AI built with Renata's strategic mindset, my job is helping you make fast, no-drama decisions at the key moments of your journey. Bring the real question, stuck on which format to post, what to do with a result, whatever it is, and I'll get straight to the point.",
    inspirational: "Hi, I'm the AI built with Renata's full mindset, ready to guide you for real right now. Ask whatever's got you stuck, whatever you don't know where to start with, just imagine what's going to come out of this conversation 🚀"
  },
  es: {
    gentle: 'Hola, respira, soy la IA con toda la mentalidad de Renata, aquí para acompañarte con calma, a tu ritmo. Pregúntame de verdad, si te trabaste en un post, si no sabes qué decir hoy, lo que sea. Estoy aquí contigo ♥️',
    challenger: 'Escucha bien: soy la IA con toda la mentalidad de Renata, y no vine a complacerte, vine a guiarte. Pregúntame de verdad ahora, sin rodeos, y te devuelvo dirección, no cariño vacío. Vamos.',
    strategic: 'Soy la IA con la mentalidad estratégica de Renata, mi papel es ayudarte a tomar decisiones rápidas y sin drama en los momentos clave de tu viaje. Trae la duda real, en qué formato publicar, qué hacer con ese resultado, lo que sea, y voy directo al punto.',
    inspirational: 'Hola, soy la IA con toda la mentalidad de Renata, lista para guiarte de verdad ahora mismo. Pregunta lo que te trabó, lo que no sabes por dónde empezar, imagina lo que va a salir de esta conversación 🚀'
  }
};

export default function RenataOSChat({ lang, progress, currentDayNumber, onOpenSos }: RenataOSChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const t = trans[lang];
  const prefGrammar = resolveGrammarPreference(progress.grammarPreference);
  const guideStyle = resolveGuideStyle(progress.guideStyle);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = pickTone(GREETING_BY_TONE, lang, guideStyle);
      setMessages([{ role: 'assistant', text: adaptMessage(greeting, prefGrammar, lang) }]);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async () => {
    const question = input.trim();
    if (!question || isLoading) return;

    setMessages((prev) => [...prev, { role: 'user', text: question }]);
    setInput('');

    if (!RENATA_OS_ENDPOINT) {
      setMessages((prev) => [...prev, { role: 'assistant', text: t.notConfigured }]);
      return;
    }

    const errorMessage = adaptMessage(pickTone(ERROR_BY_TONE, lang, guideStyle), prefGrammar, lang);

    setIsLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) {
        setMessages((prev) => [...prev, { role: 'assistant', text: errorMessage }]);
        setIsLoading(false);
        return;
      }

      const response = await fetch(RENATA_OS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          message: question,
          lang,
          context: {
            dayNumber: currentDayNumber,
            completedDays: progress.completionHistory.length,
            currentStreak: progress.currentStreak
          }
        })
      });
      if (!response.ok) throw new Error('Bad response');
      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'assistant', text: data.reply || errorMessage }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', text: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating action button, replaces the old floating SOS button */}
      <div className="fixed bottom-24 right-6 z-40 sm:bottom-28">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="relative flex items-center gap-2.5 pl-3 pr-4 py-2.5 sm:pr-5 rounded-full shadow-lg transition-all border bg-gradient-to-br from-rosegold to-[#A35D68] text-white border-rosegold/40 dark:bg-none dark:bg-ink-raised dark:border-rosegold-light"
        >
          <motion.span
            className="absolute inset-0 rounded-full border-2 border-rosegold-light/60"
            animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <span className="relative h-8 w-8 rounded-full bg-white/90 dark:bg-transparent flex items-center justify-center shrink-0 overflow-hidden">
            <RenaSerIcon size={22} animate={false} />
          </span>
          <span className="relative text-xs font-mono font-bold uppercase tracking-wider hidden sm:inline">
            {t.title}
          </span>
        </motion.button>
      </div>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="relative w-full sm:max-w-md h-[85vh] sm:h-[600px] bg-[#FAF8F5] dark:bg-[#1E1715] rounded-t-3xl sm:rounded-3xl border border-rosegold/20 shadow-rosegold flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-rose-100/20 dark:border-rosegold/10">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-rosegold to-[#A35D68] dark:bg-none dark:bg-ink flex items-center justify-center shrink-0 p-1.5 border dark:border-rosegold-light/40">
                    <RenaSerIcon size={28} animate={false} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 font-sans">{t.title}</h3>
                    <p className="text-[10px] text-slate-400 font-sans">{t.subtitle}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full text-slate-400 hover:text-rosegold hover:bg-rose-50/50 dark:hover:bg-rosegold/10 transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-3">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'assistant' && (
                      <span className="h-6 w-6 rounded-full bg-white dark:bg-ink border border-rose-100/40 dark:border-rosegold-light/30 flex items-center justify-center shrink-0 p-1">
                        <RenaSerIcon size={16} animate={false} />
                      </span>
                    )}
                    <div
                      className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm font-sans leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-rosegold text-white rounded-br-sm'
                          : 'bg-white dark:bg-[#2C221E] border border-rose-100/20 dark:border-rosegold/10 text-slate-700 dark:text-slate-200 rounded-bl-sm'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-end gap-2 justify-start">
                    <span className="h-6 w-6 rounded-full bg-white dark:bg-ink border border-rose-100/40 dark:border-rosegold-light/30 flex items-center justify-center shrink-0 p-1">
                      <RenaSerIcon size={16} animate={false} />
                    </span>
                    <div className="bg-white dark:bg-[#2C221E] border border-rose-100/20 dark:border-rosegold/10 px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm text-slate-400 font-sans">
                      •••
                    </div>
                  </div>
                )}
              </div>

              {/* SOS quick action */}
              <div className="px-5 pb-2">
                <button
                  onClick={() => { setIsOpen(false); onOpenSos(); }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-50/60 dark:bg-rosegold/5 border border-rose-100/30 dark:border-rosegold/10 text-xs font-sans font-semibold text-rosegold transition cursor-pointer hover:bg-rose-50 dark:hover:bg-rosegold/10"
                >
                  <HeartHandshake className="h-3.5 w-3.5" />
                  {t.sosPrompt} {t.sosButton}
                </button>
              </div>

              {/* Input row */}
              <div className="p-5 pt-2 border-t border-rose-100/20 dark:border-rosegold/10 flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={t.placeholder}
                  className="flex-1 text-sm bg-white dark:bg-[#130E0D] border border-rose-100/20 dark:border-rosegold/10 focus:border-rosegold focus:outline-none focus:ring-1 focus:ring-rosegold rounded-xl px-4 py-3 text-slate-700 dark:text-slate-200 transition-all"
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="h-11 w-11 shrink-0 rounded-xl bg-rosegold hover:bg-[#A35D68] disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition cursor-pointer"
                  title={t.send}
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
