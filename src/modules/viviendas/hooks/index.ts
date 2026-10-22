// Barrel exports para hooks de viviendas

// ============================================
// REACT QUERY HOOKS (Datos del servidor)
// ============================================
export {
  useActualizarCertificadoMutation,
  useActualizarViviendaMutation,
  useConfiguracionRecargosQuery,
  useCrearViviendaMutation,
  useEliminarViviendaMutation,
  useGastosNotarialesQuery,
  useManzanasDisponiblesQuery,
  useNumerosOcupadosQuery,
  useProyectosActivosQuery,
  useProyectosFiltroQuery,
  useSiguienteNumeroViviendaQuery,
  useViviendasQuery,
  verificarMatriculaUnica,
  viviendasKeys,
} from './useViviendasQuery'
export { useViviendaQuery } from './useViviendaQuery'

// ============================================
// HOOKS DE LÓGICA UI
// ============================================
export { useEditarVivienda } from './useEditarVivienda'
export { useEditarViviendaAccordion } from './useEditarViviendaAccordion'
export { useNuevaViviendaAccordion } from './useNuevaViviendaAccordion'
export { usePasoUbicacion } from './usePasoUbicacion'
export { useViviendasList } from './useViviendasList'
