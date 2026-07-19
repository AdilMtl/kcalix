# Plano de implementação por issues e sessões

**Branch única:** `feature/kcalix-connector`

**Merge:** somente após release candidate em aparelho real e gate final aprovado

**Regra:** cada issue termina com testes, documentação do resultado e commit próprio

## 1. Estratégia de branch e integração

- Todo o conector é desenvolvido na branch longa `feature/kcalix-connector`.
- O código Android fica isolado em `connector/android/`.
- Migrations e Edge Functions entram nos diretórios Supabase existentes, identificadas pelo
  prefixo/nome Health Connect.
- A PWA não muda até KC-11.
- Mudanças de `main` podem ser incorporadas à feature apenas em checkpoint limpo e testado.
- Nenhuma migration de produção é aplicada só por existir na branch; cada execução externa exige
  revisão e aprovação.
- Commits usam o ID: `KC-03: inventory Health Connect records on device`.
- O merge final exige G5; a promoção ampla depende do resultado G6.

## 2. Mapa de sessões

| Sessão | Issues | Resultado |
|---|---|---|
| 0 — planejamento | documentos atuais | spec, PRD, setup e backlog aprovados |
| 1 — ambiente | KC-00, KC-01 | decisões registradas e toolchain funcional |
| 2 — scaffold | KC-02 | app mínimo compila, testa e gera APK debug |
| 3 — spike real | KC-03 | matriz Samsung/Health Connect e gate de viabilidade |
| 4 — fundação segura | KC-04, KC-05 | privacidade, schema e RLS revisados |
| 5 — ingestão | KC-06 | contrato v1 idempotente validado |
| 6 — identidade Android | KC-07 | login e cofre seguro funcionando |
| 7 — vertical slice local | KC-08 | leitura, normalização e preview P0 |
| 8 — sync ponta a ponta | KC-09, KC-10 | fila, upload e UX completas |
| 9 — valor no Kcalix | KC-11 | reconciliação/cardio/kcal na PWA |
| 10 — controle | KC-12 | revoke/delete/export testados |
| 11 — corpo opcional | KC-13 | peso/BF se o spike aprovar |
| 12 — release | KC-14 | APK release assinado e QA real |
| 13 — piloto | KC-15 | scorecard de 14 dias e decisão go/no-go |
| pós-GO | KC-16 | sono/passos/Coach/background avaliados separadamente |

Uma sessão pode terminar antes de completar seu bloco; nunca reduzir testes para “fechar a
sessão”. Dependências são gates, não estimativas de calendário.

## 3. Issues executáveis

### KC-00 — Fechar decisões e baseline do aparelho

**Objetivo:** substituir premissas por decisões registradas.

**Escopo:**

- modelo do telefone, Android/One UI, Samsung Health e Watch firmware;
- dados hoje visíveis no Health Connect e origem exibida;
- M1 exercício/cardio versus inclusão de corpo;
- janela 7/30 dias, login email/senha, app aberto durante sync;
- um aparelho versus até 20;
- política de desconectar/manter e local de backup da keystore;
- `applicationId` definitivo.

**Definition of Done:** tabela de decisões adicionada ao PRD; nenhum item que altere schema,
permissões ou distribuição permanece implícito.

**Dependências:** nenhuma.

### KC-01 — Preparar toolchain Android gratuita no Windows

**Objetivo:** permitir que usuário e Claude Code construam/testem pelo terminal.

**Escopo:** seguir `ANDROID_SETUP.md`; instalar Studio/SDK/JBR/ADB/emulador; validar aparelho.

**Definition of Done:**

- SDK 36, Build Tools 36.0.0 e Platform Tools listados;
- JDK 17 detectado;
- `adb devices` vê emulador e/ou aparelho autorizado;
- custo obrigatório documentado como R$ 0;
- nenhum segredo exposto.

**Dependências:** KC-00 para `applicationId` antes do scaffold distribuível.

### KC-02 — Criar scaffold Kotlin/Compose e CI

**Objetivo:** criar o projeto autônomo em `connector/android/`.

**Escopo:** Gradle Kotlin DSL, AGP/Kotlin embutido, Compose, min/target/compile SDK, arquitetura
simples por features, `.gitignore`, teste smoke e workflow CI por path.

**Definition of Done:**

- `gradlew.bat clean lint testDebugUnitTest assembleDebug` passa;
- APK debug instala e abre uma tela “Kcalix Connector”;
- CI roda sem secret e sem publicar release;
- PWA `npm run build` continua passando;
- versões e comandos registrados no README do módulo.

**Dependências:** KC-01.

### KC-03 — Spike Health Connect no aparelho real

**Objetivo:** comprovar viabilidade antes de criar backend de saúde.

**Escopo:** availability/rationale/permissões temporárias; reader local; preview técnico; sessão de
força e caminhada/corrida; FC, energia, distância, peso/BIA quando disponíveis; latência Samsung.

**Definition of Done:**

- matriz por record type com permissão, quantidade, `dataOrigin`, ID e qualidade;
- nenhum dado sai do aparelho;
- paginação, vazio, negar/revogar e timezone testados;
- comportamento Android 14+ ou <=13 registrado para o telefone real;
- decisão GO/CUT/NO-GO por tipo; P0 final atualizado na spec.

**Dependências:** KC-02. **Gate G1.**

### KC-04 — Privacy foundation e threat model

**Objetivo:** definir finalidade, consentimento, retenção e controles antes do upload.

**Escopo:** mapa de dados/fluxos, aviso curto, política do piloto, versões de consentimento,
retenção, subprocessadores/regiões, export/delete, log redaction, incident checklist e ameaças.

**Definition of Done:**

- consentimentos local/cloud/Coach separados e default-off;
- categorias e campos allow-listed equivalem ao resultado de KC-03;
- nenhum raw HR/sono, GPS ou identificador em log;
- retenção e comportamento de backup/deleção documentados;
- revisão jurídica marcada como gate antes de distribuição além do proprietário.

**Dependências:** KC-03.

### KC-05 — Criar schema isolado, grants e RLS

**Objetivo:** criar a fundação de dados sem tocar registros canônicos atuais.

**Escopo:** primeiro introspectar schema remoto; migration para connections, records, sync requests
e links; constraints nomeadas, índices, RLS, grants e testes com duas contas.

**Definition of Done:**

- migration idempotente e revisável;
- `anon` sem acesso; authenticated limitado por `auth.uid()`;
- escrita direta fora da RPC bloqueada quando apropriado;
- FKs impedem link cross-tenant;
- nenhuma mudança em `workouts`, `diary_entries`, `body_measurements` ou `checkins`;
- rollback/limpeza do piloto documentado.

**Dependências:** KC-04.

### KC-06 — Implementar RPC e Edge Function de ingestão v1

**Objetivo:** receber batches autenticados, validados, atômicos e idempotentes.

**Escopo:** RPC `ingest_health_connect_v1`, Edge `ingest-health-connect`, auth user, contrato v1,
limites, hashes, status/errors e testes.

**Definition of Done:**

- `verify_jwt=true`; sem `service_role` na ingestão e sem `userId` no request;
- mesmo request retorna mesma resposta; requestId com outro hash retorna 409;
- identidade externa não duplica e dado antigo não sobrescreve novo;
- batch inválido grava zero linhas;
- 401/403/409/413/422/429/5xx testados;
- testes A/B confirmam isolamento;
- logs contêm apenas requestId, contadores, status e duração.

**Dependências:** KC-05. **Gate G2.**

### KC-07 — Implementar Auth Android e cofre local

**Objetivo:** usar a mesma conta Kcalix sem expor ou restaurar indevidamente sessão.

**Escopo:** login email/senha, refresh, logout local, armazenamento AES-GCM/Keystore, regras de
backup, redaction e comportamento offline.

**Definition of Done:**

- APK contém apenas URL e chave pública;
- access/refresh token cifrados e excluídos de backup/device transfer;
- refresh funciona; falha exige login sem loop;
- logout local limpa sessão/fila e não desloga a PWA;
- release não-debuggable e cleartext desabilitado;
- busca no APK/log confirma ausência de segredos/tokens.

**Dependências:** KC-02 e contrato de KC-06.

### KC-08 — Leitores, normalizadores e preview P0

**Objetivo:** transformar records aprovados no spike em resumos previsíveis.

**Escopo:** readers paginados de sessão/FC/energia/distância, associação por intervalo/origem,
unidades, timezone, preview e testes fake/Toolbox.

**Definition of Done:**

- permissões just-in-time e revogação parcial tratadas;
- página >1.000, sessão cruzando meia-noite e origem múltipla testadas;
- payload contém somente campos allow-listed;
- FC envia média, máxima e count, nunca amostras;
- preview informa origem e janela antes do upload;
- sair do foreground cancela/retoma sem perda.

**Dependências:** KC-03, KC-04 e KC-07.

### KC-09 — Fila cifrada, retry e upload

**Objetivo:** concluir sync manual de forma resiliente e idempotente.

**Escopo:** Room com ciphertext, request canônico, batches <=100/256 KiB, WorkManager one-shot,
backoff, dead-letter e limites locais.

**Definition of Done:**

- mesmo requestId/payload persiste até ACK 200;
- offline -> online, kill/reboot e ACK perdido não duplicam;
- retry apenas em rede/timeout/429/5xx; 401 refresh uma vez;
- erros permanentes são visíveis e não entram em loop;
- fila limitada a 500 records/30 dias e apagada no fluxo adequado;
- nenhum payload aparece em log ou backup.

**Dependências:** KC-06, KC-07 e KC-08.

### KC-10 — Finalizar UX de conexão e sincronização

**Objetivo:** oferecer uma jornada compreensível para uso sem conhecimento Android.

**Escopo:** pré-requisitos, login, consentimento, cards de permissão, janela, preview, botão sync,
resultado, última sincronização e recuperação de erros.

**Definition of Done:**

- happy path completo no aparelho;
- estados sem HC, sem permissão, Samsung atrasado, offline e sessão expirada explicados;
- resultado mostra encontrados/inseridos/atualizados/duplicados/erros;
- usuário nunca vê sucesso falso;
- acessibilidade básica e rotação/process recreation testadas.

**Dependências:** KC-09. **Gate G3.**

### KC-11 — Reconciliação na PWA e política de calorias

**Objetivo:** transformar dados importados em valor sem corromper registros atuais.

**Escopo:** hooks/serviços da PWA, sugestões de vínculo, adicionar/merge cardio, proveniência,
duas fontes de kcal, manual lock e desfazer/rejeitar.

**Definition of Done:**

- nenhum Supabase direto novo em componente;
- treino mantém séries/reps/carga;
- ambiguidades exigem seleção;
- kcal Kcalix e relógio ficam separadas e nunca são somadas;
- diário/meta não mudam sem confirmação explícita;
- PWA build/test passa e QA móvel confirma a UX;
- Coach não recebe importados.

**Dependências:** KC-10. **Gate G4.**

### KC-12 — Desconectar, apagar e exportar

**Objetivo:** entregar controle completo e verificável sobre os importados.

**Escopo:** RPC transacional de revoke/delete, revogação Health Connect, limpeza local, estados
pendentes offline, exportação e recibos.

**Definition of Done:**

- disconnect bloqueia nova ingestão imediatamente;
- apagar remove links -> records -> requests e preserva manuais;
- repetição da exclusão é idempotente;
- export contém dados importados e proveniência;
- remover app é documentado como diferente de apagar servidor;
- testes confirmam zero importados consultáveis após exclusão.

**Dependências:** KC-11.

### KC-13 — Adicionar peso e BF/BIA, se aprovados

**Objetivo:** reduzir digitação corporal sem misturar métodos.

**Escopo:** permissões opcionais, reader/ingestão, sugestões, conflito diário e proveniência.

**Definition of Done:**

- somente tipos aprovados por KC-03 entram;
- manual vence conflito e nenhum valor é aceito silenciosamente;
- múltiplas medições mostram contagem e sugerem a mais recente;
- BIA e dobras permanecem séries/métodos distintos;
- nenhuma meta é recalculada automaticamente;
- remover permissão de corpo não quebra sync de treino.

**Dependências:** KC-12 e GO do tipo em KC-03. Pode ser cortada do primeiro release.

### KC-14 — QA, assinatura e entrega do APK privado

**Objetivo:** produzir uma release atualizável e um runbook reproduzível.

**Escopo:** suite final, teste real, keystore, release build, checksum, upgrade, reinstall, ADB e
sideload; revisar regra Android vigente no dia.

**Definition of Done:**

- lint/unit/instrumented/PWA tests passam;
- APK release assinado, não-debuggable e com checksum;
- mesma chave/applicationId/versionCode maior atualiza por cima;
- dois backups cifrados da chave confirmados sem expor senha;
- fluxo Files/browser e ADB testados;
- Watch -> Samsung -> HC -> Supabase -> PWA validado;
- segurança e privacidade checklist sem bloqueador.

**Dependências:** KC-12; KC-13 se incluída. **Gate G5.**

### KC-15 — Executar piloto de 14 dias e decisão go/no-go

**Objetivo:** medir valor e confiabilidade antes do merge/evolução.

**Escopo:** >=14 dias e >=8 sessões ou 15 syncs; registrar scorecard, incidentes e feedback.

**Definition of Done:**

- hard gates e métricas do PRD preenchidos com evidência;
- decisão GO/CONDITIONAL/NO-GO registrada;
- bugs classificados e correções críticas concluídas;
- se G5 e decisão permitirem, branch pronta para revisão/merge;
- roadmap atualizado com próximo passo explícito.

**Dependências:** KC-14. **Gate G6.**

### KC-16 — Backlog pós-GO: sono, passos, Coach e background

**Objetivo:** impedir que extensões aumentem o escopo do MVP silenciosamente.

**Escopo futuro separado:** sono resumido por dia do despertar; passos agregados; consentimento
Coach por categoria; changes/tombstones; leitura background; histórico >30 dias; possível
Capacitor/unificação/publicação.

**Definition of Done:** cada capacidade recebe nova spec, permissões mínimas, métricas próprias e
decisão de produto antes de código.

**Dependências:** GO em KC-15.

## 4. Checklist de abertura/fechamento de cada sessão

### Abrir

1. Confirmar `git branch --show-current` = `feature/kcalix-connector`.
2. Verificar `git status` e preservar alterações preexistentes.
3. Ler a issue, dependências, spec e decisões mais recentes.
4. Rodar baseline aplicável (`npm` e/ou `gradlew`).
5. Não executar migration/deploy externo sem aprovação explícita.

### Fechar

1. Rodar critérios de teste da issue.
2. Registrar evidências e decisões no documento relevante.
3. Atualizar status e desbloquear somente dependências realmente satisfeitas.
4. Revisar diff para segredos, payloads de saúde e alterações fora do escopo.
5. Criar commit com o ID da issue; não fazer merge na `main` antes do gate final.
