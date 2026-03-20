import { useState, useEffect } from 'react'
import { todayISO } from '../lib/dateUtils'

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface WeekDay {
  iso: string
  label: string
  isFuture: boolean
  isToday: boolean
}

interface EnergyDay extends WeekDay {
  consumed: number        // kcal ingerida (barra roxa)
  exercise: number        // kcal treino
  basalTotal: number      // BMR + kcal_treino (barra cinza — gasto estimado)
  balance: number | null  // consumed - basalTotal — null se sem BMR
}

interface Props {
  open: boolean
  onClose: () => void
  getWeekKcal: (dates: string[]) => Promise<Record<string, number>>
  workoutKcalByDate: Record<string, number>  // pré-calculado no pai
  bmr: number | undefined
  kcalTarget: number
}

// ── Helpers ───────────────────────────────────────────────────────────────────


const DAY_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

function getWeekRange(offset: number): { monday: Date; sunday: Date } {
  const todayStr  = todayISO()
  const todayDate = new Date(todayStr + 'T12:00:00')
  const dow       = todayDate.getDay()
  const diffToMon = dow === 0 ? -6 : 1 - dow
  const monday    = new Date(todayDate)
  monday.setDate(monday.getDate() + diffToMon + offset * 7)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return { monday, sunday }
}

function getWeekDays(offset: number): WeekDay[] {
  const todayStr = todayISO()
  const { monday } = getWeekRange(offset)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const iso = d.toISOString().slice(0, 10)
    return { iso, label: DAY_LABELS[i], isFuture: iso > todayStr, isToday: iso === todayStr }
  })
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

// ── Gráfico de barras (fiel ao original renderWeekHistModal) ──────────────────

function WeekBars({ energies, goal }: { energies: EnergyDay[]; goal: number }) {
  const CHART_H = 90

  // Normalizar pelo maior valor entre: ingerido, basalTotal e meta
  const allVals = energies.flatMap(e => [e.consumed, e.basalTotal])
  if (goal > 0) allVals.push(goal)
  const maxVal  = Math.max(...allVals, 1)
  const metaPx  = goal > 0 ? Math.round((goal / maxVal) * CHART_H) : null

  return (
    <div className="week-chart-wrap" style={{ position: 'relative', marginTop: '4px' }}>
      <div style={{ position: 'relative' }}>
        {/* linha da meta */}
        {metaPx != null && (
          <div style={{
            position: 'absolute', left: 0, right: 0,
            bottom: metaPx + 14,
            borderTop: '1.5px dashed var(--accent2)',
            opacity: 0.45,
            pointerEvents: 'none',
            zIndex: 2,
          }} />
        )}

        <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', position: 'relative' }}>
          {energies.map(day => {
            // barra cinza = BMR + treino (gasto estimado)
            const totalH    = day.basalTotal > 0 ? Math.round((day.basalTotal / maxVal) * CHART_H) : 0
            const consumedH = day.consumed  > 0 ? Math.round((day.consumed   / maxVal) * CHART_H) : 0
            const noData    = !day.isFuture && day.consumed === 0 && totalH === 0

            return (
              <div
                key={day.iso}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  opacity: noData ? 0.4 : 1,
                }}
              >
                <div style={{ position: 'relative', width: '100%', height: CHART_H }}>
                  {/* barra cinza = total (basal + treino) */}
                  {!day.isFuture && totalH > 0 && (
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0,
                      height: totalH,
                      background: 'var(--surface3)',
                      borderRadius: '4px 4px 0 0',
                      minHeight: 2,
                      border: day.isToday ? '1.5px solid var(--accent2)' : 'none',
                      boxSizing: 'border-box',
                    }} />
                  )}
                  {/* barra roxa = ingerido */}
                  {!day.isFuture && consumedH > 0 && (
                    <div style={{
                      position: 'absolute', bottom: 0,
                      left: '50%', transform: 'translateX(-50%)',
                      width: '55%',
                      height: consumedH,
                      background: 'var(--accent)',
                      borderRadius: '4px 4px 0 0',
                      zIndex: 1,
                      minHeight: 2,
                    }} />
                  )}
                </div>
                <div style={{
                  fontSize: '9px',
                  color: day.isToday ? 'var(--accent2)' : 'var(--text2)',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                }}>
                  {day.label}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Modal principal ───────────────────────────────────────────────────────────

export function WeeklyKcalModal({ open, onClose, getWeekKcal, workoutKcalByDate, bmr, kcalTarget }: Props) {
  const [offset, setOffset]   = useState(0)
  const [kcalMap, setKcalMap] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)

  // Carrega kcal ingerida das datas da semana visível
  useEffect(() => {
    if (!open) return
    const days = getWeekDays(offset)
    setLoading(true)
    getWeekKcal(days.map(d => d.iso))
      .then(m => setKcalMap(prev => ({ ...prev, ...m })))
      .finally(() => setLoading(false))
  }, [open, offset])

  // Reset offset ao fechar
  useEffect(() => {
    if (!open) setOffset(0)
  }, [open])

  if (!open) return null

  const { monday, sunday } = getWeekRange(offset)
  const title = `${fmtDate(monday)} – ${fmtDate(sunday)}`
  const days  = getWeekDays(offset)

  const energies: EnergyDay[] = days.map(day => {
    const consumed   = kcalMap[day.iso] ?? 0
    const exercise   = Math.round(workoutKcalByDate[day.iso] ?? 0)
    // barra cinza só quando há alimento logado (fiel ao original L4199)
    const basalTotal = bmr != null && bmr > 0 && consumed > 0 ? bmr + exercise : 0
    const balance    = bmr != null && bmr > 0 && consumed > 0 ? consumed - basalTotal : null
    return { ...day, consumed, exercise, basalTotal, balance }
  })

  // Projeção kg/sem (mínimo 1 dia com dado — fiel ao original L4414)
  const daysWithData = energies.filter(e => !e.isFuture && e.balance != null)
  let projection: string | null = null
  if (daysWithData.length >= 1) {
    const avgBalance = daysWithData.reduce((s, e) => s + e.balance!, 0) / daysWithData.length
    const kgPerWeek  = (avgBalance * 7) / 7700
    const sign       = kgPerWeek < 0 ? '📉' : '📈'
    projection = `${sign} Projeção: ${kgPerWeek >= 0 ? '+' : ''}${kgPerWeek.toFixed(2)} kg/sem (média ${Math.round(avgBalance)} kcal/dia)`
  }

  return (
    <>
      {/* overlay — z-index 312 */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,.6)',
          zIndex: 312,
        }}
      />

      {/* modal — z-index 313 */}
      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: 0,
        maxWidth: '600px', margin: '0 auto',
        background: 'linear-gradient(180deg,#1a2035,#121828)',
        border: '1px solid var(--line)',
        borderBottom: 'none',
        borderRadius: '20px 20px 0 0',
        zIndex: 313,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}>
        {/* handle */}
        <div style={{
          width: 36, height: 4,
          background: 'rgba(255,255,255,.15)',
          borderRadius: 2,
          margin: '10px auto 0',
        }} />

        {/* nav: ‹ título › */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px 8px',
        }}>
          <button
            type="button"
            onClick={() => setOffset(o => o - 1)}
            style={{
              background: 'none',
              border: '1.5px solid var(--line)',
              borderRadius: '8px',
              width: 40, height: 40,
              fontSize: '18px',
              color: 'var(--text)',
              cursor: 'pointer',
              fontFamily: 'var(--font)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              lineHeight: 1,
            }}
          >‹</button>

          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', textAlign: 'center', flex: 1 }}>
            {title}
          </span>

          <button
            type="button"
            onClick={() => { if (offset < 0) setOffset(o => o + 1) }}
            disabled={offset >= 0}
            style={{
              background: 'none',
              border: '1.5px solid var(--line)',
              borderRadius: '8px',
              width: 40, height: 40,
              fontSize: '18px',
              color: 'var(--text)',
              cursor: offset >= 0 ? 'default' : 'pointer',
              fontFamily: 'var(--font)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              lineHeight: 1,
              opacity: offset >= 0 ? 0.3 : 1,
            }}
          >›</button>
        </div>

        {/* corpo */}
        <div style={{ padding: '0 16px 16px' }}>
          {loading ? (
            <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div
                style={{
                  width: 24, height: 24,
                  borderRadius: '50%',
                  border: '2px solid transparent',
                  borderTopColor: 'var(--accent)',
                  animation: 'spin 0.7s linear infinite',
                }}
              />
            </div>
          ) : (
            <WeekBars energies={energies} goal={kcalTarget} />
          )}

          {/* projeção */}
          {projection && !loading && (
            <div style={{
              fontSize: '11px', color: 'var(--text2)',
              textAlign: 'center', marginTop: '8px', marginBottom: '12px',
              letterSpacing: '.01em',
            }}>
              {projection}
            </div>
          )}
          {!projection && !loading && (
            <div style={{
              fontSize: '11px', color: 'var(--text3)',
              textAlign: 'center', marginTop: '8px', marginBottom: '12px',
            }}>
              {bmr != null ? 'Sem dados nesta semana' : 'Configure o perfil em Mais → Calculadora para ver projeção'}
            </div>
          )}

          {/* legenda */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: 10, height: 10, borderRadius: '2px', background: 'var(--accent)' }} />
              <span style={{ fontSize: '10px', color: 'var(--text3)' }}>ingerido</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: 10, height: 10, borderRadius: '2px', background: 'var(--surface3)' }} />
              <span style={{ fontSize: '10px', color: 'var(--text3)' }}>basal + treino</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: '100%',
              background: 'transparent',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-xs)',
              padding: '12px',
              fontSize: '14px',
              fontWeight: 700,
              color: 'var(--text2)',
              cursor: 'pointer',
              fontFamily: 'var(--font)',
            }}
          >
            Fechar
          </button>
        </div>
      </div>
    </>
  )
}
