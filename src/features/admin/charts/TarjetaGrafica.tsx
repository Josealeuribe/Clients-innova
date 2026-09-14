import { useState, type ReactNode } from 'react'
import { Table2, ChartNoAxesColumn } from 'lucide-react'
import { TINTA } from './paleta'

interface Props {
  titulo: string
  descripcion?: string
  /** Esquina superior derecha: una cifra de contexto, un chip, nada. */
  extra?: ReactNode
  children: ReactNode
  /**
   * La misma información en tabla. NO es opcional por diseño: es la vía de
   * lectura para quien no puede distinguir los matices, para quien navega con
   * lector de pantalla y para quien necesita copiar los números. Sin ella la
   * gráfica sería la única fuente y el color, el único canal.
   */
  tabla: ReactNode
}

export default function TarjetaGrafica({ titulo, descripcion, extra, children, tabla }: Props) {
  const [verTabla, setVerTabla] = useState(false)

  return (
    <div className="rounded-2xl border border-[#D4AF37]/12 p-5" style={{ background: '#121009' }}>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h3 className="font-bold" style={{ fontFamily: "'Inter', sans-serif", color: TINTA.primaria }}>
            {titulo}
          </h3>
          {descripcion && <p className="text-xs mt-1" style={{ color: TINTA.tenue }}>{descripcion}</p>}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {extra}
          <button
            type="button"
            onClick={() => setVerTabla((v) => !v)}
            aria-pressed={verTabla}
            title={verTabla ? 'Ver la gráfica' : 'Ver los mismos datos en tabla'}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4AF37]/25 px-2.5 py-1.5 text-[11px] text-[#9A7B50] hover:text-[#D4AF37] hover:border-[#D4AF37]/50 transition-all"
          >
            {verTabla ? <ChartNoAxesColumn size={13} /> : <Table2 size={13} />}
            <span>{verTabla ? 'Gráfica' : 'Tabla'}</span>
          </button>
        </div>
      </div>

      {/* `data-grafica` es el ancla del tooltip: se posiciona relativo a esta
          caja y no al viewport, para que siga pegado a su barra al scrollear. */}
      <div className="relative" data-grafica>
        {verTabla ? tabla : children}
      </div>
    </div>
  )
}

/** Tabla gemela de una gráfica. Mismo dato, sin depender del color. */
export function TablaGrafica({ encabezados, filas }: { encabezados: string[]; filas: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr>
            {encabezados.map((titulo, i) => (
              <th
                key={titulo}
                scope="col"
                className={`py-2 px-2 font-semibold border-b ${i === 0 ? 'text-left' : 'text-right'}`}
                style={{ color: TINTA.apagada, borderColor: 'rgba(212,175,55,0.15)' }}
              >
                {titulo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((fila, indice) => (
            <tr key={indice}>
              {fila.map((celda, i) => (
                <td
                  key={i}
                  className={`py-2 px-2 border-b ${i === 0 ? 'text-left' : 'text-right tabular-nums'}`}
                  style={{
                    color: i === 0 ? TINTA.secundaria : TINTA.primaria,
                    borderColor: 'rgba(212,175,55,0.07)',
                  }}
                >
                  {celda}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
