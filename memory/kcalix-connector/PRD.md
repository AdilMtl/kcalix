# PRD — piloto privado do Kcalix Connector

Versão: `kcx-connector-prd/1`
Status: APPROVED
Issue: `KCX-CONN-002`
Responsável pelo go/no-go: proprietário do Kcalix
Última atualização: 2026-08-08

## Resumo da decisão

O primeiro produto é um APK Android privado, instalado localmente no telefone do proprietário,
que lê somente os sinais mínimos do Health Connect e sincroniza manualmente com o Kcalix.
O piloto existe para descobrir se três automações concretas reduzem trabalho manual sem criar
duplicidade, perda de confiança ou risco desproporcional.

O piloto não é um app médico, não é uma publicação pública e não transforma a PWA em aplicativo
nativo. Continuidade depende das métricas e dos gates deste documento.

## Usuário e problema

### Usuário do piloto

O proprietário do Kcalix, usando Motorola Edge 60 Pro, Galaxy Watch 5, Samsung Health e o
Kcalix PWA. Versões exatas e disponibilidade real serão confirmadas somente no spike.

### Problema atual

- Cardio é registrado no Watch e redigitado no Kcalix.
- Musculação é estruturada no Kcalix, enquanto duração, FC e kcal ficam isoladas no Watch.
- Body fat BIA exige transferência manual e por isso tende a ser registrado com menos frequência.
- Importar dados indiscriminadamente criaria mais manutenção e risco sem garantir uma decisão útil.

### Resultado desejado

Após 2–4 semanas, o usuário deve registrar menos informação repetida, corrigir poucas sugestões,
confiar que nada foi duplicado/sobrescrito e considerar pelo menos o cardio útil o suficiente
para sentir falta caso o Connector seja removido.

## Princípios do produto

1. Kcalix é fonte de verdade para exercícios, séries, repetições, cargas, alimentação e água.
2. Watch confirmado complementa horário, duração, distância, FC e estimativa da sessão.
3. Mesma data não prova match; toda sugestão é confirmável, rejeitável e reversível.
4. Cardio e musculação permanecem sessões distintas.
5. Kcal do Watch e do Kcalix nunca são somadas para a mesma atividade.
6. `TotalCaloriesBurnedRecord` não é tratado como energia ativa nem altera saldo alimentar.
7. Body fat BIA, JP7 e manual são métodos distintos e visíveis.
8. Ausência não é zero; hipótese não é dado observado.
9. Valores de saúde e FC bruta não entram em métricas, logs ou evidências versionadas.
10. O produto é de bem-estar/fitness e não faz diagnóstico ou recomendação médica.

## Casos de uso do MVP

### 1. Cardio sem redigitação

**Jornada atual:** iniciar/finalizar cardio no Watch e depois informar tipo e minutos no Kcalix.

**Jornada desejada:** sincronizar manualmente, revisar uma sugestão com tipo, intervalo,
duração e sinais disponíveis, confirmar ou corrigir e evitar uma segunda digitação.

**Sinais mínimos candidatos:** `ExerciseSessionRecord`; distância, FC e kcal total quando
presentes e coerentes. `ActiveCaloriesBurnedRecord` não é exigido.

**Valor:** eliminar a repetição sem criar cardio duplicado ou associar a sessão errada.

### 2. Musculação enriquecida

**Jornada atual:** registrar séries/repetições/cargas no Kcalix e consultar o resumo fisiológico
separadamente no Samsung Health.

**Jornada desejada:** vincular por confirmação a sessão contínua do Watch ao treino Kcalix e
acrescentar horário, duração, FC e kcal identificada, sem tocar na estrutura do treino.

**Sinais mínimos candidatos:** `ExerciseSessionRecord`, `HeartRateRecord` e
`TotalCaloriesBurnedRecord` quando disponíveis.

**Valor:** reunir contexto operacional e fisiológico sem inferir exercício, série, repetição
ou carga.

### 3. Body fat BIA sem transferência manual

**Jornada atual:** realizar BIA no Watch e transferir manualmente o percentual para o Kcalix.

**Jornada desejada:** revisar e confirmar a medição com horário, método e origem, preservando
uma série `Galaxy Watch BIA` independente de JP7/manual.

**Sinais mínimos candidatos:** `BodyFatRecord` e `WeightRecord` apenas quando a associação e a
proveniência forem comprovadas.

**Valor:** reduzir a fricção de registrar tendência corporal sem alegar precisão clínica.

## Política de frequência cardíaca

### Resumo da sessão

Quando as amostras forem suficientes, o Connector poderá derivar FC mínima, média e máxima
localmente. Amostras brutas permanecem no aparelho e não são necessárias no Supabase.

### Zonas `kcx-hr-zones/1`

- Exigem uma FC máxima informada ou explicitamente validada pelo usuário.
- O Connector não estima FC máxima silenciosamente por idade.
- Sem FC máxima configurada, nenhuma zona é calculada; mostram-se apenas os resumos disponíveis.
- Com FC máxima configurada: abaixo de 50% fica fora das zonas; Z1 `[50%, 60%)`; Z2
  `[60%, 70%)`; Z3 `[70%, 80%)`; Z4 `[80%, 90%)`; Z5 `>= 90%`.
- A versão da política e a FC máxima usada devem acompanhar qualquer resumo persistido.
- Zonas são contexto fitness e não geram diagnóstico, alerta clínico ou ajuste automático de treino.

## Baseline manual

Antes do piloto recorrente, observar 7 dias representativos sem automação. Registrar somente:

| Métrica | Como medir |
|---|---|
| Cardios elegíveis | número de sessões feitas no Watch que também deveriam existir no Kcalix |
| Redigitações de cardio | número de vezes em que tipo/minutos foram informados manualmente |
| Tempo manual | estimativa de segundos entre abrir o Kcalix e concluir cada registro/correção |
| Musculações sem vínculo | sessões com resumo no Samsung Health consultado separadamente |
| BIA realizada | número de medições feitas no Watch |
| BIA transferida | número de medições copiadas manualmente ao Kcalix |
| Omissões por fricção | evento conhecido que deveria ter sido registrado, mas não foi |

O baseline não exige export, screenshot ou valor de saúde. Se algo não for observado, registrar
`não medido`; se não houver evento, registrar `não ocorreu`.

## Métricas do piloto

O período começa depois de G4 e dura no mínimo 14 e no máximo 28 dias.

| Métrica | Fórmula/medição | Alvo de GO |
|---|---|---|
| Cardio sem redigitação | cardios confirmados sem digitar novamente / cardios elegíveis | `>= 80%` quando houver ao menos 3 elegíveis |
| Sugestão correta | sugestões confirmadas sem correção / sugestões apresentadas | `>= 90%` no conjunto e nenhuma associação destrutiva |
| Correção manual | sugestões corrigidas / sugestões apresentadas | `<= 10%` |
| Duplicidade/corrupção | registros duplicados, sobrescritos ou ligados à sessão errada | `0` incidente não recuperado; duplicidade criada é falha crítica |
| Operação do Connector | tempo da ação `Sincronizar agora` até resultado, excluindo atraso Samsung anterior | mediana `<= 60 s` |
| Cobertura de musculação | sessões elegíveis enriquecidas corretamente / sessões elegíveis | `>= 80%` quando houver ao menos 3 elegíveis |
| Transferência BIA | medições elegíveis confirmadas sem cópia manual / medições elegíveis | `>= 80%` quando houver ao menos 2 elegíveis |
| Confiabilidade | syncs concluídos ou recuperados por retry / syncs iniciados | `>= 95%` e nenhum dado perdido |
| Valor percebido | resposta ao final: “eu sentiria falta se fosse removido?” | `sim`, com cardio citado como benefício real |
| Custo de manutenção | tempo gasto diagnosticando/corrigindo o Connector durante o piloto | não superar o tempo manual economizado |

Denominador abaixo do mínimo torna a métrica `inconclusiva`, não aprovada nem reprovada.
Disponibilidade/atraso Samsung é relatado separadamente da falha do Connector.

## Decisão ao final do piloto

### GO

- zero incidente de perda, sobrescrita ou exposição de dado;
- zero duplicidade não recuperada;
- cardio atinge os alvos aplicáveis e reduz trabalho manual;
- sugestão correta, confiabilidade e valor percebido atingem seus alvos;
- custo de manutenção não supera o benefício;
- riscos críticos da revisão de segurança estão encerrados.

Um `GO` libera planejamento de evolução, não libera automaticamente background, app unificado
ou Play Store.

### ADJUST

- cardio demonstra valor, mas musculação ou BIA têm cobertura insuficiente;
- métricas ficam inconclusivas por poucos eventos;
- qualidade Samsung varia, mas um subconjunto seguro continua útil;
- correções são recuperáveis e existe mudança pequena com hipótese testável.

Nesse caso, reduzir escopo e repetir somente a parte necessária do piloto. Não adicionar novos
record types para compensar falta de valor.

### NO-GO

- cardio não reduz redigitação ou exige correção frequente;
- Health Connect não expõe os sinais mínimos com consistência suficiente;
- ocorre perda, sobrescrita, vínculo destrutivo, exposição sensível ou duplicidade recorrente;
- manutenção/fricção supera o trabalho manual economizado;
- o usuário não sentiria falta do Connector após o período válido.

No `NO-GO`, parar integração e preservar a PWA atual. Abandonar o piloto é um resultado válido.

### Responsabilidade

O agente/revisor produz a evidência técnica e recomenda `GO`, `ADJUST` ou `NO-GO`. O
proprietário do Kcalix decide continuidade e autoriza distribuição, publicação ou expansão.

## Não objetivos

- diagnóstico, alerta ou recomendação médica;
- Play Store, distribuição pública ou suporte multiusuário;
- sincronização contínua/em background;
- aplicativo Wear OS ou SDK Samsung direta;
- escrita no Health Connect/Samsung Health;
- nutrição, hidratação, passos, sono, FC de repouso, SpO2, ECG, pressão, temperatura ou rota;
- FC bruta, GPS completo ou payload bruto no Supabase;
- inferir exercícios, séries, repetições ou cargas;
- ajuste automático de alimentação, BMR/TDEE ou treino por kcal/FC/BIA;
- envio automático ao Coach/IA;
- definir match final antes da matriz real da `KCX-CONN-007`;
- unificar PWA e Connector via Capacitor durante o piloto.

## Dependências e gates

1. `KCX-CONN-002` fecha G1 com este PRD.
2. `KCX-CONN-003` ratifica Kotlin/Compose e registra a opção Capacitor futura.
3. `KCX-CONN-004` aprova threat model, privacidade e ciclo de vida.
4. `KCX-CONN-006` implementa disponibilidade e permissões mínimas.
5. `KCX-CONN-007` produz a evidência real que fecha G2.
6. Match, schema, backend e sync permanecem bloqueados pelos gates seguintes.

## Riscos e respostas

| Risco | Resposta |
|---|---|
| Samsung não publica sinal esperado | marcar indisponível, reduzir escopo ou encerrar; não pedir dado extra sem caso de uso |
| atraso Watch → Samsung → Health Connect | medir separadamente e não prometer imediatismo |
| sugestão liga sessão errada | confirmação obrigatória e vínculo reversível |
| dupla contagem de kcal | fonte visível e proibição de soma/ajuste alimentar |
| BIA cria falsa precisão | série por método, linguagem de tendência e nenhum uso clínico |
| FC/zonas interpretadas como prescrição | máximo configurado, política versionada e linguagem fitness |
| métricas com poucos eventos | resultado `inconclusivo` e extensão até 28 dias, sem inventar aprovação |
| manutenção supera benefício | comparar tempo de correção com tempo manual economizado |

## Critério de conclusão deste PRD

O documento está aprovado quando usuário, problema, três casos, baseline, métricas, não
objetivos, política de FC, go/no-go e responsável estão explícitos e coerentes com a 001.
A aprovação fecha G1, mas não autoriza código nem dado real.
