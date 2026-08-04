/**
 * PermisosView — Administración de permisos RBAC
 *
 * Componente presentacional que muestra la matriz de permisos
 * por módulo x acción x rol, con toggles editables en línea.
 *
 * - Sin emojis
 * - Sin datos hardcodeados (todo viene de la BD via hook)
 * - Administrador siempre tiene acceso total (no editable)
 * - Diseño v4: accordion por módulo + drag-and-drop para reordenar
 */

'use client'

import type { ElementType } from 'react'
import { useRef, useState } from 'react'

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
  Activity,
  AlertCircle,
  BarChart3,
  Building2,
  Check,
  ChevronDown,
  CreditCard,
  FileText,
  GripVertical,
  Handshake,
  Home,
  Loader2,
  Minus,
  RotateCcw,
  Search,
  Settings2,
  Shield,
  UserCog,
  Users,
  X,
} from 'lucide-react'

import { FormSelect } from '@/shared/components/ui/form-select'

import {
  ETIQUETA_ACCION,
  ETIQUETA_MODULO,
  ETIQUETA_ROL,
  usePermisosAdmin,
} from '../hooks/usePermisosAdmin'
import type { Rol } from '../types'

import {
  MODULE_ACCENT,
  MODULE_ICON_BG,
  ROL_VISUAL,
  sharedStyles as ss,
} from './PermisosView.styles'

// ── Module icon map ───────────────────────────────────────────────────────────
const MODULE_ICONS: Record<string, ElementType> = {
  proyectos: Building2,
  viviendas: Home,
  clientes: Users,
  documentos: FileText,
  negociaciones: Handshake,
  abonos: CreditCard,
  usuarios: UserCog,
  auditorias: Activity,
  reportes: BarChart3,
  administracion: Settings2,
}

// ── Role filter chips ─────────────────────────────────────────────────────────
const ROLE_CHIPS: Array<{ value: Rol | 'todos'; label: string }> = [
  { value: 'todos', label: 'Todos' },
  { value: 'Contabilidad', label: 'Contabilidad' },
  { value: 'Administrador de Obra', label: 'Adm. Obra' },
  { value: 'Gerencia', label: 'Gerencia' },
]

// ── Helper ────────────────────────────────────────────────────────────────────
function moduleActionsTotal(
  matriz: Record<string, Record<string, Record<string, unknown>>>
) {
  let total = 0
  Object.values(matriz).forEach(acciones => {
    Object.values(acciones).forEach(roles => {
      total += Object.keys(roles).filter(r => r !== 'Administrador').length
    })
  })
  return total
}

// ── SortableModuleSection ─────────────────────────────────────────────────────
interface SortableModuleSectionProps {
  modulo: string
  isCollapsed: boolean
  isDndEnabled: boolean
  isDraggingAny: boolean
  rolesFiltrados: Rol[]
  matriz: Record<string, Record<string, Record<string, unknown>>>
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

function SortableModuleSection({
  modulo,
  isCollapsed,
  isDndEnabled,
  isDraggingAny,
  rolesFiltrados,
  matriz,
  savingIds,
  onToggleCollapsed,
  onTogglePermiso,
}: SortableModuleSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: modulo, disabled: !isDndEnabled })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const Icon = (MODULE_ICONS[modulo] ?? Shield) as ElementType
  const accionesDelModulo = Object.keys(matriz[modulo] ?? {}).sort()
  const accentColor = MODULE_ACCENT[modulo] ?? 'bg-gray-400'
  const iconBg =
    MODULE_ICON_BG[modulo] ?? 'bg-gray-100 text-gray-600 dark:text-gray-400'

  return (
    <tbody ref={setNodeRef} style={style}>
      <tr
        className={[
          ss.trModule,
          isDndEnabled && !isDragging
            ? 'cursor-grab active:cursor-grabbing'
            : '',
        ].join(' ')}
      >
        <td colSpan={2 + rolesFiltrados.length} className='px-4 py-2'>
          <div className='flex items-center gap-2.5'>
            {isDndEnabled ? (
              <span
                {...attributes}
                {...listeners}
                className='flex-shrink-0 cursor-grab text-gray-300 hover:text-gray-500 active:cursor-grabbing dark:text-gray-600 dark:hover:text-gray-400'
                title='Arrastrar para reordenar'
                aria-label='Arrastrar módulo'
              >
                <GripVertical className='h-4 w-4' />
              </span>
            ) : null}
            <div className={`w-0.5 self-stretch rounded-full ${accentColor}`} />
            <div
              className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md ${iconBg}`}
            >
              <Icon className='h-3.5 w-3.5' />
            </div>
            <span className='text-xs font-bold uppercase tracking-wide text-gray-800 dark:text-gray-100'>
              {ETIQUETA_MODULO[modulo] ?? modulo}
            </span>
            <span className='rounded-full bg-gray-200/80 px-2 py-0.5 text-[10px] font-semibold text-gray-500 dark:bg-gray-700/80 dark:text-gray-400'>
              {accionesDelModulo.length}
            </span>
            <div className='flex-1' />
            <button
              onClick={() => {
                if (!isDraggingAny) onToggleCollapsed(modulo)
              }}
              className='flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-gray-400 transition-colors hover:bg-gray-200/60 hover:text-gray-600 dark:hover:bg-gray-700/60 dark:hover:text-gray-300'
              aria-label={isCollapsed ? 'Expandir módulo' : 'Colapsar módulo'}
              aria-expanded={!isCollapsed}
            >
              <motion.span
                animate={{ rotate: isCollapsed ? -90 : 0 }}
                transition={{ duration: 0.2 }}
                className='inline-flex'
              >
                <ChevronDown className='h-3.5 w-3.5' />
              </motion.span>
              {isCollapsed ? 'Expandir' : 'Colapsar'}
            </button>
          </div>
        </td>
      </tr>

      <AnimatePresence initial={false}>
        {!isCollapsed
          ? accionesDelModulo.map((accion, idx) => (
              <motion.tr
                key={`${modulo}-${accion}`}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.18, delay: idx * 0.01 }}
                className={ss.trAction}
              >
                <td className='py-2.5 pl-8 pr-4'>
                  <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                    {ETIQUETA_ACCION[accion] ?? accion}
                  </span>
                </td>
                <td className='px-3 py-2.5 text-center'>
                  <span
                    className={ss.toggleAdmin}
                    title='Administrador tiene acceso total'
                    aria-label='Administrador — acceso total'
                  >
                    <Check className='h-3.5 w-3.5' />
                  </span>
                </td>
                {rolesFiltrados.map(rol => {
                  const permisoRaw = (
                    matriz[modulo] as
                      | Record<
                          string,
                          Record<
                            string,
                            {
                              id: string
                              permitido: boolean
                              descripcion?: string | null
                            }
                          >
                        >
                      | undefined
                  )?.[accion]?.[rol]
                  const v =
                    ROL_VISUAL[rol as Exclude<Rol, 'Administrador'>] ?? null
                  if (!permisoRaw) {
                    return (
                      <td key={rol} className='px-3 py-2.5 text-center'>
                        <span className='inline-flex h-7 w-7 items-center justify-center text-gray-200 dark:text-gray-700'>
                          <Minus className='h-3.5 w-3.5' />
                        </span>
                      </td>
                    )
                  }
                  return (
                    <td key={rol} className='px-3 py-2.5 text-center'>
                      <button
                        onClick={() =>
                          onTogglePermiso(
                            permisoRaw.id,
                            permisoRaw.permitido,
                            rol,
                            modulo,
                            accion
                          )
                        }
                        disabled={savingIds.has(permisoRaw.id)}
                        className={[
                          ss.toggleBase,
                          savingIds.has(permisoRaw.id)
                            ? 'cursor-not-allowed bg-gray-100 opacity-70 dark:bg-gray-700'
                            : permisoRaw.permitido
                              ? (v?.toggleOn ??
                                'bg-indigo-500 text-white hover:bg-indigo-600 focus:ring-indigo-500/30')
                              : ss.toggleOff,
                        ].join(' ')}
                        title={
                          savingIds.has(permisoRaw.id)
                            ? 'Guardando...'
                            : permisoRaw.descripcion ||
                              `${ETIQUETA_ACCION[accion] ?? accion} en ${ETIQUETA_MODULO[modulo] ?? modulo} — ${ETIQUETA_ROL[rol]}`
                        }
                        aria-label={`${permisoRaw.permitido ? 'Desactivar' : 'Activar'} permiso ${accion} en ${modulo} para ${rol}`}
                        aria-pressed={permisoRaw.permitido}
                        aria-busy={savingIds.has(permisoRaw.id)}
                      >
                        {savingIds.has(permisoRaw.id) ? (
                          <Loader2 className='h-3.5 w-3.5 animate-spin text-gray-400 dark:text-gray-500' />
                        ) : permisoRaw.permitido ? (
                          <Check className='h-3.5 w-3.5' />
                        ) : (
                          <X className='h-3.5 w-3.5' />
                        )}
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

// ── DragOverlay module preview ────────────────────────────────────────────────
function ModuleDragPreview({ modulo }: { modulo: string }) {
  const Icon = (MODULE_ICONS[modulo] ?? Shield) as ElementType
  const accentColor = MODULE_ACCENT[modulo] ?? 'bg-gray-400'
  const iconBg = MODULE_ICON_BG[modulo] ?? 'bg-gray-100 text-gray-600'
  return (
    <div className='flex items-center gap-2.5 rounded-lg border border-indigo-200 bg-white/95 px-4 py-2 shadow-2xl shadow-indigo-500/20 dark:border-indigo-700 dark:bg-gray-800/95'>
      <GripVertical className='h-4 w-4 text-indigo-400' />
      <div className={`h-5 w-0.5 rounded-full ${accentColor}`} />
      <div
        className={`flex h-6 w-6 items-center justify-center rounded-md ${iconBg}`}
      >
        <Icon className='h-3.5 w-3.5' />
      </div>
      <span className='text-xs font-bold uppercase tracking-wide text-gray-800 dark:text-gray-100'>
        {ETIQUETA_MODULO[modulo] ?? modulo}
      </span>
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────
export function PermisosView() {
  const {
    permisosFiltrados,
    matriz,
    modulosFiltrados,
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
      <div className='flex items-center justify-center p-20'>
        <div className='h-8 w-8 animate-spin rounded-full border-[3px] border-indigo-200 border-t-indigo-600' />
      </div>
    )
  }

  if (error) {
    return (
      <div className='rounded-xl border border-red-200 bg-red-50/80 p-6 dark:border-red-800/50 dark:bg-red-900/20'>
        <div className='flex items-center gap-3'>
          <AlertCircle className='h-5 w-5 flex-shrink-0 text-red-500' />
          <div>
            <p className='text-sm font-semibold text-red-900 dark:text-red-100'>
              Error al cargar permisos
            </p>
            <p className='mt-0.5 text-xs text-red-700 dark:text-red-300'>
              {(error as Error).message}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (modulosTodos.length === 0) {
    return (
      <div className='py-12 text-center'>
        <Shield className='mx-auto mb-3 h-10 w-10 text-gray-300 dark:text-gray-600' />
        <p className='text-sm text-gray-400 dark:text-gray-500'>
          No hay permisos configurados en el sistema
        </p>
      </div>
    )
  }

  const totalConfigurable = moduleActionsTotal(matriz)

  return (
    <div className='space-y-4'>
      {/* Encabezado */}
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30'>
            <Shield className='h-5 w-5 text-white' />
          </div>
          <div>
            <h2 className='text-base font-bold text-gray-900 dark:text-white'>
              Permisos por Rol
            </h2>
            <p className='mt-0.5 text-xs text-gray-500 dark:text-gray-400'>
              {permisosFiltrados.length} de {totalConfigurable} permisos
              configurables
            </p>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <span className='flex items-center gap-1.5 rounded-lg border border-gray-200/60 bg-white/80 px-3 py-1.5 dark:border-gray-700/60 dark:bg-gray-800/80'>
            <span className='h-1.5 w-1.5 rounded-full bg-indigo-500' />
            <span className='text-xs font-medium text-gray-600 dark:text-gray-400'>
              {rolesFiltrados.length} roles
            </span>
          </span>
          <span className='flex items-center gap-1.5 rounded-lg border border-gray-200/60 bg-white/80 px-3 py-1.5 dark:border-gray-700/60 dark:bg-gray-800/80'>
            <span className='h-1.5 w-1.5 rounded-full bg-purple-500' />
            <span className='text-xs font-medium text-gray-600 dark:text-gray-400'>
              {modulosFiltrados.length} módulos
            </span>
          </span>
          <span className='hidden items-center gap-1.5 rounded-lg border border-emerald-200/60 bg-emerald-50/80 px-3 py-1.5 dark:border-emerald-800/40 dark:bg-emerald-900/20 sm:flex'>
            <Check className='h-3.5 w-3.5 text-emerald-500' />
            <span className='text-xs font-medium text-emerald-700 dark:text-emerald-300'>
              Cambios guardados automáticamente
            </span>
          </span>
        </div>
      </div>

      {/* Filtros */}
      <div className='rounded-xl border border-gray-200/50 bg-white/90 p-3 shadow-sm backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-800/90'>
        <div className='flex flex-wrap items-center gap-2'>
          <div className='relative min-w-[200px] flex-1'>
            <Search className='pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
            <input
              type='text'
              placeholder='Buscar módulo o acción...'
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className='w-full rounded-lg border border-gray-200 bg-gray-50 py-1.5 pl-9 pr-3 text-sm transition-all placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-200'
              aria-label='Buscar permisos'
            />
          </div>
          <FormSelect
            value={filtroModulo}
            onChange={e => setFiltroModulo(e.target.value)}
            className='rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-200'
            aria-label='Filtrar por módulo'
          >
            <option value='todos'>Todos los módulos</option>
            {modulosTodos.map(mod => (
              <option key={mod} value={mod}>
                {ETIQUETA_MODULO[mod] ?? mod}
              </option>
            ))}
          </FormSelect>
          {hayFiltrosActivos ? (
            <button
              onClick={limpiarFiltros}
              className='flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20'
              aria-label='Limpiar filtros'
            >
              <X className='h-3 w-3' />
              Limpiar
            </button>
          ) : null}
          {tieneOrdenPersonalizado ? (
            <button
              onClick={resetOrden}
              className='flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700/50'
              title='Restablecer orden alfabético'
              aria-label='Restablecer orden de módulos'
            >
              <RotateCcw className='h-3 w-3' />
              Restablecer orden
            </button>
          ) : null}
        </div>

        {isDndEnabled ? (
          <p className='mt-2 flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500'>
            Arrastra por
            <GripVertical className='inline h-3 w-3' />
            para reordenar módulos
          </p>
        ) : null}

        <div className='mt-2.5 flex flex-wrap items-center gap-1.5 border-t border-gray-100 pt-2.5 dark:border-gray-700/50'>
          <span className='mr-1 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500'>
            Rol
          </span>
          {ROLE_CHIPS.map(chip => {
            const isActive = filtroRol === chip.value
            const v =
              chip.value !== 'todos'
                ? ROL_VISUAL[chip.value as Exclude<Rol, 'Administrador'>]
                : null
            return (
              <button
                key={chip.value}
                onClick={() => setFiltroRol(chip.value as Rol | 'todos')}
                className={[
                  'rounded-full px-3.5 py-1 text-xs font-semibold transition-all',
                  isActive && chip.value === 'todos'
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                    : !isActive && chip.value === 'todos'
                      ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
                      : isActive && v
                        ? `bg-gradient-to-r ${v.gradient} text-white shadow-sm`
                        : v
                          ? `${v.bg} hover:opacity-80`
                          : '',
                ].join(' ')}
              >
                {chip.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tabla */}
      <div className='overflow-hidden rounded-xl border border-gray-200/50 bg-white/80 shadow-sm backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-800/80'>
        <div className='overflow-x-auto'>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <table className='w-full text-sm'>
              <thead className='border-b border-gray-200 dark:border-gray-700'>
                <tr className='bg-gray-50/80 dark:bg-gray-900/60'>
                  <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400'>
                    Acción
                  </th>
                  <th className='min-w-[100px] px-3 py-3 text-center'>
                    <div className='flex flex-col items-center gap-1'>
                      <div className='flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-sm'>
                        <Shield className='h-3.5 w-3.5 text-white' />
                      </div>
                      <span className='text-[10px] font-semibold uppercase tracking-wider text-indigo-500 dark:text-indigo-400'>
                        Admin
                      </span>
                    </div>
                  </th>
                  {rolesFiltrados.map(rol => {
                    const v =
                      ROL_VISUAL[rol as Exclude<Rol, 'Administrador'>] ?? null
                    return (
                      <th
                        key={rol}
                        className='min-w-[104px] px-3 py-3 text-center'
                      >
                        <div className='flex flex-col items-center gap-1'>
                          {v ? (
                            <div
                              className={`h-1.5 w-10 rounded-full bg-gradient-to-r ${v.gradient}`}
                            />
                          ) : null}
                          <span
                            className={`text-[10px] font-semibold uppercase tracking-wider ${v?.header ?? 'text-gray-500 dark:text-gray-400'}`}
                          >
                            {ETIQUETA_ROL[rol]}
                          </span>
                        </div>
                      </th>
                    )
                  })}
                </tr>
              </thead>

              <SortableContext
                items={modulosFiltrados}
                strategy={verticalListSortingStrategy}
              >
                {modulosFiltrados.length === 0 ? (
                  <tbody>
                    <tr>
                      <td
                        colSpan={2 + rolesFiltrados.length}
                        className='py-10 text-center text-sm text-gray-400 dark:text-gray-500'
                      >
                        Sin resultados para los filtros aplicados
                      </td>
                    </tr>
                  </tbody>
                ) : null}

                {modulosFiltrados.map(modulo => (
                  <SortableModuleSection
                    key={modulo}
                    modulo={modulo}
                    isCollapsed={collapsed.has(modulo)}
                    isDndEnabled={isDndEnabled}
                    isDraggingAny={activeDragId !== null}
                    rolesFiltrados={rolesFiltrados}
                    matriz={matriz}
                    savingIds={savingIds}
                    onToggleCollapsed={toggleCollapsed}
                    onTogglePermiso={handleToggle}
                  />
                ))}
              </SortableContext>
            </table>

            <DragOverlay>
              {activeDragId ? (
                <ModuleDragPreview modulo={activeDragId} />
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>

        {/* Leyenda */}
        <div className='flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/60 px-4 py-2.5 text-xs dark:border-gray-700/50 dark:bg-gray-900/30'>
          <div className='flex items-center gap-4'>
            <span className='flex items-center gap-1.5 font-semibold text-indigo-600 dark:text-indigo-400'>
              <span className='flex h-4 w-4 items-center justify-center rounded bg-indigo-500'>
                <Check className='h-2.5 w-2.5 text-white' />
              </span>
              Permitido
            </span>
            <span className='flex items-center gap-1.5 text-gray-500 dark:text-gray-400'>
              <span className='flex h-4 w-4 items-center justify-center rounded bg-gray-200 dark:bg-gray-700'>
                <X className='h-2.5 w-2.5' />
              </span>
              Denegado
            </span>
            <span className='flex items-center gap-1.5 text-gray-400 dark:text-gray-500'>
              <Minus className='h-3.5 w-3.5' />
              No aplica
            </span>
          </div>
          <span className='italic text-gray-400 dark:text-gray-500'>
            Administrador siempre tiene acceso total (no editable)
          </span>
        </div>
      </div>
    </div>
  )
}
