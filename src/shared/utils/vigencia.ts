import type { VigenciaPremio } from '@/shared/api/types'

// LA FECHA SE FORMATEA SIEMPRE EN HORA DE COLOMBIA
//
// `timeZone` va explícito y no se deja al navegador. Las vigencias están
// escritas al último instante del día en Colombia (23:59:59 -05:00), así que un
// equipo configurado en otro huso — pasa en los computadores de caja y en los
// celulares en roaming — renderizaría "1 de octubre" para un bono que vence el
// 30 de septiembre. Un día de diferencia en la fecha que se le promete a un
// cliente no es un detalle cosmético.
const ZONA = 'America/Bogota'

export function formatVigencia(iso: string) {
  return new Date(iso).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: ZONA,
  })
}

// Versión corta para tablas y chips, donde el mes largo no cabe.
export function formatVigenciaCorta(iso: string) {
  return new Date(iso).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: ZONA,
  })
}

// Fin del día en Colombia (UTC-5), igual que en el backend.
const OFFSET_COLOMBIA_MS = 5 * 60 * 60 * 1000

// Estado de vigencia de una fecha suelta — la del bono que tiene un cliente,
// que es SU copia y puede diferir de la del catálogo.
//
// `ahoraIso` es la hora del SERVIDOR (viaja en la respuesta de vigencias). Se
// usa esa y no `Date.now()` porque en los computadores de caja el reloj se
// desajusta, y un bono vigente no puede verse como vencido por eso. Si no llega,
// se cae al reloj local: es mejor una cuenta aproximada que ninguna.
//
// Devuelve la misma forma que una fila del registro, para que `textoRestante` y
// `colorVigencia` sirvan igual para ambos casos.
export function estadoDeVigencia(iso: string, ahoraIso?: string | null) {
  const vence = new Date(iso).getTime()
  const ahora = ahoraIso ? new Date(ahoraIso).getTime() : Date.now()

  // Días contados por fecha de calendario colombiana, no por horas exactas: al
  // cliente se le dice "quedan 3 días", no "quedan 71 horas".
  const enDias = (ms: number) => Math.floor((ms - OFFSET_COLOMBIA_MS) / 86_400_000)

  return { vencido: vence < ahora, diasRestantes: enDias(vence) - enDias(ahora) }
}

// "vence hoy" / "quedan 3 días". Es lo que convierte una fecha en algo
// accionable: en el mostrador nadie calcula mentalmente cuántos días faltan
// hasta el 30 de septiembre.
export function textoRestante(vigencia: Pick<VigenciaPremio, 'vencido' | 'diasRestantes'>) {
  if (vigencia.vencido) return 'Vencido'
  const dias = vigencia.diasRestantes
  if (dias <= 0) return 'Vence hoy'
  if (dias === 1) return 'Vence mañana'
  return `Quedan ${dias} días`
}

// Un solo criterio de color para las cuatro vistas. Estaba a punto de quedar
// repetido en cada una, y con él el riesgo de que el mismo bono se viera en
// ámbar en un panel y en verde en otro.
//
// El umbral de 7 días es el aviso: es tiempo suficiente para que un cliente
// alcance a pasar por sede, y poco suficiente para que valga la pena decirlo.
export const DIAS_AVISO = 7

export function colorVigencia(vigencia: Pick<VigenciaPremio, 'vencido' | 'diasRestantes'>) {
  if (vigencia.vencido) return '#ef4444'
  if (vigencia.diasRestantes <= DIAS_AVISO) return '#eab308'
  return '#22c55e'
}
