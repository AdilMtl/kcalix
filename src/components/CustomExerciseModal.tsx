// CustomExerciseModal — form para criar exercício personalizado
// Original: #customExModal HTML (L2812–2835), openCustomExModal/saveCustomEx JS (L7953–7990)
// CSS: .tei-custom-tag, .sec-chip, .modal-sheet (L1569–1579)

import { useState, useEffect } from 'react';
import { EXERCISE_DB } from '../data/exerciseDb';

const GRUPOS = Object.keys(EXERCISE_DB);
const LEG_FAMILY = ['🦵 Pernas', '🦵 Quad', '🦵 Posterior'];

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (nome: string, grupo: string, secundarios: string[]) => void;
};

export function CustomExerciseModal({ open, onClose, onSave }: Props) {
  const [nome, setNome] = useState('');
  const [grupo, setGrupo] = useState(GRUPOS[0] ?? '');
  const [secundarios, setSecundarios] = useState<string[]>([]);

  // Reseta ao abrir — original L7961–7962
  useEffect(() => {
    if (open) {
      setNome('');
      setGrupo(GRUPOS[0] ?? '');
      setSecundarios([]);
    }
  }, [open]);

  // Chips excluem família das pernas quando grupo principal é perna — original L6202–6214
  const chipsDisponiveis = GRUPOS.filter(g => {
    if (LEG_FAMILY.includes(grupo)) return !LEG_FAMILY.includes(g);
    return g !== grupo;
  });

  const toggleSec = (g: string) => {
    setSecundarios(prev =>
      prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]
    );
  };

  // Limpa secundários inválidos ao mudar grupo principal
  const handleGrupoChange = (g: string) => {
    setGrupo(g);
    const excluded = LEG_FAMILY.includes(g) ? LEG_FAMILY : [g];
    setSecundarios(prev => prev.filter(s => !excluded.includes(s)));
  };

  const handleSave = () => {
    const n = nome.trim();
    if (!n) return;
    onSave(n, grupo, secundarios);
    onClose();
  };

  if (!open) return null;

  return (
    <>
      {/* overlay — z-index acima do ExerciseSelector (329) */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)',
          zIndex: 330, opacity: open ? 1 : 0,
          transition: 'opacity .25s',
        }}
      />

      {/* sheet — .modal-sheet (L2814) — z-index acima do ExerciseSelector */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'linear-gradient(180deg, #1a2035, #121828)',
        borderRadius: '20px 20px 0 0',
        zIndex: 331,
        maxHeight: '90dvh',
        overflowY: 'auto',
        padding: '0 0 env(safe-area-inset-bottom)',
      }}>
        {/* handle */}
        <div style={{
          width: 36, height: 4, borderRadius: 2,
          background: 'rgba(255,255,255,.15)',
          margin: '12px auto 0',
        }} />

        {/* header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 16px 10px',
          borderBottom: '1px solid var(--line)',
        }}>
          <b style={{ fontSize: 16 }}>＋ Criar exercício</b>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', color: 'var(--text2)',
              fontSize: 18, cursor: 'pointer', padding: '0 4px',
            }}
          >✕</button>
        </div>

        {/* body */}
        <div style={{ padding: '16px 16px 24px', display: 'flex', flexDirection: 'column', gap: 0 }}>

          {/* Nome — L2821–2824 */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>
              Nome do exercício
            </label>
            <input
              autoFocus
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Ex: Supino máquina Academia A"
              autoComplete="off"
              style={{
                width: '100%', fontSize: 16,
                background: 'var(--surface2)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-xs)',
                padding: '10px 12px',
                color: 'var(--text)',
                outline: 'none',
                fontFamily: 'var(--font)',
                boxSizing: 'border-box',
              }}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
            />
          </div>

          {/* Grupo principal — L2825–2828 */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>
              Grupo muscular
            </label>
            <select
              value={grupo}
              onChange={e => handleGrupoChange(e.target.value)}
              style={{
                width: '100%',
                border: '1px solid var(--line)',
                background: 'rgba(0,0,0,.15)',
                color: 'var(--text)',
                fontFamily: 'var(--font)',
                fontSize: 16,
                fontWeight: 700,
                padding: 8,
                borderRadius: 'var(--radius-xs)',
                outline: 'none',
                WebkitAppearance: 'none',
                appearance: 'none',
              }}
            >
              {GRUPOS.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Grupos secundários — chips (L2829–2832, CSS L1578–1579) */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>
              Grupos secundários{' '}
              <span style={{ color: 'var(--text3)', fontWeight: 400 }}>(opcional)</span>
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
              {chipsDisponiveis.map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => toggleSec(g)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 20,
                    border: secundarios.includes(g)
                      ? '1px solid var(--accent)'
                      : '1px solid var(--line)',
                    fontSize: 12,
                    fontWeight: 600,
                    color: secundarios.includes(g) ? '#fff' : 'var(--text2)',
                    background: secundarios.includes(g) ? 'var(--accent)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.15s, color 0.15s',
                    fontFamily: 'var(--font)',
                  }}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Botão criar — L2833 */}
          <button
            onClick={handleSave}
            disabled={!nome.trim()}
            className="btn primary"
            style={{ width: '100%', minHeight: 44, fontSize: 15 }}
          >
            ✅ Criar exercício
          </button>
        </div>
      </div>
    </>
  );
}
