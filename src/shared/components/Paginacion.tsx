import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  pagina: number
  totalPaginas: number
  total: number
  desde: number
  hasta: number
  onCambiar: (pagina: number) => void
  /** Qué se está contando: "clientes", "canjes", "cuentas"... */
  etiqueta?: string
}

// Ventana de números alrededor de la página actual.
//
// Con 137 clientes hay 7 páginas y caben todas; con 3.000 hay 150 y pintarlas
// todas rompería el ancho — que es justo lo que este rediseño vino a quitar. Se
// muestran como máximo cinco, siempre con la primera y la última a mano para
// poder saltar a los extremos sin ir de una en una.
function ventana(pagina: number, totalPaginas: number): number[] {
  const MAXIMO = 5
  if (totalPaginas <= MAXIMO) {
    return Array.from({ length: totalPaginas }, (_, i) => i + 1)
  }

  let inicio = Math.max(1, pagina - 2)
  const fin = Math.min(totalPaginas, inicio + MAXIMO - 1)
  // Cerca del final la ventana se corre hacia atrás para no quedar coja.
  inicio = Math.max(1, fin - MAXIMO + 1)

  return Array.from({ length: fin - inicio + 1 }, (_, i) => inicio + i)
}

// Controles de paginación.
//
// Son botones, NUNCA enlaces: cambiar de página es estado de React y no debe
// recargar nada ni sacar a nadie de la sección en la que está. La página elegida
// se recuerda entre recargas — ver usePaginacion.
export default function Paginacion({
  pagina,
  totalPaginas,
  total,
  desde,
  hasta,
  onCambiar,
  etiqueta = 'registros',
}: Props) {
  // Con una sola página no hay nada que decidir: los controles solo estorbarían.
  if (totalPaginas <= 1) return null

  const paginas = ventana(pagina, totalPaginas)
  const claseFlecha =
    'inline-flex items-center justify-center h-9 w-9 rounded-xl border border-[#D4AF37]/20 text-[#9A7B50] transition-all hover:text-[#D4AF37] hover:border-[#D4AF37]/45 disabled:opacity-35 disabled:pointer-events-none'

  return (
    <nav
      className="flex flex-wrap items-center justify-between gap-3 mt-4"
      aria-label={`Paginación de ${etiqueta}`}
    >
      <p className="text-xs text-[#6B5D3F]">
        <span className="text-[#C4A97A] font-semibold">
          {desde}–{hasta}
        </span>{' '}
        de {total} {etiqueta}
      </p>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onCambiar(pagina - 1)}
          disabled={pagina <= 1}
          aria-label="Página anterior"
          className={claseFlecha}
        >
          <ChevronLeft size={16} />
        </button>

        {/* El salto a la primera página solo aparece cuando la ventana ya se
            alejó de ella; si no, sería un número repetido. */}
        {paginas[0]! > 1 && (
          <>
            <BotonPagina numero={1} activa={false} onCambiar={onCambiar} />
            {paginas[0]! > 2 && <span className="px-1 text-xs text-[#4A3D28]">…</span>}
          </>
        )}

        {paginas.map((numero) => (
          <BotonPagina key={numero} numero={numero} activa={numero === pagina} onCambiar={onCambiar} />
        ))}

        {paginas[paginas.length - 1]! < totalPaginas && (
          <>
            {paginas[paginas.length - 1]! < totalPaginas - 1 && (
              <span className="px-1 text-xs text-[#4A3D28]">…</span>
            )}
            <BotonPagina numero={totalPaginas} activa={false} onCambiar={onCambiar} />
          </>
        )}

        <button
          type="button"
          onClick={() => onCambiar(pagina + 1)}
          disabled={pagina >= totalPaginas}
          aria-label="Página siguiente"
          className={claseFlecha}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </nav>
  )
}

function BotonPagina({
  numero,
  activa,
  onCambiar,
}: {
  numero: number
  activa: boolean
  onCambiar: (pagina: number) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onCambiar(numero)}
      aria-current={activa ? 'page' : undefined}
      className={`h-9 min-w-9 px-2.5 rounded-xl text-xs font-bold transition-all ${
        activa
          ? 'text-[#0a0805]'
          : 'text-[#9A7B50] border border-[#D4AF37]/20 hover:text-[#D4AF37] hover:border-[#D4AF37]/45'
      }`}
      style={activa ? { background: 'linear-gradient(135deg, #D4AF37, #A0832A)' } : {}}
    >
      {numero}
    </button>
  )
}
