import { describe, expect, it } from 'vitest'
import {
  CUSTOM_EXERCISE_GROUP,
  customExercisesForGroup,
} from '../exerciseCatalog'
import type { CustomExercise } from '../../types/workout'

function custom(
  id: string,
  grupo: string,
  arquivado = false,
): CustomExercise {
  return {
    id,
    user_id: 'user-1',
    nome: id,
    grupo,
    secundarios: [],
    arquivado,
    created_at: '2026-07-14T00:00:00.000Z',
  }
}

describe('customExercisesForGroup', () => {
  const exercises = [
    custom('peito-com-emoji', '🏋️ Peito'),
    custom('peito-migrado', 'Peito'),
    custom('costas', '🦅 Costas'),
    custom('peito-arquivado', '🏋️ Peito', true),
  ]

  it('inclui personalizados ativos do grupo, normalizando dados sem emoji', () => {
    expect(customExercisesForGroup(exercises, '🏋️ Peito').map(ex => ex.id)).toEqual([
      'peito-com-emoji',
      'peito-migrado',
    ])
  })

  it('agrega todos os personalizados ativos na aba Meus exercícios', () => {
    expect(customExercisesForGroup(exercises, CUSTOM_EXERCISE_GROUP).map(ex => ex.id)).toEqual([
      'peito-com-emoji',
      'peito-migrado',
      'costas',
    ])
  })
})
