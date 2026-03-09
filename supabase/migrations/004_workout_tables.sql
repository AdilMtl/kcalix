-- ══════════ FASE 3: Tabelas de Treino ══════════
-- Migration: 004_workout_tables.sql
-- Criado: 2026-03-08
--
-- Tabelas flexíveis via JSONB: novos campos podem ser adicionados
-- ao payload sem precisar de nova migration SQL.
--
-- workouts         → um registro por usuário por dia
-- workout_templates → um registro por usuário (array de templates no JSONB)

-- ── workouts ──────────────────────────────────────────────────
-- Payload JSONB esperado (extensível):
-- {
--   templateId:  string | null,
--   exercicios: [{ exercicioId, series: [{reps, carga}] }],
--   cardio:     [{ tipo, minutos, kcalPerMin }],
--   nota:       string,
--   kcal:       number,
--   savedAt:    ISO string
-- }
CREATE TABLE IF NOT EXISTS workouts (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date       DATE        NOT NULL,
  data       JSONB       NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, date)
);

-- Índices para queries comuns
CREATE INDEX IF NOT EXISTS workouts_user_id_idx ON workouts (user_id);
CREATE INDEX IF NOT EXISTS workouts_date_idx    ON workouts (user_id, date DESC);

-- ── workout_templates ─────────────────────────────────────────
-- Payload JSONB: array de WorkoutTemplate
-- [{ id, nome, cor, exercicios: string[], cardio: {tipo, min} }]
-- Um registro por usuário (upsert na primeira vez com DEFAULT_TEMPLATES)
CREATE TABLE IF NOT EXISTS workout_templates (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  templates  JSONB       NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS workout_templates_user_id_idx ON workout_templates (user_id);

-- ── updated_at automático ─────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
   SECURITY DEFINER
   SET search_path = '';

CREATE OR REPLACE TRIGGER workouts_updated_at
  BEFORE UPDATE ON workouts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER workout_templates_updated_at
  BEFORE UPDATE ON workout_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── RLS ───────────────────────────────────────────────────────
ALTER TABLE workouts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_templates ENABLE ROW LEVEL SECURITY;

-- workouts: usuário vê/edita apenas seus próprios treinos
CREATE POLICY "workouts_select_own" ON workouts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "workouts_insert_own" ON workouts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "workouts_update_own" ON workouts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "workouts_delete_own" ON workouts
  FOR DELETE USING (auth.uid() = user_id);

-- workout_templates: usuário vê/edita apenas seus próprios templates
CREATE POLICY "workout_templates_select_own" ON workout_templates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "workout_templates_insert_own" ON workout_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "workout_templates_update_own" ON workout_templates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "workout_templates_delete_own" ON workout_templates
  FOR DELETE USING (auth.uid() = user_id);
