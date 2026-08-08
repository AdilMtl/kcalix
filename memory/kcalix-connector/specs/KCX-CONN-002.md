# KCX-CONN-002 — aprovar PRD do piloto privado

Status: APPROVED
Issue pai: `KCX-CONN-002`
Fase e gate: Fase 0 / G1 — Valor
Responsável da decisão: proprietário no go/no-go do piloto; revisão técnica do Connector nas métricas e critérios
Última atualização: 2026-08-08

## Decisão entregue

O piloto privado avaliará, durante 2–4 semanas, cardio sem redigitação, musculação enriquecida
e body fat BIA por métricas de automação correta, esforço de correção, confiabilidade e valor
percebido, sem ampliar o acesso a dados nem antecipar integração técnica.

## Contexto comprovado

- `KCX-CONN-001` está `DONE` e sua spec está `APPROVED`.
- O usuário registra exercícios, séries, repetições, cargas e alimentação no Kcalix.
- Cardio é iniciado separadamente no Watch e hoje exige redigitação no Kcalix.
- A sessão contínua de musculação no Watch pode enriquecer, mas nunca substituir, o treino
  estruturado do Kcalix.
- A transferência manual de body fat BIA reduz a frequência de acompanhamento.
- Os seis record types e permissões candidatos foram aprovados apenas como contrato de
  observação; disponibilidade e qualidade reais continuam não comprovadas até `KCX-CONN-007`.
- Passos, sono, FC de repouso, nutrição Samsung, escrita, background, Play Store e Coach
  automático foram adiados explicitamente.
- O baseline quantitativo ainda não foi medido. O PRD define como medi-lo sem inventar valor.

## Escopo

### Incluído

- PRD do piloto privado e seus três casos de uso prioritários.
- Jornada atual, resultado desejado e fonte de verdade por caso.
- Baseline manual observável por 7 dias.
- Métricas do piloto de 2–4 semanas e critérios `GO`, `ADJUST` e `NO-GO`.
- Política de zonas de FC `kcx-hr-zones/1` sem estimativa silenciosa por idade.
- Responsabilidades do agente/revisor e do proprietário do produto.

### Não incluído

- Arquitetura Kotlin/Compose versus Capacitor; pertence à `KCX-CONN-003`.
- Threat model, retenção e exclusão detalhados; pertencem à `KCX-CONN-004`.
- Permissões, leitura, export real e matriz do aparelho; pertencem às Issues `006` e `007`.
- Modelo canônico, deduplicação, backend, autenticação, sincronização ou alterações na PWA.
- APK, distribuição, Play Store, background, Wear OS direto ou produto médico.
- Pesos e tolerâncias finais de match antes da evidência da `KCX-CONN-007`.

## Fluxo do usuário e estados

### Baseline manual

Durante 7 dias representativos, o proprietário registra sem Connector:

1. quantas sessões de cardio exigiram tipo e minutos digitados no Kcalix;
2. quanto tempo aproximado gastou por registro ou correção;
3. quantas sessões de musculação tiveram duração/FC consultadas separadamente no Samsung
   Health sem vínculo no Kcalix;
4. quantas medições BIA foram realizadas e quantas foram transferidas manualmente;
5. quais registros deixaram de ser feitos por fricção.

Ausência de evento é `não ocorreu`; ausência de medição do baseline é `não medido`, nunca zero.

### Piloto

1. O usuário termina uma atividade ou medição e aciona sincronização manual.
2. O Connector apresenta sugestões locais/importadas com origem explícita.
3. O usuário confirma, corrige ou rejeita cada vínculo/importação.
4. O Kcalix preserva o registro estruturado e mostra a provenance.
5. O piloto registra apenas contagens, estados, duração operacional e necessidade de correção.
6. Ao final de 2–4 semanas, um relatório compara piloto e baseline e recomenda continuidade.

Estados obrigatórios para as implementações posteriores: indisponível, sem permissão, parcial,
sem dado, sugestão, confirmado, corrigido, rejeitado, duplicado evitado, origem atualizada,
offline, retry, revogado e excluído. Esta Issue apenas define o comportamento esperado.

## Dados e proveniência

| Caso | Sinais mínimos candidatos | Decisão habilitada | Fonte de verdade |
|---|---|---|---|
| Cardio | tipo, início/fim, duração, distância opcional, FC e kcal total identificada | eliminar redigitação e confirmar a sessão correta | Watch para resumo confirmado; Kcalix para registro manual/fallback |
| Musculação | início/fim, duração, FC e kcal total identificada | enriquecer o treino estruturado | Kcalix para exercícios/séries/reps/cargas; Watch para resumo confirmado |
| Body fat BIA | percentual, horário, origem e peso associado quando comprovado | registrar tendência do mesmo método | série `Galaxy Watch BIA`, separada de JP7/manual |

`TotalCaloriesBurnedRecord` permanece estimativa total, não energia ativa. Nenhuma métrica do
piloto autoriza somar Watch + Kcalix nem alterar automaticamente meta ou saldo alimentar.

As métricas do piloto não armazenam valores brutos de saúde: apenas contagens de eventos,
estado de reconciliação, tempo operacional, presença/ausência de sinal e resposta de valor.

## Permissões

N/A para implementação: a Issue é documental e não altera o manifesto.

O PRD herda como teto, não como autorização de código, as seis leituras aprovadas na 001:

- `android.permission.health.READ_EXERCISE`
- `android.permission.health.READ_HEART_RATE`
- `android.permission.health.READ_DISTANCE`
- `android.permission.health.READ_TOTAL_CALORIES_BURNED`
- `android.permission.health.READ_BODY_FAT`
- `android.permission.health.READ_WEIGHT`

## Contratos

- PRD normativo: [`../PRD.md`](../PRD.md), versão `kcx-connector-prd/1`.
- Observação diagnóstica: `kcx-health-observation/1`, sem alteração nesta Issue.
- Política de zonas: `kcx-hr-zones/1` dentro do PRD.
- Período de baseline: 7 dias representativos antes do uso recorrente.
- Período do piloto: mínimo 14 e máximo 28 dias após G4.
- Unidade de análise principal: sessão/medição elegível, não dia agregado.
- Um evento repetido não conta como novo benefício; replay/duplicata conta como falha crítica
  se criar um segundo registro.
- Valores ausentes permanecem ausentes; não são convertidos em zero.

Request, response, paginação, idempotência de API e rollback de payload são N/A; pertencem às
Issues técnicas posteriores.

## Banco e segurança

N/A para schema, RLS e autenticação: nenhuma persistência é implementada nesta Issue.

O PRD exige para o piloto posterior:

- somente JWT do usuário e RLS; nunca `service_role` no APK;
- logs e métricas sem valores de saúde, tokens ou IDs externos brutos;
- confirmação e reversibilidade de toda importação/vínculo;
- exclusão e revogação testáveis antes do uso recorrente;
- nenhum envio ao Coach/IA por padrão.

O detalhamento e a aprovação desses controles pertencem à `KCX-CONN-004`.

## Regras de domínio

- Mesma data não comprova match.
- Cardio e musculação continuam sessões distintas.
- Watch complementa e nunca sobrescreve séries, repetições ou cargas.
- Watch e Kcalix nunca têm suas kcal somadas para a mesma sessão.
- Body fat BIA, JP7 e manual são séries distinguíveis.
- Match final só será parametrizado depois da evidência real da `KCX-CONN-007`.
- Zonas de FC exigem uma FC máxima informada ou explicitamente validada pelo usuário.
- Sem FC máxima válida, mostrar apenas mínima, média e máxima; não estimar por idade.
- Política `kcx-hr-zones/1`, quando habilitada: abaixo de 50% = fora das zonas; Z1
  `[50%, 60%)`; Z2 `[60%, 70%)`; Z3 `[70%, 80%)`; Z4 `[80%, 90%)`; Z5 `>= 90%` da FC
  máxima configurada. É contexto fitness, sem interpretação clínica ou recomendação médica.

## Arquivos previstos

- `memory/kcalix-connector/specs/KCX-CONN-002.md` — contrato desta entrega.
- `memory/kcalix-connector/PRD.md` — PRD normativo do piloto.
- `memory/kcalix-connector/ISSUES.md` — estado e evidência da Issue.
- `memory/kcalix-connector/ROADMAP.md` — fechamento de G1 e próxima sequência.
- `memory/kcalix-connector/README.md` — retomada canônica.
- `memory/MEMORY.md` — handoff entre sessões.
- `memory/kcalix-connector/sessions/2026-08-08-KCX-CONN-002-prd.md` — registro verificável.

Nenhum arquivo em `connector/android/`, `src/` ou `supabase/` será alterado.

## Plano de testes

- Documental: conferir todos os critérios da Issue e se cada caso liga problema, dado, decisão
  e métrica.
- Consistência: comparar PRD, 001, handoff, roadmap e backlog.
- Negativo de escopo: procurar passos, sono, FC de repouso, sync contínuo, Play Store,
  diagnóstico e Coach como objetivos do MVP; qualquer inclusão reprova a revisão.
- Segurança: confirmar que nenhuma métrica pede valor bruto de saúde ou identificador pessoal.
- Métricas: testar mentalmente ausência, denominador zero, duplicidade e upstream Samsung lento.
- Android, API, RLS, E2E e regressão PWA: N/A; nenhuma implementação foi alterada.

## Critérios de aceite observáveis

- Dado o PRD, quando seus casos forem enumerados, então existem exatamente três casos
  prioritários e cada um possui problema, resultado, sinais mínimos, fonte e métrica.
- Dado o período anterior ao piloto, quando o baseline for coletado, então entradas, tempo,
  transferências e omissões por fricção podem ser comparados sem inventar zeros.
- Dado o piloto de 2–4 semanas, quando o relatório final for produzido, então automação
  correta, correção, duplicidade, fricção e valor percebido possuem fórmula e limiar.
- Dado um sinal fora do escopo, quando o PRD for revisado, então ele aparece apenas como não
  objetivo ou hipótese futura, sem permissão ou métrica de sucesso atual.
- Dada FC sem máximo configurado, quando a UI futura resumir a sessão, então não calcula zona
  por idade e mostra somente os resumos disponíveis.
- Dado o fim da Issue, então nenhum código, permissão, banco, rede ou dado real foi alterado.

## Rollout, rollback e observabilidade

Rollout técnico é N/A. A aprovação do PRD fecha G1, mas não autoriza leitura real.

Rollback documental: retornar a `KCX-CONN-002` a `DRAFTING`, registrar a hipótese rejeitada e
revisar métricas/escopo antes da `KCX-CONN-003`. As Issues seguintes continuam separadas e
podem ser canceladas sem impacto na PWA.

Observabilidade futura usa contagens e estados sem valores de saúde. Atraso entre Samsung
Health e Health Connect é medido separadamente do tempo de operação do Connector.

## Dúvidas e decisões pendentes

- Frequência real dos eventos do baseline — dono: proprietário; não bloqueia G1, será medida
  antes do piloto recorrente.
- Record types e campos realmente publicados no aparelho — bloqueia G2, pertence à 007.
- Pesos/tolerâncias finais de match — bloqueiam reconciliação automática, pertencem à 007/014.
- Se o piloto durar 14 ou 28 dias — decisão operacional após G4; 14 é mínimo e 28 é teto.
- Retenção, revogação e exclusão detalhadas — bloqueiam ingestão, pertencem à 004.

Nenhuma decisão de produto ausente bloqueia a aprovação deste PRD.

## Evidências de validação

- `KCX-CONN-001` e seus contratos aprovados em 2026-08-08.
- Handoff de descoberta de produto de 2026-07-23.
- Revisão oficial de APIs/Samsung e roteiro especializado da 001.
- PRD `kcx-connector-prd/1` revisado contra os cinco critérios da Issue.
- Registro da sessão `sessions/2026-08-08-KCX-CONN-002-prd.md`.
- Nenhum dado real de saúde foi lido, criado ou versionado.
