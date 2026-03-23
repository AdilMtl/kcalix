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
- Fase 3: CONCLUÍDA (2026-03-09) — Sessões 3A–3E completas
- Fase 4: CONCLUÍDA (2026-03-09) — Sessões 4A–4E completas
- Fase 5: CONCLUÍDA (2026-03-14) — import/export completo validado com dados reais
- Fase 6A: CONCLUÍDA (2026-03-15) — PWA base + Fix 404 SPA (v0.25.0)
- Fase 6B: EM ANDAMENTO — ITENs 1–9 concluídos; faltam ITEM 10 (toggle Free/Assinante) e ITEM 11 (lentidão)
- Fase 7A: CONCLUÍDA (2026-03-18) — Edge Function ai-chat + chat UI (FAB + AiChatModal) — v0.34.0
- Fase 7B: CONCLUÍDA (v0.47.0 — 2026-03-23) — log de alimentos via IA completo; IA decide intenção via JSON estruturado; macros custom via TACO/IBGE

## Itens 6B concluídos
- ITEM 1 — Error Boundary (v0.27.0)
- ITEM 2 — Onboarding automático (v0.26.0)
- ITEM 3 — SW Update Toast (v0.27.0)
- ITEM 4 — Code Splitting (v0.27.0)
- ITEM 5 — Testes Vitest: 38 testes (v0.28.0)
- ITEM 6 — CI/CD GitHub Actions (v0.28.2)
- ITEM 9 — OG Tags (v0.28.1)
- ITEM 7 — Defensividade dos hooks: sanitizeSettings, sanitizeExercicio, safeMeals (v0.29.0)
- ITEM 8 — Loading states / Skeleton: Skeleton.tsx, sem spinners de tela inteira (v0.29.0)
- FIX — custom_foods: useCustomFoods.ts + integração FoodDrawer/CustomFoodModal (v0.29.0)

## Padrões adicionados na Fase 7A (v0.34.0)
- **useAiChat:** `src/hooks/useAiChat.ts` — `messages[]`, `sendMessage(text)`, `loading`, `error`, `reset()`; chama via `supabase.functions.invoke('ai-chat')` com JWT da sessão
- **AiChatModal:** `src/components/AiChatModal.tsx` — z-index 340/341; bottom sheet gradiente padrão; balões usuário (direita, roxo) / coach (esquerda, surface); chips de ação rápida no estado vazio; loading 3 dots animados
- **FAB 🤖:** montado no AppLayout (fora do `<main>`), z-index 200, `bottom: 76` (acima da Nav)
- **Edge Function ai-chat:** busca diary + workouts + body_measurements + checkins (30 dias) + user_settings; monta system prompt com protocolos RP; chama gpt-4o-mini max_tokens 1000; retorna `{ reply: string }`
- **OPENAI_API_KEY:** configurada apenas em Supabase Vault (secrets) — NUNCA prefixo VITE_, NUNCA em src/
- **Deploy Edge Function:** ver `memory/supabase-edge-functions-deploy.md` — inclui: comando obrigatório `--no-verify-jwt`, como obter JWT para curl, 3 curls de verificação, rollback passo a passo, sintomas comuns

## Padrões adicionados na Fase 7B (v0.42.0 — parcial)
- **AiLogConfirmModal:** `src/components/AiLogConfirmModal.tsx` — z-index 348/350; lista de `PendingLogItem` com input de gramas por item; totalizador P/C/G/kcal recalculado em tempo real; dropdown de refeição obrigatório se não detectado no texto
- **PendingLogItem:** `{ foodId, nome, grams, source, pPer100, cPer100, gPer100, kcalPer100 }` — macros armazenados por 100g para permitir recalcular ao editar gramas
- **Detecção de intenção (frontend):** `hasLogIntent(text)` em `useAiChat.ts` — palavras-chave `comi/almocei/jantei/...`; intercepta ANTES de chamar a Edge Function; sem custo de tokens
- **parse-food real (7B-2+7B-3):** `action:'parse-food'` na Edge Function; `toLogItem()` em `useAiChat.ts` converte response; `source:'db'` → macros do `buildFoodLookup()` local; `source:'custom'` → macros por 100g da IA
- **addFoodsToDiary:** função standalone exportada de `useDiary.ts` — lê estado atual do banco, concatena entries, persiste; evita race condition de ter dois `useDiary` instanciados (AppLayout + DiarioPage)
- **NUNCA instanciar useDiary no AppLayout** para escritas do chat — usar sempre `addFoodsToDiary(userId, date, meal, entries)` diretamente
- **Confirmação no chat:** ao confirmar o modal, o coach exibe mensagem no histórico listando os itens com gramas (não toast flutuante — overlapping bug)
- **getFoodIndex():** `src/data/foodDb.ts` — gera string compacta `"Categoria: id(nome/Xg), ..."` para ser enviada à Edge Function na 7B-2 (~200 tokens)

## Padrões adicionados na Sessão 7B-1 (v0.43.0)
- **useCustomFoods CRUD completo:** `saveCustomFood()` retorna `FoodItem` com id real; `findCustomFood(nome)` dedup por nome case-insensitive; `updateCustomFood(id, food)` e `deleteCustomFood(id)` — instanciar direto no componente, sem prop chain
- **Custom food salvo por 100g:** sempre `porcaoG: 100` + macros por 100g no cadastro; porção editada fica no `FoodEntry` do diário
- **Dedup antes de criar:** `findCustomFood(nome)` antes de `saveCustomFood()` — evita duplicatas ao confirmar mesmo log duas vezes
- **Mock fixo para validar fluxo:** `mockParseFood()` hardcoded (1 db + 1 custom); extração por palavras é frágil — substituir diretamente pela Edge Function na 7B-2
- **AiLogConfirmModal itens custom:** badge ✨ Novo + P/C/G editáveis + kcal automático `p×4+c×4+g×9`
- **CustomFoodModal modo edição:** `initialValues?: Omit<FoodItem, 'id'>` — reutilizado no FoodDrawer para editar
- **FoodDrawer CRUD:** botões ✏️/🗑️ só em `food.id.startsWith('custom_')`; confirmação antes de excluir

## Próximo passo
Fase 7C — Foto para macros (GPT-4o Vision) — após Fase 7B concluída ✅

## Padrões adicionados na Sessão 6B (v0.29.0)
- **useCustomFoods:** `src/hooks/useCustomFoods.ts` — CRUD tabela `custom_foods`; `saveCustomFood()` faz INSERT e atualiza estado local
- **Skeleton.tsx:** `src/components/Skeleton.tsx` — `animate-pulse`, props `width/height/borderRadius/style`
- **sanitizeSettings(raw):** valida shape JSONB antes de setar estado; fallbacks numéricos; goal inválido → `'maintain'`
- **sanitizeExercicio(ex):** descarta exercícios com `exercicioId` ausente/inválido ao carregar workout do Supabase
- **safeMeals pattern:** ao carregar diary, cada refeição é guardada com `Array.isArray()` antes de usar
- **Loading sem spinner:** nunca usar `if (loading) return <spinner tela inteira>` — renderizar página com skeletons inline nos cards

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

