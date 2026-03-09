// ══════════════════════════════════════════════════════════
// hooks/useHabits.ts — Hábitos diários
// ══════════════════════════════════════════════════════════
// Padrão: estado local → optimistic UI → persist Supabase em background
// Instanciar APENAS em HomePage — estado desce via props ao HabitTracker

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { type HabitRow, type HabitKey, type HabitsMap, HABITS_DEF } from '../types/habit'

// ── Utilitário: semana a partir de uma data ISO — fiel ao original L8126–8136
export function getWeekDates(isoDate: string): string[] {
  const ref = new Date(isoDate + 'T12:00:00')
  const dow = ref.getDay()
  const monday = new Date(ref)
  monday.setDate(ref.getDate() - (dow === 0 ? 6 : dow - 1))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d.toISOString().slice(0, 10)
  })
}

// ── Row vazia para um dia sem registro
function emptyRow(date: string): HabitRow {
  return {
    date,
    dieta: false,
    log: false,
    treino: false,
    cardio: false,
    medidas: false,
    custom_habits: {},
  }
}

// ── Verifica se uma chave é HabitKey (hábito fixo)
function isFixedKey(key: string): key is HabitKey {
  return ['dieta', 'log', 'treino', 'cardio', 'medidas'].includes(key)
}

export function useHabits() {
  const { user } = useAuthStore()
  const [habits, setHabits] = useState<HabitsMap>({})
  const [loading, setLoading] = useState(true)

  // ── Carrega hábitos dos últimos 30 dias (cobre a semana + histórico próximo)
  useEffect(() => {
    if (!user) return
    let cancelled = false

    const load = async () => {
      setLoading(true)
      const since = new Date()
      since.setDate(since.getDate() - 30)
      const sinceISO = since.toISOString().slice(0, 10)

      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', sinceISO)
        .order('date', { ascending: false })

      if (cancelled) return
      if (error) { console.error('[useHabits] load', error); setLoading(false); return }

      const map: HabitsMap = {}
      for (const row of (data ?? [])) {
        map[row.date] = row as HabitRow
      }
      setHabits(map)
      setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [user])

  // ── Toggle hábito (fixo ou custom) — optimistic UI
  const toggleHabit = useCallback((date: string, key: string) => {
    if (!user) return

    setHabits(prev => {
      const row = prev[date] ?? emptyRow(date)
      let updated: HabitRow

      if (isFixedKey(key)) {
        updated = { ...row, [key]: !row[key] }
      } else {
        const custom = { ...row.custom_habits, [key]: !row.custom_habits[key] }
        updated = { ...row, custom_habits: custom }
      }

      // persist em background
      supabase
        .from('habits')
        .upsert(
          { user_id: user.id, ...updated },
          { onConflict: 'user_id,date' }
        )
        .then(({ error }) => {
          if (error) console.error('[useHabits] upsert', error)
        })

      return { ...prev, [date]: updated }
    })
  }, [user])

  // ── Auto-check hábito fixo no dia de hoje (chamado pelo TreinoPage ao salvar)
  // Fiel ao original L8224–8234: só marca; não desmarca se já estiver checked
  const autoCheckHabit = useCallback((key: HabitKey) => {
    if (!user) return
    const todayStr = new Date().toISOString().slice(0, 10)

    setHabits(prev => {
      const row = prev[todayStr] ?? emptyRow(todayStr)
      if (row[key]) return prev  // já marcado — não faz nada

      const updated: HabitRow = { ...row, [key]: true }

      supabase
        .from('habits')
        .upsert(
          { user_id: user.id, ...updated },
          { onConflict: 'user_id,date' }
        )
        .then(({ error }) => {
          if (error) console.error('[useHabits] autoCheck', error)
        })

      const hab = HABITS_DEF.find(h => h.id === key)
      console.info(`[Hábito ✓] ${hab?.label ?? key}`)

      return { ...prev, [todayStr]: updated }
    })
  }, [user])

  return { habits, loading, toggleHabit, autoCheckHabit }
}
