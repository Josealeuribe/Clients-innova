import type { AdminClienteRow } from '@/shared/api/types'
import { type ColumnaExcel, descargarExcel, fechaParaNombre } from '@/shared/utils/exportarExcel'
import { valorDeBono } from './valorPremios'

// LAS COLUMNAS DEL EXCEL DE CLIENTES
//
// La hoja lleva TODO lo que el panel sabe de cada cliente, no solo las seis
// columnas que caben en la tabla: quien exporta lo hace justamente para cruzar
// los datos que la pantalla no muestra (fecha de nacimiento, código del bono,
// quién lo canjeó y en qué sede). Una fila por cliente, como en el panel.

// "pendiente" -> "Pendiente". Cualquier estado nuevo que agregue el servidor
// sale legible sin tocar este archivo, en vez de caer a un "Canjeado" falso.
function estadoLegible(estado: string) {
  if (!estado) return ''
  return estado.charAt(0).toUpperCase() + estado.slice(1)
}

const COLUMNAS: ColumnaExcel<AdminClienteRow>[] = [
  { encabezado: 'ID', tipo: 'numero', ancho: 8, valor: (c) => c.id },
  { encabezado: 'Nombres', ancho: 20, valor: (c) => c.nombres },
  { encabezado: 'Apellidos', ancho: 20, valor: (c) => c.apellidos },
  { encabezado: 'Tipo de documento', ancho: 18, valor: (c) => c.docTipo },
  // Texto a propósito: como número, una cédula pierde los ceros a la izquierda
  // y deja de cruzar con la de cualquier otro sistema.
  { encabezado: 'Número de documento', ancho: 20, valor: (c) => c.docNumero },
  { encabezado: 'Fecha de nacimiento', tipo: 'fecha', ancho: 18, valor: (c) => c.nacimiento },
  { encabezado: 'Teléfono', ancho: 16, valor: (c) => c.telefono },
  { encabezado: 'Correo', ancho: 30, valor: (c) => c.email },
  { encabezado: 'Departamento', ancho: 18, valor: (c) => c.departamento },
  { encabezado: 'Ciudad', ancho: 18, valor: (c) => c.ciudad },
  { encabezado: 'Fecha de registro', tipo: 'fechaHora', ancho: 18, valor: (c) => c.createdAt },

  // --- Bono ---
  //
  // Un cliente sin bono deja estas celdas vacías salvo "Estado del bono", que
  // dice "Sin bono": así se pueden filtrar sin confundirlos con los pendientes.
  { encabezado: 'Premio', ancho: 24, valor: (c) => c.bono?.premio.nombre ?? null },
  { encabezado: 'Código del bono', ancho: 18, valor: (c) => c.bono?.codigo ?? null },
  {
    encabezado: 'Estado del bono',
    ancho: 16,
    valor: (c) => (c.bono ? estadoLegible(c.bono.estado) : 'Sin bono'),
  },
  {
    // Solo los premios con monto. Las cortesías y lo que no esté en la tabla de
    // valores quedan en blanco en vez de en cero — un cero suma y mentiría en
    // el total de la columna. Ver utils/valorPremios.ts.
    encabezado: 'Valor del premio',
    tipo: 'dinero',
    ancho: 16,
    valor: (c) => {
      if (!c.bono) return null
      const valor = valorDeBono(c.bono)
      return valor.tipo === 'monetario' ? valor.valor : null
    },
  },
  {
    // Dice por qué la columna de arriba está vacía. Sin esto, un premio que
    // falte en la tabla de valores se ve igual que una cortesía.
    encabezado: 'Valorización',
    ancho: 16,
    valor: (c) => {
      if (!c.bono) return null
      const valor = valorDeBono(c.bono)
      if (valor.tipo === 'monetario') return 'Monetario'
      return valor.tipo === 'cortesia' ? 'Cortesía' : 'Sin valorizar'
    },
  },
  {
    encabezado: 'Campaña',
    ancho: 20,
    valor: (c) => (c.bono ? (c.bono.promocion ?? 'Reparto permanente') : null),
  },
  { encabezado: 'Sede asignada', ancho: 20, valor: (c) => c.bono?.sede ?? null },
  { encabezado: 'Bono generado', tipo: 'fechaHora', ancho: 18, valor: (c) => c.bono?.creadoEn ?? null },
  { encabezado: 'Fecha de canje', tipo: 'fechaHora', ancho: 18, valor: (c) => c.bono?.canjeadoEn ?? null },
  { encabezado: 'Canjeado por', ancho: 20, valor: (c) => c.bono?.canjeadoPor ?? null },
  { encabezado: 'Sede de redención', ancho: 20, valor: (c) => c.bono?.sedeRedencion ?? null },
]

export function exportarClientesAExcel(clientes: AdminClienteRow[]) {
  descargarExcel({
    nombreArchivo: `clientes-gran-casino-cucuta-${fechaParaNombre()}`,
    hoja: 'Clientes',
    columnas: COLUMNAS,
    filas: clientes,
  })
}
