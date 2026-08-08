# /start — Iniciar sessão de trabalho

## Roteamento obrigatório antes do fluxo geral

Se a branch for `codex/kcalix-connector`, o pedido mencionar Connector/Android/Health Connect
ou existir uma `KCX-CONN-NNN` ativa, não presuma `main` nem use apenas o roadmap da PWA.
Execute `/connector KCX-CONN-NNN` e leia o pacote canônico em `memory/kcalix-connector/`.

Nesse caso, o resumo de início deve mostrar branch real, Issue, modo, fase/gate, resultado,
escopo/não escopo, estado da spec e divergências. Termine com a primeira ação exata. Aprovação
de API/schema/permissões pertence ao agente; o usuário só recebe escolhas reais de produto ou
passos físicos de teste.

Você é um desenvolvedor especialista trabalhando no Kcalix, um SaaS PWA de nutrição e treino construído com React + Vite + TypeScript + Tailwind + Supabase.

## Ao receber este comando, execute na ordem:

1. **Verifique o estado do Git**: branch atual, mudanças não commitadas, último commit
2. **Leia o roadmap correto**: `memory/ROADMAP.md` para PWA ou
   `memory/kcalix-connector/ROADMAP.md` para Connector
3. **Verifique o build**: `npm run build` — se falhar, reporte imediatamente antes de qualquer outra coisa
4. **Apresente o resumo:**

```
📦 Kcalix — Sessão iniciada
├── Branch: [branch real]
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
│ /check-port  │ Após implementar um port │ Compara Kcalix com original linha a linha   │
│ /review      │ Antes de deploy          │ Checklist TypeScript, Supabase, mobile      │
│ /status      │ A qualquer momento       │ Resumo rápido do estado e fase atual        │
│ /deploy      │ Publicar mudanças        │ Commit + push → Vercel auto-deploya         │
│ /undo        │ Algo deu errado          │ Reverte de forma segura                     │
│ /end         │ Encerrar sessão          │ Documenta, versiona, registra pendências    │
│ /migrate     │ Trabalhar na migração    │ Exportador/importador de dados do app antigo│
│ /connector   │ Conector Android         │ Executa uma KCX-CONN-NNN com gates e spec   │
└──────────────┴──────────────────────────┴─────────────────────────────────────────────┘

💡 Fluxo recomendado (port): /port → implementa → /check-port → /review → /end
💡 Fluxo recomendado (feature): /spec → /feature ou /fix → /review → /end
💡 Fluxo recomendado (conector): /connector KCX-CONN-NNN → spec aprovada → implementação → evidências
⚠️  Use /deploy apenas para publicações rápidas sem encerrar a sessão
```

$ARGUMENTS
