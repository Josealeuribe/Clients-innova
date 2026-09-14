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

// --- Dinero ---
//
// Sin decimales: en Colombia los bonos son montos redondos y ".00" en cada
// cifra de una tabla de tres casinos solo suma ruido.
const PESOS = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

export function formatCOP(valor: number) {
  return PESOS.format(valor)
}

// Version compacta para la cifra grande del modal y las etiquetas de eje, donde
// "$ 1.235.000" no cabe. Se corta en millones porque es el orden de magnitud
// real de la promocion; por encima de mil millones vuelve a la cifra completa
// antes que inventar una unidad que nadie usa en caja.
export function formatCOPCorto(valor: number) {
  if (valor === 0) return '$0'
  if (Math.abs(valor) < 1_000) return `$${valor}`
  if (Math.abs(valor) < 1_000_000) return `$${(valor / 1_000).toLocaleString('es-CO', { maximumFractionDigits: 0 })}K`
  if (Math.abs(valor) < 1_000_000_000) {
    return `$${(valor / 1_000_000).toLocaleString('es-CO', { maximumFractionDigits: 1 })}M`
  }
  return formatCOP(valor)
}

// Un dia 'YYYY-MM-DD' (ya resuelto en hora de Colombia por dashboardStats)
// como "26 sept". Vive aqui y no en la grafica porque la vista de tabla muestra
// la MISMA fecha: con dos formateadores, la tabla acabo mostrando el dia crudo.
//
// Se le pone el mediodia para formatear: con la medianoche en UTC, un navegador
// en Colombia mostraria el dia anterior.
const DIA_CORTO = new Intl.DateTimeFormat('es-CO', {
  day: '2-digit',
  month: 'short',
  timeZone: 'America/Bogota',
})

export function formatDiaCorto(dia: string) {
  return DIA_CORTO.format(new Date(`${dia}T12:00:00Z`))
}

// Miles con punto, sin simbolo de moneda: para conteos de bonos y personas.
export function formatNumero(valor: number) {
  return valor.toLocaleString('es-CO')
}
