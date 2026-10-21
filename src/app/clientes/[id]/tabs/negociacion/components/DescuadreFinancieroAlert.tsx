'use client'

import { AlertTriangle, SlidersHorizontal } from 'lucide-react'

import { formatCurrency } from '@/shared/utils/format'

import { AvisoNegociacion } from './AvisoNegociacion'

interface DescuadreFinancieroAlertProps {
  diferencia: number
  puedeAjustar: boolean
  onCorregir: () => void
}

export function DescuadreFinancieroAlert({
  diferencia,
  puedeAjustar,
  onCorregir,
}: DescuadreFinancieroAlertProps) {
  return (
    <AvisoNegociacion
      tono='rojo'
      icon={AlertTriangle}
      urgente
      titulo='Descuadre en el cierre financiero'
      texto={
        <>
          {diferencia > 0
            ? `Faltan ${formatCurrency(diferencia)} para cubrir el valor total.`
            : `Sobran ${formatCurrency(Math.abs(diferencia))} en las fuentes de pago.`}{' '}
          El registro de abonos queda bloqueado hasta corregirlo.
        </>
      }
      accion={
        puedeAjustar
          ? {
              label: 'Corregir ahora',
              icon: SlidersHorizontal,
              onClick: onCorregir,
            }
          : undefined
      }
    />
  )
}
