import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'

export interface FoodEntry {
  foodId: string
  nome: string
  qty: number
  porcaoG: number
  p: number
  c: number
  g: number
  kcal: number
}

export interface DiaryMeals {
  cafe: FoodEntry[]
  almoco: FoodEntry[]
  jantar: FoodEntry[]
  snack: FoodEntry[]
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

const EMPTY_DIARY: DiaryData = {
  meals: { cafe: [], almoco: [], jantar: [], snack: [] },
  totals: { p: 0, c: 0, g: 0, kcal: 0 },
  kcalTreino: 0,
}

function recalcTotals(meals: DiaryMeals): DiaryTotals {
  const all = [...meals.cafe, ...meals.almoco, ...meals.jantar, ...meals.snack]
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

interface UseDiaryReturn {
  diary: DiaryData
  loading: boolean
  addFood: (meal: MealKey, entry: FoodEntry) => Promise<void>
  removeFood: (meal: MealKey, index: number) => Promise<void>
  setKcalTreino: (kcal: number) => Promise<void>
}

export function useDiary(): UseDiaryReturn {
  const { user } = useAuthStore()
  const [diary, setDiary] = useState<DiaryData>(EMPTY_DIARY)
  const [loading, setLoading] = useState(true)
  const date = todayISO()

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
        setDiary(data?.data ?? EMPTY_DIARY)
        setLoading(false)
      })
  }, [user?.id, date])

  const persist = useCallback(async (next: DiaryData) => {
    if (!user) return
    const { error } = await supabase
      .from('diary_entries')
      .upsert({ user_id: user.id, date, data: next }, { onConflict: 'user_id,date' })
    if (error) throw error
    setDiary(next)
  }, [user?.id, date])

  const addFood = useCallback(async (meal: MealKey, entry: FoodEntry) => {
    const nextMeals: DiaryMeals = {
      ...diary.meals,
      [meal]: [...diary.meals[meal], entry],
    }
    await persist({ ...diary, meals: nextMeals, totals: recalcTotals(nextMeals) })
  }, [diary, persist])

  const removeFood = useCallback(async (meal: MealKey, index: number) => {
    const nextMeals: DiaryMeals = {
      ...diary.meals,
      [meal]: diary.meals[meal].filter((_, i) => i !== index),
    }
    await persist({ ...diary, meals: nextMeals, totals: recalcTotals(nextMeals) })
  }, [diary, persist])

  const setKcalTreino = useCallback(async (kcal: number) => {
    await persist({ ...diary, kcalTreino: kcal })
  }, [diary, persist])

  return { diary, loading, addFood, removeFood, setKcalTreino }
}
