import { useState } from 'react'
import type { FoodItem } from '../data/foodDb'

type FoodPayload = Omit<FoodItem, 'id'>

interface CustomFoodModalProps {
  onSave: (food: Omit<FoodItem, 'id'>) => Promise<void>
  onClose: () => void
  initialValues?: Omit<FoodItem, 'id'>
}

function clamp(val: string): number {
  const n = parseFloat(val.replace(',', '.'))
  return isNaN(n) || n < 0 ? 0 : Math.round(n * 10) / 10
}

function calcKcal(p: string, c: string, g: string): string {
  const pv = clamp(p), cv = clamp(c), gv = clamp(g)
  if (pv === 0 && cv === 0 && gv === 0) return ''
  return String(Math.round(pv * 4 + cv * 4 + gv * 9))
}

export default function CustomFoodModal({ onSave, onClose, initialValues }: CustomFoodModalProps) {
  const [nome, setNome] = useState(initialValues?.nome ?? '')
  const [porcao, setPorcao] = useState(initialValues?.porcao ?? '')
  const [p, setP] = useState(initialValues ? String(initialValues.p) : '')
  const [c, setC] = useState(initialValues ? String(initialValues.c) : '')
  const [g, setG] = useState(initialValues ? String(initialValues.g) : '')
  const [kcal, setKcal] = useState(initialValues ? String(initialValues.kcal) : '')
  const [kcalManual, setKcalManual] = useState(false)
  const [erro, setErro] = useState('')
  const [saving, setSaving] = useState(false)

  const handleMacroChange = (setter: (v: string) => void, field: 'p' | 'c' | 'g', val: string) => {
    setter(val)
    if (!kcalManual) {
      const newP = field === 'p' ? val : p
      const newC = field === 'c' ? val : c
      const newG = field === 'g' ? val : g
      setKcal(calcKcal(newP, newC, newG))
    }
  }

  const handleSave = async () => {
    const nomeTrim = nome.trim()
    if (!nomeTrim) { setErro('Informe o nome do alimento.'); return }

    const food: FoodPayload = {
      nome:    nomeTrim,
      porcao:  porcao.trim() || '1 porção',
      porcaoG: 0,
      p:       clamp(p),
      c:       clamp(c),
      g:       clamp(g),
      kcal:    clamp(kcal),
    }
    try {
      setSaving(true)
      await onSave(food)
    } catch {
      setErro('Erro ao salvar. Tente novamente.')
      setSaving(false)
    }
  }

  return (
    <>
      {/* Overlay */}
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,.6)' }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="food-sheet custom"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="food-grip" />

        {/* Header */}
        <div className="food-sheet-header" style={{ paddingTop: '8px' }}>
          <b className="food-sheet-title">{initialValues ? 'Editar alimento' : 'Alimento personalizado'}</b>
          <button
            onClick={onClose}
            className="food-close-btn"
          >✕</button>
        </div>

        {/* Body */}
        <div className="food-custom-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {/* Nome — ocupa as 2 colunas */}
            <div className="food-field-row" style={{ gridColumn: '1 / -1' }}>
              <label className="food-field-label">Nome</label>
              <input
                className="food-field-input"
                placeholder="Ex: Barra de cereal"
                value={nome}
                onChange={e => { setNome(e.target.value); setErro('') }}
                autoFocus
              />
            </div>

            <div className="food-field-row">
              <label className="food-field-label">Porção</label>
              <input className="food-field-input" placeholder="Ex: 1 un (25g)" value={porcao} onChange={e => setPorcao(e.target.value)} />
            </div>

            <div className="food-field-row">
              <label className="food-field-label">Proteína (g)</label>
              <input className="food-field-input" inputMode="decimal" placeholder="0" value={p} onChange={e => handleMacroChange(setP, 'p', e.target.value)} />
            </div>

            <div className="food-field-row">
              <label className="food-field-label">Carbo (g)</label>
              <input className="food-field-input" inputMode="decimal" placeholder="0" value={c} onChange={e => handleMacroChange(setC, 'c', e.target.value)} />
            </div>

            <div className="food-field-row">
              <label className="food-field-label">Gordura (g)</label>
              <input className="food-field-input" inputMode="decimal" placeholder="0" value={g} onChange={e => handleMacroChange(setG, 'g', e.target.value)} />
            </div>

            <div className="food-field-row" style={{ gridColumn: '1 / -1' }}>
              <label className="food-field-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>kcal</span>
                {kcalManual && <span style={{ fontWeight: 700, color: 'var(--ember)', textTransform: 'none', letterSpacing: 0 }} onClick={() => { setKcalManual(false); setKcal(calcKcal(p, c, g)) }}>recalcular</span>}
              </label>
              <input
                className="food-field-input"
                inputMode="decimal"
                placeholder="calculado automaticamente"
                value={kcal}
                onChange={e => { setKcalManual(true); setKcal(e.target.value) }}
              />
            </div>
          </div>

          {erro && (
            <p style={{ fontSize: '12px', color: 'var(--bad)', marginTop: '8px', fontWeight: 600 }}>{erro}</p>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="food-primary-btn"
            style={{ opacity: saving ? 0.6 : 1, marginTop: '12px' }}
          >{saving ? 'Salvando...' : initialValues ? 'Salvar alterações' : 'Salvar alimento'}</button>
        </div>
      </div>
    </>
  )
}
