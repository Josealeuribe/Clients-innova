export interface ClienteSafe {
  id: number
  nombres: string
  apellidos: string
  email: string
  docNumero: string
  telefono: string
  departamento: string
  ciudad: string
}

export interface StaffSafe {
  id: number
  nombre: string
  email: string
  rol: 'admin' | 'cajero'
  /** Casino donde trabaja. Null para el admin, que no pertenece a uno. */
  sede: Sede | null
  /**
   * Entró con una clave temporal (o con la inicial derivada de la cédula) y
   * tiene que cambiarla antes de poder trabajar. El panel lo bloquea hasta
   * que lo haga.
   */
  debeCambiarPassword: boolean
}

export interface PremioInfo {
  clave: string
  nombre: string
  detalle: string
  monetario: boolean
}

// El bono sigue visible para el cliente después de canjeado, como constancia
// de que lo redimió: `estado` pasa a 'reclamado' y se llenan canjeadoEn/sede.
export interface BonoInfo {
  codigo: string
  estado: string
  creadoEn: string
  canjeadoEn: string | null
  /** Hasta cuándo se puede redimir. Copia de la vigencia del premio. */
  vigenciaHasta: string
  /** Casino al que el cliente debe ir a redimir: viene del premio. */
  sedeRedencion: Sede | null
  /** Casino donde realmente se redimió: el de quien lo entregó. */
  sede: string | null
  /** Quién lo entregó. Va en el comprobante del cliente. */
  canjeadoPor: string | null
  premio: PremioInfo
}

// Contrato explícito de participación. Hoy es deducible de `bono`, pero la
// ruleta pregunta "¿ya participó?" y no debería tener que inferirlo del
// estado del bono.
export interface EstadoParticipacion {
  yaParticipo: boolean
  bonoCanjeado: boolean
}

// El login es único para clientes y personal (admin/cajero); `tipo` decide
// a qué panel se redirige tras autenticarse.
export type LoginResponse =
  | ({ token: string; tipo: 'cliente'; cliente: ClienteSafe; bono: BonoInfo | null } & EstadoParticipacion)
  | { token: string; tipo: 'staff'; staff: StaffSafe }

export interface RegisterResponse extends EstadoParticipacion {
  token: string
  tipo: 'cliente'
  cliente: ClienteSafe
  bono: BonoInfo | null
  bonoError?: string | null
}

export type MeResponse =
  | ({ tipo: 'cliente'; cliente: ClienteSafe; bono: BonoInfo | null } & EstadoParticipacion)
  | { tipo: 'staff'; staff: StaffSafe }

export interface SpinResponse extends GirosRestantes {
  premio: PremioInfo
  ticket: string
}

// Control de giros por visitante. El conteo lo lleva el servidor: recargar la
// página no lo reinicia.
export interface GirosRestantes {
  usados: number
  maximo: number
  restantes: number
  /**
   * Identidad firmada del visitante. Se guarda y se reenvía en cada llamada a
   * la ruleta porque en el celular la cookie de visitante no sobrevive: es
   * cookie de terceros y Safari/Chrome móvil la bloquean. Ver
   * server/src/utils/visitante.ts.
   */
  visitanteToken?: string
}

export interface DepartamentoApi {
  nombre: string
  municipios: string[]
}

export interface RegisterPayload {
  nombres: string
  apellidos: string
  docType: string
  docNum: string
  birth: string
  phone: string
  dept: string
  city: string
  email: string
  pass: string
  passConfirm: string
  terminos: boolean
  datos: boolean
  edad: boolean
  promo: boolean
  comms: boolean
  ticket?: string | null
}

// --- Admin ---

export interface AdminClienteBono {
  codigo: string
  estado: string
  creadoEn: string
  canjeadoEn: string | null
  canjeadoPor: string | null
  sede: string | null
  sedeRedencion: string | null
  premio: { nombre: string; monetario: boolean }
}

export interface AdminClienteRow {
  id: number
  nombres: string
  apellidos: string
  docTipo: string
  docNumero: string
  nacimiento: string
  telefono: string
  departamento: string
  ciudad: string
  email: string
  createdAt: string
  bono: AdminClienteBono | null
}

// Cuenta de personal vista desde el panel de administración.
export interface AdminUsuarioRow {
  id: number
  nombre: string
  email: string
  rol: 'admin' | 'cajero'
  activo: boolean
  sede: string | null
  debeCambiarPassword: boolean
  /** Cuántos bonos ha entregado. Sirve para no restablecer a quien no es. */
  canjes: number
  createdAt: string
  /**
   * ¿Hay actividad reciente de esta cuenta? Lo decide el servidor, no el
   * navegador: comparar fechas contra el reloj local daría un estado distinto
   * en cada equipo mal sincronizado.
   *
   * Opcional a propósito. El front y la API son dos servicios de Render que se
   * despliegan por separado; si esta vista sale antes que la API con presencia,
   * el campo llega `undefined` y la tarjeta muestra "Sin datos" en vez de
   * afirmar que alguien está fuera de línea sin saberlo.
   */
  enLinea?: boolean
  /**
   * Marca cruda de la última señal de vida (ISO). Null si nunca entró o si
   * cerró sesión. Sirve para decir "hace 12 min", que es lo que distingue
   * "acaba de salir" de "no ha entrado en todo el turno".
   */
  ultimaActividad?: string | null
}

// La clave temporal viaja UNA sola vez, en esta respuesta: no se guarda en
// claro en ningún lado. Si el admin la pierde, genera otra.
export interface ResetPasswordResponse {
  ok: true
  usuario: { id: number; nombre: string; email: string }
  temporal: string
}

// --- Cajero ---

export interface Sede {
  clave: string
  nombre: string
  direccion: string
}

export interface CanjePreview {
  codigo: string
  estado: string
  vigenciaHasta: string
  vencido: boolean
  premio: { nombre: string; detalle: string; monetario: boolean }
  cliente: {
    nombres: string
    apellidos: string
    docTipo: string
    docNumero: string
    email: string
    telefono: string
    ciudad: string
    departamento: string
    registradoEn: string
  }
  sedeCanje: string | null
  canjeadoPor: string | null
  sedeRedencion: Sede | null
}

// Resultado de buscar un cliente por documento en el panel de cajero
// (cliente que llegó sin código). El bono viene aunque ya esté canjeado, para
// poder explicarle cuándo y dónde se entregó.
export interface BusquedaPorDocumento {
  cliente: {
    nombres: string
    apellidos: string
    docTipo: string
    docNumero: string
    email: string
    telefono: string
    ciudad: string
    departamento: string
    registradoEn: string
  }
  bono: {
    codigo: string
    estado: string
    creadoEn: string
    canjeadoEn: string | null
    vigenciaHasta: string
    vencido: boolean
    canjeadoPor: string | null
    sede: string | null
    sedeRedencion: Sede | null
    premio: { nombre: string; detalle: string; monetario: boolean }
  } | null
}

export interface AdminCanjeRow {
  codigo: string
  creadoEn: string
  canjeadoEn: string | null
  horasHastaCanje: number | null
  sede: string | null
  sedeRedencion: string | null
  canjeadoPor: string | null
  canjeadoPorEmail: string | null
  premio: { nombre: string; monetario: boolean }
  cliente: {
    nombres: string
    apellidos: string
    docTipo: string
    docNumero: string
    email: string
    telefono: string
  }
}

// `soloPropios` es true cuando quien consulta es una cajera: solo ve sus
// canjes. Un admin recibe false y ve todos.
export interface HistorialResponse {
  soloPropios: boolean
  canjes: CanjeHistorialRow[]
}

export interface CanjeHistorialRow {
  codigo: string
  canjeadoEn: string
  canjeadoPor: string | null
  sede: string | null
  premio: { nombre: string; monetario: boolean }
  cliente: { nombres: string; apellidos: string; docNumero: string }
}
