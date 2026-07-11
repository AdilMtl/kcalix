import { useMemo, useState } from 'react'
import './VisualMockPage.css'

type DirectionId = 'aurora' | 'ember'
type MockTab = 'home' | 'diario' | 'treino' | 'corpo' | 'coach'
type WorkoutMoment = 'before' | 'after'

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
    name: 'Opcao A — Decisao primeiro',
    label: 'Uma recomendacao clara no topo e detalhes sob demanda',
    premise: 'O topo responde o que fazer agora. Antes do treino, combina um grupo grande com um pequeno; depois, vira um resumo de sessao e progresso.',
    titleFont: 'Bricolage Grotesque',
    bodyFont: 'Instrument Sans',
    dataFont: 'Azeret Mono',
    palette: ['#7a5cff', '#ff7a3d', '#ff3f8e', '#21d4b4'],
  },
  {
    id: 'ember',
    name: 'Opcao B — Painel analitico',
    label: 'Mais dados visiveis para decidir e acompanhar evolucao',
    premise: 'Um cockpit compacto: ranking de grupos abaixo da faixa, recomendacao combinada e comparativos da sessao ocupam o primeiro bloco.',
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

const homeHabits = [
  { id: 'dieta', label: 'Dieta', short: 'DI', done: true, streak: 11, trend: 92, color: '#21d4b4' },
  { id: 'log', label: 'Log alimentar', short: 'LG', done: true, streak: 18, trend: 100, color: '#9b8cff' },
  { id: 'treino', label: 'Treino', short: 'TR', done: false, streak: 4, trend: 58, color: '#ff2f7d' },
  { id: 'cardio', label: 'Cardio', short: 'CA', done: false, streak: 2, trend: 42, color: '#ff5c35' },
  { id: 'medidas', label: 'Medidas', short: 'ME', done: true, streak: 6, trend: 76, color: '#ffd166' },
]

const muscleNeeds = [
  { name: 'Costas', current: 9, target: 16, pct: 56, kind: 'grande' },
  { name: 'Ombros', current: 8, target: 14, pct: 57, kind: 'medio' },
  { name: 'Triceps', current: 7, target: 12, pct: 58, kind: 'pequeno' },
]

const weekCalories = [72, 84, 68, 91, 78, 62, 0]

export default function VisualMockPage() {
  const [directionId, setDirectionId] = useState<DirectionId>('ember')
  const [activeTab, setActiveTab] = useState<MockTab>('home')
  const [workoutMoment, setWorkoutMoment] = useState<WorkoutMoment>('before')

  const direction = useMemo(
    () => directions.find(item => item.id === directionId) ?? directions[0],
    [directionId],
  )

  return (
    <div className={`visual-mock vm-${direction.id}`}>
      <header className="vm-topbar">
        <div>
          <span className="vm-eyebrow">Kcalix Visual Lab v3</span>
          <h1>Dois caminhos para uma Home mais viva, util e forte em habitos.</h1>
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
            <span>Compare os dois momentos da Home. Calorias, habitos, grafico semanal, atalhos e Coach permanecem disponiveis.</span>
          </div>
          <div className="vm-moment-switch" aria-label="Momento do treino">
            <button className={workoutMoment === 'before' ? 'active' : ''} onClick={() => setWorkoutMoment('before')} type="button">Antes do treino</button>
            <button className={workoutMoment === 'after' ? 'active' : ''} onClick={() => setWorkoutMoment('after')} type="button">Depois do treino</button>
          </div>
        </aside>

        <section className="vm-phone-shell" aria-label="Mock clicavel">
          <div className="vm-phone">
            <div className="vm-ambient" />
            <div className="vm-texture" />
            <MockHeader activeTab={activeTab} />
            <CommandRail activeTab={activeTab} />
            <div className="vm-screen">
              {activeTab === 'home' && <HomeMock direction={direction.id} moment={workoutMoment} />}
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

function HomeMock({ direction, moment }: { direction: DirectionId; moment: WorkoutMoment }) {
  const isBefore = moment === 'before'

  if (direction === 'aurora') {
    return (
      <div className="vm-home-lab vm-home-improve vm-home-option-a">
        <section className={`vm-decision-hero ${isBefore ? '' : 'completed'}`}>
          <span className="vm-chip">{isBefore ? 'Proxima decisao' : 'Treino de hoje'}</span>
          {isBefore ? (
            <>
              <h2>O que treinar hoje?</h2>
              <p>Costas e triceps formam a melhor combinacao: os dois estao abaixo da faixa semanal e nao foram treinados nas ultimas 72h.</p>
              <div className="vm-recommended-pair">
                <div><small>Grupo grande</small><strong>Costas</strong><span>faltam 7 series</span></div>
                <b>+</b>
                <div><small>Grupo pequeno</small><strong>Triceps</strong><span>faltam 5 series</span></div>
              </div>
              <button className="vm-decision-cta" type="button">Montar Costas + triceps</button>
              <button className="vm-text-action" type="button">Ver ranking completo</button>
            </>
          ) : (
            <>
              <h2>Treino concluido</h2>
              <p>Costas + triceps / volume acima da ultima sessao e dois avancos de performance.</p>
              <div className="vm-session-kpis">
                <div><strong>438</strong><span>kcal</span></div>
                <div><strong>18</strong><span>series</span></div>
                <div><strong>52</strong><span>min</span></div>
              </div>
              <div className="vm-progress-callout"><span>↗</span><div><strong>Progresso confirmado</strong><small>+4,8% de carga / +6 repeticoes / 2 melhores marcas</small></div></div>
              <button className="vm-decision-cta" type="button">Ver treino salvo</button>
            </>
          )}
        </section>

        {isBefore && <MuscleRanking compact />}
        <HomeNutrition />
        <HomeHabitsCompact />
        <section className="vm-smart-insight">
          <span>Insight pelos seus dados</span>
          <strong>Faltam 42g de proteina para fechar o dia.</strong>
          <small>Priorize 30–40g no jantar. Calorias e gordura ainda comportam uma refeicao completa.</small>
        </section>
        <HomeWeeklyDashboard />
        <HomeEnergyCards />
        <HomeQuickActions />
      </div>
    )
  }

  return (
    <div className="vm-home-lab vm-home-improve vm-home-option-b">
      <section className="vm-analyst-board">
        <div className="vm-analyst-heading">
          <div>
            <span className="vm-chip">{isBefore ? 'Radar de treino' : 'Performance da sessao'}</span>
            <h2>{isBefore ? 'Decisao por volume' : 'Costas + triceps'}</h2>
          </div>
          <span className={`vm-status-pill ${isBefore ? '' : 'done'}`}>{isBefore ? '3 grupos abaixo' : 'concluido'}</span>
        </div>

        {isBefore ? (
          <>
            <MuscleRanking />
            <div className="vm-analyst-recommendation">
              <div><small>Combinacao recomendada</small><strong>Costas + triceps</strong><span>Grupo grande + pequeno / deficit total de 12 series</span></div>
              <button type="button">Abrir sugestao</button>
            </div>
          </>
        ) : (
          <>
            <div className="vm-analyst-kpi-grid">
              <article><small>Gasto</small><strong>438</strong><span>kcal</span></article>
              <article><small>Volume</small><strong>8,7t</strong><span>+4,8%</span></article>
              <article><small>Series</small><strong>18</strong><span>+2 vs anterior</span></article>
              <article><small>Duracao</small><strong>52m</strong><span>-3 min</span></article>
            </div>
            <div className="vm-performance-list">
              <div><span>Remada baixa</span><strong>61 → 64 kg</strong><i>+4,9%</i></div>
              <div><span>Puxada alta</span><strong>10 → 12 reps</strong><i>+2</i></div>
              <div><span>Triceps corda</span><strong>novo melhor set</strong><i>PR</i></div>
            </div>
            <button className="vm-analyst-full" type="button">Abrir analise do treino</button>
          </>
        )}
      </section>

      <div className="vm-dashboard-split">
        <HomeNutrition />
        <HomeHabitsCompact />
      </div>
      <section className="vm-smart-insight analyst">
        <span>Excecao detectada</span>
        <strong>Proteina abaixo do ritmo para este horario.</strong>
        <small>Voce consumiu 74% da meta; em dias parecidos costuma terminar entre 92–98%.</small>
      </section>
      <HomeWeeklyDashboard analyst />
      <HomeEnergyCards />
      <HomeQuickActions />
    </div>
  )
}

function MuscleRanking({ compact = false }: { compact?: boolean }) {
  return (
    <section className={`vm-muscle-ranking ${compact ? 'compact' : ''}`}>
      <div className="vm-section-head"><strong>Mais abaixo da faixa</strong><span>series / semana</span></div>
      {muscleNeeds.map((muscle, index) => (
        <div className="vm-muscle-row" key={muscle.name}>
          <b>{index + 1}</b>
          <span>{muscle.name}<small>{muscle.kind}</small></span>
          <div><i style={{ width: `${muscle.pct}%` }} /></div>
          <strong>{muscle.current}/{muscle.target}</strong>
        </div>
      ))}
    </section>
  )
}

function HomeNutrition() {
  return (
    <section className="vm-daily-calories vm-home-nutrition">
      <div className="vm-section-head"><strong>Calorias hoje</strong><button type="button">+ Adicionar</button></div>
      <div className="vm-calorie-main"><strong>1.842</strong><span>/ 2.350 kcal</span></div>
      <div className="vm-calorie-bar"><i style={{ width: '78%' }} /></div>
      <div className="vm-calorie-macros"><span>P 146g</span><span>C 192g</span><span>G 58g</span></div>
      <div className="vm-calorie-runway"><strong>508 kcal livres</strong><span>42P / 55C / 12G restantes</span></div>
    </section>
  )
}

function HomeHabitsCompact() {
  return (
    <section className="vm-habit-dropdown collapsed vm-home-habits">
      <button type="button">
        <span>Habitos diarios</span><strong>3/5</strong>
        <div className="vm-habit-summary-dots">
          {homeHabits.map(habit => <b key={habit.id} className={habit.done ? 'on' : ''} style={{ ['--habit-color' as string]: habit.color }} />)}
        </div>
        <i>Expandir</i>
      </button>
    </section>
  )
}

function HomeWeeklyDashboard({ analyst = false }: { analyst?: boolean }) {
  return (
    <section className={`vm-week-dashboard ${analyst ? 'analyst' : ''}`}>
      <div className="vm-section-head"><strong>Semana kcal</strong><span>-286 kcal/dia</span></div>
      <div className="vm-week-bars-new">
        {weekCalories.map((height, index) => (
          <div key={index} className={index === 4 ? 'today' : ''}><i style={{ height: `${height}%` }} /><b style={{ height: `${Math.max(0, height - 13)}%` }} /><span>{['S', 'T', 'Q', 'Q', 'S', 'S', 'D'][index]}</span></div>
        ))}
      </div>
      <div className="vm-week-legend"><span><i />Consumido</span><span><i />Gasto base + treino</span></div>
    </section>
  )
}

function HomeEnergyCards() {
  return (
    <section className="vm-home-bottom-grid vm-home-energy">
      <article><small>Energia</small><strong>508</strong><span>kcal livres</span></article>
      <article><small>Saldo</small><strong>-286</strong><span>TDEE 2.410</span></article>
    </section>
  )
}

function HomeQuickActions() {
  return (
    <section className="vm-home-quick-actions">
      <button type="button"><span>D</span>Diario</button>
      <button type="button"><span>T</span>Treino</button>
      <button type="button"><span>E</span>Evolucao</button>
      <button type="button"><span>P</span>Perfil</button>
    </section>
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
