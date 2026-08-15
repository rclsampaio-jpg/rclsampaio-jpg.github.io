// src/data/professionalDiagnosticData.ts
//
// Perguntas do diagnóstico da Área da Profissional (Destrave), usadas tanto
// dentro da própria área (ProfessionalAreaView) quanto no passo de
// onboarding pra quem já entra dizendo que faz parte do Destrave. Múltipla
// escolha, não texto livre — ela reconhece a opção mais parecida com ela em
// vez de precisar descrever do zero.

import { PilarKey } from '../types';

export interface DiagnosticQuestion {
  key: string;
  label: string;
  options: string[];
}

// Só a pergunta de tom fica aqui: é a única que alimenta algo depois (o
// ${tom} injetado em todo prompt do Renata OS). "Estilo a evitar" foi
// removido, era coletado e nunca usado em lugar nenhum.
export const VOZ_PERGUNTAS: DiagnosticQuestion[] = [
  {
    key: 'tom',
    label: 'Qual desses estilos mais parece com você quando explica algo pra alguém?',
    options: ['Direta e prática', 'Acolhedora e emocional', 'Técnica e detalhista', 'Bem-humorada e leve']
  }
];

// Só o gargalo fica aqui: é a única pergunta de "estrutura" que já é usada
// de verdade (recomendação no Dashboard, prompts marcados como recomendados
// nas Mensagens/Fundamentos). "Formato hoje" e "frequência" foram
// removidos — eram coletados e nunca lidos em lugar nenhum, e frequência
// real já é medida de verdade pelos check-ins, não precisa de autorrelato.
export const ESTRUTURA_PERGUNTAS: DiagnosticQuestion[] = [
  {
    key: 'gargalo',
    label: 'Onde mais trava hoje?',
    options: ['Em criar conteúdo com constância', 'Em gerar mensagens/interesse', 'Em transformar mensagem em reunião', 'Em fechar a venda na reunião']
  }
];

// Raio-X dos 5 pilares da metodologia (mapeados 1:1 com as seções de
// Fundamentos). Vira o mapa de progresso no Dashboard, e cada pilar "não"
// ou "parcial" aponta direto pro prompt certo pra resolver.
export const PILARES: { key: PilarKey; label: string; ajuda: string }[] = [
  {
    key: 'bigIdea',
    label: 'Você tem uma Big Idea nomeada?',
    ajuda: 'Um nome próprio pro seu método, não só "o que você faz" descrito de forma solta.'
  },
  {
    key: 'angulos',
    label: 'Você varia o ângulo emocional dos seus posts?',
    ajuda: 'A mesma dor contada por portas diferentes (medo, comparação, perfeccionismo...), não sempre a mesma mensagem.'
  },
  {
    key: 'oferta',
    label: 'Sua oferta tem preço ancorado?',
    ajuda: 'Você apresenta o valor com convicção, sem descontar assim que alguém hesita.'
  },
  {
    key: 'vsl',
    label: 'Você tem uma mensagem central estruturada?',
    ajuda: 'Um roteiro/VSL pronto que explica seu método do jeito certo, não algo remontado toda vez do zero.'
  },
  {
    key: 'autoridade',
    label: 'Seu perfil comunica autoridade nos primeiros segundos?',
    ajuda: 'Quem nunca te viu entende rápido por que confiar em você, sem precisar rolar o feed inteiro.'
  }
];
