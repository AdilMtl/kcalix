---
name: end-connector
description: Validar e encerrar uma sessao do Kcalix Connector, comparando alteracoes com a issue KC-XX, executando a matriz de testes, registrando evidencias, atualizando status e handoff e preparando commit isolado na branch feature/kcalix-connector. Usar quando o usuario pedir para fechar, concluir, documentar, versionar ou preparar o handoff de uma sessao Android ou Connector; nao usar para deploy ou merge final.
---

# Encerrar sessao do Kcalix Connector

Fechar a conversa sem confundir fim de sessao, conclusao da issue, commit, push, release ou merge.

## Auditar o trabalho

1. Identificar a issue ativa e reler resultado observavel, escopo, nao escopo, testes, evidencias, Definition of Done, rollback e handoff.
2. Executar `git status --short --branch`, `git diff --stat` e revisar o diff completo dos arquivos da sessao.
3. Confirmar a branch `feature/kcalix-connector`. Se estiver em outra branch, nao versionar o trabalho.
4. Executar `powershell -ExecutionPolicy Bypass -File connector/scripts/audit-connector-session.ps1 -Mode End -Issue KC-XX`.
5. Separar alteracoes da issue, mudancas preexistentes e arquivos fora do escopo. Nunca incluir arquivos alheios para obter um working tree limpo.

## Fechar a validacao

1. Aplicar `connector/docs/agent/TEST_MATRIX.md` a todas as superficies alteradas.
2. Reexecutar os testes afetados apos a ultima mudanca; nao reutilizar resultado anterior a ela.
3. Registrar separadamente:
   - verificacoes estaticas e unitarias;
   - build de APK, PWA ou funcao;
   - emulador;
   - aparelho fisico;
   - Galaxy Watch e Health Connect;
   - passos manuais confirmados pelo usuario;
   - testes nao executados e motivo.
4. Solicitar revisao independente nos gates definidos em `EXPERT_ROUTING.md`.
5. Procurar secrets e dados sensiveis por nomes e caminhos, sem imprimir seus valores.

## Atualizar a fonte de verdade

Atualizar o packet da issue com:

- status real: `pendente`, `em andamento`, `bloqueada` ou `concluida`;
- decisoes e desvios da spec;
- comandos e resultados relevantes;
- evidencias redigidas;
- passos manuais aprovados ou pendentes;
- falhas conhecidas e tentativas que nao devem ser repetidas;
- rollback ainda valido;
- proxima conversa, arquivo inicial e primeiro comando.

Marcar a issue como concluida somente quando cada item da Definition of Done possuir evidencia. Encerrar uma sessao incompleta com um bom handoff e legitimo.

## Versionar sem publicar

1. Apresentar resumo, arquivos da issue, testes, pendencias e proposta de mensagem `KC-XX: descricao`.
2. Criar commit local apenas quando solicitado ou aprovado, adicionando caminhos especificos.
3. Nunca adicionar `.env.local`, `local.properties`, keystore, APK com secrets, tokens, logs pessoais ou artefatos do aparelho.
4. Nao fazer push, merge na `main`, deploy Supabase ou Vercel, publicacao Play Store ou assinatura release sem autorizacao explicita e gate correspondente.

## Entregar o encerramento

Informar:

- issue e status real;
- resultado obtido;
- commit local, se houver;
- testes aprovados, pendentes e impossiveis nesta sessao;
- evidencias registradas;
- riscos ou bloqueios;
- prompt curto para a proxima sessao;
- proxima skill: `$start-connector`.
