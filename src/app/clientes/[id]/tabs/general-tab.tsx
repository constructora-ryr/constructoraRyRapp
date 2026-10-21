'use client'

/**
 * Pestaña Información General — solo orquesta sus tarjetas:
 * - BannerDocumentacion: aviso si falta la cédula
 * - ResumenNegociacion: valor, abonado, saldo, avance y fuentes de pago
 * - InfoPersonalCard / ContactoUbicacionCard
 * - NotasCard (si hay notas)
 */

import { Clock } from 'lucide-react'

import { formatDateCompact } from '@/lib/utils/date.utils'
import { useDocumentoIdentidad } from '@/modules/clientes/documentos/hooks/useDocumentoIdentidad'
import type { Cliente, Negociacion } from '@/modules/clientes/types'
import { usePermisosQuery } from '@/modules/usuarios/hooks/usePermisosQuery'

import {
  BannerDocumentacion,
  ContactoUbicacionCard,
  InfoPersonalCard,
  NotasCard,
  ResumenNegociacion,
} from './general/components'

interface GeneralTabProps {
  cliente: Cliente
  /** Negociación vigente (activa o completada), calculada por el orquestador */
  negociacion: Negociacion | null
  /** Solo mostrar el banner de documentación si el usuario puede ver Y subir documentos */
  canMostrarBannerDocumentos?: boolean
  onIrADocumentos: () => void
}

export function GeneralTab({
  cliente,
  negociacion,
  canMostrarBannerDocumentos = false,
  onIrADocumentos,
}: GeneralTabProps) {
  const { tieneCedula, cargando: cargandoValidacion } = useDocumentoIdentidad({
    clienteId: cliente.id,
  })
  const { esAdmin, puede } = usePermisosQuery()
  const canVerAbonos = esAdmin || puede('abonos', 'ver')

  const tieneNegociacion =
    (cliente.estadisticas?.negociaciones_activas ?? 0) > 0 ||
    (cliente.estadisticas?.negociaciones_completadas ?? 0) > 0 ||
    (cliente.negociaciones?.length ?? 0) > 0

  const mostrarResumen =
    !!negociacion &&
    (negociacion.valor_total_pagar > 0 || negociacion.valor_total > 0)

  return (
    <div className='space-y-4'>
      {canMostrarBannerDocumentos && cliente.estado !== 'Renunció' && (
        <BannerDocumentacion
          tieneDocumento={tieneCedula}
          cargandoValidacion={cargandoValidacion}
          tieneNegociacionActiva={tieneNegociacion}
          onIrADocumentos={onIrADocumentos}
        />
      )}

      {mostrarResumen && (
        <ResumenNegociacion
          negociacion={negociacion}
          clienteId={cliente.id}
          canVerAbonos={canVerAbonos}
        />
      )}

      <div className='grid gap-4 md:grid-cols-2'>
        <InfoPersonalCard cliente={cliente} />
        <ContactoUbicacionCard cliente={cliente} />
      </div>

      <NotasCard cliente={cliente} />

      <p className='flex items-center gap-1.5 px-1 text-xs text-slate-400 dark:text-slate-500'>
        <Clock className='h-3 w-3 shrink-0' />
        Cliente registrado el {formatDateCompact(cliente.fecha_creacion)}
      </p>
    </div>
  )
}
