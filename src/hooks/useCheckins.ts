import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import type { UserSettingsData } from './useSettings'
import { fetchAllWorkoutRows } from './useWorkout'
import { GOAL_PRESETS } from '../data/goalPresets'
import { todayISO } from '../lib/dateUtils'

export interface CheckinRow {
  id: string
  date: string
  weightKg?: number
  waistCm?: number
  bfPct?: number
  note?: string
  // snapshot do perfil
  bmr?: number
  tdee?: number
  kcalTarget?: number
  goalType?: string
  // resumo semanal
  trainingSessions?: number
  avgTrainingKcal?: number
  activityType?: string
  avgConsumed?: number
  adherencePct?: number
}

interface CheckinPeriod {
  trainingSessions: number
  avgTrainingKcal: number
  activityType: string
  avgConsumed: number
  adherencePct: number
}

export const WZ_GOAL_LABELS: Record<string, string> = {
  maintain: '🟡 Manutenção',
  cut:      '🔴 Cut — Emagrecer',
  recomp:   '🟢 Recomp',
  bulk:     '🔵 Bulk — Ganho de massa',
}

export const WZ_ACTIVITY_LABELS: Record<string, string> = {
  '1.2':   'Sedentário',
  '1.375': 'Levemente ativo',
  '1.55':  'Moderadamente ativo',
  '1.725': 'Bastante ativo',
  '1.9':   'Muito ativo',
}

// Calcula resumo dos últimos N dias com base em dados já carregados
export async function buildCheckinPeriod(
  userId: string,
  kcalTarget: number,
  days = 7,
): Promise<CheckinPeriod> {
  const dateRange: string[] = []
  for (let i = 0; i < days; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const tzOff = d.getTimezoneOffset()
    dateRange.push(new Date(d.getTime() - tzOff * 60000).toISOString().slice(0, 10))
  }

  // kcal de treino por data
  const workoutRows = await fetchAllWorkoutRows(userId)
  const workoutByDate: Record<string, { kcal: number; hasEx: boolean; hasCardio: boolean }> = {}
  for (const r of workoutRows) {
    if (!dateRange.includes(r.date)) continue
    workoutByDate[r.date] = {
      kcal: r.kcal ?? 0,
      hasEx: (r.exercicios?.length ?? 0) > 0,
      hasCardio: (r.cardio?.length ?? 0) > 0,
    }
  }

  // kcal consumida por data via Supabase
  const { data: diaryRows } = await supabase
    .from('diary_entries')
    .select('date, data')
    .eq('user_id', userId)
    .in('date', dateRange)

  let trainingSessions = 0, totalTrainingKcal = 0
  let hasExercicios = false, hasCardio = false
  for (const d of dateRange) {
    const w = workoutByDate[d]
    if (w && w.kcal > 0) {
      trainingSessions++
      totalTrainingKcal += w.kcal
    }
    if (w?.hasEx) hasExercicios = true
    if (w?.hasCardio) hasCardio = true
  }

  let consumedDays = 0, totalConsumed = 0, adherentDays = 0
  for (const row of (diaryRows ?? [])) {
    const totals = row.data?.totals
    const consumed = totals?.kcal ?? 0
    if (consumed > 0) {
      consumedDays++
      totalConsumed += consumed
      if (kcalTarget > 0) {
        const ratio = consumed / kcalTarget
        if (ratio >= 0.9 && ratio <= 1.1) adherentDays++
      }
    }
  }

  let activityType = '—'
  if (hasExercicios && hasCardio) activityType = 'musculação+cardio'
  else if (hasExercicios) activityType = 'musculação'
  else if (hasCardio) activityType = 'cardio'

  return {
    trainingSessions,
    avgTrainingKcal: trainingSessions > 0 ? Math.round(totalTrainingKcal / trainingSessions) : 0,
    activityType,
    avgConsumed: consumedDays > 0 ? Math.round(totalConsumed / consumedDays) : 0,
    adherencePct: consumedDays > 0 ? Math.round((adherentDays / consumedDays) * 100) : 0,
  }
}

// Converte row do Supabase para CheckinRow
function rowToCheckin(r: Record<string, unknown>): CheckinRow {
  return {
    id: r.id as string,
    date: r.date as string,
    weightKg: r.weight_kg != null ? Number(r.weight_kg) : undefined,
    waistCm:  r.waist_cm  != null ? Number(r.waist_cm)  : undefined,
    bfPct:    r.bf_pct    != null ? Number(r.bf_pct)    : undefined,
    note:     r.note as string | undefined,
    bmr:         r.bmr          != null ? Number(r.bmr)          : undefined,
    tdee:        r.tdee         != null ? Number(r.tdee)         : undefined,
    kcalTarget:  r.kcal_target  != null ? Number(r.kcal_target)  : undefined,
    goalType:    r.goal_type as string | undefined,
    trainingSessions: r.training_sessions != null ? Number(r.training_sessions) : undefined,
    avgTrainingKcal:  r.avg_training_kcal != null ? Number(r.avg_training_kcal) : undefined,
    activityType:     r.activity_type as string | undefined,
    avgConsumed:      r.avg_consumed != null ? Number(r.avg_consumed) : undefined,
    adherencePct:     r.adherence_pct != null ? Number(r.adherence_pct) : undefined,
  }
}

interface UseCheckinsReturn {
  checkins: CheckinRow[]
  loading: boolean
  loadCheckins: () => Promise<void>
  saveCheckin: (
    fields: { weightKg?: number; waistCm?: number; bfPct?: number; note?: string },
    settings: UserSettingsData,
  ) => Promise<void>
  getLastCheckin: () => CheckinRow | null
}

export function useCheckins(): UseCheckinsReturn {
  const { user } = useAuthStore()
  const [checkins, setCheckins] = useState<CheckinRow[]>([])
  const [loading, setLoading] = useState(false)

  const loadCheckins = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('checkins')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true })
    if (error) console.error('useCheckins fetch:', error)
    setCheckins((data ?? []).map(r => rowToCheckin(r as Record<string, unknown>)))
    setLoading(false)
  }, [user?.id])

  const saveCheckin = useCallback(async (
    fields: { weightKg?: number; waistCm?: number; bfPct?: number; note?: string },
    settings: UserSettingsData,
  ) => {
    if (!user) return
    const period = await buildCheckinPeriod(user.id, settings.kcalTarget ?? 0)
    const today = todayISO()
    // Auto-calcular BF via JP7 se não foi inserido manualmente e skinfolds estão disponíveis
    let bfPct = fields.bfPct ?? null
    if (bfPct == null) {
      const { bf } = calcProfileMetrics(settings)
      if (bf != null) bfPct = Math.round(bf * 10) / 10
    }
    const { error } = await supabase
      .from('checkins')
      .upsert({
        user_id:    user.id,
        date:       today,
        weight_kg:  fields.weightKg ?? null,
        waist_cm:   fields.waistCm  ?? null,
        bf_pct:     bfPct,
        note:       fields.note     ?? null,
        bmr:        settings.bmr         ?? null,
        tdee:       settings.tdee        ?? null,
        kcal_target: settings.kcalTarget ?? null,
        goal_type:  settings.goal        ?? null,
        training_sessions:  period.trainingSessions,
        avg_training_kcal:  period.avgTrainingKcal,
        activity_type:      period.activityType,
        avg_consumed:       period.avgConsumed,
        adherence_pct:      period.adherencePct,
      }, { onConflict: 'user_id,date' })
    if (error) throw error
    // optimistic update local
    await loadCheckins()
  }, [user?.id, loadCheckins])

  const getLastCheckin = useCallback((): CheckinRow | null => {
    return checkins.length > 0 ? checkins[checkins.length - 1] : null
  }, [checkins])

  return { checkins, loading, loadCheckins, saveCheckin, getLastCheckin }
}

// Calcula BF/massa magra/BMR/TDEE a partir do settings
export function calcProfileMetrics(settings: UserSettingsData) {
  const sf = settings.skinfolds
  const sum7 = sf
    ? (sf.chest + sf.ax + sf.tri + sf.sub + sf.ab + sf.sup + sf.th)
    : 0

  let leanKg: number | null = null
  let bf: number | null = null

  if (settings.age > 0 && sum7 > 0) {
    // Jackson-Pollock 7 dobras
    const bd = settings.sex === 'female'
      ? 1.097 - (0.00046971 * sum7) + (0.00000056 * sum7 * sum7) - (0.00012828 * settings.age)
      : 1.112 - (0.00043499 * sum7) + (0.00000055 * sum7 * sum7) - (0.00028826 * settings.age)
    bf = ((4.95 / bd) - 4.5) * 100
    if (Number.isFinite(bf) && bf > 0 && settings.weightKg > 0) {
      leanKg = settings.weightKg - (settings.weightKg * (bf / 100))
    }
  }

  const preset = GOAL_PRESETS[settings.goal ?? 'maintain'] ?? GOAL_PRESETS.maintain
  const hasSF = sum7 > 0 && leanKg != null

  return { bf, leanKg, hasSF, preset }
}
