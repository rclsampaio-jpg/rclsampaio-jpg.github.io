/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserProgress } from '../types';

export interface PracticeWeek {
  theme: string;
  title: string;
  challenge: string;
  where: string;
}

// Cadência semanal da Fase de Prática (dia 31 em diante): reaproveita os 4
// tipos de dia que já existem nos 30 dias (Verdade, Pensamento Contrário,
// Storytelling, Presença), cada um com o exercício real já validado, não
// um tema novo inventado. Cicla a cada 4 semanas. Usado tanto pelo cartão
// de prévia do Próximo Nível quanto pela Missão Diária depois do dia 30.
export const PRACTICE_WEEKS: PracticeWeek[] = [
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

export function getCurrentPracticeWeekIndex(progress: UserProgress): number {
  if (!progress.journeyStartDate) return 0;
  const start = new Date(`${progress.journeyStartDate}T00:00:00`);
  const day30 = new Date(start);
  day30.setDate(day30.getDate() + 30);
  const weeksElapsed = Math.floor((Date.now() - day30.getTime()) / (1000 * 60 * 60 * 24 * 7));
  return ((weeksElapsed % 4) + 4) % 4;
}

// Mesma ideia acima, mas ancorada no número do dia virtual (31, 32, 33...)
// em vez do relógio, pra ficar coerente com a Missão Diária: dia 31-37 é
// semana 0, 38-44 é semana 1, etc. Isso evita que o tema mostrado na Missão
// Diária "pule" de repente por causa da data real, se ela pausar e voltar.
export function getPracticeWeekIndexForDay(dayNumber: number): number {
  const weeksElapsed = Math.floor((dayNumber - 31) / 7);
  return ((weeksElapsed % 4) + 4) % 4;
}
