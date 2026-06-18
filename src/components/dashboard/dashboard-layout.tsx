import { useEffect, useState } from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { LogOutIcon } from "lucide-react"

import type {
  Course,
  CurrentUser,
  DashboardNotification,
} from "@/types/dashboard"
import { clearSession } from "@/lib/session"
import { Avatar } from "@/components/ui/avatar"
import { Sidebar } from "@/components/ui/sidebar"
import { DashboardTopbar } from "./dashboard-topbar"
import { NAV_GROUPS, NAV_LABEL, NAV_PATH, idFromPath } from "./nav-config"
import mark from "@/assets/logo/edutrack-mark.svg"

/** Contexto que el shell expone a las páginas hijas vía `<Outlet>`. */
export interface DashboardOutletContext {
  courseId: string
  courseName: string
}

interface DashboardLayoutProps {
  /** Cursos del usuario (selector del topbar). En producción, de MS-Course. */
  courses: Course[]
  /** Notificaciones de la campana del topbar. */
  notifications: DashboardNotification[]
  /** Identidad autenticada (en producción, del JWT decodificado). */
  user: CurrentUser
}

const STORAGE_KEY = "et-dash-shell-v1"

interface PersistedState {
  collapsed?: boolean
  course?: string
}

function loadState(): PersistedState {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as PersistedState
  } catch {
    return {}
  }
}

/**
 * Cascarón persistente del dashboard: Sidebar + Topbar fijos, con el contenido
 * de cada sección renderizado en `<Outlet>` según la ruta. El ítem activo del
 * nav se deriva del pathname y cada clic navega al `path` del ítem (router), de
 * modo que cada sección es una ruta propia (atrás/adelante del navegador).
 */
export function DashboardLayout({
  courses,
  notifications,
  user,
}: DashboardLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const saved = loadState()

  const [collapsed, setCollapsed] = useState<boolean>(saved.collapsed ?? false)
  const [courseId, setCourseId] = useState<string>(saved.course ?? courses[0].id)

  const active = idFromPath(location.pathname)
  const courseName =
    courses.find((c) => c.id === courseId)?.name ?? courses[0].name

  // Cuando la lista de cursos se actualiza desde la API (IDs reales vs. stub),
  // si el courseId guardado es un ID de stub (no UUID) y no existe en la nueva
  // lista, cambia al primero. No se resetea si courseId ya es un UUID real.
  useEffect(() => {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(courseId)
    if (!isUuid && courses.length > 0 && !courses.some((c) => c.id === courseId)) {
      setCourseId(courses[0].id)
    }
  }, [courses, courseId])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ collapsed, course: courseId }))
  }, [collapsed, courseId])

  const handleLogout = () => {
    clearSession()
    navigate("/login")
  }

  const context: DashboardOutletContext = { courseId, courseName }

  return (
    <div className="flex h-screen">
      <Sidebar
        groups={NAV_GROUPS}
        active={active}
        onNavigate={(id) => navigate(NAV_PATH[id])}
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        brand={
          <>
            <img src={mark} width={28} height={28} alt="" />
            <span>
              Edu<span className="text-primary">Track</span>
            </span>
          </>
        }
        brandCollapsed={<img src={mark} width={28} height={28} alt="EduTrack" />}
        footer={
          <button
            type="button"
            onClick={handleLogout}
            title="Cerrar sesión"
            className="flex w-full items-center gap-2.5 rounded-md p-2 text-left transition-colors outline-none hover:bg-surface focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <Avatar name={user.name} size="md" />
            {!collapsed && (
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-[13px] leading-tight font-semibold">
                  {user.name}
                </span>
                <span className="text-[11.5px] text-muted">{user.role}</span>
              </span>
            )}
            {!collapsed && (
              <LogOutIcon className="size-[15px] flex-none text-muted" aria-hidden />
            )}
          </button>
        }
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar
          courses={courses}
          courseId={courseId}
          onCourseChange={setCourseId}
          notifications={notifications}
          userName={user.name}
        />
        <main
          className="flex-1 overflow-auto bg-surface"
          aria-label={NAV_LABEL[active]}
        >
          <Outlet context={context} />
        </main>
      </div>
    </div>
  )
}
