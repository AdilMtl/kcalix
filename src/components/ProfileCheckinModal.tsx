import { useState, useEffect, useRef } from 'react'
import type { UserSettingsData } from '../hooks/useSettings'
import {
  useCheckins,
  calcProfileMetrics,
  WZ_GOAL_LABELS,
  WZ_ACTIVITY_LABELS,
  type CheckinRow,
} from '../hooks/useCheckins'

// ── sub-views ─────────────────────────────────────────────────

type View = 'profile' | 'form' | 'history'

// ── Seção do perfil ────────────────────────────────────────────

function ProfileView({
  settings,
  lastCheckin,
  onOpenHistory,
}: {
  settings: UserSettingsData
  lastCheckin: CheckinRow | null
  onOpenHistory: () => void
}) {
  const { bf, leanKg, hasSF } = calcProfileMetrics(settings)

  const sexLabel  = settings.sex === 'female' ? '♀ Mulher' : '♂ Homem'
  const goalLabel = WZ_GOAL_LABELS[settings.goal ?? 'maintain'] ?? '—'
  const actLabel  = WZ_ACTIVITY_LABELS[String(settings.activityFactor)] ?? String(settings.activityFactor)

  let dateStr = '—'
  if (settings.updatedAt) {
    dateStr = new Date(settings.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  // Último check-in registrado
  let lastCheckinSection: React.ReactNode = null
  if (lastCheckin) {
    const lastDate = new Date(lastCheckin.date + 'T12:00:00')
      .toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
    const daysDiff = Math.round((Date.now() - new Date(lastCheckin.date + 'T12:00:00').getTime()) / 86400000)
    const daysLabel = daysDiff === 0 ? 'hoje' : daysDiff === 1 ? 'há 1 dia' : `há ${daysDiff} dias`

    let deltaEl: React.ReactNode = null
    if (lastCheckin.weightKg && settings.weightKg) {
      const d = (settings.weightKg - lastCheckin.weightKg).toFixed(1)
      const isPos = Number(d) > 0
      deltaEl = (
        <span className={`checkin-delta ${isPos ? 'pos' : 'neg'}`}>
          {isPos ? ' ▲ +' : ' ▼ '}{d} kg
        </span>
      )
    }

    lastCheckinSection = (
      <div className="checkin-last-section">
        <div className="checkin-last-info">
          <span className="checkin-last-label">Último check-in</span>
          <span className="checkin-last-value">
            {lastCheckin.weightKg ? `${lastCheckin.weightKg} kg` : '—'}{deltaEl}
          </span>
          <span className="checkin-last-sub">{lastDate} · {daysLabel}</span>
        </div>
        <button className="checkin-history-link" type="button" onClick={onOpenHistory}>
          📋 Histórico
        </button>
      </div>
    )
  }

  return (
    <div className="profile-checkin-body">
      {lastCheckinSection}

      {/* Corpo */}
      <div className="checkin-section">
        <div className="checkin-section-label">Corpo</div>
        <div className="checkin-row">
          <span className="checkin-row-label">Sexo / Idade</span>
          <span className="checkin-row-value">{sexLabel} · {settings.age || '—'} anos</span>
        </div>
        <div className="checkin-row">
          <span className="checkin-row-label">Peso / Altura</span>
          <span className="checkin-row-value">{settings.weightKg || '—'} kg · {settings.heightCm || '—'} cm</span>
        </div>
        {bf != null && Number.isFinite(bf) && (
          <div className="checkin-row">
            <span className="checkin-row-label">🧍 Gordura corporal</span>
            <span className="checkin-row-value">{bf.toFixed(1)}%</span>
          </div>
        )}
        {leanKg != null && (
          <div className="checkin-row">
            <span className="checkin-row-label">💪 Massa magra</span>
            <span className="checkin-row-value">{leanKg.toFixed(1)} kg</span>
          </div>
        )}
        <div className="checkin-row">
          <span className="checkin-row-label">Método BMR</span>
          <span className="checkin-row-value">{hasSF ? 'JP7 (Katch-McArdle)' : 'Mifflin-St Jeor'}</span>
        </div>
      </div>

      {/* Energia */}
      {settings.bmr != null && (
        <div className="checkin-section">
          <div className="checkin-section-label">Energia</div>
          <div className="checkin-row">
            <span className="checkin-row-label">🔥 BMR (metabolismo basal)</span>
            <span className="checkin-row-value">{Math.round(settings.bmr)} kcal</span>
          </div>
          <div className="checkin-row">
            <span className="checkin-row-label">⚡ TDEE (gasto total)</span>
            <span className="checkin-row-value">{Math.round(settings.tdee ?? 0)} kcal</span>
          </div>
          <div className="checkin-row">
            <span className="checkin-row-label">🎯 Meta diária</span>
            <span className="checkin-row-value accent">{Math.round(settings.kcalTarget ?? 0)} kcal</span>
          </div>
        </div>
      )}

      {/* Macros */}
      {settings.pTarget != null && settings.pTarget > 0 && (
        <div className="checkin-section">
          <div className="checkin-section-label">Macros diários</div>
          <div className="checkin-row">
            <span className="checkin-row-label">🥩 Proteína</span>
            <span className="checkin-row-value">{Math.round(settings.pTarget)} g</span>
          </div>
          <div className="checkin-row">
            <span className="checkin-row-label">🥔 Carboidrato</span>
            <span className="checkin-row-value">{Math.round(settings.cTarget ?? 0)} g</span>
          </div>
          <div className="checkin-row">
            <span className="checkin-row-label">🥑 Gordura</span>
            <span className="checkin-row-value">{Math.round(settings.gTarget ?? 0)} g</span>
          </div>
        </div>
      )}

      {/* Perfil */}
      <div className="checkin-section">
        <div className="checkin-section-label">Perfil</div>
        <div className="checkin-row">
          <span className="checkin-row-label">Objetivo</span>
          <span className="checkin-tag">{goalLabel}</span>
        </div>
        <div className="checkin-row">
          <span className="checkin-row-label">Estilo de vida</span>
          <span className="checkin-row-value">{actLabel}</span>
        </div>
        <div className="checkin-row">
          <span className="checkin-row-label">Perfil atualizado</span>
          <span className="checkin-row-value" style={{ fontSize: '12px', color: 'var(--text2)' }}>{dateStr}</span>
        </div>
      </div>
    </div>
  )
}

// ── Form de check-in ───────────────────────────────────────────

function CheckinFormView({
  settings,
  onSave,
  onCancel,
}: {
  settings: UserSettingsData
  onSave: (fields: { weightKg?: number; waistCm?: number; bfPct?: number; note?: string }) => Promise<void>
  onCancel: () => void
}) {
  const [weight, setWeight] = useState(String(settings.weightKg || ''))
  const [waist,  setWaist]  = useState('')
  const [bf,     setBf]     = useState('')
  const [note,   setNote]   = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      await onSave({
        weightKg: weight ? parseFloat(weight) : undefined,
        waistCm:  waist  ? parseFloat(waist)  : undefined,
        bfPct:    bf     ? parseFloat(bf)     : undefined,
        note:     note   || undefined,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="checkin-form-body">
        <div className="checkin-form-row">
          <div className="checkin-form-field">
            <label htmlFor="ci-weight">⚖️ Peso (kg)</label>
            <input
              id="ci-weight" type="number" inputMode="decimal" step={0.1} min={30} max={300}
              placeholder="76.0" value={weight}
              onChange={e => setWeight(e.target.value)}
            />
          </div>
          <div className="checkin-form-field">
            <label htmlFor="ci-waist">📏 Cintura (cm)</label>
            <input
              id="ci-waist" type="number" inputMode="decimal" step={0.5} min={40} max={200}
              placeholder="88" value={waist}
              onChange={e => setWaist(e.target.value)}
            />
          </div>
        </div>
        <div className="checkin-form-row">
          <div className="checkin-form-field">
            <label htmlFor="ci-bf">🧍 BF% (opcional)</label>
            <input
              id="ci-bf" type="number" inputMode="decimal" step={0.1} min={3} max={60}
              placeholder="—" value={bf}
              onChange={e => setBf(e.target.value)}
            />
          </div>
          <div />
        </div>
        <div className="checkin-form-field">
          <label htmlFor="ci-note">📝 Como foi sua semana?</label>
          <textarea
            id="ci-note" placeholder="Semana boa, dormi bem..."
            value={note} onChange={e => setNote(e.target.value)}
          />
        </div>
      </div>
      <div className="checkin-form-footer">
        <button className="btn ghost" type="button" onClick={onCancel} disabled={saving}>Cancelar</button>
        <button className="btn primary" type="button" onClick={handleSave} disabled={saving}>
          {saving ? 'Salvando…' : 'Salvar check-in ✅'}
        </button>
      </div>
    </>
  )
}

// ── Histórico de check-ins ─────────────────────────────────────

const GOAL_SHORT: Record<string, string> = {
  cut: 'Cut', bulk: 'Bulk', recomp: 'Recomp', maintain: 'Manutenção',
}

function CheckinHistoryView({ checkins }: { checkins: CheckinRow[] }) {
  if (checkins.length === 0) {
    return (
      <div className="checkin-history-body">
        <div className="checkin-history-empty">
          Nenhum check-in registrado ainda.<br />Use "Check-in ✅" no perfil para começar.
        </div>
      </div>
    )
  }

  const items = [...checkins].reverse()

  return (
    <div className="checkin-history-body">
      {items.map((c, i) => {
        const prev = items[i + 1]
        const dateLabel = new Date(c.date + 'T12:00:00')
          .toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
        const goalLabel = GOAL_SHORT[c.goalType ?? ''] ?? c.goalType ?? '—'

        let deltaEl: React.ReactNode = null
        if (prev?.weightKg && c.weightKg) {
          const d = (c.weightKg - prev.weightKg).toFixed(1)
          const isPos = Number(d) > 0
          deltaEl = (
            <span className={`checkin-delta ${isPos ? 'pos' : 'neg'}`}>
              {isPos ? ' ▲ +' : ' ▼ '}{d} kg
            </span>
          )
        }

        const trainStr = (c.trainingSessions ?? 0) > 0
          ? `💪 ${c.trainingSessions} treino${(c.trainingSessions ?? 0) > 1 ? 's' : ''} · avg ${c.avgTrainingKcal} kcal · ${c.activityType}`
          : '💪 Sem treinos registrados'
        const nutrStr = (c.avgConsumed ?? 0) > 0
          ? `🥗 avg ${(c.avgConsumed ?? 0).toLocaleString('pt-BR')} kcal · ${c.adherencePct}% aderência`
          : '🥗 Sem dados de nutrição'

        return (
          <div key={c.id} className="checkin-hcard">
            <div className="checkin-hcard-top">
              <span className="checkin-hcard-date">📅 {dateLabel}</span>
              <span className="checkin-hcard-goal">{goalLabel}</span>
            </div>
            <div className="checkin-hcard-metrics">
              <span className="checkin-hcard-metric">
                <strong>{c.weightKg ? `${c.weightKg} kg` : '—'}</strong>{deltaEl}
              </span>
              {c.waistCm ? <span className="checkin-hcard-metric">📏 <strong>{c.waistCm} cm</strong></span> : null}
              {c.bfPct   ? <span className="checkin-hcard-metric">🧍 <strong>{c.bfPct}%</strong> BF</span> : null}
            </div>
            {c.bmr ? (
              <div className="checkin-hcard-stat">
                🔥 BMR {Math.round(c.bmr).toLocaleString('pt-BR')} · Meta {Math.round(c.kcalTarget ?? 0).toLocaleString('pt-BR')} kcal
              </div>
            ) : null}
            <div className="checkin-hcard-stat">{trainStr}</div>
            <div className="checkin-hcard-stat">{nutrStr}</div>
            {c.note ? <div className="checkin-hcard-note">📝 "{c.note}"</div> : null}
          </div>
        )
      })}
    </div>
  )
}

// ── Modal principal ────────────────────────────────────────────

interface Props {
  open: boolean
  settings: UserSettingsData
  onClose: () => void
  onOpenWizard: () => void
}

export default function ProfileCheckinModal({ open, settings, onClose, onOpenWizard }: Props) {
  const { checkins, loadCheckins, saveCheckin, getLastCheckin } = useCheckins()
  const [view, setView] = useState<View>('profile')
  const loadedRef = useRef(false)

  // Carrega check-ins ao abrir (lazy)
  useEffect(() => {
    if (open && !loadedRef.current) {
      loadedRef.current = true
      loadCheckins()
    }
    if (!open) {
      setView('profile')
    }
  }, [open, loadCheckins])

  if (!open) return null

  const lastCheckin = getLastCheckin()

  async function handleSaveCheckin(fields: { weightKg?: number; waistCm?: number; bfPct?: number; note?: string }) {
    await saveCheckin(fields, settings)
    setView('profile')
  }

  const overlayStyle: React.CSSProperties = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 316,
  }
  const sheetStyle: React.CSSProperties = {
    position: 'fixed', bottom: 0, left: 0, right: 0,
    maxHeight: '90dvh',
    background: 'linear-gradient(180deg, #1a2035, #121828)',
    borderRadius: '18px 18px 0 0',
    zIndex: 317,
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
  }

  if (view === 'form') {
    return (
      <>
        <div style={overlayStyle} onClick={() => setView('profile')} />
        <div style={{ ...sheetStyle, zIndex: 323 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--line)', margin: '10px auto 0', flexShrink: 0 }} />
          <div className="profile-checkin-header">
            <div>
              <div className="profile-checkin-title">📸 Novo check-in</div>
            </div>
            <button className="profile-checkin-close" type="button" onClick={() => setView('profile')}>✕</button>
          </div>
          <CheckinFormView
            settings={settings}
            onSave={handleSaveCheckin}
            onCancel={() => setView('profile')}
          />
        </div>
      </>
    )
  }

  if (view === 'history') {
    return (
      <>
        <div style={{ ...overlayStyle, zIndex: 318 }} onClick={() => setView('profile')} />
        <div style={{ ...sheetStyle, zIndex: 319 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--line)', margin: '10px auto 0', flexShrink: 0 }} />
          <div className="checkin-history-header">
            <span className="checkin-history-title">📋 Histórico de Check-ins</span>
            <button className="profile-checkin-close" type="button" onClick={() => setView('profile')}>✕</button>
          </div>
          <CheckinHistoryView checkins={checkins} />
        </div>
      </>
    )
  }

  // view === 'profile'
  return (
    <>
      <div style={overlayStyle} onClick={onClose} />
      <div style={sheetStyle}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--line)', margin: '10px auto 0', flexShrink: 0 }} />
        <div className="profile-checkin-header">
          <div>
            <div className="profile-checkin-title">🧬 Seu perfil nutricional</div>
          </div>
          <button className="profile-checkin-close" type="button" onClick={onClose}>✕</button>
        </div>
        <ProfileView
          settings={settings}
          lastCheckin={lastCheckin}
          onOpenHistory={() => setView('history')}
        />
        <div className="profile-checkin-footer">
          <button className="btn ghost" type="button" onClick={onClose}>Fechar</button>
          <button className="btn ghost" type="button" onClick={onOpenWizard}>Atualizar →</button>
          <button className="btn primary" type="button" onClick={() => setView('form')}>Check-in ✅</button>
        </div>
      </div>
    </>
  )
}
