# KCX-CONN-005 — Bootstrap Android reproduzível

Status: VALIDATED
Issue pai: KCX-CONN-005
Fase e gate: Fase 00 / não avança gate de produto ou dados
Responsável da decisão: usuário
Última atualização: 2026-07-22

## Decisão entregue

Um aplicativo Android nativo mínimo com package `app.kcalix.connector` em
`connector/android/` compila e pode ser instalado em modo de desenvolvimento, exibindo apenas
metadados técnicos do build, sem acessar dados, contas ou rede.

## Contexto comprovado

- O Kcalix existente é uma PWA React/Vite/TypeScript; não existe implementação Android no
  repositório.
- O piloto continua sendo um APK privado, somente leitura no Health Connect e com sync manual.
- A pasta `connector/` não contém app ou configuração Android.
- Kotlin nativo + Compose foi aprovado como base reversível do bootstrap. A decisão de
  arquitetura do produto continua sendo confirmada na `KCX-CONN-003`.

## Escopo

### Incluído

- Estrutura Gradle versionada em `connector/android/`.
- Uma única tela Compose com nome do app, `versionName`, `versionCode` e tipo de build.
- Build debug documentado e instalação local por ADB ou APK.
- Toolchain comprovada pelo primeiro build: Android Gradle Plugin 9.3.0, Gradle Wrapper 9.5.0,
  JDK 17, `compileSdk` 36.1, `targetSdk` 36, `minSdk` 26 e Compose BOM 2026.02.01.

### Não incluído

- Health Connect, permissões de saúde, leitura de records ou histórico.
- Login, Supabase, Edge Function, HTTP, fila, telemetria ou dados pessoais.
- Assinatura release, distribuição, Wear OS, Play Store ou migração da PWA.

## Fluxo do usuário e estados

O usuário instala o APK debug e abre o app; a tela confirma que é um bootstrap técnico. Erro
de build, dispositivo sem depuração ou APK incompatível exibem instrução no guia, não um fluxo
de produto. Estados de Health Connect, offline, token expirado, retry e dados já sincronizados
são N/A porque nenhuma dessas integrações existe nesta Issue.

## Dados e proveniência

N/A. O app usa somente constantes de metadados do próprio build; não lê, persiste ou transmite
dados de saúde ou dados pessoais.

## Permissões

Nenhuma permissão Health Connect é declarada ou solicitada. Permissões de Internet e acesso a
armazenamento também são N/A: o bootstrap não faz rede nem exporta arquivos.

## Contratos

N/A. Não há API, payload, paginação, autenticação, idempotência ou compatibilidade de dados
nesta Issue. O contrato técnico do build é: AGP 9.3.0 + Gradle Wrapper 9.5.0 + JDK 17;
`compileSdk` 36.1, `targetSdk` 36 e `minSdk` 26. O Compose usa BOM 2026.02.01 sem versões
individuais nas bibliotecas do BOM.

## Banco e segurança

N/A para banco, RLS e sessão. O projeto não conterá chave Supabase, segredo, token, arquivo
`.env` copiado ou dado de saúde. Logs de desenvolvimento podem conter somente versão do build e
falhas técnicas sem identificadores do usuário.

## Regras de domínio

N/A. Nenhuma sessão, caloria, unidade, timezone, origem ou vínculo de treino é processado.

## Arquivos previstos

- `connector/android/settings.gradle.kts` — módulos Gradle.
- `connector/android/build.gradle.kts` e `gradle/libs.versions.toml` — toolchain fixada.
- `connector/android/app/build.gradle.kts` — configuração do app sem permissões sensíveis.
- `connector/android/app/src/main/AndroidManifest.xml` — manifesto mínimo.
- `connector/android/app/src/main/java/.../MainActivity.kt` — tela técnica Compose.
- `connector/android/gradle/wrapper/` e `connector/android/gradlew*` — Gradle Wrapper 9.5.0.
- `connector/android/README.md` — pré-requisitos, build, instalação e troubleshooting.

## Plano de testes

- Executar `assembleDebug` com JDK 17, SDK Platform 37 e Build-Tools 36.0.0 instalados.
- Instalar o APK debug em um telefone Android real e confirmar a tela de metadados.
- Inspecionar manifesto e APK para confirmar ausência de permissões Health Connect, Internet e
  segredos.
- Testes de contrato/API, RLS, E2E de sincronização e regressão da PWA são N/A nesta Issue.

## Critérios de aceite observáveis

- Dado um clone sem secrets, quando o comando documentado de build é executado, então um APK
  debug é produzido com as versões de JDK, SDK e Gradle declaradas como evidência.
- Dado um aparelho compatível com depuração, quando o APK é instalado, então o app abre e mostra
  `versionName`, `versionCode` e tipo de build.
- Dado o manifesto final, quando ele é inspecionado, então não contém permissões Health Connect,
  Internet ou de armazenamento.
- Dado o repositório, quando é pesquisado por chaves e tokens, então nenhum segredo é incluído
  nos arquivos do módulo Android.

## Rollout, rollback e observabilidade

O rollout é somente instalação local de APK debug. Rollback consiste em desinstalar esse APK;
como não há dados, conta ou sync, não há perda a reconciliar. Evidência permitida: versão,
resultado de build e resultado de instalação, sem screenshot ou log com dados pessoais.

## Dúvidas e decisões pendentes

Nenhuma para esta Issue. A leitura do Health Connect permanece bloqueada pelas decisões e
dependências das Issues posteriores.

## Aprendizados de implementação

### Fatos observados

- O template Android com AGP 9.3 não gerava `BuildConfig` para o módulo por padrão; a tela que
  exibe `VERSION_NAME`, `VERSION_CODE` e `DEBUG` exigiu `buildFeatures.buildConfig = true`.
- A primeira sincronização/build levou vários minutos por baixar e preparar toolchain e
  dependências. Builds posteriores concluíram com sucesso em aproximadamente dois minutos.
- `:app:packageDebug` falhou em algumas tentativas ao não conseguir apagar
  `app/build/intermediates/incremental/packageDebug/tmp/debug/zip-cache`. Esse caminho contém
  somente artefatos temporários gerados, nunca código-fonte ou dados do usuário.
- Após liberar o bloqueio de ambiente, o build debug concluiu e o APK abriu em telefone físico.

### Hipóteses e recuperação, se o bloqueio voltar

- A mensagem do Gradle indica processo com arquivo aberto ou diretório de trabalho dentro do
  destino; sincronização de nuvem e processos Java/Gradle são hipóteses plausíveis, não causa
  comprovada.
- Fechar o Android Studio, encerrar processos Java/Gradle remanescentes e remover apenas
  `connector/android/app/build` é seguro antes de compilar novamente. Nunca remover `app/src`.
- Se a recorrência persistir, avaliar mover o repositório inteiro para fora de uma pasta
  sincronizada, com aprovação explícita; não alterar o diretório de build preventivamente.

## Evidências de validação

- 2026-07-20: Android Studio concluiu o primeiro sync/build do projeto gerado com
  `BUILD SUCCESSFUL` no computador do usuário.
- 2026-07-20: tela de bootstrap e guia local implementados; a recompilação após essa alteração
  está pendente no Android Studio. A tentativa pelo terminal não concluiu porque o Gradle Wrapper
  precisou baixar sua distribuição fora do cache do IDE.
- 2026-07-20: recompilação no Android Studio concluída com `BUILD SUCCESSFUL` em 1 min 50 s,
  após sincronizar a configuração que habilita `BuildConfig`.
- 2026-07-22: build debug concluído com `BUILD SUCCESSFUL` em 2 min 34 s; o APK foi instalado
  e aberto em telefone Android físico, exibindo nome do conector, Fase 00, versão e tipo Debug.
