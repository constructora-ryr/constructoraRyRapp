'use client'

import { Check, Monitor, Moon, Sun, type LucideIcon } from 'lucide-react'

import { cn } from '@/shared/utils/helpers'

import { useTemaCuenta } from '../hooks/useTemaCuenta'
import type { Tema } from '../types'

import { estilos as e } from './estilos'

const OPCIONES: {
  id: Tema
  label: string
  descripcion: string
  icon: LucideIcon
  /** Miniatura de la app con ese tema */
  vista: { fondo: string; barra: string; tarjeta: string }
}[] = [
  {
    id: 'light',
    label: 'Claro',
    descripcion: 'Fondo blanco, ideal de día',
    icon: Sun,
    vista: { fondo: 'bg-slate-100', barra: 'bg-white', tarjeta: 'bg-white' },
  },
  {
    id: 'dark',
    label: 'Oscuro',
    descripcion: 'Cansa menos la vista de noche',
    icon: Moon,
    vista: {
      fondo: 'bg-slate-900',
      barra: 'bg-slate-800',
      tarjeta: 'bg-slate-800',
    },
  },
  {
    id: 'system',
    label: 'Automático',
    descripcion: 'Sigue el tema del equipo',
    icon: Monitor,
    vista: {
      fondo: 'bg-gradient-to-r from-slate-100 from-50% to-slate-900 to-50%',
      barra: 'bg-white/80',
      tarjeta: 'bg-slate-500/40',
    },
  },
]

export function SeccionPreferencias() {
  const { tema, cambiarTema } = useTemaCuenta()

  return (
    <section className={e.tarjeta} aria-labelledby='tema-titulo'>
      <div className={e.cabecera}>
        <h2 id='tema-titulo' className={e.titulo}>
          Apariencia
        </h2>
        <p className={e.subtitulo}>
          Se guarda en tu cuenta: la verás igual en todos tus dispositivos.
        </p>
      </div>
      <div
        role='radiogroup'
        aria-labelledby='tema-titulo'
        className='grid gap-3 p-5 sm:grid-cols-3'
      >
        {OPCIONES.map(o => {
          const activo = tema === o.id
          const Icono = o.icon
          return (
            <button
              key={o.id}
              type='button'
              role='radio'
              aria-checked={activo}
              onClick={() => cambiarTema(o.id)}
              className={cn(
                'group relative rounded-2xl border p-3 text-left transition-all active:scale-[0.98]',
                activo
                  ? 'border-slate-900 ring-2 ring-slate-900/10 dark:border-white dark:ring-white/20'
                  : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
              )}
            >
              <span
                aria-hidden
                className={cn(
                  'flex h-20 gap-1.5 overflow-hidden rounded-xl p-2 ring-1 ring-inset ring-slate-900/5',
                  o.vista.fondo
                )}
              >
                <span className={cn('w-5 rounded-md', o.vista.barra)} />
                <span className='flex flex-1 flex-col gap-1.5'>
                  <span className='h-4 rounded-md bg-gradient-to-r from-red-500 to-rose-600' />
                  <span className={cn('flex-1 rounded-md', o.vista.tarjeta)} />
                </span>
              </span>
              <span className='mt-3 flex items-center gap-2'>
                <Icono className='h-4 w-4 text-slate-500 dark:text-slate-400' />
                <span className='text-sm font-semibold text-slate-900 dark:text-white'>
                  {o.label}
                </span>
                {activo ? (
                  <span className='ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900'>
                    <Check className='h-3 w-3' />
                  </span>
                ) : null}
              </span>
              <span className='mt-0.5 block text-xs text-slate-500 dark:text-slate-400'>
                {o.descripcion}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
