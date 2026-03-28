import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSettings } from '../hooks/useSettings'
import { useDiary } from '../hooks/useDiary'
import { fetchAllWorkoutRows } from '../hooks/useWorkout'
import { fetchAllBodyRows } from '../hooks/useBody'
import BodyEvolutionModal from '../components/BodyEvolutionModal'
import type { BodyRow } from '../types/body'
import { useAuthStore } from '../store/authStore'
import { useDateStore } from '../store/dateStore'
import { useHabits, getWeekDates as getHabitWeekDates } from '../hooks/useHabits'
import { todayISO } from '../lib/dateUtils'
import { HabitTracker } from '../components/HabitTracker'
import { HabitHistoryModal } from '../components/HabitHistoryModal'
import { WeeklyKcalModal } from '../components/WeeklyKcalModal'
import { DiaryHistoryModal } from '../components/DiaryHistoryModal'
import ProfileCheckinModal from '../components/ProfileCheckinModal'
import CalcWizardModal from '../components/CalcWizardModal'
import Skeleton from '../components/Skeleton'
import { useInstallStore } from '../store/installStore'
import { useAppMessage } from '../hooks/useAppMessage'
import AppMessageModal from '../components/AppMessageModal'

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
  const todayStr = todayISO()
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
  onClick, onHistorico, loading,
}: {
  kcalConsumed: number; kcalTarget: number
  p: number; pTarget: number
  c: number; cTarget: number
  g: number; gTarget: number
  onClick: () => void
  onHistorico: () => void
  loading: boolean
}) {
  if (loading) {
    return (
      <Card onClick={onClick}>
        <Skeleton height="38px" style={{ marginBottom: '12px' }} />
        <Skeleton height="8px" borderRadius="999px" style={{ marginBottom: '14px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
          <Skeleton height="38px" />
          <Skeleton height="38px" />
          <Skeleton height="38px" />
        </div>
      </Card>
    )
  }

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '12px', color: 'var(--text3)' }}>
            meta: <b>{kcalTarget > 0 ? `${kcalTarget} kcal` : '—'}</b>
          </span>
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onHistorico() }}
            style={{
              background: 'transparent',
              border: '1px solid var(--line)',
              borderRadius: '6px',
              padding: '4px 8px',
              fontSize: '13px',
              cursor: 'pointer',
              lineHeight: 1,
            }}
          >📊</button>
        </div>
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
  consumed, bmr, tdee, kcalTreino, kcalTarget, loading,
}: {
  consumed: number
  bmr: number | undefined
  tdee: number | undefined
  kcalTreino: number
  kcalTarget: number
  loading: boolean
}) {
  if (loading) {
    return (
      <Card>
        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text2)', marginBottom: '8px' }}>⚡ Energia Hoje</div>
        <div style={{ display: 'flex', gap: '4px', marginBottom: '10px' }}>
          <Skeleton height="42px" style={{ flex: 1 }} />
          <Skeleton height="42px" style={{ flex: 1 }} />
          <Skeleton height="42px" style={{ flex: 1 }} />
          <Skeleton height="42px" style={{ flex: 1 }} />
        </div>
        <Skeleton height="10px" borderRadius="999px" />
      </Card>
    )
  }

  const hasBmr = bmr != null && bmr > 0
  const saldo  = hasBmr ? Math.round(consumed - (bmr + kcalTreino)) : null
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

function WeeklyChart({ weekDays, weekKcal, goal, todayKcal, bmr, workoutKcalByDate, todayWorkoutKcal }: {
  weekDays: WeekDay[]
  weekKcal: Record<string, number>
  goal: number
  todayKcal: number
  bmr: number | undefined
  workoutKcalByDate: Record<string, number>
  todayWorkoutKcal: number
}) {
  const CHART_H = 90

  // consumed = kcal ingerida no dia (igual ao original)
  const consumed = (d: WeekDay) => d.isToday ? todayKcal : (weekKcal[d.iso] ?? 0)

  // total = BMR + treino do dia — só válido quando há alimento logado (fiel ao original L4199:
  // balance = consumed > 0 && basalTotal != null ? ... : null)
  const total = (d: WeekDay): number => {
    if (bmr == null || bmr <= 0) return 0
    if (consumed(d) === 0) return 0   // sem alimento → sem barra cinza
    const exercise = d.isToday ? todayWorkoutKcal : (workoutKcalByDate[d.iso] ?? 0)
    return bmr + exercise
  }

  // maxVal inclui consumed e total de cada dia + goal (fiel ao original L4292)
  const allVals = weekDays.flatMap(d => [consumed(d), total(d)])
  if (goal > 0) allVals.push(goal)
  const maxVal = Math.max(...allVals, 1)

  const metaPx = goal > 0 ? Math.round((goal / maxVal) * CHART_H) : null

  // projeção: só dias com consumed > 0 (fiel ao original: balance != null só quando consumed > 0)
  const daysWithData = weekDays.filter(d => !d.isFuture && consumed(d) > 0 && total(d) > 0)
  let projection: string | null = null
  if (daysWithData.length >= 2) {
    const avgBalance = daysWithData.reduce((s, d) => s + (consumed(d) - total(d)), 0) / daysWithData.length
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
            const totalDay  = total(day)
            const consumedH = kcal > 0    ? Math.round((kcal     / maxVal) * CHART_H) : 0
            const totalH    = totalDay > 0 ? Math.round((totalDay / maxVal) * CHART_H) : 0
            const noData    = !day.isFuture && kcal === 0 && totalH === 0

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

// ── Grid de ações (home-grid) ─────────────────────────────────────────────────
function ActionGrid({ onNavigate, onOpenProfile, onOpenEvolution }: {
  onNavigate: (path: string) => void
  onOpenProfile: () => void
  onOpenEvolution: () => void
}) {
  const navActions = [
    { icon: '📊', label: 'Diário',  path: '/diario' },
    { icon: '🏋️', label: 'Treino',  path: '/treino' },
    { icon: '📏', label: 'Corpo',   path: '/corpo'  },
  ]
  const btnStyle: React.CSSProperties = {
    background: 'var(--surface)',
    border: '1px solid var(--line)',
    borderRadius: 'var(--radius)',
    padding: '22px 12px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
    cursor: 'pointer',
    WebkitTapHighlightColor: 'transparent',
    fontFamily: 'var(--font)',
    transition: 'background .15s, transform .1s',
  }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '4px' }}>
      {navActions.map(a => (
        <button
          key={a.path}
          type="button"
          onClick={() => onNavigate(a.path)}
          style={btnStyle}
          onMouseDown={e => (e.currentTarget.style.background = 'var(--surface3)')}
          onMouseUp={e => (e.currentTarget.style.background = 'var(--surface)')}
          onTouchStart={e => (e.currentTarget.style.background = 'var(--surface3)')}
          onTouchEnd={e => (e.currentTarget.style.background = 'var(--surface)')}
        >
          <span style={{ fontSize: '28px', lineHeight: 1.2 }}>{a.icon}</span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text2)' }}>{a.label}</span>
        </button>
      ))}

      {/* Evolução corporal — substitui "Mais" */}
      <button
        type="button"
        onClick={onOpenEvolution}
        style={btnStyle}
        onMouseDown={e => (e.currentTarget.style.background = 'var(--surface3)')}
        onMouseUp={e => (e.currentTarget.style.background = 'var(--surface)')}
        onTouchStart={e => (e.currentTarget.style.background = 'var(--surface3)')}
        onTouchEnd={e => (e.currentTarget.style.background = 'var(--surface)')}
      >
        <span style={{ fontSize: '28px', lineHeight: 1.2 }}>📈</span>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text2)' }}>Evolução</span>
      </button>

      {/* Botão full-width: Meu Perfil Nutricional → abre ProfileCheckinModal */}
      <button
        type="button"
        onClick={onOpenProfile}
        style={{
          gridColumn: '1 / -1',
          background: 'var(--surface)',
          border: '1px solid rgba(124,92,255,.35)',
          borderRadius: 'var(--radius)',
          padding: '16px 12px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
          cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent',
          fontFamily: 'var(--font)',
          transition: 'background .15s',
        }}
        onMouseDown={e => (e.currentTarget.style.background = 'var(--surface3)')}
        onMouseUp={e => (e.currentTarget.style.background = 'var(--surface)')}
        onTouchStart={e => (e.currentTarget.style.background = 'var(--surface3)')}
        onTouchEnd={e => (e.currentTarget.style.background = 'var(--surface)')}
      >
        <span style={{ fontSize: '24px', lineHeight: 1.2 }}>🎯</span>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text2)' }}>Meu Perfil Nutricional</span>
      </button>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { selectedDate } = useDateStore()
  const { settings, loading: loadingSettings, saveSettings } = useSettings()
  const { diary, loading: loadingDiary, getWeekKcal, getAllDiaryRows } = useDiary(selectedDate)
  const { habits, toggleHabit, getAllHabits } = useHabits()
  const [habitHistOpen, setHabitHistOpen]     = useState(false)
  const [diaryHistOpen, setDiaryHistOpen]     = useState(false)
  const [weeklyModalOpen, setWeeklyModalOpen] = useState(false)
  const [profileOpen, setProfileOpen]       = useState(false)
  const [wizardOpen, setWizardOpen]         = useState(false)
  const [autoWizardOpen, setAutoWizardOpen] = useState(false)
  const { triggerInstallPrompt } = useInstallStore()
  const { message: appMessage, loading: appMessageLoading, dismiss: dismissAppMessage } = useAppMessage()
  const [appMessageOpen, setAppMessageOpen] = useState(false)
  const appMessageShown = useRef(false)
  const [weekKcal, setWeekKcal]             = useState<Record<string, number>>({})
  const [workoutKcalByDate, setWorkoutKcalByDate] = useState<Record<string, number>>({})
  const [evolutionOpen, setEvolutionOpen]   = useState(false)
  const [bodyRows, setBodyRows]             = useState<BodyRow[]>([])
  const weekDays = getWeekDates()
  const todayIso = todayISO()
  const habitWeekDates = getHabitWeekDates(todayIso)

  useEffect(() => {
    getWeekKcal(weekDays.map(d => d.iso)).then(setWeekKcal)
  }, [])

  // Carrega kcal de treino por data no mount — necessário para a barra cinza do WeeklyChart
  useEffect(() => {
    if (!user) return
    fetchAllWorkoutRows(user.id).then(rows => {
      const map: Record<string, number> = {}
      for (const r of rows) {
        map[r.date] = (map[r.date] ?? 0) + (r.kcal ?? 0)
      }
      setWorkoutKcalByDate(map)
    })
  }, [user])

  // Broadcast: abre 1.5s após carregar, só se não tiver onboarding pendente
  // Guard appMessageShown evita reabrir se appMessage mudar de referência na mesma sessão
  // Admin nunca vê o modal automaticamente — só via botão "Ver" no painel (sem gravar eventos reais)
  useEffect(() => {
    if (appMessageLoading || !appMessage || autoWizardOpen) return
    if (appMessageShown.current) return
    if (user?.email === import.meta.env.VITE_ADMIN_EMAIL) return
    appMessageShown.current = true
    const t = setTimeout(() => setAppMessageOpen(true), 1500)
    return () => clearTimeout(t)
  }, [appMessageLoading, appMessage, autoWizardOpen, user])

  // Onboarding automático: abre wizard na primeira visita
  // Condições: settings carregou (loadingSettings=false) + perfil nunca configurado (settings===null)
  // + usuário não dismissou sem salvar antes (localStorage)
  useEffect(() => {
    if (loadingSettings) return
    const dismissed = localStorage.getItem('kcalix_onboarding_dismissed')
    if (settings === null && !dismissed) {
      setAutoWizardOpen(true)
    }
  }, [loadingSettings, settings])

  // Abre modal histórico semanal (workoutKcalByDate já carregado no mount)
  const handleOpenWeeklyModal = useMemo(() => async () => {
    setWeeklyModalOpen(true)
  }, [])

  const handleOpenEvolution = useMemo(() => async () => {
    if (user && bodyRows.length === 0) {
      const rows = await fetchAllBodyRows(user.id)
      setBodyRows(rows)
    }
    setEvolutionOpen(true)
  }, [user, bodyRows.length])

  const loading = loadingSettings || loadingDiary
  const { kcalTarget = 0, pTarget = 0, cTarget = 0, gTarget = 0, bmr, tdee } = settings ?? {}
  const { totals, kcalTreino } = diary

  return (
    <div style={{ padding: '20px 16px', paddingBottom: 'calc(72px + env(safe-area-inset-bottom, 0px))' }}>

      {/* HabitTracker — topo, igual ao original L2116 */}
      <HabitTracker
        habits={habits}
        weekDates={habitWeekDates}
        todayStr={todayIso}
        onToggle={toggleHabit}
        onOpenHistory={() => setHabitHistOpen(true)}
      />

      <HabitHistoryModal
        open={habitHistOpen}
        onClose={() => setHabitHistOpen(false)}
        getAllHabits={getAllHabits}
      />

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
        onHistorico={() => setDiaryHistOpen(true)}
        loading={loading}
      />

      {/* Card ⚡ Energia Hoje */}
      <EnergyCard
        consumed={totals.kcal}
        bmr={bmr}
        tdee={tdee}
        kcalTreino={kcalTreino}
        kcalTarget={kcalTarget}
        loading={loading}
      />

      {/* Card 📅 Últimos 7 dias */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text2)' }}>📅 Últimos 7 dias</span>
          <button
            type="button"
            onClick={handleOpenWeeklyModal}
            style={{
              background: 'transparent',
              border: '1px solid var(--line)',
              borderRadius: '6px',
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--text2)',
              cursor: 'pointer',
              fontFamily: 'var(--font)',
            }}
          >
            📊
          </button>
        </div>
        <WeeklyChart
          weekDays={weekDays}
          weekKcal={weekKcal}
          goal={kcalTarget}
          todayKcal={totals.kcal}
          bmr={bmr}
          workoutKcalByDate={workoutKcalByDate}
          todayWorkoutKcal={kcalTreino}
        />
      </Card>

      {/* Grid de ações */}
      <ActionGrid
        onNavigate={navigate}
        onOpenProfile={() => setProfileOpen(true)}
        onOpenEvolution={handleOpenEvolution}
      />

      {/* Modal perfil nutricional + check-in */}
      {settings && (
        <ProfileCheckinModal
          open={profileOpen}
          settings={settings}
          onClose={() => setProfileOpen(false)}
          onOpenWizard={() => { setProfileOpen(false); setWizardOpen(true) }}
        />
      )}

      {/* CalcWizardModal aberto pelo botão "Atualizar →" do perfil */}
      <CalcWizardModal
        open={wizardOpen}
        isNewUser={false}
        initialData={settings}
        onSave={async (result) => { await saveSettings(result); setWizardOpen(false); setProfileOpen(true) }}
        onClose={() => setWizardOpen(false)}
      />

      {/* Onboarding automático — abre só na primeira visita (settings===null) */}
      <CalcWizardModal
        open={autoWizardOpen}
        isNewUser={true}
        initialData={null}
        onSave={async (result) => { await saveSettings(result); setAutoWizardOpen(false); triggerInstallPrompt() }}
        onClose={() => {
          localStorage.setItem('kcalix_onboarding_dismissed', '1')
          setAutoWizardOpen(false)
        }}
      />

      {/* Modal histórico de dias do diário */}
      <DiaryHistoryModal
        open={diaryHistOpen}
        onClose={() => setDiaryHistOpen(false)}
        getAllDiaryRows={getAllDiaryRows}
        kcalTarget={kcalTarget}
      />

      {/* Modal evolução corporal */}
      <BodyEvolutionModal
        open={evolutionOpen}
        onClose={() => setEvolutionOpen(false)}
        rows={bodyRows}
      />

      {/* Modal histórico semanal de kcal */}
      <WeeklyKcalModal
        open={weeklyModalOpen}
        onClose={() => setWeeklyModalOpen(false)}
        getWeekKcal={getWeekKcal}
        workoutKcalByDate={workoutKcalByDate}
        bmr={bmr}
        kcalTarget={kcalTarget}
      />

      {/* Broadcast — aparece 1× por mensagem, 1.5s após carregar */}
      {appMessageOpen && appMessage && (
        <AppMessageModal
          message={appMessage}
          onDismiss={() => { setAppMessageOpen(false); dismissAppMessage() }}
        />
      )}
    </div>
  )
}
