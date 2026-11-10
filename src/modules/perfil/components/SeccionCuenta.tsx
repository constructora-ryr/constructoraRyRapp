'use client'

import { useState } from 'react'

import { Loader2, Lock, Save } from 'lucide-react'

import type { Perfil } from '@/hooks/auth/useAuthQuery'
import { rolVisual } from '@/modules/usuarios/config/usuarios-visual'
import { cn } from '@/shared/utils/helpers'

import { useActualizarPerfil } from '../hooks/usePerfil'
import type { DatosCuenta } from '../types'

import { estilos as e } from './estilos'

const inicial = (p: Perfil): DatosCuenta => ({
  nombres: p.nombres ?? '',
  apellidos: p.apellidos ?? '',
  telefono: p.telefono ?? '',
})

/** Datos propios editables; correo y rol solo los cambia un administrador */
export function SeccionCuenta({ perfil }: { perfil: Perfil }) {
  const [datos, setDatos] = useState<DatosCuenta>(() => inicial(perfil))
  const actualizar = useActualizarPerfil()
  const rol = rolVisual(perfil.rol)
  const RolIcono = rol.icon

  const original = inicial(perfil)
  const hayCambios = (Object.keys(datos) as (keyof DatosCuenta)[]).some(
    k => datos[k].trim() !== original[k].trim()
  )
  const faltan = !datos.nombres.trim() || !datos.apellidos.trim()

  const campo = (k: keyof DatosCuenta) => ({
    value: datos[k],
    onChange: (ev: React.ChangeEvent<HTMLInputElement>) =>
      setDatos(d => ({ ...d, [k]: ev.target.value })),
  })

  return (
    <form
      className={e.tarjeta}
      onSubmit={ev => {
        ev.preventDefault()
        if (hayCambios && !faltan) actualizar.mutate(datos)
      }}
    >
      <div className={e.cabecera}>
        <h2 className={e.titulo}>Datos personales</h2>
        <p className={e.subtitulo}>
          Así te ven tus compañeros en el historial, los documentos y la
          auditoría.
        </p>
      </div>

      <div className='grid gap-4 p-5 sm:grid-cols-2'>
        <label>
          <span className={e.etiqueta}>Nombres</span>
          <input
            {...campo('nombres')}
            autoComplete='given-name'
            maxLength={100}
            className={e.campo}
          />
        </label>
        <label>
          <span className={e.etiqueta}>Apellidos</span>
          <input
            {...campo('apellidos')}
            autoComplete='family-name'
            maxLength={100}
            className={e.campo}
          />
        </label>
        <label>
          <span className={e.etiqueta}>
            Teléfono{' '}
            <span className='font-normal text-slate-500 dark:text-slate-400'>
              (opcional)
            </span>
          </span>
          <input
            {...campo('telefono')}
            type='tel'
            inputMode='tel'
            autoComplete='tel'
            placeholder='300 123 4567'
            maxLength={20}
            className={e.campo}
          />
        </label>
        <div>
          <span className={e.etiqueta}>Correo</span>
          <div
            className={cn(
              e.campo,
              'flex items-center gap-2 bg-slate-50 text-slate-600 dark:bg-slate-900/30 dark:text-slate-300'
            )}
          >
            <Lock className='h-4 w-4 flex-shrink-0 text-slate-400' />
            <span className='truncate'>{perfil.email}</span>
          </div>
        </div>
        <div className='sm:col-span-2'>
          <span className={e.etiqueta}>Rol</span>
          <div className='flex flex-wrap items-center gap-2'>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset',
                rol.badge
              )}
            >
              <RolIcono className='h-3.5 w-3.5' />
              {rol.label}
            </span>
            <span className='text-xs text-slate-500 dark:text-slate-400'>
              El correo y el rol los cambia un administrador desde Usuarios.
            </span>
          </div>
        </div>
      </div>

      <div className='flex flex-col-reverse gap-2 border-t border-slate-100 px-5 py-3 dark:border-slate-700/60 sm:flex-row sm:items-center sm:justify-end'>
        {faltan ? (
          <p className='text-xs text-rose-600 dark:text-rose-400 sm:mr-auto'>
            Nombres y apellidos son obligatorios
          </p>
        ) : null}
        <button
          type='button'
          disabled={!hayCambios || actualizar.isPending}
          onClick={() => setDatos(original)}
          className={e.botonSecundario}
        >
          Deshacer cambios
        </button>
        <button
          type='submit'
          disabled={!hayCambios || faltan || actualizar.isPending}
          className={e.botonPrincipal}
        >
          {actualizar.isPending ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <Save className='h-4 w-4' />
          )}
          Guardar
        </button>
      </div>
    </form>
  )
}
