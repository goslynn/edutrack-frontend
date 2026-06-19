import { describe, expect, it } from 'vitest'
import {
  fmtDate,
  fmtDateTime,
  fmtGrade,
  gradeVariant,
  parseGrade,
  round1,
  scoreValid,
  studentName,
  weightedAverage,
} from './calificaciones-meta'
import type { Evaluation, Grade, RosterStudent } from '@/types/calificaciones'

describe('round1', () => {
  it('redondea a 1 decimal (HALF_UP)', () => {
    expect(round1(5.85)).toBe(5.9)
    expect(round1(5.84)).toBe(5.8)
    expect(round1(4)).toBe(4)
  })
})

describe('scoreValid', () => {
  it('acepta notas dentro de [1,7]', () => {
    expect(scoreValid(1)).toBe(true)
    expect(scoreValid(7)).toBe(true)
    expect(scoreValid(4.5)).toBe(true)
  })
  it('rechaza fuera de rango, null y NaN', () => {
    expect(scoreValid(0.9)).toBe(false)
    expect(scoreValid(7.1)).toBe(false)
    expect(scoreValid(null)).toBe(false)
    expect(scoreValid(undefined)).toBe(false)
    expect(scoreValid(NaN)).toBe(false)
  })
})

describe('fmtGrade', () => {
  it('formatea con coma chilena y 1 decimal', () => {
    expect(fmtGrade(5.9)).toBe('5,9')
    expect(fmtGrade(7)).toBe('7,0')
  })
  it('null/NaN → guion', () => {
    expect(fmtGrade(null)).toBe('—')
    expect(fmtGrade(NaN)).toBe('—')
  })
})

describe('parseGrade', () => {
  it('parsea coma y punto', () => {
    expect(parseGrade('5,9')).toBe(5.9)
    expect(parseGrade('5.9')).toBe(5.9)
  })
  it('vacío o null → null', () => {
    expect(parseGrade('')).toBeNull()
    expect(parseGrade('   ')).toBeNull()
    expect(parseGrade(null)).toBeNull()
  })
  it('texto inválido → null', () => {
    expect(parseGrade('abc')).toBeNull()
  })
})

describe('fmtDate', () => {
  it('ISO → DD-MM-YYYY', () => {
    expect(fmtDate('2026-06-18')).toBe('18-06-2026')
    expect(fmtDate('2026-06-18T10:00:00Z')).toBe('18-06-2026')
  })
  it('vacío → guion', () => {
    expect(fmtDate(null)).toBe('—')
    expect(fmtDate(undefined)).toBe('—')
  })
})

describe('fmtDateTime', () => {
  it('ISO datetime → DD-MM-YYYY HH:mm', () => {
    const out = fmtDateTime('2026-06-18T09:05:00')
    expect(out).toBe('18-06-2026 09:05')
  })
  it('vacío → guion', () => {
    expect(fmtDateTime(null)).toBe('—')
  })
})

describe('studentName', () => {
  it('concatena nombre y apellido', () => {
    const s = { id: '1', rut: '1-9', firstName: 'Ana', lastName: 'Soto' } as RosterStudent
    expect(studentName(s)).toBe('Ana Soto')
  })
})

describe('gradeVariant', () => {
  it('rojo bajo 4, verde sobre 6, primary entre medio', () => {
    expect(gradeVariant(3.9)).toBe('danger')
    expect(gradeVariant(4)).toBe('primary')
    expect(gradeVariant(5.9)).toBe('primary')
    expect(gradeVariant(6)).toBe('success')
    expect(gradeVariant(7)).toBe('success')
  })
})

describe('weightedAverage', () => {
  const evals: Evaluation[] = [
    { id: 'e1', subjectId: 's1', period: '2026-1', name: 'P1', evaluationDate: '2026-03-01', weight: 30, createdAt: '', updatedAt: '' },
    { id: 'e2', subjectId: 's1', period: '2026-1', name: 'P2', evaluationDate: '2026-04-01', weight: 70, createdAt: '', updatedAt: '' },
    { id: 'e3', subjectId: 's1', period: '2026-2', name: 'otro periodo', evaluationDate: '2026-08-01', weight: 50, createdAt: '', updatedAt: '' },
  ]
  const grades: Grade[] = [
    { id: 'g1', evaluationId: 'e1', studentId: 'a1', score: 5, createdAt: '', updatedAt: '' },
    { id: 'g2', evaluationId: 'e2', studentId: 'a1', score: 6, createdAt: '', updatedAt: '' },
    { id: 'g3', evaluationId: 'e1', studentId: 'a2', score: 3, createdAt: '', updatedAt: '' },
  ]

  it('calcula Σ(nota·peso)/Σ(peso) redondeado a 1 decimal', () => {
    // (5*30 + 6*70) / 100 = 5.7
    expect(weightedAverage('a1', 's1', '2026-1', grades, evals)).toEqual({ average: 5.7, gradeCount: 2 })
  })

  it('considera solo el periodo pedido', () => {
    expect(weightedAverage('a1', 's1', '2026-2', grades, evals)).toBeNull()
  })

  it('sin notas → null', () => {
    expect(weightedAverage('zzz', 's1', '2026-1', grades, evals)).toBeNull()
  })

  it('una sola nota usa su propio peso', () => {
    expect(weightedAverage('a2', 's1', '2026-1', grades, evals)).toEqual({ average: 3, gradeCount: 1 })
  })
})
