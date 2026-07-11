import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSettings } from '../hooks/useSettings'
import { useDiary } from '../hooks/useDiary'
import { fetchAllWorkoutRows } from '../hooks/useWorkout'
import type { WorkoutDayData } from '../types/workout'
import { useAuthStore } from '../store/authStore'
import { useDateStore } from '../store/dateStore'
import { useHabits, getWeekDates as getHabitWeekDates } from '../hooks/useHabits'
import { todayISO } from '../lib/dateUtils'
import { HabitTracker } from '../components/HabitTracker'
import { HabitHistoryModal } from '../components/HabitHistoryModal'
import { WeeklyKcalModal } from '../components/WeeklyKcalModal'
import { DiaryHistoryModal } from '../components/DiaryHistoryModal'
import CalcWizardModal from '../components/CalcWizardModal'
import Skeleton from '../components/Skeleton'
import { useInstallStore } from '../store/installStore'
import { useAppMessage } from '../hooks/useAppMessage'
import AppMessageModal from '../components/AppMessageModal'
import { useCustomExercises } from '../hooks/useCustomExercises'
import { HABITS_DEF, type HabitsMap } from '../types/habit'
import {
  buildCompletedWorkoutSummary,
  buildWorkoutRecommendation,
  workoutFocusLabels,
  type CompletedWorkoutSummary,
  type WorkoutRecommendation,
} from '../lib/homeDashboard'

type WeekDay = { iso: string; label: string; isFuture: boolean; isToday: boolean }
type WorkoutRow = WorkoutDayData & { date: string }
type HomeInsight = { kicker: string; title: string; text: string; tone: 'good' | 'warn' | 'bad' }

function pct(value: number, total: number): number {
  if (total <= 0) return 0
  return Math.min(100, Math.round((value / total) * 100))
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

function buildHomeInsight({
  p,
  pTarget,
  c,
  cTarget,
  kcal,
  kcalTarget,
  workoutDone,
  habits,
  date,
  settingsConfigured,
}: {
  p: number
  pTarget: number
  c: number
  cTarget: number
  kcal: number
  kcalTarget: number
  workoutDone: boolean
  habits: HabitsMap
  date: string
  settingsConfigured: boolean
}): HomeInsight | null {
  if (date !== todayISO()) return null
  if (!settingsConfigured) {
    return { kicker: 'Dados incompletos', title: 'Configure suas metas nutricionais.', text: 'Sem metas, o dashboard não consegue interpretar seu saldo do dia.', tone: 'warn' }
  }

  const hour = new Date().getHours()
  const pPct = pct(p, pTarget)
  const kcalLeft = kcalTarget > 0 ? Math.round(kcalTarget - kcal) : 0
  const cLeft = cTarget > 0 ? Math.round(cTarget - c) : 0

  if (kcalTarget > 0 && kcal > kcalTarget) {
    return { kicker: 'Ajuste útil agora', title: `${Math.round(kcal - kcalTarget)} kcal acima da meta.`, text: 'Feche o diário e preserve uma escolha mais leve na próxima refeição.', tone: 'bad' }
  }
  if (hour >= 14 && pTarget > 0 && pPct < 60) {
    return { kicker: 'Ajuste útil agora', title: `Faltam ${Math.max(0, Math.round(pTarget - p))}g de proteína.`, text: 'Priorize 30–40g na próxima refeição; calorias e gordura ainda definem o tamanho final.', tone: 'warn' }
  }
  if (hour >= 17 && !workoutDone) {
    return { kicker: 'Pendência do dia', title: 'Treino ainda não registrado.', text: 'Abra a recomendação acima para decidir o grupo prioritário sem sair da Home.', tone: 'warn' }
  }
  const habitRow = habits[date]
  const incompleteHabits = HABITS_DEF.filter(habit => !habitRow?.[habit.id as keyof typeof habitRow]).length
  if (hour >= 20 && incompleteHabits > 0) {
    return { kicker: 'Fechamento do dia', title: `${incompleteHabits} hábito${incompleteHabits === 1 ? '' : 's'} ainda aberto${incompleteHabits === 1 ? '' : 's'}.`, text: 'Revise somente o que realmente foi concluído antes de encerrar o dia.', tone: 'warn' }
  }
  if (hour >= 17 && kcalLeft > 350 && cLeft > 35) {
    return { kicker: 'Margem disponível', title: `${kcalLeft} kcal livres para o restante do dia.`, text: `Até ${Math.max(0, Math.round(pTarget - p))}P / ${cLeft}C ainda cabem dentro das metas.`, tone: 'good' }
  }
  return null
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

function WorkoutDashboard({
  isToday,
  loading,
  recommendation,
  summary,
  focus,
  onRecommend,
  onOpenWorkout,
}: {
  isToday: boolean
  loading: boolean
  recommendation: WorkoutRecommendation
  summary: CompletedWorkoutSummary | null
  focus: string[]
  onRecommend: () => void
  onOpenWorkout: () => void
}) {
  if (loading) {
    return <HomeCard className="home-workout-decision"><Skeleton height="190px" /></HomeCard>
  }

  if (summary) {
    const positiveProgress = summary.prCount > 0 || (summary.volumeDeltaPct ?? 0) > 0 || (summary.repsDelta ?? 0) > 0
    return (
      <section className="home-workout-decision completed">
        <div className="home-workout-label-row">
          <span className="home-chip">{isToday ? 'Sessão concluída' : 'Treino registrado'}</span>
          <span className="home-workout-status">salvo</span>
        </div>
        <h1>{focus.length > 0 ? focus.join(' + ') : 'Treino concluído'}</h1>
        <p>{positiveProgress ? 'Sessão salva com avanço em relação às referências anteriores.' : 'Sessão salva e disponível para revisão.'}</p>

        <div className="home-session-kpis">
          <div><small>Gasto</small><strong>{summary.kcal}</strong><span>kcal</span></div>
          <div><small>Trabalho</small><strong>{summary.workSets}</strong><span>séries</span></div>
          <div><small>Duração</small><strong>{summary.durationMin ?? '--'}</strong><span>{summary.durationMin == null ? 'não registrada' : 'min'}</span></div>
        </div>

        <div className={`home-session-progress${positiveProgress ? ' positive' : ''}`}>
          <strong>{positiveProgress ? 'Progresso confirmado' : summary.hasComparison ? 'Sessão registrada' : 'Primeira referência salva'}</strong>
          <div>
            {summary.volumeDeltaPct != null && <span>Volume {summary.volumeDeltaPct > 0 ? '+' : ''}{summary.volumeDeltaPct}%</span>}
            {summary.repsDelta != null && summary.repsDelta !== 0 && <span>Reps {summary.repsDelta > 0 ? '+' : ''}{summary.repsDelta}</span>}
            {summary.prCount > 0 && <span>{summary.prCount} PR{summary.prCount > 1 ? 's' : ''}</span>}
            {!summary.hasComparison && <span>Use esta sessão como base para a próxima comparação.</span>}
          </div>
        </div>
        <button className="home-workout-primary" type="button" onClick={onOpenWorkout}>Ver treino salvo</button>
      </section>
    )
  }

  if (!isToday) {
    return (
      <HomeCard className="home-workout-empty">
        <span className="home-chip">Histórico de treino</span>
        <strong>Nenhum treino registrado</strong>
        <small>Esta data não possui uma sessão salva.</small>
      </HomeCard>
    )
  }

  const { large, complementary, ranked, allAtMinimum } = recommendation
  const pair = [large, complementary].filter((item): item is NonNullable<typeof item> => item != null)
  return (
    <>
      <section className="home-workout-decision">
        <div className="home-workout-label-row">
          <span className="home-chip">Treino de hoje</span>
          <span className="home-workout-status">por volume semanal</span>
        </div>
        <h1>O que treinar hoje?</h1>
        {allAtMinimum ? (
          <p>Todos os grupos atingiram o mínimo semanal. Abra o painel para escolher pela sua rotina e recuperação.</p>
        ) : (
          <p><strong>{pair.map(item => item.label).join(' + ')}</strong> é a combinação prioritária: os grupos estão mais distantes da faixa mínima nos últimos 7 dias.</p>
        )}

        {pair.length > 0 && (
          <div className={`home-recommended-pair${pair.length === 1 ? ' single' : ''}`}>
            {pair.map((item, index) => (
              <div key={item.group}>
                <small>{item.category === 'large' ? 'Grupo grande' : 'Complementar'}</small>
                <strong>{item.label}</strong>
                <span>{item.sets} de {item.mev} séries</span>
                {index === 0 && pair.length > 1 && <b>+</b>}
              </div>
            ))}
          </div>
        )}
        <button className="home-workout-primary" type="button" onClick={onRecommend}>Abrir Que Treinar Hoje</button>
      </section>

      {!allAtMinimum && (
        <HomeCard className="home-muscle-ranking">
          <div className="home-section-head"><strong>Mais abaixo da faixa</strong><span>séries / MEV</span></div>
          {ranked.slice(0, 3).map((item, index) => (
            <div className="home-muscle-row" key={item.group}>
              <b>{index + 1}</b>
              <span>{item.label}<small>{item.category === 'large' ? 'grupo grande' : 'complementar'}</small></span>
              <div><i style={{ width: `${item.fillPct}%` }} /></div>
              <strong>{item.sets}/{item.mev}</strong>
            </div>
          ))}
        </HomeCard>
      )}
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

export default function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { selectedDate } = useDateStore()
  const { settings, loading: loadingSettings, saveSettings } = useSettings()
  const { diary, loading: loadingDiary, getWeekKcal, getAllDiaryRows } = useDiary(selectedDate)
  const { habits, toggleHabit, getAllHabits } = useHabits()
  const { customExercises, loading: loadingCustomExercises } = useCustomExercises()
  const [habitHistOpen, setHabitHistOpen] = useState(false)
  const [diaryHistOpen, setDiaryHistOpen] = useState(false)
  const [weeklyModalOpen, setWeeklyModalOpen] = useState(false)
  const [autoWizardOpen, setAutoWizardOpen] = useState(false)
  const [onboardingDismissed, setOnboardingDismissed] = useState(() => localStorage.getItem('kcalix_onboarding_dismissed') === '1')
  const { triggerInstallPrompt } = useInstallStore()
  const { message: appMessage, loading: appMessageLoading, dismiss: dismissAppMessage } = useAppMessage()
  const [appMessageOpen, setAppMessageOpen] = useState(false)
  const appMessageShown = useRef(false)
  const [weekKcal, setWeekKcal] = useState<Record<string, number>>({})
  const [workoutKcalByDate, setWorkoutKcalByDate] = useState<Record<string, number>>({})
  const [workoutRows, setWorkoutRows] = useState<WorkoutRow[]>([])
  const [workoutLoading, setWorkoutLoading] = useState(true)
  const weekDays = useMemo(() => getWeekDates(), [])
  const todayIso = todayISO()
  const habitWeekDates = getHabitWeekDates(selectedDate)
  const autoWizardVisible = autoWizardOpen || (!loadingSettings && settings === null && !onboardingDismissed)

  useEffect(() => {
    getWeekKcal(weekDays.map(d => d.iso)).then(setWeekKcal)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!user) { queueMicrotask(() => setWorkoutLoading(false)); return }
    queueMicrotask(() => setWorkoutLoading(true))
    fetchAllWorkoutRows(user.id)
      .then(rows => {
        const map: Record<string, number> = {}
        for (const row of rows) map[row.date] = (map[row.date] ?? 0) + (row.kcal ?? 0)
        setWorkoutKcalByDate(map)
        setWorkoutRows(rows)
      })
      .finally(() => setWorkoutLoading(false))
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

  const loading = loadingSettings || loadingDiary
  const { kcalTarget = 0, pTarget = 0, cTarget = 0, gTarget = 0, bmr, tdee } = settings ?? {}
  const { totals, kcalTreino } = diary
  const isToday = selectedDate === todayIso
  const currentWorkout = useMemo(
    () => workoutRows.find(row => row.date === selectedDate) ?? null,
    [workoutRows, selectedDate],
  )
  const recommendation = useMemo(
    () => buildWorkoutRecommendation(workoutRows, customExercises, selectedDate),
    [workoutRows, customExercises, selectedDate],
  )
  const workoutSummary = useMemo(
    () => currentWorkout == null ? null : buildCompletedWorkoutSummary(currentWorkout, workoutRows, customExercises),
    [currentWorkout, workoutRows, customExercises],
  )
  const workoutFocus = useMemo(
    () => currentWorkout == null ? [] : workoutFocusLabels(currentWorkout, customExercises),
    [currentWorkout, customExercises],
  )
  const insight = buildHomeInsight({
    p: totals.p,
    pTarget,
    c: totals.c,
    cTarget,
    kcal: totals.kcal,
    kcalTarget,
    workoutDone: currentWorkout != null,
    habits,
    date: selectedDate,
    settingsConfigured: settings != null,
  })

  return (
    <div className="home-page">
      <div className="home-date-line">{formatDate(selectedDate)}</div>

      <WorkoutDashboard
        isToday={isToday}
        loading={workoutLoading || loadingCustomExercises}
        recommendation={recommendation}
        summary={workoutSummary}
        focus={workoutFocus}
        onRecommend={() => navigate('/treino?recommend=1')}
        onOpenWorkout={() => navigate('/treino')}
      />

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
        todayStr={selectedDate}
        onToggle={toggleHabit}
        onOpenHistory={() => setHabitHistOpen(true)}
      />

      {insight && (
        <HomeCard className={`home-alert ${insight.tone}`}>
          <span>{insight.kicker}</span>
          <strong>{insight.title}</strong>
          <small>{insight.text}</small>
        </HomeCard>
      )}

      <WeeklyChart
        weekDays={weekDays}
        weekKcal={weekKcal}
        goal={kcalTarget}
        todayKcal={isToday ? totals.kcal : (weekKcal[todayIso] ?? 0)}
        bmr={bmr}
        workoutKcalByDate={workoutKcalByDate}
        todayWorkoutKcal={isToday ? kcalTreino : (workoutKcalByDate[todayIso] ?? 0)}
        onOpenDetail={handleOpenWeeklyModal}
      />

      <EnergySnapshot
        consumed={totals.kcal}
        bmr={bmr}
        tdee={tdee}
        kcalTreino={kcalTreino}
        kcalTarget={kcalTarget}
      />

      <HabitHistoryModal
        open={habitHistOpen}
        onClose={() => setHabitHistOpen(false)}
        getAllHabits={getAllHabits}
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
