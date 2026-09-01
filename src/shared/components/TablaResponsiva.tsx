import type { ReactNode } from 'react'

export interface ColumnaTabla<T> {
  etiqueta: string
  celda: (fila: T) => ReactNode
  /** Ancho de la columna en la tabla de escritorio, p. ej. 'w-[18%]'. */
  ancho?: string
  /**
   * En el formato de celular esta columna hace de titulo de la ficha, sin
   * etiqueta delante. Reservado para lo que identifica la fila (el nombre del
   * cliente, el codigo del bono).
   */
  principal?: boolean
}

interface Props<T> {
  columnas: ColumnaTabla<T>[]
  filas: T[]
  claveDe: (fila: T) => string | number
  /** Que mostrar cuando no hay filas. */
  vacio: ReactNode
}

// Un mismo listado, dos formatos, UNA sola definicion de columnas.
//
// POR QUE EXISTE ESTE COMPONENTE
//
// Antes cada tabla resolvia el problema del ancho escondiendo cosas: `truncate`
// cortaba el texto con puntos suspensivos y `hidden lg:table-cell` retiraba
// columnas enteras en pantallas pequenas. Se veia ordenado y mentia: "Gran
// Casino Cucuta Ventura Plaza" y "Gran Casino Cucuta Av. 5" quedaban los dos
// como "Gran Casino Cucuta...", indistinguibles. En una auditoria de canjes eso
// no es un detalle estetico.
//
// Aqui no se oculta nada:
//
//   - En escritorio, tabla de verdad y el texto ENVUELVE en varias lineas en vez
//     de cortarse. Las filas quedan mas altas; a cambio se lee todo. Sigue sin
//     barra horizontal porque `table-fixed` mas anchos en porcentaje hacen que
//     la tabla mida siempre lo que su contenedor.
//
//   - En celular, cada fila pasa a ser una ficha con TODOS sus campos, cada uno
//     con su etiqueta. Una tabla de siete columnas es ilegible en 360 px por
//     mucho que quepa; en vertical, con el nombre del campo al lado del dato,
//     no se pierde nada.
//
// Definir las columnas una vez y pintarlas de dos maneras es lo que evita que
// los dos formatos se desincronicen: agregar una columna la agrega en ambos.
export default function TablaResponsiva<T>({ columnas, filas, claveDe, vacio }: Props<T>) {
  if (filas.length === 0) {
    return (
      <div
        className="rounded-2xl border border-[#D4AF37]/12 px-4 py-10 text-center text-[#6B5D3F] text-sm"
        style={{ background: '#121009' }}
      >
        {vacio}
      </div>
    )
  }

  return (
    <>
      {/* Escritorio */}
      <div className="hidden md:block rounded-2xl border border-[#D4AF37]/12" style={{ background: '#121009' }}>
        <table className="w-full text-sm table-fixed">
          <thead>
            <tr className="text-left text-xs text-[#6B5D3F] border-b border-[#D4AF37]/12">
              {columnas.map((columna) => (
                <th key={columna.etiqueta} className={`px-4 py-3 font-medium align-bottom ${columna.ancho ?? ''}`}>
                  {columna.etiqueta}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filas.map((fila) => (
              <tr key={claveDe(fila)} className="border-b border-[#D4AF37]/8 last:border-0 align-top">
                {columnas.map((columna) => (
                  // `break-words` es lo que permite que un correo largo baje de
                  // linea en vez de estirar la columna y devolver el desborde.
                  <td key={columna.etiqueta} className="px-4 py-3 break-words whitespace-normal">
                    {columna.celda(fila)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Celular */}
      <div className="md:hidden flex flex-col gap-3">
        {filas.map((fila) => (
          <article
            key={claveDe(fila)}
            className="rounded-2xl border border-[#D4AF37]/12 p-4"
            style={{ background: '#121009' }}
          >
            {columnas
              .filter((columna) => columna.principal)
              .map((columna) => (
                <div key={columna.etiqueta} className="mb-3 pb-3 border-b border-[#D4AF37]/10 break-words">
                  {columna.celda(fila)}
                </div>
              ))}

            <dl className="flex flex-col gap-2 text-sm">
              {columnas
                .filter((columna) => !columna.principal)
                .map((columna) => (
                  <div key={columna.etiqueta} className="flex gap-3 justify-between items-start">
                    <dt className="text-xs text-[#6B5D3F] flex-shrink-0 pt-0.5">{columna.etiqueta}</dt>
                    <dd className="text-right break-words min-w-0">{columna.celda(fila)}</dd>
                  </div>
                ))}
            </dl>
          </article>
        ))}
      </div>
    </>
  )
}
