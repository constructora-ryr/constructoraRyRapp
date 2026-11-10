'use client'

import { useId, useState } from 'react'

import { Eye, EyeOff, KeyRound, Loader2 } from 'lucide-react'

import { PasswordStrengthIndicator } from '@/components/password-strength-indicator'
import { validatePasswordStrength } from '@/lib/validations/password'

import { useCambiarContrasena } from '../hooks/usePerfil'

import { estilos as e } from './estilos'

function CampoContrasena({
  label,
  value,
  onChange,
  autoComplete,
  error,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  autoComplete: 'current-password' | 'new-password'
  error?: string | null
}) {
  const [visible, setVisible] = useState(false)
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className={e.etiqueta}>
        {label}
      </label>
      <div className='relative'>
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={ev => onChange(ev.target.value)}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          className={`${e.campo} pr-11 ${error ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-200 dark:border-rose-500/60' : ''}`}
        />
        <button
          type='button'
          onClick={() => setVisible(v => !v)}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          className='absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white'
        >
          {visible ? (
            <EyeOff className='h-4 w-4' />
          ) : (
            <Eye className='h-4 w-4' />
          )}
        </button>
      </div>
      {error ? (
        <p className='mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400'>
          {error}
        </p>
      ) : null}
    </div>
  )
}

/** Cambio de contraseña pidiendo la actual (sin pasar por el correo) */
export function CambiarContrasena({ email }: { email: string }) {
  const [actual, setActual] = useState('')
  const [nueva, setNueva] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  const [cerrarOtras, setCerrarOtras] = useState(true)
  const cambiar = useCambiarContrasena()

  const valida = validatePasswordStrength(nueva).isValid
  const noCoinciden = confirmacion.length > 0 && confirmacion !== nueva
  const listo = actual.length > 0 && valida && confirmacion === nueva

  const limpiar = () => {
    setActual('')
    setNueva('')
    setConfirmacion('')
    cambiar.reset()
  }

  return (
    <form
      className={e.tarjeta}
      onSubmit={ev => {
        ev.preventDefault()
        if (!listo || cambiar.isPending) return
        cambiar.mutate(
          { actual, nueva, email, cerrarOtras },
          { onSuccess: limpiar }
        )
      }}
    >
      <div className={`${e.cabecera} flex items-start gap-3`}>
        <span className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-sm shadow-violet-500/25'>
          <KeyRound className='h-5 w-5' />
        </span>
        <div>
          <h2 className={e.titulo}>Cambiar contraseña</h2>
          <p className={e.subtitulo}>
            Te pedimos la actual para confirmar que eres tú.
          </p>
        </div>
      </div>

      <div className='space-y-4 p-5'>
        <CampoContrasena
          label='Contraseña actual'
          value={actual}
          onChange={v => {
            setActual(v)
            if (cambiar.isError) cambiar.reset()
          }}
          autoComplete='current-password'
          error={cambiar.error?.message}
        />
        <div className='grid gap-4 sm:grid-cols-2'>
          <div>
            <CampoContrasena
              label='Nueva contraseña'
              value={nueva}
              onChange={setNueva}
              autoComplete='new-password'
            />
          </div>
          <CampoContrasena
            label='Repite la nueva'
            value={confirmacion}
            onChange={setConfirmacion}
            autoComplete='new-password'
            error={noCoinciden ? 'No coincide con la nueva contraseña' : null}
          />
        </div>
        {nueva ? <PasswordStrengthIndicator password={nueva} /> : null}

        <label className='flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700'>
          <input
            type='checkbox'
            checked={cerrarOtras}
            onChange={ev => setCerrarOtras(ev.target.checked)}
            className='mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400 dark:border-slate-600'
          />
          <span>
            <span className='block text-sm font-medium text-slate-900 dark:text-white'>
              Cerrar sesión en los demás dispositivos
            </span>
            <span className='block text-xs text-slate-500 dark:text-slate-400'>
              Recomendado si crees que alguien más conoce tu contraseña.
            </span>
          </span>
        </label>
      </div>

      <div className='flex justify-end border-t border-slate-100 px-5 py-3 dark:border-slate-700/60'>
        <button
          type='submit'
          disabled={!listo || cambiar.isPending}
          className={e.botonPrincipal}
        >
          {cambiar.isPending ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : null}
          {cambiar.isPending ? 'Cambiando…' : 'Cambiar contraseña'}
        </button>
      </div>
    </form>
  )
}
