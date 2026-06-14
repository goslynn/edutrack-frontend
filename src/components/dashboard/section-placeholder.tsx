import { NAV_LABEL } from "./nav-config"

interface SectionPlaceholderProps {
  sectionId: string
}

/** Marcador para secciones aún sin pantalla propia. */
export function SectionPlaceholder({ sectionId }: SectionPlaceholderProps) {
  const label = NAV_LABEL[sectionId] ?? sectionId
  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-[22px] px-8 pt-7 pb-10">
      <div>
        <div className="mb-[7px] text-[11.5px] font-semibold tracking-[0.06em] text-muted uppercase">
          Sección
        </div>
        <h1 className="text-2xl leading-tight font-semibold tracking-tight">{label}</h1>
        <p className="mt-[7px] text-sm text-muted">
          Esta pantalla se construye con los componentes y tokens de EduTrack.
        </p>
      </div>
      <div className="rounded-xl border-[1.5px] border-dashed border-border bg-background p-14 text-center text-sm text-muted">
        Área de contenido de «{label}» — reemplázala con la pantalla del módulo.
      </div>
    </div>
  )
}
