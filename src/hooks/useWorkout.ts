import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { DEFAULT_TEMPLATES } from '../data/exerciseDb'
import type {
  WorkoutState,
  WorkoutDayData,
  WorkoutTemplate,
  WorkoutExercise,
  CardioEntry,
} from '../types/workout'

// ── helpers ───────────────────────────────────────────────────

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

// Kcal estimada por série — fiel ao original (L6127)
// Ex: 12 reps × 80kg → ~8.4 kcal; 0 reps → 0
export function kcalPerSet(reps: string, carga: string): number {
  const r = Number(reps) || 0
  if (r === 0) return 0
  return Math.max(5, Math.min(14, r * 0.5 + (Number(carga) || 0) * 0.03))
}

function calcWorkoutKcal(state: WorkoutState): number {
  const fromSets = state.exercicios.reduce((acc, ex) =>
    acc + ex.series.reduce((a, s) => a + kcalPerSet(s.reps, s.carga), 0), 0)
  const fromCardio = state.cardio.reduce((acc, c) => acc + c.minutos * c.kcalPerMin, 0)
  return Math.round(fromSets + fromCardio)
}

const EMPTY_STATE: WorkoutState = {
  templateId: null,
  exercicios: [],
  cardio:     [],
  nota:       '',
}

// ── interface pública ─────────────────────────────────────────

interface UseWorkoutReturn {
  state:      WorkoutState
  templates:  WorkoutTemplate[]
  loading:    boolean
  saved:      boolean  // treino do dia já foi salvo no Supabase

  // edição do estado local (sem persistir — persistido só no saveWorkout)
  setTemplateId:   (id: string | null) => void
  setNota:         (nota: string) => void
  addExercise:     (exercicioId: string) => void
  removeExercise:  (index: number) => void
  swapExercise:    (index: number, newExercicioId: string) => void
  updateSeries:    (exIndex: number, sets: WorkoutExercise['series']) => void
  applyTemplate:   (tmpl: WorkoutTemplate) => void
  addCardio:       (entry: CardioEntry) => void
  removeCardio:    (index: number) => void
  updateCardio:    (index: number, entry: CardioEntry) => void

  // persistência
  saveWorkout:     () => Promise<void>
  saveTemplates:   (templates: WorkoutTemplate[]) => Promise<void>

  // leitura de histórico (para sessão 3B/3E)
  getLastWorkoutForExercise: (exercicioId: string) => Promise<WorkoutExercise | null>
}

// ── hook ──────────────────────────────────────────────────────

export function useWorkout(date: string = todayISO()): UseWorkoutReturn {
  const { user } = useAuthStore()
  const [state, setState]         = useState<WorkoutState>(EMPTY_STATE)
  const [templates, setTemplates] = useState<WorkoutTemplate[]>(DEFAULT_TEMPLATES)
  const [loading, setLoading]     = useState(true)
  const [saved, setSaved]         = useState(false)

  // ── carregar treino do dia + templates ──
  useEffect(() => {
    if (!user) {
      setState(EMPTY_STATE)
      setLoading(false)
      return
    }

    setLoading(true)
    setSaved(false)

    Promise.all([
      supabase
        .from('workouts')
        .select('data')
        .eq('user_id', user.id)
        .eq('date', date)
        .maybeSingle(),
      supabase
        .from('workout_templates')
        .select('templates')
        .eq('user_id', user.id)
        .maybeSingle(),
    ]).then(([workoutRes, tmplRes]) => {
      if (workoutRes.error) console.error('useWorkout fetch workout:', workoutRes.error)
      if (tmplRes.error)    console.error('useWorkout fetch templates:', tmplRes.error)

      if (workoutRes.data?.data) {
        const d = workoutRes.data.data as WorkoutDayData
        setState({
          templateId: d.templateId,
          exercicios: d.exercicios ?? [],
          cardio:     d.cardio ?? [],
          nota:       d.nota ?? '',
        })
        setSaved(true)
      } else {
        setState(EMPTY_STATE)
      }

      if (tmplRes.data?.templates && Array.isArray(tmplRes.data.templates)) {
        setTemplates(tmplRes.data.templates as WorkoutTemplate[])
      }
      // se não há registro de templates, mantém DEFAULT_TEMPLATES no estado local

      setLoading(false)
    })
  }, [user?.id, date])

  // ── mutadores de estado local ──

  const setTemplateId = useCallback((id: string | null) => {
    setState(s => ({ ...s, templateId: id }))
  }, [])

  const setNota = useCallback((nota: string) => {
    setState(s => ({ ...s, nota }))
  }, [])

  const addExercise = useCallback((exercicioId: string) => {
    setState(s => ({
      ...s,
      exercicios: [...s.exercicios, { exercicioId, series: [{ reps: '', carga: '' }, { reps: '', carga: '' }, { reps: '', carga: '' }] }],
    }))
  }, [])

  const removeExercise = useCallback((index: number) => {
    setState(s => ({
      ...s,
      exercicios: s.exercicios.filter((_, i) => i !== index),
    }))
  }, [])

  // Troca exercicioId in-place mantendo séries (original L6571–6576)
  const swapExercise = useCallback((index: number, newExercicioId: string) => {
    setState(s => ({
      ...s,
      exercicios: s.exercicios.map((ex, i) =>
        i === index ? { ...ex, exercicioId: newExercicioId } : ex
      ),
    }))
  }, [])

  // Aplica template ao dia: carrega exercícios + cardio padrão (original applyTemplate)
  const applyTemplate = useCallback((tmpl: WorkoutTemplate) => {
    setState(s => ({
      ...s,
      templateId: tmpl.id,
      exercicios: tmpl.exercicios.map(id => ({
        exercicioId: id,
        series: [{ reps: '', carga: '' }, { reps: '', carga: '' }, { reps: '', carga: '' }],
      })),
      cardio: tmpl.cardio
        ? [{ tipo: tmpl.cardio.tipo, minutos: tmpl.cardio.min, kcalPerMin: 5 }]
        : s.cardio,
    }))
  }, [])

  const updateSeries = useCallback((exIndex: number, sets: WorkoutExercise['series']) => {
    setState(s => {
      const exercicios = s.exercicios.map((ex, i) =>
        i === exIndex ? { ...ex, series: sets } : ex
      )
      return { ...s, exercicios }
    })
  }, [])

  const addCardio = useCallback((entry: CardioEntry) => {
    setState(s => ({ ...s, cardio: [...s.cardio, entry] }))
  }, [])

  const removeCardio = useCallback((index: number) => {
    setState(s => ({ ...s, cardio: s.cardio.filter((_, i) => i !== index) }))
  }, [])

  const updateCardio = useCallback((index: number, entry: CardioEntry) => {
    setState(s => ({
      ...s,
      cardio: s.cardio.map((c, i) => (i === index ? entry : c)),
    }))
  }, [])

  // ── persistência ──

  const saveWorkout = useCallback(async () => {
    if (!user) return
    const kcal = calcWorkoutKcal(state)
    const payload: WorkoutDayData = {
      ...state,
      kcal,
      savedAt: new Date().toISOString(),
    }
    const { error } = await supabase
      .from('workouts')
      .upsert({ user_id: user.id, date, data: payload }, { onConflict: 'user_id,date' })
    if (error) throw error
    setSaved(true)

    // Atualiza kcalTreino no diary_entries do mesmo dia (para EnergyCard na Home)
    supabase
      .from('diary_entries')
      .select('data')
      .eq('user_id', user.id)
      .eq('date', date)
      .maybeSingle()
      .then(({ data }) => {
        const diaryData = data?.data ?? {}
        supabase
          .from('diary_entries')
          .upsert(
            { user_id: user.id, date, data: { ...diaryData, kcalTreino: kcal } },
            { onConflict: 'user_id,date' }
          )
          .then(({ error: e }) => { if (e) console.error('sync kcalTreino:', e) })
      })
  }, [user?.id, date, state])

  const saveTemplates = useCallback(async (newTemplates: WorkoutTemplate[]) => {
    if (!user) return
    const { error } = await supabase
      .from('workout_templates')
      .upsert({ user_id: user.id, templates: newTemplates }, { onConflict: 'user_id' })
    if (error) throw error
    setTemplates(newTemplates)
  }, [user?.id])

  // ── histórico: último treino com este exercício (para prev-ref na sessão 3B) ──
  const getLastWorkoutForExercise = useCallback(async (
    exercicioId: string
  ): Promise<WorkoutExercise | null> => {
    if (!user) return null
    const { data, error } = await supabase
      .from('workouts')
      .select('data')
      .eq('user_id', user.id)
      .lt('date', date)
      .order('date', { ascending: false })
      .limit(30)
    if (error || !data) return null
    for (const row of data) {
      const d = row.data as WorkoutDayData
      const found = (d.exercicios ?? []).find(e => e.exercicioId === exercicioId)
      if (found) return found
    }
    return null
  }, [user?.id, date])

  return {
    state,
    templates,
    loading,
    saved,
    setTemplateId,
    setNota,
    addExercise,
    removeExercise,
    swapExercise,
    updateSeries,
    applyTemplate,
    addCardio,
    removeCardio,
    updateCardio,
    saveWorkout,
    saveTemplates,
    getLastWorkoutForExercise,
  }
}
