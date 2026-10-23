/**
 * Verifica mientras se escribe (con pausa de 500 ms) si ya hay un cliente con
 * ese tipo y número de documento. La regla definitiva la pone el índice único
 * de la base de datos; esto solo avisa antes y ofrece ir al existente.
 */

import { useQuery } from '@tanstack/react-query'

import { useDebounce } from '@/shared/hooks'

import { clientesService } from '../services/clientes.service'
import {
  validarDocumentoIdentidad,
  type TipoDocumentoColombia,
} from '../utils/validacion-documentos-colombia'

export type EstadoDocumento =
  | { estado: 'vacio' | 'verificando' | 'libre' | 'error' }
  | { estado: 'duplicado'; id: string; nombre: string }

export function useVerificacionDocumento(
  tipo: string,
  numero: string | undefined,
  /** Al editar: el propio cliente no cuenta como duplicado */
  clienteId?: string
): EstadoDocumento {
  const actual = `${tipo}|${(numero ?? '').trim()}`
  const enPausa = useDebounce(actual, 500)
  const [tipoP, numeroP] = enPausa.split('|')
  const formatoValido = validarDocumentoIdentidad(
    tipoP as TipoDocumentoColombia,
    numeroP
  ).valido

  const { data, isFetching, isError } = useQuery({
    queryKey: ['clientes', 'documento', tipoP, numeroP],
    queryFn: () => clientesService.buscarPorDocumento(tipoP, numeroP),
    enabled: formatoValido,
    staleTime: 30 * 1000,
  })

  if (!formatoValido) return { estado: 'vacio' }
  if (actual !== enPausa || isFetching) return { estado: 'verificando' }
  if (isError) return { estado: 'error' }
  if (data && data.id !== clienteId)
    return {
      estado: 'duplicado',
      id: data.id,
      nombre: `${data.nombres} ${data.apellidos}`.trim(),
    }
  return { estado: 'libre' }
}
