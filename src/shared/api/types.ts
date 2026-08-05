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
}

export interface PremioInfo {
  clave: string
  nombre: string
  detalle: string
  monetario: boolean
}

export interface BonoInfo {
  codigo: string
  estado: string
  creadoEn: string
  premio: PremioInfo
}

// El login es único para clientes y personal (admin/cajero); `tipo` decide
// a qué panel se redirige tras autenticarse.
export type LoginResponse =
  | { token: string; tipo: 'cliente'; cliente: ClienteSafe; bono: BonoInfo | null }
  | { token: string; tipo: 'staff'; staff: StaffSafe }

export interface RegisterResponse {
  token: string
  tipo: 'cliente'
  cliente: ClienteSafe
  bono: BonoInfo | null
  bonoError?: string | null
}

export type MeResponse =
  | { tipo: 'cliente'; cliente: ClienteSafe; bono: BonoInfo | null }
  | { tipo: 'staff'; staff: StaffSafe }

export interface SpinResponse {
  premio: PremioInfo
  ticket: string
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

// --- Cajero ---

export interface CanjePreview {
  codigo: string
  estado: string
  premio: { nombre: string; detalle: string; monetario: boolean }
  cliente: { nombres: string; apellidos: string; docTipo: string; docNumero: string }
}

export interface CanjeHistorialRow {
  codigo: string
  canjeadoEn: string
  canjeadoPor: string | null
  premio: { nombre: string; monetario: boolean }
  cliente: { nombres: string; apellidos: string; docNumero: string }
}
