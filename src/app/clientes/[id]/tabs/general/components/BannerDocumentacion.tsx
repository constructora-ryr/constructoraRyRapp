'use client'

import { motion } from 'framer-motion'
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Circle,
} from 'lucide-react'

interface BannerDocumentacionProps {
  tieneDocumento: boolean
  cargandoValidacion: boolean
  tieneNegociacionActiva: boolean
  onIrADocumentos?: () => void
}

export function BannerDocumentacion({
  tieneDocumento,
  cargandoValidacion,
  tieneNegociacionActiva,
  onIrADocumentos,
}: BannerDocumentacionProps) {
  // Caso 1: tiene negociación activa + sin documento → mismo banner naranja pero texto urgente
  if (!tieneDocumento && tieneNegociacionActiva && !cargandoValidacion) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className='relative overflow-hidden rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 p-3 text-white shadow-lg'
      >
        <div className='bg-grid-white/10 absolute inset-0 [mask-image:linear-gradient(to_right,transparent,black,transparent)]' />
        <div className='relative flex items-center gap-3'>
          <div className='flex-shrink-0 rounded-lg bg-white/20 p-2 backdrop-blur'>
            <AlertTriangle className='h-5 w-5' strokeWidth={2.5} />
          </div>
          <div className='min-w-0 flex-1'>
            <h4 className='mb-0.5 text-sm font-bold'>
              ⚠ Acción requerida: Documento de identidad
            </h4>
            <p className='text-xs leading-relaxed opacity-90'>
              Se detectó que este cliente tiene una vivienda asignada y una
              negociación activa, pero aún no tiene su documento de identidad
              cargado. Es indispensable subirlo para completar el proceso
              correctamente.
            </p>
            {onIrADocumentos && (
              <button
                onClick={onIrADocumentos}
                className='mt-1.5 inline-flex items-center gap-1 rounded-lg bg-white/20 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/30'
              >
                Ir a Documentos
                <ArrowRight className='h-3.5 w-3.5' />
              </button>
            )}
          </div>
          <div className='hidden items-center gap-2 border-l border-white/30 pl-3 text-xs md:flex'>
            <div className='flex flex-col gap-1.5'>
              <div className='flex items-center gap-1.5'>
                <CheckCircle
                  className='h-3.5 w-3.5 flex-shrink-0'
                  strokeWidth={2.5}
                />
                <span className='whitespace-nowrap'>Cliente Registrado</span>
              </div>
              <div className='flex items-center gap-1.5'>
                <CheckCircle
                  className='h-3.5 w-3.5 flex-shrink-0'
                  strokeWidth={2.5}
                />
                <span className='whitespace-nowrap'>Vivienda Asignada</span>
              </div>
              <div className='flex items-center gap-1.5'>
                <Circle
                  className='h-3.5 w-3.5 flex-shrink-0'
                  strokeWidth={2.5}
                />
                <span className='whitespace-nowrap'>Documento Cargado</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  // Caso 2: tiene negociación activa + con documento → no mostrar nada
  if (tieneNegociacionActiva) return null

  // Caso 3: sin negociación → banner de estado (verde si tiene doc, naranja si no)
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className={`relative overflow-hidden rounded-xl p-3 shadow-lg ${
        tieneDocumento
          ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
          : 'bg-gradient-to-r from-orange-500 to-amber-500'
      } text-white`}
    >
      <div className='bg-grid-white/10 absolute inset-0 [mask-image:linear-gradient(to_right,transparent,black,transparent)]' />

      <div className='relative flex items-center gap-3'>
        <div className='flex-shrink-0 rounded-lg bg-white/20 p-2 backdrop-blur'>
          {cargandoValidacion ? (
            <Circle className='h-5 w-5 animate-spin' strokeWidth={2.5} />
          ) : tieneDocumento ? (
            <CheckCircle className='h-5 w-5' strokeWidth={2.5} />
          ) : (
            <AlertCircle className='h-5 w-5' strokeWidth={2.5} />
          )}
        </div>

        <div className='min-w-0 flex-1'>
          <h4 className='mb-0.5 text-sm font-bold'>
            {tieneDocumento
              ? '✓ Cliente listo para asignar vivienda'
              : '⚠ Acción requerida: Documento de identidad'}
          </h4>
          <p className='text-xs leading-relaxed opacity-90'>
            {tieneDocumento
              ? 'Todos los documentos verificados. Usa el botón "Asignar Vivienda" arriba.'
              : 'Sube la cédula en la pestaña "Documentos" para poder asignar vivienda.'}
          </p>
          {!tieneDocumento && onIrADocumentos ? (
            <button
              onClick={onIrADocumentos}
              className='mt-1.5 inline-flex items-center gap-1 rounded-lg bg-white/20 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/30'
            >
              Ir a Documentos
              <ArrowRight className='h-3.5 w-3.5' />
            </button>
          ) : null}
        </div>

        <div className='hidden items-center gap-2 border-l border-white/30 pl-3 text-xs md:flex'>
          <div className='flex flex-col gap-1.5'>
            <div className='flex items-center gap-1.5'>
              <CheckCircle
                className='h-3.5 w-3.5 flex-shrink-0'
                strokeWidth={2.5}
              />
              <span className='whitespace-nowrap'>Cliente Registrado</span>
            </div>
            <div className='flex items-center gap-1.5'>
              {tieneDocumento ? (
                <CheckCircle
                  className='h-3.5 w-3.5 flex-shrink-0'
                  strokeWidth={2.5}
                />
              ) : (
                <Circle
                  className='h-3.5 w-3.5 flex-shrink-0'
                  strokeWidth={2.5}
                />
              )}
              <span className='whitespace-nowrap'>Documento Cargado</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
