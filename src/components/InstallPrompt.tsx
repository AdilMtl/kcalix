// InstallPrompt.tsx — Banner de instalação PWA
// Android: usa evento beforeinstallprompt (nativo)
// iOS/Safari: mostra instrução manual (não tem API nativa)

import { useEffect, useRef, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'kcalix_install_dismissed'
const DISMISS_DAYS = 7

function isDismissed(): boolean {
  const ts = localStorage.getItem(DISMISS_KEY)
  if (!ts) return false
  const days = (Date.now() - Number(ts)) / (1000 * 60 * 60 * 24)
  return days < DISMISS_DAYS
}

function isIOS(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function isInStandaloneMode(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as { standalone?: boolean }).standalone === true
}

export function InstallPrompt() {
  const [showAndroid, setShowAndroid] = useState(false)
  const [showIOS, setShowIOS] = useState(false)
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    if (isInStandaloneMode() || isDismissed()) return

    if (isIOS()) {
      setShowIOS(true)
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      deferredPrompt.current = e as BeforeInstallPromptEvent
      setShowAndroid(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  function handleInstallAndroid() {
    if (!deferredPrompt.current) return
    deferredPrompt.current.prompt()
    deferredPrompt.current.userChoice.then(() => {
      deferredPrompt.current = null
      setShowAndroid(false)
    })
  }

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
    setShowAndroid(false)
    setShowIOS(false)
  }

  const bannerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 72, // acima da Nav bar
    left: 12,
    right: 12,
    zIndex: 400,
    background: 'linear-gradient(135deg, #1e1540, #2a1f6b)',
    border: '1px solid rgba(124,92,255,0.4)',
    borderRadius: 16,
    padding: '14px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
  }

  if (showAndroid) {
    return (
      <div style={bannerStyle}>
        <span style={{ fontSize: 28 }}>📲</span>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>Instalar o Kcalix</div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2 }}>
            Adicionar à tela inicial para acesso rápido
          </div>
        </div>
        <button
          onClick={handleInstallAndroid}
          style={{
            background: '#7c5cff',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            padding: '8px 14px',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Instalar
        </button>
        <button
          onClick={handleDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.4)',
            fontSize: 20,
            cursor: 'pointer',
            padding: '0 4px',
            lineHeight: 1,
          }}
          aria-label="Fechar"
        >
          ×
        </button>
      </div>
    )
  }

  if (showIOS) {
    return (
      <div style={bannerStyle}>
        <span style={{ fontSize: 24 }}>📲</span>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>
            Instalar o Kcalix no iPhone
          </div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 3, lineHeight: 1.4 }}>
            Toque em{' '}
            <span style={{ color: '#a78bfa', fontWeight: 600 }}>
              Compartilhar <span style={{ fontSize: 14 }}>⬆</span>
            </span>{' '}
            e depois em{' '}
            <span style={{ color: '#a78bfa', fontWeight: 600 }}>"Adicionar à Tela de Início"</span>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.4)',
            fontSize: 20,
            cursor: 'pointer',
            padding: '0 4px',
            lineHeight: 1,
            alignSelf: 'flex-start',
          }}
          aria-label="Fechar"
        >
          ×
        </button>
      </div>
    )
  }

  return null
}
