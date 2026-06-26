import { notFound } from 'next/navigation'

import { resolverSlugProyectoServer } from '@/lib/utils/slug.server'

import ProyectoDetalleClient from '../proyecto-detalle-client'

interface PageProps {
  params: Promise<{ id: string; nombre: string }>
}

export default async function ProyectoDetalleConNombrePage({
  params,
}: PageProps) {
  const { id } = await params // nombre es decorativo, se ignora

  const proyectoUUID = await resolverSlugProyectoServer(id)

  if (!proyectoUUID) {
    notFound()
  }

  return <ProyectoDetalleClient proyectoId={proyectoUUID} />
}
