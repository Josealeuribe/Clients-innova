export function limpiarCodigoRecuperacion(value: string) {
  return value.replace(/\D/g, '').slice(0, 6)
}

export function codigoRecuperacionCompleto(value: string) {
  return /^\d{6}$/.test(value.trim())
}

export function puedePrellenarCorreo(value: string) {
  // Se conserva el mismo criterio del componente original: si el identificador
  // escrito para iniciar sesión contiene @, se reutiliza en recuperación.
  return value.includes('@')
}
