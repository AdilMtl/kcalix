import { useNavigate, useLocation } from 'react-router-dom'
import { KcalixIcon, type KcalixIconName } from './icons/KcalixIcon'

export const NAV_TABS = [
  { path: '/home',   label: 'Home',   icon: 'home' },
  { path: '/diario', label: 'Diário', icon: 'diary' },
  { path: '/treino', label: 'Treino', icon: 'workout' },
  { path: '/corpo',  label: 'Corpo',  icon: 'body' },
  { path: '/mais',   label: 'Mais',   icon: 'more' },
] as const satisfies ReadonlyArray<{ path: string; label: string; icon: KcalixIconName }>

interface Props {
  activePath?: string
  onNavigate?: (path: string) => void
}

export default function Nav({ activePath, onNavigate }: Props = {}) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const selectedPath = activePath ?? pathname

  return (
    <nav
      className="bottom-nav fixed bottom-0 left-0 right-0 z-50 flex"
    >
      {NAV_TABS.map(({ path, label, icon }) => {
        const active = selectedPath === path
        return (
          <button
            key={path}
            onClick={() => onNavigate ? onNavigate(path) : navigate(path)}
            className={`bottom-nav-btn flex flex-1 flex-col items-center justify-center gap-1 transition-opacity active:opacity-70 ${active ? 'active' : ''}`}
            aria-label={label}
          >
            <span className="bottom-nav-icon" aria-hidden="true">
              <KcalixIcon name={icon} size={28} />
            </span>
            <span className="text-[10px] font-medium leading-none">{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
