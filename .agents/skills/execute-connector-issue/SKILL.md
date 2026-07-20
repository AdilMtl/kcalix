---
name: execute-connector-issue
description: Planejar, implementar, diagnosticar, testar ou revisar uma issue KC-XX do Kcalix Connector em Kotlin, Jetpack Compose, Gradle, ADB, Health Connect, Supabase ou PWA, seguindo o packet autocontido, roteando especialistas e registrando evidencias. Usar quando o usuario pedir para executar, continuar, corrigir, testar ou revisar trabalho do Connector; nao usar para iniciar uma sessao sem implementacao nem para fechar ou versionar a sessao.
---

# Executar issue do Kcalix Connector

Executar uma unica issue `KC-XX` de forma rastreavel. Tratar o packet como contrato e os testes como evidencia, nao como sugestao.

## Estabelecer o escopo

1. Confirmar que `$start-connector` ja preparou a sessao. Se nao preparou, executar o fluxo de abertura antes de editar.
2. Identificar uma unica issue e ler integralmente seu packet, dependencias e referencias vinculadas.
3. Confirmar que dependencias anteriores possuem evidencia; nao inferir conclusao apenas pelo status escrito.
4. Declarar resultado observavel, escopo, nao escopo, arquivos provaveis, riscos e plano de validacao.
5. Separar tarefas executaveis pelo agente de etapas manuais do usuario. Continuar com todo trabalho independente enquanto uma etapa manual nao bloquear o proximo resultado.

## Carregar competencia sob demanda

Ler `connector/docs/agent/ANDROID_ENGINEERING.md`, `EXPERT_ROUTING.md` e `TEST_MATRIX.md` apenas nas partes relacionadas a issue.

- Para Android, Kotlin ou Compose, aplicar arquitetura unidirecional, estado de tela explicito, ViewModel em nivel de tela, coroutines estruturadas, coleta consciente de lifecycle e limites claros entre UI, dominio e dados.
- Para Gradle, usar somente o Wrapper versionado do projeto; nao depender de uma instalacao global.
- Para ADB, emulador ou aparelho real, identificar o alvo exato antes de instalar, limpar dados, conceder permissao ou executar testes instrumentados.
- Para Supabase, manter autenticacao por usuario, RLS, ownership e contratos idempotentes; nunca usar `service_role` no aplicativo.
- Para Health Connect, solicitar o minimo de permissoes, modelar grant/deny/revoke, comecar em leitura e evitar logs, persistencia ou upload de amostras brutas.
- Para PWA, preservar hooks, contratos e dados atuais; modificar `src/` somente quando o packet autorizar.
- Para versoes de SDKs, permissoes, politicas ou APIs, verificar documentacao oficial atual antes de fixar valores. Registrar a decisao no packet ou na spec, nao na memoria informal da conversa.

## Usar especialistas

Consultar o roteamento por issue e risco.

- Delegar subtarefas concretas e independentes quando a plataforma oferecer subagentes.
- Fornecer ao especialista o packet e os artefatos brutos necessarios, sem antecipar a resposta desejada.
- Exigir revisao independente para auth, RLS ou migrations, dados de saude, permissoes Health Connect e release.
- Tratar pareceres como insumo; verificar afirmacoes e integrar apenas mudancas dentro do escopo.
- Se subagentes nao estiverem disponiveis, executar as mesmas checklists por papeis em passes separados e registrar a limitacao.

## Implementar em fatias verificaveis

1. Preservar mudancas preexistentes e nunca desfazer trabalho alheio.
2. Fazer a menor alteracao que prove o resultado da issue.
3. Manter codigo Android em `connector/android/`; executar npm na raiz e Gradle apenas no projeto Android.
4. Nao antecipar features de issues futuras para aproveitar a sessao.
5. Manter segredos e configuracoes locais fora do Git: `.env.local`, `local.properties`, keystores, senhas e tokens.
6. Antes de cada operacao externa ou irreversivel, confirmar que o packet e a autorizacao cobrem instalacao, migration remota, deploy, assinatura, push ou merge.
7. Parar e explicar quando uma escolha ausente mudar arquitetura, privacidade, schema, custo ou comportamento de dados; nao preencher essa decisao silenciosamente.

## Validar e registrar

1. Selecionar na matriz todos os testes das superficies alteradas.
2. Executar primeiro testes baratos e locais; depois build, emulador, aparelho e fluxo manual.
3. Registrar comando, ambiente ou alvo, resultado e evidencia util. Redigir logs para remover tokens, email, identificadores e dados de saude.
4. Nunca converter nao executado em aprovado. Distinguir automatizado, emulador, aparelho, relogio e verificacao manual.
5. Atualizar no packet decisoes, desvios, erros, evidencias e proximo passo mesmo quando a issue permanecer incompleta.
6. Invocar `$end-connector` quando a fatia terminar; nao fazer merge ou publicacao como parte desta skill.
