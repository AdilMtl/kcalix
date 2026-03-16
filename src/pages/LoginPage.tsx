import { useState, type FormEvent } from 'react'
import { signInWithEmail, resetPassword } from '../lib/auth'

type Mode = 'login' | 'reset'

// ── Logo ─────────────────────────────────────────────────────────────────────

function KcalixLogo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <img
        src="/icon-192.png"
        alt="Kcalix"
        style={{
          width: 72, height: 72, borderRadius: 20,
          boxShadow: '0 8px 32px rgba(124,92,255,.35)',
        }}
      />
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--text)', lineHeight: 1 }}>
          Kcalix
        </div>
        <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4, fontWeight: 500 }}>
          Nutrição · Treino · Evolução
        </div>
      </div>
    </div>
  )
}

// ── Input estilizado ──────────────────────────────────────────────────────────

function Field({
  id, label, type, value, onChange, placeholder, autoComplete,
}: {
  id: string; label: string; type: string; value: string
  onChange: (v: string) => void; placeholder: string; autoComplete?: string
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label htmlFor={id} style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        required
        autoComplete={autoComplete}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        style={{
          background: 'var(--surface2)',
          border: `1.5px solid ${focused ? 'var(--accent)' : 'var(--line)'}`,
          borderRadius: 12,
          color: 'var(--text)',
          padding: '12px 14px',
          fontSize: 15,
          outline: 'none',
          fontFamily: 'var(--font)',
          transition: 'border-color .15s',
          width: '100%',
          boxShadow: focused ? '0 0 0 3px rgba(124,92,255,.12)' : 'none',
        }}
      />
    </div>
  )
}

// ── LoginPage ─────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const desativado = sessionStorage.getItem('kcx_desativado') === '1'
  if (desativado) sessionStorage.removeItem('kcx_desativado')

  const [mode, setMode]       = useState<Mode>('login')
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleLogin(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await signInWithEmail(email, password)
    if (error) setError('Email ou senha incorretos. Verifique seus dados.')
    setLoading(false)
  }

  async function handleReset(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await resetPassword(email)
    if (error) {
      setError('Não foi possível enviar o email. Tente novamente.')
    } else {
      setSuccess('Email enviado! Verifique sua caixa de entrada e clique no link para criar sua senha.')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
    }}>
      <div style={{ width: '100%', maxWidth: 360 }}>

        {/* Logo */}
        <div style={{ marginBottom: 32 }}>
          <KcalixLogo />
        </div>

        {/* Banner: conta desativada */}
        {desativado && (
          <div style={{
            marginBottom: 16, padding: '10px 14px', borderRadius: 12, textAlign: 'center',
            fontSize: 13, fontWeight: 500,
            background: 'rgba(248,113,113,.1)', border: '1px solid rgba(248,113,113,.25)',
            color: 'var(--bad)',
          }}>
            🚫 Sua conta foi desativada. Entre em contato com o administrador.
          </div>
        )}

        {/* Card */}
        <div style={{
          background: 'linear-gradient(180deg, rgba(18,24,38,.95), rgba(14,20,34,.95))',
          border: '1px solid var(--line)',
          borderRadius: 20,
          padding: 24,
          boxShadow: '0 16px 48px rgba(0,0,0,.5)',
        }}>

          {/* Título do modo */}
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
              {mode === 'login' ? 'Entrar na conta' : 'Recuperar acesso'}
            </h2>
            <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>
              {mode === 'login'
                ? 'Acesso restrito — somente convidados'
                : 'Enviaremos um link para criar sua senha'}
            </p>
          </div>

          {mode === 'login' ? (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Field
                id="email" label="Email" type="email"
                autoComplete="email" value={email}
                onChange={setEmail} placeholder="seu@email.com"
              />
              <Field
                id="password" label="Senha" type="password"
                autoComplete="current-password" value={password}
                onChange={setPassword} placeholder="••••••••"
              />

              {error && (
                <div style={{
                  padding: '9px 12px', borderRadius: 10, fontSize: 13,
                  background: 'rgba(248,113,113,.1)', border: '1px solid rgba(248,113,113,.2)',
                  color: 'var(--bad)',
                }}>
                  ❌ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn primary"
                style={{ width: '100%', marginTop: 4, fontSize: 14, minHeight: 48 }}
              >
                {loading ? '⏳ Entrando…' : 'Entrar'}
              </button>

              <button
                type="button"
                onClick={() => { setMode('reset'); setError(null) }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--font)',
                  textAlign: 'center', padding: '4px 0',
                }}
              >
                Esqueci minha senha →
              </button>
            </form>
          ) : (
            <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{
                padding: '10px 12px', borderRadius: 10, fontSize: 12, lineHeight: 1.6,
                background: 'rgba(124,92,255,.08)', border: '1px solid rgba(124,92,255,.2)',
                color: 'var(--text2)',
              }}>
                💡 Se você foi convidado, use esta opção para criar sua senha e ativar o acesso.
              </div>

              <Field
                id="reset-email" label="Email" type="email"
                autoComplete="email" value={email}
                onChange={setEmail} placeholder="seu@email.com"
              />

              {error && (
                <div style={{
                  padding: '9px 12px', borderRadius: 10, fontSize: 13,
                  background: 'rgba(248,113,113,.1)', border: '1px solid rgba(248,113,113,.2)',
                  color: 'var(--bad)',
                }}>
                  ❌ {error}
                </div>
              )}

              {success && (
                <div style={{
                  padding: '10px 12px', borderRadius: 10, fontSize: 13, lineHeight: 1.6,
                  background: 'rgba(52,211,153,.1)', border: '1px solid rgba(52,211,153,.2)',
                  color: 'var(--good)',
                }}>
                  ✅ {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !!success}
                className="btn primary"
                style={{ width: '100%', fontSize: 14, minHeight: 48 }}
              >
                {loading ? '⏳ Enviando…' : 'Enviar link'}
              </button>

              <button
                type="button"
                onClick={() => { setMode('login'); setError(null); setSuccess(null) }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--font)',
                  textAlign: 'center', padding: '4px 0',
                }}
              >
                ← Voltar ao login
              </button>
            </form>
          )}
        </div>

        {/* Rodapé */}
        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text3)', marginTop: 20 }}>
          Acesso por convite · Kcalix © 2026
        </p>
      </div>
    </div>
  )
}
