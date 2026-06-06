/**
 * Hook: useFuentePagoCard
 *
 * ✅ V2 - CAMPOS DINÁMICOS
 * Maneja la lógica del componente FuentePagoCard con campos dinámicos:
 * - Estado enabled/disabled
 * - Cambios en configuración dinámica (cualquier campo definido en BD)
 * - Validación según configuración
 *
 * @version 2.0 - Sistema de Campos Dinámicos
 */

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import type { TipoFuentePago } from '@/modules/clientes/types'
import type {
  CampoConfig,
  ErroresCampos,
  ValorCampo,
  ValoresCampos,
} from '@/modules/configuracion/types/campos-dinamicos.types'

import type { FuentePagoConfig } from '../asignar-vivienda/types'

// Función pura: valor por defecto según tipo de campo
function getDefaultValue(campo: CampoConfig): ValorCampo {
  if (campo.tipo === 'number' || campo.tipo === 'currency') return 0
  if (campo.tipo === 'checkbox') return false
  return ''
}

interface UseFuentePagoCardProps {
  tipo: TipoFuentePago
  config: FuentePagoConfig | null
  /** Campos dinámicos desde la BD */
  camposConfig: CampoConfig[]
  obligatorio?: boolean
  enabledProp?: boolean
  onEnabledChange?: (enabled: boolean) => void
  onChange: (config: FuentePagoConfig | null) => void
}

export function useFuentePagoCard({
  tipo,
  config,
  camposConfig,
  obligatorio = false,
  enabledProp,
  onEnabledChange,
  onChange,
}: UseFuentePagoCardProps) {
  const [enabled, setEnabled] = useState(enabledProp ?? obligatorio)
  const [valores, setValores] = useState<ValoresCampos>({})
  const [errores, setErrores] = useState<ErroresCampos>({})
  const inicializado = useRef(false)

  // ============================================
  // INICIALIZAR VALORES DESDE CONFIG
  // ============================================

  useEffect(() => {
    if (config && !inicializado.current) {
      inicializado.current = true
      const valoresIniciales: ValoresCampos = {}

      // ✅ V2: Cargar desde objeto dinámico `campos`
      if (config.campos) {
        camposConfig.forEach(campo => {
          valoresIniciales[campo.nombre] =
            config.campos[campo.nombre] ?? getDefaultValue(campo)
        })
      } else {
        // Legacy: Mapear desde propiedades antiguas
        camposConfig.forEach(campo => {
          if (campo.nombre === 'monto_aprobado') {
            valoresIniciales[campo.nombre] = config.monto_aprobado || 0
          } else if (campo.nombre === 'entidad') {
            valoresIniciales[campo.nombre] = config.entidad || ''
          } else if (campo.nombre === 'numero_referencia') {
            valoresIniciales[campo.nombre] = config.numero_referencia || ''
          } else {
            valoresIniciales[campo.nombre] = getDefaultValue(campo)
          }
        })
      }
      setValores(valoresIniciales)
    }
  }, [config, camposConfig])

  // ✅ Sincronizar estado cuando enabledProp cambia desde el padre
  useEffect(() => {
    if (enabledProp !== undefined) {
      setEnabled(enabledProp)
    }
  }, [enabledProp, tipo])

  // ============================================
  // HANDLERS
  // ============================================

  const handleEnabledChange = useCallback(
    (newEnabled: boolean) => {
      setEnabled(newEnabled)
      onEnabledChange?.(newEnabled)

      if (!newEnabled) {
        onChange(null)
        setValores({})
        setErrores({})
      } else {
        // ✅ V2: Inicializar config vacío con estructura dinámica
        const camposVacios: Record<string, ValorCampo> = {}
        camposConfig.forEach(campo => {
          if (campo.tipo === 'number' || campo.tipo === 'currency')
            camposVacios[campo.nombre] = 0
          else if (campo.tipo === 'checkbox') camposVacios[campo.nombre] = false
          else camposVacios[campo.nombre] = ''
        })

        const configInicial: FuentePagoConfig = {
          tipo,
          campos: camposVacios,
          // Legacy (compatibilidad)
          monto_aprobado: 0,
          entidad: '',
          numero_referencia: '',
        }
        onChange(configInicial)
      }
    },
    [tipo, onChange, onEnabledChange, camposConfig]
  )

  /**
   * ✅ V2: Handler genérico para cambio de cualquier campo dinámico
   */
  const handleCampoChange = useCallback(
    (nombreCampo: string, valor: ValorCampo) => {
      // Actualizar valores
      setValores(prev => ({
        ...prev,
        [nombreCampo]: valor,
      }))

      // Actualizar config
      if (config) {
        const nuevoConfig: FuentePagoConfig = {
          ...config,
          campos: {
            ...(config.campos || {}),
            [nombreCampo]: valor,
          },
        }

        // ✅ Mantener sincronización con legacy fields (por compatibilidad)
        if (nombreCampo === 'monto_aprobado') {
          nuevoConfig.monto_aprobado = valor as number
        } else if (nombreCampo === 'entidad') {
          nuevoConfig.entidad = valor as string
        } else if (nombreCampo === 'numero_referencia') {
          nuevoConfig.numero_referencia = valor as string
        }

        onChange(nuevoConfig)
      }

      // Limpiar error del campo
      setErrores(prev => {
        const nuevosErrores = { ...prev }
        delete nuevosErrores[nombreCampo]
        return nuevosErrores
      })
    },
    [config, onChange]
  )

  /**
   * Validar todos los campos según configuración
   */
  const validarCampos = useCallback((): boolean => {
    const nuevosErrores: ErroresCampos = {}

    camposConfig.forEach(campo => {
      const valor = valores[campo.nombre]

      // Campo requerido vacío
      if (campo.requerido) {
        if (
          valor === null ||
          valor === undefined ||
          valor === '' ||
          valor === 0
        ) {
          nuevosErrores[campo.nombre] =
            campo.mensajeError || `${campo.label} es obligatorio`
        }
      }

      // Validar min/max para números
      if (campo.tipo === 'number' || campo.tipo === 'currency') {
        const num = valor as number
        if (num !== null && num !== undefined) {
          if (campo.min !== undefined && num < campo.min) {
            nuevosErrores[campo.nombre] =
              `Debe ser mayor o igual a ${campo.min}`
          }
          if (campo.max !== undefined && num > campo.max) {
            nuevosErrores[campo.nombre] =
              `Debe ser menor o igual a ${campo.max}`
          }
        }
      }

      // Validar pattern para texto
      if (campo.tipo === 'text' && campo.pattern && valor) {
        const regex = new RegExp(campo.pattern)
        if (!regex.test(valor as string)) {
          nuevosErrores[campo.nombre] = campo.mensajeError || `Formato inválido`
        }
      }
    })

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }, [camposConfig, valores])

  // Legacy handlers (mantener compatibilidad)
  const handleMontoChange = useCallback(
    (value: string) => {
      const numero = Number(value.replace(/\./g, '').replace(/,/g, ''))
      if (!isNaN(numero)) {
        handleCampoChange('monto_aprobado', numero)
      }
    },
    [handleCampoChange]
  )

  const handleEntidadChange = useCallback(
    (value: string) => {
      handleCampoChange('entidad', value)
    },
    [handleCampoChange]
  )

  const handleReferenciaChange = useCallback(
    (value: string) => {
      handleCampoChange('numero_referencia', value)
    },
    [handleCampoChange]
  )

  /**
   * Captura el UUID de la entidad financiera seleccionada en el combobox.
   * El campo "entidad" (nombre) ya se actualiza vía handleCampoChange.
   * Este handler solo persiste el FK para normalización en BD.
   */
  const handleEntidadSeleccionada = useCallback(
    (id: string, _label: string) => {
      if (config) {
        onChange({
          ...config,
          campos: { ...(config.campos || {}) },
          entidad_financiera_id: id,
        })
      }
    },
    [config, onChange]
  )

  const handleRemoveDocument = useCallback(() => {
    if (config) {
      onChange({
        ...config,
        carta_aprobacion_url: undefined,
      })
    }
  }, [config, onChange])

  // ============================================
  // RETURN
  // ============================================

  return {
    // Estado
    enabled,
    valores,
    errores,
    tieneDocumento: !!config?.carta_aprobacion_url,

    // Handlers dinámicos
    handleEnabledChange,
    handleCampoChange,
    handleEntidadSeleccionada,
    validarCampos,

    // Handlers legacy (compatibilidad)
    handleMontoChange,
    handleEntidadChange,
    handleReferenciaChange,
    handleRemoveDocument,
  }
}
