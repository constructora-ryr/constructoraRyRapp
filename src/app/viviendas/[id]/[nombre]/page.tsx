import { notFound } from 'next/navigation'

import { logger } from '@/lib/utils/logger'
import { resolverSlugViviendaServer } from '@/lib/utils/slug.server'

import ViviendaDetalleClient from '../vivienda-detalle-client-new'

interface PageProps {
  params: Promise<{ id: string; nombre: string }>
}

export default async function ViviendaDetalleConNombrePage({
  params,
}: PageProps) {
  try {
    const { id } = await params // nombre es decorativo, se ignora

    const viviendaId = await resolverSlugViviendaServer(id)

    if (!viviendaId) {
      notFound()
    }

    return <ViviendaDetalleClient viviendaId={viviendaId} />
  } catch (error) {
    logger.error('Error crítico en ViviendaDetalleConNombrePage:', error)
    throw error
  }
}
