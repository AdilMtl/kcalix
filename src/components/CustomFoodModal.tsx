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

  const inputStyle: React.CSSProperties = {
    width: '100%',
    border: 0,
    outline: 'none',
    background: 'transparent',
    color: 'var(--text)',
    fontFamily: 'var(--font)',
    fontSize: '15px',
    fontWeight: 700,
    minHeight: '28px',
    boxSizing: 'border-box',
  }

  const formRowStyle: React.CSSProperties = {
    background: 'rgba(0,0,0,.12)',
    border: '1px solid var(--line)',
    borderRadius: 'var(--radius-sm)',
    padding: '10px 12px 8px',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '11px',
    color: 'var(--text3)',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '.3px',
    marginBottom: '2px',
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
        style={{
          position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 61,
          maxWidth: '600px', margin: '0 auto',
          background: 'linear-gradient(180deg, #1a2035, #121828)',
          border: '1px solid var(--line)', borderBottom: 'none',
          borderRadius: '20px 20px 0 0',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div style={{ width: '36px', height: '4px', background: 'rgba(255,255,255,.15)', borderRadius: '999px', margin: '10px auto 6px' }} />

        {/* Header */}
        <div style={{ padding: '8px 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--line)' }}>
          <b style={{ fontSize: '15px', color: 'var(--text)' }}>{initialValues ? '✏️ Editar alimento' : '➕ Alimento personalizado'}</b>
          <button
            onClick={onClose}
            style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid var(--line)', background: 'var(--surface2)', color: 'var(--text2)', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font)' }}
          >✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: '14px 16px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {/* Nome — ocupa as 2 colunas */}
            <div style={{ ...formRowStyle, gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Nome</label>
              <input
                style={inputStyle}
                placeholder="Ex: Barra de cereal"
                value={nome}
                onChange={e => { setNome(e.target.value); setErro('') }}
                autoFocus
              />
            </div>

            <div style={formRowStyle}>
              <label style={labelStyle}>Porção</label>
              <input style={inputStyle} placeholder="Ex: 1 un (25g)" value={porcao} onChange={e => setPorcao(e.target.value)} />
            </div>

            <div style={formRowStyle}>
              <label style={labelStyle}>Proteína (g)</label>
              <input style={inputStyle} inputMode="decimal" placeholder="0" value={p} onChange={e => handleMacroChange(setP, 'p', e.target.value)} />
            </div>

            <div style={formRowStyle}>
              <label style={labelStyle}>Carbo (g)</label>
              <input style={inputStyle} inputMode="decimal" placeholder="0" value={c} onChange={e => handleMacroChange(setC, 'c', e.target.value)} />
            </div>

            <div style={formRowStyle}>
              <label style={labelStyle}>Gordura (g)</label>
              <input style={inputStyle} inputMode="decimal" placeholder="0" value={g} onChange={e => handleMacroChange(setG, 'g', e.target.value)} />
            </div>

            <div style={{ ...formRowStyle, gridColumn: '1 / -1' }}>
              <label style={{ ...labelStyle, display: 'flex', justifyContent: 'space-between' }}>
                <span>kcal</span>
                {kcalManual && <span style={{ fontWeight: 600, color: 'var(--accent2)', textTransform: 'none', letterSpacing: 0 }} onClick={() => { setKcalManual(false); setKcal(calcKcal(p, c, g)) }}>↺ recalcular</span>}
              </label>
              <input
                style={inputStyle}
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
            style={{ opacity: saving ? 0.6 : 1,
              width: '100%', marginTop: '12px',
              padding: '14px', borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(124,92,255,.3)',
              background: 'linear-gradient(135deg, var(--accent), rgba(124,92,255,.6))',
              color: '#fff', fontFamily: 'var(--font)', fontSize: '14px', fontWeight: 700,
              cursor: 'pointer',
            }}
          >{saving ? 'Salvando...' : initialValues ? 'Salvar alterações' : 'Salvar alimento'}</button>
        </div>
      </div>
    </>
  )
}
