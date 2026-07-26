# Handoff — descoberta de produto e reconciliação Watch ↔ Kcalix

**Data:** 2026-07-23  
**Issue ativa:** `KCX-CONN-001`  
**Modo encerrado:** Explorar / Especificar  
**Fase e gates:** Fase 0 / G1 (valor) + G2 (dados reais)  
**Estado:** descoberta avançada; contrato de observação e revisão técnica em `DRAFT`  
**Código liberado:** não  

## 1. Como iniciar obrigatoriamente a próxima sessão

Leia integralmente, nesta ordem:

1. `memory/kcalix-connector/README.md`
2. `memory/handoff-kcalix-connector-android.md`
3. este arquivo
4. `memory/kcalix-connector/ROADMAP.md`
5. `memory/kcalix-connector/ISSUES.md`
6. `memory/kcalix-connector/evidence/KCX-CONN-001-discovery.md`
7. `memory/kcalix-connector/SPEC_TEMPLATE.md`
8. `memory/kcalix-connector/specs/KCX-CONN-001.md`
9. `memory/kcalix-connector/reviews/KCX-CONN-001-reference-project-review.md`
10. `.agents/skills/develop-kcalix-connector/references/session-checklist.md`

Invoque `$develop-kcalix-connector` e declare `KCX-CONN-001` em modo **Especificar**.

Não iniciar leitura via SDK, não alterar permissões Android, não criar migration e não enviar
dados ao Supabase. Quando o projeto de referência estiver disponível, os especialistas devem
executar o roteiro canônico, confrontar o código com a API oficial e recomendar o que adotar,
adaptar ou rejeitar. A `KCX-CONN-001` fecha princípios e o contrato de observação; a
leitura/export real pertence à `KCX-CONN-007`.

## 2. Resultado observável esperado da próxima sessão

Ao final da `KCX-CONN-001` devem existir, aprovados pelo usuário:

1. jornada de musculação e cardio após a conexão;
2. princípios de match e conflito entre sessão do Watch e registro Kcalix;
3. política de fonte de verdade por campo;
4. política provisória de calorias para sessão e saldo diário;
5. escopo exato de frequência cardíaca e zonas;
6. fluxo de body fat do Watch sem misturar métodos;
7. no máximo três casos de uso para o piloto;
8. revisão especializada do projeto de referência contra a API oficial;
9. contrato `kcx-health-observation/1` com perfis de privacidade;
10. protocolo da `KCX-CONN-007`, limitado aos dados necessários.

O objetivo não é produzir arquitetura definitiva nem código. Pesos, tolerâncias e regras
finais de match permanecem deliberadamente abertos até o export real da `KCX-CONN-007`. Se
alguma pergunta bloqueante continuar aberta, registrar dono, evidência necessária e estado.

## 3. Correção de direção decidida nesta descoberta

O planejamento anterior começava com uma lista ampla de record types e deixava o PRD para
depois. O usuário corrigiu essa ordem: primeiro é preciso descobrir quais decisões e atritos do
Kcalix melhoram; depois auditar somente os dados necessários.

Workflow vigente:

```text
problema ou decisão do usuário
  -> sinal mínimo que pode ajudar
  -> disponibilidade e qualidade real no aparelho
  -> custo de permissão, armazenamento e privacidade
  -> integrar, adiar ou descartar
```

“Disponível no Health Connect” não significa automaticamente “útil no Kcalix” nem “fonte de
verdade”.

## 4. Ambiente conhecido

- Telefone: Motorola Edge 60 Pro.
- Android: provavelmente 16; confirmar no aparelho apenas antes do spike técnico.
- Relógio: Samsung Galaxy Watch 5.
- Região e timezone: Brasil / `America/Sao_Paulo`.
- Samsung Health e Health Connect: presumivelmente atualizados, mas versões exatas ainda não
  verificadas.
- Android 14 ou superior inclui Health Connect como módulo do sistema; Android 15 versus 16
  não muda a hipótese básica de viabilidade.

O risco principal não é compatibilidade do telefone. É a cobertura, semântica, granularidade,
origem e atraso do que o Samsung Health realmente publica neste aparelho.

## 5. Jornada real do usuário

### Durante a musculação

- O usuário usa o Kcalix ao longo do treino.
- Registra no Kcalix exercícios, séries, repetições e cargas.
- Inicia uma sessão de musculação no Galaxy Watch e a mantém contínua até o fim.
- A sessão do Watch inclui períodos de execução e descanso.
- O Watch fornece horário, duração, frequência cardíaca e estimativa calórica.

### Durante o cardio

- Cardio é iniciado e encerrado separadamente no Watch.
- Hoje o usuário também registra manualmente no Kcalix o tipo e os minutos.
- Durante e depois do cardio, acompanha frequência cardíaca, variações, picos e zonas.
- O maior ganho imediato seria eliminar essa redigitação e preservar a análise fisiológica.

### Alimentação

- O registro manual no Kcalix funciona bem e deve continuar como fonte de verdade.
- Não importar nutrição, alimentos ou hidratação do Samsung Health.

### Corpo

- O usuário considera útil medir body fat no Watch 5, mas evita fazê-lo com frequência porque
  precisa transferir o resultado manualmente ao Kcalix.
- Automatizar a transferência pode aumentar a frequência e a consistência do acompanhamento.

### Ecossistema complementar

- Passos, atividade diária, sono e sinais cardíacos fora do exercício hoje não são registrados
  no Kcalix.
- Eles podem formar contexto longitudinal, mas ainda não possuem decisão ou UX suficientemente
  definida para entrar automaticamente no MVP.

## 6. Decisões de produto já alinhadas

### 6.1 Duas fontes, responsabilidades diferentes

| Informação | Fonte preferida | Regra vigente |
|---|---|---|
| Exercícios, séries, repetições e cargas | Kcalix | Watch nunca infere, substitui ou apaga |
| Alimentação, macros, porções e água | Kcalix | Não importar Samsung Health |
| Início, fim e duração da sessão | Watch vinculado | Kcalix é fallback se não houver Watch |
| Tipo e minutos de cardio | Watch vinculado | Substitui o manual quando o match for confirmado |
| Distância de cardio | Watch vinculado | Importar quando disponível e coerente com o tipo |
| FC média, máxima, mínima e zonas | Watch/Health Connect | Resumo por sessão; não é volume de musculação |
| Calorias da sessão | Watch vinculado, com ressalva | Preferência operacional; continua sendo estimativa |
| Estimativa Kcalix da sessão | Kcalix | Fallback se não houver sessão Watch utilizável |
| Body fat | Watch BIA com origem | Série própria; não misturar silenciosamente com JP7 |
| Peso | Entrada consciente/balança | Watch 5 pede peso para calcular BIA; não mede peso |
| Cintura e dobras | Kcalix/manual | Sem equivalente confiável no Watch |

### 6.2 Regra conceitual de reconciliação solicitada pelo usuário

Para cada sessão ou cardio:

1. **Existe no Kcalix e no Watch:** reconhecer que representam a mesma atividade; conservar a
   estrutura Kcalix e usar horário, duração, cardio, FC e calorias do Watch nos campos
   correspondentes.
2. **Existe somente no Watch:** sugerir criação/importação no Kcalix.
3. **Existe somente no Kcalix:** manter o registro e usar a estimativa Kcalix.
4. **Nunca somar Watch + Kcalix** quando são duas representações da mesma atividade.

O usuário pensa o produto por dia, mas tecnicamente “mesma data” não basta para provar match.
É necessário validar uma regra com tipo, intervalo temporal, duração, sobreposição e
confirmação/reversão.

### 6.3 Separação obrigatória entre musculação e cardio

Exemplo esperado:

```text
Sessão 1 — musculação
  Watch: início, fim, duração, kcal estimada, FC e zonas
  Kcalix: exercícios, séries, reps, cargas, nota e volume

Sessão 2 — cardio
  Watch: tipo, início, fim, duração, distância, kcal estimada, FC e zonas
  Kcalix: cardio importado ou registro manual reconciliado
```

Não fundir sessões distintas apenas porque ocorreram no mesmo dia.

## 7. Política provisória de calorias

### Decisão de preferência

Quando uma sessão Watch for vinculada, o valor do Watch deve ser a estimativa exibida como
principal para aquela sessão. O cálculo Kcalix permanece como fallback ou comparativo. Isso
não transforma o Watch em medidor metabólico exato.

### Regra provisória

```text
se match Watch confirmado e kcal semanticamente utilizável:
    effective_session_kcal = watch_session_kcal
senão:
    effective_session_kcal = kcalix_estimated_kcal
```

Nunca:

```text
effective_session_kcal = watch_kcal + kcalix_kcal
```

### Bloqueio para o saldo energético diário

A Samsung documenta calorias de exercício em `TotalCaloriesBurnedRecord`, cujo contrato Android
inclui energia ativa e basal no intervalo. Ela não garante que
`ActiveCaloriesBurnedRecord` seja publicado pelo Samsung Health.

O Kcalix já calcula BMR/TDEE e copia `kcalTreino` para o diário. Portanto, usar
`TotalCaloriesBurnedRecord` como “calorias ativas” ou somá-lo novamente ao BMR criaria dupla
contagem.

Modelo semântico a validar:

```text
watch_total_kcal       // bruto do record type total; inclui basal
watch_active_kcal      // apenas se realmente disponível e comprovado
kcalix_estimated_kcal  // estimativa atual/fallback
effective_session_kcal // valor escolhido para a sessão + razão
```

Até a auditoria no aparelho esclarecer a semântica, o Watch pode ser preferido no resumo da
sessão, mas não deve alterar automaticamente meta alimentar ou saldo energético diário.

### Evidência científica resumida

- FC de smartwatch pode ser útil para monitorar intensidade, especialmente no cardio.
- Gasto energético de wearables apresenta erro e variabilidade por dispositivo e modalidade.
- Em estudo recente de endurance e musculação, a estimativa de kcal teve desempenho
  particularmente fraco no exercício resistido.
- Em corrida intervalada, Galaxy Watch 6/7 mostraram validade moderada e erro individual ainda
  relevante.

Conclusão: preferência operacional é aceitável; alegação de precisão absoluta não é.

## 8. Frequência cardíaca e zonas

`HeartRateRecord` fornece série de amostras e agregações de BPM médio, mínimo e máximo.
Health Connect não garante exportar as zonas prontas exibidas pelo Samsung Health.

Proposta a validar:

- calcular localmente `hrAvg`, `hrMin`, `hrMax`;
- calcular duração por zona a partir das amostras da sessão;
- comparar o resumo derivado com o Samsung Health no piloto;
- guardar no Supabase apenas resumos necessários, não a série bruta;
- tornar a política de zonas explícita e versionada;
- usar FC na musculação como contexto fisiológico, não como substituto de séries, carga, volume
  ou percepção subjetiva.

Ainda falta escolher se as zonas serão:

1. limites configurados pelo usuário;
2. percentuais de uma FC máxima informada;
3. percentuais de uma FC máxima estimada;
4. tentativa de reproduzir a configuração Samsung, somente se essa configuração for acessível.

## 9. Body fat / BIA do Watch 5

O Galaxy Watch 5 mede impedância e estima composição corporal, mas exige que o usuário informe
o peso. Automatizar o Connector remove a transferência manual; não remove o ato de medir nem
transforma o Watch em balança.

Fluxo proposto:

1. usuário informa peso e executa a BIA no Watch;
2. Samsung Health sincroniza `BodyFatRecord` e, quando existente, `WeightRecord`;
3. Connector agrupa os registros compatíveis por origem e proximidade temporal;
4. prévia mostra percentual, peso associado, horário, método e origem;
5. usuário confirma a primeira política de importação;
6. valor entra como `Galaxy Watch BIA`, sem sobrescrever silenciosamente uma medição existente;
7. importação pode ser desfeita/excluída;
8. nenhuma leitura isolada recalcula dieta, BMR ou metas.

O estudo independente de 2025 com Watch 5 versus DXA encontrou boa correlação para body fat,
mas erro e limites individuais relevantes; massa muscular teve concordância fraca. Portanto:

- body fat pode entrar como tendência do mesmo método;
- massa muscular, água corporal e BMR ficam fora do MVP;
- JP7 e Watch BIA permanecem séries/métodos distinguíveis;
- medições devem ser feitas em condições consistentes.

Condições sugeridas pela Samsung: manhã, antes de comer, após usar o banheiro e antes de
exercício ou banho, mantendo postura e contato consistentes.

## 10. Casos de uso priorizados para validação

### Candidato 1 — cardio sem redigitação

Detectar sessão de cardio e preencher/sugerir tipo, minutos, distância, FC, zonas e kcal,
reconciliando qualquer cardio manual existente.

### Candidato 2 — musculação enriquecida

Vincular a sessão contínua do Watch ao treino estruturado do Kcalix e acrescentar horário,
duração, FC, zonas e estimativa calórica sem tocar em séries, reps ou cargas.

### Candidato 3 — body fat sem transferência manual

Importar a medição BIA como tendência identificada por método e origem, sem misturar com JP7.

Passos, atividade diária, sono e FC de repouso permanecem candidatos de longo prazo. Eles só
entram no piloto se a próxima entrevista ligar cada sinal a uma decisão concreta e mensurável.

## 11. O que não integrar agora

- nutrição ou hidratação do Samsung Health;
- inferência de exercício, série, repetição ou carga;
- soma de calorias de fontes diferentes;
- ajuste automático de alimentação por kcal do Watch;
- FC bruta no Supabase;
- rotas GPS completas;
- ECG, pressão, SpO2, temperatura ou alegação clínica;
- massa muscular BIA como dado preciso;
- readiness score determinístico;
- envio automático ao Coach/IA;
- histórico amplo ou leitura em background;
- escrita no Health Connect/Samsung Health;
- Samsung Health Data SDK direta ou app Wear OS.

## 12. Auditoria do Kcalix que afeta o esquema

- `WorkoutDayData` possui data, cardio, kcal e duração opcional, mas não possui início, fim,
  origem, ID externo ou estado de vínculo:
  [`../../src/types/workout.ts`](../../src/types/workout.ts).
- `CardioEntry` possui somente tipo, minutos e `kcalPerMin`; distância, horário, FC e
  proveniência exigem modelo adicional.
- `workouts` é único por usuário/data; sessões Watch independentes não cabem com segurança no
  mesmo registro diário sem uma entidade externa própria.
- O Kcalix calcula kcal por séries e cardio e copia o valor para `diary_entries.kcalTreino`:
  [`../../src/hooks/useWorkout.ts`](../../src/hooks/useWorkout.ts).
- A Home usa kcal e duração da sessão e possui um modelo energético que precisa ser revisado
  antes de receber calorias externas:
  [`../../src/pages/HomePage.tsx`](../../src/pages/HomePage.tsx).
- Corpo possui `weightKg`, `waistCm` e `bfPct`, mas não registra método/proveniência:
  [`../../src/types/body.ts`](../../src/types/body.ts).
- Antes de enviar body fat importado ao Coach, revisar o contrato atual de Corpo/check-ins na
  Edge Function:
  [`../../supabase/functions/ai-chat/index.ts`](../../supabase/functions/ai-chat/index.ts).

## 13. Esquema preliminar a validar — não aprovado para implementação

Recomenda-se armazenar o evento externo separadamente do registro Kcalix e criar um vínculo
reversível.

### `external_activity_sessions`

```text
id
user_id
source                         // health_connect
producer_app                   // app que escreveu no Health Connect
capture_device                 // opcional; não inventar “Watch” se ausente
external_record_id
external_record_version
session_kind                   // strength | cardio | other
exercise_type
start_at
end_at
timezone_offset
duration_seconds
distance_meters                // opcional
watch_total_kcal               // opcional
watch_active_kcal              // opcional; só se comprovado
hr_avg_bpm                     // opcional
hr_min_bpm                     // opcional
hr_max_bpm                     // opcional
hr_zone_seconds                // resumo versionado, opcional
recording_method
source_last_modified_at
contract_version
created_at
updated_at
deleted_at                     // tombstone/revogação quando aplicável
```

Não persistir rota GPS nem amostras brutas de FC se os resumos bastarem.

### `activity_session_links`

```text
id
user_id
external_session_id
kcalix_workout_id              // opcional para sessão Watch ainda não ligada
kcalix_date
kcalix_cardio_index_or_id      // o índice atual pode não ser estável; validar modelo
match_status                   // unmatched | suggested | confirmed | rejected | revoked
match_reason
match_score_or_rule_version
confirmed_by_user_at
effective_duration_seconds
effective_session_kcal
effective_kcal_source
created_at
updated_at
```

Pontos que exigem decisão:

- um `CardioEntry` precisa ganhar ID estável antes de ser alvo de link;
- vínculo de musculação e cardio pode exigir entidades diferentes;
- não usar apenas índice de array JSONB como identidade definitiva;
- decidir se `effective_*` é persistido ou derivado;
- definir comportamento quando o Samsung Health corrige ou apaga um registro.

### Medições corporais importadas

Validar se o schema atual de `body_measurements` será estendido ou se haverá uma tabela de
observações externas. Campos mínimos:

```text
method                         // watch_bia | jp7 | manual
producer_app
external_record_id
measured_at
weight_kg_used                 // opcional
body_fat_pct
confirmed_at
```

Método e origem nunca podem ser perdidos.

## 14. Matriz preliminar de record types para o contrato de observação

| Caso de uso | Record type | Estado |
|---|---|---|
| Sessão e duração | `ExerciseSessionRecord` | documentado; validar campos Samsung |
| FC da sessão | `HeartRateRecord` | documentado; validar granularidade/origem |
| Distância do cardio | `DistanceRecord` | documentado para exercise tracker |
| Calorias do exercício | `TotalCaloriesBurnedRecord` | documentado, mas semântica bloqueante |
| Calorias ativas | `ActiveCaloriesBurnedRecord` | existe no Android; Samsung não garante |
| Body fat | `BodyFatRecord` | documentado; validar disponibilidade real |
| Peso associado | `WeightRecord` | documentado; depende de input/balança |
| Passos | `StepsRecord` | documentado; adiado por falta de decisão |
| Sono | `SleepSessionRecord` | documentado; fase posterior |
| FC de repouso | `RestingHeartRateRecord` | existe no Android; Samsung não garante |

As permissões candidatas estão listadas na spec `KCX-CONN-001`, mas não estão autorizadas
para implementação. A revisão especializada deve confirmar cada uma. Não pedir permissões
“para o ecossistema futuro”.

## 15. Perguntas bloqueantes para a próxima sessão

### Reconciliação e UX

1. O primeiro piloto sempre mostra uma prévia para confirmar match/importação ou pode confirmar
   automaticamente casos inequívocos?
2. Qual tolerância de horário/duração caracteriza o mesmo cardio?
3. Se houver dois cardios do mesmo tipo no dia, como o usuário identifica o correto?
4. Cardio importado deve aparecer dentro do treino Kcalix do dia ou como sessão independente
   vinculável?
5. O que acontece se o usuário corrigir minutos no Kcalix depois do vínculo?
6. O que acontece quando Samsung Health atualiza ou apaga a sessão original?

### Calorias

7. Confirmar a política recomendada para o piloto: Watch preferido no resumo da sessão, sem
   alterar automaticamente o saldo alimentar.
8. Se apenas `TotalCaloriesBurnedRecord` existir, ele fica somente como exibição/comparação?
9. O cálculo Kcalix continua visível ao usuário ou fica apenas como fallback técnico?
10. Como o saldo diário deve tratar dias com uma sessão Watch e outra apenas Kcalix?

### Frequência cardíaca

11. Quais resumos precisam aparecer: média, máxima, mínima, gráfico, tempo por zona?
12. O Kcalix deve apenas registrar zonas ou também comparar sessões e sugerir intensidade?
13. Qual política de FC máxima/zonas deve ser adotada?
14. O usuário aceita que apenas resumos sejam enviados, mantendo amostras brutas no aparelho?

### Body fat

15. Watch BIA será a tendência principal ou uma série paralela ao JP7?
16. Importar também o peso informado ao Watch ou somente preencher body fat?
17. Primeira importação sempre pede confirmação?
18. Como resolver body fat manual e Watch no mesmo dia?

### Ecossistema e Coach

19. Entre passos, sono e FC de repouso, qual sinal mudaria uma decisão real primeiro?
20. O Coach poderá usar FC/zonas e body fat? Se sim, mediante consentimento separado por
    categoria?
21. Qual comportamento útil se espera do Coach: resumo, comparação, alerta de inconsistência ou
    sugestão de treino?

### Métricas do piloto

22. Quantos registros manuais por semana o cardio importado deve eliminar?
23. Qual percentual de sessões deve ser reconciliado corretamente?
24. Qual taxa de confirmação/correção manual é aceitável?
25. Depois de 2–4 semanas, qual resultado faria o usuário sentir falta do Connector?

## 16. Recomendações profissionais para levar à validação

1. Piloto com confirmação antes de qualquer escrita no Kcalix.
2. Entidade externa separada e vínculo reversível.
3. Match por tipo + horário + duração, nunca apenas pela data.
4. Watch como fonte preferida da sessão; Kcalix como fonte do treino estruturado.
5. Watch kcal é “estimativa do Galaxy Watch”, não gasto real.
6. Calorias externas não alteram alimentação no primeiro piloto.
7. FC: resumos e zonas; sem série bruta na nuvem.
8. Body fat: tendência identificada como BIA; JP7 separado.
9. Cardio é o primeiro caso de valor; musculação enriquecida é o segundo; body fat é o terceiro.
10. Passos/sono/FC de repouso entram somente depois de uma decisão de produto explícita.

## 17. Evidências e referências

### Fontes oficiais

- Android — disponibilidade do Health Connect:
  <https://developer.android.com/health-and-fitness/health-connect/availability>
- Android — data types e permissões:
  <https://developer.android.com/health-and-fitness/health-connect/data-types>
- Android — leitura, histórico, origem e paginação:
  <https://developer.android.com/health-and-fitness/health-connect/read-data>
- Android — agregação e deduplicação:
  <https://developer.android.com/health-and-fitness/health-connect/aggregate-data>
- Android — `HeartRateRecord`:
  <https://developer.android.com/reference/androidx/health/connect/client/records/HeartRateRecord>
- Samsung — Samsung Health via Health Connect:
  <https://developer.samsung.com/health/blog/en/accessing-samsung-health-data-through-health-connect>
- Samsung — FAQ Health Connect:
  <https://developer.samsung.com/health/health-connect-faq.html>
- Samsung Brasil — body composition no Watch:
  <https://www.samsung.com/br/support/mobile-devices/meca-sua-composicao-corporal-com-a-serie-galaxy-watch/>
- LGPD compilada:
  <https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/L13709compilado.htm>

### Evidência científica

- FC e gasto energético em endurance e musculação:
  <https://pubmed.ncbi.nlm.nih.gov/42076635/>
- Galaxy Watch e gasto em corrida intervalada:
  <https://pubmed.ncbi.nlm.nih.gov/41849635/>
- Watch 5 BIA versus DXA:
  <https://www.frontiersin.org/journals/sports-and-active-living/articles/10.3389/fspor.2025.1644082/full>

## 18. Itens não testados

- versão exata de Android, Samsung Health, Health Connect e software do Watch;
- Samsung Health conectado e permissões de escrita por categoria;
- record types realmente presentes no aparelho;
- campos opcionais de `ExerciseSessionRecord`;
- origem e metadata de dispositivo;
- granularidade/atraso da FC;
- zonas Samsung exportáveis ou apenas deriváveis;
- calorias ativas versus totais no fluxo real;
- distância por tipo de cardio;
- `BodyFatRecord` e `WeightRecord` produzidos pela BIA;
- update/delete de uma sessão após sincronização;
- comportamento com duas sessões semelhantes no mesmo dia.

Nenhum valor pessoal, screenshot, export ou log de saúde foi coletado nesta sessão.

## 19. Prompt exato para a próxima sessão

> Use `$develop-kcalix-connector` na Issue `KCX-CONN-001`, em modo Especificar. Leia a spec
> `memory/kcalix-connector/specs/KCX-CONN-001.md` e o roteiro
> `memory/kcalix-connector/reviews/KCX-CONN-001-reference-project-review.md`. Não implemente,
> não peça permissões e não envie dados. Quando eu disponibilizar o projeto de referência,
> execute as cinco trilhas de revisão, confronte-o com a API oficial vigente e apresente em
> linguagem comum o que adotar, adaptar ou rejeitar. Feche o contrato do export diagnóstico e
> deixe pesos/tolerâncias finais de match para a evidência real da `KCX-CONN-007`.

## 20. Estado de encerramento

- Nenhum código foi alterado.
- Nenhuma permissão Android foi adicionada.
- Nenhuma migration, Edge Function, login ou sync foi criado.
- Nenhum dado real de saúde foi coletado.
- G1 avançou, mas só fecha com o PRD da `KCX-CONN-002`.
- G2 permanece pendente da leitura/export e matriz real da `KCX-CONN-007`.
- A spec e o roteiro especializado da `KCX-CONN-001` estão em `DRAFT`.
- Próxima ação exata: disponibilizar o projeto de referência e executar sua revisão antes de
  aprovar a spec `KCX-CONN-001`.
