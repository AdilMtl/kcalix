import { useState, useMemo } from 'react'
import { useSettings } from '../hooks/useSettings'
import { useBody } from '../hooks/useBody'
import { calcFromProfile } from '../lib/calculators'
import type { CalcResult } from '../lib/calculators'
import { GOAL_PRESETS, WZ_ACTIVITY_LABELS } from '../data/goalPresets'
import type { GoalType } from '../data/goalPresets'
import type { UserSettingsData } from '../hooks/useSettings'
import CalcWizardModal from '../components/CalcWizardModal'

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

// ── helpers ─────────────────────────────────────────────────────────────────

function kcalFromMacros(p: number, c: number, g: number) {
  return Math.round(p * 4 + c * 4 + g * 9)
}

// ── NutriBanner ─────────────────────────────────────────────────────────────

function NutriBanner({ settings, onConfigure }: { settings: UserSettingsData | null; onConfigure: () => void }) {
  if (!settings) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(124,92,255,.12)', border: '1px solid rgba(124,92,255,.3)',
        borderRadius: 10, padding: '10px 12px', marginBottom: 12, gap: 10,
      }}>
        <span style={{ fontSize: 13, color: 'var(--text2)' }}>Configure seu perfil nutricional</span>
        <button className="btn sm primary" onClick={onConfigure}>🧭 Configurar</button>
      </div>
    )
  }
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: 'rgba(52,211,153,.1)', border: '1px solid rgba(52,211,153,.3)',
      borderRadius: 10, padding: '10px 12px', marginBottom: 12, gap: 10, flexWrap: 'wrap',
    }}>
      <span style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.7 }}>
        BMR: <b style={{ color: 'var(--text)' }}>{settings.bmr} kcal</b>
        {' · '}TDEE: <b style={{ color: 'var(--text)' }}>{settings.tdee} kcal</b>
        {' · '}Meta: <b style={{ color: 'var(--accent)' }}>{settings.kcalTarget} kcal</b>
        {' · '}P <b>{settings.pTarget}g</b> / C <b>{settings.cTarget}g</b> / G <b>{settings.gTarget}g</b>
      </span>
      <button className="btn sm ghost" onClick={onConfigure} style={{ flexShrink: 0 }}>✏️ Editar</button>
    </div>
  )
}

// ── Accordion wrapper ────────────────────────────────────────────────────────

function Accordion({ id, label, defaultOpen, children }: {
  id: string; label: string; defaultOpen?: boolean; children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen ?? false)
  return (
    <div className={`accordion${open ? ' open' : ''}`} id={id}>
      <button className="acc-trigger" type="button" onClick={() => setOpen(o => !o)}>
        {label}
        <span className="acc-chevron">▾</span>
      </button>
      <div className="acc-content">
        <div className="acc-inner">{children}</div>
      </div>
    </div>
  )
}

// ── MaisPage ─────────────────────────────────────────────────────────────────

export default function MaisPage() {
  const { settings, saveSettings } = useSettings()
  const today = todayISO()
  const { measurement, saveMeasurement } = useBody(today)

  // Wizard
  const [wizardOpen, setWizardOpen] = useState(false)

  // ── Metas diárias (accordion) ────────────────────────────────────────────
  const [goalP, setGoalP] = useState(String(settings?.pTarget ?? ''))
  const [goalC, setGoalC] = useState(String(settings?.cTarget ?? ''))
  const [goalG, setGoalG] = useState(String(settings?.gTarget ?? ''))
  const kcalAlvo = useMemo(() => {
    const p = parseFloat(goalP) || 0
    const c = parseFloat(goalC) || 0
    const g = parseFloat(goalG) || 0
    if (!p && !c && !g) return ''
    return String(kcalFromMacros(p, c, g))
  }, [goalP, goalC, goalG])

  function handleSaveMetas() {
    if (!settings) return
    const p = parseFloat(goalP) || 0
    const c = parseFloat(goalC) || 0
    const g = parseFloat(goalG) || 0
    saveSettings({ ...settings, pTarget: p, cTarget: c, gTarget: g, kcalTarget: kcalFromMacros(p, c, g) })
  }

  // ── Calculadora manual ───────────────────────────────────────────────────
  const [calcSex, setCalcSex] = useState<'male' | 'female'>(settings?.sex ?? 'male')
  const [calcAge, setCalcAge] = useState(String(settings?.age ?? ''))
  const [calcWeight, setCalcWeight] = useState(String(settings?.weightKg ?? ''))
  const [calcHeight, setCalcHeight] = useState(String(settings?.heightCm ?? ''))
  const [calcGoal, setCalcGoal] = useState<GoalType>(settings?.goal ?? 'cut')
  const [calcActivity, setCalcActivity] = useState(String(settings?.activityFactor ?? '1.55'))
  const [calcDef, setCalcDef] = useState(String(settings?.def ?? ''))
  const [calcPKg, setCalcPKg] = useState(String(settings?.pKg ?? ''))
  const [calcCKg, setCalcCKg] = useState(String(settings?.cKg ?? ''))
  const [calcMinFatKg, setCalcMinFatKg] = useState(String(settings?.minFatKg ?? ''))
  const [calcFixedKcal, setCalcFixedKcal] = useState(String(settings?.fixedKcal ?? ''))
  const [sfChest, setSfChest] = useState(String(settings?.skinfolds?.chest ?? ''))
  const [sfAx, setSfAx] = useState(String(settings?.skinfolds?.ax ?? ''))
  const [sfTri, setSfTri] = useState(String(settings?.skinfolds?.tri ?? ''))
  const [sfSub, setSfSub] = useState(String(settings?.skinfolds?.sub ?? ''))
  const [sfAb, setSfAb] = useState(String(settings?.skinfolds?.ab ?? ''))
  const [sfSup, setSfSup] = useState(String(settings?.skinfolds?.sup ?? ''))
  const [sfTh, setSfTh] = useState(String(settings?.skinfolds?.th ?? ''))
  const [calcResult, setCalcResult] = useState<CalcResult | null>(null)

  function handleCalc() {
    const w = parseFloat(calcWeight)
    const h = parseFloat(calcHeight)
    const a = parseFloat(calcAge)
    const af = parseFloat(calcActivity)
    if (!w || !h || !a || !af) return

    const allSf = [sfChest, sfAx, sfTri, sfSub, sfAb, sfSup, sfTh].map(Number)
    const hasAll = allSf.every(v => v > 0)

    const preset = GOAL_PRESETS[calcGoal]
    const defVal = parseFloat(calcDef)
    const pKgVal = parseFloat(calcPKg)
    const cKgVal = parseFloat(calcCKg)
    const minFatVal = parseFloat(calcMinFatKg)

    // Montar profile com overrides
    const profile = {
      sex: calcSex,
      age: a,
      weightKg: w,
      heightCm: h,
      activityFactor: af,
      goal: calcGoal,
      fixedKcal: parseFloat(calcFixedKcal) || undefined,
      skinfolds: hasAll ? {
        chest: allSf[0], ax: allSf[1], tri: allSf[2],
        sub: allSf[3], ab: allSf[4], sup: allSf[5], th: allSf[6],
      } : undefined,
    }

    // Calcular com preset base
    const base = calcFromProfile(profile)

    // Aplicar overrides manuais de pKg/cKg/minFatKg/def
    let kcalTarget = base.kcalTarget
    if (!isNaN(defVal) && base.tdee) {
      kcalTarget = Math.round(base.tdee * (1 - defVal / 100))
    }
    const pKg = !isNaN(pKgVal) ? pKgVal : preset.pKg
    const cKg = !isNaN(cKgVal) ? cKgVal : preset.cKg
    const minFat = !isNaN(minFatVal) ? minFatVal : preset.minFatKg
    const pTarget = Math.round(pKg * w)
    const cTarget = Math.round(cKg * w)
    const rem = kcalTarget - pTarget * 4 - cTarget * 4
    const minFatG = Math.round(minFat * w)
    const gTarget = Math.round(Math.max(rem / 9, minFatG))

    setCalcResult({ ...base, kcalTarget, pTarget, cTarget, gTarget })
  }

  function handleApplyResult() {
    if (!calcResult || !settings) return
    const newSettings = {
      ...settings,
      pTarget: calcResult.pTarget,
      cTarget: calcResult.cTarget,
      gTarget: calcResult.gTarget,
      kcalTarget: calcResult.kcalTarget,
    }
    saveSettings(newSettings)
    setGoalP(String(calcResult.pTarget))
    setGoalC(String(calcResult.cTarget))
    setGoalG(String(calcResult.gTarget))
  }

  function handleBfToMedicion() {
    if (!calcResult?.bf) return
    const base: import('../types/body').BodyMeasurement = {
      weightKg: null,
      waistCm: null,
      bfPct: calcResult.bf,
      note: '',
    }
    saveMeasurement({ ...(measurement ?? base), bfPct: calcResult.bf })
  }

  // ── Configurações de bloco ───────────────────────────────────────────────
  const [pBlockG, setPBlockG] = useState(String(settings?.blocks?.pG ?? 25))
  const [cBlockG, setCBlockG] = useState(String(settings?.blocks?.cG ?? 25))
  const [gBlockG, setGBlockG] = useState(String(settings?.blocks?.gG ?? 10))
  const [kcalP, setKcalP] = useState(String(settings?.kcalPerBlock?.p ?? 100))
  const [kcalC, setKcalC] = useState(String(settings?.kcalPerBlock?.c ?? 100))
  const [kcalG, setKcalG] = useState(String(settings?.kcalPerBlock?.g ?? 90))

  function handleSaveConfig() {
    if (!settings) return
    saveSettings({
      ...settings,
      blocks: { pG: Number(pBlockG) || 25, cG: Number(cBlockG) || 25, gG: Number(gBlockG) || 10 },
      kcalPerBlock: { p: Number(kcalP) || 100, c: Number(kcalC) || 100, g: Number(kcalG) || 90 },
    })
  }

  function handleResetConfig() {
    setPBlockG('25'); setCBlockG('25'); setGBlockG('10')
    setKcalP('100'); setKcalC('100'); setKcalG('90')
  }

  // ── Wizard onSave ────────────────────────────────────────────────────────
  function handleWizardSave(result: UserSettingsData) {
    saveSettings(result)
    setGoalP(String(result.pTarget))
    setGoalC(String(result.cTarget))
    setGoalG(String(result.gTarget))
    setWizardOpen(false)
  }

  // ────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ paddingBottom: 24 }}>

      {/* ── Card 1: Nutrição ── */}
      <div className="card">
        <div className="card-header">
          <div className="ch-info">
            <b>🍎 Nutrição</b>
            <span>Perfil corporal, metas e calculadora.</span>
          </div>
        </div>
        <div className="card-body">

          <NutriBanner settings={settings} onConfigure={() => setWizardOpen(true)} />

          {/* Metas diárias */}
          <Accordion id="accGoals" label="🎯 Metas diárias" defaultOpen>
            <div className="form-grid cols-2">
              <div className="form-row">
                <label>🥩 Proteína (g/dia)</label>
                <input inputMode="decimal" placeholder="152" value={goalP}
                  onChange={e => setGoalP(e.target.value)} />
                <small>Ex.: 152</small>
              </div>
              <div className="form-row">
                <label>🥔 Carbo (g/dia)</label>
                <input inputMode="decimal" placeholder="228" value={goalC}
                  onChange={e => setGoalC(e.target.value)} />
                <small>Ex.: 228</small>
              </div>
              <div className="form-row">
                <label>🥑 Gordura (g/dia)</label>
                <input inputMode="decimal" placeholder="31" value={goalG}
                  onChange={e => setGoalG(e.target.value)} />
                <small>Ex.: 31</small>
              </div>
              <div className="form-row">
                <label>🔥 Kcal alvo</label>
                <input
                  inputMode="decimal"
                  readOnly
                  value={kcalAlvo}
                  style={{ background: 'var(--surface3)', color: 'var(--text2)', cursor: 'default' }}
                />
                <small>P×4 + C×4 + G×9 (calculado)</small>
              </div>
            </div>
            <div className="btn-group" style={{ marginTop: 12 }}>
              <button className="btn primary" type="button" onClick={handleSaveMetas}
                disabled={!settings}>Salvar metas</button>
            </div>
          </Accordion>

          {/* Calculadora de perfil */}
          <Accordion id="accCalcFull" label="🧮 Calculadora de perfil">
            <div className="wz-entry-banner">
              <span>Configure seu perfil passo a passo</span>
              <button className="btn sm primary" type="button"
                onClick={() => setWizardOpen(true)}>🧭 Configurar</button>
            </div>
            <p className="hint" style={{ marginBottom: 12 }}>
              Ou preencha manualmente abaixo. Dobras são opcionais — sem elas usamos Mifflin-St Jeor.
            </p>

            <div className="calc-section-label">1) Dados básicos</div>
            <div className="form-grid cols-2">
              <div className="form-row">
                <label>Sexo</label>
                <select value={calcSex} onChange={e => setCalcSex(e.target.value as 'male' | 'female')}>
                  <option value="male">Homem</option>
                  <option value="female">Mulher</option>
                </select>
              </div>
              <div className="form-row">
                <label>Idade (anos)</label>
                <input inputMode="decimal" placeholder="37" value={calcAge}
                  onChange={e => setCalcAge(e.target.value)} />
              </div>
              <div className="form-row">
                <label>Peso (kg)</label>
                <input inputMode="decimal" placeholder="76" value={calcWeight}
                  onChange={e => setCalcWeight(e.target.value)} />
              </div>
              <div className="form-row">
                <label>Altura (cm)</label>
                <input inputMode="decimal" placeholder="177" value={calcHeight}
                  onChange={e => setCalcHeight(e.target.value)} />
              </div>
            </div>

            <div className="calc-section-label" style={{ marginTop: 14 }}>
              2) Dobras (mm) • 7 pontos
              <span style={{ fontSize: 10, fontWeight: 400, color: 'var(--text3)', marginLeft: 4 }}>opcional</span>
            </div>
            <div className="grid3">
              {[
                ['chest', 'Peito (mm)', sfChest, setSfChest],
                ['ax', 'Axilar média', sfAx, setSfAx],
                ['tri', 'Tríceps', sfTri, setSfTri],
                ['sub', 'Subescapular', sfSub, setSfSub],
                ['ab', 'Abdominal', sfAb, setSfAb],
                ['sup', 'Supra-ilíaca', sfSup, setSfSup],
                ['th', 'Coxa', sfTh, setSfTh],
              ].map(([key, label, val, setter]) => (
                <div key={key as string} className="form-row">
                  <label>{label as string}</label>
                  <input inputMode="decimal" value={val as string}
                    onChange={e => (setter as (v: string) => void)(e.target.value)} />
                </div>
              ))}
            </div>

            <div className="calc-section-label" style={{ marginTop: 14 }}>3) Alvo de dieta</div>
            <div className="form-grid cols-2">
              <div className="form-row" style={{ gridColumn: '1/-1' }}>
                <label>Objetivo</label>
                <select value={calcGoal} onChange={e => setCalcGoal(e.target.value as GoalType)}>
                  <option value="maintain">🟡 Manutenção — manter peso atual</option>
                  <option value="cut">🔴 Cut — emagrecer com preservação muscular</option>
                  <option value="recomp">🟢 Recomp — recomposição corporal</option>
                  <option value="bulk">🔵 Bulk — ganho de massa com mínimo de gordura</option>
                </select>
              </div>
              <div className="calc-goal-hint" style={{ gridColumn: '1/-1', fontSize: 12, color: 'var(--text3)', marginBottom: 4 }}>
                {GOAL_PRESETS[calcGoal].hint}
              </div>
              <div className="form-row">
                <label>Estilo de vida</label>
                <select value={calcActivity} onChange={e => setCalcActivity(e.target.value)}>
                  {Object.entries(WZ_ACTIVITY_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <label>Déficit (%)</label>
                <input inputMode="decimal" placeholder={String(GOAL_PRESETS[calcGoal].def)} value={calcDef}
                  onChange={e => setCalcDef(e.target.value)} />
              </div>
              <div className="form-row">
                <label>Proteína (g/kg)</label>
                <input inputMode="decimal" placeholder={String(GOAL_PRESETS[calcGoal].pKg)} value={calcPKg}
                  onChange={e => setCalcPKg(e.target.value)} />
              </div>
              <div className="form-row">
                <label>Carbo (g/kg)</label>
                <input inputMode="decimal" placeholder={String(GOAL_PRESETS[calcGoal].cKg)} value={calcCKg}
                  onChange={e => setCalcCKg(e.target.value)} />
              </div>
              <div className="form-row">
                <label>Gordura mín. (g/kg)</label>
                <input inputMode="decimal" placeholder={String(GOAL_PRESETS[calcGoal].minFatKg)} value={calcMinFatKg}
                  onChange={e => setCalcMinFatKg(e.target.value)} />
              </div>
              <div className="form-row">
                <label>Kcal fixo (opcional)</label>
                <input inputMode="decimal" placeholder="0" value={calcFixedKcal}
                  onChange={e => setCalcFixedKcal(e.target.value)} />
              </div>
            </div>

            <div className="btn-group" style={{ marginTop: 12 }}>
              <button className="btn primary" type="button" onClick={handleCalc}>Calcular</button>
              <button className="btn ghost" type="button" onClick={() => {
                  if (!settings) return
                  const w = parseFloat(calcWeight)
                  const h = parseFloat(calcHeight)
                  const a = parseFloat(calcAge)
                  const af = parseFloat(calcActivity)
                  if (!w || !h || !a || !af || !calcResult) return
                  const allSf = [sfChest, sfAx, sfTri, sfSub, sfAb, sfSup, sfTh].map(Number)
                  const hasAll = allSf.every(v => v > 0)
                  const newSettings: UserSettingsData = {
                    ...settings,
                    sex: calcSex, age: a, weightKg: w, heightCm: h,
                    activityFactor: af, goal: calcGoal,
                    def: parseFloat(calcDef) || undefined,
                    pKg: parseFloat(calcPKg) || undefined,
                    cKg: parseFloat(calcCKg) || undefined,
                    minFatKg: parseFloat(calcMinFatKg) || undefined,
                    fixedKcal: parseFloat(calcFixedKcal) || undefined,
                    skinfolds: hasAll ? {
                      chest: allSf[0], ax: allSf[1], tri: allSf[2],
                      sub: allSf[3], ab: allSf[4], sup: allSf[5], th: allSf[6],
                    } : undefined,
                    bmr: calcResult.bmr ?? 0,
                    tdee: calcResult.tdee ?? 0,
                    kcalTarget: calcResult.kcalTarget,
                    pTarget: calcResult.pTarget,
                    cTarget: calcResult.cTarget,
                    gTarget: calcResult.gTarget,
                  }
                  saveSettings(newSettings)
                }}>Salvar</button>
            </div>

            {/* Resultados */}
            {calcResult && (
              <div className="card" style={{ marginTop: 14, boxShadow: 'none', border: '1px solid var(--line)' }}>
                <div className="card-body" style={{ paddingTop: 12, paddingBottom: 12 }}>
                  <div className="kpi-grid" style={{ marginBottom: 10 }}>
                    <div className="kpi">
                      <div className="kpi-label">🧍 BF%</div>
                      <div className="kpi-value">
                        <span className="num">{calcResult.bf !== null ? calcResult.bf.toFixed(1) : '—'}</span>
                        {calcResult.bf !== null && <span className="den">%</span>}
                      </div>
                    </div>
                    <div className="kpi">
                      <div className="kpi-label">💪 Magra</div>
                      <div className="kpi-value">
                        <span className="num">{calcResult.leanKg !== null ? calcResult.leanKg.toFixed(1) : '—'}</span>
                        {calcResult.leanKg !== null && <span className="den">kg</span>}
                      </div>
                    </div>
                    <div className="kpi">
                      <div className="kpi-label">🔥 BMR</div>
                      <div className="kpi-value">
                        <span className="num">{calcResult.bmr !== null ? Math.round(calcResult.bmr) : '—'}</span>
                        {calcResult.bmr !== null && <span className="den">kcal</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.8 }}>
                    <div>🎯 Meta: <b>{calcResult.kcalTarget} kcal</b></div>
                    <div>🥩 P <b>{calcResult.pTarget}g</b> · 🥔 C <b>{calcResult.cTarget}g</b> · 🥑 G <b>{calcResult.gTarget}g</b></div>
                  </div>
                  <div className="btn-group" style={{ marginTop: 10 }}>
                    <button className="btn sm primary" type="button" onClick={handleApplyResult}>
                      ➡️ Aplicar nas metas
                    </button>
                    {calcResult.bf !== null && (
                      <button className="btn sm ghost" type="button" onClick={handleBfToMedicion}>
                        ➡️ BF% → Medição
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Accordion>

          {/* Exportar para IA — card fixo (fiel ao original) */}
          <div style={{ height: 16 }} />
          <div className="card" style={{ boxShadow: 'none', marginBottom: 0 }}>
            <div className="card-header">
              <div className="ch-info">
                <b>🤖 Exportar para IA</b>
                <span>Coach personalizado (GPT / Gemini)</span>
              </div>
            </div>
            <div className="card-body">
              <p className="ai-export-desc">
                Baixe seus dados dos últimos 60 dias e carregue em um GPT personalizado ou Gemini Gem para receber análises e sugestões de treino e nutrição.
              </p>
              <div className="ai-export-actions">
                <button className="btn sm primary" type="button" onClick={() => {
                  const payload = { exportDate: new Date().toISOString(), settings: settings ?? null }
                  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url; a.download = 'kcalix-export.json'; a.click()
                  URL.revokeObjectURL(url)
                }}>⬇️ Baixar JSON</button>
                <button className="btn sm ghost" type="button" onClick={() => {
                  const prompt = `Você é um coach de nutrição e treino. Analise os dados do usuário abaixo e forneça sugestões personalizadas de treino, nutrição e recuperação.`
                  navigator.clipboard.writeText(prompt)
                }}>📋 Copiar prompt do sistema</button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Card 2: Configurações ── */}
      <div className="card">
        <div className="card-header">
          <div className="ch-info">
            <b>⚙️ Configurações</b>
            <span>Equivalências de bloco e kcal estimadas.</span>
          </div>
        </div>
        <div className="card-body">

          <Accordion id="accBlockEq" label="🧱 Equivalência do bloco (g por 1 bloco)">
            <div className="form-grid cols-2">
              <div className="form-row">
                <label>1P = (g proteína)</label>
                <input inputMode="decimal" value={pBlockG} onChange={e => setPBlockG(e.target.value)} />
                <small>Padrão: 25</small>
              </div>
              <div className="form-row">
                <label>1C = (g carbo)</label>
                <input inputMode="decimal" value={cBlockG} onChange={e => setCBlockG(e.target.value)} />
                <small>Padrão: 25</small>
              </div>
              <div className="form-row">
                <label>1G = (g gordura)</label>
                <input inputMode="decimal" value={gBlockG} onChange={e => setGBlockG(e.target.value)} />
                <small>Padrão: 10</small>
              </div>
            </div>
          </Accordion>

          <Accordion id="accKcalBlock" label="🔢 kcal estimadas por bloco">
            <div className="form-grid cols-2">
              <div className="form-row">
                <label>kcal por 1P</label>
                <input inputMode="decimal" value={kcalP} onChange={e => setKcalP(e.target.value)} />
                <small>Sugestão: 100</small>
              </div>
              <div className="form-row">
                <label>kcal por 1C</label>
                <input inputMode="decimal" value={kcalC} onChange={e => setKcalC(e.target.value)} />
                <small>Sugestão: 100</small>
              </div>
              <div className="form-row">
                <label>kcal por 1G</label>
                <input inputMode="decimal" value={kcalG} onChange={e => setKcalG(e.target.value)} />
                <small>Sugestão: 90</small>
              </div>
            </div>
          </Accordion>

          <div className="autosave-row">
            <div className="autosave-row-info">
              <span className="autosave-row-title">Auto-salvar</span>
              <span className="autosave-row-sub">Salva automaticamente a cada alteração no Diário</span>
            </div>
            <button className="btn sm ghost" type="button">ON</button>
          </div>
          <div style={{ height: 12 }} />
          <div className="btn-group">
            <button className="btn primary" type="button" onClick={handleSaveConfig}
              disabled={!settings}>Salvar configurações</button>
            <button className="btn ghost" type="button" onClick={handleResetConfig}>Reset</button>
          </div>

        </div>
      </div>

      {/* ── Wizard ── */}
      <CalcWizardModal
        open={wizardOpen}
        isNewUser={!settings}
        initialData={settings}
        onSave={handleWizardSave}
        onClose={() => setWizardOpen(false)}
      />
    </div>
  )
}
