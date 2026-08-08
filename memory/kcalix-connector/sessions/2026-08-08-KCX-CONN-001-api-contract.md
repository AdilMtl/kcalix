# Sessão 2026-08-08 — KCX-CONN-001 APIs e contrato de observação

Issue: `KCX-CONN-001`
Modo: Especificar
Branch: `codex/kcalix-connector`
Resultado: recomendação e contrato aprovados tecnicamente; Issue concluída; código continua bloqueado.

## O que foi confirmado

- API estável do piloto: `androidx.health.connect:connect-client:1.1.0`.
- Health Connect disponível a partir de Android 9/API 28; o app pode manter `minSdk 26` com
  estado explícito em API 26/27.
- Leitura foreground, janela máxima Kcalix de 7 dias, sem permissões de background/histórico.
- Semântica `[start, end)`, ordem ascendente, páginas de 1000 e consumo até token nulo.
- Seis record types/permissões: exercício, FC, distância, calorias totais, body fat e peso.
- `ActiveCaloriesBurnedRecord` excluído da v1 porque a Samsung não o lista no mapeamento
  consultado e ele não é necessário aos três casos aprovados.
- Samsung declara sync dos seis sinais selecionados, mas presença, origem, atraso e campos no
  aparelho do piloto continuam não comprovados até `KCX-CONN-007`.
- Relações entre sessão e métricas são temporais/inferidas, nunca vínculo garantido.
- Zonas de FC não são derivadas até existir política versionada no PRD.

## Artefatos produzidos

- `evidence/KCX-CONN-001-api-review-2026-08-08.md`
- `contracts/kcx-health-observation-1.md`
- `contracts/kcx-health-observation-1.schema.json`
- fixtures sintéticas `STRUCTURAL` e `PRIVATE_FULL`
- spec, review, protocolo, Issues, Roadmap, índice e memória atualizados.

Nenhum arquivo em `connector/android/` foi alterado; nenhuma dependência, permissão, rede ou
dado real foi adicionado.

## Validação

- Os três arquivos JSON passaram em `ConvertFrom-Json`.
- As duas fixtures passaram no schema Draft 2020-12 com Ajv 8.18.0 já presente como dependência
  transitiva de `workbox-build`.
- O primeiro probe por `python jsonschema` falhou porque o pacote não está instalado; nenhuma
  dependência foi baixada.
- O teste negativo rejeitou `schemaVersion` inválida; a auditoria confirmou seis permissões
  exatas e ausência de valores/IDs/device brutos no perfil `STRUCTURAL`.
- `npm run build` passou; houve apenas os avisos preexistentes de chunk maior que 500 kB e
  base `caniuse-lite` desatualizada.
- `git diff --check` passou no encerramento.

## Aprovação técnica e divisão de responsabilidade

A revisão técnica aprovou:

1. seis permissões mínimas, sem calorias ativas;
2. janela diagnóstica de 7 dias e leitura somente foreground;
3. perfis `STRUCTURAL` e `PRIVATE_FULL`;
4. nenhuma zona de FC na observação, até política versionada no PRD;
5. segurança realista do documento: temporário privado + validação do destino + exclusão best
   effort, sem prometer atomicidade que o DocumentsProvider não garante.

Os testes automáticos aceitaram as duas fixtures, rejeitaram versão de schema inválida,
confirmaram que `STRUCTURAL` não contém valores/IDs/device brutos e conferiram as seis
permissões exatas. O usuário esclareceu que não deve revisar engenharia: sua participação fica
restrita a escolhas reais de produto e execução orientada de testes físicos. A spec foi marcada
`APPROVED`, a Issue `DONE` e `KCX-CONN-002` ficou `READY`.

## Aprendizado operacional registrado

- Aprovação técnica não é uma pergunta ao usuário: agente/revisor decide por documentação,
  testes e critérios observáveis.
- O usuário recebe somente decisões de produto realmente abertas e instruções exatas para
  testes físicos; não recebe schema/API para “aprovar”.
- `/start` precisa rotear pela branch e pela `KCX-CONN-NNN`, sem presumir `main`.
- `/end` do Connector atualiza Issue, spec, evidências, roadmap, índice, memória e log, sem
  forçar versionamento/CHANGELOG/deploy da PWA.
- Commit, push, deploy, migration remota e distribuição de APK exigem pedido explícito.

As regras foram incorporadas à skill, checklist, `/start`, `/connector` e índice operacional.
O `/end` genérico continua sendo o fluxo da PWA; para o Connector, a skill, o `/connector` e o
contrato de End Session do índice têm precedência explícita.

## Retomada exata

- Branch: `codex/kcalix-connector`.
- Próxima Issue: `KCX-CONN-002`, estado `READY`.
- Modo: `Especificar`.
- Fase/gate: Fase 0 / preparação de G1 — Valor.
- Resultado da próxima sessão: PRD enxuto do piloto, com três casos, baseline manual, métricas
  de 2–4 semanas, não objetivos e critérios go/no-go.
- Incluído: sintetizar respostas já registradas e resolver tecnicamente métricas/estrutura.
- Não incluído: Kotlin, permissões, Health Connect real, Supabase, APK, commit ou push.
- Primeira ação: reler o handoff de produto e as decisões da `KCX-CONN-001`, então criar a spec
  `specs/KCX-CONN-002.md` e o artefato de PRD sem repetir a entrevista já concluída.
- Ação do usuário no início: nenhuma; chamá-lo apenas se surgir escolha de produto ainda ausente.
