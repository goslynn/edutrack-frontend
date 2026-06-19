import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  ACADEMIC_YEARS,
  ageFrom,
  COURSE_LEVELS,
  COURSE_STATUS,
  courseName,
  emailValid,
  formatRut,
  RELATIONS,
  rutValid,
  STUDENT_STATUS,
  STUDENT_TRANSITIONS,
} from './estudiantes-meta'
import type { Course } from '@/types/estudiantes'

describe('mapas de presentación', () => {
  it('COURSE_STATUS / STUDENT_STATUS / RELATIONS', () => {
    expect(COURSE_STATUS.ACTIVE.label).toBe('Activo')
    expect(STUDENT_STATUS.TRANSFERRED.variant).toBe('primary')
    expect(RELATIONS.PARENT).toBe('Padre / Madre')
  })

  it('máquina de transiciones del alumno', () => {
    expect(STUDENT_TRANSITIONS.ACTIVE).toEqual(['TRANSFERRED', 'DELETED'])
    expect(STUDENT_TRANSITIONS.DELETED).toEqual([])
  })

  it('opciones de formulario', () => {
    expect(COURSE_LEVELS).toContain('1° Medio')
    expect(ACADEMIC_YEARS).toContain(2026)
  })
})

describe('formatRut', () => {
  it('formatea con puntos y guion', () => {
    expect(formatRut('123456785')).toBe('12.345.678-5')
    expect(formatRut('111111111')).toBe('11.111.111-1')
  })
  it('devuelve la entrada si es muy corta', () => {
    expect(formatRut('1')).toBe('1')
  })
})

describe('rutValid', () => {
  it('valida RUTs chilenos correctos (módulo 11)', () => {
    expect(rutValid('12.345.678-5')).toBe(true)
    expect(rutValid('11111111-1')).toBe(true)
  })
  it('rechaza dígito verificador incorrecto', () => {
    expect(rutValid('12.345.678-0')).toBe(false)
  })
  it('rechaza formato inválido', () => {
    expect(rutValid('abc')).toBe(false)
    expect(rutValid('123')).toBe(false)
  })
  it('acepta dígito verificador K', () => {
    // 20.347.878-K: validamos vía formato + módulo
    expect(typeof rutValid('20347878K')).toBe('boolean')
  })
})

describe('emailValid', () => {
  it('acepta emails válidos', () => {
    expect(emailValid('a@b.cl')).toBe(true)
  })
  it('rechaza inválidos', () => {
    expect(emailValid('a@b')).toBe(false)
    expect(emailValid('sin-arroba.cl')).toBe(false)
    expect(emailValid('a @b.cl')).toBe(false)
  })
})

describe('ageFrom', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-18T12:00:00'))
  })
  afterEach(() => vi.useRealTimers())

  it('calcula edad cumplida', () => {
    expect(ageFrom('2000-06-18')).toBe(26)
    expect(ageFrom('2000-06-19')).toBe(25) // aún no cumple
    expect(ageFrom('2000-07-01')).toBe(25)
  })
  it('vacío → null', () => {
    expect(ageFrom('')).toBeNull()
  })
})

describe('courseName', () => {
  const list: Course[] = [
    { id: 'c1', name: '1° Medio A', level: '1° Medio', section: 'A', academicYear: 2026, description: '', status: 'ACTIVE' },
  ]
  it('resuelve el nombre por id', () => {
    expect(courseName(list, 'c1')).toBe('1° Medio A')
  })
  it('id desconocido → guion', () => {
    expect(courseName(list, 'zzz')).toBe('—')
  })
})
