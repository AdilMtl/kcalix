# Matriz de testes do Kcalix Connector

Executar apenas comandos suportados pelo estado atual da issue. A inexistência do projeto Android
antes da KC-02 não é falha; executar Gradle antes disso é erro de processo.

## Seleção por superfície

| Mudança | Verificações mínimas |
|---|---|
| documentação/packets/skills | links e paths, auditor de sessão, validador de skills, diff |
| `src/`, config Vite ou PWA | `npm run lint`, `npm run test`, `npm run build` |
| Android Kotlin puro | testes unitários, lint e assemble debug |
| Compose/navegação | unitários + testes Compose relevantes + emulador |
| Gradle/dependências | sync/Wrapper, lint, testes, assemble; build limpo quando necessário |
| auth/rede Android | unitários com fake + expiração/offline + fluxo em emulador/aparelho |
| migration/RLS/Edge Function | testes locais disponíveis + duas contas + casos sem JWT/cross-tenant |
| Health Connect | unitários/fakes + grant/deny/revoke + aparelho real quando o packet exigir |
| fluxo Android → PWA | suites Android, backend e PWA + jornada ponta a ponta e exclusão |

Se uma alteração tocar várias linhas, acumular todas as verificações.

## Comandos PWA

Executar na raiz:

```powershell
npm run lint
npm run test
npm run build
```

Se a política do PowerShell bloquear `npm.ps1`, usar o executável aprovado do Node sem alterar a
política global.

## Comandos Android

Executar em `connector/android/` somente depois que KC-02 criar o Wrapper:

```powershell
.\gradlew.bat --version
.\gradlew.bat lintDebug
.\gradlew.bat testDebugUnitTest
.\gradlew.bat assembleDebug
```

Quando houver emulador/aparelho autorizado e testes instrumentados:

```powershell
adb devices -l
.\gradlew.bat connectedDebugAndroidTest
```

Antes de qualquer `adb install`, identificar serial e pacote. Com mais de um alvo, usar
`adb -s <serial>`. Não executar `adb uninstall`, `pm clear`, wipe ou revoke fora do roteiro
manual aprovado.

A tarefa Gradle exata prevalece sobre esta referência se o projeto gerar variantes diferentes.

## Emulador e instalação

Registrar:

- AVD, API e arquitetura;
- serial selecionado;
- variante e caminho do APK;
- primeira instalação;
- abertura e estado inicial;
- rotação/recriação quando relevante;
- segunda instalação por cima;
- preservação ou limpeza esperada de sessão/dado;
- log redigido do erro se falhar.

Emulador não comprova sincronização do Galaxy Watch.

## Aparelho, Watch e Health Connect

Registrar modelo/versão sem identificadores únicos. Testar conforme o packet:

- app/Health Connect ausente, indisponível ou desatualizado;
- permissão concedida;
- permissão negada;
- permissão revogada fora do app;
- retorno ao app e recomposição de estado;
- zero registros;
- registros Samsung presentes;
- origem e atraso observados;
- offline/reconexão quando aplicável.

Nunca colar valores fisiológicos, record IDs, tokens ou payloads completos no packet. Usar
contagens, tipos, estados e timestamps arredondados quando suficientes.

## Supabase e segurança

Antes de qualquer teste remoto, confirmar projeto e autorização. Cobrir quando aplicável:

- sem JWT;
- JWT expirado;
- usuário A não lê/escreve usuário B;
- `userId` do payload é ignorado ou rejeitado;
- reenvio idêntico não duplica;
- conflito retorna erro controlado;
- conexão revogada bloqueia ingestão;
- exclusão remove apenas dado importado de teste;
- PWA canônica permanece intacta.

Criar migration não autoriza `supabase db push`. Criar Edge Function não autoriza deploy.

## Evidência mínima

Para cada teste registrar:

```text
Teste:
Comando ou roteiro:
Ambiente/alvo:
Resultado: passou | falhou | não executado
Evidência redigida:
Limitação/próximo passo:
```

Não usar apenas frases como “funcionou” ou “testado mentalmente”. Um passo manual só passa após
confirmação do usuário ou observação direta permitida.
