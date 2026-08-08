# KCX-CONN-001 — roteiro de revisão do projeto de referência

Status: APROVADO TECNICAMENTE — validação no aparelho permanece pendente para `KCX-CONN-007`
Issue: `KCX-CONN-001`
Objetivo: determinar, por evidência, o que pode ser adotado, adaptado ou deve ser rejeitado
antes de o Kcalix Connector ler dados reais do Health Connect.

## Baseline técnico registrado em 2026-07-27

Como nenhum projeto separado foi encontrado no workspace, a referência aprovada para esta
revisão é o sample oficial `HealthConnectSample` do repositório
[`android/health-samples`](https://github.com/android/health-samples/tree/main/health-connect/HealthConnectSample),
complementado pela documentação oficial do Android Developers.

| Propriedade | Valor registrado |
|---|---|
| Origem | Google/Android, repositório público oficial `android/health-samples` |
| Caminho | `health-connect/HealthConnectSample` |
| Versão fixada | commit `47f0144f6e994f7831a41499843a0f6a9d87cb75`, de 2025-02-27 |
| Licença | Apache License 2.0 |
| Cliente no sample | `androidx.health.connect:connect-client:1.1.0-alpha12` |
| Baseline do piloto | API estável `androidx.health.connect:connect-client:1.1.0`, salvo necessidade posterior comprovada |
| Ambiente do sample | `minSdk 26`, `compileSdk 35`, `targetSdk 34`, Java 17, Kotlin/Compose |
| Ambiente Kcalix atual | `minSdk 26`, `compileSdk 36.1`, `targetSdk 36`, Java 17, Kotlin/Compose |
| Data de consulta | 2026-08-08 |

O commit pinado representa a última alteração específica encontrada no diretório do sample.
Não haverá cópia de código nesta Issue. O sample fornece evidência de fluxo; a documentação
oficial vigente define o contrato da API quando houver divergência.

## Resultado da revisão inicial

| Trilha | O que o baseline comprova | Decisão | O que ainda falta |
|---|---|---|---|
| Android/Health Connect | disponibilidade, solicitação e rechecagem de permissões, leitura por janela, agregação e Changes API | ADAPTAR | desenhar paginação explícita, permissões mínimas e estados Kcalix |
| Dados/reconciliação | sessão e métricas são lidas separadamente; o sample correlaciona por intervalo e `dataOrigin` | ADAPTAR | serializador versionado e confirmação do formato Samsung no aparelho |
| Segurança/privacidade | o sample é didático e inclui leitura, escrita, exclusão e escopo amplo | REJEITAR COMO POLÍTICA | manter somente leitura, sem Internet, logs de saúde, backup ou export automático |
| Produto/fitness | exercício, FC, distância e energia sustentam cardio e musculação enriquecida | ADAPTAR | limitar aos sinais aprovados e manter calorias sem efeito automático no saldo |
| QA | estados de disponibilidade/permissão e Health Connect Toolbox ajudam em testes sintéticos | ADOTAR PARCIALMENTE | validar Samsung Health, revogação, duplicidade, updates e BIA no aparelho |

### Matriz de componentes

| Componente/contrato | Evidência oficial/projeto | Decisão | Adaptação Kcalix | Risco |
|---|---|---|---|---|
| `HealthConnectClient` e disponibilidade | sample + documentação oficial | ADOTAR | encapsular fora da UI e expor estados recuperáveis | baixo |
| Permissões em runtime | sample rechecando permissões antes do uso | ADOTAR | solicitar apenas leituras aprovadas e aceitar concessão parcial | médio |
| Leitura por intervalo | `ReadRecordsRequest` no sample | ADAPTAR | janela curta, ordenação e paginação completa ou erro parcial visível | médio |
| Associação sessão ↔ métricas | mesmo intervalo + `dataOrigin` no sample | ADAPTAR | registrar relação como `INFERRED`, nunca como vínculo garantido | alto |
| Agregação de FC/distância/energia | sample e guia oficial de workouts | ADAPTAR | preservar origem e ausência; enviar somente resumo de FC à nuvem no futuro | médio |
| Changes API | sample percorre mudanças e renova token expirado | ADAPTAR FUTURAMENTE | fora do primeiro export; necessário antes de sync incremental | médio |
| Escrita, geração e exclusão de dados | recursos didáticos do sample | REJEITAR | Connector piloto permanece somente leitura | alto |
| Sono, passos, rota e velocidade | recursos adicionais do sample | REJEITAR NO PILOTO | não declarar permissões nem incluir no contrato atual | baixo |
| `BodyFatRecord` | API oficial + mapeamento oficial Samsung de body composition | ADAPTAR | incluir; validar publicação/proveniência no aparelho na `KCX-CONN-007` | alto |
| `WeightRecord` | API oficial + mapeamento oficial Samsung de body composition | ADAPTAR | observar junto de BIA, sem atribuir ao Watch por coincidência | alto |
| `ActiveCaloriesBurnedRecord` | tipo oficial; ausente no mapeamento Samsung consultado | REJEITAR NA V1 | não declarar permissão | baixo |
| Export `kcx-health-observation/1` | requisito próprio do Kcalix; ausente no sample | CRIAR | JSON tipado, perfis `STRUCTURAL` e `PRIVATE_FULL`, sem `toString()` | alto |

## Conclusão técnica

O baseline é **apto como referência técnica**, mas **não é apto para cópia integral nem libera
teste com dados reais**. A base Kotlin/Compose atual é compatível com o padrão oficial e não
precisa ser substituída nesta Issue. Schema, campos, unidades, perfis e fixtures sintéticas
foram aprovados tecnicamente em 2026-08-08. A Issue está concluída, mas dado real continua
bloqueado por `KCX-CONN-004`, `KCX-CONN-006` e pela implementação revisada da
`KCX-CONN-007`.

A matriz factual completa está em
[`../evidence/KCX-CONN-001-api-review-2026-08-08.md`](../evidence/KCX-CONN-001-api-review-2026-08-08.md).

## Responsabilidade do usuário

O usuário não precisa interpretar código, schemas, record types, unidades ou riscos. Como o
baseline oficial já foi registrado, sua responsabilidade restante nesta revisão é:

1. responder decisões de produto apresentadas em linguagem comum;
2. executar no aparelho apenas os passos físicos orientados pelo QA;
3. aprovar ou rejeitar a recomendação consolidada.

Toda análise técnica, comparação com a documentação oficial e tradução das consequências
para o produto pertence aos revisores abaixo.

## Entradas obrigatórias

- Baseline oficial pinado acima, incluindo licença, README, build e histórico/versão.
- Código atual em `connector/android/`.
- `HANDOFF_DISCOVERY_PRODUTO_2026-07-23.md`.
- Spec `specs/KCX-CONN-001.md`.
- Documentação oficial vigente do Android Health Connect para:
  disponibilidade, data types, permissões, leitura, paginação, metadata, workouts e Changes.
- Versões instaladas, anotadas sem identificadores pessoais: Android, Samsung Health,
  Health Connect e software do Watch.

Documentação oficial e código observado são evidência. README de terceiros, comentário,
`toString()` de objeto ou exemplo sem versão são apenas pistas.

## Ordem obrigatória da revisão

1. Registrar origem, licença, commit/tag e versões do projeto de referência.
2. Mapear módulos, dependências e fluxo de dados do projeto.
3. Comparar cada uso de Health Connect com a documentação oficial vigente.
4. Comparar o modelo de dados do projeto com os casos de uso aprovados do Kcalix.
5. Revisar permissões, retenção, logs, exportação e superfícies de vazamento.
6. Definir o contrato do export diagnóstico antes de escrever serializers.
7. Produzir fixtures sintéticas e critérios de teste.
8. Emitir recomendação consolidada: `ADOTAR`, `ADAPTAR`, `REJEITAR` ou `NÃO COMPROVADO`.

Nenhum revisor está autorizado a copiar código do projeto antes de confirmar licença,
compatibilidade, segurança e aderência à spec.

## Trilha 1 — Android e Health Connect

Responsável: especialista Android/Health Connect.

Verificar:

- biblioteca e versão exatas (`androidx.health.connect:connect-client`);
- `minSdk`, `targetSdk`, disponibilidade do Health Connect e comportamento por versão Android;
- record types realmente lidos e nomes exatos das permissões;
- janela temporal, limite histórico, ordenação, `pageSize` e `pageToken`;
- tratamento de permissão negada, parcial e revogada;
- campos obrigatórios/opcionais de cada `Record`;
- `Metadata.id`, `clientRecordId`, `clientRecordVersion`, `lastModifiedTime`,
  `dataOrigin`, `device` e `recordingMethod`;
- relação real entre `ExerciseSessionRecord` e registros de FC, distância e energia;
- updates/deletes via Changes API e expiração de token;
- uso indevido de `toString()`, reflection ou serialização não versionada;
- qualquer leitura de rota, background ou histórico amplo fora do MVP.

Entregar:

- tabela `record type → permissão → campos → unidade → origem → opcionalidade`;
- diferenças entre projeto, API oficial e necessidade do Kcalix;
- riscos por versão/feature flag;
- recomendação por componente.

## Trilha 2 — Dados, serialização e reconciliação

Responsável: especialista de dados/Kcalix.

Verificar:

- se o projeto preserva o objeto tipado ou perde campos na serialização;
- enums/códigos de exercício e estratégia para valores desconhecidos;
- unidades originais e conversões;
- `Instant`, `ZoneOffset`, timezone do usuário e duração derivada;
- IDs, versões e provenance necessários para deduplicação;
- registros sobrepostos, duplicados ou corrigidos;
- se FC, distância e energia podem apenas ser correlacionadas por janela/origem ou se existe
  vínculo explícito;
- semântica de `TotalCaloriesBurnedRecord` versus `ActiveCaloriesBurnedRecord`;
- ausência de vínculo explícito entre `BodyFatRecord` e `WeightRecord`;
- quais fatos podem ser exportados e quais relações continuam hipóteses.

Entregar:

- schema proposto de `observation.json`;
- tabela `campo observado → campo canônico candidato → transformação → confiança`;
- lista de hipóteses que só o aparelho real pode confirmar;
- casos ambíguos que sempre exigirão confirmação do usuário.

Não definir pesos/tolerâncias finais de match antes de existir evidência real da `KCX-CONN-007`.

## Trilha 3 — Segurança e privacidade

Responsável: especialista mobile/security e privacidade.

Verificar:

- existência de `INTERNET`, analytics, crash reporting, backup ou compartilhamento automático;
- persistência de registros, caches, banco local, logs e arquivos temporários;
- exposição de IDs, timestamps, conta, package names, aparelho e valores de saúde;
- uso de Storage Access Framework e controle explícito do destino;
- exclusão/revogação do export;
- comportamento em celular perdido, app em background e falha durante gravação;
- risco de dados reais entrarem no Git, logs, testes ou anexos;
- dependências com telemetria ou permissões excessivas.

Entregar:

- mapa de fluxo local do dado;
- lista de dados permitidos/proibidos por perfil de export;
- ameaças, severidade, mitigação e risco residual;
- parecer `APTO` ou `NÃO APTO` para teste no aparelho.

Regra mínima: nenhum teste real começa sem parecer `APTO`.

## Trilha 4 — Produto e domínio fitness

Responsável: especialista produto/fitness com revisão Kcalix.

Verificar:

- se cada sinal reduz uma entrada manual ou melhora uma decisão concreta;
- separação entre musculação estruturada no Kcalix e sessão fisiológica do Watch;
- cardio independente versus cardio dentro do treino do dia;
- linguagem não médica e limites de interpretação de FC, zonas, kcal e BIA;
- origem visível e reversibilidade;
- se a prévia é compreensível sem expor detalhes técnicos ao usuário.

Entregar:

- recomendação de no máximo três casos de uso;
- fonte de verdade por campo;
- conflitos que o produto deve mostrar;
- critérios mensuráveis para o piloto.

## Trilha 5 — QA no aparelho real

Responsável: especialista QA Android, com o usuário executando apenas ações orientadas.

Planejar:

- estado sem Health Connect e incompatível;
- permissão negada, parcial, concedida e revogada;
- janela vazia;
- uma musculação conhecida e um cardio conhecido;
- duas sessões semelhantes no mesmo dia;
- antes/depois da sincronização Samsung Health → Health Connect;
- atraso, duplicidade, sobreposição, update e delete quando reproduzíveis;
- export cancelado, concluído e repetido;
- comparação privada com Samsung Health sem screenshot ou valor real versionado.

Entregar:

- roteiro passo a passo;
- matriz anonimizada `disponível | indisponível | não testado`;
- evidência sem valores pessoais;
- lista de itens que permanecem não comprovados.

## Contrato mínimo do export diagnóstico

O formato normativo e seu schema executável estão em
[`../contracts/kcx-health-observation-1.md`](../contracts/kcx-health-observation-1.md) e
[`../contracts/kcx-health-observation-1.schema.json`](../contracts/kcx-health-observation-1.schema.json).
Um relatório HTML pode ser derivado do JSON, mas não o substitui.

Perfis:

- `STRUCTURAL`: candidato compartilhável para revisão; IDs/origens com hash por export,
  timestamps deslocados de forma consistente, valores de saúde removidos, relações e durações
  preservadas.
- `PRIVATE_FULL`: valores necessários para comparação privada no aparelho/computador; nunca
  commitado, anexado automaticamente ou enviado pela rede; título/notas continuam omitidos.

Envelope mínimo:

```json
{
  "schemaVersion": "kcx-health-observation/1",
  "profile": "STRUCTURAL",
  "environment": {
    "connectorVersion": "string",
    "healthConnectClientVersion": "string",
    "androidVersion": "string",
    "timezone": "IANA"
  },
  "window": {
    "start": "ISO-8601",
    "end": "ISO-8601"
  },
  "permissions": [],
  "records": [],
  "relationships": [],
  "warnings": [],
  "errors": []
}
```

Cada record declara `recordType`, identidade por perfil, metadata permitida, tempo, offset,
unidade, campos presentes, campos ausentes e payload específico versionado. `relationships`
separa `EXPLICIT` de `INFERRED`; a confiança permanece `NOT_SCORED_BEFORE_KCX-CONN-007`.

Fixtures aprováveis, integralmente sintéticas:

- [`../fixtures/kcx-health-observation-1-structural.synthetic.json`](../fixtures/kcx-health-observation-1-structural.synthetic.json)
- [`../fixtures/kcx-health-observation-1-private-full.synthetic.json`](../fixtures/kcx-health-observation-1-private-full.synthetic.json)

## Parecer de segurança desta Issue

**APTO CONDICIONAL PARA IMPLEMENTAR O SPIKE; NÃO APTO AINDA PARA DADO REAL.**

O Storage Access Framework permite destino escolhido pelo usuário, mas providers variam em
suporte a delete/rename e não oferecem atomicidade universal. A futura implementação deve
gerar/validar em `noBackupFilesDir`, abrir `ACTION_CREATE_DOCUMENT` só depois, reler o destino
e jamais aceitar arquivo truncado como `COMPLETE`. Resíduo que o provider não permita excluir
deve ser mostrado ao usuário com instrução de remoção. Esse comportamento substitui o critério
irreal de prometer que qualquer provider sempre apagará um parcial.

## Matriz de decisão final

| Item avaliado | Evidência oficial | Evidência no projeto | Evidência no aparelho | Decisão | Adaptação necessária | Risco |
|---|---|---|---|---|---|---|
| componente/contrato | link/versão | arquivo/linha | teste | ADOTAR/ADAPTAR/REJEITAR/NÃO COMPROVADO | descrição | baixo/médio/alto |

Uma recomendação sem as três colunas de evidência aplicáveis não libera implementação.

## Critérios de saída

- Todas as cinco trilhas emitiram parecer ou registraram bloqueio.
- Licença e versão do projeto foram identificadas.
- Diferenças projeto × API oficial × Kcalix estão documentadas.
- Schema do export e perfis de privacidade foram aprovados.
- Permissões mínimas e record types foram aprovados.
- Fixtures sintéticas e roteiro no aparelho foram definidos.
- Nenhum código ou dado de saúde real foi copiado para o repositório.
- A próxima Issue de implementação possui spec própria `APPROVED`.
