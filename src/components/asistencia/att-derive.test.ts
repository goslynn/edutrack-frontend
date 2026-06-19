import { describe, expect, it } from 'vitest'
import { freshMarks, nowTime, statusMap, summ, summarize } from './att-derive'
import type { Marks, Student } from '@/types/asistencia'

const students: Student[] = [
  { n: 1, first: 'Ana', last: 'Soto', name: 'Soto, Ana', rut: '1-9' },
  { n: 2, first: 'Beto', last: 'Lara', name: 'Lara, Beto', rut: '2-7' },
  { n: 3, first: 'Cleo', last: 'Vera', name: 'Vera, Cleo', rut: '3-5' },
  { n: 4, first: 'Dina', last: 'Rojo', name: 'Rojo, Dina', rut: '4-3' },
]

describe('statusMap', () => {
  it('marca todos presentes y aplica las excepciones', () => {
    const m = statusMap({ at: [2], au: [3], ju: [4] }, students)
    expect(m).toEqual({ 1: 'presente', 2: 'atrasado', 3: 'ausente', 4: 'justificado' })
  })
})

describe('summarize', () => {
  it('cuenta excepciones y calcula % (presentes + atrasados)', () => {
    const s = summarize({ at: [2], au: [3], ju: [4] }, 4)
    expect(s).toEqual({ total: 4, presente: 1, atrasado: 1, ausente: 1, justificado: 1, pct: 50 })
  })
})

describe('summ', () => {
  it('cuenta desde un mapa de marcas', () => {
    const marks: Marks = { 1: 'presente', 2: 'presente', 3: 'ausente', 4: 'atrasado' }
    expect(summ(marks, 4)).toEqual({ total: 4, presente: 2, atrasado: 1, ausente: 1, justificado: 0, pct: 75 })
  })
})

describe('freshMarks', () => {
  it('inicializa a todos presentes', () => {
    expect(freshMarks(students)).toEqual({ 1: 'presente', 2: 'presente', 3: 'presente', 4: 'presente' })
  })
})

describe('nowTime', () => {
  it('devuelve HH:MM con cero a la izquierda', () => {
    expect(nowTime()).toMatch(/^\d{2}:\d{2}$/)
  })
})
