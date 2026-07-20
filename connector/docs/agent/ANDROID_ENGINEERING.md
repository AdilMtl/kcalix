# Referência de engenharia Android do Connector

Usar esta referência somente em issues que toquem Android, Gradle, ADB, Health Connect,
autenticação móvel ou testes em dispositivo. O packet continua definindo o escopo.

## Stack e custo

A base aprovada para o piloto privado é:

- Kotlin;
- Jetpack Compose;
- Android Studio com JDK/JBR integrado;
- Android SDK e Platform Tools;
- Gradle Wrapper versionado no projeto;
- ADB e emulador Android;
- biblioteca oficial Jetpack Health Connect;
- cliente Kotlin/HTTP compatível com o contrato Supabase decidido na KC-03.

Essas ferramentas não exigem assinatura mensal. Custos de hardware, publicação futura ou uso
acima das cotas dos serviços existentes não fazem parte da gratuidade da toolchain.

Não instalar Gradle globalmente para executar o projeto. Usar `gradlew.bat` no Windows e
`./gradlew` em ambientes Unix. Fixar versões compatíveis na KC-02 e atualizar somente em issue
própria, com build e testes completos.

## Arquitetura inicial

Preferir a menor arquitetura que preserve testes e evolução:

```text
Compose screen
  -> screen-level ViewModel
  -> use case/repository boundary quando houver regra ou I/O
  -> Supabase, armazenamento seguro ou Health Connect
```

Aplicar:

- aplicação single-activity enquanto o escopo continuar pequeno;
- estado unidirecional: a UI envia ações e observa estado imutável;
- ViewModel no nível de tela, nunca em componentes visuais reutilizáveis;
- `StateFlow`/Flow e `suspend` para operações assíncronas;
- coleta lifecycle-aware em Compose;
- coroutines estruturadas, sem bloquear a main thread;
- dependências atrás de interfaces quando precisarem de fake em teste;
- modelos externos separados dos modelos de UI quando contratos começarem a divergir;
- estados explícitos de carregando, sucesso, vazio, erro recuperável e ação necessária.

Não criar camadas, módulos ou injeção de dependência apenas por padrão arquitetural. Introduzir
complexidade quando uma issue demonstrar a necessidade.

Referência oficial: [Android architecture recommendations](https://developer.android.com/topic/architecture/recommendations).

## Compose e experiência

- Manter composables focados em renderização e eventos.
- Fazer state hoisting para permitir preview e teste.
- Não passar `Activity`, `Context` ou cliente de rede pela árvore de UI.
- Usar recursos para textos e conteúdo acessível.
- Garantir alvos de toque, contraste, rotação/recriação e teclado.
- Representar claramente instalação, conta, rede, Health Connect e última ação.
- Nunca esconder deny/revoke de permissão como erro genérico.

## Build e configuração

- Versionar Wrapper, scripts, catálogo de versões e arquivos de build necessários.
- Não versionar `local.properties`, caches, APKs temporários ou diretórios de build.
- Usar `BuildConfig` apenas para valores públicos e não sensíveis.
- A URL do projeto e a chave publicável/anon podem ser públicas; senhas, refresh tokens,
  `service_role` e keystore nunca entram no código.
- Manter diferenças debug/release mínimas e explícitas.
- Não habilitar cleartext globalmente. Se uma issue precisar de backend local, limitar a
  configuração ao debug e ao host necessário.
- Revisar dependências adicionadas, licença, manutenção e necessidade antes de adotá-las.

Referência oficial: [Gradle Wrapper](https://docs.gradle.org/current/userguide/gradle_wrapper.html).

## Autenticação e Supabase

- Usar a mesma conta Kcalix e permitir logout local completo.
- Derivar usuário no backend a partir do JWT; não aceitar `userId` escolhido pelo cliente.
- Manter RLS e ownership por usuário em toda tabela.
- Armazenar sessão com mecanismo Android apropriado e reduzir exposição do token.
- Não imprimir tokens, email completo ou resposta bruta de autenticação.
- Modelar token expirado, refresh, offline, relógio incorreto e logout.
- Não aplicar migration remota apenas porque o arquivo SQL foi criado.
- Tratar SDK de comunidade como dependência que precisa de versão e threat review, não como
  autoridade sobre o contrato de segurança.

Referências oficiais: [Supabase Kotlin quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/kotlin) e [Kotlin Auth](https://supabase.com/docs/reference/kotlin/introduction).

## Health Connect e dados sensíveis

- Começar com leitura e menor conjunto de permissões.
- Verificar disponibilidade antes de oferecer conexão.
- Explicar finalidade antes de abrir o diálogo do sistema.
- Modelar grant, deny, cancelamento e revoke posterior.
- Não assumir que Samsung Health publicou determinado tipo: comprovar no aparelho.
- Preservar origem, identificador externo e timestamps necessários à idempotência.
- Preferir agregados e resumos locais quando suficientes.
- Não registrar amostras brutas de frequência cardíaca, payloads, tokens ou identificadores.
- Não enviar dados reais a subagentes ou ferramentas externas.
- Não transformar métricas em diagnóstico ou recomendação médica.
- Manter upload desligado nas issues que comprovam apenas disponibilidade ou leitura local.

Referências oficiais: [Health Connect — get started](https://developer.android.com/health-and-fitness/health-connect/get-started) e [test cases](https://developer.android.com/health-and-fitness/health-connect/test/test-cases).

## Estratégia de testes

Aplicar a pirâmide:

1. testes Kotlin puros para regras, normalização e idempotência;
2. testes de ViewModel/repository com fakes;
3. testes Compose/instrumentados para jornadas críticas;
4. build e instalação no emulador;
5. testes manuais no telefone;
6. fluxo real Samsung Health → Health Connect apenas nos gates previstos.

Emulador prova UI, lifecycle, instalação e parte das permissões. Ele não prova que o Galaxy Watch
sincroniza dados reais nem que a Samsung entrega todos os record types.

Usar a matriz detalhada em `TEST_MATRIX.md`.
