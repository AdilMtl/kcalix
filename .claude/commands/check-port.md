# /check-port — Verificar fidelidade do port ao original

Compara o que foi implementado no Kcalix com o app original (`referência.index.html`).
O objetivo é garantir que **a experiência do usuário seja idêntica ao original** — não avaliar detalhes técnicos.

**Princípio:** copiar exatamente igual. Só divergir se a arquitetura nova tornar algo impossível de copiar — e nesse caso, documentar no ROADMAP.

---

## Como funciona

### 1. Identificar o escopo

O usuário informa o elemento portado (ex: "3B — ExerciseSelector + Séries").
Se não informado, usar a sessão atual do ROADMAP.

### 2. Ler o original

Abrir `memory/ref.aplicativo_antigo/referência.index.html` nas linhas da sessão.
Para cada elemento visível ou interativo, perguntar:

> "O usuário do app original consegue fazer X. O usuário do Kcalix também consegue?"

### 3. Ler o código implementado

Abrir os arquivos criados/modificados e mapear cada ação do usuário.

### 4. Produzir o relatório

O relatório fala sobre **o que o usuário vê e faz** — não sobre código.

```
🔍 CHECK-PORT: [Nome da sessão]

O QUE O USUÁRIO CONSEGUE FAZER:
✅ [ação] — funciona igual ao original
✅ [ação] — funciona igual ao original
⚠️  [ação] — funciona, mas diferente: [explicação simples]
❌ [ação] — NÃO FUNCIONA: [o que está faltando]

DIFERENÇAS ENCONTRADAS:
❌ [Crítico] [Nome] — [o que o usuário sente] → corrigir agora
⚠️  [Menor]  [Nome] — [o que o usuário sente] → próxima sessão
💡 [Melhoria] [Nome] — Kcalix faz melhor que o original → manter assim

DECISÕES TÉCNICAS (diferenças que o usuário não percebe):
- [ex: "trocar exercício move para o fim da lista em vez de manter posição — documentado para 3D"]

VEREDICTO:
✅ Idêntico ao original — pronto para /review
⚠️  Diferenças menores — decidir se corrige agora ou na próxima sessão
❌ Falta algo importante — corrigir antes de /review
```

### 5. Se houver itens ❌

1. Descrever em linguagem simples o que o usuário não consegue fazer
2. Propor a correção
3. Aguardar confirmação antes de implementar

---

## O que é crítico vs. menor vs. melhoria

**Crítico ❌ — corrigir antes de avançar:**
- Usuário não consegue completar uma ação principal (ex: não consegue adicionar série)
- Algo causa erro ou trava
- Input que abre teclado com zoom indesejado no celular (< 16px)
- Cálculo diferente do original (ex: kcal estimada errada)

**Menor ⚠️ — pode ir para próxima sessão:**
- Animação ou transição faltando
- Detalhe visual quase imperceptível
- Funcionalidade de sessão futura (já planejada no ROADMAP)
- Caso de uso raro que quase ninguém vai usar

**Melhoria 💡 — manter e documentar:**
- Kcalix faz algo melhor que o original sem quebrar nada
- Ex: preview de exercícios no template chip (Kcalix mostra nomes, original mostra "X exercícios")
- Ex: prev-ref carrega só quando abre o exercício (mais eficiente que carregar tudo de uma vez)

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
