'use client'

import { useCallback, useState } from 'react'

import { CreditCard, Receipt } from 'lucide-react'

import { useRouter } from 'next/navigation'

import { AbonoDetalleModal } from '@/modules/abonos/components/abono-detalle-modal/AbonoDetalleModal'
import { AbonosListFiltros } from '@/modules/abonos/components/lista/AbonosListFiltros'
import { AbonosListHeader } from '@/modules/abonos/components/lista/AbonosListHeader'
import { AbonosListMetricas } from '@/modules/abonos/components/lista/AbonosListMetricas'
import { AbonosTabla } from '@/modules/abonos/components/lista/AbonosTabla'
import { ModalAnularAbono } from '@/modules/abonos/components/modal-anular-abono'
import { ModalEditarAbono } from '@/modules/abonos/components/modal-editar-abono'
import { useAbonosList } from '@/modules/abonos/hooks/useAbonosList'
import type { AbonoConInfo } from '@/modules/abonos/hooks/useAbonosQuery'
import type { AbonoParaEditar } from '@/modules/abonos/types/editar-abono.types'
import { EmptyState } from '@/shared/components/ui/EmptyState'

interface AbonosListPageProps {
  canCreate?: boolean
  canEdit?: boolean
  canDelete?: boolean
  canView?: boolean
  isAdmin?: boolean
}

export function AbonosListPage({
  canCreate = false,
  canEdit = false,
  canDelete = false,
  canView = false,
  isAdmin = false,
}: AbonosListPageProps = {}) {
  const router = useRouter()

  // â”€â”€â”€ Estado de modales â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [abonoSeleccionado, setAbonoSeleccionado] =
    useState<AbonoConInfo | null>(null)
  const [modalDetalleOpen, setModalDetalleOpen] = useState(false)
  const [abonoEditando, setAbonoEditando] = useState<AbonoParaEditar | null>(
    null
  )
  const [abonoAnulando, setAbonoAnulando] = useState<AbonoConInfo | null>(null)

  const handleAbonoClick = useCallback((abono: AbonoConInfo) => {
    setAbonoSeleccionado(abono)
    setModalDetalleOpen(true)
  }, [])

  const handleCerrarDetalle = useCallback(() => {
    setModalDetalleOpen(false)
    setAbonoSeleccionado(null)
  }, [])

  // â”€â”€â”€ Datos y filtros â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const {
    abonos,
    estadisticas,
    fuentesUnicas,
    mesesDisponibles,
    filtros,
    actualizarFiltros,
    limpiarFiltros,
    toggleMostrarActivos,
    toggleMostrarAnulados,
    toggleMostrarRenunciados,
    paginaActual,
    totalPaginas,
    totalFiltrado,
    setPaginaActual,
    pageSize,
    setPageSize,
    isLoading,
    error,
    refetch,
  } = useAbonosList()

  // â”€â”€â”€ Loading â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (isLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-purple-50 dark:from-gray-950 dark:via-slate-900 dark:to-gray-900'>
        <div className='mx-auto max-w-7xl space-y-4 px-4 py-6 sm:px-6 lg:px-8'>
          <div className='h-28 animate-pulse rounded-2xl bg-violet-200 dark:bg-violet-900/30' />
          <div className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className='h-24 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800'
              />
            ))}
          </div>
          <div className='h-12 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800' />
          <div className='h-80 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800' />
        </div>
      </div>
    )
  }

  // â”€â”€â”€ Error â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (error) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-slate-50 dark:bg-gray-950'>
        <div className='space-y-2 text-center'>
          <Receipt className='mx-auto h-10 w-10 text-red-400' />
          <p className='text-sm text-gray-600 dark:text-gray-400'>{error}</p>
        </div>
      </div>
    )
  }

  // â”€â”€â”€ Vista principal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <>
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-purple-50 dark:from-gray-950 dark:via-slate-900 dark:to-gray-900'>
        <div className='mx-auto max-w-7xl space-y-4 px-4 py-6 sm:px-6 lg:px-8'>
          <AbonosListHeader
            totalAbonos={estadisticas.totalAbonos}
            canCreate={canCreate}
            onRegistrar={() => router.push('/abonos/registrar')}
          />

          <AbonosListMetricas estadisticas={estadisticas} />

          <AbonosListFiltros
            filtros={filtros}
            fuentesUnicas={fuentesUnicas}
            mesesDisponibles={mesesDisponibles}
            totalFiltrado={totalFiltrado}
            montoTotalFiltrado={estadisticas.montoTotal}
            actualizarFiltros={actualizarFiltros}
            limpiarFiltros={limpiarFiltros}
            toggleMostrarActivos={toggleMostrarActivos}
            toggleMostrarAnulados={toggleMostrarAnulados}
            toggleMostrarRenunciados={toggleMostrarRenunciados}
          />

          {totalFiltrado === 0 ? (
            <EmptyState
              icon={Receipt}
              title='No hay abonos registrados'
              description='Registra el primer abono para comenzar a llevar el control de pagos'
              action={
                canCreate
                  ? {
                      label: 'Registrar Primer Abono',
                      onClick: () => router.push('/abonos/registrar'),
                      icon: CreditCard,
                    }
                  : undefined
              }
              moduleName='abonos'
            />
          ) : (
            <AbonosTabla
              abonos={abonos}
              canEdit={isAdmin || canEdit}
              canAnular={isAdmin || canDelete}
              onAbonoClick={handleAbonoClick}
              onEditar={setAbonoEditando}
              onAnular={setAbonoAnulando}
              paginaActual={paginaActual}
              totalPaginas={totalPaginas}
              totalFiltrado={totalFiltrado}
              pageSize={pageSize}
              setPaginaActual={setPaginaActual}
              setPageSize={setPageSize}
            />
          )}
        </div>
      </div>

      {/* â”€â”€â”€ Modales â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <AbonoDetalleModal
        abono={abonoSeleccionado}
        isOpen={modalDetalleOpen}
        onClose={handleCerrarDetalle}
        canVerCliente={isAdmin || canView}
        onAnulado={() => {
          handleCerrarDetalle()
          refetch()
        }}
        negociacionFinancials={
          abonoSeleccionado
            ? {
                valorTotal: abonoSeleccionado.negociacion_valor_total,
                totalAbonado: abonoSeleccionado.negociacion_total_abonado,
                saldoPendiente: abonoSeleccionado.negociacion_saldo_pendiente,
              }
            : undefined
        }
      />
      {(isAdmin || canEdit) && abonoEditando ? (
        <ModalEditarAbono
          isOpen={!!abonoEditando}
          abono={abonoEditando}
          onClose={() => setAbonoEditando(null)}
          onSuccess={() => {
            setAbonoEditando(null)
            refetch()
          }}
        />
      ) : null}
      {(isAdmin || canDelete) && abonoAnulando ? (
        <ModalAnularAbono
          abono={{
            id: abonoAnulando.id,
            numero_recibo: abonoAnulando.numero_recibo,
            monto: abonoAnulando.monto,
            fecha_abono: abonoAnulando.fecha_abono,
            cliente_nombre:
              `${abonoAnulando.cliente.nombres} ${abonoAnulando.cliente.apellidos}`.trim(),
            vivienda_info: abonoAnulando.vivienda.manzana.identificador
              ? `Mz.${abonoAnulando.vivienda.manzana.identificador} Casa No. ${abonoAnulando.vivienda.numero}`
              : `N°${abonoAnulando.vivienda.numero}`,
            proyecto_nombre: abonoAnulando.proyecto.nombre,
            fuente_tipo: abonoAnulando.fuente_pago.tipo,
          }}
          onClose={() => setAbonoAnulando(null)}
          onAnulacionExitosa={() => {
            setAbonoAnulando(null)
            refetch()
          }}
        />
      ) : null}
    </>
  )
}
