/**
 * Retorna a data local no formato YYYY-MM-DD, compensando o fuso horário.
 * Fiel ao original referência.index.html L3711–3715.
 *
 * Usar new Date().toISOString() retorna UTC — no Brasil (UTC-3) isso faz
 * o app "virar o dia" às 21h no horário local.
 */
export function todayISO(): string {
  const d = new Date()
  const tzOff = d.getTimezoneOffset()
  const local = new Date(d.getTime() - tzOff * 60000)
  return local.toISOString().slice(0, 10)
}
