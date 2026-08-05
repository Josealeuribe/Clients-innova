import type {
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
  MeResponse,
  SpinResponse,
  AdminClienteRow,
  CanjePreview,
  CanjeHistorialRow,
} from './types'

export class ApiError extends Error {}

// En desarrollo queda vacio y las rutas relativas las resuelve el proxy de
// Vite (ver server.proxy en vite.config.ts). En produccion el front y la API
// viven en dominios distintos, asi que VITE_API_URL trae el host completo.
const API_BASE = import.meta.env.VITE_API_URL ?? ''

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  const body = await res.json().catch(() => null)

  if (!res.ok) {
    throw new ApiError(body?.error || 'Ocurrió un error inesperado. Intenta de nuevo.')
  }

  return body as T
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` }
}

export function spinRoulette() {
  return request<SpinResponse>('/ruleta/girar-anonimo', { method: 'POST' })
}

export function registerCliente(payload: RegisterPayload) {
  return request<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function loginCliente(identifier: string, password: string) {
  return request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier, password }),
  })
}

// Chequeo de disponibilidad en tiempo real de correo/documento (ver uso con
// debounce en RegistrationPage). Se puede pedir uno, otro o ambos a la vez.
export function checkDisponibilidad(params: { email?: string; docNum?: string }) {
  const query = new URLSearchParams()
  if (params.email) query.set('email', params.email)
  if (params.docNum) query.set('docNum', params.docNum)
  return request<{ emailDisponible?: boolean; docNumDisponible?: boolean }>(`/auth/disponibilidad?${query}`)
}

export function fetchMe(token: string) {
  return request<MeResponse>('/auth/me', { headers: authHeaders(token) })
}

// --- Admin ---

export function adminFetchClientes(token: string) {
  return request<{ clientes: AdminClienteRow[] }>('/admin/clientes', { headers: authHeaders(token) })
}

// --- Cajero ---

export function cajeroBuscarCodigo(token: string, codigo: string) {
  return request<CanjePreview>(`/cajero/codigo/${encodeURIComponent(codigo)}`, { headers: authHeaders(token) })
}

export function cajeroConfirmarCanje(token: string, codigo: string) {
  return request<{ ok: true } & CanjePreview>(`/cajero/codigo/${encodeURIComponent(codigo)}/canjear`, {
    method: 'POST',
    headers: authHeaders(token),
  })
}

export function cajeroFetchHistorial(token: string) {
  return request<{ canjes: CanjeHistorialRow[] }>('/cajero/historial', { headers: authHeaders(token) })
}
