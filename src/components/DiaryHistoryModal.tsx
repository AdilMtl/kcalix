// DiaryHistoryModal — histórico de dias do diário
// Port + improve de: referência.index.html L3062–3072 (HTML), L5692–5757 (JS), L1678–1694 (CSS)
// Melhoria visual: barra segmentada P/C/G única (vs 3 linhas separadas do original)
// + chip de aderência à meta + navegação para o dia ao clicar

import { useState, useEffect } from 'react'
import type { DiaryData } from '../hooks/useDiary'
import { useDateStore } from '../store/dateStore'

type DiaryRow = { date: string; data: DiaryData }

type Props = {
  open: boolean
  onClose: () => void
  getAllDiaryRows: () => Promise<DiaryRow[]>
  kcalTarget: number
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR', {
    weekday: 'short', day: 'numeric', month: 'short',
  })
}

// Chip de aderência: compara kcal ingerida vs meta
function AdherenceChip({ kcal, kcalTarget }: { kcal: number; kcalTarget: number }) {
  if (kcalTarget <= 0 || kcal <= 0) return null
  const ratio = kcal / kcalTarget
  if (ratio >= 0.9 && ratio <= 1.1) {
    return <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--good)', background: 'rgba(52,211,153,.12)', border: '1px solid rgba(52,211,153,.25)', borderRadius: 4, padding: '1px 6px', flexShrink: 0 }}>✅ meta</span>
  }
  if (ratio > 1.1) {
    return <span style={{ fontSize: 10, fontWeight: 700, color: '#f87171', background: 'rgba(248,113,113,.12)', border: '1px solid rgba(248,113,113,.25)', borderRadius: 4, padding: '1px 6px', flexShrink: 0 }}>🔥 surplus</span>
  }
  return <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--warn)', background: 'rgba(251,191,36,.10)', border: '1px solid rgba(251,191,36,.25)', borderRadius: 4, padding: '1px 6px', flexShrink: 0 }}>⚠️ abaixo</span>
}

// Barra segmentada — P/C/G proporcional ao kcal total do dia
function MacroBar({ p, c, g }: { p: number; c: number; g: number }) {
  const pKcal = p * 4
  const cKcal = c * 4
  const gKcal = g * 9
  const total = pKcal + cKcal + gKcal
  if (total <= 0) return null
  const pPct = (pKcal / total) * 100
  const cPct = (cKcal / total) * 100
  const gPct = (gKcal / total) * 100
  return (
    <div style={{ marginTop: 8 }}>
      {/* barra segmentada — largura total */}
      <div style={{ width: '100%', height: 6, borderRadius: 3, overflow: 'hidden', display: 'flex', gap: 1, background: 'var(--line)' }}>
        <div style={{ width: `${pPct}%`, height: '100%', background: 'var(--pColor)', borderRadius: '3px 0 0 3px', flexShrink: 0 }} />
        <div style={{ width: `${cPct}%`, height: '100%', background: 'var(--cColor)', flexShrink: 0 }} />
        <div style={{ width: `${gPct}%`, height: '100%', background: 'var(--gColor)', borderRadius: '0 3px 3px 0', flexShrink: 0 }} />
      </div>
      {/* legenda abaixo — centralizada */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 5 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--pColor)' }}>P {Math.round(p)}g</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--cColor)' }}>C {Math.round(c)}g</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--gColor)' }}>G {Math.round(g)}g</span>
      </div>
    </div>
  )
}

export function DiaryHistoryModal({ open, onClose, getAllDiaryRows, kcalTarget }: Props) {
  const [rows, setRows] = useState<DiaryRow[]>([])
  const [loading, setLoading] = useState(false)
  const goToDate = useDateStore(s => s.goToDate)

  // Carrega lazy ao abrir
  useEffect(() => {
    if (!open) return
    setLoading(true)
    getAllDiaryRows().then(data => {
      setRows(data)
      setLoading(false)
    })
  }, [open])

  const handleDayClick = (date: string) => {
    goToDate(date)
    onClose()
  }

  if (!open) return null

  const hasMetas = kcalTarget > 0

  return (
    <>
      {/* overlay */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 310 }}
      />

      {/* bottom sheet */}
      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: 0,
        zIndex: 311,
        background: 'linear-gradient(180deg, #1a2035, #121828)',
        borderRadius: '20px 20px 0 0',
        maxHeight: '88dvh',
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
          <b style={{ fontSize: 15 }}>📋 Histórico de dias</b>
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
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 32px', display: 'flex', flexDirection: 'column', gap: 8 }}>

          {loading && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text3)', fontSize: 13 }}>
              Carregando...
            </div>
          )}

          {!loading && rows.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text3)', fontSize: 14, lineHeight: 1.6 }}>
              Nenhum dia registrado ainda.<br />
              Registre refeições para ver o histórico aqui.
            </div>
          )}

          {!loading && rows.map(row => {
            const t = row.data?.totals ?? { p: 0, c: 0, g: 0, kcal: 0 }
            return (
              <div
                key={row.date}
                onClick={() => handleDayClick(row.date)}
                style={{
                  background: 'var(--surface2)',
                  border: '1px solid var(--line)',
                  borderRadius: 12,
                  padding: '12px 14px',
                  cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                {/* linha superior: data + kcal + chip */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                    {formatDate(row.date)}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {t.kcal > 0 && (
                      <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text2)' }}>
                        ~{Math.round(t.kcal)} kcal
                      </span>
                    )}
                    {hasMetas && <AdherenceChip kcal={t.kcal} kcalTarget={kcalTarget} />}
                  </div>
                </div>

                {/* barra segmentada P/C/G */}
                <MacroBar p={t.p} c={t.c} g={t.g} />
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
