import { describe, expect, it } from 'vitest'
import { MUSCLE_LANDMARKS, MUSCLE_ORDER } from '../../data/exerciseDb'
import type { CustomExercise, WorkoutExercise } from '../../types/workout'
import {
  buildCompletedWorkoutSummary,
  buildWorkoutRecommendation,
  type WorkoutRowWithDate,
} from '../homeDashboard'

function sets(count: number, reps = '10', load = '50'): WorkoutExercise['series'] {
  return Array.from({ length: count }, () => ({ reps, carga: load }))
}

function row(
  date: string,
  exercicios: WorkoutExercise[],
  options: Partial<WorkoutRowWithDate> = {},
): WorkoutRowWithDate {
  return {
    date,
    templateId: null,
    exercicios,
    cardio: [],
    nota: '',
    kcal: 0,
    savedAt: `${date}T20:00:00.000Z`,
    ...options,
  }
}

describe('buildWorkoutRecommendation', () => {
  it('ranqueia grupos abaixo do MEV e combina grupo grande com complementar', () => {
    const result = buildWorkoutRecommendation([], [], '2026-07-10')

    expect(result.ranked).toHaveLength(MUSCLE_ORDER.length)
    expect(result.large?.category).toBe('large')
    expect(result.complementary?.category).toBe('complementary')
    expect(result.allAtMinimum).toBe(false)
  })

  it('considera exercícios personalizados e reconhece quando todos atingiram o MEV', () => {
    const customExercises: CustomExercise[] = MUSCLE_ORDER.map((group, index) => ({
      id: `custom-${index}`,
      user_id: 'user-1',
      nome: `Exercício ${index}`,
      grupo: group,
      secundarios: [],
      arquivado: false,
      created_at: '2026-07-01T00:00:00.000Z',
    }))
    const exercises = customExercises.map(exercise => ({
      exercicioId: exercise.id,
      series: sets(MUSCLE_LANDMARKS[exercise.grupo as keyof typeof MUSCLE_LANDMARKS].mev),
    }))

    const result = buildWorkoutRecommendation(
      [row('2026-07-10', exercises)],
      customExercises,
      '2026-07-10',
    )

    expect(result.ranked).toEqual([])
    expect(result.large).toBeNull()
    expect(result.complementary).toBeNull()
    expect(result.allAtMinimum).toBe(true)
  })
})

describe('buildCompletedWorkoutSummary', () => {
  it('aceita treino salvo com zero kcal e ignora aquecimento', () => {
    const workout = row('2026-07-10', [{
      exercicioId: 'remada_baixa',
      series: [
        { reps: '12', carga: '30', warmup: true },
        { reps: '10', carga: '60' },
        { reps: '10', carga: '60' },
      ],
    }])

    const summary = buildCompletedWorkoutSummary(workout, [workout], [])

    expect(summary.kcal).toBe(0)
    expect(summary.workSets).toBe(2)
    expect(summary.volume).toBe(1200)
    expect(summary.durationMin).toBeNull()
  })

  it('compara com a sessão anterior e identifica carga recorde', () => {
    const previous = row('2026-07-03', [{ exercicioId: 'remada_baixa', series: sets(3, '10', '60') }])
    const current = row(
      '2026-07-10',
      [{ exercicioId: 'remada_baixa', series: sets(3, '10', '65') }],
      { kcal: 438, durationMin: 52 },
    )

    const summary = buildCompletedWorkoutSummary(current, [previous, current], [])

    expect(summary.hasComparison).toBe(true)
    expect(summary.volumeDeltaPct).toBeCloseTo(8.3, 1)
    expect(summary.prCount).toBe(1)
    expect(summary.durationMin).toBe(52)
    expect(summary.progressItems[0]?.exercise).toContain('Remada baixa')
  })

  it('não inventa comparação nem usa séries com reps não numéricas', () => {
    const workout = row('2026-07-10', [{
      exercicioId: 'supino_reto',
      series: [
        { reps: 'falha', carga: '80' },
        { reps: '10-12', carga: '70' },
      ],
    }])

    const summary = buildCompletedWorkoutSummary(workout, [workout], [])

    expect(summary.workSets).toBe(0)
    expect(summary.volume).toBe(0)
    expect(summary.hasComparison).toBe(false)
    expect(summary.progressItems).toEqual([])
  })
})
