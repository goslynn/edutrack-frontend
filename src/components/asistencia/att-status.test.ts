import { describe, expect, it } from 'vitest'
import { ATT_OPTS, DOT_BG, ON_BG, STATUS } from './att-status'

describe('att-status', () => {
  it('STATUS cubre los cuatro estados con label y badge', () => {
    expect(Object.keys(STATUS).sort()).toEqual(['atrasado', 'ausente', 'justificado', 'presente'])
    expect(STATUS.presente).toEqual({ label: 'Presente', badge: 'success' })
    expect(STATUS.ausente.badge).toBe('danger')
  })

  it('ATT_OPTS lista los cuatro estados en orden', () => {
    expect(ATT_OPTS.map((o) => o.v)).toEqual(['presente', 'atrasado', 'ausente', 'justificado'])
  })

  it('DOT_BG y ON_BG usan solo tokens semánticos', () => {
    expect(DOT_BG.presente).toBe('bg-success')
    expect(ON_BG.justificado).toContain('bg-primary')
  })
})
