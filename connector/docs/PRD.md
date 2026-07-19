# PRD — Piloto privado do Kcalix Connector

**Versão:** 1.1

**Data:** 2026-07-19

**Owner inicial:** proprietário do Kcalix

**Status:** pronto para decomposição/execução; decisões de KC-00 ainda podem reduzir escopo

## 1. Resumo

O Kcalix Connector permitirá que o proprietário sincronize, sob ação explícita, resumos de
atividade registrados pelo Galaxy Watch 5 e disponibilizados pelo Samsung Health no Health
Connect. O produto reduz digitação duplicada e adiciona contexto fisiológico sem transformar o
Kcalix em aplicação médica e sem substituir registros manuais.

O primeiro sucesso é anterior ao relógio: instalar/atualizar o APK, entrar na mesma conta Kcalix,
enviar uma atividade digitada manualmente e vê-la na PWA como teste isolado. Depois disso, o
produto substitui gradualmente o formulário manual pela leitura Health Connect.

O sucesso do MVP de saúde continua sendo sincronizar e reconciliar exercício/cardio de maneira
confiável, compreensível, reversível e sem dupla contagem.

## 2. Persona e problema

### Persona primária

Atleta-proprietário avançado que:

- usa Android e Galaxy Watch 5;
- registra alimentação e treino de força no Kcalix;
- aceita instalar um APK privado;
- nunca desenvolveu Android e precisa de um fluxo operacional guiado;
- quer evitar redigitar duração/cardio e contextualizar esforço;
- quer controle sobre o que sai do celular e chega à IA.

### Problemas

- A PWA não acessa Health Connect diretamente.
- Samsung Health e Kcalix registram partes diferentes do mesmo treino.
- Digitar novamente duração/cardio/peso gera atrito.
- Kcal estimada local e kcal do relógio podem ser contadas duas vezes.
- Dados de saúde misturados às tabelas atuais poderiam chegar ao Coach sem consentimento próprio.

## 3. Jobs to be done

1. Depois do treino, sincronizar em menos de um minuto e enxergar o que foi encontrado.
2. Associar uma sessão do relógio ao treino estruturado sem perder séries/cargas.
3. Adicionar cardio sem redigitar tipo e duração.
4. Comparar esforço/duração/kcal com proveniência clara.
5. Desconectar ou apagar os importados sem afetar dados manuais.
6. Conseguir construir, testar e atualizar o APK usando ferramentas gratuitas e Claude Code.
7. Provar o caminho Android -> Kcalix com input controlado antes de depender do relógio.

## 4. Objetivos

- Validar que o fluxo Samsung -> Health Connect fornece dados úteis e consistentes no aparelho.
- Validar instalação, atualização, login, RLS, Edge Function e visualização PWA separadamente.
- Reduzir reentrada de cardio/duração.
- Garantir zero duplicatas e zero overwrite manual.
- Tornar origem, consentimento e uso de cada categoria compreensíveis.
- Criar fundação que possa evoluir sem obrigar a PWA a virar app nativo agora.

## 5. Não objetivos

- Monitoramento médico, diagnóstico ou recomendação clínica.
- App no relógio, GPS, dados brutos, sync bidirecional ou background no MVP.
- Importar todo o histórico ou todas as categorias.
- Ajustar automaticamente calorias alimentares, macros, TDEE ou metas.
- Publicar na Play Store durante o piloto.
- Reescrever o frontend atual antes de provar o valor do conector.

## 6. Jornada-alvo

### Fase Zero

1. Usuário acompanha o build no emulador e instala o APK no telefone.
2. Uma nova versão atualiza por cima e preserva o estado esperado.
3. Usuário entra com a conta Kcalix e vê diagnóstico de conexão.
4. Digita atividade de teste: data/hora, tipo, duração e métricas opcionais.
5. Envia; a PWA mostra “Dado de teste enviado manualmente pelo Kcalix Connector”.
6. Reenvio não duplica e exclusão preserva todos os dados normais.
7. Usuário testa grant/deny/revoke de exercício; nenhum record é lido.

### MVP de saúde

1. Checklist confirma Samsung Health e Health Connect ativos.
2. App explica finalidade, categorias, nuvem e exclusão.
3. Usuário concede permissões necessárias.
4. Spike lê 7 dias somente localmente e fecha os tipos realmente disponíveis.
5. MVP mostra preview e usuário confirma upload.
6. Resultado informa inseridos, atualizados, duplicados e erros.
7. Na PWA, usuário confirma/rejeita vínculos e inclusões.
8. Fontes de kcal aparecem separadas; nada altera a meta automaticamente.
9. Usuário pode pausar, desconectar, exportar ou apagar importados.

## 7. Requisitos funcionais

### Onboarding e conta

- **FR-001:** Detectar indisponibilidade do Health Connect e orientar correção por versão Android.
- **FR-002:** Autenticar com email/senha da conta Kcalix e restaurar/renovar sessão com segurança.
- **FR-003:** Explicar que a permissão Android cobre leitura local, não nuvem nem IA.
- **FR-004:** Solicitar permissões por capacidade, sem toggle pré-marcado.

### Fase Zero manual

- **FR-005:** Compilar, instalar e atualizar APK no emulador e aparelho, preservando estado no
  update e limpando na reinstalação.
- **FR-006:** Permitir input manual de atividade com validação e proveniência `manual_setup`.
- **FR-007:** Enviar o teste com JWT sem aceitar `userId` do cliente.
- **FR-008:** Mostrar o registro somente ao próprio usuário em uma tela isolada da PWA.
- **FR-009:** Reenvio não duplica; usuário consegue apagar; tabelas canônicas não mudam.
- **FR-009A:** Mostrar disponibilidade e grant/deny/revoke de `READ_EXERCISE` sem ler records.

### Leitura e preview

- **FR-010:** Ler sessões de exercício paginadas em foreground.
- **FR-011:** Calcular no aparelho duração, FC média/máxima, distância e energia associadas.
- **FR-012:** Mostrar preview e origem antes do primeiro envio.
- **FR-013:** Usar 7 dias como janela padrão e permitir até 30 sem pedir histórico ampliado.
- **FR-014:** Cancelar/retomar com segurança caso o app deixe o foreground.

### Upload e estado

- **FR-020:** Enviar apenas resumos normalizados e allow-listed.
- **FR-021:** Autenticar cada request e nunca aceitar `userId` do cliente.
- **FR-022:** Repetir upload sem duplicar, inclusive após resposta perdida.
- **FR-023:** Manter fila cifrada e retry apenas para falhas transitórias.
- **FR-024:** Exibir última sincronização e contadores encontrados/enviados/duplicados/erros.
- **FR-025:** Bloquear novos uploads imediatamente quando a conexão estiver revogada.

### Reconciliação

- **FR-030:** Preservar treino Kcalix como fonte de séries, reps e carga.
- **FR-031:** Sugerir vínculo e exigir confirmação no piloto.
- **FR-032:** Sugerir merge/adicionar cardio sem inserção silenciosa.
- **FR-033:** Exibir kcal Kcalix e relógio separadamente.
- **FR-034:** Manter kcal Kcalix efetiva até escolha explícita; nunca somar fontes.
- **FR-035:** Registrar proveniência e permitir rejeitar/desfazer associação.

### Controle e direitos

- **FR-040:** Logout local não desloga PWA nem outros aparelhos.
- **FR-041:** “Desconectar” revoga sync, mas mantém resumos até exclusão explícita.
- **FR-042:** “Desconectar e apagar” remove registros/links/requests importados e preserva manuais.
- **FR-043:** Exportação do Kcalix inclui dados importados e sua proveniência.
- **FR-044:** Dados importados ficam fora do Coach por padrão.

### Capacidades condicionais

- **FR-050:** Peso pode pré-preencher sugestão; manual do dia vence conflito.
- **FR-051:** BF/BIA mantém método separado e nunca substitui dobras.
- **FR-052:** Sono, passos e consentimento do Coach dependem de go/no-go posterior.

## 8. Requisitos não funcionais

- **NFR-001 Integridade:** zero alteração automática nas tabelas manuais durante ingestão.
- **NFR-002 Isolamento:** usuário A não acessa ou relaciona registros do usuário B.
- **NFR-003 Idempotência:** mesma janela sincronizada 3 vezes produz zero duplicatas.
- **NFR-004 Privacidade:** nenhum raw HR/sono, token ou payload em nuvem/log.
- **NFR-005 Segurança local:** sessão e fila cifradas e excluídas de backup.
- **NFR-006 Performance:** mediana <= 30 s; sync de 7 dias <= 60 s no aparelho-alvo.
- **NFR-007 Resiliência:** offline, process death e refresh de sessão não corrompem estado.
- **NFR-008 Manutenibilidade:** versões pinadas, Gradle Wrapper e comandos reproduzíveis no Windows.
- **NFR-009 Custo:** todo o MVP deve funcionar com ferramentas gratuitas e plano Supabase atual.
- **NFR-010 Clareza:** toda métrica importada mostra origem e não é descrita como médica/verificada.

## 9. Consentimento e privacidade

São decisões independentes:

1. ler localmente do Health Connect;
2. enviar e armazenar categorias no Kcalix;
3. compartilhar categorias com o provedor do Coach.

O MVP implementa 1 e 2 para treino/cardio. A etapa 3 permanece desligada. Consentimento deve ser
específico, destacado, revogável e versionado, com finalidade, categorias, retenção, contato e
consequência da recusa. A PWA manual continua utilizável.

A base jurídica final e os textos devem receber revisão jurídica antes de distribuição além do
proprietário. O desenho assume, prudentemente, consentimento específico para dados sensíveis e
não usa “tutela da saúde” como justificativa de um produto fitness não médico.

## 10. Métricas do piloto

Avaliar após pelo menos 14 dias e 8 sessões elegíveis ou 15 sincronizações.

### Hard gates

- 0 duplicatas após ressincronizar a mesma janela 3 vezes.
- 0 perda ou sobrescrita de dado manual.
- 0 dado importado no Coach sem opt-in.
- Revogação bloqueia nova ingestão; exclusão deixa 0 importados consultáveis.
- 0 amostras brutas de FC/sono na nuvem ou logs.

### Metas

- >= 95% dos syncs concluídos, desconsiderando retry automático de rede.
- >= 80% das sessões vistas no Samsung Health aparecem no preview.
- >= 80% dos cardios elegíveis registrados com no máximo uma confirmação e sem redigitar duração.
- >= 90% das sugestões de vínculo são consideradas corretas.
- Mediana de sync <= 30 s e nenhum sync de 7 dias > 60 s.
- Utilidade percebida >= 4/5 e intenção explícita de continuar usando.

### Decisão

- **GO:** todos os hard gates e metas principais passam.
- **CONDITIONAL:** hard gates passam; falha operacional tem causa e correção limitada.
- **NO-GO:** dados Samsung inconsistentes/ausentes, corrupção/dupla contagem, permissão excessiva
  ou nenhuma redução percebida após o piloto.

## 11. Riscos e mitigação

| Risco | Mitigação/gate |
|---|---|
| Samsung não fornece um tipo esperado | KC-06 inventaria dados reais antes do backend definitivo |
| Sync Watch -> telefone atrasado | UI explica latência e oferece checklist Samsung Sync |
| Dupla contagem de kcal | fontes separadas e confirmação explícita |
| Sessões ambíguas no mesmo dia | sugestão nunca vira vínculo automático no piloto |
| Vazamento por APK decompilado | somente chave pública; JWT/RLS/RPC protegem backend |
| Token/fila em backup | Keystore, AES-GCM e regras de exclusão de backup |
| Custo/complexidade Android | stack gratuita, setup guiado e Gradle Wrapper |
| Perda da chave release | dois backups cifrados e runbook de assinatura |
| Sideload mudar em 2026/2027 | APK/ADB no piloto; revisar Limited Distribution antes do release |
| Scope crescer para sono/IA cedo | issues pós-go/no-go separadas |

## 12. Gates de release

- **G0 — ambiente:** build/test/APK reproduzíveis via terminal.
- **G0.1 — runtime:** emulador/aparelho instalam e atualizam preservando estado esperado.
- **G0.2 — vertical slice manual:** Android -> JWT -> Supabase -> PWA -> delete, sem dados canônicos.
- **G0.3 — permissão:** Health Connect e grant/deny/revoke comprovados sem leitura.
- **G1 — viabilidade:** dados reais úteis aparecem localmente no Health Connect.
- **G2 — segurança backend definitivo:** RLS/idempotência/isolamento passam com duas contas.
- **G3 — sync de saúde:** preview -> ingestão -> consulta, sem tocar dados manuais.
- **G4 — reconciliação:** vínculo/cardio/kcal reversíveis e sem dupla contagem.
- **G5 — release:** APK assinado, upgrade testado, exclusão/revogação e QA real aprovados.
- **G6 — merge:** piloto medido e decisão GO/CONDITIONAL registrada.

## 13. Premissas de execução

- Branch única `feature/kcalix-connector`, com commits por issue e merge somente após G5/G6.
- O projeto Android nasce em `connector/android/`.
- O primeiro aparelho é registrado em KC-00; dados disponíveis são medidos em KC-06.
- Login inicial é email/senha.
- Janela padrão é 7 dias; 30 dias é opção.
- M0 prova input manual; M1 mede localmente; M2 cobre exercício/cardio.
- Desconectar e apagar são ações diferentes.
