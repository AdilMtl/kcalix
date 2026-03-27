# Kcalix — CHANGELOG

## [v0.53.0] — 2026-03-26

### Adicionado
- [feat] Fase 6C-2: múltiplas mensagens ativas simultâneas — `publish()` deixa de arquivar tudo automaticamente; admin controla coexistência individualmente (`useAppMessage.ts`)
- [feat] Fase 6C-2: agendamento com `starts_at` e expiração com `expires_at` (data + hora) no formulário admin — ativa campos já existentes no schema 014 sem migration (`AdminPage.tsx`)
- [feat] Fase 6C-2: prioridade manual por mensagem — campo numérico no formulário; `useAppMessage` ordena por `priority DESC` (`AdminPage.tsx`, `useAppMessage.ts`)
- [feat] Fase 6C-2: imagem via URL no modal de broadcast — renderiza acima do emoji; `onError` oculta silenciosamente se URL inválida (`AppMessageModal.tsx`)
- [feat] Fase 6C-2: segmentação por email — `targeting: { emails: [...] }` filtra destinatários no frontend; toggle "Todos / Selecionar" com checkboxes de usuários ativos (`AdminPage.tsx`, `useAppMessage.ts`)
- [feat] Fase 6C-2: badges de status nos cards admin — ativa (verde) / agendada (roxo) / expirada / arquivada com datas de agendamento e expiração visíveis (`AdminPage.tsx`)
- [feat] Fase 6C-2: botão "Pré-visualizar" no formulário — abre `AppMessageModal` real com dados em tempo real; placeholder `picsum.photos` quando sem imagem (`AdminPage.tsx`)
- [feat] Fase 6C-2: botão "Ver" em todos os cards — admin vê a mensagem exatamente como o usuário vê, com "Fechar" no lugar de "Entendido ✓" (`AdminPage.tsx`, `AppMessageModal.tsx`)

### Corrigido
- [fix] Modal broadcast reabrindo na mesma sessão ao trocar de aba ou re-render — adicionado guard `useRef appMessageShown` no `useEffect` (`HomePage.tsx`)

### Notas
- Sem migration: todos os campos (`starts_at`, `expires_at`, `priority`, `image_url`, `targeting`) já existiam no schema 014 como nullable/com default
- Segmentação por email é filtrada no frontend (todos os usuários são confiáveis/convidados); mover para RLS quando app for público
- CTA (botão de link) e segmentação por plano ficam para 6C-3+

## [v0.45.0] — 2026-03-23

### Adicionado
- [feat] Fase 7B-2: bloco `action:'parse-food'` isolado na Edge Function `ai-chat` — `parseFoodHandler()` recebe `{text, foodIndex}`, retorna `{meal, items[]}` com `source:'db'|'custom'`; `temperature:0`, `max_tokens:400`; limpeza de ```json``` do output; guard `if(body.action==='parse-food')` antes do fluxo de chat
- [feat] Fase 7B-3: `useAiChat.ts` — `mockParseFood()` removido; chamada real à Edge Function `action:'parse-food'`; `toLogItem()` converte response para `PendingLogItem` com macros por 100g (db=lookup local, custom=macros da IA); `loading:true` durante parse

### Documentação
- [doc] `memory/supabase-edge-functions-deploy.md` — guia completo de deploy de Edge Functions: `--no-verify-jwt`, como obter JWT, 3 curls de verificação, rollback com tags git, sintomas comuns
- [doc] `memory/spec-7B-2-parse-food-edge-function.md` — spec detalhada com padrão de isolamento, prompt, tratamento de erro e checklist
- [doc] `memory/AI_Roadmap.md` — 7B-4 documentada (IA decide intenção, remove regex); status 7B-2 e 7B-3 fechados
- [ops] Tags git: `v0.40.0-ai-chat-stable` e `v0.44.0-ai-chat-stable` criadas como pontos de restauração

### Notas
- Custo parse-food: ~$0.00007/chamada (100x mais barato que o chat)
- Chat normal (`action` ausente) continua intocado — guard não afeta fluxo existente
- LOG_TRIGGERS (regex de detecção) mantido com nota 7B-4 — será substituído por detecção via IA
- Próximo: 7B-4 (IA decide intenção, unifica chat+log num fluxo único sem regex) ou 7C (foto para macros)

## [v0.43.0] — 2026-03-23

### Adicionado
- [feat] Fase 7B-3b: `AiLogConfirmModal` — itens `source:'custom'` ganham badge ✨ Novo + campos P/C/G editáveis inline com kcal recalculado automaticamente (p×4 + c×4 + g×9)
- [feat] Fase 7B-3b: `useCustomFoods` — `saveCustomFood()` retorna `FoodItem` com id real; novos: `findCustomFood()` (dedup por nome), `updateCustomFood()`, `deleteCustomFood()`
- [feat] Fase 7B-3b: `AiChatModal` — instancia `useCustomFoods()` diretamente (sem prop chain); `handleConfirmLog()` vira async; verifica duplicata antes de criar; salva custom com macros por 100g
- [feat] `FoodDrawer` — botões ✏️ editar e 🗑️ excluir nos alimentos personalizados; `CustomFoodModal` reutilizado no modo edição com `initialValues`; confirmação antes de excluir
- [feat] `CustomFoodModal` — aceita `initialValues` para modo edição; título e botão adaptam ao contexto

### Corrigido
- [fix] Alimento custom sendo criado duplicado ao confirmar o mesmo log duas vezes — `findCustomFood()` verifica por nome antes de chamar `saveCustomFood()`
- [fix] Macros do custom food ficavam inconsistentes ao editar gramas — alimento sempre salvo com porção 100g (padrão do banco); diário registra a quantidade real separadamente
- [fix] Catch silencioso mascarava erros de criação de alimento — removido; erro agora sobe normalmente

### Notas
- Mock fixo (1 item db + 1 item custom) ativo para validar fluxo — será substituído pela Edge Function `action:'parse-food'` na Fase 7B-2
- Fluxo completo validado: detecta intenção → modal de confirmação → dedup → cria custom_food se novo → insere no diário
- `useCustomFoods` agora é hook completo (CRUD total); pode ser instanciado em qualquer componente sem prop chain

## [v0.42.0] — 2026-03-23

### Adicionado
- [feat] Fase 7B-1: `AiLogConfirmModal` — modal de confirmação de alimentos detectados no chat com gramas editáveis por item, totalizador de macros em tempo real (P/C/G/kcal) e dropdown de refeição pré-selecionado por palavras-chave
- [feat] Fase 7B-1: `useAiChat` — tipos `PendingLogItem`/`PendingLog`, detecção de intenção de log por palavras-chave (`comi`, `almocei`, `jantei`, etc.) no frontend sem chamar a Edge Function; mock retorna alimentos reais do `FOOD_DB` com base no texto
- [feat] Fase 7B-1: `getFoodIndex()` em `foodDb.ts` — índice compacto (~200 tokens) das 9 categorias do banco para uso na Edge Function na Fase 7B-2
- [feat] Fase 7B-3a: `addFoodsToDiary()` — função standalone em `useDiary.ts` que lê o estado atual do banco antes de escrever; elimina race condition entre instâncias do hook
- [feat] Fase 7B-3a: `addFoodsOptimistic()` — variante plural do addFoodOptimistic; insere múltiplos itens num único upsert evitando sobrescrita
- [feat] Fase 7B-3a: `App.tsx` — `AiChatModal` recebe `onAddFoods` via `addFoodsToDiary` standalone; inserção real no diário de hoje a partir do chat

### Corrigido
- [fix] Toast de confirmação sobrepondo mensagens do chat — substituído por mensagem do coach no próprio histórico listando itens e gramas confirmados
- [fix] Gramas editadas no modal não sendo salvas — `forEach` com múltiplos `onAddFood` causava race condition no closure do `diary`; corrigido com upsert único via `addFoodsOptimistic`
- [fix] Duplicatas ao reabrir o chat — `useDiary` instanciado no `AppLayout` ficava desincronizado da `DiarioPage`; corrigido removendo a instância do layout e usando `addFoodsToDiary` standalone

### Notas
- Edge Function `ai-chat` não foi alterada — chat existente continua funcionando normalmente
- Mock só retorna `source:'db'` (alimentos do banco); fluxo de custom food vem na Fase 7B-3b
- Próximo: Fase 7B-2 (bloco `parse-food` na Edge Function) ou 7B-3b (custom food) + deploy conjunto

## [v0.40.0] — 2026-03-20

### Melhorado
- [improve] `supabase/functions/ai-chat/index.ts` — 5 fixes de qualidade no agente Kcal Coach:
  - **FIX 1 (crítico):** filtro de séries válidas corrigido — `s.reps > 0` (string vs number, sempre false) → `parseFloat(s.reps) > 0 || s.reps === 'falha'`; volume de treino passa a funcionar corretamente
  - **FIX 2 (crítico):** mapa inline `EX_MAP` (90 exercícios) resolve `exercicioId → nome/grupo` no Deno runtime — `WorkoutExercise` não persiste nome/grupo no JSONB do banco, causava `undefined (undefined)` na análise de treino
  - **FIX 3 (crítico):** data de hoje injetada no topo do contexto (`"Hoje: 2026-03-20 (quinta-feira)"`) — modelo agora sabe o que é "hoje" sem inferir pela data mais recente; janela de diário ampliada para 8 dias
  - **FIX 4 (alto):** `detectIntent()` acumula flags de toda a conversa — antes analisava só a última mensagem; agora contexto de treino/diário persiste ao longo de conversas multi-turn
  - **FIX 5 (médio):** `max_tokens` ampliado — 600/700/800/1000 conforme complexidade (antes 450/600/900)
- Deploy: `supabase functions deploy ai-chat --no-verify-jwt` — ao vivo em 2026-03-20

### Notas
- Custo por mensagem mantido em ~2,800 tokens (~$0.00064) apesar dos fixes — sem regressão de eficiência
- Benchmark registrado no ROADMAP.md → Fase 7A → Benchmark de tokens

## [v0.33.0] — 2026-03-17

### Corrigido
- [fix] `src/components/TemplateHistoryModal.tsx` — `dangerouslySetInnerHTML` removido; `item.detalhe` agora renderizado como texto puro via `{item.detalhe}`. Fecha vulnerabilidade XSS (OWASP A03) catalogada na auditoria de 2026-03-16.
- [fix] `src/hooks/useMuscleVolume.ts` — 7 campos `detalhe` nos insights convertidos de HTML strings (`<b>`, `<br>`) para texto puro. `dangerouslySetInnerHTML` não existe mais em nenhum arquivo do projeto.

### Documentação
- [doc] `memory/AI_Roadmap.md` — roadmap técnico completo da Fase 7 (IA): arquitetura, decisões, specs de 4 sessões (7A-1, 7A-2, 7B, 7C), alternativas técnicas avaliadas, capítulo de segurança com pendências e código de implementação futura
- [doc] `memory/spec-fase-7A-1-ai-chat.md` — spec detalhada da próxima sessão: Edge Function `ai-chat`, fluxo interno, critérios de feito, pré-requisitos externos

### Notas
- Auditoria OWASP realizada: 7/10 categorias cobertas; único item de severidade média (XSS) fechado nesta sessão; 4 itens baixa severidade documentados para implementação futura
- Arquitetura da Fase 7 decidida: Supabase Edge Function (mesmo padrão do `invite-user`), GPT-4o mini, chat em memória no MVP
- Cloudflare Workers avaliado e descartado: zero benefício concreto para o estágio atual
- **Pré-requisito externo antes da sessão 7A-1:** configurar `OPENAI_API_KEY` no Supabase secrets e no Vercel (ver ROADMAP.md → Fase 7)

## [v0.30.0] — 2026-03-16

### Adicionado
- [feat] `supabase/functions/invite-user/index.ts` — Edge Function que envia convite Supabase diretamente do app; valida JWT admin + chama `supabase.auth.admin.inviteUserByEmail()` com service_role no servidor
- [feat] `supabase/migrations/012_admin_features.sql` — `ADD COLUMN ativo BOOLEAN DEFAULT true` em `authorized_emails`; permite desativar/reativar acesso por usuário
- [feat] `src/pages/AdminPage.tsx` — painel CRUD completo redesenhado: cards com status (⏳ Pendente / 📨 Convidado / 🟢 Ativo / 🔴 Desativado), botões Enviar convite, Reenviar, Desativar/Reativar, Remover, feedback inline por card
- [feat] `src/lib/auth.ts` — `inviteUser(email)`, `setUserAtivo(email, ativo)`, `checkUserAtivo(email)`
- [feat] `src/types/auth.ts` — campo `ativo: boolean` em `AuthorizedEmail`
- [feat] `src/pages/MaisPage.tsx` — card "⚙️ Painel admin" visível exclusivamente para `isAdmin`; link direto para `/kcx-studio`

### Corrigido
- [fix] `src/App.tsx` — eliminado loop infinito de 403 no `PrivateRoute`; `checkUserAtivo` retorna `true` em erro de RLS (usuários normais sem acesso à tabela)
- [fix] `src/pages/LoginPage.tsx` — banner vermelho "Sua conta foi desativada" exibido via `sessionStorage` ao ser bloqueado pelo admin

### Notas
- Edge Function deployada: `invite-user` no projeto Supabase `klvqyczfqxrbybgljnhe`
- Secret `ADMIN_EMAIL` configurado nas variáveis de ambiente da Edge Function
- **Pendente para produção:** adicionar `VITE_ADMIN_EMAIL=adilson.matioli@gmail.com` nas env vars do Vercel
- Commit local apenas — push na próxima sessão após refinamentos

## [v0.27.1] — 2026-03-15

### Corrigido
- [fix] `src/lib/dateUtils.ts` (novo) — `todayISO()` centralizada com compensação de fuso horário (fiel ao original L3711). `new Date().toISOString()` retorna UTC — no Brasil (UTC-3) o app virava o dia às 21h local
- [fix] Todas as ocorrências de `todayISO()` inline substituídas pelo utilitário centralizado: `useDiary`, `useWorkout`, `useHabits`, `useMuscleVolume`, `useCheckins`, `dateStore`, `HomePage`, `MaisPage`, `WeeklyKcalModal`, `HabitHistoryModal`, `TemplateHistoryModal`

### Notas
- Bug detectado às 22h43 BRT — app já mostrava segunda-feira enquanto ainda era domingo
- Dados já gravados com data errada no Supabase não foram alterados (impacto mínimo — só o dia do bug)

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
