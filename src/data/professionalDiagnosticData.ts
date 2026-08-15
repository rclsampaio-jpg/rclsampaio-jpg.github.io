// src/data/professionalDiagnosticData.ts
//
// Perguntas do diagnóstico da Área da Profissional (Destrave), usadas tanto
// dentro da própria área (ProfessionalAreaView) quanto no passo de
// onboarding pra quem já entra dizendo que faz parte do Destrave. Múltipla
// escolha, não texto livre — ela reconhece a opção mais parecida com ela em
// vez de precisar descrever do zero.

export interface DiagnosticQuestion {
  key: string;
  label: string;
  options: string[];
}

export const VOZ_PERGUNTAS: DiagnosticQuestion[] = [
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

export const ESTRUTURA_PERGUNTAS: DiagnosticQuestion[] = [
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
