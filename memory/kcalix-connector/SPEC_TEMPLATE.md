# Template obrigatório — spec de Issue do Kcalix Connector

Crie `memory/kcalix-connector/specs/KCX-CONN-NNN.md`. Remova instruções e preencha todas
as seções aplicáveis. Marque `N/A` com justificativa; não apague silenciosamente uma seção.

```markdown
# KCX-CONN-NNN — título

Status: DRAFT | APPROVED | IMPLEMENTED | VALIDATED
Issue pai: link/ID
Fase e gate: Fase N / GN
Responsável da decisão: pessoa
Última atualização: AAAA-MM-DD

## Decisão entregue
Uma frase que descreve a mudança observável, não a atividade “implementar X”.

## Contexto comprovado
- Decisões herdadas do PRD/handoff
- Código e contratos existentes inspecionados
- Hipóteses ainda não comprovadas

## Escopo
### Incluído
### Não incluído

## Fluxo do usuário e estados
Happy path e estados: sem Health Connect, sem permissão, vazio, parcial, offline,
token expirado, erro do servidor, retry, sucesso e dados já sincronizados.

## Dados e proveniência
Para cada campo: record type/API de origem, unidade, timezone, opcionalidade,
precisão esperada, transformação, destino, retenção e uso no produto.

## Permissões
Liste os nomes exatos das permissões Android/Health Connect e explique por que cada uma
é indispensável. Nenhuma permissão “para uso futuro”.

## Contratos
- Payloads JSON completos de request/response/erro
- Versionamento do contrato
- Limites de janela e paginação
- Chave de idempotência e regra de conflito
- Compatibilidade e rollback

## Banco e segurança
- Tabelas/colunas/índices/constraints
- Policies RLS por operação, com testes positivos e negativos
- Autenticação e armazenamento de token
- Threat model e fronteiras de confiança
- Logs permitidos/proibidos
- Exclusão, retenção e revogação

## Regras de domínio
Inclua vínculo de sessões, timezone, sobreposição, calorias/fonte de verdade, registros
corrigidos ou apagados na origem e comportamento de importação parcial.

## Arquivos previstos
Arquivos a criar/modificar, com responsabilidade de cada um. Ajuste após inspecionar o repo.

## Plano de testes
- Unitários
- Contrato/API
- RLS/autorização
- Instrumentados Android
- E2E no aparelho real
- Regressão PWA

## Critérios de aceite observáveis
Formato Given/When/Then ou equivalente. Cada item precisa apontar para uma evidência.

## Rollout, rollback e observabilidade
Como ativar, detectar falha, reverter sem perder dados e verificar saúde sem registrar dados sensíveis.

## Dúvidas e decisões pendentes
Cada dúvida tem dono e bloqueia explicitamente ou não a implementação.

## Evidências de validação
Comandos, resultados, capturas/relatórios e teste manual. Nunca commitar export de saúde real.
```

## Checklist de qualidade da spec

- [ ] Define uma entrega pequena e vertical.
- [ ] Não contém verbos vagos sem contrato (“integrar”, “conectar”, “tratar erros”).
- [ ] Usa nomes exatos de record types, permissões, endpoints e campos.
- [ ] Separa dado disponível, dado inferido e hipótese a validar.
- [ ] Explicita falhas, conflitos, idempotência, timezone e exclusão.
- [ ] Tem testes negativos de autenticação e RLS.
- [ ] Cada critério de aceite pode ser demonstrado ou testado.
- [ ] Não amplia o escopo para publicação pública ou produto médico.
- [ ] Possui aprovação antes da primeira alteração de código.

