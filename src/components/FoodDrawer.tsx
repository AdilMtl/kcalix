import { useState, useEffect, useRef } from 'react'
import { FOOD_DB } from '../data/foodDb'
import { useDiary, MEAL_LABELS } from '../hooks/useDiary'
import FoodPortionModal from './FoodPortionModal'
import type { FoodItem } from '../data/foodDb'
import type { MealKey } from '../hooks/useDiary'

interface FoodDrawerProps {
  meal: MealKey
  onClose: () => void
}

const CATEGORIES = Object.keys(FOOD_DB)

export default function FoodDrawer({ meal, onClose }: FoodDrawerProps) {
  const { getRecentFoods } = useDiary()
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<string | null>(null) // null = Todos
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null)
  const [recentFoods, setRecentFoods] = useState<FoodItem[]>([])
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getRecentFoods().then(setRecentFoods)
    setTimeout(() => searchRef.current?.focus(), 300)
  }, [])

  // Lista de itens a exibir
  const term = search.toLowerCase().trim()
  let items: FoodItem[] = []

  if (term) {
    // Busca global em todas as categorias
    for (const list of Object.values(FOOD_DB)) {
      for (const f of list) {
        if (f.nome.toLowerCase().includes(term) || f.id.includes(term)) {
          items.push(f)
        }
      }
    }
  } else if (activeTab === '__recentes__') {
    items = recentFoods
  } else if (activeTab && FOOD_DB[activeTab]) {
    items = FOOD_DB[activeTab]
  } else {
    // Todos
    for (const list of Object.values(FOOD_DB)) {
      for (const f of list) items.push(f)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 flex flex-col"
        style={{
          height: '88dvh',
          background: 'var(--bg)',
          borderTop: '1px solid var(--line)',
          borderRadius: 'var(--radius) var(--radius) 0 0',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {/* Handle + header */}
        <div className="flex flex-col gap-3 px-4 pt-3 pb-2" style={{ borderBottom: '1px solid var(--line)' }}>
          <div className="mx-auto h-1 w-10 rounded-full" style={{ background: 'var(--surface3)' }} />

          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
              Adicionar em {MEAL_LABELS[meal]}
            </p>
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-full text-xs transition-opacity active:opacity-60"
              style={{ background: 'var(--surface3)', color: 'var(--text2)' }}
            >
              ✕
            </button>
          </div>

          {/* Busca */}
          <input
            ref={searchRef}
            type="search"
            placeholder="Buscar alimento..."
            value={search}
            onChange={e => { setSearch(e.target.value); setActiveTab(null) }}
            className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
            style={{
              background: 'var(--surface2)',
              border: '1px solid var(--line)',
              color: 'var(--text)',
            }}
          />
        </div>

        {/* Abas de categoria — ocultas quando há busca ativa */}
        {!term && (
          <div
            className="flex gap-2 overflow-x-auto px-4 py-2 scrollbar-none"
            style={{ borderBottom: '1px solid var(--line)', flexShrink: 0 }}
          >
            {recentFoods.length > 0 && (
              <TabBtn
                label="Recentes"
                active={activeTab === '__recentes__'}
                onClick={() => setActiveTab('__recentes__')}
              />
            )}
            <TabBtn
              label="Todos"
              active={activeTab === null}
              onClick={() => setActiveTab(null)}
            />
            {CATEGORIES.map(cat => (
              <TabBtn
                key={cat}
                label={cat}
                active={activeTab === cat}
                onClick={() => setActiveTab(cat)}
              />
            ))}
          </div>
        )}

        {/* Lista de alimentos */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text3)' }}>
              Nenhum alimento encontrado.
            </p>
          ) : (
            items.map(food => (
              <button
                key={food.id}
                onClick={() => setSelectedFood(food)}
                className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors active:opacity-70"
                style={{ borderBottom: '1px solid var(--line)' }}
              >
                <div className="flex flex-col gap-0.5 min-w-0">
                  <p className="truncate text-sm font-medium" style={{ color: 'var(--text)' }}>
                    {food.nome}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text3)' }}>
                    {food.porcao}
                  </p>
                </div>
                <div className="flex flex-shrink-0 gap-2 pl-3 text-xs">
                  <span style={{ color: 'var(--good)' }}>{food.p}P</span>
                  <span style={{ color: 'var(--warn)' }}>{food.c}C</span>
                  <span style={{ color: 'var(--bad)' }}>{food.g}G</span>
                  <span style={{ color: 'var(--text3)' }}>{food.kcal}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Modal de porção — sobre o drawer */}
      {selectedFood && (
        <FoodPortionModal
          food={selectedFood}
          meal={meal}
          onClose={() => {
            setSelectedFood(null)
            onClose()
          }}
          onCancel={() => setSelectedFood(null)}
        />
      )}
    </>
  )
}

function TabBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors"
      style={{
        background: active ? 'var(--accent)' : 'var(--surface2)',
        color: active ? '#fff' : 'var(--text2)',
        border: '1px solid',
        borderColor: active ? 'var(--accent)' : 'var(--line)',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  )
}
