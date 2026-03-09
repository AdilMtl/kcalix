-- ══════════ FIX: schema completo da tabela workouts ══════════
-- Migration: 007_fix_workouts_schema.sql
-- Criado: 2026-03-09
--
-- Problema: tabela workouts foi recriada manualmente sem as colunas
-- created_at/updated_at e sem a constraint UNIQUE (user_id, date),
-- causando erros 42P10 (upsert) e 42703 (trigger updated_at).
--
-- Esta migration corrige tudo de forma idempotente.

-- 1. Adicionar coluna created_at se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workouts' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE workouts ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT now();
  END IF;
END;
$$;

-- 2. Adicionar coluna updated_at se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workouts' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE workouts ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
  END IF;
END;
$$;

-- 3. Adicionar constraint UNIQUE (user_id, date) se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'workouts_user_id_date_key'
      AND conrelid = 'workouts'::regclass
  ) THEN
    ALTER TABLE workouts ADD CONSTRAINT workouts_user_id_date_key UNIQUE (user_id, date);
  END IF;
END;
$$;

-- 4. Recriar função de updated_at (idempotente)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
   SECURITY DEFINER
   SET search_path = '';

-- 5. Recriar trigger updated_at em workouts (idempotente)
DROP TRIGGER IF EXISTS workouts_updated_at ON workouts;
CREATE TRIGGER workouts_updated_at
  BEFORE UPDATE ON workouts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
