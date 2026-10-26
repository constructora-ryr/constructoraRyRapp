'use client'

/**
 * Ajuste "Cierre por inactividad": minutos sin actividad tras los que se
 * cierra la sesión en todos los equipos. Solo un Administrador lo cambia.
 */

import { Loader2, ShieldCheck, Timer } from 'lucide-react'
import { toast } from 'sonner'

import { useAuth } from '@/contexts/auth-context'
import { cn } from '@/shared/utils/helpers'

import {
  useActualizarLimiteInactividad,
  useLimiteInactividad,
} from '../hooks/useLimiteInactividad'
import { OPCIONES_INACTIVIDAD_MIN } from '../services/configuracion-sistema.service'

function etiqueta(min: number): string {
  if (min < 60) return `${min} min`
  const h = min / 60
  return Number.isInteger(h) ? `${h} h` : `${Math.floor(h)} h ${min % 60} min`
}

export function TarjetaInactividad() {
  const { perfil } = useAuth()
  const esAdmin = perfil?.rol === 'Administrador'
  const { minutos, cargando } = useLimiteInactividad()
  const actualizar = useActualizarLimiteInactividad()

  const elegir = (min: number) => {
    if (min === minutos || actualizar.isPending) return
    actualizar.mutate(min, {
      onSuccess: () =>
        toast.success('Cierre por inactividad actualizado', {
          description: `Las sesiones se cerrarán tras ${etiqueta(min)} sin actividad.`,
        }),
      onError: err =>
        toast.error('No se pudo guardar', { description: err.message }),
    })
  }

  return (
    <section className='overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800/60'>
      <div className='flex items-start gap-3 p-4 sm:p-5'>
        <span className='flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-orange-500/25'>
          <Timer className='h-5 w-5' />
        </span>
        <div className='min-w-0 flex-1'>
          <h2 className='font-bold text-gray-900 dark:text-white'>
            Cierre por inactividad
          </h2>
          <p className='mt-0.5 text-sm text-gray-600 dark:text-gray-300'>
            Tiempo sin actividad tras el cual se cierra la sesión. Cinco minutos
            antes aparece un aviso para seguir trabajando.
          </p>
        </div>
        {actualizar.isPending ? (
          <Loader2 className='h-5 w-5 animate-spin text-gray-400' />
        ) : null}
      </div>

      <div className='flex flex-wrap gap-2 border-t border-gray-100 px-4 py-3 dark:border-gray-700/60 sm:px-5'>
        {OPCIONES_INACTIVIDAD_MIN.map(min => {
          const activa = min === minutos
          return (
            <button
              key={min}
              type='button'
              disabled={!esAdmin || cargando || actualizar.isPending}
              aria-pressed={activa}
              onClick={() => elegir(min)}
              className={cn(
                'min-w-[4.5rem] rounded-xl px-3 py-2 text-sm font-semibold transition-all disabled:cursor-not-allowed',
                activa
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-orange-500/25 dark:from-amber-600 dark:to-orange-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-60 dark:bg-gray-900/60 dark:text-gray-200 dark:hover:bg-gray-700'
              )}
            >
              {etiqueta(min)}
            </button>
          )
        })}
      </div>

      <p className='flex items-center gap-1.5 bg-gray-50 px-4 py-2.5 text-xs text-gray-500 dark:bg-gray-900/40 dark:text-gray-400 sm:px-5'>
        <ShieldCheck className='h-3.5 w-3.5 flex-shrink-0' />
        {esAdmin
          ? 'Aplica a todos los usuarios: a más tardar en 10 minutos en las sesiones ya abiertas.'
          : 'Solo un administrador puede cambiar este ajuste.'}
      </p>
    </section>
  )
}
