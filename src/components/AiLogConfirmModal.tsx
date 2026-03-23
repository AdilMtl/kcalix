import { useState, useMemo } from 'react'
import type { PendingLog, PendingLogItem } from '../hooks/useAiChat'
import { MEAL_LABELS } from '../hooks/useDiary'
import type { MealKey } from '../hooks/useDiary'

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

export function AiLogConfirmModal({ pendingLog, onConfirm, onCancel }: Props) {
  // Gramas editáveis por item (índice)
  const [gramsMap, setGramsMap] = useState<Record<number, string>>(() => {
    const init: Record<number, string> = {}
    pendingLog.items.forEach((item, i) => { init[i] = String(item.grams) })
    return init
  })

  const [selectedMeal, setSelectedMeal] = useState<MealKey | ''>(
    (pendingLog.meal as MealKey | null) ?? ''
  )

  // Totais calculados em tempo real
  const totals = useMemo(() => {
    let p = 0, c = 0, g = 0, kcal = 0
    pendingLog.items.forEach((item, i) => {
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
  }, [gramsMap, pendingLog.items])

  function handleGramsChange(idx: number, val: string) {
    setGramsMap(prev => ({ ...prev, [idx]: val }))
  }

  function handleConfirm() {
    if (!selectedMeal) return
    const updatedItems = pendingLog.items.map((item, i) => ({
      ...item,
      grams: parseFloat(gramsMap[i]) || item.grams,
    }))
    onConfirm(selectedMeal as MealKey, updatedItems)
  }

  const canConfirm = selectedMeal !== ''

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onCancel}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 348,
        }}
      />

      {/* Bottom sheet */}
      <div
        style={{
          position: 'fixed', left: 0, right: 0, bottom: 0,
          zIndex: 350,
          background: 'linear-gradient(180deg, #1a2035, #121828)',
          borderRadius: '20px 20px 0 0',
          maxHeight: '88dvh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 -4px 40px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px 12px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>
              Confirmar alimentos
            </div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 }}>
              Ajuste as gramas antes de salvar
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
          >
            ×
          </button>
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
                borderRadius: 10,
                color: selectedMeal ? '#fff' : 'rgba(255,255,255,0.4)',
                fontSize: 14,
                padding: '10px 14px',
                outline: 'none',
                appearance: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="" disabled style={{ background: '#1a2035' }}>
                Selecione a refeição...
              </option>
              {MEAL_ORDER.map(key => (
                <option key={key} value={key} style={{ background: '#1a2035' }}>
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
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 8, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Alimentos detectados
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {pendingLog.items.map((item, i) => {
              const grams = parseFloat(gramsMap[i]) || 0
              const m = calcMacros(item, grams)
              return (
                <div
                  key={i}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: 12,
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  {/* Nome + macros */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: '#fff', fontSize: 14, fontWeight: 500, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.nome}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>
                      P {m.p}g · C {m.c}g · G {m.g}g · {m.kcal}kcal
                    </div>
                  </div>

                  {/* Input de gramas */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                    <input
                      type="number"
                      min="1"
                      max="2000"
                      value={gramsMap[i]}
                      onChange={e => handleGramsChange(i, e.target.value)}
                      style={{
                        width: 64,
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: 8,
                        color: '#fff',
                        fontSize: 14,
                        fontWeight: 600,
                        padding: '6px 8px',
                        outline: 'none',
                        textAlign: 'right',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    />
                    <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>g</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Totalizador */}
          <div style={{
            background: 'rgba(124,92,255,0.08)',
            border: '1px solid rgba(124,92,255,0.2)',
            borderRadius: 12,
            padding: '12px 16px',
            marginBottom: 4,
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
        </div>

        {/* Botões fixos no rodapé */}
        <div style={{
          padding: '12px 16px',
          paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          gap: 10,
          flexShrink: 0,
        }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '13px',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.6)',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            style={{
              flex: 2,
              padding: '13px',
              borderRadius: 12,
              border: 'none',
              background: canConfirm
                ? 'linear-gradient(135deg, #7c5cff, #6144e0)'
                : 'rgba(255,255,255,0.06)',
              color: canConfirm ? '#fff' : 'rgba(255,255,255,0.3)',
              fontSize: 14,
              fontWeight: 700,
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
