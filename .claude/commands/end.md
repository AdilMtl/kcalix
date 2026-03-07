# /end — Encerrar sessão de trabalho

Finaliza a sessão com documentação e registro do estado para a próxima sessão.

## Processo obrigatório

### 1. Resumo da sessão

Leia o histórico de alterações desta sessão e apresente:

```
📋 RESUMO DA SESSÃO

DATA: [YYYY-MM-DD]
FASE: [Fase N — nome]

ALTERAÇÕES REALIZADAS:
1. [feat/fix/improve] [Descrição curta] ([arquivo])
2. ...

ARQUIVOS MODIFICADOS:
- src/[arquivo] (+XX -YY linhas)
- [outros]
```

### 2. Perguntas de versionamento

**Pergunta 1 — Tipo de release:**
- 🔴 Major (mudança grande, breaking change)
- 🟡 Minor (nova feature)
- 🟢 Patch (correção/melhoria)

**Pergunta 2 — A fase atual avançou?**
- Sim → atualizar status da fase no plano de execução
- Não → registrar o que falta para concluir

**Pergunta 3 — Deploy agora?**
- ✅ Sim, commit + push
- ⏸️ Não, só commit local
- ❌ Não commitar

### 3. Atualizar CHANGELOG.md

```markdown
## [vX.Y.Z] — YYYY-MM-DD

### Adicionado
- [feat] Descrição

### Melhorado
- [improve] Descrição

### Corrigido
- [fix] Descrição

### Notas
- [decisões técnicas, pendências]
```

### 4. Atualizar o plano de execução (se fase avançou)

Se a fase atual foi concluída ou parcialmente concluída, atualizar o status em `memory/kcalix-v3-plano-execucao.md`.

### 5. Executar deploy (se aprovado)

```bash
git add [arquivos específicos]
git commit -m "[tipo](vX.Y.Z): [resumo]"
git push origin main  # se aprovado
```

### 6. Encerramento

```
✅ SESSÃO ENCERRADA

Versão: vX.Y.Z
Commit: [hash]
Push: sim/não
Fase: [N — status atualizado]

📌 PENDÊNCIAS PARA PRÓXIMA SESSÃO:
- [item concreto e acionável]
- [nenhuma]

Próxima sessão: abrir pasta kcalix no VS Code → /start
```

## Regras

- NUNCA pule o resumo
- SEMPRE pergunte sobre versionamento
- Pendências devem ser concretas, não vagas
- Se mudou schema do banco: registrar no changelog com o arquivo de migration

$ARGUMENTS
