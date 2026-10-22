/**
 * Cómo se presenta cada evento: nombre de cada tabla vigilada, verbo de cada
 * acción, grupos para filtrar y nombres legibles de los campos.
 * Es la única "traducción" del módulo: lo demás (la etiqueta del registro)
 * ya viene armado desde la base de datos.
 */

import type { LucideIcon } from 'lucide-react'
import {
  Building2,
  FileText,
  Grid3x3,
  Handshake,
  Home,
  KeyRound,
  Landmark,
  Settings,
  UserCog,
  Users,
  Wallet,
  XCircle,
} from 'lucide-react'

import type { AccionAuditoria } from '../types'

interface InfoTabla {
  /** Con artículo, para la frase: "editó el abono" */
  nombre: string
  icon: LucideIcon
  /** Degradado del ícono (strings completos para Tailwind) */
  color: string
}

export const TABLAS: Record<string, InfoTabla> = {
  abonos_historial: {
    nombre: 'el abono',
    icon: Wallet,
    color: 'from-violet-500 to-fuchsia-600',
  },
  negociaciones: {
    nombre: 'la negociación',
    icon: Handshake,
    color: 'from-pink-500 to-purple-600',
  },
  fuentes_pago: {
    nombre: 'la fuente de pago',
    icon: Landmark,
    color: 'from-indigo-500 to-blue-600',
  },
  clientes: {
    nombre: 'el cliente',
    icon: Users,
    color: 'from-cyan-500 to-blue-600',
  },
  viviendas: {
    nombre: 'la vivienda',
    icon: Home,
    color: 'from-orange-500 to-amber-500',
  },
  documentos_cliente: {
    nombre: 'el documento',
    icon: FileText,
    color: 'from-sky-500 to-indigo-600',
  },
  documentos_vivienda: {
    nombre: 'el documento de vivienda',
    icon: FileText,
    color: 'from-sky-500 to-indigo-600',
  },
  documentos_proyecto: {
    nombre: 'el documento de proyecto',
    icon: FileText,
    color: 'from-sky-500 to-indigo-600',
  },
  renuncias: {
    nombre: 'la renuncia',
    icon: XCircle,
    color: 'from-red-500 to-rose-600',
  },
  usuarios: {
    nombre: 'el usuario',
    icon: UserCog,
    color: 'from-slate-500 to-slate-700',
  },
  permisos_rol: {
    nombre: 'el permiso',
    icon: KeyRound,
    color: 'from-slate-500 to-slate-700',
  },
  proyectos: {
    nombre: 'el proyecto',
    icon: Building2,
    color: 'from-green-500 to-emerald-600',
  },
  manzanas: {
    nombre: 'la manzana',
    icon: Grid3x3,
    color: 'from-green-500 to-emerald-600',
  },
  configuracion_recargos: {
    nombre: 'la configuración de valores',
    icon: Settings,
    color: 'from-amber-500 to-orange-600',
  },
}

export const infoTabla = (tabla: string): InfoTabla =>
  TABLAS[tabla] ?? {
    nombre: tabla,
    icon: FileText,
    color: 'from-slate-400 to-slate-600',
  }

/** Grupos del filtro "Qué" → tablas que incluye */
export const GRUPOS: { id: string; label: string; tablas: string[] }[] = [
  { id: 'abonos', label: 'Abonos', tablas: ['abonos_historial'] },
  {
    id: 'negociaciones',
    label: 'Negociaciones',
    tablas: ['negociaciones', 'fuentes_pago', 'renuncias'],
  },
  { id: 'clientes', label: 'Clientes', tablas: ['clientes'] },
  {
    id: 'documentos',
    label: 'Documentos',
    tablas: [
      'documentos_cliente',
      'documentos_vivienda',
      'documentos_proyecto',
    ],
  },
  {
    id: 'viviendas',
    label: 'Viviendas y proyectos',
    tablas: ['viviendas', 'manzanas', 'proyectos', 'configuracion_recargos'],
  },
  { id: 'usuarios', label: 'Usuarios', tablas: ['usuarios', 'permisos_rol'] },
]

export const ACCIONES: Record<
  AccionAuditoria,
  { verbo: string; label: string; badge: string; punto: string }
> = {
  CREAR: {
    verbo: 'registró',
    label: 'Creación',
    badge:
      'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30',
    punto: 'bg-emerald-500',
  },
  EDITAR: {
    verbo: 'editó',
    label: 'Edición',
    badge:
      'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30',
    punto: 'bg-amber-500',
  },
  ELIMINAR: {
    verbo: 'eliminó',
    label: 'Eliminación',
    badge:
      'bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/30',
    punto: 'bg-red-500',
  },
}

/** Campos técnicos que no aportan al leer un evento */
export const CAMPOS_OCULTOS = new Set([
  'id',
  'fecha_creacion',
  'created_at',
  'metadata',
  'url_storage',
  'version',
  'es_version_actual',
  'documento_padre_id',
  'search_vector',
])

/** Nombres legibles; lo que no esté aquí se muestra "bonito" desde el nombre */
const NOMBRES_CAMPOS: Record<string, string> = {
  fecha_abono: 'Fecha del abono',
  monto: 'Monto',
  metodo_pago: 'Método de pago',
  numero_referencia: 'Referencia',
  numero_recibo: 'Recibo',
  comprobante_url: 'Comprobante',
  notas: 'Notas',
  estado: 'Estado',
  motivo_categoria: 'Motivo',
  motivo_detalle: 'Detalle del motivo',
  valor_base: 'Valor base',
  valor_total: 'Valor total',
  valor_total_pagar: 'Total a pagar',
  valor_negociado: 'Valor negociado',
  descuento_aplicado: 'Descuento',
  monto_aprobado: 'Monto aprobado',
  gastos_notariales: 'Gastos notariales',
  recargo_esquinera: 'Recargo esquinera',
  es_esquinera: 'Esquinera',
  matricula_inmobiliaria: 'Matrícula',
  nomenclatura: 'Nomenclatura',
  area_lote: 'Área del lote',
  area_construida: 'Área construida',
  numero_documento: 'Documento',
  tipo_documento: 'Tipo de documento',
  nombres: 'Nombres',
  apellidos: 'Apellidos',
  telefono: 'Teléfono',
  email: 'Correo',
  titulo: 'Título',
  categoria_id: 'Categoría',
  fecha_vencimiento: 'Vencimiento',
  rol: 'Rol',
  permitido: 'Permitido',
  entidad: 'Entidad',
  tipo: 'Tipo',
  fecha_entrega: 'Fecha de escritura',
  cliente_id: 'Cliente',
  vivienda_id: 'Vivienda',
  negociacion_id: 'Negociación',
}

export const nombreCampo = (campo: string) =>
  NOMBRES_CAMPOS[campo] ??
  campo.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())

const ES_DINERO =
  /^(monto|valor|precio|saldo|descuento|gastos|recargo|cuota|capital|interes)/
const ES_FECHA = /^\d{4}-\d{2}-\d{2}(T|$)/
const ES_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const formatoPesos = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

/** Valor legible: pesos, fechas, Sí/No, vacío */
export function formatearValor(campo: string, valor: unknown): string {
  if (valor === null || valor === undefined || valor === '') return 'vacío'
  if (typeof valor === 'boolean') return valor ? 'Sí' : 'No'
  // Referencias internas: no aportan leídas completas
  if (typeof valor === 'string' && ES_UUID.test(valor))
    return `ID ${valor.slice(0, 8)}`
  if (typeof valor === 'number' || /^-?\d+(\.\d+)?$/.test(String(valor))) {
    const n = Number(valor)
    return ES_DINERO.test(campo) ? formatoPesos.format(n) : String(n)
  }
  if (typeof valor === 'string' && ES_FECHA.test(valor)) {
    const fecha = new Date(valor.length === 10 ? `${valor}T12:00:00` : valor)
    return fecha.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      ...(valor.length > 10 && !valor.includes('T12:00:00')
        ? { hour: '2-digit', minute: '2-digit' }
        : {}),
    })
  }
  if (typeof valor === 'object') return JSON.stringify(valor)
  return String(valor)
}
