/**
 * SeccionDestinoFuentes — Paso 2
 *
 * Selección de vivienda destino + configuración de fuentes de pago.
 * Reutiliza SeccionFuentesPago de asignar-vivienda para consistencia.
 */

'use client'

import { useMemo } from 'react'

import { motion } from 'framer-motion'
import {
  ArrowRightLeft,
  Home,
  Lock,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'

import { formatCurrency } from '@/lib/utils/format.utils'
import { ViviendaCombobox } from '@/modules/clientes/components/asignar-vivienda/components'
import type {
  FuentePagoConfig,
  FuentePagoConfiguracion,
  ViviendaDetalle,
} from '@/modules/clientes/components/asignar-vivienda/types'
import { SeccionFuentesPago } from '@/modules/clientes/pages/asignar-vivienda-v2/components/sections/SeccionFuentesPago'
import type { FuenteConAbonos } from '@/modules/clientes/services/traslado-vivienda.service'
import type { TipoFuentePago } from '@/modules/clientes/types'
import type { TipoFuentePagoConCampos } from '@/modules/configuracion/types/campos-dinamicos.types'
import { FormSelect } from '@/shared/components/ui/form-select'

import { styles as s } from '../../styles'

interface SeccionDestinoFuentesProps {
  // Proyectos/Viviendas
  proyectos: Array<{ id: string; nombre: string }>
  viviendas: ViviendaDetalle[]
  proyectoSeleccionado: string
  viviendaDestinoId: string
  viviendaDestinoSeleccionada: ViviendaDetalle | null
  cargandoProyectos: boolean
  cargandoViviendas: boolean
  setProyectoSeleccionado: (id: string) => void
  setViviendaDestinoId: (id: string) => void
  // Valores
  valorBaseDestino: number
  gastosNotarialesDestino: number
  recargoEsquineraDestino: number
  valorTotalDestino: number
  diferenciaPrecio: number
  valorOrigenTotal: number
  // Fuentes
  cargandoTipos: boolean
  tiposConCampos: TipoFuentePagoConCampos[]
  fuentes: FuentePagoConfiguracion[]
  totalFuentes: number
  diferencia: number
  sumaCierra: boolean
  erroresFuentes: Record<string, string>
  mostrarErroresFuentes: boolean
  handleFuenteEnabledChange: (tipo: TipoFuentePago, enabled: boolean) => void
  handleFuenteConfigChange: (
    tipo: TipoFuentePago,
    config: FuentePagoConfig | null
  ) => void
  // Fuentes obligatorias
  fuentesObligatorias: FuenteConAbonos[]
}

export function SeccionDestinoFuentes({
  proyectos,
  viviendas,
  proyectoSeleccionado,
  viviendaDestinoId,
  viviendaDestinoSeleccionada,
  cargandoProyectos,
  cargandoViviendas,
  setProyectoSeleccionado,
  setViviendaDestinoId,
  valorBaseDestino,
  gastosNotarialesDestino,
  recargoEsquineraDestino,
  valorTotalDestino,
  diferenciaPrecio,
  valorOrigenTotal,
  cargandoTipos,
  tiposConCampos,
  fuentes,
  totalFuentes,
  diferencia,
  sumaCierra,
  erroresFuentes,
  mostrarErroresFuentes,
  handleFuenteEnabledChange,
  handleFuenteConfigChange,
  fuentesObligatorias,
}: SeccionDestinoFuentesProps) {
  // Build minAmounts map for SeccionFuentesPago min-amount badges
  const minAmounts = useMemo(
    () =>
      Object.fromEntries(
        fuentesObligatorias.map(f => [f.tipo, f.monto_recibido])
      ),
    [fuentesObligatorias]
  )

  // Wrapper to block disabling obligatory sources
  const handleToggleFuente = (tipo: TipoFuentePago, enabled: boolean) => {
    // Block disabling of obligatory sources
    if (!enabled) {
      const esObligatoria = fuentesObligatorias.some(
        f => f.tipo.toLowerCase() === tipo.toLowerCase()
      )
      if (esObligatoria) return // do nothing
    }
    handleFuenteEnabledChange(tipo, enabled)
  }

  return (
    <div className='space-y-4'>
      {/* Selección de vivienda destino */}
      <div className='space-y-3'>
        <h3 className='flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white'>
          <Home className='h-4 w-4 text-cyan-600 dark:text-cyan-400' />
          Vivienda Destino
        </h3>

        {/* Proyecto */}
        <div className='space-y-1'>
          <label className={s.label.base}>
            Proyecto <span className={s.label.required}>*</span>
          </label>
          <FormSelect
            value={proyectoSeleccionado}
            onChange={e => {
              setProyectoSeleccionado(e.target.value)
              setViviendaDestinoId('')
            }}
            className={s.input.base}
            disabled={cargandoProyectos}
          >
            <option value=''>
              {cargandoProyectos
                ? 'Cargando proyectos...'
                : 'Selecciona un proyecto'}
            </option>
            {proyectos.map(p => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </FormSelect>
        </div>

        {/* Vivienda Combobox */}
        {proyectoSeleccionado ? (
          <div className='space-y-1'>
            <label className={s.label.base}>
              Vivienda <span className={s.label.required}>*</span>
            </label>
            <ViviendaCombobox
              viviendas={viviendas}
              value={viviendaDestinoId}
              onChange={setViviendaDestinoId}
              disabled={cargandoViviendas}
            />
          </div>
        ) : null}

        {/* Vista previa de vivienda seleccionada */}
        {viviendaDestinoSeleccionada ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className='rounded-xl border-2 border-cyan-200 bg-cyan-50/50 p-4 dark:border-cyan-800 dark:bg-cyan-950/30'
          >
            <div className='space-y-2'>
              <p className='text-sm font-bold text-gray-900 dark:text-white'>
                {viviendaDestinoSeleccionada.manzana_nombre} · Casa{' '}
                {viviendaDestinoSeleccionada.numero}
              </p>

              <div className='grid grid-cols-2 gap-2 text-xs'>
                <div>
                  <span className='text-gray-500 dark:text-gray-400'>
                    Valor base
                  </span>
                  <p className='font-bold text-gray-900 dark:text-white'>
                    {formatCurrency(valorBaseDestino)}
                  </p>
                </div>
                {gastosNotarialesDestino > 0 ? (
                  <div>
                    <span className='text-gray-500 dark:text-gray-400'>
                      Gastos notariales
                    </span>
                    <p className='font-bold text-gray-900 dark:text-white'>
                      {formatCurrency(gastosNotarialesDestino)}
                    </p>
                  </div>
                ) : null}
                {recargoEsquineraDestino > 0 ? (
                  <div>
                    <span className='text-gray-500 dark:text-gray-400'>
                      Recargo esquinera
                    </span>
                    <p className='font-bold text-gray-900 dark:text-white'>
                      {formatCurrency(recargoEsquineraDestino)}
                    </p>
                  </div>
                ) : null}
              </div>

              <div className='border-t border-cyan-200 pt-2 dark:border-cyan-700'>
                <div className='flex items-center justify-between'>
                  <span className='text-xs font-semibold text-gray-700 dark:text-gray-300'>
                    VALOR TOTAL
                  </span>
                  <span className='text-lg font-bold text-cyan-700 dark:text-cyan-300'>
                    {formatCurrency(valorTotalDestino)}
                  </span>
                </div>
              </div>

              {/* Diferencia vs actual */}
              {valorOrigenTotal > 0 ? (
                <div className='flex items-center gap-2 rounded-lg bg-white/80 p-2 dark:bg-gray-800/80'>
                  {diferenciaPrecio > 0 ? (
                    <TrendingUp className='h-4 w-4 text-amber-500' />
                  ) : diferenciaPrecio < 0 ? (
                    <TrendingDown className='h-4 w-4 text-green-500' />
                  ) : (
                    <ArrowRightLeft className='h-4 w-4 text-gray-400' />
                  )}
                  <span
                    className={`text-xs font-semibold ${
                      diferenciaPrecio > 0
                        ? 'text-amber-600 dark:text-amber-400'
                        : diferenciaPrecio < 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-gray-500'
                    }`}
                  >
                    {diferenciaPrecio > 0
                      ? `+${formatCurrency(diferenciaPrecio)} vs actual`
                      : diferenciaPrecio < 0
                        ? `${formatCurrency(diferenciaPrecio)} vs actual`
                        : 'Mismo valor que la actual'}
                  </span>
                </div>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </div>

      {/* Banner fuentes obligatorias */}
      {fuentesObligatorias.length > 0 ? (
        <div className={s.alert.warning}>
          <Lock className={`${s.alert.icon} text-amber-500`} />
          <div className={s.alert.content}>
            <p
              className={`${s.alert.title} text-amber-800 dark:text-amber-200`}
            >
              Fuentes con abonos (obligatorias)
            </p>
            <ul className='mt-1 space-y-0.5'>
              {fuentesObligatorias.map(f => (
                <li
                  key={f.id}
                  className='text-xs text-amber-700 dark:text-amber-300'
                >
                  <strong>{f.tipo}</strong>: {f.abonos_count} abonos por{' '}
                  {formatCurrency(f.monto_recibido)} — monto mínimo:{' '}
                  {formatCurrency(f.monto_recibido)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      {/* Sección de fuentes de pago — reutiliza componente de asignar-vivienda */}
      {viviendaDestinoId ? (
        <SeccionFuentesPago
          valorTotal={valorTotalDestino}
          cargandoTipos={cargandoTipos}
          tiposConCampos={tiposConCampos}
          fuentes={fuentes}
          totalFuentes={totalFuentes}
          diferencia={diferencia}
          sumaCierra={sumaCierra}
          erroresFuentes={erroresFuentes}
          mostrarErroresFuentes={mostrarErroresFuentes}
          handleFuenteEnabledChange={handleToggleFuente}
          handleFuenteConfigChange={handleFuenteConfigChange}
          minAmounts={minAmounts}
        />
      ) : null}
    </div>
  )
}
