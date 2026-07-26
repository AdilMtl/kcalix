# KCX-CONN-000 — Shell visual offline alinhada ao Kcalix

Status: VALIDATED
Issue pai: KCX-CONN-000
Fase e gate: Fase 00 / não avança G1 ou G2
Responsável da decisão: usuário
Última atualização: 2026-07-22

## Decisão entregue

O APK abre uma shell Ember do Kcalix Connector na qual o usuário preenche manualmente Cardio,
Água e Corpo e conclui uma transferência simulada somente em memória, antes de existir Health
Connect, autenticação, rede ou escrita no Kcalix.

## Contexto comprovado

- O bootstrap Android nativo em `connector/android/` compila, instala e abre no aparelho.
- Antes desta Issue, a interface mostrava apenas nome, versão e build; a shell validada agora
  representa a jornada manual mínima descrita nesta spec.
- O Kcalix usa o sistema visual Ember: fundo escuro, superfícies sólidas, bordas técnicas,
  radius de 8 dp e laranja/magenta em ações, com gradientes usados com moderação.
- Cardio é persistido futuramente em `workouts.data.cardio[]` com `tipo`, `minutos` e
  `kcalPerMin`; o treino também pode conter `durationMin`.
- Água é persistida futuramente como total diário em `diary_entries.data.waterMl`.
- Peso, cintura e percentual de gordura são persistidos futuramente em `checkins.weight_kg`,
  `checkins.waist_cm` e `checkins.bf_pct`.
- Altura pertence ao perfil em `user_settings.data.heightCm`, não às três linhas de Corpo
  escolhidas para esta entrega; portanto fica fora da KCX-CONN-000.
- Health Connect oferece `ExerciseSessionRecord`, `HydrationRecord`, `WeightRecord` e
  `BodyFatRecord`. Não existe record type padrão para cintura na API
  Jetpack Health Connect verificada em 2026-07-22.
- O catálogo atual do Kcalix contém onze IDs de cardio e um `kcalPerMin` associado a cada um.
- O ícone público do Kcalix é `public/icon-512.png`; a implementação deriva dele uma variação
  própria do Connector com dois pontos de conexão, sem alterar o ativo original.
- Ainda são hipóteses a disponibilidade e a qualidade desses dados no Galaxy Watch 5 e no
  Samsung Health do aparelho do usuário.

## Escopo

### Incluído

- Uma tela Compose rolável, otimizada para 360–430 dp, com identidade Ember.
- Cabeçalho `Kcalix Connector` e selo explícito `DEMONSTRAÇÃO LOCAL`.
- Estados `Conta Kcalix — não conectada` e `Health Connect — não configurado`.
- Um seletor de data comum aos registros da simulação, iniciado com a data local atual.
- Formulário `Cardio`: tipo selecionado do catálogo Kcalix e minutos.
- Formulário `Água`: volume em ml.
- Formulário `Corpo`: peso em kg, cintura em cm e body fat em percentual.
- Campos opcionais por grupo; pelo menos um grupo válido é exigido para simular.
- Revisão dos dados digitados e ação `Simular transferência`.
- Resultado local com contagem de itens simulados e aviso de que nada foi enviado.
- Versão e tipo do build em área secundária.
- Variação do ícone Kcalix para o launcher do Connector, preservando a marca de infinito e
  distinguindo o app por um motivo visual de conexão/ponte em Ember, sem texto no ícone.

### Não incluído

- Health Connect SDK, permissões, leitura, disponibilidade ou abertura de configurações.
- Login, Supabase, Edge Function, HTTP, JWT, banco, RLS, fila, retry ou persistência local.
- Qualquer escrita real no Kcalix; o usuário não precisará apagar nada na PWA nesta versão.
- Migrações ou mudanças na PWA Kcalix.
- Definição final de mapeamento, deduplicação, conflito, calorias ou fonte de verdade.
- Background sync, release assinado, Play Store, Wear OS ou Samsung SDK direta.

## Fluxo do usuário e estados

1. Ao abrir o app, o usuário vê a marca Kcalix Connector e o selo de demonstração.
2. A área `Conexões` mostra Conta Kcalix e Health Connect como não conectados. Os controles
   explicam `disponível em etapa futura` e não disparam intents nem rede.
3. O usuário escolhe a data e preenche um ou mais grupos. Cardio exige tipo + minutos; Água
   exige ml; Corpo aceita qualquer combinação de peso, cintura e body fat.
4. Campos inválidos mostram erro junto do campo. O CTA permanece desabilitado quando nenhum
   grupo está válido.
5. A área `Revisão` resume somente os grupos válidos, sempre com a unidade e o destino Kcalix.
6. Ao tocar `Simular transferência`, o estado em memória muda de `Pronta para revisar` para
   `Demonstração concluída`; a interface informa que nada foi gravado no Kcalix.
7. `Nova simulação` limpa os campos. Fechar/reabrir o processo também limpa tudo.

Estados de Health Connect ausente, permissão negada/parcial/revogada, vazio, offline, token
expirado, erro do servidor, retry e dados já sincronizados são N/A nesta Issue porque não há
integração. A tela antecipa apenas os rótulos de conexão `não conectada` e `não configurado`.

## Dados e proveniência

Os valores são digitados pelo usuário e podem representar dados reais, mas existem somente no
estado volátil da tela. Não são lidos de sensores, persistidos, enviados, exportados ou logados.

| Grupo | Campo manual | Unidade | Origem futura candidata | Destino Kcalix existente | Regra nesta Issue |
|---|---|---|---|---|---|
| Geral | data | `YYYY-MM-DD` local | timestamp futuro de cada record | `workouts.date`, `diary_entries.date`, `checkins.date` | obrigatória; sem hora nesta simulação |
| Cardio | tipo | ID Kcalix | `ExerciseSessionRecord.exerciseType` | `workouts.data.cardio[].tipo` | selecionar um ID exato do catálogo |
| Cardio | duração | min | diferença `startTime`/`endTime` | `workouts.data.cardio[].minutos` | inteiro de 1 a 1.440 |
| Cardio | kcal/min | derivada | política futura | `workouts.data.cardio[].kcalPerMin` | derivada do catálogo; não editável |
| Água | volume do dia | ml | soma diária de `HydrationRecord.volume` | `diary_entries.data.waterMl` | inteiro de 1 a 20.000 |
| Corpo | peso | kg | `WeightRecord.weight` | `checkins.weight_kg` | opcional; decimal positivo com 1 casa |
| Corpo | cintura | cm | sem record type Health Connect padrão | `checkins.waist_cm` | opcional; manual nesta simulação |
| Corpo | body fat | % | `BodyFatRecord.percentage` | `checkins.bf_pct` | opcional; maior que 0 e até 100 |

Catálogo de Cardio copiado do contrato atual do Kcalix:

```text
bicicleta, bicicleta_intensa, esteira_caminhada, esteira_corrida,
caminhada_rua, corrida_rua, eliptico, escada, pular_corda, remo, outro_cardio
```

Timezone, precisão da origem, `data_origin`, retenção e correções são N/A para a fixture.
As decisões reais permanecem para KCX-CONN-001, 007, 008, 009 e 015.

## Permissões

Nenhuma permissão sensível, de rede ou Health Connect é declarada ou solicitada. Em particular,
o manifesto não deve conter `INTERNET`, `READ_HEALTH_DATA_IN_BACKGROUND`,
`READ_HEALTH_DATA_HISTORY` nem qualquer `android.permission.health.READ_*`.

O APK debug contém somente `app.kcalix.connector.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION`,
permissão de assinatura interna gerada automaticamente pela infraestrutura AndroidX para
receivers não exportados. Ela não concede rede, saúde, armazenamento ou acesso a outro app.

As permissões futuras candidatas aparecem somente como documentação, nunca no APK desta
Issue: `READ_EXERCISE`, `READ_HYDRATION`, `READ_WEIGHT` e `READ_BODY_FAT`.
Cintura não gera permissão porque não possui record type aprovado.

## Contratos

Não há contrato HTTP, request, response, erro, paginação ou idempotência nesta Issue.

Contrato local de apresentação:

```text
MockTransferState = Editing | Ready | Completed(summary)
MockTransferForm = date + cardio? + hydration? + body?
CardioInput = cardioTypeId + minutes + derivedKcalPerMin
BodyInput = weightKg? + waistCm? + bfPct?
MockTransferSummary = date + validGroups + fieldCount
```

O evento `Simular transferência` só pode transformar `Ready` em `Completed`; não escreve em
arquivo, preferences, saved state, banco ou log. `Nova simulação` e reinício restauram o
formulário vazio. Não existe payload HTTP nesta Issue.

Compatibilidade: mantém `minSdk 26`, `targetSdk 36`, package `app.kcalix.connector` e as
versões aprovadas na KCX-CONN-005. Rollback consiste em reinstalar o APK anterior.

## Banco e segurança

Banco, policies RLS e autenticação são N/A. Nenhuma chave Supabase, token, e-mail, ID,
telemetria ou valor real entra no módulo. Logs podem conter somente versão do build e falhas
técnicas sem os valores das fixtures; preferencialmente nenhum log novo será adicionado.

Os inputs podem conter dados pessoais reais durante o uso, por isso ficam apenas no estado em
memória e nunca aparecem em logs, analytics, clipboard, compartilhamento ou exportação. Testes
e previews Compose usam somente fixtures sintéticas.

## Regras de domínio

- `Transferência` nesta Issue significa simulação de jornada, não sincronização nem escrita.
- A data selecionada vale para todos os grupos da simulação.
- Cardio usa os IDs atuais do Kcalix; `kcalPerMin` é derivada pelo catálogo e não editável.
- A simulação não define ainda a relação entre duração do cardio, `durationMin` do treino e
  energia medida por relógio.
- Água não é somada ao Kcalix; a futura integração deverá agregar por dia e impedir replay.
- Corpo aceita preenchimento parcial porque as três colunas do check-in são opcionais.
- Cintura é manual nesta simulação e continua sem fonte automática futura aprovada.
- Ausência de dado aparece como indisponível, nunca como zero.
- Nenhum campo da fixture é enviado ao Coach ou usado para recomendação.

## Arquivos previstos

- `connector/android/app/src/main/java/app/kcalix/connector/MainActivity.kt` — hospeda a tela.
- `connector/android/app/src/main/java/app/kcalix/connector/ConnectorPreviewScreen.kt` — layout,
  estados e semântica da shell.
- `connector/android/app/src/main/java/app/kcalix/connector/MockTransfer.kt` — modelos,
  catálogo, validação e resumo da simulação.
- `connector/android/app/src/main/java/app/kcalix/connector/ui/theme/Color.kt` — tokens Ember.
- `connector/android/app/src/main/java/app/kcalix/connector/ui/theme/Theme.kt` — tema escuro
  estável, sem dynamic color que altere a identidade.
- `connector/android/app/src/main/java/app/kcalix/connector/ui/theme/Type.kt` — hierarquia
  tipográfica local sem baixar fontes.
- `connector/android/app/src/main/res/values/strings.xml` — textos fixos relevantes.
- `connector/android/branding/kcalix-connector-icon-v1.png` — fonte visual versionada do
  launcher, derivada não destrutivamente de `public/icon-512.png`.
- `connector/android/app/src/main/res/drawable-nodpi/kcalix_connector_icon.png` — recurso usado
  pelo launcher normal/round e pelo cabeçalho da shell.
- `connector/android/app/src/test/java/app/kcalix/connector/MockTransferTest.kt` — catálogo,
  limites, combinações parciais e resumo da simulação com fixtures sintéticas.

## Plano de testes

- Unitários: validar catálogo exato, limites, campos parciais, resumo e transição
  `Editing → Ready → Completed` com fixtures sintéticas.
- Contrato/API: N/A; não há API.
- RLS/autorização: N/A; não há banco ou usuário.
- Android: `assembleDebug`; inspeção do manifesto; Compose UI test para textos/estado se o
  ambiente permitir.
- Aparelho real: validar teclado numérico, seletor, data, erros, scroll, safe area, estado
  concluído, ícone do launcher e legibilidade; registrar somente versão e resultado, sem
  screenshot com valores reais.
- Regressão PWA: N/A porque nenhum arquivo funcional da PWA será alterado; os tokens são
  apenas reproduzidos no tema Android.

## Critérios de aceite observáveis

- Dado o APK aberto, quando a tela inicial aparece, então marca, selo de demonstração e ambos
  os estados de conexão ficam visíveis sem solicitar permissão ou rede.
- Dado Cardio, quando o usuário escolhe um dos onze tipos e minutos válidos, então a revisão
  mostra o ID/label correto e a duração, com kcal/min derivada sem edição.
- Dado Água ou Corpo, quando valores válidos são digitados, então a revisão mostra somente os
  campos preenchidos, com unidades e data.
- Dado um campo inválido, quando perde foco ou a simulação é tentada, então o erro aparece
  localmente e nenhuma conclusão é exibida.
- Dado o estado `Ready`, quando `Simular transferência` é tocado, então o resultado local
  mostra conclusão e declara que nada foi gravado no Kcalix.
- Dado `Nova simulação` ou reinício do app, quando o formulário aparece, então os valores
  anteriores não existem mais.
- Dado o manifesto e o APK, quando inspecionados, então não contêm Internet nem permissões
  Health Connect.
- Dadas larguras de 360, 390 e 430 dp, quando a tela é renderizada, então não há corte,
  sobreposição ou CTA abaixo da safe area; alvos tocáveis têm pelo menos 44 dp.
- Dado o projeto, quando pesquisado por segredos e dados pessoais, então nenhum artefato novo
  contém credencial ou valor real.
- Dado o app instalado, quando visto no launcher, então o ícone é reconhecível como família
  Kcalix e distinguível do ícone principal por seu motivo de conexão Ember.

## Rollout, rollback e observabilidade

Rollout: build debug e instalação local sobre o mesmo package da KCX-CONN-005. Rollback:
reinstalar o APK bootstrap anterior ou desinstalar o app; não existe estado a perder.
Observabilidade limita-se a sucesso/falha do build e validação visual manual. Não há analytics.

## Dúvidas e decisões pendentes

Decisões confirmadas pelo usuário em 2026-07-22:

- entrada manual e editável nesta shell;
- Cardio usa lista Kcalix, minutos e data;
- Corpo usa exatamente peso, cintura e body fat;
- `Simular transferência` é mock local; escrita real e conexão ficam para a fase seguinte;
- o Connector deve ter uma variação própria do ícone Kcalix.

1. **Aprovado:** o usuário autorizou a execução da KCX-CONN-000 em 2026-07-22.
2. **Não bloqueia esta Issue:** mapping futuro de `ExerciseSessionRecord` para `CARDIO_TYPES`.
3. **Não bloqueia esta Issue:** conflito futuro entre água manual e `HydrationRecord`.
4. **Não bloqueia esta Issue:** se peso/body fat importados criam check-in, sugestão ou revisão.
5. **Não bloqueia esta Issue:** regra futura de escrita real no Kcalix, que exigirá contrato,
   autenticação, idempotência e RLS antes do código de conexão.

## Evidências de validação

- Spec aprovada pelo usuário antes da implementação em 2026-07-22.
- `gradlew.bat testDebugUnitTest assembleDebug`: `BUILD SUCCESSFUL`; seis testes executados,
  incluindo cinco casos de domínio em `MockTransferTest`, sem falhas.
- APK: `connector/android/app/build/outputs/apk/debug/app-debug.apk`, versão
  `0.1.0-shell` (`versionCode 2`), SHA-256
  `D97F4E8EBA1B31019B95D7A7863808EF510DF4A94E315D86E513FFA94128BBFB`.
- `aapt2 dump permissions`: nenhuma permissão `INTERNET` ou Health Connect; apenas a permissão
  interna não exportada descrita acima.
- `aapt2 dump badging`: label `Kcalix Connector`, atividade inicial correta e o novo recurso
  `kcalix_connector_icon.png` usado em todas as densidades reportadas.
- Evidência reproduzível detalhada em
  [`../evidence/KCX-CONN-000-validation.md`](../evidence/KCX-CONN-000-validation.md).
- Validação física feita pelo usuário em 2026-07-22: APK baixado, instalado e aberto; todos os
  campos numéricos aceitaram entrada; a conclusão e a limpeza dos valores funcionaram; o ícone
  do Connector apareceu separadamente do app Kcalix e foi considerado moderno e reconhecível.
- Defeito visual não bloqueante observado: há texto preto sobre fundo preto em pelo menos um
  elemento associado ao Cardio/card. O polish de contraste foi separado em `KCX-CONN-021`,
  sem ampliar retroativamente a entrega funcional desta Issue.
