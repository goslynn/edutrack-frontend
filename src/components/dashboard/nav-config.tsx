import {
  BellIcon,
  BookOpenIcon,
  CalendarCheckIcon,
  ClipboardListIcon,
  FileBarChartIcon,
  GraduationCapIcon,
  LayoutDashboardIcon,
  MessageSquareTextIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react"

import type { NavGroup } from "@/components/ui/sidebar"

/** Navegación de la app, agrupada por dominio. Config visual (iconos incluidos). */
export const NAV_GROUPS: NavGroup[] = [
  { items: [{ id: "inicio", label: "Inicio", icon: <LayoutDashboardIcon /> }] },
  {
    label: "Académico",
    items: [
      { id: "calificaciones", label: "Calificaciones", icon: <GraduationCapIcon /> },
      { id: "asistencia", label: "Asistencia", icon: <CalendarCheckIcon /> },
      { id: "anotaciones", label: "Anotaciones", icon: <MessageSquareTextIcon /> },
      { id: "evaluaciones", label: "Evaluaciones", icon: <ClipboardListIcon /> },
      { id: "contenidos", label: "Contenidos", icon: <BookOpenIcon /> },
    ],
  },
  {
    label: "Gestión",
    items: [
      { id: "estudiantes", label: "Estudiantes", icon: <UsersIcon /> },
      { id: "reportes", label: "Reportes", icon: <FileBarChartIcon /> },
    ],
  },
  {
    label: "Sistema",
    items: [
      { id: "notificaciones", label: "Notificaciones", icon: <BellIcon />, badge: 3, badgeTone: "accent" },
      { id: "configuracion", label: "Configuración", icon: <SettingsIcon /> },
    ],
  },
]

/** Mapa id → etiqueta legible, para títulos de sección. */
export const NAV_LABEL: Record<string, string> = Object.fromEntries(
  NAV_GROUPS.flatMap((group) => group.items.map((item) => [item.id, item.label as string]))
)
