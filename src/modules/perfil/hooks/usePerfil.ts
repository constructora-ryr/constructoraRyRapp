'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { authKeys } from '@/hooks/auth/useAuthQuery'

import {
  actualizarMiPerfil,
  cambiarContrasena,
  cerrarOtrasSesiones,
  cerrarSesion,
  miActividad,
  misAccesos,
  misSesiones,
} from '../services/perfil.service'

export const perfilKeys = {
  sesiones: ['perfil', 'sesiones'] as const,
  accesos: ['perfil', 'accesos'] as const,
  actividad: ['perfil', 'actividad'] as const,
}

export function useMisSesiones() {
  return useQuery({
    queryKey: perfilKeys.sesiones,
    queryFn: misSesiones,
    staleTime: 30_000,
  })
}

export function useMisAccesos() {
  return useQuery({
    queryKey: perfilKeys.accesos,
    queryFn: () => misAccesos(),
    staleTime: 60_000,
  })
}

export function useMiActividad(activo: boolean) {
  return useQuery({
    queryKey: perfilKeys.actividad,
    queryFn: () => miActividad(),
    enabled: activo,
    staleTime: 60_000,
  })
}

export function useCerrarSesion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: cerrarSesion,
    onSuccess: () => toast.success('Sesión cerrada en ese dispositivo'),
    onError: (e: Error) => toast.error(e.message),
    onSettled: () => qc.invalidateQueries({ queryKey: perfilKeys.sesiones }),
  })
}

export function useCerrarOtrasSesiones() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: cerrarOtrasSesiones,
    onSuccess: n =>
      toast.success(
        n === 1
          ? 'Se cerró 1 sesión en otro dispositivo'
          : `Se cerraron ${n} sesiones en otros dispositivos`
      ),
    onError: (e: Error) => toast.error(e.message),
    onSettled: () => qc.invalidateQueries({ queryKey: perfilKeys.sesiones }),
  })
}

export function useActualizarPerfil() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: actualizarMiPerfil,
    onSuccess: () => {
      toast.success('Datos actualizados')
      // La barra lateral y el encabezado leen el perfil de aquí
      qc.invalidateQueries({ queryKey: [...authKeys.all, 'perfil'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useCambiarContrasena() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: cambiarContrasena,
    onSuccess: cerradas => {
      toast.success(
        cerradas > 0
          ? 'Contraseña cambiada. Se cerró la sesión en los demás dispositivos'
          : 'Contraseña cambiada'
      )
      qc.invalidateQueries({ queryKey: perfilKeys.sesiones })
      qc.invalidateQueries({ queryKey: perfilKeys.accesos })
    },
    // El error se muestra en el formulario, junto al campo
  })
}
