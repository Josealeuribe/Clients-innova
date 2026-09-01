import {
  checkDisponibilidad,
  fetchUbicaciones,
} from '@/shared/api/client'

export const registrationService = {
  fetchUbicaciones() {
    return fetchUbicaciones()
  },

  checkDocumento(docNum: string) {
    return checkDisponibilidad({ docNum })
  },

  checkEmail(email: string) {
    return checkDisponibilidad({ email })
  },
}
