import { notFound } from 'next/navigation'

import { resolverSlugProyectoServer } from '@/lib/utils/slug.server'

import ProyectoDetalleClient from './proyecto-detalle-client'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ProyectoDetallePage({ params }: PageProps) {
  const { id } = await params

  const proyectoUUID = await resolverSlugProyectoServer(id)

  if (!proyectoUUID) {
    notFound()
  }

  return <ProyectoDetalleClient proyectoId={proyectoUUID} />
}
