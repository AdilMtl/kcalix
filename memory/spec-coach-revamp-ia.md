# 📋 SPEC: Revamp do Kcal Coach — interpretação, memória e output

**Data:** 2026-07-19
**Fase:** 6B (Qualidade e Robustez) — recorte "IA do app"
**Escopo travado com o usuário:**
- ✅ DENTRO: modo conversa/análise do Coach (prompt, detecção de intenção, formatação de dados, timezone, memória de sessão, renderização da resposta, modelo do chat)
- ❌ FORA: MODO LOG (detecção de registro de refeição — mecânica atual preservada byte a byte), `parseFoodHandler`, `analyzePhotoHandler`, schema Supabase
- 📝 Backlog Fase 2 (registrado, NÃO implementar): comentários gerais de comportamento/sono/estresse interpretados pela IA
- Provedor: OpenAI (Fable5 é só o modelo desta sessão de design, nunca entra no app)

---

## PROBLEMA / MOTIVAÇÃO

1. **Resposta "desformatada"** — o prompt manda usar `**markdown**` (MODO F) mas a bolha do chat renderiza texto cru (`{msg.content}`, sem renderer). Usuário vê asteriscos literais.
2. **"Fala de outra data"** — `new Date().toISOString()` na Edge Function roda em UTC; das ~21h à meia-noite (BRT) o "Hoje" do contexto é amanhã. Janelas de 8/30 dias e corte de volume 7d deslocam junto.
3. **"Sem memória"** — `reset()` no `handleClose` apaga a conversa toda vez que o modal fecha.
4. **"Raso, genérico, isolado"** — (a) tetos duros de tamanho no prompt ("1-3 frases", "máx 3 parágrafos"); (b) `detectIntent` por regex decide QUAIS dados carregar — classificou errado, respondeu sem os dados; (c) resposta embrulhada em JSON string degrada texto; (d) `max_tokens` 600–1000; (e) gpt-4o-mini tem teto baixo de raciocínio integrado.

## DECISÕES DE DESIGN (aprovadas em sessão)

- **Persona única integrada** no prompt: nutricionista esportivo + coach de força (RP/Lucas Campos) + coach comportamental. Sem multi-agente.
- **Sempre carregar** diário(8d) + treinos(30d) + corpo/checkins(5) — mata a classe de bug de classificação; custo ~4,5k tokens/msg = centavos/mês (single user). `detectIntent` vira só detector de `isFullDiag`.
- **Modelo chat: `gpt-5-mini`** (~$0,09/mês no uso atual). Parse/foto ficam em `gpt-4o-mini`.
- **Log intocado via prompt-only**: instrução passa a ser "registro de refeição → JSON `{"action":"parse-food",...}` (como hoje); resto → texto livre". O handler atual já tolera texto livre (fallback em L997/L1015) — zero mudança na lógica de decisão.
- **Progressão pré-computada no servidor** — modelo interpreta, não faz aritmética.
- **Memória: só na sessão do app** (sem persistir no Supabase). Modal é instância única no App.tsx → basta não resetar no close.

---

## FASE A — Fundações (baixo risco, deploy independente)

### O QUE MUDA
- [ ] `src/hooks/useAiChat.ts` — enviar `clientDate: todayISO()` (de `src/lib/dateUtils.ts`) no body do invoke; enviar só as últimas **16 mensagens** ao servidor (estado local mantém tudo)
- [ ] `src/components/AiChatModal.tsx` — remover `reset()` do `handleClose`; adicionar botão discreto "nova conversa" no header (ícone, só visível quando `messages.length > 0`) que chama `reset()`
- [ ] `src/components/ChatMarkdown.tsx` (novo, ~40 linhas, zero deps) — renderiza subset: `**negrito**`, listas `- `, parágrafos. JSX puro, **sem `dangerouslySetInnerHTML`** (regra de segurança do projeto). Usado só em bolhas `assistant`
- [ ] `supabase/functions/ai-chat/index.ts` — ler `body.clientDate` (validar `/^\d{4}-\d{2}-\d{2}$/`); fallback: data em `America/Sao_Paulo` via `Intl.DateTimeFormat('en-CA', {timeZone})`. Usar para: linha "Hoje", dia da semana (via `new Date(clientDate+'T12:00:00Z')`), janelas since8/since30, cutoff do volume 7d

### CRITÉRIOS DE FEITO — FASE A
- [ ] Build sem erros TypeScript
- [ ] Às 22h BRT, perguntar "o que comi hoje?" → Coach responde sobre a data local correta
- [ ] Fechar e reabrir o chat → conversa preservada; botão "nova conversa" limpa
- [ ] Resposta com `**negrito**` e lista `- ` renderiza formatada (sem asteriscos literais)
- [ ] Registrar refeição por texto e por foto → fluxo idêntico ao atual (regressão zero)

## FASE B — O cérebro (só Edge Function + deploy)

> **📐 Design detalhado em `memory/design-coach-prompt-v2.md`** (escrito em sessão Fable 5, 2026-07-19) — contém o texto FINAL do system prompt, o contrato exato dos formatters (blocos HOJE/médias 7d/volume 4 semanas/progressão pré-computada/corpo interpretado), parâmetros da chamada OpenAI e QA. A implementação da Fase B deve seguir aquele doc à risca.
> **Calibração aprovada:** profundidade curta e certeira · tom direto + comemora com dados · emoji ponderado (status/ilustração, nunca decorativo) · nota de treino + cardio entram no contexto · corpo sempre carregado.

### O QUE MUDA (tudo em `supabase/functions/ai-chat/index.ts`)
- [ ] **SYSTEM_PROMPT reescrito**: persona integrada; princípios (citar valores/datas reais; conectar nutrição×treino×corpo em toda recomendação relevante; 1 ação concreta por resposta; ≤1 pergunta de afunilamento quando dados ambíguos; tamanho proporcional à pergunta — SEM tetos duros); formato permitido = só `**negrito**` + listas `- ` + parágrafos (proibir `###`, tabelas — contrato com ChatMarkdown); regra de log inalterada + "qualquer outra coisa: responda em texto livre, NUNCA em JSON"
- [ ] **KNOWLEDGE_NUTRITION expandido**: proteína/refeição ≥0,4g/kg, distribuição, carbo peri-treino, leitura semanal vs diária
- [ ] **KNOWLEDGE_WORKOUT**: incluir MRV no resumo semanal de volume
- [ ] **Carregamento fixo**: sempre diário+treino+corpo; `detectIntent` reduzido a `isFullDiag` (formato de diagnóstico + teto maior de tokens)
- [ ] **Bloco "Progressão (pré-computado)"** em `formatWorkouts`: por exercício com ≥2 sessões/30d → primeira vs última sessão, melhor série (carga máx), Δcarga, flag platô (3+ sessões sem progresso)
- [ ] **Chamada OpenAI do chat**: `model: 'gpt-5-mini'`; `max_completion_tokens` (não `max_tokens`!) = 1400 normal / 2000 isFullDiag; sem `temperature`. Modelo numa `const CHAT_MODEL` no topo p/ rollback rápido
- [ ] parse-food e analyze-photo: **nenhuma linha tocada**

### CRITÉRIOS DE FEITO — FASE B
- [ ] "Como devo treinar hoje?" → resposta cita dados de treino E ingestão recente (integração)
- [ ] "Analisa tudo" → diagnóstico estruturado renderizando bonito no app
- [ ] "Comi frango com arroz" → cai no fluxo de log normalmente (texto e foto)
- [ ] Perguntas de nutrição às 22h+ referem a data certa
- [ ] Custo/msg verificado no dashboard OpenAI (~ordem de $0,003)

## IMPACTO NO CÓDIGO
- Componente novo: `src/components/ChatMarkdown.tsx`
- Hook novo: nenhum · Supabase: **nenhuma migration** · Rotas: nenhuma
- TypeScript: tipo do body do invoke ganha `clientDate: string`

## RISCOS
1. **gpt-5-mini rejeitar parâmetro** (família gpt-5 usa `max_completion_tokens`, sem temperature custom) → testar com curl logo após deploy; rollback = trocar `CHAT_MODEL` p/ `gpt-4o-mini` + redeploy
2. **Regressão no log** (prompt novo confundir a regra do JSON) → QA dirigido: 3 frases de registro + 3 perguntas sobre o diário; rollback = redeploy da versão anterior (git NÃO reverte Supabase — redeploy explícito obrigatório)
3. **Renderer markdown** → JSX puro, sem HTML injetado; input malicioso vira texto literal
4. **Deploy**: SEMPRE `supabase functions deploy ai-chat --no-verify-jwt`
5. **Conversa antiga em contexto novo** (memória de sessão + app aberto dias) → aceito: reload do PWA limpa; se incomodar, TTL na Fase C

## ORDEM DE EXECUÇÃO
A → build → deploy → QA manual seu → B → deploy → QA manual seu → /end (docs + versão)

---

## STATUS DE IMPLEMENTAÇÃO (2026-07-19)

**Fase A + Fase B implementadas juntas. Build do frontend verde (tsc -b + vite). Deploy PENDENTE.**

Arquivos alterados:
- `supabase/functions/ai-chat/index.ts` (Fase B) — prompt v2, KNOWLEDGE expandido, `CHAT_MODEL='gpt-5-mini'`, `detectIntent`→`isFullDiag`, sempre carrega diário+treino+corpo, `resolveToday(clientDate)`, formatters reescritos (HOJE/médias/volume 4sem+MRV/progressão pré-computada/corpo interpretado, cardio+nota incluídos). parse-food/analyze-photo intocados (gpt-4o-mini).
- `src/components/ChatMarkdown.tsx` (NOVO, Fase A) — renderer seguro (**negrito**/listas/parágrafos), JSX puro.
- `src/hooks/useAiChat.ts` (Fase A) — envia `clientDate: todayISO()` + `messages.slice(-16)`.
- `src/components/AiChatModal.tsx` (Fase A) — `handleClose` não reseta; `handleNewChat` + botão "Nova conversa"; bolha assistant via `<ChatMarkdown>`.
- `src/index.css` (Fase A) — `.ai-chat-new`, `.ai-chat-header-actions`, `.cm-*`.

### ⚠️ Riscos vivos a validar no 1º teste pós-deploy
1. **gpt-5-mini + reasoning_effort + max_completion_tokens** não pôde ser testado localmente (sem chave OpenAI aqui). Se a função retornar 502 na 1ª msg → rollback: `CHAT_MODEL='gpt-4o-mini'`, `max_completion_tokens`→`max_tokens`, remover `reasoning_effort`; redeploy.
2. **Deno não instalado localmente** → typecheck da Edge Function só acontece no deploy do Supabase.

### Comandos de deploy
- Edge Function: `supabase functions deploy ai-chat --no-verify-jwt` (SEM o flag = 401)
- Frontend: git push → Vercel (~1 min)
- `git revert` NÃO reverte o Supabase — redeploy explícito sempre.
