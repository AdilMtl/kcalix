# KCX-CONN-001 — protocolo de descoberta no Galaxy Watch 5

Status: PROTOCOLO CONCEITUAL; EXECUÇÃO REAL TRANSFERIDA PARA `KCX-CONN-007`  
Issue: KCX-CONN-001  
Fase e gate: Fase 0 / G2 — dados reais  
Última atualização: 2026-07-23

> **Não executar este protocolo como está.** A descoberta de produto posterior priorizou
> cardio sem redigitação, musculação enriquecida e body fat BIA e identificou que a Samsung
> documenta calorias de exercício em `TotalCaloriesBurnedRecord`, não garante
> `ActiveCaloriesBurnedRecord`. A decisão seguinte adicionou revisão especializada do projeto
> de referência e export local `kcx-health-observation/1`. Leia a
> [spec KCX-CONN-001](../specs/KCX-CONN-001.md) e o
> [roteiro de revisão](../reviews/KCX-CONN-001-reference-project-review.md). A leitura via app,
> o export e a matriz real serão implementados/executados na `KCX-CONN-007`.

## Resultado observável desta sessão

O repositório possui um protocolo reproduzível e sem dados sensíveis para auditar o
caminho Galaxy Watch 5 → Samsung Health → Health Connect. Não houve leitura de Health
Connect, solicitação de permissão, login, rede ou upload nesta sessão.

A `KCX-CONN-000` foi concluída e validada no aparelho. Este documento preserva o desenho
conceitual da auditoria; não autoriza permissões ou leitura dentro da `KCX-CONN-001`.

## Fatos confirmados

- O bootstrap em `connector/android/` usa `app.kcalix.connector`, está na branch
  `codex/kcalix-connector` e seu manifesto não declara permissões de saúde ou Internet.
- O Android SDK possui `adb` em
  `C:\Users\adils\AppData\Local\Android\Sdk\platform-tools\adb.exe`; nenhum dispositivo estava
  conectado na sessão anterior. A coleta pode começar manualmente no aparelho e usar ADB ou
  Android Studio somente se isso ajudar a confirmar modelo/versão, sem extrair dados de saúde.
- A documentação do Android define os tipos, campos e permissões candidatos abaixo. Ela não
  comprova que o Samsung Health deste aparelho os está publicando.
- A leitura padrão de dados de outros produtores fica limitada aos 30 dias anteriores à
  primeira concessão; não solicitar `READ_HEALTH_DATA_HISTORY` neste discovery.
- A primeira versão é manual e em primeiro plano; não solicitar
  `READ_HEALTH_DATA_IN_BACKGROUND`.

## Escopo da auditoria

### Incluído

- Confirmar modelo, Android, One UI, Samsung Health e Health Connect instalados.
- Confirmar que Samsung Health aparece como produtor e quais categorias ele pode gravar no
  Health Connect.
- Após uma atividade conhecida, classificar a disponibilidade, origem, cobertura de campos e
  atrasos dos sinais candidatos.
- Registrar apenas presença/ausência, intervalos arredondados, contagens e observações de
  qualidade.

### Não incluído

- Valores brutos de saúde, capturas de tela, exportações, rotas, IDs de registro ou nomes de
  conta.
- Health Connect SDK, permissões no APK, login, Supabase, migrações, sync ou armazenamento.
- Histórico acima de 30 dias, leitura em background, rotas GPS, sono ou dados médicos.

## Preparação prática para a futura execução no aparelho

1. Estar com o celular pareado, o Galaxy Watch 5 e o Samsung Health disponíveis e com carga.
2. Não atualizar nem reconfigurar tudo antes da auditoria: primeiro registrar privadamente as
   versões instaladas para que a evidência represente o ambiente que já funciona.
3. Abrir Samsung Health e Health Connect e confirmar visualmente se a integração entre eles
   está habilitada; não enviar screenshots nem valores pessoais para o repositório.
4. Ter disponibilidade para uma caminhada curta ou outra atividade controlada no relógio.
5. Se for útil conectar o telefone ao computador, autorizar ADB apenas para identificação e
   diagnóstico do app; a sessão não instalará código novo nem extrairá banco/log de saúde.

Ao final da `KCX-CONN-007`, produzir uma matriz simples com cada sinal marcado como
`disponível`, `indisponível` ou `não testado`, sua origem e uma recomendação de entrada no
piloto. Não implementar sincronização com o Kcalix nessa mesma sessão.

## Matriz a preencher no aparelho

| Sinal / record type | Permissão de leitura exata | Unidade / forma | Fonte esperada | Utilidade candidata | Resultado |
|---|---|---|---|---|---|
| `ExerciseSessionRecord` | `android.permission.health.READ_EXERCISE` | intervalo; início, fim, tipo; segmentos/laps opcionais | Samsung Health | sugerir vínculo temporal com treino | NÃO TESTADO |
| `ActiveCaloriesBurnedRecord` | `android.permission.health.READ_ACTIVE_CALORIES_BURNED` | intervalo; energia | Samsung Health | comparar gasto ativo sem somar | NÃO TESTADO |
| `TotalCaloriesBurnedRecord` | `android.permission.health.READ_TOTAL_CALORIES_BURNED` | intervalo; energia total | Samsung Health | avaliar separadamente do gasto ativo | NÃO TESTADO |
| `HeartRateRecord` | `android.permission.health.READ_HEART_RATE` | série; amostras BPM | Samsung Health | resumo de esforço, sem enviar série bruta | NÃO TESTADO |
| `StepsRecord` | `android.permission.health.READ_STEPS` | intervalo; contagem | Samsung Health e/ou Android | contexto de atividade diária | NÃO TESTADO |
| `DistanceRecord` | `android.permission.health.READ_DISTANCE` | intervalo; distância | Samsung Health | preencher/sugerir cardio | NÃO TESTADO |
| `WeightRecord` | `android.permission.health.READ_WEIGHT` | instantâneo; massa | Samsung Health/balança conectada, se houver | pré-preencher check-in | NÃO TESTADO |

`SleepSessionRecord` (`android.permission.health.READ_SLEEP`) permanece candidato fora desta
auditoria; só entra em uma Issue posterior se o PRD justificar sua utilidade.

## Procedimento reproduzível

1. No telefone pareado, anotar em uma nota privada: modelo, Android, One UI, versões de
   Samsung Health e Health Connect, e data/hora com timezone do telefone. Não copiar número
   de série, e-mail ou conta.
2. Em Samsung Health, confirmar que a sincronização com Health Connect está ativada e quais
   categorias estão habilitadas para escrita. Registrar somente o nome da categoria e
   `habilitada`, `desabilitada` ou `indisponível`.
3. Em Health Connect, conferir que Samsung Health aparece na lista de apps conectados. Anotar
   o estado por categoria sem capturas de tela.
4. Realizar uma atividade simples e conhecida no Watch 5 (por exemplo, caminhada curta),
   anotando em nota privada apenas início/fim arredondados ao minuto e o tipo de atividade.
5. Aguardar a sincronização normal Watch → Samsung Health → Health Connect. Registrar o
   atraso em faixas: `imediato (<15 min)`, `curto (15–60 min)`, `longo (>60 min)` ou
   `não apareceu`.
6. Para cada linha da matriz, registrar `disponível`, `indisponível` ou `não testado`; quando
   disponível, registrar apenas presença dos campos, `data_origin` por nome de pacote (sem
   IDs), granularidade e se há duplicidade/intervalos sobrepostos.
7. Repetir depois de uma segunda atividade em outro horário. Comparar presença, origem e
   atraso; não registrar métricas numéricas pessoais.
8. Atualizar a matriz com uma recomendação `entra no PRD`, `candidato` ou `descartar`, com a
   razão de produto e qualidade.

## Formato de evidência permitido

Use somente uma tabela com: data em ISO sem horário preciso, tipo de atividade, sinal,
estado, campos presentes, origem, atraso em faixa, duplicidade (`sim`/`não`/`incerto`) e
observação. Nunca versionar valores de peso, calorias, BPM, passos, localização, IDs, logs
brutos, screenshots ou exports.

## Critério para encerrar a Issue

Concluir somente quando todas as linhas da matriz forem classificadas, houver pelo menos uma
atividade conhecida comparada antes/depois, e a recomendação de sinais do piloto estiver
registrada sem dados pessoais. Se a interface do Health Connect não permitir comprovar os
campos reais, registrar o bloqueio: a leitura local exige uma fatia de SDK/permissões que
pertence à KCX-CONN-006 e só pode começar depois de PRD, threat model e spec aprovados.

## Referências verificadas em 2026-07-22

- Android Developers — Health Connect data types:
  <https://developer.android.com/health-and-fitness/health-connect/data-types>
- Android Developers — Read raw data:
  <https://developer.android.com/health-and-fitness/health-connect/read-data>
- Android Developers — Develop workout experiences:
  <https://developer.android.com/health-and-fitness/health-connect/experiences/workouts>
