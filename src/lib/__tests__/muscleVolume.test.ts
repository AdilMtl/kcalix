import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  buildCurrentVolumeInsight,
  buildExerciseInsights,
  buildInsightsByGroup,
  calcMuscleVolume,
  type WorkoutRowLike,
} from '../../hooks/useMuscleVolume'
import { MUSCLE_LANDMARKS } from '../../data/exerciseDb'
import type { CustomExercise, WorkoutSet } from '../../types/workout'

const TODAY = '2026-07-14'

function dateAt(offsetDays: number): string {
  const date = new Date(`${TODAY}T12:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + offsetDays)
  return date.toISOString().slice(0, 10)
}

function sets(count: number, carga = '50'): WorkoutSet[] {
  return Array.from({ length: count }, () => ({ reps: '10', carga }))
}

function row(
  date: string,
  exercicioId: string,
  series: WorkoutSet[],
): WorkoutRowLike {
  return { date, exercicios: [{ exercicioId, series }] }
}

const customExercises: CustomExercise[] = [
  {
    id: 'peito-a',
    user_id: 'user-1',
    nome: 'Supino Academia A',
    grupo: '🏋️ Peito',
    secundarios: [],
    arquivado: false,
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'peito-b',
    user_id: 'user-1',
    nome: 'Supino Academia B',
    grupo: 'Peito',
    secundarios: [],
    arquivado: false,
    created_at: '2026-01-01T00:00:00.000Z',
  },
]

describe('analytics de volume muscular', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(`${TODAY}T12:00:00.000Z`))
  })

  afterEach(() => vi.useRealTimers())

  it('soma séries por grupo sem contar IDs, aquecimento ou linhas vazias', () => {
    const rows = [
      row(TODAY, 'peito-a', [
        ...sets(3),
        { reps: '10', carga: '20', warmup: true },
        { reps: '', carga: '' },
      ]),
      row(TODAY, 'peito-b', sets(4)),
      row(dateAt(-8), 'peito-a', sets(9)),
    ]

    const volume = calcMuscleVolume(rows, dateAt(-6), TODAY, customExercises)

    expect(volume['🏋️ Peito']).toEqual({ direct: 7, indirect: 0, total: 7 })
    expect(MUSCLE_LANDMARKS['🏋️ Peito']).toEqual({ mev: 10, mav: 15, mrv: 25 })
  })

  it('mantém insights específicos fora da análise agregada por grupo', () => {
    const rows = [
      row(dateAt(-42), 'peito-a', sets(3)),
      row(dateAt(-14), 'peito-a', sets(3)),
      row(dateAt(-7), 'peito-a', sets(3)),
      row(dateAt(-1), 'peito-a', sets(3)),
    ]

    const exerciseInsights = buildExerciseInsights(rows, customExercises, 'peito-a')
    const groupInsights = buildInsightsByGroup(rows, customExercises)

    expect(exerciseInsights.some(insight => insight.nivel === 'warning')).toBe(true)
    expect(exerciseInsights.some(insight => insight.nivel === 'info')).toBe(true)
    expect(groupInsights['🏋️ Peito'].every(insight => insight.exercicioId == null)).toBe(true)
    expect(groupInsights['🏋️ Peito'].every(insight => !insight.titulo.includes('Supino Academia A'))).toBe(true)
  })

  it('não cria dica de exercício para equipamento inativo', () => {
    const rows = [
      row(dateAt(-49), 'peito-a', sets(3)),
      row(dateAt(-42), 'peito-a', sets(3)),
      row(dateAt(-35), 'peito-a', sets(3)),
      row(dateAt(-28), 'peito-a', sets(3)),
    ]

    expect(buildExerciseInsights(rows, customExercises, 'peito-a')).toEqual([])
  })

  it('classifica a janela atual sem transformar uma semana alta em deload automático', () => {
    expect(buildCurrentVolumeInsight('🏋️ Peito', 7)?.titulo).toBe('Abaixo do MEV')
    expect(buildCurrentVolumeInsight('🦵 Quad', 13)?.titulo).toBe('Faixa produtiva')
    expect(buildCurrentVolumeInsight('🦅 Costas', 20)?.titulo).toBe('Volume alto')

    const aboveMrv = buildCurrentVolumeInsight('🦵 Posterior', 21.5)
    expect(aboveMrv?.titulo).toBe('Acima do MRV')
    expect(aboveMrv?.detalhe).toContain('Uma semana isolada não exige deload')
  })

  it('não cria status semanal quando não há séries válidas', () => {
    expect(buildCurrentVolumeInsight('🧱 Core', 0)).toBeNull()
  })
})
