// ExerciseSelector — bottom sheet para adicionar/trocar exercício
// Fiel ao original: referência.index.html L2837–2850 (HTML), L6440–6591 (JS)
// CSS fiel: food-item (.fi-info/.fi-name), cat-tab, modal-sheet, modal-handle, modal-header

import { useState } from 'react'
import { EXERCISE_DB } from '../data/exerciseDb'

interface ExerciseSelectorProps {
  open: boolean
  mode: 'add' | 'swap'
  onClose: () => void
  onSelect: (exercicioId: string, nome: string) => void
}

const GROUPS = Object.keys(EXERCISE_DB)

export default function ExerciseSelector({ open, mode, onClose, onSelect }: ExerciseSelectorProps) {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)

  if (!open) return null

  const title = mode === 'swap' ? '🔄 Trocar exercício' : '＋ Adicionar exercício'

  const exercises = selectedGroup ? (EXERCISE_DB[selectedGroup] ?? []) : []

  return (
    <>
      {/* overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,.6)',
          zIndex: 328,
        }}
      />

      {/* bottom sheet */}
      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: 0,
        zIndex: 329,
        background: 'linear-gradient(180deg, #1a2035, #121828)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius) var(--radius) 0 0',
        maxHeight: '90vh',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 0' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,.15)' }} />
        </div>

        {/* header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid var(--line)',
          flexShrink: 0,
        }}>
          <b style={{ fontSize: 15, fontWeight: 700 }}>{title}</b>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: '50%',
              border: '1px solid var(--line)', background: 'var(--surface2)',
              color: 'var(--text)', fontSize: 14, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font)',
            }}
          >✕</button>
        </div>

        {/* body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 32px' }}>

          {/* cat-tabs — abas de grupo muscular */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 6,
            marginBottom: 12,
          }}>
            {GROUPS.map(g => (
              <button
                key={g}
                type="button"
                onClick={() => setSelectedGroup(g)}
                style={{
                  padding: '6px 12px', borderRadius: 999,
                  border: selectedGroup === g ? '1px solid var(--accent)' : '1px solid var(--line)',
                  background: selectedGroup === g ? 'rgba(124,92,255,.18)' : 'var(--surface2)',
                  color: selectedGroup === g ? 'var(--accent2)' : 'var(--text2)',
                  fontFamily: 'var(--font)', fontSize: 12, fontWeight: 700,
                  cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                  whiteSpace: 'nowrap',
                }}
              >
                {g}
              </button>
            ))}
          </div>

          {/* grid de exercícios */}
          {!selectedGroup && (
            <div style={{
              textAlign: 'center', padding: '32px 0',
              color: 'var(--text3)', fontSize: 12, fontWeight: 600,
            }}>
              Selecione um grupo muscular acima.
            </div>
          )}

          {selectedGroup && exercises.length === 0 && (
            <div style={{
              textAlign: 'center', padding: '32px 0',
              color: 'var(--text3)', fontSize: 12, fontWeight: 600,
            }}>
              Nenhum exercício neste grupo.
            </div>
          )}

          {selectedGroup && exercises.map(ex => (
            <div
              key={ex.id}
              onClick={() => { onSelect(ex.id, ex.nome); onClose() }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 14px',
                border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)',
                background: 'var(--surface)', marginBottom: 6,
                cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                  {ex.nome}
                </div>
              </div>
              <div style={{ fontSize: 18, color: 'var(--accent)', flexShrink: 0, paddingLeft: 8 }}>+</div>
            </div>
          ))}

        </div>
      </div>
    </>
  )
}
