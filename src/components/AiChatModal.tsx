import { useEffect, useRef, useState } from 'react'
import { useAiChat } from '../hooks/useAiChat'
import type { PendingLogItem } from '../hooks/useAiChat'
import { AiLogConfirmModal } from './AiLogConfirmModal'
import type { MealKey, FoodEntry } from '../hooks/useDiary'

const CHIPS = [
  '🍽 Como estão meus macros esta semana?',
  '💪 Como está meu volume muscular?',
  '⚖️ Como está minha evolução de peso?',
  '🔍 Analise tudo dos últimos 30 dias',
]

interface Props {
  open: boolean
  onClose: () => void
  onAddFoods?: (meal: MealKey, entries: FoodEntry[]) => void
}

export function AiChatModal({ open, onClose, onAddFoods }: Props) {
  const { messages, loading, error, sendMessage, reset, pendingLog, cancelLog, addMessage } = useAiChat()
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Scroll para o final quando nova mensagem chega
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Foca o input ao abrir
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [open])

  function handleClose() {
    reset()
    setInput('')
    onClose()
  }

  function handleConfirmLog(meal: MealKey, items: PendingLogItem[]) {
    cancelLog()
    const entries: FoodEntry[] = items.map(item => {
      const ratio = item.grams / 100
      return {
        foodId:  item.foodId ?? `custom_${Date.now()}`,
        nome:    item.nome,
        qty:     1,
        porcaoG: item.grams,
        p:       Math.round(item.pPer100    * ratio * 10) / 10,
        c:       Math.round(item.cPer100    * ratio * 10) / 10,
        g:       Math.round(item.gPer100    * ratio * 10) / 10,
        kcal:    Math.round(item.kcalPer100 * ratio),
        at:      new Date().toISOString(),
      }
    })
    onAddFoods?.(meal, entries)
    const MEAL_NAMES: Record<string, string> = {
      cafe: 'café', lanche1: 'lanche 1', almoco: 'almoço',
      lanche2: 'lanche 2', jantar: 'jantar', ceia: 'ceia',
    }
    const nomes = items.map(i => `• ${i.nome} (${i.grams}g)`).join('\n')
    addMessage({ role: 'assistant', content: `✅ Adicionado ao ${MEAL_NAMES[meal] ?? meal}:\n${nomes}` })
  }

  async function handleSend() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    await sendMessage(text)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.6)',
          zIndex: 340,
        }}
      />

      {/* Bottom sheet */}
      <div
        style={{
          position: 'fixed', left: 0, right: 0, bottom: 0,
          zIndex: 341,
          background: 'linear-gradient(180deg, #1a2035, #121828)',
          borderRadius: '20px 20px 0 0',
          maxHeight: '88dvh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 -4px 40px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px 12px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, #7c5cff, #a78bfa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18,
            }}>
              🤖
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Kcal Coach</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>
                {loading ? 'Pensando...' : 'Online'}
              </div>
            </div>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: 'rgba(255,255,255,0.06)', border: 'none',
              color: 'rgba(255,255,255,0.5)', fontSize: 20,
              width: 34, height: 34, borderRadius: '50%',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        {/* Área de mensagens */}
        <div style={{
          flex: 1, overflowY: 'auto',
          padding: '16px 16px 8px',
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          {/* Estado vazio — chips de ação rápida */}
          {messages.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>🤖</div>
                <div style={{ color: '#fff', fontWeight: 600, fontSize: 15, marginBottom: 4 }}>
                  Olá! Sou o Kcal Coach.
                </div>
                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, lineHeight: 1.5 }}>
                  Analiso seus dados reais de nutrição e treino e te dou feedback concreto.
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {CHIPS.map(chip => (
                  <button
                    key={chip}
                    onClick={() => sendMessage(chip)}
                    disabled={loading}
                    style={{
                      background: 'rgba(124,92,255,0.12)',
                      border: '1px solid rgba(124,92,255,0.3)',
                      borderRadius: 12, padding: '10px 14px',
                      color: '#a78bfa', fontSize: 13, textAlign: 'left',
                      cursor: 'pointer', fontWeight: 500,
                    }}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Mensagens */}
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <div
                style={{
                  maxWidth: '85%',
                  padding: '10px 14px',
                  borderRadius: msg.role === 'user'
                    ? '16px 16px 4px 16px'
                    : '16px 16px 16px 4px',
                  background: msg.role === 'user'
                    ? 'linear-gradient(135deg, #7c5cff, #6144e0)'
                    : 'rgba(255,255,255,0.07)',
                  color: '#fff',
                  fontSize: 14,
                  lineHeight: 1.55,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Loading bubble */}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{
                padding: '10px 16px',
                borderRadius: '16px 16px 16px 4px',
                background: 'rgba(255,255,255,0.07)',
                display: 'flex', gap: 5, alignItems: 'center',
              }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: '#a78bfa',
                    animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }} />
                ))}
              </div>
            </div>
          )}

          {/* Erro */}
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 10, padding: '8px 12px',
              color: '#fca5a5', fontSize: 13,
            }}>
              ⚠️ {error}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{
          padding: '10px 12px',
          paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', gap: 8, alignItems: 'flex-end',
          flexShrink: 0,
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pergunte algo ou registre o que comeu..."
            rows={1}
            style={{
              flex: 1, resize: 'none', overflow: 'hidden',
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 14, padding: '10px 14px',
              color: '#fff', fontSize: 14, lineHeight: 1.4,
              outline: 'none', fontFamily: 'inherit',
              maxHeight: 120,
            }}
            onInput={e => {
              const el = e.currentTarget
              el.style.height = 'auto'
              el.style.height = `${el.scrollHeight}px`
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            style={{
              width: 42, height: 42, borderRadius: '50%', border: 'none',
              background: input.trim() && !loading
                ? 'linear-gradient(135deg, #7c5cff, #6144e0)'
                : 'rgba(255,255,255,0.08)',
              color: '#fff', fontSize: 18, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'background 0.2s',
            }}
            aria-label="Enviar"
          >
            ↑
          </button>
        </div>
      </div>

      {/* Modal de confirmação de log */}
      {pendingLog && (
        <AiLogConfirmModal
          pendingLog={pendingLog}
          onConfirm={handleConfirmLog}
          onCancel={cancelLog}
        />
      )}

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0) }
          30% { transform: translateY(-6px) }
        }
      `}</style>
    </>
  )
}
