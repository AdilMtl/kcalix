import { useState } from 'react'
import { MEAL_LABELS } from '../hooks/useDiary'
import type { FoodItem } from '../data/foodDb'
import type { MealKey, FoodEntry } from '../hooks/useDiary'

interface FoodPortionModalProps {
  food: FoodItem
  onAddFood: (meal: MealKey, entry: FoodEntry) => void
  onClose: () => void   // confirma e fecha tudo
  onCancel: () => void  // volta para o drawer
}

function round1(n: number) { return Math.round(n * 10) / 10 }

const MEAL_ORDER: MealKey[] = ['cafe', 'lanche1', 'almoco', 'lanche2', 'jantar', 'ceia']

export default function FoodPortionModal({ food, onAddFood, onClose, onCancel }: FoodPortionModalProps) {
  const [qty, setQty] = useState(1)
  const [selectedMeal, setSelectedMeal] = useState<MealKey>('almoco')

  function clamp(v: number) { return Math.max(0.1, round1(v)) }

  const p    = round1(food.p    * qty)
  const c    = round1(food.c    * qty)
  const g    = round1(food.g    * qty)
  const kcal = Math.round(food.kcal * qty)

  function handleAdd() {
    const entry: FoodEntry = {
      foodId: food.id,
      nome: food.nome,
      qty,
      porcaoG: food.porcaoG * qty,
      p, c, g, kcal,
      at: new Date().toISOString(),
    }
    onAddFood(selectedMeal, entry)
    onClose()
  }

  return (
    <>
      {/* Backdrop — sobre o drawer */}
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 62, background: 'rgba(0,0,0,0.6)' }}
        onClick={onCancel}
      />

      {/* Bottom sheet */}
      <div
        className="food-sheet portion"
        style={{ maxHeight: '85vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="food-grip" />

        {/* Header */}
        <div className="food-sheet-header" style={{ paddingTop: '8px' }}>
          <b className="food-sheet-title">{food.nome}</b>
          <button onClick={onCancel} className="food-close-btn">✕</button>
        </div>

        {/* Body */}
        <div className="food-portion-body">

          {/* Porção label */}
          <div style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text3)', fontWeight: 600, marginBottom: '8px' }}>
            {food.porcao} × {qty}
          </div>

          {/* Qty row */}
          <div className="food-qty-row">
            {([{ label: '−.5', delta: -0.5 }, { label: '−.1', delta: -0.1 }] as { label: string; delta: number }[]).map(({ label, delta }) => (
              <button key={label} onClick={() => setQty(q => clamp(q + delta))} className="food-step-btn">{label}</button>
            ))}
            <input
              type="number" min="0.1" step="0.1" inputMode="decimal" value={qty}
              onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v) && v > 0) setQty(clamp(v)) }}
              className="food-qty-input"
            />
            {([{ label: '+.1', delta: 0.1 }, { label: '+.5', delta: 0.5 }] as { label: string; delta: number }[]).map(({ label, delta }) => (
              <button key={label} onClick={() => setQty(q => clamp(q + delta))} className="food-step-btn">{label}</button>
            ))}
          </div>

          {/* Macro boxes */}
          <div className="food-macro-grid">
            {([
              { label: 'Prot',  value: `${p}g`,      color: 'var(--pColor)' },
              { label: 'Carbo', value: `${c}g`,      color: 'var(--cColor)' },
              { label: 'Gord',  value: `${g}g`,      color: 'var(--gColor)' },
              { label: 'kcal',  value: String(kcal), color: 'var(--ember)' },
            ]).map(({ label, value, color }) => (
              <div key={label} className="food-macro-box">
                <div className="food-macro-num" style={{ color }}>{value}</div>
                <div className="food-macro-label">{label}</div>
              </div>
            ))}
          </div>

          {/* Seleção de refeição */}
          <p style={{ fontSize: '11px', color: 'var(--text3)', lineHeight: 1.4, marginBottom: '6px' }}>Adicionar à refeição:</p>
          <div className="food-meal-chips">
            {MEAL_ORDER.map(meal => (
              <button
                key={meal}
                onClick={() => setSelectedMeal(meal)}
                className={`food-meal-chip${selectedMeal === meal ? ' active' : ''}`}
              >
                {MEAL_LABELS[meal]}
              </button>
            ))}
          </div>

          {/* Botão Adicionar */}
          <div style={{ height: '12px' }} />
          <button
            onClick={handleAdd}
            className="food-primary-btn"
          >
            Adicionar
          </button>
        </div>
      </div>
    </>
  )
}
