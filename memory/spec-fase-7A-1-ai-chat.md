# SPEC: Fase 7A-1 — Edge Function ai-chat
**Criado:** 2026-03-17
**Status:** Aprovado — aguardando implementação

---

## FASE
7A — IA integrada (baby step 1 de 2)

---

## PROBLEMA / MOTIVAÇÃO
Hoje o usuário que quer análise do Kcal Coach precisa: exportar o JSON
manualmente, abrir o Gemini Gem, fazer upload do arquivo e só então
conversar. São 3 passos fora do app.

Esta sessão cria o backend que torna isso invisível: uma Edge Function
que recebe uma mensagem, busca os dados reais do usuário no Supabase,
e retorna a resposta da IA. O frontend (chat visual) vem na sessão 7A-2.

---

## O QUE MUDA
- [ ] `supabase/functions/ai-chat/index.ts` — NOVO (única entrega desta sessão)
- [ ] `memory/AI_Roadmap.md` — atualizar status da fase 7A-1 para concluída

## O QUE NÃO MUDA
- Nenhuma página do app
- Nenhum componente React
- Nenhuma tabela no banco
- Nenhuma dependência no `package.json`

---

## COMO O USUÁRIO INTERAGE (NESTA SESSÃO)
Nenhuma interação visual — o usuário não vê nada novo no app.
Testável via curl:

```bash
curl -X POST https://<projeto>.supabase.co/functions/v1/ai-chat \
  -H "Authorization: Bearer <jwt_do_usuario>" \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Como estão meus macros?"}]}'

# Resposta esperada:
# {"reply": "Olá! Analisando seus dados dos últimos 30 dias..."}
```

Na sessão 7A-2 esse endpoint vira a base do chat visual.

---

## FLUXO INTERNO DA EDGE FUNCTION

```
1. Recebe requisição com JWT + { messages: [{role, content}] }
2. Valida JWT — se inválido → 401 (padrão invite-user)
3. Busca dados do usuário no Supabase:
   - user_settings
   - diary_entries (últimos 30 dias)
   - workouts (últimos 30 dias)
   - body_measurements (últimas 5 entradas)
   - checkins (últimas 5 entradas)
4. Monta system prompt:
   - Conteúdo fixo do AI_Assistant.md (hardcoded na função)
   - + bloco dinâmico com dados do usuário em JSON compacto
5. Chama OpenAI:
   - POST https://api.openai.com/v1/chat/completions
   - model: gpt-4o-mini
   - system: prompt montado no passo 4
   - messages: array recebido do frontend
   - max_tokens: 1000
6. Retorna { reply: string }
```

---

## IMPACTO NO CÓDIGO
- **Edge Function nova:** `supabase/functions/ai-chat/index.ts`
- **Modelo de referência:** `supabase/functions/invite-user/index.ts` (mesmo padrão de auth JWT)
- **System prompt base:** `memory/AI_Assistant.md` (copiar o bloco entre as ``` do arquivo)
- **Hook novo:** nenhum (vem na 7A-2)
- **Componente novo:** nenhum (vem na 7A-2)
- **Supabase schema:** nenhuma tabela nova
- **TypeScript:** nenhum tipo novo no `src/`
- **Rotas:** nenhuma
- **package.json:** nenhuma dependência nova

---

## SEGREDOS NECESSÁRIOS (configurar antes de implementar)

```bash
# Terminal — configurar uma vez
supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets list  # confirmar que aparece (sem mostrar o valor)
```

Vercel (produção):
**Dashboard → Settings → Environment Variables → adicionar `OPENAI_API_KEY`**

Regra crítica: a chave **nunca** recebe prefixo `VITE_`, nunca vai para `src/`.

---

## RISCOS
- **Chave OpenAI exposta:** mitigado — fica só em `Deno.env`, nunca no bundle
- **Custo descontrolado:** mitigado — `max_tokens: 1000` limita cada resposta; com poucos usuários o custo é centavos
- **Schema bug:** N/A — nenhuma tabela nova nesta sessão
- **Cold start:** irrelevante para chatbot (1–2s não percebido pelo usuário)
- **Abuso por usuário:** mitigado pelo JWT obrigatório; rate limiting formal fica para fase posterior (documentado em `AI_Roadmap.md` capítulo 11)

---

## CRITÉRIOS DE FEITO
- [ ] `supabase/functions/ai-chat/index.ts` criado e deployado
- [ ] `curl` com JWT válido retorna `{ reply: "..." }` em português
- [ ] `curl` sem JWT retorna 401
- [ ] A resposta menciona dados reais do usuário (ex: cita peso, meta ou exercício)
- [ ] `npm run build` continua sem erros (nenhum `src/` foi tocado)

---

## O QUE VOCÊ TEM AO FINAL DESTA SESSÃO
Um endpoint funcional que qualquer cliente HTTP consegue chamar.
Sem interface — mas a IA já responde com os dados reais do usuário.
É a fundação que a sessão 7A-2 (chat visual) vai consumir.

## O QUE VOCÊ TEM AO FINAL DA 7A-2
O chat completo dentro do app: FAB → bottom sheet → conversa com o
Kcal Coach que já conhece seus macros, treinos e peso. Sem exportar
nada, sem sair do app.
