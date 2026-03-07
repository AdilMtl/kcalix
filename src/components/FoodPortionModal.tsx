import { useState } from 'react'
import { useDiary } from '../hooks/useDiary'
import type { FoodItem } from '../data/foodDb'
import type { MealKey, FoodEntry } from '../hooks/useDiary'

interface FoodPortionModalProps {
  food: FoodItem
  meal: MealKey
  onClose: () => void   // confirma e fecha tudo
  onCancel: () => void  // volta para o drawer
}

function round1(n: number) { return Math.round(n * 10) / 10 }

export default function FoodPortionModal({ food, meal, onClose, onCancel }: FoodPortionModalProps) {
  const { addFood } = useDiary()
  const [qty, setQty] = useState(1)
  const [saving, setSaving] = useState(false)

  function clamp(v: number) { return Math.max(1, Math.round(v)) }

  const p    = round1(food.p    * qty)
  const c    = round1(food.c    * qty)
  const g    = round1(food.g    * qty)
  const kcal = Math.round(food.kcal * qty)

  async function handleAdd() {
    setSaving(true)
    const entry: FoodEntry = {
      foodId: food.id,
      nome: food.nome,
      qty,
      porcaoG: food.porcaoG * qty,
      p,
      c,
      g,
      kcal,
      at: new Date().toISOString(),
    }
    try {
      await addFood(meal, entry)
      onClose()
    } catch (err) {
      console.error('addFood:', err)
      setSaving(false)
    }
  }

  return (
    <>
      {/* Backdrop sobre o drawer */}
      <div
        className="fixed inset-0 z-60 flex items-end justify-center"
        style={{ background: 'rgba(0,0,0,0.5)' }}
        onClick={onCancel}
      />

      {/* Modal centralizado */}
      <div
        className="fixed left-4 right-4 z-60 flex flex-col gap-4 rounded-2xl p-5"
        style={{
          bottom: 'calc(env(safe-area-inset-bottom) + 16px)',
          background: 'var(--bg)',
          border: '1px solid var(--line)',
          boxShadow: 'var(--shadow)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Nome e porção base */}
        <div>
          <p className="font-semibold" style={{ color: 'var(--text)' }}>{food.nome}</p>
          <p className="text-xs" style={{ color: 'var(--text3)' }}>
            Porção base: {food.porcao} — {food.kcal} kcal
          </p>
        </div>

        {/* Controle de quantidade */}
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm" style={{ color: 'var(--text2)' }}>Quantidade</p>
          <div className="flex items-center gap-2">
            {[{ label: '−5', delta: -5 }, { label: '−1', delta: -1 }].map(({ label, delta }) => (
              <button
                key={label}
                onClick={() => setQty(q => clamp(q + delta))}
                className="flex h-8 w-10 items-center justify-center rounded-lg text-xs font-semibold transition-opacity active:opacity-60"
                style={{ background: 'var(--surface2)', color: 'var(--text2)' }}
              >
                {label}
              </button>
            ))}

            <span
              className="w-10 text-center text-lg font-bold tabular-nums"
              style={{ color: 'var(--text)' }}
            >
              {qty}
            </span>

            {[{ label: '+1', delta: 1 }, { label: '+5', delta: 5 }].map(({ label, delta }) => (
              <button
                key={label}
                onClick={() => setQty(q => clamp(q + delta))}
                className="flex h-8 w-10 items-center justify-center rounded-lg text-xs font-semibold transition-opacity active:opacity-60"
                style={{ background: 'var(--surface2)', color: 'var(--text2)' }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Preview de macros */}
        <div
          className="flex justify-between rounded-xl px-4 py-3"
          style={{ background: 'var(--surface2)' }}
        >
          {[
            { label: 'Kcal', value: String(kcal), color: 'var(--text)' },
            { label: 'P', value: `${p}g`, color: 'var(--good)' },
            { label: 'C', value: `${c}g`, color: 'var(--warn)' },
            { label: 'G', value: `${g}g`, color: 'var(--bad)' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex flex-col items-center gap-0.5">
              <p className="text-sm font-bold tabular-nums" style={{ color }}>{value}</p>
              <p className="text-[10px]" style={{ color: 'var(--text3)' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Botões */}
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl py-3 text-sm font-medium transition-opacity active:opacity-60"
            style={{ background: 'var(--surface2)', color: 'var(--text2)' }}
          >
            Voltar
          </button>
          <button
            onClick={handleAdd}
            disabled={saving}
            className="flex-1 rounded-xl py-3 text-sm font-semibold transition-opacity active:opacity-60 disabled:opacity-50"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            {saving ? 'Salvando...' : 'Adicionar'}
          </button>
        </div>
      </div>
    </>
  )
}
