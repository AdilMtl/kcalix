import { useState, useEffect, type FormEvent } from 'react'
import { useAuthStore } from '../store/authStore'
import {
  listAuthorizedEmails,
  addAuthorizedEmail,
  removeAuthorizedEmail,
  markAsInvited,
  inviteUser,
  setUserAtivo,
} from '../lib/auth'
import type { AuthorizedEmail } from '../types/auth'
import { useAdminMessages } from '../hooks/useAppMessage'
import type { AppMessageWithStats, SurveyResults } from '../hooks/useAppMessage'
import AppMessageModal, { MarkdownBody } from '../components/AppMessageModal'

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

// ── MsgCard — card de mensagem na lista do admin ──────────────────────────────

type BadgeStatus = 'ativa' | 'agendada' | 'expirada' | 'arquivada'

const BADGE_STYLE: Record<BadgeStatus, { color: string; bg: string; border: string; icon: string }> = {
  ativa:     { color: 'var(--good)',   bg: 'rgba(52,211,153,.08)',   border: 'rgba(52,211,153,.2)',   icon: '🟢' },
  agendada:  { color: 'var(--accent2)',bg: 'rgba(167,139,250,.08)',  border: 'rgba(167,139,250,.2)',  icon: '🕐' },
  expirada:  { color: 'var(--text3)', bg: 'rgba(255,255,255,.03)',   border: 'var(--line)',           icon: '⏰' },
  arquivada: { color: 'var(--text3)', bg: 'rgba(255,255,255,.03)',   border: 'var(--line)',           icon: '📦' },
}

function MsgCard({
  m, totalUsers, onArchive, onView, badge,
}: {
  m: AppMessageWithStats
  totalUsers: number
  onArchive: (id: string) => void
  onView: (m: AppMessageWithStats) => void
  badge: BadgeStatus
}) {
  const bs = BADGE_STYLE[badge]
  const canArchive = badge === 'ativa' || badge === 'agendada'
  const targeting = m.targeting as { emails?: string[] }
  const isTargeted = targeting.emails && targeting.emails.length > 0

  return (
    <div style={{
      background: 'linear-gradient(180deg, rgba(18,24,38,.9), rgba(14,20,34,.9))',
      border: `1px solid ${bs.border}`,
      borderRadius: 'var(--radius)', overflow: 'hidden',
    }}>
      {/* Cabeçalho: badge + info de agendamento */}
      <div style={{
        padding: '8px 14px', borderBottom: '1px solid var(--line)',
        background: 'rgba(0,0,0,.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6,
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: bs.color, textTransform: 'uppercase', letterSpacing: '.06em' }}>
          {bs.icon} {badge}
          {isTargeted && <span style={{ marginLeft: 8, color: 'var(--accent2)', fontWeight: 600, textTransform: 'none' }}>· 👤 {targeting.emails!.length} usuário{targeting.emails!.length > 1 ? 's' : ''}</span>}
        </span>
        <span style={{ fontSize: 10, color: 'var(--text3)' }}>
          {badge === 'agendada' && m.starts_at && (
            <>Publicar: {new Date(m.starts_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}</>
          )}
          {m.expires_at && badge !== 'arquivada' && (
            <> · Expira: {new Date(m.expires_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}</>
          )}
          {badge === 'arquivada' && (
            <>{new Date(m.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })}</>
          )}
        </span>
      </div>

      {/* Preview */}
      <div style={{ padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <div style={{ fontSize: 24, flexShrink: 0 }}>{m.emoji}</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{m.title}</div>
          <MarkdownBody
            text={m.body.length > 100 ? m.body.slice(0, 100) + '…' : m.body}
            style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.5 }}
          />
        </div>
      </div>

      {/* Rodapé: métricas + ação */}
      <div style={{
        padding: '8px 14px', borderTop: '1px solid var(--line)',
        background: 'rgba(0,0,0,.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6,
      }}>
        <div style={{ fontSize: 11, color: 'var(--text3)' }}>
          👁 <b style={{ color: 'var(--text2)' }}>{m.dismissed_count}</b>
          {' / '}
          <b style={{ color: 'var(--text2)' }}>{isTargeted ? targeting.emails!.length : totalUsers}</b>
          {' viram'}
          {m.priority > 0 && <span style={{ marginLeft: 8 }}>· P{m.priority}</span>}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            className="btn sm ghost"
            onClick={() => onView(m)}
            style={{ fontSize: 11 }}
          >
            Ver
          </button>
          {canArchive && (
            <button
              className="btn sm ghost"
              onClick={() => onArchive(m.id)}
              style={{ color: 'var(--warn)', borderColor: 'rgba(251,191,36,.25)', fontSize: 11 }}
            >
              Arquivar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── SurveyCard — card de enquete com resultados lazy ─────────────────────────

function SurveyCard({
  m, onArchive, onView, badge, onLoadResults,
}: {
  m: AppMessageWithStats
  onArchive: (id: string) => void
  onView: (m: AppMessageWithStats) => void
  badge: BadgeStatus
  onLoadResults: (id: string) => Promise<SurveyResults>
}) {
  const bs = BADGE_STYLE[badge]
  const canArchive = badge === 'ativa' || badge === 'agendada'
  const targeting = m.targeting as { emails?: string[] }
  const isTargeted = targeting.emails && targeting.emails.length > 0
  const meta = m.metadata as { options?: string[]; open_question?: string }
  const options = meta.options ?? []

  const [results, setResults]   = useState<SurveyResults | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [loadingR, setLoadingR] = useState(false)

  async function toggleResults() {
    if (expanded) { setExpanded(false); return }
    setExpanded(true)
    if (!results) {
      setLoadingR(true)
      const r = await onLoadResults(m.id)
      setResults(r)
      setLoadingR(false)
    }
  }

  return (
    <div style={{
      background: 'linear-gradient(180deg, rgba(18,24,38,.9), rgba(14,20,34,.9))',
      border: `1px solid ${bs.border}`,
      borderRadius: 'var(--radius)', overflow: 'hidden',
    }}>
      {/* Cabeçalho */}
      <div style={{
        padding: '8px 14px', borderBottom: '1px solid var(--line)',
        background: 'rgba(0,0,0,.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6,
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent2)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
          📊 Enquete
          {isTargeted && <span style={{ marginLeft: 8, fontWeight: 600, textTransform: 'none' }}>· 👤 {targeting.emails!.length} usuário{targeting.emails!.length > 1 ? 's' : ''}</span>}
        </span>
        <span style={{ fontSize: 11, fontWeight: 700, color: bs.color, textTransform: 'uppercase', letterSpacing: '.06em' }}>
          {bs.icon} {badge}
        </span>
      </div>

      {/* Preview */}
      <div style={{ padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <div style={{ fontSize: 24, flexShrink: 0 }}>{m.emoji}</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{m.title}</div>
          {options.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {options.map(opt => (
                <span key={opt} style={{
                  fontSize: 11, padding: '2px 8px', borderRadius: 12,
                  background: 'var(--surface2)', border: '1px solid var(--line)',
                  color: 'var(--text3)',
                }}>
                  {opt}
                </span>
              ))}
            </div>
          )}
          {meta.open_question && (
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
              + {meta.open_question}
            </div>
          )}
        </div>
      </div>

      {/* Resultados expandíveis */}
      {expanded && (
        <div style={{
          padding: '12px 14px', borderTop: '1px solid var(--line)',
          background: 'rgba(0,0,0,.08)',
        }}>
          {loadingR ? (
            <div style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', padding: '8px 0' }}>
              ⏳ Carregando resultados…
            </div>
          ) : results && results.total > 0 ? (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 10 }}>
                {results.total} resposta{results.total > 1 ? 's' : ''}
              </div>
              {results.options.map(o => (
                <div key={o.option} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 500 }}>{o.option}</span>
                    <span style={{ fontSize: 11, color: 'var(--text3)' }}>{o.count} ({o.pct}%)</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: 'var(--surface3)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 3,
                      background: 'linear-gradient(90deg, var(--accent), var(--accent2))',
                      width: `${o.pct}%`, transition: 'width .4s ease',
                    }} />
                  </div>
                </div>
              ))}
              {results.comments.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 6 }}>
                    Comentários ({results.comments.length})
                  </div>
                  {results.comments.map((c, i) => (
                    <div key={i} style={{
                      fontSize: 12, color: 'var(--text2)', padding: '6px 10px',
                      background: 'var(--surface)', borderRadius: 8, marginBottom: 4,
                      borderLeft: '2px solid var(--accent)',
                    }}>
                      "{c.comment}"
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', padding: '8px 0' }}>
              Nenhuma resposta ainda.
            </div>
          )}
        </div>
      )}

      {/* Rodapé */}
      <div style={{
        padding: '8px 14px', borderTop: '1px solid var(--line)',
        background: 'rgba(0,0,0,.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6,
      }}>
        <button
          className="btn sm ghost"
          onClick={toggleResults}
          style={{ fontSize: 11 }}
        >
          {expanded ? '▲ Ocultar' : `📊 Ver resultados`}
        </button>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            className="btn sm ghost"
            onClick={() => onView(m)}
            style={{ fontSize: 11 }}
          >
            Ver
          </button>
          {canArchive && (
            <button
              className="btn sm ghost"
              onClick={() => onArchive(m.id)}
              style={{ color: 'var(--warn)', borderColor: 'rgba(251,191,36,.25)', fontSize: 11 }}
            >
              Arquivar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Templates de enquete ───────────────────────────────────────────────────────

const SURVEY_TEMPLATES = [
  { label: '⭐ Satisfação', options: ['Ótimo', 'Bom', 'Regular', 'Ruim'] },
  { label: '👍 Sim/Não',    options: ['Sim', 'Não'] },
  { label: '📈 NPS',        options: ['Recomendaria', 'Talvez', 'Não recomendaria'] },
  { label: '🔢 1–5',        options: ['1', '2', '3', '4', '5'] },
  { label: '✍️ Personalizada', options: [] },
] as const

// ── AdminPage ─────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { user } = useAuthStore()
  const adminEmail = user?.email ?? ''
  const [tab, setTab] = useState<'users' | 'messages' | 'surveys'>('users')

  // ── aba Usuários ───────────────────────────────────────────────────────────
  const [emails, setEmails]       = useState<EmailRow[]>([])
  const [newEmail, setNewEmail]   = useState('')
  const [loading, setLoading]     = useState(true)
  const [adding, setAdding]       = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [feedback, setFeedback]   = useState<Record<string, { type: 'ok' | 'err'; msg: string }>>({})
  const [inviting, setInviting]   = useState<string | null>(null)
  const [toggling, setToggling]   = useState<string | null>(null)

  // ── aba Mensagens + Enquetes ────────────────────────────────────────────────
  const { activeMessages, scheduled, history: msgHistory, loading: msgLoading, saving: msgSaving, totalUsers, publish, archive, resolvedStatus, loadSurveyResults } = useAdminMessages()
  const [msgEmoji, setMsgEmoji]         = useState('📢')
  const [msgTitle, setMsgTitle]         = useState('')
  const [msgBody, setMsgBody]           = useState('')
  const [msgImageUrl, setMsgImageUrl]   = useState('')
  const [msgStartsAt, setMsgStartsAt]   = useState('')   // datetime-local string
  const [msgExpiresAt, setMsgExpiresAt] = useState('')   // datetime-local string
  const [msgPriority, setMsgPriority]   = useState(0)
  const [msgTargetAll, setMsgTargetAll] = useState(true)
  const [msgTargetEmails, setMsgTargetEmails] = useState<string[]>([])
  const [msgFeedback, setMsgFeedback]         = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [msgPreviewOpen, setMsgPreviewOpen]   = useState(false)
  const [msgViewing, setMsgViewing]           = useState<AppMessageWithStats | null>(null)

  // ── aba Enquetes ────────────────────────────────────────────────────────────
  const [srvEmoji, setSrvEmoji]               = useState('📊')
  const [srvTitle, setSrvTitle]               = useState('')
  const [srvBody, setSrvBody]                 = useState('')
  const [srvOptions, setSrvOptions]           = useState<string[]>(['', ''])
  const [srvOpenQ, setSrvOpenQ]               = useState('')           // pergunta aberta (vazio = desabilitado)
  const [srvOpenEnabled, setSrvOpenEnabled]   = useState(false)
  const [srvTargetAll, setSrvTargetAll]       = useState(true)
  const [srvTargetEmails, setSrvTargetEmails] = useState<string[]>([])
  const [srvStartsAt, setSrvStartsAt]         = useState('')
  const [srvExpiresAt, setSrvExpiresAt]       = useState('')
  const [srvPriority, setSrvPriority]         = useState(0)
  const [srvFeedback, setSrvFeedback]         = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [srvPreviewOpen, setSrvPreviewOpen]   = useState(false)
  const [srvViewing, setSrvViewing]           = useState<AppMessageWithStats | null>(null)

  // helper: converte datetime-local (sem fuso) para ISO com fuso local
  function localToISO(val: string) {
    if (!val) return new Date().toISOString()
    return new Date(val).toISOString()
  }

  async function handlePublish(e: FormEvent) {
    e.preventDefault()
    setMsgFeedback(null)
    const targeting = msgTargetAll ? {} : { emails: msgTargetEmails }
    await publish({
      emoji:      msgEmoji,
      title:      msgTitle,
      body:       msgBody,
      starts_at:  msgStartsAt ? localToISO(msgStartsAt) : new Date().toISOString(),
      expires_at: msgExpiresAt ? localToISO(msgExpiresAt) : null,
      priority:   msgPriority,
      image_url:  msgImageUrl.trim() || null,
      targeting,
    })
    setMsgEmoji('📢')
    setMsgTitle('')
    setMsgBody('')
    setMsgImageUrl('')
    setMsgStartsAt('')
    setMsgExpiresAt('')
    setMsgPriority(0)
    setMsgTargetAll(true)
    setMsgTargetEmails([])
    const isScheduled = msgStartsAt && new Date(msgStartsAt) > new Date()
    setMsgFeedback({ type: 'ok', text: isScheduled ? 'Mensagem agendada! Será exibida no horário configurado.' : 'Mensagem publicada! Usuários verão na próxima abertura.' })
    setTimeout(() => setMsgFeedback(null), 6000)
  }

  async function handleArchive(id: string) {
    await archive(id)
    setMsgFeedback({ type: 'ok', text: 'Mensagem arquivada.' })
    setTimeout(() => setMsgFeedback(null), 4000)
  }

  async function handlePublishSurvey(e: FormEvent) {
    e.preventDefault()
    setSrvFeedback(null)
    const validOptions = srvOptions.map(o => o.trim()).filter(Boolean)
    if (validOptions.length < 2) {
      setSrvFeedback({ type: 'err', text: 'Adicione pelo menos 2 opções.' })
      return
    }
    const targeting = srvTargetAll ? {} : { emails: srvTargetEmails }
    const metadata: Record<string, unknown> = { options: validOptions }
    if (srvOpenEnabled && srvOpenQ.trim()) metadata.open_question = srvOpenQ.trim()

    await publish({
      emoji:        srvEmoji,
      title:        srvTitle,
      body:         srvBody,
      starts_at:    srvStartsAt ? localToISO(srvStartsAt) : new Date().toISOString(),
      expires_at:   srvExpiresAt ? localToISO(srvExpiresAt) : null,
      priority:     srvPriority,
      image_url:    null,
      targeting,
      message_type: 'survey',
      metadata,
    })
    // Reset
    setSrvEmoji('📊')
    setSrvTitle('')
    setSrvBody('')
    setSrvOptions(['', ''])
    setSrvOpenQ('')
    setSrvOpenEnabled(false)
    setSrvTargetAll(true)
    setSrvTargetEmails([])
    setSrvStartsAt('')
    setSrvExpiresAt('')
    setSrvPriority(0)
    const isScheduled = srvStartsAt && new Date(srvStartsAt) > new Date()
    setSrvFeedback({ type: 'ok', text: isScheduled ? 'Enquete agendada!' : 'Enquete publicada! Usuários verão na próxima abertura.' })
    setTimeout(() => setSrvFeedback(null), 6000)
  }

  function applyTemplate(options: readonly string[]) {
    setSrvOptions(options.length > 0 ? [...options] : ['', ''])
  }

  function updateSrvOption(idx: number, val: string) {
    setSrvOptions(prev => prev.map((o, i) => i === idx ? val : o))
  }

  function addSrvOption() {
    if (srvOptions.length < 5) setSrvOptions(prev => [...prev, ''])
  }

  function removeSrvOption(idx: number) {
    if (srvOptions.length > 2) setSrvOptions(prev => prev.filter((_, i) => i !== idx))
  }

  function toggleSrvEmail(email: string) {
    setSrvTargetEmails(prev =>
      prev.includes(email) ? prev.filter(x => x !== email) : [...prev, email]
    )
  }

  function toggleTargetEmail(email: string) {
    setMsgTargetEmails(prev =>
      prev.includes(email) ? prev.filter(x => x !== email) : [...prev, email]
    )
  }

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

        {/* ── Abas ────────────────────────────────────────────────────────── */}
        <div style={{
          display: 'flex', gap: 4, marginBottom: 20,
          background: 'var(--surface)', border: '1px solid var(--line)',
          borderRadius: 'var(--radius-sm)', padding: 4,
        }}>
          {(['users', 'messages', 'surveys'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 12, fontWeight: 600,
                border: 'none', cursor: 'pointer', transition: 'all .15s',
                background: tab === t ? 'var(--accent)' : 'transparent',
                color: tab === t ? '#fff' : 'var(--text3)',
              }}
            >
              {t === 'users' ? '👥 Usuários' : t === 'messages' ? '📢 Mensagens' : '📊 Enquetes'}
            </button>
          ))}
        </div>

        {/* ══ ABA: USUÁRIOS ══════════════════════════════════════════════ */}
        {tab === 'users' && <>

          {/* ── KPI Stats ────────────────────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 20 }}>
            <StatKpi label="Total"      value={total}      color="var(--text)"  />
            <StatKpi label="Ativos"     value={ativos}     color="var(--good)"  />
            <StatKpi label="Convidados" value={convidados} color="var(--warn)"  />
            <StatKpi label="Pendentes"  value={pendentes}  color="var(--text3)" />
          </div>

          {/* ── Formulário adicionar ──────────────────────────────────────── */}
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

          {/* ── Lista de usuários ────────────────────────────────────────── */}
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
        </>}

        {/* ══ ABA: MENSAGENS ═════════════════════════════════════════════ */}
        {tab === 'messages' && <>

          {/* Feedback global */}
          {msgFeedback && (
            <div style={{
              marginBottom: 16, padding: '10px 14px', borderRadius: 10,
              background: msgFeedback.type === 'ok' ? 'rgba(52,211,153,.1)' : 'rgba(248,113,113,.1)',
              border: `1px solid ${msgFeedback.type === 'ok' ? 'rgba(52,211,153,.25)' : 'rgba(248,113,113,.25)'}`,
              fontSize: 13, fontWeight: 600,
              color: msgFeedback.type === 'ok' ? 'var(--good)' : 'var(--bad)',
            }}>
              {msgFeedback.type === 'ok' ? '✅' : '❌'} {msgFeedback.text}
            </div>
          )}

          {msgLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[1, 2].map(i => (
                <div key={i} style={{
                  height: 80, borderRadius: 'var(--radius)',
                  background: 'var(--surface)', border: '1px solid var(--line)',
                  animation: 'pulse 1.5s ease-in-out infinite',
                  opacity: 1 - i * 0.2,
                }} />
              ))}
            </div>
          ) : (
            <>
              {/* ── Mensagens ativas ── */}
              {activeMessages.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--good)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>
                    🟢 Ativas ({activeMessages.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {activeMessages.map(m => (
                      <MsgCard key={m.id} m={m} totalUsers={totalUsers} onArchive={handleArchive} onView={setMsgViewing} badge="ativa" />
                    ))}
                  </div>
                </div>
              )}

              {/* ── Mensagens agendadas ── */}
              {scheduled.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent2)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>
                    🕐 Agendadas ({scheduled.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {scheduled.map(m => (
                      <MsgCard key={m.id} m={m} totalUsers={totalUsers} onArchive={handleArchive} onView={setMsgViewing} badge="agendada" />
                    ))}
                  </div>
                </div>
              )}

              {/* ── Formulário nova mensagem ── */}
              <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-header">
                  <div className="ch-info">
                    <b>Nova mensagem</b>
                    <span>Aparece 1× para cada destinatário</span>
                  </div>
                </div>
                <div className="card-body">
                  <form onSubmit={handlePublish} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

                    {/* Emoji + Título */}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        type="text" required maxLength={4}
                        value={msgEmoji} onChange={e => setMsgEmoji(e.target.value)}
                        placeholder="📢"
                        style={{
                          width: 52, textAlign: 'center', fontSize: 20, flexShrink: 0,
                          background: 'var(--surface2)', border: '1px solid var(--line)',
                          borderRadius: 'var(--radius-xs)', color: 'var(--text)',
                          padding: '8px 4px', outline: 'none', fontFamily: 'var(--font)',
                        }}
                      />
                      <input
                        type="text" required
                        value={msgTitle} onChange={e => setMsgTitle(e.target.value)}
                        placeholder="Título da mensagem"
                        style={{
                          flex: 1, background: 'var(--surface2)', border: '1px solid var(--line)',
                          borderRadius: 'var(--radius-xs)', color: 'var(--text)',
                          padding: '8px 12px', fontSize: 14, outline: 'none', fontFamily: 'var(--font)',
                        }}
                      />
                    </div>

                    {/* Corpo */}
                    <textarea
                      required rows={4}
                      value={msgBody} onChange={e => setMsgBody(e.target.value)}
                      placeholder={"Texto da mensagem.\n\nUse **negrito**, *itálico*, `código` e Enter para quebras de linha."}
                      style={{
                        background: 'var(--surface2)', border: '1px solid var(--line)',
                        borderRadius: 'var(--radius-xs)', color: 'var(--text)',
                        padding: '10px 12px', fontSize: 13, outline: 'none',
                        fontFamily: 'var(--font)', resize: 'vertical', lineHeight: 1.6,
                      }}
                    />

                    {/* Preview ao vivo */}
                    {msgBody.trim() && (
                      <div style={{
                        background: 'var(--surface)', border: '1px solid var(--line)',
                        borderRadius: 'var(--radius-xs)', padding: '10px 12px',
                      }}>
                        <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 6 }}>
                          Preview do texto
                        </div>
                        <MarkdownBody text={msgBody} style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }} />
                      </div>
                    )}

                    {/* Imagem (URL) */}
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.04em' }}>
                        Imagem (opcional)
                      </div>
                      <input
                        type="url"
                        value={msgImageUrl} onChange={e => setMsgImageUrl(e.target.value)}
                        placeholder="https://… (URL da imagem)"
                        style={{
                          width: '100%', background: 'var(--surface2)', border: '1px solid var(--line)',
                          borderRadius: 'var(--radius-xs)', color: 'var(--text)',
                          padding: '8px 12px', fontSize: 13, outline: 'none', fontFamily: 'var(--font)',
                          boxSizing: 'border-box',
                        }}
                      />
                      {msgImageUrl.trim() && (
                        <img
                          src={msgImageUrl}
                          alt="preview"
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                          style={{ marginTop: 8, width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 8 }}
                        />
                      )}
                    </div>

                    {/* Agendamento */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.04em' }}>
                          Publicar em
                        </div>
                        <input
                          type="datetime-local"
                          value={msgStartsAt} onChange={e => setMsgStartsAt(e.target.value)}
                          style={{
                            width: '100%', background: 'var(--surface2)', border: '1px solid var(--line)',
                            borderRadius: 'var(--radius-xs)', color: msgStartsAt ? 'var(--text)' : 'var(--text3)',
                            padding: '8px 10px', fontSize: 12, outline: 'none', fontFamily: 'var(--font)',
                            boxSizing: 'border-box',
                          }}
                        />
                        <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 3 }}>Vazio = agora</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.04em' }}>
                          Expirar em
                        </div>
                        <input
                          type="datetime-local"
                          value={msgExpiresAt} onChange={e => setMsgExpiresAt(e.target.value)}
                          style={{
                            width: '100%', background: 'var(--surface2)', border: '1px solid var(--line)',
                            borderRadius: 'var(--radius-xs)', color: msgExpiresAt ? 'var(--text)' : 'var(--text3)',
                            padding: '8px 10px', fontSize: 12, outline: 'none', fontFamily: 'var(--font)',
                            boxSizing: 'border-box',
                          }}
                        />
                        <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 3 }}>Vazio = nunca expira</div>
                      </div>
                    </div>

                    {/* Prioridade */}
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.04em' }}>
                        Prioridade (maior = aparece primeiro)
                      </div>
                      <input
                        type="number" min={0} max={100}
                        value={msgPriority} onChange={e => setMsgPriority(Number(e.target.value))}
                        style={{
                          width: 80, background: 'var(--surface2)', border: '1px solid var(--line)',
                          borderRadius: 'var(--radius-xs)', color: 'var(--text)',
                          padding: '8px 12px', fontSize: 13, outline: 'none', fontFamily: 'var(--font)',
                        }}
                      />
                    </div>

                    {/* Destinatários */}
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.04em' }}>
                        Destinatários
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                        {(['all', 'specific'] as const).map(opt => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => { setMsgTargetAll(opt === 'all'); setMsgTargetEmails([]) }}
                            style={{
                              padding: '6px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                              background: (opt === 'all') === msgTargetAll ? 'var(--accent)' : 'var(--surface2)',
                              border: `1px solid ${(opt === 'all') === msgTargetAll ? 'var(--accent)' : 'var(--line)'}`,
                              color: (opt === 'all') === msgTargetAll ? '#fff' : 'var(--text2)',
                              fontFamily: 'var(--font)',
                            }}
                          >
                            {opt === 'all' ? '🌐 Todos' : '👤 Selecionar'}
                          </button>
                        ))}
                      </div>
                      {!msgTargetAll && (
                        <>
                          {/* Botão "Me incluir" */}
                          {adminEmail && !msgTargetEmails.includes(adminEmail) && (
                            <button
                              type="button"
                              onClick={() => setMsgTargetEmails(prev => [...prev, adminEmail])}
                              style={{
                                marginBottom: 6, padding: '5px 12px', borderRadius: 16, fontSize: 12, cursor: 'pointer',
                                background: 'rgba(124,92,255,.12)', border: '1px solid rgba(124,92,255,.3)',
                                color: 'var(--accent2)', fontFamily: 'var(--font)',
                              }}
                            >
                              + Me incluir ({adminEmail})
                            </button>
                          )}
                          <div style={{
                            maxHeight: 180, overflowY: 'auto',
                            background: 'var(--surface)', border: '1px solid var(--line)',
                            borderRadius: 'var(--radius-xs)', padding: '4px 0',
                          }}>
                            {/* Admin no topo se selecionado */}
                            {msgTargetEmails.includes(adminEmail) && (
                              <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid var(--line)', background: 'rgba(124,92,255,.06)' }}>
                                <input
                                  type="checkbox"
                                  checked
                                  onChange={() => setMsgTargetEmails(prev => prev.filter(x => x !== adminEmail))}
                                  style={{ accentColor: 'var(--accent)', width: 15, height: 15, flexShrink: 0 }}
                                />
                                <span style={{ fontSize: 13, color: 'var(--accent2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>
                                  {adminEmail} (você)
                                </span>
                              </label>
                            )}
                            {emails.filter(e => e.accepted_at && e.ativo !== false).map(e => (
                              <label
                                key={e.id}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: 10,
                                  padding: '8px 12px', cursor: 'pointer',
                                  borderBottom: '1px solid var(--line)',
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={msgTargetEmails.includes(e.email)}
                                  onChange={() => toggleTargetEmail(e.email)}
                                  style={{ accentColor: 'var(--accent)', width: 15, height: 15, flexShrink: 0 }}
                                />
                                <span style={{ fontSize: 13, color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {e.email}
                                </span>
                              </label>
                            ))}
                            {emails.filter(e => e.accepted_at && e.ativo !== false).length === 0 && (
                              <div style={{ padding: '12px', fontSize: 12, color: 'var(--text3)', textAlign: 'center' }}>
                                Nenhum usuário ativo ainda.
                              </div>
                            )}
                          </div>
                        </>
                      )}
                      {!msgTargetAll && msgTargetEmails.length > 0 && (
                        <div style={{ fontSize: 11, color: 'var(--accent2)', marginTop: 6 }}>
                          {msgTargetEmails.length} usuário{msgTargetEmails.length > 1 ? 's' : ''} selecionado{msgTargetEmails.length > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        type="button"
                        className="btn ghost"
                        disabled={!msgTitle.trim() || !msgBody.trim()}
                        onClick={() => setMsgPreviewOpen(true)}
                        style={{ flex: '0 0 auto' }}
                      >
                        Pré-visualizar
                      </button>
                      <button
                        type="submit" className="btn primary"
                        disabled={msgSaving || (!msgTargetAll && msgTargetEmails.length === 0)}
                        style={{ flex: 1 }}
                      >
                        {msgSaving ? '⏳ Publicando…' : msgStartsAt && new Date(msgStartsAt) > new Date() ? 'Agendar mensagem' : 'Publicar agora'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* ── Histórico (arquivadas + expiradas) ── */}
              {msgHistory.length > 0 && (
                <>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>
                    Histórico
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {msgHistory.map(m => (
                      <MsgCard key={m.id} m={m} totalUsers={totalUsers} onArchive={handleArchive} onView={setMsgViewing} badge={resolvedStatus(m)} />
                    ))}
                  </div>
                </>
              )}

              {/* Estado vazio */}
              {activeMessages.length === 0 && scheduled.length === 0 && msgHistory.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text3)', fontSize: 13 }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>📢</div>
                  Nenhuma mensagem ainda.<br />
                  Crie uma acima para começar.
                </div>
              )}

              {/* Modal de visualização (ver mensagem publicada) */}
              {msgViewing && (
                <AppMessageModal
                  message={msgViewing}
                  onDismiss={() => setMsgViewing(null)}
                  adminMode
                />
              )}

              {/* Modal de preview (formulário) */}
              {msgPreviewOpen && (
                <AppMessageModal
                  message={{
                    id: '__preview__',
                    created_at: new Date().toISOString(),
                    title:          msgTitle || 'Título da mensagem',
                    body:           msgBody  || 'Corpo da mensagem.',
                    emoji:          msgEmoji || '📢',
                    image_url:      msgImageUrl.trim() || 'https://picsum.photos/600/200',
                    message_type:   'announcement',
                    display_format: 'modal',
                    status:         'active',
                    starts_at:      new Date().toISOString(),
                    expires_at:     null,
                    targeting:      {},
                    priority:       0,
                    max_shows:      1,
                    dismissible:    true,
                    cta_label:      null,
                    cta_url:        null,
                    metadata:       {},
                  }}
                  onDismiss={() => setMsgPreviewOpen(false)}
                />
              )}
            </>
          )}
        </>}

        {/* ══ ABA: ENQUETES ═══════════════════════════════════════════════ */}
        {tab === 'surveys' && <>

          {/* Feedback global */}
          {srvFeedback && (
            <div style={{
              marginBottom: 16, padding: '10px 14px', borderRadius: 10,
              background: srvFeedback.type === 'ok' ? 'rgba(52,211,153,.1)' : 'rgba(248,113,113,.1)',
              border: `1px solid ${srvFeedback.type === 'ok' ? 'rgba(52,211,153,.25)' : 'rgba(248,113,113,.25)'}`,
              fontSize: 13, fontWeight: 600,
              color: srvFeedback.type === 'ok' ? 'var(--good)' : 'var(--bad)',
            }}>
              {srvFeedback.type === 'ok' ? '✅' : '❌'} {srvFeedback.text}
            </div>
          )}

          {msgLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[1, 2].map(i => (
                <div key={i} style={{
                  height: 80, borderRadius: 'var(--radius)',
                  background: 'var(--surface)', border: '1px solid var(--line)',
                  animation: 'pulse 1.5s ease-in-out infinite',
                  opacity: 1 - i * 0.2,
                }} />
              ))}
            </div>
          ) : (
            <>
              {/* ── Enquetes ativas ── */}
              {activeMessages.filter(m => m.message_type === 'survey').length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--good)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>
                    🟢 Ativas ({activeMessages.filter(m => m.message_type === 'survey').length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {activeMessages.filter(m => m.message_type === 'survey').map(m => (
                      <SurveyCard key={m.id} m={m} onArchive={handleArchive} onView={setSrvViewing} badge="ativa" onLoadResults={loadSurveyResults} />
                    ))}
                  </div>
                </div>
              )}

              {/* ── Enquetes agendadas ── */}
              {scheduled.filter(m => m.message_type === 'survey').length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent2)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>
                    🕐 Agendadas ({scheduled.filter(m => m.message_type === 'survey').length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {scheduled.filter(m => m.message_type === 'survey').map(m => (
                      <SurveyCard key={m.id} m={m} onArchive={handleArchive} onView={setSrvViewing} badge="agendada" onLoadResults={loadSurveyResults} />
                    ))}
                  </div>
                </div>
              )}

              {/* ── Formulário nova enquete ── */}
              <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-header">
                  <div className="ch-info">
                    <b>Nova enquete</b>
                    <span>1 pergunta de múltipla escolha + aberta opcional</span>
                  </div>
                </div>
                <div className="card-body">
                  <form onSubmit={handlePublishSurvey} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

                    {/* Emoji + Título */}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        type="text" required maxLength={4}
                        value={srvEmoji} onChange={e => setSrvEmoji(e.target.value)}
                        placeholder="📊"
                        style={{
                          width: 52, textAlign: 'center', fontSize: 20, flexShrink: 0,
                          background: 'var(--surface2)', border: '1px solid var(--line)',
                          borderRadius: 'var(--radius-xs)', color: 'var(--text)',
                          padding: '8px 4px', outline: 'none', fontFamily: 'var(--font)',
                        }}
                      />
                      <input
                        type="text" required
                        value={srvTitle} onChange={e => setSrvTitle(e.target.value)}
                        placeholder="Título da enquete"
                        style={{
                          flex: 1, background: 'var(--surface2)', border: '1px solid var(--line)',
                          borderRadius: 'var(--radius-xs)', color: 'var(--text)',
                          padding: '8px 12px', fontSize: 14, outline: 'none', fontFamily: 'var(--font)',
                        }}
                      />
                    </div>

                    {/* Texto descritivo (opcional) */}
                    <textarea
                      rows={2}
                      value={srvBody} onChange={e => setSrvBody(e.target.value)}
                      placeholder="Texto explicativo (opcional)"
                      style={{
                        background: 'var(--surface2)', border: '1px solid var(--line)',
                        borderRadius: 'var(--radius-xs)', color: 'var(--text)',
                        padding: '10px 12px', fontSize: 13, outline: 'none',
                        fontFamily: 'var(--font)', resize: 'vertical', lineHeight: 1.6,
                      }}
                    />

                    {/* Templates */}
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.04em' }}>
                        Template de opções
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {SURVEY_TEMPLATES.map(t => (
                          <button
                            key={t.label}
                            type="button"
                            onClick={() => applyTemplate(t.options)}
                            style={{
                              padding: '5px 10px', borderRadius: 16, fontSize: 12, cursor: 'pointer',
                              background: 'var(--surface2)', border: '1px solid var(--line)',
                              color: 'var(--text2)', fontFamily: 'var(--font)',
                              transition: 'all .15s',
                            }}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Opções */}
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.04em' }}>
                        Opções ({srvOptions.length}/5)
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {srvOptions.map((opt, idx) => (
                          <div key={idx} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <span style={{ fontSize: 12, color: 'var(--text3)', width: 16, textAlign: 'center', flexShrink: 0 }}>
                              {idx + 1}.
                            </span>
                            <input
                              type="text"
                              value={opt}
                              onChange={e => updateSrvOption(idx, e.target.value)}
                              placeholder={`Opção ${idx + 1}`}
                              maxLength={60}
                              style={{
                                flex: 1, background: 'var(--surface2)', border: '1px solid var(--line)',
                                borderRadius: 'var(--radius-xs)', color: 'var(--text)',
                                padding: '7px 10px', fontSize: 13, outline: 'none', fontFamily: 'var(--font)',
                              }}
                            />
                            {srvOptions.length > 2 && (
                              <button
                                type="button"
                                onClick={() => removeSrvOption(idx)}
                                style={{
                                  width: 26, height: 26, borderRadius: '50%',
                                  background: 'var(--surface2)', border: '1px solid var(--line)',
                                  color: 'var(--text3)', cursor: 'pointer', fontSize: 13,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  flexShrink: 0,
                                }}
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      {srvOptions.length < 5 && (
                        <button
                          type="button"
                          onClick={addSrvOption}
                          style={{
                            marginTop: 8, padding: '5px 12px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
                            background: 'transparent', border: '1px dashed var(--line)',
                            color: 'var(--text3)', fontFamily: 'var(--font)',
                          }}
                        >
                          + Adicionar opção
                        </button>
                      )}
                    </div>

                    {/* Pergunta aberta */}
                    <div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={srvOpenEnabled}
                          onChange={e => setSrvOpenEnabled(e.target.checked)}
                          style={{ accentColor: 'var(--accent)', width: 15, height: 15 }}
                        />
                        <span style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 500 }}>
                          Adicionar pergunta aberta
                        </span>
                      </label>
                      {srvOpenEnabled && (
                        <input
                          type="text"
                          value={srvOpenQ}
                          onChange={e => setSrvOpenQ(e.target.value)}
                          placeholder="Ex: O que você mudaria?"
                          maxLength={100}
                          style={{
                            marginTop: 8, width: '100%', boxSizing: 'border-box',
                            background: 'var(--surface2)', border: '1px solid var(--line)',
                            borderRadius: 'var(--radius-xs)', color: 'var(--text)',
                            padding: '8px 12px', fontSize: 13, outline: 'none', fontFamily: 'var(--font)',
                          }}
                        />
                      )}
                    </div>

                    {/* Agendamento */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.04em' }}>Publicar em</div>
                        <input
                          type="datetime-local"
                          value={srvStartsAt} onChange={e => setSrvStartsAt(e.target.value)}
                          style={{
                            width: '100%', background: 'var(--surface2)', border: '1px solid var(--line)',
                            borderRadius: 'var(--radius-xs)', color: srvStartsAt ? 'var(--text)' : 'var(--text3)',
                            padding: '8px 10px', fontSize: 12, outline: 'none', fontFamily: 'var(--font)',
                            boxSizing: 'border-box',
                          }}
                        />
                        <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 3 }}>Vazio = agora</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.04em' }}>Expirar em</div>
                        <input
                          type="datetime-local"
                          value={srvExpiresAt} onChange={e => setSrvExpiresAt(e.target.value)}
                          style={{
                            width: '100%', background: 'var(--surface2)', border: '1px solid var(--line)',
                            borderRadius: 'var(--radius-xs)', color: srvExpiresAt ? 'var(--text)' : 'var(--text3)',
                            padding: '8px 10px', fontSize: 12, outline: 'none', fontFamily: 'var(--font)',
                            boxSizing: 'border-box',
                          }}
                        />
                        <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 3 }}>Vazio = nunca expira</div>
                      </div>
                    </div>

                    {/* Destinatários */}
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.04em' }}>
                        Destinatários
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                        {(['all', 'specific'] as const).map(opt => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => { setSrvTargetAll(opt === 'all'); setSrvTargetEmails([]) }}
                            style={{
                              padding: '6px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                              background: (opt === 'all') === srvTargetAll ? 'var(--accent)' : 'var(--surface2)',
                              border: `1px solid ${(opt === 'all') === srvTargetAll ? 'var(--accent)' : 'var(--line)'}`,
                              color: (opt === 'all') === srvTargetAll ? '#fff' : 'var(--text2)',
                              fontFamily: 'var(--font)',
                            }}
                          >
                            {opt === 'all' ? '🌐 Todos' : '👤 Selecionar'}
                          </button>
                        ))}
                      </div>
                      {!srvTargetAll && (
                        <>
                          {/* Botão "Me incluir" */}
                          {adminEmail && !srvTargetEmails.includes(adminEmail) && (
                            <button
                              type="button"
                              onClick={() => setSrvTargetEmails(prev => [...prev, adminEmail])}
                              style={{
                                marginBottom: 6, padding: '5px 12px', borderRadius: 16, fontSize: 12, cursor: 'pointer',
                                background: 'rgba(124,92,255,.12)', border: '1px solid rgba(124,92,255,.3)',
                                color: 'var(--accent2)', fontFamily: 'var(--font)',
                              }}
                            >
                              + Me incluir ({adminEmail})
                            </button>
                          )}
                          <div style={{
                            maxHeight: 180, overflowY: 'auto',
                            background: 'var(--surface)', border: '1px solid var(--line)',
                            borderRadius: 'var(--radius-xs)', padding: '4px 0',
                          }}>
                            {/* Admin no topo se selecionado */}
                            {srvTargetEmails.includes(adminEmail) && (
                              <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid var(--line)', background: 'rgba(124,92,255,.06)' }}>
                                <input
                                  type="checkbox"
                                  checked
                                  onChange={() => setSrvTargetEmails(prev => prev.filter(x => x !== adminEmail))}
                                  style={{ accentColor: 'var(--accent)', width: 15, height: 15, flexShrink: 0 }}
                                />
                                <span style={{ fontSize: 13, color: 'var(--accent2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>
                                  {adminEmail} (você)
                                </span>
                              </label>
                            )}
                            {emails.filter(e => e.accepted_at && e.ativo !== false).map(e => (
                              <label
                                key={e.id}
                                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid var(--line)' }}
                              >
                                <input
                                  type="checkbox"
                                  checked={srvTargetEmails.includes(e.email)}
                                  onChange={() => toggleSrvEmail(e.email)}
                                  style={{ accentColor: 'var(--accent)', width: 15, height: 15, flexShrink: 0 }}
                                />
                                <span style={{ fontSize: 13, color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {e.email}
                                </span>
                              </label>
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Botões */}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        type="button"
                        className="btn ghost"
                        disabled={!srvTitle.trim() || srvOptions.filter(o => o.trim()).length < 2}
                        onClick={() => setSrvPreviewOpen(true)}
                        style={{ flex: '0 0 auto' }}
                      >
                        Pré-visualizar
                      </button>
                      <button
                        type="submit" className="btn primary"
                        disabled={msgSaving || (!srvTargetAll && srvTargetEmails.length === 0)}
                        style={{ flex: 1 }}
                      >
                        {msgSaving ? '⏳ Publicando…' : srvStartsAt && new Date(srvStartsAt) > new Date() ? 'Agendar enquete' : 'Publicar enquete'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* ── Histórico de enquetes ── */}
              {msgHistory.filter(m => m.message_type === 'survey').length > 0 && (
                <>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>
                    Histórico
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {msgHistory.filter(m => m.message_type === 'survey').map(m => (
                      <SurveyCard key={m.id} m={m} onArchive={handleArchive} onView={setSrvViewing} badge={resolvedStatus(m)} onLoadResults={loadSurveyResults} />
                    ))}
                  </div>
                </>
              )}

              {/* Estado vazio */}
              {activeMessages.filter(m => m.message_type === 'survey').length === 0 &&
               scheduled.filter(m => m.message_type === 'survey').length === 0 &&
               msgHistory.filter(m => m.message_type === 'survey').length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text3)', fontSize: 13 }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>📊</div>
                  Nenhuma enquete ainda.<br />
                  Crie uma acima para começar.
                </div>
              )}

              {/* Modal de visualização */}
              {srvViewing && (
                <AppMessageModal
                  message={srvViewing}
                  onDismiss={() => setSrvViewing(null)}
                  adminMode
                />
              )}

              {/* Modal de preview */}
              {srvPreviewOpen && (
                <AppMessageModal
                  message={{
                    id: '__preview__',
                    created_at: new Date().toISOString(),
                    title:          srvTitle || 'Título da enquete',
                    body:           srvBody,
                    emoji:          srvEmoji || '📊',
                    image_url:      null,
                    message_type:   'survey',
                    display_format: 'modal',
                    status:         'active',
                    starts_at:      new Date().toISOString(),
                    expires_at:     null,
                    targeting:      {},
                    priority:       0,
                    max_shows:      1,
                    dismissible:    true,
                    cta_label:      null,
                    cta_url:        null,
                    metadata: {
                      options: srvOptions.filter(o => o.trim()),
                      ...(srvOpenEnabled && srvOpenQ.trim() ? { open_question: srvOpenQ } : {}),
                    },
                  }}
                  onDismiss={() => setSrvPreviewOpen(false)}
                  adminMode
                />
              )}
            </>
          )}
        </>}

      </div>
    </div>
  )
}
