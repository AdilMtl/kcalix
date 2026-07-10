// BodyEvolutionModal — Port fiel ao original
// HTML: L3090–3107 (#mchartModal)
// CSS:  L1697–1724 (.mchart-*)
// JS:   L5339–5466 (renderMeasureChart)

import { useState, useRef, useCallback } from 'react'
import type { BodyRow } from '../types/body'

// ── tipos ─────────────────────────────────────────────────────────────────────

type Metric = 'weightKg' | 'waistCm' | 'bfPct'

interface MetricCfg {
  label: string
  unit: string
  color: string
}

const MCHART_CFG: Record<Metric, MetricCfg> = {
  weightKg: { label: 'Peso',    unit: 'kg', color: '#ff5c35' },
  waistCm:  { label: 'Cintura', unit: 'cm', color: '#ff2f7d' },
  bfPct:    { label: 'BF',      unit: '%',  color: '#21d4b4' },
}

// ── helpers ───────────────────────────────────────────────────────────────────

interface Point { date: string; val: number }

function buildPoints(rows: BodyRow[], metric: Metric): Point[] {
  return rows
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(r => ({ date: r.date, val: r[metric] ?? null }))
    .filter((p): p is Point => p.val != null)
}

// ── SVG do gráfico ────────────────────────────────────────────────────────────

interface ChartSvgProps {
  points: Point[]
  cfg: MetricCfg
  onTooltip: (info: { text: string; x: number; y: number } | null) => void
}

function ChartSvg({ points, cfg, onTooltip }: ChartSvgProps) {
  const W   = 320   // será esticado por width:100%
  const H   = 180
  const PAD = { top: 20, right: 16, bottom: 38, left: 44 }
  const cW  = W - PAD.left - PAD.right
  const cH  = H - PAD.top  - PAD.bottom
  const n   = points.length

  const vals = points.map(p => p.val)
  const minV = Math.min(...vals)
  const maxV = Math.max(...vals)
  const span = maxV - minV || 1

  const xOf = (i: number) => PAD.left + (n === 1 ? cW / 2 : (i / (n - 1)) * cW)
  const yOf = (v: number) => PAD.top  + cH - ((v - minV) / span) * cH

  // Y-axis ticks
  const ticks = [0, 1, 2, 3].map(i => {
    const v = minV + (span / 3) * i
    const y = yOf(v)
    return { v, y }
  })

  // X-axis labels (até 6)
  const maxLbl = Math.min(6, n)
  const xlabels = Array.from({ length: maxLbl }, (_, i) => {
    const idx   = Math.round(i * (n - 1) / Math.max(maxLbl - 1, 1))
    const parts = points[idx].date.split('-')
    return { x: xOf(idx), label: `${parts[2]}/${parts[1]}` }
  })

  // Area path
  const areaPath =
    `M${xOf(0)},${yOf(points[0].val)} ` +
    points.map((p, i) => `L${xOf(i)},${yOf(p.val)}`).join(' ') +
    ` L${xOf(n - 1)},${PAD.top + cH} L${xOf(0)},${PAD.top + cH} Z`

  // Line
  const linePts = points.map((p, i) => `${xOf(i)},${yOf(p.val)}`).join(' ')

  const gradId = `mchartGrad_${cfg.color.replace('#', '')}`

  return (
    <svg
      width="100%"
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={cfg.color} stopOpacity={0.22} />
          <stop offset="100%" stopColor={cfg.color} stopOpacity={0}    />
        </linearGradient>
      </defs>

      {/* grid lines + Y labels */}
      {ticks.map(({ v, y }) => (
        <g key={v}>
          <line
            x1={PAD.left} y1={y}
            x2={W - PAD.right} y2={y}
            stroke="rgba(255,255,255,.06)"
            strokeWidth={1}
          />
          <text
            x={PAD.left - 5} y={y + 4}
            textAnchor="end"
            fill="rgba(255,255,255,.35)"
            fontSize={9}
          >
            {v.toFixed(1)}
          </text>
        </g>
      ))}

      {/* X labels */}
      {xlabels.map(({ x, label }) => (
        <text
          key={label + x}
          x={x} y={H - 6}
          textAnchor="middle"
          fill="rgba(255,255,255,.3)"
          fontSize={9}
        >
          {label}
        </text>
      ))}

      {/* area fill */}
      <path d={areaPath} fill={`url(#${gradId})`} />

      {/* line */}
      <polyline
        points={linePts}
        fill="none"
        stroke={cfg.color}
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* dots */}
      {points.map((p, i) => (
        <circle
          key={i}
          cx={xOf(i)}
          cy={yOf(p.val)}
          r={4}
          fill={cfg.color}
          stroke="var(--bg)"
          strokeWidth={2}
          style={{ cursor: 'pointer' }}
          onMouseEnter={e => {
            const rect = (e.currentTarget.closest('svg') as SVGSVGElement)
              .getBoundingClientRect()
            const svgW = rect.width
            const rawX = xOf(i) / W * svgW
            const rawY = yOf(p.val) / H * rect.height
            onTooltip({
              text: `${p.date}  ·  ${p.val.toFixed(1)} ${cfg.unit}`,
              x: Math.min(rawX + 8, svgW - 130),
              y: Math.max(rawY - 34, 4),
            })
          }}
          onMouseLeave={() => onTooltip(null)}
          onTouchStart={e => {
            const rect = (e.currentTarget.closest('svg') as SVGSVGElement)
              .getBoundingClientRect()
            const svgW = rect.width
            const rawX = xOf(i) / W * svgW
            const rawY = yOf(p.val) / H * rect.height
            onTooltip({
              text: `${p.date}  ·  ${p.val.toFixed(1)} ${cfg.unit}`,
              x: Math.min(rawX + 8, svgW - 130),
              y: Math.max(rawY - 34, 4),
            })
            setTimeout(() => onTooltip(null), 1600)
          }}
        />
      ))}
    </svg>
  )
}

// ── componente principal ──────────────────────────────────────────────────────

interface Props {
  open: boolean
  onClose: () => void
  rows: BodyRow[]
}

export default function BodyEvolutionModal({ open, onClose, rows }: Props) {
  const [metric, setMetric]   = useState<Metric>('weightKg')
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  const handleTooltip = useCallback(
    (info: { text: string; x: number; y: number } | null) => setTooltip(info),
    []
  )

  if (!open) return null

  const cfg    = MCHART_CFG[metric]
  const points = buildPoints(rows, metric)

  // summary
  let summary: { min: number; max: number; last: number; diff: number } | null = null
  if (points.length > 0) {
    const vals = points.map(p => p.val)
    const minV = Math.min(...vals)
    const maxV = Math.max(...vals)
    const last = points[points.length - 1].val
    summary = { min: minV, max: maxV, last, diff: last - points[0].val }
  }

  const trendColor = (diff: number) => {
    if (metric === 'weightKg') return 'var(--text2)'
    return diff < 0 ? 'var(--good)' : diff > 0 ? 'var(--bad)' : 'var(--text3)'
  }

  const trendArrow = (diff: number) => diff === 0 ? '→' : diff > 0 ? '▲' : '▼'

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* overlay */}
      <div onClick={onClose} className="mchart-overlay" />

      {/* sheet */}
      <div className="mchart-sheet">
        {/* handle */}
        <div className="sheet-handle" />

        {/* header */}
        <div className="mchart-header">
          <b>Evolução corporal</b>
          <button
            type="button"
            onClick={onClose}
            className="profile-checkin-close"
          >
            ✕
          </button>
        </div>

        {/* body */}
        <div className="mchart-body">

          {/* filter buttons */}
          <div className="mchart-tabs">
            {(['weightKg', 'waistCm', 'bfPct'] as Metric[]).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => { setMetric(m); setTooltip(null) }}
                className={`mchart-tab${metric === m ? ' active' : ''}`}
              >
                {MCHART_CFG[m].label} ({MCHART_CFG[m].unit})
              </button>
            ))}
          </div>

          {/* chart area */}
          <div ref={wrapRef} className="mchart-chart-wrap">
            {points.length === 0 ? (
              <div className="mchart-empty">
                Nenhum dado para "{cfg.label}".<br />
                Salve medições primeiro.
              </div>
            ) : (
              <ChartSvg
                points={points}
                cfg={cfg}
                onTooltip={handleTooltip}
              />
            )}

            {/* tooltip */}
            {tooltip && (
              <div
                className="mchart-tooltip"
                style={{
                  left: tooltip.x,
                  top: tooltip.y,
                }}
              >
                {tooltip.text}
              </div>
            )}
          </div>

          {/* summary */}
          {summary && (
            <div className="mchart-summary">
              {[
                { lbl: 'Mínimo',   val: summary.min.toFixed(1), color: 'var(--text)' },
                { lbl: 'Máximo',   val: summary.max.toFixed(1), color: 'var(--text)' },
                { lbl: 'Atual',    val: summary.last.toFixed(1), color: 'var(--text)' },
                {
                  lbl: 'Variação',
                  val: `${trendArrow(summary.diff)} ${Math.abs(summary.diff).toFixed(1)}`,
                  color: trendColor(summary.diff),
                },
              ].map(({ lbl, val, color }) => (
                <div key={lbl} className="mchart-summary-item">
                  <span>{lbl}</span>
                  <b style={{ color }}>{val}</b>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </>
  )
}
