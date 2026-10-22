/**
 * useViviendaFinanciero — gastos notariales y recargos configurados, y el
 * resumen financiero según los valores del formulario.
 *
 * Si no se pueden cargar los gastos notariales no se inventa un valor:
 * `errorConfiguracion` lo avisa y la creación falla en el servicio.
 */

import { useMemo } from 'react'

import type { ResumenFinanciero } from '../types'
import { calcularValorTotal } from '../utils'

import {
  useConfiguracionRecargosQuery,
  useGastosNotarialesQuery,
} from './useViviendasQuery'

interface ViviendaFinancieroValues {
  valor_base: number
  es_esquinera: boolean
  recargo_esquinera: number
}

export function useViviendaFinanciero(formValues: ViviendaFinancieroValues) {
  const gastos = useGastosNotarialesQuery()
  const recargos = useConfiguracionRecargosQuery()
  const gastosNotariales = gastos.data ?? 0

  const resumenFinanciero = useMemo((): ResumenFinanciero => {
    const valorBase = Number(formValues.valor_base) || 0
    const recargoEsquinera = formValues.es_esquinera
      ? Number(formValues.recargo_esquinera) || 0
      : 0
    return {
      valor_base: valorBase,
      gastos_notariales: gastosNotariales,
      recargo_esquinera: recargoEsquinera,
      valor_total: calcularValorTotal(
        valorBase,
        gastosNotariales,
        recargoEsquinera
      ),
    }
  }, [
    formValues.valor_base,
    formValues.es_esquinera,
    formValues.recargo_esquinera,
    gastosNotariales,
  ])

  return {
    gastosNotariales,
    configuracionRecargos: recargos.data ?? [],
    resumenFinanciero,
    errorConfiguracion: gastos.isError || recargos.isError,
  }
}
