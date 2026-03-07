import { GOAL_PRESETS } from '../data/goalPresets'
import type { GoalType } from '../data/goalPresets'

// ── Fórmulas base (portadas do index.html linhas 5124-5134) ──────────────────

export function bmrMifflin(sex: string, weightKg: number, heightCm: number, age: number): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age
  return sex === 'female' ? base - 161 : base + 5
}

export function bmrKatch(leanKg: number): number {
  return 370 + 21.6 * leanKg
}

export function bodyDensityJP7(sex: string, age: number, sum7: number): number {
  const s = sum7
  if (sex === 'female') return 1.097 - 0.00046971 * s + 0.00000056 * s * s - 0.00012828 * age
  return 1.112 - 0.00043499 * s + 0.00000055 * s * s - 0.00028826 * age
}

export function bfSiri(density: number): number {
  return (495 / density) - 450
}

// ── Tipos de entrada ─────────────────────────────────────────────────────────

export interface CalcProfile {
  sex: 'male' | 'female'
  age: number
  weightKg: number
  heightCm: number
  activityFactor: number
  goal: GoalType
  // Dobras cutâneas JP7 (opcionais — se ausentes usa Mifflin)
  skinfolds?: {
    chest: number
    ax: number
    tri: number
    sub: number
    ab: number
    sup: number
    th: number
  }
  // Meta calórica fixa (sobrescreve o cálculo automático se informada)
  fixedKcal?: number
}

export interface CalcResult {
  bf: number | null
  leanKg: number | null
  bmr: number | null
  tdee: number | null
  kcalTarget: number
  pTarget: number
  cTarget: number
  gTarget: number
  sum7: number | null
}

// ── Função principal (equivalente ao calcAll() do app original, sem DOM) ─────

export function calcFromProfile(profile: CalcProfile): CalcResult {
  const { sex, age, weightKg, heightCm, activityFactor, goal, skinfolds, fixedKcal } = profile
  const preset = GOAL_PRESETS[goal]

  // Dobras e composição corporal
  let bf: number | null = null
  let leanKg: number | null = null
  let sum7: number | null = null

  if (skinfolds) {
    const s = skinfolds.chest + skinfolds.ax + skinfolds.tri + skinfolds.sub + skinfolds.ab + skinfolds.sup + skinfolds.th
    sum7 = s
    if (age > 0 && s > 0) {
      const bd = bodyDensityJP7(sex, age, s)
      const bfRaw = bfSiri(bd)
      if (Number.isFinite(bfRaw)) {
        bf = Math.max(2, Math.min(60, bfRaw))
        leanKg = weightKg - weightKg * (bf / 100)
      }
    }
  }

  // BMR
  let bmr: number | null = null
  if (leanKg !== null && leanKg > 0) {
    bmr = bmrKatch(leanKg)
  } else if (weightKg > 0 && heightCm > 0 && age > 0) {
    bmr = bmrMifflin(sex, weightKg, heightCm, age)
  }

  // TDEE e meta calórica
  const tdee = bmr !== null ? bmr * activityFactor : null

  let kcalTarget: number
  if (fixedKcal && fixedKcal > 0) {
    kcalTarget = fixedKcal
  } else if (tdee !== null) {
    kcalTarget = tdee * (1 - preset.def / 100)
  } else {
    kcalTarget = 2000 // fallback neutro
  }

  // Macros
  const pTarget = Math.round(preset.pKg * weightKg)
  const cTarget = Math.round(preset.cKg * weightKg)
  const rem = kcalTarget - pTarget * 4 - cTarget * 4
  const minFat = Math.round(preset.minFatKg * weightKg)
  let gTarget = Math.round(Math.max(rem / 9, minFat))

  // Se gordura mínima forçar ajuste, recalcula carboidrato
  if (rem / 9 < minFat) {
    const kcalLeftForC = kcalTarget - pTarget * 4 - gTarget * 9
    const cAdjusted = Math.max(0, Math.round(kcalLeftForC / 4))
    return { bf, leanKg, bmr, tdee, kcalTarget: Math.round(kcalTarget), pTarget, cTarget: cAdjusted, gTarget, sum7 }
  }

  return { bf, leanKg, bmr, tdee, kcalTarget: Math.round(kcalTarget), pTarget, cTarget, gTarget, sum7 }
}
