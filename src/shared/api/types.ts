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

// --- Vigencia de la promoción ---
//
// Cada premio tiene SU PROPIA fecha de vencimiento: pueden convivir un bono que
// vence el 30 de septiembre con otro que se lance después y venza en noviembre.
// Por eso el contrato es una LISTA y no una fecha suelta.

export interface VigenciaPremio {
  clave: string
  nombre: string
  detalle: string
  monetario: boolean
  /** Hasta cuándo se puede redimir un bono de este premio (ISO). */
  vigenciaHasta: string
  /** Lo decide el servidor con SU reloj, no el del equipo que mira la pantalla. */
  vencido: boolean
  /** Días completos que faltan, contados por fecha de calendario colombiana. */
  diasRestantes: number
  sede: Sede | null
  /** Bonos de este premio que siguen sin redimir. */
  bonosPendientes: number
}

export interface VigenciasResponse {
  vigencias: VigenciaPremio[]
  /**
   * La fecha única de toda la promoción, cuando todos los premios coinciden —
   * hoy es el caso. Null en cuanto entre un premio con fecha distinta, y ahí la
   * vista debe mostrar el detalle premio por premio.
   *
   * Viaja calculada desde el servidor para que las cuatro pantallas que la
   * muestran no lleguen cada una a su propia conclusión.
   */
  vigenciaComun: string | null
  /** La última fecha en juego: hasta cuándo queda algo vivo de la promoción. */
  vigenciaMaxima: string | null
  /** Hora del servidor. Se compara contra esta y no contra el reloj local. */
  consultadoEn: string
}

// Una entrada del registro de cambios de vigencia. Solo la ve el personal: es
// auditoría interna ("quién movió la fecha y cuándo"), no una condición de la
// promoción.
export interface CambioVigenciaRow {
  id: number
  premio: { clave: string; nombre: string }
  anterior: string
  nueva: string
  /** true si alargó la promoción, false si la acortó. Lo decide el servidor. */
  extiende: boolean
  motivo: string
  /** Bonos ya entregados que se arrastraron con el cambio. */
  bonosAfectados: number
  registradoPor: string
  creadoEn: string
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
  /**
   * Identificador estable del casino (av-5, avenida-0, ventura-plaza). Null
   * para el admin, que no pertenece a uno.
   *
   * El panel agrupa por esta clave y no por `sede`: agrupar por el nombre
   * comercial haría que renombrar un casino partiera su grupo en dos.
   */
  sedeClave?: string | null
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
   * Última vez que se le vio (ISO). Null significa UNA sola cosa: nunca ha
   * entrado. Cerrar sesión ya NO la borra — antes sí, y por eso quien acababa
   * de salir aparecía como "nunca ha entrado".
   */
  ultimaActividad?: string | null
  /**
   * Última vez que cerró sesión (ISO), o null si no lo ha hecho desde su
   * última actividad. Con las dos fechas se puede decir por qué no está: si se
   * fue por su cuenta o si simplemente dejó de dar señales (navegador cerrado
   * de golpe, sin internet, equipo apagado).
   */
  sesionCerradaEn?: string | null
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
