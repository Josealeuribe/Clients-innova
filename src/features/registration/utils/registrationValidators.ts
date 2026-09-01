export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const MIN_EDAD = 18
export const MAX_EDAD = 100

export function edadDesdeFecha(fechaISO: string): number {
  const nacimiento = new Date(fechaISO)
  const hoy = new Date()

  let edad = hoy.getFullYear() - nacimiento.getFullYear()

  const aunNoCumple =
    hoy.getMonth() < nacimiento.getMonth() ||
    (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate())

  if (aunNoCumple) edad--

  return edad
}

export function getDocumentFormatError(docNum: string, docType: string): string {
  const value = docNum.trim()

  if (value.length > 0 && value.length < 5) {
    return 'El documento debe tener al menos 5 caracteres.'
  }

  if (value.length > 0 && docType !== 'Pasaporte' && !/^\d+$/.test(value)) {
    return 'Este tipo de documento solo debe contener números.'
  }

  return ''
}

export function getBirthError(birth: string): string {
  if (!birth) return ''

  const fecha = new Date(birth)

  if (Number.isNaN(fecha.getTime())) {
    return 'Ingresa una fecha válida.'
  }

  if (fecha.getTime() > Date.now()) {
    return 'La fecha de nacimiento no puede ser futura.'
  }

  const edad = edadDesdeFecha(birth)

  if (edad < MIN_EDAD) {
    return `Debes ser mayor de ${MIN_EDAD} años para registrarte.`
  }

  if (edad > MAX_EDAD) {
    return 'Verifica la fecha ingresada.'
  }

  return ''
}

export function getPhoneError(phone: string): string {
  return phone.trim().length > 0 && phone.replace(/\D/g, '').length < 7
    ? 'Ingresa un número de celular válido.'
    : ''
}

export function getEmailFormatError(email: string): string {
  return email.trim().length > 0 && !EMAIL_REGEX.test(email.trim())
    ? 'Ingresa un correo válido.'
    : ''
}

export function getPasswordStrength(pass: string): number {
  if (pass.length === 0) return 0
  if (pass.length < 6) return 1
  if (pass.length < 10) return 2
  if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) return 4
  return 3
}

export function isPasswordValid(pass: string): boolean {
  return pass.length >= 8 && /[A-Z]/.test(pass) && /[0-9]/.test(pass)
}

export function getPasswordConfirmError(pass: string, passConfirm: string): string {
  return passConfirm.length > 0 && pass !== passConfirm
    ? 'Las contraseñas no coinciden.'
    : ''
}

export const PASS_LABELS = ['', 'Muy débil', 'Débil', 'Buena', 'Fuerte'] as const
export const PASS_COLORS = ['', '#ef4444', '#f97316', '#eab308', '#22c55e'] as const
