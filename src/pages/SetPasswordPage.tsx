import { useState, useEffect, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { updatePassword } from '../lib/auth'

type PageState = 'loading' | 'ready' | 'success' | 'invalid'

export default function SetPasswordPage() {
  const [pageState, setPageState] = useState<PageState>('loading')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // O Supabase processa automaticamente os tokens da URL (#access_token=...)
    // e dispara onAuthStateChange com evento PASSWORD_RECOVERY ou SIGNED_IN (convite)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setPageState('ready')
      }
    })

    // Timeout: se nao chegou nenhum evento em 3s, o link e invalido/expirado
    const timeout = setTimeout(() => {
      setPageState(prev => prev === 'loading' ? 'invalid' : prev)
    }, 3000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.')
      return
    }

    if (password !== confirm) {
      setError('As senhas nao coincidem.')
      return
    }

    setLoading(true)
    const { error } = await updatePassword(password)

    if (error) {
      setError('Nao foi possivel definir a senha. Tente solicitar um novo link.')
    } else {
      setPageState('success')
    }

    setLoading(false)
  }

  return (
    <div
      className="flex min-h-dvh items-center justify-center p-4"
      style={{ background: 'var(--bg)' }}
    >
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{ color: 'var(--accent)' }}
          >
            Kcalix
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text3)' }}>
            {pageState === 'success' ? 'Senha definida!' : 'Crie sua senha'}
          </p>
        </div>

        <div
          className="rounded-2xl p-6"
          style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}
        >
          {pageState === 'loading' && (
            <div className="flex justify-center py-4">
              <div
                className="h-7 w-7 animate-spin rounded-full border-2 border-transparent"
                style={{ borderTopColor: 'var(--accent)' }}
              />
            </div>
          )}

          {pageState === 'invalid' && (
            <div className="flex flex-col gap-4 text-center">
              <p className="text-sm" style={{ color: 'var(--bad)' }}>
                Link invalido ou expirado.
              </p>
              <a
                href="/login"
                className="w-full rounded-xl py-3 text-center text-sm font-semibold"
                style={{ background: 'var(--surface2)', color: 'var(--text2)', display: 'block' }}
              >
                Voltar ao login
              </a>
            </div>
          )}

          {pageState === 'ready' && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="password"
                  className="text-xs font-medium"
                  style={{ color: 'var(--text2)' }}
                >
                  Nova senha
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                  style={{
                    background: 'var(--surface2)',
                    border: '1px solid var(--line)',
                    color: 'var(--text)',
                  }}
                  placeholder="Minimo 8 caracteres"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="confirm"
                  className="text-xs font-medium"
                  style={{ color: 'var(--text2)' }}
                >
                  Confirmar senha
                </label>
                <input
                  id="confirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                  style={{
                    background: 'var(--surface2)',
                    border: '1px solid var(--line)',
                    color: 'var(--text)',
                  }}
                  placeholder="Repita a senha"
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
                {loading ? 'Salvando...' : 'Definir senha'}
              </button>
            </form>
          )}

          {pageState === 'success' && (
            <div className="flex flex-col items-center gap-4 text-center">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full text-xl font-bold"
                style={{ background: 'var(--surface2)', color: 'var(--good)' }}
              >
                ✓
              </div>
              <p className="text-sm" style={{ color: 'var(--text2)' }}>
                Senha definida com sucesso. Voce ja pode acessar o app.
              </p>
              <a
                href="/"
                className="w-full rounded-xl py-3 text-center text-sm font-semibold"
                style={{ background: 'var(--accent)', color: '#fff', display: 'block' }}
              >
                Ir para o app
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
