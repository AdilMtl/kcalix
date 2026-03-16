# Kcalix — CHANGELOG

## [v0.27.0] — 2026-03-15

### Adicionado
- [feat] `src/components/ErrorBoundary.tsx` — Error Boundary global: captura erros React não tratados e exibe tela de fallback ⚠️ "Algo deu errado" com botão "Recarregar"; mensagem técnica visível apenas em dev
- [feat] `src/components/UpdateToast.tsx` — banner fixo "🔄 Nova versão disponível" ao detectar Service Worker atualizado; botão "Atualizar" força ativação imediata da nova versão
- [feat] Code Splitting por rota — 5 páginas (Home, Diário, Treino, Corpo, Mais) convertidas para `React.lazy()` com `Suspense`; bundle inicial reduzido de 666KB → 430KB

### Melhorado
- [improve] `src/App.tsx` — imports lazy + `<Suspense>` no AppLayout
- [improve] `src/main.tsx` — `<ErrorBoundary>` envolvendo `<App>`
- [improve] `tsconfig.app.json` — tipo `vite-plugin-pwa/client` adicionado

### Notas
- Fase 6B parcialmente concluída: itens 1 (Error Boundary), 3 (SW Update Toast) e 4 (Code Splitting) feitos
- Pendentes na Fase 6B: Item 5 (Vitest), Item 6 (CI/CD), Item 8 (Loading states), Item 9 (OG Tags), Item 10 (AdminPage convite direto)
- UpdateToast não testável em localhost (SW desabilitado em dev) — validar após deploy

## [v0.24.0] — 2026-03-14

### Adicionado
- [feat] `src/lib/exportData.ts` — checkins incluídos no export do Kcalix (campo estava ausente no JSON gerado)
- [feat] `src/hooks/useCheckins.ts` — auto-cálculo de BF% via JP7 ao salvar checkin quando `bfPct` não é informado manualmente e skinfolds estão configuradas no perfil

### Corrigido
- [fix] `src/lib/migrationTransform.ts` — checkins retornavam camelCase no upsert; Supabase esperava snake_case (`weight_kg`, `activity_type`, etc.) — causava erro PGRST204
- [fix] `src/lib/migrationTransform.ts` — deduplicação de checkins por data com mesclagem: registro duplicado na mesma data preserva campos não-nulos do segundo registro (ex: `bfPct` atualizado)

### Notas
- Bug recorrente de schema Supabase confirmado em `checkins` (011): tabela criada sem colunas corretas. SQL de fix documentado em `memory/supabase-utils.md`
- Sessão 5D (testes de compatibilidade) concluída informalmente via comparação de exports reais
- Melhorias futuras de composição corporal planejadas em `memory/ROADMAP.md` (histórico de dobras por data, BF% histórico, etc.)

## [v0.23.0] — 2026-03-14

### Adicionado
- [feat] `src/lib/exportData.ts` — `exportAll(userId)`: busca as 8 tabelas do Supabase em paralelo e gera JSON no formato `FullExport` idêntico ao export do blocos-tracker
- [feat] `src/pages/MaisPage.tsx` — Card "📦 Exportar dados" com botão "⬇️ Baixar backup completo" e estado de loading; arquivo gerado: `kcalix-export-YYYY-MM-DD.json`

### Corrigido
- [fix] `src/lib/migrationTransform.ts` — `validateExport` agora aceita `_app: 'kcalix'` além de `'blocos-tracker'` — permite reimportar o próprio export do Kcalix
- [fix] `src/pages/MaisPage.tsx` — BMR e TDEE exibidos com `Math.round` (sem casas decimais infinitas)

### Notas
- Export validado: comparação entre JSON do blocos-tracker (2026-03-09) e Kcalix/Supabase (2026-03-14) — dados de diary, workouts, body e templates 100% íntegros
- Pendente Sessão 5D: (1) CorpoPage → salvar dobras atualiza `user_settings.skinfolds`; (2) import de checkins do app antigo. Spec em `memory/spec-sessao-5D.md`

## [v0.15.0] — 2026-03-09

### Adicionado
- [feat] `CalcWizardModal.tsx` — wizard fullscreen 5 etapas (Welcome → Dados → Dobras → Objetivo → Atividade) com preview BMR/TDEE em tempo real
- [feat] `MaisPage.tsx` — port completo: NutriBanner dinâmico, accordion Metas diárias, Calculadora de perfil manual, card Exportar para IA, Card Configurações com equivalência de bloco + kcal por bloco + Auto-salvar
- [feat] `useSettings.ts` — campos opcionais `pKg`, `cKg`, `minFatKg`, `def`, `blocks`, `kcalPerBlock`
- [feat] `index.css` — port de ~320 linhas de CSS estrutural do original: `.btn`, `.card`, `.accordion`, `.kpi-grid`, `.form-grid`, `.form-row`, `.grid3`, `.hint`, `.calc-wizard`, `.wz-*` e demais classes base

### Corrigido
- [fix] `useDiary.ts` — merge defensivo ao carregar do Supabase: `totals` ausente em dados antigos causava crash `Cannot read properties of undefined (reading 'kcal')` na HomePage
- [fix] `MaisPage.tsx` — substituídas classes `kpi-cell`/`kpi-val` (inexistentes) pelas corretas `.kpi`/`.kpi-value .num .den` do original
- [fix] `MaisPage.tsx` — "Exportar para IA" era Accordion incorretamente; portado como card fixo fiel ao original
- [fix] `MaisPage.tsx` — bloco "Auto-salvar" ausente no Card Configurações; adicionado

### Notas
- CSS estrutural estava faltando completamente — apenas tokens e ambient glow existiam no index.css. Causa: a spec assumia que as classes do original existiam, mas nunca foram portadas.
- Sessão 4C (HabitTracker) pendente para concluir Fase 4.

---

## [v0.14.0] — 2026-03-09

### Adicionado
- [feat] `CorpoPage.tsx` — 3 accordions: inputs do dia, dobras JP7, histórico 14 dias
- [feat] `useBody.ts` — CRUD body_measurements no Supabase
- [feat] `supabase/migrations/008_body_measurements.sql` — tabela com UNIQUE constraint correta
- [feat] `src/types/body.ts` — tipos BodyMeasurement, BodyRow

---

## [v0.13.0] — 2026-03-09

### Adicionado
- [feat] `useMuscleVolume.ts` — 5 insights automáticos, getAllExSessions, buildInsightsByGroup
- [feat] `CoachGuideModal.tsx` — 5 abas educativas (MEV/MAV/MRV, Volume Cycling, Rep Ranges, Deload, Progressão)
- [feat] `ExerciseProgressionModal.tsx` — PR badge, gráfico barras carga/volume toggle, tabela delta
- [feat] `TemplateHistoryModal.tsx` — 3 abas, KPIs, mg-cards com barra MEV/MRV, chips de insight
- [feat] `useWorkout.ts` — `getAllWorkoutRows()` busca 200 sessões históricas
- [fix] `supabase/migrations/006_fix_workouts_unique_constraint.sql` — UNIQUE constraint perdida

---

## [v0.12.0] — 2026-03-08

### Adicionado
- [feat] `TemplateEditorModal.tsx` — bottom sheet: nome, 8 cores, lista de exercícios, cardio padrão, delete two-tap
- [feat] `useWorkout.ts` — swapExercise in-place + applyTemplate
- [improve] `TreinoPage.tsx` — ✏️ em cada chip abre editor; "+ Nova rotina"; confirm() antes de applyTemplate

---

## [v0.11.0] — 2026-03-08

### Adicionado
- [feat] `TreinoPage.tsx` — cardio funcional, timer completo (tabs Timer/Cronômetro, 5 presets, countdown com cores), nota conectada ao setNota(), salvar de ponta a ponta

---

## [v0.10.0] — 2026-03-08

### Adicionado
- [feat] `useCustomExercises.ts` — CRUD Supabase; tabela custom_exercises (005)
- [feat] `CustomExerciseModal.tsx` — form: nome, grupo principal, grupos secundários
- [feat] `ExerciseSelector.tsx` — aba "⭐ Meus exercícios" + rename inline + delete + prop forceGroup
