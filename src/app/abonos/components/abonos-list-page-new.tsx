'use client'

import { useCallback, useMemo, useState } from 'react'

import { motion } from 'framer-motion'
import {
  CalendarClock,
  CreditCard,
  Plus,
  Receipt,
  TrendingUp,
  Wallet,
} from 'lucide-react'

import { useRouter, useSearchParams } from 'next/navigation'

import { formatDateCompact } from '@/lib/utils/date.utils'
import { AbonoDetalleModal } from '@/modules/abonos/components/abono-detalle-modal/AbonoDetalleModal'
import {
  aEditable,
  AbonosTabla,
} from '@/modules/abonos/components/lista/AbonosTabla'
import { RecaudoPorFuente } from '@/modules/abonos/components/lista/RecaudoPorFuente'
import { ModalAnularAbono } from '@/modules/abonos/components/modal-anular-abono'
import { ModalEditarAbono } from '@/modules/abonos/components/modal-editar-abono'
import {
  useAbonosList,
  type EstadoAbonoFiltro,
  type RangoFecha,
} from '@/modules/abonos/hooks/useAbonosList'
import type { AbonoConInfo } from '@/modules/abonos/hooks/useAbonosQuery'
import { TEMA_ABONOS } from '@/modules/abonos/styles/tema-abonos'
import type { AbonoParaEditar } from '@/modules/abonos/types/editar-abono.types'
import {
  EstadoFiltroCards,
  formatCOP,
  HeroDato,
  ListPageHeader,
  ListSearchToolbar,
  type EstadoFiltroOpcion,
} from '@/shared/components/list-page'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { FilterDropdown } from '@/shared/components/ui/filter-dropdown'
import { NoResults } from '@/shared/components/ui/NoResults'
import { ABONO_ESTADO_BADGE } from '@/shared/config/estados.colors'

interface AbonosListPageProps {
  canCreate?: boolean
  canEdit?: boolean
  canDelete?: boolean
  canView?: boolean
  isAdmin?: boolean
}

const RANGOS: { value: RangoFecha; label: string }[] = [
  { value: 'todo', label: 'Todo el tiempo' },
  { value: 'este-mes', label: 'Este mes' },
  { value: 'mes-anterior', label: 'Mes anterior' },
  { value: 'ultimos-3-meses', label: 'Últimos 3 meses' },
  { value: 'este-ano', label: 'Este año' },
  { value: 'personalizado', label: 'Personalizado…' },
]

const FILTRO_ACTIVO =
  'border-violet-400 bg-violet-50 text-violet-700 dark:border-violet-500/70 dark:bg-violet-900/20 dark:text-violet-300'

const inputFecha =
  'h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200 dark:focus:ring-violet-900'

export function AbonosListPage({
  canCreate = false,
  canEdit = false,
  canDelete = false,
  canView = false,
  isAdmin = false,
}: AbonosListPageProps = {}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQ = searchParams.get('q') ?? ''

  // ─── Estado de modales ───────────────────────────────────────────────────
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

  const irARegistrar = useCallback(
    () => router.push('/abonos/registrar'),
    [router]
  )

  // ─── Datos y filtros ─────────────────────────────────────────────────────
  const {
    abonos,
    totalSinFiltrar,
    estadisticas,
    fuentesUnicas,
    entidadesUnicas,
    filtros,
    actualizarFiltros,
    limpiarFiltros,
    hayFiltros,
    isLoading,
    error,
    refetch,
  } = useAbonosList(initialQ)

  // Navegación ← → del visor: mismo orden por defecto de la tabla (fecha de
  // pago, más reciente primero)
  const abonosEnOrden = useMemo(
    () =>
      [...abonos].sort(
        (x, y) =>
          y.fecha_abono.localeCompare(x.fecha_abono) ||
          y.numero_recibo.localeCompare(x.numero_recibo, undefined, {
            numeric: true,
          })
      ),
    [abonos]
  )
  const indiceSeleccionado = abonoSeleccionado
    ? abonosEnOrden.findIndex(a => a.id === abonoSeleccionado.id)
    : -1
  const navegacion =
    indiceSeleccionado >= 0
      ? {
          actual: indiceSeleccionado + 1,
          total: abonosEnOrden.length,
          onAnterior:
            indiceSeleccionado > 0
              ? () =>
                  setAbonoSeleccionado(abonosEnOrden[indiceSeleccionado - 1])
              : undefined,
          onSiguiente:
            indiceSeleccionado < abonosEnOrden.length - 1
              ? () =>
                  setAbonoSeleccionado(abonosEnOrden[indiceSeleccionado + 1])
              : undefined,
        }
      : undefined

  // Las tarjetas de conteo son también el filtro de estado
  const conEstilo = (estado: string) => {
    const cfg = ABONO_ESTADO_BADGE[estado]
    return {
      icon: cfg.icon,
      gradient: cfg.gradient,
      text: cfg.text,
      selected: cfg.selected,
    }
  }

  const { conteos } = estadisticas
  const opcionesEstado: EstadoFiltroOpcion<EstadoAbonoFiltro>[] = [
    {
      value: 'Todos',
      label: 'Todos',
      count: conteos.Todos,
      icon: Receipt,
      gradient: 'from-violet-500 to-purple-600',
      text: 'text-violet-700 dark:text-violet-400',
      selected:
        'border-violet-400 bg-violet-50/80 ring-2 ring-violet-400/40 dark:border-violet-500/60 dark:bg-violet-500/10',
    },
    {
      value: 'Activo',
      label: 'Válidos',
      count: conteos.Activo,
      ...conEstilo('Activo'),
    },
    {
      value: 'Anulado',
      label: 'Anulados',
      count: conteos.Anulado,
      ...conEstilo('Anulado'),
    },
    {
      value: 'Renuncia',
      label: 'De renuncias',
      count: conteos.Renuncia,
      ...conEstilo('Renuncia'),
    },
  ]

  const total = abonos.length
  const resultado =
    total === 0
      ? 'Sin resultados'
      : `${total} recibo${total !== 1 ? 's' : ''} · ${formatCOP(estadisticas.montoFiltrado)}`

  // ─── Error ───────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950'>
        <div className='space-y-2 text-center'>
          <Receipt className='mx-auto h-10 w-10 text-red-400' />
          <p className='text-sm text-slate-600 dark:text-slate-400'>{error}</p>
        </div>
      </div>
    )
  }

  // ─── Vista principal ─────────────────────────────────────────────────────
  return (
    <>
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/60 to-purple-50/60 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950'>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
          className='mx-auto max-w-[1400px] space-y-5 px-4 py-6 sm:px-6 lg:py-8'
        >
          <ListPageHeader
            icon={CreditCard}
            heroGradient={TEMA_ABONOS.degradado}
            title='Abonos'
            subtitle='Recibos de pago de los clientes'
            breadcrumbs={[
              { label: 'Dashboard', href: '/' },
              { label: 'Abonos' },
            ]}
            actions={
              <>
                {!isLoading && (
                  <div className='flex flex-wrap gap-2'>
                    <HeroDato
                      icon={Wallet}
                      label='Total recaudado'
                      valor={formatCOP(estadisticas.totalRecaudado)}
                    />
                    <HeroDato
                      icon={TrendingUp}
                      label={`Recaudado ${new Date().getFullYear()}`}
                      valor={formatCOP(estadisticas.recaudadoEsteAnio)}
                    />
                    {estadisticas.ultimoAbono && (
                      <HeroDato
                        icon={CalendarClock}
                        label='Último abono'
                        valor={formatDateCompact(estadisticas.ultimoAbono)}
                      />
                    )}
                  </div>
                )}
                {canCreate && (
                  <button
                    type='button'
                    onClick={irARegistrar}
                    className='inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-violet-700 shadow-lg shadow-violet-900/20 transition-all hover:-translate-y-0.5 hover:bg-violet-50 hover:shadow-xl'
                  >
                    <Plus className='h-4 w-4' />
                    Registrar abono
                  </button>
                )}
              </>
            }
          />

          <EstadoFiltroCards
            ariaLabel='Filtrar abonos por estado'
            total={conteos.Todos}
            opciones={opcionesEstado}
            seleccionado={filtros.estado}
            onSeleccionar={estado => actualizarFiltros({ estado })}
          />

          {!isLoading && (
            <RecaudoPorFuente
              porFuente={estadisticas.porFuente}
              seleccionada={filtros.fuente}
              onSeleccionar={fuente => actualizarFiltros({ fuente })}
            />
          )}

          <div className='space-y-2'>
            <ListSearchToolbar
              value={filtros.busqueda}
              onChange={busqueda => actualizarFiltros({ busqueda })}
              placeholder='Buscar por cliente, cédula, recibo, vivienda (A17) o proyecto…'
              resultado={resultado}
              onLimpiar={hayFiltros ? limpiarFiltros : undefined}
            >
              <FilterDropdown
                value={filtros.rango}
                placeholder='Todo el tiempo'
                allValue='todo'
                activeClassName={FILTRO_ACTIVO}
                options={RANGOS}
                onChange={v =>
                  actualizarFiltros({
                    rango: v as RangoFecha,
                    fechaDesde: '',
                    fechaHasta: '',
                  })
                }
              />
              <FilterDropdown
                value={filtros.fuente}
                placeholder='Todas las fuentes'
                allValue='todas'
                activeClassName={FILTRO_ACTIVO}
                options={[
                  { value: 'todas', label: 'Todas las fuentes' },
                  ...fuentesUnicas.map(f => ({ value: f, label: f })),
                ]}
                onChange={fuente => actualizarFiltros({ fuente })}
              />
              {entidadesUnicas.length > 0 && (
                <FilterDropdown
                  value={filtros.entidad}
                  placeholder='Todas las entidades'
                  allValue='todas'
                  activeClassName={FILTRO_ACTIVO}
                  options={[
                    { value: 'todas', label: 'Todas las entidades' },
                    ...entidadesUnicas.map(e => ({ value: e, label: e })),
                  ]}
                  onChange={entidad => actualizarFiltros({ entidad })}
                />
              )}
            </ListSearchToolbar>

            {filtros.rango === 'personalizado' && (
              <div className='flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400'>
                <label htmlFor='abonos-desde'>Desde</label>
                <input
                  id='abonos-desde'
                  type='date'
                  value={filtros.fechaDesde}
                  max={filtros.fechaHasta || undefined}
                  onChange={e =>
                    actualizarFiltros({ fechaDesde: e.target.value })
                  }
                  className={inputFecha}
                />
                <label htmlFor='abonos-hasta'>hasta</label>
                <input
                  id='abonos-hasta'
                  type='date'
                  value={filtros.fechaHasta}
                  min={filtros.fechaDesde || undefined}
                  onChange={e =>
                    actualizarFiltros({ fechaHasta: e.target.value })
                  }
                  className={inputFecha}
                />
              </div>
            )}
          </div>

          {isLoading ? (
            <div className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700/60 dark:bg-slate-800/60'>
              <div className='h-11 animate-pulse bg-gradient-to-r from-violet-200 to-fuchsia-200 dark:from-violet-900/40 dark:to-fuchsia-900/40' />
              <div className='space-y-3 p-4'>
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className='h-12 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-700/50'
                  />
                ))}
              </div>
            </div>
          ) : total === 0 ? (
            totalSinFiltrar === 0 ? (
              <EmptyState
                icon={Receipt}
                title='No hay abonos registrados'
                description='Registra el primer abono para comenzar a llevar el control de pagos'
                action={
                  canCreate
                    ? {
                        label: 'Registrar primer abono',
                        onClick: irARegistrar,
                        icon: CreditCard,
                      }
                    : undefined
                }
                moduleName='abonos'
              />
            ) : (
              <NoResults
                moduleName='abonos'
                onLimpiarFiltros={limpiarFiltros}
                mensaje='No hay abonos que coincidan con los filtros aplicados'
              />
            )
          ) : (
            <AbonosTabla
              abonos={abonos}
              canEdit={isAdmin || canEdit}
              canAnular={isAdmin || canDelete}
              onAbonoClick={handleAbonoClick}
              onEditar={setAbonoEditando}
              onAnular={setAbonoAnulando}
              porMes={estadisticas.porMes}
            />
          )}
        </motion.div>
      </div>

      {/* ─── Modales ─────────────────────────────────────────────────────── */}
      <AbonoDetalleModal
        abono={abonoSeleccionado}
        isOpen={modalDetalleOpen}
        onClose={handleCerrarDetalle}
        canVerCliente={isAdmin || canView}
        canEditar={isAdmin || canEdit}
        canAnular={isAdmin || canDelete}
        onEditar={
          isAdmin || canEdit
            ? a => {
                const original = abonos.find(x => x.id === a.id)
                if (original) setAbonoEditando(aEditable(original))
              }
            : undefined
        }
        navegacion={navegacion}
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
