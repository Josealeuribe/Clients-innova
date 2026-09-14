// PALETA DE LAS GRÁFICAS DEL PANEL
//
// Los colores NO están escogidos a ojo. Se buscaron con el validador de la guía
// de visualización y este es su reporte, contra el fondo real de las tarjetas
// del panel (#121009), en modo oscuro y con todos los pares:
//
//   [PASS] Banda de luminosidad   los 3 dentro de L 0.48–0.67 (OKLCH)
//   [PASS] Piso de croma          los 3 >= 0.10
//   [PASS] Separación CVD         peor par #b46ced↔#18a5bd ΔE 8.0 (deuteranopía)
//   [PASS] Piso de visión normal  peor par #18a5bd↔#b1900f ΔE 21.4
//   [PASS] Contraste vs fondo     los 3 >= 3:1
//
// El ΔE de 8.0 queda justo en el objetivo, así que estas gráficas llevan
// SIEMPRE codificación secundaria y no dependen del color para identificar la
// sede: leyenda presente, etiqueta directa sobre cada marca, separación de 2px
// entre rellenos y vista de tabla. Eso es requisito, no adorno.
//
// SI SE ABRE UN CUARTO CASINO
//
// No se inventa un cuarto color: un matiz generado es indistinguible de uno
// existente bajo daltonismo. Hay que agregar el matiz candidato, volver a correr
// el validador y confirmar que el peor par adyacente sigue sobre ΔE 8. Mientras
// eso no se haga, una sede desconocida se pinta con COLOR_OTROS y se identifica
// por su etiqueta, que es honesto: no finge una identidad que no se validó.

/** Fondo de las tarjetas de gráfica. El validador midió el contraste contra este. */
export const SUPERFICIE = '#121009'

/**
 * Identidad de cada casino. El color sigue a la SEDE, nunca a su posición en el
 * ranking: si un filtro cambia el orden, Ventura Plaza sigue siendo oro. Por eso
 * el mapa es por nombre y no por índice del arreglo de datos.
 */
export const COLOR_POR_SEDE: Record<string, string> = {
  'Gran Casino Cúcuta Ventura Plaza': '#b1900f',
  'Gran Casino Cúcuta Av. 5': '#18a5bd',
  'Gran Casino Cúcuta Av. 0': '#b46ced',
}

/** Sede fuera del catálogo validado, o los baldes de "sin sede registrada". */
export const COLOR_OTROS = '#6B5D3F'

export function colorDeSede(sede: string): string {
  return COLOR_POR_SEDE[sede] ?? COLOR_OTROS
}

/**
 * Orden fijo en el que se listan los casinos. Es el orden comercial sembrado en
 * server/prisma/seed.ts, no el que resulte de ordenar por cantidad: así la
 * tercera barra de una gráfica es la misma sede que la tercera fila de la tabla
 * de al lado, y comparar dos gráficas no obliga a volver a leer las etiquetas.
 */
export const ORDEN_SEDES = [
  'Gran Casino Cúcuta Ventura Plaza',
  'Gran Casino Cúcuta Av. 5',
  'Gran Casino Cúcuta Av. 0',
]

export function ordenarSedes<T extends { sede: string }>(filas: T[]): T[] {
  const posicion = (sede: string) => {
    const i = ORDEN_SEDES.indexOf(sede)
    // Lo que no está en el catálogo va al final, alfabético entre sí, en vez de
    // intercalarse en un lugar que cambiaría con los datos.
    return i === -1 ? ORDEN_SEDES.length : i
  }
  return [...filas].sort((a, b) => posicion(a.sede) - posicion(b.sede) || a.sede.localeCompare(b.sede, 'es'))
}

// --- Tokens de texto y cromo ---
//
// El texto NUNCA lleva el color de la serie: un matiz de identidad es ilegible
// como letra sobre el fondo. La identidad la carga la marca de color que va AL
// LADO del texto (un punto, un trozo de barra), no el texto mismo.
export const TINTA = {
  primaria: '#F5E6C8',
  secundaria: '#C4A97A',
  apagada: '#9A7B50',
  tenue: '#6B5D3F',
  minima: '#4A3D28',
}

/** Rejilla y ejes: un paso por encima del fondo, línea de 1px SÓLIDA. */
export const REJILLA = 'rgba(212,175,55,0.13)'

/** Hueco en color de superficie que separa rellenos que se tocan. */
export const HUECO_SUPERFICIE = 2

/** Grosor máximo de una barra. La sobra de la banda se deja como aire. */
export const GROSOR_BARRA = 22
