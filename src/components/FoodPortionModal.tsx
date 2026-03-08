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
        style={{
          position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 63,
          maxWidth: '600px', margin: '0 auto',
          background: 'linear-gradient(180deg, #1a2035, #121828)',
          border: '1px solid var(--line)', borderBottom: 'none',
          borderRadius: '20px 20px 0 0',
          maxHeight: '85vh', overflowY: 'auto',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div style={{ width: '36px', height: '4px', background: 'rgba(255,255,255,.15)', borderRadius: '999px', margin: '10px auto 6px' }} />

        {/* Header */}
        <div style={{ padding: '8px 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--line)' }}>
          <b style={{ fontSize: '15px', color: 'var(--text)' }}>{food.nome}</b>
          <button onClick={onCancel} style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid var(--line)', background: 'var(--surface2)', color: 'var(--text2)', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: '14px 16px 24px' }}>

          {/* Porção label */}
          <div style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text3)', fontWeight: 600, marginBottom: '8px' }}>
            {food.porcao} × {qty}
          </div>

          {/* Qty row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '12px 0' }}>
            {([{ label: '−.5', delta: -0.5 }, { label: '−.1', delta: -0.1 }] as { label: string; delta: number }[]).map(({ label, delta }) => (
              <button key={label} onClick={() => setQty(q => clamp(q + delta))} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid var(--line)', background: 'var(--surface2)', color: 'var(--text)', fontFamily: 'var(--font)', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>{label}</button>
            ))}
            <input
              type="number" min="0.1" step="0.1" inputMode="decimal" value={qty}
              onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v) && v > 0) setQty(clamp(v)) }}
              style={{ flex: 1, textAlign: 'center', fontSize: '26px', fontWeight: 800, fontVariantNumeric: 'tabular-nums', background: 'var(--surface2)', border: '1px solid var(--line)', borderRadius: '10px', color: 'var(--text)', padding: '4px 6px', fontFamily: 'var(--font)', minWidth: 0, outline: 'none' }}
            />
            {([{ label: '+.1', delta: 0.1 }, { label: '+.5', delta: 0.5 }] as { label: string; delta: number }[]).map(({ label, delta }) => (
              <button key={label} onClick={() => setQty(q => clamp(q + delta))} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid var(--line)', background: 'var(--surface2)', color: 'var(--text)', fontFamily: 'var(--font)', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>{label}</button>
            ))}
          </div>

          {/* Macro boxes */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', margin: '12px 0' }}>
            {([
              { label: 'Prot',  value: `${p}g`,      color: 'var(--pColor)' },
              { label: 'Carbo', value: `${c}g`,      color: 'var(--cColor)' },
              { label: 'Gord',  value: `${g}g`,      color: 'var(--gColor)' },
              { label: 'kcal',  value: String(kcal), color: 'var(--accent2)' },
            ]).map(({ label, value, color }) => (
              <div key={label} style={{ textAlign: 'center', padding: '8px 4px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius-xs)' }}>
                <div style={{ fontSize: '16px', fontWeight: 800, color }}>{value}</div>
                <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text3)', marginTop: '2px' }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Seleção de refeição */}
          <p style={{ fontSize: '11px', color: 'var(--text3)', lineHeight: 1.4, marginBottom: '6px' }}>Adicionar à refeição:</p>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', margin: '10px 0' }}>
            {MEAL_ORDER.map(meal => (
              <button
                key={meal}
                onClick={() => setSelectedMeal(meal)}
                style={{ padding: '8px 12px', borderRadius: 'var(--radius-xs)', border: '1px solid', borderColor: selectedMeal === meal ? 'rgba(124,92,255,.3)' : 'var(--line)', background: selectedMeal === meal ? 'linear-gradient(135deg, rgba(124,92,255,.4), rgba(124,92,255,.15))' : 'var(--surface)', color: selectedMeal === meal ? 'var(--text)' : 'var(--text2)', fontFamily: 'var(--font)', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
              >
                {MEAL_LABELS[meal]}
              </button>
            ))}
          </div>

          {/* Botão Adicionar */}
          <div style={{ height: '12px' }} />
          <button
            onClick={handleAdd}
            style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-sm)', background: 'linear-gradient(135deg, var(--accent), rgba(124,92,255,.6))', border: '1px solid rgba(124,92,255,.3)', color: '#fff', fontFamily: 'var(--font)', fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}
          >
            Adicionar
          </button>
        </div>
      </div>
    </>
  )
}
