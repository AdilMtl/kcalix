import { useState, type FormEvent } from 'react'
import { signInWithEmail, resetPassword } from '../lib/auth'

type Mode = 'login' | 'reset'

export default function LoginPage() {
  const desativado = sessionStorage.getItem('kcx_desativado') === '1'
  if (desativado) sessionStorage.removeItem('kcx_desativado')

  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleLogin(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await signInWithEmail(email, password)

    if (error) {
      // Mensagem generica — nao revela se email existe ou nao
      setError('Email ou senha incorretos. Verifique seus dados.')
    }

    setLoading(false)
  }

  async function handleReset(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await resetPassword(email)

    if (error) {
      setError('Nao foi possivel enviar o email. Tente novamente.')
    } else {
      setSuccess('Email enviado! Verifique sua caixa de entrada.')
    }

    setLoading(false)
  }

  return (
    <div
      className="flex min-h-dvh items-center justify-center p-4"
      style={{ background: 'var(--bg)' }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{ color: 'var(--accent)' }}
          >
            Kcalix
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text3)' }}>
            {mode === 'login' ? 'Acesse sua conta' : 'Recuperar senha'}
          </p>
        </div>

        {/* Banner: conta desativada */}
        {desativado && (
          <div
            className="mb-4 rounded-xl p-3 text-center text-sm"
            style={{ background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.3)', color: 'var(--bad)' }}
          >
            Sua conta foi desativada. Entre em contato com o administrador.
          </div>
        )}

        {/* Card */}
        <div
          className="rounded-2xl p-6"
          style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}
        >
          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="email"
                  className="text-xs font-medium"
                  style={{ color: 'var(--text2)' }}
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors"
                  style={{
                    background: 'var(--surface2)',
                    border: '1px solid var(--line)',
                    color: 'var(--text)',
                  }}
                  placeholder="seu@email.com"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="password"
                  className="text-xs font-medium"
                  style={{ color: 'var(--text2)' }}
                >
                  Senha
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors"
                  style={{
                    background: 'var(--surface2)',
                    border: '1px solid var(--line)',
                    color: 'var(--text)',
                  }}
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <p className="text-sm" style={{ color: 'var(--bad)' }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-1 w-full rounded-xl py-3 text-sm font-semibold transition-opacity disabled:opacity-50"
                style={{ background: 'var(--accent)', color: '#fff' }}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>

              <button
                type="button"
                onClick={() => { setMode('reset'); setError(null) }}
                className="text-center text-xs transition-opacity hover:opacity-70"
                style={{ color: 'var(--text3)' }}
              >
                Esqueci minha senha
              </button>
            </form>
          ) : (
            <form onSubmit={handleReset} className="flex flex-col gap-4">
              <p className="text-sm" style={{ color: 'var(--text2)' }}>
                Digite seu email e enviaremos um link para redefinir sua senha.
              </p>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="reset-email"
                  className="text-xs font-medium"
                  style={{ color: 'var(--text2)' }}
                >
                  Email
                </label>
                <input
                  id="reset-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                  style={{
                    background: 'var(--surface2)',
                    border: '1px solid var(--line)',
                    color: 'var(--text)',
                  }}
                  placeholder="seu@email.com"
                />
              </div>

              {error && (
                <p className="text-sm" style={{ color: 'var(--bad)' }}>
                  {error}
                </p>
              )}
              {success && (
                <p className="text-sm" style={{ color: 'var(--good)' }}>
                  {success}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl py-3 text-sm font-semibold transition-opacity disabled:opacity-50"
                style={{ background: 'var(--accent)', color: '#fff' }}
              >
                {loading ? 'Enviando...' : 'Enviar link'}
              </button>

              <button
                type="button"
                onClick={() => { setMode('login'); setError(null); setSuccess(null) }}
                className="text-center text-xs transition-opacity hover:opacity-70"
                style={{ color: 'var(--text3)' }}
              >
                Voltar ao login
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
