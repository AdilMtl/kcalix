// normalizeGroup — resolve grupo muscular com ou sem emoji
// Necessário porque dados migrados do app antigo podem ter grupo salvo sem emoji
// (ex: "Peito" em vez de "🏋️ Peito")
// Mesmo fallback do resolvePrimaryGroup em useMuscleVolume.ts

import { MUSCLE_ORDER } from '../data/exerciseDb'

/** Retorna o grupo canônico (com emoji) a partir de qualquer variante.
 *  Se não encontrar match, retorna o valor original sem alteração. */
export function normalizeGroup(g: string): string {
  if (!g) return g
  // Já está no formato correto
  if ((MUSCLE_ORDER as readonly string[]).includes(g)) return g
  // Tenta casar pelo sufixo sem emoji (strip todos os chars emoji/espaço do início)
  const stripped = g.replace(/^[\p{Emoji}\s]+/u, '').trim()
  const match = MUSCLE_ORDER.find(
    m => m.replace(/^[\p{Emoji}\s]+/u, '').trim() === stripped
  )
  return match ?? g
}
