-- Kcalix v3 — Migration 016: fix UNIQUE constraint em app_message_events
-- Problema: partial index sem nome → upsert({ onConflict: ... }) falha silenciosamente
-- Solução: remover index parcial + criar CONSTRAINT nomeada completa
-- Padrão recorrente: mesmo fix aplicado em workouts(006), body_measurements(008), workout_templates(010)

-- Remove o partial index que não funciona com upsert
DROP INDEX IF EXISTS app_message_events_dedup;

-- Cria CONSTRAINT nomeada — PostgREST resolve onConflict por nome
ALTER TABLE app_message_events
  ADD CONSTRAINT app_message_events_dedup
  UNIQUE (message_id, user_id, event_type);
