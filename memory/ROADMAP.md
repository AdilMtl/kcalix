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
| 2 | Home e Diario | Proxima |
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

## FASE 2 — Home e Diario (Em execucao)

> Antes de iniciar: leia `memory/contexto-port.md` — contém estruturas de dados, constantes e ordem de implementação detalhada por sessão.

### Sessao 2A — HomePage (Em execucao)

**Decisoes tomadas em 2026-03-07:**
- Card de habitos na HomePage = placeholder estático — hook real implementado apenas na Sessao 4 junto com CorpoPage/HabitosPage
- `calcAll()` do app original nao e portavel (acoplada ao DOM) — substituida por `calcFromProfile(profile)` com parâmetros tipados
- `DashboardPage.tsx` sera deletado e substituido pela estrutura de abas (Nav + rotas)

**Ordem de implementacao (contexto-port.md sessao 2A):**
1. `src/data/goalPresets.ts` — GOAL_PRESETS + WZ_ACTIVITY_LABELS (linha 4608 do index.html original)
2. `src/lib/calculators.ts` — bmrMifflin, bmrKatch, bodyDensityJP7, bfSiri + calcFromProfile (linhas 5124-5208)
3. `src/hooks/useSettings.ts` — le/salva `user_settings` (campo `data` JSONB)
4. `src/hooks/useDiary.ts` — le/salva `diary_entries` do dia (campo `data` JSONB)
5. `src/components/Nav.tsx` — 5 abas fixas no bottom, safe-area-inset-bottom
6. `src/App.tsx` — refatorar roteamento, deletar DashboardPage
7. `src/pages/HomePage.tsx` — cards de energia + macros + balanco + habitos (placeholder) + grafico semanal

**Checklist de validacao 2A:**
- [x] Build sem erros TypeScript (v0.2.0 — 93 modulos)
- [ ] 5 abas funcionando na barra inferior (testar no dispositivo)
- [ ] HomePage renderiza estado vazio sem user_settings com CTA (testar no dispositivo)
- [ ] HomePage renderiza cards quando ha configuracao salva (depende de wizard Fase 4)
- [x] Nenhuma chamada Supabase direta em componente (via useSettings + useDiary)
- [ ] Testa em 375px sem overflow horizontal (testar no dispositivo)

### Sessao 2B — DiarioPage + FoodDrawer — CONCLUIDA (2026-03-07)

- [x] `src/data/foodDb.ts` — FOOD_DB extraido do app original (9 categorias, ~130 itens)
- [x] `src/hooks/useDiary.ts` — 6 refeicoes + getRecentFoods + addFoodOptimistic
- [x] `src/pages/DiarioPage.tsx` — visual fiel: KPI grid, linha kcal gradient, status pills, accordion meals
- [x] `src/components/FoodDrawer.tsx` — visual fiel: gradiente escuro, handle, busca com icone, cat-tabs
- [x] `src/components/FoodPortionModal.tsx` — bottom sheet real, qty decimal, meal-select-row
- [x] `src/index.css` — --pColor/--cColor/--gColor + ambient glow
- [x] `.claude/commands/port.md` — skill de metodologia de port criada

### Sessao 2C — Polish visual — CONCLUIDA (2026-03-07)

Todas as pendencias de 2B resolvidas. Ver CHANGELOG v0.4.0.

### Sessao 2D — Pendencias (proxima sessao)

- [ ] IMPROVE: FoodDrawer — fd-peek (itens adicionados hoje, colapsavel)
  - Ref: HTML linha 2870, JS renderFoodLog() linha 5907
- [ ] IMPROVE: FoodDrawer — botao "Criar alimento personalizado"
  - Ref: HTML linha 2867, JS addCustomFood() linha 6080
- [ ] IMPROVE: grafico semanal na HomePage — 7 dias reais do Supabase
  - Ref: renderWeekEnergyChart() linha 4266

**TEST:**
- [ ] TEST: persistencia multi-dispositivo (mesmo dado em dois navegadores)
- [ ] TEST: celular real (375px, toque, teclado virtual, safe-area)

---

## FASE 3 — Treino (Planejado)

- TreinoPage com lista, templates, ExerciseSelector
- Historico, analytics de volume muscular
- Coach Modal (5 paginas educativas)
- Timer de pausa

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
