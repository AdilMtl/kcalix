# Spec 7B-2 — Edge Function: bloco `action:'parse-food'`
**Criado:** 2026-03-23
**Sessão:** 7B-2
**Status:** 🔵 Pronto para implementar

---

## Objetivo

Adicionar um bloco isolado na Edge Function `ai-chat` que recebe texto livre do usuário e retorna JSON estruturado de alimentos. Substitui o `mockParseFood()` do frontend (7B-3 liga o cabo).

**O que muda:**
- `supabase/functions/ai-chat/index.ts` — único arquivo tocado
- Nenhum arquivo frontend alterado nesta sessão
- Chat existente (fluxo sem `action`) continua **intocado**

---

## Risco de produção

> ⚠️ Dev = Prod no Supabase Free. Qualquer deploy vai ao ar imediatamente.

### Estratégia de proteção

**Padrão obrigatório — guard no topo do handler, antes de tudo:**
```typescript
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') { ... }

  try {
    // Auth (igual ao atual) ────────────────────────────────────────────────────
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return new Response(JSON.stringify({ error: 'Não autorizado' }), { status: 401, ... })

    const supabase = createClient(...)
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return new Response(JSON.stringify({ error: 'Token inválido' }), { status: 401, ... })

    const body = await req.json()

    // ── NOVO BLOCO — completamente separado ──────────────────────────────────
    if (body.action === 'parse-food') {
      return await parseFoodHandler(body, user)
    }
    // ── FIM NOVO BLOCO ───────────────────────────────────────────────────────

    // Fluxo de chat existente — NÃO TOCAR ─────────────────────────────────────
    const { messages } = body as { messages: Message[] }
    // ... resto igual
```

**Por que é seguro:**
- O `if (body.action === 'parse-food')` só dispara quando o campo está presente
- Chamadas sem `action` (chat normal) passam direto para o fluxo existente — **comportamento idêntico ao atual**
- Auth JWT é feita **antes** do guard — nenhum acesso não autenticado chega ao bloco novo
- `parseFoodHandler` é uma função separada — não compartilha estado com o chat

### Verificação obrigatória pós-deploy (antes de ligar no app)

1. **Testar chat normal** — confirmar que não quebrou:
```bash
curl -X POST https://klvqyczfqxrbybgljnhe.supabase.co/functions/v1/ai-chat \
  -H "Authorization: Bearer <jwt>" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Como estão meus macros?"}]}'
# Esperado: { "reply": "..." } — igual ao comportamento anterior
```

2. **Testar parse-food novo:**
```bash
curl -X POST https://klvqyczfqxrbybgljnhe.supabase.co/functions/v1/ai-chat \
  -H "Authorization: Bearer <jwt>" \
  -H "Content-Type: application/json" \
  -d '{"action":"parse-food","text":"almocei 200g de frango com 150g de arroz","foodIndex":"<saída de getFoodIndex()>"}'
# Esperado: { "meal": "almoco", "items": [...] }
```

3. **Testar sem JWT** — confirmar 401:
```bash
curl -X POST https://klvqyczfqxrbybgljnhe.supabase.co/functions/v1/ai-chat \
  -H "Content-Type: application/json" \
  -d '{"action":"parse-food","text":"frango"}'
# Esperado: { "error": "Não autorizado" } — status 401
```

---

## O que `parseFoodHandler` faz

**Recebe:**
```typescript
interface ParseFoodRequest {
  action: 'parse-food'
  text: string        // texto livre do usuário
  foodIndex: string   // saída de getFoodIndex() — ~200 tokens
}
```

**Não faz:**
- ❌ Nenhuma query ao Supabase
- ❌ Nenhum acesso a dados do usuário
- ❌ Nenhuma interação com o contexto do chat

**Faz:**
- Chama `gpt-4o-mini` com um prompt minimalista (só parse, sem contexto)
- Retorna JSON estruturado

**Retorna:**
```typescript
interface ParseFoodResponse {
  meal: 'cafe' | 'lanche1' | 'almoco' | 'lanche2' | 'jantar' | 'ceia' | null
  items: ParsedFoodItem[]
}

interface ParsedFoodItem {
  foodId: string | null   // null quando source='custom'
  nome: string
  grams: number
  source: 'db' | 'custom'
  // Só quando source='custom' — macros por 100g estimados pela IA:
  p?: number
  c?: number
  g?: number
  kcal?: number
}
```

`meal: null` → dropdown obrigatório no `AiLogConfirmModal` (já implementado).

---

## Prompt do `parseFoodHandler`

**System:**
```
Você é um parser de alimentos. Analise o texto do usuário e retorne APENAS JSON válido, sem markdown, sem explicação.

Índice de alimentos disponíveis (formato: "id(nome/Xg)"):
{foodIndex}

Retorne:
{
  "meal": "cafe"|"lanche1"|"almoco"|"lanche2"|"jantar"|"ceia"|null,
  "items": [
    {
      "foodId": "id_do_banco_ou_null",
      "nome": "nome legível",
      "grams": 100,
      "source": "db"|"custom",
      "p": 0, "c": 0, "g": 0, "kcal": 0
    }
  ]
}

Regras:
- meal: inferir do texto ("almocei"→almoco, "café da manhã"→cafe, "lanchei"→lanche1, "jantei"→jantar). null se não for possível inferir.
- source "db": alimento existe no índice → usar foodId exato do índice, omitir p/c/g/kcal
- source "custom": alimento NÃO existe no índice → foodId=null, estimar macros por 100g
- grams: gramas mencionadas. Se não mencionado, usar porção típica (frango→150, arroz→150, feijão→100, ovo→60, banana→100)
- Retornar SOMENTE o JSON. Nenhum texto antes ou depois.
```

**User:** `{text}`

**Parâmetros OpenAI:**
- modelo: `gpt-4o-mini`
- `max_tokens: 400` (JSON pequeno, não precisa de mais)
- `temperature: 0` (parse determinístico — não é texto criativo)

---

## Custo estimado

- Input: ~300-400 tokens (prompt + índice ~200 tokens + texto do usuário)
- Output: ~100-150 tokens (JSON compacto)
- Total: ~500 tokens → **~$0.00007/chamada** (100x mais barato que o chat)

---

## Tratamento de erro no handler

O modelo pode retornar JSON malformado. Tratar explicitamente:

```typescript
async function parseFoodHandler(body: ParseFoodRequest): Promise<Response> {
  const openaiKey = Deno.env.get('OPENAI_API_KEY')
  if (!openaiKey) {
    return new Response(JSON.stringify({ error: 'Configuração incompleta' }), { status: 500, ... })
  }

  const prompt = `...` // system prompt com foodIndex interpolado

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 400,
      temperature: 0,
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: body.text },
      ],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    return new Response(JSON.stringify({ error: `OpenAI error: ${err}` }), { status: 502, ... })
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
      { status: 500, ... }
    )
  }

  return new Response(JSON.stringify(parsed), { status: 200, ... })
}
```

---

## Mudança no `req.json()` — atenção

Atualmente o handler faz:
```typescript
const { messages } = await req.json() as { messages: Message[] }
```

Com o novo bloco, precisa ler o body completo **antes** de fazer o guard:
```typescript
const body = await req.json() as { action?: string; messages?: Message[]; text?: string; foodIndex?: string }

if (body.action === 'parse-food') {
  return await parseFoodHandler(body as ParseFoodRequest)
}

// Fluxo de chat: extrair messages do body já lido
const { messages } = body
if (!messages || !Array.isArray(messages) || messages.length === 0) { ... }
```

---

## Deploy

```bash
supabase functions deploy ai-chat --no-verify-jwt
```

**Sequência segura:**
1. Implementar `parseFoodHandler` como função separada acima do `Deno.serve`
2. Adicionar guard `if (body.action === 'parse-food')` no início do handler (após auth)
3. Ajustar leitura do body (única mudança no fluxo existente)
4. `npm run build` — confirmar sem erros TypeScript (o frontend não mudou, mas validar)
5. Deploy
6. Executar os 3 curls de verificação acima
7. Só depois: 7B-3 (substituir mock no frontend)

---

## Critérios de feito

- [ ] Curl `action:'parse-food'` retorna JSON estruturado correto
- [ ] Curl chat normal (sem `action`) funciona **igual ao anterior**
- [ ] Curl sem JWT retorna 401
- [ ] JSON com modelo malformado retorna 500 com mensagem clara (não 200 com lixo)
- [ ] `temperature: 0` está setado (parse determinístico)
- [ ] Deploy: `supabase functions deploy ai-chat --no-verify-jwt`

---

## O que NÃO fazer

- ❌ Não refatorar o fluxo de chat existente — só adicionar o guard
- ❌ Não buscar dados do Supabase no `parseFoodHandler` — parse puro
- ❌ Não alterar nenhum arquivo em `src/` nesta sessão (isso é 7B-3)
- ❌ Não usar `streaming` — resposta completa em JSON
