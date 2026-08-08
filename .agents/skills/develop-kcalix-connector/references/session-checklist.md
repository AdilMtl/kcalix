# Checklist de sessão do Kcalix Connector

## Antes de codificar

- [ ] Issue ativa identificada e com dependências concluídas.
- [ ] Issue em `READY` e spec específica em `APPROVED`.
- [ ] Escopo e não escopo repetidos no plano.
- [ ] Dados disponíveis foram comprovados ou marcados como hipótese.
- [ ] Mudanças não relacionadas do usuário serão preservadas.
- [ ] Decisões técnicas serão resolvidas pelo agente; o usuário só será chamado para escolha
  real de produto, autorização necessária ou teste físico orientado.

## Android e Health Connect

- [ ] Versões mínimas e compatibilidade explícitas.
- [ ] Permissões mínimas com estados negado/parcial/revogado.
- [ ] Janela, paginação, timezone, unidades e origem definidos.
- [ ] Fixtures sintéticas; logs sem saúde ou tokens.
- [ ] Teste instrumentado/no aparelho planejado quando necessário.

## Supabase

- [ ] Contrato versionado e validado no servidor.
- [ ] JWT do usuário; nunca `service_role` no cliente.
- [ ] RLS com testes positivos e negativos entre usuários.
- [ ] Idempotência, replay e conflito definidos.
- [ ] Migration versionada e não aplicada remotamente sem autorização.

## Para concluir

- [ ] Cada critério de aceite aponta para evidência.
- [ ] Testes passaram ou falhas foram registradas.
- [ ] Issue, roadmap e memória refletem o estado real.
- [ ] Risco residual e itens não testados estão explícitos.
- [ ] Próxima ação contém um ID de Issue.
- [ ] O handoff informa branch, próximo modo, resultado, escopo e primeira ação exata.
- [ ] Nenhuma aprovação de engenharia foi transferida ao usuário.
- [ ] Commit, push, deploy, migration remota e APK permanecem sem execução salvo pedido explícito.

