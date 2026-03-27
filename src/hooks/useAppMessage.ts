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
// Busca a mensagem ativa não dispensada pelo usuário atual

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

    // Busca mensagens ativas
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

    // Busca eventos 'dismissed' do usuário para essas mensagens
    const ids = messages.map(m => m.id)
    const { data: events } = await supabase
      .from('app_message_events')
      .select('message_id')
      .eq('user_id', user!.id)
      .eq('event_type', 'dismissed')
      .in('message_id', ids)

    const dismissed = new Set((events ?? []).map(e => e.message_id))
    const next = messages.find(m => !dismissed.has(m.id)) ?? null
    setMessage(next as AppMessage | null)
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
// CRUD de mensagens + métricas para o painel /kcx-studio

export interface AppMessageWithStats extends AppMessage {
  dismissed_count: number
}

export function useAdminMessages() {
  const [messages, setMessages] = useState<AppMessageWithStats[]>([])
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [totalUsers, setTotalUsers] = useState(0)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)

    // Mensagens (admin vê todas via RLS admin_all)
    const { data: msgs } = await supabase
      .from('app_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)

    // Contagem total de usuários autorizados (para métrica "X / Y viram")
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

  async function publish(fields: { emoji: string; title: string; body: string }) {
    setSaving(true)

    // Arquivar todas as ativas antes de publicar nova
    await supabase
      .from('app_messages')
      .update({ status: 'archived' })
      .eq('status', 'active')

    await supabase
      .from('app_messages')
      .insert({
        emoji: fields.emoji,
        title: fields.title,
        body: fields.body,
        status: 'active',
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

  const active   = messages.find(m => m.status === 'active') ?? null
  const history  = messages.filter(m => m.status === 'archived').slice(0, 5)

  return { active, history, loading, saving, totalUsers, publish, archive }
}
