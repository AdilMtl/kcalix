# Plano de implementação por issues e sessões

**Branch única:** `feature/kcalix-connector`

**Merge:** somente após release candidate em aparelho real e gate final aprovado

**Regra:** uma issue só pode começar quando possuir contexto, escopo, não escopo, contratos,
testes, evidências e handoff suficientes para ser executada em uma conversa nova.

## 1. Estratégia contra perda de contexto

O backlog deste arquivo é o índice. As issues que estão próximas da execução recebem um pacote
autocontido em `connector/issues/`. O pacote é a fonte primária da sessão e deve conter:

1. resultado observável esperado;
2. por que a issue existe e qual risco ela isola;
3. estado inicial e dependências verificáveis;
4. escopo e não escopo;
5. decisões técnicas e contratos exatos;
6. arquivos esperados, sem obrigar implementação cega;
7. testes automáticos e roteiro manual;
8. evidências que precisam ser registradas;
9. Definition of Done objetiva;
10. handoff para a próxima conversa.

As issues `KC-00` a `KC-06` já têm pacotes completos em
[`connector/issues/phase-0/`](../issues/phase-0/README.md). Nenhuma sessão futura deve executar
apenas um bullet deste índice.

## 2. Estratégia de branch

- Todo o trabalho acontece na branch longa `feature/kcalix-connector`.
- Android fica em `connector/android/`; comandos Gradle não rodam na raiz npm.
- Migrations e Edge Functions usam os diretórios Supabase existentes.
- A PWA só recebe a tela isolada de teste em KC-04; integração real começa em KC-12.
- Mudanças de `main` entram na feature apenas em checkpoint limpo e testado.
- Migration/deploy externo exige revisão e aprovação; criar arquivo não autoriza aplicar.
- Cada issue termina com commit próprio: `KC-04: prove manual connector round trip`.
- O merge final exige o release gate; evolução pública depende do piloto.

## 3. Fases e sessões

| Fase | Sessão | Issue | Resultado |
|---|---:|---|---|
| Planejamento | atual | documentação | spec, PRD, stack e packets |
| Fase Zero | 1 | KC-00 | decisões e baseline registrados |
| Fase Zero | 2 | KC-01 | toolchain gratuita funcional |
| Fase Zero | 3 | KC-02 | app compila, instala, atualiza e roda em emulador/aparelho |
| Fase Zero | 4 | KC-03 | login Kcalix e diagnóstico de conectividade |
| Fase Zero | 5 | KC-04 | input manual Android aparece na PWA e pode ser apagado |
| Fase Zero | 6 | KC-05 | disponibilidade e autorização Health Connect comprovadas |
| Fase 1 | 7 | KC-06 | leitura local real e matriz Samsung/Health Connect |
| Fundação | 8 | KC-07 | consentimento, retenção e threat model |
| Fundação | 9 | KC-08 | schema definitivo e RLS |
| Fundação | 10 | KC-09 | ingestão Health Connect v1 idempotente |
| MVP | 11 | KC-10 | leitores e normalizadores P0 |
| MVP | 12 | KC-11 | fila cifrada, upload e UX de sync |
| Kcalix | 13 | KC-12 | reconciliação treino/cardio/kcal na PWA |
| Controle | 14 | KC-13 | desconectar, apagar e exportar |
| Opcional | 15 | KC-14 | peso/BF se aprovados no spike |
| Release | 16 | KC-15 | APK assinado e QA real |
| Piloto | 17 | KC-16 | scorecard de 14 dias e go/no-go |
| Pós-GO | futura | KC-17 | sono, passos, Coach, background ou unificação |

Uma sessão pode parar antes do DoD. Nunca reduzir testes para encaixar uma issue no tempo de uma
conversa.

## 4. Backlog resumido

### KC-00 — Decisões e baseline

Registrar aparelho, Android/One UI, dados conhecidos, `applicationId`, login, janela, escopo e
distribuição. Pacote: [`KC-00.md`](../issues/phase-0/KC-00.md).

### KC-01 — Toolchain Android no Windows

Instalar e comprovar Studio/SDK/JBR/ADB/emulador sem custo obrigatório. Pacote:
[`KC-01.md`](../issues/phase-0/KC-01.md).

### KC-02 — Scaffold, instalação, atualização e emulador

Criar o projeto, gerar APK, instalar, atualizar por cima e executar no emulador e aparelho.
Pacote: [`KC-02.md`](../issues/phase-0/KC-02.md).

### KC-03 — Login Kcalix e diagnóstico

Autenticar, proteger sessão, mostrar conta/conectividade e garantir logout local. Pacote:
[`KC-03.md`](../issues/phase-0/KC-03.md).

### KC-04 — Vertical slice manual Android → PWA

Enviar um registro manual claramente marcado como teste, mostrar na PWA, provar idempotência e
apagá-lo sem tocar dados canônicos. Pacote: [`KC-04.md`](../issues/phase-0/KC-04.md).

### KC-05 — Health Connect: disponibilidade e permissão

Testar status e grant/deny/revoke de `READ_EXERCISE`, sem ler ou enviar saúde. Pacote:
[`KC-05.md`](../issues/phase-0/KC-05.md).

### KC-06 — Spike de leitura local no aparelho real

Inventariar origem, IDs, latência e qualidade de exercício/FC/energia/distância; nada sai do
aparelho. Pacote: [`KC-06.md`](../issues/phase-0/KC-06.md).

### KC-07 — Privacy foundation e threat model

Fechar aviso, consentimentos local/cloud/Coach, allow-list real, retenção, backups, incidentes e
redaction. Depende de KC-06.

### KC-08 — Schema definitivo, grants e RLS

Inspecionar schema remoto; criar connections, records, sync requests e links. Proibir acesso
cross-tenant e preservar `workouts`, `diary_entries`, `body_measurements` e `checkins`.

### KC-09 — RPC e Edge Function de ingestão v1

Implementar contrato autenticado sem `userId`, sem `service_role`, atômico e idempotente. Testar
JWT, conexão revogada, request conflitante, limites e duas contas.

### KC-10 — Leitores, normalizadores e preview P0

Ler sessões/FC/energia/distância, paginar, associar por intervalo/origem, resumir localmente e
nunca enviar amostras brutas.

### KC-11 — Fila cifrada, retry, upload e UX

Persistir o mesmo request até ACK, usar WorkManager somente para upload e mostrar estados de
sync, erros recuperáveis e última execução.

### KC-12 — Reconciliação na PWA e calorias

Sugerir vínculo/adicionar cardio, preservar treino manual e manter kcal Kcalix/relógio separadas.
Nenhuma soma, meta ou Coach muda automaticamente.

### KC-13 — Desconectar, apagar e exportar

Bloquear novas ingestões, revogar Health Connect, apagar somente importados e incluir
proveniência na exportação.

### KC-14 — Peso e BF/BIA condicionais

Executar somente se KC-06 comprovar dados consistentes. Manual vence conflitos; BIA não substitui
dobras; nenhuma meta é recalculada.

### KC-15 — QA, assinatura e APK privado

Executar suites, fluxo real Watch → PWA, release não-debuggable, checksum, upgrade/reinstall e
backup da keystore.

### KC-16 — Piloto de 14 dias

Medir hard gates e metas do PRD; registrar GO, CONDITIONAL ou NO-GO antes do merge/evolução.

### KC-17 — Pós-GO

Cada capacidade — sono, passos, Coach, changes/background, histórico ou Capacitor — exige spec e
consentimento próprios antes de código.

## 5. Protocolo de abertura e fechamento

As skills e suas regras estão documentadas em [`AGENT_SKILLS.md`](AGENT_SKILLS.md). Usar o
fluxo específico do Connector; os comandos genéricos `/start` e `/end` continuam pertencendo à
PWA.

### Abrir uma conversa

1. Invocar `/start-connector KC-XX` no Claude Code ou `$start-connector KC-XX` no Codex.
2. Ler `connector/README.md`, a issue completa e somente as referências que ela indicar.
3. Confirmar `git branch --show-current` = `feature/kcalix-connector`.
4. Verificar working tree e preservar alterações preexistentes.
5. Confirmar dependências e baseline; não presumir estado externo.
6. Declarar o resultado observável da sessão antes de editar.
7. Executar com `/execute-connector-issue KC-XX` ou `$execute-connector-issue KC-XX`.

### Fechar uma conversa

1. Invocar `/end-connector KC-XX` no Claude Code ou `$end-connector KC-XX` no Codex.
2. Rodar todos os testes e passos manuais possíveis.
3. Atualizar no packet: status, evidências, decisões, desvios e pendências.
4. Registrar comandos exatos e saídas relevantes, sem segredos/dados de saúde.
5. Marcar DoD somente se cada item tiver evidência.
6. Atualizar o campo “Próxima conversa” com arquivo inicial e primeiro comando.
7. Revisar diff e criar commit com o ID; não fazer merge na `main`.
