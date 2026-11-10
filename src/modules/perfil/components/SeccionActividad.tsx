'use client'

import { useQuery } from '@tanstack/react-query'
import { AlertCircle } from 'lucide-react'

import { ListaActividad } from '@/modules/auditorias/components/ListaActividad'
import { auditoriaKeys } from '@/modules/auditorias/hooks/useAuditoria'
import { listarUsuarios } from '@/modules/auditorias/services/auditoria.service'

import { useMiActividad } from '../hooks/usePerfil'

import { estilos as e } from './estilos'

/**
 * Lo último que hizo el usuario: la misma lista y ficha de Auditoría,
 * filtrada a sí mismo (la auditoría completa solo la ven administradores).
 */
export function SeccionActividad() {
  const actividad = useMiActividad(true)
  const usuarios = useQuery({
    queryKey: auditoriaKeys.usuarios,
    queryFn: listarUsuarios,
    staleTime: 10 * 60 * 1000,
  })

  return (
    <div className='space-y-3'>
      <div className={`${e.tarjeta} px-5 py-4`}>
        <h2 className={e.titulo}>Mi actividad</h2>
        <p className={e.subtitulo}>
          Tus últimos 30 movimientos: lo que creaste, editaste o eliminaste.
          Toca uno para ver el detalle.
        </p>
      </div>
      {actividad.error ? (
        <p className='flex items-center gap-2 rounded-xl bg-rose-50 p-4 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300'>
          <AlertCircle className='h-4 w-4' />
          No se pudo cargar tu actividad.
        </p>
      ) : (
        <ListaActividad
          eventos={actividad.data ?? []}
          cargando={actividad.isLoading}
          hayMas={false}
          cargandoMas={false}
          cargarMas={() => undefined}
          hayFiltros={false}
          usuarios={usuarios.data ?? []}
        />
      )}
    </div>
  )
}
