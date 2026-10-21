'use client'

import { ArrowDownToLine, CheckCircle2, ExternalLink } from 'lucide-react'

import { formatDateForDisplay } from '@/lib/utils/date.utils'
import { formatCurrency } from '@/shared/utils/format'

import { AvisoNegociacion } from './AvisoNegociacion'

interface ExcedenteDevolucionBannersProps {
  diferencia: number
  estado: 'pendiente' | 'procesada' | null | undefined
  monto: number | null | undefined
  fecha: string | null | undefined
  comprobanteUrl: string | null | undefined
  puedeAjustar: boolean
  onRegistrar: () => void
}

export function ExcedenteDevolucionBanners({
  diferencia,
  estado,
  monto,
  fecha,
  comprobanteUrl,
  puedeAjustar,
  onRegistrar,
}: ExcedenteDevolucionBannersProps) {
  if (diferencia >= 0) return null

  const montoExcedente = Math.abs(diferencia)

  if (estado === 'procesada') {
    return (
      <AvisoNegociacion
        tono='verde'
        icon={CheckCircle2}
        titulo={`Devolución registrada — ${formatCurrency(monto ?? montoExcedente)}`}
        texto={`El excedente fue devuelto al cliente.${fecha ? ` Fecha: ${formatDateForDisplay(fecha)}.` : ''}`}
        accion={
          comprobanteUrl
            ? {
                label: 'Ver comprobante',
                icon: ExternalLink,
                href: `/api/negociaciones/comprobante-devolucion?path=${encodeURIComponent(comprobanteUrl)}`,
              }
            : undefined
        }
      />
    )
  }

  return (
    <AvisoNegociacion
      tono='ambar'
      icon={ArrowDownToLine}
      titulo={`Devolución pendiente al cliente — ${formatCurrency(montoExcedente)}`}
      texto={`Las fuentes de pago suman ${formatCurrency(montoExcedente)} más que el valor de la negociación. Cuando se completen los desembolsos, ese excedente se le devuelve al cliente.`}
      accion={
        puedeAjustar
          ? { label: 'Registrar devolución', onClick: onRegistrar }
          : undefined
      }
    />
  )
}
