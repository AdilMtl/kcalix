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
        background: 'var(--surface)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.65rem 1rem',
        borderBottom: '1px solid var(--line)',
        fontSize: '0.875rem',
        fontWeight: 700,
        boxShadow: 'var(--shadow)',
      }}
    >
      <span>Nova versão disponível</span>
      <button
        onClick={() => updateServiceWorker(true)}
        style={{
          background: 'var(--gradient-action)',
          border: '1px solid color-mix(in srgb, var(--ember) 42%, white)',
          borderRadius: '8px',
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
