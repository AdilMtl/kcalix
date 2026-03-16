import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import type { GoalType } from '../data/goalPresets'

const VALID_GOALS: GoalType[] = ['maintain', 'cut', 'recomp', 'bulk']

function sanitizeSettings(raw: unknown): UserSettingsData | null {
  if (!raw || typeof raw !== 'object') return null
  const d = raw as Record<string, unknown>
  if (!d.sex || !d.weightKg || !d.heightCm) return null
  return {
    sex:            d.sex === 'female' ? 'female' : 'male',
    age:            Number(d.age)            || 25,
    weightKg:       Number(d.weightKg)       || 70,
    heightCm:       Number(d.heightCm)       || 170,
    goal:           VALID_GOALS.includes(d.goal as GoalType) ? d.goal as GoalType : 'maintain',
    activityFactor: Number(d.activityFactor) || 1.55,
    bmr:            Number(d.bmr)            || 0,
    tdee:           Number(d.tdee)           || 0,
    kcalTarget:     Number(d.kcalTarget)     || 0,
    pTarget:        Number(d.pTarget)        || 0,
    cTarget:        Number(d.cTarget)        || 0,
    gTarget:        Number(d.gTarget)        || 0,
    skinfolds:      d.skinfolds as UserSettingsData['skinfolds'],
    fixedKcal:      d.fixedKcal   != null ? Number(d.fixedKcal)   : undefined,
    updatedAt:      typeof d.updatedAt === 'string' ? d.updatedAt : undefined,
    pKg:            d.pKg      != null ? Number(d.pKg)      : undefined,
    cKg:            d.cKg      != null ? Number(d.cKg)      : undefined,
    minFatKg:       d.minFatKg != null ? Number(d.minFatKg) : undefined,
    def:            d.def      != null ? Number(d.def)      : undefined,
    blocks:         d.blocks         as UserSettingsData['blocks'],
    kcalPerBlock:   d.kcalPerBlock   as UserSettingsData['kcalPerBlock'],
  }
}

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
        setSettings(sanitizeSettings(data?.data))
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
