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

interface Message {
  role: 'user' | 'assistant'
  content: string
}

Deno.serve(async (req) => {
  // Preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Validar JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // Cliente autenticado como o usuário (para respeitar RLS)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    )

    // Validar JWT e obter user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Token inválido' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // Extrair messages do body
    const { messages } = await req.json() as { messages: Message[] }
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'messages inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // Buscar dados do usuário — últimos 30 dias
    const since = new Date()
    since.setDate(since.getDate() - 30)
    const sinceISO = since.toISOString().split('T')[0]

    const [settingsRes, diaryRes, workoutsRes, bodyRes, checkinsRes] = await Promise.all([
      supabase.from('user_settings').select('data').eq('user_id', user.id).single(),
      supabase.from('diary_entries').select('date, data').eq('user_id', user.id).gte('date', sinceISO).order('date', { ascending: false }),
      supabase.from('workouts').select('date, data').eq('user_id', user.id).gte('date', sinceISO).order('date', { ascending: false }),
      supabase.from('body_measurements').select('date, data').eq('user_id', user.id).order('date', { ascending: false }).limit(5),
      supabase.from('checkins').select('date, data').eq('user_id', user.id).order('date', { ascending: false }).limit(5),
    ])

    // Montar contexto compacto do usuário
    const userContext = {
      settings: settingsRes.data?.data ?? null,
      diary: diaryRes.data ?? [],
      workouts: workoutsRes.data ?? [],
      body: bodyRes.data ?? [],
      checkins: checkinsRes.data ?? [],
    }

    const contextBlock = `\n\n## DADOS REAIS DO USUÁRIO (últimos 30 dias)\n\`\`\`json\n${JSON.stringify(userContext, null, 2)}\n\`\`\``

    // Chamar OpenAI
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
        max_tokens: 1000,
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
