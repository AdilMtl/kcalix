// CoachGuideModal — guia educativo de volume (5 abas)
// Fiel ao original: referência.index.html L1604–1630 (CSS coach-tabs)
// Conteúdo baseado nos protocolos Lucas Campos / RP presentes no app original
// z-index: 320 (acima da TreinoPage, abaixo de ExerciseSelector 329)

import { useState } from 'react'
import { MUSCLE_LANDMARKS, MUSCLE_ORDER } from '../data/exerciseDb'

interface Props {
  open:    boolean
  onClose: () => void
}

type Tab = 'mev' | 'cycling' | 'reps' | 'deload' | 'progressao'

const TABS: { id: Tab; label: string }[] = [
  { id: 'mev',        label: '📊 MEV/MAV/MRV' },
  { id: 'cycling',    label: '🔄 Volume Cycling' },
  { id: 'reps',       label: '🔢 Rep Ranges' },
  { id: 'deload',     label: '😴 Deload' },
  { id: 'progressao', label: '📈 Progressão' },
]

export function CoachGuideModal({ open, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('mev')
  const [activeGrupo, setActiveGrupo] = useState<string>(MUSCLE_ORDER[0])

  if (!open) return null

  return (
    <>
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 319 }}
        onClick={onClose}
      />
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        maxHeight: '88dvh',
        background: 'linear-gradient(180deg, #1a2035, #121828)',
        borderRadius: '20px 20px 0 0',
        zIndex: 320,
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Handle */}
        <div style={{ width: 36, height: 4, background: 'rgba(255,255,255,.15)', borderRadius: 2, margin: '10px auto 0' }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px 8px', flexShrink: 0 }}>
          <b style={{ fontSize: 16, color: 'var(--text)' }}>📖 Guia de Volume</b>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 18, cursor: 'pointer', padding: '0 4px', fontFamily: 'var(--font)' }}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', padding: '0 16px 10px', flexShrink: 0 }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '6px 12px', borderRadius: 20,
                border: '1px solid var(--line)',
                fontSize: 12, fontWeight: 600,
                background: activeTab === tab.id ? 'var(--accent)' : 'transparent',
                color: activeTab === tab.id ? '#fff' : 'var(--text2)',
                cursor: 'pointer', fontFamily: 'var(--font)',
                WebkitTapHighlightColor: 'transparent',
              }}
            >{tab.label}</button>
          ))}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 24px' }}>

          {/* ── MEV / MAV / MRV ── */}
          {activeTab === 'mev' && (
            <>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>O que são MEV, MAV e MRV?</div>
                <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>
                  <p>Esses valores definem a <b>faixa ótima de volume semanal</b> por grupo muscular, baseados nos protocolos de Lucas Campos e Renaissance Periodization (RP).</p>
                  <ul>
                    <li><b style={{ color: 'var(--accent)' }}>MEV</b> — <i>Mínimo Efetivo</i>: mínimo de séries por semana para manter massa muscular. Abaixo disso, você não cresce.</li>
                    <li><b style={{ color: 'var(--good)' }}>MAV</b> — <i>Máximo Adaptativo</i>: volume ideal para crescimento. É aqui que você fica a maior parte do tempo.</li>
                    <li><b style={{ color: 'var(--bad)' }}>MRV</b> — <i>Máximo Recuperável</i>: limite acima do qual você não consegue se recuperar adequadamente. Ultrapassar por semanas seguidas causa overtraining.</li>
                  </ul>
                  <p>Séries via exercícios compostos (costas via supino, bíceps via remada) valem <b>0.5x</b> na contagem.</p>
                </div>
                <blockquote style={{ borderLeft: '3px solid var(--accent)', padding: '8px 12px', margin: '12px 0', fontSize: 13, fontStyle: 'italic', color: 'var(--text2)', background: 'var(--surface2)', borderRadius: '0 8px 8px 0' }}>
                  "Não é quem treina mais que cresce — é quem treina na dose certa com consistência."
                </blockquote>
              </div>

              {/* Tabela por grupo */}
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Referência por grupo muscular</div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, marginTop: 4 }}>
                  <thead>
                    <tr>
                      {['Grupo', 'MEV', 'MAV', 'MRV'].map(h => (
                        <th key={h} style={{ textAlign: 'left', color: 'var(--text3)', fontWeight: 600, padding: '4px 8px', borderBottom: '1px solid var(--line)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {MUSCLE_ORDER.map(g => {
                      const lm = MUSCLE_LANDMARKS[g]
                      return (
                        <tr key={g}>
                          <td style={{ fontWeight: 700, color: 'var(--text)', padding: '6px 8px', borderBottom: '1px solid rgba(255,255,255,.04)' }}>{g}</td>
                          <td style={{ color: 'var(--text2)', padding: '6px 8px', borderBottom: '1px solid rgba(255,255,255,.04)' }}>{lm.mev}</td>
                          <td style={{ color: 'var(--text2)', padding: '6px 8px', borderBottom: '1px solid rgba(255,255,255,.04)' }}>{lm.mav}</td>
                          <td style={{ color: 'var(--text2)', padding: '6px 8px', borderBottom: '1px solid rgba(255,255,255,.04)' }}>{lm.mrv}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Detalhe por grupo */}
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: '16px 0 8px' }}>Detalhe por grupo</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                {MUSCLE_ORDER.map(g => (
                  <button key={g} onClick={() => setActiveGrupo(g)} style={{
                    padding: '6px 14px', borderRadius: 20,
                    border: activeGrupo === g ? '1px solid var(--accent)' : '1px solid var(--line)',
                    fontSize: 12, fontWeight: 600,
                    background: activeGrupo === g ? 'var(--surface2)' : 'transparent',
                    color: activeGrupo === g ? 'var(--text)' : 'var(--text2)',
                    cursor: 'pointer', fontFamily: 'var(--font)',
                    WebkitTapHighlightColor: 'transparent',
                  }}>{g}</button>
                ))}
              </div>
              {(() => {
                const lm = MUSCLE_LANDMARKS[activeGrupo as keyof typeof MUSCLE_LANDMARKS]
                if (!lm) return null
                return (
                  <div style={{ background: 'var(--surface2)', borderRadius: 12, padding: 12 }}>
                    <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: '0 0 8px' }}>{activeGrupo}</h4>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                      {[
                        { lbl: 'MEV', val: lm.mev, color: 'var(--accent)' },
                        { lbl: 'MAV', val: lm.mav, color: 'var(--good)' },
                        { lbl: 'MRV', val: lm.mrv, color: 'var(--bad)' },
                      ].map(({ lbl, val, color }) => (
                        <div key={lbl} style={{ textAlign: 'center', flex: 1, background: 'var(--surface)', borderRadius: 8, padding: '6px 4px' }}>
                          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>{val}</div>
                          <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color, marginTop: 1 }}>{lbl}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>
                      Fique entre <b>{lm.mev}–{lm.mav} séries/semana</b> para crescer de forma consistente. Acima de {lm.mrv} séries, o risco de overtraining aumenta.
                    </div>
                  </div>
                )
              })()}
            </>
          )}

          {/* ── Volume Cycling ── */}
          {activeTab === 'cycling' && (
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Volume Cycling</div>
              <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>
                <p>Seu corpo se adapta ao estresse — o que funcionou por 6 semanas pode deixar de funcionar. O Volume Cycling organiza isso em ondas:</p>
                <ul>
                  <li><b>Acúmulo (4–6 semanas):</b> volume progressivo, do MEV até perto do MAV/MRV.</li>
                  <li><b>Deload (1 semana):</b> reduz para 30–50% do volume normal. Carga mantida.</li>
                  <li><b>Realização (2–4 semanas):</b> volume menor, carga alta, testa o novo teto.</li>
                </ul>
                <p>O ícone <b>⚠ volume alto por X semanas</b> aparece quando você ficou acima do MAV por 4+ semanas consecutivas — sinal de que é hora de deloar.</p>
                <blockquote style={{ borderLeft: '3px solid var(--accent)', padding: '8px 12px', margin: '12px 0', fontSize: 13, fontStyle: 'italic', color: 'var(--text2)', background: 'var(--surface2)', borderRadius: '0 8px 8px 0' }}>
                  "É como parar no posto: não para desistir da viagem, mas para chegar mais longe."
                </blockquote>
              </div>
            </div>
          )}

          {/* ── Rep Ranges ── */}
          {activeTab === 'reps' && (
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Faixas de Repetição</div>
              <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>
                <p>Todas as faixas geram hipertrofia — o que muda é o <i>tipo de estímulo</i> e o stress articular:</p>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, margin: '8px 0 12px' }}>
                  <thead>
                    <tr>
                      {['Faixa', 'Ênfase', 'Uso recomendado'].map(h => (
                        <th key={h} style={{ textAlign: 'left', color: 'var(--text3)', fontWeight: 600, padding: '4px 8px', borderBottom: '1px solid var(--line)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['4–6 reps', 'Força máxima', 'Compostos, ciclos de força'],
                      ['6–10 reps', 'Hipertrofia + Força', 'Compostos, bloco principal'],
                      ['10–15 reps', 'Hipertrofia + Endurance', 'Isolações, finalizadores'],
                      ['15–30 reps', 'Endurance muscular', 'Pump, core, reabilitação'],
                    ].map(([f, e, u]) => (
                      <tr key={f}>
                        <td style={{ fontWeight: 700, color: 'var(--text)', padding: '6px 8px', borderBottom: '1px solid rgba(255,255,255,.04)' }}>{f}</td>
                        <td style={{ color: 'var(--text2)', padding: '6px 8px', borderBottom: '1px solid rgba(255,255,255,.04)' }}>{e}</td>
                        <td style={{ color: 'var(--text2)', padding: '6px 8px', borderBottom: '1px solid rgba(255,255,255,.04)' }}>{u}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p><b>Monotonia de rep range:</b> ficar sempre na mesma faixa por 4+ sessões pode limitar adaptações. Variar o estímulo é uma forma simples de sair do plateau sem trocar exercícios.</p>
              </div>
            </div>
          )}

          {/* ── Deload ── */}
          {activeTab === 'deload' && (
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Semana de Deload</div>
              <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>
                <p>O deload <b>não é tirar férias do treino</b>. É treinar com volume reduzido para que os tecidos (tendões, articulações, sistema nervoso) se recuperem completamente — sem perder o estímulo muscular.</p>
                <p><b>Como fazer:</b></p>
                <ul>
                  <li>Reduza o <b>volume</b> para 30–50% do normal (ex: 3 séries → 1–2 séries).</li>
                  <li>Mantenha a <b>carga</b> igual ou levemente menor.</li>
                  <li>Mantenha a <b>frequência</b> de treinos.</li>
                  <li>Duração: <b>1 semana</b> é suficiente para a maioria.</li>
                </ul>
                <p><b>Quando fazer:</b></p>
                <ul>
                  <li>A cada 4–8 semanas de treino intenso.</li>
                  <li>Quando o ícone de alerta <b>⚠ volume alto por X semanas</b> aparecer.</li>
                  <li>Quando você perceber queda de força em 2+ exercícios.</li>
                  <li>Quando dormir bem mas ainda acordar com articulações pesadas.</li>
                </ul>
                <blockquote style={{ borderLeft: '3px solid var(--accent)', padding: '8px 12px', margin: '12px 0', fontSize: 13, fontStyle: 'italic', color: 'var(--text2)', background: 'var(--surface2)', borderRadius: '0 8px 8px 0' }}>
                  "O músculo não cresce na academia — cresce na recuperação."
                </blockquote>
              </div>
            </div>
          )}

          {/* ── Progressão de Carga ── */}
          {activeTab === 'progressao' && (
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Progressão de Carga</div>
              <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>
                <p>A <b>sobrecarga progressiva</b> é o princípio mais importante para hipertrofia: o músculo só cresce se for desafiado progressivamente.</p>
                <p><b>Formas de progredir:</b></p>
                <ul>
                  <li><b>Carga:</b> adicionar 2.5–5 kg quando conseguir completar todas as reps no topo da faixa (ex: 3×12 → adiciona carga).</li>
                  <li><b>Reps:</b> fazer mais reps com a mesma carga antes de aumentar.</li>
                  <li><b>Séries:</b> adicionar 1 série por semana (mais comum em iniciantes).</li>
                  <li><b>Densidade:</b> fazer o mesmo volume em menos tempo.</li>
                </ul>
                <p><b>Plateau:</b> se a carga não progrediu em {'>'}2–3 semanas, considere:</p>
                <ul>
                  <li>Verificar se chegou perto da falha nas últimas reps.</li>
                  <li>Checar qualidade do sono e alimentação.</li>
                  <li>Fazer um deload e retornar com volume reduzido.</li>
                  <li>Variar o exercício principal por 4–8 semanas.</li>
                </ul>
                <p>O botão <b>📊</b> em cada exercício mostra o gráfico de progressão de carga e volume das últimas sessões.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
