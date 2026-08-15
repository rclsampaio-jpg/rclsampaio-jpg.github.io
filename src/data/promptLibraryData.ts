// src/data/promptLibraryData.ts
//
// Conteúdo dos antigos PDFs "Como Crescer no Instagram Começando do Zero" e
// "Prompts Prontos pra Usar na Renata OS", migrado pra dentro do app como
// cards copiáveis em vez de download. Fonte: renata-os-worker/referencias/
// prompts-prontos.md e leis-copy-renata.md (a mesma base que já orienta a
// própria Renata OS), não é conteúdo novo.

export interface PromptItem {
  id: string;
  purpose: string; // "pra que serve", uma linha
  text: string;
}

export interface PromptGroup {
  id: string;
  title: string;
  prompts: PromptItem[];
}

export const PROMPT_GROUPS: PromptGroup[] = [
  {
    id: 'reels-7s',
    title: 'Reels de 7 segundos',
    prompts: [
      {
        id: 'p1',
        purpose: 'Vídeo curto com frases-flagra na tela, sobre uma trava específica da sua audiência.',
        text: 'Quero um vídeo de 7 segundos sobre [tema/trava que minha audiência sente]. Me dê 5 frases-flagra pra colocar na tela, no estilo pensamento cortado no meio ("eu faço X, sinto Y, desisto"), sem soar gancho de venda. Depois escreva a legenda no formato: comece no momento específico, mencione o erro antes da virada, primeira pessoa, termine convidando a pessoa a comentar uma palavra se ela se reconheceu.'
      },
      {
        id: 'p2',
        purpose: 'Transforma uma ideia solta que você já tem em roteiro de 7 segundos pronto.',
        text: 'Pegue essa ideia solta [cole a ideia] e transforme em roteiro de vídeo de 7 segundos: um hook físico nos 2 primeiros segundos (algo flagrante, tipo eu ajustando a câmera ou me pegando de surpresa), e uma legenda no formato momento específico + erro + primeira pessoa + lição, sem soar como anúncio.'
      },
      {
        id: 'p3',
        purpose: 'Gera várias opções de frase-flagra pra você escolher a que soa mais com você.',
        text: 'Escreva 5 frases-flagra diferentes pra vídeo de 7 segundos sobre [trava/sentimento específico da minha audiência], todas no formato de pensamento cortado no meio, como se eu tivesse sido pega pensando aquilo, nunca como lista de dicas ou pergunta retórica de venda.'
      }
    ]
  },
  {
    id: 'reels-90s',
    title: 'Reels até 90s / conteúdo educativo com história',
    prompts: [
      {
        id: 'p4',
        purpose: 'Post educativo contado como história real, não como lista de dicas.',
        text: 'Quero criar um post educativo sobre [tema/dica]. Escreva no formato de história real: comece com um resultado específico e um número exato, mencione um erro ou dificuldade que eu passei antes de chegar lá, conte em primeira pessoa o que eu fiz, e termine com a lição aprendida, não só com o resultado. Não escreva como lista de dicas genéricas.'
      },
      {
        id: 'p5',
        purpose: 'Transforma uma dica solta num bastidor real, com tropeço e aprendizado.',
        text: 'Transforme essa dica solta em uma história de bastidor: [cole a dica aqui]. Preciso que pareça que estou contando pra uma amiga o que aconteceu comigo, com um momento específico, um tropeço no meio do caminho, e o que eu aprendi. Use números reais sempre que possível.'
      },
      {
        id: 'p6',
        purpose: 'Ajuda a lembrar de um momento real da sua jornada pra virar conteúdo.',
        text: 'Me ajude a lembrar de um momento real da minha jornada com [tema] que eu possa transformar em conteúdo. Faça perguntas pra me ajudar a lembrar detalhes específicos (datas, números, sentimentos, o que deu errado antes de dar certo) e só depois monte o texto final no formato resultado específico + erro + primeira pessoa + lição.'
      },
      {
        id: 'p7',
        purpose: 'Gera 3 versões de gancho diferentes pro mesmo conteúdo.',
        text: 'Escreva 3 versões de gancho pro mesmo conteúdo sobre [tema], todas começando com um resultado numérico específico em primeira pessoa (nada de "3 dicas para..." ou "como fazer..."). Depois me pergunte qual erro ou dificuldade eu quero incluir antes do resultado.'
      }
    ]
  },
  {
    id: 'carrossel',
    title: 'Carrossel de venda',
    prompts: [
      {
        id: 'p8',
        purpose: 'Monta um carrossel de venda completo, capa a fechamento.',
        text: 'Ajude a criar um carrossel de venda pra [oferta]. Comece pela capa com um resultado real específico que já aconteceu (não uma promessa genérica) e diga quem fala, incluindo minha própria trava antes de conseguir esse resultado. Depois liste [número] diferenciais da oferta, um por slide, sempre contados como cena ou sensação, nunca como lista técnica de recursos. No slide final, monte um espaço pra eu colar um print real de depoimento e feche com um CTA de comentar uma palavra-código.'
      }
    ]
  },
  {
    id: 'revisao',
    title: 'Revisão de texto (qualquer formato, incluindo Stories)',
    prompts: [
      {
        id: 'p9',
        purpose: 'Reescreve um rascunho genérico trocando informação solta por cena real.',
        text: 'Revise esse rascunho de post e me diga onde ele está genérico demais: [cole o rascunho]. Reescreva trocando qualquer frase de informação pura por uma cena específica, com número e primeira pessoa, mantendo a lição final no fechamento.'
      },
      {
        id: 'p10',
        purpose: 'Tira "cara de IA" de um texto que você mesma escreveu, pra DM/story/comentário.',
        text: 'Revise esse texto que escrevi pra mandar pra [contexto: DM, story, comentário]: [cole o texto]. Tire qualquer cara de IA: corte justificativa antes do pedido, troque conectivo formal por fala solta, deixe pergunta curta com opções em vez de pergunta longa e elegante, e ajuste emoji pra só onde reforça sentimento real.'
      }
    ]
  },
  {
    id: 'audiencia-obcecada',
    title: 'Mensagem central / audiência obcecada',
    prompts: [
      {
        id: 'p11',
        purpose: 'Explica os 4 pilares que fazem uma audiência ficar obcecada, com um exemplo pronto pro seu nicho.',
        text: 'O que faz uma audiência ficar obcecada por alguém, e não só seguir por curiosidade? Me explique de um jeito simples, usando esses 4 pilares: perspectiva única, ressonância emocional, espelhamento de identidade e consistência de essência. Depois, com base na minha mensagem principal sobre [tema/nicho], me entregue um exemplo pronto pra postar hoje, no formato que fizer mais sentido (Reels de 7 segundos, carrossel ou roteiro de 30 segundos), já usando esses 4 pilares e seguindo as leis de tea e anti-hook.'
      }
    ]
  },
  {
    id: 'reels-conversao',
    title: 'Reels de conversão (7 ângulos validados)',
    prompts: [
      {
        id: 'p13',
        purpose: 'Roteiro de Reels de conversão real, escolhendo entre os 7 ângulos validados.',
        text: 'Me ajuda a criar Reels de conversão sobre [tema/trava]. Me pergunta primeiro se eu quero focar em só um dos 7 ângulos (inimigo comum, história pessoal, números, confissão, contraintuitivo, passo a passo, prova de terceiro) ou se quero ver o tema desenvolvido nos 7 ângulos de uma vez, como um bloco de sequência. Depois de eu responder, monta o(s) roteiro(s) completo(s) nesse formato, sempre em primeira pessoa ou com dado real meu, sem cara de IA, sem virar acusação genérica nem regra fechada. E não force CTA em todo roteiro, só feche com CTA quando isso fizer sentido dentro do meu calendário de conteúdo, se eu não tiver um calendário definido ainda, me pergunte antes de decidir.'
      }
    ]
  },
  {
    id: 'sem-produto',
    title: 'Roteiro de jornada, sem produto ainda',
    prompts: [
      {
        id: 'p14',
        purpose: 'Roteiro pra quem quer mostrar a própria jornada, sem ter um produto pra vender ainda.',
        text: 'Quero criar um roteiro de vídeo/Reels sobre minha jornada, no formato "experienciadora", não especialista. Eu ainda não tenho um produto ou método pra vender, só quero mostrar o que tá acontecendo comigo desde que eu comecei a [ação: postar consistente, tentar algo novo, mudar um hábito]. Me ajuda a listar, em primeira pessoa, os resultados reais que já aconteceram (me pergunte quais são, não invente nenhum), depois monte o roteiro nessa ordem: gancho de tempo + convite aberto, lista de acontecimentos reais sem explicar nada no meio, menção de quem entrou em contato ou se identificou, o sentimento por trás disso tudo como ponto mais forte do vídeo, e feche com um convite leve (comentar, seguir, conversar), sem cobrança e sem forçar uma oferta que eu não tenho ainda.'
      }
    ]
  },
  {
    id: 'doodle',
    title: 'Combo Doodle (legenda + imagem)',
    prompts: [
      {
        id: 'p12',
        purpose: 'Preenche as frases de um doodle (rabiscos ao redor de uma foto) com a sua mensagem principal.',
        text: 'Sou criadora de conteúdo [estágio] e minha mensagem principal é [mensagem principal]. Quero modificar as mensagens desse doodle de acordo com a minha mensagem principal mencionada acima pra você usando a mentalidade da RenaSer: fazer com que a audiência seja obcecada comigo, e as regras e leis gerais da RenaSer. Analise e me traga sua recomendação.'
      },
      {
        id: 'p12b',
        purpose: 'Prompt em inglês pra gerar a imagem final com os doodles desenhados por cima, no ChatGPT.',
        text: 'Analyze the uploaded image and preserve the original subject, composition, and lighting. Do not alter the identity or structure of the main subject. Add playful, hand-drawn doodles that interact directly with the subject in the image. The doodles should mimic, follow, or exaggerate the shapes, gestures, or motion present, such as outlining poses, extending limbs, adding motion lines, or creating imaginative elements that "respond" to the subject. Ensure the doodles feel naturally integrated into the scene, as if they were drawn on top of the photo with intention. Use a sketchy, imperfect, hand-drawn style with organic lines, slightly uneven strokes, and a casual illustrated feel. Include whimsical handwritten text elements placed around the image. The text should match the mood or implied context of the scene, with a playful and spontaneous tone. Avoid fixed phrases, generate context-aware, creative, and humorous text that fits each unique image. Maintain a balanced composition so the doodles enhance the image without overwhelming the original subject. Keep the overall aesthetic fun, expressive, and social-media-ready. High resolution, clean overlay, vibrant yet natural color harmony. Gere a imagem em dimensões pra post de IG.'
      }
    ]
  }
];

export interface HookReferencePoint {
  title: string;
  points: string[];
}

// Condensado de leis-copy-renata.md (conceito de anti-hook, gatilhos de
// compra, nomeação de ofertas), pra consulta rápida antes de usar os
// prompts acima. Não substitui as leis completas, é o resumo de bolso.
export const HOOK_REFERENCE: HookReferencePoint[] = [
  {
    title: 'O que é um anti-hook',
    points: [
      'Um gancho que não parece gancho: soa como se você tivesse sido flagrada no meio de um pensamento ou conversa, não como um anúncio.',
      'Quando o texto se anuncia como venda, o cérebro entra na defensiva. Quando parece conversa casual, a pessoa para pra escutar.',
      'Ganchos pra aposentar: "você está cometendo esse erro com X", "o motivo nº1 pelo qual você não vê resultado", "X formas de fazer Y".'
    ]
  },
  {
    title: '4 gatilhos de compra',
    points: [
      'Fale do benefício profundo, não da superfície: o que muda de verdade na vida da pessoa, a cena concreta do alívio.',
      'Troque rótulo de emoção ("travada", "sobrecarregada") pela cena específica que ela provoca.',
      'Conte sua própria história, não a dor genérica do comprador. Quem lê se identifica sem se sentir exposta.',
      'Venda emocionalmente primeiro, deixe a lista de entregáveis justificar depois, nunca abra por ela.'
    ]
  },
  {
    title: 'Nomeação de oferta',
    points: [
      'Lidere sempre com o resultado primeiro, e só depois diga como é entregue (curso, programa, mentoria...).'
    ]
  }
];
