---
name: Sistema de Broadcasts (Mensagens admin→usuário)
description: Canal de comunicação in-app extensível — Fase 1 texto/emoji modal, futuro banners/surveys/feed
type: project
---

# SPEC: Sistema de Broadcasts

**Status:** Aguardando implementação (próxima sessão)
**Estimativa Fase 1:** ~2–3h
**Fase do projeto:** 6B — item paralelo

---

## VISÃO DO PRODUTO

Canal admin→usuário que começa simples e cresce por fases, sem breaking changes no schema.
Padrão consolidado de mercado (Intercom, Pendo, MagicBell, Beamer): duas tabelas —
conteúdo da mensagem separado do estado por usuário.

```
Fase 1 — agora
  Modal com emoji + título + texto
  Admin publica/cancela no /kcx-studio
  Aparece 1x por usuário na HomePage

Fase 2 — futura
  Imagem (Supabase Storage)
  Botão de ação CTA (rota interna ou URL)
  Segmentação por plano (free/assinante)
  Expiração automática (expires_at)

Fase 3 — futura
  Pesquisa simples (1 pergunta, múltipla escolha)
  Respostas em metadata JSONB — sem nova tabela
  Admin vê % de respostas no painel

Fase 4 — futura
  Feed "Novidades" na aba Mais
  Badge de não lidos na Nav
  Banner não-intrusivo (não bloqueia a UI)
```

---

## SCHEMA — projetado para crescer sem migration destrutiva

```sql
-- ── Tabela 1: conteúdo das mensagens ─────────────────────────────────────
CREATE TABLE app_messages (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at     timestamptz NOT NULL DEFAULT now(),

  -- Conteúdo (Fase 1)
  title          text        NOT NULL,
  body           text        NOT NULL,
  emoji          text        NOT NULL DEFAULT '📢',

  -- Tipo e formato (extensíveis via novos valores — sem ALTER)
  message_type   text        NOT NULL DEFAULT 'announcement',
  -- Fase 1: 'announcement'
  -- Fase 4: 'changelog' | 'survey' | 'banner'

  display_format text        NOT NULL DEFAULT 'modal',
  -- Fase 1: 'modal'
  -- Fase 4: 'banner' | 'feed_item'

  -- Ciclo de vida
  status         text        NOT NULL DEFAULT 'active',
  -- 'draft' | 'active' | 'archived'
  starts_at      timestamptz NOT NULL DEFAULT now(),
  expires_at     timestamptz,          -- Fase 2: expiração automática

  -- Segmentação (JSONB — adicionar campos sem migration)
  targeting      jsonb       NOT NULL DEFAULT '{}',
  -- Fase 1: {} (todos)
  -- Fase 2: {"plans": ["assinante"]}
  -- Fase 3: {"min_days_since_signup": 7, "goal": "cut"}

  -- Controle de exibição
  priority       int         NOT NULL DEFAULT 0,  -- maior = aparece primeiro
  max_shows      int                  DEFAULT 1,  -- Fase 2: permitir >1 exibição
  dismissible    boolean     NOT NULL DEFAULT true,

  -- Extensões futuras (nullable — sem breaking change)
  cta_label      text,        -- Fase 2: "Ver novidade"
  cta_url        text,        -- Fase 2: "/treino" ou URL externa
  image_url      text,        -- Fase 2: Supabase Storage URL
  metadata       jsonb        DEFAULT '{}'
  -- Fase 3: {"survey_opts": ["Sim", "Não", "Talvez"]}
);

ALTER TABLE app_messages ENABLE ROW LEVEL SECURITY;

-- Usuários autenticados leem mensagens ativas e dentro do prazo
CREATE POLICY "app_messages_read_active" ON app_messages
  FOR SELECT TO authenticated
  USING (
    status = 'active'
    AND starts_at <= now()
    AND (expires_at IS NULL OR expires_at > now())
  );

-- Só admin escreve
CREATE POLICY "app_messages_admin_all" ON app_messages
  FOR ALL
  USING     (auth.jwt() ->> 'email' = current_setting('app.admin_email', true))
  WITH CHECK(auth.jwt() ->> 'email' = current_setting('app.admin_email', true));


-- ── Tabela 2: estado por usuário ──────────────────────────────────────────
CREATE TABLE app_message_events (
  id           bigserial   PRIMARY KEY,
  message_id   uuid        NOT NULL REFERENCES app_messages(id) ON DELETE CASCADE,
  user_id      uuid        NOT NULL REFERENCES auth.users(id)   ON DELETE CASCADE,
  event_type   text        NOT NULL DEFAULT 'dismissed',
  -- Fase 1: 'dismissed'
  -- Fase 2: 'seen' | 'cta_clicked'
  -- Fase 3: 'survey_answered'
  created_at   timestamptz NOT NULL DEFAULT now(),
  metadata     jsonb        DEFAULT '{}'
  -- Fase 3: {"answer": "Sim"}
);

ALTER TABLE app_message_events ENABLE ROW LEVEL SECURITY;

-- Usuário vê e escreve apenas seus próprios eventos
CREATE POLICY "app_message_events_own" ON app_message_events
  FOR ALL USING (auth.uid() = user_id);

-- Admin lê todos (para métricas no painel)
CREATE POLICY "app_message_events_admin_read" ON app_message_events
  FOR SELECT
  USING (auth.jwt() ->> 'email' = current_setting('app.admin_email', true));

-- Índice de deduplicação — usuário não gera dois 'dismissed' para o mesmo broadcast
CREATE UNIQUE INDEX app_message_events_dedup
  ON app_message_events (message_id, user_id, event_type)
  WHERE event_type = 'dismissed';

CREATE INDEX app_message_events_user_idx
  ON app_message_events (user_id, created_at DESC);
```

**Por que `app_message_events` (não `app_message_views`):**
- Suporta múltiplos tipos de evento sem nova tabela
- `metadata` JSONB absorve respostas de pesquisa (Fase 3) sem migration
- Índice de dedup em `dismissed` garante idempotência — fechar 2x não cria 2 rows
- `cta_clicked` e `survey_answered` podem repetir (sem índice único neles)

---

## FASE 1 — ARQUIVOS A CRIAR/MODIFICAR

| Arquivo | Ação |
|---|---|
| `supabase/migrations/014_app_messages.sql` | Criar (SQL acima) |
| `src/hooks/useAppMessage.ts` | Criar |
| `src/components/AppMessageModal.tsx` | Criar |
| `src/pages/HomePage.tsx` | Modificar — montar modal + timing |
| `src/pages/AdminPage.tsx` | Modificar — seção "📢 Mensagens" |

---

## HOOK: useAppMessage.ts

```ts
// Busca a mensagem ativa mais recente que o usuário ainda não dispensou
// Retorna: { message, loading, dismiss() }

// Query:
//   SELECT * FROM app_messages
//   WHERE status = 'active'
//     AND starts_at <= now()
//     AND (expires_at IS NULL OR expires_at > now())
//     AND NOT EXISTS (
//       SELECT 1 FROM app_message_events
//       WHERE message_id = app_messages.id
//         AND user_id = auth.uid()
//         AND event_type = 'dismissed'
//     )
//   ORDER BY priority DESC, created_at DESC
//   LIMIT 1

// dismiss():
//   supabase.from('app_message_events')
//     .upsert({ message_id, user_id, event_type: 'dismissed' },
//             { onConflict: 'message_id,user_id,event_type' })
//   — idempotente, nunca falha em duplicata
```

---

## COMPONENTE: AppMessageModal.tsx

Visual: overlay escuro + card centralizado. Mesmo padrão do CalcWizardModal.
Switch em `message_type` — extensível para Fase 2/3.

```
┌─────────────────────────────────┐
│                               ✕ │
│                                 │
│         🎉  (emoji 48px)        │
│                                 │
│      Título da mensagem         │  fontWeight 700, 18px
│                                 │
│   Corpo do texto. Suporta       │  color var(--text2), 14px,
│   quebras de linha.             │  lineHeight 1.6
│                                 │
│  ┌──────────────────────────┐   │
│  │       Entendido ✓        │   │  btn primary, width 100%
│  └──────────────────────────┘   │
└─────────────────────────────────┘
```

- z-index: 350 (acima da Nav/FAB, abaixo de outros modais existentes)
- ✕ ou "Entendido" → `dismiss()` → fecha
- Fase 2: se `cta_label` existe → botão roxo acima do "Entendido"
- Fase 3: se `message_type === 'survey'` → renderiza opções como botões
- Tipos desconhecidos → fallback para layout `announcement` (retrocompatível)

---

## ADMIN: seção "📢 Mensagens" na AdminPage

**Sem mensagem ativa:**
```
┌──────────────────────────────┐
│  📢 Mensagens                │
│                              │
│  Emoji   [📢]                │
│  Título  [_________________] │
│  Texto   [_________________] │
│          [_________________] │
│          [_________________] │
│                              │
│  [ Publicar mensagem ]       │
└──────────────────────────────┘
```
- Publicar → INSERT + faz UPDATE SET status='archived' nas anteriores ativas

**Com mensagem ativa:**
```
┌──────────────────────────────┐
│  📢 Mensagem ativa           │
│                              │
│  🎉 Título aqui              │
│  Corpo da mensagem...        │
│  Publicada: 25/03/2026       │
│                              │
│  👁 12 / 18 usuários viram   │
│                              │
│  [ Arquivar mensagem ]       │
└──────────────────────────────┘
```
- "12 / 18" = COUNT(events WHERE dismissed) / COUNT(profiles)
- Arquivar → SET status='archived' — para de aparecer imediatamente

**Histórico (abaixo):**
- Lista das últimas 5 mensagens arquivadas: emoji + título + data + "X viram"

---

## TIMING NA HOMEPAGE

```ts
// Não abre se onboarding em andamento (CalcWizardModal tem prioridade)
// Abre 1.5s após dados carregados
useEffect(() => {
  if (loading || !message || autoWizardOpen) return
  const t = setTimeout(() => setMessageOpen(true), 1500)
  return () => clearTimeout(t)
}, [loading, message, autoWizardOpen])
```

**Regras de UX (padrão de mercado):**
- Máximo 1 modal por sessão
- Não abre durante onboarding
- Não abre se outro modal já estiver aberto

---

## REGRAS DE NEGÓCIO

- 1 mensagem ativa por vez — publicar arquiva as anteriores automaticamente
- Admin vê o modal também — fecha normalmente, não volta
- Arquivar = `status='archived'`, nunca DELETE — histórico e métricas preservados
- `dismiss()` é idempotente — fechar 2x não cria problema
- Se admin reativar uma arquivada, quem já dispensou não vê de novo (eventos persistem)

---

## GUIA DE EXTENSÃO PARA FASES FUTURAS

### Fase 2: Imagem + CTA
- Campos `image_url` e `cta_label/cta_url` já existem no schema (nullable)
- Adicionar upload no AdminPage → Supabase Storage bucket `message-images`
- AppMessageModal: `if (message.image_url)` renderiza antes do emoji

### Fase 2: Segmentação
- Campo `targeting jsonb` já existe
- Hook avalia no cliente: `{"plans": ["assinante"]}` → só assinantes veem
- AdminPage: select "Para quem?" — Todos / Só free / Só assinantes

### Fase 3: Pesquisa
- Campo `metadata jsonb` já existe — salvar `{"survey_opts": ["Sim", "Não"]}`
- `event_type = 'survey_answered'` + `metadata: {"answer": "Sim"}` — sem nova tabela
- AdminPage: gráfico de barras com % de cada resposta

### Fase 4: Feed "Novidades"
- Card na aba Mais → abre lista de mensagens (ativas + arquivadas recentes)
- Badge numérico na Nav: COUNT de mensagens sem evento `dismissed` do usuário
- `display_format = 'feed_item'` → não abre modal, só aparece no feed

---

## CRITÉRIOS DE FEITO (Fase 1)

- [ ] Build sem erros TypeScript
- [ ] Migration 014 executada no Supabase sem erros
- [ ] Admin publica → todos os usuários veem na próxima abertura
- [ ] Fechar modal → não reaparece para aquele usuário
- [ ] Admin arquiva → para de aparecer imediatamente
- [ ] Admin vê "X / Y usuários viram" no painel
- [ ] Não empilha com CalcWizardModal (onboarding tem prioridade)
- [ ] Funciona no celular (375px, toque, safe area)
- [ ] Schema suporta Fases 2–4 sem migration destrutiva

---

## PADRÕES OBRIGATÓRIOS DO PROJETO (não esquecer)

- **RLS:** usar `auth.jwt() ->> 'email'` — NUNCA `SELECT FROM auth.users`
- **UNIQUE constraint:** sempre nomeado `CONSTRAINT nome UNIQUE (col1, col2)`
- **Trigger updated_at:** NÃO criar — causa erro 42703
- **JSONB defensivo:** `Array.isArray(val) ? val : []` ao ler survey_opts
