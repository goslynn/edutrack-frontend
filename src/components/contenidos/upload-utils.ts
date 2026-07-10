import { MAX_FILE_BYTES } from "@/types/contenidos"
import { fmtBytes } from "./contenidos-meta"

/** Un archivo encolado con el veredicto de la validación cliente. */
export interface QueuedFile {
  file: File
  ok: boolean
  err: string
}

/** Valida el tamaño en el cliente antes de subir (límite 500 MB). */
export function queueFiles(list: FileList | File[]): QueuedFile[] {
  return Array.from(list).map((file) => {
    const tooBig = file.size > MAX_FILE_BYTES
    return {
      file,
      ok: !tooBig,
      err: tooBig ? `413 CONTENT.FILE.TOO_LARGE — supera el límite de ${fmtBytes(MAX_FILE_BYTES)}.` : "",
    }
  })
}
