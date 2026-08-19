/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserProgress } from '../types';

export interface PracticeWeek {
  id: string;
  blockId: 1 | 2 | 3;
  range: [number, number];
  theme: string;
  title: string;
  // O nível esperado dentro do bloco: 1ª semana do bloco introduz, 2ª
  // aprofunda, 3ª consolida. Substitui o subtítulo fixo do bloco (que
  // ficava idêntico as 3 semanas inteiras, sem transmitir progressão)
  // por algo que escala junto com o avanço real dela.
  expectativa: string;
  challenge: string;
  where: string;
  // Camada diária por cima da tarefa semanal (que continua igual a semana
  // inteira, de propósito, é repetição que constrói prática de verdade,
  // não uma tarefa nova por dia). Cada semana tem seu próprio conjunto de
  // 7 (não reaproveitado entre semanas), senão os 60 dias inteiros
  // pareciam o mesmo ciclo de 7 se repetindo 9 vezes. Indexado
  // 0=segunda..6=domingo, mesma convenção de getWeekdayPosition
  // (templateData.ts). Tom de direcionamento e autoridade, não motivação
  // de empurrãozinho, ela já passou dos 30 dias de "push pra aparecer".
  dailyMessages: [string, string, string, string, string, string, string];
}

export interface PracticeBlock {
  id: 1 | 2 | 3;
  title: string;
  subtitle: string;
  range: [number, number];
}

// Fase de Prática (dia 31 em diante): 3 blocos de 3 semanas cada, ligados
// aos pilares de Autoridade Percebida / Audiência (Disponibilidade Mental) /
// Prontidão que também orientam o CTA do Destrave em NextLevelView. Não é
// mais um ciclo genérico reciclando 4 temas soltos — é uma progressão linear
// de 9 semanas (dias 31-90), sem repetição idêntica.
export const PRACTICE_BLOCKS: PracticeBlock[] = [
  {
    id: 1,
    title: 'Autoridade Percebida',
    subtitle: 'Mostrar prova do que você já sabe fazer',
    range: [31, 50]
  },
  {
    id: 2,
    title: 'Audiência',
    subtitle: 'Construir recorrência e conexão real',
    range: [51, 70]
  },
  {
    id: 3,
    title: 'Prontidão',
    subtitle: 'Revisar o que você construiu e decidir com dado, não com feeling',
    range: [71, 90]
  }
];

export const PRACTICE_WEEKS: PracticeWeek[] = [
  {
    id: 'A',
    blockId: 1,
    range: [31, 37],
    theme: 'Autoridade',
    title: 'Semana da Prova de Resultado',
    expectativa: 'Essa semana é sobre provar que você já sabe o que faz. Não precisa ser grande, precisa ser real.',
    challenge: 'Uma prova sempre vai valer mais do que qualquer discurso lindo que você fizer. Essa semana, vamos construir a sua.\n\nGrave contando uma vez que algo que você disse ou fez mudou alguma coisa pra alguém. Não precisa ser resultado de trabalho. Pode ser uma amiga que tomou uma decisão depois de uma conversa com você, um comentário que destravou algo na cabeça de alguém, uma ajuda que virou ponte pra outra coisa na vida dela. Se você já atua profissionalmente, também vale mostrar um resultado real de cliente. O ponto é o mesmo: uma vez, o que você fez ou disse, mudou algo de verdade pra alguém.\n\nEx: "Uma seguidora me chamou de arrogante nos comentários. Respondi em vídeo, sem editar, sem suavizar. Perdi uns 30 seguidores naquela semana. Foi o vídeo que trouxe minhas cinco primeiras clientes pagantes, porque parei de me policiar pra agradar todo mundo."',
    where: 'Usa o prompt de "Revisão de texto" da Biblioteca pra tirar cara de IA do que sair, sem regravar do zero.',
    dailyMessages: [
      'Essa semana constrói autoridade, não é só mais um post. O que você grava hoje entra direto nisso.',
      'Repara na diferença entre o que você grava hoje e o que gravava no dia 5. Essa diferença é o que importa agora, não o volume.',
      'Se o vídeo que você gravou até aqui ainda vem com desculpa antes da prova, tira a desculpa e deixa só o resultado. Ex: troca "não sei se isso vai fazer diferença, mas..." por ir direto no resultado.',
      'Escolhe uma palavra que resume como você quer que as pessoas te vejam depois desse vídeo, e grava pensando nela. Ex: "competente", "acessível", "direta".',
      'O vídeo que saiu essa semana mostra mais sobre você do que sobre o resultado que você contou. Repara nisso.',
      'Revisa o vídeo de prova que você já gravou essa semana e ajusta só o necessário, sem regravar do zero.',
      'Semana que vem o exercício muda pra ângulos. O vídeo de prova que você gravou aqui continua valendo, guarda ele.'
    ]
  },
  {
    id: 'B',
    blockId: 1,
    range: [38, 44],
    theme: 'Autoridade',
    title: 'Semana dos Ângulos',
    expectativa: 'Agora o nível sobe: não basta mostrar prova, precisa mostrar ela de mais de um jeito, pra mais gente reconhecer.',
    challenge: 'Repetir a mesma mensagem do mesmo jeito faz até quem já te segue parar de prestar atenção. Bora cobrir ela de outros ângulos essa semana?!\n\nEscolhe uma trava ou crença que você já percebeu na sua audiência. Essa semana você grava ela em 3 dos 7 ângulos validados: Inimigo comum (nomeia o padrão sem acusar), Confissão (revela algo que você não diria em público) e Números (um resultado real e exato, com o tempo que levou). Mesmo tema, três portas de entrada diferentes.',
    where: 'Usa os prompts do grupo "Reels de conversão" da Biblioteca pra estruturar isso nos 7 ângulos validados.',
    dailyMessages: [
      'Essa semana você grava a mesma trava da sua audiência em três ângulos diferentes: Inimigo comum, Confissão e Números.',
      'Usa o prompt de Reels de conversão pra gerar o ângulo Inimigo comum de hoje. É sobre a trava que você escolheu ontem.',
      'Ainda não gravou o de Confissão? Pede pra Renata OS esse ângulo específico, é o mais difícil dos três.',
      'Pro ângulo Números, a Renata OS só monta certo se você entrar com o resultado real e o tempo que levou. Separa esse dado antes de pedir.',
      'Compara os três que saíram essa semana. Qual soou mais com a sua voz, sem parecer forçado?',
      'Hoje é dia de ajustar o que já saiu, sem gravar mais um ângulo.',
      'Os três ângulos que você usou aqui ficam disponíveis pra qualquer tema novo depois. Guarda esse padrão.'
    ]
  },
  {
    id: 'C',
    blockId: 1,
    range: [45, 50],
    theme: 'Autoridade',
    title: 'Semana da Objeção Real',
    expectativa: 'Última semana desse bloco. Depois de mostrar prova e variar o ângulo, agora é hora de provar que você aguenta ser questionada.',
    challenge: 'Você só deixa de travar numa objeção quando se expõe a ela o suficiente pra treinar a naturalidade disso dentro de você. Essa semana, vamos treinar a sua.\n\nGrave respondendo de frente uma dúvida ou objeção que alguém já te fez de verdade, não uma que você imaginou. Pode ser "isso realmente funciona?", "não é caro demais?", "e se eu não tiver tempo?", qualquer coisa que alguém te perguntou olho no olho ou por mensagem. Responde do jeito que você responderia pra essa pessoa, não um script de venda.',
    where: 'Usa os prompts do grupo "Reels de conversão" da Biblioteca se precisar de estrutura pra resposta.',
    dailyMessages: [
      'Essa semana você grava respondendo, de frente, a objeção que mais te trava. Não é rótulo tipo "medo de vender", é a cena real: o que a pessoa te escreveu, palavra por palavra.',
      'Ex: alguém te perguntou "isso funciona mesmo pra mim?" e você travou porque não sabia se tava prometendo demais. Se foi algo assim, é ela que precisa ser gravada hoje.',
      'Grava a resposta pra objeção que você escolheu, antes de reescrever ela na cabeça dez vezes.',
      'Reescuta a resposta que você gravou pra objeção. Se ainda soa discurso decorado, grava de novo do jeito que você falaria numa ligação real com essa pessoa.',
      'A resposta que ficou é a que você usaria de novo amanhã, com um cliente de verdade na sua frente.',
      'Hoje é dia de deixar a resposta mais curta, não mais longa.',
      'Guarda essa resposta. Da próxima vez que alguém perguntar isso, você já sabe o que dizer.'
    ]
  },
  {
    id: 'D',
    blockId: 2,
    range: [51, 57],
    theme: 'Audiência',
    title: 'Semana de Falar pra Uma Pessoa',
    expectativa: 'Esse bloco troca alcance por profundidade. Uma pessoa de verdade importa mais que mil visualizações vazias.',
    challenge: 'Quem tenta falar com todo mundo ao mesmo tempo, no fim, não conecta com ninguém de verdade. Essa semana, bora falar só pra uma pessoa!\n\nEsquece o número de visualização. Grava pensando numa pessoa real que precisa ouvir exatamente o que você tem pra falar hoje. Não é escala, é profundidade.',
    where: 'Usa o prompt do grupo "Mensagem central / audiência obcecada" da Biblioteca antes de gravar.',
    dailyMessages: [
      'Essa semana você grava pensando numa pessoa real, só uma. O que faz alguém ficar obcecado por quem fala não é informação, é conexão: sua perspectiva, sua emoção real, o quanto ela se vê em você.',
      'A pessoa que você escolheu pra essa semana: o que ela te perguntaria hoje, se pudesse te mandar mensagem agora?',
      'Se ainda tá falando pra "todo mundo", volta pra uma pessoa só. Ex: troca "isso é pra quem quer evoluir" por "isso é pra você que travou numa objeção ontem".',
      'Grava pensando na pessoa que você escolheu, sozinha, ouvindo isso sem mais ninguém por perto. Mostra o processo, não só o resultado, é isso que cria o "isso sou eu também".',
      'Pergunta pra você mesma: a pessoa que você escolheu se sentiria vista com o que você gravou?',
      'Hoje revisa se o tom ficou íntimo ou ficou palestra.',
      'A pessoa que você imaginou pode nem saber que esse vídeo existe. Mas quem se parece com ela vai sentir que você falou direto com ela.'
    ]
  },
  {
    id: 'E',
    blockId: 2,
    range: [58, 64],
    theme: 'Audiência',
    title: 'Semana da Jornada do Herói',
    expectativa: 'Se a semana passada foi sobre ser ouvida por uma pessoa, essa é sobre deixar essa pessoa ver você por inteiro, erro incluso.',
    challenge: 'As pessoas sempre vão se conectar com a sua imperfeição, o que você teve que superar, não com algo que você conquistou de forma perfeita!\n\nConta um fracasso, uma vez que você tentou algo e não deu certo, e o que você aprendeu com isso. As pessoas se conectam com o caminho torto, não com a vitória perfeita.',
    where: 'Usa os prompts do grupo "Reels até 90s" da Biblioteca, é exatamente pra história de bastidor.',
    dailyMessages: [
      'Essa semana você conta um fracasso, não uma vitória.',
      'Pensa numa vez que você tentou alugar um apartamento, pedir aumento, postar um vídeo, e não deu certo. Escolhe uma dessas.',
      'Grava contando o que você sentiu no meio do fracasso, antes de saber que ia dar certo depois.',
      'Revê o que gravou. Ainda parece herói perfeito, ou já parece gente de verdade?',
      'A parte da história que você quase cortou por vergonha, essa é a parte que fica.',
      'Hoje é dia de cortar o que sobra, não de contar mais um fracasso.',
      'Essa história vai continuar servindo depois dessa semana. Guarda ela pronta pra usar de novo.'
    ]
  },
  {
    id: 'F',
    blockId: 2,
    range: [65, 70],
    theme: 'Audiência',
    title: 'Semana da Opinião Impopular',
    expectativa: 'Última semana desse bloco. Depois de se abrir e se mostrar imperfeita, agora é hora de defender uma opinião sua sem se esconder atrás de ninguém.',
    challenge: 'Concordar com todo mundo o tempo inteiro é a forma mais rápida de ser esquecida. Vamos gravar a opinião que você andou engolindo essa semana?\n\nGrava uma opinião sua que nem todo mundo vai concordar. Uma coisa que você normalmente engoliria pra não incomodar ninguém, mas que é verdadeira pra você.',
    where: 'Usa os prompts do grupo "Reels de conversão" da Biblioteca pra estruturar isso nos 7 ângulos validados.',
    dailyMessages: [
      'Essa semana você grava uma opinião sua, mesmo sabendo que nem todo mundo vai gostar.',
      'Pensa numa coisa que você engole toda vez pra não incomodar ninguém. Usa o formato contraintuitivo: "Todo mundo acha que [crença popular do seu nicho], mas...", com a sua experiência real como prova.',
      'Se ainda tá suavizando a opinião, para de suavizar.',
      'Grava do jeito que você falaria pra uma amiga de confiança, sem editar pra ficar mais aceitável.',
      'Vê quem discordou. Discordância também é sinal de que alguém escutou.',
      'Hoje não precisa de opinião nova. Revisa a de terça e deixa mais direta.',
      'Opinião guardada na cabeça não muda a audiência de ninguém. Só a que sai.'
    ]
  },
  {
    id: 'G',
    blockId: 3,
    range: [71, 77],
    theme: 'Prontidão',
    title: 'Semana da Verdade, de Novo',
    expectativa: 'Esse bloco não ensina nada novo, testa o que já ficou. Você ainda trava do jeito que travava no início?',
    challenge: 'Será que você ainda trava do mesmo jeito que travava no dia 1? Essa semana, a gente descobre isso de novo, sem preparo, sem roteiro.\n\nA mesma prática do início da sua jornada: grave um conteúdo sem preparo, sem decorar roteiro, sem ensaiar na frente do espelho. Abre o celular, aperta gravar, fala. Dessa vez é teste: você ainda trava?',
    where: 'Usa o prompt de "Revisão de texto" da Biblioteca pra tirar cara de IA do que sair, sem regravar do zero.',
    dailyMessages: [
      'Essa semana repete o primeiro exercício da sua jornada. Sem preparo, sem roteiro.',
      'Ontem travou ou saiu direto? Hoje faz de novo e repara a diferença.',
      'Se ainda tá ensaiando antes de gravar, a trava não sumiu, só mudou de forma. Ex: escrever roteiro antes, decorar frase, regravar até sair "perfeito".',
      'Grava sem se preparar, igual no dia 1. Compara depois como ficou diferente.',
      'Compara o vídeo de hoje com o do dia 1. A diferença é a prova.',
      'Hoje é dia de notar, sem gravar nada novo, o quanto ficou mais fácil desde o dia 1.',
      'Se ainda travou essa semana, tudo bem. Trava é informação, não veredito.'
    ]
  },
  {
    id: 'H',
    blockId: 3,
    range: [78, 84],
    theme: 'Prontidão',
    title: 'Semana da Auto-Auditoria de Autoridade',
    expectativa: 'Depois de testar se ainda trava, agora é hora de olhar pra trás com prova na mão, não só com sensação.',
    challenge: 'Ninguém enxerga o próprio crescimento só de dentro, às vezes precisa reler as provas. Essa semana, bora revisar as suas!\n\nAntes de gravar essa semana, abre os links que você salvou nas semanas 31 a 50. Reveja o que você mostrou de prova, de ângulos e de resposta a objeção. Grava contando o que mudou em você entre o primeiro link e o último.',
    where: 'Usa a Comunidade pra compartilhar o que percebeu, às vezes a gente só enxerga o próprio crescimento quando fala em voz alta pra alguém.',
    dailyMessages: [
      'Essa semana você grava contando o que mudou em você desde a semana de Prova de Resultado, lá no dia 31.',
      'Abre os links que salvou nas semanas 31 a 50 antes de gravar hoje. Compara o primeiro com o mais recente.',
      'Grava respondendo: o que você faria diferente se gravasse a Prova de Resultado hoje?',
      'Escolhe um dos três exercícios anteriores (prova, ângulos, objeção) e grava a versão 2.0 dele.',
      'Compartilha na Comunidade o que essa auditoria revelou. Ex: "Reli meus primeiros vídeos e percebi que hoje eu já não peço desculpa antes de falar", isso é consistência de essência aparecendo.',
      'Grava um resumo curto: o que ficou mais fácil desde o dia 31.',
      'Guarda esse resumo. Ele vira prova real quando alguém perguntar se você mudou mesmo.'
    ]
  },
  {
    id: 'I',
    blockId: 3,
    range: [85, 90],
    theme: 'Prontidão',
    title: 'Semana da Auto-Auditoria de Audiência',
    expectativa: 'Última semana da sua jornada de 90 dias. O que você reunir aqui decide se já é hora de aplicar pro Destrave, ou se ainda quer mais uma volta nisso.',
    challenge: 'Sentir que já tá pronta e ter prova de que já tá pronta são coisas diferentes. Bora descobrir qual das duas é a sua essa semana?!\n\nRevê os links das semanas 51 a 70. Depois responde, com sinceridade: alguém que te acompanha já te mandou mensagem por conta própria? Você já tem resposta pronta pra objeção comum? Se sentir que já construiu isso, o Destrave tá logo ali em Próximo Nível.',
    where: 'Sem link novo pra gravar essa semana. O exercício é revisão e decisão.',
    dailyMessages: [
      'Essa semana você grava revisando as semanas 51 a 70: falar pra uma pessoa, contar fracasso, opinião impopular.',
      'Grava respondendo: alguém que te acompanha já te procurou por conta própria? Conta o que aconteceu, ou o que ainda não aconteceu.',
      'Grava: você já tem uma resposta pronta pra objeção mais comum que recebe? Testa ela em voz alta agora. Ex: "é caro", "não tenho tempo agora", "isso funciona mesmo pro meu caso?".',
      'Junta as duas respostas de terça e quarta num vídeo só. Isso é dado, não é feeling.',
      'Grava revendo tudo que você construiu nesses 90 dias, não só nessa semana.',
      'Escreve, com sinceridade, se sente que já construiu autoridade e audiência suficiente.',
      'Se sentir que já construiu isso, o Destrave tá logo ali. Se não, os próximos 60 dias continuam valendo o quanto precisar.'
    ]
  }
];

// "Onde te apoiar" variando por dia, amarrado ao que a mensagem daquele dia
// pede (terça pede comparação -> aponta pros links salvos; quarta pede
// mudar ângulo -> aponta pro prompt de ângulos; etc), em vez de ficar
// estático a semana inteira. Esse ciclo continua universal (não por
// semana): é sobre qual ferramenta usar naquele dia, não sobre o tema.
export const PRACTICE_DAILY_WHERE: string[] = [
  'Usa os prompts do grupo "Reels de conversão" ou "Revisão de texto" da Biblioteca pra preparar o que vai gravar essa semana.',
  'Abre os links que você salvou em semanas anteriores e compara com o que você tá gravando hoje.',
  'Usa os prompts do grupo "Reels de conversão" da Biblioteca pra estruturar isso nos 7 ângulos validados.',
  'Usa o prompt do grupo "Mensagem central / audiência obcecada" da Biblioteca antes de decidir.',
  'Compartilha na Comunidade o que essa semana revelou, às vezes só vendo escrito é que a gente percebe o próprio avanço.',
  'Usa o prompt de "Revisão de texto" da Biblioteca pra ajustar o que já gravou, sem precisar regravar do zero.',
  'Sem apoio novo hoje. Só fechamento: anota o que ficou, isso vira base pra semana que vem.'
];

export function getPracticeWeekIndexForDay(dayNumber: number): number {
  if (dayNumber <= PRACTICE_WEEKS[0].range[0]) return 0;
  const idx = PRACTICE_WEEKS.findIndex(w => dayNumber >= w.range[0] && dayNumber <= w.range[1]);
  if (idx !== -1) return idx;
  // Past day 90 (or any gap): clamp to the last week instead of looping,
  // this is now a linear 90-day progression, not a recycled 4-week cycle.
  return PRACTICE_WEEKS.length - 1;
}

export function getCurrentPracticeWeekIndex(progress: UserProgress): number {
  return getPracticeWeekIndexForDay(progress.currentDay);
}
