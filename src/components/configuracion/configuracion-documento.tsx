import { useCallback, useEffect, useRef, useState } from "react"

import type { SettingsSection } from "@/types/configuracion"
import { cn } from "@/lib/utils"
import { Section } from "./settings-rows"

interface ConfiguracionDocumentoProps {
  /** Secciones del documento (en producción, de Auth y otros MS). */
  sections: SettingsSection[]
  /** Abre un panel a pantalla completa (navegación inyectada). */
  onOpenPanel: (panel: string) => void
}

/**
 * Documento de Configuración: secciones (General / System / Account) con scroll.
 * El nav lateral son anclas a los títulos (scroll suave + scrollspy), no un
 * router. Los "enlaces a panel" delegan en `onOpenPanel`, que la página cablea a
 * una navegación real (cada panel es su propia ruta).
 */
export function ConfiguracionDocumento({ sections, onOpenPanel }: ConfiguracionDocumentoProps) {
  const [active, setActive] = useState(sections[0].id)
  const rootRef = useRef<HTMLDivElement>(null)
  const sectionEls = useRef(new Map<string, HTMLElement>())

  const registerRef = useCallback((id: string, el: HTMLElement | null) => {
    if (el) sectionEls.current.set(id, el)
    else sectionEls.current.delete(id)
  }, [])

  const getScroller = () => rootRef.current?.closest("main") as HTMLElement | null

  const scrollToSection = (id: string) => {
    const cont = getScroller()
    const el = sectionEls.current.get(id)
    if (!cont || !el) return
    const top =
      el.getBoundingClientRect().top -
      cont.getBoundingClientRect().top +
      cont.scrollTop -
      14
    cont.scrollTo({ top, behavior: "smooth" })
  }

  // scrollspy — resalta la sección visible.
  useEffect(() => {
    const cont = getScroller()
    if (!cont) return
    const onScroll = () => {
      const ct = cont.getBoundingClientRect().top
      let cur = sections[0].id
      for (const s of sections) {
        const el = sectionEls.current.get(s.id)
        if (el && el.getBoundingClientRect().top - ct <= 90) cur = s.id
      }
      setActive(cur)
    }
    cont.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => cont.removeEventListener("scroll", onScroll)
  }, [sections])

  return (
    <div
      ref={rootRef}
      className="mx-auto grid max-w-[1020px] grid-cols-1 items-start gap-9 px-8 pt-7 pb-16 md:grid-cols-[188px_minmax(0,1fr)]"
    >
      {/* nav de secciones (anclas) */}
      <nav
        aria-label="Secciones"
        className="top-6 flex flex-row flex-wrap gap-1.5 md:sticky md:flex-col md:gap-0.5"
      >
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              setActive(s.id)
              scrollToSection(s.id)
            }}
            className={cn(
              "rounded-md px-3 py-2 text-left text-[13.5px] font-medium transition-colors outline-none",
              active === s.id
                ? "bg-primary/10 font-semibold text-primary md:shadow-[inset_2.5px_0_0_var(--color-primary)]"
                : "text-muted hover:bg-background hover:text-foreground"
            )}
          >
            {s.title}
          </button>
        ))}
      </nav>

      {/* documento */}
      <div className="min-w-0">
        <header className="mb-[22px]">
          <h1 className="text-2xl leading-tight font-semibold tracking-tight">
            Configuración
          </h1>
          <p className="mt-2 text-sm text-muted">
            Administra tus preferencias, el sistema y tu cuenta.
          </p>
        </header>
        {sections.map((s) => (
          <Section
            key={s.id}
            section={s}
            registerRef={registerRef}
            onOpenPanel={onOpenPanel}
          />
        ))}
      </div>
    </div>
  )
}
