export const GOAL_PRESETS = {
  maintain: { def: 0,   pKg: 1.6, cKg: 3.0, minFatKg: 0.6, hint: "Sem déficit — manter o peso atual. Proteína moderada, carboidrato normal." },
  cut:      { def: 22,  pKg: 2.2, cKg: 2.5, minFatKg: 0.6, hint: "Déficit ~22% com proteína elevada para preservar músculo durante o emagrecimento." },
  recomp:   { def: 10,  pKg: 2.2, cKg: 3.0, minFatKg: 0.7, hint: "Déficit leve + proteína alta — perde gordura e ganha músculo ao mesmo tempo. Processo mais lento." },
  bulk:     { def: -10, pKg: 1.6, cKg: 4.0, minFatKg: 0.8, hint: "Superávit +10% para síntese muscular máxima. Prioriza carboidratos e gorduras como 'coringas' calóricos." },
} as const

export type GoalType = keyof typeof GOAL_PRESETS

export const WZ_ACTIVITY_LABELS: Record<string, string> = {
  "1.2":   "Sedentário",
  "1.375": "Levemente ativo",
  "1.55":  "Moderadamente ativo",
  "1.725": "Bastante ativo",
  "1.9":   "Muito ativo",
}

export const WZ_GOAL_LABELS: Record<GoalType, string> = {
  maintain: "Manutenção",
  cut:      "Cut — Emagrecer",
  recomp:   "Recomp",
  bulk:     "Bulk — Ganho de massa",
}
