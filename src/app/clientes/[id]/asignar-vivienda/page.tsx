/**
 * Ruta: /clientes/[id]/asignar-vivienda
 */

import type { Metadata } from 'next'

import { forbidden, notFound } from 'next/navigation'

import { getServerPermissions } from '@/lib/auth/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { resolverSlugClienteServer } from '@/lib/utils/slug.server'
import { esUUID } from '@/lib/utils/slug.utils'
import { AsignarViviendaV2Page } from '@/modules/clientes/pages/asignar-vivienda-v2'

export const metadata: Metadata = {
  title: 'Asignar Vivienda | Constructora RyR',
  description: 'Asignar vivienda a cliente con cierre financiero completo',
}

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ nombre?: string }>
}

export default async function Page({ params, searchParams }: PageProps) {
  const { canCreate, isAdmin } = await getServerPermissions('negociaciones')

  if (!canCreate && !isAdmin) {
    forbidden()
  }

  const { id } = await params
  const search = await searchParams

  // Fix 4: usar resolver server-side y no hacer fallback a id sin validar
  const clienteUUID = await resolverSlugClienteServer(id)

  if (!clienteUUID || !esUUID(clienteUUID)) {
    notFound()
  }

  // Fix 5: verificar que el cliente existe en la base de datos
  const supabase = await createServerSupabaseClient()
  const { data: cliente } = await supabase
    .from('clientes')
    .select('id')
    .eq('id', clienteUUID)
    .single()

  if (!cliente) {
    notFound()
  }

  return (
    <AsignarViviendaV2Page
      clienteId={clienteUUID}
      clienteSlug={id}
      clienteNombre={search.nombre}
    />
  )
}
