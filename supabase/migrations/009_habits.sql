-- ══════════════════════════════════════════════════════════
-- 009_habits.sql
-- Tabela de hábitos diários (Fase 4C — HabitTracker)
-- ══════════════════════════════════════════════════════════
--
-- Regras mantidas (ver 008):
-- 1. UNIQUE sempre com CONSTRAINT nomeada — evita erro 42P10 no upsert
-- 2. SEM updated_at / SEM trigger — evita erro 42703
-- 3. created_at DEFAULT NOW() é suficiente
--
-- Arquitetura para hábitos customizáveis futuros:
-- • 5 colunas booleanas para os hábitos fixos (dieta, log, treino, cardio, medidas)
-- • coluna `custom_habits` JSONB para hábitos personalizados { [id]: boolean }
--   ex: { "agua": true, "sono": false }
-- • tabela `habit_definitions` (futura Fase 4D) armazenará { id, icon, label, color }
--   por usuário — hoje os 5 fixos vivem no frontend (HABITS_DEF em habit.ts)

CREATE TABLE IF NOT EXISTS habits (
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

-- RLS
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
