import {
  ApiError,
  cajeroBuscarCodigo,
  cajeroBuscarPorDocumento,
  cajeroConfirmarCanje,
  cajeroFetchHistorial,
} from '@/shared/api/client'

export const cajeroService = {
  buscarCodigo(token: string, codigo: string) {
    return cajeroBuscarCodigo(token, codigo)
  },

  buscarPorDocumento(token: string, documento: string) {
    return cajeroBuscarPorDocumento(token, documento)
  },

  confirmarCanje(token: string, codigo: string) {
    return cajeroConfirmarCanje(token, codigo)
  },

  fetchHistorial(token: string) {
    return cajeroFetchHistorial(token)
  },
}

export function getCajeroError(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback
}
