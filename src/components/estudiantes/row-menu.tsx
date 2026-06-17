import { useState } from "react"
import { EllipsisVerticalIcon, type LucideIcon } from "lucide-react"

import type { RowState } from "@/types/estudiantes"
import { cn } from "@/lib/utils"

export interface MenuItem {
  icon: LucideIcon
  label: string
  onClick: () => void
  danger?: boolean
  /** Estado RBAC: hidden → no aparece; disabled → atenuado e inerte. */
  state: RowState
}

/**
 * Kebab de acciones de fila. El estado RBAC de cada ítem es la única expresión
 * de permisos: `hidden` lo omite, `disabled` lo atenúa e inerte, `enabled` lo
 * deja interactivo.
 */
export function RowMenu({ items }: { items: MenuItem[] }) {
  const [open, setOpen] = useState(false)
  const visible = items.filter((it) => it.state !== "hidden")
  if (visible.length === 0) return null

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        aria-label="Acciones"
        onClick={() => setOpen((v) => !v)}
        className="grid size-8 place-items-center rounded-md text-muted transition-colors outline-none hover:bg-surface hover:text-foreground"
      >
        <EllipsisVerticalIcon className="size-[17px]" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div
            role="menu"
            className="absolute top-9 right-0 z-[31] min-w-[200px] rounded-lg border border-border bg-background p-1.5 shadow-lg"
          >
            {visible.map((it, i) => {
              const Icon = it.icon
              const disabled = it.state === "disabled"
              const sep = it.danger && i > 0 && !visible[i - 1].danger
              return (
                <div key={it.label}>
                  {sep && <div className="my-1 h-px bg-border" />}
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      if (disabled) return
                      setOpen(false)
                      it.onClick()
                    }}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-sm px-2.5 py-2 text-left text-[13px] font-medium transition-colors outline-none [&_svg]:size-[15px] [&_svg]:flex-none [&_svg]:text-muted",
                      it.danger
                        ? "text-danger hover:bg-surface [&_svg]:text-danger"
                        : "text-foreground hover:bg-surface",
                      disabled && "cursor-not-allowed opacity-45 hover:bg-transparent"
                    )}
                  >
                    <Icon /> {it.label}
                  </button>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
