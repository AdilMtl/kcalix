// ════════════════════════════════════════════════════════════════════════════
// MigrateModal.tsx — Importador de migração blocos-tracker → Kcalix
// z-index: 318 (overlay) / 319 (sheet)
// ════════════════════════════════════════════════════════════════════════════

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { validateExport, buildPreview, transformAll } from '../lib/migrationTransform'
import { runImport } from '../lib/migrationImport'
import type { FullExport, ImportPreview } from '../lib/migrationTransform'
import type { ImportProgress } from '../lib/migrationImport'

interface Props {
  open: boolean
  onClose: () => void
}

type Step = 'instructions' | 'preview' | 'importing' | 'done'

const STEP_LABELS: Record<ImportProgress['step'], string> = {
  settings:        'Configurações...',
  diary:           'Diário...',
  workouts:        'Treinos...',
  templates:       'Rotinas...',
  customExercises: 'Exercícios personalizados...',
  body:            'Medições corporais...',
  habits:          'Hábitos...',
  customFoods:     'Alimentos personalizados...',
  checkins:        'Check-ins...',
  done:            'Concluído',
}

function fmtDate(iso: string): string {
  if (!iso) return ''
  const [, m, d] = iso.split('-')
  return `${d}/${m}`
}

// ── Etapa 1: Instruções ───────────────────────────────────────────────────────

function StepInstructions({
  onFileChange,
  onClose,
  parseError,
}: {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onClose: () => void
  parseError: string | null
}) {
  return (
    <>
      <p className="mg-step-title">Como importar seus dados</p>
      <div className="mg-instructions">
        <ol>
          <li>Abra o <b>Blocos Tracker</b> no browser</li>
          <li>Vá em <b>Mais</b> → toque <b>"⬇️ Exportar dados completos"</b></li>
          <li>Salve o arquivo <code>kcalix-export-YYYY-MM-DD.json</code></li>
          <li>Volte aqui e toque em <b>"Selecionar arquivo"</b></li>
        </ol>
        <p style={{ marginTop: 8, color: 'var(--text3)', fontSize: 12 }}>
          Seus dados atuais no Kcalix <b>não serão sobrescritos</b> — apenas dias sem registro serão importados.
        </p>
      </div>

      {parseError && (
        <div className="mg-error-box" style={{ marginBottom: 14 }}>
          ✗ {parseError} — certifique-se de usar o arquivo gerado pelo botão "Exportar dados completos" do Blocos Tracker.
        </div>
      )}

      <div className="btn-group">
        {/* label age como botão — o toque abre o file picker nativamente no mobile */}
        <label className="btn primary" style={{ cursor: 'pointer', textAlign: 'center' }}>
          📂 Selecionar arquivo
          <input
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={onFileChange}
          />
        </label>
        <button className="btn ghost" type="button" onClick={onClose}>
          ✕ Cancelar
        </button>
      </div>
    </>
  )
}

// ── Etapa 2: Preview ──────────────────────────────────────────────────────────

function StepPreview({
  preview,
  onImport,
  onBack,
}: {
  preview: ImportPreview
  onImport: () => void
  onBack: () => void
}) {
  const rows: Array<{ icon: string; label: string; value: number }> = [
    { icon: '📅', label: 'Dias de diário',             value: preview.diaryDays },
    { icon: '🏋️', label: 'Sessões de treino',          value: preview.workoutDays },
    { icon: '📋', label: 'Rotinas de treino',           value: preview.templates },
    { icon: '💪', label: 'Exercícios personalizados',   value: preview.customExercises },
    { icon: '📏', label: 'Dias de medições corporais',  value: preview.bodyDays },
    { icon: '✅', label: 'Dias de hábitos',             value: preview.habitDays },
    { icon: '🍎', label: 'Alimentos personalizados',    value: preview.customFoods },
    { icon: '📊', label: 'Check-ins de progresso',      value: preview.checkins },
  ].filter(r => r.value > 0)

  const period = preview.firstDate && preview.lastDate
    ? ` (${fmtDate(preview.firstDate)} → ${fmtDate(preview.lastDate)})`
    : ''

  return (
    <>
      <p className="mg-step-title" style={{ marginBottom: 4 }}>Dados encontrados{period}</p>

      <div className="mg-preview-card">
        {rows.map(r => (
          <div key={r.label} className="mg-preview-row">
            <span>{r.icon} {r.label}</span>
            <b>{r.value}</b>
          </div>
        ))}
      </div>

      <div className="mg-warn">
        ⚠️ Dados já existentes no Kcalix <b>não serão sobrescritos</b>.
        Apenas dias sem registro serão importados.
      </div>

      <div className="btn-group">
        <button className="btn primary" type="button" onClick={onImport}>
          ⬆️ Importar tudo
        </button>
        <button className="btn ghost" type="button" onClick={onBack}>
          ← Voltar
        </button>
      </div>
    </>
  )
}

// ── Etapa 3: Importando ───────────────────────────────────────────────────────

function StepImporting({ progress }: { progress: ImportProgress | null }) {
  if (!progress) return <p className="mg-step-label">Preparando...</p>

  const pct = progress.total > 0
    ? Math.round((progress.done / progress.total) * 100)
    : 0

  const label = progress.step === 'done'
    ? 'Concluído'
    : `${STEP_LABELS[progress.step]} (${progress.done}/${progress.total})`

  return (
    <>
      <p className="mg-step-title">Importando...</p>
      <div className="mg-progress-bar-wrap">
        <div className="mg-progress-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <p className="mg-step-label">{label}</p>
    </>
  )
}

// ── Etapa 4: Resultado ────────────────────────────────────────────────────────

function StepDone({
  result,
  onGoToDiary,
  onClose,
}: {
  result: { total: number; errors: string[] } | null
  onGoToDiary: () => void
  onClose: () => void
}) {
  const [errorsOpen, setErrorsOpen] = useState(false)
  if (!result) return null

  const hasErrors = result.errors.length > 0

  return (
    <div className="mg-success">
      <div className="mg-success-icon">
        {hasErrors ? '⚠️' : '✓'}
      </div>
      <p className="mg-success-title" style={{ color: hasErrors ? 'var(--warn)' : 'var(--good)' }}>
        {result.total} registros importados{hasErrors ? `, ${result.errors.length} erros` : ' com sucesso'}
      </p>
      <p className="mg-success-sub">
        {hasErrors
          ? 'A maioria dos dados foi importada. Veja os erros abaixo.'
          : 'Seus dados agora estão disponíveis em todas as abas do Kcalix.'}
      </p>

      {hasErrors && (
        <div style={{ marginBottom: 12, textAlign: 'left' }}>
          <button
            className="btn sm ghost"
            type="button"
            onClick={() => setErrorsOpen(o => !o)}
            style={{ fontSize: 12 }}
          >
            {errorsOpen ? '▲ Ocultar erros' : '▼ Ver erros'}
          </button>
          {errorsOpen && (
            <div className="mg-error-box" style={{ marginTop: 8 }}>
              {result.errors.map((e, i) => <div key={i}>{e}</div>)}
            </div>
          )}
        </div>
      )}

      <div className="btn-group">
        {!hasErrors && (
          <button className="btn primary" type="button" onClick={onGoToDiary}>
            Ir para o Diário
          </button>
        )}
        <button className="btn ghost" type="button" onClick={onClose}>
          Fechar
        </button>
      </div>
    </div>
  )
}

// ── MigrateModal ──────────────────────────────────────────────────────────────

export default function MigrateModal({ open, onClose }: Props) {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>('instructions')
  const [parseError, setParseError] = useState<string | null>(null)
  const [exportData, setExportData] = useState<FullExport | null>(null)
  const [preview, setPreview] = useState<ImportPreview | null>(null)
  const [progress, setProgress] = useState<ImportProgress | null>(null)
  const [result, setResult] = useState<{ total: number; errors: string[] } | null>(null)

  function handleClose() {
    setStep('instructions')
    setParseError(null)
    setExportData(null)
    setPreview(null)
    setProgress(null)
    setResult(null)
    onClose()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const raw = JSON.parse(ev.target?.result as string)
        const validated = validateExport(raw)
        const prev = buildPreview(validated)
        setExportData(validated)
        setPreview(prev)
        setParseError(null)
        setStep('preview')
      } catch (err) {
        setParseError(err instanceof Error ? err.message : 'Arquivo inválido')
        setStep('instructions')
      }
    }
    reader.readAsText(file, 'utf-8')
    e.target.value = ''
  }

  async function handleImport() {
    if (!exportData || !user) return
    setStep('importing')
    const transformed = transformAll(exportData)
    const res = await runImport(user.id, transformed, setProgress)
    setResult(res)
    setStep('done')
  }

  if (!open) return null

  return (
    <>
      {/* Overlay */}
      <div
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,.6)',
          zIndex: 318,
          backdropFilter: 'blur(2px)',
        }}
        onClick={step === 'importing' ? undefined : handleClose}
      />

      {/* Sheet */}
      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: 0,
        zIndex: 319,
        background: 'linear-gradient(180deg, #1a2035, #121828)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius) var(--radius) 0 0',
        maxHeight: '88dvh',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 0' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,.15)' }} />
        </div>

        {/* header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px 8px', borderBottom: '1px solid var(--line)', flexShrink: 0,
        }}>
          <b style={{ fontSize: 15, color: 'var(--text)' }}>🔄 Migrar dados do app antigo</b>
          {step !== 'importing' && (
            <button
              onClick={handleClose}
              type="button"
              style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 18, cursor: 'pointer', padding: '0 4px' }}
            >✕</button>
          )}
        </div>

        {/* body */}
        <div style={{ padding: 16, overflowY: 'auto', flex: 1 }}>
          {step === 'instructions' && (
            <StepInstructions
              onFileChange={handleFileChange}
              onClose={handleClose}
              parseError={parseError}
            />
          )}
          {step === 'preview' && preview && (
            <StepPreview
              preview={preview}
              onImport={handleImport}
              onBack={() => setStep('instructions')}
            />
          )}
          {step === 'importing' && (
            <StepImporting progress={progress} />
          )}
          {step === 'done' && (
            <StepDone
              result={result}
              onGoToDiary={() => { handleClose(); navigate('/') }}
              onClose={handleClose}
            />
          )}
        </div>

      </div>
    </>
  )
}
