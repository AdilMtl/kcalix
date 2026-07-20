---
name: start-connector
description: Iniciar ou retomar uma sessao de trabalho do Kcalix Connector na branch dedicada, carregando a issue KC-XX, verificando ambiente Android, estado Git, dependencias, testes de baseline, acoes manuais e especialistas necessarios. Usar quando o usuario pedir para comecar, abrir, preparar ou retomar uma sessao do Connector, Android, Health Connect ou uma issue KC-XX; nao usar para trabalho comum da PWA Kcalix.
---

# Iniciar sessao do Kcalix Connector

Preparar a sessao sem implementar a issue. Transformar o packet `KC-XX` no contrato operacional da conversa.

## Executar a abertura

1. Identificar a issue informada pelo usuario. Se nenhuma for informada, consultar `connector/docs/ISSUES.md` e apontar a proxima issue desbloqueada; pedir escolha somente se houver mais de uma candidata real.
2. Executar `git status --short --branch`, `git branch --show-current` e `git log -1 --oneline`.
3. Exigir a branch `feature/kcalix-connector`. Se outra branch estiver ativa, nao editar arquivos; preservar mudancas existentes e explicar a forma segura de entrar na branch correta.
4. Ler integralmente, nesta ordem:
   - `connector/README.md`;
   - o packet da issue em `connector/issues/`;
   - apenas os documentos e dependencias indicados pelo packet;
   - `connector/docs/AGENT_SKILLS.md` e as referencias tecnicas exigidas pela superficie da issue.
5. Executar `powershell -ExecutionPolicy Bypass -File connector/scripts/audit-connector-session.ps1 -Mode Start -Issue KC-XX` quando o script estiver disponivel.
6. Separar fatos comprovados, suposicoes, inputs pendentes do usuario e dependencias externas. Nao presumir instalacao, login, permissao, aparelho conectado ou estado remoto.
7. Classificar as superficies da sessao: documentacao, Windows/toolchain, Android/Kotlin/Compose, Gradle, ADB/emulador, aparelho real, Health Connect, Supabase ou PWA.
8. Consultar `connector/docs/agent/EXPERT_ROUTING.md` e selecionar somente as especialidades pertinentes. Quando subagentes estiverem disponiveis, delegar revisoes independentes nos gates indicados; manter a execucao principal responsavel pela decisao final.
9. Escolher o baseline em `connector/docs/agent/TEST_MATRIX.md`. Nao executar comandos Android antes da issue que instala ou cria a ferramenta correspondente. Nao executar apenas `npm run build` quando a issue nao tocar a PWA.
10. Identificar as acoes manuais inevitaveis: instalar programa, aceitar licenca, criar emulador, conectar telefone, autorizar depuracao, conceder permissao ou produzir dado no relogio. Nunca declarar essas acoes concluidas sem confirmacao do usuario ou evidencia observavel.

## Apresentar o contrato da sessao

Entregar um resumo curto contendo:

- branch e estado do working tree;
- issue, status, dependencias e resultado observavel;
- escopo e nao escopo;
- superficies e especialistas selecionados;
- baseline executado e resultado;
- acoes do agente e acoes do usuario;
- testes e evidencias que encerrarao a sessao;
- primeiro passo concreto.

Finalizar informando que a sessao esta preparada para `$execute-connector-issue`; nao iniciar implementacao apenas por ter executado esta skill.

## Aplicar limites

- Nao trocar de branch se isso puder carregar ou sobrescrever mudancas preexistentes.
- Nao instalar dependencias, aplicar migration, fazer deploy, push, merge, assinar APK ou alterar dispositivo sem autorizacao correspondente.
- Nao expor `.env.local`, tokens, senhas, keystores, dados de saude ou payloads pessoais.
- Nao alterar a ordem das issues sem registrar a decisao no backlog e no packet.
- Nao substituir o packet por um resumo; o packet permanece a fonte primaria da sessao.
