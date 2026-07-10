import { useState, useEffect, useRef } from 'react'
import { FOOD_DB } from '../data/foodDb'
import { useDiary } from '../hooks/useDiary'
import { useCustomFoods } from '../hooks/useCustomFoods'
import FoodPortionModal from './FoodPortionModal'
import CustomFoodModal from './CustomFoodModal'
import type { FoodItem } from '../data/foodDb'
import type { MealKey, FoodEntry } from '../hooks/useDiary'

type EditingFood = { id: string; food: Omit<FoodItem, 'id'> }

interface FoodDrawerProps {
  onClose: () => void
  onAddFood: (meal: MealKey, entry: FoodEntry) => void
}

const CATEGORIES = Object.keys(FOOD_DB)

export default function FoodDrawer({ onClose, onAddFood }: FoodDrawerProps) {
  const { getRecentFoods } = useDiary()
  const { customFoods, saveCustomFood, updateCustomFood, deleteCustomFood } = useCustomFoods()
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null)
  const [recentFoods, setRecentFoods] = useState<FoodItem[]>([])
  const [showCustomModal, setShowCustomModal] = useState(false)
  const [editingFood, setEditingFood] = useState<EditingFood | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getRecentFoods().then(setRecentFoods)
    setTimeout(() => searchRef.current?.focus(), 300)
    // getRecentFoods vem do hook e só precisamos preencher recentes ao abrir o drawer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const term = search.toLowerCase().trim()
  let items: FoodItem[] = []

  const allDbItems: FoodItem[] = [...customFoods]
  for (const list of Object.values(FOOD_DB)) {
    for (const f of list) allDbItems.push(f)
  }

  if (term) {
    for (const f of allDbItems) {
      if (f.nome.toLowerCase().includes(term) || f.id.includes(term)) items.push(f)
    }
  } else if (activeTab === '__recentes__') {
    items = recentFoods
  } else if (activeTab === '__custom__') {
    items = customFoods
  } else if (activeTab && FOOD_DB[activeTab]) {
    items = FOOD_DB[activeTab]
  } else {
    items = allDbItems
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="food-overlay"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="food-sheet"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="food-grip" />

        {/* Header */}
        <div className="food-sheet-header">
          <b className="food-sheet-title">Adicionar alimentos</b>
          <button
            onClick={onClose}
            className="food-close-btn"
          >✕</button>
        </div>

        {/* Busca */}
        <div className="food-search-wrap">
          <span className="food-search-icon">BUSCA</span>
          <input
            ref={searchRef}
            type="search"
            placeholder="Buscar alimento..."
            value={search}
            onChange={e => { setSearch(e.target.value); setActiveTab(null) }}
            className="food-search-input"
          />
          {search && (
            <button onClick={() => setSearch('')} className="diary-remove-btn food-clear-search">✕</button>
          )}
        </div>

        {/* Cat tabs */}
        {!term && (
          <div className="food-tabs">
            {customFoods.length > 0 && <CatTab label="⭐ Meus" active={activeTab === '__custom__'} onClick={() => setActiveTab('__custom__')} />}
            {recentFoods.length > 0 && <CatTab label="Recentes" active={activeTab === '__recentes__'} onClick={() => setActiveTab('__recentes__')} />}
            <CatTab label="Todos" active={activeTab === null} onClick={() => setActiveTab(null)} />
            {CATEGORIES.map(cat => <CatTab key={cat} label={cat} active={activeTab === cat} onClick={() => setActiveTab(cat)} />)}
          </div>
        )}

        {/* Lista */}
        <div className="food-list">
          {items.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '24px 12px', color: 'var(--text3)', fontSize: '12px' }}>Nenhum alimento encontrado.</p>
          ) : items.map(food => {
            const isCustom = food.id.startsWith('custom_')
            return (
              <div key={food.id} className="food-row-wrap">
                <button
                  onClick={() => setSelectedFood(food)}
                  className="food-row"
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="food-name">{food.nome}</p>
                    <p className="food-portion">{food.porcao}</p>
                  </div>
                  <div className="food-macro-line">
                    <span style={{ color: 'var(--pColor)' }}>{food.p}P</span>
                    <span style={{ color: 'var(--cColor)' }}>{food.c}C</span>
                    <span style={{ color: 'var(--gColor)' }}>{food.g}G</span>
                    <span style={{ color: 'var(--text3)' }}>{food.kcal}</span>
                  </div>
                </button>

                {/* Ações — só para alimentos personalizados */}
                {isCustom && (
                  <div className="food-custom-actions">
                    <button
                      onClick={() => setEditingFood({
                        id: food.id,
                        food: { nome: food.nome, porcao: food.porcao, porcaoG: food.porcaoG, p: food.p, c: food.c, g: food.g, kcal: food.kcal },
                      })}
                      className="food-custom-action edit"
                      aria-label="Editar"
                    >EDIT</button>
                    <button
                      onClick={() => setDeletingId(food.id)}
                      className="food-custom-action delete"
                      aria-label="Excluir"
                    >DEL</button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Botão criar alimento personalizado */}
        <div className="food-create-footer">
          <button
            onClick={() => setShowCustomModal(true)}
            className="food-create-btn"
          >Criar alimento personalizado</button>
        </div>
      </div>

      {/* FoodPortionModal — recebe onAddFood do pai */}
      {selectedFood && (
        <FoodPortionModal
          food={selectedFood}
          onAddFood={onAddFood}
          onClose={() => { setSelectedFood(null); onClose() }}
          onCancel={() => setSelectedFood(null)}
        />
      )}

      {/* CustomFoodModal — criar */}
      {showCustomModal && (
        <CustomFoodModal
          onSave={async food => {
            await saveCustomFood(food)
            setActiveTab('__custom__')
            setShowCustomModal(false)
          }}
          onClose={() => setShowCustomModal(false)}
        />
      )}

      {/* CustomFoodModal — editar */}
      {editingFood && (
        <CustomFoodModal
          initialValues={editingFood.food}
          onSave={async food => {
            await updateCustomFood(editingFood.id, food)
            setEditingFood(null)
          }}
          onClose={() => setEditingFood(null)}
        />
      )}

      {/* Confirmação de exclusão */}
      {deletingId && (
        <>
          <div
            onClick={() => setDeletingId(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 62 }}
          />
          <div className="food-confirm-card">
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, marginBottom: 8 }}>Excluir alimento?</div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, marginBottom: 20, lineHeight: 1.5 }}>
              Esta ação não pode ser desfeita. Registros anteriores no diário não são afetados.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setDeletingId(null)}
                style={{ flex: 1, padding: '11px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
              >Cancelar</button>
              <button
                onClick={async () => {
                  await deleteCustomFood(deletingId)
                  setDeletingId(null)
                }}
                style={{ flex: 1, padding: '11px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
              >Excluir</button>
            </div>
          </div>
        </>
      )}
    </>
  )
}

function CatTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`food-tab${active ? ' active' : ''}`}
    >{label}</button>
  )
}
