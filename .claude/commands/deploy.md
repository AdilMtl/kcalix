# /deploy — Publicar alterações (mid-session)

Commita e publica sem encerrar a sessão. Use quando precisar publicar uma correção rápida e continuar trabalhando.

Para encerrar a sessão com deploy + CHANGELOG + registro de fase, use `/end`.

## Processo

### 1. Verificar estado
```bash
git status
git diff --stat
npm run build
```

Se o build falhar, PARE e reporte. Nunca fazer deploy com build quebrado.

Apresente o que será deployado:
```
🚀 DEPLOY

ARQUIVOS MODIFICADOS:
- src/pages/LoginPage.tsx (+XX -YY linhas)
- [outros, se houver]

RESUMO DAS MUDANÇAS:
- [Mudança 1]
- [Mudança 2]

BUILD: ✅ ok / ❌ falhou
```

### 2. Aguardar confirmação

### 3. Executar
```bash
git add [arquivos específicos — NUNCA git add . sem verificar]
git commit -m "[tipo](vX.Y.Z): [descrição curta]"
git push origin main
```

Tipos de commit:
- `feat:` nova funcionalidade
- `fix:` correção de bug
- `improve:` melhoria visual/UX/performance
- `docs:` documentação
- `refactor:` mudança interna sem alterar comportamento

### 4. Confirmar
```
✅ Deploy concluído!
├── Commit: [hash curto]
├── Mensagem: [mensagem]
└── URL: https://kcalix.vercel.app

⏱️ Aguarde ~1 minuto para o Vercel atualizar.
No celular: feche e reabra o app para carregar a versão nova.
```

### Atenção
- NUNCA incluir `.env.local` no commit
- Verificar sempre com `git status` antes de commitar
- Se mudou schema do banco: incluir o arquivo SQL de migration no commit

$ARGUMENTS
