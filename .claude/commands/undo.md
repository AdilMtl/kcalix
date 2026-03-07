# /undo — Desfazer última alteração

## Processo

### 1. Identificar o que desfazer

```bash
git log --oneline -5
git diff HEAD~1 --stat
```

Apresente:
```
⏪ UNDO

ÚLTIMO COMMIT: [hash] — [mensagem]
ARQUIVOS AFETADOS: [lista]
AÇÃO: reverter este commit?
```

### 2. Aguardar confirmação explícita

NUNCA fazer undo sem confirmação — é destrutivo.

### 3. Opções de reversão

**Opção A — Reverter commit (seguro, cria novo commit)**
```bash
git revert HEAD --no-edit
```
Recomendado quando já foi feito push.

**Opção B — Desfazer commit local (apenas se NÃO foi feito push)**
```bash
git reset --soft HEAD~1  # mantém as mudanças em staging
```

**Opção C — Reverter arquivo específico**
```bash
git checkout HEAD~1 -- src/[arquivo]
```

### 4. Confirmar

```
✅ UNDO CONCLUÍDO

MÉTODO: [A/B/C]
ESTADO: [o que voltou ao normal]
PRÓXIMO PASSO: [o que fazer agora]
```

### Atenção

- NUNCA usar `git reset --hard` sem confirmação explícita do usuário
- Se o push já foi feito, preferir sempre `git revert` (não reescreve histórico)

$ARGUMENTS
