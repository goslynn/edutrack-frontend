import { ChevronRightIcon } from "lucide-react"

import type { QuickAction, SectionId, Shortcut } from "@/data/dashboard-stub"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { DashIcon } from "./dash-icon"
import { DashboardPanel } from "./dashboard-panel"

interface ShortcutsPanelProps {
  shortcuts: Shortcut[]
  quickActions: QuickAction[]
  onGo: (target: SectionId) => void
  /** Disposición destacada: tarjetas verticales en grilla en vez de lista. */
  hero?: boolean
}

function ShortcutTile({
  shortcut,
  onGo,
  hero,
}: {
  shortcut: Shortcut
  onGo: (target: SectionId) => void
  hero?: boolean
}) {
  const isNow = shortcut.kind === "now"
  const tint = isNow ? "bg-primary-soft text-primary" : "bg-accent-soft text-accent"
  return (
    <button
      type="button"
      onClick={() => onGo(shortcut.target)}
      className={cn(
        "group/tile relative flex w-full items-center gap-3 rounded-xl bg-background text-left transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px",
        hero
          ? "flex-col items-start gap-3 p-4 ring-1 ring-foreground/10 hover:shadow-sm"
          : "gap-3 border border-border px-3.5 py-3 hover:border-transparent hover:shadow-sm"
      )}
    >
      <span
        className={cn(
          "flex size-10 flex-none items-center justify-center rounded-[11px]",
          tint
        )}
      >
        <DashIcon name={shortcut.icon} size={19} />
      </span>
      <span className={cn("flex min-w-0 flex-col gap-0.5", hero && "w-full")}>
        <span className="text-sm leading-snug font-semibold">{shortcut.title}</span>
        <span
          className={cn(
            "text-[12.5px] text-muted",
            hero ? "whitespace-normal" : "overflow-hidden text-ellipsis whitespace-nowrap"
          )}
        >
          {shortcut.meta}
        </span>
      </span>
      <Badge
        variant={isNow ? "primary" : "accent"}
        dot={isNow}
        className={cn(hero && "absolute top-3.5 right-3.5")}
      >
        {shortcut.badge}
      </Badge>
      {!hero && (
        <ChevronRightIcon className="size-4 flex-none text-muted" aria-hidden />
      )}
    </button>
  )
}

function QuickActions({
  actions,
  onGo,
}: {
  actions: QuickAction[]
  onGo: (target: SectionId) => void
}) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {actions.map((action) => (
        <button
          key={action.id}
          type="button"
          onClick={() => onGo(action.target)}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-[9px] text-sm font-medium text-foreground transition-colors outline-none hover:border-muted hover:bg-surface focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <DashIcon name={action.icon} size={15} className="text-muted" />
          {action.label}
        </button>
      ))}
    </div>
  )
}

export function ShortcutsPanel({
  shortcuts,
  quickActions,
  onGo,
  hero,
}: ShortcutsPanelProps) {
  return (
    <DashboardPanel title="Accesos directos" hint="Según tu día y tus pendientes">
      <div
        className={cn(
          hero
            ? "grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3"
            : "flex flex-col gap-2.5"
        )}
      >
        {shortcuts.map((shortcut) => (
          <ShortcutTile key={shortcut.id} shortcut={shortcut} onGo={onGo} hero={hero} />
        ))}
      </div>
      <div className="mt-[15px] border-t border-border pt-[15px]">
        <div className="mb-[11px] text-[11px] font-semibold tracking-[0.06em] text-muted uppercase">
          Acciones frecuentes
        </div>
        <QuickActions actions={quickActions} onGo={onGo} />
      </div>
    </DashboardPanel>
  )
}
