/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { Award, Heart, Sparkles, Compass, CheckCircle2, Star, Share2, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { Language, UserProgress } from '../types';
import { resolveGuideStyle, ToneVariants } from '../utils/grammar';
import EditableText from './editable/EditableText';

interface NextLevelViewProps {
  progress: UserProgress;
  lang: Language;
  isProfessionalUnlocked?: boolean;
  isAdminUnlocked?: boolean;
  onGoToDestrave?: () => void;
  onGoToLibrary?: () => void;
  onGoToCommunity?: () => void;
}

// Cadência semanal da Fase de Prática (dias 31-90): reaproveita os 4 tipos
// de dia que já existem nos 30 dias (Verdade, Pensamento Contrário,
// Storytelling, Presença), cada um com o exercício real já validado, não
// um tema novo inventado. Cicla a cada 4 semanas.
const PRACTICE_WEEKS: { theme: string; title: string; challenge: string; where: string }[] = [
  {
    theme: 'Verdade',
    title: 'Semana da Verdade',
    challenge: 'Grave um conteúdo sem preparo, sem decorar roteiro, sem ensaiar na frente do espelho. Abre o celular, aperta gravar, fala. A imperfeição é o ponto, não o risco.',
    where: 'Usa o prompt de "Revisão de texto" da Biblioteca pra tirar cara de IA do que sair, sem regravar do zero.'
  },
  {
    theme: 'Pensamento Contrário',
    title: 'Semana da Opinião Impopular',
    challenge: 'Grava uma opinião sua que nem todo mundo vai concordar. Uma coisa que você normalmente engoliria pra não incomodar ninguém, mas que é verdadeira pra você.',
    where: 'Usa os prompts do grupo "Reels de conversão" da Biblioteca pra estruturar isso nos 7 ângulos validados.'
  },
  {
    theme: 'Storytelling',
    title: 'Semana da Jornada do Herói',
    challenge: 'Conta um fracasso, uma vez que você tentou algo e não deu certo, e o que você aprendeu com isso. As pessoas se conectam com o caminho torto, não com a vitória perfeita.',
    where: 'Usa os prompts do grupo "Reels até 90s" da Biblioteca, é exatamente pra história de bastidor.'
  },
  {
    theme: 'Presença',
    title: 'Semana de Falar pra Uma Pessoa',
    challenge: 'Esquece o número de visualização. Grava pensando numa pessoa real que precisa ouvir exatamente o que você tem pra falar hoje. Não é escala, é profundidade.',
    where: 'Usa o prompt do grupo "Mensagem central / audiência obcecada" da Biblioteca antes de gravar.'
  }
];

function getCurrentPracticeWeekIndex(progress: UserProgress): number {
  if (!progress.journeyStartDate) return 0;
  const start = new Date(`${progress.journeyStartDate}T00:00:00`);
  const day30 = new Date(start);
  day30.setDate(day30.getDate() + 30);
  const weeksElapsed = Math.floor((Date.now() - day30.getTime()) / (1000 * 60 * 60 * 24 * 7));
  return ((weeksElapsed % 4) + 4) % 4;
}

// Link de WhatsApp real, o mesmo usado em /destrave (CTA "Quero começar meu
// DESTRAVE"). Antes esse CTA apontava pra um produto fictício ("RenaSer
// Mastermind") com número placeholder nunca preenchido.
const DESTRAVE_WHATSAPP_LINK = 'https://wa.me/message/KJTHGYJ7JXGCI1';

// Graduation-screen copy that varies by guideStyle. "inspirational" preserves
// the original wording this screen shipped with.
const GRADUATION_TONE: Record<Language, {
  congratsHeading: ToneVariants;
  congratsSub: ToneVariants;
  blueprintIntro: ToneVariants;
  truth1: ToneVariants;
  truth2: ToneVariants;
  truth3: ToneVariants;
  ctaDesc: ToneVariants;
}> = {
  pt: {
    congratsHeading: {
      gentle: 'Você Chegou Até Aqui. Com Carinho.',
      challenger: 'Você Não Desistiu. Agora Aja Como Quem Sabe Disso.',
      strategic: 'Ciclo Completo. Método Validado.',
      inspirational: 'Você Rendeu. Você Renasceu.'
    },
    congratsSub: {
      gentle: 'No seu tempo, você mostrou que sua voz merece espaço.',
      challenger: 'Você provou, na prática, que consegue, pare de duvidar disso.',
      strategic: 'Resultado consolidado: 30 dias de consistência comprovam que o método funciona.',
      inspirational: 'Você provou que sua voz tem valor de ser mostrada.'
    },
    blueprintIntro: {
      gentle: 'Leve estas 3 verdades com você, com gentileza:',
      challenger: 'Grave isso: 3 verdades que você não tem mais desculpa pra esquecer:',
      strategic: 'Consolide estes 3 princípios como parte do seu método:',
      inspirational: 'Daqui para frente, lembre-se destas 3 verdades:'
    },
    truth1: {
      gentle: 'A câmera não julga, ela só reflete a coragem que você já teve de aparecer.',
      challenger: 'A câmera não julga ninguém. Quem julga é a sua própria desculpa de sempre.',
      strategic: 'A câmera é apenas um canal de distribuição; o julgamento nunca esteve nela.',
      inspirational: 'A câmera não julga; ela serve de ponte para quem precisa ouvir você.'
    },
    truth2: {
      gentle: 'Imperfeição gera conexão, pode continuar sendo real, isso já é suficiente.',
      challenger: 'Perfeição afasta. Se você continuar buscando perfeito, vai continuar sozinha na tentativa.',
      strategic: 'Dado validado: conteúdo imperfeito converte mais que conteúdo polido. Use isso.',
      inspirational: 'A imperfeição gera conexão. A perfeição gera distanciamento.'
    },
    truth3: {
      gentle: 'Continue no seu ritmo, com verdade, as pessoas certas vão te encontrar.',
      challenger: 'Consistência não é opcional daqui pra frente. Sem ela, tudo que você construiu esfria.',
      strategic: 'Consistência com sua mensagem é a variável que mais impacta quem sua marca atrai.',
      inspirational: 'Seja consistente com sua verdade, e sua marca atrairá os aliados certos.'
    },
    ctaDesc: {
      gentle: 'Se fizer sentido pra você, existe um espaço pra continuar essa jornada com mais apoio, no seu tempo.',
      challenger: 'Você já provou que consegue. Agora é hora de parar de fazer isso sozinha e escalar de verdade.',
      strategic: 'Próximo passo lógico: otimizar seu posicionamento com apoio direto, agora que o hábito está validado.',
      inspirational: 'Agora que você quebrou o medo de gravar, faça parte do nosso ecossistema exclusivo de criadores de alto impacto pessoal.'
    }
  },
  en: {
    congratsHeading: {
      gentle: 'You Made It Here. With Tenderness.',
      challenger: "You Didn't Quit. Now Act Like You Know It.",
      strategic: 'Cycle Complete. Method Validated.',
      inspirational: 'You Showed Up. You Reborn.'
    },
    congratsSub: {
      gentle: 'At your own pace, you showed your voice deserves space.',
      challenger: "You proved, in practice, that you can, stop doubting it.",
      strategic: 'Consolidated result: 30 days of consistency prove the method works.',
      inspirational: 'You proved that your voice has immense value to be shared.'
    },
    blueprintIntro: {
      gentle: 'Carry these 3 truths with you, gently:',
      challenger: "Lock this in: 3 truths you no longer have an excuse to forget:",
      strategic: 'Consolidate these 3 principles as part of your method:',
      inspirational: 'From this day forward, stand firm in these 3 truths:'
    },
    truth1: {
      gentle: 'The camera does not judge, it only reflects the courage you already had to show up.',
      challenger: "The camera judges no one. What judges is your own usual excuse.",
      strategic: 'The camera is just a distribution channel; judgment was never in it.',
      inspirational: 'The camera does not judge; it is a portal to those who need to learn from you.'
    },
    truth2: {
      gentle: 'Imperfection creates connection, you can keep being real, that is already enough.',
      challenger: "Perfection repels. If you keep chasing perfect, you'll keep trying alone.",
      strategic: 'Validated data: imperfect content converts more than polished content. Use that.',
      inspirational: 'Perfection repels. Vulnerability attracts and establishes real devotion.'
    },
    truth3: {
      gentle: 'Keep going at your own pace, with truth, the right people will find you.',
      challenger: "Consistency isn't optional from here on. Without it, everything you built goes cold.",
      strategic: 'Consistency with your message is the variable that most impacts who your brand attracts.',
      inspirational: 'Be consistent with your message, and your community will naturally rally.'
    },
    ctaDesc: {
      gentle: "If it feels right to you, there's a space to continue this journey with more support, at your own pace.",
      challenger: "You've already proven you can. Now it's time to stop doing this alone and actually scale.",
      strategic: 'Logical next step: optimize your positioning with direct support, now that the habit is validated.',
      inspirational: 'Now that you have conquered camera hesitation, secure your place in our private circle of personal branding pioneers.'
    }
  },
  es: {
    congratsHeading: {
      gentle: 'Llegaste Hasta Aquí. Con Cariño.',
      challenger: 'No Te Rendiste. Ahora Actúa Como Quien Lo Sabe.',
      strategic: 'Ciclo Completo. Método Validado.',
      inspirational: 'Te Mostraste. Renaciste.'
    },
    congratsSub: {
      gentle: 'A tu ritmo, demostraste que tu voz merece espacio.',
      challenger: 'Demostraste, en la práctica, que puedes, deja de dudarlo.',
      strategic: 'Resultado consolidado: 30 días de consistencia demuestran que el método funciona.',
      inspirational: 'Has demostrado que tu voz tiene un gran valor para ser compartida.'
    },
    blueprintIntro: {
      gentle: 'Lleva contigo estas 3 verdades, con delicadeza:',
      challenger: 'Graba esto: 3 verdades que ya no tienes excusa para olvidar:',
      strategic: 'Consolida estos 3 principios como parte de tu método:',
      inspirational: 'A partir de hoy, recuerda estas 3 verdades esenciales:'
    },
    truth1: {
      gentle: 'La cámara no juzga, solo refleja el coraje que ya tuviste para aparecer.',
      challenger: 'La cámara no juzga a nadie. Quien juzga es tu propia excusa de siempre.',
      strategic: 'La cámara es solo un canal de distribución; el juicio nunca estuvo en ella.',
      inspirational: 'La cámara no juzga; es un puente para quienes necesitan escucharte.'
    },
    truth2: {
      gentle: 'La imperfección conecta, puedes seguir siendo real, eso ya es suficiente.',
      challenger: 'La perfección aleja. Si sigues buscando lo perfecto, seguirás intentándolo sola.',
      strategic: 'Dato validado: el contenido imperfecto convierte más que el contenido pulido. Úsalo.',
      inspirational: 'La imperfección conecta de verdad. La perfección crea distancia.'
    },
    truth3: {
      gentle: 'Sigue a tu ritmo, con verdad, las personas correctas te van a encontrar.',
      challenger: 'La consistencia ya no es opcional de aquí en adelante. Sin ella, todo lo que construiste se enfría.',
      strategic: 'La consistencia con tu mensaje es la variable que más impacta a quién atrae tu marca.',
      inspirational: 'Sé fiel a tu propia verdad, y tu marca atraerá a las personas correctas.'
    },
    ctaDesc: {
      gentle: 'Si tiene sentido para ti, hay un espacio para continuar este viaje con más apoyo, a tu ritmo.',
      challenger: 'Ya demostraste que puedes. Ahora es hora de dejar de hacerlo sola y escalar de verdad.',
      strategic: 'Siguiente paso lógico: optimizar tu posicionamiento con apoyo directo, ahora que el hábito está validado.',
      inspirational: 'Ahora que has vencido el miedo a las cámaras, únete a nuestra exclusiva red de creadores de marcas de alto impacto.'
    }
  }
};

export default function NextLevelView({ progress, lang, isProfessionalUnlocked, isAdminUnlocked, onGoToDestrave, onGoToLibrary, onGoToCommunity }: NextLevelViewProps) {
  const [practiceWeekPreview, setPracticeWeekPreview] = useState<number | null>(null);
  const practiceWeekIndex = practiceWeekPreview ?? getCurrentPracticeWeekIndex(progress);
  const practiceWeek = PRACTICE_WEEKS[practiceWeekIndex];
  const guideStyle = resolveGuideStyle(progress.guideStyle);

  const textDict = {
    pt: {
      certificateTitle: 'Certificado de Autenticidade Digital',
      certificateDesc: 'Este documento celebra a transição emocional de esconder-se à visibilidade intencional, construindo 30 dias de presença inabalável.',
      statMissions: 'Missões Cumpridas',
      statStreaks: 'Melhor Sequência',
      statHooks: 'Ganchos Salvos',
      blueprintTitle: 'Sua Nova Identidade de Marca',
      ctaHeading: 'O Próximo Nível: Destrave',
      ctaDescReal: 'Você já aprendeu a aparecer. O Destrave é pra quem quer o próximo passo: transformar quem já te segue em cliente pagante, com mensagem estruturada pra vender. Pensado pra mentoras, coaches e terapeutas que já têm o que oferecer.',
      ctaBtnReal: 'Falar sobre o Destrave',
      ctaBtnUnlocked: 'Ir pra Destrave'
    },
    en: {
      certificateTitle: 'Digital Authenticity Certification',
      certificateDesc: 'This milestone celebrates your emotional transition from hiding to intentional visibility, establishing 30 days of unshakeable presence.',
      statMissions: 'Missions Completed',
      statStreaks: 'Peak Consistency',
      statHooks: 'Saved Hooks',
      blueprintTitle: 'Your New Brand Identity Blueprint',
      ctaHeading: 'The Next Level: Destrave',
      ctaDescReal: "You've already learned to show up. Destrave is the next step: turning your followers into paying clients, with a message structured to sell. Built for mentors, coaches, and therapists who already have something to offer.",
      ctaBtnReal: 'Talk about Destrave',
      ctaBtnUnlocked: 'Go to Destrave'
    },
    es: {
      certificateTitle: 'Certificado de Autenticidad Digital',
      certificateDesc: 'Este logro celebra tu transición emocional de ocultarte a la visibilidad intencional, construyendo 30 días de presencia inquebrantable.',
      statMissions: 'Misiones Cumplidas',
      statStreaks: 'Mejor Consistencia',
      statHooks: 'Ganchos Guardados',
      blueprintTitle: 'El Plan de tu Nueva Identidad',
      ctaHeading: 'El Siguiente Nivel: Destrave',
      ctaDescReal: 'Ya aprendiste a aparecer. Destrave es el siguiente paso: convertir a quien ya te sigue en cliente que paga, con un mensaje estructurado para vender. Pensado para mentoras, coaches y terapeutas que ya tienen algo que ofrecer.',
      ctaBtnReal: 'Hablar sobre Destrave',
      ctaBtnUnlocked: 'Ir a Destrave'
    }
  }[lang];

  const tone = GRADUATION_TONE[lang];
  const congratsHeading = tone.congratsHeading[guideStyle];
  const congratsSub = tone.congratsSub[guideStyle];
  const blueprintIntro = tone.blueprintIntro[guideStyle];
  const truth1 = tone.truth1[guideStyle];
  const truth2 = tone.truth2[guideStyle];
  const truth3 = tone.truth3[guideStyle];

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

        <EditableText
          contentKey="nextLevel.congratsHeading"
          fallback={congratsHeading}
          as="h1"
          className="text-4xl sm:text-5xl font-display font-light tracking-tight text-slate-900 dark:text-white leading-tight"
        />
        <EditableText
          contentKey="nextLevel.congratsSub"
          fallback={congratsSub}
          as="p"
          className="text-sm sm:text-md text-slate-500 dark:text-ink-muted max-w-lg mx-auto font-sans"
        />

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
            <EditableText
              contentKey="nextLevel.certificateTitle"
              fallback={textDict.certificateTitle}
              as="h3"
              className="text-lg sm:text-xl font-display tracking-widest text-accentgold font-bold uppercase"
            />
            <EditableText
              contentKey="nextLevel.certificateDesc"
              fallback={textDict.certificateDesc}
              as="p"
              className="text-rose-100/70 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed font-sans"
            />
          </div>

          {/* User Achievement Stats inside Certificate */}
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto pt-4 border-t border-rose-100/10">
            <div className="text-center">
              <span className="block text-xl sm:text-2xl font-bold text-white font-mono">
                {progress.completionHistory.length}/30
              </span>
              <EditableText
                contentKey="nextLevel.statMissions"
                fallback={textDict.statMissions}
                as="span"
                className="text-[10px] text-rose-200/50 font-sans uppercase font-bold tracking-wider"
              />
            </div>

            <div className="text-center border-x border-rose-100/10">
              <span className="block text-xl sm:text-2xl font-bold text-accentgold font-mono">
                {progress.longestStreak}
              </span>
              <EditableText
                contentKey="nextLevel.statStreaks"
                fallback={textDict.statStreaks}
                as="span"
                className="text-[10px] text-rose-200/50 font-sans uppercase font-bold tracking-wider"
              />
            </div>

            <div className="text-center">
              <span className="block text-xl sm:text-2xl font-bold text-white font-mono">
                {progress.favoriteHooks.length}
              </span>
              <EditableText
                contentKey="nextLevel.statHooks"
                fallback={textDict.statHooks}
                as="span"
                className="text-[10px] text-rose-200/50 font-sans uppercase font-bold tracking-wider"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* 3. Blueprint & Core Truths */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        
        <div className="space-y-4">
          <EditableText
            contentKey="nextLevel.coreIntegrationLabel"
            fallback="RenaSer Core Integration"
            as="span"
            className="text-[10px] uppercase font-sans tracking-widest text-rosegold font-bold block"
          />
          <EditableText
            contentKey="nextLevel.blueprintTitle"
            fallback={textDict.blueprintTitle}
            as="h3"
            className="text-xl font-display text-slate-800 dark:text-white"
          />
          <EditableText
            contentKey="nextLevel.blueprintIntro"
            fallback={blueprintIntro}
            as="p"
            className="text-xs sm:text-sm text-slate-500 dark:text-ink-muted leading-relaxed font-sans"
          />

          <div className="space-y-3 pt-2">
            {[truth1, truth2, truth3].map((truth, idx) => (
              <div key={idx} className="flex items-start gap-3 bg-white dark:bg-ink-raised p-4 rounded-xl border border-rose-100/20 dark:border-rosegold/10">
                <CheckCircle2 className="h-5 w-5 text-rosegold shrink-0 mt-0.5" />
                <EditableText
                  contentKey={`nextLevel.truth${idx + 1}`}
                  fallback={truth}
                  as="p"
                  className="text-slate-700 dark:text-ink-text text-xs sm:text-sm font-sans font-medium"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 4. Elite Mastermind Invitation / CTA */}
        <div className="bg-gradient-to-br from-rose-50/20 to-[#FAF8F5]/30 dark:bg-ink-raised dark:from-ink-raised dark:to-ink-raised border border-rose-100/30 dark:border-ink-hairline rounded-3xl p-8 space-y-6">
          <div className="flex items-center gap-2 text-rosegold">
            <Sparkles className="h-6 w-6 animate-pulse" />
            <EditableText
              contentKey="nextLevel.eliteInvitationLabel"
              fallback="Elite Invitation"
              as="h4"
              className="text-xs font-sans uppercase tracking-widest font-bold"
            />
          </div>

          <div className="space-y-2">
            <EditableText
              contentKey="nextLevel.ctaHeading"
              fallback={textDict.ctaHeading}
              as="h3"
              className="text-lg sm:text-xl font-display font-bold text-slate-900 dark:text-white leading-snug"
            />
            <EditableText
              contentKey="nextLevel.ctaDesc"
              fallback={textDict.ctaDescReal}
              as="p"
              className="text-slate-500 dark:text-ink-muted text-xs sm:text-sm leading-relaxed font-sans"
            />
          </div>

          {isProfessionalUnlocked ? (
            <button
              onClick={onGoToDestrave}
              className="w-full py-4 bg-rosegold hover:bg-[#A35D68] text-white rounded-xl text-xs font-sans font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-rosegold/20"
            >
              <EditableText contentKey="nextLevel.ctaBtnUnlocked" fallback={textDict.ctaBtnUnlocked} as="span" />
              <ExternalLink className="h-4 w-4" />
            </button>
          ) : (
            <a
              href={DESTRAVE_WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 bg-rosegold hover:bg-[#A35D68] text-white rounded-xl text-xs font-sans font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-rosegold/20"
            >
              <EditableText contentKey="nextLevel.ctaBtnReal" fallback={textDict.ctaBtnReal} as="span" />
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>

      </div>

      {/* 5. Fase de Prática — dias 31 a 90, sem depender de missão diária
          nova. Reaproveita o que já existe (Renata OS, Biblioteca,
          Comunidade) em vez de exigir currículo novo todo dia. */}
      <div className="bg-white dark:bg-ink-raised border border-rose-100/20 dark:border-ink-hairline rounded-3xl p-8 space-y-5">
        <div>
          <span className="text-[10px] uppercase font-sans tracking-widest text-rosegold font-bold block mb-1">
            Sua Fase de Prática
          </span>
          <h3 className="text-lg font-display text-slate-800 dark:text-white">
            Dos dias 31 a 90, você continua crescendo sem depender de mim todo dia
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={onGoToLibrary}
            className="text-left p-4 rounded-2xl bg-rose-50/40 dark:bg-ink border border-rose-100/30 dark:border-ink-hairline hover:border-rosegold/40 transition cursor-pointer"
          >
            <p className="text-xs font-sans font-bold text-slate-700 dark:text-ink-text mb-1">Renata OS + Biblioteca</p>
            <p className="text-xs text-slate-500 dark:text-ink-muted leading-relaxed">
              Prompts prontos, o framework de conteúdo que converte, e vídeo novo toda semana. Continue postando sem precisar de missão nova.
            </p>
          </button>
          <div className="text-left p-4 rounded-2xl bg-rose-50/40 dark:bg-ink border border-rose-100/30 dark:border-ink-hairline space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-sans font-bold text-rosegold uppercase tracking-wider">{practiceWeek.title}</p>
              {isAdminUnlocked && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPracticeWeekPreview(((practiceWeekIndex + 3) % 4))}
                    className="h-5 w-5 flex items-center justify-center rounded border border-rosegold/40 text-rosegold cursor-pointer hover:bg-rosegold/10"
                  >
                    <ChevronLeft className="h-3 w-3" />
                  </button>
                  <span className="text-[9px] font-mono text-rosegold">{practiceWeekIndex + 1}/4</span>
                  <button
                    onClick={() => setPracticeWeekPreview(((practiceWeekIndex + 1) % 4))}
                    className="h-5 w-5 flex items-center justify-center rounded border border-rosegold/40 text-rosegold cursor-pointer hover:bg-rosegold/10"
                  >
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-ink-muted leading-relaxed">
              {practiceWeek.challenge}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-ink-muted leading-relaxed italic">
              {practiceWeek.where}
            </p>
          </div>
          <button
            onClick={onGoToCommunity}
            className="text-left p-4 rounded-2xl bg-rose-50/40 dark:bg-ink border border-rose-100/30 dark:border-ink-hairline hover:border-rosegold/40 transition cursor-pointer"
          >
            <p className="text-xs font-sans font-bold text-slate-700 dark:text-ink-text mb-1">Comunidade</p>
            <p className="text-xs text-slate-500 dark:text-ink-muted leading-relaxed">
              Compartilha o que postou, recebe apoio real de quem tá na mesma fase que você.
            </p>
          </button>
        </div>
      </div>

    </motion.div>
  );
}
