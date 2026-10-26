/**
 * Cálculo puro del estado de inactividad (sin navegador ni React).
 */

export type FaseInactividad = 'activa' | 'aviso' | 'expirada'

/** Tiempo de aviso antes de cerrar: 5 min, o la mitad si el límite es corto */
export function avisoMsPara(limiteMs: number): number {
  return Math.min(5 * 60_000, Math.floor(limiteMs / 2))
}

export function estadoInactividad(
  ultimaActividad: number,
  ahora: number,
  limiteMs: number
): { fase: FaseInactividad; restanteMs: number } {
  const restanteMs = Math.max(0, limiteMs - (ahora - ultimaActividad))
  if (restanteMs === 0) return { fase: 'expirada', restanteMs }
  if (restanteMs <= avisoMsPara(limiteMs)) return { fase: 'aviso', restanteMs }
  return { fase: 'activa', restanteMs }
}

/** "04:59" */
export function formatoCuentaRegresiva(ms: number): string {
  const total = Math.ceil(ms / 1000)
  const min = Math.floor(total / 60)
  const seg = total % 60
  return `${String(min).padStart(2, '0')}:${String(seg).padStart(2, '0')}`
}
