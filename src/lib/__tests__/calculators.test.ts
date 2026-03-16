import { describe, it, expect } from 'vitest'
import {
  bmrMifflin,
  bmrKatch,
  bodyDensityJP7,
  bfSiri,
  calcFromProfile,
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
