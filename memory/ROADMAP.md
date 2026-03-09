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
| RLS no banco | `authorized_emails` so acessivel via service_role |
| Mensagem generica | Erro de login nao revela se email existe |
| Env protegido | `VITE_ADMIN_EMAIL` nunca vai para o Git |
| Supabase rate limit | Bloqueia forca bruta automaticamente |

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
| 3 | Treino | Planejado |
| 4 | Corpo, Habitos, Mais | Planejado |
| 5 | Ferramenta de migracao | Planejado |
| 6 | PWA e polish | Planejado |
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

### Sessao 3D — Editor de Templates

**Arquivos a criar:**
- `src/components/TemplateEditorModal.tsx` — bottom sheet: nome, cor (8 opcoes), lista de exercicios do template, cardio padrao

**Modificar:**
- `src/pages/TreinoPage.tsx` — tmpl-grid: chips clicaveis que aplicam template ao dia; botao "+ Nova rotina"

**Referencia original:** openTmplEditor (L7761), renderTmplEditor (L7789), TMPL_COLORS

### Sessao 3E — Analytics + Modais

**Arquivos a criar:**
- `src/hooks/useMuscleVolume.ts` — calcula sets por grupo (primario + secundario) vs MEV/MAV/MRV
- `src/components/CoachGuideModal.tsx` — 5 abas educativas (conceitos de volume, Lucas Campos)
- `src/components/ExerciseProgressionModal.tsx` — grafico carga/volume + tabela historico + badge PR
- `src/components/TemplateHistoryModal.tsx` — historico de uso de cada template com comparativo

**Referencia original:** mg-card (CSS L1580), coach-tabs (CSS L1605), pr-badge (CSS L1507)

**Apos Sessao 3E:** HomePage — modal "historico semanal" pode ser implementado (dados de kcal treino disponiveis)

---

## FASE 4 — Corpo, Habitos e Mais (Planejado)

- CorpoPage: medicoes, dobras, historico de peso
- Habitos: heatmap mensal, streak
- MaisPage: calculadora JP7, wizard de configuracao, perfil nutricional

---

## FASE 5 — Ferramenta de Migracao (Planejado)

### Mapeamento localStorage -> Supabase
| localStorage key | Tabela |
|---|---|
| `blocos_tracker_settings` | `user_settings` |
| `blocos_tracker_diary` | `diary_entries` |
| `blocos_tracker_workouts` (workouts[]) | `workouts` |
| `blocos_tracker_workouts` (templates[]) | `workout_templates` |
| `blocos_tracker_corpo` | `body_measurements` |
| `blocos_tracker_habits_v1` | `habits` |
| `blocos_tracker_checkins_v1` | `checkins` |
| `blocos_tracker_custom_exercises` | `custom_exercises` |

---

## FASE 6 — PWA e Polish (Planejado)

- `manifest.json`, `vite-plugin-pwa`, service worker
- Testar instalacao Android e iOS, comportamento offline

---

## FASE 7 — Freemium / Fase 8 — IA (Futuro)

- Fase 7: Stripe -> pagamento autoriza acesso automaticamente
- Fase 8: Chat com coach, insercao por foto, relatorios inteligentes

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
