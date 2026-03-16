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

// ── helpers ──────────────────────────────────────────────────────────────────

function statusLabel(item: EmailRow) {
  if (item.ativo === false) return { text: 'Desativado', color: 'var(--bad)',   dot: '🔴', bg: 'rgba(248,113,113,.08)', border: 'rgba(248,113,113,.18)' }
  if (item.accepted_at)    return { text: 'Ativo',       color: 'var(--good)',  dot: '🟢', bg: 'rgba(52,211,153,.08)',  border: 'rgba(52,211,153,.18)'  }
  if (item.invited_at)     return { text: 'Convidado',   color: 'var(--warn)',  dot: '📨', bg: 'rgba(251,191,36,.08)',  border: 'rgba(251,191,36,.18)'  }
  return                          { text: 'Pendente',    color: 'var(--text3)', dot: '⏳', bg: 'var(--surface)',        border: 'var(--line)'           }
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

// ── Stat KPI ─────────────────────────────────────────────────────────────────

function StatKpi({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius-sm)',
      padding: '10px 12px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1.2 }}>{value}</div>
      <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</div>
    </div>
  )
}

// ── UserCard ─────────────────────────────────────────────────────────────────

function UserCard({
  item,
  feedback,
  inviting,
  toggling,
  onInvite,
  onToggle,
  onRemove,
}: {
  item: EmailRow
  feedback: { type: 'ok' | 'err'; msg: string } | undefined
  inviting: boolean
  toggling: boolean
  onInvite: () => void
  onToggle: () => void
  onRemove: () => void
}) {
  const status = statusLabel(item)
  const isAtivo = item.ativo !== false
  const [confirmRemove, setConfirmRemove] = useState(false)

  return (
    <div style={{
      background: 'linear-gradient(180deg, rgba(18,24,38,.9), rgba(14,20,34,.9))',
      border: `1px solid ${status.border}`,
      borderRadius: 'var(--radius)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow)',
      opacity: isAtivo ? 1 : 0.72,
      transition: 'opacity .2s',
    }}>
      {/* Card header */}
      <div style={{
        padding: '12px 14px',
        borderBottom: '1px solid var(--line)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
      }}>
        {/* Avatar + email */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
            background: `linear-gradient(135deg, ${status.bg === 'var(--surface)' ? 'rgba(124,92,255,.2)' : status.bg}, var(--surface2))`,
            border: `1px solid ${status.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, color: status.color,
          }}>
            {item.email.charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: 13, fontWeight: 700, color: 'var(--text)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {item.email}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
              <span style={{
                fontSize: 10, fontWeight: 600, color: status.color,
                background: status.bg, border: `1px solid ${status.border}`,
                borderRadius: 6, padding: '1px 7px',
                textTransform: 'uppercase', letterSpacing: '.04em',
              }}>
                {status.dot} {status.text}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card body — datas */}
      <div style={{ padding: '10px 14px', display: 'flex', flexWrap: 'wrap', gap: '4px 20px' }}>
        <span style={{ fontSize: 11, color: 'var(--text3)' }}>
          Adicionado: <b style={{ color: 'var(--text2)' }}>{formatDate(item.created_at)}</b>
        </span>
        {item.invited_at && (
          <span style={{ fontSize: 11, color: 'var(--text3)' }}>
            Convidado: <b style={{ color: 'var(--warn)' }}>{formatDate(item.invited_at)}</b>
          </span>
        )}
        {item.accepted_at && (
          <span style={{ fontSize: 11, color: 'var(--text3)' }}>
            Ativo desde: <b style={{ color: 'var(--good)' }}>{formatDate(item.accepted_at)}</b>
          </span>
        )}
      </div>

      {/* Feedback inline */}
      {feedback && (
        <div style={{
          margin: '0 14px 10px',
          padding: '7px 10px',
          borderRadius: 8,
          background: feedback.type === 'ok' ? 'rgba(52,211,153,.1)' : 'rgba(248,113,113,.1)',
          border: `1px solid ${feedback.type === 'ok' ? 'rgba(52,211,153,.25)' : 'rgba(248,113,113,.25)'}`,
          fontSize: 12, fontWeight: 600,
          color: feedback.type === 'ok' ? 'var(--good)' : 'var(--bad)',
        }}>
          {feedback.type === 'ok' ? '✅' : '❌'} {feedback.msg}
        </div>
      )}

      {/* Card footer — ações */}
      <div style={{
        padding: '10px 14px',
        borderTop: '1px solid var(--line)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 8,
        flexWrap: 'wrap',
        background: 'rgba(0,0,0,.15)',
      }}>
        {/* Enviar / Reenviar convite */}
        {isAtivo && !item.accepted_at && (
          <button
            className={`btn sm${item.invited_at ? ' ghost' : ' primary'}`}
            onClick={onInvite}
            disabled={inviting}
          >
            {inviting ? '⏳ Enviando…' : item.invited_at ? '🔁 Reenviar convite' : '✉️ Enviar convite'}
          </button>
        )}

        {/* Desativar / Reativar */}
        <button
          className="btn sm ghost"
          onClick={onToggle}
          disabled={toggling}
          style={{ color: isAtivo ? 'var(--warn)' : 'var(--good)', borderColor: isAtivo ? 'rgba(251,191,36,.25)' : 'rgba(52,211,153,.25)' }}
        >
          {toggling ? '⏳' : isAtivo ? '🚫 Desativar' : '✅ Reativar'}
        </button>

        {/* Remover */}
        {confirmRemove ? (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--text3)' }}>Confirmar?</span>
            <button
              className="btn sm danger-ghost"
              onClick={() => { setConfirmRemove(false); onRemove() }}
            >
              Remover
            </button>
            <button className="btn sm ghost" onClick={() => setConfirmRemove(false)}>
              Cancelar
            </button>
          </div>
        ) : (
          <button
            className="btn sm danger-ghost"
            onClick={() => setConfirmRemove(true)}
          >
            🗑
          </button>
        )}
      </div>
    </div>
  )
}

// ── AdminPage ─────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [emails, setEmails]       = useState<EmailRow[]>([])
  const [newEmail, setNewEmail]   = useState('')
  const [loading, setLoading]     = useState(true)
  const [adding, setAdding]       = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [feedback, setFeedback]   = useState<Record<string, { type: 'ok' | 'err'; msg: string }>>({})
  const [inviting, setInviting]   = useState<string | null>(null)
  const [toggling, setToggling]   = useState<string | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data, error } = await listAuthorizedEmails()
    if (!error && data) setEmails(data as EmailRow[])
    setLoading(false)
  }

  function setFeedbackFor(email: string, type: 'ok' | 'err', msg: string, ms = 5000) {
    setFeedback(prev => ({ ...prev, [email]: { type, msg } }))
    setTimeout(() => setFeedback(prev => {
      const next = { ...prev }
      delete next[email]
      return next
    }), ms)
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
      setFeedbackFor(email, 'ok', 'Convite enviado! O usuário receberá um email — deve clicar no link e usar "Esqueci minha senha" para criar a senha e ativar o acesso.', 12000)
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

  // Estatísticas derivadas
  const total      = emails.length
  const ativos     = emails.filter(e => e.accepted_at && e.ativo !== false).length
  const convidados = emails.filter(e => e.invited_at && !e.accepted_at && e.ativo !== false).length
  const pendentes  = emails.filter(e => !e.invited_at && e.ativo !== false).length

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', padding: '0 0 32px' }}>
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '0 16px' }}>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 0 16px',
          borderBottom: '1px solid var(--line)',
          marginBottom: 20,
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: 'linear-gradient(135deg, var(--accent), rgba(124,92,255,.5))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 15,
              }}>
                ⚙️
              </div>
              <h1 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)', margin: 0 }}>
                Painel admin
              </h1>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4, paddingLeft: 40 }}>
              Gerenciamento de acesso e usuários
            </p>
          </div>
          <a
            href="/"
            style={{
              fontSize: 12, color: 'var(--text3)', textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '6px 10px', borderRadius: 8,
              background: 'var(--surface)', border: '1px solid var(--line)',
            }}
          >
            ← Voltar
          </a>
        </div>

        {/* ── KPI Stats ──────────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 20 }}>
          <StatKpi label="Total"      value={total}      color="var(--text)"  />
          <StatKpi label="Ativos"     value={ativos}     color="var(--good)"  />
          <StatKpi label="Convidados" value={convidados} color="var(--warn)"  />
          <StatKpi label="Pendentes"  value={pendentes}  color="var(--text3)" />
        </div>

        {/* ── Formulário adicionar ────────────────────────────────────────── */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <div className="ch-info">
              <b>Adicionar usuário</b>
              <span>O convite será enviado por email após adicionar</span>
            </div>
          </div>
          <div className="card-body">
            <form onSubmit={handleAdd} style={{ display: 'flex', gap: 8 }}>
              <input
                type="email"
                required
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                placeholder="novo@email.com"
                style={{
                  flex: 1,
                  background: 'var(--surface2)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius-xs)',
                  color: 'var(--text)',
                  padding: '10px 12px',
                  fontSize: 14,
                  outline: 'none',
                  fontFamily: 'var(--font)',
                }}
              />
              <button type="submit" className="btn primary" disabled={adding} style={{ flexShrink: 0 }}>
                {adding ? '⏳' : '+ Adicionar'}
              </button>
            </form>
            {formError && (
              <p style={{ marginTop: 8, fontSize: 12, color: 'var(--bad)', fontWeight: 600 }}>
                ❌ {formError}
              </p>
            )}
          </div>
        </div>

        {/* ── Lista de usuários ───────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
            Usuários ({total})
          </span>
          <button
            className="btn sm ghost"
            onClick={load}
            disabled={loading}
            style={{ fontSize: 11, minHeight: 28, padding: '4px 10px' }}
          >
            {loading ? '⏳' : '↻ Atualizar'}
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                height: 110, borderRadius: 'var(--radius)',
                background: 'var(--surface)', border: '1px solid var(--line)',
                animation: 'pulse 1.5s ease-in-out infinite',
                opacity: 1 - i * 0.15,
              }} />
            ))}
          </div>
        ) : emails.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '40px 20px',
            background: 'var(--surface)', border: '1px solid var(--line)',
            borderRadius: 'var(--radius)', color: 'var(--text3)', fontSize: 13,
          }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>👤</div>
            Nenhum usuário na lista ainda.<br />
            Adicione um email acima para começar.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {emails.map(item => (
              <UserCard
                key={item.id}
                item={item}
                feedback={feedback[item.email]}
                inviting={inviting === item.email}
                toggling={toggling === item.email}
                onInvite={() => handleInvite(item.email)}
                onToggle={() => handleToggleAtivo(item.email, item.ativo !== false)}
                onRemove={() => handleRemove(item.id)}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
