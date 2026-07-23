/**
 * Utilidades de formateo para auditorías
 *
 * ✅ SOLO funciones puras sin side effects
 * ✅ Sin estado, sin hooks, sin JSX
 */

/**
 * Formatea una fecha al formato español completo con hora 12h
 */
export function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * Formatea solo la hora en formato 12h
 */
export function formatearHora(fecha: string): string {
  return new Date(fecha).toLocaleString('es-ES', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })
}

/**
 * Formatea un número como dinero en pesos colombianos
 */
export function formatearDinero(valor: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(valor)
}

/**
 * Obtiene el label de una acción de auditoría
 */
export function getAccionLabel(accion: string): string {
  switch (accion) {
    case 'CREATE':
      return 'Creación'
    case 'UPDATE':
      return 'Actualización'
    case 'DELETE':
      return 'Eliminación'
    case 'ANULAR':
      return 'Anulación'
    default:
      return accion
  }
}

/**
 * Obtiene el label legible de un tipo de operación
 */
export function getTipoOperacionLabel(tipoOperacion: string): string {
  // Mapeo de tipos de operación a labels legibles
  const labels: Record<string, string> = {
    // Documentos
    reemplazo_archivo_admin: 'Reemplazo de Archivo (Admin)',
    subida_documento: 'Subida de Documento',
    edicion_metadata: 'Edición de Metadatos',
    eliminacion_documento: 'Eliminación de Documento',
    nueva_version: 'Nueva Versión',

    // Proyectos
    creacion_proyecto: 'Creación de Proyecto',
    actualizacion_proyecto: 'Actualización de Proyecto',
    cierre_proyecto: 'Cierre de Proyecto',

    // Viviendas
    asignacion_vivienda: 'Asignación de Vivienda',
    liberacion_vivienda: 'Liberación de Vivienda',
    cambio_estado: 'Cambio de Estado',

    // Clientes
    registro_cliente: 'Registro de Cliente',
    actualizacion_datos: 'Actualización de Datos',

    // Negociaciones
    inicio_negociacion: 'Inicio de Negociación',
    cambio_estado_negociacion: 'Cambio de Estado',
    firma_contrato: 'Firma de Contrato',

    // Abonos
    registro_abono: 'Registro de Abono',
    anulacion_abono: 'Anulación de Abono',

    // Usuarios
    cambio_rol: 'Cambio de Rol',
    activacion_usuario: 'Activación de Usuario',
    desactivacion_usuario: 'Desactivación de Usuario',
  }

  // Si existe un label específico, retornarlo
  if (labels[tipoOperacion]) {
    return labels[tipoOperacion]
  }

  // Si no existe, formatear el string: snake_case → Title Case
  return tipoOperacion
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Calcula el tiempo transcurrido desde una fecha (relativo)
 */
export function tiempoTranscurrido(fecha: string): string {
  const ahora = new Date()
  const fechaEvento = new Date(fecha)
  const diferencia = ahora.getTime() - fechaEvento.getTime()

  const segundos = Math.floor(diferencia / 1000)
  const minutos = Math.floor(segundos / 60)
  const horas = Math.floor(minutos / 60)
  const dias = Math.floor(horas / 24)

  if (dias > 0) return `Hace ${dias} día${dias > 1 ? 's' : ''}`
  if (horas > 0) return `Hace ${horas} hora${horas > 1 ? 's' : ''}`
  if (minutos > 0) return `Hace ${minutos} minuto${minutos > 1 ? 's' : ''}`
  return 'Hace un momento'
}
