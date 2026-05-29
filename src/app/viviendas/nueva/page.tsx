/**
 * Vista dedicada: Nueva Vivienda (Accordion Wizard)
 * Ruta: /viviendas/nueva
 * Formulario de 5 pasos con diseño accordion
 */

import { forbidden } from 'next/navigation'

import { getServerPermissions } from '@/lib/auth/server'
import { NuevaViviendaAccordionView } from '@/modules/viviendas/components/NuevaViviendaAccordionView'

export const metadata = {
  title: 'Nueva Vivienda | Constructora RyR',
  description: 'Registra una nueva vivienda en el sistema',
}

export default async function NuevaViviendaPage() {
  const { canCreate, isAdmin } = await getServerPermissions('viviendas')

  if (!canCreate && !isAdmin) {
    forbidden()
  }

  return <NuevaViviendaAccordionView />
}
