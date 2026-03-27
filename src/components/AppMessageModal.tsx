import type { AppMessage } from '../hooks/useAppMessage'

interface Props {
  message: AppMessage
  onDismiss: () => void
  adminMode?: boolean   // true = botão "Fechar" em vez de "Entendido ✓"
}

// ── Parser Markdown leve ──────────────────────────────────────────────────────
// Suporta: **negrito**, *itálico*, `código`, quebras de linha
// Seguro: nunca usa dangerouslySetInnerHTML — retorna nós React

type InlineNode = { type: 'bold' | 'italic' | 'code' | 'text'; content: string }

function parseInline(text: string): InlineNode[] {
  const nodes: InlineNode[] = []
  // Regex: **bold** | *italic* | `code`
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

// ── Modal ─────────────────────────────────────────────────────────────────────

export default function AppMessageModal({ message, onDismiss, adminMode = false }: Props) {
  return (
    <>
      {/* Overlay */}
      <div
        onClick={onDismiss}
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
        background: 'linear-gradient(180deg, #1a2035, #121828)',
        border: '1px solid rgba(124,92,255,.25)',
        borderRadius: 20,
        boxShadow: '0 24px 64px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.04)',
        zIndex: 351,
        overflow: 'hidden',
      }}>

        {/* Botão fechar */}
        <button
          onClick={onDismiss}
          style={{
            position: 'absolute', top: 12, right: 12,
            width: 28, height: 28, borderRadius: '50%',
            background: 'var(--surface2)',
            border: '1px solid var(--line)',
            color: 'var(--text3)',
            fontSize: 14, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            lineHeight: 1,
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
          <MarkdownBody
            text={message.body}
            style={{
              fontSize: 14, color: 'var(--text2)',
              lineHeight: 1.75, marginBottom: 24,
            }}
          />

          {/* Botão confirmar */}
          <button
            className={adminMode ? 'btn ghost' : 'btn primary'}
            onClick={onDismiss}
            style={{ width: '100%' }}
          >
            {adminMode ? 'Fechar' : 'Entendido ✓'}
          </button>
        </div>
      </div>
    </>
  )
}
