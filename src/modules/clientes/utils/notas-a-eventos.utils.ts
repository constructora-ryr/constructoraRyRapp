/**
 * Utilidad para convertir notas manuales a formato de EventoHistorialHumanizado
 * Permite unificar notas + eventos automáticos en el mismo timeline
 */

import { Star, StickyNote } from 'lucide-react'

import type { EventoHistorialHumanizado } from '../types/historial.types'
import type { NotaHistorialConUsuario } from '../types/notas-historial.types'

/**
 * Convertir array de notas a eventos humanizados
 */
export function convertirNotasAEventos(
  notas: NotaHistorialConUsuario[]
): EventoHistorialHumanizado[] {
  return notas.map(nota => convertirNotaAEvento(nota))
}

/**
 * Convertir una nota individual a evento humanizado
 */
export function convertirNotaAEvento(
  nota: NotaHistorialConUsuario
): EventoHistorialHumanizado {
  const nombreCompleto = [nota.creador.nombres, nota.creador.apellidos]
    .filter(Boolean)
    .join(' ')

  return {
    id: `nota-${nota.id}`,
    tipo: 'nota_manual', // Tipo especial para notas
    accion: 'CREATE', // Notas siempre son tipo CREATE visualmente
    tabla: 'notas', // Tabla virtual para filtrado por categoría
    titulo: nota.titulo,
    descripcion: nota.contenido,
    fecha: nota.fecha_creacion,
    usuario: {
      id: nota.creado_por,
      email: nota.creador.email,
      nombres: nombreCompleto || nota.creador.email,
      rol: nota.creador.rol,
    },
    icono: nota.es_importante ? Star : StickyNote,
    color: nota.es_importante ? 'amber' : 'purple',
    metadata: {
      esNota: true,
      notaId: nota.id,
      creadoPor: nota.creado_por, // ✅ Para verificación sincrónica de permisos
      esImportante: nota.es_importante,
      actualizado: !!nota.fecha_actualizacion,
      fechaActualizacion: nota.fecha_actualizacion,
    },
  }
}
