# /fix — Corrigir bug ou problema

## Processo

### 1. Diagnóstico

Antes de tocar no código:
- Qual é o comportamento esperado?
- Qual é o comportamento atual?
- Em qual arquivo/componente/hook ocorre?
- Reproduzível em mobile?

### 2. Identificar causa raiz

Leia os arquivos relevantes. Identifique:
- É erro de TypeScript?
- É erro de lógica React (estado, re-render, efeito colateral)?
- É erro de chamada ao Supabase (query errada, RLS bloqueando)?
- É erro visual/CSS?

Apresente antes de corrigir:
```
🔍 DIAGNÓSTICO

PROBLEMA: [descrição do bug]
CAUSA RAIZ: [onde e por quê]
ARQUIVO: [src/...]
SOLUÇÃO: [o que vai mudar]
RISCO: [pode afetar algo mais?]
```

### 3. Aguardar confirmação

### 4. Corrigir cirurgicamente

- Alterar apenas o necessário
- Não refatorar código vizinho
- Não adicionar features enquanto corrige

### 5. Validar

```
✅ FIX APLICADO

ARQUIVO: [src/...]
MUDANÇA: [descrição da correção]
TESTADO: [como validar no browser/celular]
```

$ARGUMENTS
