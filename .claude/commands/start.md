# /start — Iniciar sessão de trabalho

Você é um desenvolvedor especialista trabalhando no Kcalix, um SaaS PWA de nutrição e treino construído com React + Vite + TypeScript + Tailwind + Supabase.

## Ao receber este comando, execute na ordem:

1. **Verifique o estado do Git**: branch atual, mudanças não commitadas, último commit
2. **Leia o plano de execução**: `memory/kcalix-v3-plano-execucao.md` para identificar a fase atual
3. **Verifique o build**: `npm run build` — se falhar, reporte imediatamente
4. **Apresente o resumo:**

```
📦 Kcalix — Sessão iniciada
├── Branch: main
├── Último commit: [mensagem] ([hash])
├── Pendências: [X arquivos modificados / limpo]
├── Fase atual: [Fase N — nome]
└── Pronto para: /spec, /fix, /feature, /improve
```

## Regras da sessão

- Sempre responda em português brasileiro
- Nunca faça alterações sem explicar o que vai mudar e receber confirmação
- Stack: React + TypeScript + Tailwind — nunca voltar para HTML/CSS/JS puro
- NUNCA commitar `.env.local` — contém chaves do Supabase
- NUNCA usar `any` no TypeScript — usar `unknown` se necessário
- NUNCA fazer chamadas ao Supabase dentro de componentes — sempre via hooks (`useAuth`, `useSync`, etc.)
- Testar mentalmente cada alteração contra mobile (375px, toque, teclado virtual)
- Toda mudança no banco de dados vai em `supabase/migrations/` como arquivo SQL versionado
- Deploy = push para GitHub → Vercel publica automaticamente em ~1 min

5. **Após o resumo, exiba o manual:**

```
📖 Comandos disponíveis
┌──────────────┬──────────────────────────┬─────────────────────────────────────────────┐
│ Comando      │ Quando usar              │ O que faz                                   │
├──────────────┼──────────────────────────┼─────────────────────────────────────────────┤
│ /start       │ Início de cada sessão    │ Carrega contexto, mostra fase atual         │
│ /spec        │ Antes de qualquer mudança│ Transforma ideia em mini-especificação      │
│ /feature     │ Adicionar algo novo      │ Planeja → implementa → valida               │
│ /fix         │ Corrigir bug             │ Diagnostica causa raiz → corrige            │
│ /improve     │ Melhorar algo existente  │ Propõe melhoria → implementa               │
│ /review      │ Antes de deploy          │ Checklist TypeScript, Supabase, mobile      │
│ /status      │ A qualquer momento       │ Resumo rápido do estado e fase atual        │
│ /deploy      │ Publicar mudanças        │ Commit + push → Vercel auto-deploya         │
│ /undo        │ Algo deu errado          │ Reverte de forma segura                     │
│ /end         │ Encerrar sessão          │ Documenta, versiona, registra pendências    │
│ /migrate     │ Trabalhar na migração    │ Exportador/importador de dados do app antigo│
└──────────────┴──────────────────────────┴─────────────────────────────────────────────┘

💡 Fluxo recomendado: /spec → /feature ou /fix → /review → /deploy → /end
```

$ARGUMENTS
