import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { getFoodIndex, buildFoodLookup } from '../data/foodDb'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface PendingLogItem {
  foodId: string | null   // null = custom (não encontrado no banco)
  nome: string
  grams: number
  source: 'db' | 'custom'
  // macros base por 100g (para recalcular ao editar gramas)
  pPer100: number
  cPer100: number
  gPer100: number
  kcalPer100: number
}

export interface PendingLog {
  meal: string | null     // null = usuário precisa selecionar
  items: PendingLogItem[]
}

// Palavras que indicam intenção de registrar refeição (7B-4: substituir por detecção via IA)
const LOG_TRIGGERS = [
  'comi', 'almocei', 'jantei', 'café', 'lanche', 'tomei', 'bebi',
  'no almoço', 'no jantar', 'no café', 'de manhã', 'hoje comi',
  'comer', 'registrar', 'adicionar ao diário', 'anotar',
]

function hasLogIntent(text: string): boolean {
  const t = text.toLowerCase()
  return LOG_TRIGGERS.some(trigger => t.includes(trigger))
}

// Converte item retornado pela Edge Function para PendingLogItem (com macros por 100g)
function toLogItem(item: {
  foodId: string | null
  nome: string
  grams: number
  source: 'db' | 'custom'
  p?: number
  c?: number
  g?: number
  kcal?: number
}): PendingLogItem {
  if (item.source === 'db') {
    // Buscar macros por 100g do banco local
    const lookup = buildFoodLookup()
    const f = item.foodId ? lookup[item.foodId] : null
    return {
      foodId: item.foodId,
      nome: item.nome,
      grams: item.grams,
      source: 'db',
      pPer100: f ? (f.p / f.porcaoG) * 100 : 0,
      cPer100: f ? (f.c / f.porcaoG) * 100 : 0,
      gPer100: f ? (f.g / f.porcaoG) * 100 : 0,
      kcalPer100: f ? (f.kcal / f.porcaoG) * 100 : 0,
    }
  }
  // source === 'custom': macros por 100g já vêm da IA
  return {
    foodId: null,
    nome: item.nome,
    grams: item.grams,
    source: 'custom',
    pPer100: item.p ?? 0,
    cPer100: item.c ?? 0,
    gPer100: item.g ?? 0,
    kcalPer100: item.kcal ?? 0,
  }
}

export function useAiChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingLog, setPendingLog] = useState<PendingLog | null>(null)

  async function sendMessage(text: string) {
    // Detecta intenção de log ANTES de chamar a Edge Function (7B-4: mover detecção para IA)
    if (hasLogIntent(text)) {
      setMessages(prev => [...prev, { role: 'user', content: text }])
      setLoading(true)
      setError(null)

      try {
        const res = await supabase.functions.invoke('ai-chat', {
          body: { action: 'parse-food', text, foodIndex: getFoodIndex() },
        })

        if (res.error) throw new Error(res.error.message)

        const data = res.data as { meal: string | null; items: Parameters<typeof toLogItem>[0][] }
        const log: PendingLog = {
          meal: data.meal,
          items: data.items.map(toLogItem),
        }
        setPendingLog(log)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao identificar alimentos')
      } finally {
        setLoading(false)
      }
      return
    }

    // Fluxo normal de chat — sem alteração
    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: text }]
    setMessages(newMessages)
    setLoading(true)
    setError(null)

    try {
      const res = await supabase.functions.invoke('ai-chat', {
        body: { messages: newMessages },
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

  function cancelLog() {
    setPendingLog(null)
  }

  function reset() {
    setMessages([])
    setError(null)
    setPendingLog(null)
  }

  function addMessage(msg: ChatMessage) {
    setMessages(prev => [...prev, msg])
  }

  return { messages, loading, error, sendMessage, reset, pendingLog, cancelLog, addMessage }
}
