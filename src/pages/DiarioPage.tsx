import { useState } from 'react'
import { useDiary, MEAL_LABELS } from '../hooks/useDiary'
import { useSettings } from '../hooks/useSettings'
import FoodDrawer from '../components/FoodDrawer'
import type { MealKey } from '../hooks/useDiary'

function round1(n: number) { return Math.round(n * 10) / 10 }

function MacroTag({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <span className="text-xs tabular-nums" style={{ color }}>
      {round1(value)}{label}
    </span>
  )
}

export default function DiarioPage() {
  const { diary, loading, removeFood } = useDiary()
  const { settings } = useSettings()
  const [openDrawer, setOpenDrawer] = useState<MealKey | null>(null)

  const { totals } = diary
  const kcalTarget = settings?.kcalTarget ?? 0
  const pTarget = settings?.pTarget ?? 0
  const cTarget = settings?.cTarget ?? 0
  const gTarget = settings?.gTarget ?? 0

  function pct(v: number, t: number) {
    if (t <= 0) return 0
    return Math.min(100, Math.round((v / t) * 100))
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div
          className="h-7 w-7 animate-spin rounded-full border-2 border-transparent"
          style={{ borderTopColor: 'var(--accent)' }}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 px-4 py-5">
      {/* Totais do dia */}
      <div
        className="rounded-2xl p-4"
        style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}
      >
        <div className="mb-3 flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold tabular-nums" style={{ color: 'var(--text)' }}>
              {Math.round(totals.kcal)}
            </p>
            <p className="text-xs" style={{ color: 'var(--text3)' }}>
              kcal{kcalTarget > 0 ? ` de ${kcalTarget}` : ''}
            </p>
          </div>
          <div className="flex gap-3">
            <MacroTag value={totals.p} label="P" color="var(--good)" />
            <MacroTag value={totals.c} label="C" color="var(--warn)" />
            <MacroTag value={totals.g} label="G" color="var(--bad)" />
          </div>
        </div>

        {/* Barras de macro */}
        <div className="flex flex-col gap-1.5">
          {[
            { label: 'P', value: totals.p, target: pTarget, color: 'var(--good)' },
            { label: 'C', value: totals.c, target: cTarget, color: 'var(--warn)' },
            { label: 'G', value: totals.g, target: gTarget, color: 'var(--bad)' },
          ].map(({ label, value, target, color }) => (
            <div key={label} className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: 'var(--surface3)' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pct(value, target)}%`, background: color }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Seções de refeição */}
      {(Object.keys(MEAL_LABELS) as MealKey[]).map(meal => {
        const entries = diary.meals[meal]
        const mealKcal = entries.reduce((acc, e) => acc + e.kcal, 0)

        return (
          <div
            key={meal}
            className="rounded-2xl overflow-hidden"
            style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}
          >
            {/* Header da refeição */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                  {MEAL_LABELS[meal]}
                </span>
                {mealKcal > 0 && (
                  <span className="text-xs tabular-nums" style={{ color: 'var(--text3)' }}>
                    {Math.round(mealKcal)} kcal
                  </span>
                )}
              </div>
              <button
                onClick={() => setOpenDrawer(meal)}
                className="flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold transition-opacity active:opacity-60"
                style={{ background: 'var(--accent)', color: '#fff' }}
                aria-label={`Adicionar alimento em ${MEAL_LABELS[meal]}`}
              >
                +
              </button>
            </div>

            {/* Lista de itens */}
            {entries.length === 0 ? (
              <p className="px-4 pb-3 text-xs" style={{ color: 'var(--text3)' }}>
                Nenhum alimento
              </p>
            ) : (
              <div style={{ borderTop: '1px solid var(--line)' }}>
                {entries.map((entry, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-4 py-2.5"
                    style={{ borderBottom: idx < entries.length - 1 ? '1px solid var(--line)' : undefined }}
                  >
                    <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                      <p className="truncate text-sm" style={{ color: 'var(--text)' }}>
                        {entry.nome}
                        {entry.qty !== 1 && (
                          <span className="ml-1 text-xs" style={{ color: 'var(--text3)' }}>
                            ×{entry.qty}
                          </span>
                        )}
                      </p>
                      <div className="flex gap-2">
                        <MacroTag value={entry.p} label="P" color="var(--good)" />
                        <MacroTag value={entry.c} label="C" color="var(--warn)" />
                        <MacroTag value={entry.g} label="G" color="var(--bad)" />
                        <span className="text-xs tabular-nums" style={{ color: 'var(--text3)' }}>
                          {Math.round(entry.kcal)} kcal
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFood(meal, idx)}
                      className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs transition-opacity active:opacity-60"
                      style={{ background: 'var(--surface3)', color: 'var(--text3)' }}
                      aria-label="Remover"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}

      {/* FoodDrawer */}
      {openDrawer && (
        <FoodDrawer
          meal={openDrawer}
          onClose={() => setOpenDrawer(null)}
        />
      )}
    </div>
  )
}
