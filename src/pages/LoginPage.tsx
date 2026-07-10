import { useState, type FormEvent } from 'react'
import { signInWithEmail, resetPassword } from '../lib/auth'

type Mode = 'login' | 'reset'

// ── Logo ─────────────────────────────────────────────────────────────────────

function KcalixLogo() {
  return (
    <div className="auth-logo">
      <img src="/icon-192.png" alt="Kcalix" />
      <div>
        <div className="auth-logo-title">Kcalix</div>
        <div className="auth-logo-subtitle">Nutrição · Treino · Evolução</div>
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
  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        required
        autoComplete={autoComplete}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
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
    <div className="auth-page">
      <div className="auth-shell">

        {/* Logo */}
        <div className="auth-logo-wrap">
          <KcalixLogo />
        </div>

        {/* Banner: conta desativada */}
        {desativado && (
          <div className="auth-alert auth-alert-bad">
            Sua conta foi desativada. Entre em contato com o administrador.
          </div>
        )}

        {/* Card */}
        <div className="auth-card">

          {/* Título do modo */}
          <div className="auth-heading">
            <h2>
              {mode === 'login' ? 'Entrar na conta' : 'Recuperar acesso'}
            </h2>
            <p>
              {mode === 'login'
                ? 'Acesso restrito — somente convidados'
                : 'Enviaremos um link para criar sua senha'}
            </p>
          </div>

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="auth-form">
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
                <div className="auth-alert auth-alert-bad">
                  {error}
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
                className="auth-link-btn"
              >
                Esqueci minha senha
              </button>
            </form>
          ) : (
            <form onSubmit={handleReset} className="auth-form">
              <div className="auth-note">
                Se você foi convidado, use esta opção para criar sua senha e ativar o acesso.
              </div>

              <Field
                id="reset-email" label="Email" type="email"
                autoComplete="email" value={email}
                onChange={setEmail} placeholder="seu@email.com"
              />

              {error && (
                <div className="auth-alert auth-alert-bad">
                  {error}
                </div>
              )}

              {success && (
                <div className="auth-alert auth-alert-good">
                  {success}
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
                className="auth-link-btn"
              >
                Voltar ao login
              </button>
            </form>
          )}
        </div>

        {/* Rodapé */}
        <p className="auth-footer">
          Acesso por convite · Kcalix © 2026
        </p>
      </div>
    </div>
  )
}
