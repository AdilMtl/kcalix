# Spec — Sessão 4B: MaisPage (Metas + Calculadora JP7 + Wizard)

**Fase:** 4 — Corpo, Hábitos e Mais
**Sessão:** 4B
**Prioridade:** Alta — desbloqueia EnergyCard da HomePage e KPIs do DiarioPage

---

## Contexto: o que já existe

### Já implementado e NÃO reescrever:

| Arquivo | Estado |
|---|---|
| `src/lib/calculators.ts` | COMPLETO — bodyDensityJP7, bfSiri, bmrMifflin, bmrKatch, calcFromProfile, CalcProfile, CalcResult |
| `src/data/goalPresets.ts` | COMPLETO — GOAL_PRESETS, GoalType, WZ_ACTIVITY_LABELS, WZ_GOAL_LABELS |
| `src/hooks/useSettings.ts` | QUASE COMPLETO — ver lacunas abaixo |

### Lacunas identificadas em useSettings.ts:

`UserSettingsData` atual tem:
- ✅ sex, age, weightKg, heightCm, activityFactor, goal (GoalType)
- ✅ bmr, tdee, kcalTarget, pTarget, cTarget, gTarget (calculados e salvos)
- ✅ skinfolds (opcionais), fixedKcal (opcional)

**Falta para re-edição fiel ao wizard:**
- ❌ `pKg`, `cKg`, `minFatKg` — gramagem por kg usada no cálculo manual (o usuário pode sobrescrever os defaults do preset)
- ❌ `def` — déficit percentual customizado (quando o usuário edita manualmente)

**Decisão:** Adicionar esses campos opcionais ao `UserSettingsData`. Se ausentes, o wizard usa os valores do `GOAL_PRESETS[goal]` como default (comportamento fiel ao original).

### Configurações de bloco (já em useSettings?):
Verificar se `blocks` e `kcalPerBlock` já existem. O original tem:
```
settings.blocks = { pG: 25, cG: 25, gG: 10 }          // g por 1 bloco
settings.kcalPerBlock = { p: 100, c: 100, g: 90 }      // kcal por 1 bloco
```
Se ausentes, adicionar ao `UserSettingsData`. Card Configurações na MaisPage edita esses valores.

---

## O que criar

### 1. src/hooks/useSettings.ts — adicionar campos

```typescript
// Adicionar ao UserSettingsData (todos opcionais para compatibilidade com dados existentes):
pKg?: number           // g proteína / kg peso (override do preset)
cKg?: number           // g carbo / kg peso (override do preset)
minFatKg?: number      // g gordura mín / kg peso (override do preset)
def?: number           // déficit % customizado (override do preset)

// Configurações de bloco (se ainda não existem):
blocks?: { pG: number; cG: number; gG: number }         // default: { pG:25, cG:25, gG:10 }
kcalPerBlock?: { p: number; c: number; g: number }      // default: { p:100, c:100, g:90 }
```

### 2. src/components/CalcWizardModal.tsx — wizard 5 etapas

**Origem:** JS L4625–4748 (openCalcWizard, wizardGoTo, fillWizardStep) + L5065–5121 (wzSaveStep1–4, wizardFinish)
**CSS:** L1894–1972 (.calc-wizard, .wz-*, .wz-sex-btn, .wz-choice-row, .wz-goal-card)

Estrutura do componente:
```typescript
interface Props {
  open: boolean
  isNewUser: boolean           // true se settings === null (mostra Welcome)
  initialData: Partial<UserSettingsData> | null
  onSave: (result: UserSettingsData) => void
  onClose: () => void
}
```

**Passos do wizard:**
- **Step "welcome"** (só para novo usuário): logo + tagline + 3 props (nutrição, treino, resultados) + botão "Começar"
- **Step 1 — Dados básicos:** sexo (2 botões ♂/♀), idade, peso, altura (inputs inputmode="decimal")
- **Step 2 — Dobras JP7:** 2 choice cards ("Tenho dobras medidas" / "Não tenho / pular") → se sim: 7 inputs (chest, ax, tri, sub, ab, sup, th)
- **Step 3 — Objetivo:** 4 goal cards (maintain / cut / recomp / bulk) com emoji + label + hint do GOAL_PRESETS
- **Step 4 — Atividade:** select com WZ_ACTIVITY_LABELS + preview BMR/TDEE/meta calculados em tempo real (updateWzBmrPreview)

**Comportamento de re-edição (usuário já configurado):**
- Wizard abre no Step 0 (summary): mostra dados atuais + botão "Editar"
- Botão Editar → Step 1

**wizardFinish:**
1. Calcula `calcFromProfile(wizardData)` → result
2. Monta `UserSettingsData` completo com todos os campos
3. Chama `onSave(newSettings)` → MaisPage chama `saveSettings()`
4. Fecha o wizard
5. Toast: "Perfil configurado e metas aplicadas ✅"

**CSS crítico (inline fiel ao original):**
```
.calc-wizard: position fixed, inset 0, background var(--bg), z-index 315, flex-direction column
.calc-wizard-header: padding 16px, border-bottom 1px solid var(--line)
.calc-wizard-progress: dots de progresso (4 dots para steps 1-4)
.wz-step-content: flex 1, overflow-y auto, padding 18px 16px, overscroll-behavior contain
.calc-wizard-footer: padding 12px 16px, border-top 1px solid var(--line), background var(--bg)
.wz-sex-btn: flex 1, padding 14px 10px, border-radius 10px, border 2px solid var(--line)
  → selected: border-color var(--accent), background rgba(124,92,255,.15)
.wz-goal-card: similar ao choice card, com emoji + título + hint em 12px
```

### 3. src/pages/MaisPage.tsx — port completo

**Origem:** HTML L2313–2524

#### Card 1: 🍎 Nutrição

**NutriBanner** (acima dos accordions):
- Se `settings === null`: banner roxo "Configure seu perfil nutricional → [🧭 Configurar]"
- Se `settings !== null`: banner verde com "BMR: Xkcal · TDEE: Xkcal · Meta: Xkcal · P Xg / C Xg / G Xg"
- Botão "Editar perfil" abre CalcWizardModal

**Accordion: 🎯 Metas diárias** (aberto por default):
- Form-grid 2 colunas: P (g/dia), C (g/dia), G (g/dia), Kcal alvo (readonly — calculado P×4+C×4+G×9)
- Kcal recalcula em tempo real ao digitar P/C/G
- Botão "Salvar metas" → `saveSettings({ ...settings, pTarget, cTarget, gTarget, kcalTarget })`

**Accordion: 🧮 Calculadora de perfil** (fechado por default):
- Banner "Configure seu perfil passo a passo [🧭 Configurar]" — abre CalcWizardModal
- Hint: "Ou preencha manualmente abaixo..."
- Seção 1 — Dados básicos: sexo (select), idade, peso, altura
- Seção 2 — Dobras (7 inputs, opcionais)
- Seção 3 — Alvo de dieta: select objetivo + hint do preset + select atividade + def% + pKg + cKg + minFatKg + kcal fixo
- Botões "Calcular" e "Salvar"
- Resultados (card interno): BF% / Massa magra / BMR (kpi-grid 3 colunas) + macros sugeridos
- Botões: "➡️ Aplicar nas metas" + "➡️ BF% → Medição"

**Botão "➡️ BF% → Medição":**
- Se `bf !== null`: salva `bf` no body measurement do dia atual via `useBody().saveMeasurement({ bfPct: bf })`
- Requer instanciar `useBody` na MaisPage (apenas para esta ação)

**Accordion: 🤖 Exportar para IA** (fechado):
- Descrição + botão "⬇️ Baixar JSON" (exporta últimos 60 dias como JSON) + "📋 Copiar prompt do sistema"
- Implementação básica: JSON dos workoutRows + diary entries dos últimos 60 dias (pode ser simplificado)

#### Card 2: ⚙️ Configurações

**Accordion: 🧱 Equivalência do bloco** (fechado):
- Inputs: 1P = Xg proteína (default 25), 1C = Xg carbo (default 25), 1G = Xg gordura (default 10)

**Accordion: 🔢 kcal estimadas por bloco** (fechado):
- Inputs: kcal por 1P (default 100), kcal por 1C (default 100), kcal por 1G (default 90)

**Botões:** "Salvar configurações" + "Reset" (restaura defaults acima)

---

## Estado e fluxo de dados

```
MaisPage
  useSettings()           ← único ponto de dados
  useBody()               ← só para "➡️ BF% → Medição"
  useState(calcResult)    ← resultado local da calculadora manual (não persiste)
  CalcWizardModal         ← props: open, isNewUser, initialData, onSave, onClose
```

Não instanciar `useSettings` dentro do CalcWizardModal — todo estado de cálculo do wizard é local (`wizardData` via `useState`).

---

## Impacto em outros componentes após 4B

Após salvar o perfil via wizard:

| Componente | O que passa a funcionar |
|---|---|
| HomePage EnergyCard | BMR/TDEE/saldo visíveis (antes mostrava só "kcal in") |
| DiarioPage KPIs | Barras de P/C/G com meta real (pTarget/cTarget/gTarget) |
| CorpoPage | BF% calculado pelo JP7 exibe na tabela de histórico |
| Nav badge | Pode mostrar meta vs atual (futuro) |

**Atenção:** `useSettings` já é instanciado em `HomePage` e `DiarioPage`. Verificar se eles leem `pTarget/cTarget/gTarget` ou `goals.pG/cG/gG` — adaptar o campo lido se necessário ao salvar.

---

## Referências no original

| Elemento | Linhas |
|---|---|
| HTML viewMais | 2313–2524 |
| CSS calc-wizard | 1894–1972 |
| CSS habit-tracker | 1731–1815 |
| JS renderNutriBanner | 4527–4560 |
| JS GOAL_PRESETS | 4607–4613 |
| JS openCalcWizard / wizardGoTo / fillWizardStep | 4625–4748 |
| JS updateWzBmrPreview | 4709–4735 |
| JS wzSaveStep1-4 / wizardFinish | 5065–5121 |
| JS bodyDensityJP7 / bfSiri / bmrMifflin / bmrKatch / calcAll | 5123–5235 |
| JS settings form / updateKcalFromMacros | 4518–4605 |

---

## Ordem de implementação na sessão

1. **useSettings.ts** — adicionar campos opcionais (pKg, cKg, minFatKg, def, blocks, kcalPerBlock)
2. **CalcWizardModal.tsx** — wizard 5 etapas (componente novo)
3. **MaisPage.tsx** — port completo dos 2 cards
4. **Verificar HomePage + DiarioPage** — confirmar que leem pTarget/cTarget/gTarget corretamente
5. `npm run build` → sem erros TypeScript
6. `/check-port` → comparar vs original L2313–2524
7. `/review` → checklist mobile + TypeScript
8. `/end` → v0.15.0

---

## Checklist de fidelidade

- [ ] NutriBanner aparece com BMR/TDEE/meta após configurar
- [ ] Wizard: 4 progress dots aparecem nos steps 1-4, não no welcome/summary
- [ ] Wizard step 3: hint do preset aparece ao selecionar objetivo
- [ ] Wizard step 4: preview BMR/TDEE atualiza em tempo real ao mudar atividade
- [ ] wizardFinish: metas (pTarget/cTarget/gTarget/kcalTarget) são salvas junto com o perfil
- [ ] Botão "Aplicar nas metas": preenche accordion de metas com valores do resultado manual
- [ ] Botão "BF% → Medição": salva bfPct na medição do dia atual
- [ ] Inputs de configuração de bloco: valores default 25/25/10 e 100/100/90
- [ ] Kcal alvo readonly em metas diárias: recalcula ao digitar P/C/G
- [ ] CalcWizardModal: z-index 315 (acima de tudo, abaixo de nada)
- [ ] Build limpo sem `any`
- [ ] Funciona em 375px (scroll interno no wizard, footer fixo)
