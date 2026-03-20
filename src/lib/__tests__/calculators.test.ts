import { describe, it, expect } from 'vitest'
import {
  bmrMifflin,
  bmrKatch,
  bodyDensityJP7,
  bfSiri,
  calcFromProfile,
  calcWaterGoal,
} from '../calculators'

// ── bmrMifflin ────────────────────────────────────────────────────────────────

describe('bmrMifflin', () => {
  it('calcula BMR masculino corretamente', () => {
    // 10*80 + 6.25*180 - 5*30 + 5 = 1780
    expect(bmrMifflin('male', 80, 180, 30)).toBe(1780)
  })

  it('calcula BMR feminino corretamente', () => {
    // 10*60 + 6.25*165 - 5*25 - 161 = 1345.25
    expect(bmrMifflin('female', 60, 165, 25)).toBe(1345.25)
  })
})

// ── bmrKatch ─────────────────────────────────────────────────────────────────

describe('bmrKatch', () => {
  it('calcula BMR por lean mass corretamente', () => {
    // 370 + 21.6*65 = 1774
    expect(bmrKatch(65)).toBe(1774)
  })
})

// ── bodyDensityJP7 ────────────────────────────────────────────────────────────

describe('bodyDensityJP7', () => {
  it('calcula densidade corporal masculina (sum7=50, age=30)', () => {
    const result = bodyDensityJP7('male', 30, 50)
    expect(result).toBeCloseTo(1.08298, 4)
  })

  it('calcula densidade corporal feminina (sum7=50, age=25)', () => {
    const result = bodyDensityJP7('female', 25, 50)
    expect(result).toBeCloseTo(1.07171, 4)
  })
})

// ── bfSiri ────────────────────────────────────────────────────────────────────

describe('bfSiri', () => {
  it('converte densidade em % gordura corretamente', () => {
    // 495 / 1.08298 - 450 ≈ 7.07
    const result = bfSiri(1.08298)
    expect(result).toBeCloseTo(7.07, 1)
  })
})

// ── calcFromProfile ───────────────────────────────────────────────────────────

describe('calcFromProfile', () => {
  const baseProfile = {
    sex: 'male' as const,
    age: 30,
    weightKg: 80,
    heightCm: 180,
    activityFactor: 1.55,
    goal: 'cut' as const,
  }

  it('retorna todos os campos numéricos > 0 para perfil completo sem dobras', () => {
    const result = calcFromProfile(baseProfile)
    expect(result.bmr).toBeGreaterThan(0)
    expect(result.tdee).toBeGreaterThan(0)
    expect(result.kcalTarget).toBeGreaterThan(0)
    expect(result.pTarget).toBeGreaterThan(0)
    expect(result.cTarget).toBeGreaterThan(0)
    expect(result.gTarget).toBeGreaterThan(0)
  })

  it('usa Mifflin quando não há dobras (bf e leanKg são null)', () => {
    const result = calcFromProfile(baseProfile)
    expect(result.bf).toBeNull()
    expect(result.leanKg).toBeNull()
    expect(result.sum7).toBeNull()
    // BMR deve ser o Mifflin: 1780
    expect(result.bmr).toBe(1780)
  })

  it('usa Katch e preenche bf/leanKg/sum7 quando há skinfolds', () => {
    const result = calcFromProfile({
      ...baseProfile,
      skinfolds: { chest: 10, ax: 8, tri: 6, sub: 9, ab: 12, sup: 7, th: 8 },
    })
    expect(result.bf).not.toBeNull()
    expect(result.leanKg).not.toBeNull()
    expect(result.sum7).toBe(60) // 10+8+6+9+12+7+8
    // Com leanKg calculado, BMR vem do Katch (não Mifflin)
    expect(result.bmr).not.toBe(1780)
    expect(result.bmr).toBeGreaterThan(0)
  })

  it('respeita fixedKcal quando informado', () => {
    const result = calcFromProfile({ ...baseProfile, fixedKcal: 2500 })
    expect(result.kcalTarget).toBe(2500)
  })

  it('retorna sum7 correto com 7 dobras', () => {
    const skinfolds = { chest: 5, ax: 5, tri: 5, sub: 5, ab: 5, sup: 5, th: 5 }
    const result = calcFromProfile({ ...baseProfile, skinfolds })
    expect(result.sum7).toBe(35)
  })

  it('bf é limitado entre 2 e 60', () => {
    // sum7 extremamente baixo → bf potencialmente negativo → deve clampar em 2
    const result = calcFromProfile({
      ...baseProfile,
      skinfolds: { chest: 1, ax: 1, tri: 1, sub: 1, ab: 1, sup: 1, th: 1 },
    })
    if (result.bf !== null) {
      expect(result.bf).toBeGreaterThanOrEqual(2)
      expect(result.bf).toBeLessThanOrEqual(60)
    }
  })
})

// ── calcWaterGoal ─────────────────────────────────────────────────────────────

describe('calcWaterGoal', () => {
  it('homem sedentário 70kg — base + sexo, sem ajuste de atividade', () => {
    const r = calcWaterGoal('male', 70, 1.2, 'maintain')
    // base=2450, sexAdj=+300, actAdj=0, goalAdj=0, bfAdj=0 → 2750 → arredonda a 50 → 2750
    expect(r.goalMl).toBe(2750)
    expect(r.breakdown.base).toBe(2450)
    expect(r.breakdown.sexAdj).toBe(300)
    expect(r.breakdown.actAdj).toBe(0)
    expect(r.breakdown.goalAdj).toBe(0)
    expect(r.breakdown.bfAdj).toBe(0)
    expect(r.confidence).toBe('medium')
    expect(r.sources).toContain('EFSA 2010')
  })

  it('mulher moderadamente ativa 60kg — sem ajuste de sexo', () => {
    const r = calcWaterGoal('female', 60, 1.55, 'maintain')
    // base=2100, sexAdj=0, actAdj=+500, goalAdj=0, bfAdj=0 → 2600
    expect(r.goalMl).toBe(2600)
    expect(r.breakdown.sexAdj).toBe(0)
    expect(r.breakdown.actAdj).toBe(500)
  })

  it('objetivo de corte adiciona +200ml', () => {
    const r = calcWaterGoal('male', 80, 1.2, 'cut')
    // base=2800, sexAdj=+300, actAdj=0, goalAdj=+200 → 3300
    expect(r.goalMl).toBe(3300)
    expect(r.breakdown.goalAdj).toBe(200)
  })

  it('objetivo recomp também adiciona +200ml', () => {
    const r = calcWaterGoal('male', 80, 1.2, 'recomp')
    expect(r.breakdown.goalAdj).toBe(200)
  })

  it('objetivo bulk ou maintain não adiciona goalAdj', () => {
    const rBulk = calcWaterGoal('male', 80, 1.2, 'bulk')
    const rMaint = calcWaterGoal('male', 80, 1.2, 'maintain')
    expect(rBulk.breakdown.goalAdj).toBe(0)
    expect(rMaint.breakdown.goalAdj).toBe(0)
  })

  it('BF% elevado em homem (>25%) aplica redução de 5% na base', () => {
    const r = calcWaterGoal('male', 80, 1.2, 'maintain', 28)
    // base=2800, bfAdj=-140 → arredondado
    expect(r.breakdown.bfAdj).toBe(-Math.round(2800 * 0.05))
    expect(r.confidence).toBe('high')
  })

  it('BF% elevado em mulher (>32%) aplica redução', () => {
    const r = calcWaterGoal('female', 70, 1.2, 'maintain', 35)
    expect(r.breakdown.bfAdj).toBeLessThan(0)
    expect(r.confidence).toBe('high')
  })

  it('BF% abaixo do limiar não aplica redução', () => {
    const r = calcWaterGoal('male', 80, 1.2, 'maintain', 20)
    expect(r.breakdown.bfAdj).toBe(0)
  })

  it('resultado é sempre múltiplo de 50', () => {
    const r = calcWaterGoal('male', 73, 1.55, 'cut', 22)
    expect(r.goalMl % 50).toBe(0)
  })

  it('resultado é sempre entre 1500 e 4500', () => {
    // peso irreal baixo
    const low = calcWaterGoal('female', 5, 1.2, 'maintain')
    expect(low.goalMl).toBeGreaterThanOrEqual(1500)
    // peso irreal alto
    const high = calcWaterGoal('male', 200, 1.9, 'cut')
    expect(high.goalMl).toBeLessThanOrEqual(4500)
  })

  it('confidence=low quando weightKg=0', () => {
    const r = calcWaterGoal('male', 0, 1.55, 'maintain')
    expect(r.confidence).toBe('low')
  })
})
