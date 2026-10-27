// =====================================================
// BARREL EXPORT: Hooks
// =====================================================

// ── React Query: Lista plana de abonos ──
export {
  abonosKeys,
  useAbonosQuery,
  useAnularAbonoMutation,
  useEditarAbonoMutation,
  useInvalidateAbonos,
  useRegistrarAbonoMutation,
} from './useAbonosQuery'
export type { AbonoCompletoRow, AbonoConInfo } from './useAbonosQuery'

// ── React Query: Negociaciones activas (reemplaza useAbonos para lista) ──
export {
  negociacionesAbonosKeys,
  useInvalidateNegociacionesAbonos,
  useNegociacionAbonosCliente,
  useNegociacionesAbonos,
} from './useNegociacionesAbonos'

// ── React Query: Detalle de negociación (fuentes + historial) ──
export {
  negociacionDetalleKeys,
  useFuentesPagoQuery,
  useHistorialAbonosQuery,
  useInvalidateNegociacionDetalle,
  useNegociacionDetalle,
} from './useNegociacionDetalle'

// ── Formulario + Validación ──
export { useRegistrarAbono } from './useRegistrarAbono'
