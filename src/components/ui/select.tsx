import { Children, isValidElement, type ReactElement, type ReactNode } from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"

interface SelectProps {
  value?: string | number
  defaultValue?: string | number
  /** Compatible con el `<select>` nativo: `(e) => e.target.value`. */
  onChange?: (event: { target: { value: string } }) => void
  disabled?: boolean
  id?: string
  name?: string
  "aria-label"?: string
  "aria-invalid"?: boolean | "true" | "false"
  /** Clase del trigger (estilo/extra); el ancho normalmente va en `wrapperClassName`. */
  className?: string
  /** Controla ancho/posición del control (p. ej. `w-full`, `min-w-[170px]`). */
  wrapperClassName?: string
  /** Opciones declaradas como `<option value=…>label</option>` (API nativa). */
  children?: ReactNode
}

interface OptionLike {
  value: string
  label: ReactNode
  disabled?: boolean
}

/** Lee los `<option>` hijos para mapearlos a items de Base UI sin cambiar los call sites. */
function readOptions(children: ReactNode): OptionLike[] {
  return Children.toArray(children)
    .filter(
      (child): child is ReactElement<{ value?: unknown; children?: ReactNode; disabled?: boolean }> =>
        isValidElement(child) && child.type === "option"
    )
    .map((el) => ({
      value: String(el.props.value ?? ""),
      label: el.props.children,
      disabled: el.props.disabled,
    }))
}

const norm = (v: string | number | undefined) => (v === undefined ? undefined : String(v))

/**
 * Select estilizado con el sistema de diseño. Reemplaza al `<select>` nativo
 * (cuyo popup lo pinta el SO, rompiendo el lenguaje visual) por el primitivo de
 * Base UI: el popup se renderiza en un portal y se estiliza con los tokens.
 * Mantiene la API del nativo (children `<option>`, `value`/`onChange`) para no
 * tocar los call sites.
 */
function Select({
  value,
  defaultValue,
  onChange,
  disabled,
  id,
  name,
  className,
  wrapperClassName,
  children,
  ...aria
}: SelectProps) {
  const options = readOptions(children)
  const items = Object.fromEntries(options.map((o) => [o.value, o.label]))

  return (
    <SelectPrimitive.Root
      items={items}
      value={norm(value)}
      defaultValue={norm(defaultValue)}
      disabled={disabled}
      name={name}
      onValueChange={(next) => onChange?.({ target: { value: next == null ? "" : String(next) } })}
    >
      <SelectPrimitive.Trigger
        id={id}
        {...aria}
        className={cn(
          "flex h-8 cursor-pointer items-center justify-between gap-2 rounded-md border border-border bg-background py-1 pr-2.5 pl-2.5 text-sm font-medium text-foreground transition-colors outline-none select-none hover:bg-surface focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[popup-open]:border-ring",
          wrapperClassName,
          className
        )}
      >
        <SelectPrimitive.Value className="truncate text-left" />
        <SelectPrimitive.Icon className="flex-none">
          <ChevronDownIcon className="size-[15px] text-muted" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Positioner
          alignItemWithTrigger={false}
          sideOffset={6}
          className="z-50 outline-none"
        >
          <SelectPrimitive.Popup className="max-h-[var(--available-height)] min-w-[var(--anchor-width)] overflow-y-auto rounded-lg border border-border bg-background p-1.5 shadow-lg outline-none">
            {options.map((o) => (
              <SelectPrimitive.Item
                key={o.value}
                value={o.value}
                disabled={o.disabled}
                className="flex cursor-pointer items-center justify-between gap-2.5 rounded-sm px-2.5 py-2 text-[13px] font-medium text-foreground outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-surface"
              >
                <SelectPrimitive.ItemText>{o.label}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="flex-none">
                  <CheckIcon className="size-3.5 text-primary" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Popup>
        </SelectPrimitive.Positioner>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}

export { Select }
