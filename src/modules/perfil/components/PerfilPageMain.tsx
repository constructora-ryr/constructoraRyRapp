'use client'

/**
 * Mi perfil: encabezado con el color del rol y cinco secciones (la activa
 * queda en la URL: ?tab=seguridad).
 */

import {
  Activity,
  KeyRound,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
} from 'lucide-react'

import { useAuth } from '@/hooks/auth/useAuthQuery'
import {
  DetalleTabs,
  type TabDetalle,
} from '@/shared/components/detalle/DetalleTabs'
import { usePestanaUrl } from '@/shared/hooks/usePestanaUrl'

import { SECCIONES_PERFIL, type SeccionPerfil } from '../types'

import { AccesosRecientes } from './AccesosRecientes'
import { CambiarContrasena } from './CambiarContrasena'
import { EncabezadoPerfil } from './EncabezadoPerfil'
import { ListaSesiones } from './ListaSesiones'
import { SeccionActividad } from './SeccionActividad'
import { SeccionCuenta } from './SeccionCuenta'
import { SeccionPermisos } from './SeccionPermisos'
import { SeccionPreferencias } from './SeccionPreferencias'

const TABS: TabDetalle<SeccionPerfil>[] = [
  { id: 'cuenta', label: 'Mi cuenta', icon: UserRound },
  { id: 'seguridad', label: 'Seguridad', icon: KeyRound },
  { id: 'preferencias', label: 'Preferencias', icon: SlidersHorizontal },
  { id: 'actividad', label: 'Mi actividad', icon: Activity },
  { id: 'permisos', label: 'Mis permisos', icon: ShieldCheck },
]

export function PerfilPageMain() {
  const { perfil } = useAuth()
  const [seccion, setSeccion] = usePestanaUrl<SeccionPerfil>(
    SECCIONES_PERFIL,
    'cuenta'
  )

  return (
    <div className='min-h-screen bg-slate-50 dark:bg-slate-950'>
      <div className='mx-auto max-w-5xl space-y-4 px-4 py-6 sm:px-6 lg:py-8'>
        {perfil ? (
          <EncabezadoPerfil perfil={perfil} />
        ) : (
          <div className='h-48 animate-pulse rounded-3xl bg-slate-200/70 dark:bg-slate-800' />
        )}

        <DetalleTabs
          tabs={TABS}
          activa={seccion}
          onCambiar={setSeccion}
          tema='perfil'
          etiqueta='Secciones de mi perfil'
        />

        <div id={`panel-${seccion}`} role='tabpanel' className='space-y-4'>
          {!perfil ? (
            <div className='h-72 animate-pulse rounded-2xl bg-slate-200/70 dark:bg-slate-800' />
          ) : seccion === 'cuenta' ? (
            <SeccionCuenta key={perfil.fecha_actualizacion} perfil={perfil} />
          ) : seccion === 'seguridad' ? (
            <>
              <ListaSesiones />
              <div className='grid items-start gap-4 lg:grid-cols-2'>
                <CambiarContrasena email={perfil.email} />
                <AccesosRecientes />
              </div>
            </>
          ) : seccion === 'preferencias' ? (
            <SeccionPreferencias />
          ) : seccion === 'actividad' ? (
            <SeccionActividad />
          ) : (
            <SeccionPermisos />
          )}
        </div>
      </div>
    </div>
  )
}
