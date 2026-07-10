import { useEffect, useRef, useState, useMemo } from 'react'
import { useAiChat, sendPhotoToAi } from '../hooks/useAiChat'
import type { PendingLogItem, PhotoFoodResult } from '../hooks/useAiChat'
import { AiLogConfirmModal } from './AiLogConfirmModal'
import { PhotoReviewSheet } from './PhotoReviewSheet'
import type { MealKey, FoodEntry } from '../hooks/useDiary'
import { useCustomFoods } from '../hooks/useCustomFoods'
import { resizeImageToBase64 } from '../lib/imageUtils'

// Pool de sugestões — 3 são sorteadas a cada abertura do chat
// chips com action:'log' preenchem o input em vez de enviar diretamente
interface Chip {
  label: string
  action: 'send' | 'log'
  logPlaceholder?: string  // texto pré-preenchido no input quando action:'log'
}

const CHIP_POOL: Chip[] = [
  // Nutrição
  { label: '🍽️ Como estão meus macros hoje?',        action: 'send' },
  { label: '🥗 O que devo jantar hoje?',              action: 'send' },
  { label: '🎯 Estou batendo minha meta de proteína?', action: 'send' },
  { label: '📊 Resumo da minha semana de nutrição',   action: 'send' },
  // Treino
  { label: '💪 Como devo treinar hoje?',              action: 'send' },
  { label: '📈 Como está minha progressão de carga?', action: 'send' },
  { label: '🏋️ O que achaste dos meus treinos?',      action: 'send' },
  { label: '😴 Preciso de descanso hoje?',            action: 'send' },
  // Corpo
  { label: '⚖️ Como está minha evolução de peso?',   action: 'send' },
  { label: '🔍 Analisa tudo dos últimos 30 dias',     action: 'send' },
  // Registro
  { label: '🍴 Registrar o que comi agora',           action: 'log', logPlaceholder: 'Comi ' },
  { label: '☕ Registrar café da manhã',              action: 'log', logPlaceholder: 'No café da manhã comi ' },
]

interface Props {
  open: boolean
  onClose: () => void
  onAddFoods?: (meal: MealKey, entries: FoodEntry[]) => void
  initialShowPhoto?: boolean
  initialInput?: string
}

export function AiChatModal({ open, onClose, onAddFoods, initialShowPhoto, initialInput }: Props) {
  const { messages, loading, error, sendMessage, reset, pendingLog, cancelLog, addMessage } = useAiChat()
  const { saveCustomFood, findCustomFood } = useCustomFoods()
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Sorteia 3 chips do pool a cada abertura — estável enquanto o chat estiver aberto
  const chips = useMemo(() => {
    const shuffled = [...CHIP_POOL].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 3)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // ── Foto ──────────────────────────────────────────────────────────────────
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const [photoLoading, setPhotoLoading] = useState(false)
  const [photoResult, setPhotoResult] = useState<PhotoFoodResult | null>(null)
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null)
  const [showPhotoOptions, setShowPhotoOptions] = useState(false)

  // Scroll para o final quando nova mensagem chega ou foto começa a carregar
  useEffect(() => {
    const t = setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    return () => clearTimeout(t)
  }, [messages, loading, photoLoading])

  // Foca o input ao abrir (não quando initialShowPhoto — o foco vai para o popover de foto)
  useEffect(() => {
    if (open && !initialShowPhoto) {
      setTimeout(() => {
        if (initialInput) setInput(initialInput)
        inputRef.current?.focus()
      }, 300)
    }
  }, [open, initialShowPhoto, initialInput])

  // Abre popover de foto automaticamente quando solicitado
  useEffect(() => {
    if (open && initialShowPhoto) {
      setTimeout(() => setShowPhotoOptions(true), 200)
    }
  }, [open, initialShowPhoto])

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
      setPhotoResult(result)
    } catch (err) {
      addMessage({ role: 'assistant', content: '⚠️ Não consegui processar a foto. Tente novamente ou descreva por texto.' })
      console.error('[photo]', err)
    } finally {
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
        className="ai-chat-overlay"
      />

      {/* Bottom sheet */}
      <div className="ai-chat-sheet">
        {/* Header */}
        <div className="ai-chat-header">
          <div className="ai-chat-title-row">
            <div className="ai-chat-mark">
              🤖
            </div>
            <div>
              <div className="ai-chat-title">Kcal Coach</div>
              <div className="ai-chat-status">
                {photoLoading ? 'Analisando foto...' : loading ? 'Pensando...' : 'Online'}
              </div>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="ai-chat-close"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        {/* Área de mensagens */}
        <div className="ai-chat-messages">
          {/* Estado vazio — chips de ação rápida */}
          {messages.length === 0 && !photoLoading && (
            <div className="ai-chat-empty">
              {/* Hero */}
              <div className="ai-chat-hero">
                <div className="ai-chat-hero-mark">🤖</div>
                <div className="ai-chat-hero-title">
                  Olá! Sou o Kcal Coach.
                </div>
                <div className="ai-chat-hero-copy">
                  Acesso aos seus dados reais de nutrição,{'\n'}treino e corpo. Pergunte à vontade.
                </div>
              </div>

              {/* Chips sorteados */}
              <div className="ai-chat-chip-list">
                <div className="ai-chat-section-label">
                  Sugestões de hoje
                </div>
                {chips.map(chip => (
                  <button
                    key={chip.label}
                    disabled={loading}
                    className="ai-chat-chip"
                    data-action={chip.action}
                    onClick={() => {
                      if (chip.action === 'log') {
                        setInput(chip.logPlaceholder ?? '')
                        setTimeout(() => {
                          inputRef.current?.focus()
                          // mover cursor para o final do texto pré-preenchido
                          const el = inputRef.current
                          if (el) el.setSelectionRange(el.value.length, el.value.length)
                        }, 50)
                      } else {
                        sendMessage(chip.label.replace(/^[\p{Emoji}\s]+/u, '').trim())
                      }
                    }}
                  >
                    <span>{chip.label}</span>
                    {chip.action === 'log' && (
                      <span className="ai-chat-chip-meta">digitar</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Hint */}
              <div className="ai-chat-capabilities">
                <div>
                  Também posso...
                </div>
                <p>
                  📷 Analisar foto de refeição — toque em 📷{'\n'}
                  🍴 Registrar o que comeu — descreva em texto{'\n'}
                  📊 Diagnosticar nutrição, treino e corpo{'\n'}
                  💡 Dar sugestões personalizadas baseadas nos seus dados
                </p>
              </div>
            </div>
          )}

          {/* Mensagens */}
          {messages.map((msg, i) => (
            <div
              key={i}
              className="ai-chat-row"
              data-role={msg.role}
            >
              <div
                className="ai-chat-bubble"
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Bolha de foto enviada — aparece imediatamente ao selecionar */}
          {photoLoading && photoPreviewUrl && (
            <div className="ai-chat-row" data-role="user">
              <div className="ai-chat-photo-bubble">
                <img
                  src={photoPreviewUrl}
                  alt="Foto enviada"
                  className="ai-chat-photo-img"
                />
                <div className="ai-chat-photo-label">
                  📷 Foto enviada
                </div>
                {/* Barra de progresso pulsante */}
                <div className="ai-chat-photo-track">
                  <div className="ai-chat-photo-progress" />
                </div>
              </div>
            </div>
          )}

          {/* Bolha do coach — "Identificando alimentos..." durante photoLoading */}
          {photoLoading && (
            <div className="ai-chat-row" data-role="assistant">
              <div className="ai-chat-loading-bubble wide">
                <span>Identificando alimentos</span>
                <div className="ai-chat-dots">
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Loading bubble (chat de texto) */}
          {loading && (
            <div className="ai-chat-row" data-role="assistant">
              <div className="ai-chat-loading-bubble">
                <div className="ai-chat-dots">
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
                </div>
              </div>
            </div>
          )}

          {/* Erro */}
          {error && (
            <div className="ai-chat-error">
              ⚠️ {error}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="ai-chat-composer">
          {/* Opções de câmera / galeria */}
          {showPhotoOptions && (
            <div className="ai-chat-photo-options">
              {/* Tirar foto — input com capture */}
              <label className="ai-chat-photo-option">
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
              <label className="ai-chat-photo-option">
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
                className="ai-chat-photo-dismiss"
              >×</button>
            </div>
          )}

          {/* Linha de texto + câmera + enviar */}
          <div className="ai-chat-input-row">
            {/* Botão câmera */}
            <button
              onClick={() => setShowPhotoOptions(v => !v)}
              disabled={photoLoading}
              className="ai-chat-tool-btn"
              data-active={showPhotoOptions}
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
              className="ai-chat-textarea"
              onInput={e => {
                const el = e.currentTarget
                el.style.height = 'auto'
                el.style.height = `${el.scrollHeight}px`
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="ai-chat-send-btn"
              data-ready={!!input.trim() && !loading}
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
    </>
  )
}
