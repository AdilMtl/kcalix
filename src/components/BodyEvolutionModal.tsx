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
  weightKg: { label: 'Peso',    unit: 'kg', color: '#60a5fa' },
  waistCm:  { label: 'Cintura', unit: 'cm', color: '#f87171' },
  bfPct:    { label: 'BF',      unit: '%',  color: '#34d399' },
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
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,.55)',
          zIndex: 339,
        }}
      />

      {/* sheet */}
      <div
        style={{
          position: 'fixed',
          left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(180deg, #1a2035, #121828)',
          borderRadius: '18px 18px 0 0',
          zIndex: 340,
          maxHeight: '88dvh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* handle */}
        <div
          style={{
            width: 36, height: 4,
            background: 'rgba(255,255,255,.15)',
            borderRadius: 2,
            margin: '12px auto 0',
            flexShrink: 0,
          }}
        />

        {/* header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px 8px',
            flexShrink: 0,
          }}
        >
          <b style={{ fontSize: 15 }}>📈 Evolução</b>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none', border: 'none',
              color: 'var(--text3)', fontSize: 18,
              cursor: 'pointer', padding: '4px 8px',
              fontFamily: 'var(--font)',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            ✕
          </button>
        </div>

        {/* body */}
        <div style={{ padding: '0 16px 24px', overflowY: 'auto' }}>

          {/* filter buttons */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
            {(['weightKg', 'waistCm', 'bfPct'] as Metric[]).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => { setMetric(m); setTooltip(null) }}
                style={{
                  flex: 1,
                  padding: '8px 4px',
                  borderRadius: 8,
                  border: `1px solid ${metric === m ? 'var(--accent)' : 'var(--line)'}`,
                  background: metric === m ? 'var(--accent)' : 'var(--surface2)',
                  color: metric === m ? '#fff' : 'var(--text2)',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'var(--font)',
                  WebkitTapHighlightColor: 'transparent',
                  transition: 'background .15s, color .15s',
                }}
              >
                {MCHART_CFG[m].label} ({MCHART_CFG[m].unit})
              </button>
            ))}
          </div>

          {/* chart area */}
          <div
            ref={wrapRef}
            style={{
              width: '100%',
              position: 'relative',
              overflowX: 'auto',
              overflowY: 'hidden',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {points.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  color: 'var(--text3)',
                  fontSize: 14,
                  lineHeight: 1.6,
                }}
              >
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
                style={{
                  position: 'absolute',
                  left: tooltip.x,
                  top: tooltip.y,
                  background: 'var(--surface3)',
                  border: '1px solid var(--line)',
                  borderRadius: 8,
                  padding: '5px 9px',
                  fontSize: 11,
                  color: 'var(--text)',
                  pointerEvents: 'none',
                  zIndex: 10,
                  whiteSpace: 'nowrap',
                }}
              >
                {tooltip.text}
              </div>
            )}
          </div>

          {/* summary */}
          {summary && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-around',
                marginTop: 14,
                paddingTop: 12,
                borderTop: '1px solid var(--line)',
              }}
            >
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
                <div key={lbl} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 2 }}>{lbl}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color }}>{val}</div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </>
  )
}
