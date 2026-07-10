# Spec: Migração Visual Ember Design System

**Status:** concluída e aprovada em 2026-07-09 — Fase 0 + Fase 1 inicial, Fase 2 global, Fase 3 Treino, Fase 4 Diario/IA de alimentos, Fase 5 Home/habitos, Fase 6 Corpo/Mais, Fase 7 Login/Admin/AppMessageModal e Fase 8 IA/Coach concluídas; QA visual manual feito pelo usuário durante a execução; ajustes finais aplicados em `InstallPrompt`, resíduos visuais globais, `VisualMockPage` e bloco de cardio do Treino; pronta para commit, push e merge/publicação.
**Decisão visual:** adotar a direção `Ember Training` como base geral e a variação `Ember Ritual Home` para a Fase 5 (`HomePage`): estrutura inspirada no Aurora, acabamento técnico Ember
**Data da decisão:** 2026-07-09  
**Branch de trabalho sugerida:** `feature/ember-design-system`  
**Branch local em uso:** `feature-ember-design-system` (fallback porque o ambiente nao conseguiu criar branch com barra)
**Regra de merge:** revisão visual completa, build limpo e validação mobile/desktop concluídos; merge em `main` liberado após commit da branch.
**Decisão pós-branch:** depois de fechar/mergear esta branch, abrir uma branch separada para substituir emojis por ícones bonitos/consistentes. Não misturar iconografia futura com esta migração Ember.

---

## 1. Objetivo

Migrar o Kcalix para uma identidade visual mais premium, técnica, objetiva e orientada a performance pessoal, usando a direção **Ember** como base.

A mudança deve preservar:

- Arquitetura de abas atual.
- Fluxos funcionais atuais.
- Dados, hooks, Supabase, cálculos e regras de negócio.
- UX objetiva para treino, diário, corpo e coach.

A mudança deve alterar:

- Tokens visuais globais.
- Tipografia.
- Paleta.
- Cards, superfícies, botões, inputs, tabs, bottom sheets e modais.
- Hierarquia visual das telas.
- Tratamento do Coach/FAB.
- Layout de Treino, principalmente área de exercício atual, carga, reps e descanso.
- Apresentação de métricas e gráficos.

---

## 2. Direção Visual Escolhida: Ember

### 2.1 Princípios

1. **Performance pessoal**
   - O app deve parecer uma ferramenta de uso real em rotina de treino/nutrição, não uma landing page.
   - Deve suportar uso rápido, repetitivo e técnico.

2. **Cockpit funcional**
   - Home deve dar leitura executiva, não despejar todos os dados.
   - Treino deve priorizar exercício atual, carga, reps, descanso e histórico imediato.
   - Diário deve priorizar lançamento rápido.
   - Corpo deve priorizar tendência, não excesso de cards.

3. **Premium discreto**
   - Visual escuro, limpo, com contraste alto.
   - Laranja/magenta como energia e ação.
   - Roxo reduzido como base/identidade, não como cor dominante.
   - Evitar excesso de glow, textura, emojis e gradientes gratuitos.

4. **IA como assistente discreto**
   - Coach deve existir sempre, mas não dominar a interface.
   - Evitar mascote/robô clichê.
   - Usar linguagem visual de assistente premium: discreto, contextual, acessível.

---

## 3. Referência Atual

### 3.1 Mock aprovado como base

Arquivos atuais:

- `src/pages/VisualMockPage.tsx`
- `src/pages/VisualMockPage.css`

Direção base:

- `Ember Training`
- Paleta no mock:
  - `#6d5dfc` violeta/base
  - `#ff5c35` laranja/ação
  - `#ff2f7d` magenta/destaque
  - `#ffd166` amarelo/energia/alerta

Fontes no mock:

- Títulos: `Sora`
- Texto: `Inter`
- Dados: `IBM Plex Mono`

### 3.2 Observações do feedback

- O usuário escolheu Ember como direção principal.
- Aurora foi útil para paleta e ousadia, mas não deve virar base do app real.
- Textura poluída foi rejeitada.
- O app real deve ter visual limpo, técnico e com contraste maior.
- Treino é o fluxo mais usado e deve guiar a migração.
- Diário deve permitir lançamento ultra rápido.
- Home deve ser funcional, com leitura de hábitos, níveis, evolução e insights.
- Coach deve continuar como balão/FAB discreto.

---

## 4. Escopo

### 4.1 Dentro do escopo

Migrar visualmente:

- `src/index.css`
- `src/App.tsx`
- `src/components/Nav.tsx`
- `src/components/DateNavBar.tsx`
- `src/pages/HomePage.tsx`
- `src/pages/DiarioPage.tsx`
- `src/pages/TreinoPage.tsx`
- `src/pages/CorpoPage.tsx`
- `src/pages/MaisPage.tsx`
- `src/pages/LoginPage.tsx`
- `src/pages/SetPasswordPage.tsx`
- `src/pages/AdminPage.tsx` somente se não atrasar o core; caso contrário, aplicar tokens globais e deixar refinamento para fase posterior.

Migrar componentes compartilhados e modais:

- `AiChatModal.tsx`
- `AiLogConfirmModal.tsx`
- `PhotoReviewSheet.tsx`
- `FoodDrawer.tsx`
- `FoodPortionModal.tsx`
- `CustomFoodModal.tsx`
- `ExerciseSelector.tsx`
- `CustomExerciseModal.tsx`
- `TemplateEditorModal.tsx`
- `TemplateHistoryModal.tsx`
- `ExerciseProgressionModal.tsx`
- `CoachGuideModal.tsx`
- `CalcWizardModal.tsx`
- `WeeklyKcalModal.tsx`
- `DiaryHistoryModal.tsx`
- `BodyEvolutionModal.tsx`
- `ProfileCheckinModal.tsx`
- `HabitTracker.tsx`
- `HabitHistoryModal.tsx`
- `MigrateModal.tsx`
- `AppMessageModal.tsx`
- `InstallPrompt.tsx`
- `UpdateToast.tsx`
- `Skeleton.tsx`

### 4.2 Fora do escopo inicial

- Alterar banco de dados.
- Alterar hooks de dados.
- Alterar regras de cálculo.
- Refatorar arquitetura inteira.
- Reescrever fluxos de autenticação.
- Remover funcionalidades.
- Trocar nome, logo ou posicionamento do produto.
- Mexer em migrações Supabase.

---

## 5. Estratégia de Branch

### 5.1 Criar branch

Na próxima sessão:

```bash
git checkout main
git pull origin main
git checkout -b feature/ember-design-system
```

### 5.2 Política de commits

Commits pequenos por fase:

1. `Add Ember design tokens`
2. `Refactor global components to Ember style`
3. `Apply Ember style to core pages`
4. `Refine training page layout`
5. `Update modals and drawers for Ember style`
6. `Visual QA fixes for Ember migration`

### 5.3 Merge

Só fazer merge quando:

- Build passa.
- Testes passam.
- Visual revisado no celular e desktop.
- Fluxos principais testados.
- Usuário aprova screenshots/URL de preview.

Preferência:

- Abrir PR ou manter branch deployada por preview.
- Só mergear em `main` no final.

---

## 6. Tokens Ember Propostos

### 6.1 Fonte

Preferência inicial:

```css
--font-title: "Sora", ui-sans-serif, system-ui, -apple-system, sans-serif;
--font-body: "Inter", ui-sans-serif, system-ui, -apple-system, sans-serif;
--font-data: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
```

Aplicação:

- `Sora`: títulos de página, cards principais, seções.
- `Inter`: corpo, labels, botões, inputs.
- `IBM Plex Mono`: números, carga/reps, kcal, macros, timers, datas curtas, indicadores técnicos.

Decisão pendente:

- Definir se Google Fonts será importado por CSS ou se as fontes serão auto-hospedadas.
- Para produção, preferir auto-hospedar ou usar fallback se performance/cache forem problema.

### 6.2 Paleta base

```css
:root {
  --bg: #09090f;
  --bg-elevated: #0f1118;
  --surface: #10121a;
  --surface2: #151722;
  --surface3: #1b1e2b;

  --text: #f8f6f2;
  --text2: rgba(248,246,242,.72);
  --text3: rgba(248,246,242,.46);

  --line: rgba(255,255,255,.16);
  --line-strong: rgba(255,255,255,.24);

  --accent: #6d5dfc;
  --accent2: #9b8cff;
  --ember: #ff5c35;
  --magenta: #ff2f7d;
  --energy: #ffd166;

  --good: #21d4b4;
  --warn: #ffd166;
  --bad: #ff5f73;

  --pColor: #ff6b7a;
  --cColor: #ffd166;
  --gColor: #21d4b4;

  --radius: 8px;
  --radius-sm: 8px;
  --radius-xs: 6px;
  --shadow: 0 18px 46px rgba(0,0,0,.34);
}
```

Notas:

- Reduzir roxo para base/identidade.
- Laranja/magenta entram em ações, gráficos e destaques.
- Evitar UI dominada por gradientes.
- Cards devem ser escuros e sólidos, com borda e contraste; não translucidez excessiva.

### 6.3 Gradientes permitidos

Usar com moderação:

```css
--gradient-action: linear-gradient(135deg, var(--ember), var(--magenta));
--gradient-data: linear-gradient(90deg, var(--ember), var(--magenta), var(--good));
--gradient-panel: linear-gradient(145deg, #10121a, #0c0e14);
```

Usar em:

- Botão primário.
- FAB Coach.
- Barra de progresso principal.
- Destaques pequenos.

Não usar em:

- Todo card.
- Todo header.
- Grandes áreas de texto.

---

## 7. Sistema de Componentes

### 7.1 Botões

Classes atuais:

- `.btn`
- `.btn.primary`
- `.btn.ghost`
- `.btn.sm`
- `.btn.icon-btn`
- `.btn.danger-ghost`

Migração:

- Reduzir radius de `12px/16px` para `8px`.
- `primary`: `--gradient-action`.
- `ghost`: fundo transparente + borda mais visível.
- `icon-btn`: quadrado arredondado ou círculo somente quando ação for realmente floating.
- Estados:
  - `:active`: escala sutil.
  - `:focus-visible`: outline com `--ember`.
  - `disabled`: opacidade e sem pointer.

### 7.2 Cards

Classes atuais:

- `.card`
- `.card-header`
- `.card-body`

Migração:

- Fundo sólido `--surface`.
- Borda `--line`.
- Radius `8px`.
- Sombra menor e mais técnica.
- Header com hierarquia clara: título + metadado técnico.
- Evitar nested cards sempre que possível.

### 7.3 Inputs

Classes atuais:

- `.form-row`
- `.set-input`
- Inputs inline em várias páginas/modais.

Migração:

- Fundo `--surface2`.
- Borda `--line`.
- Focus: `border-color: var(--ember)` + glow pequeno.
- Fonte de dados em inputs técnicos: `--font-data`.
- Inputs de treino devem ser mais grandes/tocáveis.

### 7.4 Bottom sheets e modais

Componentes afetados:

- `AiChatModal`
- `FoodDrawer`
- `FoodPortionModal`
- `PhotoReviewSheet`
- `AiLogConfirmModal`
- `ProfileCheckinModal`
- `TemplateEditorModal`
- `TemplateHistoryModal`
- `ExerciseSelector`
- `WeeklyKcalModal`
- `BodyEvolutionModal`
- `CalcWizardModal`

Migração:

- Sheet background: `#10121a` ou `--surface`.
- Header com grip e título.
- Radius top: `18px 18px 0 0` ou `16px`.
- Borda top `--line`.
- Botões de ação fixos no footer quando aplicável.
- Garantir safe-area.

### 7.5 Navegação

Arquivos:

- `Nav.tsx`
- `DateNavBar.tsx`

Migração:

- Nav inferior mais compacta e técnica.
- Ícones atuais inline SVG podem continuar na primeira fase.
- Ativo: `--ember` ou gradiente discreto.
- Inativo: `--text3`.
- DateNav:
  - Fundo `--bg`.
  - Pill de data com `--surface2`.
  - Botão hoje com `--ember`.

---

## 8. Layout Por Tela

### 8.1 AppLayout / FAB Coach

Arquivo:

- `src/App.tsx`

Mudanças:

- Trocar FAB roxo atual por Ember:
  - fundo `--gradient-action`
  - texto/ícone `AI`, não emoji robô
  - posição atual pode continuar
  - z-index atual pode continuar

Critérios:

- FAB não deve cobrir botão importante.
- Deve ficar acima da nav.
- Deve ser discreto, mas acessível em todas as abas.

### 8.2 HomePage

Arquivo:

- `src/pages/HomePage.tsx`

Objetivo:

- Home funcional e executiva, mas menos "dashboard" e mais central de decisão do dia.
- Responder rapidamente: `o que treinar hoje?`, `por que isso hoje?`, `quanto ainda posso comer?` e `o que falta fechar?`.
- Preservar o tracking diário de calorias/macros já existente como peça central da tela.

Prioridades:

1. Treino recomendado hoje.
2. Justificativa curta do treino recomendado.
3. Plano mínimo para dias corridos.
4. Calorias/macros do dia, com quantidades restantes acionáveis.
5. Hábitos em dropdown compacto, com bolinhas-resumo visíveis.
6. Alerta/insight discreto.
7. Pulso semanal de aderência.

Mudanças:

- Usar a estrutura aprovada no mock `Ember Ritual Home`: hierarquia Aurora, acabamento Ember.
- Topo da Home deve ser `Treino de hoje`, não um score abstrato.
- Card de treino deve ter CTA claro para abrir treino e não depender de emoji.
- Adicionar bloco `Por que hoje` com justificativa curta baseada em descanso/volume/rotina.
- Adicionar bloco `Plano mínimo` para orientar uma sessão curta sem sobrecarregar o usuário.
- Manter `Calorias hoje` com kcal consumidas/meta, barra, macros P/C/G e dica prática de quantidades restantes.
- A dica de quantidades restantes deve ser curta e acionável, por exemplo: `até 45P / 55C / 12G no jantar`.
- Hábitos devem ficar recolhidos em dropdown por padrão, com `3/5` e bolinhas-resumo no cabeçalho.
- O dropdown de hábitos pode preparar visualmente `Editar lista`, mas a customização real de hábitos só entra se o escopo técnico permitir sem mexer em schema.
- Pulso semanal de hábitos pode aparecer abaixo do dropdown, mas deve ser compacto.
- Alertas devem ser discretos e contextuais: proteína baixa, treino atrasado, cardio pendente, margem de carbo, sem alarmismo.
- Métricas numéricas usam `--font-data`; superfícies usam fundo sólido Ember.
- Evitar blocos grandes de texto, frases motivacionais genéricas, ranking, medalhas e gamificação pesada.

Direção de conteúdo aprovada:

- `Treino de hoje`: nome curto do treino/template, por exemplo `Push A`.
- `Por que hoje`: 1 linha técnica, por exemplo `último push há 4 dias`.
- `Plano mínimo`: alternativa curta, por exemplo `25 min: supino + desenvolvimento + tríceps`.
- `Calorias hoje`: manter tracking atual; adicionar interpretação prática de saldo.
- `Hábitos diários`: dropdown recolhido; mostrar só resumo na Home.
- `Alerta discreto`: 1 card pequeno, só quando houver algo útil a dizer.

Revisão responsiva de design:

- Títulos principais da Home devem ter no máximo 2 linhas em `360px`; se passarem disso, reduzir copy ou tamanho local.
- Evitar títulos longos como `Treinar peito, ombro e tríceps completo`; preferir `Push A` + subtítulo curto.
- Cards lado a lado (`Por que hoje` / `Plano mínimo`) devem virar 1 coluna abaixo de `380px` se houver quebra ruim.
- Descrições de cards compactos devem ter no máximo 90 caracteres ou 2 linhas; truncar visualmente só se houver alternativa de detalhe em modal/sheet.
- Botões devem manter altura mínima de 44px.
- Cabeçalho do dropdown de hábitos deve caber em uma linha: label, score, bolinhas e ação curta (`Editar` ou ícone).
- Textos numéricos não podem encolher a ponto de perder leitura; usar `font-variant-numeric: tabular-nums`.
- O primeiro viewport mobile deve mostrar pelo menos: treino recomendado, início do card de calorias e sinal de que há mais conteúdo abaixo.
- Nenhum texto deve sobrepor FAB, Nav inferior ou safe-area.

Não mudar:

- Hooks de dados.
- Supabase, Edge Functions, auth, migrations ou regras de cálculo.
- Abertura de modais.
- Tracking diário de calorias/macros já existente.

### 8.3 DiarioPage

Arquivo:

- `src/pages/DiarioPage.tsx`

Objetivo:

- Lançamento ultra rápido.
- Macros claros, sem aparência de celebração.

Prioridades:

1. Botão/ação de adicionar alimento.
2. Resumo de kcal/macros.
3. Refeições.
4. Água.
5. Histórico.

Mudanças:

- KPI cards mais compactos.
- Meal accordion com maior contraste.
- Quick buttons mais legíveis/tocáveis.
- Food entries com melhor separação.
- Water card integrado ao mesmo sistema.
- Evitar emoji como elemento principal.

### 8.4 TreinoPage

Arquivo:

- `src/pages/TreinoPage.tsx`

Objetivo:

- Tela mais importante da migração.
- Uso durante treino deve ser rápido, objetivo e com alta legibilidade.

Prioridade visual:

1. Exercício atual.
2. Carga.
3. Repetições.
4. Salvar série.
5. Descanso/timer.
6. Histórico/referência anterior.
7. Lista de exercícios.
8. Volume total.

Mudanças de layout recomendadas:

- Criar bloco superior "Treino ativo".
- Quando exercício estiver aberto:
  - nome do exercício em destaque.
  - entrada de carga/reps maior.
  - referência anterior visível.
  - botão de salvar/confirmar claro.
- Timer deve ser mais próximo do contexto de treino.
- Lista de exercícios deve ser compacta e técnica.
- Evitar cards muito altos para não atrapalhar uso na academia.

Arquivos/componentes relacionados:

- `TreinoPage.tsx`
- `ExerciseSelector.tsx`
- `TemplateEditorModal.tsx`
- `TemplateHistoryModal.tsx`
- `ExerciseProgressionModal.tsx`
- `CoachGuideModal.tsx`
- `CustomExerciseModal.tsx`

Critérios:

- Inputs não podem ficar menores que 44px de altura.
- Texto não pode quebrar de modo ruim em exercício com nome longo.
- Deve funcionar com teclado mobile.
- Deve funcionar com timer ativo.

### 8.5 CorpoPage

Arquivo:

- `src/pages/CorpoPage.tsx`

Objetivo:

- Mostrar tendência, medidas e evolução sem excesso.

Mudanças:

- Cards de composição com dados técnicos.
- Histórico e gráficos com paleta Ember.
- Inputs consistentes com o resto.
- BodyEvolutionModal deve seguir o novo sistema.

### 8.6 MaisPage

Arquivo:

- `src/pages/MaisPage.tsx`

Objetivo:

- Tela de configurações deve ficar mais organizada e técnica.

Mudanças:

- Accordions Ember.
- Form rows Ember.
- NutriBanner com menos verde/roxo e mais hierarquia.
- Botões de export/import/migração com estilo consistente.
- CalcWizardModal deve seguir tokens novos.

### 8.7 Login e SetPassword

Arquivos:

- `LoginPage.tsx`
- `SetPasswordPage.tsx`

Objetivo:

- Manter simples, premium e confiável.

Mudanças:

- Atualizar logo/card/input/botões.
- Evitar excesso de glow roxo.
- Usar Ember em CTA.

### 8.8 AdminPage

Arquivo:

- `AdminPage.tsx`

Observação:

- Não é prioridade de UX pessoal.
- Aplicar tokens globais já melhora parte da tela.
- Refinamento completo pode ser fase 2 da migração.

---

## 9. Refatoração Técnica Recomendada

### 9.1 Problema atual

O app tem muito `style={{ ... }}` inline, principalmente nas páginas e modais. Isso dificulta:

- Padronização visual.
- Revisão.
- Responsividade.
- Migração para tema Ember.

### 9.2 Abordagem pragmática

Não tentar refatorar tudo de uma vez.

Fase 1:

- Atualizar tokens globais.
- Atualizar classes globais existentes.
- Ajustar componentes estruturais.

Fase 2:

- Migrar páginas core.
- Extrair classes novas quando um padrão aparece 2+ vezes.

Fase 3:

- Migrar modais/drawers.
- Reduzir inline styles críticos.

Fase 4:

- Polimento visual e QA.

### 9.3 Classes novas sugeridas

Adicionar em `src/index.css`:

```css
.ember-page {}
.ember-section {}
.ember-card {}
.ember-card-header {}
.ember-metric {}
.ember-data {}
.ember-action {}
.ember-bottom-sheet {}
.ember-field {}
.ember-chip {}
.ember-fab {}
.ember-progress {}
.ember-list-row {}
```

Usar com parcimônia. Não criar design system paralelo excessivo se os padrões atuais forem suficientes.

---

## 10. Ordem de Implementação Recomendada

### Status atual — 2026-07-09

- Fase 0: concluida tecnicamente.
- Fase 1: concluida tecnicamente.
- Fase 2: concluida tecnicamente para estrutura global inicial (`App`, `Nav`, `DateNavBar`, `Skeleton`, `UpdateToast`, FAB Coach).
- Fase 3: concluida tecnicamente para treino e modais relacionados.
- Fase 4: concluida tecnicamente para Diario/IA de alimentos.
- Fase 5: concluida tecnicamente para Home/habitos/graficos semanais.
- Fase 6: concluida tecnicamente para Corpo e Mais.
- Fase 7: concluida tecnicamente para Login/Admin/AppMessageModal e limpeza visual final inicial.
- Fase 8: concluida tecnicamente para IA/Coach (`AiChatModal`) — somente visual, sem tocar Edge Functions/hooks.
- QA visual da Fase 3: pendente de revisao manual no mesmo Wi-Fi ou Preview Vercel aprovado; nao houve QA visual automatizado local porque a automacao recusou `http://127.0.0.1:5174`.

### Fase 0: Preparação

1. Criar branch `feature/ember-design-system`.
2. Rodar `npm run build` no estado inicial.
3. Tirar screenshots do app atual:
   - `/home`
   - `/diario`
   - `/treino`
   - `/corpo`
   - `/mais`
   - Coach aberto
   - FoodDrawer
   - ExerciseSelector
   - ProfileCheckinModal
4. Registrar screenshots como referência local ou anotações.

### Fase 1: Tokens globais

Arquivos:

- `src/index.css`
- `src/App.css` se ainda estiver afetando algo.

Tarefas:

- Atualizar tokens.
- Importar/definir fontes.
- Atualizar `.btn`, `.card`, `.accordion`, `.kpi`, `.form-row`, `.set-input`.
- Remover/reduzir ambient glow roxo antigo.
- Garantir que tela não fique monocromática.

Teste:

- Build.
- Abrir todas as rotas.
- Verificar se nada ficou ilegível.

### Fase 2: Estrutura global

Arquivos:

- `App.tsx`
- `Nav.tsx`
- `DateNavBar.tsx`
- `Skeleton.tsx`
- `UpdateToast.tsx`
- `InstallPrompt.tsx`

Tarefas:

- FAB Coach Ember.
- Bottom nav Ember.
- Date nav Ember.
- Loading/skeleton Ember.

### Fase 3: Treino

Arquivos:

- `TreinoPage.tsx`
- `ExerciseSelector.tsx`
- `ExerciseProgressionModal.tsx`
- `TemplateEditorModal.tsx`
- `TemplateHistoryModal.tsx`
- `CoachGuideModal.tsx`
- `CustomExerciseModal.tsx`

Tarefas:

- Aplicar layout de treino ativo.
- Melhorar inputs de carga/reps.
- Timer com tratamento Ember.
- Lista de exercícios compacta.
- Modais de exercício consistentes.

Esta fase deve ser tratada como a mais importante.

Status de execucao:

- Concluida tecnicamente em 2026-07-09.
- Arquivos migrados: `TreinoPage.tsx`, `ExerciseSelector.tsx`, `ExerciseProgressionModal.tsx`, `TemplateEditorModal.tsx`, `TemplateHistoryModal.tsx`, `CoachGuideModal.tsx`, `CustomExerciseModal.tsx`.
- Classes adicionadas em `src/index.css`: familia `training-*` para layout de treino, cards, tabela de series, inputs, panels, resumo, sheets, tabs e listas.
- Regras preservadas: hooks, Supabase, templates, timer, calculos de volume/kcal, fluxo de exercicio custom, historico e progressao.
- Validacoes tecnicas: build passou; Vitest passou 49 testes; lint escopado dos arquivos de treino passou.
- Pendente: QA visual manual em mobile real e desktop antes de merge.

### Fase 4: Diário e IA de alimentos

Arquivos:

- `DiarioPage.tsx`
- `FoodDrawer.tsx`
- `FoodPortionModal.tsx`
- `CustomFoodModal.tsx`
- `AiLogConfirmModal.tsx`
- `PhotoReviewSheet.tsx`

Tarefas:

- Lançamento rápido.
- Macros técnicos.
- Drawer Ember.
- Modal de porção claro e tocável.
- Confirmação de IA consistente.

Status de execucao:

- Concluida tecnicamente em 2026-07-09.
- Arquivos migrados: `DiarioPage.tsx`, `FoodDrawer.tsx`, `FoodPortionModal.tsx`, `CustomFoodModal.tsx`, `AiLogConfirmModal.tsx`, `PhotoReviewSheet.tsx`, `DiaryHistoryModal.tsx`.
- Classes adicionadas em `src/index.css`: familia `diary-*`, `food-*` e `ai-food-*` para KPIs, barras/macros, refeicoes, agua, drawers, modais, confirmacao IA, review de foto e historico do diario.
- Fontes: tokens globais `Sora`, `Inter` e `IBM Plex Mono` ja importados; Fase 4 usa `--font-data` para kcal, macros, gramas, porcoes e graficos/barras numericas.
- Graficos/barras: KPIs de macros, agua e historico do diario foram alinhados com Ember; roxo/azul antigo removido dos arquivos da Fase 4.
- Regras preservadas: `useDiary`, `useCustomFoods`, `useAiChat`, Supabase, Edge Functions, fluxo de foto, calculos de macros, agua e historico.
- Validacoes tecnicas: build passou; lint escopado da Fase 4 passou; `http://localhost:5173/diario` respondeu 200 OK.
- Testes Vitest: pendente nesta execucao, porque dentro do sandbox falhou ao ler `vite.config.ts` por `Access is denied` e a aprovacao para rodar fora do sandbox foi recusada por limite de uso.
- Pendente: QA visual manual autenticado em mobile/desktop, incluindo drawer de alimentos, porcao, alimento custom, confirmacao IA e review de foto.

### Fase 5: Home e hábitos

Arquivos:

- `HomePage.tsx`
- `HabitTracker.tsx`
- `HabitHistoryModal.tsx`
- `WeeklyKcalModal.tsx`
- `DiaryHistoryModal.tsx`

Decisão visual da Fase 5:

- Seguir `Ember Ritual Home`: estrutura aprovada no mock Aurora, com acabamento, tokens e contraste Ember.
- O mock de referência está em `src/pages/VisualMockPage.tsx`, aba `Home`, direção `Ember Ritual Home`.
- Não copiar o Aurora literalmente: manter superfícies sólidas, bordas limpas, radius 8px e uso moderado de gradiente.

Tarefas principais:

1. Reorganizar a Home como central de decisão do dia.
2. Colocar `Treino de hoje` como primeiro módulo visual.
3. Manter tracking diário de calorias/macros logo após o treino recomendado.
4. Adicionar dica curta de quantidades restantes para a próxima refeição ou jantar.
5. Recolher hábitos em dropdown/accordion compacto por padrão.
6. Manter bolinhas-resumo dos hábitos visíveis no cabeçalho do dropdown.
7. Atualizar pulso/semanal de hábitos e/ou gráfico semanal para Ember, sem poluir a primeira tela.
8. Adicionar alerta discreto contextual quando houver sinal útil.
9. Alinhar `HabitHistoryModal`, `WeeklyKcalModal` e `DiaryHistoryModal` ao mesmo sistema visual quando aparecerem no fluxo da Home.

Detalhamento dos módulos:

- `Treino de hoje`
  - Deve ser o primeiro módulo da Home.
  - Deve exibir nome curto do treino/template recomendado.
  - Deve ter CTA para abrir `/treino`.
  - Deve incluir um indicador de prontidão/adequação visual, mas sem virar score genérico dominante.
  - Fonte de dados em números; título curto com `--font-title`.

- `Por que hoje`
  - Card compacto.
  - Explica a recomendação em 1 frase curta.
  - Exemplos de lógica/copy aceitáveis: `último push há 4 dias`, `costas abaixo do volume semanal`, `pernas ainda em recuperação`.
  - Se a lógica real ainda não estiver pronta, usar heurística conservadora com dados já disponíveis ou esconder o módulo até haver sinal confiável.

- `Plano mínimo`
  - Card compacto ao lado de `Por que hoje` em telas largas.
  - Em mobile estreito pode quebrar para 1 coluna.
  - Deve orientar sessão curta: `25 min: exercício principal + secundário + finalizador`.
  - Não alterar templates, exercícios ou lógica de treino nesta fase.

- `Calorias hoje`
  - Preservar o conteúdo funcional já existente: kcal consumidas, meta, barra e macros.
  - Adicionar `runway` prático com quantidades restantes: proteína/carbo/gordura para a próxima refeição.
  - O texto deve ser curto: `até 45P / 55C / 12G no jantar`.
  - Se meta/macros estiverem ausentes, mostrar fallback limpo e não inventar recomendação.

- `Hábitos diários`
  - Substituir a grade aberta atual por dropdown/accordion recolhido.
  - Cabeçalho deve mostrar: label, score (`3/5`), bolinhas-resumo e ação curta de editar/histórico.
  - Ao expandir, mostrar a lista atual de hábitos do app (`Dieta`, `Log`, `Treino`, `Cardio`, `Medidas`) com estado do dia.
  - Customização real de hábitos fica fora do escopo se exigir schema/migration; nesta fase, apenas deixar o visual preparado com `Editar lista` se for seguro.

- `Pulso semanal`
  - Mostrar aderência semanal de forma compacta.
  - Pode usar bolinhas por dia/hábito ou barras compactas.
  - Não deve competir visualmente com o tracking de calorias.

- `Alerta discreto`
  - Deve aparecer somente quando houver mensagem útil.
  - Exemplos: `Proteína baixa para este horário`, `Treino pendente hoje`, `Cardio pode ficar para amanhã`, `Boa margem de carbo para jantar`.
  - Não usar tom alarmista.

Regras de responsividade obrigatórias:

- Validar `360x740`, `390x844`, `430x932` e desktop estreito.
- Títulos não podem cortar, sobrepor ou gerar quebras estranhas.
- Se `Treino de hoje` tiver nome longo, usar nome do template curto no título e mover detalhes para subtítulo.
- Cards de duas colunas quebram para uma coluna em telas estreitas.
- Descrições devem ter no máximo 2 linhas em cards compactos.
- O card `Calorias hoje` deve continuar legível quando a meta for 4 dígitos e macros tiverem 3 dígitos.
- O dropdown de hábitos deve caber em 1 linha no estado recolhido; se não couber, trocar `Editar lista` por `Editar`.
- O primeiro scroll da Home não deve parecer lotado: treino + calorias devem dominar; hábitos e alertas devem ficar leves.
- FAB do Coach e Nav inferior não podem cobrir CTA de treino ou ações de calorias.

Status de execucao:

- Concluida tecnicamente em 2026-07-09.
- Arquivos migrados: `src/pages/HomePage.tsx`, `src/components/HabitTracker.tsx`, `src/components/HabitHistoryModal.tsx`, `src/components/WeeklyKcalModal.tsx` e `src/index.css`.
- Home reorganizada como central de decisao do dia: `Treino de hoje`, card de inicio do treino, motivo, plano minimo, calorias/macros, habitos recolhidos, insight discreto, pulso semanal e snapshot de energia.
- Recomendacao de treino usa heuristica local conservadora com `DEFAULT_TEMPLATES` e historico ja carregado por `fetchAllWorkoutRows`; sem IA/backend novo e sem alterar hooks.
- `HabitTracker` agora abre recolhido por padrao e usa header compacto com score, bolinhas e acao `HIST`.
- `HabitHistoryModal` e `WeeklyKcalModal` receberam alinhamento visual Ember e ajustes para passar lint escopado.
- Apos revisao do usuario, a Home recebeu refinamento visual para ficar mais fiel ao mock `Ember Ritual Home`: hero maior, readiness quadrado com anel conic, card de calorias mais forte, pulso semanal em pilulas verticais e faixa `Coach insight`.
- Estado de encerramento da sessao: usuario considerou a Home boa para seguir; manter a direcao atual e nao retornar ao layout mais seco/dashboard.
- Regras preservadas: `useSettings`, `useDiary`, `useHabits`, Supabase, Edge Functions, auth, migrations e regras de calculo.
- Validacoes tecnicas: `npm run build` passou; lint escopado passou para `HomePage`, `HabitTracker`, `HabitHistoryModal` e `WeeklyKcalModal`; `npm run test` passou fora do sandbox: 2 arquivos, 49 testes.
- Validacao apos refinamento final: `npm run build` passou novamente; lint escopado da Fase 5 passou novamente.
- Observacao de teste: `npm run test` dentro do sandbox falhou ao carregar `vite.config.ts` por `Access is denied`; rodado fora do sandbox com aprovacao.
- Pendente: QA visual manual/mobile de Home, habitos recolhidos/expandidos, Historico de Habitos e modal semanal antes de merge/publicacao.

Fora do escopo desta fatia:

- Mudar schema de hábitos.
- Criar CRUD real de hábitos customizados se exigir banco.
- Alterar hooks, Supabase, Edge Functions, auth, migrations ou regras de cálculo.
- Implementar IA real para decidir treino se isso exigir backend novo.
- Reescrever o fluxo de treino.

Critérios de aceite:

- Home real segue a estrutura `Treino de hoje` → `Calorias hoje` → `Hábitos dropdown` → `Pulso/alertas`.
- Tracking diário de calorias/macros continua presente e funcional.
- Hábitos não aparecem como grade grande aberta por padrão.
- Textos cabem bem em mobile pequeno.
- Build passa.
- Lint escopado dos arquivos alterados passa quando possível.
- QA visual manual em mobile real ou viewport equivalente segue pendente antes de merge/publicacao.

### Fase 6: Corpo e Mais

Arquivos:

- `CorpoPage.tsx`
- `BodyEvolutionModal.tsx`
- `ProfileCheckinModal.tsx`
- `MaisPage.tsx`
- `CalcWizardModal.tsx`
- `MigrateModal.tsx`

Tarefas:

- Corpo com tendência e histórico.
- Check-in Ember.
- Calculadora e configurações mais limpas.

Status de execucao:

- Concluida tecnicamente em 2026-07-09.
- Arquivos migrados: `src/pages/CorpoPage.tsx`, `src/components/BodyEvolutionModal.tsx`, `src/components/ProfileCheckinModal.tsx`, `src/pages/MaisPage.tsx`, `src/components/CalcWizardModal.tsx`, `src/components/MigrateModal.tsx` e `src/index.css`.
- `CorpoPage` recebeu painel de tendencia com ultima leitura, metricas tecnicas de peso/cintura/BF, accordions Ember, inputs com `--font-data` e historico compacto.
- Refinamento final do painel de tendencia do Corpo: as caixas Peso/Cintura/BF foram compactadas para caber em mobile sem overflow; unidades nao aparecem quando o valor esta vazio; fallback de tendencia virou `sem base`.
- `BodyEvolutionModal` saiu do sheet azul antigo e passou para `mchart-*`, com tabs Ember, cores `--ember`/`--magenta`/`--good`, tooltip e resumo tecnico.
- `ProfileCheckinModal` foi alinhado ao sheet Ember, reduziu dependencia de emoji como sinal principal e recebeu ajustes de lint para pureza/microtask.
- `MaisPage` recebeu `more-*`, banner nutricional Ember, cards de configuracao mais tecnicos, paineis internos sem depender de card aninhado e labels menos decorativas.
- `MigrateModal` foi alinhado com `mg-*`/sheet Ember; preview usa badges tecnicos e barra de progresso `--gradient-action`.
- `CalcWizardModal` recebeu overrides Ember no CSS e ajuste de reset via microtask para passar lint escopado.
- Regras preservadas: `useBody`, `useSettings`, `useCheckins`, export/import, calculadoras, Supabase, auth, migrations, Edge Functions e regras de calculo.
- Validacoes tecnicas: `npm run build` passou; lint escopado da Fase 6 passou; `C:\Program Files\nodejs\npm.cmd run test` passou fora do sandbox com 2 arquivos e 49 testes.
- Validacao apos refinamento final do Corpo: lint de `src/pages/CorpoPage.tsx` passou e `npm run build` passou novamente.
- Observacao de teste: `npm run test` dentro do sandbox falhou ao carregar `vite.config.ts` por `Access is denied`; rodado fora do sandbox com permissao elevada.
- Pendente: QA visual manual/mobile de `/corpo`, `/mais`, `BodyEvolutionModal`, `ProfileCheckinModal`, `CalcWizardModal` e `MigrateModal` antes de merge/publicacao.

### Fase 7: Login/Admin e limpeza final

Arquivos:

- `LoginPage.tsx`
- `SetPasswordPage.tsx`
- `AdminPage.tsx`
- `AppMessageModal.tsx`

Tarefas:

- Alinhar visual geral.
- Reduzir inconsistências remanescentes.
- Remover classes antigas não usadas, se seguro.

Status de execucao:

- Concluida tecnicamente em 2026-07-09.
- Arquivos migrados: `src/pages/LoginPage.tsx`, `src/pages/SetPasswordPage.tsx`, `src/pages/AdminPage.tsx`, `src/components/AppMessageModal.tsx` e `src/index.css`.
- `LoginPage` e `SetPasswordPage` agora usam classes `auth-*` com superficie Ember, foco em `--ember`, logo com borda técnica e alertas/estados sem depender de emojis como sinal principal.
- `AdminPage` recebeu casca `admin-*`, header técnico, abas com `--gradient-action`, KPIs responsivos, badges de status técnicos (`ON`, `INV`, `PEN`, `OFF`) e redução de roxo antigo em controles de segmentação.
- `AppMessageModal` saiu do fundo azul/roxo antigo (`#1a2035`/`#121828`) e passou para `app-msg-*`, com card Ember, opções de survey em `--ember`/`--energy`, textarea e overlay consistentes.
- Regras preservadas: auth, convites, hooks de admin/broadcast, Supabase, Edge Functions, migrations, segmentação, enquetes e parser Markdown seguro.
- Validações técnicas: `npm run build` passou; lint escopado passou para `LoginPage`, `SetPasswordPage`, `AdminPage` e `AppMessageModal`; `C:\Program Files\nodejs\npm.cmd run test` passou fora do sandbox com 2 arquivos e 49 testes.
- Observacao de teste: `npm run test` dentro do sandbox falhou ao carregar `vite.config.ts` por `Access is denied`; rodado fora do sandbox com permissao elevada, conforme limitação já conhecida.
- Pendente: QA visual manual/mobile de `/login`, `/set-password`, `/kcx-studio` e modais de mensagem/enquete antes de merge/publicacao.

---

### Fase 8: IA/Coach

Arquivos:

- `AiChatModal.tsx`
- `src/index.css`

Objetivo:

- Fechar a ultima superficie visual que ainda estava no tema antigo roxo/azul.
- Alinhar o bottom sheet do Kcal Coach ao Ember sem alterar nenhuma regra de IA.

Tarefas:

- Remover do `AiChatModal` o sheet antigo `#1a2035`/`#121828`.
- Remover bolhas, avatar, chips e botoes roxos antigos (`#7c5cff`, `#6144e0`, `#a78bfa`, `rgba(124,92,255,...)`).
- Criar familia `ai-chat-*` no CSS global para overlay, sheet, header, marca AI, estado vazio, chips, bolhas, foto enviada, loading, erro e composer.
- Manter `AiLogConfirmModal` e `PhotoReviewSheet` como estavam, pois ja tinham sido migrados na Fase 4 para `ai-food-*`.

Fora do escopo obrigatorio:

- Nao alterar `useAiChat`.
- Nao alterar `supabase/functions/ai-chat`.
- Nao alterar prompts, actions, parsing, vision, `sendPhotoToAi`, `estimateFoodMacros` ou custo/tokens.
- Nao alterar `resizeImageToBase64`, `useDiary`, `useCustomFoods`, Edge Functions, auth, migrations ou regras de calculo.

Status de execucao:

- Concluida tecnicamente em 2026-07-09.
- Arquivos migrados: `src/components/AiChatModal.tsx` e `src/index.css`.
- `AiChatModal` passou a usar `ai-chat-overlay`, `ai-chat-sheet`, `ai-chat-header`, `ai-chat-mark`, `ai-chat-messages`, `ai-chat-bubble`, `ai-chat-photo-*`, `ai-chat-loading-bubble`, `ai-chat-composer` e controles relacionados.
- Marca do Coach dentro do sheet deixou o roxo antigo e manteve `🤖` com `--gradient-action`, após feedback do usuário de que `AI` ficou frio e sem sensação de presença.
- Bolha do usuario, bolha de foto, botao de camera ativo e botao enviar passaram para `--gradient-action`; loading usa `--energy`; superficies usam `var(--surface)`/`var(--gradient-panel)`.
- Busca por cores antigas em `AiChatModal.tsx` (`#1a2035`, `#121828`, `#7c5cff`, `#6144e0`, `#a78bfa`, `rgba(124,92,255...)`) nao encontrou matches.
- Regras preservadas: `useAiChat`, `sendPhotoToAi`, `pendingLog`, `AiLogConfirmModal`, `PhotoReviewSheet`, `useCustomFoods`, `onAddFoods`, Supabase, Edge Functions, auth, migrations, prompts e regras de calculo.
- Validacoes tecnicas: `npm run build` passou; lint escopado de `src/components/AiChatModal.tsx` passou; `C:\Program Files\nodejs\npm.cmd run test` passou fora do sandbox com 2 arquivos e 49 testes.
- Observacao de teste: `npm run test` dentro do sandbox falhou ao carregar `vite.config.ts` por `Access is denied`; rodado fora do sandbox com permissao elevada, conforme limitacao ja conhecida.
- Pendente: QA visual manual/mobile do Coach aberto, estado vazio, chips, envio de texto, loading, erro, opcoes foto/galeria, bolha de foto e fluxo de review de foto antes de merge/publicacao.

Decisão futura:

- Após fechar/mergear `feature-ember-design-system`, abrir uma nova branch só para iconografia.
- Objetivo: substituir emojis recorrentes por ícones bonitos e consistentes, sem reabrir a conversão Ember.
- Manter a possibilidade de preservar personalidade no Coach, desde que com linguagem visual própria.

---

## 11. Checklist de QA Visual

### 11.1 Viewports

Testar:

- Mobile pequeno: `360x740`
- Mobile comum: `390x844`
- Mobile grande: `430x932`
- Desktop estreito: `768x1024`
- Desktop: `1280x800`

### 11.2 Rotas

Testar:

- `/login`
- `/set-password`
- `/home`
- `/diario`
- `/treino`
- `/corpo`
- `/mais`
- `/kcx-studio` se admin disponível

### 11.3 Fluxos principais

Treino:

- Abrir treino.
- Abrir exercício.
- Editar carga/reps.
- Adicionar exercício.
- Trocar exercício.
- Abrir timer.
- Abrir histórico/progressão.
- Salvar treino.

Diário:

- Abrir FoodDrawer.
- Buscar alimento.
- Adicionar porção.
- Editar refeição.
- Remover alimento.
- Registrar água.
- Abrir histórico.

Coach:

- Abrir chat.
- Enviar mensagem.
- Abrir foto.
- Confirmar log alimentar.
- Fechar sheet/modal.

Corpo:

- Registrar peso/cintura/BF.
- Abrir histórico.
- Abrir gráfico.
- Abrir check-in.

Mais:

- Abrir calculadora.
- Editar metas.
- Exportar/importar se aplicável.

### 11.4 Critérios visuais

Verificar:

- Texto não corta.
- Botões não sobrepõem nav.
- FAB não cobre ações importantes.
- Sheets respeitam safe-area.
- Contraste suficiente em labels e dados.
- Inputs com pelo menos 44px de altura quando usados em mobile.
- Scroll funciona em modais.
- Não há tela poluída por textura/glow.
- Gradientes usados com moderação.
- Não há excesso de emoji como elemento visual principal.
- Estados loading, empty, error e disabled continuam legíveis.

---

## 12. Testes Técnicos

Rodar:

```bash
npm run build
npm run test
```

Se houver lint disponível/útil:

```bash
npm run lint
```

Observação:

- O build atual pode exigir execução fora do sandbox por limitação local de acesso ao `vite.config.ts`.
- O aviso de chunk > 500 kB já existe e não bloqueia, mas deve ser registrado se aparecer.

---

## 13. Critérios de Aceite

A migração Ember só deve ser considerada pronta quando:

1. O app continua funcional.
2. Treino ficou mais rápido de usar.
3. Diário ficou mais objetivo para lançamento.
4. Home ficou mais executiva.
5. Coach está presente, mas discreto.
6. Paleta Ember está consistente.
7. Fontes estão aplicadas corretamente.
8. Modais/drawers não parecem de outro sistema.
9. Mobile foi validado.
10. Usuário aprovou visual em preview branch.

---

## 14. Riscos

### 14.1 Alto volume de inline styles

Risco:

- Algumas partes não receberão tokens automaticamente.

Mitigação:

- Mapear por tela.
- Migrar por fase.
- Criar classes compartilhadas só quando necessário.

### 14.2 Regressão em mobile

Risco:

- Treino e modais são densos.

Mitigação:

- Testar em largura real de celular.
- Validar inputs e nav.

### 14.3 PWA/cache

Risco:

- Visual antigo pode persistir após deploy.

Mitigação:

- Testar hard refresh.
- Verificar update toast/service worker.

### 14.4 Fonts externas

Risco:

- Google Fonts pode atrasar render ou falhar.

Mitigação:

- Usar fallback bom.
- Avaliar self-host.

---

## 15. Plano Para Próxima Sessão

**Atualização de fechamento — 2026-07-09:** esta seção foi superada pelo QA final e aprovação do usuário. A migração Ember foi considerada aprovada após revisão visual manual durante a execução, com ajustes finais aplicados ao `InstallPrompt`, resíduos visuais globais, `VisualMockPage` e bloco de cardio do Treino.

Validações finais executadas:

- `npm run build` passou.
- `C:\Program Files\nodejs\npm.cmd run test` passou fora do sandbox: 2 arquivos, 49 testes.
- Lint escopado passou para `src/pages/TreinoPage.tsx` e `src/components/InstallPrompt.tsx`.
- Busca por resíduos visuais antigos (`#1a2035`, `#121828`, `#7c5cff`, `#6144e0`, `rgba(124,92,255...)`, `font-size` com `vw`, `letter-spacing` negativo) não retornou ocorrências relevantes no app real.
- `npm run lint` completo ainda falha por débitos antigos fora do escopo em hooks e `coverage/`; não foi tratado nesta spec visual.

Pendência pós-merge:

- Abrir branch separada para iconografia/ícones consistentes, preservando a decisão de manter personalidade no Coach quando fizer sentido.

Prompt recomendado para a próxima sessão:

> A spec `memory/spec-visual-ember-design-system.md` foi concluída e aprovada em 2026-07-09 na branch `feature-ember-design-system`. Se ainda não foi feito, verificar `git status --short --branch`, confirmar que o commit/merge/push da branch Ember foi concluído e então abrir uma nova branch separada para iconografia/ícones. Não reabrir a migração visual Ember salvo bug visual real pós-publicação.

Primeira entrega esperada:

- Confirmar se `feature-ember-design-system` já foi mergeada/publicada.
- Se sim, criar branch separada para iconografia consistente.
- Se não, finalizar commit/push/merge da branch Ember sem incluir arquivos soltos fora do escopo.
