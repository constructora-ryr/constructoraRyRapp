/**
 * Hook: useCrearNegociacion
 *
 * Gestiona la creación de negociaciones vinculando Cliente + Vivienda + Fuentes de Pago
 *
 * ⚠️ NOMBRES DE CAMPOS VERIFICADOS EN: docs/DATABASE-SCHEMA-REFERENCE.md
 *
 * Campos usados:
 * - negociaciones: cliente_id, vivienda_id, valor_negociado, descuento_aplicado, notas, estado
 * - viviendas: valor_total
 * - fuentes_pago: negociacion_id, tipo, monto_aprobado, entidad, numero_referencia, permite_multiples_abonos
 *
 * 🔄 RETROCOMPATIBILIDAD:
 * - El campo `fuentes_pago` es OPCIONAL para mantener compatibilidad con modal antiguo
 * - Modal nuevo (modal-crear-negociacion-nuevo.tsx) → SÍ envía fuentes_pago
 * - Modal viejo (modal-crear-negociacion.tsx) → NO envía fuentes_pago (aún funciona)
 */

import { useCallback, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { errorLog } from '@/lib/utils/logger'
import { clientesKeys } from '@/modules/clientes/hooks/useClientesQuery'
import { negociacionesQueryKeys } from '@/modules/clientes/hooks/useNegociacionesQuery'
import { negociacionesService } from '@/modules/clientes/services/negociaciones.service'
import type { CrearFuentePagoDTO, Negociacion } from '@/modules/clientes/types'

interface FormDataNegociacion {
  cliente_id: string
  vivienda_id: string
  valor_negociado: number
  descuento_aplicado: number
  tipo_descuento?: string
  motivo_descuento?: string
  valor_escritura_publica?: number
  notas: string

  /** Fecha real de la negociación (para migración de datos históricos). Formato YYYY-MM-DD o ISO. */
  fecha_negociacion?: string

  // ⭐ NUEVO: Fuentes de pago (OPCIONAL para retrocompatibilidad con modal viejo)
  fuentes_pago?: CrearFuentePagoDTO[]
}

interface UseCrearNegociacionReturn {
  // Estado
  creando: boolean
  error: string | null
  negociacionCreada: Negociacion | null

  // Acciones
  crearNegociacion: (datos: FormDataNegociacion) => Promise<Negociacion | null>
  limpiar: () => void

  // Validaciones
  validarDatos: (datos: FormDataNegociacion) => {
    valido: boolean
    errores: string[]
  }
  calcularValorTotal: (valorNegociado: number, descuento: number) => number
}

export function useCrearNegociacion(): UseCrearNegociacionReturn {
  const queryClient = useQueryClient() // ⭐ Para invalidar caché
  const [creando, setCreando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [negociacionCreada, setNegociacionCreada] =
    useState<Negociacion | null>(null)

  /**
   * Calcular valor total (valor negociado - descuento)
   */
  const calcularValorTotal = useCallback(
    (valorNegociado: number, descuento: number): number => {
      return Math.max(0, valorNegociado - descuento)
    },
    []
  )

  /**
   * Validar datos antes de crear
   */
  const validarDatos = useCallback(
    (datos: FormDataNegociacion) => {
      const errores: string[] = []

      if (!datos.cliente_id) {
        errores.push('Debe seleccionar un cliente')
      }

      if (!datos.vivienda_id) {
        errores.push('Debe seleccionar una vivienda')
      }

      if (!datos.valor_negociado || datos.valor_negociado <= 0) {
        errores.push('El valor negociado debe ser mayor a 0')
      }

      if (datos.descuento_aplicado < 0) {
        errores.push('El descuento no puede ser negativo')
      }

      if (datos.descuento_aplicado >= datos.valor_negociado) {
        errores.push(
          'El descuento no puede ser mayor o igual al valor negociado'
        )
      }

      const valorTotal = calcularValorTotal(
        datos.valor_negociado,
        datos.descuento_aplicado
      )
      if (valorTotal <= 0) {
        errores.push(
          'El valor total (valor negociado - descuento) debe ser mayor a 0'
        )
      }

      // ⭐ VALIDACIONES DE FUENTES DE PAGO (solo si se proporcionan)
      if (datos.fuentes_pago && datos.fuentes_pago.length > 0) {
        // Validar que la suma de fuentes = valor total.
        // Para créditos internos usar capital_para_cierre (sin intereses), ya que los
        // intereses no son parte del precio de la vivienda, son ganancia del prestamista.
        const sumaFuentes = datos.fuentes_pago.reduce(
          (sum, f) => sum + (f.capital_para_cierre ?? f.monto_aprobado),
          0
        )
        if (sumaFuentes < valorTotal - 0.01) {
          // Solo bloquear cuando las fuentes no alcanzan el total (déficit).
          // El excedente (fuentes > valor) es válido — se devuelve al cliente.
          errores.push(
            `La suma de fuentes de pago ($${sumaFuentes.toLocaleString()}) no alcanza el valor total ($${valorTotal.toLocaleString()})`
          )
        }

        // Validar montos individuales
        datos.fuentes_pago.forEach(fuente => {
          if (!fuente.monto_aprobado || fuente.monto_aprobado <= 0) {
            errores.push(`${fuente.tipo}: El monto debe ser mayor a 0`)
          }
        })

        // Nota: Las validaciones de entidad y numero_referencia se hacen
        // en los pasos del wizard antes de llegar aquí
      }

      return {
        valido: errores.length === 0,
        errores,
      }
    },
    [calcularValorTotal]
  )

  /**
   * Crear negociación
   */
  const crearNegociacion = useCallback(
    async (datos: FormDataNegociacion): Promise<Negociacion | null> => {
      setCreando(true)
      setError(null)
      setNegociacionCreada(null)

      try {
        // Validar datos
        const validacion = validarDatos(datos)
        if (!validacion.valido) {
          const mensajeError = validacion.errores.join('\n')
          errorLog(
            'Validación fallida al crear negociación',
            new Error(validacion.errores.join(', '))
          )
          setError(mensajeError)
          return null
        }

        // Crear negociación
        const negociacion = await negociacionesService.crearNegociacion({
          cliente_id: datos.cliente_id,
          vivienda_id: datos.vivienda_id,
          valor_negociado: datos.valor_negociado,
          descuento_aplicado: datos.descuento_aplicado,
          tipo_descuento: datos.tipo_descuento,
          motivo_descuento: datos.motivo_descuento,
          valor_escritura_publica: datos.valor_escritura_publica,
          notas: datos.notas,
          fecha_negociacion: datos.fecha_negociacion,
          fuentes_pago: datos.fuentes_pago, // ⭐ NUEVO
        })
        // ⭐ Invalidar caché de viviendas para que se actualice el select
        await queryClient.invalidateQueries({
          queryKey: ['viviendas', 'disponibles'],
        })
        // ⭐ Invalidar caché del cliente para que banner y tab count se actualicen
        await queryClient.invalidateQueries({
          queryKey: clientesKeys.detail(datos.cliente_id),
        })
        await queryClient.invalidateQueries({ queryKey: clientesKeys.lists() })
        // ⭐ Invalidar caché de negociaciones del cliente para que el tab Negociación muestre la nueva
        await queryClient.invalidateQueries({
          queryKey: negociacionesQueryKeys.byCliente(datos.cliente_id),
        })
        // Disparar evento para refrescar tab de negociaciones
        window.dispatchEvent(new Event('negociacion-creada'))
        setNegociacionCreada(negociacion)
        return negociacion
      } catch (err) {
        let mensajeError = 'Error al crear negociación'

        // Manejar errores específicos de PostgreSQL
        if (err && typeof err === 'object' && 'code' in err) {
          const pgError = err as { code: string; message: string }

          if (pgError.code === '23505') {
            // Violación de constraint único
            if (
              pgError.message.includes('negociaciones_cliente_vivienda_unica')
            ) {
              mensajeError =
                'Ya existe una negociación activa para este cliente con esta vivienda.\n\nPara crear una nueva negociación, primero debe cancelar o completar la negociación existente desde el perfil del cliente.'
            } else {
              mensajeError =
                'Ya existe un registro con estos datos. Por favor, verifique la información.'
            }
          } else if (pgError.code === '23503') {
            // Violación de foreign key
            mensajeError =
              'Error de referencia: Verifique que el cliente y la vivienda existan.'
          } else {
            mensajeError = pgError.message || mensajeError
          }
        } else if (err instanceof Error) {
          mensajeError = err.message
        }

        errorLog('Error creando negociación', err)
        setError(mensajeError)
        return null
      } finally {
        setCreando(false)
      }
    },
    [validarDatos, queryClient]
  )

  /**
   * Limpiar estado
   */
  const limpiar = useCallback(() => {
    setCreando(false)
    setError(null)
    setNegociacionCreada(null)
  }, [])

  return {
    creando,
    error,
    negociacionCreada,
    crearNegociacion,
    limpiar,
    validarDatos,
    calcularValorTotal,
  }
}
