# KCX-CONN-001 — protocolo de descoberta no Galaxy Watch 5

Status: PROTOCOLO CONCEITUAL; EXECUÇÃO REAL TRANSFERIDA PARA `KCX-CONN-007`  
Issue: KCX-CONN-001  
Fase e gate: Fase 0 / G2 — dados reais  
Última atualização: 2026-08-08

> **Não executar este protocolo como está.** A descoberta de produto posterior priorizou
> cardio sem redigitação, musculação enriquecida e body fat BIA e identificou que a Samsung
> documenta calorias de exercício em `TotalCaloriesBurnedRecord` e o mapeamento oficial
> consultado não inclui `ActiveCaloriesBurnedRecord`. A revisão oficial e o contrato local
> `kcx-health-observation/1` estão prontos para aprovação. Leia a
> [spec KCX-CONN-001](../specs/KCX-CONN-001.md) e o
> [revisão oficial](KCX-CONN-001-api-review-2026-08-08.md) e o
> [contrato](../contracts/kcx-health-observation-1.md). A leitura via app,
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
- Após musculação, cardio e, quando possível, BIA conhecidos, classificar disponibilidade,
  origem, cobertura de campos e atrasos dos sinais aprovados ou condicionais.
- Registrar apenas presença/ausência, intervalos arredondados, contagens e observações de
  qualidade.

### Não incluído

- Valores brutos de saúde, capturas de tela, rotas, IDs de registro, nomes de conta ou qualquer
  export real versionado/compartilhado automaticamente.
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
| `TotalCaloriesBurnedRecord` | `android.permission.health.READ_TOTAL_CALORIES_BURNED` | intervalo; energia total | Samsung Health | avaliar separadamente do gasto ativo | NÃO TESTADO |
| `HeartRateRecord` | `android.permission.health.READ_HEART_RATE` | série; amostras BPM | Samsung Health | resumo de esforço, sem enviar série bruta | NÃO TESTADO |
| `DistanceRecord` | `android.permission.health.READ_DISTANCE` | intervalo; distância | Samsung Health | preencher/sugerir cardio | NÃO TESTADO |
| `BodyFatRecord` | `android.permission.health.READ_BODY_FAT` | instantâneo; percentual | Samsung Health | tendência `Galaxy Watch BIA` separada de JP7/manual | NÃO TESTADO |
| `WeightRecord` | `android.permission.health.READ_WEIGHT` | instantâneo; quilogramas | origem a observar, sem atribuir ao Watch | avaliar presença junto da BIA sem importar automaticamente | NÃO TESTADO |

`StepsRecord`, `SleepSessionRecord` e `RestingHeartRateRecord` foram adiados e não autorizam
permissões neste protocolo. Nutrição, hidratação, rotas, sinais médicos, histórico amplo e
background permanecem fora.

## Procedimento reproduzível

1. No telefone pareado, anotar em uma nota privada: modelo, Android, One UI, versões de
   Samsung Health e Health Connect, e data/hora com timezone do telefone. Não copiar número
   de série, e-mail ou conta.
2. Em Samsung Health, confirmar que a sincronização com Health Connect está ativada e quais
   categorias estão habilitadas para escrita. Registrar somente o nome da categoria e
   `habilitada`, `desabilitada` ou `indisponível`.
3. Em Health Connect, conferir que Samsung Health aparece na lista de apps conectados. Anotar
   o estado por categoria sem capturas de tela.
4. Realizar uma musculação e um cardio conhecidos no Watch 5; quando aplicável, realizar uma
   BIA em condições consistentes. Anotar em nota privada apenas início/fim arredondados ao
   minuto, tipo da atividade e presença da medição, sem valores.
5. Aguardar a sincronização normal Watch → Samsung Health → Health Connect. Registrar o
   atraso em faixas: `imediato (<15 min)`, `curto (15–60 min)`, `longo (>60 min)` ou
   `não apareceu`.
6. Pelo app da `KCX-CONN-007`, produzir primeiro `STRUCTURAL`; quando a comparação numérica
   for indispensável, produzir `PRIVATE_FULL` e mantê-lo somente no destino privado escolhido.
   Classificar cada linha como `disponível`, `indisponível` ou `não testado`, incluindo origem,
   granularidade e duplicidade/overlap sem copiar valores pessoais para evidência versionada.
7. Repetir depois de uma segunda atividade em outro horário. Comparar presença, origem e
   atraso; não registrar métricas numéricas pessoais.
8. Atualizar a matriz com uma recomendação `entra no PRD`, `candidato` ou `descartar`, com a
   razão de produto e qualidade.

## Formato de evidência permitido

Use somente uma tabela com: data em ISO sem horário preciso, tipo de atividade, sinal,
estado, campos presentes, origem, atraso em faixa, duplicidade (`sim`/`não`/`incerto`) e
observação. Nunca versionar valores de peso, calorias, BPM, passos, localização, IDs, logs
brutos, screenshots ou exports.

## Critério para encerrar a execução na KCX-CONN-007

Concluir somente quando as linhas aprovadas ou condicionais forem classificadas, houver
musculação e cardio conhecidos comparados antes/depois e, quando disponível, BIA observada,
com recomendação registrada sem dados pessoais. Se o aparelho não comprovar um sinal,
registrá-lo como `indisponível` ou `não testado`; não ampliar permissões para compensar.

## Referências verificadas em 2026-08-08

- Android Developers — Health Connect data types:
  <https://developer.android.com/health-and-fitness/health-connect/data-types>
- Android Developers — Read raw data:
  <https://developer.android.com/health-and-fitness/health-connect/read-data>
- Android Developers — Develop workout experiences:
  <https://developer.android.com/health-and-fitness/health-connect/experiences/workouts>
- Samsung Developers — Accessing Samsung Health data through Health Connect:
  <https://developer.samsung.com/health/blog/en/accessing-samsung-health-data-through-health-connect>
- Samsung Developers — Health Connect FAQ:
  <https://developer.samsung.com/health/health-connect-faq.html>
