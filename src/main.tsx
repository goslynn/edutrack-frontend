import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/globals.css'
import App from '@/App.tsx'
import { env } from '@/env'
import { loadSession } from '@/lib/session'

console.log('[edutrack] API base URL:', env.apiBaseUrl, '(mode:', env.mode + ')')

// Rehidrata la sesión desde cookies: inyecta el bearer token en el cliente HTTP
// antes del primer render (las rutas protegidas leen el estado de sesión).
loadSession()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
