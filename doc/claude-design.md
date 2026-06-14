# Claude Design — uso del sistema de diseño EduTrack

La fuente canónica visual del frontend es el proyecto **"EduTrack Design System"** en
[Claude Design](https://claude.ai/design) (claude.ai/design). Allí viven los tokens, las
primitivas re-skinneadas, el UI kit del producto (login → dashboard → calificaciones →
asistencia → anotaciones) y los templates oficiales. Este documento registra cómo se
consume ese sistema desde este repo.

## Cómo se obtiene el diseño (handoff bundle)

Claude Design exporta un **handoff bundle** (`.tar.gz`) pensado para agentes de código.
El bundle usado para el login se descargó de:

```
https://api.anthropic.com/v1/design/h/xpDtEHu5fne1aLfzdHyfOg
```

```bash
curl -sSL -o design.tar.gz 'https://api.anthropic.com/v1/design/h/<hash>'
tar -xzf design.tar.gz
```

> Cada export es una foto puntual del proyecto. Para iteraciones nuevas, generar un
> handoff fresco desde claude.ai/design (botón de export/handoff del proyecto) y repetir
> el proceso. En Claude Code también existe la herramienta `DesignSync` / skill
> `/design-sync` para leer y escribir el proyecto de diseño directamente.

### Estructura del bundle

```
edutrack-design-system/
├── README.md            # instrucciones para el agente: leer chats PRIMERO
├── chats/               # transcripts de iteración — aquí vive la intención del usuario
└── project/
    ├── README.md        # la guía de diseño: fundamentos de contenido, visuales, iconografía
    ├── styles.css       # entry point — manifest de @imports
    ├── tokens/          # colors / typography / spacing / fonts / base
    ├── components/      # primitivas React "framework-light" (referencia, no producción)
    ├── ui_kits/edutrack-app/   # recreación interactiva del producto
    ├── templates/login/        # ★ diseño OFICIAL de la página de login
    ├── assets/logo/     # wordmark + mark, variantes normal (superficies claras) y light (oscuras)
    ├── assets/fonts/    # Geist / Geist Mono woff2
    └── guidelines/      # specimen cards (colores, tipografía, spacing, marca)
```

**Orden de lectura:** `README.md` raíz → `chats/` (qué pidió el usuario y dónde quedó la
iteración) → el archivo de diseño primario → sus imports. Los HTML son prototipos: se
recrea su output visual con la tecnología del repo, no se copia su estructura interna.

## Qué se importó y dónde

| Fuente en el bundle | Destino en el repo |
|---|---|
| `tokens/colors.css` (tintes suaves `*-soft`, aliases shadcn `card/input/ring/muted-foreground/destructive`) | `src/globals.css` → bloque `@theme` |
| `tokens/typography.css` (familias Geist, escala 12–48px, tracking, interlineados) | `src/globals.css` → bloque `@theme` |
| `tokens/spacing.css` (radios 6/8/10/12/16, sombras frías base navy) | `src/globals.css` → bloque `@theme` |
| `tokens/fonts.css` (`@font-face` Geist/Geist Mono) | paquetes `@fontsource-variable/geist{,-mono}` importados desde `src/globals.css` |
| `assets/logo/*.svg` (4 variantes, sin fondo) | `src/assets/logo/` + `public/favicon.svg` (el mark) |
| `templates/login/index.html` (login oficializado) | `src/components/login-brand-pane.tsx`, `src/components/login-form.tsx`, `src/pages/LoginPage.tsx` |
| `components/navigation/Sidebar.jsx` + `data/Badge,Avatar` + `navigation/Tabs` (primitivas del DS) | re-creadas como primitivas en `src/components/ui/{sidebar,badge,avatar,tabs}.tsx` (Tailwind + tokens, no se copia el CSS inyectado) |
| `templates/dashboard/{index.html,dashboard.jsx,charts.jsx,data.js}` (home post-login «Inicio») | `src/pages/DashboardPage.tsx` (contenedor) + `src/components/dashboard/*` (shell, topbar, stats, charts SVG, accesos directos, 3 variantes de layout) + `src/data/dashboard-stub.ts` (datos de muestra). Token nuevo `--color-warning-strong` (#b07a00) para texto ámbar legible sobre tinte. |
| `components/forms/*` (primitivas del DS) | **No se copian.** Son re-creaciones para el design tool; en producción las primitivas son shadcn `base-maia` en `src/components/ui/`, re-skinneadas vía tokens |

## Reglas que el diseño fija (y este repo respeta)

- **shadcn = solo primitivas.** Se copian componentes de bajo nivel (Button, Input, Field,
  Checkbox, …) y se re-skinnean con el contrato de tokens. **Nunca** se importan blocks o
  page-templates pre-hechos (`login-02`, sidebar blocks, …): cada pantalla se compone a
  mano en el lenguaje visual de EduTrack (el antiguo `login-form.tsx` era el block
  `login-02` stock y por eso se reemplazó).
- **Color solo por tokens semánticos** (regla dura preexistente; el DS la hereda y la
  amplía con `*-soft` y los aliases shadcn).
- **Tipografía:** Geist Variable para toda la UI; Geist Mono para códigos, RUTs y
  numerales tabulares (`tabular-nums`).
- **Iconografía:** Lucide (`lucide-react`), única familia. Sin emoji, sin glifos unicode.
- **Copy:** español (Chile), trato de "tú", sentence case, vocabulario escolar chileno
  (curso, asignatura, apoderado, anotación). Notas decimales con coma (`5,9`).
- **Login:** decisiones cerradas en la iteración final del diseño — sin acceso con Google,
  sin referencias explícitas al establecimiento en la UI, logos siempre sin fondo
  (variante `-light` sobre superficies oscuras), overlay de éxito del prototipo descartado
  (en producción se navega al dashboard).

## Cómo re-sincronizar un cambio de diseño

1. Exportar un handoff nuevo y extraerlo (o leer el proyecto vía `DesignSync`).
2. Leer los `chats/` nuevos para capturar la intención de la iteración.
3. Diff de `tokens/*.css` contra el `@theme` de `src/globals.css` → portar deltas.
4. Assets nuevos (`assets/`) → `src/assets/`.
5. Pantallas/templates → recrear en React respetando la separación visual/interacción
   (componentes visuales en `src/components/`, efectos inyectados desde páginas/hooks).
6. Verificar contenerizado: build + lint dentro de Docker (ver `CLAUDE.md`).
