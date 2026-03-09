// ══════════════════════════════════════════════════════════
// components/HabitTracker.tsx — Accordion de hábitos semanais
// ══════════════════════════════════════════════════════════
// Fiel ao original L8138–8222 (renderHabitTracker)
// CSS classes: .habit-card, .habit-trigger, .habit-dot, .habit-score (L1731–1815)

import { useState } from 'react'
import { HABITS_DEF, HABIT_DAY_LBLS, type HabitsMap } from '../types/habit'

interface Props {
  habits: HabitsMap
  weekDates: string[]
  todayStr: string
  onToggle: (date: string, key: string) => void
  onOpenHistory: () => void
}

export function HabitTracker({ habits, weekDates, todayStr, onToggle, onOpenHistory }: Props) {
  const [open, setOpen] = useState(true)

  const todayRow = habits[todayStr]
  const score = HABITS_DEF.filter(h => todayRow?.[h.id as keyof typeof todayRow]).length

  // ── Mês abreviado para o label da semana (original L8147)
  const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
  const fmtD = (iso: string) => {
    const [, m, d] = iso.split('-')
    return `${+d} ${MONTHS[+m - 1]}`
  }
  const weekLbl = weekDates.length === 7
    ? `${fmtD(weekDates[0])} – ${fmtD(weekDates[6])}`
    : ''

  // ── Score dots no trigger (original L8151–8153)
  // usa classe .lit + CSS custom property --h-color (fiel ao original)
  const ScoreDots = () => (
    <>
      {HABITS_DEF.map(h => {
        const checked = !!(todayRow?.[h.id as keyof typeof todayRow])
        return (
          <div
            key={h.id}
            className={`habit-score-dot${checked ? ' lit' : ''}`}
            style={{ ['--h-color' as string]: h.color }}
          />
        )
      })}
    </>
  )

  return (
    <div className={`habit-card${open ? ' open' : ''}`}>
      {/* ── Trigger (original L8182–8202) */}
      <div
        className="habit-trigger"
        onClick={() => setOpen(o => !o)}
      >
        <div className="habit-trigger-left">
          <span className="habit-title">⚡ Hábitos</span>
        </div>
        <div className="habit-trigger-right">
          <div className="habit-score-dots">
            <ScoreDots />
          </div>
          <span className="habit-score-num">{score}/{HABITS_DEF.length}</span>
          {/* Botão 📊 — original L8200–8202 */}
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onOpenHistory() }}
            style={{ background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', padding: '0 2px', lineHeight: 1 }}
            title="Histórico de hábitos"
          >📊</button>
          <span className="habit-chevron">▾</span>
        </div>
      </div>

      {/* ── Body (original L8155–8179) */}
      <div className="habit-body">
        <div className="habit-body-inner">

          {/* Label da semana */}
          <div className="habit-week-lbl">{weekLbl}</div>

          {/* Header dos dias (original L8156) */}
          <div className="habit-grid-head">
            <div />
            {weekDates.map((d, i) => (
              <div
                key={d}
                className={`habit-day-lbl${d === todayStr ? ' today-lbl' : ''}`}
              >
                {HABIT_DAY_LBLS[i]}
              </div>
            ))}
          </div>

          {/* Linhas por hábito (original L8158–8171) */}
          {HABITS_DEF.map(habit => (
            <div key={habit.id} className="habit-row">
              <div className="habit-lbl">
                <span className="habit-lbl-icon">{habit.icon}</span>
                <span className="habit-lbl-text">{habit.label}</span>
              </div>
              {weekDates.map(date => {
                const row = habits[date]
                const checked = !!(row?.[habit.id as keyof typeof row])
                const isFuture = date > todayStr
                const isToday = date === todayStr

                let cls = 'habit-dot'
                if (checked) cls += ' checked'
                if (isFuture) cls += ' future-dot'
                else if (isToday) cls += ' today-dot'

                return (
                  <div key={date} className="habit-dot-wrap">
                    <button
                      type="button"
                      className={cls}
                      style={{ ['--h-color' as string]: habit.color }}
                      onClick={e => {
                        e.stopPropagation()
                        if (!isFuture) onToggle(date, habit.id)
                      }}
                    >
                      {checked ? '✓' : ''}
                    </button>
                  </div>
                )
              })}
            </div>
          ))}

          {/* Divider + score do dia (original L8173–8179) */}
          <div className="habit-divider" />
          <div className="habit-score">
            <span className="habit-score-lbl">Hoje</span>
            <div className="habit-score-dots">
              <ScoreDots />
            </div>
            <span className="habit-score-num">{score}/{HABITS_DEF.length}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
