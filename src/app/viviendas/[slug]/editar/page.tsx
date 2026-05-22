import { forbidden, notFound } from 'next/navigation'

import { getServerPermissions } from '@/lib/auth/server'
import { resolverSlugViviendaServer } from '@/lib/utils/slug.server'
import { EditarViviendaAccordionView } from '@/modules/viviendas/components/EditarViviendaAccordionView'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function EditarViviendaPage({ params }: PageProps) {
  const { slug } = await params
  const permisos = await getServerPermissions('viviendas')

  if (!permisos.canEdit && !permisos.isAdmin) {
    forbidden()
  }

  const viviendaUUID = await resolverSlugViviendaServer(slug)

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
