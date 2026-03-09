-- ══════════ FIX: constraint UNIQUE em workouts ══════════
-- Migration: 006_fix_workouts_unique_constraint.sql
-- Criado: 2026-03-09
--
-- Problema: tabela workouts foi recriada manualmente sem a constraint
-- UNIQUE (user_id, date), causando erro 42P10 no upsert com onConflict.
--
-- Esta migration adiciona a constraint de forma idempotente.

DO $$
BEGIN
  -- Só adiciona se ainda não existir
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'workouts_user_id_date_key'
      AND conrelid = 'workouts'::regclass
  ) THEN
    ALTER TABLE workouts ADD CONSTRAINT workouts_user_id_date_key UNIQUE (user_id, date);
  END IF;
END;
$$;
