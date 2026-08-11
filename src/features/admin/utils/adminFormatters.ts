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
