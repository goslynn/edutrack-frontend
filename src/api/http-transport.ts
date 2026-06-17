// ── HttpTransport ────────────────────────────────────────────────────
// Interfaz estructural mínima de transporte. Tanto el cliente genérico
// (`createHttpClient`) como el específico (`createEdutrackClient`) la
// satisfacen, de modo que la capa de recursos (`api/<servicio>.ts`) puede
// recibir cualquiera de los dos sin acoplarse al mecanismo de auth.

import type { HttpClient } from './http-client'

export type HttpTransport = Pick<HttpClient, 'request' | 'get' | 'post' | 'put' | 'patch' | 'delete'>
