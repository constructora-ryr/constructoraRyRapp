'use client'

import { BarChart3, Download, RefreshCw } from 'lucide-react'

import {
  BotonPrincipal,
  BotonSecundario,
  ListPageHeader,
} from '@/shared/components/list-page'

import { useReporteFinanciacion } from '../hooks/useReporteFinanciacion'
import { exportarCSV, nombreArchivo } from '../utils/reportes.utils'

import { ReporteFinanciacion } from './ReporteFinanciacion'

interface ReportesPageMainProps {
  canCreate?: boolean
  canEdit?: boolean
  canDelete?: boolean
  canView?: boolean
  isAdmin?: boolean
}

export function ReportesPageMain(_props: ReportesPageMainProps = {}) {
  const { data, isLoading, error, refetch, isFetching } =
    useReporteFinanciacion()
  const hayDatos = (data?.entidades.length ?? 0) > 0

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/40 to-blue-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950'>
      <div className='mx-auto max-w-7xl space-y-4 px-4 py-6 sm:px-6 lg:py-8'>
        <ListPageHeader
          icon={BarChart3}
          modulo='/reportes'
          title='Reportes'
          subtitle='Créditos y subsidios por entidad: lo aprobado, lo que ya giraron y lo que falta.'
          actions={
            <>
              <BotonSecundario
                icon={RefreshCw}
                onClick={() => refetch()}
                cargando={isFetching}
                aria-label='Actualizar'
                compactoEnMovil
              >
                Actualizar
              </BotonSecundario>
              {hayDatos && data ? (
                <BotonPrincipal
                  modulo='/reportes'
                  icon={Download}
                  onClick={() =>
                    exportarCSV(data.entidades, nombreArchivo('financiacion'))
                  }
                >
                  Exportar todo
                </BotonPrincipal>
              ) : null}
            </>
          }
        />

        <ReporteFinanciacion
          data={data}
          isLoading={isLoading}
          error={error}
          onReintentar={() => refetch()}
        />
      </div>
    </div>
  )
}
