# Evidência de validação — KCX-CONN-000

Data: 2026-07-22  
Issue: `KCX-CONN-000`  
Estado: validada no aparelho físico

## Artefato

- APK debug: `connector/android/app/build/outputs/apk/debug/app-debug.apk`
- Package: `app.kcalix.connector`
- Versão: `0.1.0-shell` (`versionCode 2`)
- Tamanho: 13.455.276 bytes
- SHA-256: `D97F4E8EBA1B31019B95D7A7863808EF510DF4A94E315D86E513FFA94128BBFB`
- Ícone-fonte: `connector/android/branding/kcalix-connector-icon-v1.png`
- Ícone Android: `connector/android/app/src/main/res/drawable-nodpi/kcalix_connector_icon.png`

## Build e testes

Ambiente: JDK do Android Studio em `C:\Program Files\Android\Android Studio\jbr`.

```powershell
$env:JAVA_HOME='C:\Program Files\Android\Android Studio\jbr'
.\gradlew.bat testDebugUnitTest assembleDebug
```

Resultado final: `BUILD SUCCESSFUL` em 1 minuto e 51 segundos; 44 tarefas, 7 executadas e
37 atualizadas com o cache de configuração reutilizado.

Resultados JUnit:

- `MockTransferTest`: 5 testes, 0 falhas, 0 erros, 0 ignorados;
- `ExampleUnitTest`: 1 teste, 0 falhas, 0 erros, 0 ignorados.

As fixtures são sintéticas. Nenhum valor pessoal ou dado de saúde real foi usado.

## Inspeção do APK

Executada com Android build-tools `36.0.0`:

```powershell
aapt2 dump permissions app-debug.apk
aapt2 dump badging app-debug.apk
```

Resultado:

- label `Kcalix Connector`;
- activity inicial `app.kcalix.connector.MainActivity`;
- ícone `res/drawable-nodpi-v4/kcalix_connector_icon.png` reportado para as densidades;
- nenhuma permissão `INTERNET`;
- nenhuma permissão `android.permission.health.*`;
- somente `app.kcalix.connector.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION`, de assinatura,
  criada automaticamente pelo AndroidX para receivers internos não exportados.

O manifesto também define `android:allowBackup="false"`.

## Validação no aparelho físico

O aparelho não estava conectado ao ADB durante o build, mas o usuário baixou e instalou o APK
manualmente em 2026-07-22 e confirmou:

- instalação e abertura bem-sucedidas;
- todos os campos numéricos aceitaram entrada e funcionaram;
- a jornada chegou ao estado concluído;
- os valores foram apagados conforme previsto;
- o ícone do Connector apareceu ao lado do app Kcalix, reconhecível como a mesma família e
  suficientemente distinto; a avaliação visual do ícone foi “moderno e bonito”.

Não foram registrados valores, screenshots ou dados pessoais usados no teste.

## Feedback e aprendizados

- A shell manual cumpriu seu objetivo: validou formulário, revisão, conclusão e limpeza antes
  de introduzir Health Connect, autenticação ou escrita real.
- Package e ícone próprios permitem manter Kcalix e Connector instalados simultaneamente sem
  confusão, confirmando o valor do app isolado nesta fase.
- Um defeito de contraste foi percebido no aparelho: texto preto sobre fundo preto em pelo
  menos um elemento descrito pelo usuário como Cardio/card. O fluxo continua utilizável, mas
  o tema escuro precisa definir cores explícitas para todos os estados de texto, menu e campo.
- Esse polish está rastreado em `KCX-CONN-021` e não bloqueia o discovery `KCX-CONN-001`.
- Próxima validação visual deve conferir repouso, foco, preenchido, erro, menu aberto e estado
  desabilitado no aparelho, pois defaults do Material podem variar fora da preview Compose.
