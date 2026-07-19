# Stack e setup Android — guia para primeira experiência

**Ambiente-alvo:** Windows + PowerShell + Claude Code

**Data de referência:** 2026-07-19

## 1. Situação desta máquina

Na abertura desta spec, os seguintes comandos/ferramentas não estavam disponíveis no PATH:

- `java` / `javac`;
- `adb`;
- `sdkmanager`;
- `gradle`;
- Android Studio;
- `ANDROID_HOME` / `ANDROID_SDK_ROOT`.

Isso será resolvido em KC-01. Não instalar Gradle global: o projeto versionará o Gradle Wrapper.

## 2. Ferramentas gratuitas

| Ferramenta | Função | Custo |
|---|---|---|
| Android Studio Quail 2 2026.1.2 | SDK Manager, emulador, profiler e editor opcional | R$ 0 |
| JBR/JDK 17 do Android Studio | Compilar via AGP | R$ 0 |
| Android SDK 36 + Build Tools 36.0.0 | Compilar Android 16 | R$ 0 |
| Platform Tools/ADB | Instalar APK, abrir app e ler logs | R$ 0 |
| Gradle Wrapper 9.5.0 + AGP 9.3.0 | Build reproduzível | R$ 0 |
| Kotlin/Compose/Jetpack | Código, UI, Health Connect, Room, WorkManager | R$ 0 |
| Health Connect Toolbox | Dados sintéticos e testes | R$ 0 |
| GitHub Actions | CI dentro da cota do repositório/plano | R$ 0 dentro da cota |
| Keystore local | Assinatura do APK | R$ 0 |

O Supabase permanece no plano atual durante o piloto N=1. Alertas de uso/rate limit devem ser
monitorados, mas não é necessária infraestrutura nova paga.

Distribuição direta/ADB não exige Play Store. A opção Android Developer Console Limited
Distribution anunciada para agosto de 2026 é gratuita para até 20 aparelhos. Distribuição
completa/Play Console pode custar US$ 25 uma vez e não faz parte do MVP.

## 3. Instalação inicial — ações do usuário

1. Baixar o Android Studio no site oficial.
2. Instalar Android Studio, Android SDK, Platform Tools e Emulator.
3. Aceitar licenças do SDK.
4. No SDK Manager, instalar:
   - Android SDK Platform 36;
   - Android SDK Build-Tools 36.0.0;
   - Android SDK Platform-Tools;
   - Android SDK Command-line Tools (latest);
   - Android Emulator.
5. Anotar o caminho do SDK, normalmente `%LOCALAPPDATA%\Android\Sdk`.
6. Se usar emulador, habilitar virtualização/Windows Hypervisor quando solicitado.
7. No celular, habilitar Opções do desenvolvedor e Depuração USB.
8. Instalar driver Samsung USB se o Windows não reconhecer o aparelho.
9. Conectar, desbloquear e aceitar manualmente o fingerprint RSA.

O usuário também realiza manualmente login/2FA, pareamento do Watch, consentimentos Health
Connect, geração de treino/medição real e escolha/backup da senha da keystore. Senhas, JWTs,
`service_role` e chave da keystore não devem ser enviados ao Claude Code ou registrados em logs.

## 4. Validação no PowerShell

Depois da instalação, usar o caminho mostrado pelo SDK Manager:

```powershell
$AndroidSdkPath = Join-Path $env:LOCALAPPDATA 'Android\Sdk'
& "$AndroidSdkPath\cmdline-tools\latest\bin\sdkmanager.bat" --list
& "$AndroidSdkPath\platform-tools\adb.exe" devices
```

O primeiro build baixa dependências e pode consumir centenas de MB ou alguns GB. Falhas de
rede/proxy nessa etapa não significam, por si só, erro no código.

## 5. Projeto que KC-02 criará

- Caminho: `connector/android/`.
- Template: Empty Activity + Compose, Kotlin DSL.
- `applicationId` definitivo sugerido: `com.kcalix.connector`.
- `minSdk 28`, `compileSdk 36`, `targetSdk 36`.
- AGP 9.3.0, Gradle Wrapper 9.5.0 e Compose BOM 2026.06.00.
- JDK 17 via `GRADLE_LOCAL_JAVA_HOME`/JBR do Studio.
- Health Connect 1.1.0 estável.

AGP 9 já possui Kotlin embutido. Não adicionar o plugin antigo
`org.jetbrains.kotlin.android`; muitos tutoriais anteriores ao AGP 9 estão desatualizados.

Versionar `gradlew`, `gradlew.bat` e `gradle/wrapper/*`. Não versionar `local.properties`,
`.idea`, keystores, propriedades de assinatura ou APKs.

## 6. Comandos que o Claude Code usará

Dentro de `connector/android/`:

```powershell
.\gradlew.bat --version
.\gradlew.bat tasks
.\gradlew.bat clean lint testDebugUnitTest assembleDebug
.\gradlew.bat connectedDebugAndroidTest
.\gradlew.bat installDebug
```

APK debug esperado:

```text
connector/android/app/build/outputs/apk/debug/app-debug.apk
```

Comandos ADB úteis após o aparelho já estar autorizado:

```powershell
$AndroidSdkPath = Join-Path $env:LOCALAPPDATA 'Android\Sdk'
& "$AndroidSdkPath\platform-tools\adb.exe" devices
& "$AndroidSdkPath\platform-tools\adb.exe" install -r "app\build\outputs\apk\debug\app-debug.apk"
```

## 7. Emulador versus aparelho

### Emulador API 36 com Google Play/Google APIs

Serve para UI, permissões, dados sintéticos, paginação, offline, rotação, process death e testes
instrumentados. No primeiro setup, criar o AVD pelo Device Manager reduz erros de imagem.

### Galaxy Watch 5 + telefone real

É obrigatório para validar o fluxo Samsung, `dataOrigin`, latência, FC, calorias, distância e
BIA. O emulador não representa Samsung Health/One UI nem a sincronização do relógio.

## 8. O que o Claude Code automatiza

- scaffold e manutenção de Kotlin/Gradle/manifest;
- migrations, RPC e Edge Function;
- testes, lint, builds e interpretação de erros;
- `adb install`, launch e logcat depois da autorização do aparelho;
- scripts e runbooks;
- versionCode, checksum e checklist de release;
- CI sem segredos de release.

## 9. O que permanece manual

- instalar Studio/SDK e aceitar licenças;
- habilitar virtualização, depuração e aceitar RSA;
- login Samsung/Kcalix e 2FA;
- parear Watch e conceder permissões nas telas do sistema;
- produzir/validar dados reais;
- confirmar instalação de fonte desconhecida;
- escolher o `applicationId` antes da primeira distribuição;
- criar senha, guardar e recuperar backups da keystore;
- aprovar mudanças externas no Supabase e distribuição.

## 10. CI recomendada

GitHub Actions em Ubuntu, JDK 17, cache Gradle e:

```text
./gradlew --no-daemon lint testDebugUnitTest assembleDebug
```

Não publicar APK release assinado como artifact público. Testes Samsung permanecem manuais.
Repos privados têm cota mensal; o workflow deve ser curto e acionado apenas nas mudanças do
diretório Android/backend do conector.

## 11. Assinatura e atualização

- Debug keystore é automática e não serve para distribuição final.
- A release key não expira, mas sua perda impede atualizar o APK instalado por cima.
- Guardar dois backups cifrados fora do repositório e o SHA-256 do certificado.
- Toda atualização exige mesmo `applicationId`, mesma chave e `versionCode` maior.
- Testar tanto upgrade com `adb install -r` quanto reinstalação limpa.

## 12. Armadilhas conhecidas

- Não misturar comandos npm da raiz com Gradle de `connector/android/`.
- Em PowerShell usar `.\gradlew.bat`, não copiar cegamente `./gradlew`.
- OneDrive e Android Studio podem disputar locks; fechar o Studio quando necessário.
- `ANDROID_HOME`, SDK do Studio e JDK do terminal precisam apontar para instalações compatíveis.
- `adb devices` como `unauthorized` exige aceitar RSA; lista vazia normalmente indica cabo,
  driver ou modo USB.
- Imagem AOSP sem Google Play não é ambiente adequado para Health Connect.
- Não testar somente debug; update final depende da chave release.
- Não commitar `.jks`, `.keystore`, `keystore.properties`, `local.properties`, APKs ou segredos.

## 13. Referências

- [Android Studio releases](https://developer.android.com/studio/releases)
- [AGP 9.3](https://developer.android.com/build/releases/agp-9-3-0-release-notes)
- [JDK no Android build](https://developer.android.com/build/jdks)
- [Kotlin embutido no AGP 9](https://developer.android.com/build/migrate-to-built-in-kotlin)
- [Build pela linha de comando](https://developer.android.com/build/building-cmdline)
- [Testes pela linha de comando](https://developer.android.com/studio/test/command-line)
- [Executar em aparelho](https://developer.android.com/studio/run/device)
- [Health Connect Toolbox](https://developer.android.com/health-and-fitness/health-connect/test/health-connect-toolbox)
- [Limited Distribution](https://developer.android.com/developer-verification/guides/limited-distribution)
- [GitHub Actions: cobrança e uso](https://docs.github.com/en/actions/concepts/billing-and-usage)
