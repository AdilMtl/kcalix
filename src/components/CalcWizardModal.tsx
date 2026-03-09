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

type Step = 'welcome' | 'summary' | 1 | 2 | 3 | 4

const GOAL_ICONS: Record<GoalType, string> = {
  maintain: '🟡',
  cut: '🔴',
  recomp: '🟢',
  bulk: '🔵',
}

const ACTIVITY_OPTIONS = Object.entries(WZ_ACTIVITY_LABELS) as [string, string][]

export default function CalcWizardModal({ open, isNewUser, initialData, onSave, onClose }: Props) {
  const [step, setStep] = useState<Step>(isNewUser ? 'welcome' : 'summary')

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

    onSave(newSettings)
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

  function renderSummary() {
    return (
      <>
        <div className="wz-step-content">
          <div className="wz-headline">Seu perfil atual</div>
          <div className="wz-summary-card">
            <div><b>Sexo:</b> {initialData?.sex === 'female' ? 'Mulher' : 'Homem'}</div>
            <div><b>Idade:</b> {initialData?.age} anos</div>
            <div><b>Peso:</b> {initialData?.weightKg} kg · <b>Altura:</b> {initialData?.heightCm} cm</div>
            <div><b>Objetivo:</b> {initialData?.goal ? WZ_GOAL_LABELS[initialData.goal] : '—'}</div>
            <div><b>BMR:</b> {initialData?.bmr ?? '—'} kcal · <b>TDEE:</b> {initialData?.tdee ?? '—'} kcal</div>
            <div><b>Meta:</b> {initialData?.kcalTarget ?? '—'} kcal · P {initialData?.pTarget ?? '—'}g / C {initialData?.cTarget ?? '—'}g / G {initialData?.gTarget ?? '—'}g</div>
          </div>
        </div>
        <div className="calc-wizard-footer">
          <button className="btn ghost" onClick={onClose}>Fechar</button>
          <button className="btn primary" onClick={() => setStep(1)}>✏️ Editar</button>
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

  return (
    <div className="calc-wizard open" style={{ zIndex: 315 }}>
      {/* Header */}
      <div className="calc-wizard-header">
        <div className="calc-wizard-title">
          {step === 'welcome' ? 'Bem-vindo ao Kcalix' :
           step === 'summary' ? 'Perfil configurado' :
           `Passo ${step} de 4`}
        </div>
        <button className="calc-wizard-close" onClick={onClose}>✕</button>
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
    </div>
  )
}
