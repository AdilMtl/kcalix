import { useState, useEffect, type FormEvent } from 'react'
import {
  listAuthorizedEmails,
  addAuthorizedEmail,
  removeAuthorizedEmail,
  markAsInvited,
  inviteUser,
  setUserAtivo,
} from '../lib/auth'
import type { AuthorizedEmail } from '../types/auth'

type EmailRow = AuthorizedEmail

function statusLabel(item: EmailRow) {
  if (item.ativo === false) return { text: 'Desativado', color: 'var(--bad)',   dot: '🔴' }
  if (item.accepted_at)    return { text: 'Ativo',       color: 'var(--good)',  dot: '🟢' }
  if (item.invited_at)     return { text: 'Convidado',   color: 'var(--warn)',  dot: '📨' }
  return                          { text: 'Pendente',    color: 'var(--text3)', dot: '⏳' }
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function AdminPage() {
  const [emails, setEmails] = useState<EmailRow[]>([])
  const [newEmail, setNewEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<Record<string, { type: 'ok' | 'err'; msg: string }>>({})
  const [inviting, setInviting] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data, error } = await listAuthorizedEmails()
    if (!error && data) setEmails(data as EmailRow[])
    setLoading(false)
  }

  function setFeedbackFor(email: string, type: 'ok' | 'err', msg: string) {
    setFeedback(prev => ({ ...prev, [email]: { type, msg } }))
    setTimeout(() => setFeedback(prev => {
      const next = { ...prev }
      delete next[email]
      return next
    }), 4000)
  }

  async function handleAdd(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    setAdding(true)
    const { error } = await addAuthorizedEmail(newEmail)
    if (error) {
      setFormError(error.code === '23505' ? 'Email já está na lista.' : 'Erro ao adicionar.')
    } else {
      setNewEmail('')
      await load()
    }
    setAdding(false)
  }

  async function handleInvite(email: string) {
    setInviting(email)
    const result = await inviteUser(email)
    if (result.ok) {
      await markAsInvited(email)
      await load()
      setFeedbackFor(email, 'ok', 'Convite enviado!')
    } else {
      setFeedbackFor(email, 'err', result.error ?? 'Erro ao enviar convite.')
    }
    setInviting(null)
  }

  async function handleToggleAtivo(email: string, ativoAtual: boolean) {
    setToggling(email)
    const { error } = await setUserAtivo(email, !ativoAtual)
    if (!error) {
      await load()
      setFeedbackFor(email, 'ok', ativoAtual ? 'Usuário desativado.' : 'Usuário reativado.')
    } else {
      setFeedbackFor(email, 'err', 'Erro ao alterar status.')
    }
    setToggling(null)
  }

  async function handleRemove(id: string) {
    const { error } = await removeAuthorizedEmail(id)
    if (!error) await load()
  }

  return (
    <div className="min-h-dvh p-4" style={{ background: 'var(--bg)' }}>
      <div className="mx-auto max-w-lg">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold" style={{ color: 'var(--text)' }}>
              Painel admin
            </h1>
            <p className="text-xs" style={{ color: 'var(--text3)' }}>
              {emails.length} {emails.length === 1 ? 'usuário' : 'usuários'} na lista
            </p>
          </div>
          <a href="/" className="text-xs" style={{ color: 'var(--text3)' }}>
            ← Voltar
          </a>
        </div>

        {/* Formulário de adição */}
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

        {formError && (
          <p className="mb-3 text-sm" style={{ color: 'var(--bad)' }}>{formError}</p>
        )}

        {/* Lista */}
        {loading ? (
          <p className="text-center text-sm" style={{ color: 'var(--text3)' }}>Carregando...</p>
        ) : emails.length === 0 ? (
          <p className="text-center text-sm" style={{ color: 'var(--text3)' }}>
            Nenhum email autorizado ainda.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {emails.map(item => {
              const status = statusLabel(item)
              const isAtivo = item.ativo !== false
              const fb = feedback[item.email]

              return (
                <div
                  key={item.id}
                  className="rounded-2xl p-4"
                  style={{
                    background: 'var(--surface)',
                    border: `1px solid ${isAtivo ? 'var(--line)' : 'rgba(239,68,68,.25)'}`,
                    opacity: isAtivo ? 1 : 0.75,
                  }}
                >
                  {/* Email + status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold" style={{ color: 'var(--text)' }}>
                        {item.email}
                      </p>
                      <p className="mt-0.5 text-xs font-medium" style={{ color: status.color }}>
                        {status.dot} {status.text}
                      </p>
                    </div>

                    {/* Botões de ação */}
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      {/* Enviar convite — pendente e ativo */}
                      {!item.invited_at && isAtivo && (
                        <button
                          onClick={() => handleInvite(item.email)}
                          disabled={inviting === item.email}
                          className="rounded-lg px-3 py-1.5 text-xs font-medium transition-opacity disabled:opacity-50"
                          style={{ background: 'var(--accent)', color: '#fff' }}
                        >
                          {inviting === item.email ? '...' : 'Enviar convite'}
                        </button>
                      )}

                      {/* Reenviar — convidado mas não aceitou */}
                      {item.invited_at && !item.accepted_at && isAtivo && (
                        <button
                          onClick={() => handleInvite(item.email)}
                          disabled={inviting === item.email}
                          className="rounded-lg px-3 py-1.5 text-xs font-medium transition-opacity disabled:opacity-50"
                          style={{ background: 'var(--surface2)', color: 'var(--accent2)' }}
                        >
                          {inviting === item.email ? '...' : 'Reenviar'}
                        </button>
                      )}

                      {/* Desativar / Reativar */}
                      <button
                        onClick={() => handleToggleAtivo(item.email, isAtivo)}
                        disabled={toggling === item.email}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium transition-opacity disabled:opacity-50"
                        style={{
                          background: 'var(--surface2)',
                          color: isAtivo ? 'var(--warn)' : 'var(--good)',
                        }}
                      >
                        {toggling === item.email ? '...' : isAtivo ? 'Desativar' : 'Reativar'}
                      </button>

                      {/* Remover */}
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-70"
                        style={{ background: 'var(--surface2)', color: 'var(--bad)' }}
                      >
                        Remover
                      </button>
                    </div>
                  </div>

                  {/* Datas */}
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-0.5">
                    <p className="text-xs" style={{ color: 'var(--text3)' }}>
                      Adicionado: {formatDate(item.created_at)}
                    </p>
                    {item.invited_at && (
                      <p className="text-xs" style={{ color: 'var(--text3)' }}>
                        Convidado: {formatDate(item.invited_at)}
                      </p>
                    )}
                    {item.accepted_at && (
                      <p className="text-xs" style={{ color: 'var(--good)' }}>
                        Ativo desde: {formatDate(item.accepted_at)}
                      </p>
                    )}
                  </div>

                  {/* Feedback inline */}
                  {fb && (
                    <p
                      className="mt-2 text-xs font-medium"
                      style={{ color: fb.type === 'ok' ? 'var(--good)' : 'var(--bad)' }}
                    >
                      {fb.type === 'ok' ? '✅' : '❌'} {fb.msg}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
