---
name: ITEM 10 — Admin CRUD completo
description: Painel /kcx-studio redesenhado com cards de usuários, envio de convite direto via Edge Function, desativar/reativar acesso e atalho na aba Mais (só para o admin)
type: project
---

# SPEC: Admin CRUD — Gerenciamento de usuários

**Fase:** 6B — Qualidade e Robustez
**Versão alvo:** v0.30.0
**Data:** 2026-03-16

---

## PROBLEMA / MOTIVAÇÃO

O painel atual (/kcx-studio) é rudimentar:
- Convite exige sair do app e ir ao painel Supabase manualmente
- Não tem como desativar acesso de um usuário
- Cards sem status real (pendente / convidado / ativo / desativado)
- Não tem atalho visível na navegação para o admin

---

## SEGURANÇA (manter em todas as etapas)

| Camada | Proteção |
|---|---|
| Rota ofuscada | `/kcx-studio` — não é `/admin`, não óbvio para bots |
| Guard de rota | `AdminRoute` no `App.tsx` — checa `isAdmin` (email == `VITE_ADMIN_EMAIL`) |
| RLS Supabase | Policy `admin_only` em `authorized_emails` — bloqueia chamadas diretas à API |
| Edge Function | Valida JWT antes de executar invite — dupla camada |
| service_role key | Apenas nas variáveis de ambiente da Edge Function — NUNCA no frontend ou no Git |

---

## ETAPA 1 — Cards bonitos + status real (sem migration)

### O que muda
- `src/pages/AdminPage.tsx` — redesign dos cards

### Card de usuário (visual):
```
┌─────────────────────────────────────────────────┐
│ email@exemplo.com                               │
│ 🟢 Ativo · Free · Último convite: 14/03/26      │
│                          [Enviar convite] [🗑️]  │
└─────────────────────────────────────────────────┘
```

### Status (derivado dos campos existentes):
| Status | Condição |
|---|---|
| ⏳ Pendente | `invited_at = null` |
| 📨 Convidado | `invited_at` preenchido, `accepted_at = null` |
| 🟢 Ativo | `accepted_at` preenchido |
| 🔴 Desativado | `ativo = false` (Etapa 2) |

---

## ETAPA 2 — Ações: convidar + desativar (1 migration)

### Migration: `supabase/migrations/012_admin_features.sql`
```sql
ALTER TABLE authorized_emails
  ADD COLUMN IF NOT EXISTS ativo BOOLEAN NOT NULL DEFAULT true;
-- DEFAULT true preserva todos os usuários existentes como ativos
-- Rollback: ALTER TABLE authorized_emails DROP COLUMN ativo;
```

### Edge Function: `supabase/functions/invite-user/index.ts`
- Recebe `{ email: string }` no body
- Valida JWT do chamador (deve ser o admin via `SUPABASE_ADMIN_EMAIL` env var)
- Chama `supabase.auth.admin.inviteUserByEmail(email)`
- Retorna `{ ok: true }` ou `{ error: string }`
- Headers CORS obrigatórios para chamada do browser

### `src/lib/auth.ts` — novas funções:
- `inviteUser(email)` — chama Edge Function via `supabase.functions.invoke`
- `setUserAtivo(email, ativo: boolean)` — UPDATE authorized_emails SET ativo

### `src/pages/AdminPage.tsx` — ações nos cards:
- Botão "Enviar convite" (substitui "Copiar e convidar") — loading "..." durante envio
- Botão "Desativar" / "Reativar" (toggle ativo)
- Feedback inline: "✅ Convite enviado" ou "❌ Erro: [mensagem]"
- Ao sucesso: `markAsInvited(email)` + `load()` automático

### Guard de acesso (`src/App.tsx`):
- `PrivateRoute` consulta `authorized_emails.ativo` do usuário logado
- Se `ativo = false` → redireciona para `/login` com mensagem:
  "Sua conta foi desativada. Entre em contato com o administrador."

---

## ETAPA 3 — Atalho na aba Mais (visual só para admin)

### `src/pages/MaisPage.tsx`
- Adicionar card/botão "⚙️ Painel admin" visível apenas quando `isAdmin = true`
- Link para `/kcx-studio`
- Para usuários não-admin: não renderiza (não aparece, não quebra)

---

## ETAPA 4 — Plano Free/Assinante (sem migration extra)

A coluna `profiles.plano` já existe (`'free'` por padrão).

### `src/lib/auth.ts` + `setUserPlano(userId, plano: 'free' | 'assinante')`
### `src/pages/AdminPage.tsx` — badge toggle "Free ↔ Assinante" no card

---

## ORDEM DE IMPLEMENTAÇÃO

Sessão atual: Etapa 1 + 2 + 3 (completo)
Próxima sessão: Etapa 4 (plano) se necessário

---

## CRITÉRIOS DE FEITO

- [ ] Build sem erros TypeScript
- [ ] Cards mostram status correto (Pendente / Convidado / Ativo / Desativado)
- [ ] "Enviar convite" dispara email real (confirmado no inbox)
- [ ] `invited_at` marcado automaticamente após sucesso
- [ ] Desativar bloqueia login com mensagem clara
- [ ] Reativar restaura acesso imediatamente
- [ ] Nenhuma service_role key no frontend ou no Git
- [ ] Botão loading durante envio de convite
- [ ] Atalho "⚙️ Painel admin" aparece na aba Mais só para o admin
- [ ] Funciona em 375px (mobile)
