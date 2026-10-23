'use client'

/**
 * Aviso de documentos pendientes de las fuentes de pago (pestaña
 * "Documentos"). Mismo lenguaje que el aviso de la cédula: tarjeta ámbar con
 * ícono en degradado, resumen por fuente y una fila por documento con su
 * botón para subirlo.
 *
 * Los requisitos salen de vista_documentos_pendientes_fuentes:
 * - Específicos de cada fuente: carta de aprobación del crédito, carta de
 *   asignación de la caja de compensación, carta de Mi Casa Ya…
 * - Compartidos del cliente ("Documentación final"): boleta de registro.
 */

import { useMemo, useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, FileWarning, Upload } from 'lucide-react'

import { useDocumentosPendientes } from '@/modules/clientes/hooks/useDocumentosPendientes'
import { cn } from '@/shared/utils/helpers'

import { TIPO_COMPARTIDO as COMPARTIDO, estiloDeFuente } from './estilo-fuente'

interface SeccionDocumentosPendientesProps {
  clienteId: string
  onSubirDocumento?: (
    pendienteId: string,
    tipoDocumento: string,
    metadata: Record<string, unknown>
  ) => void
}

interface FilaPendiente {
  id: string
  fuenteId: string
  tipoDocumento: string
  obligatorio: boolean
  compartido: boolean
  metadata: Record<string, unknown>
}

interface GrupoFuente {
  fuenteId: string
  etiqueta: string
  entidad: string
  compartido: boolean
  filas: FilaPendiente[]
}

const plural = (n: number, uno: string, varios: string) =>
  `${n} ${n === 1 ? uno : varios}`

export function SeccionDocumentosPendientes({
  clienteId,
  onSubirDocumento,
}: SeccionDocumentosPendientesProps) {
  const [expandido, setExpandido] = useState(true)

  const { data: documentosPendientes = [], isLoading } =
    useDocumentosPendientes(clienteId)

  // Agrupar por fuente; la documentación final (compartida) va al final
  const grupos = useMemo(() => {
    const porFuente: Record<string, GrupoFuente> = {}

    documentosPendientes.forEach(doc => {
      if (doc.estado !== 'Pendiente') return
      const tipo = doc.metadata?.tipo_fuente || 'Sin especificar'
      const compartido = tipo === COMPARTIDO
      // Los compartidos no tienen fuente: se agrupan todos juntos
      const fuenteId = doc.fuente_pago_id ?? COMPARTIDO

      porFuente[fuenteId] ??= {
        fuenteId,
        etiqueta: compartido ? 'Documentación final' : tipo,
        // ✅ La vista genera 'entidad_fuente' (no 'entidad') en el JSON
        entidad: compartido ? '' : doc.metadata?.entidad_fuente || '',
        compartido,
        filas: [],
      }

      porFuente[fuenteId].filas.push({
        id: doc.id,
        fuenteId: doc.fuente_pago_id,
        tipoDocumento: doc.tipo_documento,
        obligatorio: doc.metadata?.nivel_validacion === 'DOCUMENTO_OBLIGATORIO',
        compartido,
        metadata: doc.metadata,
      })
    })

    return Object.values(porFuente).sort(
      (a, b) => Number(a.compartido) - Number(b.compartido)
    )
  }, [documentosPendientes])

  const total = grupos.reduce((s, g) => s + g.filas.length, 0)
  const obligatorios = grupos.reduce(
    (s, g) => s + g.filas.filter(f => f.obligatorio).length,
    0
  )

  if (isLoading || total === 0) return null

  return (
    <motion.section
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      role='status'
      className='overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50/60 dark:border-amber-500/30 dark:from-amber-500/10 dark:to-orange-500/5'
    >
      {/* Encabezado */}
      <button
        type='button'
        onClick={() => setExpandido(v => !v)}
        aria-expanded={expandido}
        className='flex w-full items-start gap-3 p-4 text-left sm:items-center'
      >
        <span className='flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/30'>
          <FileWarning className='h-5 w-5' />
        </span>

        <div className='min-w-0 flex-1 space-y-2'>
          <div>
            <h4 className='flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-bold text-amber-950 dark:text-amber-100'>
              {total === 1
                ? 'Falta 1 documento de las fuentes de pago'
                : `Faltan ${total} documentos de las fuentes de pago`}
              {obligatorios > 0 ? (
                <span className='rounded-full bg-rose-500 px-2 py-0.5 text-[11px] font-bold text-white shadow-sm shadow-rose-500/30'>
                  {plural(obligatorios, 'obligatorio', 'obligatorios')}
                </span>
              ) : null}
            </h4>
            <p className='text-xs leading-relaxed text-amber-900/80 dark:text-amber-200/80'>
              {obligatorios > 0
                ? 'Los obligatorios se necesitan para los desembolsos. Al subirlos quedan vinculados a su fuente automáticamente.'
                : 'Al subirlos quedan vinculados a su fuente automáticamente.'}
            </p>
          </div>

          {/* Resumen por fuente */}
          <ul className='flex flex-wrap gap-1.5 text-[11px] font-semibold'>
            {grupos.map(g => {
              const { icon: Icono } = estiloDeFuente(
                g.compartido ? COMPARTIDO : g.etiqueta
              )
              return (
                <li
                  key={g.fuenteId}
                  className='inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-0.5 text-slate-600 ring-1 ring-amber-200 dark:bg-slate-900/60 dark:text-slate-300 dark:ring-amber-500/20'
                >
                  <Icono className='h-3 w-3' />
                  {g.etiqueta}
                  <span className='text-amber-600 dark:text-amber-400'>
                    · {g.filas.length}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>

        <span className='flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-amber-700 transition-colors hover:bg-white/70 dark:text-amber-300 dark:hover:bg-slate-900/50'>
          <ChevronDown
            className={cn(
              'h-5 w-5 transition-transform duration-300',
              expandido && 'rotate-180'
            )}
          />
        </span>
      </button>

      {/* Documentos */}
      <AnimatePresence initial={false}>
        {expandido ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className='overflow-hidden'
          >
            <ul className='mx-4 mb-4 divide-y divide-amber-100 overflow-hidden rounded-xl bg-white/80 ring-1 ring-amber-200/70 dark:divide-slate-700/60 dark:bg-slate-900/50 dark:ring-amber-500/20'>
              {grupos.flatMap(g =>
                g.filas.map(fila => {
                  const { icon: Icono, degradado } = estiloDeFuente(
                    g.compartido ? COMPARTIDO : g.etiqueta
                  )
                  return (
                    <li
                      key={`${g.fuenteId}-${fila.id}`}
                      className='flex flex-col gap-3 p-3 sm:flex-row sm:items-center'
                    >
                      <div className='flex min-w-0 flex-1 items-start gap-3'>
                        <span
                          className={cn(
                            'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-md',
                            degradado
                          )}
                        >
                          <Icono className='h-4 w-4' />
                        </span>
                        <div className='min-w-0 flex-1'>
                          <p className='flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-slate-900 dark:text-white'>
                            <span className='break-words'>
                              {fila.tipoDocumento}
                            </span>
                            <span
                              className={cn(
                                'rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                                fila.obligatorio
                                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'
                                  : 'bg-slate-100 text-slate-600 dark:bg-slate-700/60 dark:text-slate-300'
                              )}
                            >
                              {fila.obligatorio ? 'Obligatorio' : 'Opcional'}
                            </span>
                          </p>
                          <p className='mt-0.5 text-xs text-slate-500 dark:text-slate-400'>
                            {g.compartido ? (
                              'Documentación final · se obtiene tras la escrituración'
                            ) : (
                              <>
                                {g.etiqueta}
                                {g.entidad ? (
                                  <span className='font-medium text-slate-700 dark:text-slate-300'>
                                    {' '}
                                    · {g.entidad}
                                  </span>
                                ) : null}
                              </>
                            )}
                          </p>
                        </div>
                      </div>

                      {onSubirDocumento ? (
                        <button
                          type='button'
                          onClick={() =>
                            onSubirDocumento(fila.id, fila.tipoDocumento, {
                              ...fila.metadata,
                              fuente_pago_id: fila.fuenteId,
                            })
                          }
                          className='inline-flex flex-shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-amber-500/25 transition-all hover:-translate-y-0.5 hover:shadow-amber-500/40'
                        >
                          <Upload className='h-4 w-4' />
                          Subir
                        </button>
                      ) : null}
                    </li>
                  )
                })
              )}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.section>
  )
}
