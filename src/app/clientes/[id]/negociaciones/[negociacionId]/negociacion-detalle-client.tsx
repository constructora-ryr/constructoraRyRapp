'use client'

import { useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Clock,
  DollarSign,
  FileText,
  Home,
  TrendingUp,
  User,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'

import { useRouter } from 'next/navigation'

import { getShortId } from '@/lib/utils/slug.utils'
import { ConfigurarFuentesPago } from '@/modules/clientes/components/negociaciones'
import { useNegociacion } from '@/modules/clientes/hooks'
import { CuotasCreditoTab } from '@/modules/fuentes-pago/components/CuotasCreditoTab'
import { usePermisosQuery } from '@/modules/usuarios/hooks/usePermisosQuery'
import { useModal } from '@/shared/components/modals'
import { SectionLoadingSpinner } from '@/shared/components/ui'
import { esCreditoConstructora } from '@/shared/constants/fuentes-pago.constants'

interface NegociacionDetalleClientProps {
  clienteId: string
  negociacionId: string
}

// Timeline Step Component
function TimelineStep({
  label,
  estado,
  fecha,
  isActive,
  isCompleted,
}: {
  label: string
  estado: string
  fecha?: string
  isActive: boolean
  isCompleted: boolean
}) {
  return (
    <div className='flex items-start gap-4'>
      <div className='flex flex-col items-center'>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
            isCompleted
              ? 'border-green-500 bg-green-500'
              : isActive
                ? 'border-purple-500 bg-purple-500'
                : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800'
          }`}
        >
          {isCompleted ? (
            <CheckCircle2 className='h-5 w-5 text-white' />
          ) : isActive ? (
            <Clock className='h-5 w-5 text-white' />
          ) : (
            <div className='h-3 w-3 rounded-full bg-gray-300 dark:bg-gray-600' />
          )}
        </div>
        <div className='h-12 w-0.5 bg-gray-200 dark:bg-gray-700' />
      </div>
      <div className='flex-1 pb-8'>
        <p
          className={`font-semibold ${
            isActive
              ? 'text-purple-600 dark:text-purple-400'
              : 'text-gray-700 dark:text-gray-300'
          }`}
        >
          {label}
        </p>
        <p className='text-sm text-gray-500'>{estado}</p>
        {fecha && (
          <p className='mt-1 text-xs text-gray-400'>
            {new Date(fecha).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  )
}

// Badge de Estado
function EstadoBadge({ estado }: { estado: string }) {
  const config: Record<
    string,
    {
      bg: string
      text: string
      icon: React.ComponentType<{ className?: string }>
    }
  > = {
    Activa: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-700 dark:text-green-300',
      icon: CheckCircle2,
    },
    Suspendida: {
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      text: 'text-yellow-700 dark:text-yellow-300',
      icon: Clock,
    },
    Completada: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-700 dark:text-blue-300',
      icon: TrendingUp,
    },
    'Cerrada por Renuncia': {
      bg: 'bg-gray-100 dark:bg-gray-900/30',
      text: 'text-gray-700 dark:text-gray-300',
      icon: AlertCircle,
    },
    // Estados legacy (compatibilidad con datos históricos)
    'En Proceso': {
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      text: 'text-yellow-700 dark:text-yellow-300',
      icon: Clock,
    },
    'Cierre Financiero': {
      bg: 'bg-orange-100 dark:bg-orange-900/30',
      text: 'text-orange-700 dark:text-orange-300',
      icon: DollarSign,
    },
    Cancelada: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-700 dark:text-red-300',
      icon: XCircle,
    },
  }

  const { bg, text, icon: Icon } = config[estado] || config['Activa']

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full ${bg} px-4 py-2 text-sm font-semibold ${text}`}
    >
      <Icon className='h-4 w-4' />
      {estado}
    </span>
  )
}

export default function NegociacionDetalleClient({
  clienteId,
  negociacionId,
}: NegociacionDetalleClientProps) {
  const router = useRouter()
  const { confirm } = useModal()
  const {
    negociacion,
    fuentesPago,
    cargando,
    error,
    completarNegociacion,
    registrarRenuncia,
    recargarNegociacion,
    puedeCompletarse,
    esActiva,
    estadoLegible,
  } = useNegociacion(negociacionId)

  const { isLoading: permisosLoading, rol } = usePermisosQuery()
  const isAdmin = !permisosLoading && rol === 'Administrador'

  const [motivoCancelacion, setMotivoCancelacion] = useState('')
  const [mostrarModalRenuncia, setMostrarModalRenuncia] = useState(false)

  const handleRenuncia = async () => {
    if (!motivoCancelacion.trim()) {
      toast.info('Debes especificar el motivo de la renuncia')
      return
    }
    const ok = await registrarRenuncia(motivoCancelacion)
    if (ok) {
      setMostrarModalRenuncia(false)
      setMotivoCancelacion('')
    }
  }

  if (cargando) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <SectionLoadingSpinner
          label='Cargando negociación...'
          moduleName='negociaciones'
          icon={FileText}
        />
      </div>
    )
  }

  if (!negociacion) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <FileText className='mx-auto mb-4 h-16 w-16 text-gray-400' />
          <h2 className='mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100'>
            Negociación no encontrada
          </h2>
          <button
            onClick={() => router.push(`/clientes/${getShortId(clienteId)}`)}
            className='mt-4 inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700'
          >
            <ArrowLeft className='h-4 w-4' />
            Volver al cliente
          </button>
        </div>
      </div>
    )
  }

  const timeline = [
    {
      label: 'En Proceso',
      estado: 'Negociación creada',
      fecha: negociacion.fecha_creacion,
      isActive: (negociacion.estado as string) === 'En Proceso',
      isCompleted: (negociacion.estado as string) !== 'En Proceso',
    },
    {
      label: 'Cierre Financiero',
      estado: 'Configurando fuentes de pago',
      fecha:
        (negociacion.estado as string) === 'Cierre Financiero'
          ? negociacion.fecha_actualizacion
          : undefined,
      isActive: (negociacion.estado as string) === 'Cierre Financiero',
      isCompleted: ['Activa', 'Completada'].includes(negociacion.estado),
    },
    {
      label: 'Activa',
      estado: 'Negociación en curso',
      fecha:
        negociacion.estado === 'Activa'
          ? negociacion.fecha_actualizacion
          : undefined,
      isActive: negociacion.estado === 'Activa',
      isCompleted: negociacion.estado === 'Completada',
    },
    {
      label: 'Completada',
      estado: 'Proceso finalizado',
      fecha:
        negociacion.estado === 'Completada'
          ? negociacion.fecha_actualizacion
          : undefined,
      isActive: negociacion.estado === 'Completada',
      isCompleted: negociacion.estado === 'Completada',
    },
  ]

  return (
    <div className='container mx-auto px-4 py-6 sm:px-6 lg:px-8'>
      <div className='space-y-6'>
        {/* Breadcrumb */}
        <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
          <button
            onClick={() => router.push('/clientes')}
            className='hover:text-purple-600'
          >
            Clientes
          </button>
          <ChevronRight className='h-4 w-4' />
          <button
            onClick={() => router.push(`/clientes/${getShortId(clienteId)}`)}
            className='hover:text-purple-600'
          >
            Cliente
          </button>
          <ChevronRight className='h-4 w-4' />
          <span className='text-gray-900 dark:text-gray-100'>Negociación</span>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white shadow-xl'
        >
          <div className='flex items-start justify-between'>
            <div>
              <h1 className='mb-2 text-3xl font-bold'>
                Negociación #{negociacion.id.slice(0, 8)}
              </h1>
              <p className='text-purple-100'>{estadoLegible}</p>
            </div>
            <EstadoBadge estado={negociacion.estado} />
          </div>

          <div className='mt-6 grid grid-cols-1 gap-4 md:grid-cols-3'>
            <div className='rounded-lg bg-white/10 p-4 backdrop-blur-sm'>
              <div className='flex items-center gap-2 text-purple-100'>
                <User className='h-4 w-4' />
                <span className='text-sm'>Cliente</span>
              </div>
              <p className='mt-1 font-semibold'>
                {negociacion.clientes?.nombre_completo || '—'}
              </p>
            </div>
            <div className='rounded-lg bg-white/10 p-4 backdrop-blur-sm'>
              <div className='flex items-center gap-2 text-purple-100'>
                <Home className='h-4 w-4' />
                <span className='text-sm'>Vivienda</span>
              </div>
              <p className='mt-1 font-semibold'>
                Casa {negociacion.viviendas?.numero || '—'}
              </p>
            </div>
            <div className='rounded-lg bg-white/10 p-4 backdrop-blur-sm'>
              <div className='flex items-center gap-2 text-purple-100'>
                <DollarSign className='h-4 w-4' />
                <span className='text-sm'>Valor Total</span>
              </div>
              <p className='mt-1 text-2xl font-bold'>
                $
                {(
                  negociacion.valor_total_pagar ?? negociacion.valor_total
                )?.toLocaleString('es-CO')}
              </p>
            </div>
          </div>
        </motion.div>

        <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className='rounded-xl border bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800'
          >
            <h2 className='mb-6 text-xl font-bold text-gray-900 dark:text-white'>
              Timeline del Proceso
            </h2>
            <div className='space-y-2'>
              {timeline.map((step, idx) => (
                <TimelineStep key={idx} {...step} />
              ))}
            </div>
          </motion.div>

          {/* Contenido Principal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='space-y-6 lg:col-span-2'
          >
            {/* Configurar Fuentes de Pago */}
            {esActiva && (
              <div className='rounded-xl border bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800'>
                <h3 className='mb-4 text-lg font-semibold'>
                  Configurar Fuentes de Pago
                </h3>
                <ConfigurarFuentesPago
                  negociacionId={negociacionId}
                  valorTotal={
                    negociacion.valor_total_pagar ?? negociacion.valor_total
                  }
                  onFuentesActualizadas={() => recargarNegociacion()}
                />
              </div>
            )}

            {/* Acciones */}
            {negociacion.estado === 'Activa' && (
              <div className='rounded-xl border bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800'>
                <h3 className='mb-4 text-lg font-semibold'>Acciones</h3>
                <div className='flex flex-wrap gap-3'>
                  {puedeCompletarse && (
                    <button
                      onClick={async () => {
                        const confirmado = await confirm({
                          title: 'Completar negociación',
                          message:
                            '¿Confirmar que la negociación está completada (100% pagado)?',
                          variant: 'success',
                          confirmText: 'Completar',
                          cancelText: 'Cancelar',
                        })
                        if (confirmado) {
                          await completarNegociacion()
                        }
                      }}
                      className='rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700'
                    >
                      Completar Negociación
                    </button>
                  )}

                  <button
                    onClick={() => setMostrarModalRenuncia(true)}
                    className='rounded-lg border-2 border-orange-500 px-4 py-2 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                  >
                    Registrar Renuncia
                  </button>
                </div>
              </div>
            )}

            {/* Información Adicional */}
            <div className='rounded-xl border bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800'>
              <h3 className='mb-4 text-lg font-semibold'>Detalles</h3>
              <div className='space-y-3 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-gray-600 dark:text-gray-400'>
                    Valor Negociado:
                  </span>
                  <span className='font-semibold'>
                    ${negociacion.valor_negociado?.toLocaleString('es-CO')}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600 dark:text-gray-400'>
                    Descuento:
                  </span>
                  <span className='font-semibold text-green-600'>
                    -${negociacion.descuento_aplicado?.toLocaleString('es-CO')}
                  </span>
                </div>
                <div className='flex justify-between border-t pt-3 dark:border-gray-700'>
                  <span className='text-gray-600 dark:text-gray-400'>
                    Valor Total:
                  </span>
                  <span className='text-lg font-bold'>
                    ${negociacion.valor_total?.toLocaleString('es-CO')}
                  </span>
                </div>
                {negociacion.notas && (
                  <div className='mt-4 border-t pt-4 dark:border-gray-700'>
                    <p className='mb-2 text-gray-600 dark:text-gray-400'>
                      Notas:
                    </p>
                    <p className='text-gray-900 dark:text-white'>
                      {negociacion.notas}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Plan de crédito — Cierre Financiero */}
            {fuentesPago
              .filter(f => esCreditoConstructora(f.tipo))
              .map(fuente => (
                <div
                  key={fuente.id}
                  className='rounded-xl border bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800'
                >
                  <div className='mb-4 flex items-center gap-2'>
                    <DollarSign className='h-5 w-5 text-indigo-500' />
                    <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                      Ajuste de Cierre Financiero
                    </h3>
                    <span className='ml-auto rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'>
                      Crédito con la Constructora
                    </span>
                  </div>
                  <CuotasCreditoTab
                    fuentePagoId={fuente.id}
                    negociacionId={negociacionId}
                    montoFuente={fuente.monto_aprobado}
                    onPagoCuotaRegistrado={() => {
                      recargarNegociacion()
                    }}
                    readonly={!esActiva}
                    isAdmin={isAdmin}
                  />
                </div>
              ))}

            {/* Error */}
            {error && (
              <div className='rounded-xl border-2 border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20'>
                <p className='text-sm text-red-700 dark:text-red-300'>
                  {error}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Modal Renuncia */}
      <AnimatePresence>
        {mostrarModalRenuncia && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMostrarModalRenuncia(false)}
              className='fixed inset-0 z-50 bg-black/60 backdrop-blur-sm'
            />
            <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className='w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800'
              >
                <h3 className='mb-4 text-xl font-bold'>
                  Registrar Renuncia del Cliente
                </h3>
                <p className='mb-4 text-sm text-gray-600 dark:text-gray-400'>
                  Especifica el motivo de la renuncia:
                </p>
                <textarea
                  value={motivoCancelacion}
                  onChange={e => setMotivoCancelacion(e.target.value)}
                  rows={4}
                  className='w-full rounded-lg border p-3 dark:border-gray-600 dark:bg-gray-700'
                  placeholder='Ej: Cliente encontró mejor oferta en otro proyecto...'
                />
                <div className='mt-4 flex gap-3'>
                  <button
                    onClick={() => setMostrarModalRenuncia(false)}
                    className='flex-1 rounded-lg border px-4 py-2 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700'
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleRenuncia}
                    className='flex-1 rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700'
                  >
                    Confirmar Renuncia
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
