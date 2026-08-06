/**
 * Mapas de iconos y colores para cada tipo de evento de historial.
 */

import {
  AlertCircle,
  ArrowDownToLine,
  ArrowRightLeft,
  CheckCircle,
  CheckCircle2,
  DollarSign,
  Edit3,
  FileCheck,
  FileText,
  FileX,
  HandshakeIcon,
  Heart,
  HeartOff,
  RefreshCw,
  Trash2,
  Upload,
  UserCheck,
  UserPen,
  UserPlus,
  UserX,
  XCircle,
  type LucideIcon,
} from 'lucide-react'

import type { ColorEvento, TipoEventoHistorial } from '../types/historial.types'

const ICONOS: Record<TipoEventoHistorial, LucideIcon> = {
  cliente_creado: UserPlus,
  cliente_actualizado: UserPen,
  cliente_eliminado: UserX,
  cliente_estado_cambiado: UserCheck,
  negociacion_creada: HandshakeIcon,
  negociacion_actualizada: RefreshCw,
  negociacion_estado_cambiada: RefreshCw,
  negociacion_completada: CheckCircle,
  traslado_vivienda: ArrowRightLeft,
  negociacion_traslado_interna: HandshakeIcon, // nunca se muestra, solo fallback
  negociacion_cerrada_traslado: ArrowRightLeft,
  abono_registrado: DollarSign,
  abono_editado: Edit3,
  abono_anulado: XCircle,
  renuncia_creada: FileText,
  renuncia_aprobada: FileCheck,
  renuncia_rechazada: FileX,
  renuncia_devolucion_procesada: CheckCircle2,
  excedente_devolucion_procesada: ArrowDownToLine,
  interes_registrado: Heart,
  nota_manual: Edit3,
  interes_actualizado: Edit3,
  interes_descartado: HeartOff,
  documento_subido: Upload,
  documento_actualizado: Edit3,
  documento_eliminado: Trash2,
  evento_generico: AlertCircle,
}

const COLORES: Record<TipoEventoHistorial, ColorEvento> = {
  // Verde: creación / positivo
  cliente_creado: 'green',
  negociacion_creada: 'green',
  negociacion_completada: 'green',
  traslado_vivienda: 'orange',
  negociacion_traslado_interna: 'gray', // nunca se muestra, solo fallback
  negociacion_cerrada_traslado: 'orange',
  abono_registrado: 'green',
  abono_editado: 'yellow',
  renuncia_aprobada: 'green',
  renuncia_devolucion_procesada: 'green',
  excedente_devolucion_procesada: 'yellow',
  documento_subido: 'green',
  interes_registrado: 'green',

  // Rojo: destrucción / negativo
  cliente_eliminado: 'red',
  abono_anulado: 'red',
  renuncia_rechazada: 'red',
  documento_eliminado: 'red',
  interes_descartado: 'red',

  // Amarillo: cambio neutral
  cliente_actualizado: 'yellow',
  cliente_estado_cambiado: 'yellow',
  negociacion_actualizada: 'yellow',
  negociacion_estado_cambiada: 'yellow',
  documento_actualizado: 'yellow',
  interes_actualizado: 'yellow',

  // Naranja: alerta estructural (renuncia siempre es alarma)
  renuncia_creada: 'orange',

  // Púrpura: notas manuales del equipo
  nota_manual: 'purple',

  // Gris: fallback genérico
  evento_generico: 'gray',
}

export function obtenerIcono(tipo: TipoEventoHistorial): LucideIcon {
  return ICONOS[tipo] ?? AlertCircle
}

export function obtenerColor(tipo: TipoEventoHistorial): ColorEvento {
  return COLORES[tipo] ?? 'gray'
}
