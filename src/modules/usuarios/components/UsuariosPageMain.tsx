/**
 * UsuariosPageMain — Orquestador principal del módulo de usuarios
 * ✅ Mismo patrón que Clientes / Viviendas / Proyectos / Abonos:
 *    encabezado con degradado → tarjetas de estado (filtro) → buscador → tabla
 * ✅ Admin ve además la pestaña "Permisos" (matriz RBAC)
 */

'use client'

import { useCallback } from 'react'

import { motion } from 'framer-motion'
import { Activity, Plus, ShieldCheck, Users } from 'lucide-react'

import { useRouter } from 'next/navigation'

import {
  EstadoFiltroCards,
  ListPageHeader,
  ListSearchToolbar,
  type EstadoFiltroOpcion,
} from '@/shared/components/list-page'
import { FilterDropdown } from '@/shared/components/ui/filter-dropdown'
import { NoResults } from '@/shared/components/ui/NoResults'

import { ESTADO_USUARIO_VISUAL, ROL_VISUAL } from '../config/usuarios-visual'
import {
  useUsuariosList,
  type EstadoUsuarioFiltro,
} from '../hooks/useUsuariosList'
import type { Rol, UsuarioCompleto } from '../types'

import { UsuariosTabla } from './UsuariosTabla'
import { UsuariosTabs } from './UsuariosTabs'

interface UsuariosPageMainProps {
  canCreate?: boolean
  canEdit?: boolean
  isAdmin?: boolean
}

const FILTRO_ACTIVO =
  'border-indigo-400 bg-indigo-50 text-indigo-700 dark:border-indigo-500/70 dark:bg-indigo-900/20 dark:text-indigo-300'

/** Cifra en vidrio dentro del encabezado */
function DatoHero({
  icon: Icon,
  label,
  valor,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  valor: string | number
}) {
  return (
    <div className='flex items-center gap-2.5 rounded-xl bg-white/15 px-3 py-2 ring-1 ring-white/25 backdrop-blur-sm'>
      <Icon className='h-4 w-4 shrink-0 text-white/80' />
      <div className='leading-tight'>
        <p className='text-[10px] font-medium uppercase tracking-wider text-white/70'>
          {label}
        </p>
        <p className='text-sm font-bold tabular-nums text-white'>{valor}</p>
      </div>
    </div>
  )
}

export function UsuariosPageMain({
  canCreate = false,
  canEdit = false,
  isAdmin = false,
}: UsuariosPageMainProps) {
  const router = useRouter()
  const {
    usuarios,
    totalUsuarios,
    conteos,
    conAcceso,
    activosHoy,
    cargandoUsuarios,
    estadoFiltro,
    setEstadoFiltro,
    busqueda,
    setBusqueda,
    rolFiltro,
    setRolFiltro,
    hayFiltrosActivos,
    limpiarFiltros,
  } = useUsuariosList()

  const puedeCrear = canCreate || isAdmin
  const puedeEditar = canEdit || isAdmin

  const irAEditar = useCallback(
    (u: UsuarioCompleto) => router.push(`/usuarios/${u.id}/editar`),
    [router]
  )

  // Las tarjetas de conteo son también el filtro de estado
  const conEstilo = (estado: keyof typeof ESTADO_USUARIO_VISUAL) => {
    const cfg = ESTADO_USUARIO_VISUAL[estado]
    return {
      icon: cfg.icon,
      gradient: cfg.gradient,
      text: cfg.text,
      selected: cfg.selected,
    }
  }
  const opcionesEstado: EstadoFiltroOpcion<EstadoUsuarioFiltro>[] = [
    {
      value: 'Todos',
      label: 'Todos',
      count: conteos.Todos,
      icon: Users,
      gradient: 'from-indigo-500 to-sky-600',
      text: 'text-indigo-700 dark:text-indigo-400',
      selected:
        'border-indigo-400 bg-indigo-50/80 ring-2 ring-indigo-400/40 dark:border-indigo-500/60 dark:bg-indigo-500/10',
    },
    {
      value: 'Activo',
      label: 'Activos',
      count: conteos.Activo,
      ...conEstilo('Activo'),
    },
    {
      value: 'Pendiente',
      label: 'Invitaciones',
      count: conteos.Pendiente,
      ...conEstilo('Pendiente'),
    },
    {
      value: 'Inactivo',
      label: 'Inactivos',
      count: conteos.Inactivo,
      ...conEstilo('Inactivo'),
    },
    {
      value: 'Bloqueado',
      label: 'Bloqueados',
      count: conteos.Bloqueado,
      ...conEstilo('Bloqueado'),
    },
  ]

  const total = usuarios.length
  const resultado =
    total === totalUsuarios
      ? `${totalUsuarios} usuario${totalUsuarios !== 1 ? 's' : ''}`
      : `${total} de ${totalUsuarios} usuarios`

  /** Contenido de la pestaña "Usuarios" */
  const listaContent = (
    <div className='space-y-5'>
      <EstadoFiltroCards
        ariaLabel='Filtrar usuarios por estado'
        total={conteos.Todos}
        opciones={opcionesEstado}
        seleccionado={estadoFiltro}
        onSeleccionar={setEstadoFiltro}
      />

      <ListSearchToolbar
        value={busqueda}
        onChange={setBusqueda}
        placeholder='Buscar por nombre, correo o teléfono…'
        resultado={resultado}
        onLimpiar={hayFiltrosActivos ? limpiarFiltros : undefined}
      >
        <FilterDropdown
          value={rolFiltro}
          placeholder='Todos los roles'
          allValue=''
          activeClassName={FILTRO_ACTIVO}
          options={[
            { value: '', label: 'Todos los roles' },
            ...(Object.keys(ROL_VISUAL) as Rol[]).map(r => ({
              value: r,
              label: ROL_VISUAL[r].label,
            })),
          ]}
          onChange={v => setRolFiltro(v as Rol | '')}
        />
      </ListSearchToolbar>

      {cargandoUsuarios ? (
        <div className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700/60 dark:bg-slate-800/60'>
          <div className='h-11 animate-pulse bg-gradient-to-r from-indigo-200 to-sky-200 dark:from-indigo-900/40 dark:to-sky-900/40' />
          <div className='space-y-3 p-4'>
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className='h-12 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-700/50'
              />
            ))}
          </div>
        </div>
      ) : total === 0 ? (
        <NoResults
          moduleName='usuarios'
          onLimpiarFiltros={limpiarFiltros}
          mensaje={
            hayFiltrosActivos
              ? 'Ningún usuario coincide con los filtros aplicados'
              : 'Aún no hay usuarios registrados'
          }
        />
      ) : (
        <UsuariosTabla
          usuarios={usuarios}
          canEdit={puedeEditar}
          onEditar={irAEditar}
        />
      )}
    </div>
  )

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/60 to-sky-50/60 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950'>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className='mx-auto max-w-[1400px] space-y-5 px-4 py-6 sm:px-6 lg:py-8'
      >
        <ListPageHeader
          icon={Users}
          heroGradient='from-indigo-700 via-indigo-600 to-sky-500 dark:from-indigo-800 dark:via-indigo-700 dark:to-sky-700'
          title='Usuarios'
          subtitle='Accesos, roles y permisos del sistema'
          breadcrumbs={[
            { label: 'Dashboard', href: '/' },
            { label: 'Usuarios' },
          ]}
          actions={
            <>
              {!cargandoUsuarios && (
                <div className='flex flex-wrap gap-2'>
                  <DatoHero
                    icon={ShieldCheck}
                    label='Con acceso'
                    valor={`${conAcceso} de ${totalUsuarios}`}
                  />
                  <DatoHero
                    icon={Activity}
                    label='Entraron hoy'
                    valor={activosHoy}
                  />
                </div>
              )}
              {puedeCrear && (
                <button
                  type='button'
                  onClick={() => router.push('/usuarios/nueva')}
                  className='inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 shadow-lg shadow-indigo-900/20 transition-all hover:-translate-y-0.5 hover:bg-indigo-50 hover:shadow-xl'
                >
                  <Plus className='h-4 w-4' />
                  Nuevo usuario
                </button>
              )}
            </>
          }
        />

        {/* Admin ve también la matriz de permisos */}
        {isAdmin ? <UsuariosTabs>{listaContent}</UsuariosTabs> : listaContent}
      </motion.div>
    </div>
  )
}
