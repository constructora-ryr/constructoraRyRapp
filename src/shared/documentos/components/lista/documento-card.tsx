'use client'

import { useRef, useState } from 'react'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  Archive,
  Calendar,
  Clock,
  Crown,
  Download,
  Edit,
  Edit3,
  Eye,
  FileText,
  FileUp,
  History,
  Lock,
  MoreVertical,
  Pin,
  RefreshCw,
  Trash2,
  Upload,
  User,
} from 'lucide-react'
import { createPortal } from 'react-dom'

import { formatDateCompact } from '@/lib/utils/date.utils'
import { ConfirmacionModal } from '@/shared/components/modals'
import { moduleThemes, type ModuleName } from '@/shared/config/module-themes'

import { MOTIVOS_ARCHIVADO } from '../../constants/archivado.constants'
import { useDocumentoCard } from '../../hooks'
import type { CategoriaDocumento, TipoEntidad } from '../../types'
import {
  DocumentoProyecto,
  formatFileSize,
  getFileExtension,
} from '../../types/documento.types'
import { BadgeEstadoProceso } from '../badge-estado-proceso'
import {
  DocumentoEditarMetadatosModal,
  DocumentoNuevaVersionModal,
  DocumentoReemplazarArchivoModal,
  DocumentoVersionesModal,
} from '../modals'
import { CategoriaIcon } from '../shared/categoria-icon'

/**
 * Formatea el value del motivo de archivado a su label legible
 */
function formatMotivoArchivado(value: string): string {
  const motivo = MOTIVOS_ARCHIVADO.find(m => m.value === value)
  return motivo ? motivo.label : value
}

interface DocumentoCardProps {
  documento: DocumentoProyecto
  categoria?: { nombre: string; color: string; icono: string }
  categorias?: CategoriaDocumento[] // 🆕 Para el modal de editar
  tipoEntidad?: TipoEntidad // ✅ Tipo de entidad para edición
  onView: (documento: DocumentoProyecto) => void | Promise<void>
  onDownload: (documento: DocumentoProyecto) => void | Promise<void>
  onToggleImportante: (documento: DocumentoProyecto) => void | Promise<void>
  onArchive: (documento: DocumentoProyecto) => void | Promise<void>
  onDelete: (documento: DocumentoProyecto) => void | Promise<void>
  onRename?: (documento: DocumentoProyecto) => void
  onRefresh?: () => void | Promise<void> // 🆕 Callback para refrescar después de versión/edición
  moduleName?: ModuleName // 🎨 Tema del módulo padre
  esArchivado?: boolean // 🆕 Indica si está en vista de archivados
  fuenteInactiva?: boolean // 🔴 Indica que la fuente de pago asociada fue desactivada
}

export function DocumentoCard({
  documento,
  categoria,
  categorias = [], // 🆕 Default a array vacío
  tipoEntidad = 'proyecto', // ✅ Default a proyecto
  onView,
  onDownload,
  onToggleImportante,
  onArchive,
  onDelete: _onDelete,
  onRename,
  onRefresh, // 🆕 Prop de refresh
  moduleName = 'proyectos', // 🎨 Default a proyectos
  esArchivado = false, // 🆕 Default a false
  fuenteInactiva = false, // 🔴 Default a false
}: DocumentoCardProps) {
  // 🎨 Obtener tema dinámico
  const theme = moduleThemes[moduleName]

  // 📐 Fixed positioning del menú (escapa cualquier overflow)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [menuPos, setMenuPos] = useState<{
    top?: number
    bottom?: number
    right: number
    maxHeight: number
  } | null>(null)

  const handleAbrirMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!menuAbierto && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top
      const rightOffset = window.innerWidth - rect.right
      const MARGIN = 8
      if (spaceBelow < 150) {
        // Solo flipear si estamos literalmente en el borde inferior del viewport
        setMenuPos({
          bottom: window.innerHeight - rect.top + MARGIN,
          right: rightOffset,
          maxHeight: spaceAbove - MARGIN,
        })
      } else {
        // Por defecto: siempre abrir hacia abajo
        setMenuPos({
          top: rect.bottom + MARGIN,
          right: rightOffset,
          maxHeight: spaceBelow - MARGIN,
        })
      }
    }
    toggleMenu()
  }

  // 🎯 TODA la lógica en el hook
  const {
    esAdmin,
    puedeEliminar,
    menuAbierto,
    menuRef,
    toggleMenu,
    cerrarMenu,
    modalEditarAbierto,
    abrirModalEditar,
    cerrarModalEditar,
    modalReemplazarAbierto,
    abrirModalReemplazar,
    cerrarModalReemplazar,
    estaProtegido,
    procesoInfo,
    estadoProceso,
    modalVersionesAbierto,
    abrirModalVersiones,
    cerrarModalVersiones,
    modalNuevaVersionAbierto,
    abrirModalNuevaVersion,
    cerrarModalNuevaVersion,
    estaVencido,
    diasParaVencer,
    esDocumentoDeProceso,
    tieneVersiones,
    confirmacionEliminar,
    abrirConfirmacionEliminar,
    cerrarConfirmacionEliminar,
    ejecutarEliminacion,
    eliminando,
  } = useDocumentoCard({ documento, esDocumentoProyecto: true })

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{ y: -2 }}
        className={`group relative flex h-full flex-col rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 ${
          menuAbierto ? 'z-20' : 'z-0'
        }`}
      >
        {/* Badge de Documento de Identidad */}
        {documento.es_documento_identidad && (
          <div className='absolute -right-1.5 -top-3 z-10'>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className='flex items-center gap-1 rounded-full border border-white bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 py-1 text-white shadow-md dark:border-gray-800'
            >
              <Lock className='h-3 w-3' />
              <span className='text-[10px] font-bold uppercase leading-none'>
                Documento de Identidad
              </span>
            </motion.div>
          </div>
        )}

        {/* Badge de Documento Archivado */}
        {esArchivado && (
          <div className='absolute -right-1.5 -top-3 z-10'>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className='flex items-center gap-1 rounded-full border border-white bg-gradient-to-r from-slate-600 to-slate-700 px-2.5 py-1 text-white shadow-md dark:border-gray-800 dark:from-slate-700 dark:to-slate-800'
            >
              <Archive className='h-3 w-3' />
              <span className='text-[10px] font-bold uppercase leading-none'>
                Archivado
              </span>
            </motion.div>
          </div>
        )}

        {/* Badge de Fuente Inactiva */}
        {fuenteInactiva && !esArchivado && (
          <div className='absolute -right-1.5 -top-3 z-10'>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className='flex items-center gap-1 rounded-full border border-white bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 py-1 text-white shadow-md dark:border-gray-800 dark:from-amber-600 dark:to-orange-600'
            >
              <AlertCircle className='h-3 w-3' />
              <span className='text-[10px] font-bold uppercase leading-none'>
                Fuente inactiva
              </span>
            </motion.div>
          </div>
        )}

        <div className='flex flex-1 flex-col p-3'>
          {/* Header: Icon + Categoría + Menú */}
          <div className='mb-2.5 flex items-start justify-between gap-2.5'>
            <div className='flex min-w-0 flex-1 items-center gap-2.5'>
              {/* Icono de categoría */}
              {categoria ? (
                <div
                  className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${theme.classes.gradient.background} dark:${theme.classes.gradient.backgroundDark}`}
                >
                  <CategoriaIcon
                    icono={categoria.icono}
                    color={categoria.color}
                    size={18}
                  />
                </div>
              ) : (
                <div className='flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700'>
                  <FileText size={18} className='text-gray-400' />
                </div>
              )}

              {/* Título + Badges inline */}
              <div className='min-w-0 flex-1'>
                <div className='mb-0.5 flex items-center gap-2'>
                  {/* Título truncado con tooltip */}
                  <h3
                    className='truncate text-sm font-bold leading-tight text-gray-900 dark:text-white'
                    title={documento.titulo}
                  >
                    {documento.titulo}
                  </h3>

                  {/* Badge importante */}
                  {documento.es_importante && (
                    <Pin
                      size={13}
                      className='flex-shrink-0 fill-cyan-500 text-cyan-500'
                    />
                  )}
                </div>

                {/* Categoría + Tipo + Tamaño */}
                <div className='flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400'>
                  {categoria && (
                    <>
                      <span className='font-medium'>{categoria.nombre}</span>
                      <span>•</span>
                    </>
                  )}
                  <span className='font-medium uppercase'>
                    {getFileExtension(documento.nombre_archivo)}
                  </span>
                  <span>•</span>
                  <span>{formatFileSize(documento.tamano_bytes)}</span>
                  {documento.version > 1 && (
                    <>
                      <span>•</span>
                      <span className='font-medium text-purple-600 dark:text-purple-400'>
                        v{documento.version}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Menú de acciones */}
            <div className='relative flex-shrink-0'>
              <button
                ref={triggerRef}
                onClick={handleAbrirMenu}
                className='rounded-lg p-2 opacity-40 transition-opacity hover:bg-gray-100 focus-visible:opacity-100 group-hover:opacity-100 dark:hover:bg-gray-700'
                aria-label='Menú de acciones'
              >
                <MoreVertical size={18} className='text-gray-500' />
              </button>

              {/* Portal: renderizado en document.body, fuera del transform de motion.div */}
              {menuAbierto &&
                menuPos &&
                createPortal(
                  <div
                    ref={menuRef}
                    style={{
                      position: 'fixed',
                      top: menuPos.top,
                      bottom: menuPos.bottom,
                      right: menuPos.right,
                      maxHeight: menuPos.maxHeight,
                      overflowY: 'auto',
                      zIndex: 9999,
                    }}
                    className='min-w-[220px] rounded-xl border border-gray-200 bg-white py-1 shadow-2xl dark:border-gray-700 dark:bg-gray-800'
                  >
                    {/* Marcar/Quitar importante */}
                    <button
                      type='button'
                      onClick={e => {
                        e.preventDefault()
                        e.stopPropagation()
                        onToggleImportante(documento)
                        cerrarMenu()
                      }}
                      className='flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    >
                      <Pin
                        size={16}
                        className={
                          documento.es_importante
                            ? 'fill-cyan-500 text-cyan-500'
                            : ''
                        }
                      />
                      {documento.es_importante
                        ? 'Quitar anclado'
                        : 'Anclar documento'}
                    </button>

                    {onRename && (
                      <button
                        type='button'
                        onClick={e => {
                          e.preventDefault()
                          e.stopPropagation()
                          onRename(documento)
                          cerrarMenu()
                        }}
                        className='flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                      >
                        <Edit3 size={16} />
                        Renombrar
                      </button>
                    )}

                    {/* Separador - Sección de edición */}
                    <div className='my-1 border-t border-gray-200 dark:border-gray-700' />

                    {/* 🆕 Botón Editar Metadatos - para todos los usuarios */}
                    <button
                      type='button'
                      onClick={e => {
                        e.preventDefault()
                        e.stopPropagation()
                        abrirModalEditar()
                      }}
                      className='flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    >
                      <Edit size={16} />
                      Editar Documento
                    </button>

                    {/* Botón Ver Historial - si tiene versiones */}
                    {tieneVersiones && (
                      <>
                        {/* Separador entre Editar y Ver Historial */}
                        <div className='my-1 border-t border-gray-200 dark:border-gray-700' />

                        <button
                          type='button'
                          onClick={e => {
                            e.preventDefault()
                            e.stopPropagation()
                            abrirModalVersiones()
                          }}
                          className='flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                        >
                          <History size={16} />
                          Ver Historial (v{documento.version})
                        </button>
                      </>
                    )}

                    {/* Separador - Sección de versionado */}
                    {esDocumentoDeProceso && (
                      <div className='my-1 border-t border-gray-200 dark:border-gray-700' />
                    )}

                    {/* Botón Nueva Versión - siempre visible para proyectos */}
                    {esDocumentoDeProceso && (
                      <button
                        type='button'
                        onClick={e => {
                          e.preventDefault()
                          e.stopPropagation()
                          abrirModalNuevaVersion()
                        }}
                        className='flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                      >
                        <FileUp size={16} />
                        Nueva Versión
                      </button>
                    )}

                    {/* 🆕 Botón Reemplazar Archivo - SOLO ADMIN */}
                    {esAdmin && (
                      <>
                        <div className='my-1 border-t border-gray-200 dark:border-gray-700' />
                        <button
                          type='button'
                          onClick={e => {
                            e.preventDefault()
                            e.stopPropagation()
                            abrirModalReemplazar()
                          }}
                          className='flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-amber-600 transition-colors hover:bg-gray-100 dark:text-amber-400 dark:hover:bg-gray-700'
                        >
                          <RefreshCw size={16} />
                          <span>Reemplazar Archivo</span>
                          <Crown
                            size={13}
                            className='ml-auto text-amber-500 dark:text-amber-400'
                          />
                        </button>
                      </>
                    )}

                    {/* Separador - Sección de archivo */}
                    <div className='my-1 border-t border-gray-200 dark:border-gray-700' />

                    <button
                      type='button'
                      onClick={e => {
                        e.preventDefault()
                        e.stopPropagation()
                        onArchive(documento) // Hook detecta si restaurar o archivar
                        cerrarMenu()
                      }}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                        esArchivado
                          ? 'text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20'
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                    >
                      {esArchivado ? (
                        <RefreshCw size={16} />
                      ) : (
                        <Archive size={16} />
                      )}
                      {esArchivado ? 'Restaurar' : 'Archivar'}
                    </button>

                    {/* Separador antes de eliminar */}
                    {!estaProtegido && puedeEliminar && (
                      <div className='my-1 border-t border-gray-200 dark:border-gray-700' />
                    )}

                    {/* Botón eliminar - oculto si no tiene permiso o está protegido */}
                    {!estaProtegido && puedeEliminar && (
                      <button
                        type='button'
                        onClick={e => {
                          e.preventDefault()
                          e.stopPropagation()
                          cerrarMenu()
                          abrirConfirmacionEliminar(documento, tipoEntidad)
                        }}
                        className='flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20'
                      >
                        <Trash2 size={16} />
                        Eliminar
                      </button>
                    )}

                    {/* Mensaje informativo si está protegido */}
                    {estaProtegido && (
                      <div className='px-4 py-3 text-xs text-gray-500 dark:text-gray-400'>
                        <div className='flex items-start gap-2'>
                          <Lock
                            size={14}
                            className='mt-0.5 flex-shrink-0 text-emerald-600'
                          />
                          <div>
                            <p className='font-medium text-emerald-600 dark:text-emerald-400'>
                              Documento protegido
                            </p>
                            <p className='mt-1 leading-relaxed'>
                              Este documento pertenece a un proceso completado y
                              no puede eliminarse.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>,
                  document.body
                )}
            </div>
          </div>

          {/* Descripción (si existe) - Compacta */}
          {documento.descripcion && (
            <p className='mb-3 line-clamp-2 text-xs text-gray-600 dark:text-gray-400'>
              {documento.descripcion}
            </p>
          )}

          {/* 🆕 Sección de Motivo de Archivado (solo visible si está archivado) */}
          {esArchivado && documento.motivo_categoria && (
            <div className='mb-3 rounded-lg border border-amber-200 bg-amber-50/50 p-2.5 dark:border-amber-800 dark:bg-amber-900/20'>
              <div className='flex items-start gap-2'>
                <AlertCircle className='mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-400' />
                <div className='min-w-0 flex-1 space-y-1.5'>
                  <div>
                    <p className='text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400'>
                      Motivo:
                    </p>
                    <p className='text-xs font-medium text-amber-900 dark:text-amber-100'>
                      {formatMotivoArchivado(documento.motivo_categoria)}
                    </p>
                  </div>
                  {documento.motivo_detalle && (
                    <div>
                      <p className='text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400'>
                        Observaciones:
                      </p>
                      <p className='line-clamp-2 text-xs text-amber-700 dark:text-amber-300'>
                        {documento.motivo_detalle}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Metadatos en grid 2x2 con títulos (COMPACTO) */}
          <div className='mb-2.5 grid grid-cols-2 gap-2 text-xs'>
            {/* FILA 1: Fecha del documento + Fecha de expiración */}

            {/* Fecha de emisión del documento */}
            {documento.fecha_documento ? (
              <div className='flex items-center gap-1.5 text-gray-600 dark:text-gray-400'>
                <Calendar
                  size={12}
                  className='flex-shrink-0 text-blue-500 dark:text-blue-400'
                />
                <div className='min-w-0 flex-1'>
                  <div className='mb-0.5 text-[10px] font-medium uppercase leading-none tracking-wide text-gray-500 dark:text-gray-500'>
                    Emisión
                  </div>
                  <div
                    className='truncate text-xs font-medium'
                    title={`Fecha del documento: ${formatDateCompact(documento.fecha_documento)}`}
                  >
                    {formatDateCompact(documento.fecha_documento)}
                  </div>
                </div>
              </div>
            ) : (
              <div className='flex items-center gap-1.5 text-gray-400 dark:text-gray-500'>
                <Calendar size={12} className='flex-shrink-0' />
                <div className='min-w-0 flex-1'>
                  <div className='mb-0.5 text-[10px] font-medium uppercase leading-none tracking-wide text-gray-500 dark:text-gray-500'>
                    Emisión
                  </div>
                  <div className='text-xs'>Sin fecha</div>
                </div>
              </div>
            )}

            {/* Fecha de expiración */}
            <div className='flex items-start gap-1.5'>
              <Clock
                size={12}
                className='mt-3.5 flex-shrink-0 text-orange-500 dark:text-orange-400'
              />
              <div className='min-w-0 flex-1'>
                <div className='mb-0.5 text-[10px] font-medium uppercase leading-none tracking-wide text-gray-500 dark:text-gray-500'>
                  Expiración
                </div>
                {documento.fecha_vencimiento ? (
                  <div>
                    {estaVencido ? (
                      <span className='inline-flex items-center gap-1 rounded-md bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400'>
                        <AlertCircle size={11} />
                        Vencido {Math.abs(diasParaVencer ?? 0)}d
                      </span>
                    ) : diasParaVencer !== null && diasParaVencer <= 30 ? (
                      <span className='inline-flex items-center gap-1 rounded-md bg-orange-100 px-1.5 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'>
                        Vence en {diasParaVencer}d
                      </span>
                    ) : (
                      <div
                        className='truncate text-xs font-medium text-gray-600 dark:text-gray-400'
                        title={`Vence: ${formatDateCompact(documento.fecha_vencimiento)}`}
                      >
                        {formatDateCompact(documento.fecha_vencimiento)}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className='text-xs text-gray-400 dark:text-gray-500'>
                    No expira
                  </div>
                )}
              </div>
            </div>

            {/* FILA 2: Subido por + Fecha de subida */}

            {/* Subido por (usuario) */}
            <div className='flex items-center gap-1.5 text-gray-600 dark:text-gray-400'>
              <User
                size={12}
                className='flex-shrink-0 text-purple-500 dark:text-purple-400'
              />
              <div className='min-w-0 flex-1'>
                <div className='mb-0.5 text-[10px] font-medium uppercase leading-none tracking-wide text-gray-500 dark:text-gray-500'>
                  Subido por
                </div>
                <div
                  className='truncate text-xs font-medium'
                  title={`${documento.usuario ? `${documento.usuario.nombres} ${documento.usuario.apellidos}` : 'Desconocido'}`}
                >
                  {documento.usuario
                    ? `${documento.usuario.nombres} ${documento.usuario.apellidos}`
                    : 'Desconocido'}
                </div>
              </div>
            </div>

            {/* Fecha de subida al sistema */}
            <div className='flex items-center gap-1.5 text-gray-600 dark:text-gray-400'>
              <Upload
                size={12}
                className='flex-shrink-0 text-green-500 dark:text-green-400'
              />
              <div className='min-w-0 flex-1'>
                <div className='mb-0.5 text-[10px] font-medium uppercase leading-none tracking-wide text-gray-500 dark:text-gray-500'>
                  Carga
                </div>
                <div
                  className='truncate text-xs font-medium'
                  title={`Subido: ${formatDateCompact(documento.fecha_creacion)} a las ${format(new Date(documento.fecha_creacion), 'hh:mm a', { locale: es })}`}
                >
                  {formatDateCompact(documento.fecha_creacion)}{' '}
                  {format(new Date(documento.fecha_creacion), 'hh:mm a')}
                </div>
              </div>
            </div>
          </div>

          {/* Badge de estado del proceso */}
          {estadoProceso.esDeProceso && estadoProceso.estadoPaso && (
            <div className='mb-2.5'>
              <BadgeEstadoProceso estadoPaso={estadoProceso.estadoPaso} />
            </div>
          )}

          {/* Badge de proceso completado */}
          {estaProtegido && procesoInfo && (
            <div className='mb-3'>
              <div className='inline-flex items-center gap-1.5 rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'>
                <Lock size={12} />
                <span>Proceso Completado</span>
                {procesoInfo.pasoNombre && (
                  <span className='opacity-75'>• {procesoInfo.pasoNombre}</span>
                )}
              </div>
            </div>
          )}

          {/* Acciones principales - Botones balanceados */}
          <div className='mt-auto grid grid-cols-2 gap-2'>
            <button
              onClick={() => onView(documento)}
              className={`flex items-center justify-center gap-1.5 rounded-lg ${theme.classes.button.primary} px-3 py-2 text-sm font-medium transition-all`}
            >
              <Eye size={15} />
              <span>Ver</span>
            </button>
            <button
              onClick={() => onDownload(documento)}
              className='flex items-center justify-center gap-1.5 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            >
              <Download size={15} />
              <span>Descargar</span>
            </button>
          </div>
        </div>

        {/* Barra de color de categoría */}
        {categoria && (
          <div
            className='h-1 w-full'
            style={{
              background: `linear-gradient(to right, ${categoria.color}, transparent)`,
            }}
          />
        )}
      </motion.div>

      {/* Modales - FUERA del contenedor de la card */}
      <DocumentoVersionesModal
        isOpen={modalVersionesAbierto}
        documentoId={documento.id}
        onClose={cerrarModalVersiones}
        onVersionRestaurada={async () => {
          cerrarModalVersiones()
          // 🆕 Refrescar lista de documentos
          await onRefresh?.()
        }}
        tipoEntidad={tipoEntidad} // 🆕 Pasar tipo de entidad para queries correctas
        moduleName={moduleName} // 🎨 Pasar tema del módulo para colores dinámicos
      />

      <DocumentoNuevaVersionModal
        isOpen={modalNuevaVersionAbierto}
        documento={documento}
        tipoEntidad={tipoEntidad} // ✅ Pasar tipoEntidad
        onClose={cerrarModalNuevaVersion}
        onSuccess={async () => {
          cerrarModalNuevaVersion()
          // Refrescar lista de documentos
          await onRefresh?.()
        }}
      />

      {/* 🆕 Modal Editar Metadatos */}
      <DocumentoEditarMetadatosModal
        isOpen={modalEditarAbierto}
        documento={documento}
        categorias={categorias}
        tipoEntidad={tipoEntidad}
        moduleName={moduleName}
        onClose={cerrarModalEditar}
        onEditado={async () => {
          cerrarModalEditar()
          if (onRefresh) await onRefresh()
        }}
      />

      {/* 🆕 Modal Reemplazar Archivo (Solo Admin) */}
      {esAdmin && (
        <DocumentoReemplazarArchivoModal
          isOpen={modalReemplazarAbierto}
          documento={documento}
          tipoEntidad={tipoEntidad}
          moduleName={moduleName}
          onClose={cerrarModalReemplazar}
          onReemplazado={async () => {
            cerrarModalReemplazar()
            await onRefresh?.()
          }}
        />
      )}

      {/* Modal de confirmación de eliminación */}
      <ConfirmacionModal
        isOpen={confirmacionEliminar.isOpen}
        onClose={cerrarConfirmacionEliminar}
        onConfirm={async () => {
          await ejecutarEliminacion(tipoEntidad, async () => {
            await onRefresh?.()
          })
        }}
        variant={
          confirmacionEliminar.esDocumentoIdentidad
            ? 'warning'
            : confirmacionEliminar.esDocumentoCritico
              ? 'warning'
              : 'danger'
        }
        title={
          confirmacionEliminar.esDocumentoIdentidad
            ? '¿Eliminar documento de identidad?'
            : confirmacionEliminar.esDocumentoCritico
              ? '¿Eliminar documento crítico?'
              : '¿Eliminar documento?'
        }
        message={
          confirmacionEliminar.detectando
            ? 'Verificando el tipo de documento…'
            : confirmacionEliminar.esDocumentoIdentidad
              ? `Este es el documento de identidad del cliente (cédula o pasaporte).\n\nSin él, no podrán realizarse nuevas asignaciones de vivienda. Se moverá a la papelera y solo un usuario con rol de administrador podrá recuperarlo.`
              : confirmacionEliminar.esDocumentoCritico
                ? `Este documento es un requisito obligatorio para el desembolso${
                    confirmacionEliminar.entidadAfectada
                      ? ` (${confirmacionEliminar.entidadAfectada})`
                      : ''
                  }. Al eliminarlo quedará registrado como pendiente nuevamente.\n\nSe moverán a la papelera ${
                    confirmacionEliminar.totalVersiones > 1
                      ? `las ${confirmacionEliminar.totalVersiones} versiones`
                      : 'el documento'
                  }. Puede recuperarlos desde administración.`
                : `Esta acción moverá el documento${
                    confirmacionEliminar.totalVersiones > 1
                      ? ` y sus ${confirmacionEliminar.totalVersiones} versiones`
                      : ''
                  } a la papelera. Puede recuperarlo desde el panel de administración.`
        }
        confirmText={
          confirmacionEliminar.esDocumentoIdentidad ||
          confirmacionEliminar.esDocumentoCritico
            ? 'Entiendo, eliminar de todas formas'
            : 'Sí, eliminar'
        }
        isLoading={confirmacionEliminar.detectando || eliminando}
        loadingText={
          confirmacionEliminar.detectando ? 'Verificando…' : 'Eliminando…'
        }
      />
    </>
  )
}
