'use client'

/**
 * Aviso de los últimos minutos antes de cerrar la sesión por inactividad.
 * Solo muestra: el tiempo y el cierre los maneja useInactividad.
 */

import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, LogOut, MousePointerClick, TimerReset } from 'lucide-react'

import { formatoCuentaRegresiva } from '@/lib/sesion/estado-inactividad'

interface AvisoInactividadProps {
  abierto: boolean
  cerrando: boolean
  restanteMs: number
  /** Duración total del aviso, para el anillo de progreso */
  avisoMs: number
  onSeguir: () => void
  onCerrarSesion: () => void
}

const RADIO = 52
const CIRCUNFERENCIA = 2 * Math.PI * RADIO

export function AvisoInactividad({
  abierto,
  cerrando,
  restanteMs,
  avisoMs,
  onSeguir,
  onCerrarSesion,
}: AvisoInactividadProps) {
  const fraccion = avisoMs > 0 ? Math.min(restanteMs / avisoMs, 1) : 0
  const urgente = restanteMs <= 60_000

  return (
    <AnimatePresence>
      {abierto ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm'
        >
          <motion.div
            role='alertdialog'
            aria-modal='true'
            aria-labelledby='aviso-inactividad-titulo'
            aria-describedby='aviso-inactividad-texto'
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className='w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900'
          >
            <div className='relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 px-5 pb-5 pt-6 text-center text-white dark:from-amber-600 dark:via-orange-700 dark:to-rose-800'>
              <span className='pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/15 blur-2xl' />
              <h2
                id='aviso-inactividad-titulo'
                className='relative text-xl font-bold'
              >
                ¿Sigues ahí?
              </h2>
              <p className='relative mt-1 text-sm text-white/90'>
                Tu sesión se cerrará por inactividad
              </p>
            </div>

            <div className='space-y-5 px-5 pb-5 pt-6'>
              <div className='relative mx-auto h-36 w-36'>
                <svg viewBox='0 0 120 120' className='h-full w-full -rotate-90'>
                  {/* Atributos SVG directos: el trazo toma el color del texto */}
                  <circle
                    cx='60'
                    cy='60'
                    r={RADIO}
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='10'
                    className='text-slate-100 dark:text-slate-800'
                  />
                  <circle
                    cx='60'
                    cy='60'
                    r={RADIO}
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='10'
                    strokeLinecap='round'
                    strokeDasharray={CIRCUNFERENCIA}
                    strokeDashoffset={CIRCUNFERENCIA * (1 - fraccion)}
                    style={{ transition: 'stroke-dashoffset 1s linear' }}
                    className={
                      urgente
                        ? 'text-rose-500'
                        : 'text-amber-500 dark:text-amber-400'
                    }
                  />
                </svg>
                <div className='absolute inset-0 flex flex-col items-center justify-center'>
                  {cerrando ? (
                    <Loader2 className='h-8 w-8 animate-spin text-rose-500' />
                  ) : (
                    <>
                      <span
                        className={`text-3xl font-extrabold tabular-nums ${
                          urgente
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {formatoCuentaRegresiva(restanteMs)}
                      </span>
                      <span className='text-xs text-slate-500 dark:text-slate-400'>
                        restantes
                      </span>
                    </>
                  )}
                </div>
              </div>

              <p
                id='aviso-inactividad-texto'
                className='text-center text-sm text-slate-600 dark:text-slate-300'
              >
                {cerrando
                  ? 'Cerrando sesión…'
                  : 'Por seguridad cerramos la sesión cuando el equipo queda desatendido. Lo que no hayas guardado se perderá.'}
              </p>

              <div className='flex flex-col gap-2'>
                <button
                  type='button'
                  autoFocus
                  onClick={onSeguir}
                  disabled={cerrando}
                  className='inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all hover:brightness-110 disabled:opacity-60 dark:from-emerald-700 dark:to-teal-700'
                >
                  <MousePointerClick className='h-4 w-4' />
                  Seguir trabajando
                </button>
                <button
                  type='button'
                  onClick={onCerrarSesion}
                  disabled={cerrando}
                  className='inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-60 dark:text-slate-300 dark:hover:bg-slate-800'
                >
                  <LogOut className='h-4 w-4' />
                  Cerrar sesión ahora
                </button>
              </div>

              <p className='flex items-center justify-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500'>
                <TimerReset className='h-3.5 w-3.5' />
                El tiempo se comparte entre todas tus pestañas abiertas
              </p>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
