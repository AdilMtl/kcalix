// useBody — medições corporais por data
// Padrão idêntico ao useDiary: estado local + persist Supabase em background
// Original: saveMeasureForDate / clearMeasureDay / lastNDates (L5235–5337)

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import type { BodyMeasurement, BodyRow } from '../types/body'

// Função standalone — sem instanciar o hook (mesmo padrão de fetchAllWorkoutRows)
export async function fetchAllBodyRows(userId: string): Promise<BodyRow[]> {
  const { data, error } = await supabase
    .from('body_measurements')
    .select('date, data')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(200)
  if (error) {
    console.error('fetchAllBodyRows:', error)
    return []
  }
  return (data ?? []).map(row => ({
    date: row.date as string,
    ...(row.data as BodyMeasurement),
  }))
}

interface UseBodyReturn {
  measurement: BodyMeasurement | null
  loading: boolean
  saveMeasurement: (data: BodyMeasurement) => void
  clearMeasurement: () => void
  getAllBodyRows: () => Promise<BodyRow[]>
}

export function useBody(date: string): UseBodyReturn {
  const { user } = useAuthStore()
  const [measurement, setMeasurement] = useState<BodyMeasurement | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setMeasurement(null)
      setLoading(false)
      return
    }
    setLoading(true)
    supabase
      .from('body_measurements')
      .select('data')
      .eq('user_id', user.id)
      .eq('date', date)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) console.error('useBody fetch:', error)
        setMeasurement((data?.data as BodyMeasurement) ?? null)
        setLoading(false)
      })
  }, [user?.id, date])

  // Optimistic: atualiza estado local imediatamente, persiste em background
  const saveMeasurement = useCallback((data: BodyMeasurement) => {
    if (!user) return
    setMeasurement(data)
    supabase
      .from('body_measurements')
      .upsert({ user_id: user.id, date, data }, { onConflict: 'user_id,date' })
      .then(({ error }) => {
        if (error) console.error('useBody save:', error)
      })
  }, [user?.id, date])

  const clearMeasurement = useCallback(() => {
    if (!user) return
    setMeasurement(null)
    supabase
      .from('body_measurements')
      .delete()
      .eq('user_id', user.id)
      .eq('date', date)
      .then(({ error }) => {
        if (error) console.error('useBody clear:', error)
      })
  }, [user?.id, date])

  // Últimas 200 medições para histórico/chart (equivalente a lastNDates no original)
  const getAllBodyRows = useCallback(async (): Promise<BodyRow[]> => {
    if (!user) return []
    const { data, error } = await supabase
      .from('body_measurements')
      .select('date, data')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(200)
    if (error) {
      console.error('useBody getAllBodyRows:', error)
      return []
    }
    return (data ?? []).map(row => ({
      date: row.date as string,
      ...(row.data as BodyMeasurement),
    }))
  }, [user?.id])

  return { measurement, loading, saveMeasurement, clearMeasurement, getAllBodyRows }
}
