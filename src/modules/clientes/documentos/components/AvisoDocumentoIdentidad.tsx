'use client'

/**
 * Aviso del documento de identidad del cliente, igual en "Información
 * general" y en "Documentos":
 * - Falta la cédula: tarjeta ámbar (rosa si ya hay una venta en curso) con
 *   el avance del cliente y el botón para resolverlo.
 * - Ya la tiene (y no hay venta): franja verde "listo para asignar vivienda".
 */

import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { Check, CheckCircle2, ChevronRight, IdCard } from 'lucide-react'

import { cn } from '@/shared/utils/helpers'

interface AvisoDocumentoIdentidadProps {
  tieneDocumento: boolean
  /** Hay una negociación activa: el aviso es más urgente */
  ventaEnCurso: boolean
  accion?: { texto: string; icon?: LucideIcon; onClick: () => void }
}

const TONO = {
  normal: {
    caja: 'border-amber-200 from-amber-50 to-orange-50/60 dark:border-amber-500/30 dark:from-amber-500/10 dark:to-orange-500/5',
    icono: 'from-amber-500 to-orange-500 shadow-amber-500/30',
    titulo: 'text-amber-950 dark:text-amber-100',
    texto: 'text-amber-900/80 dark:text-amber-200/80',
    boton:
      'from-amber-500 to-orange-500 shadow-amber-500/25 hover:shadow-amber-500/40',
  },
  urgente: {
    caja: 'border-rose-200 from-rose-50 to-red-50/60 dark:border-rose-500/30 dark:from-rose-500/10 dark:to-red-500/5',
    icono: 'from-rose-500 to-red-600 shadow-rose-500/30',
    titulo: 'text-rose-950 dark:text-rose-100',
    texto: 'text-rose-900/80 dark:text-rose-200/80',
    boton:
      'from-rose-500 to-red-600 shadow-rose-500/25 hover:shadow-rose-500/40',
  },
}

function Avance({ pasos }: { pasos: { texto: string; hecho: boolean }[] }) {
  return (
    <ol className='flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] font-semibold'>
      {pasos.map((p, i) => (
        <li key={p.texto} className='flex items-center gap-1.5'>
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5',
              p.hecho
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                : 'bg-white/80 text-slate-500 ring-1 ring-slate-200 dark:bg-slate-900/60 dark:text-slate-400 dark:ring-slate-700'
            )}
          >
            {p.hecho ? (
              <Check className='h-3 w-3' strokeWidth={3} />
            ) : (
              <span className='h-1.5 w-1.5 rounded-full bg-current' />
            )}
            {p.texto}
          </span>
          {i < pasos.length - 1 ? (
            <ChevronRight className='h-3 w-3 text-slate-400' />
          ) : null}
        </li>
      ))}
    </ol>
  )
}

export function AvisoDocumentoIdentidad({
  tieneDocumento,
  ventaEnCurso,
  accion,
}: AvisoDocumentoIdentidadProps) {
  if (tieneDocumento) {
    if (ventaEnCurso) return null
    return (
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className='flex items-center gap-3 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50/60 px-4 py-3 dark:border-emerald-500/30 dark:from-emerald-500/10 dark:to-teal-500/5'
      >
        <span className='flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/30'>
          <CheckCircle2 className='h-5 w-5' />
        </span>
        <p className='text-sm text-emerald-900 dark:text-emerald-200'>
          <strong>Listo para asignar vivienda.</strong> El documento de
          identidad ya está cargado; usa “Asignar vivienda” arriba.
        </p>
      </motion.div>
    )
  }

  const t = TONO[ventaEnCurso ? 'urgente' : 'normal']
  const Icono = accion?.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      role='status'
      className={cn(
        'flex flex-col gap-3 rounded-2xl border bg-gradient-to-r p-4 sm:flex-row sm:items-center',
        t.caja
      )}
    >
      <span
        className={cn(
          'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md',
          t.icono
        )}
      >
        <IdCard className='h-5 w-5' />
      </span>

      <div className='min-w-0 flex-1 space-y-2'>
        <div>
          <h4 className={cn('text-sm font-bold', t.titulo)}>
            {ventaEnCurso
              ? 'Falta la cédula y la venta ya está en curso'
              : 'Falta el documento de identidad'}
          </h4>
          <p className={cn('text-xs leading-relaxed', t.texto)}>
            {ventaEnCurso
              ? 'Este cliente ya tiene una vivienda asignada. Sube su cédula o pasaporte para completar el expediente.'
              : 'Sube la cédula o el pasaporte del cliente. Es el requisito para poder asignarle una vivienda.'}
          </p>
        </div>
        <Avance
          pasos={[
            { texto: 'Cliente registrado', hecho: true },
            { texto: 'Cédula cargada', hecho: false },
            {
              texto: ventaEnCurso ? 'Vivienda asignada' : 'Asignar vivienda',
              hecho: ventaEnCurso,
            },
          ]}
        />
      </div>

      {accion ? (
        <button
          type='button'
          onClick={accion.onClick}
          className={cn(
            'inline-flex flex-shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5',
            t.boton
          )}
        >
          {Icono ? <Icono className='h-4 w-4' /> : null}
          {accion.texto}
        </button>
      ) : null}
    </motion.div>
  )
}
