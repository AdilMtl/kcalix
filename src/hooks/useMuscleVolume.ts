// useMuscleVolume — cálculos de volume muscular
// Fiel ao original: referência.index.html L6943–7340
// NÃO faz chamadas Supabase — recebe rows já carregados pelo useWorkout
//
// Usa:
//   MUSCLE_ORDER, MUSCLE_LANDMARKS, EX_SECONDARY, EXERCISE_DB (exerciseDb.ts)
//   CustomExercise (workout.ts) — para exercícios do usuário

import { useMemo } from 'react'
import {
  MUSCLE_ORDER,
  MUSCLE_LANDMARKS,
  EX_SECONDARY,
  EXERCISE_DB,
} from '../data/exerciseDb'
import type { CustomExercise, WorkoutExercise } from '../types/workout'

export type MuscleGroup = typeof MUSCLE_ORDER[number]

export type WorkoutRowLike = {
  date: string
  exercicios: WorkoutExercise[]
}

export type MuscleVolumeEntry = {
  direct:   number
  indirect: number
  total:    number
}

export type MuscleVolumeMap = Record<MuscleGroup, MuscleVolumeEntry>

export type ExSession = {
  date:      string
  series:    { reps: string; carga: string }[]
  maxCarga:  number
  volume:    number
  sets:      number
  templateId?: string | null
}

export type TmplSession = {
  date:      string
  series:    number
  volume:    number
  kcal:      number
  exercicios: WorkoutExercise[]
  templateId: string | null
}

export type Insight = {
  nivel:   'ok' | 'warning' | 'info'
  icone:   string
  titulo:  string
  resumo?: string
  detalhe: string
  grupo:   MuscleGroup | null
}

// ── helpers ────────────────────────────────────────────────────────────────

function shiftDateStr(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

import { todayISO } from '../lib/dateUtils'

/** Resolve grupo primário de um exercício (built-in ou custom) */
export function resolvePrimaryGroup(
  exercicioId: string,
  customExercises: CustomExercise[]
): MuscleGroup | null {
  // Custom
  const cust = customExercises.find(e => e.id === exercicioId)
  if (cust) {
    const g = cust.grupo as MuscleGroup
    if (MUSCLE_ORDER.includes(g)) return g
    // Fallback: grupo salvo sem emoji (migração stripEmojiPrefix) — casa pelo sufixo
    const match = MUSCLE_ORDER.find(m => m.replace(/^[\p{Emoji}\s]+/u, '').trim() === g.trim())
    return match ?? null
  }
  // Built-in
  for (const [grp, exs] of Object.entries(EXERCISE_DB)) {
    if (exs.some(e => e.id === exercicioId)) return grp as MuscleGroup
  }
  return null
}

/** Resolve grupos secundários de um exercício */
export function getSecondaryGroups(
  exercicioId: string,
  customExercises: CustomExercise[]
): MuscleGroup[] {
  const cust = customExercises.find(e => e.id === exercicioId)
  if (cust) return (cust.secundarios ?? []) as MuscleGroup[]
  return (EX_SECONDARY[exercicioId] ?? []) as MuscleGroup[]
}

/** Nome de exibição de um exercício */
export function resolveExName(
  exercicioId: string,
  customExercises: CustomExercise[]
): string {
  const cust = customExercises.find(e => e.id === exercicioId)
  if (cust) return cust.nome
  for (const exs of Object.values(EXERCISE_DB)) {
    const found = exs.find(e => e.id === exercicioId)
    if (found) return found.nome
  }
  return exercicioId
}

// ── cálculos de volume ──────────────────────────────────────────────────────

export function calcMuscleVolume(
  rows: WorkoutRowLike[],
  startDate: string,
  endDate: string,
  customExercises: CustomExercise[]
): MuscleVolumeMap {
  const result = {} as MuscleVolumeMap
  MUSCLE_ORDER.forEach(g => { result[g] = { direct: 0, indirect: 0, total: 0 } })

  for (const row of rows) {
    if (row.date < startDate || row.date > endDate) continue
    for (const ex of row.exercicios) {
      const primary   = resolvePrimaryGroup(ex.exercicioId, customExercises)
      const secondary = getSecondaryGroups(ex.exercicioId, customExercises)
      const validSets = ex.series.filter(s => !s.warmup && (Number(s.reps) || 0) > 0).length
      if (validSets === 0) continue

      if (primary && result[primary]) {
        result[primary].direct += validSets
        result[primary].total  += validSets
      }
      for (const sec of secondary) {
        if (result[sec]) {
          result[sec].indirect += validSets * 0.5
          result[sec].total    += validSets * 0.5
        }
      }
    }
  }
  return result
}

/** Média semanal das 4 semanas anteriores ao today */
export function calcMuscleAvg4weeks(
  rows: WorkoutRowLike[],
  customExercises: CustomExercise[]
): MuscleVolumeMap {
  const today = todayISO()
  const end   = shiftDateStr(today, -1)
  const start = shiftDateStr(today, -28)
  const raw   = calcMuscleVolume(rows, start, end, customExercises)
  const avg   = {} as MuscleVolumeMap
  for (const [g, v] of Object.entries(raw) as [MuscleGroup, MuscleVolumeEntry][]) {
    avg[g] = {
      direct:   +(v.direct   / 4).toFixed(1),
      indirect: +(v.indirect / 4).toFixed(1),
      total:    +(v.total    / 4).toFixed(1),
    }
  }
  return avg
}

/** Alerta: grupo com > 11 sets num único dia */
export function calcFrequencyAlert(
  rows: WorkoutRowLike[],
  startDate: string,
  endDate: string,
  customExercises: CustomExercise[]
): { grupo: MuscleGroup; sets: number; date: string }[] {
  const alerts: { grupo: MuscleGroup; sets: number; date: string }[] = []
  for (const row of rows) {
    if (row.date < startDate || row.date > endDate) continue
    const grupoSets: Partial<Record<MuscleGroup, number>> = {}
    for (const ex of row.exercicios) {
      const pg       = resolvePrimaryGroup(ex.exercicioId, customExercises)
      const validSets = ex.series.filter(s => !s.warmup && (Number(s.reps) || 0) > 0).length
      if (pg && validSets > 0) grupoSets[pg] = (grupoSets[pg] ?? 0) + validSets
    }
    for (const [g, sets] of Object.entries(grupoSets) as [MuscleGroup, number][]) {
      if (sets > 11) alerts.push({ grupo: g, sets, date: row.date })
    }
  }
  return alerts
}

/** Últimas N sessões de um exercício (mais recente primeiro) */
export function getAllExSessions(
  rows: WorkoutRowLike[],
  exercicioId: string,
  limit = 10
): ExSession[] {
  const results: ExSession[] = []
  const sorted = [...rows].sort((a, b) => (a.date < b.date ? 1 : -1))
  for (const row of sorted) {
    if (results.length >= limit) break
    const found = row.exercicios.find(e => e.exercicioId === exercicioId)
    if (!found) continue
    const filledSeries = found.series.filter(s => !s.warmup && (Number(s.reps) || 0) > 0)
    if (filledSeries.length === 0) continue
    const maxCarga = Math.max(0, ...filledSeries.map(s => Number(s.carga) || 0))
    const volume   = filledSeries.reduce((acc, s) => acc + (Number(s.reps) || 0) * (Number(s.carga) || 0), 0)
    results.push({
      date: row.date,
      series: filledSeries,
      maxCarga,
      volume,
      sets: filledSeries.length,
    })
  }
  return results
}

/** Últimas N sessões de um template (mais recente primeiro) */
export function getAllTmplSessions(
  rows: (WorkoutRowLike & { kcal?: number; templateId?: string | null })[],
  tmplId: string | null,
  limit = 12
): TmplSession[] {
  const results: TmplSession[] = []
  const sorted = [...rows].sort((a, b) => (a.date < b.date ? 1 : -1))
  for (const row of sorted) {
    if (results.length >= limit) break
    if (tmplId && row.templateId !== tmplId) continue
    let series = 0, vol = 0
    for (const ex of row.exercicios) {
      for (const s of ex.series) {
        const r = Number(s.reps) || 0, c = Number(s.carga) || 0
        if (r > 0 && !s.warmup) { series++; vol += r * c }
      }
    }
    if (series === 0) continue
    results.push({
      date:       row.date,
      series,
      volume:     vol,
      kcal:       row.kcal ?? 0,
      exercicios: row.exercicios,
      templateId: row.templateId ?? null,
    })
  }
  return results
}

// ── 5 insights automáticos ──────────────────────────────────────────────────

function getUserLevel(rows: WorkoutRowLike[]): 'iniciante' | 'intermediario' | 'avancado' {
  if (rows.length === 0) return 'iniciante'
  const dates = rows.map(r => r.date).sort()
  const first = new Date(dates[0] + 'T00:00:00')
  const months = (Date.now() - first.getTime()) / (1000 * 60 * 60 * 24 * 30)
  if (months < 3)  return 'iniciante'
  if (months < 12) return 'intermediario'
  return 'avancado'
}

/** INSIGHT 1: Plateau de carga por exercício */
function detectPlateaus(
  rows: WorkoutRowLike[],
  customExercises: CustomExercise[]
): Insight[] {
  const level  = getUserLevel(rows)
  const nWeeks = level === 'iniciante' ? 2 : 3
  const today  = todayISO()
  const cutoff = shiftDateStr(today, -(nWeeks * 7))

  const allExIds = new Set<string>()
  for (const row of rows) for (const ex of row.exercicios) allExIds.add(ex.exercicioId)

  const insights: Insight[] = []
  for (const exId of allExIds) {
    const sessions = getAllExSessions(rows, exId, 20)
    if (sessions.length < 2) continue
    const recent = sessions.filter(s => s.date >= cutoff)
    const older  = sessions.filter(s => s.date <  cutoff)
    if (recent.length === 0 || older.length === 0) continue
    const currentMax    = Math.max(...recent.map(s => s.maxCarga))
    const historicalMax = Math.max(...older.map(s => s.maxCarga))
    if (currentMax > historicalMax) continue
    if (currentMax === 0 && historicalMax === 0) continue
    const exNome = resolveExName(exId, customExercises)
    const detalhe = level === 'iniciante'
      ? `${exNome} parado há ${nWeeks} semanas — incomum para iniciantes. Verifique: as séries estão chegando perto da falha? A dieta está adequada? Carga atual: ${currentMax}kg | Melhor anterior: ${historicalMax}kg`
      : `${exNome} sem progressão há ${nWeeks} semanas. Considere: 3–4 séries/semana por 2 semanas, mantendo a carga (${currentMax}kg).`
    insights.push({
      nivel:  'warning', icone: '⚠',
      titulo:  `${exNome} — sem progressão há ${nWeeks} sem.`,
      resumo:  level === 'iniciante'
        ? 'Incomum para iniciantes. Verifique se as séries chegam perto da falha.'
        : 'Normal para seu nível. Considere um ciclo de redução de volume.',
      detalhe,
      grupo: resolvePrimaryGroup(exId, customExercises),
    })
  }
  return insights
}

/** INSIGHT 2: Volume Cycling (necessidade de deload) */
function detectVolumeCyclingNeed(
  rows: WorkoutRowLike[],
  customExercises: CustomExercise[]
): Insight[] {
  const today    = todayISO()
  const insights: Insight[] = []

  for (const grupo of MUSCLE_ORDER) {
    const lm = MUSCLE_LANDMARKS[grupo]

    // Gatilho A: volume cronicamente alto (4 das últimas 6 semanas ativas acima do MAV)
    let weeksAboveMav = 0, activeWeeksA = 0
    for (let w = 0; w < 6; w++) {
      const wEnd   = shiftDateStr(today, -(w * 7))
      const wStart = shiftDateStr(today, -(w * 7 + 6))
      if (!rows.some(r => r.date >= wStart && r.date <= wEnd)) continue
      activeWeeksA++
      const wVol = calcMuscleVolume(rows, wStart, wEnd, customExercises)
      if (wVol[grupo].total > lm.mav) weeksAboveMav++
    }
    if (activeWeeksA >= 6 && weeksAboveMav >= 4) {
      insights.push({
        nivel: 'warning', icone: '⚠',
        titulo:  `${grupo} — volume alto por ${weeksAboveMav} semanas`,
        resumo:  `Acima do ideal por ${weeksAboveMav} semanas. Hora de parar no posto.`,
        detalhe: `${grupo} acima do volume ideal por ${weeksAboveMav} semanas seguidas. Sugestão: reduza para 3–4 séries/semana por 2 semanas. Mantenha a carga.`,
        grupo,
      })
      continue
    }

    // Gatilho B: queda de força em 2+ exercícios do mesmo grupo na semana
    const thisWeekStart = shiftDateStr(today, -6)
    const lastWeekStart = shiftDateStr(today, -13)
    const lastWeekEnd   = shiftDateStr(today, -7)
    const exIds = new Set<string>()
    for (const row of rows) {
      for (const ex of row.exercicios) {
        if (resolvePrimaryGroup(ex.exercicioId, customExercises) === grupo) exIds.add(ex.exercicioId)
      }
    }
    let dropCount = 0
    for (const exId of exIds) {
      const sessions = getAllExSessions(rows, exId, 20)
      const thisWeek = sessions.filter(s => s.date >= thisWeekStart)
      const lastWeek = sessions.filter(s => s.date >= lastWeekStart && s.date <= lastWeekEnd)
      if (thisWeek.length === 0 || lastWeek.length === 0) continue
      const thisMax = Math.max(...thisWeek.map(s => s.maxCarga))
      const lastMax = Math.max(...lastWeek.map(s => s.maxCarga))
      if (thisMax < lastMax && lastMax > 0) dropCount++
    }
    if (dropCount >= 2) {
      insights.push({
        nivel: 'warning', icone: '⚠',
        titulo:  `${grupo} — queda de força em ${dropCount} exercícios`,
        resumo:  'Sinal de fadiga acumulada. Semana de manutenção pode ajudar.',
        detalhe: `Queda de força em ${dropCount} exercícios de ${grupo} esta semana. Considere uma semana de manutenção: 3–4 séries, carga alta, sem chegar na falha.`,
        grupo,
      })
    }
  }
  return insights
}

/** INSIGHT 3: Rep Range Monotonia */
function detectRepMonotony(
  rows: WorkoutRowLike[],
  customExercises: CustomExercise[]
): Insight[] {
  const allExIds = new Set<string>()
  for (const row of rows) for (const ex of row.exercicios) allExIds.add(ex.exercicioId)
  const insights: Insight[] = []
  for (const exId of allExIds) {
    const sessions = getAllExSessions(rows, exId, 8)
    if (sessions.length < 4) continue
    const last4 = sessions.slice(0, 4)
    const means = last4.map(s => {
      const totalReps = s.series.reduce((a, s2) => a + (Number(s2.reps) || 0), 0)
      return s.series.length > 0 ? totalReps / s.series.length : 0
    })
    const avg      = means.reduce((a, b) => a + b, 0) / means.length
    const variance = means.reduce((a, b) => a + (b - avg) ** 2, 0) / means.length
    const stdDev   = Math.sqrt(variance)
    const exNome   = resolveExName(exId, customExercises)

    // Sub-caso crítico: média < 8 reps em 6+ sessões consecutivas
    if (sessions.length >= 6) {
      const last6    = sessions.slice(0, 6)
      const allHeavy = last6.every(s => {
        const total = s.series.reduce((a, s2) => a + (Number(s2.reps) || 0), 0)
        return s.series.length > 0 && (total / s.series.length) < 8
      })
      if (allHeavy) {
        insights.push({
          nivel: 'info', icone: 'ℹ',
          titulo: `${exNome} — cargas pesadas por 6 sessões`,
          resumo: 'Reps sempre abaixo de 8. Considere uma fase com reps mais altas.',
          detalhe: `${exNome} com cargas pesadas há 6 sessões. Para proteger os tendões, considere uma fase com reps mais altas (12–15) por algumas semanas.`,
          grupo: resolvePrimaryGroup(exId, customExercises),
        })
        continue
      }
    }

    if (stdDev < 2 && avg > 0) {
      const minR = Math.round(Math.min(...means))
      const maxR = Math.round(Math.max(...means))
      insights.push({
        nivel: 'info', icone: 'ℹ',
        titulo: `${exNome} — sempre ${minR}–${maxR} reps (${last4.length} sessões)`,
        resumo: 'Variar a faixa pode trazer novos estímulos e melhorar conforto articular.',
        detalhe: `${exNome} sempre entre ${minR}–${maxR} reps há ${last4.length} sessões. Variar a faixa pode trazer novos estímulos e melhorar o conforto articular.`,
        grupo: resolvePrimaryGroup(exId, customExercises),
      })
    }
  }
  return insights
}

/** INSIGHT 4: Desequilíbrio entre grupos antagonistas */
function detectMuscleImbalance(
  rows: WorkoutRowLike[],
  customExercises: CustomExercise[]
): Insight[] {
  const today     = todayISO()
  const weekStart = shiftDateStr(today, -6)
  const vol = calcMuscleVolume(rows, weekStart, today, customExercises)
  const pairs: [MuscleGroup, MuscleGroup][] = [
    ['🏋️ Peito',  '🦅 Costas'],
    ['🦵 Quad',   '🦵 Posterior'],
    ['💪 Bíceps', '💪 Tríceps'],
  ]
  const insights: Insight[] = []
  for (const [gA, gB] of pairs) {
    const vA = vol[gA]?.total ?? 0
    const vB = vol[gB]?.total ?? 0
    if (vA === 0 && vB === 0) continue
    const major    = vA >= vB ? gA : gB
    const minor    = vA >= vB ? gB : gA
    const volMajor = vA >= vB ? vA : vB
    const volMinor = vA >= vB ? vB : vA
    const lmMinor  = MUSCLE_LANDMARKS[minor]
    if (!lmMinor) continue
    if (volMinor >= lmMinor.mev) continue
    if (volMajor === 0) continue
    const ratio = volMinor === 0 ? volMajor : +(volMajor / volMinor).toFixed(1)
    if (ratio < 2.5) continue
    insights.push({
      nivel: 'warning', icone: '⚠',
      titulo: `${major} com volume ${ratio}x maior que ${minor}`,
      resumo: `${minor} abaixo do mínimo. Desequilíbrio pode afetar postura e progressão.`,
      detalhe: `${major} com volume ${ratio}x maior que ${minor} esta semana. ${minor} abaixo do mínimo (${volMinor} de ${lmMinor.mev} séries) pode afetar postura e limitar o desenvolvimento de ${major}.`,
      grupo: minor,
    })
  }
  return insights
}

const CHRONIC_LOW_SUGGESTIONS: Partial<Record<MuscleGroup, string>> = {
  '🦵 Posterior': 'Adicionar 1 mesa flexora + 1 stiff por semana já é suficiente.',
  '🍑 Glúteos':   'Hip thrust é o exercício de maior retorno para glúteos. 3 séries 2x/semana.',
  '🧱 Core':      'Prancha e abdominal crunch — 2–3 séries ao final de qualquer treino.',
  '💪 Bíceps':    'Já vem de costas — verifique se suas remadas estão sendo contadas.',
  '💪 Tríceps':   'Já vem do supino — verifique se seus exercícios compostos estão sendo contados.',
}

/** INSIGHT 5: Grupo negligenciado cronicamente (3+ das últimas 4 semanas abaixo do MEV) */
function detectChronicLowVolume(
  rows: WorkoutRowLike[],
  customExercises: CustomExercise[]
): Insight[] {
  const today    = todayISO()
  const insights: Insight[] = []
  for (const grupo of MUSCLE_ORDER) {
    const lm = MUSCLE_LANDMARKS[grupo]
    let weeksBelow = 0, activeWeeks = 0
    for (let w = 0; w < 4; w++) {
      const wEnd   = shiftDateStr(today, -(w * 7))
      const wStart = shiftDateStr(today, -(w * 7 + 6))
      if (!rows.some(r => r.date >= wStart && r.date <= wEnd)) continue
      activeWeeks++
      const wVol = calcMuscleVolume(rows, wStart, wEnd, customExercises)
      if (wVol[grupo].total < lm.mev) weeksBelow++
    }
    if (activeWeeks < 3 || weeksBelow < 3) continue
    const suggestion = CHRONIC_LOW_SUGGESTIONS[grupo] ?? `Adicione séries diretas de ${grupo} na sua rotina.`
    insights.push({
      nivel: 'warning', icone: '⚠',
      titulo: `${grupo} — abaixo do mínimo por ${weeksBelow} semanas`,
      resumo: `${weeksBelow} das últimas ${activeWeeks} semanas abaixo de ${lm.mev} séries. ${suggestion}`,
      detalhe: `${grupo} abaixo do mínimo por ${weeksBelow} das últimas ${activeWeeks} semanas. ${suggestion}`,
      grupo,
    })
  }
  return insights
}

/** Mapa grupo → lista de insights (negativos + positivo quando tudo ok) */
export function buildInsightsByGroup(
  rows: WorkoutRowLike[],
  customExercises: CustomExercise[],
  currentVol?: MuscleVolumeMap
): Record<MuscleGroup, Insight[]> {
  const today = todayISO()
  const vol   = currentVol ?? calcMuscleVolume(rows, shiftDateStr(today, -6), today, customExercises)

  const map = {} as Record<MuscleGroup, Insight[]>
  MUSCLE_ORDER.forEach(g => { map[g] = [] })

  const allNeg = [
    ...detectVolumeCyclingNeed(rows, customExercises),
    ...detectPlateaus(rows, customExercises),
    ...detectMuscleImbalance(rows, customExercises),
    ...detectChronicLowVolume(rows, customExercises),
    ...detectRepMonotony(rows, customExercises),
  ]
  for (const ins of allNeg) {
    if (ins.grupo && map[ins.grupo]) map[ins.grupo].push(ins)
  }

  // Chip positivo: volume ideal + sem alertas
  for (const grupo of MUSCLE_ORDER) {
    if (map[grupo].length > 0) continue
    const total = vol[grupo]?.total ?? 0
    const lm    = MUSCLE_LANDMARKS[grupo]
    if (total === 0) continue
    if (total >= lm.mev && total < lm.mrv) {
      map[grupo].push({
        nivel: 'ok', icone: '✅',
        titulo:  'Volume ideal',
        detalhe: `${grupo} com ${Math.round(total * 2) / 2} séries esta semana — dentro da faixa ideal (MEV: ${lm.mev}, MRV: ${lm.mrv} séries).`,
        grupo,
      })
    }
  }
  return map
}

// ── hook ──────────────────────────────────────────────────────────────────

interface UseMuscleVolumeProps {
  rows:            WorkoutRowLike[]
  customExercises: CustomExercise[]
}

export function useMuscleVolume({ rows, customExercises }: UseMuscleVolumeProps) {
  const today = todayISO()

  const currentWeekVol = useMemo(
    () => calcMuscleVolume(rows, shiftDateStr(today, -6), today, customExercises),
    [rows, customExercises, today]
  )

  const avg4weeks = useMemo(
    () => calcMuscleAvg4weeks(rows, customExercises),
    [rows, customExercises]
  )

  const frequencyAlerts = useMemo(
    () => calcFrequencyAlert(rows, shiftDateStr(today, -6), today, customExercises),
    [rows, customExercises, today]
  )

  const insightsByGroup = useMemo(
    () => buildInsightsByGroup(rows, customExercises, currentWeekVol),
    [rows, customExercises, currentWeekVol]
  )

  return { currentWeekVol, avg4weeks, frequencyAlerts, insightsByGroup }
}
