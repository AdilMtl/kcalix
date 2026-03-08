# Kcalix — Contexto Tecnico do Port
**Referencia:** `memory/ref.aplicativo_antigo/referencia.index.html` (~6200 linhas, app original completo)
**Objetivo:** Dar contexto suficiente para qualquer sessao nova portar features sem ler o app original do zero.
**Regra de ouro:** Copie a logica, adapte o involucro.

---

## Como usar este arquivo

Antes de implementar qualquer fase (2, 3, 4, 5), leia a secao correspondente aqui. Ela explica:
- O que existe no app original e onde (numero de linha exato)
- Quais dados sao salvos e em que formato
- Quais funcoes/constantes copiar/adaptar
- Como mapear para React + Supabase

---

## Mapa do arquivo original (referencia.index.html)

```
Linhas 1-2091     CSS global
Linhas 2092-3141  HTML (estrutura das views e modais)
Linhas 3142-6200  JavaScript (IIFE unica)
```

### Secoes do CSS (comentarios ════ no arquivo)
| Secao CSS              | Linha aprox. | Componente React alvo        |
|------------------------|--------------|------------------------------|
| TOKENS                 | 24           | src/index.css (vars CSS)     |
| BOTTOM NAV             | 192          | Nav.tsx                      |
| CARDS                  | 346          | ui/Card.tsx                  |
| ACCORDION              | 367          | ui/Accordion.tsx             |
| KPI / PROGRESS         | 407          | DiarioPage (cards de macro)  |
| PRESETS                | 502          | DiarioPage (presets)         |
| MEALS                  | 563          | DiarioPage (meal list)       |
| FOOD PANEL             | 816          | FoodDrawer.tsx               |
| FOOD DRAWER            | 933          | FoodDrawer.tsx               |
| HOME DASHBOARD         | 1407         | HomePage.tsx                 |
| HABIT TRACKER          | 1731         | HabitTracker (Fase 4)        |

### Secoes do HTML (views e modais)
| View/Modal             | ID HTML           | Linha aprox. | Pagina React         |
|------------------------|-------------------|--------------|----------------------|
| View Home              | viewHome          | 2113         | HomePage.tsx         |
| View Diario            | viewDiario        | 2198         | DiarioPage.tsx       |
| View Mais              | viewMais          | 2313         | MaisPage.tsx         |
| View Corpo             | viewCorpo         | 2526         | CorpoPage.tsx        |
| View Treino            | viewTreino        | 2604         | TreinoPage.tsx       |
| Food Drawer            | foodDrawer        | 2852         | FoodDrawer.tsx       |
| Food Modal (porcao)    | foodModal         | 3008         | FoodPortionModal.tsx |
| Bottom Nav             | .bottom-nav       | 3116         | Nav.tsx              |
| Calc Wizard            | calcWizard        | 3145         | (Fase 4 — MaisPage)  |
| Profile Check-in       | profileCheckinModal| 2897        | (Fase 4)             |

### Secoes do JavaScript
| Secao JS               | Linha aprox. | Equivalente React              |
|------------------------|--------------|-------------------------------|
| CONSTANTS/KEYS         | 3331         | (storage keys do app antigo)  |
| EXERCISE_DB            | 3345         | src/data/exerciseDb.ts        |
| CARDIO_TYPES           | 3483         | src/data/exerciseDb.ts        |
| DEFAULT_TEMPLATES      | 3492         | src/data/exerciseDb.ts        |
| FOOD_DB                | 3499         | src/data/foodDb.ts            |
| DEFAULT_SETTINGS       | 3651         | src/store/settingsStore.ts    |
| DEFAULT_CALC           | 3657         | src/lib/calculators.ts        |
| MEALS (array)          | 3665         | src/data/meals.ts             |
| DEFAULT_PRESETS        | 3674         | src/data/presets.ts           |
| UTILS (round1, fmt)    | 3699         | src/lib/utils.ts              |
| MEALS BUILD            | 3797         | DiarioPage.tsx                |
| updateUI               | 3932         | DiarioPage.tsx (estado local) |
| PRESETS logic          | 3994         | DiarioPage.tsx                |
| ENERGY ANALYTICS       | 4156         | HomePage.tsx                  |
| renderEnergyCard       | 4203         | HomePage.tsx                  |
| renderWeekEnergyChart  | 4266         | HomePage.tsx                  |
| CALC (JP7 + Siri)      | 5123         | src/lib/calculators.ts        |
| FOOD PANEL             | 5761         | FoodDrawer.tsx                |
| foodToBlocks           | 5789         | FoodDrawer.tsx                |
| getRecentFoods         | 5805         | useDiary.ts                   |
| renderCatTabs          | 5825         | FoodDrawer.tsx                |
| renderFoodGrid         | 5860         | FoodDrawer.tsx                |
| openFoodDrawer         | 5964         | FoodDrawer.tsx                |
| openFoodModal          | 5996         | FoodPortionModal.tsx          |
| addFoodToMeal          | 6041         | FoodPortionModal.tsx          |
| HABIT TRACKER          | ~4760        | (Fase 4)                      |

---

## Storage Keys do app original (para migracao Fase 5)

```typescript
STORAGE_KEY       = "blocos_tracker_v6"          // dados do diario (meals por dia)
AUTO_KEY          = "blocos_tracker_autosave_v6"
SETTINGS_KEY      = "blocos_tracker_settings_v6" // metas, bloco config
CALC_KEY          = "blocos_tracker_calc_v6"      // perfil nutricional (JP7)
MEASURE_KEY       = "blocos_tracker_measure_v6"   // medicoes corporais
CUSTOM_FOODS_KEY  = "blocos_tracker_custom_foods_v1"
FOOD_LOG_KEY      = "blocos_tracker_food_log_v1"  // log de alimentos por dia
TREINO_KEY        = "blocos_tracker_treino_v1"
TREINO_TMPL_KEY   = "blocos_tracker_treino_templates_v1"
CUSTOM_EX_KEY     = "blocos_tracker_custom_exercises_v1"
PRESETS_KEY       = "blocos_tracker_presets_v1"
CHECKINS_KEY      = "blocos_tracker_checkins_v1"
```

---

## Estrategia geral de port

```
App original (JS)                  Kcalix (React + TypeScript)
────────────────                   ──────────────────────────
Constante (FOOD_DB, EXERCISE_DB) → src/data/*.ts
Funcao de calculo (calcAll, etc) → src/lib/calculators.ts
localStorage (saveJSON/loadJSON) → Supabase via hooks (useSettings, useDiary, etc.)
HTML de uma view                 → src/pages/NomePage.tsx
Modal inline                     → src/components/NomeModal.tsx
CSS global (tokens, classes)     → Tailwind + tokens CSS em src/index.css
```

---

## FASE 2 — Home e Diario

### Modelo de dados original (localStorage blocos_tracker_v6)

O app original armazena **blocos** (unidades de macro), NAO gramas diretas.
Cada refeicao tem `{ p: number, c: number, g: number }` onde p/c/g sao quantidades de BLOCOS.

```typescript
// Dia no app original:
{
  "2026-03-07": {
    preset: "seg" | null,
    meals: {
      cafe:    { p: 1.0, c: 1.0, g: 0.0 },  // blocos, nao gramas
      lanche1: { p: 0.0, c: 0.0, g: 0.0 },
      almoco:  { p: 2.0, c: 2.0, g: 0.5 },
      lanche2: { p: 1.0, c: 1.0, g: 0.0 },
      jantar:  { p: 2.0, c: 2.0, g: 0.5 },
      ceia:    { p: 0.0, c: 0.0, g: 0.0 },
    }
  }
}
```

O Kcalix v3 armazena gramas diretas no Supabase (campo `data` JSONB em `diary_entries`).
A conversao acontece em `foodToBlocks()` ao adicionar um alimento via FoodDrawer.

### FOOD_DB — array completo (linha 3499 do original)

9 categorias, 109+ alimentos brasileiros. Cada item:
```typescript
{
  id: string,         // ex: "frango_grelhado"
  nome: string,       // ex: "Frango grelhado (peito)"
  porcao: string,     // ex: "100g" (label para display)
  porcaoG: number,    // peso da porcao padrao em gramas
  p: number,          // proteina em gramas por porcao
  c: number,          // carboidrato em gramas por porcao
  g: number,          // gordura em gramas por porcao
  kcal: number        // kcal por porcao
}
```

Categorias (linha 3501):
- "Paes, Cereais & Raizes" — 16 itens
- "Carnes & Proteinas" — 17 itens
- "Proteicos & Laticinios" — 18 itens
- "Legumes & Vegetais" — 15 itens
- "Oleaginosas" — 10 itens
- "Doces & Snacks" — 19 itens
- "Fast-food" — 16 itens
- "Bebidas" — 8 itens
- "Frutas" — 11 itens

### MEALS — 6 refeicoes (linha 3665 do original)

```typescript
const MEALS = [
  { id: "cafe",    name: "☕ Cafe" },
  { id: "lanche1", name: "🕘 Lanche 1" },
  { id: "almoco",  name: "🍛 Almoco" },
  { id: "lanche2", name: "🕓 Lanche 2" },
  { id: "jantar",  name: "🍽️ Jantar" },
  { id: "ceia",    name: "🌙 Ceia" },
];
```

### Como o Diario funciona no original (CRITICO para port fiel)

**Estrutura visual da DiarioPage original (HTML linha 2198):**
1. Card de Presets (accordion "Presets por dia" + "Referencia de blocos")
2. Preset suggestion bar (aparece ao clicar preset)
3. Card de Progresso com:
   - Banner de dia editado (ao navegar para dias passados)
   - KPI grid 3 colunas: P / C / G com barra de progresso colorida e indicador no topo
   - Status pills (spill): "P +1.2", "C -0.5" etc em pills com dot colorido
   - Linha de kcal estimadas (gradiente roxo→verde, estilo especial)
   - Botao "Adicionar alimentos" (abre FoodDrawer)
   - meal-list: 6 refeicoes como accordion expandivel

**Estrutura de cada meal (linha 3803):**
```html
<div class="meal"> <!-- accordion -->
  <div class="meal-header"> <!-- clica para expandir -->
    <span class="mh-name">☕ Cafe</span>
    <span class="mh-summary">1.0P · 1.0C · 0.0G</span>  <!-- resumo em blocos -->
  </div>
  <div class="meal-body"> <!-- expandido -->
    <div class="macro-row"> <!-- grid 3 colunas -->
      <div class="macro-field pf"> <!-- campo P com label colorido -->
        <label>P</label>
        <input inputmode="decimal" placeholder="0" />
        <span class="preset-hint"> <!-- hint do preset -->
      </div>
      <!-- idem C e G -->
    </div>
    <div class="quick-row"> <!-- botoes rapidos +.5P +1P +.5C etc -->
    </div>
  </div>
</div>
```

**Logica de updateUI (linha 3932):**
- Atualiza summary de cada meal ("1.0P · 1.0C · 0.0G")
- Atualiza meta line ("Meta: P 152g · C 228g · G 31g (~1800 kcal)")
- Atualiza KPI values e barras (pBar, cBar, gBar) com clamp 0-100%
- Define --kpi-fill (indicador colorido no topo de cada KPI card)
- Muda cor das barras se >105% (overeat)
- Calcula kcal: p * kcalPerBlock.p + c * kcalPerBlock.c + g * kcalPerBlock.g
- Renderiza status pills com makeStatusPill()

**makeStatusPill (linha 3915):**
```javascript
// diff = valor - meta; "Falta" se diff < -0.6, "Passou" se diff > 0.6
const pill = `<span class="spill"><span class="sdot ${cls}"></span>P ${diff>0?"+":""}${diff.toFixed(1)}</span>`
```

### Food Log — log separado dos blocos (IMPORTANTE)

O app original tem DOIS stores:
1. `blocos_tracker_v6` — blocos por refeicao (o que e exibido nos inputs P/C/G)
2. `blocos_tracker_food_log_v1` — lista de alimentos adicionados por dia (para o "peek" e para remocao)

**Entrada no food log (linha 6057):**
```typescript
{
  foodId: string,       // id do alimento na FOOD_DB
  nome: string,         // nome para display
  qty: number,          // quantidade de porcoes
  mealId: string,       // qual refeicao recebeu
  pG: number,           // gramas de proteina adicionados
  cG: number,           // gramas de carbo
  gG: number,           // gramas de gordura
  pBlocks: number,      // blocos P equivalentes (o que foi somado nos inputs)
  cBlocks: number,
  gBlocks: number,
  kcal: number,
  at: string            // ISO timestamp (para ordenar recentes)
}
```

**foodToBlocks (linha 5789):**
```javascript
// Converte gramas do alimento para blocos
const pG = round1(food.p * qty);       // gramas de P = p_por_porcao * qtd_porcoes
const pBlocks = round1(pG / settings.blocks.pG);  // blocos = gramas / gramas_por_bloco
```

**getRecentFoods (linha 5805):**
Ultimo 10 alimentos unicos adicionados, ordenados por `entry.at` desc.

### Food Drawer — estrutura e comportamento (linha 5964)

**HTML do drawer (linha 2852):**
```
.food-drawer (88dvh, bottom sheet, translateY animation)
  .fd-handle
  .fd-header  "Adicionar alimentos" + botao fechar
  .fd-search-wrap  input com icone 🔍 e botao limpar
  .fd-cat-tabs  abas: [Recentes] [Todos] [categoria1] [categoria2]...
  .fd-grid  lista de alimentos (flex-direction:column, flex:1, overflow-y:auto)
  .fd-custom-row  "Criar alimento personalizado"
  .fd-peek  "Adicionados hoje · X itens" (expandivel)
    .fd-log  lista de itens adicionados hoje com botao remover
```

**CSS critico do drawer (linha 933):**
- `.food-drawer`: height 88dvh, background linear-gradient(#1a2035, #121828)
- `.food-drawer.open`: transform translateY(0) — animacao .3s cubic-bezier(.32,.72,0,1)
- `.fd-grid`: flex:1, overflow-y:auto (scroll interno, nao a pagina toda)
- `.fd-cat-tabs`: overflow-x:auto, scrollbar-width:none (scroll horizontal sem scrollbar)

**CSS dos itens da lista (.food-item, linha 886):**
```css
.food-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 12px;
  background: var(--surface); border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  cursor: pointer; transition: all .12s;
}
.fi-info { flex: 1; min-width: 0; }
.fi-name { font-size: 13px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.fi-portion { font-size: 10px; color: var(--text3); font-weight: 600; }
.fi-macros { display: flex; gap: 8px; font-size: 10px; font-weight: 700; flex-shrink: 0; }
.fi-macros .fp { color: var(--pColor); }   /* #f87171 */
.fi-macros .fc { color: var(--cColor); }   /* #fbbf24 */
.fi-macros .fg { color: var(--gColor); }   /* #34d399 */
.fi-macros .fk { color: var(--text3); }    /* kcal em cinza */
```

**Food Modal (porcao) — HTML linha 3008:**
```html
<div class="modal-sheet" id="foodModal" style="z-index:316;">
  <div class="modal-handle"></div>
  <div class="modal-header">
    <b id="fmName">Frango grelhado</b>
    <button class="modal-close">✕</button>
  </div>
  <div class="modal-body">
    <div class="qty-label" id="fmPortion">100g × 1</div>
    <div class="qty-row">
      <button class="qty-btn qty-sm">−.5</button>
      <button class="qty-btn qty-sm">−.1</button>
      <input class="qty-input" type="number" min="0.1" step="0.1" value="1" />
      <button class="qty-btn qty-sm">+.1</button>
      <button class="qty-btn qty-sm">+.5</button>
    </div>
    <!-- .modal-macros: 4 caixas P/C/G/kcal -->
    <div class="hint">Adicionar a refeicao:</div>
    <div class="meal-select-row">  <!-- botoes de selecao de refeicao -->
    </div>
    <button class="btn primary" id="fmAdd">Adicionar</button>
  </div>
</div>
```

**Logica addFoodToMeal (linha 6041):**
1. Chama `foodToBlocks(food, qty)` para calcular gramas e blocos
2. Soma blocos na refeicao: `meal.p += calc.pBlocks`
3. Adiciona entrada no food log com todos os detalhes
4. Salva ambos os stores
5. Chama fillInputsFromState() + updateUI()
6. Fecha modal, mostra toast

### Calculadoras (linha 5123)

```javascript
bodyDensityJP7(sex, age, sum7):
  // male:   1.112 - 0.00043499*s + 0.00000055*s*s - 0.00028826*age
  // female: 1.097 - 0.00046971*s + 0.00000056*s*s - 0.00012828*age

bfSiri(density): (495 / density) - 450

bmrMifflin(sex, weightKg, heightCm, age):
  // base = 10*w + 6.25*h - 5*age
  // male: base + 5  /  female: base - 161

bmrKatch(leanKg): 370 + 21.6 * leanKg
```

### GOAL_PRESETS e WZ_ACTIVITY_LABELS

```javascript
// Em calcAll/wizard (linha ~4600)
const GOAL_PRESETS = {
  maintain: { def: 0,  pKg: 1.6, cKg: 3.0, minFatKg: 0.6, hint: "..." },
  cut:      { def: 22, pKg: 2.2, cKg: 2.0, minFatKg: 0.6, hint: "..." },
  recomp:   { def: 10, pKg: 2.0, cKg: 2.0, minFatKg: 0.6, hint: "..." },
  bulk:     { def: -10, pKg: 1.6, cKg: 3.5, minFatKg: 0.8, hint: "..." },
};

const WZ_ACTIVITY_LABELS = {
  "1.2":   "Sedentario — trabalho sentado",
  "1.375": "Levemente ativo — caminhadas",
  "1.55":  "Moderadamente ativo",
  "1.725": "Bastante ativo",
  "1.9":   "Muito ativo — trabalho fisico",
};
```

### Energy Analytics — Home (linha 4156)

`getEnergyForDate(date)` retorna:
```typescript
{
  consumed: number,   // soma de todos os blocos × kcalPerBlock
  bmr: number|null,   // BMR calculado (null se perfil nao configurado)
  tdee: number|null,  // bmr × activity
  exercise: number,   // kcal do treino daquele dia
  total: number|null, // bmr + exercise (base para o balance)
  balance: number|null // consumed - total (negativo = deficit, positivo = superavit)
}
```

`renderEnergyCard()` (linha 4203):
- Sem BMR: mostra so "kcal in" + mensagem para configurar JP7
- Com BMR: 4 KPIs — kcal in / basal / treino / saldo (saldo em verde se negativo = deficit)
- Barra consumido vs meta kcal

`renderWeekEnergyChart()` (linha 4266):
- Calcula Seg da semana atual
- Itera 7 dias (Seg→Dom)
- Para cada dia: `getEnergyForDate(iso)` para consumed e total (BMR+treino)
- Normaliza altura das barras pelo max valor
- Renderiza barras SVG-like com label P/C/G e linha de meta

---

## FASE 3 — Treino

### EXERCISE_DB (linha 3345)

9 grupos musculares, 70+ exercicios. Estrutura:
```typescript
{
  "Peito": [
    { id: "supino_reto", nome: "Supino reto (barra)" },
    ...
  ],
  ...
}
```

Grupos: Peito, Costas, Quad, Posterior, Gluteos, Ombros, Biceps, Triceps, Core

### EX_SECONDARY (linha 3401)
Mapa de exercicio → grupos secundarios (para analytics de volume muscular)

### MUSCLE_LANDMARKS (linha 3460)
```javascript
{
  "Peito":     { mev:10, mav:15, mrv:25 },
  "Costas":    { mev:10, mav:15, mrv:25 },
  "Quad":      { mev: 8, mav:15, mrv:25 },
  "Posterior": { mev: 6, mav:12, mrv:20 },
  "Gluteos":   { mev:15, mav:20, mrv:30 },
  "Ombros":    { mev: 6, mav:12, mrv:20 },
  "Biceps":    { mev: 6, mav:12, mrv:20 },
  "Triceps":   { mev: 6, mav:12, mrv:20 },
  "Core":      { mev: 4, mav:10, mrv:16 },
}
```

### CARDIO_TYPES (linha 3483)
```javascript
[
  { id:"bicicleta", nome:"Bicicleta", kcalMin:7 },
  { id:"bicicleta_intensa", nome:"Bicicleta (intensa)", kcalMin:10 },
  { id:"esteira_caminhada", nome:"Caminhada (esteira)", kcalMin:4.5 },
  { id:"esteira_corrida", nome:"Corrida (esteira)", kcalMin:10 },
  { id:"caminhada_rua", nome:"Caminhada ar livre", kcalMin:4 },
  { id:"corrida_rua", nome:"Corrida ar livre", kcalMin:11 },
  { id:"eliptico", nome:"Eliptico / Transport", kcalMin:8 },
  { id:"escada", nome:"Escada", kcalMin:9 },
  { id:"pular_corda", nome:"Pular corda", kcalMin:12 },
  { id:"remo", nome:"Remo", kcalMin:8.5 },
  { id:"outro_cardio", nome:"Outro", kcalMin:6 },
]
```

### DEFAULT_TEMPLATES (linha 3492)
4 treinos padrao: A (Peito+Biceps+Abdomen), B (Costas+Triceps+Abdomen), C (Pernas+Ombros+Abdomen), Alt (Peito+Costas+Bracos).

### Modelo de dados do treino (localStorage blocos_tracker_treino_v1)
```typescript
{
  days: {
    "2026-03-07": {
      templateId: "treino_a",
      exercicios: [
        {
          exercicioId: "supino_reto",
          series: [{ reps: "10", carga: "65" }]
        }
      ],
      cardio: [{ tipo: "bicicleta", minutos: 20, kcalPerMin: 7 }],
      nota: "Bom treino",
      kcal: 187,
      savedAt: "2026-03-07T18:30:00Z"
    }
  }
}
```

---

## FASE 4 — Corpo, Habitos, Mais

### Modelo de dados de medidas (localStorage blocos_tracker_measure_v6)
```typescript
{
  days: {
    "2026-03-07": {
      weightKg: 76.0,
      waistCm: 85.0,
      bfPct: 18.9,     // opcional
      note: "...",
      skinfolds: {      // opcional
        chest, ax, tri, sub, ab, sup, th  // mm
      }
    }
  }
}
```

### Habitos (linha ~4760, localStorage blocos_tracker_habits_v1)
5 habitos fixos: dieta, log, treino, cardio, medidas
```typescript
{
  "2026-03-07": {
    dieta: true,
    log: true,
    treino: false,
    cardio: false,
    medidas: false
  }
}
```

### Calc Wizard (HTML linha 3145, JS linha 4600)
4 passos: dados basicos → dobras JP7 → objetivo → atividade
Outputs: BMR, TDEE, kcal alvo, P/C/G em gramas

---

## Tokens CSS do app original (replicar em src/index.css)

```css
:root {
  --bg: #0a0e18;
  --surface: rgba(255,255,255,.04);
  --surface2: rgba(255,255,255,.07);
  --surface3: rgba(255,255,255,.10);
  --text: #f0f4ff;
  --text2: #a0b4d8;
  --text3: #6b82a8;
  --accent: #7c5cff;
  --accent2: #a78bfa;
  --good: #34d399;
  --warn: #fbbf24;
  --bad: #f87171;
  --pColor: #f87171;   /* proteina = vermelho */
  --cColor: #fbbf24;   /* carbo = amarelo */
  --gColor: #34d399;   /* gordura = verde */
  --line: rgba(255,255,255,.06);
  --radius: 16px;
  --radius-sm: 12px;
  --radius-xs: 8px;
  --shadow: 0 8px 32px rgba(0,0,0,.4);
  --font: 'DM Sans', ui-sans-serif, system-ui, -apple-system, sans-serif;
  --safe-bottom: env(safe-area-inset-bottom, 0px);
}
```

**Background ambient glow (linha 62):**
```css
body::before { /* glow roxo no canto superior esquerdo */
  position: fixed; top: -200px; left: -100px;
  width: 500px; height: 500px;
  background: radial-gradient(circle, rgba(124,92,255,.15) 0%, transparent 70%);
}
body::after { /* glow verde no canto superior direito */
  position: fixed; top: -100px; right: -150px;
  width: 400px; height: 400px;
  background: radial-gradient(circle, rgba(52,211,153,.08) 0%, transparent 70%);
}
```

---

## Problemas conhecidos na implementacao atual (Kcalix v0.3.0)

### DiarioPage.tsx — o que esta errado vs original

1. **Estrutura visual incorreta:** O original tem os meals dentro do Card de Progresso (abaixo dos KPIs e status pills). No v0.3.0 estao em cards separados.

2. **KPI cards nao fieis:** O original usa `.kpi-grid` (3 colunas) com indicador colorido no TOPO de cada card (`--kpi-fill` via CSS custom property), barra de progresso dentro e valor "X.X / meta" em dois estilos de fonte diferentes. O v0.3.0 tem barras mas nao o mesmo visual.

3. **Status pills ausentes:** O original tem `.status-pills` com `.spill` (pill com dot colorido e diff "P +1.2"), indicando desvio em relacao a meta. NAO implementado no v0.3.0.

4. **Kcal estimadas sem estilo:** O original tem `.kcal-inline-row` com `.kcal-inline-num` em gradiente roxo→verde e `.kcal-inline-unit` separado. Simples texto no v0.3.0.

5. **Meal summary em blocos:** O original mostra "1.0P · 1.0C · 0.0G" no header colapsado. O v0.3.0 mostra gramas de forma inconsistente.

6. **Meals sao accordion:** No original apenas 1 meal abre por vez (`openMealId`). Clicar no mesmo fecha. O v0.3.0 pode ter comportamento diferente.

7. **Quick buttons (+.5P +1P etc):** O original tem botoes rapidos dentro de cada meal expandido. NAO implementado no v0.3.0.

8. **Adicao lenta (otimistic update ausente):** Original e sincrono (localStorage). No v0.3.0 o upsert Supabase bloqueia a UI. Precisa atualizar estado local imediatamente e persistir em background.

9. **FoodPortionModal — quantidade incorreta:** O original aceita min 0.1, step 0.1. O v0.3.0 tem clamp de 0.5 que impede quantidades menores.

10. **FoodDrawer — peek de itens adicionados:** O original tem `.fd-peek` (secao colapsavel no rodape do drawer mostrando itens adicionados hoje com botao remover). NAO implementado no v0.3.0.

11. **FoodDrawer — botao Criar alimento personalizado:** Linha 2867 no original. NAO implementado no v0.3.0.

### HomePage.tsx — o que esta errado vs original

1. **Energy card sem grafico semanal real:** O original le todos os 7 dias da semana atual com `getEnergyForDate()`. O v0.3.0 so mostra o dia atual.

2. **Background glow ausente:** Os pseudo-elementos `body::before` e `body::after` do original nao estao em index.css.

---

## Ordem de implementacao — Sessao 2C (polish DiarioPage + FoodDrawer)

Prioridade para fidelidade ao original:

1. **FIX urgente: otimistic update no addFoodToMeal**
   - Atualizar estado React imediatamente ao adicionar alimento
   - Persistir no Supabase em background (sem await no render path)

2. **FIX: FoodPortionModal — min 0.1, step 0.1**
   - Input `min="0.1" step="0.1"` (igual ao original linha 3021)
   - Botoes: −.5 / −.1 / +.1 / +.5 (igual ao original linha 3019)

3. **IMPROVE: DiarioPage — KPI cards fieis ao original**
   - `.kpi-grid` 3 colunas com `--kpi-fill` no topo (barra colorida superior)
   - `.kpi-value`: num grande (font-size 20px font-weight 800) + den pequeno
   - `.kpi-bar` interno com `.kpi-bar-fill` colorida por macro

4. **IMPROVE: DiarioPage — status pills**
   - `.status-pills` com `.spill` (pill com dot colorido + diff formatado)

5. **IMPROVE: DiarioPage — kcal estimadas com estilo**
   - `.kcal-inline-row` com gradient text no numero

6. **IMPROVE: DiarioPage — meals como accordion fiel**
   - Apenas 1 aberto por vez
   - Summary em blocos no header colapsado
   - Quick buttons dentro do expanded

7. **IMPROVE: FoodDrawer — fd-peek (itens adicionados hoje)**
   - Secao no rodape mostrando alimentos adicionados com botao remover

---

## Notas de implementacao importantes

- **font-size >= 16px nos inputs** — evita zoom automatico no iOS (regra critica do original)
- **z-index: nav=100, modals >= 301** — modais nao ficam atras da bottom nav
- **-webkit-tap-highlight-color: transparent** — em todos botoes/interativos
- **88dvh** para bottom sheets fullscreen (drawer, modais grandes)
- **safe-area-inset-bottom** na bottom nav
- **transition: transform .3s cubic-bezier(.32,.72,0,1)** para drawers/modais
- **overscroll-behavior: contain** no scroll interno de modais
- **scrollbar-width: none** nas cat-tabs (scroll horizontal sem scrollbar visivel)
