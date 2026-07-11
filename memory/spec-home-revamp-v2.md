# Spec — Home Revamp v2 (Convergência C)

**Status:** aprovada para implementação em 2026-07-10
**Referência visual:** `/visual-mock`, opção C — Convergência
**Base:** narrativa da opção A com acabamento Ember da opção B

## Objetivo

Transformar a Home em um dashboard rolável e contextual, com dois momentos claros:

- Antes do treino: recomendar o que treinar com base no volume real dos últimos 7 dias contra o MEV.
- Depois do treino: resumir a sessão salva e destacar progresso real quando houver comparação válida.

Nutrição, hábitos, gráfico semanal, energia, Nav e Coach devem preservar a lógica atual.

## Ordem final

1. Data/contexto.
2. Decisão ou resumo de treino.
3. Ranking dos 3 grupos mais abaixo do MEV (somente antes do treino).
4. Calorias e macros.
5. Hábitos recolhidos.
6. Insight determinístico, somente quando útil.
7. Gráfico semanal de calorias sempre visível.
8. Energia e saldo.

## Remover

- Score abstrato `pronto`.
- Cards separados `Por que hoje` e `Plano mínimo`.
- `Semana em pulso`, por repetir hábitos.
- Faixa `Coach insight`, por repetir o insight.
- Atalhos Diário/Treino/Evolução/Perfil, por repetirem a Nav inferior.

Estas decisões substituem os itens equivalentes da Fase 5 em
`memory/spec-visual-ember-design-system.md`.

## Recomendação de treino

- Reutilizar `calcMuscleVolume`, `MUSCLE_LANDMARKS` e a janela móvel de 7 dias já usada em `O que treinar hoje?`.
- Ordenar somente grupos abaixo do MEV pelo menor preenchimento relativo (`series / MEV`).
- Recomendar o grupo grande com maior déficit junto ao grupo complementar com maior déficit.
- Grandes: Peito, Costas, Quad, Posterior e Glúteos.
- Complementares: Ombros, Bíceps, Tríceps e Core.
- Se uma categoria não tiver candidato, mostrar apenas o grupo prioritário.
- Se todos estiverem na faixa, informar isso sem inventar déficit.
- A Home e a tela de Treino devem consumir o mesmo helper tipado.

## Pós-treino

- Detectar treino pela linha real em `workouts`, mesmo quando `kcal` for zero.
- Séries: contar somente séries de trabalho.
- Progresso: comparar carga máxima, repetições e volume numérico com a sessão anterior do mesmo exercício.
- Sem comparação válida: mostrar `Primeira referência salva`.
- Duração é opcional (`durationMin?`) e não deve ser inventada para registros antigos.

## Insight

- Usar regras locais com dados disponíveis: configuração ausente, excesso de calorias,
  proteína abaixo do ritmo, treino pendente, hábitos abertos e margem nutricional útil.
- Não mostrar mensagem genérica quando não houver ação relevante.
- Não alterar o Coach/FAB.

## Compatibilidade

- Sem migração SQL: `workouts.data` já é JSONB.
- Campos novos em treino devem ser opcionais.
- Não alterar Supabase, RLS, Edge Functions, auth, cálculos nutricionais ou modais existentes.
- Datas passadas mostram treino salvo ou estado vazio; não recebem texto `O que treinar hoje?`.

## Validação

- Testes unitários para ranking, pareamento, treino com zero kcal, aquecimento,
  primeira sessão, dados não numéricos e duração ausente.
- Viewports: 360×740, 390×844, 430×932, desktop estreito e desktop.
- Build, testes, lint escopado e `git diff --check` antes do preview.
