# KCX-CONN-001 — roteiro de revisão do projeto de referência

Status: DRAFT — executar quando o projeto de referência estiver disponível
Issue: `KCX-CONN-001`
Objetivo: determinar, por evidência, o que pode ser adotado, adaptado ou deve ser rejeitado
antes de o Kcalix Connector ler dados reais do Health Connect.

## Responsabilidade do usuário

O usuário não precisa interpretar código, schemas, record types, unidades ou riscos. Sua
responsabilidade nesta revisão é:

1. disponibilizar o projeto de referência e informar seu caminho;
2. responder decisões de produto apresentadas em linguagem comum;
3. executar no aparelho apenas os passos físicos orientados pelo QA;
4. aprovar ou rejeitar a recomendação consolidada.

Toda análise técnica, comparação com a documentação oficial e tradução das consequências
para o produto pertence aos revisores abaixo.

## Entradas obrigatórias

- Projeto de referência completo, incluindo licença, README, lockfiles e histórico/versão
  quando disponíveis.
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

O formato canônico será JSON versionado. Um relatório HTML pode ser derivado do JSON, mas não
o substitui.

Perfis:

- `STRUCTURAL`: compartilhável para revisão; IDs com hash por export, timestamps deslocados de
  forma consistente, valores sensíveis removidos ou agrupados, relações e durações preservadas.
- `PRIVATE_FULL`: valores necessários para comparação privada no aparelho/computador; nunca
  commitado, anexado automaticamente ou enviado pela rede.

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

Cada record deve declarar `recordType`, identidade anonimizada, metadata permitida, tempo,
offset, unidade, campos presentes, campos ausentes e payload específico versionado.
`relationships` deve separar `EXPLICIT` de `INFERRED`, incluindo regra e confiança.

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
