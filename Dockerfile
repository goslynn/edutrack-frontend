# ── build: compila el bundle estático. devDeps + source viven SOLO en esta etapa ──
FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@11.1.3 --activate
# Manifiestos primero: la capa de deps se cachea mientras no cambien.
# strictDepBuilds=false: no corremos build scripts de deps (msw) — pnpm 11 aborta
# el install si no, y un bundle de prod no los necesita.
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --config.strictDepBuilds=false
COPY . .
# Vite inlinea import.meta.env en build-time ⇒ la URL del API es un ARG, no runtime.
# Una env var real (la que setea ENV) gana sobre .env.production en Vite.
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
# Invocamos los binarios directo (no `pnpm run`): pnpm 11 fuerza un re-chequeo de
# deps antes de cada script que vuelve a abortar por el build de msw. Equivale al
# script `build` de package.json: typecheck + bundle.
RUN node_modules/.bin/tsc -b && node_modules/.bin/vite build

# ── test: vitest + coverage. Reusa deps/source del stage build (devDeps incluidas). ──
# Uso: docker build --target test -t edutrack-front:test . && docker run --rm edutrack-front:test
# Iteración rápida montando el código: docker run --rm -v "$PWD:/app" -v /app/node_modules edutrack-front:test
FROM build AS test
ENV CI=true
CMD ["node_modules/.bin/vitest", "run", "--coverage"]

# ── runtime: solo node + un static server + dist/ (sin source, sin devDeps) ──────
FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
# `serve -s` sirve la SPA con fallback a index.html (necesario para react-router).
# El listen DEBE ser tcp://0.0.0.0 — un `-l 5173` pelado liga solo a localhost
# dentro del contenedor y el puerto publicado por Docker (vía eth0) no lo alcanza.
RUN npm install -g serve@14.2.4
COPY --from=build /app/dist ./dist
USER node
EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "tcp://0.0.0.0:5173"]
