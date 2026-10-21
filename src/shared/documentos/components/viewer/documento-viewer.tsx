'use client'

/**
 * Visor de documentos (Clientes, Proyectos, Viviendas). Usa la carcasa y la
 * vista previa compartidas con el visor de abonos; el color del encabezado
 * es el del módulo que lo abre.
 */

import { Download, Edit, Pin, Trash2 } from 'lucide-react'

import {
  VisorArchivoModal,
  VisorArchivoPreview,
  tipoDeArchivo,
  visorArchivoStyles as v,
  type VisorNavegacion,
} from '@/shared/components/visor-archivo'
import { type ModuleName } from '@/shared/config/module-themes'

import { temaDocumentos } from '../../config/documentos-tema'
import {
  DocumentoProyecto,
  formatFileSize,
  getFileIcon,
} from '../../types/documento.types'

import { DocumentoViewerSidebar } from './DocumentoViewerSidebar'

interface DocumentoViewerProps {
  documento: DocumentoProyecto | null
  isOpen: boolean
  onClose: () => void
  onDownload?: (documento: DocumentoProyecto) => void | Promise<void>
  onDelete?: (documento: DocumentoProyecto) => void | Promise<void>
  onEdit?: (documento: DocumentoProyecto) => void
  /** URL firmada para la vista previa (vacía/undefined = generándose) */
  urlPreview?: string
  /** No se pudo generar la URL (archivo inexistente en Storage) */
  errorPreview?: boolean
  moduleName?: ModuleName
  /** Pasar al documento anterior/siguiente sin cerrar (botones y ← →) */
  navegacion?: VisorNavegacion
}

export function DocumentoViewer({
  documento,
  isOpen,
  onClose,
  onDownload,
  onDelete,
  onEdit,
  urlPreview,
  errorPreview = false,
  moduleName = 'proyectos',
  navegacion,
}: DocumentoViewerProps) {
  if (!documento) return null

  const tema = temaDocumentos(moduleName)
  const FileIcon = getFileIcon(documento.tipo_mime || '')
  const descargar = onDownload ? () => onDownload(documento) : undefined

  const acciones = (
    <>
      {descargar ? (
        <button
          type='button'
          onClick={descargar}
          className={v.accion.btn}
          title='Descargar'
        >
          <Download className='h-3.5 w-3.5' />
          <span className={v.accion.label}>Descargar</span>
        </button>
      ) : null}
      {onEdit ? (
        <button
          type='button'
          onClick={() => onEdit(documento)}
          className={v.accion.btn}
          title='Editar'
        >
          <Edit className='h-3.5 w-3.5' />
          <span className={v.accion.label}>Editar</span>
        </button>
      ) : null}
      {onDelete ? (
        <button
          type='button'
          onClick={() => onDelete(documento)}
          className={v.accion.btnDanger}
          title='Eliminar'
        >
          <Trash2 className='h-3.5 w-3.5' />
          <span className={v.accion.label}>Eliminar</span>
        </button>
      ) : null}
    </>
  )

  return (
    <VisorArchivoModal
      isOpen={isOpen}
      onClose={onClose}
      ariaLabel={`Documento ${documento.titulo}`}
      gradient={tema.gradient}
      icono={<FileIcon className='h-5 w-5' />}
      titulo={documento.titulo}
      insignia={
        documento.es_importante ? (
          <span className={v.accion.insignia}>
            <Pin className='h-3 w-3 fill-current' />
            Anclado
          </span>
        ) : null
      }
      subtitulo={[
        documento.categoria?.nombre,
        formatFileSize(documento.tamano_bytes),
        `Versión ${documento.version}`,
      ]
        .filter(Boolean)
        .join(' · ')}
      acciones={acciones}
      navegacion={navegacion}
    >
      <VisorArchivoPreview
        url={urlPreview || null}
        tipo={tipoDeArchivo(documento.tipo_mime, documento.nombre_archivo)}
        titulo={documento.titulo}
        errorUrl={errorPreview}
        onDescargar={descargar}
        acento={tema.gradient}
        navegacion={navegacion}
      />
      <DocumentoViewerSidebar documento={documento} />
    </VisorArchivoModal>
  )
}
