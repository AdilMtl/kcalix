# /review — Revisar código antes de deploy

Faz uma revisão completa das alterações recentes verificando qualidade, bugs e aderência às convenções do projeto.

## Checklist de revisão

Execute cada verificação e reporte:

### Build e TypeScript
- [ ] `npm run build` passa sem erros
- [ ] Sem uso de `any` — apenas tipos explícitos ou `unknown`
- [ ] Sem imports não utilizados
- [ ] Props de componentes tipadas com interface ou type

### Arquitetura React
- [ ] Nenhuma chamada direta ao Supabase dentro de componentes — sempre via hooks
- [ ] Estado global via store, não prop drilling excessivo
- [ ] Componentes pequenos e focados (< 150 linhas por arquivo)
- [ ] Hooks customizados para lógica reutilizável

### Segurança Supabase
- [ ] `.env.local` não aparece em nenhum commit (`git status` confirma)
- [ ] Row Level Security ativa nas tabelas afetadas
- [ ] Queries filtram por `user_id` (ou RLS faz isso automaticamente)
- [ ] Nenhuma `service_role` key exposta no frontend

### Mobile
- [ ] Todos os botões têm área de toque mínima 44x44px
- [ ] Inputs com font-size >= 16px (evita zoom no iOS)
- [ ] Nenhum overflow horizontal em 375px
- [ ] Modais/drawers não ficam atrás da barra de navegação inferior
- [ ] Testado com teclado virtual aberto (não esconde campos)

### PWA
- [ ] Service worker não cacheou dados sensíveis do usuário
- [ ] App funciona offline com último estado cacheado

## Formato do resultado

```
📝 REVIEW

ESTADO: ✅ Limpo / ⚠️ Tem pendências / ❌ Tem problemas

ENCONTRADO:
1. [Severidade: 🔴 crítico / 🟡 atenção / 🟢 sugestão] [Descrição] ([arquivo:linha])
2. ...

RECOMENDAÇÕES:
- [Sugestão de melhoria, se houver]

PRONTO PARA DEPLOY: Sim / Não
```

$ARGUMENTS
