import { useEffect, useState } from "react"
import { CheckIcon, ClockIcon, CopyIcon, DownloadIcon, Loader2Icon, XIcon } from "lucide-react"

import type { ContentFile, DownloadLink } from "@/types/contenidos"
import { DOWNLOAD_TTL_MIN } from "@/types/contenidos"
import { Button } from "@/components/ui/button"
import { fmtTime } from "./contenidos-meta"
import { ModalShell } from "./modal-shell"

/** Resultado del paso 1 (pedir el enlace pre-firmado al BFF). */
export type LinkResult = { link: DownloadLink } | { error: string }

interface DownloadDialogProps {
  file: ContentFile
  /** Paso 1 inyectado: pide el enlace pre-firmado al BFF. */
  onRequestLink: () => Promise<LinkResult>
  onClose: () => void
}

/**
 * Descarga en dos pasos: al abrir pide el enlace pre-firmado (paso 1) y, ya
 * generado, ofrece copiarlo o descargar (paso 2). El enlace es de vida corta.
 */
export function DownloadDialog({ file, onRequestLink, onClose }: DownloadDialogProps) {
  const [link, setLink] = useState<DownloadLink | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let active = true
    void (async () => {
      const res = await onRequestLink()
      if (!active) return
      if ("error" in res) setError(res.error)
      else setLink(res.link)
    })()
    return () => {
      active = false
    }
    // onRequestLink es estable (memoizado en el explorador); solo corre al montar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const copy = () => {
    if (!link) return
    void navigator.clipboard?.writeText(link.url)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <ModalShell size="sm" onClose={onClose} label="Descargar archivo">
      <div className="flex items-start justify-between gap-3 px-[22px] pt-5">
        <div className="min-w-0">
          <div className="text-[17px] font-semibold -tracking-[0.01em]">Descargar archivo</div>
          <div className="mt-[3px] truncate font-mono text-[13px] text-muted">{file.filename}</div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="grid size-8 flex-none place-items-center rounded-md text-muted transition-colors outline-none hover:bg-surface hover:text-foreground"
        >
          <XIcon className="size-[18px]" />
        </button>
      </div>

      <div className="overflow-auto px-[22px] py-4">
        {error ? (
          <p className="py-3 text-[13px] text-danger">{error}</p>
        ) : !link ? (
          <div className="flex items-center gap-2.5 px-0.5 py-3 text-[13.5px] text-muted">
            <Loader2Icon className="size-[18px] animate-spin" /> Generando enlace temporal…
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2 text-[12.5px] text-muted">
              <span className="grid size-[18px] flex-none place-items-center rounded-full bg-success text-[11px] font-bold text-success-foreground">
                1
              </span>
              Enlace pre-firmado generado{" "}
              <span className="font-mono text-foreground">GET /content/files/{file.id}/link</span>
            </div>
            <div className="flex items-center gap-2 rounded-md border border-border bg-surface py-1 pr-1 pl-3">
              <span className="min-w-0 flex-1 truncate font-mono text-xs text-foreground">{link.url}</span>
              <button
                type="button"
                onClick={copy}
                className="inline-flex flex-none items-center gap-1.5 rounded-sm border border-border bg-background px-2.5 py-1.5 font-mono text-xs font-semibold text-foreground transition-colors outline-none hover:border-primary hover:text-primary"
              >
                {copied ? <CheckIcon className="size-[15px]" /> : <CopyIcon className="size-[15px]" />}
                {copied ? "Copiado" : "Copiar"}
              </button>
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs text-muted">
              <ClockIcon className="size-[13px]" /> Válido hasta las {fmtTime(link.expiresAt)} (~{DOWNLOAD_TTL_MIN} min).
              Tras expirar, pide uno nuevo.
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-4 border-t border-border px-[22px] pt-3.5 pb-[18px]">
        <button
          type="button"
          onClick={onClose}
          className="px-1 py-1.5 text-[13px] font-semibold text-muted transition-colors outline-none hover:text-foreground"
        >
          Cerrar
        </button>
        <Button
          disabled={!link}
          onClick={() => {
            if (link) window.open(link.url, "_blank", "noopener")
            onClose()
          }}
        >
          <DownloadIcon /> Descargar ahora
        </Button>
      </div>
    </ModalShell>
  )
}
