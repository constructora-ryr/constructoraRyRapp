'use client'

/**
 * ✅ COMPONENTE PRESENTACIONAL PURO
 * Tab de Documentos - Refactorizado
 *
 * SEPARACIÓN DE RESPONSABILIDADES:
 * - TODA la lógica está en useDocumentosTab hook
 * - Este componente SOLO renderiza UI
 */

import { useEffect, useState } from 'react'

import { AnimatePresence } from 'framer-motion'
import { ArrowLeft, IdCard } from 'lucide-react'

import { useAuth } from '@/contexts/auth-context'
import { SeccionDocumentosPendientes } from '@/modules/clientes/components/documentos-pendientes'
import { SubirCartaModal } from '@/modules/clientes/components/fuentes-pago'
import { BannerDocumentoRequerido } from '@/modules/clientes/documentos/components/BannerDocumentoRequerido'
import { useDocumentosTab } from '@/modules/clientes/hooks'
import { useCategoriasSistemaClientes } from '@/modules/clientes/hooks/useCategoriasSistemaClientes'
import type { Cliente } from '@/modules/clientes/types'
import { usePermisosQuery } from '@/modules/usuarios/hooks'
import { moduleThemes } from '@/shared/config/module-themes'
import { CategoriasManager } from '@/shared/documentos/components/categorias/categorias-manager'
import { DocumentosLista } from '@/shared/documentos/components/lista/documentos-lista'
import { DocumentoUpload } from '@/shared/documentos/components/upload/documento-upload'

interface DocumentosTabProps {
  cliente: Cliente
}

export function DocumentosTab({ cliente }: DocumentosTabProps) {
  const { user } = useAuth()
  const { puede, esAdmin } = usePermisosQuery()

  // 🔒 Permisos de documentos
  const canCreate = esAdmin || puede('documentos', 'subir')
  const canVerYSubirDocumentos =
    esAdmin || (puede('documentos', 'ver') && puede('documentos', 'subir'))

  // Tema cyan/azul para clientes (usado en vistas de categorías y upload)
  const theme = moduleThemes.clientes

  // ✅ AUTO-SEED: Verificar y crear categorías del sistema
  const { verificarYCrear } = useCategoriasSistemaClientes()

  useEffect(() => {
    verificarYCrear()
  }, [verificarYCrear])

  // Estado para modal de carta de aprobación
  const [modalCartaOpen, setModalCartaOpen] = useState(false)
  const [fuenteParaCarta, setFuenteParaCarta] = useState<{
    id: string
    tipo: string
    entidad?: string
    monto_aprobado: number
    tipo_documento_sistema?: string
    requisito_config_id?: string
    vivienda?: { numero: string; manzana: string }
    cliente?: { nombre_completo: string }
  } | null>(null)

  // ✅ Hook con TODA la lógica
  const {
    tieneCedula,
    cargandoValidacion,
    uploadTipoCedula,
    metadataPendiente,
    mostrandoUpload,
    mostrandoCategorias,
    mostrarUpload,
    mostrarCategorias,
    volverADocumentos,
    onSuccessUpload,
    onCancelUpload,
    carpetaIdPendiente,
  } = useDocumentosTab({ clienteId: cliente.id })

  // Si está mostrando categorías (PATRÓN IGUAL A PROYECTOS)
  if (mostrandoCategorias && user && canCreate) {
    return (
      <div className='space-y-4'>
        {/* Header con botón volver */}
        <div
          className={`rounded-lg border ${theme.classes.border.light} bg-white p-4 shadow-sm dark:bg-gray-800`}
        >
          <div className='mb-4 flex items-center gap-2.5'>
            <button
              onClick={volverADocumentos}
              className={`flex items-center gap-1.5 rounded-lg ${theme.classes.button.secondary} px-3 py-1.5 text-xs font-medium transition-colors`}
            >
              <ArrowLeft className='h-3.5 w-3.5' />
              <span>Volver a Documentos</span>
            </button>
          </div>

          <h2 className='text-xl font-bold text-gray-900 dark:text-white'>
            Gestionar Categorías
          </h2>
          <p className='mt-1.5 text-xs text-gray-500 dark:text-gray-400'>
            Organiza los documentos del cliente con categorías personalizadas
          </p>
        </div>

        {/* Gestor de categorías */}
        <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-800'>
          <CategoriasManager
            userId={user.id}
            onClose={volverADocumentos}
            modulo='clientes'
          />
        </div>
      </div>
    )
  }

  // Si está mostrando formulario de upload (PATRÓN IGUAL A PROYECTOS)
  if (mostrandoUpload && user && canCreate) {
    return (
      <div className='space-y-3'>
        {/* Header premium compacto con glassmorphism */}
        <div className='relative overflow-hidden rounded-xl bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-600 p-4 shadow-xl shadow-cyan-500/20 dark:from-cyan-700 dark:via-blue-700 dark:to-indigo-800'>
          <div className='bg-grid-white/10 absolute inset-0 [mask-image:linear-gradient(0deg,transparent,black,transparent)]' />
          <div className='relative z-10'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2.5'>
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm'>
                  <IdCard className='h-5 w-5 text-white' />
                </div>
                <div>
                  <h2 className='text-lg font-bold text-white'>
                    {uploadTipoCedula
                      ? 'Subir Documento de Identidad'
                      : 'Subir Documento'}
                  </h2>
                  <p className='text-xs text-cyan-100 dark:text-cyan-200'>
                    {uploadTipoCedula
                      ? 'Sube la cédula o pasaporte oficial del cliente'
                      : 'Completa la información y selecciona el archivo a subir'}
                  </p>
                </div>
              </div>

              {/* Botón volver a la derecha */}
              <button
                onClick={volverADocumentos}
                className='flex items-center gap-1.5 rounded-lg border border-white/30 bg-white/20 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md transition-all hover:bg-white/30'
              >
                <ArrowLeft className='h-3.5 w-3.5' />
                <span>Volver</span>
              </button>
            </div>
          </div>
        </div>

        <div
          className={`rounded-lg border ${theme.classes.border.light} bg-white p-3 shadow-sm dark:bg-gray-800`}
        >
          <DocumentoUpload
            entidadId={cliente.id}
            tipoEntidad='cliente'
            moduleName='clientes'
            metadata={metadataPendiente}
            carpetaId={carpetaIdPendiente}
            onSuccess={onSuccessUpload}
            onCancel={onCancelUpload}
          />
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {/* 🚨 Banner: solo si tiene permiso ver+subir documentos Y falta la cédula */}
      <AnimatePresence>
        {canVerYSubirDocumentos &&
          !tieneCedula &&
          !cargandoValidacion &&
          (() => {
            // Si ya tiene negociación activa (vivienda asignada), mostrar advertencia suave
            const tieneNegociacion =
              (cliente.estadisticas?.negociaciones_activas ?? 0) > 0
            return (
              <BannerDocumentoRequerido
                variant={tieneNegociacion ? 'advertencia' : 'bloqueante'}
                onSubirDocumento={
                  tieneNegociacion
                    ? undefined
                    : canCreate
                      ? () => mostrarUpload(true)
                      : undefined
                }
              />
            )
          })()}
      </AnimatePresence>

      {/* 📄 Sección de documentos pendientes de fuentes (colapsable) */}
      {canCreate ? (
        <SeccionDocumentosPendientes
          clienteId={cliente.id}
          onSubirDocumento={(pendienteId, tipoDocumento, metadata) => {
            // Cualquier documento vinculado a una fuente de pago usa el modal especializado.
            // El uploader genérico solo se usa para documentos sin fuente (cédula, etc.).
            if (metadata.fuente_pago_id) {
              setFuenteParaCarta({
                id: metadata.fuente_pago_id as string,
                tipo: metadata.tipo_fuente as string,
                // ✅ La vista usa 'entidad_fuente', no 'entidad'
                entidad: metadata.entidad_fuente as string | undefined,
                monto_aprobado: (metadata.monto_aprobado as number) || 0,
                // ✅ Pasar tipo exacto del doc para que la vista haga match al subir
                tipo_documento_sistema: tipoDocumento,
                // ✅ FK al requisito: documentos-base.service lo guarda → vista lo detecta por UUID
                requisito_config_id: metadata.requisito_config_id as
                  | string
                  | undefined,
                vivienda: metadata.vivienda as
                  | { numero: string; manzana: string }
                  | undefined,
                cliente: metadata.cliente as
                  | { nombre_completo: string }
                  | undefined,
              })
              setModalCartaOpen(true)
            } else {
              // Para otros documentos (Solicitud Desembolso, Boleta de Registro, etc.)
              mostrarUpload(false, metadata)
            }
          }}
        />
      ) : null}

      {/* ✅ Lista de documentos - Componente genérico estándar */}
      <DocumentosLista
        entidadId={cliente.id}
        tipoEntidad='cliente'
        moduleName='clientes'
        defaultVista='lista'
        onCategoriasClick={mostrarCategorias}
        onUploadClick={carpetaId => mostrarUpload(false, undefined, carpetaId)}
      />

      {/* Modal de subir carta de aprobación */}
      {fuenteParaCarta && (
        <SubirCartaModal
          isOpen={modalCartaOpen}
          onClose={() => {
            setModalCartaOpen(false)
            setFuenteParaCarta(null)
          }}
          fuente={fuenteParaCarta}
          clienteId={cliente.id}
          onSuccess={() => {
            // Refrescar documentos
            onSuccessUpload()
          }}
        />
      )}
    </div>
  )
}
