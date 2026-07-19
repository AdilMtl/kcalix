# Pacotes executáveis do Kcalix Connector

Este diretório existe para impedir perda de contexto entre conversas. `docs/ISSUES.md` é o mapa;
cada arquivo daqui é o contrato de execução de uma issue.

## Como usar em uma nova conversa

Prompt mínimo:

> Estamos na branch `feature/kcalix-connector`. Leia `connector/README.md` e execute a issue
> `connector/issues/.../KC-XX.md`. Não amplie o escopo. Valide dependências, siga os testes e
> atualize evidências/handoff antes de encerrar.

O agente deve ler o arquivo inteiro. Se uma decisão do usuário contradisser o packet, registrar a
nova decisão no documento antes de implementar.

## Padrão obrigatório de um packet

- status e resultado observável;
- contexto e motivo da ordem;
- dependências/estado inicial;
- inputs do usuário;
- escopo e não escopo;
- decisões e contratos;
- arquivos esperados;
- divisão agente/usuário;
- testes e evidências;
- Definition of Done;
- rollback e handoff.

Um backlog resumido não é autorização para implementar. Issues posteriores a KC-06 receberão
packets com este padrão quando as evidências do spike eliminarem suposições sobre o aparelho.

## Pacotes disponíveis

- [Fase Zero e spike inicial](phase-0/README.md)
