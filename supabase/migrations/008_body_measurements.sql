-- ══════════════════════════════════════════════════════════
-- 008_body_measurements.sql
-- Tabela de medições corporais diárias (Fase 4 — CorpoPage)
-- ══════════════════════════════════════════════════════════
--
-- REGRAS aprendidas (aplicar em todas as migrações futuras):
-- 1. UNIQUE sempre com CONSTRAINT nomeada — evita erro 42P10 no upsert
-- 2. SEM coluna updated_at e SEM trigger — evita erro 42703
-- 3. created_at com DEFAULT NOW() é suficiente

CREATE TABLE IF NOT EXISTS body_measurements (
  id         BIGSERIAL PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date       DATE NOT NULL,
  data       JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT body_measurements_user_date_unique UNIQUE (user_id, date)
);

-- RLS
ALTER TABLE body_measurements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário lê apenas suas medições"
  ON body_measurements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuário insere apenas suas medições"
  ON body_measurements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuário atualiza apenas suas medições"
  ON body_measurements FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuário deleta apenas suas medições"
  ON body_measurements FOR DELETE
  USING (auth.uid() = user_id);

-- ── Correções aplicadas manualmente no Supabase (tabela criada antes dos fixes) ──
-- ALTER TABLE body_measurements ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
-- DROP TRIGGER IF EXISTS trg_body_measurements_updated_at ON body_measurements;
-- DROP FUNCTION IF EXISTS update_body_measurements_updated_at();
-- ALTER TABLE body_measurements DROP CONSTRAINT IF EXISTS body_measurements_user_id_date_key;
-- ALTER TABLE body_measurements ADD CONSTRAINT body_measurements_user_date_unique UNIQUE (user_id, date);
