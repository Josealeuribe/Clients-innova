import type { AdminClienteRow } from '@/shared/api/types'
import { ordenarSedes } from '../charts/paleta'
import { SIN_SEDE_ASIGNADA, SIN_SEDE_ENTREGA } from './dineroPorCasino'

// ESTADÍSTICAS DEL DASHBOARD
//
// UN BONO ES UNA PERSONA
//
// `BonoGanado.clienteId` es @unique en el esquema: la base impide que un mismo
// jugador acumule más de un bono. Por eso "bonos reclamados" y "personas que
// reclamaron" son EL MISMO número y no una aproximación — el dashboard lo dice
// en pantalla para que nadie tenga que asumirlo.
//
// LA FECHA SE AGRUPA EN HORA DE COLOMBIA
//
// Agrupar por día con el reloj del navegador partiría los canjes de la noche en
// el día siguiente para un equipo en otro huso, y en las cajas eso pasa. Se usa
// la misma zona que el resto del sistema (ver shared/utils/vigencia.ts).
const ZONA = 'America/Bogota'
const DIA_ISO = new Intl.DateTimeFormat('en-CA', {
  timeZone: ZONA,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

function diaColombiano(iso: string) {
  return DIA_ISO.format(new Date(iso))
}

export interface SedeBonos {
  sede: string
  /** Bonos que se redimen en este casino (por sede del premio). */
  asignados: number
  /** De esos, los que el cliente ya vino a reclamar. */
  entregados: number
  pendientes: number
  /** entregados / asignados, entre 0 y 1. */
  tasaReclamo: number
}

export interface PremioBonos {
  nombre: string
  total: number
  entregados: number
  pendientes: number
}

export interface PuntoSerie {
  /** Día en formato YYYY-MM-DD, hora de Colombia. */
  dia: string
  /** Canjes acumulados hasta ese día, por sede de entrega. */
  acumulado: Record<string, number>
}

export function buildDashboardStats(clientes: AdminClienteRow[] | null) {
  if (!clientes) return null

  const conBono = clientes.filter((c) => c.bono)
  const reclamados = conBono.filter((c) => c.bono!.estado === 'reclamado')

  // --- Bonos por casino asignado -------------------------------------------
  //
  // Una sola dimensión: la sede del premio. Es lo que hace legítimo apilar
  // entregados y pendientes en la misma barra — las dos partes hablan del mismo
  // grupo de bonos, y juntas suman el total asignado a ese casino.
  const porSede = new Map<string, SedeBonos>()
  const filaSede = (sede: string) => {
    const existente = porSede.get(sede)
    if (existente) return existente
    const nueva: SedeBonos = { sede, asignados: 0, entregados: 0, pendientes: 0, tasaReclamo: 0 }
    porSede.set(sede, nueva)
    return nueva
  }

  for (const cliente of conBono) {
    const bono = cliente.bono!
    const fila = filaSede(bono.sedeRedencion ?? SIN_SEDE_ASIGNADA)
    fila.asignados += 1
    if (bono.estado === 'reclamado') fila.entregados += 1
    else fila.pendientes += 1
  }
  for (const fila of porSede.values()) {
    fila.tasaReclamo = fila.asignados > 0 ? fila.entregados / fila.asignados : 0
  }

  // --- Entregas por casino donde se entregó de verdad ----------------------
  //
  // Otra dimensión distinta: de qué caja salió el bono. Puede no coincidir con
  // la de arriba, y el esquema guarda las dos justamente para poder verlo.
  const entregasPorSede = new Map<string, number>()
  let fueraDeSede = 0
  for (const cliente of reclamados) {
    const bono = cliente.bono!
    const sede = bono.sede ?? SIN_SEDE_ENTREGA
    entregasPorSede.set(sede, (entregasPorSede.get(sede) ?? 0) + 1)
    if (bono.sede && bono.sedeRedencion && bono.sede !== bono.sedeRedencion) fueraDeSede += 1
  }

  // --- Cuánto tarda la gente en venir a reclamar ---------------------------
  //
  // MEDIANA Y NO PROMEDIO
  //
  // Un solo bono redimido el último día de la vigencia arrastra el promedio
  // semanas hacia arriba y deja de describir a nadie. La mediana dice lo que le
  // pasa al cliente del medio, que es la pregunta real: cuánto se demora la
  // gente normal en pasar por caja.
  const demoras = reclamados
    .map((c) => c.bono!)
    .filter((b) => b.canjeadoEn != null)
    .map((b) => (new Date(b.canjeadoEn!).getTime() - new Date(b.creadoEn).getTime()) / 3_600_000)
    .sort((a, b) => a - b)

  const demoraMedianaHoras = demoras.length === 0
    ? null
    : demoras.length % 2 === 1
      ? demoras[(demoras.length - 1) / 2]
      : (demoras[demoras.length / 2 - 1] + demoras[demoras.length / 2]) / 2

  // --- Bonos por premio ----------------------------------------------------
  const porPremio = new Map<string, PremioBonos>()
  for (const cliente of conBono) {
    const bono = cliente.bono!
    const fila = porPremio.get(bono.premio.nombre) ?? {
      nombre: bono.premio.nombre,
      total: 0,
      entregados: 0,
      pendientes: 0,
    }
    fila.total += 1
    if (bono.estado === 'reclamado') fila.entregados += 1
    else fila.pendientes += 1
    porPremio.set(bono.premio.nombre, fila)
  }

  // --- Serie de canjes acumulados por sede ---------------------------------
  //
  // ACUMULADO Y NO CANJES POR DÍA
  //
  // El conteo diario de una promoción de este tamaño son unos pocos canjes por
  // día: la línea queda en un diente de sierra entre 0 y 3 donde no se lee
  // ninguna tendencia. El acumulado responde la pregunta que el panel tiene que
  // responder — cuánto ha entregado cada casino y a qué ritmo — y las tres
  // líneas se separan solas cuando una sede se adelanta.
  const sedesConEntrega = ordenarSedes(
    Array.from(entregasPorSede.keys()).map((sede) => ({ sede })),
  ).map((f) => f.sede)

  const porDia = new Map<string, Record<string, number>>()
  for (const cliente of reclamados) {
    const bono = cliente.bono!
    if (!bono.canjeadoEn) continue
    const dia = diaColombiano(bono.canjeadoEn)
    const sede = bono.sede ?? SIN_SEDE_ENTREGA
    const cubeta = porDia.get(dia) ?? {}
    cubeta[sede] = (cubeta[sede] ?? 0) + 1
    porDia.set(dia, cubeta)
  }

  const acumulados: Record<string, number> = {}
  for (const sede of sedesConEntrega) acumulados[sede] = 0
  const serie: PuntoSerie[] = Array.from(porDia.keys())
    .sort()
    .map((dia) => {
      for (const [sede, cantidad] of Object.entries(porDia.get(dia)!)) {
        acumulados[sede] = (acumulados[sede] ?? 0) + cantidad
      }
      return { dia, acumulado: { ...acumulados } }
    })

  return {
    totalClientes: clientes.length,
    conBono: conBono.length,
    sinBono: clientes.length - conBono.length,
    // Un bono por cliente (clienteId es @unique), así que este número ES la
    // cantidad de personas que reclamaron.
    personasQueReclamaron: reclamados.length,
    pendientes: conBono.length - reclamados.length,
    /** Sobre los clientes que tienen bono, no sobre todos los registrados. */
    tasaReclamoGeneral: conBono.length > 0 ? reclamados.length / conBono.length : 0,
    /** Horas que tarda el cliente del medio en venir a redimir. Null si nadie ha venido. */
    demoraMedianaHoras,
    porSede: ordenarSedes(Array.from(porSede.values())),
    entregasPorSede: ordenarSedes(
      Array.from(entregasPorSede.entries()).map(([sede, entregados]) => ({ sede, entregados })),
    ),
    fueraDeSede,
    porPremio: Array.from(porPremio.values()).sort((a, b) => b.total - a.total),
    serie,
    sedesConEntrega,
  }
}

export type DashboardStats = NonNullable<ReturnType<typeof buildDashboardStats>>
