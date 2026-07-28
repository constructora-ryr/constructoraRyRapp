import { notFound } from 'next/navigation'

import { getServerPermissions } from '@/lib/auth/server'
import { resolverSlugClienteServer } from '@/lib/utils/slug.server'
import { EditarClienteAccordionView } from '@/modules/clientes/components/EditarClienteAccordionView'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditarClientePage({ params }: PageProps) {
  const { id } = await params

  const clienteUUID = await resolverSlugClienteServer(id)

  if (!clienteUUID) {
    notFound()
  }

  const permisos = await getServerPermissions('clientes')

  return (
    <EditarClienteAccordionView
      clienteId={clienteUUID}
      canEdit={permisos.canEdit}
    />
  )
}
