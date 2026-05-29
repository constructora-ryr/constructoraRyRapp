import { forbidden } from 'next/navigation'

import { getServerPermissions } from '@/lib/auth/server'

import { FuentesPagoHubContent } from './fuentes-pago-hub-content'

export const metadata = {
  title: 'Fuentes de Pago - Administración | Constructora RyR',
  description:
    'Hub central para gestión de fuentes de pago, requisitos y configuración',
}

export default async function FuentesPagoHubPage() {
  const permisos = await getServerPermissions('administracion')

  if (!permisos.isAdmin) {
    forbidden()
  }

  return <FuentesPagoHubContent />
}
