/**
 * ============================================
 * PÁGINA: Administración de Fuentes de Pago
 * ============================================
 *
 * Server Component para administrar tipos de fuentes de pago.
 * Solo accesible para usuarios con permisos de admin.
 */

import { forbidden } from 'next/navigation'

import { getServerPermissions } from '@/lib/auth/server'

import { FuentesPagoAdminContent } from './fuentes-pago-admin-content'

export const metadata = {
  title: 'Administración de Fuentes de Pago | Constructora RyR',
  description:
    'Gestiona los tipos de fuentes de pago disponibles en el sistema',
}

export default async function FuentesPagoAdminPage() {
  const permisos = await getServerPermissions('administracion')

  if (!permisos.isAdmin) {
    forbidden()
  }

  return <FuentesPagoAdminContent />
}
