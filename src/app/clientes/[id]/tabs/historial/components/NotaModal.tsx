'use client'

/**
 * Crear o editar una nota del historial. Lógica en useNotaFormulario; la
 * carcasa es la misma de "Ver detalle" (ModalDetalle).
 */

import { FileEdit, Info, Loader2, Save, Star } from 'lucide-react'

import { Cargador } from '@/shared/components/carga'
import { ModalDetalle } from '@/shared/components/modals/ModalDetalle'
import { RichTextEditor } from '@/shared/components/rich-text/RichTextEditor'
import { cn } from '@/shared/utils/helpers'

import { SelectorDocumento } from '../nota/SelectorDocumento'
import {
  MAX_TITULO,
  MIN_CONTENIDO,
  useNotaFormulario,
} from '../nota/useNotaFormulario'

const etiqueta =
  'mb-1.5 flex items-center justify-between gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300'

interface NotaModalProps {
  onClose: () => void
  clienteId: string
  clienteNombre: string
  /** Si viene, se edita esa nota; si no, se crea una nueva */
  notaId?: string | null
}

export function NotaModal({
  onClose,
  clienteId,
  clienteNombre,
  notaId,
}: NotaModalProps) {
  const f = useNotaFormulario({ clienteId, notaId, onGuardada: onClose })

  return (
    <ModalDetalle
      onClose={onClose}
      bloqueado={f.guardando}
      gradient={
        f.esImportante
          ? 'from-amber-500 via-orange-500 to-orange-600'
          : 'from-violet-600 via-purple-600 to-fuchsia-600 dark:from-violet-700 dark:via-purple-800 dark:to-fuchsia-900'
      }
      icon={FileEdit}
      titulo={f.modoEdicion ? 'Editar nota' : 'Nueva nota'}
      subtitulo={clienteNombre}
      pie={
        <>
          {f.faltantes.length > 0 ? (
            <p className='min-w-0 text-xs text-slate-500 dark:text-slate-400 sm:mr-auto sm:flex-1'>
              Falta {f.faltantes.join(' y ')}
            </p>
          ) : null}
          <button
            type='button'
            onClick={onClose}
            disabled={f.guardando}
            className='h-10 flex-shrink-0 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
          >
            Cancelar
          </button>
          <button
            type='submit'
            form='form-nota'
            disabled={f.faltantes.length > 0 || f.guardando}
            className='inline-flex h-10 flex-shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 text-sm font-semibold text-white shadow-md shadow-violet-500/25 transition-all hover:shadow-lg disabled:opacity-50'
          >
            {f.guardando ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <Save className='h-4 w-4' />
            )}
            {f.guardando
              ? 'Guardando…'
              : f.modoEdicion
                ? 'Guardar cambios'
                : 'Guardar nota'}
          </button>
        </>
      }
    >
      {f.cargandoNota ? (
        <Cargador
          modulo='abonos'
          tamano='sm'
          label='Cargando la nota'
          className='py-10'
        />
      ) : (
        <form
          id='form-nota'
          onSubmit={e => {
            e.preventDefault()
            void f.guardar()
          }}
          className='space-y-5'
        >
          <div>
            <label htmlFor='nota-titulo' className={etiqueta}>
              <span>
                Título <span className='text-rose-500'>*</span>
              </span>
              <span className='font-normal tabular-nums text-slate-400'>
                {f.titulo.length}/{MAX_TITULO}
              </span>
            </label>
            <input
              id='nota-titulo'
              value={f.titulo}
              onChange={e => f.setTitulo(e.target.value)}
              maxLength={MAX_TITULO}
              placeholder='Ej: Llamada — consulta sobre el crédito'
              className='h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200 dark:border-slate-700 dark:bg-slate-900/60 dark:text-white dark:focus:ring-violet-900'
            />
          </div>

          <div>
            <p className={etiqueta}>
              <span>
                Nota <span className='text-rose-500'>*</span>
              </span>
              <span
                className={cn(
                  'font-normal tabular-nums',
                  f.largoContenido < MIN_CONTENIDO
                    ? 'text-slate-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                )}
              >
                {f.largoContenido} caracteres
              </span>
            </p>
            <RichTextEditor
              value={f.contenido}
              onChange={f.setContenido}
              placeholder='Qué pasó, qué se habló o qué hay que recordar…'
              minHeight='160px'
            />
          </div>

          <div>
            <p className={etiqueta}>
              <span>
                Documento vinculado{' '}
                <span className='font-normal text-slate-400'>(opcional)</span>
              </span>
            </p>
            <SelectorDocumento
              documentos={f.documentos}
              seleccionado={f.documento}
              onChange={f.setDocumento}
            />
          </div>

          {/* Importante: interruptor */}
          <button
            type='button'
            role='switch'
            aria-checked={f.esImportante}
            onClick={() => f.setEsImportante(!f.esImportante)}
            className={cn(
              'flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors',
              f.esImportante
                ? 'border-amber-300 bg-amber-50 dark:border-amber-500/40 dark:bg-amber-500/10'
                : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/40'
            )}
          >
            <span
              className={cn(
                'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg',
                f.esImportante
                  ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
                  : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
              )}
            >
              <Star
                className={cn('h-4 w-4', f.esImportante && 'fill-current')}
              />
            </span>
            <span className='min-w-0 flex-1'>
              <span className='block text-sm font-semibold text-slate-900 dark:text-white'>
                Marcar como importante
              </span>
              <span className='block text-xs text-slate-500 dark:text-slate-400'>
                Se destaca en ámbar en la línea de tiempo
              </span>
            </span>
            <span
              aria-hidden
              className={cn(
                'relative h-6 w-11 flex-shrink-0 rounded-full transition-colors',
                f.esImportante
                  ? 'bg-amber-500'
                  : 'bg-slate-300 dark:bg-slate-600'
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                  f.esImportante ? 'translate-x-[22px]' : 'translate-x-0.5'
                )}
              />
            </span>
          </button>

          <p className='flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400'>
            <Info className='mt-0.5 h-3.5 w-3.5 flex-shrink-0' />
            Queda en el historial del cliente. Solo tú o un administrador pueden
            editarla o eliminarla.
          </p>
        </form>
      )}
    </ModalDetalle>
  )
}
