'use client'

import { useState } from 'react'

import { Tags, Upload } from 'lucide-react'

import { useAuth } from '@/contexts/auth-context'
import type { Proyecto } from '@/modules/proyectos/types'
import { usePermisosQuery } from '@/modules/usuarios/hooks'
import { type ModuleName } from '@/shared/config/module-themes'
import { CategoriasManager } from '@/shared/documentos/components/categorias/categorias-manager'
import { DocumentosLista } from '@/shared/documentos/components/lista/documentos-lista'
import { DocumentosSubpantalla } from '@/shared/documentos/components/shared/DocumentosSubpantalla'
import { SinAccesoDocumentos } from '@/shared/documentos/components/shared/SinAccesoDocumentos'
import { DocumentoUpload } from '@/shared/documentos/components/upload/documento-upload'

interface DocumentosTabProps {
  proyecto: Proyecto
  /** Tema del módulo padre (proyectos, clientes, viviendas) */
  moduleName?: ModuleName
}

export function DocumentosTab({
  proyecto,
  moduleName = 'proyectos',
}: DocumentosTabProps) {
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
    return <SinAccesoDocumentos entidad='este proyecto' />

  // Gestor de categorías (requiere poder subir)
  if (showCategorias && user && canCreate) {
    return (
      <DocumentosSubpantalla
        moduleName={moduleName}
        icon={Tags}
        titulo='Gestionar categorías'
        descripcion='Organiza los documentos con categorías de color e ícono'
        onVolver={() => setShowCategorias(false)}
      >
        <CategoriasManager userId={user.id} modulo='proyectos' />
      </DocumentosSubpantalla>
    )
  }

  // Formulario de subida
  if (showUpload && user && canCreate) {
    return (
      <DocumentosSubpantalla
        moduleName={moduleName}
        icon={Upload}
        titulo='Subir documento'
        descripcion='Selecciona el archivo y completa su información'
        onVolver={() => setShowUpload(false)}
      >
        <DocumentoUpload
          entidadId={proyecto.id}
          tipoEntidad='proyecto'
          carpetaId={carpetaIdUpload}
          onSuccess={() => setShowUpload(false)}
          onCancel={() => setShowUpload(false)}
          moduleName={moduleName}
        />
      </DocumentosSubpantalla>
    )
  }

  return (
    <div className='space-y-4'>
      {/* Lista de documentos */}
      <DocumentosLista
        entidadId={proyecto.id}
        tipoEntidad='proyecto'
        moduleName={moduleName}
        onCategoriasClick={() => setShowCategorias(true)}
        onUploadClick={carpetaId => {
          setCarpetaIdUpload(carpetaId ?? null)
          setShowUpload(true)
        }}
      />
    </div>
  )
}
