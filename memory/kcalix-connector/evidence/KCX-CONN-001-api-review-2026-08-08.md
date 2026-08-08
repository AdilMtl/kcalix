# KCX-CONN-001 — revisão oficial das APIs e do fluxo Samsung

Data da revisão: 2026-08-08
Escopo: documentação oficial Android/Google, documentação oficial Samsung e sample oficial
`android/health-samples`; nenhum dado real foi lido.

## Regra de evidência

Cada conclusão abaixo é classificada como:

- **API OFICIAL** — contrato documentado pelo Android Developers;
- **MAPEAMENTO SAMSUNG** — a Samsung declara que seu app sincroniza o sinal;
- **NÃO COMPROVADO NO APARELHO** — somente a `KCX-CONN-007` pode confirmar presença,
  conteúdo, atraso, origem e qualidade no Watch 5/telefone do piloto.

Documentação de API não comprova que um fabricante publicou um registro. Documentação do
fabricante não comprova o resultado da combinação específica de Watch, telefone, versões e
configuração do usuário.

## Baseline e compatibilidade

| Item | Evidência | Decisão Kcalix |
|---|---|---|
| Biblioteca | A versão estável atual é [`androidx.health.connect:connect-client:1.1.0`](https://developer.android.com/jetpack/androidx/releases/health-connect); existe linha 1.2 alpha | Fixar `1.1.0`; não usar API exclusiva de alpha no piloto |
| Sample | [`HealthConnectSample`](https://github.com/android/health-samples/tree/main/health-connect/HealthConnectSample), pin local `47f0144f6e994f7831a41499843a0f6a9d87cb75`, Apache-2.0, usa `1.1.0-alpha12` | Usar como referência de fluxo, não copiar versão nem escopo didático |
| Disponibilidade | [Health Connect requer Android 9/API 28 ou superior](https://developer.android.com/health-and-fitness/health-connect/availability); Android 14+ integra o módulo ao sistema e Android 13- usa o app da Play Store | Manter `minSdk 26` do app, mas retornar `UNSUPPORTED_OS` em API 26/27 e checar `getSdkStatus()` em API 28+ |
| Perfil de trabalho | A documentação de disponibilidade declara que work profiles não são suportados | Estado explícito de indisponibilidade; não prometer suporte corporativo |
| Histórico | [Leitura de dados de outros produtores é limitada, por padrão, aos 30 dias anteriores à primeira concessão](https://developer.android.com/health-and-fitness/health-connect/read-data) | Janela do diagnóstico limitada a 7 dias; não pedir `READ_HEALTH_DATA_HISTORY` |
| Background | Leitura em background exige permissão adicional | Primeira observação somente foreground; não pedir `READ_HEALTH_DATA_IN_BACKGROUND` |

## Fluxo mínimo Android

Fatos de [`Get started with Health Connect`](https://developer.android.com/health-and-fitness/health-connect/get-started)
e da orientação de [UI de permissões](https://developer.android.com/health-and-fitness/health-connect/ui/permissions):

1. declarar somente as permissões de leitura realmente usadas;
2. declarar em `queries` o provider `com.google.android.apps.healthdata` para a checagem em
   Android 13 e anteriores;
3. disponibilizar a tela de justificativa de privacidade para o fluxo de permissões, incluindo
   o alias exigido no Android 14+;
4. verificar disponibilidade antes de criar o cliente;
5. consultar permissões concedidas antes de toda leitura, pois podem ser revogadas fora do app;
6. aceitar concessão parcial e mostrar quais sinais ficaram indisponíveis;
7. não declarar onboarding iniciado pelo Health Connect até existir uma jornada aprovada que
   realmente o use.

O sample comprova `getSdkStatus`, contrato de permissão e leituras por intervalo. Seus fluxos
de escrita, geração, exclusão, sono, passos, rota e Changes API são rejeitados no primeiro
diagnóstico porque excedem o escopo aprovado.

## Record types e permissões

A tabela combina os [data types oficiais do Health Connect](https://developer.android.com/health-and-fitness/health-connect/data-types)
com o [mapeamento oficial publicado pela Samsung](https://developer.samsung.com/health/blog/en/accessing-samsung-health-data-through-health-connect).

| Record type | Permissão exata | Forma/unidade canônica | Samsung declara sync? | Decisão |
|---|---|---|---|---|
| `ExerciseSessionRecord` | `android.permission.health.READ_EXERCISE` | intervalo; duração derivada em segundos | sim, exercício | INCLUIR |
| `HeartRateRecord` | `android.permission.health.READ_HEART_RATE` | série; BPM | sim, FC do exercício | INCLUIR |
| `DistanceRecord` | `android.permission.health.READ_DISTANCE` | intervalo; metros | sim, distância do exercício | INCLUIR |
| `TotalCaloriesBurnedRecord` | `android.permission.health.READ_TOTAL_CALORIES_BURNED` | intervalo; kcal | sim, calorias do exercício | INCLUIR COM RESTRIÇÃO |
| `BodyFatRecord` | `android.permission.health.READ_BODY_FAT` | instantâneo; percentual | sim, body composition | INCLUIR |
| `WeightRecord` | `android.permission.health.READ_WEIGHT` | instantâneo; kg | sim, body composition/peso | INCLUIR para observar a composição |
| `ActiveCaloriesBurnedRecord` | `android.permission.health.READ_ACTIVE_CALORIES_BURNED` | intervalo; kcal sem basal | não no mapeamento Samsung consultado | EXCLUIR por padrão |

Também ficam excluídos: `BasalMetabolicRateRecord`, altura, passos, sono, FC de repouso,
nutrição, rota, velocidade, sinais médicos e todas as permissões de escrita. A Samsung afirmar
que body composition pode produzir outros tipos não é justificativa suficiente para ampliar
o acesso do piloto.

## Campos e conversões normativas

| Tipo | Campos lidos | Opcionalidade relevante | Saída do contrato |
|---|---|---|---|
| `ExerciseSessionRecord` | `startTime`, `endTime`, `exerciseType`, `metadata`, offsets, `title`, `notes`, `segments`, `laps` | offsets, título e notas podem faltar; listas podem estar vazias | instantes ISO-8601, offsets separados, `durationSeconds`, código bruto + nome conhecido; conteúdo de título/notas não é exportado |
| `HeartRateRecord` | `startTime`, `endTime`, offsets, `samples`, `metadata` | offsets podem faltar; cadência e lacunas variam | cada sample tem `time` e BPM inteiro 1–300; resumo é marcado `DERIVED_LOCAL` |
| `DistanceRecord` | início/fim, offsets, `distance`, `metadata` | offsets podem faltar | `distanceMeters` |
| `TotalCaloriesBurnedRecord` | início/fim, offsets, `energy`, `metadata` | offsets podem faltar | `energyKilocalories`, sem tratar como calorias ativas |
| `BodyFatRecord` | `time`, `zoneOffset`, `percentage`, `metadata` | offset pode faltar | `percentage` |
| `WeightRecord` | `time`, `zoneOffset`, `weight`, `metadata` | offset pode faltar | `weightKilograms` |

Referências de classe: [`ExerciseSessionRecord`](https://developer.android.com/reference/androidx/health/connect/client/records/ExerciseSessionRecord),
[`HeartRateRecord`](https://developer.android.com/reference/androidx/health/connect/client/records/HeartRateRecord),
[`HeartRateRecord.Sample`](https://developer.android.com/reference/kotlin/androidx/health/connect/client/records/HeartRateRecord.Sample),
[`DistanceRecord`](https://developer.android.com/reference/androidx/health/connect/client/records/DistanceRecord),
[`TotalCaloriesBurnedRecord`](https://developer.android.com/reference/androidx/health/connect/client/records/TotalCaloriesBurnedRecord),
[`BodyFatRecord`](https://developer.android.com/reference/androidx/health/connect/client/records/BodyFatRecord) e
[`WeightRecord`](https://developer.android.com/reference/androidx/health/connect/client/records/WeightRecord).

Campos comuns de [`Metadata`](https://developer.android.com/reference/androidx/health/connect/client/records/metadata/Metadata):
`id`, `dataOrigin`, `lastModifiedTime`, `clientRecordId`, `clientRecordVersion`,
`recordingMethod` e `device`. Presença de `device` ou origem Samsung não prova que o dado foi
medido no Watch; o contrato registra o fato observado sem elevá-lo a conclusão.

## Janela, paginação e correlação

- A observação usa `Instant` e `TimeRangeFilter.between(start, end)`, cuja semântica oficial é
  início inclusivo e fim exclusivo: `[start, end)`.
- Cada record type é consultado separadamente, em ordem ascendente, `pageSize = 1000`, até
  `pageToken == null`. A documentação alerta para `IllegalStateException` em rate limit; uma
  consulta interrompida fica `complete: false`, nunca silenciosamente completa.
- A primeira observação não filtra por `DataOrigin`. Pré-filtrar por um package name Samsung
  poderia ocultar registros ou mudanças de versão. A origem observada é preservada/anonimizada.
- O sample lê FC e outras métricas dentro do intervalo da sessão e com a mesma origem. Isso é
  correlação temporal, não chave estrangeira. Toda relação sessão–métrica começa `INFERRED`.
- O comportamento de registros que atravessam exatamente o limite da janela entra no roteiro
  de QA; não será inventada uma regra de overlap antes da evidência executável.

## O que a Samsung realmente afirma

Segundo o [FAQ oficial](https://developer.samsung.com/health/health-connect-faq.html), a
Samsung Health suporta Health Connect desde a versão 6.22.5; dados do Galaxy Watch chegam ao
Health Connect indiretamente por Watch → Samsung Health no telefone → Health Connect, e o
tempo de sincronização segue a política da Samsung. Portanto, atualização imediata não é um
requisito válido.

A Samsung também documenta [leitura de composição corporal do Galaxy Watch via Health Connect](https://developer.samsung.com/health/blog/en/health/blog/reading-body-composition-data-with-galaxy-watch-via-health-connect-api),
incluindo `BodyFatRecord` e `WeightRecord`. Isso torna os tipos candidatos reais, mas a presença
e a proveniência no Watch 5 do piloto continuam **NÃO COMPROVADAS NO APARELHO**.

## Parecer por trilha

| Trilha | Parecer | Consequência |
|---|---|---|
| Android/Health Connect | APTO PARA ESPECIFICAR | stable 1.1.0, runtime guard API 28+, seis leituras e paginação completa |
| Dados/reconciliação | APTO PARA OBSERVAÇÃO | serialização tipada; relações apenas inferidas; match final adiado |
| Segurança/privacidade | APTO CONDICIONAL | perfis definidos, sem rede; dado real continua bloqueado até `KCX-CONN-004`, `006` e implementação revisada da `007` |
| Produto/fitness | APTO COM UMA DECISÃO PENDENTE | três casos mantidos; política matemática de zonas de FC ainda pertence ao PRD |
| QA | PROTOCOLO DEFINIDO, NÃO EXECUTADO | fixtures sintéticas agora; aparelho somente na `KCX-CONN-007` |

## Decisões que não devem ser assumidas

- Não chamar `TotalCaloriesBurnedRecord` de energia ativa.
- Não pedir `ActiveCaloriesBurnedRecord` porque o tipo existe na API.
- Não afirmar que `WeightRecord` veio da balança/Watch sem olhar metadata e comportamento real.
- Não afirmar que registros no mesmo intervalo são a mesma sessão.
- Não calcular zonas por idade silenciosamente. O contrato de observação preserva amostras no
  perfil privado, mas `hr_zone_seconds` só nasce depois de uma política versionada e aprovada.
- Não prometer export atomicamente apagável em qualquer DocumentsProvider. O arquivo final só
  será aceito se o JSON e seu checksum validarem; exclusão de parcial é best effort e qualquer
  resíduo inválido deve ser informado ao usuário.
