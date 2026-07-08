import { useMemo, useState } from 'react'
import './VisualMockPage.css'

type DirectionId = 'aurora' | 'ember'
type MockTab = 'home' | 'diario' | 'treino' | 'corpo' | 'coach'

type Direction = {
  id: DirectionId
  name: string
  label: string
  premise: string
  titleFont: string
  bodyFont: string
  dataFont: string
  palette: string[]
}

const directions: Direction[] = [
  {
    id: 'aurora',
    name: 'Aurora Vitral',
    label: 'Ousado, translucido, premium e mais sensorial',
    premise: 'Mais camadas, textura sutil, cards tipo vidro e accents quentes para dar vida sem perder leitura.',
    titleFont: 'Bricolage Grotesque',
    bodyFont: 'Instrument Sans',
    dataFont: 'Azeret Mono',
    palette: ['#7a5cff', '#ff7a3d', '#ff3f8e', '#21d4b4'],
  },
  {
    id: 'ember',
    name: 'Ember Cockpit',
    label: 'Performance tecnica, treino rapido e menos ornamental',
    premise: 'Mesmo DNA quente, porem mais orientado a execucao: metricas compactas, contraste alto e cards mais diretos.',
    titleFont: 'Sora',
    bodyFont: 'Inter',
    dataFont: 'IBM Plex Mono',
    palette: ['#6d5dfc', '#ff5c35', '#ff2f7d', '#ffd166'],
  },
]

const tabs: { id: MockTab; label: string; glyph: string }[] = [
  { id: 'home', label: 'Home', glyph: 'H' },
  { id: 'diario', label: 'Diario', glyph: 'D' },
  { id: 'treino', label: 'Treino', glyph: 'T' },
  { id: 'corpo', label: 'Corpo', glyph: 'C' },
  { id: 'coach', label: 'Coach', glyph: 'AI' },
]

const meals = [
  { name: 'Cafe', kcal: 430, p: 34, c: 42, g: 14, state: 'ok' },
  { name: 'Almoco', kcal: 720, p: 58, c: 78, g: 18, state: 'feito' },
  { name: 'Jantar', kcal: 610, p: 48, c: 52, g: 22, state: 'proximo' },
]

const workout = [
  { name: 'Supino inclinado', sets: '4 x 8', load: '34 kg', trend: '+6%', rest: '1:18' },
  { name: 'Remada baixa', sets: '3 x 10', load: '61 kg', trend: '+3%', rest: '2:00' },
  { name: 'Agachamento livre', sets: '5 x 5', load: '92 kg', trend: 'PR', rest: '3:00' },
]

export default function VisualMockPage() {
  const [directionId, setDirectionId] = useState<DirectionId>('aurora')
  const [activeTab, setActiveTab] = useState<MockTab>('treino')

  const direction = useMemo(
    () => directions.find(item => item.id === directionId) ?? directions[0],
    [directionId],
  )

  return (
    <div className={`visual-mock vm-${direction.id}`}>
      <header className="vm-topbar">
        <div>
          <span className="vm-eyebrow">Kcalix Visual Lab v2</span>
          <h1>Performance pessoal com cockpit tecnico, coach discreto e dark mode vivo.</h1>
        </div>
        <a className="vm-back" href="/home">Voltar ao app</a>
      </header>

      <section className="vm-direction-strip two" aria-label="Direcoes visuais">
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
          <span className="vm-panel-kicker">Modelo selecionado</span>
          <h2>{direction.name}</h2>
          <p className="vm-premise">{direction.premise}</p>
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
          <div className="vm-layout-notes">
            <strong>Inputs aplicados</strong>
            <span>Roxo como base em 30%, laranja/magenta como acento, foco em treino, leitura tecnica e coach discreto.</span>
          </div>
        </aside>

        <section className="vm-phone-shell" aria-label="Mock clicavel">
          <div className="vm-phone">
            <div className="vm-ambient" />
            <div className="vm-texture" />
            <MockHeader activeTab={activeTab} />
            <CommandRail activeTab={activeTab} />
            <div className="vm-screen">
              {activeTab === 'home' && <HomeMock />}
              {activeTab === 'diario' && <DiaryMock />}
              {activeTab === 'treino' && <WorkoutMock direction={direction.id} />}
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
        <small>Qua, 08/07</small>
        <strong>{tab?.label ?? 'Home'}</strong>
      </div>
      <div className="vm-date-pill">
        <button type="button">Prev</button>
        <span>Hoje</span>
        <button type="button">Next</button>
      </div>
    </div>
  )
}

function CommandRail({ activeTab }: { activeTab: MockTab }) {
  const label = activeTab === 'treino'
    ? 'Treino ativo'
    : activeTab === 'diario'
      ? 'Registrar refeicao'
      : activeTab === 'coach'
        ? 'Perguntar ao Coach'
        : 'Resumo objetivo'

  return (
    <div className="vm-command-rail">
      <span>{label}</span>
      <strong>{activeTab === 'treino' ? 'Descanso 1:18' : 'Abrir acao'}</strong>
    </div>
  )
}

function HomeMock() {
  return (
    <>
      <section className="vm-hero-card">
        <div>
          <span className="vm-chip">Cockpit do dia</span>
          <h2>78%</h2>
          <p>Nutri, treino e medidas em uma leitura operacional.</p>
        </div>
        <div className="vm-orbit">
          <span>OK</span>
        </div>
      </section>

      <div className="vm-metric-row">
        <Metric label="Kcal" value="1.842" progress={78} />
        <Metric label="Volume" value="9.8t" progress={82} />
        <Metric label="Peso" value="-0.8" progress={62} />
      </div>

      <section className="vm-coach-strip">
        <span>AI</span>
        <div>
          <strong>Coach insight</strong>
          <p>Seu dia pede carbo no jantar: treino pesado, saldo controlado e proteina ja bem encaminhada.</p>
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
          <span>146g P</span>
          <span>192g C</span>
          <span>58g G</span>
        </div>
      </section>

      <div className="vm-meal-list">
        {meals.map(meal => (
          <article key={meal.name} className="vm-meal-card">
            <div>
              <strong>{meal.name}</strong>
              <small>{meal.p}P / {meal.c}C / {meal.g}G</small>
            </div>
            <span>{meal.kcal}</span>
            <em>{meal.state}</em>
          </article>
        ))}
      </div>

      <button className="vm-primary-action" type="button">Registrar refeicao</button>
    </>
  )
}

function WorkoutMock({ direction }: { direction: DirectionId }) {
  return (
    <>
      <section className="vm-workout-hero">
        <div>
          <span className="vm-chip">Sessao ativa</span>
          <h2>Peito + Costas</h2>
          <p>Proximo set: Supino inclinado. Carga sugerida 34-36 kg.</p>
        </div>
        <div className="vm-rest-timer">
          <small>Descanso</small>
          <strong>1:18</strong>
        </div>
      </section>

      <div className="vm-workout-summary">
        <Metric label="Series" value="18" progress={75} />
        <Metric label="Volume" value="9.8t" progress={82} />
        <Metric label="Intens." value="RPE 8" progress={68} />
      </div>

      <section className="vm-active-set">
        <div>
          <small>Entrada rapida</small>
          <strong>34 kg x 8 reps</strong>
        </div>
        <button type="button">{direction === 'aurora' ? 'Salvar set' : 'OK'}</button>
      </section>

      <div className="vm-workout-list">
        {workout.map(item => (
          <article key={item.name}>
            <div>
              <strong>{item.name}</strong>
              <small>{item.sets} / {item.load} / rest {item.rest}</small>
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
          <p>-0,8 kg em 14 dias, cintura estavel e BF descendo.</p>
        </div>
        <div className="vm-body-grid">
          <span><b>14,8%</b> BF</span>
          <span><b>84cm</b> cintura</span>
          <span><b>92%</b> aderencia</span>
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
        <span>AI</span>
        <h2>Kcalix Coach</h2>
        <p>IA discreta para tirar duvida, interpretar dados e sugerir ajustes sem virar mascote.</p>
      </section>

      <div className="vm-chat">
        <p className="assistant">Treino pesado hoje. Voce pode usar parte do saldo para carbo e manter gordura moderada.</p>
        <p className="user">Quero jantar sem passar da meta.</p>
        <p className="assistant">Use +55g carbo, 45g proteina e limite gordura em 12g. Fecho diario continua verde.</p>
      </div>

      <div className="vm-suggestion-grid">
        <button type="button">Analisar refeicao</button>
        <button type="button">Ajustar treino</button>
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
