import { ChevronRightIcon, LockIcon } from "lucide-react"

import type { SettingsRow, SettingsSection } from "@/types/configuracion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs } from "@/components/ui/tabs"
import { CfgIcon } from "./cfg-icon"

/** Control inline (label a la izquierda, control a la derecha). */
function ControlRow({ row }: { row: SettingsRow }) {
  const disabled = row.state === "disabled"

  let control = null
  if (row.type === "segmented") {
    control = (
      <Tabs
        defaultValue={row.value}
        tabs={row.options.map((o) => ({ value: o.value, label: o.label }))}
      />
    )
  } else if (row.type === "select") {
    control = (
      <Select defaultValue={row.value} disabled={disabled} wrapperClassName="min-w-[190px]">
        {row.options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>
    )
  } else if (row.type === "switch") {
    control = <Switch defaultChecked={row.checked} disabled={disabled} />
  } else if (row.type === "action") {
    control = (
      <Button variant={row.action.variant ?? "outline"} size="sm" disabled={disabled}>
        <CfgIcon name={row.action.icon} /> {row.action.label}
      </Button>
    )
  }

  return (
    <div
      className={cn(
        "flex items-center gap-6 border-t border-border py-4 first:border-t-0",
        disabled && "opacity-50"
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold -tracking-[0.01em]">{row.label}</div>
        {row.desc && (
          <div className="mt-[3px] max-w-[52ch] text-[12.5px] leading-snug text-balance text-muted">
            {row.desc}
          </div>
        )}
      </div>
      <div className={cn("flex flex-none items-center", disabled && "pointer-events-none")}>
        {control}
      </div>
    </div>
  )
}

/** Enlace a panel (cuando un aspecto tiene demasiadas opciones para inline). */
function PanelRow({
  row,
  onOpenPanel,
}: {
  row: Extract<SettingsRow, { type: "panel" }>
  onOpenPanel: (panel: string) => void
}) {
  const disabled = row.state === "disabled"

  const inner = (
    <>
      <span
        className={cn(
          "grid size-[38px] flex-none place-items-center rounded-[10px] transition-colors",
          disabled ? "bg-muted/15 text-muted" : "bg-primary-soft text-primary"
        )}
      >
        <CfgIcon name={row.icon} className="size-[19px]" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
        <span
          className={cn(
            "text-sm font-semibold -tracking-[0.01em] transition-colors",
            !disabled && "group-hover/prow:text-primary"
          )}
        >
          {row.label}
        </span>
        {row.desc && (
          <span className="text-[12.5px] leading-snug text-balance text-muted">
            {row.desc}
          </span>
        )}
      </span>
      <span
        className={cn(
          "ml-2 flex flex-none items-center text-muted transition-all",
          !disabled && "group-hover/prow:translate-x-0.5 group-hover/prow:text-primary"
        )}
      >
        {disabled ? (
          <LockIcon className="size-[15px]" />
        ) : (
          <ChevronRightIcon className="size-[17px]" />
        )}
      </span>
    </>
  )

  const base = "flex items-center gap-3.5 border-t border-border py-[15px] first:border-t-0"

  if (disabled) {
    return (
      <div aria-disabled className={cn(base, "opacity-50")}>
        {inner}
      </div>
    )
  }
  return (
    <button
      type="button"
      onClick={() => onOpenPanel(row.panel)}
      className={cn(base, "group/prow w-full text-left outline-none")}
    >
      {inner}
    </button>
  )
}

function Row({
  row,
  onOpenPanel,
}: {
  row: SettingsRow
  onOpenPanel: (panel: string) => void
}) {
  if (row.state === "hidden") return null
  if (row.type === "panel") return <PanelRow row={row} onOpenPanel={onOpenPanel} />
  return <ControlRow row={row} />
}

/** Una sección de la página (tarjeta con título + filas). */
export function Section({
  section,
  registerRef,
  onOpenPanel,
}: {
  section: SettingsSection
  registerRef: (id: string, el: HTMLElement | null) => void
  onOpenPanel: (panel: string) => void
}) {
  const visible = section.rows.filter((r) => r.state !== "hidden")
  if (!visible.length) return null
  return (
    <section
      id={"sec-" + section.id}
      ref={(el) => registerRef(section.id, el)}
      className="scroll-mt-5 rounded-xl bg-background ring-1 ring-foreground/10 not-first:mt-[22px]"
    >
      <div className="border-b border-border px-[22px] pt-[18px] pb-[15px]">
        <h2 className="text-lg leading-snug font-semibold -tracking-[0.01em]">
          {section.title}
        </h2>
        {section.desc && (
          <p className="mt-[5px] text-[13px] text-muted">{section.desc}</p>
        )}
      </div>
      <div className="px-[22px] py-0.5">
        {visible.map((r) => (
          <Row key={r.id} row={r} onOpenPanel={onOpenPanel} />
        ))}
      </div>
    </section>
  )
}
