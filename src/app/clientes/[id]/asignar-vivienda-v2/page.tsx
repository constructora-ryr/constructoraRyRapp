/**
 * Ruta: /clientes/[id]/asignar-vivienda-v2
 *
 * ⚠️ REDIRIGE A: /clientes/[id]/asignar-vivienda
 * Esta ruta se mantiene por backward compatibility
 */

import { redirect } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ nombre?: string }>
}

export default async function Page({ params, searchParams }: PageProps) {
  const { id } = await params
  const search = await searchParams

  const queryParams = new URLSearchParams()
  if (search.nombre) queryParams.set('nombre', search.nombre)

  const queryString = queryParams.toString()
  redirect(
    `/clientes/${id}/asignar-vivienda${queryString ? `?${queryString}` : ''}`
  )
}
