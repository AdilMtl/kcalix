import { useState } from 'react'
import { useDiary, MEAL_LABELS } from '../hooks/useDiary'
import { useSettings } from '../hooks/useSettings'
import { useDateStore } from '../store/dateStore'
import { useChatStore } from '../store/chatStore'
import FoodDrawer from '../components/FoodDrawer'
import Skeleton from '../components/Skeleton'
import { DiaryHistoryModal } from '../components/DiaryHistoryModal'
import type { MealKey, FoodEntry } from '../hooks/useDiary'
import { calcWaterGoal } from '../lib/calculators'

function round1(n: number) { return Math.round(n * 10) / 10 }

// ─── KPI Card (macro individual) ─────────────────────────────────────────────
interface KpiCardProps {
  label: string
  value: number
  target: number
  colorVar: string     // ex: 'var(--pColor)'
  kpiClass: string     // ex: 'kpi-p'
}

function KpiCard({ label, value, target, colorVar, kpiClass }: KpiCardProps) {
  const pct = target > 0 ? Math.min(100, (value / target) * 100) : 0

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius-sm)',
        padding: '10px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* barra colorida no topo */}
      <div
        style={{
          position: 'absolute',
          top: 0, left: 0,
          width: `${pct}%`,
          height: '3px',
          background: colorVar,
          borderRadius: '0 3px 3px 0',
          transition: 'width .4s ease',
        }}
      />
      {/* label */}
      <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '4px' }}>
        {label}
      </p>
      {/* valor + meta */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        <span style={{ fontSize: '20px', fontWeight: 800, lineHeight: 1, color: 'var(--text)' }}>
          {round1(value)}
        </span>
        {target > 0 && (
          <span style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: 600 }}>
            /{target}g
          </span>
        )}
      </div>
      {/* barra interna */}
      <div style={{ height: '6px', background: 'rgba(255,255,255,.06)', borderRadius: '999px', overflow: 'hidden', marginTop: '6px' }}>
        <div
          className={kpiClass}
          style={{
            height: '100%',
            width: `${pct}%`,
            borderRadius: '999px',
            transition: 'width .4s ease',
            background: colorVar,
          }}
        />
      </div>
    </div>
  )
}

// ─── Status Pill ─────────────────────────────────────────────────────────────
interface SpillProps {
  label: string
  value: number
  target: number
}

function StatusPill({ label, value, target }: SpillProps) {
  const diff = round1(value - target)
  const status = diff > 2 ? 'over' : diff < -2 ? 'warn' : 'ok'
  const dotColor = status === 'ok' ? 'var(--good)' : status === 'warn' ? 'var(--warn)' : 'var(--bad)'
  const sign = diff > 0 ? '+' : ''

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      fontSize: '11px', fontWeight: 700,
      padding: '4px 10px', borderRadius: '999px',
      background: 'var(--surface)', border: '1px solid var(--line)',
      color: 'var(--text2)',
    }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: dotColor, display: 'inline-block', flexShrink: 0 }} />
      {label} {sign}{diff}
    </span>
  )
}

// ─── Meal Accordion ───────────────────────────────────────────────────────────
interface MealAccordionProps {
  meal: MealKey
  label: string
  entries: FoodEntry[]
  isOpen: boolean
  onToggle: () => void
  onRemove: (idx: number) => void
  onQuick: (meal: MealKey, macro: 'p' | 'c' | 'g', delta: number) => void
}

function MealAccordion({ meal, label, entries, isOpen, onToggle, onRemove, onQuick }: MealAccordionProps) {
  const mealP = round1(entries.reduce((s, e) => s + e.p, 0))
  const mealC = round1(entries.reduce((s, e) => s + e.c, 0))
  const mealG = round1(entries.reduce((s, e) => s + e.g, 0))
  const mealKcal = Math.round(entries.reduce((s, e) => s + e.kcal, 0))

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
      {/* Header clicável */}
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', cursor: 'pointer' }}
        onClick={onToggle}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>{label}</span>
          {(mealP > 0 || mealC > 0 || mealG > 0) && !isOpen && (
            <span style={{ fontSize: '12px', color: 'var(--text2)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
              {mealP}P · {mealC}C · {mealG}G
              {mealKcal > 0 && <span style={{ color: 'var(--text3)', marginLeft: '6px' }}>{mealKcal} kcal</span>}
            </span>
          )}
        </div>
        <span style={{ color: 'var(--text3)', fontSize: '12px', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s ease', flexShrink: 0 }}>
          ▾
        </span>
      </div>

      {/* Body colapsável */}
      <div style={{
        maxHeight: isOpen ? '600px' : '0',
        overflow: 'hidden',
        transition: 'max-height .3s ease',
      }}>
        <div style={{ padding: '0 12px 12px', borderTop: '1px solid var(--line)' }}>

          {/* Inputs P / C / G inline */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginTop: '12px' }}>
            {([
              { key: 'p', label: 'P', val: mealP, color: 'var(--pColor)' },
              { key: 'c', label: 'C', val: mealC, color: 'var(--cColor)' },
              { key: 'g', label: 'G', val: mealG, color: 'var(--gColor)' },
            ] as { key: 'p' | 'c' | 'g'; label: string; val: number; color: string }[]).map(({ key, label: lbl, val, color }) => (
              <div key={key} style={{
                background: 'rgba(0,0,0,.15)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-xs)',
                padding: '8px',
              }}>
                <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.3px', color, marginBottom: '2px' }}>
                  {lbl}
                </p>
                <p style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>
                  {val}
                </p>
              </div>
            ))}
          </div>

          {/* Quick buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
            {([
              { label: '+.5P', macro: 'p', delta: 0.5, style: { borderColor: 'rgba(248,113,113,.2)', color: '#fca5a5' } },
              { label: '+1P',  macro: 'p', delta: 1,   style: { borderColor: 'rgba(248,113,113,.2)', color: '#fca5a5' } },
              { label: '+.5C', macro: 'c', delta: 0.5, style: { borderColor: 'rgba(251,191,36,.2)',  color: '#fde68a' } },
              { label: '+1C',  macro: 'c', delta: 1,   style: { borderColor: 'rgba(251,191,36,.2)',  color: '#fde68a' } },
              { label: '+.5G', macro: 'g', delta: 0.5, style: { borderColor: 'rgba(52,211,153,.2)',  color: '#6ee7b7' } },
              { label: '+1G',  macro: 'g', delta: 1,   style: { borderColor: 'rgba(52,211,153,.2)',  color: '#6ee7b7' } },
            ] as { label: string; macro: 'p' | 'c' | 'g'; delta: number; style: React.CSSProperties }[]).map(({ label: lbl, macro, delta, style }) => (
              <button
                key={lbl}
                onClick={() => onQuick(meal, macro, delta)}
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  padding: '6px 10px', borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--line)',
                  background: 'var(--surface2)',
                  fontFamily: 'var(--font)', fontSize: '12px', fontWeight: 700,
                  cursor: 'pointer', minHeight: '36px',
                  ...style,
                }}
              >
                {lbl}
              </button>
            ))}
            <button
              onClick={() => onRemove(-1)}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                padding: '6px 10px', borderRadius: 'var(--radius-xs)',
                border: '1px solid rgba(255,255,255,.08)', background: 'var(--surface2)',
                fontFamily: 'var(--font)', fontSize: '12px', fontWeight: 700,
                cursor: 'pointer', minHeight: '36px', color: 'var(--text3)',
              }}
            >
              Limpar
            </button>
          </div>

          {/* Lista de alimentos */}
          {entries.length > 0 && (
            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '0' }}>
              {entries.map((entry, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px 0',
                    borderTop: idx > 0 ? '1px solid var(--line)' : '1px solid var(--line)',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13px', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {entry.nome}
                      {entry.qty !== 1 && (
                        <span style={{ marginLeft: '4px', fontSize: '11px', color: 'var(--text3)' }}>×{entry.qty}</span>
                      )}
                    </p>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--pColor)', fontVariantNumeric: 'tabular-nums' }}>{round1(entry.p)}P</span>
                      <span style={{ fontSize: '11px', color: 'var(--cColor)', fontVariantNumeric: 'tabular-nums' }}>{round1(entry.c)}C</span>
                      <span style={{ fontSize: '11px', color: 'var(--gColor)', fontVariantNumeric: 'tabular-nums' }}>{round1(entry.g)}G</span>
                      <span style={{ fontSize: '11px', color: 'var(--text3)', fontVariantNumeric: 'tabular-nums' }}>{Math.round(entry.kcal)} kcal</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemove(idx)}
                    style={{
                      width: '24px', height: '24px', borderRadius: '50%',
                      background: 'var(--surface3)', color: 'var(--text3)',
                      border: 'none', fontSize: '11px', cursor: 'pointer', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                    aria-label="Remover"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {entries.length === 0 && (
            <p style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '10px' }}>Nenhum alimento</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── WaterBar ────────────────────────────────────────────────────────────────

const WATER_PRESETS = [100, 200, 300, 500] as const

interface WaterBarProps {
  waterMl: number
  goalMl: number
  weightKg: number
  onAdd: (ml: number) => void
  onReset: () => void
  breakdown: ReturnType<typeof calcWaterGoal>['breakdown'] | null
  confidence: ReturnType<typeof calcWaterGoal>['confidence']
  sources: string[]
}

function WaterBar({ waterMl, goalMl, weightKg, onAdd, onReset, breakdown, confidence, sources }: WaterBarProps) {
  const [showBreakdown, setShowBreakdown] = useState(false)
  const pct = goalMl > 0 ? Math.min(100, (waterMl / goalMl) * 100) : 0
  const done = pct >= 100

  function fmt(ml: number) {
    return ml >= 1000 ? `${(ml / 1000).toFixed(1).replace('.0', '')} L` : `${ml} ml`
  }

  return (
    <div style={{
      background: 'linear-gradient(180deg, rgba(18,24,38,.9), rgba(14,20,34,.9))',
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow)',
    }}>
      {/* Cabeçalho — clicável para abrir breakdown (estilo acc-trigger) */}
      <button
        onClick={() => setShowBreakdown(v => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '14px 16px 0',
          background: 'transparent', border: 'none', cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent', fontFamily: 'var(--font)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: 16 }}>💧</span>
          <span style={{ fontSize: 18, fontWeight: 800, color: done ? 'var(--good)' : 'var(--accent2)' }}>
            {fmt(waterMl)}
          </span>
          <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600 }}>
            de {fmt(goalMl)}
          </span>
        </div>
        <span style={{
          fontSize: 12, color: 'var(--text3)',
          display: 'inline-block',
          transform: showBreakdown ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform .2s ease',
        }}>▾</span>
      </button>

      <div style={{ padding: '10px 16px 14px' }}>
        {/* Barra de progresso */}
        <div style={{
          height: 6, background: 'rgba(255,255,255,.06)',
          borderRadius: 999, overflow: 'hidden', marginBottom: 12,
        }}>
          <div style={{
            height: '100%', width: `${pct}%`,
            background: done ? 'var(--good)' : 'linear-gradient(90deg, #38bdf8, #7c5cff)',
            borderRadius: 999,
            transition: 'width .3s ease',
          }} />
        </div>

        {/* Botões de adição */}
        <div style={{ display: 'flex', gap: 6 }}>
          {WATER_PRESETS.map(ml => (
            <button
              key={ml}
              onClick={() => onAdd(ml)}
              style={{
                flex: 1, minHeight: 44, padding: '6px 0',
                background: 'var(--surface2)', border: '1px solid var(--line)',
                borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                color: 'var(--text)', fontFamily: 'var(--font)',
                fontSize: 12, fontWeight: 600,
                WebkitTapHighlightColor: 'transparent',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 1,
              }}
            >
              <span style={{ fontSize: 16, lineHeight: 1 }}>🥛</span>
              <span>+{ml}</span>
            </button>
          ))}
          {/* Botão zerar — só aparece se tem algo registrado */}
          {waterMl > 0 && (
            <button
              onClick={onReset}
              aria-label="Zerar consumo"
              style={{
                width: 24, height: 24, borderRadius: '50%',
                background: 'var(--surface3)', color: 'var(--text3)',
                border: 'none', fontSize: 11, cursor: 'pointer', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                alignSelf: 'center',
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Breakdown — dropdown estilo accordion */}
        {showBreakdown && breakdown && (
          <div style={{
            marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--line)',
            fontSize: 12, color: 'var(--text3)', lineHeight: 1.9,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Base ({weightKg}kg × 35 ml)</span>
              <span style={{ color: 'var(--text2)' }}>{breakdown.base} ml</span>
            </div>
            {breakdown.sexAdj !== 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>+ Sexo masculino</span>
                <span style={{ color: 'var(--good)' }}>+{breakdown.sexAdj} ml</span>
              </div>
            )}
            {breakdown.actAdj !== 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>+ Nível de atividade</span>
                <span style={{ color: 'var(--good)' }}>+{breakdown.actAdj} ml</span>
              </div>
            )}
            {breakdown.goalAdj !== 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>+ Objetivo (corte/recomp)</span>
                <span style={{ color: 'var(--good)' }}>+{breakdown.goalAdj} ml</span>
              </div>
            )}
            {breakdown.bfAdj !== 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>− BF% elevado</span>
                <span style={{ color: '#fbbf24' }}>{breakdown.bfAdj} ml</span>
              </div>
            )}
            <div style={{
              marginTop: 6, paddingTop: 6, borderTop: '1px solid var(--line)',
              display: 'flex', justifyContent: 'space-between',
            }}>
              <span style={{ color: 'var(--text2)', fontWeight: 600 }}>Meta</span>
              <span style={{ color: 'var(--accent2)', fontWeight: 700 }}>{goalMl} ml</span>
            </div>
            <div style={{ marginTop: 4, fontSize: 10, color: 'var(--text3)', opacity: .7 }}>
              Confiança: {confidence === 'high' ? '● alta (com BF%)' : confidence === 'medium' ? '● média (perfil)' : '● baixa'}
              {' · '}Fontes: {sources.join(', ')}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── DiarioPage ───────────────────────────────────────────────────────────────
export default function DiarioPage() {
  const { selectedDate } = useDateStore()
  const { diary, loading, removeFood, addFoodOptimistic, getAllDiaryRows, addWaterMl, resetWaterMl } = useDiary(selectedDate)
  const { settings } = useSettings()
  const { openChat } = useChatStore()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [histOpen, setHistOpen] = useState(false)
  const [openMealId, setOpenMealId] = useState<MealKey | null>(null)

  const { totals } = diary
  const kcalTarget = settings?.kcalTarget ?? 0
  const pTarget    = settings?.pTarget    ?? 0
  const cTarget    = settings?.cTarget    ?? 0
  const gTarget    = settings?.gTarget    ?? 0

  // ── Hidratação ───────────────────────────────────────────────────────────
  const waterRec = settings
    ? calcWaterGoal(
        settings.sex,
        settings.weightKg,
        settings.activityFactor,
        settings.goal,
      )
    : null
  // Meta manual sobrescreve o cálculo automático
  const waterGoalMl = settings?.waterGoalMl ?? waterRec?.goalMl ?? 0

  function toggleMeal(meal: MealKey) {
    setOpenMealId(prev => prev === meal ? null : meal)
  }

  // Quick button: adiciona um bloco manual de macro (sem alimento real)
  function handleQuick(meal: MealKey, macro: 'p' | 'c' | 'g', delta: number) {
    const kcalMap = { p: 4, c: 4, g: 9 }
    const entry = {
      foodId: `manual-${macro}-${Date.now()}`,
      nome: `+${delta}${macro.toUpperCase()} manual`,
      qty: 1,
      porcaoG: 0,
      p: macro === 'p' ? delta : 0,
      c: macro === 'c' ? delta : 0,
      g: macro === 'g' ? delta : 0,
      kcal: delta * kcalMap[macro],
      at: new Date().toISOString(),
    }
    addFoodOptimistic(meal, entry)
  }

  function handleRemove(meal: MealKey, idx: number) {
    if (idx === -1) {
      // "Limpar" — remove todos os itens da refeição
      // fazemos removeFood um por vez da última pra primeira para não deslocar índices
      const len = diary.meals[meal].length
      for (let i = len - 1; i >= 0; i--) {
        removeFood(meal, i)
      }
    } else {
      removeFood(meal, idx)
    }
  }

  return (
    <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px 16px 140px' }}>

      {/* ── Card de totais do dia ── */}
      <div style={{ background: 'linear-gradient(180deg, rgba(18,24,38,.9), rgba(14,20,34,.9))', border: '1px solid var(--line)', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
        <div style={{ padding: '14px 16px 16px' }}>

          {/* KPI grid — 3 cards */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <Skeleton height="64px" />
              <Skeleton height="64px" />
              <Skeleton height="64px" />
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <KpiCard label="Proteína" value={totals.p} target={pTarget} colorVar="var(--pColor)" kpiClass="kpi-p" />
              <KpiCard label="Carbo"    value={totals.c} target={cTarget} colorVar="var(--cColor)" kpiClass="kpi-c" />
              <KpiCard label="Gordura"  value={totals.g} target={gTarget} colorVar="var(--gColor)" kpiClass="kpi-g" />
            </div>
          )}

          {/* Linha de kcal com gradient text + ícone histórico */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--line)' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
              <span style={{
                fontSize: '20px', fontWeight: 800,
                background: 'linear-gradient(135deg, var(--accent2), var(--good))',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                {loading ? '--' : Math.round(totals.kcal)}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: 600 }}>
                kcal{kcalTarget > 0 ? ` de ${kcalTarget}` : ''}
              </span>
            </div>
            <button
              onClick={() => setHistOpen(true)}
              title="Histórico"
              style={{
                background: 'transparent',
                border: '1px solid var(--line)',
                borderRadius: 8,
                padding: '5px 9px',
                fontSize: '16px',
                cursor: 'pointer',
                lineHeight: 1,
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              📊
            </button>
          </div>

          {/* Status pills — só mostrar se há metas configuradas */}
          {!loading && (pTarget > 0 || cTarget > 0 || gTarget > 0) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
              {pTarget > 0 && <StatusPill label="P" value={totals.p} target={pTarget} />}
              {cTarget > 0 && <StatusPill label="C" value={totals.c} target={cTarget} />}
              {gTarget > 0 && <StatusPill label="G" value={totals.g} target={gTarget} />}
            </div>
          )}

          {/* Adicionar alimentos — 3 entradas */}
          <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--line)' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
              Adicionar alimentos
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
              {[
                { icon: '🔍', label: 'Lista',     onClick: () => setDrawerOpen(true) },
                { icon: '✨', label: 'Descrever', onClick: () => openChat({ input: 'comi ' }) },
                { icon: '📷', label: 'Foto',      onClick: () => openChat({ photo: true }) },
              ].map(({ icon, label, onClick }) => (
                <button
                  key={label}
                  onClick={onClick}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: '4px', padding: '10px 6px', minHeight: '60px',
                    borderRadius: 'var(--radius-sm)', border: '1px solid rgba(124,92,255,0.35)',
                    background: 'rgba(124,92,255,0.08)', color: 'var(--text)',
                    fontFamily: 'var(--font)', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: '18px' }}>{icon}</span>
                  {label}
                </button>
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* ── Card de hidratação ── */}
      {!loading && waterGoalMl > 0 && (
        <WaterBar
          waterMl={diary.waterMl ?? 0}
          goalMl={waterGoalMl}
          weightKg={settings?.weightKg ?? 0}
          onAdd={addWaterMl}
          onReset={resetWaterMl}
          breakdown={waterRec?.breakdown ?? null}
          confidence={waterRec?.confidence ?? 'medium'}
          sources={waterRec?.sources ?? []}
        />
      )}
      {!loading && !settings && (
        <div style={{
          background: 'rgba(56,189,248,.07)', border: '1px solid rgba(56,189,248,.2)',
          borderRadius: 'var(--radius)', padding: '12px 14px',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 20 }}>💧</span>
          <span style={{ fontSize: 13, color: 'var(--text2)' }}>
            Preencha seu perfil para uma meta de hidratação personalizada.
          </span>
        </div>
      )}

      {/* ── Refeições (accordion) ── */}
      {loading ? (
        <>
          <Skeleton height="52px" borderRadius="var(--radius)" />
          <Skeleton height="52px" borderRadius="var(--radius)" />
          <Skeleton height="52px" borderRadius="var(--radius)" />
        </>
      ) : (Object.keys(MEAL_LABELS) as MealKey[]).map(meal => (
        <MealAccordion
          key={meal}
          meal={meal}
          label={MEAL_LABELS[meal]}
          entries={diary.meals[meal]}
          isOpen={openMealId === meal}
          onToggle={() => toggleMeal(meal)}
          onRemove={(idx) => handleRemove(meal, idx)}
          onQuick={handleQuick}
        />
      ))}

      {/* FoodDrawer — addFoodOptimistic passado via prop para garantir estado único */}
      {drawerOpen && (
        <FoodDrawer
          onClose={() => setDrawerOpen(false)}
          onAddFood={addFoodOptimistic}
        />
      )}


      {/* DiaryHistoryModal */}
      <DiaryHistoryModal
        open={histOpen}
        onClose={() => setHistOpen(false)}
        getAllDiaryRows={getAllDiaryRows}
        kcalTarget={kcalTarget}
      />
    </div>
  )
}
