# Kcalix — Memória persistente entre sessões

## Projeto
- **Stack:** React + Vite + TypeScript + Tailwind + Supabase
- **Repo:** `AdilMtl/kcalix` → `kcalix.vercel.app`
- **Local:** `Desktop/Development/kcalix/`
- **Roadmap:** `memory/ROADMAP.md` no projeto
- **Referência do app original:** `memory/ref.aplicativo_antigo/referência.index.html` (~6200 linhas)
- **Contexto técnico de port:** `memory/contexto-port.md`

## Skills disponíveis (`.claude/commands/`)
- `/start` — iniciar sessão, verificar estado git e build
- `/spec` — escrever especificação antes de qualquer mudança
- `/port` — portar elemento do app original (metodologia desta sessão)
- `/check-port` — verificar fidelidade do port ao original (linha a linha vs referência.index.html)
- `/feature` — adicionar funcionalidade nova
- `/fix` — corrigir bug
- `/improve` — melhorar existente
- `/review` — checklist antes de deploy
- `/deploy` — commit + push mid-session
- `/end` — encerrar sessão com documentação
- `/status` — estado rápido
- `/undo` — reverter com segurança
- `/migrate` — migrar dados do app antigo

## Specs pendentes para próximas sessões
- [Kcalix Hybrid Icon System sem emojis](spec-iconografia-profissional.md) — piloto aprovado pelo usuário em 2026-07-10 na branch `feature-icon-system`: Coach autoral Ember 3D, Icons8 Color local para Home/Diário/Corpo/Mais, halter Icons8 Color simplificado para Treino e SVGs locais para controles pequenos. Publicação no `main` autorizada.
- [Migração Visual Ember Design System](spec-visual-ember-design-system.md) — CONCLUÍDA E APROVADA em 2026-07-09 na branch local `feature-ember-design-system`; QA visual manual feito pelo usuário durante a execução; build e testes finais passaram; liberada para commit, push e merge/publicação.
- Pós-Ember — abrir nova branch depois de fechar/mergear `feature-ember-design-system` para substituir emojis por ícones bonitos/consistentes (ex.: biblioteca de ícones ou sistema próprio), sem misturar com a migração visual atual.
- [Broadcasts Fase 6C — spec detalhada por fase](spec-broadcasts.md) — canal admin→usuário; 4 fases (texto→imagem→survey→feed); migration 014; iniciar com "implementar Fase 6C-1"

## Sessao Ember Design System — 2026-07-09
**Status:** concluída e aprovada; Fase 8 IA/Coach concluída, QA visual manual aprovado pelo usuário, ajustes finais aplicados e branch liberada para commit/push/merge.

**Branch atual:** `feature-ember-design-system`
- A branch sugerida na spec era `feature/ember-design-system`, mas o ambiente local nao conseguiu criar branch com barra (`unable to create directory for .git/refs/heads/feature/ember-design-system`). Foi criada a branch local equivalente `feature-ember-design-system`.
- Merge em `main` liberado após commit da branch.
- Commit/push pendentes apenas como etapa operacional de fechamento.

**Fatia concluida:**
- Fase 0 parcial: baseline tecnico executado e servidor local/LAN usado para revisao.
- Fase 1 inicial: tokens globais Ember aplicados em `src/index.css`.
- Componentes globais migrados: `Nav`, `DateNavBar`, FAB do Coach, `Skeleton`, `UpdateToast`.
- `VisualMockPage` agora abre por padrao em `Ember Training`.
- FAB do Coach foi alinhado ao Ember e, após feedback do usuário, manteve `🤖` para preservar sensação de presença/assistente com "olhos".
- Corrigido baseline local invalido em `index.html`: havia `k<!doctype html>` no working tree antes da migracao; foi restaurado para `<!doctype html>`. O arquivo ficou sem diff depois da correcao.
- Fase 3 concluida tecnicamente: `TreinoPage` recebeu classes Ember dedicadas (`training-*`) para shell, header, rotinas, cards de exercicio, inputs de series, cardio, timer, observacao e resumo; `ExerciseSelector`, `ExerciseProgressionModal`, `TemplateEditorModal`, `TemplateHistoryModal`, `CoachGuideModal` e `CustomExerciseModal` foram alinhados em sheet/superficie/cores Ember.
- Fase 4 concluida tecnicamente: `DiarioPage`, `FoodDrawer`, `FoodPortionModal`, `CustomFoodModal`, `AiLogConfirmModal`, `PhotoReviewSheet` e `DiaryHistoryModal` foram alinhados com Ember sem alterar hooks, Supabase, Edge Functions ou regras de calculo.
- Fase 5 concluida tecnicamente: `HomePage`, `HabitTracker`, `HabitHistoryModal` e `WeeklyKcalModal` foram alinhados ao `Ember Ritual Home`, com Home virando central de decisao do dia, habitos recolhidos por padrao e graficos semanais compactos.
- Fase 6 concluida tecnicamente: `CorpoPage`, `BodyEvolutionModal`, `ProfileCheckinModal`, `MaisPage`, `CalcWizardModal` e `MigrateModal` foram alinhados ao Ember; Corpo virou painel de tendencia/medicoes e Mais virou configuracoes tecnicas com banner nutricional e sheets consistentes.
- Fase 7 concluida tecnicamente: `LoginPage`, `SetPasswordPage`, `AdminPage` e `AppMessageModal` foram alinhados ao Ember; autenticacao recebeu classes `auth-*`, painel admin recebeu casca `admin-*`, e broadcasts/enquetes receberam card `app-msg-*` sem fundo azul/roxo antigo.
- Fase 8 concluida tecnicamente: `AiChatModal` foi alinhado ao Ember; bottom sheet, header, marca AI, estado vazio, chips, bolhas, foto enviada, loading, erro e composer receberam classes `ai-chat-*`; não houve alteração em `useAiChat`, Edge Functions, prompts, parsing, vision ou regras de IA.
- Ajuste final de personalidade do Coach: símbolo `AI` foi trocado de volta para `🤖` no FAB, header e hero do chat, mantendo o acabamento Ember.
- Fechamento/QA final: usuário aprovou a migração visual após revisar durante a execução; `InstallPrompt` foi alinhado ao Ember; resíduos visuais antigos no CSS global foram limpos; `VisualMockPage` deixou de usar `vw` no H1; bloco de cardio do Treino recebeu marcador técnico `HR`, select sem emoji e grid responsivo para evitar corte do campo de minutos.

**Registro detalhado da Fase 3 — Treino Ember:**
- `src/pages/TreinoPage.tsx`
  - Container principal convertido para `training-page` + `training-shell`.
  - Header de treino convertido para `training-header`, com titulo tecnico e botao salvar usando `training-save-btn`.
  - Secao de rotinas convertida para `training-section-toggle`, `training-routine-grid` e `training-routine-btn`.
  - Lista de exercicios convertida para `training-ex-list` e `training-ex-card`; estado aberto recebe destaque Ember.
  - Nome do exercicio, grupo muscular, secundarias, referencia anterior, volume e badge de series/carga receberam classes dedicadas.
  - Tabela de series usa `training-set-table`, mantendo `set-input` com altura minima 44px e fonte numerica.
  - Cardio, timer, observacao e resumo usam `training-panel`, `training-field` e `training-summary-grid`.
  - Lógica de `useWorkout`, `useCustomExercises`, `useHabits`, timer, templates, calculos e persistencia nao foi alterada.
- `src/index.css`
  - Adicionadas classes `training-*` para tela de treino, cards, inputs, botões, sheets, tabs, listas e modais.
  - Mantidos tokens Ember globais ja aplicados: `--ember`, `--magenta`, `--energy`, `--font-title`, `--font-body`, `--font-data`, `--gradient-action`.
- `src/components/ExerciseSelector.tsx`
  - Sheet saiu do gradiente antigo azul/roxo e passou para `var(--surface)` com borda/sombra Ember.
  - Tabs, badges custom e sinais de adicionar/trocar migrados para laranja/energia.
- `src/components/ExerciseProgressionModal.tsx`
  - Sheet, toggle carga/volume e barras do grafico alinhados com Ember.
  - Carga usa `--ember`; volume usa `--magenta`.
- `src/components/TemplateEditorModal.tsx`
  - Sheet, inputs, selects, botoes salvar/excluir, dots de cor e catalogo de exercicios alinhados com Ember.
  - Fluxo de salvar/excluir em dois taps preservado.
- `src/components/TemplateHistoryModal.tsx`
  - Sheet, abas, marcadores MEV e insights alinhados com Ember.
  - Texto de ajuda atualizado de "linha roxa" para "linha laranja".
- `src/components/CoachGuideModal.tsx`
  - Sheet, abas, MEV e blockquotes alinhados com Ember.
  - Labels das abas ficaram mais tecnicas e com menos emoji.
- `src/components/CustomExerciseModal.tsx`
  - Sheet, input, select, chips secundarios e CTA alinhados com Ember.
  - Fluxo de criar exercicio custom por cima do ExerciseSelector preservado.

**Arquivos alterados nesta fatia:**
- `src/index.css`
- `src/App.tsx`
- `src/components/Nav.tsx`
- `src/components/DateNavBar.tsx`
- `src/components/Skeleton.tsx`
- `src/components/UpdateToast.tsx`
- `src/pages/VisualMockPage.tsx`
- `src/pages/TreinoPage.tsx`
- `src/components/ExerciseSelector.tsx`
- `src/components/ExerciseProgressionModal.tsx`
- `src/components/TemplateEditorModal.tsx`
- `src/components/TemplateHistoryModal.tsx`
- `src/components/CoachGuideModal.tsx`
- `src/components/CustomExerciseModal.tsx`
- `src/pages/DiarioPage.tsx`
- `src/components/FoodDrawer.tsx`
- `src/components/FoodPortionModal.tsx`
- `src/components/CustomFoodModal.tsx`
- `src/components/AiLogConfirmModal.tsx`
- `src/components/PhotoReviewSheet.tsx`
- `src/components/DiaryHistoryModal.tsx`
- `src/pages/HomePage.tsx`
- `src/components/HabitTracker.tsx`
- `src/components/HabitHistoryModal.tsx`
- `src/components/WeeklyKcalModal.tsx`
- `src/pages/CorpoPage.tsx`
- `src/components/BodyEvolutionModal.tsx`
- `src/components/ProfileCheckinModal.tsx`
- `src/pages/MaisPage.tsx`
- `src/components/CalcWizardModal.tsx`
- `src/components/MigrateModal.tsx`
- `src/pages/LoginPage.tsx`
- `src/pages/SetPasswordPage.tsx`
- `src/pages/AdminPage.tsx`
- `src/components/AppMessageModal.tsx`
- `src/components/AiChatModal.tsx`

**Registro detalhado da Fase 4 — Diario/IA Ember:**
- `src/pages/DiarioPage.tsx`
  - Container convertido para `diary-page`, painel de totais para `diary-panel` e KPIs para `diary-kpi-*`.
  - Acoes de adicionar alimento convertidas para botoes tecnicos `BUSCA`, `TEXTO`, `FOTO`, sem depender de emoji como sinal principal.
  - Refeicoes convertidas para `diary-meal-*`; macros e entradas usam `--font-data` e cores P/C/G Ember.
  - Agua convertida para `diary-water-*`; barra saiu do azul/roxo antigo e usa `--good`/`--energy`.
- `src/components/FoodDrawer.tsx`
  - Drawer convertido para `food-sheet`, busca/tabs/lista para `food-*`.
  - Acoes de custom food passaram para labels tecnicas `EDIT`/`DEL`.
  - Fundo antigo `#1a2035 -> #121828` removido.
- `src/components/FoodPortionModal.tsx`
  - Sheet, stepper de quantidade, input central, chips de refeicao e CTA alinhados com `food-*`.
  - kcal passou a usar `--ember` e numeros usam `--font-data`.
- `src/components/CustomFoodModal.tsx`
  - Sheet e campos convertidos para `food-field-*`; CTA usa `food-primary-btn`.
  - Inputs de macros/kcal usam `--font-data`.
- `src/components/AiLogConfirmModal.tsx`
  - Sheet, select de refeicao, itens detectados, gramas, macros custom e totalizador convertidos para `ai-food-*`.
  - Gradiente roxo antigo removido do confirmar/salvar; CTA usa `--gradient-action`.
- `src/components/PhotoReviewSheet.tsx`
  - Review de foto e estado vazio convertidos para `ai-food-*`.
  - Checklist de extras usa `ai-extra-card`; low-confidence usa badge `Revisar`.
  - Totalizador e footer alinhados com confirmacao IA.
- `src/components/DiaryHistoryModal.tsx`
  - Historico do diario convertido para `diary-history-*`.
  - Barra segmentada P/C/G manteve logica, mas usa tratamento Ember e `--font-data`.
  - `useEffect` de carregamento ajustado para evitar `react-hooks/set-state-in-effect` no lint escopado.

**Registro detalhado da Fase 5 — Home/Habitos Ember:**
- `src/pages/HomePage.tsx`
  - Home reorganizada como central de decisao do dia: `Treino de hoje`, card de inicio do treino, motivo, plano minimo, calorias/macros, habitos recolhidos, insight discreto, pulso semanal, grafico kcal compacto e snapshot de energia.
  - Recomendacao de treino usa heuristica local conservadora com `DEFAULT_TEMPLATES` e historico ja carregado por `fetchAllWorkoutRows`.
  - Tracking diario de calorias/macros foi preservado e ganhou dica de margem para a proxima refeicao (`ate XP / YC / ZG`).
  - Onboarding automatico passou a usar estado derivado para evitar `react-hooks/set-state-in-effect` no lint escopado.
  - Apos feedback do usuario ("nao ficou nada bonita como o mock"), a Home foi refinada para ficar mais fiel ao `Ember Ritual Home`: hero maior/dramatico, readiness quadrado com anel conic, calorias com mais presenca, pulso semanal em pilulas verticais e faixa `Coach insight`.
  - Nao foram alterados hooks, Supabase, Edge Functions, auth, migrations ou regras de calculo.
- `src/components/HabitTracker.tsx`
  - Agora inicia recolhido por padrao.
  - Header compacto mostra `Habitos diarios`, score, bolinhas e acao `HIST`.
  - Removido subcomponente criado dentro do render para passar `react-hooks/static-components`.
- `src/components/HabitHistoryModal.tsx`
  - Sheet e calendario receberam acabamento Ember via CSS.
  - Carregamento lazy ganhou cancelamento/microtask para passar lint escopado.
- `src/components/WeeklyKcalModal.tsx`
  - Fundo azul antigo removido em favor de `var(--gradient-panel)`.
  - Barra ingerida usa `--ember`; marcador/hoje usam `--energy`.
  - Carregamento e reset de offset ajustados para passar lint escopado.
- `src/index.css`
  - Adicionadas classes `home-*` para hero, cards, macros, runway, pulso semanal, grafico kcal, acoes e responsividade mobile.
  - Overrides Ember adicionados para `habit-*`, `habit-hist-*` e calendario de habitos.

**Registro detalhado da Fase 6 — Corpo/Mais Ember:**
- `src/pages/CorpoPage.tsx`
  - Container convertido para `body-page`/`body-card`.
  - Adicionado painel de tendencia com ultima leitura e metricas de peso, cintura e BF.
  - Accordions, inputs, dobras e historico receberam classes `body-*`, com numeros em `--font-data`.
  - Refinamento final apos QA visual do usuario: o painel de tendencia foi ajustado para evitar quebra/overflow nas caixas de Peso/Cintura/BF; removida largura minima fixa, unidades vazias deixam de aparecer, labels ficaram mais compactas e fallback virou `sem base`.
  - Lógica de `useBody`, `useSettings`, salvar/limpar medicao, dobras e historico foi preservada.
- `src/components/BodyEvolutionModal.tsx`
  - Sheet antigo azul removido em favor de `mchart-*` e `var(--gradient-panel)`.
  - Peso usa `--ember`, cintura usa `--magenta`, BF usa `--good`.
  - Tabs, tooltip, grafico SVG e resumo tecnico foram alinhados ao Ember.
- `src/components/ProfileCheckinModal.tsx`
  - Sheet e historico alinhados ao Ember, com labels mais tecnicas e menos dependencia de emoji.
  - Ajustados `Date.now` e reset de view para passar lint de pureza/hooks.
- `src/pages/MaisPage.tsx`
  - Tela convertida para `more-page`/`more-card`.
  - Banner nutricional virou resumo tecnico de kcal/BMR/TDEE/macros.
  - Export IA, migracao, backup, configuracoes e calculadora foram alinhados com superficies Ember.
- `src/components/CalcWizardModal.tsx`
  - Recebeu overrides Ember no CSS para wizard, cards de escolha, preview e footer.
  - Reset ao abrir passou a usar microtask/cancelamento para passar lint escopado.
- `src/components/MigrateModal.tsx`
  - Sheet antigo azul removido em favor de `mg-*` e `var(--gradient-panel)`.
  - Preview usa badges tecnicos e barra de progresso `--gradient-action`.
- `src/index.css`
  - Adicionadas classes `body-*`, `more-*`, `mchart-*`, `mg-*`, `.sheet-handle` e overrides Ember para check-in/wizard.
  - Nao foram alterados hooks, Supabase, Edge Functions, auth, migrations, import/export ou regras de calculo.

**Registro detalhado da Fase 7 — Login/Admin/AppMessageModal Ember:**
- `src/pages/LoginPage.tsx`
  - Login e recuperação de senha migrados para classes `auth-*`.
  - Card, logo, inputs, alertas, nota de convite, link secundário e footer alinhados a Ember.
  - Foco dos inputs passou para `--ember` com glow discreto; roxo antigo removido da tela.
  - Fluxos `signInWithEmail` e `resetPassword` preservados.
- `src/pages/SetPasswordPage.tsx`
  - Tela de definição/recuperação de senha migrada para `auth-*`.
  - Estados loading, inválido, pronto e sucesso alinhados ao Ember.
  - Detecção de convite virou estado inicial derivado para passar `react-hooks/set-state-in-effect`.
  - Fluxo Supabase `onAuthStateChange` e `updatePassword` preservados.
- `src/pages/AdminPage.tsx`
  - Casca principal migrada para `admin-page`, `admin-shell`, `admin-header`, `admin-tabs` e `admin-kpi-grid`.
  - Header virou marca técnica `KCX`, abas usam `--gradient-action`, KPIs usam `--font-data`.
  - Badges de usuários trocaram sinal principal por textos técnicos (`ON`, `INV`, `PEN`, `OFF`).
  - Controles de segmentação e resultados reduziram roxo antigo em favor de `--ember`/`--energy`.
  - `load()` foi convertido para `useCallback` e disparado via microtask cancelável para passar lint escopado.
  - Regras de convite, ativação, remoção, broadcasts, segmentação e enquetes preservadas.
- `src/components/AppMessageModal.tsx`
  - Modal de broadcast/enquete saiu do fundo antigo `#1a2035`/`#121828` para `app-msg-*` + `var(--gradient-panel)`.
  - Overlay, card, close, imagem, corpo, opções de survey, radio visual, textarea e dica foram alinhados ao Ember.
  - Parser Markdown continua seguro, sem `dangerouslySetInnerHTML`.
- `src/index.css`
  - Adicionadas famílias `auth-*`, `admin-*` e `app-msg-*`.
  - Responsividade básica adicionada para auth/admin em mobile estreito.
  - Não foram alterados hooks, Supabase, Edge Functions, auth, migrations ou regras de cálculo.

**Registro detalhado da Fase 8 — IA/Coach Ember:**
- `src/components/AiChatModal.tsx`
  - Bottom sheet antigo `#1a2035`/`#121828` removido em favor de `ai-chat-sheet` + superficie Ember.
  - Avatar/hero do Coach deixou o roxo antigo e manteve o símbolo `🤖` com `--gradient-action`, por decisão de produto para preservar sensação de assistente virtual com personalidade.
  - Estado vazio, chips de sugestao, capacidades, bolhas de usuario/coach, bolha de foto enviada, loading, erro, opcoes de foto/galeria e composer foram migrados para classes `ai-chat-*`.
  - Bolha do usuario, foto enviada, botao de camera ativo e botao enviar usam `--gradient-action`; loading usa `--energy`; superficies usam `var(--surface)`/`var(--gradient-panel)`.
  - Busca por cores antigas em `AiChatModal.tsx` (`#1a2035`, `#121828`, `#7c5cff`, `#6144e0`, `#a78bfa`, `rgba(124,92,255...)`) nao encontrou matches.
  - Regras preservadas: `useAiChat`, `sendPhotoToAi`, `pendingLog`, `AiLogConfirmModal`, `PhotoReviewSheet`, `useCustomFoods`, `onAddFoods`, Supabase, Edge Functions, auth, migrations, prompts, parsing, vision e regras de cálculo.
- `src/index.css`
  - Adicionada familia `ai-chat-*`.
  - Keyframes `bounce` e `photoProgress` foram movidos do componente para CSS global.
  - Não foram alterados hooks, Supabase, Edge Functions, auth, migrations, IA ou regras de cálculo.

**Decisão pós-branch Ember — ícones**
- Depois de QA/aprovação e fechamento/merge da branch `feature-ember-design-system`, abrir uma nova branch dedicada para substituir emojis por ícones bonitos e consistentes.
- Não misturar essa troca de iconografia com a migração Ember atual.
- Objetivo futuro: reduzir dependência de emojis em ações e UI recorrente, mantendo personalidade onde fizer sentido (ex.: Coach), usando biblioteca de ícones ou um sistema visual próprio.

**Validacoes executadas:**
- `npm run build` passou.
- `C:\Program Files\nodejs\npm.cmd run test` passou: 2 arquivos, 49 testes.
- Lint escopado passou:
  `C:\Program Files\nodejs\npx.cmd eslint src/App.tsx src/components/DateNavBar.tsx src/components/Nav.tsx src/components/Skeleton.tsx src/components/UpdateToast.tsx src/pages/VisualMockPage.tsx`
- Nesta retomada, `npm run build` passou novamente.
- Nesta retomada, `C:\Program Files\nodejs\npm.cmd run test` passou fora do sandbox: 2 arquivos, 49 testes. Dentro do sandbox, Vitest falhou ao carregar `vite.config.ts` por `Access is denied`, conforme limitação já conhecida.
- Nesta retomada, lint escopado passou:
  `C:\Program Files\nodejs\npx.cmd eslint src/pages/TreinoPage.tsx src/components/ExerciseSelector.tsx src/components/ExerciseProgressionModal.tsx`
- Ao concluir Fase 3, `npm run build` passou novamente.
- Ao concluir Fase 3, `C:\Program Files\nodejs\npm.cmd run test` passou fora do sandbox: 2 arquivos, 49 testes.
- Ao concluir Fase 3, lint escopado passou:
  `C:\Program Files\nodejs\npx.cmd eslint src/pages/TreinoPage.tsx src/components/ExerciseSelector.tsx src/components/ExerciseProgressionModal.tsx src/components/TemplateEditorModal.tsx src/components/TemplateHistoryModal.tsx src/components/CoachGuideModal.tsx src/components/CustomExerciseModal.tsx`
- Ao iniciar Fase 4, `npm run build` passou.
- Ao concluir Fase 4, `npm run build` passou.
- Ao concluir Fase 4, lint escopado passou:
  `C:\Program Files\nodejs\npx.cmd eslint src/pages/DiarioPage.tsx src/components/FoodDrawer.tsx src/components/FoodPortionModal.tsx src/components/CustomFoodModal.tsx src/components/AiLogConfirmModal.tsx src/components/PhotoReviewSheet.tsx src/components/DiaryHistoryModal.tsx`
- Ao concluir Fase 4, `http://localhost:5173/diario` respondeu `200 OK`.
- Ao concluir Fase 4, busca por cores antigas nos arquivos atuais da Fase 4 (`124,92,255`, `7c5cff`, `#1a2035`, `#121828`, `38bdf8`, `#6144e0`, `var(--accent)`, `var(--accent2)`) nao encontrou matches nos arquivos atuais.
- Ao concluir Fase 5, `npm run build` passou.
- Ao concluir Fase 5, lint escopado passou:
  `C:\Program Files\nodejs\npx.cmd eslint src/pages/HomePage.tsx src/components/HabitTracker.tsx src/components/HabitHistoryModal.tsx src/components/WeeklyKcalModal.tsx`
- Ao concluir Fase 5, `C:\Program Files\nodejs\npm.cmd run test` passou fora do sandbox: 2 arquivos, 49 testes. Dentro do sandbox, Vitest falhou ao carregar `vite.config.ts` por `Access is denied`, conforme limitacao ja conhecida.
- Apos refinamento visual final da Home, `npm run build` passou novamente e lint escopado da Fase 5 passou novamente.
- Ao concluir Fase 6, `npm run build` passou.
- Ao concluir Fase 6, lint escopado passou:
  `C:\Program Files\nodejs\npx.cmd eslint src/pages/CorpoPage.tsx src/pages/MaisPage.tsx src/components/BodyEvolutionModal.tsx src/components/ProfileCheckinModal.tsx src/components/CalcWizardModal.tsx src/components/MigrateModal.tsx`
- Ao concluir Fase 6, `C:\Program Files\nodejs\npm.cmd run test` passou fora do sandbox: 2 arquivos, 49 testes. Dentro do sandbox, Vitest falhou ao carregar `vite.config.ts` por `Access is denied`, conforme limitacao ja conhecida.
- Apos refinamento visual final do painel de tendencia do Corpo, lint de `src/pages/CorpoPage.tsx` passou e `npm run build` passou novamente.
- Ao concluir Fase 7, `npm run build` passou.
- Ao concluir Fase 7, lint escopado passou:
  `C:\Program Files\nodejs\npx.cmd eslint src/pages/LoginPage.tsx src/pages/SetPasswordPage.tsx src/pages/AdminPage.tsx src/components/AppMessageModal.tsx`
- Ao concluir Fase 7, `C:\Program Files\nodejs\npm.cmd run test` passou fora do sandbox: 2 arquivos, 49 testes. Dentro do sandbox, Vitest falhou ao carregar `vite.config.ts` por `Access is denied`, conforme limitacao ja conhecida.
- Ao concluir Fase 8, busca por cores antigas em `src/components/AiChatModal.tsx` (`#1a2035`, `#121828`, `#7c5cff`, `#6144e0`, `#a78bfa`, `rgba(124,92,255...)`) nao encontrou matches.
- Ao concluir Fase 8, lint escopado passou:
  `C:\Program Files\nodejs\npx.cmd eslint src/components/AiChatModal.tsx`
- Ao concluir Fase 8, `npm run build` passou.
- Ao concluir Fase 8, `C:\Program Files\nodejs\npm.cmd run test` passou fora do sandbox: 2 arquivos, 49 testes. Dentro do sandbox, Vitest falhou ao carregar `vite.config.ts` por `Access is denied`, conforme limitacao ja conhecida.
- Fechamento final aprovado pelo usuario:
  - `npm run build` passou.
  - `C:\Program Files\nodejs\npm.cmd run test` passou fora do sandbox: 2 arquivos, 49 testes.
  - Lint escopado passou para `src/pages/TreinoPage.tsx` e `src/components/InstallPrompt.tsx`.
  - Busca por residuos visuais antigos (`#1a2035`, `#121828`, `#7c5cff`, `#6144e0`, `rgba(124,92,255...)`, `font-size` com `vw`, `letter-spacing` negativo) nao encontrou ocorrencias relevantes no app real.
  - `npm run lint` completo ainda falha por debitos antigos fora do escopo em hooks e `coverage/`; nao foi tratado nesta spec visual.
- Observacao historica de retomada anterior: em uma execucao passada, `npm run test` nao foi concluido porque dentro do sandbox o Vitest falhou ao carregar `vite.config.ts` por `Access is denied` e a solicitacao para rodar fora do sandbox foi recusada por limite de uso da conta.
- Servidor local iniciado fora do sandbox em `http://127.0.0.1:5174`; `Invoke-WebRequest` retornou `200 OK` para `/visual-mock` e `/treino`.
- Validacao no browser interno:
  - `/visual-mock` carregou sem erro de console.
  - `/login` carregou sem erro de console.
  - viewport mobile `390x844` sem overflow horizontal em `/login` e `/visual-mock`.
- Validacao visual por browser interno ficou pendente nesta retomada: a automacao recusou navegar para `http://127.0.0.1:5174` por politica local da sessao. Nao tentar contornar; usar revisao manual no link local ou outra superficie aprovada pelo usuario.
- Checagem de seguranca no diff: busca por `supabase`, `functions.invoke`, `OPENAI`, `service_role`, `VITE_`, `migrations`, `auth.`, `.from(` nao encontrou alteracoes relevantes no diff.

**Observacoes de teste/revisao:**
- O link LAN funcionou quando o celular estava no mesmo Wi-Fi:
  `http://192.168.1.18:5174/visual-mock`
- No 5G, `192.168.1.18` nao funciona porque e IP privado de rede local. Para testar no 5G, usar uma destas opcoes:
  1. voltar o celular para o mesmo Wi-Fi;
  2. usar tunnel temporario (Cloudflare/ngrok) com aprovacao explicita;
  3. fazer push da branch e usar Preview Vercel, sem merge em `main`.
- Preferencia de seguranca: Wi-Fi local para revisao rapida; Preview Vercel para revisao fora da rede; evitar tunnel salvo necessidade.

**QA visual concluido antes de merge/publicacao:**
- Usuario revisou visualmente durante a execucao usando o app local/LAN e aprovou a migracao Ember.
- Ajuste final solicitado no bloco de cardio do Treino foi aplicado e validado tecnicamente.
- Rotas prioritarias desta revisao:
  - `/visual-mock` como referencia visual Ember.
  - `/treino` autenticado no app real.
  - `/diario` autenticado no app real.
  - `/corpo` autenticado no app real.
  - `/mais` autenticado no app real.
  - Coach/IA aberto em qualquer aba autenticada.
  - Modais/fluxos de treino: abrir exercicio, editar reps/carga, adicionar serie, abrir timer, abrir cardio, abrir ExerciseSelector, criar exercicio custom, editar template, abrir historico, abrir progressao e abrir guia de volume.
  - Fluxos de diario: abrir FoodDrawer, buscar alimento, abrir porcao, adicionar alimento, criar/editar/excluir alimento custom, abrir historico, registrar agua, abrir Coach para descrever alimento e revisar foto.
  - Fluxos de IA/Coach: abrir chat, conferir estado vazio, chips, enviar texto, loading, erro, abrir opcoes de foto/galeria, selecionar foto, conferir bolha de foto e abrir review.
  - Fluxos de corpo/mais: salvar medicao, abrir evolucao corporal, abrir Perfil/Check-in, abrir calculadora, migracao e export/backup.
- Viewports prioritarios:
  - Mobile real no Wi-Fi.
  - Mobile comum ~390x844.
  - Desktop/desktop estreito se possivel.
- Verificar especificamente:
  - Texto de exercicio longo nao cortando de forma ruim.
  - Inputs de reps/carga tocaveis e sem zoom indevido.
  - FAB Coach nao cobrindo acoes de treino.
  - Sheets respeitando safe-area e scroll.
  - Gradiente usado com moderacao.
  - Nenhuma tela de treino parecendo ainda no tema antigo roxo/azul.
- Observacao: Codex nao conseguiu fazer QA visual automatizado local via browser interno porque a automacao recusou `http://127.0.0.1:5174` por politica local da sessao. A revisao visual desta fase foi feita manualmente pelo usuario.

**Importante para a proxima sessao:**
- Se a branch ainda nao tiver sido mergeada/publicada, continuar exatamente de `feature-ember-design-system`.
- Nao mexer em hooks, Supabase, Edge Functions, IA, migrations, auth ou regras de calculo, salvo se houver bug real independente da migracao visual.
- Antes de implementar, rodar:
  `git status --short --branch`
  `npm run build`
- Se for testar no celular via LAN:
  `C:\Program Files\nodejs\npm.cmd run dev -- --host 0.0.0.0 --port 5174`
- Se `npm run test` falhar no PowerShell por execution policy, usar:
  `C:\Program Files\nodejs\npm.cmd run test`
- Se Vitest falhar por sandbox ao ler `vite.config.ts`, rodar o mesmo comando com permissao elevada.
- Proxima fatia recomendada: depois de confirmar commit/merge/publicacao da branch Ember, abrir branch separada para iconografia/ícones consistentes.
- QA visual Ember foi aprovado pelo usuario em 2026-07-09; reabrir apenas se aparecer bug visual real pós-publicação.

**Prompt recomendado para a proxima sessao Ember:**
> A spec `memory/spec-visual-ember-design-system.md` foi concluida e aprovada em 2026-07-09 na branch `feature-ember-design-system`. Se ainda nao foi feito, finalizar commit/push/merge da branch Ember sem incluir arquivos soltos fora do escopo; depois abrir nova branch para iconografia/ícones. Nao reabrir hooks, Supabase, Edge Functions, auth, migrations, IA, prompts ou regras de calculo salvo bug real.

**Prompt atualizado recomendado para a proxima sessao Ember:**
> Verificar se `feature-ember-design-system` ja foi mergeada/publicada. Se sim, criar branch pos-Ember apenas para iconografia. Se nao, concluir a operacao de git da branch Ember.

## Metodologia de port (destilada da Sessão 2C)
Ver detalhes em `.claude/commands/port.md`. Resumo:
1. Ler `referência.index.html` nas linhas exatas antes de escrever
2. Copiar CSS inline com valores exatos (não inventar)
3. Estado único no pai — hooks de dados nunca duplicados em filhos
4. Optimistic UI — `setDiary(next)` → `.upsert().then()` sem await bloqueante
5. Bottom sheets: `background: linear-gradient(180deg, #1a2035, #121828)`

## Padrões arquiteturais confirmados
- **Estado de diary:** `useDiary()` instanciado só no componente de página; callbacks descem via props
- **Fluxo de adição de alimento:** `DiarioPage(useDiary) → FoodDrawer(onAddFood prop) → FoodPortionModal(onAddFood prop)`
- **Accordion:** `openMealId` no pai — um abre, o anterior fecha
- **Chamadas Supabase:** NUNCA em componentes — sempre via hooks
- **TypeScript:** NUNCA `any` — usar tipos específicos

## Variáveis CSS importantes (já em src/index.css)
```
--pColor: #f87171  (proteína — vermelho)
--cColor: #fbbf24  (carbo — amarelo)
--gColor: #34d399  (gordura — verde)
--accent: #7c5cff  (roxo principal)
--accent2: #a78bfa (roxo claro)
--bg: #0a0e18      (fundo escuro)
--surface/2/3: rgba(255,255,255,.04/.07/.10)
```
Ambient glow já adicionado em `body::before/::after`.

## Estado atual das fases
- Fase 0: CONCLUÍDA
- Fase 1: CONCLUÍDA (auth email/senha + admin panel)
- Fase 2: CONCLUÍDA (2026-03-08) — Sessões 2A–2E completas
- Fase 3: CONCLUÍDA (2026-03-09) — Sessões 3A–3E completas
- Fase 4: CONCLUÍDA (2026-03-09) — Sessões 4A–4E completas
- Fase 5: CONCLUÍDA (2026-03-14) — import/export completo validado com dados reais
- Fase 6A: CONCLUÍDA (2026-03-15) — PWA base + Fix 404 SPA (v0.25.0)
- Fase 6B: EM ANDAMENTO — ITENs 1–9 concluídos; faltam ITEM 10 (toggle Free/Assinante) e ITEM 11 (lentidão)
- Fase 7A: CONCLUÍDA (2026-03-18) — Edge Function ai-chat + chat UI (FAB + AiChatModal) — v0.34.0
- Fase 7B: CONCLUÍDA (v0.47.0 — 2026-03-23) — log de alimentos via IA completo; IA decide intenção via JSON estruturado; macros custom via TACO/IBGE

## Itens 6B concluídos
- ITEM 1 — Error Boundary (v0.27.0)
- ITEM 2 — Onboarding automático (v0.26.0)
- ITEM 3 — SW Update Toast (v0.27.0)
- ITEM 4 — Code Splitting (v0.27.0)
- ITEM 5 — Testes Vitest: 38 testes (v0.28.0)
- ITEM 6 — CI/CD GitHub Actions (v0.28.2)
- ITEM 9 — OG Tags (v0.28.1)
- ITEM 7 — Defensividade dos hooks: sanitizeSettings, sanitizeExercicio, safeMeals (v0.29.0)
- ITEM 8 — Loading states / Skeleton: Skeleton.tsx, sem spinners de tela inteira (v0.29.0)
- FIX — custom_foods: useCustomFoods.ts + integração FoodDrawer/CustomFoodModal (v0.29.0)

## Padrões adicionados na Fase 7A (v0.34.0)
- **useAiChat:** `src/hooks/useAiChat.ts` — `messages[]`, `sendMessage(text)`, `loading`, `error`, `reset()`; chama via `supabase.functions.invoke('ai-chat')` com JWT da sessão
- **AiChatModal:** `src/components/AiChatModal.tsx` — z-index 340/341; bottom sheet gradiente padrão; balões usuário (direita, roxo) / coach (esquerda, surface); chips de ação rápida no estado vazio; loading 3 dots animados
- **FAB 🤖:** montado no AppLayout (fora do `<main>`), z-index 200, `bottom: 76` (acima da Nav)
- **Edge Function ai-chat:** busca diary + workouts + body_measurements + checkins (30 dias) + user_settings; monta system prompt com protocolos RP; chama gpt-4o-mini max_tokens 1000; retorna `{ reply: string }`
- **OPENAI_API_KEY:** configurada apenas em Supabase Vault (secrets) — NUNCA prefixo VITE_, NUNCA em src/
- **Deploy Edge Function:** ver `memory/supabase-edge-functions-deploy.md` — inclui: comando obrigatório `--no-verify-jwt`, como obter JWT para curl, 3 curls de verificação, rollback passo a passo, sintomas comuns

## Padrões adicionados na Fase 7B (v0.42.0 — parcial)
- **AiLogConfirmModal:** `src/components/AiLogConfirmModal.tsx` — z-index 348/350; lista de `PendingLogItem` com input de gramas por item; totalizador P/C/G/kcal recalculado em tempo real; dropdown de refeição obrigatório se não detectado no texto
- **PendingLogItem:** `{ foodId, nome, grams, source, pPer100, cPer100, gPer100, kcalPer100 }` — macros armazenados por 100g para permitir recalcular ao editar gramas
- **Detecção de intenção (frontend):** `hasLogIntent(text)` em `useAiChat.ts` — palavras-chave `comi/almocei/jantei/...`; intercepta ANTES de chamar a Edge Function; sem custo de tokens
- **parse-food real (7B-2+7B-3):** `action:'parse-food'` na Edge Function; `toLogItem()` em `useAiChat.ts` converte response; `source:'db'` → macros do `buildFoodLookup()` local; `source:'custom'` → macros por 100g da IA
- **addFoodsToDiary:** função standalone exportada de `useDiary.ts` — lê estado atual do banco, concatena entries, persiste; evita race condition de ter dois `useDiary` instanciados (AppLayout + DiarioPage)
- **NUNCA instanciar useDiary no AppLayout** para escritas do chat — usar sempre `addFoodsToDiary(userId, date, meal, entries)` diretamente
- **Confirmação no chat:** ao confirmar o modal, o coach exibe mensagem no histórico listando os itens com gramas (não toast flutuante — overlapping bug)
- **getFoodIndex():** `src/data/foodDb.ts` — gera string compacta `"Categoria: id(nome/Xg), ..."` para ser enviada à Edge Function na 7B-2 (~200 tokens)

## Padrões adicionados na Sessão 7B-1 (v0.43.0)
- **useCustomFoods CRUD completo:** `saveCustomFood()` retorna `FoodItem` com id real; `findCustomFood(nome)` dedup por nome case-insensitive; `updateCustomFood(id, food)` e `deleteCustomFood(id)` — instanciar direto no componente, sem prop chain
- **Custom food salvo por 100g:** sempre `porcaoG: 100` + macros por 100g no cadastro; porção editada fica no `FoodEntry` do diário
- **Dedup antes de criar:** `findCustomFood(nome)` antes de `saveCustomFood()` — evita duplicatas ao confirmar mesmo log duas vezes
- **Mock fixo para validar fluxo:** `mockParseFood()` hardcoded (1 db + 1 custom); extração por palavras é frágil — substituir diretamente pela Edge Function na 7B-2
- **AiLogConfirmModal itens custom:** badge ✨ Novo + P/C/G editáveis + kcal automático `p×4+c×4+g×9`
- **CustomFoodModal modo edição:** `initialValues?: Omit<FoodItem, 'id'>` — reutilizado no FoodDrawer para editar
- **FoodDrawer CRUD:** botões ✏️/🗑️ só em `food.id.startsWith('custom_')`; confirmação antes de excluir

## Fase 7 — CONCLUÍDA (2026-03-24)
- **7C foto para macros (v0.48.0):** `imageUtils.ts` (resize canvas), `PhotoReviewSheet.tsx` (review com ⚠️ + alternativas + checklist ingredientes ocultos), `sendPhotoToAi()` em `useAiChat.ts`, bloco `analyze-photo` isolado na Edge Function (gpt-4o-mini Vision, detail:low)
- **7C refinamentos (v0.49.0):** alimentos extras estimam macros via `estimateFoodMacros()` → badge ⏳ + preenchimento automático; flash Android revertido (ver bug documentado)
- **7C UX polish (v0.50.0):** pool de 12 chips sorteados (3/abertura), chips de registro preenchem input, bolha de foto com miniatura + barra de progresso, bolha "🔍 Identificando alimentos...", scroll automático ao iniciar upload
- **⚠️ Em observação:** acurácia e estimativa de porção precisam de validação com uso real
- **Tag estável:** `v0.48.0-ai-chat-stable`

## Bug flash Android galeria (AiChatModal) — EM ABERTO
**Status:** sem solução — todas as tentativas pioraram ou não resolveram.
**O que NÃO funciona (não tentar de novo):**
- `if (!open && !photoLoading) return null` → levemente melhor, não elimina
- `display:none` no backdrop + sheet quando `!open` → piorou
- Remover backdrop opaco do PhotoReviewSheet + animação slideUp → piorou mais
- `visibilitychange` guard com `pendingPhotoResultRef` → piorou (testado v0.49.0, revertido)
**Melhor estado conhecido:** v0.48.1 (commit dd3cef4) — menor piscar sem fix ativo.
**Causa raiz:** WebView Android dispara `visibilitychange` hidden→visible ao retornar da galeria, causando re-renders durante o resume. Precisa de abordagem diferente — possivelmente nativa (capacitor/plugin) ou aceitar como limitação do WebView.

## Próximo passo
Fase 8 (Freemium/Stripe) — ou pendências 6B ainda em aberto (ver abaixo)

## Padrões adicionados na Sessão 6B (v0.29.0)
- **useCustomFoods:** `src/hooks/useCustomFoods.ts` — CRUD tabela `custom_foods`; `saveCustomFood()` faz INSERT e atualiza estado local
- **Skeleton.tsx:** `src/components/Skeleton.tsx` — `animate-pulse`, props `width/height/borderRadius/style`
- **sanitizeSettings(raw):** valida shape JSONB antes de setar estado; fallbacks numéricos; goal inválido → `'maintain'`
- **sanitizeExercicio(ex):** descarta exercícios com `exercicioId` ausente/inválido ao carregar workout do Supabase
- **safeMeals pattern:** ao carregar diary, cada refeição é guardada com `Array.isArray()` antes de usar
- **Loading sem spinner:** nunca usar `if (loading) return <spinner tela inteira>` — renderizar página com skeletons inline nos cards

## Padrões adicionados na Sessão 2E
- **dateStore (Zustand):** `src/store/dateStore.ts` — selectedDate global, goToPrev/goToNext/goToToday/isToday
- **DateNavBar:** header global no AppLayout (fora do `<main>`); nome da página (esq) + [hoje] + [‹ data ›] (dir)
- **useDiary(date?):** aceita date como parâmetro — default todayISO(); recarrega ao mudar data
- **Banner roxo:** aparece em todas as abas quando selectedDate != hoje

## Padrões adicionados na Sessão 3A
- **exerciseDb.ts:** `src/data/exerciseDb.ts` — EXERCISE_DB, EX_SECONDARY, MUSCLE_LANDMARKS, CARDIO_TYPES, DEFAULT_TEMPLATES, helper exById()
- **useWorkout(date?):** `src/hooks/useWorkout.ts` — mesmo padrão do useDiary; estado local + persist no Supabase; kcalPerSet(); sync kcalTreino no diary ao salvar
- **workout_templates:** Opção A (1 linha por usuário, array JSONB) — mantém DEFAULT_TEMPLATES localmente até primeiro saveTemplates()
- **kcalPerSet(reps, carga):** `Math.max(5, Math.min(14, r * 0.5 + carga * 0.03))` — fiel ao original L6127
- **SQL 004:** tabelas workouts + workout_templates, RLS, trigger com SECURITY DEFINER + SET search_path = ''

## Padrões adicionados na Sessão 3B
- **ExerciseSelector:** `src/components/ExerciseSelector.tsx` — bottom sheet gradiente, abas por grupo, modos "add"/"swap"; aba "⭐ Meus" pendente (Sessão 3B+)
- **set-table inputs:** usar `className="set-input"` (não style inline) para ter `:focus` border roxo + `font-variant-numeric: tabular-nums`
- **EX_SECONDARY:** mapeado por `exercicioId` (não por grupo) — sempre chamar `getSecondary(ex.exercicioId)`
- **addExercise:** inicia com 3 séries vazias (fiel ao original L6531)
- **prev-ref:** carregado lazy ao abrir accordion via `getLastWorkoutForExercise`, cache em `prevData` Record local na página
- **check-port:** nova skill — executar após /port, antes de /review

## Padrões adicionados na Sessão 3B+
- **useCustomExercises:** `src/hooks/useCustomExercises.ts` — CRUD Supabase; tabela `custom_exercises` (005)
- **CustomExerciseModal:** `src/components/CustomExerciseModal.tsx` — z-index 331 (acima do ExerciseSelector 329)
- **ExerciseSelector:** aba "⭐ Meus exercícios" + rename inline + delete + prop `forceGroup`
- **Fluxo pós-criação (original L7982–7984):** CustomExModal por cima do ExerciseSelector (não fecha o seletor); ao salvar → `setExSelForceGroup('⭐ Meus exercícios')` + `setExSelOpen(true)`
- **ATENÇÃO SCHEMA:** tabelas `workout_templates` e `custom_exercises` foram criadas com coluna `data` (JSONB) em vez das colunas corretas em sessões anteriores — corrigidas com RENAME + DROP/RECREATE. SQL files corretos: 004 e 005.

## Padrões adicionados na Sessão 3C
- **Timer:** estado local com `useRef` para intervalId (não persiste no Supabase) — cleanup no `useEffect` retorno
- **Cardio:** `addCardio/updateCardio/removeCardio` expostos pelo `useWorkout` — consumidos diretamente na TreinoPage
- **setNota:** exposto pelo `useWorkout` — input controlado conectado diretamente
- **TIMER_PRESETS** fixo `[30,60,90,120,180]` — long-press editável planejado para Fase 6

## Padrões adicionados na Sessão 3D
- **TemplateEditorModal:** `src/components/TemplateEditorModal.tsx` — z-index 320/321 (abaixo do ExerciseSelector)
- **TMPL_COLORS:** `['#f87171','#60a5fa','#34d399','#fbbf24','#a78bfa','#fb923c','#f472b6','#22d3ee']` — fiel ao original L7748
- **swapExercise(index, newId):** troca exercicioId in-place mantendo séries — corrige TODO da Sessão 3B
- **applyTemplate(tmpl):** carrega exercícios + cardio do template no estado do dia — fiel ao original L6257–6276
- **confirm() antes de applyTemplate:** quando há séries preenchidas — fiel ao original L6260–6263
- **Delete two-tap no TemplateEditorModal:** estado `deleteConfirm` local com `setTimeout` 3s auto-reset — fiel ao original L8034–8066
- **Z-index stack:** TemplateEditorModal (320/321) < ExerciseSelector (328/329) < CustomExerciseModal (330/331)

## Padrões adicionados na Sessão 4A
- **useBody:** `src/hooks/useBody.ts` — CRUD body_measurements; mesmo padrão useDiary/useWorkout
- **CorpoPage:** 3 accordions (inputs dia, dobras JP7, histórico 14 dias) — fiel ao original L2526-2602
- **Migration 008:** body_measurements com UNIQUE CONSTRAINT (user_id, date) e SEM trigger updated_at

## Padrões adicionados na Sessão 4B
- **CSS estrutural:** `index.css` agora tem ~390 linhas — `.btn`, `.card`, `.accordion`, `.kpi-grid`, `.form-grid`, `.form-row`, `.grid3`, `.hint`, `.calc-wizard`, `.wz-*` portados do original. Novas páginas usam essas classes diretamente.
- **MaisPage pattern:** `useSettings()` instanciado uma vez na página; `CalcWizardModal` recebe `initialData` e `onSave` via props — nunca instancia `useSettings` internamente.
- **useDiary fix defensivo:** ao carregar do Supabase: `{ ...EMPTY_DIARY, ...raw, totals: raw.totals ?? recalcTotals(raw.meals) }` — protege contra dados antigos sem campo `totals`.
- **kpi-grid correto:** usar `.kpi > .kpi-label + .kpi-value > .num + .den` — nunca inventar classes `kpi-cell`/`kpi-val`.

