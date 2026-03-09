# /check-port — Verificar fidelidade do port ao original

Compara o que foi implementado no Kcalix com o app original (`referência.index.html`),
garantindo que nenhum elemento visual ou funcional foi esquecido.

Use **após implementar** com `/port` e **antes de** `/review` e `/end`.

---

## Processo de verificação

### 1. Identificar o escopo

O usuário informa o elemento portado (ex: "3B — ExerciseSelector + Séries").
Se não informado, use a sessão atual do ROADMAP.

### 2. Ler o original nas linhas mapeadas

Consulte o `ROADMAP.md` para as linhas da sessão atual.
Abra `memory/ref.aplicativo_antigo/referência.index.html` nas linhas indicadas.

Extraia uma lista de **todos os elementos** presentes:
- Elementos HTML (divs, botões, inputs, tabelas, modais)
- Classes CSS com comportamento visual relevante
- Funções JS / lógica de negócio
- Estados e interações (toggle, open/close, cálculos)

### 3. Ler o código Kcalix implementado

Abra os arquivos criados/modificados na sessão.
Mapeie cada elemento do original para sua contraparte React/TS.

### 4. Produzir o relatório de fidelidade

```
🔍 CHECK-PORT: [Nome da sessão]

LINHAS ANALISADAS NO ORIGINAL: [ex: L2837–2850, L6280–6591, L1356–1456]

ELEMENTOS VERIFICADOS:
✅ [elemento] — implementado em [arquivo:linha]
✅ [elemento] — implementado em [arquivo:linha]
⚠️  [elemento] — implementado parcialmente: [detalhe]
❌ [elemento] — FALTANDO: [detalhe]

GAPS ENCONTRADOS:
- ❌ [gap crítico que quebra UX]
- ⚠️  [gap menor / pode ser próxima sessão]
- 💡 [elemento que foi melhorado em relação ao original — aceitável]

DECISÕES ARQUITETURAIS (diferenças intencionais):
- [ex: "swap usa remove+add ao invés de troca in-place — documentado para 3D"]

VEREDICTO:
✅ Fiel ao original — pronto para /review
⚠️  Gaps menores — decidir se corrige agora ou próxima sessão
❌ Gaps críticos — corrigir antes de /review
```

### 5. Se houver gaps críticos

Para cada ❌ crítico:
1. Leia as linhas exatas do original
2. Proponha a correção mínima necessária
3. Aguarde confirmação antes de implementar

---

## O que é gap crítico vs. menor

**Crítico (❌) — corrigir antes de deploy:**
- Funcionalidade principal quebrada (ex: não consegue adicionar série)
- Input sem `font-size: 16px` (causa zoom iOS)
- Botão sem área de toque mínima (44px)
- Cálculo errado (ex: kcalPerSet diferente do original)
- Estado que deveria persistir não persiste

**Menor (⚠️) — pode ir para próxima sessão:**
- Animação de transição faltando
- Detalhe visual de 1–2px de diferença
- Feature de sessão futura (ex: modal de progressão na 3E)
- Comportamento edge case raramente atingido

**Melhoria intencional (💡) — documentar e manter:**
- Substituição de `confirm()` nativo por UI mais elegante (se já implementado)
- Comportamento superior ao original que não quebra nada

---

## Mapa de linhas do original (referência rápida)

```
CSS tokens/globais  → L24–191
Bottom nav          → L192–235
Cards/Accordion     → L346–406
KPI / Progress      → L407–501
Meals               → L563–664
Food Drawer CSS     → L933–1114
Food Modal CSS      → L1115–1317
Home Dashboard CSS  → L1407–1730
View Home HTML      → L2113–2197
View Diário HTML    → L2198–2312
View Treino HTML    → L2604–2695
Modais Treino HTML  → L2697–2851
View Corpo HTML     → L2526–2603
JS: EXERCISE_DB     → L3345–3482
JS: renderTmplGrid  → L6280–6321
JS: renderExList    → L6323–6438
JS: ExerciseSelector→ L6440–6591
JS: renderCardio    → L6400–6439 (aprox)
JS: timer           → L6700–6800 (aprox)
JS: saveWorkout     → L6127–6200 (aprox)
JS: calcAll/JP7     → L5123–5208
JS: FoodDrawer      → L5761–6090
JS: renderHome()    → L4156–4330
```

$ARGUMENTS
