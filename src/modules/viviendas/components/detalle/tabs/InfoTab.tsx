/**
 * Pestaña Información del detalle de vivienda, en filas balanceadas:
 * cliente (franja a todo el ancho, si hay negociación), valores junto a
 * datos legales (misma altura) y linderos a todo el ancho en 2×2.
 */

'use client'

import type { Vivienda } from '@/modules/viviendas/types'

import { TarjetaCliente } from '../info/TarjetaCliente'
import { TarjetaDatosLegales } from '../info/TarjetaDatosLegales'
import { TarjetaLinderos } from '../info/TarjetaLinderos'
import { TarjetaValores } from '../info/TarjetaValores'

export function InfoTab({
  vivienda,
  puedeVerAbonos,
}: {
  vivienda: Vivienda
  puedeVerAbonos: boolean
}) {
  return (
    <div className='grid gap-4 lg:grid-cols-2'>
      {vivienda.clientes ? (
        <TarjetaCliente
          cliente={vivienda.clientes}
          puedeVerAbonos={puedeVerAbonos}
          className='lg:col-span-2'
        />
      ) : null}
      <TarjetaValores vivienda={vivienda} />
      <TarjetaDatosLegales vivienda={vivienda} />
      <TarjetaLinderos vivienda={vivienda} className='lg:col-span-2' />
    </div>
  )
}
