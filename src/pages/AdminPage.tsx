import { useState, useEffect, type FormEvent } from 'react'
import {
  listAuthorizedEmails,
  addAuthorizedEmail,
  removeAuthorizedEmail,
  markAsInvited,
} from '../lib/auth'
import type { AuthorizedEmail } from '../types/auth'

export default function AdminPage() {
  const [emails, setEmails] = useState<AuthorizedEmail[]>([])
  const [newEmail, setNewEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    const { data, error } = await listAuthorizedEmails()
    if (!error && data) setEmails(data as AuthorizedEmail[])
    setLoading(false)
  }

  async function handleAdd(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setAdding(true)

    const { error } = await addAuthorizedEmail(newEmail)

    if (error) {
      if (error.code === '23505') {
        setError('Este email ja esta na lista.')
      } else {
        setError('Nao foi possivel adicionar. Tente novamente.')
      }
    } else {
      setNewEmail('')
      await load()
    }

    setAdding(false)
  }

  async function handleRemove(id: string) {
    const { error } = await removeAuthorizedEmail(id)
    if (!error) await load()
  }

  async function handleCopyAndMarkInvited(email: string) {
    await navigator.clipboard.writeText(email)
    await markAsInvited(email)
    setCopied(email)
    setTimeout(() => setCopied(null), 3000)
    await load()
  }

  function formatDate(iso: string | null) {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div
      className="min-h-dvh p-4"
      style={{ background: 'var(--bg)' }}
    >
      <div className="mx-auto max-w-lg">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold" style={{ color: 'var(--text)' }}>
              Painel admin
            </h1>
            <p className="text-xs" style={{ color: 'var(--text3)' }}>
              Emails autorizados a criar conta
            </p>
          </div>
          <a
            href="/"
            className="text-xs"
            style={{ color: 'var(--text3)' }}
          >
            Voltar
          </a>
        </div>

        {/* Instrucao de convite */}
        <div
          className="mb-4 rounded-xl p-4"
          style={{ background: 'var(--surface2)', border: '1px solid var(--line)' }}
        >
          <p className="text-xs font-medium" style={{ color: 'var(--warn)' }}>
            Como convidar um usuario
          </p>
          <p className="mt-1 text-xs" style={{ color: 'var(--text2)' }}>
            1. Adicione o email abaixo{'\n'}
            2. Clique em "Copiar e marcar convidado"{'\n'}
            3. No Supabase: Authentication → Users → Invite user → cole o email
          </p>
        </div>

        {/* Formulario de adicao */}
        <form onSubmit={handleAdd} className="mb-4 flex gap-2">
          <input
            type="email"
            required
            value={newEmail}
            onChange={e => setNewEmail(e.target.value)}
            placeholder="novo@email.com"
            className="flex-1 rounded-xl px-4 py-3 text-sm outline-none"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--line)',
              color: 'var(--text)',
            }}
          />
          <button
            type="submit"
            disabled={adding}
            className="rounded-xl px-4 py-3 text-sm font-semibold transition-opacity disabled:opacity-50"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            {adding ? '...' : 'Adicionar'}
          </button>
        </form>

        {error && (
          <p className="mb-3 text-sm" style={{ color: 'var(--bad)' }}>
            {error}
          </p>
        )}

        {/* Lista */}
        {loading ? (
          <p className="text-center text-sm" style={{ color: 'var(--text3)' }}>
            Carregando...
          </p>
        ) : emails.length === 0 ? (
          <p className="text-center text-sm" style={{ color: 'var(--text3)' }}>
            Nenhum email autorizado ainda.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {emails.map(item => (
              <div
                key={item.id}
                className="rounded-xl p-4"
                style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p
                      className="truncate text-sm font-medium"
                      style={{ color: 'var(--text)' }}
                    >
                      {item.email}
                    </p>
                    <p className="mt-0.5 text-xs" style={{ color: 'var(--text3)' }}>
                      Adicionado: {formatDate(item.created_at)}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text3)' }}>
                      Convidado: {formatDate(item.invited_at)}
                    </p>
                    {item.accepted_at && (
                      <p className="text-xs" style={{ color: 'var(--good)' }}>
                        Ativo desde: {formatDate(item.accepted_at)}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-col gap-1">
                    {!item.invited_at && (
                      <button
                        onClick={() => handleCopyAndMarkInvited(item.email)}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-70"
                        style={{ background: 'var(--accent)', color: '#fff' }}
                      >
                        {copied === item.email ? 'Copiado!' : 'Copiar e convidar'}
                      </button>
                    )}
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-70"
                      style={{ background: 'var(--surface2)', color: 'var(--bad)' }}
                    >
                      Remover
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
