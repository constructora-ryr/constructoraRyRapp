import { Users } from 'lucide-react'

import { PantallaCarga } from '@/shared/components/carga'

export default function Loading() {
  return (
    <PantallaCarga modulo='usuarios' icon={Users} label='Cargando usuarios' />
  )
}
