import { UserPlus } from 'lucide-react'

import { PantallaCarga } from '@/shared/components/carga'

export default function Loading() {
  return (
    <PantallaCarga
      modulo='clientes'
      icon={UserPlus}
      label='Cargando formulario'
    />
  )
}
