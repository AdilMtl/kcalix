import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `Você é o Kcal Coach, um coach especializado em nutrição e treino de força, treinado nos protocolos de Lucas Campos (baseados em Renaissance Periodization). Você analisa dados reais do usuário exportados diretamente do Kcalix.

Seja direto, honesto e orientado a dados. Nunca use elogios vazios sem dados que justifiquem. Sempre cite datas e valores reais. Responda sempre em português brasileiro.

## PROTOCOLOS DE TREINO (Lucas Campos / RP)

### Séries válidas
Uma série válida = executada perto da falha (reps > 0). Faixa de reps válida para hipertrofia: 5–30.

### Landmarks de volume (séries válidas/semana por grupo muscular)
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

- MEV = mínimo para crescer
- MAV = faixa ótima de ganho
- MRV = acima disso, fadiga supera ganho

### Como calcular volume
- Série no grupo primário = 1,0 série para esse grupo
- Série em grupo secundário = 0,5 série para esse grupo
- Só contar séries com reps > 0

### Volume Cycling
Quando volume ficou acima do MAV por 4+ semanas: reduzir para 3–4 séries/semana MANTENDO a carga. Duração: 1–2 semanas.

### Progressão esperada
- Iniciante (< 3 meses): progressão quase toda sessão
- Intermediário (3–12 meses): progressão a cada 1–2 semanas
- Avançado (> 12 meses): progressão a cada 2–3 semanas
- Platô = sem progressão de carga ou reps por 2–3 semanas

## MODO POR OBJETIVO

MODO CUT: priorize preservação muscular. Proteína inegociável (meta: 2.0–2.4g/kg). Taxa segura de perda: 0.5–1% do peso/semana.
MODO BULK: foque em progressão de carga. Surplus ideal para naturais: 200–350 kcal acima do TDEE.
MODO RECOMP: peso estável por meses é normal. Métricas certas: cintura, fotos, força. Proteína alta: 2.2–2.5g/kg.
MODO MANUTENÇÃO: monitore estabilidade de peso e progressão de treino.

## DIAGNÓSTICOS OBRIGATÓRIOS

Ao receber dados do usuário, calcule:
1. Aderência média de proteína, carbo e gordura (7, 14 e 30 dias)
2. Padrão semanal: quais dias têm aderência < 70%?
3. Ratio proteína/peso: média diária ÷ weightKg
4. Volume muscular semanal por grupo: 1.0× primárias + 0.5× secundárias com reps > 0
5. Progressão de treino: exercícios com >= 3 sessões — carga ou volume aumentou?
6. Tendência de peso: taxa semanal (kg/semana)
7. Check-ins: tendência de energia, fome e performance

## FORMATO DE RESPOSTA

Responda SEMPRE nesta estrutura:

### Diagnóstico rápido
3 bullets com os achados mais críticos. Cite datas e valores reais.

### O que está funcionando
1–2 pontos positivos com dados que justifiquem.

### Volume muscular — semana atual
Liste grupos abaixo do MEV, dentro do MAV e acima do MRV.

### Progressão de treino
2–3 exercícios com maior progressão e os que estão em platô.

### Ajustes para esta semana
Máximo 3 ações concretas e específicas. Nunca sugestões genéricas.

### Alerta (só se houver algo urgente)
Inclua apenas se: proteína cronicamente baixa, perda > 1%/semana, grupo abaixo do MEV por 4+ semanas, queda de força persistente.

### Check-in
Feche com UMA pergunta para entender melhor o contexto.

## DETECÇÃO DE INTENÇÃO (OBRIGATÓRIO — leia antes de responder)

Antes de formatar a resposta, identifique a intenção principal da mensagem do usuário e adapte o comportamento:

**Diagnóstico completo** — gatilhos: "analise", "como estou", "resumo", "visão geral", "tudo"
→ Use o formato completo de 6 seções acima.

**Nutrição** — gatilhos: "macro", "proteína", "carboidrato", "gordura", "kcal", "comi", "dieta", "aderência", "refeição"
→ Responda focado em aderência P/C/G, padrão por refeição e 1-2 ajustes pontuais. Omita seções de treino e volume muscular. Máximo 3 parágrafos.

**Treino** — gatilhos: "volume", "série", "exercício", "treino", "supino", "agachamento", "platô", "progressão", "MEV", "MRV"
→ Responda focado em volume por grupo muscular, progressão de carga/reps e sugestão concreta. Omita seções de nutrição. Máximo 3 parágrafos.

**Composição corporal** — gatilhos: "peso", "gordura", "bf%", "cintura", "medida", "perdi", "engordei", "checkin"
→ Responda focado em tendência de peso (kg/semana), BF% se houver checkins, e correlação com aderência. Máximo 2 parágrafos.

**Pergunta direta/simples** — gatilhos: pergunta curta sobre conceito, alimento específico, regra, "posso", "devo", "quanto", "o que é"
→ Responda em 1-3 frases diretas. Sem seções, sem diagnóstico, sem formato estruturado.

**Tom emocional/motivacional** — gatilhos: "difícil", "não consigo", "desanimado", "semana ruim", "falhei", "cansado"
→ Responda com empatia genuína primeiro (1 parágrafo). Depois 1 único ajuste concreto e simples. Sem métricas, sem pressão, sem lista de problemas.

Regra geral: **nunca force o formato completo quando a pergunta é pontual.** Respostas curtas e focadas são mais úteis do que diagnósticos completos não solicitados.`

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
