'use client'

import { useState } from 'react'

import { ArrowLeft, Lock, Upload } from 'lucide-react'

import { useAuth } from '@/contexts/auth-context'
import type { Proyecto } from '@/modules/proyectos/types'
import { usePermisosQuery } from '@/modules/usuarios/hooks'
import { moduleThemes, type ModuleName } from '@/shared/config/module-themes'
import { CategoriasManager } from '@/shared/documentos/components/categorias/categorias-manager'
import { DocumentosLista } from '@/shared/documentos/components/lista/documentos-lista'
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

  // Obtener tema dinámico basado en el módulo
  const theme = moduleThemes[moduleName]

  // Estados locales para vistas
  const [showUpload, setShowUpload] = useState(false)
  const [showCategorias, setShowCategorias] = useState(false)
  const [carpetaIdUpload, setCarpetaIdUpload] = useState<string | null>(null)

  // 🚫 Sin permiso de ver: mostrar estado de acceso denegado
  if (!puedeVerDocumentos) {
    return (
      <div className='flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-16 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800'>
        <div className='mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700'>
          <Lock className='h-7 w-7 text-gray-400 dark:text-gray-500' />
        </div>
        <p className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
          Sin acceso a documentos
        </p>
        <p className='mt-1 text-xs text-gray-400 dark:text-gray-500'>
          No tienes permiso para ver los documentos de este proyecto.
        </p>
      </div>
    )
  }

  // Si está mostrando categorías (solo admins/creadores)
  if (showCategorias && user && canCreate) {
    return (
      <div className='space-y-4'>
        <div
          className={`rounded-lg border ${theme.classes.border.light} bg-white p-4 shadow-sm dark:bg-gray-800`}
        >
          <div className='mb-4 flex items-center gap-2.5'>
            <button
              onClick={() => setShowCategorias(false)}
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
            Organiza los documentos del proyecto con categorías personalizadas
          </p>
        </div>

        <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-800'>
          <CategoriasManager
            userId={user.id}
            onClose={() => setShowCategorias(false)}
            modulo='proyectos'
          />
        </div>
      </div>
    )
  }

  // Si está mostrando formulario de upload
  if (showUpload && user && canCreate) {
    return (
      <div className='space-y-3'>
        {/* Header premium upload con gradiente del módulo */}
        <div
          className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${theme.classes.gradient.triple} p-4 shadow-xl ${theme.classes.shadow}`}
        >
          <div className='bg-grid-white/10 absolute inset-0 [mask-image:linear-gradient(0deg,transparent,black,transparent)]' />
          <div className='relative z-10'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2.5'>
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm'>
                  <Upload className='h-5 w-5 text-white' />
                </div>
                <div>
                  <h2 className='text-lg font-bold text-white'>
                    Subir Documento
                  </h2>
                  <p className='text-xs text-white/70'>
                    Completa la información y selecciona el archivo a subir
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowUpload(false)}
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
            entidadId={proyecto.id}
            tipoEntidad='proyecto'
            carpetaId={carpetaIdUpload}
            onSuccess={() => setShowUpload(false)}
            onCancel={() => setShowUpload(false)}
            moduleName={moduleName}
          />
        </div>
      </div>
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
