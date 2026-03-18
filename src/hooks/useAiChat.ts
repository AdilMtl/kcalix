import { useState } from 'react'
import { supabase } from '../lib/supabase'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export function useAiChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function sendMessage(text: string) {
    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: text }]
    setMessages(newMessages)
    setLoading(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Sessão expirada')

      const res = await supabase.functions.invoke('ai-chat', {
        body: { messages: newMessages },
        headers: { Authorization: `Bearer ${session.access_token}` },
      })

      if (res.error) throw new Error(res.error.message)

      const reply = (res.data as { reply: string }).reply
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setMessages([])
    setError(null)
  }

  return { messages, loading, error, sendMessage, reset }
}
