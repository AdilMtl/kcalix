# /status — Ver estado rápido do projeto

Apresenta um resumo rápido do estado atual sem precisar ler todos os arquivos.

## Processo

1. Verificar `git status` e último commit
2. Verificar `npm run build` (apenas se solicitado ou se houver suspeita de erro)
3. Identificar a fase atual no plano de execução
4. Apresentar:

```
📊 Kcalix — Status

PROJETO
├── Branch: main
├── Último commit: [mensagem] ([hash] — [data])
├── Pendências: [X arquivos / limpo]
└── Build: ✅ ok / ❌ verificar

FASE ATUAL: Fase N — [nome]
├── Concluído: [lista resumida do que foi feito]
├── Em andamento: [o que está sendo feito]
└── Próximo: [próximo passo concreto]

INFRAESTRUTURA
├── GitHub: github.com/AdilMtl/kcalix
├── Vercel: kcalix.vercel.app
└── Supabase: klvqyczfqxrbybgljnhe.supabase.co
```

$ARGUMENTS
