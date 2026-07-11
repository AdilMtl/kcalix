import { MUSCLE_LANDMARKS, MUSCLE_ORDER } from '../data/exerciseDb'
import { calcMuscleVolume, resolveExName, resolvePrimaryGroup } from '../hooks/useMuscleVolume'
import type { MuscleGroup, MuscleVolumeMap } from '../hooks/useMuscleVolume'
import type { CustomExercise, WorkoutDayData, WorkoutExercise, WorkoutSet } from '../types/workout'

export type WorkoutRowWithDate = WorkoutDayData & { date: string }

export type RankedMuscle = {
  group: MuscleGroup
  label: string
  sets: number
  mev: number
  mrv: number
  fillPct: number
  missingSets: number
  category: 'large' | 'complementary'
}

export type WorkoutRecommendation = {
  volume: MuscleVolumeMap
  ranked: RankedMuscle[]
  large: RankedMuscle | null
  complementary: RankedMuscle | null
  allAtMinimum: boolean
}

export type WorkoutProgressItem = {
  exercise: string
  detail: string
  value: string
}

export type CompletedWorkoutSummary = {
  kcal: number
  workSets: number
  durationMin: number | null
  volume: number
  totalReps: number
  volumeDeltaPct: number | null
  repsDelta: number | null
  prCount: number
  progressItems: WorkoutProgressItem[]
  hasComparison: boolean
}

const LARGE_GROUPS = new Set<MuscleGroup>([
  '🏋️ Peito',
  '🦅 Costas',
  '🦵 Quad',
  '🦵 Posterior',
  '🍑 Glúteos',
])

function shiftDate(date: string, days: number): string {
  const value = new Date(`${date}T12:00:00`)
  value.setDate(value.getDate() + days)
  return value.toISOString().slice(0, 10)
}

export function muscleLabel(group: MuscleGroup): string {
  return group.replace(/^[^\p{L}\p{N}]+/u, '').trim()
}

export function workoutFocusLabels(
  workout: WorkoutDayData,
  customExercises: CustomExercise[],
): string[] {
  const groups = workout.exercicios
    .map(exercise => resolvePrimaryGroup(exercise.exercicioId, customExercises))
    .filter((group): group is MuscleGroup => group != null)
    .map(muscleLabel)
  return [...new Set(groups)].slice(0, 3)
}

export function buildWorkoutRecommendation(
  rows: WorkoutRowWithDate[],
  customExercises: CustomExercise[],
  endDate: string,
): WorkoutRecommendation {
  const volume = calcMuscleVolume(rows, shiftDate(endDate, -6), endDate, customExercises)
  const ranked = MUSCLE_ORDER
    .map(group => {
      const sets = Math.round((volume[group]?.total ?? 0) * 2) / 2
      const { mev, mrv } = MUSCLE_LANDMARKS[group]
      return {
        group,
        label: muscleLabel(group),
        sets,
        mev,
        mrv,
        fillPct: mev > 0 ? Math.min(100, Math.round((sets / mev) * 100)) : 100,
        missingSets: Math.max(0, Math.ceil(mev - sets)),
        category: LARGE_GROUPS.has(group) ? 'large' as const : 'complementary' as const,
      }
    })
    .filter(item => item.sets < item.mev)
    .sort((a, b) => (a.sets / a.mev) - (b.sets / b.mev) || b.missingSets - a.missingSets)

  return {
    volume,
    ranked,
    large: ranked.find(item => item.category === 'large') ?? null,
    complementary: ranked.find(item => item.category === 'complementary') ?? null,
    allAtMinimum: ranked.length === 0,
  }
}

type ExerciseMetrics = {
  workSets: number
  totalReps: number
  volume: number
  maxLoad: number
}

function numericValue(value: string): number | null {
  const parsed = Number(value.replace(',', '.'))
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

function workSeries(series: WorkoutSet[]): WorkoutSet[] {
  return series.filter(set => !set.warmup && numericValue(set.reps) != null)
}

function exerciseMetrics(exercise: WorkoutExercise): ExerciseMetrics {
  const series = workSeries(exercise.series)
  return series.reduce<ExerciseMetrics>((metrics, set) => {
    const reps = numericValue(set.reps) ?? 0
    const load = numericValue(set.carga) ?? 0
    return {
      workSets: metrics.workSets + 1,
      totalReps: metrics.totalReps + reps,
      volume: metrics.volume + reps * load,
      maxLoad: Math.max(metrics.maxLoad, load),
    }
  }, { workSets: 0, totalReps: 0, volume: 0, maxLoad: 0 })
}

function previousExercise(
  exerciseId: string,
  rows: WorkoutRowWithDate[],
  beforeDate: string,
): WorkoutExercise | null {
  return rows
    .filter(row => row.date < beforeDate)
    .sort((a, b) => b.date.localeCompare(a.date))
    .flatMap(row => row.exercicios)
    .find(exercise => exercise.exercicioId === exerciseId) ?? null
}

function historicalMaxLoad(exerciseId: string, rows: WorkoutRowWithDate[], beforeDate: string): number {
  return rows
    .filter(row => row.date < beforeDate)
    .flatMap(row => row.exercicios)
    .filter(exercise => exercise.exercicioId === exerciseId)
    .reduce((max, exercise) => Math.max(max, exerciseMetrics(exercise).maxLoad), 0)
}

export function buildCompletedWorkoutSummary(
  workout: WorkoutRowWithDate,
  allRows: WorkoutRowWithDate[],
  customExercises: CustomExercise[],
): CompletedWorkoutSummary {
  let workSets = 0
  let totalReps = 0
  let volume = 0
  let previousVolume = 0
  let previousReps = 0
  let comparableVolume = 0
  let comparableReps = 0
  let comparisonCount = 0
  let prCount = 0
  const progressItems: WorkoutProgressItem[] = []

  for (const exercise of workout.exercicios) {
    const current = exerciseMetrics(exercise)
    workSets += current.workSets
    totalReps += current.totalReps
    volume += current.volume

    const previous = previousExercise(exercise.exercicioId, allRows, workout.date)
    if (!previous) continue
    const prior = exerciseMetrics(previous)
    comparisonCount += 1
    comparableVolume += current.volume
    comparableReps += current.totalReps
    previousVolume += prior.volume
    previousReps += prior.totalReps

    const name = resolveExName(exercise.exercicioId, customExercises)
    const historicalMax = historicalMaxLoad(exercise.exercicioId, allRows, workout.date)
    if (current.maxLoad > historicalMax && current.maxLoad > 0) {
      prCount += 1
      progressItems.push({ exercise: name, detail: 'nova melhor carga', value: `${current.maxLoad} kg` })
    } else if (current.totalReps > prior.totalReps) {
      progressItems.push({ exercise: name, detail: 'mais repeticoes', value: `+${Math.round(current.totalReps - prior.totalReps)}` })
    } else if (prior.volume > 0 && current.volume > prior.volume) {
      const delta = Math.round(((current.volume - prior.volume) / prior.volume) * 100)
      progressItems.push({ exercise: name, detail: 'mais volume', value: `+${delta}%` })
    }
  }

  const hasComparison = comparisonCount > 0
  const volumeDeltaPct = hasComparison && previousVolume > 0
    ? Math.round(((comparableVolume - previousVolume) / previousVolume) * 1000) / 10
    : null
  const repsDelta = hasComparison ? Math.round(comparableReps - previousReps) : null

  return {
    kcal: Math.round(workout.kcal ?? 0),
    workSets,
    durationMin: workout.durationMin != null && workout.durationMin > 0 ? Math.round(workout.durationMin) : null,
    volume: Math.round(volume),
    totalReps: Math.round(totalReps),
    volumeDeltaPct,
    repsDelta,
    prCount,
    progressItems: progressItems.slice(0, 3),
    hasComparison,
  }
}
