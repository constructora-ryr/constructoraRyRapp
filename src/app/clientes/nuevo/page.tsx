/**
 * Página: Crear Nuevo Cliente (Accordion Wizard)
 * Server Component — obtiene permisos y delega a Client Component
 */

import { getServerPermissions } from '@/lib/auth/server'
import { NuevoClienteAccordionView } from '@/modules/clientes/components/NuevoClienteAccordionView'

export const metadata = {
  title: 'Nuevo Cliente | Constructora RyR',
  description: 'Registra un nuevo cliente en el sistema',
}

export default async function NuevoClientePage() {
  const permisos = await getServerPermissions('clientes')

  return <NuevoClienteAccordionView canCreate={permisos.canCreate} />
}
