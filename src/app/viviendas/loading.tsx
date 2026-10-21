import { Home } from 'lucide-react'

import { PantallaCarga } from '@/shared/components/carga'

export default function Loading() {
  return (
    <PantallaCarga modulo='viviendas' icon={Home} label='Cargando viviendas' />
  )
}
