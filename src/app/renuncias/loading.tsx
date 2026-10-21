import { XCircle } from 'lucide-react'

import { PantallaCarga } from '@/shared/components/carga'

export default function Loading() {
  return (
    <PantallaCarga
      modulo='renuncias'
      icon={XCircle}
      label='Cargando renuncias'
    />
  )
}
