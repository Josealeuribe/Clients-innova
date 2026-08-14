import { useEffect, useMemo } from 'react'
import { useEstadoPersistido } from './useEstadoPersistido'

// Cuántos registros se muestran de una vez en cualquier listado del sistema.
//
// El límite no es cosmético: el panel de clientes pinta una fila por cada
// cliente registrado, y con la promoción en marcha esa lista solo crece. Sin
// tope, un equipo de caja modesto termina renderizando miles de nodos por cada
// refresco de la vista.
export const POR_PAGINA = 20

/**
 * Paginación de listados, con la página recordada entre recargas.
 *
 * `clave` identifica el listado (p. ej. 'admin.clientes'). Debe ser única por
 * listado: es lo que permite estar en la página 7 de clientes y en la 2 de
 * canjes al mismo tiempo sin que se pisen.
 *
 * SOBRE VOLVER A LA PÁGINA 1
 *
 * Recargar o ejecutar una acción NO devuelve a la primera página: quien está
 * revisando la página 10 de la auditoría espera seguir ahí. La única corrección
 * automática es cuando la página deja de existir porque la lista se encogió
 * (un filtro, un registro borrado); ahí se salta a la última página real, que
 * es lo más cercano a donde se estaba. Filtrar sí debe llevar a la página 1,
 * pero eso lo decide cada vista llamando a `setPagina(1)` en su buscador: el
 * hook no puede saber qué cambio de datos fue una búsqueda y cuál un refresco.
 */
export function usePaginacion<T>(items: T[] | null, clave: string) {
  const [pagina, setPagina] = useEstadoPersistido(`gcc_pag:${clave}`, 1)

  const total = items?.length ?? 0
  const totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA))

  // La página guardada puede quedar fuera de rango: se estaba en la 10, se
  // filtró y ahora solo hay 3. Se corrige después de pintar, no durante, para
  // no cambiar estado en mitad del render.
  //
  // EL `items === null` NO ES DEFENSIVO, ES EL CASO QUE ROMPÍA TODO
  //
  // Mientras el listado se está pidiendo al servidor llega como `null`, y
  // entonces "hay 1 página" no significa que haya una sola: significa que
  // todavía no se sabe. Sin esta guarda, recargar estando en la página 10
  // ajustaba a 1 —y lo GUARDABA— en el primer fotograma, antes de que llegaran
  // los datos: al terminar de cargar aparecías en la página 1 con la 10 ya
  // olvidada, que es justo lo contrario de lo que se pide. Se espera a saber
  // cuántas hay.
  useEffect(() => {
    if (items === null) return
    if (pagina > totalPaginas) setPagina(totalPaginas)
    else if (pagina < 1) setPagina(1)
  }, [items, pagina, totalPaginas, setPagina])

  // Se recorta con la página ya acotada para que el fotograma anterior al
  // ajuste del efecto no muestre un listado vacío.
  const paginaSegura = Math.min(Math.max(pagina, 1), totalPaginas)
  const desde = (paginaSegura - 1) * POR_PAGINA

  const visibles = useMemo(
    () => (items ? items.slice(desde, desde + POR_PAGINA) : []),
    [items, desde],
  )

  return {
    /** Los ≤20 elementos que toca pintar. */
    visibles,
    pagina: paginaSegura,
    setPagina,
    totalPaginas,
    total,
    /** Posición del primer elemento visible, en base 1 (para "21–40 de 137"). */
    desde: total === 0 ? 0 : desde + 1,
    hasta: Math.min(desde + POR_PAGINA, total),
  }
}
