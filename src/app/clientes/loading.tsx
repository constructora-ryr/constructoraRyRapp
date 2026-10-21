import { Users } from 'lucide-react'

import { PantallaCarga } from '@/shared/components/carga'

export default function Loading() {
  return (
    <PantallaCarga modulo='clientes' icon={Users} label='Cargando clientes' />
  )
}
