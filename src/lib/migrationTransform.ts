// ════════════════════════════════════════════════════════════════════════════
// migrationTransform.ts — Funções puras de transformação (sem Supabase)
// Recebem o JSON exportado pelo blocos-tracker, retornam objetos prontos para upsert
// ════════════════════════════════════════════════════════════════════════════

import type { DiaryData, DiaryMeals, FoodEntry } from '../hooks/useDiary'
import type { UserSettingsData } from '../hooks/useSettings'
import type { BodyMeasurement } from '../types/body'
import type { HabitRow } from '../types/habit'
import type { WorkoutDayData, WorkoutTemplate, CustomExercise } from '../types/workout'
import { calcFromProfile } from './calculators'
import { CARDIO_TYPES } from '../data/exerciseDb'

// ── Tipos do JSON exportado ───────────────────────────────────────────────────

export interface FullExport {
  _version: number
  _exportedAt: string
  _app: string
  settings: ExportSettings
  diary: Record<string, ExportDiaryDay>
  workouts: Record<string, ExportWorkoutDay>
  templates: ExportTemplate[]
  customExercises: ExportCustomExercise[]
  body: Record<string, ExportBodyDay>
  habits: Record<string, ExportHabitDay>
  customFoods: ExportCustomFood[]
  checkins?: ExportCheckin[]
}

export interface ExportSettings {
  sex: 'male' | 'female'
  age: number
  weightKg: number
  heightCm: number
  goal: string
  activityFactor: number
  bmr: number
  tdee: number
  kcalTarget: number
  pTarget: number
  cTarget: number
  gTarget: number
  pKg?: number
  cKg?: number
  minFatKg?: number
  def?: number
  fixedKcal?: string | number
  blocks: { pG: number; cG: number; gG: number }
  kcalPerBlock: { p: number; c: number; g: number }
  skinfolds?: {
    chest: number; ax: number; tri: number; sub: number
    ab: number; sup: number; th: number
  }
}

export interface ExportDiaryMeal {
  p: number; c: number; g: number; kcal: number
  items: ExportFoodItem[]
}

export interface ExportFoodItem {
  foodId: string; nome: string; qty: number; porcaoG: number
  p: number; c: number; g: number; kcal: number; at: string
}

export interface ExportDiaryDay {
  meals: Record<string, ExportDiaryMeal>
  totals: { p: number; c: number; g: number; kcal: number }
  kcalTreino: number
}

export interface ExportWorkoutDay {
  templateId: string | null
  exercicios: Array<{ exercicioId: string; series: Array<{ reps: string; carga: string }> }>
  cardio: Array<{ tipo: string; minutos: number; kcalPerMin?: number }>
  nota: string
  kcal: number
  savedAt: string
}

export interface ExportTemplate {
  id: string; nome: string; cor: string
  exercicios: string[]
  cardio: { tipo: string; min: number }
}

export interface ExportCustomExercise {
  id: string; nome: string; grupo: string; secundarios: string[]
}

export interface ExportBodyDay {
  weightKg: number | null; waistCm: number | null; bfPct: number | null
  note: string
  skinfolds?: {
    chest: number; ax: number; tri: number; sub: number
    ab: number; sup: number; th: number
  }
}

export interface ExportHabitDay {
  dieta?: boolean; log?: boolean; treino?: boolean
  cardio?: boolean; medidas?: boolean
}

export interface ExportCustomFood {
  id: string; nome: string; porcao: string; porcaoG: number
  p: number; c: number; g: number; kcal: number
}

export interface ExportCheckin {
  date: string
  weightKg?: number
  waistCm?: number
  bfPct?: number
  bmr?: number
  tdee?: number
  kcalTarget?: number
  goalType?: string
  trainingSessions?: number
  avgTrainingKcal?: number
  activityType?: string
  avgConsumed?: number
  adherencePct?: number
  note?: string | null
}

// ── Resultado da transformação ────────────────────────────────────────────────

export interface CustomFoodRow {
  nome:     string
  porcao:   string
  porcao_g: number
  p:        number
  c:        number
  g:        number
  kcal:     number
}

export interface TransformResult {
  settings: UserSettingsData
  diary: Array<{ date: string; data: DiaryData }>
  workouts: Array<{ date: string; data: WorkoutDayData }>
  templates: WorkoutTemplate[]
  // idOriginal preservado para o import reescrever exercicioId nos workouts
  customExercises: Array<Omit<CustomExercise, 'id' | 'user_id' | 'created_at'> & { idOriginal: string }>
  body: Array<{ date: string; data: BodyMeasurement }>
  habits: Array<Omit<HabitRow, 'id' | 'user_id' | 'created_at'>>
  customFoods: CustomFoodRow[]
  checkins: Array<Record<string, unknown>>
}

// ── Preview (para mostrar ao usuário antes de importar) ───────────────────────

export interface ImportPreview {
  diaryDays: number
  workoutDays: number
  templates: number
  customExercises: number
  bodyDays: number
  habitDays: number
  customFoods: number
  checkins: number
  firstDate: string     // data mais antiga
  lastDate: string      // data mais recente
}

// ════════════════════════════════════════════════════════════════════════════
// VALIDAÇÃO
// ════════════════════════════════════════════════════════════════════════════

export function validateExport(raw: unknown): FullExport {
  if (!raw || typeof raw !== 'object') throw new Error('Arquivo inválido')
  const obj = raw as Record<string, unknown>
  if (obj._version !== 1) throw new Error('Versão do arquivo não suportada')
  if (obj._app !== 'blocos-tracker' && obj._app !== 'kcalix') throw new Error('Arquivo não é do blocos-tracker ou kcalix')
  if (!obj.diary || typeof obj.diary !== 'object') throw new Error('Campo "diary" ausente')
  if (!obj.settings || typeof obj.settings !== 'object') throw new Error('Campo "settings" ausente')
  return obj as unknown as FullExport
}

// ════════════════════════════════════════════════════════════════════════════
// PREVIEW
// ════════════════════════════════════════════════════════════════════════════

export function buildPreview(data: FullExport): ImportPreview {
  const allDates = [
    ...Object.keys(data.diary ?? {}),
    ...Object.keys(data.workouts ?? {}),
    ...Object.keys(data.body ?? {}),
  ].sort()
  return {
    diaryDays:       Object.keys(data.diary ?? {}).length,
    workoutDays:     Object.keys(data.workouts ?? {}).length,
    templates:       (data.templates ?? []).length,
    customExercises: (data.customExercises ?? []).length,
    bodyDays:        Object.keys(data.body ?? {}).length,
    habitDays:       Object.keys(data.habits ?? {}).length,
    customFoods:     (data.customFoods ?? []).length,
    checkins:        (data.checkins ?? []).length,
    firstDate:       allDates[0] ?? '',
    lastDate:        allDates[allDates.length - 1] ?? '',
  }
}

// ════════════════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════════════════

// "🦅 Costas" → "Costas"  |  "💪 Tríceps" → "Tríceps"  |  "Costas" → "Costas"
function stripEmojiPrefix(grupo: string): string {
  return grupo.replace(/^[\p{Emoji}\s]+/u, '').trim()
}

function getKcalPerMin(tipo: string): number {
  const found = CARDIO_TYPES.find(c => c.id === tipo)
  return found?.kcalMin ?? 6
}

// ════════════════════════════════════════════════════════════════════════════
// TRANSFORMAÇÕES
// ════════════════════════════════════════════════════════════════════════════

export function transformSettings(s: ExportSettings): UserSettingsData {
  const profile = {
    sex: s.sex,
    age: s.age,
    weightKg: s.weightKg,
    heightCm: s.heightCm,
    activityFactor: s.activityFactor,
    goal: s.goal as UserSettingsData['goal'],
    skinfolds: s.skinfolds,
    fixedKcal: typeof s.fixedKcal === 'number' ? s.fixedKcal : undefined,
  }
  const calc = calcFromProfile(profile)

  return {
    sex:            s.sex,
    age:            s.age,
    weightKg:       s.weightKg,
    heightCm:       s.heightCm,
    goal:           s.goal as UserSettingsData['goal'],
    activityFactor: s.activityFactor,
    bmr:            calc.bmr ?? 0,
    tdee:           calc.tdee ?? 0,
    kcalTarget:     s.kcalTarget,
    pTarget:        s.pTarget,
    cTarget:        s.cTarget,
    gTarget:        s.gTarget,
    pKg:            s.pKg,
    cKg:            s.cKg,
    minFatKg:       s.minFatKg,
    def:            s.def,
    fixedKcal:      typeof s.fixedKcal === 'number' ? s.fixedKcal : undefined,
    blocks:         s.blocks,
    kcalPerBlock:   s.kcalPerBlock,
    skinfolds:      s.skinfolds,
  }
}

export function transformDiary(
  diary: Record<string, ExportDiaryDay>
): Array<{ date: string; data: DiaryData }> {
  return Object.entries(diary).map(([date, day]) => {
    const mealIds = ['cafe', 'lanche1', 'almoco', 'lanche2', 'jantar', 'ceia'] as const
    const meals: DiaryMeals = {
      cafe: [], lanche1: [], almoco: [], lanche2: [], jantar: [], ceia: [],
    }
    for (const mealId of mealIds) {
      const m = day.meals?.[mealId]
      if (!m) continue
      if (m.items && m.items.length > 0) {
        meals[mealId] = m.items.map((item): FoodEntry => ({
          foodId:  item.foodId,
          nome:    item.nome,
          qty:     item.qty,
          porcaoG: item.porcaoG ?? 100,
          p:       item.p,
          c:       item.c,
          g:       item.g,
          kcal:    item.kcal,
          at:      item.at,
        }))
      } else if (m.p > 0 || m.c > 0 || m.g > 0) {
        meals[mealId] = [{
          foodId:  'manual_import',
          nome:    'Registro importado',
          qty:     1,
          porcaoG: 100,
          p:       m.p,
          c:       m.c,
          g:       m.g,
          kcal:    m.kcal,
          at:      new Date(date + 'T12:00:00.000Z').toISOString(),
        }]
      }
      // refeição vazia → manter []
    }
    return {
      date,
      data: {
        meals,
        totals: {
          p:    day.totals.p,
          c:    day.totals.c,
          g:    day.totals.g,
          kcal: day.totals.kcal,
        },
        kcalTreino: day.kcalTreino ?? 0,
      },
    }
  })
}

export function transformWorkouts(
  workouts: Record<string, ExportWorkoutDay>
): Array<{ date: string; data: WorkoutDayData }> {
  return Object.entries(workouts).map(([date, w]) => ({
    date,
    data: {
      templateId:  w.templateId ?? null,
      exercicios:  (w.exercicios ?? []).map(e => ({
        exercicioId: e.exercicioId,
        series:      (e.series ?? []).map(s => ({
          reps:  s.reps  ?? '',
          carga: s.carga ?? '',
        })),
      })),
      cardio: (w.cardio ?? []).map(c => ({
        tipo:       c.tipo,
        minutos:    c.minutos,
        kcalPerMin: c.kcalPerMin ?? getKcalPerMin(c.tipo),
      })),
      nota:    w.nota    ?? '',
      kcal:    w.kcal    ?? 0,
      savedAt: w.savedAt ?? new Date(date + 'T12:00:00.000Z').toISOString(),
    },
  }))
}

export function transformTemplates(templates: ExportTemplate[]): WorkoutTemplate[] {
  return (templates ?? []).map(t => ({
    id:         t.id,
    nome:       t.nome,
    cor:        t.cor ?? '#7c5cff',
    exercicios: t.exercicios ?? [],
    cardio:     t.cardio ?? { tipo: '', min: 0 },
  }))
}

// ATENÇÃO: stripEmojiPrefix obrigatório — app antigo salva "🦅 Costas"
// idOriginal preservado para o import mapear exercicioId nos workouts
export function transformCustomExercises(
  exs: ExportCustomExercise[]
): Array<Omit<CustomExercise, 'id' | 'user_id' | 'created_at'> & { idOriginal: string }> {
  return (exs ?? []).map(e => ({
    idOriginal:  e.id,
    nome:        e.nome,
    grupo:       stripEmojiPrefix(e.grupo),
    secundarios: e.secundarios ?? [],
    arquivado:   false,
  }))
}

export function transformBody(
  body: Record<string, ExportBodyDay>
): Array<{ date: string; data: BodyMeasurement }> {
  return Object.entries(body ?? {}).map(([date, b]) => ({
    date,
    data: {
      weightKg:  b.weightKg  ?? null,
      waistCm:   b.waistCm   ?? null,
      bfPct:     b.bfPct     ?? null,
      note:      b.note      ?? '',
      skinfolds: b.skinfolds,
    },
  }))
}

// ATENÇÃO: campos podem estar ausentes por data — default false
export function transformHabits(
  habits: Record<string, ExportHabitDay>
): Array<Omit<HabitRow, 'id' | 'user_id' | 'created_at'>> {
  return Object.entries(habits ?? {}).map(([date, h]) => ({
    date,
    dieta:         h.dieta   ?? false,
    log:           h.log     ?? false,
    treino:        h.treino  ?? false,
    cardio:        h.cardio  ?? false,
    medidas:       h.medidas ?? false,
    custom_habits: {},
  }))
}

export function transformCheckins(checkins: ExportCheckin[]): Array<Record<string, unknown>> {
  // Mescla duplicatas por data: preserva valor não-nulo mais recente para cada campo
  const merged = new Map<string, Record<string, unknown>>()
  for (const c of (checkins ?? []).filter(c => !!c.date)) {
    const row: Record<string, unknown> = {
      date:               c.date,
      weight_kg:          c.weightKg,
      waist_cm:           c.waistCm,
      bf_pct:             c.bfPct,
      bmr:                c.bmr,
      tdee:               c.tdee,
      kcal_target:        c.kcalTarget,
      goal_type:          c.goalType,
      training_sessions:  c.trainingSessions,
      avg_training_kcal:  c.avgTrainingKcal,
      activity_type:      c.activityType,
      avg_consumed:       c.avgConsumed,
      adherence_pct:      c.adherencePct,
      note:               c.note ?? undefined,
    }
    const existing = merged.get(c.date)
    if (!existing) {
      merged.set(c.date, row)
    } else {
      // Mescla: novo valor só substitui se o existente for nulo/undefined
      for (const key of Object.keys(row)) {
        if (existing[key] == null && row[key] != null) {
          existing[key] = row[key]
        }
      }
    }
  }
  return Array.from(merged.values())
}

export function transformCustomFoods(foods: ExportCustomFood[]): CustomFoodRow[] {
  return (foods ?? []).map(f => ({
    nome:     f.nome,
    porcao:   f.porcao ?? '100g',
    porcao_g: f.porcaoG ?? 100,
    p:        f.p ?? 0,
    c:        f.c ?? 0,
    g:        f.g ?? 0,
    kcal:     f.kcal ?? 0,
  }))
}

export function transformAll(data: FullExport): TransformResult {
  return {
    settings:        transformSettings(data.settings),
    diary:           transformDiary(data.diary ?? {}),
    workouts:        transformWorkouts(data.workouts ?? {}),
    templates:       transformTemplates(data.templates ?? []),
    customExercises: transformCustomExercises(data.customExercises ?? []),
    body:            transformBody(data.body ?? {}),
    habits:          transformHabits(data.habits ?? {}),
    customFoods:     transformCustomFoods(data.customFoods ?? []),
    checkins:        transformCheckins(data.checkins ?? []),
  }
}
