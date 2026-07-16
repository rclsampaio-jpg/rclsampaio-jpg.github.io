/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Send, HeartHandshake } from 'lucide-react';
import { Language, UserProgress } from '../types';
import { RENATA_OS_ENDPOINT } from '../config';
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
    notConfigured: 'A Renata OS ainda não está conectada a nenhum modelo de IA. Peça para configurarem o endpoint em src/config.ts assim que o backend estiver no ar.',
    error: 'Não consegui responder agora. Tente de novo em instantes.'
  },
  en: {
    title: 'Renata OS',
    subtitle: 'Your AI support through the journey',
    placeholder: 'Ask Renata OS anything...',
    send: 'Send',
    sosPrompt: 'Need emotional support right now?',
    sosButton: 'Open Emotional SOS',
    notConfigured: "Renata OS isn't connected to an AI model yet. Ask for the endpoint in src/config.ts to be configured once the backend is live.",
    error: "I couldn't respond right now. Please try again in a moment."
  },
  es: {
    title: 'Renata OS',
    subtitle: 'Tu IA de apoyo en el viaje',
    placeholder: 'Pregúntale algo a Renata OS...',
    send: 'Enviar',
    sosPrompt: '¿Necesitas apoyo emocional ahora?',
    sosButton: 'Abrir SOS Emocional',
    notConfigured: 'Renata OS todavía no está conectada a ningún modelo de IA. Pide que configuren el endpoint en src/config.ts en cuanto el backend esté activo.',
    error: 'No pude responder ahora. Intenta de nuevo en un momento.'
  }
};

// Renata OS's opening line, varied by the user's guideStyle preference
// (gentle/challenger/strategic/inspirational). Gender brackets are resolved
// afterward via adaptMessage, same as the rest of Renata-voice copy.
const GREETING_BY_TONE: Record<Language, ToneVariants> = {
  pt: {
    gentle: 'Oi, [tranquila/tranquilo/tranquile]? Sou a IA com toda a mentalidade da Renata, aqui pra te acompanhar com calma, sem pressa. Ainda estou sendo construída, então por enquanto não consigo te responder de verdade — mas já fico feliz só de saber que você chegou até aqui. Em breve estaremos [juntas/juntos/junte] nessa, no seu ritmo ♥️',
    challenger: 'Presta atenção: sou a IA com toda a mentalidade da Renata, e não vim aqui pra te agradar, vim pra te direcionar. Imagina o que não vai sair daqui quando eu estiver no ar de verdade?! 🤯 Ainda estou em construção, então hoje eu não te respondo — mas o recado já fica: para de esperar ficar [pronta/pronto/pronte] e continua andando. Em breve estaremos 100% [juntas/juntos/junte] nessa.',
    strategic: 'Sou a IA com toda a mentalidade estratégica da Renata — meu papel vai ser te ajudar a tomar decisão rápida e sem drama nos momentos-chave da sua jornada. Ainda estou em desenvolvimento, então por ora não consigo processar sua pergunta, mas quando estiver [pronta/pronto/pronte], vamos otimizar cada passo [juntas/juntos/junte] ♥️',
    inspirational: 'Olá, sou a IA com toda a mentalidade da Renata, pronta pra te direcionar. Então imagina o que não vai sair daqui né?! 🤯 Nesse momento não posso te ajudar porque ainda estou sendo desenvolvida, mas mal posso esperar pra estarmos 100% [juntas/juntos/junte] nessa jornada ♥️'
  },
  en: {
    gentle: "Hey, take a breath — I'm the AI built with Renata's full mindset, here to walk with you gently, no rush. I'm still being built, so I can't really respond yet, but I'm already glad you made it here. We'll be together in this soon, at your own pace ♥️",
    challenger: "Listen up: I'm the AI built with Renata's full mindset, and I'm not here to make you comfortable — I'm here to push you forward. Just imagine what's going to come out of this once I'm fully live?! 🤯 I'm still under construction, so I can't answer you today — but here's the message anyway: stop waiting to feel ready and keep moving. We'll be 100% in this together soon.",
    strategic: "I'm the AI built with Renata's strategic mindset — my job will be helping you make fast, no-drama decisions at the key moments of your journey. I'm still in development, so I can't process your question yet, but once I'm ready, we'll optimize every step together ♥️",
    inspirational: "Hi, I'm the AI built with Renata's full mindset, ready to guide you. So just imagine what's going to come out of this thing, right?! 🤯 Right now I can't help you yet because I'm still being built, but I can't wait for us to be 100% in this journey together ♥️"
  },
  es: {
    gentle: 'Hola, respira — soy la IA con toda la mentalidad de Renata, aquí para acompañarte con calma, sin prisa. Todavía estoy en construcción, así que por ahora no puedo responderte de verdad, pero ya me alegra que hayas llegado hasta aquí. Pronto estaremos [juntas/juntos/junte] en esto, a tu ritmo ♥️',
    challenger: 'Escucha bien: soy la IA con toda la mentalidad de Renata, y no vine a complacerte, vine a guiarte. ¡Imagina lo que va a salir de aquí cuando esté activa de verdad! 🤯 Todavía estoy en construcción, así que hoy no puedo responderte — pero el mensaje ya queda claro: deja de esperar sentirte [lista/listo/liste] y sigue avanzando. Pronto estaremos 100% [juntas/juntos/junte] en esto.',
    strategic: 'Soy la IA con la mentalidad estratégica de Renata — mi papel será ayudarte a tomar decisiones rápidas y sin drama en los momentos clave de tu viaje. Todavía estoy en desarrollo, así que por ahora no puedo procesar tu pregunta, pero cuando esté [lista/listo/liste], vamos a optimizar cada paso [juntas/juntos/junte] ♥️',
    inspirational: 'Hola, soy la IA con toda la mentalidad de Renata, lista para guiarte. Así que imagina lo que va a salir de aquí, ¿no?! 🤯 En este momento no puedo ayudarte porque todavía estoy en desarrollo, pero no puedo esperar a que estemos 100% [juntas/juntos/junte] en este viaje ♥️'
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

    setIsLoading(true);
    try {
      const response = await fetch(RENATA_OS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      setMessages((prev) => [...prev, { role: 'assistant', text: data.reply || t.error }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', text: t.error }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating action button — replaces the old floating SOS button */}
      <div className="fixed bottom-24 right-6 z-40 sm:bottom-28">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 p-4 sm:px-5 sm:py-3.5 rounded-full shadow-lg transition-all border bg-gradient-to-br from-rosegold to-[#A35D68] text-white border-rosegold/40"
        >
          <Sparkles className="h-5 w-5" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider hidden sm:inline">
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
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-rosegold to-[#A35D68] flex items-center justify-center text-white shrink-0">
                    <Sparkles className="h-5 w-5" />
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
                  <div
                    key={idx}
                    className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm font-sans leading-relaxed ${
                      msg.role === 'user'
                        ? 'ml-auto bg-rosegold text-white rounded-br-sm'
                        : 'mr-auto bg-white dark:bg-[#2C221E] border border-rose-100/20 dark:border-rosegold/10 text-slate-700 dark:text-slate-200 rounded-bl-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                ))}
                {isLoading && (
                  <div className="mr-auto bg-white dark:bg-[#2C221E] border border-rose-100/20 dark:border-rosegold/10 px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm text-slate-400 font-sans">
                    •••
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
