-- Kcalix v3 — Migration 016: diagnóstico app_message_events_dedup
-- Verificado em 2026-03-28: constraint já existe corretamente como
--   UNIQUE (message_id, user_id, event_type) — sem cláusula WHERE parcial
-- Nenhuma alteração necessária — upsert({ onConflict: 'message_id,user_id,event_type' }) funciona.
-- SQL de diagnóstico executado:
--   SELECT conname, pg_get_constraintdef(oid)
--   FROM pg_constraint
--   WHERE conrelid = 'app_message_events'::regclass AND contype = 'u';
-- Resultado: app_message_events_dedup | UNIQUE (message_id, user_id, event_type)
SELECT 1; -- no-op
