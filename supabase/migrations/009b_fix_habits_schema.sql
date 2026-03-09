-- ══════════════════════════════════════════════════════════
-- 009b_fix_habits_schema.sql
-- Corrige tabela habits criada com schema errado pelo Supabase
-- (coluna "data" JSONB em vez das colunas booleanas corretas)
-- ══════════════════════════════════════════════════════════
-- Mesmo padrão de correção aplicado em body_measurements (008) e workouts (006)

-- 1. Drop tabela com schema errado (sem dados ainda)
DROP TABLE IF EXISTS habits;

-- 2. Recriar com schema correto
CREATE TABLE habits (
  id             BIGSERIAL PRIMARY KEY,
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date           DATE NOT NULL,
  dieta          BOOLEAN NOT NULL DEFAULT FALSE,
  log            BOOLEAN NOT NULL DEFAULT FALSE,
  treino         BOOLEAN NOT NULL DEFAULT FALSE,
  cardio         BOOLEAN NOT NULL DEFAULT FALSE,
  medidas        BOOLEAN NOT NULL DEFAULT FALSE,
  custom_habits  JSONB NOT NULL DEFAULT '{}',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT habits_user_date_unique UNIQUE (user_id, date)
);

-- 3. RLS
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário lê apenas seus hábitos"
  ON habits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuário insere apenas seus hábitos"
  ON habits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuário atualiza apenas seus hábitos"
  ON habits FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuário deleta apenas seus hábitos"
  ON habits FOR DELETE
  USING (auth.uid() = user_id);
