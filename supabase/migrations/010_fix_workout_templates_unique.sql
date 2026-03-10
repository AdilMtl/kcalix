-- Fix: adicionar UNIQUE constraint nomeada em workout_templates.user_id
-- O Supabase ignorou o UNIQUE inline do 004 — sem nome previsível, upsert onConflict falha com 42P10

-- Remover constraint existente se houver (nome gerado automaticamente)
DO $$
DECLARE
  cname text;
BEGIN
  SELECT conname INTO cname
  FROM pg_constraint
  WHERE conrelid = 'workout_templates'::regclass
    AND contype = 'u'
    AND conkey = ARRAY(
      SELECT attnum FROM pg_attribute
      WHERE attrelid = 'workout_templates'::regclass AND attname = 'user_id'
    )::smallint[];
  IF cname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE workout_templates DROP CONSTRAINT %I', cname);
  END IF;
END $$;

-- Adicionar com nome explícito e previsível
ALTER TABLE workout_templates
  ADD CONSTRAINT workout_templates_user_id_unique UNIQUE (user_id);
