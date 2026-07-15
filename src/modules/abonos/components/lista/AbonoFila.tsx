'use client'

import {
  Ban,
  Banknote,
  Building2,
  CreditCard,
  Landmark,
  Pencil,
} from 'lucide-react'

import { formatDateCompact } from '@/lib/utils/date.utils'
import { formatCurrency } from '@/lib/utils/format.utils'
import type { AbonoConInfo } from '@/modules/abonos/hooks/useAbonosQuery'
import type { MetodoPago } from '@/modules/abonos/types'
import type { AbonoParaEditar } from '@/modules/abonos/types/editar-abono.types'
import { formatearNumeroRecibo } from '@/modules/abonos/utils/formato-recibo'

import { abonosListaStyles as s } from './abonos-lista.styles'

// ─── Icono según método de pago ──────────────────────────────────────────────
function MetodoIcon({ metodo }: { metodo: string | null }) {
  const lower = (metodo ?? '').toLowerCase()
  if (lower.includes('transferencia') || lower.includes('transfer')) {
    return <Landmark className='h-3.5 w-3.5' />
  }
  if (lower.includes('efectivo') || lower.includes('cash')) {
    return <Banknote className='h-3.5 w-3.5' />
  }
  if (lower.includes('consignaci')) {
    return <Building2 className='h-3.5 w-3.5' />
  }
  return <CreditCard className='h-3.5 w-3.5' />
}

// ─── Props ───────────────────────────────────────────────────────────────────
interface AbonoFilaProps {
  abono: AbonoConInfo
  canEdit: boolean
  canAnular: boolean
  onAbonoClick: (abono: AbonoConInfo) => void
  onEditar: (abono: AbonoParaEditar) => void
  onAnular: (abono: AbonoConInfo) => void
}

export function AbonoFila({
  abono,
  canEdit,
  canAnular,
  onAbonoClick,
  onEditar,
  onAnular,
}: AbonoFilaProps) {
  const esAnulado = abono.estado === 'Anulado'
  const esRenuncia = abono.negociacion.estado === 'Cerrada por Renuncia'

  const filaClass = `${s.fila.base} ${
    esAnulado ? s.fila.anulado : esRenuncia ? s.fila.renuncia : s.fila.activo
  }`

  return (
    <tr
      key={abono.id}
      onClick={() => onAbonoClick(abono)}
      className={filaClass}
    >
      {/* Recibo + Fecha ─────────────────────────────────── */}
      <td className='px-4 py-3'>
        <span className={s.fila.reciboBadge}>
          {formatearNumeroRecibo(abono.numero_recibo)}
        </span>
        <p className={s.fila.fecha}>{formatDateCompact(abono.fecha_abono)}</p>
      </td>

      {/* Cliente ─────────────────────────────────────────── */}
      <td className='px-4 py-3'>
        <p
          className={
            esAnulado ? s.fila.clienteNombreAnulado : s.fila.clienteNombre
          }
        >
          {abono.cliente.nombres} {abono.cliente.apellidos}
        </p>
        <p className={s.fila.clienteCC}>CC {abono.cliente.numero_documento}</p>
      </td>

      {/* Vivienda · Proyecto · Fuente ────────────────────── */}
      <td className='px-4 py-3'>
        <p
          className={
            esAnulado ? s.fila.viviendaNombreAnulado : s.fila.viviendaNombre
          }
        >
          {abono.vivienda.manzana.identificador
            ? `Mz.${abono.vivienda.manzana.identificador} Casa No. ${abono.vivienda.numero}`
            : `N°${abono.vivienda.numero}`}
        </p>
        <p className='mt-0.5 text-[11px] text-gray-400 dark:text-gray-500'>
          {abono.proyecto.nombre}
        </p>
      </td>

      {/* Método + Fuente ─────────────────────────────────── */}
      <td className={s.fila.metodoCell}>
        <span className={s.fila.metodoBadge}>
          <MetodoIcon metodo={abono.metodo_pago} />
          {abono.metodo_pago ?? '—'}
        </span>
        <div className='mt-1.5 flex flex-wrap items-center gap-1'>
          <span className={s.fila.fuentePill}>{abono.fuente_pago.tipo}</span>
          {abono.fuente_pago.entidad && (
            <span className='text-[10px] font-medium text-gray-500 dark:text-gray-400'>
              · {abono.fuente_pago.entidad}
            </span>
          )}
        </div>
      </td>

      {/* Monto ──────────────────────────────────────────── */}
      <td className='px-4 py-3 text-right'>
        {esAnulado ? (
          <>
            <span className={s.fila.montoAnuladoLabel}>Anulado</span>
            <span className={s.fila.montoAnulado}>
              {formatCurrency(abono.monto)}
            </span>
          </>
        ) : esRenuncia ? (
          <>
            <span className={s.fila.montoRenunciaLabel}>Renunciada</span>
            <span className={s.fila.montoRenuncia}>
              {formatCurrency(abono.monto)}
            </span>
          </>
        ) : (
          <span className={s.fila.montoActivo}>
            {formatCurrency(abono.monto)}
          </span>
        )}
      </td>

      {/* Acciones ─────────────────────────────────────── */}
      {canEdit || canAnular ? (
        <td className='px-4 py-3'>
          <div className='flex items-center justify-end gap-1'>
            {canEdit && abono.estado !== 'Anulado' ? (
              <button
                onClick={e => {
                  e.stopPropagation()
                  onEditar({
                    id: abono.id,
                    negociacion_id: abono.negociacion_id,
                    fuente_pago_id: abono.fuente_pago_id,
                    fuente_tipo: abono.fuente_pago.tipo,
                    monto: abono.monto,
                    fecha_abono: abono.fecha_abono,
                    metodo_pago: (abono.metodo_pago ??
                      null) as MetodoPago | null,
                    numero_referencia: abono.numero_referencia ?? null,
                    notas: abono.notas ?? null,
                    comprobante_url: abono.comprobante_url ?? null,
                  })
                }}
                className={`${s.fila.actionBtn} ${s.fila.editBtn}`}
                title='Editar abono'
              >
                <Pencil className='h-3.5 w-3.5' />
              </button>
            ) : null}
            {canAnular &&
            abono.estado !== 'Anulado' &&
            abono.negociacion.estado === 'Activa' ? (
              <button
                onClick={e => {
                  e.stopPropagation()
                  onAnular(abono)
                }}
                className={`${s.fila.actionBtn} ${s.fila.anularBtn}`}
                title='Anular abono'
              >
                <Ban className='h-3.5 w-3.5' />
              </button>
            ) : null}
          </div>
        </td>
      ) : null}
    </tr>
  )
}
