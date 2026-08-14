import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import type { AdminClienteRow } from '@/shared/api/types'
import Paginacion from '@/shared/components/Paginacion'
import { usePaginacion } from '@/shared/hooks/usePaginacion'
import StatusBadge from '../components/StatusBadge'
import { formatDate } from '../utils/adminFormatters'

interface Props {
  clientes: AdminClienteRow[]
}

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
              // Buscar SÍ vuelve a la página 1: los resultados son otra lista y
              // seguir en la página 7 de la anterior no significa nada. Es la
              // única vuelta a la primera página del sistema — recargar o
              // ejecutar una acción respetan dónde estabas.
              setPagina(1)
            }}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-[#F5E6C8] bg-[#121009] border border-[#D4AF37]/20 outline-none placeholder:text-[#4A3D28] focus:border-[#D4AF37]/60"
          />
        </div>
      </div>

      {/*
        SIN `overflow-x-auto` NI `min-w-[900px]`

        Ese ancho mínimo obligaba a la tabla a medir 900 px aunque no los
        hubiera, y de ahí salía la barra de desplazamiento horizontal. Con
        `table-fixed` mandan los anchos en porcentaje de las cabeceras, así que
        la tabla mide siempre exactamente lo que su contenedor: no puede
        desbordar.

        Lo que antes se resolvía arrastrando, ahora se resuelve escondiendo
        columnas por prioridad al angostarse la pantalla (`hidden lg:table-cell`).
        Nombre, documento y bono no se ocultan nunca: son la razón de entrar
        aquí.
      */}
      <div className="rounded-2xl border border-[#D4AF37]/12" style={{ background: '#121009' }}>
        <table className="w-full text-sm table-fixed">
          <thead>
            <tr className="text-left text-xs text-[#6B5D3F] border-b border-[#D4AF37]/12">
              {/* Los porcentajes suman 100 en cada punto de corte. La fecha de
                  registro pide más de lo que parece: el formato largo de es-CO
                  produce "06 de ago. de 2026" y con un 10% se cortaba a mitad. */}
              <th className="px-4 py-3 font-medium w-[26%] sm:w-[22%] xl:w-[20%]">Cliente</th>
              <th className="px-4 py-3 font-medium w-[24%] sm:w-[16%] xl:w-[15%]">Documento</th>
              <th className="px-4 py-3 font-medium hidden md:table-cell md:w-[22%] xl:w-[21%]">Contacto</th>
              <th className="px-4 py-3 font-medium hidden lg:table-cell lg:w-[16%] xl:w-[15%]">Ubicación</th>
              <th className="px-4 py-3 font-medium hidden xl:table-cell xl:w-[15%]">Registro</th>
              <th className="px-4 py-3 font-medium w-[50%] sm:w-[24%] md:w-[18%] lg:w-[14%]">Bono</th>
            </tr>
          </thead>
          <tbody>
            {visibles.map((cliente) => (
              <tr key={cliente.id} className="border-b border-[#D4AF37]/8 last:border-0 align-top">
                {/* `truncate` con el título completo encima: el dato entero
                    sigue disponible al pasar el cursor, sin estirar la columna. */}
                <td
                  className="px-4 py-3 text-[#F5E6C8] font-medium truncate"
                  title={`${cliente.nombres} ${cliente.apellidos}`}
                >
                  {cliente.nombres} {cliente.apellidos}
                </td>
                <td className="px-4 py-3 text-[#C4A97A]">
                  <span className="block truncate" title={cliente.docTipo}>{cliente.docTipo}</span>
                  <span className="block truncate text-xs text-[#6B5D3F]">{cliente.docNumero}</span>
                </td>
                <td className="px-4 py-3 text-[#C4A97A] hidden md:table-cell">
                  <span className="block truncate" title={cliente.email}>{cliente.email}</span>
                  <span className="block truncate text-xs text-[#6B5D3F]">{cliente.telefono}</span>
                </td>
                <td className="px-4 py-3 text-[#9A7B50] hidden lg:table-cell">
                  <span className="block truncate" title={`${cliente.ciudad}, ${cliente.departamento}`}>
                    {cliente.ciudad}, {cliente.departamento}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#6B5D3F] hidden xl:table-cell truncate">
                  {formatDate(cliente.createdAt)}
                </td>
                <td className="px-4 py-3">
                  {cliente.bono ? (
                    <div className="flex flex-col gap-1 min-w-0">
                      <span className="text-[#D4AF37] text-xs font-semibold truncate" title={cliente.bono.premio.nombre}>
                        {cliente.bono.premio.nombre}
                      </span>
                      <StatusBadge
                        label={cliente.bono.estado === 'pendiente' ? 'Pendiente' : 'Canjeado'}
                        color={cliente.bono.estado === 'pendiente' ? '#eab308' : '#22c55e'}
                      />
                    </div>
                  ) : (
                    <span className="text-xs text-[#4A3D28]">Sin bono</span>
                  )}
                </td>
              </tr>
            ))}
            {visibles.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-[#6B5D3F] text-sm">
                  No se encontraron clientes con ese criterio.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
