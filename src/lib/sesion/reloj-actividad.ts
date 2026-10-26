/**
 * Reloj de actividad compartido por todas las pestañas del navegador.
 *
 * Vive en localStorage: la actividad en cualquier pestaña mantiene viva la
 * sesión en todas, y sobrevive a cerrar el navegador (al volver se sabe
 * cuánto tiempo pasó). Cada registro lleva el usuario y su último inicio de
 * sesión, así un login nuevo nunca hereda la inactividad de uno anterior.
 */

const CLAVE_ACTIVIDAD = 'ryr:actividad'
const CLAVE_LIMITE = 'ryr:inactividad-minutos'
/** Marca que avisa a las demás pestañas que la sesión se cerró por inactividad */
const CLAVE_CIERRE = 'ryr:cierre-inactividad'

export const LIMITE_POR_DEFECTO_MIN = 60

export interface RegistroActividad {
  uid: string
  /** user.last_sign_in_at: identifica el inicio de sesión */
  inicio: string | null
  /** Última actividad (ms) */
  t: number
}

function leerJson<T>(clave: string): T | null {
  try {
    const crudo = localStorage.getItem(clave)
    return crudo ? (JSON.parse(crudo) as T) : null
  } catch {
    return null
  }
}

function escribir(clave: string, valor: string | null) {
  try {
    if (valor === null) localStorage.removeItem(clave)
    else localStorage.setItem(clave, valor)
  } catch {
    // Modo privado o almacenamiento bloqueado: el reloj vive solo en memoria
  }
}

export function leerActividad(): RegistroActividad | null {
  const r = leerJson<RegistroActividad>(CLAVE_ACTIVIDAD)
  return r && typeof r.t === 'number' && typeof r.uid === 'string' ? r : null
}

export function marcarActividad(
  uid: string,
  inicio: string | null,
  t = Date.now()
) {
  escribir(CLAVE_ACTIVIDAD, JSON.stringify({ uid, inicio, t }))
}

export function borrarActividad() {
  escribir(CLAVE_ACTIVIDAD, null)
}

export function leerLimiteMinutos(): number {
  const n = leerJson<number>(CLAVE_LIMITE)
  return typeof n === 'number' && n > 0 ? n : LIMITE_POR_DEFECTO_MIN
}

export function guardarLimiteMinutos(minutos: number) {
  escribir(CLAVE_LIMITE, JSON.stringify(minutos))
}

export function avisarCierrePorInactividad() {
  escribir(CLAVE_CIERRE, String(Date.now()))
}

/**
 * Escucha cambios hechos por OTRAS pestañas (el evento `storage` no se
 * dispara en la pestaña que escribe).
 */
export function escucharOtrasPestanas(handlers: {
  onActividad: () => void
  onCierre: () => void
}): () => void {
  const alCambiar = (e: StorageEvent) => {
    if (e.key === CLAVE_ACTIVIDAD) handlers.onActividad()
    else if (e.key === CLAVE_CIERRE && e.newValue) handlers.onCierre()
  }
  window.addEventListener('storage', alCambiar)
  return () => window.removeEventListener('storage', alCambiar)
}
