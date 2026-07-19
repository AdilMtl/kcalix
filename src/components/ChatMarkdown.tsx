import { Fragment } from 'react'
import type { ReactNode } from 'react'

// Renderiza um subconjunto SEGURO de markdown das respostas do Coach:
// **negrito**, listas com "- " (ou "• "), e parágrafos separados por linha em branco.
// JSX puro — nunca dangerouslySetInnerHTML. Qualquer entrada maliciosa vira texto literal.
// Contrato alinhado com o system prompt da Edge Function (ai-chat): o modelo só
// emite negrito, listas e parágrafos — nada de títulos, tabelas, código ou links.

// Divide um trecho por **...**; as partes ímpares são negrito.
function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const parts = text.split(/\*\*(.+?)\*\*/g)
  return parts.map((part, i) =>
    i % 2 === 1
      ? <strong key={`${keyPrefix}-b${i}`}>{part}</strong>
      : <Fragment key={`${keyPrefix}-t${i}`}>{part}</Fragment>,
  )
}

export function ChatMarkdown({ content }: { content: string }) {
  const blocks: ReactNode[] = []
  let listItems: string[] = []
  let paraLines: string[] = []
  let key = 0

  const flushList = () => {
    if (!listItems.length) return
    const items = [...listItems]
    const k = key++
    blocks.push(
      <ul key={`ul${k}`} className="cm-list">
        {items.map((it, i) => <li key={i}>{renderInline(it, `ul${k}-${i}`)}</li>)}
      </ul>,
    )
    listItems = []
  }

  const flushPara = () => {
    if (!paraLines.length) return
    const lines = [...paraLines]
    const k = key++
    blocks.push(
      <p key={`p${k}`} className="cm-p">
        {lines.map((ln, i) => (
          <Fragment key={i}>
            {i > 0 && <br />}
            {renderInline(ln, `p${k}-${i}`)}
          </Fragment>
        ))}
      </p>,
    )
    paraLines = []
  }

  for (const raw of content.split('\n')) {
    const line = raw.replace(/\s+$/, '')
    const listMatch = line.match(/^\s*[-•]\s+(.*)$/)
    if (listMatch) {
      flushPara()
      listItems.push(listMatch[1])
    } else if (line.trim() === '') {
      flushList()
      flushPara()
    } else {
      flushList()
      paraLines.push(line)
    }
  }
  flushList()
  flushPara()

  return <>{blocks}</>
}
