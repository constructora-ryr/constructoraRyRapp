'use client'

import { useState } from 'react'

import { motion } from 'framer-motion'
import {
  Building2,
  Calendar,
  Clock,
  CreditCard,
  DollarSign,
  FileText,
  Home,
  Info,
  Shield,
  User,
  X,
} from 'lucide-react'

import {
  formatDateCompact,
  formatDateTimeWithSeconds,
} from '@/lib/utils/date.utils'

import type { RenunciaConInfo } from '../../types'
import {
  formatCOP,
  formatUsuarioRegistro,
  getTipoDocumentoLabel,
} from '../../utils/renuncias.utils'

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const s = {
  overlay:
    'fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4',
  container:
    'relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-700',
  header:
    'sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 dark:from-red-700 dark:via-rose-700 dark:to-pink-800 text-white rounded-t-2xl',
  headerTitle: 'text-lg font-bold flex items-center gap-2',
  closeBtn: 'p-1.5 rounded-lg hover:bg-white/20 transition-colors',
  tabs: 'flex gap-1 px-5 pt-3 pb-0 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50',
  tab: 'px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer',
  tabActive:
    'bg-white dark:bg-gray-900 text-red-600 dark:text-red-400 border border-gray-200 dark:border-gray-700 border-b-0',
  tabInactive:
    'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
  body: 'px-5 py-4 space-y-4',
  sectionTitle:
    'text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1.5',
  fieldRow:
    'flex items-start gap-2 py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-b-0',
  fieldIcon: 'w-4 h-4 mt-0.5 flex-shrink-0',
  fieldLabel:
    'text-xs font-semibold text-gray-500 dark:text-gray-400 min-w-[100px]',
  fieldValue: 'text-sm font-medium text-gray-900 dark:text-white',
  badge: {
    pendiente:
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs font-semibold',
    cerrada:
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-semibold',
  },
  snapshotPre:
    'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-xs font-mono text-gray-700 dark:text-gray-300 overflow-x-auto max-h-60 whitespace-pre-wrap',
  emptySnapshot: 'text-center py-8 text-sm text-gray-400 dark:text-gray-500',
}

type Tab = 'info' | 'financiero'

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────
interface DetalleRenunciaModalProps {
  renuncia: RenunciaConInfo
  onClose: () => void
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export function DetalleRenunciaModal({
  renuncia,
  onClose,
}: DetalleRenunciaModalProps) {
  const [tab, setTab] = useState<Tab>('info')

  const badgeClass =
    renuncia.estado === 'Pendiente Devolución'
      ? s.badge.pendiente
      : s.badge.cerrada

  const TABS: { id: Tab; label: string }[] = [
    { id: 'info', label: 'Info General' },
    { id: 'financiero', label: 'Financiero' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={s.overlay}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className={s.container}
        onClick={e => e.stopPropagation()}
        role='dialog'
        aria-modal='true'
        aria-label='Detalle de renuncia'
      >
        {/* Header */}
        <div className={s.header}>
          <span className={s.headerTitle}>
            <FileText className='h-5 w-5' />
            Detalle de Renuncia
          </span>
          <div className='flex items-center gap-3'>
            <span className={badgeClass}>{renuncia.estado}</span>
            <button onClick={onClose} className={s.closeBtn}>
              <X className='h-4 w-4' />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className={s.tabs}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`${s.tab} ${tab === t.id ? s.tabActive : s.tabInactive}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className={s.body}>
          {tab === 'info' ? <TabInfoGeneral renuncia={renuncia} /> : null}
          {tab === 'financiero' ? <TabFinanciero renuncia={renuncia} /> : null}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB: Info General
// ─────────────────────────────────────────────────────────────────────────────
function TabInfoGeneral({ renuncia }: { renuncia: RenunciaConInfo }) {
  return (
    <div className='space-y-4'>
      {/* Cliente */}
      <div>
        <p className={s.sectionTitle}>
          <User className='h-3.5 w-3.5' /> Cliente
        </p>
        <div className='space-y-0.5'>
          <div className={s.fieldRow}>
            <User className={`${s.fieldIcon} text-blue-500`} />
            <span className={s.fieldLabel}>Nombre:</span>
            <span className={s.fieldValue}>{renuncia.cliente.nombre}</span>
          </div>
          <div className={s.fieldRow}>
            <CreditCard className={`${s.fieldIcon} text-gray-500`} />
            <span className={s.fieldLabel}>Tipo doc.:</span>
            <span className={s.fieldValue}>
              {getTipoDocumentoLabel(renuncia.cliente.tipo_documento)}
            </span>
          </div>
          <div className={s.fieldRow}>
            <CreditCard className={`${s.fieldIcon} text-gray-400`} />
            <span className={s.fieldLabel}>Número doc.:</span>
            <span className={s.fieldValue}>{renuncia.cliente.documento}</span>
          </div>
        </div>
      </div>

      {/* Vivienda */}
      <div>
        <p className={s.sectionTitle}>
          <Home className='h-3.5 w-3.5' /> Vivienda
        </p>
        <div className='space-y-0.5'>
          <div className={s.fieldRow}>
            <Home className={`${s.fieldIcon} text-orange-500`} />
            <span className={s.fieldLabel}>Vivienda:</span>
            <span className={s.fieldValue}>
              Manzana {renuncia.vivienda.manzana} Casa No.{' '}
              {renuncia.vivienda.numero}
            </span>
          </div>
          <div className={s.fieldRow}>
            <Building2 className={`${s.fieldIcon} text-green-500`} />
            <span className={s.fieldLabel}>Proyecto:</span>
            <span className={s.fieldValue}>{renuncia.proyecto.nombre}</span>
          </div>
        </div>
      </div>

      {/* Renuncia */}
      <div>
        <p className={s.sectionTitle}>
          <FileText className='h-3.5 w-3.5' /> Renuncia
        </p>
        <div className='space-y-0.5'>
          <div className={s.fieldRow}>
            <Calendar className={`${s.fieldIcon} text-red-500`} />
            <span className={s.fieldLabel}>Fecha:</span>
            <span className={s.fieldValue}>
              {formatDateCompact(renuncia.fecha_renuncia)}
            </span>
          </div>
          <div className={s.fieldRow}>
            <Clock className={`${s.fieldIcon} text-yellow-500`} />
            <span className={s.fieldLabel}>Días desde:</span>
            <span className={s.fieldValue}>
              {renuncia.dias_desde_renuncia} días
            </span>
          </div>
          <div className={s.fieldRow}>
            <FileText className={`${s.fieldIcon} text-gray-500`} />
            <span className={s.fieldLabel}>Motivo:</span>
            <span className={s.fieldValue}>{renuncia.motivo}</span>
          </div>
        </div>
      </div>

      {/* Footer de auditoría */}
      <div className='mt-2 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/40'>
        <div className='grid grid-cols-2 divide-x divide-gray-200 dark:divide-gray-700'>
          {/* Registro de la renuncia */}
          <div className='space-y-1 px-3 py-2.5'>
            <p className='flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500'>
              <Clock className='h-3 w-3' /> Registro de la renuncia
            </p>
            <p className='text-xs font-semibold text-gray-700 dark:text-gray-200'>
              {renuncia.fecha_creacion
                ? formatDateTimeWithSeconds(renuncia.fecha_creacion)
                : '—'}
            </p>
            {renuncia.usuario_registro ? (
              <p className='text-[11px] leading-tight text-gray-500 dark:text-gray-400'>
                <span className='font-semibold'>Registrada por:</span>{' '}
                {formatUsuarioRegistro(renuncia.usuario_registro)}
              </p>
            ) : null}
          </div>

          {/* Cierre de la renuncia */}
          <div className='space-y-1 px-3 py-2.5'>
            <p className='flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500'>
              <Calendar className='h-3 w-3' /> Cierre de la renuncia
            </p>
            {renuncia.fecha_cierre ? (
              <>
                <p className='text-xs font-semibold text-gray-700 dark:text-gray-200'>
                  {formatDateTimeWithSeconds(renuncia.fecha_cierre)}
                </p>
                <p className='text-[11px] leading-tight text-gray-500 dark:text-gray-400'>
                  <span className='font-semibold'>Cerrada por:</span>{' '}
                  {renuncia.usuario_cierre ?? '—'}
                </p>
              </>
            ) : (
              <p className='text-xs italic text-gray-400 dark:text-gray-500'>
                Pendiente
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Tipo interno para ítems de abonos_snapshot
// ─────────────────────────────────────────────────────────────────────────────
interface AbonoSnapshotItem {
  id: string
  tipo: string
  entidad: string | null
  monto_aprobado: number
  monto_recibido: number
  estado: string
  fecha_resolucion: string | null
  fecha_completado: string | null
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB: Financiero
// ─────────────────────────────────────────────────────────────────────────────
function TabFinanciero({ renuncia }: { renuncia: RenunciaConInfo }) {
  const abonosArr: AbonoSnapshotItem[] = Array.isArray(renuncia.abonos_snapshot)
    ? (renuncia.abonos_snapshot as unknown as AbonoSnapshotItem[])
    : []

  return (
    <div className='space-y-4'>
      {/* Resumen económico */}
      <div>
        <p className={s.sectionTitle}>
          <DollarSign className='h-3.5 w-3.5' /> Resumen económico
        </p>
        <div className='space-y-0.5'>
          {renuncia.negociacion.valor_total_pagar ? (
            <div className={s.fieldRow}>
              <DollarSign className={`${s.fieldIcon} text-blue-500`} />
              <span className={s.fieldLabel}>Precio pactado:</span>
              <span className={s.fieldValue}>
                {formatCOP(renuncia.negociacion.valor_total_pagar)}
              </span>
            </div>
          ) : null}
          {renuncia.vivienda_valor_snapshot ? (
            <div className={s.fieldRow}>
              <DollarSign className={`${s.fieldIcon} text-gray-500`} />
              <span className={s.fieldLabel}>Valor vivienda:</span>
              <span className={s.fieldValue}>
                {formatCOP(renuncia.vivienda_valor_snapshot)}
              </span>
            </div>
          ) : null}
          <div className={s.fieldRow}>
            <DollarSign className={`${s.fieldIcon} text-red-500`} />
            <span className={s.fieldLabel}>A devolver:</span>
            <span className='text-sm font-bold text-red-600 dark:text-red-400'>
              {formatCOP(renuncia.monto_a_devolver)}
            </span>
          </div>
          {renuncia.retencion_monto > 0 ? (
            <>
              <div className={s.fieldRow}>
                <Shield className={`${s.fieldIcon} text-yellow-500`} />
                <span className={s.fieldLabel}>Retenido:</span>
                <span className='text-sm font-semibold text-yellow-600 dark:text-yellow-400'>
                  {formatCOP(renuncia.retencion_monto)}
                </span>
              </div>
              {renuncia.retencion_motivo ? (
                <div className={s.fieldRow}>
                  <Info className={`${s.fieldIcon} text-gray-400`} />
                  <span className={s.fieldLabel}>Motivo ret.:</span>
                  <span className={s.fieldValue}>
                    {renuncia.retencion_motivo}
                  </span>
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </div>

      {/* Fuentes de pago al momento de la renuncia */}
      {abonosArr.length > 0 ? (
        <div>
          <p className={s.sectionTitle}>
            <CreditCard className='h-3.5 w-3.5' /> Fuentes de pago
          </p>
          <div className='space-y-2'>
            {abonosArr.map((abono, idx) => (
              <div
                key={abono.id ?? idx}
                className='space-y-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800/50'
              >
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-semibold text-gray-800 dark:text-gray-200'>
                    {abono.tipo}
                  </span>
                  {abono.entidad ? (
                    <span className='text-xs text-gray-500 dark:text-gray-400'>
                      {abono.entidad}
                    </span>
                  ) : null}
                </div>
                <div className='flex gap-4 text-xs text-gray-600 dark:text-gray-400'>
                  <span>
                    Aprobado:{' '}
                    <span className='font-semibold text-gray-800 dark:text-gray-200'>
                      {formatCOP(abono.monto_aprobado)}
                    </span>
                  </span>
                  <span>
                    Recibido:{' '}
                    <span className='font-semibold text-gray-800 dark:text-gray-200'>
                      {formatCOP(abono.monto_recibido)}
                    </span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Devolución */}
      {renuncia.estado === 'Cerrada' && renuncia.fecha_devolucion ? (
        <div>
          <p className={s.sectionTitle}>
            <DollarSign className='h-3.5 w-3.5' /> Devolución
          </p>
          <div className='space-y-0.5'>
            <div className={s.fieldRow}>
              <Calendar className={`${s.fieldIcon} text-green-500`} />
              <span className={s.fieldLabel}>Fecha:</span>
              <span className={s.fieldValue}>
                {formatDateCompact(renuncia.fecha_devolucion)}
              </span>
            </div>
            {renuncia.metodo_devolucion ? (
              <div className={s.fieldRow}>
                <CreditCard className={`${s.fieldIcon} text-blue-500`} />
                <span className={s.fieldLabel}>Método:</span>
                <span className={s.fieldValue}>
                  {renuncia.metodo_devolucion}
                </span>
              </div>
            ) : null}
            {renuncia.numero_comprobante ? (
              <div className={s.fieldRow}>
                <FileText className={`${s.fieldIcon} text-gray-500`} />
                <span className={s.fieldLabel}>Comprobante:</span>
                <span className={s.fieldValue}>
                  {renuncia.numero_comprobante}
                </span>
              </div>
            ) : null}
            {renuncia.notas_cierre ? (
              <div className={s.fieldRow}>
                <Info className={`${s.fieldIcon} text-gray-400`} />
                <span className={s.fieldLabel}>Notas cierre:</span>
                <span className={s.fieldValue}>{renuncia.notas_cierre}</span>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
