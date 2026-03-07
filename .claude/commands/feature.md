# /feature — Adicionar nova funcionalidade

## Processo SDD (Spec Driven Development)

### 1. Spec primeiro

Se não tiver spec aprovada, execute `/spec` antes de continuar.

### 2. Plano de implementação

Apresente antes de codar:
```
📋 PLANO

COMPONENTES A CRIAR:
- src/components/[Nome].tsx
- src/hooks/use[Nome].ts

COMPONENTES A MODIFICAR:
- src/pages/[Página].tsx — [o que muda]

SUPABASE:
- [ ] Migration SQL necessária: [sim/não]
- [ ] Nova query: [descrição]

ORDEM DE IMPLEMENTAÇÃO:
1. [Passo 1]
2. [Passo 2]
3. [Passo 3]
```

Aguarde aprovação.

### 3. Implementar em ordem

- Um arquivo por vez
- Testar mentalmente cada passo
- Não avançar se o passo anterior tem dúvida

### 4. Validação final

```
✅ FEATURE IMPLEMENTADA

ARQUIVOS CRIADOS:
- [lista]

ARQUIVOS MODIFICADOS:
- [lista]

COMO TESTAR:
1. [Passo de teste no celular]
2. [Verificar no Supabase]

PRONTO PARA: /review → /deploy
```

$ARGUMENTS
