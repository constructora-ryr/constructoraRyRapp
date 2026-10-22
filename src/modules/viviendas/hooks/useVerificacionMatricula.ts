/**
 * Verifica mientras se escribe (con pausa de 500 ms) si la matrícula ya está
 * registrada en otra vivienda. La regla definitiva la pone el índice único
 * de la base de datos; esto solo avisa antes.
 */

import { useQuery } from '@tanstack/react-query'

import { useDebounce } from '@/shared/hooks'

import { viviendasService } from '../services/viviendas.service'

export type EstadoMatricula =
  | { estado: 'vacia' | 'verificando' | 'libre' | 'error' }
  | { estado: 'duplicada'; manzana: string; numero: string }

export function useVerificacionMatricula(
  matricula: string | undefined,
  viviendaId?: string
): EstadoMatricula {
  const valor = (matricula ?? '').trim()
  const enPausa = useDebounce(valor, 500)
  const valida = /^[0-9-]{3,}$/.test(enPausa)

  const { data, isFetching, isError } = useQuery({
    queryKey: ['viviendas', 'matricula', enPausa, viviendaId ?? null],
    queryFn: () =>
      viviendasService.verificarMatriculaUnica(enPausa, viviendaId),
    enabled: valida,
    staleTime: 30 * 1000,
  })

  if (!valida) return { estado: 'vacia' }
  if (valor !== enPausa || isFetching) return { estado: 'verificando' }
  if (isError) return { estado: 'error' }
  if (data && !data.esUnica && data.viviendaDuplicada)
    return { estado: 'duplicada', ...data.viviendaDuplicada }
  return { estado: 'libre' }
}
