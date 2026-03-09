// ExerciseSelector — bottom sheet para adicionar/trocar exercício
// Fiel ao original: referência.index.html L2837–2850 (HTML), L6440–6652 (JS)
// CSS fiel: food-item (.fi-info/.fi-name), cat-tab, modal-sheet, modal-handle, modal-header
// Sessão 3B+: aba "⭐ Meus exercícios" + rename inline + delete (L6486–6652)

import { useState, useEffect } from 'react'
import { EXERCISE_DB } from '../data/exerciseDb'
import type { CustomExercise } from '../types/workout'

const CUSTOM_EX_GROUP = '⭐ Meus exercícios' // original L6135
const GROUPS = [...Object.keys(EXERCISE_DB), CUSTOM_EX_GROUP]

// Rename inline state — substitui o grid por row de edição (original L6594–6652)
type RenameState = {
  ex: CustomExercise;
  nome: string;
  secundarios: string[];
};

interface ExerciseSelectorProps {
  open: boolean
  mode: 'add' | 'swap'
  onClose: () => void
  onSelect: (exercicioId: string, nome: string) => void
  customExercises: CustomExercise[]
  onCreateCustom: () => void                                   // abre CustomExerciseModal por cima
  onDeleteCustom: (id: string) => void
  onRenameCustom: (id: string, nome: string, secundarios: string[]) => void
  forceGroup?: string | null                                   // força aba ao reabrir (ex: após criar)
}

const LEG_FAMILY = ['🦵 Pernas', '🦵 Quad', '🦵 Posterior']

export default function ExerciseSelector({
  open, mode, onClose, onSelect,
  customExercises, onCreateCustom, onDeleteCustom, onRenameCustom,
  forceGroup,
}: ExerciseSelectorProps) {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [renaming, setRenaming] = useState<RenameState | null>(null)

  // Força aba ao abrir com forceGroup (ex: após criar exercício custom — original L7984)
  useEffect(() => {
    if (open && forceGroup) {
      setSelectedGroup(forceGroup)
      setRenaming(null)
    }
  }, [open, forceGroup])

  if (!open) return null

  const title = mode === 'swap' ? '🔄 Trocar exercício' : '＋ Adicionar exercício'

  const isCustomTab = selectedGroup === CUSTOM_EX_GROUP

  // Exercícios do grupo selecionado — inclui custom no grupo quando não é a aba "⭐ Meus" (L6489–6496)
  const exercises = selectedGroup
    ? isCustomTab
      ? customExercises
      : [
          ...(EXERCISE_DB[selectedGroup] ?? []),
          ...customExercises.filter(e =>
            e.grupo === selectedGroup ||
            (selectedGroup === '🦵 Quad' && e.grupo === '🦵 Pernas') // retrocompat L6492–6493
          ),
        ]
    : []

  const handleSelectBuiltin = (exId: string, exNome: string) => {
    onSelect(exId, exNome)
    onClose()
  }

  const handleSelectCustom = (ex: CustomExercise) => {
    onSelect(ex.id, ex.nome)
    onClose()
  }

  const handleDelete = (ex: CustomExercise, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm(`Excluir "${ex.nome}"?`)) return // original L6550
    onDeleteCustom(ex.id)
  }

  const openRename = (ex: CustomExercise, e: React.MouseEvent) => {
    e.stopPropagation()
    setRenaming({ ex, nome: ex.nome, secundarios: ex.secundarios ?? [] })
  }

  const confirmRename = () => {
    if (!renaming || !renaming.nome.trim()) return
    onRenameCustom(renaming.ex.id, renaming.nome.trim(), renaming.secundarios)
    setRenaming(null)
  }

  // Chips de secundários para rename inline (original L6614–6633)
  const renameChipsDisponiveis = renaming
    ? Object.keys(EXERCISE_DB).filter(g => {
        if (LEG_FAMILY.includes(renaming.ex.grupo)) return !LEG_FAMILY.includes(g)
        return g !== renaming.ex.grupo
      })
    : []

  const toggleRenameSec = (g: string) => {
    if (!renaming) return
    setRenaming(prev => {
      if (!prev) return prev
      const has = prev.secundarios.includes(g)
      return { ...prev, secundarios: has ? prev.secundarios.filter(x => x !== g) : [...prev.secundarios, g] }
    })
  }

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

          {/* cat-tabs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {GROUPS.map(g => (
              <button
                key={g}
                type="button"
                onClick={() => { setSelectedGroup(g); setRenaming(null) }}
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

          {/* estado vazio — sem grupo */}
          {!selectedGroup && (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text3)', fontSize: 12, fontWeight: 600 }}>
              Selecione um grupo muscular acima.
            </div>
          )}

          {/* ─── Rename inline (substitui grid) — original L6594–6652 ─── */}
          {selectedGroup && renaming && (
            <div>
              {/* row de edição — .tei-rename-row (CSS L1572) */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 0' }}>
                <input
                  autoFocus
                  value={renaming.nome}
                  onChange={e => setRenaming(prev => prev ? { ...prev, nome: e.target.value } : prev)}
                  autoComplete="off"
                  style={{
                    flex: 1, fontSize: 16,
                    background: 'var(--surface2)',
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--radius-xs)',
                    padding: '10px 12px',
                    color: 'var(--text)', outline: 'none',
                    fontFamily: 'var(--font)',
                  }}
                  onKeyDown={e => e.key === 'Enter' && confirmRename()}
                />
                <button
                  onClick={confirmRename}
                  className="btn primary"
                  style={{ fontSize: 14, padding: '0 14px', minHeight: 40 }}
                >OK</button>
                <button
                  onClick={() => setRenaming(null)}
                  className="btn"
                  style={{ fontSize: 14, padding: '0 14px', minHeight: 40 }}
                >✕</button>
              </div>

              {/* grupo principal — só leitura (L6608–6612) */}
              <div style={{ fontSize: 13, color: 'var(--text3)', margin: '10px 0 4px' }}>
                Grupo principal: {renaming.ex.grupo || '—'}
              </div>

              {/* chips secundários editáveis (L6614–6633) */}
              <div style={{ fontSize: 13, color: 'var(--text3)', margin: '8px 0 4px' }}>
                Grupos secundários:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                {renameChipsDisponiveis.map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleRenameSec(g)}
                    style={{
                      padding: '4px 10px', borderRadius: 20,
                      border: renaming.secundarios.includes(g)
                        ? '1px solid var(--accent)'
                        : '1px solid var(--line)',
                      fontSize: 12, fontWeight: 600,
                      color: renaming.secundarios.includes(g) ? '#fff' : 'var(--text2)',
                      background: renaming.secundarios.includes(g) ? 'var(--accent)' : 'transparent',
                      cursor: 'pointer', fontFamily: 'var(--font)',
                    }}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ─── Grid de exercícios (não rename) ─── */}
          {selectedGroup && !renaming && (
            <>
              {/* aba "⭐ Meus exercícios" — vazio (L6500–6506) */}
              {isCustomTab && customExercises.length === 0 && (
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: 12, padding: '32px 0', color: 'var(--text3)', fontSize: 12, fontWeight: 600,
                }}>
                  Nenhum exercício personalizado ainda.
                  <button
                    onClick={onCreateCustom}
                    className="btn primary"
                    style={{ fontSize: 16, padding: '10px 20px' }}
                  >＋ Criar exercício</button>
                </div>
              )}

              {/* grupos built-in sem exercícios */}
              {!isCustomTab && exercises.length === 0 && (
                <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text3)', fontSize: 12, fontWeight: 600 }}>
                  Nenhum exercício neste grupo.
                </div>
              )}

              {/* lista de exercícios */}
              {exercises.map(ex => {
                const isCustom = customExercises.some(c => c.id === ex.id)
                return (
                  <div
                    key={ex.id}
                    onClick={() => isCustom
                      ? handleSelectCustom(ex as CustomExercise)
                      : handleSelectBuiltin(ex.id, ex.nome)
                    }
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 14px',
                      border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)',
                      background: 'var(--surface)', marginBottom: 6,
                      cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* nome + tag "custom" — original L6514–6519, CSS L1570 */}
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        {ex.nome}
                        {isCustom && (
                          <span style={{
                            fontSize: 9, fontWeight: 700,
                            color: 'var(--accent)',
                            background: 'rgba(124,92,255,.12)',
                            border: '1px solid rgba(124,92,255,.25)',
                            borderRadius: 4, padding: '1px 5px', flexShrink: 0,
                          }}>custom</span>
                        )}
                      </div>
                      {/* grupo como subtexto quando na aba "⭐ Meus" */}
                      {isCustomTab && isCustom && (
                        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
                          {(ex as CustomExercise).grupo}
                        </div>
                      )}
                    </div>

                    {/* ações custom: delete + rename + add (L6521–6525) */}
                    {isCustom ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        <button
                          type="button"
                          title="Excluir"
                          onClick={e => handleDelete(ex as CustomExercise, e)}
                          style={{
                            background: 'transparent', border: 'none',
                            color: 'var(--text3)', fontSize: 13, cursor: 'pointer', padding: '0 4px',
                          }}
                        >🗑️</button>
                        <button
                          type="button"
                          title="Renomear"
                          onClick={e => openRename(ex as CustomExercise, e)}
                          style={{
                            background: 'transparent', border: 'none',
                            color: 'var(--text3)', fontSize: 13, cursor: 'pointer', padding: '0 4px',
                          }}
                        >✏️</button>
                        <span style={{ fontSize: 18, color: 'var(--accent)', padding: '0 4px' }}>+</span>
                      </div>
                    ) : (
                      <div style={{ fontSize: 18, color: 'var(--accent)', flexShrink: 0, paddingLeft: 8 }}>+</div>
                    )}
                  </div>
                )
              })}

              {/* botão "＋ Criar exercício" sempre visível na aba "⭐ Meus" com itens (L6583–6590) */}
              {isCustomTab && customExercises.length > 0 && (
                <button
                  onClick={onCreateCustom}
                  style={{
                    width: '100%', marginTop: 8,
                    background: 'transparent',
                    border: '1px dashed rgba(124,92,255,.4)',   // .custom-ex-create-btn CSS L1576
                    color: 'var(--accent)',
                    fontSize: 13, fontWeight: 700,
                    padding: 10, borderRadius: 'var(--radius-xs)',
                    cursor: 'pointer', fontFamily: 'var(--font)',
                  }}
                >
                  ＋ Criar exercício
                </button>
              )}
            </>
          )}

        </div>
      </div>
    </>
  )
}
