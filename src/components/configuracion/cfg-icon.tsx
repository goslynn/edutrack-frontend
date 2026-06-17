import {
  LogOutIcon,
  MonitorSmartphoneIcon,
  ScrollTextIcon,
  SchoolIcon,
  ShieldCheckIcon,
  Trash2Icon,
  UserRoundIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react"

/**
 * Resuelve las claves de icono (kebab-case) que viajan en los datos de
 * Configuración hacia su componente de lucide-react. Mantiene el dato
 * serializable y deja la elección visual en la capa de UI.
 */
const ICONS: Record<string, LucideIcon> = {
  users: UsersIcon,
  "shield-check": ShieldCheckIcon,
  school: SchoolIcon,
  "scroll-text": ScrollTextIcon,
  "user-round": UserRoundIcon,
  "monitor-smartphone": MonitorSmartphoneIcon,
  "log-out": LogOutIcon,
  "trash-2": Trash2Icon,
}

interface CfgIconProps {
  name: string
  className?: string
}

export function CfgIcon({ name, className }: CfgIconProps) {
  const Icon = ICONS[name]
  if (!Icon) return null
  return <Icon className={className} aria-hidden />
}
