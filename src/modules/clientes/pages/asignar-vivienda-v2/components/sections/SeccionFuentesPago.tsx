'use client'

import { useCallback, useRef, useState } from 'react'

import { motion } from 'framer-motion'
import {
  AlertCircle,
  AlertTriangle,
  Check,
  Plus,
  X,
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
import { iconoFuente } from '@/shared/constants/fuente-iconos'
import { getFuenteColorClasses } from '@/shared/constants/fuentes-pago.constants'
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

  const sobra = diferencia < 0
  const tipoDe = (nombre: string) =>
    tiposConCampos.find(t => t.nombre === nombre)
  // Crédito constructora: cuenta el capital (sin intereses), igual que la barra
  const montoDe = (fuente: FuentePagoConfiguracion) => {
    const tipo = tipoDe(fuente.tipo)
    return fuente.config
      ? obtenerMontoParaCierre(
          fuente.config,
          tipo,
          tipo?.configuracion_campos?.campos ?? []
        )
      : 0
  }
  const enUso = fuentes.filter(f => f.enabled)
  const disponibles = fuentes.filter(f => !f.enabled)
  const pctDe = (monto: number) =>
    valorTotal > 0 ? (monto / valorTotal) * 100 : 0

  return (
    <div className='space-y-4'>
      {/* Cobertura: total, cubierto y lo que falta, con un tramo por fuente */}
      <div
        className={cn(
          'rounded-2xl border p-4 transition-colors',
          sumaCierra && !sobra
            ? 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-500/30 dark:bg-emerald-500/10'
            : sobra
              ? 'border-amber-200 bg-amber-50/60 dark:border-amber-500/30 dark:bg-amber-500/10'
              : 'border-gray-200 bg-gray-50/70 dark:border-gray-700 dark:bg-gray-800/40'
        )}
      >
        <div className='grid grid-cols-3 gap-2 text-center'>
          <Cifra etiqueta='Total a cubrir' valor={formatCurrency(valorTotal)} />
          <Cifra
            etiqueta={`Cubierto · ${pct.toFixed(0)} %`}
            valor={formatCurrency(totalFuentes)}
          />
          <Cifra
            etiqueta={sobra ? 'Sobra' : 'Falta'}
            valor={formatCurrency(Math.abs(diferencia))}
            tono={sumaCierra && !sobra ? 'ok' : sobra ? 'sobra' : 'falta'}
          />
        </div>

        <div className='mt-3 flex h-2.5 overflow-hidden rounded-full bg-white ring-1 ring-black/5 dark:bg-gray-900'>
          {enUso.map(f => {
            const ancho = Math.min(pctDe(montoDe(f)), 100)
            return ancho > 0 ? (
              <motion.span
                key={f.tipo}
                title={`${f.tipo}: ${formatCurrency(montoDe(f))}`}
                className={cn(
                  'h-full first:rounded-l-full last:rounded-r-full',
                  getFuenteColorClasses(tipoDe(f.tipo)?.color).barra
                )}
                animate={{ width: `${ancho}%` }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              />
            ) : null
          })}
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
              Sobran {formatCurrency(Math.abs(diferencia))}: se devolverán al
              cliente.
            </>
          ) : enUso.length === 0 ? (
            <>
              <AlertCircle className='h-3.5 w-3.5' />
              Agrega abajo al menos una fuente de pago.
            </>
          ) : (
            <>
              <AlertCircle className='h-3.5 w-3.5' />
              Faltan {formatCurrency(diferencia)} para cubrir el total.
            </>
          )}
        </p>
      </div>

      {/* Fuentes en uso */}
      {enUso.length > 0 ? (
        <div className='space-y-3'>
          {enUso.map(fuente => {
            const tipo = tipoDe(fuente.tipo)
            const color = getFuenteColorClasses(tipo?.color)
            const Icono = iconoFuente(tipo?.icono)
            const monto = montoDe(fuente)
            const esError = mostrarErroresFuentes && erroresFuentes[fuente.tipo]

            return (
              <motion.div
                key={fuente.tipo}
                layout
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'relative overflow-hidden rounded-2xl border bg-white shadow-sm dark:bg-gray-900',
                  esError
                    ? 'border-red-300 dark:border-red-500/50'
                    : 'border-gray-200 dark:border-gray-700'
                )}
              >
                <span
                  aria-hidden
                  className={cn('absolute inset-y-0 left-0 w-1', color.barra)}
                />
                <div className='flex items-center gap-3 py-3 pl-4 pr-3'>
                  <span
                    className={cn(
                      'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-white shadow-sm',
                      color.icon
                    )}
                  >
                    <Icono className='h-5 w-5' />
                  </span>
                  <div className='min-w-0 flex-1'>
                    <p className='truncate font-semibold text-gray-900 dark:text-white'>
                      {fuente.tipo}
                    </p>
                    <p className='flex flex-wrap items-center gap-x-2 text-sm'>
                      <span
                        className={cn('font-bold tabular-nums', color.texto)}
                      >
                        {monto > 0 ? formatCurrency(monto) : 'Sin monto'}
                      </span>
                      {monto > 0 ? (
                        <span
                          className={cn(
                            'rounded-full px-1.5 py-0.5 text-[11px] font-semibold',
                            color.badge
                          )}
                        >
                          {pctDe(monto).toFixed(1)} % del total
                        </span>
                      ) : null}
                    </p>
                  </div>
                  <button
                    type='button'
                    onClick={() =>
                      handleFuenteEnabledChange(
                        fuente.tipo as TipoFuentePago,
                        false
                      )
                    }
                    aria-label={`Quitar ${fuente.tipo}`}
                    title='Quitar esta fuente'
                    className='flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400'
                  >
                    <X className='h-4 w-4' />
                  </button>
                </div>

                {/* Mínimo requerido (traslado) */}
                {minAmounts?.[fuente.tipo] ? (
                  <div className='mx-4 mb-2 flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 dark:border-amber-800 dark:bg-amber-950/30'>
                    <AlertTriangle className='h-3.5 w-3.5 shrink-0 text-amber-500' />
                    <p className='text-xs text-amber-800 dark:text-amber-200'>
                      Mínimo requerido:{' '}
                      <strong>{formatCurrency(minAmounts[fuente.tipo])}</strong>{' '}
                      (ya abonado en la negociación actual)
                    </p>
                  </div>
                ) : null}

                <div className='border-t border-gray-100 px-4 pb-4 pt-3 dark:border-gray-800'>
                  <FuenteExpandida
                    fuente={fuente}
                    camposConfig={tipo?.configuracion_campos?.campos ?? []}
                    permiteMultiples={tipo?.permite_multiples_abonos ?? false}
                    generaCuotas={tipo?.logica_negocio?.genera_cuotas ?? false}
                    esError={!!esError}
                    mensajeError={erroresFuentes[fuente.tipo] ?? ''}
                    onChange={config =>
                      handleFuenteConfigChange(
                        fuente.tipo as TipoFuentePago,
                        config
                      )
                    }
                  />
                </div>
              </motion.div>
            )
          })}
        </div>
      ) : null}

      {/* Fuentes disponibles: un toque la agrega */}
      {disponibles.length > 0 ? (
        <div>
          <p className='mb-2 text-sm font-semibold text-gray-800 dark:text-gray-100'>
            {enUso.length > 0
              ? 'Agregar otra fuente'
              : 'Agrega una fuente de pago'}
          </p>
          <div className='flex flex-wrap gap-2'>
            {disponibles.map(fuente => {
              const tipo = tipoDe(fuente.tipo)
              const color = getFuenteColorClasses(tipo?.color)
              const Icono = iconoFuente(tipo?.icono)
              return (
                <button
                  key={fuente.tipo}
                  type='button'
                  onClick={() =>
                    handleFuenteEnabledChange(
                      fuente.tipo as TipoFuentePago,
                      true
                    )
                  }
                  className='inline-flex items-center gap-2 rounded-xl border border-dashed border-gray-300 bg-white py-1.5 pl-1.5 pr-3 text-sm font-medium text-gray-700 transition-all hover:-translate-y-0.5 hover:border-gray-400 hover:shadow-sm dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-gray-500'
                >
                  <span
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-lg text-white',
                      color.icon
                    )}
                  >
                    <Icono className='h-3.5 w-3.5' />
                  </span>
                  <Plus className='h-3.5 w-3.5 text-gray-400' />
                  {fuente.tipo}
                </button>
              )
            })}
          </div>
        </div>
      ) : null}
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
      <div className={cn('grid gap-3', sorted.length > 1 && 'sm:grid-cols-2')}>
        {sorted.map(campo => (
          <div
            key={campo.nombre}
            className={cn(
              campo.tipo === 'textarea' || campo.tipo === 'checkbox'
                ? 'sm:col-span-2'
                : undefined
            )}
          >
            <CampoFormularioDinamico
              config={campo}
              value={valores[campo.nombre] ?? null}
              onChange={valor => handleCampoChange(campo.nombre, valor)}
              error={
                esError &&
                (campo.rol === 'referencia' || campo.rol === 'entidad')
                  ? mensajeError
                  : undefined
              }
            />
          </div>
        ))}
      </div>
    </div>
  )
}
