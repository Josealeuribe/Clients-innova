import type { AdminClienteBono } from '@/shared/api/types'

// VALOR EN PESOS DE CADA PREMIO
//
// POR QUÉ ESTA TABLA EXISTE EN EL FRONTEND
//
// El modelo `Premio` del servidor (server/prisma/schema.prisma) tiene
// `monetario: Boolean` pero NO tiene una columna de valor: hoy el monto solo
// vive dentro del texto del nombre ("Bono de $5.000"). Para poder decir cuánto
// dinero se entregó en cada casino hace falta un valor por premio, y esta tabla
// es esa fuente — una sola, declarada, en un solo archivo.
//
// POR QUÉ NO SE DEDUCE DEL NOMBRE
//
// Parsear el número de "Bono de $5.000" funciona hasta que entre un premio con
// otro formato ("Bono de cinco mil", "Bono 10K"), y ahí no falla con un error:
// devuelve null o un número equivocado y el panel sigue mostrando un total con
// cara de cierto. Un tablero de dinero que miente es peor que no tenerlo.
//
// CÓMO SE MANTIENE
//
// Cuando se agregue o cambie un premio en server/prisma/seed.ts, hay que
// agregarlo aquí. Un premio que no esté en esta tabla NO se cuenta como cero:
// se reporta aparte como "sin valorizar" (ver `valorDeBono`), para que la
// omisión se vea en pantalla en vez de desaparecer dentro del total.
//
// `null` significa una cosa concreta y distinta de "no lo sé": este premio no
// tiene valor monetario asignado por el negocio. Son los tres premios de
// cortesía, que se reportan por cantidad y nunca en pesos.
export const VALOR_POR_CLAVE: Record<string, number | null> = {
  'bono-5000': 5_000,
  'bono-10000': 10_000,
  'bono-20000': 20_000,
  'bono-50000': 50_000,
  // Cortesías: se entregan, cuentan como bono, pero no se valorizan.
  'carton-bingo': null,
  'entrada-evento': null,
  'premio-sorpresa': null,
}

// Respaldo por nombre, para cuando `premioClave` no venga en la respuesta.
//
// Hace falta de verdad: el frontend y la API son dos servicios de Render que se
// despliegan por separado. Si esta vista sale antes que una API que mande la
// clave, sin este respaldo TODOS los bonos quedarían sin valorizar y el panel
// mostraría cero pesos entregados — que es justo la clase de mentira que la
// tabla de arriba viene a evitar.
const CLAVE_POR_NOMBRE: Record<string, string> = {
  'Bono de $5.000': 'bono-5000',
  'Bono de $10.000': 'bono-10000',
  'Bono de $20.000': 'bono-20000',
  'Bono de $50.000': 'bono-50000',
  'Cartón de Bingo Premium': 'carton-bingo',
  'Entrada a Evento Especial': 'entrada-evento',
  'Premio Sorpresa': 'premio-sorpresa',
}

export type ValorBono =
  /** Premio con valor en pesos. Suma al total de dinero. */
  | { tipo: 'monetario'; valor: number }
  /** Cortesía sin valor asignado. Cuenta por cantidad, nunca en pesos. */
  | { tipo: 'cortesia' }
  /** Premio que no está en la tabla. Se reporta aparte, no como cero. */
  | { tipo: 'sin-valorizar' }

export function claveDeBono(bono: AdminClienteBono): string | null {
  return bono.premioClave ?? CLAVE_POR_NOMBRE[bono.premio.nombre] ?? null
}

export function valorDeBono(bono: AdminClienteBono): ValorBono {
  const clave = claveDeBono(bono)
  if (clave == null || !(clave in VALOR_POR_CLAVE)) return { tipo: 'sin-valorizar' }

  const valor = VALOR_POR_CLAVE[clave]
  return valor == null ? { tipo: 'cortesia' } : { tipo: 'monetario', valor }
}
