import { useEffect, useRef, useState } from "react"
import {
  BellIcon,
  ChevronDownIcon,
  CircleHelpIcon,
  LogOutIcon,
  SearchIcon,
  SettingsIcon,
} from "lucide-react"

import type { Course, DashboardNotification } from "@/types/dashboard"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface DashboardTopbarProps {
  courses: Course[]
  courseId: string
  onCourseChange: (id: string) => void
  notifications: DashboardNotification[]
  userDisplayName: string
  userEmail: string
  onLogout: () => void
  onSettings: () => void
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
  userDisplayName,
  userEmail,
  onLogout,
  onSettings,
}: DashboardTopbarProps) {
  const [notifOpen, setNotifOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const [logoutConfirm, setLogoutConfirm] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!userOpen) return
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [userOpen])

  useEffect(() => {
    if (!logoutConfirm) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLogoutConfirm(false)
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [logoutConfirm])

  return (
    <>
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

          {/* user menu */}
          <div ref={userMenuRef} className="relative">
            <button
              type="button"
              aria-label="Menú de usuario"
              aria-expanded={userOpen}
              aria-haspopup="menu"
              onClick={() => setUserOpen((open) => !open)}
              className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <Avatar name={userDisplayName} size="md" />
            </button>

            {userOpen && (
              <div
                role="menu"
                className="absolute top-[42px] right-0 z-20 w-64 rounded-xl border border-border bg-background shadow-lg"
              >
                <div className="flex items-center gap-2.5 border-b border-border px-3 pt-3 pb-2.5">
                  <Avatar name={userDisplayName} size="md" className="flex-none" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-semibold text-foreground">
                      {userDisplayName}
                    </div>
                    <div className="truncate text-[11.5px] text-muted">{userEmail}</div>
                  </div>
                </div>
                <div className="p-1.5">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setUserOpen(false)
                      onSettings()
                    }}
                    className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-[9px] text-[13px] text-foreground transition-colors outline-none hover:bg-surface focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <SettingsIcon className="size-[15px] flex-none text-muted" aria-hidden />
                    Configuración de cuenta
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setUserOpen(false)
                      setLogoutConfirm(true)
                    }}
                    className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-[9px] text-[13px] text-danger transition-colors outline-none hover:bg-danger/[0.08] focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <LogOutIcon className="size-[15px] flex-none" aria-hidden />
                    Cerrar sesión
                  </button>
                </div>
              </div>
            )}
          </div>

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

      {logoutConfirm && (
        <div
          className="fixed inset-0 z-40 grid place-items-center bg-foreground/40 p-5"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setLogoutConfirm(false)
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Cerrar sesión"
            className="flex max-h-[92vh] w-full max-w-[380px] flex-col rounded-2xl bg-background shadow-lg"
          >
            <div className="flex flex-col items-center gap-2.5 px-[26px] pt-[30px] pb-[22px] text-center">
              <span className="mb-1 grid size-[50px] place-items-center rounded-[14px] bg-warning-soft text-warning">
                <LogOutIcon className="size-[22px]" />
              </span>
              <div className="text-base font-semibold">¿Cerrar sesión?</div>
              <div className="max-w-[40ch] text-[13px] leading-normal text-muted text-pretty">
                Serás redirigido a la pantalla de inicio de sesión.
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 border-t border-border px-[22px] pt-3.5 pb-[18px]">
              <button
                type="button"
                onClick={() => setLogoutConfirm(false)}
                className="px-1 py-1.5 text-[13px] font-semibold text-muted transition-colors outline-none hover:text-foreground"
              >
                Cancelar
              </button>
              <Button variant="destructive" onClick={onLogout}>
                <LogOutIcon /> Cerrar sesión
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
