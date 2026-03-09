-- 005_custom_exercises.sql
-- Tabela para exercícios personalizados do usuário

create table if not exists custom_exercises (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  nome        text not null,
  grupo       text not null,
  secundarios text[] not null default '{}',
  arquivado   boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table custom_exercises enable row level security;

create policy "custom_exercises: usuario acessa apenas os seus"
  on custom_exercises
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index custom_exercises_user_id_idx on custom_exercises(user_id);
