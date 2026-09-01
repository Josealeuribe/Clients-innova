import { useMemo } from 'react'
import type { CanjeHistorialRow } from '@/shared/api/types'
import Paginacion from '@/shared/components/Paginacion'
import TablaResponsiva, { type ColumnaTabla } from '@/shared/components/TablaResponsiva'
import { usePaginacion } from '@/shared/hooks/usePaginacion'
import CajeroError from '../components/CajeroError'
import CajeroLoading from '../components/CajeroLoading'
import { formatDateTime } from '../utils/cajeroFormatters'


interface Props {
  historial: CanjeHistorialRow[] | null
  error: string | null
  soloPropios: boolean
}

export default function HistorialSection({ historial, error, soloPropios }: Props) {
  // "Canjeado por" solo aparece cuando se ven los canjes de todos: en el
  // historial propio de una cajera siempre seria ella misma.
  const columnas = useMemo<ColumnaTabla<CanjeHistorialRow>[]>(() => {
    const base: ColumnaTabla<CanjeHistorialRow>[] = [
      {
        etiqueta: 'Código',
        ancho: 'w-[16%]',
        principal: true,
        celda: (i) => <span className="text-[#D4AF37] font-mono font-semibold">{i.codigo}</span>,
      },
      {
        etiqueta: 'Premio',
        ancho: 'w-[22%]',
        celda: (i) => <span className="text-[#C4A97A]">{i.premio.nombre}</span>,
      },
      {
        etiqueta: 'Cliente',
        ancho: 'w-[24%]',
        celda: (i) => (
          <>
            <span className="block text-[#F5E6C8]">{i.cliente.nombres} {i.cliente.apellidos}</span>
            <span className="block text-xs text-[#6B5D3F]">{i.cliente.docNumero}</span>
          </>
        ),
      },
      {
        etiqueta: 'Sede',
        ancho: soloPropios ? 'w-[20%]' : 'w-[16%]',
        celda: (i) => <span className="text-[#C4A97A]">{i.sede || '—'}</span>,
      },
    ]

    if (!soloPropios) {
      base.push({
        etiqueta: 'Canjeado por',
        ancho: 'w-[12%]',
        celda: (i) => <span className="text-[#9A7B50]">{i.canjeadoPor || '—'}</span>,
      })
    }

    base.push({
      etiqueta: 'Fecha',
      ancho: soloPropios ? 'w-[18%]' : 'w-[10%]',
      celda: (i) => <span className="text-[#6B5D3F]">{i.canjeadoEn ? formatDateTime(i.canjeadoEn) : '—'}</span>,
    })

    return base
  }, [soloPropios])

  // Clave distinta segun el alcance: el historial propio de una cajera y el
  // listado completo que ve el admin son dos listas de largo distinto, y
  // compartir la pagina entre ambas dejaria a una de las dos fuera de rango.
  const { visibles, pagina, setPagina, totalPaginas, total, desde, hasta } = usePaginacion(
    historial,
    soloPropios ? 'cajero.historial.propios' : 'cajero.historial.todos',
  )

  return (
    <div style={{ animation: 'slide-up 0.4s ease-out forwards' }}>
      <div className="mb-6">
        <h2 className="text-2xl font-black text-[#F5E6C8]" style={{ fontFamily: "'Inter', sans-serif" }}>
          {soloPropios ? 'Mis canjes' : 'Todos los canjes'}
        </h2>
        <p className="text-sm text-[#9A7B50] mt-1">
          {historial
            ? soloPropios
              ? `${historial.length} ${historial.length === 1 ? 'bono entregado' : 'bonos entregados'} por ti`
              : `${historial.length} bonos entregados en total`
            : 'Cargando...'}
        </p>
      </div>

      {error && <CajeroError message={error} centered />}
      {!historial && !error && <CajeroLoading label="Cargando historial..." />}

      {historial && (
        <>
          <TablaResponsiva
            columnas={columnas}
            filas={visibles}
            claveDe={(i) => i.codigo}
            vacio={soloPropios ? 'Todavía no has entregado ningún bono.' : 'Aún no se ha canjeado ningún bono.'}
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
