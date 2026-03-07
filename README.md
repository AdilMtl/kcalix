# Kcalix

SaaS PWA de nutrição e treino — sucessor do [Kcal.ix (blocos-tracker)](https://adilmtl.github.io/blocos-tracker/).

**URL:** https://kcalix.vercel.app
**Stack:** React + Vite + TypeScript + Tailwind CSS + Supabase

---

## Documentação do projeto

| Arquivo | O que contém |
|---|---|
| [memory/ROADMAP.md](memory/ROADMAP.md) | Plano de execução completo — fases, SQL do banco, checklists de validação, FAQ de arquitetura |
| [memory/MEMORY.md](memory/MEMORY.md) | Contexto persistente para sessões com Claude Code |
| [.claude/commands/](/.claude/commands/) | Skills do Claude Code adaptados para este projeto |

**Leia o ROADMAP antes de iniciar qualquer sessão de trabalho.**

---

## Iniciar sessão de trabalho

Abra esta pasta no VS Code e use:
```
/start
```

O skill `/start` lê o `memory/ROADMAP.md`, identifica a fase atual e apresenta o próximo passo concreto.

## Desenvolvimento local

```bash
npm install
npm run dev        # localhost:5173
npm run build      # build de produção (rodar antes de qualquer deploy)
```

## Variáveis de ambiente

Crie `.env.local` na raiz (nunca commitar):
```
VITE_SUPABASE_URL=https://klvqyczfqxrbybgljnhe.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key
```

## Deploy

Push para `main` → Vercel publica automaticamente em ~1 minuto.

Use `/end` para encerrar a sessão com CHANGELOG + commit + push.

---

## Projeto original (paralelo, intocado)

O app anterior continua ativo em https://adilmtl.github.io/blocos-tracker/ e **não deve ser modificado** até a Fase 5 (ferramenta de migração) estar concluída.
