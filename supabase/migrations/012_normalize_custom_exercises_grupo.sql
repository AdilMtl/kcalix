-- Migration 012: Normalizar campo `grupo` em custom_exercises
-- Dados migrados do app antigo podem ter grupo salvo sem emoji
-- Esta migration faz UPDATE seguro (não altera schema, só dados)
-- EXECUTAR ANTES do deploy do frontend

-- Variantes sem emoji → com emoji
UPDATE custom_exercises SET grupo = '🏋️ Peito'     WHERE grupo IN ('Peito', 'peito');
UPDATE custom_exercises SET grupo = '🦅 Costas'    WHERE grupo IN ('Costas', 'costas');
UPDATE custom_exercises SET grupo = '🦵 Quad'      WHERE grupo IN ('Quad', 'quad', 'Pernas', 'pernas', '🦵 Pernas');
UPDATE custom_exercises SET grupo = '🦵 Posterior' WHERE grupo IN ('Posterior', 'posterior');
UPDATE custom_exercises SET grupo = '🍑 Glúteos'   WHERE grupo IN ('Glúteos', 'glúteos', 'Gluteos', 'gluteos');
UPDATE custom_exercises SET grupo = '💪 Ombros'    WHERE grupo IN ('Ombros', 'ombros');
UPDATE custom_exercises SET grupo = '💪 Bíceps'    WHERE grupo IN ('Bíceps', 'bíceps', 'Biceps', 'biceps');
UPDATE custom_exercises SET grupo = '💪 Tríceps'   WHERE grupo IN ('Tríceps', 'tríceps', 'Triceps', 'triceps');
UPDATE custom_exercises SET grupo = '🧱 Core'      WHERE grupo IN ('Core', 'core', 'Abdômen', 'abdômen', 'Abdomen', 'abdomen');

-- Normalizar também o array secundarios (substitui strings sem emoji dentro do JSONB)
-- Posterior, Pernas → já tratados nas labels acima via código; JSONB é mais complexo
-- O normalizeGroup.ts do frontend trata a leitura — esta migration cobre o campo `grupo` principal
