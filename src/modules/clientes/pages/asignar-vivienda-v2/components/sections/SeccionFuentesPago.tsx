'use client'

import { useCallback, useRef, useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  AlertTriangle,
  Banknote,
  Building2,
  Check,
  CircleDollarSign,
  Home,
  Wallet,
  XCircle,
} from 'lucide-react'

import { formatCurrency } from '@/lib/utils/format.utils'
import type {
  FuentePagoConfig,
  FuentePagoConfiguracion,
} from '@/modules/clientes/components/asignar-vivienda/types'
import { CampoFormularioDinamico } from '@/modules/clientes/components/fuente-pago-card/CampoFormularioDinamico'
import type { TipoFuentePago } from '@/modules/clientes/types'
import { obtenerMontoParaCierre } from '@/modules/clientes/utils/fuentes-pago-campos.utils'
import type {
  CampoConfig,
  TipoFuentePagoConCampos,
  ValorCampo,
  ValoresCampos,
} from '@/modules/configuracion/types/campos-dinamicos.types'
import { CreditoConstructoraForm } from '@/modules/fuentes-pago/components/CreditoConstructoraForm'
import type { ParametrosCredito } from '@/modules/fuentes-pago/types'
import { Cargador } from '@/shared/components/carga'
import { cn } from '@/shared/utils/helpers'

import { styles as s } from '../../styles'

interface SeccionFuentesPagoProps {
  valorTotal: number
  cargandoTipos: boolean
  tiposConCampos: TipoFuentePagoConCampos[]
  fuentes: FuentePagoConfiguracion[]
  totalFuentes: number
  diferencia: number
  sumaCierra: boolean
  erroresFuentes: Record<string, string>
  mostrarErroresFuentes: boolean
  /** Montos mínimos requeridos por fuente (traslado). Keyed by fuente.tipo */
  minAmounts?: Record<string, number>
  handleFuenteEnabledChange: (tipo: TipoFuentePago, enabled: boolean) => void
  handleFuenteConfigChange: (
    tipo: TipoFuentePago,
    config: FuentePagoConfig | null
  ) => void
}

function iconForFuente(nombre: string) {
  const n = nombre.toLowerCase()
  if (n.includes('hipotecario') || n.includes('banco')) return Building2
  if (n.includes('subsidio') || n.includes('vivienda') || n.includes('casa'))
    return Home
  if (n.includes('cuota') || n.includes('inicial')) return Wallet
  if (n.includes('leasing')) return CircleDollarSign
  return Banknote
}

export function SeccionFuentesPago({
  valorTotal,
  cargandoTipos,
  tiposConCampos,
  fuentes,
  totalFuentes,
  diferencia,
  sumaCierra,
  erroresFuentes,
  mostrarErroresFuentes,
  minAmounts,
  handleFuenteEnabledChange,
  handleFuenteConfigChange,
}: SeccionFuentesPagoProps) {
  const pct =
    valorTotal > 0 ? Math.min(100, (totalFuentes / valorTotal) * 100) : 0

  if (cargandoTipos) {
    return (
      <Cargador
        modulo='clientes'
        tamano='sm'
        label='Cargando fuentes de pago activas'
        className='py-8'
      />
    )
  }

  const falta = diferencia > 0
  const sobra = diferencia < 0
  const activas = fuentes.filter(f => f.enabled).length

  return (
    <div className='space-y-3'>
      {/* Cobertura: cuánto hay que cubrir, cuánto va y cuánto falta */}
      <div
        className={cn(
          'rounded-2xl border p-4 transition-colors',
          sumaCierra && !sobra
            ? 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-500/30 dark:bg-emerald-500/10'
            : sobra
              ? 'border-amber-200 bg-amber-50/60 dark:border-amber-500/30 dark:bg-amber-500/10'
              : 'border-cyan-200 bg-cyan-50/50 dark:border-cyan-500/30 dark:bg-cyan-500/10'
        )}
      >
        <div className='grid grid-cols-3 gap-2 text-center'>
          <Cifra etiqueta='Total a cubrir' valor={formatCurrency(valorTotal)} />
          <Cifra
            etiqueta={`Asignado · ${pct.toFixed(0)} %`}
            valor={formatCurrency(totalFuentes)}
          />
          <Cifra
            etiqueta={sobra ? 'Sobra' : 'Falta'}
            valor={
              diferencia !== 0 ? formatCurrency(Math.abs(diferencia)) : '$ 0'
            }
            tono={falta ? 'falta' : sobra ? 'sobra' : 'ok'}
          />
        </div>
        <div className='mt-3 h-2.5 overflow-hidden rounded-full bg-white/80 ring-1 ring-black/5 dark:bg-gray-800'>
          <motion.div
            className={
              sumaCierra ? s.fuentes.progressFull : s.fuentes.progressPartial
            }
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          />
        </div>
        <p
          className={cn(
            'mt-2 flex items-center gap-1.5 text-xs font-semibold',
            sumaCierra && !sobra
              ? 'text-emerald-700 dark:text-emerald-300'
              : sobra
                ? 'text-amber-700 dark:text-amber-300'
                : 'text-gray-700 dark:text-gray-200'
          )}
        >
          {sumaCierra && !sobra ? (
            <>
              <Check className='h-3.5 w-3.5' />
              Cubierto: ya puedes continuar.
            </>
          ) : sobra ? (
            <>
              <AlertTriangle className='h-3.5 w-3.5' />
              Hay un excedente de {formatCurrency(Math.abs(diferencia))}: se
              devolverá al cliente.
            </>
          ) : activas === 0 ? (
            <>
              <AlertCircle className='h-3.5 w-3.5' />
              Activa al menos una fuente de pago y escribe su monto.
            </>
          ) : (
            <>
              <AlertCircle className='h-3.5 w-3.5' />
              Falta cubrir {formatCurrency(diferencia)} para continuar.
            </>
          )}
        </p>
      </div>

      {/* Fuentes */}
      <div className='space-y-2'>
        {fuentes.map(fuente => {
          const tipoConCampos = tiposConCampos.find(
            t => t.nombre === fuente.tipo
          )
          const camposConfig = tipoConCampos?.configuracion_campos?.campos ?? []
          const generaCuotas =
            tipoConCampos?.logica_negocio?.genera_cuotas ?? false
          // Crédito constructora: capital (sin intereses), igual que la barra
          const monto = fuente.config
            ? obtenerMontoParaCierre(fuente.config, tipoConCampos, camposConfig)
            : 0
          const esError = mostrarErroresFuentes && erroresFuentes[fuente.tipo]
          const Icon = iconForFuente(fuente.tipo)

          return (
            <div
              key={fuente.tipo}
              className={cn(
                'rounded-2xl border transition-colors',
                fuente.enabled
                  ? 'border-cyan-200 bg-white shadow-sm dark:border-cyan-500/30 dark:bg-gray-900'
                  : 'border-gray-200 bg-gray-50/60 dark:border-gray-700 dark:bg-gray-900/40',
                esError && 'border-red-300 dark:border-red-500/50'
              )}
            >
              <button
                type='button'
                role='switch'
                aria-checked={fuente.enabled}
                onClick={() =>
                  handleFuenteEnabledChange(
                    fuente.tipo as TipoFuentePago,
                    !fuente.enabled
                  )
                }
                className='flex w-full items-center gap-3 px-3 py-3 text-left'
              >
                <span className={s.fuentes.fuenteIconWrapper(fuente.enabled)}>
                  <Icon className={s.fuentes.fuenteIcon(fuente.enabled)} />
                </span>
                <span className='min-w-0 flex-1'>
                  <span
                    className={
                      fuente.enabled
                        ? s.fuentes.fuenteNombreOn
                        : s.fuentes.fuenteNombreOff
                    }
                  >
                    {fuente.tipo}
                  </span>
                  {!fuente.enabled ? (
                    <span className='block text-xs text-gray-500 dark:text-gray-400'>
                      Toca para usarla
                    </span>
                  ) : null}
                </span>
                {fuente.enabled && monto > 0 ? (
                  <span className={s.fuentes.fuenteMontoOn}>
                    {formatCurrency(monto)}
                  </span>
                ) : null}
                <span className={s.switch.track(fuente.enabled)}>
                  <span className={s.switch.thumb(fuente.enabled)} />
                </span>
              </button>

              {/* Mínimo requerido (traslado) */}
              {minAmounts?.[fuente.tipo] ? (
                <div className='mx-3 mb-2 flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 dark:border-amber-800 dark:bg-amber-950/30'>
                  <AlertTriangle className='h-3.5 w-3.5 shrink-0 text-amber-500' />
                  <p className='text-xs text-amber-800 dark:text-amber-200'>
                    Mínimo requerido:{' '}
                    <strong>{formatCurrency(minAmounts[fuente.tipo])}</strong>{' '}
                    (ya abonado en la negociación actual)
                  </p>
                </div>
              ) : null}

              <AnimatePresence>
                {fuente.enabled ? (
                  <motion.div
                    key={`content-${fuente.tipo}`}
                    initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                    animate={{
                      height: 'auto',
                      opacity: 1,
                      transitionEnd: { overflow: 'visible' },
                    }}
                    exit={{ overflow: 'hidden', height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className='border-t border-gray-100 px-3 pb-3 pt-3 dark:border-gray-800'
                  >
                    <FuenteExpandida
                      fuente={fuente}
                      camposConfig={camposConfig}
                      permiteMultiples={
                        tipoConCampos?.permite_multiples_abonos ?? false
                      }
                      generaCuotas={generaCuotas}
                      esError={!!esError}
                      mensajeError={erroresFuentes[fuente.tipo] ?? ''}
                      onChange={config => {
                        handleFuenteConfigChange(
                          fuente.tipo as TipoFuentePago,
                          config
                        )
                      }}
                    />
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Cifra({
  etiqueta,
  valor,
  tono,
}: {
  etiqueta: string
  valor: string
  tono?: 'falta' | 'sobra' | 'ok'
}) {
  return (
    <div className='min-w-0 rounded-xl bg-white/80 px-2 py-2 dark:bg-gray-900/60'>
      <p className='truncate text-[11px] font-medium text-gray-600 dark:text-gray-300'>
        {etiqueta}
      </p>
      <p
        className={cn(
          'truncate text-sm font-bold tabular-nums sm:text-base',
          tono === 'falta'
            ? 'text-rose-600 dark:text-rose-400'
            : tono === 'sobra'
              ? 'text-amber-600 dark:text-amber-400'
              : tono === 'ok'
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-gray-900 dark:text-white'
        )}
      >
        {valor}
      </p>
    </div>
  )
}

// ─── Subcomponente: Fuente Expandida ──────────────────────

interface FuenteExpandidaProps {
  fuente: FuentePagoConfiguracion
  camposConfig: CampoConfig[]
  permiteMultiples: boolean
  generaCuotas: boolean
  esError: boolean
  mensajeError: string
  onChange: (config: FuentePagoConfig) => void
}

function FuenteExpandida({
  fuente,
  camposConfig,
  permiteMultiples,
  generaCuotas,
  esError,
  mensajeError,
  onChange,
}: FuenteExpandidaProps) {
  const sorted = [...camposConfig].sort((a, b) => a.orden - b.orden)

  // Acumula los tres updates que emite CreditoConstructoraForm antes de llamar onChange
  const creditoRef = useRef<{
    monto_aprobado?: number
    capital_para_cierre?: number
    parametrosCredito?: ParametrosCredito
  }>({
    monto_aprobado: fuente.config?.monto_aprobado,
    capital_para_cierre: fuente.config?.capital_para_cierre,
    parametrosCredito: fuente.config?.parametrosCredito,
  })

  const handleCreditoActualizar = useCallback(
    (
      campo: 'monto_aprobado' | 'capital_para_cierre' | 'parametrosCredito',
      valor: unknown
    ) => {
      creditoRef.current = { ...creditoRef.current, [campo]: valor }
      const acc = creditoRef.current
      if (acc.monto_aprobado != null && acc.monto_aprobado > 0) {
        onChange({
          tipo: fuente.tipo as TipoFuentePago,
          monto_aprobado: acc.monto_aprobado,
          capital_para_cierre: acc.capital_para_cierre,
          parametrosCredito: acc.parametrosCredito,
          permite_multiples_abonos: permiteMultiples,
          campos: {},
        })
      }
    },
    [onChange, fuente.tipo, permiteMultiples]
  )

  const [valores, setValores] = useState<ValoresCampos>(() => {
    const initial: ValoresCampos = {}
    sorted.forEach(campo => {
      if (fuente.config?.campos?.[campo.nombre] !== undefined) {
        initial[campo.nombre] = fuente.config.campos[campo.nombre]
      } else if (campo.nombre === 'monto_aprobado') {
        initial[campo.nombre] = fuente.config?.monto_aprobado ?? 0
      } else if (campo.nombre === 'entidad') {
        initial[campo.nombre] = fuente.config?.entidad ?? ''
      } else if (campo.nombre === 'numero_referencia') {
        initial[campo.nombre] = fuente.config?.numero_referencia ?? ''
      } else if (campo.tipo === 'number' || campo.tipo === 'currency') {
        initial[campo.nombre] = 0
      } else if (campo.tipo === 'checkbox') {
        initial[campo.nombre] = false
      } else {
        initial[campo.nombre] = ''
      }
    })
    return initial
  })

  const buildConfig = (newValores: ValoresCampos): FuentePagoConfig => {
    const montoCampo = sorted.find(c => c.rol === 'monto')
    const entidadCampo = sorted.find(c => c.rol === 'entidad')
    const refCampo = sorted.find(c => c.rol === 'referencia')
    return {
      tipo: fuente.tipo as TipoFuentePago,
      monto_aprobado: montoCampo
        ? ((newValores[montoCampo.nombre] as number) ?? 0)
        : 0,
      entidad: entidadCampo
        ? ((newValores[entidadCampo.nombre] as string) ?? '')
        : '',
      numero_referencia: refCampo
        ? ((newValores[refCampo.nombre] as string) ?? '')
        : '',
      permite_multiples_abonos: permiteMultiples,
      campos: { ...newValores },
    }
  }

  const handleCampoChange = (nombre: string, valor: ValorCampo) => {
    const newValores = { ...valores, [nombre]: valor }
    setValores(newValores)
    onChange(buildConfig(newValores))
  }

  // Crédito con la constructora: muestra el formulario de amortización
  if (generaCuotas) {
    return (
      <div className={s.fuentes.fuenteContent}>
        {/* Error inline para crédito constructora */}
        {esError && mensajeError ? (
          <div className='mb-3 flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2.5 dark:border-red-800 dark:bg-red-950/40'>
            <XCircle className='mt-0.5 h-4 w-4 shrink-0 text-red-500' />
            <p className='text-xs font-semibold text-red-700 dark:text-red-300'>
              {mensajeError}
            </p>
          </div>
        ) : null}
        <CreditoConstructoraForm
          parametrosIniciales={fuente.config?.parametrosCredito}
          onActualizar={handleCreditoActualizar}
        />
      </div>
    )
  }

  return (
    <div className={s.fuentes.fuenteContent}>
      {/* Error inline para fuentes con monto mínimo */}
      {esError && mensajeError ? (
        <div className='mb-3 flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2.5 dark:border-red-800 dark:bg-red-950/40'>
          <XCircle className='mt-0.5 h-4 w-4 shrink-0 text-red-500' />
          <p className='text-xs font-semibold text-red-700 dark:text-red-300'>
            {mensajeError}
          </p>
        </div>
      ) : null}
      {sorted.map(campo => (
        <CampoFormularioDinamico
          key={campo.nombre}
          config={campo}
          value={valores[campo.nombre] ?? null}
          onChange={valor => handleCampoChange(campo.nombre, valor)}
          error={
            esError && (campo.rol === 'referencia' || campo.rol === 'entidad')
              ? mensajeError
              : undefined
          }
        />
      ))}
    </div>
  )
}
