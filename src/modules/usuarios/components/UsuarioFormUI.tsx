/**
 * Piezas compartidas por los formularios de Nuevo y Editar usuario:
 * sección con ícono, campo de texto, selector de rol en tarjetas, selector de
 * estado y la tarjeta de vista previa del usuario.
 */

'use client'

import type { ReactNode } from 'react'

import { Check, Mail, Phone, type LucideIcon } from 'lucide-react'

import { cn } from '@/shared/utils/helpers'

import {
  ESTADO_USUARIO_VISUAL,
  ROL_VISUAL,
  rolVisual,
} from '../config/usuarios-visual'
import { ROLES_UI, type EstadoUsuario, type Rol } from '../types'

// ── Estilos ──────────────────────────────────────────────────────────────────
export const formStyles = {
  page: 'min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/60 to-sky-50/60 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950',
  content: 'mx-auto max-w-6xl space-y-5 px-4 py-6 sm:px-6 lg:py-8',
  layout: 'grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]',
  card: 'rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-700/60 dark:bg-slate-800/60 sm:p-6',
  input:
    'h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900/60 dark:text-white dark:focus:border-indigo-500 dark:focus:ring-indigo-900',
  inputError:
    'border-rose-400 focus:border-rose-400 focus:ring-rose-200 dark:border-rose-500/70 dark:focus:ring-rose-900',
  label:
    'mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300',
  error: 'mt-1 text-xs font-medium text-rose-600 dark:text-rose-400',
  hint: 'mt-1 text-xs text-slate-500 dark:text-slate-400',
  footer:
    'flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 dark:border-slate-700/60 sm:flex-row sm:justify-end',
  cancel:
    'inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700',
  submit:
    'inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 px-6 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:translate-y-0 disabled:opacity-60',
}

// ── Sección con ícono ────────────────────────────────────────────────────────
export function FormSection({
  icon: Icon,
  title,
  description,
  gradient = 'from-indigo-500 to-sky-500',
  children,
}: {
  icon: LucideIcon
  title: string
  description?: string
  gradient?: string
  children: ReactNode
}) {
  return (
    <section className='space-y-4'>
      <div className='flex items-center gap-3'>
        <span
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm',
            gradient
          )}
        >
          <Icon className='h-4 w-4' />
        </span>
        <div>
          <h2 className='text-sm font-bold text-slate-900 dark:text-white'>
            {title}
          </h2>
          {description && (
            <p className='text-xs text-slate-500 dark:text-slate-400'>
              {description}
            </p>
          )}
        </div>
      </div>
      {children}
    </section>
  )
}

// ── Campo de texto ───────────────────────────────────────────────────────────
export function CampoTexto({
  id,
  label,
  requerido,
  error,
  hint,
  ...input
}: {
  id: string
  label: string
  requerido?: boolean
  error?: string
  hint?: string
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={id} className={formStyles.label}>
        {label}
        {requerido && <span className='ml-0.5 text-rose-500'>*</span>}
      </label>
      <input
        id={id}
        aria-invalid={!!error}
        className={cn(formStyles.input, error && formStyles.inputError)}
        {...input}
      />
      {error ? (
        <p className={formStyles.error}>{error}</p>
      ) : hint ? (
        <p className={formStyles.hint}>{hint}</p>
      ) : null}
    </div>
  )
}

// ── Selector de rol en tarjetas ──────────────────────────────────────────────
export function RolSelector({
  value,
  onChange,
  disabled,
}: {
  value: Rol
  onChange: (rol: Rol) => void
  disabled?: boolean
}) {
  return (
    <div
      role='radiogroup'
      aria-label='Rol del usuario'
      className='grid gap-3 sm:grid-cols-2'
    >
      {ROLES_UI.map(r => {
        const v = ROL_VISUAL[r.value]
        const Icono = v.icon
        const activo = value === r.value
        return (
          <button
            key={r.value}
            type='button'
            role='radio'
            aria-checked={activo}
            disabled={disabled}
            onClick={() => onChange(r.value)}
            className={cn(
              'group relative flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none',
              activo
                ? v.selected
                : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900/40 dark:hover:border-slate-600'
            )}
          >
            <span
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm transition-transform group-hover:scale-105',
                v.gradient
              )}
            >
              <Icono className='h-5 w-5' />
            </span>
            <span className='min-w-0'>
              <span
                className={cn(
                  'block text-sm font-bold',
                  activo ? v.text : 'text-slate-900 dark:text-white'
                )}
              >
                {r.label}
              </span>
              <span className='block text-xs text-slate-500 dark:text-slate-400'>
                {r.descripcion}
              </span>
            </span>
            {activo && (
              <span
                className={cn(
                  'absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br text-white',
                  v.gradient
                )}
              >
                <Check className='h-3 w-3' strokeWidth={3} />
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

// ── Selector de estado (segmentado) ──────────────────────────────────────────
const ESTADOS: { value: EstadoUsuario; descripcion: string }[] = [
  { value: 'Activo', descripcion: 'Puede entrar al sistema' },
  { value: 'Inactivo', descripcion: 'Sin acceso hasta reactivarlo' },
  { value: 'Bloqueado', descripcion: 'Bloqueado por seguridad' },
]

export function EstadoSelector({
  value,
  onChange,
  disabled,
}: {
  value: EstadoUsuario
  onChange: (estado: EstadoUsuario) => void
  disabled?: boolean
}) {
  return (
    <div
      role='radiogroup'
      aria-label='Estado del usuario'
      className='grid gap-2 sm:grid-cols-3'
    >
      {ESTADOS.map(e => {
        const v = ESTADO_USUARIO_VISUAL[e.value]
        const Icono = v.icon
        const activo = value === e.value
        return (
          <button
            key={e.value}
            type='button'
            role='radio'
            aria-checked={activo}
            disabled={disabled}
            onClick={() => onChange(e.value)}
            className={cn(
              'flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:cursor-not-allowed disabled:opacity-60',
              activo
                ? v.selected
                : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900/40 dark:hover:border-slate-600'
            )}
          >
            <span
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white',
                v.gradient,
                !activo && 'opacity-60'
              )}
            >
              <Icono className='h-4 w-4' />
            </span>
            <span className='min-w-0'>
              <span
                className={cn(
                  'block text-sm font-semibold',
                  activo ? v.text : 'text-slate-700 dark:text-slate-200'
                )}
              >
                {v.label}
              </span>
              <span className='block truncate text-[11px] text-slate-500 dark:text-slate-400'>
                {e.descripcion}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}

// ── Vista previa del usuario ─────────────────────────────────────────────────
export function UsuarioPreview({
  nombres,
  apellidos,
  email,
  telefono,
  rol,
  estado,
  children,
}: {
  nombres: string
  apellidos: string
  email: string
  telefono?: string
  rol: Rol
  estado?: EstadoUsuario
  /** Contenido extra bajo la tarjeta (datos de la cuenta, avisos) */
  children?: ReactNode
}) {
  const v = rolVisual(rol)
  const RolIcono = v.icon
  const nombre = `${nombres} ${apellidos}`.trim()
  const iniciales =
    `${nombres.trim()[0] ?? ''}${apellidos.trim()[0] ?? ''}`.toUpperCase() ||
    '?'
  const est = estado ? ESTADO_USUARIO_VISUAL[estado] : null
  const EstIcono = est?.icon

  return (
    <aside className='space-y-4 lg:sticky lg:top-6 lg:self-start'>
      <div className='overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-700/60 dark:bg-slate-800/60'>
        {/* Banda con el color del rol */}
        <div
          className={cn(
            'relative h-20 bg-gradient-to-br transition-colors duration-300',
            v.gradient
          )}
        >
          <span
            aria-hidden
            className='absolute -right-6 -top-8 h-28 w-28 rounded-full bg-white/15 blur-xl'
          />
          <RolIcono
            aria-hidden
            className='absolute bottom-2 right-3 h-12 w-12 text-white/20'
          />
        </div>
        {/* relative: sin él, la banda (posicionada) se pinta encima del avatar */}
        <div className='relative -mt-9 px-5 pb-5'>
          <span
            className={cn(
              'flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full bg-gradient-to-br text-xl font-black text-white shadow-lg ring-4 ring-white transition-colors duration-300 dark:ring-slate-800',
              v.gradient
            )}
          >
            {iniciales}
          </span>
          <p className='mt-3 truncate text-base font-bold text-slate-900 dark:text-white'>
            {nombre || (
              <span className='text-slate-300 dark:text-slate-600'>
                Nombre del usuario
              </span>
            )}
          </p>
          <div className='mt-2 flex flex-wrap gap-1.5'>
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
                v.badge
              )}
            >
              <RolIcono className='h-3.5 w-3.5' />
              {v.label}
            </span>
            {est && EstIcono && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
                  est.badge
                )}
              >
                <EstIcono className='h-3.5 w-3.5' />
                {est.label}
              </span>
            )}
          </div>
          <div className='mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm dark:border-slate-700/60'>
            <p className='flex items-center gap-2 text-slate-600 dark:text-slate-300'>
              <Mail className='h-4 w-4 shrink-0 text-slate-400' />
              <span className='truncate'>
                {email || (
                  <span className='text-slate-300 dark:text-slate-600'>
                    correo@empresa.com
                  </span>
                )}
              </span>
            </p>
            {telefono ? (
              <p className='flex items-center gap-2 text-slate-600 dark:text-slate-300'>
                <Phone className='h-4 w-4 shrink-0 text-slate-400' />
                {telefono}
              </p>
            ) : null}
          </div>
        </div>
      </div>
      {children}
    </aside>
  )
}
