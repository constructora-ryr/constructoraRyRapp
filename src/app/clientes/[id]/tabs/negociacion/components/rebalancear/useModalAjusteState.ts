'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import type { FuentePago } from '@/modules/clientes/services/fuentes-pago.service'
import { esCreditoConstructora } from '@/shared/constants/fuentes-pago.constants'
import {
  calcularRestriccionesFuente,
  validarRebalanceo,
} from '@/shared/utils/reglas-cierre-financiero'

import type {
  AjusteLocal,
  DatosAjusteCierreFinanciero,
  FuAlteNueva,
} from '../../hooks'

import { getEntidadesParaTipo } from './entidades'
import type { CambioEnriquecido, NuevaEnriquecida } from './types'

interface TipoConfig {
  nombre: string
  requiere_entidad?: boolean
  tipo_entidad_requerido?: string | null
}

interface UseModalAjusteStateProps {
  isOpen: boolean
  fuentesPago: FuentePago[]
  valorVivienda: number
  tiposConfig: TipoConfig[]
  requisitosMap: Map<string, string[]>
  entidadesPorTipoEntidad: Map<string, string[]>
  onGuardar: (datos: DatosAjusteCierreFinanciero) => void
  isGuardando: boolean
}

export function useModalAjusteState({
  isOpen,
  fuentesPago,
  valorVivienda,
  tiposConfig,
  requisitosMap,
  entidadesPorTipoEntidad,
  onGuardar,
  isGuardando,
}: UseModalAjusteStateProps) {
  const [ajustes, setAjustes] = useState<AjusteLocal[]>([])
  const [nuevas, setNuevas] = useState<FuAlteNueva[]>([])
  const [motivo, setMotivo] = useState('')
  const [notas, setNotas] = useState('')
  const [mostrandoAdvertencia, setMostrandoAdvertencia] = useState(false)
  const [hasAttemptedSave, setHasAttemptedSave] = useState(false)

  // Sincronizar y resetear al abrir
  useEffect(() => {
    if (!isOpen) return
    setMostrandoAdvertencia(false)
    setHasAttemptedSave(false)
    setAjustes(
      fuentesPago.map(f => ({
        id: f.id,
        tipo: f.tipo,
        montoOriginal: f.monto_aprobado,
        montoEditable: f.capital_para_cierre ?? f.monto_aprobado,
        entidad: f.entidad ?? '',
        entidadEditable: f.entidad ?? '',
        paraEliminar: false,
        monto_recibido: f.monto_recibido ?? 0,
        capital_para_cierre: f.capital_para_cierre,
        tienePlanCuotas:
          esCreditoConstructora(f.tipo) && f.capital_para_cierre !== null,
        permite_multiples_abonos: f.permite_multiples_abonos ?? true,
      }))
    )
    setNuevas([])
    setMotivo('')
    setNotas('')
  }, [isOpen, fuentesPago])

  // ── Lookups ────────────────────────────────────────────────
  const tiposConfigMap = useMemo(
    () => new Map(tiposConfig.map(t => [t.nombre, t])),
    [tiposConfig]
  )

  const resolverEntidades = useCallback(
    (tipoFuente: string): string[] => {
      const config = tiposConfigMap.get(tipoFuente)
      return getEntidadesParaTipo(
        config?.tipo_entidad_requerido,
        entidadesPorTipoEntidad
      )
    },
    [tiposConfigMap, entidadesPorTipoEntidad]
  )

  // ── Restricciones por fuente ───────────────────────────────
  const restriccionesMap = useMemo(() => {
    const map = new Map<
      string,
      ReturnType<typeof calcularRestriccionesFuente>
    >()
    for (const a of ajustes) {
      map.set(
        a.id,
        calcularRestriccionesFuente({
          id: a.id,
          tipo: a.tipo,
          monto_aprobado: a.montoOriginal,
          capital_para_cierre: a.capital_para_cierre,
          monto_recibido: a.monto_recibido,
          tienePlanCuotas: a.tienePlanCuotas,
          permite_multiples_abonos: a.permite_multiples_abonos,
        })
      )
    }
    return map
  }, [ajustes])

  // ── Balance ────────────────────────────────────────────────
  const subtotal = useMemo(() => {
    const activas = ajustes
      .filter(a => !a.paraEliminar)
      .reduce((s, a) => {
        const r = restriccionesMap.get(a.id)
        const monto =
          r && !r.puedeEditarMonto && a.capital_para_cierre !== null
            ? a.capital_para_cierre
            : a.montoEditable
        return s + monto
      }, 0)
    return activas + nuevas.reduce((s, n) => s + n.monto, 0)
  }, [ajustes, nuevas, restriccionesMap])

  const diferencia = valorVivienda - subtotal
  const estaBalanceado = Math.abs(diferencia) < 1

  const todasFuentesBloqueadas = useMemo(() => {
    const activas = ajustes.filter(a => !a.paraEliminar)
    return (
      activas.length > 0 &&
      activas.every(a => restriccionesMap.get(a.id)?.esCompletada ?? false)
    )
  }, [ajustes, restriccionesMap])

  // ── Auto-sugerencia ────────────────────────────────────────
  const sugerenciaAjuste = useMemo(() => {
    if (diferencia >= 0) return null
    const exceso = Math.abs(diferencia)
    // Preferir coincidencia exacta al mínimo
    for (const a of ajustes) {
      if (a.paraEliminar) continue
      const r = restriccionesMap.get(a.id)
      if (!r?.puedeEditarMonto) continue
      if (Math.abs(a.montoEditable - exceso - r.montoMinimo) < 1)
        return {
          id: a.id,
          tipo: a.tipo,
          nuevoMonto: r.montoMinimo,
          esExacto: true,
        }
    }
    // Fallback: primera fuente que absorbe el exceso sin bajar del mínimo
    for (const a of ajustes) {
      if (a.paraEliminar) continue
      const r = restriccionesMap.get(a.id)
      if (!r?.puedeEditarMonto) continue
      const nuevoMonto = a.montoEditable - exceso
      if (nuevoMonto >= r.montoMinimo)
        return { id: a.id, tipo: a.tipo, nuevoMonto, esExacto: false }
    }
    return null
  }, [diferencia, ajustes, restriccionesMap])

  // ── Validaciones individuales ──────────────────────────────
  const nuevasConMontoCero = useMemo(
    () =>
      new Set(
        nuevas.map((n, i) => (n.monto <= 0 ? i : -1)).filter(i => i >= 0)
      ),
    [nuevas]
  )

  const ajustesConMontoInvalido = useMemo(() => {
    const ids = new Set<string>()
    for (const a of ajustes) {
      if (a.paraEliminar) continue
      const r = restriccionesMap.get(a.id)
      if (!r?.puedeEditarMonto) continue
      if (a.montoEditable <= 0) ids.add(a.id)
    }
    return ids
  }, [ajustes, restriccionesMap])

  const ajustesConEntidadFaltante = useMemo(() => {
    const ids = new Set<string>()
    for (const a of ajustes) {
      if (a.paraEliminar) continue
      if (!tiposConfigMap.get(a.tipo)?.requiere_entidad) continue
      if (!a.entidadEditable.trim()) ids.add(a.id)
    }
    return ids
  }, [ajustes, tiposConfigMap])

  const nuevasConEntidadFaltante = useMemo(
    () =>
      new Set(
        nuevas
          .map((n, i) => {
            const cfg = tiposConfigMap.get(n.tipo)
            return cfg?.requiere_entidad && !n.entidad.trim() ? i : -1
          })
          .filter(i => i >= 0)
      ),
    [nuevas, tiposConfigMap]
  )

  const erroresRebalanceo = useMemo(
    () =>
      validarRebalanceo(
        ajustes.flatMap(a => {
          const restricciones = restriccionesMap.get(a.id)
          if (!restricciones) return []
          return [
            {
              id: a.id,
              montoEditable: a.montoEditable,
              paraEliminar: a.paraEliminar,
              restricciones,
            },
          ]
        }),
        valorVivienda,
        subtotal
      ),
    [ajustes, restriccionesMap, valorVivienda, subtotal]
  )

  // ── Validación global ──────────────────────────────────────
  const motivoRequiereNotas = motivo === 'Otro'

  const puedeGuardar =
    estaBalanceado &&
    erroresRebalanceo.length === 0 &&
    nuevasConMontoCero.size === 0 &&
    ajustesConMontoInvalido.size === 0 &&
    ajustesConEntidadFaltante.size === 0 &&
    nuevasConEntidadFaltante.size === 0 &&
    motivo !== '' &&
    (!motivoRequiereNotas || notas.trim() !== '') &&
    !isGuardando

  // ── Advertencias de documentos ─────────────────────────────
  const fuentesExistentesQueInvalidan = useMemo<CambioEnriquecido[]>(() => {
    return ajustes
      .filter(a => !a.paraEliminar)
      .filter(a => {
        if (!tiposConfigMap.get(a.tipo)?.requiere_entidad) return false
        return (
          a.entidadEditable !== a.entidad || a.montoEditable > a.montoOriginal
        )
      })
      .map(a => {
        const cambioEntidad = a.entidadEditable !== a.entidad
        const aumentoMonto = a.montoEditable > a.montoOriginal
        return {
          tipo: a.tipo,
          motivoCambio: (cambioEntidad && aumentoMonto
            ? 'ambos'
            : cambioEntidad
              ? 'entidad'
              : 'monto') as CambioEnriquecido['motivoCambio'],
          entidadAnterior: cambioEntidad
            ? a.entidad || 'Sin entidad'
            : undefined,
          entidadNueva: cambioEntidad
            ? a.entidadEditable || 'Sin entidad'
            : undefined,
          montoAnterior: aumentoMonto ? a.montoOriginal : undefined,
          montoNuevo: aumentoMonto ? a.montoEditable : undefined,
          documentos: requisitosMap.get(a.tipo) ?? [],
        }
      })
  }, [ajustes, tiposConfigMap, requisitosMap])

  const fuentesNuevasQueNecesitanCarta = useMemo<NuevaEnriquecida[]>(
    () =>
      nuevas
        .filter(n => tiposConfigMap.get(n.tipo)?.requiere_entidad ?? false)
        .map(n => ({
          tipo: n.tipo,
          documentos: requisitosMap.get(n.tipo) ?? [],
        })),
    [nuevas, tiposConfigMap, requisitosMap]
  )

  const hayCambiosConAdvertencia =
    fuentesExistentesQueInvalidan.length > 0 ||
    fuentesNuevasQueNecesitanCarta.length > 0

  // ── Handlers ───────────────────────────────────────────────
  const handleCambioMonto = (id: string, monto: number) =>
    setAjustes(prev =>
      prev.map(a => (a.id === id ? { ...a, montoEditable: monto } : a))
    )

  const handleCambioEntidad = (id: string, entidad: string) =>
    setAjustes(prev =>
      prev.map(a => (a.id === id ? { ...a, entidadEditable: entidad } : a))
    )

  const handleToggleEliminar = (id: string) =>
    setAjustes(prev =>
      prev.map(a => (a.id === id ? { ...a, paraEliminar: !a.paraEliminar } : a))
    )

  const handleAgregarTipo = (tipo: string) =>
    setNuevas(prev => [...prev, { tipo, monto: 0, entidad: '' }])

  const handleCambioNueva = (
    index: number,
    campo: keyof FuAlteNueva,
    valor: string | number
  ) =>
    setNuevas(prev =>
      prev.map((n, i) => (i === index ? { ...n, [campo]: valor } : n))
    )

  const handleEliminarNueva = (index: number) =>
    setNuevas(prev => prev.filter((_, i) => i !== index))

  const handleAplicarSugerencia = () => {
    if (sugerenciaAjuste)
      handleCambioMonto(sugerenciaAjuste.id, sugerenciaAjuste.nuevoMonto)
  }

  const handleGuardar = () => {
    setHasAttemptedSave(true)
    if (!puedeGuardar) return
    if (hayCambiosConAdvertencia && !mostrandoAdvertencia) {
      setMostrandoAdvertencia(true)
      return
    }
    onGuardar({ ajustes, nuevas, motivo, notas })
  }

  return {
    // Estado editable
    ajustes,
    nuevas,
    motivo,
    notas,
    mostrandoAdvertencia,
    hasAttemptedSave,
    setMotivo,
    setNotas,
    // Lookups
    tiposConfigMap,
    resolverEntidades,
    restriccionesMap,
    // Balance
    subtotal,
    diferencia,
    estaBalanceado,
    todasFuentesBloqueadas,
    sugerenciaAjuste,
    // Validaciones
    nuevasConMontoCero,
    ajustesConMontoInvalido,
    ajustesConEntidadFaltante,
    nuevasConEntidadFaltante,
    erroresRebalanceo,
    puedeGuardar,
    motivoRequiereNotas,
    // Advertencias docs
    fuentesExistentesQueInvalidan,
    fuentesNuevasQueNecesitanCarta,
    hayCambiosConAdvertencia,
    // Handlers
    handleCambioMonto,
    handleCambioEntidad,
    handleToggleEliminar,
    handleAgregarTipo,
    handleCambioNueva,
    handleEliminarNueva,
    handleAplicarSugerencia,
    handleGuardar,
  }
}
