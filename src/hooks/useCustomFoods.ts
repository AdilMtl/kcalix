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
  saveCustomFood: (food: Omit<FoodItem, 'id'>) => Promise<FoodItem>
  findCustomFood: (nome: string) => FoodItem | undefined
  updateCustomFood: (id: string, food: Omit<FoodItem, 'id'>) => Promise<void>
  deleteCustomFood: (id: string) => Promise<void>
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

  const saveCustomFood = useCallback(async (food: Omit<FoodItem, 'id'>): Promise<FoodItem> => {
    if (!user) throw new Error('Não autenticado')
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
    const saved = rowToFoodItem(data as CustomFoodRow)
    setCustomFoods(prev => [saved, ...prev])
    return saved
  }, [user?.id])

  // Busca por nome (case-insensitive) — usado para evitar duplicatas
  const findCustomFood = useCallback((nome: string): FoodItem | undefined => {
    const n = nome.toLowerCase().trim()
    return customFoods.find(f => f.nome.toLowerCase().trim() === n)
  }, [customFoods])

  const updateCustomFood = useCallback(async (id: string, food: Omit<FoodItem, 'id'>) => {
    if (!user) return
    const rawId = id.startsWith('custom_') ? id.slice(7) : id
    const { error } = await supabase
      .from('custom_foods')
      .update({
        nome:     food.nome,
        porcao:   food.porcao,
        porcao_g: food.porcaoG,
        p:        food.p,
        c:        food.c,
        g:        food.g,
        kcal:     food.kcal,
      })
      .eq('id', rawId)
      .eq('user_id', user.id)
    if (error) throw error
    setCustomFoods(prev => prev.map(f =>
      f.id === id ? { ...food, id } : f
    ))
  }, [user?.id])

  const deleteCustomFood = useCallback(async (id: string) => {
    if (!user) return
    const rawId = id.startsWith('custom_') ? id.slice(7) : id
    const { error } = await supabase
      .from('custom_foods')
      .delete()
      .eq('id', rawId)
      .eq('user_id', user.id)
    if (error) throw error
    setCustomFoods(prev => prev.filter(f => f.id !== id))
  }, [user?.id])

  return { customFoods, loading, saveCustomFood, findCustomFood, updateCustomFood, deleteCustomFood }
}
