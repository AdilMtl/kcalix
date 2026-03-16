import { useState, useEffect, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { updatePassword } from '../lib/auth'

type PageState = 'loading' | 'ready' | 'success' | 'invalid'

// ── Logo (mesmo da LoginPage) ─────────────────────────────────────────────────

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

// ── Field ─────────────────────────────────────────────────────────────────────

function Field({
  id, label, value, onChange, placeholder,
}: {
  id: string; label: string; value: string
  onChange: (v: string) => void; placeholder: string
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label htmlFor={id} style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>
        {label}
      </label>
      <input
        id={id} type="password" required autoComplete="new-password"
        value={value} onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        placeholder={placeholder}
        style={{
          background: 'var(--surface2)',
          border: `1.5px solid ${focused ? 'var(--accent)' : 'var(--line)'}`,
          borderRadius: 12, color: 'var(--text)',
          padding: '12px 14px', fontSize: 15, outline: 'none',
          fontFamily: 'var(--font)', transition: 'border-color .15s', width: '100%',
          boxShadow: focused ? '0 0 0 3px rgba(124,92,255,.12)' : 'none',
        }}
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
  const [isInvite, setIsInvite]   = useState(false)

  useEffect(() => {
    // Detectar se veio de convite pelo hash da URL
    const hash = window.location.hash
    if (hash.includes('type=invite') || hash.includes('type=signup')) {
      setIsInvite(true)
    }

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
    <div style={{
      minHeight: '100dvh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px',
    }}>
      <div style={{ width: '100%', maxWidth: 360 }}>

        {/* Logo */}
        <div style={{ marginBottom: 32 }}>
          <KcalixLogo />
        </div>

        {/* Card */}
        <div style={{
          background: 'linear-gradient(180deg, rgba(18,24,38,.95), rgba(14,20,34,.95))',
          border: '1px solid var(--line)', borderRadius: 20,
          padding: 24, boxShadow: '0 16px 48px rgba(0,0,0,.5)',
        }}>

          {/* Loading */}
          {pageState === 'loading' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '24px 0' }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                border: '2.5px solid var(--line)', borderTopColor: 'var(--accent)',
                animation: 'spin 0.8s linear infinite',
              }} />
              <p style={{ fontSize: 13, color: 'var(--text3)' }}>Verificando link…</p>
            </div>
          )}

          {/* Link inválido */}
          {pageState === 'invalid' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 40 }}>⚠️</div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Link inválido ou expirado</p>
                <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 6, lineHeight: 1.5 }}>
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
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                  {isInvite ? 'Criar sua senha' : 'Nova senha'}
                </h2>
                <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>
                  {isInvite
                    ? 'Bem-vindo! Crie uma senha para ativar seu acesso.'
                    : 'Escolha uma nova senha para sua conta.'}
                </p>
              </div>

              {isInvite && (
                <div style={{
                  marginBottom: 16, padding: '10px 12px', borderRadius: 10,
                  fontSize: 12, lineHeight: 1.6,
                  background: 'rgba(52,211,153,.08)', border: '1px solid rgba(52,211,153,.2)',
                  color: 'var(--text2)',
                }}>
                  ✅ Convite verificado — defina sua senha para começar.
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Field id="password" label="Nova senha" value={password} onChange={setPassword} placeholder="Mínimo 8 caracteres" />
                <Field id="confirm" label="Confirmar senha" value={confirm} onChange={setConfirm} placeholder="Repita a senha" />

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
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'rgba(52,211,153,.15)', border: '2px solid rgba(52,211,153,.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24,
              }}>
                ✓
              </div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
                  {isInvite ? 'Acesso ativado!' : 'Senha alterada!'}
                </p>
                <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 6, lineHeight: 1.5 }}>
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
        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text3)', marginTop: 20 }}>
          Acesso por convite · Kcalix © 2026
        </p>
      </div>
    </div>
  )
}
