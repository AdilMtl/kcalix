import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  message: string
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Futuramente: Sentry.captureException(error, { extra: info })
    console.error('[ErrorBoundary]', error, info)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (!this.state.hasError) return this.props.children

    const isDev = import.meta.env.DEV

    return (
      <div
        style={{
          minHeight: '100dvh',
          background: 'var(--bg)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          gap: '1rem',
          color: '#e2e8f0',
          textAlign: 'center',
        }}
      >
        <span style={{ fontSize: '2.5rem' }}>⚠️</span>
        <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>Algo deu errado</p>
        {isDev && this.state.message && (
          <p
            style={{
              fontSize: '0.75rem',
              color: '#f87171',
              fontFamily: 'monospace',
              maxWidth: '360px',
              wordBreak: 'break-word',
            }}
          >
            {this.state.message}
          </p>
        )}
        <button
          onClick={this.handleReload}
          style={{
            marginTop: '0.5rem',
            padding: '0.6rem 1.6rem',
            borderRadius: '9999px',
            background: 'var(--accent)',
            color: '#fff',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.95rem',
          }}
        >
          Recarregar
        </button>
      </div>
    )
  }
}
