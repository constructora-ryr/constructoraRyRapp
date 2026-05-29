/**
 * ============================================
 * SERVICE: PDF de Negociación
 * ============================================
 *
 * ✅ Generación profesional de reportes en PDF
 * Arquitectura limpia con separación de responsabilidades
 *
 * Features:
 * - Diseño profesional con branding
 * - Información completa del cliente y negociación
 * - Tablas de fuentes de pago y abonos
 * - Resumen financiero con métricas
 * - Formato estándar para impresión/email
 *
 * @version 1.0.0 - 2025-01-27 (Nuevo sistema de reportes)
 */

import jsPDF, { GState } from 'jspdf'
import autoTable from 'jspdf-autotable'

import { getTodayDateString } from '@/lib/utils/date.utils'
import { logger } from '@/lib/utils/logger'

// jspdf-autotable adds lastAutoTable to the jsPDF instance at runtime
interface JsPDFWithAutoTable extends jsPDF {
  lastAutoTable: { finalY: number }
}

// ============================================
// TYPES
// ============================================

interface DatosCliente {
  nombres: string
  apellidos: string
  cedula: string
  telefono?: string
  email?: string
}

interface DatosVivienda {
  proyecto: string
  manzana?: string
  numeroVivienda: string
  tipo?: string
}

interface DatosNegociacion {
  valorBase: number
  descuento: number
  valorFinal: number
  totalPagado: number
  saldoPendiente: number
  porcentajePagado: number
  estado: string
  fechaInicio?: string
  diasDesdeUltimoAbono?: number | null
}

interface FuentePago {
  tipo: string
  monto: number
  entidad?: string
  referencia?: string
  montoRecibido: number
  porcentajePagado: number
}

interface Abono {
  fecha: string
  fuente: string
  monto: number
  metodoPago?: string
  numeroRecibo?: string
}

export interface DatosReportePDF {
  cliente: DatosCliente
  vivienda: DatosVivienda
  negociacion: DatosNegociacion
  fuentesPago: FuentePago[]
  abonos: Abono[]
  generadoPor?: string
}

// ============================================
// CONFIGURACIÓN DE COLORES
// ============================================

const COLORES = {
  // Marca (Rojo Corporativo RyR - actualizado 2025-11-28)
  primary: [196, 30, 58] as [number, number, number], // Rojo RyR #C41E3A
  primaryDark: [160, 24, 46] as [number, number, number], // Rojo RyR oscuro

  // Semánticos
  success: [16, 185, 129] as [number, number, number], // Emerald-500
  warning: [245, 158, 11] as [number, number, number], // Amber-500
  danger: [239, 68, 68] as [number, number, number], // Red-500

  // Grises
  textPrimary: [31, 41, 55] as [number, number, number], // Gray-800
  textSecondary: [107, 114, 128] as [number, number, number], // Gray-500
  border: [229, 231, 235] as [number, number, number], // Gray-200
}

// ============================================
// LOGO EMPRESA (Base64)
// ============================================

const LOGO_RYR_BASE64 =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAdAAAADICAYAAABMh7NzAAAACXBIWXMAAAsTAAALEwEAmpwYAAAF8mlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgOS4xLWMwMDIgNzkuZTY2Y2JjNzk1LCAyMDIzLzA3LzE5LTE0OjU5OjY2ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjUuMiAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDI0LTExLTE4VDAxOjQxOjE2LTA1OjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyNC0xMS0xOFQwMTo1MzowMi0wNTowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyNC0xMS0xOFQwMTo1MzowMi0wNTowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6YjBkZjBjNGUtNGQ2Yy00MDQ5LWE0YmQtOTEwODU4ZjYzZGQxIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOmIwZGYwYzRlLTRkNmMtNDA0OS1hNGJkLTkxMDg1OGY2M2RkMSIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmIwZGYwYzRlLTRkNmMtNDA0OS1hNGJkLTkxMDg1OGY2M2RkMSI+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNyZWF0ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6YjBkZjBjNGUtNGQ2Yy00MDQ5LWE0YmQtOTEwODU4ZjYzZGQxIiBzdEV2dDp3aGVuPSIyMDI0LTExLTE4VDAxOjQxOjE2LTA1OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgMjUuMiAoV2luZG93cykiLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+oVSUfQAAEp5JREFUeJzt3X2QZXV95/H3t7tnGBhmhhlgBhgYkAcBRVEUH1ZdV3djNlHX3aTWrWwSk2yS3axZk6ybTVKVf5L8k2STTSobTbKJSUxMNpu4Jm6iJhvjU3xAQRQQBQQGGJ5nGGZg+qG///H73Xtvd0/39J3p2327+/2quufe+7vnnPv73nP63nPP75xzIzORJEkrMzbtAiRJ2owMUEmSKhigkiRVMEAlSapggEqSVMEAlSSpggEqSVIFA1SSpAoGqCRJFQxQSZIqGKCSJFUwQCVJqmCASpJUwQCVJKmCASpJUgUDVJKkCgaoJEkVDFBJkioYoJIkVTBAJUmqYIBKklTBAJUkqYIBKklSBQNUkqQKBqgkSRUMUEmSKhigkiRVMEAlSapggEqSVMEAlSSpggEqSVIFA1SSpAoGqCRJFQxQSZIqGKCSJFUwQCVJqmCASpJUwQCVJKmCASpJUgUDVJKkCgaoJEkVDFBJkioYoJIkVTBAJUmqYIBKklTBAJUkqYIBKklSBQNUkqQKBqgkSRUMUEmSKhigkiRVMEAlSapggEqSVMEAlSSpggEqSVIFA1SSpAoGqCRJFQxQSZIqGKCSJFUwQCVJqmCASpJUwQCVJKmCASpJUgUDVJKkCgaoJEkVDFBJkioYoJIkVTBAJUmqYIBKklTBAJUkqYIBKklSBQNUkqQKBqgkSRUMUEmSKhigkiRVMEAlSapggEqSVMEAlSSpggEqSVIFA1SSpAoGqCRJFQxQSZIqGKCSJFUwQCVJqmCASpJUwQCVJKmCASpJUgUDVJKkCgaoJEkVDFBJkioYoJIkVTBAJUmqYIBKklTBAJUkqYIBKklSBQNUkqQKBqgkSRUMUEmSKhigkiRVMEAlSapggEqSVMEAlSSpggEqSVIFA1SSpAoGqCRJFQxQSZIqGKCSJFUwQCVJqmCASpJUwQCVJKmCASpJUgUDVJKkCgaoJEkVDFBJkioYoJIkVTBAJUmqYIBKklTBAJUkqYIBKklSBQNUkqQKBqgkSRUMUEmSKhigkiRVMEAlSapggEqSVMEAlSSpggEqSVIFA1SSpAoGqCRJFQxQSZIqGKCSJFUwQCVJqmCASpJUwQCVJKmCASpJUgUDVJKkCgaoJEkVDFBJkioYoJIkVTBAJUmqYIBKklTBAJUkqYIBKklSBQNUkqQKBqgkSRUMUEmSKhigkiRVMEAlSapggEqSVMEAlSSpggEqSVIFA1SSpAoGqCRJFQxQSZIqGKCSJFUwQCVJqmCASpJUwQCVJKmCASpJUgUDVJKkCgaoJEkVDFBJkioYoJIkVTBAJUmqYIBKklTBAJUkqYIBKklSBQNUkqQKBqgkSRUMUEmSKhigkiRVMEAlSapggEqSVMEAlSSpggEqSVIFA1SSpAoGqCRJFQxQSZIqGKCSJFUwQCVJqmCASpJUwQCVJKmCASpJUgUDVJKkCgaoJEkVDFBJkioYoJIkVTBAJUmqYIBKklTBAJUkqYIBKklSBQNUkqQKBqgkSRUMUEmSKhigkiRVMEAlSapggEqSVMEAlSSpggEqSVIFA1SSpAoGqCRJFQxQSZIqGKCSJFUwQCVJqmCASpJUwQCVJKmCASpJUgUDVJKkCgaoJEkVDFBJkioYoJIkVTBAJUmqYIBKklTBAJUkqYIBKklSBQNUkqQKBqgkSRUMUEmSKhigkiRVMEAlSapggEqSVMEAlSSpggEqSVIFA1SSpAoGqCRJFQxQSZIqGKCSJFUwQCVJqmCASpJUwQCVJKmCASpJUgUDVJKkCgaoJEkVDFBJkioYoJIkVTBAJUmqYIBKklTBAJUkqYIBKklSBQNUkqQKBqgkSRUMUEmSKhigkiRVMEAlSapggEqSVMEAlSSpggEqSVIFA1SSpAoGqCRJFQxQSZIqGKCSJFUwQCVJqmCASpJUwQCVJKmCASpJUgUDVJKkCgaoJEkVDFBJkioYoJIkVTBAJUmqYIBKklTBAJUkqYIBKklSBQNUkqQKBqgkSRUMUEmSKhigkiRVMEAlSapggEqSVMEAlSSpggEqSVIFA1SSpAoGqCRJFQxQSZIqGKCSJFUwQCVJqmCASpJUwQCVJKmCASpJUgUDVJKkCgaoJEkVDFBJkioYoJIkVTBAJUmqYIBKklTBAJUkqYIBKklSBQNUkqQKBqgkSRUMUEmSKhigkiRVMEAlSapggEqSVMEAlSSpggEqSVIFA1SSpAoGqCRJFQxQSZIqGKCSJFUwQCVJqmCASpJUwQCVJKmCASpJUgUDVJKkCgaoJEkVDFBJkioYoJIkVTBAJUmqYIBKklTBAJUkqYIBKklSBQNUkqQKBqgkSRUMUEmSKhigkiRVMEAlSapggEqSVMEAlSSpggEqSVIFA1SSpAoGqCRJFQxQSZIqGKCSJFUwQCVJqmCASpJUwQCVJKmCASpJUgUDVJKkCgaoJEkVDFBJkioYoJIkVTBAJUmqYIBKklTBAJUkqYIBKklSBQNUkqQKBqgkSRUMUEmSKhigkiRVMEAlSapggEqSVMEAlSSpggEqSVIFA1SSpAoGqCRJFQxQSZIqGKCSJFUwQCVJqmCASpJUwQCVJKmCASpJUgUDVJKkCgaoJEkVDFBJkioYoJIkVTBAJUmqYIBKklTBAJUkqYIBKklSBQNUkqQKBqgkSRUMUEmSKhigkiRVMEAlSapggEqSVMEAlSSpggEqSVIFA1SSpAoGqCRJFQxQSZIqGKCSJFUwQCVJqmCASpJUwQCVJKmCASpJUgUDVJKkCgaoJEkVDFBJkioYoJIkVTBAJUmqYIBKklTBAJUkqYIBKklSBQNUkqQKBqgkSRUMUEmSKhigkiRVMEAlSapggEqSVMEAlSSpggEqSVIFA1SSpAoGqCRJFQxQSZIqGKCSJFUwQCVJqmCASpJUwQCVJKmCASpJUgUDVJKkCgaoJEkVDFBJkioYoJIkVTBAJUmqYIBKklTBAJUkqYIBKklSBQNUkqQKBqgkSRUMUEmSKhigkiRVMEAlSapggEqSVMEAlSSpggEqSVIFA1SSpAoGqCRJFQxQSZIqGKCSJFUwQCVJqmCASpJUwQCVJKmCASpJUgUDVJKkCgaoJEkVDFBJkioYoJIkVTBAJUmqYIBKklTBAJUkqYIBKklSBQNUkqQKBqgkSRUMUEmSKhigkiRVMEAlSapggEqSVMEAlSSpggEqSVIFA1SSpAoGqCRJFQxQSZIqGKCSJFUwQCVJqmCASpJUwQCVJKmCASpJUgUDVJKkCgaoJEkVDFBJkioYoJIkVTBAJUmqYIBKklTBAJUkqYIBKklSBQNUkqQKBqgkSRUMUEmSKhigkiRVMEAlSapggEqSVMEAlSSpggEqSVIFA1SSpAoGqCRJFQxQSZIqGKCSJFUwQCVJqmCASpJUwQCVJKmCASpJUgUDVJKkCgaoJEkVDFBJkioYoJIkVTBAJUmqYIBKklTBAJUkqYIBKklSBQNUkqQKBqgkSRUMUEmSKhigkiRVMEAlSapggEqSVMEAlSSpggEqSVIFA1SSpAoGqCRJFQxQSZIqGKCSJFUwQCVJqmCASpJUwQCVJKmCASpJUgUDVJKkCgaoJEkVDFBJkioYoJIkVTBAJUmqYIBKklTBAJUkqYIBKklSBQNUkqQKBqgkSRUMUEmSKhigkiRVMEAlSapggEqSVMEAlSSpggEqSVIFA1SSpAoGqCRJFQxQSZIqGKCSJFUwQCVJqmCASpJUwQCVJKmCASpJUgUDVJKkCgaoJEkVDFBJkioYoJIkVTBAJUmqYIBKklTBAJUkqYIBKklSBQNUkqQKBqgkSRUMUEmSKhigkiRVMEAlSapggEqSVMEAlSSpggEqSVIFA1SSpAoGqCRJFQxQSZIqGKCSJFUwQCVJqmCASpJUwQCVJKmCASpJUgUDVJKkCgaoJEkVDFBJkioYoJIkVTBAJUmqYIBKklTBAJUkqYIBKklSBQNUkqQKBqgkSRUMUEmSKhigkiRVMEAlSapggEqSVMEAlSSpggEqSVIFA1SSpAoGqCRJFQxQSZIqGKCSJFUwQCVJqmCASpJUwQCVJKmCASpJUgUDVJKkCgaoJEkVDFBJkioYoJIkVTBAJUmqYIBKklTBAJUkqYIBKklSBQNUkqQKBqgkSRUMUEmSKhigkiRVMEAlSapggEqSVMEAlSSpggEqSVIFA1SSpAoGqCRJFQxQSZIqGKCSJFUwQCVJqmCASpJUwQCVJKmCASpJUgUDVJKkCgaoJEkVDFBJkioYoJIkVTBAJUmqYIBKklTBAJUkqYIBKklSBQNUkqQKBqgkSRUMUEmSKhigkiRVMEAlSapggEqSVMEAlSSpggEqSVIFA1SSpAoGqCRJFQxQSZIqGKCSJFUwQCVJqmCASpJUwQCVJKmCASpJUgUDVJKkCgaoJEkVDFBJkioYoJIkVTBAJUmqYIBKklTBAJUkqYIBKklSBQNUkqQKBqgkSRUMUEmSKhigkiRVMEAlSapggEqSVMEAlSSpggEqSVIFA1SSpAoGqCRJFQxQSZIqGKCSJFUwQCVJqmCASpJUwQCVJKmCASpJUgUDVJKkCgaoJEkVDFBJkioYoJIkVTBAJUmqYIBKklTBAJUkqYIBKklSBQNUkqQKBqgkSRUMUEmSKhigkiRVMEAlSapggEqSVMEAlSSpggEqSVIFA1SSpAoGqCRJFQxQSZIqGKCSJFUwQCVJqmCASpJUwQCVJKmCASpJUgUDVJKkCgaoJEkVDFBJkioYoJIkVTBAJUmqYIBKklTBAJUkqYIBKklSBQNUkqQKBqgkSRUMUEmSKhigkiRVMEAlSapggEqSVMEAlSSpggEqSVIFA1SSpAoGqCRJFQxQSZIqGKCSJFUwQCVJqmCASpJUwQCVJKmCASpJUgUDVJKkCgaoJEkVDFBJkioYoJIkVTBAJUmqYIBKklTBAJUkqYIBKklSBQNUkqQKBqgkSRUMUEmSKhigkiRVMEAlSapggEqSVMEAlSSpggEqSVIFA1SSpAoGqCRJFQxQSZIqGKCSJFUwQCVJqmCASpJUwQCVJKmCASpJUgUDVJKkCgaoJEkVDFBJkioYoJIkVTBAJUmqYIBKklTBAJUkqYIBKklSBQNUkqQKBqgkSRUMUEmSKhigkiRVMEAlSapggEqSVMEAlSSpggEqSVIFA1SSpAoGqCRJFQxQSZIqGKCSJFUwQCVJqmCASpJUwQCVJKmCASpJUgUDVJKkCgaoJEkVDFBJkioYoJIkVTBAJUmqYIBKklTBAJUkqYIBKklSBQNUkqQKBqgkSRUMUEmSKhigkiRVMEAlSapggEqSVMEAlSSpggEqSVIFA1SSpAoGqCRJFQxQSZIqGKCSJFUwQCVJqmCASpJUwQCVJKmCASpJUgUDVJKkCgaoJEkVDFBJkioYoJIkVTBAJUmqYIBKklTBAJUkqYIBKklSBQNUkqQKBqgkSRUMUEmSKhigkiRVMEAlSapggEqSVMEAlSSpggEqSVIFA1SSpAoGqCRJFQxQSZIqGKCSJFUwQCVJqmCASpJUwQCVJKmCASpJUgUDVJKkCgaoJEkVDFBJkioYoJIkVTBAJUmqYIBKklTBAJUkqYIBKklSBQNUkqQKBqgkSRUMUEmSKhigkiRVMEAlSapggEqSVMEAlSSpggEqSVIFA1SSpAoGqCRJFQxQSZIqGKCSJFUwQCVJqmCASpJUwQCVJKmCASpJUgUDVJKkCgaoJEkVDFBJkioYoJIkVTBAJUmqYIBKklTBAJUkqYIBKklSBQNUkqQKBqgkSRUMUEmSKhigkiRVMEAlSapggEqSVMEAlSSpggEqSVIFA1SSpAoGqCRJFQxQSZIqGKCSJFUwQCVJqmCASpJUwQCVJKmCASpJUgUDVJKkCgaoJEkVDFBJkioYoJIkVTBAJUmqYIBKklTBAJUkqYIBKklSBQNUkqQKBqgkSRUMUEmSKhigkiRVMEAlSapggEqSVMEAlSSpggEqSVIFA1SSpAoGqCRJFQxQSZIqGKCSJFUwQCVJqmCASpJUwQCVJKmCASpJUgUDVJKkCgaoJEkVDFBJkioYoJIkVTBAJUmqYIBKklTBAJUkqYIBKklSBQNUkqQKBqgkSRUMUEmSKhigkiRVMEAlSapggEqSVMEAlSSpggEqSVIFA1SSpAoGqCRJFQxQSZIqGKCSJFUwQCVJqmCASpJUwQCVJKmCASpJUgUDVJKkCgaoJEkVDFBJkioYoJIkVTBAJUmqYIBKklTBAJUkqYIBKklSBQNUkqQKBqgkSRUMUEmSKhigkiRVMEAlSapggEqSVMEAlSSpggEqSVKF/w9vL5rkHGbQFwAAAABJRU5ErkJggg=='

// ============================================
// FUNCIONES DE DISEÑO (UI Helpers)
// ============================================

/**
 * Configurar fuente según tipo
 */
function setFont(
  doc: jsPDF,
  type: 'title' | 'subtitle' | 'body' | 'caption' | 'bold'
) {
  switch (type) {
    case 'title':
      doc.setFontSize(20)
      doc.setFont('helvetica', 'bold')
      break
    case 'subtitle':
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      break
    case 'body':
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      break
    case 'caption':
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      break
    case 'bold':
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      break
  }
}

/**
 * Agregar sección con título
 */
function addSection(doc: jsPDF, title: string, yPos: number): number {
  setFont(doc, 'subtitle')
  doc.setTextColor(...COLORES.textPrimary)
  doc.text(title, 14, yPos)

  // Línea decorativa bajo el título
  doc.setDrawColor(...COLORES.primary)
  doc.setLineWidth(0.5)
  doc.line(14, yPos + 2, 196, yPos + 2)

  return yPos + 8
}

/**
 * Agregar fila de datos (label: valor)
 */
function addDataRow(
  doc: jsPDF,
  label: string,
  value: string,
  yPos: number,
  options?: {
    align?: 'left' | 'right'
    color?: [number, number, number]
    bold?: boolean
  }
): number {
  const {
    align = 'left',
    color = COLORES.textPrimary,
    bold = false,
  } = options || {}

  setFont(doc, bold ? 'bold' : 'body')
  doc.setTextColor(...COLORES.textSecondary)
  doc.text(label, 14, yPos)

  doc.setTextColor(...color)
  const xPos = align === 'right' ? 196 : 100
  doc.text(value, xPos, yPos, { align })

  return yPos + 6
}

/**
 * Verificar si hay espacio suficiente en la página
 */
function checkPageBreak(doc: jsPDF, yPos: number, requiredSpace = 50): number {
  if (yPos + requiredSpace > 270) {
    doc.addPage()
    return 20
  }
  return yPos
}

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================

/**
 * Generar reporte PDF completo de negociación
 */
export async function generarReportePDF(datos: DatosReportePDF): Promise<void> {
  const doc = new jsPDF()

  let yPos = 20

  // ============================================
  // 1. ENCABEZADO CON BRANDING + LOGO
  // ============================================

  // Logo RyR (esquina superior izquierda)
  try {
    doc.addImage(LOGO_RYR_BASE64, 'PNG', 15, 10, 35, 15)
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error desconocido'
    logger.warn('⚠️ [CLIENTES] No se pudo cargar el logo:', mensaje, error)
  }

  setFont(doc, 'title')
  doc.setTextColor(...COLORES.primary)
  doc.text('REPORTE DE NEGOCIACIÓN', 105, yPos, { align: 'center' })

  yPos += 8
  setFont(doc, 'caption')
  doc.setTextColor(...COLORES.textSecondary)
  const fechaGen = new Date().toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  doc.text(`Generado: ${fechaGen}`, 105, yPos, { align: 'center' })

  if (datos.generadoPor) {
    yPos += 4
    doc.text(`Por: ${datos.generadoPor}`, 105, yPos, { align: 'center' })
  }

  yPos += 12

  // ============================================
  // 2. INFORMACIÓN DEL CLIENTE
  // ============================================

  yPos = addSection(doc, 'DATOS DEL CLIENTE', yPos)

  yPos = addDataRow(
    doc,
    'Nombre:',
    `${datos.cliente.nombres} ${datos.cliente.apellidos}`,
    yPos
  )
  yPos = addDataRow(doc, 'Cédula:', datos.cliente.cedula, yPos)

  if (datos.cliente.telefono) {
    yPos = addDataRow(doc, 'Teléfono:', datos.cliente.telefono, yPos)
  }
  if (datos.cliente.email) {
    yPos = addDataRow(doc, 'Email:', datos.cliente.email, yPos)
  }

  yPos += 6

  // ============================================
  // 3. INFORMACIÓN DE LA VIVIENDA
  // ============================================

  yPos = checkPageBreak(doc, yPos)
  yPos = addSection(doc, 'DETALLES DE LA VIVIENDA', yPos)

  yPos = addDataRow(doc, 'Proyecto:', datos.vivienda.proyecto, yPos)
  if (datos.vivienda.manzana) {
    yPos = addDataRow(doc, 'Manzana:', datos.vivienda.manzana, yPos)
  }
  yPos = addDataRow(doc, 'Vivienda:', datos.vivienda.numeroVivienda, yPos)
  if (datos.vivienda.tipo) {
    yPos = addDataRow(doc, 'Tipo:', datos.vivienda.tipo, yPos)
  }

  yPos += 6

  // ============================================
  // 4. RESUMEN FINANCIERO
  // ============================================

  yPos = checkPageBreak(doc, yPos, 80)
  yPos = addSection(doc, 'RESUMEN FINANCIERO', yPos)

  yPos = addDataRow(
    doc,
    'Valor Base:',
    `$${datos.negociacion.valorBase.toLocaleString('es-CO')}`,
    yPos,
    { align: 'right' }
  )

  yPos = addDataRow(
    doc,
    'Descuento:',
    datos.negociacion.descuento > 0
      ? `-$${datos.negociacion.descuento.toLocaleString('es-CO')}`
      : 'N/A',
    yPos,
    {
      align: 'right',
      color:
        datos.negociacion.descuento > 0
          ? COLORES.warning
          : COLORES.textSecondary,
    }
  )

  // Separador
  doc.setDrawColor(...COLORES.border)
  doc.setLineWidth(0.3)
  doc.line(14, yPos, 196, yPos)
  yPos += 4

  yPos = addDataRow(
    doc,
    'VALOR FINAL:',
    `$${datos.negociacion.valorFinal.toLocaleString('es-CO')}`,
    yPos,
    { align: 'right', bold: true }
  )

  yPos += 4

  yPos = addDataRow(
    doc,
    'Total pagado:',
    `$${datos.negociacion.totalPagado.toLocaleString('es-CO')}`,
    yPos,
    { align: 'right', color: COLORES.success }
  )

  yPos = addDataRow(
    doc,
    'Saldo pendiente:',
    `$${datos.negociacion.saldoPendiente.toLocaleString('es-CO')}`,
    yPos,
    { align: 'right', color: COLORES.primary }
  )

  // Separador
  doc.line(14, yPos, 196, yPos)
  yPos += 4

  yPos = addDataRow(
    doc,
    'PORCENTAJE DE PAGO:',
    `${datos.negociacion.porcentajePagado.toFixed(1)}%`,
    yPos,
    { align: 'right', bold: true, color: COLORES.primary }
  )

  yPos += 8

  // ============================================
  // 5. FUENTES DE PAGO (Tabla)
  // ============================================

  yPos = checkPageBreak(doc, yPos, 60)
  yPos = addSection(doc, 'FUENTES DE PAGO', yPos)

  if (datos.fuentesPago.length === 0) {
    setFont(doc, 'body')
    doc.setTextColor(...COLORES.textSecondary)
    doc.text('Sin fuentes de pago configuradas', 14, yPos)
    yPos += 10
  } else {
    const fuentesData = datos.fuentesPago.map(f => [
      f.tipo,
      `$${f.monto.toLocaleString('es-CO')}`,
      f.entidad || 'N/A',
      `$${f.montoRecibido.toLocaleString('es-CO')}`,
      `${f.porcentajePagado.toFixed(0)}%`,
    ])

    autoTable(doc, {
      startY: yPos,
      head: [
        ['Tipo', 'Monto Config.', 'Entidad', 'Monto Recibido', '% Pagado'],
      ],
      body: fuentesData,
      theme: 'grid',
      headStyles: {
        fillColor: COLORES.primary,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      columnStyles: {
        1: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'center' },
      },
    })

    yPos = (doc as unknown as JsPDFWithAutoTable).lastAutoTable.finalY + 12
  }

  // ============================================
  // 6. HISTORIAL DE ABONOS (Tabla)
  // ============================================

  yPos = checkPageBreak(doc, yPos, 60)
  yPos = addSection(doc, 'HISTORIAL DE ABONOS', yPos)

  if (datos.abonos.length === 0) {
    setFont(doc, 'body')
    doc.setTextColor(...COLORES.textSecondary)
    doc.text('Sin abonos registrados', 14, yPos)

    if (
      datos.negociacion.diasDesdeUltimoAbono === null ||
      datos.negociacion.diasDesdeUltimoAbono === undefined
    ) {
      yPos += 5
      doc.setTextColor(...COLORES.warning)
      doc.text('⚠ Negociación activa sin pagos', 14, yPos)
    }

    yPos += 10
  } else {
    const abonosData = datos.abonos.map(a => [
      a.fecha,
      a.fuente,
      `$${a.monto.toLocaleString('es-CO')}`,
      a.metodoPago || 'N/A',
      a.numeroRecibo || 'N/A',
    ])

    autoTable(doc, {
      startY: yPos,
      head: [['Fecha', 'Fuente', 'Monto', 'Método Pago', 'Recibo']],
      body: abonosData,
      theme: 'striped',
      headStyles: {
        fillColor: COLORES.success,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: 25 },
        2: { halign: 'right' },
      },
    })

    yPos = (doc as unknown as JsPDFWithAutoTable).lastAutoTable.finalY + 12
  }

  // ============================================
  // 7. ESTADO Y OBSERVACIONES
  // ============================================

  yPos = checkPageBreak(doc, yPos, 50)
  yPos = addSection(doc, 'ESTADO DE LA NEGOCIACIÓN', yPos)

  yPos = addDataRow(doc, 'Estado actual:', datos.negociacion.estado, yPos, {
    color:
      datos.negociacion.estado === 'Activa'
        ? COLORES.success
        : COLORES.textSecondary,
    bold: true,
  })

  if (datos.negociacion.fechaInicio) {
    yPos = addDataRow(
      doc,
      'Fecha de inicio:',
      datos.negociacion.fechaInicio,
      yPos
    )
  }

  if (
    datos.negociacion.diasDesdeUltimoAbono !== null &&
    datos.negociacion.diasDesdeUltimoAbono !== undefined
  ) {
    const dias = datos.negociacion.diasDesdeUltimoAbono
    const color =
      dias === 0
        ? COLORES.success
        : dias <= 30
          ? COLORES.warning
          : COLORES.danger

    yPos = addDataRow(
      doc,
      'Último abono:',
      dias === 0 ? 'Hoy' : `Hace ${dias} día(s)`,
      yPos,
      { color }
    )
  } else {
    yPos = addDataRow(doc, 'Último abono:', 'Sin pagos registrados', yPos, {
      color: COLORES.textSecondary,
    })
  }

  // ============================================
  // 8. PIE DE PÁGINA (todas las páginas)
  // ============================================

  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)

    // Línea separadora
    doc.setDrawColor(...COLORES.border)
    doc.setLineWidth(0.3)
    doc.line(14, 285, 196, 285)

    // Texto pie de página
    setFont(doc, 'caption')
    doc.setTextColor(...COLORES.textSecondary)
    doc.text(
      'Este documento fue generado automáticamente por el sistema de gestión de Constructora RyR Ltda.',
      105,
      290,
      { align: 'center' }
    )

    // Número de página
    doc.text(`Página ${i} de ${totalPages}`, 196, 290, { align: 'right' })
  }

  // ============================================
  // GUARDAR ARCHIVO
  // ============================================

  const nombreArchivo = `Reporte_Negociacion_${datos.cliente.apellidos.replace(/\s+/g, '_')}_${getTodayDateString()}.pdf`
  doc.save(nombreArchivo)
}

// ============================================
// FUNCIÓN PREVIEW (para wizard pre-creación)
// ============================================

export interface DatosPreviewPDF {
  cliente: {
    nombres: string
    apellidos: string
    cedula?: string
  }
  vivienda: {
    proyecto: string
    manzana?: string
    numeroVivienda: string
  }
  valorBase: number
  descuento: number
  valorFinal: number
  fuentesPago: Array<{
    tipo: string
    monto: number
    entidad?: string
  }>
  notas?: string
}

/**
 * Generar PDF preview de negociación (antes de crear en BD)
 * Diseño simplificado con marca de agua "BORRADOR"
 */
export async function generarPDFPreview(datos: DatosPreviewPDF): Promise<void> {
  const doc = new jsPDF()

  let yPos = 20

  // ============================================
  // 1. ENCABEZADO CON MARCA DE AGUA BORRADOR
  // ============================================

  // Logo RyR
  try {
    doc.addImage(LOGO_RYR_BASE64, 'PNG', 15, 10, 35, 15)
  } catch {
    logger.warn('⚠️ [PDF Preview] No se pudo cargar el logo')
  }

  setFont(doc, 'title')
  doc.setTextColor(...COLORES.primary)
  doc.text('PREVIEW - NEGOCIACIÓN', 105, yPos, { align: 'center' })

  yPos += 8
  setFont(doc, 'caption')
  doc.setTextColor(...COLORES.warning)
  doc.text('🔸 BORRADOR - NO VÁLIDO PARA TRÁMITES 🔸', 105, yPos, {
    align: 'center',
  })

  yPos += 4
  doc.setTextColor(...COLORES.textSecondary)
  const fechaGen = new Date().toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  doc.text(`Generado: ${fechaGen}`, 105, yPos, { align: 'center' })

  yPos += 12

  // ============================================
  // 2. INFORMACIÓN DEL CLIENTE
  // ============================================

  yPos = addSection(doc, 'DATOS DEL CLIENTE', yPos)

  yPos = addDataRow(
    doc,
    'Nombre:',
    `${datos.cliente.nombres} ${datos.cliente.apellidos}`,
    yPos
  )

  if (datos.cliente.cedula) {
    yPos = addDataRow(doc, 'Cédula:', datos.cliente.cedula, yPos)
  }

  yPos += 6

  // ============================================
  // 3. INFORMACIÓN DE LA VIVIENDA
  // ============================================

  yPos = addSection(doc, 'DETALLES DE LA VIVIENDA', yPos)

  yPos = addDataRow(doc, 'Proyecto:', datos.vivienda.proyecto, yPos)
  if (datos.vivienda.manzana) {
    yPos = addDataRow(doc, 'Manzana:', datos.vivienda.manzana, yPos)
  }
  yPos = addDataRow(doc, 'Vivienda:', datos.vivienda.numeroVivienda, yPos)

  yPos += 6

  // ============================================
  // 4. RESUMEN FINANCIERO
  // ============================================

  yPos = addSection(doc, 'RESUMEN FINANCIERO', yPos)

  yPos = addDataRow(
    doc,
    'Valor Base:',
    `$${datos.valorBase.toLocaleString('es-CO')}`,
    yPos,
    { align: 'right' }
  )

  if (datos.descuento > 0) {
    yPos = addDataRow(
      doc,
      'Descuento:',
      `-$${datos.descuento.toLocaleString('es-CO')}`,
      yPos,
      { align: 'right', color: COLORES.warning }
    )
  }

  // Separador
  doc.setDrawColor(...COLORES.border)
  doc.setLineWidth(0.3)
  doc.line(14, yPos, 196, yPos)
  yPos += 4

  yPos = addDataRow(
    doc,
    'VALOR FINAL:',
    `$${datos.valorFinal.toLocaleString('es-CO')}`,
    yPos,
    { align: 'right', bold: true }
  )

  yPos += 8

  // ============================================
  // 5. FUENTES DE PAGO (Tabla)
  // ============================================

  yPos = addSection(doc, 'FUENTES DE PAGO', yPos)

  if (datos.fuentesPago.length === 0) {
    setFont(doc, 'body')
    doc.setTextColor(...COLORES.textSecondary)
    doc.text('Sin fuentes de pago configuradas', 14, yPos)
    yPos += 10
  } else {
    const fuentesData = datos.fuentesPago.map(f => [
      f.tipo,
      `$${f.monto.toLocaleString('es-CO')}`,
      f.entidad || 'N/A',
    ])

    autoTable(doc, {
      startY: yPos,
      head: [['Tipo', 'Monto Configurado', 'Entidad']],
      body: fuentesData,
      theme: 'grid',
      headStyles: {
        fillColor: COLORES.primary,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      columnStyles: {
        1: { halign: 'right' },
      },
    })

    yPos = (doc as unknown as JsPDFWithAutoTable).lastAutoTable.finalY + 12
  }

  // ============================================
  // 6. NOTAS (si existen)
  // ============================================

  if (datos.notas && datos.notas.trim()) {
    yPos = checkPageBreak(doc, yPos, 30)
    yPos = addSection(doc, 'NOTAS Y OBSERVACIONES', yPos)

    setFont(doc, 'body')
    doc.setTextColor(...COLORES.textPrimary)
    const splitNotas = doc.splitTextToSize(datos.notas, 182)
    doc.text(splitNotas, 14, yPos)
    yPos += splitNotas.length * 5 + 10
  }

  // ============================================
  // 7. MARCA DE AGUA DIAGONAL "BORRADOR"
  // ============================================

  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)

    // Marca de agua diagonal
    doc.saveGraphicsState()
    doc.setGState(new GState({ opacity: 0.1 }))
    doc.setTextColor(...COLORES.warning)
    doc.setFontSize(60)
    doc.setFont('helvetica', 'bold')
    doc.text('BORRADOR', 105, 150, {
      align: 'center',
      angle: 45,
    })
    doc.restoreGraphicsState()

    // Pie de página
    doc.setDrawColor(...COLORES.border)
    doc.setLineWidth(0.3)
    doc.line(14, 285, 196, 285)

    setFont(doc, 'caption')
    doc.setTextColor(...COLORES.textSecondary)
    doc.text(
      'Preview generado por el sistema de gestión de Constructora RyR Ltda.',
      105,
      290,
      { align: 'center' }
    )

    doc.text(`Página ${i} de ${totalPages}`, 196, 290, { align: 'right' })
  }

  // ============================================
  // GUARDAR ARCHIVO
  // ============================================

  const nombreArchivo = `Preview_Negociacion_${datos.cliente.apellidos.replace(/\s+/g, '_')}_${getTodayDateString()}.pdf`
  doc.save(nombreArchivo)
}
