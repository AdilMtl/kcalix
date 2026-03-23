# Supabase Edge Functions — Deploy, Teste e Reversão
**Criado:** 2026-03-23

> Referência obrigatória antes de qualquer alteração na Edge Function `ai-chat`.

---

## Regra crítica: Dev = Prod

O Supabase Free tem **um único ambiente**. Qualquer deploy vai ao ar imediatamente para todos os usuários. Não existe staging.

**Consequência:** sempre testar via curl antes de ligar a mudança no frontend.

---

## Comando de deploy

```bash
supabase functions deploy ai-chat --no-verify-jwt
```

**Por que `--no-verify-jwt` é obrigatório:**
Sem esse flag, o gateway do Supabase rejeita a requisição com 401 **antes** de o código rodar — mesmo com JWT válido. A validação de JWT é feita manualmente no código (padrão do projeto), não pelo gateway.

**Docker NOT running** é aviso inofensivo — o deploy funciona normalmente via CLI remota.

---

## Como obter o JWT para testar via curl

O JWT é o token da sessão do usuário logado. Para pegá-lo:

**Opção A — Console do navegador (mais rápido):**
1. Abrir o Kcalix no navegador, estar logado
2. Abrir DevTools → Console
3. Executar:
```javascript
const { data } = await window.__supabase.auth.getSession()
console.log(data.session.access_token)
```
> Se `window.__supabase` não existir, usar a opção B.

**Opção B — localStorage:**
```javascript
const key = Object.keys(localStorage).find(k => k.includes('auth-token'))
const token = JSON.parse(localStorage.getItem(key)).access_token
console.log(token)
```

**Opção C — Supabase Studio:**
1. Abrir [supabase.com/dashboard](https://supabase.com/dashboard) → projeto → Authentication → Users
2. Clicar no usuário → "Generate JWT" (nem sempre disponível no Free)

O JWT expira em 1 hora. Se o curl retornar 401, gerar um novo.

---

## Curls de verificação padrão

Sempre executar **os 3** após qualquer deploy, nesta ordem:

### 1. Chat normal (confirma que não quebrou prod)
```bash
curl -X POST https://klvqyczfqxrbybgljnhe.supabase.co/functions/v1/ai-chat \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Como estão meus macros?"}]}'
```
**Esperado:** `{ "reply": "..." }` — resposta em português com dados reais

### 2. Novo endpoint (confirma que a mudança funciona)
```bash
# Exemplo para 7B-2 (action: parse-food)
curl -X POST https://klvqyczfqxrbybgljnhe.supabase.co/functions/v1/ai-chat \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d '{"action":"parse-food","text":"almocei 200g de frango com 150g de arroz","foodIndex":"Proteínas: frango_grelhado(Frango grelhado/100g), Carboidratos: arroz_branco(Arroz branco/100g)"}'
```
**Esperado:** `{ "meal": "almoco", "items": [...] }`

### 3. Sem JWT (confirma que auth não foi quebrada)
```bash
curl -X POST https://klvqyczfqxrbybgljnhe.supabase.co/functions/v1/ai-chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"teste"}]}'
```
**Esperado:** `{ "error": "Não autorizado" }` — status 401

---

## Ponto de restauração — tag git

Cada versão estável da Edge Function é marcada com uma tag. Isso permite rollback em segundos sem precisar caçar hash de commit.

**Tag atual estável:** `v0.40.0-ai-chat-stable`
(v0.40.0 — 5 fixes de qualidade: volume treino, nome/grupo exercícios, data de hoje, intent multi-turn, max_tokens)

**Para restaurar se uma mudança quebrar:**
```bash
git show v0.40.0-ai-chat-stable:supabase/functions/ai-chat/index.ts > supabase/functions/ai-chat/index.ts
supabase functions deploy ai-chat --no-verify-jwt
supabase functions list  # confirmar UPDATED_AT
```

**Criar nova tag após cada sessão estável:**
```bash
git tag v0.XX.X-ai-chat-stable
git push origin v0.XX.X-ai-chat-stable
```

**Tags existentes:**
- `v0.35.1-ai-chat-stable` — pré-processamento + roteamento + prompt modular
- `v0.38.0-ai-chat-stable` — versão anterior (antes dos 5 fixes)
- `v0.40.0-ai-chat-stable` — versão atual estável ← usar esta

### Tempo estimado de reversão
- Restaurar + deploy: ~1-2 min
- Verificar com curl 1: ~1 min
- **Total: ~2-3 minutos**

---

## Reversão de emergência (sem tag)

> ⚠️ `git revert` **NÃO reverte o Supabase**. O código no GitHub e o código em produção são independentes. Reverter o git só muda o arquivo local — é necessário fazer redeploy explícito.

Se não houver tag disponível:
```bash
# Ver histórico do arquivo
git log --oneline supabase/functions/ai-chat/index.ts

# Restaurar versão pelo hash
git show <hash>:supabase/functions/ai-chat/index.ts > supabase/functions/ai-chat/index.ts
supabase functions deploy ai-chat --no-verify-jwt
```

---

## Checklist pré-deploy

Antes de fazer `supabase functions deploy`:

- [ ] `npm run build` sem erros (mesmo que só o `.ts` da função mudou — confirma que nenhum import quebrou)
- [ ] Mudança está isolada — bloco novo não altera fluxo existente
- [ ] Arquivo commitado no git (para ter hash de reversão disponível)
- [ ] JWT disponível para testar

## Checklist pós-deploy

- [ ] Curl 1 (chat normal) → `{ reply: "..." }`
- [ ] Curl 2 (novo endpoint) → resposta esperada
- [ ] Curl 3 (sem JWT) → 401
- [ ] Testar no app real (não só curl)

---

## Sintomas de problemas comuns

| Sintoma | Causa provável | Solução |
|---|---|---|
| 401 mesmo com usuário logado no app | Deploy sem `--no-verify-jwt` | Redeploy com o flag |
| 401 no curl mas app funciona | JWT expirado no curl | Gerar novo JWT |
| `{ error: "Configuração incompleta" }` | `OPENAI_API_KEY` não está no Deno.env | `supabase secrets set OPENAI_API_KEY=sk-...` |
| Chat retorna erro após mudança | Bug no novo bloco afetando fluxo existente | Rollback imediato (passo acima) |
| `{ error: "IA retornou JSON inválido" }` | Modelo envolveu JSON em markdown | Verificar limpeza de ```json no código |
| Deploy trava sem mensagem | CLI desconectada | `supabase login` + tentar novamente |
