'use client'

/**
 * Abonos activos de la negociación vigente de una vivienda (pestaña Abonos
 * del detalle). Se filtra por negociación, no por vivienda: si un cliente
 * renuncia y la casa se vende a otro, cada uno ve solo sus pagos.
 */

import { useQuery } from '@tanstack/react-query'

import { supabase } from '@/lib/supabase/client'

export interface AbonoVivienda {
  id: string
  numero_recibo: string | number
  monto: number
  fecha_abono: string
  metodo_pago: string
  numero_referencia: string | null
  fuente: string
}

export const abonosViviendaKeys = {
  all: ['abonos-vivienda'] as const,
  list: (negociacionId: string) =>
    [...abonosViviendaKeys.all, negociacionId] as const,
}

async function obtenerAbonos(negociacionId: string): Promise<AbonoVivienda[]> {
  const { data, error } = await supabase
    .from('vista_abonos_completos')
    .select(
      'id, numero_recibo, monto, fecha_abono, metodo_pago, numero_referencia, fuente_pago_tipo'
    )
    .eq('negociacion_id', negociacionId)
    .eq('estado', 'Activo')
    .order('fecha_abono', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []).map(a => ({
    id: a.id as string,
    numero_recibo: a.numero_recibo ?? '',
    monto: Number(a.monto),
    fecha_abono: a.fecha_abono as string,
    metodo_pago: a.metodo_pago as string,
    numero_referencia: a.numero_referencia ?? null,
    fuente: a.fuente_pago_tipo ?? 'Sin fuente',
  }))
}

export function useAbonosViviendaTab(negociacionId: string | undefined) {
  const {
    data = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: abonosViviendaKeys.list(negociacionId ?? ''),
    queryFn: () => obtenerAbonos(negociacionId as string),
    enabled: !!negociacionId,
    staleTime: 30 * 1000,
  })

  return {
    abonos: data,
    cargando: isLoading && !!negociacionId,
    error: error as Error | null,
  }
}
