import { User } from 'lucide-react'

import { PantallaCarga } from '@/shared/components/carga'

export default function Loading() {
  return (
    <PantallaCarga
      modulo='clientes'
      icon={User}
      label='Cargando datos del cliente'
    />
  )
}
