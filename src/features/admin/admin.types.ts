export type AdminSection =
  | 'overview'
  | 'clientes'
  | 'canjes'
  | 'vigencias'
  | 'campanas'
  | 'personal'
  | 'cuenta'

export type CampanaAudiencia = 'todos' | 'bono_pendiente' | 'sin_bono'
export type CampanaEstado = 'borrador' | 'preparada'

export interface CampanaFormData {
  nombre: string
  mensaje: string
  audiencia: CampanaAudiencia
  programadaPara: string
}

export interface Campana extends CampanaFormData {
  id: string
  estado: CampanaEstado
  createdAt: string
  updatedAt: string
}

export interface TemporalPassword {
  nombre: string
  email: string
  clave: string
}
