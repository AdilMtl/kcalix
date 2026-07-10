// CorpoPage — Fase 4A
// Port fiel ao original: viewCorpo (L2526–2602) + MEASURE JS (L5235–5337)
// 3 accordions: 1) Inputs do dia, 2) Dobras (opcional), 3) Histórico (últimos 14)

import { useState, useEffect } from 'react'
import { useDateStore } from '../store/dateStore'
import { useBody } from '../hooks/useBody'
import { useSettings } from '../hooks/useSettings'
import Skeleton from '../components/Skeleton'
import BodyEvolutionModal from '../components/BodyEvolutionModal'
import type { BodyMeasurement, BodyRow } from '../types/body'

// ── helpers ──────────────────────────────────────────────────────────────────

function fmt(v: number | null | undefined): string {
  if (v == null || v === 0) return '—'
  return String(v)
}

function parseNum(s: string): number | null {
  const n = parseFloat(s.replace(',', '.'))
  return isNaN(n) || n <= 0 ? null : n
}

function formatDateLabel(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function trendText(rows: BodyRow[], key: 'weightKg' | 'waistCm' | 'bfPct', unit: string): string {
  const points = rows.filter(r => r[key] != null)
  if (points.length < 2) return 'sem base'
  const diff = Number(points[0][key]) - Number(points[Math.min(points.length - 1, 6)][key])
  if (Math.abs(diff) < 0.05) return `0 ${unit}`
  return `${diff > 0 ? '+' : ''}${diff.toFixed(1)} ${unit}`
}

// ── sub-componentes internos ──────────────────────────────────────────────────

interface AccordionProps {
  id: string
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}

function Accordion({ id, title, defaultOpen = false, children }: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div id={id} className={`body-accordion${open ? ' open' : ''}`}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="body-accordion-trigger"
      >
        <span>{title}</span>
        <span className="body-accordion-chevron">▾</span>
      </button>
      <div className="body-accordion-content">
        <div className="body-accordion-inner">{children}</div>
      </div>
    </div>
  )
}

// ── FormRow ───────────────────────────────────────────────────────────────────

interface FormRowProps {
  label: string
  hint?: string
  children: React.ReactNode
}

function FormRow({ label, hint, children }: FormRowProps) {
  return (
    <div className="body-form-row">
      <label>{label}</label>
      {children}
      {hint && <small>{hint}</small>}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  fontFamily: 'var(--font-data)',
}

// ── CorpoPage ─────────────────────────────────────────────────────────────────

export default function CorpoPage() {
  const { selectedDate } = useDateStore()
  const { measurement, loading, saveMeasurement, clearMeasurement, getAllBodyRows } = useBody(selectedDate)
  const { settings, saveSettings } = useSettings()

  // form state — inputs do dia
  const [weight, setWeight]   = useState('')
  const [waist, setWaist]     = useState('')
  const [bf, setBf]           = useState('')
  const [note, setNote]       = useState('')

  // dobras (mm)
  const [chest, setChest] = useState('')
  const [ax, setAx]       = useState('')
  const [tri, setTri]     = useState('')
  const [sub, setSub]     = useState('')
  const [ab, setAb]       = useState('')
  const [sup, setSup]     = useState('')
  const [th, setTh]       = useState('')

  // histórico
  const [rows, setRows]     = useState<BodyRow[]>([])
  const [toast, setToast]   = useState('')
  const [chartOpen, setChartOpen] = useState(false)

  // preenche form quando muda data ou carrega medição
  useEffect(() => {
    if (loading) return
    let cancelled = false
    queueMicrotask(() => {
      if (cancelled) return
      const m = measurement
      setWeight(m?.weightKg != null ? String(m.weightKg) : '')
      setWaist(m?.waistCm   != null ? String(m.waistCm)  : '')
      setBf(m?.bfPct        != null ? String(m.bfPct)    : '')
      setNote(m?.note ?? '')
      const sf = m?.skinfolds
      setChest(sf?.chest != null ? String(sf.chest) : '')
      setAx(sf?.ax       != null ? String(sf.ax)    : '')
      setTri(sf?.tri     != null ? String(sf.tri)   : '')
      setSub(sf?.sub     != null ? String(sf.sub)   : '')
      setAb(sf?.ab       != null ? String(sf.ab)    : '')
      setSup(sf?.sup     != null ? String(sf.sup)   : '')
      setTh(sf?.th       != null ? String(sf.th)    : '')
    })
    return () => { cancelled = true }
  }, [measurement, loading, selectedDate])

  // carrega histórico ao montar e ao salvar
  useEffect(() => {
    getAllBodyRows().then(setRows)
  }, [getAllBodyRows])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2200)
  }

  function handleSave() {
    const sf = {
      chest: parseNum(chest) ?? 0,
      ax:    parseNum(ax)    ?? 0,
      tri:   parseNum(tri)   ?? 0,
      sub:   parseNum(sub)   ?? 0,
      ab:    parseNum(ab)    ?? 0,
      sup:   parseNum(sup)   ?? 0,
      th:    parseNum(th)    ?? 0,
    }
    const anySF = Object.values(sf).some(v => v > 0)
    const data: BodyMeasurement = {
      weightKg: parseNum(weight),
      waistCm:  parseNum(waist),
      bfPct:    parseNum(bf),
      note:     note.trim(),
      ...(anySF ? { skinfolds: sf } : {}),
    }
    saveMeasurement(data)
    if (anySF && settings) {
      saveSettings({ ...settings, skinfolds: sf }).catch(console.error)
    }
    getAllBodyRows().then(setRows)
    showToast('Medição salva 📏')
  }

  function handleClear() {
    clearMeasurement()
    setWeight(''); setWaist(''); setBf(''); setNote('')
    setChest(''); setAx(''); setTri(''); setSub(''); setAb(''); setSup(''); setTh('')
    getAllBodyRows().then(setRows)
    showToast('Medição limpa 🧼')
  }

  const last14 = rows.slice(0, 14)
  const latest = rows[0]

  return (
    <div className="body-page">

      {/* Toast */}
      {toast && (
        <div className="body-toast">
          {toast}
        </div>
      )}

      {/* Card principal */}
      <div className="body-card">
        {/* Card header */}
        <div className="body-card-header">
          <div>
            <b>Medição corporal</b>
            <span>
              Peso, cintura, tendência.
            </span>
          </div>
          <div className="body-header-actions">
            <button
              type="button"
              onClick={handleSave}
              className="btn sm primary"
            >
              Salvar
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="btn sm ghost"
            >
              Limpar
            </button>
          </div>
        </div>

        {/* Card body */}
        <div className="body-card-body">

          {loading ? (
            <div className="body-skeleton-stack">
              <Skeleton height="52px" />
              <Skeleton height="52px" />
              <Skeleton height="52px" />
            </div>
          ) : <>

          <section className="body-trend-panel">
            <div className="body-trend-main">
              <span className="body-eyebrow">Última leitura</span>
              <strong>{latest ? formatDateLabel(latest.date) : 'Sem dados'}</strong>
              <p>Tendência importa mais que um ponto isolado.</p>
            </div>
            <div className="body-metric-grid">
              <div className="body-metric">
                <span>Peso</span>
                <b>{fmt(latest?.weightKg)}{latest?.weightKg != null ? <small>kg</small> : null}</b>
                <em>{trendText(rows, 'weightKg', 'kg')}</em>
              </div>
              <div className="body-metric">
                <span>Cintura</span>
                <b>{fmt(latest?.waistCm)}{latest?.waistCm != null ? <small>cm</small> : null}</b>
                <em>{trendText(rows, 'waistCm', 'cm')}</em>
              </div>
              <div className="body-metric">
                <span>BF</span>
                <b>{fmt(latest?.bfPct)}{latest?.bfPct != null ? <small>%</small> : null}</b>
                <em>{trendText(rows, 'bfPct', '%')}</em>
              </div>
            </div>
          </section>

          {/* Accordion 1 — Inputs do dia */}
          <Accordion id="accMeasureInput" title="1) Inputs do dia" defaultOpen>
            <div className="body-form-grid">
              <FormRow label="Peso (kg)" hint="Mesmo horário (ao acordar).">
                <input
                  inputMode="decimal"
                  placeholder="76.0"
                  value={weight}
                  onChange={e => setWeight(e.target.value)}
                  style={inputStyle}
                />
              </FormRow>
              <FormRow label="Cintura (cm)" hint="2 dedos abaixo do umbigo.">
                <input
                  inputMode="decimal"
                  placeholder="88.0"
                  value={waist}
                  onChange={e => setWaist(e.target.value)}
                  style={inputStyle}
                />
              </FormRow>
              <FormRow label="BF% (opcional)" hint="Bioimpedância ou calculadora.">
                <input
                  inputMode="decimal"
                  placeholder="18.9"
                  value={bf}
                  onChange={e => setBf(e.target.value)}
                  style={inputStyle}
                />
              </FormRow>
              <FormRow label="Observação" hint="Explica variação.">
                <input
                  placeholder="Treino, sono, sal..."
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  style={inputStyle}
                />
              </FormRow>
            </div>
          </Accordion>

          {/* Accordion 2 — Dobras */}
          <Accordion id="accMeasureFolds" title="2) Dobras (mm) • opcional">
            <p className="body-hint">
              Mesmo lado e técnica sempre.
            </p>
            <div className="body-fold-grid">
              {([
                ['Peito',         chest, setChest],
                ['Axilar',        ax,    setAx],
                ['Tríceps',       tri,   setTri],
                ['Subescapular',  sub,   setSub],
                ['Abdominal',     ab,    setAb],
                ['Supra-ilíaca',  sup,   setSup],
                ['Coxa',          th,    setTh],
              ] as [string, string, (v: string) => void][]).map(([lbl, val, setter]) => (
                <FormRow key={lbl} label={lbl}>
                  <input
                    inputMode="decimal"
                    value={val}
                    onChange={e => setter(e.target.value)}
                    style={inputStyle}
                  />
                </FormRow>
              ))}
            </div>
          </Accordion>

          {/* Accordion 3 — Histórico */}
          <Accordion id="accMeasureHistory" title="3) Histórico (últimos 14)" defaultOpen>
            <div className="body-history-head">
              <span>
                Tendência &gt; número do dia.
              </span>
              <button
                type="button"
                onClick={() => setChartOpen(true)}
                className="btn sm primary"
              >
                Evolução
              </button>
            </div>

            {/* Tabela */}
            <div className="body-table-wrap">
              <table className="body-table">
                <thead>
                  <tr>
                    {['Data', 'Peso', 'Cintura', 'BF%', 'Nota'].map(h => (
                      <th key={h}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {last14.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="body-table-empty"
                      >
                        Sem medições ainda.
                      </td>
                    </tr>
                  ) : (
                    last14.map(row => (
                      <tr
                        key={row.date}
                        onClick={() => {
                          // navegar para a data clicada no dateStore (Sessão 3F pendência)
                          setWeight(row.weightKg != null ? String(row.weightKg) : '')
                          setWaist(row.waistCm   != null ? String(row.waistCm)  : '')
                          setBf(row.bfPct        != null ? String(row.bfPct)    : '')
                          setNote(row.note ?? '')
                          const sf = row.skinfolds
                          setChest(sf?.chest != null ? String(sf.chest) : '')
                          setAx(sf?.ax       != null ? String(sf.ax)    : '')
                          setTri(sf?.tri     != null ? String(sf.tri)   : '')
                          setSub(sf?.sub     != null ? String(sf.sub)   : '')
                          setAb(sf?.ab       != null ? String(sf.ab)    : '')
                          setSup(sf?.sup     != null ? String(sf.sup)   : '')
                          setTh(sf?.th       != null ? String(sf.th)    : '')
                          showToast('Carregado 📅')
                        }}
                      >
                        <td className="body-date-cell">
                          {formatDateLabel(row.date)}
                        </td>
                        <td>
                          {fmt(row.weightKg)}
                        </td>
                        <td>
                          {fmt(row.waistCm)}
                        </td>
                        <td>
                          {fmt(row.bfPct)}
                        </td>
                        <td className="body-note-cell">
                          {(row.note || '').slice(0, 40)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </Accordion>

          </>}

        </div>
      </div>

      <BodyEvolutionModal
        open={chartOpen}
        onClose={() => setChartOpen(false)}
        rows={rows}
      />
    </div>
  )
}
