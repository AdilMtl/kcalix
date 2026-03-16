import { describe, it, expect } from 'vitest'
import {
  validateExport,
  buildPreview,
  transformDiary,
  transformCustomExercises,
  transformCheckins,
  transformAll,
  type FullExport,
} from '../migrationTransform'

// ── Fixture base ──────────────────────────────────────────────────────────────

function makeExport(overrides: Partial<FullExport> = {}): FullExport {
  return {
    _version: 1,
    _exportedAt: '2026-03-01T00:00:00.000Z',
    _app: 'blocos-tracker',
    settings: {
      sex: 'male',
      age: 30,
      weightKg: 80,
      heightCm: 180,
      goal: 'cut',
      activityFactor: 1.55,
      bmr: 1780,
      tdee: 2759,
      kcalTarget: 2200,
      pTarget: 160,
      cTarget: 220,
      gTarget: 60,
      blocks: { pG: 30, cG: 30, gG: 10 },
      kcalPerBlock: { p: 120, c: 120, g: 90 },
    },
    diary: {
      '2026-03-01': {
        meals: {
          cafe: {
            p: 30, c: 40, g: 10, kcal: 370,
            items: [
              {
                foodId: 'food_001', nome: 'Ovo', qty: 3, porcaoG: 50,
                p: 18, c: 0, g: 9, kcal: 153, at: '2026-03-01T08:00:00.000Z',
              },
            ],
          },
          lanche1: { p: 0, c: 0, g: 0, kcal: 0, items: [] },
          almoco: { p: 40, c: 60, g: 15, kcal: 535, items: [] },
          lanche2: { p: 0, c: 0, g: 0, kcal: 0, items: [] },
          jantar: { p: 0, c: 0, g: 0, kcal: 0, items: [] },
          ceia:   { p: 0, c: 0, g: 0, kcal: 0, items: [] },
        },
        totals: { p: 70, c: 100, g: 25, kcal: 905 },
        kcalTreino: 300,
      },
      '2026-03-02': {
        meals: {
          cafe: { p: 25, c: 30, g: 8, kcal: 296, items: [] },
          lanche1: { p: 0, c: 0, g: 0, kcal: 0, items: [] },
          almoco: { p: 0, c: 0, g: 0, kcal: 0, items: [] },
          lanche2: { p: 0, c: 0, g: 0, kcal: 0, items: [] },
          jantar: { p: 0, c: 0, g: 0, kcal: 0, items: [] },
          ceia:   { p: 0, c: 0, g: 0, kcal: 0, items: [] },
        },
        totals: { p: 25, c: 30, g: 8, kcal: 296 },
        kcalTreino: 0,
      },
      '2026-03-03': {
        meals: {
          cafe: { p: 0, c: 0, g: 0, kcal: 0, items: [] },
          lanche1: { p: 0, c: 0, g: 0, kcal: 0, items: [] },
          almoco: { p: 0, c: 0, g: 0, kcal: 0, items: [] },
          lanche2: { p: 0, c: 0, g: 0, kcal: 0, items: [] },
          jantar: { p: 0, c: 0, g: 0, kcal: 0, items: [] },
          ceia:   { p: 0, c: 0, g: 0, kcal: 0, items: [] },
        },
        totals: { p: 0, c: 0, g: 0, kcal: 0 },
        kcalTreino: 0,
      },
    },
    workouts: {
      '2026-03-01': {
        templateId: 'tmpl_A',
        exercicios: [{ exercicioId: 'ex_001', series: [{ reps: '10', carga: '50' }] }],
        cardio: [{ tipo: 'caminhada', minutos: 20 }],
        nota: 'bom treino',
        kcal: 320,
        savedAt: '2026-03-01T18:00:00.000Z',
      },
      '2026-03-02': {
        templateId: null,
        exercicios: [],
        cardio: [],
        nota: '',
        kcal: 0,
        savedAt: '2026-03-02T18:00:00.000Z',
      },
    },
    templates: [
      { id: 'tmpl_A', nome: 'Treino A', cor: '#7c5cff', exercicios: ['ex_001'], cardio: { tipo: '', min: 0 } },
    ],
    customExercises: [
      { id: 'custom_001', nome: 'Rosca Concentrada', grupo: '💪 Bíceps', secundarios: ['Antebraço'] },
      { id: 'custom_002', nome: 'Supino Inclinado', grupo: 'Peito', secundarios: [] },
    ],
    body: {
      '2026-03-01': { weightKg: 80, waistCm: 85, bfPct: 15, note: '' },
    },
    habits: {
      '2026-03-01': { dieta: true, log: true, treino: true, cardio: false, medidas: false },
    },
    customFoods: [
      { id: 'cf_001', nome: 'Whey Protein', porcao: '30g', porcaoG: 30, p: 24, c: 2, g: 1, kcal: 113 },
    ],
    checkins: [],
    ...overrides,
  }
}

// ── validateExport ────────────────────────────────────────────────────────────

describe('validateExport', () => {
  it('aceita JSON válido do blocos-tracker', () => {
    expect(() => validateExport(makeExport())).not.toThrow()
  })

  it('aceita JSON válido do kcalix', () => {
    expect(() => validateExport(makeExport({ _app: 'kcalix' }))).not.toThrow()
  })

  it('rejeita _version diferente de 1', () => {
    expect(() => validateExport(makeExport({ _version: 2 }))).toThrow('Versão do arquivo não suportada')
  })

  it('rejeita _app desconhecido', () => {
    expect(() => validateExport(makeExport({ _app: 'outro-app' as 'kcalix' }))).toThrow()
  })

  it('rejeita JSON sem campo diary', () => {
    const bad = { ...makeExport(), diary: undefined } as unknown
    expect(() => validateExport(bad)).toThrow('Campo "diary" ausente')
  })

  it('rejeita valor nulo', () => {
    expect(() => validateExport(null)).toThrow('Arquivo inválido')
  })
})

// ── buildPreview ──────────────────────────────────────────────────────────────

describe('buildPreview', () => {
  it('conta diary, workouts e body corretamente', () => {
    const preview = buildPreview(makeExport())
    expect(preview.diaryDays).toBe(3)
    expect(preview.workoutDays).toBe(2)
    expect(preview.bodyDays).toBe(1)
    expect(preview.templates).toBe(1)
    expect(preview.customExercises).toBe(2)
    expect(preview.customFoods).toBe(1)
    expect(preview.habitDays).toBe(1)
    expect(preview.checkins).toBe(0)
  })

  it('retorna firstDate e lastDate corretos', () => {
    const preview = buildPreview(makeExport())
    expect(preview.firstDate).toBe('2026-03-01')
    expect(preview.lastDate).toBe('2026-03-03')
  })
})

// ── transformDiary ────────────────────────────────────────────────────────────

describe('transformDiary', () => {
  it('transforma refeição com items em FoodEntry[]', () => {
    const result = transformDiary(makeExport().diary)
    const day = result.find(d => d.date === '2026-03-01')!
    expect(day.data.meals.cafe).toHaveLength(1)
    expect(day.data.meals.cafe[0].foodId).toBe('food_001')
    expect(day.data.meals.cafe[0].nome).toBe('Ovo')
    expect(day.data.meals.cafe[0].qty).toBe(3)
  })

  it('transforma refeição com totais mas sem items em item sintético', () => {
    const result = transformDiary(makeExport().diary)
    const day = result.find(d => d.date === '2026-03-01')!
    // almoco tem p:40 c:60 g:15 mas items: []
    expect(day.data.meals.almoco).toHaveLength(1)
    expect(day.data.meals.almoco[0].foodId).toBe('manual_import')
    expect(day.data.meals.almoco[0].nome).toBe('Registro importado')
  })

  it('mantém refeição vazia como []', () => {
    const result = transformDiary(makeExport().diary)
    const day = result.find(d => d.date === '2026-03-01')!
    expect(day.data.meals.lanche1).toHaveLength(0)
  })

  it('preserva kcalTreino', () => {
    const result = transformDiary(makeExport().diary)
    const day = result.find(d => d.date === '2026-03-01')!
    expect(day.data.kcalTreino).toBe(300)
  })

  it('retorna 1 entrada por dia', () => {
    const result = transformDiary(makeExport().diary)
    expect(result).toHaveLength(3)
  })
})

// ── transformCustomExercises ──────────────────────────────────────────────────

describe('transformCustomExercises', () => {
  it('remove prefixo de emoji do grupo', () => {
    const result = transformCustomExercises(makeExport().customExercises)
    const biceps = result.find(e => e.nome === 'Rosca Concentrada')!
    expect(biceps.grupo).toBe('Bíceps')
  })

  it('preserva grupo sem emoji', () => {
    const result = transformCustomExercises(makeExport().customExercises)
    const peito = result.find(e => e.nome === 'Supino Inclinado')!
    expect(peito.grupo).toBe('Peito')
  })

  it('preserva idOriginal igual ao id do JSON', () => {
    const result = transformCustomExercises(makeExport().customExercises)
    expect(result[0].idOriginal).toBe('custom_001')
    expect(result[1].idOriginal).toBe('custom_002')
  })

  it('inicializa arquivado como false', () => {
    const result = transformCustomExercises(makeExport().customExercises)
    expect(result.every(e => e.arquivado === false)).toBe(true)
  })

  it('não explode com array vazio', () => {
    expect(transformCustomExercises([])).toEqual([])
  })
})

// ── transformCheckins ─────────────────────────────────────────────────────────

describe('transformCheckins', () => {
  it('mescla 2 checkins na mesma data em 1 linha', () => {
    const checkins = [
      { date: '2026-03-01', weightKg: 80, waistCm: undefined, bfPct: undefined },
      { date: '2026-03-01', weightKg: undefined, waistCm: 85, bfPct: 15 },
    ]
    const result = transformCheckins(checkins)
    expect(result).toHaveLength(1)
    expect(result[0].weight_kg).toBe(80)
    expect(result[0].waist_cm).toBe(85)
    expect(result[0].bf_pct).toBe(15)
  })

  it('não sobrescreve valor existente com nulo ao mesclar', () => {
    const checkins = [
      { date: '2026-03-01', weightKg: 80 },
      { date: '2026-03-01', weightKg: undefined },
    ]
    const result = transformCheckins(checkins)
    expect(result[0].weight_kg).toBe(80)
  })

  it('mantém checkins de datas diferentes separados', () => {
    const checkins = [
      { date: '2026-03-01', weightKg: 80 },
      { date: '2026-03-02', weightKg: 81 },
    ]
    const result = transformCheckins(checkins)
    expect(result).toHaveLength(2)
  })

  it('não explode com array vazio', () => {
    expect(transformCheckins([])).toEqual([])
  })
})

// ── transformAll ──────────────────────────────────────────────────────────────

describe('transformAll', () => {
  it('transforma JSON completo sem lançar exceção', () => {
    expect(() => transformAll(makeExport())).not.toThrow()
  })

  it('retorna todos os arrays do TransformResult', () => {
    const result = transformAll(makeExport())
    expect(Array.isArray(result.diary)).toBe(true)
    expect(Array.isArray(result.workouts)).toBe(true)
    expect(Array.isArray(result.templates)).toBe(true)
    expect(Array.isArray(result.customExercises)).toBe(true)
    expect(Array.isArray(result.body)).toBe(true)
    expect(Array.isArray(result.habits)).toBe(true)
    expect(Array.isArray(result.customFoods)).toBe(true)
    expect(Array.isArray(result.checkins)).toBe(true)
  })

  it('não explode com workouts e templates ausentes (campos opcionais)', () => {
    const partial = makeExport({ workouts: {} as FullExport['workouts'], templates: [] })
    expect(() => transformAll(partial)).not.toThrow()
    const result = transformAll(partial)
    expect(result.workouts).toHaveLength(0)
    expect(result.templates).toHaveLength(0)
  })

  it('settings retorna objeto com bmr e tdee > 0', () => {
    const result = transformAll(makeExport())
    expect(result.settings.bmr).toBeGreaterThan(0)
    expect(result.settings.tdee).toBeGreaterThan(0)
  })
})
