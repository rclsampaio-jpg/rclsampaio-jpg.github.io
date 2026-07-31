# Sistema de tokens do Dark Mode (Fase 1) — Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. **Exception: Task 2 requires interactive design collaboration with the project owner (via the frontend-design skill) and must be executed by the controlling session directly, not delegated to a subagent** — see that task's note.

**Goal:** Definir os tokens de cor/tipografia/textura do novo dark mode "Luxo Contido" e as classes utilitárias reaproveitáveis (`.ink-card`, `.ink-button-outline`, `.ink-input-line`), documentar o sistema na aba de marca do app, e validar visualmente com a dona — sem alterar nenhuma tela real do app.

**Architecture:** Tokens CSS puros (`@theme` do Tailwind v4) + três classes utilitárias escopadas a `.dark`, tudo em `src/index.css`. Nenhum componente de tela é modificado nesta fase — só a aba de documentação de marca (`BrandIdentityView.tsx`) passa a exibir o novo sistema.

**Tech Stack:** Tailwind v4 (`@theme`), React 19 + TypeScript (só para a seção de documentação), sem dependências novas.

## Global Constraints

- Nenhum componente de tela real (`HomeView`, `DailyMissionView`, etc.) muda de aparência nesta fase — isso é escopo da Fase 2, um projeto futuro separado.
- Não criar equivalente dark de `.glass-premium`/`.ceramic-soft` — a spec decidiu explicitamente que o dark mode não usa vidro/gradiente; as classes `.ink-*` os substituem.
- Botões primários no dark mode são **contorno**, não preenchidos (decisão confirmada com a dona).
- Mesmas famílias tipográficas do app inteiro (Cormorant Garamond + Inter) — não trocar fontes entre os modos.
- Sem suíte de testes no projeto — verificação é `npx tsc --noEmit` + `npm run build`.
- Push direto pra `main` é o fluxo normal deste projeto (sem branch de staging).
- Repo local: `~/Projetos/rclsampaio-jpg.github.io`.

---

## File Structure

**Modificados:**
- `src/index.css` — novos tokens no bloco `@theme` + três novas classes utilitárias no final do arquivo.
- `src/components/BrandIdentityView.tsx` — nova seção "Dark Mode — Luxo Contido" na aba "Paleta & Materiais" (dicionário pt/en/es + bloco JSX), seguindo exatamente o padrão visual já usado pelos swatches de cor existentes nessa aba.

**Sem arquivos novos** — este é um projeto de tokens, não de componentes.

---

### Task 1: Tokens de cor e classes utilitárias

**Files:**
- Modify: `src/index.css`

**Interfaces:**
- Consumes: nada (primeira task).
- Produces: tokens `--color-ink`, `--color-ink-raised`, `--color-ink-text`, `--color-ink-text-muted`, `--color-ink-hairline` (dentro do bloco `@theme` já existente); classes `.ink-card`, `.ink-button-outline`, `.ink-input-line` (com `:focus` correspondente) escopadas a `.dark`. Consumidas por Task 2 (prévia visual) e por qualquer fase futura de rollout — os nomes exatos das classes e tokens não devem mudar depois, componentes futuros vão depender deles.

- [ ] **Step 1: Adicionar os tokens de cor ao bloco `@theme`**

Em `src/index.css`, dentro do bloco `@theme` existente (linhas ~24–33), adicionar as cinco novas variáveis logo após `--color-warmbrown-light`:

```css
@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-display: "Cormorant Garamond", Georgia, serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;

  --color-rosegold: #B76E79;
  --color-rosegold-light: #EBB4A0;
  --color-accentgold: #D4AF37;
  --color-warmwhite: #FAF6F2;
  --color-warmbrown: #3A2A24;
  --color-warmbrown-light: #4A3B35;

  --color-ink: #17130F;
  --color-ink-raised: #211C17;
  --color-ink-text: #F3ECE4;
  --color-ink-text-muted: #8C8078;
  --color-ink-hairline: #3A342E;
}
```

- [ ] **Step 2: Adicionar as três classes utilitárias no final do arquivo**

No final de `src/index.css` (depois de `.transition-luxury`, linha ~167), adicionar:

```css

/* Dark Mode "Luxo Contido" — superfícies planas, sem vidro/gradiente,
   um único acento (rosegold-light). Ver docs/superpowers/specs/
   2026-07-31-dark-mode-tokens-design.md para o racional completo. */
.dark .ink-card {
  background-color: var(--color-ink-raised);
  border: 1px solid var(--color-ink-hairline);
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

- [ ] **Step 3: Verificar (build)**

```bash
cd ~/Projetos/rclsampaio-jpg.github.io
npx tsc --noEmit
npm run build
```

Expected: ambos sem erros. As classes novas ainda não são usadas por nenhum componente, então isso só confirma que o CSS é válido e o build não quebrou.

- [ ] **Step 4: Verificar visualmente que os tokens compilam como esperado**

```bash
grep -A2 "\-\-color-ink:" dist/assets/*.css
```

Expected: o valor `#17130F` aparece no CSS gerado (confirma que o Tailwind v4 processou o token do `@theme` corretamente, não só que o build não quebrou).

- [ ] **Step 5: Commit**

```bash
git add src/index.css
git commit -m "feat(dark-mode): tokens de cor e classes utilitárias ink-* (Fase 1)"
git push origin main
```

---

### Task 2: Prévia visual com frontend-design (execução pelo controlador, não por subagente)

**Nota de execução:** esta task não é um brief para um subagente implementador — ela é um processo de design colaborativo e iterativo com a dona do produto, igual ao que já aconteceu antes neste projeto (comparação Opção A vs B). A sessão controladora deve invocar a skill `frontend-design` diretamente e conduzir essa conversa, não delegar.

**Files:** nenhum arquivo do repositório — o entregável é uma prévia visual (Artifact/mockup), fora do código do app.

**Interfaces:**
- Consumes: os valores exatos definidos na Task 1 (`--color-ink: #17130F`, `--color-ink-raised: #211C17`, etc. e as três classes `.ink-*`) — a prévia deve usar esses valores literalmente, não aproximações, para que o que a dona aprova seja o que realmente está no código.
- Produces: aprovação (ou pedido de ajuste) da dona sobre o sistema de tokens antes de prosseguir para a Task 3.

- [ ] **Step 1: Invocar a skill `frontend-design`**

Contexto para a skill: mostrar o sistema de tokens "Luxo Contido" já definido (não inventar nada novo) aplicado a 2-3 componentes representativos — sugestão: um card de conteúdo (`.ink-card`), um botão primário (`.ink-button-outline`) e um campo de formulário (`.ink-input-line`), lado a lado com o equivalente do modo claro atual, para comparação direta.

- [ ] **Step 2: Construir a prévia usando os valores exatos da Task 1**

A prévia deve ser fiel aos hex codes e à estrutura definidos — não uma reinterpretação livre. Isso é validação do sistema já decidido, não uma nova rodada de exploração de estilo.

- [ ] **Step 3: Apresentar à dona e obter aprovação explícita**

Se ela pedir ajuste em algum valor (cor, peso de fonte, etc.), atualizar tanto a prévia quanto — depois de aprovado — voltar à Task 1 para corrigir `src/index.css` de acordo, mantendo os dois sincronizados.

- [ ] **Step 4: Registrar a aprovação**

Nenhum commit de código nesta task (a prévia não é um artefato do repositório). Se a Task 1 precisar de correção por causa de feedback aqui, isso é um commit adicional na Task 1, não desta task.

---

### Task 3: Documentar o sistema na aba "Paleta & Materiais" do `BrandIdentityView.tsx`

**Files:**
- Modify: `src/components/BrandIdentityView.tsx`

**Interfaces:**
- Consumes: tokens e classes da Task 1 (usa os hex codes literais nos swatches, seguindo o padrão já existente nessa tela — os swatches existentes também hard-codam hex, não referenciam variáveis CSS, então esta task segue a mesma convenção por consistência).
- Produces: nada consumido por outras tasks — esta é a última task do plano.

- [ ] **Step 1: Adicionar as chaves de dicionário (pt/en/es)**

Em `src/components/BrandIdentityView.tsx`, dentro do objeto `colors` de cada idioma (linhas ~74–82 para `pt`, e as seções correspondentes de `en`/`es` mais abaixo no arquivo), adicionar as chaves novas. Para `pt` (linha ~74):

```typescript
      colors: {
        title: "Paleta Cromática & Materiais",
        desc: "Uma seleção de tons quentes, naturais e de extremo luxo que dão o 'vibe' de sofisticação, calma e modernidade.",
        copySuccess: "Copiado!",
        primaryColor: "Ouro Rosa Principal",
        primaryHighlight: "Destaque Ouro Rosa Secundário",
        accentColor: "Ouro de Luxo",
        lightBg: "Marfim Quente (Fundo)",
        darkBg: "Marrom Chocolate Profundo (Fundo)",
        darkModeTitle: "Dark Mode — Luxo Contido",
        darkModeDesc: "Uma identidade própria para o modo escuro: silenciosa, editorial, sem vidro nem gradiente — um único acento (Ouro Rosa Claro) contra um fundo 'tinta' profundo.",
        inkColor: "Tinta (Fundo)",
        inkRaisedColor: "Tinta Elevada (Cartões)",
        inkTextColor: "Texto Principal",
        inkTextMutedColor: "Texto Secundário",
        inkHairlineColor: "Linha Fina (Bordas)"
      },
```

Para `en` (procure o bloco `colors:` dentro de `en:`, estrutura equivalente):

```typescript
      colors: {
        title: "Color Palette & Materials",
        desc: "A selection of warm, natural, extremely luxurious tones that give the vibe of sophistication, calm and modernity.",
        copySuccess: "Copied!",
        primaryColor: "Primary Rose Gold",
        primaryHighlight: "Secondary Rose Gold Highlight",
        accentColor: "Luxury Gold",
        lightBg: "Warm Ivory (Background)",
        darkBg: "Deep Chocolate Brown (Background)",
        darkModeTitle: "Dark Mode — Quiet Luxury",
        darkModeDesc: "A visual identity of its own for dark mode: quiet, editorial, no glass or gradient — a single accent (Light Rose Gold) against a deep 'ink' ground.",
        inkColor: "Ink (Background)",
        inkRaisedColor: "Raised Ink (Cards)",
        inkTextColor: "Primary Text",
        inkTextMutedColor: "Secondary Text",
        inkHairlineColor: "Hairline (Borders)"
      },
```

(Mantenha o texto original de `title`/`desc`/`copySuccess`/etc já existente em `en` se for diferente do que está acima — o ponto desta task é ADICIONAR as cinco chaves novas `darkModeTitle` até `inkHairlineColor`, não reescrever as que já existem. Leia o arquivo primeiro para confirmar a redação exata já presente.)

Para `es`, mesma lógica, adicionar:

```typescript
        darkModeTitle: "Dark Mode — Lujo Silencioso",
        darkModeDesc: "Una identidad propia para el modo oscuro: silenciosa, editorial, sin vidrio ni degradado — un único acento (Oro Rosa Claro) sobre un fondo 'tinta' profundo.",
        inkColor: "Tinta (Fondo)",
        inkRaisedColor: "Tinta Elevada (Tarjetas)",
        inkTextColor: "Texto Principal",
        inkTextMutedColor: "Texto Secundario",
        inkHairlineColor: "Línea Fina (Bordes)"
```

adicionadas dentro do `colors:` já existente de `es`.

- [ ] **Step 2: Adicionar a seção JSX na aba "colors"**

Em `src/components/BrandIdentityView.tsx`, dentro do bloco `{activeTab === 'colors' && (...)}`, logo depois do `</div>` que fecha o `grid` de swatches existente (depois da linha ~887, antes do comentário `{/* Simulated Foil finishes */}`), adicionar uma nova seção seguindo exatamente o mesmo padrão dos swatches existentes:

```typescript
                <div className="bg-[#17130F] rounded-[2rem] border border-[#3A342E] p-8 space-y-4">
                  <h3 className="text-2xl font-display font-light text-[#F3ECE4]">
                    {dictionary.colors.darkModeTitle}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#8C8078]">
                    {dictionary.colors.darkModeDesc}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                  {[
                    {
                      name: dictionary.colors.inkColor,
                      hex: '#17130F',
                      rgb: '23, 19, 15',
                      cmyk: '0, 17, 35, 91',
                      bg: 'bg-[#17130F]',
                      desc: 'Fundo principal do dark mode — profundo, silencioso, sem gradiente.'
                    },
                    {
                      name: dictionary.colors.inkRaisedColor,
                      hex: '#211C17',
                      rgb: '33, 28, 23',
                      cmyk: '0, 15, 30, 87',
                      bg: 'bg-[#211C17]',
                      desc: 'Superfície elevada para cartões e cabeçalhos — um degrau sólido acima do fundo.'
                    },
                    {
                      name: dictionary.colors.inkTextColor,
                      hex: '#F3ECE4',
                      rgb: '243, 236, 228',
                      cmyk: '0, 3, 6, 5',
                      bg: 'bg-[#F3ECE4]',
                      desc: 'Texto principal sobre o fundo tinta.'
                    },
                    {
                      name: dictionary.colors.inkTextMutedColor,
                      hex: '#8C8078',
                      rgb: '140, 128, 120',
                      cmyk: '0, 9, 14, 45',
                      bg: 'bg-[#8C8078]',
                      desc: 'Texto secundário, legendas e rótulos.'
                    },
                    {
                      name: dictionary.colors.inkHairlineColor,
                      hex: '#3A342E',
                      rgb: '58, 52, 46',
                      cmyk: '0, 10, 21, 77',
                      bg: 'bg-[#3A342E]',
                      desc: 'Bordas finas — divisores e contorno de cartão, sem sombra.'
                    }
                  ].map((color, idx) => (
                    <div
                      key={`dark-${idx}`}
                      className="bg-white dark:bg-[#1E1715] rounded-3xl border border-rose-100/10 p-5 shadow-rosegold flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-2">
                        <div className={`h-24 w-full rounded-2xl ${color.bg} shadow-inner relative group overflow-hidden`}>
                          <button
                            onClick={() => copyToClipboard(color.hex, `dark_hex_${idx}`)}
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 text-white text-xs font-sans font-bold uppercase tracking-wider transition-all cursor-pointer"
                          >
                            {copiedText === `dark_hex_${idx}` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            <span>{copiedText === `dark_hex_${idx}` ? dictionary.colors.copySuccess : 'Copy Hex'}</span>
                          </button>
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xs font-sans font-bold text-slate-800 dark:text-slate-100 line-clamp-1">
                            {color.name}
                          </h4>
                          <span className="text-xs font-mono font-bold text-[#B76E79]">
                            {color.hex}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2 pt-3 border-t border-rose-100/10 text-[10px] font-mono text-slate-500">
                        <div><span className="font-sans font-bold text-slate-400">RGB:</span> {color.rgb}</div>
                        <div><span className="font-sans font-bold text-slate-400">CMYK:</span> {color.cmyk}</div>
                        <p className="font-sans italic leading-relaxed pt-2 border-t border-rose-100/5 text-slate-400 dark:text-slate-500">
                          {color.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

```

Note que este bloco usa `copyToClipboard` e `copiedText`, que já existem no componente (definidos no topo, usados pelos swatches originais) — não precisa recriá-los, só reutilizar.

- [ ] **Step 3: Verificar (build)**

```bash
npx tsc --noEmit
npm run build
```

Expected: sem erros novos.

- [ ] **Step 4: Verificar manualmente no navegador**

```bash
npm run dev
```

Abrir `http://localhost:3000`, desbloquear a área de admin (senha em `ADMIN_PASSPHRASE`, `src/App.tsx`), ir na aba "Identidade de Marca" → "Paleta & Materiais", e confirmar que a nova seção "Dark Mode — Luxo Contido" aparece abaixo da paleta clara existente, com os cinco swatches e o botão de copiar hex funcionando.

- [ ] **Step 5: Commit**

```bash
git add src/components/BrandIdentityView.tsx
git commit -m "docs(brand): documenta o sistema de dark mode na aba Paleta & Materiais"
git push origin main
```

---

## Self-Review

**Cobertura da spec:**
- Tokens de cor (`--color-ink` até `--color-ink-hairline`) → Task 1. ✓
- Classes utilitárias (`.ink-card`, `.ink-button-outline`, `.ink-input-line`) → Task 1. ✓
- Reaproveitar `--color-rosegold-light` como único acento (não criar cor nova) → Task 1 não cria uma nova variável de acento, reaproveita a existente. ✓
- Sem vidro/gradiente no dark mode → Task 1 não inclui `backdrop-filter` nem `linear-gradient` em nenhuma das três classes novas. ✓
- Botão primário como contorno → `.ink-button-outline` é `background: transparent` com borda. ✓
- Mesma tipografia, tratamento mais leve → não modelado como CSS nesta fase (a spec descreve isso como orientação para quando os componentes forem migrados na Fase 2/3, não como um token isolado); confirmar que isso é intencional — sim, a spec não pede uma classe de tipografia dedicada, só orientação textual para as fases de rollout.
- Prévia visual com frontend-design antes de aprovar → Task 2. ✓
- Documentação no BrandIdentityView → Task 3. ✓
- Nenhuma tela real muda de aparência → confirmado, nenhuma das três tasks toca `HomeView`, `DailyMissionView`, ou qualquer outro componente de tela — só `index.css` (tokens/utilitários, não aplicados a nada ainda) e `BrandIdentityView.tsx` (documentação). ✓

**Placeholders:** nenhum "TBD"/"implementar depois" — todo step tem código completo, exceto a Task 2, que é intrinsecamente colaborativa (não tem "código" porque o entregável é uma decisão de design aprovada, não um artefato de repositório) — isso está sinalizado explicitamente na nota de execução da task, não é uma lacuna acidental.

**Consistência de tipos:** os nomes de token (`--color-ink`, etc.) e classes (`.ink-card`, etc.) usados na Task 2 (prévia) e Task 3 (documentação, via hex literal) batem exatamente com os definidos na Task 1.

---

**Plan complete and saved to `docs/superpowers/plans/2026-07-31-dark-mode-tokens.md`.**

Duas opções de execução:

1. **Subagent-driven (recomendado, com uma ressalva)** — Tasks 1 e 3 vão para subagentes com revisão; a Task 2 eu (controlador) executo diretamente com você, por ser um processo de design colaborativo, não uma implementação isolada.
2. **Execução inline** — eu mesmo executo as três tasks nesta sessão, em sequência, com checkpoints pra revisão.

Qual prefere?
