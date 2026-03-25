import { useEffect, useRef, useState, useCallback } from 'react'
import { useAiChat, sendPhotoToAi } from '../hooks/useAiChat'
import type { PendingLogItem, PhotoFoodResult } from '../hooks/useAiChat'
import { AiLogConfirmModal } from './AiLogConfirmModal'
import { PhotoReviewSheet } from './PhotoReviewSheet'
import type { MealKey, FoodEntry } from '../hooks/useDiary'
import { useCustomFoods } from '../hooks/useCustomFoods'
import { resizeImageToBase64 } from '../lib/imageUtils'

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
  const { saveCustomFood, findCustomFood } = useCustomFoods()
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // ── Foto ──────────────────────────────────────────────────────────────────
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const [photoLoading, setPhotoLoading] = useState(false)
  const [photoResult, setPhotoResult] = useState<PhotoFoodResult | null>(null)
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null)
  const [showPhotoOptions, setShowPhotoOptions] = useState(false)

  // ── Guard Android WebView flash ────────────────────────────────────────────
  // O WebView Android suspende o app ao abrir a galeria e dispara visibilitychange
  // durante o resume. Congelar setState enquanto document.hidden e aplicar ao voltar.
  const pendingPhotoResultRef = useRef<PhotoFoodResult | null>(null)

  const applyPendingPhotoResult = useCallback(() => {
    if (!document.hidden && pendingPhotoResultRef.current) {
      setPhotoResult(pendingPhotoResultRef.current)
      setPhotoLoading(false)
      pendingPhotoResultRef.current = null
    }
  }, [])

  useEffect(() => {
    document.addEventListener('visibilitychange', applyPendingPhotoResult)
    return () => document.removeEventListener('visibilitychange', applyPendingPhotoResult)
  }, [applyPendingPhotoResult])

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
    if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl)
    setPhotoResult(null)
    setPhotoPreviewUrl(null)
    setShowPhotoOptions(false)
    onClose()
  }

  async function handlePhotoFile(file: File | null | undefined) {
    if (!file) return
    setShowPhotoOptions(false)

    // Preview local (object URL — não sai do device)
    if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl)
    const preview = URL.createObjectURL(file)
    setPhotoPreviewUrl(preview)

    setPhotoLoading(true)
    try {
      const { base64, mimeType, sizeKB } = await resizeImageToBase64(file)
      console.debug(`[photo] ${sizeKB}KB enviado para análise`)
      const result = await sendPhotoToAi(base64, mimeType)
      if (document.hidden) {
        // Android WebView ainda em resume — enfileirar para aplicar ao voltar ao foco
        pendingPhotoResultRef.current = result
        // NÃO chamar setPhotoLoading(false) aqui — será feito em applyPendingPhotoResult
      } else {
        setPhotoResult(result)
        setPhotoLoading(false)
      }
    } catch (err) {
      addMessage({ role: 'assistant', content: '⚠️ Não consegui processar a foto. Tente novamente ou descreva por texto.' })
      console.error('[photo]', err)
      setPhotoLoading(false)
    }
  }

  function handleDismissPhoto() {
    if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl)
    setPhotoResult(null)
    setPhotoPreviewUrl(null)
  }

  function handleDescribeByText() {
    handleDismissPhoto()
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  async function handleConfirmLog(meal: MealKey, items: PendingLogItem[]) {
    cancelLog()

    const MEAL_NAMES: Record<string, string> = {
      cafe: 'café', lanche1: 'lanche 1', almoco: 'almoço',
      lanche2: 'lanche 2', jantar: 'jantar', ceia: 'ceia',
    }

    const entries: FoodEntry[] = await Promise.all(items.map(async item => {
      const ratio = item.grams / 100
      let foodId = item.foodId ?? ''

      // Alimento custom: reutiliza se já existe, cria se não
      if (item.source === 'custom') {
        const existing = findCustomFood(item.nome)
        if (existing) {
          foodId = existing.id
        } else {
          // Salva com macros por 100g (não pela porção) — padrão do banco
          const saved = await saveCustomFood({
            nome:    item.nome,
            porcao:  '100g',
            porcaoG: 100,
            p:       Math.round(item.pPer100    * 10) / 10,
            c:       Math.round(item.cPer100    * 10) / 10,
            g:       Math.round(item.gPer100    * 10) / 10,
            kcal:    Math.round(item.kcalPer100),
          })
          foodId = saved.id
        }
      }

      return {
        foodId,
        nome:    item.nome,
        qty:     1,
        porcaoG: item.grams,
        p:       Math.round(item.pPer100    * ratio * 10) / 10,
        c:       Math.round(item.cPer100    * ratio * 10) / 10,
        g:       Math.round(item.gPer100    * ratio * 10) / 10,
        kcal:    Math.round(item.kcalPer100 * ratio),
        at:      new Date().toISOString(),
      }
    }))

    onAddFoods?.(meal, entries)
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

  // No Android, o WebView perde foco brevemente ao abrir o seletor de galeria
  // — isso pode fazer `open` flutuar para false e desmontar o componente (tela preta).
  // Manter montado enquanto há operação de foto ativa.
  if (!open && !photoLoading) return null

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
          display: 'flex', flexDirection: 'column', gap: 8,
          flexShrink: 0,
        }}>
          {/* Opções de câmera / galeria */}
          {showPhotoOptions && (
            <div style={{ display: 'flex', gap: 8 }}>
              {/* Tirar foto — input com capture */}
              <label style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                background: 'rgba(124,92,255,0.12)', border: '1px solid rgba(124,92,255,0.3)',
                borderRadius: 10, padding: '9px 12px',
                color: '#a78bfa', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>
                📷 Tirar foto
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  style={{ display: 'none' }}
                  onChange={e => handlePhotoFile(e.target.files?.[0])}
                />
              </label>
              {/* Galeria — input sem capture */}
              <label style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                background: 'rgba(124,92,255,0.12)', border: '1px solid rgba(124,92,255,0.3)',
                borderRadius: 10, padding: '9px 12px',
                color: '#a78bfa', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>
                🖼️ Galeria
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={e => handlePhotoFile(e.target.files?.[0])}
                />
              </label>
              <button
                onClick={() => setShowPhotoOptions(false)}
                style={{
                  background: 'rgba(255,255,255,0.06)', border: 'none',
                  color: 'rgba(255,255,255,0.4)', fontSize: 18,
                  width: 36, height: 36, borderRadius: '50%',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}
              >×</button>
            </div>
          )}

          {/* Linha de texto + câmera + enviar */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            {/* Botão câmera */}
            <button
              onClick={() => setShowPhotoOptions(v => !v)}
              disabled={photoLoading}
              style={{
                width: 42, height: 42, borderRadius: '50%', border: 'none',
                background: showPhotoOptions
                  ? 'linear-gradient(135deg, #7c5cff, #6144e0)'
                  : 'rgba(255,255,255,0.08)',
                color: '#fff', fontSize: 18, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'background 0.2s',
              }}
              aria-label="Enviar foto"
            >
              {photoLoading ? '⏳' : '📷'}
            </button>

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
      </div>

      {/* Modal de confirmação de log (via texto) */}
      {pendingLog && (
        <AiLogConfirmModal
          pendingLog={pendingLog}
          onConfirm={handleConfirmLog}
          onCancel={cancelLog}
        />
      )}

      {/* Sheet de confirmação de log (via foto) */}
      {photoResult && (
        <PhotoReviewSheet
          result={photoResult}
          previewUrl={photoPreviewUrl}
          onConfirm={(meal, items) => {
            handleConfirmLog(meal, items)
            handleDismissPhoto()
          }}
          onCancel={handleDismissPhoto}
          onDescribeByText={handleDescribeByText}
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
