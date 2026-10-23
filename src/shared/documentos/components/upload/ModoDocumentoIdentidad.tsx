'use client'

/**
 * Deja clara la diferencia entre los dos caminos de subida de un cliente:
 * - "Subir cédula" (`esCedula`): trámite oficial que habilita asignar
 *   vivienda. Encabezado fijo.
 * - Subida general: para todo lo demás (pareja, soportes, cartas…). Nunca
 *   cuenta como la cédula. Solo mientras falta la cédula se avisa y se
 *   ofrece ir al trámite correcto; después, sin aviso.
 */

import { ArrowRight, FolderUp, IdCard } from 'lucide-react'

export function ModoDocumentoIdentidad({
  esCedula,
  onSubirCedula,
}: {
  esCedula: boolean
  /** Solo si el cliente aún no tiene cédula: cambia al trámite oficial */
  onSubirCedula?: () => void
}) {
  if (esCedula) {
    return (
      <div className='flex items-start gap-3 rounded-2xl border border-cyan-200 bg-gradient-to-r from-cyan-50 to-blue-50/60 p-4 dark:border-cyan-500/30 dark:from-cyan-500/10 dark:to-blue-500/5'>
        <span className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/30'>
          <IdCard className='h-5 w-5' />
        </span>
        <div className='min-w-0'>
          <p className='text-sm font-bold text-cyan-950 dark:text-cyan-100'>
            Documento de identidad del cliente
          </p>
          <p className='text-xs leading-relaxed text-cyan-900/80 dark:text-cyan-200/80'>
            Sube la cédula o el pasaporte <strong>del titular</strong>, por
            ambas caras si es posible. Quedará como su documento oficial y
            <strong> habilitará la asignación de vivienda</strong>.
          </p>
        </div>
      </div>
    )
  }

  // Con la cédula ya cargada no hay confusión posible: sin aviso
  if (!onSubirCedula) return null

  return (
    <div className='flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50 sm:flex-row sm:items-center'>
      <span className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-500 to-slate-700 text-white shadow-md'>
        <FolderUp className='h-5 w-5' />
      </span>
      <div className='min-w-0 flex-1'>
        <p className='text-sm font-bold text-slate-900 dark:text-white'>
          Otros documentos del cliente
        </p>
        <p className='text-xs leading-relaxed text-slate-600 dark:text-slate-300'>
          Para documentos de su pareja, soportes, cartas o cualquier otro
          archivo. Lo que subas aquí no cuenta como la cédula del cliente.
        </p>
      </div>
      <button
        type='button'
        onClick={onSubirCedula}
        className='inline-flex flex-shrink-0 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-md transition-all hover:-translate-y-0.5'
      >
        <IdCard className='h-4 w-4' />
        Subir la cédula del cliente
        <ArrowRight className='h-3.5 w-3.5' />
      </button>
    </div>
  )
}
