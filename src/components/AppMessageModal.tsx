import { useState } from 'react'
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
    if (n.type === 'italic') return <em key={key} style={{ color: 'var(--accent2)', fontStyle: 'italic' }}>{n.content}</em>
    if (n.type === 'code')   return <code key={key} style={{ background: 'var(--surface3)', borderRadius: 4, padding: '1px 6px', fontSize: 12, color: 'var(--accent2)', fontFamily: 'monospace' }}>{n.content}</code>
    return <span key={key}>{n.content}</span>
  })
}

export function MarkdownBody({ text, style }: { text: string; style?: React.CSSProperties }) {
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
      {/* Opções de múltipla escolha */}
      {options.map(opt => {
        const isSelected = selected === opt
        return (
          <button
            key={opt}
            type="button"
            onClick={() => !adminMode && onSelect(opt)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px',
              borderRadius: 10,
              border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--line)'}`,
              background: isSelected ? 'rgba(124,92,255,.15)' : 'var(--surface)',
              color: isSelected ? 'var(--accent2)' : 'var(--text2)',
              fontSize: 14, fontWeight: isSelected ? 600 : 400,
              cursor: adminMode ? 'default' : 'pointer',
              transition: 'all .15s',
              textAlign: 'left',
              fontFamily: 'var(--font)',
            }}
          >
            {/* Radio visual */}
            <span style={{
              width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
              border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--line)'}`,
              background: isSelected ? 'var(--accent)' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all .15s',
            }}>
              {isSelected && (
                <span style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: '#fff', display: 'block',
                }} />
              )}
            </span>
            {opt}
          </button>
        )
      })}

      {/* Pergunta aberta (se configurada) */}
      {openQuestion && (
        <div style={{ marginTop: 4 }}>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 6, fontWeight: 600 }}>
            {openQuestion}
          </div>
          <textarea
            rows={2}
            value={comment}
            onChange={e => onComment(e.target.value)}
            placeholder="Opcional..."
            disabled={adminMode}
            style={{
              width: '100%', boxSizing: 'border-box',
              background: 'var(--surface2)', border: '1px solid var(--line)',
              borderRadius: 8, color: 'var(--text)',
              padding: '8px 10px', fontSize: 13, outline: 'none',
              fontFamily: 'var(--font)', resize: 'none', lineHeight: 1.5,
              opacity: adminMode ? 0.5 : 1,
            }}
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
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 350,
        }}
      />

      {/* Card centralizado */}
      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'min(340px, calc(100vw - 32px))',
        maxHeight: 'calc(100dvh - 48px)',
        overflowY: 'auto',
        background: 'linear-gradient(180deg, #1a2035, #121828)',
        border: '1px solid rgba(124,92,255,.25)',
        borderRadius: 20,
        boxShadow: '0 24px 64px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.04)',
        zIndex: 351,
        overflow: 'hidden',
      }}>

        {/* Botão fechar */}
        <button
          onClick={() => onDismiss()}
          style={{
            position: 'absolute', top: 12, right: 12,
            width: 28, height: 28, borderRadius: '50%',
            background: 'var(--surface2)',
            border: '1px solid var(--line)',
            color: 'var(--text3)',
            fontSize: 14, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            lineHeight: 1,
            zIndex: 1,
          }}
        >
          ✕
        </button>

        {/* Imagem (se houver) */}
        {message.image_url && (
          <img
            src={message.image_url}
            alt=""
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
            style={{
              width: '100%', maxHeight: 180,
              objectFit: 'cover', display: 'block',
            }}
          />
        )}

        {/* Corpo */}
        <div style={{ padding: message.image_url ? '24px 24px 24px' : '32px 24px 24px', textAlign: 'center' }}>
          {/* Emoji */}
          <div style={{ fontSize: 52, lineHeight: 1, marginBottom: 16 }}>
            {message.emoji}
          </div>

          {/* Título */}
          <div style={{
            fontSize: 18, fontWeight: 700, color: 'var(--text)',
            marginBottom: 14, lineHeight: 1.3,
          }}>
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
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 8 }}>
              Selecione uma opção para responder
            </div>
          )}
        </div>
      </div>
    </>
  )
}
