/**
 * NuevoUsuarioView — Formulario de creación de usuario
 * ✅ Página propia (REGLA #-11)
 * ✅ Validación inline
 * ✅ Rol en tarjetas + vista previa en vivo
 * ✅ Muestra contraseña temporal si fue generada
 */

'use client'

import { useState } from 'react'

import { motion } from 'framer-motion'
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  KeyRound,
  Loader2,
  Mail,
  MailCheck,
  ShieldCheck,
  UserPlus,
  UserRound,
} from 'lucide-react'
import { toast } from 'sonner'

import { ListPageHeader } from '@/shared/components/list-page'

import { useNuevoUsuario } from '../hooks/useNuevoUsuario'
import type { Rol } from '../types'

import {
  CampoTexto,
  FormSection,
  formStyles as s,
  RolSelector,
  UsuarioPreview,
} from './UsuarioFormUI'

const MIGAS = [
  { label: 'Dashboard', href: '/' },
  { label: 'Usuarios', href: '/usuarios' },
  { label: 'Nuevo' },
]

/** Pantalla de éxito (contraseña temporal o invitación enviada) */
function Exito({
  icono: Icono,
  titulo,
  subtitulo,
  children,
  onContinuar,
}: {
  icono: React.ComponentType<{ className?: string }>
  titulo: string
  subtitulo: string
  children: React.ReactNode
  onContinuar: () => void
}) {
  return (
    <div className={s.page}>
      <div className='mx-auto max-w-lg px-4 py-10 sm:py-16'>
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.25 }}
          className='overflow-hidden rounded-3xl border border-slate-200/80 bg-white text-center shadow-xl dark:border-slate-700/60 dark:bg-slate-800/80'
        >
          <div className='relative bg-gradient-to-br from-emerald-500 via-teal-500 to-sky-500 px-6 pb-12 pt-8'>
            <span
              aria-hidden
              className='absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/15 blur-2xl'
            />
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 260 }}
              className='relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-white ring-1 ring-white/40'
            >
              <Icono className='h-8 w-8' />
            </motion.span>
            <h1 className='relative mt-4 text-xl font-bold text-white'>
              {titulo}
            </h1>
            <p className='relative mt-1 text-sm text-white/85'>{subtitulo}</p>
          </div>
          <div className='-mt-6 space-y-5 px-6 pb-6'>
            {children}
            <button type='button' onClick={onContinuar} className={s.submit}>
              <CheckCircle2 className='h-4 w-4' />
              Ir al listado de usuarios
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export function NuevoUsuarioView() {
  const {
    form,
    errores,
    cargando,
    passwordTemporal,
    invitacionEnviada,
    handleChange,
    handleSubmit,
    handleVolver,
    handlePasswordConfirmado,
  } = useNuevoUsuario()
  const [copiada, setCopiada] = useState(false)

  const copiarPassword = async () => {
    if (!passwordTemporal) return
    try {
      await navigator.clipboard.writeText(passwordTemporal)
      setCopiada(true)
      toast.success('Contraseña copiada')
    } catch {
      toast.error('No se pudo copiar')
    }
  }

  // ── Éxito: contraseña temporal ──────────────────────────────────────────
  if (passwordTemporal) {
    return (
      <Exito
        icono={KeyRound}
        titulo='¡Usuario creado!'
        subtitulo='Comparte la contraseña temporal de forma segura'
        onContinuar={handlePasswordConfirmado}
      >
        <div className='rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/60'>
          <p className='text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400'>
            Contraseña temporal
          </p>
          <div className='mt-2 flex items-center gap-2'>
            <code className='flex-1 select-all rounded-xl bg-white px-3 py-2.5 font-mono text-lg font-bold tracking-wider text-slate-900 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-white dark:ring-slate-700'>
              {passwordTemporal}
            </code>
            <button
              type='button'
              onClick={copiarPassword}
              aria-label='Copiar contraseña'
              className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-sky-500 text-white shadow-md transition-transform hover:scale-105'
            >
              {copiada ? (
                <CheckCircle2 className='h-5 w-5' />
              ) : (
                <Copy className='h-5 w-5' />
              )}
            </button>
          </div>
          <p className='mt-3 flex items-start gap-1.5 text-left text-xs text-amber-700 dark:text-amber-400'>
            <AlertCircle className='mt-px h-3.5 w-3.5 shrink-0' />
            Solo se muestra una vez y no se puede recuperar. El usuario deberá
            cambiarla al iniciar sesión.
          </p>
        </div>
      </Exito>
    )
  }

  // ── Éxito: invitación enviada ───────────────────────────────────────────
  if (invitacionEnviada) {
    return (
      <Exito
        icono={MailCheck}
        titulo='¡Invitación enviada!'
        subtitulo='El usuario configurará su propia contraseña'
        onContinuar={handlePasswordConfirmado}
      >
        <div className='rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/60'>
          <p className='text-xs text-slate-500 dark:text-slate-400'>
            Se envió un correo a
          </p>
          <p className='mt-0.5 break-all text-base font-bold text-slate-900 dark:text-white'>
            {invitacionEnviada}
          </p>
          <p className='mt-3 flex items-start gap-1.5 text-left text-xs text-sky-700 dark:text-sky-400'>
            <Mail className='mt-px h-3.5 w-3.5 shrink-0' />
            El enlace vence en 24 horas. Si no le llega, que revise el spam o
            reenvía la invitación desde la lista de usuarios.
          </p>
        </div>
      </Exito>
    )
  }

  // ── Formulario ──────────────────────────────────────────────────────────
  return (
    <div className={s.page}>
      <div className={s.content}>
        <ListPageHeader
          icon={UserPlus}
          heroGradient='from-indigo-700 via-indigo-600 to-sky-500 dark:from-indigo-800 dark:via-indigo-700 dark:to-sky-700'
          title='Nuevo usuario'
          subtitle='Crea una cuenta de acceso al sistema'
          breadcrumbs={MIGAS}
        />

        <form onSubmit={handleSubmit} noValidate className={s.layout}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${s.card} space-y-7`}
          >
            {errores.general ? (
              <div className='flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-800/50 dark:bg-rose-950/30 dark:text-rose-300'>
                <AlertCircle className='mt-0.5 h-4 w-4 shrink-0' />
                <span>{errores.general}</span>
              </div>
            ) : null}

            <FormSection
              icon={UserRound}
              title='Datos personales'
              description='Cómo se verá el usuario en el sistema'
            >
              <div className='grid gap-4 sm:grid-cols-2'>
                <CampoTexto
                  id='nombres'
                  label='Nombres'
                  requerido
                  placeholder='Juan Carlos'
                  value={form.nombres}
                  onChange={e => handleChange('nombres', e.target.value)}
                  error={errores.nombres}
                />
                <CampoTexto
                  id='apellidos'
                  label='Apellidos'
                  requerido
                  placeholder='Pérez Gómez'
                  value={form.apellidos}
                  onChange={e => handleChange('apellidos', e.target.value)}
                  error={errores.apellidos}
                />
              </div>
              <div className='grid gap-4 sm:grid-cols-2'>
                <CampoTexto
                  id='email'
                  label='Correo electrónico'
                  requerido
                  type='email'
                  autoComplete='off'
                  placeholder='usuario@empresa.com'
                  value={form.email}
                  onChange={e => handleChange('email', e.target.value)}
                  error={errores.email}
                  hint='Aquí le llegará la invitación'
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
              title='Rol'
              description='Define a qué módulos y acciones tendrá acceso'
              gradient='from-violet-500 to-fuchsia-500'
            >
              <RolSelector
                value={form.rol}
                onChange={(rol: Rol) => handleChange('rol', rol)}
              />
            </FormSection>

            <div className='flex items-start gap-2.5 rounded-xl border border-sky-200 bg-sky-50 p-3.5 dark:border-sky-800/50 dark:bg-sky-950/30'>
              <Mail className='mt-0.5 h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400' />
              <p className='text-xs text-sky-800 dark:text-sky-300'>
                Se enviará un correo de invitación para que el usuario cree su
                propia contraseña. El enlace vence en <strong>24 horas</strong>.
              </p>
            </div>

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
                    Creando…
                  </>
                ) : (
                  <>
                    <UserPlus className='h-4 w-4' />
                    Crear usuario
                  </>
                )}
              </button>
            </div>
          </motion.div>

          <UsuarioPreview
            nombres={form.nombres}
            apellidos={form.apellidos}
            email={form.email}
            telefono={form.telefono}
            rol={form.rol}
          />
        </form>
      </div>
    </div>
  )
}
