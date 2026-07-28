import { forbidden, notFound } from 'next/navigation'

import { getServerPermissions } from '@/lib/auth/server'
import { esUUID } from '@/lib/utils/slug.utils'
import { EditarUsuarioView } from '@/modules/usuarios/components/EditarUsuarioView'

interface EditarUsuarioPageProps {
  params: Promise<{ id: string }>
}

export default async function EditarUsuarioPage({
  params,
}: EditarUsuarioPageProps) {
  const { id } = await params

  if (!esUUID(id)) {
    notFound()
  }

  const { canEdit, isAdmin } = await getServerPermissions('usuarios')

  if (!canEdit && !isAdmin) {
    forbidden()
  }

  return <EditarUsuarioView id={id} />
}
