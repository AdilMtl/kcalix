# Kcalix — Memória persistente entre sessões

## Projeto
- **Stack:** React + Vite + TypeScript + Tailwind + Supabase
- **Repo:** `AdilMtl/kcalix` → `kcalix.vercel.app`
- **Local:** `Desktop/Development/kcalix/`
- **Roadmap:** `memory/ROADMAP.md` no projeto
- **Referência do app original:** `memory/ref.aplicativo_antigo/referência.index.html` (~6200 linhas)
- **Contexto técnico de port:** `memory/contexto-port.md`

## Skills disponíveis (`.claude/commands/`)
- `/start` — iniciar sessão, verificar estado git e build
- `/spec` — escrever especificação antes de qualquer mudança
- `/port` — portar elemento do app original (metodologia desta sessão)
- `/check-port` — verificar fidelidade do port ao original (linha a linha vs referência.index.html)
- `/feature` — adicionar funcionalidade nova
- `/fix` — corrigir bug
- `/improve` — melhorar existente
- `/review` — checklist antes de deploy
- `/deploy` — commit + push mid-session
- `/end` — encerrar sessão com documentação
- `/status` — estado rápido
- `/undo` — reverter com segurança
- `/migrate` — migrar dados do app antigo

## Metodologia de port (destilada da Sessão 2C)
Ver detalhes em `.claude/commands/port.md`. Resumo:
1. Ler `referência.index.html` nas linhas exatas antes de escrever
2. Copiar CSS inline com valores exatos (não inventar)
3. Estado único no pai — hooks de dados nunca duplicados em filhos
4. Optimistic UI — `setDiary(next)` → `.upsert().then()` sem await bloqueante
5. Bottom sheets: `background: linear-gradient(180deg, #1a2035, #121828)`

## Padrões arquiteturais confirmados
- **Estado de diary:** `useDiary()` instanciado só no componente de página; callbacks descem via props
- **Fluxo de adição de alimento:** `DiarioPage(useDiary) → FoodDrawer(onAddFood prop) → FoodPortionModal(onAddFood prop)`
- **Accordion:** `openMealId` no pai — um abre, o anterior fecha
- **Chamadas Supabase:** NUNCA em componentes — sempre via hooks
- **TypeScript:** NUNCA `any` — usar tipos específicos

## Variáveis CSS importantes (já em src/index.css)
```
--pColor: #f87171  (proteína — vermelho)
--cColor: #fbbf24  (carbo — amarelo)
--gColor: #34d399  (gordura — verde)
--accent: #7c5cff  (roxo principal)
--accent2: #a78bfa (roxo claro)
--bg: #0a0e18      (fundo escuro)
--surface/2/3: rgba(255,255,255,.04/.07/.10)
```
Ambient glow já adicionado em `body::before/::after`.

## Estado atual das fases
- Fase 0: CONCLUÍDA
- Fase 1: CONCLUÍDA (auth email/senha + admin panel)
- Fase 2: CONCLUÍDA (2026-03-08) — Sessões 2A–2E completas
- Fase 3: EM ANDAMENTO — Sessões 3A–3D concluídas (2026-03-08); próxima: 3E
- Fases 4–8: Planejadas

## Padrões adicionados na Sessão 2E
- **dateStore (Zustand):** `src/store/dateStore.ts` — selectedDate global, goToPrev/goToNext/goToToday/isToday
- **DateNavBar:** header global no AppLayout (fora do `<main>`); nome da página (esq) + [hoje] + [‹ data ›] (dir)
- **useDiary(date?):** aceita date como parâmetro — default todayISO(); recarrega ao mudar data
- **Banner roxo:** aparece em todas as abas quando selectedDate != hoje

## Padrões adicionados na Sessão 3A
- **exerciseDb.ts:** `src/data/exerciseDb.ts` — EXERCISE_DB, EX_SECONDARY, MUSCLE_LANDMARKS, CARDIO_TYPES, DEFAULT_TEMPLATES, helper exById()
- **useWorkout(date?):** `src/hooks/useWorkout.ts` — mesmo padrão do useDiary; estado local + persist no Supabase; kcalPerSet(); sync kcalTreino no diary ao salvar
- **workout_templates:** Opção A (1 linha por usuário, array JSONB) — mantém DEFAULT_TEMPLATES localmente até primeiro saveTemplates()
- **kcalPerSet(reps, carga):** `Math.max(5, Math.min(14, r * 0.5 + carga * 0.03))` — fiel ao original L6127
- **SQL 004:** tabelas workouts + workout_templates, RLS, trigger com SECURITY DEFINER + SET search_path = ''

## Padrões adicionados na Sessão 3B
- **ExerciseSelector:** `src/components/ExerciseSelector.tsx` — bottom sheet gradiente, abas por grupo, modos "add"/"swap"; aba "⭐ Meus" pendente (Sessão 3B+)
- **set-table inputs:** usar `className="set-input"` (não style inline) para ter `:focus` border roxo + `font-variant-numeric: tabular-nums`
- **EX_SECONDARY:** mapeado por `exercicioId` (não por grupo) — sempre chamar `getSecondary(ex.exercicioId)`
- **addExercise:** inicia com 3 séries vazias (fiel ao original L6531)
- **prev-ref:** carregado lazy ao abrir accordion via `getLastWorkoutForExercise`, cache em `prevData` Record local na página
- **check-port:** nova skill — executar após /port, antes de /review

## Padrões adicionados na Sessão 3B+
- **useCustomExercises:** `src/hooks/useCustomExercises.ts` — CRUD Supabase; tabela `custom_exercises` (005)
- **CustomExerciseModal:** `src/components/CustomExerciseModal.tsx` — z-index 331 (acima do ExerciseSelector 329)
- **ExerciseSelector:** aba "⭐ Meus exercícios" + rename inline + delete + prop `forceGroup`
- **Fluxo pós-criação (original L7982–7984):** CustomExModal por cima do ExerciseSelector (não fecha o seletor); ao salvar → `setExSelForceGroup('⭐ Meus exercícios')` + `setExSelOpen(true)`
- **ATENÇÃO SCHEMA:** tabelas `workout_templates` e `custom_exercises` foram criadas com coluna `data` (JSONB) em vez das colunas corretas em sessões anteriores — corrigidas com RENAME + DROP/RECREATE. SQL files corretos: 004 e 005.

## Padrões adicionados na Sessão 3C
- **Timer:** estado local com `useRef` para intervalId (não persiste no Supabase) — cleanup no `useEffect` retorno
- **Cardio:** `addCardio/updateCardio/removeCardio` expostos pelo `useWorkout` — consumidos diretamente na TreinoPage
- **setNota:** exposto pelo `useWorkout` — input controlado conectado diretamente
- **TIMER_PRESETS** fixo `[30,60,90,120,180]` — long-press editável planejado para Fase 6

## Padrões adicionados na Sessão 3D
- **TemplateEditorModal:** `src/components/TemplateEditorModal.tsx` — z-index 320/321 (abaixo do ExerciseSelector)
- **TMPL_COLORS:** `['#f87171','#60a5fa','#34d399','#fbbf24','#a78bfa','#fb923c','#f472b6','#22d3ee']` — fiel ao original L7748
- **swapExercise(index, newId):** troca exercicioId in-place mantendo séries — corrige TODO da Sessão 3B
- **applyTemplate(tmpl):** carrega exercícios + cardio do template no estado do dia — fiel ao original L6257–6276
- **confirm() antes de applyTemplate:** quando há séries preenchidas — fiel ao original L6260–6263
- **Delete two-tap no TemplateEditorModal:** estado `deleteConfirm` local com `setTimeout` 3s auto-reset — fiel ao original L8034–8066
- **Z-index stack:** TemplateEditorModal (320/321) < ExerciseSelector (328/329) < CustomExerciseModal (330/331)

## Padrões adicionados na Sessão 4A
- **useBody:** `src/hooks/useBody.ts` — CRUD body_measurements; mesmo padrão useDiary/useWorkout
- **CorpoPage:** 3 accordions (inputs dia, dobras JP7, histórico 14 dias) — fiel ao original L2526-2602
- **Migration 008:** body_measurements com UNIQUE CONSTRAINT (user_id, date) e SEM trigger updated_at

## Padrões adicionados na Sessão 4B
- **CSS estrutural:** `index.css` agora tem ~390 linhas — `.btn`, `.card`, `.accordion`, `.kpi-grid`, `.form-grid`, `.form-row`, `.grid3`, `.hint`, `.calc-wizard`, `.wz-*` portados do original. Novas páginas usam essas classes diretamente.
- **MaisPage pattern:** `useSettings()` instanciado uma vez na página; `CalcWizardModal` recebe `initialData` e `onSave` via props — nunca instancia `useSettings` internamente.
- **useDiary fix defensivo:** ao carregar do Supabase: `{ ...EMPTY_DIARY, ...raw, totals: raw.totals ?? recalcTotals(raw.meals) }` — protege contra dados antigos sem campo `totals`.
- **kpi-grid correto:** usar `.kpi > .kpi-label + .kpi-value > .num + .den` — nunca inventar classes `kpi-cell`/`kpi-val`.

## Próximo passo
Fase 4 em andamento (4A+4B concluídas). Próxima: **Sessão 4C — HabitTracker** (referência original CSS L1731-1815, JS L~4760-5122). 5 hábitos fixos: dieta, log, treino, cardio, medidas. SQL: `supabase/migrations/009_habits.sql`.
