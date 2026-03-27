# Kcalix v3 — Plano de Execucao Completo
**Data:** 2026-03-07
**Status:** Em execucao
**Tipo:** Documento de referencia entre sessoes — leia no /start de cada sessao

---

## Visao do Produto

**Produto:** SaaS PWA de nutricao + treino com autenticacao, dados na nuvem (Supabase) e base para IA integrada futura.
**Sucessor de:** Kcal.ix (blocos-tracker) — app antigo permanece ativo em paralelo.

### Planos
- **Free (MVP):** acesso por convite — admin autoriza emails manualmente
- **Premium (futuro):** Stripe vinculado — pagamento autoriza acesso automaticamente
- **Multi-dispositivo:** mesmo usuario no celular e computador, dados sincronizados
- **PWA:** instalavel via browser (Android + iOS + desktop), sem app store

### O que NAO muda
- Design visual: cores, dark mode, tokens CSS (`--accent: #7c5cff`, etc.)
- Logica de calculo: BMR, TDEE, volume muscular, JP7
- Protocolos Lucas Campos (MEV, MRV, volume cycling)
- Base de exercicios (EXERCISE_DB)
- Linguagem e UX em portugues brasileiro

### Repositorios e URLs
| Item | Valor |
|---|---|
| Repo novo | `AdilMtl/kcalix` -> `kcalix.vercel.app` |
| Repo antigo | `adilmtl/blocos-tracker` -> `adilmtl.github.io/blocos-tracker` |
| Diretorio local | `Desktop/Development/kcalix/` |
| Supabase | `klvqyczfqxrbybgljnhe.supabase.co` |

---

## Stack Tecnica

| Camada | Tecnologia |
|---|---|
| Frontend | React + Vite |
| Linguagem | TypeScript |
| Estilos | Tailwind CSS |
| Auth + Banco | Supabase |
| Deploy | Vercel |
| Email (futuro) | Resend — quando tiver dominio proprio |

---

## Modelo de Autenticacao (decidido em 2026-03-07)

### Fluxo MVP
```
Admin (/kcx-studio) adiciona email autorizado
-> Clica "Enviar convite"
-> Supabase envia email com link para definir senha
-> Usuario define senha -> acessa o app

Login recorrente: email + senha

Reset de senha: "Esqueci minha senha" -> email de reset do Supabase
```

### Futuro (Fase 7)
- Stripe integrado -> pagamento autoriza email automaticamente

### Decisoes e justificativas
- **Email/senha, nao Google OAuth:** Google OAuth exige Google Cloud Console + dominio verificado. Burocracia desnecessaria para MVP. Google pode ser adicionado depois sem mudar a arquitetura.
- **Supabase email, nao Resend agora:** Resend requer dominio proprio. Sem dominio ainda (usando kcalix.vercel.app). Supabase email suficiente para MVP com poucos usuarios.
- **Rota admin ofuscada:** `/kcx-studio` (nao /admin)
- **Email admin:** `adilson.matioli@gmail.com` via `VITE_ADMIN_EMAIL` no `.env.local`

---

## Seguranca — Camadas implementadas

| Camada | Mecanismo |
|---|---|
| Rota admin ofuscada | `/kcx-studio` — nao obvia para bots |
| Guard de rota | So acessa logado + email == VITE_ADMIN_EMAIL |
| RLS no banco | Habilitado em 100% das tabelas — policies FOR ALL com USING + WITH CHECK |
| Admin policy | `auth.jwt() ->> 'email'` — sem acesso a auth.users (corrigido 2026-03-16) |
| Mensagem generica | Erro de login nao revela se email existe |
| Env protegido | `VITE_ADMIN_EMAIL` e chaves nunca vao para o Git |
| Edge Function | invite-user valida JWT + email admin antes de executar; service_role key apenas no servidor |
| Supabase rate limit | Bloqueia forca bruta automaticamente |

---

## Auditoria de Segurança — Fragilidades mapeadas (2026-03-16)

Auditoria completa da arquitetura realizada em 2026-03-16. 6 fragilidades identificadas.

### Forças confirmadas (não mudar)
- ✅ RLS habilitado em 100% das tabelas (profiles, user_settings, diary_entries, workouts, workout_templates, body_measurements, habits, checkins, custom_exercises, custom_foods, authorized_emails)
- ✅ Policies `FOR ALL` com `USING` + `WITH CHECK` em todas as tabelas
- ✅ Convites via Supabase Auth nativo
- ✅ Edge Function com validação de admin (JWT + email)
- ✅ service_role key nunca exposta ao frontend
- ✅ Guards de rota React (PrivateRoute, AdminRoute, PublicRoute)
- ✅ Tokens gerenciados pelo Supabase SDK (sem localStorage manual)

### Fragilidades por severidade

> ⚠️ Nota pós-auditoria (2026-03-16): após análise detalhada, nenhuma fragilidade permite acesso de estranhos a dados de outros usuários — o RLS cobre tudo. As severidades abaixo refletem risco real, não teórico.

#### 🟡 BAIXA-MÉDIA — XSS em TemplateHistoryModal
- **Arquivo:** `src/components/TemplateHistoryModal.tsx`
- **Problema:** `dangerouslySetInnerHTML={{ __html: item.detalhe }}` onde `item.detalhe` contém `exNome` vindo de `custom_exercises` (input do usuário)
- **Impacto real:** Cada usuário só vê seus próprios exercícios — XSS afetaria apenas o próprio usuário que criou o nome malicioso. Risco aumenta com múltiplos usuários no futuro.
- **Fix:** Remover `dangerouslySetInnerHTML`, refatorar para JSX puro
- **Status:** [ ] Pendente — corrigir antes de abrir para muitos usuários

#### 🟢 BAIXA — Email admin exposto no frontend
- **Arquivo:** `src/store/authStore.ts:66`
- **Problema:** `VITE_ADMIN_EMAIL` visível no bundle — expõe identidade do admin
- **Impacto real:** Saber o email não dá acesso; RLS exige JWT autenticado desse email
- **Fix:** Criar campo `is_admin BOOLEAN` em `profiles`, remover `VITE_ADMIN_EMAIL` do frontend
- **Status:** [ ] Pendente — melhoria de boas práticas

#### 🟢 BAIXA — Sem rate limiting na Edge Function invite-user
- **Arquivo:** `supabase/functions/invite-user/index.ts`
- **Problema:** Sem limite de convites por período
- **Impacto real:** Só o admin autenticado pode chamar — risco só existe se conta admin for comprometida
- **Fix:** Máx 5 invites/hora via contador no banco
- **Status:** [ ] Pendente — melhoria para quando houver mais usuários

#### ✅ CONCLUÍDO — Personalização de emails de convite e reset de senha
- **Status:** [x] CONCLUÍDO (2026-03-16) — templates HTML com branding Kcalix aplicados no Supabase Dashboard

#### 🟢 COSMÉTICA — sessionStorage para flag "desativado"
- **Arquivo:** `src/pages/LoginPage.tsx`
- **Problema:** Flag `kcx_desativado` em sessionStorage pode ser deletada manualmente — banner some
- **Impacto real:** Puramente visual; backend bloqueia de verdade via `authorized_emails.ativo`
- **Fix:** Verificar status após login via `checkUserAtivo()`, sem sessionStorage
- **Status:** [ ] Pendente — baixíssima prioridade

#### 🟢 COSMÉTICA — checkUserAtivo retorna true em erro de rede
- **Arquivo:** `src/lib/auth.ts:82-93`
- **Problema:** Qualquer erro (inclusive timeout) libera o usuário
- **Impacto real:** Supabase tem 99.9%+ uptime; janela de exploração seria de segundos em instabilidade
- **Fix:** Checar código de erro `403` explicitamente
- **Status:** [ ] Pendente — baixíssima prioridade

#### 🟢 BAIXA — Admin policy dependente de email JWT
- **Arquivo:** `supabase/migrations/003_admin_policy.sql`
- **Problema:** Policy valida `auth.jwt() ->> 'email'` — JWT forging teórico se ANON_KEY vazar
- **Impacto real:** ANON_KEY é pública por design no Supabase; JWT é assinado com secret que nunca vaza
- **Fix:** Migrar para campo `is_admin` em `profiles` (depende do fix email admin acima)
- **Status:** [ ] Pendente — bloqueado pelo fix is_admin

### Checklist de segurança pré-deploy (aplicar a partir de agora)
- [ ] Nenhum `dangerouslySetInnerHTML` com dados de usuário sem sanitização
- [ ] Nenhuma chave sensível em código fonte (service_role, SMTP, etc.)
- [ ] Toda nova tabela tem RLS habilitado + policy `user_owns_data`
- [ ] Edge Functions novas validam JWT antes de executar
- [ ] Inputs de usuário não interpolados diretamente em HTML

### Checklist de segurança periódica (trimestral)
- [ ] Revisar usuários ativos — desativar contas inativas > 90 dias sem uso
- [ ] Auditar Edge Functions deployadas — remover funções obsoletas
- [ ] Verificar dependências com vulnerabilidades: `npm audit`
- [ ] Revisar variáveis de ambiente no Vercel — remover variáveis obsoletas
- [ ] Testar fluxo de convite e reset de senha end-to-end

---

## Arquitetura de Pastas

```
src/
+-- lib/
|   +-- supabase.ts        <- cliente Supabase
|   +-- auth.ts            <- signIn, signOut, resetPassword, sendInvite
+-- types/
|   +-- auth.ts            <- User, Session, Profile, AuthorizedEmail
|   +-- diary.ts
|   +-- workout.ts
|   +-- body.ts
+-- store/
|   +-- authStore.ts       <- usuario logado, sessao, loading
|   +-- diarioStore.ts
|   +-- treinoStore.ts
|   +-- corpoStore.ts
|   +-- settingsStore.ts
+-- pages/
|   +-- LoginPage.tsx          <- email + senha + "esqueci senha"
|   +-- SetPasswordPage.tsx    <- define senha (convite e reset)
|   +-- DashboardPage.tsx      <- placeholder pos-login (Fase 1)
|   +-- AdminPage.tsx          <- /kcx-studio: CRUD emails autorizados
|   +-- HomePage.tsx           <- Fase 2
|   +-- DiarioPage.tsx         <- Fase 2
|   +-- TreinoPage.tsx         <- Fase 3
|   +-- CorpoPage.tsx          <- Fase 4
|   +-- MaisPage.tsx           <- Fase 4
+-- components/
|   +-- Nav.tsx                <- barra inferior 5 abas
|   +-- ui/                    <- Button, Input, Card, etc.
+-- hooks/
    +-- useAuth.ts
    +-- useSync.ts
    +-- useDiary.ts
    +-- useWorkout.ts
    +-- useMuscleVolume.ts

supabase/migrations/
+-- 001_initial_schema.sql     <- tabelas + RLS + triggers (EXECUTADO)
+-- 003_admin_policy.sql       <- policy admin_only em authorized_emails (EXECUTADO)
```

---

## Status das Fases

| Fase | Descricao | Status |
|---|---|---|
| 0 | Setup do repositorio | CONCLUIDA (2026-03-07) |
| 1 | Autenticacao (email/senha + admin panel) | CONCLUIDA (2026-03-07) |
| 2 | Home e Diario | CONCLUIDA (2026-03-08) |
| 3 | Treino | CONCLUIDA (3A–3E — 2026-03-08) |
| 4 | Corpo, Habitos, Mais | CONCLUIDA (4A–4E — 2026-03-09) |
| 5 | Ferramenta de migracao | CONCLUIDA (2026-03-14) — import/export completo validado com dados reais |
| 6A | PWA base + Fix 404 SPA | CONCLUIDA (2026-03-15) |
| 6B | Qualidade e Robustez (Error Boundary, Onboarding, Testes) | Em andamento (itens 1, 2, 3, 4 concluídos — 2026-03-15) |
| 6C | SW Update Toast + Code Splitting | Planejada |
| 6D | Vitest — testes calculators + migrationTransform | Planejada |
| 6E | CI/CD + Loading states + OG Tags | Planejada |
| 7 | Freemium (Stripe) | Futuro |
| 8 | IA integrada | Futuro |

---

## FASE 0 — Setup do Repositorio — CONCLUIDA (2026-03-07)

- Vite + React + TypeScript + Tailwind instalados
- `@supabase/supabase-js` e `react-router-dom` instalados
- Estrutura de pastas criada
- `.env.local` com chaves do Supabase (fora do Git)
- Repositorio GitHub + Vercel funcionando
- Skills Claude Code criados em `.claude/commands/`

---

## FASE 1 — Autenticacao — CONCLUIDA (2026-03-07)

### O que foi feito
- SQL executado: tabelas, RLS, triggers, policy admin_only
- URL Configuration configurada no Supabase
- `src/lib/auth.ts` — signIn, signOut, resetPassword, updatePassword, admin ops
- `src/store/authStore.ts` — estado global reativo
- `src/types/auth.ts` — tipos TypeScript
- `src/pages/LoginPage.tsx` — email + senha + recuperacao de senha
- `src/pages/SetPasswordPage.tsx` — define senha via link (detecta tokens via onAuthStateChange)
- `src/pages/DashboardPage.tsx` — placeholder pos-login com logout
- `src/pages/AdminPage.tsx` — /kcx-studio: CRUD de emails autorizados
- `src/App.tsx` — roteamento com guards PrivateRoute/AdminRoute/PublicRoute
- Convite manual: Authentication -> Users -> Invite user no painel Supabase

### Checklist de validacao
- [x] SQL executado no Supabase sem erros
- [x] URL Configuration configurada
- [x] Login com email/senha funciona
- [x] Logout funciona
- [x] /kcx-studio acessivel so com email admin
- [ ] Testar reset de senha por email (rate limit atingido em 2026-03-07 — testar na proxima sessao)
- [ ] Testar no celular real (375px, toque, teclado virtual)

### Melhoria planejada — AdminPage: envio de convite direto (sem ir ao painel Supabase)

> Registrado em 2026-03-15. Ver spec completa na seção FASE 6B ITEM 10 abaixo.

**Problema atual:** o fluxo de convite exige 3 passos manuais fora do app:
1. Adicionar email no `/kcx-studio`
2. Ir ao Supabase Dashboard → Authentication → Users → Invite user
3. Colar o email manualmente

**O que muda:** botão "Enviar convite" diretamente no `/kcx-studio` que chama
`supabase.auth.admin.inviteUserByEmail()` via Edge Function (ou service_role key protegida),
dispara o email de convite do Supabase e marca `invited_at` automaticamente — tudo sem sair do app.

---

### Pendencias para proxima sessao
- Testar fluxo de reset de senha por email
- Testar no celular real antes de iniciar Fase 2

---

## FASE 2 — Home e Diario — CONCLUIDA (2026-03-08)

> Todas as sessoes 2A-2E concluidas. Pre-requisito para Fase 3 cumprido.

### Sessao 2A — HomePage — CONCLUIDA (2026-03-07)

- [x] goalPresets.ts, calculators.ts, useSettings.ts, useDiary.ts, Nav.tsx, App.tsx
- [x] Build sem erros TypeScript

### Sessao 2B — DiarioPage + FoodDrawer — CONCLUIDA (2026-03-07)

- [x] foodDb.ts, useDiary.ts (6 refeicoes), DiarioPage.tsx, FoodDrawer.tsx, FoodPortionModal.tsx
- [x] index.css — tokens de macro + ambient glow

### Sessao 2C — Polish visual — CONCLUIDA (2026-03-07). Ver CHANGELOG v0.4.0.

### Sessao 2D — Port HomePage + features pendentes — CONCLUIDA (2026-03-08)

- [x] DESCARTADO: fd-peek — Kcalix ja mostra alimentos no accordion, solucao superior
- [x] CustomFoodModal — form-grid P/C/G/kcal com calculo automatico (v0.5.0)
- [x] FoodDrawer — botao "Criar alimento personalizado" + aba "Meus" dinamica (v0.5.0)
- [x] useDiary.getWeekKcal() — query multi-data no Supabase (v0.5.0)
- [x] HomePage — port completo vs original: saudacao dinamica, ProgressCard clicavel, macros fieis, EnergyCard separado, HabitTracker placeholder no topo, grid de acoes 2x2 (v0.6.0)

### Pendencias — dependem de outras fases (NAO bloqueiam avanco)

- [ ] DiarioPage — barras P/C/G no KpiCard sem meta: AGUARDA wizard JP7 (Fase 4)
- [ ] HomePage — modal "historico semanal": AGUARDA dados de kcal de treino (Fase 3)
- [ ] HomePage — "Meu Perfil Nutricional" funcional: AGUARDA wizard JP7 (Fase 4)
- [ ] HabitTracker real: AGUARDA Fase 4
- [ ] TEST: celular real (375px, safe-area): oportunista — testar quando tiver dispositivo disponivel
- [ ] TEST: persistencia multi-dispositivo: oportunista

### Sessao 2E — Navegacao por data — CONCLUIDA (2026-03-08)

> Concluida. Pre-requisito para Fase 3 cumprido.
> Motivo: DiarioPage e TreinoPage precisam compartilhar a mesma data selecionada.
> Quando Treino salvar kcal do dia, Diario daquele dia deve exibir o gasto corretamente.

**Arquivos a criar:**
- `src/hooks/useCurrentDate.ts` — estado global da data selecionada (hoje por default); funcs: goToPrev, goToNext, goToToday, isToday
  - Usar Zustand ou Context — data compartilhada entre DiarioPage e TreinoPage

**Arquivos a modificar:**
- `src/components/DateNavBar.tsx` (novo) — barra reutilizavel: `‹ Seg, 03/03 ›` com botao "Hoje" quando nao for hoje; `day-edit-banner` quando editando dia passado/futuro
- `src/pages/DiarioPage.tsx` — adicionar DateNavBar no topo; useDiary passa a receber `date` como parametro (nao mais hardcoded para hoje); day-edit-banner visivel ao navegar
- `src/pages/HomePage.tsx` — EnergyCard e WeeklyChart ja usam data do hook (hoje por default — sem mudanca visual)

**Comportamento fiel ao original (CSS L1636, JS openTab):**
- Botoes `‹` e `›` navegam dia a dia (nao limita para o passado, limita futuro em hoje+1)
- Banner roxo "Editando [data] · Voltar para hoje" aparece quando data != hoje
- Clicar no banner volta para hoje
- Ao trocar de aba (Nav), a data selecionada persiste (estado global)

**Checklist:**
- [ ] DiarioPage carrega corretamente dados de datas passadas do Supabase
- [ ] Banner aparece ao navegar para dia diferente de hoje
- [ ] Botao "Hoje" no banner volta para data atual
- [ ] Adicionar alimento em dia passado persiste na data correta no Supabase
- [ ] Build sem erros TypeScript

**Referencia original:** date-nav-btn (CSS L1637), day-edit-banner (CSS L1651), datePick logica (JS openTab L4506)

---

## FASE 3 — Treino (Em andamento)

> Antes de iniciar: leia `memory/contexto-port.md` secao Fase 3 + referencia.index.html linhas mapeadas abaixo.

### Sessao 3A — Dados + Hook + TreinoPage base — CONCLUIDA (2026-03-08)

**Arquivos criados:**
1. `src/data/exerciseDb.ts` — EXERCISE_DB (L3345), EX_SECONDARY (L3401), MUSCLE_LANDMARKS (L3460), CARDIO_TYPES (L3483), DEFAULT_TEMPLATES (L3492)
2. `supabase/migrations/004_workout_tables.sql` — tabelas workouts + workout_templates com RLS (EXECUTADO)
3. `src/types/workout.ts` — tipos TypeScript completos
4. `src/hooks/useWorkout.ts` — le/salva workouts + templates no Supabase, kcalPerSet(), sync kcalTreino no diary
5. `src/pages/TreinoPage.tsx` — estrutura base: header com botoes (📊 / 📖 / Salvar), rotinas grid colapsavel, lista de exercicios vazia, workout summary bar (series/volume/cardio/kcal)

**Checklist:**
- [x] Build sem erros TypeScript
- [x] TreinoPage renderiza estado vazio sem crash
- [x] useWorkout nao faz chamadas Supabase diretas em componente
- [x] Deploy pendente (proxima sessao) — FEITO em 2026-03-08

### Sessao 3B — ExerciseSelector + Exercicios + Series — CONCLUIDA (2026-03-08)

**Arquivos criados:**
- `src/components/ExerciseSelector.tsx` — bottom sheet por grupo muscular, modos add/swap

**Arquivos modificados:**
- `src/pages/TreinoPage.tsx` — lista funcional: accordion, set-table (inputs 16px, tabular-nums, :focus roxo), prev-ref ▲▼= async, badge dinamico, volume, swap/delete
- `src/hooks/useWorkout.ts` — addExercise inicia com 3 series (era 1)
- `src/index.css` — classe .set-input com :focus e font-variant-numeric
- `.claude/commands/check-port.md` — nova skill /check-port

**Checklist:**
- [x] Build sem erros TypeScript
- [x] ExerciseSelector abre/fecha por grupo muscular
- [x] Accordion de exercicio abre/fecha series
- [x] Inputs reps/carga 16px sem zoom iOS
- [x] prev-ref carrega assincronamente ao abrir accordion
- [x] /check-port executado — gaps menores corrigidos

**Pendencias registradas:**
- Exercicios personalizados (aba "⭐ Meus") → Sessao 3B+
- swapExercise in-place (preserva posicao) → Sessao 3D

### Sessao 3B+ — Exercicios Personalizados

**Objetivo:** Permitir ao usuario criar exercicios proprios que aparecem na aba "⭐ Meus" do ExerciseSelector.

**Arquivos a criar:**
- `supabase/migrations/005_custom_exercises.sql` — tabela `custom_exercises` com RLS
- `src/hooks/useCustomExercises.ts` — CRUD de exercicios personalizados no Supabase
- `src/components/CustomExerciseModal.tsx` — form: nome, grupo principal, grupos secundarios (chips)

**Arquivos a modificar:**
- `src/components/ExerciseSelector.tsx` — adicionar aba "⭐ Meus" com exercicios customizados + botao "＋ Criar exercicio" + renomear/excluir inline
- `src/types/workout.ts` — tipo CustomExercise

**Referencia original:** customExercises (L6486–6556), openCustomExModal (L2812–2835), CUSTOM_EX_GROUP = "⭐ Meus"

### Sessao 3C — Cardio + Timer + Nota + Salvar — CONCLUIDA (2026-03-08)

**Arquivos modificados:**
- `src/pages/TreinoPage.tsx` — cardio funcional, timer completo (tabs Timer/Cronômetro, 5 presets, countdown com cores, cronômetro), nota conectada ao setNota(), salvar de ponta a ponta

**Checklist:**
- [x] Build sem erros TypeScript
- [x] Cardio: select CARDIO_TYPES + minutos + delete + kcalPerMin automático
- [x] Timer: display 56px, presets, Stop/Reset, Cronômetro
- [x] Nota persiste no saveWorkout
- [x] /check-port — nenhum item crítico

### Sessao 3D — Editor de Templates — CONCLUIDA (2026-03-08)

**Arquivos criados:**
- `src/components/TemplateEditorModal.tsx` — bottom sheet: nome, 8 cores, lista de exercícios, catálogo por grupo, cardio padrão, delete two-tap

**Arquivos modificados:**
- `src/pages/TreinoPage.tsx` — ✏️ em cada chip abre editor; "+ Nova rotina"; confirm() antes de applyTemplate
- `src/hooks/useWorkout.ts` — swapExercise in-place + applyTemplate

**Checklist:**
- [x] Build sem erros TypeScript
- [x] TemplateEditorModal abre via ✏️ e "+ Nova rotina"
- [x] Cores, exercícios, cardio salvam corretamente
- [x] Delete two-tap com auto-reset 3s
- [x] /check-port executado — confirm() adicionado

### Sessao 3E — Analytics + Modais — CONCLUIDA (2026-03-09)

**Arquivos criados:**
- `src/hooks/useMuscleVolume.ts` — calcMuscleVolume, calcMuscleAvg4weeks, calcFrequencyAlert, getAllExSessions, getAllTmplSessions, 5 insights automaticos, buildInsightsByGroup, hook useMuscleVolume()
- `src/components/CoachGuideModal.tsx` — 5 abas educativas (MEV/MAV/MRV, Volume Cycling, Rep Ranges, Deload, Progressao), tabela de landmarks, chips por grupo
- `src/components/ExerciseProgressionModal.tsx` — PR badge, grafico de barras carga/volume toggle, tabela com delta, z-index 303
- `src/components/TemplateHistoryModal.tsx` — 3 abas (Por treino / Por exercicio / Por grupo), KPIs, tabela sessoes, progressao por exercicio, select agrupado, mg-cards com barra MEV/MRV, chips de insight expansiveis, z-index 321
- `supabase/migrations/006_fix_workouts_unique_constraint.sql` — fix constraint UNIQUE (user_id, date) perdida na recriacao manual da tabela (erro 42P10 no upsert)

**Arquivos modificados:**
- `src/hooks/useWorkout.ts` — getAllWorkoutRows() busca 200 sessoes historicas
- `src/pages/TreinoPage.tsx` — wiring dos 3 modais; workoutRows recarrega ao abrir modais E apos salvar (nao so no mount)

**Checklist:**
- [x] Build sem erros TypeScript
- [x] 3 modais abrem/fecham corretamente
- [x] Botoes 📊 (header) e 📖 conectados
- [x] Botao 📊 em cada exercicio abre ExerciseProgressionModal
- [x] workoutRows atualiza apos Salvar (automatico)
- [x] /check-port executado — sem itens criticos
- [x] fix constraint SQL criado (006) — EXECUTAR no Supabase antes de usar

**Pendencias para sessoes futuras (registradas no check-port):**
- Sessao 3F (futura): Clicar em linha da tabela de sessoes no TemplateHistoryModal deveria navegar para aquela data no TreinoPage — conectar ao dateStore.setDate(). Original: L7572–7577.
- Fase 6: Timer — long-press nos presets para editar o valor (original L6841–6858). Atualmente presets sao fixos [30,60,90,120,180].
- Fase 6: Timer — notificacao push ao fim da contagem (original L6775–6785: Notification API + service worker). Depende de PWA (Fase 6).
- Fase 6: Auto-check habitos ao salvar treino (original L6709–6712: autoCheckHabit). Depende de HabitTracker (Fase 4).
- Sessao 3F (futura): exercicio custom arquivado (flag `arquivado`) — original L6158–6166 verifica isExUsedInHistory antes de deletar. Kcalix deleta direto sem verificar historico.

**Apos Fase 3 concluida:** HomePage — modal "historico semanal" pode ser implementado (dados de kcal treino disponiveis via getAllWorkoutRows)

---

## FASE 4 — Corpo, Habitos e Mais (Em andamento)

### Sessao 4A — CorpoPage + useBody + body_measurements — CONCLUIDA (2026-03-09)

- [x] src/hooks/useBody.ts — CRUD body_measurements no Supabase
- [x] src/pages/CorpoPage.tsx — 3 accordions: inputs do dia, dobras JP7, historico 14 dias
- [x] supabase/migrations/008_body_measurements.sql — tabela com UNIQUE constraint correta
- [x] src/types/body.ts — tipos BodyMeasurement, BodyRow

### Sessao 4B — MaisPage (Metas + Calculadora JP7 + Wizard) — CONCLUIDA (2026-03-09)

- [x] src/hooks/useSettings.ts — campos opcionais pKg, cKg, minFatKg, def, blocks, kcalPerBlock
- [x] src/components/CalcWizardModal.tsx — wizard fullscreen 5 etapas com preview BMR em tempo real
- [x] src/pages/MaisPage.tsx — port completo viewMais (L2313-2524): NutriBanner + 2 cards
- [x] src/index.css — port de ~320 linhas de CSS estrutural (btn, card, accordion, kpi, form, wizard)
- [x] src/hooks/useDiary.ts — fix defensivo totals ausentes em dados antigos (crash HomePage)

**Impacto desbloqueado:**
- HomePage EnergyCard: exibe BMR/TDEE/saldo apos configurar perfil
- DiarioPage KPIs: barras P/C/G com meta real
- CorpoPage: BF% JP7 visivel no historico

**Ordem de implementacao na sessao:**
1. useSettings.ts — adicionar campos opcionais
2. CalcWizardModal.tsx — wizard completo
3. MaisPage.tsx — port dos 2 cards
4. Verificar HomePage + DiarioPage leem pTarget/cTarget/gTarget corretamente
5. npm run build → sem erros
6. /check-port → comparar vs original L2313-2524
7. /end → v0.15.0

### Sessao 4C — HabitTracker — CONCLUIDA (2026-03-09)

- [x] supabase/migrations/009_habits.sql + 009b_fix_habits_schema.sql — tabela habits com RLS
- [x] src/types/habit.ts — HabitKey, HabitDef, HabitRow, HabitsMap, HABITS_DEF, HABIT_DAY_LBLS
- [x] src/hooks/useHabits.ts — toggleHabit (optimistic), autoCheckHabit, getWeekDates
- [x] src/components/HabitTracker.tsx — accordion fiel ao original L8138–8222
- [x] src/index.css — bloco CSS completo L1731–1815
- [x] src/pages/HomePage.tsx — wiring HabitTracker real
- [x] src/pages/TreinoPage.tsx — autoCheckHabit ao salvar

**Preparado para futuro:** custom_habits JSONB + HabitDef aceita id string dinamico

### Sessao 4D — Historico de Habitos + Habitos Personalizados — PLANEJADA

**Referencia original:** JS L8236–8390 (openHabitHistory, renderHabitHistory, renderHabitCalendar)

**Parte 1 — Historico mensal (HabitHistoryModal):**
- Modal bottom sheet com 3 abas: Calendario mensal / Por habito (barras) / Resumo semanal
- Navegacao mes a mes com botoes ‹ ›
- Calendario: grid de dias com dots coloridos por habito (original L8256–8330)
- Score do dia ao clicar em um dia (original L8331–8380)
- Botao 📊 no trigger do HabitTracker abre este modal

**Parte 2 — Habitos personalizados (Fase futura):**
- Tabela `habit_definitions` no Supabase (user_id, id, icon, label, color, ordem)
- SQL: supabase/migrations/010_habit_definitions.sql
- UI no HabitTracker: botao ⚙️ → modal para criar/editar/reordenar/excluir habitos
- HabitTracker passa a renderizar HABITS_DEF dinamicos (fixos + customizados)
- custom_habits JSONB ja preparado na tabela habits

### Sessao 4E — Historico de Gasto Diario (WeeklyKcalModal) — CONCLUIDA (2026-03-09)

**Objetivo:** Ao clicar no card "📅 Ultimos 7 dias" da HomePage, abrir um modal bottom sheet
com historico de gasto calorico diario (ingerido + treino + saldo) navegavel.

**Referencia original:** viewHome renderHome() — card semanal (JS ~L4220–4280)

**O que implementar:**
- Modal bottom sheet (z-index 315/316) abre ao clicar no card WeeklyChart
- Grafico de barras: 7 dias — cada barra dividida em kcal_ingerida vs kcal_treino
- Linha tracejada de meta (settings.kcalTarget)
- Tabela abaixo: dia | ingerido | treino | saldo (+/-) | cor verde/vermelho
- Dados: `getWeekKcal()` do useDiary (ja existe) + `getAllWorkoutRows()` do useWorkout para somar kcal_treino por data
- Navegacao semanal ‹ › (semana anterior / proxima ate hoje)

**Arquivos a criar:**
- `src/components/WeeklyKcalModal.tsx`

**Arquivos a modificar:**
- `src/pages/HomePage.tsx` — estado `weeklyModalOpen` + prop `onClick` no card

---

## FASE 5 — Ferramenta de Migracao (em andamento — testes pendentes)

> Importacao implementada e validada com JSON real. Sessao 5C concluida (2026-03-14): custom_foods importados.
> Proxima etapa: testes extensos de compatibilidade com dados reais e edge cases.

### Sessao 5A — Importador — CONCLUIDA (2026-03-09)

- [x] `src/lib/migrationTransform.ts` — validacao, preview, transformAll
- [x] `src/lib/migrationImport.ts` — upserts batches 50, ignoreDuplicates
- [x] `src/components/MigrateModal.tsx` — bottom sheet 4 etapas, file picker label nativo
- [x] `src/pages/MaisPage.tsx` — Card 3 Migracao
- [x] `supabase/migrations/010_fix_workout_templates_unique.sql` — fix UNIQUE constraint
- [x] Importacao validada com JSON real (kcalix-export-2026-03-09.json)

### Sessao 5B — Diagnostico de Divergencias (ADIADA)

> Adiada para nao bloquear avanco. A importacao esta funcional; divergencias pontuais podem ser corrigidas manualmente no app.
>
> Quando retomar: comparar JSON exportado vs dados importados no Supabase (diff por data), corrigir dias com kcal errada.

### Sessao 5C — custom_foods + CONCLUIDA (2026-03-14)

- [x] `supabase/migrations/012_custom_foods.sql` — tabela custom_foods com RLS e UNIQUE constraint nomeada
- [x] `src/lib/migrationTransform.ts` — CustomFoodRow, transformCustomFoods(), customFoods no TransformResult
- [x] `src/lib/migrationImport.ts` — step 8 upsert em custom_foods, customFoods no ImportProgress
- [x] `src/components/MigrateModal.tsx` — preview mostra customFoods normalmente (removido "em breve")
- [ ] EXECUTAR migration 012 no Supabase Dashboard

### Sessao 5D — Testes de compatibilidade (PROXIMA)

> Objetivo: garantir que o import funciona corretamente com dados reais de outros usuarios e edge cases.

**O que testar:**
- [ ] Import com JSON que tem customFoods reais (usuario com alimentos personalizados)
- [ ] Import com JSON sem customFoods (campo ausente ou array vazio) — deve ser silencioso
- [ ] Import duplicado (reimportar o mesmo JSON) — dados Kcalix nao devem ser sobrescritos
- [ ] Import com customExercises que referenciam workouts — validar que nomes resolvem corretamente
- [ ] Import com checkins (se usuario tiver feito check-ins no app antigo)
- [ ] Verificar tabela custom_foods no Supabase apos import real

### Mapeamento localStorage -> Supabase
| localStorage key | Tabela | Status |
|---|---|---|
| `blocos_tracker_settings` | `user_settings` | Importado (5A) |
| `blocos_tracker_diary` | `diary_entries` | Importado (5A) |
| `blocos_tracker_workouts` (workouts[]) | `workouts` | Importado (5A) |
| `blocos_tracker_workouts` (templates[]) | `workout_templates` | Importado (5A) |
| `blocos_tracker_corpo` | `body_measurements` | Importado (5A) |
| `blocos_tracker_habits_v1` | `habits` | Importado (5A) |
| `blocos_tracker_custom_exercises` | `custom_exercises` | Importado (5A — fix IDs em 0.21.0) |
| `blocos_tracker_checkins_v1` | `checkins` | Tabela criada (011) — sem dados a importar no JSON atual |
| `blocos_tracker_custom_foods` | `custom_foods` | Importado (5C — 012) |

---

## PORTS PENDENTES (fora de fase numerada)

Funcionalidades do app original portadas parcialmente ou ainda nao portadas.

### ProfileCheckinModal — Pendencias (proxima sessao)

- [x] **Botao "Atualizar →" nao volta para o perfil apos salvar** — CORRIGIDO (v0.21.0)
- [x] **`updatedAt` ausente no UserSettingsData** — CORRIGIDO (v0.21.0)
- [ ] **Checkins do app antigo nao importados**: `blocos_tracker_checkins_v1` nao esta no `migrationTransform.ts`. Adicionar na Sessao 5C junto com `custom_foods`.

### Exercicios customizados importados — CORRIGIDO (v0.21.0 + fix manual Supabase)

- [x] **Nome exibido como ID** — CORRIGIDO: `migrationImport.ts` v0.21.0 agora constroi `customIdMap` (idOriginal → UUID Supabase) e reescreve os `exercicioId` nos workouts antes de inserir. Dados ja importados foram corrigidos manualmente no Supabase.
- [x] **Grupo/subgrupo nao exibido** — CORRIGIDO: mesmo fix acima resolve.
- [x] **Volume muscular nao contabilizado** — CORRIGIDO: IDs agora resolvem corretamente.

---

## MELHORIAS FUTURAS — Composicao Corporal (Fase 6+)

> Contexto: hoje as dobras cutaneas (skinfolds) ficam salvas apenas em `user_settings` — um unico registro global.
> Isso impede calcular BF% historico com os valores de dobras daquela epoca.

### 1. Historico de dobras cutaneas por data (PRIORITARIO)
- Salvar skinfolds com timestamp em `body_measurements` (ja tem a tabela, campo `skinfolds` existe no schema)
- Ao abrir CorpoPage, carregar as dobras do dia selecionado (nao so as atuais do settings)
- Ao salvar dobras na CorpoPage, persistir em `body_measurements.skinfolds` alem de `user_settings.skinfolds`
- Beneficio: BF% JP7 historico real — cada checkin calcularia com as dobras daquele dia

### 2. BF% automatico no checkin com dobras do dia
- Hoje: auto-calcula BF% usando dobras atuais do settings (implementado v0.24.0)
- Futuro: buscar dobras da data mais proxima ao checkin em `body_measurements` para calculo mais fiel

### 3. Historico de peso corporal por data em body_measurements
- Hoje: peso fica em `user_settings` (um valor global) e em `checkins` (quando o usuario faz checkin)
- Melhorar CorpoPage para registrar peso diario em `body_measurements` separadamente das dobras
- Exibir grafico de peso ao longo do tempo (nao so nos checkins)

### 4. Metricas derivadas no checkin
- `leanKg` (massa magra) calculado e salvo junto com `bf_pct` no saveCheckin
- `fatKg` (massa gorda) como campo calculado visivel no ProfileCheckinModal

### 5. Alertas de progresso
- Notificar quando BF% muda mais de X% entre checkins consecutivos (sinal de retencao hidrica ou erro de medicao)
- Sugerir novo checkin se passou mais de 14 dias sem registro

---

## FASE 6 — PWA e Polish (Em andamento — Sessão 6A concluída 2026-03-15)

### Sessao 6A — PWA base + Fix 404 SPA — CONCLUIDA (2026-03-15)

- [x] `public/manifest.webmanifest` — manifest PWA completo
- [x] `public/icon-192.png`, `icon-512.png`, `icon-180px.png`, `favicon.svg` — ícones
- [x] `index.html` — meta tags iOS/PWA, apple-touch-icon, theme-color, lang pt-BR
- [x] `vite.config.ts` — vite-plugin-pwa (Workbox GenerateSW, precache shell)
- [x] `src/components/InstallPrompt.tsx` — banner Android + instrução iOS, dismiss 7 dias
- [x] `src/App.tsx` — InstallPrompt montado
- [x] `vercel.json` — rewrite SPA corrige 404 em /home, /treino, /corpo, etc.

### Pendencias Fase 6 (proximas sessoes)

- [ ] Toast "Atualização disponível" quando SW detecta nova versão (useRegisterSW)
- [ ] Splash screen customizada no iOS (apple-splash-screen meta tags)
- [ ] Testar instalação Android real (Chrome) e iOS real (Safari)
- [ ] Testar comportamento offline (navegação sem internet)
- [ ] Notificações push fim do timer treino (Notification API + SW)
- [ ] Timer — long-press preset para editar valor (original L6841-6858)

---

## FASE 6B — Qualidade e Robustez (Próxima — pós-migração)

> Diagnóstico técnico realizado em 2026-03-15 após conclusão das Fases 1–5 e início da Fase 6A (PWA).
> Objetivo: elevar o app de "funcional" para "profissional", com foco em integridade de dados,
> experiência de primeiro uso e segurança contra regressões.
>
> PRINCÍPIO CENTRAL: nenhuma dessas melhorias deve corromper dados existentes.
> Toda mudança de schema usa migration versionada. Toda mudança de lógica preserva dados antigos.

---

### ITEM 2 — Onboarding automático na primeira entrada — CONCLUIDO (v0.26.0 — 2026-03-15)

- [x] `src/pages/HomePage.tsx` — estado `autoWizardOpen` + `useEffect` que detecta `settings === null`
- [x] `src/components/CalcWizardModal.tsx` — step `done` com tela final: cards Objetivo/BMR/TDEE/Macros
- [x] Proteção: `kcalix_onboarding_dismissed` no localStorage evita reabrir se fechar sem salvar
- [x] Proteção de dados: usuários com `settings.updatedAt` preenchido nunca veem o wizard automático

---

### ITEM 1 — Error Boundary global (🔴 PRIORIDADE MÁXIMA)

**Problema:** qualquer exceção não tratada derruba a árvore React inteira — tela branca sem mensagem.
O usuário não sabe o que aconteceu e abandona o app.

**Implementação:**
- Criar `src/components/ErrorBoundary.tsx` — class component (único caso aceitável de class no projeto)
- Envolver `<App>` em `main.tsx` com `<ErrorBoundary>`
- UI de fallback: fundo escuro com `--bg`, ícone ⚠️, mensagem "Algo deu errado", botão "Recarregar"
- Capturar `error.message` + `error.stack` e exibir em modo dev (ocultar em produção)
- (Futuro) integrar com Sentry: `Sentry.captureException(error)` no `componentDidCatch`

**Proteção de dados:** nenhuma — só leitura de erro, nunca escreve.

**Arquivos:**
- `src/components/ErrorBoundary.tsx` (novo, ~60 linhas)
- `src/main.tsx` (envolver App)

**Critério de feito:** tela branca nunca mais aparece; usuário sempre vê opção de recarregar.

---

### ITEM 3 — SW Update Toast (🟡 MÉDIA — já temos o plugin)

**Problema:** quando nova versão é publicada, usuário com app instalado fica na versão antiga
indefinidamente. Nunca sabe que há atualização disponível.

**Implementação:**
- Usar `useRegisterSW` do `virtual:pwa-register/react` (já incluído no vite-plugin-pwa)
- Criar `src/components/UpdateToast.tsx` — banner fixo no topo: "🔄 Nova versão disponível"
  + botão "Atualizar" que chama `updateServiceWorker(true)` + recarrega a página
- Montar em `App.tsx` ao lado do `<InstallPrompt />`

**Proteção de dados:**
- `updateServiceWorker(true)` apenas substitui os assets cacheados — nunca toca o banco Supabase
- Dados do usuário vivem no Supabase, não no cache do SW

**Arquivos:**
- `src/components/UpdateToast.tsx` (novo, ~40 linhas)
- `src/App.tsx` (montar UpdateToast)

**Critério de feito:** após deploy de nova versão, usuário com app instalado vê o toast em até 1min.

---

### ITEM 4 — Code Splitting por rota (🟡 MÉDIA — performance)

**Problema:** bundle único de 662KB. Carregamento inicial lento (~3–5s em 4G).
Todas as páginas e modais carregam mesmo que o usuário nunca as acesse.

**Implementação:**
- Converter imports de páginas em `src/App.tsx` para `React.lazy()`:
  ```ts
  const TreinoPage = lazy(() => import('./pages/TreinoPage'))
  const CorpoPage  = lazy(() => import('./pages/CorpoPage'))
  // etc.
  ```
- Envolver rotas com `<Suspense fallback={<Spinner />}>`
- Modais pesados (`TemplateHistoryModal`, `CoachGuideModal`, `ExerciseSelector`) podem virar
  lazy também se necessário

**Proteção de dados:** nenhuma — só mudança de como o JS é carregado, não afeta dados.

**Arquivos:**
- `src/App.tsx` (lazy imports + Suspense)

**Estimativa de impacto:** bundle inicial de 662KB → ~120–150KB. Resto carrega sob demanda.

**Critério de feito:** Lighthouse Performance Score >= 85 em mobile.

---

### ITEM 5 — Testes automatizados com Vitest — CONCLUÍDO (v0.28.0 — 2026-03-16)

**Problema:** zero testes. Um refactor silencioso pode quebrar os cálculos de BMR/TDEE/JP7
de todos os usuários sem que ninguém perceba.

**O que testar (por prioridade):**

**5A — Calculators (crítico):**
- `bmrMifflin`: valores conhecidos homem/mulher vs resultado esperado
- `bmrKatch`: leanKg → BMR
- `bodyDensityJP7 + bfSiri`: soma das 7 dobras → BF% esperado (comparar com tabela JP7)
- `calcFromProfile`: perfil completo → todos os campos do CalcResult

**5B — migrationTransform (crítico para dados de usuário):**
- JSON completo do app antigo → output deve ter N diary_entries, M workouts, etc.
- JSON com campos ausentes (edge cases) → não deve explodir
- JSON com customExercises → IDs devem ser preservados e referenciados corretamente
- Import duplicado → `ignoreDuplicates: true` não deve sobrescrever

**5C — Hooks (médio):**
- `useDiary`: mock do Supabase, testar optimistic update

**Setup:**
```bash
npm install -D vitest @vitest/coverage-v8
```
Adicionar em `vite.config.ts`:
```ts
test: { globals: true, environment: 'jsdom' }
```

**Arquivos a criar:**
- `src/lib/__tests__/calculators.test.ts`
- `src/lib/__tests__/migrationTransform.test.ts`

**Critério de feito:** `npm run test` passa; calculators com 100% cobertura; transform com >= 80%.

---

### ITEM 6 — CI/CD com GitHub Actions (🟡 MÉDIA)

**Problema:** push vai direto para Vercel sem verificação. Um erro de TypeScript poderia ir ao ar
(Vercel não roda `tsc -b` por padrão, só o build).

**Implementação:**
Criar `.github/workflows/ci.yml`:
```yaml
name: CI
on: [push, pull_request]
jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run build          # tsc -b + vite build
      - run: npx vitest run          # testes
```

**Proteção de dados:** CI só lê código, nunca acessa Supabase de produção.
Variáveis `VITE_SUPABASE_*` não precisam estar no CI (build usa placeholders).

**Arquivos:**
- `.github/workflows/ci.yml` (novo)

**Critério de feito:** PR com erro de TS bloqueia merge automaticamente.

---

### ITEM 7 — Proteção de integridade de dados entre versões — CONCLUÍDO (v0.29.0 — 2026-03-16)

> Este não é um item pontual — é um protocolo permanente para todas as sessões futuras.

**Problema:** o schema do Supabase usa JSONB em várias tabelas (`user_settings.data`,
`diary_entries.data`, `workouts.data`). Mudanças nos tipos TypeScript não quebram o banco
mas podem quebrar a leitura silenciosamente — o dado existe mas o campo novo retorna `undefined`.

**Regras obrigatórias para toda migration futura:**

1. **Nunca remover campo de JSONB** — apenas adicionar. Se um campo for obsoleto, ignorar na leitura mas não deletar do banco.
2. **Sempre usar fallback defensivo ao ler JSONB:**
   ```ts
   const kcal = data.kcalTarget ?? data.kcal ?? 0  // compatibilidade com dados antigos
   ```
3. **Toda migration versionada** — arquivo SQL em `supabase/migrations/` com número sequencial.
   Nunca executar SQL ad-hoc no painel sem criar o arquivo.
4. **Migration de rollback documentada** — para cada migration que altera estrutura, comentar
   o SQL de reversão no próprio arquivo.
5. **Checklist pré-deploy quando há migration:**
   - [ ] Migration testada em ambiente de desenvolvimento (dados de teste)
   - [ ] Usuários existentes têm os dados preservados (checar com SELECT antes do ALTER)
   - [ ] Código lê campo novo com fallback para valor padrão

**Alerta de corrupção — o que monitorar:**
- Se `user_settings.data` retornar `null` após update: hook `useSettings` deve mostrar banner
  "Erro ao carregar perfil — entre em contato" em vez de crashar
- Se `diary_entries.data` tiver estrutura inválida: `useDiary` deve retornar dia vazio, não crash
- Se `workouts.data` tiver exercício com `exercicioId` não resolvível: mostrar nome como
  "Exercício removido" em vez de `undefined`

**Arquivos a melhorar (defensividade):**
- `src/hooks/useSettings.ts` — adicionar validação do shape do JSONB retornado
- `src/hooks/useDiary.ts` — já tem fix defensivo (v0.14.0); revisar se cobre todos os campos
- `src/hooks/useWorkout.ts` — validar que exercicioId existe antes de calcular volume

---

### ITEM 8 — Loading states consistentes — CONCLUÍDO (v0.29.0 — 2026-03-16)

**Problema:** cards mostram `0 kcal` ou lista vazia por 300–500ms enquanto o hook carrega.
Parece bug para o usuário.

**Padrão a adotar:**
- Enquanto `loading === true`: mostrar `--` em vez de `0` para números, skeleton em vez de lista vazia
- Criar componente `<Skeleton />` simples: div cinza animado com `animate-pulse`
- Aplicar em: EnergyCard (HomePage), KpiCard (DiarioPage), cards do CorpoPage

**Arquivos:**
- `src/components/Skeleton.tsx` (novo, ~15 linhas)
- `src/pages/HomePage.tsx`, `DiarioPage.tsx`, `CorpoPage.tsx` (usar Skeleton)

---

### ITEM 9 — OG Tags e meta description (🟢 BAIXA — quick win 20min)

**Problema:** link compartilhado no WhatsApp/iMessage aparece sem preview.

**Implementação:** adicionar em `index.html`:
```html
<meta name="description" content="Rastreie nutrição e treino com precisão. App gratuito." />
<meta property="og:title" content="Kcalix" />
<meta property="og:description" content="Nutrição e treino num só app." />
<meta property="og:image" content="/icon-512.png" />
<meta property="og:url" content="https://kcalix.vercel.app" />
<meta property="og:type" content="website" />
```

---

### ITEM 10 — AdminPage: CRUD completo (🟡 MÉDIA) — PARCIALMENTE CONCLUÍDO (v0.30.0 + v0.31.0 — 2026-03-16)

**Problema:** o fluxo atual de convite exige sair do app e ir ao painel do Supabase manualmente:
1. `/kcx-studio`: adiciona email + clica "Copiar e convidar"
2. Supabase Dashboard → Authentication → Users → Invite user → cola email
3. Volta ao app

Com 1 usuário é tolerável. Com 10+ usuários fica impraticável.

**Solução: Edge Function + botão "Enviar convite" no AdminPage**

A `supabase.auth.admin.inviteUserByEmail()` requer a `service_role` key — que NUNCA pode ir
para o frontend. A solução correta é uma **Supabase Edge Function** que recebe o email,
valida que o chamador é o admin, e executa o invite com a service_role no servidor.

**Implementação:**

1. **Edge Function** `supabase/functions/invite-user/index.ts`:
   - Recebe `{ email: string }` no body
   - Valida JWT do usuário chamador (deve ser o admin via `ADMIN_EMAIL` env var)
   - Chama `supabase.auth.admin.inviteUserByEmail(email)`
   - Retorna `{ ok: true }` ou `{ error: string }`

2. **`src/lib/auth.ts`** — adicionar `inviteUser(email)`:
   - Chama a Edge Function via `supabase.functions.invoke('invite-user', { body: { email } })`
   - Retorna resultado tipado

3. **`src/pages/AdminPage.tsx`** — substituir o card de instrução manual:
   - Botão "Enviar convite" por email (em vez de "Copiar e convidar")
   - Loading state durante o envio
   - Feedback: "✅ Convite enviado para email@..." ou "❌ Erro: ..."
   - Ao sucesso: `markAsInvited(email)` chamado automaticamente + reload da lista

**Proteção de dados:**
- A service_role key fica apenas na Edge Function (variável de ambiente do Supabase, não exposta)
- A Edge Function valida o JWT — só o admin autenticado pode chamar
- Nenhuma tabela de dados de usuário é alterada — só `authorized_emails.invited_at`

**Arquivos a criar:**
- `supabase/functions/invite-user/index.ts` (Edge Function, ~40 linhas)

**Arquivos a modificar:**
- `src/lib/auth.ts` — adicionar `inviteUser(email)`
- `src/pages/AdminPage.tsx` — trocar botão "Copiar e convidar" por "Enviar convite"

**Pré-requisito:** Supabase CLI instalado localmente para fazer `supabase functions deploy invite-user`

**Critério de feito:**
- [x] Clicar "Enviar convite" no `/kcx-studio` dispara email de convite do Supabase
- [x] `invited_at` marcado automaticamente na lista
- [x] Usuário recebe email e consegue definir senha
- [x] Sem nenhuma chave service_role no frontend ou no Git
- [x] AdminPage redesenhada com KPIs, UserCards, confirmação remoção, skeletons (v0.31.0)
- [x] LoginPage + SetPasswordPage polidas com logo real e fluxo de convite claro (v0.31.0)
- [x] RLS policy corrigida — auth.jwt() em vez de SELECT FROM auth.users (v0.31.0)
- [x] trigger on_user_confirmed preenche accepted_at automaticamente (migration 013, v0.31.0)
- [x] VITE_ADMIN_EMAIL configurado no Vercel — menu admin visível em produção (2026-03-16)
- [ ] Toggle Free/Assinante no painel admin (profiles.plano)

---

### Scorecard e Ordem de Execução

| # | Item | Prioridade | Esforço | Risco de dados |
|---|---|---|---|---|
| 1 | Error Boundary | 🔴 Alta | 30min | Nenhum | ✅ v0.27.0 |
| 2 | Onboarding automático | 🔴 Alta | 1h | Baixo | ✅ v0.26.0 |
| 3 | SW Update Toast | 🟡 Média | 30min | Nenhum | ✅ v0.27.0 |
| 4 | Code Splitting | 🟡 Média | 1h | Nenhum | ✅ v0.27.0 |
| 5 | Testes Vitest | 🔴 Alta | 2–3h | Nenhum (só lê código) | ✅ v0.28.0 |
| 6 | CI/CD GitHub Actions | 🟡 Média | 1h | Nenhum | ✅ v0.28.2 |
| 7 | Protocolo integridade dados | 🔴 Contínuo | Permanente | É a proteção | |
| 8 | Loading states | 🟡 Média | 1–2h | Nenhum | |
| 9 | OG Tags | 🟢 Baixa | 20min | Nenhum | ✅ v0.28.1 |
| 10 | AdminPage: convite direto sem painel Supabase | 🟡 Média | 2–3h | Baixo | |
| 11 | Diagnóstico de lentidão no carregamento | 🔴 Alta | 1h | Nenhum | |

**Ordem recomendada de sessões:**
```
Sessão 6B: Error Boundary + Onboarding automático  (impacto máximo, baixo risco) ← FEITO (v0.26.0)
Sessão 6C: SW Update Toast + Code Splitting          (performance + PWA completo) ← FEITO (v0.27.0)
Sessão 6D: Diagnóstico de lentidão (Item 11) + Vitest calculators (Item 5)
Sessão 6E: CI/CD + OG Tags + Loading states          (polish e automação)
Sessão 6F: AdminPage — convite direto (UX admin)
```

---

### ITEM 11 — Diagnóstico de lentidão no carregamento (🔴 ALTA — UX crítico)

**Problema:** app demora para abrir e carregar dados — usuário precisa fechar e reabrir.
Reportado em 2026-03-15 após deploy do v0.27.0 (code splitting + SW atualizado).

**Causas suspeitas (investigar nesta ordem):**

1. **Service Worker travado** — SW antigo em "waiting to activate" conflitando com chunks novos.
   Verificar: DevTools → Application → Service Workers → status "waiting"?
   Fix: adicionar `skipWaiting: true` no workbox config do `vite.config.ts`.

2. **Queries Supabase em paralelo no mount** — settings + diary + habits disparam juntos.
   Verificar: DevTools → Network → filtrar XHR — qual query demora mais?
   Fix: loading states (Item 8) para o usuário ver progresso em vez de tela travada.

3. **Bundle principal ainda grande (430KB)** — lento em 4G fraco.
   Verificar: DevTools → Network → tempo de download do `index-xxx.js`.
   Fix: lazy de modais pesados (TemplateHistoryModal, CoachGuideModal, ExerciseSelector).

**Como diagnosticar na próxima sessão:**
- Abrir DevTools → Network → recarregar app → anotar tempos
- Abrir DevTools → Application → Service Workers → verificar status
- Testar em aba anônima (sem cache) vs. normal

**Critério de feito:** app carrega em < 2s em 4G sem precisar reabrir.

---

## BUG CONHECIDO — Flash ao carregar foto da galeria no Android (registrado 2026-03-24)

**Sintoma:** tela pisca 4-5x ao voltar da galeria do Android e ao exibir o PhotoReviewSheet. Estabiliza e funciona corretamente — é só visual.

**Causa raiz:** WebView Android abre Activity externa de galeria → suspende o processo → ao retornar dispara ciclo `visibilitychange` (hidden→visible) que causa re-renders durante o resume. O JavaScript puro não consegue controlar esse ciclo.

**O que foi tentado e NÃO funciona (não tentar de novo):**
- `if (!open && !photoLoading) return null` → levemente melhor, não elimina (v0.48.1)
- `display:none` no backdrop + sheet quando `!open` → piorou (v0.48.2)
- Remover backdrop opaco do PhotoReviewSheet + animação slideUp → piorou mais (v0.48.3)
- `visibilitychange` guard com `pendingPhotoResultRef` → piorou (v0.49.0, revertido)

**Melhor estado conhecido:** v0.48.1 / commit `dd3cef4` — menor piscar sem fix ativo.

**Opções reais para resolver:**
1. **Capacitor** — wrapper nativo substitui `<input type="file">` por API nativa de câmera/galeria, sem abrir Activity externa e sem o ciclo suspend/resume. Requer mudança de stack (PWA → app híbrido). Decisão de produto.
2. **Aceitar como limitação do WebView** — bug cosmético, não afeta funcionalidade.

**Status:** [ ] Em aberto — avaliar após Fase 8 se Capacitor fizer sentido

---

## DÉBITO TÉCNICO — Schema de body_measurements (registrado 2026-03-19)

**Problema atual:** todos os campos de medição corporal vivem dentro de um único `data JSONB`:
`{ weightKg, waistCm, bfPct, bmr, note, skinfolds }`.

**Consequência futura:** queries de agregação, ordenação e análise ficam verbosas e sem índice eficiente. O Supabase client não consegue inferir os tipos automaticamente.

**Schema ideal (a migrar antes de análises avançadas):**
```sql
body_measurements (
  user_id    UUID,
  date       DATE,
  weight_kg  NUMERIC,
  waist_cm   NUMERIC,
  bf_pct     NUMERIC,
  bmr        INTEGER,
  note       TEXT,
  skinfolds  JSONB   -- só as dobras ficam em JSONB (7 campos opcionais, raramente agregados)
)
```

**O que a migração exige:**
1. `ALTER TABLE` com as novas colunas
2. `UPDATE` migrando dados do `data JSONB` para as colunas
3. Atualizar `useBody.ts`, `types/body.ts`, queries SELECT/INSERT
4. Remover o campo `data JSONB` após validar

**Quando fazer:** antes de implementar análises avançadas (evolução de BF%, correlação peso/treino, IA com dados históricos). Enquanto a base de usuários é pequena, a migração de dados é trivial.

**Status:** [ ] Pendente — executar antes da Fase de análises corporais avançadas

---

## ITEM 6B-12 — BMR Diário por Medição (planejado — 2026-03-19)

> Spec completa em `memory/spec-bmr-diario.md`

**Problema:** gráfico de 7 dias usa BMR atual do perfil para todos os dias — se o usuário mudou de peso, dias anteriores ficam com BMR errado.

**Solução:** salvar `bmr` calculado dentro do `data JSONB` de cada medição corporal. Gráfico usa `getBmrForDate(bodyRows, date)` para buscar o BMR vigente em cada dia, com fallback para o BMR atual.

**Sem migração SQL** — campo vai no JSONB existente.

**Arquivos afetados:**
- `src/types/body.ts` — `bmr?: number` em `BodyMeasurement`
- `src/lib/calculators.ts` — exportar `calcBmrFromSettings()`
- `src/pages/CorpoPage.tsx` — calcular e salvar BMR no `handleSave`
- `src/pages/HomePage.tsx` — `buildBmrByDate` + carregar `bodyRows` no mount (não lazy)
- `src/components/WeeklyKcalModal.tsx` — usar BMR do dia em vez de BMR fixo

**Status:** [ ] Pendente — executar em sessão dedicada com `/spec` → `memory/spec-bmr-diario.md`

---

## FASE 7 — IA Integrada (Kcal Coach dentro do app)

> Planejamento completo em `memory/AI_Roadmap.md`
> Spec da próxima sessão em `memory/spec-fase-7A-1-ai-chat.md`

| Sessão | Entrega | Status |
|---|---|---|
| 7A-1 | Edge Function `ai-chat` (backend) | ✅ Concluída (2026-03-18) |
| 7A-2 | UI do chat — FAB + bottom sheet | ✅ Concluída (2026-03-18) |
| 7A-3 | Otimização de tokens — pré-processamento + roteamento + prompt modular | ✅ Concluída (2026-03-17) |
| 7B-1 | Frontend + mock — AiLogConfirmModal, detecção de intenção, getFoodIndex() | ✅ Concluída (2026-03-23) |
| 7B-3a | Inserção real no diário via addFoodsToDiary() standalone | ✅ Concluída (2026-03-23) |
| 7B-3b | Fluxo custom food — source:'custom' → saveCustomFood() → inserir | ✅ Concluída (2026-03-23) |
| 7B-2 | Edge Function — bloco action:'parse-food' isolado (substitui mock) | ✅ Concluída (2026-03-23) |
| 7B-3 | Integração — substituir mock por chamada real à Edge Function | ✅ Concluída (2026-03-23) |
| 7B-4 | IA decide intenção — unifica chat + log, remove regex do frontend | ✅ Concluída (2026-03-23) |
| 7C | Foto para macros — GPT-4o Vision | ✅ Concluída (2026-03-24) |

> ~~⚠️ TODO FUTURO — Notificação de nova versão/funcionalidades para usuários~~
> **Resolvido:** sistema de Broadcasts planejado — ver abaixo.

---

## FASE 6C — Sistema de Broadcasts (canal admin→usuário)

> Spec detalhada por fase: `memory/spec-broadcasts.md`

Canal de comunicação in-app extensível. Schema de duas tabelas projetado desde o início
para crescer sem breaking changes — cada fase adiciona campos opcionais ou novos valores.

| Fase | Entrega | Status | Estimativa |
|---|---|---|---|
| **6C-1** | Modal texto + emoji — admin publica/arquiva, aparece 1× por usuário | ✅ Concluída (v0.52.0 — 2026-03-26) | 2–3h |
| **6C-2** | Agendamento, múltiplas ativas, imagem, botão CTA, segmentação por plano, expiração automática | ⏳ Pendente | 2–3h |
| **6C-3** | Pesquisa simples (1 pergunta, múltipla escolha), resultado no painel | ⏳ Pendente | 1–2h |
| **6C-4** | Feed "Novidades" na aba Mais + banner não-intrusivo + badge na Nav | ⏳ Pendente | 3–4h |

### Fase 6C-1 — CONCLUÍDA (v0.52.0 — 2026-03-26)
- ✅ Admin cria mensagem (emoji + título + texto com Markdown) no `/kcx-studio`
- ✅ Todo usuário que abrir o app vê modal 1× na HomePage (1.5s após carregar)
- ✅ Fechar → nunca mais aparece para aquele usuário
- ✅ Admin arquiva → para de aparecer imediatamente
- ✅ Admin vê `👁 X / Y usuários viram` no painel
- ✅ Migration: `supabase/migrations/014_app_messages.sql`
- ✅ Parser Markdown seguro no modal (sem dangerouslySetInnerHTML)
- ✅ Preview ao vivo no formulário admin

### Fase 6C-2 — próxima sessão
- Agendamento: campo `starts_at` futuro no formulário (já no schema)
- Múltiplas mensagens ativas simultâneas por prioridade (já no schema)
- Imagem, CTA, segmentação por plano, expiração automática

### Princípio de extensibilidade
O schema criado na Fase 6C-1 já contém todos os campos das fases seguintes
(nullable/com default). Fases 2–4 não precisam de ALTER TABLE destrutivo —
só ativam campos que já existem e adicionam novos valores aos enums de texto.

```
app_messages        ← conteúdo da mensagem (criado 1×, lido por todos)
app_message_events  ← estado por usuário (dismissed/cta_clicked/survey_answered)
```

> Para implementar 6C-2: iniciar sessão com `/start` e dizer "implementar Fase 6C-2 de broadcasts"

### Benchmark de tokens — referência para otimizações futuras

| Versão | Pergunta | Tokens/msg | Custo/msg | Data |
|---|---|---|---|---|
| v0.34.x (original) | qualquer | ~10,000-20,000 | ~$0.003 | 2026-03-17 |
| v0.35.0 (pré-proc + roteamento) | almoço + treino (chat vazio) | ~3,500 | ~$0.00108 | 2026-03-17 |
| v0.35.1 (prompt modular + max_tokens) | almoço + treino (chat vazio) | ~2,870 | ~$0.00064 | 2026-03-17 |
| v0.40.0 (5 fixes qualidade) | alimentação hoje + treino ontem (conversa real) | ~2,800 | ~$0.00064 | 2026-03-20 |

- Modelo: gpt-4o-mini ($0.15/1M input, $0.60/1M output)
- Custo atual: ~0.064 centavos/msg → 1 centavo = ~15 mensagens
- Perguntas de teste: "Como foi meu almoço hoje?" + "O que você achou do meu treino de ontem?"
- **v0.40.0:** 5 fixes de qualidade (volume zerado, nome/grupo exercícios, data de hoje, intent multi-turn, max_tokens) sem aumento de custo por mensagem — manteve ~2,800 tokens/msg
- Próxima otimização possível: limitar histórico da conversa (não implementado — preservar UX)

### ⚠️ O que VOCÊ precisa fazer antes da sessão 7A-1 (fora do IDE)

> Estas tarefas requerem acesso a painéis externos — não podem ser feitas pelo Claude Code.

**1. Pegar sua chave OpenAI**
- Acesse: https://platform.openai.com/api-keys
- Crie uma nova chave (ou copie a existente)
- Guarde o valor `sk-...` — você vai precisar nos passos abaixo

**2. Registrar a chave no Supabase (secrets)**
- Abra o terminal no VS Code (Ctrl+`)
- Execute: `supabase secrets set OPENAI_API_KEY=sk-SUAKEY`
- Confirme: `supabase secrets list` — deve aparecer `OPENAI_API_KEY` sem mostrar o valor

**3. Registrar a chave no Vercel (produção)**
- Acesse: https://vercel.com → seu projeto `kcalix` → Settings → Environment Variables
- Adicione: `OPENAI_API_KEY` = `sk-SUAKEY`
- Scope: Production + Preview
- Salve — o Vercel vai usar essa chave quando a Edge Function for deployada

**4. Confirmar que os créditos OpenAI estão ativos**
- Acesse: https://platform.openai.com/usage
- Verifique que há créditos disponíveis (o MVP vai gastar centavos)

Depois de fazer isso, abra uma nova sessão com `/start` e avise que os segredos estão configurados.

---

## FASE 8 — Freemium (Stripe)

- Stripe integrado → pagamento autoriza acesso automaticamente
- Planejado após Fase 7 estável

---

## Regras Criticas

1. **NUNCA commitar `.env.local`**
2. **NUNCA usar `any` no TypeScript** — usar `unknown`
3. **NUNCA chamar Supabase diretamente em componentes** — sempre via hooks
4. **SEMPRE testar no celular real** antes de marcar fase como concluida
5. **Mudancas no banco** -> arquivo SQL em `supabase/migrations/`
6. **Manter app antigo intocado** ate Fase 5 concluida

---

## Fluxo de Trabalho

```
/start -> /spec -> /feature ou /fix ou /improve -> /review -> /end
```

- `/end` faz CHANGELOG + commit + push (principal)
- `/deploy` so para publicacoes rapidas mid-session
- Trocar sessao a cada 60-90 min de trabalho intenso
