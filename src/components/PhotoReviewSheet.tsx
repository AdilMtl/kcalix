import { useState, useMemo } from 'react'
import type { PhotoFoodResult, PhotoFoodItem, PhotoAltItem } from '../hooks/useAiChat'
import type { PendingLogItem } from '../hooks/useAiChat'
import { estimateFoodMacros } from '../hooks/useAiChat'
import { MEAL_LABELS } from '../hooks/useDiary'
import type { MealKey } from '../hooks/useDiary'

const MEAL_ORDER: MealKey[] = ['cafe', 'lanche1', 'almoco', 'lanche2', 'jantar', 'ceia']

// Mesma fórmula do AiLogConfirmModal
function calcKcalAuto(p: number, c: number, g: number): number {
  return Math.round(p * 4 + c * 4 + g * 9)
}

function calcMacros(item: PendingLogItem, grams: number) {
  const ratio = grams / 100
  return {
    p:    Math.round(item.pPer100    * ratio * 10) / 10,
    c:    Math.round(item.cPer100    * ratio * 10) / 10,
    g:    Math.round(item.gPer100    * ratio * 10) / 10,
    kcal: Math.round(item.kcalPer100 * ratio),
  }
}

const HIDDEN_ITEMS = [
  { label: 'Molho / azeite / manteiga',       icon: '🫙' },
  { label: 'Recheio (queijo, presunto...)',     icon: '🧀' },
  { label: 'Tempero / sal / condimento',        icon: '🧂' },
]

interface AddExtraState {
  idx: number   // índice do HIDDEN_ITEMS sendo adicionado (-1 = campo livre)
  text: string
}

interface Props {
  result: PhotoFoodResult
  previewUrl: string | null          // object URL da foto para exibir miniatura
  onConfirm: (meal: MealKey, items: PendingLogItem[]) => void
  onCancel: () => void
  onDescribeByText: () => void       // fecha sheet e foca no input de texto do chat
}

export function PhotoReviewSheet({ result, previewUrl, onConfirm, onCancel, onDescribeByText }: Props) {
  // Lista de itens editável — começa com os retornados pela IA + extras adicionados pelo usuário
  const [items, setItems] = useState<PhotoFoodItem[]>(result.items)
  const [gramsMap, setGramsMap] = useState<Record<number, string>>(() => {
    const init: Record<number, string> = {}
    result.items.forEach((item, i) => { init[i] = String(item.grams) })
    return init
  })

  // Alternativas abertas por item (índice → true/false)
  const [altOpen, setAltOpen] = useState<Record<number, boolean>>({})

  // Checklist de ingredientes ocultos: qual está "adicionando"
  const [addExtra, setAddExtra] = useState<AddExtraState | null>(null)

  const [selectedMeal, setSelectedMeal] = useState<MealKey | ''>('')

  // Índices de itens cujos macros ainda estão sendo estimados via IA
  const [estimatingIdx, setEstimatingIdx] = useState<Set<number>>(new Set())
  // Índices de itens cuja estimativa falhou (macros ficam 0)
  const [estimateFailedIdx, setEstimateFailedIdx] = useState<Set<number>>(new Set())

  // ─── Helpers ────────────────────────────────────────────────────────────────

  function handleGramsChange(idx: number, val: string) {
    setGramsMap(prev => ({ ...prev, [idx]: val }))
  }

  function handleSwapAlternative(idx: number, alt: PhotoAltItem) {
    setItems(prev => prev.map((item, i) =>
      i !== idx ? item : {
        ...item,
        nome: alt.nome,
        pPer100: alt.pPer100,
        cPer100: alt.cPer100,
        gPer100: alt.gPer100,
        kcalPer100: alt.kcalPer100,
        confidence: 1,        // usuário confirmou → sem mais ⚠️
        alternatives: [],
      }
    ))
    setAltOpen(prev => ({ ...prev, [idx]: false }))
  }

  function handleRemoveItem(idx: number) {
    setItems(prev => prev.filter((_, i) => i !== idx))
    setGramsMap(prev => {
      const next: Record<number, string> = {}
      Object.entries(prev).forEach(([k, v]) => {
        const ki = Number(k)
        if (ki < idx) next[ki] = v
        else if (ki > idx) next[ki - 1] = v
      })
      return next
    })
  }

  async function handleAddExtra(text: string) {
    if (!text.trim()) { setAddExtra(null); return }
    const newItem: PhotoFoodItem = {
      foodId: null,
      nome: text.trim(),
      grams: 10,
      source: 'photo',
      pPer100: 0,
      cPer100: 0,
      gPer100: 0,
      kcalPer100: 0,
      confidence: 1,
      alternatives: [],
    }
    const nextIdx = items.length
    setItems(prev => [...prev, newItem])
    setGramsMap(prev => ({ ...prev, [nextIdx]: '10' }))
    setAddExtra(null)

    // Estimar macros via IA em background — item já aparece na lista enquanto espera
    setEstimatingIdx(prev => new Set(prev).add(nextIdx))
    const macros = await estimateFoodMacros(text.trim())
    setEstimatingIdx(prev => { const s = new Set(prev); s.delete(nextIdx); return s })

    if (macros) {
      setItems(prev => prev.map((item, i) =>
        i !== nextIdx ? item : { ...item, ...macros }
      ))
    } else {
      setEstimateFailedIdx(prev => new Set(prev).add(nextIdx))
    }
  }

  // ─── Totais ─────────────────────────────────────────────────────────────────

  const totals = useMemo(() => {
    let p = 0, c = 0, g = 0, kcal = 0
    items.forEach((item, i) => {
      const grams = parseFloat(gramsMap[i]) || 0
      const m = calcMacros(item, grams)
      p += m.p; c += m.c; g += m.g; kcal += m.kcal
    })
    return {
      p:    Math.round(p * 10) / 10,
      c:    Math.round(c * 10) / 10,
      g:    Math.round(g * 10) / 10,
      kcal: Math.round(kcal),
    }
  }, [items, gramsMap])

  // ─── Confirmar ──────────────────────────────────────────────────────────────

  function handleConfirm() {
    if (!selectedMeal) return
    const finalItems: PendingLogItem[] = items.map((item, i) => ({
      foodId: item.foodId,
      nome: item.nome,
      grams: parseFloat(gramsMap[i]) || item.grams,
      source: 'photo' as const,
      pPer100: item.pPer100,
      cPer100: item.cPer100,
      gPer100: item.gPer100,
      kcalPer100: item.kcalPer100,
    }))
    onConfirm(selectedMeal as MealKey, finalItems)
  }

  const canConfirm = selectedMeal !== '' && items.length > 0

  // ─── Caso sem itens detectados ───────────────────────────────────────────────

  if (result.items.length === 0) {
    return (
      <>
        <div onClick={onCancel} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 348 }} />
        <div style={{
          position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 350,
          background: 'linear-gradient(180deg, #1a2035, #121828)',
          borderRadius: '20px 20px 0 0',
          padding: '24px 20px',
          paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
          boxShadow: '0 -4px 40px rgba(0,0,0,0.5)',
        }}>
          <div style={{ fontSize: 40 }}>🤔</div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 16, textAlign: 'center' }}>
            Não identifiquei alimentos
          </div>
          <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, textAlign: 'center', lineHeight: 1.5 }}>
            {result.message ?? 'Tente uma foto mais próxima ou com melhor iluminação.'}
          </div>
          <button
            onClick={onDescribeByText}
            style={{
              width: '100%', padding: '13px', borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg, #7c5cff, #6144e0)',
              color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
            }}
          >
            Descrever por texto
          </button>
          <button
            onClick={onCancel}
            style={{
              background: 'none', border: 'none',
              color: 'rgba(255,255,255,0.4)', fontSize: 14, cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
        </div>
      </>
    )
  }

  // ─── Tela principal de review ────────────────────────────────────────────────

  return (
    <>
      {/* Backdrop */}
      <div onClick={onCancel} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 348 }} />

      {/* Bottom sheet */}
      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 350,
        background: 'linear-gradient(180deg, #1a2035, #121828)',
        borderRadius: '20px 20px 0 0',
        maxHeight: '92dvh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 -4px 40px rgba(0,0,0,0.5)',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px 12px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Miniatura da foto */}
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Foto da refeição"
                style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
              />
            )}
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>
                O que eu identifiquei
              </div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 }}>
                Ajuste as gramas e confirme
              </div>
            </div>
          </div>
          <button
            onClick={onCancel}
            style={{
              background: 'rgba(255,255,255,0.06)', border: 'none',
              color: 'rgba(255,255,255,0.5)', fontSize: 20,
              width: 34, height: 34, borderRadius: '50%',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            aria-label="Cancelar"
          >×</button>
        </div>

        {/* Conteúdo scrollável */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>

          {/* Seleção de refeição */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 6, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Refeição
            </div>
            <select
              value={selectedMeal}
              onChange={e => setSelectedMeal(e.target.value as MealKey)}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.07)',
                border: selectedMeal ? '1px solid rgba(124,92,255,0.4)' : '1px solid rgba(239,68,68,0.5)',
                borderRadius: 10, color: selectedMeal ? '#fff' : 'rgba(255,255,255,0.4)',
                fontSize: 14, padding: '10px 14px',
                outline: 'none', appearance: 'none', cursor: 'pointer',
              }}
            >
              <option value="" disabled style={{ background: '#1a2035' }}>Selecione a refeição...</option>
              {MEAL_ORDER.map(key => (
                <option key={key} value={key} style={{ background: '#1a2035' }}>{MEAL_LABELS[key]}</option>
              ))}
            </select>
          </div>

          {/* Lista de itens detectados */}
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 8, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Alimentos detectados
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {items.map((item, i) => {
              const grams = parseFloat(gramsMap[i]) || 0
              const m = calcMacros(item, grams)
              const lowConf = item.confidence < 0.70
              const isAltOpen = altOpen[i]

              return (
                <div
                  key={i}
                  style={{
                    background: lowConf ? 'rgba(251,191,36,0.05)' : 'rgba(255,255,255,0.05)',
                    border: lowConf ? '1px solid rgba(251,191,36,0.3)' : '1px solid transparent',
                    borderRadius: 12, padding: '12px 14px',
                  }}
                >
                  {/* Linha 1: nome + badge + gramas + remover */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, flexWrap: 'wrap' }}>
                        {lowConf && <span style={{ fontSize: 14 }}>⚠️</span>}
                        <span style={{ color: '#fff', fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.nome}
                        </span>
                      </div>
                      {estimatingIdx.has(i) ? (
                        <div style={{ color: '#fbbf24', fontSize: 11 }}>
                          ⏳ estimando macros...
                        </div>
                      ) : estimateFailedIdx.has(i) ? (
                        <div style={{ color: 'rgba(239,68,68,0.7)', fontSize: 11 }}>
                          ⚠️ macros zerados — ajuste manualmente
                        </div>
                      ) : (
                        <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>
                          P {m.p}g · C {m.c}g · G {m.g}g · {m.kcal}kcal
                        </div>
                      )}
                    </div>

                    {/* Input gramas */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                      <input
                        type="number" min="1" max="2000"
                        value={gramsMap[i]}
                        onChange={e => handleGramsChange(i, e.target.value)}
                        style={{
                          width: 64, background: 'rgba(255,255,255,0.08)',
                          border: '1px solid rgba(255,255,255,0.12)',
                          borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 600,
                          padding: '6px 8px', outline: 'none', textAlign: 'right',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      />
                      <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>g</span>
                    </div>

                    {/* Botão remover */}
                    <button
                      onClick={() => handleRemoveItem(i)}
                      style={{
                        background: 'rgba(255,255,255,0.06)', border: 'none',
                        color: 'rgba(255,255,255,0.4)', fontSize: 16,
                        width: 28, height: 28, borderRadius: '50%',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}
                      aria-label="Remover item"
                    >×</button>
                  </div>

                  {/* Alternativas (só para itens com baixa confiança) */}
                  {lowConf && item.alternatives.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <button
                        onClick={() => setAltOpen(prev => ({ ...prev, [i]: !prev[i] }))}
                        style={{
                          background: 'rgba(251,191,36,0.1)',
                          border: '1px solid rgba(251,191,36,0.25)',
                          borderRadius: 8, padding: '5px 10px',
                          color: '#fbbf24', fontSize: 12, fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {isAltOpen ? 'Fechar ▴' : 'Não é isso? Trocar ▾'}
                      </button>

                      {isAltOpen && (
                        <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {item.alternatives.map((alt, ai) => (
                            <button
                              key={ai}
                              onClick={() => handleSwapAlternative(i, alt)}
                              style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 8, padding: '8px 12px',
                                color: '#fff', fontSize: 13,
                                cursor: 'pointer', textAlign: 'left',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                              }}
                            >
                              <span>{alt.nome}</span>
                              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>
                                {alt.kcalPer100}kcal/100g
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}

            {/* Botão adicionar item livre */}
            {addExtra?.idx === -1 ? (
              <AddExtraInput
                placeholder="Nome do alimento..."
                onAdd={handleAddExtra}
                onCancel={() => setAddExtra(null)}
              />
            ) : (
              <button
                onClick={() => setAddExtra({ idx: -1, text: '' })}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px dashed rgba(255,255,255,0.15)',
                  borderRadius: 12, padding: '10px 14px',
                  color: 'rgba(255,255,255,0.5)', fontSize: 13,
                  cursor: 'pointer', textAlign: 'left',
                }}
              >
                + Adicionar outro alimento
              </button>
            )}
          </div>

          {/* ── Checklist ingredientes ocultos ── */}
          <div style={{
            background: 'rgba(124,92,255,0.06)',
            border: '1px solid rgba(124,92,255,0.2)',
            borderRadius: 12, padding: '12px 14px', marginBottom: 16,
          }}>
            <div style={{ color: '#a78bfa', fontSize: 12, fontWeight: 700, marginBottom: 10, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              💡 Tem algo que não aparece na foto?
            </div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 10, lineHeight: 1.4 }}>
              Molhos, recheios e temperos costumam ser esquecidos — adicione para ter uma estimativa mais precisa.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {HIDDEN_ITEMS.map((hi, idx) => (
                <div key={idx}>
                  {addExtra?.idx === idx ? (
                    <AddExtraInput
                      placeholder={hi.label}
                      onAdd={handleAddExtra}
                      onCancel={() => setAddExtra(null)}
                    />
                  ) : (
                    <button
                      onClick={() => setAddExtra({ idx, text: hi.label })}
                      style={{
                        width: '100%', background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 8, padding: '8px 12px',
                        color: 'rgba(255,255,255,0.7)', fontSize: 13,
                        cursor: 'pointer', textAlign: 'left',
                        display: 'flex', alignItems: 'center', gap: 8,
                      }}
                    >
                      <span>{hi.icon}</span>
                      <span style={{ flex: 1 }}>{hi.label}</span>
                      <span style={{ color: 'rgba(124,92,255,0.8)', fontSize: 18, lineHeight: 1 }}>+</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Totalizador */}
          <div style={{
            background: 'rgba(124,92,255,0.08)',
            border: '1px solid rgba(124,92,255,0.2)',
            borderRadius: 12, padding: '12px 16px', marginBottom: 4,
          }}>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 8 }}>
              Total desta refeição
            </div>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'space-between' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'var(--pColor, #f87171)', fontSize: 16, fontWeight: 700 }}>{totals.p}g</div>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>Prot</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'var(--cColor, #fbbf24)', fontSize: 16, fontWeight: 700 }}>{totals.c}g</div>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>Carbo</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'var(--gColor, #34d399)', fontSize: 16, fontWeight: 700 }}>{totals.g}g</div>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>Gord</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>{totals.kcal}</div>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>kcal</div>
              </div>
            </div>
          </div>

          {/* Link "Não ficou certo?" */}
          <button
            onClick={onDescribeByText}
            style={{
              background: 'none', border: 'none',
              color: 'rgba(255,255,255,0.35)', fontSize: 13,
              cursor: 'pointer', padding: '8px 0', width: '100%', textAlign: 'center',
            }}
          >
            🔍 Não ficou certo? Descreva por texto
          </button>
        </div>

        {/* Rodapé fixo */}
        <div style={{
          padding: '12px 16px',
          paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', gap: 10, flexShrink: 0,
        }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '13px', borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            style={{
              flex: 2, padding: '13px', borderRadius: 12, border: 'none',
              background: canConfirm
                ? 'linear-gradient(135deg, #7c5cff, #6144e0)'
                : 'rgba(255,255,255,0.06)',
              color: canConfirm ? '#fff' : 'rgba(255,255,255,0.3)',
              fontSize: 14, fontWeight: 700,
              cursor: canConfirm ? 'pointer' : 'not-allowed',
              transition: 'background 0.2s',
            }}
          >
            Confirmar e salvar
          </button>
        </div>
      </div>
    </>
  )
}

// ─── Sub-componente: input inline para adicionar item extra ──────────────────

function AddExtraInput({ placeholder, onAdd, onCancel }: {
  placeholder: string
  onAdd: (text: string) => void
  onCancel: () => void
}) {
  const [val, setVal] = useState('')
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      <input
        autoFocus
        type="text"
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') onAdd(val); if (e.key === 'Escape') onCancel() }}
        placeholder={placeholder}
        style={{
          flex: 1, background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(124,92,255,0.4)',
          borderRadius: 8, color: '#fff', fontSize: 13,
          padding: '8px 10px', outline: 'none',
        }}
      />
      <button
        onClick={() => onAdd(val)}
        style={{
          background: 'linear-gradient(135deg, #7c5cff, #6144e0)',
          border: 'none', borderRadius: 8,
          color: '#fff', fontSize: 13, fontWeight: 700,
          padding: '8px 12px', cursor: 'pointer',
        }}
      >OK</button>
      <button
        onClick={onCancel}
        style={{
          background: 'rgba(255,255,255,0.06)', border: 'none',
          borderRadius: 8, color: 'rgba(255,255,255,0.4)',
          fontSize: 18, width: 32, height: 32,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >×</button>
    </div>
  )
}

// Necessário para evitar warning de unused import (calcKcalAuto usado indiretamente via handleAddExtra macros zerados)
void calcKcalAuto
