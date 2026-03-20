# Spec: BMR Diário no body_measurements

**Criada em:** 2026-03-19
**Fase:** 6B (Qualidade e Robustez) — pode ser executada como item avulso
**Estimativa:** 1 sessão (~45 min)
**Arquivo de referência do original:** não há equivalente — feature nova (o original usa BMR atual para todos os dias)

---

## PROBLEMA / MOTIVAÇÃO

Hoje o gráfico de 7 dias (home e modal histórico) usa o BMR **atual** do perfil para todos os dias da semana. Se o usuário mudou de peso ou fez nova avaliação, os dias anteriores ficam com o BMR errado — distorcendo o saldo e a projeção de kg/semana.

O ideal: cada dia usa o BMR que estava vigente naquela data (baseado na última medição corporal antes ou naquela data). Assim é possível ver a progressão real do metabolismo ao longo do tempo.

---

## O QUE MUDA

- [ ] `src/types/body.ts` — adicionar campo `bmr?: number` em `BodyMeasurement` e `BodyRow`
- [ ] `src/lib/calculators.ts` — exportar função `calcBmrFromSettings(settings)` reutilizável
- [ ] `src/pages/CorpoPage.tsx` — calcular e salvar `bmr` no `handleSave`
- [ ] `src/hooks/useBody.ts` — nenhuma mudança (JSONB já armazena campos extras automaticamente)
- [ ] `src/pages/HomePage.tsx` — trocar `bmr` fixo por `buildBmrByDate(bodyRows, weekDays)`
- [ ] `src/components/WeeklyKcalModal.tsx` — mesma troca: `bmr` fixo → `bmrByDate[day.iso] ?? bmrAtual`

**Sem migração SQL** — o campo `bmr` vai dentro do `data JSONB` existente em `body_measurements`. Nenhum DDL necessário.

---

## COMO O USUÁRIO INTERAGE

O usuário não percebe nenhuma mudança de UX — tudo acontece automaticamente:

1. Usuário salva medição na aba Corpo (peso, cintura, etc.)
2. O app calcula o BMR baseado no perfil atual e salva junto com a medição
3. No gráfico de 7 dias da home, cada barra cinza usa o BMR da medição mais próxima **antes ou naquela data**
4. Dias sem medição usam o último BMR registrado como fallback (e se não houver nenhum, usam o BMR atual do perfil)

---

## COMO EXECUTAR — PASSO A PASSO

### Passo 1 — Adicionar `bmr` aos tipos (`src/types/body.ts`)

```ts
export interface BodyMeasurement {
  weightKg:   number | null
  waistCm:    number | null
  bfPct:      number | null
  note:       string
  skinfolds?: Skinfolds
  bmr?:       number   // ← novo: BMR calculado no momento da medição
}

// BodyRow já extende BodyMeasurement — herda bmr automaticamente
```

### Passo 2 — Exportar helper de cálculo de BMR (`src/lib/calculators.ts`)

Extrair a lógica que já existe em `calcAll()` (linhas 60–90) para uma função standalone:

```ts
export function calcBmrFromSettings(settings: UserSettings): number | null {
  // Mesma lógica de calcAll: JP7 se tiver skinfolds, Mifflin se não tiver
  // Retorna null se dados insuficientes (sem peso/altura/idade)
  // Não duplicar código — calcAll pode chamar calcBmrFromSettings internamente
}
```

> **Atenção:** não mudar a assinatura de `calcAll` — só extrair a parte do BMR para reutilização.

### Passo 3 — Salvar BMR no `handleSave` da CorpoPage (`src/pages/CorpoPage.tsx`)

```ts
// CorpoPage já importa useSettings — settings já está disponível
function handleSave() {
  // ... lógica existente de dobras ...

  const bmrAtual = settings ? calcBmrFromSettings(settings) : null

  const data: BodyMeasurement = {
    weightKg: parseNum(weight),
    waistCm:  parseNum(waist),
    bfPct:    parseNum(bf),
    note:     note.trim(),
    ...(anySF ? { skinfolds: sf } : {}),
    ...(bmrAtual != null ? { bmr: Math.round(bmrAtual) } : {}),  // ← novo
  }
  saveMeasurement(data)
  // ... resto igual
}
```

> O `saveMeasurement` grava `data` como JSONB no Supabase — nenhuma mudança no hook necessária.

### Passo 4 — Helper `buildBmrByDate` (`src/pages/HomePage.tsx` ou `src/lib/dateUtils.ts`)

Criar função pura (sem Supabase) que recebe o histórico de medições e devolve o BMR vigente por data:

```ts
// Dado um array de BodyRow (ordenado por date DESC) e uma data ISO,
// retorna o BMR do registro mais recente <= date, ou null se não houver.
function getBmrForDate(rows: BodyRow[], date: string): number | null {
  // rows já vem de fetchAllBodyRows ordenado DESC
  const found = rows.find(r => r.date <= date && r.bmr != null)
  return found?.bmr ?? null
}
```

### Passo 5 — Usar `getBmrForDate` no `WeeklyChart` (HomePage)

**Antes (hoje):**
```ts
// WeeklyChart recebe `bmr: number | undefined` — mesmo valor para todos os dias
const total = (d: WeekDay): number => {
  if (bmr == null || bmr <= 0) return 0
  if (consumed(d) === 0) return 0
  const exercise = d.isToday ? todayWorkoutKcal : (workoutKcalByDate[d.iso] ?? 0)
  return bmr + exercise
}
```

**Depois:**
```ts
// WeeklyChart passa a receber `bodyRows: BodyRow[]` em vez de `bmr: number | undefined`
// (bmr atual vem de settings e serve como fallback)
const total = (d: WeekDay): number => {
  const bmrDia = getBmrForDate(bodyRows, d.iso) ?? bmrAtual ?? 0
  if (bmrDia <= 0) return 0
  if (consumed(d) === 0) return 0
  const exercise = d.isToday ? todayWorkoutKcal : (workoutKcalByDate[d.iso] ?? 0)
  return bmrDia + exercise
}
```

> `bodyRows` já está em estado na HomePage (`useState<BodyRow[]>`) — carregado lazy pelo `handleOpenEvolution`. Mudar para carregar no **mount** junto com `workoutKcalByDate` (não lazy), para o gráfico da home já ter os dados.

### Passo 6 — Mesma mudança no `WeeklyKcalModal`

```ts
// Props: adicionar bodyRows: BodyRow[], manter bmr como fallback
const energies: EnergyDay[] = days.map(day => {
  const consumed  = kcalMap[day.iso] ?? 0
  const exercise  = Math.round(workoutKcalByDate[day.iso] ?? 0)
  const bmrDia    = getBmrForDate(bodyRows, day.iso) ?? (bmr ?? 0)
  const basalTotal = bmrDia > 0 && consumed > 0 ? bmrDia + exercise : 0
  const balance    = bmrDia > 0 && consumed > 0 ? consumed - basalTotal : null
  return { ...day, consumed, exercise, basalTotal, balance }
})
```

---

## FLUXO DE DADOS COMPLETO (pós-implementação)

```
CorpoPage.handleSave
  └── calcBmrFromSettings(settings) → bmr: 1823
  └── saveMeasurement({ ..., bmr: 1823 }) → Supabase body_measurements.data.bmr

HomePage mount (não lazy)
  └── fetchAllBodyRows(userId) → BodyRow[] com campo bmr por dia
  └── setBodyRows(rows)

WeeklyChart / WeeklyKcalModal
  └── total(day) = getBmrForDate(bodyRows, day.iso) ?? bmrAtual + treino_do_dia
```

---

## RETROATIVO

- Medições antigas **não têm `bmr`** no JSONB — `getBmrForDate` retorna `null` para elas
- Fallback: usa `bmr` atual do perfil (comportamento idêntico ao de hoje)
- A partir da primeira medição após deploy: BMR correto salvo automaticamente
- Usuário não precisa fazer nada — funciona silenciosamente

---

## RISCOS

| Risco | Mitigação |
|---|---|
| `calcBmrFromSettings` retorna null se perfil incompleto | Fallback para `bmr` do settings (comportamento atual) |
| `bodyRows` carregado no mount aumenta 1 query no load inicial | Query leve (200 linhas, só `date + data`); já era feita lazy — impacto mínimo |
| `getBmrForDate` com array grande pode ser lento | Array de 200 rows com `.find()` = microssegundos; sem impacto |
| Usuário salva medição sem peso/altura → BMR null | `...(bmrAtual != null ? { bmr } : {})` — campo simplesmente não é gravado |

---

## CRITÉRIOS DE FEITO

- [ ] Build sem erros TypeScript
- [ ] Salvar medição na CorpoPage grava `bmr` no JSONB (verificar no Supabase Table Editor)
- [ ] Gráfico de 7 dias na home mostra barra cinza com altura diferente em dias com medições diferentes
- [ ] Modal histórico semanal usa BMR do dia corretamente
- [ ] Dias sem medição usam último BMR conhecido como fallback
- [ ] Sem regressão: usuário sem nenhuma medição ainda vê gráfico igual ao de hoje
