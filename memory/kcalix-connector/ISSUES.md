# Backlog de Issues — Kcalix Connector

Este arquivo é o backlog canônico enquanto as Issues não forem criadas no GitHub. Cada bloco
já está pronto para ser copiado para o tracker. O status inicial é `BACKLOG`, salvo indicação.

## Regras de execução

- Selecione apenas uma Issue por sessão e respeite `Depende de`.
- Trabalhe em `codex/kcalix-connector`; não implemente esta iniciativa na `main`.
- Antes do código, crie a spec pelo `SPEC_TEMPLATE.md` e obtenha aprovação.
- Não encerre como `DONE` sem anexar evidência aos critérios de aceite.
- Descobertas que mudem produto/arquitetura viram decisão no PRD/ADR, não ficam escondidas em código.
- Nunca use dados pessoais reais como fixture ou artefato versionado.

## Fase 00 — bootstrap Android isolado

### KCX-CONN-005 — Bootstrap Android reproduzível

**Status:** DONE  
**Depende de:** nenhuma  
**Entrega:** app Android mínimo compila, instala e identifica versão/ambiente, sem acesso a
Health Connect, autenticação, rede ou dados de saúde.

**Aceite:** build documentado; SDK/JDK/Gradle fixados; secrets fora do Git; APK debug instala;
README contém comandos e troubleshooting; nenhuma permissão de saúde é declarada ou solicitada.

## Fase 0 — governança e descoberta

### KCX-CONN-001 — Auditar dados reais do Watch 5 no Health Connect

**Status:** READY  
**Depende de:** nenhuma  
**Entrega:** matriz de disponibilidade/qualidade dos sinais candidatos no aparelho real.

**Escopo:** identificar modelo/Android/versões; confirmar Samsung Health → Health Connect;
inspecionar ExerciseSession, ActiveCaloriesBurned, TotalCaloriesBurned, HeartRate, Steps,
Distance e Weight em janelas controladas; registrar campos, unidades, origem, frequência,
lacunas e duplicidades. Sono fica como candidato, não requisito.

**Aceite:**

- [ ] A matriz diferencia “disponível”, “indisponível” e “não testado”.
- [ ] Cada registro tem permissão exata, fonte produtora e utilidade proposta.
- [ ] Há pelo menos um teste antes/depois de uma atividade conhecida.
- [ ] Nenhum valor pessoal bruto, screenshot sensível ou export é commitado.
- [ ] O resultado recomenda quais sinais entram no piloto e quais são descartados.

**Evidência:** documento de discovery anonimizado + passos reproduzíveis no aparelho.

### KCX-CONN-002 — Aprovar PRD do piloto privado

**Status:** BACKLOG  
**Depende de:** KCX-CONN-001  
**Entrega:** PRD enxuto que liga cada dado a uma decisão do usuário e a uma métrica.

**Aceite:**

- [ ] Define usuário, problema, jornadas e resultado desejado.
- [ ] Prioriza no máximo três casos de uso do MVP.
- [ ] Define baseline manual e métricas do piloto de 2–4 semanas.
- [ ] Define não objetivos: diagnóstico, recomendação médica, Play Store e sync contínuo.
- [ ] Contém critérios go/no-go e responsável pela decisão.

### KCX-CONN-003 — ADR: Kotlin nativo versus Capacitor

**Status:** BACKLOG  
**Depende de:** KCX-CONN-001, KCX-CONN-002  
**Entrega:** ADR com decisão e consequências para o piloto.

**Aceite:**

- [ ] Compara suporte Health Connect, esforço, debugging, auth, background e distribuição.
- [ ] Inclui um spike apenas se evidência documental/código existente não bastar.
- [ ] Decide estrutura do projeto, versões mínimas e ownership.
- [ ] Registra o custo de migrar/unificar depois do piloto.

### KCX-CONN-004 — Threat model, privacidade e ciclo de vida dos dados

**Status:** BACKLOG  
**Depende de:** KCX-CONN-002  
**Entrega:** mapa de dados e controles antes da ingestão.

**Aceite:**

- [ ] Mapeia fronteiras Watch/Samsung/Health Connect/APK/Supabase/PWA/Coach.
- [ ] Define minimização, retenção, revogação, exclusão e exportação.
- [ ] Proíbe service-role e segredos administrativos no APK.
- [ ] Define armazenamento de sessão e conteúdo permitido em logs.
- [ ] Classifica riscos e mitigação, incluindo celular perdido e APK desatualizado.

## Fase 1 — spike Android somente leitura

### KCX-CONN-006 — Disponibilidade e permissões Health Connect

**Status:** BACKLOG  
**Depende de:** KCX-CONN-004, KCX-CONN-005  
**Entrega:** UX de disponibilidade/permissões mínimas com estados explícitos.

**Aceite:** detecta ausência/incompatibilidade; solicita somente registros aprovados;
explica negação; abre configurações para revogação; testes cobrem negado/parcial/concedido.

### KCX-CONN-007 — Leitura controlada e matriz de qualidade

**Status:** BACKLOG  
**Depende de:** KCX-CONN-006  
**Entrega:** leitura paginada por janela e prévia local dos campos reais.

**Aceite:** timezone/unidades explícitos; janela limitada; origem exibida; vazio/parcial não
quebram; comparação com Samsung Health documentada; nenhum upload ocorre.

### KCX-CONN-008 — Modelo canônico e deduplicação local

**Status:** BACKLOG  
**Depende de:** KCX-CONN-007  
**Entrega:** transformação determinística para registros canônicos com fingerprint estável.

**Aceite:** fixtures sintéticas; testes de duplicidade, sobreposição e correção; provenance
preservida; transformação não soma calorias de fontes incompatíveis.

## Fase 2 — ingestão segura

### KCX-CONN-009 — Schema, provenance, RLS e retenção

**Status:** BACKLOG  
**Depende de:** KCX-CONN-004, KCX-CONN-008  
**Entrega:** migration revisável e testes de isolamento entre usuários.

**Aceite:** constraints/índices/idempotência definidos; RLS cobre SELECT/INSERT/UPDATE/DELETE;
usuário A nunca acessa B; origem e versão do contrato persistem; política de exclusão testada.

### KCX-CONN-010 — Edge Function de ingestão versionada

**Status:** BACKLOG  
**Depende de:** KCX-CONN-009  
**Entrega:** endpoint autenticado que valida e faz upsert idempotente.

**Aceite:** JSON request/response/erros especificado; JWT obrigatório; schema validation;
limite de lote; rejeição atômica ou parcial definida; replay não duplica; testes negativos passam.

### KCX-CONN-011 — Autenticação segura no Android

**Status:** BACKLOG  
**Depende de:** KCX-CONN-004, KCX-CONN-005, KCX-CONN-010  
**Entrega:** login/logout/renovação e armazenamento protegido da sessão do usuário.

**Aceite:** sem service-role; token não aparece em logs; expiração e logout são testados;
falha de rede preserva estado seguro; remoção do app/conta tem comportamento documentado.

### KCX-CONN-012 — Sync manual, retry e observabilidade

**Status:** BACKLOG  
**Depende de:** KCX-CONN-008, KCX-CONN-010, KCX-CONN-011  
**Entrega:** botão “Sincronizar agora” com fila curta e resultado compreensível.

**Aceite:** mostra lidos/enviados/ignorados/falhos; retry com backoff limitado; offline não
perde nem duplica; último sync persistido; logs usam IDs técnicos e não valores de saúde.

## Fase 3 — uso no Kcalix

### KCX-CONN-013 — Exibir dados importados com provenance

**Status:** BACKLOG  
**Depende de:** KCX-CONN-012  
**Entrega:** PWA consulta pelo hook/camada existente e mostra origem, tempo e estado do dado.

**Aceite:** nenhum acesso Supabase direto em componente; loading/vazio/erro; mobile 375 px;
registro manual continua funcionando; dado importado pode ser distinguido e excluído.

### KCX-CONN-014 — Reconciliar atividade com treino Kcalix

**Status:** BACKLOG  
**Depende de:** KCX-CONN-013  
**Entrega:** regra testável de sugestão/vínculo sem substituir séries, reps ou cargas.

**Aceite:** tolerância temporal explícita; conflitos pedem confirmação; vínculo reversível;
treinos simultâneos/duplicados testados; Watch complementa, não sobrescreve o Kcalix.

### KCX-CONN-015 — Política de calorias e fonte de verdade

**Status:** BACKLOG  
**Depende de:** KCX-CONN-002, KCX-CONN-013  
**Entrega:** regra única para exibir/usar energia sem dupla contagem.

**Aceite:** distingue ativa/total/estimada; define TDEE versus ajuste por exercício; usuário
vê origem; ausência não é tratada como zero; cenários de dupla fonte têm testes.

### KCX-CONN-016 — Consentimento, exclusão e limites do Coach

**Status:** BACKLOG  
**Depende de:** KCX-CONN-004, KCX-CONN-013  
**Entrega:** controles de consentimento/revogação/exclusão e política de uso pela IA.

**Aceite:** exclusão por usuário testada ponta a ponta; revogar para novos syncs é claro;
Coach recebe somente campos autorizados e necessários; linguagem não faz diagnóstico médico.

## Fase 4 — APK privado e piloto

### KCX-CONN-017 — Release privada, assinatura e atualização

**Status:** BACKLOG  
**Depende de:** KCX-CONN-012  
**Entrega:** APK release assinado e procedimento reproduzível de sideload/update/rollback.

**Aceite:** chave fora do Git e com backup; assinatura consistente permite update; hashes/versionCode
registrados; instalação de fontes desconhecidas explicada; não há auto-update inseguro.

### KCX-CONN-018 — Validação E2E no aparelho real

**Status:** BACKLOG  
**Depende de:** KCX-CONN-013, KCX-CONN-014, KCX-CONN-015, KCX-CONN-017  
**Entrega:** roteiro E2E e relatório em cenários normal, offline, duplicado e permissão revogada.

**Aceite:** atividade conhecida percorre todo o fluxo; valores reconciliados; replay não duplica;
erros são recuperáveis; regressão PWA/build/testes passa.

### KCX-CONN-019 — Revisão de segurança e recuperação

**Status:** BACKLOG  
**Depende de:** KCX-CONN-016, KCX-CONN-018  
**Entrega:** checklist final e correções críticas antes do uso recorrente.

**Aceite:** nenhum segredo/PHI em repo/log; RLS negativo repetido; token/revogação/exclusão
testados; dependências auditadas; riscos residuais aceitos explicitamente.

### KCX-CONN-020 — Piloto e decisão go/no-go

**Status:** BACKLOG  
**Depende de:** KCX-CONN-019  
**Entrega:** relatório de 2–4 semanas comparando baseline manual e métricas definidas.

**Aceite:** apresenta benefícios, falhas e custo de manutenção; decide continuar, ajustar ou
encerrar; somente um `go` libera Issues de background, app unificado ou Play Store.
