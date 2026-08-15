/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, TrendingUp, MessageCircle, Calendar, Award, Compass, BookOpen } from 'lucide-react';
import { Language, UserProgress, ProfessionalCheckIn, ProfessionalDiagnostic } from '../types';
import { getLocalDateISO } from '../utils/date';

interface ProfessionalAreaViewProps {
  progress: UserProgress;
  lang: Language;
  onUpdateProgress: (progress: UserProgress) => void;
  onGoToLibrary: () => void;
}

const FORMATOS = ['Reels', 'Stories', 'Carrossel', 'Vídeo longo'];

// Em vez de script pronto pra copiar e colar, cada item vira um prompt que
// ela manda pro Renata OS — o objetivo é ela desenvolver a própria voz na
// conversa real, não decorar frase de outra pessoa. O prompt já entra
// preenchido com nicho/tom/gargalo do diagnóstico quando existem.
const PROMPT_LIBRARY: { title: string; momento: string; prompt: (nicho: string, tom: string) => string; resolveGargalo: string[] }[] = [
  {
    title: 'Abertura de conversa',
    momento: 'Quando alguém comenta ou curte seu conteúdo',
    prompt: (nicho, tom) =>
      `Uma pessoa comentou/curtiu meu conteúdo e eu quero puxar conversa com ela, de um jeito genuíno, não vendedor. Meu nicho é ${nicho}, meu tom de voz é ${tom}. Me ajuda a montar uma abertura curta que soe como eu de verdade, não um roteiro pronto.`,
    resolveGargalo: ['Em gerar mensagens/interesse']
  },
  {
    title: 'Entender o momento atual dela',
    momento: 'Quando a conversa já começou',
    prompt: (nicho, tom) =>
      `Já puxei conversa com uma pessoa interessada no meu conteúdo sobre ${nicho}. Agora preciso entender o momento real dela antes de oferecer qualquer coisa. Meu tom é ${tom}. Me ajuda a formular 2-3 perguntas que abrem espaço pra ela falar, sem parecer questionário.`,
    resolveGargalo: ['Em gerar mensagens/interesse', 'Em transformar mensagem em reunião']
  },
  {
    title: 'Filtro de objetivo',
    momento: 'Antes de marcar reunião',
    prompt: (nicho, tom) =>
      `Ela me contou o momento dela em relação a ${nicho}. Quero entender o que ela já tentou até agora pra resolver isso, sem soar como interrogatório, no meu tom (${tom}). Me ajuda a formular essa pergunta.`,
    resolveGargalo: ['Em transformar mensagem em reunião']
  },
  {
    title: 'Apresentar a oferta sem preço',
    momento: 'Puxando pra reunião',
    prompt: (nicho, tom) =>
      `Baseado no que ela me contou, quero apresentar que eu tenho um jeito de ajudar com isso (dentro de ${nicho}), sem falar preço ainda, e convidar pra uma conversa. Meu tom é ${tom}. Me ajuda a escrever essa mensagem.`,
    resolveGargalo: ['Em transformar mensagem em reunião']
  },
  {
    title: 'Contorno de objeção de preço',
    momento: 'Quando ela hesita no valor',
    prompt: (nicho, tom) =>
      `Ela demonstrou objeção quando eu falei de valor. Quero responder sem baixar preço nem ficar na defensiva, entendendo se é questão de prioridade ou de timing. Meu tom é ${tom}, meu nicho é ${nicho}. Me ajuda a formular essa resposta.`,
    resolveGargalo: ['Em fechar a venda na reunião']
  },
  {
    title: 'Fechamento objetivo',
    momento: 'Quando ela já decidiu',
    prompt: (nicho, tom) =>
      `Ela já decidiu que quer fechar. Quero uma mensagem de fechamento direta e objetiva, sem enrolar, no meu tom (${tom}), pra ${nicho}. Me ajuda a escrever.`,
    resolveGargalo: ['Em fechar a venda na reunião']
  }
];

const VSL_REFERENCIA: { bloco: string; ideia: string }[] = [
  { bloco: '1. Promessa', ideia: 'Uma promessa específica e cronometrada, o que ela vai sair sabendo/tendo, sem enrolar no começo.' },
  { bloco: '2. Mecanismo do problema', ideia: 'Por que ela trava hoje, de um jeito que ela reconhece na hora ("é exatamente isso que acontece comigo").' },
  { bloco: '3. Consequências', ideia: 'O que essa trava já custou de verdade, contado em primeira pessoa, com exemplo real.' },
  { bloco: '4. Pra quem é / não é', ideia: 'Filtro honesto, inclusive dizendo pra quem NÃO é, isso aumenta a confiança de quem fica.' },
  { bloco: '5. Por que o que ela já tentou não resolveu', ideia: 'Invalidar os métodos genéricos sem atacar quem os seguiu, mostrando o que falta neles.' },
  { bloco: '6. O mecanismo (seu método)', ideia: 'A ideia central que só você tem, nomeada, com lógica clara de por que funciona.' },
  { bloco: '7. Prova social', ideia: 'Um resultado real e específico, com número, não um "todo mundo adora".' },
  { bloco: '8. O que ela recebe', ideia: 'Formato claro: o que tem dentro, com que frequência, por quanto tempo.' },
  { bloco: '9. Projeção de ganho', ideia: 'Três cenários realistas (simples, comum, ótimo), não uma promessa única exagerada.' },
  { bloco: '10. Detalhe da entrega', ideia: 'Prazo, vagas, formato de acompanhamento, sem letra miúda.' },
  { bloco: '11. Custo da inação + próximo passo', ideia: 'O que ela perde ficando parada, e um único próximo passo óbvio.' }
];

// Não basta nomear o gargalo, precisa dizer o que fazer com ele e apontar
// exatamente pra onde dentro da própria área ela resolve isso.
const GARGALO_RESOLUCAO: Record<string, { oQueFazer: string; aba: 'mensagens' | 'referencia'; abaLabel: string }> = {
  'Em criar conteúdo com constância': {
    oQueFazer: 'Normalmente não é falta de ideia, é falta de um ângulo fixo pra postar sem ter que reinventar toda vez. Defina sua Big Idea primeiro, isso destrava o resto.',
    aba: 'referencia',
    abaLabel: 'Ir pra Referência'
  },
  'Em gerar mensagens/interesse': {
    oQueFazer: 'Seu conteúdo pode estar resolvendo demais no post, sem deixar ninguém curioso pra te chamar. Comece pelos prompts de Abertura de conversa.',
    aba: 'mensagens',
    abaLabel: 'Ir pra Mensagens'
  },
  'Em transformar mensagem em reunião': {
    oQueFazer: 'A conversa costuma parar no meio por falta de filtro antes da oferta. Usa os prompts de Filtro de objetivo e Oferta sem preço.',
    aba: 'mensagens',
    abaLabel: 'Ir pra Mensagens'
  },
  'Em fechar a venda na reunião': {
    oQueFazer: 'A objeção de preço trava quando falta ancoragem clara antes do valor. Usa os prompts de Contorno de objeção e Fechamento objetivo.',
    aba: 'mensagens',
    abaLabel: 'Ir pra Mensagens'
  }
};

const RENATA_OS_PROMPTS: { title: string; prompt: (nicho: string, tom: string, gargalo: string) => string }[] = [
  {
    title: 'Sua Big Idea',
    prompt: (nicho, tom) =>
      `Quero construir minha Big Idea: a frase que resume o ângulo único que só eu tenho dentro de ${nicho}. Meu tom de voz é ${tom}. Me faça perguntas, uma de cada vez, até ter contexto suficiente pra sugerir algumas opções.`
  },
  {
    title: 'Sua Oferta Irrecusável',
    prompt: (nicho, tom, gargalo) =>
      `Quero estruturar minha oferta pra ${nicho}: resultado claro que eu entrego, prazo, formato, e o que eu NÃO vou incluir pra não confundir quem recebe. Meu gargalo hoje é "${gargalo}". Me ajuda perguntando o que falta antes de montar a oferta comigo.`
  },
  {
    title: 'Sua Autoridade Percebida',
    prompt: (nicho, tom) =>
      `Me ajuda a pensar em 3 formas de mostrar autoridade percebida no meu conteúdo sobre ${nicho}, usando resultado real (mesmo que de um cliente só, mesmo pequeno) em vez de teoria. Meu tom é ${tom}.`
  },
  {
    title: '1. Preencher o mapa da sua VSL',
    prompt: (nicho, tom) =>
      `Quero estruturar minha promessa/conteúdo seguindo esse mapa: promessa, por que eu travo, o que isso já me custou, pra quem é e pra quem não é, por que o que já tentei não resolveu, meu mecanismo, uma prova real que eu já tenho, o que a pessoa recebe, e o próximo passo. Meu nicho é ${nicho}, meu tom é ${tom}. Me faça uma pergunta de cada vez pra preencher isso comigo.`
  },
  {
    title: '2. Sua VSL final pronta',
    prompt: (nicho, tom) =>
      `Agora pega todas as respostas que acabei de te dar sobre minha promessa, meu problema, pra quem é, meu mecanismo, prova real, o que entrego e o próximo passo, coloca elas em ordem, e me entrega a VSL pronta: roteiro completo, no máximo 1200 palavras, pra caber num vídeo falado de até 11 minutos. A abertura e o fechamento devem seguir o mesmo espírito da VSL original da Renata que você tem como referência, adaptados à minha voz (${tom}) e ao meu nicho (${nicho}), nunca copiados literalmente. Não invente prova social, só usa o que eu te contei.`
  }
];

// Perguntas de múltipla escolha, não texto livre — ela reconhece a opção
// mais parecida com ela em vez de precisar descrever do zero.
const VOZ_PERGUNTAS: { key: string; label: string; options: string[] }[] = [
  {
    key: 'tom',
    label: 'Qual desses estilos mais parece com você quando explica algo pra alguém?',
    options: ['Direta e prática', 'Acolhedora e emocional', 'Técnica e detalhista', 'Bem-humorada e leve']
  },
  {
    key: 'estilo_evitar',
    label: 'O que você mais precisa cortar pra soar menos "aula" e mais conversa?',
    options: ['Explicações longas antes de ir ao ponto', 'Termos técnicos que só quem já estudou entende', 'Frases genéricas de motivação', 'Nada, já falo de forma direta']
  }
];

const ESTRUTURA_PERGUNTAS: { key: string; label: string; options: string[] }[] = [
  {
    key: 'formato_hoje',
    label: 'Hoje, quando você posta, você...',
    options: ['Entrego o passo a passo completo', 'Mostro o resultado e guardo o "como"', 'Não tenho um padrão definido']
  },
  {
    key: 'gargalo',
    label: 'Onde mais trava hoje?',
    options: ['Em criar conteúdo com constância', 'Em gerar mensagens/interesse', 'Em transformar mensagem em reunião', 'Em fechar a venda na reunião']
  },
  {
    key: 'frequencia',
    label: 'Quantas vezes por semana você realmente posta (não a ideal)?',
    options: ['Quase todo dia', '2 a 3 vezes', '1 vez ou menos']
  }
];

const REFERENCE_CONTENT: { title: string; points: string[] }[] = [
  {
    title: 'Big Idea',
    points: [
      'É a ideia central que resume, numa frase, o que te diferencia de qualquer outra pessoa no seu nicho.',
      'Não é o que você faz, é o ângulo pelo qual você faz. Duas profissionais do mesmo nicho podem ter Big Ideas completamente diferentes.',
      'Teste rápido: se alguém só ouvir sua Big Idea, precisa entender na hora por que te procurar e não outra pessoa.'
    ]
  },
  {
    title: 'Oferta Irrecusável',
    points: [
      'Uma oferta forte não é sobre baixar preço, é sobre deixar o "sim" óbvio: resultado claro, prazo claro, formato claro.',
      'Quem recebe a oferta precisa entender em segundos o que ganha, sem precisar perguntar "e o que tá incluso mesmo?".',
      'Evite empilhar bônus genéricos pra parecer mais valioso, isso confunde mais do que convence.'
    ]
  },
  {
    title: 'Autoridade Percebida',
    points: [
      'Autoridade percebida não é o mesmo que autoridade real: é o que a pessoa do outro lado enxerga em poucos segundos de conteúdo.',
      'Se constrói com posicionamento específico, não com "eu sei fazer de tudo". Quanto mais específica a fala, mais autoridade ela carrega.',
      'Mostrar resultado (mesmo que de um cliente só, mesmo pequeno) constrói mais autoridade do que explicar teoria.'
    ]
  }
];

export default function ProfessionalAreaView({ progress, lang, onUpdateProgress, onGoToLibrary }: ProfessionalAreaViewProps) {
  const today = getLocalDateISO();
  const checkIns = progress.professionalCheckIns || {};
  const todayCheckIn = checkIns[today];

  const [postou, setPostou] = useState(todayCheckIn?.postou ?? false);
  const [formatosPostados, setFormatosPostados] = useState<string[]>(todayCheckIn?.formatosPostados ?? []);
  const [linksConteudo, setLinksConteudo] = useState<string[]>(
    todayCheckIn?.linksConteudo?.length ? todayCheckIn.linksConteudo : ['']
  );
  const [mensagensRecebidas, setMensagensRecebidas] = useState(String(todayCheckIn?.mensagensRecebidas ?? ''));
  const [reunioesAgendadas, setReunioesAgendadas] = useState(String(todayCheckIn?.reunioesAgendadas ?? ''));
  const [vendasFechadas, setVendasFechadas] = useState(String(todayCheckIn?.vendasFechadas ?? ''));
  const [nota, setNota] = useState(todayCheckIn?.nota ?? '');
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState<'checkin' | 'dashboard' | 'mensagens' | 'diagnostico' | 'referencia'>('checkin');

  const diagnostic = progress.professionalDiagnostic;
  const [nicho, setNicho] = useState(diagnostic?.nicho ?? '');
  const [vozRespostas, setVozRespostas] = useState<Record<string, string>>(diagnostic?.vozRespostas ?? {});
  const [estruturaRespostas, setEstruturaRespostas] = useState<Record<string, string>>(diagnostic?.estruturaRespostas ?? {});
  const [diagnosticSaved, setDiagnosticSaved] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);

  const copyPrompt = (title: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(title);
    setTimeout(() => setCopiedPrompt(null), 2000);
  };

  const toggleFormato = (f: string) => {
    setFormatosPostados((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));
  };

  const updateLinkConteudo = (index: number, value: string) => {
    setLinksConteudo((prev) => prev.map((l, i) => (i === index ? value : l)));
  };

  const addLinkConteudo = () => {
    setLinksConteudo((prev) => [...prev, '']);
  };

  const handleSaveCheckIn = () => {
    const checkIn: ProfessionalCheckIn = {
      postou,
      formatosPostados,
      linksConteudo: postou ? linksConteudo.map((l) => l.trim()).filter(Boolean) : undefined,
      mensagensRecebidas: Number(mensagensRecebidas) || 0,
      reunioesAgendadas: Number(reunioesAgendadas) || 0,
      vendasFechadas: Number(vendasFechadas) || 0,
      nota: nota.trim() || undefined
    };
    onUpdateProgress({
      ...progress,
      professionalCheckIns: { ...checkIns, [today]: checkIn }
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleSaveDiagnostic = () => {
    const newDiagnostic: ProfessionalDiagnostic = {
      nicho: nicho.trim() || undefined,
      vozRespostas,
      estruturaRespostas,
      completedAt: today
    };
    onUpdateProgress({
      ...progress,
      professionalDiagnostic: newDiagnostic
    });
    setDiagnosticSaved(true);
    setTimeout(() => setDiagnosticSaved(false), 2500);
  };

  // Dashboard: sempre calculado a partir dos check-ins salvos, nunca digitado.
  const stats = useMemo(() => {
    const entries = Object.entries(checkIns);
    const last30 = entries.filter(([date]) => {
      const d = new Date(date);
      const diffDays = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays <= 30;
    });
    const totals = last30.reduce(
      (acc, [, c]) => {
        acc.posts += c.postou ? 1 : 0;
        acc.mensagens += c.mensagensRecebidas || 0;
        acc.reunioes += c.reunioesAgendadas || 0;
        acc.vendas += c.vendasFechadas || 0;
        return acc;
      },
      { posts: 0, mensagens: 0, reunioes: 0, vendas: 0 }
    );
    const pct = (num: number, den: number) => (den > 0 ? Math.round((num / den) * 100) : 0);
    return {
      ...totals,
      taxaConteudoMensagem: pct(totals.mensagens, totals.posts),
      taxaMensagemReuniao: pct(totals.reunioes, totals.mensagens),
      taxaReuniaoVenda: pct(totals.vendas, totals.reunioes),
      diasComCheckin: last30.length
    };
  }, [checkIns]);

  const gargaloAtual = diagnostic?.estruturaRespostas?.gargalo;
  const nichoAtual = diagnostic?.nicho || '[seu nicho]';
  const tomAtual = diagnostic?.vozRespostas?.tom || '[seu tom de voz]';

  // Prompts que resolvem o gargalo declarado no diagnóstico vêm primeiro,
  // marcados como recomendados — o resto continua disponível embaixo.
  const orderedPrompts = useMemo(() => {
    const withText = PROMPT_LIBRARY.map((m) => ({
      ...m,
      text: m.prompt(nichoAtual, tomAtual),
      recomendado: gargaloAtual ? m.resolveGargalo.includes(gargaloAtual) : false
    }));
    return withText.sort((a, b) => Number(b.recomendado) - Number(a.recomendado));
  }, [gargaloAtual, nichoAtual, tomAtual]);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center space-y-2">
        <p className="text-[11px] font-sans tracking-[0.2em] text-rosegold uppercase font-bold">
          Área da Profissional
        </p>
        <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-slate-800 dark:text-ink-text">
          Destrave
        </h1>
        <p className="text-sm text-slate-500 dark:text-ink-muted max-w-md mx-auto">
          Conteúdo estratégico que converte quem já te segue em cliente. Sem enrolação, sem aula, direto ao ponto.
        </p>
      </div>

      <div className="flex items-center justify-center gap-2 flex-wrap">
        {([
          { id: 'checkin', label: 'Check-in do Dia', icon: CheckCircle2 },
          { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
          { id: 'mensagens', label: 'Mensagens', icon: MessageCircle },
          { id: 'diagnostico', label: 'Diagnóstico', icon: Compass },
          { id: 'referencia', label: 'Referência', icon: BookOpen }
        ] as const).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition cursor-pointer ${
              activeSection === id
                ? 'bg-rosegold text-white shadow-sm shadow-rosegold/25 dark:bg-transparent dark:border dark:border-rosegold-light dark:text-rosegold-light'
                : 'text-slate-500 dark:text-ink-muted hover:bg-rose-50/50 dark:hover:bg-rosegold-light/10'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {activeSection === 'diagnostico' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2rem] bg-white dark:bg-ink-raised border border-rose-100/20 dark:border-ink-hairline p-6 sm:p-8 shadow-rosegold dark:shadow-none space-y-6"
        >
          <div>
            <p className="text-[11px] font-sans font-bold text-rosegold uppercase tracking-wider mb-1">Nicho</p>
            <p className="text-xs text-slate-500 dark:text-ink-muted mb-2">Pra quem é o seu conteúdo hoje?</p>
            <input
              type="text"
              value={nicho}
              onChange={(e) => setNicho(e.target.value)}
              placeholder="Ex: terapeutas iniciantes, coaches de carreira..."
              className="w-full text-sm bg-rose-50/40 dark:bg-ink border border-rose-100/20 dark:border-ink-hairline rounded-xl p-3 text-slate-700 dark:text-ink-text focus:outline-none focus:border-rosegold"
            />
          </div>

          <div>
            <p className="text-[11px] font-sans font-bold text-rosegold uppercase tracking-wider mb-3">Voz</p>
            <div className="space-y-4">
              {VOZ_PERGUNTAS.map((p) => (
                <div key={p.key}>
                  <label className="text-xs text-slate-500 dark:text-ink-muted block mb-2">{p.label}</label>
                  <div className="flex flex-wrap gap-2">
                    {p.options.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setVozRespostas((prev) => ({ ...prev, [p.key]: opt }))}
                        className={`px-3 py-1.5 rounded-full text-xs font-sans font-semibold transition cursor-pointer ${
                          vozRespostas[p.key] === opt
                            ? 'bg-rosegold/15 text-rosegold dark:text-rosegold-light border border-rosegold/40'
                            : 'bg-rose-50/40 dark:bg-ink text-slate-500 dark:text-ink-muted border border-transparent'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-sans font-bold text-rosegold uppercase tracking-wider mb-3">Estrutura</p>
            <div className="space-y-4">
              {ESTRUTURA_PERGUNTAS.map((p) => (
                <div key={p.key}>
                  <label className="text-xs text-slate-500 dark:text-ink-muted block mb-2">{p.label}</label>
                  <div className="flex flex-wrap gap-2">
                    {p.options.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setEstruturaRespostas((prev) => ({ ...prev, [p.key]: opt }))}
                        className={`px-3 py-1.5 rounded-full text-xs font-sans font-semibold transition cursor-pointer ${
                          estruturaRespostas[p.key] === opt
                            ? 'bg-rosegold/15 text-rosegold dark:text-rosegold-light border border-rosegold/40'
                            : 'bg-rose-50/40 dark:bg-ink text-slate-500 dark:text-ink-muted border border-transparent'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleSaveDiagnostic}
            className="w-full py-3 rounded-xl bg-rosegold hover:bg-[#A35D68] text-white text-sm font-sans font-bold uppercase tracking-wider transition cursor-pointer"
          >
            {diagnosticSaved ? 'Salvo ✓' : diagnostic?.completedAt ? 'Atualizar diagnóstico' : 'Salvar diagnóstico'}
          </button>
        </motion.div>
      )}

      {activeSection === 'referencia' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <p className="text-center text-xs font-sans text-slate-400 dark:text-ink-muted mb-2">
            Base do Escala Descomplicada, direto ao ponto.
          </p>
          {gargaloAtual === 'Em criar conteúdo com constância' && (
            <p className="text-center text-xs font-sans text-rosegold/80 dark:text-rosegold-light/80 mb-2">
              Seu diagnóstico aponta esse como seu gargalo, Big Idea e Autoridade Percebida ajudam mais direto aqui.
            </p>
          )}
          {REFERENCE_CONTENT.map((ref) => (
            <div
              key={ref.title}
              className="rounded-2xl bg-white dark:bg-ink-raised border border-rose-100/20 dark:border-ink-hairline p-5 space-y-2"
            >
              <p className="text-sm font-serif font-semibold text-slate-800 dark:text-ink-text">{ref.title}</p>
              <ul className="space-y-1.5">
                {ref.points.map((point, i) => (
                  <li key={i} className="text-sm text-slate-600 dark:text-ink-muted leading-relaxed flex gap-2">
                    <span className="text-rosegold mt-1">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="rounded-2xl bg-white dark:bg-ink-raised border border-rose-100/20 dark:border-ink-hairline p-5 space-y-3 mt-4">
            <div>
              <p className="text-sm font-serif font-semibold text-slate-800 dark:text-ink-text">O que é VSL, e como a Renata estruturou a dela</p>
              <p className="text-xs text-slate-500 dark:text-ink-muted mt-1 leading-relaxed">
                VSL é "Video Sales Letter", um vídeo estruturado pra apresentar um problema, mostrar por que ele acontece, e convidar pra próxima conversa, tudo numa sequência lógica. Você não precisa ter um produto pronto nem página de vendas ativa pra usar essa lógica: ela serve pra QUALQUER conteúdo onde você quer que a pessoa entenda seu problema e sinta que você é quem resolve, mesmo um Reels de 60 segundos ou uma sequência de Stories. É por isso que esse mapa importa mesmo antes de você vender qualquer coisa: ele te dá clareza do que você oferece, hoje, com o que você já tem.
              </p>
              <p className="text-xs text-slate-500 dark:text-ink-muted mt-2">
                Esse é o mapa real usado pra estruturar a VSL do Destrave. Não é pra copiar frase por frase, é pra usar como esqueleto e preencher com a sua história.
              </p>
            </div>
            <ul className="space-y-2">
              {VSL_REFERENCIA.map((v) => (
                <li key={v.bloco}>
                  <p className="text-xs font-sans font-bold text-slate-700 dark:text-ink-text">{v.bloco}</p>
                  <p className="text-xs text-slate-500 dark:text-ink-muted leading-relaxed">{v.ideia}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3 mt-4">
            <p className="text-center text-xs font-sans text-slate-400 dark:text-ink-muted">
              Perguntas exatas pra mandar pro Renata OS e preencher isso com as suas informações.
            </p>
            {RENATA_OS_PROMPTS.map((p) => {
              const text = p.prompt(nichoAtual, tomAtual, gargaloAtual || '[seu gargalo]');
              return (
                <div
                  key={p.title}
                  className="rounded-2xl bg-white dark:bg-ink-raised border border-rose-100/20 dark:border-ink-hairline p-4 space-y-2"
                >
                  <p className="text-[11px] font-sans font-bold text-rosegold uppercase tracking-wider">{p.title}</p>
                  <p className="text-sm text-slate-700 dark:text-ink-text leading-relaxed bg-rose-50/40 dark:bg-ink rounded-xl p-3">{text}</p>
                  <button
                    onClick={() => copyPrompt(p.title, text)}
                    className="text-xs font-sans font-semibold text-rosegold dark:text-rosegold-light hover:underline cursor-pointer"
                  >
                    {copiedPrompt === p.title ? 'Copiado ✓' : 'Copiar prompt'}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="rounded-2xl bg-rosegold/5 dark:bg-rosegold-light/5 border border-rosegold/20 p-5 space-y-2 mt-4">
            <p className="text-sm font-serif font-semibold text-slate-800 dark:text-ink-text">Pra praticar e achar sua voz</p>
            <p className="text-xs text-slate-500 dark:text-ink-muted leading-relaxed">
              Você encontra a instrução pra execução exata de tudo que você precisa pra gerar conteúdo autêntico e que vende. Confere a biblioteca de prompts, e a referência de pra que cada um serve.
            </p>
            <button
              onClick={onGoToLibrary}
              className="text-xs font-sans font-bold text-rosegold dark:text-rosegold-light hover:underline cursor-pointer"
            >
              Ver na Biblioteca (PDFs) →
            </button>
          </div>
        </motion.div>
      )}

      {activeSection === 'checkin' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2rem] bg-white dark:bg-ink-raised border border-rose-100/20 dark:border-ink-hairline p-6 sm:p-8 shadow-rosegold dark:shadow-none space-y-5"
        >
          <div className="flex items-center gap-2 text-xs font-sans text-slate-400 dark:text-ink-muted">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(today + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </div>

          <div>
            <p className="text-sm font-sans font-semibold text-slate-700 dark:text-ink-text mb-2">Postou conteúdo hoje?</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPostou(true)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-sans font-bold transition cursor-pointer ${
                  postou ? 'bg-rosegold text-white' : 'bg-rose-50/50 dark:bg-ink text-slate-500 dark:text-ink-muted'
                }`}
              >
                Sim
              </button>
              <button
                onClick={() => setPostou(false)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-sans font-bold transition cursor-pointer ${
                  !postou ? 'bg-slate-700 text-white' : 'bg-rose-50/50 dark:bg-ink text-slate-500 dark:text-ink-muted'
                }`}
              >
                Não
              </button>
            </div>
          </div>

          {postou && (
            <div>
              <p className="text-xs font-sans text-slate-500 dark:text-ink-muted mb-2">Em quais formatos?</p>
              <div className="flex flex-wrap gap-2">
                {FORMATOS.map((f) => (
                  <button
                    key={f}
                    onClick={() => toggleFormato(f)}
                    className={`px-3 py-1.5 rounded-full text-xs font-sans font-semibold transition cursor-pointer ${
                      formatosPostados.includes(f)
                        ? 'bg-rosegold/15 text-rosegold dark:text-rosegold-light border border-rosegold/40'
                        : 'bg-rose-50/40 dark:bg-ink text-slate-500 dark:text-ink-muted border border-transparent'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <div className="mt-3">
                <label className="text-[11px] font-sans text-slate-500 dark:text-ink-muted block mb-1">Link do conteúdo</label>
                <div className="space-y-2">
                  {linksConteudo.map((link, i) => (
                    <input
                      key={i}
                      type="url"
                      value={link}
                      onChange={(e) => updateLinkConteudo(i, e.target.value)}
                      placeholder="Cole aqui o link do que você postou hoje"
                      className="w-full text-sm bg-rose-50/40 dark:bg-ink border border-rose-100/20 dark:border-ink-hairline rounded-xl p-3 text-slate-700 dark:text-ink-text focus:outline-none focus:border-rosegold"
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addLinkConteudo}
                  className="mt-2 text-xs font-sans font-semibold text-rosegold dark:text-rosegold-light hover:underline cursor-pointer"
                >
                  + adicionar outro link
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-sans text-slate-500 dark:text-ink-muted block mb-1">Mensagens Recebidas</label>
              <input
                type="number"
                min="0"
                value={mensagensRecebidas}
                onChange={(e) => setMensagensRecebidas(e.target.value)}
                className="w-full text-center text-lg font-sans font-bold bg-rose-50/40 dark:bg-ink border border-rose-100/20 dark:border-ink-hairline rounded-xl py-2 text-slate-700 dark:text-ink-text focus:outline-none focus:border-rosegold"
              />
            </div>
            <div>
              <label className="text-[11px] font-sans text-slate-500 dark:text-ink-muted block mb-1">Reuniões Agendadas</label>
              <input
                type="number"
                min="0"
                value={reunioesAgendadas}
                onChange={(e) => setReunioesAgendadas(e.target.value)}
                className="w-full text-center text-lg font-sans font-bold bg-rose-50/40 dark:bg-ink border border-rose-100/20 dark:border-ink-hairline rounded-xl py-2 text-slate-700 dark:text-ink-text focus:outline-none focus:border-rosegold"
              />
            </div>
            <div>
              <label className="text-[11px] font-sans text-slate-500 dark:text-ink-muted block mb-1">Vendas Geradas</label>
              <input
                type="number"
                min="0"
                value={vendasFechadas}
                onChange={(e) => setVendasFechadas(e.target.value)}
                className="w-full text-center text-lg font-sans font-bold bg-rose-50/40 dark:bg-ink border border-rose-100/20 dark:border-ink-hairline rounded-xl py-2 text-slate-700 dark:text-ink-text focus:outline-none focus:border-rosegold"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-sans text-slate-500 dark:text-ink-muted block mb-1.5">O que funcionou ou travou hoje?</label>
            <textarea
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              rows={2}
              placeholder="Opcional, uma frase já ajuda..."
              className="w-full text-sm bg-rose-50/40 dark:bg-ink border border-rose-100/20 dark:border-ink-hairline rounded-xl p-3 text-slate-700 dark:text-ink-text focus:outline-none focus:border-rosegold resize-none"
            />
          </div>

          <button
            onClick={handleSaveCheckIn}
            className="w-full py-3 rounded-xl bg-rosegold hover:bg-[#A35D68] text-white text-sm font-sans font-bold uppercase tracking-wider transition cursor-pointer"
          >
            {saved ? 'Salvo ✓' : 'Salvar check-in de hoje'}
          </button>
        </motion.div>
      )}

      {activeSection === 'dashboard' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {diagnostic?.completedAt && (
            <div className="rounded-2xl bg-rosegold/5 dark:bg-rosegold-light/5 border border-rosegold/20 p-4 space-y-2">
              <p className="text-[10px] font-sans font-bold text-rosegold uppercase tracking-wider">Seu posicionamento</p>
              <p className="text-xs text-slate-600 dark:text-ink-muted leading-relaxed">
                {diagnostic.nicho && <>Nicho: <span className="font-semibold text-slate-800 dark:text-ink-text">{diagnostic.nicho}</span>. </>}
                {diagnostic.vozRespostas?.tom && <>Voz: <span className="font-semibold text-slate-800 dark:text-ink-text">{diagnostic.vozRespostas.tom}</span>. </>}
                {gargaloAtual && <>Gargalo atual: <span className="font-semibold text-slate-800 dark:text-ink-text">{gargaloAtual}</span>.</>}
              </p>
              {gargaloAtual && GARGALO_RESOLUCAO[gargaloAtual] && (
                <div className="pt-2 border-t border-rosegold/15 space-y-2">
                  <p className="text-xs text-slate-600 dark:text-ink-muted leading-relaxed">
                    <span className="font-semibold text-slate-800 dark:text-ink-text">Como resolver: </span>
                    {GARGALO_RESOLUCAO[gargaloAtual].oQueFazer}
                  </p>
                  <button
                    onClick={() => setActiveSection(GARGALO_RESOLUCAO[gargaloAtual].aba)}
                    className="text-xs font-sans font-bold text-rosegold dark:text-rosegold-light hover:underline cursor-pointer"
                  >
                    {GARGALO_RESOLUCAO[gargaloAtual].abaLabel} →
                  </button>
                </div>
              )}
            </div>
          )}
          <p className="text-center text-xs font-sans text-slate-400 dark:text-ink-muted">
            Últimos 30 dias · {stats.diasComCheckin} dia(s) com check-in
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white dark:bg-ink-raised border border-rose-100/20 dark:border-ink-hairline p-4 text-center">
              <p className="text-2xl font-serif font-bold text-slate-800 dark:text-ink-text">{stats.posts}</p>
              <p className="text-[11px] font-sans text-slate-500 dark:text-ink-muted uppercase tracking-wider">Posts</p>
            </div>
            <div className="rounded-2xl bg-white dark:bg-ink-raised border border-rose-100/20 dark:border-ink-hairline p-4 text-center">
              <p className="text-2xl font-serif font-bold text-slate-800 dark:text-ink-text">{stats.mensagens}</p>
              <p className="text-[11px] font-sans text-slate-500 dark:text-ink-muted uppercase tracking-wider">Mensagens Recebidas</p>
            </div>
            <div className="rounded-2xl bg-white dark:bg-ink-raised border border-rose-100/20 dark:border-ink-hairline p-4 text-center">
              <p className="text-2xl font-serif font-bold text-slate-800 dark:text-ink-text">{stats.reunioes}</p>
              <p className="text-[11px] font-sans text-slate-500 dark:text-ink-muted uppercase tracking-wider">Reuniões Agendadas</p>
            </div>
            <div className="rounded-2xl bg-white dark:bg-ink-raised border border-rose-100/20 dark:border-ink-hairline p-4 text-center">
              <p className="text-2xl font-serif font-bold text-rosegold">{stats.vendas}</p>
              <p className="text-[11px] font-sans text-slate-500 dark:text-ink-muted uppercase tracking-wider">Vendas Geradas</p>
            </div>
          </div>

          <div className="rounded-2xl bg-white dark:bg-ink-raised border border-rose-100/20 dark:border-ink-hairline p-5 space-y-3">
            <p className="text-xs font-sans font-bold text-slate-700 dark:text-ink-text uppercase tracking-wider mb-1">Taxas de conversão</p>
            {[
              { label: 'Conteúdo → Mensagem', value: stats.taxaConteudoMensagem },
              { label: 'Mensagem → Reunião', value: stats.taxaMensagemReuniao },
              { label: 'Reunião → Venda', value: stats.taxaReuniaoVenda }
            ].map((row) => (
              <div key={row.label}>
                <div className="flex justify-between text-xs font-sans text-slate-600 dark:text-ink-muted mb-1">
                  <span>{row.label}</span>
                  <span className="font-bold">{row.value}%</span>
                </div>
                <div className="h-1.5 bg-rose-50 dark:bg-ink rounded-full overflow-hidden">
                  <div className="h-full bg-rosegold rounded-full" style={{ width: `${Math.min(row.value, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {activeSection === 'mensagens' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <p className="text-center text-xs font-sans text-slate-400 dark:text-ink-muted mb-2">
            Copia o prompt, cola no Renata OS, e ele te ajuda a escrever a resposta na tua voz, pro teu momento real.
          </p>
          {!gargaloAtual && (
            <p className="text-center text-xs font-sans text-rosegold/80 dark:text-rosegold-light/80 mb-2">
              Preenche o Diagnóstico pra eu te mostrar qual prompt resolve o seu gargalo primeiro.
            </p>
          )}
          {orderedPrompts.map((item) => (
            <div
              key={item.title}
              className={`rounded-2xl bg-white dark:bg-ink-raised border p-4 space-y-2 ${
                item.recomendado ? 'border-rosegold/50' : 'border-rose-100/20 dark:border-ink-hairline'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-sans font-bold text-rosegold uppercase tracking-wider">{item.title}</p>
                  <p className="text-[11px] font-sans text-slate-400 dark:text-ink-muted">{item.momento}</p>
                </div>
                {item.recomendado && (
                  <span className="text-[10px] font-sans font-bold text-white bg-rosegold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                    Recomendado pra você
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-700 dark:text-ink-text leading-relaxed bg-rose-50/40 dark:bg-ink rounded-xl p-3">{item.text}</p>
              <button
                onClick={() => copyPrompt(item.title, item.text)}
                className="text-xs font-sans font-semibold text-rosegold dark:text-rosegold-light hover:underline cursor-pointer"
              >
                {copiedPrompt === item.title ? 'Copiado ✓' : 'Copiar prompt'}
              </button>
            </div>
          ))}
          <div className="flex items-center gap-2 justify-center pt-2 text-xs text-slate-400 dark:text-ink-muted">
            <Award className="h-3.5 w-3.5" />
            Baseado no fechamento por mensagem, método validado
          </div>
        </motion.div>
      )}
    </div>
  );
}
