'use client'

/**
 * Estado, validación y guardado del formulario de nota (crear o editar).
 * El modal se monta cada vez que se abre, así que el estado arranca limpio.
 */

import { useEffect, useState } from 'react'

import { useQuery } from '@tanstack/react-query'

import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/utils/logger'
import { useNotaPorId } from '@/modules/clientes/hooks/useNotaPorId'
import { useNotasHistorial } from '@/modules/clientes/hooks/useNotasHistorial'
import type { DocumentoVinculado } from '@/modules/clientes/types/notas-historial.types'

export const MIN_TITULO = 3
export const MAX_TITULO = 200
export const MIN_CONTENIDO = 10

/**
 * Texto visible del HTML del editor. Con DOMParser "&amp;" cuenta como un
 * carácter y no como cinco (quitar etiquetas con regex no decodifica)
 */
function textoPlano(html: string): string {
  if (!html) return ''
  if (typeof window === 'undefined') return html.replace(/<[^>]*>/g, '').trim()
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return (doc.body.textContent ?? '').trim()
}

export function useNotaFormulario({
  clienteId,
  notaId,
  onGuardada,
}: {
  clienteId: string
  notaId?: string | null
  onGuardada: () => void
}) {
  const modoEdicion = !!notaId
  const [titulo, setTitulo] = useState('')
  const [contenido, setContenido] = useState('')
  const [esImportante, setEsImportante] = useState(false)
  const [documento, setDocumento] = useState<DocumentoVinculado | null>(null)

  const { crearNota, actualizarNota, isCreando, isActualizando } =
    useNotasHistorial(clienteId)
  const { data: nota, isLoading: cargandoNota } = useNotaPorId(notaId)

  // Documentos actuales del cliente para vincular
  const { data: documentos = [] } = useQuery({
    queryKey: ['documentos-cliente-picker', clienteId],
    queryFn: async () => {
      const { data } = await supabase
        .from('documentos_cliente')
        .select('id,titulo,nombre_archivo,tipo_mime,url_storage,estado')
        .eq('cliente_id', clienteId)
        .eq('es_version_actual', true)
        .neq('estado', 'eliminado')
        .order('fecha_creacion', { ascending: false })
      return (data ?? []) as DocumentoVinculado[]
    },
    staleTime: 30_000,
  })

  // Al editar, cargar la nota en el formulario
  useEffect(() => {
    if (!nota) return
    setTitulo(nota.titulo)
    setContenido(nota.contenido)
    setEsImportante(nota.es_importante)
    setDocumento(nota.documento_vinculado ?? null)
  }, [nota])

  const largoContenido = textoPlano(contenido).length
  const faltantes = [
    titulo.trim().length < MIN_TITULO
      ? `un título de al menos ${MIN_TITULO} caracteres`
      : null,
    largoContenido < MIN_CONTENIDO
      ? `al menos ${MIN_CONTENIDO} caracteres en la nota`
      : null,
  ].filter((f): f is string => f !== null)

  const guardando = isCreando || isActualizando

  // Hay algo que se perdería al cerrar: distinto de la nota cargada (editar)
  // o con algo escrito (nueva)
  const hayCambios = nota
    ? titulo !== nota.titulo ||
      contenido !== nota.contenido ||
      esImportante !== nota.es_importante ||
      (documento?.id ?? null) !== (nota.documento_vinculado?.id ?? null)
    : titulo.trim() !== '' || largoContenido > 0 || documento !== null

  const guardar = async () => {
    if (faltantes.length > 0 || guardando) return
    const datos = {
      titulo: titulo.trim(),
      contenido: contenido.trim(),
      es_importante: esImportante,
      documento_vinculado_id: documento?.id ?? null,
    }
    try {
      const resultado =
        modoEdicion && notaId
          ? await actualizarNota({ notaId, datos })
          : await crearNota({ cliente_id: clienteId, ...datos })
      if (resultado.success) onGuardada()
    } catch (error) {
      // El toast de error lo muestra useNotasHistorial
      logger.error('Error guardando nota:', error)
    }
  }

  return {
    modoEdicion,
    cargandoNota: modoEdicion && cargandoNota,
    titulo,
    setTitulo,
    contenido,
    setContenido,
    largoContenido,
    esImportante,
    setEsImportante,
    documento,
    setDocumento,
    documentos,
    faltantes,
    hayCambios,
    guardando,
    guardar,
  }
}
