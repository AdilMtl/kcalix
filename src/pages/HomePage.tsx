import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSettings } from '../hooks/useSettings'
import { useDiary } from '../hooks/useDiary'
import { useDateStore } from '../store/dateStore'

// ── Helpers ──────────────────────────────────────────────────────────────────

function pct(value: number, total: number): number {
  if (total <= 0) return 0
  return Math.min(100, Math.round((value / total) * 100))
}

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia 👋'
  if (h < 18) return 'Boa tarde 👋'
  return 'Boa noite 🌙'
}

function formatDate(iso: string): string {
  const [y, mo, dy] = iso.split('-')
  const label = new Date(+y, +mo - 1, +dy).toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

function balanceColor(saldo: number): string {
  if (saldo < 0) return '#22c55e'    // déficit = verde (bom)
  if (saldo > 200) return 'var(--bad)'
  return 'var(--accent2)'
}

// ── Calcula os 7 dias da semana atual (Seg → Dom) ────────────────────────────
function getWeekDates(): { iso: string; label: string; isFuture: boolean; isToday: boolean }[] {
  const todayStr = new Date().toISOString().slice(0, 10)
  const todayDate = new Date(todayStr + 'T12:00:00')
  const dow = todayDate.getDay()
  const diffToMon = dow === 0 ? -6 : 1 - dow
  const monday = new Date(todayDate)
  monday.setDate(monday.getDate() + diffToMon)
  const DAY_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const iso = d.toISOString().slice(0, 10)
    return { iso, label: DAY_LABELS[i], isFuture: iso > todayStr, isToday: iso === todayStr }
  })
}

// ── Sub-componentes ───────────────────────────────────────────────────────────

// Card genérico fiel ao original (.card .card-body)
function Card({ children, onClick, style }: {
  children: React.ReactNode
  onClick?: () => void
  style?: React.CSSProperties
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius)',
        padding: '14px',
        marginBottom: '12px',
        cursor: onClick ? 'pointer' : undefined,
        WebkitTapHighlightColor: 'transparent',
        transition: onClick ? 'background .15s' : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

// ── Card de progresso do dia (home-kcal + home-macro-row) ────────────────────
function ProgressCard({
  kcalConsumed, kcalTarget,
  p, pTarget, c, cTarget, g, gTarget,
  onClick,
}: {
  kcalConsumed: number; kcalTarget: number
  p: number; pTarget: number
  c: number; cTarget: number
  g: number; gTarget: number
  onClick: () => void
}) {
  const kcalPct = pct(kcalConsumed, kcalTarget)
  const pPct    = pct(p, pTarget)
  const cPct    = pct(c, cTarget)
  const gPct    = pct(g, gTarget)

  return (
    <Card onClick={onClick}>
      {/* home-kcal-row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
        <span style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-.5px', lineHeight: 1, color: 'var(--text)' }}>
          {Math.round(kcalConsumed)}
          <span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--text3)', marginLeft: '3px' }}>kcal</span>
        </span>
        <span style={{ fontSize: '12px', color: 'var(--text3)' }}>
          meta: <b>{kcalTarget > 0 ? `${kcalTarget} kcal` : '—'}</b>
        </span>
      </div>

      {/* home-kcal-bar */}
      <div style={{ height: '8px', background: 'var(--surface3)', borderRadius: '999px', overflow: 'hidden', marginBottom: '14px' }}>
        <div style={{
          height: '100%', borderRadius: '999px',
          background: kcalPct > 100 ? 'var(--bad)' : 'var(--accent)',
          width: `${kcalPct}%`,
          transition: 'width .4s ease',
        }} />
      </div>

      {/* home-macro-row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
        {([
          { label: 'PROTEÍNA', val: p, target: pTarget, color: 'var(--pColor)', pct: pPct },
          { label: 'CARBO',    val: c, target: cTarget, color: 'var(--cColor)', pct: cPct },
          { label: 'GORDURA',  val: g, target: gTarget, color: 'var(--gColor)', pct: gPct },
        ] as const).map(m => (
          <div key={m.label} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
              {m.label}
            </div>
            <div style={{ height: '4px', background: 'var(--surface3)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: '999px', background: m.color, width: `${m.pct}%`, transition: 'width .4s ease' }} />
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text2)' }}>
              {Math.round(m.val)}g / {m.target > 0 ? `${m.target}g` : '—'}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

// ── Card ⚡ Energia Hoje ──────────────────────────────────────────────────────
function EnergyCard({
  consumed, bmr, tdee, kcalTreino, kcalTarget,
}: {
  consumed: number
  bmr: number | undefined
  tdee: number | undefined
  kcalTreino: number
  kcalTarget: number
}) {
  const hasBmr = bmr != null && bmr > 0
  const saldo  = hasBmr ? consumed - (bmr + kcalTreino) : null
  const balTxt = saldo != null ? (saldo > 0 ? `+${saldo}` : `${saldo}`) : '—'
  const balClr = saldo != null ? balanceColor(saldo) : 'var(--text2)'
  const goalPct = kcalTarget > 0 ? Math.min(100, Math.round((consumed / kcalTarget) * 100)) : 0

  return (
    <Card>
      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text2)', marginBottom: '8px' }}>⚡ Energia Hoje</div>

      {/* energy-kpi-row */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '10px' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
          <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>{Math.round(consumed)}</span>
          <span style={{ fontSize: '10px', color: 'var(--text2)', textAlign: 'center', lineHeight: 1.3 }}>kcal in</span>
        </div>
        {hasBmr ? (
          <>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
              <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>{Math.round(bmr!)}</span>
              <span style={{ fontSize: '10px', color: 'var(--text2)', textAlign: 'center', lineHeight: 1.3 }}>basal</span>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
              <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>
                {kcalTreino > 0 ? `+${Math.round(kcalTreino)}` : Math.round(kcalTreino)}
              </span>
              <span style={{ fontSize: '10px', color: 'var(--text2)', textAlign: 'center', lineHeight: 1.3 }}>treino</span>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
              <span style={{ fontSize: '16px', fontWeight: 700, color: balClr, lineHeight: 1.2 }}>{balTxt}</span>
              <span style={{ fontSize: '10px', color: 'var(--text2)', textAlign: 'center', lineHeight: 1.3 }}>saldo</span>
            </div>
          </>
        ) : (
          <div style={{ flex: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--text2)', textAlign: 'center', padding: '6px 0 2px' }}>
              Configure o perfil em Mais → Calculadora para ver gasto e saldo
            </span>
          </div>
        )}
      </div>

      {/* Barra consumido vs meta com energy-meta-line */}
      {kcalTarget > 0 && (
        <>
          <div style={{ position: 'relative', height: '10px', background: 'var(--surface3)', borderRadius: '999px', overflow: 'visible', marginTop: '4px' }}>
            <div style={{
              height: '100%', borderRadius: '999px',
              background: 'var(--accent)',
              width: `${goalPct}%`,
              transition: 'width .4s ease',
            }} />
            {/* energy-meta-line: marcador vertical no final da meta */}
            <div style={{
              position: 'absolute', top: '-3px', right: 0,
              width: '2px', height: '16px',
              background: 'var(--accent2)', borderRadius: '1px', opacity: .7,
              pointerEvents: 'none',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text2)' }}>{goalPct}% da meta</span>
            <span style={{ fontSize: '10px', color: 'var(--text2)' }}>meta: {kcalTarget} kcal</span>
          </div>
        </>
      )}

      {/* TDEE info (quando disponível) */}
      {tdee != null && tdee > 0 && (
        <div style={{ marginTop: '8px', fontSize: '10px', color: 'var(--text3)', textAlign: 'center' }}>
          TDEE {Math.round(tdee)} kcal/dia
        </div>
      )}
    </Card>
  )
}

// ── Gráfico Semanal ───────────────────────────────────────────────────────────
interface WeekDay { iso: string; label: string; isFuture: boolean; isToday: boolean }

function WeeklyChart({ weekDays, weekKcal, goal, todayKcal }: {
  weekDays: WeekDay[]
  weekKcal: Record<string, number>
  goal: number
  todayKcal: number
}) {
  const CHART_H = 90

  const consumed = (d: WeekDay) => d.isToday ? todayKcal : (weekKcal[d.iso] ?? 0)

  const allVals = weekDays.map(d => consumed(d))
  if (goal > 0) allVals.push(goal)
  const maxVal = Math.max(...allVals, 1)

  const metaPx = goal > 0 ? Math.round((goal / maxVal) * CHART_H) : null

  const daysWithData = weekDays.filter(d => !d.isFuture && consumed(d) > 0 && goal > 0)
  let projection: string | null = null
  if (daysWithData.length >= 2) {
    const avgBalance = daysWithData.reduce((s, d) => s + (consumed(d) - goal), 0) / daysWithData.length
    const kgPerWeek  = (avgBalance * 7) / 7700
    const sign       = kgPerWeek < 0 ? '📉' : '📈'
    projection = `${sign} Projeção: ${kgPerWeek >= 0 ? '+' : ''}${kgPerWeek.toFixed(2)} kg/sem (média ${Math.round(avgBalance)} kcal/dia)`
  }

  return (
    <div className="week-chart-wrap" style={{ position: 'relative', marginTop: '4px' }}>
      <div style={{ position: 'relative' }}>
        {/* week-meta-line */}
        {metaPx != null && (
          <div className="week-meta-line" style={{
            position: 'absolute', left: 0, right: 0,
            bottom: metaPx + 14,
            borderTop: '1.5px dashed var(--accent2)',
            opacity: 0.45,
            pointerEvents: 'none',
            zIndex: 2,
          }} />
        )}

        {/* week-bars */}
        <div className="week-bars" style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', position: 'relative' }}>
          {weekDays.map(day => {
            const kcal      = consumed(day)
            const consumedH = kcal > 0 ? Math.round((kcal / maxVal) * CHART_H) : 0
            const totalH    = goal > 0 ? Math.round((goal / maxVal) * CHART_H) : 0
            const noData    = !day.isFuture && kcal === 0

            return (
              <div
                key={day.iso}
                className={['week-bar-group', day.isToday ? 'today' : '', noData ? 'no-data' : ''].filter(Boolean).join(' ')}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', opacity: noData ? .4 : 1 }}
              >
                <div className="week-bar-wrap" style={{ position: 'relative', width: '100%', height: CHART_H }}>
                  {!day.isFuture && totalH > 0 && (
                    <div className="week-bar-total" style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0,
                      height: totalH,
                      background: 'var(--surface3)',
                      borderRadius: '4px 4px 0 0',
                      minHeight: 2,
                      border: day.isToday ? '1.5px solid var(--accent2)' : 'none',
                      boxSizing: 'border-box',
                    }} />
                  )}
                  {!day.isFuture && consumedH > 0 && (
                    <div className="week-bar-consumed" style={{
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
                <div className="week-day-label" style={{
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

      {/* energy-projection */}
      {projection && (
        <div className="energy-projection" style={{ fontSize: '11px', color: 'var(--text2)', textAlign: 'center', marginTop: '8px', letterSpacing: '.01em' }}>
          {projection}
        </div>
      )}
    </div>
  )
}

// ── HabitTracker placeholder (topo, estilo .habit-card do original) ───────────
function HabitTrackerPlaceholder() {
  const habits = [
    { id: 'dieta',   label: 'Dieta',    emoji: '🥗' },
    { id: 'log',     label: 'Log',      emoji: '📋' },
    { id: 'treino',  label: 'Treino',   emoji: '🏋️' },
    { id: 'cardio',  label: 'Cardio',   emoji: '🚴' },
    { id: 'medidas', label: 'Medidas',  emoji: '📏' },
  ]
  return (
    <div style={{
      background: 'rgba(0,0,0,.35)',
      border: '1px solid rgba(124,92,255,.22)',
      borderRadius: 'var(--radius)',
      padding: '12px 14px',
      marginBottom: '12px',
    }}>
      <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text2)', marginBottom: '10px' }}>Hábitos do dia</div>
      <div style={{ display: 'flex', gap: '6px', justifyContent: 'space-between' }}>
        {habits.map(h => (
          <div
            key={h.id}
            style={{
              flex: 1,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
              padding: '8px 4px',
              background: 'var(--surface2)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-sm)',
              opacity: .5,
            }}
          >
            <span style={{ fontSize: '18px', lineHeight: 1.2 }}>{h.emoji}</span>
            <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text3)', textAlign: 'center' }}>{h.label}</span>
          </div>
        ))}
      </div>
      <div style={{ fontSize: '10px', color: 'var(--text3)', textAlign: 'center', marginTop: '8px' }}>
        Hábitos disponíveis na Fase 4
      </div>
    </div>
  )
}

// ── Grid de ações (home-grid) ─────────────────────────────────────────────────
function ActionGrid({ onNavigate }: { onNavigate: (path: string) => void }) {
  const actions = [
    { icon: '📊', label: 'Diário',  path: '/diario' },
    { icon: '🏋️', label: 'Treino',  path: '/treino' },
    { icon: '📏', label: 'Corpo',   path: '/corpo'  },
    { icon: '⚙️', label: 'Mais',    path: '/mais'   },
  ]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '4px' }}>
      {actions.map(a => (
        <button
          key={a.path}
          type="button"
          onClick={() => onNavigate(a.path)}
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius)',
            padding: '22px 12px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
            fontFamily: 'var(--font)',
            transition: 'background .15s, transform .1s',
          }}
          onMouseDown={e => (e.currentTarget.style.background = 'var(--surface3)')}
          onMouseUp={e => (e.currentTarget.style.background = 'var(--surface)')}
          onTouchStart={e => (e.currentTarget.style.background = 'var(--surface3)')}
          onTouchEnd={e => (e.currentTarget.style.background = 'var(--surface)')}
        >
          <span style={{ fontSize: '28px', lineHeight: 1.2 }}>{a.icon}</span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text2)' }}>{a.label}</span>
        </button>
      ))}

      {/* Botão full-width: Meu Perfil Nutricional (Fase 4) */}
      <button
        type="button"
        disabled
        style={{
          gridColumn: '1 / -1',
          background: 'var(--surface)',
          border: '1px dashed rgba(124,92,255,.35)',
          borderRadius: 'var(--radius)',
          padding: '16px 12px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
          cursor: 'not-allowed',
          opacity: .6,
          fontFamily: 'var(--font)',
        }}
      >
        <span style={{ fontSize: '24px', lineHeight: 1.2 }}>🎯</span>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text2)' }}>Meu Perfil Nutricional</span>
        <span style={{ fontSize: '10px', color: 'var(--text3)' }}>Disponível na Fase 4</span>
      </button>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function HomePage() {
  const navigate = useNavigate()
  const { selectedDate } = useDateStore()
  const { settings, loading: loadingSettings } = useSettings()
  const { diary, loading: loadingDiary, getWeekKcal } = useDiary(selectedDate)
  const [weekKcal, setWeekKcal] = useState<Record<string, number>>({})
  const weekDays = getWeekDates()
  const todayIso = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    getWeekKcal(weekDays.map(d => d.iso)).then(setWeekKcal)
  }, [])

  if (loadingSettings || loadingDiary) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div
          className="h-7 w-7 animate-spin rounded-full border-2 border-transparent"
          style={{ borderTopColor: 'var(--accent)' }}
        />
      </div>
    )
  }

  const { kcalTarget = 0, pTarget = 0, cTarget = 0, gTarget = 0, bmr, tdee } = settings ?? {}
  const { totals, kcalTreino } = diary

  return (
    <div style={{ padding: '20px 16px', paddingBottom: 'calc(72px + env(safe-area-inset-bottom, 0px))' }}>

      {/* HabitTracker — topo, igual ao original */}
      <HabitTrackerPlaceholder />

      {/* Saudação + data (home-greeting / home-date-sub) */}
      <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', marginBottom: '2px' }}>
        {greeting()}
      </div>
      <div style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '14px' }}>
        {formatDate(todayIso)}
      </div>

      {/* Card progresso do dia — clicável → /diario */}
      <ProgressCard
        kcalConsumed={totals.kcal}
        kcalTarget={kcalTarget}
        p={totals.p} pTarget={pTarget}
        c={totals.c} cTarget={cTarget}
        g={totals.g} gTarget={gTarget}
        onClick={() => navigate('/diario')}
      />

      {/* Card ⚡ Energia Hoje */}
      <EnergyCard
        consumed={totals.kcal}
        bmr={bmr}
        tdee={tdee}
        kcalTreino={kcalTreino}
        kcalTarget={kcalTarget}
      />

      {/* Card 📅 Últimos 7 dias */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text2)' }}>📅 Últimos 7 dias</span>
          {/* Botão histórico — placeholder até modal ser implementado */}
          <button
            type="button"
            disabled
            style={{
              background: 'transparent',
              border: '1px solid var(--line)',
              borderRadius: '6px',
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--text3)',
              cursor: 'not-allowed',
              opacity: .6,
              fontFamily: 'var(--font)',
            }}
          >
            📊 histórico
          </button>
        </div>
        <WeeklyChart
          weekDays={weekDays}
          weekKcal={weekKcal}
          goal={kcalTarget}
          todayKcal={totals.kcal}
        />
      </Card>

      {/* Grid de ações */}
      <ActionGrid onNavigate={navigate} />
    </div>
  )
}
