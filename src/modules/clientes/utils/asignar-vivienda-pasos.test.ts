import { describe, expect, it } from 'vitest'

import type { TipoFuentePagoConCampos } from '@/modules/configuracion/types/campos-dinamicos.types'

import type { FuentePagoConfiguracion } from '../components/asignar-vivienda/types'

import {
  erroresDeFuentes,
  problemasPaso1,
  problemasPasoFuentes,
} from './asignar-vivienda-validaciones'

const pesos = (v: number) => `$${v.toLocaleString('es-CO')}`

interface CampoPrueba {
  nombre: string
  rol: string
  tipo: string
  requerido: boolean
  label: string
}

const tipo = (nombre: string, campos: CampoPrueba[], generaCuotas = false) =>
  ({
    nombre,
    configuracion_campos: {
      campos: campos.map((c, i) => ({ ...c, orden: i })),
    },
    logica_negocio: generaCuotas ? { genera_cuotas: true } : null,
  }) as unknown as TipoFuentePagoConCampos

const MONTO: CampoPrueba = {
  nombre: 'monto_aprobado',
  rol: 'monto',
  tipo: 'currency',
  requerido: true,
  label: 'Monto',
}

const TIPOS = [
  tipo('Cuota Inicial', [MONTO]),
  tipo('Crédito Hipotecario', [
    MONTO,
    {
      nombre: 'entidad',
      rol: 'entidad',
      tipo: 'select_banco',
      requerido: true,
      label: 'Banco',
    },
    {
      nombre: 'numero_referencia',
      rol: 'referencia',
      tipo: 'text',
      requerido: true,
      label: 'Referencia',
    },
  ]),
  tipo('Subsidio Caja Compensación', [
    MONTO,
    {
      nombre: 'fecha_acta',
      rol: 'informativo',
      tipo: 'date',
      requerido: true,
      label: 'Fecha del acta',
    },
  ]),
  tipo('Crédito con la Constructora', [], true),
]

const fuente = (
  t: string,
  campos: Record<string, string | number> | null
): FuentePagoConfiguracion =>
  ({
    tipo: t,
    enabled: true,
    config: campos
      ? { tipo: t, campos, monto_aprobado: Number(campos.monto_aprobado ?? 0) }
      : null,
  }) as unknown as FuentePagoConfiguracion

describe('problemasPasoFuentes (el caso que pasaba sin aviso)', () => {
  it('cuota inicial de 12,8 M sobre 128 M: dice cuánto falta', () => {
    const fuentes = [fuente('Cuota Inicial', { monto_aprobado: 12_800_000 })]
    const p = problemasPasoFuentes({
      fuentesEnUso: 1,
      diferencia: 115_200_000,
      valorTotal: 128_000_000,
      errores: erroresDeFuentes(fuentes, TIPOS),
      formatear: pesos,
    })
    expect(p).toHaveLength(1)
    expect(p[0]).toContain('Faltan $115.200.000')
    expect(p[0]).toContain('$128.000.000')
  })

  it('sin fuentes pide agregar una', () => {
    expect(
      problemasPasoFuentes({
        fuentesEnUso: 0,
        diferencia: 100,
        valorTotal: 100,
        errores: {},
        formatear: pesos,
      })
    ).toEqual(['Agrega al menos una fuente de pago.'])
  })

  it('si sobra dinero se permite (excedente para devolver)', () => {
    expect(
      problemasPasoFuentes({
        fuentesEnUso: 2,
        diferencia: -5_000_000,
        valorTotal: 100,
        errores: {},
        formatear: pesos,
      })
    ).toEqual([])
  })
})

describe('erroresDeFuentes', () => {
  it('una fuente agregada sin monto no pasa', () => {
    expect(
      erroresDeFuentes([fuente('Cuota Inicial', { monto_aprobado: 0 })], TIPOS)
    ).toEqual({ 'Cuota Inicial': 'Indica el monto de esta fuente' })
  })

  it('pide los campos obligatorios de la configuración, no solo entidad', () => {
    const e = erroresDeFuentes(
      [
        fuente('Crédito Hipotecario', {
          monto_aprobado: 80_000_000,
          entidad: 'Bancolombia',
        }),
        fuente('Subsidio Caja Compensación', {
          monto_aprobado: 20_000_000,
          fecha_acta: '',
        }),
      ],
      TIPOS
    )
    expect(e['Crédito Hipotecario']).toBe('Falta: Referencia')
    expect(e['Subsidio Caja Compensación']).toBe('Falta: Fecha del acta')
  })

  it('fuente completa sin errores; las apagadas no cuentan', () => {
    const apagada = { ...fuente('Cuota Inicial', null), enabled: false }
    expect(
      erroresDeFuentes(
        [
          apagada,
          fuente('Crédito Hipotecario', {
            monto_aprobado: 1,
            entidad: 'Bancolombia',
            numero_referencia: 'SIB-1',
          }),
        ],
        TIPOS
      )
    ).toEqual({})
  })

  it('crédito con la constructora sin configurar', () => {
    expect(
      erroresDeFuentes([fuente('Crédito con la Constructora', null)], TIPOS)
    ).toEqual({
      'Crédito con la Constructora':
        'Completa el monto y las condiciones del crédito',
    })
  })
})

describe('problemasPaso1', () => {
  const base = {
    viviendaId: 'v1',
    valorBase: 100_000_000,
    valorEscritura: 100_000_000,
    aplicarDescuento: false,
    descuento: 0,
    hoy: '2026-11-20',
  }

  it('todo bien: sin problemas', () => {
    expect(problemasPaso1(base)).toEqual([])
  })

  it('sin vivienda', () => {
    expect(
      problemasPaso1({ ...base, viviendaId: '' }).map(p => p.campo)
    ).toEqual(['vivienda_id'])
  })

  it('descuento activado e incompleto: los tres problemas a la vez', () => {
    expect(
      problemasPaso1({
        ...base,
        aplicarDescuento: true,
        motivoDescuento: 'corto',
      }).map(p => p.campo)
    ).toEqual(['descuento_aplicado', 'tipo_descuento', 'motivo_descuento'])
  })

  it('descuento igual al valor de la casa', () => {
    const p = problemasPaso1({
      ...base,
      aplicarDescuento: true,
      descuento: 100_000_000,
      tipoDescuento: 'comercial',
      motivoDescuento: 'Promoción de feria aprobada',
    })
    expect(p).toHaveLength(1)
    expect(p[0].campo).toBe('descuento_aplicado')
  })

  it('fecha futura no; la de hoy sí', () => {
    expect(
      problemasPaso1({ ...base, fechaNegociacion: '2026-11-21' })[0]?.campo
    ).toBe('fecha_negociacion')
    expect(problemasPaso1({ ...base, fechaNegociacion: '2026-11-20' })).toEqual(
      []
    )
  })

  it('sin valor en escritura', () => {
    expect(problemasPaso1({ ...base, valorEscritura: 0 })[0]?.campo).toBe(
      'valor_escritura_publica'
    )
  })
})
