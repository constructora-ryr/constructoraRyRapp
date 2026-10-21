/**
 * ============================================
 * HOOK: useUsuariosList
 * ============================================
 *
 * Lógica de UI para la lista de usuarios: búsqueda, filtro por estado
 * (tarjetas) y por rol. Trae la lista completa una vez (son pocos usuarios)
 * y filtra en memoria. Consume useUsuariosListQuery — NO hace fetch directo.
 */

'use client'

import { useCallback, useMemo, useState } from 'react'

import {
  estadoVisibleUsuario,
  type EstadoUsuarioVisible,
} from '../config/usuarios-visual'
import type { Rol } from '../types'

import { useUsuariosListQuery } from './useUsuariosQuery'

export type EstadoUsuarioFiltro = EstadoUsuarioVisible | 'Todos'

export function useUsuariosList() {
  // ── Filtros ──────────────────────────────────────────────────────────
  const [busqueda, setBusqueda] = useState('')
  const [rolFiltro, setRolFiltro] = useState<Rol | ''>('')
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoUsuarioFiltro>('Todos')

  // ── Query (sin filtros: la lista es corta) ─────────────────────────────
  const {
    data: todos = [],
    isLoading: cargandoUsuarios,
    error: errorUsuarios,
  } = useUsuariosListQuery()

  // Búsqueda + rol: base de los conteos de las tarjetas
  const usuariosSinEstado = useMemo(() => {
    const termino = busqueda.toLowerCase().trim()
    return todos.filter(u => {
      if (rolFiltro && u.rol !== rolFiltro) return false
      if (!termino) return true
      return (
        `${u.nombres} ${u.apellidos}`.toLowerCase().includes(termino) ||
        u.email.toLowerCase().includes(termino) ||
        (u.telefono ?? '').includes(termino)
      )
    })
  }, [todos, busqueda, rolFiltro])

  const usuarios = useMemo(
    () =>
      estadoFiltro === 'Todos'
        ? usuariosSinEstado
        : usuariosSinEstado.filter(
            u => estadoVisibleUsuario(u) === estadoFiltro
          ),
    [usuariosSinEstado, estadoFiltro]
  )

  const conteos = useMemo(() => {
    const c: Record<EstadoUsuarioFiltro, number> = {
      Todos: usuariosSinEstado.length,
      Activo: 0,
      Pendiente: 0,
      Inactivo: 0,
      Bloqueado: 0,
    }
    usuariosSinEstado.forEach(u => {
      c[estadoVisibleUsuario(u)]++
    })
    return c
  }, [usuariosSinEstado])

  // Encabezado (sin filtros): quién puede entrar y quién entró hoy
  const conAcceso = useMemo(
    () => todos.filter(u => estadoVisibleUsuario(u) === 'Activo').length,
    [todos]
  )
  const activosHoy = useMemo(() => {
    const hoy = new Date().toDateString()
    return todos.filter(
      u => u.ultimo_acceso && new Date(u.ultimo_acceso).toDateString() === hoy
    ).length
  }, [todos])

  const limpiarFiltros = useCallback(() => {
    setBusqueda('')
    setRolFiltro('')
    setEstadoFiltro('Todos')
  }, [])

  const hayFiltrosActivos =
    busqueda.trim() !== '' || rolFiltro !== '' || estadoFiltro !== 'Todos'

  return {
    // Datos
    usuarios,
    totalUsuarios: todos.length,
    conteos,
    conAcceso,
    activosHoy,

    // Estados de carga
    cargandoUsuarios,
    errorUsuarios,

    // Filtros
    busqueda,
    setBusqueda,
    rolFiltro,
    setRolFiltro,
    estadoFiltro,
    setEstadoFiltro,
    hayFiltrosActivos,
    limpiarFiltros,
  }
}
