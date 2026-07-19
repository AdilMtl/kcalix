// DEPLOY: supabase functions deploy ai-chat --no-verify-jwt
// (--no-verify-jwt obrigatório — validação de JWT feita manualmente no código)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ─── Modelo do chat (Coach) ───────────────────────────────────────────────────
// ROLLBACK: trocar para 'gpt-4o-mini' e, na chamada, voltar max_completion_tokens
// → max_tokens e remover reasoning_effort. parse-food e analyze-photo NÃO usam
// esta constante (seguem em gpt-4o-mini, intocados).
const CHAT_MODEL = 'gpt-5-mini'

// ─── Mapa estático exercicioId → { nome, grupo } ──────────────────────────────
// Cópia inline do EXERCISE_DB (frontend não disponível no Deno runtime)
// Necessário para resolver nome/grupo dos exercícios salvos no JSONB do banco
// (WorkoutExercise só persiste exercicioId + series — sem nome/grupo)

const EX_MAP: Record<string, { nome: string; grupo: string }> = {
  // Peito
  supino_reto:           { nome: "Supino reto (barra)",          grupo: "Peito" },
  supino_inclinado:      { nome: "Supino inclinado (barra)",      grupo: "Peito" },
  supino_halter:         { nome: "Supino reto (halter)",          grupo: "Peito" },
  supino_incl_halter:    { nome: "Supino inclinado (halter)",     grupo: "Peito" },
  crucifixo:             { nome: "Crucifixo (halter)",            grupo: "Peito" },
  crossover:             { nome: "Crossover (cabo)",              grupo: "Peito" },
  peck_deck:             { nome: "Peck deck (voador)",            grupo: "Peito" },
  supino_maquina:        { nome: "Supino máquina",                grupo: "Peito" },
  flexao:                { nome: "Flexão de braço",               grupo: "Peito" },
  // Costas
  puxada_frontal:        { nome: "Puxada frontal",                grupo: "Costas" },
  puxada_triang:         { nome: "Puxada triângulo",              grupo: "Costas" },
  remada_curvada:        { nome: "Remada curvada (barra)",        grupo: "Costas" },
  remada_halter:         { nome: "Remada unilateral (halter)",    grupo: "Costas" },
  remada_cavalinho:      { nome: "Remada cavalinho",              grupo: "Costas" },
  remada_baixa:          { nome: "Remada baixa (cabo)",           grupo: "Costas" },
  pulldown:              { nome: "Pulldown (corda)",              grupo: "Costas" },
  barra_fixa:            { nome: "Barra fixa",                    grupo: "Costas" },
  remada_maquina:        { nome: "Remada máquina",                grupo: "Costas" },
  // Quad
  agachamento_livre:     { nome: "Agachamento livre (barra)",     grupo: "Quad" },
  agachamento_smith:     { nome: "Agachamento Smith",             grupo: "Quad" },
  leg_press:             { nome: "Leg press 45°",                 grupo: "Quad" },
  leg_press_horiz:       { nome: "Leg press horizontal",          grupo: "Quad" },
  cadeira_extensora:     { nome: "Cadeira extensora",             grupo: "Quad" },
  hack_squat:            { nome: "Hack squat",                    grupo: "Quad" },
  passada:               { nome: "Passada / Avanço",              grupo: "Quad" },
  bulgaro:               { nome: "Agachamento búlgaro",           grupo: "Quad" },
  abdutora:              { nome: "Cadeira abdutora",              grupo: "Quad" },
  adutora:               { nome: "Cadeira adutora",               grupo: "Quad" },
  panturrilha_pe:        { nome: "Panturrilha em pé",             grupo: "Quad" },
  panturrilha_sentado:   { nome: "Panturrilha sentado",           grupo: "Quad" },
  // Posterior
  cadeira_flexora:       { nome: "Cadeira flexora",               grupo: "Posterior de coxa" },
  mesa_flexora:          { nome: "Mesa flexora",                  grupo: "Posterior de coxa" },
  stiff:                 { nome: "Stiff (barra/halter)",          grupo: "Posterior de coxa" },
  // Glúteos
  hip_thrust_barra:      { nome: "Hip thrust (barra)",            grupo: "Glúteos" },
  hip_thrust_maquina:    { nome: "Hip thrust máquina",            grupo: "Glúteos" },
  gluteo_maquina:        { nome: "Máquina de glúteos (kickback)", grupo: "Glúteos" },
  gluteo_cabo:           { nome: "Glúteo no cabo (kickback)",     grupo: "Glúteos" },
  elevacao_pelvica:      { nome: "Elevação pélvica",              grupo: "Glúteos" },
  stiff_romeno:          { nome: "Stiff romeno / RDL",            grupo: "Glúteos" },
  agachamento_sumo:      { nome: "Agachamento sumô",              grupo: "Glúteos" },
  // Ombros
  desenv_halter:         { nome: "Desenvolvimento (halter)",      grupo: "Ombros" },
  desenv_barra:          { nome: "Desenvolvimento (barra)",       grupo: "Ombros" },
  desenv_maquina:        { nome: "Desenvolvimento máquina",       grupo: "Ombros" },
  elevacao_lateral:      { nome: "Elevação lateral (halter)",     grupo: "Ombros" },
  elevacao_lateral_cabo: { nome: "Elevação lateral (cabo)",       grupo: "Ombros" },
  elevacao_frontal:      { nome: "Elevação frontal",              grupo: "Ombros" },
  face_pull:             { nome: "Face pull (corda)",             grupo: "Ombros" },
  encolhimento:          { nome: "Encolhimento (trapézio)",       grupo: "Ombros" },
  crucifixo_inverso:     { nome: "Crucifixo inverso",             grupo: "Ombros" },
  // Bíceps
  rosca_direta:          { nome: "Rosca direta (barra)",          grupo: "Bíceps" },
  rosca_halter:          { nome: "Rosca alternada (halter)",      grupo: "Bíceps" },
  rosca_martelo:         { nome: "Rosca martelo",                 grupo: "Bíceps" },
  rosca_scott:           { nome: "Rosca Scott",                   grupo: "Bíceps" },
  rosca_concentrada:     { nome: "Rosca concentrada",             grupo: "Bíceps" },
  rosca_cabo:            { nome: "Rosca no cabo",                 grupo: "Bíceps" },
  rosca_w:               { nome: "Rosca barra W",                 grupo: "Bíceps" },
  // Tríceps
  triceps_pulley:        { nome: "Tríceps pulley (corda)",        grupo: "Tríceps" },
  triceps_barra_v:       { nome: "Tríceps pulley (barra V)",      grupo: "Tríceps" },
  triceps_testa:         { nome: "Tríceps testa",                 grupo: "Tríceps" },
  triceps_frances:       { nome: "Tríceps francês (halter)",      grupo: "Tríceps" },
  triceps_banco:         { nome: "Tríceps banco (mergulho)",      grupo: "Tríceps" },
  triceps_coice:         { nome: "Tríceps coice",                 grupo: "Tríceps" },
  paralelas:             { nome: "Paralelas",                     grupo: "Tríceps" },
  // Core
  abdominal_crunch:      { nome: "Abdominal crunch",              grupo: "Core" },
  abdominal_infra:       { nome: "Abdominal infra",               grupo: "Core" },
  prancha:               { nome: "Prancha (isometria)",           grupo: "Core" },
  prancha_lateral:       { nome: "Prancha lateral",               grupo: "Core" },
  abdominal_maquina:     { nome: "Abdominal máquina",             grupo: "Core" },
  rotacao_russa:         { nome: "Rotação russa",                 grupo: "Core" },
  roda_abdominal:        { nome: "Roda abdominal",                grupo: "Core" },
}

// ─── System prompt modular ────────────────────────────────────────────────────

const SYSTEM_PROMPT_BASE = `Você é o Kcal Coach — o coach pessoal do usuário dentro do app Kcalix.
Você combina três especialidades em uma só voz:
- Nutricionista esportivo: aderência e distribuição de macros, ajuste da dieta ao objetivo.
- Treinador de força (protocolos Renaissance Periodization / Lucas Campos): volume por grupo muscular (MEV/MAV/MRV), progressão de carga, fadiga e deload.
- Coach comportamental: consistência acima de perfeição; orienta sem julgar.

O usuário abre o chat esperando um coach de verdade: que olha os dados antes de opinar, responde exatamente o que foi perguntado e recomenda com convicção. Responda sempre em português brasileiro.

## PRINCÍPIOS
1. DADOS ANTES DE OPINIÃO. Toda afirmação relevante cita número e data reais (ex.: "ontem (18/07) você fechou com 132g de proteína, 43g abaixo da meta"). Nunca invente valor que não está no bloco DADOS DO USUÁRIO. Se o dado necessário não existe, diga qual falta e como registrá-lo no app.
2. CONECTE OS DOMÍNIOS. Nutrição, treino e corpo são um sistema só: pergunta de treino → considere energia e proteína recentes; pergunta de dieta → considere se hoje tem treino; peso estagnado → cheque aderência calórica E volume de treino antes de sugerir mudança.
3. RESPONDA A PERGUNTA FEITA. Primeiro a resposta direta, depois o porquê. Não despeje análise que não foi pedida.
4. UMA DIREÇÃO CLARA. Feche com no máximo 1–2 ações concretas e específicas ("adiciona 40g de whey na ceia de hoje", não "tenta comer mais proteína"). Se os dados forem ambíguos para decidir, faça no máximo 1 pergunta de afunilamento — específica, nunca genérica.
5. HONESTIDADE SEM DRAMA. Sem elogio vazio, sem bronca. Aponte o problema com número, proponha o ajuste, siga em frente. Comemore progresso real (PR, semana de aderência) citando o dado que o comprova.
6. PROFUNDIDADE PROPORCIONAL. Pergunta objetiva = resposta curta e certeira (2–6 linhas: resposta direta + 1–2 dados que a sustentam + ação); o usuário pede aprofundamento se quiser. Pergunta aberta = análise média. Diagnóstico completo só quando pedido. Nunca corte análise importante por brevidade; nunca infle resposta simples.
7. LIMITES. Você não diagnostica lesão nem condição de saúde — dor persistente ou sintoma clínico → recomende avaliação profissional e ajuste o plano em volta.

## FORMATO
- Texto livre. NUNCA envolva a resposta em JSON (única exceção: MODO LOG abaixo).
- Permitido: **negrito** em números-chave e conclusões; listas com "- "; parágrafos curtos separados por linha em branco.
- Emoji com propósito: status (✅ progresso/na meta, ⚠️ atenção) e ilustrar um ponto-chave quando facilitar a leitura. Nunca como decoração ou separador de parágrafo; no máximo ~1 por bloco de ideia.
- Proibido: títulos com #, tabelas, blocos de código, links.

## MODO LOG — detectar intenção de registrar refeição

Se o usuário está RELATANDO o que comeu/bebeu (ex: "comi frango com arroz", "almocei X", "jantei Y", "tomei whey"), responda com este JSON exato (sem markdown, sem texto antes ou depois):
{"action":"parse-food","reply":"Ok, vou registrar isso para você!"}

NÃO use MODO LOG para perguntas sobre o diário (ex: "o que comi hoje?", "como foram meus macros?", "quanto comi de proteína?").
NÃO use MODO LOG se a mensagem contém "?" ou verbos como "posso", "devo", "consigo", "o que", "quanto".
Para TODO o resto (perguntas, análises, conselhos): responda em texto livre normal, NUNCA em JSON.

## DIAGNÓSTICO COMPLETO (só quando pedir análise geral: "analise", "como estou", "resumo", "visão geral", "relatório", "tudo")

**Visão geral:** 2–3 bullets com os achados mais importantes — valores e datas.
**Nutrição:** aderência da semana, refeição mais fraca, proteína g/kg.
**Treino:** volume vs landmarks por grupo, progressões e platôs.
**Corpo:** tendência de peso vs objetivo.
**Plano da semana:** até 3 ações, em ordem de impacto.
**Pergunta:** UMA pergunta de contexto que os dados não respondem.

## EXEMPLOS DE RESPOSTA (âncora de tom e formato — copie o jeito, não o conteúdo)
Pergunta: "Preciso de descanso hoje?"
Resposta:
**Não — treina hoje.** Você descansou ontem e anteontem, e só acumulou 9 séries de peito na semana (MEV é 10).

Sugestão: peito + tríceps hoje. Sua proteína ontem ficou em 132g — capricha no pós-treino.

Pergunta: "O que devo jantar hoje?"
Resposta:
Faltam **83g de proteína** e ~1000kcal pra fechar o dia. Você treinou hoje, então prioriza proteína + carbo:

- 200g de frango grelhado (62g P) + 150g de arroz + salada
- ou 150g de patinho + 200g de batata

Qualquer uma fecha a proteína com folga pra ceia com whey. ✅`

// Sempre incluído no system prompt do chat
const KNOWLEDGE_WORKOUT = `

## CONHECIMENTO — TREINO
Landmarks (séries válidas/semana, MEV/MAV/MRV):
Peito 10/15/22 | Costas 10/15/22 | Quad 8/14/22 | Post.coxa 6/12/20 | Glúteos 15/20/23 | Ombros 6/12/20 | Bíceps 6/12/20 | Tríceps 6/12/20 | Core 4/10/16
(série válida = reps>0 ou "falha"; primária conta 1,0; secundária 0,5)
- Abaixo do MEV: crescimento improvável → priorizar esse grupo.
- Entre MEV e MAV: zona produtiva sustentável. Entre MAV e MRV: alto estímulo e alta fadiga — ok por 2–4 semanas.
- Acima do MRV: recuperação comprometida → reduzir volume.
Progressão: iniciante progride quase toda sessão; intermediário a cada 1–2 sem; avançado a cada 2–3 sem.
Platô = 3+ sessões sem aumento de carga ou reps → mudar o estímulo: +1 rep alvo, +2,5kg, ou variação do exercício.
Deload: só com sinais recorrentes (2+ semanas de queda de desempenho, dores, sono ruim) — nunca por 1 semana isolada de volume baixo.
Use o bloco "Progressão por exercício" (pré-computado) como fonte — não recalcule a partir do histórico bruto.`

// Sempre incluído no system prompt do chat
const KNOWLEDGE_NUTRITION = `

## CONHECIMENTO — NUTRIÇÃO
Metas por objetivo — CUT: déficit 300–500kcal, perda 0,5–1%/sem, proteína 2,0–2,4g/kg | BULK: surplus 200–350kcal, proteína 1,8–2,2g/kg | RECOMP: manutenção ±150kcal, proteína 2,2–2,5g/kg, peso estável é esperado | MANUTENÇÃO: estabilidade de peso + progressão de treino.
Prática:
- Proteína: distribuir em 3–5 refeições de ≥0,4g/kg cada (~25–45g); refeição pós-treino é prioritária. O total do dia importa mais que o horário perfeito.
- Carbo: concentrar ao redor do treino. Em dia sem treino, se precisar cortar, corte carbo/gordura — nunca proteína.
- Aderência semanal > perfeição diária: avalie a média de 7 dias antes de reagir a 1 dia ruim. Dia estourado se compensa com −100 a −200kcal nos 2–3 dias seguintes, nunca com jejum punitivo.
- Água: compare consumo vs meta; déficit crônico distorce fome e desempenho.`

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Message {
  role: 'user' | 'assistant'
  content: string
}

// ─── Tipos parse-food ─────────────────────────────────────────────────────────

interface ParseFoodRequest {
  action: 'parse-food'
  text: string
  foodIndex: string
}

interface ParsedFoodItem {
  foodId: string | null
  nome: string
  grams: number
  source: 'db' | 'custom'
  p?: number
  c?: number
  g?: number
  kcal?: number
}

interface ParseFoodResponse {
  meal: 'cafe' | 'lanche1' | 'almoco' | 'lanche2' | 'jantar' | 'ceia' | null
  items: ParsedFoodItem[]
}

// ─── Handler parse-food (isolado — zero queries ao Supabase) ──────────────────

async function parseFoodHandler(body: ParseFoodRequest): Promise<Response> {
  const openaiKey = Deno.env.get('OPENAI_API_KEY')
  if (!openaiKey) {
    return new Response(
      JSON.stringify({ error: 'Configuração incompleta' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }

  const systemPrompt = `Você é um parser de alimentos com conhecimento nutricional baseado na Tabela TACO e IBGE. Analise o texto do usuário e retorne APENAS JSON válido, sem markdown, sem explicação.

Índice de alimentos disponíveis (formato: "id(nome/Xg)"):
${body.foodIndex}

Retorne exatamente neste formato:
{"meal":"cafe"|"lanche1"|"almoco"|"lanche2"|"jantar"|"ceia"|null,"items":[{"foodId":"id_ou_null","nome":"nome legível","grams":100,"source":"db"|"custom","p":25.0,"c":0.0,"g":3.0,"kcal":130}]}

Regras:
- meal: inferir do texto ("almocei"→almoco, "café da manhã"→cafe, "lanchei"→lanche1, "jantei"→jantar, "ceia"→ceia). null se não for possível inferir.
- source "db": APENAS se o alimento do índice for o MESMO alimento mencionado (mesmo que com nome levemente diferente, ex: "frango" → frango_grelhado). NÃO usar "db" para alimentos parecidos mas diferentes (ex: "couve" ≠ "couve-flor", "batata doce" ≠ "batata"). Em caso de dúvida, usar "custom".
- source "custom": alimento não existe no índice OU é diferente dos disponíveis → foodId=null, OBRIGATÓRIO estimar p/c/g/kcal por 100g com base em conhecimento nutricional real (TACO/IBGE). NUNCA retornar zeros para custom.
- alimentos compostos (ex: "farofa de calabresa", "omelete de queijo"): retornar como UM único item custom com macros estimados do prato completo, não separar em ingredientes.
- grams: gramas mencionadas. Se não mencionado, usar porção típica (frango→150, arroz→150, feijão→100, ovo→60, banana→100, pão→50, leite→200, whey→30, batata→150, macarrão→80, farofa→80)
- Retornar SOMENTE o JSON. Nenhum texto antes ou depois.

Referências TACO para estimativas custom (por 100g):
frango grelhado: p=31 c=0 g=3 kcal=159 | carne bovina: p=26 c=0 g=5 kcal=152
peixe (tilápia): p=26 c=0 g=3 kcal=129 | atum (lata): p=28 c=0 g=1 kcal=119
ovo inteiro: p=13 c=1 g=9 kcal=143 | clara de ovo: p=11 c=1 g=0 kcal=48
arroz branco cozido: p=2 c=28 g=0 kcal=128 | feijão cozido: p=5 c=14 g=0 kcal=77
batata cozida: p=2 c=18 g=0 kcal=82 | macarrão cozido: p=4 c=23 g=1 kcal=117
pão francês: p=8 c=58 g=2 kcal=289 | aveia: p=13 c=67 g=7 kcal=394
banana: p=1 c=23 g=0 kcal=92 | maçã: p=0 c=15 g=0 kcal=56 | laranja: p=1 c=12 g=0 kcal=47
leite integral: p=3 c=5 g=3 kcal=61 | iogurte natural: p=5 c=6 g=3 kcal=66
queijo mussarela: p=22 c=1 g=17 kcal=244 | requeijão: p=9 c=3 g=22 kcal=244
whey protein: p=80 c=8 g=4 kcal=392 | azeite: p=0 c=0 g=100 kcal=884
salada folhas: p=2 c=3 g=0 kcal=20 | tomate: p=1 c=4 g=0 kcal=18`

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 400,
      temperature: 0,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: body.text },
      ],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    return new Response(
      JSON.stringify({ error: `OpenAI error: ${err}` }),
      { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }

  const data = await res.json()
  const raw = data.choices?.[0]?.message?.content ?? ''

  // Modelo pode envolver JSON em ```json ... ``` — limpar
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim()

  let parsed: ParseFoodResponse
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    return new Response(
      JSON.stringify({ error: 'IA retornou JSON inválido', raw }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }

  return new Response(
    JSON.stringify(parsed),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  )
}

// ─── Tipos analyze-photo ──────────────────────────────────────────────────────

interface AnalyzePhotoRequest {
  action: 'analyze-photo'
  image: string      // base64 sem prefixo data:
  mimeType: string   // 'image/jpeg'
}

interface PhotoAltItem {
  nome: string
  pPer100: number
  cPer100: number
  gPer100: number
  kcalPer100: number
}

interface PhotoFoodItem {
  foodId: null
  nome: string
  grams: number
  source: 'photo'
  pPer100: number
  cPer100: number
  gPer100: number
  kcalPer100: number
  confidence: number        // 0–1
  alternatives: PhotoAltItem[]
}

interface AnalyzePhotoResponse {
  items: PhotoFoodItem[]
  message?: string
}

// ─── Handler analyze-photo (isolado — zero queries ao Supabase) ───────────────

async function analyzePhotoHandler(body: AnalyzePhotoRequest): Promise<Response> {
  const openaiKey = Deno.env.get('OPENAI_API_KEY')
  if (!openaiKey) {
    return new Response(
      JSON.stringify({ error: 'Configuração incompleta' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }

  const systemPrompt = `Você é um nutricionista especializado em identificar alimentos em fotos e estimar macronutrientes com base na Tabela TACO e IBGE.

Analise a imagem e retorne APENAS JSON válido, sem markdown, sem explicação.

Formato obrigatório:
{"items":[{"nome":"nome legível","grams":150,"pPer100":2.5,"cPer100":28.1,"gPer100":0.2,"kcalPer100":128,"confidence":0.92,"alternatives":[{"nome":"alternativa","pPer100":2.5,"cPer100":28.1,"gPer100":0.2,"kcalPer100":128}]}],"message":null}

Regras:
- Identifique TODOS os alimentos visíveis na foto
- grams: estimativa visual da porção em gramas
- confidence: 0.0–1.0 — sua certeza sobre a identificação (ex: arroz claro e solto = 0.95; algo coberto por molho = 0.45)
- alternatives: top-3 alternativas plausíveis APENAS quando confidence < 0.70, senão array vazio []
- pPer100/cPer100/gPer100/kcalPer100: macros por 100g (não pela porção)
- Se não houver alimentos visíveis: {"items":[],"message":"Não identifiquei alimentos na foto. Tente uma foto mais próxima ou com melhor iluminação."}
- Retornar SOMENTE o JSON. Nenhum texto antes ou depois.

Referências TACO (por 100g):
arroz branco cozido: p=2 c=28 g=0 kcal=128 | feijão cozido: p=5 c=14 g=0 kcal=77
frango grelhado: p=31 c=0 g=3 kcal=159 | carne bovina: p=26 c=0 g=5 kcal=152
batata cozida: p=2 c=18 g=0 kcal=82 | macarrão cozido: p=4 c=23 g=1 kcal=117
ovo inteiro: p=13 c=1 g=9 kcal=143 | pão francês: p=8 c=58 g=2 kcal=289
salada folhas: p=2 c=3 g=0 kcal=20 | tomate: p=1 c=4 g=0 kcal=18
banana: p=1 c=23 g=0 kcal=92 | maçã: p=0 c=15 g=0 kcal=56
leite integral: p=3 c=5 g=3 kcal=61 | queijo mussarela: p=22 c=1 g=17 kcal=244
azeite: p=0 c=0 g=100 kcal=884 | manteiga: p=1 c=0 g=83 kcal=752`

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 600,
      temperature: 0,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:${body.mimeType};base64,${body.image}`,
                detail: 'low',   // menor custo — suficiente para identificar alimentos
              },
            },
            {
              type: 'text',
              text: 'Identifique todos os alimentos visíveis nesta foto e retorne o JSON conforme instruído.',
            },
          ],
        },
      ],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    return new Response(
      JSON.stringify({ error: `OpenAI error: ${err}` }),
      { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }

  const data = await res.json()
  const raw = data.choices?.[0]?.message?.content ?? ''

  // Modelo pode envolver JSON em ```json ... ``` — limpar (mesmo padrão do parse-food)
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim()

  let parsed: AnalyzePhotoResponse
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    return new Response(
      JSON.stringify({ items: [], message: 'Não consegui analisar a foto. Tente descrever por texto.' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }

  // Garantir que items sempre seja array
  if (!Array.isArray(parsed.items)) parsed.items = []

  return new Response(
    JSON.stringify(parsed),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  )
}

// ─── Tipos chat ───────────────────────────────────────────────────────────────

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
  waterMl?: number
}

interface DiaryRow {
  date: string
  data: DiaryData
}

interface SetData {
  reps: string       // string — pode ser "10", "falha", "10-12"
  carga: string      // string — pode ser "corpo", "60"
  warmup?: boolean   // série de aquecimento — não conta para volume
}

interface ExerciseData {
  exercicioId: string
  series: SetData[]
}

interface CardioData {
  tipo?: string
  minutos?: number
  kcalPerMin?: number
}

interface WorkoutData {
  exercicios?: ExerciseData[]
  cardio?: CardioData[]
  nota?: string
  durationMin?: number
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
  waterGoalMl?: number
}

// ─── PASSO 1: Detectar pedido de diagnóstico completo ─────────────────────────
// v2: o Coach SEMPRE recebe diário + treino + corpo (o gating por regex causava
// respostas rasas quando classificava o domínio errado). A única distinção que
// resta é se o usuário pediu uma análise geral (formato + teto de tokens maior).

function isFullDiag(messages: Message[]): boolean {
  const lastMsg = (messages.filter(m => m.role === 'user').at(-1)?.content ?? '').toLowerCase()
  return /analise|analisa|análise|como estou|resumo|visão geral|visao geral|panorama|tudo|relatório|relatorio|diagnóstico|diagnostico|visão completa|visao completa/.test(lastMsg)
}

// Resolve a data "de hoje" na perspectiva do usuário.
// Prioridade: clientDate enviado pelo app (Fase A); senão, fuso America/Sao_Paulo.
// Corrige o bug em que o servidor (UTC) virava o dia à meia-noite BRT-3.
function resolveToday(clientDate?: string): string {
  if (clientDate && /^\d{4}-\d{2}-\d{2}$/.test(clientDate)) return clientDate
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date())
}

// dd/mm a partir de 'YYYY-MM-DD'
function ddmm(iso: string): string {
  return `${iso.slice(8, 10)}/${iso.slice(5, 7)}`
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

// Linhas de refeição de um dia (usado no bloco HOJE e no histórico)
function mealLinesFor(d: DiaryData): string[] {
  const meals = d.meals ?? {}
  const out: string[] = []
  for (const [key, label] of Object.entries(MEAL_LABELS)) {
    const entries = (meals as Record<string, FoodEntry[]>)[key] ?? []
    if (!entries.length) continue
    let rP = 0, rC = 0, rG = 0, rKcal = 0
    const foodNames: string[] = []
    for (const e of entries) {
      rP += e.p ?? 0; rC += e.c ?? 0; rG += e.g ?? 0; rKcal += e.kcal ?? 0
      foodNames.push(`${e.nome} ${e.porcaoG ?? Math.round((e.qty ?? 1) * 100)}g`)
    }
    out.push(`  ${label}: P=${Math.round(rP)}g C=${Math.round(rC)}g G=${Math.round(rG)}g kcal=${Math.round(rKcal)} [${foodNames.join(', ')}]`)
  }
  return out
}

// Proteína somada por refeição (para achar a refeição mais fraca)
function proteinByMeal(d: DiaryData): Record<string, number> {
  const meals = d.meals ?? {}
  const out: Record<string, number> = {}
  for (const key of Object.keys(MEAL_LABELS)) {
    const entries = (meals as Record<string, FoodEntry[]>)[key] ?? []
    out[key] = entries.reduce((a, e) => a + (e.p ?? 0), 0)
  }
  return out
}

function formatDiary(rows: DiaryRow[], settings: SettingsData | null, todayISO: string): string {
  const meta = settings
    ? { p: settings.metaP ?? 0, c: settings.metaC ?? 0, g: settings.metaG ?? 0, kcal: settings.metaKcal ?? 0 }
    : null

  const sorted = [...rows].sort((a, b) => a.date.localeCompare(b.date))
  const todayRow = sorted.find(r => r.date === todayISO) ?? null
  const history = sorted.filter(r => r.date < todayISO)   // dias anteriores a hoje

  if (!todayRow && !history.length) return 'Diário: sem registros nos últimos 8 dias.'

  const out: string[] = []

  // ── HOJE (parcial) ──────────────────────────────────────────────
  out.push(`### HOJE (${todayISO}) — parcial`)
  if (todayRow) {
    const t = todayRow.data.totals ?? { p: 0, c: 0, g: 0, kcal: 0 }
    out.push(`Consumido: ${Math.round(t.kcal)}kcal | P${Math.round(t.p)}g C${Math.round(t.c)}g G${Math.round(t.g)}g`)
    const extra: string[] = [todayRow.data.kcalTreino ? `treino: ${todayRow.data.kcalTreino}kcal` : 'treino: não registrado']
    if (todayRow.data.waterMl != null) {
      extra.push(`água: ${todayRow.data.waterMl}ml${settings?.waterGoalMl ? `/${settings.waterGoalMl}` : ''}`)
    }
    out.push('  ' + extra.join(' | '))
    if (meta && meta.kcal > 0) {
      out.push(`Faltam p/ meta: ${Math.round(meta.kcal - t.kcal)}kcal | P${Math.round(meta.p - t.p)}g`)
    }
    out.push(...mealLinesFor(todayRow.data))
  } else {
    out.push('Nenhum registro ainda hoje.')
  }

  // ── Histórico (dias anteriores) ─────────────────────────────────
  if (history.length) {
    out.push('', '### DIÁRIO — dias anteriores')
    for (const row of history) {
      const d = row.data
      const t = d.totals ?? { p: 0, c: 0, g: 0, kcal: 0 }
      out.push(`${row.date} (${ddmm(row.date)}):`)
      out.push(...mealLinesFor(d))
      out.push(`  TOTAL: P=${Math.round(t.p)}g C=${Math.round(t.c)}g G=${Math.round(t.g)}g kcal=${Math.round(t.kcal)}`)
      if (meta && meta.kcal > 0) {
        const dk = Math.round(t.kcal - meta.kcal)
        const dp = Math.round(t.p - meta.p)
        out.push(`  DESVIO: kcal ${dk >= 0 ? '+' : ''}${dk} | P ${dp >= 0 ? '+' : ''}${dp}g`)
      }
      if (d.kcalTreino) out.push(`  kcal treino: ${d.kcalTreino}`)
      if (d.waterMl != null) out.push(`  água: ${d.waterMl}ml`)
    }

    // Médias do período + refeição mais fraca em proteína (pré-computado)
    const n = history.length
    const avgKcal = Math.round(history.reduce((a, r) => a + (r.data.totals?.kcal ?? 0), 0) / n)
    const avgP = Math.round(history.reduce((a, r) => a + (r.data.totals?.p ?? 0), 0) / n)
    const pctKcal = meta && meta.kcal > 0 ? ` (${Math.round(avgKcal / meta.kcal * 100)}% da meta)` : ''
    const pctP = meta && meta.p > 0 ? ` (${Math.round(avgP / meta.p * 100)}%)` : ''
    const diasNaMetaP = meta && meta.p > 0
      ? history.filter(r => (r.data.totals?.p ?? 0) >= meta.p * 0.9).length
      : null
    out.push('', `Médias ${n}d: ${avgKcal}kcal${pctKcal} | P${avgP}g${pctP}`
      + (diasNaMetaP != null ? ` | dias na meta de P (≥90%): ${diasNaMetaP}/${n}` : ''))

    const sums: Record<string, number> = {}
    const counts: Record<string, number> = {}
    for (const r of history) {
      for (const [k, v] of Object.entries(proteinByMeal(r.data))) {
        if (v > 0) { sums[k] = (sums[k] ?? 0) + v; counts[k] = (counts[k] ?? 0) + 1 }
      }
    }
    const meanByMeal = Object.keys(counts).map(k => ({ k, mean: sums[k] / counts[k] }))
    if (meanByMeal.length) {
      const weakest = meanByMeal.sort((a, b) => a.mean - b.mean)[0]
      out.push(`Refeição mais fraca em proteína: ${MEAL_LABELS[weakest.k]} (média ${Math.round(weakest.mean)}g)`)
    }
  }

  if (meta && meta.kcal > 0) {
    out.push('', `Meta diária: P=${meta.p}g C=${meta.c}g G=${meta.g}g kcal=${meta.kcal}`)
  }
  if (settings?.waterGoalMl) out.push(`Meta de água: ${settings.waterGoalMl}ml/dia`)

  return out.join('\n')
}

// ─── PASSO 3b: Formatar treinos ───────────────────────────────────────────────

// Índice da semana a partir de hoje: 0 = últimos 7 dias, 1 = 7–13 dias atrás, etc.
function weekIndex(dateISO: string, todayISO: string): number {
  const d = new Date(dateISO + 'T12:00:00Z').getTime()
  const t = new Date(todayISO + 'T12:00:00Z').getTime()
  return Math.floor(Math.floor((t - d) / 86400000) / 7)
}

// Melhor série numérica de um exercício na sessão (maior carga; desempate por reps).
// Ignora séries de aquecimento e cargas não numéricas ("corpo").
function bestSetOfSession(ex: ExerciseData): { carga: number; reps: number } | null {
  let best: { carga: number; reps: number; score: number } | null = null
  for (const s of ex.series ?? []) {
    if (s.warmup) continue
    const carga = parseFloat((s.carga ?? '').toString().replace(',', '.'))
    if (!isFinite(carga) || carga <= 0) continue
    const repsNum = parseFloat((s.reps ?? '').toString())
    const reps = isFinite(repsNum) ? repsNum : 0
    const score = carga * 1000 + reps
    if (!best || score > best.score) best = { carga, reps, score }
  }
  return best ? { carga: best.carga, reps: best.reps } : null
}

function formatWorkouts(
  rows: WorkoutRow[],
  exMap: Record<string, { nome: string; grupo: string }> = EX_MAP,
  todayISO: string = resolveToday(),
): string {
  if (!rows.length) return 'Treinos: sem registros nos últimos 30 dias.'

  const MEV: Record<string, number> = { Peito: 10, Costas: 10, Quad: 8, 'Posterior de coxa': 6, 'Posterior de Coxa': 6, Glúteos: 15, Ombros: 6, Bíceps: 6, Tríceps: 6, Core: 4, Abdômen: 4 }
  const MAV: Record<string, number> = { Peito: 15, Costas: 15, Quad: 14, 'Posterior de coxa': 12, 'Posterior de Coxa': 12, Glúteos: 20, Ombros: 12, Bíceps: 12, Tríceps: 12, Core: 10, Abdômen: 10 }
  const MRV: Record<string, number> = { Peito: 22, Costas: 22, Quad: 22, 'Posterior de coxa': 20, 'Posterior de Coxa': 20, Glúteos: 23, Ombros: 20, Bíceps: 20, Tríceps: 20, Core: 16, Abdômen: 16 }

  const sorted = [...rows].sort((a, b) => a.date.localeCompare(b.date))

  const volume: Record<string, number[]> = {}   // grupo → [w0=atual, w1, w2, w3]
  const prog: Record<string, { date: string; carga: number; reps: number; score: number }[]> = {}
  const exNome: Record<string, string> = {}
  const sessionLines: string[] = []

  for (const row of sorted) {
    const exercicios = row.data?.exercicios ?? []
    const wIdx = weekIndex(row.date, todayISO)
    const exLines: string[] = []

    for (const ex of exercicios) {
      // reps é string — "falha" válido; warmup não conta
      const setsValidos = (ex.series ?? []).filter(s => {
        if (s.warmup) return false
        const r = (s.reps ?? '').toString().trim()
        return r === 'falha' || parseFloat(r) > 0
      })
      if (!setsValidos.length) continue

      const exInfo = exMap[ex.exercicioId]
      const nome = exInfo?.nome ?? 'Exercício personalizado'
      const grupo = exInfo?.grupo ?? 'Outros'
      exNome[ex.exercicioId] = nome

      const resumo = setsValidos.map(s => {
        const r = (s.reps ?? '?').toString().trim()
        const c = (s.carga ?? '?').toString().trim()
        return isFinite(parseFloat(c)) ? `${r}×${c}kg` : `${r}×${c}`
      }).join(', ')
      exLines.push(`  ${nome} (${grupo}): ${setsValidos.length}s — ${resumo}`)

      if (wIdx >= 0 && wIdx <= 3) {
        if (!volume[grupo]) volume[grupo] = [0, 0, 0, 0]
        volume[grupo][wIdx] += setsValidos.length
      }

      const best = bestSetOfSession(ex)
      if (best) {
        if (!prog[ex.exercicioId]) prog[ex.exercicioId] = []
        prog[ex.exercicioId].push({ date: row.date, carga: best.carga, reps: best.reps, score: best.carga * 1000 + best.reps })
      }
    }

    const cardios = (row.data?.cardio ?? []).filter(c => c.minutos)
    const nota = row.data?.nota?.trim()
    if (exLines.length || cardios.length || nota) {
      sessionLines.push(`${row.date} (${ddmm(row.date)}):`)
      sessionLines.push(...exLines)
      for (const c of cardios) sessionLines.push(`  cardio: ${c.tipo ?? 'cardio'} ${c.minutos}min`)
      if (nota) sessionLines.push(`  nota: "${nota}"`)
    }
  }

  const out: string[] = ['### TREINO — sessões (últimos 30 dias)']
  out.push(...sessionLines)

  // Volume semanal por grupo (4 semanas, antiga→atual)
  const grupos = Object.keys(volume)
  if (grupos.length) {
    out.push('', '### Volume semanal por grupo (4 semanas, antiga→atual; USE ESTES NÚMEROS — não recalcule)')
    for (const g of grupos.sort()) {
      const w = volume[g]                       // [w0=atual .. w3=antiga]
      const atual = w[0]
      const antigoParaNovo = `${w[3]}→${w[2]}→${w[1]}→${w[0]}`
      const mev = MEV[g], mav = MAV[g], mrv = MRV[g]
      let status = '✅ ok'
      if (mev && atual < mev) status = '⚠️ abaixo do MEV'
      else if (mrv && atual > mrv) status = '⚠️ acima do MRV'
      else if (mav && atual >= mav) status = '✅ zona alta (MAV+)'
      const landmarks = mev ? `MEV${mev} MAV${mav} MRV${mrv}` : 'sem landmark'
      out.push(`  ${g}: ${antigoParaNovo} (${landmarks}) ${status}`)
    }
  }

  // Progressão por exercício (pré-computado)
  const progExs = Object.keys(prog).filter(id => prog[id].length >= 2)
  if (progExs.length) {
    out.push('', '### Progressão por exercício (pré-computado — use estes números, não recalcule)')
    for (const id of progExs) {
      const sess = prog[id].sort((a, b) => a.date.localeCompare(b.date))
      const first = sess[0]
      const last = sess[sess.length - 1]
      const delta = Math.round((last.carga - first.carga) * 10) / 10
      let maxScore = -1, lastImp = 0
      sess.forEach((s, i) => { if (s.score > maxScore) { maxScore = s.score; lastImp = i } })
      const stalled = (sess.length - 1) - lastImp
      let suffix: string
      if (stalled >= 3) suffix = `⚠️ platô (${stalled} sessões sem progresso)`
      else if (delta > 0) suffix = `+${delta}kg ✅`
      else if (delta < 0) suffix = `${delta}kg`
      else suffix = 'sem mudança de carga'
      out.push(`  ${exNome[id]}: ${sess.length} sessões | ${first.carga}kg×${first.reps} (${ddmm(first.date)}) → ${last.carga}kg×${last.reps} (${ddmm(last.date)}) | ${suffix}`)
    }
  }

  return out.join('\n')
}

// ─── PASSO 3c: Formatar medidas e checkins ────────────────────────────────────

function formatBody(bodyRows: BodyRow[], checkinRows: CheckinRow[], settings: SettingsData | null = null): string {
  if (!bodyRows.length && !checkinRows.length) return 'Corpo: sem medidas ou check-ins registrados.'

  const lines: string[] = ['### CORPO — medidas e check-ins']

  for (const row of bodyRows) {
    const d = row.data ?? {}
    const parts: string[] = []
    if (d.peso) parts.push(`${d.peso}kg`)
    if (d.bf) parts.push(`BF=${d.bf}%`)
    if (d.cintura) parts.push(`cintura=${d.cintura}cm`)
    if (d.quadril) parts.push(`quadril=${d.quadril}cm`)
    if (d.braco) parts.push(`braço=${d.braco}cm`)
    if (d.perna) parts.push(`perna=${d.perna}cm`)
    if (parts.length) lines.push(`  ${row.date} (${ddmm(row.date)}): ${parts.join(' | ')}`)
  }

  for (const row of checkinRows) {
    const d = row.data ?? {}
    const parts: string[] = []
    if (d.peso) parts.push(`peso=${d.peso}kg`)
    if (d.bf) parts.push(`BF=${d.bf}%`)
    if (parts.length) lines.push(`  check-in ${row.date} (${ddmm(row.date)}): ${parts.join(' | ')}`)
  }

  // Tendência de peso + leitura contra o objetivo
  const allWeights: { date: string; peso: number }[] = [
    ...bodyRows.filter(r => r.data?.peso).map(r => ({ date: r.date, peso: r.data.peso! })),
    ...checkinRows.filter(r => r.data?.peso).map(r => ({ date: r.date, peso: r.data.peso! })),
  ].sort((a, b) => a.date.localeCompare(b.date))

  if (allWeights.length >= 2) {
    const first = allWeights[0]
    const last = allWeights[allWeights.length - 1]
    const diffDias = Math.max(1, (new Date(last.date + 'T12:00:00Z').getTime() - new Date(first.date + 'T12:00:00Z').getTime()) / 86400000)
    const diffKg = last.peso - first.peso
    const kgSemNum = diffKg / diffDias * 7
    lines.push(`  Tendência: ${diffKg >= 0 ? '+' : ''}${diffKg.toFixed(1)}kg em ${Math.round(diffDias)} dias (${kgSemNum >= 0 ? '+' : ''}${kgSemNum.toFixed(2)}kg/sem)`)

    const pctSem = last.peso > 0 ? (kgSemNum / last.peso) * 100 : 0
    const goal = (settings?.goal ?? '').toLowerCase()
    let verdict = ''
    if (goal === 'cut') {
      if (pctSem <= -1.2) verdict = '⚠️ perda rápida demais (risco de perder massa) — considere afrouxar o déficit'
      else if (pctSem <= -0.3) verdict = '✅ dentro do alvo de cut (0,5–1%/sem)'
      else verdict = '⚠️ estagnado para um cut — revise a aderência calórica'
    } else if (goal === 'bulk') {
      if (pctSem >= 0.7) verdict = '⚠️ ganho rápido (mais gordura) — considere reduzir o surplus'
      else if (pctSem >= 0.1) verdict = '✅ ganho controlado para bulk'
      else verdict = '⚠️ sem ganho — o surplus pode estar baixo'
    } else if (goal === 'recomp' || goal === 'maintain' || goal === 'manutenção') {
      verdict = Math.abs(pctSem) <= 0.3
        ? '✅ peso estável (esperado em recomp/manutenção)'
        : `${pctSem > 0 ? '↗' : '↘'} variação de ${pctSem >= 0 ? '+' : ''}${pctSem.toFixed(1)}%/sem`
    }
    if (verdict) lines.push(`  → ${verdict}`)
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

    // ── Mesclar exercícios customizados do usuário no EX_MAP ─────────────────────
    // Exercícios custom têm IDs UUID — não estão no EX_MAP estático
    // Query leve: poucos registros por usuário, só campos necessários
    const localExMap: Record<string, { nome: string; grupo: string }> = { ...EX_MAP }
    try {
      const { data: customExs } = await supabase
        .from('custom_exercises')
        .select('id, nome, grupo')
        .eq('user_id', user.id)
        .eq('arquivado', false)
      if (customExs) {
        for (const e of customExs) {
          localExMap[e.id] = { nome: e.nome, grupo: e.grupo ?? 'Outros' }
        }
      }
    } catch { /* falha silenciosa — continua com EX_MAP estático */ }

    const body = await req.json() as { action?: string; messages?: Message[]; text?: string; foodIndex?: string; image?: string; mimeType?: string; clientDate?: string }

    // ── BLOCO parse-food — isolado, sem tocar no fluxo de chat abaixo ──────────
    if (body.action === 'parse-food') {
      return await parseFoodHandler(body as ParseFoodRequest)
    }
    // ── FIM BLOCO parse-food ───────────────────────────────────────────────────

    // ── BLOCO analyze-photo — isolado, sem tocar no fluxo de chat abaixo ───────
    if (body.action === 'analyze-photo') {
      return await analyzePhotoHandler(body as unknown as AnalyzePhotoRequest)
    }
    // ── FIM BLOCO analyze-photo ──────────────────────────────────────────────

    const { messages, foodIndex } = body
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'messages inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // ── PASSO 1: Resolver "hoje" (perspectiva do usuário) + pedido de diagnóstico ──
    // clientDate (app) tem prioridade; senão fuso America/Sao_Paulo. Corrige o bug
    // do servidor UTC virar o dia à meia-noite BRT.
    const todayISO = resolveToday(body.clientDate)
    const fullDiag = isFullDiag(messages)

    // ── PASSO 2: Carregar SEMPRE diário + treino + corpo ───────────────────
    // v2: sem gating por regex (causava respostas rasas ao classificar o domínio
    // errado). Janelas ancoradas em todayISO, não no relógio UTC do servidor.
    const since8 = new Date(todayISO + 'T12:00:00Z')
    since8.setUTCDate(since8.getUTCDate() - 8)
    const since8ISO = since8.toISOString().split('T')[0]

    const since30 = new Date(todayISO + 'T12:00:00Z')
    since30.setUTCDate(since30.getUTCDate() - 30)
    const since30ISO = since30.toISOString().split('T')[0]

    const [settingsRes, diaryRes, workoutRes, bodyRes, checkinRes] = await Promise.all([
      supabase.from('user_settings').select('data').eq('user_id', user.id).single(),
      supabase.from('diary_entries').select('date, data').eq('user_id', user.id).gte('date', since8ISO).order('date', { ascending: true }),
      supabase.from('workouts').select('date, data').eq('user_id', user.id).gte('date', since30ISO).order('date', { ascending: true }),
      supabase.from('body_measurements').select('date, data').eq('user_id', user.id).order('date', { ascending: false }).limit(5),
      supabase.from('checkins').select('date, data').eq('user_id', user.id).order('date', { ascending: false }).limit(5),
    ]) as [
      { data: { data: SettingsData } | null },
      { data: DiaryRow[] | null },
      { data: WorkoutRow[] | null },
      { data: BodyRow[] | null },
      { data: CheckinRow[] | null },
    ]

    const settings: SettingsData | null = settingsRes.data?.data ?? null
    const diaryRows: DiaryRow[] = diaryRes.data ?? []
    const workoutRows: WorkoutRow[] = workoutRes.data ?? []
    const bodyRows: BodyRow[] = bodyRes.data ?? []
    const checkinRows: CheckinRow[] = checkinRes.data ?? []

    // ── PASSO 3: Pré-processar → texto compacto ────────────────────────────
    const diasPtBr = ['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado']
    const todayDow = diasPtBr[new Date(todayISO + 'T12:00:00Z').getUTCDay()]

    const contextParts: string[] = [`Hoje: ${todayISO} (${todayDow})`]

    if (settings) {
      const s = settings
      const parts: string[] = []
      if (s.goal) parts.push(`objetivo=${s.goal}`)
      if (s.peso) parts.push(`${s.peso}kg`)
      if (s.altura) parts.push(`${s.altura}cm`)
      if (s.tdee) parts.push(`TDEE ${s.tdee}kcal`)
      const metaParts: string[] = []
      if (s.metaKcal) metaParts.push(`${s.metaKcal}kcal`)
      if (s.metaP) {
        const gkg = s.peso && s.peso > 0 ? ` (${(s.metaP / s.peso).toFixed(1)}g/kg)` : ''
        metaParts.push(`P${s.metaP}g${gkg}`)
      }
      if (s.metaC) metaParts.push(`C${s.metaC}g`)
      if (s.metaG) metaParts.push(`G${s.metaG}g`)
      if (s.waterGoalMl) metaParts.push(`água ${s.waterGoalMl}ml`)
      if (metaParts.length) parts.push(`Metas/dia: ${metaParts.join(' ')}`)
      if (parts.length) contextParts.push(`Perfil: ${parts.join(' | ')}`)
    }

    contextParts.push(formatDiary(diaryRows, settings, todayISO))
    contextParts.push(formatWorkouts(workoutRows, localExMap, todayISO))
    contextParts.push(formatBody(bodyRows, checkinRows, settings))

    const contextBlock = `\n\n## DADOS DO USUÁRIO\n${contextParts.join('\n\n')}`

    // ── System prompt: base + conhecimento (sempre incluídos) ───────────────
    const systemPrompt = SYSTEM_PROMPT_BASE + KNOWLEDGE_WORKOUT + KNOWLEDGE_NUTRITION

    // gpt-5 usa max_completion_tokens (rejeita max_tokens). Teto maior no diagnóstico.
    const maxCompletionTokens = fullDiag ? 2000 : 1400

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
        model: CHAT_MODEL,
        max_completion_tokens: maxCompletionTokens,
        reasoning_effort: 'low',   // gpt-5: menor latência p/ chat. Se o modelo rejeitar, remover esta linha.
        messages: [
          { role: 'system', content: systemPrompt + contextBlock },
          ...messages.slice(-16),  // cap defensivo de contexto (Fase A também limita no cliente)
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
    const raw = openaiData.choices?.[0]?.message?.content ?? ''

    // ── 7B-4: IA decide a ação via JSON estruturado ──────────────────────────
    // Tentar parsear como JSON — modelo pode retornar { action, reply } ou texto livre
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim()
    let modelAction: { action: string; reply: string } | null = null
    try {
      const parsed = JSON.parse(cleaned)
      if (parsed.action === 'parse-food' || parsed.action === 'chat') {
        modelAction = parsed
      }
    } catch { /* não é JSON — resposta livre (fallback para chat) */ }

    if (modelAction?.action === 'parse-food' && foodIndex) {
      // IA detectou intenção de log → chamar parseFoodHandler com a última mensagem
      const lastUserMsg = messages.filter(m => m.role === 'user').at(-1)?.content ?? ''
      const parseFoodReq: ParseFoodRequest = { action: 'parse-food', text: lastUserMsg, foodIndex }
      const parseFoodRes = await parseFoodHandler(parseFoodReq)
      if (parseFoodRes.ok) {
        const parsed = await parseFoodRes.json()
        return new Response(
          JSON.stringify({ action: 'parse-food', ...parsed }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
      }
      // parseFoodHandler falhou → cai no chat com o reply de fallback
    }

    // Resposta de chat normal — usar reply do JSON ou o texto bruto
    const reply = modelAction?.reply ?? raw
    return new Response(
      JSON.stringify({ action: 'chat', reply }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )

  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
