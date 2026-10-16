'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { supabase } from '@/lib/supabase/client'

export interface PagoExcedente {
  id: string
  negociacion_id: string
  abono_id: string | null
  fuente_tipo: string | null
  monto_pagado: number
  monto_esperado: number
  monto_excedente: number
  estado: 'pendiente' | 'procesado'
  fecha_procesado: string | null
  comprobante_url: string | null
  notas: string | null
  created_at: string
}

export function usePagosExcedentes(negociacionId: string | undefined) {
  return useQuery({
    queryKey: ['pagos-excedentes', negociacionId],
    enabled: !!negociacionId,
    queryFn: async () => {
      if (!negociacionId) return []
      const { data, error } = await supabase
        .from('pagos_excedentes')
        .select('*')
        .eq('negociacion_id', negociacionId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data ?? []) as PagoExcedente[]
    },
    staleTime: 30_000,
  })
}

export function useProcesarPagoExcedente(negociacionId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: {
      id: string
      fecha_procesado?: string
      comprobante_url?: string | null
      notas?: string | null
    }) => {
      const res = await fetch('/api/abonos/procesar-pago-excedente', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? 'Error al procesar la devolución')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['pagos-excedentes', negociacionId],
      })
      toast.success('Devolución registrada correctamente')
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })
}
