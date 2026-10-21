/**
 * PermisosView — Administración de permisos por rol (RBAC)
 *
 * Matriz módulo × acción × rol con interruptores que se guardan al instante.
 *
 * - Tarjetas por rol con su avance (y filtro por rol al hacer clic)
 * - Buscador + filtro de módulo + expandir/colapsar todo
 * - Módulos en acordeón, reordenables arrastrando (orden guardado en el navegador)
 * - Cada módulo muestra cuántas acciones tiene activas cada rol
 * - Administrador siempre tiene acceso total (no editable)
 * - Sin datos hardcodeados: todo viene de la BD vía usePermisosAdmin
 */

'use client'

import { useMemo, useRef, useState } from 'react'

import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronsDownUp,
  ChevronsUpDown,
  CloudCheck,
  GripVertical,
  Loader2,
  Lock,
  Minus,
  RotateCcw,
  Shield,
} from 'lucide-react'

import { ListSearchToolbar } from '@/shared/components/list-page'
import { FilterDropdown } from '@/shared/components/ui/filter-dropdown'
import { cn } from '@/shared/utils/helpers'

import { ROL_VISUAL } from '../config/usuarios-visual'
import {
  ETIQUETA_ACCION,
  ETIQUETA_MODULO,
  usePermisosAdmin,
  type MatrizPermisos,
} from '../hooks/usePermisosAdmin'
import type { Rol } from '../types'

import { moduloVisual, toggleStyles as ts } from './PermisosView.styles'

const FILTRO_ACTIVO =
  'border-indigo-400 bg-indigo-50 text-indigo-700 dark:border-indigo-500/70 dark:bg-indigo-900/20 dark:text-indigo-300'

const btnHerramienta =
  'inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-700'

/** Activos / totales de un rol en un módulo (o en todos) */
function contar(matriz: MatrizPermisos, rol: Rol, modulos: string[]) {
  let activos = 0
  let total = 0
  modulos.forEach(m => {
    Object.values(matriz[m] ?? {}).forEach(porRol => {
      const p = porRol[rol]
      if (!p) return
      total++
      if (p.permitido) activos++
    })
  })
  return { activos, total }
}

// ── Tarjeta resumen por rol ──────────────────────────────────────────────────
function TarjetaRol({
  rol,
  activos,
  total,
  seleccionado,
  onClick,
}: {
  rol: Rol
  activos: number
  total: number
  seleccionado: boolean
  onClick?: () => void
}) {
  const v = ROL_VISUAL[rol]
  const Icono = v.icon
  const esAdmin = rol === 'Administrador'
  const pct = esAdmin
    ? 100
    : total > 0
      ? Math.round((activos / total) * 100)
      : 0

  const contenido = (
    <>
      <div className='flex items-center gap-3'>
        <span
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm',
            v.gradient
          )}
        >
          <Icono className='h-5 w-5' />
        </span>
        <div className='min-w-0'>
          <p className='truncate text-sm font-bold text-slate-900 dark:text-white'>
            {v.label}
          </p>
          <p className='text-xs text-slate-500 dark:text-slate-400'>
            {esAdmin ? (
              <span className='inline-flex items-center gap-1'>
                <Lock className='h-3 w-3' />
                Acceso total
              </span>
            ) : (
              <>
                <span className={cn('font-bold tabular-nums', v.text)}>
                  {activos}
                </span>{' '}
                de {total} permisos
              </>
            )}
          </p>
        </div>
        <span className={cn('ml-auto text-lg font-black tabular-nums', v.text)}>
          {pct}%
        </span>
      </div>
      <div className='mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700/60'>
        <div
          className={cn(
            'h-full rounded-full bg-gradient-to-r transition-all duration-500',
            v.gradient
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </>
  )

  const base =
    'rounded-2xl border p-4 text-left shadow-sm transition-all duration-150'
  if (!onClick) {
    return (
      <div
        className={cn(
          base,
          'border-slate-200/80 bg-white dark:border-slate-700/60 dark:bg-slate-800/60'
        )}
      >
        {contenido}
      </div>
    )
  }
  return (
    <button
      type='button'
      onClick={onClick}
      aria-pressed={seleccionado}
      title={seleccionado ? 'Mostrar todos los roles' : `Ver solo ${v.label}`}
      className={cn(
        base,
        'hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400',
        seleccionado
          ? v.selected
          : 'border-slate-200/80 bg-white hover:border-slate-300 dark:border-slate-700/60 dark:bg-slate-800/60 dark:hover:border-slate-600'
      )}
    >
      {contenido}
    </button>
  )
}

// ── Sección de módulo (reordenable) ──────────────────────────────────────────
interface SeccionModuloProps {
  modulo: string
  isCollapsed: boolean
  isDndEnabled: boolean
  isDraggingAny: boolean
  roles: Rol[]
  matriz: MatrizPermisos
  acciones: string[]
  savingIds: Set<string>
  onToggleCollapsed: (modulo: string) => void
  onTogglePermiso: (
    id: string,
    permitido: boolean,
    rol: Rol,
    modulo: string,
    accion: string
  ) => void
}

function SeccionModulo({
  modulo,
  isCollapsed,
  isDndEnabled,
  isDraggingAny,
  roles,
  matriz,
  acciones,
  savingIds,
  onToggleCollapsed,
  onTogglePermiso,
}: SeccionModuloProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: modulo, disabled: !isDndEnabled })

  const mv = moduloVisual(modulo)
  const Icono = mv.icon
  const nombre = ETIQUETA_MODULO[modulo] ?? modulo

  return (
    <tbody
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
    >
      {/* Encabezado del módulo */}
      <tr className='border-t border-slate-200 bg-slate-50/80 first:border-t-0 dark:border-slate-700 dark:bg-slate-900/40'>
        <td className='px-3 py-2.5'>
          <div className='flex items-center gap-2.5'>
            {isDndEnabled ? (
              <span
                {...attributes}
                {...listeners}
                className='flex-shrink-0 cursor-grab text-slate-300 hover:text-slate-500 active:cursor-grabbing dark:text-slate-600 dark:hover:text-slate-400'
                title='Arrastrar para reordenar'
                aria-label={`Arrastrar ${nombre}`}
              >
                <GripVertical className='h-4 w-4' />
              </span>
            ) : null}
            <button
              type='button'
              onClick={() => {
                if (!isDraggingAny) onToggleCollapsed(modulo)
              }}
              aria-expanded={!isCollapsed}
              className='group flex min-w-0 items-center gap-2.5 text-left'
            >
              <motion.span
                animate={{ rotate: isCollapsed ? -90 : 0 }}
                transition={{ duration: 0.2 }}
                className='inline-flex text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
              >
                <ChevronDown className='h-4 w-4' />
              </motion.span>
              <span
                className={cn(
                  'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-sm',
                  mv.gradient
                )}
              >
                <Icono className='h-4 w-4' />
              </span>
              <span className='truncate text-sm font-bold text-slate-900 dark:text-white'>
                {nombre}
              </span>
              <span className='rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-500 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700'>
                {acciones.length}{' '}
                {acciones.length === 1 ? 'acción' : 'acciones'}
              </span>
            </button>
          </div>
        </td>
        {/* Admin: siempre todo */}
        <td className='px-2 py-2.5 text-center'>
          <span className='text-[11px] font-bold tabular-nums text-rose-500 dark:text-rose-300'>
            {acciones.length}/{acciones.length}
          </span>
        </td>
        {/* Resumen por rol en este módulo */}
        {roles.map(rol => {
          const { activos, total } = contar(matriz, rol, [modulo])
          const v = ROL_VISUAL[rol]
          return (
            <td key={rol} className='px-2 py-2.5 text-center'>
              {total > 0 ? (
                <span
                  className={cn(
                    'inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums ring-1 ring-inset',
                    activos > 0
                      ? v.badge
                      : 'bg-slate-100 text-slate-400 ring-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:ring-slate-700'
                  )}
                >
                  {activos}/{total}
                </span>
              ) : null}
            </td>
          )
        })}
      </tr>

      {/* Acciones */}
      <AnimatePresence initial={false}>
        {!isCollapsed
          ? acciones.map(accion => (
              <motion.tr
                key={`${modulo}-${accion}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className='transition-colors hover:bg-indigo-50/40 dark:hover:bg-slate-700/20'
              >
                <td className='py-2 pl-14 pr-4'>
                  <span className='text-sm text-slate-700 dark:text-slate-300'>
                    {ETIQUETA_ACCION[accion] ?? accion}
                  </span>
                </td>
                <td className='px-2 py-2 text-center'>
                  <span
                    className={ts.admin}
                    title='El Administrador tiene acceso total'
                    aria-label='Administrador: acceso total'
                  >
                    <Check className='h-4 w-4' strokeWidth={3} />
                  </span>
                </td>
                {roles.map(rol => {
                  const permiso = matriz[modulo]?.[accion]?.[rol]
                  if (!permiso) {
                    return (
                      <td key={rol} className='px-2 py-2 text-center'>
                        <span
                          className='inline-flex h-8 w-8 items-center justify-center text-slate-200 dark:text-slate-700'
                          title='No aplica'
                        >
                          <Minus className='h-4 w-4' />
                        </span>
                      </td>
                    )
                  }
                  const v = ROL_VISUAL[rol]
                  const guardando = savingIds.has(permiso.id)
                  const etiqueta = `${ETIQUETA_ACCION[accion] ?? accion} en ${ETIQUETA_MODULO[modulo] ?? modulo} — ${v.label}`
                  return (
                    <td key={rol} className='px-2 py-2 text-center'>
                      <button
                        type='button'
                        onClick={() =>
                          onTogglePermiso(
                            permiso.id,
                            permiso.permitido,
                            rol,
                            modulo,
                            accion
                          )
                        }
                        disabled={guardando}
                        className={cn(
                          ts.base,
                          permiso.permitido ? cn(ts.on, v.gradient) : ts.off
                        )}
                        title={
                          guardando
                            ? 'Guardando…'
                            : (permiso.descripcion ?? etiqueta)
                        }
                        aria-label={`${permiso.permitido ? 'Quitar' : 'Dar'} permiso: ${etiqueta}`}
                        aria-pressed={permiso.permitido}
                        aria-busy={guardando}
                      >
                        {guardando ? (
                          <Loader2 className='h-4 w-4 animate-spin' />
                        ) : permiso.permitido ? (
                          <Check className='h-4 w-4' strokeWidth={3} />
                        ) : null}
                      </button>
                    </td>
                  )
                })}
              </motion.tr>
            ))
          : null}
      </AnimatePresence>
    </tbody>
  )
}

// ── Vista previa al arrastrar ────────────────────────────────────────────────
function ModuloArrastrado({ modulo }: { modulo: string }) {
  const mv = moduloVisual(modulo)
  const Icono = mv.icon
  return (
    <div className='flex items-center gap-2.5 rounded-xl border border-indigo-200 bg-white/95 px-4 py-2.5 shadow-2xl shadow-indigo-500/20 dark:border-indigo-700 dark:bg-slate-800/95'>
      <GripVertical className='h-4 w-4 text-indigo-400' />
      <span
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br text-white',
          mv.gradient
        )}
      >
        <Icono className='h-4 w-4' />
      </span>
      <span className='text-sm font-bold text-slate-900 dark:text-white'>
        {ETIQUETA_MODULO[modulo] ?? modulo}
      </span>
    </div>
  )
}

// ── Componente ───────────────────────────────────────────────────────────────
export function PermisosView() {
  const {
    matriz,
    modulosFiltrados,
    roles,
    rolesFiltrados,
    isLoading,
    error,
    savingIds,
    filtroRol,
    filtroModulo,
    busqueda,
    hayFiltrosActivos,
    modulosTodos,
    setFiltroRol,
    setFiltroModulo,
    setBusqueda,
    limpiarFiltros,
    handleToggle,
    collapsed,
    toggleCollapsed,
    colapsarTodos,
    expandirTodos,
    tieneOrdenPersonalizado,
    reordenarModulos,
    resetOrden,
  } = usePermisosAdmin()

  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  const isDraggingRef = useRef(false)

  const isDndEnabled = filtroModulo === 'todos' && busqueda.trim() === ''

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // Acciones visibles por módulo (la búsqueda también filtra por acción)
  const accionesPorModulo = useMemo(() => {
    const termino = busqueda.toLowerCase().trim()
    const r: Record<string, string[]> = {}
    modulosFiltrados.forEach(m => {
      const todas = Object.keys(matriz[m] ?? {}).sort((a, b) =>
        (ETIQUETA_ACCION[a] ?? a).localeCompare(ETIQUETA_ACCION[b] ?? b)
      )
      const coincideModulo = (ETIQUETA_MODULO[m] ?? m)
        .toLowerCase()
        .includes(termino)
      r[m] =
        !termino || coincideModulo
          ? todas
          : todas.filter(a =>
              (ETIQUETA_ACCION[a] ?? a).toLowerCase().includes(termino)
            )
    })
    return r
  }, [matriz, modulosFiltrados, busqueda])

  function handleDragStart(event: DragStartEvent) {
    setActiveDragId(String(event.active.id))
    isDraggingRef.current = true
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    isDraggingRef.current = false
    setActiveDragId(null)
    if (over && active.id !== over.id) {
      const oldIndex = modulosFiltrados.indexOf(String(active.id))
      const newIndex = modulosFiltrados.indexOf(String(over.id))
      if (oldIndex !== -1 && newIndex !== -1) {
        reordenarModulos(arrayMove(modulosFiltrados, oldIndex, newIndex))
      }
    }
  }

  if (isLoading) {
    return (
      <div className='space-y-4'>
        <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className='h-24 animate-pulse rounded-2xl bg-white dark:bg-slate-800/60'
            />
          ))}
        </div>
        <div className='h-96 animate-pulse rounded-2xl bg-white dark:bg-slate-800/60' />
      </div>
    )
  }

  if (error) {
    return (
      <div className='rounded-2xl border border-rose-200 bg-rose-50 p-6 dark:border-rose-800/50 dark:bg-rose-950/30'>
        <div className='flex items-center gap-3'>
          <AlertCircle className='h-5 w-5 flex-shrink-0 text-rose-500' />
          <div>
            <p className='text-sm font-semibold text-rose-900 dark:text-rose-100'>
              Error al cargar permisos
            </p>
            <p className='mt-0.5 text-xs text-rose-700 dark:text-rose-300'>
              {(error as Error).message}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (modulosTodos.length === 0) {
    return (
      <div className='rounded-2xl border border-slate-200 bg-white py-12 text-center dark:border-slate-700/60 dark:bg-slate-800/60'>
        <Shield className='mx-auto mb-3 h-10 w-10 text-slate-300 dark:text-slate-600' />
        <p className='text-sm text-slate-500 dark:text-slate-400'>
          No hay permisos configurados en el sistema
        </p>
      </div>
    )
  }

  const modulosVisibles = modulosFiltrados.filter(
    m => (accionesPorModulo[m] ?? []).length > 0
  )
  const accionesVisibles = modulosVisibles.reduce(
    (s, m) => s + accionesPorModulo[m].length,
    0
  )
  const todosColapsados =
    modulosVisibles.length > 0 && modulosVisibles.every(m => collapsed.has(m))
  const resultado = `${modulosVisibles.length} módulo${modulosVisibles.length !== 1 ? 's' : ''} · ${accionesVisibles} acciones`

  return (
    <div className='space-y-5'>
      {/* Tarjetas por rol */}
      <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
        <TarjetaRol
          rol='Administrador'
          activos={0}
          total={0}
          seleccionado={false}
        />
        {roles.map(rol => {
          const { activos, total } = contar(matriz, rol, modulosTodos)
          return (
            <TarjetaRol
              key={rol}
              rol={rol}
              activos={activos}
              total={total}
              seleccionado={filtroRol === rol}
              onClick={() => setFiltroRol(filtroRol === rol ? 'todos' : rol)}
            />
          )
        })}
      </div>

      {/* Buscador y herramientas */}
      <div className='space-y-2'>
        <ListSearchToolbar
          value={busqueda}
          onChange={setBusqueda}
          placeholder='Buscar módulo o acción…'
          resultado={resultado}
          onLimpiar={hayFiltrosActivos ? limpiarFiltros : undefined}
        >
          <FilterDropdown
            value={filtroModulo}
            placeholder='Todos los módulos'
            allValue='todos'
            activeClassName={FILTRO_ACTIVO}
            options={[
              { value: 'todos', label: 'Todos los módulos' },
              ...modulosTodos.map(m => ({
                value: m,
                label: ETIQUETA_MODULO[m] ?? m,
              })),
            ]}
            onChange={setFiltroModulo}
          />
          <button
            type='button'
            onClick={() =>
              todosColapsados ? expandirTodos() : colapsarTodos(modulosVisibles)
            }
            className={btnHerramienta}
          >
            {todosColapsados ? (
              <ChevronsUpDown className='h-3.5 w-3.5' />
            ) : (
              <ChevronsDownUp className='h-3.5 w-3.5' />
            )}
            {todosColapsados ? 'Expandir todo' : 'Colapsar todo'}
          </button>
          {tieneOrdenPersonalizado ? (
            <button
              type='button'
              onClick={resetOrden}
              className={btnHerramienta}
              title='Volver al orden alfabético'
            >
              <RotateCcw className='h-3.5 w-3.5' />
              Restablecer orden
            </button>
          ) : null}
        </ListSearchToolbar>
        <p className='flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400'>
          <span className='inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400'>
            <CloudCheck className='h-3.5 w-3.5' />
            Los cambios se guardan al instante
          </span>
          {isDndEnabled ? (
            <span className='inline-flex items-center gap-1'>
              Arrastra <GripVertical className='h-3 w-3' /> para reordenar
              módulos
            </span>
          ) : null}
        </p>
      </div>

      {/* Matriz */}
      <div className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700/60 dark:bg-slate-800/60'>
        <div className='overflow-x-auto'>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <table className='w-full text-sm'>
              <thead className='bg-gradient-to-r from-indigo-700 via-indigo-600 to-sky-500'>
                <tr>
                  <th className='px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white'>
                    Módulo / acción
                  </th>
                  {(['Administrador', ...rolesFiltrados] as Rol[]).map(rol => {
                    const v = ROL_VISUAL[rol]
                    const Icono = v.icon
                    return (
                      <th key={rol} className='min-w-[112px] px-2 py-3'>
                        <div className='flex flex-col items-center gap-1.5'>
                          <span className='flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 text-white ring-1 ring-white/30'>
                            <Icono className='h-4 w-4' />
                          </span>
                          <span className='text-[11px] font-semibold uppercase tracking-wider text-white'>
                            {v.label}
                          </span>
                        </div>
                      </th>
                    )
                  })}
                </tr>
              </thead>

              <SortableContext
                items={modulosVisibles}
                strategy={verticalListSortingStrategy}
              >
                {modulosVisibles.length === 0 ? (
                  <tbody>
                    <tr>
                      <td
                        colSpan={2 + rolesFiltrados.length}
                        className='py-12 text-center text-sm text-slate-400 dark:text-slate-500'
                      >
                        Ningún módulo o acción coincide con la búsqueda
                      </td>
                    </tr>
                  </tbody>
                ) : null}

                {modulosVisibles.map(modulo => (
                  <SeccionModulo
                    key={modulo}
                    modulo={modulo}
                    isCollapsed={collapsed.has(modulo)}
                    isDndEnabled={isDndEnabled}
                    isDraggingAny={activeDragId !== null}
                    roles={rolesFiltrados}
                    matriz={matriz}
                    acciones={accionesPorModulo[modulo]}
                    savingIds={savingIds}
                    onToggleCollapsed={toggleCollapsed}
                    onTogglePermiso={handleToggle}
                  />
                ))}
              </SortableContext>
            </table>

            <DragOverlay>
              {activeDragId ? <ModuloArrastrado modulo={activeDragId} /> : null}
            </DragOverlay>
          </DndContext>
        </div>

        {/* Leyenda */}
        <div className='flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-4 py-3 text-xs dark:border-slate-700/60 dark:bg-slate-900/30'>
          <div className='flex flex-wrap items-center gap-4'>
            <span className='flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300'>
              <span className='flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-sky-500 text-white'>
                <Check className='h-3 w-3' strokeWidth={3} />
              </span>
              Permitido
            </span>
            <span className='flex items-center gap-1.5 text-slate-500 dark:text-slate-400'>
              <span className='h-5 w-5 rounded-md border-2 border-dashed border-slate-300 dark:border-slate-600' />
              Sin permiso
            </span>
            <span className='flex items-center gap-1.5 text-slate-400 dark:text-slate-500'>
              <Minus className='h-4 w-4' />
              No aplica
            </span>
          </div>
          <span className='flex items-center gap-1 text-slate-400 dark:text-slate-500'>
            <Lock className='h-3 w-3' />
            El Administrador siempre tiene acceso total
          </span>
        </div>
      </div>
    </div>
  )
}
