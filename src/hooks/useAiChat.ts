import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { buildFoodLookup } from '../data/foodDb'

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

// Palavras que indicam intenção de registrar refeição
const LOG_TRIGGERS = [
  'comi', 'almocei', 'jantei', 'café', 'lanche', 'tomei', 'bebi',
  'no almoço', 'no jantar', 'no café', 'de manhã', 'hoje comi',
  'comer', 'registrar', 'adicionar ao diário', 'anotar',
]

// Detecta a refeição a partir do texto
function detectMeal(text: string): string | null {
  const t = text.toLowerCase()
  if (t.includes('café') || t.includes('manha') || t.includes('manhã') || t.includes('desjejum')) return 'cafe'
  if (t.includes('almoc') || t.includes('almoço')) return 'almoco'
  if (t.includes('lanche')) return 'lanche'
  if (t.includes('jant') || t.includes('jantar')) return 'jantar'
  if (t.includes('ceia')) return 'ceia'
  return null
}

function hasLogIntent(text: string): boolean {
  const t = text.toLowerCase()
  return LOG_TRIGGERS.some(trigger => t.includes(trigger))
}

// Mock fixo para testar o fluxo completo (db + custom) antes da Edge Function real (Fase 7B-2)
// Sempre retorna 2 itens: 1 do banco + 1 custom — independente do texto digitado
function mockParseFood(text: string): PendingLog {
  const meal = detectMeal(text)
  const lookup = buildFoodLookup()

  // Item do banco: frango grelhado
  const f = lookup['frango_grelhado']
  const dbItem: PendingLogItem = {
    foodId: f.id,
    nome: f.nome,
    grams: f.porcaoG,
    source: 'db',
    pPer100: (f.p / f.porcaoG) * 100,
    cPer100: (f.c / f.porcaoG) * 100,
    gPer100: (f.g / f.porcaoG) * 100,
    kcalPer100: (f.kcal / f.porcaoG) * 100,
  }

  // Item custom: alimento fictício não existente no banco
  const customItem: PendingLogItem = {
    foodId: null,
    nome: 'Queijo coalho grelhado',
    grams: 50,
    source: 'custom',
    pPer100: 22,
    cPer100: 2,
    gPer100: 18,
    kcalPer100: 262,
  }

  return { meal, items: [dbItem, customItem] }
}

export function useAiChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingLog, setPendingLog] = useState<PendingLog | null>(null)

  async function sendMessage(text: string) {
    // Detecta intenção de log ANTES de chamar a Edge Function
    if (hasLogIntent(text)) {
      // Adiciona a mensagem do usuário ao chat
      setMessages(prev => [...prev, { role: 'user', content: text }])
      // Seta o mock como pendingLog (7B-2: substituir por chamada real)
      const log = mockParseFood(text)
      setPendingLog(log)
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
