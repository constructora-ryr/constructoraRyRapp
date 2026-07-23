/**
 * DetalleAuditoriaModal - Modal para mostrar detalles de auditoría
 *
 * ✅ COMPONENTE PRESENTACIONAL PURO (< 150 líneas)
 * ✅ SOLO orquestación, SIN lógica
 * ✅ Usa renders específicos por módulo
 * ✅ Separación de responsabilidades perfecta
 *
 * Arquitectura:
 * - Hook: useDetalleAuditoria (lógica)
 * - Renders: detalle-renders/* (UI específica)
 * - Shared: AccionBadge, InfoCard (componentes reutilizables)
 * - Utils: formatters (funciones puras)
 * - Styles: detalle-modal.styles (estilos centralizados)
 */

'use client'

import { motion } from 'framer-motion'
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  User,
  X,
} from 'lucide-react'
import { createPortal } from 'react-dom'

import { useDetalleAuditoria } from '../hooks'
import { detalleModalStyles as styles } from '../styles/detalle-modal.styles'
import type { AuditLogRecord } from '../types'
import { getAccionLabel, tiempoTranscurrido } from '../utils/formatters'

import {
  AbonoDetalleRender,
  ClienteDetalleRender,
  DocumentoClienteDetalleRender,
  DocumentoDetalleRender,
  DocumentoReemplazoDetalleRender,
  GenericoDetalleRender,
  NegociacionDetalleRender,
  ViviendaDetalleRender,
} from './detalle-renders'
import { getAuditoriaRenderer } from './renderers'
import { ActualizacionDocumentoClienteRenderer } from './renderers/clientes/ActualizacionDocumentoClienteRenderer'
import { AccionBadge } from './shared'

interface DetalleAuditoriaModalProps {
  registro: AuditLogRecord
  onClose: () => void
}

export function DetalleAuditoriaModal({
  registro,
  onClose,
}: DetalleAuditoriaModalProps) {
  const {
    seccionAbierta,
    toggleSeccion,
    datosFormateados,
    mostrarSeccionJson,
  } = useDetalleAuditoria(registro)

  // Sistema de renderers: primero tabla (específico), luego módulo (general)
  const renderDetallesModulo = () => {
    const metadata = datosFormateados.metadata

    // 1. Reemplazo de archivos (tipo_operacion específico)
    if (metadata.tipo_operacion === 'reemplazo_archivo_admin') {
      return <DocumentoReemplazoDetalleRender metadata={metadata} />
    }

    // 2. Proyectos (factory pattern)
    if (registro.modulo === 'proyectos') {
      const RendererComponent = getAuditoriaRenderer(
        registro.modulo,
        registro.accion
      )
      return (
        <RendererComponent
          metadata={metadata}
          datosNuevos={registro.datosNuevos}
          datosAnteriores={registro.datosAnteriores}
        />
      )
    }

    // 3. Routing por tabla (más específico que módulo)
    if (registro.tabla === 'abonos_historial') {
      return <AbonoDetalleRender metadata={metadata} accion={registro.accion} />
    }

    if (registro.tabla === 'documentos_cliente') {
      // Edición con diff estructurado
      if (
        registro.accion === 'UPDATE' &&
        metadata.tipo_operacion === 'edicion_documento'
      ) {
        return (
          <ActualizacionDocumentoClienteRenderer
            metadata={metadata}
            datosNuevos={registro.datosNuevos}
            datosAnteriores={registro.datosAnteriores}
          />
        )
      }
      // CREATE / DELETE / UPDATE genérico de documento
      return <DocumentoClienteDetalleRender registro={registro} />
    }

    // 4. Routing por módulo para tablas principales
    switch (registro.modulo) {
      case 'viviendas':
        return <ViviendaDetalleRender metadata={metadata} />
      case 'clientes':
        return (
          <ClienteDetalleRender metadata={metadata} accion={registro.accion} />
        )
      case 'negociaciones':
        return (
          <NegociacionDetalleRender
            metadata={metadata}
            accion={registro.accion}
          />
        )
      case 'documentos':
        return <DocumentoDetalleRender registro={registro} />
      default:
        // Sin renderer específico: los datos están en el acordeón técnico de abajo
        return (
          <p className='text-sm italic text-gray-500 dark:text-gray-400'>
            Ver datos técnicos (JSON) más abajo para el detalle completo.
          </p>
        )
    }
  }

  const modalContent = (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={styles.overlay}
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={styles.modalContainer}
      >
        <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className={styles.header.container}>
            <div className={styles.header.pattern} />
            <div className={styles.header.content}>
              <div className='flex items-center gap-4'>
                <div className={styles.header.iconBox}>
                  <FileText className='h-6 w-6 text-white' />
                </div>
                <div>
                  <h3 className={styles.header.title}>Detalles de Auditoría</h3>
                  <p className={styles.header.subtitle}>
                    {registro.modulo || registro.tabla} •{' '}
                    {getAccionLabel(registro.accion)}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className={styles.header.closeButton}>
                <X className='h-5 w-5 text-white' />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className={styles.body}>
            <div className='space-y-3'>
              {/* Información de la Acción */}
              <div className={styles.accion.container}>
                <div className='flex items-center gap-3'>
                  <AccionBadge accion={registro.accion} />
                  <div className='flex items-center gap-2'>
                    <User className='h-3.5 w-3.5 flex-shrink-0 text-gray-400' />
                    <div className='min-w-0'>
                      <p className={styles.accion.usuario.label}>
                        Realizado por
                      </p>
                      <p className={styles.accion.usuario.email}>
                        {registro.usuarioNombres || registro.usuarioEmail}
                        {registro.usuarioRol && (
                          <span className={styles.accion.usuario.rolBadge}>
                            {registro.usuarioRol}
                          </span>
                        )}
                      </p>
                      {registro.usuarioNombres && (
                        <p className='mt-0.5 text-[10px] text-gray-500 dark:text-gray-500'>
                          {registro.usuarioEmail}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className='flex flex-shrink-0 flex-col items-end gap-1.5'>
                  <div className='flex items-center gap-2'>
                    <Calendar className='h-3.5 w-3.5 text-gray-400' />
                    <div className='text-right'>
                      <p className={styles.accion.fecha.label}>Fecha</p>
                      <p className={styles.accion.fecha.valor}>
                        {datosFormateados.fechaFormateada}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Clock className='h-3.5 w-3.5 text-gray-400' />
                    <div className='text-right'>
                      <p className='text-[10px] font-medium text-gray-500 dark:text-gray-500'>
                        {tiempoTranscurrido(registro.fechaEvento)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detalles del Módulo */}
              <div className={styles.detalles.container}>
                <h4 className={styles.detalles.titulo}>
                  <FileText className='h-4 w-4 text-blue-600 dark:text-blue-400' />
                  Información Detallada
                </h4>
                {renderDetallesModulo()}
              </div>

              {/* Información Técnica Adicional */}
              {(registro.ipAddress || registro.userAgent) && (
                <div className='rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900/50'>
                  <h4 className='mb-2 flex items-center gap-2 text-xs font-semibold text-gray-900 dark:text-white'>
                    <FileText className='h-3.5 w-3.5 text-gray-400' />
                    Información Técnica de la Sesión
                  </h4>
                  <div className='space-y-1.5'>
                    {registro.ipAddress && (
                      <div className='flex items-start gap-2'>
                        <span className='min-w-[60px] text-[10px] font-medium text-gray-500 dark:text-gray-500'>
                          IP Origen:
                        </span>
                        <span className='font-mono text-[10px] text-gray-700 dark:text-gray-300'>
                          {registro.ipAddress}
                        </span>
                      </div>
                    )}
                    {registro.userAgent && (
                      <div className='flex items-start gap-2'>
                        <span className='min-w-[60px] text-[10px] font-medium text-gray-500 dark:text-gray-500'>
                          Navegador:
                        </span>
                        <span className='break-all font-mono text-[10px] text-gray-700 dark:text-gray-300'>
                          {registro.userAgent}
                        </span>
                      </div>
                    )}
                    <div className='flex items-start gap-2 border-t border-gray-200 pt-1 dark:border-gray-700'>
                      <span className='min-w-[60px] text-[10px] font-medium text-gray-500 dark:text-gray-500'>
                        ID Registro:
                      </span>
                      <span className='break-all font-mono text-[10px] text-gray-700 dark:text-gray-300'>
                        {registro.registroId}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* JSON Completo (colapsable) */}
              {mostrarSeccionJson && (
                <div className='space-y-2'>
                  <button
                    onClick={() => toggleSeccion('json')}
                    className={styles.json.button}
                  >
                    <span className={styles.json.label}>
                      <FileText className='h-4 w-4 text-gray-400' />
                      Ver datos técnicos (JSON)
                    </span>
                    {seccionAbierta === 'json' ? (
                      <ChevronUp className='h-5 w-5 text-gray-400' />
                    ) : (
                      <ChevronDown className='h-5 w-5 text-gray-400' />
                    )}
                  </button>

                  {seccionAbierta === 'json' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className={styles.json.content}
                    >
                      <GenericoDetalleRender registro={registro} />
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className={styles.footer}>
            <button onClick={onClose} className={styles.closeButtonFooter}>
              Cerrar
            </button>
          </div>
        </div>
      </motion.div>
    </>
  )

  return createPortal(modalContent, document.body)
}
