// ══════════════════════════════════════════════════════════
// components/HabitHistoryModal.tsx — Histórico de Hábitos
// ══════════════════════════════════════════════════════════
// Fiel ao original L8236–8412 (openHabitHistory, renderHabitMonth, renderHabitTrend)
// CSS: L2029–2065 (.habit-hist-*, .habit-hm-*, .habit-tr-*)
// z-index: overlay 324, sheet 325

import { useState, useEffect, useCallback } from 'react'
import { HABITS_DEF, type HabitsMap } from '../types/habit'

// ── Utilitário: data local ISO (fiel ao original L8268)
function localISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// ── Streak de um hábito (dias consecutivos até hoje) — original L8270–8282
function habitStreak(habitId: string, hData: HabitsMap): number {
  const today = new Date()
  let streak = 0
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = localISO(d)
    const row = hData[key]
    if (row && (row as unknown as Record<string, boolean>)[habitId]) streak++
    else break
  }
  return streak
}

// ── Aderência 4 semanas — original L8284–8302
function habitAdherence(habitId: string, hData: HabitsMap, weeks = 4): number {
  const firstDate = Object.keys(hData).sort()[0] ?? null
  const today = new Date()
  const dayOfWeek = today.getDay()
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const startMs = new Date(today)
  startMs.setDate(today.getDate() - mondayOffset - weeks * 7)
  let done = 0, total = 0
  for (let i = 0; i < weeks * 7; i++) {
    const d = new Date(startMs)
    d.setDate(startMs.getDate() + i)
    const key = localISO(d)
    if (firstDate && key < firstDate) continue
    total++
    const row = hData[key]
    if (row && (row as unknown as Record<string, boolean>)[habitId]) done++
  }
  return total > 0 ? Math.round((done / total) * 100) : 0
}

// ── Dados de célula do calendário
interface CalCell {
  day: number
  dateStr: string
  score: number
  isFuture: boolean
  isEmpty: boolean   // offset vazio (antes do dia 1)
  isBefore: boolean  // antes do primeiro registro — sem dado real
}

// ── Gera as células do calendário de um mês — original L8304–8335
function buildCalCells(year: number, month: number, hData: HabitsMap, todayStr: string): { cells: CalCell[]; stats: { adh: number; daysGe3: number; totalDays: number } } {
  const firstDay = new Date(year, month, 1)
  let startOffset = firstDay.getDay() - 1
  if (startOffset < 0) startOffset = 6
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDate = Object.keys(hData).sort()[0] ?? todayStr

  let totalDays = 0, daysGe3 = 0, totalHabits = 0, possibleHabits = 0
  const cells: CalCell[] = []

  for (let i = 0; i < startOffset; i++) {
    cells.push({ day: 0, dateStr: '', score: 0, isFuture: false, isEmpty: true, isBefore: false })
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const isFuture = dateStr > todayStr
    const isBefore = !isFuture && dateStr < firstDate
    const dayData = hData[dateStr]
    const score = HABITS_DEF.filter(h => dayData && (dayData as unknown as Record<string, boolean>)[h.id]).length

    if (!isFuture && !isBefore) {
      totalDays++
      totalHabits += score
      possibleHabits += HABITS_DEF.length
      if (score >= 3) daysGe3++
    }

    cells.push({ day: d, dateStr, score, isFuture, isEmpty: false, isBefore })
  }

  const adh = possibleHabits > 0 ? Math.round((totalHabits / possibleHabits) * 100) : 0
  return { cells, stats: { adh, daysGe3, totalDays } }
}

interface Props {
  open: boolean
  onClose: () => void
  getAllHabits: () => Promise<HabitsMap>
}

export function HabitHistoryModal({ open, onClose, getAllHabits }: Props) {
  const [tab, setTab] = useState<1 | 2>(1)
  const [month, setMonth] = useState({ y: new Date().getFullYear(), m: new Date().getMonth() })
  const [allHabits, setAllHabits] = useState<HabitsMap>({})
  const [loaded, setLoaded] = useState(false)
  const [tooltip, setTooltip] = useState<string | null>(null)

  const todayStr = new Date().toISOString().slice(0, 10)

  // ── Carrega dados ao abrir (lazy) — fiel ao padrão workoutRows
  useEffect(() => {
    if (!open) return
    setLoaded(false)
    setTab(1)
    setMonth({ y: new Date().getFullYear(), m: new Date().getMonth() })
    setTooltip(null)
    getAllHabits().then(data => {
      setAllHabits(data)
      setLoaded(true)
    })
  }, [open, getAllHabits])

  // ── Navegação mês — bloqueia futuro
  const goPrev = useCallback(() => {
    setMonth(prev => {
      const m = prev.m - 1
      if (m < 0) return { y: prev.y - 1, m: 11 }
      return { ...prev, m }
    })
    setTooltip(null)
  }, [])

  const goNext = useCallback(() => {
    const now = new Date()
    setMonth(prev => {
      if (prev.y > now.getFullYear() || (prev.y === now.getFullYear() && prev.m >= now.getMonth())) return prev
      const m = prev.m + 1
      if (m > 11) return { y: prev.y + 1, m: 0 }
      return { ...prev, m }
    })
    setTooltip(null)
  }, [])

  if (!open) return null

  const { cells, stats } = buildCalCells(month.y, month.m, allHabits, todayStr)
  const monthLabel = new Date(month.y, month.m, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  const isNextDisabled = month.y > new Date().getFullYear() || (month.y === new Date().getFullYear() && month.m >= new Date().getMonth())

  // ── Tooltip ao clicar célula — original L8366–8378
  function handleCellClick(cell: CalCell) {
    if (cell.isEmpty || cell.isFuture || cell.isBefore) return
    const dayData = allHabits[cell.dateStr]
    const done = HABITS_DEF.filter(h => dayData && (dayData as unknown as Record<string, boolean>)[h.id]).map(h => h.label)
    const missing = HABITS_DEF.filter(h => !dayData || !(dayData as unknown as Record<string, boolean>)[h.id]).map(h => h.label)
    const dateLabel = new Date(cell.dateStr + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })
    setTooltip(`${dateLabel} · score ${cell.score}/5\n✅ ${done.length > 0 ? done.join(', ') : '—'}\n❌ ${missing.length > 0 ? missing.join(', ') : '—'}`)
  }

  // ── Renderiza aba trend — original L8381–8412
  function renderTrend() {
    if (!loaded) return <p style={{ color: 'var(--text3)', textAlign: 'center', marginTop: 24 }}>Carregando...</p>
    if (Object.keys(allHabits).length === 0) return <p style={{ color: 'var(--text3)', textAlign: 'center', marginTop: 24 }}>Sem dados ainda</p>

    const today = new Date()
    const dayOfWeek = today.getDay()
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    const firstDate = Object.keys(allHabits).sort()[0] ?? todayStr

    // ── Calcula legendas de período uma vez (segunda da semana de cada barra)
    const weekLabels: string[] = []
    for (let w = 7; w >= 0; w--) {
      const monday = new Date(today)
      monday.setDate(today.getDate() - mondayOffset - w * 7)
      weekLabels.push(`${String(monday.getDate()).padStart(2, '0')}/${String(monday.getMonth() + 1).padStart(2, '0')}`)
    }

    return (
      <div>
        {HABITS_DEF.map(hab => {
          const streak = habitStreak(hab.id, allHabits)
          const adh = habitAdherence(hab.id, allHabits, 4)

          // 8 semanas de barras — original L8391–8403
          const bars: { pct: number; hasData: boolean }[] = []
          for (let w = 7; w >= 0; w--) {
            let done = 0, validDays = 0
            for (let d = 0; d < 7; d++) {
              const day = new Date(today)
              day.setDate(today.getDate() - mondayOffset - w * 7 + d)
              if (day > today) continue
              validDays++
              const key = localISO(day)
              const row = allHabits[key]
              if (row && (row as unknown as Record<string, boolean>)[hab.id]) done++
            }
            // semana sem nenhum registro real → hasData = false
            const mondayOfWeek = new Date(today)
            mondayOfWeek.setDate(today.getDate() - mondayOffset - w * 7)
            const sundayOfWeek = new Date(mondayOfWeek)
            sundayOfWeek.setDate(mondayOfWeek.getDate() + 6)
            const hasData = localISO(sundayOfWeek) >= firstDate
            bars.push({ pct: validDays > 0 ? Math.round((done / validDays) * 100) : 0, hasData })
          }

          return (
            <div key={hab.id} className="habit-tr-row">
              <span className="habit-tr-icon">{hab.icon}</span>
              <span className="habit-tr-name">{hab.label}</span>
              <div className="habit-tr-bars">
                {bars.map((bar, i) => (
                  <div
                    key={i}
                    className="habit-tr-bar-wrap"
                    title={weekLabels[i]}
                    style={{ opacity: bar.hasData ? 1 : 0.2 }}
                  >
                    <div className="habit-tr-bar" style={{ height: `${Math.max(bar.pct, 3)}%` }} />
                  </div>
                ))}
              </div>
              <div className="habit-tr-meta">
                {adh}%{streak > 0 ? <><br />🔥{streak}d</> : null}
              </div>
            </div>
          )
        })}

        {/* Legendas de período sob as barras */}
        <div style={{ display: 'flex', paddingLeft: '100px', paddingRight: '56px', marginTop: 6, gap: 3 }}>
          {weekLabels.map((lbl, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 8, color: 'var(--text3)', lineHeight: 1.2 }}>
              {i === 7 ? 'hoje' : lbl}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="habit-hist-overlay open"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="habit-hist-sheet open">
        {/* Handle */}
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,.15)', margin: '10px auto 0', flexShrink: 0 }} />

        {/* Header — original L2973–2975 */}
        <div className="habit-hist-header">
          <span className="habit-hist-title">📊 Histórico de Hábitos</span>
          <button
            type="button"
            className="profile-checkin-close"
            onClick={onClose}
          >✕</button>
        </div>

        {/* Tabs — original L2977–2980 */}
        <div className="habit-hist-tabs">
          <button
            type="button"
            className={`habit-hist-tab${tab === 1 ? ' active' : ''}`}
            onClick={() => { setTab(1); setTooltip(null) }}
          >📅 Mês</button>
          <button
            type="button"
            className={`habit-hist-tab${tab === 2 ? ' active' : ''}`}
            onClick={() => setTab(2)}
          >📈 Por hábito</button>
        </div>

        {/* Body */}
        <div className="habit-hist-body">
          {tab === 1 ? (
            <>
              {/* Nav mês — original L8340–8343 */}
              <div className="habit-hm-nav">
                <button type="button" className="habit-hm-nav-btn" onClick={goPrev}>‹</button>
                <span className="habit-hm-nav-label">{monthLabel}</span>
                <button
                  type="button"
                  className="habit-hm-nav-btn"
                  onClick={goNext}
                  style={{ opacity: isNextDisabled ? 0.3 : 1 }}
                  disabled={isNextDisabled}
                >›</button>
              </div>

              {/* Header dias — original L8345–8347 */}
              <div className="habit-hm-day-row">
                {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(l => (
                  <div key={l} className="habit-hm-day-lbl">{l}</div>
                ))}
              </div>

              {/* Grid — original L8319–8335 */}
              <div className="habit-hm-grid">
                {cells.map((cell, i) => {
                  if (cell.isEmpty) return <div key={i} className="habit-hm-cell empty" />
                  let cls = `habit-hm-cell hm-${cell.score}`
                  if (cell.isFuture || cell.isBefore) cls += ' future'
                  return (
                    <div
                      key={i}
                      className={cls}
                      onClick={() => handleCellClick(cell)}
                    >
                      {cell.day}
                    </div>
                  )
                })}
              </div>

              {/* Tooltip — original L8349 */}
              <div className="habit-hm-tooltip">
                {tooltip
                  ? tooltip.split('\n').map((line, i) => (
                      <span key={i}>{i === 0 ? <strong>{line}</strong> : line}{i < 2 ? <br /> : null}</span>
                    ))
                  : 'Toque num dia para ver detalhes'}
              </div>

              {/* Footer — original L8350 */}
              <div className="habit-hm-footer">
                {stats.totalDays > 0
                  ? `${stats.adh}% aderência · ${stats.daysGe3}/${stats.totalDays} dias com ≥3 hábitos`
                  : 'Sem registros neste mês'}
              </div>
            </>
          ) : renderTrend()}
        </div>
      </div>
    </>
  )
}
