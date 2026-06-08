#!/bin/sh

# Start Vite dev server directly (bypass pnpm's dependency checks)
exec node /app/node_modules/.bin/vite --host 0.0.0.0
