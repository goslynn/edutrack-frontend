import { ArrowLeftIcon, HammerIcon } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

/** Stub "próximo paso" para los paneles cuyo contenido aún no se diseña. */
export function PanelStub({
  label,
  desc,
  onBack,
}: {
  /** Título del panel (inyectado por la página desde los metadatos). */
  label?: string
  /** Descripción del panel. */
  desc?: string
  onBack: () => void
}) {
  const meta = { label, desc }

  return (
    <div className="mx-auto max-w-[760px] px-8 pt-7 pb-16">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted transition-colors outline-none hover:text-primary"
      >
        <ArrowLeftIcon className="size-[15px]" /> Configuración
      </button>
      <header className="mb-[22px]">
        <h1 className="text-2xl leading-tight font-semibold tracking-tight">
          {meta?.label ?? "Panel"}
        </h1>
        {meta?.desc && <p className="mt-2 text-sm text-muted">{meta.desc}</p>}
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Contenido del panel</CardTitle>
          <CardDescription>
            La vista principal ya está definida. El contenido detallado de «
            {meta?.label}» se construye en el siguiente paso.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3 rounded-lg border-[1.5px] border-dashed border-border p-3.5 text-muted">
            <HammerIcon className="mt-px size-[18px] flex-none text-primary" />
            <div>
              <div className="text-[13.5px] font-semibold text-foreground">
                Próximo paso — diseño del panel
              </div>
              <div className="mt-0.5 text-[12.5px] leading-normal">
                Aquí irán los controles de «{meta?.label}», cada uno con su propio
                estado (enabled / disabled / hidden).
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
