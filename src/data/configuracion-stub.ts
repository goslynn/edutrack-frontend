/**
 * Datos de muestra (stub) de la página de Configuración. En la app real esto
 * llega del backend (Auth y otros MS) vía hooks contenedores; aquí lo inyecta la
 * página. Solo datos: los tipos viven en `@/types/configuracion` y los mapas de
 * presentación (badges, labels i18n, metadata de flags) en la capa de
 * componentes.
 *
 * La página es un único documento con scroll dividido en secciones. Cada fila es
 * un control inline o un "enlace a panel". RBAC vive como un prop por fila:
 * state "enabled" | "disabled" | "hidden".
 */

import type {
  OrgUser,
  PanelRow,
  PermService,
  Role,
  RolePermissions,
  SettingsSection,
  UserRole,
} from "@/types/configuracion"

export const settingsSections: SettingsSection[] = [
  {
    id: "general",
    title: "General",
    desc: "Tus preferencias de uso en EduTrack.",
    rows: [
      {
        type: "segmented",
        id: "tema",
        label: "Tema",
        desc: "Apariencia de la interfaz.",
        value: "auto",
        options: [
          { value: "claro", label: "Claro" },
          { value: "oscuro", label: "Oscuro" },
          { value: "auto", label: "Automático" },
        ],
        state: "enabled",
      },
      {
        type: "segmented",
        id: "densidad",
        label: "Densidad",
        desc: "Espaciado de tablas y listas.",
        value: "comoda",
        options: [
          { value: "comoda", label: "Cómoda" },
          { value: "compacta", label: "Compacta" },
        ],
        state: "enabled",
      },
      {
        type: "select",
        id: "idioma",
        label: "Idioma",
        desc: "Idioma de la plataforma.",
        value: "es-CL",
        options: [
          { value: "es-CL", label: "Español (Chile)" },
          { value: "es", label: "Español" },
          { value: "en", label: "English" },
        ],
        state: "enabled",
      },
      {
        type: "select",
        id: "tz",
        label: "Zona horaria",
        desc: "Se usa para fechas y reportes.",
        value: "scl",
        options: [
          { value: "scl", label: "(GMT−4) Santiago" },
          { value: "utc", label: "(GMT+0) UTC" },
        ],
        state: "enabled",
      },
      {
        type: "select",
        id: "inicio",
        label: "Página de inicio",
        desc: "Pantalla que se abre al ingresar.",
        value: "dash",
        options: [
          { value: "dash", label: "Inicio" },
          { value: "cal", label: "Calificaciones" },
          { value: "asis", label: "Asistencia" },
        ],
        state: "enabled",
      },
      {
        type: "switch",
        id: "mail",
        label: "Notificaciones por correo",
        desc: "Resúmenes y avisos importantes a tu correo.",
        checked: true,
        state: "enabled",
      },
      {
        type: "switch",
        id: "push",
        label: "Notificaciones en la app",
        desc: "Alertas dentro de EduTrack.",
        checked: true,
        state: "enabled",
      },
    ],
  },
  {
    id: "system",
    title: "System",
    desc: "Administración de la plataforma y tu establecimiento.",
    rows: [
      {
        type: "panel",
        id: "usuarios",
        panel: "usuarios",
        icon: "users",
        label: "Usuarios",
        desc: "Personas con acceso, invitaciones y estado de cuenta.",
        state: "enabled",
      },
      {
        type: "panel",
        id: "roles",
        panel: "roles",
        icon: "shield-check",
        label: "Roles y permisos",
        desc: "Qué puede ver y hacer cada rol en la plataforma.",
        state: "enabled",
      },
      {
        type: "panel",
        id: "establecimiento",
        panel: "establecimiento",
        icon: "school",
        label: "Establecimiento",
        desc: "Datos del colegio, niveles y períodos académicos.",
        state: "enabled",
      },
      {
        type: "switch",
        id: "autoreg",
        label: "Registro automático de apoderados",
        desc: "Permite que apoderados creen su cuenta con un código de curso.",
        checked: false,
        state: "disabled",
      },
      {
        type: "panel",
        id: "auditoria",
        panel: "auditoria",
        icon: "scroll-text",
        label: "Registro de actividad",
        desc: "Historial de acciones realizadas en el sistema.",
        state: "enabled",
      },
    ],
  },
  {
    id: "account",
    title: "Account",
    desc: "Tu perfil personal y la seguridad de tu cuenta.",
    rows: [
      {
        type: "panel",
        id: "mi-cuenta",
        panel: "mi-cuenta",
        icon: "user-round",
        label: "Mi cuenta",
        desc: "Foto, nombre, correo y datos de contacto.",
        state: "enabled",
      },
      {
        type: "switch",
        id: "2fa",
        label: "Verificación en dos pasos",
        desc: "Pide un código adicional al iniciar sesión.",
        checked: false,
        state: "enabled",
      },
      {
        type: "panel",
        id: "sesiones",
        panel: "sesiones",
        icon: "monitor-smartphone",
        label: "Sesiones activas",
        desc: "Dispositivos donde tienes la sesión abierta.",
        state: "enabled",
      },
      {
        type: "action",
        id: "logoutall",
        label: "Cerrar sesión en todos los dispositivos",
        desc: "Cierra tu sesión en cualquier otro equipo.",
        action: { label: "Cerrar sesiones", variant: "outline", icon: "log-out" },
        state: "enabled",
      },
      // Ejemplo del tercer estado: esta fila simplemente no se renderiza para el
      // usuario actual (state: "hidden" → null).
      {
        type: "action",
        id: "delete",
        label: "Eliminar mi cuenta",
        desc: "Esta acción es permanente.",
        action: { label: "Eliminar", variant: "destructive", icon: "trash-2" },
        state: "hidden",
      },
    ],
  },
]

/** Metadatos de cada panel (para títulos del stub y breadcrumb). */
export const settingsPanels: Record<string, { label: string; desc?: string }> =
  Object.fromEntries(
    settingsSections.flatMap((s) =>
      s.rows
        .filter((r): r is PanelRow => r.type === "panel")
        .map((r) => [r.panel, { label: r.label, desc: r.desc }])
    )
  )

/* ============ Usuarios — recurso del panel CRUD ============ */

export const userRoles: UserRole[] = [
  { id: "admin", label: "Administrador", desc: "Acceso total a la configuración y los datos." },
  { id: "utp", label: "Dirección / UTP", desc: "Gestión académica e institucional." },
  { id: "jefe", label: "Profesor jefe", desc: "Gestiona su curso de jefatura y apoderados." },
  { id: "profe", label: "Profesor", desc: "Califica y pasa asistencia en sus asignaturas." },
  { id: "inspector", label: "Inspectoría", desc: "Asistencia, atrasos y convivencia escolar." },
  { id: "secretaria", label: "Secretaría", desc: "Matrícula y datos de contacto." },
]

export const orgUsers: OrgUser[] = [
  { id: "u1", name: "María Rojas", email: "maria.rojas@colegioandes.cl", username: "maria.rojas", roles: ["jefe", "profe"], status: "activo", last: "hace 12 min", you: true },
  { id: "u2", name: "Carlos Fuentes", email: "carlos.fuentes@colegioandes.cl", username: "carlos.fuentes", roles: ["admin"], status: "activo", last: "hace 1 h" },
  { id: "u3", name: "Javiera Soto", email: "j.soto@colegioandes.cl", username: "j.soto", roles: ["utp"], status: "activo", last: "ayer" },
  { id: "u4", name: "Diego Vergara", email: "diego.vergara@colegioandes.cl", username: "diego.vergara", roles: ["inspector"], status: "activo", last: "hace 5 h" },
  { id: "u5", name: "Camila Tapia", email: "camila.tapia@colegioandes.cl", username: "camila.tapia", roles: ["secretaria"], status: "activo", last: "hace 1 día" },
  { id: "u6", name: "Pedro Cáceres", email: "pedro.caceres@colegioandes.cl", username: "pedro.caceres", roles: ["profe"], status: "activo", last: "hace 3 días" },
  { id: "u7", name: "Sebastián Riquelme", email: "s.riquelme@colegioandes.cl", username: "s.riquelme", roles: ["jefe", "profe"], status: "activo", last: "hace 2 días" },
  { id: "u8", name: "Fernanda Lagos", email: "fernanda.lagos@colegioandes.cl", username: "fernanda.lagos", roles: ["profe"], status: "pendiente", last: "—" },
  { id: "u9", name: "Ana Morales", email: "ana.morales@colegioandes.cl", username: "ana.morales", roles: ["profe", "jefe"], status: "inhabilitado", last: "hace 2 meses" },
  { id: "u10", name: "Rodrigo Núñez", email: "rodrigo.nunez@colegioandes.cl", username: "rodrigo.nunez", roles: ["profe"], status: "activo", last: "hace 4 días" },
]

/* ============ Roles y permisos — recurso del panel ============ */

export const roles: Role[] = [
  { id: "admin", name: "Administrador", desc: "Acceso total a la configuración y los datos.", system: true, users: 2 },
  { id: "utp", name: "Dirección / UTP", desc: "Gestión académica e institucional.", system: false, users: 1 },
  { id: "jefe", name: "Profesor jefe", desc: "Gestiona su curso de jefatura y apoderados.", system: false, users: 2 },
  { id: "profe", name: "Profesor", desc: "Califica y pasa asistencia en sus asignaturas.", system: false, users: 4 },
  { id: "inspector", name: "Inspectoría", desc: "Asistencia, atrasos y convivencia escolar.", system: false, users: 1 },
  { id: "secretaria", name: "Secretaría", desc: "Matrícula y datos de contacto.", system: false, users: 1 },
]

/**
 * Respuesta tal cual de cada microservicio: la lista de sus resources. Con esos
 * resourceIds se le pide a Auth que asigne permisos a la combinación rol +
 * resourceId. Cada resourceId guarda FLAGS (modelo UNIX): r=4, w=2, x=1.
 */
export const permServices: PermService[] = [
  { label: "Cursos", icon: "book-open", response: { data: ["course.courses", "course.assignments", "course.sections", "course.enrollments"], meta: { service: "course", count: 4 } } },
  { label: "Calificaciones", icon: "graduation-cap", response: { data: ["grades.gradebook", "grades.reportcards"], meta: { service: "grades", count: 2 } } },
  { label: "Asistencia", icon: "calendar-check", response: { data: ["attendance.records", "attendance.justifications"], meta: { service: "attendance", count: 2 } } },
  { label: "Anotaciones", icon: "message-square-text", response: { data: ["annotations.entries"], meta: { service: "annotations", count: 1 } } },
  { label: "Reportes", icon: "file-bar-chart", response: { data: ["reports.exports", "reports.dashboards"], meta: { service: "reports", count: 2 } } },
  { label: "Usuarios y acceso", icon: "shield-check", response: { data: ["auth.users", "auth.roles"], meta: { service: "auth", count: 2 } } },
]

/**
 * Permisos asignados por rol: { roleId: { resourceId: flagByte } }. Los recursos
 * ausentes equivalen a 0 (sin permiso).
 */
export const rolePermissions: RolePermissions = {
  admin: {
    "course.courses": 7, "course.assignments": 7, "course.sections": 7, "course.enrollments": 7,
    "grades.gradebook": 7, "grades.reportcards": 7,
    "attendance.records": 7, "attendance.justifications": 7,
    "annotations.entries": 7,
    "reports.exports": 7, "reports.dashboards": 7,
    "auth.users": 7, "auth.roles": 7,
  },
  utp: {
    "course.courses": 6, "course.assignments": 6, "course.sections": 6, "course.enrollments": 6,
    "grades.gradebook": 6, "grades.reportcards": 7,
    "attendance.records": 4, "attendance.justifications": 6,
    "annotations.entries": 6,
    "reports.exports": 5, "reports.dashboards": 4,
    "auth.users": 4, "auth.roles": 4,
  },
  jefe: {
    "course.courses": 4, "course.assignments": 6, "course.sections": 4, "course.enrollments": 4,
    "grades.gradebook": 6, "grades.reportcards": 5,
    "attendance.records": 6, "attendance.justifications": 6,
    "annotations.entries": 6,
    "reports.exports": 4, "reports.dashboards": 4,
  },
  profe: {
    "course.courses": 4, "course.assignments": 6, "course.sections": 4,
    "grades.gradebook": 6, "grades.reportcards": 4,
    "attendance.records": 6, "attendance.justifications": 4,
    "annotations.entries": 6,
  },
  inspector: {
    "course.courses": 4, "course.sections": 4, "course.enrollments": 4,
    "attendance.records": 7, "attendance.justifications": 7,
    "annotations.entries": 4,
    "reports.exports": 5, "reports.dashboards": 4,
  },
  secretaria: {
    "course.courses": 4, "course.sections": 4, "course.enrollments": 6,
    "grades.reportcards": 4,
    "attendance.records": 4,
    "reports.exports": 5,
    "auth.users": 4,
  },
}
