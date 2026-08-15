// src/data/promptLibraryData.ts
//
// Conteúdo dos antigos PDFs "Como Crescer no Instagram Começando do Zero" e
// "Prompts Prontos pra Usar na Renata OS", migrado pra dentro do app como
// cards copiáveis em vez de download. Fonte: renata-os-worker/referencias/
// prompts-prontos.md e leis-copy-renata.md (a mesma base que já orienta a
// própria Renata OS) e o texto original dos dois PDFs, não é conteúdo novo.
//
// Ordem dos grupos definida por ela diretamente (não por mim), do conceito
// mais fundamental (mensagem central) pro mais técnico/formato específico.

export interface PromptItem {
  id: string;
  purpose: string; // "pra que serve", uma linha
  text: string; // versão limpa, copiada pelo botão "copiar prompt"
  displayText?: string; // versão exibida no card, quando difere de `text`; trechos entre ~~assim~~ aparecem riscados (exemplo de referência, não pra copiar)
}

export interface PromptGroup {
  id: string;
  title: string;
  intro?: string; // contexto/instrução antes dos prompts, quando o grupo precisa de passo a passo
  exampleImage?: string;
  exampleImageCaption?: string;
  prompts: PromptItem[];
}

export const PROMPT_GROUPS: PromptGroup[] = [
  {
    id: 'conteudo-que-converte',
    title: 'Conteúdo que converte',
    intro: 'Cole esse prompt no seu chat de IA preferido (também já funciona nativo aqui na Renata OS, é só pedir "conteúdo que converte"). Ele vai te fazer 7 perguntas, uma de cada vez, pra montar um conteúdo com framework de conversão real, não uma dica solta.',
    prompts: [
      {
        id: 'p15',
        purpose: 'Prompt de sistema completo: framework de conversão de 7 partes (Gancho, Crença Falsa, Mecanismo, Causa Raiz, Custo da Inação, Prova, CTA).',
        text: `Você é um estrategista de conteúdo de resposta direta. Seu trabalho não é ajudar as pessoas a aprenderem alguma coisa. Seu trabalho é mover o leitor de "sabe que tem um problema" pra "tem certeza que essa solução específica é a certa, e eu preciso agir agora."

Todo output que você produz segue o framework de conversão de 7 partes abaixo, em ordem. Não pule etapas. Não amoleça elas transformando em conteúdo genérico de dica. Isso é arquitetura de persuasão, não educação.

O Framework

1. Gancho: a abertura surpreendente que faz alguém parar e pensar "espera, o quê?". Se ninguém parar, mais nada do que você escreve é lido. Contradiga alguma coisa que o leitor acredita hoje. Não abra com uma pergunta ou uma estatística fraca, abra com uma afirmação.

2. Crença Falsa: a coisa que eles acham que deveriam estar fazendo, que na verdade está prejudicando eles. Nomeie a coisa específica que eles estão fazendo agora, e mostre por que não funciona.

3. Mecanismo (a Solução): sua resposta de verdade, a coisa específica que funciona no lugar disso. Dê um nome a ela. Explique por que funciona, não só que funciona.

4. Causa Raiz: o motivo real desse problema continuar acontecendo, mesmo quando as pessoas se esforçam. Explique o que realmente está acontecendo por baixo do problema de superfície.

5. Custo da Inação: o que custa pra eles continuarem sem fazer nada, ou continuarem fazendo a coisa antiga. Seja específico: tempo perdido, dinheiro desperdiçado, chances perdidas.

6. Prova / Realidade Desejada: evidência real de que funciona, e uma imagem de como a vida fica depois de resolvido. Use um resultado real, história ou número. Depois pinte a cena do "depois".

7. CTA: a única coisa clara que você quer que eles façam a seguir. Uma ação só. Sem enrolação.

Regras pra todo output: toda etapa precisa ser concreta e específica pro tema real, nunca preencher com frase genérica de placeholder. Corte tudo que soar como "conteúdo" só por soar, sem dicas, sem "aqui vão 5 formas". Escreva em frases curtas e diretas, sem linguagem hesitante ("eu acho", "talvez"), afirme as coisas como fato. Não use palavras de hype (revolucionário, destrave, suba de nível, segredo, sistema comprovado) a menos que a própria voz do usuário use elas explicitamente. A Crença Falsa precisa nomear um comportamento real e específico, não um espantalho genérico. O Mecanismo precisa poder ser nomeado em poucas palavras. Combine o tom com a voz que o usuário especificar; se nada for especificado, o padrão é simples, conversacional, levemente direto, como uma amiga inteligente explicando alguma coisa, não uma vendedora.

Como coletar informação do usuário: não liste todas as perguntas de uma vez. Faça UMA pergunta de cada vez, em linguagem simples e direta, espere a resposta, depois faça a próxima. Pergunte nessa ordem:
1. "Com quem você está falando, e com qual problema essa pessoa está travada?"
2. "Qual é uma coisa que as pessoas acreditam ou fazem que na verdade piora esse problema, mesmo parecendo a coisa certa a se fazer?"
3. "Qual é a sua solução? E o que torna ela diferente do que já existe por aí?"
4. "Por que esse problema continua acontecendo, mesmo quando as pessoas se esforçam pra resolver?"
5. "O que acontece com alguém se continuar fazendo do jeito antigo e nunca resolver isso?"
6. "Que prova você tem de que sua solução funciona, resultados, histórias, ou pessoas que você ajudou?"
7. "O que você quer que as pessoas façam a seguir, comprar algo, entrar em algo, baixar algo?"

Se elas não souberem responder uma pergunta, ofereça 2-3 opções simples pra elas escolherem em vez de deixar em branco. Depois de ter as 7 respostas, faça uma última pergunta simples: "Em que formato você quer isso, um post curto, um email, um carrossel, ou um roteiro de vídeo? E mais ou menos qual tamanho?" Se elas não responderem essa última, o padrão é um post curto pra redes sociais (150-250 palavras). Só depois de todas as respostas estarem coletadas você escreve a peça completa.

Formato do output: pra peças curtas (posts, emails com menos de ~300 palavras), escreva como conteúdo fluido, sem títulos de seção. Pra peças mais longas (roteiros de vídeo, esboços, carrosséis), use títulos com rótulo, com duas linhas curtas em itálico logo abaixo de cada título antes do conteúdo ("Em termos simples: ..." e "Por que importa: ...", usando exatamente as palavras da seção "O Framework" acima). Depois da peça completa, adicione uma "Checagem de estrutura, leitura rápida" listando as 7 partes com um resumo de uma linha cada.`
      },
      {
        id: 'p16',
        purpose: 'Exemplo respondido pela Renata (do roteiro de gravação), pra você ver como preencher as 7 perguntas na prática.',
        text: '1. Com quem você está falando, e com qual problema essa pessoa está travada? [sua resposta aqui]\n\n2. O que as pessoas acreditam ou fazem que na verdade piora esse problema? [sua resposta aqui]\n\n3. Qual é a sua solução, e o que a torna diferente? [sua resposta aqui]\n\n4. Por que esse problema continua acontecendo, mesmo quando elas se esforçam? [sua resposta aqui]\n\n5. O que acontece se elas continuarem do jeito antigo? [sua resposta aqui]\n\n6. Que prova você tem de que sua solução funciona? [sua resposta aqui]\n\n7. O que você quer que elas façam a seguir? [sua resposta aqui]',
        displayText: '1. Com quem você está falando, e com qual problema essa pessoa está travada? ~~Estou falando com mulheres de 30 a 45 anos, espiritualizadas, que sentem que têm uma história pra contar e querem migrar pra um caminho digital, mas travam de medo e ansiedade na hora de aparecer e gravar. Elas ainda não têm produto nenhum pronto.~~ [sua resposta aqui]\n\n2. O que as pessoas acreditam ou fazem que na verdade piora esse problema? ~~Elas acham que basta postar mais, aprender mais uma técnica de conteúdo, ou esperar se sentir "pronta" e confiante antes de gravar.~~ [sua resposta aqui]\n\n3. Qual é a sua solução, e o que a torna diferente? ~~Minha solução é o ecossistema RenaSer: uma jornada de 30 dias com direcionamento diário, comunidade de apoio e encontros ao vivo comigo, que trabalha o destravamento emocional de aparecer, não só técnica de conteúdo.~~ [sua resposta aqui]\n\n4. Por que esse problema continua acontecendo, mesmo quando elas se esforçam? ~~Porque elas não sustentam o processo tempo suficiente. Postam uma vez, não veem resultado, acham que o problema é o conteúdo, mudam de nicho, recomeçam do zero, de novo e de novo.~~ [sua resposta aqui]\n\n5. O que acontece se elas continuarem do jeito antigo? ~~Elas vão continuar travadas, vendo outras mulheres com histórias parecidas construírem audiência e conexão, enquanto elas mesmas ficam esperando o momento perfeito que nunca chega.~~ [sua resposta aqui]\n\n6. Que prova você tem de que sua solução funciona? ~~Eu saí de 1.030 pra 12.100 seguidores em menos de dois meses, com conteúdos passando de 2 milhões de visualizações. A Fabiana quase saiu do grupo no primeiro dia, uma semana depois já não travava mais pra aparecer. A Bruna gravou um Reels autêntico na segunda semana e já teve reunião de venda e venda fechada.~~ [sua resposta aqui]\n\n7. O que você quer que elas façam a seguir? ~~Quero que entrem pra próxima turma do Destrave, que abre inscrição até tal data.~~ [sua resposta aqui]'
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
        text: 'O que faz uma audiência ficar obcecada por alguém, e não só seguir por curiosidade? Me explique de um jeito simples, usando esses 4 pilares: perspectiva única, ressonância emocional, espelhamento de identidade e consistência de essência. Depois, com base na minha mensagem principal sobre [tema/nicho], me entregue um exemplo pronto pra postar hoje, no formato que fizer mais sentido (Reels de 7 segundos, carrossel ou roteiro de 30 segundos), já usando esses 4 pilares e seguindo as leis de tea e anti-hook.',
        displayText: 'O que faz uma audiência ficar obcecada por alguém, e não só seguir por curiosidade? Me explique de um jeito simples, usando esses 4 pilares: perspectiva única, ressonância emocional, espelhamento de identidade e consistência de essência. Depois, com base na minha mensagem principal sobre ~~ajudar mulheres a perderem o medo de aparecer no Instagram~~ [tema/nicho], me entregue um exemplo pronto pra postar hoje, no formato que fizer mais sentido (Reels de 7 segundos, carrossel ou roteiro de 30 segundos), já usando esses 4 pilares e seguindo as leis de tea e anti-hook.'
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
        text: 'Quero criar um roteiro de vídeo/Reels sobre minha jornada, no formato "experienciadora", não especialista. Eu ainda não tenho um produto ou método pra vender, só quero mostrar o que tá acontecendo comigo desde que eu comecei a [ação: postar consistente, tentar algo novo, mudar um hábito]. Me ajuda a listar, em primeira pessoa, os resultados reais que já aconteceram (me pergunte quais são, não invente nenhum), depois monte o roteiro nessa ordem: gancho de tempo + convite aberto, lista de acontecimentos reais sem explicar nada no meio, menção de quem entrou em contato ou se identificou, o sentimento por trás disso tudo como ponto mais forte do vídeo, e feche com um convite leve (comentar, seguir, conversar), sem cobrança e sem forçar uma oferta que eu não tenho ainda.',
        displayText: 'Quero criar um roteiro de vídeo/Reels sobre minha jornada, no formato "experienciadora", não especialista. Eu ainda não tenho um produto ou método pra vender, só quero mostrar o que tá acontecendo comigo desde que eu comecei a ~~postar todos os dias, mesmo com medo~~ [ação: postar consistente, tentar algo novo, mudar um hábito]. Me ajuda a listar, em primeira pessoa, os resultados reais que já aconteceram (me pergunte quais são, não invente nenhum), depois monte o roteiro nessa ordem: gancho de tempo + convite aberto, lista de acontecimentos reais sem explicar nada no meio, menção de quem entrou em contato ou se identificou, o sentimento por trás disso tudo como ponto mais forte do vídeo, e feche com um convite leve (comentar, seguir, conversar), sem cobrança e sem forçar uma oferta que eu não tenho ainda.'
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
        text: 'Revise esse rascunho de post e me diga onde ele está genérico demais: [cole o rascunho]. Reescreva trocando qualquer frase de informação pura por uma cena específica, com número e primeira pessoa, mantendo a lição final no fechamento.',
        displayText: 'Revise esse rascunho de post e me diga onde ele está genérico demais: ~~hoje vou falar sobre a importância de ser autêntica nas redes~~ [cole o rascunho]. Reescreva trocando qualquer frase de informação pura por uma cena específica, com número e primeira pessoa, mantendo a lição final no fechamento.'
      },
      {
        id: 'p10',
        purpose: 'Tira "cara de IA" de um texto que você mesma escreveu, pra DM/story/comentário.',
        text: 'Revise esse texto que escrevi pra mandar pra [contexto: DM, story, comentário]: [cole o texto]. Tire qualquer cara de IA: corte justificativa antes do pedido, troque conectivo formal por fala solta, deixe pergunta curta com opções em vez de pergunta longa e elegante, e ajuste emoji pra só onde reforça sentimento real.',
        displayText: 'Revise esse texto que escrevi pra mandar pra ~~uma DM de uma seguidora interessada~~ [contexto: DM, story, comentário]: ~~Olá! Gostaria de saber mais sobre como funciona o acompanhamento, você poderia me explicar melhor?~~ [cole o texto]. Tire qualquer cara de IA: corte justificativa antes do pedido, troque conectivo formal por fala solta, deixe pergunta curta com opções em vez de pergunta longa e elegante, e ajuste emoji pra só onde reforça sentimento real.'
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
        text: 'Me ajuda a criar Reels de conversão sobre [tema/trava]. Me pergunta primeiro se eu quero focar em só um dos 7 ângulos (inimigo comum, história pessoal, números, confissão, contraintuitivo, passo a passo, prova de terceiro) ou se quero ver o tema desenvolvido nos 7 ângulos de uma vez, como um bloco de sequência. Depois de eu responder, monta o(s) roteiro(s) completo(s) nesse formato, sempre em primeira pessoa ou com dado real meu, sem cara de IA, sem virar acusação genérica nem regra fechada. E não force CTA em todo roteiro, só feche com CTA quando isso fizer sentido dentro do meu calendário de conteúdo, se eu não tiver um calendário definido ainda, me pergunte antes de decidir.',
        displayText: 'Me ajuda a criar Reels de conversão sobre ~~procrastinar postar por perfeccionismo~~ [tema/trava]. Me pergunta primeiro se eu quero focar em só um dos 7 ângulos (inimigo comum, história pessoal, números, confissão, contraintuitivo, passo a passo, prova de terceiro) ou se quero ver o tema desenvolvido nos 7 ângulos de uma vez, como um bloco de sequência. Depois de eu responder, monta o(s) roteiro(s) completo(s) nesse formato, sempre em primeira pessoa ou com dado real meu, sem cara de IA, sem virar acusação genérica nem regra fechada. E não force CTA em todo roteiro, só feche com CTA quando isso fizer sentido dentro do meu calendário de conteúdo, se eu não tiver um calendário definido ainda, me pergunte antes de decidir.'
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
        text: 'Quero criar um post educativo sobre [tema/dica]. Escreva no formato de história real: comece com um resultado específico e um número exato, mencione um erro ou dificuldade que eu passei antes de chegar lá, conte em primeira pessoa o que eu fiz, e termine com a lição aprendida, não só com o resultado. Não escreva como lista de dicas genéricas.',
        displayText: 'Quero criar um post educativo sobre ~~como perder o medo de aparecer nos Stories~~ [tema/dica]. Escreva no formato de história real: comece com um resultado específico e um número exato, mencione um erro ou dificuldade que eu passei antes de chegar lá, conte em primeira pessoa o que eu fiz, e termine com a lição aprendida, não só com o resultado. Não escreva como lista de dicas genéricas.'
      },
      {
        id: 'p5',
        purpose: 'Transforma uma dica solta num bastidor real, com tropeço e aprendizado.',
        text: 'Transforme essa dica solta em uma história de bastidor: [cole a dica aqui]. Preciso que pareça que estou contando pra uma amiga o que aconteceu comigo, com um momento específico, um tropeço no meio do caminho, e o que eu aprendi. Use números reais sempre que possível.',
        displayText: 'Transforme essa dica solta em uma história de bastidor: ~~poste todos os dias, mesmo com medo~~ [cole a dica aqui]. Preciso que pareça que estou contando pra uma amiga o que aconteceu comigo, com um momento específico, um tropeço no meio do caminho, e o que eu aprendi. Use números reais sempre que possível.'
      },
      {
        id: 'p6',
        purpose: 'Ajuda a lembrar de um momento real da sua jornada pra virar conteúdo.',
        text: 'Me ajude a lembrar de um momento real da minha jornada com [tema] que eu possa transformar em conteúdo. Faça perguntas pra me ajudar a lembrar detalhes específicos (datas, números, sentimentos, o que deu errado antes de dar certo) e só depois monte o texto final no formato resultado específico + erro + primeira pessoa + lição.',
        displayText: 'Me ajude a lembrar de um momento real da minha jornada com ~~a primeira vez que gravei um Reels~~ [tema] que eu possa transformar em conteúdo. Faça perguntas pra me ajudar a lembrar detalhes específicos (datas, números, sentimentos, o que deu errado antes de dar certo) e só depois monte o texto final no formato resultado específico + erro + primeira pessoa + lição.'
      },
      {
        id: 'p7',
        purpose: 'Gera 3 versões de gancho diferentes pro mesmo conteúdo.',
        text: 'Escreva 3 versões de gancho pro mesmo conteúdo sobre [tema], todas começando com um resultado numérico específico em primeira pessoa (nada de "3 dicas para..." ou "como fazer..."). Depois me pergunte qual erro ou dificuldade eu quero incluir antes do resultado.',
        displayText: 'Escreva 3 versões de gancho pro mesmo conteúdo sobre ~~medo de julgamento ao postar~~ [tema], todas começando com um resultado numérico específico em primeira pessoa (nada de "3 dicas para..." ou "como fazer..."). Depois me pergunte qual erro ou dificuldade eu quero incluir antes do resultado.'
      }
    ]
  },
  {
    id: 'reels-7s',
    title: 'Reels de 7 segundos',
    prompts: [
      {
        id: 'p1',
        purpose: 'Vídeo curto com frases-flagra na tela, sobre uma trava específica da sua audiência.',
        text: 'Quero um vídeo de 7 segundos sobre [tema/trava que minha audiência sente]. Me dê 5 frases-flagra pra colocar na tela, no estilo pensamento cortado no meio ("eu faço X, sinto Y, desisto"), sem soar gancho de venda. Depois escreva a legenda no formato: comece no momento específico, mencione o erro antes da virada, primeira pessoa, termine convidando a pessoa a comentar uma palavra se ela se reconheceu.',
        displayText: 'Quero um vídeo de 7 segundos sobre ~~medo de aparecer e ser julgada~~ [tema/trava que minha audiência sente]. Me dê 5 frases-flagra pra colocar na tela, no estilo pensamento cortado no meio ("eu faço X, sinto Y, desisto"), sem soar gancho de venda. Depois escreva a legenda no formato: comece no momento específico, mencione o erro antes da virada, primeira pessoa, termine convidando a pessoa a comentar uma palavra se ela se reconheceu.'
      },
      {
        id: 'p2',
        purpose: 'Transforma uma ideia solta que você já tem em roteiro de 7 segundos pronto.',
        text: 'Pegue essa ideia solta [cole a ideia] e transforme em roteiro de vídeo de 7 segundos: um hook físico nos 2 primeiros segundos (algo flagrante, tipo eu ajustando a câmera ou me pegando de surpresa), e uma legenda no formato momento específico + erro + primeira pessoa + lição, sem soar como anúncio.',
        displayText: 'Pegue essa ideia solta ~~gravei um Reels, travei no meio e acabei não postando~~ [cole a ideia] e transforme em roteiro de vídeo de 7 segundos: um hook físico nos 2 primeiros segundos (algo flagrante, tipo eu ajustando a câmera ou me pegando de surpresa), e uma legenda no formato momento específico + erro + primeira pessoa + lição, sem soar como anúncio.'
      },
      {
        id: 'p3',
        purpose: 'Gera várias opções de frase-flagra pra você escolher a que soa mais com você.',
        text: 'Escreva 5 frases-flagra diferentes pra vídeo de 7 segundos sobre [trava/sentimento específico da minha audiência], todas no formato de pensamento cortado no meio, como se eu tivesse sido pega pensando aquilo, nunca como lista de dicas ou pergunta retórica de venda.',
        displayText: 'Escreva 5 frases-flagra diferentes pra vídeo de 7 segundos sobre ~~medo de gravar e não saber o que falar~~ [trava/sentimento específico da minha audiência], todas no formato de pensamento cortado no meio, como se eu tivesse sido pega pensando aquilo, nunca como lista de dicas ou pergunta retórica de venda.'
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
        text: 'Ajude a criar um carrossel de venda pra [oferta]. Comece pela capa com um resultado real específico que já aconteceu (não uma promessa genérica) e diga quem fala, incluindo minha própria trava antes de conseguir esse resultado. Depois liste [número] diferenciais da oferta, um por slide, sempre contados como cena ou sensação, nunca como lista técnica de recursos. No slide final, monte um espaço pra eu colar um print real de depoimento e feche com um CTA de comentar uma palavra-código.',
        displayText: 'Ajude a criar um carrossel de venda pra ~~mentoria de 30 dias pra perder o medo de aparecer~~ [oferta]. Comece pela capa com um resultado real específico que já aconteceu (não uma promessa genérica) e diga quem fala, incluindo minha própria trava antes de conseguir esse resultado. Depois liste ~~3~~ [número] diferenciais da oferta, um por slide, sempre contados como cena ou sensação, nunca como lista técnica de recursos. No slide final, monte um espaço pra eu colar um print real de depoimento e feche com um CTA de comentar uma palavra-código.'
      }
    ]
  },
  {
    id: 'doodle',
    title: 'Combo Doodle (foto com rabiscos)',
    intro: 'É um combo de 3 passos, usa a Renata OS e depois o ChatGPT: 1) Salve a imagem abaixo + manda o primeiro prompt abaixo da imagem pra Renata OS, ela sugere uma frase pra cada uma das 6 posições do doodle, de acordo com a sua mensagem principal. 2) Copie a resposta da Renata OS. 3) Vai no ChatGPT e manda uma foto sua original (que você quer transformar em doodle) + o prompt gerador de imagem (segundo prompt) + a resposta que a Renata OS te deu. O ChatGPT devolve a imagem final com os doodles desenhados por cima.',
    exampleImage: '/assets/images/doodle-referencia.jpg',
    exampleImageCaption: 'Exemplo de como fica o resultado final, com as 6 posições de frase preenchidas.',
    prompts: [
      {
        id: 'p12',
        purpose: 'Mande esse prompt pra Renata OS + a imagem que você salvou. Não esqueça de substituir as frases com strikethrough (mostradas riscadas abaixo) com as suas respostas pessoais.',
        text: 'Sou criadora de conteúdo [seu estágio] e minha mensagem principal é [sua mensagem principal]. Quero que você sugira as frases pras 6 posições de um doodle (rabiscos ao redor da minha foto: topo, lado esquerdo, lado direito superior, centro direito, inferior direito, inferior esquerdo), de acordo com a minha mensagem principal, usando a mentalidade da RenaSer: fazer com que a audiência fique obcecada comigo. Analise e me traga sua recomendação, uma frase curta por posição.',
        displayText: 'Sou criadora de conteúdo ~~inicial~~ [seu estágio] e minha mensagem principal é ~~encorajar pessoas a começarem tb e provar que funciona. Criando um instagram do 0 e superando todos os medos de falhar/do julgamento que o começo traz~~ [sua mensagem principal]. Quero que você sugira as frases pras 6 posições de um doodle (rabiscos ao redor da minha foto: topo, lado esquerdo, lado direito superior, centro direito, inferior direito, inferior esquerdo), de acordo com a minha mensagem principal, usando a mentalidade da RenaSer: fazer com que a audiência fique obcecada comigo. Analise e me traga sua recomendação, uma frase curta por posição.'
      },
      {
        id: 'p12b',
        purpose: 'Passo 3: manda no ChatGPT junto com sua foto original e a resposta que a Renata OS te deu.',
        text: 'Analise a imagem enviada e preserve o assunto original, a composição e a iluminação. Não altere a identidade nem a estrutura do assunto principal. Adicione doodles divertidos, feitos à mão, que interagem diretamente com o assunto da imagem. Os doodles devem imitar, seguir ou exagerar as formas, gestos ou movimentos presentes, como contornar poses, estender membros, adicionar linhas de movimento, ou criar elementos imaginativos que "respondem" ao assunto. Garanta que os doodles pareçam naturalmente integrados à cena, como se tivessem sido desenhados sobre a foto com intenção. Use um estilo esboçado, imperfeito, feito à mão, com linhas orgânicas, traços levemente irregulares e uma sensação casual e ilustrada. Inclua elementos de texto manuscrito e brincalhão ao redor da imagem, usando as frases que a Renata OS gerou pra cada posição. O texto deve combinar com o clima ou contexto da cena, num tom brincalhão e espontâneo. Mantenha uma composição equilibrada, pra que os doodles reforcem a imagem sem sobrecarregar o assunto principal. Mantenha a estética geral divertida, expressiva e pronta pra rede social. Alta resolução, sobreposição limpa, cores vibrantes e harmônicas. Gere a imagem em dimensões pra post de Instagram.'
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
