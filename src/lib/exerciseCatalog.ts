import type { CustomExercise } from '../types/workout'
import { normalizeGroup } from './normalizeGroup'

export const CUSTOM_EXERCISE_GROUP = '⭐ Meus exercícios'

/**
 * Retorna somente exercícios personalizados ativos para a aba selecionada.
 * A aba "Meus exercícios" agrega todos; as demais respeitam o grupo canônico.
 */
export function customExercisesForGroup(
  customExercises: CustomExercise[],
  selectedGroup: string,
): CustomExercise[] {
  const active = customExercises.filter(exercise => !exercise.arquivado)
  if (selectedGroup === CUSTOM_EXERCISE_GROUP) return active
  return active.filter(exercise => normalizeGroup(exercise.grupo) === selectedGroup)
}
