// ════════════════════════════════════════════════════════════════════════════
// migrationImport.ts — Upserts no Supabase
// Recebe TransformResult + userId, insere em batches com ignoreDuplicates
// ════════════════════════════════════════════════════════════════════════════

import { supabase } from './supabase'
import type { TransformResult } from './migrationTransform'

export interface ImportProgress {
  step:  'settings' | 'diary' | 'workouts' | 'templates' |
         'customExercises' | 'body' | 'habits' | 'done'
  done:  number
  total: number
}

type ProgressCallback = (p: ImportProgress) => void

// Helper: inserir em batches de 50
async function batchUpsert<T extends object>(
  table: string,
  rows: T[],
  onConflict: string,
  signal?: AbortSignal
): Promise<number> {
  const SIZE = 50
  let inserted = 0
  for (let i = 0; i < rows.length; i += SIZE) {
    if (signal?.aborted) throw new Error('Importação cancelada')
    const batch = rows.slice(i, i + SIZE)
    const { error } = await supabase
      .from(table)
      .upsert(batch, { onConflict, ignoreDuplicates: true })
    if (error) console.error(`[migrate] ${table} batch erro:`, error)
    else inserted += batch.length
  }
  return inserted
}

export async function runImport(
  userId: string,
  result: TransformResult,
  onProgress: ProgressCallback,
  signal?: AbortSignal
): Promise<{ total: number; errors: string[] }> {
  const errors: string[] = []
  let total = 0

  // 1. Settings (upsert único — ignoreDuplicates: não sobrescreve se já existe)
  onProgress({ step: 'settings', done: 0, total: 1 })
  const { error: settingsErr } = await supabase
    .from('user_settings')
    .upsert({ user_id: userId, data: result.settings }, { onConflict: 'user_id', ignoreDuplicates: true })
  if (settingsErr) errors.push('settings: ' + settingsErr.message)
  else total++
  onProgress({ step: 'settings', done: 1, total: 1 })

  // 2. Diário
  const diaryRows = result.diary.map(d => ({
    user_id: userId, date: d.date, data: d.data,
  }))
  onProgress({ step: 'diary', done: 0, total: diaryRows.length })
  const diaryCount = await batchUpsert('diary_entries', diaryRows, 'user_id,date', signal)
    .catch(e => { errors.push('diary: ' + String(e)); return 0 })
  total += diaryCount
  onProgress({ step: 'diary', done: diaryRows.length, total: diaryRows.length })

  // 3. Treinos
  const workoutRows = result.workouts.map(w => ({
    user_id: userId, date: w.date, data: w.data,
  }))
  onProgress({ step: 'workouts', done: 0, total: workoutRows.length })
  const workoutCount = await batchUpsert('workouts', workoutRows, 'user_id,date', signal)
    .catch(e => { errors.push('workouts: ' + String(e)); return 0 })
  total += workoutCount
  onProgress({ step: 'workouts', done: workoutRows.length, total: workoutRows.length })

  // 4. Templates (upsert único — substitui o array inteiro se não existir)
  onProgress({ step: 'templates', done: 0, total: 1 })
  if (result.templates.length > 0) {
    const { error: tmplErr } = await supabase
      .from('workout_templates')
      .upsert(
        { user_id: userId, templates: result.templates },
        { onConflict: 'user_id', ignoreDuplicates: true }
      )
    if (tmplErr) errors.push('templates: ' + tmplErr.message)
    else total++
  }
  onProgress({ step: 'templates', done: 1, total: 1 })

  // 5. Exercícios personalizados (sem UNIQUE user_id+nome — verificar antes de inserir)
  const exRows = result.customExercises.map(e => ({ user_id: userId, ...e }))
  onProgress({ step: 'customExercises', done: 0, total: exRows.length })
  if (exRows.length > 0) {
    const { data: existing } = await supabase
      .from('custom_exercises')
      .select('nome')
      .eq('user_id', userId)
    const existingNomes = new Set((existing ?? []).map((r: { nome: string }) => r.nome))
    const novos = exRows.filter(e => !existingNomes.has(e.nome))
    if (novos.length > 0) {
      const { error: exErr } = await supabase.from('custom_exercises').insert(novos)
      if (exErr) errors.push('customExercises: ' + exErr.message)
      else total += novos.length
    }
  }
  onProgress({ step: 'customExercises', done: exRows.length, total: exRows.length })

  // 6. Medições corporais
  const bodyRows = result.body.map(b => ({
    user_id: userId, date: b.date, data: b.data,
  }))
  onProgress({ step: 'body', done: 0, total: bodyRows.length })
  const bodyCount = await batchUpsert('body_measurements', bodyRows, 'user_id,date', signal)
    .catch(e => { errors.push('body: ' + String(e)); return 0 })
  total += bodyCount
  onProgress({ step: 'body', done: bodyRows.length, total: bodyRows.length })

  // 7. Hábitos
  const habitRows = result.habits.map(h => ({ user_id: userId, ...h }))
  onProgress({ step: 'habits', done: 0, total: habitRows.length })
  const habitCount = await batchUpsert('habits', habitRows, 'user_id,date', signal)
    .catch(e => { errors.push('habits: ' + String(e)); return 0 })
  total += habitCount
  onProgress({ step: 'habits', done: habitRows.length, total: habitRows.length })

  onProgress({ step: 'done', done: total, total })
  return { total, errors }
}
