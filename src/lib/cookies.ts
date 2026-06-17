// ── Cookies ──────────────────────────────────────────────────────────
// Helper mínimo sobre `document.cookie`. Nota: estas cookies son legibles
// por JS (no HttpOnly), igual que `localStorage` — necesario para que un SPA
// pueda leer el token; se endurecen con `SameSite=Strict` y `Secure` en https.

export interface CookieOptions {
  /** Vida en segundos. Omitido ⇒ cookie de sesión (expira al cerrar el navegador). */
  maxAgeSeconds?: number
  path?: string
  sameSite?: 'Strict' | 'Lax' | 'None'
  secure?: boolean
}

export function setCookie(name: string, value: string, options: CookieOptions = {}): void {
  const {
    maxAgeSeconds,
    path = '/',
    sameSite = 'Strict',
    secure = location.protocol === 'https:',
  } = options

  let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Path=${path}; SameSite=${sameSite}`
  if (maxAgeSeconds !== undefined) cookie += `; Max-Age=${maxAgeSeconds}`
  if (secure) cookie += '; Secure'
  document.cookie = cookie
}

export function getCookie(name: string): string | null {
  const prefix = `${encodeURIComponent(name)}=`
  const match = document.cookie.split('; ').find((c) => c.startsWith(prefix))
  return match ? decodeURIComponent(match.slice(prefix.length)) : null
}

export function deleteCookie(name: string, path = '/'): void {
  document.cookie = `${encodeURIComponent(name)}=; Path=${path}; Max-Age=0; SameSite=Strict`
}
