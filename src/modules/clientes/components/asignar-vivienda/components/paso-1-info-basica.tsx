'use client'

import { motion } from 'framer-motion'
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  DollarSign,
  Home,
  MessageSquare,
  User,
} from 'lucide-react'

import { pageStyles as s } from '@/modules/clientes/pages/asignar-vivienda/styles'
import { FormSelect } from '@/shared/components/ui/form-select'

import type { ProyectoBasico, ViviendaDetalle } from '../types'

import { ViviendaCombobox } from './vivienda-combobox'

interface Paso1InfoBasicaProps {
  clienteNombre?: string
  proyectos: ProyectoBasico[]
  viviendas: ViviendaDetalle[]
  cargandoProyectos: boolean
  cargandoViviendas: boolean
  proyectoSeleccionado: string
  viviendaId: string
  valorNegociado: number
  descuentoAplicado: number
  valorTotal: number
  notas: string
  viviendaIdProp?: string
  validacionCampos?: {
    proyecto: { valido: boolean; mensaje: string }
    vivienda: { valido: boolean; mensaje: string }
    valorVivienda: { valido: boolean; mensaje: string }
    descuento: { valido: boolean; mensaje: string }
  }
  mostrarErrores?: boolean // ✅ Controla cuándo mostrar errores
  onProyectoChange: (proyectoId: string) => void
  onViviendaChange: (viviendaId: string) => void
  onValorNegociadoChange: (valor: number) => void
  onDescuentoChange: (descuento: number) => void
  onNotasChange: (notas: string) => void
}

export function Paso1InfoBasica({
  clienteNombre,
  proyectos,
  viviendas,
  cargandoProyectos,
  cargandoViviendas,
  proyectoSeleccionado,
  viviendaId,
  valorNegociado,
  descuentoAplicado,
  valorTotal: _valorTotal,
  notas,
  viviendaIdProp,
  validacionCampos: _validacionCampos,
  mostrarErrores = false, // ✅ Por defecto NO mostrar errores
  onProyectoChange,
  onViviendaChange,
  onDescuentoChange,
  onNotasChange,
}: Paso1InfoBasicaProps) {
  // Helper para clases de input con error
  const getInputClasses = (hasError: boolean) => {
    return `${s.input.base} ${
      hasError
        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
        : ''
    }`
  }

  // Calcular progreso de campos completados
  const camposCompletados = [
    !!proyectoSeleccionado,
    !!viviendaId,
    valorNegociado > 0,
    descuentoAplicado >= 0 && descuentoAplicado < valorNegociado,
  ].filter(Boolean).length

  const porcentajeProgreso = Math.round((camposCompletados / 4) * 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className='space-y-3'
    >
      {/* Barra de Progreso Compacta */}
      <div className='rounded-lg border border-blue-200/50 bg-gradient-to-br from-blue-50/90 to-indigo-50/90 p-3 shadow-lg backdrop-blur-xl dark:border-blue-700 dark:from-blue-950/70 dark:to-indigo-950/70'>
        <div className='mb-2 flex items-center justify-between'>
          <span className='flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-300'>
            <CheckCircle2 className='h-3.5 w-3.5' />
            Progreso: {camposCompletados}/4 campos obligatorios
          </span>
          <span className='text-xs font-bold text-blue-600 dark:text-blue-400'>
            {porcentajeProgreso}%
          </span>
        </div>
        <div className='h-1.5 overflow-hidden rounded-full bg-blue-200 dark:bg-blue-900/50'>
          <motion.div
            className='h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-lg'
            initial={{ width: 0 }}
            animate={{ width: `${porcentajeProgreso}%` }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          />
        </div>
      </div>

      <div className={s.alert.info}>
        <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/30'>
          <User className='h-5 w-5 text-white' />
        </div>
        <div>
          <p className='text-xs font-semibold text-cyan-700 dark:text-cyan-300'>
            Cliente Seleccionado
          </p>
          <p className='mt-0.5 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-sm font-bold text-transparent'>
            {clienteNombre || 'Cliente seleccionado'}
          </p>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
        <div className='space-y-1.5'>
          <label className={s.label.base}>
            <Building2 className='h-4 w-4 text-cyan-500 dark:text-cyan-400' />
            Proyecto
            <span className='ml-0.5 text-red-500'>*</span>
          </label>
          <FormSelect
            value={proyectoSeleccionado}
            onChange={e => onProyectoChange(e.target.value)}
            disabled={cargandoProyectos || !!viviendaIdProp}
            className={getInputClasses(
              mostrarErrores && proyectos.length > 0 && !proyectoSeleccionado
            )}
          >
            <option value=''>Selecciona un proyecto</option>
            {proyectos.map(p => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </FormSelect>
          {mostrarErrores && proyectos.length > 0 && !proyectoSeleccionado && (
            <p className='mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400'>
              <AlertCircle className='h-3 w-3' />
              Selecciona un proyecto
            </p>
          )}
        </div>

        <div className='space-y-1.5'>
          <label className={s.label.base}>
            <Home className='h-4 w-4 text-blue-500 dark:text-blue-400' />
            Vivienda
            <span className='ml-0.5 text-red-500'>*</span>
          </label>

          <ViviendaCombobox
            viviendas={viviendas}
            value={viviendaId}
            onChange={onViviendaChange}
            disabled={
              !proyectoSeleccionado || cargandoViviendas || !!viviendaIdProp
            }
            placeholder='Busca por manzana o número (ej: A3)'
            error={mostrarErrores && !!proyectoSeleccionado && !viviendaId}
          />

          {mostrarErrores &&
            proyectoSeleccionado &&
            !viviendaId &&
            !cargandoViviendas && (
              <p className='mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400'>
                <AlertCircle className='h-3 w-3' />
                Selecciona una vivienda
              </p>
            )}
        </div>
      </div>

      <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
        <div className='space-y-1.5'>
          <label className={s.label.base}>
            <DollarSign className='h-4 w-4 text-green-500 dark:text-green-400' />
            Valor de la Vivienda
            <span className='ml-auto text-xs font-normal text-gray-500 dark:text-gray-400'>
              (auto-llenado)
            </span>
          </label>
          <div className='relative'>
            <span className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-500'>
              $
            </span>
            <input
              type='text'
              readOnly
              value={
                valorNegociado ? valorNegociado.toLocaleString('es-CO') : '0'
              }
              placeholder='Selecciona una vivienda'
              className='w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-3 pl-8 text-sm font-semibold text-gray-600 backdrop-blur-xl dark:border-gray-700 dark:bg-gray-900/80 dark:text-gray-300'
            />
          </div>
          {valorNegociado > 0 && (
            <p className='flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400'>
              <CheckCircle2 className='h-3 w-3 text-green-500' />
              Valor cargado desde vivienda
            </p>
          )}
        </div>

        <div className='space-y-1.5'>
          <label className={s.label.base}>
            <DollarSign className='h-4 w-4 text-orange-500 dark:text-orange-400' />
            Descuento Aplicado
            <span className='ml-auto text-xs font-normal text-gray-500 dark:text-gray-400'>
              (opcional)
            </span>
          </label>
          <div className='relative'>
            <span className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-500'>
              $
            </span>
            <input
              type='text'
              value={
                descuentoAplicado
                  ? descuentoAplicado.toLocaleString('es-CO')
                  : ''
              }
              onChange={e => {
                const valor = e.target.value
                  .replace(/\./g, '')
                  .replace(/,/g, '')
                const numero = Number(valor)
                if (!isNaN(numero)) {
                  onDescuentoChange(numero)
                }
              }}
              placeholder='0'
              className={`${getInputClasses(
                mostrarErrores && descuentoAplicado >= valorNegociado
              )} pl-8`}
            />
          </div>
          {mostrarErrores && descuentoAplicado >= valorNegociado && (
            <p className='mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400'>
              <AlertCircle className='h-3 w-3' />
              El descuento no puede ser mayor o igual al valor de la vivienda
            </p>
          )}
          {descuentoAplicado > 0 && descuentoAplicado < valorNegociado && (
            <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
              Descuento aplicado:{' '}
              {((descuentoAplicado / valorNegociado) * 100).toFixed(1)}%
            </p>
          )}
        </div>
      </div>

      <div className='space-y-1.5'>
        <label className={s.label.base}>
          <MessageSquare className='h-4 w-4 text-indigo-500 dark:text-indigo-400' />
          Notas / Observaciones
          <span className='ml-2 text-xs font-normal text-gray-500 dark:text-gray-400'>
            (opcional)
          </span>
        </label>
        <textarea
          value={notas}
          onChange={e => onNotasChange(e.target.value)}
          rows={3}
          placeholder='Ej: Cliente solicitó descuento por pronto pago, tiene preferencia por segundo piso...'
          className={`${s.input.base} resize-none`}
        />
        {notas && (
          <p className='flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400'>
            <CheckCircle2 className='h-3 w-3 text-green-500' />
            {notas.length} caracteres
          </p>
        )}
      </div>
    </motion.div>
  )
}
