/**
 * 🔗 UTILIDADES: GENERACIÓN Y RESOLUCIÓN DE SLUGS
 *
 * Formato de URL: /entidad/{shortId}/{nombre-decorativo}
 *   - shortId   = primeros 8 chars del UUID (primer segmento)
 *   - nombre    = slug del nombre, decorativo — ignorado por el router
 *
 * Ejemplos:
 *   UUID:  3af5d98c-2747-441e-8114-224d37a7c050
 *   URL:   /clientes/3af5d98c/maria-garcia-lopez
 *          /viviendas/5e4f9b2d/las-americas-manzana-a-101
 *          /proyectos/7f2a1b3c/las-americas-2
 *
 * Resolución: range query gte/lte sobre UUID PK → O(log n), sin full table scan.
 * El resolver acepta: UUID completo | shortId bare (8 hex) | slug antiguo (nombre-shortId).
 */

import { createClient } from '@/lib/supabase/client'
import { logger } from '@/lib/utils/logger'

// ===================================
// GENERACIÓN DE SLUGS
// ===================================

function normalizarTexto(texto: string): string {
  if (!texto) return ''
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim()
}

/**
 * Extrae los primeros 8 chars del UUID (primer segmento).
 * Exportado para uso en links hardcodeados que solo tienen el UUID.
 */
export function getShortId(uuid: string): string {
  if (!uuid) return 'no-id'
  return uuid.split('-')[0]
}

export function generarSlugCliente(cliente: {
  nombres: string
  apellidos: string
  id: string
}): string {
  return normalizarTexto(`${cliente.nombres} ${cliente.apellidos}`)
}

export function generarSlugProyecto(proyecto: {
  nombre: string
  id: string
}): string {
  return normalizarTexto(proyecto.nombre)
}

export function generarSlugVivienda(
  vivienda: { numero: string; id: string },
  manzana?: string,
  proyecto?: string
): string {
  const partes: string[] = []
  if (proyecto) {
    const p = normalizarTexto(proyecto)
    if (p) partes.push(p)
  }
  if (manzana) {
    const m = normalizarTexto(manzana)
    if (m) partes.push(m)
  }
  const n = normalizarTexto(vivienda.numero)
  if (n) partes.push(n)
  return partes.join('-')
}

// ===================================
// RESOLUCIÓN DE SLUGS
// ===================================

export function esUUID(valor: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    valor
  )
}

/**
 * Construye límites de rango UUID para una range query eficiente sobre el PK index.
 * Acepta shortId de 8 chars (nuevo formato) o 12 chars (formato anterior).
 */
export function construirRangoUUID(shortId: string): {
  lowerBound: string
  upperBound: string
} {
  if (shortId.length === 12) {
    const seg1 = shortId.substring(0, 8)
    const seg2 = shortId.substring(8, 12)
    return {
      lowerBound: `${seg1}-${seg2}-0000-0000-000000000000`,
      upperBound: `${seg1}-${seg2}-ffff-ffff-ffffffffffff`,
    }
  }
  return {
    lowerBound: `${shortId}-0000-0000-0000-000000000000`,
    upperBound: `${shortId}-ffff-ffff-ffff-ffffffffffff`,
  }
}

/**
 * Extrae el shortId de un slug antiguo (formato "nombre-apellido-3af5d98c").
 * Solo para compatibilidad con URLs antiguas que puedan haber quedado en historial.
 */
export function extraerShortIDDeSlug(slug: string): string {
  // Bare shortId de 8 o 12 chars (nuevo formato o intermedio)
  if (/^[0-9a-f]{8}$/i.test(slug)) return slug
  if (/^[0-9a-f]{12}$/i.test(slug)) return slug

  // Formato antiguo: nombre-apellido-shortId
  const ultimaParte = slug.split('-').pop() ?? ''
  if (/^[0-9a-f]{12}$/i.test(ultimaParte)) return ultimaParte
  if (/^[0-9a-f]{8}$/i.test(ultimaParte)) return ultimaParte

  throw new Error(`Slug inválido: ${slug}`)
}

/**
 * Resuelve un slug o UUID a un UUID completo (client-side).
 * Acepta: UUID completo | shortId bare (8 hex) | slug antiguo.
 */
export async function resolverSlugAUUID(
  slugOUUID: string,
  tabla: 'clientes' | 'proyectos' | 'viviendas' | 'negociaciones'
): Promise<string | null> {
  if (esUUID(slugOUUID)) return slugOUUID

  try {
    const shortId = extraerShortIDDeSlug(slugOUUID)
    const { lowerBound, upperBound } = construirRangoUUID(shortId)

    const supabase = createClient()
    const { data, error } = await supabase
      .from(tabla)
      .select('id')
      .gte('id', lowerBound)
      .lte('id', upperBound)
      .limit(1)
      .maybeSingle()

    if (error) {
      logger.error(`❌ Error al buscar en ${tabla}:`, error)
      return null
    }

    if (!data) {
      logger.error(
        `❌ No se encontró registro con short ID: ${shortId} en ${tabla}`
      )
      return null
    }

    return data.id
  } catch (error) {
    logger.error('❌ Error al resolver slug:', error)
    return null
  }
}

export async function resolverSlugCliente(
  slugOUUID: string
): Promise<string | null> {
  return resolverSlugAUUID(slugOUUID, 'clientes')
}

export async function resolverSlugProyecto(
  slugOUUID: string
): Promise<string | null> {
  return resolverSlugAUUID(slugOUUID, 'proyectos')
}

export async function resolverSlugVivienda(
  slugOUUID: string
): Promise<string | null> {
  return resolverSlugAUUID(slugOUUID, 'viviendas')
}

// ===================================
// CONSTRUCCIÓN DE URLs
// ===================================

/**
 * /clientes/{shortId}/{nombre-decorativo}
 */
export function construirURLCliente(cliente: {
  id: string
  nombres?: string
  apellidos?: string
  nombre_completo?: string
}): string {
  const shortId = getShortId(cliente.id)

  let nombre: string
  if (cliente.nombres && cliente.apellidos) {
    nombre = generarSlugCliente({
      nombres: cliente.nombres,
      apellidos: cliente.apellidos,
      id: cliente.id,
    })
  } else if (cliente.nombre_completo) {
    nombre = normalizarTexto(cliente.nombre_completo)
  } else {
    return `/clientes/${shortId}`
  }

  return `/clientes/${shortId}/${nombre}`
}

/**
 * /proyectos/{shortId}/{nombre-decorativo}
 */
export function construirURLProyecto(proyecto: {
  nombre: string
  id: string
}): string {
  const shortId = getShortId(proyecto.id)
  const nombre = generarSlugProyecto(proyecto)
  return `/proyectos/${shortId}/${nombre}`
}

/**
 * /viviendas/{shortId}/{descripcion-decorativa}
 */
export function construirURLVivienda(
  vivienda: { numero: string; id: string },
  manzana?: string,
  proyecto?: string
): string {
  const shortId = getShortId(vivienda.id)
  const nombre = generarSlugVivienda(vivienda, manzana, proyecto)
  return nombre ? `/viviendas/${shortId}/${nombre}` : `/viviendas/${shortId}`
}
