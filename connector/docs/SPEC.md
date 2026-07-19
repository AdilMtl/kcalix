# Spec — Kcalix Connector Android + Health Connect

**Data:** 2026-07-19

**Status:** pronta para execução por issues

**Branch de trabalho:** `feature/kcalix-connector`
**Derivada de:** `memory/handoff-kcalix-connector-android.md`

## 1. Decisão

Construir um aplicativo Android nativo pequeno, privado e instalável por APK. Ele será uma
camada adicional ao Kcalix atual e não converterá a PWA em aplicativo nativo.

Fluxo final:

```text
Galaxy Watch 5
  -> Samsung Health no celular
  -> Health Connect local
  -> Kcalix Connector (leitura, resumo, preview e fila cifrada)
  -> Edge Function autenticada
  -> RPC transacional e tabelas isoladas no Supabase
  -> reconciliação explícita na PWA Kcalix
```

O relógio complementa os registros estruturados do Kcalix. Nenhuma importação pode apagar ou
reescrever silenciosamente séries, repetições, cargas, refeições, check-ins ou medições
manuais.

Antes desse fluxo, a Fase Zero comprova instalação, atualização, autenticação e integração com
um registro manual marcado como teste:

```text
Formulário manual no APK
  -> sessão Kcalix
  -> endpoint de setup autenticado
  -> tabela isolada de testes com RLS
  -> tela de teste na PWA
  -> exclusão pelo próprio usuário
```

## 2. Escolha de tecnologia

### Decisão: Kotlin + Jetpack Compose

Para um conector pequeno, Kotlin/Compose oferece acesso direto ao Health Connect, ciclo de vida
previsível e menos camadas. Capacitor exigiria de qualquer forma um plugin Kotlin para
permissões, paginação, metadata e changes tokens, além de introduzir WebView e armazenamento
seguro híbrido. O repositório atual não usa Capacitor.

Capacitor volta a ser avaliado somente se houver decisão de empacotar toda a PWA como um único
aplicativo Android público.

### Stack gratuita fixada para o MVP

| Camada | Escolha |
|---|---|
| IDE e SDK | Android Studio Quail 2 2026.1.2, Android SDK oficial |
| Linguagem/UI | Kotlin com suporte embutido do AGP 9 + Jetpack Compose/Material 3 |
| Build | Gradle Wrapper 9.5.0, Android Gradle Plugin 9.3.0, Kotlin DSL |
| Java | JDK/JBR 17 fornecido pelo Android Studio |
| Android | `minSdk 28`, `compileSdk 36`, `targetSdk 36`, Build Tools 36.0.0 |
| UI versions | Compose BOM 2026.06.00 |
| Saúde | `androidx.health.connect:connect-client:1.1.0` estável |
| Estado | ViewModel + StateFlow; Navigation Compose |
| Persistência | Room para metadados/fila e Android Keystore + AES-GCM para conteúdo sensível |
| Retry | WorkManager one-shot, somente para upload já iniciado pelo usuário |
| Rede/Auth | cliente HTTP Kotlin e Supabase Auth; versões pinadas e armazenamento de sessão próprio |
| Backend | Supabase Auth, Edge Functions, Postgres RPC, RLS |
| Testes | JUnit, FakeHealthConnectClient/Toolbox, testes instrumentados e aparelho real |
| CI | GitHub Actions dentro da cota gratuita aplicável |

Não usar Gradle global, biblioteca alpha, Hilt, KMP, Capacitor, serviço pago, telemetria ou
crash analytics no bootstrap.

## 3. Escopo por capacidade

### M0 — setup e vertical slice manual

- Preparar a toolchain gratuita e um emulador Android no computador.
- Compilar, instalar e atualizar o APK via Gradle/ADB preservando estado local.
- Instalar no telefone real e validar abertura/diagnóstico.
- Login com email/senha da mesma conta Kcalix e sessão cifrada.
- Formulário manual de atividade com data/hora, tipo, duração e métricas opcionais.
- Envio autenticado para uma tabela isolada, com `source_kind=manual_setup` e `is_test=true`.
- Tela isolada na PWA com badge `TESTE`, idempotência e exclusão.
- Detectar Health Connect e testar grant/deny/revoke de `READ_EXERCISE`, sem ler records.

M0 não grava em `workouts`, `diary_entries`, `body_measurements` ou `checkins` e não envia nenhum
dado obtido do Health Connect.

### M1 — spike de leitura local, sem upload de saúde

- Inventariar telefone, Android/One UI, Samsung Health e dados realmente compartilhados.
- Ler localmente uma janela de 7 dias e mostrar preview técnico.
- Confirmar `dataOrigin`, IDs, timestamps, latência e consistência no aparelho real.
- Classificar cada record type como `INCLUDE`, `DEFER` ou `DROP`.
- Não armazenar na nuvem nem enviar dados de saúde.

### M2 — MVP privado de exercício/cardio

- Consentimento destacado para armazenamento em nuvem.
- Permissões incrementais de leitura.
- Sincronização manual com app visível; 7 dias por padrão, até 30 dias por escolha.
- Sessões de exercício, frequência cardíaca resumida, energia e distância.
- Preview antes do primeiro upload.
- Fila local cifrada, retry de rede e ingestão idempotente.
- Sugestão de vínculo com treino/cardio Kcalix, sempre confirmada pelo usuário no piloto.
- Fontes de kcal lado a lado, sem ajuste automático do diário ou meta alimentar.
- Desconexão, exclusão dos importados e exportação com proveniência.

### M2.1 — corpo, condicionado ao spike

- Peso como observação importada e sugestão de preenchimento.
- Gordura corporal/BIA somente se origem e consistência forem comprovadas no aparelho.
- Nenhum overwrite de medição manual ou BF por dobras.
- Nenhum recálculo automático de metas.

### Pós-MVP, condicionado ao go/no-go

- Sono resumido e, depois, passos.
- Consentimento separado para o Coach usar categorias importadas.
- Changes API/tombstones e sincronização periódica em background.
- Histórico superior a 30 dias.
- Distribuição pública ou unificação com a PWA.

Ficam fora do MVP: escrita no Health Connect, GPS/rotas, FC amostra a amostra, ECG, pressão,
SpO2, dados reprodutivos, nutrição Samsung, aplicativo Wear OS, alegações médicas e ajuste
automático de TDEE/macros.

## 4. Permissões Health Connect

As permissões são declaradas no manifest, mas solicitadas somente quando o usuário ativa a
capacidade correspondente.

| Capacidade | Record | Permissão de leitura | Fase |
|---|---|---|---|
| Sessão | `ExerciseSessionRecord` | `READ_EXERCISE` | M0 autorização; M1/M2 leitura |
| FC no intervalo | `HeartRateRecord` | `READ_HEART_RATE` | M1/M2 |
| Energia | `TotalCaloriesBurnedRecord` | `READ_TOTAL_CALORIES_BURNED` | M1/M2 |
| Distância | `DistanceRecord` | `READ_DISTANCE` | M1/M2 |
| Peso | `WeightRecord` | `READ_WEIGHT` | M1 inventário; M2.1 opcional |
| Gordura | `BodyFatRecord` | `READ_BODY_FAT` | M1 inventário; M2.1 opcional |
| Sono | `SleepSessionRecord` | `READ_SLEEP` | pós-MVP |
| Passos | `StepsRecord` | `READ_STEPS` | pós-MVP |

Não solicitar no MVP: write, route/location, `BODY_SENSORS`, `ACTIVITY_RECOGNITION`, leitura em
background ou `READ_HEALTH_DATA_HISTORY`. `RestingHeartRateRecord` não entra até o spike provar
que o Samsung Health o fornece consistentemente.

O app declara `INTERNET`, `usesCleartextTraffic=false`, consulta o pacote Health Connect quando
necessário e implementa os entry points oficiais de rationale/permissões para Android 13 e 14+.

## 5. Jornada do usuário

### Jornada de setup M0

1. Claude Code compila; APK roda no emulador.
2. Usuário instala no telefone e valida atualização por cima.
3. Usuário entra com a conta Kcalix e vê diagnóstico de sessão/rede.
4. Preenche uma atividade manual e envia.
5. PWA mostra o registro com badge `TESTE` e origem manual.
6. Reenvio com o mesmo ID não duplica; exclusão remove apenas o teste.
7. App verifica Health Connect e testa autorização de exercício sem ler dados.

### Jornada de saúde M1/M2

1. Tela de pré-requisitos explica Watch -> Samsung Health -> Health Connect.
2. Usuário escolhe a categoria e concede permissões just-in-time.
3. No spike M1, app lê 7 dias somente localmente e produz a matriz do aparelho.
4. No MVP M2, aviso explica finalidade, nuvem e retenção antes de qualquer upload.
5. Usuário confirma `Sincronizar agora` após o preview.
6. App normaliza, cifra a fila e envia batches autenticados.
7. Resultado mostra encontrados, inseridos, atualizados, duplicados e erros.
8. PWA apresenta sugestões; usuário confirma ou rejeita.
9. Configurações distinguem logout, desconexão e exclusão.

### Contrato da vertical slice manual

KC-04 define o contrato completo. O endpoint `connector-setup-submit` recebe JWT e campos
allow-listed, nunca `userId`; o servidor força proveniência de teste. A tabela
`connector_setup_submissions` é isolada e descartável. Ela não deve ser reutilizada
silenciosamente como schema final do Health Connect.

## 6. Leitura, normalização e sync

- Checar disponibilidade e permissões imediatamente antes de cada leitura.
- Ler páginas até consumir a janela; não supor limite inferior a 1.000 registros.
- Guardar horários UTC, offsets originais, `metadata.id`, `lastModifiedTime`,
  `dataOrigin.packageName` e metadata de dispositivo quando disponível.
- Não filtrar por pacote Samsung hardcoded antes do spike.
- Associar FC, energia e distância ao intervalo da sessão e, quando confiável, à mesma origem.
- Subir somente resumo allow-listed: tipo, início/fim, duração, kcal, distância, FC média/máxima e
  contagem de amostras. Nunca subir amostras de FC.
- Criar `installationId` aleatório apenas para correlação; ele não autentica o dispositivo.
- Cada upload usa `requestId` fixo e corpo canônico. Se a resposta for perdida, o mesmo envelope
  é reenviado.
- Batches: no máximo 100 registros e 256 KiB.
- WorkManager pode concluir/repetir upload com constraint de rede; ele não inicia nova leitura
  do Health Connect no MVP.
- Retry: rede, timeout, `429` e `5xx`; `401` tenta refresh uma vez; erros permanentes viram estado
  visível, sem loop.

Changes tokens por tipo ficam preparados no modelo local, mas a sincronização incremental por
changes e tombstones é pós-MVP. No piloto, uma releitura de até 30 dias mais idempotência é o
fallback seguro.

## 7. Contrato HTTP v1

`POST /functions/v1/ingest-health-connect`

Headers:

```text
Authorization: Bearer <access-jwt>
apikey: <publishable-or-anon-key>
Content-Type: application/json
```

Corpo conceitual:

```json
{
  "schemaVersion": 1,
  "requestId": "uuid",
  "installationId": "uuid",
  "readWindow": { "start": "ISO-8601", "end": "ISO-8601" },
  "records": [
    {
      "sourceRecordId": "health-connect-id",
      "recordType": "exercise_session",
      "dataOrigin": "package.name",
      "sourceModifiedAt": "ISO-8601",
      "startAt": "ISO-8601",
      "endAt": "ISO-8601",
      "timezoneOffsets": { "start": "-03:00", "end": "-03:00" },
      "data": { "exerciseType": "strength_training", "durationSeconds": 3600 }
    }
  ]
}
```

O cliente nunca envia `userId`. A identidade deriva do JWT. A Edge Function mantém
`verify_jwt=true`, valida schema, tamanho, tipos, unidades e faixas, e chama RPC transacional
usando o contexto RLS do usuário. Não usa `service_role` para ingestão.

Resposta `200`:

```json
{
  "schemaVersion": 1,
  "requestId": "uuid",
  "accepted": 10,
  "inserted": 7,
  "updated": 1,
  "duplicates": 2,
  "completedAt": "ISO-8601"
}
```

Erros: `400` envelope, `401` sessão, `403` conexão revogada, `409` requestId reutilizado com
outro corpo, `413` limite, `422` domínio, `429` rate limit e `5xx` transitório. Nenhum erro ou
log ecoa payload de saúde, token ou identificador externo.

## 8. Modelo Supabase

Antes da migration, KC-05 deve inspecionar o schema realmente implantado; as migrations locais
têm histórico de correções manuais.

### `health_connect_connections`

- `user_id` PK/FK para `auth.users`, cascade delete.
- `installation_id`, `status`, `consent_version`, `allowed_record_types`.
- `coach_consent_at` opcional, `connected_at`, `revoked_at`, `updated_at`.

### `health_connect_records`

- `id`, `user_id`, `record_type`, `origin_package`, `source_record_id`.
- `source_created_at`, `source_modified_at`, `start_at`, `end_at`, offsets.
- `normalized_data` JSONB allow-listed, `content_sha256`, `imported_at`, `last_seen_at`.
- UNIQUE nomeada em `(user_id, origin_package, record_type, source_record_id)`.

### `health_connect_sync_requests`

- UNIQUE `(user_id, request_id)`, `payload_sha256`, janela, status e contadores.
- Sem payload de saúde; retenção operacional sugerida de 90 dias.

### `health_connect_workout_links`

- Vínculo entre registro importado e `workouts`, com `suggested|confirmed|rejected`.
- Método/confiança e chaves compostas com `user_id` impedem associação entre usuários.

Todas as tabelas têm RLS. `anon` não recebe acesso. Escrita ocorre pela RPC
`ingest_health_connect_v1`, com `auth.uid()` obtido no banco, `SECURITY DEFINER`,
`search_path=''`, referências qualificadas e execução apenas para `authenticated`.

## 9. Reconciliação

### Treino de força

- Séries, repetições e cargas do Kcalix continuam canônicas.
- Como o treino atual não guarda início/fim, o piloto sempre pede confirmação.
- Sugestão inicial: mesmo dia, tipo força e combinação não ambígua.
- Futuro: overlap >= 60% do menor intervalo e diferença de duração <= 15 min ajudam o score.

### Cardio

- Normalizar tipos externos para a taxonomia Kcalix.
- Mesmo dia/tipo e duração dentro de `max(5 min, 10%)` gera sugestão de merge.
- Sessão nova gera “Adicionar cardio”; nunca insere silenciosamente.
- Sessões sobrepostas não são somadas.

### Calorias

- Persistir `kcalEstimatedKcalix` e `kcalReportedWearable` separadamente.
- No MVP, a estimativa Kcalix permanece efetiva até escolha explícita.
- Cardio criado e confirmado a partir do relógio pode usar kcal do relógio.
- Nunca somar as duas fontes, ajustar meta alimentar, TDEE ou macros automaticamente.
- Qualquer valor efetivo no diário é recomputado por componentes após confirmação.

### Corpo

- Medição manual vence conflito do mesmo dia.
- Sem manual, o dado importado pré-preenche uma sugestão que exige aceite.
- BF de BIA não substitui BF por dobras; método e origem permanecem separados.

### Coach

Dados importados ficam fora do Coach por padrão. Permissão Health Connect não equivale a
consentimento para nuvem ou IA. Uma fase futura implementará consentimento granular para treino,
sono/recuperação e corpo, com gate no backend e revogação imediata.

## 10. Segurança, privacidade e LGPD

- Dados de saúde são tratados como dados pessoais sensíveis.
- URL e publishable/anon key podem estar no APK; `service_role`, segredos e tokens de teste não.
- Access e refresh tokens ficam cifrados com AES-GCM e chave não exportável no Android Keystore.
- Fila contém ciphertext; cofre, fila e banco de saúde são excluídos de backup/device transfer.
- `usesCleartextTraffic=false`, release não-debuggable e sem pinning TLS no MVP.
- Sem valores de saúde, email, JWT ou source IDs em logs/analytics/crash reports.
- Consentimentos de leitura local, armazenamento Kcalix e uso pelo Coach são separados.
- “Desconectar” bloqueia novos uploads e revoga permissões; “Apagar importados” também remove
  registros, links e requests, preservando dados manuais.
- Remover o APK não promete apagar dados remotos; a UX instrui apagar antes de desinstalar.
- A linguagem é de fitness/bem-estar, sem diagnóstico ou promessa médica.

Retenção proposta: resumos enquanto a conexão/conta estiver ativa ou até exclusão; requests de
sync por 90 dias; logs técnicos sem saúde conforme política operacional. A política final deve
declarar a janela real de backups e os subprocessadores/regiões antes do piloto.

## 11. Estratégia de testes

### Automatizados

- Disponibilidade, permissão negada/revogada e janela vazia.
- Paginação acima de 1.000, timezone/DST e sessão cruzando meia-noite.
- Normalização, unidades, ranges, payload canônico e redaction de logs.
- Reenvio 1x/10x/concomitante, requestId conflitante e dado antigo.
- RLS com dois usuários, JWT inválido, conexão revogada e FKs cross-tenant.
- Offline/retry, refresh de JWT, process death e ACK perdido após commit.

### Emulador + Toolbox

- UI, onboarding, grants, revoke, registros sintéticos, rotação e testes instrumentados.

### Aparelho real obrigatório

- Galaxy Watch 5 + Samsung Health + telefone pareado.
- Força e caminhada/corrida com FC/kcal/distância; peso/BIA se disponível.
- Latência Watch -> Samsung Health -> Health Connect.
- Comparação Health Connect -> preview -> payload -> Supabase.
- Repetição, edição/exclusão na origem, offline/online, upgrade e reinstalação.

## 12. Build, assinatura e distribuição

- Debug apenas durante desenvolvimento.
- Release com `applicationId` definitivo, `versionCode` crescente e mesma chave.
- Keystore e senha fora do repositório; dois backups cifrados e impressão SHA-256 guardada.
- Gerar checksum SHA-256 do APK e runbook de instalação/atualização.
- Sideload/ADB permanecem viáveis no piloto em julho de 2026.
- Limited Distribution gratuita, anunciada para agosto de 2026 e limitada a 20 aparelhos, é uma
  opção operacional futura. Distribuição completa/Play Console pode envolver taxa única.
- Nenhuma conta paga é requisito do MVP N=1.

## 13. Decisões de gating ainda abertas

KC-00 registra respostas antes do scaffold:

1. Modelo do telefone, Android/One UI e tipos visíveis no Health Connect.
2. Confirmar M2 só exercício/cardio; peso/BF permanecem M2.1 e sono pós-MVP.
3. Confirmar janela padrão de 7 dias, com opção de até 30.
4. Confirmar email/senha como login do piloto.
5. Confirmar que o app pode permanecer aberto durante leitura inicial.
6. Confirmar se o piloto será um aparelho ou até 20.
7. Definir local seguro para backups da keystore.
8. Confirmar que desconectar mantém resumos até o usuário escolher “Apagar”.

Defaults acima valem até decisão contrária e foram escolhidos para minimizar permissões, risco e
escopo.

## 14. Fontes primárias

- [Health Connect: primeiros passos](https://developer.android.com/health-and-fitness/health-connect/get-started)
- [Tipos e permissões](https://developer.android.com/health-and-fitness/health-connect/data-types)
- [Leitura, paginação e histórico](https://developer.android.com/health-and-fitness/health-connect/read-data)
- [Sincronização e changes](https://developer.android.com/health-and-fitness/health-connect/sync-data)
- [Experiência de workouts](https://developer.android.com/health-and-fitness/health-connect/experiences/workouts)
- [Testes e Toolbox](https://developer.android.com/health-and-fitness/health-connect/test/health-connect-toolbox)
- [Samsung Health via Health Connect](https://developer.samsung.com/health/blog/en/accessing-samsung-health-data-through-health-connect)
- [FAQ Samsung Health Connect](https://developer.samsung.com/health/health-connect-faq.html)
- [Supabase Edge Function auth](https://supabase.com/docs/guides/functions/auth)
- [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Android Keystore](https://developer.android.com/privacy-and-security/keystore)
- [LGPD compilada](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm)
- [Direitos dos titulares — ANPD](https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados-1/direito-dos-titulares)
- [Verificação de desenvolvedor Android](https://developer.android.com/developer-verification/guides)
