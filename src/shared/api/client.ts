import type {
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
  MeResponse,
  SpinResponse,
  AdminClienteRow,
  CanjePreview,
  HistorialResponse,
  BusquedaPorDocumento,
  AdminCanjeRow,
  GirosRestantes,
  DepartamentoApi,
} from './types'

export class ApiError extends Error {}

// En desarrollo queda vacio y las rutas relativas las resuelve el proxy de
// Vite (ver server.proxy en vite.config.ts). En produccion el front y la API
// viven en dominios distintos, asi que VITE_API_URL trae el host completo.
// Se recorta la barra final: si la variable se define como "https://api.com/"
// el fetch terminaria pidiendo "https://api.com//api/..." y esa ruta doble no
// coincide con ningun router de Express.
const API_BASE = (import.meta.env.VITE_API_URL ?? '').trim().replace(/\/+$/, '')

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

// Solo los endpoints de la ruleta viajan con credenciales: son los únicos que
// usan la cookie de visitante anónimo (el límite de 3 giros). Mandarla en
// todas las peticiones acoplaba TODA la API a que el backend tuviera
// `credentials: true` en CORS — y mientras esa versión no esté desplegada, el
// navegador descarta cada respuesta cross-origin y se cae la app entera.
// Acotarlo deja el resto funcionando aunque el backend vaya un paso atrás.
const CON_COOKIE_DE_VISITANTE: RequestInit = { credentials: 'include' }

// Se manda el token si existe, aunque el endpoint sea anónimo: así el backend
// puede rechazar el giro de un cliente que ya tiene cuenta. Sin esto la regla
// viviría solo en el navegador.
export function spinRoulette(token?: string | null) {
  return request<SpinResponse>('/ruleta/girar-anonimo', {
    ...CON_COOKIE_DE_VISITANTE,
    method: 'POST',
    headers: token ? authHeaders(token) : undefined,
  })
}

// Cuántos giros le quedan al visitante. Se consulta al abrir la ruleta para
// mostrar el contador sin gastar un giro.
export function fetchGirosRestantes() {
  return request<GirosRestantes>('/ruleta/giros-restantes', CON_COOKIE_DE_VISITANTE)
}

// Departamentos y municipios: los sirve el backend desde la tabla contra la
// que además valida el registro, así no pueden desincronizarse.
export function fetchUbicaciones() {
  return request<{ departamentos: DepartamentoApi[] }>('/ubicaciones')
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

export function adminFetchCanjes(token: string) {
  return request<{ canjes: AdminCanjeRow[] }>('/admin/canjes', { headers: authHeaders(token) })
}

// --- Cajero ---

export function cajeroBuscarCodigo(token: string, codigo: string) {
  return request<CanjePreview>(`/cajero/codigo/${encodeURIComponent(codigo)}`, { headers: authHeaders(token) })
}

// Para el cliente que llega sin código: se busca por su documento.
export function cajeroBuscarPorDocumento(token: string, docNumero: string) {
  return request<BusquedaPorDocumento>(`/cajero/cliente/${encodeURIComponent(docNumero)}`, {
    headers: authHeaders(token),
  })
}

// No lleva sede: cada premio pertenece a un casino y el backend la deduce del
// bono. Pedírsela al cajero solo abría la puerta a registrarla mal.
export function cajeroConfirmarCanje(token: string, codigo: string) {
  return request<{ ok: true } & CanjePreview>(`/cajero/codigo/${encodeURIComponent(codigo)}/canjear`, {
    method: 'POST',
    headers: authHeaders(token),
  })
}

export function cajeroFetchHistorial(token: string) {
  return request<HistorialResponse>('/cajero/historial', { headers: authHeaders(token) })
}
