// src/data/professionalAreaData.ts
//
// Conteúdo estático da Área da Profissional (Destrave): prompts, mapa da
// VSL, resolução de gargalo e referência conceitual. Extraído de
// ProfessionalAreaView.tsx pra manter o componente principal enxuto —
// puro dado, sem JSX.

export const FORMATOS = ['Reels', 'Stories', 'Carrossel', 'Vídeo longo'];

// Em vez de script pronto pra copiar e colar, cada item vira um prompt que
// ela manda pro Renata OS — o objetivo é ela desenvolver a própria voz na
// conversa real, não decorar frase de outra pessoa. O prompt já entra
// preenchido com nicho/tom/gargalo do diagnóstico quando existem.
export const PROMPT_LIBRARY: { title: string; momento: string; prompt: (nicho: string, tom: string) => string; resolveGargalo: string[] }[] = [
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

export const VSL_REFERENCIA: { bloco: string; ideia: string }[] = [
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
export const GARGALO_RESOLUCAO: Record<string, { oQueFazer: string; aba: 'mensagens' | 'referencia'; abaLabel: string }> = {
  'Em criar conteúdo com constância': {
    oQueFazer: 'Normalmente não é falta de ideia, é falta de um método nomeado (Big Idea) e de variações prontas pra postar sem reinventar toda vez (Ângulos de Conteúdo). Usa esses dois prompts em Fundamentos, já tão marcados como recomendados pra você.',
    aba: 'referencia',
    abaLabel: 'Ir pra Fundamentos'
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

export const RENATA_OS_PROMPTS: { title: string; prompt: (nicho: string, tom: string, gargalo: string) => string; resolveGargalo: string[] }[] = [
  {
    title: 'Sua Big Idea',
    prompt: (nicho, tom) =>
      `Quero construir minha Big Idea: a frase que resume o ângulo único que só eu tenho dentro de ${nicho}. Meu tom de voz é ${tom}. Me faça perguntas, uma de cada vez, até ter contexto suficiente pra sugerir algumas opções.`,
    resolveGargalo: ['Em criar conteúdo com constância']
  },
  {
    title: 'Sua Oferta Irrecusável',
    prompt: (nicho, tom, gargalo) =>
      `Quero estruturar minha oferta pra ${nicho}: resultado claro que eu entrego, prazo, formato, e o que eu NÃO vou incluir pra não confundir quem recebe. Meu gargalo hoje é "${gargalo}". Me ajuda perguntando o que falta antes de montar a oferta comigo.`,
    resolveGargalo: []
  },
  {
    title: 'Seus Ângulos de Conteúdo',
    prompt: (nicho, tom) =>
      `Quero variar como eu falo da mesma dor pro meu nicho (${nicho}), sem trocar de mensagem, só de porta de entrada emocional. Me ajuda a listar 4 ângulos diferentes (ex: medo de julgamento, perfeccionismo, comparação, "tenho tanto pra mostrar e não mostro") pra essa mesma dor, cada um virando ideia de post/Reels, no meu tom (${tom}).`,
    resolveGargalo: ['Em criar conteúdo com constância']
  },
  {
    title: 'Sua Autoridade Percebida',
    prompt: (nicho, tom) =>
      `Me ajuda a pensar em 3 formas de mostrar autoridade percebida no meu conteúdo sobre ${nicho}, usando resultado real (mesmo que de um cliente só, mesmo pequeno) em vez de teoria. Meu tom é ${tom}.`,
    resolveGargalo: ['Em criar conteúdo com constância']
  },
  {
    title: '1. Preencher o mapa da sua VSL',
    prompt: (nicho, tom) =>
      `Quero estruturar minha promessa/conteúdo seguindo esse mapa: promessa, por que eu travo, o que isso já me custou, pra quem é e pra quem não é, por que o que já tentei não resolveu, meu mecanismo, uma prova real que eu já tenho, o que a pessoa recebe, e o próximo passo. Meu nicho é ${nicho}, meu tom é ${tom}. Me faça uma pergunta de cada vez pra preencher isso comigo.`,
    resolveGargalo: []
  },
  {
    title: '2. Sua VSL final pronta',
    prompt: (nicho, tom) =>
      `Agora pega todas as respostas que acabei de te dar sobre minha promessa, meu problema, pra quem é, meu mecanismo, prova real, o que entrego e o próximo passo, coloca elas em ordem, e me entrega a VSL pronta: roteiro completo, no máximo 1200 palavras, pra caber num vídeo falado de até 11 minutos. A abertura e o fechamento devem seguir o mesmo espírito da VSL original da Renata que você tem como referência, adaptados à minha voz (${tom}) e ao meu nicho (${nicho}), nunca copiados literalmente. Não invente prova social, só usa o que eu te contei.`,
    resolveGargalo: []
  }
];

export const REFERENCE_CONTENT: { title: string; points: string[] }[] = [
  {
    title: 'Big Idea',
    points: [
      'É a ideia central que resume, numa frase, o que te diferencia de qualquer outra pessoa no seu nicho.',
      'Não é o que você faz, é o ângulo pelo qual você faz. Duas profissionais do mesmo nicho podem ter Big Ideas completamente diferentes.',
      'Teste rápido: se alguém só ouvir sua Big Idea, precisa entender na hora por que te procurar e não outra pessoa.'
    ]
  },
  {
    title: 'Ângulos de Conteúdo',
    points: [
      'É a mesma oferta, o mesmo problema, contado por lentes emocionais diferentes, não é sobre criar mensagens novas.',
      'A mesma dor tem várias portas de entrada: medo de julgamento, perfeccionismo, comparação com quem "consegue fácil", ou "tenho tanta coisa boa e não mostro nada". São a mesma pessoa em dias diferentes.',
      'Diferente de gancho: gancho é a abertura (os primeiros segundos), ângulo é a lente emocional do conteúdo inteiro. Um ângulo pode ter vários ganchos diferentes dentro dele.',
      'Não dá pra saber de antemão qual ângulo vai ressoar mais naquele momento. O método é ter vários prontos e deixar o resultado real apontar qual está funcionando.'
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
