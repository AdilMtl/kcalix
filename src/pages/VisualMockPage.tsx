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
    name: 'Aurora Ritual Board',
    label: 'Home mais sensorial, assimetrica e guiada por habitos',
    premise: 'Uma tela inicial com foco em ritmo do dia: placar grande, habitos como trilhas visuais e energia em leitura editorial.',
    titleFont: 'Bricolage Grotesque',
    bodyFont: 'Instrument Sans',
    dataFont: 'Azeret Mono',
    palette: ['#7a5cff', '#ff7a3d', '#ff3f8e', '#21d4b4'],
  },
  {
    id: 'ember',
    name: 'Ember Ritual Home',
    label: 'Estrutura Aurora com acabamento tecnico Ember',
    premise: 'Mantem o treino de hoje e o ritual board como protagonistas, mas com superficies solidas, contraste alto e cores Ember.',
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

const habitWeek = [
  [1, 1, 1, 0, 1],
  [1, 1, 0, 1, 1],
  [1, 1, 1, 0, 0],
  [1, 1, 0, 1, 1],
  [1, 1, 0, 0, 1],
  [0, 1, 0, 0, 0],
  [0, 0, 0, 0, 0],
]

const workoutPlan = {
  split: 'Push A',
  focus: 'Peito + ombro',
  reason: 'ultimo push ha 4 dias',
  readiness: 82,
  exercises: ['Supino inclinado', 'Desenvolvimento', 'Triceps corda'],
}

export default function VisualMockPage() {
  const [directionId, setDirectionId] = useState<DirectionId>('ember')
  const [activeTab, setActiveTab] = useState<MockTab>('home')

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
            <span>Compare a aba Home nos dois modelos. As outras abas continuam como contexto do sistema visual.</span>
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
      <div className="vm-aurora-home vm-home-lab">
        <section className="vm-home-aurora-hero">
          <div className="vm-home-aurora-copy">
            <span className="vm-chip">Treino de hoje</span>
            <h2>{workoutPlan.split}</h2>
            <p>{workoutPlan.focus} / {workoutPlan.reason}. Intensidade sugerida moderada-alta.</p>
          </div>
          <div className="vm-home-score-orb">
            <strong>{workoutPlan.readiness}</strong>
            <span>pronto</span>
          </div>
        </section>

        <section className="vm-next-workout-card aurora">
          <div>
            <small>Comecar por</small>
            <strong>{workoutPlan.exercises[0]}</strong>
            <span>3 series de aquecimento + carga alvo da ultima sessao</span>
          </div>
          <button type="button">Abrir treino</button>
        </section>

        <section className="vm-workout-reason aurora">
          <article>
            <small>Por que hoje</small>
            <strong>{workoutPlan.reason}</strong>
            <span>Peito recuperado, ombro sem excesso de volume e costas ainda no alvo semanal.</span>
          </article>
          <article>
            <small>Plano minimo</small>
            <strong>25 min</strong>
            <span>Supino + desenvolvimento + triceps. O resto fica opcional.</span>
          </article>
        </section>

        <section className="vm-daily-calories aurora">
          <div className="vm-section-head">
            <strong>Calorias hoje</strong>
            <span>508 livres</span>
          </div>
          <div className="vm-calorie-main">
            <strong>1.842</strong>
            <span>/ 2.350 kcal</span>
          </div>
          <div className="vm-calorie-bar"><i style={{ width: '78%' }} /></div>
          <div className="vm-calorie-macros">
            <span>P 146g</span>
            <span>C 192g</span>
            <span>G 58g</span>
          </div>
          <div className="vm-calorie-runway">
            <strong>Dica para jantar</strong>
            <span>ate 45P / 55C / 12G sem passar da meta</span>
          </div>
        </section>

        <section className="vm-habit-dropdown collapsed">
          <button type="button">
            <span>Habitos diarios</span>
            <strong>3/5</strong>
            <div className="vm-habit-summary-dots">
              {homeHabits.map(habit => (
                <b
                  key={habit.id}
                  className={habit.done ? 'on' : ''}
                  style={{ ['--habit-color' as string]: habit.color }}
                />
              ))}
            </div>
            <i>Editar lista</i>
          </button>
          <div className="vm-habit-menu">
            {homeHabits.map(habit => (
              <article
                key={habit.id}
                className={habit.done ? 'done' : ''}
                style={{ ['--habit-color' as string]: habit.color }}
              >
                <span>{habit.short}</span>
                <strong>{habit.label}</strong>
                <small>{habit.done ? `${habit.streak}d` : 'pendente'}</small>
              </article>
            ))}
          </div>
        </section>

        <section className="vm-alert-stack aurora">
          <article>
            <small>Alerta discreto</small>
            <strong>Proteina ok, carbo livre</strong>
            <span>Bom cenario para treinar antes do jantar.</span>
          </article>
        </section>

        <section className="vm-week-pulse">
          <div className="vm-section-head">
            <strong>Semana em pulso</strong>
            <span>76% aderencia</span>
          </div>
          <div className="vm-pulse-days">
            {habitWeek.map((day, dayIdx) => (
              <div key={dayIdx} className={dayIdx === 4 ? 'today' : ''}>
                {day.map((value, habitIdx) => (
                  <i
                    key={habitIdx}
                    className={value ? 'on' : ''}
                    style={{ ['--habit-color' as string]: homeHabits[habitIdx].color }}
                  />
                ))}
              </div>
            ))}
          </div>
        </section>

        <section className="vm-home-bottom-grid">
          <article>
            <small>Energia</small>
            <strong>508</strong>
            <span>kcal livres</span>
          </article>
          <article>
            <small>Proximo foco</small>
            <strong>Treino</strong>
            <span>pendente hoje</span>
          </article>
        </section>

        <section className="vm-coach-strip aurora">
          <span>AI</span>
          <div>
            <strong>Decisao sugerida</strong>
            <p>Faça o Push A antes do jantar. Depois use carbo moderado e mantenha a semana em deficit.</p>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="vm-ember-home vm-home-lab vm-hybrid-home">
      <section className="vm-home-aurora-hero">
        <div className="vm-home-aurora-copy">
          <span className="vm-chip">Treino de hoje</span>
          <h2>{workoutPlan.split}</h2>
          <p>{workoutPlan.focus} / {workoutPlan.reason}. Estrutura Aurora, leitura Ember.</p>
        </div>
        <div className="vm-home-score-orb">
          <strong>{workoutPlan.readiness}</strong>
          <span>pronto</span>
        </div>
      </section>

      <section className="vm-next-workout-card ember">
        <div>
          <small>Comecar por</small>
          <strong>{workoutPlan.exercises[0]}</strong>
          <span>Depois {workoutPlan.exercises[1].toLowerCase()} e finalizador de triceps</span>
        </div>
        <button type="button">Abrir treino</button>
      </section>

      <section className="vm-workout-reason ember">
        <article>
          <small>Por que hoje</small>
          <strong>{workoutPlan.reason}</strong>
          <span>Peito recuperado, ombro sem excesso de volume e costas ainda no alvo semanal.</span>
        </article>
        <article>
          <small>Plano minimo</small>
          <strong>25 min</strong>
          <span>Supino + desenvolvimento + triceps. O resto fica opcional.</span>
        </article>
      </section>

      <section className="vm-daily-calories ember">
        <div className="vm-section-head">
          <strong>Calorias hoje</strong>
          <span>508 livres</span>
        </div>
        <div className="vm-calorie-main">
          <strong>1.842</strong>
          <span>/ 2.350 kcal</span>
        </div>
        <div className="vm-calorie-bar"><i style={{ width: '78%' }} /></div>
        <div className="vm-calorie-macros">
          <span>P 146g</span>
          <span>C 192g</span>
          <span>G 58g</span>
        </div>
        <div className="vm-calorie-runway">
          <strong>Dica para jantar</strong>
          <span>ate 45P / 55C / 12G sem passar da meta</span>
        </div>
      </section>

      <section className="vm-habit-dropdown ember collapsed">
        <button type="button">
          <span>Habitos diarios</span>
          <strong>3/5</strong>
          <div className="vm-habit-summary-dots">
            {homeHabits.map(habit => (
              <b
                key={habit.id}
                className={habit.done ? 'on' : ''}
                style={{ ['--habit-color' as string]: habit.color }}
              />
            ))}
          </div>
          <i>Editar lista</i>
        </button>
        <div className="vm-habit-menu">
          {homeHabits.map(habit => (
            <article
              key={habit.id}
              className={habit.done ? 'done' : ''}
              style={{ ['--habit-color' as string]: habit.color }}
            >
              <span>{habit.short}</span>
              <strong>{habit.label}</strong>
              <small>{habit.done ? `${habit.streak}d` : 'pendente'}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="vm-alert-stack ember">
        <article>
          <small>Alerta discreto</small>
          <strong>Proteina ok, carbo livre</strong>
          <span>Bom cenario para treinar antes do jantar.</span>
        </article>
      </section>

      <section className="vm-week-pulse ember">
        <div className="vm-section-head">
          <strong>Semana em pulso</strong>
          <span>76% aderencia</span>
        </div>
        <div className="vm-pulse-days">
          {habitWeek.map((day, dayIdx) => (
            <div key={dayIdx} className={dayIdx === 4 ? 'today' : ''}>
              {day.map((value, habitIdx) => (
                <i
                  key={habitIdx}
                  className={value ? 'on' : ''}
                  style={{ ['--habit-color' as string]: homeHabits[habitIdx].color }}
                />
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="vm-home-bottom-grid ember">
        <article>
          <small>Energia</small>
          <strong>508</strong>
          <span>kcal livres</span>
        </article>
        <article>
          <small>Proteina</small>
          <strong>146g</strong>
          <span>86% da meta</span>
        </article>
      </section>

      <section className="vm-coach-strip">
        <span>AI</span>
        <div>
          <strong>Coach insight</strong>
          <p>Treine Push A hoje. Se faltar tempo, mantenha supino e desenvolvimento; cardio pode ficar para amanha.</p>
        </div>
      </section>
    </div>
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
