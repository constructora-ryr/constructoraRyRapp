'use client'

import {
  Ban,
  Building2,
  Calendar,
  CreditCard,
  ExternalLink,
  FileText,
  Home,
  Receipt,
  StickyNote,
  User,
  UserCheck,
} from 'lucide-react'

import Link from 'next/link'

import { formatDateForDisplay } from '@/lib/utils/date.utils'
import { formatCurrency } from '@/lib/utils/format.utils'
import { getShortId } from '@/lib/utils/slug.utils'
import { formatNombreCompleto } from '@/lib/utils/string.utils'

import { formatearNumeroRecibo } from '../../utils/formato-recibo'

import { abonoDetalleStyles as s } from './AbonoDetalleModal.styles'
import { type AbonoParaDetalle } from './useAbonoDetalle'

interface AbonoDetalleSidebarPanelProps {
  abono: AbonoParaDetalle
  estaAnulado: boolean
  viviendaLabel: string
  canVerCliente?: boolean
}

export function AbonoDetalleSidebarPanel({
  abono,
  estaAnulado,
  viviendaLabel,
  canVerCliente = false,
}: AbonoDetalleSidebarPanelProps) {
  const clienteUrl = `/clientes/${getShortId(abono.cliente.id)}`
  return (
    <div className={s.sidebar.container}>
      {/* Pago */}
      <div className={s.sidebar.section}>
        <p className={s.sidebar.sectionTitle}>
          <CreditCard className='h-3 w-3' />
          Pago
        </p>
        <div className='rounded-xl bg-emerald-50 p-3 text-center dark:bg-emerald-900/20'>
          <p className={s.sidebar.monto}>{formatCurrency(abono.monto)}</p>
          <span className={`mt-1 ${s.sidebar.badge}`}>
            <Receipt className='h-3 w-3' />
            {formatearNumeroRecibo(abono.numero_recibo)}
          </span>
        </div>

        <div className={s.sidebar.row}>
          <Calendar
            className={`${s.sidebar.rowIcon} h-4 w-4 text-emerald-500`}
          />
          <div>
            <p className={s.sidebar.rowLabel}>Fecha</p>
            <p className={s.sidebar.rowValue}>
              {formatDateForDisplay(abono.fecha_abono)}
            </p>
          </div>
        </div>

        <div className={s.sidebar.row}>
          <CreditCard
            className={`${s.sidebar.rowIcon} h-4 w-4 text-emerald-500`}
          />
          <div>
            <p className={s.sidebar.rowLabel}>Método de pago</p>
            <p className={s.sidebar.rowValue}>{abono.metodo_pago}</p>
          </div>
        </div>

        {abono.numero_referencia ? (
          <div className={s.sidebar.row}>
            <FileText
              className={`${s.sidebar.rowIcon} h-4 w-4 text-emerald-500`}
            />
            <div>
              <p className={s.sidebar.rowLabel}>
                {abono.metodo_pago === 'Cheque'
                  ? 'Número de cheque'
                  : 'Número de transferencia'}
              </p>
              <p className={`${s.sidebar.rowValue} font-mono`}>
                {abono.numero_referencia}
              </p>
            </div>
          </div>
        ) : null}

        <div className={s.sidebar.row}>
          <Building2
            className={`${s.sidebar.rowIcon} h-4 w-4 text-emerald-500`}
          />
          <div>
            <p className={s.sidebar.rowLabel}>Fuente de pago</p>
            <span className={s.sidebar.fuentePill}>
              {abono.fuente_pago?.tipo}
            </span>
          </div>
        </div>
      </div>

      <div className={s.sidebar.divider} />

      {/* Cliente */}
      <div className={s.sidebar.section}>
        <p className={s.sidebar.sectionTitle}>
          <User className='h-3 w-3' />
          Cliente
        </p>
        <div className={s.sidebar.row}>
          <User className={`${s.sidebar.rowIcon} h-4 w-4 text-blue-500`} />
          <div className='min-w-0 flex-1'>
            <p className={s.sidebar.rowLabel}>Nombre</p>
            {canVerCliente ? (
              <Link
                href={clienteUrl}
                className='group inline-flex items-center gap-1.5 transition-colors'
              >
                <span className='text-sm font-semibold text-gray-900 group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400'>
                  {formatNombreCompleto(
                    `${abono.cliente.nombres} ${abono.cliente.apellidos}`
                  )}
                </span>
                <ExternalLink className='h-3 w-3 text-gray-400 group-hover:text-blue-500' />
              </Link>
            ) : (
              <p className={s.sidebar.rowValue}>
                {formatNombreCompleto(
                  `${abono.cliente.nombres} ${abono.cliente.apellidos}`
                )}
              </p>
            )}
            <p className={s.sidebar.rowValueSub}>
              CC {abono.cliente.numero_documento}
            </p>
          </div>
        </div>
      </div>

      <div className={s.sidebar.divider} />

      {/* Propiedad */}
      <div className={s.sidebar.section}>
        <p className={s.sidebar.sectionTitle}>
          <Home className='h-3 w-3' />
          Propiedad
        </p>
        <div className={s.sidebar.row}>
          <Home className={`${s.sidebar.rowIcon} h-4 w-4 text-orange-500`} />
          <div>
            <p className={s.sidebar.rowLabel}>Vivienda</p>
            <p className={s.sidebar.rowValue}>{viviendaLabel}</p>
            <p className={s.sidebar.rowValueSub}>{abono.proyecto.nombre}</p>
          </div>
        </div>
      </div>

      {/* Registrado por */}
      {abono.registrado_por_nombre ? (
        <>
          <div className={s.sidebar.divider} />
          <div className={s.sidebar.section}>
            <p className={s.sidebar.sectionTitle}>
              <UserCheck className='h-3 w-3' />
              Trazabilidad
            </p>
            <div className={s.sidebar.row}>
              <UserCheck
                className={`${s.sidebar.rowIcon} h-4 w-4 text-slate-400`}
              />
              <div>
                <p className={s.sidebar.rowLabel}>Pago registrado por</p>
                <p className={s.sidebar.rowValue}>
                  {abono.registrado_por_nombre}
                </p>
                <p className={s.sidebar.rowValueSub}>
                  {formatDateForDisplay(abono.fecha_creacion)}
                </p>
              </div>
            </div>
          </div>
        </>
      ) : null}

      {/* Notas */}
      {abono.notas ? (
        <>
          <div className={s.sidebar.divider} />
          <div className={s.sidebar.section}>
            <p className={s.sidebar.sectionTitle}>
              <StickyNote className='h-3 w-3' />
              Observaciones
            </p>
            <p className='rounded-lg bg-gray-50 p-3 text-xs italic text-gray-600 dark:bg-gray-800 dark:text-gray-400'>
              &quot;{abono.notas}&quot;
            </p>
          </div>
        </>
      ) : null}

      {/* Anulación */}
      {estaAnulado ? (
        <>
          <div className={s.sidebar.divider} />
          <div className={s.sidebar.section}>
            <p className='flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-red-500 dark:text-red-400'>
              <Ban className='h-3 w-3' />
              Anulación
            </p>
            <div className='space-y-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800/50 dark:bg-red-950/30'>
              {abono.motivo_categoria ? (
                <div>
                  <p className={s.sidebar.rowLabel}>Motivo</p>
                  <p className='text-sm font-semibold text-red-900 dark:text-red-200'>
                    {abono.motivo_categoria}
                  </p>
                </div>
              ) : null}
              {abono.motivo_detalle ? (
                <div>
                  <p className={s.sidebar.rowLabel}>Detalle</p>
                  <p className='text-xs italic text-red-800 dark:text-red-300'>
                    {abono.motivo_detalle}
                  </p>
                </div>
              ) : null}
              {abono.anulado_por_nombre ? (
                <div>
                  <p className={s.sidebar.rowLabel}>Anulado por</p>
                  <p className='text-xs font-semibold text-red-800 dark:text-red-200'>
                    {abono.anulado_por_nombre}
                  </p>
                </div>
              ) : null}
              {abono.fecha_anulacion ? (
                <div>
                  <p className={s.sidebar.rowLabel}>Fecha de anulación</p>
                  <p className='text-xs text-red-800 dark:text-red-300'>
                    {formatDateForDisplay(abono.fecha_anulacion)}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
