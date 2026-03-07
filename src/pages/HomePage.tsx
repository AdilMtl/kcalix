import { useSettings } from '../hooks/useSettings'
import { useDiary } from '../hooks/useDiary'

// ── Helpers ──────────────────────────────────────────────────────────────────

function pct(value: number, total: number): number {
  if (total <= 0) return 0
  return Math.min(100, Math.round((value / total) * 100))
}

function saldoLabel(kcal: number): string {
  if (kcal > 0) return `+${Math.round(kcal)} kcal superávit`
  if (kcal < 0) return `${Math.round(kcal)} kcal déficit`
  return 'Equilibrado'
}

function saldoColor(kcal: number): string {
  if (kcal > 200)  return 'var(--bad)'
  if (kcal < -600) return 'var(--warn)'
  if (kcal < 0)    return 'var(--good)'
  return 'var(--text2)'
}

// ── Componentes internos ─────────────────────────────────────────────────────

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}
    >
      {children}
    </div>
  )
}

function MacroBar({ label, value, target, color }: { label: string; value: number; target: number; color: string }) {
  const p = pct(value, target)
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs" style={{ color: 'var(--text2)' }}>
        <span>{label}</span>
        <span>{Math.round(value)}g / {target}g</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: 'var(--surface3)' }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${p}%`, background: color }}
        />
      </div>
    </div>
  )
}

// Gráfico semanal simples — placeholder sem dados reais até Sessão 2B
function WeeklyChart({ consumed, target }: { consumed: number; target: number }) {
  const today = new Date()
  const days = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
  const todayIdx = today.getDay()

  return (
    <div className="flex items-end justify-between gap-1" style={{ height: 56 }}>
      {days.map((d, i) => {
        const isToday = i === todayIdx
        const barPct = isToday ? pct(consumed, target) : 0
        return (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <div className="relative flex w-full flex-1 items-end justify-center">
              <div
                className="w-full rounded-sm"
                style={{
                  height: isToday ? `${Math.max(barPct, 4)}%` : '4%',
                  background: isToday ? 'var(--accent)' : 'var(--surface3)',
                  minHeight: 3,
                }}
              />
            </div>
            <span className="text-[9px]" style={{ color: isToday ? 'var(--accent2)' : 'var(--text3)' }}>{d}</span>
          </div>
        )
      })}
    </div>
  )
}

// Card de hábitos — placeholder até Sessão 4
function HabitsPlaceholder() {
  const habits = [
    { label: 'Água 2L', emoji: '💧' },
    { label: 'Dieta', emoji: '🥗' },
    { label: 'Treino', emoji: '🏋️' },
    { label: 'Sono 7h+', emoji: '😴' },
  ]
  return (
    <Card>
      <p className="mb-3 text-sm font-semibold" style={{ color: 'var(--text)' }}>Hábitos do dia</p>
      <div className="grid grid-cols-2 gap-2">
        {habits.map(h => (
          <div
            key={h.label}
            className="flex items-center gap-2 rounded-xl px-3 py-2"
            style={{ background: 'var(--surface2)', color: 'var(--text3)' }}
          >
            <span className="text-base">{h.emoji}</span>
            <span className="text-xs">{h.label}</span>
          </div>
        ))}
      </div>
      <p className="mt-2 text-center text-[10px]" style={{ color: 'var(--text3)' }}>Hábitos disponíveis na Fase 4</p>
    </Card>
  )
}

// Estado vazio — sem configuração de perfil
function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
      <div className="text-5xl">⚡</div>
      <p className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Configure seu perfil</p>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--text2)' }}>
        Para ver seu dashboard de energia, macros e metas diárias, você precisa configurar seu perfil nutricional.
      </p>
      <button
        className="mt-2 rounded-2xl px-6 py-3 text-sm font-semibold transition-opacity active:opacity-70"
        style={{ background: 'var(--accent)', color: '#fff' }}
        disabled
      >
        Configurar perfil — em breve
      </button>
      <p className="text-xs" style={{ color: 'var(--text3)' }}>O wizard de configuração será implementado na Fase 4</p>
    </div>
  )
}

// ── Página principal ─────────────────────────────────────────────────────────

export default function HomePage() {
  const { settings, loading: loadingSettings } = useSettings()
  const { diary, loading: loadingDiary } = useDiary()

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

  if (!settings) {
    return <EmptyState />
  }

  const { kcalTarget, pTarget, cTarget, gTarget, bmr, tdee } = settings
  const { totals, kcalTreino } = diary
  const kcalConsumed = totals.kcal
  const kcalMeta = bmr != null ? bmr + kcalTreino : kcalTarget
  const saldo = kcalConsumed - kcalMeta
  const kcalPct = pct(kcalConsumed, kcalTarget)

  return (
    <div className="flex flex-col gap-3 px-4 py-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs" style={{ color: 'var(--text3)' }}>
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Card energia principal */}
      <Card>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold tabular-nums" style={{ color: 'var(--text)' }}>
              {Math.round(kcalConsumed)}
            </p>
            <p className="text-xs" style={{ color: 'var(--text3)' }}>
              kcal consumidas de {kcalTarget}
            </p>
          </div>
          <p className="text-sm font-semibold" style={{ color: saldoColor(saldo) }}>
            {saldoLabel(saldo)}
          </p>
        </div>

        {/* Barra de progresso kcal */}
        <div className="mb-4 h-2 w-full overflow-hidden rounded-full" style={{ background: 'var(--surface3)' }}>
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${kcalPct}%`,
              background: kcalPct > 100 ? 'var(--bad)' : 'var(--accent)',
            }}
          />
        </div>

        {/* Macros */}
        <div className="flex flex-col gap-2">
          <MacroBar label="Proteína" value={totals.p} target={pTarget} color="var(--good)" />
          <MacroBar label="Carboidrato" value={totals.c} target={cTarget} color="var(--warn)" />
          <MacroBar label="Gordura" value={totals.g} target={gTarget} color="var(--bad)" />
        </div>
      </Card>

      {/* Card TDEE info */}
      {tdee != null && (
        <div className="flex gap-2">
          <div className="flex flex-1 flex-col items-center rounded-2xl py-3" style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}>
            <p className="text-lg font-bold tabular-nums" style={{ color: 'var(--text)' }}>{Math.round(bmr ?? 0)}</p>
            <p className="text-[10px]" style={{ color: 'var(--text3)' }}>BMR</p>
          </div>
          <div className="flex flex-1 flex-col items-center rounded-2xl py-3" style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}>
            <p className="text-lg font-bold tabular-nums" style={{ color: 'var(--text)' }}>{Math.round(tdee)}</p>
            <p className="text-[10px]" style={{ color: 'var(--text3)' }}>TDEE</p>
          </div>
          <div className="flex flex-1 flex-col items-center rounded-2xl py-3" style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}>
            <p className="text-lg font-bold tabular-nums" style={{ color: 'var(--text)' }}>{Math.round(kcalTreino)}</p>
            <p className="text-[10px]" style={{ color: 'var(--text3)' }}>Treino</p>
          </div>
        </div>
      )}

      {/* Gráfico semanal */}
      <Card>
        <p className="mb-3 text-sm font-semibold" style={{ color: 'var(--text)' }}>Semana</p>
        <WeeklyChart consumed={kcalConsumed} target={kcalTarget} />
      </Card>

      {/* Hábitos placeholder */}
      <HabitsPlaceholder />
    </div>
  )
}
