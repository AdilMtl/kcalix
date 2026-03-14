# Spec Sessão 5D — Skinfolds → Settings + Import Checkins

**Fase:** 5 — Ferramenta de Migração
**Data criada:** 2026-03-14

---

## ITEM 1 — CorpoPage: salvar dobras JP7 atualiza user_settings.skinfolds

### Problema
Ao salvar medições com dobras na CorpoPage, os valores ficam apenas em
`body_measurements`. O campo `user_settings.skinfolds` NÃO é atualizado.
Consequência: CalcWizardModal e ProfileCheckinModal usam skinfolds desatualizadas
para calcular BF% e metas.

### Comportamento no app original (referência L5259–5276)
`saveMeasureForDate` salva na tabela de medições E atualiza `calc.skinfolds`
no localStorage simultaneamente. As metas são recalculadas automaticamente
via `renderSettings()` após o save.

### O que muda no Kcalix

**src/pages/CorpoPage.tsx** (L200–210 aprox — bloco `handleSave`)
- Após `saveMeasurement(data)`, se `anySF === true`:
  - Chamar `saveSettings({ ...settings, skinfolds: sf })` para persistir no Supabase
  - `useSettings` já tem `saveSettings` — só precisa ser importado e instanciado

**src/pages/CorpoPage.tsx** — imports
- Adicionar `useSettings` (já existe, só não está importado na CorpoPage)

### Impacto
- NÃO recalcular metas automaticamente ao salvar dobras — usuário deve abrir
  o CalcWizard manualmente para recalcular (mesmo comportamento do original:
  o wizard lê os skinfolds salvos e recalcula ao confirmar)
- Sem migration SQL necessária — `user_settings.data` já tem campo `skinfolds`

### Critérios de feito
- [ ] Salvar dobras na CorpoPage → `user_settings.skinfolds` atualizado no Supabase
- [ ] CalcWizardModal abre com os valores corretos das dobras (pré-preenchidos)
- [ ] Build sem erros TypeScript

---

## ITEM 2 — Import de checkins do app antigo

### Problema
O campo `checkins` não existe no `exportKcalixFull` do app antigo
(`index_atualizado com export.html`). O `migrationTransform.ts` também não
tem `transformCheckins`. Os check-ins históricos do usuário são perdidos na migração.

### Formato do checkin no app antigo (referência L8875–8889)
```json
{
  "date": "2026-03-09",
  "weightKg": 75,
  "waistCm": 85,
  "bfPct": 18.5,
  "leanKg": 61.4,
  "bmr": 1720,
  "tdee": 2666,
  "kcalTarget": 1980,
  "goalType": "cut",
  "period": 7,
  "trainingSessions": 5,
  "avgTrainingKcal": 280,
  "activityType": "Moderadamente ativo",
  "avgConsumed": 1850,
  "adherencePct": 87,
  "note": null
}
```

### O que muda

**memory/index_atualizado com export.html** (app antigo — exportKcalixFull)
- Adicionar campo `checkins: _loadCheckins().checkins` ao objeto `out` (linha ~5472)
- ATENÇÃO: editar o arquivo HTML do app antigo e fazer novo export do blocos-tracker

**src/lib/migrationTransform.ts**
- Adicionar interface `ExportCheckin` com os campos acima
- Adicionar `checkins?: ExportCheckin[]` ao `FullExport`
- Adicionar `checkins: CheckinRow[]` ao `TransformResult`
- Adicionar `transformCheckins(checkins: ExportCheckin[]): CheckinRow[]`
  - Mapear: `date`, `weightKg`, `waistCm`, `bfPct`, `bmr`, `tdee`,
    `kcalTarget`, `goalType`, `trainingSessions`, `avgTrainingKcal`,
    `activityType`, `avgConsumed`, `adherencePct`, `note`
  - Ignorar `leanKg` e `period` (não existem na tabela Kcalix)
- Adicionar `checkins: transformCheckins(data.checkins ?? [])` no `transformAll`
- Atualizar `buildPreview` para contar `checkins`

**src/lib/migrationImport.ts**
- Adicionar step 9: upsert em `checkins`
  - `onConflict: 'user_id,date'` (UNIQUE constraint já existe — migration 011)
  - `ignoreDuplicates: true`
- Adicionar `checkins` ao `ImportProgress` step union type
- Adicionar contagem no preview do MigrateModal

**src/components/MigrateModal.tsx**
- Adicionar linha no preview: "Check-ins: N" (se > 0)
- Adicionar step 'checkins' no progresso visual

### Critérios de feito
- [ ] exportKcalixFull no app antigo inclui `checkins`
- [ ] transformCheckins mapeia corretamente para CheckinRow
- [ ] Import insere checkins na tabela `checkins` do Supabase
- [ ] Preview do MigrateModal mostra contagem de checkins
- [ ] Reimport não duplica (ignoreDuplicates: true)
- [ ] Build sem erros TypeScript

---

## Ordem de execução sugerida

1. Item 1 (CorpoPage + skinfolds) — 20min — impacto direto no uso diário
2. Item 2 (checkins) — 40min — requer editar o HTML do app antigo + novo export

