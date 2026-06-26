import { forbidden, notFound } from 'next/navigation'

import { getServerPermissions } from '@/lib/auth/server'
import { resolverSlugViviendaServer } from '@/lib/utils/slug.server'
import { EditarViviendaAccordionView } from '@/modules/viviendas/components/EditarViviendaAccordionView'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditarViviendaPage({ params }: PageProps) {
  const { id } = await params
  const permisos = await getServerPermissions('viviendas')

  if (!permisos.canEdit && !permisos.isAdmin) {
    forbidden()
  }

  const viviendaUUID = await resolverSlugViviendaServer(id)

  if (!viviendaUUID) {
    notFound()
  }

  return (
    <EditarViviendaAccordionView
      viviendaId={viviendaUUID}
      canEdit={permisos.canEdit}
    />
  )
}
