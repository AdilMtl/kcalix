// ══════════════════════════════════════════════════════════
// types/habit.ts — Hábitos diários
// ══════════════════════════════════════════════════════════

/** IDs dos 5 hábitos fixos (original L8117–8123) */
export type HabitKey = 'dieta' | 'log' | 'treino' | 'cardio' | 'medidas';

/** Definição visual de um hábito (fixo ou futuro customizado) */
export interface HabitDef {
  id: HabitKey | string;
  icon: string;
  label: string;
  color: string;
}

/** 5 hábitos fixos — fiel ao original L8117–8123 */
export const HABITS_DEF: HabitDef[] = [
  { id: 'dieta',   icon: '🥗', label: 'Dieta',   color: '#22d3ee' },
  { id: 'log',     icon: '🍽️', label: 'Log',     color: '#a78bfa' },
  { id: 'treino',  icon: '🏋️', label: 'Treino',  color: '#f472b6' },
  { id: 'cardio',  icon: '🏃', label: 'Cardio',  color: '#fb923c' },
  { id: 'medidas', icon: '📏', label: 'Medidas', color: '#fbbf24' },
];

/** Labels dos dias da semana — fiel ao original L8124 */
export const HABIT_DAY_LBLS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

/** Row da tabela `habits` no Supabase */
export interface HabitRow {
  id?: number;
  user_id?: string;
  date: string;            // ISO 'YYYY-MM-DD'
  dieta: boolean;
  log: boolean;
  treino: boolean;
  cardio: boolean;
  medidas: boolean;
  /** Hábitos customizados futuros: { [id]: boolean } */
  custom_habits: Record<string, boolean>;
  created_at?: string;
}

/** Mapa de data → HabitRow para acesso rápido no componente */
export type HabitsMap = Record<string, HabitRow>;
