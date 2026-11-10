'use client'

import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarDays, ChevronRight, Clock, Mail } from 'lucide-react'

import Link from 'next/link'

import type { Perfil } from '@/hooks/auth/useAuthQuery'
import { rolVisual } from '@/modules/usuarios/config/usuarios-visual'
import {
  AvatarUsuario,
  degradadoRol,
} from '@/shared/components/usuario/AvatarUsuario'
import { cn } from '@/shared/utils/helpers'

const desde = (iso: string) =>
  new Date(iso).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })

/** Encabezado con el color del rol: avatar, nombre, rol y datos de la cuenta */
export function EncabezadoPerfil({ perfil }: { perfil: Perfil }) {
  const rol = rolVisual(perfil.rol)
  const RolIcono = rol.icon
  const nombre = `${perfil.nombres} ${perfil.apellidos}`.trim()
  const ultimoIngreso = perfil.ultimo_login ?? perfil.ultimo_acceso

  return (
    <section
      className={cn(
        'relative isolate overflow-hidden rounded-3xl bg-gradient-to-br p-6 text-white shadow-lg sm:p-8',
        degradadoRol(perfil.rol)
      )}
    >
      <div
        aria-hidden
        className='absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_top_right,black_20%,transparent_70%)]'
      />
      <div
        aria-hidden
        className='absolute -right-16 -top-20 -z-10 h-64 w-64 rounded-full bg-white/15 blur-3xl'
      />
      <RolIcono
        aria-hidden
        className='absolute -bottom-6 right-4 -z-10 h-40 w-40 text-white/10'
      />

      <nav
        aria-label='Ruta'
        className='mb-5 flex items-center gap-1 text-xs text-white/75'
      >
        <Link href='/' className='hover:text-white'>
          Dashboard
        </Link>
        <ChevronRight className='h-3 w-3 text-white/50' />
        <span className='font-semibold text-white'>Mi perfil</span>
      </nav>

      <div className='flex flex-col gap-5 sm:flex-row sm:items-center'>
        <AvatarUsuario
          nombre={nombre}
          rol={perfil.rol}
          iniciales={`${perfil.nombres[0] ?? ''}${perfil.apellidos[0] ?? ''}`.toUpperCase()}
          tamano='xl'
          className='ring-4 ring-white/30'
        />
        <div className='min-w-0'>
          <h1
            className='truncate text-2xl font-bold tracking-tight sm:text-3xl'
            style={{ fontFamily: 'var(--font-jakarta)' }}
          >
            {nombre}
          </h1>
          <span className='mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ring-white/30'>
            <RolIcono className='h-3.5 w-3.5' />
            {rol.label}
          </span>
          <div className='mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-white/90'>
            <span className='inline-flex min-w-0 items-center gap-1.5'>
              <Mail className='h-4 w-4 flex-shrink-0' />
              <span className='truncate'>{perfil.email}</span>
            </span>
            <span className='inline-flex items-center gap-1.5'>
              <CalendarDays className='h-4 w-4' />
              Cuenta desde {desde(perfil.fecha_creacion)}
            </span>
            {ultimoIngreso ? (
              <span className='inline-flex items-center gap-1.5'>
                <Clock className='h-4 w-4' />
                Último ingreso{' '}
                {formatDistanceToNow(new Date(ultimoIngreso), {
                  addSuffix: true,
                  locale: es,
                })}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
