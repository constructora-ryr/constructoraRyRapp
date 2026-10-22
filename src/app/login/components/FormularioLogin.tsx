'use client'

/**
 * Formulario de inicio de sesión. Lógica en useLogin; aquí la UI:
 * correo, contraseña (ver/ocultar, aviso de Bloq Mayús), recordar correo,
 * avisos de error o bloqueo y el botón con sus estados.
 */

import { useEffect, useRef, useState, type KeyboardEvent } from 'react'

import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldAlert,
} from 'lucide-react'

import {
  AvisoAuth,
  BotonAuth,
  CampoAuth,
  EncabezadoAuth,
} from '@/components/auth/pantalla-auth'

import { useLogin } from '../useLogin'

/** De dónde llega el usuario al login, para mostrarle un aviso */
export type AvisoLogin = 'restablecida' | 'sesion-cerrada'

const TEXTO_AVISO: Record<AvisoLogin, string> = {
  restablecida:
    'Tu contraseña se actualizó. Ya puedes iniciar sesión con la nueva.',
  'sesion-cerrada': 'Cerraste sesión correctamente. ¡Hasta pronto!',
}

export function FormularioLogin({
  onOlvideContrasena,
  aviso = null,
}: {
  onOlvideContrasena: (email: string) => void
  aviso?: AvisoLogin | null
}) {
  const l = useLogin()
  const [verContrasena, setVerContrasena] = useState(false)
  const [mayusculas, setMayusculas] = useState(false)
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const ocupado = l.estado !== 'idle'

  // Foco: contraseña si el correo ya está recordado; si no, correo
  const correoRecordado = l.recordar && !!l.email
  useEffect(() => {
    ;(correoRecordado ? passwordRef : emailRef).current?.focus()
  }, [correoRecordado])

  const detectarMayusculas = (e: KeyboardEvent<HTMLInputElement>) =>
    setMayusculas(e.getModifierState?.('CapsLock') ?? false)

  return (
    <>
      <EncabezadoAuth
        titulo='Inicia sesión'
        subtitulo='Ingresa con tu correo y contraseña de la empresa.'
      />

      {aviso && !l.error ? (
        <div className='mb-5'>
          <AvisoAuth tono='exito' icon={CheckCircle2}>
            {TEXTO_AVISO[aviso]}
          </AvisoAuth>
        </div>
      ) : null}

      <form onSubmit={l.enviar} className='space-y-4'>
        <CampoAuth
          ref={emailRef}
          id='login-email'
          label='Correo electrónico'
          icon={Mail}
          type='email'
          autoComplete='username'
          inputMode='email'
          placeholder='tu@correo.com'
          value={l.email}
          onChange={e => l.setEmail(e.target.value)}
          disabled={ocupado}
          required
        />

        <CampoAuth
          ref={passwordRef}
          id='login-password'
          label='Contraseña'
          icon={Lock}
          type={verContrasena ? 'text' : 'password'}
          autoComplete='current-password'
          placeholder='••••••••'
          value={l.password}
          onChange={e => l.setPassword(e.target.value)}
          onKeyUp={detectarMayusculas}
          onKeyDown={detectarMayusculas}
          onBlur={() => setMayusculas(false)}
          disabled={ocupado}
          required
          accion={
            <button
              type='button'
              onClick={() => setVerContrasena(v => !v)}
              aria-label={
                verContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'
              }
              aria-pressed={verContrasena}
              className='flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-800 dark:hover:text-slate-200'
            >
              {verContrasena ? (
                <EyeOff className='h-4 w-4' />
              ) : (
                <Eye className='h-4 w-4' />
              )}
            </button>
          }
          ayuda={
            mayusculas ? (
              <span className='font-medium text-amber-700 dark:text-amber-400'>
                Bloq Mayús está activado
              </span>
            ) : null
          }
        />

        <div className='flex items-center justify-between gap-3'>
          <label className='flex cursor-pointer items-center gap-2 text-sm text-slate-600 dark:text-slate-300'>
            <input
              type='checkbox'
              checked={l.recordar}
              onChange={e => l.setRecordar(e.target.checked)}
              className='h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500 dark:border-zinc-600 dark:bg-zinc-900'
            />
            Recordar mi correo
          </label>
          <button
            type='button'
            onClick={() => onOlvideContrasena(l.email)}
            className='text-sm font-semibold text-red-700 underline-offset-4 hover:underline dark:text-red-400'
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        {l.error ? (
          <AvisoAuth
            tono={l.bloqueado ? 'aviso' : 'error'}
            icon={l.bloqueado ? ShieldAlert : AlertCircle}
          >
            {l.error}
          </AvisoAuth>
        ) : null}

        <BotonAuth type='submit' disabled={ocupado || l.bloqueado}>
          {l.estado === 'enviando' ? (
            <>
              <Loader2 className='h-4 w-4 animate-spin' />
              Verificando…
            </>
          ) : l.estado === 'exito' ? (
            <>
              <CheckCircle2 className='h-4 w-4' />
              ¡Bienvenido!
            </>
          ) : l.bloqueado ? (
            <>
              <ShieldAlert className='h-4 w-4' />
              Bloqueado ({l.minutosRestantes} min)
            </>
          ) : (
            <>
              Ingresar
              <ArrowRight className='h-4 w-4' />
            </>
          )}
        </BotonAuth>
      </form>

      <p className='mt-8 text-center text-xs text-slate-500 dark:text-zinc-400'>
        ¿No tienes cuenta? Pídela al administrador del sistema.
      </p>
    </>
  )
}
