# Kcalix Connector Android

Bootstrap local da Fase 00. Este módulo não declara permissões, não acessa Health Connect,
não usa internet, não contém secrets e não sincroniza dados.

## Pré-requisitos

- Android Studio Quail 2 ou compatível com AGP 9.3.
- JDK 17 (o JDK embutido do Android Studio é suficiente).
- Android SDK Platform 36.1, Build-Tools 36.0.0 e Platform-Tools.

## Compilar

No PowerShell, a partir desta pasta:

```powershell
.\gradlew.bat :app:assembleDebug
```

O APK fica em `app\build\outputs\apk\debug\app-debug.apk`.

## Instalar no celular

Com depuração USB ativada e o aparelho autorizado:

```powershell
.\gradlew.bat :app:installDebug
```

Ou copie o APK para o telefone e instale manualmente. O aplicativo deve mostrar a tela
"Fase 00 · Bootstrap Android", versão e tipo de build.

## Limites desta fase

Não adicione permissões, Health Connect, Supabase, tokens, login, rede ou dados de saúde sem
uma Issue posterior aprovada.
