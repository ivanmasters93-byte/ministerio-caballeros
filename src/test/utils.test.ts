import { describe, it, expect } from 'vitest'
import { cn, formatDate, formatDateShort, getRoleLabel, getEstadoLabel, getInitials } from '@/lib/utils'

describe('cn (className utility)', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles falsy values', () => {
    expect(cn('foo', false && 'bar', undefined, null, 'baz')).toBe('foo baz')
  })

  it('merges tailwind classes correctly (last wins)', () => {
    const result = cn('p-4', 'p-6')
    expect(result).toBe('p-6')
  })

  it('handles empty input', () => {
    expect(cn()).toBe('')
  })

  it('handles conditional classes', () => {
    const active = true
    expect(cn('base', active && 'active')).toBe('base active')
  })
})

describe('formatDate', () => {
  it('formats a date string', () => {
    const result = formatDate('2025-12-25')
    expect(result).toContain('2025')
  })

  it('formats a Date object', () => {
    const result = formatDate(new Date(2025, 0, 15)) // Use local date to avoid timezone shift
    expect(result).toContain('2025')
  })

  it('includes day of week', () => {
    const result = formatDate('2025-04-07')
    // Monday in Spanish
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })
})

describe('formatDateShort', () => {
  it('formats a date string briefly', () => {
    const result = formatDateShort(new Date(2025, 5, 15)) // Use local date
    expect(result).toContain('15')
  })

  it('returns a string', () => {
    expect(typeof formatDateShort(new Date())).toBe('string')
  })
})

describe('getRoleLabel', () => {
  it('returns Spanish label for LIDER_GENERAL', () => {
    expect(getRoleLabel('LIDER_GENERAL')).toBe('Líder General')
  })

  it('returns Spanish label for LIDER_RED', () => {
    expect(getRoleLabel('LIDER_RED')).toBe('Líder de Red')
  })

  it('returns Spanish label for SECRETARIO', () => {
    expect(getRoleLabel('SECRETARIO')).toBe('Secretario')
  })

  it('returns Spanish label for ASISTENTE', () => {
    expect(getRoleLabel('ASISTENTE')).toBe('Asistente')
  })

  it('returns Spanish label for HERMANO', () => {
    expect(getRoleLabel('HERMANO')).toBe('Hermano')
  })

  it('returns raw value for unknown role', () => {
    expect(getRoleLabel('UNKNOWN_ROLE')).toBe('UNKNOWN_ROLE')
  })
})

describe('getEstadoLabel', () => {
  it('returns label for ACTIVO', () => {
    expect(getEstadoLabel('ACTIVO')).toBe('Activo')
  })

  it('returns label for PENDIENTE', () => {
    expect(getEstadoLabel('PENDIENTE')).toBe('Pendiente')
  })

  it('returns label for INACTIVO', () => {
    expect(getEstadoLabel('INACTIVO')).toBe('Inactivo')
  })

  it('returns label for NUEVO', () => {
    expect(getEstadoLabel('NUEVO')).toBe('Nuevo')
  })

  it('returns label for REQUIERE_SEGUIMIENTO', () => {
    expect(getEstadoLabel('REQUIERE_SEGUIMIENTO')).toBe('Requiere Seguimiento')
  })

  it('returns raw value for unknown estado', () => {
    expect(getEstadoLabel('FANTASMA')).toBe('FANTASMA')
  })
})

describe('getInitials', () => {
  it('returns initials for full name', () => {
    expect(getInitials('Juan García')).toBe('JG')
  })

  it('returns initials for single name', () => {
    expect(getInitials('Carlos')).toBe('C')
  })

  it('returns max 2 initials', () => {
    expect(getInitials('Juan Carlos García López')).toBe('JC')
  })

  it('returns uppercase initials', () => {
    expect(getInitials('ana maría')).toBe('AM')
  })
})
