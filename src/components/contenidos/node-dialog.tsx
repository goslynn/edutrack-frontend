import { useState } from "react"
import { XIcon } from "lucide-react"

import type { ContentNode, Level } from "@/types/contenidos"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ModalShell } from "./modal-shell"

export interface NodeForm {
  name: string
  description: string
  orderIndex: number
}

interface NodeDialogProps {
  mode: "create" | "edit"
  /** Nivel del nodo que se crea/edita. */
  level: Level
  /** Nodo padre (contexto de creación) o padre del nodo editado; null en raíz. */
  parent: ContentNode | null
  /** Nodo existente cuando `mode === "edit"`. */
  node?: ContentNode
  /** Nº de hermanos: posición por defecto al crear. */
  siblingCount?: number
  loading?: boolean
  error?: string | null
  onClose: () => void
  onSubmit: (data: NodeForm) => void
}

const MAX_NAME = 150
const req = <span className="text-danger">*</span>

/** Alta/edición de un nodo del árbol. Mover de lugar no existe en v1. */
export function NodeDialog({
  mode,
  level,
  parent,
  node,
  siblingCount = 0,
  loading,
  error,
  onClose,
  onSubmit,
}: NodeDialogProps) {
  const [name, setName] = useState(node?.name ?? "")
  const [description, setDescription] = useState(node?.description ?? "")
  const [touched, setTouched] = useState(false)

  const lower = level.name.toLowerCase()
  const nameErr = !name.trim()
    ? "El nombre es obligatorio."
    : name.length > MAX_NAME
      ? `Máximo ${MAX_NAME} caracteres.`
      : ""

  const submit = () => {
    setTouched(true)
    if (nameErr) return
    onSubmit({
      name: name.trim(),
      description: description.trim(),
      orderIndex: node ? node.orderIndex : siblingCount,
    })
  }

  return (
    <ModalShell onClose={onClose} label={mode === "edit" ? "Cambiar nombre" : `Agregar ${lower}`}>
      <div className="flex items-start justify-between gap-3 px-[22px] pt-5">
        <div>
          <div className="text-[17px] font-semibold -tracking-[0.01em]">
            {mode === "edit" ? "Cambiar nombre" : `Agregar ${lower}`}
          </div>
          <div className="mt-[3px] text-[13px] leading-normal text-muted">
            {mode === "edit" ? (
              <>Editas atributos de este {lower}. Moverlo de lugar no existe como endpoint en v1.</>
            ) : parent ? (
              <>
                Se creará dentro de <b>{parent.name}</b> como <b>{level.name}</b> (nivel {level.depth}).
              </>
            ) : (
              <>
                Se creará en la raíz como <b>{level.name}</b> (nivel {level.depth}).
              </>
            )}
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
        <div className="flex flex-col gap-4">
          <Field data-invalid={touched && !!nameErr}>
            <FieldLabel htmlFor="nd-name">Nombre {req}</FieldLabel>
            <Input
              id="nd-name"
              value={name}
              maxLength={MAX_NAME + 20}
              aria-invalid={touched && !!nameErr}
              placeholder={level.depth >= 3 ? "Clase 1: Introducción…" : `Nombre del ${lower}`}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            {touched && nameErr && <FieldError>{nameErr}</FieldError>}
          </Field>
          <Field>
            <FieldLabel htmlFor="nd-desc">Descripción</FieldLabel>
            <textarea
              id="nd-desc"
              rows={3}
              maxLength={500}
              value={description}
              placeholder="Descripción del contenido…"
              onChange={(e) => setDescription(e.target.value)}
              className="w-full resize-y rounded-md border border-border bg-background px-[11px] py-2 text-sm text-foreground transition-colors outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-ring/50"
            />
            <FieldDescription>Opcional. Contexto breve para quien navega el árbol.</FieldDescription>
          </Field>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border px-[22px] pt-3.5 pb-[18px]">
        <span className="font-mono text-[11.5px] text-muted">
          {mode === "edit" ? `PUT /content/nodes/${node?.id}` : "POST /content/nodes"}
        </span>
        <div className="flex items-center gap-3">
          {error && <span className="text-[12.5px] text-danger">{error}</span>}
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button disabled={loading} onClick={submit}>
            {mode === "edit" ? "Guardar" : "Crear"}
          </Button>
        </div>
      </div>
    </ModalShell>
  )
}
