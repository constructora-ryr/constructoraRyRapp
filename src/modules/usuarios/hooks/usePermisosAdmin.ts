/**
 * usePermisosAdmin — Lógica para la administración de permisos RBAC
 *
 * Centraliza:
 * - Carga de todos los permisos desde BD (via useTodosLosPermisosQuery)
 * - Agrupación por módulo / acción / rol
 * - Filtros de búsqueda, módulo y rol
 * - Toggle de permisos individuales
 */

'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { toast } from 'sonner'

import { logger } from '@/lib/utils/logger'

import type { PermisoRol } from '../services/permisos.service'
import type { Rol } from '../types'

import {
  useActualizarPermisoMutation,
  useTodosLosPermisosQuery,
} from './usePermisosQuery'

// Orden canónico de roles para las columnas de la matriz
export const ROLES_MATRIZ: Rol[] = [
  'Contabilidad',
  'Administrador de Obra',
  'Gerencia',
]

// Etiquetas de roles para la UI (sin emojis, profesional)
export const ETIQUETA_ROL: Record<Rol, string> = {
  Administrador: 'Administrador',
  Contabilidad: 'Contabilidad',
  'Administrador de Obra': 'Adm. Obra',
  Gerencia: 'Gerencia',
}

// Etiquetas de módulos con capitalización correcta
export const ETIQUETA_MODULO: Record<string, string> = {
  proyectos: 'Proyectos',
  viviendas: 'Viviendas',
  clientes: 'Clientes',
  documentos: 'Documentos',
  negociaciones: 'Negociaciones',
  abonos: 'Abonos',
  renuncias: 'Renuncias',
  usuarios: 'Usuarios',
  auditorias: 'Auditorías',
  reportes: 'Reportes',
  administracion: 'Administración',
}

// Etiquetas de acciones
export const ETIQUETA_ACCION: Record<string, string> = {
  ver: 'Ver',
  crear: 'Crear',
  subir: 'Subir',
  editar: 'Editar',
  eliminar: 'Eliminar',
  archivar: 'Archivar',
  ver_historial: 'Ver historial',
  // Acciones específicas de Clientes
  registrar_interes: 'Registrar interés',
  anotar_historial: 'Agregar nota al historial',
  // Acciones específicas de Abonos
  registrar: 'Registrar abono',
  anular: 'Anular abono',
  // Acciones específicas de Negociaciones
  asignar: 'Asignar vivienda',
  trasladar: 'Trasladar vivienda',
  renunciar: 'Registrar renuncia',
  descuento: 'Aplicar descuento',
  escritura: 'Editar valor escritura',
  ajustar: 'Ajustar cierre financiero',
}

/**
 * Tipo interno para acceder a la matriz:
 * mapa[modulo][accion][rol] = PermisoRol
 */
export type MatrizPermisos = Record<
  string,
  Record<string, Record<string, PermisoRol>>
>

export function usePermisosAdmin() {
  const { data: permisos = [], isLoading, error } = useTodosLosPermisosQuery()

  const actualizarMutation = useActualizarPermisoMutation()

  // IDs de permisos que están siendo guardados en este momento
  const savingIdsRef = useRef<Set<string>>(new Set())
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set())

  const addSaving = useCallback((ids: string[]) => {
    ids.forEach(id => savingIdsRef.current.add(id))
    setSavingIds(new Set(savingIdsRef.current))
  }, [])

  const removeSaving = useCallback((ids: string[]) => {
    ids.forEach(id => savingIdsRef.current.delete(id))
    setSavingIds(new Set(savingIdsRef.current))
  }, [])

  // ── Filtros ──────────────────────────────────────────────────────────────
  const [filtroRol, setFiltroRol] = useState<Rol | 'todos'>('todos')
  const [filtroModulo, setFiltroModulo] = useState<string>('todos')
  const [busqueda, setBusqueda] = useState('')

  // ── Accordion ─────────────────────────────────────────────────────────────
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  const toggleCollapsed = useCallback((modulo: string) => {
    setCollapsed(prev => {
      const next = new Set(prev)
      if (next.has(modulo)) {
        next.delete(modulo)
      } else {
        next.add(modulo)
      }
      return next
    })
  }, [])

  // ── Orden personalizado con localStorage ─────────────────────────────────
  const ORDEN_KEY = 'permisos-modulos-orden'

  const [modulosOrden, setModulosOrden] = useState<string[]>([])

  useEffect(() => {
    try {
      const saved = localStorage.getItem(ORDEN_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as string[]
        if (Array.isArray(parsed)) setModulosOrden(parsed)
      }
    } catch {
      // ignorar error de JSON inválido
    }
  }, [])

  const reordenarModulos = useCallback((newOrder: string[]) => {
    setModulosOrden(newOrder)
    try {
      localStorage.setItem(ORDEN_KEY, JSON.stringify(newOrder))
    } catch {
      // ignorar error de localStorage
    }
  }, [])

  const resetOrden = useCallback(() => {
    setModulosOrden([])
    try {
      localStorage.removeItem(ORDEN_KEY)
    } catch {
      // ignorar
    }
  }, [])

  const tieneOrdenPersonalizado = modulosOrden.length > 0

  // ── Datos derivados ───────────────────────────────────────────────────────

  /** Módulos únicos extraídos de la BD, en orden alfabético */
  const modulos = useMemo(
    () => Array.from(new Set(permisos.map(p => p.modulo))).sort(),
    [permisos]
  )

  /** Roles únicos (excluye Administrador — siempre tiene todo) */
  const roles = useMemo(
    () => ROLES_MATRIZ.filter(r => permisos.some(p => p.rol === r)),
    [permisos]
  )

  /**
   * Mapa de permisos agrupados por módulo → acción → rol
   * para acceso O(1) en la tabla
   */
  const matriz: MatrizPermisos = useMemo(() => {
    const m: MatrizPermisos = {}
    permisos.forEach(p => {
      if (!m[p.modulo]) m[p.modulo] = {}
      if (!m[p.modulo][p.accion]) m[p.modulo][p.accion] = {}
      m[p.modulo][p.accion][p.rol] = p
    })
    return m
  }, [permisos])

  /** Permisos aplicando filtros activos (para calcular contador) */
  const permisosFiltrados = useMemo(() => {
    let resultado = permisos

    if (filtroRol !== 'todos') {
      resultado = resultado.filter(p => p.rol === filtroRol)
    }
    if (filtroModulo !== 'todos') {
      resultado = resultado.filter(p => p.modulo === filtroModulo)
    }
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase()
      resultado = resultado.filter(
        p =>
          p.modulo.toLowerCase().includes(q) ||
          p.accion.toLowerCase().includes(q) ||
          (p.descripcion?.toLowerCase().includes(q) ?? false)
      )
    }

    return resultado
  }, [permisos, filtroRol, filtroModulo, busqueda])

  /** Módulos visibles según filtros, usando orden personalizado cuando aplica */
  const modulosFiltrados = useMemo(() => {
    if (filtroModulo !== 'todos') return [filtroModulo]
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase()
      return modulos.filter(
        m =>
          m.toLowerCase().includes(q) ||
          Object.keys(matriz[m] ?? {}).some(a => a.toLowerCase().includes(q))
      )
    }
    // Aplicar orden personalizado si existe
    if (modulosOrden.length > 0) {
      const ordenSet = modulosOrden.filter(m => modulos.includes(m))
      const noEnOrden = modulos.filter(m => !modulosOrden.includes(m))
      return [...ordenSet, ...noEnOrden]
    }
    return modulos
  }, [modulos, filtroModulo, busqueda, matriz, modulosOrden])

  /** Roles visibles según filtro de rol */
  const rolesFiltrados = useMemo(
    () => (filtroRol === 'todos' ? roles : roles.filter(r => r === filtroRol)),
    [roles, filtroRol]
  )

  const hayFiltrosActivos =
    filtroRol !== 'todos' || filtroModulo !== 'todos' || busqueda.trim() !== ''

  // ── Acciones ──────────────────────────────────────────────────────────────

  function limpiarFiltros() {
    setFiltroRol('todos')
    setFiltroModulo('todos')
    setBusqueda('')
  }

  async function handleToggle(
    id: string,
    permitidoActual: boolean,
    rol: Rol,
    modulo: string,
    accion: string
  ) {
    const nuevoValor = !permitidoActual

    // Regla de dependencia:
    // - Activar cualquier acción ≠ 'ver'  →  activa 'ver' automáticamente si estaba OFF
    // - Desactivar 'ver'                  →  desactiva TODAS las acciones del módulo para ese rol
    const permisosAActualizar: { id: string; permitido: boolean }[] = [
      { id, permitido: nuevoValor },
    ]

    if (nuevoValor && accion !== 'ver') {
      // Activar 'ver' si está desactivado
      const permisoVer = matriz[modulo]?.['ver']?.[rol]
      if (permisoVer && !permisoVer.permitido) {
        permisosAActualizar.push({ id: permisoVer.id, permitido: true })
      }
    } else if (!nuevoValor && accion === 'ver') {
      // Desactivar todas las demás acciones del módulo para este rol
      const accionesDelModulo = Object.entries(matriz[modulo] ?? {})
      for (const [acc, porRol] of accionesDelModulo) {
        if (acc !== 'ver') {
          const permiso = porRol[rol]
          if (permiso?.permitido) {
            permisosAActualizar.push({ id: permiso.id, permitido: false })
          }
        }
      }
    }

    const idsInvolucrados = permisosAActualizar.map(p => p.id)
    addSaving(idsInvolucrados)

    try {
      await Promise.all(
        permisosAActualizar.map(p =>
          actualizarMutation.mutateAsync({
            id: p.id,
            permitido: p.permitido,
            rol,
          })
        )
      )
      const extras = permisosAActualizar.length - 1
      const sufijo =
        extras > 0
          ? ` (${extras} permiso${extras > 1 ? 's' : ''} dependiente${extras > 1 ? 's' : ''} ajustado${extras > 1 ? 's' : ''})`
          : ''
      toast.success(
        `Permiso ${nuevoValor ? 'habilitado' : 'deshabilitado'} correctamente${sufijo}`
      )
    } catch (err) {
      logger.error('Error actualizando permiso:', err)
      toast.error('Error al actualizar el permiso', {
        description: (err as Error).message,
      })
    } finally {
      removeSaving(idsInvolucrados)
    }
  }

  return {
    // Data
    permisos,
    permisosFiltrados,
    matriz,
    modulosTodos: modulos,
    modulosFiltrados,
    roles,
    rolesFiltrados,

    // Estado UI
    isLoading,
    error,
    savingIds,

    // Filtros
    filtroRol,
    filtroModulo,
    busqueda,
    hayFiltrosActivos,
    setFiltroRol,
    setFiltroModulo,
    setBusqueda,
    limpiarFiltros,

    // Accordion
    collapsed,
    toggleCollapsed,

    // Orden DnD
    tieneOrdenPersonalizado,
    reordenarModulos,
    resetOrden,

    // Acciones
    handleToggle,
  }
}
