# Handoff — Kcalix Connector Android + Health Connect

**Data:** 2026-07-19  
**Status:** exploração concluída; decisão de produto tomada; PRD/spec e implementação pendentes  
**Próxima etapa:** executar `KCX-CONN-001` pelo pacote operacional em `memory/kcalix-connector/README.md`

> Este handoff registra a pesquisa e a decisão original. Para executar trabalho, ele deve ser
> lido junto do roadmap, backlog e template de spec em `memory/kcalix-connector/`.

---

## 1. Decisão tomada

Criar um aplicativo Android privado e instalável localmente, provisoriamente chamado
**Kcalix Connector**, para uso inicial do proprietário do projeto.

O conector será compilado como APK, instalado diretamente no celular Android e não
dependerá de publicação na Google Play Store durante o piloto. Ele deverá ler dados do
Health Connect no próprio celular e enviá-los, de forma autenticada e deduplicada, para a
conta correspondente no Supabase do Kcalix.

O Kcalix atual permanece como PWA React/Vite e continua publicado normalmente na Vercel.
O conector é uma camada adicional e isolada; não deve exigir a conversão imediata de toda a
PWA em aplicativo nativo.

Se o piloto comprovar valor real, a evolução preferencial é incorporar o Health Connect em
um único aplicativo Android do Kcalix (possivelmente via Capacitor), evitando dois apps na
experiência pública. Publicação na Play Store é uma fase posterior, não requisito do MVP.

---

## 2. Problema e oportunidade

O Galaxy Watch 5 registra atividade, exercício, frequência cardíaca, sono e outras métricas
no Samsung Health. A PWA atual não consegue acessar o Health Connect diretamente porque a
integração exige APIs, permissões e componentes nativos Android.

O objetivo não é importar todos os sinais disponíveis. O objetivo é reduzir inputs manuais e
adicionar contexto que efetivamente melhore decisões de treino, recuperação e acompanhamento
corporal no Kcalix.

Hipótese central do piloto:

> Vincular os registros estruturados do Kcalix (exercícios, séries, repetições, carga,
> alimentação e check-ins) aos resumos fisiológicos do relógio (duração, calorias, frequência
> cardíaca e cardio) pode produzir automação e recomendações úteis sem transformar o produto
> em aplicação médica.

---

## 3. Arquitetura conceitual aprovada

```text
Galaxy Watch 5
    ↓
Samsung Health no celular
    ↓ sincronização autorizada pelo usuário
Health Connect (armazenamento local Android)
    ↓ leitura pelo app Android
Kcalix Connector
    ↓ HTTPS + JWT do usuário
Supabase Edge Function de ingestão
    ↓ validação, normalização e deduplicação
Tabelas do usuário no Supabase (com RLS)
    ↓
PWA Kcalix + Coach
```

Pontos importantes:

- O conector não consulta uma API cloud da conta Samsung.
- O conector lê o Health Connect localmente no telefone.
- A Samsung confirma o fluxo Watch → Samsung Health → Health Connect.
- A primeira versão deve sincronizar sob ação explícita do usuário (`Sincronizar agora`).
- Sincronização em segundo plano é uma evolução posterior.
- O app deve funcionar offline de forma segura, mantendo uma fila local pequena para nova
  tentativa quando houver internet.

---

## 4. Escopo provável do MVP privado

### Interface mínima

1. Login com a mesma conta usada no Kcalix.
2. Estado da conexão com Health Connect.
3. Solicitação granular das permissões necessárias.
4. Seleção inicial de uma janela de leitura (ex.: últimos 7 ou 30 dias).
5. Botão `Sincronizar agora`.
6. Resultado da sincronização:
   - registros encontrados;
   - enviados;
   - já existentes/ignorados;
   - erros;
   - data/hora da última sincronização.
7. Ação para revogar conexão e apagar dados importados.

### Dados candidatos com valor imediato

| Health Connect / Samsung Health | Uso possível no Kcalix | Prioridade inicial |
|---|---|---|
| Sessão de exercício + horários | Associar ao treino Kcalix por data/intervalo | Alta |
| Duração do exercício | `WorkoutDayData.durationMin` | Alta |
| Calorias do exercício | Comparar/substituir conscientemente a estimativa local | Alta |
| FC média e máxima do exercício | Resumo de esforço do treino | Alta |
| Distância e duração de cardio | Sugerir/preencher cardio do dia | Alta |
| Peso | Pré-preencher medição corporal/check-in | Alta |
| Gordura corporal/BIA | Complementar medição corporal | Média |
| Sono total | Contexto de recuperação e recomendação do dia | Média/alta |
| FC de repouso | Tendência de recuperação, se disponível com consistência | Média |
| Passos | Contexto de atividade diária | Média |
| VO2 max | Evolução cardiovascular | Baixa/média |

### Fora do MVP

- ECG, pressão arterial e alegações médicas.
- SpO2 e sinais brutos sem caso de uso definido.
- Frequência cardíaca segundo a segundo armazenada no Supabase.
- Rotas GPS completas.
- Nutrição do Samsung Health (o Kcalix já é a fonte principal).
- Dados reprodutivos.
- Importação indiscriminada de todo o histórico.
- SDK direta do Samsung Health ou Samsung Health Sensor SDK.
- Aplicativo no relógio.
- Publicação pública na Play Store.
- Sincronização bidirecional/escrita no Samsung Health.

---

## 5. Regras de produto já identificadas

### O relógio complementa, não substitui, o treino Kcalix

O modelo atual do Kcalix registra `exercicioId`, séries, repetições e carga. O Samsung
Health/Health Connect normalmente entrega uma sessão com tipo, horário, duração e métricas
fisiológicas. O vínculo deve enriquecer o treino existente; nunca apagar ou substituir séries
e cargas.

### Calorias não podem ser somadas cegamente

O Kcalix hoje calcula kcal de treino localmente e sincroniza o valor com o diário. O MVP deve
evitar dupla contagem. A PRD deve decidir entre:

- exibir estimativa Kcalix e medição do relógio lado a lado;
- permitir escolha explícita da fonte;
- ou definir uma regra de preferência transparente.

Não ajustar automaticamente a meta alimentar diária a partir de uma única leitura do relógio.
Tendência de peso, ingestão, aderência e período de várias semanas continuam sendo sinais mais
robustos para decisões nutricionais.

### O valor deve estar ligado a uma decisão

Importar dados só para criar novos gráficos tem ROI duvidoso. Casos de uso com maior potencial:

- registro automático de cardio;
- duração e gasto do treino sem digitação;
- contextualização de esforço pela frequência cardíaca;
- recomendação de treino/recuperação usando sono + FC de repouso + volume + performance;
- preenchimento assistido de check-in corporal.

---

## 6. Segurança e privacidade obrigatórias

- Login com usuário real do Supabase; não usar token fixo pessoal no código.
- Armazenar sessão com mecanismo seguro do Android/Keystore.
- Somente `anon key` pública no APK; nunca `service_role`.
- Preferir Edge Function autenticada para ingestão e validação central.
- Toda nova tabela deve ter RLS e ownership por `user_id`.
- Solicitar apenas permissões Health Connect necessárias ao recurso visível.
- Começar somente com leitura.
- Guardar `data_origin`, identificador externo e timestamps para deduplicação/idempotência.
- Não reter o payload bruto se um resumo suficiente puder ser calculado localmente.
- Não enviar dados importados ao Coach/IA por padrão.
- Criar consentimento separado para o Coach usar atividade/sono/recuperação.
- Oferecer revogação de acesso e exclusão dos dados importados.
- Dados de saúde são dados pessoais sensíveis pela LGPD; finalidade, necessidade e consentimento
  devem ser explícitos e destacados.

---

## 7. Viabilidade de instalação local

O MVP pode ser distribuído como APK release assinado e instalado diretamente no Android:

1. gerar `kcalix-connector-x.y.z.apk`;
2. transferir/baixar o APK no celular;
3. autorizar a origem escolhida a instalar aplicativos desconhecidos;
4. instalar;
5. conceder acesso no Health Connect;
6. autenticar no Kcalix e sincronizar.

Não são necessários para o piloto privado:

- conta paga da Play Store;
- listagem pública;
- 12 testadores/14 dias;
- revisão da Google;
- aprovação de parceria da Samsung, pois o caminho inicial usa Health Connect e não a SDK
  proprietária Samsung.

Requisitos operacionais:

- gerar build release, não depender permanentemente de APK debug;
- guardar a chave de assinatura fora do repositório e com backup;
- usar sempre a mesma chave/pacote para instalar atualizações por cima;
- testar no aparelho físico com o Galaxy Watch e Samsung Health reais.

Observação temporal: o Android está iniciando verificação de desenvolvedores em 2026, incluindo
o Brasil no rollout inicial. Isso não transforma a Play Store em requisito do piloto, mas pode
adicionar verificação/avisos para instalações externas. A próxima spec deve revisar a política
vigente no momento da implementação.

---

## 8. Opções técnicas a avaliar na próxima sessão

### Opção A — Android nativo pequeno (Kotlin + Compose)

**Vantagens:** acesso direto e previsível ao Health Connect; poucas camadas; bom para app
pequeno.  
**Custos:** nova stack no projeto; autenticação e rede Android separadas da PWA.

### Opção B — React/Capacitor + plugin nativo Health Connect

**Vantagens:** reaproveita React, TypeScript, Supabase JS e prepara eventual empacotamento do
Kcalix completo.  
**Custos:** ainda exige Kotlin/plugin nativo; adiciona a camada Capacitor; pode ampliar escopo
cedo demais.

### Direção inicial sugerida

Não fixar a tecnologia antes da sessão de PRD/spec. Comparar as duas opções com especialistas
em Android, Health Connect, segurança móvel e integração Supabase. Para o piloto privado, a
solução deve ser pequena e descartável/evolutiva, sem comprometer a arquitetura da PWA.

---

## 9. Pesquisa realizada e evidências

### Fontes oficiais

- [Samsung — acesso aos dados Samsung Health via Health Connect](https://developer.samsung.com/health/blog/en/accessing-samsung-health-data-through-health-connect)
  - confirma Watch → Samsung Health → Health Connect;
  - lista passos, exercício, calorias, distância, FC, potência, velocidade, VO2 max, sono,
    peso, gordura corporal, BMR e altura;
  - alerta que frequência cardíaca contínua pode sincronizar com atraso e que o escopo pode
    variar conforme a versão.
- [Samsung — FAQ Health Connect](https://developer.samsung.com/health/health-connect-faq.html)
  - confirma suporte desde Samsung Health 6.22.5 e acesso indireto aos dados do Galaxy Watch.
- [Android — Health Connect](https://developer.android.com/health-and-fitness/health-connect/get-started)
  - API Android local, permissões granulares e biblioteca Jetpack.
- [Android — leitura em foreground/background e histórico](https://developer.android.com/health-and-fitness/health-connect/read-data)
  - leitura em background requer permissão adicional;
  - dados anteriores a 30 dias requerem permissão de histórico.
- [Android — testes de Health Connect](https://developer.android.com/health-and-fitness/health-connect/test/test-cases)
  - documenta instalação/teste do app e concessão/revogação de permissões no aparelho.
- [Android — publicação de apps Health Connect](https://developer.android.com/health-and-fitness/health-connect/publish)
  - Play Store, Data Safety e Health Apps declaration só entram na fase de publicação.
- [Samsung Health Data SDK](https://developer.samsung.com/health/data/overview.html)
  - alternativa mais rica, mas Android nativa e sujeita a parceria/registro Samsung para
    distribuição.
- [Samsung Health Sensor SDK](https://developer.samsung.com/health/sensor/guide/introduction.html)
  - alternativa futura para app no Watch4 ou posterior; fora do MVP.
- [Samsung — baixar dados pessoais](https://www.samsung.com/us/support/answer/ANS10001379/)
  - confirma o export manual pelo Samsung Health.
- [LGPD compilada](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm)
  - dados referentes à saúde são dados pessoais sensíveis.

### Evidência prática/comunidade

- [Health Connect Webhook — implementação open source](https://github.com/mcnaveen/health-connect-webhook)
  - demonstra o padrão Android local → Health Connect → webhook/backend;
  - não deve ser incorporado cegamente; serve como prova de viabilidade e referência.
- [Samsung Health Extractor](https://github.com/BlackFireAlex/samsung_health_extractor)
  - demonstra parsing de exports pessoais Samsung em CSV.
- [Reddit — export de exercícios Samsung](https://www.reddit.com/r/GalaxyWatch/comments/1j4urz4)
  - usuários localizaram exercícios detalhados em `jsons/com.samsung.shealth.exercise`.
- [Reddit — Health Connect versus SDK Samsung](https://www.reddit.com/r/FlutterDev/comments/1qtug7w/is_samsung_health_sdk_support_still_relevant_for/)
  - relatos de lacunas de sincronização e uso da SDK Samsung como fallback.
- [Reddit — integração direta Samsung/Health Connect](https://www.reddit.com/r/sonarhealth/comments/1r34xm2/samsung_health_vs_health_connect/)
  - evidencia dependência operacional de aprovação/assinatura quando se usa integração Samsung
    direta.

Relatos de Reddit são anedóticos e não substituem documentação oficial; foram usados para
identificar problemas reais e caminhos já experimentados.

---

## 10. Entregáveis da próxima sessão

A próxima sessão não deve começar implementando. Deve produzir:

1. **PRD**
   - problema, persona e jornada;
   - casos de uso e decisões que os dados alimentarão;
   - escopo MVP/não-MVP;
   - métricas de sucesso e critério de continuidade;
   - comportamento de consentimento, desconexão e exclusão.
2. **Spec técnica**
   - Kotlin/Compose versus Capacitor;
   - módulos/pastas;
   - tipos e permissões exatos do Health Connect;
   - autenticação e armazenamento seguro;
   - contrato da Edge Function;
   - migrations e RLS;
   - deduplicação e reconciliação com `workouts`/`diary_entries`;
   - estratégia offline/retry;
   - build, assinatura, instalação e atualização de APK;
   - plano de testes no Galaxy Watch 5/celular real.
3. **Plano de implementação por fases**
   - spike de leitura local;
   - ingestão Supabase;
   - reconciliação no Kcalix;
   - QA real;
   - sincronização em background somente depois.
4. **Revisão especializada**
   - Android/Health Connect;
   - segurança móvel/Supabase;
   - produto/fitness e limites não médicos;
   - privacidade/LGPD.

### Perguntas que a spec precisa responder

- Qual é o modelo/versão Android exato do celular pareado ao Watch 5?
- Quais dados do Samsung Health já aparecem no Health Connect nesse aparelho?
- Qual janela histórica é necessária no primeiro sync?
- Como associar com segurança uma sessão externa ao treino Kcalix do mesmo dia?
- O valor do relógio substitui, complementa ou apenas compara kcal estimadas?
- Quais resumos são calculados localmente antes do upload?
- O Coach poderá usar quais dados e mediante qual consentimento?
- Onde e como será guardada a chave de assinatura do APK?
- Qual é a estratégia de atualização local do conector?

---

## 11. Prompt recomendado para iniciar a próxima sessão

> Leia `memory/handoff-kcalix-connector-android.md` integralmente. A exploração e a decisão de
> produto já foram concluídas: queremos um Kcalix Connector Android privado, instalado via APK
> no celular do proprietário, lendo Health Connect e enviando dados autenticados ao Supabase.
> Não implemente ainda. Organize uma revisão com perfis especializados em Android/Health
> Connect, segurança móvel/Supabase, produto fitness e privacidade/LGPD; em seguida produza um
> PRD e uma spec técnica executável, comparando Kotlin/Compose com React/Capacitor e preservando
> a PWA atual. O MVP deve começar com sync manual, permissões mínimas, leitura apenas, Edge
> Function autenticada, RLS, idempotência e instalação local sem Play Store.

---

## 12. Estado ao encerrar esta exploração

- Nenhum código do conector foi criado.
- Nenhuma migration foi criada.
- Nenhuma permissão Android foi solicitada.
- Nenhuma conta Play Store ou parceria Samsung é necessária para o próximo spike privado.
- A decisão é explorar o conector local antes de qualquer publicação pública.
