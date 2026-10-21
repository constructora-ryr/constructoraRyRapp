/**
 * EditarUsuarioView — Formulario de edición de usuario
 * ✅ Página propia (REGLA #-11)
 * ✅ Datos precargados desde useEditarUsuario
 * ✅ Email en solo lectura (no editable)
 * ✅ Rol en tarjetas, estado segmentado y vista previa en vivo
 * ✅ Uno mismo no puede cambiarse el rol ni el estado (evita quedarse sin acceso)
 */

'use client'

import { motion } from 'framer-motion'
import {
  AlertCircle,
  CalendarPlus,
  Clock,
  Info,
  Loader2,
  LogIn,
  Save,
  ShieldCheck,
  UserCog,
  UserRound,
} from 'lucide-react'

import { useAuth } from '@/contexts/auth-context'
import { formatDateCompact, formatRelativeDate } from '@/lib/utils/date.utils'
import { ListPageHeader } from '@/shared/components/list-page'

import { useEditarUsuario } from '../hooks/useEditarUsuario'
import { getNombreCompleto, type EstadoUsuario, type Rol } from '../types'

import {
  CampoTexto,
  EstadoSelector,
  FormSection,
  formStyles as s,
  RolSelector,
  UsuarioPreview,
} from './UsuarioFormUI'

interface EditarUsuarioViewProps {
  id: string
}

function DatoCuenta({
  icon: Icon,
  label,
  valor,
  detalle,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  valor: string
  detalle?: string
}) {
  return (
    <div className='flex items-start gap-3 py-2.5'>
      <span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-600/20 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-400/20'>
        <Icon className='h-4 w-4' />
      </span>
      <div className='min-w-0'>
        <p className='text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500'>
          {label}
        </p>
        <p className='text-sm font-semibold text-slate-900 dark:text-white'>
          {valor}
        </p>
        {detalle && (
          <p className='truncate text-xs text-slate-500 dark:text-slate-400'>
            {detalle}
          </p>
        )}
      </div>
    </div>
  )
}

export function EditarUsuarioView({ id }: EditarUsuarioViewProps) {
  const {
    usuario,
    form,
    errores,
    cargandoUsuario,
    cargando,
    errorCarga,
    handleChange,
    handleSubmit,
    handleVolver,
  } = useEditarUsuario(id)
  const { user: currentUser } = useAuth()

  const migas = [
    { label: 'Dashboard', href: '/' },
    { label: 'Usuarios', href: '/usuarios' },
    { label: usuario ? getNombreCompleto(usuario) : 'Editar' },
  ]

  // ── Loading ─────────────────────────────────────────────────────────────
  if (cargandoUsuario) {
    return (
      <div className={s.page}>
        <div className={s.content}>
          <div className='h-28 animate-pulse rounded-2xl bg-gradient-to-r from-indigo-200 to-sky-200 dark:from-indigo-900/40 dark:to-sky-900/40' />
          <div className={s.layout}>
            <div className='h-96 animate-pulse rounded-2xl bg-white dark:bg-slate-800/60' />
            <div className='h-72 animate-pulse rounded-2xl bg-white dark:bg-slate-800/60' />
          </div>
        </div>
      </div>
    )
  }

  // ── Error de carga o usuario no encontrado ──────────────────────────────
  if (errorCarga || !usuario) {
    return (
      <div className={s.page}>
        <div className={s.content}>
          <ListPageHeader
            icon={UserCog}
            heroGradient='from-indigo-700 via-indigo-600 to-sky-500'
            title='Editar usuario'
            breadcrumbs={migas}
          />
          <div className={`${s.card} py-12 text-center`}>
            <AlertCircle className='mx-auto mb-3 h-10 w-10 text-rose-400' />
            <p className='text-sm font-semibold text-slate-900 dark:text-white'>
              Usuario no encontrado
            </p>
            <p className='mt-1 text-xs text-slate-500 dark:text-slate-400'>
              El usuario no existe o no tienes permisos para editarlo.
            </p>
            <button
              type='button'
              onClick={handleVolver}
              className={`${s.cancel} mt-5`}
            >
              Volver a Usuarios
            </button>
          </div>
        </div>
      </div>
    )
  }

  const esYo = currentUser?.id === usuario.id
  const ultimoAcceso = usuario.ultimo_acceso ?? usuario.ultimo_login
  const creadoPor =
    'creado_por_nombre' in usuario
      ? (usuario as { creado_por_nombre?: string | null }).creado_por_nombre
      : null

  // ── Formulario ──────────────────────────────────────────────────────────
  return (
    <div className={s.page}>
      <div className={s.content}>
        <ListPageHeader
          icon={UserCog}
          heroGradient='from-indigo-700 via-indigo-600 to-sky-500'
          title='Editar usuario'
          subtitle={usuario.email}
          breadcrumbs={migas}
        />

        <form onSubmit={handleSubmit} noValidate className={s.layout}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${s.card} space-y-7`}
          >
            <FormSection
              icon={UserRound}
              title='Datos personales'
              description='El correo de acceso no se puede cambiar'
            >
              <div className='grid gap-4 sm:grid-cols-2'>
                <CampoTexto
                  id='nombres'
                  label='Nombres'
                  requerido
                  value={form.nombres}
                  onChange={e => handleChange('nombres', e.target.value)}
                  error={errores.nombres}
                />
                <CampoTexto
                  id='apellidos'
                  label='Apellidos'
                  requerido
                  value={form.apellidos}
                  onChange={e => handleChange('apellidos', e.target.value)}
                  error={errores.apellidos}
                />
              </div>
              <div className='grid gap-4 sm:grid-cols-2'>
                <CampoTexto
                  id='email'
                  label='Correo electrónico'
                  value={usuario.email}
                  readOnly
                  disabled
                />
                <CampoTexto
                  id='telefono'
                  label='Teléfono'
                  type='tel'
                  placeholder='+57 300 123 4567'
                  value={form.telefono}
                  onChange={e => handleChange('telefono', e.target.value)}
                />
              </div>
            </FormSection>

            <FormSection
              icon={ShieldCheck}
              title='Rol y acceso'
              description='Qué puede hacer y si puede entrar al sistema'
              gradient='from-violet-500 to-fuchsia-500'
            >
              {esYo && (
                <div className='flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-700/50 dark:bg-amber-950/30 dark:text-amber-300'>
                  <Info className='mt-px h-4 w-4 shrink-0' />
                  Estás editando tu propia cuenta: tu rol y estado solo los
                  puede cambiar otro administrador.
                </div>
              )}
              <RolSelector
                value={form.rol}
                onChange={(rol: Rol) => handleChange('rol', rol)}
                disabled={esYo}
              />
              <EstadoSelector
                value={form.estado}
                onChange={(estado: EstadoUsuario) =>
                  handleChange('estado', estado)
                }
                disabled={esYo}
              />
            </FormSection>

            <div className={s.footer}>
              <button
                type='button'
                onClick={handleVolver}
                className={s.cancel}
                disabled={cargando}
              >
                Cancelar
              </button>
              <button type='submit' disabled={cargando} className={s.submit}>
                {cargando ? (
                  <>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    Guardando…
                  </>
                ) : (
                  <>
                    <Save className='h-4 w-4' />
                    Guardar cambios
                  </>
                )}
              </button>
            </div>
          </motion.div>

          <UsuarioPreview
            nombres={form.nombres}
            apellidos={form.apellidos}
            email={usuario.email}
            telefono={form.telefono}
            rol={form.rol}
            estado={form.estado}
          >
            <div className='rounded-2xl border border-slate-200/80 bg-white px-4 py-2 shadow-sm dark:border-slate-700/60 dark:bg-slate-800/60'>
              <DatoCuenta
                icon={Clock}
                label='Último acceso'
                valor={
                  ultimoAcceso ? formatRelativeDate(ultimoAcceso) : 'Nunca'
                }
                detalle={
                  ultimoAcceso ? formatDateCompact(ultimoAcceso) : undefined
                }
              />
              <div className='border-t border-slate-100 dark:border-slate-700/60' />
              <DatoCuenta
                icon={LogIn}
                label='Primer ingreso'
                valor={
                  usuario.ultimo_login ? 'Ya ingresó' : 'Aún no ha ingresado'
                }
                detalle={
                  usuario.debe_cambiar_password
                    ? 'Debe cambiar su contraseña'
                    : undefined
                }
              />
              <div className='border-t border-slate-100 dark:border-slate-700/60' />
              <DatoCuenta
                icon={CalendarPlus}
                label='Cuenta creada'
                valor={formatDateCompact(usuario.fecha_creacion)}
                detalle={creadoPor ? `por ${creadoPor}` : undefined}
              />
            </div>
          </UsuarioPreview>
        </form>
      </div>
    </div>
  )
}
