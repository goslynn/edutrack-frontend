import { useRef, useState } from "react"
import { FileWarningIcon, UploadCloudIcon, XIcon } from "lucide-react"

import type { ContentNode } from "@/types/contenidos"
import { MAX_FILE_BYTES } from "@/types/contenidos"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { fileMeta, fmtBytes } from "./contenidos-meta"
import { queueFiles, type QueuedFile } from "./upload-utils"
import { ModalShell } from "./modal-shell"

interface UploadDialogProps {
  node: ContentNode
  /** Cola inicial (p. ej. archivos ya soltados sobre el área). */
  initial?: QueuedFile[]
  loading?: boolean
  error?: string | null
  onClose: () => void
  onUpload: (files: File[]) => void
}

/** Subida de archivos a un nodo hoja, con validación de tamaño y cola. */
export function UploadDialog({ node, initial, loading, error, onClose, onUpload }: UploadDialogProps) {
  const [queue, setQueue] = useState<QueuedFile[]>(initial ?? [])
  const [drag, setDrag] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const add = (list: FileList | File[]) => setQueue((q) => [...q, ...queueFiles(list)])
  const okFiles = queue.filter((f) => f.ok)
  const confirm = () => {
    if (okFiles.length) onUpload(okFiles.map((f) => f.file))
  }

  return (
    <ModalShell onClose={onClose} label="Subir archivos">
      <div className="flex items-start justify-between gap-3 px-[22px] pt-5">
        <div>
          <div className="text-[17px] font-semibold -tracking-[0.01em]">Subir archivos</div>
          <div className="mt-[3px] text-[13px] leading-normal text-muted">
            Destino: <b>{node.name}</b> · nodo hoja. Máx. {fmtBytes(MAX_FILE_BYTES)} por archivo.
          </div>
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
        <div
          role="button"
          tabIndex={0}
          onDragOver={(e) => {
            e.preventDefault()
            setDrag(true)
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDrag(false)
            add(e.dataTransfer.files)
          }}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") inputRef.current?.click()
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border-[1.5px] border-dashed px-5 py-[30px] text-center transition-colors outline-none",
            drag ? "border-primary bg-primary-soft" : "border-border bg-surface hover:border-primary hover:bg-primary-soft"
          )}
        >
          <span className="mb-1 grid size-12 place-items-center rounded-xl bg-background text-primary">
            <UploadCloudIcon className="size-[26px]" />
          </span>
          <div className="text-[13.5px] font-semibold text-foreground">
            Arrastra archivos aquí o haz clic para seleccionar
          </div>
          <div className="max-w-[40ch] text-xs leading-snug text-muted">
            Validamos el tamaño en el cliente antes de subir (límite {fmtBytes(MAX_FILE_BYTES)}).
          </div>
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) add(e.target.files)
              e.target.value = ""
            }}
          />
        </div>

        {queue.length > 0 && (
          <div className="mt-3.5 flex flex-col gap-2">
            {queue.map((q, i) => {
              const Icon = q.ok ? fileMeta(q.file.name).icon : FileWarningIcon
              return (
                <div
                  key={i}
                  className={cn(
                    "flex items-center gap-[11px] rounded-md border px-[11px] py-[9px]",
                    q.ok ? "border-border bg-surface" : "border-danger bg-danger/[0.07]"
                  )}
                >
                  <span
                    className={cn(
                      "grid size-[30px] flex-none place-items-center rounded-lg bg-background",
                      q.ok ? "text-primary" : "text-danger"
                    )}
                  >
                    <Icon className="size-[17px]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-mono text-[12.5px] font-semibold">{q.file.name}</div>
                    <div className={cn("text-[11.5px]", q.ok ? "text-muted" : "text-danger")}>
                      {q.ok ? fmtBytes(q.file.size) : q.err}
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Quitar"
                    onClick={() => setQueue((prev) => prev.filter((_, j) => j !== i))}
                    className="grid size-[26px] flex-none place-items-center rounded-sm text-muted transition-colors outline-none hover:bg-background hover:text-foreground"
                  >
                    <XIcon className="size-[15px]" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border px-[22px] pt-3.5 pb-[18px]">
        <span className="text-[11.5px] text-muted">
          {error ? (
            <span className="text-danger">{error}</span>
          ) : (
            <>
              {okFiles.length} de {queue.length} listo{okFiles.length === 1 ? "" : "s"} para subir
            </>
          )}
        </span>
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button disabled={!okFiles.length || loading} onClick={confirm}>
            Subir {okFiles.length || ""}
          </Button>
        </div>
      </div>
    </ModalShell>
  )
}
