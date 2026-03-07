# /spec — Escrever especificação de mudança

O usuário vai descrever o que quer em linguagem natural. Transforme isso numa mini-especificação clara e validável ANTES de qualquer código.

## Processo

1. **Leia a descrição** em $ARGUMENTS
2. **Consulte o roadmap** em `memory/ROADMAP.md` para entender a fase atual e não implementar features de fases futuras
3. **Produza a spec** no formato abaixo
4. **Aguarde aprovação** antes de prosseguir

## Formato da spec

```
📋 SPEC: [Título curto]

FASE: [Fase N do plano de execução]

PROBLEMA / MOTIVAÇÃO
O que não funciona ou o que falta hoje.

O QUE MUDA
- [ ] [Arquivo/componente — o que muda]
- [ ] [Arquivo/componente — o que muda]

COMO O USUÁRIO INTERAGE
Passo a passo de como o usuário vai usar a feature no celular.

IMPACTO NO CÓDIGO
- Componente novo: [nome e localização]
- Hook novo: [nome e localização]
- Supabase: [nova tabela / nova query / nada]
- TypeScript: [novos tipos necessários]
- Rotas: [nova rota / nada]

RISCOS
- [Risco 1 e como mitigar]

CRITÉRIOS DE FEITO
- [ ] Build sem erros TypeScript
- [ ] Funciona no celular (375px, toque)
- [ ] Dados persistem no Supabase
- [ ] [Critério específico da feature]
```

## Regras

- Specs devem ser PEQUENAS — um componente ou uma feature por vez
- Se a descrição é vaga, faça perguntas antes de especificar
- Se a mudança afeta o schema do banco, SEMPRE alertar e incluir SQL de migration
- Pense mobile-first: tela pequena, toque, teclado virtual
- Respeitar a fase atual do plano — não implementar features de fases futuras

$ARGUMENTS
