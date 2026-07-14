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
  // Tenta casar pelo texto sem o prefixo visual. Usar \p{Emoji} isoladamente
  // deixa variation selectors (ex.: U+FE0F em 🏋️), quebrando o match.
  const stripPrefix = (value: string) => value.replace(/^[^\p{L}\p{N}]+/u, '').trim()
  const stripped = stripPrefix(g)
  const match = MUSCLE_ORDER.find(
    m => stripPrefix(m) === stripped
  )
  return match ?? g
}
