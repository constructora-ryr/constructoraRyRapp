import { Settings } from 'lucide-react'

import { PantallaCarga } from '@/shared/components/carga'

export default function Loading() {
  return (
    <PantallaCarga
      modulo='app'
      icon={Settings}
      label='Cargando administración'
    />
  )
}
