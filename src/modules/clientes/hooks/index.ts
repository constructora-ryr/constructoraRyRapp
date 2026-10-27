// Barrel export para hooks del módulo de clientes

// React Query
export * from './useClientesList'
export * from './useClientesQuery'
export * from './useDocumentosPendientesObligatorios' // fuente única de docs obligatorios pendientes
export * from './useInteresesQuery'
export * from './useNegociacionesQuery'

// Detalle del cliente y sus pestañas
export * from './useCategoriasSistemaClientes' // auto-seed de categorías del sistema
export * from './useClienteDetalle'
export * from './useDetectarCambios'
export * from './useDocumentosTab'
export * from './useEditarClienteAccordion'
export * from './useHistorialVersiones'
export * from './useInteresesTab'

// Negociación e intereses
export * from './useAsignacionVivienda'
export * from './useConfigurarFuentesPago'
export * from './useCrearNegociacion'
export * from './useNegociacion'
export * from './useRegistrarInteres'
