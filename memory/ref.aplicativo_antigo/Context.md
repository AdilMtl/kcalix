# Kcal.ix — Contexto do Projeto

## Visão geral

App single-page (PWA) de tracking nutricional, treino e composição corporal. Tudo em **um único arquivo `index.html`** (~5082 linhas) com CSS + HTML + JS inline. Sem frameworks, sem build, sem dependências externas além da fonte Google (DM Sans).

Hospedado no GitHub Pages. Funciona 100% offline via Service Worker. Dados persistem no localStorage do navegador.

## Arquivos do repositório

```
blocos-tracker/
├── index.html      ← O APP INTEIRO (CSS + HTML + JS). Este é o único arquivo que muda.
├── manifest.json   ← Metadados PWA (nome: "Kcal.ix", ícones, cores). Raramente muda.
├── sw.js           ← Service Worker (cache offline). CACHE_NAME: kcalix-v1
├── icon-192.png    ← Ícone do app 192×192
├── icon-512.png    ← Ícone do app 512×512
├── PLAN.md         ← Plano de reestruturação v1.5.0 (referência histórica)
└── Context.md      ← Este arquivo
```

## Estrutura do index.html

O arquivo é dividido em 3 grandes blocos sequenciais:

### 1. CSS (~linhas 19-1460)

Organizado por seções com comentários `════`:

| Seção | Linha aprox. | O que controla |
|---|---|---|
| TOKENS | ~24 | Variáveis CSS (cores, fontes, radii) |
| RESET | ~50 | Reset e base styles |
| LAYOUT | ~78 | Container principal `.app` |
| HEADER | ~87 | Barra superior fixa |
| BUTTONS | ~136 | `.btn`, `.btn.primary`, `.btn.sm`, etc |
| BOTTOM NAV | ~179 | Navegação inferior (5 abas) — `repeat(5, 1fr)` |
| FOOTER STATUS BAR | ~225 | Barra fixa de kcal no rodapé |
| CARDS | ~272 | `.card`, `.card-header`, `.card-body` |
| ACCORDION | ~293 | Expandir/colapsar seções |
| KPI / PROGRESS | ~332 | Cards de indicadores, barras de progresso |
| PRESETS | ~427 | Botões de preset de refeição; `.preset-btn.active`, `.preset-bar`, `.preset-hint` |
| MEALS | ~452 | Grid de refeições e inputs de macros |
| FOOD PANEL | ~680 | Grid de alimentos, modal de seleção |
| EXERCISE / TREINO | ~1005 | Templates, exercícios, séries, summary |
| MODAL | ~794 | Bottom sheet modals (food, template edit, progressão, histórico) |
| DAY NAVIGATION | ~1188 | `.date-nav-btn`, `.day-edit-banner`, `.banner-today-btn` |
| HISTORY MODAL | ~1210 | `.hist-entry`, `.hist-mini-bar-*`, `.hist-empty` |
| AI EXPORT | ~1316 | `.ai-export-desc`, `.ai-export-actions`, `.ai-export-status` |
| HABIT TRACKER | ~1321 | `.habit-card`, `.habit-trigger`, `.habit-body`, `.habit-dot`, `.habit-score-dot` — grid neon retrátil |
| HOME DASHBOARD | ~1407 | `.home-greeting`, `.home-kcal-bar`, `.home-macro-row`, `.home-grid`, `.home-action-card`, `.fab` |
| DESKTOP | ~1445 | Media query para telas >= 720px |

### 2. HTML (~linhas 1460-2120)

5 views (abas), apenas uma visível por vez via classe `.active`:

| View | ID | Linha aprox. | Função |
|---|---|---|---|
| 🏠 Home | `viewHome` | ~1488 | Dashboard: saudação, progresso kcal/macros, grid 2×2 de ações, Habit Tracker |
| 📊 Diário | `viewDiario` | ~1559 | Registro diário de blocos P/C/G por refeição + accordion Alimentos no fim |
| ⚙️ Mais | `viewMais` | ~1617 | Ajustes de metas + Calculadora JP7 + IA Export (merged, accordion) |
| 📏 Corpo | `viewCorpo` | ~1800 | Registro de peso e medidas corporais |
| 🏋️ Treino | `viewTreino` | ~1878 | Templates de treino, séries, cardio, progressão |

Modais (bottom sheets que abrem sobre as views):
- **Food Modal** (`foodModal`) — Seleção de alimento com ajuste de porção
- **Template Edit Modal** (`tmplModal`) — Editar/criar/excluir templates de treino
- **Exercise Progression Modal** (`exProgModal`) — Histórico e gráfico de um exercício
- **Template History Modal** (`tmplHistModal`) — Comparação entre sessões de treino
- **History Modal** (`histModal`) — Histórico de todos os dias registrados (gramas reais, % real sem cap, aviso se >100%)
- **Preset Edit Modal** (`presetEditModal`) — Editar P/C/G por refeição de cada preset; persiste em `blocos_tracker_presets_v1`

Elementos de navegação:
- **`#btnPrevDay` / `#btnNextDay`** — botões ‹ › dentro do `.date-pill` no header
- **`#dayEditBanner`** — banner contextual no card de Progresso ao editar dias passados

### 3. JavaScript (~linhas 2245-5063)

Tudo dentro de uma IIFE `(() => { ... })()`. Seções:

| Seção | Linha aprox. | O que faz |
|---|---|---|
| UTILS | ~2247 | `$()`, `$$()`, `clone()`, `round1()` |
| CONSTANTS | ~2260 | Storage keys, defaults para settings/calc/measure |
| EXERCISE DATABASE | ~2270 | `EXERCISE_DB` — 70 exercícios por grupo muscular |
| CARDIO TYPES | ~2327 | `CARDIO_TYPES` — 12 tipos com kcal/min |
| DEFAULT TEMPLATES | ~2336 | 4 templates padrão (A/B/C/Alt) |
| FOOD DATABASE | ~2333 | `FOOD_DB` — 109 alimentos BR com macros |
| TOAST | ~2445 | Notificações temporárias |
| ACCORDION | ~2453 | Toggle de seções expansíveis |
| STORAGE | ~2459 | `loadJSON()`, `saveJSON()` — wrapper localStorage |
| DATE | ~2488 | `todayISO()`, `currentDate()`, data picker |
| MEALS BUILD | ~2500 | Constrói grid de refeições dinamicamente |
| UI UPDATE | ~2639 | `updateUI()` — recalcula totais, barras, KPIs |
| HOME DASHBOARD | ~2973 | `renderHomeDashboard()` — saudação, kcal, macros, habits |
| TABS | ~3024 | `openTab()` — troca de view + sessionStorage |
| SETTINGS | ~3088 | Aplicar/resetar configurações de macros |
| CALC (JP7) | ~3180 | Calculadora Jackson-Pollock 7 dobras + Siri |
| MEASURE | ~3207 | Registro e histórico de medidas corporais |
| SNAPSHOT | ~3390 | Fechar dia e salvar snapshot |
| HISTORY MODAL | ~3400 | `openHistModal`, `closeHistModal`, `renderHistList` |
| AI EXPORT | ~3440 | `AI_SYSTEM_PROMPT`, `exportAIJson()`, `copyAIPrompt()` |
| FOOD PANEL | ~3750 | Busca, seleção, modal de alimentos |
| TREINO PANEL | ~4000 | Estado do treino, load/save, render exercícios |
| EXERCISE PROGRESSION MODAL | ~4400 | Modal com gráfico e tabela de evolução |
| TEMPLATE HISTORY MODAL | ~4450 | Modal com comparação entre sessões |
| TEMPLATE EDITOR | ~4570 | CRUD de templates de treino |
| DAY NAVIGATION | ~4720 | `shiftDate`, `updateDayBanner` — navegação ‹ › e banner |
| HABIT TRACKER | ~4760 | `HABITS_KEY`, `HABITS_DEF` (5 hábitos), `getWeekDates()`, `renderHabitTracker()` |
| INIT | ~4882 | Event listeners, bootstrap — abre aba via sessionStorage |
| INIT | ~3852 | Event listeners, bootstrap inicial |

## Modelo de dados (localStorage)

### `blocos_tracker_v6` (STORAGE_KEY)
```json
{
  "days": {
    "2026-02-25": {
      "meals": [
        { "label": "☀️ Café", "p": 3, "c": 4, "g": 1 },
        { "label": "🍽️ Almoço", "p": 5, "c": 6, "g": 2 }
      ]
    }
  },
  "history": []
}
```

### `blocos_tracker_settings_v6` (SETTINGS_KEY)
Metas de blocos P/C/G e configuração de refeições.

### `blocos_tracker_calc_v6` (CALC_KEY)
Dados da calculadora (sexo, idade, peso, altura, dobras cutâneas, atividade).

### `blocos_tracker_measure_v6` (MEASURE_KEY)
```json
{
  "entries": {
    "2026-02-25": {
      "peso": 76, "cintura": 85, "quadril": 98,
      "bracoD": 35, "bracoE": 34.5, "coxaD": 55, "coxaE": 54
    }
  }
}
```

### `blocos_tracker_treino_v1` (TREINO_KEY)
```json
{
  "days": {
    "2026-02-25": {
      "templateId": "treino_a",
      "exercicios": [
        {
          "exercicioId": "supino_reto",
          "series": [{ "reps": "10", "carga": "65" }]
        }
      ],
      "cardio": [{ "tipo": "bicicleta", "minutos": 20 }],
      "nota": "Bom treino",
      "kcal": 187,
      "savedAt": "2026-02-25T18:30:00Z"
    }
  }
}
```

### `blocos_tracker_habits_v1` (HABITS_KEY)
```json
{
  "2026-02-27": { "dieta": true, "log": true, "treino": false, "cardio": false, "medidas": false }
}
```
Estado aberto/fechado do card em `localStorage.getItem('blocos_habit_open')` (`'1'` = aberto, `'0'` = fechado).

### `blocos_tracker_presets_v1` (PRESETS_KEY)
```json
{
  "seg": { "meals": { "cafe": {"p":1,"c":1,"g":0}, "almoco": {"p":2,"c":2,"g":0.5}, "..." } },
  "ter": { "..." },
  "qua": { "..." },
  "qui": { "..." },
  "sex": { "..." },
  "fds": { "..." }
}
```
Apenas `meals` é sobrescrito; `label` vem sempre de `DEFAULT_PRESETS`. Se o key não existir, usa os defaults hardcoded.

### `blocos_tracker_treino_templates_v1` (TREINO_TMPL_KEY)
```json
[
  {
    "id": "treino_a",
    "nome": "Treino A — Peito + Bíceps + Abdômen",
    "cor": "#f87171",
    "exercicios": ["supino_reto", "supino_inclinado", "crossover", "rosca_direta"],
    "cardio": { "tipo": "bicicleta", "min": 15 }
  }
]
```

## Padrões e convenções

### CSS
- Design system com variáveis CSS (--bg, --surface, --text, --accent, etc)
- Mobile-first, dark theme fixo
- Componentes: `.card`, `.btn`, `.accordion`, `.kpi`, `.ws-box`
- Modais: `.modal-overlay` + `.modal-sheet` (bottom sheet) + `.modal-full` (tela cheia)

### HTML
- Views alternadas por `.active` class
- IDs para elementos interativos (ex: `#btnSaveTreino`, `#tmplGrid`)
- Sem formulários `<form>` — tudo via event listeners

### JavaScript
- IIFE wrapping tudo
- `$()` = querySelector, `$$()` = querySelectorAll
- Closures com IIFE para event listeners em loops: `((i) => () => ...)(idx)`
- Eventos `change` (não `input`) nos campos de treino para evitar re-render por tecla
- `scrollIntoView({block:"center"})` nos inputs para ajudar com teclado mobile
- Estado em variáveis globais dentro da IIFE (treinoState, activeTmplId, etc)
- Flag `treinoLoaded` para evitar reload circular do localStorage

### Regras críticas ao editar
1. **NUNCA** usar `<form>` tags — quebra o layout mobile
2. **NUNCA** chamar `loadTreinoDay()` dentro de `renderTreinoPanel()` sem checar `treinoLoaded`
3. **Sempre** usar IIFE closures em loops com event listeners
4. **Sempre** usar `change` (não `input`) para campos de treino
5. **font-size >= 16px** nos inputs para evitar zoom automático no iOS
6. **Testar** que modais não ficam atrás da bottom-nav (z-index: nav=100, modals=301)
7. **Service Worker**: ao fazer mudança grande, incrementar `CACHE_NAME` em `sw.js` (blocos-v1 → v2)

## Exercícios disponíveis (EXERCISE_DB)

70 exercícios em 8 grupos: Peito (9), Costas (9), Pernas (15), Glúteos (7), Ombros (9), Bíceps (7), Tríceps (7), Core (7).

Grupo Glúteos: Hip thrust (barra/máquina), Máquina de glúteos (kickback), Glúteo no cabo, Elevação pélvica, Stiff romeno/RDL, Agachamento sumô.

12 tipos de cardio com kcal/min: bicicleta (7-10), caminhada (4-4.5), corrida (10-11), elíptico (8), escada (9), corda (12), remo (8.5), natação (9).

## Alimentos disponíveis (FOOD_DB)

109 alimentos brasileiros em 9 categorias (revisado TACO & Atwater): Pães/Cereais/Raízes, Carnes & Proteínas, Proteicos & Laticínios, Legumes & Vegetais, Oleaginosas, Doces & Snacks, Fast-food, Bebidas, Frutas. Cada item tem: id, nome, porção padrão (g/ml), P/C/G por porção, kcal.

## Roadmap planejado

1. Dashboard diário com saldo calórico (meta - consumido + gasto treino)
2. Gráficos de tendência de treino (volume total por template ao longo do tempo)
3. Refeições favoritas (salvar combinações, adicionar com 1 toque)
4. Export/import JSON (backup dos dados)
5. Coach IA contextual — integração direta de API (próximo passo após validação do export manual)
6. Habit Tracker: auto-check de Treino e Medidas ao salvar dados nessas seções