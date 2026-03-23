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
        style={{ position: 'fixed', inset: 0, zIndex: 59, background: 'rgba(0,0,0,.6)' }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        style={{
          position: 'fixed', left: 0, right: 0, bottom: 'calc(56px + env(safe-area-inset-bottom))', zIndex: 60,
          maxWidth: '600px', margin: '0 auto',
          maxHeight: '85dvh',
          background: 'linear-gradient(180deg, #1a2035, #121828)',
          border: '1px solid var(--line)', borderBottom: 'none',
          borderRadius: '20px 20px 0 0',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div style={{ width: '36px', height: '4px', background: 'rgba(255,255,255,.15)', borderRadius: '999px', margin: '10px auto 6px', flexShrink: 0 }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 16px 12px', borderBottom: '1px solid var(--line)', flexShrink: 0 }}>
          <b style={{ fontSize: '15px', color: 'var(--text)' }}>🍽️ Adicionar alimentos</b>
          <button
            onClick={onClose}
            style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid var(--line)', background: 'var(--surface2)', color: 'var(--text2)', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >✕</button>
        </div>

        {/* Busca */}
        <div style={{ position: 'relative', padding: '10px 12px', flexShrink: 0 }}>
          <span style={{ position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', color: 'var(--text3)', pointerEvents: 'none' }}>🔍</span>
          <input
            ref={searchRef}
            type="search"
            placeholder="Buscar alimento..."
            value={search}
            onChange={e => { setSearch(e.target.value); setActiveTab(null) }}
            style={{ width: '100%', padding: '12px 40px 12px 38px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', background: 'rgba(0,0,0,.15)', color: 'var(--text)', fontFamily: 'var(--font)', fontSize: '16px', fontWeight: 600, outline: 'none', boxSizing: 'border-box' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '24px', top: '50%', transform: 'translateY(-50%)', width: '28px', height: '28px', borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,.1)', color: 'var(--text2)', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>✕</button>
          )}
        </div>

        {/* Cat tabs */}
        {!term && (
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', padding: '0 12px 10px', flexShrink: 0, scrollbarWidth: 'none' as React.CSSProperties['scrollbarWidth'] }}>
            {customFoods.length > 0 && <CatTab label="⭐ Meus" active={activeTab === '__custom__'} onClick={() => setActiveTab('__custom__')} />}
            {recentFoods.length > 0 && <CatTab label="Recentes" active={activeTab === '__recentes__'} onClick={() => setActiveTab('__recentes__')} />}
            <CatTab label="Todos" active={activeTab === null} onClick={() => setActiveTab(null)} />
            {CATEGORIES.map(cat => <CatTab key={cat} label={cat} active={activeTab === cat} onClick={() => setActiveTab(cat)} />)}
          </div>
        )}

        {/* Lista */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {items.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '24px 12px', color: 'var(--text3)', fontSize: '12px' }}>Nenhum alimento encontrado.</p>
          ) : items.map(food => {
            const isCustom = food.id.startsWith('custom_')
            return (
              <div key={food.id} style={{ display: 'flex', alignItems: 'stretch', gap: 6 }}>
                <button
                  onClick={() => setSelectedFood(food)}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', padding: '10px 12px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', textAlign: 'left', minWidth: 0 }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{food.nome}</p>
                    <p style={{ fontSize: '10px', color: 'var(--text3)', fontWeight: 600, marginTop: '1px' }}>{food.porcao}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '10px', fontWeight: 700, flexShrink: 0 }}>
                    <span style={{ color: 'var(--pColor)' }}>{food.p}P</span>
                    <span style={{ color: 'var(--cColor)' }}>{food.c}C</span>
                    <span style={{ color: 'var(--gColor)' }}>{food.g}G</span>
                    <span style={{ color: 'var(--text3)' }}>{food.kcal}</span>
                  </div>
                </button>

                {/* Ações — só para alimentos personalizados */}
                {isCustom && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <button
                      onClick={() => setEditingFood({
                        id: food.id,
                        food: { nome: food.nome, porcao: food.porcao, porcaoG: food.porcaoG, p: food.p, c: food.c, g: food.g, kcal: food.kcal },
                      })}
                      style={{ flex: 1, padding: '0 10px', background: 'rgba(124,92,255,0.1)', border: '1px solid rgba(124,92,255,0.2)', borderRadius: 'var(--radius-sm)', color: '#a78bfa', fontSize: 13, cursor: 'pointer' }}
                      aria-label="Editar"
                    >✏️</button>
                    <button
                      onClick={() => setDeletingId(food.id)}
                      style={{ flex: 1, padding: '0 10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-sm)', color: '#fca5a5', fontSize: 13, cursor: 'pointer' }}
                      aria-label="Excluir"
                    >🗑️</button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Botão criar alimento personalizado */}
        <div style={{ flexShrink: 0, padding: '10px 12px', borderTop: '1px solid var(--line)' }}>
          <button
            onClick={() => setShowCustomModal(true)}
            style={{
              width: '100%', padding: '11px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px dashed rgba(124,92,255,.4)',
              background: 'rgba(124,92,255,.06)',
              color: 'var(--text2)', fontFamily: 'var(--font)',
              fontSize: '13px', fontWeight: 700,
              cursor: 'pointer', textAlign: 'center',
            }}
          >➕ Criar alimento personalizado</button>
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
          <div style={{
            position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%,-50%)',
            zIndex: 63, background: 'linear-gradient(180deg, #1a2035, #121828)',
            border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16,
            padding: '24px 20px', width: 'min(320px, 90vw)', textAlign: 'center',
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🗑️</div>
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
      style={{ flexShrink: 0, padding: '7px 12px', borderRadius: '999px', border: '1px solid', borderColor: active ? 'rgba(124,92,255,.3)' : 'var(--line)', background: active ? 'linear-gradient(135deg, rgba(124,92,255,.4), rgba(124,92,255,.15))' : 'var(--surface)', color: active ? 'var(--text)' : 'var(--text3)', fontFamily: 'var(--font)', fontSize: '11px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
    >{label}</button>
  )
}
