import { useLocation } from 'react-router-dom'
import { useDateStore } from '../store/dateStore'

const PAGE_LABELS: Record<string, string> = {
  '/home':   'Home',
  '/diario': 'Diário',
  '/treino': 'Treino',
  '/corpo':  'Corpo',
  '/mais':   'Mais',
}

// Formata "2026-03-08" → "Dom, 08/03"
function formatDate(iso: string): string {
  const [y, mo, dy] = iso.split('-').map(Number)
  const d = new Date(y, mo - 1, dy)
  const weekday = d.toLocaleDateString('pt-BR', { weekday: 'short' })
  const cap = weekday.charAt(0).toUpperCase() + weekday.slice(1).replace('.', '')
  return `${cap}, ${String(dy).padStart(2, '0')}/${String(mo).padStart(2, '0')}`
}

// Formata para o banner: "dom., 08 de mar."
function formatBanner(iso: string): string {
  const [y, mo, dy] = iso.split('-').map(Number)
  const d = new Date(y, mo - 1, dy)
  const today = new Date()
  const sameYear = d.getFullYear() === today.getFullYear()
  return d.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    ...(sameYear ? {} : { year: 'numeric' }),
  })
}

export default function DateNavBar() {
  const { pathname } = useLocation()
  const { selectedDate, goToPrev, goToNext, goToToday, isToday } = useDateStore()
  const today = isToday()
  const pageLabel = PAGE_LABELS[pathname] ?? 'Kcalix'

  return (
    <>
      {/* Header: nome da página (esq) + date-pill (dir) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: '1px solid var(--line)',
        background: 'var(--bg)',
      }}>
        {/* Nome da página */}
        <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>
          {pageLabel}
        </span>

        {/* Grupo direito: btn "hoje" (esq) + date-pill (dir) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Btn "hoje" — visível só quando não é hoje, à esquerda da pill */}
          <button
            onClick={goToToday}
            style={{
              fontSize: '10px',
              fontWeight: 700,
              fontFamily: 'var(--font)',
              color: 'var(--accent2)',
              background: 'rgba(167,139,250,.08)',
              border: '1px solid rgba(167,139,250,.18)',
              borderRadius: '999px',
              padding: '4px 9px',
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
              whiteSpace: 'nowrap',
              opacity: today ? 0 : 1,
              pointerEvents: today ? 'none' : 'auto',
              transition: 'opacity .2s',
            }}
          >
            hoje
          </button>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--surface2)',
            border: '1px solid var(--line)',
            borderRadius: '999px',
            padding: '6px 12px',
            fontSize: '12px',
            color: 'var(--text)',
            backdropFilter: 'blur(12px)',
          }}>
            <button
              onClick={goToPrev}
              style={{
                background: 'transparent',
                border: 0,
                color: 'var(--text3)',
                fontSize: '15px',
                fontWeight: 700,
                lineHeight: 1,
                padding: '0 3px',
                cursor: 'pointer',
                minWidth: '20px',
                textAlign: 'center',
                flexShrink: 0,
                fontFamily: 'var(--font)',
              }}
            >
              ‹
            </button>

            <span style={{ fontWeight: 600, userSelect: 'none' }}>
              {formatDate(selectedDate)}
            </span>

            <button
              onClick={goToNext}
              style={{
                background: 'transparent',
                border: 0,
                color: today ? 'rgba(255,255,255,.2)' : 'var(--text3)',
                fontSize: '15px',
                fontWeight: 700,
                lineHeight: 1,
                padding: '0 3px',
                cursor: today ? 'default' : 'pointer',
                minWidth: '20px',
                textAlign: 'center',
                flexShrink: 0,
                fontFamily: 'var(--font)',
              }}
            >
              ›
            </button>
          </div>

        </div>
      </div>

      {/* Banner "Editando [data]" — aparece abaixo do header quando não é hoje */}
      {!today && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          background: 'rgba(124,92,255,.10)',
          border: '1px solid rgba(124,92,255,.20)',
          borderRadius: 'var(--radius-xs)',
          padding: '8px 12px',
          margin: '8px 16px 0',
          fontSize: '12px',
          color: 'var(--accent2)',
        }}>
          <span>📅 Editando: <b>{formatBanner(selectedDate)}</b></span>
          <button
            onClick={goToToday}
            style={{
              background: 'transparent',
              border: 0,
              color: 'var(--accent2)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              padding: 0,
              whiteSpace: 'nowrap',
              fontFamily: 'var(--font)',
            }}
          >
            → Hoje
          </button>
        </div>
      )}
    </>
  )
}
