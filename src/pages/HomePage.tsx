import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSettings } from '../hooks/useSettings'
import { useDiary } from '../hooks/useDiary'
import { fetchAllWorkoutRows } from '../hooks/useWorkout'
import { fetchAllBodyRows } from '../hooks/useBody'
import BodyEvolutionModal from '../components/BodyEvolutionModal'
import type { BodyRow } from '../types/body'
import type { WorkoutDayData } from '../types/workout'
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
import { DEFAULT_TEMPLATES, exById } from '../data/exerciseDb'
import { HABITS_DEF, type HabitsMap } from '../types/habit'

type WeekDay = { iso: string; label: string; isFuture: boolean; isToday: boolean }
type WorkoutRow = WorkoutDayData & { date: string }
type WorkoutPlan = {
  title: string
  focus: string
  reason: string
  start: string
  minimum: string
  readiness: number
  cta: string
}

function pct(value: number, total: number): number {
  if (total <= 0) return 0
  return Math.min(100, Math.round((value / total) * 100))
}

function clampText(value: string, max = 84): string {
  return value.length > max ? `${value.slice(0, max - 1)}...` : value
}

function formatDate(iso: string): string {
  const [y, mo, dy] = iso.split('-')
  const label = new Date(+y, +mo - 1, +dy).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

function daysBetween(fromIso: string, toIso: string): number {
  const from = new Date(`${fromIso}T12:00:00`).getTime()
  const to = new Date(`${toIso}T12:00:00`).getTime()
  return Math.max(0, Math.round((to - from) / 86400000))
}

function getWeekDates(): WeekDay[] {
  const todayStr = todayISO()
  const todayDate = new Date(`${todayStr}T12:00:00`)
  const dow = todayDate.getDay()
  const diffToMon = dow === 0 ? -6 : 1 - dow
  const monday = new Date(todayDate)
  monday.setDate(monday.getDate() + diffToMon)
  const labels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom']
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const iso = d.toISOString().slice(0, 10)
    return { iso, label: labels[i], isFuture: iso > todayStr, isToday: iso === todayStr }
  })
}

function templateShortName(nome: string): string {
  return nome.split(' - ')[0]?.replace('Treino ', '') || nome
}

function templateFocus(nome: string): string {
  return nome.split(' - ')[1] ?? 'Sessao completa'
}

function exerciseName(id: string | undefined): string {
  if (!id) return 'Exercicio principal'
  return exById(id)?.nome ?? 'Exercicio principal'
}

function buildWorkoutPlan(rows: WorkoutRow[], selectedDate: string, todayWorkoutKcal: number): WorkoutPlan {
  const pastRows = rows
    .filter(row => row.date <= selectedDate)
    .sort((a, b) => b.date.localeCompare(a.date))
  const doneToday = todayWorkoutKcal > 0 || pastRows.some(row => row.date === selectedDate && (row.kcal ?? 0) > 0)
  const lastBeforeSelected = rows
    .filter(row => row.date < selectedDate)
    .sort((a, b) => b.date.localeCompare(a.date))[0]

  const lastTemplateId = lastBeforeSelected?.templateId ?? pastRows[0]?.templateId ?? null
  const lastIndex = DEFAULT_TEMPLATES.findIndex(t => t.id === lastTemplateId)
  const template = DEFAULT_TEMPLATES[(lastIndex + 1 + DEFAULT_TEMPLATES.length) % DEFAULT_TEMPLATES.length] ?? DEFAULT_TEMPLATES[0]
  const days = lastBeforeSelected ? daysBetween(lastBeforeSelected.date, selectedDate) : null
  const start = exerciseName(template.exercicios[0])
  const second = exerciseName(template.exercicios[1])
  const third = exerciseName(template.exercicios[3] ?? template.exercicios[2])

  if (doneToday) {
    return {
      title: 'Treino registrado',
      focus: `${Math.round(todayWorkoutKcal)} kcal de treino`,
      reason: 'sessao de hoje ja entrou no diario',
      start: 'Revisar treino salvo',
      minimum: 'Manter recuperacao e fechar o diario',
      readiness: 100,
      cta: 'Revisar treino',
    }
  }

  return {
    title: templateShortName(template.nome),
    focus: templateFocus(template.nome),
    reason: days == null ? 'primeira sugestao da rotina base' : `ultimo treino ha ${days} dia${days === 1 ? '' : 's'}`,
    start,
    minimum: `25 min: ${start} + ${second} + ${third}`,
    readiness: days == null ? 72 : Math.min(92, 58 + days * 8),
    cta: 'Abrir treino',
  }
}

function buildRunway({
  p,
  pTarget,
  c,
  cTarget,
  g,
  gTarget,
}: {
  p: number
  pTarget: number
  c: number
  cTarget: number
  g: number
  gTarget: number
}): string | null {
  if (pTarget <= 0 && cTarget <= 0 && gTarget <= 0) return null
  const pLeft = Math.max(0, Math.round(pTarget - p))
  const cLeft = Math.max(0, Math.round(cTarget - c))
  const gLeft = Math.max(0, Math.round(gTarget - g))
  return `ate ${pLeft}P / ${cLeft}C / ${gLeft}G na proxima refeicao`
}

function buildAlert({
  p,
  pTarget,
  c,
  cTarget,
  kcal,
  kcalTarget,
  workoutDone,
}: {
  p: number
  pTarget: number
  c: number
  cTarget: number
  kcal: number
  kcalTarget: number
  workoutDone: boolean
}): { title: string; text: string } {
  const pPct = pct(p, pTarget)
  const kcalLeft = kcalTarget > 0 ? Math.round(kcalTarget - kcal) : 0
  const cLeft = cTarget > 0 ? Math.round(cTarget - c) : 0

  if (pTarget > 0 && pPct < 55) {
    return { title: 'Proteina baixa ate agora', text: 'Priorize uma refeicao com proteina clara antes de gastar carbo.' }
  }
  if (!workoutDone) {
    return { title: 'Treino pendente hoje', text: 'Uma sessao curta ja fecha o sinal principal do dia.' }
  }
  if (kcalTarget > 0 && kcalLeft > 350 && cLeft > 35) {
    return { title: 'Boa margem para jantar', text: 'Carbo moderado cabe bem sem estourar a meta.' }
  }
  return { title: 'Dia sob controle', text: 'Mantenha o diario fechado e preserve a recuperacao.' }
}

function weekHabitAdherence(habits: HabitsMap, weekDates: string[]): number {
  const validDates = weekDates.filter(date => date <= todayISO())
  if (validDates.length === 0) return 0
  const total = validDates.length * HABITS_DEF.length
  const done = validDates.reduce((sum, date) => {
    const row = habits[date]
    return sum + HABITS_DEF.filter(h => row?.[h.id as keyof typeof row]).length
  }, 0)
  return Math.round((done / total) * 100)
}

function HomeCard({ children, className = '', onClick }: {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}) {
  return (
    <section className={`home-card ${className}`} onClick={onClick}>
      {children}
    </section>
  )
}

function WorkoutHero({ plan, onOpen }: { plan: WorkoutPlan; onOpen: () => void }) {
  return (
    <>
      <section className="home-workout-hero">
        <div className="home-workout-copy">
          <span className="home-chip">Treino de hoje</span>
          <h1>{plan.title}</h1>
          <p>{clampText(`${plan.focus} / ${plan.reason}.`)}</p>
        </div>
        <div className="home-readiness">
          <strong>{plan.readiness}</strong>
          <span>pronto</span>
        </div>
      </section>

      <HomeCard className="home-next-workout">
        <div>
          <span>Comecar por</span>
          <strong>{plan.start}</strong>
          <small>{plan.title === 'Treino registrado' ? plan.minimum : 'Depois siga para o segundo bloco da rotina.'}</small>
        </div>
        <button type="button" onClick={onOpen}>{plan.cta}</button>
      </HomeCard>

      <div className="home-reason-grid">
        <HomeCard>
          <span className="home-card-kicker">Por que hoje</span>
          <strong>{plan.reason}</strong>
          <small>{plan.focus}</small>
        </HomeCard>
        <HomeCard>
          <span className="home-card-kicker">Plano minimo</span>
          <strong>25 min</strong>
          <small>{clampText(plan.minimum, 74)}</small>
        </HomeCard>
      </div>
    </>
  )
}

function ProgressCard({
  kcalConsumed,
  kcalTarget,
  p,
  pTarget,
  c,
  cTarget,
  g,
  gTarget,
  onClick,
  onHistorico,
  loading,
}: {
  kcalConsumed: number
  kcalTarget: number
  p: number
  pTarget: number
  c: number
  cTarget: number
  g: number
  gTarget: number
  onClick: () => void
  onHistorico: () => void
  loading: boolean
}) {
  if (loading) {
    return (
      <HomeCard className="home-calories">
        <Skeleton height="34px" />
        <Skeleton height="8px" borderRadius="999px" />
        <div className="home-macro-row">
          <Skeleton height="46px" />
          <Skeleton height="46px" />
          <Skeleton height="46px" />
        </div>
      </HomeCard>
    )
  }

  const kcalPct = pct(kcalConsumed, kcalTarget)
  const runway = buildRunway({ p, pTarget, c, cTarget, g, gTarget })
  const freeKcal = kcalTarget > 0 ? Math.max(0, Math.round(kcalTarget - kcalConsumed)) : null
  const macros = [
    { label: 'P', value: p, target: pTarget, color: 'var(--pColor)', pct: pct(p, pTarget) },
    { label: 'C', value: c, target: cTarget, color: 'var(--cColor)', pct: pct(c, cTarget) },
    { label: 'G', value: g, target: gTarget, color: 'var(--gColor)', pct: pct(g, gTarget) },
  ]

  return (
    <HomeCard className="home-calories" onClick={onClick}>
      <div className="home-section-head">
        <strong>Calorias hoje</strong>
        <button
          type="button"
          onClick={event => {
            event.stopPropagation()
            onHistorico()
          }}
        >
          HIST
        </button>
      </div>

      <div className="home-calorie-main">
        <strong>{Math.round(kcalConsumed)}</strong>
        <span>/ {kcalTarget > 0 ? kcalTarget : '--'} kcal</span>
      </div>

      <div className="home-calorie-bar">
        <i style={{ width: `${kcalPct}%`, background: kcalPct > 100 ? 'var(--bad)' : undefined }} />
      </div>

      <div className="home-macro-row">
        {macros.map(macro => (
          <div key={macro.label} className="home-macro-cell" style={{ ['--macro-color' as string]: macro.color }}>
            <span>{macro.label}</span>
            <strong>{Math.round(macro.value)}g</strong>
            <small>{macro.target > 0 ? `${macro.pct}%` : '--'}</small>
          </div>
        ))}
      </div>

      <div className="home-runway">
        <strong>{freeKcal == null ? 'Meta indefinida' : `${freeKcal} kcal livres`}</strong>
        <span>{runway ?? 'Configure metas para ver a margem da proxima refeicao.'}</span>
      </div>
    </HomeCard>
  )
}

function EnergySnapshot({
  consumed,
  bmr,
  tdee,
  kcalTreino,
  kcalTarget,
}: {
  consumed: number
  bmr: number | undefined
  tdee: number | undefined
  kcalTreino: number
  kcalTarget: number
}) {
  const hasBmr = bmr != null && bmr > 0
  const saldo = hasBmr ? Math.round(consumed - (bmr + kcalTreino)) : null
  return (
    <div className="home-bottom-grid">
      <HomeCard>
        <span className="home-card-kicker">Energia</span>
        <strong>{kcalTarget > 0 ? Math.max(0, Math.round(kcalTarget - consumed)) : '--'}</strong>
        <small>kcal livres</small>
      </HomeCard>
      <HomeCard>
        <span className="home-card-kicker">Saldo</span>
        <strong className={saldo != null && saldo < 0 ? 'good' : ''}>{saldo == null ? '--' : saldo > 0 ? `+${saldo}` : saldo}</strong>
        <small>{hasBmr ? `TDEE ${Math.round(tdee ?? bmr)}` : 'perfil pendente'}</small>
      </HomeCard>
    </div>
  )
}

function WeeklyChart({ weekDays, weekKcal, goal, todayKcal, bmr, workoutKcalByDate, todayWorkoutKcal, onOpenDetail }: {
  weekDays: WeekDay[]
  weekKcal: Record<string, number>
  goal: number
  todayKcal: number
  bmr: number | undefined
  workoutKcalByDate: Record<string, number>
  todayWorkoutKcal: number
  onOpenDetail: () => void
}) {
  const chartHeight = 76
  const consumed = (d: WeekDay) => d.isToday ? todayKcal : (weekKcal[d.iso] ?? 0)
  const total = (d: WeekDay): number => {
    if (bmr == null || bmr <= 0) return 0
    if (consumed(d) === 0) return 0
    const exercise = d.isToday ? todayWorkoutKcal : (workoutKcalByDate[d.iso] ?? 0)
    return bmr + exercise
  }
  const values = weekDays.flatMap(d => [consumed(d), total(d)])
  if (goal > 0) values.push(goal)
  const maxVal = Math.max(...values, 1)
  const metaPx = goal > 0 ? Math.round((goal / maxVal) * chartHeight) : null
  const daysWithData = weekDays.filter(d => !d.isFuture && consumed(d) > 0 && total(d) > 0)
  const avgBalance = daysWithData.length > 0
    ? Math.round(daysWithData.reduce((sum, d) => sum + (consumed(d) - total(d)), 0) / daysWithData.length)
    : null

  return (
    <HomeCard className="home-week-card">
      <div className="home-section-head">
        <strong>Semana kcal</strong>
        <button type="button" onClick={onOpenDetail}>
          {avgBalance == null ? 'sem media' : `${avgBalance > 0 ? '+' : ''}${avgBalance} kcal/dia`}
        </button>
      </div>
      <div className="home-week-chart" style={{ ['--chart-height' as string]: `${chartHeight}px` }}>
        {metaPx != null && <b className="home-week-meta" style={{ bottom: `${metaPx + 16}px` }} />}
        {weekDays.map(day => {
          const kcal = consumed(day)
          const totalDay = total(day)
          const consumedH = kcal > 0 ? Math.round((kcal / maxVal) * chartHeight) : 0
          const totalH = totalDay > 0 ? Math.round((totalDay / maxVal) * chartHeight) : 0
          return (
            <div key={day.iso} className={`home-week-day${day.isToday ? ' today' : ''}${day.isFuture ? ' future' : ''}`}>
              <div className="home-week-bars">
                {!day.isFuture && totalH > 0 && <i className="total" style={{ height: `${totalH}px` }} />}
                {!day.isFuture && consumedH > 0 && <i className="consumed" style={{ height: `${consumedH}px` }} />}
              </div>
              <span>{day.label}</span>
            </div>
          )
        })}
      </div>
    </HomeCard>
  )
}

function WeekPulse({ habits, weekDates, onOpenHistory }: {
  habits: HabitsMap
  weekDates: string[]
  onOpenHistory: () => void
}) {
  const adherence = weekHabitAdherence(habits, weekDates)
  return (
    <HomeCard className="home-pulse">
      <div className="home-section-head">
        <strong>Semana em pulso</strong>
        <button type="button" onClick={onOpenHistory}>{adherence}% aderencia</button>
      </div>
      <div className="home-pulse-days">
        {weekDates.map(date => (
          <div key={date} className={date === todayISO() ? 'today' : ''}>
            {HABITS_DEF.map(habit => {
              const row = habits[date]
              const checked = !!(row?.[habit.id as keyof typeof row])
              return (
                <i
                  key={habit.id}
                  className={checked ? 'on' : ''}
                  style={{ ['--habit-color' as string]: habit.color }}
                />
              )
            })}
          </div>
        ))}
      </div>
    </HomeCard>
  )
}

function ActionGrid({ onNavigate, onOpenProfile, onOpenEvolution }: {
  onNavigate: (path: string) => void
  onOpenProfile: () => void
  onOpenEvolution: () => void
}) {
  return (
    <div className="home-action-grid">
      <button type="button" onClick={() => onNavigate('/diario')}><span>D</span>Diario</button>
      <button type="button" onClick={() => onNavigate('/treino')}><span>T</span>Treino</button>
      <button type="button" onClick={onOpenEvolution}><span>E</span>Evolucao</button>
      <button type="button" onClick={onOpenProfile}><span>P</span>Perfil</button>
    </div>
  )
}

function CoachStrip({ alert }: { alert: { title: string; text: string } }) {
  return (
    <section className="home-coach-strip">
      <span>AI</span>
      <div>
        <strong>Coach insight</strong>
        <p>{alert.title}. {alert.text}</p>
      </div>
    </section>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { selectedDate } = useDateStore()
  const { settings, loading: loadingSettings, saveSettings } = useSettings()
  const { diary, loading: loadingDiary, getWeekKcal, getAllDiaryRows } = useDiary(selectedDate)
  const { habits, toggleHabit, getAllHabits } = useHabits()
  const [habitHistOpen, setHabitHistOpen] = useState(false)
  const [diaryHistOpen, setDiaryHistOpen] = useState(false)
  const [weeklyModalOpen, setWeeklyModalOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [autoWizardOpen, setAutoWizardOpen] = useState(false)
  const [onboardingDismissed, setOnboardingDismissed] = useState(() => localStorage.getItem('kcalix_onboarding_dismissed') === '1')
  const { triggerInstallPrompt } = useInstallStore()
  const { message: appMessage, loading: appMessageLoading, dismiss: dismissAppMessage } = useAppMessage()
  const [appMessageOpen, setAppMessageOpen] = useState(false)
  const appMessageShown = useRef(false)
  const [weekKcal, setWeekKcal] = useState<Record<string, number>>({})
  const [workoutKcalByDate, setWorkoutKcalByDate] = useState<Record<string, number>>({})
  const [workoutRows, setWorkoutRows] = useState<WorkoutRow[]>([])
  const [evolutionOpen, setEvolutionOpen] = useState(false)
  const [bodyRows, setBodyRows] = useState<BodyRow[]>([])
  const weekDays = useMemo(() => getWeekDates(), [])
  const todayIso = todayISO()
  const habitWeekDates = getHabitWeekDates(todayIso)
  const autoWizardVisible = autoWizardOpen || (!loadingSettings && settings === null && !onboardingDismissed)

  useEffect(() => {
    getWeekKcal(weekDays.map(d => d.iso)).then(setWeekKcal)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!user) return
    fetchAllWorkoutRows(user.id).then(rows => {
      const map: Record<string, number> = {}
      for (const row of rows) {
        map[row.date] = (map[row.date] ?? 0) + (row.kcal ?? 0)
      }
      setWorkoutKcalByDate(map)
      setWorkoutRows(rows)
    })
  }, [user])

  useEffect(() => {
    if (appMessageLoading || !appMessage || autoWizardVisible) return
    if (appMessageShown.current) return
    if (user?.email === import.meta.env.VITE_ADMIN_EMAIL) return
    appMessageShown.current = true
    const t = setTimeout(() => setAppMessageOpen(true), 1500)
    return () => clearTimeout(t)
  }, [appMessageLoading, appMessage, autoWizardVisible, user])

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
  const workoutPlan = useMemo(
    () => buildWorkoutPlan(workoutRows, selectedDate, kcalTreino),
    [workoutRows, selectedDate, kcalTreino],
  )
  const alert = buildAlert({
    p: totals.p,
    pTarget,
    c: totals.c,
    cTarget,
    kcal: totals.kcal,
    kcalTarget,
    workoutDone: kcalTreino > 0,
  })

  return (
    <div className="home-page">
      <div className="home-date-line">{formatDate(selectedDate)}</div>

      <WorkoutHero plan={workoutPlan} onOpen={() => navigate('/treino')} />

      <ProgressCard
        kcalConsumed={totals.kcal}
        kcalTarget={kcalTarget}
        p={totals.p}
        pTarget={pTarget}
        c={totals.c}
        cTarget={cTarget}
        g={totals.g}
        gTarget={gTarget}
        onClick={() => navigate('/diario')}
        onHistorico={() => setDiaryHistOpen(true)}
        loading={loading}
      />

      <HabitTracker
        habits={habits}
        weekDates={habitWeekDates}
        todayStr={todayIso}
        onToggle={toggleHabit}
        onOpenHistory={() => setHabitHistOpen(true)}
      />

      <HomeCard className="home-alert">
        <span>Insight</span>
        <strong>{alert.title}</strong>
        <small>{alert.text}</small>
      </HomeCard>

      <WeekPulse
        habits={habits}
        weekDates={habitWeekDates}
        onOpenHistory={() => setHabitHistOpen(true)}
      />

      <WeeklyChart
        weekDays={weekDays}
        weekKcal={weekKcal}
        goal={kcalTarget}
        todayKcal={totals.kcal}
        bmr={bmr}
        workoutKcalByDate={workoutKcalByDate}
        todayWorkoutKcal={kcalTreino}
        onOpenDetail={handleOpenWeeklyModal}
      />

      <EnergySnapshot
        consumed={totals.kcal}
        bmr={bmr}
        tdee={tdee}
        kcalTreino={kcalTreino}
        kcalTarget={kcalTarget}
      />

      <CoachStrip alert={alert} />

      <ActionGrid
        onNavigate={navigate}
        onOpenProfile={() => setProfileOpen(true)}
        onOpenEvolution={handleOpenEvolution}
      />

      <HabitHistoryModal
        open={habitHistOpen}
        onClose={() => setHabitHistOpen(false)}
        getAllHabits={getAllHabits}
      />

      {settings && (
        <ProfileCheckinModal
          open={profileOpen}
          settings={settings}
          onClose={() => setProfileOpen(false)}
          onOpenWizard={() => { setProfileOpen(false); setWizardOpen(true) }}
        />
      )}

      <CalcWizardModal
        open={wizardOpen}
        isNewUser={false}
        initialData={settings}
        onSave={async (result) => { await saveSettings(result); setWizardOpen(false); setProfileOpen(true) }}
        onClose={() => setWizardOpen(false)}
      />

      <CalcWizardModal
        open={autoWizardVisible}
        isNewUser={true}
        initialData={null}
        onSave={async (result) => { await saveSettings(result); setAutoWizardOpen(false); setOnboardingDismissed(true); triggerInstallPrompt() }}
        onClose={() => {
          localStorage.setItem('kcalix_onboarding_dismissed', '1')
          setOnboardingDismissed(true)
          setAutoWizardOpen(false)
        }}
      />

      <DiaryHistoryModal
        open={diaryHistOpen}
        onClose={() => setDiaryHistOpen(false)}
        getAllDiaryRows={getAllDiaryRows}
        kcalTarget={kcalTarget}
      />

      <BodyEvolutionModal
        open={evolutionOpen}
        onClose={() => setEvolutionOpen(false)}
        rows={bodyRows}
      />

      <WeeklyKcalModal
        open={weeklyModalOpen}
        onClose={() => setWeeklyModalOpen(false)}
        getWeekKcal={getWeekKcal}
        workoutKcalByDate={workoutKcalByDate}
        bmr={bmr}
        kcalTarget={kcalTarget}
      />

      {appMessageOpen && appMessage && (
        <AppMessageModal
          message={appMessage}
          onDismiss={(answer, comment) => { setAppMessageOpen(false); dismissAppMessage(answer, comment) }}
        />
      )}
    </div>
  )
}
