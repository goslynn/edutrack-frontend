import {
  BellIcon,
  BookOpenIcon,
  CalendarCheckIcon,
  FileBarChartIcon,
  GraduationCapIcon,
  LayoutDashboardIcon,
  MessageSquareTextIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react"

import type { NavGroup } from "@/components/ui/sidebar"

/**
 * Navegación de la app, agrupada por dominio. Config visual (iconos incluidos).
 * Cada ítem lleva su `path`: "Inicio" cuelga de `/dashboard` y el resto de las
 * secciones de `/dashboard/<id>`. El path es el que termina inyectado en el
 * Sidebar y el que dispara la navegación real (router).
 */
export const NAV_GROUPS: NavGroup[] = [
  { items: [{ id: "inicio", path: "/dashboard", label: "Inicio", icon: <LayoutDashboardIcon /> }] },
  {
    label: "Académico",
    items: [
      { id: "calificaciones", path: "/dashboard/calificaciones", label: "Calificaciones", icon: <GraduationCapIcon /> },
      { id: "asistencia", path: "/dashboard/asistencia", label: "Asistencia", icon: <CalendarCheckIcon /> },
      { id: "anotaciones", path: "/dashboard/anotaciones", label: "Anotaciones", icon: <MessageSquareTextIcon /> },
      { id: "contenidos", path: "/dashboard/contenidos", label: "Contenidos", icon: <BookOpenIcon /> },
    ],
  },
  {
    label: "Gestión",
    items: [
      { id: "estudiantes", path: "/dashboard/estudiantes", label: "Estudiantes", icon: <UsersIcon /> },
      { id: "reportes", path: "/dashboard/reportes", label: "Reportes", icon: <FileBarChartIcon /> },
    ],
  },
  {
    label: "Sistema",
    items: [
      { id: "notificaciones", path: "/dashboard/notificaciones", label: "Notificaciones", icon: <BellIcon />, badge: 3, badgeTone: "accent" },
      { id: "configuracion", path: "/dashboard/configuracion", label: "Configuración", icon: <SettingsIcon /> },
    ],
  },
]

/** Lista plana de todos los ítems de navegación. */
export const NAV_ITEMS = NAV_GROUPS.flatMap((group) => group.items)

/** Mapa id → etiqueta legible, para títulos de sección. */
export const NAV_LABEL: Record<string, string> = Object.fromEntries(
  NAV_ITEMS.map((item) => [item.id, item.label as string])
)

/** Mapa id → ruta, para resolver navegación desde un id de sección. */
export const NAV_PATH: Record<string, string> = Object.fromEntries(
  NAV_ITEMS.map((item) => [item.id, item.path])
)

/**
 * Resuelve el id de sección activo a partir del pathname actual. Toma la
 * coincidencia más específica (prefijo más largo) para que las subrutas de una
 * sección —p. ej. los paneles de `/dashboard/configuracion/...`— mantengan
 * resaltado su ítem padre.
 */
export function idFromPath(pathname: string): string {
  const match = NAV_ITEMS.filter(
    (item) => pathname === item.path || pathname.startsWith(item.path + "/")
  ).sort((a, b) => b.path.length - a.path.length)[0]
  return match?.id ?? "inicio"
}
