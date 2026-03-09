// TreinoPage — Fase 3 — Sessão 3C: Cardio + Timer + Nota + Salvar
// Visual fiel ao original: referência.index.html L2604–2695
// CSS fiel: L1356–1481 + L1876–1889 (timer)
// JS fiel: L6280–6879 (renderExList, cardio, saveTreino, timer, cronômetro)

import { useState, useCallback, useEffect, useRef } from 'react'
import { useWorkout } from '../hooks/useWorkout'
import { useCustomExercises } from '../hooks/useCustomExercises'
import { useDateStore } from '../store/dateStore'
import { exById, CARDIO_TYPES } from '../data/exerciseDb'
import { EX_SECONDARY } from '../data/exerciseDb'
import ExerciseSelector from '../components/ExerciseSelector'
import { CustomExerciseModal } from '../components/CustomExerciseModal'
import { TemplateEditorModal } from '../components/TemplateEditorModal'
import { TemplateHistoryModal } from '../components/TemplateHistoryModal'
import { ExerciseProgressionModal } from '../components/ExerciseProgressionModal'
import { CoachGuideModal } from '../components/CoachGuideModal'
import type { WorkoutSet, CustomExercise, WorkoutTemplate, WorkoutDayData } from '../types/workout'

// ── Helpers ───────────────────────────────────────────────────

// exById estendido: verifica built-in + custom (original L6168–6180)
function resolveExName(exercicioId: string, customExercises: CustomExercise[]): string {
  const builtin = exById(exercicioId)
  if (builtin) return builtin.nome
  return customExercises.find(e => e.id === exercicioId)?.nome ?? exercicioId
}

function resolveExGrupo(exercicioId: string, customExercises: CustomExercise[]): string {
  const builtin = exById(exercicioId)
  if (builtin) return builtin.grupo ?? ''
  return customExercises.find(e => e.id === exercicioId)?.grupo ?? ''
}

// getSecondary: built-in via EX_SECONDARY, custom via campo secundarios (original L6191–6195)
function getSecondary(exercicioId: string, customExercises: CustomExercise[]): string[] {
  const custom = customExercises.find(e => e.id === exercicioId)
  if (custom) return custom.secundarios ?? []
  return EX_SECONDARY[exercicioId] ?? []
}

export default function TreinoPage() {
  const { selectedDate } = useDateStore()
  const {
    state, templates, loading, saved,
    addExercise, removeExercise, swapExercise, updateSeries,
    applyTemplate,
    addCardio, removeCardio, updateCardio,
    setNota,
    saveWorkout, saveTemplates, getLastWorkoutForExercise, getAllWorkoutRows,
  } = useWorkout(selectedDate)
  const {
    customExercises,
    createCustomExercise,
    renameCustomExercise,
    deleteCustomExercise,
  } = useCustomExercises()

  // ── UI state ──────────────────────────────────────────────
  const [tmplOpen, setTmplOpen]           = useState(false)
  const [accCardioOpen, setAccCardioOpen] = useState(true)
  const [accTimerOpen, setAccTimerOpen]   = useState(false)
  const [openExIdx, setOpenExIdx]         = useState<number | null>(null)
  const [saving, setSaving]               = useState(false)

  // ── Analytics modals state (Sessão 3E) ────────────────────
  const [tmplHistOpen, setTmplHistOpen]   = useState(false)
  const [coachGuideOpen, setCoachGuideOpen] = useState(false)
  const [exProgExId, setExProgExId]       = useState<string | null>(null)
  const [workoutRows, setWorkoutRows]     = useState<(WorkoutDayData & { date: string })[]>([])

  // Recarrega histórico ao abrir modais de analytics
  const reloadWorkoutRows = useCallback(() => {
    getAllWorkoutRows().then(rows => setWorkoutRows(rows))
  }, [getAllWorkoutRows])

  useEffect(() => {
    if (tmplHistOpen) reloadWorkoutRows()
  }, [tmplHistOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (exProgExId !== null) reloadWorkoutRows()
  }, [exProgExId]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Timer state (original L6715–6734) ─────────────────────
  // Presets: 30s, 1min, 1:30, 2min, 3min (fiel ao original DEFAULT_TIMER_PRESETS)
  const TIMER_PRESETS = [30, 60, 90, 120, 180]
  const [timerTab, setTimerTab]           = useState<'timer' | 'stopwatch'>('timer')
  const [timerSecs, setTimerSecs]         = useState(90)       // preset selecionado
  const [timerRemain, setTimerRemain]     = useState(90)       // contagem regressiva
  const [timerRunning, setTimerRunning]   = useState(false)
  const [timerFinished, setTimerFinished] = useState(false)
  const [swElapsed, setSwElapsed]         = useState(0)
  const [swRunning, setSwRunning]         = useState(false)
  const timerIntervalRef  = useRef<ReturnType<typeof setInterval> | null>(null)
  const timerStartedAtRef = useRef<number>(0)
  const swIntervalRef     = useRef<ReturnType<typeof setInterval> | null>(null)
  const swStartedAtRef    = useRef<number>(0)

  // ExerciseSelector state
  const [exSelOpen, setExSelOpen]       = useState(false)
  const [exSelMode, setExSelMode]       = useState<'add' | 'swap'>('add')
  const [exSelSwapIdx, setExSelSwapIdx] = useState<number | null>(null)

  // CustomExerciseModal state — fica por cima do ExerciseSelector (z-index 330+)
  const [customExOpen, setCustomExOpen] = useState(false)
  // Após criar, força ExerciseSelector na aba "⭐ Meus exercícios" (original L7983–7984)
  const [exSelForceGroup, setExSelForceGroup] = useState<string | null>(null)

  // TemplateEditorModal state (original L7744–7747)
  const [tmplEditorOpen, setTmplEditorOpen]   = useState(false)
  const [tmplEditing, setTmplEditing]         = useState<WorkoutTemplate | null>(null)
  const [tmplEditorIsNew, setTmplEditorIsNew] = useState(false)

  const openTmplEditor = (tmpl: WorkoutTemplate, isNew = false) => {
    setTmplEditing(tmpl)
    setTmplEditorIsNew(isNew)
    setTmplEditorOpen(true)
  }

  // Cria novo template em branco e abre o editor (original createNewTemplate L7752–7759)
  const createNewTemplate = () => {
    const novo: WorkoutTemplate = {
      id: 'treino_' + Date.now(),
      nome: 'Novo Treino',
      cor: '#a78bfa',
      exercicios: [],
      cardio: { tipo: 'bicicleta', min: 15 },
    }
    openTmplEditor(novo, true)
  }

  const handleTmplSave = async (updated: WorkoutTemplate) => {
    const next = tmplEditorIsNew
      ? [...templates, updated]
      : templates.map(t => t.id === updated.id ? updated : t)
    await saveTemplates(next)
    setTmplEditorOpen(false)
    setTmplEditing(null)
  }

  const handleTmplDelete = async (tmplId: string) => {
    const next = templates.filter(t => t.id !== tmplId)
    await saveTemplates(next)
    setTmplEditorOpen(false)
    setTmplEditing(null)
  }

  // Prev-ref cache: exercicioId → último treino
  const [prevData, setPrevData] = useState<Record<string, WorkoutSet[] | null>>({})

  // Carregar prev-ref ao abrir accordion de exercício
  const loadPrev = useCallback(async (exercicioId: string) => {
    if (exercicioId in prevData) return
    const last = await getLastWorkoutForExercise(exercicioId)
    setPrevData(p => ({ ...p, [exercicioId]: last?.series ?? null }))
  }, [prevData, getLastWorkoutForExercise])

  const toggleEx = (idx: number) => {
    const next = openExIdx === idx ? null : idx
    setOpenExIdx(next)
    if (next !== null) {
      loadPrev(state.exercicios[next].exercicioId)
    }
  }

  // ── Timer helpers (original L6736–6879) ───────────────────

  const fmtSecs = (s: number) => {
    const m = Math.floor(Math.abs(s) / 60)
    const ss = Math.abs(s) % 60
    return `${m}:${ss.toString().padStart(2, '0')}`
  }

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
      if (swIntervalRef.current)    clearInterval(swIntervalRef.current)
    }
  }, [])

  const timerStop = useCallback(() => {
    if (timerIntervalRef.current) { clearInterval(timerIntervalRef.current); timerIntervalRef.current = null }
    setTimerRunning(false)
    setTimerFinished(false)
  }, [])

  const timerReset = useCallback(() => {
    timerStop()
    setTimerRemain(timerSecs)
  }, [timerStop, timerSecs])

  const timerStart = useCallback((secs: number) => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    setTimerSecs(secs)
    setTimerRemain(secs)
    setTimerRunning(true)
    setTimerFinished(false)
    timerStartedAtRef.current = Date.now()
    timerIntervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - timerStartedAtRef.current) / 1000)
      const remain  = secs - elapsed
      if (remain <= 0) {
        setTimerRemain(0)
        setTimerRunning(false)
        setTimerFinished(true)
        clearInterval(timerIntervalRef.current!)
        timerIntervalRef.current = null
      } else {
        setTimerRemain(remain)
      }
    }, 250)
  }, [])

  const swStop = useCallback(() => {
    if (swIntervalRef.current) { clearInterval(swIntervalRef.current); swIntervalRef.current = null }
    setSwRunning(false)
  }, [])

  const swReset = useCallback(() => {
    swStop()
    setSwElapsed(0)
  }, [swStop])

  const swToggle = useCallback(() => {
    if (swRunning) { swStop(); return }
    setSwRunning(true)
    swStartedAtRef.current = Date.now() - swElapsed * 1000
    swIntervalRef.current = setInterval(() => {
      setSwElapsed(Math.floor((Date.now() - swStartedAtRef.current) / 1000))
    }, 250)
  }, [swRunning, swElapsed, swStop])

  // ── Workout summary ───────────────────────────────────────
  const totalSeries    = state.exercicios.reduce((acc, ex) => acc + ex.series.length, 0)
  const totalVolume    = state.exercicios.reduce((acc, ex) =>
    acc + ex.series.reduce((a, s) => a + (Number(s.reps) || 0) * (Number(s.carga) || 0), 0), 0)
  const totalCardioMin = state.cardio.reduce((acc, c) => acc + c.minutos, 0)
  const totalKcal      = Math.round(
    state.exercicios.reduce((acc, ex) =>
      acc + ex.series.reduce((a, s) => {
        const r = Number(s.reps) || 0
        if (r === 0) return a
        return a + Math.max(5, Math.min(14, r * 0.5 + (Number(s.carga) || 0) * 0.03))
      }, 0), 0)
    + state.cardio.reduce((acc, c) => acc + c.minutos * c.kcalPerMin, 0)
  )

  // ── Handlers ExerciseSelector ─────────────────────────────
  const openAdd = () => {
    setExSelMode('add')
    setExSelSwapIdx(null)
    setExSelOpen(true)
  }

  const openSwap = (idx: number) => {
    setExSelMode('swap')
    setExSelSwapIdx(idx)
    setExSelOpen(true)
  }

  const handleExSelect = (exercicioId: string, _nome: string) => {
    if (exSelMode === 'add') {
      addExercise(exercicioId)
    } else if (exSelMode === 'swap' && exSelSwapIdx !== null) {
      // Troca exercicioId in-place mantendo séries (original L6571–6576)
      swapExercise(exSelSwapIdx, exercicioId)
    }
    setExSelOpen(false)
    setOpenExIdx(null)
  }

  // ── Mutação de séries inline ──────────────────────────────
  const updateSet = (exIdx: number, setIdx: number, field: 'reps' | 'carga', value: string) => {
    const sets = state.exercicios[exIdx].series.map((s, i) =>
      i === setIdx ? { ...s, [field]: value } : s
    )
    updateSeries(exIdx, sets)
  }

  const addSet = (exIdx: number) => {
    const sets = [...state.exercicios[exIdx].series, { reps: '', carga: '' }]
    updateSeries(exIdx, sets)
  }

  const removeSet = (exIdx: number, setIdx: number) => {
    const sets = state.exercicios[exIdx].series.filter((_, i) => i !== setIdx)
    updateSeries(exIdx, sets)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveWorkout()
      reloadWorkoutRows() // atualiza histórico em background após salvar
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  if (loading) {
    return (
      <div style={{ padding: 24, color: 'var(--text3)', textAlign: 'center', fontSize: 13 }}>
        Carregando...
      </div>
    )
  }

  return (
    <div style={{ paddingBottom: 32 }}>

      {/* ExerciseSelector bottom sheet */}
      <ExerciseSelector
        open={exSelOpen}
        mode={exSelMode}
        onClose={() => { setExSelOpen(false); setExSelForceGroup(null) }}
        onSelect={handleExSelect}
        customExercises={customExercises}
        onCreateCustom={() => setCustomExOpen(true)}
        onDeleteCustom={deleteCustomExercise}
        onRenameCustom={renameCustomExercise}
        forceGroup={exSelForceGroup}
      />

      {/* TemplateEditorModal — z-index 320/321 (abaixo do ExerciseSelector) */}
      <TemplateEditorModal
        open={tmplEditorOpen}
        template={tmplEditing}
        isNew={tmplEditorIsNew}
        customExercises={customExercises}
        onSave={handleTmplSave}
        onDelete={handleTmplDelete}
        onClose={() => { setTmplEditorOpen(false); setTmplEditing(null) }}
      />

      {/* CustomExerciseModal — por cima do ExerciseSelector (z-index 331) */}
      {/* Ao salvar: fecha modal + mantém ExerciseSelector aberto na aba "⭐ Meus" (original L7982–7984) */}
      <CustomExerciseModal
        open={customExOpen}
        onClose={() => setCustomExOpen(false)}
        onSave={async (nome, grupo, secundarios) => {
          await createCustomExercise(nome, grupo, secundarios)
          setCustomExOpen(false)
          setExSelForceGroup('⭐ Meus exercícios')
          setExSelOpen(true)
        }}
      />

      {/* TemplateHistoryModal — z-index 320/321 */}
      <TemplateHistoryModal
        open={tmplHistOpen}
        activeTmplId={state.templateId}
        templates={templates}
        workoutRows={workoutRows}
        customExercises={customExercises}
        onClose={() => setTmplHistOpen(false)}
        onOpenExProg={exId => { setTmplHistOpen(false); setExProgExId(exId) }}
      />

      {/* ExerciseProgressionModal — z-index 302/303 */}
      <ExerciseProgressionModal
        exercicioId={exProgExId}
        workoutRows={workoutRows}
        customExercises={customExercises}
        onClose={() => setExProgExId(null)}
      />

      {/* CoachGuideModal — z-index 319/320 */}
      <CoachGuideModal
        open={coachGuideOpen}
        onClose={() => setCoachGuideOpen(false)}
      />

      {/* ── Card principal ─────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(18,24,38,.9), rgba(14,20,34,.9))',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius)',
        margin: '12px 16px 0',
        overflow: 'hidden',
        boxShadow: 'var(--shadow)',
      }}>

        {/* ── card-header ────────────────────────────────────── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 16px 12px',
          borderBottom: '1px solid var(--line)',
        }}>
          <div style={{ flex: 1 }}>
            <b style={{ fontSize: 14, fontWeight: 700 }}>🏋️ Treino</b>
            <span style={{ display: 'block', fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
              Séries · reps · carga · progressão
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <button type="button" title="Histórico" style={iconBtnStyle} onClick={() => setTmplHistOpen(true)}>📊</button>
            <button type="button" title="Guia de Volume" style={iconBtnStyle} onClick={() => setCoachGuideOpen(true)}>📖</button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              style={{
                height: 36, padding: '0 14px',
                borderRadius: 'var(--radius-xs)', border: 'none',
                background: saved ? 'rgba(52,211,153,.15)' : 'var(--accent)',
                color: saved ? 'var(--good)' : '#fff',
                fontFamily: 'var(--font)', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                transition: 'background .2s, color .2s',
              }}
            >
              {saving ? '...' : saved ? '✓ Salvo' : 'Salvar ▶'}
            </button>
          </div>
        </div>

        {/* ── card-body ──────────────────────────────────────── */}
        <div style={{ padding: '14px 16px 16px' }}>

          {/* ── Seção Rotinas ─────────────────────────────────── */}
          <div
            onClick={() => setTmplOpen(o => !o)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '6px 4px 8px', cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)', letterSpacing: '.01em' }}>
              📋 Rotinas
            </span>
            <span style={{
              fontSize: 12, color: 'var(--text3)',
              transition: 'transform .2s', display: 'inline-block',
              transform: tmplOpen ? 'rotate(90deg)' : 'none',
            }}>▸</span>
          </div>

          {tmplOpen && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10, marginTop: 4 }}>
              {templates.map(tmpl => {
                const label = tmpl.nome.includes('—') ? tmpl.nome.split('—')[0].trim() : tmpl.nome
                const preview = tmpl.exercicios.slice(0, 3)
                  .map(id => { const ex = exById(id); return ex ? ex.nome.split(' ')[0] : '' })
                  .filter(Boolean).join(' · ')
                const more = tmpl.exercicios.length > 3 ? ` +${tmpl.exercicios.length - 3}` : ''
                const isActive = state.templateId === tmpl.id
                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => {
                      // Original L6260–6263: confirm se já há séries preenchidas
                      const hasFilledSets = state.exercicios.some(ex =>
                        ex.series.some(s => (Number(s.reps) || 0) > 0)
                      )
                      const label = tmpl.nome.includes('—') ? tmpl.nome.split('—')[0].trim() : tmpl.nome
                      if (hasFilledSets && !window.confirm(`Trocar para "${label}"?\nOs dados do treino atual serão apagados.`)) return
                      applyTemplate(tmpl)
                    }}
                    style={{
                      position: 'relative',
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      padding: '10px 38px 10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: isActive ? '1px solid rgba(124,92,255,.4)' : '1px solid var(--line)',
                      background: isActive
                        ? 'linear-gradient(135deg,rgba(124,92,255,.3),rgba(124,92,255,.1))'
                        : 'var(--surface2)',
                      color: 'var(--text)', fontFamily: 'var(--font)', fontSize: 13,
                      fontWeight: 600, cursor: 'pointer', minHeight: 44,
                      textAlign: 'left', WebkitTapHighlightColor: 'transparent',
                    }}
                  >
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: tmpl.cor, flexShrink: 0 }} />
                    <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>{label}</span>
                      {preview && (
                        <span style={{ fontSize: 9, color: 'var(--text3)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140 }}>
                          {preview}{more}
                        </span>
                      )}
                    </span>
                    {/* ✏️ abre o editor (original L6309) */}
                    <span
                      onClick={e => { e.stopPropagation(); openTmplEditor(tmpl) }}
                      style={{
                        position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
                        width: 24, height: 24, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, color: 'var(--text3)', background: 'rgba(255,255,255,.06)',
                        cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                      }}
                    >✏️</span>
                  </button>
                )
              })}
              <button
                type="button"
                onClick={createNewTemplate}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '9px 14px', borderRadius: 'var(--radius-sm)',
                  border: '1px dashed var(--line)', background: 'transparent',
                  color: 'var(--text3)', fontFamily: 'var(--font)', fontSize: 12,
                  fontWeight: 700, cursor: 'pointer', minHeight: 40,
                  WebkitTapHighlightColor: 'transparent',
                }}
              >+ Nova rotina</button>
            </div>
          )}

          {/* ── ex-list ────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>

            {state.exercicios.length === 0 && (
              <div style={{
                padding: '20px 0', textAlign: 'center',
                color: 'var(--text3)', fontSize: 12, fontWeight: 600,
              }}>
                Sem exercícios. Escolha um template acima ou adicione abaixo.
              </div>
            )}

            {state.exercicios.map((ex, exIdx) => {
              const nome     = resolveExName(ex.exercicioId, customExercises)
              const grupo    = resolveExGrupo(ex.exercicioId, customExercises)
              const secs     = getSecondary(ex.exercicioId, customExercises)
              const isOpen   = openExIdx === exIdx
              const series   = ex.series
              const maxCarga = Math.max(0, ...series.map(s => Number(s.carga) || 0))
              const filled   = series.filter(s => (Number(s.reps) || 0) > 0).length
              const badge    = maxCarga > 0 ? `${maxCarga}kg` : `${filled}/${series.length}`
              const exVol    = series.reduce((acc, s) => {
                const r = Number(s.reps) || 0
                const c = Number(s.carga) || 0
                return r > 0 ? acc + r * c : acc
              }, 0)
              const prev     = prevData[ex.exercicioId]
              const lastMax  = prev ? Math.max(0, ...prev.map(s => Number(s.carga) || 0)) : 0

              let arrow: string | null = null
              if (maxCarga > 0 && lastMax > 0) {
                const diff = Math.round((maxCarga - lastMax) * 10) / 10
                if (diff > 0)      arrow = `▲+${diff}`
                else if (diff < 0) arrow = `▼${diff}`
                else               arrow = `=`
              }

              return (
                <div
                  key={exIdx}
                  style={{
                    background: 'var(--surface)', border: '1px solid var(--line)',
                    borderRadius: 'var(--radius-sm)', overflow: 'hidden',
                  }}
                >
                  {/* ex-item-header */}
                  <div
                    onClick={() => toggleEx(exIdx)}
                    style={{
                      display: 'flex', alignItems: 'center',
                      padding: '10px 12px', cursor: 'pointer',
                      WebkitTapHighlightColor: 'transparent',
                      gap: 6,
                    }}
                  >
                    {/* 📊 btn */}
                    <button
                      type="button"
                      title="Progressão"
                      onClick={e => { e.stopPropagation(); setExProgExId(ex.exercicioId) }}
                      style={chartBtnStyle}
                    >📊</button>

                    {/* nome + grupos */}
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{nome}</span>
                      {grupo && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                          <span style={{
                            fontSize: 9, fontWeight: 700, color: 'var(--accent)',
                            background: 'rgba(124,92,255,.1)', border: '1px solid rgba(124,92,255,.2)',
                            borderRadius: 10, padding: '1px 6px', whiteSpace: 'nowrap',
                          }}>{grupo}</span>
                          {secs.map(s => (
                            <span key={s} style={{
                              fontSize: 9, fontWeight: 600, color: 'var(--text3)',
                              background: 'var(--surface2)', border: '1px solid var(--line)',
                              borderRadius: 10, padding: '1px 6px', whiteSpace: 'nowrap',
                            }}>{s}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* prev-ref inline */}
                    {prev && lastMax > 0 && (
                      <span style={{
                        fontSize: 10, color: 'var(--text3)',
                        padding: '4px 8px',
                        background: 'rgba(124,92,255,.06)',
                        borderRadius: 'var(--radius-xs)',
                        whiteSpace: 'nowrap', flexShrink: 0,
                      }}>
                        últ: {lastMax}kg{' '}
                        {arrow === '=' && <span style={{ color: 'var(--warn)', fontWeight: 800 }}>=</span>}
                        {arrow && arrow.startsWith('▲') && <span style={{ color: 'var(--good)', fontWeight: 800 }}>{arrow}</span>}
                        {arrow && arrow.startsWith('▼') && <span style={{ color: 'var(--bad)', fontWeight: 800 }}>{arrow}</span>}
                      </span>
                    )}

                    {/* volume */}
                    {exVol > 0 && (
                      <span style={{ fontSize: 10, color: 'var(--text2)', fontWeight: 700, flexShrink: 0 }}>
                        {exVol > 999 ? `${(exVol / 1000).toFixed(1)}k` : exVol}
                        <span style={{ fontSize: 9, color: 'var(--text3)', fontWeight: 600 }}> vol</span>
                      </span>
                    )}

                    {/* badge */}
                    <span style={{
                      fontSize: 10, color: 'var(--text3)', fontWeight: 600,
                      background: 'var(--surface2)', padding: '3px 8px', borderRadius: 999,
                      flexShrink: 0,
                    }}>{badge}</span>

                    {/* swap btn */}
                    <button
                      type="button"
                      title="Trocar exercício"
                      onClick={e => { e.stopPropagation(); openSwap(exIdx) }}
                      style={actionBtnStyle}
                    >🔄</button>

                    {/* delete btn */}
                    <button
                      type="button"
                      title="Remover exercício"
                      onClick={e => {
                        e.stopPropagation()
                        const hasFilled = ex.series.some(s => (Number(s.reps) || 0) > 0)
                        if (hasFilled && !window.confirm('Remover este exercício do treino?')) return
                        removeExercise(exIdx)
                        if (openExIdx === exIdx) setOpenExIdx(null)
                        else if (openExIdx !== null && openExIdx > exIdx) setOpenExIdx(openExIdx - 1)
                      }}
                      style={{ ...actionBtnStyle, color: 'var(--bad)', borderColor: 'rgba(248,113,113,.2)' }}
                    >✕</button>
                  </div>

                  {/* ex-item-body: set-table */}
                  <div style={{
                    maxHeight: isOpen ? 800 : 0,
                    overflow: 'hidden',
                    transition: 'max-height .3s ease',
                  }}>
                    <div style={{ padding: '0 10px 10px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr>
                            <th style={{ width: 28, fontSize: 9, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', padding: '3px 2px', textAlign: 'center' }}>#</th>
                            <th style={{ fontSize: 9, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', padding: '3px 2px', textAlign: 'center' }}>Reps</th>
                            <th style={{ fontSize: 9, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', padding: '3px 2px', textAlign: 'center' }}>Carga (kg)</th>
                            <th style={{ width: 34, padding: '3px 2px' }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {series.map((s, si) => (
                            <tr key={si}>
                              <td style={{ padding: '3px 2px', textAlign: 'center', fontSize: 12, fontWeight: 800, color: 'var(--text3)', width: 24 }}>
                                {si + 1}
                              </td>
                              <td style={{ padding: '3px 2px', textAlign: 'center' }}>
                                <input
                                  inputMode="numeric"
                                  placeholder="12"
                                  value={s.reps}
                                  onChange={e => updateSet(exIdx, si, 'reps', e.target.value)}
                                  onFocus={e => setTimeout(() => e.target.scrollIntoView({ block: 'center', behavior: 'smooth' }), 300)}
                                  className="set-input"
                                />
                              </td>
                              <td style={{ padding: '3px 2px', textAlign: 'center' }}>
                                <input
                                  inputMode="decimal"
                                  placeholder="0"
                                  value={s.carga}
                                  onChange={e => updateSet(exIdx, si, 'carga', e.target.value)}
                                  onFocus={e => setTimeout(() => e.target.scrollIntoView({ block: 'center', behavior: 'smooth' }), 300)}
                                  className="set-input"
                                />
                              </td>
                              <td style={{ padding: '3px 2px', textAlign: 'center' }}>
                                <button
                                  type="button"
                                  onClick={() => removeSet(exIdx, si)}
                                  style={{
                                    width: 28, height: 28, borderRadius: '50%',
                                    border: '1px solid rgba(248,113,113,.15)',
                                    background: 'transparent', color: 'var(--bad)',
                                    fontSize: 14, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  }}
                                >✕</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* + Série */}
                      <button
                        type="button"
                        onClick={() => addSet(exIdx)}
                        style={{
                          marginTop: 4, padding: '6px 12px',
                          borderRadius: 'var(--radius-xs)',
                          border: '1px dashed var(--line)', background: 'transparent',
                          color: 'var(--text3)', fontFamily: 'var(--font)',
                          fontSize: 11, fontWeight: 700,
                          cursor: 'pointer', width: '100%', textAlign: 'center',
                          WebkitTapHighlightColor: 'transparent',
                        }}
                      >+ Série</button>
                    </div>
                  </div>

                </div>
              )
            })}
          </div>

          {/* ── ＋ Exercício ───────────────────────────────────── */}
          <button
            type="button"
            onClick={openAdd}
            style={{
              width: '100%', padding: '10px 12px', margin: '10px 0',
              borderRadius: 'var(--radius-xs)', border: '1px dashed var(--line)',
              background: 'transparent', color: 'var(--text3)',
              fontFamily: 'var(--font)', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', textAlign: 'center',
              WebkitTapHighlightColor: 'transparent',
            }}
          >＋ Exercício</button>

          {/* ── Accordion Cardio (original L2632–2641, JS L6654–6680) ── */}
          <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: 8, background: 'var(--surface)' }}>
            <button
              type="button"
              onClick={() => setAccCardioOpen(o => !o)}
              style={accTriggerStyle}
            >
              ❤️ Cardio
              <span style={{ fontSize: 12, color: 'var(--text3)', transition: 'transform .2s', display: 'inline-block', transform: accCardioOpen ? 'rotate(180deg)' : 'none' }}>▾</span>
            </button>
            {accCardioOpen && (
              <div style={{ padding: '0 14px 14px' }}>
                {state.cardio.map((c, ci) => (
                  <div key={ci} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <select
                      value={c.tipo}
                      onChange={e => {
                        const ct = CARDIO_TYPES.find(t => t.id === e.target.value)
                        updateCardio(ci, { ...c, tipo: e.target.value, kcalPerMin: ct?.kcalMin ?? 6 })
                      }}
                      style={{
                        flex: 1, border: '1px solid var(--line)', background: 'rgba(0,0,0,.15)',
                        color: 'var(--text)', fontFamily: 'var(--font)', fontSize: 13,
                        fontWeight: 700, padding: '8px 6px', borderRadius: 'var(--radius-xs)',
                        outline: 'none', WebkitAppearance: 'none', appearance: 'none',
                      }}
                    >
                      {CARDIO_TYPES.map(ct => (
                        <option key={ct.id} value={ct.id}>{ct.nome}</option>
                      ))}
                    </select>
                    <input
                      inputMode="numeric"
                      placeholder="min"
                      value={c.minutos || ''}
                      onChange={e => updateCardio(ci, { ...c, minutos: Number(e.target.value) || 0 })}
                      style={{
                        width: 64, border: '1px solid var(--line)', background: 'rgba(0,0,0,.15)',
                        color: 'var(--text)', fontFamily: 'var(--font)', fontSize: 16,
                        fontWeight: 700, padding: '8px 8px', borderRadius: 'var(--radius-xs)',
                        outline: 'none', textAlign: 'center',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeCardio(ci)}
                      style={{
                        width: 40, height: 40, borderRadius: 'var(--radius-xs)',
                        border: '1px solid rgba(248,113,113,.2)', background: 'transparent',
                        color: 'var(--bad)', fontSize: 14, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, WebkitTapHighlightColor: 'transparent',
                      }}
                    >✕</button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addCardio({ tipo: CARDIO_TYPES[0].id, minutos: 0, kcalPerMin: CARDIO_TYPES[0].kcalMin })}
                  style={addSetBtnStyle}
                >+ Adicionar cardio</button>
              </div>
            )}
          </div>

          {/* ── Accordion Timer (original L2646–2675, CSS L1876–1889, JS L6715–6879) ── */}
          <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: 8, background: 'var(--surface)' }}>
            <button
              type="button"
              onClick={() => setAccTimerOpen(o => !o)}
              style={accTriggerStyle}
            >
              ⏱ Timer de Pausa
              <span style={{ fontSize: 12, color: 'var(--text3)', transition: 'transform .2s', display: 'inline-block', transform: accTimerOpen ? 'rotate(180deg)' : 'none' }}>▾</span>
            </button>
            {accTimerOpen && (
              <div style={{ padding: '0 14px 14px' }}>

                {/* Tabs Timer / Cronômetro */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                  {(['timer', 'stopwatch'] as const).map(tab => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setTimerTab(tab)}
                      style={{
                        flex: 1, padding: '8px 0', borderRadius: 8,
                        border: `1.5px solid ${timerTab === tab ? 'var(--accent)' : 'var(--line)'}`,
                        background: timerTab === tab ? 'var(--accent)' : 'transparent',
                        color: timerTab === tab ? '#fff' : 'var(--text2)',
                        fontSize: 13, fontWeight: 600, fontFamily: 'var(--font)',
                        cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                        transition: 'all .15s',
                      }}
                    >
                      {tab === 'timer' ? '⏱ Timer' : '⏱ Cronômetro'}
                    </button>
                  ))}
                </div>

                {/* Painel Timer countdown */}
                {timerTab === 'timer' && (
                  <div>
                    <div style={{
                      textAlign: 'center', fontSize: 56, fontWeight: 700,
                      letterSpacing: '.03em', lineHeight: 1,
                      fontVariantNumeric: 'tabular-nums',
                      margin: '6px 0 14px',
                      color: timerFinished ? 'var(--accent2)' : timerRunning ? 'var(--accent)' : 'var(--text)',
                      transition: 'color .2s',
                    }}>
                      {fmtSecs(timerRemain)}
                    </div>
                    {/* Presets */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                      {TIMER_PRESETS.map(secs => (
                        <button
                          key={secs}
                          type="button"
                          onClick={() => timerStart(secs)}
                          style={{
                            flex: 1, minWidth: 52, padding: '11px 4px',
                            borderRadius: 10,
                            border: `1.5px solid ${timerRunning && secs === timerSecs ? 'var(--accent)' : 'var(--line)'}`,
                            background: timerRunning && secs === timerSecs ? 'var(--accent)' : 'var(--surface2)',
                            color: timerRunning && secs === timerSecs ? '#fff' : 'var(--text)',
                            fontSize: 14, fontWeight: 700, fontFamily: 'var(--font)',
                            cursor: 'pointer', textAlign: 'center',
                            transition: 'all .15s', userSelect: 'none',
                            WebkitTapHighlightColor: 'transparent',
                          }}
                        >
                          {fmtSecs(secs)}
                        </button>
                      ))}
                    </div>
                    {/* Controles */}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        type="button"
                        onClick={timerStop}
                        style={timerCtrlBtnStyle}
                      >Stop</button>
                      <button
                        type="button"
                        onClick={timerReset}
                        style={timerCtrlBtnStyle}
                      >Reset</button>
                    </div>
                  </div>
                )}

                {/* Painel Cronômetro */}
                {timerTab === 'stopwatch' && (
                  <div>
                    <div style={{
                      textAlign: 'center', fontSize: 56, fontWeight: 700,
                      letterSpacing: '.03em', lineHeight: 1,
                      fontVariantNumeric: 'tabular-nums',
                      margin: '6px 0 14px',
                      color: swRunning ? 'var(--accent)' : 'var(--text)',
                      transition: 'color .2s',
                    }}>
                      {fmtSecs(swElapsed)}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        type="button"
                        onClick={swToggle}
                        style={{
                          ...timerCtrlBtnStyle,
                          background: 'var(--accent)', color: '#fff',
                          border: 'none',
                        }}
                      >{swRunning ? 'Pausar' : 'Iniciar'}</button>
                      <button
                        type="button"
                        onClick={swReset}
                        style={timerCtrlBtnStyle}
                      >Reset</button>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>

          {/* ── Nota do treino (original L2680–2683) ────────────── */}
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', display: 'block', marginBottom: 6 }}>
              📝 Observação do treino
            </label>
            <input
              placeholder="Como foi o treino, dores, energia..."
              value={state.nota}
              onChange={e => setNota(e.target.value)}
              style={{
                width: '100%', boxSizing: 'border-box',
                border: '1px solid var(--line)', background: 'rgba(0,0,0,.15)',
                color: 'var(--text)', fontFamily: 'var(--font)',
                fontSize: 16, fontWeight: 600, padding: '10px 12px',
                borderRadius: 'var(--radius-xs)', outline: 'none',
              }}
            />
          </div>

          {/* ── Workout Summary ─────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, marginTop: 10 }}>
            {[
              { val: totalSeries,            lbl: '🔁 Séries'     },
              { val: Math.round(totalVolume), lbl: '🏋️ Volume kg'  },
              { val: totalCardioMin,          lbl: '❤️ Cardio min' },
              { val: totalKcal,               lbl: '🔥 kcal est.'  },
            ].map(({ val, lbl }) => (
              <div key={lbl} style={{
                textAlign: 'center', padding: '8px 2px',
                background: 'var(--surface)', border: '1px solid var(--line)',
                borderRadius: 'var(--radius-xs)',
              }}>
                <div style={{ fontSize: 16, fontWeight: 800 }}>{val}</div>
                <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--text3)', marginTop: 2, lineHeight: 1.3 }}>{lbl}</div>
              </div>
            ))}
          </div>

        </div>{/* /card-body */}
      </div>{/* /card */}
    </div>
  )
}

// ── Estilos compartilhados ──────────────────────────────────

const iconBtnStyle: React.CSSProperties = {
  width: 36, height: 36, borderRadius: 'var(--radius-xs)',
  border: '1px solid var(--line)', background: 'var(--surface2)',
  color: 'var(--text)', fontSize: 16, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontFamily: 'var(--font)', WebkitTapHighlightColor: 'transparent',
}

const chartBtnStyle: React.CSSProperties = {
  width: 28, height: 28, borderRadius: '50%',
  border: '1px solid var(--line)', background: 'var(--surface2)',
  color: 'var(--text3)', fontSize: 12, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontFamily: 'var(--font)', flexShrink: 0, marginTop: 1,
  WebkitTapHighlightColor: 'transparent',
}

const actionBtnStyle: React.CSSProperties = {
  width: 28, height: 28, borderRadius: '50%',
  border: '1px solid var(--line)', background: 'transparent',
  color: 'var(--text3)', fontSize: 13, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  flexShrink: 0, WebkitTapHighlightColor: 'transparent',
}

// setInputStyle removido — usar className="set-input" (index.css) para suporte a :focus

const accTriggerStyle: React.CSSProperties = {
  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  gap: 8, padding: '12px 14px', background: 'none', border: 'none',
  color: 'var(--text)', fontFamily: 'var(--font)', fontSize: 13, fontWeight: 700,
  cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
}

const addSetBtnStyle: React.CSSProperties = {
  marginTop: 4, padding: '6px 12px', borderRadius: 'var(--radius-xs)',
  border: '1px dashed var(--line)', background: 'transparent',
  color: 'var(--text3)', fontFamily: 'var(--font)', fontSize: 11, fontWeight: 700,
  cursor: 'pointer', width: '100%', textAlign: 'center',
}

const timerCtrlBtnStyle: React.CSSProperties = {
  flex: 1, padding: '10px 0', borderRadius: 'var(--radius-xs)',
  border: '1px solid var(--line)', background: 'var(--surface2)',
  color: 'var(--text2)', fontFamily: 'var(--font)', fontSize: 13, fontWeight: 700,
  cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
}
