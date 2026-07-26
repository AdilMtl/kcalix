# Roadmap executável — Kcalix Connector

**Atualizado em:** 2026-07-22  
**Horizonte:** piloto privado em um aparelho Android  
**Resultado esperado:** decisão baseada em evidência sobre continuar, ajustar ou abandonar a integração

## Gates de decisão

| Gate | Pergunta que precisa ser respondida | Evidência mínima | Libera |
|---|---|---|---|
| G0 — Contexto | A equipe está usando as mesmas decisões, branch e backlog? | Branch `codex/kcalix-connector`, índice, roadmap, Issues, skill e comando Claude versionados | Discovery |
| G1 — Valor | Quais decisões do usuário melhoram e como mediremos isso? | PRD aprovado, métricas e não objetivos explícitos | Spike técnico |
| G2 — Dados reais | O aparelho realmente expõe dados úteis e consistentes? | `KCX-CONN-007`: leitura/export local e matriz de registros/permissões, sem dados sensíveis commitados | Modelo canônico e backend |
| G3 — Contrato seguro | Schema, API, autenticação, RLS, idempotência e exclusão estão definidos? | Specs aprovadas, threat model e testes de contrato | Implementação ponta a ponta |
| G4 — Piloto confiável | O fluxo funciona no aparelho sem duplicar ou corromper dados? | Teste E2E, reconciliação, retry e checklist de segurança | Uso pessoal recorrente |
| G5 — Valor comprovado | O ganho supera manutenção, risco e fricção? | Métricas do piloto e decisão go/no-go | Background sync, unificação ou loja |

## Fase 00 — Bootstrap e shell visual offline

**Status:** concluída e validada no aparelho físico em 2026-07-22. Bootstrap e shell offline
funcionam; o polish de contraste conhecido ficou rastreado em `KCX-CONN-021` e não bloqueia G0.

**Objetivo:** criar uma base Android reproduzível, isolada da PWA e sem tratar dados de
saúde, e validar a jornada visual do Connector com dados digitados mantidos somente em memória
antes das integrações. Esta fase não libera G1, G2 ou decisões de arquitetura definitiva.

- `KCX-CONN-005`: criar o módulo/app Android e build de desenvolvimento reproduzível.
- `KCX-CONN-000`: criar a shell Ember offline com formulário e simulação local dos destinos Kcalix.
- `KCX-CONN-021`: polish visual não bloqueante identificado na validação física.

**Saída:** app mínimo compila, instala, identifica versão/ambiente e demonstra a jornada visual;
não possui login, rede, Health Connect, permissões de saúde ou dados reais.

## Fase 0 — Governança e definição de valor

**Status:** `KCX-CONN-001` em especificação. A entrevista priorizou cardio sem redigitação,
musculação enriquecida e body fat BIA. A decisão vigente é revisar primeiro o projeto de
referência e a API oficial e aprovar um contrato de observação/export local; match detalhado
só será definido depois da evidência real da `KCX-CONN-007`.

**Objetivo:** definir valor, dados e controles antes de construir funcionalidades que leiam,
processem ou enviem dados de saúde.

- `KCX-CONN-001`: validar valor, princípios de reconciliação, revisão especializada e contrato
  de observação dos dados do Watch 5 no Health Connect.
- `KCX-CONN-002`: escrever e aprovar o PRD do piloto.
- `KCX-CONN-003`: registrar a decisão arquitetural Kotlin nativo versus Capacitor.
- `KCX-CONN-004`: modelar ameaças, privacidade, retenção e exclusão.

**Saída:** insumos de G1 prontos para o PRD e protocolo de G2 aprovado; G1 fecha na
`KCX-CONN-002` e G2 fecha somente com evidência da `KCX-CONN-007`.
**Não fazer:** migration, Edge Function, autenticação Android ou sincronização definitiva.

## Fase 1 — Spike Android somente leitura

**Objetivo:** provar no aparelho real que o conector consegue obter os campos escolhidos com
permissões mínimas e apresentar uma prévia local compreensível.

- `KCX-CONN-006`: implementar disponibilidade e permissões do Health Connect.
- `KCX-CONN-007`: ler janela limitada, gerar export diagnóstico local e construir a matriz real
  de qualidade para a revisão especializada.
- `KCX-CONN-008`: normalizar e deduplicar localmente, sem upload.

**Saída:** G2 aprovado; demonstração local “Observar dados” → export diagnóstico → matriz real
→ prévia normalizada, testada no celular.
**Kill criterion:** encerrar ou reduzir o projeto se Samsung Health não fornecer os sinais
prioritários com estabilidade suficiente para as decisões do PRD.

## Fase 2 — Ingestão segura no Kcalix

**Objetivo:** transferir apenas registros escolhidos para a conta correta sem expor chaves privilegiadas.

- `KCX-CONN-009`: schema de ingestão, provenance, RLS e retenção.
- `KCX-CONN-010`: contrato e Edge Function autenticada/idempotente.
- `KCX-CONN-011`: login e armazenamento seguro da sessão no Android.
- `KCX-CONN-012`: sync manual, fila curta, retry e observabilidade sem dados clínicos em logs.

**Saída:** G3 aprovado e sincronização manual confiável em ambiente de teste.

## Fase 3 — Utilidade dentro do Kcalix

**Objetivo:** transformar dados importados em contexto acionável, não em um depósito de telemetria.

- `KCX-CONN-013`: consulta e visualização de dados importados na PWA.
- `KCX-CONN-014`: reconciliação entre sessão do relógio e treino do Kcalix.
- `KCX-CONN-015`: política de calorias e fonte de verdade.
- `KCX-CONN-016`: consentimento, exclusão e limites do Coach/IA.

**Saída:** cada dado importado possui uso explícito, provenance visível e comportamento de conflito definido.

## Fase 4 — APK privado e piloto

**Objetivo:** tornar instalação, atualização e operação pessoal repetíveis e seguras.

- `KCX-CONN-017`: assinatura, build release e guia de sideload/update.
- `KCX-CONN-018`: suíte E2E no Galaxy Watch 5 + celular.
- `KCX-CONN-019`: revisão de segurança e recuperação/exclusão.
- `KCX-CONN-020`: piloto, métricas e decisão go/no-go.

**Saída:** G4 e G5; decisão registrada com evidência.

## Fase 5 — Somente se o piloto justificar

Abrir novas Issues, sem assumir que todas serão feitas:

- sincronização periódica em segundo plano;
- incorporar o conector a um app Kcalix via Capacitor;
- distribuição para outros usuários e processo de suporte;
- publicação Google Play e requisitos de Health Apps/Data Safety;
- integração Wear OS direta, apenas se Health Connect não cobrir a necessidade.

## Métricas propostas para o PRD decidir

- redução de inputs manuais por semana;
- percentual de sessões importadas corretamente e sem duplicidade;
- tempo entre terminar atividade e o dado estar utilizável no Kcalix;
- taxa de falha/retry e tempo gasto corrigindo importações;
- número de decisões úteis geradas por semana (recuperação, cardio, vínculo com treino);
- percepção do usuário: “eu sentiria falta se fosse removido?” após 2–4 semanas.
