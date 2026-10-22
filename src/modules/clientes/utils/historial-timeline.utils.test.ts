import { Clock } from 'lucide-react'
import { describe, expect, it } from 'vitest'

import type { EventoHistorialHumanizado } from '../types/historial.types'

import {
  agruparPorDia,
  agruparRafagas,
  contarPorCategoria,
  calcularResumen,
  claveDiaLocal,
  esEventoVisible,
  filtrarEventos,
} from './historial-timeline.utils'

const evento = (
  parcial: Partial<EventoHistorialHumanizado>
): EventoHistorialHumanizado => ({
  id: Math.random().toString(36),
  tipo: 'cliente_actualizado',
  accion: 'UPDATE',
  tabla: 'clientes',
  titulo: 'Cliente actualizado',
  descripcion: '',
  fecha: new Date(2026, 9, 20, 10).toISOString(),
  usuario: { email: 'ana@ryr.co', nombres: 'Ana Pérez', rol: null },
  icono: Clock,
  color: 'blue',
  ...parcial,
})

describe('claveDiaLocal / agruparPorDia', () => {
  it('un evento a las 9 p. m. queda en su día local (no en el siguiente por UTC)', () => {
    const noche = new Date(2026, 9, 20, 21, 30)
    expect(claveDiaLocal(noche)).toBe('2026-10-20')
  })

  it('agrupa por día, del más reciente al más antiguo, con Hoy/Ayer', () => {
    const hoy = new Date(2026, 9, 22, 12)
    const grupos = agruparPorDia(
      [
        evento({ fecha: new Date(2026, 9, 22, 8).toISOString() }),
        evento({ fecha: new Date(2026, 9, 21, 22).toISOString() }),
        evento({ fecha: new Date(2026, 9, 21, 9).toISOString() }),
        evento({ fecha: new Date(2026, 8, 1, 9).toISOString() }),
      ],
      hoy
    )
    expect(grupos.map(g => [g.fechaFormateada, g.total])).toEqual([
      ['Hoy', 1],
      ['Ayer', 2],
      [expect.any(String), 1],
    ])
    expect(grupos[2].fecha).toBe('2026-09-01')
  })
})

describe('filtrarEventos', () => {
  const eventos = [
    evento({ tabla: 'clientes', titulo: 'Teléfono actualizado' }),
    evento({ tabla: 'abonos_historial', titulo: 'Abono registrado' }),
    evento({ tabla: 'notas', titulo: 'Llamada al cliente' }),
  ]

  it('filtra por categoría (tabla o notas)', () => {
    expect(
      filtrarEventos(eventos, { categoria: 'notas', busqueda: '' })
    ).toHaveLength(1)
    expect(
      filtrarEventos(eventos, { categoria: 'todos', busqueda: '' })
    ).toHaveLength(3)
  })

  it('busca en título y usuario sin distinguir mayúsculas', () => {
    expect(
      filtrarEventos(eventos, { categoria: 'todos', busqueda: 'ABONO' })
    ).toHaveLength(1)
    expect(
      filtrarEventos(eventos, { categoria: 'todos', busqueda: 'ana pérez' })
    ).toHaveLength(3)
  })
})

describe('esEventoVisible', () => {
  it('oculta ediciones de documento que solo anclan', () => {
    expect(
      esEventoVisible(
        evento({
          tipo: 'documento_actualizado',
          metadata: {
            tipo_operacion: 'edicion_documento',
            cambios: { es_importante: {}, anclado_at: {} },
          },
        })
      )
    ).toBe(false)
  })

  it('mantiene ediciones de documento con cambios reales', () => {
    expect(
      esEventoVisible(
        evento({
          tipo: 'documento_actualizado',
          metadata: {
            tipo_operacion: 'edicion_documento',
            cambios: { titulo: {}, es_importante: {} },
          },
        })
      )
    ).toBe(true)
  })
})

describe('calcularResumen', () => {
  it('cuenta semana, mes y críticos; primerEvento es el más antiguo', () => {
    const ahora = new Date(2026, 9, 22, 12)
    const r = calcularResumen(
      [
        evento({ fecha: new Date(2026, 9, 21).toISOString(), color: 'red' }),
        evento({ fecha: new Date(2026, 9, 2).toISOString() }),
        evento({
          fecha: new Date(2026, 7, 5).toISOString(),
          accion: 'DELETE',
        }),
      ],
      ahora
    )
    expect(r).toMatchObject({
      total: 3,
      estaSemana: 1,
      esteMes: 2,
      criticos: 2,
    })
    expect(r.primerEvento).toBe(new Date(2026, 7, 5).toISOString())
  })
})

describe('agruparRafagas', () => {
  const doc = (usuario = 'ana@ryr.co') =>
    evento({
      tipo: 'documento_subido',
      tabla: 'documentos_cliente',
      usuario: { email: usuario, nombres: null, rol: null },
    })

  it('agrupa 3 o más acciones iguales seguidas de la misma persona', () => {
    const items = agruparRafagas([doc(), doc(), doc(), doc(), evento({})])
    expect(items.map(i => i.tipo)).toEqual(['rafaga', 'evento'])
    expect(items[0].tipo === 'rafaga' && items[0].eventos).toHaveLength(4)
  })

  it('no agrupa si son menos de 3 o de otra persona', () => {
    const items = agruparRafagas([doc(), doc(), doc('otro@ryr.co')])
    expect(items.every(i => i.tipo === 'evento')).toBe(true)
  })

  it('las notas nunca se agrupan', () => {
    const nota = () => evento({ tabla: 'notas', tipo: 'nota_manual' })
    expect(agruparRafagas([nota(), nota(), nota()])).toHaveLength(3)
  })
})

describe('contarPorCategoria', () => {
  it('cuenta por tabla e incluye el total', () => {
    expect(
      contarPorCategoria([
        evento({ tabla: 'clientes' }),
        evento({ tabla: 'notas' }),
        evento({ tabla: 'notas' }),
      ])
    ).toEqual({ todos: 3, clientes: 1, notas: 2 })
  })
})
