/**
 * Ruta: /clientes/[id]/traslado-vivienda
 *
 * Formulario acordeón para trasladar a un cliente de su vivienda
 * actual a una nueva vivienda disponible.
 */

import type { Metadata } from 'next'

import { forbidden } from 'next/navigation'

import { getServerPermissions } from '@/lib/auth/server'
import { resolverSlugCliente } from '@/lib/utils/slug.utils'
import { TrasladoViviendaPage } from '@/modules/clientes/pages/traslado-vivienda'

export const metadata: Metadata = {
  title: 'Traslado de Vivienda | Constructora RyR',
  description:
    'Traslado de vivienda de cliente con formulario acordeón progresivo',
}

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ nombre?: string; negociacion_id?: string }>
}

export default async function Page({ params, searchParams }: PageProps) {
  const { canEdit, isAdmin } = await getServerPermissions('negociaciones')

  if (!canEdit && !isAdmin) {
    forbidden()
  }

  const { id } = await params
  const search = await searchParams

  const clienteUUID = (await resolverSlugCliente(id)) || id
  const negociacionId = search.negociacion_id ?? ''

  return (
    <TrasladoViviendaPage
      clienteId={clienteUUID}
      clienteSlug={id}
      clienteNombre={search.nombre}
      negociacionId={negociacionId}
    />
  )
}
