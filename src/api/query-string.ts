// ── buildQueryString ─────────────────────────────────────────────────
// Serializa params de query en `?k=v&...`. Genérico y sin reglas de dominio:
// omite `undefined`/`null`, expande arrays repitiendo la clave.

export type QueryValue = string | number | boolean | null | undefined
export type QueryParams = Record<string, QueryValue | readonly QueryValue[]>

export function buildQueryString(params?: QueryParams): string {
  if (!params) return ''

  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item === undefined || item === null) continue
        search.append(key, String(item))
      }
    } else {
      search.append(key, String(value))
    }
  }

  const qs = search.toString()
  return qs ? `?${qs}` : ''
}
