/**
 * Registro de seguridad: inicios y cierres de sesión, intentos fallidos,
 * bloqueos y cambios de contraseña, agrupados por día.
 */

'use client'

import type { LucideIcon } from 'lucide-react'
import {
  KeyRound,
  Loader2,
  Lock,
  LogIn,
  LogOut,
  ShieldAlert,
  TimerOff,
} from 'lucide-react'

import { Hueso, ZonaEsqueleto } from '@/shared/components/carga'
import { cn } from '@/shared/utils/helpers'

import type { EventoSeguridad } from '../types'
import { agruparPorDia, horaCorta } from '../utils/evento'

const TIPOS: Record<
  string,
  { texto: string; icon: LucideIcon; color: string; alerta?: boolean }
> = {
  login_exitoso: {
    texto: 'inició sesión',
    icon: LogIn,
    color: 'from-emerald-500 to-green-600',
  },
  logout: {
    texto: 'cerró sesión',
    icon: LogOut,
    color: 'from-slate-400 to-slate-600',
  },
  login_fallido: {
    texto: 'falló al iniciar sesión',
    icon: ShieldAlert,
    color: 'from-amber-500 to-orange-600',
    alerta: true,
  },
  cuenta_bloqueada: {
    texto: 'quedó bloqueado por intentos fallidos',
    icon: Lock,
    color: 'from-red-500 to-rose-600',
    alerta: true,
  },
  password_reset_solicitado: {
    texto: 'pidió restablecer la contraseña',
    icon: KeyRound,
    color: 'from-blue-500 to-indigo-600',
  },
  password_reset_completado: {
    texto: 'cambió su contraseña',
    icon: KeyRound,
    color: 'from-blue-500 to-indigo-600',
  },
  session_expirada: {
    texto: 'tuvo la sesión expirada por inactividad',
    icon: TimerOff,
    color: 'from-slate-400 to-slate-600',
  },
}

/** "Chrome · Windows" a partir del user agent */
function dispositivo(ua: string | null): string | null {
  if (!ua) return null
  const nav = /Edg\//.test(ua)
    ? 'Edge'
    : /Chrome\//.test(ua)
      ? 'Chrome'
      : /Firefox\//.test(ua)
        ? 'Firefox'
        : /Safari\//.test(ua)
          ? 'Safari'
          : null
  const so = /Android/.test(ua)
    ? 'Android'
    : /iPhone|iPad/.test(ua)
      ? 'iPhone'
      : /Windows/.test(ua)
        ? 'Windows'
        : /Mac OS/.test(ua)
          ? 'Mac'
          : null
  return [nav, so].filter(Boolean).join(' · ') || null
}

export function ListaSeguridad({
  eventos,
  cargando,
  hayMas,
  cargandoMas,
  cargarMas,
}: {
  eventos: EventoSeguridad[]
  cargando: boolean
  hayMas: boolean
  cargandoMas: boolean
  cargarMas: () => void
}) {
  if (cargando) {
    return (
      <ZonaEsqueleto label='Cargando registro de seguridad'>
        <div className='space-y-3 rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-700/60 dark:bg-slate-800/60'>
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className='flex gap-3'>
              <Hueso className='h-9 w-9 rounded-xl' />
              <Hueso className='h-4 flex-1' />
            </div>
          ))}
        </div>
      </ZonaEsqueleto>
    )
  }

  const dias = agruparPorDia(
    eventos.map(e => ({ ...e, fecha: e.fecha_evento }))
  )

  return (
    <div className='space-y-4'>
      {dias.map(({ dia, eventos: delDia }) => (
        <section
          key={dia}
          className='overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-700/60 dark:bg-slate-800/60'
        >
          <header className='border-b border-slate-100 px-4 py-2.5 dark:border-slate-700/60'>
            <h3 className='text-sm font-bold capitalize text-slate-800 dark:text-slate-100'>
              {dia}
            </h3>
          </header>
          <ul className='divide-y divide-slate-100 dark:divide-slate-700/50'>
            {delDia.map(e => {
              const t = TIPOS[e.tipo] ?? {
                texto: e.tipo,
                icon: ShieldAlert,
                color: 'from-slate-400 to-slate-600',
              }
              const Icon = t.icon
              const equipo = dispositivo(e.user_agent)
              return (
                <li
                  key={e.id}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2.5',
                    t.alerta && 'bg-amber-50/50 dark:bg-amber-500/5'
                  )}
                >
                  <span
                    className={cn(
                      'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white',
                      t.color
                    )}
                  >
                    <Icon className='h-4 w-4' />
                  </span>
                  <div className='min-w-0 flex-1'>
                    <p className='text-sm text-slate-700 dark:text-slate-300'>
                      <span className='font-semibold text-slate-900 dark:text-white'>
                        {e.usuario_email}
                      </span>{' '}
                      {t.texto}
                    </p>
                    {e.ip_address || equipo ? (
                      <p className='text-xs text-slate-400'>
                        {[equipo, e.ip_address && `IP ${e.ip_address}`]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    ) : null}
                  </div>
                  <span className='flex-shrink-0 text-xs tabular-nums text-slate-400'>
                    {horaCorta(e.fecha_evento)}
                  </span>
                </li>
              )
            })}
          </ul>
        </section>
      ))}

      {hayMas ? (
        <div className='flex justify-center'>
          <button
            type='button'
            onClick={cargarMas}
            disabled={cargandoMas}
            className='inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
          >
            {cargandoMas ? <Loader2 className='h-4 w-4 animate-spin' /> : null}
            Cargar más
          </button>
        </div>
      ) : null}
    </div>
  )
}
