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
      <div className="date-nav">
        {/* Nome da página */}
        <span className="date-nav-title">
          {pageLabel}
        </span>

        {/* Grupo direito: btn "hoje" (esq) + date-pill (dir) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Btn "hoje" — visível só quando não é hoje, à esquerda da pill */}
          <button
            onClick={goToToday}
            className="date-nav-today"
            style={{
              opacity: today ? 0 : 1,
              pointerEvents: today ? 'none' : 'auto',
            }}
          >
            hoje
          </button>
          <div className="date-pill">
            <button
              onClick={goToPrev}
            >
              ‹
            </button>

            <span style={{ fontWeight: 700, userSelect: 'none' }}>
              {formatDate(selectedDate)}
            </span>

            <button
              onClick={goToNext}
              style={{
                color: today ? 'rgba(255,255,255,.2)' : 'var(--text3)',
                cursor: today ? 'default' : 'pointer',
              }}
            >
              ›
            </button>
          </div>

        </div>
      </div>

      {/* Banner "Editando [data]" — aparece abaixo do header quando não é hoje */}
      {!today && (
        <div className="date-edit-banner">
          <span>Editando: <b>{formatBanner(selectedDate)}</b></span>
          <button
            onClick={goToToday}
          >
            Hoje
          </button>
        </div>
      )}
    </>
  )
}
