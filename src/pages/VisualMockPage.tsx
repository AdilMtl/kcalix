import { useMemo, useState } from 'react'
import './VisualMockPage.css'

type DirectionId = 'aurora' | 'graphite' | 'ember'
type MockTab = 'home' | 'diario' | 'treino' | 'corpo' | 'coach'

type Direction = {
  id: DirectionId
  name: string
  label: string
  titleFont: string
  bodyFont: string
  dataFont: string
  palette: string[]
}

const directions: Direction[] = [
  {
    id: 'aurora',
    name: 'Aurora Control',
    label: 'Premium quente, magenta e violeta',
    titleFont: 'Space Grotesk',
    bodyFont: 'Inter',
    dataFont: 'JetBrains Mono',
    palette: ['#ff7a3d', '#ff3f8e', '#8b5cf6', '#17d3a2'],
  },
  {
    id: 'graphite',
    name: 'Graphite Coach',
    label: 'Tecnico, escuro, preciso e calmo',
    titleFont: 'Sora',
    bodyFont: 'Inter',
    dataFont: 'IBM Plex Mono',
    palette: ['#9b7bff', '#21d4b4', '#e9ff70', '#ff8a5b'],
  },
  {
    id: 'ember',
    name: 'Ember Performance',
    label: 'Energia, treino e progresso',
    titleFont: 'Manrope',
    bodyFont: 'Inter',
    dataFont: 'JetBrains Mono',
    palette: ['#ff5c35', '#ff2f7d', '#35c2ff', '#ffd166'],
  },
]

const tabs: { id: MockTab; label: string; glyph: string }[] = [
  { id: 'home', label: 'Home', glyph: '⌂' },
  { id: 'diario', label: 'Diario', glyph: '◫' },
  { id: 'treino', label: 'Treino', glyph: '▥' },
  { id: 'corpo', label: 'Corpo', glyph: '⌁' },
  { id: 'coach', label: 'Coach', glyph: '✦' },
]

const meals = [
  { name: 'Cafe', kcal: 430, p: 34, c: 42, g: 14 },
  { name: 'Almoco', kcal: 720, p: 58, c: 78, g: 18 },
  { name: 'Jantar', kcal: 610, p: 48, c: 52, g: 22 },
]

const workout = [
  { name: 'Supino inclinado', sets: '4 x 8', load: '34 kg', trend: '+6%' },
  { name: 'Remada baixa', sets: '3 x 10', load: '61 kg', trend: '+3%' },
  { name: 'Agachamento livre', sets: '5 x 5', load: '92 kg', trend: 'PR' },
]

export default function VisualMockPage() {
  const [directionId, setDirectionId] = useState<DirectionId>('aurora')
  const [activeTab, setActiveTab] = useState<MockTab>('home')

  const direction = useMemo(
    () => directions.find(item => item.id === directionId) ?? directions[0],
    [directionId],
  )

  return (
    <div className={`visual-mock vm-${direction.id}`}>
      <header className="vm-topbar">
        <div>
          <span className="vm-eyebrow">Kcalix Visual Lab</span>
          <h1>Direcoes visuais para um app de controle, performance e coach pessoal.</h1>
        </div>
        <a className="vm-back" href="/home">Voltar ao app</a>
      </header>

      <section className="vm-direction-strip" aria-label="Direcoes visuais">
        {directions.map(item => (
          <button
            key={item.id}
            className={`vm-direction-card ${item.id === direction.id ? 'active' : ''}`}
            onClick={() => setDirectionId(item.id)}
            type="button"
          >
            <span>{item.name}</span>
            <small>{item.label}</small>
            <div className="vm-swatch-row">
              {item.palette.map(color => <i key={color} style={{ background: color }} />)}
            </div>
          </button>
        ))}
      </section>

      <main className="vm-stage">
        <aside className="vm-spec-panel">
          <span className="vm-panel-kicker">Sistema visual</span>
          <h2>{direction.name}</h2>
          <dl>
            <div>
              <dt>Titulo</dt>
              <dd>{direction.titleFont}</dd>
            </div>
            <div>
              <dt>Texto</dt>
              <dd>{direction.bodyFont}</dd>
            </div>
            <div>
              <dt>Dados</dt>
              <dd>{direction.dataFont}</dd>
            </div>
          </dl>
          <div className="vm-token-grid">
            {direction.palette.map(color => (
              <span key={color} style={{ background: color }}>{color}</span>
            ))}
          </div>
          <p>
            Mantem dark mode e abas atuais, mas melhora ritmo, contraste, calor visual,
            leitura de metricas e presenca do coach.
          </p>
        </aside>

        <section className="vm-phone-shell" aria-label="Mock clicavel">
          <div className="vm-phone">
            <div className="vm-ambient" />
            <MockHeader activeTab={activeTab} />
            <div className="vm-screen">
              {activeTab === 'home' && <HomeMock />}
              {activeTab === 'diario' && <DiaryMock />}
              {activeTab === 'treino' && <WorkoutMock />}
              {activeTab === 'corpo' && <BodyMock />}
              {activeTab === 'coach' && <CoachMock />}
            </div>
            <nav className="vm-nav" aria-label="Abas do mock">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={activeTab === tab.id ? 'active' : ''}
                  onClick={() => setActiveTab(tab.id)}
                  type="button"
                >
                  <span>{tab.glyph}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </section>
      </main>
    </div>
  )
}

function MockHeader({ activeTab }: { activeTab: MockTab }) {
  const tab = tabs.find(item => item.id === activeTab)
  return (
    <div className="vm-app-header">
      <div>
        <small>Hoje, 08/07</small>
        <strong>{tab?.label ?? 'Home'}</strong>
      </div>
      <div className="vm-date-pill">
        <button type="button">‹</button>
        <span>Qua</span>
        <button type="button">›</button>
      </div>
    </div>
  )
}

function HomeMock() {
  return (
    <>
      <section className="vm-hero-card">
        <div>
          <span className="vm-chip">Controle diario</span>
          <h2>1.842 kcal</h2>
          <p>Meta de 2.350 kcal com margem inteligente para treino.</p>
        </div>
        <div className="vm-orbit">
          <span>78%</span>
        </div>
      </section>

      <div className="vm-metric-row">
        <Metric label="Proteina" value="146g" progress={86} />
        <Metric label="Carbo" value="192g" progress={72} />
        <Metric label="Gordura" value="58g" progress={64} />
      </div>

      <section className="vm-coach-strip">
        <span>✦</span>
        <div>
          <strong>Coach insight</strong>
          <p>Voce esta 320 kcal abaixo do alvo. Melhor janela: jantar ou ceia.</p>
        </div>
      </section>

      <section className="vm-week-card">
        <div className="vm-section-head">
          <strong>Semana energetica</strong>
          <span>-1.840 kcal</span>
        </div>
        <div className="vm-bars">
          {[44, 62, 78, 54, 88, 70, 38].map((height, idx) => (
            <i key={idx} style={{ height: `${height}%` }} />
          ))}
        </div>
      </section>
    </>
  )
}

function DiaryMock() {
  return (
    <>
      <section className="vm-kcal-panel">
        <div className="vm-section-head">
          <strong>Diario nutricional</strong>
          <span>508 kcal livres</span>
        </div>
        <div className="vm-progress-line"><i style={{ width: '76%' }} /></div>
        <div className="vm-pill-row">
          <span>+42g P</span>
          <span>-36g C</span>
          <span>+8g G</span>
        </div>
      </section>

      <div className="vm-meal-list">
        {meals.map(meal => (
          <article key={meal.name} className="vm-meal-card">
            <div>
              <strong>{meal.name}</strong>
              <small>{meal.p}P · {meal.c}C · {meal.g}G</small>
            </div>
            <span>{meal.kcal}</span>
          </article>
        ))}
      </div>

      <button className="vm-primary-action" type="button">Adicionar alimento</button>
    </>
  )
}

function WorkoutMock() {
  return (
    <>
      <section className="vm-hero-card compact">
        <div>
          <span className="vm-chip">Performance</span>
          <h2>Peito + Costas</h2>
          <p>Volume dentro do alvo. Uma progressao detectada.</p>
        </div>
      </section>

      <div className="vm-workout-summary">
        <Metric label="Series" value="18" progress={75} />
        <Metric label="Volume" value="9.8t" progress={82} />
        <Metric label="Cardio" value="22m" progress={44} />
      </div>

      <div className="vm-workout-list">
        {workout.map(item => (
          <article key={item.name}>
            <div>
              <strong>{item.name}</strong>
              <small>{item.sets} · {item.load}</small>
            </div>
            <span>{item.trend}</span>
          </article>
        ))}
      </div>
    </>
  )
}

function BodyMock() {
  return (
    <>
      <section className="vm-body-panel">
        <div>
          <span className="vm-chip">Composicao</span>
          <h2>82,4 kg</h2>
          <p>-0,8 kg em 14 dias</p>
        </div>
        <div className="vm-body-grid">
          <span><b>14,8%</b> BF</span>
          <span><b>84cm</b> cintura</span>
          <span><b>+2,1%</b> aderencia</span>
        </div>
      </section>

      <section className="vm-timeline">
        <div className="vm-section-head">
          <strong>Evolucao</strong>
          <span>Ultimos check-ins</span>
        </div>
        {[92, 78, 84, 68, 74, 58].map((width, idx) => (
          <div key={idx} className="vm-timeline-row">
            <small>{idx + 1}/07</small>
            <i style={{ width: `${width}%` }} />
          </div>
        ))}
      </section>
    </>
  )
}

function CoachMock() {
  return (
    <>
      <section className="vm-coach-hero">
        <span>✦</span>
        <h2>Kcalix Coach</h2>
        <p>Assistente pessoal para comer melhor, treinar melhor e entender sua evolucao.</p>
      </section>

      <div className="vm-chat">
        <p className="assistant">Seu treino gerou margem de 260 kcal. Quer redistribuir para carbo no jantar?</p>
        <p className="user">Sim, mantendo proteina alta.</p>
        <p className="assistant">Sugestao: +55g carbo, +8g gordura e manter 45g proteina.</p>
      </div>

      <div className="vm-suggestion-grid">
        <button type="button">Analisar prato</button>
        <button type="button">Ajustar meta</button>
        <button type="button">Resumo semanal</button>
      </div>
    </>
  )
}

function Metric({ label, value, progress }: { label: string; value: string; progress: number }) {
  return (
    <article className="vm-metric">
      <small>{label}</small>
      <strong>{value}</strong>
      <div><i style={{ width: `${progress}%` }} /></div>
    </article>
  )
}
