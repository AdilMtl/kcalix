import { useState, useEffect } from 'react'
import { GOAL_PRESETS, WZ_ACTIVITY_LABELS, WZ_GOAL_LABELS } from '../data/goalPresets'
import type { GoalType } from '../data/goalPresets'
import { calcFromProfile } from '../lib/calculators'
import type { UserSettingsData } from '../hooks/useSettings'

interface Props {
  open: boolean
  isNewUser: boolean
  initialData: Partial<UserSettingsData> | null
  onSave: (result: UserSettingsData) => void
  onClose: () => void
}

type Step = 'welcome' | 'summary' | 'done' | 1 | 2 | 3 | 4

const GOAL_ICONS: Record<GoalType, string> = {
  maintain: '🟡',
  cut: '🔴',
  recomp: '🟢',
  bulk: '🔵',
}

const ACTIVITY_OPTIONS = Object.entries(WZ_ACTIVITY_LABELS) as [string, string][]

export default function CalcWizardModal({ open, isNewUser, initialData, onSave, onClose }: Props) {
  const [step, setStep] = useState<Step>(isNewUser ? 'welcome' : 'summary')
  const [pendingResult, setPendingResult] = useState<UserSettingsData | null>(null)

  // Step 1 — Dados básicos
  const [sex, setSex] = useState<'male' | 'female'>(initialData?.sex ?? 'male')
  const [age, setAge] = useState(String(initialData?.age ?? ''))
  const [weight, setWeight] = useState(String(initialData?.weightKg ?? ''))
  const [height, setHeight] = useState(String(initialData?.heightCm ?? ''))

  // Step 2 — Dobras
  const [hasSkinfolds, setHasSkinfolds] = useState<boolean | null>(null)
  const [sf, setSf] = useState({
    chest: String(initialData?.skinfolds?.chest ?? ''),
    ax: String(initialData?.skinfolds?.ax ?? ''),
    tri: String(initialData?.skinfolds?.tri ?? ''),
    sub: String(initialData?.skinfolds?.sub ?? ''),
    ab: String(initialData?.skinfolds?.ab ?? ''),
    sup: String(initialData?.skinfolds?.sup ?? ''),
    th: String(initialData?.skinfolds?.th ?? ''),
  })

  // Step 3 — Objetivo
  const [goal, setGoal] = useState<GoalType>(initialData?.goal ?? 'cut')

  // Step 4 — Atividade
  const [activity, setActivity] = useState(String(initialData?.activityFactor ?? '1.55'))

  // Computed preview (step 4)
  const preview = (() => {
    const w = parseFloat(weight)
    const h = parseFloat(height)
    const a = parseFloat(age)
    const af = parseFloat(activity)
    if (!w || !h || !a || !af) return null
    const skinfolds = hasSkinfolds ? {
      chest: parseFloat(sf.chest) || 0,
      ax: parseFloat(sf.ax) || 0,
      tri: parseFloat(sf.tri) || 0,
      sub: parseFloat(sf.sub) || 0,
      ab: parseFloat(sf.ab) || 0,
      sup: parseFloat(sf.sup) || 0,
      th: parseFloat(sf.th) || 0,
    } : undefined
    return calcFromProfile({ sex, age: a, weightKg: w, heightCm: h, activityFactor: af, goal, skinfolds })
  })()

  // Reset ao abrir
  useEffect(() => {
    if (!open) return
    setStep(isNewUser ? 'welcome' : 'summary')
    setPendingResult(null)
    setSex(initialData?.sex ?? 'male')
    setAge(String(initialData?.age ?? ''))
    setWeight(String(initialData?.weightKg ?? ''))
    setHeight(String(initialData?.heightCm ?? ''))
    setGoal(initialData?.goal ?? 'cut')
    setActivity(String(initialData?.activityFactor ?? '1.55'))
    setHasSkinfolds(initialData?.skinfolds != null ? true : null)
    setSf({
      chest: String(initialData?.skinfolds?.chest ?? ''),
      ax: String(initialData?.skinfolds?.ax ?? ''),
      tri: String(initialData?.skinfolds?.tri ?? ''),
      sub: String(initialData?.skinfolds?.sub ?? ''),
      ab: String(initialData?.skinfolds?.ab ?? ''),
      sup: String(initialData?.skinfolds?.sup ?? ''),
      th: String(initialData?.skinfolds?.th ?? ''),
    })
  }, [open])

  if (!open) return null

  const stepNum = typeof step === 'number' ? step : null
  const showDots = typeof step === 'number'

  function handleFinish() {
    const w = parseFloat(weight)
    const h = parseFloat(height)
    const a = parseFloat(age)
    const af = parseFloat(activity)
    if (!w || !h || !a || !af) return

    const skinfolds = hasSkinfolds ? {
      chest: parseFloat(sf.chest) || 0,
      ax: parseFloat(sf.ax) || 0,
      tri: parseFloat(sf.tri) || 0,
      sub: parseFloat(sf.sub) || 0,
      ab: parseFloat(sf.ab) || 0,
      sup: parseFloat(sf.sup) || 0,
      th: parseFloat(sf.th) || 0,
    } : undefined

    const result = calcFromProfile({ sex, age: a, weightKg: w, heightCm: h, activityFactor: af, goal, skinfolds })

    const newSettings: UserSettingsData = {
      sex,
      age: a,
      weightKg: w,
      heightCm: h,
      activityFactor: af,
      goal,
      skinfolds: hasSkinfolds ? skinfolds : undefined,
      bmr: result.bmr ?? 0,
      tdee: result.tdee ?? 0,
      kcalTarget: result.kcalTarget,
      pTarget: result.pTarget,
      cTarget: result.cTarget,
      gTarget: result.gTarget,
    }

    if (isNewUser) {
      setPendingResult(newSettings)
      setStep('done')
    } else {
      onSave(newSettings)
    }
  }

  // ── Conteúdo por step ────────────────────────────────────────────────────

  function renderWelcome() {
    return (
      <>
        <div className="wz-step-content">
          <div className="wz-welcome-content">
            <div className="wz-welcome-logo">⚡</div>
            <div className="wz-welcome-brand">Kcalix</div>
            <div className="wz-welcome-tagline">Configure seu perfil nutricional em menos de 2 minutos.</div>
            <div className="wz-welcome-props">
              {[
                { icon: '🍎', title: 'Nutrição personalizada', desc: 'Metas de macros e kcal calculadas para o seu corpo e objetivo.' },
                { icon: '🏋️', title: 'Treino inteligente', desc: 'Registro de séries, cargas e volume com referência à sessão anterior.' },
                { icon: '📈', title: 'Resultados reais', desc: 'Acompanhe seu progresso com métricas objetivas ao longo do tempo.' },
              ].map(p => (
                <div key={p.title} className="wz-welcome-prop">
                  <div className="wz-welcome-prop-icon">{p.icon}</div>
                  <div className="wz-welcome-prop-text">
                    <div className="wz-welcome-prop-title">{p.title}</div>
                    <div className="wz-welcome-prop-desc">{p.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="wz-welcome-fine">Seus dados ficam no seu perfil — nunca compartilhados.</div>
          </div>
        </div>
        <div className="calc-wizard-footer">
          <button className="btn primary" onClick={() => setStep(1)}>Começar →</button>
        </div>
      </>
    )
  }

  function handleRecalc() {
    if (!initialData) return
    const { sex: s, age: a, weightKg: w, heightCm: h, activityFactor: af, goal: g, skinfolds: skf } = initialData
    if (!s || !a || !w || !h || !af || !g) return
    const result = calcFromProfile({ sex: s, age: a, weightKg: w, heightCm: h, activityFactor: af, goal: g, skinfolds: skf })
    const newSettings: UserSettingsData = {
      ...initialData as UserSettingsData,
      bmr: result.bmr ?? 0,
      tdee: result.tdee ?? 0,
      kcalTarget: result.kcalTarget,
      pTarget: result.pTarget,
      cTarget: result.cTarget,
      gTarget: result.gTarget,
    }
    onSave(newSettings)
  }

  function renderSummary() {
    const goalLabel = initialData?.goal ? WZ_GOAL_LABELS[initialData.goal] : '—'
    const actLabel  = initialData?.activityFactor ? (WZ_ACTIVITY_LABELS[String(initialData.activityFactor)] ?? String(initialData.activityFactor)) : '—'
    const sexLabel  = initialData?.sex === 'female' ? '♀ Mulher' : '♂ Homem'
    const hasSF     = initialData?.skinfolds != null && Object.values(initialData.skinfolds).some(v => v > 0)

    return (
      <>
        <div className="wz-step-content">
          <div className="wz-headline">Seu perfil atual</div>
          <div className="wz-summary-card">
            <div>{sexLabel} · {initialData?.age || '—'} anos · {initialData?.weightKg || '—'} kg · {initialData?.heightCm || '—'} cm</div>
            <div>{goalLabel}</div>
            <div>{actLabel}</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
              {hasSF ? 'Dobras JP7 configuradas' : 'Estimativa Mifflin-St Jeor'}
            </div>
          </div>
          <div className="wz-question">Tem algo que queira atualizar?</div>
        </div>
        <div className="calc-wizard-footer">
          <button className="btn ghost" onClick={() => setStep(1)}>Revisar tudo →</button>
          <button className="btn primary" onClick={handleRecalc}>Recalcular assim ✅</button>
        </div>
      </>
    )
  }

  function renderStep1() {
    return (
      <>
        <div className="wz-step-content">
          <div className="wz-headline">Dados básicos</div>
          <div className="wz-sex-row">
            {(['male', 'female'] as const).map(s => (
              <button
                key={s}
                type="button"
                className={`wz-sex-btn${sex === s ? ' selected' : ''}`}
                onClick={() => setSex(s)}
              >
                {s === 'male' ? '♂ Homem' : '♀ Mulher'}
              </button>
            ))}
          </div>
          <div className="form-grid cols-2">
            <div className="form-row">
              <label>Idade (anos)</label>
              <input inputMode="decimal" placeholder="37" value={age} onChange={e => setAge(e.target.value)} />
            </div>
            <div className="form-row">
              <label>Peso (kg)</label>
              <input inputMode="decimal" placeholder="76" value={weight} onChange={e => setWeight(e.target.value)} />
            </div>
            <div className="form-row">
              <label>Altura (cm)</label>
              <input inputMode="decimal" placeholder="177" value={height} onChange={e => setHeight(e.target.value)} />
            </div>
          </div>
        </div>
        <div className="calc-wizard-footer">
          <button className="btn ghost" onClick={onClose}>Cancelar</button>
          <button
            className="btn primary"
            disabled={!age || !weight || !height}
            onClick={() => setStep(2)}
          >Próximo →</button>
        </div>
      </>
    )
  }

  function renderStep2() {
    return (
      <>
        <div className="wz-step-content">
          <div className="wz-headline">Dobras cutâneas JP7</div>
          <p className="hint" style={{ marginBottom: 12 }}>As dobras permitem calcular o BF% real e usar o BMR de Katch-McArdle (mais preciso).</p>
          <div className="wz-choice-row">
            {[
              { val: true, icon: '📏', label: 'Tenho dobras medidas' },
              { val: false, icon: '⏭️', label: 'Não tenho / pular' },
            ].map(opt => (
              <div
                key={String(opt.val)}
                className={`wz-choice-card${hasSkinfolds === opt.val ? ' selected' : ''}`}
                onClick={() => setHasSkinfolds(opt.val)}
              >
                <div className="wz-choice-icon">{opt.icon}</div>
                <div className="wz-choice-label">{opt.label}</div>
              </div>
            ))}
          </div>

          {hasSkinfolds && (
            <div className="grid3" style={{ marginTop: 12 }}>
              {([
                ['chest', 'Peito (mm)'],
                ['ax', 'Axilar média'],
                ['tri', 'Tríceps'],
                ['sub', 'Subescapular'],
                ['ab', 'Abdominal'],
                ['sup', 'Supra-ilíaca'],
                ['th', 'Coxa'],
              ] as [keyof typeof sf, string][]).map(([key, label]) => (
                <div key={key} className="form-row">
                  <label>{label}</label>
                  <input
                    inputMode="decimal"
                    value={sf[key]}
                    onChange={e => setSf(prev => ({ ...prev, [key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="calc-wizard-footer">
          <button className="btn ghost" onClick={() => setStep(1)}>← Voltar</button>
          <button
            className="btn primary"
            disabled={hasSkinfolds === null}
            onClick={() => setStep(3)}
          >Próximo →</button>
        </div>
      </>
    )
  }

  function renderStep3() {
    return (
      <>
        <div className="wz-step-content">
          <div className="wz-headline">Objetivo</div>
          <div className="wz-goal-cards">
            {(Object.keys(GOAL_PRESETS) as GoalType[]).map(g => (
              <div
                key={g}
                className={`wz-goal-card${goal === g ? ' selected' : ''}`}
                data-goal={g}
                onClick={() => setGoal(g)}
              >
                <div className="wz-goal-icon">{GOAL_ICONS[g]}</div>
                <div>
                  <div className="wz-goal-name">{WZ_GOAL_LABELS[g]}</div>
                  {goal === g && (
                    <div className="wz-goal-desc">{GOAL_PRESETS[g].hint}</div>
                  )}
                </div>
                <div className="wz-goal-check">✓</div>
              </div>
            ))}
          </div>
        </div>
        <div className="calc-wizard-footer">
          <button className="btn ghost" onClick={() => setStep(2)}>← Voltar</button>
          <button className="btn primary" onClick={() => setStep(4)}>Próximo →</button>
        </div>
      </>
    )
  }

  function renderStep4() {
    return (
      <>
        <div className="wz-step-content">
          <div className="wz-headline">Estilo de vida</div>
          <div className="form-row" style={{ marginBottom: 12 }}>
            <label>Nível de atividade</label>
            <select value={activity} onChange={e => setActivity(e.target.value)}>
              {ACTIVITY_OPTIONS.map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
          <div className="wz-bmr-preview">
            {preview ? (
              <>
                <div>🔥 BMR: <b>{Math.round(preview.bmr ?? 0)} kcal</b> · TDEE: <b>{Math.round(preview.tdee ?? 0)} kcal</b></div>
                <div>🎯 Meta: <b>{preview.kcalTarget} kcal</b></div>
                <div>🥩 P <b>{preview.pTarget}g</b> · 🥔 C <b>{preview.cTarget}g</b> · 🥑 G <b>{preview.gTarget}g</b></div>
                {preview.bf !== null && (
                  <div style={{ marginTop: 4, color: 'var(--text3)', fontSize: 12 }}>
                    BF% {preview.bf.toFixed(1)}% · Massa magra {preview.leanKg?.toFixed(1)} kg
                  </div>
                )}
              </>
            ) : (
              <span style={{ color: 'var(--text3)' }}>Preencha os dados anteriores para ver o preview.</span>
            )}
          </div>
        </div>
        <div className="calc-wizard-footer">
          <button className="btn ghost" onClick={() => setStep(3)}>← Voltar</button>
          <button className="btn primary" onClick={handleFinish}>✅ Concluir</button>
        </div>
      </>
    )
  }

  function renderDone() {
    const r = pendingResult
    if (!r) return null
    const goalLabel = WZ_GOAL_LABELS[r.goal] ?? r.goal
    const GOAL_COLORS: Record<string, string> = { cut: '#f87171', bulk: '#60a5fa', recomp: '#34d399', maintain: '#fbbf24' }
    const goalColor = GOAL_COLORS[r.goal] ?? 'var(--accent)'
    return (
      <>
        <div className="wz-step-content" style={{ alignItems: 'center', textAlign: 'center', gap: 20 }}>
          <div style={{ fontSize: 56, lineHeight: 1 }}>🎉</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>Perfil configurado!</div>
          <div style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.5 }}>
            Suas metas foram calculadas com base no seu perfil.<br />
            Você pode ajustá-las a qualquer momento em <b>Mais → Perfil Nutricional</b>.
          </div>

          {/* Cards de resultado */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
            {/* Objetivo */}
            <div style={{
              background: 'var(--surface2)',
              borderRadius: 12,
              padding: '12px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{ color: 'var(--text2)', fontSize: 13 }}>Objetivo</span>
              <span style={{ fontWeight: 700, color: goalColor }}>{GOAL_ICONS[r.goal]} {goalLabel}</span>
            </div>

            {/* BMR / TDEE */}
            <div style={{
              background: 'var(--surface2)',
              borderRadius: 12,
              padding: '12px 16px',
              display: 'flex',
              justifyContent: 'space-between',
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'var(--text3)', fontSize: 11, marginBottom: 2 }}>BMR</div>
                <div style={{ fontWeight: 700, color: '#fff' }}>{Math.round(r.bmr)} kcal</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'var(--text3)', fontSize: 11, marginBottom: 2 }}>TDEE</div>
                <div style={{ fontWeight: 700, color: '#fff' }}>{Math.round(r.tdee)} kcal</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'var(--text3)', fontSize: 11, marginBottom: 2 }}>Meta</div>
                <div style={{ fontWeight: 700, color: 'var(--accent2)' }}>{r.kcalTarget} kcal</div>
              </div>
            </div>

            {/* Macros */}
            <div style={{
              background: 'var(--surface2)',
              borderRadius: 12,
              padding: '12px 16px',
              display: 'flex',
              justifyContent: 'space-around',
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'var(--pColor)', fontSize: 11, marginBottom: 2 }}>Proteína</div>
                <div style={{ fontWeight: 700, color: '#fff' }}>{r.pTarget}g</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'var(--cColor)', fontSize: 11, marginBottom: 2 }}>Carboidrato</div>
                <div style={{ fontWeight: 700, color: '#fff' }}>{r.cTarget}g</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'var(--gColor)', fontSize: 11, marginBottom: 2 }}>Gordura</div>
                <div style={{ fontWeight: 700, color: '#fff' }}>{r.gTarget}g</div>
              </div>
            </div>

            {/* BF% se tiver */}
            {r.skinfolds && (
              <div style={{
                background: 'var(--surface2)',
                borderRadius: 12,
                padding: '10px 16px',
                color: 'var(--text2)',
                fontSize: 13,
                textAlign: 'center',
              }}>
                Dobras JP7 configuradas · BF% calculado
              </div>
            )}
          </div>
        </div>
        <div className="calc-wizard-footer">
          <button
            className="btn primary"
            style={{ width: '100%' }}
            onClick={() => pendingResult && onSave(pendingResult)}
          >
            Começar a usar o Kcalix →
          </button>
        </div>
      </>
    )
  }

  return (
    <div className="calc-wizard open" style={{ zIndex: 315 }}>
      {/* Header */}
      <div className="calc-wizard-header">
        <div className="calc-wizard-title">
          {step === 'welcome' ? 'Bem-vindo ao Kcalix' :
           step === 'summary' ? 'Perfil configurado' :
           step === 'done'    ? 'Tudo pronto!' :
           `Passo ${step} de 4`}
        </div>
        {step !== 'done' && (
          <button className="calc-wizard-close" onClick={onClose}>✕</button>
        )}
      </div>

      {/* Progress dots — só em steps 1-4 */}
      {showDots && (
        <div className="calc-wizard-progress">
          {[1, 2, 3, 4].map(n => (
            <div
              key={n}
              className={`wz-dot${stepNum === n ? ' active' : stepNum !== null && n < stepNum ? ' done' : ''}`}
            />
          ))}
        </div>
      )}

      {/* Conteúdo */}
      {step === 'welcome' && renderWelcome()}
      {step === 'summary' && renderSummary()}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
      {step === 'done' && renderDone()}
    </div>
  )
}
