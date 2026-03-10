-- Tabela de check-ins periódicos (peso, cintura, BF%, nota + resumo da semana)
CREATE TABLE IF NOT EXISTS checkins (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date        date NOT NULL,
  weight_kg   numeric(5,1),
  waist_cm    numeric(5,1),
  bf_pct      numeric(4,1),
  note        text,
  -- snapshot do perfil no momento do check-in
  bmr         numeric(7,1),
  tdee        numeric(7,1),
  kcal_target numeric(7,1),
  goal_type   text,
  -- resumo dos 7 dias anteriores
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
