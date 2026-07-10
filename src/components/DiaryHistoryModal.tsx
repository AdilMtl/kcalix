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
    return <span className="diary-adherence" style={{ color: 'var(--good)', background: 'color-mix(in srgb, var(--good) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--good) 26%, transparent)' }}>meta</span>
  }
  if (ratio > 1.1) {
    return <span className="diary-adherence" style={{ color: 'var(--bad)', background: 'color-mix(in srgb, var(--bad) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--bad) 26%, transparent)' }}>surplus</span>
  }
  return <span className="diary-adherence" style={{ color: 'var(--warn)', background: 'color-mix(in srgb, var(--warn) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--warn) 26%, transparent)' }}>abaixo</span>
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
      <div className="diary-history-bar">
        <div style={{ width: `${pPct}%`, height: '100%', background: 'var(--pColor)', borderRadius: '999px 0 0 999px', flexShrink: 0 }} />
        <div style={{ width: `${cPct}%`, height: '100%', background: 'var(--cColor)', flexShrink: 0 }} />
        <div style={{ width: `${gPct}%`, height: '100%', background: 'var(--gColor)', borderRadius: '0 999px 999px 0', flexShrink: 0 }} />
      </div>
      {/* legenda abaixo — centralizada */}
      <div className="diary-history-legend">
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
    let cancelled = false

    queueMicrotask(() => {
      if (cancelled) return
      setLoading(true)
      getAllDiaryRows().then(data => {
        if (cancelled) return
        setRows(data)
        setLoading(false)
      })
    })

    return () => { cancelled = true }
    // getAllDiaryRows vem do hook/página e pode mudar entre renders; o modal carrega ao abrir.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        className="diary-history-overlay"
      />

      {/* bottom sheet */}
      <div className="diary-history-sheet">
        {/* handle */}
        <div className="diary-history-grip" />

        {/* header */}
        <div className="diary-history-header2">
          <b className="diary-history-title2">Histórico de dias</b>
          <button
            type="button"
            onClick={onClose}
            className="food-close-btn"
            style={{ width: 32, height: 32, fontSize: 14 }}
          >✕</button>
        </div>

        {/* body */}
        <div className="diary-history-body">

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
                className="diary-history-row"
              >
                {/* linha superior: data + kcal + chip */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                    {formatDate(row.date)}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {t.kcal > 0 && (
                      <span className="diary-history-kcal" style={{ fontSize: 13, fontWeight: 800, color: 'var(--text2)' }}>
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
