import { describe, expect, it } from 'vitest'
import {
  domainMeta,
  domainOf,
  fmtBytes,
  fmtDateTime,
  formatCell,
  previewColumns,
  reportFilename,
  sortFormats,
} from './reportes-meta'

describe('domainOf', () => {
  it('extrae el prefijo antes del primer punto', () => {
    expect(domainOf('academico.rendimiento-curso')).toBe('academico')
    expect(domainOf('asistencia.resumen-mensual')).toBe('asistencia')
  })
  it('sin punto devuelve la clave completa', () => {
    expect(domainOf('standalone')).toBe('standalone')
  })
})

describe('domainMeta', () => {
  it('resuelve un dominio conocido', () => {
    expect(domainMeta('academico.rendimiento-curso').label).toBe('Académico')
  })
  it('degrada a un rótulo capitalizado para dominios desconocidos', () => {
    expect(domainMeta('finanzas.balance').label).toBe('Finanzas')
  })
})

describe('reportFilename', () => {
  it('arma <reportKey>.<ext>, igual que CsvRenderer/PdfRenderer', () => {
    expect(reportFilename('academico.rendimiento-curso', 'CSV')).toBe('academico.rendimiento-curso.csv')
    expect(reportFilename('estudiantes.ficha', 'PDF')).toBe('estudiantes.ficha.pdf')
  })
})

describe('previewColumns', () => {
  it('toma las claves de la primera fila', () => {
    expect(previewColumns([{ a: 1, b: 2 }, { a: 3, b: 4 }])).toEqual(['a', 'b'])
  })
  it('arreglo vacío → sin columnas', () => {
    expect(previewColumns([])).toEqual([])
  })
})

describe('formatCell', () => {
  it('null/undefined → guion', () => {
    expect(formatCell(null)).toBe('—')
    expect(formatCell(undefined)).toBe('—')
  })
  it('booleanos → Sí/No', () => {
    expect(formatCell(true)).toBe('Sí')
    expect(formatCell(false)).toBe('No')
  })
  it('otros valores → String(value)', () => {
    expect(formatCell(42)).toBe('42')
    expect(formatCell('hola')).toBe('hola')
  })
})

describe('fmtBytes', () => {
  it('bytes crudos', () => {
    expect(fmtBytes(500)).toBe('500 B')
  })
  it('kilobytes', () => {
    expect(fmtBytes(2048)).toBe('2.0 KB')
  })
  it('megabytes', () => {
    expect(fmtBytes(3 * 1024 * 1024)).toBe('3.0 MB')
  })
})

describe('sortFormats', () => {
  it('reordena a JSON, CSV, PDF sin importar el orden de llegada (el backend expone un Set)', () => {
    expect(sortFormats(['PDF', 'CSV', 'JSON'])).toEqual(['JSON', 'CSV', 'PDF'])
    expect(sortFormats(['CSV', 'JSON'])).toEqual(['JSON', 'CSV'])
  })
  it('ignora formatos no soportados', () => {
    expect(sortFormats(['CSV'])).toEqual(['CSV'])
  })
})

describe('fmtDateTime', () => {
  it('formatea DD-MM-YYYY · HH:mm', () => {
    expect(fmtDateTime('2026-07-03T11:05:00')).toBe('03-07-2026 · 11:05')
  })
})
