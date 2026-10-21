import { Building2 } from 'lucide-react'

import { PantallaCarga } from '@/shared/components/carga'

export default function Loading() {
  return (
    <PantallaCarga
      modulo='proyectos'
      icon={Building2}
      label='Cargando proyectos'
    />
  )
}
