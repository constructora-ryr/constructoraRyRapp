'use client'

/**
 * Gestor de categorías de documentos de un módulo: lista en tarjetas y
 * formulario de crear/editar en la misma pantalla. La lógica vive en
 * useCategoriasManager.
 */

import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, FolderPlus, Plus, Tags } from 'lucide-react'

import { useAuth } from '@/contexts/auth-context'
import { ModalConfirmacion } from '@/shared'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { LoadingSpinner } from '@/shared/components/ui/Loading'
import { cn } from '@/shared/utils/helpers'

import { temaDocumentos } from '../../config/documentos-tema'
import { useCategoriasManager } from '../../hooks'

import { CategoriaForm } from './categoria-form'
import { CategoriaCard } from './CategoriaCard'

interface CategoriasManagerProps {
  userId: string
  modulo?: 'proyectos' | 'clientes' | 'viviendas'
}

export function CategoriasManager({
  userId,
  modulo = 'proyectos',
}: CategoriasManagerProps) {
  const { perfil } = useAuth()
  const esAdministrador = perfil?.rol === 'Administrador'
  const tema = temaDocumentos(modulo)

  const {
    modo,
    categoriaEditando,
    eliminando,
    categorias,
    estaCargando,
    tieneCategorias,
    modalEliminarAbierto,
    categoriaAEliminar,
    handleIrACrear,
    handleIrAEditar,
    handleVolverALista,
    handleCrear,
    handleActualizar,
    handleEliminar,
    confirmarEliminar,
    cancelarEliminar,
  } = useCategoriasManager({ userId, modulo })

  if (estaCargando) {
    return (
      <div className='flex items-center justify-center py-12'>
        <LoadingSpinner size='lg' />
      </div>
    )
  }

  if (modo === 'crear' || (modo === 'editar' && categoriaEditando)) {
    const editando = modo === 'editar' ? categoriaEditando : null
    return (
      <div className='space-y-5'>
        <div className='flex items-center gap-2'>
          <button
            type='button'
            onClick={handleVolverALista}
            aria-label='Volver a categorías'
            className='flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-700 dark:hover:text-slate-200'
          >
            <ArrowLeft className='h-4 w-4' />
          </button>
          <h3 className='text-base font-bold text-slate-900 dark:text-white'>
            {editando ? `Editar "${editando.nombre}"` : 'Nueva categoría'}
          </h3>
        </div>
        <CategoriaForm
          key={editando?.id ?? 'nueva'}
          categoria={editando ?? undefined}
          moduleName={modulo}
          onSubmit={editando ? handleActualizar : handleCrear}
          onCancel={handleVolverALista}
        />
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <p className='flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300'>
          <Tags className={cn('h-4 w-4', tema.texto)} />
          <span>
            <strong className='font-semibold text-slate-900 dark:text-white'>
              {categorias.length}
            </strong>{' '}
            {categorias.length === 1 ? 'categoría' : 'categorías'} en este
            módulo
          </span>
        </p>
        <button
          type='button'
          onClick={handleIrACrear}
          className={cn(
            'inline-flex h-10 items-center gap-1.5 rounded-xl bg-gradient-to-r px-4 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg',
            tema.gradient,
            tema.sombra
          )}
        >
          <Plus className='h-4 w-4' />
          Nueva categoría
        </button>
      </div>

      {!tieneCategorias ? (
        <EmptyState
          icon={FolderPlus}
          title='Sin categorías'
          description='Crea tu primera categoría para organizar los documentos'
          action={{ label: 'Crear categoría', onClick: handleIrACrear }}
          moduleName={modulo}
        />
      ) : (
        <div className='grid grid-cols-1 gap-2.5 lg:grid-cols-2'>
          <AnimatePresence mode='popLayout'>
            {categorias.map((categoria, index) => (
              <motion.div
                key={categoria.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ delay: Math.min(index, 12) * 0.03 }}
              >
                <CategoriaCard
                  categoria={categoria}
                  onEditar={handleIrAEditar}
                  onEliminar={
                    esAdministrador && !categoria.es_sistema
                      ? c => handleEliminar(c.id, c.nombre)
                      : undefined
                  }
                  eliminando={eliminando === categoria.id}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {categorias.some(c => c.es_sistema) ? (
        <p className='text-xs text-slate-500 dark:text-slate-400'>
          Las categorías del sistema las usan los procesos automáticos (cédula,
          cartas de aprobación, desembolsos…). Puedes editarlas, pero no
          eliminarlas.
        </p>
      ) : null}

      <ModalConfirmacion
        isOpen={modalEliminarAbierto}
        onClose={cancelarEliminar}
        onConfirm={confirmarEliminar}
        title='Eliminar categoría'
        message={
          categoriaAEliminar ? (
            <div className='space-y-3'>
              <p className='text-base'>
                ¿Seguro que quieres eliminar la categoría{' '}
                <span className='font-bold text-slate-900 dark:text-white'>
                  {categoriaAEliminar.nombre}
                </span>
                ?
              </p>
              <p className='text-sm text-slate-600 dark:text-slate-400'>
                Esta acción no se puede deshacer. Si tiene documentos asociados
                no se eliminará.
              </p>
            </div>
          ) : null
        }
        confirmText='Eliminar'
        cancelText='Cancelar'
        variant='danger'
        isLoading={eliminando === categoriaAEliminar?.id}
      />
    </div>
  )
}
