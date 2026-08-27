'use client'

import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { motion } from 'framer-motion'
import {
  ChevronRight,
  LayoutDashboard,
  Laptop,
  Loader2,
  Monitor,
  Shield,
  Smartphone,
  Tablet,
  User,
} from 'lucide-react'

import Link from 'next/link'

import {
  useSesionesActivas,
  useRevocarSesion,
} from '../hooks/useSesionesActivas'
import type { SesionActiva } from '../services/sesiones.service'

// ── Helpers ───────────────────────────────────────────────────────────────────

function DeviceIcon({ dispositivo }: { dispositivo: string | null }) {
  const d = dispositivo?.toLowerCase() ?? ''
  if (d.includes('iphone') || d.includes('android'))
    return <Smartphone className='h-5 w-5 text-white' />
  if (d.includes('ipad')) return <Tablet className='h-5 w-5 text-white' />
  if (d.includes('mac') || d.includes('windows') || d.includes('linux'))
    return <Monitor className='h-5 w-5 text-white' />
  return <Laptop className='h-5 w-5 text-white' />
}

function SesionRow({
  sesion,
  onRevocar,
  isRevoking,
}: {
  sesion: SesionActiva
  onRevocar: (id: string) => void
  isRevoking: boolean
}) {
  const lastSeen = formatDistanceToNow(new Date(sesion.last_seen_at), {
    addSuffix: true,
    locale: es,
  })

  return (
    <div className='group flex items-center justify-between gap-4 px-4 py-3.5 transition-colors duration-150 hover:bg-indigo-50/40 dark:hover:bg-indigo-900/10'>
      <div className='flex min-w-0 items-center gap-3'>
        {/* Ícono de dispositivo */}
        <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shadow-indigo-500/25'>
          <DeviceIcon dispositivo={sesion.dispositivo} />
        </div>

        <div className='min-w-0'>
          <div className='flex items-center gap-2'>
            <span className='truncate text-sm font-semibold text-gray-900 dark:text-white'>
              {sesion.dispositivo ?? 'Dispositivo desconocido'}
            </span>
            {sesion.es_actual && (
              <span className='inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'>
                Esta sesión
              </span>
            )}
          </div>
          <p className='mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400'>
            {sesion.navegador ?? 'Navegador desconocido'} ·{' '}
            {sesion.ip ?? 'IP desconocida'} · Activo {lastSeen}
          </p>
        </div>
      </div>

      {!sesion.es_actual && (
        <button
          onClick={() => onRevocar(sesion.id)}
          disabled={isRevoking}
          className='shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold text-red-600 transition-all hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300'
        >
          {isRevoking ? (
            <Loader2 className='h-3.5 w-3.5 animate-spin' />
          ) : (
            'Cerrar sesión'
          )}
        </button>
      )}
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────

export function PerfilPageMain() {
  const { data: sesiones, isLoading, error, refetch } = useSesionesActivas()
  const {
    mutate: revocar,
    isPending,
    variables: revocandoId,
  } = useRevocarSesion()

  const sesionesOrdenadas = [...(sesiones ?? [])].sort(
    (a, b) => Number(b.es_actual) - Number(a.es_actual)
  )

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950'>
      <div className='mx-auto max-w-4xl space-y-4 px-4 py-6 sm:px-6 lg:px-8'>
        {/* ── Header hero ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 p-6 shadow-2xl shadow-indigo-500/20 dark:from-indigo-700 dark:via-purple-700 dark:to-fuchsia-800'
        >
          <div className='bg-grid-white/10 absolute inset-0 [mask-image:linear-gradient(0deg,transparent,black,transparent)]' />
          <div className='relative z-10'>
            {/* Breadcrumb */}
            <div className='mb-3 flex items-center gap-1.5'>
              <LayoutDashboard className='h-3 w-3 text-indigo-200' />
              <Link
                href='/dashboard'
                className='text-xs text-indigo-200 transition-colors hover:text-white'
              >
                Dashboard
              </Link>
              <ChevronRight className='h-3 w-3 text-indigo-300/60' />
              <span className='text-xs font-semibold text-white'>
                Mi Perfil
              </span>
            </div>

            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm'>
                  <User className='h-6 w-6 text-white' />
                </div>
                <div>
                  <h1 className='text-2xl font-bold text-white'>Mi Perfil</h1>
                  <p className='text-xs text-indigo-100 dark:text-indigo-200'>
                    Gestiona tu cuenta y sesiones activas • Seguridad
                  </p>
                </div>
              </div>

              <span className='inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md'>
                <Shield className='h-3.5 w-3.5' />
                {sesionesOrdenadas.length}{' '}
                {sesionesOrdenadas.length === 1
                  ? 'sesión activa'
                  : 'sesiones activas'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* ── Card de sesiones ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className='overflow-hidden rounded-xl border border-gray-200/50 bg-white/80 shadow-lg backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-800/80'
        >
          {/* Encabezado de la card */}
          <div className='border-b border-gray-100 px-4 py-3.5 dark:border-gray-700'>
            <h2 className='text-sm font-semibold text-gray-900 dark:text-white'>
              Sesiones activas
            </h2>
            <p className='mt-0.5 text-xs text-gray-500 dark:text-gray-400'>
              Dispositivos donde tienes sesión iniciada. Puedes cerrar las que
              no reconoces.
            </p>
          </div>

          {/* Contenido */}
          {isLoading ? (
            <div className='flex items-center justify-center py-12'>
              <Loader2 className='h-6 w-6 animate-spin text-indigo-500' />
            </div>
          ) : error ? (
            <div className='flex flex-col items-center gap-3 py-12 text-center'>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                No se pudieron cargar las sesiones.
              </p>
              <button
                onClick={() => refetch()}
                className='rounded-lg px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20'
              >
                Reintentar
              </button>
            </div>
          ) : sesionesOrdenadas.length === 0 ? (
            <div className='py-12 text-center'>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                No hay sesiones activas registradas.
              </p>
            </div>
          ) : (
            <div className='divide-y divide-gray-100 dark:divide-gray-700/50'>
              {sesionesOrdenadas.map(sesion => (
                <SesionRow
                  key={sesion.id}
                  sesion={sesion}
                  onRevocar={id => revocar(id)}
                  isRevoking={isPending && revocandoId === sesion.id}
                />
              ))}
            </div>
          )}

          {/* Footer: cerrar todas */}
          {sesionesOrdenadas.length > 1 && (
            <div className='border-t border-gray-100 px-4 py-3 dark:border-gray-700'>
              <button
                disabled={isPending}
                onClick={() => {
                  sesionesOrdenadas
                    .filter(s => !s.es_actual)
                    .forEach(s => revocar(s.id))
                }}
                className='text-xs font-semibold text-red-600 transition-colors hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300'
              >
                Cerrar todas las otras sesiones
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
