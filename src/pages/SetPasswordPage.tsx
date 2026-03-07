import { useState, type FormEvent } from 'react'
import { updatePassword } from '../lib/auth'

export default function SetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

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
      setError('Nao foi possivel definir a senha. O link pode ter expirado.')
    } else {
      setSuccess(true)
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
            {success ? 'Senha definida!' : 'Crie sua senha'}
          </p>
        </div>

        <div
          className="rounded-2xl p-6"
          style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}
        >
          {success ? (
            <div className="flex flex-col items-center gap-4 text-center">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full text-2xl"
                style={{ background: 'var(--surface2)' }}
              >
                ✓
              </div>
              <p className="text-sm" style={{ color: 'var(--text2)' }}>
                Sua senha foi definida com sucesso. Voce ja pode acessar o app.
              </p>
              <a
                href="/"
                className="w-full rounded-xl py-3 text-center text-sm font-semibold"
                style={{ background: 'var(--accent)', color: '#fff', display: 'block' }}
              >
                Ir para o app
              </a>
            </div>
          ) : (
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
        </div>
      </div>
    </div>
  )
}
