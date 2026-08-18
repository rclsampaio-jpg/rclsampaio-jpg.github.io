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
  challenge: string;
  where: string;
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
    challenge: 'Grave contando uma vez que algo que você disse ou fez mudou alguma coisa pra alguém. Não precisa ser resultado de trabalho. Pode ser uma amiga que tomou uma decisão depois de uma conversa com você, um comentário que destravou algo na cabeça de alguém, uma ajuda que virou ponte pra outra coisa na vida dela. Se você já atua profissionalmente, também vale mostrar um resultado real de cliente. O ponto é o mesmo: uma vez, o que você fez ou disse, mudou algo de verdade pra alguém.\n\nEx: "Uma seguidora me chamou de arrogante nos comentários. Respondi em vídeo, sem editar, sem suavizar. Perdi uns 30 seguidores naquela semana. Foi o vídeo que trouxe minhas cinco primeiras clientes pagantes, porque parei de me policiar pra agradar todo mundo."',
    where: 'Usa o prompt de "Revisão de texto" da Biblioteca pra tirar cara de IA do que sair, sem regravar do zero.'
  },
  {
    id: 'B',
    blockId: 1,
    range: [38, 44],
    theme: 'Autoridade',
    title: 'Semana dos Ângulos',
    challenge: 'Escolhe uma mensagem central sua. Essa semana a gente cria ela em 3 formatos diferentes: como conselho direto, como história pessoal, e como resposta a uma objeção. Assim você sai da repetição e cobre a mensagem por vários ângulos, aumentando a chance de alcançar quem processa informação de um jeito diferente do seu.',
    where: 'Usa os prompts do grupo "Reels de conversão" da Biblioteca pra estruturar isso nos 7 ângulos validados.'
  },
  {
    id: 'C',
    blockId: 1,
    range: [45, 50],
    theme: 'Autoridade',
    title: 'Semana da Objeção Real',
    challenge: 'Grave respondendo de frente uma dúvida ou objeção que alguém já te fez de verdade, não uma que você imaginou. Pode ser "isso realmente funciona?", "não é caro demais?", "e se eu não tiver tempo?", qualquer coisa que alguém te perguntou olho no olho ou por mensagem. Responde do jeito que você responderia pra essa pessoa, não um script de venda.',
    where: 'Usa os prompts do grupo "Reels de conversão" da Biblioteca se precisar de estrutura pra resposta.'
  },
  {
    id: 'D',
    blockId: 2,
    range: [51, 57],
    theme: 'Audiência',
    title: 'Semana de Falar pra Uma Pessoa',
    challenge: 'Esquece o número de visualização. Grava pensando numa pessoa real que precisa ouvir exatamente o que você tem pra falar hoje. Não é escala, é profundidade.',
    where: 'Usa o prompt do grupo "Mensagem central / audiência obcecada" da Biblioteca antes de gravar.'
  },
  {
    id: 'E',
    blockId: 2,
    range: [58, 64],
    theme: 'Audiência',
    title: 'Semana da Jornada do Herói',
    challenge: 'Conta um fracasso, uma vez que você tentou algo e não deu certo, e o que você aprendeu com isso. As pessoas se conectam com o caminho torto, não com a vitória perfeita.',
    where: 'Usa os prompts do grupo "Reels até 90s" da Biblioteca, é exatamente pra história de bastidor.'
  },
  {
    id: 'F',
    blockId: 2,
    range: [65, 70],
    theme: 'Audiência',
    title: 'Semana da Opinião Impopular',
    challenge: 'Grava uma opinião sua que nem todo mundo vai concordar. Uma coisa que você normalmente engoliria pra não incomodar ninguém, mas que é verdadeira pra você.',
    where: 'Usa os prompts do grupo "Reels de conversão" da Biblioteca pra estruturar isso nos 7 ângulos validados.'
  },
  {
    id: 'G',
    blockId: 3,
    range: [71, 77],
    theme: 'Prontidão',
    title: 'Semana da Verdade, de Novo',
    challenge: 'A mesma prática do início da sua jornada: grave um conteúdo sem preparo, sem decorar roteiro, sem ensaiar na frente do espelho. Abre o celular, aperta gravar, fala. Dessa vez é teste: você ainda trava?',
    where: 'Usa o prompt de "Revisão de texto" da Biblioteca pra tirar cara de IA do que sair, sem regravar do zero.'
  },
  {
    id: 'H',
    blockId: 3,
    range: [78, 84],
    theme: 'Prontidão',
    title: 'Semana da Auto-Auditoria de Autoridade',
    challenge: 'Antes de gravar essa semana, abre os links que você salvou nas semanas 31 a 50. Reveja o que você mostrou de prova, de ângulos e de resposta a objeção. Grava contando o que mudou em você entre o primeiro link e o último.',
    where: 'Usa a Comunidade pra compartilhar o que percebeu, às vezes a gente só enxerga o próprio crescimento quando fala em voz alta pra alguém.'
  },
  {
    id: 'I',
    blockId: 3,
    range: [85, 90],
    theme: 'Prontidão',
    title: 'Semana da Auto-Auditoria de Audiência',
    challenge: 'Revê os links das semanas 51 a 70. Depois responde, com sinceridade: alguém que te acompanha já te mandou mensagem por conta própria? Você já tem resposta pronta pra objeção comum? Se sentir que já construiu isso, o Destrave tá logo ali em Próximo Nível.',
    where: 'Sem link novo pra gravar essa semana. O exercício é revisão e decisão.'
  }
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
