import { DollarSign } from 'lucide-react'

import { PantallaCarga } from '@/shared/components/carga'

export default function Loading() {
  return (
    <PantallaCarga modulo='abonos' icon={DollarSign} label='Cargando abonos' />
  )
}
