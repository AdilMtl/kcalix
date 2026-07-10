import { useState, useMemo } from 'react'
import type { PendingLog, PendingLogItem } from '../hooks/useAiChat'
import { MEAL_LABELS } from '../hooks/useDiary'
import type { MealKey } from '../hooks/useDiary'

// Mesma fórmula do CustomFoodModal
function calcKcalAuto(p: number, c: number, g: number): number {
  return Math.round(p * 4 + c * 4 + g * 9)
}

const MEAL_ORDER: MealKey[] = ['cafe', 'lanche1', 'almoco', 'lanche2', 'jantar', 'ceia']

interface Props {
  pendingLog: PendingLog
  onConfirm: (meal: MealKey, items: PendingLogItem[]) => void
  onCancel: () => void
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

// Estado de macros editáveis para itens custom
interface CustomMacros { p: string; c: string; g: string }

export function AiLogConfirmModal({ pendingLog, onConfirm, onCancel }: Props) {
  const [gramsMap, setGramsMap] = useState<Record<number, string>>(() => {
    const init: Record<number, string> = {}
    pendingLog.items.forEach((item, i) => { init[i] = String(item.grams) })
    return init
  })

  // Macros editáveis para itens custom (por 100g)
  const [customMacros, setCustomMacros] = useState<Record<number, CustomMacros>>(() => {
    const init: Record<number, CustomMacros> = {}
    pendingLog.items.forEach((item, i) => {
      if (item.source === 'custom') {
        init[i] = {
          p: String(item.pPer100),
          c: String(item.cPer100),
          g: String(item.gPer100),
        }
      }
    })
    return init
  })

  const [selectedMeal, setSelectedMeal] = useState<MealKey | ''>(
    (pendingLog.meal as MealKey | null) ?? ''
  )

  function handleCustomMacroChange(idx: number, field: 'p' | 'c' | 'g', val: string) {
    setCustomMacros(prev => ({ ...prev, [idx]: { ...prev[idx], [field]: val } }))
  }

  // Resolve macros por 100g para um item (custom usa estado editável)
  function resolveItem(item: PendingLogItem, i: number): PendingLogItem {
    if (item.source !== 'custom') return item
    const cm = customMacros[i]
    if (!cm) return item
    const p = parseFloat(cm.p) || 0
    const c = parseFloat(cm.c) || 0
    const g = parseFloat(cm.g) || 0
    return { ...item, pPer100: p, cPer100: c, gPer100: g, kcalPer100: calcKcalAuto(p, c, g) }
  }

  // Totais calculados em tempo real
  const totals = useMemo(() => {
    let p = 0, c = 0, g = 0, kcal = 0
    pendingLog.items.forEach((item, i) => {
      const resolved = resolveItem(item, i)
      const grams = parseFloat(gramsMap[i]) || 0
      const m = calcMacros(resolved, grams)
      p += m.p; c += m.c; g += m.g; kcal += m.kcal
    })
    return {
      p:    Math.round(p * 10) / 10,
      c:    Math.round(c * 10) / 10,
      g:    Math.round(g * 10) / 10,
      kcal: Math.round(kcal),
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gramsMap, customMacros, pendingLog.items])

  function handleGramsChange(idx: number, val: string) {
    setGramsMap(prev => ({ ...prev, [idx]: val }))
  }

  function handleConfirm() {
    if (!selectedMeal) return
    const updatedItems = pendingLog.items.map((item, i) => {
      const resolved = resolveItem(item, i)
      return {
        ...resolved,
        grams: parseFloat(gramsMap[i]) || item.grams,
      }
    })
    onConfirm(selectedMeal as MealKey, updatedItems)
  }

  const canConfirm = selectedMeal !== ''

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onCancel}
        className="ai-food-overlay"
      />

      {/* Bottom sheet */}
      <div
        className="ai-food-sheet"
      >
        {/* Header */}
        <div className="ai-food-header">
          <div>
            <div className="ai-food-title">
              Confirmar alimentos
            </div>
            <div className="ai-food-subtitle">
              Ajuste as gramas antes de salvar
            </div>
          </div>
          <button
            onClick={onCancel}
            className="ai-food-close"
            aria-label="Cancelar"
          >
            ×
          </button>
        </div>

        {/* Conteúdo scrollável */}
        <div className="ai-food-body">

          {/* Seleção de refeição */}
          <div style={{ marginBottom: 16 }}>
            <div className="ai-food-label" style={{ marginBottom: 6 }}>
              Refeição
            </div>
            <select
              value={selectedMeal}
              onChange={e => setSelectedMeal(e.target.value as MealKey)}
              className={`ai-food-select${selectedMeal ? ' valid' : ' invalid'}`}
            >
              <option value="" disabled style={{ background: 'var(--surface)' }}>
                Selecione a refeição...
              </option>
              {MEAL_ORDER.map(key => (
                <option key={key} value={key} style={{ background: 'var(--surface)' }}>
                  {MEAL_LABELS[key]}
                </option>
              ))}
            </select>
            {!selectedMeal && (
              <div style={{ color: 'rgba(239,68,68,0.8)', fontSize: 12, marginTop: 4 }}>
                Obrigatório
              </div>
            )}
          </div>

          {/* Lista de itens */}
          <div className="ai-food-label" style={{ marginBottom: 8 }}>
            Alimentos detectados
          </div>
          <div className="ai-food-list">
            {pendingLog.items.map((item, i) => {
              const resolved = resolveItem(item, i)
              const grams = parseFloat(gramsMap[i]) || 0
              const m = calcMacros(resolved, grams)
              const isCustom = item.source === 'custom'
              const cm = customMacros[i]
              return (
                <div
                  key={i}
                  className={`ai-food-row${isCustom ? ' custom' : ''}`}
                >
                  {/* Linha 1: nome + badge + gramas */}
                  <div className="ai-food-item-main">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                        <span className="ai-food-name">
                          {item.nome}
                        </span>
                        {isCustom && (
                          <span className="ai-food-badge">
                            Novo
                          </span>
                        )}
                      </div>
                      <div className="ai-food-macro-line">
                        P {m.p}g · C {m.c}g · G {m.g}g · {m.kcal}kcal
                      </div>
                    </div>

                    {/* Input de gramas */}
                    <div className="ai-food-grams">
                      <input
                        type="number"
                        min="1"
                        max="2000"
                        value={gramsMap[i]}
                        onChange={e => handleGramsChange(i, e.target.value)}
                        className="ai-food-input"
                      />
                      <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>g</span>
                    </div>
                  </div>

                  {/* Linha 2: macros editáveis (só para itens custom) */}
                  {isCustom && cm && (
                    <div className="ai-custom-grid">
                      {(['p', 'c', 'g'] as const).map(field => {
                        const colors = { p: 'var(--pColor)', c: 'var(--cColor)', g: 'var(--gColor)' }
                        const labels = { p: 'Prot (g/100g)', c: 'Carbo (g/100g)', g: 'Gord (g/100g)' }
                        return (
                          <div key={field} className="ai-custom-field">
                            <div style={{ color: colors[field], fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 3 }}>
                              {labels[field]}
                            </div>
                            <input
                              type="number"
                              min="0"
                              step="0.1"
                              value={cm[field]}
                              onChange={e => handleCustomMacroChange(i, field, e.target.value)}
                            />
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Totalizador */}
          <div className="ai-total-panel" style={{ marginBottom: 4 }}>
            <div className="ai-food-label" style={{ marginBottom: 8 }}>
              Total desta refeição
            </div>
            <div className="ai-total-grid">
              <div className="ai-total-item">
                <div className="ai-total-num" style={{ color: 'var(--pColor)' }}>{totals.p}g</div>
                <div className="ai-total-label">Prot</div>
              </div>
              <div className="ai-total-item">
                <div className="ai-total-num" style={{ color: 'var(--cColor)' }}>{totals.c}g</div>
                <div className="ai-total-label">Carbo</div>
              </div>
              <div className="ai-total-item">
                <div className="ai-total-num" style={{ color: 'var(--gColor)' }}>{totals.g}g</div>
                <div className="ai-total-label">Gord</div>
              </div>
              <div className="ai-total-item">
                <div className="ai-total-num" style={{ color: 'var(--ember)' }}>{totals.kcal}</div>
                <div className="ai-total-label">kcal</div>
              </div>
            </div>
          </div>
        </div>

        {/* Botões fixos no rodapé */}
        <div className="ai-food-footer">
          <button
            onClick={onCancel}
            className="ai-food-secondary"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="ai-food-primary"
          >
            Confirmar e salvar
          </button>
        </div>
      </div>
    </>
  )
}
