import { useState } from 'react'
import { AiChatModal } from '../components/AiChatModal'
import Nav, { NAV_TABS } from '../components/Nav'
import { KcalixIcon } from '../components/icons/KcalixIcon'

export default function IconPreviewPage() {
  const [activePath, setActivePath] = useState('/home')
  const [chatOpen, setChatOpen] = useState(false)

  return (
    <div className="flex min-h-dvh flex-col" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <main
        className="mx-auto w-full max-w-lg flex-1 overflow-y-auto px-5 py-8"
        style={{ paddingBottom: 'calc(112px + env(safe-area-inset-bottom))' }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: 'var(--ember)' }}>
          Prévia local · sem login
        </p>
        <h1 className="mt-2 text-3xl font-bold">Kcalix Hybrid Icon System</h1>
        <p className="mt-2 text-sm leading-6" style={{ color: 'var(--text-muted)' }}>
          Toque nos itens da navegação para comparar os estados e abra o Coach para testar o modal real.
        </p>

        <section
          className="mt-7 rounded-3xl p-5"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-4">
            <KcalixIcon name="coach-hero" size={120} />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--teal)' }}>
                Identidade própria
              </p>
              <h2 className="mt-1 text-xl font-bold">Kcal Coach</h2>
              <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                Personagem 3D exclusivo para avatar, FAB e destaques.
              </p>
              <button type="button" className="btn primary mt-4" onClick={() => setChatOpen(true)}>
                Abrir Coach
              </button>
            </div>
          </div>
        </section>

        <section className="mt-7">
          <h2 className="text-lg font-bold">Navegação Icons8 Color</h2>
          <div className="mt-3 grid grid-cols-5 gap-2">
            {NAV_TABS.map(tab => (
              <button
                type="button"
                key={tab.path}
                onClick={() => setActivePath(tab.path)}
                className="flex min-h-20 flex-col items-center justify-center gap-2 rounded-2xl px-1"
                style={{
                  background: activePath === tab.path ? 'var(--surface-raised)' : 'var(--surface)',
                  border: `1px solid ${activePath === tab.path ? 'var(--ember)' : 'var(--border)'}`,
                }}
              >
                <KcalixIcon name={tab.icon} size={32} />
                <span className="text-[10px] font-semibold">{tab.label}</span>
              </button>
            ))}
          </div>
        </section>
      </main>

      <Nav activePath={activePath} onNavigate={setActivePath} />

      <button
        type="button"
        onClick={() => setChatOpen(true)}
        aria-label="Abrir Kcal Coach IA"
        className="coach-fab"
      >
        <KcalixIcon name="coach-avatar" size={46} />
      </button>

      <AiChatModal open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  )
}
