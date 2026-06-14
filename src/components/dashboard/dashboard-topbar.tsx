import { useState } from "react"
import {
  BellIcon,
  ChevronDownIcon,
  CircleHelpIcon,
  SearchIcon,
} from "lucide-react"

import type { Course, DashboardNotification } from "@/data/dashboard-stub"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface DashboardTopbarProps {
  courses: Course[]
  courseId: string
  onCourseChange: (id: string) => void
  notifications: DashboardNotification[]
  userName: string
}

const NOTIF_VARIANT = {
  warning: "warning",
  success: "success",
  primary: "primary",
} as const

/** Barra superior: selector de curso, búsqueda, notificaciones y perfil. */
export function DashboardTopbar({
  courses,
  courseId,
  onCourseChange,
  notifications,
  userName,
}: DashboardTopbarProps) {
  const [notifOpen, setNotifOpen] = useState(false)

  return (
    <header className="relative z-[5] flex h-[var(--header-height,56px)] flex-none items-center gap-3.5 border-b border-border bg-background px-5">
      <div className="relative inline-flex flex-none items-center">
        <select
          aria-label="Curso"
          value={courseId}
          onChange={(event) => onCourseChange(event.target.value)}
          className="cursor-pointer appearance-none rounded-md border border-border bg-background py-[7px] pr-[30px] pl-3 text-[13px] font-medium text-foreground outline-none hover:bg-surface focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name} · {course.role}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-[9px] size-[15px] text-muted" />
      </div>

      <div className="hidden min-w-0 max-w-[400px] flex-1 items-center gap-2 rounded-md border border-border bg-surface px-3 py-[7px] text-muted sm:flex">
        <SearchIcon className="size-4 flex-none" />
        <input
          placeholder="Buscar estudiante, RUT o anotación…"
          className="w-full border-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
        />
      </div>

      <div className="relative ml-auto flex items-center gap-2.5">
        <button
          type="button"
          aria-label="Notificaciones"
          onClick={() => setNotifOpen((open) => !open)}
          className="relative grid size-[34px] place-items-center rounded-md text-muted transition-colors outline-none hover:bg-surface hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <BellIcon className="size-[18px]" />
          <span className="absolute top-2 right-[9px] size-[7px] rounded-full bg-accent ring-2 ring-background" />
        </button>
        <button
          type="button"
          aria-label="Ayuda"
          className="grid size-[34px] place-items-center rounded-md text-muted transition-colors outline-none hover:bg-surface hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <CircleHelpIcon className="size-[18px]" />
        </button>
        <div className="h-[22px] w-px bg-border" />
        <Avatar name={userName} size="md" />

        {notifOpen && (
          <div
            onMouseLeave={() => setNotifOpen(false)}
            className="absolute top-[42px] right-0 z-20 w-80 rounded-xl border border-border bg-background p-1.5 shadow-lg"
          >
            <div className="px-2.5 pt-2 pb-1 text-xs font-semibold text-muted">
              Notificaciones
            </div>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="flex items-start gap-2 rounded-md px-2.5 py-[9px] text-[13px] leading-snug hover:bg-surface"
              >
                <Badge
                  variant={NOTIF_VARIANT[notification.tone]}
                  dot
                  className="flex-none"
                >
                  {notification.tag}
                </Badge>
                <span className="text-foreground">{notification.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </header>
  )
}
