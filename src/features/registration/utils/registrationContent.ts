import type { RegistrationStep } from '../registration.types'

export const DOCUMENT_TYPES = [
  'Cédula de Ciudadanía',
  'Pasaporte',
  'Tarjeta de Extranjería',
]

export const STEP_CONTENT: Record<RegistrationStep, { title: string; description: string }> = {
  1: {
    title: 'Datos Personales',
    description: 'Ingresa tu información personal para crear tu cuenta.',
  },
  2: {
    title: 'Ubicación',
    description: 'Selecciona tu departamento y ciudad.',
  },
  3: {
    title: 'Datos de Acceso',
    description: 'Crea tu usuario y contraseña.',
  },
  4: {
    title: 'Confirmaciones',
    description: 'Acepta los términos para completar tu registro.',
  },
}
