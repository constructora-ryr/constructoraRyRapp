/**
 * ViviendaCard - Componente principal con renderizado condicional
 * Renderiza diferentes versiones según el estado de la vivienda
 */

import type { Vivienda } from '../types'

import { ViviendaCardAsignada } from './cards/vivienda-card-asignada'
import { ViviendaCardDisponible } from './cards/vivienda-card-disponible'
import { ViviendaCardEntregada } from './cards/vivienda-card-entregada'
import { ViviendaCardPagada } from './cards/vivienda-card-pagada'

interface ViviendaCardProps {
  vivienda: Vivienda
  onVerDetalle?: () => void
  onAsignarCliente?: () => void
  onVerAbonos?: () => void
  onRegistrarPago?: () => void
  onGenerarEscritura?: () => void
  onEditar?: () => void
  onEliminar?: () => void
}

/**
 * Componente inteligente que renderiza la card apropiada según el estado
 */
export function ViviendaCard({
  vivienda,
  onVerDetalle,
  onAsignarCliente,
  onVerAbonos,
  onRegistrarPago,
  onGenerarEscritura: _onGenerarEscritura,
  onEditar,
  onEliminar: _onEliminar,
}: ViviendaCardProps) {
  // Renderizado condicional según el estado
  switch (vivienda.estado) {
    case 'Disponible':
      return (
        <ViviendaCardDisponible
          vivienda={vivienda}
          onVerDetalle={onVerDetalle}
          onAsignarCliente={onAsignarCliente}
          onEditar={onEditar}
        />
      )

    case 'Asignada':
      return (
        <ViviendaCardAsignada
          vivienda={vivienda}
          onVerDetalle={onVerDetalle}
          onVerAbonos={onVerAbonos}
          onRegistrarPago={onRegistrarPago}
          onEditar={onEditar}
        />
      )

    case 'Entregada':
      return (
        <ViviendaCardEntregada
          vivienda={vivienda}
          onVerDetalle={onVerDetalle}
          onVerAbonos={onVerAbonos}
          onEditar={onEditar}
        />
      )

    case 'Propietario':
      return (
        <ViviendaCardPagada
          vivienda={vivienda}
          onVerAbonos={onVerAbonos}
          onEditar={onEditar}
        />
      )

    default:
      // Fallback a card disponible
      return (
        <ViviendaCardDisponible
          vivienda={vivienda}
          onVerDetalle={onVerDetalle}
          onAsignarCliente={onAsignarCliente}
          onEditar={onEditar}
        />
      )
  }
}
