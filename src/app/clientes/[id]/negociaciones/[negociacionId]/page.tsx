import { notFound } from 'next/navigation'

import {
  resolverSlugClienteServer,
  resolverSlugNegociacionServer,
} from '@/lib/utils/slug.server'

import NegociacionDetalleClient from './negociacion-detalle-client'

interface PageProps {
  params: Promise<{
    id: string
    negociacionId: string
  }>
}

export default async function NegociacionDetallePage({ params }: PageProps) {
  const { id, negociacionId } = await params

  const [clienteUUID, negociacionUUID] = await Promise.all([
    resolverSlugClienteServer(id),
    resolverSlugNegociacionServer(negociacionId),
  ])

  if (!clienteUUID || !negociacionUUID) {
    notFound()
  }

  return (
    <NegociacionDetalleClient
      clienteId={clienteUUID}
      negociacionId={negociacionUUID}
    />
  )
}
