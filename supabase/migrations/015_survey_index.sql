-- Kcalix v3 — Migration 015: índice para queries de resultado de enquetes
-- Otimiza GROUP BY em app_message_events WHERE event_type = 'survey_answered'
-- Rollback: DROP INDEX IF EXISTS app_message_events_survey_idx;

CREATE INDEX IF NOT EXISTS app_message_events_survey_idx
  ON app_message_events (message_id, event_type)
  WHERE event_type = 'survey_answered';
