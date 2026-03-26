---
name: Sistema de Broadcasts — Spec detalhada por fase
description: Canal admin→usuário extensível. Fase 1 = modal texto/emoji. Fases 2–4 = imagem, segmentação, pesquisa, feed.
type: project
---

# Sistema de Broadcasts — Spec detalhada

**Migration:** `014_app_messages.sql`
**Padrão de referência:** Intercom, MagicBell, Beamer, Pendo
**Princípio central:** schema de duas tabelas projetado para crescer sem breaking changes —
cada fase adiciona campos opcionais ou novos valores de enum, nunca altera colunas existentes.

---

## Schema base (criado na Fase 1, suporta todas as fases)

```sql
-- ── Tabela 1: conteúdo das mensagens ─────────────────────────────────────
CREATE TABLE app_messages (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at     timestamptz NOT NULL DEFAULT now(),

  -- Conteúdo (Fase 1)
  title          text        NOT NULL,
  body           text        NOT NULL,
  emoji          text        NOT NULL DEFAULT '📢',

  -- Tipo e formato (novos valores = nova fase, sem ALTER TABLE)
  message_type   text        NOT NULL DEFAULT 'announcement',
  -- Fase 1: 'announcement'
  -- Fase 3: 'survey'
  -- Fase 4: 'changelog' | 'banner'

  display_format text        NOT NULL DEFAULT 'modal',
  -- Fase 1: 'modal'
  -- Fase 4: 'banner' | 'feed_item'

  -- Ciclo de vida
  status         text        NOT NULL DEFAULT 'active',
  -- 'draft' | 'active' | 'archived'
  starts_at      timestamptz NOT NULL DEFAULT now(),
  expires_at     timestamptz,           -- Fase 2: expiração automática

  -- Segmentação (JSONB extensível — adicionar campos sem migration)
  targeting      jsonb       NOT NULL DEFAULT '{}',
  -- Fase 1: {} (todos os usuários)
  -- Fase 2: {"plans": ["assinante"]}
  -- Fase 2+: {"min_days_since_signup": 7, "goal": "cut"}

  -- Controle de exibição
  priority       int         NOT NULL DEFAULT 0,  -- maior = aparece primeiro se >1 ativa
  max_shows      int                  DEFAULT 1,  -- Fase 2: permitir >1 exibição
  dismissible    boolean     NOT NULL DEFAULT true,

  -- Campos futuros (nullable desde o início — sem breaking change ao usar)
  cta_label      text,        -- Fase 2: "Ver novidade", "Testar agora"
  cta_url        text,        -- Fase 2: "/treino" ou URL externa
  image_url      text,        -- Fase 2: URL do Supabase Storage
  metadata       jsonb        DEFAULT '{}'
  -- Fase 3: {"survey_opts": ["Ótimo", "Regular", "Ruim"]}
);

ALTER TABLE app_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "app_messages_read_active" ON app_messages
  FOR SELECT TO authenticated
  USING (
    status = 'active'
    AND starts_at <= now()
    AND (expires_at IS NULL OR expires_at > now())
  );

CREATE POLICY "app_messages_admin_all" ON app_messages
  FOR ALL
  USING     (auth.jwt() ->> 'email' = current_setting('app.admin_email', true))
  WITH CHECK(auth.jwt() ->> 'email' = current_setting('app.admin_email', true));


-- ── Tabela 2: eventos por usuário ─────────────────────────────────────────
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
  -- Fase 3: {"answer": "Ótimo"}
);

ALTER TABLE app_message_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "app_message_events_own" ON app_message_events
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "app_message_events_admin_read" ON app_message_events
  FOR SELECT
  USING (auth.jwt() ->> 'email' = current_setting('app.admin_email', true));

-- Deduplicação: usuário não gera dois 'dismissed' para o mesmo broadcast
-- (cta_clicked e survey_answered podem repetir — sem índice único neles)
CREATE UNIQUE INDEX app_message_events_dedup
  ON app_message_events (message_id, user_id, event_type)
  WHERE event_type = 'dismissed';

CREATE INDEX app_message_events_user_idx
  ON app_message_events (user_id, created_at DESC);
```

---

## Fase 1 — Modal texto + emoji (implementar agora)

**Estimativa:** 2–3h

### O que entrega
- Admin publica mensagem (emoji + título + texto) no `/kcx-studio`
- Todo usuário que abrir o app vê o modal 1× na HomePage
- Fechar → nunca mais aparece para aquele usuário
- Admin pode arquivar → para de aparecer imediatamente
- Admin vê contador "X / Y usuários viram" no painel

### Arquivos

| Arquivo | Ação |
|---|---|
| `supabase/migrations/014_app_messages.sql` | Criar (schema completo acima) |
| `src/hooks/useAppMessage.ts` | Criar |
| `src/components/AppMessageModal.tsx` | Criar |
| `src/pages/HomePage.tsx` | Modificar |
| `src/pages/AdminPage.tsx` | Modificar |

### Hook: useAppMessage.ts

```ts
// Busca a mensagem ativa mais recente não dispensada pelo usuário
// Retorna: { message: AppMessage | null, loading: boolean, dismiss() }

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
//     .upsert(
//       { message_id, user_id: auth.uid(), event_type: 'dismissed' },
//       { onConflict: 'message_id,user_id,event_type' }
//     )
//   Idempotente — fechar 2× não cria duplicata
```

### Componente: AppMessageModal.tsx

```
┌──────────────────────────────────┐
│                                ✕ │
│                                  │
│          🎉  (emoji 52px)        │
│                                  │
│       Título da mensagem         │  700, 18px, #fff
│                                  │
│  Corpo do texto. Suporta         │  14px, var(--text2),
│  quebras de linha \n.            │  lineHeight 1.7
│                                  │
│  ┌────────────────────────────┐  │
│  │        Entendido ✓         │  │  btn primary, 100%
│  └────────────────────────────┘  │
└──────────────────────────────────┘
```

- Visual: overlay escuro + card centralizado — mesmo padrão do CalcWizardModal
- z-index: 350
- ✕ e "Entendido" chamam `dismiss()` → fecha
- Switch em `message_type` — Fase 1 só renderiza `announcement`, fallback para qualquer tipo desconhecido
- Corpo respeita `\n` como quebra de linha (usar `white-space: pre-line`)

### Timing na HomePage

```ts
// Prioridades: onboarding > broadcast
// Abre 1.5s após dados carregados, sem empilhar modais

useEffect(() => {
  if (loading || !message || autoWizardOpen) return
  const t = setTimeout(() => setMessageOpen(true), 1500)
  return () => clearTimeout(t)
}, [loading, message, autoWizardOpen])
```

### Admin — seção "📢 Mensagens" na AdminPage

**Sem mensagem ativa:**
- Formulário: Emoji (1 char) + Título + Corpo (textarea)
- Botão "Publicar" → INSERT novo + UPDATE SET status='archived' nos anteriores ativos

**Com mensagem ativa:**
- Preview: emoji + título + trecho do corpo
- Data de publicação
- Métrica: `👁 X / Y usuários viram` (COUNT events / COUNT profiles)
- Botão "Arquivar" → UPDATE SET status='archived'

**Histórico:**
- Lista das últimas 5 arquivadas: emoji + título + data + "X viram"

### Regras de negócio

- 1 mensagem ativa por vez — publicar arquiva as anteriores automaticamente
- Admin vê o modal também — fecha normalmente, evento registrado como qualquer usuário
- Arquivar ≠ deletar — histórico e métricas preservados
- Usuário que já dispensou não vê de novo mesmo se admin reativar

### Critérios de feito

- [ ] Build sem erros TypeScript
- [ ] Migration 014 executada no Supabase sem erros
- [ ] Admin publica → usuários veem na próxima abertura do app
- [ ] Fechar modal → não reaparece
- [ ] Admin arquiva → para imediatamente para quem não viu
- [ ] Contador "X / Y viram" correto no painel
- [ ] Não empilha com CalcWizardModal
- [ ] Mobile ok (375px, safe area)

---

## Fase 2 — Imagem, CTA e segmentação (sessão futura)

**Estimativa:** 2–3h | **Pré-requisito:** Fase 1 funcionando

### O que entrega
- Campo de imagem no formulário admin (upload → Supabase Storage bucket `message-images`)
- Botão de ação (CTA) configurável: rota interna (`/treino`) ou URL externa
- Segmentação básica: enviar só para free ou só para assinantes
- Expiração automática por data (`expires_at`)
- Evento `cta_clicked` registrado em `app_message_events`

### O que muda no código
- **Sem migration SQL** — campos `image_url`, `cta_label`, `cta_url`, `targeting`, `expires_at` já existem no schema
- `useAppMessage.ts` — avaliar `targeting.plans` contra `profile.plano` do usuário
- `AppMessageModal.tsx` — renderizar `<img>` se `image_url`, botão CTA se `cta_label`
- `AdminPage.tsx` — input de upload + select "Para quem?" + datepicker de expiração

### Supabase Storage
```
bucket: message-images
policy: leitura pública (SELECT sem auth)
policy: escrita só admin (INSERT com auth.jwt check)
max file size: 2MB
tipos aceitos: image/jpeg, image/png, image/webp
```

### Critérios de feito
- [ ] Upload de imagem no admin → aparece no modal do usuário
- [ ] CTA clicável → navega para destino + registra `cta_clicked`
- [ ] "Para assinantes" → só assinantes veem
- [ ] Mensagem com `expires_at` passado não aparece

---

## Fase 3 — Pesquisas simples (sessão futura)

**Estimativa:** 1–2h | **Pré-requisito:** Fase 2

### O que entrega
- `message_type: 'survey'` — renderiza opções como botões no modal
- Usuário escolhe uma opção → `survey_answered` + `metadata: {"answer": "Ótimo"}`
- Admin vê gráfico de barras com % de cada opção no painel

### O que muda no código
- **Sem migration SQL** — `metadata.survey_opts` e `app_message_events.metadata` já existem
- `AppMessageModal.tsx` — branch `type === 'survey'`: renderiza opções como botões em vez de "Entendido"
- `AdminPage.tsx` — formulário com campo "Opções" (textarea, uma por linha) + gráfico de barras
- `useAppMessage.ts` — `surveyAnswer(option: string)` em vez de `dismiss()`; na prática insere `event_type: 'survey_answered'`; após responder, também insere `dismissed` para não reabrir

### UX
```
┌──────────────────────────────────┐
│                                ✕ │
│          🤔  (emoji 52px)        │
│       O que você achou?          │
│  Como está sua experiência       │
│  com o Kcal Coach?               │
│                                  │
│  ┌──────────────────────────┐    │
│  │        😍 Ótimo          │    │
│  └──────────────────────────┘    │
│  ┌──────────────────────────┐    │
│  │        😐 Regular        │    │
│  └──────────────────────────┘    │
│  ┌──────────────────────────┐    │
│  │        😕 Precisa melhorar│   │
│  └──────────────────────────┘    │
└──────────────────────────────────┘
```

### Critérios de feito
- [ ] Admin cria survey com opções
- [ ] Modal renderiza opções como botões
- [ ] Resposta salva → modal fecha e não reabre
- [ ] Admin vê % de respostas em gráfico de barras simples

---

## Fase 4 — Feed "Novidades" e banner não-intrusivo (sessão futura)

**Estimativa:** 3–4h | **Pré-requisito:** Fases 1–3

### O que entrega
- Card "📰 Novidades" na aba Mais → lista mensagens recentes (ativas + arquivadas)
- Badge numérico na Nav ("Mais 3") indicando mensagens não lidas
- `display_format: 'banner'` — aparece no topo da HomePage, não bloqueia a UI
- `display_format: 'feed_item'` — não abre modal, só aparece no feed

### O que muda no código
- **Sem migration SQL** — `display_format` e `status` já suportam os novos valores
- Nova rota ou seção em `MaisPage.tsx` — lista de broadcasts lidos e não lidos
- `Nav.tsx` — badge de contagem de não lidos
- `AppMessageModal.tsx` — branch `display_format === 'banner'`: renderiza banner fixo no topo em vez de modal overlay
- `useAppMessage.ts` — buscar também mensagens arquivadas para o feed (sem filtro `active`)

### UX do banner (não-intrusivo)
```
┌──────────────────────────────────────────┐
│ 🎉  Nova funcionalidade disponível!  →   │  ← toca para expandir ou ir para feed
└──────────────────────────────────────────┘
[conteúdo da página abaixo, sem bloqueio]
```

### Badge na Nav
```
      ┌──┐
  Mais│ 3│   ← badge roxo com COUNT de não vistos
      └──┘
```

### Critérios de feito
- [ ] Feed de novidades acessível pela aba Mais
- [ ] Banner não bloqueia interação com a página
- [ ] Badge some após abrir o feed e ver as mensagens
- [ ] Mensagens arquivadas aparecem no histórico do feed

---

## Padrões obrigatórios do projeto (não esquecer na implementação)

- **RLS:** `auth.jwt() ->> 'email'` — NUNCA `SELECT FROM auth.users` (causa 403 silencioso)
- **UNIQUE constraint:** sempre `CONSTRAINT nome UNIQUE (col1, col2)` nomeado — nunca inline
- **Trigger updated_at:** NÃO criar — causa erro 42703 quando coluna não existe
- **JSONB defensivo:** ao ler `metadata.survey_opts`, sempre `Array.isArray(val) ? val : []`
- **Supabase bug de schema:** se colunas não aparecerem após CREATE TABLE, executar DROP CASCADE + CREATE completo
