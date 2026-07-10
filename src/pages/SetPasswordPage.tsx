import { useState, useEffect, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { updatePassword } from '../lib/auth'

type PageState = 'loading' | 'ready' | 'success' | 'invalid'

// ── Logo (mesmo da LoginPage) ─────────────────────────────────────────────────

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

// ── Field ─────────────────────────────────────────────────────────────────────

function Field({
  id, label, value, onChange, placeholder,
}: {
  id: string; label: string; value: string
  onChange: (v: string) => void; placeholder: string
}) {
  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id} type="password" required autoComplete="new-password"
        value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  )
}

// ── SetPasswordPage ───────────────────────────────────────────────────────────

export default function SetPasswordPage() {
  const [pageState, setPageState] = useState<PageState>('loading')
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [isInvite] = useState(() => {
    const hash = window.location.hash
    return hash.includes('type=invite') || hash.includes('type=signup')
  })

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setPageState('ready')
      }
    })

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
      setError('As senhas não coincidem.')
      return
    }

    setLoading(true)
    const { error } = await updatePassword(password)
    if (error) {
      setError('Não foi possível definir a senha. Tente solicitar um novo link.')
    } else {
      setPageState('success')
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

        {/* Card */}
        <div className="auth-card">

          {/* Loading */}
          {pageState === 'loading' && (
            <div className="auth-state">
              <div className="auth-spinner" />
              <p>Verificando link…</p>
            </div>
          )}

          {/* Link inválido */}
          {pageState === 'invalid' && (
            <div className="auth-state">
              <div className="auth-state-mark auth-state-warn">!</div>
              <div>
                <p className="auth-state-title">Link inválido ou expirado</p>
                <p>
                  Solicite um novo link de acesso pela tela de login.
                </p>
              </div>
              <a href="/login" className="btn primary" style={{ textDecoration: 'none', minHeight: 48, fontSize: 14 }}>
                Ir para o login
              </a>
            </div>
          )}

          {/* Formulário */}
          {pageState === 'ready' && (
            <>
              <div className="auth-heading">
                <h2>
                  {isInvite ? 'Criar sua senha' : 'Nova senha'}
                </h2>
                <p>
                  {isInvite
                    ? 'Bem-vindo! Crie uma senha para ativar seu acesso.'
                    : 'Escolha uma nova senha para sua conta.'}
                </p>
              </div>

              {isInvite && (
                <div className="auth-alert auth-alert-good">
                  Convite verificado — defina sua senha para começar.
                </div>
              )}

              <form onSubmit={handleSubmit} className="auth-form">
                <Field id="password" label="Nova senha" value={password} onChange={setPassword} placeholder="Mínimo 8 caracteres" />
                <Field id="confirm" label="Confirmar senha" value={confirm} onChange={setConfirm} placeholder="Repita a senha" />

                {error && (
                  <div className="auth-alert auth-alert-bad">
                    {error}
                  </div>
                )}

                <button
                  type="submit" disabled={loading}
                  className="btn primary"
                  style={{ width: '100%', marginTop: 4, fontSize: 14, minHeight: 48 }}
                >
                  {loading ? '⏳ Salvando…' : isInvite ? 'Ativar acesso' : 'Salvar nova senha'}
                </button>
              </form>
            </>
          )}

          {/* Sucesso */}
          {pageState === 'success' && (
            <div className="auth-state">
              <div className="auth-state-mark auth-state-good">
                ✓
              </div>
              <div>
                <p className="auth-state-title">
                  {isInvite ? 'Acesso ativado!' : 'Senha alterada!'}
                </p>
                <p>
                  {isInvite
                    ? 'Sua conta está ativa. Bem-vindo ao Kcalix!'
                    : 'Senha definida com sucesso. Você já pode entrar.'}
                </p>
              </div>
              <a href="/" className="btn primary" style={{ textDecoration: 'none', minHeight: 48, fontSize: 14, width: '100%' }}>
                Ir para o app →
              </a>
            </div>
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
