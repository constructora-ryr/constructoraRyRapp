'use client'

/**
 * Crear una nueva contraseña desde el enlace del correo. Mismo marco que el
 * login; requisitos visibles en vivo. Lógica en useRestablecerContrasena.
 */

import { useState } from 'react'

import {
  AlertCircle,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  LockKeyhole,
} from 'lucide-react'

import { useRouter } from 'next/navigation'

import {
  AvisoAuth,
  BotonAuth,
  CampoAuth,
  EncabezadoAuth,
  PantallaAuth,
} from '@/components/auth/pantalla-auth'
import { PASSWORD_REQUIREMENTS } from '@/lib/validations/password'
import { Cargador } from '@/shared/components/carga'
import { cn } from '@/shared/utils/helpers'

import { useRestablecerContrasena } from './useRestablecerContrasena'

const REQUISITOS = [
  {
    texto: `Al menos ${PASSWORD_REQUIREMENTS.minLength} caracteres`,
    cumple: (p: string) => p.length >= PASSWORD_REQUIREMENTS.minLength,
  },
  { texto: 'Una letra mayúscula', cumple: (p: string) => /[A-Z]/.test(p) },
  { texto: 'Una letra minúscula', cumple: (p: string) => /[a-z]/.test(p) },
  { texto: 'Un número', cumple: (p: string) => /\d/.test(p) },
]

const BARRA = {
  weak: { ancho: 'w-1/4', color: 'bg-rose-500', texto: 'Débil' },
  medium: { ancho: 'w-2/4', color: 'bg-amber-500', texto: 'Aceptable' },
  strong: { ancho: 'w-3/4', color: 'bg-emerald-500', texto: 'Fuerte' },
  'very-strong': {
    ancho: 'w-full',
    color: 'bg-emerald-600',
    texto: 'Muy fuerte',
  },
} as const

export default function RestablecerContrasenaPage() {
  const r = useRestablecerContrasena()
  const router = useRouter()
  const [ver, setVer] = useState(false)

  const botonVer = (
    <button
      type='button'
      onClick={() => setVer(v => !v)}
      aria-label={ver ? 'Ocultar contraseñas' : 'Mostrar contraseñas'}
      aria-pressed={ver}
      className='flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-800'
    >
      {ver ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
    </button>
  )

  return (
    <PantallaAuth>
      <EncabezadoAuth
        titulo='Crea una nueva contraseña'
        subtitulo='Elige una contraseña segura que no uses en otros sitios.'
      />

      {r.enlace === 'verificando' ? (
        <Cargador tamano='sm' label='Verificando el enlace' className='py-10' />
      ) : r.enlace === 'invalido' ? (
        <div className='space-y-5'>
          <AvisoAuth tono='error' icon={AlertCircle}>
            <p className='font-semibold'>El enlace no es válido o ya expiró</p>
            <p className='mt-0.5'>
              {r.error ||
                'Los enlaces duran 1 hora y solo sirven una vez. Pide uno nuevo desde el inicio de sesión.'}
            </p>
          </AvisoAuth>
          <BotonAuth type='button' onClick={() => router.push('/login')}>
            Volver al inicio de sesión
          </BotonAuth>
        </div>
      ) : r.listo ? (
        <AvisoAuth tono='exito' icon={CheckCircle2}>
          <p className='font-semibold'>¡Contraseña actualizada!</p>
          <p className='mt-0.5'>Te llevamos al inicio de sesión…</p>
        </AvisoAuth>
      ) : (
        <form onSubmit={r.guardar} className='space-y-4'>
          <CampoAuth
            id='nueva-password'
            label='Nueva contraseña'
            icon={Lock}
            type={ver ? 'text' : 'password'}
            autoComplete='new-password'
            value={r.password}
            onChange={e => r.setPassword(e.target.value)}
            disabled={r.guardando}
            autoFocus
            required
            accion={botonVer}
          />

          {r.password ? (
            <div className='space-y-2.5 rounded-xl bg-slate-50 p-3 dark:bg-zinc-900'>
              <div className='flex items-center gap-3'>
                <div className='h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-zinc-700'>
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      BARRA[r.validacion.strength].ancho,
                      BARRA[r.validacion.strength].color
                    )}
                  />
                </div>
                <span className='text-xs font-semibold text-slate-600 dark:text-slate-300'>
                  {BARRA[r.validacion.strength].texto}
                </span>
              </div>
              <ul className='grid grid-cols-1 gap-1 sm:grid-cols-2'>
                {REQUISITOS.map(req => {
                  const ok = req.cumple(r.password)
                  return (
                    <li
                      key={req.texto}
                      className={cn(
                        'flex items-center gap-1.5 text-xs',
                        ok
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-slate-500 dark:text-slate-400'
                      )}
                    >
                      <Check
                        className={cn('h-3.5 w-3.5', !ok && 'opacity-30')}
                      />
                      {req.texto}
                    </li>
                  )
                })}
              </ul>
            </div>
          ) : null}

          <CampoAuth
            id='confirmar-password'
            label='Confirma la contraseña'
            icon={LockKeyhole}
            type={ver ? 'text' : 'password'}
            autoComplete='new-password'
            value={r.confirmacion}
            onChange={e => r.setConfirmacion(e.target.value)}
            disabled={r.guardando}
            required
            ayuda={
              r.confirmacion && !r.coinciden ? (
                <span className='font-medium text-rose-600 dark:text-rose-400'>
                  Las contraseñas no coinciden
                </span>
              ) : null
            }
          />

          {r.error ? (
            <AvisoAuth tono='error' icon={AlertCircle}>
              {r.error}
            </AvisoAuth>
          ) : null}

          <BotonAuth type='submit' disabled={!r.puedeGuardar}>
            {r.guardando ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin' />
                Guardando…
              </>
            ) : (
              'Guardar contraseña'
            )}
          </BotonAuth>
        </form>
      )}
    </PantallaAuth>
  )
}
