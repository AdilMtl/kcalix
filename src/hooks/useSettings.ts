import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import type { GoalType } from '../data/goalPresets'

export interface UserSettingsData {
  sex: 'male' | 'female'
  age: number
  weightKg: number
  heightCm: number
  goal: GoalType
  activityFactor: number
  // Calculados por calcFromProfile() e salvos para não recalcular sempre
  bmr: number
  tdee: number
  kcalTarget: number
  pTarget: number
  cTarget: number
  gTarget: number
  // Dobras cutâneas JP7 (opcionais)
  skinfolds?: {
    chest: number
    ax: number
    tri: number
    sub: number
    ab: number
    sup: number
    th: number
  }
  fixedKcal?: number
  updatedAt?: string
  // Override dos defaults do GOAL_PRESET (para re-edição fiel ao wizard)
  pKg?: number
  cKg?: number
  minFatKg?: number
  def?: number
  // Configurações de bloco
  blocks?: { pG: number; cG: number; gG: number }
  kcalPerBlock?: { p: number; c: number; g: number }
}

interface UseSettingsReturn {
  settings: UserSettingsData | null
  loading: boolean
  saveSettings: (data: UserSettingsData) => Promise<void>
}

export function useSettings(): UseSettingsReturn {
  const { user } = useAuthStore()
  const [settings, setSettings] = useState<UserSettingsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setSettings(null)
      setLoading(false)
      return
    }

    setLoading(true)
    supabase
      .from('user_settings')
      .select('data')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) console.error('useSettings fetch:', error)
        setSettings(data?.data ?? null)
        setLoading(false)
      })
  }, [user?.id])

  const saveSettings = useCallback(async (data: UserSettingsData) => {
    if (!user) return
    const dataWithTs: UserSettingsData = { ...data, updatedAt: new Date().toISOString() }
    const { error } = await supabase
      .from('user_settings')
      .upsert({ user_id: user.id, data: dataWithTs }, { onConflict: 'user_id' })
    if (error) throw error
    setSettings(dataWithTs)
  }, [user?.id])

  return { settings, loading, saveSettings }
}
