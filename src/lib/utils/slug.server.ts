/**
 * 🔗 SLUG RESOLVERS — SERVER ONLY
 *
 * Versiones server-side de los resolvers de slug.
 * Usan createServerSupabaseClient para respetar RLS con cookies de sesión.
 *
 * Acepta: UUID completo | shortId bare (8 hex) | slug antiguo (nombre-shortId).
 * Resolución: range query gte/lte sobre UUID PK → O(log n), sin full table scan.
 *
 * ⚠️ Solo usar desde Server Components / Route Handlers.
 */

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { logger } from '@/lib/utils/logger'

import { construirRangoUUID, esUUID, extraerShortIDDeSlug } from './slug.utils'

type SlugTabla = 'clientes' | 'proyectos' | 'viviendas' | 'negociaciones'

async function resolverSlugAUUIDServer(
  slugOUUID: string,
  tabla: SlugTabla
): Promise<string | null> {
  if (esUUID(slugOUUID)) return slugOUUID

  try {
    const shortId = extraerShortIDDeSlug(slugOUUID)
    const { lowerBound, upperBound } = construirRangoUUID(shortId)

    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from(tabla)
      .select('id')
      .gte('id', lowerBound)
      .lte('id', upperBound)
      .limit(1)
      .maybeSingle()

    if (error) {
      logger.error(`❌ Error al resolver slug en ${tabla}:`, error)
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
    logger.error('❌ Error al resolver slug (server):', error)
    return null
  }
}

export async function resolverSlugClienteServer(
  slugOUUID: string
): Promise<string | null> {
  return resolverSlugAUUIDServer(slugOUUID, 'clientes')
}

export async function resolverSlugProyectoServer(
  slugOUUID: string
): Promise<string | null> {
  return resolverSlugAUUIDServer(slugOUUID, 'proyectos')
}

export async function resolverSlugViviendaServer(
  slugOUUID: string
): Promise<string | null> {
  return resolverSlugAUUIDServer(slugOUUID, 'viviendas')
}
