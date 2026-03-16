import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import type { FoodItem } from '../data/foodDb'

interface CustomFoodRow {
  id: string
  nome: string
  porcao: string
  porcao_g: number
  p: number
  c: number
  g: number
  kcal: number
}

function rowToFoodItem(row: CustomFoodRow): FoodItem {
  return {
    id:      'custom_' + row.id,
    nome:    row.nome,
    porcao:  row.porcao,
    porcaoG: row.porcao_g,
    p:       row.p,
    c:       row.c,
    g:       row.g,
    kcal:    row.kcal,
  }
}

interface UseCustomFoodsReturn {
  customFoods: FoodItem[]
  loading: boolean
  saveCustomFood: (food: Omit<FoodItem, 'id'>) => Promise<void>
}

export function useCustomFoods(): UseCustomFoodsReturn {
  const { user } = useAuthStore()
  const [customFoods, setCustomFoods] = useState<FoodItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setCustomFoods([])
      setLoading(false)
      return
    }

    setLoading(true)
    supabase
      .from('custom_foods')
      .select('id, nome, porcao, porcao_g, p, c, g, kcal')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error('useCustomFoods fetch:', error)
        setCustomFoods((data ?? []).map(row => rowToFoodItem(row as CustomFoodRow)))
        setLoading(false)
      })
  }, [user?.id])

  const saveCustomFood = useCallback(async (food: Omit<FoodItem, 'id'>) => {
    if (!user) return
    const { data, error } = await supabase
      .from('custom_foods')
      .insert({
        user_id:  user.id,
        nome:     food.nome,
        porcao:   food.porcao,
        porcao_g: food.porcaoG,
        p:        food.p,
        c:        food.c,
        g:        food.g,
        kcal:     food.kcal,
      })
      .select('id, nome, porcao, porcao_g, p, c, g, kcal')
      .single()
    if (error) throw error
    setCustomFoods(prev => [rowToFoodItem(data as CustomFoodRow), ...prev])
  }, [user?.id])

  return { customFoods, loading, saveCustomFood }
}
