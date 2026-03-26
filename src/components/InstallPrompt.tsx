// InstallPrompt.tsx — Prompt de instalação PWA
// Android: usa evento beforeinstallprompt (nativo, botão automático)
// iOS Safari: bottom sheet visual com passo a passo
// iOS Chrome/Firefox: instrução para abrir no Safari
// Timing: aparece 2s após onboarding concluído (não na primeira tela)

import { useEffect, useRef, useState } from 'react'
import { useInstallStore } from '../store/installStore'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY    = 'kcalix_install_dismissed'
const PERMANENT_KEY  = 'kcalix_install_never'
const DISMISS_DAYS   = 7

function isDismissed(): boolean {
  if (localStorage.getItem(PERMANENT_KEY)) return true
  const ts = localStorage.getItem(DISMISS_KEY)
  if (!ts) return false
  return (Date.now() - Number(ts)) / 86400000 < DISMISS_DAYS
}

function isInStandaloneMode(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as { standalone?: boolean }).standalone === true
  )
}

function isIOS(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

// Safari no iOS: não tem "CriOS" nem "FxiOS" no UA
function isIOSSafari(): boolean {
  const ua = navigator.userAgent
  return isIOS() && !ua.includes('CriOS') && !ua.includes('FxiOS') && !ua.includes('EdgiOS')
}

function isIOSOtherBrowser(): boolean {
  return isIOS() && !isIOSSafari()
}

// SVG do ícone de compartilhar do Safari (idêntico ao real)
function ShareIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.59 5.41L12 2l3.41 3.41" />
      <line x1="12" y1="2" x2="12" y2="15" />
      <path d="M6 8H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h-2" />
    </svg>
  )
}

function AddToHomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  )
}

export function InstallPrompt() {
  const [mode, setMode] = useState<'android' | 'ios-safari' | 'ios-other' | null>(null)
  const deferredPrompt  = useRef<BeforeInstallPromptEvent | null>(null)
  const { wizardJustFinished, clearTrigger } = useInstallStore()

  // Captura evento Android (pode chegar antes do trigger do wizard)
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      deferredPrompt.current = e as BeforeInstallPromptEvent
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  // Aparece 2s após o wizard de onboarding fechar com sucesso
  useEffect(() => {
    if (!wizardJustFinished) return
    clearTrigger()

    if (isInStandaloneMode() || isDismissed()) return

    const timer = setTimeout(() => {
      if (deferredPrompt.current) {
        setMode('android')
      } else if (isIOSSafari()) {
        setMode('ios-safari')
      } else if (isIOSOtherBrowser()) {
        setMode('ios-other')
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [wizardJustFinished, clearTrigger])

  function handleInstallAndroid() {
    if (!deferredPrompt.current) return
    deferredPrompt.current.prompt()
    deferredPrompt.current.userChoice.then(() => {
      deferredPrompt.current = null
      setMode(null)
    })
  }

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
    setMode(null)
  }

  function handleNeverShow() {
    localStorage.setItem(PERMANENT_KEY, '1')
    setMode(null)
  }

  if (!mode) return null

  // ── Android ──────────────────────────────────────────────────────────────
  if (mode === 'android') {
    return (
      <div style={{
        position: 'fixed', bottom: 'calc(72px + env(safe-area-inset-bottom))',
        left: 12, right: 12, zIndex: 400,
        background: 'linear-gradient(135deg, #1e1540, #2a1f6b)',
        border: '1px solid rgba(124,92,255,0.4)',
        borderRadius: 16, padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: 12,
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}>
        <span style={{ fontSize: 28 }}>📲</span>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>Instalar o Kcalix</div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2 }}>
            Acesso rápido direto da tela inicial
          </div>
        </div>
        <button
          onClick={handleInstallAndroid}
          style={{
            background: '#7c5cff', color: '#fff', border: 'none',
            borderRadius: 10, padding: '8px 14px',
            fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
          }}
        >
          Instalar
        </button>
        <button onClick={handleDismiss} style={{
          background: 'none', border: 'none',
          color: 'rgba(255,255,255,0.4)', fontSize: 20, cursor: 'pointer', padding: '0 4px', lineHeight: 1,
        }} aria-label="Fechar">×</button>
      </div>
    )
  }

  // ── iOS — outro browser (Chrome, Firefox) ─────────────────────────────────
  if (mode === 'ios-other') {
    return (
      <div style={{
        position: 'fixed', bottom: 'calc(72px + env(safe-area-inset-bottom))',
        left: 12, right: 12, zIndex: 400,
        background: 'linear-gradient(135deg, #1e1540, #2a1f6b)',
        border: '1px solid rgba(124,92,255,0.4)',
        borderRadius: 16, padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: 12,
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}>
        <span style={{ fontSize: 26 }}>🧭</span>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>Instale pelo Safari</div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2, lineHeight: 1.4 }}>
            Abra <span style={{ color: '#a78bfa', fontWeight: 600 }}>kcalix.vercel.app</span> no Safari para instalar na tela inicial
          </div>
        </div>
        <button onClick={handleDismiss} style={{
          background: 'none', border: 'none',
          color: 'rgba(255,255,255,0.4)', fontSize: 20, cursor: 'pointer', padding: '0 4px', lineHeight: 1,
          alignSelf: 'flex-start',
        }} aria-label="Fechar">×</button>
      </div>
    )
  }

  // ── iOS Safari — bottom sheet completo ────────────────────────────────────
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleDismiss}
        style={{
          position: 'fixed', inset: 0, zIndex: 410,
          background: 'rgba(0,0,0,0.5)',
        }}
      />

      {/* Sheet */}
      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 411,
        background: 'linear-gradient(180deg, #1a2035, #121828)',
        borderRadius: '20px 20px 0 0',
        borderTop: '1px solid rgba(124,92,255,0.3)',
        padding: '20px 24px',
        paddingBottom: 'calc(28px + env(safe-area-inset-bottom))',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.6)',
      }}>
        {/* Handle */}
        <div style={{
          width: 36, height: 4, borderRadius: 2,
          background: 'rgba(255,255,255,0.15)',
          margin: '0 auto 20px',
        }} />

        {/* Cabeçalho */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <img
            src="/icon-192.png"
            alt="Kcalix"
            style={{ width: 52, height: 52, borderRadius: 12, flexShrink: 0 }}
          />
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 17 }}>Instalar o Kcalix</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 2 }}>
              Adicione à tela inicial — acesso offline
            </div>
          </div>
        </div>

        {/* Passos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>

          {/* Passo 1 */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14,
            background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '12px 14px',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
              background: 'rgba(0,122,255,0.15)', border: '1px solid rgba(0,122,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ShareIcon />
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>
                Toque em <span style={{ color: '#60a5fa' }}>Compartilhar</span>
              </div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, marginTop: 2 }}>
                Ícone da barra inferior do Safari
              </div>
            </div>
            <div style={{
              marginLeft: 'auto', fontSize: 20,
              animation: 'bounce-down 1.5s ease-in-out infinite',
            }}>⬇</div>
          </div>

          {/* Passo 2 */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14,
            background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '12px 14px',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8, flexShrink: 0,
              background: 'rgba(124,92,255,0.15)', border: '1px solid rgba(124,92,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--accent2)',
            }}>
              <AddToHomeIcon />
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>
                Toque em <span style={{ color: '#a78bfa' }}>"Adicionar à Tela de Início"</span>
              </div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, marginTop: 2 }}>
                Role o menu do Safari para encontrar
              </div>
            </div>
          </div>

          {/* Passo 3 */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14,
            background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '12px 14px',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
              background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18,
            }}>
              ✓
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>
                Toque em <span style={{ color: '#34d399' }}>"Adicionar"</span> no canto superior direito
              </div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, marginTop: 2 }}>
                O Kcalix aparece na sua tela inicial
              </div>
            </div>
          </div>
        </div>

        {/* Botões */}
        <button
          onClick={handleDismiss}
          style={{
            width: '100%', padding: '13px', borderRadius: 12,
            background: 'rgba(124,92,255,0.2)', border: '1px solid rgba(124,92,255,0.35)',
            color: '#a78bfa', fontSize: 15, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'var(--font)', marginBottom: 10,
          }}
        >
          Ok, vou fazer isso agora
        </button>
        <button
          onClick={handleNeverShow}
          style={{
            width: '100%', padding: '10px',
            background: 'none', border: 'none',
            color: 'rgba(255,255,255,0.3)', fontSize: 13, cursor: 'pointer',
            fontFamily: 'var(--font)',
          }}
        >
          Não mostrar novamente
        </button>
      </div>

      <style>{`
        @keyframes bounce-down {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(4px); }
        }
      `}</style>
    </>
  )
}
