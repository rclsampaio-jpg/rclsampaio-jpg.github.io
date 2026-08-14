/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Plus, Paperclip, Mic, Maximize2, Minimize2 } from 'lucide-react';
import { Language, UserProgress } from '../types';
import { RenaSerIcon } from './RenaSerLogo';
import { RENATA_OS_ENDPOINT } from '../config';
import { supabase } from '../lib/supabase';
import { adaptMessage, resolveGrammarPreference, pickTone, resolveGuideStyle, ToneVariants } from '../utils/grammar';

// Mirrors the worker's stripMarkdown (renata-os-worker/src/index.js) — the
// backend only strips raw markdown when SAVING the exchange to the DB, so
// the live-streamed text still carries **/_ characters while it's being
// typed out. Apply the same cleanup client-side so what's on screen never
// shows raw markdown syntax, streaming or not.
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/(?<!\w)\*(?!\s)(.+?)(?<!\s)\*(?!\w)/g, '$1')
    .replace(/(?<!\w)_(?!\s)(.+?)(?<!\s)_(?!\w)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[-*]\s+/gm, '');
}

interface RenataOSChatProps {
  lang: Language;
  progress: UserProgress;
  currentDayNumber: number;
  // True outside the Home tab — shrinks the FAB to just the logo + "IA"
  // badge (no text label) so it stays out of the way of each screen's own
  // content instead of taking up a full pill's worth of space everywhere.
  compact?: boolean;
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
    attach: 'Enviar arquivos pdf/imagem (até 4)',
    removeAttachment: 'Remover arquivo',
    fileTooLarge: 'Esse arquivo é grande demais. Tenta um arquivo menor.',
    fileTypeInvalid: 'Só posso analisar imagens ou PDFs.',
    tooManyFiles: 'Só dá pra enviar até 4 arquivos de uma vez.',
    voiceInput: 'Falar em vez de digitar',
    maximize: 'Maximizar',
    restore: 'Restaurar tamanho',
    notConfigured: 'A Renata OS ainda não está conectada a nenhum modelo de IA. Peça para configurarem o endpoint em src/config.ts assim que o backend estiver no ar.'
  },
  en: {
    title: 'Renata OS',
    subtitle: 'Your AI support through the journey',
    placeholder: 'Ask Renata OS anything...',
    send: 'Send',
    attach: 'Send PDF/image files (up to 4)',
    removeAttachment: 'Remove file',
    fileTooLarge: 'That file is too large. Try a smaller one.',
    fileTypeInvalid: 'I can only analyze images or PDFs.',
    tooManyFiles: 'You can only send up to 4 files at once.',
    voiceInput: 'Speak instead of typing',
    maximize: 'Maximize',
    restore: 'Restore size',
    notConfigured: "Renata OS isn't connected to an AI model yet. Ask for the endpoint in src/config.ts to be configured once the backend is live."
  },
  es: {
    title: 'Renata OS',
    subtitle: 'Tu IA de apoyo en el viaje',
    placeholder: 'Pregúntale algo a Renata OS...',
    send: 'Enviar',
    attach: 'Enviar archivos pdf/imagen (hasta 4)',
    removeAttachment: 'Quitar archivo',
    fileTooLarge: 'Ese archivo es demasiado grande. Intenta con uno más pequeño.',
    fileTypeInvalid: 'Solo puedo analizar imágenes o PDFs.',
    tooManyFiles: 'Solo puedes enviar hasta 4 archivos a la vez.',
    voiceInput: 'Hablar en vez de escribir',
    maximize: 'Maximizar',
    restore: 'Restaurar tamaño',
    notConfigured: 'Renata OS todavía no está conectada a ningún modelo de IA. Pide que configuren el endpoint en src/config.ts en cuanto el backend esté activo.'
  }
};

const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024;
const MAX_ATTACHMENTS = 4;

interface PendingAttachment {
  name: string;
  mime: string;
  dataUrl: string;
}

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

const HINT_BY_LANG: Record<Language, string> = {
  pt: 'Sou uma IA, pergunte qualquer coisa 💬',
  en: "I'm an AI, ask me anything 💬",
  es: 'Soy una IA, pregúntame lo que sea 💬'
};

export default function RenataOSChat({ lang, progress, currentDayNumber, compact = false }: RenataOSChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef('');
  // First-visit hint bubble so the floating button reads as "AI chat" at a
  // glance instead of a mystery icon — shown once, dismissed on first open
  // or automatically after a few seconds, remembered via localStorage so it
  // doesn't nag on every visit.
  const [showHint, setShowHint] = useState(() => !localStorage.getItem('renaser_os_hint_seen'));

  const t = trans[lang];
  const prefGrammar = resolveGrammarPreference(progress.grammarPreference);
  const guideStyle = resolveGuideStyle(progress.guideStyle);

  useEffect(() => {
    if (!showHint) return;
    const timer = setTimeout(() => {
      setShowHint(false);
      localStorage.setItem('renaser_os_hint_seen', 'true');
    }, 6000);
    return () => clearTimeout(timer);
  }, [showHint]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = pickTone(GREETING_BY_TONE, lang, guideStyle);
      setMessages([{ role: 'assistant', text: adaptMessage(greeting, prefGrammar, lang) }]);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isLoading]);

  // Auto-grow the textarea on every change to `input`, not just on the
  // textarea's own onChange DOM event — voice input (below) sets `input`
  // directly via setInput(), which never fires onChange, so the box used
  // to stay stuck at its initial tiny height while dictated text kept
  // growing underneath, clipped and unscrollable-looking.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 240)}px`;
  }, [input]);

  // Voice input via the browser's native SpeechRecognition (no API cost).
  // Known iOS quirk: works reliably in a normal Safari tab but can be
  // flaky in the installed "Add to Home Screen" standalone PWA — if a user
  // reports the mic not picking up speech, that's the first thing to ask
  // about (installed icon vs. browser tab), same pattern as the other
  // iOS-standalone gotchas in this app.
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) return;
    setVoiceSupported(true);
    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es-ES' : 'en-US';

    // Reset per recording SESSION (onstart), not once per component mount —
    // this SpeechRecognition instance is reused across multiple start/stop
    // toggles (only recreated when `lang` changes), so without this reset
    // a second recording kept appending onto whatever text the first
    // recording had already accumulated, even after the box was cleared.
    recognition.onstart = () => {
      finalTranscriptRef.current = '';
    };
    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += transcript + ' ';
        } else {
          interim += transcript;
        }
      }
      setInput((finalTranscriptRef.current + interim).trim());
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
    recognitionRef.current = recognition;

    return () => {
      recognition.onstart = null;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      try { recognition.stop(); } catch { /* noop */ }
    };
  }, [lang]);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setInput('');
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch {
        setIsRecording(false);
      }
    }
  };

  const handleAttachClick = () => fileInputRef.current?.click();

  // Reads the file straight into a base64 data URL in memory, nothing
  // touches disk/storage — the file is sent with the next message and
  // discarded right after (backend doesn't persist it either), by design.
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files: File[] = Array.from(e.target.files || []);
    e.target.value = '';
    if (files.length === 0) return;

    setAttachmentError(null);

    setAttachments((prev) => {
      const room = MAX_ATTACHMENTS - prev.length;
      if (room <= 0) {
        setAttachmentError(t.tooManyFiles);
        return prev;
      }
      const toProcess = files.slice(0, room);
      if (files.length > room) {
        setAttachmentError(t.tooManyFiles);
      }

      for (const file of toProcess) {
        const isImage = file.type.startsWith('image/');
        const isPdf = file.type === 'application/pdf';
        if (!isImage && !isPdf) {
          setAttachmentError(t.fileTypeInvalid);
          continue;
        }
        if (file.size > MAX_ATTACHMENT_BYTES) {
          setAttachmentError(t.fileTooLarge);
          continue;
        }
        const reader = new FileReader();
        reader.onload = () => {
          setAttachments((cur) =>
            cur.length >= MAX_ATTACHMENTS
              ? cur
              : [...cur, { name: file.name, mime: file.type, dataUrl: reader.result as string }]
          );
        };
        reader.readAsDataURL(file);
      }
      return prev;
    });
  };

  const handleSend = async () => {
    const question = input.trim();
    const sentAttachments = attachments;
    if ((!question && sentAttachments.length === 0) || isLoading) return;

    const displayText = question || sentAttachments.map((a) => `📎 ${a.name}`).join('\n');
    setMessages((prev) => [...prev, { role: 'user', text: displayText }]);
    setInput('');
    setAttachments([]);
    setAttachmentError(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    if (!RENATA_OS_ENDPOINT) {
      setMessages((prev) => [...prev, { role: 'assistant', text: t.notConfigured }]);
      return;
    }

    const errorMessage = adaptMessage(pickTone(ERROR_BY_TONE, lang, guideStyle), prefGrammar, lang);

    setIsLoading(true);
    let bubbleStarted = false;
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
          },
          ...(sentAttachments.length > 0
            ? { attachments: sentAttachments.map((a) => ({ name: a.name, mime: a.mime, dataUrl: a.dataUrl })) }
            : {})
        })
      });
      if (!response.ok || !response.body) throw new Error('Bad response');

      // The Worker streams the reply as plain text now (token by token when
      // it can), so the bubble grows live instead of the "•••" indicator
      // sitting there for however long the free-tier model takes to finish
      // the whole reply. Push an empty assistant message first, then keep
      // rewriting its text as chunks arrive.
      let accumulated = '';
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        if (!bubbleStarted) {
          bubbleStarted = true;
          setIsLoading(false);
          setMessages((prev) => [...prev, { role: 'assistant', text: accumulated }]);
        } else {
          setMessages((prev) => {
            const next = [...prev];
            next[next.length - 1] = { role: 'assistant', text: accumulated };
            return next;
          });
        }
      }

      if (!bubbleStarted) {
        setMessages((prev) => [...prev, { role: 'assistant', text: errorMessage }]);
      }
    } catch {
      // Mid-stream failures still leave a partial bubble on screen (the
      // reader loop above already wrote what arrived before it broke), so
      // only append a fresh error bubble if nothing ever started rendering.
      if (!bubbleStarted) {
        setMessages((prev) => [...prev, { role: 'assistant', text: errorMessage }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating action button, replaces the old floating SOS button.
          Sits well above the mobile bottom nav pill (which lives at
          bottom-6, roughly 70-80px tall) so the two don't read as one
          crowded cluster. */}
      <div className="fixed bottom-28 right-4 z-40 sm:bottom-32 sm:right-6 flex flex-col items-end gap-2">
        <AnimatePresence>
          {showHint && !isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.95 }}
              className="relative max-w-[190px] bg-white dark:bg-ink-raised text-slate-700 dark:text-ink-text text-xs font-sans px-3.5 py-2.5 rounded-2xl rounded-br-sm shadow-lg border border-rose-100/40 dark:border-ink-hairline"
            >
              {HINT_BY_LANG[lang]}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowHint(false);
                  localStorage.setItem('renaser_os_hint_seen', 'true');
                }}
                className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-slate-300 dark:bg-ink-hairline text-white dark:text-ink-muted flex items-center justify-center"
                aria-label={t.send === 'Enviar' ? 'Fechar' : 'Close'}
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setIsOpen(true);
            setShowHint(false);
            localStorage.setItem('renaser_os_hint_seen', 'true');
          }}
          layout
          transition={{ layout: { duration: 0.25, ease: 'easeInOut' } }}
          className={`relative flex items-center rounded-full shadow-lg transition-colors border bg-gradient-to-br from-rosegold to-[#A35D68] text-white border-rosegold/40 dark:bg-none dark:bg-ink-raised dark:border-rosegold-light ${
            compact ? 'p-2' : 'gap-2.5 pl-3 pr-4 py-2.5 sm:pr-5'
          }`}
        >
          <motion.span
            className="absolute inset-0 rounded-full border-2 border-rosegold-light/60"
            animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <span className={`relative rounded-full bg-white/90 dark:bg-transparent flex items-center justify-center shrink-0 overflow-hidden ${compact ? 'h-8 w-8' : 'h-8 w-8'}`}>
            <RenaSerIcon size={22} animate={false} />
          </span>
          {!compact && (
            <span className="relative text-xs font-mono font-bold uppercase tracking-wider">
              {t.title}
            </span>
          )}
          {/* "AI" badge, mirrors the VIP-badge pattern used on the profile
              avatar — makes it obvious at a glance this is an AI feature,
              not just a generic action button. Always shown, including
              compact mode, since that's the whole point of the shrink. */}
          <span className="absolute -top-1.5 -left-1.5 bg-[#D4AF37] text-slate-950 text-[9px] font-mono font-black px-1.5 py-0.5 rounded-full border-2 border-white dark:border-ink shadow-sm">
            IA
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
              className={`relative w-full h-[85vh] bg-[#FAF8F5] dark:bg-ink rounded-t-3xl sm:rounded-3xl border border-rosegold/20 dark:border-ink-hairline shadow-rosegold dark:shadow-none flex flex-col overflow-hidden transition-[max-width,height] duration-300 ${
                isMaximized ? 'sm:max-w-4xl sm:h-[92vh]' : 'sm:max-w-xl sm:h-[75vh] sm:max-h-[780px]'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-rose-100/20 dark:border-ink-hairline">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full overflow-hidden shrink-0 border-2 border-rosegold/40 dark:border-rosegold-light/40">
                    <img src={`/assets/images/minhafoto.jpg?v=${__BUILD_VERSION__}`} alt="Renata" className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-ink-text font-sans">{t.title}</h3>
                    <p className="text-[10px] text-slate-400 dark:text-ink-muted font-sans">{t.subtitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsMaximized((v) => !v)}
                    title={isMaximized ? t.restore : t.maximize}
                    className="hidden sm:flex p-2 rounded-full text-slate-400 dark:text-ink-muted hover:text-rosegold dark:hover:text-rosegold-light hover:bg-rose-50/50 dark:hover:bg-rosegold-light/10 transition cursor-pointer"
                  >
                    {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-full text-slate-400 dark:text-ink-muted hover:text-rosegold dark:hover:text-rosegold-light hover:bg-rose-50/50 dark:hover:bg-rosegold-light/10 transition cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-3">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'assistant' && (
                      <span className="h-6 w-6 rounded-full overflow-hidden shrink-0 border border-rose-100/40 dark:border-rosegold-light/30">
                        <img src={`/assets/images/minhafoto.jpg?v=${__BUILD_VERSION__}`} alt="Renata" className="h-full w-full object-cover" />
                      </span>
                    )}
                    <div
                      className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm font-sans leading-relaxed whitespace-pre-wrap ${
                        msg.role === 'user'
                          ? 'bg-rosegold text-white rounded-br-sm selection:bg-white/30 selection:text-white'
                          : 'bg-white dark:bg-ink-raised border border-rose-100/20 dark:border-ink-hairline text-slate-700 dark:text-ink-text rounded-bl-sm'
                      }`}
                    >
                      {msg.role === 'assistant' ? stripMarkdown(msg.text) : msg.text}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-end gap-2 justify-start">
                    <span className="h-6 w-6 rounded-full overflow-hidden shrink-0 border border-rose-100/40 dark:border-rosegold-light/30">
                      <img src={`/assets/images/minhafoto.jpg?v=${__BUILD_VERSION__}`} alt="Renata" className="h-full w-full object-cover" />
                    </span>
                    <div className="bg-white dark:bg-ink-raised border border-rose-100/20 dark:border-ink-hairline px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm text-slate-400 dark:text-ink-muted font-sans">
                      •••
                    </div>
                  </div>
                )}
              </div>

              {/* Input row */}
              <div className="px-5 pt-2 pb-5 border-t border-rose-100/20 dark:border-ink-hairline">
                {(attachments.length > 0 || attachmentError) && (
                  <div className="mb-2 flex flex-wrap items-center gap-1.5 text-xs font-sans">
                    {attachments.map((att, idx) => (
                      <span
                        key={`${att.name}-${idx}`}
                        className="flex items-center gap-1.5 max-w-full bg-rose-50/60 dark:bg-rosegold-light/10 border border-rose-100/40 dark:border-rosegold-light/30 text-rosegold dark:text-rosegold-light rounded-full pl-2.5 pr-1.5 py-1"
                      >
                        <Paperclip className="h-3 w-3 shrink-0" />
                        <span className="truncate max-w-[120px]">{att.name}</span>
                        <button
                          type="button"
                          onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))}
                          title={t.removeAttachment}
                          className="h-4 w-4 shrink-0 rounded-full bg-rosegold/20 hover:bg-rosegold/30 flex items-center justify-center cursor-pointer"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </span>
                    ))}
                    {attachmentError && <span className="text-red-500">{attachmentError}</span>}
                  </div>
                )}
                <div className="flex items-end gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAttachClick}
                    disabled={attachments.length >= MAX_ATTACHMENTS}
                    title={t.attach}
                    className="h-11 w-11 shrink-0 rounded-xl border border-rose-100/30 dark:border-ink-hairline text-slate-500 dark:text-ink-muted hover:text-rosegold hover:border-rosegold/50 dark:hover:text-rosegold-light disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder={t.placeholder}
                    rows={1}
                    className="flex-1 text-sm bg-white dark:bg-ink-raised border border-rose-100/20 dark:border-ink-hairline focus:border-rosegold dark:focus:border-rosegold-light focus:outline-none focus:ring-1 focus:ring-rosegold dark:focus:ring-rosegold-light rounded-xl px-4 py-3 text-slate-700 dark:text-ink-text placeholder:dark:text-ink-muted transition-[border-color,box-shadow] resize-none max-h-60 overflow-y-auto"
                  />
                  {voiceSupported && (
                    <button
                      type="button"
                      onClick={toggleVoiceInput}
                      title={t.voiceInput}
                      className={`h-11 w-11 shrink-0 rounded-xl border flex items-center justify-center transition cursor-pointer ${
                        isRecording
                          ? 'bg-rosegold border-rosegold text-white animate-pulse'
                          : 'border-rose-100/30 dark:border-ink-hairline text-slate-500 dark:text-ink-muted hover:text-rosegold hover:border-rosegold/50 dark:hover:text-rosegold-light'
                      }`}
                    >
                      <Mic className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={handleSend}
                    disabled={isLoading || (!input.trim() && attachments.length === 0)}
                    className="h-11 w-11 shrink-0 rounded-xl bg-rosegold hover:bg-[#A35D68] disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition cursor-pointer"
                    title={t.send}
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
