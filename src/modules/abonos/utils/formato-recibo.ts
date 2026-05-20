/**
 * Devuelve el número de recibo tal como viene de la BD (ej: "RYR-2026-001").
 * Acepta string (formato nuevo) o number (retrocompatibilidad con registros históricos).
 */
export function formatearNumeroRecibo(numero: string | number): string {
  if (typeof numero === 'number') {
    return `RYR-${String(numero).padStart(4, '0')}`
  }
  return numero
}
