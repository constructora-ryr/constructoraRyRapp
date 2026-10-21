'use client'

import { usePermisosQuery } from '@/modules/usuarios/hooks'

/** Permisos que usa el detalle del cliente (un solo lugar en vez de 8 consultas sueltas) */
export function useClienteDetallePermisos() {
  const { puede, esAdmin } = usePermisosQuery()
  const p = (
    modulo: Parameters<typeof puede>[0],
    accion: Parameters<typeof puede>[1]
  ) => esAdmin || puede(modulo, accion)

  return {
    canEdit: p('clientes', 'editar'),
    canDelete: p('clientes', 'eliminar'),
    canVerHistorial: p('clientes', 'ver_historial'),
    canAsignarVivienda: p('negociaciones', 'asignar'),
    canVerNegociacion: p('negociaciones', 'ver'),
    canVerDocumentos: p('documentos', 'ver'),
    canSubirDocumentos: p('documentos', 'subir'),
  }
}
