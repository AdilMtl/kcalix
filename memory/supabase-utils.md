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
