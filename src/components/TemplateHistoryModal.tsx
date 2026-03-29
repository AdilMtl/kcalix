// TemplateHistoryModal — histórico de treinos (3 abas)
// Fiel ao original: referência.index.html L2723–2762 (HTML) + L7446–7731 (JS)
// CSS: mg-card L1580–1603, th-tabs reutiliza coach-tabs L1605–1608
// z-index: overlay 320, modal 321

import { useState, useEffect } from 'react'
import { todayISO } from '../lib/dateUtils'
import {
  getAllExSessions,
  calcMuscleVolume,
  calcMuscleAvg4weeks,
  calcFrequencyAlert,
  buildInsightsByGroup,
  resolveExName,
  resolvePrimaryGroup,
} from '../hooks/useMuscleVolume'
import type { ExSession, Insight } from '../hooks/useMuscleVolume'
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

type ThTab = 'sessoes' | 'equip' | 'grupo'

interface Props {
  open:            boolean
  activeTmplId:    string | null
  templates:       WorkoutTemplate[]
  workoutRows:     (WorkoutDayData & { date: string })[]
  customExercises: CustomExercise[]
  onClose:         () => void
  onOpenExProg:    (exercicioId: string) => void
}

// ── sub-componente: aba Sessões ─────────────────────────────────────────

interface PanelSessoesProps {
  workoutRows:     (WorkoutDayData & { date: string })[]
  activeTmplId:    string | null
  customExercises: CustomExercise[]
  onOpenExProg:    (id: string) => void
}

function PanelSessoes({ workoutRows, activeTmplId, customExercises, onOpenExProg }: PanelSessoesProps) {
  const [expandedDate, setExpandedDate] = useState<string | null>(null)

  // Filtra sessões do template ativo (ou todas se Histórico Geral)
  const rows = activeTmplId
    ? workoutRows.filter(r => r.templateId === activeTmplId)
    : workoutRows

  const sessions = rows.slice(0, 20) // máx 20 sessões

  if (sessions.length === 0) {
    return (
      <p style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', padding: '16px 0' }}>
        Sem sessões registradas.
      </p>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {sessions.map(row => {
        const isOpen = expandedDate === row.date

        // Grupos musculares treinados nessa sessão (sem warmup)
        const grupoSets: Record<string, number> = {}
        for (const ex of row.exercicios) {
          const pg = resolvePrimaryGroup(ex.exercicioId, customExercises)
          if (!pg) continue
          const validSets = ex.series.filter(s => !s.warmup && (Number(s.reps) || 0) > 0).length
          if (validSets > 0) grupoSets[pg] = (grupoSets[pg] ?? 0) + validSets
        }

        const grupos = Object.entries(grupoSets).sort((a, b) => b[1] - a[1])
        const totalSeries = Object.values(grupoSets).reduce((a, b) => a + b, 0)

        // Data legível
        const [y, m, d] = row.date.split('-')
        const dt = new Date(Number(y), Number(m) - 1, Number(d))
        const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
        const dateLabel = `${diasSemana[dt.getDay()]} ${d}/${m}`

        return (
          <div
            key={row.date}
            style={{
              background: 'var(--surface2)',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--line)',
              overflow: 'hidden',
            }}
          >
            {/* Header do card — clicável */}
            <div
              onClick={() => setExpandedDate(isOpen ? null : row.date)}
              style={{
                padding: '10px 12px', cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: grupos.length > 0 ? 8 : 0 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{dateLabel}</span>
                <span style={{ fontSize: 11, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>{totalSeries} séries</span>
                  {row.kcal > 0 && <span>🔥{row.kcal}</span>}
                  <span style={{ fontSize: 12, color: 'var(--text3)', transition: 'transform .2s', display: 'inline-block', transform: isOpen ? 'rotate(90deg)' : 'none' }}>▸</span>
                </span>
              </div>

              {/* Grupos musculares com mini barras de contribuição */}
              {grupos.map(([grupo, sets]) => {
                const lm  = MUSCLE_LANDMARKS[grupo as keyof typeof MUSCLE_LANDMARKS]
                if (!lm) return null
                const pct     = Math.min(sets / lm.mrv, 1) * 100
                const mevPct  = Math.min(lm.mev / lm.mrv, 1) * 100
                let barColor  = '#fbbf24' // amarelo = abaixo MEV
                if (sets >= lm.mrv)      barColor = 'var(--bad)'
                else if (sets >= lm.mev) barColor = 'var(--good)'
                return (
                  <div key={grupo} style={{ marginBottom: 5 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{ fontSize: 11, color: 'var(--text2)', fontWeight: 600 }}>{grupo}</span>
                      <span style={{ fontSize: 11, color: 'var(--text3)' }}>{sets}/{lm.mev} MEV</span>
                    </div>
                    <div style={{ position: 'relative', height: 5, background: 'var(--line)', borderRadius: 3, overflow: 'visible' }}>
                      <div style={{ height: '100%', width: `${pct}%`, borderRadius: 3, background: barColor }} />
                      <div style={{ position: 'absolute', top: -2, left: `${mevPct}%`, width: 2, height: 9, background: 'var(--accent)', borderRadius: 1 }} />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Detalhe expandido — exercícios + carga máx */}
            {isOpen && (
              <div style={{ borderTop: '1px solid var(--line)', padding: '8px 12px 10px' }}>
                {row.exercicios.map((ex, i) => {
                  const nome = resolveExName(ex.exercicioId, customExercises).split('(')[0].trim()
                  const workSets = ex.series.filter(s => !s.warmup && (Number(s.reps) || 0) > 0)
                  const warmSets = ex.series.filter(s => s.warmup && (Number(s.reps) || 0) > 0)
                  const maxCarga = workSets.length > 0 ? Math.max(0, ...workSets.map(s => Number(s.carga) || 0)) : 0
                  if (workSets.length === 0 && warmSets.length === 0) return null
                  return (
                    <div
                      key={i}
                      onClick={() => onOpenExProg(ex.exercicioId)}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,.04)',
                        cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                      }}
                    >
                      <span style={{ fontSize: 12, color: 'var(--text)', fontWeight: 600 }}>{nome}</span>
                      <span style={{ fontSize: 11, color: 'var(--text3)', display: 'flex', gap: 8 }}>
                        {warmSets.length > 0 && <span style={{ color: '#fbbf24' }}>W×{warmSets.length}</span>}
                        <span>{workSets.length} séries{maxCarga > 0 ? ` · ${maxCarga}kg` : ''}</span>
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
      <div style={{ fontSize: 11, color: 'var(--text3)', textAlign: 'center', marginTop: 4 }}>
        Linha roxa = MEV semanal. Barra amarela = abaixo do MEV · Verde = na faixa.
      </div>
    </div>
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
  const [activeTab, setActiveTab] = useState<ThTab>('sessoes')

  // Sempre abre na aba "Sessões"
  useEffect(() => {
    if (open) setActiveTab('sessoes')
  }, [open])

  if (!open) return null

  const tmpl    = activeTmplId ? templates.find(t => t.id === activeTmplId) : null
  const title   = tmpl
    ? `📊 ${tmpl.nome.includes('—') ? tmpl.nome.split('—')[0].trim() : tmpl.nome}`
    : '📊 Histórico geral'

  const TABS: { id: ThTab; label: string }[] = [
    { id: 'sessoes', label: '📅 Sessões' },
    { id: 'equip',   label: '🏋️ Por exercício' },
    { id: 'grupo',   label: '💪 Por grupo' },
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
        minHeight: '70dvh', maxHeight: '92dvh',
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
          {activeTab === 'sessoes' && (
            <PanelSessoes
              workoutRows={workoutRows}
              activeTmplId={activeTmplId}
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
