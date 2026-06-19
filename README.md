# Frontend — EduTrack

SPA del **libro de clases digital** del Colegio Bernardo O'Higgins. Interfaz web para la gestión de cursos, alumnos, asistencia, anotaciones y calificaciones. Consume la API a través del API Gateway.

- **Puerto local:** `5173`
- **Gateway URL:** `http://localhost:8080` (dev)
- **App Fly.io:** `edutrack-front`

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | React 19 + TypeScript 6 |
| Bundler | Vite |
| Estilos | Tailwind CSS v4 + tokens semánticos |
| Componentes | shadcn (primitivas vendoreadas en `src/components/ui/`) |
| Iconos | lucide-react |
| Fuentes | Geist Variable + Geist Mono |
| Enrutamiento | React Router 7 |
| Package manager | pnpm 11 |
| Testing | Vitest + Testing Library |

---

## IMPORTANTE: ejecución siempre en Docker

**Todo comando de desarrollo se corre dentro del contenedor Docker.** No ejecutar `pnpm` directamente en el host.

```bash
# Desde la raíz del monorepo
docker compose up front
```

Para correr comandos pnpm manualmente:

```bash
docker compose run --rm front pnpm <comando>
```

---

## Comandos disponibles

```bash
pnpm dev          # Vite dev server con HMR en :5173
pnpm build        # tsc -b && vite build
pnpm lint         # ESLint
pnpm preview      # Servir el bundle de producción
pnpm test         # Vitest run
pnpm test:watch   # Vitest watch
```

---

## Estructura del proyecto

```
src/
├── pages/                  ← componentes de página (LoginPage, dashboard/*)
│   └── dashboard/
│       ├── DashboardLayout.tsx
│       ├── configuracion/
│       ├── estudiantes/
│       ├── asistencia/
│       ├── anotaciones/
│       └── calificaciones/
├── components/
│   ├── ui/                 ← primitivas shadcn vendoreadas (no modificar estructura)
│   ├── dashboard/          ← Sidebar, Topbar, nav-config, charts/
│   ├── estudiantes/
│   ├── asistencia/
│   ├── anotaciones/
│   └── calificaciones/
├── api/                    ← clientes HTTP tipados por dominio (auth.ts, student.ts, …)
├── services/               ← lógica de negocio (llama a api/ y gestiona estado)
├── hooks/                  ← useLogin, useCourses, … (state + efectos)
├── context/                ← AuthContext
├── types/                  ← tipos TypeScript (User, Course, Student, …)
├── lib/                    ← utilidades (cn, date formatters, …)
├── data/                   ← datos estáticos
├── assets/logo/            ← wordmark/mark, variantes -light, sin fondo
├── globals.css             ← @theme Tailwind (tokens semánticos)
└── main.tsx
```

---

## Sistema de diseño

Los estilos siguen un sistema de **tokens semánticos** definidos en `src/globals.css`. Reglas:

- **Usar siempre tokens semánticos:** `bg-primary`, `text-foreground`, `border-accent`, etc.
- **Prohibido usar colores crudos:** no `bg-slate-500`, no `bg-[#3b82f6]`.
- Los componentes de `src/components/ui/` son primitivas de shadcn — no modificar su estructura interna.

---

## Convenciones de arquitectura

**Separación visual/interacción**  
Los componentes en `src/components/` son puramente visuales (reciben datos y callbacks por props, sin fetch ni navegación propia). La lógica vive en `hooks/` y `services/`.

**Enrutamiento**  
Una vista = una URL. Prohibido `useState(activePanel)` con render condicional para navegar entre vistas. Usar `<Outlet>` de React Router para layouts persistentes con contenido variable. El ítem activo se deriva del path, no se guarda en estado.

**Autenticación**  
El JWT se obtiene del Auth Service y se envía en `Authorization: Bearer <token>` al Gateway.

- `401` — token ausente o expirado → redirigir a login o refrescar token.
- `403` — autenticado pero sin permiso → mostrar estado "no autorizado" en la UI, **no redirigir**.

---

## Variables de entorno

| Variable | Default (dev) | Descripción |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8080` | URL base del API Gateway |

Esta variable se **hornea en build-time** (Vite inlinea `import.meta.env`). Para cambiarla en producción hay que reconstruir la imagen pasando el build arg en el `docker-compose.yml`.
