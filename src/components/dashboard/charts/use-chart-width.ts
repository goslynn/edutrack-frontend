import { useLayoutEffect, useRef, useState } from "react"

/**
 * Mide el ancho del contenedor del chart. No depende solo de ResizeObserver
 * (poco fiable en algunos embeds): mide en layout, en el siguiente frame, tras
 * un pequeño timeout (reflow de fuentes/iconos) y al redimensionar la ventana.
 */
export function useChartWidth() {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    const measure = () => {
      const next = el.clientWidth
      if (next) setWidth(next)
    }

    measure()
    const raf = requestAnimationFrame(measure)
    const timer = setTimeout(measure, 180)
    window.addEventListener("resize", measure)

    let observer: ResizeObserver | undefined
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(measure)
      observer.observe(el)
    }

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(timer)
      window.removeEventListener("resize", measure)
      observer?.disconnect()
    }
  }, [])

  return { ref, width }
}
