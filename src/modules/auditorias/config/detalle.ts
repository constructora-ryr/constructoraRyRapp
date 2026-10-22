/**
 * Qué mostrar en el detalle de cada tipo de registro: los campos principales
 * (lo demás va a "Datos técnicos"), cómo traducir referencias a nombres y
 * dónde está su archivo, si tiene.
 */

export type Referencia = 'usuario' | 'categoria'

export interface ArchivoConfig {
  /** Bucket de Storage, o 'comprobante' (se sirve por /api/abonos/comprobante) */
  bucket: string
  ruta: string
  nombre: string
  mime?: string
}

interface DetalleTabla {
  principales: string[]
  archivo?: ArchivoConfig
}

const DOCUMENTO = (bucket: string): DetalleTabla => ({
  principales: [
    'titulo',
    'categoria_id',
    'descripcion',
    'fecha_documento',
    'fecha_vencimiento',
    'es_importante',
    'estado',
    'subido_por',
  ],
  archivo: {
    bucket,
    ruta: 'url_storage',
    nombre: 'nombre_original',
    mime: 'tipo_mime',
  },
})

export const DETALLE: Record<string, DetalleTabla> = {
  documentos_cliente: DOCUMENTO('documentos-clientes'),
  documentos_vivienda: DOCUMENTO('documentos-viviendas'),
  documentos_proyecto: DOCUMENTO('documentos-proyectos'),
  abonos_historial: {
    principales: [
      'numero_recibo',
      'monto',
      'fecha_abono',
      'metodo_pago',
      'numero_referencia',
      'notas',
      'estado',
      'motivo_categoria',
      'motivo_detalle',
      'usuario_registro',
    ],
    archivo: {
      bucket: 'comprobante',
      ruta: 'comprobante_url',
      nombre: 'comprobante_url',
    },
  },
  clientes: {
    principales: [
      'nombres',
      'apellidos',
      'tipo_documento',
      'numero_documento',
      'telefono',
      'email',
      'ciudad',
      'direccion',
      'estado',
    ],
  },
  viviendas: {
    principales: [
      'numero',
      'estado',
      'valor_base',
      'gastos_notariales',
      'es_esquinera',
      'recargo_esquinera',
      'matricula_inmobiliaria',
      'nomenclatura',
      'area_lote',
      'area_construida',
      'tipo_vivienda',
      'fecha_entrega',
    ],
  },
  negociaciones: {
    principales: [
      'estado',
      'valor_negociado',
      'descuento_aplicado',
      'valor_total_pagar',
      'notas',
    ],
  },
  fuentes_pago: {
    principales: ['tipo', 'entidad', 'monto_aprobado', 'estado'],
  },
  renuncias: {
    principales: ['estado', 'motivo', 'monto_a_devolver', 'notas'],
  },
  usuarios: {
    principales: ['nombres', 'apellidos', 'email', 'rol', 'estado'],
  },
  permisos_rol: {
    principales: ['rol', 'modulo', 'accion', 'permitido'],
  },
  proyectos: {
    principales: ['nombre', 'estado', 'ubicacion', 'descripcion'],
  },
  manzanas: {
    principales: ['nombre', 'numero_viviendas'],
  },
  configuracion_recargos: {
    principales: ['nombre', 'tipo', 'valor', 'activo'],
  },
}

/** Campos que guardan un id y cómo se muestran como nombre */
export const REFERENCIAS: Record<string, Referencia> = {
  subido_por: 'usuario',
  eliminado_por: 'usuario',
  usuario_registro: 'usuario',
  usuario_creacion: 'usuario',
  creado_por: 'usuario',
  actualizado_por: 'usuario',
  anulado_por_id: 'usuario',
  categoria_id: 'categoria',
}

/** Campos que se ven en el encabezado o no aportan, ni en técnicos */
export const CAMPOS_SIN_VALOR = new Set(['metadata'])

export const tamanoLegible = (bytes: unknown) => {
  const n = Number(bytes)
  if (!n) return null
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}
