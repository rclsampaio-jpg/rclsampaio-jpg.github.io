# Sistema de tokens do Dark Mode — "Luxo Contido"

## Contexto

O dark mode atual do RenaSer é aplicado ad-hoc: cerca de 662 usos de `dark:`
espalhados por quase todo componente, cada um com valores hexadecimais
digitados na mão (`#1E1715`, `#2C221E`, `#130E0D`, `#3A2A24`...), sem paleta
compartilhada. O resultado é inconsistente e, nas palavras da dona do
produto, "horrível, muito básico e nada sofisticado".

O modo claro (chamado aqui de "Opção A") já tem uma identidade forte e
aprovada: paleta rosegold/dourado, glassmorphism, gradientes suaves,
sombras coloridas — um visual "glam acolhedor". Esse projeto **não mexe no
modo claro**. O objetivo é dar ao modo escuro uma identidade própria,
igualmente deliberada, mas com um temperamento diferente: "Opção B",
já validada visualmente pela dona antes deste documento (comparação
lado a lado entre as duas direções) — luxo contido, silencioso, editorial.

## Escopo desta fase (Fase 1 de um projeto maior)

O dark mode completo é grande demais para uma única entrega: 662 usos de
`dark:` espalhados por ~15 componentes. Este documento cobre **só a Fase 1
— o sistema de tokens em si**, decomposto assim:

- **Fase 1 (este documento):** definir os tokens de cor/tipografia/textura
  do dark mode e as classes utilitárias reaproveitáveis que as fases
  seguintes vão consumir. Documentar o sistema no `BrandIdentityView.tsx`.
  **Nenhuma tela do app muda de aparência nesta fase.**
- **Fase 2 (projeto futuro):** aplicar o sistema num piloto pequeno
  (Home + navegação principal) para validar na prática.
- **Fase 3+ (projetos futuros):** rollout tela por tela no resto do app
  (`CmsView`, `BrandIdentityView`, `DailyMissionView`, etc.).

## Paleta

| Token | Valor | Uso |
|---|---|---|
| `--color-ink` | `#17130F` | Fundo principal das telas |
| `--color-ink-raised` | `#211C17` | Superfícies elevadas (cards, headers) — um degrau sólido de luminosidade acima do fundo, sem gradiente |
| `--color-ink-text` | `#F3ECE4` | Texto principal |
| `--color-ink-text-muted` | `#8C8078` | Texto secundário, legendas |
| `--color-ink-hairline` | `#3A342E` | Bordas finas (divisores, contorno de card) |
| `--color-rosegold-light` (já existe) | `#EBB4A0` | Único acento — CTAs, links, ícones |

Deliberadamente **um único acento** (`rosegold-light`), não dois como no
modo claro (rosegold + dourado). Restrição = elegância: é o que separa
"luxo contido" de "modo claro invertido".

## Por que sem vidro/gradiente no dark mode

O modo claro usa `backdrop-blur` (efeito vidro) e gradientes suaves —
funciona bem lá porque o fundo claro dá contraste e nitidez ao desfoque.
Em fundo escuro, o mesmo efeito tende a ficar "embaçado" e mais barato,
não mais sofisticado — desfoque sobre fundo escuro perde definição visual.
Interfaces de luxo em modo escuro (hotelaria, moda) tipicamente usam o
oposto: superfície plana, silêncio, espaço negativo, um acento bem dosado.
Por isso as classes decorativas do modo claro (`.glass-premium`,
`.ceramic-soft`) **não ganham equivalente no dark mode** — os componentes
novos abaixo as substituem inteiramente quando o tema é escuro.

## Tipografia

Mesmas famílias do resto do app — **Cormorant Garamond** (display) e
**Inter** (corpo) — sem trocar de fonte entre os modos, para que trocar de
tema continue parecendo o mesmo produto, só com temperamento diferente.
No dark mode, títulos usam peso mais leve (`font-light`, não
`font-medium`), sem itálico decorativo, `letter-spacing` levemente
negativo; labels/legendas ganham leve caixa-alta com tracking mais aberto.

## Classes utilitárias (o que as fases seguintes vão consumir)

```css
/* src/index.css */

.dark .ink-card {
  background-color: var(--color-ink-raised);
  border: 1px solid var(--color-ink-hairline);
  /* Propositalmente sem box-shadow, sem backdrop-filter, sem gradiente. */
}

.dark .ink-button-outline {
  background: transparent;
  border: 1px solid var(--color-rosegold-light);
  color: var(--color-rosegold-light);
}

.dark .ink-input-line {
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--color-ink-hairline);
  border-radius: 0;
  color: var(--color-ink-text);
}
.dark .ink-input-line:focus {
  border-bottom-color: var(--color-rosegold-light);
  outline: none;
}
```

Botões primários no dark mode são **contorno**, não preenchidos — reforça
o silêncio da direção em vez de mais um bloco de cor sólida brilhando no
escuro (decisão confirmada com a dona). Inputs não têm caixa — só uma
linha inferior, como no mockup de login já aprovado.

## Verificação desta fase

Como nenhuma tela real muda nesta fase, a validação acontece por uma
prévia isolada (mockup/artifact) usando as classes reais definidas acima
— não CSS solto — para a dona confirmar visualmente o sistema antes de
aprovarmos a Fase 2 (rollout piloto) como próximo projeto.

## Documentação de marca

A aba "Paleta & Materiais" de `src/components/BrandIdentityView.tsx`
ganha uma nova seção "Dark Mode — Luxo Contido", ao lado da paleta clara
já documentada ali, registrando os tokens acima como parte oficial da
identidade visual do RenaSer — não como um modo alternativo à parte.

## Fora de escopo (explicitamente não fazendo agora)

- Aplicar os tokens em qualquer componente real do app (Fase 2+).
- Alterar qualquer aspecto do modo claro.
- Trocar as famílias tipográficas entre os modos.
- Manter/adaptar `.glass-premium`/`.ceramic-soft` para o dark mode — são
  substituídas pelas classes `.ink-*` quando o tema é escuro.
