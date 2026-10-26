'use client'

/**
 * Orquestador del detalle de vivienda.
 * - Datos: useViviendaQuery (una sola consulta)
 * - Encabezado, pestañas y estados de carga: componentes en ./components
 * - Pestañas pesadas con carga diferida; las visitadas quedan montadas
 */

import { useState } from 'react'

import { DollarSign, FileText, Info } from 'lucide-react'

import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'

import { getShortId } from '@/lib/utils/slug.utils'
import { usePermisosQuery } from '@/modules/usuarios/hooks'
import { AbonosEsqueleto } from '@/modules/viviendas/components/detalle/DetalleEsqueletos'
import { InfoTab } from '@/modules/viviendas/components/detalle/tabs/InfoTab'
import { useViviendaQuery } from '@/modules/viviendas/hooks/useViviendaQuery'
import {
  DetalleTabs,
  type TabDetalle,
} from '@/shared/components/detalle/DetalleTabs'
import { DocumentosListaEsqueleto } from '@/shared/documentos/components/lista/DocumentosListaEsqueleto'
import { usePestanaUrl } from '@/shared/hooks/usePestanaUrl'

import {
  FONDO_DETALLE,
  ViviendaDetalleCargando,
  ViviendaNoEncontrada,
} from './components/ViviendaDetalleEstados'
import { ViviendaDetalleHeader } from './components/ViviendaDetalleHeader'

const DocumentosTab = dynamic(
  () =>
    import('@/modules/viviendas/components/detalle/tabs/DocumentosTab').then(
      m => ({ default: m.DocumentosTab })
    ),
  { loading: () => <DocumentosListaEsqueleto moduleName='viviendas' /> }
)

const AbonosTab = dynamic(
  () =>
    import('@/modules/viviendas/components/detalle/tabs/AbonosTab').then(m => ({
      default: m.AbonosTab,
    })),
  { loading: () => <AbonosEsqueleto /> }
)

const PESTANAS = ['info', 'documentos', 'abonos'] as const
type TabVivienda = (typeof PESTANAS)[number]

export default function ViviendaDetalleClient({
  viviendaId,
}: {
  viviendaId: string
}) {
  const router = useRouter()
  const { puede, esAdmin } = usePermisosQuery()
  const puedeEditar = esAdmin || puede('viviendas', 'editar')
  const puedeVerAbonos = esAdmin || puede('abonos', 'ver')

  const { vivienda, loading, error } = useViviendaQuery(viviendaId)
  // Pestaña en la URL (?tab=documentos): sobrevive a recargar
  const [pestanaUrl, setPestana] = usePestanaUrl(PESTANAS, 'info')
  const activa: TabVivienda =
    pestanaUrl === 'abonos' && !puedeVerAbonos ? 'info' : pestanaUrl
  const [visitadas, setVisitadas] = useState<Set<TabVivienda>>(
    () => new Set<TabVivienda>(['info', activa])
  )

  if (error) return <ViviendaNoEncontrada mensaje={error.message} />
  if (loading || !vivienda) return <ViviendaDetalleCargando />

  const cambiar = (tab: TabVivienda) => {
    setPestana(tab)
    setVisitadas(prev => (prev.has(tab) ? prev : new Set(prev).add(tab)))
  }

  const tabs: TabDetalle<TabVivienda>[] = [
    { id: 'info', label: 'Información', icon: Info },
    { id: 'documentos', label: 'Documentos', icon: FileText },
    ...(puedeVerAbonos
      ? [
          {
            id: 'abonos' as const,
            label: 'Abonos',
            icon: DollarSign,
            count: vivienda.cantidad_abonos,
          },
        ]
      : []),
  ]

  // La activa se monta siempre: con ?tab=abonos el permiso llega después del
  // primer render y la pestaña aún no está en `visitadas`
  const panel = (tab: TabVivienda, contenido: React.ReactNode) =>
    visitadas.has(tab) || activa === tab ? (
      <div
        role='tabpanel'
        id={`panel-${tab}`}
        hidden={activa !== tab}
        key={tab}
      >
        {contenido}
      </div>
    ) : null

  return (
    <div className={FONDO_DETALLE}>
      <div className='mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6 lg:py-8'>
        <ViviendaDetalleHeader
          vivienda={vivienda}
          onEditar={
            puedeEditar
              ? () =>
                  router.push(`/viviendas/${getShortId(vivienda.id)}/editar`)
              : undefined
          }
        />

        <DetalleTabs
          tabs={tabs}
          activa={activa}
          onCambiar={cambiar}
          tema='viviendas'
          etiqueta='Secciones de la vivienda'
        />

        {panel(
          'info',
          <InfoTab vivienda={vivienda} puedeVerAbonos={puedeVerAbonos} />
        )}
        {panel('documentos', <DocumentosTab viviendaId={vivienda.id} />)}
        {puedeVerAbonos
          ? panel(
              'abonos',
              <AbonosTab vivienda={vivienda} puedeVerAbonos={puedeVerAbonos} />
            )
          : null}
      </div>
    </div>
  )
}
