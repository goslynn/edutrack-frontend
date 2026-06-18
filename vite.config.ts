import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: true,
    port: 5173,
    watch: {
      usePolling: true,
    },
    proxy: {
      // Forward all gateway-routed paths to avoid CORS in dev (pnpm dev runs
      // on a different port than the gateway's CORS_ALLOW_ORIGIN).
      '/auth': 'http://localhost:8080',
      '/bff': 'http://localhost:8080',
    },
  },
})
