# Backlog de Issues — Kcalix Connector

Este arquivo é o backlog canônico enquanto as Issues não forem criadas no GitHub. Cada bloco
já está pronto para ser copiado para o tracker. O status inicial é `BACKLOG`, salvo indicação.

## Regras de execução

- Selecione apenas uma Issue por sessão e respeite `Depende de`.
- Trabalhe em `codex/kcalix-connector`; não implemente esta iniciativa na `main`.
- Antes do código, crie a spec pelo `SPEC_TEMPLATE.md` e obtenha aprovação.
- Não encerre como `DONE` sem anexar evidência aos critérios de aceite.
- Descobertas que mudem produto/arquitetura viram decisão no PRD/ADR, não ficam escondidas em código.
- Nunca use dados pessoais reais como fixture ou artefato versionado.

## Fase 00 — bootstrap Android isolado

### KCX-CONN-005 — Bootstrap Android reproduzível

**Status:** DONE  
**Depende de:** nenhuma  
**Entrega:** app Android mínimo compila, instala e identifica versão/ambiente, sem acesso a
Health Connect, autenticação, rede ou dados de saúde.

**Aceite:** build documentado; SDK/JDK/Gradle fixados; secrets fora do Git; APK debug instala;
README contém comandos e troubleshooting; nenhuma permissão de saúde é declarada ou solicitada.

### KCX-CONN-000 — Shell visual offline alinhada ao Kcalix

**Status:** DONE

**Depende de:** KCX-CONN-005

**Entrega:** o APK abre uma interface Ember do Kcalix Connector com estados de conexão,
formulário manual dos destinos Cardio, Água e Corpo e uma simulação local de transferência,
sem Health Connect, login, rede ou persistência.

**Aceite:**

- [x] Spec `KCX-CONN-000` aprovada antes do código.
- [x] Interface usa identidade Ember e funciona em 360, 390 e 430 px de largura.
- [x] Conta Kcalix e Health Connect aparecem como não conectados, sem ação real.
- [x] O usuário escolhe uma data e pode preencher Cardio, Água, Peso, Cintura e Body fat.
- [x] Cardio usa exatamente o catálogo/IDs do Kcalix e exige tipo e minutos válidos.
- [x] A simulação usa somente estado em memória, identifica-se como demonstração e não grava
  nada no Kcalix.
- [x] O launcher usa uma variação própria do ícone Kcalix para distinguir o Connector.
- [x] Manifesto continua sem permissões Health Connect e Internet; nenhum valor digitado é
  persistido ou registrado em log.
- [x] Build debug passa e a tela é validada no aparelho físico.

**Spec:** [KCX-CONN-000](specs/KCX-CONN-000.md). O build debug e os testes passaram; o usuário
baixou, instalou e validou o fluxo no aparelho físico em 2026-07-22.
**Evidência:** [validação automatizada e artefato](evidence/KCX-CONN-000-validation.md).

### KCX-CONN-021 — Polish de contraste da shell offline

**Status:** BACKLOG
**Depende de:** KCX-CONN-000
**Entrega:** corrigir o texto preto sobre fundo preto observado no aparelho e fazer uma passada
visual curta nos componentes Cardio/card, campos e menus, sem alterar regras ou integrações.

**Aceite:** cores de texto/label/menu são explícitas no tema escuro; nenhuma informação fica
ilegível em repouso, foco, preenchido, erro, menu aberto ou desabilitado; build/testes passam;
contraste é conferido novamente no aparelho. É polish não bloqueante para `KCX-CONN-001`.

## Fase 0 — governança e descoberta

### KCX-CONN-001 — Definir valor e contrato de observação do Watch 5

**Status:** DONE

**Depende de:** KCX-CONN-000

**Entrega:** decisões de produto e princípios de reconciliação aprovados, projeto de referência
ou baseline oficial revisado por especialidade e contrato de export diagnóstico preparado
para a leitura real.

**Escopo:** validar jornada, fontes de verdade, princípios de match, conflitos, calorias,
FC/zonas e body fat; revisar o projeto de referência contra a API oficial; definir schema,
privacidade, testes e instruções dos especialistas para o export local. Não fechar pesos ou
tolerâncias finais de match antes da evidência real da `KCX-CONN-007`.

**Aceite:**

- [x] Jornada de musculação e cardio e fontes de verdade aprovadas pelo usuário.
- [x] Princípios e estados de reconciliação validados antes de código.
- [x] Política provisória impede soma Watch + Kcalix e separa kcal total/ativa/estimada.
- [x] FC e body fat têm uso, origem e limites de produto definidos; política exata das zonas
  continua pendente.
- [x] Referência técnica tem licença, versão, fluxo e dependências registrados.
- [x] Lentes Android, dados, segurança, produto e QA entregaram parecer consolidado pelo roteiro.
- [x] Export `kcx-health-observation/1` tem schema, perfis e política de compartilhamento
  aprovados por revisão técnica e testes positivo/negativo.
- [x] Cada record type candidato tem permissão exata, campos, unidade, origem e utilidade proposta.
- [x] Fixtures sintéticas e roteiro antes/depois de atividade conhecida estão definidos.
- [x] Nenhum valor pessoal bruto, screenshot sensível ou export foi commitado nesta fase.
- [x] A implementação posterior está limitada aos sinais aprovados ou condicionais.

**Spec:** [KCX-CONN-001](specs/KCX-CONN-001.md), `APPROVED`.
**Evidência:** [handoff de descoberta de produto](HANDOFF_DISCOVERY_PRODUTO_2026-07-23.md) +
[roteiro de revisão especializada](reviews/KCX-CONN-001-reference-project-review.md) +
[protocolo de discovery anonimizado](evidence/KCX-CONN-001-discovery.md) +
[registro da sessão de transição](sessions/2026-07-23-KCX-CONN-001-observation-transition.md) +
[consolidação de decisões](sessions/2026-07-27-KCX-CONN-001-decisions-consolidation.md).
A recomendação atual inclui a
[revisão oficial de APIs/Samsung](evidence/KCX-CONN-001-api-review-2026-08-08.md), o
[contrato versionado](contracts/kcx-health-observation-1.md), seu
[schema executável](contracts/kcx-health-observation-1.schema.json) e fixtures sintéticas.
A execução desta revisão está registrada em
[sessão de 2026-08-08](sessions/2026-08-08-KCX-CONN-001-api-contract.md).
A leitura real pertence à `KCX-CONN-007`.

**Retomada 2026-07-27:** produto consolidado em três casos de uso: cardio sem redigitação,
musculação enriquecida e body fat BIA. Passos, sono e FC de repouso foram adiados. Nenhum
projeto de referência separado foi encontrado no workspace; o sample oficial
`android/health-samples/HealthConnectSample`, commit
`47f0144f6e994f7831a41499843a0f6a9d87cb75`, Apache-2.0, foi registrado como baseline.
A revisão inicial recomendou adaptar o fluxo e rejeitar o escopo didático excessivo. Em
2026-08-08, a revisão oficial fixou `connect-client:1.1.0`, seis permissões de leitura, janela
de 7 dias, paginação completa e perfis/fixtures. O contrato passou em testes positivo,
negativo, privacidade estrutural e permissões; a Issue foi encerrada tecnicamente sem repassar
ao usuário revisão de engenharia. Dado real continua bloqueado até as Issues de privacidade,
permissões e leitura controlada.

### KCX-CONN-002 — Aprovar PRD do piloto privado

**Status:** DONE
**Depende de:** KCX-CONN-001  
**Entrega:** PRD enxuto que liga cada dado a uma decisão do usuário e a uma métrica.

**Aceite:**

- [x] Define usuário, problema, jornadas e resultado desejado.
- [x] Prioriza no máximo três casos de uso do MVP.
- [x] Define baseline manual e métricas do piloto de 2–4 semanas.
- [x] Define não objetivos: diagnóstico, recomendação médica, Play Store e sync contínuo.
- [x] Contém critérios go/no-go e responsável pela decisão.

**Spec:** [KCX-CONN-002](specs/KCX-CONN-002.md), `APPROVED`.
**PRD:** [piloto privado do Kcalix Connector](PRD.md), `kcx-connector-prd/1`, `APPROVED`.
**Evidência:** [sessão de 2026-08-08](sessions/2026-08-08-KCX-CONN-002-prd.md). O PRD
mantém exatamente cardio sem redigitação, musculação enriquecida e body fat BIA; define
baseline de 7 dias, piloto de 14–28 dias, métricas com denominador mínimo e decisão
`GO | ADJUST | NO-GO`. G1 foi fechado sem liberar código ou dado real.

### KCX-CONN-003 — ADR: ratificar Kotlin nativo no piloto

**Status:** READY  
**Depende de:** KCX-CONN-001, KCX-CONN-002  
**Entrega:** ADR que confirma ou rejeita, com evidência, a continuidade da base Kotlin/Compose
já validada para o piloto e registra o caminho futuro de eventual unificação via Capacitor.

**Aceite:**

- [ ] Avalia a base Kotlin existente contra suporte Health Connect, esforço, debugging, auth
  e distribuição do piloto.
- [ ] Inclui um spike apenas se evidência documental/código existente não bastar.
- [ ] Confirma estrutura, versões mínimas e ownership ou justifica a troca antes do spike real.
- [ ] Registra condições e custo para migrar/unificar via Capacitor depois do piloto.

### KCX-CONN-004 — Threat model, privacidade e ciclo de vida dos dados

**Status:** BACKLOG  
**Depende de:** KCX-CONN-002  
**Entrega:** mapa de dados e controles antes da ingestão.

**Aceite:**

- [ ] Mapeia fronteiras Watch/Samsung/Health Connect/APK/Supabase/PWA/Coach.
- [ ] Define minimização, retenção, revogação, exclusão e exportação.
- [ ] Proíbe service-role e segredos administrativos no APK.
- [ ] Define armazenamento de sessão e conteúdo permitido em logs.
- [ ] Classifica riscos e mitigação, incluindo celular perdido e APK desatualizado.

## Fase 1 — spike Android somente leitura

### KCX-CONN-006 — Disponibilidade e permissões Health Connect

**Status:** BACKLOG  
**Depende de:** KCX-CONN-003, KCX-CONN-004, KCX-CONN-005
**Entrega:** UX de disponibilidade/permissões mínimas com estados explícitos.

**Aceite:** detecta ausência/incompatibilidade; solicita somente registros aprovados;
explica negação; abre configurações para revogação; testes cobrem negado/parcial/concedido.

### KCX-CONN-007 — Leitura controlada e matriz de qualidade

**Status:** BACKLOG  
**Depende de:** KCX-CONN-006  
**Entrega:** leitura paginada por janela, export diagnóstico local versionado e prévia dos
campos reais, sem upload.

**Aceite:** serializers explícitos por record type; JSON `kcx-health-observation/1`; perfis
`STRUCTURAL` e `PRIVATE_FULL`; timezone/unidades/origem explícitos; janela limitada; vazio,
parcial, cancelamento e arquivo incompleto são seguros; comparação com Samsung Health e
projeto de referência documentada; nenhum upload ocorre; matriz diferencia `disponível`,
`indisponível` e `não testado`.

### KCX-CONN-008 — Modelo canônico e deduplicação local

**Status:** BACKLOG  
**Depende de:** KCX-CONN-007  
**Entrega:** transformação determinística para registros canônicos com fingerprint estável.

**Aceite:** fixtures sintéticas; testes de duplicidade, sobreposição e correção; provenance
preservida; transformação não soma calorias de fontes incompatíveis.

## Fase 2 — ingestão segura

### KCX-CONN-009 — Schema, provenance, RLS e retenção

**Status:** BACKLOG  
**Depende de:** KCX-CONN-004, KCX-CONN-008  
**Entrega:** migration revisável e testes de isolamento entre usuários.

**Aceite:** constraints/índices/idempotência definidos; RLS cobre SELECT/INSERT/UPDATE/DELETE;
usuário A nunca acessa B; origem e versão do contrato persistem; política de exclusão testada.

### KCX-CONN-010 — Edge Function de ingestão versionada

**Status:** BACKLOG  
**Depende de:** KCX-CONN-009  
**Entrega:** endpoint autenticado que valida e faz upsert idempotente.

**Aceite:** JSON request/response/erros especificado; JWT obrigatório; schema validation;
limite de lote; rejeição atômica ou parcial definida; replay não duplica; testes negativos passam.

### KCX-CONN-011 — Autenticação segura no Android

**Status:** BACKLOG  
**Depende de:** KCX-CONN-004, KCX-CONN-005, KCX-CONN-010  
**Entrega:** login/logout/renovação e armazenamento protegido da sessão do usuário.

**Aceite:** sem service-role; token não aparece em logs; expiração e logout são testados;
falha de rede preserva estado seguro; remoção do app/conta tem comportamento documentado.

### KCX-CONN-012 — Sync manual, retry e observabilidade

**Status:** BACKLOG  
**Depende de:** KCX-CONN-008, KCX-CONN-010, KCX-CONN-011  
**Entrega:** botão “Sincronizar agora” com fila curta e resultado compreensível.

**Aceite:** mostra lidos/enviados/ignorados/falhos; retry com backoff limitado; offline não
perde nem duplica; último sync persistido; logs usam IDs técnicos e não valores de saúde.

## Fase 3 — uso no Kcalix

### KCX-CONN-013 — Exibir dados importados com provenance

**Status:** BACKLOG  
**Depende de:** KCX-CONN-012  
**Entrega:** PWA consulta pelo hook/camada existente e mostra origem, tempo e estado do dado.

**Aceite:** nenhum acesso Supabase direto em componente; loading/vazio/erro; mobile 375 px;
registro manual continua funcionando; dado importado pode ser distinguido e excluído.

### KCX-CONN-014 — Reconciliar atividade com treino Kcalix

**Status:** BACKLOG  
**Depende de:** KCX-CONN-013  
**Entrega:** regra testável de sugestão/vínculo sem substituir séries, reps ou cargas.

**Aceite:** tolerância temporal explícita; conflitos pedem confirmação; vínculo reversível;
treinos simultâneos/duplicados testados; Watch complementa, não sobrescreve o Kcalix.

### KCX-CONN-015 — Política de calorias e fonte de verdade

**Status:** BACKLOG  
**Depende de:** KCX-CONN-002, KCX-CONN-013  
**Entrega:** regra única para exibir/usar energia sem dupla contagem.

**Aceite:** distingue ativa/total/estimada; define TDEE versus ajuste por exercício; usuário
vê origem; ausência não é tratada como zero; cenários de dupla fonte têm testes.

### KCX-CONN-016 — Consentimento, exclusão e limites do Coach

**Status:** BACKLOG  
**Depende de:** KCX-CONN-004, KCX-CONN-013  
**Entrega:** controles de consentimento/revogação/exclusão e política de uso pela IA.

**Aceite:** exclusão por usuário testada ponta a ponta; revogar para novos syncs é claro;
Coach recebe somente campos autorizados e necessários; linguagem não faz diagnóstico médico.

## Fase 4 — APK privado e piloto

### KCX-CONN-017 — Release privada, assinatura e atualização

**Status:** BACKLOG  
**Depende de:** KCX-CONN-012  
**Entrega:** APK release assinado e procedimento reproduzível de sideload/update/rollback.

**Aceite:** chave fora do Git e com backup; assinatura consistente permite update; hashes/versionCode
registrados; instalação de fontes desconhecidas explicada; não há auto-update inseguro.

### KCX-CONN-018 — Validação E2E no aparelho real

**Status:** BACKLOG  
**Depende de:** KCX-CONN-013, KCX-CONN-014, KCX-CONN-015, KCX-CONN-017  
**Entrega:** roteiro E2E e relatório em cenários normal, offline, duplicado e permissão revogada.

**Aceite:** atividade conhecida percorre todo o fluxo; valores reconciliados; replay não duplica;
erros são recuperáveis; regressão PWA/build/testes passa.

### KCX-CONN-019 — Revisão de segurança e recuperação

**Status:** BACKLOG  
**Depende de:** KCX-CONN-016, KCX-CONN-018  
**Entrega:** checklist final e correções críticas antes do uso recorrente.

**Aceite:** nenhum segredo/PHI em repo/log; RLS negativo repetido; token/revogação/exclusão
testados; dependências auditadas; riscos residuais aceitos explicitamente.

### KCX-CONN-020 — Piloto e decisão go/no-go

**Status:** BACKLOG  
**Depende de:** KCX-CONN-019  
**Entrega:** relatório de 2–4 semanas comparando baseline manual e métricas definidas.

**Aceite:** apresenta benefícios, falhas e custo de manutenção; decide continuar, ajustar ou
encerrar; somente um `go` libera Issues de background, app unificado ou Play Store.
