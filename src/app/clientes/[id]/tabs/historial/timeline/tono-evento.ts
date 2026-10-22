/**
 * Colores de la línea de tiempo por color de evento: ficha del ícono
 * (degradado) e insignia suave (fondo claro + texto oscuro legible).
 */

import type { ColorEvento } from '@/modules/clientes/types/historial.types'

interface TonoEvento {
  ficha: string
  insignia: string
}

export const TONO_EVENTO: Record<ColorEvento, TonoEvento> = {
  blue: {
    ficha: 'from-blue-500 to-indigo-500 shadow-blue-500/25',
    insignia:
      'bg-blue-50 text-blue-700 ring-blue-600/15 dark:bg-blue-500/10 dark:text-blue-300',
  },
  green: {
    ficha: 'from-emerald-500 to-teal-500 shadow-emerald-500/25',
    insignia:
      'bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-500/10 dark:text-emerald-300',
  },
  yellow: {
    ficha: 'from-amber-400 to-yellow-500 shadow-amber-500/25',
    insignia:
      'bg-amber-50 text-amber-800 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300',
  },
  red: {
    ficha: 'from-rose-500 to-red-600 shadow-rose-500/25',
    insignia:
      'bg-rose-50 text-rose-700 ring-rose-600/15 dark:bg-rose-500/10 dark:text-rose-300',
  },
  purple: {
    ficha: 'from-violet-500 to-fuchsia-500 shadow-violet-500/25',
    insignia:
      'bg-violet-50 text-violet-700 ring-violet-600/15 dark:bg-violet-500/10 dark:text-violet-300',
  },
  amber: {
    ficha: 'from-amber-500 to-orange-500 shadow-amber-500/25',
    insignia:
      'bg-amber-50 text-amber-800 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300',
  },
  cyan: {
    ficha: 'from-cyan-500 to-blue-500 shadow-cyan-500/25',
    insignia:
      'bg-cyan-50 text-cyan-700 ring-cyan-600/15 dark:bg-cyan-500/10 dark:text-cyan-300',
  },
  orange: {
    ficha: 'from-orange-500 to-amber-500 shadow-orange-500/25',
    insignia:
      'bg-orange-50 text-orange-700 ring-orange-600/15 dark:bg-orange-500/10 dark:text-orange-300',
  },
  gray: {
    ficha: 'from-slate-500 to-slate-600 shadow-slate-500/25',
    insignia:
      'bg-slate-100 text-slate-700 ring-slate-600/15 dark:bg-slate-700/60 dark:text-slate-300',
  },
}

export const tonoEvento = (color: ColorEvento | undefined) =>
  TONO_EVENTO[color ?? 'gray'] ?? TONO_EVENTO.gray

/** Etiqueta corta de la acción para la insignia */
export function etiquetaAccion(
  accion: string,
  esNota: boolean,
  esImportante: boolean
): string {
  if (esNota) return esImportante ? 'Nota importante' : 'Nota'
  const etiquetas: Record<string, string> = {
    CREATE: 'Creación',
    UPDATE: 'Cambio',
    DELETE: 'Eliminación',
    ANULAR: 'Anulación',
  }
  return etiquetas[accion] ?? accion
}

/** "08:17 a. m." */
export const horaEvento = (fecha: string) =>
  new Date(fecha).toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })

/** Plural de una ráfaga por tipo: "6 documentos cargados" */
const PLURAL_RAFAGA: Partial<Record<string, string>> = {
  documento_subido: 'documentos cargados',
  documento_actualizado: 'documentos actualizados',
  documento_eliminado: 'documentos eliminados',
  abono_registrado: 'abonos registrados',
  abono_editado: 'abonos editados',
  abono_anulado: 'abonos anulados',
  cliente_actualizado: 'cambios en el cliente',
  negociacion_actualizada: 'cambios en la negociación',
  interes_registrado: 'intereses registrados',
  interes_actualizado: 'intereses actualizados',
}

export function tituloRafaga(tipo: string, titulo: string, total: number) {
  const plural = PLURAL_RAFAGA[tipo]
  return plural ? `${total} ${plural}` : `${titulo} · ${total} veces`
}

/**
 * "Recibo: RYR-007 · Valor: $58.000.000" → [{ etiqueta, valor }].
 * null si el texto no tiene esa forma (se muestra tal cual).
 */
export function partesDescripcion(
  texto: string | undefined
): { etiqueta: string; valor: string }[] | null {
  if (!texto) return null
  const partes = texto.split(' · ')
  if (partes.length < 2) return null
  const pares = partes.map(p => {
    const i = p.indexOf(': ')
    return i > 0 ? { etiqueta: p.slice(0, i), valor: p.slice(i + 2) } : null
  })
  return pares.every(Boolean)
    ? (pares as { etiqueta: string; valor: string }[])
    : null
}

/** Etiquetas que valen como resumen corto (en este orden) */
const PARTES_RESUMEN = ['Recibo', 'Valor', 'Monto', 'Vivienda asignada']

/**
 * Resumen de una línea para encabezados y listas: "RYR-2026-002 · $2.500.000"
 * cuando la descripción viene por partes; si no, el texto sin comillas.
 */
export function resumenCorto(descripcion: string | undefined): string {
  const partes = partesDescripcion(descripcion)
  if (partes) {
    const clave = partes.filter(p => PARTES_RESUMEN.includes(p.etiqueta))
    return (clave.length ? clave : partes.slice(0, 2))
      .map(p => p.valor)
      .join(' · ')
  }
  return (descripcion ?? '').replace(/^"(.*)"$/, '$1')
}

/** Nombre del módulo de origen del evento */
export const MODULO_EVENTO: Record<string, string> = {
  clientes: 'Cliente',
  intereses: 'Intereses',
  negociaciones: 'Negociación',
  abonos_historial: 'Abonos',
  documentos_cliente: 'Documentos',
  renuncias: 'Renuncias',
  notas: 'Nota manual',
}
