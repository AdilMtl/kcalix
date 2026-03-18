// TemplateHistoryModal — histórico de treinos (3 abas)
// Fiel ao original: referência.index.html L2723–2762 (HTML) + L7446–7731 (JS)
// CSS: mg-card L1580–1603, th-tabs reutiliza coach-tabs L1605–1608
// z-index: overlay 320, modal 321

import { useState, useEffect } from 'react'
import { todayISO } from '../lib/dateUtils'
import {
  getAllTmplSessions,
  getAllExSessions,
  calcMuscleVolume,
  calcMuscleAvg4weeks,
  calcFrequencyAlert,
  buildInsightsByGroup,
  resolveExName,
  resolvePrimaryGroup,
} from '../hooks/useMuscleVolume'
import type { TmplSession, ExSession, Insight } from '../hooks/useMuscleVolume'
import { MUSCLE_ORDER, MUSCLE_LANDMARKS } from '../data/exerciseDb'
import type { CustomExercise, WorkoutDayData, WorkoutTemplate } from '../types/workout'

// ── helpers ──────────────────────────────────────────────────────────────


function shiftDateStr(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function fmtVol(v: number): string {
  return v > 999 ? (v / 1000).toFixed(1) + 'k' : String(v)
}

type ThTab = 'treino' | 'equip' | 'grupo'

interface Props {
  open:            boolean
  activeTmplId:    string | null
  templates:       WorkoutTemplate[]
  workoutRows:     (WorkoutDayData & { date: string })[]
  customExercises: CustomExercise[]
  onClose:         () => void
  onOpenExProg:    (exercicioId: string) => void
}

// ── sub-componente: aba Por Treino ──────────────────────────────────────

interface PanelTreinoProps {
  sessions: TmplSession[]
  customExercises: CustomExercise[]
  onOpenExProg: (id: string) => void
}

function PanelTreino({ sessions, customExercises, onOpenExProg }: PanelTreinoProps) {
  if (sessions.length === 0) {
    return (
      <p style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', padding: '16px 0' }}>
        Sem treinos registrados.
      </p>
    )
  }

  const maxVol    = Math.max(...sessions.map(s => s.volume))
  const avgVol    = Math.round(sessions.reduce((a, s) => a + s.volume, 0) / sessions.length)
  const totalKcal = sessions.reduce((a, s) => a + s.kcal, 0)

  // Tabela de progressão por exercício (máx 6 sessões mais recentes)
  const displaySessions = sessions.slice(0, 6)
  const exIdSet = new Set<string>()
  const allExIds: string[] = []
  for (const sess of sessions) {
    for (const ex of sess.exercicios) {
      if (!exIdSet.has(ex.exercicioId)) { exIdSet.add(ex.exercicioId); allExIds.push(ex.exercicioId) }
    }
  }

  // bestForEx: carga máxima de cada exercício entre as sessões exibidas
  const bestForEx: Record<string, number> = {}
  for (const exId of allExIds) {
    let best = 0
    for (const sess of displaySessions) {
      const found = sess.exercicios.find(e => e.exercicioId === exId)
      if (found) {
        const mc = Math.max(0, ...found.series.filter(s => (Number(s.reps) || 0) > 0).map(s => Number(s.carga) || 0))
        if (mc > best) best = mc
      }
    }
    bestForEx[exId] = best
  }

  return (
    <>
      {/* KPI summary */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {[
          { val: String(sessions.length), lbl: 'Sessões' },
          { val: fmtVol(maxVol),          lbl: 'Vol max' },
          { val: fmtVol(avgVol),          lbl: 'Vol médio' },
          { val: String(totalKcal),       lbl: '🔥 Total kcal' },
        ].map(({ val, lbl }) => (
          <div key={lbl} style={{
            flex: 1, background: 'var(--surface2)', borderRadius: 'var(--radius-xs)',
            padding: '8px 4px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>{val}</div>
            <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{lbl}</div>
          </div>
        ))}
      </div>

      {/* Tabela de sessões */}
      <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 6 }}>Sessões:</div>
      <div style={{ overflowX: 'auto', marginBottom: 16 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ color: 'var(--text3)', fontSize: 11 }}>
              <th style={{ textAlign: 'left',   padding: '4px 6px', borderBottom: '1px solid var(--line)' }}>Data</th>
              <th style={{ textAlign: 'center', padding: '4px 6px', borderBottom: '1px solid var(--line)' }}>Séries</th>
              <th style={{ textAlign: 'center', padding: '4px 6px', borderBottom: '1px solid var(--line)' }}>Volume</th>
              <th style={{ textAlign: 'center', padding: '4px 6px', borderBottom: '1px solid var(--line)' }}>kcal</th>
              <th style={{ textAlign: 'center', padding: '4px 6px', borderBottom: '1px solid var(--line)' }}>Δ vol</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s, i) => {
              const prev = sessions[i + 1]
              let delta = <span style={{ color: 'var(--text3)' }}>—</span>
              if (prev && prev.volume > 0) {
                const diff = s.volume - prev.volume
                const pct  = Math.round((diff / prev.volume) * 100)
                if (diff > 0)      delta = <span style={{ color: 'var(--good)' }}>▲+{pct}%</span>
                else if (diff < 0) delta = <span style={{ color: 'var(--bad)' }}>▼{pct}%</span>
                else               delta = <span style={{ color: 'var(--text3)' }}>=</span>
              }
              return (
                <tr key={s.date} style={{ borderBottom: '1px solid rgba(255,255,255,.04)' }}>
                  <td style={{ padding: '6px', fontFamily: 'monospace', fontSize: 11 }}>{s.date.slice(5)}</td>
                  <td style={{ padding: '6px', textAlign: 'center' }}>{s.series}</td>
                  <td style={{ padding: '6px', textAlign: 'center' }}>{fmtVol(s.volume)}</td>
                  <td style={{ padding: '6px', textAlign: 'center' }}>{s.kcal}</td>
                  <td style={{ padding: '6px', textAlign: 'center' }}>{delta}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Tabela progressão por exercício (≥ 2 sessões) */}
      {sessions.length >= 2 && allExIds.length > 0 && (
        <>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 6 }}>
            Progressão por exercício (carga max):
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ color: 'var(--text3)', fontSize: 11 }}>
                  <th style={{ textAlign: 'left', padding: '4px 6px', borderBottom: '1px solid var(--line)' }}>Exercício</th>
                  {displaySessions.map(sess => (
                    <th key={sess.date} style={{ textAlign: 'center', padding: '4px 6px', borderBottom: '1px solid var(--line)', whiteSpace: 'nowrap' }}>
                      {sess.date.slice(5)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allExIds.map(exId => {
                  const nome = resolveExName(exId, customExercises).split('(')[0].trim()
                  const best = bestForEx[exId] ?? 0
                  return (
                    <tr
                      key={exId}
                      onClick={() => onOpenExProg(exId)}
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,.04)',
                        cursor: 'pointer',
                        WebkitTapHighlightColor: 'transparent',
                      }}
                    >
                      <td style={{ padding: '6px', color: 'var(--text)', fontWeight: 600, fontSize: 11 }}>{nome}</td>
                      {displaySessions.map(sess => {
                        const found  = sess.exercicios.find(e => e.exercicioId === exId)
                        let mc = 0
                        if (found) {
                          const filled = found.series.filter(s => (Number(s.reps) || 0) > 0)
                          mc = Math.max(0, ...filled.map(s => Number(s.carga) || 0))
                        }
                        const isBest = mc > 0 && mc === best
                        return (
                          <td key={sess.date} style={{
                            padding: '6px', textAlign: 'center',
                            color: isBest ? 'var(--good)' : mc > 0 ? 'var(--text2)' : 'var(--text3)',
                            fontWeight: isBest ? 700 : 400,
                          }}>
                            {mc > 0 ? `${mc}kg` : '—'}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  )
}

// ── sub-componente: aba Por Equipamento ────────────────────────────────

interface PanelEquipProps {
  workoutRows:     (WorkoutDayData & { date: string })[]
  customExercises: CustomExercise[]
}

function PanelEquip({ workoutRows, customExercises }: PanelEquipProps) {
  const [selectedExId, setSelectedExId] = useState('')

  // Exercícios com histórico, agrupados por grupo
  const exWithHistory: { id: string; nome: string; grupo: string }[] = []
  const seen = new Map<string, { nome: string; grupo: string }>()
  for (const row of workoutRows) {
    for (const ex of row.exercicios) {
      if (seen.has(ex.exercicioId)) continue
      const hasData = ex.series.some(s => (Number(s.reps) || 0) > 0)
      if (!hasData) continue
      const nome  = resolveExName(ex.exercicioId, customExercises)
      const grupo = (() => {
        const pg = resolvePrimaryGroup(ex.exercicioId, customExercises)
        return pg ?? 'Outros'
      })()
      seen.set(ex.exercicioId, { nome, grupo })
    }
  }
  for (const [id, v] of seen.entries()) exWithHistory.push({ id, nome: v.nome, grupo: v.grupo })
  exWithHistory.sort((a, b) => (a.grupo + a.nome).localeCompare(b.grupo + b.nome))

  // Sessões do exercício selecionado
  const sessions: ExSession[] = selectedExId
    ? getAllExSessions(workoutRows, selectedExId, 8)
    : []

  const prCarga = sessions.length > 0 ? Math.max(...sessions.map(s => s.maxCarga)) : 0

  // Agrupar opções por grupo para o select
  const groups: Record<string, typeof exWithHistory> = {}
  for (const ex of exWithHistory) {
    if (!groups[ex.grupo]) groups[ex.grupo] = []
    groups[ex.grupo].push(ex)
  }

  return (
    <>
      <select
        value={selectedExId}
        onChange={e => setSelectedExId(e.target.value)}
        style={{
          width: '100%', padding: '10px 12px', marginBottom: 12,
          background: 'var(--surface2)', border: '1px solid var(--line)',
          borderRadius: 'var(--radius-xs)', color: 'var(--text)',
          fontSize: 13, fontFamily: 'var(--font)',
        }}
      >
        <option value="">— Selecione o exercício —</option>
        {Object.entries(groups).map(([grpLabel, exs]) => (
          <optgroup key={grpLabel} label={grpLabel}>
            {exs.map(ex => (
              <option key={ex.id} value={ex.id}>{ex.nome.split('(')[0].trim()}</option>
            ))}
          </optgroup>
        ))}
      </select>

      {!selectedExId && (
        <p style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', padding: '16px 0' }}>
          Selecione um exercício para ver o histórico.
        </p>
      )}

      {selectedExId && sessions.length === 0 && (
        <p style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', padding: '16px 0' }}>
          Sem sessões registradas para este exercício.
        </p>
      )}

      {sessions.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ color: 'var(--text3)', fontSize: 11 }}>
                <th style={{ textAlign: 'left',   padding: '4px 6px', borderBottom: '1px solid var(--line)' }}>Data</th>
                <th style={{ textAlign: 'center', padding: '4px 6px', borderBottom: '1px solid var(--line)' }}>Sets</th>
                <th style={{ textAlign: 'center', padding: '4px 6px', borderBottom: '1px solid var(--line)' }}>Melhor carga</th>
                <th style={{ textAlign: 'center', padding: '4px 6px', borderBottom: '1px solid var(--line)' }}>Volume</th>
                <th style={{ textAlign: 'center', padding: '4px 6px', borderBottom: '1px solid var(--line)' }}>Δ</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s, i) => {
                const prev    = sessions[i + 1]
                const isPR    = s.maxCarga === prCarga && prCarga > 0
                let delta = <span style={{ color: 'var(--text3)' }}>—</span>
                if (prev) {
                  const diff = s.maxCarga - prev.maxCarga
                  if (diff > 0)      delta = <span style={{ color: 'var(--good)' }}>▲+{diff}</span>
                  else if (diff < 0) delta = <span style={{ color: 'var(--bad)' }}>▼{diff}</span>
                  else               delta = <span style={{ color: 'var(--text3)' }}>=</span>
                }
                return (
                  <tr key={s.date} style={{
                    borderBottom: '1px solid rgba(255,255,255,.04)',
                    background: isPR ? 'rgba(74,222,128,.06)' : 'transparent',
                  }}>
                    <td style={{ padding: '6px', fontFamily: 'monospace', fontSize: 11, color: isPR ? 'var(--good)' : 'var(--text2)' }}>
                      {s.date.slice(5)}{isPR ? ' 🏆' : ''}
                    </td>
                    <td style={{ padding: '6px', textAlign: 'center' }}>{s.sets}</td>
                    <td style={{ padding: '6px', textAlign: 'center', fontWeight: 700 }}>{s.maxCarga}kg</td>
                    <td style={{ padding: '6px', textAlign: 'center' }}>{fmtVol(s.volume)}</td>
                    <td style={{ padding: '6px', textAlign: 'center' }}>{delta}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

// ── sub-componente: aba Por Grupo ──────────────────────────────────────

interface PanelGrupoProps {
  workoutRows:     (WorkoutDayData & { date: string })[]
  customExercises: CustomExercise[]
}

function PanelGrupo({ workoutRows, customExercises }: PanelGrupoProps) {
  const [openChips, setOpenChips] = useState<Record<string, boolean>>({})

  const today     = todayISO()
  const weekStart = shiftDateStr(today, -6)

  const current   = calcMuscleVolume(workoutRows, weekStart, today, customExercises)
  const avg4      = calcMuscleAvg4weeks(workoutRows, customExercises)
  const alerts    = calcFrequencyAlert(workoutRows, weekStart, today, customExercises)
  const byGroup   = buildInsightsByGroup(workoutRows, customExercises, current)

  const toggleChip = (key: string) => setOpenChips(prev => ({ ...prev, [key]: !prev[key] }))

  return (
    <>
      {MUSCLE_ORDER.map(grupo => {
        const v  = current[grupo]
        const a  = avg4[grupo]
        const lm = MUSCLE_LANDMARKS[grupo]
        const total        = v.total
        const totalRounded = Math.round(total * 2) / 2

        let borderColor = 'var(--text3)'
        let barColor    = 'var(--text3)'
        let opacity     = total === 0 ? 0.5 : 1
        if (total >= lm.mrv)      { borderColor = 'var(--bad)';  barColor = 'var(--bad)' }
        else if (total >= lm.mev) { borderColor = 'var(--good)'; barColor = 'var(--good)' }

        const barPct = Math.min(total / lm.mrv, 1) * 100
        const mevPct = Math.min(lm.mev / lm.mrv, 1) * 100

        const delta    = +(total - a.total).toFixed(1)
        let deltaEl = null
        if (a.total > 0) {
          if (delta > 0)      deltaEl = <span style={{ color: 'var(--good)' }}>+{delta} vs média 4sem</span>
          else if (delta < 0) deltaEl = <span style={{ color: 'var(--bad)' }}>{delta} vs média 4sem</span>
          else                deltaEl = <span style={{ color: 'var(--text3)' }}>= média 4sem</span>
        }

        const breakdown = v.direct > 0 || v.indirect > 0
          ? `${v.direct} diretos + ${v.indirect} via compostos`
          : 'Nenhuma série esta semana'

        const ins: Insight[] = byGroup[grupo] ?? []

        return (
          <div key={grupo} style={{
            background: 'var(--surface2)',
            borderRadius: 'var(--radius)',
            padding: '10px 12px',
            marginBottom: 8,
            borderLeft: `3px solid ${borderColor}`,
            opacity,
          }}>
            {/* header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{grupo}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{totalRounded} sets</span>
            </div>

            {/* barra */}
            <div style={{ position: 'relative', height: 6, background: 'var(--line)', borderRadius: 3, marginBottom: 6, overflow: 'visible' }}>
              <div style={{ height: '100%', width: `${barPct}%`, borderRadius: 3, background: barColor, transition: 'width .3s ease' }} />
              {/* marcador MEV (linha roxa) */}
              <div style={{
                position: 'absolute', top: -3, left: `${mevPct}%`,
                width: 2, height: 12, background: 'var(--accent)', borderRadius: 1,
              }} title={`MEV: ${lm.mev}`} />
            </div>

            {/* meta */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text3)' }}>
              <span>{breakdown}</span>
              <span>{deltaEl}</span>
            </div>

            {/* chips de insight */}
            {ins.length > 0 && (
              <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {ins.map((item, i) => {
                    const key  = `${grupo}_${i}`
                    const open = openChips[key] ?? false
                    const bgMap: Record<Insight['nivel'], string> = {
                      ok:      'rgba(74,222,128,.12)',
                      warning: 'rgba(248,113,113,.12)',
                      info:    'rgba(139,92,246,.12)',
                    }
                    const colorMap: Record<Insight['nivel'], string> = {
                      ok:      'var(--good)',
                      warning: 'var(--bad)',
                      info:    'var(--accent)',
                    }
                    return (
                      <span
                        key={key}
                        onClick={() => toggleChip(key)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 3,
                          padding: '3px 9px', borderRadius: 20,
                          fontSize: 11, fontWeight: 600, cursor: 'pointer',
                          userSelect: 'none', WebkitUserSelect: 'none',
                          background: bgMap[item.nivel],
                          color: colorMap[item.nivel],
                          opacity: open ? 0.7 : 1,
                        }}
                      >
                        {item.icone} {item.titulo}
                      </span>
                    )
                  })}
                </div>

                {/* detalhe expandido do chip ativo */}
                {ins.map((item, i) => {
                  const key  = `${grupo}_${i}`
                  if (!openChips[key]) return null
                  return (
                    <div key={key} style={{
                      marginTop: 6, paddingTop: 6,
                      borderTop: '1px solid rgba(255,255,255,.06)',
                      fontSize: 11, color: 'var(--text3)', lineHeight: 1.5,
                    }}>
                      {item.detalhe}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}

      {/* Alertas de fracionamento */}
      {alerts.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>Alertas de fracionamento:</div>
          {alerts.map((al, i) => (
            <span key={i} style={{
              display: 'inline-block',
              background: 'rgba(248,113,113,.12)', color: 'var(--bad)',
              borderRadius: 20, padding: '4px 10px',
              fontSize: 11, fontWeight: 600, margin: '4px 4px 0 0',
            }}>
              ⚠ {al.grupo}: {al.sets} sets em {al.date} — considere fracionar em 2x/sem
            </span>
          ))}
        </div>
      )}

      {/* nota de rodapé */}
      <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text3)' }}>
        Linha roxa na barra = MEV (mínimo efetivo). Séries via compostos valem 0.5x. Baseado em protocolos Lucas Campos / RP.
      </div>
    </>
  )
}

// ── componente principal ───────────────────────────────────────────────

export function TemplateHistoryModal({
  open, activeTmplId, templates, workoutRows, customExercises, onClose, onOpenExProg,
}: Props) {
  const [activeTab, setActiveTab] = useState<ThTab>('treino')

  // Sempre abre na aba "Por treino"
  useEffect(() => {
    if (open) setActiveTab('treino')
  }, [open])

  if (!open) return null

  const tmpl    = activeTmplId ? templates.find(t => t.id === activeTmplId) : null
  const title   = tmpl
    ? `📊 ${tmpl.nome.includes('—') ? tmpl.nome.split('—')[0].trim() : tmpl.nome}`
    : '📊 Histórico geral'

  // Sessões para a aba "Por treino"
  const sessions = getAllTmplSessions(workoutRows, activeTmplId, 12)

  const TABS: { id: ThTab; label: string }[] = [
    { id: 'treino', label: '📋 Por treino' },
    { id: 'equip',  label: '🏋️ Por exercício' },
    { id: 'grupo',  label: '💪 Por grupo' },
  ]

  return (
    <>
      {/* overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,.6)',
          zIndex: 320,
        }}
      />

      {/* modal full-sheet */}
      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: 0,
        maxHeight: '92dvh',
        background: 'linear-gradient(180deg, #1a2035, #121828)',
        borderRadius: '18px 18px 0 0',
        border: '1px solid var(--line)',
        display: 'flex', flexDirection: 'column',
        zIndex: 321,
      }}>
        {/* handle */}
        <div style={{
          width: 36, height: 4, borderRadius: 2,
          background: 'rgba(255,255,255,.15)',
          margin: '12px auto 0', flexShrink: 0,
        }} />

        {/* header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px 10px', flexShrink: 0,
        }}>
          <b style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{title}</b>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent', border: 'none',
              color: 'var(--text3)', fontSize: 18, cursor: 'pointer',
              padding: '4px 8px', lineHeight: 1,
              fontFamily: 'var(--font)',
            }}
          >✕</button>
        </div>

        {/* abas */}
        <div style={{ display: 'flex', gap: 6, padding: '0 16px 10px', flexShrink: 0, flexWrap: 'wrap' }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '6px 12px', borderRadius: 20,
                border: '1px solid var(--line)',
                fontSize: 12, fontWeight: 600,
                fontFamily: 'var(--font)',
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
                background: activeTab === tab.id ? 'var(--accent)' : 'transparent',
                color:      activeTab === tab.id ? '#fff'          : 'var(--text2)',
                borderColor:activeTab === tab.id ? 'var(--accent)' : 'var(--line)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* corpo rolável */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '0 16px 24px', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
          {activeTab === 'treino' && (
            <PanelTreino
              sessions={sessions}
              customExercises={customExercises}
              onOpenExProg={onOpenExProg}
            />
          )}
          {activeTab === 'equip' && (
            <PanelEquip
              workoutRows={workoutRows}
              customExercises={customExercises}
            />
          )}
          {activeTab === 'grupo' && (
            <PanelGrupo
              workoutRows={workoutRows}
              customExercises={customExercises}
            />
          )}
        </div>
      </div>
    </>
  )
}
