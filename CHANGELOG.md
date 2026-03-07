# Changelog — Kcalix

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
