import { TrendingDownIcon, TrendingUpIcon } from "lucide-react"

import type { QuickStat } from "@/types/dashboard"
import { cn } from "@/lib/utils"
import { DashIcon } from "./dash-icon"
import { ICON_TINT } from "./tints"

interface StatCardProps {
  stat: QuickStat
}

/** Tarjeta de stat rápido: icono tintado, delta opcional, valor y subtexto. */
export function StatCard({ stat }: StatCardProps) {
  const down = stat.tone === "down"
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-background p-[18px] ring-1 ring-foreground/10">
      <div className="mb-2 flex items-center justify-between">
        <span
          className={cn(
            "flex size-[38px] items-center justify-center rounded-[10px]",
            ICON_TINT[stat.tint]
          )}
        >
          <DashIcon name={stat.icon} size={18} />
        </span>
        {stat.delta && (
          <span
            className={cn(
              "inline-flex items-center gap-[3px] font-mono text-[12.5px] leading-none font-semibold",
              down ? "text-danger" : "text-success"
            )}
          >
            {down ? (
              <TrendingDownIcon className="size-[13px]" aria-hidden />
            ) : (
              <TrendingUpIcon className="size-[13px]" aria-hidden />
            )}
            {stat.delta}
          </span>
        )}
      </div>
      <div className="text-[28px] leading-tight font-semibold tracking-tight tabular-nums">
        {stat.value}
      </div>
      <div className="text-[13px] font-medium text-foreground">{stat.label}</div>
      <div className="text-xs text-muted">{stat.sub}</div>
    </div>
  )
}
