# Registro de sessão — KCX-CONN-001 / consolidação de decisões

Data: 2026-07-27  
Issue ativa: `KCX-CONN-001`  
Modo: Especificar  
Fase e gates: Fase 0 / preparação de G1 e G2  
Estado final da Issue: `DRAFTING`  
Estado final da spec: `DRAFT`  
Código liberado: não

## Resultado observável

As decisões de produto que já existiam no handoff foram promovidas a contexto canônico da
spec e do backlog, sem repetir a entrevista e sem antecipar fatos que dependem do aparelho.

## Decisões consolidadas

- Três casos do piloto: cardio sem redigitação, musculação enriquecida e body fat BIA.
- Kcalix continua fonte de exercícios, séries, repetições, cargas, alimentação e água.
- Watch vinculado é candidato a fonte de horário, duração, distância, resumos de FC e
  estimativa calórica da sessão.
- Match usa tipo, intervalo, duração e sobreposição; nunca apenas a data.
- Vínculo/importação começa como sugestão, exige confirmação no piloto e é reversível.
- Watch e Kcalix nunca têm suas calorias somadas para a mesma sessão.
- `TotalCaloriesBurnedRecord` não altera automaticamente o saldo energético.
- FC bruta não vai para a nuvem; somente resumos aprovados.
- Body fat BIA, JP7 e manual permanecem métodos distintos.
- Passos, sono e FC de repouso foram adiados.

## Ajustes de sequência

- `KCX-CONN-003` passou a ratificar ou rejeitar a base Kotlin/Compose já existente, em vez de
  fingir uma escolha arquitetural começando do zero.
- O protocolo da `KCX-CONN-007` passou a refletir apenas records incluídos ou condicionais e
  ganhou `BodyFatRecord`.
- Um projeto de referência separado continua ausente do workspace. O
  `android/health-samples/HealthConnectSample`, commit
  `47f0144f6e994f7831a41499843a0f6a9d87cb75`, Apache-2.0, foi registrado como baseline
  oficial.

## Explicitamente não realizado

- Nenhum arquivo Kotlin, Gradle, manifesto ou recurso Android foi alterado.
- Nenhuma permissão Health Connect ou `INTERNET` foi adicionada.
- Nenhum dado real foi lido, exportado, persistido ou enviado.
- Nenhuma migration, Edge Function, autenticação ou sincronização foi criada.
- A spec não foi marcada `APPROVED` e a Issue não foi marcada `READY` ou `DONE`.

## Itens pendentes

- Concluir as cinco trilhas da revisão especializada; a revisão inicial do baseline está
  registrada.
- Definir a política exata das zonas de FC.
- Aprovar schema e perfis do `kcx-health-observation/1`.
- Definir fixtures sintéticas e roteiro final da `KCX-CONN-007`.
- Deixar campos reais, disponibilidade Samsung e tolerâncias de match para a evidência da
  `KCX-CONN-007`.

## Próxima ação exata

Fechar a tabela detalhada de campos/unidades/opcionalidade e o schema
`kcx-health-observation/1`, produzir fixtures sintéticas e emitir o parecer de segurança antes
de solicitar aprovação da spec.
