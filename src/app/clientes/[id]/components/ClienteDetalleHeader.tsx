'use client'

/**
 * Encabezado del detalle de cliente: banner con el degradado del módulo
 * Clientes, avatar del estado, documento copiable, chip de vivienda, cifras
 * de la negociación y acciones.
 */

import type { ReactNode } from 'react'

import { motion } from 'framer-motion'
import {
  Building2,
  CheckCircle2,
  ChevronRight,
  Copy,
  Home,
  LayoutDashboard,
  Pencil,
  Trash2,
  Wallet,
} from 'lucide-react'
import { toast } from 'sonner'

import Link from 'next/link'

import { formatearDocumentoCompleto } from '@/lib/utils/documento.utils'
import { formatNombreCompleto } from '@/lib/utils/string.utils'
import type { Cliente, Negociacion } from '@/modules/clientes/types'
import { DatoHero } from '@/shared/components/detalle/DatoHero'
import { formatCOP } from '@/shared/components/list-page'
import { Tooltip } from '@/shared/components/ui/Tooltip'
import { CLIENTE_ESTADO_BADGE } from '@/shared/config/estados.colors'
import { cn } from '@/shared/utils/helpers'

import { useResumenNegociacion } from '../tabs/general/hooks/useResumenNegociacion'

interface ClienteDetalleHeaderProps {
  cliente: Cliente
  /** Estado a mostrar (Activo con saldo 0 se muestra como Propietario) */
  estado: string
  /** Negociación vigente (activa o completada), si hay */
  negociacion: Negociacion | null
  /** Botones principales (asignar vivienda, reactivar, registrar abono…) */
  acciones?: ReactNode
  onEditar?: () => void
  onEliminar?: () => void
  /** Motivo por el que no se puede eliminar (deshabilita el botón) */
  motivoNoEliminar?: string | null
}

const iniciales = (c: Cliente) =>
  `${c.nombres?.trim()[0] ?? ''}${c.apellidos?.trim()[0] ?? ''}`.toUpperCase()

const btnIcono =
  'flex h-10 w-10 items-center justify-center rounded-xl border border-white/30 bg-white/15 text-white backdrop-blur-sm transition-all hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white/15'

/** Cifras de la negociación (hook aparte: solo se monta si hay negociación) */
function DatosNegociacion({ negociacion }: { negociacion: Negociacion }) {
  const {
    totalComprometido,
    valorVivienda,
    interesesTotales,
    saldo,
    pctPagado,
  } = useResumenNegociacion({ negociacion })
  const total = interesesTotales > 0 ? totalComprometido : valorVivienda
  const pagada = saldo <= 0
  return (
    <>
      <DatoHero icon={Home} label='Valor total' valor={formatCOP(total)} />
      {pagada ? (
        <DatoHero icon={CheckCircle2} label='Estado de pago' valor='Pagada ✓' />
      ) : (
        <DatoHero
          icon={Wallet}
          label={`Saldo · ${Math.round(pctPagado)}% pagado`}
          valor={formatCOP(saldo)}
        />
      )}
    </>
  )
}

export function ClienteDetalleHeader({
  cliente,
  estado,
  negociacion,
  acciones,
  onEditar,
  onEliminar,
  motivoNoEliminar,
}: ClienteDetalleHeaderProps) {
  const nombre = formatNombreCompleto(cliente.nombre_completo)
  const cfg = CLIENTE_ESTADO_BADGE[estado] ?? CLIENTE_ESTADO_BADGE.Interesado
  const EstadoIcono = cfg.icon

  const vivienda = negociacion?.viviendas
  const codigoVivienda = vivienda
    ? `${vivienda.manzanas?.nombre ?? ''}${vivienda.numero ?? ''}`
    : ''
  const proyecto = vivienda?.manzanas?.proyectos?.nombre

  const copiarDocumento = async () => {
    try {
      await navigator.clipboard.writeText(cliente.numero_documento)
      toast.success('Documento copiado')
    } catch {
      toast.error('No se pudo copiar')
    }
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-600 px-5 py-5 shadow-lg shadow-blue-900/10 dark:from-cyan-700 dark:via-blue-700 dark:to-indigo-800 sm:px-6'
    >
      <span
        aria-hidden
        className='pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl'
      />
      <span
        aria-hidden
        className='pointer-events-none absolute -bottom-20 right-48 h-40 w-40 rounded-full bg-white/10 blur-2xl'
      />

      <div className='relative'>
        {/* Migas */}
        <nav
          aria-label='Ruta'
          className='mb-3 flex min-w-0 items-center gap-1 text-xs text-white/70'
        >
          <Link
            href='/'
            className='flex items-center gap-1 transition-colors hover:text-white'
          >
            <LayoutDashboard className='h-3 w-3' />
            Dashboard
          </Link>
          <ChevronRight className='h-3 w-3 text-white/40' />
          <Link href='/clientes' className='transition-colors hover:text-white'>
            Clientes
          </Link>
          <ChevronRight className='h-3 w-3 text-white/40' />
          <span
            className='min-w-0 truncate font-semibold text-white'
            aria-current='page'
          >
            {nombre}
          </span>
        </nav>

        <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
          {/* Identidad */}
          <div className='flex min-w-0 items-center gap-4'>
            <span
              className={cn(
                'relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-lg font-black text-white shadow-lg ring-4 ring-white/25 sm:h-16 sm:w-16 sm:text-xl',
                cfg.gradient
              )}
            >
              {iniciales(cliente)}
              <span className='absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-md'>
                <EstadoIcono
                  className={cn(
                    'h-4 w-4',
                    cfg.text,
                    cfg.iconFilled && 'fill-current'
                  )}
                />
              </span>
            </span>

            <div className='min-w-0'>
              <div className='flex flex-wrap items-center gap-2'>
                <h1 className='break-words text-xl font-bold leading-tight tracking-tight text-white sm:text-2xl'>
                  {nombre}
                </h1>
                <span className='inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold text-white ring-1 ring-white/30'>
                  <EstadoIcono
                    className={cn(
                      'h-3.5 w-3.5',
                      cfg.iconFilled && 'fill-current'
                    )}
                  />
                  {cfg.label}
                </span>
              </div>

              <div className='mt-1.5 flex flex-wrap items-center gap-2'>
                <button
                  type='button'
                  onClick={copiarDocumento}
                  title='Copiar número de documento'
                  className='group inline-flex items-center gap-1.5 rounded-lg px-1.5 py-0.5 text-sm font-medium text-white/85 transition-colors hover:bg-white/15 hover:text-white'
                >
                  {formatearDocumentoCompleto(
                    cliente.tipo_documento,
                    cliente.numero_documento
                  )}
                  <Copy className='h-3.5 w-3.5 opacity-50 group-hover:opacity-100' />
                </button>

                {codigoVivienda && (
                  <span className='inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 text-xs text-white ring-1 ring-white/25'>
                    <Home className='h-3.5 w-3.5' />
                    <span className='font-bold'>{codigoVivienda}</span>
                    {proyecto && (
                      <>
                        <span className='h-3 w-px bg-white/30' />
                        <Building2 className='h-3.5 w-3.5 text-white/80' />
                        <span className='text-white/85'>{proyecto}</span>
                      </>
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Cifras + acciones */}
          <div className='flex flex-wrap items-center gap-2'>
            {negociacion &&
            (negociacion.valor_total_pagar > 0 ||
              negociacion.valor_total > 0) ? (
              <DatosNegociacion negociacion={negociacion} />
            ) : null}
            {acciones}
            {onEditar && (
              <Tooltip content='Editar cliente' side='bottom'>
                <button
                  type='button'
                  onClick={onEditar}
                  aria-label='Editar cliente'
                  className={btnIcono}
                >
                  <Pencil className='h-4 w-4' />
                </button>
              </Tooltip>
            )}
            {onEliminar && (
              <Tooltip
                content={motivoNoEliminar ?? 'Eliminar cliente'}
                side='bottom'
              >
                {/* span: los botones deshabilitados no disparan el tooltip */}
                <span className='inline-flex'>
                  <button
                    type='button'
                    onClick={onEliminar}
                    disabled={!!motivoNoEliminar}
                    aria-label='Eliminar cliente'
                    className={cn(
                      btnIcono,
                      'hover:border-red-300/60 hover:bg-red-500/80'
                    )}
                  >
                    <Trash2 className='h-4 w-4' />
                  </button>
                </span>
              </Tooltip>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  )
}
