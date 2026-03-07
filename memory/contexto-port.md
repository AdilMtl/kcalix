# Kcalix — Contexto Técnico do Port
**Referência:** `Desktop/Development/blocos-tracker/index.html` (9.147 linhas, v2.11.0)
**Objetivo deste arquivo:** Dar contexto suficiente para qualquer sessão nova portar features sem precisar ler o app original do zero.

---

## Como usar este arquivo

Antes de implementar qualquer fase (2, 3, 4, 5), leia a seção correspondente aqui. Ela explica:
- O que existe no app original e onde
- Quais dados são salvos e em que formato
- Quais funções/constantes copiar/adaptar
- Como mapear para React + Supabase

A lógica do app original é **boa e está testada** — o objetivo do port é preservá-la, não reescrevê-la. Mudança de estrutura (single-file → componentes), não de lógica.

---

## Estratégia geral de port

```
App original (index.html)          Kcalix (React)
─────────────────────────          ──────────────
Constante JS (FOOD_DB, etc.)  →    src/data/*.ts (arquivo de dados TypeScript)
Função de cálculo (calcAll)   →    src/lib/calculators.ts (função pura)
localStorage (saveJSON/load)  →    Supabase via hook useSync.ts
HTML de uma aba               →    src/pages/NomePage.tsx
Modal inline                  →    src/components/NomeModal.tsx
CSS global                    →    Tailwind classes + tokens CSS em index.css
```

**Regra de ouro:** Copie a lógica, adapte o invólucro.

---

## Storage Keys do app original

Essas são as chaves exatas do localStorage. O exportador (Fase 5) vai ler todas elas.

```typescript
// Diário e configurações
STORAGE_KEY       = "blocos_tracker_v6"          // treinos do dia (legado)
AUTO_KEY          = "blocos_tracker_autosave_v6"
SETTINGS_KEY      = "blocos_tracker_settings_v6" // metas, prefs gerais
CALC_KEY          = "blocos_tracker_calc_v6"      // perfil nutricional (calc JP7)
MEASURE_KEY       = "blocos_tracker_measure_v6"   // medições corporais
CUSTOM_FOODS_KEY  = "blocos_tracker_custom_foods_v1"
FOOD_LOG_KEY      = "blocos_tracker_food_log_v1"  // diário de alimentos por dia

// Treino
TREINO_KEY        = "blocos_tracker_treino_v1"    // sessões de treino
TREINO_TMPL_KEY   = "blocos_tracker_treino_templates_v1"
CUSTOM_EX_KEY     = "blocos_tracker_custom_exercises_v1"
TIMER_PRESETS_KEY = "blocos_tracker_timer_presets_v1"

// Hábitos e check-ins
HABITS_KEY        = "blocos_tracker_habits_v1"
CHECKINS_KEY      = "blocos_tracker_checkins_v1"
```

**Mapeamento para Supabase (tabelas criadas na Fase 1):**
| localStorage | Tabela Supabase |
|---|---|
| `SETTINGS_KEY` + `CALC_KEY` | `user_settings` (campo `data` JSONB) |
| `FOOD_LOG_KEY` | `diary_entries` (1 linha por dia) |
| `TREINO_KEY` | `workouts` |
| `TREINO_TMPL_KEY` | `workout_templates` |
| `MEASURE_KEY` | `body_measurements` |
| `HABITS_KEY` | `habits` |
| `CHECKINS_KEY` | `checkins` |
| `CUSTOM_EX_KEY` | `custom_exercises` |

---

## FASE 2 — Home e Diário

### 2A — Estrutura da Home (dashboard de energia)

**O que mostra:**
- Kcal consumidas no dia vs meta (`kcalTarget`)
- Balanço: `consumido - (BMR + kcalTreino)` → positivo = superávit, negativo = déficit
- Barra de progresso macro (proteína, carbo, gordura)
- Card de hábitos do dia (checkboxes)
- Gráfico semanal de energia (últimos 7 dias)

**Fonte dos dados:**
- Meta calórica: `CALC_KEY` → `calc.kcalTarget` (calculado por `calcAll()`)
- Consumo do dia: `FOOD_LOG_KEY` → `log[dataHoje].meals` → soma de kcal
- Hábitos: `HABITS_KEY` → `habits.days[dataHoje]`

**Para o port:**
1. Criar `src/hooks/useDiary.ts` — lê `diary_entries` do Supabase para o dia atual
2. Criar `src/hooks/useSettings.ts` — lê `user_settings` (metas, calc)
3. `HomePage.tsx` consome esses dois hooks e renderiza os cards

**Função chave a portar (`src/lib/calculators.ts`):**
```typescript
// Cálculo de BMR — duas fórmulas dependendo de ter ou não dobras cutâneas
export function bmrMifflin(sex: string, weightKg: number, heightCm: number, age: number) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age
  return sex === 'female' ? base - 161 : base + 5
}
export function bmrKatch(leanKg: number) {
  return 370 + 21.6 * leanKg
}
export function bodyDensityJP7(sex: string, age: number, sum7: number) {
  const s = sum7
  if (sex === 'female') return 1.097 - 0.00046971*s + 0.00000056*s*s - 0.00012828*age
  return 1.112 - 0.00043499*s + 0.00000055*s*s - 0.00028826*age
}
export function bfSiri(density: number) { return (495 / density) - 450 }
```

**Presets de objetivo (copiar exato para `src/data/goalPresets.ts`):**
```typescript
export const GOAL_PRESETS = {
  maintain: { def: 0,   pKg: 1.6, cKg: 3.0, minFatKg: 0.6, hint: "Sem déficit — manter o peso atual." },
  cut:      { def: 22,  pKg: 2.2, cKg: 2.5, minFatKg: 0.6, hint: "Déficit ~22% com proteína elevada." },
  recomp:   { def: 10,  pKg: 2.2, cKg: 3.0, minFatKg: 0.7, hint: "Déficit leve + proteína alta." },
  bulk:     { def: -10, pKg: 1.6, cKg: 4.0, minFatKg: 0.8, hint: "Superávit +10% para síntese muscular." },
} as const
export type GoalType = keyof typeof GOAL_PRESETS

export const WZ_ACTIVITY_LABELS: Record<string, string> = {
  "1.2":   "Sedentário",
  "1.375": "Levemente ativo",
  "1.55":  "Moderadamente ativo",
  "1.725": "Bastante ativo",
  "1.9":   "Muito ativo",
}
```

---

### 2B — Diário de Alimentos

**Estrutura de dados do dia (FOOD_LOG_KEY):**
```json
{
  "2026-03-07": {
    "meals": {
      "cafe":   [{ "foodId": "pao_frances", "nome": "Pão francês", "qty": 1, "porcaoG": 50, "p": 4.0, "c": 29.0, "g": 1.5, "kcal": 146 }],
      "almoco": [],
      "jantar": [],
      "snack":  []
    },
    "totals": { "p": 0, "c": 0, "g": 0, "kcal": 0 },
    "kcalTreino": 0
  }
}
```

**Para o Supabase:** cada linha em `diary_entries` tem `date` (DATE) e `data` (JSONB com a estrutura acima).

**FOOD_DB — banco de alimentos (9.500+ linhas no index.html, linha ~3500):**
Extrair para `src/data/foodDb.ts`. A estrutura é:
```typescript
export interface FoodItem {
  id: string
  nome: string
  porcao: string   // ex: "1 un (50g)"
  porcaoG: number  // gramas da porção padrão
  p: number        // proteína
  c: number        // carboidrato
  g: number        // gordura
  kcal: number
}
export type FoodDB = Record<string, FoodItem[]> // chave = categoria com emoji
```

**Categorias do FOOD_DB:**
- "🍞 Pães, Cereais & Raízes"
- "🥩 Carnes & Ovos"
- "🥛 Laticínios"
- "🥦 Vegetais & Legumes"
- "🍎 Frutas"
- "🫘 Leguminosas"
- "🫙 Gorduras & Azeites"
- "🍫 Lanches & Industrializados"
- "🥤 Bebidas"
- "💪 Suplementos"

**Componentes a criar:**
- `src/components/FoodDrawer.tsx` — bottom sheet 88dvh, busca, abas por categoria, "Recentes"
- `src/components/FoodPortionModal.tsx` — ajuste de quantidade com botões ±1/±5

**Aba "Recentes":** últimos 10 alimentos únicos por foodId — implementar com `getRecentFoods()` que varre o histórico do `diary_entries` recente.

---

## FASE 3 — Treino

### Estrutura de dados de treino (TREINO_KEY)

```json
{
  "workouts": [
    {
      "id": "uuid",
      "date": "2026-03-07",
      "templateId": "treino_a",
      "exercises": [
        {
          "exId": "supino_reto",
          "nome": "Supino reto (barra)",
          "grupo": "🏋️ Peito",
          "secundarios": ["💪 Tríceps", "💪 Ombros"],
          "series": [
            { "reps": 12, "carga": 60, "obs": "" },
            { "reps": 10, "carga": 65, "obs": "" }
          ]
        }
      ],
      "cardio": { "tipo": "bicicleta", "min": 15, "kcal": 105 },
      "obs": ""
    }
  ]
}
```

### EXERCISE_DB — banco de exercícios

Extrair para `src/data/exerciseDb.ts`. Estrutura:
```typescript
export interface Exercise {
  id: string
  nome: string
}
export type ExerciseDB = Record<string, Exercise[]> // chave = grupo muscular com emoji
```

**Grupos musculares (ordem fixa — MUSCLE_ORDER):**
```typescript
export const MUSCLE_ORDER = [
  "🏋️ Peito", "🦅 Costas", "🦵 Quad", "🦵 Posterior",
  "🍑 Glúteos", "💪 Ombros", "💪 Bíceps", "💪 Tríceps", "🧱 Core"
]
```

**EX_SECONDARY — músculos secundários por exercício:**
Extrair junto com EXERCISE_DB para `src/data/exerciseDb.ts`. É um `Record<string, string[]>` mapeando `exerciseId → grupos secundários`.

### MUSCLE_LANDMARKS — limites de volume (MEV/MAV/MRV)

```typescript
// Copiar exato para src/data/muscleLandmarks.ts
export const MUSCLE_LANDMARKS: Record<string, { mev: number; mav: number; mrv: number }> = {
  "🏋️ Peito":     { mev: 10, mav: 15, mrv: 25 },
  "🦅 Costas":    { mev: 10, mav: 15, mrv: 25 },
  "🦵 Quad":      { mev:  8, mav: 15, mrv: 25 },
  "🦵 Posterior": { mev:  6, mav: 12, mrv: 20 },
  "🍑 Glúteos":   { mev: 15, mav: 20, mrv: 30 },
  "💪 Ombros":    { mev:  6, mav: 12, mrv: 20 },
  "💪 Bíceps":    { mev:  6, mav: 12, mrv: 20 },
  "💪 Tríceps":   { mev:  6, mav: 12, mrv: 20 },
  "🧱 Core":      { mev:  4, mav: 10, mrv: 16 },
}
```

**MEV relativo:** `~20%` do volume usado para ganho (ponto de partida sem histórico).
**Progressão saudável:** +20% de volume por ciclo.

### Templates de treino padrão (DEFAULT_TEMPLATES)

```typescript
// Copiar para src/data/defaultTemplates.ts
export const DEFAULT_TEMPLATES = [
  { id: "treino_a", nome: "Treino A — Peito + Bíceps + Abdômen", cor: "#f87171",
    exercicios: ["supino_reto","supino_inclinado","crossover","rosca_direta","rosca_martelo","abdominal_crunch"],
    cardio: { tipo: "bicicleta", min: 15 } },
  { id: "treino_b", nome: "Treino B — Costas + Tríceps + Abdômen", cor: "#60a5fa",
    exercicios: ["puxada_frontal","remada_curvada","remada_baixa","triceps_pulley","triceps_testa","prancha"],
    cardio: { tipo: "bicicleta", min: 15 } },
  { id: "treino_c", nome: "Treino C — Pernas + Ombros + Abdômen", cor: "#34d399",
    exercicios: ["agachamento_livre","leg_press","cadeira_extensora","cadeira_flexora","desenv_halter","elevacao_lateral","abdominal_crunch"],
    cardio: { tipo: "esteira_caminhada", min: 10 } },
  { id: "treino_alt", nome: "Treino Alt — Peito + Costas + Braços", cor: "#fbbf24",
    exercicios: ["supino_reto","supino_inclinado","puxada_frontal","remada_curvada","triceps_pulley","rosca_direta"],
    cardio: { tipo: "bicicleta", min: 15 } },
]
```

### Cardio types

```typescript
export const CARDIO_TYPES = [
  { id: "bicicleta",          nome: "🚴 Bicicleta",              kcalMin: 7   },
  { id: "bicicleta_intensa",  nome: "🚴 Bicicleta (intensa)",    kcalMin: 10  },
  { id: "esteira_caminhada",  nome: "🚶 Caminhada (esteira)",    kcalMin: 4.5 },
  { id: "esteira_corrida",    nome: "🏃 Corrida (esteira)",      kcalMin: 10  },
  { id: "caminhada_rua",      nome: "🚶 Caminhada ar livre",     kcalMin: 4   },
  { id: "corrida_rua",        nome: "🏃 Corrida ar livre",       kcalMin: 11  },
  { id: "eliptico",           nome: "🏋️ Elíptico / Transport",  kcalMin: 8   },
  { id: "escada",             nome: "🪜 Escada",                 kcalMin: 9   },
  { id: "pular_corda",        nome: "⏭️ Pular corda",           kcalMin: 12  },
  { id: "remo",               nome: "🚣 Remo",                   kcalMin: 8.5 },
  { id: "outro_cardio",       nome: "❤️ Outro",                 kcalMin: 6   },
]
```

### Componentes a criar para a Fase 3

- `src/components/ExerciseSelector.tsx` — modal full-screen, abas por grupo, busca, aba "⭐ Meus" para custom
- `src/components/WorkoutCard.tsx` — card de exercício com séries (reps + carga + obs)
- `src/components/CoachModal.tsx` — modal com 5 páginas educativas (conteúdo: `COACH_PAGES` no index.html linha ~8415)
- `src/components/WorkoutHistoryModal.tsx` — 3 abas: por treino, por equipamento, volume muscular
- `src/components/PauseTimer.tsx` — timer de pausa com presets e notificação nativa

### Hook: useMuscleVolume

```typescript
// src/hooks/useMuscleVolume.ts
// Calcula séries semanais por grupo muscular a partir do histórico de workouts
// Lê workouts dos últimos 7 dias do Supabase
// Retorna: { grupo: string, series: number, status: 'below' | 'mev' | 'mav' | 'mrv' }[]
// Lógica: soma series[].length de todos exercícios do grupo + secundários (com peso 0.5)
```

---

## FASE 4 — Corpo, Hábitos e Mais

### Estrutura de medições corporais (MEASURE_KEY)

```json
{
  "days": {
    "2026-03-07": {
      "weightKg": 80.5,
      "waistCm": 88,
      "bfPct": 18.5,
      "note": "em jejum",
      "skinfolds": { "chest": 12, "ax": 10, "tri": 14, "sub": 16, "ab": 20, "sup": 18, "th": 22 }
    }
  }
}
```

Para Supabase: uma linha em `body_measurements` por data, `data` = o objeto do dia.

### Estrutura de hábitos (HABITS_KEY)

```json
{
  "list": [
    { "id": "agua", "nome": "💧 Água (2L)", "emoji": "💧" },
    { "id": "dieta", "nome": "🥗 Dieta", "emoji": "🥗" },
    { "id": "treino", "nome": "🏋️ Treino", "emoji": "🏋️" },
    { "id": "sono", "nome": "😴 Sono 7h+", "emoji": "😴" }
  ],
  "days": {
    "2026-03-07": { "agua": true, "dieta": false, "treino": true, "sono": true }
  }
}
```

**Regra especial dieta:** "jantar" precisa estar registrado no diário antes de poder marcar o hábito "dieta".

### Estrutura de check-ins (CHECKINS_KEY)

```json
{
  "checkins": [
    {
      "date": "2026-03-07",
      "peso": 80.5,
      "bf": 18.5,
      "energia": 7,
      "humor": 8,
      "sono": 7,
      "obs": "sentindo bem"
    }
  ]
}
```

### Calculadora JP7 — fluxo do wizard

O wizard tem 5 steps:
1. **Welcome** — só no primeiro acesso (sem perfil salvo)
2. **Step 0** — revisão de dados existentes
3. **Step 1** — dados pessoais (sexo, idade, peso, altura)
4. **Step 2** — dobras cutâneas JP7 (7 pontos: peito, axilar, tríceps, subescapular, abdominal, suprailíaco, coxa)
5. **Step 3** — objetivo (maintain/cut/recomp/bulk)
6. **Step 4** — nível de atividade (5 opções via `WZ_ACTIVITY_LABELS`)

Ao finalizar: `calcAll()` roda com os dados preenchidos, resultado salvo em `CALC_KEY`.

---

## Tokens de design (preservar exatos)

```css
/* Copiar para src/index.css — já existe no projeto, verificar se está atualizado */
--bg:       #0a0e18;
--surface:  rgba(255,255,255,.04);
--surface2: rgba(255,255,255,.07);
--surface3: rgba(255,255,255,.10);
--text:     #f0f4ff;
--text2:    #a0b4d8;
--text3:    #6b82a8;
--accent:   #7c5cff;
--accent2:  #a78bfa;
--good:     #34d399;
--warn:     #fbbf24;
--bad:      #f87171;
--line:     rgba(255,255,255,.06);
--radius:   16px;
--radius-sm:12px;
--radius-xs:8px;
--shadow:   0 8px 32px rgba(0,0,0,.4);
--font:     'DM Sans', ui-sans-serif, system-ui, -apple-system, sans-serif;
```

**Font:** DM Sans — importar do Google Fonts no `index.html` ou via `@import` no CSS.

---

## Estrutura de abas (Nav)

O app tem 5 abas na barra inferior:

| Aba | Ícone | Página |
|---|---|---|
| Home | 🏠 | `HomePage.tsx` |
| Diário | 📅 | `DiarioPage.tsx` |
| Treino | 🏋️ | `TreinoPage.tsx` |
| Corpo | 📊 | `CorpoPage.tsx` |
| Mais | ⚙️ | `MaisPage.tsx` |

**Nav.tsx:** barra fixa no bottom, z-index 100, `safe-area-inset-bottom` para iPhone X+.
O `DashboardPage.tsx` atual (placeholder da Fase 1) será **substituído** pela estrutura de abas — `App.tsx` passará a renderizar `<Nav>` + a página ativa da aba selecionada.

---

## Protocolos Lucas Campos (preservar na lógica de coach)

- **Volume cycling** (não "deload") — reduzir volume, manter carga
- **Séries válidas** = perto da falha (reps > 0 como proxy)
- **Regra da Prioridade** — nunca dizer "treine menos X", sempre "Y está abaixo do mínimo"
- **MEV relativo** = ~20% do volume usado para ganho
- **Progressão saudável** = +20% de volume por ciclo
- **Faixa de reps hipertrofia** = 5-30 (proximidade à falha > número)
- **Glúteos** = grupo mais subestimado, MEV base = 15 séries/semana
- **MRV prático** = 20-23 séries/semana
- **Nível do usuário** por histórico: <3m=iniciante, 3-12m=intermediário, 12m+=avançado

---

## Ordem de implementação recomendada por sessão

### Sessão 2A (Fase 2 — início)
1. Criar `src/data/goalPresets.ts` (copiar constantes)
2. Criar `src/lib/calculators.ts` (copiar fórmulas)
3. Criar `src/hooks/useSettings.ts` (lê/salva `user_settings` no Supabase)
4. Criar `src/hooks/useDiary.ts` (lê/salva `diary_entries` do dia)
5. Substituir `DashboardPage.tsx` pela estrutura de abas em `App.tsx`
6. Implementar `Nav.tsx` (barra inferior)
7. Implementar `HomePage.tsx` com cards de energia

### Sessão 2B (Fase 2 — diário)
1. Criar `src/data/foodDb.ts` (extrair FOOD_DB do index.html linha ~3500)
2. Implementar `DiarioPage.tsx` com estrutura de refeições
3. Implementar `FoodDrawer.tsx`
4. Implementar `FoodPortionModal.tsx`
5. Testar persistência multi-dispositivo

### Sessão 3A (Fase 3 — treino base)
1. Criar `src/data/exerciseDb.ts` (extrair EXERCISE_DB + EX_SECONDARY)
2. Criar `src/data/defaultTemplates.ts`
3. Criar `src/data/muscleLandmarks.ts`
4. Criar `src/data/cardioTypes.ts`
5. Implementar `TreinoPage.tsx` base
6. Implementar `ExerciseSelector.tsx`

### Sessão 3B (Fase 3 — analytics)
1. Implementar `src/hooks/useMuscleVolume.ts`
2. Implementar `WorkoutHistoryModal.tsx`
3. Implementar `CoachModal.tsx` (conteúdo do COACH_PAGES do index.html linha ~8415)
4. Implementar `PauseTimer.tsx`

### Sessão 4 (Fase 4)
1. `CorpoPage.tsx` + hook de medições
2. Hábitos (card na Home + histórico)
3. Check-ins
4. `MaisPage.tsx` + wizard JP7

### Sessão 5 (Fase 5 — migração)
1. Botão "Exportar para Kcalix" no `blocos-tracker/index.html` (modificação mínima)
2. Importador em `src/pages/ImportPage.tsx` (rota temporária pós-login)
