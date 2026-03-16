import { useRegisterSW } from 'virtual:pwa-register/react'

export function UpdateToast() {
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: 'var(--accent)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.65rem 1rem',
        fontSize: '0.875rem',
        fontWeight: 500,
      }}
    >
      <span>🔄 Nova versão disponível</span>
      <button
        onClick={() => updateServiceWorker(true)}
        style={{
          background: 'rgba(255,255,255,0.2)',
          border: 'none',
          borderRadius: '9999px',
          color: '#fff',
          fontWeight: 700,
          padding: '0.3rem 0.9rem',
          cursor: 'pointer',
          fontSize: '0.85rem',
        }}
      >
        Atualizar
      </button>
    </div>
  )
}
