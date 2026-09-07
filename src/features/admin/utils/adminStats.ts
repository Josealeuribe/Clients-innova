import type { AdminClienteRow } from '@/shared/api/types'
import type { CampanaAudiencia } from '../admin.types'

export function buildAdminStats(clientes: AdminClienteRow[] | null) {
  if (!clientes) return null

  const conBono = clientes.filter((c) => c.bono)
  const pendientes = conBono.filter((c) => c.bono?.estado === 'pendiente')
  const reclamados = conBono.filter((c) => c.bono?.estado === 'reclamado')
  const porPremio = new Map<string, number>()

  for (const cliente of conBono) {
    const nombre = cliente.bono!.premio.nombre
    porPremio.set(nombre, (porPremio.get(nombre) || 0) + 1)
  }

  // DOS ESTADÍSTICAS SEPARADAS, A PROPÓSITO
  //
  // Los premios GENERALES son los que el sistema reparte equilibrando las 3
  // sedes. Los PROMOCIONALES salieron de la campaña del bingo de Ventura
  // Plaza, que ya cerró: fue una entrega extraordinaria de una sola sede y sus
  // bonos siguen en la base.
  //
  // Mezclarlos rompe las dos lecturas: Ventura Plaza aparecería como la sede
  // con más premios solo por esa campaña, y quien mire el panel concluiría que
  // el reparto sigue desbalanceado cuando no lo está. Por eso el reparto por
  // sede se mide ÚNICAMENTE sobre los generales — igual que lo hace el sorteo
  // en el servidor (ver server/src/utils/sorteoPremios.ts).
  const generales = conBono.filter((c) => !c.bono!.promocion)
  const promocionales = conBono.filter((c) => c.bono!.promocion)

  const porSedeGenerales = new Map<string, number>()
  for (const cliente of generales) {
    const sede = cliente.bono!.sedeRedencion ?? 'Sin sede'
    porSedeGenerales.set(sede, (porSedeGenerales.get(sede) || 0) + 1)
  }

  return {
    totalClientes: clientes.length,
    sinBono: clientes.length - conBono.length,
    pendientes: pendientes.length,
    reclamados: reclamados.length,
    porPremio: Array.from(porPremio.entries()).sort((a, b) => b[1] - a[1]),
    recientes: clientes.slice(0, 5),
    // Premios generales por sede: la medida del equilibrio entre casinos.
    porSedeGenerales: Array.from(porSedeGenerales.entries()).sort((a, b) => b[1] - a[1]),
    totalGenerales: generales.length,
    totalPromocionales: promocionales.length,
    promocionalesPendientes: promocionales.filter((c) => c.bono!.estado === 'pendiente').length,
  }
}

export function countAudience(clientes: AdminClienteRow[] | null, audiencia: CampanaAudiencia) {
  if (!clientes) return 0

  if (audiencia === 'bono_pendiente') {
    return clientes.filter((c) => c.bono?.estado === 'pendiente').length
  }

  if (audiencia === 'sin_bono') {
    return clientes.filter((c) => !c.bono).length
  }

  return clientes.length
}
