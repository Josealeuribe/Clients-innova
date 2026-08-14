export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// "hace 12 min". Es lo que da sentido al "Fuera de línea" del módulo de
// Personal: sin esto, la ausencia de alguien que acaba de salir se ve igual que
// la de quien no ha entrado en todo el turno.
//
// Se corta en días: para algo más viejo que eso la fecha exacta ya no aporta a
// quien está monitoreando el turno de hoy.
export function formatDesdeAhora(iso: string | null | undefined) {
  if (!iso) return 'nunca ha entrado'

  const minutos = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000)
  if (!Number.isFinite(minutos) || minutos < 0) return 'hace un momento'
  if (minutos < 1) return 'hace un momento'
  if (minutos < 60) return `hace ${minutos} min`

  const horas = Math.floor(minutos / 60)
  if (horas < 24) return `hace ${horas} h`

  const dias = Math.floor(horas / 24)
  return dias === 1 ? 'hace 1 día' : `hace ${dias} días`
}

export function formatDemora(horas: number | null) {
  if (horas == null) return '—'
  if (horas < 1) return `${Math.round(horas * 60)} min`
  if (horas < 48) return `${horas} h`
  return `${Math.round(horas / 24)} días`
}

export function formatScheduledDate(value: string) {
  if (!value) return 'Envío manual'
  return new Date(value).toLocaleString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function estimateSmsSegments(message: string) {
  if (!message.length) return 0
  return Math.ceil(message.length / 160)
}
