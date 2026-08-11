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

  return {
    totalClientes: clientes.length,
    sinBono: clientes.length - conBono.length,
    pendientes: pendientes.length,
    reclamados: reclamados.length,
    porPremio: Array.from(porPremio.entries()).sort((a, b) => b[1] - a[1]),
    recientes: clientes.slice(0, 5),
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
