# AGENTS.md — Kcalix

Instruções operacionais para agentes de código (Codex, Claude Code e outros).
Este arquivo é lido automaticamente. Leia-o por inteiro antes da primeira ação.

Existe um `AGENTS.md` mais específico em `connector/`. Ao trabalhar em arquivos
daquela pasta, **aquele arquivo tem precedência** sobre este.

## Comandos

```bash
npm run dev            # servidor local (Vite)
npm run build          # tsc -b && vite build — precisa passar antes de qualquer entrega
npm run lint           # eslint
npm run test           # vitest run
npm run test:coverage  # vitest run --coverage
```

Deploy da PWA: push para o GitHub; a Vercel publica sozinha em ~1 min.
Edge Functions **não** sobem no push:
`supabase functions deploy ai-chat --no-verify-jwt` (sem a flag, retorna 401).
`git revert` não desfaz uma Edge Function — exige redeploy explícito.

## O que é o projeto

SaaS PWA de nutrição e treino: React + Vite + TypeScript + Tailwind + Supabase.
Repositório `AdilMtl/kcalix` → `kcalix.vercel.app`. Interface em português do Brasil.

Duas trilhas de trabalho, com regras diferentes:

| Trilha | Onde | Branch | Regras |
|---|---|---|---|
| PWA Kcalix | `src/`, `supabase/` | `main` | este arquivo |
| Connector Android | `connector/` | `codex/kcalix-connector` | `connector/AGENTS.md` |

## Contrato de Start Session

Ao iniciar qualquer sessão, **antes de alterar código**, declare ao usuário:

1. **Estado do repositório** — branch ativa, mudanças não commitadas, último commit.
2. **Onde o trabalho parou** — leia `memory/MEMORY.md` e `memory/ROADMAP.md` e diga
   qual é a fase atual e o próximo passo concreto já registrado.
3. **O que você vai fazer nesta sessão** — resultado observável, escopo incluído e
   escopo explicitamente não incluído.
4. **Divergências** — se o que o usuário pediu contradiz o roadmap ou o backlog,
   pare e resolva isso primeiro. Não execute por cima de uma divergência.

Termine sempre com a próxima ação exata. Se o build estiver quebrado, reporte isso
antes de qualquer outra coisa.

## Regras invariantes

Estas valem para todo o projeto e não são negociáveis por conveniência:

- **Nunca `any` em TypeScript.** Use `unknown` quando necessário.
- **Nunca chamar o Supabase dentro de um componente.** Sempre via hook
  (`useAuth`, `useDiary`, `useWorkout`…). Hooks de dados são instanciados apenas no
  componente de página; os callbacks descem por props.
- **Nunca commitar `.env.local`** nem qualquer chave do Supabase.
- **Nunca versionar dado pessoal real** de saúde ou nutrição (exports do app antigo).
  Já bloqueados no `.gitignore`.
- **Nunca voltar para HTML/CSS/JS puro.** A stack é React + TypeScript + Tailwind.
- Toda mudança de banco vira arquivo versionado em `supabase/migrations/`.
- Em migração, `UNIQUE` **sempre nomeada**: `CONSTRAINT nome_unico UNIQUE (a, b)`.
  Inline quebra `upsert onConflict` com erro 42P10.
- Em policy RLS, **nunca `SELECT FROM auth.users`** (403 silencioso). Use
  `auth.uid()` e `auth.jwt() ->> 'email'`.
- Toda alteração é testada mentalmente contra mobile: 375 px, toque, teclado virtual.
- Não faça alterações sem explicar o que muda e obter confirmação.

## Onde está a verdade

Quando a conversa e o repositório divergirem, o arquivo versionado vence.

| Assunto | Arquivo canônico |
|---|---|
| Estado entre sessões, decisões, bugs recorrentes | `memory/MEMORY.md` |
| Fases, o que está feito e o que falta | `memory/ROADMAP.md` |
| Connector Android | `memory/kcalix-connector/README.md` |
| App original que está sendo portado | `memory/ref.aplicativo_antigo/` |
| Coach IA — prompt e contrato de dados | `memory/design-coach-prompt-v2.md` |

## Skills e comandos

O mesmo processo, invocado de formas diferentes conforme a ferramenta:

| Intenção | Claude Code | Codex |
|---|---|---|
| Iniciar sessão | `/start` | siga o contrato acima |
| Especificar antes de mudar | `/spec` | `.claude/commands/spec.md` |
| Implementar / corrigir | `/feature`, `/fix`, `/improve` | arquivos correspondentes |
| Revisar antes de publicar | `/review` | `.claude/commands/review.md` |
| Encerrar e registrar | `/end` | `.claude/commands/end.md` |
| Connector Android | `/connector KCX-CONN-NNN` | `$develop-kcalix-connector` |

As definições vivem em `.claude/commands/` e `.agents/skills/`. São descrições de
processo em Markdown: se a sua ferramenta não as carrega automaticamente, **abra o
arquivo e siga o conteúdo** — o processo é o mesmo nos dois lados.

## Fluxos recomendados

```text
funcionalidade:  /spec → /feature ou /fix → /review → /end
port do antigo:  /port → implementa → /check-port → /review → /end
connector:       /connector KCX-CONN-NNN → spec aprovada → implementação → evidências
```
