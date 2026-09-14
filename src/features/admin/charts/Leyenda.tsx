import { TINTA } from './paleta'

// LEYENDA
//
// Está SIEMPRE que haya dos o más series. No es opcional: es el canal de
// identidad que no depende de que el lector distinga dos matices. Una sola serie
// no lleva leyenda — el título ya dice qué se está mirando, y una caja con un
// solo cuadrito repite el título y gasta espacio.
//
// La marca de color va al lado del texto; el texto usa tinta, nunca el color de
// la serie: un matiz calibrado para una barra es ilegible como letra.

export interface EntradaLeyenda {
  etiqueta: string
  color: string
  /** Relleno lavado (un bono pendiente) en vez de sólido (uno entregado). */
  lavado?: boolean
}

export default function Leyenda({ entradas }: { entradas: EntradaLeyenda[] }) {
  if (entradas.length < 2) return null

  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
      {entradas.map((entrada) => (
        <li key={entrada.etiqueta} className="flex items-center gap-2 text-xs">
          <span
            className="h-2.5 w-2.5 rounded-sm flex-shrink-0"
            style={
              entrada.lavado
                ? { background: entrada.color, opacity: 0.28, outline: `1px solid ${entrada.color}`, outlineOffset: -1 }
                : { background: entrada.color }
            }
          />
          <span style={{ color: TINTA.apagada }}>{entrada.etiqueta}</span>
        </li>
      ))}
    </ul>
  )
}
