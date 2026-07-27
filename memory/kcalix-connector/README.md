# Kcalix Connector — índice operacional

**Status:** Fase 00 concluída; decisões de produto e baseline técnico oficial da
`KCX-CONN-001` registrados em 2026-07-27; contrato detalhado e parecer final ainda pendentes

**Decisão vigente:** validar primeiro um APK privado, instalado localmente, que leia o Health Connect e sincronize manualmente com o Kcalix  

**Próxima Issue:** `KCX-CONN-001` — concluir a revisão por especialidade e fechar o contrato
do export diagnóstico a partir do sample oficial já pinado. A leitura real ocorrerá na
`KCX-CONN-007`, depois de PRD, arquitetura, privacidade e permissões aprovados.
`KCX-CONN-021` preserva o feedback de contraste para polish.

**Como iniciar a próxima sessão:** abrir em modo `Especificar`, ler integralmente o
[handoff de descoberta de produto](HANDOFF_DISCOVERY_PRODUTO_2026-07-23.md), a
[spec KCX-CONN-001](specs/KCX-CONN-001.md) e o
[roteiro de revisão especializada](reviews/KCX-CONN-001-reference-project-review.md).
Não repetir a entrevista de produto: cardio sem redigitação, musculação enriquecida e body fat
BIA são os três casos do piloto. Executar a comparação técnica documentada e apresentar as
recomendações restantes para aprovação. Não escrever integração, pedir permissões, ler dados
reais ou enviar dados.

Este diretório é a fonte canônica para todas as próximas sessões. O handoff de pesquisa
continua em [`../handoff-kcalix-connector-android.md`](../handoff-kcalix-connector-android.md),
mas não deve ser usado sozinho para iniciar implementação.

## Ordem obrigatória de leitura

1. [`../handoff-kcalix-connector-android.md`](../handoff-kcalix-connector-android.md) — pesquisa, decisão e limites do produto.
2. [`HANDOFF_DISCOVERY_PRODUTO_2026-07-23.md`](HANDOFF_DISCOVERY_PRODUTO_2026-07-23.md) —
   entrevista, decisões, esquema preliminar e perguntas ainda abertas.
3. [`ROADMAP.md`](ROADMAP.md) — fases, gates e sequência de entrega.
4. [`ISSUES.md`](ISSUES.md) — backlog executável e dependências.
5. [`SPEC_TEMPLATE.md`](SPEC_TEMPLATE.md) — contrato mínimo de cada spec técnica.
6. A spec específica da Issue, quando existir em `specs/KCX-CONN-NNN.md`.

## Hierarquia de artefatos

```text
Pesquisa/handoff
  -> PRD da iniciativa (objetivo, usuário, valor, métricas e não objetivos)
    -> Roadmap + gates (ordem e decisões de continuidade)
      -> Issue (uma entrega vertical verificável)
        -> Spec técnica da Issue (contratos e comportamento exatos)
          -> implementação + testes + evidências
```

Um artefato não substitui o próximo. Em particular:

- PRD sem critérios mensuráveis não libera arquitetura.
- Issue sem critério de aceite e dependências não entra em execução.
- Spec que diz apenas “integrar com Health Connect” não está pronta.
- Código não deve começar antes de a Issue estar `READY` e sua spec estar aprovada.
- Uma fase só termina quando sua evidência está registrada, não apenas quando o código compila.

## Contrato obrigatório de Start Session

Toda nova sessão deve começar mostrando, antes de qualquer alteração de código:

1. Issue ativa, modo (`Explorar`, `Especificar`, `Implementar` ou `Revisar`), fase e gate.
2. Resultado observável que estará pronto ao final da sessão.
3. Escopo incluído e não incluído.
4. Estado da Issue e da spec, incluindo se o código está ou não liberado.
5. Divergências encontradas entre pedido do usuário, handoff, roadmap, backlog e repositório.

Se houver divergência, a sessão fica em modo `Especificar`: primeiro os artefatos canônicos são
corrigidos e apresentados para aprovação. Código só começa depois de Issue `READY` e spec
`APPROVED`. A seleção automática da próxima Issue nunca prevalece sobre uma decisão de produto
do usuário que ainda não tenha sido refletida no backlog.

## Estado permitido

Use estes estados nas Issues: `BACKLOG`, `DRAFTING`, `READY`, `IN_PROGRESS`,
`BLOCKED`, `VALIDATING`, `DONE` ou `CANCELLED`.

Somente uma Issue pode ficar `IN_PROGRESS` por sessão. Atualize o estado, a data e os links
de evidência no final da sessão.

## Entradas para Codex e Claude Code

- **Codex:** invoque `$develop-kcalix-connector`.
- **Claude Code:** use `/connector KCX-CONN-NNN`.
- **Qualquer agente:** comece por este índice e cite explicitamente a Issue ativa.

O `/spec` e o `/feature` genéricos não devem ser usados sozinhos para esta iniciativa:
eles não contêm as regras específicas de Health Connect, segurança e proveniência. A skill
e o comando `/connector` são as entradas obrigatórias e podem chamar os fluxos gerais apenas
como apoio, mantendo este pacote como fonte de verdade.

## Paridade obrigatória entre Codex e Claude Code

Paridade significa executar o mesmo processo e produzir os mesmos artefatos — não manter
duas cópias da documentação ou duas implementações.

| Elemento | Codex | Claude Code | Fonte canônica compartilhada |
|---|---|---|---|
| Entrada | `$develop-kcalix-connector` | `/connector KCX-CONN-NNN` | Este índice |
| Seleção do trabalho | Uma Issue `READY` | A mesma Issue `READY` | `ISSUES.md` |
| Ordem e gates | G0–G5 | G0–G5 | `ROADMAP.md` |
| Especificação | `specs/KCX-CONN-NNN.md` | O mesmo arquivo | `SPEC_TEMPLATE.md` |
| Implementação | Mesmo branch e contratos | Mesmo branch e contratos | Código + spec aprovada |
| Evidência | Testes e resultados na Issue | Os mesmos registros | Issue/spec da entrega |
| Handoff | Atualiza estado e próximo ID | Idêntico | `MEMORY.md` + backlog |

Regras de unicidade:

- nenhum agente cria PRD, roadmap ou backlog paralelo fora deste diretório;
- uma decisão tomada por um agente é registrada no artefato canônico antes do handoff;
- o agente seguinte confere o estado real do Git e da Issue, não confia apenas no resumo da conversa;
- divergência entre conversa e repositório é resolvida a favor do artefato versionado, ou escalada ao usuário;
- Codex e Claude podem alternar entre sessões, mas não trabalhar simultaneamente na mesma Issue.

## Branch e isolamento do projeto

- Branch da iniciativa: `codex/kcalix-connector`.
- Todo código, spec, migration e documentação do conector deve ser produzido nessa branch.
- Não implementar o conector diretamente na `main`.
- Ao iniciar uma sessão, abortar mudanças de código se a branch ativa não for a branch da iniciativa.
- Mudanças preexistentes e não relacionadas não devem ser staged, commitadas, descartadas ou movidas.
- Commits devem citar a Issue, por exemplo: `KCX-CONN-007: read Health Connect records`.
- Um commit não mistura mais de uma Issue nem mistura correções alheias ao conector.
- Merge na `main` somente depois do gate correspondente, revisão e autorização do usuário.
- Se houver trabalho paralelo real, criar branch curta `codex/kcx-conn-NNN-slug` a partir da
  branch da iniciativa e integrar de volta somente após validação; não duplicar specs.

## Papéis necessários por fase

Os papéis descrevem a lente de revisão; não exigem ferramentas ou agentes separados em toda sessão.

| Papel | Responsabilidade | Issues principais |
|---|---|---|
| Produto/Discovery | valor, baseline, métricas e go/no-go | 001–002, 020 |
| Android/Health Connect | compatibilidade, permissões, leitura e APK | 003, 005–008, 011–012, 017–018 |
| Backend/Security | contrato, auth, RLS, retenção e threat model | 004, 009–012, 016, 019 |
| Kcalix/Dados | provenance, vínculo de treino e política de calorias | 013–016 |
| QA no aparelho | cenários reais, replay, offline, revogação e atualização | 006–008, 012, 017–020 |

Uma Issue que cruza papéis precisa listar as revisões exigidas na própria spec. Isso evita
uma “spec especializada” presumida, mas nunca realizada.

Se nenhuma Issue estiver `READY`, a tarefa da sessão é completar a documentação ou o spike
necessário para liberar a próxima Issue — não improvisar a implementação.
