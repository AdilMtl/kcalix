-- Migration 012: tabela custom_foods
-- Alimentos personalizados criados pelo usuário
-- ATENÇÃO: constraint UNIQUE nomeada explicitamente (padrão obrigatório — ver MEMORY)

create table custom_foods (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  nome       text not null,
  porcao     text not null default '100g',
  porcao_g   numeric not null default 100,
  p          numeric not null default 0,
  c          numeric not null default 0,
  g          numeric not null default 0,
  kcal       numeric not null default 0,
  created_at timestamptz not null default now(),
  constraint custom_foods_user_id_nome_unique unique (user_id, nome)
);

alter table custom_foods enable row level security;

create policy "user own custom_foods"
  on custom_foods
  for all
  using (auth.uid() = user_id);
