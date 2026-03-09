// TemplateEditorModal — Sessão 3D
// Port fiel ao original: referência.index.html
// HTML: L2764–2807 (tmplModal)
// CSS:  L1483–1504 (tmpl-ex-item, tmpl-color-dot)
// JS:   L7743–8066 (TMPL_COLORS, renderTmplEditor, renderTmplExList, renderTmplCatalog, saveTmplEdit, deleteTmpl)

import { useState, useEffect } from 'react'
import { EXERCISE_DB, CARDIO_TYPES, exById } from '../data/exerciseDb'
import type { WorkoutTemplate } from '../types/workout'
import type { CustomExercise } from '../types/workout'

// TMPL_COLORS fiel ao original L7748
const TMPL_COLORS = ['#f87171', '#60a5fa', '#34d399', '#fbbf24', '#a78bfa', '#fb923c', '#f472b6', '#22d3ee']

const CUSTOM_EX_GROUP = '⭐ Meus exercícios'

interface Props {
  open:            boolean
  template:        WorkoutTemplate | null
  isNew:           boolean
  customExercises: CustomExercise[]
  onSave:          (tmpl: WorkoutTemplate) => void
  onDelete:        (tmplId: string) => void
  onClose:         () => void
}

export function TemplateEditorModal({ open, template, isNew, customExercises, onSave, onDelete, onClose }: Props) {
  // Estado interno: cópia local do template em edição (original editingTmplData)
  const [nome, setNome]           = useState('')
  const [cor, setCor]             = useState('#a78bfa')
  const [cardioTipo, setCardioTipo] = useState('bicicleta')
  const [cardioMin, setCardioMin] = useState(15)
  const [exercicios, setExercicios] = useState<string[]>([])

  // Catálogo: aba ativa (original editCatActive)
  const [catActive, setCatActive] = useState<string | null>(null)

  // Confirmação de exclusão (original deleteConfirmPending)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  // Sincroniza estado interno ao abrir com um template
  useEffect(() => {
    if (open && template) {
      setNome(template.nome)
      setCor(template.cor)
      setCardioTipo(template.cardio?.tipo ?? 'bicicleta')
      setCardioMin(template.cardio?.min ?? 15)
      setExercicios([...(template.exercicios ?? [])])
      setCatActive(null)
      setDeleteConfirm(false)
    }
  }, [open, template?.id])

  // Fechar limpa estado temporário (original closeTmplEditor: se isNew, remove da lista)
  const handleClose = () => {
    setDeleteConfirm(false)
    onClose()
  }

  const handleSave = () => {
    if (!template) return
    const updated: WorkoutTemplate = {
      ...template,
      nome: nome.trim() || 'Treino',
      cor,
      exercicios,
      cardio: { tipo: cardioTipo, min: cardioMin || 15 },
    }
    onSave(updated)
  }

  const handleDelete = () => {
    if (!template) return
    if (!deleteConfirm) {
      setDeleteConfirm(true)
      setTimeout(() => setDeleteConfirm(false), 3000)
      return
    }
    onDelete(template.id)
  }

  // Mover exercício para cima (original tei-move L7837–7843)
  const moveUp = (idx: number) => {
    if (idx === 0) return
    const arr = [...exercicios]
    ;[arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]]
    setExercicios(arr)
  }

  const removeEx = (idx: number) => {
    setExercicios(exercicios.filter((_, i) => i !== idx))
  }

  const addEx = (exId: string) => {
    if (exercicios.includes(exId)) return
    setExercicios([...exercicios, exId])
  }

  if (!open || !template) return null

  const alreadySet = new Set(exercicios)
  const grupos = Object.keys(EXERCISE_DB)

  // Resolve nome de exercício (built-in ou custom)
  const resolveNome = (id: string) => {
    const builtin = exById(id)
    if (builtin) return builtin.nome
    return customExercises.find(e => e.id === id)?.nome ?? id
  }
  const resolveGrupo = (id: string) => {
    const builtin = exById(id)
    if (builtin) return builtin.grupo ?? ''
    return customExercises.find(e => e.id === id)?.grupo ?? ''
  }

  // ── Estilos reutilizados ──────────────────────────────────────

  const overlayStyle: React.CSSProperties = {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,.55)',
    zIndex: 320,
  }

  const sheetStyle: React.CSSProperties = {
    position: 'fixed', left: 0, right: 0, bottom: 0,
    maxHeight: '92dvh',
    background: 'linear-gradient(180deg, #1a2035, #121828)',
    borderRadius: '16px 16px 0 0',
    border: '1px solid var(--line)',
    zIndex: 321,
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden',
  }

  const selectStyle: React.CSSProperties = {
    width: '100%',
    border: '1px solid var(--line)',
    background: 'rgba(0,0,0,.15)',
    color: 'var(--text)',
    fontFamily: 'var(--font)',
    fontSize: 13,
    fontWeight: 700,
    padding: '6px 8px',
    borderRadius: 'var(--radius-xs)',
    outline: 'none',
    WebkitAppearance: 'none',
    appearance: 'none',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(0,0,0,.15)',
    border: '1px solid var(--line)',
    borderRadius: 'var(--radius-xs)',
    color: 'var(--text)',
    fontFamily: 'var(--font)',
    fontSize: 16,
    padding: '8px 10px',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const catTabStyle = (active: boolean): React.CSSProperties => ({
    padding: '5px 10px',
    borderRadius: 999,
    border: active ? '1px solid var(--accent)' : '1px solid var(--line)',
    background: active ? 'rgba(124,92,255,.15)' : 'transparent',
    color: active ? 'var(--accent)' : 'var(--text3)',
    fontFamily: 'var(--font)',
    fontSize: 11,
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
    WebkitTapHighlightColor: 'transparent',
  })

  // ── Renderização do catálogo de exercícios ────────────────────

  const renderCatalog = () => {
    if (!catActive) {
      return (
        <div style={{ padding: '16px 0', color: 'var(--text3)', fontSize: 12, textAlign: 'center' }}>
          Selecione um grupo muscular acima.
        </div>
      )
    }

    let exs: { id: string; nome: string; grupo?: string; isCustom?: boolean }[] = []

    if (catActive === CUSTOM_EX_GROUP) {
      exs = customExercises.filter(e => !e.arquivado).map(e => ({
        id: e.id, nome: e.nome, grupo: e.grupo, isCustom: true,
      }))
    } else {
      exs = (EXERCISE_DB[catActive] ?? []).map(e => ({ id: e.id, nome: e.nome }))
    }

    if (exs.length === 0) {
      return (
        <div style={{ padding: '16px 0', color: 'var(--text3)', fontSize: 12, textAlign: 'center' }}>
          {catActive === CUSTOM_EX_GROUP
            ? 'Nenhum exercício personalizado ainda.'
            : 'Nenhum exercício neste grupo.'}
        </div>
      )
    }

    return (
      <>
        {exs.map(ex => {
          const inTemplate = alreadySet.has(ex.id)
          return (
            <div
              key={ex.id}
              onClick={() => { if (!inTemplate) addEx(ex.id) }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 12px',
                borderBottom: '1px solid var(--line)',
                opacity: inTemplate ? 0.4 : 1,
                cursor: inTemplate ? 'default' : 'pointer',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}>
                  {ex.nome}
                  {ex.isCustom && (
                    <span style={{
                      fontSize: 9, fontWeight: 700, padding: '1px 5px',
                      borderRadius: 999, background: 'rgba(124,92,255,.15)',
                      color: 'var(--accent)', border: '1px solid rgba(124,92,255,.2)',
                    }}>custom</span>
                  )}
                </div>
                {ex.grupo && (
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>{ex.grupo}</div>
                )}
              </div>
              <span style={{ fontSize: 16, color: 'var(--accent)' }}>{inTemplate ? '✓' : '+'}</span>
            </div>
          )
        })}
      </>
    )
  }

  return (
    <>
      {/* Overlay */}
      <div style={overlayStyle} onClick={handleClose} />

      {/* Bottom sheet */}
      <div style={sheetStyle}>
        {/* Handle */}
        <div style={{
          width: 36, height: 4, borderRadius: 2,
          background: 'rgba(255,255,255,.15)',
          margin: '10px auto 0',
          flexShrink: 0,
        }} />

        {/* Header (original L2768–2776) */}
        <div style={{
          display: 'flex', alignItems: 'center',
          padding: '12px 16px 10px',
          borderBottom: '1px solid var(--line)',
          flexShrink: 0,
          flexWrap: 'wrap', gap: 8,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <b style={{ fontSize: 14 }}>
              {isNew ? '✨ Novo template' : 'Editar template'}
            </b>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {/* Botão excluir — dois taps para confirmar (original L8034–8066) */}
            {!isNew && (
              <button
                type="button"
                onClick={handleDelete}
                style={{
                  minHeight: 36, fontSize: 12, padding: '0 10px',
                  border: deleteConfirm
                    ? '1px solid rgba(248,113,113,.5)'
                    : '1px solid rgba(248,113,113,.3)',
                  color: 'var(--bad)',
                  background: deleteConfirm ? 'rgba(248,113,113,.15)' : 'transparent',
                  borderRadius: 8,
                  fontFamily: 'var(--font)', fontWeight: 700, cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                  whiteSpace: 'nowrap',
                }}
              >
                {deleteConfirm ? '⚠️ Confirmar?' : '🗑️'}
              </button>
            )}
            <button
              type="button"
              onClick={handleSave}
              style={{
                minHeight: 36, fontSize: 12, padding: '0 14px',
                borderRadius: 8, border: 'none',
                background: 'var(--accent)', color: '#fff',
                fontFamily: 'var(--font)', fontWeight: 700, cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
              }}
            >✅ Salvar</button>
            <button
              type="button"
              onClick={handleClose}
              style={{
                width: 32, height: 32, borderRadius: '50%',
                border: '1px solid var(--line)',
                background: 'rgba(255,255,255,.06)',
                color: 'var(--text3)', fontSize: 14, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, WebkitTapHighlightColor: 'transparent',
              }}
            >✕</button>
          </div>
        </div>

        {/* Body — scrollável */}
        <div style={{ padding: '14px 16px', overflowY: 'auto', flex: 1 }}>

          {/* Nome do template (original L2780–2783) */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', display: 'block', marginBottom: 4 }}>
              Nome do template
            </label>
            <input
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Ex: Treino A — Peito + Bíceps"
              style={inputStyle}
            />
          </div>

          {/* Color picker (original L2784–2788) */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700 }}>Cor:</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {TMPL_COLORS.map(c => (
                <div
                  key={c}
                  onClick={() => setCor(c)}
                  style={{
                    width: 24, height: 24, borderRadius: '50%',
                    background: c, cursor: 'pointer',
                    border: cor === c ? '2px solid var(--text)' : '2px solid transparent',
                    transition: 'border-color .15s',
                    flexShrink: 0,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Cardio padrão (original L2789–2797) */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', display: 'block', marginBottom: 4 }}>
                Cardio padrão
              </label>
              <select
                value={cardioTipo}
                onChange={e => setCardioTipo(e.target.value)}
                style={selectStyle}
              >
                {CARDIO_TYPES.map(ct => (
                  <option key={ct.id} value={ct.id}>{ct.nome}</option>
                ))}
              </select>
            </div>
            <div style={{ width: 80 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', display: 'block', marginBottom: 4 }}>
                Minutos
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={cardioMin}
                onChange={e => setCardioMin(Number(e.target.value))}
                placeholder="15"
                style={{ ...inputStyle, fontSize: 14 }}
              />
            </div>
          </div>

          {/* Lista de exercícios do template (original L2798–2800, renderTmplExList L7819–7850) */}
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', marginBottom: 6 }}>
            Exercícios no template:
          </div>
          <div style={{ maxHeight: '28vh', overflowY: 'auto', marginBottom: 12 }}>
            {exercicios.length === 0 ? (
              <div style={{ padding: '12px 0', color: 'var(--text3)', fontSize: 12, textAlign: 'center' }}>
                Nenhum exercício. Adicione abaixo.
              </div>
            ) : (
              exercicios.map((exId, idx) => (
                <div
                  key={exId + idx}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '7px 8px',
                    background: 'var(--surface)',
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--radius-xs)',
                    marginBottom: 4,
                  }}
                >
                  {/* ⠿ mover para cima */}
                  <span
                    onClick={() => moveUp(idx)}
                    style={{
                      color: 'var(--text3)', fontSize: 14, cursor: 'pointer',
                      flexShrink: 0, padding: '0 2px',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                  >⠿</span>
                  <span style={{ flex: 1, fontSize: 12, fontWeight: 700 }}>
                    {resolveNome(exId)}
                  </span>
                  <span style={{ fontSize: 9, color: 'var(--text3)', fontWeight: 600 }}>
                    {resolveGrupo(exId)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeEx(idx)}
                    style={{
                      width: 26, height: 26, borderRadius: '50%',
                      border: '1px solid rgba(248,113,113,.15)',
                      background: 'transparent', color: 'var(--bad)',
                      fontSize: 13, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, WebkitTapHighlightColor: 'transparent',
                    }}
                  >✕</button>
                </div>
              ))
            )}
          </div>

          {/* Catálogo de exercícios — tabs por grupo + "⭐ Meus" (original L2801–2804, renderTmplCatalog L7852–7950) */}
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', marginBottom: 6 }}>
            Adicionar exercício:
          </div>

          {/* Cat tabs */}
          <div style={{
            display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 8,
            paddingBottom: 4,
            scrollbarWidth: 'none',
          }}>
            {grupos.map(grp => (
              <button
                key={grp}
                type="button"
                onClick={() => setCatActive(grp)}
                style={catTabStyle(catActive === grp)}
              >{grp}</button>
            ))}
            <button
              type="button"
              onClick={() => setCatActive(CUSTOM_EX_GROUP)}
              style={catTabStyle(catActive === CUSTOM_EX_GROUP)}
            >{CUSTOM_EX_GROUP}</button>
          </div>

          {/* Grid de exercícios */}
          <div style={{
            maxHeight: '30vh', overflowY: 'auto',
            border: catActive ? '1px solid var(--line)' : 'none',
            borderRadius: 'var(--radius-xs)',
          }}>
            {renderCatalog()}
          </div>

          <div style={{ height: 80 }} />
        </div>
      </div>
    </>
  )
}
