import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import type { AdminCanjeRow } from '@/shared/api/types'
import Paginacion from '@/shared/components/Paginacion'
import TablaResponsiva, { type ColumnaTabla } from '@/shared/components/TablaResponsiva'
import { usePaginacion } from '@/shared/hooks/usePaginacion'
import AdminError from '../components/AdminError'
import AdminLoading from '../components/AdminLoading'
import { formatDateTime, formatDemora } from '../utils/adminFormatters'

interface Props {
  canjes: AdminCanjeRow[] | null
  error: string | null
}

// Los nombres de las sedes se parecen mucho entre si ("Gran Casino Cucuta Av. 5"
// y "Gran Casino Cucuta Ventura Plaza"), asi que cortarlos los volvia
// indistinguibles: los dos quedaban como "Gran Casino Cucuta...". En una
// auditoria de canjes, saber en que casino se entrego el bono ES el dato.
const COLUMNAS: ColumnaTabla<AdminCanjeRow>[] = [
  {
    etiqueta: 'Código',
    ancho: 'w-[12%]',
    principal: true,
    celda: (c) => <span className="text-[#D4AF37] font-mono font-semibold">{c.codigo}</span>,
  },
  {
    etiqueta: 'Cliente',
    ancho: 'w-[20%]',
    celda: (c) => (
      <>
        <span className="block text-[#F5E6C8]">{c.cliente.nombres} {c.cliente.apellidos}</span>
        <span className="block text-xs text-[#6B5D3F]">{c.cliente.docTipo}: {c.cliente.docNumero}</span>
      </>
    ),
  },
  {
    etiqueta: 'Premio',
    ancho: 'w-[16%]',
    celda: (c) => <span className="text-[#C4A97A]">{c.premio.nombre}</span>,
  },
  {
    etiqueta: 'Sede',
    ancho: 'w-[15%]',
    celda: (c) => <span className="text-[#C4A97A]">{c.sede || '—'}</span>,
  },
  {
    etiqueta: 'Cajero',
    ancho: 'w-[15%]',
    celda: (c) => <span className="text-[#9A7B50]">{c.canjeadoPor || '—'}</span>,
  },
  {
    etiqueta: 'Entregado',
    ancho: 'w-[14%]',
    celda: (c) => <span className="text-[#6B5D3F]">{c.canjeadoEn ? formatDateTime(c.canjeadoEn) : '—'}</span>,
  },
  {
    etiqueta: 'Demora',
    ancho: 'w-[8%]',
    celda: (c) => <span className="text-[#6B5D3F]">{formatDemora(c.horasHastaCanje)}</span>,
  },
]

export default function CanjesSection({ canjes, error }: Props) {
  const [search, setSearch] = useState('')

  // Devuelve null —y no []— mientras se carga: para la paginacion no es lo
  // mismo "no hay canjes" que "todavia no se sabe". Con [] daria por buena una
  // sola pagina y borraria la pagina guardada antes de que lleguen los datos.
  const filtered = useMemo(() => {
    if (!canjes) return null
    const q = search.trim().toLowerCase()
    if (!q) return canjes

    return canjes.filter((canje) =>
      `${canje.cliente.nombres} ${canje.cliente.apellidos} ${canje.cliente.docNumero} ${canje.codigo} ${canje.sede ?? ''} ${canje.canjeadoPor ?? ''}`
        .toLowerCase()
        .includes(q),
    )
  }, [canjes, search])

  const { visibles, pagina, setPagina, totalPaginas, total, desde, hasta } = usePaginacion(
    filtered,
    'admin.canjes',
  )

  return (
    <div style={{ animation: 'slide-up 0.4s ease-out forwards' }}>
      <div className="mb-6">
        <h2 className="text-2xl font-black text-[#F5E6C8]" style={{ fontFamily: "'Inter', sans-serif" }}>
          Auditoría de Canjes
        </h2>
        <p className="text-sm text-[#9A7B50] mt-1">
          {canjes ? `${canjes.length} bonos entregados en total` : 'Cargando...'}
        </p>
      </div>

      {error && <AdminError message={error} centered />}
      {!canjes && !error && <AdminLoading label="Cargando auditoría..." />}

      {canjes && (
        <>
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B5D3F]" />
            <input
              type="text"
              placeholder="Buscar por cliente, cédula, código, sede o cajero..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPagina(1)
              }}
              className="w-full pl-9 pr-4 py-3 rounded-xl text-sm text-[#F5E6C8] bg-[#121009] border border-[#D4AF37]/20 outline-none placeholder:text-[#4A3D28] focus:border-[#D4AF37]/60"
            />
          </div>

          <TablaResponsiva
            columnas={COLUMNAS}
            filas={visibles}
            claveDe={(c) => c.codigo}
            vacio={
              canjes.length === 0
                ? 'Todavía no se ha entregado ningún bono.'
                : 'No se encontraron canjes con ese criterio.'
            }
          />

          <Paginacion
            pagina={pagina}
            totalPaginas={totalPaginas}
            total={total}
            desde={desde}
            hasta={hasta}
            onCambiar={setPagina}
            etiqueta="canjes"
          />
        </>
      )}
    </div>
  )
}
