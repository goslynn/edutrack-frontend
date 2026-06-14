import {
  BookOpenIcon,
  CalendarCheckIcon,
  ClipboardPlusIcon,
  DownloadIcon,
  GraduationCapIcon,
  MessageSquarePlusIcon,
  MessageSquareTextIcon,
  SendIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react"

/**
 * Resuelve las claves de icono (kebab-case) que viajan en los datos del
 * dashboard hacia su componente de lucide-react. Mantiene los datos
 * serializables y deja la elección visual del icono en la capa de UI.
 */
const ICONS: Record<string, LucideIcon> = {
  users: UsersIcon,
  "graduation-cap": GraduationCapIcon,
  "calendar-check": CalendarCheckIcon,
  "message-square-text": MessageSquareTextIcon,
  "message-square-plus": MessageSquarePlusIcon,
  "clipboard-plus": ClipboardPlusIcon,
  send: SendIcon,
  download: DownloadIcon,
  "book-open": BookOpenIcon,
}

interface DashIconProps {
  name: string
  size?: number
  className?: string
}

export function DashIcon({ name, size = 18, className }: DashIconProps) {
  const Icon = ICONS[name]
  if (!Icon) return null
  return <Icon size={size} className={className} aria-hidden />
}
