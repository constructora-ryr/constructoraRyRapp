'use client'

import { useState } from 'react'

import { Tags, Upload } from 'lucide-react'

import { useAuth } from '@/contexts/auth-context'
import { usePermisosQuery } from '@/modules/usuarios/hooks'
import { CategoriasManager } from '@/shared/documentos/components/categorias/categorias-manager'
import { DocumentosLista } from '@/shared/documentos/components/lista/documentos-lista'
import { DocumentosSubpantalla } from '@/shared/documentos/components/shared/DocumentosSubpantalla'
import { SinAccesoDocumentos } from '@/shared/documentos/components/shared/SinAccesoDocumentos'
import { DocumentoUpload } from '@/shared/documentos/components/upload/documento-upload'

interface DocumentosTabProps {
  viviendaId: string
}

/**
 * Tab de documentos de la vivienda
 * Sistema completo migrado desde Proyectos
 */
export function DocumentosTab({ viviendaId }: DocumentosTabProps) {
  const { user } = useAuth()
  const { puede, esAdmin } = usePermisosQuery()

  // 🔒 Permisos de documentos
  const puedeVerDocumentos = esAdmin || puede('documentos', 'ver')
  const canCreate = esAdmin || puede('documentos', 'subir')

  // Estados locales para vistas
  const [showUpload, setShowUpload] = useState(false)
  const [showCategorias, setShowCategorias] = useState(false)
  const [carpetaIdUpload, setCarpetaIdUpload] = useState<string | null>(null)

  // 🚫 Sin permiso de ver
  if (!puedeVerDocumentos)
    return <SinAccesoDocumentos entidad='esta vivienda' />

  // Gestor de categorías (requiere poder subir)
  if (showCategorias && user && canCreate) {
    return (
      <DocumentosSubpantalla
        moduleName={'viviendas'}
        icon={Tags}
        titulo='Gestionar categorías'
        descripcion='Organiza los documentos con categorías de color e ícono'
        onVolver={() => setShowCategorias(false)}
      >
        <CategoriasManager userId={user.id} modulo='viviendas' />
      </DocumentosSubpantalla>
    )
  }

  // Formulario de subida
  if (showUpload && user && canCreate) {
    return (
      <DocumentosSubpantalla
        moduleName={'viviendas'}
        icon={Upload}
        titulo='Subir documento'
        descripcion='Selecciona el archivo y completa su información'
        onVolver={() => setShowUpload(false)}
      >
        <DocumentoUpload
          entidadId={viviendaId}
          tipoEntidad='vivienda'
          carpetaId={carpetaIdUpload}
          onSuccess={() => setShowUpload(false)}
          onCancel={() => setShowUpload(false)}
          moduleName={'viviendas'}
        />
      </DocumentosSubpantalla>
    )
  }

  return (
    <div className='space-y-4'>
      {/* Lista de documentos */}
      <DocumentosLista
        entidadId={viviendaId}
        tipoEntidad='vivienda'
        moduleName='viviendas'
        onCategoriasClick={() => setShowCategorias(true)}
        onUploadClick={carpetaId => {
          setCarpetaIdUpload(carpetaId ?? null)
          setShowUpload(true)
        }}
      />
    </div>
  )
}
