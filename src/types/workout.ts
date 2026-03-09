// Tipos de treino — Fase 3
// Fiel ao modelo de dados do app original (contexto-port.md — FASE 3)

export type WorkoutSet = {
  reps:  string; // string para aceitar "falha", "10-12", etc.
  carga: string; // string para aceitar "corpo", "60", etc.
};

export type WorkoutExercise = {
  exercicioId: string;
  series:      WorkoutSet[];
};

export type CardioEntry = {
  tipo:      string; // id do CARDIO_TYPES
  minutos:   number;
  kcalPerMin: number;
};

// Dados de um dia de treino (salvo no campo `data` JSONB da tabela workouts)
export type WorkoutDayData = {
  templateId:  string | null;
  exercicios:  WorkoutExercise[];
  cardio:      CardioEntry[];
  nota:        string;
  kcal:        number;
  savedAt:     string; // ISO timestamp
};

// Linha completa da tabela workouts
export type WorkoutRow = {
  id:         string;
  user_id:    string;
  date:       string; // 'YYYY-MM-DD'
  data:       WorkoutDayData;
  created_at: string;
  updated_at: string;
};

// Template de treino (salvo no array `templates` JSONB de workout_templates)
export type WorkoutTemplate = {
  id:        string;
  nome:      string;
  cor:       string;
  exercicios: string[]; // array de exercicioId
  cardio:    { tipo: string; min: number };
};

// Linha completa da tabela workout_templates
export type WorkoutTemplatesRow = {
  id:         string;
  user_id:    string;
  templates:  WorkoutTemplate[];
  created_at: string;
  updated_at: string;
};

// Estado local do treino em edição (antes de salvar)
export type WorkoutState = {
  templateId:  string | null;
  exercicios:  WorkoutExercise[];
  cardio:      CardioEntry[];
  nota:        string;
};
