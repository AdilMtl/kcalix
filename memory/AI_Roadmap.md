# Kcal Coach IA — Roadmap Técnico Completo
**Criado:** 2026-03-17
**Última atualização:** 2026-03-19

---

## Visão geral

Hoje o Kcal Coach existe como um Gem do Gemini: você exporta o JSON do app, abre o Gem, faz upload e conversa. Funciona, mas tem 3 passos manuais fora do app.

**Objetivo desta fase:** trazer o Kcal Coach para dentro do Kcalix. O usuário clica num botão e já está conversando — a IA já conhece os dados reais dele (macros, treinos, peso) sem exportar nada.

**Fases planejadas:**
| Fase | Nome | Status |
|---|---|---|
| 7A-1 | Edge Function ai-chat (backend) | ✅ Concluída (2026-03-18) |
| 7A-2 | UI do chat (frontend) | ✅ Concluída (2026-03-18) |
| 7A-3 | Otimização de tokens — pré-proc + roteamento + prompt modular | ✅ Concluída (2026-03-17) |
| 7B-1 | Log por linguagem natural — Frontend + mock (Edge Function intocada) | 🔵 Próximo |
| 7B-2 | Log por linguagem natural — Edge Function (action:parse-food isolado) | 🔵 Após 7B-1 |
| 7B-3 | Log por linguagem natural — Integração com DiarioPage | 🔵 Após 7B-2 |
| 7C | Foto para macros | 🔵 Após 7B |

---

## Arquitetura técnica

### Fluxo de uma mensagem

```
[App no navegador]
  JWT do usuário + { messages: [...] }
        ↓
[Edge Function ai-chat — servidor Supabase]
  1. Valida JWT
  2. Busca dados do usuário no Supabase
  3. Monta system prompt (AI_Assistant.md + dados reais)
  4. Chama API da OpenAI com a chave secreta
  5. Retorna { reply: string }
        ↓
[App no navegador]
  Exibe resposta no chat
```

### Por que Supabase Edge Function (e não Cloudflare, Vercel, etc.)
- Padrão já funcionando no projeto (`invite-user`)
- Mesma autenticação JWT, mesmo sistema de segredos, mesmo deploy
- Zero infra nova, zero conta nova
- Custo: $0 no plano gratuito (2M invocações/mês)
- Latência irrelevante para chatbot — a OpenAI já demora 1–3s

### Modelo de IA: GPT-4o mini
- Custo: ~$0.002 por conversa com contexto completo (30 dias de dados)
- Contexto de 128k tokens — suficiente para qualquer histórico do usuário
- Qualidade adequada para coach de nutrição/treino
- Pode ser trocado por Claude Haiku ou outro em 10 minutos — a arquitetura não muda

### Persistência do chat
- **Fase 7A:** em memória — conversa existe enquanto o modal está aberto
- **Futuro:** tabela `ai_conversations` no Supabase se houver demanda real

### Segurança da chave OpenAI
A chave `sk-...` fica **exclusivamente** em `Deno.env` da Edge Function.
- Nunca recebe prefixo `VITE_`
- Nunca entra em nenhum arquivo `src/`
- Configurada via `supabase secrets set` e painel do Vercel
- Abuso mitigado pelo JWT obrigatório (só usuário autenticado chama)
- Rate limiting formal planejado para quando houver >10 usuários ativos (ver capítulo Segurança)

---

## Fase 7A — Chat Kcal Coach

### Sessão 7A-1 — Backend (Edge Function)
**Status:** ⏳ Aguardando implementação
**Spec detalhada:** `memory/spec-fase-7A-1-ai-chat.md`

**O que entrega ao final:**
Um endpoint funcional. Sem UI — mas a IA já responde com dados reais do usuário. Testável via curl:
```bash
curl -X POST https://<projeto>.supabase.co/functions/v1/ai-chat \
  -H "Authorization: Bearer <jwt_do_usuario>" \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Como estão meus macros?"}]}'
# → {"reply": "Analisando seus dados dos últimos 30 dias..."}
```

**Arquivos a criar:**
- `supabase/functions/ai-chat/index.ts`
  - Valida JWT (padrão `invite-user`)
  - Busca diary, workouts, body_measurements, checkins (30 dias) + user_settings
  - Monta system prompt: conteúdo do `AI_Assistant.md` + JSON compacto dos dados
  - Chama `https://api.openai.com/v1/chat/completions` (gpt-4o-mini, max_tokens: 1000)
  - Retorna `{ reply: string }`

**Pré-requisito (você faz, 5 min):**
```bash
supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets list  # confirmar (sem mostrar o valor)
# + Vercel → Settings → Environment Variables → OPENAI_API_KEY
```

**Schema:** nenhuma tabela nova.

**Critérios de feito:**
- [ ] curl com JWT válido retorna `{ reply }` em português
- [ ] curl sem JWT retorna 401
- [ ] A resposta menciona dados reais do usuário
- [ ] `npm run build` sem erros (nenhum `src/` tocado)

---

### Sessão 7A-2 — Frontend (UI do chat)
**Status:** 🔵 Planejada — após 7A-1
**Dependência:** 7A-1 deployada e testada

**O que entrega ao final:**
O chat completo no app. FAB roxo em todas as telas → bottom sheet → conversa com o Kcal Coach que já conhece macros, treinos e peso. Sem exportar nada, sem sair do app.

**UX:**
- FAB (botão flutuante roxo, ícone 💬) visível em todas as abas
- Bottom sheet: gradiente `linear-gradient(180deg, #1a2035, #121828)`, `maxHeight: 88dvh`
- Balões: usuário à direita, coach à esquerda
- Loading: "Coach está pensando..." enquanto aguarda resposta
- Chips de ação rápida ao abrir: "Analise meus últimos 7 dias" / "Como está meu volume?" / "O que ajustar esta semana?"
- Histórico: em memória (zerado ao fechar o modal — intencional no MVP)

**Arquivos a criar:**
- `src/components/AiChatModal.tsx` — bottom sheet com os balões + input + botão enviar
- `src/hooks/useAiChat.ts` — estado da conversa (`messages[]`), chamada à Edge Function, loading state

**Integração:**
- FAB adicionado no `AppLayout.tsx` (fora do `<main>`, igual ao `DateNavBar`)
- `useAiChat` instanciado na página raiz — nunca duplicado em subcomponentes
- Contexto do usuário montado a partir dos dados já carregados (`useSettings`, `useDiary`, `useWorkout`)

**Schema:** nenhuma tabela nova.

**Critérios de feito:**
- [ ] FAB visível em todas as abas
- [ ] Chat abre e fecha sem afetar o estado das outras páginas
- [ ] Mensagem enviada → resposta da IA exibida em português
- [ ] Loading state visível enquanto aguarda
- [ ] Funciona no celular (375px, toque, teclado virtual não sobrepõe o input)
- [ ] `npm run build` sem erros TypeScript

---

## Fase 7B — Log por linguagem natural
**Status:** 🔵 Próximo — spec revisada (2026-03-19)
**Dependência:** Fase 7A completa ✅

> ⚠️ **Lição aprendida:** a spec original alterava Edge Function + frontend ao mesmo tempo e quebrou dev e prod simultaneamente. A spec revisada divide em 3 sub-sessões independentes e seguras.

### Estratégia: 3 sub-sessões isoladas

| Sub-sessão | O que muda | Edge Function tocada? | Risco |
|---|---|---|---|
| 7B-1 | Só frontend + mock | ❌ Não | Baixo |
| 7B-2 | Só Edge Function | ✅ Sim (bloco isolado) | Médio — testável via curl antes de ligar no app |
| 7B-3 | Integração final | Não | Baixo |

---

### Jornada do usuário (confirmada)
1. Usuário digita no chat: "almocei 200g de frango com arroz e feijão"
2. Frontend detecta intenção de log por palavras-chave (sem chamar IA)
3. `getFoodIndex()` gera lista compacta (~200 tokens) dos alimentos do banco
4. Edge Function `action:'parse-food'` recebe texto + índice → retorna JSON estruturado
5. `AiLogConfirmModal` exibe itens com gramas editáveis e totalizador em tempo real
6. Refeição detectada automaticamente ("almocei" → almoço); se não → dropdown obrigatório
7. Confirmar → custom foods criados → itens salvos no diário → toast ✓

### JSON retornado pela IA
```json
{
  "meal": "almoco",
  "items": [
    { "foodId": "frango_grelhado", "nome": "Frango grelhado", "grams": 200, "source": "db" },
    { "foodId": "arroz_branco",    "nome": "Arroz branco",    "grams": 150, "source": "db" },
    { "foodId": null, "nome": "Feijão carioca", "grams": 100, "source": "custom",
      "p": 4.5, "c": 13.8, "g": 0.4, "kcal": 77 }
  ]
}
```
`meal=null` → dropdown obrigatório no modal. `source:"db"` → usa FoodItem existente. `source:"custom"` → cria via `saveCustomFood()`.

---

### Sub-sessão 7B-1 — Frontend + mock (Edge Function intocada)

**Arquivos a criar/modificar:**
- `src/data/foodDb.ts` — nova função `getFoodIndex()`: string compacta por categoria (~200 tokens, não 500 IDs soltos)
- `src/hooks/useAiChat.ts` — estados `pendingLog`, `parseFood()` (mock offline), `confirmLog()`, `cancelLog()`
- `src/components/AiLogConfirmModal.tsx` — modal de confirmação (novo)
- `src/components/AiChatModal.tsx` — detecta intenção de log no frontend + abre modal

**Detalhe — getFoodIndex() compacto:**
```
Carnes: frango_grelhado(Frango grelhado/100g), bife_grelhado(Bife alcatra/100g)...
Cereais: arroz_branco(Arroz branco/50g), batata_doce(Batata doce/100g)...
```
→ ~200 tokens vs ~1.500 da spec anterior

**Detalhe — mock para testar UI sem backend:**
```typescript
// Durante 7B-1: parseFood() retorna JSON hardcoded
// Durante 7B-3: substituído pela chamada real à Edge Function
```

**Critérios de feito:**
- [ ] Modal abre ao detectar log de refeição no chat
- [ ] Itens exibidos com gramas editáveis e totalizador em tempo real
- [ ] Refeição detectada ou dropdown obrigatório se não detectada
- [ ] Confirmar/Cancelar funcionam (confirmação mostra toast por ora)
- [ ] Build sem erros TypeScript
- [ ] **Zero mudança na Edge Function**

---

### Sub-sessão 7B-2 — Edge Function (bloco isolado)

**Arquivos a modificar:**
- `supabase/functions/ai-chat/index.ts` — bloco `action:'parse-food'` **antes** do fluxo de chat existente

**Isolamento do risco — padrão obrigatório:**
```typescript
// Bloco novo — completamente separado do chat existente
if (body.action === 'parse-food') {
  return await parseFoodHandler(req, body, user)
}
// Fluxo de chat existente — intocado abaixo ↓
```

**Características do parse-food:**
- NÃO busca dados do usuário no Supabase (só parseia texto)
- Recebe: `{ action: 'parse-food', text: string, foodIndex: string }`
- Retorna: `{ meal, items[] }`
- Custo: ~300-500 tokens

**Curl de teste antes de ligar no app:**
```bash
curl -X POST https://klvqyczfqxrbybgljnhe.supabase.co/functions/v1/ai-chat \
  -H "Authorization: Bearer <jwt>" \
  -H "Content-Type: application/json" \
  -d '{"action":"parse-food","text":"almocei 200g frango com arroz","foodIndex":"..."}'
```

**Critérios de feito:**
- [ ] Curl retorna JSON estruturado correto
- [ ] Curl sem `action` (chat normal) continua funcionando igual — **obrigatório verificar**
- [ ] Curl sem JWT retorna 401
- [ ] Deploy: `supabase functions deploy ai-chat --no-verify-jwt`

---

### Sub-sessão 7B-3 — Integração com DiarioPage

**Arquivos a modificar:**
- `src/hooks/useAiChat.ts` — substituir mock por chamada real à Edge Function
- `src/components/AiChatModal.tsx` — recebe `onAddFood` como prop opcional
- `src/App.tsx` / `AppLayout` — passa `onAddFood` do DiarioPage via prop
- `src/pages/DiarioPage.tsx` — passa seu `onAddFood` do `useDiary` para o AppLayout

**Padrão obrigatório — props, nunca Context:**
```typescript
// AppLayout
interface AppLayoutProps { onAddFood?: (meal: string, item: FoodEntry) => void }
// AiChatModal
interface AiChatModalProps { onAddFood?: (meal: string, item: FoodEntry) => void }
```
→ Fiel ao padrão: `useDiary` instanciado só na DiarioPage; callbacks descem via props

**Caso: usuário loga de outra aba:**
→ Toast: "Alimentos adicionados ao diário de hoje ✓" (onAddFood ausente = salva direto via hook interno)

**Critérios de feito:**
- [ ] Alimento mencionado no chat aparece no diário correto
- [ ] Item do banco: macros calculados por `porcaoG/qty` corretamente
- [ ] Item custom: criado em `custom_foods` e inserido no diário
- [ ] Funciona de qualquer aba
- [ ] Build sem erros TypeScript
- [ ] Funciona no celular (375px, teclado virtual não sobrepõe modal)

---

### Decisões técnicas (revisadas)
| Decisão | Escolha | Motivo |
|---|---|---|
| Match no banco | IA recebe `getFoodIndex()` compacto (~200 tokens) | Preciso sem fuzzy search; muito mais barato que lista completa |
| Confirmação | Modal único | UX fluida, padrão MyFitnessPal |
| Refeição não detectada | Dropdown obrigatório no modal | Evita pergunta de volta no chat |
| Custom food | Cria ao confirmar via `saveCustomFood()` | Mesmo fluxo do CustomFoodModal |
| onAddFood | Props (nunca Context) | Padrão arquitetural do projeto |
| Isolamento Edge Function | Bloco `if (action==='parse-food')` separado | Chat existente nunca afetado |
| Sub-sessões independentes | 3 deploys separados | Dev = prod no Supabase Free — risco controlado |
| Custo parse | ~300-500 tokens | Não busca Supabase, só parseia texto |

**Schema:** nenhuma tabela nova — usa `diary_entries` e `custom_foods` existentes.
**Atenção:** IA erra gramas ±20-30% — modal de confirmação é obrigatório, nunca salvar direto.

---

## Fase 7C — Foto para macros
**Status:** 🔵 Planejada — após 7B
**Dependência:** Fase 7B (reutiliza o modal de confirmação)

**O que é:**
Usuário tira foto ou faz upload da refeição → IA estima os macros → mesmo modal de confirmação da 7B → salva no diário.

**Como funciona:**
- GPT-4o Vision (mesmo modelo, suporte a imagem nativo)
- Novo `action: 'parse-food-image'` na mesma Edge Function
- Frontend converte imagem para base64 e envia no payload
- IA retorna o mesmo JSON estruturado da fase 7B
- Mesmo modal de confirmação — zero código novo no frontend além do upload

**Considerações:**
- Precisão real: ±20–30% — sempre editável antes de salvar (comunicar ao usuário)
- Feature adequada para "premium experimental" — pode ser restrita por `profiles.plano`
- Tamanho da imagem: redimensionar no frontend antes de enviar (max 512px, ~100KB) para economizar tokens

**Schema:** nenhuma tabela nova.

---

## Decisões técnicas registradas

| Decisão | Escolha | Motivo |
|---|---|---|
| Modelo | GPT-4o mini | Custo baixo, contexto 128k, qualidade adequada |
| Servidor | Supabase Edge Function | Padrão já no projeto, zero infra nova |
| Cloudflare Workers? | Descartado | Zero benefício concreto para o estágio atual; custo real de setup sem ganho mensurável |
| Persistência do chat | Em memória (7A) → Supabase (futuro) | Menor complexidade para MVP |
| Ponto de entrada | FAB em todas as telas | Acessível sem interromper o fluxo atual |
| System prompt | `AI_Assistant.md` existente | Já refinado, testado no Gem |
| Contexto enviado | Últimos 30 dias | Equilíbrio custo de tokens vs utilidade |
| 7B e 7C na mesma Edge Function | Sim (`action` field) | Evita criar funções redundantes |

---

## Segurança — auditoria e pendências

> Auditoria realizada em 2026-03-17. Referência: OWASP Top 10 + OWASP ASVS.
> Resultado: 7/10 categorias OWASP cobertas, acima da média para SaaS em estágio MVP.

### ✅ Corrigido em 2026-03-17
**XSS em TemplateHistoryModal** (severidade 🟡 Média — fechado)
- `useMuscleVolume.ts`: 7 campos `detalhe` convertidos de HTML (`<b>`, `<br>`) para texto puro
- `TemplateHistoryModal.tsx`: `dangerouslySetInnerHTML` substituído por `{item.detalhe}`
- `dangerouslySetInnerHTML` não existe mais em nenhum arquivo do projeto

### 🔵 Pendências baixa severidade (registradas — implementar antes de escalar)

| # | Item | Severidade | Quando atacar |
|---|---|---|---|
| 1 | `VITE_ADMIN_EMAIL` no bundle expõe identidade do admin | 🟢 Baixa | Ao migrar para `is_admin BOOLEAN` em `profiles` |
| 2 | Content Security Policy (CSP) ausente no `vercel.json` | 🟢 Baixa | Antes de crescimento de usuários |
| 3 | Rate limiting na Edge Function `ai-chat` | 🟢 Baixa | Quando houver >10 usuários ativos |
| 4 | Logging de eventos de segurança | 🟢 Baixa | Fase 8+ ou compliance |

### Implementação futura das pendências

**Item 1 — Remover VITE_ADMIN_EMAIL do bundle**
```sql
ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT false;
UPDATE profiles SET is_admin = true WHERE id = (
  SELECT id FROM auth.users WHERE email = 'adilson.matioli@gmail.com'
);
```
Frontend: trocar `import.meta.env.VITE_ADMIN_EMAIL` por `profile.is_admin` do `useAuth`.

**Item 2 — CSP no vercel.json**
```json
{
  "headers": [{
    "source": "/(.*)",
    "headers": [{
      "key": "Content-Security-Policy",
      "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; connect-src 'self' https://*.supabase.co https://api.openai.com"
    }]
  }]
}
```

**Item 3 — Rate limiting na Edge Function ai-chat**
```sql
CREATE TABLE ai_usage (
  user_id UUID REFERENCES auth.users,
  hour    TEXT,  -- ex: '2026-03-17T15'
  count   INT DEFAULT 0,
  CONSTRAINT ai_usage_unique UNIQUE (user_id, hour)
);
```
Na Edge Function: `if (count >= 20) return 429` antes de chamar a OpenAI.

**Item 4 — Logging**
Tabela `security_events (user_id, event, metadata, created_at)` + RLS só-escrita para usuários autenticados. Admin lê via `/kcx-studio`.

---

## Fase 7A-3 — Coach adaptativo por modo e intenção

**Status:** 🔵 Planejada
**Motivação:** hoje o coach sempre responde com o diagnóstico completo padrão (macros + volume + progressão + alertas), independente do que o usuário perguntou. Com muitos dados, a resposta fica longa e genérica mesmo quando o usuário quer algo pontual.

**O que muda:**
O sistema prompt vai detectar a **intenção** da mensagem e adaptar o comportamento — profundidade, foco e tom.

### Modos de intenção (detectados automaticamente pelo modelo)

| Intenção | Gatilhos típicos | Comportamento esperado |
|---|---|---|
| **Diagnóstico completo** | "analise meus dados", "como estou", "resumo da semana" | Formato padrão atual: 6 seções completas |
| **Nutrição** | "como estão meus macros", "atingi a proteína", "comi bem hoje" | Foco em aderência P/C/G, padrão por refeição, ajuste pontual |
| **Treino** | "como está meu volume", "evoluí no supino", "tô em platô" | Foco em volume por grupo, progressão, MEV/MAV/MRV |
| **Composição corporal** | "perdi gordura", "meu peso", "bf%", "cintura" | Foco em tendência de peso, taxa semanal, BF% se houver checkins |
| **Pergunta direta** | "posso comer X?", "quantas proteínas preciso?", "o que é MEV?" | Resposta curta e direta — sem diagnóstico, sem seções |
| **Check-in emocional** | "tô me sentindo mal", "tive uma semana ruim", "não tô conseguindo" | Tom empático, 1-2 ajustes simples, sem pressão de métricas |

### Implementação

**Opção A (simples — sem código novo):** adicionar ao system prompt uma seção de instrução de modo:
```
## DETECÇÃO DE INTENÇÃO
Antes de responder, identifique a intenção principal da mensagem do usuário.
- Se for diagnóstico geral → use o formato completo de 6 seções
- Se for pergunta sobre nutrição → responda só com análise de macros/aderência (2-3 parágrafos)
- Se for pergunta sobre treino → responda só com volume/progressão (2-3 parágrafos)
- Se for pergunta direta/simples → responda em 1-3 frases, sem seções
- Se houver tom emocional → responda com empatia primeiro, depois 1 ajuste concreto
Nunca force o formato completo quando a pergunta é pontual.
```

**Opção B (avançada — futura):** chips de modo na UI — usuário seleciona explicitamente "🍽 Nutrição", "💪 Treino", "⚖️ Corpo", "💬 Conversa livre" antes de digitar. O chip vira um prefixo invisível no payload.

**Recomendação:** implementar Opção A primeiro (mudança só no system prompt, zero código novo). Avaliar se resolve. Opção B fica para 7A-4 se necessário.

### Chips de ação rápida atualizados (UI)

Substituir os 3 chips atuais por chips com contexto de modo:
- "🍽 Como estão meus macros esta semana?"
- "💪 Como está meu volume muscular?"
- "⚖️ Como está minha evolução de peso?"
- "🔍 Analise tudo dos últimos 30 dias"

### Arquivos a modificar
- `supabase/functions/ai-chat/index.ts` — adicionar seção de detecção de intenção no `SYSTEM_PROMPT`
- `src/components/AiChatModal.tsx` — atualizar chips com emojis de contexto

### Critérios de feito
- [ ] Pergunta sobre macros → resposta focada em nutrição (sem seção de treino)
- [ ] Pergunta sobre treino → resposta focada em volume/progressão (sem seção de macros)
- [ ] Pergunta direta simples → resposta em 1-3 frases
- [ ] Diagnóstico completo ainda funciona quando solicitado
- [ ] `npm run build` sem erros

---

## Specs por sessão

| Sessão | Arquivo de spec | Status |
|---|---|---|
| 7A-1 | `memory/spec-fase-7A-1-ai-chat.md` | ✅ Concluída (2026-03-18) |
| 7A-2 | UI do chat | ✅ Concluída (2026-03-18) |
| 7A-3 | Otimização de tokens (pré-proc + roteamento + prompt modular) | ✅ Concluída (2026-03-17) |
| 7B | Log por linguagem natural | 🔵 Spec concluída (2026-03-17) — pronto para implementar |
| 7C | a criar quando 7B estiver pronta | ⏳ |
