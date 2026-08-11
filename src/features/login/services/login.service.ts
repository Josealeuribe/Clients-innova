import {
  cambiarPasswordConCodigo,
  solicitarCodigoRecuperacion,
  verificarCodigoRecuperacion,
} from '@/shared/api/client'

// Centraliza las operaciones de recuperación. El inicio de sesión continúa
// pasando por AuthContext porque ese contexto es quien mantiene la sesión y
// el token de la aplicación.
export const loginService = {
  solicitarCodigo(email: string) {
    return solicitarCodigoRecuperacion(email)
  },

  verificarCodigo(email: string, codigo: string) {
    return verificarCodigoRecuperacion(email, codigo)
  },

  cambiarPassword(token: string, password: string, confirmacion: string) {
    return cambiarPasswordConCodigo(token, password, confirmacion)
  },
}
