# Changelog — Kcalix

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
