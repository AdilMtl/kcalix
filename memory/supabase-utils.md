# Utilitários SQL — Supabase

## Limpar todos os dados do usuário (manter conta)

No SQL Editor do Supabase:

**1. Descobrir o UUID:**
```sql
SELECT id, email FROM auth.users;
```

**2. Deletar todos os dados:**
```sql
DO $$
DECLARE
  uid uuid := 'COLE-SEU-UUID-AQUI';
BEGIN
  DELETE FROM diary_entries      WHERE user_id = uid;
  DELETE FROM workouts           WHERE user_id = uid;
  DELETE FROM workout_templates  WHERE user_id = uid;
  DELETE FROM custom_exercises   WHERE user_id = uid;
  DELETE FROM body_measurements  WHERE user_id = uid;
  DELETE FROM habits             WHERE user_id = uid;
  DELETE FROM checkins           WHERE user_id = uid;
  DELETE FROM user_settings      WHERE user_id = uid;
END $$;
```

> O SQL Editor roda como `service_role` (sem RLS) — com o UUID fixo funciona direto.
> A conta `auth.users` **não** é afetada.

---

## Bug recorrente: Supabase cria tabela com schema errado

O Supabase às vezes ignora o SQL da migration e cria a tabela com coluna `data JSONB` genérica.
Sintoma: erro `PGRST204 Could not find the 'xxx' column of 'tabela' in the schema cache`.
Solução: `DROP TABLE IF EXISTS ... CASCADE` + recriar com o schema correto.

Ocorreu em: `workout_templates` (004), `custom_exercises` (005), `habits` (009), `checkins` (011)

### Fix checkins (011)

```sql
DROP TABLE IF EXISTS checkins CASCADE;

CREATE TABLE checkins (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date        date NOT NULL,
  weight_kg   numeric(5,1),
  waist_cm    numeric(5,1),
  bf_pct      numeric(4,1),
  note        text,
  bmr         numeric(7,1),
  tdee        numeric(7,1),
  kcal_target numeric(7,1),
  goal_type   text,
  training_sessions   integer,
  avg_training_kcal   numeric(7,1),
  activity_type       text,
  avg_consumed        numeric(7,1),
  adherence_pct       integer,
  created_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT checkins_user_date_unique UNIQUE (user_id, date)
);

ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own checkins"
  ON checkins FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```
