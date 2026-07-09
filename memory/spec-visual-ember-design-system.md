# Spec: Migração Visual Ember Design System

**Status:** planejada para próxima sessão  
**Decisão visual:** adotar a direção `Ember Training` do `VisualMockPage` como base do novo design system do app real  
**Data da decisão:** 2026-07-09  
**Branch de trabalho sugerida:** `feature/ember-design-system`  
**Regra de merge:** não fazer merge em `main` até a revisão visual completa, build limpo e validação em mobile/desktop.

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

- Home funcional e executiva.
- Mostrar leitura do dia sem excesso.

Prioridades:

1. Estado geral do dia.
2. Energia/nutri.
3. Treino/volume/insight.
4. Hábitos.
5. Evolução semanal.
6. Coach insight discreto.

Mudanças:

- Transformar cards principais em módulos Ember.
- Reduzir aparência de template/card genérico.
- Métricas com `--font-data`.
- Hábitos com visual mais limpo e menos glow.
- Barras semanais com `--gradient-data`.

Não mudar:

- Dados exibidos.
- Abertura de modais.
- Hooks.

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

### Fase 5: Home e hábitos

Arquivos:

- `HomePage.tsx`
- `HabitTracker.tsx`
- `HabitHistoryModal.tsx`
- `WeeklyKcalModal.tsx`
- `DiaryHistoryModal.tsx`

Tarefas:

- Home executiva.
- Hábitos limpos.
- Gráficos semanais Ember.
- Insights do coach.

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

Prompt recomendado para iniciar:

> Iniciar a implementação da spec `memory/spec-visual-ember-design-system.md`. Criar branch `feature/ember-design-system`, não mexer em `main`, e executar a Fase 0 + Fase 1: baseline, tokens globais Ember, componentes globais e validação inicial. Não alterar lógica de dados.

Primeira entrega esperada:

- Branch criada.
- Tokens Ember em `src/index.css`.
- `.btn`, `.card`, `.accordion`, `.kpi`, `.form-row`, `.set-input` migrados.
- `Nav`, `DateNavBar`, FAB Coach e skeletons alinhados.
- Build validado.
- Link de preview ou instrução local para revisão.

