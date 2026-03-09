// TreinoPage — Fase 3 — Sessão 3A: estrutura base
// Visual fiel ao original: referência.index.html L2604–2695
// CSS fiel: L1356–1481 (tmpl-section, tmpl-grid, ex-list, workout-summary)
// Funcionalidade de exercícios/cardio: Sessões 3B e 3C

import { useState } from 'react'
import { useWorkout } from '../hooks/useWorkout'
import { useDateStore } from '../store/dateStore'
import { exById } from '../data/exerciseDb'

export default function TreinoPage() {
  const { selectedDate } = useDateStore()
  const { state, templates, loading, saved } = useWorkout(selectedDate)

  const [tmplOpen, setTmplOpen] = useState(false)
  const [accCardioOpen, setAccCardioOpen] = useState(true)
  const [accTimerOpen, setAccTimerOpen]   = useState(false)

  // ─── Workout summary calculado ───────────────────────────
  const totalSeries = state.exercicios.reduce((acc, ex) => acc + ex.series.length, 0)
  const totalVolume  = state.exercicios.reduce((acc, ex) =>
    acc + ex.series.reduce((a, s) => a + (Number(s.reps) || 0) * (Number(s.carga) || 0), 0), 0)
  const totalCardioMin = state.cardio.reduce((acc, c) => acc + c.minutos, 0)
  const totalKcal = Math.round(
    state.exercicios.reduce((acc, ex) =>
      acc + ex.series.reduce((a, s) => {
        const r = Number(s.reps) || 0
        if (r === 0) return a
        return a + Math.max(5, Math.min(14, r * 0.5 + (Number(s.carga) || 0) * 0.03))
      }, 0), 0)
    + state.cardio.reduce((acc, c) => acc + c.minutos * c.kcalPerMin, 0)
  )

  if (loading) {
    return (
      <div style={{ padding: 24, color: 'var(--text3)', textAlign: 'center', fontSize: 13 }}>
        Carregando...
      </div>
    )
  }

  return (
    <div style={{ paddingBottom: 32 }}>

      {/* ── Card principal ────────────────────────────────────── */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius)',
        margin: '12px 16px 0',
        overflow: 'hidden',
      }}>

        {/* ── card-header ──────────────────────────────────────── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 14px',
          borderBottom: '1px solid var(--line)',
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>🏋️ Treino</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2, fontWeight: 600 }}>
              Séries · reps · carga · progressão
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            {/* 📊 Histórico — Sessão 3E */}
            <button
              type="button"
              title="Histórico"
              style={{
                width: 36, height: 36, borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--line)', background: 'var(--surface2)',
                color: 'var(--text)', fontSize: 16, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font)', WebkitTapHighlightColor: 'transparent',
              }}
            >📊</button>
            {/* 📖 Guia de Volume — Sessão 3E */}
            <button
              type="button"
              title="Guia de Volume"
              style={{
                width: 36, height: 36, borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--line)', background: 'var(--surface2)',
                color: 'var(--text)', fontSize: 16, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font)', WebkitTapHighlightColor: 'transparent',
              }}
            >📖</button>
            {/* Salvar — Sessão 3C */}
            <button
              type="button"
              style={{
                height: 36, padding: '0 14px',
                borderRadius: 'var(--radius-xs)',
                border: 'none',
                background: saved ? 'rgba(52,211,153,.15)' : 'var(--accent)',
                color: saved ? 'var(--good)' : '#fff',
                fontFamily: 'var(--font)', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                transition: 'background .2s, color .2s',
              }}
            >
              {saved ? '✓ Salvo' : 'Salvar ▶'}
            </button>
          </div>
        </div>

        {/* ── card-body ─────────────────────────────────────────── */}
        <div style={{ padding: '12px 14px' }}>

          {/* ── Seção de Rotinas (tmpl-section) ──────────────────── */}
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
            <span style={{ fontSize: 12, color: 'var(--text3)', transition: 'transform .2s', display: 'inline-block', transform: tmplOpen ? 'rotate(90deg)' : 'none' }}>
              ▸
            </span>
          </div>

          {/* tmpl-grid — colapsável */}
          {tmplOpen && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10, marginTop: 4 }}>
              {templates.map(tmpl => (
                <button
                  key={tmpl.id}
                  type="button"
                  style={{
                    position: 'relative',
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '10px 38px 10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: state.templateId === tmpl.id
                      ? '1px solid rgba(124,92,255,.4)'
                      : '1px solid var(--line)',
                    background: state.templateId === tmpl.id
                      ? 'linear-gradient(135deg,rgba(124,92,255,.3),rgba(124,92,255,.1))'
                      : 'var(--surface2)',
                    color: 'var(--text)', fontFamily: 'var(--font)', fontSize: 13,
                    fontWeight: 600, cursor: 'pointer', minHeight: 44,
                    textAlign: 'left', WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  {/* dot colorido */}
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: tmpl.cor, flexShrink: 0 }} />
                  <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>{tmpl.nome}</span>
                    <span style={{ fontSize: 9, color: 'var(--text3)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140 }}>
                      {tmpl.exercicios.length} exercícios
                    </span>
                  </span>
                  {/* botão de edição (✏️) — Sessão 3D */}
                  <span style={{
                    position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
                    width: 24, height: 24, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, color: 'var(--text3)', background: 'rgba(255,255,255,.06)',
                  }}>✏️</span>
                </button>
              ))}
              {/* + Nova rotina — Sessão 3D */}
              <button
                type="button"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '9px 14px', borderRadius: 'var(--radius-sm)',
                  border: '1px dashed var(--line)', background: 'transparent',
                  color: 'var(--text3)', fontFamily: 'var(--font)', fontSize: 12,
                  fontWeight: 700, cursor: 'pointer', minHeight: 40,
                }}
              >
                + Nova rotina
              </button>
            </div>
          )}

          {/* ── ex-list (lista de exercícios) ─────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
            {state.exercicios.length === 0 && (
              <div style={{
                padding: '20px 0', textAlign: 'center',
                color: 'var(--text3)', fontSize: 12, fontWeight: 600,
              }}>
                Nenhum exercício adicionado
              </div>
            )}
            {state.exercicios.map((ex, i) => {
              const info = exById(ex.exercicioId)
              return (
                <div
                  key={i}
                  style={{
                    background: 'var(--surface)', border: '1px solid var(--line)',
                    borderRadius: 'var(--radius-sm)', overflow: 'hidden',
                  }}
                >
                  {/* ex-item-header */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 12px', cursor: 'pointer',
                    WebkitTapHighlightColor: 'transparent',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                        <span style={{ fontSize: 13, fontWeight: 700 }}>
                          {info?.nome ?? ex.exercicioId}
                        </span>
                        {info?.grupo && (
                          <span style={{
                            fontSize: 9, fontWeight: 700, color: 'var(--accent)',
                            background: 'rgba(124,92,255,.1)', border: '1px solid rgba(124,92,255,.2)',
                            borderRadius: 10, padding: '1px 6px', width: 'fit-content',
                          }}>
                            {info.grupo}
                          </span>
                        )}
                      </div>
                    </div>
                    <span style={{
                      fontSize: 10, color: 'var(--text3)', fontWeight: 600,
                      background: 'var(--surface2)', padding: '3px 8px', borderRadius: 999,
                    }}>
                      {ex.series.length} séries
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Botão + Adicionar exercício — funcional na Sessão 3B */}
          <button
            type="button"
            style={{
              width: '100%', padding: '10px 12px', marginBottom: 10,
              borderRadius: 'var(--radius-xs)', border: '1px dashed var(--line)',
              background: 'transparent', color: 'var(--text3)',
              fontFamily: 'var(--font)', fontSize: 12, fontWeight: 700,
              cursor: 'pointer', textAlign: 'center',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            + Adicionar exercício
          </button>

          {/* ── Accordion Cardio ──────────────────────────────────── */}
          <div style={{
            border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)',
            overflow: 'hidden', marginBottom: 10,
          }}>
            <button
              type="button"
              onClick={() => setAccCardioOpen(o => !o)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 14px', background: 'transparent',
                border: 0, color: 'var(--text)', fontFamily: 'var(--font)',
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              ❤️ Cardio
              <span style={{ fontSize: 14, color: 'var(--text3)', transition: 'transform .2s', display: 'inline-block', transform: accCardioOpen ? 'none' : 'rotate(-90deg)' }}>
                ▾
              </span>
            </button>
            {accCardioOpen && (
              <div style={{ padding: '0 14px 12px' }}>
                {state.cardio.length === 0 && (
                  <div style={{ fontSize: 12, color: 'var(--text3)', padding: '4px 0 8px', fontWeight: 600 }}>
                    Nenhum cardio adicionado
                  </div>
                )}
                {/* Listagem de cardio — Sessão 3C */}
                {/* Botão + Adicionar cardio — Sessão 3C */}
                <button
                  type="button"
                  style={{
                    marginTop: 4, padding: '6px 12px',
                    borderRadius: 'var(--radius-xs)', border: '1px dashed var(--line)',
                    background: 'transparent', color: 'var(--text3)',
                    fontFamily: 'var(--font)', fontSize: 11, fontWeight: 700,
                    cursor: 'pointer', width: '100%', textAlign: 'center',
                  }}
                >
                  + Adicionar cardio
                </button>
              </div>
            )}
          </div>

          {/* ── Accordion Timer de Pausa ──────────────────────────── */}
          <div style={{
            border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)',
            overflow: 'hidden', marginBottom: 10,
          }}>
            <button
              type="button"
              onClick={() => setAccTimerOpen(o => !o)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 14px', background: 'transparent',
                border: 0, color: 'var(--text)', fontFamily: 'var(--font)',
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              ⏱ Timer de Pausa
              <span style={{ fontSize: 14, color: 'var(--text3)', transition: 'transform .2s', display: 'inline-block', transform: accTimerOpen ? 'none' : 'rotate(-90deg)' }}>
                ▾
              </span>
            </button>
            {accTimerOpen && (
              <div style={{ padding: '0 14px 12px', color: 'var(--text3)', fontSize: 12, fontWeight: 600 }}>
                Timer — Sessão 3C
              </div>
            )}
          </div>

          {/* ── Nota do treino ────────────────────────────────────── */}
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', display: 'block', marginBottom: 6 }}>
              📝 Observação do treino
            </label>
            <input
              readOnly
              placeholder="Como foi o treino, dores, energia... (Sessão 3C)"
              style={{
                width: '100%', boxSizing: 'border-box',
                border: '1px solid var(--line)', background: 'rgba(0,0,0,.15)',
                color: 'var(--text)', fontFamily: 'var(--font)',
                fontSize: 16, fontWeight: 600, padding: '10px 12px',
                borderRadius: 'var(--radius-xs)', outline: 'none',
              }}
            />
          </div>

          {/* ── Workout Summary ───────────────────────────────────── */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 4, marginTop: 10,
          }}>
            {[
              { val: totalSeries,    lbl: '🔁 Séries'     },
              { val: Math.round(totalVolume), lbl: '🏋️ Volume kg'  },
              { val: totalCardioMin, lbl: '❤️ Cardio min' },
              { val: totalKcal,      lbl: '🔥 kcal est.'  },
            ].map(({ val, lbl }) => (
              <div key={lbl} style={{
                textAlign: 'center', padding: '8px 2px',
                background: 'var(--surface)', border: '1px solid var(--line)',
                borderRadius: 'var(--radius-xs)',
              }}>
                <div style={{ fontSize: 16, fontWeight: 800 }}>{val}</div>
                <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--text3)', marginTop: 2, lineHeight: 1.3 }}>
                  {lbl}
                </div>
              </div>
            ))}
          </div>

        </div>{/* /card-body */}
      </div>{/* /card */}
    </div>
  )
}
