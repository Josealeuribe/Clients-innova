import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import type { AdminClienteRow } from '@/shared/api/types'
import Paginacion from '@/shared/components/Paginacion'
import TablaResponsiva, { type ColumnaTabla } from '@/shared/components/TablaResponsiva'
import { usePaginacion } from '@/shared/hooks/usePaginacion'
import StatusBadge from '../components/StatusBadge'
import { formatDate } from '../utils/adminFormatters'

interface Props {
  clientes: AdminClienteRow[]
}

// Ninguna columna se oculta y ningun texto se corta: el ancho se reparte y el
// contenido envuelve. Ver TablaResponsiva para el porque.
const COLUMNAS: ColumnaTabla<AdminClienteRow>[] = [
  {
    etiqueta: 'Cliente',
    ancho: 'w-[20%]',
    principal: true,
    celda: (c) => <span className="text-[#F5E6C8] font-medium">{c.nombres} {c.apellidos}</span>,
  },
  {
    etiqueta: 'Documento',
    ancho: 'w-[16%]',
    celda: (c) => (
      <>
        <span className="block text-[#C4A97A]">{c.docTipo}</span>
        <span className="block text-xs text-[#6B5D3F]">{c.docNumero}</span>
      </>
    ),
  },
  {
    etiqueta: 'Contacto',
    ancho: 'w-[20%]',
    celda: (c) => (
      <>
        <span className="block text-[#C4A97A]">{c.email}</span>
        <span className="block text-xs text-[#6B5D3F]">{c.telefono}</span>
      </>
    ),
  },
  {
    etiqueta: 'Ubicación',
    ancho: 'w-[15%]',
    celda: (c) => <span className="text-[#9A7B50]">{c.ciudad}, {c.departamento}</span>,
  },
  {
    etiqueta: 'Registro',
    ancho: 'w-[14%]',
    celda: (c) => <span className="text-[#6B5D3F]">{formatDate(c.createdAt)}</span>,
  },
  {
    etiqueta: 'Bono',
    ancho: 'w-[15%]',
    celda: (c) =>
      c.bono ? (
        <div className="flex flex-col gap-1 items-end md:items-start">
          <span className="text-[#D4AF37] text-xs font-semibold">{c.bono.premio.nombre}</span>
          <StatusBadge
            label={c.bono.estado === 'pendiente' ? 'Pendiente' : 'Canjeado'}
            color={c.bono.estado === 'pendiente' ? '#eab308' : '#22c55e'}
          />
        </div>
      ) : (
        <span className="text-xs text-[#4A3D28]">Sin bono</span>
      ),
  },
]

export default function ClientesSection({ clientes }: Props) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return clientes

    return clientes.filter((cliente) =>
      `${cliente.nombres} ${cliente.apellidos} ${cliente.docNumero} ${cliente.email}`
        .toLowerCase()
        .includes(q),
    )
  }, [clientes, search])

  const { visibles, pagina, setPagina, totalPaginas, total, desde, hasta } = usePaginacion(
    filtered,
    'admin.clientes',
  )

  return (
    <div style={{ animation: 'slide-up 0.4s ease-out forwards' }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-black text-[#F5E6C8]" style={{ fontFamily: "'Inter', sans-serif" }}>
            Clientes registrados
          </h2>
          <p className="text-sm text-[#9A7B50] mt-1">{clientes.length} clientes en total</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B5D3F]" />
          <input
            type="text"
            placeholder="Buscar por nombre, documento o correo..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              // Buscar SI vuelve a la pagina 1: los resultados son otra lista y
              // seguir en la pagina 7 de la anterior no significa nada. Es la
              // unica vuelta a la primera pagina del sistema — recargar o
              // ejecutar una accion respetan donde estabas.
              setPagina(1)
            }}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-[#F5E6C8] bg-[#121009] border border-[#D4AF37]/20 outline-none placeholder:text-[#4A3D28] focus:border-[#D4AF37]/60"
          />
        </div>
      </div>

      <TablaResponsiva
        columnas={COLUMNAS}
        filas={visibles}
        claveDe={(c) => c.id}
        vacio="No se encontraron clientes con ese criterio."
      />

      <Paginacion
        pagina={pagina}
        totalPaginas={totalPaginas}
        total={total}
        desde={desde}
        hasta={hasta}
        onCambiar={setPagina}
        etiqueta="clientes"
      />
    </div>
  )
}
