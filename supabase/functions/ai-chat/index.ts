import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `Você é o Kcal Coach, um coach especializado em nutrição e treino de força, treinado nos protocolos de Lucas Campos (baseados em Renaissance Periodization). Você tem acesso aos dados reais do usuário no Kcalix: diário alimentar, treinos, medidas corporais e check-ins.

Seja direto, honesto e orientado a dados. Nunca use elogios vazios. Sempre cite valores e datas reais dos dados. Responda sempre em português brasileiro.

---

## PASSO 1 — IDENTIFIQUE A INTENÇÃO ANTES DE TUDO

Leia a mensagem do usuário e classifique em UM dos modos abaixo. O modo determina o formato e a profundidade da resposta. Não pule este passo.

### MODO A — Pergunta direta ou simples
Sinais: pergunta curta, conceito isolado, "posso", "devo", "quanto", "o que é", pergunta sobre um alimento ou exercício específico.
→ Responda em 1 a 3 frases. Sem seções, sem diagnóstico, sem listas. Direto ao ponto.

### MODO B — Nutrição
Sinais: "macro", "proteína", "carboidrato", "gordura", "kcal", "comi", "dieta", "aderência", "refeição", "fome".
→ Analise apenas os dados de diário. Foque em: aderência P/C/G nos últimos 7 dias, qual refeição costuma falhar, ratio proteína/kg. Máximo 3 parágrafos. Sem mencionar treino ou volume muscular.

### MODO C — Treino
Sinais: "treino", "série", "volume", "exercício", "supino", "agachamento", "platô", "progressão", "MEV", "MRV", "carga".
→ Analise apenas os dados de treino. Foque em: volume por grupo muscular vs MEV/MAV/MRV, progressão de carga/reps, sugestão concreta. Máximo 3 parágrafos. Sem mencionar macros ou aderência alimentar.

### MODO D — Composição corporal
Sinais: "peso", "gordura", "bf%", "cintura", "medida", "perdi", "engordei", "check-in", "balança".
→ Analise apenas medidas e check-ins. Foque em: tendência de peso (kg/semana), BF% se disponível, correlação com aderência. Máximo 2 parágrafos.

### MODO E — Tom emocional
Sinais: "difícil", "não consigo", "desanimado", "semana ruim", "falhei", "cansado", "frustrado".
→ Empatia genuína primeiro (1 parágrafo curto). Depois 1 único ajuste concreto e simples. Sem métricas, sem lista de problemas, sem pressão.

### MODO F — Diagnóstico completo
Sinais: "analise", "como estou", "resumo", "visão geral", "tudo", "relatório", ou quando o usuário claramente pede uma análise ampla.
→ Use o formato estruturado completo definido no PASSO 3.

---

## PASSO 2 — CONHECIMENTO DE BASE

### Landmarks de volume (séries válidas/semana por grupo)
| Grupo | MEV | MAV | MRV |
|-------|-----|-----|-----|
| Peito | 10 | 15 | 22 |
| Costas | 10 | 15 | 22 |
| Quad | 8 | 14 | 22 |
| Posterior de coxa | 6 | 12 | 20 |
| Glúteos | 15 | 20 | 23 |
| Ombros | 6 | 12 | 20 |
| Bíceps | 6 | 12 | 20 |
| Tríceps | 6 | 12 | 20 |
| Core | 4 | 10 | 16 |

Série válida = reps > 0. Primária = 1,0 série. Secundária = 0,5 série.
Volume Cycling: acima do MAV por 4+ semanas → reduzir para 3-4 séries mantendo carga, por 1-2 semanas.

### Progressão por nível
- Iniciante (< 3 meses): quase toda sessão
- Intermediário (3–12 meses): a cada 1–2 semanas
- Avançado (> 12 meses): a cada 2–3 semanas
- Platô = sem progressão de carga ou reps por 2–3 semanas

### Por objetivo
- CUT: proteína 2.0–2.4g/kg. Perda segura: 0.5–1%/semana do peso.
- BULK: surplus 200–350 kcal. Proteína 1.8–2.2g/kg.
- RECOMP: proteína 2.2–2.5g/kg. Peso estável é normal — medir cintura e força.
- MANUTENÇÃO: monitorar estabilidade de peso e progressão de treino.

---

## PASSO 3 — FORMATO DO DIAGNÓSTICO COMPLETO (só MODO F)

Use este formato apenas quando o usuário pedir análise geral:

**Diagnóstico rápido:** 3 bullets com achados críticos — cite datas e valores reais.
**O que está funcionando:** 1–2 pontos positivos com dados.
**Volume muscular:** grupos abaixo do MEV / dentro do MAV / acima do MRV.
**Progressão:** 2–3 exercícios com maior avanço e os em platô.
**Ajustes:** máximo 3 ações concretas e específicas.
**Alerta:** só se houver proteína cronicamente baixa, perda > 1%/semana, grupo abaixo MEV por 4+ semanas ou queda de força persistente.
**Pergunta:** feche com UMA pergunta para entender melhor o contexto.`

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface Intent {
  needsDiary: boolean
  needsWorkout: boolean
  needsBody: boolean
  isFullDiag: boolean
}

interface FoodEntry {
  nome: string
  qty: number
  porcaoG: number
  p: number
  c: number
  g: number
  kcal: number
}

interface DiaryMeals {
  cafe?: FoodEntry[]
  lanche1?: FoodEntry[]
  almoco?: FoodEntry[]
  lanche2?: FoodEntry[]
  jantar?: FoodEntry[]
  ceia?: FoodEntry[]
}

interface DiaryData {
  meals: DiaryMeals
  totals: { p: number; c: number; g: number; kcal: number }
  kcalTreino?: number
}

interface DiaryRow {
  date: string
  data: DiaryData
}

interface SetData {
  reps: number
  carga: number
}

interface ExerciseData {
  exercicioId: string
  nome: string
  grupo: string
  series: SetData[]
}

interface WorkoutData {
  exercicios?: ExerciseData[]
}

interface WorkoutRow {
  date: string
  data: WorkoutData
}

interface BodyData {
  peso?: number
  bf?: number
  cintura?: number
  quadril?: number
  braco?: number
  perna?: number
}

interface BodyRow {
  date: string
  data: BodyData
}

interface CheckinData {
  peso?: number
  bf?: number
}

interface CheckinRow {
  date: string
  data: CheckinData
}

interface SettingsData {
  goal?: string
  peso?: number
  altura?: number
  tmb?: number
  tdee?: number
  metaP?: number
  metaC?: number
  metaG?: number
  metaKcal?: number
}

// ─── PASSO 1: Detectar intenção por palavras-chave ────────────────────────────

function detectIntent(lastMsg: string): Intent {
  const msg = lastMsg.toLowerCase()

  const isFullDiag = /analise|como estou|resumo|visão geral|visao geral|tudo|relatório|relatorio|diagnóstico|diagnostico/.test(msg)

  const needsDiary = isFullDiag || /macro|proteína|proteina|carbo|carboidrato|gordura|kcal|caloria|comi|dieta|aderência|aderencia|refeição|refeicao|almoço|almoco|café|cafe|jantar|lanche|ceia|fome|nutrição|nutricao/.test(msg)

  const needsWorkout = isFullDiag || /treino|série|serie|volume|exercício|exercicio|supino|agachamento|platô|plato|progressão|progressao|mev|mrv|mav|carga|rep|peito|costas|bíceps|biceps|tríceps|triceps|ombro|quad|glúteo|gluteo|posterior/.test(msg)

  const needsBody = isFullDiag || /peso|gordura|bf|cintura|medida|perdi|engordei|check.in|balança|balanca|composição|composicao/.test(msg)

  // Fallback: se nenhuma flag ativa, assume nutrição
  const anyActive = needsDiary || needsWorkout || needsBody
  return {
    needsDiary: anyActive ? needsDiary : true,
    needsWorkout,
    needsBody,
    isFullDiag,
  }
}

// ─── PASSO 3a: Formatar diário ────────────────────────────────────────────────

const MEAL_LABELS: Record<string, string> = {
  cafe: 'café',
  lanche1: 'lanche1',
  almoco: 'almoço',
  lanche2: 'lanche2',
  jantar: 'jantar',
  ceia: 'ceia',
}

function formatDiary(rows: DiaryRow[], settings: SettingsData | null): string {
  if (!rows.length) return 'Diário: sem registros nos últimos 7 dias.'

  const meta = settings
    ? { p: settings.metaP ?? 0, c: settings.metaC ?? 0, g: settings.metaG ?? 0, kcal: settings.metaKcal ?? 0 }
    : null

  const lines: string[] = ['### Diário alimentar (últimos 7 dias)']

  for (const row of rows) {
    const d = row.data
    const meals = d.meals ?? {}
    const mealLines: string[] = []

    for (const [key, label] of Object.entries(MEAL_LABELS)) {
      const entries = (meals as Record<string, FoodEntry[]>)[key] ?? []
      if (!entries.length) continue

      // Somar macros por refeição
      let rP = 0, rC = 0, rG = 0, rKcal = 0
      const foodNames: string[] = []
      for (const e of entries) {
        rP += e.p ?? 0
        rC += e.c ?? 0
        rG += e.g ?? 0
        rKcal += e.kcal ?? 0
        foodNames.push(`${e.nome} ${e.porcaoG ?? Math.round((e.qty ?? 1) * 100)}g`)
      }

      mealLines.push(
        `  ${label}: P=${Math.round(rP)}g C=${Math.round(rC)}g G=${Math.round(rG)}g kcal=${Math.round(rKcal)} [${foodNames.join(', ')}]`
      )
    }

    const t = d.totals ?? { p: 0, c: 0, g: 0, kcal: 0 }
    const totalLine = `  TOTAL: P=${Math.round(t.p)}g C=${Math.round(t.c)}g G=${Math.round(t.g)}g kcal=${Math.round(t.kcal)}`

    let desvioLine = ''
    if (meta && meta.kcal > 0) {
      const dp = Math.round(t.p - meta.p)
      const dc = Math.round(t.c - meta.c)
      const dg = Math.round(t.g - meta.g)
      const dk = Math.round(t.kcal - meta.kcal)
      const pct = (n: number, base: number) => base > 0 ? `${n >= 0 ? '+' : ''}${Math.round((n / base) * 100)}%` : '—'
      desvioLine = `  DESVIO: P=${dp >= 0 ? '+' : ''}${dp}g(${pct(dp, meta.p)}) C=${dc >= 0 ? '+' : ''}${dc}g(${pct(dc, meta.c)}) G=${dg >= 0 ? '+' : ''}${dg}g(${pct(dg, meta.g)}) kcal=${dk >= 0 ? '+' : ''}${dk}(${pct(dk, meta.kcal)})`
    }

    lines.push(`${row.date}:`)
    lines.push(...mealLines)
    lines.push(totalLine)
    if (desvioLine) lines.push(desvioLine)
    if (d.kcalTreino) lines.push(`  kcal treino: ${d.kcalTreino}`)
  }

  if (meta && meta.kcal > 0) {
    lines.push(`Meta diária: P=${meta.p}g C=${meta.c}g G=${meta.g}g kcal=${meta.kcal}`)
  }

  return lines.join('\n')
}

// ─── PASSO 3b: Formatar treinos ───────────────────────────────────────────────

function formatWorkouts(rows: WorkoutRow[]): string {
  if (!rows.length) return 'Treinos: sem registros nos últimos 30 dias.'

  // Acumular volume por grupo (últimos 7 dias)
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 7)
  const cutoffISO = cutoff.toISOString().split('T')[0]

  const volumeByGroup: Record<string, number> = {}
  const lines: string[] = ['### Treinos (últimos 30 dias)']

  for (const row of rows) {
    const exercicios = row.data?.exercicios ?? []
    if (!exercicios.length) continue

    const exLines: string[] = []
    for (const ex of exercicios) {
      const setsValidos = (ex.series ?? []).filter(s => s.reps > 0)
      if (!setsValidos.length) continue

      const resumo = setsValidos.map(s => `${s.reps}×${s.carga}kg`).join(', ')
      exLines.push(`  ${ex.nome} (${ex.grupo}): ${setsValidos.length}s — ${resumo}`)

      // Acumular volume só dos últimos 7 dias
      if (row.date >= cutoffISO) {
        const grupo = ex.grupo ?? 'Outros'
        volumeByGroup[grupo] = (volumeByGroup[grupo] ?? 0) + setsValidos.length
      }
    }

    if (exLines.length) {
      lines.push(`${row.date}:`)
      lines.push(...exLines)
    }
  }

  // Resumo de volume semanal
  if (Object.keys(volumeByGroup).length) {
    const MEV: Record<string, number> = {
      Peito: 10, Costas: 10, Quad: 8, 'Posterior de coxa': 6,
      Glúteos: 15, Ombros: 6, Bíceps: 6, Tríceps: 6, Core: 4,
    }
    const MAV: Record<string, number> = {
      Peito: 15, Costas: 15, Quad: 14, 'Posterior de coxa': 12,
      Glúteos: 20, Ombros: 12, Bíceps: 12, Tríceps: 12, Core: 10,
    }
    const volLines = Object.entries(volumeByGroup).map(([g, s]) => {
      const mev = MEV[g] ?? '?'
      const mav = MAV[g] ?? '?'
      const status = typeof mev === 'number' && s < mev ? '⚠️ abaixo MEV' : typeof mav === 'number' && s >= mav ? '✓ MAV+' : '✓ ok'
      return `  ${g}: ${s}s (MEV=${mev}, MAV=${mav}) ${status}`
    })
    lines.push('Volume últimos 7 dias:')
    lines.push(...volLines)
  }

  return lines.join('\n')
}

// ─── PASSO 3c: Formatar medidas e checkins ────────────────────────────────────

function formatBody(bodyRows: BodyRow[], checkinRows: CheckinRow[]): string {
  if (!bodyRows.length && !checkinRows.length) return 'Corpo: sem medidas ou check-ins registrados.'

  const lines: string[] = ['### Medidas e check-ins']

  for (const row of bodyRows) {
    const d = row.data ?? {}
    const parts: string[] = []
    if (d.peso) parts.push(`${d.peso}kg`)
    if (d.bf) parts.push(`BF=${d.bf}%`)
    if (d.cintura) parts.push(`cintura=${d.cintura}cm`)
    if (d.quadril) parts.push(`quadril=${d.quadril}cm`)
    if (d.braco) parts.push(`braço=${d.braco}cm`)
    if (d.perna) parts.push(`perna=${d.perna}cm`)
    if (parts.length) lines.push(`  ${row.date}: ${parts.join(' | ')}`)
  }

  for (const row of checkinRows) {
    const d = row.data ?? {}
    const parts: string[] = []
    if (d.peso) parts.push(`peso=${d.peso}kg`)
    if (d.bf) parts.push(`BF=${d.bf}%`)
    if (parts.length) lines.push(`  check-in ${row.date}: ${parts.join(' | ')}`)
  }

  // Tendência de peso (primeiros vs últimos registros disponíveis)
  const allWeights: { date: string; peso: number }[] = [
    ...bodyRows.filter(r => r.data?.peso).map(r => ({ date: r.date, peso: r.data.peso! })),
    ...checkinRows.filter(r => r.data?.peso).map(r => ({ date: r.date, peso: r.data.peso! })),
  ].sort((a, b) => a.date.localeCompare(b.date))

  if (allWeights.length >= 2) {
    const first = allWeights[0]
    const last = allWeights[allWeights.length - 1]
    const diffDias = Math.max(1, (new Date(last.date).getTime() - new Date(first.date).getTime()) / 86400000)
    const diffKg = last.peso - first.peso
    const kgSem = (diffKg / diffDias * 7).toFixed(2)
    lines.push(`  Tendência: ${diffKg >= 0 ? '+' : ''}${diffKg.toFixed(1)}kg em ${Math.round(diffDias)} dias (${kgSem >= '0' ? '+' : ''}${kgSem}kg/sem)`)
  }

  return lines.join('\n')
}

// ─── Handler principal ────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Token inválido' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const { messages } = await req.json() as { messages: Message[] }
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'messages inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // ── PASSO 1: Detectar intenção ──────────────────────────────────────────
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')?.content ?? ''
    const intent = detectIntent(lastUserMsg)

    // ── PASSO 2: Busca cirúrgica — só o necessário ─────────────────────────
    const since7 = new Date()
    since7.setDate(since7.getDate() - 7)
    const since7ISO = since7.toISOString().split('T')[0]

    const since30 = new Date()
    since30.setDate(since30.getDate() - 30)
    const since30ISO = since30.toISOString().split('T')[0]

    const queries: Promise<unknown>[] = [
      // settings sempre (pequeno, contém metas)
      supabase.from('user_settings').select('data').eq('user_id', user.id).single(),
    ]

    if (intent.needsDiary) {
      queries.push(
        supabase.from('diary_entries')
          .select('date, data')
          .eq('user_id', user.id)
          .gte('date', since7ISO)
          .order('date', { ascending: false })
      )
    }

    if (intent.needsWorkout) {
      queries.push(
        supabase.from('workouts')
          .select('date, data')
          .eq('user_id', user.id)
          .gte('date', since30ISO)
          .order('date', { ascending: false })
      )
    }

    if (intent.needsBody) {
      queries.push(
        supabase.from('body_measurements')
          .select('date, data')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(5)
      )
      queries.push(
        supabase.from('checkins')
          .select('date, data')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(5)
      )
    }

    const results = await Promise.all(queries)

    // Extrair resultados na ordem em que foram adicionados
    let idx = 0
    const settingsRes = results[idx++] as { data: { data: SettingsData } | null }
    const settings: SettingsData | null = settingsRes.data?.data ?? null

    let diaryRows: DiaryRow[] = []
    let workoutRows: WorkoutRow[] = []
    let bodyRows: BodyRow[] = []
    let checkinRows: CheckinRow[] = []

    if (intent.needsDiary) {
      const r = results[idx++] as { data: DiaryRow[] | null }
      diaryRows = r.data ?? []
    }
    if (intent.needsWorkout) {
      const r = results[idx++] as { data: WorkoutRow[] | null }
      workoutRows = r.data ?? []
    }
    if (intent.needsBody) {
      const r = results[idx++] as { data: BodyRow[] | null }
      bodyRows = r.data ?? []
      const r2 = results[idx++] as { data: CheckinRow[] | null }
      checkinRows = r2.data ?? []
    }

    // ── PASSO 3: Pré-processar → texto compacto ────────────────────────────
    const contextParts: string[] = []

    if (settings) {
      const s = settings
      const parts: string[] = []
      if (s.goal) parts.push(`objetivo=${s.goal}`)
      if (s.peso) parts.push(`peso=${s.peso}kg`)
      if (s.altura) parts.push(`altura=${s.altura}cm`)
      if (s.tdee) parts.push(`TDEE=${s.tdee}kcal`)
      if (parts.length) contextParts.push(`Perfil: ${parts.join(' | ')}`)
    }

    if (intent.needsDiary) contextParts.push(formatDiary(diaryRows, settings))
    if (intent.needsWorkout) contextParts.push(formatWorkouts(workoutRows))
    if (intent.needsBody) contextParts.push(formatBody(bodyRows, checkinRows))

    // Indicar ao modelo quais dados NÃO foram buscados (evita alucinação)
    const missing: string[] = []
    if (!intent.needsDiary) missing.push('diário alimentar')
    if (!intent.needsWorkout) missing.push('treinos')
    if (!intent.needsBody) missing.push('medidas corporais')
    if (missing.length) {
      contextParts.push(`(Dados não carregados para esta pergunta: ${missing.join(', ')} — peça uma análise completa se quiser tudo)`)
    }

    const contextBlock = `\n\n## DADOS DO USUÁRIO\n${contextParts.join('\n\n')}`

    // ── Chamar OpenAI ───────────────────────────────────────────────────────
    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiKey) {
      return new Response(
        JSON.stringify({ error: 'Configuração incompleta' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 800,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT + contextBlock },
          ...messages,
        ],
      }),
    })

    if (!openaiRes.ok) {
      const err = await openaiRes.text()
      return new Response(
        JSON.stringify({ error: `OpenAI error: ${err}` }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const openaiData = await openaiRes.json()
    const reply = openaiData.choices?.[0]?.message?.content ?? ''

    return new Response(
      JSON.stringify({ reply }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )

  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
