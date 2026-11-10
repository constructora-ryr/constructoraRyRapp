'use client'

import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  AlertCircle,
  Loader2,
  LogOut,
  Monitor,
  Smartphone,
  Tablet,
  type LucideIcon,
} from 'lucide-react'

import { leerUserAgent, type TipoEquipo } from '@/lib/utils/user-agent'
import { cn } from '@/shared/utils/helpers'

import {
  useCerrarOtrasSesiones,
  useCerrarSesion,
  useMisSesiones,
} from '../hooks/usePerfil'
import type { SesionReal } from '../types'

import { estilos as e } from './estilos'

const ICONO: Record<TipoEquipo, LucideIcon> = {
  celular: Smartphone,
  tableta: Tablet,
  computador: Monitor,
}

/** Activa en los últimos 5 minutos → "Activa ahora" */
const ACTIVA_MS = 5 * 60 * 1000

const haceCuanto = (iso: string) =>
  formatDistanceToNow(new Date(iso), { addSuffix: true, locale: es })

function FilaSesion({
  sesion,
  cerrando,
  onCerrar,
}: {
  sesion: SesionReal
  cerrando: boolean
  onCerrar: () => void
}) {
  const equipo = leerUserAgent(sesion.user_agent)
  const Icono = ICONO[equipo.tipo]
  const activaAhora =
    sesion.es_actual ||
    Date.now() - new Date(sesion.ultima_actividad).getTime() < ACTIVA_MS

  return (
    <li className='flex items-center gap-3 px-5 py-3.5'>
      <span
        className={cn(
          'relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl',
          sesion.es_actual
            ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm shadow-emerald-500/25'
            : 'bg-slate-100 text-slate-600 dark:bg-slate-700/60 dark:text-slate-300'
        )}
      >
        <Icono className='h-5 w-5' />
        {activaAhora && !sesion.es_actual ? (
          <span className='absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-800' />
        ) : null}
      </span>
      <div className='min-w-0 flex-1'>
        <p className='flex flex-wrap items-center gap-x-2 gap-y-0.5'>
          <span className='text-sm font-semibold text-slate-900 dark:text-white'>
            {equipo.sistema} · {equipo.navegador}
          </span>
          {sesion.es_actual ? (
            <span className='rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30'>
              Este dispositivo
            </span>
          ) : null}
        </p>
        <p className='mt-0.5 text-xs text-slate-500 dark:text-slate-400'>
          {activaAhora
            ? 'Activa ahora'
            : `Activa ${haceCuanto(sesion.ultima_actividad)}`}
          {sesion.ip ? ` · IP ${sesion.ip}` : ''} · Inició{' '}
          {haceCuanto(sesion.creada)}
        </p>
      </div>
      {!sesion.es_actual ? (
        <button
          type='button'
          onClick={onCerrar}
          disabled={cerrando}
          className='inline-flex h-9 flex-shrink-0 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-50 dark:text-rose-400 dark:hover:bg-rose-500/10'
        >
          {cerrando ? (
            <Loader2 className='h-3.5 w-3.5 animate-spin' />
          ) : (
            <LogOut className='h-3.5 w-3.5' />
          )}
          <span className='hidden sm:inline'>Cerrar sesión</span>
          <span className='sm:hidden'>Cerrar</span>
        </button>
      ) : null}
    </li>
  )
}

/** Sesiones reales de la cuenta (auth.sessions), una por dispositivo */
export function ListaSesiones() {
  const { data: sesiones = [], isLoading, error, refetch } = useMisSesiones()
  const cerrar = useCerrarSesion()
  const cerrarOtras = useCerrarOtrasSesiones()
  const otras = sesiones.filter(s => !s.es_actual).length

  return (
    <section className={e.tarjeta} aria-labelledby='sesiones-titulo'>
      <div
        className={`${e.cabecera} flex flex-wrap items-start justify-between gap-3`}
      >
        <div>
          <h2 id='sesiones-titulo' className={e.titulo}>
            Dónde tienes la sesión abierta
          </h2>
          <p className={e.subtitulo}>
            Si no reconoces un dispositivo, ciérralo y cambia tu contraseña.
          </p>
        </div>
        {otras > 0 ? (
          <button
            type='button'
            onClick={() => cerrarOtras.mutate()}
            disabled={cerrarOtras.isPending}
            className='inline-flex h-9 items-center gap-1.5 rounded-lg border border-rose-200 px-3 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-50 disabled:opacity-50 dark:border-rose-500/30 dark:text-rose-300 dark:hover:bg-rose-500/10'
          >
            {cerrarOtras.isPending ? (
              <Loader2 className='h-3.5 w-3.5 animate-spin' />
            ) : (
              <LogOut className='h-3.5 w-3.5' />
            )}
            Cerrar las demás ({otras})
          </button>
        ) : null}
      </div>

      {isLoading ? (
        <ul
          className='divide-y divide-slate-100 dark:divide-slate-700/50'
          aria-busy='true'
        >
          {[1, 2].map(i => (
            <li key={i} className='flex items-center gap-3 px-5 py-3.5'>
              <span className='h-10 w-10 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-700/60' />
              <span className='h-4 w-48 animate-pulse rounded bg-slate-100 dark:bg-slate-700/60' />
            </li>
          ))}
        </ul>
      ) : error ? (
        <div className='flex items-center justify-between gap-3 px-5 py-4 text-sm text-rose-700 dark:text-rose-300'>
          <span className='flex items-center gap-2'>
            <AlertCircle className='h-4 w-4' />
            No se pudieron cargar las sesiones.
          </span>
          <button
            type='button'
            onClick={() => refetch()}
            className='font-semibold underline-offset-2 hover:underline'
          >
            Reintentar
          </button>
        </div>
      ) : (
        <ul className='divide-y divide-slate-100 dark:divide-slate-700/50'>
          {sesiones.map(s => (
            <FilaSesion
              key={s.id}
              sesion={s}
              cerrando={cerrar.isPending && cerrar.variables === s.id}
              onCerrar={() => cerrar.mutate(s.id)}
            />
          ))}
        </ul>
      )}
    </section>
  )
}
