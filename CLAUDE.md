# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Frontend SPA para **EduTrack**, el libro de clases digital del Colegio Bernardo O'Higgins (Coquimbo). Consume la API expuesta por el API Gateway del monorepo en `../` (microservicios Quarkus: Auth, Course, Student, Content, Assessment, Attendance, Annotation, Notification, Report).

Para el contexto de negocio, modelo de permisos y contratos del backend, leer:
- `../CLAUDE.md` — convenciones del monorepo backend.
- `../doc/permisos.md` — modelo de autorización Unix-style (relevante para qué endpoints están autorizados a llamar y cómo interpretar 401/403).
- `../doc/requisitos_libro_clases.csv` — matriz de requisitos (incluye los `FE-*` del frontend).
- `../doc/edutrack_patterns.html` — patrones visuales/UX de referencia.

**Stack:** Vite + React 19 + TypeScript + Tailwind CSS. Package manager: **pnpm** (lockfile `pnpm-lock.yaml`).

> Tailwind aún no está instalado en el scaffold inicial — agregarlo al hacer el primer trabajo de UI real.

## Ejecución: siempre dentro de Docker (regla dura)

**Toda ejecución de esta webapp se hace contenerizada con Docker.** El host tiene Node/pnpm instalados y los comandos `pnpm …` funcionan localmente, pero por regla de desarrollo del proyecto **no se ejecutan en el host** — se corren dentro del contenedor para garantizar paridad entre devs, CI y producción.

Esto aplica a `dev`, `build`, `lint`, `preview` y cualquier futuro `test`. Si Claude necesita ejecutar uno de estos comandos (p. ej. para verificar un cambio), debe hacerlo vía Docker (`docker compose up`, `docker compose run --rm web pnpm …`, o equivalente) — nunca llamar `pnpm dev` / `pnpm build` directo en el host.

Excepciones admitidas (no requieren contenedor):
- `pnpm install` / edición del lockfile (gestión de dependencias).
- Operaciones de tooling puramente locales del editor (typecheck del IDE, etc.).

> El `Dockerfile` / `docker-compose.yml` se agregan al hacer el primer trabajo de infra de runtime; cuando existan, registrar aquí los comandos canónicos.

## Comandos (referencia, ejecutar dentro del contenedor)

```bash
pnpm install            # instalar deps (puede correrse en host)
pnpm dev                # vite dev server con HMR
pnpm build              # tsc -b && vite build (typecheck + bundle)
pnpm lint               # eslint .
pnpm preview            # servir el bundle de producción
```

No hay setup de tests aún; al introducirlo, registrar aquí el runner y cómo correr un test individual.

## Arquitectura del frontend

### Separación visual / interacción (regla dura)

Toda la capa visual es **exclusivamente visual**. Las funciones que ejecutan efectos (llamadas HTTP, navegación, lógica de negocio) se **inyectan desde fuera** por props. Ningún componente bajo `components/` puede importar el cliente HTTP, hacer `fetch`, ni conocer endpoints.

- Un `<LoginForm>` sabe sus campos y, como mucho, validarlos; recibe `onSubmit(values)` por prop y no sabe ni a qué URL se postea.
- Las llamadas HTTP viven en una capa separada (`src/api/<servicio>.ts` u `src/services/`), tipadas contra el contrato del MS correspondiente, y se cablean en componentes "container" (páginas / hooks de feature).
- Los hooks de feature (`useLogin`, `useCourses`, …) orquestan estado + llamadas API y pasan handlers ya construidos a la capa visual.

### Componetización

Priorizar componetización agresiva siguiendo el estándar React + TS:

- **Exponer `className`** en todo componente visual (mergear con clases internas; preferir `clsx`/`cn` cuando se adopte).
- **Forwarded props del elemento subyacente**: para componentes básicos (Button, Input, Card) extender `ComponentPropsWithoutRef<'button'>` / etc. y `...rest`-spreadearlos. Para componentes más altos, exponer props React semánticas y específicas del componente.
- Mientras más básico el componente, más se acerca a un wrapper estilizado del elemento HTML; mientras más alto, más props de dominio expone.
- Los componentes visuales son **stateless** o solo manejan estado puramente visual (open/closed, focus). El estado de dominio vive arriba.

### Color: tokens semánticos (regla dura)

Toda la UI se colorea **exclusivamente** con los tokens semánticos definidos en `src/globals.css` (bloque `@theme`). Tailwind v4 los expone como utilidades nativas (`bg-primary`, `text-foreground`, `border-border`, etc.).

- **Prohibido** usar utilidades de color crudas de Tailwind (`bg-slate-*`, `text-indigo-*`, `from-zinc-*`, …) o valores arbitrarios (`bg-[#…]`, `text-[rgb(…)]`).
- **Prohibido** referenciar variables de marca crudas (`--color-brand-*`) fuera de `globals.css`; siempre se consume el rol semántico (`primary`, `accent`, `success`, …).
- Tokens disponibles: superficies (`background`, `surface`, `foreground`, `muted`, `border`), marca (`primary`, `secondary`, `accent`) y estados (`success`, `warning`, `danger`, `info`). Cada uno con su par `*-foreground` para el texto encima.
- Estados visuales no-color (`opacity-*`, `shadow-*`, `backdrop-blur-*`) sí están permitidos.
- Agregar un color nuevo = editar `globals.css` (paleta cruda → token semántico → su `*-foreground`). Nunca se consume la paleta cruda en componentes.

Motivación: un único punto de cambio para rediseño/dark mode/alto contraste y coherencia visual entre páginas y futuros microservicios del front.

### Convenciones TS / Lint

- `tsconfig.app.json` activa `verbatimModuleSyntax`, `erasableSyntaxOnly`, `noUnusedLocals`, `noUnusedParameters`. Usar `import type { … }` para tipos, y evitar `enum`/`namespace` (no son erasable).
- ESLint flat config con `typescript-eslint`, `react-hooks` y `react-refresh/vite` — respetar `react-refresh/only-export-components` (no co-exportar no-componentes desde archivos de componentes).
- React 19 + nuevo JSX transform: no importar `React` solo por JSX.

### Alineación con el backend

- **Autenticación:** el frontend hace login contra Auth Service, guarda el JWT y lo envía como `Authorization: Bearer …` al API Gateway (único punto de entrada).
- **401 vs 403:** 401 = sin/expirado token (redirigir a login / refrescar); 403 = autenticado pero sin permiso (mostrar estado de "no autorizado", no redirigir).
- **Formato de error:** todos los MS responden con el envelope `ErrorResponse` (`timestamp`, `status`, `error`, `code`, `message`, `path`, `metadata`, `trace?`). Tipar una única vez y consumirlo de forma uniforme; el `code` (`AUTH.USER.EMAIL_EXISTS`, …) es estable y switcheable para UX.
- **Vistas (`@JsonView`)**: el backend devuelve `Views.Base` por defecto y otras vistas por endpoint. El frontend debería tener tipos por vista (no un solo "User" gigante) para que el shape coincida con lo que efectivamente llega.
