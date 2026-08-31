import type {
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
  MeResponse,
  SpinResponse,
  AdminClienteRow,
  AdminUsuarioRow,
  CanjePreview,
  HistorialResponse,
  BusquedaPorDocumento,
  AdminCanjeRow,
  GirosRestantes,
  DepartamentoApi,
  ResetPasswordResponse,
  VigenciasResponse,
  CambioVigenciaRow,
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

// EL ARREGLO DEL LÍMITE DE GIROS EN CELULAR
//
// La cookie de visitante sola no alcanza. En producción el front vive en
// gran-casino-cucuta1.onrender.com y la API en otro subdominio de
// onrender.com: como onrender.com está en la Public Suffix List, esos dos NO
// son el mismo sitio y la cookie viaja como cookie de TERCEROS. Safari en iOS
// las bloquea por completo y Chrome en Android va por el mismo camino, así
// que en el celular el navegador nunca la guardaba: cada giro llegaba sin
// identificar, el servidor creaba un visitante nuevo y el contador se quedaba
// clavado en "te quedan 2" dejando girar sin límite. En escritorio sí
// funcionaba, y por eso el bug solo se veía en móvil.
//
// El servidor devuelve además la misma identidad en un token firmado. Se
// guarda aquí y se reenvía en la cabecera `X-Visitante`, que ningún navegador
// bloquea. El token va firmado por el servidor: no sirve de nada inventarse
// uno para volver a girar.
const VISITANTE_KEY = 'gcc_visitante'

function cabeceraVisitante(): Record<string, string> {
  try {
    const token = localStorage.getItem(VISITANTE_KEY)
    return token ? { 'X-Visitante': token } : {}
  } catch {
    // Safari en modo privado puede lanzar al tocar localStorage. Sin token se
    // sigue: queda la cookie, y si tampoco está, el servidor tratará esta
    // visita como nueva — que es justo lo que hace hoy.
    return {}
  }
}

// Se guarda la identidad que devuelve el servidor. Se llama en TODA respuesta
// de la ruleta, no solo la primera: si el token se renueva, se conserva el
// último.
function guardarVisitante<T extends { visitanteToken?: string }>(respuesta: T): T {
  if (respuesta.visitanteToken) {
    try {
      localStorage.setItem(VISITANTE_KEY, respuesta.visitanteToken)
    } catch {
      // Almacenamiento bloqueado: se sigue con la cookie como única vía.
    }
  }
  return respuesta
}

// Se manda el token si existe, aunque el endpoint sea anónimo: así el backend
// puede rechazar el giro de un cliente que ya tiene cuenta. Sin esto la regla
// viviría solo en el navegador.
export function spinRoulette(token?: string | null) {
  return request<SpinResponse>('/ruleta/girar-anonimo', {
    ...CON_COOKIE_DE_VISITANTE,
    method: 'POST',
    headers: { ...cabeceraVisitante(), ...(token ? authHeaders(token) : {}) },
  }).then(guardarVisitante)
}

// Cuántos giros le quedan al visitante. Se consulta al abrir la ruleta para
// mostrar el contador sin gastar un giro, y de paso deja establecida la
// identidad antes del primer giro.
export function fetchGirosRestantes() {
  return request<GirosRestantes>('/ruleta/giros-restantes', {
    ...CON_COOKIE_DE_VISITANTE,
    headers: cabeceraVisitante(),
  }).then(guardarVisitante)
}

// --- Vigencia de la promoción ---
//
// Hasta cuándo se puede redimir cada premio. Es la MISMA llamada para las
// cuatro vistas que lo muestran (ruleta pública, panel de cliente, de cajero y
// de admin): la fecha sale de la base, no está escrita en ninguna pantalla, así
// que extender la promoción se ve en todas a la vez sin desplegar el frontend.
//
// Sin token a propósito: la ruleta la ve gente sin cuenta, y saber hasta cuándo
// puede redimir es justo lo que necesita ANTES de girar.
export function fetchVigencias() {
  return request<VigenciasResponse>('/promocion/vigencias')
}

// Registro de cambios de vigencia: quién movió cada fecha, cuándo y por qué.
// Solo personal (admin y cajero) — es auditoría interna. La cajera también lo
// necesita: es quien recibe el "a mí me dijeron otra fecha" en el mostrador.
export function fetchHistorialVigencias(token: string) {
  return request<{ cambios: CambioVigenciaRow[] }>('/promocion/historial', {
    headers: authHeaders(token),
  })
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

// --- Recuperación de contraseña (clientes) ---
//
// Tres pasos: pedir el código, verificarlo y cambiar la contraseña. El paso
// intermedio devuelve un token de corta vida para no tener que arrastrar el
// código hasta el final ni guardarlo en el navegador.

export function solicitarCodigoRecuperacion(email: string) {
  return request<{ ok: true; mensaje: string; vigenciaMinutos: number }>('/auth/recuperar', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export function verificarCodigoRecuperacion(email: string, codigo: string) {
  return request<{ token: string }>('/auth/recuperar/verificar', {
    method: 'POST',
    body: JSON.stringify({ email, codigo }),
  })
}

export function cambiarPasswordConCodigo(token: string, pass: string, passConfirm: string) {
  return request<{ ok: true }>('/auth/recuperar/cambiar', {
    method: 'POST',
    body: JSON.stringify({ token, pass, passConfirm }),
  })
}

// Cambio con la sesión abierta. Lo usan tanto el cliente como el personal:
// para admin y cajeras es la única vía de cambiar su propia contraseña, ya
// que sus correos no reciben mensajes.
export function cambiarPassword(token: string, actual: string, nueva: string, confirmar: string) {
  return request<{ ok: true }>('/auth/cambiar-password', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ actual, nueva, confirmar }),
  })
}

// --- Presencia del personal ---
//
// El latido que sostiene el "Activo" del módulo de Personal. Lo manda el panel
// mientras está abierto (ver AuthContext), porque una cajera puede estar en su
// puesto veinte minutos sin tocar nada y ese es justo el caso que hay que
// acertar.
//
// Las dos funciones son de mejor esfuerzo: si fallan, no hay nada que mostrarle
// al usuario — lo único que se pierde es precisión en un indicador. Quien las
// llama se encarga de ignorar el error.
export function registrarActividadStaff(token: string) {
  return request<{ ok: true }>('/auth/actividad', {
    method: 'POST',
    headers: authHeaders(token),
  })
}

// Apaga la presencia al cerrar sesión, para que la cuenta no siga apareciendo
// como "Activo" hasta que venza la ventana. NO invalida el token: la sesión es
// un JWT sin estado (ver POST /api/auth/salir en el backend).
export function cerrarSesionStaff(token: string) {
  return request<{ ok: true }>('/auth/salir', {
    method: 'POST',
    headers: authHeaders(token),
  })
}

// --- Admin ---

export function adminFetchClientes(token: string) {
  return request<{ clientes: AdminClienteRow[] }>('/admin/clientes', { headers: authHeaders(token) })
}

export function adminFetchCanjes(token: string) {
  return request<{ canjes: AdminCanjeRow[] }>('/admin/canjes', { headers: authHeaders(token) })
}

// `ventanaEnLineaSegundos` es el criterio que usó el servidor para decidir
// `enLinea` en cada fila. Viaja en la respuesta para que el panel pueda
// explicarlo sin repetir la constante aquí, donde se desincronizaría en cuanto
// alguien la cambie en el backend. Opcional: la API sin presencia no lo manda.
export function adminFetchUsuarios(token: string) {
  return request<{ usuarios: AdminUsuarioRow[]; ventanaEnLineaSegundos?: number }>('/admin/usuarios', {
    headers: authHeaders(token),
  })
}

// Genera una clave temporal para una cuenta de personal y obliga a cambiarla
// en el siguiente ingreso. Es el reemplazo del "olvidé mi contraseña" para el
// staff, cuyos correos @grancasino.com.co no son buzones reales.
export function adminRestablecerPassword(token: string, usuarioId: number) {
  return request<ResetPasswordResponse>(`/admin/usuarios/${usuarioId}/restablecer-password`, {
    method: 'POST',
    headers: authHeaders(token),
  })
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
