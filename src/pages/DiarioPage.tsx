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
    <div className="diary-kpi">
      {/* barra colorida no topo */}
      <div
        className="diary-kpi-top"
        style={{
          width: `${pct}%`,
          background: colorVar,
        }}
      />
      {/* label */}
      <p className="diary-kpi-label">
        {label}
      </p>
      {/* valor + meta */}
      <div className="diary-kpi-value-row">
        <span className="diary-kpi-value">
          {round1(value)}
        </span>
        {target > 0 && (
          <span className="diary-kpi-target">
            /{target}g
          </span>
        )}
      </div>
      {/* barra interna */}
      <div className="diary-progress">
        <div
          className={`diary-progress-fill ${kpiClass}`}
          style={{
            width: `${pct}%`,
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
    <span className="diary-status-pill">
      <span className="diary-status-dot" style={{ background: dotColor }} />
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
    <div className="diary-meal">
      {/* Header clicável */}
      <div
        className="diary-meal-trigger"
        onClick={onToggle}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
          <span className="diary-meal-title">{label}</span>
          {(mealP > 0 || mealC > 0 || mealG > 0) && !isOpen && (
            <span className="diary-meal-summary">
              {mealP}P · {mealC}C · {mealG}G
              {mealKcal > 0 && <span style={{ color: 'var(--text3)', marginLeft: '6px' }}>{mealKcal} kcal</span>}
            </span>
          )}
        </div>
        <span className={`diary-chevron${isOpen ? ' open' : ''}`}>
          ▾
        </span>
      </div>

      {/* Body colapsável */}
      <div className="diary-meal-collapse" style={{ maxHeight: isOpen ? '600px' : '0' }}>
        <div className="diary-meal-body">

          {/* Inputs P / C / G inline */}
          <div className="diary-macro-grid">
            {([
              { key: 'p', label: 'P', val: mealP, color: 'var(--pColor)' },
              { key: 'c', label: 'C', val: mealC, color: 'var(--cColor)' },
              { key: 'g', label: 'G', val: mealG, color: 'var(--gColor)' },
            ] as { key: 'p' | 'c' | 'g'; label: string; val: number; color: string }[]).map(({ key, label: lbl, val, color }) => (
              <div key={key} className="diary-macro-box">
                <p className="diary-macro-label" style={{ color }}>
                  {lbl}
                </p>
                <p className="diary-macro-value">
                  {val}
                </p>
              </div>
            ))}
          </div>

          {/* Quick buttons */}
          <div className="diary-quick-row">
            {([
              { label: '+.5P', macro: 'p', delta: 0.5, style: { borderColor: 'color-mix(in srgb, var(--pColor) 26%, transparent)', color: 'var(--pColor)' } },
              { label: '+1P',  macro: 'p', delta: 1,   style: { borderColor: 'color-mix(in srgb, var(--pColor) 26%, transparent)', color: 'var(--pColor)' } },
              { label: '+.5C', macro: 'c', delta: 0.5, style: { borderColor: 'color-mix(in srgb, var(--cColor) 26%, transparent)', color: 'var(--cColor)' } },
              { label: '+1C',  macro: 'c', delta: 1,   style: { borderColor: 'color-mix(in srgb, var(--cColor) 26%, transparent)', color: 'var(--cColor)' } },
              { label: '+.5G', macro: 'g', delta: 0.5, style: { borderColor: 'color-mix(in srgb, var(--gColor) 26%, transparent)', color: 'var(--gColor)' } },
              { label: '+1G',  macro: 'g', delta: 1,   style: { borderColor: 'color-mix(in srgb, var(--gColor) 26%, transparent)', color: 'var(--gColor)' } },
            ] as { label: string; macro: 'p' | 'c' | 'g'; delta: number; style: React.CSSProperties }[]).map(({ label: lbl, macro, delta, style }) => (
              <button
                key={lbl}
                onClick={() => onQuick(meal, macro, delta)}
                className="diary-quick-btn"
                style={style}
              >
                {lbl}
              </button>
            ))}
            <button
              onClick={() => onRemove(-1)}
              className="diary-quick-btn"
              style={{ color: 'var(--text3)' }}
            >
              Limpar
            </button>
          </div>

          {/* Lista de alimentos */}
          {entries.length > 0 && (
            <div className="diary-food-list">
              {entries.map((entry, idx) => (
                <div
                  key={idx}
                  className="diary-food-entry"
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="diary-food-name">
                      {entry.nome}
                      {entry.qty !== 1 && (
                        <span style={{ marginLeft: '4px', fontSize: '11px', color: 'var(--text3)' }}>×{entry.qty}</span>
                      )}
                    </p>
                    <div className="diary-food-macros">
                      <span className="diary-food-macro" style={{ fontSize: '11px', color: 'var(--pColor)' }}>{round1(entry.p)}P</span>
                      <span className="diary-food-macro" style={{ fontSize: '11px', color: 'var(--cColor)' }}>{round1(entry.c)}C</span>
                      <span className="diary-food-macro" style={{ fontSize: '11px', color: 'var(--gColor)' }}>{round1(entry.g)}G</span>
                      <span className="diary-food-macro" style={{ fontSize: '11px', color: 'var(--text3)' }}>{Math.round(entry.kcal)} kcal</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemove(idx)}
                    className="diary-remove-btn"
                    aria-label="Remover"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {entries.length === 0 && (
            <p className="diary-empty" style={{ marginTop: '10px' }}>Nenhum alimento</p>
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
    <div className="diary-water">
      {/* Cabeçalho — clicável para abrir breakdown (estilo acc-trigger) */}
      <button
        onClick={() => setShowBreakdown(v => !v)}
        className="diary-water-trigger"
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span className="diary-water-value" style={{ color: done ? 'var(--good)' : 'var(--energy)' }}>
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

      <div className="diary-water-body">
        {/* Barra de progresso */}
        <div className="diary-water-progress">
          <div className="diary-water-progress-fill" style={{ width: `${pct}%`, background: done ? 'var(--good)' : undefined }} />
        </div>

        {/* Botões de adição */}
        <div className="diary-water-presets">
          {WATER_PRESETS.map(ml => (
            <button
              key={ml}
              onClick={() => onAdd(ml)}
              className="diary-water-btn"
            >
              <span>+{ml}</span>
            </button>
          ))}
          {/* Botão zerar — só aparece se tem algo registrado */}
          {waterMl > 0 && (
            <button
              onClick={onReset}
              aria-label="Zerar consumo"
              className="diary-remove-btn"
              style={{ alignSelf: 'center' }}
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
              <span className="diary-water-value" style={{ fontSize: 12, color: 'var(--energy)' }}>{goalMl} ml</span>
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
    <div className="diary-page">

      {/* ── Card de totais do dia ── */}
      <div className="diary-panel">
        <div style={{ padding: '14px 16px 16px' }}>

          {/* KPI grid — 3 cards */}
          {loading ? (
            <div className="diary-kpi-grid">
              <Skeleton height="64px" />
              <Skeleton height="64px" />
              <Skeleton height="64px" />
            </div>
          ) : (
            <div className="diary-kpi-grid">
              <KpiCard label="Proteína" value={totals.p} target={pTarget} colorVar="var(--pColor)" kpiClass="kpi-p" />
              <KpiCard label="Carbo"    value={totals.c} target={cTarget} colorVar="var(--cColor)" kpiClass="kpi-c" />
              <KpiCard label="Gordura"  value={totals.g} target={gTarget} colorVar="var(--gColor)" kpiClass="kpi-g" />
            </div>
          )}

          {/* Linha de kcal com gradient text + ícone histórico */}
          <div className="diary-kcal-row">
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
              <span className="diary-kcal-value">
                {loading ? '--' : Math.round(totals.kcal)}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: 600 }}>
                kcal{kcalTarget > 0 ? ` de ${kcalTarget}` : ''}
              </span>
            </div>
            <button
              onClick={() => setHistOpen(true)}
              title="Histórico"
              className="diary-history-btn"
            >
              HIST
            </button>
          </div>

          {/* Status pills — só mostrar se há metas configuradas */}
          {!loading && (pTarget > 0 || cTarget > 0 || gTarget > 0) && (
            <div className="diary-status-row">
              {pTarget > 0 && <StatusPill label="P" value={totals.p} target={pTarget} />}
              {cTarget > 0 && <StatusPill label="C" value={totals.c} target={cTarget} />}
              {gTarget > 0 && <StatusPill label="G" value={totals.g} target={gTarget} />}
            </div>
          )}

          {/* Adicionar alimentos — 3 entradas */}
          <div className="diary-actions">
            <p className="diary-section-label" style={{ marginBottom: '8px' }}>
              Adicionar alimentos
            </p>
            <div className="diary-action-grid">
              {[
                { icon: 'BUSCA', label: 'Lista',     onClick: () => setDrawerOpen(true) },
                { icon: 'TEXTO', label: 'Descrever', onClick: () => openChat({ input: 'comi ' }) },
                { icon: 'FOTO',  label: 'Foto',      onClick: () => openChat({ photo: true }) },
              ].map(({ icon, label, onClick }) => (
                <button
                  key={label}
                  onClick={onClick}
                  className="diary-action-btn"
                >
                  <span className="diary-action-icon">{icon}</span>
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
        <div className="diary-note">
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
