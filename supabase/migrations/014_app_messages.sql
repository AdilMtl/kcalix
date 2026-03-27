-- Kcalix v3 — Migration 014: sistema de broadcasts admin→usuário
-- Duas tabelas: app_messages (conteúdo) + app_message_events (estado por usuário)
-- Schema projetado para crescer sem breaking changes (fases 2–4 só ativam campos opcionais)
-- Rollback: DROP TABLE IF EXISTS app_message_events CASCADE; DROP TABLE IF EXISTS app_messages CASCADE;

-- ── Tabela 1: conteúdo das mensagens ─────────────────────────────────────────

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

  -- Controle de exibição
  priority       int         NOT NULL DEFAULT 0,
  max_shows      int                  DEFAULT 1,
  dismissible    boolean     NOT NULL DEFAULT true,

  -- Campos futuros (nullable — sem breaking change ao usar)
  cta_label      text,
  cta_url        text,
  image_url      text,
  metadata       jsonb       DEFAULT '{}'
);

ALTER TABLE app_messages ENABLE ROW LEVEL SECURITY;

-- Usuários autenticados veem mensagens ativas não expiradas
CREATE POLICY "app_messages_read_active" ON app_messages
  FOR SELECT TO authenticated
  USING (
    status = 'active'
    AND starts_at <= now()
    AND (expires_at IS NULL OR expires_at > now())
  );

-- Admin pode tudo
CREATE POLICY "app_messages_admin_all" ON app_messages
  FOR ALL
  USING     ((auth.jwt() ->> 'email') = 'adilson.matioli@gmail.com')
  WITH CHECK((auth.jwt() ->> 'email') = 'adilson.matioli@gmail.com');

-- ── Tabela 2: eventos por usuário ─────────────────────────────────────────────

CREATE TABLE app_message_events (
  id           bigserial   PRIMARY KEY,
  message_id   uuid        NOT NULL REFERENCES app_messages(id) ON DELETE CASCADE,
  user_id      uuid        NOT NULL REFERENCES auth.users(id)   ON DELETE CASCADE,
  event_type   text        NOT NULL DEFAULT 'dismissed',
  -- Fase 1: 'dismissed'
  -- Fase 2: 'seen' | 'cta_clicked'
  -- Fase 3: 'survey_answered'
  created_at   timestamptz NOT NULL DEFAULT now(),
  metadata     jsonb       DEFAULT '{}'
  -- Fase 3: {"answer": "Ótimo"}
);

ALTER TABLE app_message_events ENABLE ROW LEVEL SECURITY;

-- Cada usuário só vê/escreve seus próprios eventos
CREATE POLICY "app_message_events_own" ON app_message_events
  FOR ALL USING (auth.uid() = user_id);

-- Admin lê todos os eventos (para métricas "X / Y viram")
CREATE POLICY "app_message_events_admin_read" ON app_message_events
  FOR SELECT
  USING ((auth.jwt() ->> 'email') = 'adilson.matioli@gmail.com');

-- Deduplicação: um 'dismissed' por usuário por mensagem
CREATE UNIQUE INDEX app_message_events_dedup
  ON app_message_events (message_id, user_id, event_type)
  WHERE event_type = 'dismissed';

CREATE INDEX app_message_events_user_idx
  ON app_message_events (user_id, created_at DESC);
