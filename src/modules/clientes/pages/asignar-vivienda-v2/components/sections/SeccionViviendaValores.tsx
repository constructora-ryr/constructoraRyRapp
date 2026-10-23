'use client'

/**
 * Paso 1 de Asignar vivienda: proyecto y casa; al elegirla, su desglose y el
 * total, el descuento opcional, el valor en escritura, la fecha de la
 * negociación (firma de la promesa de compraventa, si ya existe) y las notas.
 */

import { useEffect } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  Building2,
  CalendarCheck,
  FileSignature,
  HousePlus,
  RotateCcw,
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
import { FormSelect } from '@/shared/components/ui/form-select'

import { styles as s } from '../../styles'

import { BloqueDescuento } from './vivienda/BloqueDescuento'
import { TarjetaVivienda } from './vivienda/TarjetaVivienda'

interface SeccionViviendaValoresProps {
  register: UseFormRegister<AsignarViviendaFormData>
  errors: FieldErrors<AsignarViviendaFormData>
  setValue: UseFormSetValue<AsignarViviendaFormData>
  watch: UseFormWatch<AsignarViviendaFormData>
  proyectos: Array<{ id: string; nombre: string }>
  viviendas: ViviendaDetalle[]
  proyectoSeleccionado: string
  viviendaId: string
  viviendaSeleccionada: ViviendaDetalle | null
  cargandoProyectos: boolean
  cargandoViviendas: boolean
  setProyectoSeleccionado: (id: string) => void
  setViviendaId: (id: string) => void
  valorBase: number
  gastosNotariales: number
  recargoEsquinera: number
  descuentoAplicado: number
  valorTotal: number
  onClearErrorApi?: () => void
}

const pesos = (v: string) => parseInt(v.replace(/\D/g, '') || '0', 10)

export function SeccionViviendaValores({
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
  descuentoAplicado,
  valorTotal,
  onClearErrorApi,
}: SeccionViviendaValoresProps) {
  const totalSinDescuento = valorBase + gastosNotariales + recargoEsquinera
  const escritura = Number(watch('valor_escritura_publica')) || 0
  const proyecto =
    proyectos.find(p => p.id === proyectoSeleccionado)?.nombre ?? ''

  const elegirProyecto = (id: string) => {
    setProyectoSeleccionado(id)
    setValue('proyecto_id', id)
    setViviendaId('')
    setValue('vivienda_id', '')
    onClearErrorApi?.()
  }

  // Con un solo proyecto disponible no hay nada que elegir
  useEffect(() => {
    if (!proyectoSeleccionado && proyectos.length === 1)
      elegirProyecto(proyectos[0].id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proyectos, proyectoSeleccionado])

  return (
    <div className='space-y-4'>
      <div className={s.field.grid2}>
        <div>
          <label className={s.field.label}>Proyecto</label>
          <FormSelect
            className={s.field.select}
            value={proyectoSeleccionado}
            onChange={e => elegirProyecto(e.target.value)}
            disabled={cargandoProyectos || proyectos.length === 0}
          >
            <option value=''>
              {cargandoProyectos
                ? 'Cargando proyectos…'
                : proyectos.length === 0
                  ? 'Sin proyectos con casas disponibles'
                  : 'Elige el proyecto'}
            </option>
            {proyectos.map(p => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </FormSelect>
          {errors.proyecto_id ? (
            <p className={s.field.error}>
              <AlertCircle className='h-3 w-3' />
              {String(errors.proyecto_id.message)}
            </p>
          ) : null}
        </div>

        <div>
          <label className={s.field.label}>
            Casa{' '}
            {proyectoSeleccionado && !cargandoViviendas ? (
              <span className='font-normal text-gray-500 dark:text-gray-400'>
                · {viviendas.length} disponibles
              </span>
            ) : null}
          </label>
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
              }
              onClearErrorApi?.()
            }}
            disabled={!proyectoSeleccionado || cargandoViviendas}
            placeholder='Busca por manzana y número: A3, B12…'
            error={!!errors.vivienda_id}
          />
          {errors.vivienda_id ? (
            <p className={s.field.error}>
              <AlertCircle className='h-3 w-3' />
              {String(errors.vivienda_id.message)}
            </p>
          ) : null}
        </div>
      </div>

      {!cargandoProyectos && proyectos.length === 0 ? (
        <div className='flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800/50 dark:bg-amber-950/30'>
          <Building2 className='mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400' />
          <p className='text-sm text-amber-800 dark:text-amber-200'>
            <strong>No hay casas disponibles.</strong> Ningún proyecto tiene
            viviendas en estado Disponible; revisa el inventario de viviendas.
          </p>
        </div>
      ) : null}

      {viviendaSeleccionada ? (
        <TarjetaVivienda
          vivienda={viviendaSeleccionada}
          proyecto={proyecto}
          valorBase={valorBase}
          gastosNotariales={gastosNotariales}
          recargoEsquinera={recargoEsquinera}
          descuento={descuentoAplicado}
          valorTotal={valorTotal}
        />
      ) : (
        <div className='flex flex-col items-center rounded-2xl border border-dashed border-gray-300 px-4 py-8 text-center dark:border-gray-700'>
          <span className='mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-300'>
            <HousePlus className='h-5 w-5' />
          </span>
          <p className='text-sm font-semibold text-gray-800 dark:text-gray-100'>
            Elige una casa para continuar
          </p>
          <p className='mt-0.5 max-w-sm text-xs text-gray-500 dark:text-gray-400'>
            Verás su valor, los gastos notariales y el total que debe cubrir el
            cliente.
          </p>
        </div>
      )}

      <AnimatePresence>
        {viviendaSeleccionada ? (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className='space-y-4'
          >
            <BloqueDescuento
              watch={watch}
              setValue={setValue}
              errors={errors}
              totalSinDescuento={totalSinDescuento}
              valorTotal={valorTotal}
              onCambio={onClearErrorApi}
            />

            <div>
              <label className={s.field.labelWithIcon}>
                <FileSignature className={s.field.labelIcon} />
                Valor en escritura pública
                <span className={s.datoBadge}>Dato legal</span>
              </label>
              <div className='relative'>
                <span className={s.field.prefix}>$</span>
                <input
                  type='text'
                  inputMode='numeric'
                  className={`${s.field.inputMono} ${s.field.inputWithPrefix}`}
                  value={escritura > 0 ? escritura.toLocaleString('es-CO') : ''}
                  onChange={e =>
                    setValue('valor_escritura_publica', pesos(e.target.value), {
                      shouldValidate: true,
                    })
                  }
                />
              </div>
              <div className='mt-1 flex flex-wrap items-center justify-between gap-2'>
                <p className={s.field.hint}>
                  El que figurará en la escritura (trámite notarial y banco). No
                  cambia lo que paga el cliente.
                </p>
                {escritura !== totalSinDescuento ? (
                  <button
                    type='button'
                    onClick={() =>
                      setValue('valor_escritura_publica', totalSinDescuento, {
                        shouldValidate: true,
                      })
                    }
                    className='inline-flex items-center gap-1 text-xs font-semibold text-cyan-700 hover:underline dark:text-cyan-300'
                  >
                    <RotateCcw className='h-3 w-3' />
                    Usar el total de la casa (
                    {formatCurrency(totalSinDescuento)})
                  </button>
                ) : null}
              </div>
              {errors.valor_escritura_publica ? (
                <p className={s.field.error}>
                  <AlertCircle className='h-3 w-3' />
                  {String(errors.valor_escritura_publica.message)}
                </p>
              ) : null}
            </div>

            <div>
              <label className={s.field.labelWithIcon}>
                <CalendarCheck className={s.field.labelIcon} />
                Fecha de la negociación{' '}
                <span className='font-normal text-gray-500 dark:text-gray-400'>
                  (opcional)
                </span>
              </label>
              <input
                type='date'
                className={s.field.input}
                max={getTodayDateString()}
                {...register('fecha_negociacion')}
              />
              <p className={s.field.hint}>
                Si el cliente ya firmó la promesa de compraventa, pon la fecha
                de la firma. Si aún no la firma, déjala vacía y se usará la
                fecha de hoy.
              </p>
            </div>

            <div>
              <label className={s.field.label}>
                Notas{' '}
                <span className='font-normal text-gray-500 dark:text-gray-400'>
                  (opcional)
                </span>
              </label>
              <textarea
                rows={2}
                className={s.field.textarea}
                placeholder='Acuerdos especiales con el cliente, condiciones de entrega…'
                {...register('notas')}
              />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
