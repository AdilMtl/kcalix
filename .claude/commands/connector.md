# /connector — Trabalhar no Kcalix Connector por Issue

Use este comando para planejar, especificar, implementar ou revisar o conector Android/Health Connect.

## Entrada

`$ARGUMENTS` deve conter um ID como `KCX-CONN-001` e, opcionalmente, o objetivo da sessão.
Se não houver ID, leia o backlog e proponha a próxima Issue `READY`; não inicie código.

## Contexto obrigatório

Leia integralmente e nesta ordem:

1. `memory/kcalix-connector/README.md`
2. `memory/handoff-kcalix-connector-android.md`
3. `memory/kcalix-connector/ROADMAP.md`
4. `memory/kcalix-connector/ISSUES.md`
5. `memory/kcalix-connector/SPEC_TEMPLATE.md`
6. `memory/kcalix-connector/specs/$ID.md`, se existir

## Processo

1. Verifique Git e mudanças existentes sem sobrescrever trabalho do usuário. Para código,
   exija a branch `codex/kcalix-connector`; não implemente na `main`.
2. Confirme status, dependências, fase e gate da Issue.
3. Se a Issue não estiver `READY` ou uma dependência faltar, trabalhe somente para remover
   esse bloqueio e registre a descoberta.
4. Antes de código, crie/complete a spec específica com contratos exatos e peça aprovação.
5. Implemente somente o escopo aprovado, mantendo decisões de domínio fora da camada de UI.
6. Execute os testes definidos na spec e registre evidências; teste no aparelho quando exigido.
7. Atualize status/evidências da Issue, roadmap e memória antes de encerrar.

## Restrições

- Não transformar o Kcalix inteiro em app nativo no piloto.
- Não adicionar Play Store, background sync ou Wear OS fora da fase correspondente.
- Não inserir service-role, chave de assinatura, token ou dado real de saúde no Git/logs.
- Não somar calorias ou vincular treino sem regra de fonte e conflito aprovada.
- Não considerar build verde como prova de utilidade ou segurança.
- Não criar documentação paralela: Codex e Claude atualizam os mesmos arquivos canônicos.
- Não commitar, fazer push, migration remota ou publicar APK sem solicitação explícita.

Ao responder, informe: Issue ativa, gate atual, decisão/entrega da sessão, testes/evidências e próximo passo exato.

$ARGUMENTS
