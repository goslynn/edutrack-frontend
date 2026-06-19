import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { useChartWidth } from './use-chart-width'

function Probe() {
  const { ref, width } = useChartWidth()
  return <div ref={ref} data-testid="box">{width}</div>
}

describe('useChartWidth', () => {
  beforeEach(() => {
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
      configurable: true,
      get: () => 320,
    })
    class RO {
      constructor(private cb: () => void) {}
      observe() { this.cb() }
      unobserve() {}
      disconnect() {}
    }
    vi.stubGlobal('ResizeObserver', RO)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    // @ts-expect-error: limpia el override de prototipo
    delete HTMLElement.prototype.clientWidth
  })

  it('mide el ancho del contenedor', async () => {
    const { getByTestId, unmount } = render(<Probe />)
    await waitFor(() => expect(getByTestId('box').textContent).toBe('320'))
    unmount() // ejecuta el cleanup (cancelAnimationFrame, clearTimeout, disconnect)
  })

  it('sin ResizeObserver no falla', async () => {
    vi.stubGlobal('ResizeObserver', undefined)
    const { getByTestId } = render(<Probe />)
    await waitFor(() => expect(getByTestId('box').textContent).toBe('320'))
  })
})
