import { signOut } from '../lib/auth'
import { useAuthStore } from '../store/authStore'

export default function DashboardPage() {
  const { user, profile, isAdmin } = useAuthStore()

  async function handleSignOut() {
    await signOut()
  }

  return (
    <div
      className="flex min-h-dvh flex-col items-center justify-center gap-6 p-6"
      style={{ background: 'var(--bg)' }}
    >
      <div className="text-center">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>
          Kcalix
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text3)' }}>
          Bem-vindo, {profile?.nome ?? user?.email}!
        </p>
      </div>

      <div
        className="w-full max-w-sm rounded-2xl p-5 text-center"
        style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}
      >
        <p className="text-sm font-medium" style={{ color: 'var(--text2)' }}>
          App em construcao — Fase 2 em breve
        </p>
        <p className="mt-1 text-xs" style={{ color: 'var(--text3)' }}>
          Login funcionando com sucesso.
        </p>
      </div>

      {isAdmin && (
        <a
          href="/kcx-studio"
          className="text-xs underline"
          style={{ color: 'var(--accent2)' }}
        >
          Painel admin
        </a>
      )}

      <button
        onClick={handleSignOut}
        className="rounded-xl px-6 py-2.5 text-sm font-medium transition-opacity hover:opacity-70"
        style={{ background: 'var(--surface2)', color: 'var(--text2)' }}
      >
        Sair
      </button>
    </div>
  )
}
