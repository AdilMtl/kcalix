import { useState, type CSSProperties } from 'react'
import type { AppMessage } from '../hooks/useAppMessage'

interface Props {
  message: AppMessage
  onDismiss: (answer?: string, comment?: string) => void
  adminMode?: boolean   // true = botão "Fechar" em vez de "Entendido ✓"
}

// ── Parser Markdown leve ──────────────────────────────────────────────────────
// Suporta: **negrito**, *itálico*, `código`, quebras de linha
// Seguro: nunca usa dangerouslySetInnerHTML — retorna nós React

type InlineNode = { type: 'bold' | 'italic' | 'code' | 'text'; content: string }

function parseInline(text: string): InlineNode[] {
  const nodes: InlineNode[] = []
  const re = /\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push({ type: 'text', content: text.slice(last, m.index) })
    if (m[1] !== undefined) nodes.push({ type: 'bold',   content: m[1] })
    else if (m[2] !== undefined) nodes.push({ type: 'italic', content: m[2] })
    else if (m[3] !== undefined) nodes.push({ type: 'code',   content: m[3] })
    last = m.index + m[0].length
  }
  if (last < text.length) nodes.push({ type: 'text', content: text.slice(last) })
  return nodes
}

function renderInline(nodes: InlineNode[], keyPrefix: string) {
  return nodes.map((n, i) => {
    const key = `${keyPrefix}-${i}`
    if (n.type === 'bold')   return <strong key={key} style={{ color: 'var(--text)', fontWeight: 700 }}>{n.content}</strong>
    if (n.type === 'italic') return <em key={key} style={{ color: 'var(--energy)', fontStyle: 'italic' }}>{n.content}</em>
    if (n.type === 'code')   return <code key={key} style={{ background: 'var(--surface3)', borderRadius: 4, padding: '1px 6px', fontSize: 12, color: 'var(--energy)', fontFamily: 'monospace' }}>{n.content}</code>
    return <span key={key}>{n.content}</span>
  })
}

export function MarkdownBody({ text, style }: { text: string; style?: CSSProperties }) {
  const lines = text.split('\n')
  return (
    <div style={{ textAlign: 'left', ...style }}>
      {lines.map((line, i) => {
        if (line.trim() === '') return <div key={i} style={{ height: '0.6em' }} />
        const nodes = parseInline(line)
        return (
          <div key={i} style={{ marginBottom: 2 }}>
            {renderInline(nodes, String(i))}
          </div>
        )
      })}
    </div>
  )
}

// ── SurveyBody — parte interativa do modal de enquete ─────────────────────────

function SurveyBody({
  options,
  openQuestion,
  selected,
  comment,
  onSelect,
  onComment,
  adminMode,
}: {
  options: string[]
  openQuestion?: string
  selected: string
  comment: string
  onSelect: (v: string) => void
  onComment: (v: string) => void
  adminMode: boolean
}) {
  return (
    <div className="app-msg-survey">
      {/* Opções de múltipla escolha */}
      {options.map(opt => {
        const isSelected = selected === opt
        return (
          <button
            key={opt}
            type="button"
            onClick={() => !adminMode && onSelect(opt)}
            className={`app-msg-option${isSelected ? ' active' : ''}${adminMode ? ' readonly' : ''}`}
          >
            {/* Radio visual */}
            <span className="app-msg-radio">
              {isSelected && (
                <span />
              )}
            </span>
            {opt}
          </button>
        )
      })}

      {/* Pergunta aberta (se configurada) */}
      {openQuestion && (
        <div className="app-msg-open">
          <div>{openQuestion}</div>
          <textarea
            rows={2}
            value={comment}
            onChange={e => onComment(e.target.value)}
            placeholder="Opcional..."
            disabled={adminMode}
          />
        </div>
      )}
    </div>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────

export default function AppMessageModal({ message, onDismiss, adminMode = false }: Props) {
  const isSurvey = message.message_type === 'survey'
  const meta = message.metadata as { options?: string[]; open_question?: string }
  const options = meta.options ?? []
  const openQuestion = meta.open_question

  const [selected, setSelected] = useState('')
  const [comment, setComment]   = useState('')

  function handleSubmit() {
    if (isSurvey && !adminMode) {
      onDismiss(selected || undefined, comment || undefined)
    } else {
      onDismiss()
    }
  }

  const canSubmit = adminMode || !isSurvey || selected !== ''

  return (
    <>
      {/* Overlay */}
      <div
        onClick={adminMode ? undefined : handleSubmit}
        className="app-msg-overlay"
      />

      {/* Card centralizado */}
      <div className="app-msg-card">

        {/* Botão fechar */}
        <button
          onClick={() => onDismiss()}
          className="app-msg-close"
          aria-label="Fechar"
        >
          ✕
        </button>

        {/* Imagem (se houver) */}
        {message.image_url && (
          <img
            src={message.image_url}
            alt=""
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
            className="app-msg-image"
          />
        )}

        {/* Corpo */}
        <div className={`app-msg-body${message.image_url ? ' has-image' : ''}`}>
          {/* Emoji */}
          <div className="app-msg-emoji">
            {message.emoji}
          </div>

          {/* Título */}
          <div className="app-msg-title">
            {message.title}
          </div>

          {/* Corpo com Markdown */}
          {message.body && (
            <MarkdownBody
              text={message.body}
              style={{
                fontSize: 14, color: 'var(--text2)',
                lineHeight: 1.75,
                marginBottom: isSurvey ? 20 : 24,
              }}
            />
          )}

          {/* Opções de enquete */}
          {isSurvey && options.length > 0 && (
            <SurveyBody
              options={options}
              openQuestion={openQuestion}
              selected={selected}
              comment={comment}
              onSelect={setSelected}
              onComment={setComment}
              adminMode={adminMode}
            />
          )}

          {/* Botão de ação */}
          <button
            className={adminMode ? 'btn ghost' : 'btn primary'}
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{ width: '100%', opacity: canSubmit ? 1 : 0.5 }}
          >
            {adminMode
              ? 'Fechar'
              : isSurvey
                ? 'Responder ✓'
                : 'Entendido ✓'}
          </button>

          {/* Dica sutil para survey sem seleção */}
          {isSurvey && !adminMode && !selected && (
            <div className="app-msg-hint">
              Selecione uma opção para responder
            </div>
          )}
        </div>
      </div>
    </>
  )
}
