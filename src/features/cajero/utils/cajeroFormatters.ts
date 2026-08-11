export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function buildCanjeSuccessMessage(result: {
  premio: { nombre: string }
  cliente: { nombres: string; apellidos: string }
  sedeRedencion?: { nombre: string } | null
}) {
  return (
    `Bono "${result.premio.nombre}" canjeado para ${result.cliente.nombres} ${result.cliente.apellidos}` +
    `${result.sedeRedencion ? ` en ${result.sedeRedencion.nombre}` : ''}.`
  )
}
