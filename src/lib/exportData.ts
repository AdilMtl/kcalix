// ════════════════════════════════════════════════════════════════════════════
// exportData.ts — Exporta todos os dados do usuário do Supabase
// Gera objeto no mesmo formato FullExport (compatível com migrationTransform)
// ════════════════════════════════════════════════════════════════════════════

import { supabase } from './supabase'
import type { FullExport, ExportSettings, ExportWorkoutDay, ExportTemplate, ExportCustomExercise, ExportBodyDay, ExportHabitDay, ExportCustomFood } from './migrationTransform'
import type { DiaryData } from '../hooks/useDiary'
import type { WorkoutDayData, WorkoutTemplate, CustomExercise } from '../types/workout'
import type { BodyMeasurement } from '../types/body'
import type { HabitRow } from '../types/habit'
import type { UserSettingsData } from '../hooks/useSettings'

export async function exportAll(userId: string): Promise<FullExport> {
  // Buscar tudo em paralelo
  const [
    settingsRes,
    diaryRes,
    workoutsRes,
    templatesRes,
    customExRes,
    bodyRes,
    habitsRes,
    customFoodsRes,
  ] = await Promise.all([
    supabase.from('user_settings').select('data').eq('user_id', userId).maybeSingle(),
    supabase.from('diary_entries').select('date, data').eq('user_id', userId),
    supabase.from('workouts').select('date, data').eq('user_id', userId),
    supabase.from('workout_templates').select('templates').eq('user_id', userId).maybeSingle(),
    supabase.from('custom_exercises').select('id, nome, grupo, secundarios').eq('user_id', userId).eq('arquivado', false),
    supabase.from('body_measurements').select('date, data').eq('user_id', userId),
    supabase.from('habits').select('date, dieta, log, treino, cardio, medidas').eq('user_id', userId),
    supabase.from('custom_foods').select('id, nome, porcao, porcao_g, p, c, g, kcal').eq('user_id', userId),
  ])

  // ── settings ─────────────────────────────────────────────────────────────
  const s = (settingsRes.data?.data ?? {}) as UserSettingsData
  const settings: ExportSettings = {
    sex:            s.sex            ?? 'male',
    age:            s.age            ?? 25,
    weightKg:       s.weightKg       ?? 70,
    heightCm:       s.heightCm       ?? 170,
    goal:           s.goal           ?? 'maintain',
    activityFactor: s.activityFactor ?? 1.55,
    bmr:            s.bmr            ?? 0,
    tdee:           s.tdee           ?? 0,
    kcalTarget:     s.kcalTarget     ?? 0,
    pTarget:        s.pTarget        ?? 0,
    cTarget:        s.cTarget        ?? 0,
    gTarget:        s.gTarget        ?? 0,
    pKg:            s.pKg,
    cKg:            s.cKg,
    minFatKg:       s.minFatKg,
    def:            s.def,
    fixedKcal:      s.fixedKcal,
    blocks:         s.blocks         ?? { pG: 25, cG: 25, gG: 10 },
    kcalPerBlock:   s.kcalPerBlock   ?? { p: 100, c: 100, g: 90 },
    skinfolds:      s.skinfolds,
  }

  // ── diary ────────────────────────────────────────────────────────────────
  const diary: FullExport['diary'] = {}
  for (const row of (diaryRes.data ?? [])) {
    const d = row.data as DiaryData
    diary[row.date] = {
      meals:      (d.meals ?? {}) as unknown as Record<string, import('./migrationTransform').ExportDiaryMeal>,
      totals:     d.totals     ?? { p: 0, c: 0, g: 0, kcal: 0 },
      kcalTreino: d.kcalTreino ?? 0,
    }
  }

  // ── workouts ─────────────────────────────────────────────────────────────
  const workouts: Record<string, ExportWorkoutDay> = {}
  for (const row of (workoutsRes.data ?? [])) {
    const d = row.data as WorkoutDayData
    workouts[row.date] = {
      templateId:  d.templateId  ?? null,
      exercicios:  d.exercicios  ?? [],
      cardio:      d.cardio      ?? [],
      nota:        d.nota        ?? '',
      kcal:        d.kcal        ?? 0,
      savedAt:     d.savedAt     ?? new Date(row.date + 'T12:00:00.000Z').toISOString(),
    }
  }

  // ── templates ────────────────────────────────────────────────────────────
  const rawTemplates = ((templatesRes.data?.templates ?? []) as WorkoutTemplate[])
  const templates: ExportTemplate[] = rawTemplates.map(t => ({
    id:         t.id,
    nome:       t.nome,
    cor:        t.cor        ?? '#7c5cff',
    exercicios: t.exercicios ?? [],
    cardio:     t.cardio     ?? { tipo: '', min: 0 },
  }))

  // ── customExercises ──────────────────────────────────────────────────────
  const customExercises: ExportCustomExercise[] = ((customExRes.data ?? []) as CustomExercise[]).map(e => ({
    id:          e.id,
    nome:        e.nome,
    grupo:       e.grupo       ?? '',
    secundarios: e.secundarios ?? [],
  }))

  // ── body ─────────────────────────────────────────────────────────────────
  const body: Record<string, ExportBodyDay> = {}
  for (const row of (bodyRes.data ?? [])) {
    const d = row.data as BodyMeasurement
    body[row.date] = {
      weightKg:  d.weightKg  ?? null,
      waistCm:   d.waistCm   ?? null,
      bfPct:     d.bfPct     ?? null,
      note:      d.note      ?? '',
      skinfolds: d.skinfolds,
    }
  }

  // ── habits ───────────────────────────────────────────────────────────────
  const habits: Record<string, ExportHabitDay> = {}
  for (const row of ((habitsRes.data ?? []) as HabitRow[])) {
    habits[row.date] = {
      dieta:   row.dieta   ?? false,
      log:     row.log     ?? false,
      treino:  row.treino  ?? false,
      cardio:  row.cardio  ?? false,
      medidas: row.medidas ?? false,
    }
  }

  // ── customFoods ──────────────────────────────────────────────────────────
  const customFoods: ExportCustomFood[] = (customFoodsRes.data ?? []).map((f: {
    id: string; nome: string; porcao: string; porcao_g: number
    p: number; c: number; g: number; kcal: number
  }) => ({
    id:      f.id,
    nome:    f.nome,
    porcao:  f.porcao   ?? '100g',
    porcaoG: f.porcao_g ?? 100,
    p:       f.p        ?? 0,
    c:       f.c        ?? 0,
    g:       f.g        ?? 0,
    kcal:    f.kcal     ?? 0,
  }))

  return {
    _version:        1,
    _exportedAt:     new Date().toISOString(),
    _app:            'kcalix',
    settings,
    diary,
    workouts,
    templates,
    customExercises,
    body,
    habits,
    customFoods,
  }
}
