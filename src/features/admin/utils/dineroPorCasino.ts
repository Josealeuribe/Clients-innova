import type { AdminClienteRow } from '@/shared/api/types'
import { ordenarSedes } from '../charts/paleta'
import { valorDeBono } from './valorPremios'

// DINERO ENTREGADO POR CASINO
//
// LAS DOS COLUMNAS SON DOS DIMENSIONES DISTINTAS, Y ESO ES A PROPÓSITO
//
// "Entregado aquí" se atribuye a `bono.sede`: el casino donde la cajera pagó de
// verdad. Es la pregunta de caja — de qué caja salió el dinero.
//
// "Por entregar aquí" se atribuye a `bono.sedeRedencion`: el casino al que el
// premio manda al cliente. Un bono pendiente todavía NO tiene sede de entrega,
// así que no hay otra dimensión posible para él.
//
// Mezclarlas en una sola cifra daría un número sin significado. Separadas y con
// el encabezado diciendo cuál es cuál, cada una responde algo real: cuánto ya
// salió de esta caja, y cuánto tiene comprometido.
//
// Que un bono se entregue en un casino distinto al asignado es posible y el
// esquema lo registra a propósito (ver BonoGanado.sedeCanjeId). Por eso las dos
// columnas de una misma fila no tienen por qué cuadrar entre sí.

/** Bono ya pagado cuya sede de entrega no quedó registrada. */
export const SIN_SEDE_ENTREGA = 'Sin sede de entrega registrada'
/** Bono pendiente cuyo premio no apunta a ningún casino. */
export const SIN_SEDE_ASIGNADA = 'Sin casino asignado'

export interface DineroSede {
  sede: string
  /** Pesos que ya salieron de esta caja. */
  entregado: number
  /** Bonos monetarios que componen `entregado`. */
  monetariosEntregados: number
  /** Cortesías entregadas aquí. Cuentan por cantidad, nunca en pesos. */
  cortesiasEntregadas: number
  /** Premios entregados aquí que no están en la tabla de valoración. */
  sinValorizarEntregados: number
  /** Pesos comprometidos: bonos vivos que se redimen en este casino. */
  pendiente: number
  monetariosPendientes: number
  cortesiasPendientes: number
  sinValorizarPendientes: number
}

const filaVacia = (sede: string): DineroSede => ({
  sede,
  entregado: 0,
  monetariosEntregados: 0,
  cortesiasEntregadas: 0,
  sinValorizarEntregados: 0,
  pendiente: 0,
  monetariosPendientes: 0,
  cortesiasPendientes: 0,
  sinValorizarPendientes: 0,
})

export function buildDineroPorCasino(clientes: AdminClienteRow[] | null) {
  if (!clientes) return null

  const filas = new Map<string, DineroSede>()
  const fila = (sede: string) => {
    const existente = filas.get(sede)
    if (existente) return existente
    const nueva = filaVacia(sede)
    filas.set(sede, nueva)
    return nueva
  }

  for (const cliente of clientes) {
    const bono = cliente.bono
    if (!bono) continue

    const valor = valorDeBono(bono)

    if (bono.estado === 'reclamado') {
      const f = fila(bono.sede ?? SIN_SEDE_ENTREGA)
      if (valor.tipo === 'monetario') {
        f.entregado += valor.valor
        f.monetariosEntregados += 1
      } else if (valor.tipo === 'cortesia') {
        f.cortesiasEntregadas += 1
      } else {
        f.sinValorizarEntregados += 1
      }
      continue
    }

    // Todo lo que no está reclamado sigue comprometido con el casino que le
    // toca. Se cuenta como pendiente aunque esté vencido: el dinero no se
    // entregó, y para caja eso es lo que importa. El detalle de vencimiento por
    // premio vive en la sección Vigencias, que es donde se decide qué hacer.
    const f = fila(bono.sedeRedencion ?? SIN_SEDE_ASIGNADA)
    if (valor.tipo === 'monetario') {
      f.pendiente += valor.valor
      f.monetariosPendientes += 1
    } else if (valor.tipo === 'cortesia') {
      f.cortesiasPendientes += 1
    } else {
      f.sinValorizarPendientes += 1
    }
  }

  const sedes = ordenarSedes(Array.from(filas.values()))
  const suma = (leer: (f: DineroSede) => number) => sedes.reduce((t, f) => t + leer(f), 0)

  return {
    sedes,
    totales: {
      entregado: suma((f) => f.entregado),
      pendiente: suma((f) => f.pendiente),
      monetariosEntregados: suma((f) => f.monetariosEntregados),
      monetariosPendientes: suma((f) => f.monetariosPendientes),
      cortesiasEntregadas: suma((f) => f.cortesiasEntregadas),
      cortesiasPendientes: suma((f) => f.cortesiasPendientes),
      sinValorizarEntregados: suma((f) => f.sinValorizarEntregados),
      sinValorizarPendientes: suma((f) => f.sinValorizarPendientes),
    },
    /** Ticket promedio de lo ya pagado. Null cuando todavía no hay nada pagado. */
    promedioEntregado: (() => {
      const bonos = suma((f) => f.monetariosEntregados)
      return bonos > 0 ? Math.round(suma((f) => f.entregado) / bonos) : null
    })(),
  }
}

export type DineroPorCasino = NonNullable<ReturnType<typeof buildDineroPorCasino>>
