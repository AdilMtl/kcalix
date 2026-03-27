import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface AppMessage {
  id: string
  created_at: string
  title: string
  body: string
  emoji: string
  message_type: string
  display_format: string
  status: string
  starts_at: string
  expires_at: string | null
  targeting: Record<string, unknown>
  priority: number
  max_shows: number | null
  dismissible: boolean
  cta_label: string | null
  cta_url: string | null
  image_url: string | null
  metadata: Record<string, unknown>
}

// ── Hook: usuário ─────────────────────────────────────────────────────────────
// Busca a mensagem ativa não dispensada pelo usuário atual.
// Filtra targeting.user_ids no frontend (todos os usuários são confiáveis).

export function useAppMessage() {
  const { user } = useAuthStore()
  const [message, setMessage] = useState<AppMessage | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    load()
  }, [user])

  async function load() {
    setLoading(true)

    // Busca mensagens ativas (RLS já filtra status=active + starts_at <= now + expires_at)
    const { data: messages } = await supabase
      .from('app_messages')
      .select('*')
      .eq('status', 'active')
      .lte('starts_at', new Date().toISOString())
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })

    if (!messages || messages.length === 0) {
      setMessage(null)
      setLoading(false)
      return
    }

    // Filtro de targeting por email (frontend — todos os usuários são confiáveis)
    const userEmail = user!.email ?? ''
    const targeted = (messages as AppMessage[]).filter(m => {
      const emails = (m.targeting as { emails?: string[] }).emails
      if (!emails || emails.length === 0) return true    // sem restrição → todos
      return emails.includes(userEmail)
    })

    if (targeted.length === 0) {
      setMessage(null)
      setLoading(false)
      return
    }

    // Busca eventos 'dismissed' do usuário para essas mensagens
    const ids = targeted.map(m => m.id)
    const { data: events } = await supabase
      .from('app_message_events')
      .select('message_id')
      .eq('user_id', user!.id)
      .eq('event_type', 'dismissed')
      .in('message_id', ids)

    const dismissed = new Set((events ?? []).map(e => e.message_id))
    const next = targeted.find(m => !dismissed.has(m.id)) ?? null
    setMessage(next)
    setLoading(false)
  }

  async function dismiss() {
    if (!message || !user) return
    setMessage(null) // optimistic
    await supabase
      .from('app_message_events')
      .upsert(
        { message_id: message.id, user_id: user.id, event_type: 'dismissed' },
        { onConflict: 'message_id,user_id,event_type' }
      )
  }

  return { message, loading, dismiss }
}

// ── Hook: admin ───────────────────────────────────────────────────────────────

export interface AppMessageWithStats extends AppMessage {
  dismissed_count: number
}

export type PublishFields = {
  emoji: string
  title: string
  body: string
  starts_at: string        // ISO string
  expires_at: string | null
  priority: number
  image_url: string | null
  targeting: Record<string, unknown>  // {} = todos; { emails: [...] } = específicos
}

export function useAdminMessages() {
  const [messages, setMessages]     = useState<AppMessageWithStats[]>([])
  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)
  const [totalUsers, setTotalUsers] = useState(0)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)

    // Admin vê todas as mensagens via RLS admin_all (sem filtro de status)
    const { data: msgs } = await supabase
      .from('app_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30)

    // Total de usuários ativos para métrica "X / Y viram"
    const { count } = await supabase
      .from('authorized_emails')
      .select('*', { count: 'exact', head: true })
      .eq('ativo', true)
      .not('accepted_at', 'is', null)

    setTotalUsers(count ?? 0)

    if (!msgs || msgs.length === 0) {
      setMessages([])
      setLoading(false)
      return
    }

    // Contagem de eventos 'dismissed' por mensagem
    const { data: events } = await supabase
      .from('app_message_events')
      .select('message_id')
      .eq('event_type', 'dismissed')
      .in('message_id', msgs.map(m => m.id))

    const counts: Record<string, number> = {}
    for (const e of events ?? []) {
      counts[e.message_id] = (counts[e.message_id] ?? 0) + 1
    }

    setMessages(
      (msgs as AppMessage[]).map(m => ({
        ...m,
        dismissed_count: counts[m.id] ?? 0,
      }))
    )
    setLoading(false)
  }

  async function publish(fields: PublishFields) {
    setSaving(true)
    await supabase
      .from('app_messages')
      .insert({
        emoji:      fields.emoji,
        title:      fields.title,
        body:       fields.body,
        status:     'active',
        starts_at:  fields.starts_at,
        expires_at: fields.expires_at ?? null,
        priority:   fields.priority,
        image_url:  fields.image_url ?? null,
        targeting:  fields.targeting,
      })
    await load()
    setSaving(false)
  }

  async function archive(id: string) {
    await supabase
      .from('app_messages')
      .update({ status: 'archived' })
      .eq('id', id)
    await load()
  }

  // Helpers de status derivado (para badge na UI)
  function resolvedStatus(m: AppMessage): 'agendada' | 'ativa' | 'expirada' | 'arquivada' {
    if (m.status === 'archived') return 'arquivada'
    const now = new Date()
    if (new Date(m.starts_at) > now) return 'agendada'
    if (m.expires_at && new Date(m.expires_at) < now) return 'expirada'
    return 'ativa'
  }

  const activeMessages  = messages.filter(m => resolvedStatus(m) === 'ativa')
  const scheduled       = messages.filter(m => resolvedStatus(m) === 'agendada')
  const history         = messages.filter(m => resolvedStatus(m) === 'arquivada' || resolvedStatus(m) === 'expirada').slice(0, 5)

  return { messages, activeMessages, scheduled, history, loading, saving, totalUsers, publish, archive, resolvedStatus }
}
