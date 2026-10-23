'use client'

import { useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import {
  Archive,
  ArrowUpDown,
  Calendar,
  ChevronDown,
  ChevronUp,
  FileText,
  FileX,
  Folder,
  FolderCog,
  FolderPlus,
  Pin,
  Upload,
} from 'lucide-react'

import { usePermisosQuery } from '@/modules/usuarios/hooks'
import type { Modulo } from '@/modules/usuarios/types'
import { ConfirmacionModal } from '@/shared/components/modals/ConfirmacionModal'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { type ModuleName } from '@/shared/config/module-themes'
import type { CarpetaConConteo } from '@/shared/documentos/types/carpeta.types'
import type { DocumentoProyecto } from '@/shared/documentos/types/documento.types'
import { cn } from '@/shared/utils/helpers'

import { temaDocumentos } from '../../config/documentos-tema'
import { useDocumentosLista, type SortCol } from '../../hooks'
import { useDocumentosStore } from '../../store/documentos.store'
import { obtenerConfiguracionEntidad, type TipoEntidad } from '../../types'
import {
  CarpetaBreadcrumbs,
  CarpetaCard,
  CarpetaFormModal,
  MoverACarpetaModal,
} from '../carpetas'
import { ArchivarDocumentoModal, RestaurarDocumentoModal } from '../modals'
import { DocumentoViewer } from '../viewer/documento-viewer'

import { DocumentoCardHorizontal } from './documento-card-horizontal'
import { DocumentosFiltros } from './documentos-filtros'
import { DocumentosListaEsqueleto } from './DocumentosListaEsqueleto'

interface DocumentosListaProps {
  entidadId: string // ✅ GENÉRICO (antes proyectoId)
  tipoEntidad: TipoEntidad // ✅ NUEVO: 'proyecto', 'vivienda', etc.
  onViewDocumento?: (documento: DocumentoProyecto) => void
  onUploadClick?: (carpetaId?: string | null) => void
  onCategoriasClick?: () => void // 🗂 Acción de gestionar categorías
  moduleName?: ModuleName // 🎨 Tema del módulo
  defaultVista?: 'grid' | 'lista'
}

export function DocumentosLista({
  entidadId,
  tipoEntidad,
  onViewDocumento,
  onUploadClick,
  onCategoriasClick,
  moduleName, // 🎨 Inferir desde tipoEntidad si no se pasa
  defaultVista = 'lista',
}: DocumentosListaProps) {
  // 🎨 Auto-inferir moduleName desde tipoEntidad si no se especifica
  const config = obtenerConfiguracionEntidad(tipoEntidad)
  const themeModuleName = moduleName || config.moduleName

  // 🔒 Permisos: basados en permisos_rol del módulo 'documentos', no del módulo padre
  const { puede, esAdmin } = usePermisosQuery()
  const canUpload = esAdmin || puede('documentos' as Modulo, 'subir')
  const canCreate = canUpload // "Nueva carpeta" también requiere poder subir
  const canDelete = esAdmin || puede('documentos' as Modulo, 'eliminar')
  const vistaActual = useDocumentosStore(state => state.vistaActual)
  const setVistaActual = useDocumentosStore(state => state.setVistaActual)

  const {
    vista: _vista,
    setVista: _setVista,
    documentoSeleccionado,
    modalViewerAbierto,
    urlPreview,
    errorPreview,
    modalArchivarAbierto,
    setModalArchivarAbierto, // ✅ Extraer setter del hook
    documentoParaArchivar,
    modalRestaurarAbierto,
    setModalRestaurarAbierto,
    documentoParaRestaurar,
    procesandoRestaurar,
    modalEliminarAbierto,
    documentoParaEliminar: _documentoParaEliminar,
    datosModalEliminar,
    procesandoEliminar,
    confirmarEliminar,
    cancelarEliminar,
    documentosMostrar,
    documentosOrdenados,
    navegacionViewer,
    sortCol,
    sortDir,
    toggleSort,
    categorias,
    cargandoDocumentos,
    hasDocumentos,
    tipoEntidad: tipoEntidadFromHook, // ✅ Extraer tipoEntidad del hook
    // ✅ Carpetas
    carpetas,
    carpetaActualId,
    breadcrumbs,
    navegarACarpeta,
    handleCrearCarpeta,
    handleRenombrarCarpeta,
    handleEliminarCarpeta,
    handleMoverDocumento,
    crearCarpetaCargando,
    moverDocumentoCargando,
    handleView,
    handleCloseViewer,
    handleDownload,
    handleToggleImportante,
    handleArchive,
    confirmarArchivado,
    confirmarRestauracion,
    handleDelete,
    getCategoriaByDocumento,
    refrescar, // 🆕 Para refrescar después de editar/reemplazar
  } = useDocumentosLista({
    entidadId,
    tipoEntidad,
    onViewDocumento,
    defaultVista,
  })

  // Estado de modales de carpetas
  const [modalCarpetaAbierto, setModalCarpetaAbierto] = useState(false)
  const [carpetaParaEditar, setCarpetaParaEditar] =
    useState<CarpetaConConteo | null>(null)
  const [modalMoverAbierto, setModalMoverAbierto] = useState(false)
  const [documentoParaMover, setDocumentoParaMover] =
    useState<DocumentoProyecto | null>(null)
  const [carpetaParaEliminar, setCarpetaParaEliminar] =
    useState<CarpetaConConteo | null>(null)

  // renderSortBtn: función UI pura que consume sortCol/sortDir/toggleSort del hook
  const renderSortBtn = (col: SortCol, label: string) => {
    const active = sortCol === col
    return (
      <button
        type='button'
        onClick={() => toggleSort(col)}
        className={`flex items-center gap-0.5 text-[11px] font-semibold uppercase tracking-wider transition-colors ${
          active ? 'text-white' : 'text-white/75 hover:text-white'
        }`}
      >
        {label}
        {active ? (
          sortDir === 'asc' ? (
            <ChevronUp className='h-3 w-3' />
          ) : (
            <ChevronDown className='h-3 w-3' />
          )
        ) : (
          <ArrowUpDown className='h-3 w-3 opacity-40' />
        )}
      </button>
    )
  }

  const encabezado =
    'text-[11px] font-semibold uppercase tracking-wider text-white/75'

  // 🆕 Wrapper para refrescar (compatible con tipo void)
  const handleRefresh = async () => {
    await refrescar()
  }

  if (cargandoDocumentos) {
    return <DocumentosListaEsqueleto moduleName={themeModuleName} />
  }

  const tema = temaDocumentos(themeModuleName)
  const ancladosCount = documentosMostrar.filter(d => d.es_importante).length
  const porVencerCount = documentosMostrar.filter(d => {
    if (!d.fecha_vencimiento) return false
    const dias = Math.ceil(
      (new Date(d.fecha_vencimiento).getTime() - Date.now()) /
        (1000 * 60 * 60 * 24)
    )
    return dias >= 0 && dias <= 30
  }).length

  const tabs = [
    { id: 'activos' as const, label: 'Activos', icon: FileText },
    { id: 'archivados' as const, label: 'Archivados', icon: Archive },
  ]

  return (
    <div className='space-y-4'>
      {/* Encabezado: pestañas + acciones */}
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div
          role='tablist'
          aria-label='Estado de los documentos'
          className='inline-flex gap-1 self-start rounded-2xl border border-slate-200/80 bg-white p-1 shadow-sm dark:border-slate-700/60 dark:bg-slate-800/60'
        >
          {tabs.map(t => {
            const Icon = t.icon
            const activo = vistaActual === t.id
            return (
              <button
                key={t.id}
                type='button'
                role='tab'
                aria-selected={activo}
                onClick={() => setVistaActual(t.id)}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-150',
                  activo
                    ? cn(
                        'bg-gradient-to-r text-white shadow-md',
                        tema.gradient,
                        tema.sombra
                      )
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-700/60 dark:hover:text-slate-200'
                )}
              >
                <Icon className='h-4 w-4' />
                {t.label}
              </button>
            )
          })}
        </div>

        {canCreate && (onCategoriasClick || onUploadClick) ? (
          <div className='flex flex-wrap items-center gap-2'>
            {onCategoriasClick ? (
              <button
                type='button'
                onClick={onCategoriasClick}
                className='group inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-700'
              >
                <FolderCog className='h-4 w-4 transition-transform group-hover:rotate-12' />
                Categorías
              </button>
            ) : null}
            {onUploadClick ? (
              <button
                type='button'
                onClick={() => onUploadClick(carpetaActualId)}
                className={cn(
                  'inline-flex h-10 items-center gap-1.5 rounded-xl bg-gradient-to-r px-4 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg',
                  tema.gradient,
                  tema.sombra
                )}
              >
                <Upload className='h-4 w-4' />
                Subir documento
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* Breadcrumbs de carpetas */}
      {breadcrumbs.length > 1 ? (
        <CarpetaBreadcrumbs
          breadcrumbs={breadcrumbs}
          onNavigate={navegarACarpeta}
          moduleName={themeModuleName}
        />
      ) : null}

      {/* Carpetas (solo activos) */}
      {vistaActual === 'activos' ? (
        <section className='rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-700/60 dark:bg-slate-800/60'>
          <div className='mb-3 flex items-center justify-between gap-2'>
            <h3 className='flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white'>
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-sm',
                  tema.gradient
                )}
              >
                <Folder className='h-4 w-4' />
              </span>
              Carpetas
              {carpetas.length > 0 && (
                <span className='rounded-full bg-slate-100 px-2 py-px text-[11px] font-semibold text-slate-500 dark:bg-slate-700 dark:text-slate-300'>
                  {carpetas.length}
                </span>
              )}
            </h3>
            {canCreate ? (
              <button
                type='button'
                onClick={() => {
                  setCarpetaParaEditar(null)
                  setModalCarpetaAbierto(true)
                }}
                className={cn(
                  'inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition-colors hover:bg-slate-100 dark:hover:bg-slate-700',
                  tema.texto
                )}
              >
                <FolderPlus className='h-4 w-4' />
                Nueva carpeta
              </button>
            ) : null}
          </div>
          {carpetas.length > 0 ? (
            <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4'>
              {carpetas.map(carpeta => (
                <CarpetaCard
                  key={carpeta.id}
                  carpeta={carpeta}
                  moduleName={themeModuleName}
                  onOpen={navegarACarpeta}
                  onRename={c => {
                    setCarpetaParaEditar(c)
                    setModalCarpetaAbierto(true)
                  }}
                  onDelete={c => {
                    setCarpetaParaEliminar(c)
                  }}
                />
              ))}
            </div>
          ) : (
            <p className='rounded-xl border border-dashed border-slate-200 px-3 py-3 text-center text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400'>
              Sin carpetas: crea una para organizar los documentos
            </p>
          )}
        </section>
      ) : null}

      {/* Barra de filtros + contadores */}
      <div className='space-y-2'>
        <DocumentosFiltros
          categorias={categorias}
          moduleName={themeModuleName}
        />
        {documentosMostrar.length > 0 ? (
          <p className='flex flex-wrap items-center gap-x-3 gap-y-1 px-1 text-xs text-slate-500 dark:text-slate-400'>
            <span className='font-semibold text-slate-700 dark:text-slate-200'>
              {documentosMostrar.length}{' '}
              {documentosMostrar.length === 1 ? 'documento' : 'documentos'}
            </span>
            {ancladosCount > 0 ? (
              <span
                className={cn('inline-flex items-center gap-1', tema.texto)}
              >
                <Pin className='h-3 w-3 fill-current' />
                {ancladosCount} {ancladosCount === 1 ? 'anclado' : 'anclados'}
              </span>
            ) : null}
            {porVencerCount > 0 ? (
              <span className='inline-flex items-center gap-1 font-medium text-orange-700 dark:text-orange-400'>
                <Calendar className='h-3 w-3' />
                {porVencerCount} por vencer
              </span>
            ) : null}
          </p>
        ) : null}
      </div>

      {/* Lista de documentos */}
      {documentosMostrar.length === 0 ? (
        carpetas.length > 0 && vistaActual === 'activos' ? (
          <EmptyState
            icon={FileX}
            title='Sin archivos en esta ubicación'
            description='Puedes subir archivos directamente aquí o abrir una carpeta'
            action={
              onUploadClick && canCreate
                ? {
                    label: 'Subir archivo aquí',
                    onClick: () => onUploadClick?.(carpetaActualId),
                  }
                : undefined
            }
            moduleName={themeModuleName}
            className='py-8'
          />
        ) : (
          <EmptyState
            icon={vistaActual === 'archivados' ? Archive : FileX}
            title={
              vistaActual === 'archivados'
                ? 'No hay documentos archivados'
                : 'No se encontraron documentos'
            }
            description={
              vistaActual === 'archivados'
                ? 'Los documentos que archives aparecerán aquí'
                : !hasDocumentos
                  ? `Aún no has subido ningún documento a este ${config.nombreSingular}`
                  : 'No hay documentos que coincidan con los filtros aplicados'
            }
            action={
              !hasDocumentos &&
              onUploadClick &&
              canCreate &&
              vistaActual === 'activos'
                ? {
                    label: 'Subir primer documento',
                    onClick: () => onUploadClick?.(carpetaActualId),
                  }
                : undefined
            }
            moduleName={themeModuleName}
          />
        )
      ) : (
        <div className='overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-700/60 dark:bg-slate-800/60'>
          {/* Encabezado con el degradado del módulo (solo escritorio) */}
          <div
            className={cn(
              'hidden items-center gap-3 bg-gradient-to-r px-4 py-2.5 md:flex',
              tema.gradient
            )}
          >
            <div className='flex min-w-0 flex-1 items-center pl-[52px]'>
              {renderSortBtn('titulo', 'Nombre')}
            </div>
            <div className='w-44 flex-shrink-0'>
              <span className={encabezado}>Categoría</span>
            </div>
            <div className='hidden w-[160px] flex-shrink-0 lg:block'>
              <span className={encabezado}>Subido por</span>
            </div>
            <div className='hidden w-[100px] flex-shrink-0 lg:block'>
              {renderSortBtn('fecha_documento', 'Emisión')}
            </div>
            <div className='hidden w-[76px] flex-shrink-0 justify-end lg:flex'>
              {renderSortBtn('tamano_bytes', 'Tamaño')}
            </div>
            <div className='w-[76px] flex-shrink-0' />
          </div>
          <AnimatePresence mode='popLayout'>
            <motion.div
              key='lista'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='divide-y divide-slate-100 dark:divide-slate-700/50'
            >
              {documentosOrdenados.map((documento, index) => {
                const categoria = getCategoriaByDocumento(documento)
                return (
                  <motion.div
                    key={documento.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: Math.min(index, 15) * 0.015 }}
                  >
                    <DocumentoCardHorizontal
                      documento={documento}
                      categoria={categoria}
                      categorias={categorias}
                      tipoEntidad={tipoEntidadFromHook}
                      onView={handleView}
                      onDownload={handleDownload}
                      onToggleImportante={handleToggleImportante}
                      onArchive={handleArchive}
                      onDelete={canDelete ? handleDelete : undefined}
                      onRefresh={handleRefresh}
                      moduleName={themeModuleName}
                      esArchivado={vistaActual === 'archivados'}
                      onMoverACarpeta={doc => {
                        setDocumentoParaMover(doc)
                        setModalMoverAbierto(true)
                      }}
                    />
                  </motion.div>
                )
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Modal Viewer */}
      <DocumentoViewer
        documento={documentoSeleccionado}
        isOpen={modalViewerAbierto}
        onClose={handleCloseViewer}
        onDownload={handleDownload}
        onDelete={canDelete ? handleDelete : undefined}
        urlPreview={urlPreview}
        errorPreview={errorPreview}
        navegacion={navegacionViewer}
        moduleName={themeModuleName}
      />

      {/* Modal Archivar con motivo */}
      <ArchivarDocumentoModal
        isOpen={modalArchivarAbierto}
        onClose={() => setModalArchivarAbierto(false)}
        onConfirm={confirmarArchivado}
        tituloDocumento={documentoParaArchivar?.titulo || ''}
        moduleName={themeModuleName}
      />

      {/* Modal Restaurar con confirmación */}
      <RestaurarDocumentoModal
        isOpen={modalRestaurarAbierto}
        onClose={() => setModalRestaurarAbierto(false)}
        onConfirm={confirmarRestauracion}
        documentoTitulo={documentoParaRestaurar?.titulo || ''}
        moduleName={themeModuleName}
        procesando={procesandoRestaurar}
      />

      {/* Modal Eliminar con confirmación */}
      <ConfirmacionModal
        isOpen={modalEliminarAbierto}
        onClose={cancelarEliminar}
        onConfirm={confirmarEliminar}
        variant='danger'
        title={datosModalEliminar.title}
        message={datosModalEliminar.message}
        confirmText={datosModalEliminar.confirmText}
        cancelText='Cancelar'
        isLoading={procesandoEliminar}
        loadingText='Eliminando...'
      />

      {/* 📁 Confirmación eliminar carpeta */}
      <ConfirmacionModal
        isOpen={carpetaParaEliminar !== null}
        onClose={() => setCarpetaParaEliminar(null)}
        onConfirm={async () => {
          if (carpetaParaEliminar) {
            await handleEliminarCarpeta(carpetaParaEliminar.id)
          }
          setCarpetaParaEliminar(null)
        }}
        variant='danger'
        title='Eliminar carpeta'
        message={`¿Eliminar la carpeta "${carpetaParaEliminar?.nombre ?? ''}"? Los documentos dentro volverán a la raíz.`}
        confirmText='Eliminar'
        cancelText='Cancelar'
      />

      {/* 📁 Modal Crear/Renombrar Carpeta */}
      <CarpetaFormModal
        isOpen={modalCarpetaAbierto}
        onClose={() => {
          setModalCarpetaAbierto(false)
          setCarpetaParaEditar(null)
        }}
        onSubmit={async (nombre, descripcion) => {
          if (carpetaParaEditar) {
            await handleRenombrarCarpeta(carpetaParaEditar.id, nombre)
          } else {
            await handleCrearCarpeta(nombre, descripcion)
          }
          setModalCarpetaAbierto(false)
          setCarpetaParaEditar(null)
        }}
        carpeta={carpetaParaEditar}
        moduleName={themeModuleName}
        cargando={crearCarpetaCargando}
      />

      {/* 📁 Modal Mover a Carpeta */}
      <MoverACarpetaModal
        isOpen={modalMoverAbierto}
        onClose={() => {
          setModalMoverAbierto(false)
          setDocumentoParaMover(null)
        }}
        onMover={async carpetaDestinoId => {
          if (documentoParaMover) {
            await handleMoverDocumento(documentoParaMover.id, carpetaDestinoId)
          }
          setModalMoverAbierto(false)
          setDocumentoParaMover(null)
        }}
        entidadId={entidadId}
        tipoEntidad={tipoEntidad}
        moduleName={themeModuleName}
        carpetaActualId={
          documentoParaMover
            ? (((documentoParaMover as unknown as Record<string, unknown>)
                .carpeta_id as string | null) ?? null)
            : null
        }
        cargando={moverDocumentoCargando}
      />
    </div>
  )
}
