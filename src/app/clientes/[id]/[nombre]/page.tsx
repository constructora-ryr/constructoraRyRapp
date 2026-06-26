import { notFound } from 'next/navigation'

import { resolverSlugClienteServer } from '@/lib/utils/slug.server'

import ClienteDetalleClient from '../cliente-detalle-client'

interface PageProps {
  params: Promise<{ id: string; nombre: string }>
}

export default async function ClienteDetalleConNombrePage({
  params,
}: PageProps) {
  const { id } = await params // nombre es decorativo, se ignora

  const clienteUUID = await resolverSlugClienteServer(id)

  if (!clienteUUID) {
    notFound()
  }

  return <ClienteDetalleClient clienteId={clienteUUID} />
}
