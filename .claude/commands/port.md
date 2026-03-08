# /port — Portar elemento do app original para o Kcalix

## O que é este comando

O Kcalix é um port do app original (`memory/ref.aplicativo_antigo/referência.index.html`).
A metodologia é: **copiar a lógica que funciona, adaptar o invólucro**.

Não inventamos — lemos o original, extraímos o que já existe e transportamos para
a nova arquitetura (React + TypeScript + Tailwind + Supabase).

Use este comando no início de qualquer sessão de port para ter o contexto certo
e executar na ordem correta.

---

## Mapa de tradução (original → Kcalix)

| App original (JS/HTML/CSS)             | Kcalix (React + TypeScript)                        |
|----------------------------------------|----------------------------------------------------|
| Constante JS (`FOOD_DB`, `EXERCISE_DB`)| `src/data/*.ts`                                    |
| Função de cálculo (`calcAll`, etc.)    | `src/lib/calculators.ts`                           |
| `localStorage` (`saveJSON`/`loadJSON`) | Supabase via hooks (`useSettings`, `useDiary`, etc.) |
| HTML de uma view (`viewDiario`, etc.)  | `src/pages/NomePage.tsx`                           |
| Modal/sheet inline (`#foodModal`, etc.)| `src/components/NomeModal.tsx`                     |
| Tokens CSS (`:root { --accent... }`)   | `src/index.css` — já importados, apenas estender   |
| Classes CSS globais (`.kpi`, `.meal`)  | `style={{ }}` inline fiel ao original, ou CSS vars |
| `updateUI()` / DOM mutation            | Estado React (`useState`, `useCallback`)           |
| Evento `onclick` inline                | `onClick` em JSX                                   |
| `data.days[date].meals[id]`            | `diary.meals[mealKey]` via `useDiary()`            |

---

## Regras críticas desta metodologia

1. **Leia antes de escrever** — sempre abra `referência.index.html` nas linhas indicadas
   no `contexto-port.md` antes de implementar qualquer coisa.

2. **CSS fiel** — não invente estilos novos. Copie os valores exatos do original:
   `background`, `border-radius`, `font-size`, `font-weight`, `gap`, `padding`.
   Use `style={{ }}` inline quando necessário para garantir fidelidade pixel a pixel.

3. **Estado único** — nunca instancie dois `useDiary()` (ou qualquer hook de dados)
   em componentes pai/filho. O estado vive no pai e desce via props.
   Padrão correto: `DiarioPage (useDiary) → FoodDrawer (prop) → FoodPortionModal (prop)`

4. **Optimistic UI** — toda escrita no Supabase deve atualizar o estado React
   imediatamente e persistir em background sem `await` bloqueando a UI.
   Padrão: `setDiary(next)` → `.upsert(...).then(...)` (sem await no fluxo principal)

5. **Sem metas → sem barras** — KPI cards e status pills só aparecem quando há
   configuração salva. Se `target === 0`, oculte a barra (não force valor arbitrário).

6. **Gradiente escuro nos sheets** — todo bottom sheet usa
   `background: linear-gradient(180deg, #1a2035, #121828)` (igual ao `.modal-sheet`
   e `.food-drawer` do original), não `var(--bg)` plano.

7. **Accordion com estado no pai** — `openMealId` fica no componente de página,
   não dentro de cada item. Um item abre → o anterior fecha.

---

## Processo de port (execute nesta ordem)

### 1. Identificar o elemento a portar

O usuário informa o elemento (ex: "TreinoPage", "CorpoPage", "accordion de presets").
Consulte `memory/ROADMAP.md` para confirmar que está na fase correta.

### 2. Localizar no original

Consulte `memory/contexto-port.md` → seção da fase correspondente.
Abra `memory/ref.aplicativo_antigo/referência.index.html` nas linhas indicadas:

```
Mapa rápido:
- CSS tokens/globais  → linhas 24–191
- Bottom nav          → linhas 192–235
- Cards/Accordion     → linhas 346–406
- KPI / Progress      → linhas 407–501
- Meals               → linhas 563–664
- Food Drawer CSS     → linhas 933–1114
- Food Modal CSS      → linhas 1115–1317
- Home Dashboard CSS  → linhas 1407–1730
- View Home HTML      → linhas 2113–2197
- View Diário HTML    → linhas 2198–2312
- View Treino HTML    → linhas 2604–2851
- View Corpo HTML     → linhas 2526–2603
- JS: updateUI()      → linhas 3932–3992
- JS: buildMeals()    → linhas 3797–3931
- JS: FOOD_DB         → linhas 3499–3650
- JS: EXERCISE_DB     → linhas 3345–3482
- JS: calcAll/JP7     → linhas 5123–5208
- JS: FoodDrawer      → linhas 5761–6090
- JS: renderHome()    → linhas 4156–4330
- JS: HabitTracker    → linhas ~4760–5122
```

### 3. Extrair e mapear

Para cada elemento encontrado, documente:
- **Estrutura HTML** → JSX equivalente
- **CSS classes** → `style={{ }}` inline com valores exatos
- **Lógica JS** → hook ou função TypeScript equivalente
- **Dados** → onde vivem no Supabase e qual hook os expõe

### 4. Apresentar o plano

```
🔌 PORT: [Nome do elemento]

ORIGEM NO ORIGINAL:
- HTML: linhas XXXX–XXXX (viewXxx / #idXxx)
- CSS:  linhas XXXX–XXXX (classes .xxx)
- JS:   linhas XXXX–XXXX (funções xxx())

O QUE CRIAR/MODIFICAR:
- [ ] src/pages/XxxPage.tsx — [o que muda]
- [ ] src/components/Xxx.tsx — [novo componente]
- [ ] src/hooks/useXxx.ts — [novo hook, se necessário]
- [ ] src/data/xxx.ts — [nova constante, se necessário]
- [ ] supabase/migrations/xxx.sql — [se mudar schema]

ESTADO E FLUXO DE DADOS:
- [Onde vive o estado]
- [Como desce via props]
- [Qual hook persiste no Supabase]

ORDEM DE IMPLEMENTAÇÃO:
1. Constantes/dados (src/data/)
2. Hook de dados (src/hooks/)
3. Componentes filhos (src/components/)
4. Página principal (src/pages/)
5. Wiring em App.tsx (se necessário)
```

Aguarde aprovação antes de escrever código.

### 5. Implementar em ordem

- Um arquivo por vez
- A cada arquivo: ler o trecho original → escrever o equivalente React/TS
- Verificar TypeScript após cada arquivo (`npm run build`)
- Não avançar se o passo anterior tem erro

### 6. Validação

```
✅ PORT CONCLUÍDO: [Nome]

ARQUIVOS:
- Criados: [lista]
- Modificados: [lista]

FIEL AO ORIGINAL:
- [ ] Visual pixel a pixel (comparar lado a lado)
- [ ] Lógica de cálculo idêntica
- [ ] Dados persistem no Supabase
- [ ] Funciona em 375px sem overflow

PRONTO PARA: /review → /end
```

---

## Checklist de fidelidade (use em cada port)

**CSS/Visual:**
- [ ] Background dos sheets: `linear-gradient(180deg, #1a2035, #121828)`
- [ ] Handle: `36px × 4px`, `rgba(255,255,255,.15)`
- [ ] Tokens: `--pColor`, `--cColor`, `--gColor` usados para macros
- [ ] Botões circulares com `44px` (toque mínimo)
- [ ] `font-family: var(--font)` em todos os botões/inputs
- [ ] `border: 1px solid var(--line)` nos cards e modais

**React/Estado:**
- [ ] Estado de abertura de accordion/modal no componente pai
- [ ] Callbacks de mutação passados via props (não re-instanciar hooks)
- [ ] `addFoodOptimistic` / equivalente: atualiza estado → persiste em background

**TypeScript:**
- [ ] Nenhum `any` — usar tipos específicos ou `unknown`
- [ ] Build limpo (`npm run build`) antes de marcar como concluído

$ARGUMENTS
