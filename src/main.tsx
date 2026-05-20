import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/globals.css'
import App from '@/App.tsx'
import { env } from '@/env'

console.log('[edutrack] API base URL:', env.apiBaseUrl, '(mode:', env.mode + ')')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
