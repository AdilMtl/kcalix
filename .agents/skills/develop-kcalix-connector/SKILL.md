---
name: develop-kcalix-connector
description: Planejar, especificar, implementar ou revisar o Kcalix Connector Android que lê Samsung Health via Health Connect e sincroniza com Supabase. Use para qualquer tarefa sobre APK local, permissões ou record types do Health Connect, ingestão de dados do Galaxy Watch, autenticação Android, deduplicação, vínculo com treinos, distribuição privada ou eventual publicação do conector.
---

# Desenvolver o Kcalix Connector

Conduza cada sessão por uma única Issue e por evidências. Preserve a decisão vigente: o
primeiro produto é um APK privado, somente leitura no Health Connect e com sincronização
manual; publicação pública, background sync e Wear OS direto não pertencem ao MVP.

## Carregar contexto obrigatório

Leia integralmente, nesta ordem, a partir da raiz do repositório:

1. `memory/kcalix-connector/README.md`
2. `memory/handoff-kcalix-connector-android.md`
3. `memory/kcalix-connector/ROADMAP.md`
4. `memory/kcalix-connector/ISSUES.md`
5. `memory/kcalix-connector/SPEC_TEMPLATE.md`
6. A spec `memory/kcalix-connector/specs/KCX-CONN-NNN.md`, se já existir.

Leia também `references/session-checklist.md` antes de modificar código ou marcar uma Issue
como concluída.

## Selecionar o modo da sessão

- **Explorar:** produza evidência para uma Issue de discovery; não crie arquitetura definitiva.
- **Especificar:** crie ou complete a spec específica usando o template; pare para aprovação antes da primeira alteração de código.
- **Implementar:** aceite somente Issue `READY`, dependências concluídas e spec `APPROVED`.
- **Revisar:** confronte código e evidências com cada critério, incluindo falhas e segurança.

Se o usuário não fornecer um ID, identifique a próxima Issue `READY` e proponha o trabalho.
Não pule para outra Issue apenas porque ela parece mais fácil.

## Executar o contrato de Start Session

Antes de alterar código, declare ao usuário e confira nos artefatos canônicos:

- Issue ativa, modo, fase e gate;
- resultado observável da sessão;
- escopo incluído e explicitamente não incluído;
- estado da Issue e da spec, com a aprovação exigida;
- divergências entre a expectativa do usuário, o handoff, o roadmap e o backlog.

Se houver divergência, pare a implementação e corrija primeiro Issue, spec, roadmap e índice.
Não interprete o backlog mecanicamente quando ele contradizer uma decisão de produto registrada
ou esclarecida pelo usuário. A resposta de Start Session deve terminar com a próxima ação exata.

## Executar o workflow

1. Verifique branch, working tree e arquivos relevantes. Preserve mudanças alheias.
2. Declare Issue ativa, fase, gate e resultado observável da sessão.
3. Confira dependências; se faltarem, limite-se a remover ou documentar o bloqueio.
4. Faça discovery no código e no aparelho antes de assumir versões ou dados disponíveis.
5. Para implementação, confirme contratos, permissões, falhas, segurança, rollback e testes.
6. Implemente a menor fatia vertical aprovada, sem ampliar para fases futuras.
7. Execute testes proporcionais ao risco e teste no aparelho real quando exigido.
8. Registre evidências sem incluir dados pessoais de saúde.
9. Atualize Issue, roadmap e memória.
10. Informe o próximo passo exato. Não faça commit, push, deploy, migration remota ou
    distribuição do APK sem solicitação explícita.

## Exigir precisão na spec

Rejeite specs que apenas dizem “conectar”, “sincronizar” ou “tratar erros”. Exija:

- nomes exatos de record types e permissões;
- campos, unidades, timezone, origem e opcionalidade;
- payloads de request, response e erro;
- autenticação, RLS, idempotência, conflito, retry e paginação;
- ausência, permissão parcial, offline, token expirado e replay;
- critérios Given/When/Then ligados a evidências;
- retenção, revogação, exclusão, logs e rollback.

Separe sempre fato observado, decisão aprovada e hipótese ainda não validada.

## Manter as fronteiras de segurança e produto

- Leia apenas dados aprovados; não peça permissões “para o futuro”.
- Nunca embarque `service_role`, chave de assinatura, token ou segredo administrativo.
- Use JWT do próprio usuário, validação no servidor e RLS como defesa em profundidade.
- Não versione export, screenshot sensível ou valor real de saúde.
- Não some calorias de fontes diferentes sem política de fonte de verdade aprovada.
- Não sobrescreva séries, repetições ou cargas do Kcalix com inferências do relógio.
- Trate o produto como bem-estar/fitness; não faça diagnóstico nem alegação médica.

## Encerrar com um handoff verificável

Relate Issue e estado final, gate avançado ou bloqueio, arquivos, testes/evidências,
itens não testados, decisão tomada e próximo ID a executar.
