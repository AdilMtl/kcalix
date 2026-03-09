import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { buildFoodLookup } from '../data/foodDb'

export interface FoodEntry {
  foodId: string
  nome: string
  qty: number
  porcaoG: number
  p: number
  c: number
  g: number
  kcal: number
  at: string   // ISO timestamp — usado para ordenar recentes
}

export interface DiaryMeals {
  cafe:    FoodEntry[]
  lanche1: FoodEntry[]
  almoco:  FoodEntry[]
  lanche2: FoodEntry[]
  jantar:  FoodEntry[]
  ceia:    FoodEntry[]
}

export interface DiaryTotals {
  p: number
  c: number
  g: number
  kcal: number
}

export interface DiaryData {
  meals: DiaryMeals
  totals: DiaryTotals
  kcalTreino: number
}

export type MealKey = keyof DiaryMeals

export const MEAL_LABELS: Record<MealKey, string> = {
  cafe:    '☕ Café',
  lanche1: '🕘 Lanche 1',
  almoco:  '🍛 Almoço',
  lanche2: '🕓 Lanche 2',
  jantar:  '🍽️ Jantar',
  ceia:    '🌙 Ceia',
}

const EMPTY_MEALS: DiaryMeals = {
  cafe: [], lanche1: [], almoco: [], lanche2: [], jantar: [], ceia: [],
}

const EMPTY_DIARY: DiaryData = {
  meals: EMPTY_MEALS,
  totals: { p: 0, c: 0, g: 0, kcal: 0 },
  kcalTreino: 0,
}

function recalcTotals(meals: DiaryMeals): DiaryTotals {
  const all = [
    ...meals.cafe, ...meals.lanche1, ...meals.almoco,
    ...meals.lanche2, ...meals.jantar, ...meals.ceia,
  ]
  return all.reduce(
    (acc, item) => ({
      p:    acc.p    + item.p,
      c:    acc.c    + item.c,
      g:    acc.g    + item.g,
      kcal: acc.kcal + item.kcal,
    }),
    { p: 0, c: 0, g: 0, kcal: 0 }
  )
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

import type { FoodItem } from '../data/foodDb'

interface UseDiaryReturn {
  diary: DiaryData
  loading: boolean
  addFood: (meal: MealKey, entry: FoodEntry) => Promise<void>
  addFoodOptimistic: (meal: MealKey, entry: FoodEntry) => void
  removeFood: (meal: MealKey, index: number) => Promise<void>
  setKcalTreino: (kcal: number) => Promise<void>
  getRecentFoods: () => Promise<FoodItem[]>
  getWeekKcal: (dates: string[]) => Promise<Record<string, number>>
}

export function useDiary(date: string = todayISO()): UseDiaryReturn {
  const { user } = useAuthStore()
  const [diary, setDiary] = useState<DiaryData>(EMPTY_DIARY)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setDiary(EMPTY_DIARY)
      setLoading(false)
      return
    }

    setLoading(true)
    supabase
      .from('diary_entries')
      .select('data')
      .eq('user_id', user.id)
      .eq('date', date)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) console.error('useDiary fetch:', error)
        const raw = data?.data as DiaryData | undefined
        setDiary(raw ? { ...EMPTY_DIARY, ...raw, totals: raw.totals ?? recalcTotals(raw.meals ?? EMPTY_MEALS) } : EMPTY_DIARY)
        setLoading(false)
      })
  }, [user?.id, date])

  const persist = useCallback(async (next: DiaryData, previous: DiaryData) => {
    if (!user) return
    setDiary(next) // optimistic — atualiza UI imediatamente
    const { error } = await supabase
      .from('diary_entries')
      .upsert({ user_id: user.id, date, data: next }, { onConflict: 'user_id,date' })
    if (error) {
      setDiary(previous) // reverte se falhar
      throw error
    }
  }, [user?.id, date])

  const addFood = useCallback(async (meal: MealKey, entry: FoodEntry) => {
    const nextMeals: DiaryMeals = {
      ...diary.meals,
      [meal]: [...diary.meals[meal], entry],
    }
    await persist({ ...diary, meals: nextMeals, totals: recalcTotals(nextMeals) }, diary)
  }, [diary, persist])

  // Atualiza estado imediatamente e persiste em background sem bloquear UI
  const addFoodOptimistic = useCallback((meal: MealKey, entry: FoodEntry) => {
    const nextMeals: DiaryMeals = {
      ...diary.meals,
      [meal]: [...diary.meals[meal], entry],
    }
    const next: DiaryData = { ...diary, meals: nextMeals, totals: recalcTotals(nextMeals) }
    setDiary(next)
    if (user) {
      supabase
        .from('diary_entries')
        .upsert({ user_id: user.id, date, data: next }, { onConflict: 'user_id,date' })
        .then(({ error }) => { if (error) console.error('addFoodOptimistic persist:', error) })
    }
  }, [diary, user?.id, date])

  const removeFood = useCallback(async (meal: MealKey, index: number) => {
    const nextMeals: DiaryMeals = {
      ...diary.meals,
      [meal]: diary.meals[meal].filter((_, i) => i !== index),
    }
    await persist({ ...diary, meals: nextMeals, totals: recalcTotals(nextMeals) }, diary)
  }, [diary, persist])

  const setKcalTreino = useCallback(async (kcal: number) => {
    await persist({ ...diary, kcalTreino: kcal }, diary)
  }, [diary, persist])

  // Varre todo o histórico de diary_entries, ordena por at desc, retorna 10 únicos
  const getRecentFoods = useCallback(async (): Promise<FoodItem[]> => {
    if (!user) return []
    const { data, error } = await supabase
      .from('diary_entries')
      .select('data')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(30)
    if (error || !data) return []

    const lookup = buildFoodLookup()
    const allEntries: FoodEntry[] = []
    for (const row of data) {
      const d = row.data as DiaryData
      if (!d?.meals) continue
      for (const entries of Object.values(d.meals)) {
        for (const e of entries) allEntries.push(e)
      }
    }
    allEntries.sort((a, b) => (b.at ?? '').localeCompare(a.at ?? ''))

    const seen = new Set<string>()
    const result: FoodItem[] = []
    for (const e of allEntries) {
      if (!seen.has(e.foodId) && lookup[e.foodId]) {
        seen.add(e.foodId)
        result.push(lookup[e.foodId])
        if (result.length === 10) break
      }
    }
    return result
  }, [user?.id])

  // Busca kcal consumidas para um conjunto de datas em uma query só
  const getWeekKcal = useCallback(async (dates: string[]): Promise<Record<string, number>> => {
    if (!user || dates.length === 0) return {}
    const { data, error } = await supabase
      .from('diary_entries')
      .select('date, data')
      .eq('user_id', user.id)
      .in('date', dates)
    if (error || !data) return {}
    const result: Record<string, number> = {}
    for (const row of data) {
      const d = row.data as DiaryData
      result[row.date] = d?.totals?.kcal ?? 0
    }
    return result
  }, [user?.id])

  return { diary, loading, addFood, addFoodOptimistic, removeFood, setKcalTreino, getRecentFoods, getWeekKcal }
}
