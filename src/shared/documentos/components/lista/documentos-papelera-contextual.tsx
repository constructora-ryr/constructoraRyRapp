'use client'

/**
 * 🗑️ COMPONENTE: Papelera Contextual
 *
 * Muestra documentos eliminados de una entidad específica (vivienda, proyecto, cliente, etc.)
 * - Contextual: Solo documentos de la entidad actual
 * - Restaurar: Vuelve el documento a estado 'activo'
 * - Eliminar definitivo: Borra permanentemente (con confirmación doble)
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { useAuth } from '@/contexts/auth-context'
import { LoadingState } from '@/shared/components/layout/LoadingState'
import { useModal } from '@/shared/components/modals'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { type ModuleName } from '@/shared/config/module-themes'

import { DocumentosEliminacionService } from '../../services/documentos-eliminacion.service'
import { TipoEntidad } from '../../types'
import type { DocumentoRegistroComun } from '../../types/documento.types'

interface DocumentosPapeleraContextualProps {
  entidadId: string
  tipoEntidad: TipoEntidad
  moduleName?: ModuleName
}

export function DocumentosPapeleraContextual({
  entidadId,
  tipoEntidad,
  moduleName: _moduleName = 'proyectos',
}: DocumentosPapeleraContextualProps) {
  const { user, perfil } = useAuth()
  const queryClient = useQueryClient()
  const { confirm } = useModal()

  const { data: documentosEliminados = [], isLoading } = useQuery({
    queryKey: ['documentos-eliminados-contextual', entidadId, tipoEntidad],
    queryFn: () =>
      DocumentosEliminacionService.obtenerDocumentosEliminados(tipoEntidad),
    enabled: !!user && perfil?.rol === 'Administrador',
    staleTime: 30 * 1000,
  })

  const restaurarMutation = useMutation({
    mutationFn: (documentoId: string) =>
      DocumentosEliminacionService.restaurarDocumentoEliminado(
        documentoId,
        tipoEntidad
      ),
    onSuccess: () => {
      toast.success('✅ Documento restaurado correctamente')
      queryClient.invalidateQueries({
        queryKey: ['documentos-eliminados-contextual', entidadId],
      })
      queryClient.invalidateQueries({ queryKey: ['documentos'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al restaurar')
    },
  })

  const eliminarMutation = useMutation({
    mutationFn: (documentoId: string) =>
      DocumentosEliminacionService.eliminarDefinitivo(documentoId, tipoEntidad),
    onSuccess: () => {
      toast.success('✅ Documento eliminado permanentemente')
      queryClient.invalidateQueries({
        queryKey: ['documentos-eliminados-contextual', entidadId],
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar')
    },
  })

  // Filtrar documentos de esta entidad específica
  const documentosFiltrados = (
    documentosEliminados as unknown as DocumentoRegistroComun[]
  ).filter(doc => {
    const campo =
      tipoEntidad === 'proyecto'
        ? 'proyecto_id'
        : tipoEntidad === 'vivienda'
          ? 'vivienda_id'
          : 'cliente_id'
    return doc[campo] === entidadId
  })

  const cantidadEliminados = documentosFiltrados.length

  if (isLoading) {
    return <LoadingState message='Cargando documentos eliminados...' />
  }

  if (cantidadEliminados === 0) {
    return (
      <EmptyState
        icon={Trash2}
        title='Papelera vacía'
        description='No hay documentos eliminados. Los archivos que elimines aparecerán aquí antes de ser borrados definitivamente.'
        moduleName='papelera'
      />
    )
  }

  return (
    <div className='space-y-4'>
      {/* ⚠️ Advertencia */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className='rounded-lg border-2 border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20'
      >
        <div className='flex gap-3'>
          <AlertTriangle className='mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-500' />
          <div className='flex-1'>
            <h4 className='text-sm font-semibold text-amber-900 dark:text-amber-100'>
              Documentos Eliminados
            </h4>
            <p className='mt-1 text-xs text-amber-700 dark:text-amber-300'>
              • <strong>Restaurar:</strong> Devuelve el documento a la lista
              activa
              <br />• <strong>Eliminar Definitivo:</strong> Borra
              permanentemente (NO reversible)
            </p>
          </div>
        </div>
      </motion.div>

      {/* 📋 Lista de documentos eliminados */}
      <div className='space-y-3'>
        {documentosFiltrados.map((documento, index: number) => (
          <motion.div
            key={documento.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800'
          >
            <div className='flex items-start justify-between gap-4'>
              {/* Info del documento */}
              <div className='min-w-0 flex-1'>
                <h3 className='truncate font-semibold text-gray-900 dark:text-white'>
                  {documento.titulo}
                </h3>
                <div className='mt-1 flex items-center gap-2'>
                  <span className='text-xs text-gray-500 dark:text-gray-400'>
                    Versión {documento.version}
                  </span>
                </div>
              </div>

              {/* Acciones */}
              <div className='flex items-center gap-2'>
                <button
                  onClick={() => restaurarMutation.mutate(documento.id)}
                  disabled={restaurarMutation.isPending}
                  className='inline-flex items-center gap-1.5 rounded-lg bg-green-100 px-3 py-1.5 text-xs font-medium text-green-700 transition-colors hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50'
                  title='Restaurar documento'
                >
                  <RefreshCw className='h-3.5 w-3.5' />
                  Restaurar
                </button>

                <button
                  onClick={async () => {
                    const confirmado = await confirm({
                      title: 'Eliminar permanentemente',
                      message: `¿Eliminar permanentemente "${documento.titulo}"? Esta acción NO se puede deshacer.`,
                      variant: 'danger',
                      confirmText: 'Eliminar definitivo',
                      cancelText: 'Cancelar',
                    })
                    if (confirmado) {
                      eliminarMutation.mutate(documento.id)
                    }
                  }}
                  disabled={eliminarMutation.isPending}
                  className='inline-flex items-center gap-1.5 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50'
                  title='Eliminar permanentemente'
                >
                  <Trash2 className='h-3.5 w-3.5' />
                  Eliminar
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Contador */}
      <p className='text-center text-xs font-medium text-gray-600 dark:text-gray-400'>
        {cantidadEliminados} documento{cantidadEliminados !== 1 ? 's' : ''}{' '}
        eliminado{cantidadEliminados !== 1 ? 's' : ''}
      </p>
    </div>
  )
}
