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

// Normaliza nome de alimento para dedup: caixa, acentos, pontuação e
// conectores ("com"/"e"/"+") — "Esfirra de Carne e Queijo" e
// "esfirra de carne com queijo" viram a mesma chave.
export function normalizeFoodName(nome: string): string {
  return nome
    .toLowerCase()
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')  // remove acentos
    .replace(/\s+(com|e)\s+|\s*\+\s*/g, ' ')            // conectores → espaço
    .replace(/[^a-z0-9 ]/g, ' ')                        // pontuação → espaço
    .replace(/\s+/g, ' ')
    .trim()
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
    const cols = 'id, nome, porcao, porcao_g, p, c, g, kcal'
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
      .select(cols)
      .single()
    if (error) {
      // 23505 = nome já existe para este usuário (constraint custom_foods_user_id_nome_unique).
      // Reusa o existente em vez de quebrar — evita perder a gravação do diário no fluxo do chat.
      if (error.code === '23505') {
        const { data: existing } = await supabase
          .from('custom_foods')
          .select(cols)
          .eq('user_id', user.id)
          .eq('nome', food.nome)
          .maybeSingle()
        if (existing) {
          const reused = rowToFoodItem(existing as CustomFoodRow)
          setCustomFoods(prev => prev.some(f => f.id === reused.id) ? prev : [reused, ...prev])
          return reused
        }
      }
      throw error
    }
    const saved = rowToFoodItem(data as CustomFoodRow)
    setCustomFoods(prev => prev.some(f => f.id === saved.id) ? prev : [saved, ...prev])
    return saved
  }, [user?.id])

  // Busca por nome normalizado (caixa/acentos/pontuação/conectores) — evita duplicatas
  // e reusa variantes ("carne e queijo" ≈ "carne com queijo").
  const findCustomFood = useCallback((nome: string): FoodItem | undefined => {
    const n = normalizeFoodName(nome)
    return customFoods.find(f => normalizeFoodName(f.nome) === n)
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
