// ExerciseProgressionModal — histórico de progressão de um exercício
// Fiel ao original: referência.index.html L2697–2721 (HTML) + L7357–7444 (JS)
// CSS: mchart-filters, pr-badge, pr-chart-bar (referência L1696–1724)
// z-index: 303 (igual ao original)

import { useState, useEffect } from 'react'
import type { ExSession } from '../hooks/useMuscleVolume'
import { getAllExSessions, resolveExName, resolvePrimaryGroup } from '../hooks/useMuscleVolume'
import type { CustomExercise, WorkoutDayData } from '../types/workout'

interface Props {
  exercicioId:     string | null
  workoutRows:     (WorkoutDayData & { date: string })[]
  customExercises: CustomExercise[]
  onClose:         () => void
}

type ChartMode = 'carga' | 'volume'

function fmtVal(v: number): string {
  return v > 999 ? (v / 1000).toFixed(1) + 'k' : String(v)
}

function round1(n: number): number {
  return Math.round(n * 10) / 10
}

export function ExerciseProgressionModal({ exercicioId, workoutRows, customExercises, onClose }: Props) {
  const [chartMode, setChartMode] = useState<ChartMode>('carga')

  const open = exercicioId !== null

  // reset chart mode quando muda exercício
  useEffect(() => { if (open) setChartMode('carga') }, [exercicioId, open])

  if (!open || !exercicioId) return null

  const sessions: ExSession[] = getAllExSessions(workoutRows, exercicioId, 10)
  const exNome  = resolveExName(exercicioId, customExercises)
  const exGrupo = resolvePrimaryGroup(exercicioId, customExercises) ?? ''

  // PR
  const prCarga = sessions.length > 0 ? Math.max(...sessions.map(s => s.maxCarga)) : 0
  const prVol   = sessions.length > 0 ? Math.max(...sessions.map(s => s.volume))   : 0

  // gráfico: últimas 8 sessões em ordem cronológica
  const chartData = sessions.slice(0, 8).reverse()
  const valOf     = (s: ExSession) => chartMode === 'volume' ? s.volume : s.maxCarga
  const maxVal    = Math.max(...chartData.map(valOf), 1)
  const bestVal   = chartData.length > 0 ? Math.max(...chartData.map(valOf)) : 0

  return (
    <>
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 302 }}
        onClick={onClose}
      />
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        maxHeight: '88dvh',
        background: 'linear-gradient(180deg, #1a2035, #121828)',
        borderRadius: '20px 20px 0 0',
        zIndex: 303,
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Handle */}
        <div style={{ width: 36, height: 4, background: 'rgba(255,255,255,.15)', borderRadius: 2, margin: '10px auto 0' }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '12px 16px 8px', flexShrink: 0 }}>
          <div>
            <b style={{ fontSize: 16, color: 'var(--text)', display: 'block' }}>{exNome}</b>
            {exGrupo && <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 600, marginTop: 2 }}>{exGrupo}</div>}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 18, cursor: 'pointer', padding: '0 4px', fontFamily: 'var(--font)' }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 24px' }}>

          {/* PR badge */}
          <div style={{ marginBottom: 10 }}>
            {sessions.length > 0 ? (
              <>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  background: 'rgba(251,191,36,.15)', color: '#fbbf24',
                  border: '1px solid rgba(251,191,36,.3)', borderRadius: 20,
                  padding: '4px 10px', fontSize: 13, fontWeight: 700,
                }}>🏆 PR: {prCarga}kg</span>
                <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 8 }}>
                  Volume max: {fmtVal(prVol)}kg
                </span>
              </>
            ) : (
              <span style={{ fontSize: 12, color: 'var(--text3)' }}>Sem registros ainda.</span>
            )}
          </div>

          {/* Toggle carga / volume */}
          {sessions.length > 0 && (
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              {(['carga', 'volume'] as ChartMode[]).map(mode => (
                <button
                  key={mode}
                  onClick={() => setChartMode(mode)}
                  style={{
                    flex: 1, padding: '8px 4px', borderRadius: 8,
                    border: '1px solid var(--line)',
                    background: chartMode === mode ? 'var(--accent)' : 'var(--surface2)',
                    color: chartMode === mode ? '#fff' : 'var(--text2)',
                    fontSize: 12, fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'var(--font)',
                    WebkitTapHighlightColor: 'transparent',
                    transition: 'background .15s, color .15s',
                  }}
                >{mode === 'carga' ? 'Carga máx' : 'Volume'}</button>
              ))}
            </div>
          )}

          {/* Gráfico de barras */}
          {chartData.length >= 2 && (
            <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 90, marginBottom: 12 }}>
              {chartData.map((s, i) => {
                const v      = valOf(s)
                const h      = Math.max(8, (v / maxVal) * 70)
                const isBest = v === bestVal
                const color  = chartMode === 'volume' ? 'var(--accent2)' : 'var(--accent)'
                return (
                  <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ height: 70, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                      <div style={{
                        height: h, width: '100%', position: 'relative',
                        background: isBest ? color : 'var(--surface3)',
                        border: `1px solid ${color}`,
                        borderRadius: '3px 3px 0 0',
                      }}>
                        <span style={{
                          position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)',
                          fontSize: 9, color: isBest ? color : 'var(--text3)',
                          fontWeight: 700, whiteSpace: 'nowrap',
                        }}>{fmtVal(v)}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: 9, color: 'var(--text3)', marginTop: 2 }}>{s.date.slice(5)}</div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Tabela — últimas sessões */}
          <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 6 }}>Últimas sessões:</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr>
                  {['Data', 'Séries', 'Carga max', 'Volume', 'Δ'].map(h => (
                    <th key={h} style={{ textAlign: 'left', color: 'var(--text3)', fontWeight: 600, padding: '4px 6px', borderBottom: '1px solid var(--line)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sessions.length === 0 ? (
                  <tr><td colSpan={5} style={{ color: 'var(--text3)', padding: '12px 6px', textAlign: 'center' }}>Nenhum registro encontrado.</td></tr>
                ) : sessions.map((s, i) => {
                  const prev = sessions[i + 1]
                  let delta: React.ReactNode = null
                  if (prev) {
                    const diff = round1(s.maxCarga - prev.maxCarga)
                    if (diff > 0)      delta = <span style={{ color: 'var(--good)' }}>▲+{diff}</span>
                    else if (diff < 0) delta = <span style={{ color: 'var(--bad)' }}>▼{diff}</span>
                    else               delta = <span style={{ color: 'var(--text3)' }}>=</span>
                  }
                  const setsText = s.series.map(se => `${se.reps}×${se.carga}`).join(', ')
                  return (
                    <tr key={i}>
                      <td style={{ color: 'var(--text)', padding: '6px 6px', borderBottom: '1px solid rgba(255,255,255,.04)', fontFamily: 'monospace', fontSize: 11 }}>{s.date}</td>
                      <td title={setsText} style={{ color: 'var(--text2)', padding: '6px 6px', borderBottom: '1px solid rgba(255,255,255,.04)' }}>{s.sets}s</td>
                      <td style={{ color: 'var(--text)', fontWeight: 700, padding: '6px 6px', borderBottom: '1px solid rgba(255,255,255,.04)' }}>{s.maxCarga}kg</td>
                      <td style={{ color: 'var(--text2)', padding: '6px 6px', borderBottom: '1px solid rgba(255,255,255,.04)' }}>{fmtVal(s.volume)}</td>
                      <td style={{ padding: '6px 6px', borderBottom: '1px solid rgba(255,255,255,.04)' }}>{delta}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
