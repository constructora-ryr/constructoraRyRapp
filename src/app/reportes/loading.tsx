import { BarChart3 } from 'lucide-react'

import { PantallaCarga } from '@/shared/components/carga'

export default function Loading() {
  return (
    <PantallaCarga modulo='app' icon={BarChart3} label='Cargando reportes' />
  )
}
