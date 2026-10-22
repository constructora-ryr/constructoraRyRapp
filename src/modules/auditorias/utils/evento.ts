/**
 * Utilidades de presentación de un evento: frase, campos visibles y
 * agrupación por día.
 */

import { CAMPOS_OCULTOS } from '../config/presentacion'
import type { CambioCampo, EventoAuditoria } from '../types'

import { interpretar } from './interpretar'

export const nombreActor = (e: EventoAuditoria) =>
  e.usuario_nombre ||
  e.usuario_email ||
  (e.origen === 'sistema' ? 'El sistema' : 'Usuario desconocido')

/** "Nicolás reemplazó el archivo de el documento", "Nicolás editó el abono" */
export const frase = (e: EventoAuditoria) =>
  `${nombreActor(e)} ${interpretar(e).verbo}`.replace(' de el ', ' del ')

export function cambiosVisibles(e: EventoAuditoria): [string, CambioCampo][] {
  return Object.entries(e.cambios ?? {}).filter(
    ([campo]) => !CAMPOS_OCULTOS.has(campo)
  )
}

export function datosVisibles(e: EventoAuditoria): [string, unknown][] {
  return Object.entries(e.datos ?? {}).filter(
    ([campo, valor]) =>
      !CAMPOS_OCULTOS.has(campo) &&
      valor !== null &&
      valor !== '' &&
      typeof valor !== 'object'
  )
}

const claveDia = (iso: string) => {
  const d = new Date(iso)
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

export function etiquetaDia(iso: string): string {
  const hoy = new Date()
  const ayer = new Date()
  ayer.setDate(hoy.getDate() - 1)
  if (claveDia(iso) === claveDia(hoy.toISOString())) return 'Hoy'
  if (claveDia(iso) === claveDia(ayer.toISOString())) return 'Ayer'
  return new Date(iso).toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function agruparPorDia<T extends { fecha: string }>(
  eventos: T[]
): { dia: string; eventos: T[] }[] {
  const grupos = new Map<string, T[]>()
  for (const e of eventos) {
    const clave = claveDia(e.fecha)
    grupos.set(clave, [...(grupos.get(clave) ?? []), e])
  }
  return [...grupos.values()].map(lista => ({
    dia: etiquetaDia(lista[0].fecha),
    eventos: lista,
  }))
}

export const horaCorta = (iso: string) =>
  new Date(iso).toLocaleTimeString('es-CO', {
    hour: 'numeric',
    minute: '2-digit',
  })
