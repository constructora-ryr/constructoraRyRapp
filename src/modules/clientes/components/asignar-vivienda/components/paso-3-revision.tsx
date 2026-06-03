'use client'

import { motion } from 'framer-motion'
import {
  Building2,
  DollarSign,
  Download,
  Edit2,
  FileText,
  Info,
  User,
} from 'lucide-react'
import { toast } from 'sonner'

import { logger } from '@/lib/utils/logger'
import { formatNombreCompleto } from '@/lib/utils/string.utils'
import { pageStyles as s } from '@/modules/clientes/pages/asignar-vivienda/styles'
import { generarPDFPreview } from '@/modules/clientes/services/pdf-negociacion-preview.service'
import type { TipoFuentePago } from '@/modules/clientes/types'
import { obtenerMonto } from '@/modules/clientes/utils/fuentes-pago-campos.utils'
import { useTiposFuentesConCampos } from '@/modules/configuracion/hooks/useTiposFuentesConCampos'

import type { FuentePagoConfig, ViviendaDetalle } from '../types'

interface FuenteConfiguracion {
  tipo: TipoFuentePago
  config: FuentePagoConfig
}

interface Paso3RevisionProps {
  clienteNombre?: string
  proyectoNombre: string
  vivienda?: ViviendaDetalle
  valorNegociado: number
  descuentoAplicado: number
  valorTotal: number
  notas: string
  fuentes: FuenteConfiguracion[]
  goToStep?: (step: number) => void
}

// Mapeo de tipos de fuente a nombres legibles
const FUENTE_LABELS: Record<string, string> = {
  'Cuota Inicial': 'Cuota Inicial',
  'Crédito Hipotecario': 'Crédito Hipotecario',
  'Subsidio Mi Casa Ya': 'Subsidio Mi Casa Ya',
  'Subsidio Caja Compensación': 'Subsidio Caja Compensación',
}

// Función helper para obtener nombre legible
const getFuenteLabel = (tipo: TipoFuentePago | string): string => {
  return FUENTE_LABELS[tipo] || tipo
}

export function Paso3Revision({
  clienteNombre,
  proyectoNombre,
  vivienda,
  valorNegociado,
  descuentoAplicado,
  valorTotal,
  notas,
  fuentes,
  goToStep,
}: Paso3RevisionProps) {
  // 🔥 Hook para obtener configuración de campos dinámicos
  const { data: tiposConCampos = [] } = useTiposFuentesConCampos()

  const InfoField = ({
    label,
    value,
  }: {
    label: string
    value: string | number
  }) => (
    <div>
      <dt className='text-[10px] text-gray-500 dark:text-gray-400'>{label}</dt>
      <dd className='mt-0.5 text-sm font-medium text-gray-900 dark:text-white'>
        {value}
      </dd>
    </div>
  )

  const SectionHeader = ({
    icon: Icon,
    title,
    onEdit,
  }: {
    icon: React.ElementType
    title: string
    onEdit?: () => void
  }) => (
    <div className='mb-2 flex items-center justify-between'>
      <h3 className='flex items-center gap-1.5 text-base font-medium text-gray-900 dark:text-white'>
        <Icon className='h-4 w-4 text-blue-600 dark:text-blue-400' />
        {title}
      </h3>
      {onEdit && (
        <button
          onClick={onEdit}
          className='flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-medium text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30'
        >
          <Edit2 className='h-3 w-3' />
          Editar
        </button>
      )}
    </div>
  )

  const handleGenerarPDF = async () => {
    try {
      await generarPDFPreview({
        cliente: {
          nombres: clienteNombre?.split(' ')[0] || 'Cliente',
          apellidos: clienteNombre?.split(' ').slice(1).join(' ') || 'Apellido',
          cedula: undefined, // No disponible en este paso
        },
        vivienda: {
          proyecto: proyectoNombre,
          manzana: vivienda?.manzana_nombre,
          numeroVivienda: vivienda?.numero?.toString() || '',
        },
        valorBase: valorNegociado,
        descuento: descuentoAplicado,
        valorFinal: valorTotal,
        fuentesPago: fuentes.map(({ tipo, config }) => {
          // 🔥 Obtener monto usando campos dinámicos
          const tipoConCampos = tiposConCampos.find(t => t.nombre === tipo)
          const camposConfig = tipoConCampos?.configuracion_campos?.campos || []
          const monto = obtenerMonto(config, camposConfig)

          return {
            tipo: getFuenteLabel(tipo),
            monto,
            entidad: config?.entidad || undefined,
          }
        }),
        notas: notas,
      })
    } catch (error) {
      logger.error('❌ Error al generar PDF preview:', error)
      toast.info('⚠️ Error al generar el PDF. Por favor, intenta nuevamente.')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className='space-y-3'
    >
      {/* Botón Descargar PDF */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleGenerarPDF}
        className='inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-green-500/30 transition-all hover:from-green-700 hover:to-emerald-700 hover:shadow-green-500/50'
      >
        <Download className='h-4 w-4' />
        Descargar Resumen en PDF
      </motion.button>

      <div className='space-y-2.5 rounded-xl border border-gray-200/50 bg-white/80 p-3 shadow-xl backdrop-blur-xl transition-shadow hover:shadow-2xl dark:border-gray-700/50 dark:bg-gray-800/80'>
        <SectionHeader
          icon={User}
          title='Información Básica'
          onEdit={goToStep ? () => goToStep(1) : undefined}
        />

        <dl className='grid grid-cols-1 gap-2 md:grid-cols-2'>
          <InfoField
            label='Cliente'
            value={formatNombreCompleto(clienteNombre || 'Cliente')}
          />
          <InfoField label='Proyecto' value={proyectoNombre} />
          <InfoField
            label='Vivienda'
            value={`${vivienda?.manzana_nombre ? `Manzana ${vivienda.manzana_nombre} - ` : ''}Casa ${vivienda?.numero || ''}`}
          />
          <InfoField
            label='Valor Negociado'
            value={`$${valorNegociado.toLocaleString('es-CO')}`}
          />
        </dl>
      </div>

      <div className='space-y-2.5 rounded-xl border border-gray-200/50 bg-white/80 p-3 shadow-xl backdrop-blur-xl transition-shadow hover:shadow-2xl dark:border-gray-700/50 dark:bg-gray-800/80'>
        <SectionHeader
          icon={DollarSign}
          title='Valores Financieros'
          onEdit={goToStep ? () => goToStep(1) : undefined}
        />

        <dl className='space-y-1.5'>
          <div className='flex items-center justify-between py-1'>
            <dt className='text-xs text-gray-600 dark:text-gray-400'>
              Valor Negociado (Base)
            </dt>
            <dd className='text-sm font-medium text-gray-900 dark:text-white'>
              ${valorNegociado.toLocaleString('es-CO')}
            </dd>
          </div>

          {descuentoAplicado > 0 && (
            <>
              <div className='h-px bg-gray-200 dark:bg-gray-700' />
              <div className='flex items-center justify-between py-1'>
                <dt className='flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400'>
                  Descuento Aplicado
                  <span className='inline-flex items-center rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-400'>
                    {((descuentoAplicado / valorNegociado) * 100).toFixed(1)}%
                  </span>
                </dt>
                <dd className='text-sm font-bold text-red-600 dark:text-red-400'>
                  -${descuentoAplicado.toLocaleString('es-CO')}
                </dd>
              </div>
            </>
          )}

          <div className='h-px bg-gray-200 dark:bg-gray-700' />

          <div className='-mx-4 flex items-center justify-between rounded-xl border border-green-200/50 bg-gradient-to-br from-green-50/90 to-emerald-50/90 px-4 py-1.5 dark:border-green-800/50 dark:from-green-950/30 dark:to-emerald-950/30'>
            <dt className='text-sm font-bold text-green-900 dark:text-green-100'>
              Total a Financiar
            </dt>
            <dd className='bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-lg font-bold text-transparent'>
              ${valorTotal.toLocaleString('es-CO')}
            </dd>
          </div>
        </dl>
      </div>

      <div className='space-y-2.5 rounded-xl border border-gray-200/50 bg-white/80 p-3 shadow-xl backdrop-blur-xl transition-shadow hover:shadow-2xl dark:border-gray-700/50 dark:bg-gray-800/80'>
        <SectionHeader
          icon={Building2}
          title='Fuentes de Pago'
          onEdit={goToStep ? () => goToStep(2) : undefined}
        />

        {fuentes.length > 0 ? (
          <dl className='space-y-1.5'>
            {fuentes.map(({ tipo, config }) => {
              // 🔥 Obtener monto usando campos dinámicos
              const tipoConCampos = tiposConCampos.find(t => t.nombre === tipo)
              const camposConfig =
                tipoConCampos?.configuracion_campos?.campos || []
              const monto = obtenerMonto(config, camposConfig)

              return (
                <div
                  key={tipo}
                  className='flex items-center justify-between py-1'
                >
                  <dt className='text-xs text-gray-600 dark:text-gray-400'>
                    {getFuenteLabel(tipo)}
                  </dt>
                  <dd className='text-sm font-medium text-gray-900 dark:text-white'>
                    ${monto.toLocaleString('es-CO')}
                  </dd>
                </div>
              )
            })}

            <div className='h-px bg-gray-200 dark:bg-gray-700' />

            <div className='-mx-4 flex items-center justify-between rounded-xl border border-green-200/50 bg-gradient-to-br from-green-50/90 to-emerald-50/90 px-4 py-1.5 dark:border-green-800/50 dark:from-green-950/30 dark:to-emerald-950/30'>
              <dt className='text-sm font-bold text-green-900 dark:text-green-100'>
                Total Fuentes
              </dt>
              <dd className='bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-lg font-bold text-transparent'>
                $
                {fuentes
                  .reduce((sum, f) => {
                    // 🔥 Obtener monto usando campos dinámicos
                    const tipoConCampos = tiposConCampos.find(
                      t => t.nombre === f.tipo
                    )
                    const camposConfig =
                      tipoConCampos?.configuracion_campos?.campos || []
                    const monto = obtenerMonto(f.config, camposConfig)
                    return sum + monto
                  }, 0)
                  .toLocaleString('es-CO')}
              </dd>
            </div>
          </dl>
        ) : (
          <p className='text-xs italic text-gray-500 dark:text-gray-400'>
            No se configuraron fuentes de pago
          </p>
        )}
      </div>

      {notas && (
        <div className='space-y-2.5 rounded-xl border border-gray-200/50 bg-white/80 p-3 shadow-xl backdrop-blur-xl transition-shadow hover:shadow-2xl dark:border-gray-700/50 dark:bg-gray-800/80'>
          <SectionHeader
            icon={FileText}
            title='Notas'
            onEdit={goToStep ? () => goToStep(1) : undefined}
          />
          <p className='whitespace-pre-wrap text-xs text-gray-700 dark:text-gray-300'>
            {notas}
          </p>
        </div>
      )}

      <div className={s.alert.info}>
        <Info className='h-5 w-5 flex-shrink-0 text-cyan-600 dark:text-cyan-400' />
        <p className='text-sm font-semibold text-cyan-800 dark:text-cyan-200'>
          Revisa cuidadosamente toda la información antes de crear la
          negociación
        </p>
      </div>
    </motion.div>
  )
}
