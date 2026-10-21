/**
 * ============================================
 * PAGE: Configuración de Requisitos de Fuentes
 * ============================================
 *
 * Panel administrativo profesional para gestionar requisitos
 * de validación de fuentes de pago.
 *
 * ARQUITECTURA:
 * - Separación de responsabilidades (hook + componentes)
 * - React Query para estado
 * - Diseño compacto y moderno
 * - Componentes reutilizables
 */

'use client'

import { useMemo, useState } from 'react'

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { motion } from 'framer-motion'
import { AlertCircle, Plus, Settings, Share2 } from 'lucide-react'

import {
  RequisitoCard,
  RequisitoForm,
  RequisitosMetricas,
  RequisitosTipoSelector,
} from '@/modules/requisitos-fuentes/components'
import { COMPARTIDOS_TAB } from '@/modules/requisitos-fuentes/components/RequisitosTipoSelector'
import {
  useRequisitos,
  useRequisitosCompartidos,
  useTiposFuente,
} from '@/modules/requisitos-fuentes/hooks'
import { requisitosConfigStyles as styles } from '@/modules/requisitos-fuentes/styles/requisitos-config.styles'
import type { CrearRequisitoDTO } from '@/modules/requisitos-fuentes/types'
import { Cargador } from '@/shared/components/carga'
import { useModal } from '@/shared/components/modals'

export default function ConfiguracionRequisitosPage() {
  // ============================================
  // TIPOS DE FUENTE DINÁMICOS (desde BD)
  // ============================================
  const { tiposFuente, isLoading: cargandoTipos } = useTiposFuente()
  const { confirm } = useModal()

  // ============================================
  // ESTADO LOCAL (UI ONLY)
  // ============================================
  const [tipoFuenteSeleccionado, setTipoFuenteSeleccionado] =
    useState<string>('')
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [mostrarNuevo, setMostrarNuevo] = useState(false)
  const [mostrarNuevoCompartido, setMostrarNuevoCompartido] = useState(false)
  const [editandoCompartidoId, setEditandoCompartidoId] = useState<
    string | null
  >(null)

  // ============================================
  // REACT QUERY HOOK (TODA LA LÓGICA)
  // ============================================
  const {
    requisitos,
    isLoading,
    error,
    crearRequisito,
    actualizarRequisito,
    desactivarRequisito,
    reordenarRequisitos,
  } = useRequisitos(tipoFuenteSeleccionado)

  const {
    requisitos: requisitosCompartidos,
    isLoading: isLoadingCompartidos,
    crearRequisito: crearCompartido,
    actualizarRequisito: actualizarCompartido,
    desactivarRequisito: desactivarCompartido,
    reordenarRequisitos: reordenarCompartidos,
  } = useRequisitosCompartidos()

  // ============================================
  // DRAG-AND-DROP SENSORS
  // ============================================
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // ============================================
  // SELECCIÓN INICIAL AUTOMÁTICA
  // ============================================
  useMemo(() => {
    if (!tipoFuenteSeleccionado && !cargandoTipos) {
      setTipoFuenteSeleccionado(COMPARTIDOS_TAB)
    }
  }, [cargandoTipos, tipoFuenteSeleccionado])

  // ============================================
  // CÁLCULOS DERIVADOS
  // ============================================
  const conteosPorTipo = useMemo(() => {
    const conteos: Record<string, number> = {}
    tiposFuente.forEach(({ value }) => {
      conteos[value] = value === tipoFuenteSeleccionado ? requisitos.length : 0
    })
    return conteos
  }, [tipoFuenteSeleccionado, requisitos, tiposFuente])

  // ============================================
  // HANDLERS (solo transformación)
  // ============================================
  const handleCrear = (datos: CrearRequisitoDTO) => {
    crearRequisito(datos)
    setMostrarNuevo(false)
  }

  const handleCrearCompartido = (datos: CrearRequisitoDTO) => {
    crearCompartido(datos)
    setMostrarNuevoCompartido(false)
  }

  const handleActualizar = (datos: CrearRequisitoDTO) => {
    if (!editandoId) return
    actualizarRequisito({ id: editandoId, datos })
    setEditandoId(null)
  }

  const handleActualizarCompartido = (datos: CrearRequisitoDTO) => {
    if (!editandoCompartidoId) return
    // Convertir el array de fuentes seleccionadas en fuentes_aplicables
    // Sin selección (array vacío) → null = aplica a todas las fuentes
    const fuentesSeleccionadas = Array.isArray(datos.tipo_fuente)
      ? datos.tipo_fuente
      : [datos.tipo_fuente].filter(Boolean)
    const fuentes_aplicables =
      fuentesSeleccionadas.length > 0 ? fuentesSeleccionadas : null
    actualizarCompartido({
      id: editandoCompartidoId,
      datos: { ...datos, fuentes_aplicables },
    })
    setEditandoCompartidoId(null)
  }

  const handleEliminar = async (id: string) => {
    const confirmado = await confirm({
      title: 'Eliminar requisito',
      message: '¿Estás seguro de eliminar este requisito?',
      variant: 'danger',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
    })
    if (confirmado) {
      desactivarRequisito(id)
    }
  }

  const handleEliminarCompartido = async (id: string) => {
    const confirmado = await confirm({
      title: 'Eliminar requisito compartido',
      message: '¿Estás seguro de eliminar este requisito compartido?',
      variant: 'danger',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
    })
    if (confirmado) {
      desactivarCompartido(id)
    }
  }

  // ============================================
  // DRAG-AND-DROP HANDLER
  // ============================================
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) return

    const oldIndex = requisitos.findIndex(r => r.id === active.id)
    const newIndex = requisitos.findIndex(r => r.id === over.id)

    if (oldIndex === -1 || newIndex === -1) return

    // Reordenar array localmente (optimistic UI)
    const reordenados = arrayMove(requisitos, oldIndex, newIndex)

    // Actualizar orden en BD
    const requisitosConNuevoOrden = reordenados.map((req, index) => ({
      id: req.id,
      orden: index + 1,
    }))

    reordenarRequisitos(requisitosConNuevoOrden)
  }

  const handleDragEndCompartidos = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = requisitosCompartidos.findIndex(r => r.id === active.id)
    const newIndex = requisitosCompartidos.findIndex(r => r.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    const reordenados = arrayMove(requisitosCompartidos, oldIndex, newIndex)
    reordenarCompartidos(
      reordenados.map((req, index) => ({ id: req.id, orden: index + 1 }))
    )
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className={styles.container.page}>
      <div className={styles.container.content}>
        {/* ============================================ */}
        {/* HEADER PREMIUM COMPACTO */}
        {/* ============================================ */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={styles.header.container}
        >
          <div className={styles.header.pattern} />
          <div className={styles.header.content}>
            <div className='flex items-center gap-3'>
              <div className={styles.header.iconBox}>
                <Settings className={styles.header.icon} />
              </div>
              <div className={styles.header.textContainer}>
                <h1 className={styles.header.title}>
                  Configuración de Requisitos
                </h1>
                <p className={styles.header.subtitle}>
                  Gestiona los pasos de validación de fuentes de pago
                </p>
              </div>
            </div>
            <div className={styles.header.badge}>
              <span>{requisitos.length} configurados</span>
            </div>
          </div>
        </motion.div>

        {/* ============================================ */}
        {/* MÉTRICAS (4 CARDS SUPERIORES) */}
        {/* ============================================ */}
        {!isLoading && <RequisitosMetricas requisitos={requisitos} />}

        {/* ============================================ */}
        {/* SELECTOR DE TIPO DE FUENTE (DINÁMICO) */}
        {/* ============================================ */}
        {!cargandoTipos && (
          <RequisitosTipoSelector
            tipoSeleccionado={tipoFuenteSeleccionado}
            onCambiarTipo={tipo => {
              setTipoFuenteSeleccionado(tipo)
              setMostrarNuevo(false)
              setEditandoId(null)
              setMostrarNuevoCompartido(false)
              setEditandoCompartidoId(null)
            }}
            conteos={conteosPorTipo}
            conteoCompartidos={requisitosCompartidos.length}
            tiposFuente={tiposFuente}
          />
        )}

        {/* ============================================ */}
        {/* CONTENIDO CONDICIONAL POR PESTAÑA           */}
        {/* ============================================ */}

        {/* ── PESTAÑA: COMPARTIDOS ── */}
        {tipoFuenteSeleccionado === COMPARTIDOS_TAB && (
          <div className={styles.lista.container}>
            {/* Header */}
            <div className={styles.lista.header}>
              <div className='flex items-start gap-3'>
                <div className='flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30'>
                  <Share2 className='h-4 w-4 text-emerald-600 dark:text-emerald-400' />
                </div>
                <div>
                  <h2 className={styles.lista.title}>Requisitos Compartidos</h2>
                  <p className='mt-0.5 text-xs text-gray-500 dark:text-gray-400'>
                    {requisitosCompartidos.length} configurado
                    {requisitosCompartidos.length !== 1 ? 's' : ''} · Se
                    solicitan <strong>una sola vez</strong> sin importar cuántas
                    fuentes tenga el cliente
                  </p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMostrarNuevoCompartido(true)}
                disabled={mostrarNuevoCompartido}
                className='inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-1.5 text-sm font-medium text-white transition-all duration-200 hover:scale-105 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50'
              >
                <Plus className='h-4 w-4' />
                Nuevo Requisito Compartido
              </motion.button>
            </div>

            {/* Explicación contextual */}
            <div className='mx-4 mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 dark:border-emerald-800/40 dark:bg-emerald-950/20'>
              <p className='flex items-center gap-1.5 text-xs text-emerald-800 dark:text-emerald-300'>
                <Share2 className='h-3.5 w-3.5 flex-shrink-0' />
                Estos documentos <strong>no se repiten por fuente</strong>. Si
                un cliente tiene Crédito Hipotecario + Subsidio Mi Casa Ya, solo
                se le pedirá una Boleta de Registro, no dos.
              </p>
            </div>

            {/* Loading */}
            {isLoadingCompartidos && (
              <Cargador
                label='Cargando requisitos compartidos'
                className='py-12'
              />
            )}

            {/* Formulario nuevo compartido */}
            {mostrarNuevoCompartido && !isLoadingCompartidos && (
              <RequisitoForm
                tipoFuente={tiposFuente[0]?.value ?? ''}
                ordenSiguiente={requisitosCompartidos.length + 1}
                tiposFuenteDisponibles={tiposFuente}
                defaultAlcance='COMPARTIDO_CLIENTE'
                onGuardar={handleCrearCompartido}
                onCancelar={() => setMostrarNuevoCompartido(false)}
              />
            )}

            {/* Lista vacía */}
            {!isLoadingCompartidos &&
              requisitosCompartidos.length === 0 &&
              !mostrarNuevoCompartido && (
                <div className={styles.lista.empty}>
                  <p className={styles.lista.emptyText}>
                    No hay requisitos compartidos configurados
                  </p>
                  <p className={styles.lista.emptyHint}>
                    Agrega documentos que apliquen a todos los clientes, como la
                    Boleta de Registro
                  </p>
                  <button
                    onClick={() => setMostrarNuevoCompartido(true)}
                    className='mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700'
                  >
                    <Plus className='h-4 w-4' />
                    Agregar Primer Requisito Compartido
                  </button>
                </div>
              )}

            {/* Formulario de Edición inline */}
            {editandoCompartidoId &&
              (() => {
                const requisitoActual = requisitosCompartidos.find(
                  r => r.id === editandoCompartidoId
                )
                if (!requisitoActual) return null
                return (
                  <div className='mt-4'>
                    <RequisitoForm
                      tipoFuente={tiposFuente[0]?.value ?? ''}
                      ordenSiguiente={requisitoActual.orden}
                      requisitoEditar={requisitoActual}
                      tiposFuenteDisponibles={tiposFuente}
                      defaultAlcance='COMPARTIDO_CLIENTE'
                      onGuardar={handleActualizarCompartido}
                      onCancelar={() => setEditandoCompartidoId(null)}
                    />
                  </div>
                )
              })()}

            {/* Lista con DnD */}
            {!isLoadingCompartidos && requisitosCompartidos.length > 0 && (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEndCompartidos}
              >
                <SortableContext
                  items={requisitosCompartidos.map(r => r.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className={styles.lista.grid}>
                    {requisitosCompartidos.map((requisito, idx) => (
                      <RequisitoCard
                        key={requisito.id}
                        index={idx + 1}
                        requisito={requisito}
                        onEditar={() => setEditandoCompartidoId(requisito.id)}
                        onEliminar={() =>
                          handleEliminarCompartido(requisito.id)
                        }
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        )}

        {/* ── PESTAÑA: FUENTE ESPECÍFICA ── */}
        {tipoFuenteSeleccionado !== COMPARTIDOS_TAB && (
          <div className={styles.lista.container}>
            {/* Header con título y botón */}
            <div className={styles.lista.header}>
              <div>
                <h2 className={styles.lista.title}>
                  Requisitos de {tipoFuenteSeleccionado}
                </h2>
                <p className='mt-0.5 text-xs text-gray-500 dark:text-gray-400'>
                  {requisitos.length} requisito
                  {requisitos.length !== 1 ? 's' : ''} configurado
                  {requisitos.length !== 1 ? 's' : ''}
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMostrarNuevo(true)}
                disabled={mostrarNuevo}
                className={`${styles.lista.btnAgregar} disabled:cursor-not-allowed disabled:opacity-50`}
              >
                <Plus className='h-4 w-4' />
                Nuevo Requisito
              </motion.button>
            </div>

            {/* Estado: Cargando */}
            {isLoading && (
              <Cargador label='Cargando requisitos' className='py-12' />
            )}

            {/* Estado: Error */}
            {error && (
              <div className='flex flex-col items-center justify-center px-4 py-8'>
                <AlertCircle className='mb-3 h-12 w-12 text-red-500' />
                <p className='font-semibold text-red-600 dark:text-red-400'>
                  Error al cargar requisitos
                </p>
                <p className='mt-1 text-sm text-gray-500'>{error.message}</p>
              </div>
            )}

            {/* Formulario NUEVO */}
            {mostrarNuevo && !isLoading && (
              <RequisitoForm
                tipoFuente={tipoFuenteSeleccionado}
                ordenSiguiente={requisitos.length + 1}
                tiposFuenteDisponibles={tiposFuente}
                onGuardar={handleCrear}
                onCancelar={() => setMostrarNuevo(false)}
              />
            )}

            {/* Estado: Lista vacía */}
            {!isLoading &&
              !error &&
              requisitos.length === 0 &&
              !mostrarNuevo && (
                <div className={styles.lista.empty}>
                  <p className={styles.lista.emptyText}>
                    No hay requisitos configurados para{' '}
                    <strong>{tipoFuenteSeleccionado}</strong>
                  </p>
                  <p className={styles.lista.emptyHint}>
                    Esta fuente no tendrá pasos de validación automáticos al
                    crearla
                  </p>
                  <button
                    onClick={() => setMostrarNuevo(true)}
                    className='mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700'
                  >
                    <Plus className='h-4 w-4' />
                    Agregar Primer Requisito
                  </button>
                </div>
              )}

            {/* Lista de requisitos (CON DRAG-AND-DROP) */}
            {!isLoading && !error && requisitos.length > 0 && (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={requisitos.map(r => r.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className={styles.lista.grid}>
                    {requisitos.map((requisito, idx) => (
                      <RequisitoCard
                        key={requisito.id}
                        index={idx + 1}
                        requisito={requisito}
                        onEditar={() => setEditandoId(requisito.id)}
                        onEliminar={() => handleEliminar(requisito.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}

            {/* Formulario de Edición inline */}
            {editandoId &&
              (() => {
                const requisitoActual = requisitos.find(
                  r => r.id === editandoId
                )
                if (!requisitoActual) return null
                return (
                  <div className='mt-4'>
                    <RequisitoForm
                      tipoFuente={tipoFuenteSeleccionado}
                      ordenSiguiente={requisitoActual.orden}
                      requisitoEditar={requisitoActual}
                      tiposFuenteDisponibles={tiposFuente}
                      onGuardar={handleActualizar}
                      onCancelar={() => setEditandoId(null)}
                    />
                  </div>
                )
              })()}
          </div>
        )}
      </div>
    </div>
  )
}
