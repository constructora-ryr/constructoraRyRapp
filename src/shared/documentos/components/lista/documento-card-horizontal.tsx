'use client'

import { useRef, useState } from 'react'

import { motion } from 'framer-motion'
import {
  AlertCircle,
  Archive,
  Crown,
  Download,
  Edit,
  Edit3,
  FileText,
  FileUp,
  FolderPlus,
  History,
  Image as ImageIcon,
  Lock,
  MoreVertical,
  Pin,
  RefreshCw,
  Trash2,
} from 'lucide-react'
import { createPortal } from 'react-dom'

import { formatDateCompact } from '@/lib/utils/date.utils'
import { ConfirmacionModal } from '@/shared/components/modals'
import { type ModuleName } from '@/shared/config/module-themes'

import { useDocumentoCard } from '../../hooks'
import { useDocumentoThumbnail } from '../../hooks/useDocumentoThumbnail'
import {
  CategoriaDocumento,
  DocumentoProyecto,
  formatFileSize,
  getFileExtension,
} from '../../types/documento.types'
import type { TipoEntidad } from '../../types/entidad.types'
import { colorCategoria } from '../../utils/categoria-color'
import {
  getAvatarColor,
  getFileTypeColor,
  getInitials,
} from '../../utils/documento-card.utils'
import { BadgeEstadoProceso } from '../badge-estado-proceso'
import {
  DocumentoEditarMetadatosModal,
  DocumentoNuevaVersionModal,
  DocumentoReemplazarArchivoModal,
  DocumentoVersionesModal,
} from '../modals'

const insignia =
  'inline-flex flex-shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset'

/** Chip de categoría: fondo con su color, punto y nombre (completo en tooltip) */
function ChipCategoria({
  categoria,
}: {
  categoria: { nombre: string; color: string }
}) {
  const hex = colorCategoria(categoria.color)
  return (
    <span
      title={categoria.nombre}
      className='inline-flex max-w-full items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium text-slate-700 dark:text-slate-200'
      style={{ backgroundColor: `${hex}1f` }}
    >
      <span
        className='h-2 w-2 flex-shrink-0 rounded-full'
        style={{ backgroundColor: hex }}
      />
      <span className='truncate'>{categoria.nombre}</span>
    </span>
  )
}

interface DocumentoCardHorizontalProps {
  documento: DocumentoProyecto
  categoria?: { nombre: string; color: string; icono: string }
  categorias?: CategoriaDocumento[]
  onView: (documento: DocumentoProyecto) => void
  onDownload: (documento: DocumentoProyecto) => void
  onToggleImportante: (documento: DocumentoProyecto) => void
  onArchive: (documento: DocumentoProyecto) => void
  onDelete?: (documento: DocumentoProyecto) => void
  onRename?: (documento: DocumentoProyecto) => void
  onMoverACarpeta?: (documento: DocumentoProyecto) => void
  onRefresh?: () => void | Promise<void>
  tipoEntidad?: TipoEntidad
  moduleName?: ModuleName
  esArchivado?: boolean
}

export function DocumentoCardHorizontal({
  documento,
  categoria,
  categorias = [],
  onView,
  onDownload,
  onToggleImportante,
  onArchive,
  onDelete: _onDelete,
  onRename,
  onMoverACarpeta,
  onRefresh,
  tipoEntidad = 'proyecto',
  moduleName = 'clientes',
  esArchivado = false,
}: DocumentoCardHorizontalProps) {
  const {
    esAdmin,
    menuAbierto,
    menuRef,
    toggleMenu,
    cerrarMenu,
    estaProtegido,
    puedeEliminar,
    puedeEditar,
    puedeArchivar,
    puedeSubir,
    procesoInfo: _procesoInfo,
    estadoProceso,
    verificando: _verificando,
    esDocumentoDeProceso,
    modalEditarAbierto,
    abrirModalEditar,
    cerrarModalEditar,
    modalReemplazarAbierto,
    abrirModalReemplazar,
    cerrarModalReemplazar,
    modalVersionesAbierto,
    abrirModalVersiones,
    cerrarModalVersiones,
    modalNuevaVersionAbierto,
    abrirModalNuevaVersion,
    cerrarModalNuevaVersion,
    confirmacionEliminar,
    abrirConfirmacionEliminar,
    cerrarConfirmacionEliminar,
    ejecutarEliminacion,
    eliminando,
    // Cálculos de fechas delegados al hook
    estaVencido,
    estaProximoAVencer,
    tieneVersiones,
  } = useDocumentoCard({ documento, esDocumentoProyecto: true })

  // Thumbnail para imágenes — lógica de Storage encapsulada en hook
  const esImagen = documento.tipo_mime?.startsWith('image/')
  const thumbnailUrl = useDocumentoThumbnail({
    esImagen: esImagen ?? false,
    urlStorage: documento.url_storage,
    tipoEntidad,
  })

  const [miniaturaFallo, setMiniaturaFallo] = useState(false)
  const extension = getFileExtension(documento.nombre_archivo)
  const colorTipo = getFileTypeColor(extension, documento.tipo_mime)

  // Fecha de emisión del documento; si no se registró, la de subida
  const fechaMostrada = formatDateCompact(
    documento.fecha_documento || documento.fecha_creacion
  )
  const fechaSubida = formatDateCompact(documento.fecha_creacion)
  const tituloFecha = documento.fecha_documento
    ? `Emitido el ${fechaMostrada} · subido el ${fechaSubida}`
    : `Sin fecha de emisión · subido el ${fechaSubida}`

  // Portal positioning para el menú
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
      const rightOffset = window.innerWidth - rect.right
      const MARGIN = 8
      if (spaceBelow < 150) {
        setMenuPos({
          bottom: window.innerHeight - rect.top + MARGIN,
          right: rightOffset,
          maxHeight: rect.top - MARGIN,
        })
      } else {
        setMenuPos({
          top: rect.bottom + MARGIN,
          right: rightOffset,
          maxHeight: spaceBelow - MARGIN,
        })
      }
    }
    toggleMenu()
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      onClick={() => onView(documento)}
      className='group relative flex cursor-pointer items-center gap-3 overflow-hidden px-4 py-3 transition-colors duration-100 hover:bg-slate-50 dark:hover:bg-slate-700/30'
    >
      {/* ICONO / MINIATURA — color por tipo de archivo; si la imagen no carga, ícono */}
      <div className='relative flex-shrink-0'>
        {esImagen && thumbnailUrl && !miniaturaFallo ? (
          <div className='h-10 w-10 overflow-hidden rounded-xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-700'>
            {/* eslint-disable-next-line @next/next/no-img-element -- Miniatura firmada de Supabase Storage con dimensiones variables; next/image requeriría width/height fijos */}
            <img
              src={thumbnailUrl}
              alt={documento.titulo}
              loading='lazy'
              onError={() => setMiniaturaFallo(true)}
              className='h-full w-full object-cover'
            />
          </div>
        ) : (
          <div
            className='flex h-10 w-10 items-center justify-center rounded-xl'
            style={{ background: `${colorTipo}1f` }}
          >
            {esImagen ? (
              <ImageIcon size={18} style={{ color: colorTipo }} />
            ) : (
              <FileText size={18} style={{ color: colorTipo }} />
            )}
          </div>
        )}
        <span
          className='absolute -bottom-1 -right-1 rounded-md px-1 py-px font-mono text-[9px] font-bold uppercase leading-none tracking-wide text-white shadow-sm ring-2 ring-white dark:ring-slate-800'
          style={{ backgroundColor: colorTipo }}
        >
          {extension}
        </span>
        {documento.es_importante && (
          <div className='absolute -left-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 shadow ring-2 ring-white dark:ring-slate-800'>
            <Pin size={8} className='fill-white text-white' />
          </div>
        )}
      </div>

      {/* NOMBRE + METADATA — columna principal, crece */}
      <div className='flex min-w-0 flex-1 flex-col'>
        <div className='flex min-w-0 flex-wrap items-center gap-1.5 md:flex-nowrap'>
          <span
            className='line-clamp-2 min-w-0 text-sm font-semibold text-slate-900 dark:text-white md:truncate'
            title={documento.titulo}
          >
            {documento.titulo}
          </span>
          {documento.es_importante && (
            <span
              className={`${insignia} bg-cyan-50 text-cyan-700 ring-cyan-600/20 dark:bg-cyan-500/10 dark:text-cyan-300`}
            >
              <Pin size={9} className='fill-current' />
              Anclado
            </span>
          )}
          {documento.es_documento_identidad && (
            <span
              className={`${insignia} bg-amber-50 text-amber-800 ring-amber-600/25 dark:bg-amber-500/10 dark:text-amber-300`}
            >
              <Lock size={9} />
              Identidad
            </span>
          )}
          {estaProtegido && (
            <span title='Documento protegido' className='flex-shrink-0'>
              <Lock
                size={13}
                className='text-emerald-500 dark:text-emerald-400'
              />
            </span>
          )}
          {documento.version > 1 && (
            <span
              className={`${insignia} bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-500/10 dark:text-violet-300`}
            >
              v{documento.version}
            </span>
          )}
          {estaVencido && (
            <span
              className={`${insignia} bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-300`}
            >
              <AlertCircle size={9} />
              Vencido
            </span>
          )}
          {!estaVencido && estaProximoAVencer && (
            <span
              className={`${insignia} bg-orange-50 text-orange-700 ring-orange-600/20 dark:bg-orange-500/10 dark:text-orange-300`}
            >
              <AlertCircle size={9} />
              Por vencer
            </span>
          )}
        </div>
        {estadoProceso.esDeProceso && estadoProceso.estadoPaso && (
          <div className='mt-0.5'>
            <BadgeEstadoProceso estadoPaso={estadoProceso.estadoPaso} />
          </div>
        )}
        {/* Celular: categoría, fecha y tamaño debajo del nombre */}
        <div className='mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400 md:hidden'>
          {categoria && <ChipCategoria categoria={categoria} />}
          <span className='tabular-nums' title={tituloFecha}>
            {fechaMostrada}
            {documento.fecha_documento ? null : ' (subido)'}
          </span>
          <span className='tabular-nums'>
            · {formatFileSize(documento.tamano_bytes)}
          </span>
        </div>
      </div>

      {/* CATEGORÍA — chip con su color; nombre completo al pasar el cursor */}
      <div className='hidden w-44 flex-shrink-0 md:block'>
        {categoria ? (
          <ChipCategoria categoria={categoria} />
        ) : (
          <span className='text-xs text-slate-300 dark:text-slate-600'>—</span>
        )}
      </div>

      {/* SUBIDO POR — avatar + nombre, w-[160px], estilo Google Drive */}
      <div className='hidden w-[160px] flex-shrink-0 items-center gap-2 lg:flex'>
        {documento.usuario ? (
          <>
            <div
              className='flex h-7 w-7 flex-shrink-0 cursor-default items-center justify-center rounded-full text-[10px] font-bold text-white shadow-sm'
              style={{
                backgroundColor: getAvatarColor(
                  `${documento.usuario.nombres}${documento.usuario.apellidos}`
                ),
              }}
              title={`${documento.usuario.nombres} ${documento.usuario.apellidos}`}
            >
              {getInitials(
                documento.usuario.nombres,
                documento.usuario.apellidos
              )}
            </div>
            <span
              className='truncate text-xs text-slate-600 dark:text-slate-300'
              title={`${documento.usuario.nombres} ${documento.usuario.apellidos}`}
            >
              {documento.usuario.nombres} {documento.usuario.apellidos}
            </span>
          </>
        ) : (
          <span className='text-xs italic text-gray-400 dark:text-gray-500'>
            —
          </span>
        )}
      </div>

      {/* FECHA DE EMISIÓN (si no la tiene, la de subida en gris) */}
      <div
        className='hidden w-[100px] flex-shrink-0 lg:block'
        title={tituloFecha}
      >
        {documento.fecha_documento ? (
          <span className='text-xs tabular-nums text-slate-600 dark:text-slate-300'>
            {fechaMostrada}
          </span>
        ) : (
          <span className='flex flex-col text-xs tabular-nums text-slate-400 dark:text-slate-500'>
            {fechaMostrada}
            <span className='text-[10px] uppercase tracking-wide'>subido</span>
          </span>
        )}
      </div>
      {/* TAMAÑO — w-[72px] hidden below lg */}
      <div className='hidden w-[76px] flex-shrink-0 text-right lg:block'>
        <span className='text-xs tabular-nums text-slate-500 dark:text-slate-400'>
          {formatFileSize(documento.tamano_bytes)}
        </span>
      </div>

      {/* ACCIONES — w-[68px], visibles en hover */}
      <div
        className='flex w-auto flex-shrink-0 items-center justify-end gap-0.5 md:w-[76px]'
        onClick={e => e.stopPropagation()}
      >
        <div className='flex items-center gap-0.5 transition-opacity duration-150 focus-within:opacity-100 group-hover:opacity-100 [@media(hover:hover)]:opacity-0'>
          <button
            onClick={() => onDownload(documento)}
            className='flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-200 md:h-8 md:w-8'
            title='Descargar'
            aria-label='Descargar documento'
          >
            <Download size={14} />
          </button>

          {/* Menú de opciones con portal - solo visible si tiene algún permiso de acción */}
          {(puedeEditar ||
            puedeArchivar ||
            puedeSubir ||
            puedeEliminar ||
            esAdmin) && (
            <>
              <button
                ref={triggerRef}
                type='button'
                onClick={handleAbrirMenu}
                className='flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-200 md:h-8 md:w-8'
                title='Más opciones'
                aria-label='Más opciones'
              >
                <MoreVertical size={14} />
              </button>

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
                    className='min-w-[200px] rounded-xl border border-gray-200 bg-white py-1 shadow-2xl dark:border-gray-700 dark:bg-gray-800'
                  >
                    {puedeEditar ? (
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
                          size={15}
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
                    ) : null}

                    {onRename && puedeEditar ? (
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
                        <Edit3 size={15} />
                        Renombrar
                      </button>
                    ) : null}

                    {onMoverACarpeta && !esArchivado && puedeEditar ? (
                      <button
                        type='button'
                        onClick={e => {
                          e.preventDefault()
                          e.stopPropagation()
                          onMoverACarpeta(documento)
                          cerrarMenu()
                        }}
                        className='flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                      >
                        <FolderPlus size={15} />
                        Mover a carpeta
                      </button>
                    ) : null}

                    {puedeEditar ? (
                      <>
                        <div className='my-1 border-t border-gray-100 dark:border-gray-700' />
                        <button
                          type='button'
                          onClick={e => {
                            e.preventDefault()
                            e.stopPropagation()
                            abrirModalEditar()
                          }}
                          className='flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                        >
                          <Edit size={15} />
                          Editar Documento
                        </button>
                      </>
                    ) : null}

                    {tieneVersiones && (
                      <>
                        <div className='my-1 border-t border-gray-100 dark:border-gray-700' />
                        <button
                          type='button'
                          onClick={e => {
                            e.preventDefault()
                            e.stopPropagation()
                            abrirModalVersiones()
                          }}
                          className='flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                        >
                          <History size={15} />
                          Ver Historial (v{documento.version})
                        </button>
                      </>
                    )}

                    {esDocumentoDeProceso && puedeSubir ? (
                      <>
                        <div className='my-1 border-t border-gray-100 dark:border-gray-700' />
                        <button
                          type='button'
                          onClick={e => {
                            e.preventDefault()
                            e.stopPropagation()
                            abrirModalNuevaVersion()
                          }}
                          className='flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                        >
                          <FileUp size={15} />
                          Nueva Versión
                        </button>
                      </>
                    ) : null}

                    {esAdmin && (
                      <>
                        <div className='my-1 border-t border-gray-100 dark:border-gray-700' />
                        <button
                          type='button'
                          onClick={e => {
                            e.preventDefault()
                            e.stopPropagation()
                            abrirModalReemplazar()
                          }}
                          className='flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-amber-600 transition-colors hover:bg-gray-100 dark:text-amber-400 dark:hover:bg-gray-700'
                        >
                          <RefreshCw size={15} />
                          <span>Reemplazar Archivo</span>
                          <Crown
                            size={12}
                            className='ml-auto text-amber-500 dark:text-amber-400'
                          />
                        </button>
                      </>
                    )}

                    <div className='my-1 border-t border-gray-100 dark:border-gray-700' />

                    {puedeArchivar ? (
                      <button
                        type='button'
                        onClick={e => {
                          e.preventDefault()
                          e.stopPropagation()
                          onArchive(documento)
                          cerrarMenu()
                        }}
                        className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                          esArchivado
                            ? 'text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20'
                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                      >
                        {esArchivado ? (
                          <RefreshCw size={15} />
                        ) : (
                          <Archive size={15} />
                        )}
                        {esArchivado ? 'Restaurar' : 'Archivar'}
                      </button>
                    ) : null}

                    {!estaProtegido && puedeEliminar && (
                      <>
                        <div className='my-1 border-t border-gray-100 dark:border-gray-700' />
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
                          <Trash2 size={15} />
                          Eliminar
                        </button>
                      </>
                    )}

                    {estaProtegido && (
                      <div className='px-3 py-2.5'>
                        <div className='flex items-start gap-2'>
                          <Lock
                            size={13}
                            className='mt-0.5 flex-shrink-0 text-emerald-600'
                          />
                          <div>
                            <p className='text-xs font-medium text-emerald-600 dark:text-emerald-400'>
                              Documento protegido
                            </p>
                            <p className='mt-0.5 text-xs leading-relaxed text-gray-500 dark:text-gray-400'>
                              Pertenece a un proceso completado.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>,
                  document.body
                )}
            </>
          )}
        </div>
        {/* fin hover-actions */}
      </div>
      {/* fin acciones */}

      {/* Modales */}
      {modalVersionesAbierto && (
        <DocumentoVersionesModal
          isOpen={modalVersionesAbierto}
          documentoId={documento.id}
          onClose={cerrarModalVersiones}
          onVersionRestaurada={async () => {
            cerrarModalVersiones()
            await onRefresh?.()
          }}
        />
      )}

      {modalNuevaVersionAbierto && (
        <DocumentoNuevaVersionModal
          isOpen={modalNuevaVersionAbierto}
          documento={documento}
          tipoEntidad={tipoEntidad}
          onClose={cerrarModalNuevaVersion}
          onSuccess={async () => {
            cerrarModalNuevaVersion()
            await onRefresh?.()
          }}
        />
      )}

      {modalEditarAbierto && (
        <DocumentoEditarMetadatosModal
          isOpen={modalEditarAbierto}
          documento={documento}
          categorias={categorias}
          tipoEntidad={tipoEntidad}
          moduleName={moduleName}
          onClose={cerrarModalEditar}
          onEditado={async () => {
            cerrarModalEditar()
            await onRefresh?.()
          }}
        />
      )}

      {modalReemplazarAbierto && (
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
      {confirmacionEliminar.isOpen && (
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
          message={(() => {
            const notasMsg =
              confirmacionEliminar.notasVinculadas > 0
                ? `\n\nEste documento está vinculado a ${confirmacionEliminar.notasVinculadas === 1 ? '1 nota' : `${confirmacionEliminar.notasVinculadas} notas`} del historial. El vínculo desaparecerá pero las notas se conservarán.`
                : ''

            if (confirmacionEliminar.detectando)
              return 'Verificando el tipo de documento…'
            if (confirmacionEliminar.esDocumentoIdentidad)
              return `Este es el documento de identidad del cliente (cédula o pasaporte).\n\nSin él, no podrán realizarse nuevas asignaciones de vivienda. Se moverá a la papelera y solo un usuario con rol de administrador podrá recuperarlo.${notasMsg}`
            if (confirmacionEliminar.esDocumentoCritico)
              return `Este documento es un requisito obligatorio para el desembolso${
                confirmacionEliminar.entidadAfectada
                  ? ` (${confirmacionEliminar.entidadAfectada})`
                  : ''
              }. Al eliminarlo quedará registrado como pendiente nuevamente.\n\nSe moverán a la papelera ${
                confirmacionEliminar.totalVersiones > 1
                  ? `las ${confirmacionEliminar.totalVersiones} versiones`
                  : 'el documento'
              }. Puede recuperarlos desde administración.${notasMsg}`
            return `Esta acción moverá el documento${
              confirmacionEliminar.totalVersiones > 1
                ? ` y sus ${confirmacionEliminar.totalVersiones} versiones`
                : ''
            } a la papelera. Puede recuperarlo desde el panel de administración.${notasMsg}`
          })()}
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
      )}
    </motion.div>
  )
}
