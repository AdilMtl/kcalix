// CorpoPage — Fase 4A
// Port fiel ao original: viewCorpo (L2526–2602) + MEASURE JS (L5235–5337)
// 3 accordions: 1) Inputs do dia, 2) Dobras (opcional), 3) Histórico (últimos 14)

import { useState, useEffect } from 'react'
import { useDateStore } from '../store/dateStore'
import { useBody } from '../hooks/useBody'
import { useSettings } from '../hooks/useSettings'
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
    <div
      id={id}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius-sm)',
        marginBottom: 8,
        overflow: 'hidden',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          padding: '12px 14px',
          background: 'none',
          border: 'none',
          color: 'var(--text)',
          fontFamily: 'var(--font)',
          fontSize: 13,
          fontWeight: 700,
          cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        {title}
        <span
          style={{
            color: 'var(--text3)',
            fontSize: 12,
            transition: 'transform .2s ease',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          ▾
        </span>
      </button>
      <div
        style={{
          maxHeight: open ? 3000 : 0,
          overflow: 'hidden',
          transition: 'max-height .3s ease',
        }}
      >
        <div style={{ padding: '0 14px 14px' }}>{children}</div>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: 'var(--text3)',
          textTransform: 'uppercase',
          letterSpacing: '.06em',
        }}
      >
        {label}
      </label>
      {children}
      {hint && (
        <small style={{ fontSize: 10, color: 'var(--text3)' }}>{hint}</small>
      )}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  background: 'var(--surface2)',
  border: '1px solid var(--line)',
  borderRadius: 'var(--radius-xs)',
  color: 'var(--text)',
  fontFamily: 'var(--font)',
  fontSize: 16,
  padding: '8px 10px',
  width: '100%',
  boxSizing: 'border-box',
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
  const [rows, setRows]   = useState<BodyRow[]>([])
  const [toast, setToast] = useState('')

  // preenche form quando muda data ou carrega medição
  useEffect(() => {
    if (loading) return
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

  return (
    <div style={{ padding: '0 0 80px' }}>

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 90,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(30,40,60,.97)',
            border: '1px solid var(--line)',
            borderRadius: 999,
            padding: '8px 20px',
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--text)',
            zIndex: 400,
            whiteSpace: 'nowrap',
          }}
        >
          {toast}
        </div>
      )}

      {/* Card principal */}
      <div
        style={{
          background: 'linear-gradient(180deg, rgba(18,24,38,.9), rgba(14,20,34,.9))',
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow)',
          marginBottom: 12,
        }}
      >
        {/* Card header */}
        <div
          style={{
            padding: '14px 16px 12px',
            borderBottom: '1px solid var(--line)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 10,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <b style={{ fontSize: 14, fontWeight: 700 }}>📏 Medição diária</b>
            <span style={{ display: 'block', fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
              Peso, cintura, tendência.
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={handleSave}
              style={{
                background: 'var(--accent)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-xs)',
                fontFamily: 'var(--font)',
                fontSize: 12,
                fontWeight: 700,
                padding: '7px 14px',
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              Salvar
            </button>
            <button
              type="button"
              onClick={handleClear}
              style={{
                background: 'transparent',
                color: 'var(--text2)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-xs)',
                fontFamily: 'var(--font)',
                fontSize: 12,
                fontWeight: 700,
                padding: '7px 14px',
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              Limpar dia
            </button>
          </div>
        </div>

        {/* Card body */}
        <div style={{ padding: '14px 16px 16px' }}>

          {/* Accordion 1 — Inputs do dia */}
          <Accordion id="accMeasureInput" title="1) Inputs do dia" defaultOpen>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
              }}
            >
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
              <FormRow label="BF% (opcional)" hint="Bioimpedância ou aba 🧮.">
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
            <p style={{ fontSize: 11, color: 'var(--text3)', margin: '0 0 10px' }}>
              Mesmo lado e técnica sempre.
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: 10,
              }}
            >
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
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 10,
              }}
            >
              <span style={{ fontSize: 11, color: 'var(--text3)' }}>
                Tendência &gt; número do dia.
              </span>
              {/* "Ver evolução 📈" — placeholder; gráfico entra na Sessão 4A+ */}
              <button
                type="button"
                disabled
                title="Em breve"
                style={{
                  background: 'var(--accent)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 'var(--radius-xs)',
                  fontFamily: 'var(--font)',
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '6px 12px',
                  cursor: 'not-allowed',
                  opacity: 0.5,
                }}
              >
                Ver evolução 📈
              </button>
            </div>

            {/* Tabela */}
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: 12,
                }}
              >
                <thead>
                  <tr>
                    {['Data', 'Peso', 'Cintura', 'BF%', 'Nota'].map(h => (
                      <th
                        key={h}
                        style={{
                          padding: '6px 8px',
                          textAlign: 'left',
                          fontWeight: 700,
                          fontSize: 10,
                          color: 'var(--text3)',
                          borderBottom: '1px solid var(--line)',
                          whiteSpace: 'nowrap',
                        }}
                      >
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
                        style={{ padding: '12px 8px', color: 'var(--text3)', fontSize: 12 }}
                      >
                        Sem medições ainda.
                      </td>
                    </tr>
                  ) : (
                    last14.map(row => (
                      <tr
                        key={row.date}
                        style={{ cursor: 'pointer' }}
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
                        <td
                          style={{
                            padding: '7px 8px',
                            fontFamily: 'monospace',
                            fontSize: 11,
                            color: 'var(--text2)',
                            borderBottom: '1px solid var(--line)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {formatDateLabel(row.date)}
                        </td>
                        <td style={{ padding: '7px 8px', borderBottom: '1px solid var(--line)' }}>
                          {fmt(row.weightKg)}
                        </td>
                        <td style={{ padding: '7px 8px', borderBottom: '1px solid var(--line)' }}>
                          {fmt(row.waistCm)}
                        </td>
                        <td style={{ padding: '7px 8px', borderBottom: '1px solid var(--line)' }}>
                          {fmt(row.bfPct)}
                        </td>
                        <td
                          style={{
                            padding: '7px 8px',
                            color: 'var(--text3)',
                            fontSize: 11,
                            borderBottom: '1px solid var(--line)',
                            maxWidth: 120,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {(row.note || '').slice(0, 40)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </Accordion>

        </div>
      </div>
    </div>
  )
}
