# Kcal Coach IA — Roadmap Técnico Completo
**Criado:** 2026-03-17
**Última atualização:** 2026-03-18

---

## Visão geral

Hoje o Kcal Coach existe como um Gem do Gemini: você exporta o JSON do app, abre o Gem, faz upload e conversa. Funciona, mas tem 3 passos manuais fora do app.

**Objetivo desta fase:** trazer o Kcal Coach para dentro do Kcalix. O usuário clica num botão e já está conversando — a IA já conhece os dados reais dele (macros, treinos, peso) sem exportar nada.

**Fases planejadas:**
| Fase | Nome | Status |
|---|---|---|
| 7A-1 | Edge Function ai-chat (backend) | ✅ Concluída (2026-03-18) |
| 7A-2 | UI do chat (frontend) | ✅ Concluída (2026-03-18) |
| 7A-3 | Coach adaptativo por modo/intenção | 🔵 Planejada |
| 7B | Log por linguagem natural | 🔵 Planejada |
| 7C | Foto para macros | 🔵 Planejada |

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
**Status:** 🔵 Planejada — após 7A completa
**Dependência:** Fase 7A deployada

**O que é:**
O usuário digita (ou fala) "Comi 200g de frango com arroz" → a IA extrai os macros → abre modal de confirmação → usuário edita se necessário → salva no diário.

**Como funciona:**
- Novo `action: 'parse-food'` na **mesma** Edge Function `ai-chat` (não cria função nova)
- Payload: `{ action: 'parse-food', text: "200g de frango com arroz" }`
- IA retorna JSON estruturado:
  ```json
  {
    "nome": "Frango grelhado + arroz branco",
    "pG": 46, "cG": 52, "gG": 4, "kcal": 432,
    "itens": [
      { "nome": "Frango grelhado", "qty": 200, "pG": 46, "cG": 0, "gG": 4, "kcal": 228 },
      { "nome": "Arroz branco cozido", "qty": 150, "pG": 3, "cG": 52, "gG": 0, "kcal": 204 }
    ]
  }
  ```
- Modal de confirmação: usuário vê o que a IA entendeu e pode editar gramas antes de salvar
- Ao confirmar: chama `onAddFood` do `useDiary` (mesmo fluxo do `FoodPortionModal`)

**Ponto de entrada no app:**
- Botão "Registrar por texto" dentro do `FoodDrawer` (aba Diário)
- Ou input no próprio chat: se o usuário digitar algo que parece uma refeição, chip "Adicionar ao diário?" aparece

**Schema:** nenhuma tabela nova — salva nas `diary_entries` existentes.

**Atenção:** a IA erra gramas em ±20–30% — o modal de confirmação é obrigatório, nunca salvar direto.

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
| 7A-3 | Coach adaptativo por intenção | 🔵 Planejada — spec inline acima |
| 7B | a criar quando 7A-3 estiver pronta | ⏳ |
| 7C | a criar quando 7B estiver pronta | ⏳ |
