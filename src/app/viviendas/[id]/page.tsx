import { notFound } from 'next/navigation'

import { logger } from '@/lib/utils/logger'
import { resolverSlugViviendaServer } from '@/lib/utils/slug.server'

import ViviendaDetalleClient from './vivienda-detalle-client-new'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ViviendaDetallePage({ params }: PageProps) {
  try {
    const { id } = await params

    const viviendaId = await resolverSlugViviendaServer(id)

    if (!viviendaId) {
      notFound()
    }

    return <ViviendaDetalleClient viviendaId={viviendaId} />
  } catch (error) {
    logger.error('Error crítico en ViviendaDetallePage:', error)
    throw error
  }
}
