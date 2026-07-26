# Registro de sessão — KCX-CONN-001 / transição para observação

Data: 2026-07-23
Issue ativa: `KCX-CONN-001`
Modo: Especificar
Fase e gates: Fase 0 / preparação de G1 e G2
Estado final da Issue: `DRAFTING`
Estado final da spec: `DRAFT`
Código liberado: não
Sessão encerrada: sim

## Resultado observável

A transição entre Health Connect e Kcalix deixou de assumir normalização/match antes da
evidência real. Foram registrados:

- contrato preliminar de observação/export local;
- roteiro executável de revisão por cinco especialidades;
- responsabilidade não técnica do usuário;
- separação entre princípios de reconciliação e algoritmo final de match;
- sequência corrigida entre discovery, PRD, arquitetura, privacidade, permissões e leitura;
- localização da leitura/export real na `KCX-CONN-007`.

## Decisões tomadas

1. O projeto de referência será revisado contra a API oficial antes de qualquer código ser
   copiado ou adaptado.
2. A revisão terá cinco trilhas: Android/Health Connect, dados/serialização, segurança e
   privacidade, produto/domínio e QA no aparelho.
3. O usuário não será responsável por interpretar código, record types, unidades ou riscos.
   Ele disponibiliza o projeto, executa ações orientadas no aparelho e aprova decisões de
   produto explicadas em linguagem comum.
4. O Connector observará o formato real antes de definir normalização e match detalhados.
5. O export diagnóstico terá JSON canônico `kcx-health-observation/1`; HTML poderá ser uma
   visão derivada.
6. O contrato prevê os perfis `STRUCTURAL` e `PRIVATE_FULL`.
7. Todo vínculo/importação começa como sugestão e exige confirmação no piloto.
8. Pesos, tolerâncias e confiança final do match dependem da evidência real da
   `KCX-CONN-007`.
9. `KCX-CONN-006` passou a depender também da decisão arquitetural `KCX-CONN-003`.

## Escopo realizado

- Criação da spec `KCX-CONN-001`.
- Criação do roteiro de revisão do projeto de referência.
- Alinhamento de README, roadmap, backlog, handoff, protocolo de discovery e memória.
- Revisão da documentação oficial vigente do Health Connect para records, metadata, leitura,
  workouts, tipos de dados e sincronização/alterações.

## Explicitamente não realizado

- Nenhuma dependência ou linha de código Android foi alterada nesta sessão.
- Nenhuma permissão Health Connect foi declarada ou solicitada.
- Nenhum dado do Watch foi lido, exportado, persistido ou enviado.
- Nenhuma migration, Edge Function, autenticação ou integração Supabase foi criada.
- Nenhum build, teste Android ou teste no aparelho foi necessário para esta mudança documental.
- Nenhum commit, push, deploy ou distribuição de APK foi realizado.

## Artefatos

Criados:

- `memory/kcalix-connector/specs/KCX-CONN-001.md`
- `memory/kcalix-connector/reviews/KCX-CONN-001-reference-project-review.md`
- este registro de sessão

Atualizados:

- `memory/kcalix-connector/README.md`
- `memory/kcalix-connector/ROADMAP.md`
- `memory/kcalix-connector/ISSUES.md`
- `memory/kcalix-connector/HANDOFF_DISCOVERY_PRODUTO_2026-07-23.md`
- `memory/kcalix-connector/evidence/KCX-CONN-001-discovery.md`
- `memory/MEMORY.md`

## Validação

- Arquivos e links canônicos conferidos.
- `git diff --check` passou para os arquivos versionados alterados nesta sessão.
- A branch ativa permaneceu `codex/kcalix-connector`.
- Mudanças preexistentes de código e arquivos não relacionados foram preservados.

## Gates e bloqueios

- G1: avançou conceitualmente, mas não foi aprovado; depende do PRD `KCX-CONN-002`.
- G2: não iniciado no aparelho; depende da leitura/export real `KCX-CONN-007`.
- `KCX-CONN-001`: permanece `DRAFTING`.
- Spec `KCX-CONN-001`: permanece `DRAFT` e não libera código.
- Bloqueio imediato: projeto de referência ainda não foi disponibilizado.

## Itens não testados

- Licença, versão, arquitetura e comportamento do projeto de referência.
- Versões reais do Android, Samsung Health, Health Connect e Watch.
- Record types e campos realmente publicados pela Samsung.
- Granularidade, atraso, duplicidade, update e delete.
- Conteúdo final permitido no perfil `PRIVATE_FULL`.
- Disponibilidade de calorias ativas e vínculo temporal de body fat/peso.

## Próxima ação exata

Retomar `KCX-CONN-001` em modo **Especificar** quando o usuário disponibilizar o projeto de
referência e informar seu caminho. Executar o roteiro especializado, apresentar a matriz
`ADOTAR | ADAPTAR | REJEITAR | NÃO COMPROVADO` e somente então solicitar aprovação da spec.
