# /migrate — Gerenciar migração de dados do app antigo

Skill específico para trabalhar na Fase 5: exportador de dados do blocos-tracker e importador no Kcalix.

## Contexto

O app antigo (blocos-tracker) armazena dados no localStorage com as chaves `blocos_tracker_*`.
O Kcalix armazena no Supabase. A migração é feita em duas partes:

**Parte A — Exportador** (modificação mínima no blocos-tracker)
- Botão "Exportar para Kcalix" no app antigo
- Gera `kcalix-export.json` com todos os dados mapeados para o schema do Supabase

**Parte B — Importador** (no Kcalix, após login)
- Tela de importação na primeira sessão
- Lê o JSON, insere nas tabelas do Supabase
- Confirmação com contagem de registros importados

## Mapeamento localStorage → Supabase

| localStorage key | Tabela Supabase |
|---|---|
| `blocos_tracker_settings` | `user_settings` |
| `blocos_tracker_diary` | `diary_entries` (um registro por dia) |
| `blocos_tracker_workouts` (workouts[]) | `workouts` |
| `blocos_tracker_workouts` (templates[]) | `workout_templates` |
| `blocos_tracker_corpo` | `body_measurements` |
| `blocos_tracker_habits_v1` | `habits` |
| `blocos_tracker_checkins_v1` | `checkins` |
| `blocos_tracker_custom_exercises` | `custom_exercises` |

## Formato do JSON exportado

```json
{
  "exportVersion": 1,
  "exportedAt": "ISO string",
  "settings": { ...objeto settings atual... },
  "diary": [ { "date": "YYYY-MM-DD", "data": { ...meals, totals... } } ],
  "workouts": [ { "date": "YYYY-MM-DD", "data": { ...exercises... } } ],
  "templates": [ { "data": { ...template... } } ],
  "body": [ { "date": "YYYY-MM-DD", "data": { ...medições... } } ],
  "habits": { ...objeto habits atual... },
  "checkins": [ { "date": "YYYY-MM-DD", "data": { ...checkin... } } ],
  "customExercises": [ { "data": { ...exercício... } } ]
}
```

## Quando usar este skill

- `/migrate exportador` — implementar o botão de exportação no blocos-tracker
- `/migrate importador` — implementar a tela de importação no Kcalix
- `/migrate status` — verificar estado da Fase 5

$ARGUMENTS
