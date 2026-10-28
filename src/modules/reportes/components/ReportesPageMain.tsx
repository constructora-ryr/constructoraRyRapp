'use client'

import { BarChart3, Download, RefreshCw } from 'lucide-react'

import { ListPageHeader } from '@/shared/components/list-page'

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

const BOTON_HERO =
  'inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-white/15 px-3.5 text-sm font-semibold text-white ring-1 ring-inset ring-white/25 transition-colors hover:bg-white/25 active:scale-[0.98] disabled:opacity-60'

export function ReportesPageMain(_props: ReportesPageMainProps = {}) {
  const { data, isLoading, error, refetch, isFetching } =
    useReporteFinanciacion()
  const hayDatos = (data?.entidades.length ?? 0) > 0

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/40 to-blue-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950'>
      <div className='mx-auto max-w-7xl space-y-4 px-4 py-6 sm:px-6 lg:py-8'>
        <ListPageHeader
          icon={BarChart3}
          title='Reportes'
          subtitle='Financiación por entidad: lo aprobado por bancos y subsidios, lo que ya giraron y lo que falta.'
          breadcrumbs={[
            { label: 'Dashboard', href: '/' },
            { label: 'Reportes' },
          ]}
          heroGradient='from-sky-500 via-blue-600 to-blue-700 dark:from-sky-700 dark:via-blue-800 dark:to-blue-900'
          actions={
            <div className='flex gap-2'>
              <button
                type='button'
                onClick={() => refetch()}
                disabled={isFetching}
                aria-label='Actualizar'
                className={BOTON_HERO}
              >
                <RefreshCw
                  className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`}
                />
                <span className='hidden sm:inline'>Actualizar</span>
              </button>
              {hayDatos && data && (
                <button
                  type='button'
                  onClick={() =>
                    exportarCSV(data.entidades, nombreArchivo('financiacion'))
                  }
                  className={BOTON_HERO}
                >
                  <Download className='h-4 w-4' />
                  Exportar todo
                </button>
              )}
            </div>
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
