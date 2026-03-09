# Changelog — Kcalix

---

## [0.12.0] — 2026-03-08

### Adicionado
- [feat] `src/components/TemplateEditorModal.tsx` — editor de templates completo: nome, 8 cores, lista de exercícios (reordenar + remover), catálogo por grupo muscular + "⭐ Meus exercícios", cardio padrão (tipo + minutos), delete two-tap com auto-reset 3s; fiel ao original L7761–8066
- [feat] `src/hooks/useWorkout.ts` — `swapExercise(index, newId)` troca exercicioId in-place mantendo séries (corrige TODO da Sessão 3B); `applyTemplate(tmpl)` carrega exercícios + cardio do template no estado do dia
- [feat] `src/pages/TreinoPage.tsx` — botão ✏️ em cada chip de template abre TemplateEditorModal; botão "+ Nova rotina" cria template vazio; confirm() antes de applyTemplate quando há séries preenchidas (fiel ao original L6260–6263)

### Melhorado
- [improve] `src/pages/TreinoPage.tsx` — handleExSelect usa swapExercise in-place (antes: remove+add movia exercício para o final da lista)

### Notas
- TMPL_COLORS: `['#f87171','#60a5fa','#34d399','#fbbf24','#a78bfa','#fb923c','#f472b6','#22d3ee']` — fiel ao original L7748
- Z-index stack: TemplateEditorModal (320/321) < ExerciseSelector (328/329) < CustomExerciseModal (330/331)

---

## [0.11.0] — 2026-03-08

### Adicionado
- [feat] `src/pages/TreinoPage.tsx` — Cardio funcional: select CARDIO_TYPES + input minutos + botão remover + kcalPerMin automático ao trocar tipo; fiel ao original L6654–6680
- [feat] `src/pages/TreinoPage.tsx` — Timer de Pausa completo: tabs Timer/Cronômetro, display 56px tabular-nums com cores dinâmicas (branco→roxo→lilás), 5 presets fixos (0:30/1:00/1:30/2:00/3:00), Stop/Reset, Cronômetro Iniciar/Pausar/Reset; fiel ao original L2646–2675 + L1876–1889 + L6715–6879
- [feat] `src/pages/TreinoPage.tsx` — Nota do treino conectada: input controlado via `setNota()`, persiste no Supabase junto com o `saveWorkout()`

### Notas
- Sessão 3C concluída — Cardio + Timer + Nota + Salvar funcional de ponta a ponta
- Toast pós-salvar não implementado (botão muda para "✓ Salvo" — equivalente visual); toast planejado para polish geral
- Notificação de timer finalizado depende de service worker (PWA — Fase 6)
- Presets editáveis por long-press (original) → planejado para Fase 6

---

## [0.9.0] — 2026-03-08

### Adicionado
- [feat] `src/components/ExerciseSelector.tsx` — bottom sheet: abas por grupo muscular, grid de exercícios, modos "add" e "swap"; fiel ao original L2837–2850 + L6440–6591
- [feat] `src/pages/TreinoPage.tsx` — lista de exercícios funcional: accordion por exercício, set-table com inputs reps/carga (16px, tabular-nums, :focus roxo), prev-ref ▲▼= assíncrono (lazy ao abrir accordion), badge dinâmico (carga/preenchidas), volume, botões 📊/🔄/✕; fiel ao original L6323–6438
- [feat] `src/index.css` — classe `.set-input` com `:focus { border-color: rgba(124,92,255,.4) }` e `font-variant-numeric: tabular-nums` (fiel ao original L1426–1432)
- [feat] `.claude/commands/check-port.md` — nova skill `/check-port` para validar fidelidade do port ao original linha a linha

### Corrigido
- [fix] `useWorkout.ts` — `addExercise` agora inicia com 3 séries vazias (fiel ao original L6531; era 1)
- [fix] `TreinoPage.tsx` — `chartBtnStyle` corrigido para circular 28×28 + `color: var(--text3)` (fiel ao original L1533–1540)
- [fix] `TreinoPage.tsx` — `getSecondary()` recebia grupo em vez de exercicioId — grupos secundários não apareciam

### Notas
- Sessão 3B concluída — ExerciseSelector + Exercícios + Séries
- Swap usa remove+add (exercício vai para o fim) — `swapExercise` in-place planejado para Sessão 3D
- Exercícios personalizados (aba "⭐ Meus") adicionados ao ROADMAP como Sessão 3B+ antes da 3C
- Skill `/check-port` incorporada ao fluxo: `/port → implementa → /check-port → /review → /end`

---

## [0.8.0] — 2026-03-08

### Adicionado
- [feat] `src/data/exerciseDb.ts` — EXERCISE_DB (9 grupos, 70+ exercícios), EX_SECONDARY, MUSCLE_LANDMARKS, MUSCLE_ORDER, CARDIO_TYPES, DEFAULT_TEMPLATES + tipos TypeScript + helper `exById()`
- [feat] `supabase/migrations/004_workout_tables.sql` — tabelas `workouts` + `workout_templates` com RLS (4 policies cada), índices e trigger `updated_at` com `search_path` fixo (EXECUTADO no Supabase)
- [feat] `src/types/workout.ts` — WorkoutSet, WorkoutExercise, CardioEntry, WorkoutDayData, WorkoutRow, WorkoutTemplate, WorkoutState
- [feat] `src/hooks/useWorkout.ts` — carrega/salva treino por data, gerencia templates (Opção A: array JSONB), `kcalPerSet()`, sincroniza `kcalTreino` no `diary_entries` ao salvar, `getLastWorkoutForExercise()` para prev-ref (Sessão 3B)
- [feat] `src/pages/TreinoPage.tsx` — estrutura base fiel ao original: card-header (📊/📖/Salvar), tmpl-section colapsável com grid de rotinas, ex-list, accordions Cardio+Timer, campo de nota, workout-summary (4 KPIs)

### Notas
- Sessão 3A concluída — Fase 3 em andamento
- SQL executado no Supabase; função `update_updated_at_column` com `SECURITY DEFINER + SET search_path = ''` (elimina warning de segurança)
- Funcionalidade de adicionar exercícios/cardio e botão Salvar: Sessões 3B e 3C
- Deploy pendente para próxima sessão

---

## [0.7.0] — 2026-03-08

### Adicionado
- [feat] Navegação por data global — `dateStore` (Zustand): selectedDate, goToPrev, goToNext, goToToday, isToday
- [feat] `DateNavBar` — header global em todas as abas: nome da página (esq) + btn "hoje" + date-pill `‹ Dom, 08/03 ›` (dir)
- [feat] Banner roxo "📅 Editando: [data] → Hoje" aparece em todas as abas ao navegar para dia diferente de hoje
- [feat] Zustand instalado como dependência

### Melhorado
- [improve] `useDiary(date?)` — aceita `date` como parâmetro (default = hoje); recarrega dados do Supabase ao mudar data
- [improve] `DiarioPage` e `HomePage` — usam `selectedDate` do dateStore; dados carregados dinamicamente por data
- [improve] `DiarioPage` — header redundante "Diário" removido do card de totais (título já no DateNavBar)

### Notas técnicas
- DateNavBar integrado no `AppLayout` (fora do `<main>`) — persiste ao trocar de aba sem re-render
- btn "hoje" invisível quando é hoje (opacity: 0, pointerEvents: none) — idêntico ao `.btn-hoje.visible` do original
- `›` desabilitado visualmente quando selectedDate === hoje (não avança além de hoje)
- Fiel ao original: CSS `.date-pill` (L111), `.date-nav-btn` (L1637), `.btn-hoje` (L2072), `updateDayBanner` (L8088)

### Sessão 2E concluída — Fase 2 CONCLUÍDA
- Pré-requisito para Fase 3 (TreinoPage) cumprido

---

## [0.6.0] — 2026-03-08

### Adicionado
- [feat] HomePage — saudação dinâmica por hora: "Bom dia 👋" / "Boa tarde 👋" / "Boa noite 🌙" (fiel ao original linha 4446)
- [feat] HomePage — Card "⚡ Energia Hoje" separado com KPI row de 4 colunas: kcal in / basal / treino / saldo; sem BMR exibe mensagem de configuração; `energy-meta-line` vertical no fim da barra
- [feat] HomePage — HabitTracker placeholder no topo com estilo `.habit-card` fiel ao original (rgba(0,0,0,.35), border rgba(124,92,255,.22)); 5 hábitos (dieta/log/treino/cardio/medidas) desabilitados até Fase 4
- [feat] HomePage — Grid de ações 2×2: Diário / Treino / Corpo / Mais; botão full-width "Meu Perfil Nutricional" placeholder (disabled, Fase 4)

### Melhorado
- [improve] HomePage — Card de progresso clicável → navega para /diario (fiel ao original `onclick="openTab('diario')"`)
- [improve] HomePage — macros: labels uppercase com `letter-spacing:.06em`, barra 4px (era 6px), cores `--pColor/--cColor/--gColor` (era `--good/--warn/--bad`)
- [improve] HomePage — título do gráfico "📅 Últimos 7 dias" + botão "📊 histórico" (placeholder disabled — modal na Fase futura)
- [improve] HomePage — data formatada com primeira letra maiúscula (fiel ao `charAt(0).toUpperCase()` do original)
- [improve] HomePage — padding-bottom com safe-area-inset-bottom para não sobrepor Nav

### Notas técnicas
- Port completo da viewHome (HTML linha 2114, CSS linha 1817, JS linha 4438 do referência.index.html)
- Botão "📊 histórico" e "Meu Perfil Nutricional" ficam disabled — modais implementados nas fases futuras
- EnergyCard exibe TDEE como nota de rodapé quando disponível (não estava no original, adição leve)

### Pendências registradas
- Modal "📊 histórico semanal" — implementar quando TreinoPage tiver dados de kcal de treino (Fase 3)
- "Meu Perfil Nutricional" (wizard JP7) — Fase 4
- HabitTracker real — Fase 4
- TEST: celular real (375px, toque, teclado virtual, safe-area) — válido para toda Fase 2
- TEST: persistência multi-dispositivo — válido para toda Fase 2

---

## [0.5.0] — 2026-03-08

### Adicionado
- [feat] CustomFoodModal — bottom sheet com form-grid cols-2: nome, porção, P/C/G/kcal; cálculo automático de kcal via (p×4)+(c×4)+(g×9) com override manual e link "↺ recalcular"
- [feat] FoodDrawer — botão "➕ Criar alimento personalizado" (fd-custom-btn fiel ao original: dashed border roxo, bg rgba(124,92,255,.06))
- [feat] FoodDrawer — aba "⭐ Meus" aparece dinamicamente quando há alimentos personalizados; após salvar, ativa automaticamente a aba
- [feat] useDiary.getWeekKcal() — busca kcal de múltiplas datas em 1 query Supabase (`.in('date', dates)`)
- [feat] WeeklyChart real na HomePage — 7 dias Seg→Dom com barras normalizadas, linha de meta dashed, hoje destacado com border accent2, dias sem dado com opacity .4, dias futuros sem barra, projeção kg/semana (≥2 dias)

### Melhorado
- [improve] FoodDrawer — drawer termina em `calc(56px + env(safe-area-inset-bottom))` acima da Nav, resolvendo sobreposição do botão pela barra de navegação
- [improve] FoodDrawer — zIndex 60/59 (overlay+drawer acima da Nav z-50)
- [improve] HomePage — removido guard EmptyState que bloqueava a página quando não havia settings; defaults para zero em todos os targets

### Corrigido
- [fix] FoodDrawer — alimentos personalizados não entravam em nenhuma categoria; corrigido com aba dedicada `__custom__` e inclusão em `allDbItems` (aba "Todos" e busca)

### Descartado
- fd-peek (lista "Adicionados hoje" colapsável): desnecessário — Kcalix já mostra alimentos dentro do accordion de cada refeição, solução superior ao original

### Notas técnicas
- WeeklyChart: hoje usa `diary.totals.kcal` do estado local (sem lag), demais dias do Supabase
- CustomFoodModal: estado efêmero em `customFoods[]` local no FoodDrawer — persistência real planejada para Fase 5 (migração)
- Projeção semanal: `kgPerWeek = (avgBalance × 7) / 7700`, só exibe com ≥2 dias com dado

### Pendências registradas
- DiarioPage: barras P/C/G no KpiCard não pintam sem meta configurada (target===0) — aguarda wizard Fase 4 ou fallback visual
- TEST: persistência multi-dispositivo (mesmo dado em dois navegadores)
- TEST: celular real (375px, toque, teclado virtual, safe-area)

---

## [0.4.0] — 2026-03-07

### Melhorado
- [improve] DiarioPage — visual fiel ao original: KPI grid com barra colorida no topo, linha kcal gradient text (roxo→verde), status pills com dot colorido e diff por macro, accordion de meals (1 aberto por vez), summary "P·C·G" no header colapsado, quick buttons +.5P/+1P/+.5C/+1C/+.5G/+1G
- [improve] FoodDrawer — visual fiel ao original: gradiente escuro (#1a2035→#121828), handle, busca com ícone 🔍 e botão ✕ de limpar, cat-tabs com gradiente roxo ativo, food-items como cards bordados
- [improve] FoodPortionModal — bottom sheet real (sobe da base), qty decimal (−.5/−.1/+.1/+.5), input direto, macro boxes 4 colunas coloridas, meal-select-row fiel ao original
- [improve] index.css — variáveis --pColor/--cColor/--gColor; ambient glow body::before/::after

### Corrigido
- [fix] Bug arquitetural: FoodPortionModal instanciava useDiary() próprio, não sincronizando com DiarioPage — corrigido passando addFoodOptimistic via props (DiarioPage → FoodDrawer → FoodPortionModal)
- [fix] Fluxo de adição idêntico ao original: botão único "🍽️ Adicionar alimentos" no card de totais, refeição selecionada dentro do modal
- [fix] Quantidade decimal no FoodPortionModal: min=0.1, step=0.1 (era inteiro com clamp mínimo 1)

### Adicionado
- [feat] addFoodOptimistic() em useDiary — atualiza estado React imediatamente, persiste Supabase em background sem bloquear UI
- [feat] Skill /port — metodologia de port destilada da sessão 2C, com mapa de linhas do original, regras de fidelidade CSS/React/TS e checklist

### Notas técnicas
- Estado único: useDiary() instanciado só no DiarioPage; callbacks descem via props
- Optimistic UI: setDiary(next) → upsert background sem await bloqueante
- Bottom sheets: background linear-gradient(180deg, #1a2035, #121828) fiel ao .modal-sheet original

### Pendências (Sessão 2D)
- Gráfico semanal real na HomePage — ler 7 dias do Supabase
- Testar no celular real (375px, toque, teclado virtual, safe-area)
- FoodDrawer: fd-peek (adicionados hoje) + botão "Criar alimento personalizado"

---

## [0.3.0] — 2026-03-07

### Adicionado
- [feat] foodDb.ts — FOOD_DB extraído do app original, 9 categorias, ~130 itens tipados
- [feat] DiarioPage — 6 seções de refeição (Café, Lanche 1, Almoço, Lanche 2, Jantar, Ceia), totais do dia, barras de macro
- [feat] FoodDrawer — bottom sheet 88dvh, busca global em tempo real, abas Recentes/Todos/categorias
- [feat] FoodPortionModal — ajuste de quantidade, preview ao vivo de macros, persistência no Supabase
- [feat] getRecentFoods() — últimos 10 alimentos únicos varrendo histórico de diary_entries

### Corrigido
- [fix] useDiary — corrigido de 4 para 6 refeições (cafe, lanche1, almoco, lanche2, jantar, ceia)
- [fix] Optimistic update em addFood/removeFood — UI atualiza imediatamente, reverte em caso de erro de rede
- [fix] FoodPortionModal — quantidade mínima 1, steps inteiros (removido clamp de 0.5 que impedia adicionar)

### Decisoes tecnicas
- MEALS do app original tem 6 refeições (não 4 como estava no useDiary inicial) — corrigido após leitura do referência.index.html
- Optimistic update: setDiary(next) antes do await upsert, rollback com setDiary(previous) se error

### Pendencias (Sessao 2C — polish)
- Layout geral da DiarioPage e FoodDrawer precisa de refinamento visual
- FoodPortionModal: aceitar input numérico direto além dos botões +-
- Gráfico semanal na HomePage: ler últimos 7 dias do Supabase (atualmente só mostra dia atual)
- Testar persistência multi-dispositivo
- Testar no celular real (375px, toque, teclado virtual, safe-area)

---

## [0.2.0] — 2026-03-07

### Adicionado
- [feat] Nav — barra de 5 abas (Home, Diário, Treino, Corpo, Mais) com safe-area-inset-bottom para iPhone X+
- [feat] AppLayout — layout com Outlet + Nav inferior, rotas /home /diario /treino /corpo /mais
- [feat] HomePage — cards de energia (kcal consumida/meta, barra de progresso), macros (P/C/G), balanço calórico, gráfico semanal, hábitos placeholder
- [feat] useSettings — hook que lê/salva user_settings (JSONB) no Supabase
- [feat] useDiary — hook que lê/salva diary_entries do dia (JSONB) no Supabase, com addFood/removeFood/setKcalTreino
- [feat] goalPresets.ts — GOAL_PRESETS, WZ_ACTIVITY_LABELS, GoalType (portado do app original linha 4608)
- [feat] calculators.ts — bmrMifflin, bmrKatch, bodyDensityJP7, bfSiri, calcFromProfile() (portado do app original linhas 5124-5208)

### Removido
- [remove] DashboardPage.tsx — substituído pela estrutura de abas (AppLayout + HomePage)

### Decisoes tecnicas
- calcAll() do app original não é portável (acoplada ao DOM) — substituída por calcFromProfile(profile) com parâmetros tipados
- Card de hábitos na HomePage = placeholder estático — hook real implementado na Sessão 4 junto com CorpoPage/HabitosPage
- Gráfico semanal exibe apenas o dia atual enquanto não há histórico acumulado — Sessão 2B completa isso

### Pendencias
- Sessão 2B: DiarioPage + FoodDrawer + FoodPortionModal + foodDb.ts
- Testar reset de senha por email (rate limit atingido em 2026-03-07)
- Testar no celular real (375px, toque, teclado virtual)

---

## [0.1.0] — 2026-03-07

### Adicionado
- [feat] Autenticacao completa com email/senha via Supabase
- [feat] LoginPage — formulario de login + recuperacao de senha
- [feat] SetPasswordPage — define senha via link de convite ou reset (detecta tokens via onAuthStateChange)
- [feat] DashboardPage — placeholder pos-login com logout e link para admin
- [feat] AdminPage em `/kcx-studio` — CRUD de emails autorizados + instrucao de convite manual
- [feat] Roteamento com guards PrivateRoute / AdminRoute / PublicRoute
- [feat] authStore — estado global de autenticacao reativo sem biblioteca externa
- [feat] Schema completo do banco: profiles, user_settings, diary_entries, workouts, workout_templates, body_measurements, habits, checkins, custom_exercises, authorized_emails
- [feat] RLS em todas as tabelas — cada usuario acessa apenas seus proprios dados
- [feat] Triggers: criacao automatica de perfil ao primeiro login, updated_at automatico
- [feat] Policy admin_only em authorized_emails — somente adilson.matioli@gmail.com tem acesso

### Decisoes tecnicas
- Google OAuth adiado — email/senha suficiente para MVP
- Resend adiado — sem dominio proprio ainda, usando email Supabase
- Convite manual via painel Supabase (Authentication > Users > Invite user) — evita expor service_role key no frontend
- Rota admin ofuscada: `/kcx-studio`
- Email admin via VITE_ADMIN_EMAIL no .env.local (nunca commitado)

### Banco de dados
- `supabase/migrations/001_initial_schema.sql` — schema completo + RLS + triggers
- `supabase/migrations/003_admin_policy.sql` — policy admin para authorized_emails

### Pendentes para proxima sessao (validacao)
- Testar fluxo de reset de senha por email (rate limit atingido em 2026-03-07)
- Testar no celular real (375px, toque, teclado virtual)
- Configurar Resend quando tiver dominio proprio

---

## [0.0.1] — 2026-03-07

### Adicionado
- [feat] Setup inicial — Vite + React + TypeScript + Tailwind + Supabase
- [feat] Estrutura de pastas: pages, components, lib, store, hooks, types
- [feat] Repositorio GitHub + Vercel configurados
- [feat] Skills Claude Code em .claude/commands/
- [docs] ROADMAP.md e MEMORY.md criados
