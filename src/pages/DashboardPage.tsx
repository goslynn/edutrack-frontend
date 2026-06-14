import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { LogOutIcon } from "lucide-react"

import {
  currentUserStub,
  dashboardStub,
  type SectionId,
} from "@/data/dashboard-stub"
import { Avatar } from "@/components/ui/avatar"
import { Sidebar } from "@/components/ui/sidebar"
import { DashboardHome, type DashboardLayout } from "@/components/dashboard/dashboard-home"
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar"
import { NAV_GROUPS, NAV_LABEL } from "@/components/dashboard/nav-config"
import { SectionPlaceholder } from "@/components/dashboard/section-placeholder"
import mark from "@/assets/logo/edutrack-mark.svg"

const STORAGE_KEY = "et-dash-state-v1"

interface PersistedState {
  active?: SectionId
  collapsed?: boolean
  layout?: DashboardLayout
  course?: string
}

function loadState(): PersistedState {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as PersistedState
  } catch {
    return {}
  }
}

export function DashboardPage() {
  const navigate = useNavigate()
  const saved = loadState()

  const [active, setActive] = useState<SectionId>(saved.active ?? "inicio")
  const [collapsed, setCollapsed] = useState<boolean>(saved.collapsed ?? false)
  const [layout, setLayout] = useState<DashboardLayout>(saved.layout ?? "equilibrado")
  const [courseId, setCourseId] = useState<string>(
    saved.course ?? dashboardStub.courses[0].id
  )

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ active, collapsed, layout, course: courseId })
    )
  }, [active, collapsed, layout, courseId])

  const handleLogout = () => {
    for (const storage of [localStorage, sessionStorage]) {
      storage.removeItem("accessToken")
      storage.removeItem("refreshToken")
    }
    navigate("/login")
  }

  return (
    <div className="flex h-screen">
      <Sidebar
        groups={NAV_GROUPS}
        active={active}
        onNavigate={(id) => setActive(id as SectionId)}
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
            <Avatar name={currentUserStub.name} size="md" />
            {!collapsed && (
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-[13px] leading-tight font-semibold">
                  {currentUserStub.name}
                </span>
                <span className="text-[11.5px] text-muted">{currentUserStub.role}</span>
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
          courses={dashboardStub.courses}
          courseId={courseId}
          onCourseChange={setCourseId}
          notifications={dashboardStub.notifications}
          userName={currentUserStub.name}
        />
        <main
          className="flex-1 overflow-auto bg-surface"
          aria-label={active === "inicio" ? "Inicio" : NAV_LABEL[active]}
        >
          {active === "inicio" ? (
            <DashboardHome
              data={dashboardStub}
              layout={layout}
              onLayoutChange={setLayout}
              onGo={setActive}
            />
          ) : (
            <SectionPlaceholder sectionId={active} />
          )}
        </main>
      </div>
    </div>
  )
}
