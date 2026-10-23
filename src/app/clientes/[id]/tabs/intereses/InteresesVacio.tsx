'use client'

/**
 * Estado vacío de Intereses (mismo diseño de la versión original: ícono,
 * título, tarjeta con lista de íconos, caja de acción y nota al pie).
 * - Con vivienda: tema azul (el de Clientes) con su vivienda y acceso a la
 *   negociación. Regla de negocio: una vivienda por cliente, así que no se
 *   registran intereses nuevos.
 * - Sin vivienda: tema rosa con el botón para registrar el primer interés.
 */

import type { ReactNode } from 'react'

import { motion } from 'framer-motion'
import {
  ArrowRight,
  Building2,
  Clock,
  DollarSign,
  Heart,
  Home,
  Info,
  Lightbulb,
  ListChecks,
  Plus,
  Star,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'

import { formatCOP } from '@/shared/components/list-page'
import { cn } from '@/shared/utils/helpers'

export interface ViviendaCliente {
  codigo: string
  proyecto?: string
  valor?: number
  pagada: boolean
}

interface InteresesVacioProps {
  vivienda: ViviendaCliente | null
  onRegistrar?: () => void
  onVerNegociacion?: () => void
}

interface Tema {
  container: string
  iconWrapper: string
  title: string
  itemIcon: string
  cta: string
  ctaIcon: string
  ctaTitle: string
  ctaText: string
  ctaButton: string
  footerIcon: string
}

const TEMAS: Record<'rosa' | 'azul', Tema> = {
  rosa: {
    container: 'from-white/90 via-pink-50/90 to-rose-50/90 dark:to-pink-950/50',
    iconWrapper: 'from-pink-500 via-rose-600 to-red-600 shadow-pink-500/30',
    title: 'to-pink-900 dark:to-pink-100',
    itemIcon:
      'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
    cta: 'from-pink-50 via-rose-50 to-red-50 border-pink-200/50 dark:from-pink-950/30 dark:via-rose-950/30 dark:to-red-950/30 dark:border-pink-800/50',
    ctaIcon: 'text-pink-600 dark:text-pink-400',
    ctaTitle: 'text-pink-900 dark:text-pink-100',
    ctaText: 'text-pink-700 dark:text-pink-300',
    ctaButton:
      'from-pink-500 via-rose-600 to-red-600 shadow-pink-500/30 hover:shadow-pink-500/40',
    footerIcon: 'text-pink-600 dark:text-pink-400',
  },
  azul: {
    container:
      'from-white/90 via-cyan-50/80 to-indigo-50/80 dark:to-indigo-950/40',
    iconWrapper: 'from-cyan-500 via-blue-600 to-indigo-600 shadow-blue-500/30',
    title: 'to-blue-900 dark:to-blue-100',
    itemIcon:
      'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    cta: 'from-cyan-50 via-blue-50 to-indigo-50 border-blue-200/60 dark:from-cyan-950/30 dark:via-blue-950/30 dark:to-indigo-950/30 dark:border-blue-800/50',
    ctaIcon: 'text-blue-600 dark:text-blue-400',
    ctaTitle: 'text-blue-900 dark:text-blue-100',
    ctaText: 'text-blue-700 dark:text-blue-300',
    ctaButton:
      'from-cyan-600 via-blue-600 to-indigo-600 dark:from-cyan-700 dark:via-blue-700 dark:to-indigo-800 shadow-blue-500/30 hover:shadow-blue-500/40',
    footerIcon: 'text-blue-600 dark:text-blue-400',
  },
}

interface Item {
  icon: LucideIcon
  titulo: ReactNode
  detalle: string
  /** Clases del ícono si no usa el del tema (p.ej. dorado de Propietario) */
  iconClass?: string
}

function EstadoVacio({
  tema,
  icon: Icon,
  titulo,
  descripcion,
  listaTitulo,
  items,
  ctaTitulo,
  ctaTexto,
  boton,
  nota,
}: {
  tema: Tema
  icon: LucideIcon
  titulo: string
  descripcion: string
  listaTitulo: string
  items: Item[]
  ctaTitulo: string
  ctaTexto: string
  boton?: {
    label: string
    icon: LucideIcon
    onClick: () => void
    iconoFinal?: boolean
  }
  nota: string
}) {
  const BotonIcono = boton?.icon
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'space-y-4 rounded-2xl border border-gray-200/50 bg-gradient-to-br p-5 text-center shadow-xl backdrop-blur-xl dark:border-gray-700/50 dark:from-gray-800/90 dark:via-gray-800/80 sm:p-6',
        tema.container
      )}
    >
      <div className='flex justify-center'>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          className={cn(
            'flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br shadow-2xl',
            tema.iconWrapper
          )}
        >
          <Icon className='h-8 w-8 text-white' />
        </motion.div>
      </div>

      <div>
        <h3
          className={cn(
            'bg-gradient-to-br from-gray-900 via-gray-800 bg-clip-text text-xl font-bold text-transparent dark:from-white dark:via-gray-100',
            tema.title
          )}
        >
          {titulo}
        </h3>
        <p className='mx-auto mt-1 max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-400'>
          {descripcion}
        </p>
      </div>

      {/* Lista con íconos */}
      <div className='rounded-xl border border-gray-200/80 bg-white/60 p-3 text-left shadow-lg backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-900/40 sm:p-4'>
        <div className='mb-2.5 flex items-center gap-2 border-b border-gray-200 pb-2 text-sm font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-300'>
          <ListChecks className='h-4 w-4' />
          {listaTitulo}
        </div>
        <ul className='space-y-3'>
          {items.map((it, i) => {
            const ItIcono = it.icon
            return (
              <li key={i} className='flex items-start gap-3'>
                <span
                  className={cn(
                    'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                    it.iconClass ?? tema.itemIcon
                  )}
                >
                  <ItIcono className='h-3.5 w-3.5' />
                </span>
                <div className='min-w-0 flex-1'>
                  <div className='text-sm font-semibold text-gray-800 dark:text-gray-200'>
                    {it.titulo}
                  </div>
                  <p className='mt-0.5 text-xs text-gray-500 dark:text-gray-400'>
                    {it.detalle}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Caja de acción */}
      <div
        className={cn(
          'rounded-xl border bg-gradient-to-r p-3 backdrop-blur-sm sm:p-4',
          tema.cta
        )}
      >
        <div className='flex items-start gap-3 text-left'>
          <Lightbulb
            className={cn(
              'mt-0.5 h-6 w-6 shrink-0 animate-pulse',
              tema.ctaIcon
            )}
          />
          <div className='flex-1'>
            <h4 className={cn('mb-1 text-sm font-bold', tema.ctaTitle)}>
              {ctaTitulo}
            </h4>
            <p className={cn('text-xs leading-relaxed', tema.ctaText)}>
              {ctaTexto}
            </p>
          </div>
        </div>
        {boton && BotonIcono && (
          <button
            type='button'
            onClick={boton.onClick}
            className={cn(
              'mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r px-4 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl active:scale-[0.99]',
              tema.ctaButton
            )}
          >
            {!boton.iconoFinal && <BotonIcono className='h-4 w-4' />}
            {boton.label}
            {boton.iconoFinal && <BotonIcono className='h-4 w-4' />}
          </button>
        )}
      </div>

      {/* Nota */}
      <div className='flex items-start gap-3 border-t border-gray-200 pt-4 text-left dark:border-gray-700'>
        <Info className={cn('mt-0.5 h-5 w-5 shrink-0', tema.footerIcon)} />
        <p className='text-xs leading-relaxed text-gray-600 dark:text-gray-400'>
          {nota}
        </p>
      </div>
    </motion.div>
  )
}

export function InteresesVacio({
  vivienda,
  onRegistrar,
  onVerNegociacion,
}: InteresesVacioProps) {
  if (vivienda) {
    const items: Item[] = [
      {
        icon: Home,
        titulo: (
          <span className='flex flex-wrap items-center gap-1.5'>
            <span className='rounded-md bg-orange-50 px-1.5 font-bold text-orange-700 ring-1 ring-inset ring-orange-600/20 dark:bg-orange-500/10 dark:text-orange-300'>
              {vivienda.codigo}
            </span>
            {vivienda.proyecto && (
              <span className='inline-flex items-center gap-1 text-gray-700 dark:text-gray-300'>
                <Building2 className='h-3.5 w-3.5 text-green-600 dark:text-green-400' />
                {vivienda.proyecto}
              </span>
            )}
          </span>
        ),
        detalle: 'Vivienda asignada en su negociación',
      },
    ]
    if (vivienda.valor) {
      items.push({
        icon: DollarSign,
        titulo: (
          <span className='tabular-nums'>{formatCOP(vivienda.valor)}</span>
        ),
        detalle: 'Valor total de la vivienda',
      })
    }
    items.push(
      vivienda.pagada
        ? {
            icon: Star,
            titulo: 'Propietario',
            detalle: 'Pagó el 100% de la vivienda',
            iconClass:
              'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
          }
        : {
            icon: Clock,
            titulo: 'Negociación en curso',
            detalle: 'Aún tiene saldo pendiente por pagar',
          }
    )

    return (
      <EstadoVacio
        tema={TEMAS.azul}
        icon={Home}
        titulo='Este cliente ya tiene su vivienda'
        descripcion='Los intereses se registran para hacer seguimiento antes de asignar una vivienda. Este cliente ya tiene la suya, así que no se registran intereses nuevos.'
        listaTitulo='Su vivienda'
        items={items}
        ctaTitulo='¿Necesitas ver los pagos?'
        ctaTexto='En la pestaña Negociación están el plan de pagos, las fuentes de pago y los abonos de este cliente.'
        boton={
          onVerNegociacion
            ? {
                label: 'Ver negociación',
                icon: ArrowRight,
                onClick: onVerNegociacion,
                iconoFinal: true,
              }
            : undefined
        }
        nota='Cada cliente tiene una sola vivienda. Los intereses solo se registran mientras el cliente no tiene una asignada.'
      />
    )
  }

  return (
    <EstadoVacio
      tema={TEMAS.rosa}
      icon={Heart}
      titulo='Sin intereses registrados'
      descripcion='Este cliente aún no ha manifestado interés en ningún proyecto o vivienda. Registra su primer interés para iniciar el proceso comercial.'
      listaTitulo='¿Qué puedes hacer?'
      items={[
        {
          icon: Home,
          titulo: 'Registrar interés en proyectos o viviendas',
          detalle: 'Vincula al cliente con las viviendas que le interesan',
        },
        {
          icon: Building2,
          titulo: 'Hacer seguimiento del proceso comercial',
          detalle: 'Rastrea el origen y el estado de cada interés',
        },
        {
          icon: TrendingUp,
          titulo: 'Medir la conversión',
          detalle: 'Mira cuántos intereses terminan en negociación',
        },
      ]}
      ctaTitulo='Comienza ahora'
      ctaTexto='Podrás elegir el proyecto o la vivienda, indicar cómo llegó el contacto y agregar observaciones.'
      boton={
        onRegistrar
          ? {
              label: 'Registrar nuevo interés',
              icon: Plus,
              onClick: onRegistrar,
            }
          : undefined
      }
      nota='Los intereses permiten hacer seguimiento comercial desde el primer contacto hasta la asignación de vivienda.'
    />
  )
}
