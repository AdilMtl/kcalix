# KCX-CONN-001 — definir valor e contrato de observação do Health Connect

Status: DRAFT
Issue pai: `KCX-CONN-001`
Fase e gate: Fase 0 / preparação de G1 e G2
Responsável da decisão: proprietário do Kcalix, apoiado por revisores técnicos
Última atualização: 2026-07-23

## Decisão entregue

O Connector só definirá normalização e match detalhados depois de revisar o projeto de
referência, confrontá-lo com a API oficial e observar, por export local versionado, o formato
real publicado pelo Samsung Health no aparelho.

## Contexto comprovado

- O usuário registra musculação estruturada no Kcalix e mantém uma sessão contínua no Watch.
- Cardio é uma sessão separada e sua redigitação é o maior atrito imediato.
- O Kcalix é fonte de verdade para exercícios, séries, repetições, cargas e alimentação.
- O Watch é candidato a fonte de horário, duração, distância, FC e estimativas da sessão.
- Health Connect retorna record types tipados; métricas relacionadas podem ser registros
  separados no mesmo intervalo.
- O projeto de referência ainda não foi disponibilizado e seu comportamento não foi observado.
- Nenhum dado real do aparelho foi lido.

## Escopo

### Incluído

- Validar os três casos de uso: cardio, musculação enriquecida e body fat BIA.
- Aprovar princípios de reconciliação, sem pesos/tolerâncias finais.
- Revisar projeto de referência por especialistas usando roteiro canônico.
- Definir record types e permissões candidatas.
- Definir contrato e privacidade do export diagnóstico.
- Revisar o protocolo que será executado no aparelho pela `KCX-CONN-007`.

### Não incluído

- Alterar dependências ou código Android.
- Solicitar permissões Health Connect.
- Ler ou exportar dados reais.
- Implementar serializer, UI de export, normalização ou match.
- Persistir, enviar ao Supabase ou disponibilizar dados ao Coach.
- Rotas GPS, background, histórico amplo, Play Store ou uso médico.

## Fluxo do usuário e estados

1. Usuário disponibiliza o projeto de referência.
2. Revisores produzem comparação técnica consolidada.
3. Usuário recebe apenas decisões de produto e riscos em linguagem comum.
4. Usuário aprova record types, permissões e perfis do export.
5. Uma spec posterior implementa disponibilidade/permissões e outra implementa
   leitura/export local.
6. No aparelho, o usuário escolhe uma janela curta e inicia `Observar dados`.
7. O app mostra prévia local e permite criar documento manualmente.
8. Nenhum dado é enviado ao Kcalix.

Estados obrigatórios para as specs posteriores: indisponível, sem permissão, permissão parcial,
janela vazia, leitura parcial, export cancelado, export concluído e erro local recuperável.

## Dados e proveniência

Record types candidatos, sujeitos à revisão:

| Record type | Uso candidato | Observação bloqueante |
|---|---|---|
| `ExerciseSessionRecord` | tipo, início, fim e duração | validar campos e origem Samsung |
| `HeartRateRecord` | média, mínima, máxima e zonas derivadas | série separada; não enviar bruto |
| `DistanceRecord` | distância do cardio | correlacionar por intervalo/origem |
| `TotalCaloriesBurnedRecord` | comparação de energia da sessão | inclui basal; não alterar saldo |
| `ActiveCaloriesBurnedRecord` | energia ativa | somente se disponibilidade for comprovada |
| `BodyFatRecord` | tendência BIA | não misturar com JP7/manual |
| `WeightRecord` | peso associado quando existir | Watch 5 não mede peso diretamente |

O export deve preservar unidade, timezone/offset, origem, método de gravação, última alteração,
campos presentes/ausentes e relações explícitas/inferidas. IDs reais e valores pessoais não
podem entrar em fixtures ou evidência versionada.

## Permissões

Candidatas, ainda não autorizadas para implementação:

- `android.permission.health.READ_EXERCISE`
- `android.permission.health.READ_HEART_RATE`
- `android.permission.health.READ_DISTANCE`
- `android.permission.health.READ_TOTAL_CALORIES_BURNED`
- `android.permission.health.READ_BODY_FAT`
- `android.permission.health.READ_WEIGHT`

`android.permission.health.READ_ACTIVE_CALORIES_BURNED` só poderá entrar se projeto,
documentação e aparelho justificarem sua utilidade. Não solicitar passos, sono, background,
histórico amplo ou rota nesta etapa.

## Contratos

O contrato de observação é `kcx-health-observation/1`, definido inicialmente em
[`../reviews/KCX-CONN-001-reference-project-review.md`](../reviews/KCX-CONN-001-reference-project-review.md).

Requisitos:

- JSON canônico; HTML é apenas visão derivada.
- Perfis `STRUCTURAL` e `PRIVATE_FULL`.
- Janela curta e explícita.
- Paginação completa ou erro parcial visível.
- Serializador explícito por record type; proibido usar `toString()` como contrato.
- Valores desconhecidos preservados como código original + descrição conhecida.
- Relações classificadas como `EXPLICIT` ou `INFERRED`.
- Sem request/response de rede nesta Issue.

Idempotência e conflito de ingestão são N/A: esta Issue não envia nem persiste dados. IDs
anonimizados devem permanecer estáveis apenas dentro do mesmo export para permitir comparação.

## Banco e segurança

Banco, RLS e autenticação são N/A porque não há ingestão.

Controles obrigatórios para a implementação futura:

- nenhuma permissão `INTERNET` necessária ao modo de observação;
- export criado apenas por ação explícita e destino escolhido pelo usuário;
- nenhum log com valores, tokens ou IDs de Health Connect;
- nenhum backup automático do documento pelo app;
- perfil `STRUCTURAL` como padrão compartilhável;
- `PRIVATE_FULL` identificado como dado de saúde sensível e mantido fora do Git;
- falha/cancelamento não deixa arquivo parcial legível.

O parecer completo de ameaça, retenção e exclusão pertence à `KCX-CONN-004`.

## Regras de domínio

- Mesma data não comprova que duas sessões são iguais.
- Watch nunca substitui séries, repetições ou cargas.
- Cardio e musculação não são fundidos só porque ocorreram no mesmo dia.
- Todo vínculo/importação começa como sugestão e exige confirmação no piloto.
- Vínculo deve ser reversível.
- `TotalCaloriesBurnedRecord` não é automaticamente energia ativa.
- Watch + estimativa Kcalix nunca são somados para a mesma sessão.
- Body fat BIA, JP7 e manual permanecem métodos distintos.
- Pesos, tolerâncias e confiança finais do match dependem do export real da `KCX-CONN-007`.

## Arquivos previstos

Nesta Issue:

- `specs/KCX-CONN-001.md` — decisões e contrato.
- `reviews/KCX-CONN-001-reference-project-review.md` — roteiro por especialidade.
- `evidence/KCX-CONN-001-discovery.md` — protocolo anonimizado.
- `README.md`, `ROADMAP.md` e `ISSUES.md` — sequência canônica.

Specs posteriores deverão listar os arquivos Android somente depois da decisão arquitetural.

## Plano de testes

- Unitários: validar fixtures sintéticas contra o schema de observação.
- Contrato: validar versão, campos obrigatórios e rejeição de payload inválido.
- Segurança: confirmar ausência de Internet/log/backup e descarte de arquivo parcial.
- Android: disponibilidade, permissões, paginação e serializers por record type.
- Aparelho: sessão conhecida antes/depois, vazio, parcial, duplicado, update e revogação.
- PWA/Supabase: N/A até haver ingestão.

## Critérios de aceite observáveis

- Dado o projeto de referência, quando cada trilha revisar sua área, então existe uma matriz
  com evidência oficial, evidência no código, decisão e risco.
- Dado um record type candidato, quando seu contrato for aprovado, então permissão, campos,
  unidade, origem, opcionalidade e utilidade estão explícitos.
- Dado um export `STRUCTURAL`, quando for revisado, então relações temporais permanecem úteis
  sem expor IDs ou valores pessoais.
- Dado um export `PRIVATE_FULL`, quando o usuário cancelar ou ocorrer erro, então nenhum
  arquivo parcial legível permanece.
- Dadas duas representações da mesma atividade, quando ainda não houver evidência real, então
  o sistema não declara match automático.
- Dado o fim da Issue, nenhuma permissão, leitura, rede ou dado real foi adicionado ao app.

## Rollout, rollback e observabilidade

N/A para rollout: a Issue entrega documentação. Rollback consiste em rejeitar a proposta sem
alterar o APK. A implementação posterior deve registrar apenas contagens técnicas, estados e
códigos de erro não sensíveis.

## Dúvidas e decisões pendentes

- Caminho, licença e versão do projeto de referência — dono: usuário fornece; revisores analisam.
- Versões reais do ambiente — dono: QA orienta; usuário executa no aparelho.
- Campos realmente publicados pela Samsung — bloqueia match detalhado; validar na `KCX-CONN-007`.
- Necessidade de `ActiveCaloriesBurnedRecord` — não bloqueia a revisão; permanece fora por padrão.
- Conteúdo exato do perfil `PRIVATE_FULL` — depende do parecer da `KCX-CONN-004`.

## Evidências de validação

- Handoff de produto de 2026-07-23.
- Roteiro de revisão especializada desta Issue.
- Protocolo `evidence/KCX-CONN-001-discovery.md`, a revisar.
- Registro `sessions/2026-07-23-KCX-CONN-001-observation-transition.md`.
- Documentação oficial Android Health Connect vigente na data da revisão.
- Nenhum export de saúde real será versionado.
