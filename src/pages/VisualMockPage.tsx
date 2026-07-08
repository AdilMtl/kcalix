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
    name: 'Aurora Glass',
    label: 'Identidade premium, mais disruptiva e sensorial',
    premise: 'Layout em cockpit assimetrico, fundo com textura leve em outra camada e cards mais solidos para nao poluir leitura.',
    titleFont: 'Bricolage Grotesque',
    bodyFont: 'Instrument Sans',
    dataFont: 'Azeret Mono',
    palette: ['#7a5cff', '#ff7a3d', '#ff3f8e', '#21d4b4'],
  },
  {
    id: 'ember',
    name: 'Ember Training',
    label: 'Treino limpo, rapido e tecnico',
    premise: 'Fluxo mais direto para academia: exercicio atual, carga, reps, descanso e lista compacta com alto contraste.',
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
          <span className="vm-eyebrow">Kcalix Visual Lab v3</span>
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
              {activeTab === 'home' && <HomeMock direction={direction.id} />}
              {activeTab === 'diario' && <DiaryMock direction={direction.id} />}
              {activeTab === 'treino' && <WorkoutMock direction={direction.id} />}
              {activeTab === 'corpo' && <BodyMock direction={direction.id} />}
              {activeTab === 'coach' && <CoachMock direction={direction.id} />}
            </div>
            <button className="vm-floating-coach" type="button">AI</button>
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

function HomeMock({ direction }: { direction: DirectionId }) {
  if (direction === 'aurora') {
    return (
      <div className="vm-aurora-home">
        <section className="vm-focus-panel">
          <div>
            <span className="vm-chip">Cockpit do dia</span>
            <h2>Plano em controle</h2>
            <p>Treino pesado, nutri com margem e medidas seguindo tendencia.</p>
          </div>
          <strong>78</strong>
        </section>

        <div className="vm-signal-grid">
          <article>
            <small>Nutri</small>
            <strong>508 kcal</strong>
            <span>livres</span>
          </article>
          <article>
            <small>Treino</small>
            <strong>9.8t</strong>
            <span>volume</span>
          </article>
          <article>
            <small>Corpo</small>
            <strong>-0.8kg</strong>
            <span>14 dias</span>
          </article>
        </div>

        <section className="vm-habit-strip">
          <div className="vm-section-head">
            <strong>Habitos</strong>
            <span>5/6 ativos</span>
          </div>
          <div>
            {['agua', 'creatina', 'sono', 'passos', 'mobilidade', 'check-in'].map((item, idx) => (
              <i key={item} className={idx < 5 ? 'on' : ''}>{item.slice(0, 1).toUpperCase()}</i>
            ))}
          </div>
        </section>

        <section className="vm-coach-strip aurora">
          <span>AI</span>
          <div>
            <strong>Insight inteligente</strong>
            <p>Se mantiver carbo no jantar, amanha o treino de pernas fica melhor sem quebrar o deficit semanal.</p>
          </div>
        </section>
      </div>
    )
  }

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

function DiaryMock({ direction }: { direction: DirectionId }) {
  if (direction === 'aurora') {
    return (
      <div className="vm-aurora-diary">
        <section className="vm-food-command">
          <span className="vm-chip">Lancamento rapido</span>
          <h2>Almoco</h2>
          <p>Digite alimento, fale com o Coach ou use favoritos.</p>
          <button type="button">+ Refeicao</button>
        </section>

        <div className="vm-macro-orbits">
          <Metric label="Proteina" value="146g" progress={86} />
          <Metric label="Carbo" value="192g" progress={72} />
          <Metric label="Gordura" value="58g" progress={64} />
        </div>

        <div className="vm-meal-list">
          {meals.map(meal => (
            <article key={meal.name} className="vm-meal-card">
              <div>
                <strong>{meal.name}</strong>
                <small>{meal.p}P / {meal.c}C / {meal.g}G</small>
              </div>
              <span>{meal.kcal}</span>
            </article>
          ))}
        </div>
      </div>
    )
  }

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
  if (direction === 'aurora') {
    return (
      <div className="vm-aurora-workout">
        <section className="vm-current-lift">
          <span className="vm-chip">Set atual</span>
          <h2>Supino inclinado</h2>
          <p>Set 3 de 4 / referencia anterior: 32 kg x 8</p>
          <div className="vm-lift-inputs">
            <button type="button">-</button>
            <strong>34 kg</strong>
            <strong>8 reps</strong>
            <button type="button">+</button>
          </div>
          <button className="vm-primary-action" type="button">Salvar serie</button>
        </section>

        <div className="vm-aurora-side">
          <section className="vm-rest-tile">
            <small>Descanso</small>
            <strong>1:18</strong>
            <span>proximo set</span>
          </section>
          <section className="vm-rest-tile hot">
            <small>Volume</small>
            <strong>9.8t</strong>
            <span>+6% vs media</span>
          </section>
        </div>

        <div className="vm-workout-list aurora-list">
          {workout.map(item => (
            <article key={item.name}>
              <div>
                <strong>{item.name}</strong>
                <small>{item.sets} / {item.load}</small>
              </div>
              <span>{item.trend}</span>
            </article>
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <section className="vm-ember-live">
        <div>
          <span className="vm-chip">Treino ativo</span>
          <h2>Supino inclinado</h2>
          <p>Set 3/4 / ultima serie 34 kg x 8</p>
        </div>
        <div className="vm-rest-timer">
          <small>Descanso</small>
          <strong>1:18</strong>
        </div>
      </section>

      <section className="vm-set-entry">
        <label>
          <span>Carga</span>
          <strong>34</strong>
          <small>kg</small>
        </label>
        <label>
          <span>Reps</span>
          <strong>8</strong>
          <small>reps</small>
        </label>
        <button type="button">Salvar</button>
      </section>

      <div className="vm-workout-list ember-list">
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

function BodyMock({ direction }: { direction: DirectionId }) {
  if (direction === 'aurora') {
    return (
      <>
        <section className="vm-body-panel aurora-body">
          <div>
            <span className="vm-chip">Tendencia corporal</span>
            <h2>82,4 kg</h2>
            <p>Cintura estavel, peso em queda e check-ins consistentes.</p>
          </div>
          <div className="vm-body-grid">
            <span><b>14,8%</b> BF</span>
            <span><b>84cm</b> cintura</span>
            <span><b>92%</b> aderencia</span>
          </div>
        </section>
        <section className="vm-glow-chart">
          {[68, 76, 72, 84, 79, 90, 86].map((height, idx) => (
            <i key={idx} style={{ height: `${height}%` }} />
          ))}
        </section>
      </>
    )
  }

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

function CoachMock({ direction }: { direction: DirectionId }) {
  if (direction === 'aurora') {
    return (
      <>
        <section className="vm-coach-hero aurora-coach">
          <span>AI</span>
          <h2>Coach discreto</h2>
          <p>Um painel de pergunta rapida, sem personagem e sem tomar a tela.</p>
        </section>
        <div className="vm-prompt-box">
          <span>O que voce quer ajustar?</span>
          <strong>treino / refeicao / medidas</strong>
        </div>
        <div className="vm-chat">
          <p className="assistant">Seu melhor ajuste hoje e carbo controlado no jantar. Mantem performance sem perder deficit.</p>
          <p className="user">E se eu treinar pernas amanha?</p>
          <p className="assistant">Eu elevaria carbo hoje em 35-55g e manteria gordura abaixo de 15g.</p>
        </div>
      </>
    )
  }

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
