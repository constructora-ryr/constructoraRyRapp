'use client'

import { useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  Building2,
  Calculator,
  Calendar,
  ChevronDown,
  DollarSign,
  FileText,
  Tag,
  User,
} from 'lucide-react'
import type {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form'

import { getTodayDateString } from '@/lib/utils/date.utils'
import { formatCurrency } from '@/lib/utils/format.utils'
import { ViviendaCombobox } from '@/modules/clientes/components/asignar-vivienda/components'
import type { AsignarViviendaFormData } from '@/modules/clientes/components/asignar-vivienda/schemas'
import type { ViviendaDetalle } from '@/modules/clientes/components/asignar-vivienda/types'
import {
  LABELS_TIPO_DESCUENTO,
  TIPOS_DESCUENTO,
} from '@/modules/clientes/constants/descuento.constants'

import { styles as s } from '../../styles'

interface SeccionViviendaValoresProps {
  clienteNombre: string
  register: UseFormRegister<AsignarViviendaFormData>
  errors: FieldErrors<AsignarViviendaFormData>
  setValue: UseFormSetValue<AsignarViviendaFormData>
  watch: UseFormWatch<AsignarViviendaFormData>
  // Datos
  proyectos: Array<{ id: string; nombre: string }>
  viviendas: ViviendaDetalle[]
  proyectoSeleccionado: string
  viviendaId: string
  viviendaSeleccionada: ViviendaDetalle | null
  cargandoProyectos: boolean
  cargandoViviendas: boolean
  setProyectoSeleccionado: (id: string) => void
  setViviendaId: (id: string) => void
  // Valores calculados
  valorBase: number
  gastosNotariales: number
  recargoEsquinera: number
  descuentoAplicado: number
  valorTotal: number
  onClearErrorApi?: () => void
}

export function SeccionViviendaValores({
  clienteNombre,
  register,
  errors,
  setValue,
  watch,
  proyectos,
  viviendas,
  proyectoSeleccionado,
  viviendaId,
  viviendaSeleccionada,
  cargandoProyectos,
  cargandoViviendas,
  setProyectoSeleccionado,
  setViviendaId,
  valorBase,
  gastosNotariales,
  recargoEsquinera,
  descuentoAplicado: _descuentoAplicado,
  valorTotal,
  onClearErrorApi,
}: SeccionViviendaValoresProps) {
  const aplicarDescuento = watch('aplicar_descuento') as boolean
  const descuentoActual = (watch('descuento_aplicado') as number) ?? 0
  const motivoDescuento = (watch('motivo_descuento') as string) ?? ''
  const valorEscrituraPublica =
    (watch('valor_escritura_publica') as number) ?? 128000000
  const valorBaseTotal = valorBase + gastosNotariales + recargoEsquinera
  const pctDescuento =
    valorBaseTotal > 0
      ? ((descuentoActual / valorBaseTotal) * 100).toFixed(1)
      : '0'

  // Display value for number inputs (formatted)
  const [descuentoDisplay, setDescuentoDisplay] = useState(
    descuentoActual > 0 ? descuentoActual.toLocaleString('es-CO') : ''
  )
  const [escrituraDisplay, setEscrituraDisplay] = useState(
    valorEscrituraPublica > 0
      ? valorEscrituraPublica.toLocaleString('es-CO')
      : ''
  )

  const handleDescuentoChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '')
    const num = parseInt(digits || '0', 10)
    setDescuentoDisplay(digits ? num.toLocaleString('es-CO') : '')
    setValue('descuento_aplicado', num)
    onClearErrorApi?.()
  }

  const handleEscrituraChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '')
    const num = parseInt(digits || '0', 10)
    setEscrituraDisplay(digits ? num.toLocaleString('es-CO') : '')
    setValue('valor_escritura_publica', num)
  }

  return (
    <div className='space-y-4'>
      {/* Cliente (readonly) */}
      <div className={s.clientChip.wrapper}>
        <div className={s.clientChip.iconWrapper}>
          <User className={s.clientChip.icon} />
        </div>
        <div>
          <span className={s.clientChip.label}>Cliente</span>
          <span className={s.clientChip.value}>{clienteNombre}</span>
        </div>
      </div>

      {/* Fila: Proyecto + Vivienda */}
      <div className={s.field.grid2}>
        {/* Proyecto */}
        <div>
          <label className={s.field.label}>Proyecto</label>
          <div className={s.field.selectWrapper}>
            <select
              className={s.field.select}
              value={proyectoSeleccionado}
              onChange={e => {
                setProyectoSeleccionado(e.target.value)
                setValue('proyecto_id', e.target.value)
                setViviendaId('')
                setValue('vivienda_id', '')
                onClearErrorApi?.()
              }}
              disabled={cargandoProyectos || proyectos.length === 0}
            >
              <option value=''>
                {!cargandoProyectos && proyectos.length === 0
                  ? 'Sin proyectos disponibles'
                  : 'Seleccionar proyecto'}
              </option>
              {proyectos.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
            <ChevronDown className={s.field.selectArrow} />
          </div>
          {errors.proyecto_id && (
            <p className={s.field.error}>
              <AlertCircle className='h-3 w-3' />
              {String(errors.proyecto_id.message)}
            </p>
          )}
        </div>

        {/* Vivienda */}
        <div>
          <label className={s.field.label}>Vivienda</label>
          <ViviendaCombobox
            viviendas={viviendas}
            value={viviendaId}
            onChange={id => {
              setViviendaId(id)
              setValue('vivienda_id', id)
              if (!id) {
                setValue('aplicar_descuento', false)
                setValue('descuento_aplicado', 0)
                setValue('tipo_descuento', '')
                setValue('motivo_descuento', '')
                setDescuentoDisplay('')
              }
              onClearErrorApi?.()
            }}
            disabled={!proyectoSeleccionado || cargandoViviendas}
            placeholder='Busca: A3, B12...'
            error={!!errors.vivienda_id}
          />
          {errors.vivienda_id && (
            <p className={s.field.error}>
              <AlertCircle className='h-3 w-3' />
              {String(errors.vivienda_id.message)}
            </p>
          )}
        </div>
      </div>

      {/* Aviso: sin proyectos con viviendas disponibles */}
      {!cargandoProyectos && proyectos.length === 0 ? (
        <div className='flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800/50 dark:bg-amber-950/30'>
          <Building2 className='mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400' />
          <div>
            <p className='text-sm font-semibold text-amber-800 dark:text-amber-300'>
              Sin viviendas disponibles
            </p>
            <p className='mt-0.5 text-xs text-amber-700 dark:text-amber-400'>
              Ningún proyecto tiene viviendas en estado{' '}
              <strong>Disponible</strong> en este momento. Revisa el inventario
              de viviendas antes de continuar.
            </p>
          </div>
        </div>
      ) : null}

      {/* Chips de valores — aparecen al seleccionar vivienda */}
      <AnimatePresence>
        {viviendaSeleccionada && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {/* Chips: 2 columnas si no aplica esquinera, 3 si aplica */}
            <div
              className={`grid gap-2 ${
                recargoEsquinera > 0 ? 'grid-cols-3' : 'grid-cols-2'
              }`}
            >
              <div className={s.valueChip.wrapper}>
                <div className='flex items-center gap-1'>
                  <DollarSign className={s.valueChip.icon} />
                  <span className={s.valueChip.label}>Valor Vivienda Base</span>
                </div>
                <span className={s.valueChip.value}>
                  {formatCurrency(valorBase)}
                </span>
              </div>
              <div className={s.valueChip.wrapper}>
                <div className='flex items-center gap-1'>
                  <FileText className={s.valueChip.icon} />
                  <span className={s.valueChip.label}>Gastos Notariales</span>
                </div>
                <span className={s.valueChip.value}>
                  {formatCurrency(gastosNotariales)}
                </span>
              </div>
              {recargoEsquinera > 0 && (
                <div className={s.valueChip.wrapper}>
                  <div className='flex items-center gap-1'>
                    <Tag className={s.valueChip.icon} />
                    <span className={s.valueChip.label}>Recargo Esquinera</span>
                  </div>
                  <span className={s.valueChip.value}>
                    {formatCurrency(recargoEsquinera)}
                  </span>
                </div>
              )}
            </div>

            {/* Total a cubrir */}
            <div className={s.totalRow.wrapper}>
              <span className={s.totalRow.label}>
                <Calculator className={s.totalRow.labelIcon} />
                Total a cubrir
              </span>
              <span className={s.totalRow.value}>
                {formatCurrency(valorTotal)}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Campos opcionales — se desbloquean al seleccionar una vivienda */}
      <motion.div
        animate={{ opacity: viviendaSeleccionada ? 1 : 0.35 }}
        transition={{ duration: 0.2 }}
        style={{ pointerEvents: viviendaSeleccionada ? 'auto' : 'none' }}
        className='space-y-4'
      >
        {/* Toggle descuento */}
        <div className={s.discountToggle.wrapper}>
          <div className={s.discountToggle.left}>
            <div className={s.discountToggle.iconWrapper}>
              <Tag className={s.discountToggle.icon} />
            </div>
            <div>
              <p className={s.discountToggle.title}>Aplicar descuento</p>
              <p className={s.discountToggle.subtitle}>
                Reduce el total a cubrir
              </p>
            </div>
          </div>
          <button
            type='button'
            role='switch'
            aria-checked={aplicarDescuento}
            onClick={() => {
              setValue('aplicar_descuento', !aplicarDescuento)
              if (aplicarDescuento) {
                setValue('descuento_aplicado', 0)
                setValue('tipo_descuento', '')
                setValue('motivo_descuento', '')
                setDescuentoDisplay('')
              }
            }}
          >
            <div className={s.switch.track(aplicarDescuento)}>
              <div className={s.switch.thumb(aplicarDescuento)} />
            </div>
          </button>
        </div>

        {/* Sub-sección descuento */}
        <AnimatePresence>
          {aplicarDescuento && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              style={{ overflow: 'hidden' }}
            >
              <div className='space-y-3 pt-1'>
                <div className={s.field.grid2}>
                  {/* Monto descuento */}
                  <div>
                    <label className={s.field.label}>Monto descuento</label>
                    <div className='relative'>
                      <span className={s.field.prefix}>$</span>
                      <input
                        type='text'
                        inputMode='numeric'
                        className={`${s.field.inputMono} ${s.field.inputWithPrefix}`}
                        placeholder='0'
                        value={descuentoDisplay}
                        onChange={e => handleDescuentoChange(e.target.value)}
                      />
                    </div>
                    {errors.descuento_aplicado && (
                      <p className={s.field.error}>
                        <AlertCircle className='h-3 w-3' />
                        {String(errors.descuento_aplicado.message)}
                      </p>
                    )}
                  </div>

                  {/* Tipo descuento */}
                  <div>
                    <label className={s.field.label}>Tipo de descuento</label>
                    <div className={s.field.selectWrapper}>
                      <select
                        className={s.field.select}
                        {...register('tipo_descuento')}
                        onChange={e => {
                          setValue('tipo_descuento', e.target.value)
                          onClearErrorApi?.()
                        }}
                      >
                        <option value=''>Seleccionar tipo</option>
                        {TIPOS_DESCUENTO.map(t => (
                          <option key={t} value={t}>
                            {LABELS_TIPO_DESCUENTO[t]}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className={s.field.selectArrow} />
                    </div>
                    {errors.tipo_descuento && (
                      <p className={s.field.error}>
                        <AlertCircle className='h-3 w-3' />
                        {String(errors.tipo_descuento.message)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Motivo */}
                <div>
                  <label className={s.field.label}>Motivo del descuento</label>
                  <textarea
                    rows={2}
                    className={s.field.textarea}
                    placeholder='Describe el motivo (mín. 10 caracteres)...'
                    maxLength={500}
                    {...register('motivo_descuento')}
                    onChange={e => {
                      setValue('motivo_descuento', e.target.value)
                      onClearErrorApi?.()
                    }}
                  />
                  <div className='flex items-center justify-between'>
                    {errors.motivo_descuento ? (
                      <p className={s.field.error}>
                        <AlertCircle className='h-3 w-3' />
                        {String(errors.motivo_descuento.message)}
                      </p>
                    ) : (
                      <span />
                    )}
                    <span className={s.charCounter}>
                      {motivoDescuento?.length ?? 0}/500 (mín 10)
                    </span>
                  </div>
                </div>

                {/* Línea de resumen */}
                {descuentoActual > 0 && (
                  <div className={s.discount.summaryRow}>
                    <span className={s.discount.original}>
                      {formatCurrency(valorBaseTotal)}
                    </span>
                    <span className={s.discount.arrow}>→</span>
                    <span className={s.discount.final}>
                      {formatCurrency(valorTotal)}
                    </span>
                    <span className={s.discount.pct}>(-{pctDescuento}%)</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Valor en Escritura Pública */}
        <div className={s.field.divider}>
          <div className='pt-1'>
            <label className={s.field.label}>
              Valor en Escritura Pública
              <span className={s.datoBadge}>Dato legal</span>
            </label>
            <p className={s.field.hint}>
              Solo para efectos legales y bancarios. No afecta el plan
              financiero.
            </p>
            <div className='relative mt-1'>
              <span className={s.field.prefix}>$</span>
              <input
                type='text'
                inputMode='numeric'
                className={`${s.field.inputMono} ${s.field.inputWithPrefix}`}
                value={escrituraDisplay}
                onChange={e => handleEscrituraChange(e.target.value)}
              />
            </div>
            {valorEscrituraPublica > 0 && valorTotal > 0 && (
              <p className={s.field.hint}>
                Diferencia con valor real:{' '}
                {formatCurrency(Math.abs(valorTotal - valorEscrituraPublica))}
              </p>
            )}
          </div>
        </div>

        {/* Notas */}
        <div>
          <label className={s.field.label}>Notas adicionales (opcional)</label>
          <textarea
            rows={2}
            className={s.field.textarea}
            placeholder='Observaciones o acuerdos adicionales...'
            {...register('notas')}
            onChange={e => setValue('notas', e.target.value)}
          />
        </div>

        {/* Fecha de negociación (migración de datos históricos) */}
        <div className={s.field.divider}>
          <div className='pt-1'>
            <label className={s.field.label}>
              <span className='flex items-center gap-1.5'>
                <Calendar className='h-3.5 w-3.5' />
                Fecha de negociación (opcional)
                <span
                  className={`inline-flex items-center rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-700 dark:bg-amber-900/30 dark:text-amber-400`}
                >
                  Migración
                </span>
              </span>
            </label>
            <p className={s.field.hint}>
              Solo usar al migrar datos históricos. Si se deja vacío, se usará
              la fecha de hoy automáticamente.
            </p>
            <input
              type='date'
              className={`${s.field.input} mt-1`}
              max={getTodayDateString()}
              {...register('fecha_negociacion')}
              onChange={e => {
                setValue('fecha_negociacion', e.target.value)
                onClearErrorApi?.()
              }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  )
}
