'use client'

import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  AlertTriangle,
  KeyRound,
  Lock,
  LogIn,
  LogOut,
  ShieldAlert,
  TimerOff,
  Unlock,
  type LucideIcon,
} from 'lucide-react'

import { leerUserAgent } from '@/lib/utils/user-agent'
import { cn } from '@/shared/utils/helpers'

import { useMisAccesos } from '../hooks/usePerfil'

import { estilos as e } from './estilos'

const TIPOS: Record<string, { texto: string; icon: LucideIcon; tono: string }> =
  {
    login_exitoso: {
      texto: 'Inicio de sesión',
      icon: LogIn,
      tono: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    },
    login_fallido: {
      texto: 'Intento fallido de inicio de sesión',
      icon: ShieldAlert,
      tono: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
    },
    logout: {
      texto: 'Cierre de sesión',
      icon: LogOut,
      tono: 'bg-slate-100 text-slate-600 dark:bg-slate-700/60 dark:text-slate-300',
    },
    session_expirada: {
      texto: 'Sesión cerrada por inactividad',
      icon: TimerOff,
      tono: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    },
    password_reset_solicitado: {
      texto: 'Pidió restablecer la contraseña',
      icon: KeyRound,
      tono: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
    },
    password_reset_completado: {
      texto: 'Contraseña cambiada',
      icon: KeyRound,
      tono: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
    },
    cuenta_bloqueada: {
      texto: 'Cuenta bloqueada',
      icon: Lock,
      tono: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
    },
    cuenta_desbloqueada: {
      texto: 'Cuenta desbloqueada',
      icon: Unlock,
      tono: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    },
  }

const SEMANA_MS = 7 * 24 * 60 * 60 * 1000

/** Últimos inicios de sesión, intentos fallidos y cambios de contraseña */
export function AccesosRecientes() {
  const { data: accesos = [], isLoading } = useMisAccesos()
  const fallidosSemana = accesos.filter(
    a =>
      a.tipo === 'login_fallido' &&
      Date.now() - new Date(a.fecha_evento).getTime() < SEMANA_MS
  ).length

  return (
    <section className={e.tarjeta} aria-labelledby='accesos-titulo'>
      <div className={e.cabecera}>
        <h2 id='accesos-titulo' className={e.titulo}>
          Accesos recientes
        </h2>
        <p className={e.subtitulo}>
          Los últimos ingresos a tu cuenta y cambios de seguridad.
        </p>
      </div>

      {fallidosSemana > 0 ? (
        <p className='mx-5 mt-4 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800 ring-1 ring-inset ring-amber-200 dark:bg-amber-500/10 dark:text-amber-200 dark:ring-amber-500/30'>
          <AlertTriangle className='mt-0.5 h-4 w-4 flex-shrink-0' />
          <span>
            {fallidosSemana === 1
              ? 'Hubo 1 intento fallido'
              : `Hubo ${fallidosSemana} intentos fallidos`}{' '}
            de entrar a tu cuenta esta semana. Si no fuiste tú, cambia tu
            contraseña.
          </span>
        </p>
      ) : null}

      {isLoading ? (
        <div className='space-y-3 p-5' aria-busy='true'>
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className='h-10 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-700/50'
            />
          ))}
        </div>
      ) : accesos.length === 0 ? (
        <p className='px-5 py-8 text-center text-sm text-slate-500 dark:text-slate-400'>
          Aún no hay accesos registrados.
        </p>
      ) : (
        <ol className='divide-y divide-slate-100 dark:divide-slate-700/50'>
          {accesos.map(a => {
            const tipo = TIPOS[a.tipo] ?? TIPOS.logout
            const Icono = tipo.icon
            const equipo = a.user_agent ? leerUserAgent(a.user_agent) : null
            return (
              <li key={a.id} className='flex items-center gap-3 px-5 py-3'>
                <span
                  className={cn(
                    'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg',
                    tipo.tono
                  )}
                >
                  <Icono className='h-4 w-4' />
                </span>
                <div className='min-w-0 flex-1'>
                  <p className='text-sm font-medium text-slate-900 dark:text-white'>
                    {TIPOS[a.tipo]?.texto ?? a.tipo}
                  </p>
                  <p className='truncate text-xs text-slate-500 dark:text-slate-400'>
                    {[
                      equipo ? `${equipo.sistema} · ${equipo.navegador}` : null,
                      a.ip_address ? `IP ${a.ip_address}` : null,
                    ]
                      .filter(Boolean)
                      .join(' · ') || 'Sin datos del dispositivo'}
                  </p>
                </div>
                <time
                  dateTime={a.fecha_evento}
                  title={new Date(a.fecha_evento).toLocaleString('es-CO')}
                  className='flex-shrink-0 text-xs text-slate-500 dark:text-slate-400'
                >
                  {formatDistanceToNow(new Date(a.fecha_evento), {
                    addSuffix: true,
                    locale: es,
                  })}
                </time>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
