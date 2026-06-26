/**
 * Constantes compartidas para el sistema de descuentos en negociaciones.
 *
 * Usado tanto en:
 * - Formulario de asignar vivienda (crear negociación con descuento inicial)
 * - Tab de negociación activa (modificar descuento de negociación existente)
 *
 * ⚠️ FUENTE ÚNICA DE VERDAD para tipos de descuento.
 * El campo `negociaciones.tipo_descuento` es VARCHAR(50) sin CHECK constraint en BD,
 * pero debemos usar estos valores canónicos en toda la app.
 */

export const TIPOS_DESCUENTO = [
  'comercial',
  'pronto_pago',
  'referido',
  'promocional',
  'forma_pago',
  'condonacion',
  'otro',
] as const

export type TipoDescuento = (typeof TIPOS_DESCUENTO)[number]

export const LABELS_TIPO_DESCUENTO: Record<TipoDescuento, string> = {
  comercial: 'Descuento Comercial',
  pronto_pago: 'Descuento por Pronto Pago',
  referido: 'Descuento por Referido',
  promocional: 'Descuento Promocional',
  forma_pago: 'Descuento por Forma de Pago',
  condonacion: 'Condonación de Deuda',
  otro: 'Otro',
}
