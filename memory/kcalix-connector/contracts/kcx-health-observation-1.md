# `kcx-health-observation/1` — contrato de observação

Status: APPROVED em `KCX-CONN-001` por revisão técnica e testes de contrato
Schema executável: [`kcx-health-observation-1.schema.json`](kcx-health-observation-1.schema.json)

## Finalidade

Registrar o que o Health Connect expôs em uma janela curta para diagnosticar disponibilidade,
campos, proveniência, paginação e relações temporais. O contrato não é o modelo canônico de
ingestão, não declara match e não autoriza upload.

## Invariantes

- JSON UTF-8, schema version exata `kcx-health-observation/1`.
- `window` usa `Instant` e semântica `[start, end)`; duração máxima de 7 dias.
- Cada um dos seis record types é consultado em ordem ascendente, páginas de 1000, até token
  nulo ou erro explícito.
- `complete: false` em uma query obriga `completion.state: PARTIAL` e um item em `errors`.
- Nenhum filtro de origem é aplicado na primeira observação.
- Código desconhecido é preservado numericamente e recebe nome `UNKNOWN_TO_CONNECTOR`.
- Conversões são determinísticas: metros, quilocalorias, percentual, quilogramas, BPM e
  segundos. O valor original tipado do Health Connect nunca é obtido por `toString()`.
- Título e notas de exercício nunca têm o conteúdo exportado; apenas presença/ausência.
- Rota não é lida e permanece `routePolicy: EXCLUDED`.
- Toda relação entre sessão, FC, distância, energia, body fat e peso é `INFERRED` no piloto,
  salvo se uma API futura fornecer vínculo explícito documentado.
- `confidence` não recebe número antes da evidência da `KCX-CONN-007`.

## Record types normativos

| `recordType` | `shape` | `payload.kind` | Valores canônicos |
|---|---|---|---|
| `ExerciseSessionRecord` | `INTERVAL` | `EXERCISE_SESSION` | tipo bruto/nome conhecido e duração; contagens, sem texto livre |
| `HeartRateRecord` | `SERIES` | `HEART_RATE` | amostras BPM somente no perfil privado; resumo local identificado |
| `DistanceRecord` | `INTERVAL` | `DISTANCE` | `distanceMeters` |
| `TotalCaloriesBurnedRecord` | `INTERVAL` | `TOTAL_ENERGY` | `energyKilocalories`, semântica inclui ativo + basal |
| `BodyFatRecord` | `INSTANTANEOUS` | `BODY_FAT` | `percentage` |
| `WeightRecord` | `INSTANTANEOUS` | `WEIGHT` | `weightKilograms` |

`ActiveCaloriesBurnedRecord` não pertence à versão 1. A publicação pela Samsung não foi
comprovada e a permissão adicional não é necessária aos três casos aprovados.

## Perfil `STRUCTURAL`

Perfil padrão e único candidato a compartilhamento para revisão técnica:

- `origin.identityMode = HASHED_PER_EXPORT`;
- `metadata.sourceIdMode = HASHED_PER_EXPORT` ou `OMITTED`;
- timestamps recebem o mesmo deslocamento aleatório dentro do export, preservando ordem,
  duração, sobreposição e offsets relativos;
- fabricante, modelo, package name, IDs brutos, `clientRecordId` e valores de saúde são omitidos;
- `HeartRateRecord` contém contagem e estrutura de amostragem, nunca BPM;
- distância, energia, body fat e peso usam `valueMode = REDACTED` e não incluem o valor;
- tipo de exercício, presença de campo, unidade, recording method, contagens e relações são
  preservados porque são o objetivo do diagnóstico;
- o hash é estável apenas dentro do export e não permite correlacionar exports diferentes.

Mesmo esse perfil pode revelar horários relativos e tipo de atividade. Compartilhamento é
manual, consciente e nunca automático.

## Perfil `PRIVATE_FULL`

Perfil para comparação local, com aviso explícito de dado de saúde sensível:

- origem, instantes, valores e amostras de FC podem ser preservados;
- IDs e metadata de aparelho entram apenas quando necessários para avaliar update/proveniência;
- conteúdo de título/notas continua proibido;
- nenhuma zona de FC é calculada nesta versão;
- nunca entra em Git, logs, analytics, crash report, anexo automático, clipboard ou rede;
- o usuário escolhe o destino e é responsável pelo documento após a criação.

O perfil privado não está liberado para dado real apenas pela aprovação deste contrato. A
execução ainda depende de `KCX-CONN-004`, `KCX-CONN-006` e revisão da implementação da
`KCX-CONN-007`.

## Metadata

| Health Connect | Contrato | Regra de privacidade |
|---|---|---|
| `Metadata.id` | `sourceId` | hash/omitido no estrutural; bruto opcional no privado |
| `dataOrigin` | `dataOriginRef` + `origins` | hash no estrutural; package name no privado |
| `lastModifiedTime` | mesmo nome | deslocado no estrutural; real no privado |
| `clientRecordId` | presença + valor opcional | valor nunca no estrutural |
| `clientRecordVersion` | mesmo nome | preservar; não assumir semântica do produtor |
| `recordingMethod` | código + nome | preservar código mesmo desconhecido |
| `device` | `devicePresent` + objeto opcional | apenas presença no estrutural; detalhes opcionais no privado |

`devicePresent`, manufacturer/model ou origin não provam, isoladamente, que a medição veio do
Watch. Essa conclusão fica separada como evidência de aparelho.

## Frequência cardíaca e zonas

O Health Connect entrega amostras com instante e BPM; não entrega a política de zonas do
Kcalix. O perfil privado pode gerar mínima, máxima e média localmente e deve marcar
`DERIVED_LOCAL_FROM_EXPORTED_SAMPLES`.

`hr_zone_seconds` não faz parte deste contrato. A política recomendada para o PRD é usar um
HR máximo informado/validado pelo usuário e uma tabela versionada, sem estimativa silenciosa
por idade. Até essa decisão ser aprovada, a ausência de zonas é comportamento correto.

## Arquivo local e falhas

Fluxo obrigatório para a futura `KCX-CONN-007`:

1. serializar e validar integralmente em arquivo privado de `noBackupFilesDir`;
2. abrir `ACTION_CREATE_DOCUMENT` somente após o temporário estar completo;
3. se o usuário cancelar, apagar o temporário e não criar destino;
4. copiar para a URI escolhida, fechar e reler para validar JSON/schema;
5. em erro, apagar temporário e tentar excluir o destino pelo provider;
6. se o provider não suportar exclusão ou ela falhar, mostrar nome/local e instrução explícita
   de remoção; jamais exibir sucesso;
7. apagar o temporário imediatamente após sucesso ou falha.

O Storage Access Framework não garante rename/delete atômico em todos os provedores. Por isso,
o aceite verificável é: arquivo parcial nunca valida como `completion.state: COMPLETE`, falha
nunca é mostrada como sucesso e qualquer resíduo é excluído quando suportado ou denunciado ao
usuário. Não será prometida atomicidade inexistente.

## Fixtures

- [`../fixtures/kcx-health-observation-1-structural.synthetic.json`](../fixtures/kcx-health-observation-1-structural.synthetic.json)
- [`../fixtures/kcx-health-observation-1-private-full.synthetic.json`](../fixtures/kcx-health-observation-1-private-full.synthetic.json)

Ambas usam dados declaradamente sintéticos e não representam o usuário, o Watch ou a Samsung.
