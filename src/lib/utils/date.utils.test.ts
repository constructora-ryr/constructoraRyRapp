import { describe, expect, it } from 'vitest'

import {
  esFechaCalendario,
  formatDateCompact,
  formatDateForDB,
  formatDateForInput,
  formatDateShort,
  formatDateToISO,
  formatearDiaGuardado,
  getTodayDateString,
} from './date.utils'

// ============================================================
// formatDateForDB
// ============================================================

describe('formatDateForDB', () => {
  it('agrega T12:00:00 a fecha YYYY-MM-DD', () => {
    expect(formatDateForDB('2025-10-23')).toBe('2025-10-23T12:00:00')
  })

  it('retorna string vacío para string vacío', () => {
    expect(formatDateForDB('')).toBe('')
  })

  it('no modifica si ya tiene hora (contiene T)', () => {
    expect(formatDateForDB('2025-10-23T12:00:00')).toBe('2025-10-23T12:00:00')
  })

  it('no modifica timestamp ISO completo', () => {
    expect(formatDateForDB('2025-10-23T00:00:00Z')).toBe('2025-10-23T00:00:00Z')
  })
})

// ============================================================
// formatDateForInput
// ============================================================

describe('formatDateForInput', () => {
  it('retorna string vacío para string vacío', () => {
    expect(formatDateForInput('')).toBe('')
  })

  it('retorna YYYY-MM-DD sin cambios cuando ya está en ese formato', () => {
    expect(formatDateForInput('2025-10-23')).toBe('2025-10-23')
  })

  it('extrae YYYY-MM-DD de timestamp ISO', () => {
    expect(formatDateForInput('2025-10-23T12:00:00')).toBe('2025-10-23')
  })

  it('extrae YYYY-MM-DD de timestamp UTC con Z', () => {
    expect(formatDateForInput('2025-10-24T00:00:00Z')).toBe('2025-10-24')
  })
})

// ============================================================
// formatDateShort
// ============================================================

describe('formatDateShort', () => {
  it('retorna string vacío para string vacío', () => {
    expect(formatDateShort('')).toBe('')
  })

  it('formatea YYYY-MM-DD a dd/MM/yyyy', () => {
    expect(formatDateShort('2025-10-23')).toBe('23/10/2025')
  })

  it('formatea timestamp ISO a dd/MM/yyyy sin timezone shift', () => {
    expect(formatDateShort('2025-01-05T12:00:00')).toBe('05/01/2025')
  })

  it('rellena con cero días y meses de un dígito', () => {
    expect(formatDateShort('2025-03-07')).toBe('07/03/2025')
  })
})

// ============================================================
// formatDateCompact
// ============================================================

describe('formatDateCompact', () => {
  it('retorna string vacío para string vacío', () => {
    expect(formatDateCompact('')).toBe('')
  })

  it('formatea correctamente a dd MMM yyyy', () => {
    expect(formatDateCompact('2023-02-16')).toBe('16 feb 2023')
  })

  it('usa abreviaciones correctas para todos los meses', () => {
    const meses = [
      'ene',
      'feb',
      'mar',
      'abr',
      'may',
      'jun',
      'jul',
      'ago',
      'sep',
      'oct',
      'nov',
      'dic',
    ]
    meses.forEach((abr, i) => {
      const mes = String(i + 1).padStart(2, '0')
      expect(formatDateCompact(`2025-${mes}-15`)).toBe(`15 ${abr} 2025`)
    })
  })

  it('no sufre timezone shift con timestamp T12:00:00', () => {
    expect(formatDateCompact('2025-10-26T12:00:00')).toBe('26 oct 2025')
  })
})

// ============================================================
// getTodayDateString
// ============================================================

describe('getTodayDateString', () => {
  it('retorna fecha en formato YYYY-MM-DD', () => {
    const result = getTodayDateString()
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('no retorna una fecha futurista ni pasada (dentro de ±1 día)', () => {
    const result = getTodayDateString()
    const today = new Date()
    const resultDate = new Date(result + 'T12:00:00')
    const diffMs = Math.abs(resultDate.getTime() - today.getTime())
    const diffDays = diffMs / (1000 * 60 * 60 * 24)
    expect(diffDays).toBeLessThan(1)
  })
})

// ============================================================
// formatDateToISO
// ============================================================

describe('formatDateToISO', () => {
  it('convierte YYYY-MM-DD a ISO con T12:00:00', () => {
    expect(formatDateToISO('2025-10-28')).toBe('2025-10-28T12:00:00')
  })

  it('extrae fecha de ISO completo y agrega T12:00:00', () => {
    expect(formatDateToISO('2025-10-28T08:00:00Z')).toBe('2025-10-28T12:00:00')
  })

  it('maneja objeto Date usando componentes locales', () => {
    // Crear fecha con hora de mediodía para evitar timezone issues en el test
    const date = new Date('2025-11-05T12:00:00')
    const result = formatDateToISO(date)
    expect(result).toMatch(/^2025-11-05T12:00:00$/)
  })
})

describe('fechas de calendario (sin correrse un día)', () => {
  it('reconoce día solo, medianoche y mediodía como calendario', () => {
    expect(esFechaCalendario('2026-07-31')).toBe(true)
    expect(esFechaCalendario('2026-07-31T00:00:00+00:00')).toBe(true)
    expect(esFechaCalendario('2026-07-31T12:00:00')).toBe(true)
    expect(esFechaCalendario('2026-07-31 12:00:00+00')).toBe(true)
    expect(esFechaCalendario('2026-10-27T13:09:42.123+00:00')).toBe(false)
  })

  it('la medianoche UTC del 31 se muestra como 31, no 30', () => {
    expect(formatearDiaGuardado('2026-07-31T00:00:00+00:00')).toBe(
      formatearDiaGuardado('2026-07-31')
    )
    expect(formatearDiaGuardado('2026-07-31T00:00:00+00:00')).toContain('31')
  })

  it('un texto que no es fecha se devuelve tal cual', () => {
    expect(formatearDiaGuardado('2026-99-99')).toBe('2026-99-99')
  })
})
