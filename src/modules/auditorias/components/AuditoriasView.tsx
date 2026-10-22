/**
 * Página de Auditoría: "Actividad" (todo lo que se crea, edita o elimina,
 * registrado por la base de datos) y "Seguridad" (sesiones y accesos).
 */

'use client'

import { useState } from 'react'

import { Activity, ShieldCheck } from 'lucide-react'

import {
  DetalleTabs,
  type TabDetalle,
} from '@/shared/components/detalle/DetalleTabs'
import { ListPageHeader } from '@/shared/components/list-page'

import { useAuditoria, useSeguridad } from '../hooks/useAuditoria'

import { FiltrosActividad } from './FiltrosActividad'
import { ListaActividad } from './ListaActividad'
import { ListaSeguridad } from './ListaSeguridad'

type Pestana = 'actividad' | 'seguridad'

const TABS: TabDetalle<Pestana>[] = [
  { id: 'actividad', label: 'Actividad', icon: Activity },
  { id: 'seguridad', label: 'Seguridad', icon: ShieldCheck },
]

export function AuditoriasView() {
  const [pestana, setPestana] = useState<Pestana>('actividad')
  const a = useAuditoria()
  const seguridad = useSeguridad(pestana === 'seguridad')

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950'>
      <div className='mx-auto max-w-5xl space-y-4 px-4 py-6 sm:px-6 lg:py-8'>
        <ListPageHeader
          icon={ShieldCheck}
          title='Auditoría'
          subtitle='Quién hizo qué y cuándo: cada creación, edición y eliminación queda registrada y no se puede alterar.'
          breadcrumbs={[
            { label: 'Dashboard', href: '/' },
            { label: 'Auditoría' },
          ]}
          heroGradient='from-blue-600 via-indigo-600 to-purple-600'
        />

        <DetalleTabs
          tabs={TABS}
          activa={pestana}
          onCambiar={setPestana}
          tema='auditorias'
          etiqueta='Secciones de auditoría'
        />

        {pestana === 'actividad' ? (
          <>
            <FiltrosActividad
              filtros={a.filtros}
              cambiar={a.cambiar}
              usuarios={a.usuarios}
              hayFiltros={a.hayFiltros}
              limpiar={a.limpiar}
            />
            {a.error ? (
              <p className='rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300'>
                No se pudo cargar la actividad: {a.error.message}
              </p>
            ) : (
              <ListaActividad
                eventos={a.eventos}
                cargando={a.cargando}
                hayMas={a.hayMas}
                cargandoMas={a.cargandoMas}
                cargarMas={a.cargarMas}
                hayFiltros={a.hayFiltros}
                usuarios={a.usuarios}
              />
            )}
          </>
        ) : (
          <ListaSeguridad {...seguridad} />
        )}
      </div>
    </div>
  )
}
