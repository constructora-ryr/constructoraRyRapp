'use client'

import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { Calendar, History, User, X } from 'lucide-react'
import { createPortal } from 'react-dom'

import { NegociacionActualizadaRenderer } from '@/app/clientes/[id]/tabs/historial/renderers/NegociacionActualizadaRenderer'
import { supabase } from '@/lib/supabase/client'
import { formatDateForDisplay } from '@/lib/utils/date.utils'
import type { EventoHistorialCliente } from '@/modules/clientes/types/historial.types'
import { humanizarEvento } from '@/modules/clientes/utils/humanizador-eventos'

// ── Hook ──────────────────────────────────────────────────────────────────────

function useHistorialNegociacion(negociacionId: string | undefined) {
  return useQuery({
    queryKey: ['historial-negociacion', negociacionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_log' as unknown as 'audit_log')
        .select(
          'id, tabla, accion, registro_id, fecha_evento, usuario_email, usuario_nombres, usuario_rol, datos_anteriores, datos_nuevos, cambios_especificos, metadata, modulo'
        )
        .eq('registro_id', negociacionId as string)
        .eq('tabla', 'negociaciones')
        .order('fecha_evento', { ascending: false })
        .limit(50)

      if (error) throw error

      return (data ?? []).map(
        (row): EventoHistorialCliente => ({
          id: row.id as string,
          tabla: row.tabla as string,
          accion: (row.accion as EventoHistorialCliente['accion']) ?? 'UPDATE',
          registro_id: row.registro_id as string,
          fecha_evento: row.fecha_evento as string,
          usuario_email: (row.usuario_email as string) ?? 'sistema@ryr.com',
          usuario_nombres: (row.usuario_nombres as string | null) ?? null,
          usuario_rol: (row.usuario_rol as string | null) ?? null,
          datos_anteriores:
            (row.datos_anteriores as Record<string, unknown> | null) ?? null,
          datos_nuevos:
            (row.datos_nuevos as Record<string, unknown> | null) ?? null,
          cambios_especificos:
            (row.cambios_especificos as Record<
              string,
              { antes: unknown; despues: unknown }
            > | null) ?? null,
          metadata: (row.metadata as Record<string, unknown>) ?? {},
          modulo: (row.modulo as string | null) ?? null,
          oculto: false,
        })
      )
    },
    enabled: !!negociacionId,
    staleTime: 30 * 1000,
  })
}

// ── Modal ─────────────────────────────────────────────────────────────────────

interface HistorialNegociacionModalProps {
  isOpen: boolean
  onClose: () => void
  negociacionId: string | undefined
}

export function HistorialNegociacionModal({
  isOpen,
  onClose,
  negociacionId,
}: HistorialNegociacionModalProps) {
  const { data: eventosRaw = [], isLoading } = useHistorialNegociacion(
    isOpen ? negociacionId : undefined
  )

  const eventos = eventosRaw.map(humanizarEvento)

  if (!isOpen || typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm'
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 32 }}
            transition={{ type: 'spring', stiffness: 340, damping: 30 }}
            className='fixed right-0 top-0 z-[9999] flex h-full w-full max-w-md flex-col bg-white shadow-2xl dark:bg-gray-900'
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className='flex flex-shrink-0 items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-700'>
              <div className='flex items-center gap-2.5'>
                <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30'>
                  <History className='h-4 w-4 text-violet-600 dark:text-violet-400' />
                </div>
                <div>
                  <h2 className='text-sm font-bold text-gray-900 dark:text-white'>
                    Historial de cambios
                  </h2>
                  <p className='text-xs text-gray-400 dark:text-gray-500'>
                    Ajustes al plan financiero
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className='flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300'
              >
                <X className='h-4 w-4' />
              </button>
            </div>

            {/* Body */}
            <div className='flex-1 overflow-y-auto'>
              {isLoading ? (
                <div className='flex items-center justify-center py-16'>
                  <div className='h-6 w-6 animate-spin rounded-full border-2 border-violet-500 border-t-transparent' />
                </div>
              ) : eventos.length === 0 ? (
                <div className='flex flex-col items-center justify-center px-6 py-16 text-center'>
                  <div className='mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800'>
                    <History className='h-7 w-7 text-gray-300 dark:text-gray-600' />
                  </div>
                  <p className='text-sm font-semibold text-gray-600 dark:text-gray-400'>
                    Sin cambios registrados
                  </p>
                  <p className='mt-1 text-xs text-gray-400 dark:text-gray-500'>
                    Los ajustes al plan financiero aparecerán aquí
                  </p>
                </div>
              ) : (
                <div className='divide-y divide-gray-100 dark:divide-gray-800'>
                  {eventos.map(evento => (
                    <div key={evento.id} className='py-1'>
                      <div className='flex items-center gap-4 px-5 pb-1 pt-3'>
                        <span className='flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500'>
                          <Calendar className='h-3 w-3' />
                          {formatDateForDisplay(evento.fecha)}
                        </span>
                        <span className='flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400'>
                          <User className='h-3 w-3' />
                          {evento.usuario.nombres ?? evento.usuario.email}
                        </span>
                      </div>
                      <NegociacionActualizadaRenderer evento={evento} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
