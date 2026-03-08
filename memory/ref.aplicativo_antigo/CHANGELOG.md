# Changelog

Todas as mudanças notáveis do Kcal.ix são documentadas aqui.
Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

---

## [v2.11.0] — 2026-03-06

### Adicionado
- [feat] **Coach Modal (📖 Guia de Volume)** — modal educativo com 5 páginas baseado nos protocolos Lucas Campos: Fundamentos (séries válidas, MEV/MAV/MRV, tabela por grupo), Progressão (3 formas de progredir, platô), Volume Cycling (diferença do deload, metáfora do posto), Equilíbrio Muscular (pares antagonistas, Regra da Prioridade), Por Grupo (guia detalhado com landmarks, exercícios e dica para cada grupo). Acessível pelo botão 📖 no header da aba de treino.

### Melhorado
- [improve] **Tags de grupos musculares nos exercícios** — cada exercício na lista agora exibe o grupo primário (roxo) e grupos secundários (cinza) abaixo do nome, sempre visíveis sem precisar expandir o card.
- [improve] **Botões 📊 e 📖 sempre visíveis no header** — Histórico e Guia saíram do fundo da aba para o card-header, acessíveis sem scroll. Formato circular 40×40px.
- [improve] **Seção "📋 Rotinas" recolhível** — templates começam colapsados por padrão (▸/▾), com preview dos primeiros exercícios de cada rotina visível nos botões.
- [improve] **Visual do header de treino** — subtítulo compacto, "Salvar ▶" mais limpo, alinhamento centralizado.
- [improve] **Summary com emojis** — labels: 🔁 Séries · 🏋️ Volume kg · ❤️ Cardio min · 🔥 kcal est.
- [improve] **Label "📝 Observação do treino"** com emoji.

### Notas
- sw.js: bump para `kcalix-v15`.
- Sem mudança de schema no localStorage.

---

## [v2.10.0] — 2026-03-06

### Corrigido
- [fix] **Exercícios de perna divididos em Quad e Posterior no EXERCISE_DB** — anteriormente todos estavam em `"🦵 Pernas"` e a separação era via `QUAD_IDS`/`POST_IDS`. Exercícios custom nunca tinham seus IDs nessas listas e sempre iam para Quad. Agora o EXERCISE_DB tem `"🦵 Quad"` e `"🦵 Posterior"` com os exercícios já classificados.
- [fix] **`resolvePrimaryGroup()` simplificado** — grupos vêm direto do EXERCISE_DB; retrocompat: custom antigos com `"🦵 Pernas"` mapeiam para Quad.
- [fix] **`EX_SECONDARY` para glúteos** — hip thrust, stiff romeno e elevação pélvica agora listam `"🦵 Posterior"` como secundário.
- [fix] **Custom antigos com "🦵 Pernas" aparecem na aba Quad** — retrocompatibilidade no filtro do seletor.
- [fix] **Exercícios custom não contabilizados no analytics** — `exById()` preserva grupo real em vez de sobrescrever com `CUSTOM_EX_GROUP`.
- [fix] **Edição de exercício custom inclui grupos secundários** — `openExSelCustomRename()` exibe chips pré-marcados e salva `secundarios`.

### Melhorado
- [improve] **Estilo do input de rename** — background, borda, focus accent e touch target 40px.

### Notas
- sw.js: bump para `kcalix-v14`.
- Retrocompatibilidade total: treinos e exercícios salvos funcionam sem migração.

---

## [v2.9.2] — 2026-03-06

### Corrigido
- [fix] **Exercícios custom não contabilizados no analytics de volume** — `exById()` sobrescrevia o campo `grupo` real do exercício (ex: `"🦅 Costas"`) com `CUSTOM_EX_GROUP` (`"⭐ Meus exercícios"`), fazendo `resolvePrimaryGroup()` retornar `null` e não somar nenhuma série. Corrigido para preservar o grupo real salvo no localStorage.
- [fix] **Edição de exercício custom sem grupos secundários** — `openExSelCustomRename()` só permitia renomear; agora exibe também chips de grupos secundários pré-marcados com os valores salvos. Ao confirmar, persiste nome + secundarios no localStorage.

### Melhorado
- [improve] **Estilo do input de rename** — campo de texto agora tem background `var(--surface2)`, borda `var(--line)`, focus em roxo `var(--accent)` e botões com touch target correto (40px).

### Notas
- Schema retrocompatível: exercícios sem `secundarios` tratados como array vazio.
- sw.js: mantém `kcalix-v13` (sem mudança de cache necessária).

---

## [v2.9.1] — 2026-03-06

### Corrigido
- [fix] **Insights não disparavam para usuários novos** — `detectVolumeCyclingNeed` (Gatilho A) e `detectChronicLowVolume` contavam semanas vazias (antes do usuário começar a usar o app) como dados negativos, impedindo que os limiares fossem atingidos. Agora apenas semanas com pelo menos um treino registrado são contadas ("semanas ativas"). Gatilho A aguarda 6 semanas ativas (conforme spec); `detectChronicLowVolume` aguarda 3 semanas ativas.
- [fix] **`detectMuscleImbalance` nunca disparava** — os pares de desequilíbrio muscular (`["Peito", "Costas"]` etc.) não incluíam os prefixos de emoji usados como chaves no objeto de volume (`"🏋️ Peito"`, `"🦅 Costas"`, etc.), causando falha silenciosa na comparação. Corrigido para usar as chaves completas com emoji.
- [fix] **Sugestões específicas de `detectChronicLowVolume` nunca apareciam** — `CHRONIC_LOW_SUGGESTIONS` tinha chaves sem emoji (`"Posterior"`, `"Gluteos"`) que não batiam com as chaves reais de `MUSCLE_ORDER`. Corrigido com as chaves corretas (`"🦵 Posterior"`, `"🍑 Glúteos"`, etc.).

### Notas
- Todos os limiares originais mantidos (sem extrapolação ou escalonamento) — a lógica simplesmente ignora semanas sem dados.
- sw.js: `kcalix-v13` (bump feito em v2.9.0).

---

## [v2.8.2] — 2026-03-05

### Corrigido
- [fix] **Barra de progresso invisível no analytics de grupo** — a spec usava `var(--ok)` que não existe no design system; a variável correta é `var(--good)` (`#34d399`). Causava borda e barra de progresso transparentes para grupos no range MEV–MRV (verde esperado).

---

## [v2.8.1] — 2026-03-05

### Corrigido
- [fix] **Janela temporal incorreta no analytics de grupo** — `renderMuscleVolume` e `calcMuscleAvg4weeks` usavam `currentDate()` (date picker) em vez de `todayISO()` (dia real); treinos da semana não apareciam se o picker estava em outra data.
- [fix] **Delta "vs média 4sem" com dados inexistentes** — comparação agora só exibe quando há histórico real (`avg > 0`); sem 4 semanas de dados, o campo fica vazio em vez de mostrar "= média 4sem" enganoso.

---

## [v2.8.0] — 2026-03-05

### Adicionado
- [feat] **Analytics de Volume Muscular** — 3ª aba "💪 Por grupo" no histórico de treino com cards por grupo muscular, barra de progresso MEV→MRV, breakdown diretos vs compostos, comparação com média das 4 semanas anteriores e alertas de fracionamento (>11 sets/dia num grupo).
- [feat] **Grupos secundários em exercícios custom** — modal de criação agora tem chips de toggle para marcar grupos musculares sinergistas; persiste no schema como `secundarios:[]` (retrocompatível com exercícios existentes).
- [feat] **Constantes de landmarks musculares** — `EX_SECONDARY`, `MUSCLE_LANDMARKS`, `MUSCLE_ORDER`, `QUAD_IDS`, `POST_IDS` baseados nos protocolos Lucas Campos / RP.
- [feat] **Algoritmo de volume** — `calcMuscleVolume()`, `calcMuscleAvg4weeks()`, `calcFrequencyAlert()`, `shiftDateStr()`. Séries via compostos valem 0.5x; diretos 1.0x. Pernas separadas em Quad e Posterior.

### Corrigido
- [fix] Clique em exercício na tabela "Por treino" agora abre o modal de progressão individual (carga/volume/gráfico) em vez de redirecionar para aba "Por equipamento".
- [fix] `#exProgModal` com z-index 303 para aparecer corretamente acima do `#tmplHistModal` (que usa 301 padrão).

### Notas
- Schema retrocompatível: `secundarios:[]` tratado como array vazio em exercícios sem o campo.
- Glúteos MEV=15 (maior de todos), Pernas separadas para refletir protocolo Lucas Campos.
- sw.js: bump para `kcalix-v12` necessário no próximo deploy (cache de service worker).
- Infra: Edit e Write tools falham com EEXIST no Windows+OneDrive pausado; edições feitas via `py -c`.

---

## [v2.7.0] — 2026-03-04

### Melhorado
- [improve] **FAB 💾 substitui status bar global** — barra full-width fixa em todas as abas removida; substituída por botão flutuante circular (52×52px) no canto inferior direito, visível apenas na aba Diário. Com autosave OFF fica destacado em roxo.
- [improve] **Kcal estimadas inline no Diário** — valor movido para o card de Progresso (abaixo dos status pills), eliminando a duplicação com a Home.
- [improve] **Toggle auto-salvar em Mais > Configurações** — saiu do rodapé global e foi para o lugar correto, com descrição contextual.
- [feat] **Atalho exercício → histórico** — clicar em qualquer linha de exercício na tabela de comparação do histórico de treino navega direto para a aba "🏋️ Por equipamento" já filtrada naquele exercício.

### Notas
- Decisão de design: barra global contextual → FAB contextual (seguindo padrão Material/iOS).
- Atalho exercício → histórico é base para melhorias futuras (ex: mini-gráfico inline de progressão por exercício).
- Sem mudanças em schema de localStorage ou storage keys.
- sw.js: mantém `kcalix-v11` (sem mudança de cache necessária para UX only).

---

## [v2.6.0] — 2026-03-04

### Corrigido
- [fix] **"＋ Exercício" invisível com lista vazia** — `renderExList()` fazia `return` prematuro antes de adicionar o botão; reestruturado para if/else.
- [fix] **Gráfico de progressão** — labels de valor (`top:-16px`) colidiam com botões acima; corrigido com `margin-top:24px` no `.pr-chart-bar-wrap` (substituiu `padding-top` que quebrava o layout interno).
- [fix] **Tab "⭐ Meus" no exSelectorModal** — aparecia apenas se já houvesse exercícios custom; agora sempre visível.
- [fix] **Template fantasma** — `createNewTemplate()` persistia no localStorage antes do usuário salvar; corrigido com flag `editingIsNew` — template só persiste ao clicar "✅ Salvar".
- [fix] **Botão "＋ Criar exercício" sumia após criar o 1º exercício** — só aparecia no estado vazio; agora sempre ao final da aba "⭐ Meus".
- [fix] **Exercício custom não aparecia na aba do grupo muscular** — `renderExSelectorCatalog()` usava só `EXERCISE_DB`; agora mescla custom exercises pelo campo `grupo`.
- [fix] **Clique no exercício custom não adicionava ao treino** — handler estava no botão "+" com `stopPropagation`; movido para o `el` inteiro (igual aos built-in).
- [fix] **Scroll quebrado nos modais full** — `.modal-sheet.modal-full .modal-body` sem `min-height:0` impedia o `overflow-y:auto` de funcionar; adicionado `min-height:0` e `overscroll-behavior:contain`.
- [fix] **`saveCustomEx` sempre refreshava template editor** — agora detecta se `#exSelectorModal` está aberto e chama `renderExSelectorCatalog()` no contexto correto.

### Melhorado
- [improve] **Exercícios custom no exSelectorModal** — aba "⭐ Meus" exibe botões ✏️ (rename inline) e 🗑️ (excluir com confirm) para cada exercício, com `openExSelCustomRename()` dedicado ao contexto do modal de treino.

### Notas
- Custom exercises: UX ainda pode melhorar (edição de grupo, reordenação, busca na lista).
- sw.js: `kcalix-v10` → `kcalix-v11`

---

## [v2.4.1] — 2026-03-03

### Corrigido
- [fix] **Barras da tendência de hábitos não refletiam dados reais** — `renderHabitTrend` usava `toISOString()` (data UTC) para lookup, mas os hábitos são salvos com `todayISO()` (data local). Corrigido para `_localISO()`, consistente com `_habitStreak` e `_habitAdherence`.
- [fix] **Barra da semana atual sempre muito baixa** — divisor fixo `7` substituído por `validDays` (dias não-futuros da semana), normalizando corretamente semanas parciais.
- [fix] **`renderHabitMonth` com `todayStr` em UTC** — `today.toISOString().slice(0,10)` substituído por `_localISO(today)` para consistência.

---

## [v2.4.0] — 2026-03-03

### Adicionado
- [feat] **Histórico de Hábitos** (`#habitHistorySheet`, z-index 325): bottom sheet acessível pelo botão 📊 no cabeçalho do card de hábitos.
- [feat] **Aba "📅 Mês"** (heatmap calendário): círculos coloridos por score (0–5 hábitos, escala roxa → accent), navegação ‹ › entre meses, tooltip com detalhes ao tocar em cada dia (hábitos feitos/não feitos), rodapé com % aderência e dias com ≥3 hábitos.
- [feat] **Aba "📈 Por hábito"** (tendência 8 semanas): uma linha por hábito com 8 mini-barras proporcionais (% da semana cumprido), % de aderência das últimas 4 semanas e streak de dias consecutivos 🔥.
- [feat] **Botão 📊** no trigger do card de hábitos — abre o histórico sem abrir/fechar o accordion.

### Corrigido
- [fix] **HTML inválido: `<button>` dentro de `<button>`** no trigger do card de hábitos — causava o botão 📊 aparecer em linha separada. Trigger convertido para `<div>` mantendo comportamento idêntico.
- [fix] **Células do heatmap com ~46px** (aspect-ratio + colunas 1fr em 375px) — corrigido para tamanho fixo 28×28px com `margin: 0 auto`.
- [fix] **Aderência calculada sobre período fixo** — agora usa o 1º registro do usuário como início do denominador. Usuário com 7 dias de dados vê aderência real daqueles 7 dias, não 7/28.
- [fix] **Timezone bug em `_habitStreak` e `_habitAdherence`** — `toISOString()` (UTC) substituído por helper `_localISO()` que usa data local, consistente com `todayISO()` e as chaves do storage.

### Melhorado
- [improve] Meses sem nenhum registro exibem "Sem registros neste mês" em vez de "0%".

### Notas técnicas
- Zero mudança de schema — lê `blocos_tracker_habits_v1` existente.
- Z-index hierarquia: habitHistory overlay/sheet 324/325.
- `#btnOpenHabitHistory` gerado via `innerHTML` em `renderHabitTracker()` — re-bind explícito após render (não no INIT).
- Nav ‹ › do heatmap re-bind a cada `renderHabitMonth()` (gerado dentro de `#habitHistBody`).
- CACHE_NAME bumped: `kcalix-v8` → `kcalix-v9`.

### Pendências
- v2.5.0: próxima feature a definir.

---

## [v2.3.0] — 2026-03-03

### Adicionado
- [feat] **Histórico de Check-ins** (`blocos_tracker_checkins_v1`): snapshots periódicos que capturam corpo (peso, cintura, BF%, massa magra), energia (BMR, TDEE, meta calórica), objetivo, e resumo automático dos últimos 7 dias de treino e nutrição.
- [feat] **Formulário de registro de check-in** (`#checkinFormModal`, z-index 323): pré-preenche peso/cintura com dados do dia em `measure.days`, calcula automaticamente o período (treino: sessões, kcal avg, tipo; nutrição: kcal média, % aderência à meta). Campo de nota livre.
- [feat] **Bottom sheet de histórico** (`#checkinHistorySheet`, z-index 319): lista de cards do mais recente ao mais antigo — data, objetivo (badge), peso + delta vs check-in anterior, cintura, BF%, BMR/meta, resumo treino/nutrição e nota.
- [feat] **Seção "Último check-in"** no modal de perfil: exibe peso registrado, delta colorido (▲/▼) em relação ao peso atual do perfil, data e dias passados. Link "📋 Histórico" abre o histórico diretamente.
- [improve] **exportAIJson**: campo `goalType` adicionado em `profile.bodyData`; campo `checkins` (array completo) adicionado no topo do JSON exportado — IA agora tem acesso ao histórico de progresso e ao objetivo real do usuário.

### Corrigido
- [fix] `textarea` do formulário de check-in com `font-size: 14px` (iOS zoom) — corrigido para herdar `16px` da regra combinada.

### Notas técnicas
- Z-index hierarquia atualizada: historySheet overlay/sheet 318/319 · customFood 320/321 (intacto) · checkinForm overlay/modal 322/323.
- `btnOpenCheckinHistory` é gerado dinamicamente via `innerHTML` em `openProfileCheckin()` — re-bind feito explicitamente após o render.
- `WZ_GOAL_LABELS_LOCAL` em `renderCheckinHistory` é intencional: versão sem emojis/texto longo para caber no badge compacto.
- CACHE_NAME bumped: `kcalix-v7` → `kcalix-v8`.
- Spec completa implementada: `memory/spec-checkin-history.md`.

### Planejado para v2.4.0
- Gráfico de linha peso/BF% ao longo dos check-ins registrados.

---

## [v2.2.0] — 2026-03-03

### Adicionado
- [feat] **Tela de boas-vindas para 1º acesso** (`data-step="welcome"` no wizard): abre automaticamente quando o app é aberto pela primeira vez, com copy motivacional, 3 cards de proposta de valor (Metas, Progresso, Treino+Nutrição) e botão "Começar minha jornada →". Apenas para novos usuários — usuários com perfil existente não veem esta tela.
- [feat] **Modal de check-in do perfil nutricional** (`#profileCheckinModal`, z-index 317): abre ao clicar "Meu Perfil Nutricional" ou "🧭 Configurar" quando perfil já existe. Exibe snapshot completo: corpo (peso/altura/idade/sexo, BF%, massa magra, método BMR), energia (BMR, TDEE, meta calórica), macros diários (P/C/G) e data do último check-in. Botão "Atualizar dados →" abre o wizard.
- [feat] **Campo `updatedAt`** no objeto `calc` (ISO string): salvo automaticamente em cada `calcAll()`. Exibido no modal de check-in como "Último check-in: DD mmm AAAA". Retrocompatível — usuários sem o campo veem "—".

### Corrigido
- [fix] **Bug crítico: wizard de 1º acesso nunca abria**: `DEFAULT_CALC` tem valores completos (76 kg, 177 cm, 37a, 7 dobras), então `calcAll()` no INIT rodava com sucesso e gravava no `CALC_KEY` antes do check `=== null` — o wizard jamais era acionado. Solução: flag `_profileConfigured` capturada **antes** do INIT (`let _profileConfigured = localStorage.getItem(CALC_KEY) !== null`), usada tanto no trigger do INIT quanto em `openCalcWizard()`.
- [fix] **openCalcWizard() tratava novo usuário como existente**: a função re-checava `localStorage.getItem(CALC_KEY)` internamente — mas após o INIT, CALC_KEY sempre existe (defaults salvos). Corrigido para usar `!_profileConfigured`, garantindo que novo usuário sempre veja o step "welcome".

### Notas técnicas
- `_profileConfigured` é uma variável de módulo (let, ~linha 4182). É setada `true` em `wizardFinish()`, `btnCalcRun` e `btnCalcSave`.
- A função `_openProfileOrWizard()` centraliza o roteamento dos botões: `_profileConfigured → check-in modal`, senão `openCalcWizard()`.
- CACHE_NAME bumped: `kcalix-v6` → `kcalix-v7`.
- Commit: `a5da23b` — deploy realizado via GitHub Pages.
- **Ideia futura**: histórico de check-ins — guardar múltiplos snapshots do perfil com data para visualizar evolução corporal ao longo do tempo.

---

## [v2.0.0] — 2026-03-02

### Adicionado
- [feat] **Wizard de configuração guiada do perfil** (`#calcWizard`, z-index 315): fluxo conversacional de 4 passos para configurar o perfil nutricional — dados básicos → dobras cutâneas (JP7 ou estimativa Mifflin) → objetivo → nível de atividade. Abre automaticamente no primeiro acesso.
- [feat] **Passo 0 — revisão de perfil**: usuários com perfil salvo veem um resumo legível ("♂ Homem · 37 anos · 76 kg", objetivo, atividade) e escolhem entre revisar tudo ou recalcular direto.
- [feat] **Seletor de objetivo** (`#calcGoalType`): maintain / cut / recomp / bulk com `GOAL_PRESETS` baseados nos protocolos de Lucas Campos. Preenchem déficit, proteína, carbo e gordura mín automaticamente.
- [feat] **Atalho na Home** — botão "🎯 Meu Perfil Nutricional" no grid de atalhos (home-action-card, full-width), abre o wizard diretamente.
- [feat] **Aplicação automática de metas**: `wizardFinish()` e "Recalcular assim ✅" capturam o resultado de `calcAll()` e atualizam `settings.goals.{pG, cG, gG, kcal}` sem passo extra.

### Corrigido
- [fix] **Erro: Cannot read properties of null (addEventListener)**: HTML do wizard estava após o `</script>`, sendo parseado depois do IIFE. Movido para antes do `<script>` principal (~linha 2729).
- [fix] **Wizard com fundo transparente**: variáveis CSS inexistentes (`--bg1`, `--bg2`, `--border`, `--text1`) substituídas pelas variáveis reais do projeto (`--bg`, `--surface2`, `--line`, `--text`).

### Notas
- O perfil configurado pelo wizard é a fonte de dados primária para o coach IA (GPT/Gemini Gem) — quanto mais completo o perfil, mais precisa a análise do coach.
- CACHE_NAME bumped: `kcalix-v5` → `kcalix-v6`.
- Commit: `02e2837` — deploy realizado via GitHub Pages.
- Arquitetura crítica: wizard HTML deve sempre estar **antes do `<script>`** no arquivo.

---

## [v1.10.4] — 2026-03-02

### Corrigido
- [fix] **Scroll da lista "Adicionados hoje" no food drawer**: lista não rolava — `.fd-peek` ganhou `display:flex; flex-direction:column`, `.fd-peek.open .fd-log` ganhou `max-height: calc(50vh - 44px)` para ativar o `overflow-y:auto`, e `overscroll-behavior:contain` impede o scroll vazar para o drawer.

### Adicionado
- [docs] **AI_Assistant.md**: guia completo para configurar coach IA personalizado (Gemini Gem ou GPT). Inclui system prompt com persona de coach/nutricionista data-driven, algoritmos de diagnóstico, formato de resposta e recomendações de knowledge base.
- [docs] **knowledge/**: 4 documentos baseados nos protocolos de Lucas Campos para upload como base de conhecimento no Gem/GPT — `protocolo-cut.md`, `protocolo-bulk.md`, `protocolo-recomp.md`, `interpretacao-kcalix-json.md`.

### Notas técnicas
- Spec v1.11.0 (seletor de objetivo cut/bulk/recomp/maintain) finalizada com valores reais derivados dos protocolos de Lucas Campos. GOAL_PRESETS validados em `memory/algoritmo-consulta-nutricional.md`. Pronta para implementação.

---

## [v1.10.3] — 2026-03-02

### Adicionado
- [feat] **Modal de histórico semanal**: botão "📊 histórico" no canto superior direito do card "Últimos 7 dias" na Home. Abre bottom sheet com gráfico de barras e projeção de qualquer semana passada. Navegação ‹/› entre semanas, botão › desabilitado na semana atual.

### Corrigido
- [fix] **Barras do gráfico semanal desproporcionais**: `total` passou a usar `bmr + exercise` em vez de `tdee + exercise`. TDEE (BMR × fator de atividade) somado ao treino duplicava o gasto — barra cinza ficava muito alta em relação ao consumido.
- [fix] **Projeção semanal não aparecia**: threshold reduzido de `>= 3` para `>= 2` dias com `balance != null`. Com a correção anterior do balance (que passou a exigir `consumed > 0`), o início de semana nunca atingia 3 dias.
- [fix] **Fundo transparente no modal de histórico**: variável CSS `--surface1` não existe no projeto; substituída por `linear-gradient(180deg, #1a2035, #121828)` (padrão do `.modal-sheet`).

### Notas técnicas
- `total` e `basalTotal` são agora o mesmo valor (`bmr + exercise`); `tdee` ainda é calculado e retornado no objeto de `getEnergyForDate()` mas não é usado nos renderers.
- CACHE_NAME bumped: `kcalix-v4` → `kcalix-v5`.
- **Próxima feature planejada (v1.11.0)**: objetivos de dieta inteligentes — seletor cut/bulk/recomp/maintain com presets baseados em evidência científica. Spec em `memory/algoritmo-consulta-nutricional.md`. Aguarda JSON de pesquisa científica para implementação.

---

## [v1.10.2] — 2026-03-02

### Melhorado
- [improve] **Aba "Mais" reestruturada**: Card "🍎 Nutrição" no topo (metas + calculadora unificada) e Card "⚙️ Configurações" abaixo (equivalência de blocos + kcal estimada). Ordem invertida para fluxo mais natural.
- [improve] **Calculadora unificada**: dados básicos + dobras + alvo de dieta em um único accordion `#accCalcFull` (era 3 accordions separados).
- [improve] **Kcal alvo auto-calculado**: campo "Kcal alvo" nas Metas diárias agora é readonly e mostra P×4+C×4+G×9 em tempo real ao digitar os macros.
- [improve] **Banner de perfil (`#nutriBanner`)**: exibe BMR / BF% / Massa magra quando perfil configurado, ou aviso de primeiro acesso quando não.
- [improve] **Calculadora auto-abre** no primeiro acesso (quando CALC_KEY === null).
- [improve] **"Aplicar nas metas"**: botão `btnSendToSettings` agora atualiza visualmente os campos de metas após enviar (chama `fillSettingsForm()`).
- [improve] **Labels do seletor de atividade**: renomeadas para descrever estilo de vida (ex.: "Moderadamente ativo") em vez de multiplier TDEE. Valores numéricos preservados (compatibilidade com dados existentes).

### Corrigido
- [fix] **Dupla contagem no balanço energético**: `balance` agora usa `BMR + treino logado` como base (não mais `TDEE × fator + treino`). KPI "gasto" renomeado para "basal".

### Notas técnicas
- `total` do gráfico semanal ainda usa `tdee + exercise` para normalização visual das barras (altura proporcional). ⚠️ Isso causou as barras ficarem altas demais e a projeção parar — **pendente correção na próxima sessão** (ver pendências abaixo).
- Nenhum storage key alterado — dados existentes preservados.

---

## [v1.10.1] — 2026-03-01

### Melhorado
- [improve] **Botão "Adicionar alimentos"**: trocado de `acc-trigger` para `btn ghost` full-width — visual consistente com demais botões do app (borda visível, min-height 44px, anima ao toque)
- [improve] **Lista "Adicionados hoje"**: `max-height` expandida de `33vh` para `50vh` — mais itens visíveis antes de precisar de scroll
- [improve] **X de limpar busca centralizado**: padding do `.fd-search-wrap` ajustado de `12px 12px 0` para `10px 12px` (simétrico) — ícone e botão ✕ alinhados ao centro do campo

### Documentação
- [docs] **SPEC - Implementar AI.md**: guia completo para gerar especificação técnica de AI Agent nutricional (Estágio 1 consultivo + Estágio 2 agêntico) incluindo instruções de implementação para vibe-coder (API keys, hosting, banco de dados, passo a passo por fase)

---

## [v1.10.0] — 2026-03-01

### Adicionado
- [feat] **Tab "Recentes" no Food Drawer**: exibe os últimos 10 alimentos únicos adicionados (por `foodId`, ordem cronológica desc via campo `at`). Só aparece se houver histórico no `foodLog`.
- [feat] **Botão ✕ para limpar busca**: aparece dentro do campo de pesquisa quando há texto digitado — limpa instantaneamente sem precisar apagar manualmente.
- [feat] **21 novos alimentos no FOOD_DB** distribuídos em 7 categorias:
  - 🍞 Pães: Biscoito de arroz
  - 🥩 Carnes: Sobrecoxa assada (s/ pele), Frango desfiado c/ molho tomate
  - 🥤 Proteicos: Nestlé/Nutren Whey, Piracajuba Whey, Not Shake (choc + morango), Leite de soja (original + zero), Leite de amêndoas, Queijo Cottage
  - 🥜 Oleaginosas: Amêndoas torradas (com sal), Mix de castanhas e sementes
  - 🍫 Doces: Biscoito Jasmine S/ Açúcar, Biscoito Nesfit, Bolo de fubá, Bolo aveia/banana/passas S/ Açúcar
  - 🍔 Fast-food: Sanduíche de Frango Empanado, Nuggets assado (airfryer/forno)
  - 🍌 Frutas: Pitaya, Mirtilo (Blueberry)

### Melhorado
- [improve] **Food Panel Drawer**: seção "Adicionar alimentos" do Diário completamente redesenhada.
  - Substitui os 3 sub-accordions aninhados (`#accFoodSearch`, `#accFoodLog`, `#accCustomFood`) por um **bottom sheet fixo de 88dvh** com animação slide-up
  - Layout: header fixo → busca → tabs → grid scrollável (`flex:1`) → botão "personalizado" sticky → peek "adicionados hoje"
  - Grid de alimentos limitado à área do drawer — página não rola mais enquanto lista cresce
- [improve] **"Adicionados hoje" como peek expansível**: barra fixa de 44px na base do drawer com contagem dinâmica. Toque expande até `max-height: 33vh` com lista scrollável. Colapsa/expande sem fechar o drawer.
- [improve] **"Alimento personalizado" em mini-modal**: botão sempre visível na última linha do drawer. Ao clicar, abre modal dedicado (z-index 321) com o mesmo formulário de 6 campos — sem precisar rolar o drawer.

### Corrigido
- [fix] **Z-index do modal de porção**: `#foodModal` estava em z-index 301, abaixo do drawer (311) — o modal de porção abria invisível. Corrigido com inline `z-index: 316` (overlay: 315).
- [fix] **`window.openFoodDrawer` não exposto**: função definida dentro do IIFE não era acessível pelo atributo `onclick` inline. Adicionado `window.openFoodDrawer = openFoodDrawer`.

### Notas
- `sw.js`: CACHE_NAME `kcalix-v3` → `kcalix-v4` — força reload do cache nos usuários existentes
- Nenhuma chave de localStorage alterada — dados do usuário preservados
- `renderFoodPanel` mantido como alias de `renderFoodDrawer` para compatibilidade interna

---

## [v1.9.0] — 2026-03-01

### Melhorado
- [improve] **UX de alimentos na aba Diário — reposicionamento e sub-accordions**:
  - Accordion "🍽️ Adicionar alimentos" movido para dentro do card Progresso, logo após os KPIs e antes de ☕ Café — sem scroll longo para chegar na seção
  - Conteúdo interno reorganizado em 3 sub-accordions colapsáveis: **🔍 Buscar alimento**, **📋 Adicionados hoje (N itens)**, **➕ Alimento personalizado**
  - Título "Adicionados hoje" mostra contagem dinâmica de itens no próprio botão do accordion
  - Card separado de Alimentos removido — estrutura integrada ao card Progresso
- [improve] **Modal de porção — controle granular**:
  - Input numérico editável substitui display estático — usuário pode digitar qualquer valor decimal (ex: 1.3, 2.5, 0.25)
  - 4 botões de ajuste rápido: **−.5 / −.1 / +.1 / +.5** (era apenas −0.5 / +0.5)
  - Cursor protegido: `updateModalUI` não sobrescreve o input enquanto em foco
  - Mínimo: 0.1 porção

### Corrigido
- [fix] **max-height accordion**: override `#accAlimentos` → 9000px para evitar clipping quando sub-accordions estão abertos simultaneamente com lista grande de alimentos

### Notas
- `sw.js`: CACHE_NAME `kcalix-v2` → `kcalix-v3` — força reload do cache nos usuários existentes
- Nenhuma chave de localStorage alterada
- `FOOD_DB` intacta — lista de alimentos não foi tocada

---

## [v1.8.3] — 2026-03-01

### Adicionado
- [feat] **Banner de instalação PWA** fixo acima da bottom-nav:
  - **iOS Safari**: instrução manual "Compartilhar → Adicionar à Tela de Início"
  - **Android Chrome**: captura `beforeinstallprompt` e exibe botão "Instalar" com prompt nativo
  - Dismiss via ✕ salvo em `blocos_tracker_pwa_dismissed` (não reaparece)
  - Esconde automaticamente via evento `appinstalled`
  - Touch targets dos botões ≥ 40px

### Corrigido
- [fix] **manifest.json**: `scope` e `start_url` agora absolutos (`/blocos-tracker/`) — resolve abertura em modo browser em vez de standalone no iOS
- [fix] **manifest.json**: `"purpose": "any maskable"` separado em duas entradas distintas — compatibilidade com validadores iOS/Safari
- [fix] **`apple-mobile-web-app-title`**: "Blocos" → "Kcal.ix"
- [fix] **Diet auto-check**: hábito "dieta" agora só é marcado automaticamente se jantar estiver preenchido (indica fim do dia) — antes disparava pela manhã com qualquer valor ≤ meta
- [fix] **Export JSON IA**: `totalKcal` em `nutrition.days` usa `settings.kcalPerBlock` (idêntico ao app) em vez de `blocks.pG × 4` — elimina divergência em configs personalizadas
- [fix] **`btnSave`**: agora persiste `foodLog` explicitamente junto com `data` — eliminava risco de perda do log de alimentos após reload sem autosave

### Notas
- **Para testar**: validar banner iOS e fluxo de instalação em device real (iPhone)
- localStorage: nenhuma chave alterada; nova chave: `blocos_tracker_pwa_dismissed`

---

## [v1.8.0] — 2026-03-01

### Adicionado
- [feat] **Timer de Pausa** no viewTreino — accordion "⏱ Timer de Pausa" com:
  - 5 presets configuráveis (padrão: 30s · 1:00 · 1:30 · 2:00 · 3:00) salvos em `blocos_tracker_timer_presets_v1`
  - Um toque no preset seleciona e inicia imediatamente
  - Long press (600ms) no preset abre edição inline (prompt)
  - Botões Stop e Reset
  - Display grande MM:SS com estado visual (branco → verde rodando → roxo finalizado)
- [feat] **Notificação nativa** ao fim da pausa — funciona com o app minimizado (Android Chrome e iOS PWA instalada ≥ 16.4)
  - Permissão solicitada uma vez no primeiro uso; timer funciona normalmente se negada
  - Clicar na notificação foca/abre o app via `notificationclick` no Service Worker
- [feat] **Cronômetro** (conta pra cima) — aba secundária dentro do mesmo accordion, start/pause/reset
- [feat] **sw.js**: handler `notificationclick` para focar janela existente ou abrir nova

### Técnico
- `CACHE_NAME`: `kcalix-v1` → `kcalix-v2` (bump obrigatório pela mudança no sw.js)
- `setTimeout` usa `Date.now()` como referência (sem drift acumulado em background)
- Nova chave localStorage: `blocos_tracker_timer_presets_v1` (array de inteiros em segundos)

### Notas
- **iOS sem PWA instalada**: notificações não funcionam no Safari sem instalar o app na tela inicial — limitação da plataforma Apple.
- localStorage: nenhuma chave existente alterada; dados de treino intactos.

---

## [v1.7.0] — 2026-03-01

### Adicionado
- [feat] **Energy Analytics Dashboard** na Home — painel de análise energética diária e semanal:
  - `getEnergyForDate(date)`: helper puro que retorna `{consumed, bmr, tdee, exercise, total, balance}` para qualquer dia.
  - Card **"⚡ Energia Hoje"**: 4 KPIs inline (kcal consumido / gasto basal / treino / saldo) com cor semântica — verde para déficit, roxo para superávit.
  - Barra de progresso consumido vs meta kcal.
  - **Gráfico semanal Seg–Dom**: barras duplas sobrepostas (gasto atrás em surface3, consumido na frente em accent) + linha meta tracejada. Dia atual com borda destacada; dias futuros sem barra; dias sem dados com opacidade reduzida.
  - **Projeção kg/semana**: média de saldo dos últimos 7 dias × 7 / 7700 — exibida se ≥ 3 dias com dados (📉 déficit / 📈 superávit).
- [feat] **Saudação contextual vs histórico** — ao visualizar hoje: "Bom dia/tarde/noite 👋"; ao visualizar dia passado: "📅 Histórico". Dados e cards atualizam em tempo real ao mudar a data.

### Melhorado
- [improve] **Home reativa aos 3 caminhos de mudança de data** — `renderHomeDashboard()` agora é chamado explicitamente em: (1) `datePick.change`, (2) `shiftDate()` — botões ‹ ›, (3) `btnGoToday` — botão "hoje". Antes era necessário clicar na aba Home para atualizar.

### Corrigido
- [fix] `barWrap.innerHTML` não era resetado no path `hasBmr=true` de `renderEnergyCard()` — a cada re-render uma nova barra era acumulada sobre a anterior.
- [fix] `.week-bar-wrap` sem altura efetiva (colapsava para `min-height:4px` por `flex:1` sem pai esticado) — corrigido com altura explícita via `style="height:${chartH}px"` inline.

### Notas
- **Requer JP7 configurado** (Mais → Calculadora) para exibir barras de gasto basal/total no gráfico. Sem JP7, o card mostra apenas consumido + mensagem instrutiva. Isso é intencional — sem BMR não é possível calcular gasto real.
- **Ideia futura**: tela de primeiro acesso / onboarding quando não há nenhum dado registrado — guiar o usuário a configurar JP7, metas e primeiro log antes de exibir o dashboard.
- localStorage: **nenhuma mudança de schema** — dados existentes totalmente compatíveis.

---

## [v1.6.0] — 2026-02-28

### Adicionado
- [feat] **Auto-check de hábitos ao salvar dados** — ao salvar Diário (hábito "log" e "dieta"), Treino/Cardio ("treino" e "cardio") e Medidas ("medidas"), o hábito correspondente é marcado automaticamente para o dia de hoje, com toast de confirmação. Guard `currentDate() === todayISO()` garante que só afeta o dia atual.

### Melhorado
- [improve] **FAB (+) removido** — era redundante com o grid 2×2 da Home e causava confusão sobre sua função.

### Notas
- localStorage: nenhuma mudança de schema.

---

## [v1.5.0] — 2026-02-28

### Identidade
- [feat] **App renomeado: Blocos Tracker → Kcal.ix** — `<title>`, `<h1>`, `manifest.json` (name/short_name), prompt do sistema IA e nome do arquivo de export JSON. Storage keys preservados intactos (sem perda de dados).

### Adicionado
- [feat] **Home dashboard** — nova aba padrão com saudação contextual (Bom dia/tarde/noite), data formatada, card de progresso calórico (barra kcal consumida vs meta) e 3 mini-barras de macros (Proteína / Carbo / Gordura em gramas vs meta).
- [feat] **Grid 2×2 de ações rápidas** na Home — blocos quadrados tocáveis: 📊 Diário · 🏋️ Treino · 📏 Corpo · 🤖 IA Export. Toque no card de progresso navega direto ao Diário.
- [feat] **FAB (+)** — botão flutuante fixo (placeholder visual; Fase 2 implementa bottom sheet de quick-add).
- [feat] **Abertura inteligente via sessionStorage** — app abre na Home na primeira abertura; mantém a aba ativa ao trocar de app e voltar (sessionStorage limpa ao fechar a aba do browser).

### Melhorado
- [improve] **Bottom-nav: 6 → 5 abas** — Home · Diário · Treino · Corpo · Mais. Thumb zone otimizada; `grid-template-columns: repeat(5, 1fr)`.
- [improve] **Aba "Mais"** unifica Ajustes + Calculadora JP7 (antes em abas separadas) num único accordion, limpando a nav principal.
- [improve] **Alimentos integrado no Diário** — seção "🍽️ Alimentos" como accordion colapsável no fim da aba Diário (busca, log do dia, alimento personalizado). Não ocupa mais uma aba dedicada na nav.
- [improve] **Habit Tracker movido para a Home** — removido do topo do Diário; `renderHabitTracker()` continua apontando para `#habitTracker` sem mudança de lógica.

### Corrigido
- [fix] `grid-template-columns: repeat(6→5, 1fr)` no `.bottom-nav-inner` — com 5 tabs, o 6º slot gerava coluna vazia e tabs menores.

### Infraestrutura
- Service Worker: `blocos-v5` → `kcalix-v1` (limpeza de cache antigo; necessária por causa do rename).
- `PLAN.md` adicionado ao repositório — plano de reestruturação com todas as etapas [x] marcadas.

### Notas
- localStorage: **nenhuma mudança de schema** — todos os dados do usuário compatíveis com versões anteriores.
- ⚠️ Bug pré-existente registrado (não introduzido nesta versão): `select#tmplEditCardioType` tem `font-size: 13px` → pode causar zoom automático no iOS ao focar. Correção planejada.
- Próxima fase (Fase 2): FAB com bottom sheet de quick-add (Alimento / Treino / Medição rápida).

---

## [v1.4.0] — 2026-02-27

### Adicionado
- [feat] **Habit Tracker semanal** no topo da aba Tracker — grid Seg–Dom com 5 hábitos (🥗 Dieta, 🍽️ Log, 🏋️ Treino, 🏃 Cardio, 📏 Medidas). Círculos neon por hábito com glow effect ao marcar. Dias futuros bloqueados. Score do dia (ex: 3/5) sempre visível no cabeçalho.
- [feat] Habit Tracker **retrátil** — toggle com animação suave (`max-height`). Estado aberto/fechado persistido em `localStorage`. Colapsado exibe score dots coloridos + contagem ao lado do título.
- [feat] **Botão "hoje"** no header — pill roxo minimalista que aparece (fade) ao navegar para outro dia e some ao voltar para hoje. Redefine data e sincroniza todas as views.

### Infraestrutura
- Service Worker: `blocos-v4` → `blocos-v5`.
- Novo localStorage key: `blocos_tracker_habits_v1` — schema `{ "YYYY-MM-DD": { "dieta": true, "log": false, ... } }`. Não toca em nenhum dado existente.

### Notas
- Ideia futura: auto-check de Treino e Medidas quando o usuário salva dados nessas seções (hoje é 100% manual).

---

## [v1.3.0] — 2026-02-27

### Adicionado
- [feat] Export para Coach IA: card "🤖 Exportar para IA" na aba Macros com dois botões — **⬇️ Baixar JSON** (últimos 60 dias de nutrição, treino, medições, perfil e log detalhado de alimentos) e **📋 Copiar prompt do sistema** (pronto para Custom GPT ou Gemini Gem).
- [feat] `nutrition.foodLog` no JSON exportado: log detalhado de cada alimento selecionado por dia/refeição (nome, qty, gramas reais P/C/G, blocos, kcal, timestamp).

### Melhorado
- [improve] FOOD_DB revisado com base em TACO & Atwater: 104 → 109 alimentos. Categoria renomeada para "Pães, Cereais & Raízes" com adição de batata doce, mandioca e macarrão. Novas carnes: tilápia, salmão, lombo suíno. Novos legumes: abóbora, couve-flor, espinafre. Fast-food: +sushi salmão, temaki, batata frita, cachorro-quente. Doces: +doce de leite, goiabada, paçoca, gelatina. Valores nutricionais corrigidos em todas as categorias.
- [improve] Prompt do sistema IA reescrito: estrutura correta do JSON exportado, mapeamento de mealId para nomes de refeições, distinção explícita entre valores em blocos (nutrition.days) e em gramas (foodLog.entries).

### Corrigido
- [fix] Export JSON não disparava download: `loadJSON()` chamado sem fallback gerava `SyntaxError` silencioso — substituído por variáveis IIFE já carregadas.
- [fix] `measure.entries` → `measure.days` (medições exportadas saíam sempre vazias).
- [fix] 5 campos com nomes errados no export: `settings.meals` → `MEALS`; `day.meals[i]` → `day.meals[m.id]`; `settings.pBlockG/goalP` → `settings.blocks.pG / settings.goals.pG`; `calc.weight` → `calc.weightKg`.
- [fix] Aderência calculada com unidades mistas (blocos vs gramas) — normalizado para blocos em ambos os lados.

### Infraestrutura
- Service Worker: `blocos-v3` → `blocos-v4` (limpeza de cache antigo no celular).

### Notas
- localStorage: nenhuma mudança de schema nos dados existentes. O export é somente leitura.
- Próximo passo planejado: integração direta de IA no app (API key do usuário, sem necessidade de exportar manualmente).

---

## [v1.2.0] — 2026-02-27

### Adicionado
- [feat] Medição: modal "Ver evolução 📈" com gráfico SVG nativo — filtrável por Peso (kg), Cintura (cm) e BF%. Tooltip por ponto, resumo com Mínimo / Máximo / Atual / Variação (▲▼).
- [feat] Treino: grupo 🍑 Glúteos com 7 exercícios (Hip thrust barra/máquina, Máquina de glúteos, Glúteo no cabo, Elevação pélvica, Stiff romeno/RDL, Agachamento sumô). Total: 63 → 70 exercícios.

### Melhorado
- [improve] Treino: proteção ao trocar de template — confirm() se houver séries preenchidas, evitando perda acidental de dados.
- [improve] Treino: chip de volume por exercício (roxo, ex: "2.4k vol") exibido ao lado do badge de carga máxima no header de cada exercício.
- [improve] Treino: toggle Carga máx / Volume no gráfico de barras do modal de progressão 📊 — barra roxa para volume, azul para carga.
- [improve] Treino: cálculo de kcal de musculação escala por reps × carga com piso 5 / teto 14 kcal por série (antes: 7 kcal fixo independente do esforço).
- [refactor] Botão 📸 Snap removido — não tinha utilidade prática (o auto-save e o histórico funcionam sem ele).

### Infraestrutura
- Service Worker: `blocos-v2` → `blocos-v3` (limpeza de cache antigo no celular).

### Notas
- localStorage: nenhuma mudança de schema — dados existentes totalmente compatíveis.
- Roadmap próximo: gráficos de tendência de volume de treino ao longo do tempo (volume total por template/sessão).

---

## [v1.1.1] — 2026-02-27

### Melhorado
- [improve] Modal de histórico: valores exibidos em gramas reais (blocos × g/bloco) em vez de número de blocos.
- [improve] Modal de histórico: percentual real sem cap de 100% — ao ultrapassar a meta, exibe o valor verdadeiro (ex: 127%) com cor de aviso laranja.
- [improve] Presets — modo sugestão não-destrutivo: clicar em um preset exibe chips `→N` clicáveis em cada campo P/C/G de cada refeição, sem sobrescrever dados existentes. Barra contextual com "Aplicar tudo" e "✕ Descartar".
- [improve] Presets — Segunda e Sexta separados (antes eram um único "Seg/Sex" com os mesmos valores).
- [improve] Presets — layout 3×2 no mobile (grid, sem quebra assimétrica); accordion fechado por padrão para não ocupar espaço na abertura do app.
- [feat]    Presets editáveis: modal ✏️ full-height com tabs por dia da semana. Usuário edita P/C/G de cada refeição por preset, salva em localStorage e pode restaurar os valores padrão individualmente.
- [improve] Modal de edição de presets: legenda de referência de blocos (1P=Xg / 1C=Xg / 1G=Xg) exibida no topo, refletindo as configurações atuais de ⚙️ Ajustes.

### Notas
- Novo storage key: `blocos_tracker_presets_v1` — armazena presets customizados do usuário. Compatível com dados existentes (não toca nos outros keys).

---

## [v1.1.0] — 2026-02-26

### Adicionado
- [feat] Modal 📋 Histórico de dias na aba Tracker — botão no card de Progresso abre lista full-height com todos os dias registrados, exibindo data, kcal estimada e mini barras P/C/G com % da meta. Badge 📸 marca dias com snapshot manual.
- [feat] Navegação ‹ › entre dias diretamente no date picker do header — limite de 90 dias atrás e +1 dia à frente.
- [feat] Banner contextual "📅 Editando: [data]" com botão "→ Hoje" — aparece no card de Progresso ao navegar para um dia diferente de hoje.
- [docs] Tabela de comandos disponíveis exibida ao final do `/start`.
- [docs] Skill `/end` criada para encerramento estruturado de sessões.

### Corrigido
- [fix] Modal de histórico não carregava dados: `day.meals` é um objeto `{ id: {p,c,g} }`, não array — corrigido uso de `Object.values()`.

### Infraestrutura
- Service Worker atualizado: `blocos-v1` → `blocos-v2` (limpeza de cache antigo).

### Notas
- localStorage: nenhuma mudança de schema — dados existentes totalmente compatíveis.
- Próximo passo natural: iniciar itens do roadmap planejado (dashboard calórico, gráficos de tendência, refeições favoritas, export/import JSON).

---

## [v1.0.0] — 2026-02-26

### Adicionado
- Release inicial: PWA single-file com tracking de macros (Blocos P/C/G), calculadora JP7, medições corporais, treinos com templates e progressão, base de 104 alimentos brasileiros.
- Funciona 100% offline via Service Worker.
- Dados persistidos em localStorage.
