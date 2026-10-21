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
import { IdCard, Tags, Upload } from 'lucide-react'

import { useAuth } from '@/contexts/auth-context'
import { SeccionDocumentosPendientes } from '@/modules/clientes/components/documentos-pendientes'
import { SubirCartaModal } from '@/modules/clientes/components/fuentes-pago'
import { BannerDocumentoRequerido } from '@/modules/clientes/documentos/components/BannerDocumentoRequerido'
import { useDocumentosTab } from '@/modules/clientes/hooks'
import { useCategoriasSistemaClientes } from '@/modules/clientes/hooks/useCategoriasSistemaClientes'
import type { Cliente } from '@/modules/clientes/types'
import { usePermisosQuery } from '@/modules/usuarios/hooks'
import { CategoriasManager } from '@/shared/documentos/components/categorias/categorias-manager'
import { DocumentosLista } from '@/shared/documentos/components/lista/documentos-lista'
import { DocumentosSubpantalla } from '@/shared/documentos/components/shared/DocumentosSubpantalla'
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

  // Gestor de categorías (requiere poder subir)
  if (mostrandoCategorias && user && canCreate) {
    return (
      <DocumentosSubpantalla
        moduleName='clientes'
        icon={Tags}
        titulo='Gestionar categorías'
        descripcion='Organiza los documentos del cliente con categorías de color e ícono'
        onVolver={volverADocumentos}
      >
        <CategoriasManager userId={user.id} modulo='clientes' />
      </DocumentosSubpantalla>
    )
  }

  // Formulario de subida
  if (mostrandoUpload && user && canCreate) {
    return (
      <DocumentosSubpantalla
        moduleName='clientes'
        icon={uploadTipoCedula ? IdCard : Upload}
        titulo={
          uploadTipoCedula ? 'Subir documento de identidad' : 'Subir documento'
        }
        descripcion={
          uploadTipoCedula
            ? 'Sube la cédula o pasaporte oficial del cliente'
            : 'Selecciona el archivo y completa su información'
        }
        onVolver={volverADocumentos}
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
      </DocumentosSubpantalla>
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
            const tieneNegociacion =
              (cliente.estadisticas?.negociaciones_activas ?? 0) > 0
            return (
              <BannerDocumentoRequerido
                variant='bloqueante'
                mensaje={
                  tieneNegociacion
                    ? 'Se detectó que este cliente tiene una vivienda asignada y una negociación activa, pero aún no tiene su documento de identidad cargado. Es indispensable subirlo para completar el proceso correctamente.'
                    : undefined
                }
                onSubirDocumento={
                  canCreate ? () => mostrarUpload(true) : undefined
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
